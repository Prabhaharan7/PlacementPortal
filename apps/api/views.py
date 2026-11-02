"""
Central API views for the entire PlacePortal.
Organized by feature area.
"""
import json
import requests
from datetime import timezone as dt_tz

from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

# ─────────────────────────────────────────────────────────────────────────────
# Auth helpers (reused from auth_views)
# ─────────────────────────────────────────────────────────────────────────────

def _get_user_from_request(request):
    """Return (user, error_response) from Authorization header."""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Token '):
        return None, JsonResponse({'error': 'Authentication required.'}, status=401)
    try:
        from django.core.signing import Signer
        signer = Signer()
        unsigned = signer.unsign(auth[6:])
        user_pk, _ = unsigned.split(':', 1)
        user = User.objects.get(pk=int(user_pk))
        if not user.is_active:
            return None, JsonResponse({'error': 'Account disabled.'}, status=403)
        return user, None
    except Exception:
        return None, JsonResponse({'error': 'Invalid or expired token.'}, status=401)


def _is_admin(user):
    return user.is_staff or getattr(user, 'role', '') == 'admin'


# ─────────────────────────────────────────────────────────────────────────────
# STUDENT DASHBOARD
# ─────────────────────────────────────────────────────────────────────────────

@require_GET
def student_dashboard_view(request):
    user, err = _get_user_from_request(request)
    if err: return err

    from apps.assessments.models import TestAttempt
    from apps.placements.models import CompanyApplication
    from apps.interviews.models import InterviewBooking

    # 1. Gather stats
    total_tests = TestAttempt.objects.filter(student=user, status='submitted').count()
    total_applications = CompanyApplication.objects.filter(student=user).count()
    shortlisted = CompanyApplication.objects.filter(student=user, status='shortlisted').count()
    interviews_booked = InterviewBooking.objects.filter(student=user).count()

    stats = {
        'tests_taken': total_tests,
        'applications': total_applications,
        'shortlisted': shortlisted,
        'interviews': interviews_booked,
    }

    # 2. Gather recent activity
    activities = []
    
    # Recent test attempts
    attempts = TestAttempt.objects.filter(student=user, status='submitted').order_by('-submitted_at')[:5]
    for a in attempts:
        activities.append({
            'type': 'test',
            'title': f'Completed Test: {a.test.title}',
            'timestamp': a.submitted_at,
            'status': 'success' if a.score and (a.score / max(a.total_marks, 1)) > 0.6 else 'info'
        })

    # Recent company applications
    apps = CompanyApplication.objects.filter(student=user).select_related('company').order_by('-applied_at')[:5]
    for app in apps:
        status_color = 'success' if app.status == 'shortlisted' else 'danger' if app.status == 'rejected' else 'info'
        activities.append({
            'type': 'application',
            'title': f'Applied to {app.company.name}',
            'timestamp': app.applied_at,
            'status': status_color,
            'target_status': app.status
        })

    # Recent interview bookings
    bookings = InterviewBooking.objects.filter(student=user).select_related('slot').order_by('-booked_at')[:5]
    for b in bookings:
        activities.append({
            'type': 'interview',
            'title': f'Interview with {b.slot.interviewer or "Interviewer"} booked',
            'timestamp': b.booked_at,
            'status': 'info'
        })

    # Sort activities by timestamp descending
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    # Format timestamps for frontend and limit to top 10
    formatted_activities = []
    for idx, act in enumerate(activities[:10]):
        formatted_activities.append({
            'id': idx + 1,
            'type': act['type'],
            'title': act['title'],
            'time': act['timestamp'].isoformat(),
            'status': act['status']
        })

    return JsonResponse({
        'stats': stats,
        'recent_activity': formatted_activities
    })


# ─────────────────────────────────────────────────────────────────────────────
# APTITUDE / TESTS
# ─────────────────────────────────────────────────────────────────────────────

@require_GET
def test_list(request):
    user, err = _get_user_from_request(request)
    if err: return err
    from apps.assessments.models import Test, TestAttempt
    tests = Test.objects.filter(is_active=True).prefetch_related('questions')
    data = []
    for t in tests:
        latest = TestAttempt.objects.filter(student=user, test=t).first()
        data.append({
            'id': t.pk,
            'title': t.title,
            'description': t.description,
            'topic': t.topic,
            'difficulty': t.difficulty,
            'question_count': t.question_count,
            'time_limit': t.time_limit,
            'last_score': latest.percentage if latest and latest.score is not None else None,
            'attempts': TestAttempt.objects.filter(student=user, test=t).count(),
        })
    return JsonResponse({'tests': data})


@csrf_exempt
@require_POST
def test_start(request, test_id):
    user, err = _get_user_from_request(request)
    if err: return err
    from apps.assessments.models import Test, TestAttempt
    try:
        test = Test.objects.get(pk=test_id, is_active=True)
    except Test.DoesNotExist:
        return JsonResponse({'error': 'Test not found.'}, status=404)

    attempt = TestAttempt.objects.create(
        student=user, test=test,
        total_marks=test.question_count,
        status='in_progress'
    )
    questions = list(test.questions.all())
    q_data = [{
        'id': q.pk,
        'text': q.text,
        'option_a': q.option_a,
        'option_b': q.option_b,
        'option_c': q.option_c,
        'option_d': q.option_d,
        'topic': q.topic,
        'difficulty': q.difficulty,
    } for q in questions]
    return JsonResponse({'attempt_id': attempt.pk, 'questions': q_data, 'time_limit': test.time_limit})


@csrf_exempt
@require_POST
def test_submit(request, attempt_id):
    user, err = _get_user_from_request(request)
    if err: return err
    from apps.assessments.models import TestAttempt, TestAnswer
    try:
        attempt = TestAttempt.objects.get(pk=attempt_id, student=user, status='in_progress')
    except TestAttempt.DoesNotExist:
        return JsonResponse({'error': 'Attempt not found or already submitted.'}, status=404)
    try:
        data = json.loads(request.body)
        answers = data.get('answers', {})  # {question_id: selected_option}
    except Exception:
        return JsonResponse({'error': 'Invalid JSON.'}, status=400)

    score = 0
    results = []
    for q in attempt.test.questions.all():
        selected = answers.get(str(q.pk), '')
        is_correct = selected.upper() == q.correct
        if is_correct:
            score += 1
        TestAnswer.objects.update_or_create(
            attempt=attempt, question=q,
            defaults={'selected': selected.upper() if selected else '', 'is_correct': is_correct}
        )
        results.append({
            'question_id': q.pk,
            'selected': selected.upper() if selected else '',
            'correct': q.correct,
            'is_correct': is_correct,
            'explanation': q.explanation,
        })

    attempt.score = score
    attempt.submitted_at = timezone.now()
    attempt.status = 'submitted'
    attempt.save()

    # Update StudentTopicProgress
    from apps.progress.models import StudentTopicProgress
    prog, _ = StudentTopicProgress.objects.get_or_create(user=user, topic='aptitude', defaults={'total_items': 20})
    prog.completed_items = min(prog.completed_items + 1, prog.total_items)
    all_attempts = list(TestAttempt.objects.filter(student=user, status='submitted').values_list('score', 'total_marks'))
    if all_attempts:
        pcts = [(s / t * 100) if t else 0 for s, t in all_attempts]
        prog.avg_score = round(sum(pcts) / len(pcts), 1)
        prog.best_score = round(max(pcts), 1)
    prog.last_activity = timezone.now()
    prog.save()

    return JsonResponse({
        'score': score,
        'total': attempt.total_marks,
        'percentage': attempt.percentage,
        'results': results,
    })


@require_GET
def aptitude_analytics(request):
    user, err = _get_user_from_request(request)
    if err: return err
    from apps.assessments.models import TestAttempt
    attempts = TestAttempt.objects.filter(student=user, status='submitted').select_related('test').order_by('started_at')
    history = [{
        'date': a.started_at.strftime('%d %b'),
        'score': a.percentage,
        'test': a.test.title,
        'topic': a.test.topic,
    } for a in attempts]
    # Per-topic breakdown
    from collections import defaultdict
    topic_scores = defaultdict(list)
    for a in attempts:
        topic_scores[a.test.topic].append(a.percentage)
    topic_breakdown = [{'topic': k, 'avg': round(sum(v)/len(v), 1), 'attempts': len(v)} for k, v in topic_scores.items()]
    return JsonResponse({
        'history': history,
        'topic_breakdown': topic_breakdown,
        'total_attempts': len(history),
        'avg_score': round(sum(h['score'] for h in history) / len(history), 1) if history else 0,
        'best_score': max((h['score'] for h in history), default=0),
    })


# ─────────────────────────────────────────────────────────────────────────────
# CODING — Piston API proxy
# ─────────────────────────────────────────────────────────────────────────────

PISTON_URL = 'https://emkc.org/api/v2/piston/execute'

PISTON_LANG_MAP = {
    'python': {'language': 'python', 'version': '3.10.0'},
    'java':   {'language': 'java',   'version': '15.0.2'},
    'c':      {'language': 'c',      'version': '10.2.0'},
    'cpp':    {'language': 'c++',    'version': '10.2.0'},
    'javascript': {'language': 'javascript', 'version': '18.15.0'},
    'go':     {'language': 'go',     'version': '1.16.2'},
}


import subprocess, tempfile, os, sys

LANG_EXEC = {
    'python':     {'ext': '.py', 'cmd': [sys.executable, '{file}']},
    'javascript': {'ext': '.js', 'cmd': ['node', '{file}']},
    'java':       {'ext': '.java', 'cmd': None},
    'c':          {'ext': '.c',   'cmd': None},
    'cpp':        {'ext': '.cpp', 'cmd': None},
}
TIMEOUT_SECONDS = 10


def _run_code_locally(language, code, stdin_text):
    """Execute code with local subprocess. Returns {stdout, stderr, exit_code, error}."""
    cfg = LANG_EXEC.get(language)
    if not cfg:
        return {'stdout': '', 'stderr': '', 'exit_code': -1,
                'error': f'Language "{language}" is not supported.'}
    if cfg['cmd'] is None:
        return {'stdout': '', 'stderr': '', 'exit_code': -1,
                'error': f'"{language}" needs a compiler not configured on this server. Use Python or JavaScript.'}
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(
                mode='w', suffix=cfg['ext'], delete=False, encoding='utf-8') as f:
            f.write(code)
            tmp_path = f.name
        cmd = [c.replace('{file}', tmp_path) for c in cfg['cmd']]
        result = subprocess.run(
            cmd, input=stdin_text, capture_output=True, text=True,
            timeout=TIMEOUT_SECONDS, encoding='utf-8', errors='replace')
        return {'stdout': result.stdout, 'stderr': result.stderr,
                'exit_code': result.returncode, 'error': ''}
    except subprocess.TimeoutExpired:
        return {'stdout': '', 'stderr': '', 'exit_code': -1, 'error': 'Time Limit Exceeded (10s).'}
    except FileNotFoundError as e:
        return {'stdout': '', 'stderr': '', 'exit_code': -1, 'error': f'Runtime not found: {e}'}
    except Exception as e:
        return {'stdout': '', 'stderr': '', 'exit_code': -1, 'error': str(e)}
    finally:
        if tmp_path:
            try: os.unlink(tmp_path)
            except: pass


@csrf_exempt
@require_POST
def coding_run(request):
    """Run code against user stdin using local subprocess."""
    user, err = _get_user_from_request(request)
    if err: return err
    try:
        data = json.loads(request.body)
        language = data.get('language', 'python')
        code = data.get('code', '')
        stdin = data.get('stdin', '')
    except Exception:
        return JsonResponse({'error': 'Invalid JSON.'}, status=400)

    result = _run_code_locally(language, code, stdin)
    return JsonResponse({
        'stdout': result['stdout'],
        'stderr': result['stderr'],
        'code':   result['exit_code'],
        'error':  result['error'],
    })



@csrf_exempt
@require_POST
def coding_submit(request, problem_id):
    """Submit code against all hidden test cases using local subprocess."""
    user, err = _get_user_from_request(request)
    if err: return err
    from apps.progress.models import CodingProblem, CodeSubmission
    try:
        problem = CodingProblem.objects.get(pk=problem_id, is_active=True)
    except CodingProblem.DoesNotExist:
        return JsonResponse({'error': 'Problem not found.'}, status=404)
    try:
        data = json.loads(request.body)
        language = data.get('language', 'python')
        code = data.get('code', '')
    except Exception:
        return JsonResponse({'error': 'Invalid JSON.'}, status=400)

    if language not in LANG_EXEC or LANG_EXEC[language]['cmd'] is None:
        return JsonResponse({'error': f'Language "{language}" is not supported. Use Python or JavaScript.'}, status=400)

    test_cases = problem.test_cases or []
    passed = 0
    case_results = []
    verdict = 'accepted'
    error_msg = ''

    for i, tc in enumerate(test_cases):
        tc_input = tc.get('input', '')
        expected = str(tc.get('expected_output', '')).strip()
        result = _run_code_locally(language, code, tc_input)

        if result['error'] and 'Time Limit' in result['error']:
            verdict = 'time_limit'
            case_results.append({'case': i+1, 'passed': False, 'expected': expected, 'got': 'TLE'})
            break

        if result['exit_code'] != 0 and result['stderr']:
            verdict = 'runtime_error'
            error_msg = result['stderr'][:500]
            case_results.append({'case': i+1, 'passed': False, 'expected': expected, 'got': result['stderr'][:120]})
            break

        actual = result['stdout'].strip()
        ok = (actual == expected)
        if ok:
            passed += 1
        elif verdict == 'accepted':
            verdict = 'wrong_answer'
        case_results.append({'case': i+1, 'passed': ok, 'expected': expected, 'got': actual})

    sub = CodeSubmission.objects.create(
        student=user, problem=problem, language=language, code=code,
        verdict=verdict, passed_cases=passed, total_cases=len(test_cases),
        error_message=error_msg,
    )

    if verdict == 'accepted':
        from apps.progress.models import StudentTopicProgress
        prog, _ = StudentTopicProgress.objects.get_or_create(
            user=user, topic='coding', defaults={'total_items': 30})
        solved_ids = CodeSubmission.objects.filter(
            student=user, verdict='accepted').values_list('problem_id', flat=True).distinct()
        prog.completed_items = min(solved_ids.count(), prog.total_items)
        prog.last_activity = timezone.now()
        prog.save()

    return JsonResponse({
        'verdict': verdict,
        'passed': passed,
        'total': len(test_cases),
        'case_results': case_results,
        'submission_id': sub.pk,
        'error': error_msg,
    })


@require_GET
def coding_problems(request):
    user, err = _get_user_from_request(request)
    if err: return err
    from apps.progress.models import CodingProblem, CodeSubmission
    difficulty = request.GET.get('difficulty', '')
    qs = CodingProblem.objects.filter(is_active=True)
    if difficulty:
        qs = qs.filter(difficulty=difficulty)
    solved_ids = set(CodeSubmission.objects.filter(student=user, verdict='accepted').values_list('problem_id', flat=True))
    data = [{
        'id': p.pk, 'title': p.title, 'slug': p.slug,
        'difficulty': p.difficulty, 'topic_tags': p.topic_tags,
        'solved': p.pk in solved_ids,
        'submissions': CodeSubmission.objects.filter(student=user, problem=p).count(),
    } for p in qs]
    return JsonResponse({'problems': data})


@require_GET
def coding_problem_detail(request, problem_id):
    user, err = _get_user_from_request(request)
    if err: return err
    from apps.progress.models import CodingProblem
    try:
        p = CodingProblem.objects.get(pk=problem_id, is_active=True)
    except CodingProblem.DoesNotExist:
        return JsonResponse({'error': 'Problem not found.'}, status=404)
    return JsonResponse({
        'id': p.pk, 'title': p.title, 'description': p.description,
        'difficulty': p.difficulty, 'topic_tags': p.topic_tags,
        'constraints': p.constraints,
        'sample_input': p.sample_input, 'sample_output': p.sample_output,
        'explanation': p.explanation,
    })


@require_GET
def coding_submissions(request):
    user, err = _get_user_from_request(request)
    if err: return err
    from apps.progress.models import CodeSubmission
    subs = CodeSubmission.objects.filter(student=user).select_related('problem')[:50]
    return JsonResponse({'submissions': [{
        'id': s.pk, 'problem': s.problem.title, 'problem_id': s.problem_id,
        'language': s.language, 'verdict': s.verdict,
        'passed': s.passed_cases, 'total': s.total_cases,
        'submitted_at': s.submitted_at.isoformat(),
    } for s in subs]})





# ─────────────────────────────────────────────────────────────────────────────
# LEADERBOARD
# ─────────────────────────────────────────────────────────────────────────────

@require_GET
def leaderboard(request):
    user, err = _get_user_from_request(request)
    if err: return err
    from apps.progress.models import StudentTopicProgress
    students = User.objects.filter(role='student', registration_status='approved')
    board = []
    for s in students:
        progs = StudentTopicProgress.objects.filter(user=s)
        total_c = sum(p.completed_items for p in progs)
        total_t = sum(p.total_items for p in progs)
        overall = round((total_c / total_t) * 100, 1) if total_t else 0
        board.append({
            'id': s.pk,
            'name': f"{s.first_name} {s.last_name}".strip() or s.username,
            'username': s.username,
            'branch': getattr(s, 'branch', ''),
            'batch_year': getattr(s, 'batch_year', None),
            'overall_pct': overall,
        })
    board.sort(key=lambda x: x['overall_pct'], reverse=True)
    for i, entry in enumerate(board):
        entry['rank'] = i + 1
        entry['is_me'] = entry['id'] == user.pk
    return JsonResponse({'leaderboard': board[:50]})


# ─────────────────────────────────────────────────────────────────────────────
# COMPANY APPLICATIONS
# ─────────────────────────────────────────────────────────────────────────────

@require_GET
def companies_list(request):
    user, err = _get_user_from_request(request)
    if err: return err
    from apps.placements.models import Company, CompanyApplication
    companies = Company.objects.filter(is_active=True)
    applied_ids = set(CompanyApplication.objects.filter(student=user).values_list('company_id', flat=True))
    data = [{
        'id': c.pk, 'name': c.name, 'logo_url': c.logo_url,
        'company_type': c.company_type, 'description': c.description,
        'ctc_min': float(c.ctc_min) if c.ctc_min else None,
        'ctc_max': float(c.ctc_max) if c.ctc_max else None,
        'roles_offered': c.roles_offered,
        'applied': c.pk in applied_ids,
    } for c in companies]
    return JsonResponse({'companies': data})


@csrf_exempt
@require_POST
def company_apply(request, company_id):
    user, err = _get_user_from_request(request)
    if err: return err
    from apps.placements.models import Company, CompanyApplication
    try:
        company = Company.objects.get(pk=company_id, is_active=True)
    except Company.DoesNotExist:
        return JsonResponse({'error': 'Company not found.'}, status=404)
    app, created = CompanyApplication.objects.get_or_create(student=user, company=company)
    return JsonResponse({'ok': True, 'created': created, 'status': app.status})


@require_GET
def my_applications(request):
    user, err = _get_user_from_request(request)
    if err: return err
    from apps.placements.models import CompanyApplication
    apps = CompanyApplication.objects.filter(student=user).select_related('company').order_by('-applied_at')
    return JsonResponse({'applications': [{
        'id': a.pk,
        'company': a.company.name, 'company_id': a.company_id,
        'status': a.status, 'applied_at': a.applied_at.isoformat(),
    } for a in apps]})


# ─────────────────────────────────────────────────────────────────────────────
# INTERVIEW SCHEDULING
# ─────────────────────────────────────────────────────────────────────────────

@require_GET
def interview_slots(request):
    user, err = _get_user_from_request(request)
    if err: return err
    from apps.interviews.models import InterviewSlot, InterviewBooking
    slots = InterviewSlot.objects.filter(is_active=True, date__gte=timezone.now().date())
    booked_ids = set(InterviewBooking.objects.filter(student=user, status='booked').values_list('slot_id', flat=True))
    return JsonResponse({'slots': [{
        'id': s.pk, 'date': str(s.date), 'start_time': str(s.start_time),
        'duration_mins': s.duration_mins, 'interviewer': s.interviewer,
        'mode': s.mode, 'available': s.is_available,
        'booked_count': s.booked_count, 'max_students': s.max_students,
        'notes': s.notes,
        'booked_by_me': s.pk in booked_ids,
    } for s in slots]})


@csrf_exempt
def interview_book(request, slot_id):
    user, err = _get_user_from_request(request)
    if err: return err
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required.'}, status=405)
    from apps.interviews.models import InterviewSlot, InterviewBooking
    try:
        slot = InterviewSlot.objects.get(pk=slot_id, is_active=True)
    except InterviewSlot.DoesNotExist:
        return JsonResponse({'error': 'Slot not found.'}, status=404)
    if not slot.is_available:
        return JsonResponse({'error': 'Slot is fully booked.'}, status=400)
    booking, created = InterviewBooking.objects.get_or_create(
        student=user, slot=slot, defaults={'status': 'booked'}
    )
    if not created and booking.status == 'cancelled':
        booking.status = 'booked'
        booking.save()
    return JsonResponse({'ok': True, 'created': created, 'booking_id': booking.pk})


@csrf_exempt
def interview_cancel(request, slot_id):
    """Cancel a student's booking for a slot."""
    user, err = _get_user_from_request(request)
    if err: return err
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required.'}, status=405)
    from apps.interviews.models import InterviewBooking
    try:
        booking = InterviewBooking.objects.get(student=user, slot_id=slot_id, status='booked')
    except InterviewBooking.DoesNotExist:
        return JsonResponse({'error': 'Active booking not found.'}, status=404)
    booking.status = 'cancelled'
    booking.save()
    return JsonResponse({'ok': True})


@require_GET
def interview_my_bookings(request):
    """Return all of the current user's interview bookings."""
    user, err = _get_user_from_request(request)
    if err: return err
    from apps.interviews.models import InterviewBooking
    bookings = InterviewBooking.objects.filter(student=user).select_related('slot').order_by('-booked_at')
    return JsonResponse({'bookings': [{
        'id': b.pk,
        'slot_id': b.slot_id,
        'date': str(b.slot.date),
        'start_time': str(b.slot.start_time),
        'duration_mins': b.slot.duration_mins,
        'interviewer': b.slot.interviewer,
        'mode': b.slot.mode,
        'status': b.status,
        'feedback': b.feedback,
        'booked_at': b.booked_at.isoformat(),
    } for b in bookings]})



# ─────────────────────────────────────────────────────────────────────────────
# ADMIN — Placement management + Analytics + Excel export
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
def admin_mark_placed(request, student_id):
    user, err = _get_user_from_request(request)
    if err: return err
    if not _is_admin(user):
        return JsonResponse({'error': 'Admin access required.'}, status=403)
    try:
        student = User.objects.get(pk=student_id, role='student')
    except User.DoesNotExist:
        return JsonResponse({'error': 'Student not found.'}, status=404)

    if request.method == 'POST':
        data = json.loads(request.body)
        from apps.placements.models import Company, PlacementRecord
        company_name = data.get('company', '')
        package = data.get('package', 0)
        role = data.get('role', '')
        company, _ = Company.objects.get_or_create(name=company_name)
        PlacementRecord.objects.create(student=student, company=company, role=role, package=package)
        student.is_placed = True
        student.placed_company = company_name
        student.placed_package = package
        student.placed_role = role
        student.save()
        # Send notification
        from apps.notifications.models import Notification
        Notification.objects.create(
            user=student, title='🎉 Congratulations! You are placed!',
            message=f'You have been placed at {company_name} as {role} with {package} LPA.',
            notif_type='success', link='/profile',
        )
        return JsonResponse({'ok': True})
    return JsonResponse({'error': 'POST required.'}, status=405)


@require_GET
def admin_placement_analytics(request):
    user, err = _get_user_from_request(request)
    if err: return err
    if not _is_admin(user):
        return JsonResponse({'error': 'Admin access required.'}, status=403)

    from apps.placements.models import PlacementRecord, Company
    from apps.progress.models import StudentTopicProgress

    students = User.objects.filter(role='student')
    total = students.count()
    placed = students.filter(is_placed=True).count()

    # Company breakdown
    from django.db.models import Count, Avg
    company_data = PlacementRecord.objects.values('company__name').annotate(
        count=Count('id'), avg_pkg=Avg('package')
    ).order_by('-count')

    # Batch breakdown
    batch_data = []
    for year in students.values_list('batch_year', flat=True).distinct():
        if year:
            batch_stu = students.filter(batch_year=year)
            batch_placed = batch_stu.filter(is_placed=True).count()
            batch_data.append({
                'year': year,
                'total': batch_stu.count(),
                'placed': batch_placed,
                'rate': round(batch_placed / batch_stu.count() * 100, 1) if batch_stu.count() else 0,
            })

    return JsonResponse({
        'total_students': total,
        'placed': placed,
        'placement_rate': round(placed / total * 100, 1) if total else 0,
        'companies': list(company_data),
        'batch_breakdown': sorted(batch_data, key=lambda x: x['year']),
    })


@require_GET
def admin_export_excel(request):
    """Export all student data as .xlsx"""
    user, err = _get_user_from_request(request)
    if err: return err
    if not _is_admin(user):
        return JsonResponse({'error': 'Admin access required.'}, status=403)
    try:
        import openpyxl
        from apps.progress.models import StudentTopicProgress
    except ImportError:
        return JsonResponse({'error': 'openpyxl not installed. Run: pip install openpyxl'}, status=500)

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = 'Students'
    headers = ['Name', 'Email', 'Roll No', 'Branch', 'Batch', 'Placed', 'Company', 'Package (LPA)',
               'Aptitude %', 'Coding %', 'Resume %', 'Companies %', 'Overall %']
    ws.append(headers)

    students = User.objects.filter(role='student').order_by('username')
    for s in students:
        progs = {p.topic: p for p in StudentTopicProgress.objects.filter(user=s)}
        row = [
            f"{s.first_name} {s.last_name}".strip() or s.username,
            s.email, getattr(s, 'roll_number', ''), getattr(s, 'branch', ''),
            str(getattr(s, 'batch_year', '') or ''),
            'Yes' if s.is_placed else 'No',
            s.placed_company or '', float(s.placed_package) if s.placed_package else '',
            progs.get('aptitude', type('o', (), {'completion_percentage': 0})()).completion_percentage,
            progs.get('coding', type('o', (), {'completion_percentage': 0})()).completion_percentage,
            progs.get('resume', type('o', (), {'completion_percentage': 0})()).completion_percentage,
            progs.get('companies', type('o', (), {'completion_percentage': 0})()).completion_percentage,
        ]
        totals = [progs.get(t, type('o', (), {'completion_percentage': 0})()).completion_percentage for t in ['aptitude','coding','resume','companies']]
        row.append(round(sum(totals)/4, 1))
        ws.append(row)

    from io import BytesIO
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="students_data.xlsx"'
    return response





@require_GET
def admin_interview_slots_manage(request):
    user, err = _get_user_from_request(request)
    if err: return err
    if not _is_admin(user):
        return JsonResponse({'error': 'Admin access required.'}, status=403)
    from apps.interviews.models import InterviewSlot
    slots = InterviewSlot.objects.all()
    return JsonResponse({'slots': [{
        'id': s.pk, 'date': str(s.date), 'start_time': str(s.start_time),
        'interviewer': s.interviewer, 'mode': s.mode,
        'max_students': s.max_students, 'booked': s.booked_count,
    } for s in slots]})


@csrf_exempt
def admin_create_slot(request):
    user, err = _get_user_from_request(request)
    if err: return err
    if not _is_admin(user):
        return JsonResponse({'error': 'Admin access required.'}, status=403)
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required.'}, status=405)
    data = json.loads(request.body)
    from apps.interviews.models import InterviewSlot
    slot = InterviewSlot.objects.create(
        date=data['date'], start_time=data['start_time'],
        interviewer=data.get('interviewer', ''),
        duration_mins=data.get('duration_mins', 30),
        mode=data.get('mode', 'online'),
        max_students=data.get('max_students', 1),
    )
    return JsonResponse({'ok': True, 'slot_id': slot.pk})


@csrf_exempt
def admin_create_test(request):
    """Admin creates a test with question IDs."""
    user, err = _get_user_from_request(request)
    if err: return err
    if not _is_admin(user):
        return JsonResponse({'error': 'Admin access required.'}, status=403)
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required.'}, status=405)
    data = json.loads(request.body)
    from apps.assessments.models import Test, Question
    test = Test.objects.create(
        title=data['title'], description=data.get('description', ''),
        topic=data.get('topic', 'general'), difficulty=data.get('difficulty', 'medium'),
        time_limit=data.get('time_limit', 30), created_by=user,
    )
    q_ids = data.get('question_ids', [])
    if q_ids:
        test.questions.set(Question.objects.filter(pk__in=q_ids))
    return JsonResponse({'ok': True, 'test_id': test.pk})


@csrf_exempt
def admin_create_question(request):
    user, err = _get_user_from_request(request)
    if err: return err
    if not _is_admin(user):
        return JsonResponse({'error': 'Admin access required.'}, status=403)
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required.'}, status=405)
    data = json.loads(request.body)
    from apps.assessments.models import Question
    q = Question.objects.create(
        topic=data['topic'], difficulty=data.get('difficulty', 'medium'),
        text=data['text'], option_a=data['option_a'], option_b=data['option_b'],
        option_c=data['option_c'], option_d=data['option_d'],
        correct=data['correct'].upper(), explanation=data.get('explanation', ''),
    )
    return JsonResponse({'ok': True, 'question_id': q.pk})


@csrf_exempt
def admin_create_coding_problem(request):
    user, err = _get_user_from_request(request)
    if err: return err
    if not _is_admin(user):
        return JsonResponse({'error': 'Admin access required.'}, status=403)
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required.'}, status=405)
    data = json.loads(request.body)
    from apps.progress.models import CodingProblem
    from django.utils.text import slugify
    title = data['title']
    slug = slugify(title)
    p = CodingProblem.objects.create(
        title=title, slug=slug,
        description=data['description'],
        difficulty=data.get('difficulty', 'medium'),
        topic_tags=data.get('topic_tags', []),
        constraints=data.get('constraints', ''),
        sample_input=data.get('sample_input', ''),
        sample_output=data.get('sample_output', ''),
        explanation=data.get('explanation', ''),
        test_cases=data.get('test_cases', []),
    )
    return JsonResponse({'ok': True, 'problem_id': p.pk})


# ─────────────────────────────────────────────────────────────────────────────
# RESUME BUILDER
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
def resume_get_save(request):
    """GET: return saved resume data. POST: save resume data."""
    user, err = _get_user_from_request(request)
    if err: return err

    from apps.resources.models import Resume

    if request.method == 'GET':
        resume = Resume.objects.filter(user=user).first()
        if not resume:
            return JsonResponse({'resume': None})
        return JsonResponse({'resume': {
            'id': resume.pk,
            'template': resume.template,
            'data': resume.data,
            'updated_at': resume.updated_at.isoformat() if hasattr(resume, 'updated_at') else '',
        }})

    if request.method == 'POST':
        body = json.loads(request.body)
        resume, _ = Resume.objects.update_or_create(
            user=user,
            defaults={'template': body.get('template', 'modern'), 'data': body.get('data', {})},
        )
        return JsonResponse({'ok': True, 'id': resume.pk})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@require_GET
def resume_download_pdf(request):
    """Generate and return a PDF of the student's resume."""
    user, err = _get_user_from_request(request)
    if err: return err

    from apps.resources.models import Resume
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
    from io import BytesIO

    resume_obj = Resume.objects.filter(user=user).first()
    data = resume_obj.data if resume_obj else {}

    # ── fallback defaults ──────────────────────────────────────────────────
    name        = data.get('name', user.get_full_name() or user.username)
    email       = data.get('email', user.email)
    phone       = data.get('phone', '')
    location    = data.get('location', '')
    linkedin    = data.get('linkedin', '')
    summary     = data.get('summary', '')
    skills      = data.get('skills', [])
    education   = data.get('education', [])
    experience  = data.get('experience', [])
    projects    = data.get('projects', [])
    certifs     = data.get('certifications', [])

    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=18*mm, rightMargin=18*mm,
                            topMargin=15*mm, bottomMargin=15*mm)

    # ── Styles ────────────────────────────────────────────────────────────
    ss = getSampleStyleSheet()
    NAVY  = colors.HexColor('#1a2e4a')
    BLUE  = colors.HexColor('#2563eb')
    GRAY  = colors.HexColor('#6b7280')
    LIGHT = colors.HexColor('#f3f4f6')

    name_style  = ParagraphStyle('Name',  fontName='Helvetica-Bold', fontSize=22, textColor=NAVY, spaceAfter=2)
    cont_style  = ParagraphStyle('Cont',  fontName='Helvetica',      fontSize=9,  textColor=GRAY, spaceAfter=6)
    sec_style   = ParagraphStyle('Sec',   fontName='Helvetica-Bold', fontSize=11, textColor=BLUE, spaceBefore=10, spaceAfter=4)
    body_style  = ParagraphStyle('Body',  fontName='Helvetica',      fontSize=9,  textColor=colors.black, leading=14)
    bold_style  = ParagraphStyle('Bold',  fontName='Helvetica-Bold', fontSize=9,  textColor=NAVY)
    sub_style   = ParagraphStyle('Sub',   fontName='Helvetica-Oblique', fontSize=9, textColor=GRAY)
    bullet_style= ParagraphStyle('Bullet',fontName='Helvetica',      fontSize=9,  textColor=colors.black, leading=14, leftIndent=10, bulletIndent=0)

    story = []

    # ── Header ────────────────────────────────────────────────────────────
    story.append(Paragraph(name, name_style))
    contact_parts = [p for p in [email, phone, location, linkedin] if p]
    story.append(Paragraph(' · '.join(contact_parts), cont_style))
    story.append(HRFlowable(width='100%', thickness=2, color=BLUE, spaceAfter=6))

    # ── Summary ───────────────────────────────────────────────────────────
    if summary:
        story.append(Paragraph('PROFESSIONAL SUMMARY', sec_style))
        story.append(Paragraph(summary, body_style))

    # ── Skills ────────────────────────────────────────────────────────────
    if skills:
        story.append(Paragraph('TECHNICAL SKILLS', sec_style))
        skill_text = ' · '.join(skills) if isinstance(skills, list) else skills
        story.append(Paragraph(skill_text, body_style))

    # ── Education ─────────────────────────────────────────────────────────
    if education:
        story.append(Paragraph('EDUCATION', sec_style))
        for edu in education:
            deg  = edu.get('degree', '')
            inst = edu.get('institution', '')
            yr   = edu.get('year', '')
            cgpa = edu.get('cgpa', '')
            line1 = f'<b>{deg}</b> — {inst}'
            line2_parts = [p for p in [yr, (f'CGPA: {cgpa}' if cgpa else '')] if p]
            story.append(Paragraph(line1, bold_style))
            if line2_parts:
                story.append(Paragraph(' | '.join(line2_parts), sub_style))
            story.append(Spacer(1, 4))

    # ── Experience ────────────────────────────────────────────────────────
    if experience:
        story.append(Paragraph('EXPERIENCE', sec_style))
        for exp in experience:
            role    = exp.get('role', '')
            company = exp.get('company', '')
            period  = exp.get('period', '')
            desc    = exp.get('description', '')
            story.append(Paragraph(f'<b>{role}</b> — {company}', bold_style))
            if period:
                story.append(Paragraph(period, sub_style))
            if desc:
                for line in desc.split('\n'):
                    if line.strip():
                        story.append(Paragraph(f'• {line.strip()}', bullet_style))
            story.append(Spacer(1, 4))

    # ── Projects ──────────────────────────────────────────────────────────
    if projects:
        story.append(Paragraph('PROJECTS', sec_style))
        for proj in projects:
            proj_name = proj.get('name', '')
            tech      = proj.get('technologies', '')
            desc      = proj.get('description', '')
            link      = proj.get('link', '')
            title_line = f'<b>{proj_name}</b>'
            if tech:
                title_line += f' <font color="#6b7280">({tech})</font>'
            story.append(Paragraph(title_line, bold_style))
            if desc:
                for line in desc.split('\n'):
                    if line.strip():
                        story.append(Paragraph(f'• {line.strip()}', bullet_style))
            if link:
                story.append(Paragraph(f'<font color="#2563eb">{link}</font>', sub_style))
            story.append(Spacer(1, 4))

    # ── Certifications ────────────────────────────────────────────────────
    if certifs:
        story.append(Paragraph('CERTIFICATIONS', sec_style))
        for c in certifs:
            if isinstance(c, dict):
                story.append(Paragraph(f'• <b>{c.get("name","")}</b> — {c.get("issuer","")} {c.get("year","")}', bullet_style))
            else:
                story.append(Paragraph(f'• {c}', bullet_style))

    doc.build(story)
    buf.seek(0)

    fname = f"{name.replace(' ', '_')}_Resume.pdf"
    response = HttpResponse(buf.read(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{fname}"'
    return response


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN PLACEMENT ANALYTICS (enhanced)
# ─────────────────────────────────────────────────────────────────────────────

@require_GET
def admin_placement_analytics(request):
    user, err = _get_user_from_request(request)
    if err: return err
    if not _is_admin(user):
        return JsonResponse({'error': 'Admin only'}, status=403)

    from apps.placements.models import PlacementRecord, Company
    from apps.accounts.models import User as UserModel
    from apps.assessments.models import TestAttempt

    students = UserModel.objects.filter(role='student')
    placed   = PlacementRecord.objects.select_related('student', 'company').all()

    total_students = students.count()
    total_placed   = placed.values('student').distinct().count()
    placement_rate = round(total_placed / total_students * 100, 1) if total_students else 0

    # Average package
    pkgs = [float(p.package) for p in placed if p.package]
    avg_package = round(sum(pkgs) / len(pkgs), 2) if pkgs else 0
    max_package = round(max(pkgs), 2) if pkgs else 0

    # Company-wise stats
    from collections import defaultdict
    company_map = defaultdict(lambda: {'selected': 0, 'packages': []})
    for p in placed:
        cn = p.company.name if p.company else '—'
        company_map[cn]['selected'] += 1
        if p.package:
            company_map[cn]['packages'].append(float(p.package))

    company_stats = [
        {
            'company': k,
            'selected': v['selected'],
            'avg_package': round(sum(v['packages']) / len(v['packages']), 2) if v['packages'] else 0,
        }
        for k, v in company_map.items()
    ]
    company_stats.sort(key=lambda x: x['selected'], reverse=True)

    # Batch-wise stats
    from django.db.models import Count
    batch_stats = []
    for batch_year in students.values_list('batch_year', flat=True).distinct():
        if not batch_year:
            continue
        batch_total   = students.filter(batch_year=batch_year).count()
        batch_placed  = placed.filter(student__batch_year=batch_year).values('student').distinct().count()
        batch_stats.append({
            'year': str(batch_year),
            'total': batch_total,
            'placed': batch_placed,
            'rate': round(batch_placed / batch_total * 100, 1) if batch_total else 0,
        })
    batch_stats.sort(key=lambda x: x['year'])

    # Branch-wise stats
    branch_stats = []
    for branch in students.values_list('branch', flat=True).distinct():
        if not branch:
            continue
        branch_total  = students.filter(branch=branch).count()
        branch_placed = placed.filter(student__branch=branch).values('student').distinct().count()
        branch_stats.append({
            'branch': branch,
            'total': branch_total,
            'placed': branch_placed,
            'rate': round(branch_placed / branch_total * 100, 1) if branch_total else 0,
        })
    branch_stats.sort(key=lambda x: x['placed'], reverse=True)

    # Recent placements (last 10)
    recent = placed.order_by('-offer_date')[:10]
    recent_list = []
    for p in recent:
        recent_list.append({
            'student': p.student.get_full_name() or p.student.username,
            'company': p.company.name if p.company else '—',
            'role': p.role,
            'package': float(p.package) if p.package else 0,
            'date': p.offer_date.strftime('%Y-%m-%d') if p.offer_date else '',
        })

    # Unplaced students list (sample 20)
    placed_ids = placed.values_list('student_id', flat=True).distinct()
    unplaced = students.exclude(pk__in=placed_ids)[:20]
    unplaced_list = [{
        'id': s.pk,
        'name': s.get_full_name() or s.username,
        'branch': s.branch or '—',
        'cgpa': str(s.cgpa) if hasattr(s, 'cgpa') and s.cgpa else '—',
        'batch_year': s.batch_year or '—',
    } for s in unplaced]

    return JsonResponse({
        'summary': {
            'total_students': total_students,
            'total_placed':   total_placed,
            'placement_rate': placement_rate,
            'avg_package':    avg_package,
            'max_package':    max_package,
            'total_companies': Company.objects.count(),
        },
        'company_stats':  company_stats,
        'batch_stats':    batch_stats,
        'branch_stats':   branch_stats,
        'recent_placements': recent_list,
        'unplaced_students': unplaced_list,
    })


# ─────────────────────────────────────────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────────────────────────────────────────

@require_GET
def notifications_list(request):
    """GET /api/notifications/  — returns current student's notifications."""
    user, err = _get_user_from_request(request)
    if err:
        return err
    from apps.notifications.models import Notification
    from django.db.models import Q
    
    notifs_qs = Notification.objects.filter(
        Q(user=user) | Q(user__isnull=True)
    ).order_by('-created_at')
    
    unread_count = notifs_qs.filter(is_read=False).count()
    notifs = list(notifs_qs[:50])
    
    return JsonResponse({
        'notifications': [
            {
                'id':         n.pk,
                'title':      n.title,
                'message':    n.message,
                'type':       n.notif_type,
                'is_read':    n.is_read,
                'link':       n.link,
                'created_at': n.created_at.isoformat(),
            }
            for n in notifs
        ],
        'unread_count': unread_count
    })


@csrf_exempt
def notification_mark_read(request, notif_id):
    """POST /api/notifications/<id>/read/"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    user, err = _get_user_from_request(request)
    if err:
        return err
    from apps.notifications.models import Notification
    try:
        n = Notification.objects.get(pk=notif_id, user=user)
        n.is_read = True
        n.save(update_fields=['is_read'])
        return JsonResponse({'success': True})
    except Notification.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)


@csrf_exempt
def admin_create_notification(request):
    """
    POST /api/admin/notifications/
    Body: {
        title, message, type,
        recipient: 'all' | 'selected',
        student_ids: [1, 2, 3]          # used when recipient='selected'
    }
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    user, err = _get_user_from_request(request)
    if err:
        return err
    if not _is_admin(user):
        return JsonResponse({'error': 'Admin access required.'}, status=403)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    title      = data.get('title', '').strip()
    message    = data.get('message', '').strip()
    notif_type = data.get('type', 'info')
    recipient  = data.get('recipient', 'all')        # 'all' | 'selected'
    student_ids = data.get('student_ids', [])
    link       = data.get('link', '')

    if not title or not message:
        return JsonResponse({'error': 'Title and message are required.'}, status=400)
    if notif_type not in ('info', 'success', 'warning', 'alert'):
        notif_type = 'info'

    from apps.notifications.models import Notification

    created_count = 0
    if recipient == 'all':
        # Broadcast: one Notification per student (user FK = student)
        students = User.objects.filter(role='student', is_active=True)
        notifs = [
            Notification(user=s, title=title, message=message,
                         notif_type=notif_type, link=link)
            for s in students
        ]
        Notification.objects.bulk_create(notifs)
        created_count = len(notifs)
    elif recipient == 'selected' and student_ids:
        students = User.objects.filter(pk__in=student_ids, role='student', is_active=True)
        notifs = [
            Notification(user=s, title=title, message=message,
                         notif_type=notif_type, link=link)
            for s in students
        ]
        Notification.objects.bulk_create(notifs)
        created_count = len(notifs)
    else:
        return JsonResponse({'error': 'Invalid recipient configuration.'}, status=400)

    return JsonResponse({'success': True, 'sent_to': created_count})


@csrf_exempt
def notification_mark_read(request, notif_id):
    """POST /api/notifications/<id>/read/"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    user, err = _get_user_from_request(request)
    if err:
        return err
    from apps.notifications.models import Notification
    from django.db.models import Q
    try:
        n = Notification.objects.get(pk=notif_id)
        if n.user == user or n.user is None:
            n.is_read = True
            n.save(update_fields=['is_read'])
            return JsonResponse({'success': True})
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    except Notification.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

@csrf_exempt
def notification_mark_all_read(request):
    """POST /api/notifications/read-all/"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    user, err = _get_user_from_request(request)
    if err:
        return err
    from apps.notifications.models import Notification
    from django.db.models import Q
    Notification.objects.filter(Q(user=user) | Q(user__isnull=True), is_read=False).update(is_read=True)
    return JsonResponse({'success': True})

@require_GET
def admin_sent_notifications(request):
    """GET /api/admin/notifications/sent/ — history of all sent notifications."""
    user, err = _get_user_from_request(request)
    if err:
        return err
    if not _is_admin(user):
        return JsonResponse({'error': 'Admin access required.'}, status=403)

    from apps.notifications.models import Notification
    # Get recent notifications (sent via admin) — group by title+message+created for UI
    notifs = Notification.objects.select_related('user').order_by('-created_at')[:200]

    # Use distinct title+message+created_at combos for display (bulk_create gives same timestamp)
    seen = {}
    result = []
    for n in notifs:
        key = (n.title, n.message, n.created_at.strftime('%Y-%m-%dT%H:%M'))
        if key not in seen:
            seen[key] = {'count': 0, 'read': 0}
            result.append({
                'id':         n.pk,
                'title':      n.title,
                'message':    n.message,
                'type':       n.notif_type,
                'created_at': n.created_at.isoformat(),
                '_key':       key,
            })
        seen[key]['count'] += 1
        if n.is_read:
            seen[key]['read'] += 1

    for r in result:
        k = r.pop('_key')
        r['recipient_count'] = seen[k]['count']
        r['read_count']      = seen[k]['read']

    return JsonResponse({'notifications': result[:50]})


@require_GET
def admin_students_for_notification(request):
    """
    GET /api/admin/notifications/students/
    Returns students sorted by status bucket: success / warning / alert
    based on overall aptitude percentage.
    """
    user, err = _get_user_from_request(request)
    if err:
        return err
    if not _is_admin(user):
        return JsonResponse({'error': 'Admin access required.'}, status=403)

    from apps.assessments.models import TestAttempt
    from collections import defaultdict

    students = User.objects.filter(role='student', is_active=True)

    # Build per-student avg aptitude score
    attempts = TestAttempt.objects.filter(
        status='submitted'
    ).select_related('student').values('student_id', 'percentage')

    scores_map = defaultdict(list)
    for a in attempts:
        scores_map[a['student_id']].append(a['percentage'] or 0)

    result = []
    for s in students:
        avg = round(sum(scores_map[s.pk]) / len(scores_map[s.pk]), 1) if scores_map[s.pk] else 0
        tests = len(scores_map[s.pk])
        if avg >= 70:
            status = 'success'
        elif avg >= 40:
            status = 'warning'
        else:
            status = 'alert'
        result.append({
            'id':       s.pk,
            'name':     s.get_full_name() or s.username,
            'username': s.username,
            'email':    s.email,
            'avg_score': avg,
            'tests_taken': tests,
            'status':   status,
        })

    # Sort: alert first, then warning, then success (so admin sees at-risk first)
    ORDER = {'alert': 0, 'warning': 1, 'success': 2}
    result.sort(key=lambda x: (ORDER[x['status']], -x['avg_score']))
    return JsonResponse({'students': result})


# ─────────────────────────────────────────────────────────────────────────────
# STUDY MATERIALS (Student)
# ─────────────────────────────────────────────────────────────────────────────

@require_GET
def study_materials_list(request):
    """
    GET /api/materials/
    Returns list of active study materials for students.
    """
    user, err = _get_user_from_request(request)
    if err: return err
    from apps.progress.models import StudyMaterial

    materials = StudyMaterial.objects.filter(is_active=True).order_by('-created_at')
    data = []
    for m in materials:
        data.append({
            'id': m.pk,
            'title': m.title,
            'description': m.description,
            'topic': m.topic,
            'file_url': m.file_url,
            'file_upload': request.build_absolute_uri(m.file_upload.url) if m.file_upload else None,
            'created_at': m.created_at.isoformat(),
        })
    return JsonResponse({'materials': data})

import json
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model

User = get_user_model()


def admin_required(view_func):
    """Decorator that returns 403 if the user is not an admin."""
    def wrapper(request, *args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Token '):
            return JsonResponse({'error': 'Authentication required.'}, status=401)
        token = auth_header[6:]
        try:
            from django.core.signing import Signer, BadSignature
            signer = Signer()
            unsigned = signer.unsign(token)
            user_pk, _ = unsigned.split(':', 1)
            user = User.objects.get(pk=int(user_pk))
            if not (user.is_active and (user.is_staff or getattr(user, 'role', '') == 'admin')):
                return JsonResponse({'error': 'Admin access required.'}, status=403)
            request.current_user = user
        except Exception:
            return JsonResponse({'error': 'Invalid or expired token.'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper


def _topic_data(progress_qs):
    """Serialize topic progress queryset into a list."""
    return [
        {
            'topic': p.topic,
            'completed': p.completed_items,
            'total': p.total_items,
            'percentage': p.completion_percentage,
            'avg_score': p.avg_score,
            'best_score': p.best_score,
            'last_activity': p.last_activity.isoformat() if p.last_activity else None,
        }
        for p in progress_qs
    ]


def _overall_percentage(progress_qs):
    rows = list(progress_qs)
    if not rows:
        return 0.0
    total_completed = sum(r.completed_items for r in rows)
    total_items = sum(r.total_items for r in rows)
    if total_items == 0:
        return 0.0
    return round((total_completed / total_items) * 100, 1)


@require_GET
@admin_required
def admin_students_list(request):
    """
    GET /api/admin/students/
    Returns list of all students with topic-wise + overall progress summary.
    """
    from apps.progress.models import StudentTopicProgress

    students = User.objects.filter(role='student').order_by('username')
    data = []
    for student in students:
        progress_qs = StudentTopicProgress.objects.filter(user=student)
        data.append({
            'id': student.pk,
            'username': student.username,
            'email': student.email,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'overall_percentage': _overall_percentage(progress_qs),
            'topics': _topic_data(progress_qs),
        })
    return JsonResponse({'students': data, 'count': len(data)})


@require_GET
@admin_required
def admin_student_detail(request, student_id):
    """
    GET /api/admin/students/<id>/
    Returns full detail for a single student including activity log.
    """
    from apps.progress.models import StudentTopicProgress, StudentActivity

    try:
        student = User.objects.get(pk=student_id, role='student')
    except User.DoesNotExist:
        return JsonResponse({'error': 'Student not found.'}, status=404)

    progress_qs = StudentTopicProgress.objects.filter(user=student)
    activities_qs = StudentActivity.objects.filter(user=student).order_by('-timestamp')[:100]

    return JsonResponse({
        'student': {
            'id': student.pk,
            'username': student.username,
            'email': student.email,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'date_joined': student.date_joined.isoformat(),
        },
        'overall_percentage': _overall_percentage(progress_qs),
        'topics': _topic_data(progress_qs),
        'activities': [
            {
                'id': a.pk,
                'topic': a.topic,
                'action': a.action,
                'description': a.description,
                'score': a.score,
                'timestamp': a.timestamp.isoformat(),
            }
            for a in activities_qs
        ],
    })


@require_GET
@admin_required
def admin_overview(request):
    """
    GET /api/admin/overview/
    Returns aggregated stats for the admin dashboard.
    """
    from apps.progress.models import StudentTopicProgress
    from apps.assessments.models import TestAttempt
    from django.utils import timezone
    from datetime import timedelta

    students = User.objects.filter(role='student')
    total = students.count()
    placed = students.filter(is_placed=True).count() if hasattr(User, 'is_placed') else 0

    # Count placed (students with role=student who have is_placed=True or a placed field)
    try:
        placed = students.filter(is_placed=True).count()
    except Exception:
        placed = 0

    # Active this week
    week_ago = timezone.now() - timedelta(days=7)
    active_ids = StudentTopicProgress.objects.filter(
        last_activity__gte=week_ago
    ).values_list('user_id', flat=True).distinct()
    active_this_week = students.filter(pk__in=active_ids).count()

    # Avg aptitude score across all submitted attempts
    all_attempts = TestAttempt.objects.filter(status='submitted')
    avg_aptitude = 0
    if all_attempts.exists():
        scores = [a.percentage for a in all_attempts if a.total_marks]
        avg_aptitude = round(sum(scores) / len(scores), 1) if scores else 0

    # Top 5 performers
    top_students = []
    for s in students:
        prog = StudentTopicProgress.objects.filter(user=s)
        pct = _overall_percentage(prog)
        top_students.append({'id': s.pk, 'name': s.get_full_name() or s.username,
                              'username': s.username, 'overall_pct': pct})
    top_students = sorted(top_students, key=lambda x: x['overall_pct'], reverse=True)[:5]

    # Topic breakdown across all students
    topic_map = {}
    for prog in StudentTopicProgress.objects.all():
        t = prog.topic
        if t not in topic_map:
            topic_map[t] = {'scores': [], 'completions': []}
        if prog.avg_score:
            topic_map[t]['scores'].append(prog.avg_score)
        pct = prog.completion_percentage
        topic_map[t]['completions'].append(pct)

    topic_breakdown = []
    for topic, data in topic_map.items():
        topic_breakdown.append({
            'topic': topic,
            'avg_score': round(sum(data['scores']) / len(data['scores']), 1) if data['scores'] else 0,
            'avg_completion': round(sum(data['completions']) / len(data['completions']), 1) if data['completions'] else 0,
        })

    return JsonResponse({
        'total_students': total,
        'placed_students': placed,
        'placed_pct': round(placed / total * 100, 1) if total else 0,
        'active_this_week': active_this_week,
        'avg_aptitude_score': avg_aptitude,
        'top_performers': top_students,
        'topic_breakdown': topic_breakdown,
        'total_test_attempts': all_attempts.count(),
    })


@require_GET
@admin_required
def admin_activity(request):
    """
    GET /api/admin/activity/
    Returns recent activity across all students (test attempts, etc.).
    """
    from apps.assessments.models import TestAttempt

    limit = int(request.GET.get('limit', 30))

    # Recent test attempts
    attempts = TestAttempt.objects.filter(
        status='submitted'
    ).select_related('student', 'test').order_by('-submitted_at')[:limit]

    activity = []
    for a in attempts:
        activity.append({
            'type': 'aptitude',
            'student_name': a.student.get_full_name() or a.student.username,
            'student_id': a.student.pk,
            'description': f"Completed \"{a.test.title}\"",
            'score': a.percentage,
            'timestamp': a.submitted_at.isoformat() if a.submitted_at else a.started_at.isoformat(),
        })

    # Coding submissions (if model exists)
    try:
        from apps.assessments.models import CodingSubmission
        coding = CodingSubmission.objects.select_related('student', 'problem').order_by('-submitted_at')[:limit]
        for c in coding:
            activity.append({
                'type': 'coding',
                'student_name': c.student.get_full_name() or c.student.username,
                'student_id': c.student.pk,
                'description': f"Submitted \"{c.problem.title}\" — {c.verdict}",
                'score': None,
                'timestamp': c.submitted_at.isoformat(),
            })
    except Exception:
        pass

    activity.sort(key=lambda x: x['timestamp'], reverse=True)
    return JsonResponse({'activity': activity[:limit]})


@require_GET
@admin_required
def admin_aptitude_monitor(request):
    """
    GET /api/admin/aptitude-monitor/
    Returns all test attempts with student info, for admin monitoring.
    """
    from apps.assessments.models import TestAttempt
    from collections import defaultdict

    attempts = TestAttempt.objects.filter(
        status='submitted'
    ).select_related('student', 'test').order_by('-submitted_at')

    rows = []
    for a in attempts:
        rows.append({
            'attempt_id': a.pk,
            'student_name': a.student.get_full_name() or a.student.username,
            'student_id': a.student.pk,
            'test_title': a.test.title,
            'topic': a.test.topic,
            'difficulty': a.test.difficulty,
            'score': a.score,
            'total': a.total_marks,
            'percentage': a.percentage,
            'submitted_at': a.submitted_at.isoformat() if a.submitted_at else None,
        })

    # Per-topic summary
    topic_map = defaultdict(list)
    for r in rows:
        topic_map[r['topic']].append(r['percentage'])

    topic_summary = [
        {
            'topic': t,
            'attempts': len(scores),
            'avg_score': round(sum(scores) / len(scores), 1),
            'max_score': max(scores),
        }
        for t, scores in topic_map.items()
    ]

    return JsonResponse({
        'attempts': rows,
        'topic_summary': topic_summary,
        'total': len(rows),
    })


@require_GET
@admin_required
def admin_coding_monitor(request):
    """
    GET /api/admin/coding-monitor/
    Returns coding submissions with student and problem info.
    """
    try:
        from apps.progress.models import CodeSubmission
    except ImportError:
        return JsonResponse({'error': 'Coding module not found.'}, status=404)

    submissions = CodeSubmission.objects.select_related('student', 'problem').order_by('-submitted_at')

    rows = []
    for s in submissions:
        rows.append({
            'submission_id': s.pk,
            'student_name': s.student.get_full_name() or s.student.username,
            'student_id': s.student.pk,
            'problem_title': s.problem.title,
            'difficulty': s.problem.difficulty,
            'language': s.language,
            'verdict': s.verdict,
            'passed': s.passed_cases,
            'total': s.total_cases,
            'submitted_at': s.submitted_at.isoformat() if s.submitted_at else None,
            'error_message': s.error_message,
        })

    # Summary by difficulty
    diff_map = {'easy': 0, 'medium': 0, 'hard': 0}
    for r in rows:
        diff_map[r['difficulty']] += 1
    
    # Verdict summary
    verdict_map = {}
    for r in rows:
        v = r['verdict']
        verdict_map[v] = verdict_map.get(v, 0) + 1

    return JsonResponse({
        'submissions': rows,
        'difficulty_summary': diff_map,
        'verdict_summary': [{'verdict': k, 'count': v} for k, v in verdict_map.items()],
        'total': len(rows),
    })


@require_GET
@admin_required
def admin_company_monitor(request):
    """
    GET /api/admin/company-monitor/
    Returns company applications with student info.
    """
    from apps.placements.models import CompanyApplication
    from collections import defaultdict

    applications = CompanyApplication.objects.select_related('student', 'company').order_by('-applied_at')

    rows = []
    for a in applications:
        rows.append({
            'application_id': a.pk,
            'student_name': a.student.get_full_name() or a.student.username,
            'student_id': a.student.pk,
            'company_name': a.company.name,
            'company_id': a.company.pk,
            'status': a.status,
            'applied_at': a.applied_at.isoformat() if a.applied_at else None,
        })

    company_stats = defaultdict(lambda: {'total': 0, 'offered': 0, 'shortlisted': 0, 'interview': 0})
    for r in rows:
        c_name = r['company_name']
        company_stats[c_name]['total'] += 1
        st = r['status']
        if st in ('offered', 'shortlisted', 'interview'):
            company_stats[c_name][st] += 1

    summary = []
    for comp, stats in company_stats.items():
        summary.append({
            'company': comp,
            **stats
        })

    return JsonResponse({
        'applications': rows,
        'company_summary': summary,
        'total': len(rows),
    })


# ─────────────────────────────────────────────────────────────────────────────
# STUDY MATERIALS (Admin)
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
@admin_required
def admin_study_materials(request):
    """
    GET /api/admin/materials/ => list all materials
    POST /api/admin/materials/ => create new material (multipart/form-data)
    """
    from apps.progress.models import StudyMaterial

    if request.method == 'GET':
        materials = StudyMaterial.objects.all().order_by('-created_at')
        data = []
        for m in materials:
            data.append({
                'id': m.pk,
                'title': m.title,
                'description': m.description,
                'topic': m.topic,
                'file_url': m.file_url,
                'file_upload': request.build_absolute_uri(m.file_upload.url) if m.file_upload else None,
                'is_active': m.is_active,
                'created_at': m.created_at.isoformat(),
            })
        return JsonResponse({'materials': data})

    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        topic = request.POST.get('topic', '').strip()
        file_url = request.POST.get('file_url', '').strip()
        file_upload = request.FILES.get('file_upload')

        if not title or not topic:
            return JsonResponse({'error': 'Title and topic are required.'}, status=400)

        mat = StudyMaterial.objects.create(
            title=title,
            description=description,
            topic=topic,
            file_url=file_url,
            file_upload=file_upload
        )
        return JsonResponse({'success': True, 'material_id': mat.pk})

    return JsonResponse({'error': 'Method not allowed.'}, status=405)


@csrf_exempt
@admin_required
def admin_study_material_detail(request, pk):
    """
    DELETE /api/admin/materials/<pk>/ => delete material
    """
    from apps.progress.models import StudyMaterial

    try:
        mat = StudyMaterial.objects.get(pk=pk)
    except StudyMaterial.DoesNotExist:
        return JsonResponse({'error': 'Material not found.'}, status=404)

    if request.method == 'DELETE':
        mat.delete()
        return JsonResponse({'success': True})

    return JsonResponse({'error': 'Method not allowed.'}, status=405)


# ─────────────────────────────────────────────────────────────────────────────
# CODING PROBLEMS (Admin)
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
@admin_required
def admin_coding_problem_detail(request, slug):
    """
    DELETE /api/admin/CodingProblems/<slug>/ => delete coding problem
    """
    from apps.progress.models import CodingProblem

    try:
        problem = CodingProblem.objects.get(slug=slug)
    except CodingProblem.DoesNotExist:
        return JsonResponse({'error': 'Coding problem not found.'}, status=404)

    if request.method == 'DELETE':
        problem.delete()
        return JsonResponse({'success': True})

    return JsonResponse({'error': 'Method not allowed.'}, status=405)

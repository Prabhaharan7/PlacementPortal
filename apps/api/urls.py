from django.urls import path
from . import views, auth_views, admin_views

urlpatterns = [
    # ── Auth ────────────────────────────────────────────────────────────────
    path('auth/login/',   auth_views.login_view,         name='api_login'),
    path('auth/signup/',  auth_views.signup_view,        name='api_signup'),
    path('auth/logout/',  auth_views.logout_view,        name='api_logout'),
    path('auth/user/',    auth_views.current_user_view,  name='api_current_user'),
    path('auth/profile/', auth_views.update_profile_view, name='api_update_profile'),

    # ── Admin monitoring ──────────────────────────────────────────────────────
    path('admin/overview/',              admin_views.admin_overview,           name='admin_overview'),
    path('admin/activity/',              admin_views.admin_activity,           name='admin_activity'),
    path('admin/aptitude-monitor/',      admin_views.admin_aptitude_monitor,   name='admin_aptitude_monitor'),
    path('admin/coding-monitor/',        admin_views.admin_coding_monitor,     name='admin_coding_monitor'),
    path('admin/company-monitor/',       admin_views.admin_company_monitor,    name='admin_company_monitor'),
    path('admin/students/',              admin_views.admin_students_list,      name='admin_students_list'),
    path('admin/students/<int:student_id>/', admin_views.admin_student_detail, name='admin_student_detail'),
    path('admin/students/<int:student_id>/place/', views.admin_mark_placed,  name='admin_mark_placed'),
    path('admin/analytics/placements/',  views.admin_placement_analytics,     name='admin_placement_analytics'),
    path('admin/export/excel/',          views.admin_export_excel,            name='admin_export_excel'),
    path('admin/notifications/',             views.admin_create_notification,       name='admin_create_notification'),
    path('admin/notifications/sent/',         views.admin_sent_notifications,        name='admin_sent_notifications'),
    path('admin/notifications/students/',     views.admin_students_for_notification, name='admin_notif_students'),
    path('admin/interviews/slots/',      views.admin_interview_slots_manage,  name='admin_interview_slots'),
    path('admin/interviews/slots/create/', views.admin_create_slot,           name='admin_create_slot'),
    path('admin/tests/create/',          views.admin_create_test,             name='admin_create_test'),
    path('admin/questions/create/',      views.admin_create_question,         name='admin_create_question'),
    path('admin/coding/problems/create/', views.admin_create_coding_problem,  name='admin_create_coding_problem'),
    path('admin/CodingProblems/<slug:slug>/', admin_views.admin_coding_problem_detail, name='admin_coding_problem_detail'),
    
    path('admin/materials/',             admin_views.admin_study_materials,    name='admin_study_materials'),
    path('admin/materials/<int:pk>/',    admin_views.admin_study_material_detail, name='admin_study_material_detail'),

    # Student Endpoints
    path('dashboard/',                   views.student_dashboard_view,         name='student_dashboard'),
    path('materials/',                   views.study_materials_list,           name='study_materials_list'),
    
    # ── Aptitude / MCQ Tests ────────────────────────────────────────────────
    path('tests/',                       views.test_list,      name='test_list'),
    path('tests/<int:test_id>/start/',   views.test_start,     name='test_start'),
    path('tests/<int:attempt_id>/submit/', views.test_submit,  name='test_submit'),
    path('analytics/aptitude/',          views.aptitude_analytics, name='aptitude_analytics'),

    # ── Coding ──────────────────────────────────────────────────────────────
    path('coding/problems/',             views.coding_problems,       name='coding_problems'),
    path('coding/problems/<int:problem_id>/', views.coding_problem_detail, name='coding_problem_detail'),
    path('coding/run/',                  views.coding_run,            name='coding_run'),
    path('coding/submit/<int:problem_id>/', views.coding_submit,      name='coding_submit'),
    path('coding/submissions/',          views.coding_submissions,    name='coding_submissions'),

    # ── Notifications ────────────────────────────────────────────────────────
    path('notifications/',                        views.notifications_list,       name='notifications_list'),
    path('notifications/<int:notif_id>/read/',     views.notification_mark_read,   name='notification_mark_read'),
    path('notifications/read-all/',               views.notification_mark_all_read, name='notification_mark_all_read'),

    # ── Leaderboard ─────────────────────────────────────────────────────────
    path('leaderboard/',                 views.leaderboard,     name='leaderboard'),

    # ── Companies & Applications ─────────────────────────────────────────────
    path('companies/',                   views.companies_list,  name='companies_list'),
    path('companies/<int:company_id>/apply/', views.company_apply, name='company_apply'),
    path('applications/',                views.my_applications, name='my_applications'),

    # ── Interview Scheduling ─────────────────────────────────────────────────
    path('interviews/slots/',                        views.interview_slots,       name='interview_slots'),
    path('interviews/slots/<int:slot_id>/book/',      views.interview_book,        name='interview_book'),
    path('interviews/slots/<int:slot_id>/cancel/',   views.interview_cancel,      name='interview_cancel'),
    path('interviews/mybookings/',                   views.interview_my_bookings, name='interview_my_bookings'),

    # ── Resume Builder ───────────────────────────────────────────────────────
    path('resume/',                      views.resume_get_save,      name='resume_get_save'),
    path('resume/download/',             views.resume_download_pdf,  name='resume_download'),
]

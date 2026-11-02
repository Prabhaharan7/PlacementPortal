from django.urls import path
from .views import (
    login_view,
    admin_login_view,
    register_view,
    logout_view,
    student_dashboard,
    admin_dashboard,
    upload_resource,
    view_resources,
)

urlpatterns = [
    path('login/', login_view, name='login'),
    path('admin-login/', admin_login_view, name='admin_login'),
    path('register/', register_view, name='register'),
    path('logout/', logout_view, name='logout'),

    path('student/dashboard/', student_dashboard, name='student_dashboard'),

    path('admin-panel/', admin_dashboard, name='admin_dashboard'),
    path('admin-panel/upload/', upload_resource, name='upload_resource'),
    path('admin-panel/resources/', view_resources, name='view_resources'),
]

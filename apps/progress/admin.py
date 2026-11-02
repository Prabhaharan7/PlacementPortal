from django.contrib import admin
from .models import StudentTopicProgress, StudentActivity


@admin.register(StudentTopicProgress)
class StudentTopicProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'topic', 'completed_items', 'total_items', 'completion_percentage', 'avg_score', 'last_activity')
    list_filter = ('topic',)
    search_fields = ('user__username', 'user__email')


@admin.register(StudentActivity)
class StudentActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'topic', 'action', 'description', 'score', 'timestamp')
    list_filter = ('topic', 'action')
    search_fields = ('user__username', 'description')

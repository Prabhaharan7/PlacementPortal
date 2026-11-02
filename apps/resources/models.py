from django.db import models
from django.conf import settings

class Resource(models.Model):
    CATEGORY_CHOICES = [
        ('aptitude', 'Aptitude'),
        ('technical', 'Technical'),
        ('coding', 'Coding'),
        ('interview', 'Interview'),
    ]

    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='resources/', blank=True, null=True)
    link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Resume(models.Model):
    """Stores a student's resume data (JSON) for PDF generation."""
    TEMPLATE_CHOICES = [
        ('modern', 'Modern'),
        ('classic', 'Classic'),
        ('minimal', 'Minimal'),
    ]
    user       = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resume')
    template   = models.CharField(max_length=20, choices=TEMPLATE_CHOICES, default='modern')
    data       = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Resume — {self.user.username}'

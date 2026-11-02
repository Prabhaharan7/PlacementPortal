from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_CHOICES = [('info','Info'),('success','Success'),('warning','Warning'),('alert','Alert')]

    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True, help_text='Null = broadcast to all')
    title      = models.CharField(max_length=200)
    message    = models.TextField()
    notif_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='info')
    link       = models.CharField(max_length=200, blank=True, help_text='Optional React route')
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        target = self.user.username if self.user else 'ALL'
        return f"[{self.notif_type}] {self.title} → {target}"

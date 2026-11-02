from django.db import models
from django.conf import settings


class InterviewSlot(models.Model):
    date           = models.DateField()
    start_time     = models.TimeField()
    duration_mins  = models.PositiveIntegerField(default=30)
    interviewer    = models.CharField(max_length=200)
    mode           = models.CharField(max_length=20, choices=[('online','Online'),('offline','Offline')], default='online')
    max_students   = models.PositiveIntegerField(default=1)
    notes          = models.TextField(blank=True)
    is_active      = models.BooleanField(default=True)

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.date} {self.start_time} — {self.interviewer}"

    @property
    def booked_count(self):
        return self.bookings.filter(status='booked').count()

    @property
    def is_available(self):
        return self.booked_count < self.max_students


class InterviewBooking(models.Model):
    STATUS = [('booked','Booked'),('completed','Completed'),('cancelled','Cancelled'),('no_show','No Show')]

    student   = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interview_bookings')
    slot      = models.ForeignKey(InterviewSlot, on_delete=models.CASCADE, related_name='bookings')
    status    = models.CharField(max_length=15, choices=STATUS, default='booked')
    feedback  = models.TextField(blank=True)
    booked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'slot')

    def __str__(self):
        return f"{self.student.username} — {self.slot}"

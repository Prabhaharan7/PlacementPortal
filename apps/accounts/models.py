from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('admin', 'Admin'),
    )
    REG_STATUS = (
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')

    # Academic information
    college_email = models.EmailField(blank=True)
    roll_number   = models.CharField(max_length=20, blank=True)
    branch        = models.CharField(max_length=100, blank=True)
    batch_year    = models.PositiveIntegerField(null=True, blank=True)
    phone         = models.CharField(max_length=15, blank=True)
    bio           = models.TextField(blank=True)
    linkedin      = models.URLField(blank=True)
    github        = models.URLField(blank=True)
    skills        = models.JSONField(default=list, blank=True)

    # Registration approval
    registration_status = models.CharField(max_length=10, choices=REG_STATUS, default='approved')

    # Placement info
    is_placed      = models.BooleanField(default=False)
    placed_company = models.CharField(max_length=200, blank=True)
    placed_package = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    placed_role    = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

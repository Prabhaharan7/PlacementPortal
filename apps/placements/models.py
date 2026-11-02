from django.db import models
from django.conf import settings


class Company(models.Model):
    TYPE_CHOICES = [('product','Product'),('service','Service'),('startup','Startup'),('consulting','Consulting')]

    name         = models.CharField(max_length=200)
    logo_url     = models.URLField(blank=True)
    website      = models.URLField(blank=True)
    company_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='product')
    description  = models.TextField(blank=True)
    ctc_min      = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text='LPA')
    ctc_max      = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text='LPA')
    roles_offered= models.JSONField(default=list, blank=True, help_text='List of role strings')
    is_active    = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Companies'
        ordering = ['name']

    def __str__(self):
        return self.name


class CompanyVisit(models.Model):
    company          = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='visits')
    batch_year       = models.PositiveIntegerField()
    visit_date       = models.DateField(null=True, blank=True)
    students_appeared= models.PositiveIntegerField(default=0)
    students_selected= models.PositiveIntegerField(default=0)
    notes            = models.TextField(blank=True)

    def __str__(self):
        return f"{self.company.name} — {self.batch_year}"

    @property
    def selection_rate(self):
        if self.students_appeared:
            return round((self.students_selected / self.students_appeared) * 100, 1)
        return 0


class PlacementRecord(models.Model):
    student     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='placement_records')
    company     = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='placements')
    role        = models.CharField(max_length=200)
    package     = models.DecimalField(max_digits=8, decimal_places=2, help_text='LPA')
    offer_date  = models.DateField(null=True, blank=True)
    joining_date= models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-offer_date']

    def __str__(self):
        return f"{self.student.username} → {self.company.name} ({self.package} LPA)"


class CompanyApplication(models.Model):
    STATUS_CHOICES = [
        ('applied','Applied'),
        ('shortlisted','Shortlisted'),
        ('interview','Interview Scheduled'),
        ('offered','Offered'),
        ('rejected','Rejected'),
        ('withdrawn','Withdrawn'),
    ]

    student    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    company    = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='applications')
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes      = models.TextField(blank=True)

    class Meta:
        unique_together = ('student', 'company')
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.student.username} → {self.company.name} [{self.status}]"

from django.db import models
from django.conf import settings


TOPIC_CHOICES = [
    ('aptitude', 'Aptitude'),
    ('logical', 'Logical'),
    ('reasoning', 'Reasoning'),
    ('verbal', 'Verbal'),
    ('coding', 'Coding'),
    ('resume', 'Resume'),
    ('companies', 'Companies'),
]

DIFFICULTY_CHOICES = [('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')]


class StudentTopicProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='topic_progress')
    topic = models.CharField(max_length=20, choices=TOPIC_CHOICES)
    completed_items = models.PositiveIntegerField(default=0)
    total_items = models.PositiveIntegerField(default=0)
    best_score = models.FloatField(default=0.0)
    avg_score = models.FloatField(default=0.0)
    last_activity = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'topic')
        ordering = ['topic']

    def __str__(self):
        return f"{self.user.username} — {self.topic} ({self.completion_percentage:.0f}%)"

    @property
    def completion_percentage(self):
        if self.total_items == 0:
            return 0.0
        return round((self.completed_items / self.total_items) * 100, 1)


class StudentActivity(models.Model):
    ACTION_CHOICES = [
        ('quiz_completed', 'Quiz Completed'),
        ('problem_solved', 'Problem Solved'),
        ('resume_updated', 'Resume Updated'),
        ('company_viewed', 'Company Viewed'),
        ('test_started', 'Test Started'),
        ('test_failed', 'Test Failed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    topic = models.CharField(max_length=20, choices=TOPIC_CHOICES)
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    description = models.CharField(max_length=255)
    score = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} — {self.action} ({self.topic})"


class StudyMaterial(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    topic = models.CharField(max_length=20, choices=TOPIC_CHOICES)
    file_url = models.URLField(blank=True, help_text="Link to external resource or cloud storage")
    file_upload = models.FileField(upload_to='study_materials/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_topic_display()}] {self.title}"

# ── Coding Problems ──────────────────────────────────────────────────────────

class CodingProblem(models.Model):
    title         = models.CharField(max_length=200)
    slug          = models.SlugField(unique=True)
    description   = models.TextField()
    difficulty    = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    topic_tags    = models.JSONField(default=list)
    constraints   = models.TextField(blank=True)
    sample_input  = models.TextField(blank=True)
    sample_output = models.TextField(blank=True)
    explanation   = models.TextField(blank=True)
    test_cases    = models.JSONField(default=list, help_text='List of {input, expected_output} dicts')
    is_active     = models.BooleanField(default=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['difficulty', 'title']

    def __str__(self):
        return f"[{self.difficulty}] {self.title}"


LANGUAGE_CHOICES = [
    ('python', 'Python'), ('java', 'Java'), ('c', 'C'),
    ('cpp', 'C++'), ('javascript', 'JavaScript'), ('go', 'Go'),
]

VERDICT_CHOICES = [
    ('pending', 'Pending'), ('accepted', 'Accepted'),
    ('wrong_answer', 'Wrong Answer'), ('time_limit', 'Time Limit Exceeded'),
    ('runtime_error', 'Runtime Error'), ('compilation_error', 'Compilation Error'),
]


class CodeSubmission(models.Model):
    student      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='code_submissions')
    problem      = models.ForeignKey(CodingProblem, on_delete=models.CASCADE, related_name='submissions')
    language     = models.CharField(max_length=15, choices=LANGUAGE_CHOICES)
    code         = models.TextField()
    verdict      = models.CharField(max_length=20, choices=VERDICT_CHOICES, default='pending')
    passed_cases = models.PositiveIntegerField(default=0)
    total_cases  = models.PositiveIntegerField(default=0)
    runtime_ms   = models.FloatField(null=True, blank=True)
    error_message= models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.student.username} — {self.problem.title} [{self.verdict}]"

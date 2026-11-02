from django.db import models
from django.conf import settings


DIFFICULTY_CHOICES = [('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')]
TOPIC_CHOICES = [
    ('logical', 'Logical Reasoning'),
    ('quantitative', 'Quantitative Aptitude'),
    ('verbal', 'Verbal Ability'),
    ('data_interpretation', 'Data Interpretation'),
    ('general', 'General Aptitude'),
]


class Question(models.Model):
    topic       = models.CharField(max_length=30, choices=TOPIC_CHOICES)
    difficulty  = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    text        = models.TextField()
    option_a    = models.CharField(max_length=500)
    option_b    = models.CharField(max_length=500)
    option_c    = models.CharField(max_length=500)
    option_d    = models.CharField(max_length=500)
    correct     = models.CharField(max_length=1, choices=[('A','A'),('B','B'),('C','C'),('D','D')])
    explanation = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.topic}] {self.text[:60]}"


class Test(models.Model):
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    topic       = models.CharField(max_length=30, choices=TOPIC_CHOICES, default='general')
    difficulty  = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    questions   = models.ManyToManyField(Question, blank=True)
    time_limit  = models.PositiveIntegerField(default=30, help_text='Duration in minutes')
    is_active   = models.BooleanField(default=True)
    created_by  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    @property
    def question_count(self):
        return self.questions.count()


class TestAttempt(models.Model):
    STATUS = [('in_progress','In Progress'),('submitted','Submitted'),('timed_out','Timed Out')]

    student     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='test_attempts')
    test        = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='attempts')
    started_at  = models.DateTimeField(auto_now_add=True)
    submitted_at= models.DateTimeField(null=True, blank=True)
    score       = models.FloatField(null=True, blank=True)
    total_marks = models.PositiveIntegerField(default=0)
    status      = models.CharField(max_length=20, choices=STATUS, default='in_progress')

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.student.username} — {self.test.title} ({self.score})"

    @property
    def percentage(self):
        if self.total_marks and self.score is not None:
            return round((self.score / self.total_marks) * 100, 1)
        return 0


class TestAnswer(models.Model):
    attempt     = models.ForeignKey(TestAttempt, on_delete=models.CASCADE, related_name='answers')
    question    = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected    = models.CharField(max_length=1, blank=True)
    is_correct  = models.BooleanField(default=False)

    class Meta:
        unique_together = ('attempt', 'question')

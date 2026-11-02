from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()


ACTIVITIES = {
    'aptitude': [
        ('quiz_completed', 'Completed Logical Reasoning Quiz', (55, 95)),
        ('quiz_completed', 'Completed Quantitative Aptitude Test', (60, 100)),
        ('test_started', 'Started Verbal Ability Test', None),
        ('quiz_completed', 'Completed Data Interpretation Quiz', (50, 90)),
        ('test_failed', 'Failed Abstract Reasoning Test', (30, 55)),
    ],
    'coding': [
        ('problem_solved', 'Solved: Two Sum (Easy)', (80, 100)),
        ('problem_solved', 'Solved: Reverse Linked List (Medium)', (70, 100)),
        ('problem_solved', 'Solved: Binary Search (Easy)', (90, 100)),
        ('test_started', 'Started: Merge Sort (Hard)', None),
        ('problem_solved', 'Solved: Valid Parentheses (Easy)', (85, 100)),
        ('test_failed', 'Failed: Dynamic Programming Challenge', (20, 50)),
    ],
    'resume': [
        ('resume_updated', 'Updated Work Experience section', None),
        ('resume_updated', 'Added Skills section', None),
        ('resume_updated', 'Uploaded new Resume PDF', None),
    ],
    'companies': [
        ('company_viewed', 'Viewed TCS profile', None),
        ('company_viewed', 'Viewed Infosys profile', None),
        ('company_viewed', 'Viewed Google profile', None),
        ('company_viewed', 'Viewed Microsoft profile', None),
    ],
}

TOPIC_TOTALS = {
    'aptitude': 20,
    'coding': 30,
    'resume': 5,
    'companies': 15,
}


class Command(BaseCommand):
    help = 'Seed demo progress data for all student users'

    def handle(self, *args, **options):
        from apps.progress.models import StudentTopicProgress, StudentActivity

        students = User.objects.filter(role='student')
        if not students.exists():
            self.stdout.write(self.style.WARNING('No student users found. Create some first.'))
            return

        self.stdout.write(f'Seeding data for {students.count()} student(s)...')

        for student in students:
            # Clear existing
            StudentTopicProgress.objects.filter(user=student).delete()
            StudentActivity.objects.filter(user=student).delete()

            for topic, total in TOPIC_TOTALS.items():
                completed = random.randint(int(total * 0.2), total)
                scores = []

                # Create activities
                topic_acts = ACTIVITIES[topic]
                num_acts = random.randint(2, len(topic_acts))
                for i, (action, desc, score_range) in enumerate(random.sample(topic_acts, num_acts)):
                    score = None
                    if score_range:
                        score = random.uniform(*score_range)
                        scores.append(score)
                    days_ago = random.randint(0, 30)
                    act = StudentActivity(
                        user=student, topic=topic,
                        action=action, description=desc,
                        score=round(score, 1) if score else None,
                    )
                    act.save()
                    # Manually set timestamp to spread over last 30 days
                    StudentActivity.objects.filter(pk=act.pk).update(
                        timestamp=timezone.now() - timedelta(days=days_ago, hours=random.randint(0, 23))
                    )

                avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
                best_score = round(max(scores), 1) if scores else 0.0

                StudentTopicProgress.objects.create(
                    user=student, topic=topic,
                    completed_items=completed, total_items=total,
                    avg_score=avg_score, best_score=best_score,
                    last_activity=timezone.now() - timedelta(days=random.randint(0, 7))
                )

            self.stdout.write(self.style.SUCCESS(f'  ✅ {student.username} ({student.email})'))

        self.stdout.write(self.style.SUCCESS('\nDone! Seed data created for all students.'))

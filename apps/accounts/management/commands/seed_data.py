"""Seed demo aptitude questions, tests, and coding problems."""
import random
from django.core.management.base import BaseCommand
from django.utils.text import slugify


class Command(BaseCommand):
    help = 'Seed demo MCQ questions, tests, and coding problems'

    def handle(self, *args, **options):
        from apps.assessments.models import Question, Test
        from apps.progress.models import CodingProblem
        from apps.placements.models import Company
        from apps.notifications.models import Notification
        from django.contrib.auth import get_user_model
        User = get_user_model()

        self.stdout.write('Seeding MCQ questions...')
        questions_data = [
            # Logical
            {'topic': 'logical', 'difficulty': 'easy', 'text': 'If A is the brother of B, B is the sister of C, then how is A related to C?', 'option_a': 'Brother', 'option_b': 'Sister', 'option_c': 'Uncle', 'option_d': 'Cannot determine', 'correct': 'A', 'explanation': 'A is male and brother of B. B is the sister of C. So A is the brother of C.'},
            {'topic': 'logical', 'difficulty': 'easy', 'text': 'Looking at a portrait of a man, John said, "His mother is the wife of my father\'s son. Brothers and sisters I have none." Who is in the portrait?', 'option_a': 'John\'s son', 'option_b': 'John\'s brother', 'option_c': 'John himself', 'option_d': 'John\'s father', 'correct': 'A', 'explanation': 'John has no siblings, so "my father\'s son" is John himself. The man\'s mother is John\'s wife, so the man is John\'s son.'},
            {'topic': 'logical', 'difficulty': 'medium', 'text': 'In a row of boys, Rajan is 10th from the left and Suraj is 17th from the right. If they interchange positions, Rajan becomes 15th from the left. How many boys are in the row?', 'option_a': '31', 'option_b': '32', 'option_c': '33', 'option_d': '34', 'correct': 'A', 'explanation': 'After interchange, Rajan is 15th from left = Suraj\'s original position. Total = 15 + 17 - 1 = 31.'},
            {'topic': 'logical', 'difficulty': 'medium', 'text': 'All cats are animals. All animals have legs. Which conclusion follows?', 'option_a': 'All cats have legs', 'option_b': 'All animals are cats', 'option_c': 'Some legs are cats', 'option_d': 'None of the above', 'correct': 'A', 'explanation': 'By syllogism: All cats → animals → have legs. So all cats have legs.'},
            {'topic': 'logical', 'difficulty': 'hard', 'text': 'Five friends P, Q, R, S, T are sitting in a row. Q is between P and R. S is to the right of T and left of P. Who is sitting in the middle?', 'option_a': 'P', 'option_b': 'Q', 'option_c': 'S', 'option_d': 'T', 'correct': 'A', 'explanation': 'Order: T-S-P-Q-R. P is in the middle (3rd position).'},
            # Quantitative
            {'topic': 'quantitative', 'difficulty': 'easy', 'text': 'If a train travels 360 km in 4 hours, what is its speed in km/hr?', 'option_a': '60', 'option_b': '80', 'option_c': '90', 'option_d': '100', 'correct': 'C', 'explanation': 'Speed = Distance/Time = 360/4 = 90 km/hr.'},
            {'topic': 'quantitative', 'difficulty': 'easy', 'text': 'What is 15% of 240?', 'option_a': '32', 'option_b': '36', 'option_c': '38', 'option_d': '40', 'correct': 'B', 'explanation': '15/100 × 240 = 36.'},
            {'topic': 'quantitative', 'difficulty': 'medium', 'text': 'A can do a job in 12 days. B can do it in 8 days. How many days to finish together?', 'option_a': '4.8', 'option_b': '5', 'option_c': '4', 'option_d': '6', 'correct': 'A', 'explanation': '1/12 + 1/8 = 5/24. Days = 24/5 = 4.8 days.'},
            {'topic': 'quantitative', 'difficulty': 'medium', 'text': 'Simple interest on Rs.5000 at 8% per annum for 3 years is?', 'option_a': 'Rs. 1200', 'option_b': 'Rs. 1500', 'option_c': 'Rs. 1350', 'option_d': 'Rs. 1000', 'correct': 'A', 'explanation': 'SI = P×R×T/100 = 5000×8×3/100 = Rs.1200.'},
            {'topic': 'quantitative', 'difficulty': 'hard', 'text': 'A cistern can be filled in 9 hours. Due to a leak it takes 10 hours. In how many hours will the leak empty the full cistern?', 'option_a': '90', 'option_b': '80', 'option_c': '70', 'option_d': '60', 'correct': 'A', 'explanation': 'Leak empties 1/9 - 1/10 = 1/90 per hour. So it takes 90 hours.'},
            # Verbal
            {'topic': 'verbal', 'difficulty': 'easy', 'text': 'Choose the synonym of ABUNDANT:', 'option_a': 'Scarce', 'option_b': 'Plentiful', 'option_c': 'Limited', 'option_d': 'Rare', 'correct': 'B', 'explanation': 'Abundant and Plentiful both mean present in large quantities.'},
            {'topic': 'verbal', 'difficulty': 'easy', 'text': 'Choose the antonym of BENEVOLENT:', 'option_a': 'Kind', 'option_b': 'Generous', 'option_c': 'Malevolent', 'option_d': 'Charitable', 'correct': 'C', 'explanation': 'Benevolent means well-wishing. Malevolent means wishing harm.'},
            {'topic': 'verbal', 'difficulty': 'medium', 'text': 'Fill in the blank: "The committee _____ to discuss the new policy."', 'option_a': 'meet', 'option_b': 'meets', 'option_c': 'met', 'option_d': 'meeting', 'correct': 'B', 'explanation': '"The committee" is singular, so it takes "meets" (present tense).'},
            {'topic': 'verbal', 'difficulty': 'medium', 'text': 'Identify the error: "Neither of the students have submitted their assignments."', 'option_a': 'Neither of', 'option_b': 'have submitted', 'option_c': 'their assignments', 'option_d': 'No error', 'correct': 'B', 'explanation': '"Neither" is singular. The correct verb is "has submitted".'},
            {'topic': 'verbal', 'difficulty': 'hard', 'text': 'Choose the word closest in meaning to LOQUACIOUS:', 'option_a': 'Silent', 'option_b': 'Talkative', 'option_c': 'Intelligent', 'option_d': 'Aggressive', 'correct': 'B', 'explanation': 'Loquacious means tending to talk a great deal; talkative.'},
        ]

        created_questions = []
        for qd in questions_data:
            q, _ = Question.objects.get_or_create(text=qd['text'], defaults=qd)
            created_questions.append(q)

        self.stdout.write(f'  Created {len(created_questions)} questions.')

        # Create tests
        admin_user = User.objects.filter(is_staff=True).first()
        topics = {'logical': 'Logical Reasoning', 'quantitative': 'Quantitative Aptitude', 'verbal': 'Verbal Ability'}
        for topic_key, topic_name in topics.items():
            for diff in ['easy', 'medium']:
                test, created = Test.objects.get_or_create(
                    title=f'{topic_name} — {diff.title()} Level',
                    defaults={
                        'topic': topic_key, 'difficulty': diff,
                        'time_limit': 20, 'is_active': True,
                        'created_by': admin_user,
                        'description': f'Test your {topic_name} skills at {diff} level.',
                    }
                )
                if created:
                    qs = [q for q in created_questions if q.topic == topic_key and q.difficulty == diff]
                    test.questions.set(qs)

        self.stdout.write('  Created tests.')

        # Coding problems
        coding_data = [
            {
                'title': 'Two Sum', 'slug': 'two-sum', 'difficulty': 'easy',
                'topic_tags': ['arrays', 'hashmap'],
                'description': 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
                'constraints': '2 ≤ nums.length ≤ 10⁴\n-10⁹ ≤ nums[i] ≤ 10⁹',
                'sample_input': '4\n2 7 11 15\n9', 'sample_output': '0 1',
                'explanation': 'nums[0] + nums[1] = 2 + 7 = 9 = target.',
                'test_cases': [
                    {'input': '4\n2 7 11 15\n9', 'expected_output': '0 1'},
                    {'input': '3\n3 2 4\n6', 'expected_output': '1 2'},
                    {'input': '2\n3 3\n6', 'expected_output': '0 1'},
                ]
            },
            {
                'title': 'Reverse a String', 'slug': 'reverse-string', 'difficulty': 'easy',
                'topic_tags': ['strings'],
                'description': 'Given a string s, return the reversed string.',
                'constraints': '1 ≤ s.length ≤ 10⁵',
                'sample_input': 'hello', 'sample_output': 'olleh',
                'explanation': 'Simply reverse the characters.',
                'test_cases': [
                    {'input': 'hello', 'expected_output': 'olleh'},
                    {'input': 'abcdef', 'expected_output': 'fedcba'},
                    {'input': 'a', 'expected_output': 'a'},
                ]
            },
            {
                'title': 'FizzBuzz', 'slug': 'fizzbuzz', 'difficulty': 'easy',
                'topic_tags': ['math', 'basics'],
                'description': 'Given an integer n, for each integer i from 1 to n:\n- Print "FizzBuzz" if i is divisible by both 3 and 5.\n- Print "Fizz" if i is divisible by 3.\n- Print "Buzz" if i is divisible by 5.\n- Otherwise print i.',
                'constraints': '1 ≤ n ≤ 10⁴',
                'sample_input': '5', 'sample_output': '1\n2\nFizz\n4\nBuzz',
                'explanation': '3 → Fizz, 5 → Buzz.',
                'test_cases': [
                    {'input': '5', 'expected_output': '1\n2\nFizz\n4\nBuzz'},
                    {'input': '15', 'expected_output': '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz'},
                ]
            },
            {
                'title': 'Fibonacci Sequence', 'slug': 'fibonacci', 'difficulty': 'medium',
                'topic_tags': ['dp', 'recursion'],
                'description': 'Given a number n, print the first n numbers of the Fibonacci sequence (0-indexed). F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).',
                'constraints': '1 ≤ n ≤ 50',
                'sample_input': '6', 'sample_output': '0 1 1 2 3 5',
                'explanation': 'The first 6 Fibonacci numbers.',
                'test_cases': [
                    {'input': '6', 'expected_output': '0 1 1 2 3 5'},
                    {'input': '1', 'expected_output': '0'},
                    {'input': '10', 'expected_output': '0 1 1 2 3 5 8 13 21 34'},
                ]
            },
            {
                'title': 'Check Prime', 'slug': 'check-prime', 'difficulty': 'medium',
                'topic_tags': ['math'],
                'description': 'Given an integer n, print "YES" if it is prime, otherwise "NO".',
                'constraints': '1 ≤ n ≤ 10⁶',
                'sample_input': '7', 'sample_output': 'YES',
                'explanation': '7 is only divisible by 1 and itself.',
                'test_cases': [
                    {'input': '7', 'expected_output': 'YES'},
                    {'input': '10', 'expected_output': 'NO'},
                    {'input': '2', 'expected_output': 'YES'},
                    {'input': '1', 'expected_output': 'NO'},
                ]
            },
            {
                'title': 'Maximum Subarray (Kadane\'s)', 'slug': 'max-subarray', 'difficulty': 'hard',
                'topic_tags': ['dp', 'arrays'],
                'description': 'Given an integer array nums, find the subarray with the largest sum and return its sum.',
                'constraints': '1 ≤ nums.length ≤ 10⁵\n-10⁴ ≤ nums[i] ≤ 10⁴',
                'sample_input': '9\n-2 1 -3 4 -1 2 1 -5 4', 'sample_output': '6',
                'explanation': 'Subarray [4,-1,2,1] has the largest sum = 6.',
                'test_cases': [
                    {'input': '9\n-2 1 -3 4 -1 2 1 -5 4', 'expected_output': '6'},
                    {'input': '1\n1', 'expected_output': '1'},
                    {'input': '5\n5 4 -1 7 8', 'expected_output': '23'},
                ]
            },
        ]

        for pd in coding_data:
            CodingProblem.objects.get_or_create(slug=pd['slug'], defaults=pd)
        self.stdout.write(f'  Created {len(coding_data)} coding problems.')

        # Companies
        companies_data = [
            {'name': 'Google', 'company_type': 'product', 'ctc_min': 20, 'ctc_max': 45, 'roles_offered': ['SWE', 'ML Engineer'], 'description': 'Global technology leader known for Search, Android, and Cloud.'},
            {'name': 'Microsoft', 'company_type': 'product', 'ctc_min': 18, 'ctc_max': 40, 'roles_offered': ['Software Engineer', 'PM'], 'description': 'Enterprise software and cloud computing giant.'},
            {'name': 'Amazon', 'company_type': 'product', 'ctc_min': 15, 'ctc_max': 35, 'roles_offered': ['SDE', 'Data Engineer'], 'description': 'World\'s largest e-commerce and cloud platform.'},
            {'name': 'TCS', 'company_type': 'service', 'ctc_min': 3.5, 'ctc_max': 7, 'roles_offered': ['Associate', 'Developer'], 'description': 'India\'s largest IT services company.'},
            {'name': 'Infosys', 'company_type': 'service', 'ctc_min': 3.6, 'ctc_max': 8, 'roles_offered': ['Systems Engineer', 'Python Dev'], 'description': 'Leading global IT consulting and services firm.'},
            {'name': 'Zoho', 'company_type': 'product', 'ctc_min': 5, 'ctc_max': 12, 'roles_offered': ['Software Engineer', 'UI Dev'], 'description': 'Indian SaaS company powering 50M+ users worldwide.'},
            {'name': 'Wipro', 'company_type': 'service', 'ctc_min': 3.5, 'ctc_max': 7, 'roles_offered': ['Project Engineer'], 'description': 'Global IT, consulting and BPO services.'},
            {'name': 'Cognizant', 'company_type': 'service', 'ctc_min': 4, 'ctc_max': 9, 'roles_offered': ['Programmer Analyst'], 'description': 'Fortune 500 IT services company.'},
        ]
        for cd in companies_data:
            Company.objects.get_or_create(name=cd['name'], defaults=cd)
        self.stdout.write(f'  Created {len(companies_data)} companies.')

        # Welcome notifications for all students
        for student in User.objects.filter(role='student'):
            if not student.notifications.exists():
                Notification.objects.create(
                    user=student, title='🎉 Welcome to PlacePortal!',
                    message='Your account is ready. Start practicing aptitude tests and coding problems!',
                    notif_type='success', link='/dashboard',
                )
        self.stdout.write('  Created welcome notifications.')
        self.stdout.write(self.style.SUCCESS('✅ Seed data created successfully!'))

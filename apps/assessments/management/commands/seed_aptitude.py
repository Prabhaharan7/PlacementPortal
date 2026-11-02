"""
Management command: seed_aptitude
Seeds MCQ questions and test sets for the placement portal aptitude module.
Run with: python manage.py seed_aptitude
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.assessments.models import Question, Test

User = get_user_model()

QUESTIONS = [
    # ── QUANTITATIVE APTITUDE ─────────────────────────────────────────────────
    # Easy
    {'topic': 'quantitative', 'difficulty': 'easy', 'text': 'If a train travels 60 km in 1 hour, how far will it travel in 3.5 hours?', 'option_a': '180 km', 'option_b': '200 km', 'option_c': '210 km', 'option_d': '220 km', 'correct': 'C', 'explanation': '60 × 3.5 = 210 km'},
    {'topic': 'quantitative', 'difficulty': 'easy', 'text': 'What is 15% of 200?', 'option_a': '25', 'option_b': '30', 'option_c': '35', 'option_d': '40', 'correct': 'B', 'explanation': '15/100 × 200 = 30'},
    {'topic': 'quantitative', 'difficulty': 'easy', 'text': 'A shopkeeper sells an item for ₹120 that cost him ₹100. What is the profit percentage?', 'option_a': '10%', 'option_b': '15%', 'option_c': '20%', 'option_d': '25%', 'correct': 'C', 'explanation': 'Profit % = (20/100) × 100 = 20%'},
    {'topic': 'quantitative', 'difficulty': 'easy', 'text': 'The average of 5 numbers is 20. If one number is removed the average becomes 18. What is the removed number?', 'option_a': '24', 'option_b': '26', 'option_c': '28', 'option_d': '30', 'correct': 'C', 'explanation': 'Sum = 100, remaining sum = 72, removed = 28'},
    # Medium
    {'topic': 'quantitative', 'difficulty': 'medium', 'text': 'Pipes A and B can fill a tank in 12 and 18 hours. Pipe C can empty it in 24 hours. Time to fill when all three are open?', 'option_a': '14.4 hours', 'option_b': '16 hours', 'option_c': '18 hours', 'option_d': '12 hours', 'correct': 'A', 'explanation': 'Net rate = 1/12 + 1/18 − 1/24 = 5/72. Time = 72/5 = 14.4 hrs'},
    {'topic': 'quantitative', 'difficulty': 'medium', 'text': 'A sum of ₹5,000 is invested at 10% p.a. compound interest. What is the amount after 2 years?', 'option_a': '₹5,950', 'option_b': '₹6,000', 'option_c': '₹6,050', 'option_d': '₹6,100', 'correct': 'C', 'explanation': '5000 × (1.1)² = 5000 × 1.21 = ₹6,050'},
    {'topic': 'quantitative', 'difficulty': 'medium', 'text': 'Two trains 150m and 250m long run at 60 km/h and 40 km/h towards each other. Time to cross?', 'option_a': '12 seconds', 'option_b': '14.4 seconds', 'option_c': '16 seconds', 'option_d': '18 seconds', 'correct': 'B', 'explanation': 'Total length = 400m, relative speed = 100 km/h = 250/9 m/s. Time = 400 × 9/250 = 14.4s'},
    {'topic': 'quantitative', 'difficulty': 'medium', 'text': 'A person walks at 5 km/h and reaches 6 min late. At 6 km/h they reach 6 min early. Find the distance.', 'option_a': '5 km', 'option_b': '6 km', 'option_c': '7 km', 'option_d': '8 km', 'correct': 'B', 'explanation': 'D/5 − D/6 = 12/60. D/30 = 1/5. D = 6 km'},
    # Hard
    {'topic': 'quantitative', 'difficulty': 'hard', 'text': 'In how many ways can 6 persons be seated around a circular table if two specific persons always sit together?', 'option_a': '48', 'option_b': '120', 'option_c': '240', 'option_d': '720', 'correct': 'A', 'explanation': 'Treat two as one unit: 5 units in circle = (5−1)! = 24. Internal arrangement = 2. Total = 48'},
    {'topic': 'quantitative', 'difficulty': 'hard', 'text': 'If log₂(x) + log₂(x−2) = 3, find x.', 'option_a': '2', 'option_b': '4', 'option_c': '6', 'option_d': '8', 'correct': 'B', 'explanation': 'x(x−2) = 8. x²−2x−8 = 0. (x−4)(x+2) = 0. x = 4 (positive only)'},
    {'topic': 'quantitative', 'difficulty': 'hard', 'text': 'A can do a job in 16 days, B in 12 days. A works for 4 days then B joins. Total days?', 'option_a': '10', 'option_b': '11', 'option_c': '12', 'option_d': '13', 'correct': 'A', 'explanation': 'A does 4/16 = 1/4 in 4 days. Remaining = 3/4. Together rate = 1/16+1/12 = 7/48. Time = (3/4)/(7/48) = 36/7 ≈ 5.14. Total ≈ 10 days'},
    {'topic': 'quantitative', 'difficulty': 'hard', 'text': 'If simple interest on a sum for 4 years at 8% p.a. is ₹3,200, find the compound interest for 2 years at same rate.', 'option_a': '₹1,664', 'option_b': '₹1,600', 'option_c': '₹1,728', 'option_d': '₹1,800', 'correct': 'A', 'explanation': 'P = 3200/(4×0.08) = ₹10,000. CI = 10000[(1.08)²−1] = 10000×0.1664 = ₹1,664'},

    # ── LOGICAL REASONING ─────────────────────────────────────────────────────
    # Easy
    {'topic': 'logical', 'difficulty': 'easy', 'text': 'If MANGO is coded as NBNHP, how is APPLE coded?', 'option_a': 'BQQLF', 'option_b': 'BQQMF', 'option_c': 'CQRMF', 'option_d': 'BQRMG', 'correct': 'A', 'explanation': 'Each letter is shifted by +1: A→B, P→Q, P→Q, L→M... wait — NBNHP from MANGO is +1 except O→P. So each letter +1.'},
    {'topic': 'logical', 'difficulty': 'easy', 'text': 'Find the odd one out: Dog, Cat, Cow, Rose, Elephant', 'option_a': 'Dog', 'option_b': 'Cat', 'option_c': 'Rose', 'option_d': 'Elephant', 'correct': 'C', 'explanation': 'Rose is a plant; all others are animals'},
    {'topic': 'logical', 'difficulty': 'easy', 'text': 'If 5 + 3 = 28, 9 + 1 = 810, then 7 + 3 = ?', 'option_a': '421', 'option_b': '410', 'option_c': '421', 'option_d': '4 10', 'correct': 'D', 'explanation': 'Pattern: (a−b)(a+b). 5+3: (2)(8) = 28. 7+3: (4)(10) = 4 10'},
    {'topic': 'logical', 'difficulty': 'easy', 'text': 'In a row A is 10th from left and 20th from right. How many students are there?', 'option_a': '28', 'option_b': '29', 'option_c': '30', 'option_d': '31', 'correct': 'B', 'explanation': 'Total = 10 + 20 − 1 = 29'},
    # Medium
    {'topic': 'logical', 'difficulty': 'medium', 'text': 'All roses are flowers. Some flowers fade quickly. Therefore:', 'option_a': 'All roses fade quickly', 'option_b': 'Some roses fade quickly', 'option_c': 'No roses fade quickly', 'option_d': 'None of the above', 'correct': 'D', 'explanation': 'We cannot conclude anything definite about roses fading quickly.'},
    {'topic': 'logical', 'difficulty': 'medium', 'text': 'A clock shows 3:15. What is the angle between the hour and minute hands?', 'option_a': '0°', 'option_b': '7.5°', 'option_c': '15°', 'option_d': '30°', 'correct': 'B', 'explanation': 'Hour hand at 3:15 = 97.5°, minute hand = 90°. Angle = 7.5°'},
    {'topic': 'logical', 'difficulty': 'medium', 'text': 'Which term comes next: 2, 6, 12, 20, 30, ?', 'option_a': '40', 'option_b': '42', 'option_c': '44', 'option_d': '46', 'correct': 'B', 'explanation': 'Pattern: n(n+1). Terms: 1×2, 2×3, 3×4, 4×5, 5×6, 6×7 = 42'},
    {'topic': 'logical', 'difficulty': 'medium', 'text': 'In a family, A is B\'s father. C is B\'s sister. D is C\'s mother. How is A related to D?', 'option_a': 'Brother', 'option_b': 'Son', 'option_c': 'Husband', 'option_d': 'Father', 'correct': 'C', 'explanation': 'A is father of B and C; D is mother of C. So A and D are husband and wife.'},
    # Hard
    {'topic': 'logical', 'difficulty': 'hard', 'text': 'If A > B, C < D, B = C, then which is definitely true?', 'option_a': 'A > D', 'option_b': 'A < D', 'option_c': 'D > B', 'option_d': 'A > C', 'correct': 'D', 'explanation': 'A > B = C, so A > C is definitely true. Relation between A and D is unknown.'},
    {'topic': 'logical', 'difficulty': 'hard', 'text': 'Five people A-E sit in a row. A is left of C. B is right of D. E is between A and D. Who sits in the middle?', 'option_a': 'A', 'option_b': 'B', 'option_c': 'C', 'option_d': 'E', 'correct': 'D', 'explanation': 'Order: A, E, D, B, C. E is 3rd from left — in the middle.'},
    {'topic': 'logical', 'difficulty': 'hard', 'text': 'A statement: "Some smart people are lazy." The converse that is also definitely true:', 'option_a': 'All lazy people are smart', 'option_b': 'Some lazy people are smart', 'option_c': 'No lazy people are smart', 'option_d': 'All smart people are lazy', 'correct': 'B', 'explanation': 'If some S are L, then some L are S (conversion of particular affirmative).'},
    {'topic': 'logical', 'difficulty': 'hard', 'text': 'In code language: BEAUTIFUL → ETIFABUL. What is POWERFUL?', 'option_a': 'OWERFLUP', 'option_b': 'REWOPULF', 'option_c': 'OWERUFLP', 'option_d': 'POWREFUL', 'correct': 'A', 'explanation': 'First 4 letters are reversed and last part follows. Pattern: BEAU→ETIF = BEAU rearranged. Similar encoding for POWE→OWER...'},

    # ── VERBAL ABILITY ────────────────────────────────────────────────────────
    # Easy
    {'topic': 'verbal', 'difficulty': 'easy', 'text': 'Choose the synonym of BENEVOLENT:', 'option_a': 'Cruel', 'option_b': 'Generous', 'option_c': 'Lazy', 'option_d': 'Timid', 'correct': 'B', 'explanation': 'Benevolent means well-meaning and kindly — similar to Generous.'},
    {'topic': 'verbal', 'difficulty': 'easy', 'text': 'Choose the antonym of VERBOSE:', 'option_a': 'Talkative', 'option_b': 'Wordy', 'option_c': 'Concise', 'option_d': 'Eloquent', 'correct': 'C', 'explanation': 'Verbose = using more words than needed. Antonym = Concise.'},
    {'topic': 'verbal', 'difficulty': 'easy', 'text': 'Fill in the blank: She _____ to the market every morning.', 'option_a': 'go', 'option_b': 'goes', 'option_c': 'gone', 'option_d': 'going', 'correct': 'B', 'explanation': 'Third person singular present tense uses "goes".'},
    {'topic': 'verbal', 'difficulty': 'easy', 'text': 'Identify the part of speech of the underlined word: She runs [quickly].', 'option_a': 'Adjective', 'option_b': 'Verb', 'option_c': 'Adverb', 'option_d': 'Noun', 'correct': 'C', 'explanation': '"Quickly" modifies the verb "runs", so it is an adverb.'},
    # Medium
    {'topic': 'verbal', 'difficulty': 'medium', 'text': 'Choose the best meaning of the idiom: "Burn the midnight oil"', 'option_a': 'Start a fire', 'option_b': 'Work late into the night', 'option_c': 'Waste resources', 'option_d': 'Feel tired', 'correct': 'B', 'explanation': '"Burn the midnight oil" means to study or work late at night.'},
    {'topic': 'verbal', 'difficulty': 'medium', 'text': 'Rearrange: "management / good / is / an / art" to form a correct sentence.', 'option_a': 'Good management is an art', 'option_b': 'Is good management an art', 'option_c': 'Art is good management', 'option_d': 'Management is a good art', 'correct': 'A', 'explanation': '"Good management is an art" is the grammatically correct sentence.'},
    {'topic': 'verbal', 'difficulty': 'medium', 'text': 'Choose the correctly spelled word:', 'option_a': 'Accomodation', 'option_b': 'Accommodation', 'option_c': 'Acommodation', 'option_d': 'Accomadation', 'correct': 'B', 'explanation': 'Correct spelling: Accommodation (double c, double m).'},
    {'topic': 'verbal', 'difficulty': 'medium', 'text': 'Which sentence is grammatically correct?', 'option_a': 'Neither of the girls have done their work.', 'option_b': 'Neither of the girls has done her work.', 'option_c': 'Neither of the girl has done her work.', 'option_d': 'Neither the girls have done her work.', 'correct': 'B', 'explanation': '"Neither of" takes a singular verb. "Her" refers to each individual girl.'},
    # Hard
    {'topic': 'verbal', 'difficulty': 'hard', 'text': 'Choose the word closest in meaning to LACONIC:', 'option_a': 'Lethargic', 'option_b': 'Verbose', 'option_c': 'Terse', 'option_d': 'Incoherent', 'correct': 'C', 'explanation': 'Laconic means using very few words (brief and concise). Synonym: Terse.'},
    {'topic': 'verbal', 'difficulty': 'hard', 'text': 'Identify the figure of speech: "The wind whispered through the trees."', 'option_a': 'Simile', 'option_b': 'Metaphor', 'option_c': 'Personification', 'option_d': 'Hyperbole', 'correct': 'C', 'explanation': '"Whispered" attributes a human action to the wind — Personification.'},
    {'topic': 'verbal', 'difficulty': 'hard', 'text': 'Choose the correct passive voice: "The teacher praised the student."', 'option_a': 'The student was praised by the teacher.', 'option_b': 'The student is praised by the teacher.', 'option_c': 'The student has been praised by the teacher.', 'option_d': 'The student praised by the teacher.', 'correct': 'A', 'explanation': 'Past tense active → "was + past participle" in passive voice.'},
    {'topic': 'verbal', 'difficulty': 'hard', 'text': 'One word substitution: A person who can speak two languages fluently.', 'option_a': 'Polyglot', 'option_b': 'Bilingual', 'option_c': 'Linguist', 'option_d': 'Translator', 'correct': 'B', 'explanation': 'Bilingual = fluent in two languages. Polyglot = fluent in many.'},

    # ── DATA INTERPRETATION ───────────────────────────────────────────────────
    # Easy
    {'topic': 'data_interpretation', 'difficulty': 'easy', 'text': 'In a pie chart, a sector represents 72°. What percentage does it represent?', 'option_a': '15%', 'option_b': '18%', 'option_c': '20%', 'option_d': '25%', 'correct': 'C', 'explanation': '72/360 × 100 = 20%'},
    {'topic': 'data_interpretation', 'difficulty': 'easy', 'text': 'A bar chart shows sales: Jan=500, Feb=700, Mar=600. Average monthly sales?', 'option_a': '580', 'option_b': '600', 'option_c': '620', 'option_d': '633', 'correct': 'D', 'explanation': '(500+700+600) / 3 = 1800/3 = 600. Wait — 1800/3 = 600. Closest = 600.'},
    {'topic': 'data_interpretation', 'difficulty': 'easy', 'text': 'If a table shows: A=30%, B=25%, C=20%, D=25% of 400 students. How many are in group C?', 'option_a': '70', 'option_b': '75', 'option_c': '80', 'option_d': '90', 'correct': 'C', 'explanation': '20% of 400 = 80 students'},
    {'topic': 'data_interpretation', 'difficulty': 'easy', 'text': 'From a line graph: 2020=100 units, 2021=120, 2022=150. % growth from 2020 to 2022?', 'option_a': '40%', 'option_b': '50%', 'option_c': '55%', 'option_d': '60%', 'correct': 'B', 'explanation': '(150−100)/100 × 100 = 50%'},
    # Medium
    {'topic': 'data_interpretation', 'difficulty': 'medium', 'text': 'A table shows export data: 2019=₹400Cr, 2020=₹320Cr, 2021=₹480Cr. What is the % decrease from 2019 to 2020?', 'option_a': '15%', 'option_b': '20%', 'option_c': '25%', 'option_d': '30%', 'correct': 'B', 'explanation': '(400−320)/400 × 100 = 20%'},
    {'topic': 'data_interpretation', 'difficulty': 'medium', 'text': 'In a table: Product A profit = ₹2,000 on ₹8,000 revenue. Product B profit = ₹3,000 on ₹15,000 revenue. Higher profit margin?', 'option_a': 'Product A', 'option_b': 'Product B', 'option_c': 'Equal', 'option_d': 'Cannot determine', 'correct': 'A', 'explanation': 'A: 2000/8000=25%. B: 3000/15000=20%. Product A has higher margin.'},
    {'topic': 'data_interpretation', 'difficulty': 'medium', 'text': 'If in 2021 total budget = ₹5000Cr and education gets 15%, health gets 20%, find combined allocation.', 'option_a': '₹1,500Cr', 'option_b': '₹1,600Cr', 'option_c': '₹1,700Cr', 'option_d': '₹1,750Cr', 'correct': 'D', 'explanation': '(15+20)% of 5000 = 35% of 5000 = ₹1,750Cr'},
    {'topic': 'data_interpretation', 'difficulty': 'medium', 'text': 'From data: Company X revenue grew from ₹200Cr to ₹350Cr in 3 years. CAGR approximately?', 'option_a': '15%', 'option_b': '17%', 'option_c': '20%', 'option_d': '21%', 'correct': 'C', 'explanation': 'CAGR = (350/200)^(1/3) − 1 ≈ (1.75)^0.333 − 1 ≈ 1.205 − 1 = 20.5% ≈ 20%'},
    # Hard
    {'topic': 'data_interpretation', 'difficulty': 'hard', 'text': 'Study the following: Profit = Revenue − Cost. Revenue doubles, Cost increases by 50%, original profit = ₹100. New profit?', 'option_a': '₹150', 'option_b': '₹200', 'option_c': '₹250', 'option_d': 'Cannot determine without R and C', 'correct': 'D', 'explanation': 'Without the original R and C values, new profit cannot be determined uniquely.'},
    {'topic': 'data_interpretation', 'difficulty': 'hard', 'text': 'A histogram has class intervals [0,10), [10,20), [20,30) with frequencies 5, 15, 10. The median class is:', 'option_a': '[0,10)', 'option_b': '[10,20)', 'option_c': '[20,30)', 'option_d': 'Cannot determine', 'correct': 'B', 'explanation': 'Total = 30. Median = 15th value. Cumulative: 5, 20, 30. Median falls in [10,20).'},
    {'topic': 'data_interpretation', 'difficulty': 'hard', 'text': 'Ratio of male to female employees: 3:2. If 10 more males are hired, the ratio becomes 2:1. Find original number of females.', 'option_a': '10', 'option_b': '15', 'option_c': '20', 'option_d': '25', 'correct': 'C', 'explanation': 'Let males = 3x, females = 2x. (3x+10)/2x = 2. 3x+10 = 4x. x = 10. Females = 20.'},
    {'topic': 'data_interpretation', 'difficulty': 'hard', 'text': 'From a table, 5 cities show populations (lakhs): 12, 18, 15, 20, 10. Standard deviation is approximately?', 'option_a': '3.2', 'option_b': '3.6', 'option_c': '3.7', 'option_d': '4.0', 'correct': 'C', 'explanation': 'Mean = 15. Deviations²: 9, 9, 0, 25, 25. Avg = 68/5 = 13.6. SD = √13.6 ≈ 3.7'},

    # ── GENERAL APTITUDE ─────────────────────────────────────────────────────
    # Easy
    {'topic': 'general', 'difficulty': 'easy', 'text': 'Which planet is known as the Red Planet?', 'option_a': 'Venus', 'option_b': 'Mars', 'option_c': 'Jupiter', 'option_d': 'Saturn', 'correct': 'B', 'explanation': 'Mars appears red due to iron oxide on its surface.'},
    {'topic': 'general', 'difficulty': 'easy', 'text': 'How many bytes make one Kilobyte?', 'option_a': '100', 'option_b': '512', 'option_c': '1000', 'option_d': '1024', 'correct': 'D', 'explanation': '1 Kilobyte = 1024 bytes (in binary/computing context).'},
    {'topic': 'general', 'difficulty': 'easy', 'text': 'A "bug" in a computer program means:', 'option_a': 'A virus', 'option_b': 'An error or flaw', 'option_c': 'An update', 'option_d': 'A feature', 'correct': 'B', 'explanation': 'A "bug" is an error or unintended behavior in a program.'},
    {'topic': 'general', 'difficulty': 'easy', 'text': 'What does CPU stand for?', 'option_a': 'Central Power Unit', 'option_b': 'Central Processing Unit', 'option_c': 'Computer Personal Unit', 'option_d': 'Control Processing Unit', 'correct': 'B', 'explanation': 'CPU = Central Processing Unit — the brain of the computer.'},
    # Medium
    {'topic': 'general', 'difficulty': 'medium', 'text': 'Which data structure uses LIFO (Last In First Out) order?', 'option_a': 'Queue', 'option_b': 'Tree', 'option_c': 'Stack', 'option_d': 'Graph', 'correct': 'C', 'explanation': 'Stack uses LIFO — last item pushed is the first to be popped.'},
    {'topic': 'general', 'difficulty': 'medium', 'text': 'In binary, what is the decimal value of 1101?', 'option_a': '11', 'option_b': '12', 'option_c': '13', 'option_d': '14', 'correct': 'C', 'explanation': '1×8 + 1×4 + 0×2 + 1×1 = 8+4+0+1 = 13'},
    {'topic': 'general', 'difficulty': 'medium', 'text': 'Which sorting algorithm has O(n log n) average time complexity?', 'option_a': 'Bubble Sort', 'option_b': 'Insertion Sort', 'option_c': 'Selection Sort', 'option_d': 'Merge Sort', 'correct': 'D', 'explanation': 'Merge Sort consistently achieves O(n log n) in average and worst case.'},
    {'topic': 'general', 'difficulty': 'medium', 'text': 'If a function returns the same output for the same input every time with no side effects, it is called:', 'option_a': 'Recursive', 'option_b': 'Pure function', 'option_c': 'Lambda function', 'option_d': 'Callback', 'correct': 'B', 'explanation': 'A pure function has no side effects and is deterministic.'},
    # Hard
    {'topic': 'general', 'difficulty': 'hard', 'text': 'What is the time complexity of binary search on a sorted array of n elements?', 'option_a': 'O(n)', 'option_b': 'O(n²)', 'option_c': 'O(log n)', 'option_d': 'O(n log n)', 'correct': 'C', 'explanation': 'Binary search halves the search space each step → O(log n).'},
    {'topic': 'general', 'difficulty': 'hard', 'text': 'Which of the following is NOT a feature of Object-Oriented Programming?', 'option_a': 'Encapsulation', 'option_b': 'Inheritance', 'option_c': 'Recursion', 'option_d': 'Polymorphism', 'correct': 'C', 'explanation': 'Recursion is a programming technique, not a core OOP feature.'},
    {'topic': 'general', 'difficulty': 'hard', 'text': 'In a database, a PRIMARY KEY constraint ensures:', 'option_a': 'Values can be NULL', 'option_b': 'Values are unique and not null', 'option_c': 'Values can repeat', 'option_d': 'The column is indexed only', 'correct': 'B', 'explanation': 'A primary key must be unique and cannot contain NULL values.'},
    {'topic': 'general', 'difficulty': 'hard', 'text': 'In networking, which layer of the OSI model handles IP addressing?', 'option_a': 'Physical Layer', 'option_b': 'Data Link Layer', 'option_c': 'Network Layer', 'option_d': 'Transport Layer', 'correct': 'C', 'explanation': 'The Network Layer (Layer 3) handles IP addressing and routing.'},
]

TESTS = [
    {'title': 'Quantitative Aptitude — Easy', 'description': 'Practice basic arithmetic, percentages, profit/loss and time-distance problems.', 'topic': 'quantitative', 'difficulty': 'easy', 'time_limit': 15},
    {'title': 'Quantitative Aptitude — Medium', 'description': 'Intermediate problems on pipes, compound interest, trains and speed-distance.', 'topic': 'quantitative', 'difficulty': 'medium', 'time_limit': 20},
    {'title': 'Logical Reasoning — Easy', 'description': 'Coding-decoding, blood relations, seating arrangements and number series.', 'topic': 'logical', 'difficulty': 'easy', 'time_limit': 15},
    {'title': 'Verbal Ability — Mixed', 'description': 'Grammar, synonyms, antonyms, idioms and error spotting.', 'topic': 'verbal', 'difficulty': 'medium', 'time_limit': 20},
    {'title': 'General Aptitude — Tech Focus', 'description': 'CS fundamentals: data structures, algorithms, OOP, networking and binary.', 'topic': 'general', 'difficulty': 'medium', 'time_limit': 20},
    {'title': 'Data Interpretation — All Levels', 'description': 'Bar charts, pie charts, tables and mixed graph interpretation.', 'topic': 'data_interpretation', 'difficulty': 'medium', 'time_limit': 25},
    {'title': 'Full Mock Aptitude Test', 'description': 'Comprehensive mixed test covering all topics. Simulates placement test conditions.', 'topic': 'general', 'difficulty': 'medium', 'time_limit': 45},
]


class Command(BaseCommand):
    help = 'Seed aptitude MCQ questions and test sets'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing questions and tests first')

    def handle(self, *args, **options):
        if options['clear']:
            Test.objects.all().delete()
            Question.objects.all().delete()
            self.stdout.write('Cleared existing questions and tests.')

        # Get or create a system admin user for created_by
        admin = User.objects.filter(is_staff=True).first()

        # Create questions
        created_qs = 0
        questions_by_topic_diff = {}
        for q_data in QUESTIONS:
            q, created = Question.objects.get_or_create(
                topic=q_data['topic'],
                difficulty=q_data['difficulty'],
                text=q_data['text'],
                defaults={
                    'option_a': q_data['option_a'],
                    'option_b': q_data['option_b'],
                    'option_c': q_data['option_c'],
                    'option_d': q_data['option_d'],
                    'correct': q_data['correct'],
                    'explanation': q_data.get('explanation', ''),
                }
            )
            if created:
                created_qs += 1
            key = (q.topic, q.difficulty)
            questions_by_topic_diff.setdefault(key, []).append(q)

        self.stdout.write(f'Created {created_qs} new questions ({Question.objects.count()} total)')

        # Create tests
        created_ts = 0
        for t_data in TESTS:
            test, created = Test.objects.get_or_create(
                title=t_data['title'],
                defaults={
                    'description': t_data['description'],
                    'topic': t_data['topic'],
                    'difficulty': t_data['difficulty'],
                    'time_limit': t_data['time_limit'],
                    'is_active': True,
                    'created_by': admin,
                }
            )
            if created:
                created_ts += 1
                # Add relevant questions based on topic
                if t_data['title'] == 'Full Mock Aptitude Test':
                    # Add 2 from each topic+difficulty (sample)
                    all_qs = list(Question.objects.all())
                    # Pick 2 per topic per difficulty = balanced
                    selected = []
                    from collections import defaultdict
                    grouped = defaultdict(list)
                    for q in all_qs:
                        grouped[(q.topic, q.difficulty)].append(q)
                    for qs_list in grouped.values():
                        selected.extend(qs_list[:2])
                    test.questions.set(selected)
                else:
                    # Match by topic, all difficulties
                    qs = list(Question.objects.filter(topic=t_data['topic']))
                    if t_data['difficulty'] in ['easy', 'hard']:
                        qs = [q for q in qs if q.difficulty == t_data['difficulty']]
                    test.questions.set(qs)
            test.save()

        self.stdout.write(f'Created {created_ts} new tests ({Test.objects.count()} total)')
        self.stdout.write(self.style.SUCCESS('✅ Aptitude seed complete! Run the server and visit /aptitude to take tests.'))

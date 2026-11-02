from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a student user for the PlacePortal React app'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username')
        parser.add_argument('--email', type=str, help='Email address')
        parser.add_argument('--password', type=str, help='Password')
        parser.add_argument('--first-name', type=str, default='', help='First name')
        parser.add_argument('--last-name', type=str, default='', help='Last name')
        parser.add_argument('--role', type=str, default='student', choices=['student', 'admin'], help='User role')

    def handle(self, *args, **options):
        username = options.get('username')
        email = options.get('email')
        password = options.get('password')
        first_name = options.get('first_name', '')
        last_name = options.get('last_name', '')
        role = options.get('role', 'student')

        # Interactive prompts if not provided
        if not username:
            username = input('Username: ').strip()
        if not email:
            email = input('Email: ').strip()
        if not password:
            import getpass
            password = getpass.getpass('Password: ')

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR(f'User "{username}" already exists.'))
            return

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.ERROR(f'Email "{email}" is already in use.'))
            return

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        user.role = role
        user.save()

        self.stdout.write(self.style.SUCCESS(
            f'\n✅ User created successfully!\n'
            f'   Username : {username}\n'
            f'   Email    : {email}\n'
            f'   Role     : {role}\n'
            f'\nYou can now login at http://localhost:3000/login\n'
        ))

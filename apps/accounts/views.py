from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from .forms import StudentRegistrationForm
from apps.resources.models import Resource

# --- Decorators ---

def admin_required(view_func):
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated and request.user.role == 'admin':
            return view_func(request, *args, **kwargs)
        return HttpResponseForbidden("You are not authorized")
    return wrapper

# --- Auth Views ---

def register_view(request):
    if request.method == 'POST':
        form = StudentRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.role = 'student'
            user.save()
            return redirect('login')
    else:
        form = StudentRegistrationForm()
    return render(request, 'accounts/register.html', {'form': form})

def login_view(request):
    """
    Student Login View.
    Also handles the default /login/ route.
    """
    if request.user.is_authenticated:
        if request.user.role == 'student':
            return redirect('student_dashboard')
        elif request.user.role == 'admin':
            return redirect('admin_dashboard')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user:
            if user.role == 'student':
                login(request, user)
                return redirect('student_dashboard')
            else:
                # User exists but is not a student (i.e. admin trying to login here)
                return render(request, 'accounts/student_login.html', {'error': 'Access Restricted to Students. Please use Admin Login.'})
        else:
            return render(request, 'accounts/student_login.html', {'error': 'Invalid credentials'})
    return render(request, 'accounts/student_login.html')

def admin_login_view(request):
    """
    Admin Login View.
    """
    if request.user.is_authenticated:
         if request.user.role == 'admin':
            return redirect('admin_dashboard')
         elif request.user.role == 'student':
            return redirect('student_dashboard')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user:
            if user.role == 'admin':
                login(request, user)
                return redirect('admin_dashboard')
            else:
                # User exists but is not an admin
                return render(request, 'accounts/admin_login.html', {'error': 'Access Restricted to Administrators.'})
        else:
            return render(request, 'accounts/admin_login.html', {'error': 'Invalid Admin credentials'})
    return render(request, 'accounts/admin_login.html')

def logout_view(request):
    logout(request)
    return redirect('login')

# --- Student Views ---

@login_required
def student_dashboard(request):
    # Mock data for the "Jobie" theme UI
    stats = {
        'topics_completed': 12,
        'quizzes_taken': 5,
        'avg_score': 85,
        'pending_tasks': 3
    }
    
    learning_path = [
        {'name': 'Aptitude Basics', 'unit': 'Unit 1: Logical Reasoning', 'progress': 80, 'icon': 'ri-calculator-line'},
        {'name': 'Python Core', 'unit': 'Unit 3: Data Structures', 'progress': 45, 'icon': 'ri-code-line'},
        {'name': 'Soft Skills', 'unit': 'Communication', 'progress': 90, 'icon': 'ri-mic-line'},
        {'name': 'DBMS', 'unit': 'SQL Queries', 'progress': 30, 'icon': 'ri-database-2-line'},
    ]
    
    context = {
        'stats': stats,
        'learning_path': learning_path
    }
    return render(request, 'student/dashboard.html', context)

# --- Admin Views ---

@admin_required
def admin_dashboard(request):
    # Mock data for Admin Dashboard
    stats = {
        'total_students': 120,
        'active_learners': 98,
        'avg_readiness': 72
    }
    
    students = [
        {'name': 'John Doe', 'dept': 'CSE', 'progress': 85},
        {'name': 'Jane Smith', 'dept': 'ECE', 'progress': 92},
        {'name': 'Mike Ross', 'dept': 'MECH', 'progress': 45},
        {'name': 'Rachel Green', 'dept': 'CSE', 'progress': 68},
        {'name': 'Harvey Specter', 'dept': 'IT', 'progress': 78},
    ]

    context = {
        'stats': stats,
        'students': students
    }
    return render(request, 'admin_panel/dashboard.html', context)

@admin_required
def upload_resource(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        category = request.POST.get('category')
        description = request.POST.get('description')
        file = request.FILES.get('file')
        link = request.POST.get('link')

        Resource.objects.create(
            title=title,
            category=category,
            description=description,
            file=file,
            link=link
        )
        return redirect('view_resources')

    return render(request, 'admin_panel/upload_resource.html')

@admin_required
def view_resources(request):
    resources = Resource.objects.all()
    return render(request, 'admin_panel/view_resources.html', {
        'resources': resources
    })

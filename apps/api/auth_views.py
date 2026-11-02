import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

User = get_user_model()

# Simple token store using Django's built-in token auth
# We'll use Django's built-in auth tokens via a simple dict in the session
# For a proper production app, use djangorestframework-simplejwt

def get_or_create_token(user):
    """Get or create an auth token for the user using Django's auth token."""
    from django.contrib.auth.models import User as DjangoUser
    try:
        from django.contrib.auth.tokens import default_token_generator
        token = default_token_generator.make_token(user)
        return token
    except Exception:
        import secrets
        return secrets.token_hex(32)


@csrf_exempt
@require_POST
def login_view(request):
    """
    POST /api/auth/login/
    Body: { "email": "...", "password": "...", "expected_role": "student"|"admin" }
    Returns: { "token": "...", "user": { ... } }
    """
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        expected_role = data.get('expected_role', '').strip()  # 'student' or 'admin'

        if not email or not password:
            return JsonResponse({'error': 'Email and password are required.'}, status=400)

        # Find user by email (use filter to avoid MultipleObjectsReturned)
        user_obj = User.objects.filter(email__iexact=email).first()
        if user_obj is None:
            return JsonResponse({'error': 'Invalid email or password.'}, status=401)
        username = user_obj.username

        # Authenticate using username + password
        user = authenticate(request, username=username, password=password)

        if user is None:
            return JsonResponse({'error': 'Invalid email or password.'}, status=401)

        if not user.is_active:
            return JsonResponse({'error': 'Account is disabled.'}, status=403)

        # ── Role enforcement ─────────────────────────────────────────────────
        is_admin = user.is_staff or getattr(user, 'role', '') == 'admin'

        if expected_role == 'student' and is_admin:
            return JsonResponse(
                {'error': 'Invalid email or password. Please use the Admin Login panel.'},
                status=403
            )
        if expected_role == 'admin' and not is_admin:
            return JsonResponse(
                {'error': 'Invalid email or password. Please use the Student Login panel.'},
                status=403
            )
        # ─────────────────────────────────────────────────────────────────────

        try:
            import secrets as _secrets
            token = _secrets.token_hex(32)
            from django.core.signing import Signer
            signer = Signer()
            signed_token = signer.sign(f"{user.pk}:{token}")
        except Exception as sign_err:
            return JsonResponse({'error': f'Token generation failed: {sign_err}'}, status=500)

        return JsonResponse({
            'token': signed_token,
            'user': {
                'id': user.pk,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': getattr(user, 'role', 'student'),
                'is_staff': user.is_staff,
            }
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_POST
def signup_view(request):
    """
    POST /api/auth/signup/
    Body: { "first_name": "...", "last_name": "...", "email": "...", "password": "..." }
    Returns: { "token": "...", "user": { ... } }
    """
    try:
        data = json.loads(request.body)
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()

        if not first_name or not email or not password:
            return JsonResponse({'error': 'First name, email, and password are required.'}, status=400)

        if User.objects.filter(email__iexact=email).exists():
            return JsonResponse({'error': 'An account with this email already exists.'}, status=400)

        # Generate unique username
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        user.role = 'student'
        user.save()

        try:
            import secrets as _secrets
            token = _secrets.token_hex(32)
            from django.core.signing import Signer
            signer = Signer()
            signed_token = signer.sign(f"{user.pk}:{token}")
        except Exception as sign_err:
            return JsonResponse({'error': f'Token generation failed: {sign_err}'}, status=500)

        return JsonResponse({
            'token': signed_token,
            'user': {
                'id': user.pk,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_staff': user.is_staff,
            }
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
@require_POST
def logout_view(request):
    """
    POST /api/auth/logout/
    Clears the auth token.
    """
    # Token is stateless (signed), so just return success
    return JsonResponse({'message': 'Logged out successfully.'})


@require_GET
def current_user_view(request):
    """
    GET /api/auth/user/
    Returns the current authenticated user based on token.
    """
    auth_header = request.headers.get('Authorization', '')

    if not auth_header.startswith('Token '):
        return JsonResponse({'error': 'Authentication required.'}, status=401)

    token = auth_header[6:]  # Strip "Token "

    try:
        from django.core.signing import Signer, BadSignature
        signer = Signer()
        unsigned = signer.unsign(token)
        user_pk, _ = unsigned.split(':', 1)
        user = User.objects.get(pk=int(user_pk))

        return JsonResponse({
            'id': user.pk,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': getattr(user, 'role', 'student'),
            'is_staff': user.is_staff,
            'bio': getattr(user, 'bio', ''),
            'phone': getattr(user, 'phone', ''),
            'roll_number': getattr(user, 'roll_number', ''),
            'branch': getattr(user, 'branch', ''),
            'batch_year': getattr(user, 'batch_year', ''),
            'linkedin': getattr(user, 'linkedin', ''),
            'github': getattr(user, 'github', ''),
            'skills': getattr(user, 'skills', []),
        })
    except Exception:
        return JsonResponse({'error': 'Invalid or expired token.'}, status=401)


@csrf_exempt
@require_POST
def update_profile_view(request):
    """
    POST /api/auth/profile/
    Updates the current authenticated user's profile.
    """
    auth_header = request.headers.get('Authorization', '')

    if not auth_header.startswith('Token '):
        return JsonResponse({'error': 'Authentication required.'}, status=401)

    token = auth_header[6:]

    try:
        from django.core.signing import Signer
        signer = Signer()
        unsigned = signer.unsign(token)
        user_pk, _ = unsigned.split(':', 1)
        user = User.objects.get(pk=int(user_pk))
    except Exception:
        return JsonResponse({'error': 'Invalid or expired token.'}, status=401)

    try:
        data = json.loads(request.body)
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.phone = data.get('phone', user.phone)
        user.bio = data.get('bio', user.bio)
        user.roll_number = data.get('roll_number', user.roll_number)
        user.branch = data.get('branch', user.branch)
        
        batch_year = data.get('batch_year')
        if batch_year is not None:
            if batch_year == '':
                user.batch_year = None
            else:
                try:
                    user.batch_year = int(batch_year)
                except ValueError:
                    pass
        user.linkedin = data.get('linkedin', user.linkedin)
        user.github = data.get('github', user.github)
        user.skills = data.get('skills', user.skills)
        user.save()

        return JsonResponse({'message': 'Profile updated successfully.'})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

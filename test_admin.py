import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement_portal.settings')
django.setup()

from django.test import Client
from django.core.signing import Signer
from django.contrib.auth import get_user_model

User = get_user_model()

student_user = User.objects.filter(username='student1').first()
if not student_user:
    print("No student user found")
    exit(1)

token = Signer().sign(str(student_user.pk))
from django.test import RequestFactory
from apps.api.views import notifications_list

req = RequestFactory().get('/api/notifications/', HTTP_AUTHORIZATION=f'Token {token}')
req.current_user = student_user

try:
    res = notifications_list(req)
    print(res.content)
except Exception as e:
    import traceback
    traceback.print_exc()

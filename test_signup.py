import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement_portal.settings')
django.setup()

from django.test import RequestFactory
import json
from apps.api.auth_views import signup_view
from django.contrib.auth import get_user_model
User = get_user_model()

print(f"Users matching before signup: {User.objects.filter(email='new_test_student@example.com').count()}")

req = RequestFactory().post('/api/auth/signup/', json.dumps({
    'first_name': 'Test',
    'last_name': 'Student',
    'email': 'new_test_student@example.com',
    'password': 'password123'
}), content_type='application/json')

res = signup_view(req)
print(f"Status Code: {res.status_code}")
print(f"Response: {res.content}")

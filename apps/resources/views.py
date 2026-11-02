from django.shortcuts import render
from .models import Resource

def resource_list(request):
    resources = Resource.objects.all().order_by('-created_at')
    return render(request, 'student/resources.html', {'resources': resources})

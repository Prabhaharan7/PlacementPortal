from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from django.conf import settings
from django.conf.urls.static import static

def home_redirect(request):
    return redirect('login')

urlpatterns = [
    path('', home_redirect),
    path('admin/', admin.site.urls),
    path('api/', include('apps.api.urls')),  # Connect API endpoints
    path('', include('apps.accounts.urls')),
    path('', include('apps.resources.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

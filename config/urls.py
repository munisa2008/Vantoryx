from django.contrib import admin
from django.urls import path, include
from apps.nexa.views import recorder_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', recorder_view),
    path('api/', include('apps.nexa.urls')),
]

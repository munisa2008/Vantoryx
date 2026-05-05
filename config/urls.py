from django.contrib import admin
from django.urls import path, include, re_path
from apps.nexa.views import recorder_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.nexa.urls')),
    re_path(r'^.*$', recorder_view),
]

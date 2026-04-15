from django.urls import path
from .views import AudioTaskCreateView, AudioTaskDetailView, ping, text_scam, link_analysis
from .views import recorder_view



urlpatterns = [
    path('ping/', ping),
    path('text/', text_scam),
    path('link/', link_analysis),
    path('audio-tasks/', AudioTaskCreateView.as_view()),
    path('audio-tasks/<int:pk>/', AudioTaskDetailView.as_view()),
    path('', recorder_view),
]

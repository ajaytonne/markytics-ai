from django.urls import path
from .views import (
    ApplicationCreateView,
    CandidateApplicationsListView,
    RecruiterApplicantsListView,
    ApplicationDetailView,
    ApplicationStatusUpdateView,
    ApplicationResumeDownloadView
)

urlpatterns = [
    path('', ApplicationCreateView.as_view(), name='application-create'),
    path('my/', CandidateApplicationsListView.as_view(), name='applications-my'),
    path('recruiter/', RecruiterApplicantsListView.as_view(), name='applications-recruiter'),
    path('<int:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
    path('<int:pk>/status/', ApplicationStatusUpdateView.as_view(), name='application-status-update'),
    path('<int:pk>/resume/', ApplicationResumeDownloadView.as_view(), name='application-resume-download'),
]

from django.urls import path
from .views import CandidateProfileView, RecruiterProfileView, CandidateSearchView

urlpatterns = [
    path('candidate/', CandidateProfileView.as_view(), name='profile-candidate'),
    path('recruiter/', RecruiterProfileView.as_view(), name='profile-recruiter'),
    path('search/', CandidateSearchView.as_view(), name='candidates-search'),
]

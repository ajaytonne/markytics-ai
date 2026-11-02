from django.urls import path
from .views import CandidateDashboardView, RecruiterDashboardView, AdminDashboardView

urlpatterns = [
    path('candidate/', CandidateDashboardView.as_view(), name='dashboard-candidate'),
    path('recruiter/', RecruiterDashboardView.as_view(), name='dashboard-recruiter'),
    path('admin/', AdminDashboardView.as_view(), name='dashboard-admin'),
]

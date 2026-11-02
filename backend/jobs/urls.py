from django.urls import path
from .views import JobListView, JobDetailView, JobStatusToggleView, JobCategoryListView, SkillListView

urlpatterns = [
    path('', JobListView.as_view(), name='job-list'),
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('<int:pk>/status/', JobStatusToggleView.as_view(), name='job-status-toggle'),
]

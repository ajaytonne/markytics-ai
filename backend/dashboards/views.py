from rest_framework import views, response, permissions, status
from accounts.models import User
from jobs.models import Job
from applications.models import Application
from notifications.models import EmailNotification
from accounts.permissions import IsCandidate, IsRecruiter, IsAdminUserRole

class CandidateDashboardView(views.APIView):
    permission_classes = [IsCandidate]

    def get(self, request):
        my_apps = Application.objects.filter(candidate=request.user)
        status_counts = {
            'APPLIED': my_apps.filter(status='APPLIED').count(),
            'SHORTLISTED': my_apps.filter(status='SHORTLISTED').count(),
            'INTERVIEW': my_apps.filter(status='INTERVIEW').count(),
            'REJECTED': my_apps.filter(status='REJECTED').count(),
            'HIRED': my_apps.filter(status='HIRED').count(),
        }
        recent_apps = my_apps.order_by('-applied_at')[:5]
        from applications.serializers import ApplicationSerializer

        return response.Response({
            'total_applications': my_apps.count(),
            'status_counts': status_counts,
            'recent_activity': ApplicationSerializer(recent_apps, many=True).data
        })

class RecruiterDashboardView(views.APIView):
    permission_classes = [IsRecruiter]

    def get(self, request):
        user = request.user
        owned_jobs = Job.objects.filter(recruiter=user)
        open_jobs_count = owned_jobs.filter(status=Job.Status.OPEN).count()
        owned_job_ids = owned_jobs.values_list('id', flat=True)

        owned_apps = Application.objects.filter(job_id__in=owned_job_ids)

        status_counts = {
            'APPLIED': owned_apps.filter(status='APPLIED').count(),
            'SHORTLISTED': owned_apps.filter(status='SHORTLISTED').count(),
            'INTERVIEW': owned_apps.filter(status='INTERVIEW').count(),
            'REJECTED': owned_apps.filter(status='REJECTED').count(),
            'HIRED': owned_apps.filter(status='HIRED').count(),
        }

        recent_applicants = owned_apps.order_by('-applied_at')[:5]
        from applications.serializers import ApplicationSerializer

        return response.Response({
            'open_jobs_count': open_jobs_count,
            'total_applications': owned_apps.count(),
            'shortlisted_count': status_counts['SHORTLISTED'],
            'interview_count': status_counts['INTERVIEW'],
            'hired_count': status_counts['HIRED'],
            'status_counts': status_counts,
            'recent_applicants': ApplicationSerializer(recent_applicants, many=True).data
        })

class AdminDashboardView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        total_users = User.objects.count()
        users_by_role = {
            'ADMIN': User.objects.filter(role=User.Role.ADMIN).count(),
            'RECRUITER': User.objects.filter(role=User.Role.RECRUITER).count(),
            'CANDIDATE': User.objects.filter(role=User.Role.CANDIDATE).count(),
        }

        # Jobs posted means jobs published at least once
        total_jobs_posted = Job.objects.filter(published_at__isnull=False).count()
        open_jobs_count = Job.objects.filter(status=Job.Status.OPEN).count()
        total_applications = Application.objects.count()
        successful_hires = Application.objects.filter(status=Application.Status.HIRED).count()

        return response.Response({
            'total_users': total_users,
            'users_by_role': users_by_role,
            'total_jobs_posted': total_jobs_posted,
            'open_jobs_count': open_jobs_count,
            'total_applications': total_applications,
            'successful_hires': successful_hires,
            'outbox_count': EmailNotification.objects.count()
        })

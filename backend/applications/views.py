from rest_framework import generics, permissions, status, response, views
from django.utils import timezone
from django.http import FileResponse, Http404
from django.db import transaction
from .models import Application, ApplicationStatusHistory
from .serializers import ApplicationSerializer
from jobs.models import Job
from accounts.permissions import IsCandidate, IsRecruiter
from notifications.models import EmailNotification

class ApplicationCreateView(generics.CreateAPIView):
    permission_classes = [IsCandidate]
    serializer_class = ApplicationSerializer

    def create(self, request, *args, **kwargs):
        job_id = request.data.get('job')
        if not job_id:
            return response.Response({'detail': 'Job ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = Job.objects.get(pk=job_id)
        except Job.DoesNotExist:
            return response.Response({'detail': 'Job posting does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        if job.status != Job.Status.OPEN:
            return response.Response({'detail': 'Applications rejected: Job is not currently open.'}, status=status.HTTP_400_BAD_REQUEST)

        if job.application_deadline and job.application_deadline < timezone.now():
            return response.Response({'detail': 'Applications rejected: Application deadline has passed.'}, status=status.HTTP_400_BAD_REQUEST)

        # Duplicate check
        if Application.objects.filter(job=job, candidate=request.user).exists():
            return response.Response({'detail': 'You have already submitted an application for this job.'}, status=status.HTTP_400_BAD_REQUEST)

        resume_file = request.FILES.get('resume')
        if not resume_file:
            return response.Response({'detail': 'PDF Resume upload is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if resume_file.size > 5 * 1024 * 1024:
            return response.Response({'detail': 'Resume file exceeds 5MB maximum size limit.'}, status=status.HTTP_400_BAD_REQUEST)

        if not (resume_file.name.lower().endswith('.pdf') or resume_file.content_type == 'application/pdf'):
            return response.Response({'detail': 'Only PDF files are allowed.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            app = Application.objects.create(
                job=job,
                candidate=request.user,
                resume_file=resume_file,
                original_resume_name=resume_file.name,
                cover_letter=request.data.get('cover_letter', '')
            )
            ApplicationStatusHistory.objects.create(
                application=app,
                previous_status='NONE',
                new_status=Application.Status.APPLIED,
                actor=request.user,
                candidate_message='Application submitted successfully.'
            )

        return response.Response(ApplicationSerializer(app).data, status=status.HTTP_201_CREATED)

class CandidateApplicationsListView(generics.ListAPIView):
    permission_classes = [IsCandidate]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(candidate=self.request.user).order_by('-applied_at')

class RecruiterApplicantsListView(generics.ListAPIView):
    permission_classes = [IsRecruiter]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Application.objects.all()
        if user.role != 'ADMIN':
            owned_job_ids = Job.objects.filter(recruiter=user).values_list('id', flat=True)
            qs = qs.filter(job_id__in=owned_job_ids)

        job_id = self.request.query_params.get('job_id')
        if job_id:
            qs = qs.filter(job_id=job_id)

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        return qs.order_by('-applied_at')

class ApplicationDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ApplicationSerializer
    queryset = Application.objects.all()

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        user = request.user
        is_cand_owner = user.role == 'CANDIDATE' and obj.candidate == user
        is_rec_owner = user.role == 'RECRUITER' and obj.job.recruiter == user
        is_admin = user.role == 'ADMIN'
        if not (is_cand_owner or is_rec_owner or is_admin):
            self.permission_denied(request, message="Unauthorized access to application record.")

class ApplicationStatusUpdateView(views.APIView):
    permission_classes = [IsRecruiter]

    def post(self, request, pk):
        try:
            app = Application.objects.get(pk=pk)
        except Application.DoesNotExist:
            return response.Response({'detail': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'ADMIN' and app.job.recruiter != request.user:
            return response.Response({'detail': 'You do not own this job posting.'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('new_status')
        candidate_msg = request.data.get('candidate_message', '')

        if new_status not in Application.Status.values:
            return response.Response({'detail': f'Invalid status choice {new_status}.'}, status=status.HTTP_400_BAD_REQUEST)

        current_status = app.status

        # Idempotency check
        if current_status == new_status:
            return response.Response({'detail': 'Application is already in this status. No changes made.'})

        allowed_transitions = {
            'APPLIED': ['SHORTLISTED', 'REJECTED'],
            'SHORTLISTED': ['INTERVIEW', 'REJECTED'],
            'INTERVIEW': ['HIRED', 'REJECTED'],
            'REJECTED': [],
            'HIRED': []
        }

        if request.user.role != 'ADMIN' and new_status not in allowed_transitions.get(current_status, []):
            return response.Response({
                'detail': f'Invalid status transition from {current_status} to {new_status}.'
            }, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            app.status = new_status
            app.save()

            history = ApplicationStatusHistory.objects.create(
                application=app,
                previous_status=current_status,
                new_status=new_status,
                actor=request.user,
                candidate_message=candidate_msg
            )

            EmailNotification.objects.create(
                event_ref=f"{app.id}:{new_status}",
                recipient_email=app.candidate.email,
                subject=f"Application Update: {new_status} for {app.job.title}",
                template_id="STATUS_CHANGE_NOTIFICATION",
                render_data={
                    "candidate_name": f"{app.candidate.first_name} {app.candidate.last_name}",
                    "job_title": app.job.title,
                    "previous_status": current_status,
                    "new_status": new_status,
                    "candidate_message": candidate_msg
                },
                delivery_state="SENT"
            )

        return response.Response({
            'detail': f'Application status updated to {new_status}.',
            'application': ApplicationSerializer(app).data
        })

class ApplicationResumeDownloadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            app = Application.objects.get(pk=pk)
        except Application.DoesNotExist:
            raise Http404("Application not found.")

        user = request.user
        is_cand_owner = user.role == 'CANDIDATE' and app.candidate == user
        is_rec_owner = user.role == 'RECRUITER' and app.job.recruiter == user
        is_admin = user.role == 'ADMIN'

        if not (is_cand_owner or is_rec_owner or is_admin):
            return response.Response({'detail': 'Forbidden: You do not have permission to download this resume.'}, status=status.HTTP_403_FORBIDDEN)

        if not app.resume_file:
            raise Http404("Resume file not found.")

        resp = FileResponse(app.resume_file.open('rb'), content_type='application/pdf')
        resp['Content-Disposition'] = f'attachment; filename="{app.original_resume_name or "Resume.pdf"}"'
        return resp

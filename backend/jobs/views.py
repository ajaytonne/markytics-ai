from rest_framework import generics, permissions, status, response, views
from django.utils import timezone
from django.db.models import Q
from .models import Job, JobCategory, Skill
from .serializers import JobSerializer, JobCategorySerializer, SkillSerializer
from accounts.permissions import IsRecruiter

class JobCategoryListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer

class SkillListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

class JobListView(generics.ListCreateAPIView):
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsRecruiter()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        scope = self.request.query_params.get('scope')

        if scope == 'owned' and user.is_authenticated and user.role in ['RECRUITER', 'ADMIN']:
            qs = Job.objects.filter(recruiter=user)
        elif scope == 'all' and user.is_authenticated and user.role == 'ADMIN':
            qs = Job.objects.all()
        else:
            # Public/Candidate View
            now = timezone.now()
            qs = Job.objects.filter(status=Job.Status.OPEN).filter(
                Q(application_deadline__isnull=True) | Q(application_deadline__gt=now)
            )

        # Filters
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search) |
                Q(skills__icontains=search)
            )

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category_id=category)

        location = self.request.query_params.get('location')
        if location:
            qs = qs.filter(location__icontains=location)

        skills = self.request.query_params.get('skills')
        if skills:
            skill_list = [s.strip() for s in skills.split(',') if s.strip()]
            for sk in skill_list:
                qs = qs.filter(skills__icontains=sk)

        min_exp = self.request.query_params.get('min_experience')
        if min_exp and min_exp.isdigit():
            qs = qs.filter(max_experience__gte=int(min_exp))

        min_sal = self.request.query_params.get('min_salary')
        if min_sal and min_sal.isdigit():
            qs = qs.filter(max_salary__gte=int(min_sal))

        emp_type = self.request.query_params.get('employment_type')
        if emp_type:
            qs = qs.filter(employment_type=emp_type)

        wp_type = self.request.query_params.get('workplace_type')
        if wp_type:
            qs = qs.filter(workplace_type=wp_type)

        return qs.order_by('-published_at', '-created_at')

    def perform_create(self, serializer):
        serializer.save(recruiter=self.request.user)

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsRecruiter()]
        return [permissions.AllowAny()]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            if request.user.role != 'ADMIN' and obj.recruiter != request.user:
                self.permission_denied(request, message="You do not have permission to modify this job posting.")
        elif obj.status == Job.Status.DRAFT:
            if not request.user.is_authenticated or (request.user.role != 'ADMIN' and obj.recruiter != request.user):
                self.permission_denied(request, message="Draft jobs are private.")

class JobStatusToggleView(views.APIView):
    permission_classes = [IsRecruiter]

    def post(self, request, pk):
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            return response.Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'ADMIN' and job.recruiter != request.user:
            return response.Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        if new_status not in [Job.Status.OPEN, Job.Status.CLOSED, Job.Status.DRAFT]:
            return response.Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

        job.status = new_status
        if new_status == Job.Status.OPEN and not job.published_at:
            job.published_at = timezone.now()
        job.save()

        return response.Response({'detail': f'Job status updated to {new_status}.', 'job': JobSerializer(job).data})

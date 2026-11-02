from rest_framework import status, views, response, permissions, generics
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from .models import User, CandidateProfile, RecruiterProfile
from .serializers import UserSerializer, RegisterSerializer, CandidateProfileSerializer, RecruiterProfileSerializer
from .permissions import IsCandidate, IsRecruiter, IsAdminUserRole

class CSRFInitializeView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        csrf_token = get_token(request)
        return response.Response({'detail': 'CSRF cookie initialized', 'csrfToken': csrf_token})

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return response.Response({'detail': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, email=email, password=password)

        if not user or not user.is_active:
            return response.Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        login(request, user)
        return response.Response({
            'detail': 'Login successful.',
            'user': UserSerializer(user).data
        })

class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return response.Response({'detail': 'Logged out successfully.'})

class CurrentUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        data = UserSerializer(user).data
        if user.role == User.Role.CANDIDATE:
            prof = CandidateProfile.objects.filter(user=user).first()
            data['profile'] = CandidateProfileSerializer(prof).data if prof else None
        elif user.role == User.Role.RECRUITER:
            prof = RecruiterProfile.objects.filter(user=user).first()
            data['profile'] = RecruiterProfileSerializer(prof).data if prof else None
        return response.Response(data)

class PasswordResetRequestView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        import secrets
        import hashlib
        from datetime import timedelta
        from django.utils import timezone
        from .models import PasswordResetToken

        email = request.data.get('email')
        if email:
            user = User.objects.filter(email__iexact=email, is_active=True).first()
            if user:
                raw_token = secrets.token_hex(24)
                token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
                expires_at = timezone.now() + timedelta(hours=1)

                PasswordResetToken.objects.create(
                    user=user,
                    token_hash=token_hash,
                    expires_at=expires_at,
                    used=False
                )

                from notifications.models import EmailNotification
                EmailNotification.objects.create(
                    event_ref=f"password-reset:{user.id}",
                    recipient_email=user.email,
                    subject="Password Reset Request - Markytics Job Portal",
                    template_id="PASSWORD_RESET",
                    render_data={
                        "name": f"{user.first_name} {user.last_name}",
                        "reset_token": raw_token,
                        "expires_in": "1 hour"
                    },
                    delivery_state="PENDING"
                )

        return response.Response({
            'detail': 'If an account exists with this email address, a password reset link has been dispatched to your email outbox.'
        })

class PasswordResetConfirmView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        import hashlib
        from django.utils import timezone
        from .models import PasswordResetToken

        token = request.data.get('token')
        new_password = request.data.get('new_password') or request.data.get('password')

        if not token or not new_password:
            return response.Response(
                {'detail': 'Reset token and new password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return response.Response(
                {'detail': 'New password must be at least 8 characters long.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        token_obj = PasswordResetToken.objects.filter(token_hash=token_hash, used=False).first()

        if not token_obj or not token_obj.is_valid():
            return response.Response(
                {'detail': 'Invalid or expired password reset token.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = token_obj.user
        user.set_password(new_password)
        user.save()

        token_obj.used = True
        token_obj.save()

        return response.Response({'detail': 'Password has been successfully updated.'})


class CandidateProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsCandidate]
    serializer_class = CandidateProfileSerializer

    def get_object(self):
        prof, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return prof

class RecruiterProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsRecruiter]
    serializer_class = RecruiterProfileSerializer

    def get_object(self):
        prof, _ = RecruiterProfile.objects.get_or_create(user=self.request.user)
        return prof

class CandidateSearchView(generics.ListAPIView):
    permission_classes = [IsRecruiter]
    serializer_class = CandidateProfileSerializer

    def get_queryset(self):
        user = self.request.user
        from applications.models import Application
        from jobs.models import Job

        owned_job_ids = Job.objects.filter(recruiter=user).values_list('id', flat=True)
        applicant_ids = Application.objects.filter(job_id__in=owned_job_ids).values_list('candidate_id', flat=True)

        qs = CandidateProfile.objects.all()
        if user.role != User.Role.ADMIN:
            qs = qs.filter(
                models.Q(search_visibility=CandidateProfile.SearchVisibility.PUBLIC) |
                models.Q(user_id__in=applicant_ids)
            )

        q = self.request.query_params.get('query')
        if q:
            qs = qs.filter(
                models.Q(headline__icontains=q) |
                models.Q(bio__icontains=q) |
                models.Q(user__first_name__icontains=q) |
                models.Q(user__last_name__icontains=q)
            )

        skill = self.request.query_params.get('skill')
        if skill:
            qs = qs.filter(skills__icontains=skill)

        min_exp = self.request.query_params.get('min_exp')
        if min_exp and min_exp.isdigit():
            qs = qs.filter(years_of_experience__gte=int(min_exp))

        return qs

from rest_framework import serializers
from .models import Application, ApplicationStatusHistory
from accounts.models import CandidateProfile, RecruiterProfile

class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodSerializer()

    class Meta:
        model = ApplicationStatusHistory
        fields = ['id', 'application', 'previous_status', 'new_status', 'actor_id', 'actor_name', 'candidate_message', 'timestamp']

    def get_actor_name(self, obj):
        if obj.actor:
            return f"{obj.actor.first_name} {obj.actor.last_name} ({obj.actor.role})"
        return "System"

class ApplicationSerializer(serializers.ModelSerializer):
    candidate_name = serializers.SerializerMethodSerializer()
    candidate_email = serializers.SerializerMethodSerializer()
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.SerializerMethodSerializer()
    candidate_profile = serializers.SerializerMethodSerializer()
    history = ApplicationStatusHistorySerializer(source='status_history', many=True, read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'job', 'candidate', 'resume_file', 'original_resume_name',
            'cover_letter', 'status', 'applied_at', 'updated_at',
            'candidate_name', 'candidate_email', 'job_title', 'company_name',
            'candidate_profile', 'history'
        ]
        read_only_fields = ['id', 'candidate', 'status', 'applied_at', 'updated_at']

    def get_candidate_name(self, obj):
        return f"{obj.candidate.first_name} {obj.candidate.last_name}"

    def get_candidate_email(self, obj):
        return obj.candidate.email

    def get_company_name(self, obj):
        prof = RecruiterProfile.objects.filter(user=obj.job.recruiter).first()
        return prof.company_name if prof else "Markytics Consulting"

    def get_candidate_profile(self, obj):
        prof = CandidateProfile.objects.filter(user=obj.candidate).first()
        if prof:
            return {
                'headline': prof.headline,
                'years_of_experience': prof.years_of_experience,
                'location': prof.location,
                'skills': prof.skills
            }
        return None

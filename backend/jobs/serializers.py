from rest_framework import serializers
from .models import Job, JobCategory, Skill
from accounts.models import RecruiterProfile

class JobCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobCategory
        fields = ['id', 'name', 'slug']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

class JobSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    recruiter_name = serializers.SerializerMethodSerializer()
    company_name = serializers.SerializerMethodSerializer()
    applications_count = serializers.SerializerMethodSerializer()

    class Meta:
        model = Job
        fields = [
            'id', 'recruiter_id', 'recruiter_name', 'company_name',
            'title', 'description', 'category', 'category_name', 'skills',
            'location', 'employment_type', 'workplace_type',
            'min_experience', 'max_experience', 'min_salary', 'max_salary',
            'salary_currency', 'salary_period', 'application_deadline',
            'status', 'published_at', 'created_at', 'updated_at',
            'applications_count'
        ]
        read_only_fields = ['id', 'recruiter_id', 'published_at', 'created_at', 'updated_at']

    def get_recruiter_name(self, obj):
        return f"{obj.recruiter.first_name} {obj.recruiter.last_name}"

    def get_company_name(self, obj):
        prof = RecruiterProfile.objects.filter(user=obj.recruiter).first()
        return prof.company_name if prof else "Markytics Consulting Pvt Ltd"

    def get_applications_count(self, obj):
        return obj.applications.count()

    def validate(self, data):
        min_exp = data.get('min_experience', getattr(self.instance, 'min_experience', 0))
        max_exp = data.get('max_experience', getattr(self.instance, 'max_experience', 0))
        if min_exp > max_exp:
            raise serializers.ValidationError({"min_experience": "Minimum experience cannot exceed maximum experience."})

        min_sal = data.get('min_salary', getattr(self.instance, 'min_salary', 0))
        max_sal = data.get('max_salary', getattr(self.instance, 'max_salary', 0))
        if min_sal > max_sal:
            raise serializers.ValidationError({"min_salary": "Minimum salary cannot exceed maximum salary."})

        return data

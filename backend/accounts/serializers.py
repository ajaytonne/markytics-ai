from rest_framework import serializers
from .models import User, CandidateProfile, RecruiterProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'is_active', 'created_at', 'updated_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'role']

    def validate_role(self, value):
        if value not in [User.Role.CANDIDATE, User.Role.RECRUITER]:
            raise serializers.ValidationError("Public registration allows CANDIDATE or RECRUITER choice only.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data['role']
        )
        if user.role == User.Role.CANDIDATE:
            CandidateProfile.objects.create(user=user)
        elif user.role == User.Role.RECRUITER:
            RecruiterProfile.objects.create(
                user=user,
                company_name="Markytics Client Partner",
                company_description="Enterprise consulting partner"
            )
        return user

class CandidateProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'user_id', 'headline', 'bio', 'skills',
            'years_of_experience', 'location', 'portfolio_url',
            'linkedin_url', 'search_visibility', 'first_name', 'last_name', 'email'
        ]
        read_only_fields = ['id', 'user_id']

class RecruiterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruiterProfile
        fields = ['id', 'user_id', 'company_name', 'company_description', 'company_website', 'location']
        read_only_fields = ['id', 'user_id']

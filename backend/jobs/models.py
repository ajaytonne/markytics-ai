from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from accounts.models import User

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class JobCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Job(models.Model):
    class EmploymentType(models.TextChoices):
        FULL_TIME = 'FULL_TIME', 'Full Time'
        PART_TIME = 'PART_TIME', 'Part Time'
        CONTRACT = 'CONTRACT', 'Contract'
        INTERNSHIP = 'INTERNSHIP', 'Internship'

    class WorkplaceType(models.TextChoices):
        ONSITE = 'ONSITE', 'Onsite'
        HYBRID = 'HYBRID', 'Hybrid'
        REMOTE = 'REMOTE', 'Remote'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        OPEN = 'OPEN', 'Open'
        CLOSED = 'CLOSED', 'Closed'

    class SalaryPeriod(models.TextChoices):
        ANNUAL = 'ANNUAL', 'Annual'
        MONTHLY = 'MONTHLY', 'Monthly'

    recruiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(JobCategory, on_delete=models.PROTECT, related_name='jobs')
    skills = models.JSONField(default=list, blank=True)
    location = models.CharField(max_length=150)
    employment_type = models.CharField(max_length=20, choices=EmploymentType.choices, default=EmploymentType.FULL_TIME)
    workplace_type = models.CharField(max_length=20, choices=WorkplaceType.choices, default=WorkplaceType.HYBRID)
    min_experience = models.PositiveIntegerField(default=0)
    max_experience = models.PositiveIntegerField(default=0)
    min_salary = models.PositiveIntegerField(default=0)
    max_salary = models.PositiveIntegerField(default=0)
    salary_currency = models.CharField(max_length=10, default='INR')
    salary_period = models.CharField(max_length=20, choices=SalaryPeriod.choices, default=SalaryPeriod.ANNUAL)
    application_deadline = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.min_salary > self.max_salary:
            raise ValidationError({'min_salary': 'Minimum salary cannot exceed maximum salary.'})
        if self.min_experience > self.max_experience:
            raise ValidationError({'min_experience': 'Minimum experience cannot exceed maximum experience.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        if self.status == Job.Status.OPEN and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.recruiter.email} ({self.status})"

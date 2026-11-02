from django.db import models
from accounts.models import User
from jobs.models import Job

def resume_upload_path(instance, filename):
    import uuid
    import os
    ext = os.path.splitext(filename)[1]
    return f"resumes/private_{uuid.uuid4().hex}{ext}"

class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = 'APPLIED', 'Applied'
        SHORTLISTED = 'SHORTLISTED', 'Shortlisted'
        INTERVIEW = 'INTERVIEW', 'Interview'
        REJECTED = 'REJECTED', 'Rejected'
        HIRED = 'HIRED', 'Hired'

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    resume_file = models.FileField(upload_to=resume_upload_path)
    original_resume_name = models.CharField(max_length=255, default='Resume.pdf')
    cover_letter = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Enforce unique application constraint per candidate per job
        unique_together = ('job', 'candidate')

    def __str__(self):
        return f"App #{self.id}: {self.candidate.email} -> {self.job.title} ({self.status})"

class ApplicationStatusHistory(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='status_history')
    previous_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    candidate_message = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"History #{self.id}: {self.previous_status} -> {self.new_status}"

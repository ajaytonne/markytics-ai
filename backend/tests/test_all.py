from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from accounts.models import User, CandidateProfile, RecruiterProfile
from jobs.models import Job, JobCategory
from applications.models import Application

class SecurityAndWorkflowTestCase(TestCase):
    def setUp(self):
        self.cat = JobCategory.objects.create(name='Data & Analytics', slug='data-analytics')

        self.admin = User.objects.create_superuser(
            email='admin@markytics.com',
            password='password123',
            first_name='Admin',
            last_name='System'
        )

        self.recruiter_a = User.objects.create_user(
            email='recruiter_a@markytics.com',
            password='password123',
            first_name='Ananya',
            last_name='Sharma',
            role=User.Role.RECRUITER
        )

        self.recruiter_b = User.objects.create_user(
            email='recruiter_b@markytics.com',
            password='password123',
            first_name='Vikram',
            last_name='Mehta',
            role=User.Role.RECRUITER
        )

        self.candidate_a = User.objects.create_user(
            email='candidate_a@example.com',
            password='password123',
            first_name='Rohan',
            last_name='Deshmukh',
            role=User.Role.CANDIDATE
        )

        self.candidate_b = User.objects.create_user(
            email='candidate_b@example.com',
            password='password123',
            first_name='Priya',
            last_name='Patel',
            role=User.Role.CANDIDATE
        )

        self.job_a = Job.objects.create(
            recruiter=self.recruiter_a,
            title='Data Analyst Intern',
            description='Analyze datasets using Python and SQL.',
            category=self.cat,
            location='Mumbai',
            status=Job.Status.OPEN
        )

    def test_registration_cannot_create_admin(self):
        url = '/api/v1/auth/register/'
        data = {
            'email': 'hacker@example.com',
            'password': 'password123',
            'first_name': 'Hacker',
            'last_name': 'User',
            'role': 'ADMIN'
        }
        res = self.client.post(url, data, content_type='application/json')
        self.assertEqual(res.status_code, 400)

    def test_duplicate_application_blocked(self):
        sample_pdf = SimpleUploadedFile("resume.pdf", b"%PDF-1.4 sample content", content_type="application/pdf")
        Application.objects.create(
            job=self.job_a,
            candidate=self.candidate_a,
            resume_file=sample_pdf,
            original_resume_name="Rohan_Resume.pdf"
        )

        # Attempting duplicate application
        from django.db.utils import IntegrityError
        with self.assertRaises(IntegrityError):
            Application.objects.create(
                job=self.job_a,
                candidate=self.candidate_a,
                resume_file=sample_pdf,
                original_resume_name="Duplicate_Resume.pdf"
            )

    def test_salary_and_experience_constraints(self):
        job = Job(
            recruiter=self.recruiter_a,
            title='Invalid Salary Job',
            description='Test description',
            category=self.cat,
            location='Mumbai',
            min_salary=500000,
            max_salary=200000, # Invalid min > max
            min_experience=3,
            max_experience=1   # Invalid min > max
        )
        from django.core.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            job.full_clean()

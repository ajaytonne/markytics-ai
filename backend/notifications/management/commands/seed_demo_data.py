from django.core.management.base import BaseCommand
from accounts.models import User, CandidateProfile, RecruiterProfile
from jobs.models import Job, JobCategory

class Command(BaseCommand):
    help = 'Seeds initial demo users, job categories, and sample jobs with password Demo@1234.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding demo data...')
        
        # 1. Create or get Admin
        admin, created = User.objects.get_or_create(
            email='admin@markytics.com',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('Demo@1234')
            admin.save()
            self.stdout.write(self.style.SUCCESS('Created admin user: admin@markytics.com'))
        else:
            admin.set_password('Demo@1234')
            admin.save()
            self.stdout.write('Updated admin user password to Demo@1234')

        # 2. Create or get Recruiter
        recruiter, created = User.objects.get_or_create(
            email='recruiter@markytics.com',
            defaults={
                'first_name': 'Sarah',
                'last_name': 'Recruiter',
                'role': User.Role.RECRUITER,
            }
        )
        if created:
            recruiter.set_password('Demo@1234')
            recruiter.save()
            RecruiterProfile.objects.get_or_create(
                user=recruiter,
                defaults={
                    'company_name': 'Markytics Consulting Pvt Ltd',
                    'company_description': 'Leading Data Science and Analytics Consulting Firm',
                    'location': 'Mumbai, India',
                    'company_website': 'https://markytics.com'
                }
            )
            self.stdout.write(self.style.SUCCESS('Created recruiter user: recruiter@markytics.com'))
        else:
            recruiter.set_password('Demo@1234')
            recruiter.save()
            self.stdout.write('Updated recruiter password to Demo@1234')

        # 3. Create or get Candidate
        candidate, created = User.objects.get_or_create(
            email='candidate@markytics.com',
            defaults={
                'first_name': 'Alex',
                'last_name': 'Candidate',
                'role': User.Role.CANDIDATE,
            }
        )
        if created:
            candidate.set_password('Demo@1234')
            candidate.save()
            CandidateProfile.objects.get_or_create(
                user=candidate,
                defaults={
                    'headline': 'Full Stack Developer & Data Enthusiast',
                    'bio': 'Passionate about React, Python, and scalable Web Architecture.',
                    'skills': ['React', 'TypeScript', 'Python', 'Django', 'PostgreSQL'],
                    'years_of_experience': 2,
                    'location': 'Pune, India',
                    'search_visibility': CandidateProfile.SearchVisibility.PUBLIC
                }
            )
            self.stdout.write(self.style.SUCCESS('Created candidate user: candidate@markytics.com'))
        else:
            candidate.set_password('Demo@1234')
            candidate.save()
            self.stdout.write('Updated candidate password to Demo@1234')

        # 4. Create Job Categories
        tech_cat, _ = JobCategory.objects.get_or_create(name='Engineering & Technology', defaults={'slug': 'engineering-technology'})
        data_cat, _ = JobCategory.objects.get_or_create(name='Data Science & Analytics', defaults={'slug': 'data-science-analytics'})
        pm_cat, _ = JobCategory.objects.get_or_create(name='Product Management', defaults={'slug': 'product-management'})
        
        # 5. Create Sample Jobs
        job1, j1_created = Job.objects.get_or_create(
            title='Senior Full-Stack Engineer',
            recruiter=recruiter,
            defaults={
                'description': 'We are looking for a Senior Full-Stack Engineer proficient in React, Node/Django, and PostgreSQL to lead web platform initiatives.',
                'category': tech_cat,
                'skills': ['React', 'TypeScript', 'Django', 'PostgreSQL'],
                'location': 'Mumbai, India',
                'employment_type': Job.EmploymentType.FULL_TIME,
                'workplace_type': Job.WorkplaceType.HYBRID,
                'min_experience': 3,
                'max_experience': 6,
                'min_salary': 1200000,
                'max_salary': 1800000,
                'status': Job.Status.OPEN,
            }
        )

        job2, j2_created = Job.objects.get_or_create(
            title='Data Analyst Intern',
            recruiter=recruiter,
            defaults={
                'description': 'Join the Markytics Internship Program as a Data Analyst. Perform exploratory data analysis, visualization, and SQL reporting.',
                'category': data_cat,
                'skills': ['Python', 'SQL', 'Pandas', 'Power BI'],
                'location': 'Remote',
                'employment_type': Job.EmploymentType.INTERNSHIP,
                'workplace_type': Job.WorkplaceType.REMOTE,
                'min_experience': 0,
                'max_experience': 1,
                'min_salary': 300000,
                'max_salary': 500000,
                'status': Job.Status.OPEN,
            }
        )

        job3, j3_created = Job.objects.get_or_create(
            title='Product Manager - Tech',
            recruiter=recruiter,
            defaults={
                'description': 'Lead product strategy, collaborate with cross-functional technical teams, and define feature roadmaps.',
                'category': pm_cat,
                'skills': ['Product Strategy', 'Agile', 'User Research', 'SQL'],
                'location': 'Pune, India',
                'employment_type': Job.EmploymentType.FULL_TIME,
                'workplace_type': Job.WorkplaceType.ONSITE,
                'min_experience': 4,
                'max_experience': 8,
                'min_salary': 1500000,
                'max_salary': 2200000,
                'status': Job.Status.OPEN,
            }
        )

        self.stdout.write(self.style.SUCCESS('Demo data seeding completed successfully!'))

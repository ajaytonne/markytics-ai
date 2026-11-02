import time
import logging
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from notifications.models import EmailNotification

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Processes pending email notifications in the outbox queue and delivers them via configured EmailBackend.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--one-shot',
            action='store_true',
            help='Run outbox processor once and exit instead of running continuously.',
        )

    def handle(self, *args, **options):
        one_shot = options.get('one_shot', False)
        self.stdout.write(self.style.SUCCESS(f"Starting Email Outbox Processor (one_shot={one_shot})..."))

        while True:
            pending_notifications = EmailNotification.objects.filter(
                delivery_state__in=[EmailNotification.DeliveryState.PENDING, EmailNotification.DeliveryState.FAILED],
                attempt_count__lt=3
            ).order_by('created_at')

            count = 0
            for notif in pending_notifications:
                count += 1
                try:
                    # Construct email body from render_data or subject
                    body_lines = [
                        f"Notification: {notif.subject}",
                        "----------------------------------------",
                    ]
                    if isinstance(notif.render_data, dict):
                        for k, v in notif.render_data.items():
                            body_lines.append(f"{k}: {v}")
                    else:
                        body_lines.append(str(notif.render_data))
                    
                    body_lines.append("\nThank you for using Markytics Consulting Recruitment Portal.")
                    email_body = "\n".join(body_lines)

                    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@markytics.com')

                    send_mail(
                        subject=notif.subject,
                        message=email_body,
                        from_email=from_email,
                        recipient_list=[notif.recipient_email],
                        fail_silently=False,
                    )

                    notif.delivery_state = EmailNotification.DeliveryState.SENT
                    notif.sent_at = timezone.now()
                    notif.attempt_count += 1
                    notif.last_error = None
                    notif.save()
                    self.stdout.write(self.style.SUCCESS(f"Sent email #{notif.id} to {notif.recipient_email}"))

                except Exception as e:
                    notif.attempt_count += 1
                    notif.last_error = str(e)
                    if notif.attempt_count >= 3:
                        notif.delivery_state = EmailNotification.DeliveryState.FAILED
                    notif.save()
                    self.stderr.write(self.style.ERROR(f"Failed email #{notif.id} attempt {notif.attempt_count}: {e}"))

            if one_shot:
                self.stdout.write(f"Processed {count} notifications in one-shot mode.")
                break

            time.sleep(5)

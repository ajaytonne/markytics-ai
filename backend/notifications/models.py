from django.db import models

class EmailNotification(models.Model):
    class DeliveryState(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SENT = 'SENT', 'Sent'
        FAILED = 'FAILED', 'Failed'

    event_ref = models.CharField(max_length=150)
    recipient_email = models.EmailField()
    subject = models.CharField(max_length=255)
    template_id = models.CharField(max_length=100)
    render_data = models.JSONField(default=dict)
    delivery_state = models.CharField(
        max_length=20,
        choices=DeliveryState.choices,
        default=DeliveryState.PENDING
    )
    attempt_count = models.PositiveIntegerField(default=0)
    last_error = models.TextField(blank=True, null=True)
    sent_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"EmailNotification #{self.id}: {self.recipient_email} - {self.subject} ({self.delivery_state})"

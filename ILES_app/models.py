from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator

import uuid
from django.utils import timezone
from datetime import timedelta



class User(AbstractUser):
    
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('workplace', 'Workplace Supervisor'),
        ('academic', 'Academic Supervisor'),
        ('admin', 'Administrator'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    student_id = models.CharField(max_length=50, blank=True, null=True)
    staff_id = models.CharField(max_length=50, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True)
    
    
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='iles_app_user_set',  # Unique related_name
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='iles_app_user_set_permissions',  # Unique related_name
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )
class PasswordReset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=30, unique=True, default=uuid.uuid4)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def is_valid(self):
        return timezone.now() < self.created_at + timedelta(hours=1)
class InternshipPlacement(models.Model):
 
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='placements')
    company_name = models.CharField(max_length=200)
    workplace_supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='workplace_placements')
    academic_supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='academic_placements')
    
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.student.username} @ {self.company_name}"


class WeeklyLog(models.Model):
   
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    placement = models.ForeignKey(InternshipPlacement, on_delete=models.CASCADE, related_name='logs')
    week_number = models.IntegerField()
    
    activities = models.TextField()
    challenges = models.TextField(blank=True)
    working_hours=models.DecimalField(decimal_places=4,max_digits=6,default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    submission_date = models.DateTimeField(null=True, blank=True)
    attachment=models.FileField(upload_to='attachments/', blank=True,null=True)
    
    feedback = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    score = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['placement', 'week_number']
    
    def __str__(self):
        return f"Week {self.week_number} - {self.placement.student.username}"




class Evaluation(models.Model):
  
    placement = models.OneToOneField(InternshipPlacement, on_delete=models.CASCADE, related_name='evaluation')
    
    workplace_score = models.IntegerField(null=True, blank=True)
    academic_score = models.IntegerField(null=True, blank=True)
    
    workplace_comments = models.TextField(blank=True)
    academic_comments = models.TextField(blank=True)
    
    final_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    grade = models.CharField(max_length=2, blank=True)

    workplace_submitted_at = models.DateTimeField(null=True, blank=True)
    academic_submitted_at = models.DateTimeField(null=True, blank=True)
        
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Evaluation - {self.placement}"
    
    def calculate_final(self):
        
        if self.workplace_score is not None and self.academic_score is not None:
            # Get average log score
            logs = self.placement.logs.filter(status='approved', score__isnull=False)
            log_avg = 0
            if logs.exists():
                total = sum([log.score for log in logs])
                log_avg = total / logs.count()
            
            self.final_score = (
                (self.workplace_score * 0.4) +
                (self.academic_score * 0.3) +
                (log_avg * 0.3)
                
            )
            
            
            if self.final_score >= 80:
                self.grade = 'A'
            elif self.final_score >= 70:
                self.grade = 'B'
            elif self.final_score >= 60:
                self.grade = 'C'
            elif self.final_score >= 50:
                self.grade = 'D'
            else:
                self.grade = 'F'
        self.save()
        
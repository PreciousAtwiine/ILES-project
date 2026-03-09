from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator

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
    
    def __str__(self):
        return f"{self.username} ({self.role})"


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



from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
# main custom user model using abstract user Tool
class User(AbstractUser):
    # these are the roles for each user
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('workplace', 'Workplace Supervisor'), 
        ('academic', 'Academic Supervisor'),   
        ('admin', 'Administrator'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    student_id = models.CharField(max_length=50, blank=True, null=True) # only for students
    staff_id = models.CharField(max_length=50, blank=True, null=True)   # for supervisors
    department = models.CharField(max_length=100, blank=True)
    
    # had to add these to fix the reverse accessor error (Giving my User a unique related_name solves the clashsince auth user also uses user_set)
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='iles_app_user_set',  # changed this to avoid clash
        blank=True,
        help_text='groups for permissions stuff',
        verbose_name='groups',
    ) 
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='iles_app_user_permissions',  # also changed this one
        blank=True,
        help_text='specific permissions for this user type',
        verbose_name='user permissions',
    )
    def __str__(self):
        return f"{self.username} ({self.role})"


# internship placements - linking students with companies and supervisors
class InternshipPlacement(models.Model):
 
    STATUS_CHOICES = [
        ('pending', 'Pending'),      
        ('approved', 'Approved'),    
        ('rejected', 'Rejected'),    
        ('completed', 'Completed'),  
    ]
   
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='my_placements')
    company_name = models.CharField(max_length=200)
    
    # supervisors (can be not needed until admin assigns them)
    workplace_supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='supervising_at_work')
    academic_supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='supervising_at_school')
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.student.username} @ {self.company_name}"


# sub by studs
class WeeklyLog(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),              
        ('submitted', 'Submitted'),       
        ('reviewed', 'Reviewed'),         
        ('approved', 'Approved'),         
        ('rejected', 'Rejected'),         
    ]
    
    placement = models.ForeignKey(InternshipPlacement, on_delete=models.CASCADE, related_name='weekly_submissions')
    week_number = models.IntegerField()  # which week of internship
    activities = models.TextField()      
    challenges = models.TextField(blank=True)  
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    submission_date = models.DateTimeField(null=True, blank=True)  
    # supervisor feedback section
    feedback = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    score = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ['placement', 'week_number']  # tO prevent duplicate weeks
    
    def __str__(self):
        return f"Week {self.week_number} - {self.placement.student.username}"


class Evaluation(models.Model):
    placement = models.OneToOneField(InternshipPlacement, on_delete=models.CASCADE, related_name='final_grade')
    workplace_score = models.IntegerField(null=True, blank=True)
    academic_score = models.IntegerField(null=True, blank=True)
    workplace_comments = models.TextField(blank=True)
    academic_comments = models.TextField(blank=True)
    final_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    grade = models.CharField(max_length=2, blank=True)  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.placement.student.username}'s evaluation"
    
    ''' this calculates the final grade based on the weighting formula
     formula: 40% workplace + 30% academic + 30% average of log scores as it was in our course guide'''
    def calculate_final_grade(self):
        if self.workplace_score and self.academic_score:
            # get all approved logs with scores
            logs = self.placement.logs.filter(status='approved', score__isnull=False)
            log_avg = 0
            if logs.exists():
                total = 0
                for log in logs:
                    total += log.score
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
            
            elif self.final_score >= 50:
                self.grade = 'D'
            else:
                self.grade = 'F'
            
            self.save()


from rest_framework import serializers
from .models import User, InternshipPlacement, WeeklyLog, Evaluation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'role', 'student_id', 'staff_id', 'department']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name',
                  'role', 'student_id', 'staff_id', 'department']
    
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)




class InternshipPlacementSerializer(serializers.ModelSerializer):
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    workplace_supervisor_name = serializers.CharField(source='workplace_supervisor.get_full_name', read_only=True)
    academic_supervisor_name = serializers.CharField(source='academic_supervisor.get_full_name', read_only=True)
    
    class Meta:
        model = InternshipPlacement
        fields = ['id', 'student', 'student_name', 'company_name', 
                  'workplace_supervisor', 'workplace_supervisor_name',
                  'academic_supervisor', 'academic_supervisor_name',
                  'start_date', 'end_date', 'status', 'created_at']
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
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    submission_date = models.DateTimeField(null=True, blank=True)
    
    feedback = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    score = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
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
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Evaluation - {self.placement}"
    
    def calculate_final(self):
        
        if self.workplace_score and self.academic_score:
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
                





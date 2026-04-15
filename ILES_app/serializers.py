
# serializers convert django models to json
from rest_framework import serializers
from .models import *

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



class WeeklyLogSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='placement.student.get_full_name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    
    class Meta:
        model = WeeklyLog
        fields = ['id', 'placement', 'student_name', 'week_number', 
                  'activities', 'challenges', 'status', 'submission_date',
                  'feedback', 'reviewed_by', 'reviewer_name', 'score', 'created_at']


class EvaluationSerializer(serializers.ModelSerializer):
    
    student_name = serializers.CharField(source='placement.student.get_full_name', read_only=True)
    company_name = serializers.CharField(source='placement.company_name', read_only=True)
    
    class Meta:
        model = Evaluation
        fields = ['id', 'placement', 'student_name', 'company_name',
                  'workplace_score', 'academic_score', 
                  'workplace_comments', 'academic_comments',
                  'final_score', 'grade', 'created_at', 'updated_at']

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from .models import Evaluation, InternshipPlacement, User, WeeklyLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 
                  'role', 'student_id', 'staff_id', 'department']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=12)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name',
                  'role', 'student_id', 'staff_id', 'department']
    
    def validate(self, data):
        role = data.get('role')
        
        # Students must have student_id
        if role == 'student' and not data.get('student_id'):
            raise serializers.ValidationError(
                {"student_id": "pls enter student id"}
            )
        
        # Staff must have staff_id
        if role in ['workplace', 'academic', 'admin'] and not data.get('staff_id'):
            raise serializers.ValidationError(
                {"staff_id": "Please enter staff ID"}
            )
        
        # Check uniqueness
        if role == 'student' and data.get('student_id'):
            if User.objects.filter(student_id=data['student_id']).exists():
                raise serializers.ValidationError(
                    {"student_id": "Stud id already exists"}
                )
        
        if role in ['workplace', 'academic', 'admin'] and data.get('staff_id'):
            if User.objects.filter(staff_id=data['staff_id']).exists():
                raise serializers.ValidationError(
                    {"staff_id": "Staff ID already exists"}
                )

        password = data.get("password")
        if password:
            provisional = User(
                username=data.get("username", ""),
                email=data.get("email", ""),
                first_name=data.get("first_name", ""),
                last_name=data.get("last_name", ""),
            )
            try:
                validate_password(password, user=provisional)
            except DjangoValidationError as exc:
                raise serializers.ValidationError(
                    {"password": list(exc.messages)}
                )

        return data
    
    def create(self, validated_data):
        role = validated_data.get('role') 
        user = User.objects.create_user(**validated_data)
        
        if role == 'student':
            user.is_active = True  # Students active immediately
        else:
            user.is_active = False  # Staff need admin approval
        
        user.is_superuser = False
        user.is_staff = False     
        user.save()
        return user
    
class ApproveStaffSerializer(serializers.Serializer):
    
    
    user_id = serializers.IntegerField()
    approve = serializers.BooleanField()
    
    def validate_user_id(self, value):
        try:
            
            user = User.objects.get(
                id=value, 
                role__in=['workplace', 'academic', 'admin'],
                is_active=False,
                is_superuser=False
            )
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("Pending staff user not found")
    
    def save(self):
        user_id = self.validated_data['user_id']
        approve = self.validated_data['approve']
        
        user = User.objects.get(id=user_id)
        
        if approve:
            user.is_active = True
            user.save()
            return user, "approved"
        else:
            user.delete()  
            return None, "rejected"



class ApplyForPlacementSerializer(serializers.ModelSerializer):
    """
    STUDENTS use this to apply for placemets by entering stud id
    """
    student_id = serializers.CharField(write_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = InternshipPlacement
        fields = ['student_id', 'student_name', 'company_name', 
                  'start_date', 'end_date', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at', 'student_name']
        
    
    def validate_student_id(self, value):
        try:
            student = User.objects.get(student_id=value, role='student')
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("No student found with this ID. Please register first.")
    
    def validate(self, data):
        
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("End date must be after start date")
        
        #see whether plaacement was already made
        student = User.objects.get(student_id=data['student_id'], role='student')
        existing = InternshipPlacement.objects.filter(
            student=student,
            status__in=['pending', 'approved']
        ).exists() 
        if existing:
            raise serializers.ValidationError("You already have a pending or approved placement")
        return data
    
    def create(self, validated_data):
        student_id = validated_data.pop('student_id')
        student = User.objects.get(student_id=student_id, role='student')
        
        placement = InternshipPlacement.objects.create(
            student=student,
            company_name=validated_data['company_name'],
            start_date=validated_data['start_date'],
            end_date=validated_data['end_date'],
            status='pending'
        )
        return placement


class InternshipPlacementSerializer(serializers.ModelSerializer):
    """
    EVERYONE uses this to VIEW details
    """
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    workplace_supervisor_name = serializers.CharField(source='workplace_supervisor.get_full_name', read_only=True, default=None)
    academic_supervisor_name = serializers.CharField(source='academic_supervisor.get_full_name', read_only=True, default=None)
    
    class Meta:
        model = InternshipPlacement
        fields = ['id','student', 'student_id', 'student_name', 'company_name', 
                  'workplace_supervisor', 'workplace_supervisor_name',
                  'academic_supervisor', 'academic_supervisor_name',
                  'start_date', 'end_date', 'status', 'created_at']
        read_only_fields = ['id', 'student', 'status', 'created_at']

class AssignSupervisorsSerializer(serializers.Serializer):
    
    workplace_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    academic_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    def validate_supervisor_id(self, value, role):
        """Validate supervisor exists, is active, and has correct role"""
        if value is not None:
            try:
                # Check if user exists with correct role and is active
                supervisor = User.objects.get(id=value, role=role, is_active=True)
                return value
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    f"{role.replace('_', ' ').title()} supervisor not found or inactive"
                )
        return value
    
    def validate_workplace_id(self, value):
        """Validate workplace supervisor ID"""
        return self.validate_supervisor_id(value, 'workplace')
    
    def validate_academic_id(self, value):
        """Validate academic supervisor ID"""
        return self.validate_supervisor_id(value, 'academic')
    
    def validate(self, data):
        """Ensure at least one supervisor is assigned"""
        if not data.get('workplace_id') and not data.get('academic_id'):
            raise serializers.ValidationError("You must assign at least one supervisor")
        return data

class WeeklyLogSerializer(serializers.ModelSerializer):
    """
    View log details
    """
    student_name = serializers.CharField(source='placement.student.get_full_name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True, default=None)
    
    class Meta:
        model = WeeklyLog
        fields = ['placement', 'student_name', 'week_number', 
                  'activities', 'challenges', 'status', 'submission_date',
                  'feedback', 'reviewed_by', 'reviewer_name', 'score', 'created_at']
        read_only_fields = ['id', 'submission_date', 'reviewed_by', 'created_at']


class SubmitLogSerializer(serializers.ModelSerializer):
    """
    STUDENTS use this to submit a log
    """
    class Meta:
        model = WeeklyLog
        fields = ['placement', 'week_number','working_hours', 'attachment','activities', 'challenges']
    
    
    def validate(self, data):
        placement = data['placement']
        week = data['week_number']
        hours=data['working_hours']
        # Check if placement is approved
        if placement.status != 'approved':
            raise serializers.ValidationError("Your placement must be approved before submitting logs")
        
        # Check i   f log already exists
        if WeeklyLog.objects.filter(placement=placement, week_number=week).exists():
            raise serializers.ValidationError(f"Log for week {week} already exists")
        if hours<=0:
            raise serializers.ValidationError("YOU CAN'T WORK 0 HOURS")
        return data
    
    def create(self, validated_data):
        log = WeeklyLog.objects.create(
            **validated_data,
            status='submitted',
            submission_date=timezone.now()
        )
        return log


class ReviewLogSerializer(serializers.ModelSerializer):
    """
    Supervisors use this to review logs
    """
    class Meta:
        model = WeeklyLog
        fields = ['status', 'feedback', 'score']
    
    def validate_score(self, value):
        if value and (value < 0 or value > 100):
            raise serializers.ValidationError("Score must be between 0 and 100")
        return value
    
    def validate_status(self, value):
        if value not in ['approved', 'rejected']:
            raise serializers.ValidationError("Status can only be 'approved' or 'rejected'")
        return value



class EvaluationSerializer(serializers.ModelSerializer):
    """
    View evaluation details
    """
    student_name = serializers.CharField(source='placement.student.get_full_name', read_only=True)
    student_id = serializers.CharField(source='placement.student.student_id', read_only=True)
    company_name = serializers.CharField(source='placement.company_name', read_only=True)
    
    class Meta:
        model = Evaluation
        fields = ['placement', 'student_name', 'student_id', 'company_name',
                  'workplace_score', 'academic_score',
                  'workplace_comments', 'academic_comments',
                  'workplace_submitted_at', 'academic_submitted_at',
                  'final_score', 'grade', 'created_at', 'updated_at']
        read_only_fields = [
            'id', 'final_score', 'grade',
            'workplace_submitted_at', 'academic_submitted_at',
            'created_at', 'updated_at',
        ]


class WorkplaceEvaluationSerializer(serializers.ModelSerializer):
    """
    WORKPLACE SUPERVISOR submits their evaluation
    """
    class Meta:
        model = Evaluation
        fields = ['workplace_score', 'workplace_comments']
    
    def validate_workplace_score(self, value):
        if value and (value < 0 or value > 100):
            raise serializers.ValidationError("Score must be between 0 and 100")
        return value


class AcademicEvaluationSerializer(serializers.ModelSerializer):
    """
    ACADEMIC SUPERVISOR submits their evaluation
    """
    class Meta:
        model = Evaluation
        fields = ['academic_score', 'academic_comments']
    
    def validate_academic_score(self, value):
        if value and (value < 0 or value > 100):
            raise serializers.ValidationError("Score must be between 0 and 100")
        return value



class StudentDashboardSerializer(serializers.ModelSerializer):
    """
    What a student sees on their dashboard
    """
    placement = serializers.SerializerMethodField()
    recent_logs = serializers.SerializerMethodField()
    evaluation = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'student_id', 
                  'department', 'placement', 'recent_logs', 'evaluation']
    
    def get_placement(self, obj):
        placement = InternshipPlacement.objects.filter(
            student=obj
        ).order_by('-created_at').first()
        
        if placement:
            return InternshipPlacementSerializer(placement).data
        return None
    
    def get_recent_logs(self, obj):
        logs = WeeklyLog.objects.filter(placement__student=obj).order_by('-created_at')[:5]
        return WeeklyLogSerializer(logs, many=True).data
    
    def get_evaluation(self, obj):
        evaluation = (
            Evaluation.objects.filter(placement__student=obj)
            .order_by('-placement__created_at', '-updated_at')
            .first()
        )
        if evaluation:
            return EvaluationSerializer(evaluation).data
        return None


class SupervisorDashboardSerializer(serializers.ModelSerializer):
    
    assigned_students = serializers.SerializerMethodField()
    pending_reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'staff_id', 
                  'department', 'assigned_students', 'pending_reviews']
    
    def get_assigned_students(self, obj):
        if obj.role == 'workplace':
            placements = InternshipPlacement.objects.filter(
                workplace_supervisor=obj,
                status='approved'
            )
        elif obj.role == 'academic':
            placements = InternshipPlacement.objects.filter(
                academic_supervisor=obj,
                status='approved'
            )
        else:
            placements = InternshipPlacement.objects.none()
        
        return InternshipPlacementSerializer(placements, many=True).data
    
    def get_pending_reviews(self, obj):
        if obj.role == 'workplace':
            logs = WeeklyLog.objects.filter(
                placement__workplace_supervisor=obj,
                status='submitted'
            )
        elif obj.role == 'academic':
            logs = WeeklyLog.objects.filter(
                placement__academic_supervisor=obj,
                status='submitted'
            )
        else:
            logs = WeeklyLog.objects.none()
        
        return WeeklyLogSerializer(logs, many=True).data


class AdminDashboardSerializer(serializers.ModelSerializer):
    """
    What admin sees on their dashboard
    """
    total_students = serializers.IntegerField(read_only=True)
    total_supervisors = serializers.IntegerField(read_only=True)
    pending_applications = serializers.IntegerField(read_only=True)
    active_internships = serializers.IntegerField(read_only=True)
    recent_applications = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['username', 'total_students', 'total_supervisors', 
                  'pending_applications', 'active_internships', 'recent_applications']
    
    def get_recent_applications(self, obj):
        placements = InternshipPlacement.objects.filter(status='pending').order_by('-created_at')[:10]
        return InternshipPlacementSerializer(placements, many=True).data

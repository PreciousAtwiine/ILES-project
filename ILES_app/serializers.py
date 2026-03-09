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




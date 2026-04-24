from rest_framework import viewsets,generics, status
from django.core.mail import send_mail
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView 
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import *
from .serializers import *
from django.contrib.auth import logout
from django.conf import settings


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({
            'message': 'Logged out successfully',
            'success': True
        })


class IsStudent(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'student'

class IsWorkplace(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'workplace'

class IsAcademic(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'academic'

class IsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'admin'

class IsSupervisor(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role in ['workplace', 'academic']


def send_email(to_email, subject, message):
    """Simple email sender"""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False,
        )
    except:
        pass


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        return Response({
            'user': UserSerializer(request.user).data,
            'role': request.user.role
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def pending_staff(self, request):
        users = User.objects.filter(
            role__in=['workplace', 'academic', 'admin'],
            is_active=False, is_superuser=False
        )
        return Response(UserSerializer(users, many=True).data)
    
    @action(detail=False, methods=['post'])
    def approve_staff(self, request):
        if not request.user.is_superuser:
            return Response({"error": "Only superuser can approve staff"}, status=403)
        
        serializer = ApproveStaffSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, result = serializer.save()
        
        if user is None:
            return Response({"message": f"Staff registration {result}"})
        
        # EMAIL: Staff approved
        if result == "approved":
            send_email(
                user.email,
                'Account Approved - ILES',
                f'Hello {user.get_full_name() or user.username},\n\nYour account has been approved.\n\nLogin: http://localhost:3000/login\n\nUsername: {user.username}\n\n- ILES Team'
            )
        
        return Response({"message": f"Staff {user.username} {result}"})


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            "message": "Use POST to request password reset",
            "instructions": "Send a POST request with {'email': 'your@email.com'}"
        })
    
    def post(self, request):
        email = request.data.get('email')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "No account with this email"}, status=404)
        
        PasswordReset.objects.filter(user=user).delete()
        reset = PasswordReset.objects.create(user=user)
        
        reset_link = f"http://localhost:3000/reset-password?token={reset.token}"
        send_mail(
            'Reset Your Password',
            f'Click: {reset_link}',
            'noreply@iles.com',
            [email],
            fail_silently=False,
        )
        
        return Response({"message": "Reset link sent to your email"})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        if new_password != confirm_password:
            return Response({"error": "Passwords don't match"}, status=400)
        
        try:
            reset = PasswordReset.objects.get(token=token)
        except PasswordReset.DoesNotExist:
            return Response({"error": "Invalid token"}, status=400)
        
        if not reset.is_valid():
            return Response({"error": "Token expired"}, status=400)
        
        user = reset.user
        user.set_password(new_password)
        user.save()
        reset.delete()
        
        return Response({"message": "Password reset successful"})


class InternshipPlacementViewSet(viewsets.ModelViewSet):
    queryset = InternshipPlacement.objects.all()
    serializer_class = InternshipPlacementSerializer
    permission_classes = [IsAdmin]
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def pending(self, request):
        placements = InternshipPlacement.objects.filter(status='pending')
        return Response(self.get_serializer(placements, many=True).data)
    
    @action(detail=True, methods=['get', 'post'], permission_classes=[IsAdmin])
    def assign_supervisors(self, request, pk=None):
        placement = self.get_object()
        
        if request.method == 'GET':
            def get_available(role):
                busy = InternshipPlacement.objects.filter(
                    status='approved', **{f'{role}_supervisor__isnull': False}
                ).exclude(id=placement.id).values_list(f'{role}_supervisor_id', flat=True)
                return User.objects.filter(role=role, is_active=True).exclude(id__in=busy)
            
            return Response({
                'current': {
                    'workplace': placement.workplace_supervisor_id,
                    'academic': placement.academic_supervisor_id
                },
                'available_workplace': [{'id': s.id, 'name': s.get_full_name()} for s in get_available('workplace')],
                'available_academic': [{'id': s.id, 'name': s.get_full_name()} for s in get_available('academic')]
            })
        
        serializer = AssignSupervisorsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if serializer.validated_data.get('workplace_id'):
            placement.workplace_supervisor_id = serializer.validated_data['workplace_id']
        if serializer.validated_data.get('academic_id'):
            placement.academic_supervisor_id = serializer.validated_data['academic_id']
        
        placement.status = 'approved' if placement.status == 'pending' else placement.status
        placement.save()
        
        # lacement approved message
        if placement.status == 'approved':
            send_email(
                placement.student.email,
                'Placement Approved - ILES',
                f'Hello {placement.student.get_full_name()},\n\nYour internship placement has been APPROVED!\n\nCompany: {placement.company_name}\nStart: {placement.start_date}\nEnd: {placement.end_date}\n\nYou can now submit your weekly logs.\n\n- ILES Team'
            )
        
        return Response({"message": "Supervisors assigned"})


class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return WeeklyLog.objects.filter(placement__student=user)
        elif user.role == 'workplace':
            return WeeklyLog.objects.filter(placement__workplace_supervisor=user)
        elif user.role == 'academic':
            return WeeklyLog.objects.filter(placement__academic_supervisor=user)
        return WeeklyLog.objects.all()
    
    @action(detail=False, methods=['post'], permission_classes=[IsStudent])
    def submit(self, request):
        placement = InternshipPlacement.objects.filter(
            student=request.user, status='approved'
        ).first()
        if not placement:
            return Response({"error": "No approved placement"}, status=400)
        
        serializer = SubmitLogSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(placement=placement)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[IsSupervisor])
    def pending(self, request):
        user = request.user
        logs = WeeklyLog.objects.filter(
            status='submitted',
            **{f'placement__{user.role}_supervisor': user}
        )
        return Response(WeeklyLogSerializer(logs, many=True).data)
    
    @action(detail=True, methods=['put'], permission_classes=[IsSupervisor])
    def review(self, request, pk=None):
        log = self.get_object()
        old_status = log.status
        serializer = ReviewLogSerializer(log, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(reviewed_by=request.user, reviewed_at=timezone.now())
        
        # EMAIL: Log reviewed
        if log.status in ['approved', 'rejected'] and old_status != log.status:
            send_email(
                log.placement.student.email,
                f'Week {log.week_number} Log - {log.status.upper()}',
                f'Hello {log.placement.student.get_full_name()},\n\nYour weekly log for Week {log.week_number} has been {log.status}.\n\nScore: {log.score}/100\nFeedback: {log.feedback or "No additional feedback"}\n\n- ILES Team'
            )
        
        return Response({"message": "Log reviewed"})


class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Evaluation.objects.filter(placement__student=user)
        elif user.role == 'workplace':
            return Evaluation.objects.filter(placement__workplace_supervisor=user)
        elif user.role == 'academic':
            return Evaluation.objects.filter(placement__academic_supervisor=user)
        return Evaluation.objects.all()
    @action(detail=False, methods=['post'], permission_classes=[IsWorkplace])
    def workplace(self, request):
        return self._submit_evaluation(request, 'workplace')
    
    @action(detail=False, methods=['post'], permission_classes=[IsAcademic])
    def academic(self, request):
        return self._submit_evaluation(request, 'academic')
    
    def _submit_evaluation(self, request, role):
        placement_id = request.data.get('placement_id')
        placement = get_object_or_404(InternshipPlacement, id=placement_id)
        
        if getattr(placement, f'{role}_supervisor') != request.user:
            return Response({"error": "Not your student"}, status=403)
        
        evaluation, _ = Evaluation.objects.get_or_create(placement=placement)
        serializer = WorkplaceEvaluationSerializer if role == 'workplace' else AcademicEvaluationSerializer
        ser = serializer(evaluation, data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save(**{f'{role}_submitted_at': timezone.now()})
        
        evaluation.refresh_from_db()
        if evaluation.workplace_score is not None and evaluation.academic_score is not None:
            evaluation.calculate_final()
            
            # Evaluation complete message
            send_email(
                placement.student.email,
                'Internship Evaluation Complete - ILES',
                f'Hello {placement.student.get_full_name()},\n\nYour internship evaluation is complete!\n\nResults:\n- Workplace Score (40%): {evaluation.workplace_score}\n- Academic Score (30%): {evaluation.academic_score}\n- Log Average (30%): {evaluation.log_avg_score}\n- FINAL SCORE: {evaluation.final_score}\n- GRADE: {evaluation.grade}\n\n- ILES Team'
            )
        
        return Response({"message": f"{role.title()} evaluation submitted"})


class ApplyForPlacementView(generics.CreateAPIView):
    """Students apply for internship - separate view"""
    queryset = InternshipPlacement.objects.all()
    serializer_class = ApplyForPlacementSerializer
    permission_classes = [IsStudent]
    
    def get(self, request):
        return Response({
            "message": "Use POST to apply",
            "fields": ["student_id", "company_name", "start_date", "end_date"]
        })


class StudentPlacementStatusView(generics.RetrieveAPIView):
    """Student checks placement status"""
    serializer_class = InternshipPlacementSerializer
    permission_classes = [IsStudent]
    
    def get_object(self):
        placement = InternshipPlacement.objects.filter(
            student=self.request.user
        ).order_by('-created_at').first()
        return placement
    
    def get(self, request):
        placement = self.get_object()
        if not placement:
            return Response({"message": "No placement found"}, status=404)
        return Response(self.get_serializer(placement).data)


class StudentLogsListView(generics.ListCreateAPIView):
    """Student views and submits logs"""
    serializer_class = SubmitLogSerializer
    permission_classes = [IsStudent]
    
    def get_queryset(self):
        placement = InternshipPlacement.objects.filter(
            student=self.request.user, status='approved'
        ).first()
        if placement:
            return WeeklyLog.objects.filter(placement=placement)
        return WeeklyLog.objects.none()
    
    def get(self, request):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response({"message": "No logs found", "logs": []})
        return Response(WeeklyLogSerializer(queryset, many=True).data)
    
    def post(self, request):
        placement = InternshipPlacement.objects.filter(
            student=request.user, status='approved'
        ).first()
        if not placement:
            return Response({"error": "No approved placement"}, status=400)
        
        serializer = SubmitLogSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(placement=placement)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StudentDashboardView(generics.RetrieveAPIView):
    serializer_class = StudentDashboardSerializer
    permission_classes = [IsStudent]
    def get_object(self):
        return self.request.user


class SupervisorDashboardView(generics.RetrieveAPIView):
    serializer_class = SupervisorDashboardSerializer
    permission_classes = [IsSupervisor]
    def get_object(self):
        return self.request.user


class AdminDashboardView(generics.RetrieveAPIView):
    serializer_class = AdminDashboardSerializer
    permission_classes = [IsAdmin]
    def get_object(self):
        user = self.request.user
        user.total_students = User.objects.filter(role='student').count()
        user.total_supervisors = User.objects.filter(role__in=['workplace', 'academic']).count()
        user.pending_applications = InternshipPlacement.objects.filter(status='pending').count()
        user.active_internships = InternshipPlacement.objects.filter(status='approved').count()
        return user

class AssignedStudentsView(generics.ListAPIView):
    serializer_class = InternshipPlacementSerializer
    permission_classes = [IsSupervisor]
    def get_queryset(self):
        user = self.request.user
        return InternshipPlacement.objects.filter(
            **{f'{user.role}_supervisor': user},
            status='approved'
        )
class PendingLogsView(generics.ListAPIView):
    serializer_class = WeeklyLogSerializer
    permission_classes = [IsSupervisor]
    def get_queryset(self):
        user = self.request.user
        return WeeklyLog.objects.filter(
            status='submitted',
            **{f'placement__{user.role}_supervisor': user}
        )
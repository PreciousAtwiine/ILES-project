from rest_framework import viewsets,generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView 
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import *
from .serializers import *
from django.contrib.auth import logout
from .serializers import ApplyForPlacementSerializer, UserSerializer 
from ILES_app.models import User

class LogoutView(APIView):
    #changed from generic to apiview
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



class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    '''I AM USING THIS TO CREATE CUSTOM URLS AND KEEP EVERY THING RELATE D TOGETHER'''
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
        # Only superuser can use this
        if not request.user.is_superuser:
            return Response({"error": "Only superuser can approve staff"}, status=403)
        
        serializer = ApproveStaffSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, result = serializer.save()
        if user is None:
            return Response({"message": f"Staff registration {result}"})
        return Response({"message": f"Staff {user.username} {result}"})



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
        serializer = ReviewLogSerializer(log, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(reviewed_by=request.user, reviewed_at=timezone.now())
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
        if (
            evaluation.workplace_score is not None
            and evaluation.academic_score is not None
        ):
            evaluation.calculate_final()
        
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

from django.test import TestCase 
from ILES_app.models import Department 
 
class DepartmentTest(TestCase): 
    def test_create_department(self): 
        dept = Department.objects.create(name="Computer Science", code="CS001") 
        self.assertEqual(dept.name, "Computer Science") 
        print("Model test passed!") 

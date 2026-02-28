<script>
    // This will run when page loads
    document.addEventListener('DOMContentLoaded', function() {
        // Show loading state
        showLoading();
        
        // Fetch student data from server
        fetchStudentData();
    });

    // Fetch student data from Django backend
    function fetchStudentData() {
        // This would be a real API call to your Django backend
        // Example: fetch('/api/student/dashboard/')
        // For now, it's a placeholder
        
        console.log("Fetching student data from server...");
        
        // In real implementation, you'd do:
        /*
        fetch('/api/student/dashboard/')
            .then(response => response.json())
            .then(data => {
                updateStudentInfo(data.student);
                loadCourses(data.courses);
                hideLoading();
            })
            .catch(error => {
                showError("Failed to load data");
                console.error(error);
            });
        */
    }

    // Load courses into grid (data comes from server)
    function loadCourses(coursesData) {
        const grid = document.getElementById('coursesGrid');
        
        if (!coursesData || coursesData.length === 0) {
            grid.innerHTML = '<div style="text-align: center; padding: 50px;">No courses found</div>';
            return;
        }

        grid.innerHTML = coursesData.map(course => createCourseCard(course)).join('');
    }

    // Create course card HTML (data from server)
    function createCourseCard(course) {
        // Calculate totals if scores exist
        let totalScore = 0;
        let totalMax = 0;
        
        if (course.assessments && course.assessments.length > 0) {
            course.assessments.forEach(a => {
                totalScore += a.score || 0;
                totalMax += a.max || 0;
            });
        }
        
        const percentage = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

        return `
            <div class="course-card">
                <div class="course-header">
                    <span class="course-code">${course.code || 'N/A'}</span>
                    <span class="status-badge status-${course.status || 'pending'}">
                        ${course.status ? course.status.charAt(0).toUpperCase() + course.status.slice(1) : 'Pending'}
                    </span>
                </div>
                <div class="course-name">${course.name || 'Course Name'}</div>
                
                <table class="assessment-table">
                    <tr>
                        <th>Assessment</th>
                        <th>Score</th>
                        <th>Max</th>
                        <th>%</th>
                    </tr>
                    ${course.assessments ? course.assessments.map(a => `
                        <tr>
                            <td>${a.name || 'Assessment'}</td>
                            <td class="score">${a.score !== null && a.score !== undefined ? a.score : '-'}</td>
                            <td>${a.max || '-'}</td>
                            <td>${a.score && a.max ? Math.round((a.score/a.max)*100) + '%' : '-'}</td>
                        </tr>
                    `).join('') : `
                        <tr>
                            <td colspan="4" style="text-align: center;">No assessments yet</td>
                        </tr>
                    `}
                </table>
                
                <div class="total-score">
                    <span>Total Score</span>
                    <span><strong>${totalScore || '0'}/${totalMax || '0'}</strong> (${percentage}%)</span>
                </div>
                <div style="margin-top: 10px; text-align: right;">
                    <span class="grade">${course.grade || '—'}</span>
                </div>
                <div style="margin-top: 15px;">
                    <button class="expand-btn" onclick="openIssueModal('${course.code}')">Raise Issue →</button>
                </div>
            </div>
        `;
    }

    // Filter courses (filtering happens on server or client)
    function filterCourses() {
        const yearFilter = document.getElementById('yearFilter').value;
        const semesterFilter = document.getElementById('semesterFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const searchTerm = document.getElementById('searchCourse').value.toLowerCase();
        
        // In real app, you might fetch filtered data from server
        console.log("Filtering by:", {yearFilter, semesterFilter, statusFilter, searchTerm});
        
        // Or if you already have all courses loaded, filter them client-side
        // For now, just show loading
        showToast("Filtering courses...");
    }

    // Update student info from server data
    function updateStudentInfo(studentData) {
        if (!studentData) return;
        
        document.getElementById('studentName').textContent = studentData.firstName || 'Student';
        document.getElementById('displayName').textContent = studentData.fullName || 'Student Name';
        document.getElementById('studentNumber').textContent = studentData.studentNumber || 'N/A';
        document.getElementById('program').textContent = studentData.program || 'Program';
        document.getElementById('college').innerHTML = `<i class="fa fa-university"></i> ${studentData.college || 'College'}`;
        
        // Set avatar initials
        const name = studentData.fullName || 'Student Name';
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        document.getElementById('userAvatar').textContent = initials;
    }

    // Modal functions
    function openIssueModal(courseCode = '') {
        if (courseCode) {
            document.getElementById('issueCourse').value = courseCode;
        }
        document.getElementById('issueModal').style.display = 'flex';
    }

    function openMissingMarksModal() {
        document.getElementById('missingMarksModal').style.display = 'flex';
    }

    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // Submit issue to server
    function submitIssue(event) {
        event.preventDefault();
        
        const issueData = {
            course: document.getElementById('issueCourse').value,
            type: document.getElementById('issueType').value,
            description: document.getElementById('issueDescription').value,
            student: document.getElementById('studentNumber').textContent
        };
        
        // Send to server
        console.log("Submitting issue to server:", issueData);
        
        // In real app:
        /*
        fetch('/api/issues/create/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(issueData)
        })
        .then(response => response.json())
        .then(data => {
            showToast('Issue raised successfully! Reference: ' + data.reference);
            closeModal('issueModal');
            event.target.reset();
        })
        .catch(error => {
            showToast('Error submitting issue', 'error');
        });
        */
        
        // Simulate success for now
        showToast('Issue raised successfully! Reference #ISS' + Math.floor(Math.random() * 10000));
        closeModal('issueModal');
        event.target.reset();
    }

    // Submit missing marks report
    function submitMissingMarks(event) {
        event.preventDefault();
        
        const reportData = {
            course: document.getElementById('missingCourse').value,
            assessment: document.getElementById('missingAssessment').value,
            expectedScore: document.getElementById('expectedScore').value,
            comments: document.getElementById('missingComments').value,
            student: document.getElementById('studentNumber').textContent
        };
        
        console.log("Reporting missing marks:", reportData);
        
        // Send to server...
        
        showToast('Missing marks reported successfully!');
        closeModal('missingMarksModal');
        event.target.reset();
    }

    // View issue history - fetch from server
    function viewIssueHistory() {
        showToast('Loading issue history...');
        
        // In real app:
        // window.location.href = '/issues/history/';
    }

    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.display = 'block';
        toast.style.background = type === 'success' ? '#28a745' : '#ff4757';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    // Show loading state
    function showLoading() {
        const grid = document.getElementById('coursesGrid');
        grid.innerHTML = '<div style="text-align: center; padding: 50px;">Loading your courses...</div>';
    }

    // Show error
    function showError(message) {
        const grid = document.getElementById('coursesGrid');
        grid.innerHTML = `<div style="text-align: center; padding: 50px; color: #ff4757;">Error: ${message}</div>`;
    }

    // Hide loading
    function hideLoading() {
        // Loading removed when courses are loaded
    }

    // Handle logout
    function handleLogout(event) {
        event.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            // In real app:
            // window.location.href = '/logout/';
            console.log("Logging out...");
        }
    }

    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    }
</script>
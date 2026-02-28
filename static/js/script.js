// Tab switching functionality
        function switchTab(tab) {
            const tabs = document.querySelectorAll('.auth-tab');
            const forms = document.querySelectorAll('.auth-form');
            
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            if (tab === 'login') {
                tabs[0].classList.add('active');
                document.getElementById('loginForm').classList.add('active');
                hideForgotPassword();
            } else {
                tabs[1].classList.add('active');
                document.getElementById('signupForm').classList.add('active');
                hideForgotPassword();
            }
        }

        // Handle Login
        function handleLogin(event) {
            event.preventDefault();
            
            const username = document.getElementById('loginUsername').value;
            const studentNo = document.getElementById('loginStudentNo').value;
            const password = document.getElementById('loginPassword').value;
            
            // Simple validation
            if (!username || !studentNo || !password) {
                showAlert('loginAlert', 'Please fill in all fields', 'error');
                return;
            }
            
            // Demo login - in real app, this would verify with backend
            if (username && studentNo && password.length >= 6) {
                showAlert('loginAlert', 'Login successful!', 'success');
                
                // Simulate successful login
                setTimeout(() => {
                    const userData = {
                        name: username,
                        studentNo: studentNo
                    };
                    showLoggedInView(userData);
                }, 1000);
            } else {
                showAlert('loginAlert', 'Invalid credentials. Password must be at least 6 characters.', 'error');
            }
        }

        // Handle Signup
        function handleSignup(event) {
            event.preventDefault();
            
            const fullName = document.getElementById('signupFullName').value;
            const username = document.getElementById('signupUsername').value;
            const studentNo = document.getElementById('signupStudentNo').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            
            // Validation
            if (!fullName || !username || !studentNo || !email || !password || !confirmPassword) {
                showAlert('signupAlert', 'Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showAlert('signupAlert', 'Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 6) {
                showAlert('signupAlert', 'Password must be at least 6 characters', 'error');
                return;
            }
            
            // Simple student number format check
            if (!studentNo.match(/^S\d{5}\/\d{4}$/) && !studentNo.match(/^\d{10}$/)) {
                showAlert('signupAlert', 'Please enter a valid student number (e.g., S12345/2024 or 2024001234)', 'error');
                return;
            }
            
            // Show success message
            showAlert('signupAlert', 'Account created successfully! Please login.', 'success');
            
            // Clear form
            document.getElementById('signupFullName').value = '';
            document.getElementById('signupUsername').value = '';
            document.getElementById('signupStudentNo').value = '';
            document.getElementById('signupEmail').value = '';
            document.getElementById('signupPassword').value = '';
            document.getElementById('signupConfirmPassword').value = '';
            
            // Switch to login tab after 2 seconds
            setTimeout(() => {
                switchTab('login');
            }, 2000);
        }

        // Show logged in view
        function showLoggedInView(userData) {
            document.getElementById('notLoggedIn').style.display = 'none';
            document.getElementById('loggedIn').style.display = 'block';
            document.getElementById('forgotPasswordModal').style.display = 'none';
            
            // Update user info
            document.getElementById('userDisplayName').textContent = userData.name;
            document.getElementById('userStudentNo').textContent = userData.studentNo;
            
            // Set avatar initials
            const nameParts = userData.name.split(' ');
            let initials = nameParts[0].charAt(0);
            if (nameParts.length > 1) {
                initials += nameParts[1].charAt(0);
            } else {
                initials = userData.name.substring(0, 2).toUpperCase();
            }
            document.getElementById('userAvatar').textContent = initials;
        }

        // Handle Logout
        function handleLogout() {
            document.getElementById('notLoggedIn').style.display = 'block';
            document.getElementById('loggedIn').style.display = 'none';
            
            // Clear login form
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginStudentNo').value = '';
            document.getElementById('loginPassword').value = '';
        }

        // Show alert messages
        function showAlert(elementId, message, type) {
            const alert = document.getElementById(elementId);
            alert.textContent = message;
            alert.className = `alert ${type}`;
            alert.style.display = 'block';
            
            setTimeout(() => {
                alert.style.display = 'none';
            }, 3000);
        }

        // Forgot password functionality
        function showForgotPassword() {
            document.getElementById('forgotPasswordModal').style.display = 'block';
        }

        function hideForgotPassword() {
            document.getElementById('forgotPasswordModal').style.display = 'none';
        }

        function sendResetLink() {
            const email = document.getElementById('resetEmail').value;
            if (!email) {
                alert('Please enter your email or student number');
                return;
            }
            alert('Password reset link has been sent to your email');
            hideForgotPassword();
        }

        // Initialize on page load
        window.onload = function() {
            // Start with not logged in state
            handleLogout();
        };
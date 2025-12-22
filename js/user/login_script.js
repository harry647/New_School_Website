// Translations object for internationalization
const translations = {
    en: {
        invalid_email_username: 'Invalid email or username.',
        invalid_password: 'Invalid password.',
        invalid_role: 'Please select a role.',
        invalid_full_name: 'Please enter a valid full name.',
        invalid_email: 'Please enter a valid email address.',
        invalid_password_reg: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
        passwords_do_not_match: 'Passwords do not match.',
        agree_terms_required: 'You must agree to the terms and conditions.',
        duplicate_security_questions: 'Please choose two different security questions.',
        login_success: 'Login successful!',
        login_failed: 'Login failed.',
        registration_success: 'Registration successful!',
        registration_failed: 'Registration failed.',
        error_occurred: 'An error occurred. Please try again.',
        profile: 'Profile',
        logout: 'Logout'
    },
    // Add other languages as needed
};

document.addEventListener('DOMContentLoaded', function() {
    // CSRF token fetching removed for simplified authentication

    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Base URL for API endpoints
    const BASE_URL = 'http://localhost:3000';
    
    // Redirect map for destination-aware login
    const redirects = {
        clubs: {
            student: '/portal/clubs.html',
            teacher: '/portal/clubs.html',
            admin: '/portal/clubs.html'
        },
        'e-learning': {
            student: '/portal/e-learning-portal.html',
            teacher: '/portal/e-learning-portal.html',
            admin: '/portal/e-learning-portal.html'
        }
    };

    // --- Language Toggling ---
    const languageToggle = document.getElementById('language-toggle');
    const storedLang = localStorage.getItem('selectedLanguage');

    // Only proceed if languageToggle exists
    if (languageToggle) {
        // Apply stored language or default to English
        if (storedLang) {
            languageToggle.value = storedLang;
            updateTranslations(storedLang);
        } else {
            updateTranslations('en');
        }

        languageToggle.addEventListener('change', (event) => {
            const selectedLang = event.target.value;
            localStorage.setItem('selectedLanguage', selectedLang);
            updateTranslations(selectedLang);
        });
    } else {
        // Default to English if languageToggle is not present
        updateTranslations('en');
    }

    function updateTranslations(lang) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });

        // Update tooltips after language change
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            const tooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
            if (tooltip) {
                tooltip.dispose();
            }
            const dataI18nKey = tooltipTriggerEl.getAttribute('data-i18n');
            if (dataI18nKey && translations[lang] && translations[lang][dataI18nKey]) {
                tooltipTriggerEl.setAttribute('title', translations[lang][dataI18nKey]);
            }
            new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // --- Password Visibility Toggling ---
    function togglePasswordVisibility(passwordFieldId, toggleButtonId) {
        const passwordField = document.getElementById(passwordFieldId);
        const toggleButton = document.getElementById(toggleButtonId);

        if (passwordField && toggleButton) {
            toggleButton.addEventListener('click', function() {
                const icon = this.querySelector('i');
                if (passwordField.type === 'password') {
                    passwordField.type = 'text';
                    icon.classList.remove('bi-eye');
                    icon.classList.add('bi-eye-slash');
                } else {
                    passwordField.type = 'password';
                    icon.classList.remove('bi-eye-slash');
                    icon.classList.add('bi-eye');
                }
            });
        }
    }

    togglePasswordVisibility('loginPassword', 'toggleLoginPassword');
    togglePasswordVisibility('registerPassword', 'toggleRegisterPassword');
    togglePasswordVisibility('confirmPassword', 'toggleConfirmPassword');

    // --- Dynamic Copyright Year ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Back to Top Button ---
    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Form Validation Functions ---
    function validateTextInput(inputElement, minLength, maxLength, feedbackElement, translationKey) {
        const value = inputElement.value.trim();
        const isValid = value.length >= minLength && value.length <= maxLength;
        setValidationState(inputElement, feedbackElement, isValid, translationKey);
        return isValid;
    }

    function validateEmail(inputElement, feedbackElement, translationKey) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(inputElement.value.trim());
        setValidationState(inputElement, feedbackElement, isValid, translationKey);
        return isValid;
    }

    function validateRegisterPassword(passwordElement, feedbackElement, translationKey) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
        const isValid = passwordRegex.test(passwordElement.value);
        setValidationState(passwordElement, feedbackElement, isValid, translationKey);
        return isValid;
    }

    function validateLoginPassword(passwordElement, feedbackElement, translationKey) {
        const isValid = passwordElement.value.length >= 6;
        setValidationState(passwordElement, feedbackElement, isValid, translationKey);
        return isValid;
    }

    function validateRole(selectElement, feedbackElement, translationKey) {
        const isValid = selectElement.value !== "";
        setValidationState(selectElement, feedbackElement, isValid, translationKey);
        return isValid;
    }

    function validateTerms(checkboxElement, feedbackElement, translationKey) {
        const isValid = checkboxElement.checked;
        setValidationState(checkboxElement, feedbackElement, isValid, translationKey);
        return isValid;
    }

    function setValidationState(element, feedbackElement, isValid, translationKey) {
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        if (isValid) {
            element.classList.remove('is-invalid');
            element.classList.add('is-valid');
            feedbackElement.style.display = 'none';
        } else {
            element.classList.remove('is-valid');
            element.classList.add('is-invalid');
            feedbackElement.textContent = translations?.[currentLang]?.[translationKey] || 'Invalid input.';
            feedbackElement.style.display = 'block';
        }
    }

    function resetValidation(formId) {
        const form = document.getElementById(formId);
        form.querySelectorAll('.form-control, .form-select, .form-check-input').forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });
        form.querySelectorAll('.invalid-feedback').forEach(feedback => {
            feedback.style.display = 'none';
        });
    }

    // --- Loading Overlay Functions ---
    const loadingOverlay = document.getElementById('loading-overlay');

    function showLoadingOverlay() {
        if (loadingOverlay) {
            loadingOverlay.classList.remove('d-none');
            loadingOverlay.classList.add('d-flex');
        }
    }

    function hideLoadingOverlay() {
        if (loadingOverlay) {
            loadingOverlay.classList.remove('d-flex');
            loadingOverlay.classList.add('d-none');
        }
    }

    // --- Login Form Handling ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            resetValidation('login-form');

            const loginEmail = document.getElementById('loginEmail');
            const loginPassword = document.getElementById('loginPassword');
            const loginRole = document.getElementById('loginRole');
            const rememberMe = document.getElementById('rememberMe');
            const currentLang = localStorage.getItem('selectedLanguage') || 'en';

            let isValid = true;
            isValid = validateTextInput(loginEmail, 3, 50, document.getElementById('loginEmailFeedback'), 'invalid_email_username') && isValid;
            isValid = validateLoginPassword(loginPassword, document.getElementById('loginPasswordFeedback'), 'invalid_password') && isValid;
            isValid = validateRole(loginRole, document.getElementById('loginRoleFeedback'), 'invalid_role') && isValid;

            if (isValid) {
                showLoadingOverlay();
                try {
                    const response = await fetch(`${BASE_URL}/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            email: loginEmail.value,
                            password: loginPassword.value,
                            role: loginRole.value,
                            rememberMe: rememberMe.checked
                        })
                    });

                    const data = await response.json();
                    hideLoadingOverlay();

                    if (response.ok) {
                        alert(translations[currentLang].login_success);
                        updateLoginStatus(true, data.email || loginEmail.value);

                        const destination = document.getElementById('loginDestination')?.value || 'e-learning';
                        const role = loginRole.value;

                        // Set authentication state for the portal
                        localStorage.setItem("userLoggedIn", "true");
                        localStorage.setItem("userName", data.email || loginEmail.value);
                        localStorage.setItem("portalRole", role);

                        if (redirects[destination] && redirects[destination][role]) {
                            window.location.href = redirects[destination][role];
                        } else {
                            alert('Invalid role or destination selection.');
                        }
                    } else {
                        alert(translations[currentLang].login_failed + ": " + (data.message || translations[currentLang].error_occurred));
                    }
                } catch (error) {
                    hideLoadingOverlay();
                    console.error('Login error:', error);
                    const errorMessage = translations?.[currentLang]?.error_occurred || 'An error occurred. Please try again.';
                    alert(errorMessage);
                }
            }
        });
    }

    // --- Registration Form Handling ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const registerPassword = document.getElementById('registerPassword');
        const confirmPassword = document.getElementById('confirmPassword');

        if (registerPassword && confirmPassword) {
            [registerPassword, confirmPassword].forEach(field => {
                field.addEventListener('input', () => {
                    const currentLang = localStorage.getItem('selectedLanguage') || 'en';
                    const passwordsMatch = registerPassword.value === confirmPassword.value;
                    setValidationState(confirmPassword, document.getElementById('confirmPasswordFeedback'), passwordsMatch, 'passwords_do_not_match');
                });
            });
        }

        registerForm.addEventListener('submit', async (event) => {
                  event.preventDefault();
                  resetValidation('register-form');
      
                  const registerName = document.getElementById('registerName');
                  const registerEmail = document.getElementById('registerEmail');
                  const registerRole = document.getElementById('registerRole');
                  const termsCheck = document.getElementById('termsCheck');
                  const securityQuestion1 = document.getElementById('securityQuestion1');
                  const securityAnswer1 = document.getElementById('securityAnswer1');
                  const securityQuestion2 = document.getElementById('securityQuestion2');
                  const securityAnswer2 = document.getElementById('securityAnswer2');
                  const currentLang = localStorage.getItem('selectedLanguage') || 'en';
      
                  let isValid = true;
                  isValid = validateTextInput(registerName, 3, 100, document.getElementById('registerNameFeedback'), 'invalid_full_name') && isValid;
                  isValid = validateEmail(registerEmail, document.getElementById('registerEmailFeedback'), 'invalid_email') && isValid;
                  isValid = validateRegisterPassword(registerPassword, document.getElementById('registerPasswordFeedback'), 'invalid_password_reg') && isValid;
                  const passwordsMatch = registerPassword.value === confirmPassword.value;
                  isValid = passwordsMatch && isValid;
                  setValidationState(confirmPassword, document.getElementById('confirmPasswordFeedback'), passwordsMatch, 'passwords_do_not_match');
                  isValid = validateRole(registerRole, document.getElementById('registerRoleFeedback'), 'invalid_role') && isValid;
                  isValid = validateTerms(termsCheck, document.getElementById('termsCheckFeedback'), 'agree_terms_required') && isValid;
      
                  // Validate security questions
                  if (!securityQuestion1.value || !securityAnswer1.value.trim()) {
                      securityQuestion1.classList.add('is-invalid');
                      securityAnswer1.classList.add('is-invalid');
                      isValid = false;
                  } else {
                      securityQuestion1.classList.remove('is-invalid');
                      securityAnswer1.classList.remove('is-invalid');
                  }
      
                  if (!securityQuestion2.value || !securityAnswer2.value.trim()) {
                      securityQuestion2.classList.add('is-invalid');
                      securityAnswer2.classList.add('is-invalid');
                      isValid = false;
                  } else {
                      securityQuestion2.classList.remove('is-invalid');
                      securityAnswer2.classList.remove('is-invalid');
                  }
      
                  if (securityQuestion1.value === securityQuestion2.value) {
                      securityQuestion2.classList.add('is-invalid');
                      alert(translations[currentLang].duplicate_security_questions || 'Please choose two different security questions.');
                      isValid = false;
                  }
      
                  if (isValid) {
                      showLoadingOverlay();
                      try {
                          const response = await fetch(`${BASE_URL}/auth/register`, {
                              method: 'POST',
                              headers: {
                                  'Content-Type': 'application/json'
                              },
                              credentials: 'include',
                              body: JSON.stringify({
                                  fullName: registerName.value,
                                  email: registerEmail.value,
                                  password: registerPassword.value,
                                  role: registerRole.value,
                                  securityQuestion1: securityQuestion1.value,
                                  securityAnswer1: securityAnswer1.value.trim().toLowerCase(),
                                  securityQuestion2: securityQuestion2.value,
                                  securityAnswer2: securityAnswer2.value.trim().toLowerCase()
                              })
                          });
      
                          const data = await response.json();
                          hideLoadingOverlay();
      
                          if (response.ok) {
                              alert(translations[currentLang].registration_success);
                              const loginTab = new bootstrap.Tab(document.getElementById('login-tab'));
                              loginTab.show();
                              registerForm.reset();
                              resetValidation('register-form');
                          } else {
                              alert(translations[currentLang].registration_failed + ": " + (data.message || translations[currentLang].error_occurred));
                          }
                      } catch (error) {
                          hideLoadingOverlay();
                          console.error('Registration error:', error);
                          const errorMessage = translations?.[currentLang]?.error_occurred || 'An error occurred. Please try again.';
                          alert(errorMessage);
                      }
                  }
              });
    }


    document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");

    if (!registerForm) return;

    registerForm.addEventListener("submit", (e) => {
        const q1 = document.getElementById("securityQuestion1");
        const q2 = document.getElementById("securityQuestion2");
        const a1 = document.getElementById("securityAnswer1");
        const a2 = document.getElementById("securityAnswer2");

        let valid = true;

        // Reset styles
        [q1, q2, a1, a2].forEach(el => el.classList.remove("is-invalid"));

        // Check selections
        if (!q1.value) {
            q1.classList.add("is-invalid");
            valid = false;
        }

        if (!q2.value) {
            q2.classList.add("is-invalid");
            valid = false;
        }

        // Prevent same question twice
        if (q1.value && q2.value && q1.value === q2.value) {
            q2.classList.add("is-invalid");
            alert("Please choose two different security questions.");
            valid = false;
        }

        // Check answers
        if (!a1.value.trim()) {
            a1.classList.add("is-invalid");
            valid = false;
        }

        if (!a2.value.trim()) {
            a2.classList.add("is-invalid");
            valid = false;
        }

        if (!valid) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // Normalize answers before sending (important for backend)
        const securityData = {
            question1: q1.value,
            answer1: a1.value.trim().toLowerCase(),
            question2: q2.value,
            answer2: a2.value.trim().toLowerCase()
        };

        console.log("Security Questions Data:", securityData);

        // You can attach this data to FormData if using fetch/AJAX
        // Example:
        // const formData = new FormData(registerForm);
        // formData.append("security_questions", JSON.stringify(securityData));
    });
});


    // --- User Session Management ---
    function updateLoginStatus(isLoggedIn, username = '') {
        const loginOrLogoutContainer = document.getElementById('login-or-logout-container');
        if (!loginOrLogoutContainer) return;

        const lang = localStorage.getItem('selectedLanguage') || 'en';

        if (isLoggedIn) {
            loginOrLogoutContainer.innerHTML = `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle active" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="User Profile">
                        <i class="bi bi-person-circle"></i> ${username}
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="userDropdown">
                        <li><a class="dropdown-item" href="profile.html" data-i18n="profile">${translations[lang].profile}</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" id="logoutButton" data-i18n="logout">${translations[lang].logout}</a></li>
                    </ul>
                </li>
            `;
            new bootstrap.Tooltip(document.getElementById('userDropdown'));

            document.getElementById('logoutButton').addEventListener('click', async (event) => {
                event.preventDefault();
                showLoadingOverlay();
                try {
                    const response = await fetch(`${BASE_URL}/api/logout`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    });

                    const data = await response.json();
                    hideLoadingOverlay();
                    if (response.ok) {
                        alert(translations[lang].logout);
                        updateLoginStatus(false);
                        window.location.href = data.redirect;
                    } else {
                        alert(translations[lang].error_occurred);
                    }
                } catch (error) {
                    hideLoadingOverlay();
                    console.error('Logout error:', error);
                    const errorMessage = translations?.[lang]?.error_occurred || 'An error occurred. Please try again.';
                    alert(errorMessage);
                }
            });
        } else {
            loginOrLogoutContainer.innerHTML = `
                <a class="nav-link active" href="login.html" data-i18n="login" data-bs-toggle="tooltip" data-bs-placement="top" title="${translations[lang].login}" aria-label="Login">${translations[lang].login}</a>
            `;
            new bootstrap.Tooltip(loginOrLogoutContainer.querySelector('.nav-link'));
        }
        updateTranslations(lang);
    }

    // Initial check for login status
    updateLoginStatus(false);
});

function preventDuplicateQuestions() {
    const q1 = document.getElementById("securityQuestion1");
    const q2 = document.getElementById("securityQuestion2");

    function checkDuplicate() {
        if (q1.value && q2.value && q1.value === q2.value) {
            q2.classList.add("is-invalid");
        } else {
            q2.classList.remove("is-invalid");
        }
    }

    q1.addEventListener("change", checkDuplicate);
    q2.addEventListener("change", checkDuplicate);
}

preventDuplicateQuestions();

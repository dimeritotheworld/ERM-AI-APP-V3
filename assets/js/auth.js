/**
 * Dimeri ERM Authentication JavaScript
 * Handles login/signup tab switching, password validation, and demo login
 *
 * @version 1.0.0
 * ES5 Only - No arrow functions, no let/const, no classes
 */

/* ============================================
   PASSWORD VISIBILITY TOGGLE
   ============================================ */

/**
 * Toggle password visibility for a password input field
 * @param {string} inputId - The ID of the password input
 * @param {HTMLElement} toggleBtn - The toggle button element
 */
function togglePasswordVisibility(inputId, toggleBtn) {
  var input = document.getElementById(inputId);

  if (!input) {
    console.error("Password input not found:", inputId);
    return;
  }

  if (input.type === "password") {
    input.type = "text";
    toggleBtn.classList.add("showing");
  } else {
    input.type = "password";
    toggleBtn.classList.remove("showing");
  }
}

/* ============================================
   PASSWORD VALIDATION STATE
   ============================================ */
var passwordRequirements = {
  length: false,
  uppercase: false,
  lowercase: false,
  symbol: false,
};

var passwordsMatch = false;

/* ============================================
   TAB SWITCHING
   ============================================ */

/**
 * Switch between Sign In and Sign Up tabs
 * @param {string} tabName - Either 'signin' or 'signup'
 */
function switchTab(tabName) {
  var tabs = document.querySelectorAll(".login-tab");
  var panels = document.querySelectorAll(".login-panel");
  var signinFooter = document.getElementById("signin-footer");
  var signupFooter = document.getElementById("signup-footer");

  // Remove active class from all tabs and panels
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }
  for (var j = 0; j < panels.length; j++) {
    panels[j].classList.remove("active");
  }

  // Add active class to selected tab and panel
  var selectedTab = document.querySelector(
    '.login-tab[data-tab="' + tabName + '"]'
  );
  var selectedPanel = document.getElementById(tabName);

  if (selectedTab) {
    selectedTab.classList.add("active");
  }
  if (selectedPanel) {
    selectedPanel.classList.add("active");
  }

  // Toggle footer visibility
  if (tabName === "signin") {
    signinFooter.style.display = "block";
    signupFooter.style.display = "none";
  } else {
    signinFooter.style.display = "none";
    signupFooter.style.display = "block";
  }

  // Reset signup form when switching to it
  if (tabName === "signup") {
    resetSignupForm();
  }
}

/* ============================================
   PASSWORD STRENGTH CHECKER
   ============================================ */

/**
 * Check password strength and update UI
 * @param {string} password - The password to check
 */
function checkPasswordStrength(password) {
  // Check each requirement
  passwordRequirements.length = password.length >= 8;
  passwordRequirements.uppercase = /[A-Z]/.test(password);
  passwordRequirements.lowercase = /[a-z]/.test(password);
  passwordRequirements.symbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(
    password
  );

  // Update requirement indicators
  updateRequirementIndicator("req-length", passwordRequirements.length);
  updateRequirementIndicator("req-uppercase", passwordRequirements.uppercase);
  updateRequirementIndicator("req-lowercase", passwordRequirements.lowercase);
  updateRequirementIndicator("req-symbol", passwordRequirements.symbol);

  // Calculate strength score (0-4)
  var score = 0;
  if (passwordRequirements.length) score++;
  if (passwordRequirements.uppercase) score++;
  if (passwordRequirements.lowercase) score++;
  if (passwordRequirements.symbol) score++;

  // Update strength bar and text
  updateStrengthIndicator(score);

  // Check password match if confirm field has value
  var confirmField = document.getElementById("signup-confirm");
  if (confirmField && confirmField.value.length > 0) {
    checkPasswordMatch();
  }

  // Update submit button state
  updateSignupButtonState();
}

/**
 * Update individual requirement indicator
 * @param {string} elementId - The requirement element ID
 * @param {boolean} isMet - Whether requirement is met
 */
function updateRequirementIndicator(elementId, isMet) {
  var element = document.getElementById(elementId);
  if (element) {
    var icon = element.querySelector(".req-icon");
    if (isMet) {
      element.classList.add("met");
      if (icon) icon.textContent = "✓";
    } else {
      element.classList.remove("met");
      if (icon) icon.textContent = "○";
    }
  }
}

/**
 * Update strength bar and text based on score
 * @param {number} score - Strength score (0-4)
 */
function updateStrengthIndicator(score) {
  var strengthFill = document.getElementById("strength-fill");
  var strengthText = document.getElementById("strength-text");

  if (!strengthFill || !strengthText) return;

  // Remove all classes
  strengthFill.className = "strength-fill";
  strengthText.className = "strength-text";

  if (score === 0) {
    strengthText.textContent = "";
  } else if (score === 1) {
    strengthFill.classList.add("weak");
    strengthText.classList.add("weak");
    strengthText.textContent = "Weak";
  } else if (score === 2) {
    strengthFill.classList.add("fair");
    strengthText.classList.add("fair");
    strengthText.textContent = "Fair";
  } else if (score === 3) {
    strengthFill.classList.add("good");
    strengthText.classList.add("good");
    strengthText.textContent = "Good";
  } else if (score === 4) {
    strengthFill.classList.add("strong");
    strengthText.classList.add("strong");
    strengthText.textContent = "Strong";
  }
}

/* ============================================
   PASSWORD MATCH CHECKER
   ============================================ */

/**
 * Check if password and confirm password match
 */
function checkPasswordMatch() {
  var password = document.getElementById("signup-password");
  var confirm = document.getElementById("signup-confirm");
  var matchText = document.getElementById("password-match-text");

  if (!password || !confirm || !matchText) return;

  if (confirm.value.length === 0) {
    matchText.textContent = "";
    matchText.className = "password-match-text";
    passwordsMatch = false;
  } else if (password.value === confirm.value) {
    matchText.textContent = "✓ Passwords match";
    matchText.className = "password-match-text match";
    passwordsMatch = true;
  } else {
    matchText.textContent = "✗ Passwords do not match";
    matchText.className = "password-match-text no-match";
    passwordsMatch = false;
  }

  updateSignupButtonState();
}

/* ============================================
   SIGNUP FORM HANDLING
   ============================================ */

/**
 * Check if all signup requirements are met
 * @returns {boolean} True if form is valid
 */
function isSignupFormValid() {
  var allRequirementsMet =
    passwordRequirements.length &&
    passwordRequirements.uppercase &&
    passwordRequirements.lowercase &&
    passwordRequirements.symbol;

  var nameField = document.getElementById("signup-name");
  var emailField = document.getElementById("signup-email");

  var hasName = nameField && nameField.value.trim().length > 0;
  var hasEmail = emailField && emailField.value.trim().length > 0;

  return allRequirementsMet && passwordsMatch && hasName && hasEmail;
}

/**
 * Update signup button enabled/disabled state
 */
function updateSignupButtonState() {
  var signupBtn = document.getElementById("signup-btn");
  if (signupBtn) {
    signupBtn.disabled = !isSignupFormValid();
  }
}

/**
 * Reset signup form to initial state
 */
function resetSignupForm() {
  // Reset password requirements
  passwordRequirements = {
    length: false,
    uppercase: false,
    lowercase: false,
    symbol: false,
  };
  passwordsMatch = false;

  // Clear all input fields
  var nameField = document.getElementById("signup-name");
  var emailField = document.getElementById("signup-email");
  var passwordField = document.getElementById("signup-password");
  var confirmField = document.getElementById("signup-confirm");

  if (nameField) nameField.value = "";
  if (emailField) emailField.value = "";
  if (passwordField) passwordField.value = "";
  if (confirmField) confirmField.value = "";

  // Reset requirement indicators
  updateRequirementIndicator("req-length", false);
  updateRequirementIndicator("req-uppercase", false);
  updateRequirementIndicator("req-lowercase", false);
  updateRequirementIndicator("req-symbol", false);

  // Reset strength indicator
  var strengthFill = document.getElementById("strength-fill");
  var strengthText = document.getElementById("strength-text");
  if (strengthFill) strengthFill.className = "strength-fill";
  if (strengthText) {
    strengthText.className = "strength-text";
    strengthText.textContent = "";
  }

  // Reset match text
  var matchText = document.getElementById("password-match-text");
  if (matchText) {
    matchText.className = "password-match-text";
    matchText.textContent = "";
  }

  // Disable submit button
  var signupBtn = document.getElementById("signup-btn");
  if (signupBtn) signupBtn.disabled = true;
}

/**
 * Handle signup form submission
 * @param {Event} event - Form submit event
 */
function handleSignup(event) {
  event.preventDefault();

  if (!isSignupFormValid()) {
    alert("Please complete all password requirements.");
    return;
  }

  // Get user info from form
  var nameField = document.getElementById("signup-name");
  var emailField = document.getElementById("signup-email");

  var userName =
    nameField && nameField.value.trim() ? nameField.value.trim() : "New User";
  var userEmail =
    emailField && emailField.value.trim()
      ? emailField.value.trim()
      : "user@dimeri.ai";

  // Clear all previous data for new user signup
  try {
    // Clear all ERM data from localStorage (including FTUX and onboarding states)
    var keysToRemove = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && (key.startsWith('ERM_') || key.startsWith('erm') || key === 'registers' || key === 'risks' || key === 'controls' || key === 'kris' || key === 'onboardingSeen')) {
        keysToRemove.push(key);
      }
    }
    for (var j = 0; j < keysToRemove.length; j++) {
      localStorage.removeItem(keysToRemove[j]);
    }

    // Also clear session storage
    sessionStorage.clear();
  } catch (e) {
    console.warn("Could not clear storage:", e);
  }

  // Store new user info in sessionStorage
  // NEW: Person who signs up is the workspace owner
  var newUser = {
    id: Date.now(),
    name: userName,
    email: userEmail,
    role: "Risk Manager",
    isDemo: true,
    isNewUser: true,
    isOwner: true, // Mark as workspace owner
    userRole: "owner", // Role type
    permissions: {
      // Full permissions for owner
      canManageTeam: true,
      canManageSettings: true,
      canDelete: true,
      canInvite: true,
    },
  };

  try {
    sessionStorage.setItem("ermUser", JSON.stringify(newUser));
    sessionStorage.setItem("ermLoggedIn", "true");
    // New users need onboarding - do NOT set ermOnboardingComplete
    sessionStorage.removeItem("ermOnboardingComplete");
    // Clear localStorage onboarding flag for new users
    localStorage.removeItem("onboardingSeen");
  } catch (e) {
    console.warn("SessionStorage not available, proceeding anyway");
  }

  // Redirect new users to email verification
  window.location.href = "verify-email.html";
}

/* ============================================
   DEMO LOGIN
   ============================================ */

/**
 * Demo login function - for Sign In (returning users)
 * Redirects directly to dashboard, skipping onboarding
 * Keeps existing data for returning users
 */
function demoLogin() {
  // Store demo user info in sessionStorage
  // NEW: Demo/returning users are also marked as owners
  var demoUser = {
    id: 1,
    name: "Demo User",
    email: "demo@dimeri.ai",
    role: "Risk Manager",
    isDemo: true,
    isNewUser: false,
    isOwner: true, // Mark as workspace owner
    userRole: "owner", // Role type
    permissions: {
      // Full permissions for owner
      canManageTeam: true,
      canManageSettings: true,
      canDelete: true,
      canInvite: true,
    },
  };

  try {
    sessionStorage.setItem("ermUser", JSON.stringify(demoUser));
    sessionStorage.setItem("ermLoggedIn", "true");
    // Returning users skip onboarding
    sessionStorage.setItem("ermOnboardingComplete", "true");
  } catch (e) {
    console.warn("SessionStorage not available, proceeding anyway");
  }

  // Redirect directly to main dashboard
  window.location.href = "index.html";
}

/* ============================================
   SESSION MANAGEMENT
   ============================================ */

/**
 * Check if user is already logged in
 * Called on page load
 */
function checkExistingSession() {
  try {
    var isLoggedIn = sessionStorage.getItem("ermLoggedIn");
    if (isLoggedIn === "true") {
      window.location.href = "index.html";
    }
  } catch (e) {
    // SessionStorage not available, continue normally
  }
}

/**
 * Logout function - clears session and redirects to login
 */
function logout() {
  try {
    sessionStorage.removeItem("ermUser");
    sessionStorage.removeItem("ermLoggedIn");
    sessionStorage.removeItem("ermOnboardingComplete");
  } catch (e) {
    // SessionStorage not available
  }
  window.location.href = "login.html";
}

/**
 * Get current user info
 * @returns {Object|null} User object or null if not logged in
 */
function getCurrentUser() {
  try {
    var userStr = sessionStorage.getItem("ermUser");
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (e) {
    console.warn("Could not retrieve user info");
  }
  return null;
}

/* ============================================
   INITIALIZATION
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  // Check for existing session
  checkExistingSession();

  // Add click handlers to tabs
  var tabs = document.querySelectorAll(".login-tab");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function () {
      var tabName = this.getAttribute("data-tab");
      switchTab(tabName);
    });
  }

  // Add input listeners for name and email fields to update button state
  var nameField = document.getElementById("signup-name");
  var emailField = document.getElementById("signup-email");

  if (nameField) {
    nameField.addEventListener("input", updateSignupButtonState);
  }
  if (emailField) {
    emailField.addEventListener("input", updateSignupButtonState);
  }
});

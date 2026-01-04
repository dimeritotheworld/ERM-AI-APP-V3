/**
 * Dimeri ERM Email Verification JavaScript
 * Handles OTP input, validation, and verification
 *
 * @version 1.0.0
 * ES5 Only - No arrow functions, no let/const, no classes
 */

/* ============================================
   STATE
   ============================================ */
var resendTimer = 60;
var resendInterval = null;
var demoOTP = "123456"; // Demo OTP for testing
var otpExpired = false;
var otpExpiryTime = 60 * 1000; // 60 seconds in milliseconds
var otpExpiryTimer = null;
var attemptCount = 0;
var maxAttempts = 5;

/* ============================================
   INITIALIZATION
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  // Check if user came from signup
  checkAuthStatus();

  // Display user email
  displayUserEmail();

  // Initialize OTP inputs
  initOTPInputs();

  // Start resend timer
  startResendTimer();

  // Start OTP expiry timer
  startOTPExpiryTimer();

  // Handle page visibility (detect tab switch/minimize)
  handlePageVisibility();
});

/**
 * Check if user is in signup flow
 */
function checkAuthStatus() {
  try {
    var isLoggedIn = sessionStorage.getItem("ermLoggedIn");
    var user = sessionStorage.getItem("ermUser");

    if (isLoggedIn !== "true" || !user) {
      // Not in signup flow, redirect to login
      window.location.href = "login.html";
    }
  } catch (e) {
    // SessionStorage not available, allow access for demo
  }
}

/**
 * Display user's email from session
 */
function displayUserEmail() {
  try {
    var userStr = sessionStorage.getItem("ermUser");
    if (userStr) {
      var user = JSON.parse(userStr);
      var emailEl = document.getElementById("user-email");
      if (emailEl && user.email) {
        emailEl.textContent = user.email;
      }
    }
  } catch (e) {
    // Use default email
  }
}

/* ============================================
   OTP INPUT HANDLING
   ============================================ */

/**
 * Initialize OTP input behavior
 */
function initOTPInputs() {
  var inputs = document.querySelectorAll(".otp-input");

  for (var i = 0; i < inputs.length; i++) {
    // Input event - auto advance
    inputs[i].addEventListener("input", function (e) {
      var input = e.target;
      var value = input.value;
      var index = parseInt(input.getAttribute("data-index"));

      // Only allow numbers
      input.value = value.replace(/[^0-9]/g, "");

      // Add filled class
      if (input.value.length > 0) {
        input.classList.add("filled");
        // Move to next input
        if (index < 6) {
          var nextInput = document.getElementById("otp-" + (index + 1));
          if (nextInput) {
            nextInput.focus();
          }
        }
      } else {
        input.classList.remove("filled");
      }

      // Clear error state
      clearOTPError();

      // Check if all filled
      checkAllFilled();
    });

    // Keydown event - handle backspace
    inputs[i].addEventListener("keydown", function (e) {
      var input = e.target;
      var index = parseInt(input.getAttribute("data-index"));

      if (e.key === "Backspace" && input.value === "" && index > 1) {
        // Move to previous input
        var prevInput = document.getElementById("otp-" + (index - 1));
        if (prevInput) {
          prevInput.focus();
          prevInput.value = "";
          prevInput.classList.remove("filled");
        }
      }

      // Handle Enter key
      if (e.key === "Enter") {
        verifyOTP();
      }
    });

    // Focus event - select all
    inputs[i].addEventListener("focus", function (e) {
      e.target.select();
    });

    // Paste event - handle paste
    inputs[i].addEventListener("paste", function (e) {
      e.preventDefault();
      var pasteData = (e.clipboardData || window.clipboardData).getData("text");
      var digits = pasteData.replace(/[^0-9]/g, "").substring(0, 6);

      if (digits.length > 0) {
        for (var j = 0; j < digits.length && j < 6; j++) {
          var inp = document.getElementById("otp-" + (j + 1));
          if (inp) {
            inp.value = digits[j];
            inp.classList.add("filled");
          }
        }

        // Focus last filled or next empty
        var focusIndex = Math.min(digits.length, 6);
        var focusInput = document.getElementById("otp-" + focusIndex);
        if (focusInput) {
          focusInput.focus();
        }

        checkAllFilled();
      }
    });
  }
}

/**
 * Get complete OTP value
 * @returns {string} 6-digit OTP
 */
function getOTPValue() {
  var otp = "";
  for (var i = 1; i <= 6; i++) {
    var input = document.getElementById("otp-" + i);
    if (input) {
      otp += input.value;
    }
  }
  return otp;
}

/**
 * Check if all OTP inputs are filled
 */
function checkAllFilled() {
  var otp = getOTPValue();
  var verifyBtn = document.getElementById("verify-btn");

  if (verifyBtn) {
    verifyBtn.disabled = otp.length !== 6;
  }
}

/**
 * Clear OTP error state
 */
function clearOTPError() {
  var inputs = document.querySelectorAll(".otp-input");
  var errorEl = document.getElementById("otp-error");

  for (var i = 0; i < inputs.length; i++) {
    inputs[i].classList.remove("error");
  }

  if (errorEl) {
    errorEl.textContent = "";
  }
}

/**
 * Show OTP error
 * @param {string} message - Error message
 */
function showOTPError(message) {
  var inputs = document.querySelectorAll(".otp-input");
  var errorEl = document.getElementById("otp-error");

  for (var i = 0; i < inputs.length; i++) {
    inputs[i].classList.add("error");
  }

  if (errorEl) {
    errorEl.textContent = message;
  }
}

/**
 * Show OTP success
 */
function showOTPSuccess() {
  var inputs = document.querySelectorAll(".otp-input");

  for (var i = 0; i < inputs.length; i++) {
    inputs[i].classList.remove("error");
    inputs[i].classList.add("success");
  }
}

/* ============================================
   VERIFICATION
   ============================================ */

/**
 * Verify the entered OTP
 */
function verifyOTP() {
  var otp = getOTPValue();

  if (otp.length !== 6) {
    showOTPError("Please enter all 6 digits");
    return;
  }

  // Check if OTP has expired
  if (otpExpired) {
    showOTPError("This code has expired. Please request a new one.");
    return;
  }

  // Check if max attempts reached
  if (attemptCount >= maxAttempts) {
    showOTPError("Too many attempts. Please request a new code.");
    enableResendButton();
    return;
  }

  attemptCount++;

  // Disable button during verification
  var verifyBtn = document.getElementById("verify-btn");
  if (verifyBtn) {
    verifyBtn.disabled = true;
    verifyBtn.textContent = "Verifying...";
  }

  // Simulate verification delay (Demo mode - accept any 6 digits or specific demo OTP)
  setTimeout(function () {
    // For demo: accept any 6-digit code or the demo OTP
    if (otp.length === 6) {
      // Success
      showOTPSuccess();

      // Mark email as verified
      try {
        sessionStorage.setItem("ermEmailVerified", "true");
      } catch (e) {
        // SessionStorage not available
      }

      // Clear timers
      clearOTPTimers();

      // Redirect to onboarding after short delay
      setTimeout(function () {
        window.location.href = "onboarding.html";
      }, 500);
    } else {
      // Error
      var remaining = maxAttempts - attemptCount;
      if (remaining > 0) {
        showOTPError("Invalid code. " + remaining + " attempt(s) remaining.");
      } else {
        showOTPError("Too many attempts. Please request a new code.");
        enableResendButton();
      }

      if (verifyBtn) {
        verifyBtn.disabled = false;
        verifyBtn.textContent = "Verify";
      }
    }
  }, 1000);
}

/* ============================================
   RESEND OTP
   ============================================ */

/**
 * Start the resend timer countdown
 */
function startResendTimer() {
  resendTimer = 60;
  updateResendButton();

  if (resendInterval) {
    clearInterval(resendInterval);
  }

  resendInterval = setInterval(function () {
    resendTimer--;
    updateResendButton();

    if (resendTimer <= 0) {
      clearInterval(resendInterval);
      enableResendButton();
    }
  }, 1000);
}

/**
 * Update resend button text
 */
function updateResendButton() {
  var timerEl = document.getElementById("resend-timer");
  var resendBtn = document.getElementById("resend-btn");

  if (timerEl) {
    timerEl.textContent = resendTimer;
  }

  if (resendBtn && resendTimer > 0) {
    resendBtn.innerHTML =
      'Resend OTP in <span id="resend-timer">' + resendTimer + "</span>s";
    resendBtn.disabled = true;
    resendBtn.classList.remove("active");
  }
}

/**
 * Enable resend button after timer ends
 */
function enableResendButton() {
  var resendBtn = document.getElementById("resend-btn");

  if (resendBtn) {
    resendBtn.innerHTML = "Resend OTP";
    resendBtn.disabled = false;
    resendBtn.classList.add("active");
  }
}

/**
 * Resend OTP
 */
function resendOTP() {
  var resendBtn = document.getElementById("resend-btn");

  if (resendBtn) {
    resendBtn.disabled = true;
    resendBtn.textContent = "Sending...";
  }

  // Simulate sending (Demo mode)
  setTimeout(function () {
    // Reset attempt counter and expiry state
    attemptCount = 0;
    otpExpired = false;

    // Clear existing inputs
    for (var i = 1; i <= 6; i++) {
      var input = document.getElementById("otp-" + i);
      if (input) {
        input.value = "";
        input.classList.remove("filled", "error", "success");
      }
    }

    // Focus first input
    var firstInput = document.getElementById("otp-1");
    if (firstInput) {
      firstInput.focus();
    }

    // Clear error
    clearOTPError();

    // Restart resend timer
    startResendTimer();

    // Restart OTP expiry timer
    startOTPExpiryTimer();

    // Show success message briefly
    var errorEl = document.getElementById("otp-error");
    if (errorEl) {
      errorEl.style.color = "#27ae60";
      errorEl.textContent = "New code sent to your email!";
      setTimeout(function () {
        errorEl.style.color = "";
        errorEl.textContent = "";
      }, 3000);
    }
  }, 1000);
}

/* ============================================
   OTP EXPIRY HANDLING
   ============================================ */

/**
 * Start OTP expiry timer
 */
function startOTPExpiryTimer() {
  // Clear existing timer
  if (otpExpiryTimer) {
    clearTimeout(otpExpiryTimer);
  }

  otpExpired = false;

  // Set new timer
  otpExpiryTimer = setTimeout(function () {
    otpExpired = true;
    showOTPError("This code has expired. Please request a new one.");
    enableResendButton();

    // Disable verify button
    var verifyBtn = document.getElementById("verify-btn");
    if (verifyBtn) {
      verifyBtn.disabled = true;
    }
  }, otpExpiryTime);
}

/**
 * Clear all OTP timers
 */
function clearOTPTimers() {
  if (resendInterval) {
    clearInterval(resendInterval);
  }
  if (otpExpiryTimer) {
    clearTimeout(otpExpiryTimer);
  }
}

/**
 * Handle page visibility changes (user switches tabs or minimizes)
 */
function handlePageVisibility() {
  // Detect when user returns to the page
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      // User returned to the page - check if we need to restore session
      checkAuthStatus();
    }
  });

  // Handle page unload/reload
  window.addEventListener("beforeunload", function () {
    // Store timestamp for potential recovery
    try {
      sessionStorage.setItem("ermOTPPageLeft", Date.now().toString());
    } catch (e) {
      // Ignore
    }
  });
}

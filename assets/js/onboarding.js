/**
 * Dimeri ERM Onboarding
 * 3-Step onboarding: Welcome → Industry → Workspace
 *
 * @version 2.0.0
 */

(function () {
  "use strict";

  var TOTAL_STEPS = 3;
  var currentStep = 1;
  var selectedIndustry = null;

  // Industry display names
  var industryNames = {
    "public-sector": "Public Sector",
    healthcare: "Healthcare",
    "oil-gas": "Oil & Gas",
    energy: "Energy & Utilities",
    manufacturing: "Manufacturing",
    mining: "Mining",
  };

  /**
   * Initialize onboarding
   */
  function init() {
    // Check if user is logged in
    checkAuthStatus();

    // Check if onboarding already completed
    checkOnboardingStatus();

    updateProgress();
    updateButtons();
    bindIndustrySelection();
    bindWorkspaceInput();

    // Check if returning user
    var savedIndustry = localStorage.getItem("ERM_industry");
    if (savedIndustry) {
      selectIndustry(savedIndustry);
    }

    var savedWorkspace = localStorage.getItem("ERM_workspace");
    if (savedWorkspace) {
      var input = document.getElementById("workspace-name");
      if (input) {
        input.value = savedWorkspace;
      }
    }
  }

  /**
   * Check if user is authenticated
   */
  function checkAuthStatus() {
    try {
      var isLoggedIn = sessionStorage.getItem("ermLoggedIn");
      if (isLoggedIn !== "true") {
        // Not logged in, redirect to login
        window.location.href = "login.html";
      }
    } catch (e) {
      // SessionStorage not available, allow access
    }
  }

  /**
   * Check if user has already completed onboarding
   */
  function checkOnboardingStatus() {
    try {
      var onboardingComplete = sessionStorage.getItem("ermOnboardingComplete");
      if (onboardingComplete === "true") {
        // Already completed this session, redirect to dashboard
        window.location.href = "index.html";
      }
    } catch (e) {
      // Storage not available, continue with onboarding
    }
  }

  /**
   * Go to next step
   */
  function nextStep() {
    // Validate current step before proceeding
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      currentStep++;
      showStep(currentStep);
    } else {
      completeOnboarding();
    }
  }

  /**
   * Go to previous step
   */
  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
    }
  }

  /**
   * Go to specific step
   */
  function goToStep(step) {
    if (step >= 1 && step <= TOTAL_STEPS) {
      // Only allow going to completed steps or next step
      if (step <= currentStep || step === currentStep + 1) {
        if (step > currentStep && !validateStep(currentStep)) {
          return;
        }
        currentStep = step;
        showStep(currentStep);
      }
    }
  }

  /**
   * Show a specific step
   */
  function showStep(step) {
    var steps = document.querySelectorAll(".onboarding-step");
    var dots = document.querySelectorAll(".dot");

    // Hide all steps
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.remove("active");
    }

    // Show current step
    var currentStepEl = document.querySelector('[data-step="' + step + '"]');
    if (currentStepEl) {
      currentStepEl.classList.add("active");
    }

    // Update dots
    for (var j = 0; j < dots.length; j++) {
      var dotStep = parseInt(dots[j].getAttribute("data-step"), 10);
      dots[j].classList.remove("active", "completed");

      if (dotStep === step) {
        dots[j].classList.add("active");
      } else if (dotStep < step) {
        dots[j].classList.add("completed");
      }
    }

    updateProgress();
    updateButtons();
    updateSummary();
  }

  /**
   * Update progress bar
   */
  function updateProgress() {
    var progressBar = document.getElementById("progress-bar");
    if (progressBar) {
      var progress = (currentStep / TOTAL_STEPS) * 100;
      progressBar.style.width = progress + "%";
    }
  }

  /**
   * Update navigation buttons
   */
  function updateButtons() {
    var prevBtn = document.getElementById("btn-prev");
    var nextBtn = document.getElementById("btn-next");

    // Previous button
    if (prevBtn) {
      prevBtn.disabled = currentStep === 1;
      prevBtn.style.visibility = currentStep === 1 ? "hidden" : "visible";
    }

    // Next button
    if (nextBtn) {
      if (currentStep === TOTAL_STEPS) {
        nextBtn.innerHTML =
          'Get Started <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7" /></svg>';
        nextBtn.classList.remove("btn-primary");
        nextBtn.classList.add("btn-success");
      } else {
        nextBtn.innerHTML =
          'Next <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7" /></svg>';
        nextBtn.classList.remove("btn-success");
        nextBtn.classList.add("btn-primary");
      }

      // Disable if validation fails
      nextBtn.disabled = !canProceed();
    }
  }

  /**
   * Check if can proceed from current step
   */
  function canProceed() {
    switch (currentStep) {
      case 1:
        return true; // Welcome screen - always can proceed
      case 2:
        return selectedIndustry !== null; // Must select industry
      case 3:
        var input = document.getElementById("workspace-name");
        return input && input.value.trim().length >= 2; // Must have workspace name
      default:
        return true;
    }
  }

  /**
   * Validate current step
   */
  function validateStep(step) {
    switch (step) {
      case 1:
        return true;
      case 2:
        if (!selectedIndustry) {
          showValidationMessage("Please select an industry to continue.");
          return false;
        }
        return true;
      case 3:
        var input = document.getElementById("workspace-name");
        if (!input || input.value.trim().length < 2) {
          showValidationMessage("Please enter a workspace name.");
          if (input) input.focus();
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  /**
   * Show validation message
   */
  function showValidationMessage(message) {
    // Simple alert for now - could be enhanced with toast
    alert(message);
  }

  /**
   * Bind industry card selection
   */
  function bindIndustrySelection() {
    var cards = document.querySelectorAll(".industry-card:not(.disabled)");

    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener("click", function () {
        var industry = this.getAttribute("data-industry");
        selectIndustry(industry);
      });
    }
  }

  /**
   * Select an industry
   */
  function selectIndustry(industry) {
    selectedIndustry = industry;

    // Update UI
    var cards = document.querySelectorAll(".industry-card");
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.remove("selected");
      if (cards[i].getAttribute("data-industry") === industry) {
        cards[i].classList.add("selected");
      }
    }

    // Save to localStorage
    localStorage.setItem("ERM_industry", industry);

    updateButtons();
    updateSummary();
  }

  /**
   * Bind workspace input events
   */
  function bindWorkspaceInput() {
    var input = document.getElementById("workspace-name");
    if (input) {
      input.addEventListener("input", function () {
        updateButtons();
      });

      input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          nextStep();
        }
      });
    }
  }

  /**
   * Update setup summary on final step
   */
  function updateSummary() {
    var summaryIndustry = document.getElementById("summary-industry");
    if (summaryIndustry) {
      summaryIndustry.textContent = selectedIndustry
        ? industryNames[selectedIndustry] || selectedIndustry
        : "Not selected";
    }
  }

  /**
   * Complete onboarding and redirect
   */
  function completeOnboarding() {
    var workspaceInput = document.getElementById("workspace-name");
    var workspaceName = workspaceInput ? workspaceInput.value.trim() : "";

    try {
      // Mark onboarding as seen
      localStorage.setItem("onboardingSeen", "true");
      localStorage.setItem("ERM_onboarding_complete", "true");

      // Save workspace name
      if (workspaceName) {
        localStorage.setItem("ERM_workspace", workspaceName);
        localStorage.setItem("ermWorkspace", workspaceName);
      }

      // Industry already saved during selection

      // Update ERM state
      var ermState = JSON.parse(localStorage.getItem("ERM_state") || "{}");
      ermState.organization = ermState.organization || {};
      ermState.organization.name = workspaceName;
      ermState.organization.industry = selectedIndustry;
      localStorage.setItem("ERM_state", JSON.stringify(ermState));

      // Update user session
      var userStr = sessionStorage.getItem("ermUser");
      var user = null;
      if (userStr) {
        user = JSON.parse(userStr);
        user.workspace = workspaceName;
        user.industry = selectedIndustry;
        sessionStorage.setItem("ermUser", JSON.stringify(user));
      }

      // NEW: Create workspace metadata with owner information
      if (user) {
        var workspace = {
          id: "workspace_" + Date.now(),
          name: workspaceName || "My Workspace",
          ownerId: user.id,
          ownerEmail: user.email,
          ownerName: user.name,
          createdAt: new Date().toISOString(),
          industry: selectedIndustry,
          members: [user.id], // Owner is first member
        };
        localStorage.setItem("erm_currentWorkspace", JSON.stringify(workspace));
      }

      // Mark onboarding complete in session
      sessionStorage.setItem("ermOnboardingComplete", "true");
    } catch (e) {
      console.warn("Could not save onboarding state:", e);
    }

    // Redirect to main app
    window.location.href = "index.html";
  }

  /**
   * Skip onboarding
   */
  function skipOnboarding() {
    showSkipConfirmModal();
  }

  /**
   * Show skip confirmation modal
   */
  function showSkipConfirmModal() {
    // Create overlay
    var overlay = document.createElement("div");
    overlay.className = "skip-modal-overlay";
    overlay.id = "skip-modal-overlay";

    // Create modal
    var modal = document.createElement("div");
    modal.className = "skip-modal";
    modal.innerHTML =
      '<div class="skip-modal-content">' +
      '<div class="skip-modal-icon">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<polygon points="5 3 19 12 5 21 5 3"></polygon>' +
      '<line x1="19" y1="3" x2="19" y2="21"></line>' +
      '</svg>' +
      '</div>' +
      '<h3 class="skip-modal-title">Skip setup?</h3>' +
      '<p class="skip-modal-message">You can configure these settings later from your workspace settings.</p>' +
      '<div class="skip-modal-buttons">' +
      '<button class="btn btn-secondary" onclick="closeSkipModal()">Cancel</button>' +
      '<button class="btn btn-primary" onclick="confirmSkip()">Skip Setup</button>' +
      '</div>' +
      '</div>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Animate in
    setTimeout(function () {
      overlay.classList.add("active");
    }, 10);
  }

  /**
   * Close skip modal
   */
  function closeSkipModal() {
    var overlay = document.getElementById("skip-modal-overlay");
    if (overlay) {
      overlay.classList.remove("active");
      setTimeout(function () {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 300);
    }
  }

  /**
   * Confirm skip and redirect
   */
  function confirmSkip() {
    localStorage.setItem("ERM_onboarding_complete", "true");
    sessionStorage.setItem("ermOnboardingComplete", "true");
    window.location.href = "index.html";
  }

  // Expose functions globally
  window.nextStep = nextStep;
  window.prevStep = prevStep;
  window.goToStep = goToStep;
  window.skipOnboarding = skipOnboarding;
  window.closeSkipModal = closeSkipModal;
  window.confirmSkip = confirmSkip;

  // Initialize when DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/**
 * Dimeri ERM - AI Assistant Module
 * General AI Panel for Context-Aware Actions
 *
 * Responsibilities:
 * - Floating AI button and panel
 * - Context-aware actions based on current view
 * - View-level AI insights (dashboard, controls)
 * - Risk/Control form-level actions (from panel)
 *
 * NOTE: Field-level suggestions for Risk Register are in risk-register-ai-ui.js
 *
 * @version 2.1.0
 * ES5 Compatible
 */

console.log("Loading ai-assistant.js...");

var ERM = window.ERM || {};
ERM.ai = ERM.ai || {};

/* ========================================
   AI STATE
   ======================================== */
ERM.ai.state = {
  isProcessing: false,
  currentContext: "dashboard",
};

/* ========================================
   AI ICONS
   ======================================== */
ERM.ai.icons = {
  sparkles:
    '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>',
  check:
    '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>',
  edit: '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  zap: '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  shield:
    '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  target:
    '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  link: '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  alertCircle:
    '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
};

/* ========================================
   HELPER FUNCTIONS
   ======================================== */

/**
 * Escape HTML to prevent XSS
 */
ERM.ai.escapeHtml = function (str) {
  if (!str) return "";
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Call DeepSeek API for AI-enhanced review analysis
 * @param {string} type - "risk" or "control"
 * @param {object} context - The data to analyze
 * @param {function} callback - Callback with AI response
 */
ERM.ai.callDeepSeekReview = function (type, context, callback) {
  if (typeof ERM.aiService === "undefined" || !ERM.aiService.callAPI) {
    console.warn("ERM.aiService not available for DeepSeek review");
    if (callback) callback(null);
    return;
  }

  // Get industry context
  var industry = "general";
  if (typeof ERM.riskAI !== "undefined" && ERM.riskAI.getCurrentIndustry) {
    industry = ERM.riskAI.getCurrentIndustry() || "general";
  }

  var prompt = "";
  if (type === "risk") {
    prompt =
      "You are an expert enterprise risk management consultant with deep expertise in the " + industry + " industry. " +
      "Analyze this risk entry thoroughly and provide a comprehensive assessment.\n\n" +
      "RISK DETAILS:\n" +
      "Risk Title: " + (context.title || "Not provided") + "\n" +
      "Description: " + (context.description || "Not provided") + "\n" +
      "Category: " + (context.category || "Not provided") + "\n" +
      "Owner: " + (context.owner || "Not assigned") + "\n" +
      "Treatment: " + (context.treatment || "Not specified") + "\n" +
      "Inherent Risk Score: " + (context.inherentScore || "Not calculated") + "/25\n" +
      "Residual Risk Score: " + (context.residualScore || "Not calculated") + "/25\n" +
      "Root Causes: " + (context.rootCauses && context.rootCauses.length > 0 ? context.rootCauses.join(", ") : "None listed") + "\n" +
      "Consequences: " + (context.consequences && context.consequences.length > 0 ? context.consequences.join(", ") : "None listed") + "\n" +
      "Linked Controls: " + (context.linkedControls || 0) + " controls\n\n" +
      "Provide a structured review covering:\n" +
      "1. DOCUMENTATION QUALITY: How well is this risk documented? Are there gaps?\n" +
      "2. RISK ASSESSMENT: Is the scoring appropriate for this type of risk in " + industry + "?\n" +
      "3. CONTROL ADEQUACY: Given the risk severity, are the linked controls sufficient?\n" +
      "4. RECOMMENDATIONS: 2-3 specific, actionable improvements.\n\n" +
      "Be concise but thorough. Use your " + industry + " industry expertise.";
  } else if (type === "control") {
    prompt =
      "You are an expert internal controls consultant with deep expertise in the " + industry + " industry. " +
      "Analyze this control entry thoroughly and provide a comprehensive assessment.\n\n" +
      "CONTROL DETAILS:\n" +
      "Control Name: " + (context.name || "Not provided") + "\n" +
      "Type: " + (context.type || "Not specified") + "\n" +
      "Category: " + (context.category || "Not specified") + "\n" +
      "Owner: " + (context.owner || "Not assigned") + "\n" +
      "Frequency: " + (context.frequency || "Not specified") + "\n" +
      "Effectiveness: " + (context.effectiveness || "Not tested") + "\n" +
      "Status: " + (context.status || "Unknown") + "\n" +
      "Description: " + (context.descriptions && context.descriptions.length > 0 ? context.descriptions.join(" ") : "None provided") + "\n" +
      "Linked Risks: " + (context.linkedRisks || 0) + " risks\n" +
      "Last Review: " + (context.lastReviewDate || "Never") + "\n" +
      "Next Review: " + (context.nextReviewDate || "Not scheduled") + "\n\n" +
      "Provide a structured review covering:\n" +
      "1. CONTROL DESIGN: Is this control well-designed for the " + industry + " industry?\n" +
      "2. EFFECTIVENESS: Based on the testing frequency and status, is this control likely effective?\n" +
      "3. COVERAGE: Are there enough linked risks? Are there gaps in control coverage?\n" +
      "4. RECOMMENDATIONS: 2-3 specific, actionable improvements.\n\n" +
      "Be concise but thorough. Use your " + industry + " industry expertise.";
  }

  if (!prompt) {
    if (callback) callback(null);
    return;
  }

  ERM.aiService.callAPI(
    prompt,
    function (response) {
      if (response && response.success && response.text) {
        // Note: AI counter is now incremented centrally in ai-service.js callAPI()
        // This ensures consistent counting for all API calls
        console.log("[AI Review] Review generated successfully, count handled by AIService");

        callback(response.text);
      } else {
        console.warn("DeepSeek review error:", response ? response.error : "No response");
        callback(null);
      }
    },
    { maxTokens: 800 }
  );
};

/* ========================================
   CONTEXT-AWARE AI ACTIONS
   Returns actions based on current view/form
   ======================================== */
ERM.ai.getContextActions = function () {
  var context = ERM.state ? ERM.state.currentView : "dashboard";
  var actions = [];

  // Check if a form modal is open
  var riskFormOpen =
    document.querySelector(
      ".modal-overlay.active .risk-form, .modal-overlay.active #risk-form"
    ) !== null;
  var controlFormOpen =
    document.querySelector(
      ".modal-overlay.active .control-form, .modal-overlay.active #control-form"
    ) !== null;

  if (controlFormOpen) {
    // Control Form Actions
    actions = [
      {
        id: "improve-control-desc",
        icon: this.icons.edit,
        label: "Improve Description",
        description: "Rewrite in ISO 31000 format",
        type: "control-form",
      },
      {
        id: "suggest-control-type",
        icon: this.icons.target,
        label: "Suggest Control Type",
        description: "Analyze and suggest type",
        type: "control-form",
      },
      {
        id: "suggest-linked-risks",
        icon: this.icons.link,
        label: "Suggest Linked Risks",
        description: "Find matching risks",
        type: "control-form",
      },
      {
        id: "control-strength-check",
        icon: this.icons.check,
        label: "Strength Check",
        description: "Evaluate control quality",
        type: "control-form",
      },
    ];
  } else if (riskFormOpen) {
    // Risk Form Actions (panel-level, not field-level)
    actions = [
      {
        id: "generate-risk",
        icon: this.icons.zap,
        label: "Generate Entire Risk",
        description: "Auto-fill all fields",
        type: "form",
      },
      {
        id: "review-risk",
        icon: this.icons.check,
        label: "Review Entire Risk",
        description: "Check completeness",
        type: "form",
      },
      {
        id: "improve-risk",
        icon: this.icons.edit,
        label: "Improve Wording",
        description: "Rewrite in ISO 31000 format",
        type: "form",
      },
      {
        id: "suggest-controls",
        icon: this.icons.shield,
        label: "Suggest Controls",
        description: "Generate controls",
        type: "form",
      },
      {
        id: "validate-scoring",
        icon: this.icons.target,
        label: "Validate Scoring",
        description: "Check score consistency",
        type: "form",
      },
    ];
  } else {
    // View-level actions based on current module
    switch (context) {
      case "risk-register":
        actions = [
          {
            id: "suggest-new-risk",
            icon: this.icons.zap,
            label: "Suggest new risk",
            type: "view",
          },
          {
            id: "review-register",
            icon: this.icons.check,
            label: "Review completeness",
            type: "view",
          },
          {
            id: "identify-gaps",
            icon: this.icons.target,
            label: "Identify gaps",
            type: "view",
          },
        ];
        break;
      case "controls":
        actions = [
          {
            id: "suggest-new-control",
            icon: this.icons.shield,
            label: "Suggest new control",
            type: "view",
          },
          {
            id: "analyze-control-gaps",
            icon: this.icons.alertCircle,
            label: "Identify control gaps",
            type: "view",
          },
          {
            id: "map-controls-risks",
            icon: this.icons.link,
            label: "Map controls to risks",
            type: "view",
          },
          {
            id: "review-effectiveness",
            icon: this.icons.check,
            label: "Review effectiveness",
            type: "view",
          },
        ];
        break;
      default:
        // Dashboard actions
        actions = [
          {
            id: "explain-heatmap",
            icon: this.icons.sparkles,
            label: "Explain heatmap",
            type: "view",
          },
          {
            id: "identify-trends",
            icon: this.icons.target,
            label: "Identify trends",
            type: "view",
          },
          {
            id: "summarize-risks",
            icon: this.icons.edit,
            label: "Summarize top risks",
            type: "view",
          },
        ];
    }
  }

  return actions;
};

/* ========================================
   EXECUTE AI ACTION
   Routes action to appropriate handler
   ======================================== */
ERM.ai.executeAction = function (actionId) {
  var self = this;

  if (this.state.isProcessing) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.info("AI is processing...");
    }
    return;
  }

  this.state.isProcessing = true;
  this.showProcessing();

  setTimeout(function () {
    self.state.isProcessing = false;
    self.hideProcessing();

    switch (actionId) {
      // Control Form actions
      case "improve-control-desc":
        self.executeControlAction("improve-desc");
        break;
      case "suggest-control-type":
        self.executeControlAction("suggest-type");
        break;
      case "suggest-linked-risks":
        self.executeControlAction("suggest-risks");
        break;
      case "control-strength-check":
        self.executeControlAction("strength-check");
        break;

      // Risk Form actions (panel-level)
      case "generate-risk":
        self.generateEntireRisk();
        break;
      case "review-risk":
        self.reviewEntireRisk();
        break;
      case "improve-risk":
        self.improveRiskWording();
        break;
      case "suggest-controls":
        self.suggestControlsForRisk();
        break;
      case "validate-scoring":
        self.validateRiskScoring();
        break;

      // Controls View actions
      case "suggest-new-control":
        self.suggestNewControl();
        break;
      case "analyze-control-gaps":
        self.analyzeControlGaps();
        break;
      case "map-controls-risks":
        self.mapControlsToRisks();
        break;
      case "review-effectiveness":
        self.reviewControlEffectiveness();
        break;

      // View actions
      default:
        self.handleViewAction(actionId);
    }

    // Close panel after action
    var panel = document.getElementById("ai-panel");
    if (panel) panel.classList.remove("active");
  }, 600);
};

/* ========================================
   RISK FORM PANEL ACTIONS
   These are triggered from the AI panel
   ======================================== */

/**
 * Generate entire risk from title
 */
ERM.ai.generateEntireRisk = function () {
  var title = this.getFieldValue("risk-title");
  var category = this.getFieldValue("risk-category");

  if (!title) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.error("Please enter a risk title first");
    }
    var titleField = document.getElementById("risk-title");
    if (titleField) titleField.focus();
    return;
  }

  // Auto-detect category if not set
  if (
    !category &&
    typeof ERM.riskAI !== "undefined" &&
    ERM.riskAI.detectCategory
  ) {
    category = ERM.riskAI.detectCategory(title);
    var categoryField = document.getElementById("risk-category");
    if (categoryField && category) {
      categoryField.value = category;
    }
  }

  // Use riskAI templates if available
  var causes = ["Inadequate controls", "Process weaknesses"];
  var consequences = ["Financial impact", "Operational disruption"];

  if (typeof ERM.riskAI !== "undefined" && ERM.riskAI.getCausesSuggestions) {
    causes = ERM.riskAI.getCausesSuggestions(title, category).slice(0, 2);
  }
  if (
    typeof ERM.riskAI !== "undefined" &&
    ERM.riskAI.getConsequencesSuggestions
  ) {
    consequences = ERM.riskAI
      .getConsequencesSuggestions(title, category)
      .slice(0, 2);
  }

  // Generate description
  var description =
    "Risk of " +
    title.toLowerCase() +
    " due to " +
    causes[0].toLowerCase() +
    " and " +
    causes[1].toLowerCase() +
    ". " +
    "This may result in " +
    consequences[0].toLowerCase() +
    " and " +
    consequences[1].toLowerCase() +
    ". " +
    "Requires proactive monitoring and mitigation strategies.";

  var descField = document.getElementById("risk-description");
  if (descField) {
    descField.value = description;
    descField.classList.add("ai-filled");
    setTimeout(function () {
      descField.classList.remove("ai-filled");
    }, 2000);
  }

  // Set default treatment
  var treatmentField = document.getElementById("risk-treatment");
  if (treatmentField && !treatmentField.value) {
    treatmentField.value = "Mitigate";
  }

  if (typeof ERM.toast !== "undefined") {
    ERM.toast.success("AI generated risk content");
  }
};

/**
 * Review entire risk for completeness
 */
ERM.ai.reviewEntireRisk = function () {
  var self = this;

  // Check AI limit before proceeding
  if (typeof ERM.enforcement !== 'undefined' && ERM.enforcement.canUseAI) {
    var aiCheck = ERM.enforcement.canUseAI();
    if (!aiCheck.allowed && typeof ERM.upgradeModal !== 'undefined') {
      // Show upgrade modal for AI limit
      ERM.upgradeModal.show({
        title: 'AI Limit Reached',
        message: aiCheck.message,
        feature: 'AI Risk Review',
        upgradeMessage: aiCheck.upgradeMessage
      });
      return;
    }
  }

  // Show thinking animation first
  this.showRiskReviewThinking(function () {
    self.performRiskReview();
  });
};

/**
 * Show AI thinking animation for risk review
 * Uses the same design pattern as "Describe with AI" thinking modal
 */
ERM.ai.showRiskReviewThinking = function (onComplete) {
  var steps = [
    { text: "Analyzing risk details", delay: 600 },
    { text: "Checking completeness", delay: 500 },
    { text: "Validating scores", delay: 600 },
    { text: "Generating feedback", delay: 500 },
  ];

  // Sparkles icon for header
  var sparklesIcon = '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>';

  var stepsHtml = "";
  for (var i = 0; i < steps.length; i++) {
    stepsHtml +=
      '<div class="ai-step" data-step="' + i + '">' +
      '<div class="ai-step-icon">' +
      '<svg class="ai-step-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="50" stroke-linecap="round"/></svg>' +
      '<svg class="ai-step-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
      "</div>" +
      '<span class="ai-step-text">' + steps[i].text + "</span>" +
      '<span class="ai-step-dots"><span>.</span><span>.</span><span>.</span></span>' +
      "</div>";
  }

  var content =
    '<div class="ai-thinking-container">' +
    '<div class="ai-thinking-header">' +
    '<div class="ai-brain-animation">' +
    '<div class="ai-brain-circle"></div>' +
    '<div class="ai-brain-circle"></div>' +
    '<div class="ai-brain-circle"></div>' +
    sparklesIcon +
    "</div>" +
    "<h3>AI is reviewing your risk</h3>" +
    "</div>" +
    '<div class="ai-steps-container">' +
    stepsHtml +
    "</div>" +
    "</div>";

  if (
    typeof ERM.components !== "undefined" &&
    ERM.components.showSecondaryModal
  ) {
    ERM.components.showSecondaryModal({
      title: "",
      content: content,
      buttons: [],
      size: "small",
      onOpen: function () {
        // Style the modal to match ai-thinking-modal pattern
        var modal = document.querySelector(".secondary-overlay .modal");
        var modalContent = document.querySelector(".secondary-overlay .modal-content");
        var modalHeader = document.querySelector(".secondary-overlay .modal-header");
        var modalBody = document.querySelector(".secondary-overlay .modal-body");
        var modalFooter = document.querySelector(".secondary-overlay .modal-footer");

        if (modal) {
          modal.classList.add("ai-thinking-modal");
        }

        // Hide header
        if (modalHeader) {
          modalHeader.style.display = "none";
        }

        // Hide footer
        if (modalFooter) {
          modalFooter.style.display = "none";
        }

        // Fix body styling
        if (modalBody) {
          modalBody.style.cssText = "padding: 0 !important; max-height: none !important; overflow: visible !important;";
        }

        // Fix modal content wrapper
        if (modalContent) {
          modalContent.style.cssText = "max-height: none !important; overflow: visible !important;";
        }

        function animateStep(stepIndex) {
          if (stepIndex >= steps.length) {
            setTimeout(function () {
              ERM.components.closeSecondaryModal();
              setTimeout(function () {
                if (onComplete) {
                  try {
                    onComplete();
                  } catch (e) {
                    console.error("AI Review callback error:", e);
                  }
                }
              }, 200);
            }, 400);
            return;
          }

          var stepEl = document.querySelector(
            '.secondary-overlay .ai-step[data-step="' + stepIndex + '"]'
          );
          if (stepEl) {
            stepEl.classList.add("active");

            setTimeout(function () {
              stepEl.classList.remove("active");
              stepEl.classList.add("complete");
              animateStep(stepIndex + 1);
            }, steps[stepIndex].delay);
          } else {
            animateStep(stepIndex + 1);
          }
        }

        setTimeout(function () {
          animateStep(0);
        }, 300);
      },
    });
  } else {
    console.log("Secondary modal not available, calling directly");
    if (onComplete) onComplete();
  }
};

/**
 * Perform the actual risk review - comprehensive validation
 */
ERM.ai.performRiskReview = function () {
  console.log("performRiskReview called");

  try {
    var issues = []; // Critical - should fix
    var warnings = []; // Recommendations - nice to fix
    var strengths = []; // What's good

    // Get all form values
    var title = this.getFieldValue("risk-title");
    var description = this.getFieldValue("risk-description");
    var category = this.getFieldValue("risk-category");
    var owner = this.getFieldValue("risk-owner");
    var actionOwner = this.getFieldValue("risk-action-owner");
    var treatment = this.getFieldValue("risk-treatment");
    var status = this.getFieldValue("risk-status");
    var targetDate = this.getFieldValue("risk-target-date");
    var reviewDate = this.getFieldValue("risk-review-date");

    var inhL = parseInt(this.getFieldValue("inherent-likelihood")) || 0;
    var inhI = parseInt(this.getFieldValue("inherent-impact")) || 0;
    var resL = parseInt(this.getFieldValue("residual-likelihood")) || 0;
    var resI = parseInt(this.getFieldValue("residual-impact")) || 0;
    var inhScore = inhL * inhI;
    var resScore = resL * resI;

    // Get list items
    var rootCauses = this.getListItems("rootCauses-list");
    var consequences = this.getListItems("consequences-list");
    var actionPlan = this.getListItems("actionPlan-list");
    var linkedControls = this.getLinkedControls();

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    // ========================================
    // 1. SCORE LOGIC VALIDATION
    // ========================================
    if (inhScore === 0) {
      issues.push(
        "Inherent risk not assessed - set likelihood and impact scores"
      );
    }
    if (resL > inhL) {
      issues.push(
        "Residual likelihood (" +
          resL +
          ") exceeds inherent (" +
          inhL +
          ") - controls should not increase likelihood"
      );
    }
    if (resI > inhI) {
      warnings.push(
        "Residual impact (" +
          resI +
          ") exceeds inherent (" +
          inhI +
          ") - impact rarely increases after controls"
      );
    }
    if (inhScore > 0 && resScore >= inhScore && linkedControls.length > 0) {
      warnings.push(
        "Residual score (" +
          resScore +
          ") not lower than inherent (" +
          inhScore +
          ") despite linked controls"
      );
    }
    if (inhScore >= 15 && linkedControls.length === 0) {
      issues.push(
        "Critical/High inherent risk with no linked controls - unmitigated exposure"
      );
    }
    if (inhScore > 0 && resScore < inhScore) {
      strengths.push("Controls effectively reducing risk score");
    }

    // ========================================
    // 2. TREATMENT LOGIC VALIDATION
    // ========================================
    if (treatment === "accept") {
      if (inhScore >= 15) {
        warnings.push(
          "Accepting a Critical risk - ensure management approval is documented"
        );
      } else if (inhScore >= 10) {
        warnings.push(
          "Accepting a High risk - confirm this is within risk appetite"
        );
      }
      if (actionPlan.length > 0) {
        strengths.push("Action plan documented even for accepted risk");
      }
    }
    if (treatment === "mitigate") {
      if (actionPlan.length === 0) {
        issues.push("Treatment is 'Mitigate' but no action plan defined");
      }
      if (linkedControls.length === 0) {
        warnings.push(
          "Treatment is 'Mitigate' but no controls linked - how will risk be reduced?"
        );
      }
      if (resScore >= inhScore && inhScore > 0) {
        warnings.push("Treatment is 'Mitigate' but residual risk not reduced");
      }
      if (actionPlan.length > 0 && linkedControls.length > 0) {
        strengths.push(
          "Mitigation strategy well-defined with actions and controls"
        );
      }
    }
    if (treatment === "transfer") {
      var transferKeywords = [
        "insurance",
        "outsource",
        "third party",
        "vendor",
        "contract",
        "indemnity",
      ];
      var hasTransferRef = false;
      var descLower = (description || "").toLowerCase();
      var actionsLower = actionPlan.join(" ").toLowerCase();
      for (var t = 0; t < transferKeywords.length; t++) {
        if (
          descLower.indexOf(transferKeywords[t]) !== -1 ||
          actionsLower.indexOf(transferKeywords[t]) !== -1
        ) {
          hasTransferRef = true;
          break;
        }
      }
      if (!hasTransferRef) {
        warnings.push(
          "Treatment is 'Transfer' - consider documenting insurance, outsourcing, or third-party arrangements"
        );
      }
    }
    if (treatment === "avoid") {
      if (actionPlan.length === 0) {
        warnings.push(
          "Treatment is 'Avoid' - document how the risk-generating activity will be eliminated"
        );
      }
    }
    if (treatment) {
      strengths.push("Treatment decision documented");
    }

    // ========================================
    // 3. OWNERSHIP & ACCOUNTABILITY
    // ========================================
    if (!owner) {
      issues.push("No Risk Owner assigned - who is accountable for this risk?");
    } else {
      strengths.push("Risk Owner assigned");
    }
    if (actionPlan.length > 0 && !actionOwner) {
      warnings.push(
        "Action plan exists but no Action Owner - who will implement?"
      );
    }
    if (owner && actionOwner && owner === actionOwner) {
      warnings.push(
        "Risk Owner and Action Owner are the same - consider separation for oversight"
      );
    }
    if (targetDate) {
      var target = new Date(targetDate);
      if (target < today) {
        issues.push("Target date is in the past - action may be overdue");
      } else if (inhScore >= 15) {
        var threeMonths = new Date();
        threeMonths.setMonth(threeMonths.getMonth() + 3);
        if (target > threeMonths) {
          warnings.push(
            "Target date is over 3 months away for a Critical/High risk"
          );
        }
      }
      strengths.push("Target date set for action completion");
    } else if (actionPlan.length > 0) {
      warnings.push(
        "Action plan exists but no target date - when should actions be completed?"
      );
    }
    if (reviewDate) {
      var review = new Date(reviewDate);
      if (review < today) {
        warnings.push(
          "Review date is in the past - risk may need reassessment"
        );
      }
      strengths.push("Review date scheduled");
    } else {
      warnings.push("No review date set - when will this risk be reassessed?");
    }

    // ========================================
    // 4. CONTENT QUALITY
    // ========================================
    if (!title) {
      issues.push("Risk title is required");
    } else if (title.length < 10) {
      warnings.push("Risk title may be too vague (less than 10 characters)");
    } else if (title.length > 100) {
      warnings.push(
        "Risk title is very long - consider making it more concise"
      );
    } else {
      strengths.push("Clear risk title");
    }

    if (!description) {
      warnings.push("No description provided - add context about the risk");
    } else if (description.length < 50) {
      warnings.push("Description is brief - consider adding more detail");
    } else {
      strengths.push("Detailed description provided");
    }

    if (rootCauses.length === 0) {
      warnings.push("No root causes identified - why does this risk exist?");
    } else if (rootCauses.length === 1) {
      warnings.push(
        "Only 1 root cause - consider if there are contributing factors"
      );
    } else {
      strengths.push(
        "Multiple root causes identified (" + rootCauses.length + ")"
      );
    }

    if (consequences.length === 0) {
      warnings.push("No consequences defined - what is the potential impact?");
    } else if (consequences.length === 1) {
      warnings.push(
        "Only 1 consequence - consider broader impacts (financial, reputational, operational)"
      );
    } else {
      strengths.push(
        "Multiple consequences identified (" + consequences.length + ")"
      );
    }

    // ========================================
    // 5. ISO 31000 BEST PRACTICES
    // ========================================
    // Title format check (should suggest cause + effect pattern)
    var titleLower = (title || "").toLowerCase();
    var hasEventPattern =
      titleLower.indexOf(" due to ") !== -1 ||
      titleLower.indexOf(" caused by ") !== -1 ||
      titleLower.indexOf(" leading to ") !== -1 ||
      titleLower.indexOf(" resulting in ") !== -1 ||
      titleLower.indexOf(" from ") !== -1;
    if (title && !hasEventPattern && title.length > 15) {
      warnings.push(
        "Consider ISO 31000 title format: 'Event + cause' or 'Event leading to impact'"
      );
    }

    // Status progression check
    if (status === "identified" && inhScore > 0) {
      warnings.push(
        "Status is 'Identified' but scores are set - consider updating to 'Assessed'"
      );
    }
    if (
      status === "treated" &&
      actionPlan.length === 0 &&
      linkedControls.length === 0
    ) {
      warnings.push(
        "Status is 'Treated' but no actions or controls documented"
      );
    }
    if (status === "monitoring" && !reviewDate) {
      warnings.push("Status is 'Monitoring' but no review date scheduled");
    }
    if (status === "closed" && resScore >= 10) {
      warnings.push(
        "Status is 'Closed' but residual risk is still High/Critical"
      );
    }

    // Category-Owner alignment
    var categoryOwnerMap = {
      technology: [
        "cio",
        "ciso",
        "it ",
        "information",
        "security",
        "technology",
        "cyber",
        "digital",
      ],
      financial: ["cfo", "finance", "treasury", "financial", "accountant"],
      compliance: ["cco", "compliance", "legal", "regulatory", "counsel"],
      operational: ["coo", "operations", "process", "manager"],
      strategic: ["ceo", "strategy", "director", "executive", "managing"],
      reputational: [
        "cmo",
        "marketing",
        "communications",
        "brand",
        "pr ",
        "public relations",
      ],
      "health-safety": ["hse", "safety", "health", "occupational"],
      environmental: ["environmental", "sustainability", "hse"],
    };
    if (category && owner) {
      var ownerLower = owner.toLowerCase();
      var expectedTerms = categoryOwnerMap[category] || [];
      var ownerMatchesCategory = false;
      for (var o = 0; o < expectedTerms.length; o++) {
        if (ownerLower.indexOf(expectedTerms[o]) !== -1) {
          ownerMatchesCategory = true;
          break;
        }
      }
      if (!ownerMatchesCategory && expectedTerms.length > 0) {
        var categoryLabel = this.formatCategory
          ? this.formatCategory(category)
          : category;
        warnings.push(
          "Risk Owner may not align with " +
            categoryLabel +
            " category - verify appropriate ownership"
        );
      }
    }

    // ========================================
    // 6. CROSS-FIELD RELATIONSHIPS
    // ========================================
    // High risk + Accept + No controls
    if (
      inhScore >= 10 &&
      treatment === "accept" &&
      linkedControls.length === 0
    ) {
      warnings.push(
        "Accepting High/Critical risk with no controls - ensure this is deliberate"
      );
    }

    // Target date vs Review date
    if (targetDate && reviewDate) {
      var targetD = new Date(targetDate);
      var reviewD = new Date(reviewDate);
      if (reviewD < targetD) {
        warnings.push(
          "Review date is before target date - review should typically follow action completion"
        );
      }
    }

    // Keyword-category mismatch
    var allText = (
      title +
      " " +
      description +
      " " +
      rootCauses.join(" ") +
      " " +
      consequences.join(" ")
    ).toLowerCase();
    var categoryKeywords = {
      financial: [
        "financial",
        "money",
        "cost",
        "revenue",
        "profit",
        "loss",
        "budget",
        "cash",
        "funding",
      ],
      compliance: [
        "compliance",
        "regulatory",
        "regulation",
        "legal",
        "law",
        "fine",
        "penalty",
        "license",
      ],
      technology: [
        "cyber",
        "system",
        "data",
        "software",
        "hardware",
        "network",
        "IT",
        "digital",
        "breach",
      ],
      reputational: [
        "reputation",
        "brand",
        "media",
        "public",
        "customer trust",
        "image",
      ],
      "health-safety": [
        "safety",
        "injury",
        "health",
        "accident",
        "incident",
        "hazard",
        "harm",
      ],
      environmental: [
        "environment",
        "pollution",
        "emission",
        "waste",
        "climate",
        "carbon",
      ],
    };
    for (var cat in categoryKeywords) {
      if (cat !== category) {
        var keywords = categoryKeywords[cat];
        var matchCount = 0;
        for (var k = 0; k < keywords.length; k++) {
          if (allText.indexOf(keywords[k]) !== -1) matchCount++;
        }
        if (matchCount >= 2) {
          var suggestedLabel = this.formatCategory
            ? this.formatCategory(cat)
            : cat;
          warnings.push(
            "Content mentions " +
              suggestedLabel +
              " themes - verify category is correct"
          );
          break;
        }
      }
    }

    // Category assigned check
    if (category) {
      strengths.push("Risk category assigned");
    } else {
      issues.push("Risk category not selected");
    }

    // Build context for AI analysis
    var riskContext = {
      title: title,
      description: description,
      category: category,
      owner: owner,
      treatment: treatment,
      inherentScore: inhScore,
      residualScore: resScore,
      rootCauses: rootCauses,
      consequences: consequences,
      linkedControls: linkedControls.length
    };

    // Show local validation results first, then enhance with DeepSeek
    var self = this;
    this.showReviewResults(issues, warnings, strengths, null, function(contentDiv) {
      // Call DeepSeek for AI-enhanced analysis
      self.callDeepSeekReview("risk", riskContext, function(aiInsight) {
        if (aiInsight && contentDiv) {
          var aiSection = document.createElement("div");
          aiSection.className = "ai-review-section ai-insight";
          aiSection.innerHTML =
            '<div class="ai-insight-header">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>' +
            "<h5>AI Analysis</h5>" +
            "</div>" +
            '<div class="ai-insight-content">' + self.escapeHtml(aiInsight) + '</div>';
          contentDiv.appendChild(aiSection);
        }
      });
    });
  } catch (e) {
    console.error("Error in performRiskReview:", e);
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.error("Error reviewing risk: " + e.message);
    }
  }
};

/* ========================================
   CONTROL REVIEW FUNCTIONS
   ======================================== */

/**
 * Review entire control - main entry point
 */
ERM.ai.reviewEntireControl = function () {
  var self = this;

  // Check AI limit before proceeding
  if (typeof ERM.enforcement !== 'undefined' && ERM.enforcement.canUseAI) {
    var aiCheck = ERM.enforcement.canUseAI();
    if (!aiCheck.allowed && typeof ERM.upgradeModal !== 'undefined') {
      // Show upgrade modal for AI limit
      ERM.upgradeModal.show({
        title: 'AI Limit Reached',
        message: aiCheck.message,
        feature: 'AI Control Review',
        upgradeMessage: aiCheck.upgradeMessage
      });
      return;
    }
  }

  // Show thinking animation first
  this.showControlReviewThinking(function () {
    self.performControlReview();
  });
};

/**
 * Show AI thinking animation for control review
 * Uses the same design pattern as "Describe with AI" thinking modal
 */
ERM.ai.showControlReviewThinking = function (onComplete) {
  var steps = [
    { text: "Analyzing control details", delay: 600 },
    { text: "Checking effectiveness", delay: 500 },
    { text: "Validating completeness", delay: 600 },
    { text: "Generating feedback", delay: 500 },
  ];

  // Sparkles icon for header
  var sparklesIcon = '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>';

  var stepsHtml = "";
  for (var i = 0; i < steps.length; i++) {
    stepsHtml +=
      '<div class="ai-step" data-step="' + i + '">' +
      '<div class="ai-step-icon">' +
      '<svg class="ai-step-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="50" stroke-linecap="round"/></svg>' +
      '<svg class="ai-step-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
      "</div>" +
      '<span class="ai-step-text">' + steps[i].text + "</span>" +
      '<span class="ai-step-dots"><span>.</span><span>.</span><span>.</span></span>' +
      "</div>";
  }

  var content =
    '<div class="ai-thinking-container">' +
    '<div class="ai-thinking-header">' +
    '<div class="ai-brain-animation">' +
    '<div class="ai-brain-circle"></div>' +
    '<div class="ai-brain-circle"></div>' +
    '<div class="ai-brain-circle"></div>' +
    sparklesIcon +
    "</div>" +
    "<h3>AI is reviewing your control</h3>" +
    "</div>" +
    '<div class="ai-steps-container">' +
    stepsHtml +
    "</div>" +
    "</div>";

  if (
    typeof ERM.components !== "undefined" &&
    ERM.components.showSecondaryModal
  ) {
    ERM.components.showSecondaryModal({
      title: "",
      content: content,
      buttons: [],
      size: "small",
      onOpen: function () {
        // Style the modal to match ai-thinking-modal pattern
        var modal = document.querySelector(".secondary-overlay .modal");
        var modalContent = document.querySelector(".secondary-overlay .modal-content");
        var modalHeader = document.querySelector(".secondary-overlay .modal-header");
        var modalBody = document.querySelector(".secondary-overlay .modal-body");
        var modalFooter = document.querySelector(".secondary-overlay .modal-footer");

        if (modal) {
          modal.classList.add("ai-thinking-modal");
        }

        // Hide header
        if (modalHeader) {
          modalHeader.style.display = "none";
        }

        // Hide footer
        if (modalFooter) {
          modalFooter.style.display = "none";
        }

        // Fix body styling
        if (modalBody) {
          modalBody.style.cssText = "padding: 0 !important; max-height: none !important; overflow: visible !important;";
        }

        // Fix modal content wrapper
        if (modalContent) {
          modalContent.style.cssText = "max-height: none !important; overflow: visible !important;";
        }

        function animateStep(stepIndex) {
          if (stepIndex >= steps.length) {
            setTimeout(function () {
              ERM.components.closeSecondaryModal();
              setTimeout(function () {
                if (onComplete) {
                  try {
                    onComplete();
                  } catch (e) {
                    console.error("AI Review callback error:", e);
                  }
                }
              }, 200);
            }, 400);
            return;
          }

          var stepEl = document.querySelector(
            '.secondary-overlay .ai-step[data-step="' + stepIndex + '"]'
          );
          if (stepEl) {
            stepEl.classList.add("active");

            setTimeout(function () {
              stepEl.classList.remove("active");
              stepEl.classList.add("complete");
              animateStep(stepIndex + 1);
            }, steps[stepIndex].delay);
          } else {
            animateStep(stepIndex + 1);
          }
        }

        setTimeout(function () {
          animateStep(0);
        }, 300);
      },
    });
  } else {
    console.log("Secondary modal not available, calling directly");
    if (onComplete) onComplete();
  }
};

/**
 * Perform the actual control review - comprehensive validation
 */
ERM.ai.performControlReview = function () {
  console.log("performControlReview called");

  try {
    var issues = []; // Critical - should fix
    var warnings = []; // Recommendations - nice to fix
    var strengths = []; // What's good

    // Get all form values
    var name = this.getFieldValue("control-name");
    var type = this.getFieldValue("control-type");
    var category = this.getFieldValue("control-category");
    var owner = this.getFieldValue("control-owner");
    var frequency = this.getFieldValue("control-frequency");
    var effectiveness = this.getFieldValue("control-effectiveness");
    var status = this.getFieldValue("control-status");
    var lastReviewDate = this.getFieldValue("control-last-review");
    var nextReviewDate = this.getFieldValue("control-next-review");

    // Get descriptions
    var descriptions = this.getListItems("descriptions-list");

    // Get linked risks
    var linkedRisks = [];
    var checkboxes = document.querySelectorAll('input[name="linkedRisks"]:checked');
    for (var i = 0; i < checkboxes.length; i++) {
      linkedRisks.push(checkboxes[i].value);
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    // ========================================
    // 1. BASIC COMPLETENESS
    // ========================================
    if (!name) {
      issues.push("Control name is required");
    } else if (name.length < 10) {
      warnings.push("Control name may be too vague (less than 10 characters)");
    } else if (name.length > 100) {
      warnings.push("Control name is very long - consider making it more concise");
    } else {
      strengths.push("Clear control name");
    }

    if (!type) {
      issues.push("Control type not selected - specify preventive, detective, corrective, or directive");
    } else {
      strengths.push("Control type defined (" + type + ")");
    }

    if (!category) {
      issues.push("Control category not selected");
    } else {
      strengths.push("Control category assigned");
    }

    if (!owner) {
      warnings.push("No control owner assigned - who is responsible for this control?");
    } else {
      strengths.push("Control owner assigned");
    }

    if (descriptions.length === 0) {
      warnings.push("No description provided - add context about how the control works");
    } else if (descriptions.length === 1 && descriptions[0].length < 30) {
      warnings.push("Description is brief - consider adding more detail about the control");
    } else {
      strengths.push("Detailed description provided");
    }

    // ========================================
    // 2. EFFECTIVENESS & TESTING
    // ========================================
    if (!effectiveness || effectiveness === "not-tested") {
      warnings.push("Control effectiveness not tested - consider scheduling a test");
    } else if (effectiveness === "ineffective") {
      issues.push("Control marked as ineffective - requires remediation or replacement");
    } else if (effectiveness === "partially-effective") {
      warnings.push("Control is only partially effective - identify and address gaps");
    } else if (effectiveness === "effective") {
      strengths.push("Control tested and confirmed effective");
    }

    // Review frequency checks
    if (lastReviewDate) {
      var lastReview = new Date(lastReviewDate);
      var sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      if (lastReview < sixMonthsAgo) {
        warnings.push("Last review was over 6 months ago - control may need retesting");
      } else {
        strengths.push("Control recently reviewed");
      }
    } else {
      warnings.push("No last review date recorded");
    }

    if (nextReviewDate) {
      var nextReview = new Date(nextReviewDate);
      if (nextReview < today) {
        issues.push("Next review date is in the past - review is overdue");
      } else {
        strengths.push("Next review date scheduled");
      }
    } else {
      warnings.push("No next review date set - when will this control be reassessed?");
    }

    // ========================================
    // 3. CONTROL TYPE & DESIGN
    // ========================================
    if (type === "preventive") {
      if (effectiveness === "effective" && linkedRisks.length > 0) {
        strengths.push("Effective preventive control linked to risks - strong risk mitigation");
      }
      if (!frequency || frequency === "triggered") {
        warnings.push("Preventive controls typically operate continuously or periodically - verify frequency");
      }
    }

    if (type === "detective") {
      if (!frequency || frequency === "continuous") {
        warnings.push("Detective controls typically operate periodically - verify frequency");
      }
      if (effectiveness === "effective") {
        strengths.push("Effective detective control - provides early warning");
      }
    }

    if (type === "corrective") {
      if (linkedRisks.length === 0) {
        warnings.push("Corrective control should be linked to risks it addresses");
      }
    }

    // Automation considerations
    if (category === "manual" && type === "detective") {
      warnings.push("Manual detective controls may be less reliable - consider automation where possible");
    }

    if (category === "automated" && effectiveness === "not-tested") {
      warnings.push("Automated controls should be tested to ensure they function as designed");
    }

    if (category === "automated") {
      strengths.push("Automated control - typically more reliable than manual controls");
    }

    // ========================================
    // 4. FREQUENCY & OPERATING RHYTHM
    // ========================================
    if (!frequency) {
      warnings.push("Control frequency not specified - how often does this control operate?");
    } else {
      strengths.push("Control frequency defined (" + frequency + ")");

      // Frequency-effectiveness relationship
      if (type === "preventive" && frequency === "annual" && effectiveness === "effective") {
        warnings.push("Annual preventive control - consider if more frequent execution would improve effectiveness");
      }

      if (type === "detective" && frequency === "continuous" && category !== "automated") {
        warnings.push("Continuous manual detective control may be resource-intensive");
      }
    }

    // ========================================
    // 5. LINKED RISKS
    // ========================================
    if (linkedRisks.length === 0) {
      warnings.push("No linked risks - which risks does this control mitigate?");
    } else if (linkedRisks.length === 1) {
      strengths.push("Control linked to 1 risk");
    } else {
      strengths.push("Control linked to " + linkedRisks.length + " risks");
    }

    // ========================================
    // 6. STATUS VALIDATION
    // ========================================
    if (!status) {
      warnings.push("Control status not selected");
    } else if (status === "inactive") {
      if (linkedRisks.length > 0) {
        issues.push("Control is inactive but linked to risks - risks may be unmitigated");
      }
      warnings.push("Inactive control - consider removing links to risks or reactivating");
    } else if (status === "under-review") {
      warnings.push("Control under review - ensure review is completed promptly");
    } else if (status === "planned") {
      warnings.push("Control is planned but not active - risks may be unmitigated until implemented");
    } else if (status === "active") {
      strengths.push("Control is active");
    }

    // ========================================
    // 7. CROSS-FIELD RELATIONSHIPS
    // ========================================
    // Ineffective + Active
    if (status === "active" && effectiveness === "ineffective") {
      issues.push("Active control marked as ineffective - should be under review or inactive");
    }

    // Not tested + Active + Linked to risks
    if (status === "active" && effectiveness === "not-tested" && linkedRisks.length > 0) {
      warnings.push("Active control linked to risks but not tested - effectiveness unknown");
    }

    // Last review after next review (illogical dates)
    if (lastReviewDate && nextReviewDate) {
      var lastRev = new Date(lastReviewDate);
      var nextRev = new Date(nextReviewDate);
      if (lastRev > nextRev) {
        issues.push("Last review date is after next review date - check dates for accuracy");
      }
    }

    // ========================================
    // 8. BEST PRACTICES
    // ========================================
    // SOC 2 / ISO 27001 alignment
    if (type && category && effectiveness && frequency && owner) {
      strengths.push("Control documentation meets compliance frameworks (SOC 2, ISO 27001)");
    }

    // Review interval recommendations
    if (nextReviewDate && lastReviewDate) {
      var lastR = new Date(lastReviewDate);
      var nextR = new Date(nextReviewDate);
      var daysDiff = Math.floor((nextR - lastR) / (1000 * 60 * 60 * 24));

      if (daysDiff > 365 && effectiveness === "effective") {
        warnings.push("Review interval over 12 months - consider more frequent reviews for effective controls");
      }
    }

    // Owner-category alignment
    var nameLower = (name || "").toLowerCase();
    var descLower = descriptions.join(" ").toLowerCase();

    if ((nameLower.indexOf("access") !== -1 || descLower.indexOf("access") !== -1) && category !== "policy" && category !== "automated") {
      warnings.push("Access control - verify category is appropriate (typically policy or automated)");
    }

    if ((nameLower.indexOf("segregation") !== -1 || descLower.indexOf("segregation") !== -1) && category !== "segregation") {
      warnings.push("Appears to be a segregation of duties control - verify category");
    }

    // Build context for AI analysis
    var controlContext = {
      name: name,
      type: type,
      category: category,
      owner: owner,
      frequency: frequency,
      effectiveness: effectiveness,
      status: status,
      descriptions: descriptions,
      linkedRisks: linkedRisks.length,
      lastReviewDate: lastReviewDate,
      nextReviewDate: nextReviewDate
    };

    // Show local validation results first, then enhance with DeepSeek
    var self = this;
    this.showControlReviewResults(issues, warnings, strengths, null, function(contentDiv) {
      // Call DeepSeek for AI-enhanced analysis
      self.callDeepSeekReview("control", controlContext, function(aiInsight) {
        if (aiInsight && contentDiv) {
          var aiSection = document.createElement("div");
          aiSection.className = "ai-review-section ai-insight";
          aiSection.innerHTML =
            '<div class="ai-insight-header">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>' +
            "<h5>AI Analysis</h5>" +
            "</div>" +
            '<div class="ai-insight-content">' + self.escapeHtml(aiInsight) + '</div>';
          contentDiv.appendChild(aiSection);
        }
      });
    });
  } catch (e) {
    console.error("Error in performControlReview:", e);
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.error("Error reviewing control: " + e.message);
    }
  }
};

/**
 * Show control review results modal
 * @param {array} issues - Critical issues found
 * @param {array} warnings - Warnings/recommendations
 * @param {array} strengths - Positive aspects
 * @param {object} unused - Unused parameter for backwards compatibility
 * @param {function} callback - Optional callback called with content div after modal opens
 */
ERM.ai.showControlReviewResults = function (issues, warnings, strengths, unused, callback) {
  var score = 100 - issues.length * 15 - warnings.length * 5;
  score = Math.max(0, Math.min(100, score));

  var scoreClass = score >= 80 ? "good" : score >= 60 ? "fair" : "poor";
  var scoreLabel =
    score >= 80 ? "Complete" : score >= 60 ? "Needs Work" : "Incomplete";

  // Calculate field completeness
  var fieldsComplete = 0;
  var fieldsTotal = 9; // Total key fields for a control

  var name = this.getFieldValue("control-name");
  var type = this.getFieldValue("control-type");
  var category = this.getFieldValue("control-category");
  var owner = this.getFieldValue("control-owner");
  var frequency = this.getFieldValue("control-frequency");
  var effectiveness = this.getFieldValue("control-effectiveness");
  var status = this.getFieldValue("control-status");
  var descriptions = this.getListItems("descriptions-list");
  var linkedRisks = document.querySelectorAll('input[name="linkedRisks"]:checked');

  if (name) fieldsComplete++;
  if (type) fieldsComplete++;
  if (category) fieldsComplete++;
  if (owner) fieldsComplete++;
  if (frequency) fieldsComplete++;
  if (effectiveness) fieldsComplete++;
  if (status) fieldsComplete++;
  if (descriptions.length > 0) fieldsComplete++;
  if (linkedRisks.length > 0) fieldsComplete++;

  var content =
    '<div class="ai-risk-review-results">' +
    '<div class="ai-review-header">' +
    '<div class="ai-review-score ' +
    scoreClass +
    '">' +
    '<div class="ai-review-score-value">' +
    score +
    "%</div>" +
    '<div class="ai-review-score-label">' +
    scoreLabel +
    "</div>" +
    "</div>" +
    '<div class="ai-review-summary">' +
    '<div class="ai-summary-item">' +
    '<span class="ai-summary-value">' +
    fieldsComplete +
    "/" +
    fieldsTotal +
    "</span>" +
    '<span class="ai-summary-label">Fields</span>' +
    "</div>" +
    '<div class="ai-summary-item ' +
    (issues.length > 0 ? "has-issues" : "") +
    '">' +
    '<span class="ai-summary-value">' +
    issues.length +
    "</span>" +
    '<span class="ai-summary-label">Issues</span>' +
    "</div>" +
    '<div class="ai-summary-item ' +
    (warnings.length > 0 ? "has-warnings" : "") +
    '">' +
    '<span class="ai-summary-value">' +
    warnings.length +
    "</span>" +
    '<span class="ai-summary-label">Warnings</span>' +
    "</div>" +
    '<div class="ai-summary-item has-strengths">' +
    '<span class="ai-summary-value">' +
    strengths.length +
    "</span>" +
    '<span class="ai-summary-label">Strengths</span>' +
    "</div>" +
    "</div>" +
    "</div>";

  // Show success message if no issues
  if (issues.length === 0 && warnings.length === 0) {
    content +=
      '<div class="ai-review-section success">' +
      '<div class="ai-success-header">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
      "<h5>Excellent!</h5>" +
      "</div>" +
      "<p>Your control is well-documented and follows best practices.</p>" +
      "</div>";
  }

  // Show issues if any
  if (issues.length > 0) {
    content +=
      '<div class="ai-review-section error">' +
      '<h5><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Issues (' +
      issues.length +
      ")</h5><ul>";
    for (var i = 0; i < issues.length; i++) {
      content += "<li>" + issues[i] + "</li>";
    }
    content += "</ul></div>";
  }

  // Show warnings/recommendations if any
  if (warnings.length > 0) {
    content +=
      '<div class="ai-review-section warning">' +
      '<h5><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Recommendations (' +
      warnings.length +
      ")</h5><ul>";
    for (var j = 0; j < warnings.length; j++) {
      content += "<li>" + warnings[j] + "</li>";
    }
    content += "</ul></div>";
  }

  // Show strengths if any (when there are also issues/warnings)
  if (strengths.length > 0 && (issues.length > 0 || warnings.length > 0)) {
    content +=
      '<div class="ai-review-section success">' +
      '<h5><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Strengths (' +
      strengths.length +
      ")</h5><ul>";
    for (var k = 0; k < strengths.length; k++) {
      content += "<li>" + strengths[k] + "</li>";
    }
    content += "</ul></div>";
  }

  // Add recommendation note at bottom
  content +=
    '<div class="ai-review-note">' +
    '<span class="ai-note-icon">i</span>' +
    "<p>This is an AI review to help improve your control documentation. You can save the control at any time if you're comfortable with the current details.</p>" +
    "</div>";

  content += "</div>";

  console.log(
    "showControlReviewResults called with",
    issues.length,
    "issues,",
    warnings.length,
    "warnings,",
    strengths.length,
    "strengths"
  );

  if (
    typeof ERM.components !== "undefined" &&
    ERM.components.showSecondaryModal
  ) {
    ERM.components.showSecondaryModal({
      title: "AI Analysis",
      content: content,
      buttons: [{ label: "Got It", type: "primary", action: "close" }],
      onOpen: function () {
        // Call the callback with the content container for adding AI insights
        if (callback) {
          var contentDiv = document.querySelector(".secondary-overlay .ai-risk-review-results");
          callback(contentDiv);
        }
      }
    });
  } else {
    console.error("Secondary modal not available");
    if (typeof ERM.toast !== "undefined") {
      var summary =
        "Issues: " +
        issues.length +
        ", Warnings: " +
        warnings.length +
        ", Strengths: " +
        strengths.length;
      ERM.toast.info("Review complete - " + summary);
    }
  }
};

/**
 * Helper: Get list items from a list container
 */
ERM.ai.getListItems = function (containerId) {
  var items = [];
  var container = document.getElementById(containerId);
  if (container) {
    var chips = container.querySelectorAll(".list-input-text");
    for (var i = 0; i < chips.length; i++) {
      var text = chips[i].textContent || chips[i].innerText;
      if (text) items.push(text.trim());
    }
  }
  return items;
};

/**
 * Helper: Get linked controls
 */
ERM.ai.getLinkedControls = function () {
  var controls = [];
  var checkboxes = document.querySelectorAll(
    ".control-checkbox:checked, .inline-control-item input:checked"
  );
  for (var i = 0; i < checkboxes.length; i++) {
    var controlId = checkboxes[i].getAttribute("data-control-id");
    if (controlId) controls.push(controlId);
  }
  return controls;
};

/**
 * Helper: Format category for display
 */
ERM.ai.formatCategory = function (category) {
  var labels = {
    technology: "Technology",
    financial: "Financial",
    operational: "Operational",
    compliance: "Compliance",
    strategic: "Strategic",
    reputational: "Reputational",
    "health-safety": "Health & Safety",
    environmental: "Environmental",
  };
  return labels[category] || category;
};

/**
 * Show review results modal - comprehensive validation results
 * @param {array} issues - Critical issues found
 * @param {array} warnings - Warnings/recommendations
 * @param {array} strengths - Positive aspects
 * @param {object} unused - Unused parameter for backwards compatibility
 * @param {function} callback - Optional callback called with content div after modal opens
 */
ERM.ai.showReviewResults = function (issues, warnings, strengths, unused, callback) {
  var score = 100 - issues.length * 15 - warnings.length * 5;
  score = Math.max(0, Math.min(100, score));

  var scoreClass = score >= 80 ? "good" : score >= 60 ? "fair" : "poor";
  var scoreLabel =
    score >= 80 ? "Complete" : score >= 60 ? "Needs Work" : "Incomplete";

  // Calculate category scores
  var fieldsComplete = 0;
  var fieldsTotal = 10; // Approximate total required fields
  var title = this.getFieldValue("risk-title");
  var category = this.getFieldValue("risk-category");
  var owner = this.getFieldValue("risk-owner");
  var description = this.getFieldValue("risk-description");
  var treatment = this.getFieldValue("risk-treatment");
  var inhL = parseInt(this.getFieldValue("inherent-likelihood")) || 0;
  var inhI = parseInt(this.getFieldValue("inherent-impact")) || 0;

  if (title) fieldsComplete++;
  if (category) fieldsComplete++;
  if (owner) fieldsComplete++;
  if (description) fieldsComplete++;
  if (treatment) fieldsComplete++;
  if (inhL > 0) fieldsComplete++;
  if (inhI > 0) fieldsComplete++;

  var rootCauses = this.getListItems("rootCauses-list");
  var consequences = this.getListItems("consequences-list");
  var linkedControls = this.getLinkedControls();

  if (rootCauses.length > 0) fieldsComplete++;
  if (consequences.length > 0) fieldsComplete++;
  if (linkedControls.length > 0) fieldsComplete++;

  var content =
    '<div class="ai-risk-review-results">' +
    '<div class="ai-review-header">' +
    '<div class="ai-review-score ' +
    scoreClass +
    '">' +
    '<div class="ai-review-score-value">' +
    score +
    "%</div>" +
    '<div class="ai-review-score-label">' +
    scoreLabel +
    "</div>" +
    "</div>" +
    '<div class="ai-review-summary">' +
    '<div class="ai-summary-item">' +
    '<span class="ai-summary-value">' +
    fieldsComplete +
    "/" +
    fieldsTotal +
    "</span>" +
    '<span class="ai-summary-label">Fields</span>' +
    "</div>" +
    '<div class="ai-summary-item ' +
    (issues.length > 0 ? "has-issues" : "") +
    '">' +
    '<span class="ai-summary-value">' +
    issues.length +
    "</span>" +
    '<span class="ai-summary-label">Issues</span>' +
    "</div>" +
    '<div class="ai-summary-item ' +
    (warnings.length > 0 ? "has-warnings" : "") +
    '">' +
    '<span class="ai-summary-value">' +
    warnings.length +
    "</span>" +
    '<span class="ai-summary-label">Warnings</span>' +
    "</div>" +
    '<div class="ai-summary-item has-strengths">' +
    '<span class="ai-summary-value">' +
    strengths.length +
    "</span>" +
    '<span class="ai-summary-label">Strengths</span>' +
    "</div>" +
    "</div>" +
    "</div>";

  // Show success message if no issues
  if (issues.length === 0 && warnings.length === 0) {
    content +=
      '<div class="ai-review-section success">' +
      '<div class="ai-success-header">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
      "<h5>Excellent!</h5>" +
      "</div>" +
      "<p>Your risk is well-documented and follows best practices.</p>" +
      "</div>";
  }

  // Show issues if any
  if (issues.length > 0) {
    content +=
      '<div class="ai-review-section error">' +
      '<h5><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Issues (' +
      issues.length +
      ")</h5><ul>";
    for (var i = 0; i < issues.length; i++) {
      content += "<li>" + issues[i] + "</li>";
    }
    content += "</ul></div>";
  }

  // Show warnings/recommendations if any
  if (warnings.length > 0) {
    content +=
      '<div class="ai-review-section warning">' +
      '<h5><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Recommendations (' +
      warnings.length +
      ")</h5><ul>";
    for (var j = 0; j < warnings.length; j++) {
      content += "<li>" + warnings[j] + "</li>";
    }
    content += "</ul></div>";
  }

  // Show strengths if any (when there are also issues/warnings)
  if (strengths.length > 0 && (issues.length > 0 || warnings.length > 0)) {
    content +=
      '<div class="ai-review-section success">' +
      '<h5><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Strengths (' +
      strengths.length +
      ")</h5><ul>";
    for (var k = 0; k < strengths.length; k++) {
      content += "<li>" + strengths[k] + "</li>";
    }
    content += "</ul></div>";
  }

  // Add recommendation note at bottom
  content +=
    '<div class="ai-review-note">' +
    '<span class="ai-note-icon">i</span>' +
    "<p>This is an AI review to help improve your risk documentation. You can save the risk at any time if you're comfortable with the current details.</p>" +
    "</div>";

  content += "</div>";

  console.log(
    "showReviewResults called with",
    issues.length,
    "issues,",
    warnings.length,
    "warnings,",
    strengths.length,
    "strengths"
  );

  if (
    typeof ERM.components !== "undefined" &&
    ERM.components.showSecondaryModal
  ) {
    ERM.components.showSecondaryModal({
      title: "AI Analysis",
      content: content,
      buttons: [{ label: "Got It", type: "primary", action: "close" }],
      onOpen: function () {
        // Call the callback with the content container for adding AI insights
        if (callback) {
          var contentDiv = document.querySelector(".secondary-overlay .ai-risk-review-results");
          callback(contentDiv);
        }
      }
    });
  } else {
    // Fallback - use alert or toast
    console.error("Secondary modal not available");
    if (typeof ERM.toast !== "undefined") {
      var summary =
        "Issues: " +
        issues.length +
        ", Warnings: " +
        warnings.length +
        ", Strengths: " +
        strengths.length;
      ERM.toast.info("Review complete - " + summary);
    }
  }
};

/**
 * Improve risk wording to ISO 31000 format
 */
ERM.ai.improveRiskWording = function () {
  var title = this.getFieldValue("risk-title");
  var description = this.getFieldValue("risk-description");

  if (!title) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.error("Enter a risk title first");
    }
    return;
  }

  var improvedTitle = this.improveTitle(title);
  var improvedDesc = description
    ? this.improveDescription(description, title)
    : "";

  var content = '<div class="ai-improvements">';

  if (improvedTitle !== title) {
    content +=
      '<div class="form-group">' +
      '<label class="form-label">Improved Title</label>' +
      '<div class="ai-comparison">' +
      '<div class="ai-original"><small>Original:</small> ' +
      ERM.utils.escapeHtml(title) +
      "</div>" +
      '<div class="ai-improved"><small>Improved:</small> ' +
      ERM.utils.escapeHtml(improvedTitle) +
      "</div>" +
      "</div>" +
      '<button type="button" class="btn btn-sm btn-primary btn-apply-title">Apply Title</button>' +
      "</div>";
  }

  if (description && improvedDesc !== description) {
    content +=
      '<div class="form-group">' +
      '<label class="form-label">Improved Description</label>' +
      '<div class="ai-comparison">' +
      '<div class="ai-improved">' +
      ERM.utils.escapeHtml(improvedDesc) +
      "</div>" +
      "</div>" +
      '<button type="button" class="btn btn-sm btn-primary btn-apply-desc">Apply Description</button>' +
      "</div>";
  }

  if (
    improvedTitle === title &&
    (!description || improvedDesc === description)
  ) {
    content +=
      '<p class="text-muted">Content already follows ISO 31000 format.</p>';
  }

  content += "</div>";

  var self = this;
  if (
    typeof ERM.components !== "undefined" &&
    ERM.components.showSecondaryModal
  ) {
    ERM.components.showSecondaryModal({
      title: this.icons.edit + " Improved Wording (ISO 31000)",
      content: content,
      buttons: [{ label: "Close", type: "secondary", action: "close" }],
      onOpen: function () {
        var titleBtn = document.querySelector(".btn-apply-title");
        if (titleBtn) {
          titleBtn.addEventListener("click", function () {
            self.applyToField("risk-title", improvedTitle);
          });
        }
        var descBtn = document.querySelector(".btn-apply-desc");
        if (descBtn) {
          descBtn.addEventListener("click", function () {
            self.applyToField("risk-description", improvedDesc);
          });
        }
      },
    });
  }
};

ERM.ai.improveTitle = function (title) {
  var improved = title;

  // Ensure starts with "Risk of" format
  if (!title.toLowerCase().startsWith("risk of")) {
    improved = "Risk of " + title.charAt(0).toLowerCase() + title.slice(1);
  }

  // Remove vague words
  improved = improved.replace(/\b(maybe|might|could|possibly)\b/gi, "");

  // Ensure proper capitalization
  improved = improved.charAt(0).toUpperCase() + improved.slice(1);

  return improved.trim();
};

ERM.ai.improveDescription = function (description, title) {
  var improved = description;

  // Ensure includes cause and consequence structure
  if (
    !description.toLowerCase().includes("due to") &&
    !description.toLowerCase().includes("because")
  ) {
    improved += " This risk arises due to inadequate controls and oversight.";
  }

  if (
    !description.toLowerCase().includes("result") &&
    !description.toLowerCase().includes("impact") &&
    !description.toLowerCase().includes("consequence")
  ) {
    improved +=
      " May result in operational, financial, or reputational impacts.";
  }

  return improved.trim();
};

/**
 * Suggest controls for current risk
 */
ERM.ai.suggestControlsForRisk = function () {
  var title = this.getFieldValue("risk-title");
  var category = this.getFieldValue("risk-category");

  if (!title) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.error("Enter a risk title first");
    }
    return;
  }

  var preventive = [
    "Implement preventive control measures",
    "Establish monitoring and oversight procedures",
    "Develop policies and procedures documentation",
  ];

  var detective = [
    "Regular review and testing",
    "Monitoring and reporting mechanisms",
    "Audit and assurance activities",
  ];

  // Use category-specific controls if riskAI templates available
  if (typeof ERM.riskAI !== "undefined" && ERM.riskAI.getCausesSuggestions) {
    // Map causes to preventive controls
    var causes = ERM.riskAI.getCausesSuggestions(title, category);
    if (causes && causes.length > 0) {
      preventive = causes.slice(0, 3).map(function (c) {
        return "Address: " + c;
      });
    }
  }

  var content =
    '<div class="ai-control-suggestions">' +
    "<h5>Preventive Controls (reduce likelihood)</h5>" +
    '<ul class="ai-control-list">';

  for (var i = 0; i < preventive.length; i++) {
    content += "<li>" + preventive[i] + "</li>";
  }

  content +=
    '</ul><h5>Detective Controls (identify occurrence)</h5><ul class="ai-control-list">';

  for (var j = 0; j < detective.length; j++) {
    content += "<li>" + detective[j] + "</li>";
  }

  content += "</ul></div>";

  if (
    typeof ERM.components !== "undefined" &&
    ERM.components.showSecondaryModal
  ) {
    ERM.components.showSecondaryModal({
      title: this.icons.shield + " Suggested Controls",
      content: content,
      buttons: [{ label: "Close", type: "secondary", action: "close" }],
    });
  }
};

/**
 * Validate risk scoring
 */
ERM.ai.validateRiskScoring = function () {
  var title = this.getFieldValue("risk-title");
  var category = this.getFieldValue("risk-category");
  var inhL = parseInt(this.getFieldValue("inherent-likelihood")) || 3;
  var inhI = parseInt(this.getFieldValue("inherent-impact")) || 3;
  var resL = parseInt(this.getFieldValue("residual-likelihood")) || 2;
  var resI = parseInt(this.getFieldValue("residual-impact")) || 2;

  var issues = [];
  var validations = [];

  // Validate inherent vs residual
  if (resL > inhL) {
    issues.push(
      "Residual likelihood (" + resL + ") exceeds inherent (" + inhL + ")"
    );
  } else {
    validations.push("Likelihood reduction is logical");
  }

  if (resI > inhI) {
    issues.push(
      "Residual impact (" + resI + ") exceeds inherent (" + inhI + ")"
    );
  } else if (resI === inhI) {
    validations.push(
      "Impact remains stable (controls typically affect likelihood more than impact)"
    );
  } else {
    validations.push("Impact reduction indicates effective controls");
  }

  var inhScore = inhL * inhI;
  var resScore = resL * resI;
  var reduction =
    inhScore > 0 ? Math.round((1 - resScore / inhScore) * 100) : 0;

  if (reduction > 0) {
    validations.push("Overall risk reduction: " + reduction + "%");
  } else if (reduction === 0 && inhScore > 0) {
    issues.push("No risk reduction achieved - review control effectiveness");
  }

  // Category-specific validation
  if (category === "compliance" || category === "health-safety") {
    if (inhI < 4) {
      issues.push("Compliance/Safety risks typically have high impact (4-5)");
    }
  }

  if (
    category === "technology" &&
    title &&
    title.toLowerCase().indexOf("cyber") !== -1
  ) {
    if (inhL < 3) {
      issues.push(
        "Cyber risks typically have moderate-high likelihood in current threat landscape"
      );
    }
  }

  var scoreClass =
    issues.length === 0 ? "good" : issues.length <= 2 ? "fair" : "poor";
  var scoreLabel =
    issues.length === 0 ? "Scoring Consistent" : "Review Recommended";

  var content =
    '<div class="ai-review-results">' +
    '<div class="ai-review-score ' +
    scoreClass +
    '">' +
    '<div class="ai-review-score-label">' +
    scoreLabel +
    "</div>" +
    "</div>" +
    '<div class="scoring-summary">' +
    '<div class="score-box"><span class="score-label">Inherent</span><span class="score-value">' +
    inhScore +
    "</span></div>" +
    '<div class="score-arrow">→</div>' +
    '<div class="score-box"><span class="score-label">Residual</span><span class="score-value">' +
    resScore +
    "</span></div>" +
    "</div>";

  if (issues.length > 0) {
    content += '<div class="ai-review-section warning"><h5>Issues</h5><ul>';
    for (var i = 0; i < issues.length; i++) {
      content += "<li>" + issues[i] + "</li>";
    }
    content += "</ul></div>";
  }

  if (validations.length > 0) {
    content +=
      '<div class="ai-review-section success"><h5>Validations</h5><ul>';
    for (var j = 0; j < validations.length; j++) {
      content += "<li>" + validations[j] + "</li>";
    }
    content += "</ul></div>";
  }

  content += "</div>";

  if (
    typeof ERM.components !== "undefined" &&
    ERM.components.showSecondaryModal
  ) {
    ERM.components.showSecondaryModal({
      title: this.icons.target + " Score Validation",
      content: content,
      buttons: [{ label: "Close", type: "secondary", action: "close" }],
    });
  }
};

/* ========================================
   CONTROL FORM ACTIONS
   ======================================== */
ERM.ai.executeControlAction = function (action) {
  if (typeof ERM.controls === "undefined") {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.error("Controls module not loaded");
    }
    return;
  }

  switch (action) {
    case "improve-desc":
      if (ERM.controls.aiImproveDescription)
        ERM.controls.aiImproveDescription();
      break;
    case "suggest-type":
      if (ERM.controls.aiSuggestType) ERM.controls.aiSuggestType();
      break;
    case "suggest-risks":
      if (ERM.controls.aiSuggestLinkedRisks)
        ERM.controls.aiSuggestLinkedRisks();
      break;
    case "strength-check":
      if (ERM.controls.aiStrengthCheck) ERM.controls.aiStrengthCheck();
      break;
  }
};

/* ========================================
   VIEW-LEVEL AI ACTIONS
   ======================================== */
ERM.ai.suggestNewControl = function () {
  var risks = ERM.storage ? ERM.storage.get("risks") || [] : [];
  var controls = ERM.storage ? ERM.storage.get("controls") || [] : [];

  if (risks.length === 0) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.info("Add some risks first to get control suggestions");
    }
    return;
  }

  // Find risks without controls
  var uncontrolledRisks = [];
  for (var i = 0; i < risks.length; i++) {
    var hasControl = false;
    for (var j = 0; j < controls.length; j++) {
      if (
        controls[j].linkedRisks &&
        controls[j].linkedRisks.indexOf(risks[i].id) !== -1
      ) {
        hasControl = true;
        break;
      }
    }
    if (!hasControl) uncontrolledRisks.push(risks[i]);
  }

  var suggestions = [];
  if (uncontrolledRisks.length > 0) {
    for (var k = 0; k < Math.min(3, uncontrolledRisks.length); k++) {
      var risk = uncontrolledRisks[k];
      suggestions.push({
        name: "Control for " + risk.title,
        type: "preventive",
        reason: "To mitigate: " + risk.title,
      });
    }
  } else {
    suggestions = [
      {
        name: "Quarterly Access Review",
        type: "detective",
        reason: "Best practice for access management",
      },
      {
        name: "Change Management Approval",
        type: "preventive",
        reason: "Required for ITGC compliance",
      },
      {
        name: "Incident Response Procedure",
        type: "corrective",
        reason: "Essential for business continuity",
      },
    ];
  }

  var content =
    '<div class="ai-control-suggestions"><p>Based on your risk register:</p><div class="ai-suggestions-list">';
  for (var l = 0; l < suggestions.length; l++) {
    var s = suggestions[l];
    content +=
      '<div class="ai-suggestion-item">' +
      '<div class="ai-suggestion-content"><p class="ai-suggestion-text">' +
      s.name +
      "</p>" +
      '<span class="ai-suggestion-desc"><span class="badge badge-type-' +
      s.type +
      '">' +
      s.type.charAt(0).toUpperCase() +
      s.type.slice(1) +
      "</span> " +
      s.reason +
      "</span></div>" +
      "</div>";
  }
  content += "</div></div>";

  if (typeof ERM.components !== "undefined" && ERM.components.showModal) {
    ERM.components.showModal({
      title: this.icons.sparkles + " Suggested Controls",
      content: content,
      buttons: [{ label: "Close", type: "secondary", action: "close" }],
    });
  }
};

ERM.ai.analyzeControlGaps = function () {
  var risks = ERM.storage ? ERM.storage.get("risks") || [] : [];
  var controls = ERM.storage ? ERM.storage.get("controls") || [] : [];

  var gaps = {
    risksWithoutControls: [],
    controlsNotTested: [],
    ineffectiveControls: [],
  };

  // Find risks without controls
  for (var i = 0; i < risks.length; i++) {
    var hasControl = false;
    for (var j = 0; j < controls.length; j++) {
      if (
        controls[j].linkedRisks &&
        controls[j].linkedRisks.indexOf(risks[i].id) !== -1
      ) {
        hasControl = true;
        break;
      }
    }
    if (!hasControl) gaps.risksWithoutControls.push(risks[i].title);
  }

  // Find untested/ineffective controls
  for (var k = 0; k < controls.length; k++) {
    if (controls[k].effectiveness === "notTested")
      gaps.controlsNotTested.push(controls[k].name);
    if (controls[k].effectiveness === "ineffective")
      gaps.ineffectiveControls.push(controls[k].name);
  }

  var totalIssues =
    gaps.risksWithoutControls.length +
    gaps.controlsNotTested.length +
    gaps.ineffectiveControls.length;
  var score = Math.max(0, 100 - totalIssues * 10);
  var scoreClass = score >= 80 ? "good" : score >= 50 ? "fair" : "poor";

  var content =
    '<div class="ai-gap-analysis">' +
    '<div class="ai-review-score ' +
    scoreClass +
    '"><div class="ai-review-score-value">' +
    score +
    '%</div><div class="ai-review-score-label">Control Coverage</div></div>';

  if (gaps.risksWithoutControls.length > 0) {
    content +=
      '<div class="ai-review-section error"><h5>Risks Without Controls (' +
      gaps.risksWithoutControls.length +
      ")</h5><ul>";
    for (var l = 0; l < Math.min(5, gaps.risksWithoutControls.length); l++) {
      content += "<li>" + gaps.risksWithoutControls[l] + "</li>";
    }
    content += "</ul></div>";
  }

  if (gaps.controlsNotTested.length > 0) {
    content +=
      '<div class="ai-review-section warning"><h5>Controls Not Tested (' +
      gaps.controlsNotTested.length +
      ")</h5><ul>";
    for (var m = 0; m < Math.min(5, gaps.controlsNotTested.length); m++) {
      content += "<li>" + gaps.controlsNotTested[m] + "</li>";
    }
    content += "</ul></div>";
  }

  if (totalIssues === 0) {
    content +=
      '<div class="ai-review-section success"><h5>Excellent Coverage</h5><p>All risks have controls assigned.</p></div>';
  }

  content += "</div>";

  if (typeof ERM.components !== "undefined" && ERM.components.showModal) {
    ERM.components.showModal({
      title: this.icons.sparkles + " Control Gap Analysis",
      content: content,
      buttons: [{ label: "Close", type: "secondary", action: "close" }],
    });
  }
};

ERM.ai.mapControlsToRisks = function () {
  var risks = ERM.storage ? ERM.storage.get("risks") || [] : [];
  var controls = ERM.storage ? ERM.storage.get("controls") || [] : [];

  if (risks.length === 0 || controls.length === 0) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.info("Add risks and controls first");
    }
    return;
  }

  var content =
    '<div class="control-risk-map"><table class="data-table"><thead><tr><th>Risk</th><th>Controls</th><th>Coverage</th></tr></thead><tbody>';

  for (var i = 0; i < risks.length; i++) {
    var risk = risks[i];
    var linkedControls = [];
    for (var j = 0; j < controls.length; j++) {
      if (
        controls[j].linkedRisks &&
        controls[j].linkedRisks.indexOf(risk.id) !== -1
      ) {
        linkedControls.push(controls[j]);
      }
    }
    var coverageClass =
      linkedControls.length >= 2
        ? "badge-low"
        : linkedControls.length === 1
        ? "badge-medium"
        : "badge-high";
    var coverageText =
      linkedControls.length >= 2
        ? "Good"
        : linkedControls.length === 1
        ? "Partial"
        : "None";

    content +=
      "<tr><td>" +
      ERM.utils.escapeHtml(risk.title) +
      "</td>" +
      "<td>" +
      (linkedControls.length > 0
        ? linkedControls
            .map(function (c) {
              return c.reference;
            })
            .join(", ")
        : '<span class="text-muted">None</span>') +
      "</td>" +
      '<td><span class="badge ' +
      coverageClass +
      '">' +
      coverageText +
      "</span></td></tr>";
  }

  content += "</tbody></table></div>";

  if (typeof ERM.components !== "undefined" && ERM.components.showModal) {
    ERM.components.showModal({
      title: this.icons.link + " Control-Risk Mapping",
      content: content,
      size: "lg",
      buttons: [{ label: "Close", type: "secondary", action: "close" }],
    });
  }
};

ERM.ai.reviewControlEffectiveness = function () {
  var controls = ERM.storage ? ERM.storage.get("controls") || [] : [];

  if (controls.length === 0) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.info("Add controls first");
    }
    return;
  }

  var stats = {
    effective: 0,
    partiallyEffective: 0,
    ineffective: 0,
    notTested: 0,
  };
  for (var i = 0; i < controls.length; i++) {
    var eff = controls[i].effectiveness || "notTested";
    if (stats.hasOwnProperty(eff)) stats[eff]++;
    else stats.notTested++;
  }

  var effectivePercent = Math.round((stats.effective / controls.length) * 100);
  var scoreClass =
    effectivePercent >= 70 ? "good" : effectivePercent >= 40 ? "fair" : "poor";

  var content =
    '<div class="effectiveness-review">' +
    '<div class="ai-review-score ' +
    scoreClass +
    '"><div class="ai-review-score-value">' +
    effectivePercent +
    '%</div><div class="ai-review-score-label">Controls Effective</div></div>' +
    '<div class="effectiveness-breakdown">' +
    '<div class="effectiveness-stat"><span class="badge badge-low">Effective</span> ' +
    stats.effective +
    "</div>" +
    '<div class="effectiveness-stat"><span class="badge badge-medium">Partial</span> ' +
    stats.partiallyEffective +
    "</div>" +
    '<div class="effectiveness-stat"><span class="badge badge-high">Ineffective</span> ' +
    stats.ineffective +
    "</div>" +
    '<div class="effectiveness-stat"><span class="badge badge-critical">Not Tested</span> ' +
    stats.notTested +
    "</div>" +
    "</div></div>";

  if (typeof ERM.components !== "undefined" && ERM.components.showModal) {
    ERM.components.showModal({
      title: this.icons.check + " Control Effectiveness",
      content: content,
      buttons: [{ label: "Close", type: "secondary", action: "close" }],
    });
  }
};

ERM.ai.handleViewAction = function (actionId) {
  var messages = {
    "explain-heatmap":
      "The risk heatmap shows distribution by likelihood and impact. Red areas need immediate attention.",
    "identify-trends":
      "Cyber and compliance risks show upward trends. Consider strengthening controls.",
    "summarize-risks":
      "Top risks: 1) Cybersecurity, 2) Regulatory compliance, 3) Operational disruption.",
    "suggest-new-risk":
      "Consider adding: Supply chain disruption, AI governance, Climate change impact.",
    "review-register":
      "Check for risks without controls and missing risk owners.",
    "identify-gaps":
      "Gaps identified: Third-party risk management, Business continuity, ESG factors.",
  };

  var message = messages[actionId] || "AI analysis complete.";

  if (typeof ERM.components !== "undefined" && ERM.components.showModal) {
    ERM.components.showModal({
      title: this.icons.sparkles + " AI Insight",
      content: '<div class="ai-insight-content"><p>' + message + "</p></div>",
      buttons: [{ label: "Close", type: "secondary", action: "close" }],
    });
  }
};

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */
ERM.ai.getFieldValue = function (fieldId) {
  var field = document.getElementById(fieldId);
  return field ? field.value.trim() : "";
};

ERM.ai.applyToField = function (fieldId, value) {
  var field = document.getElementById(fieldId);
  if (field) {
    field.value = value;
    field.classList.add("ai-filled");
    setTimeout(function () {
      field.classList.remove("ai-filled");
    }, 2000);
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.success("AI suggestion applied");
    }
  }
};

ERM.ai.showProcessing = function () {
  var btn = document.getElementById("ai-float-btn");
  if (btn) {
    btn.classList.add("processing");
    btn.innerHTML = '<div class="ai-spinner"></div>';
  }
};

ERM.ai.hideProcessing = function () {
  var btn = document.getElementById("ai-float-btn");
  if (btn) {
    btn.classList.remove("processing");
    btn.innerHTML =
      typeof ERM.icons !== "undefined"
        ? ERM.icons.sparkles
        : this.icons.sparkles;
  }
};

ERM.ai.refreshPanel = function () {
  var bodyEl = document.getElementById("ai-panel-body");
  var contextEl = document.getElementById("ai-panel-context");

  if (!bodyEl) return;

  var actions = this.getContextActions();
  var riskFormOpen =
    document.querySelector(".modal-overlay.active .risk-form") !== null;
  var controlFormOpen =
    document.querySelector(".modal-overlay.active .control-form") !== null;

  if (contextEl) {
    if (controlFormOpen) {
      contextEl.textContent = "Context: Control Form";
      contextEl.classList.add("ai-form-context");
    } else if (riskFormOpen) {
      contextEl.textContent = "Context: Risk Form";
      contextEl.classList.add("ai-form-context");
    } else {
      var viewLabels = {
        dashboard: "Dashboard",
        "risk-register": "Risk Register",
        controls: "Control Library",
      };
      var currentView = ERM.state ? ERM.state.currentView : "dashboard";
      contextEl.textContent =
        "Context: " + (viewLabels[currentView] || "Dashboard");
      contextEl.classList.remove("ai-form-context");
    }
  }

  var html = "";
  for (var i = 0; i < actions.length; i++) {
    var action = actions[i];
    html +=
      '<button class="ai-action-btn" data-action-id="' +
      action.id +
      '">' +
      action.icon +
      '<span class="ai-action-label">' +
      action.label +
      "</span></button>";
  }

  bodyEl.innerHTML = html;

  var btns = bodyEl.querySelectorAll(".ai-action-btn");
  for (var j = 0; j < btns.length; j++) {
    btns[j].addEventListener("click", function () {
      ERM.ai.executeAction(this.getAttribute("data-action-id"));
    });
  }
};

/* ========================================
   INITIALIZATION
   ======================================== */
ERM.ai.init = function () {
  console.log("Initializing AI Assistant...");

  // Hook into components for panel updates
  if (typeof ERM.components !== "undefined") {
    ERM.components.updateAIPanel = function (view) {
      ERM.ai.state.currentContext = view;
      ERM.ai.refreshPanel();
    };
  }

  // Observe modal changes to refresh panel context
  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === "class") {
        var target = mutations[i].target;
        if (target.classList.contains("modal-overlay")) {
          setTimeout(function () {
            ERM.ai.refreshPanel();
          }, 100);
        }
      }
    }
  });

  setTimeout(function () {
    var modalContainers = document.querySelectorAll(".modal-overlay");
    for (var j = 0; j < modalContainers.length; j++) {
      observer.observe(modalContainers[j], { attributes: true });
    }
    observer.observe(document.body, { childList: true, subtree: true });
  }, 1000);

  console.log("AI Assistant initialized");
};

// Auto-initialize
(function () {
  function initAI() {
    if (typeof ERM !== "undefined" && ERM.ai) {
      ERM.ai.init();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAI);
  } else {
    setTimeout(initAI, 500);
  }
})();

window.ERM = ERM;
console.log("ai-assistant.js loaded successfully");

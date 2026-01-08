/**
 * Dimeri ERM - Risk Register AI UI
 * User interface components for AI risk creation
 *
 * @version 1.0.0
 * ES5 Compatible
 *
 * ============================================================================
 * TABLE OF CONTENTS - Use Ctrl+F to jump to sections
 * ============================================================================
 *
 * SECTION 1: CORE UTILITIES (Lines ~140-450)
 * -------------------------------------------
 *   - getCurrentIndustry()           - Get current industry setting
 *   - getCurrentRegisterType()       - Get current register type
 *   - hasTemplates()                 - Check if templates exist
 *   - getAllTemplateRisks()          - Get all template risks
 *   - findMatchingTemplate()         - Find matching template
 *   - getTemplateData()              - Get template data
 *   - showNoTemplateMatch()          - Show no match modal
 *   - showNoTemplatesAvailable()     - Show no templates modal
 *   - applyToField()                 - Apply value to form field
 *   - getFormValue()                 - Get value from form field
 *   - formatCategory()               - Format category for display
 *   - formatDateForInput()           - Format date for input
 *   - shuffleArray()                 - Shuffle array items
 *   - escapeAttr()                   - Escape HTML attributes
 *
 * SECTION 2: FIELD SUGGESTION HANDLER (Lines ~450-600)
 * -----------------------------------------------------
 *   - handleFieldSuggest()           - Main field suggestion router
 *   - getFieldSuggestionConfig()     - Get config for each field
 *
 * SECTION 3: TITLE SUGGESTIONS (Lines ~600-900)
 * ----------------------------------------------
 *   - showTitleSuggestions()         - Show title suggestions modal
 *   - fetchTitleFromDeepSeek()       - Fetch from DeepSeek API
 *   - renderTitleSuggestions()       - Render suggestions UI
 *
 * SECTION 4: CATEGORY SUGGESTIONS (Lines ~900-1400)
 * --------------------------------------------------
 *   - showCategorySuggestions()      - Show category suggestions
 *   - fetchCategoryFromDeepSeek()    - Fetch from DeepSeek
 *   - renderCategorySuggestions()    - Render suggestions UI
 *   - showCategoryDeepSearch()       - Deep category search
 *
 * SECTION 5: DESCRIPTION SUGGESTIONS (Lines ~1400-1800)
 * -------------------------------------------------------
 *   - showDescriptionSuggestions()   - Show description suggestions
 *   - fetchDescriptionFromDeepSeek() - Fetch from DeepSeek
 *   - renderDescriptionSuggestions() - Render suggestions UI
 *
 * SECTION 6: ROOT CAUSES SUGGESTIONS (Lines ~1800-2200)
 * -------------------------------------------------------
 *   - showCausesSuggestions()        - Show causes suggestions
 *   - fetchCausesFromDeepSeek()      - Fetch from DeepSeek
 *   - renderCausesSuggestions()      - Render suggestions UI
 *   - applyCausesItems()             - Apply selected causes
 *
 * SECTION 7: CONSEQUENCES SUGGESTIONS (Lines ~2200-2600)
 * --------------------------------------------------------
 *   - showConsequencesSuggestions()  - Show consequences suggestions
 *   - fetchConsequencesFromDeepSeek() - Fetch from DeepSeek
 *   - renderConsequencesSuggestions() - Render suggestions UI
 *   - applyConsequencesItems()       - Apply selected consequences
 *
 * SECTION 8: ACTION PLAN SUGGESTIONS (Lines ~2600-3000)
 * -------------------------------------------------------
 *   - showActionPlanSuggestions()    - Show action plan suggestions
 *   - fetchActionPlanFromDeepSeek()  - Fetch from DeepSeek
 *   - renderActionPlanSuggestions()  - Render suggestions UI
 *   - applyActionPlanItems()         - Apply selected actions
 *
 * SECTION 9: OWNER SUGGESTIONS (Lines ~3000-3300)
 * -------------------------------------------------
 *   - showOwnerSuggestions()         - Show owner suggestions
 *   - fetchOwnerFromDeepSeek()       - Fetch from DeepSeek
 *   - renderOwnerSuggestions()       - Render suggestions UI
 *   - showActionOwnerSuggestions()   - Action owner suggestions
 *
 * SECTION 10: TREATMENT SUGGESTIONS (Lines ~3300-3600)
 * ------------------------------------------------------
 *   - showTreatmentSuggestions()     - Show treatment suggestions
 *   - fetchTreatmentFromDeepSeek()   - Fetch from DeepSeek
 *   - renderTreatmentSuggestions()   - Render suggestions UI
 *
 * SECTION 11: STATUS SUGGESTIONS (Lines ~3600-3900)
 * ---------------------------------------------------
 *   - showStatusSuggestions()        - Show status suggestions
 *   - fetchStatusFromDeepSeek()      - Fetch from DeepSeek
 *   - renderStatusSuggestions()      - Render suggestions UI
 *
 * SECTION 12: DATE SUGGESTIONS (Lines ~3900-4200)
 * -------------------------------------------------
 *   - showReviewDateSuggestions()    - Show review date suggestions
 *   - showTargetDateSuggestions()    - Show target date suggestions
 *   - fetchDateFromDeepSeek()        - Fetch from DeepSeek
 *   - renderDateSuggestions()        - Render suggestions UI
 *
 * SECTION 13: SCORE SUGGESTIONS (Lines ~4200-4600)
 * --------------------------------------------------
 *   - showInherentScoreSuggestions() - Inherent score suggestions
 *   - showResidualScoreSuggestions() - Residual score suggestions
 *   - fetchScoreFromDeepSeek()       - Fetch from DeepSeek
 *   - renderScoreSuggestions()       - Render suggestions UI
 *   - getScoreLabel()                - Get label for score
 *   - getScoreColor()                - Get color for score
 *
 * SECTION 14: NATURAL LANGUAGE RISK GENERATION (Lines ~4600-4787)
 * -----------------------------------------------------------------
 *   - showNaturalLanguageInput()     - NL input modal
 *   - generateRiskFromDescription()  - Generate risk from text
 *   - parseGeneratedRisk()           - Parse AI response
 *   - showGeneratedRiskPreview()     - Preview generated risk
 *   - applyGeneratedRisk()           - Apply to form
 *
 * ============================================================================
 */

console.log("Loading risk-register-ai-ui.js...");

var ERM = window.ERM || {};
ERM.riskAI = ERM.riskAI || {};

/* ========================================
   UNIVERSAL TEMPLATE SYSTEM
   Works with any industry: mining, healthcare, banking, etc.
   All industries share same structure, different content
   ======================================== */

/**
 * Get current industry from register or workspace settings
 * Priority: Current register â†’ localStorage default â†’ fallback
 */
ERM.riskAI.getCurrentIndustry = function () {
  // 1. Try current register's industry (highest priority)
  if (
    typeof ERM.riskRegister !== "undefined" &&
    ERM.riskRegister.state &&
    ERM.riskRegister.state.currentRegister
  ) {
    var currentReg = ERM.riskRegister.state.currentRegister;
    if (currentReg.industry) {
      return currentReg.industry;
    }
  }

  // 2. Try localStorage (set during onboarding)
  var industry = localStorage.getItem("ERM_industry");
  if (industry) {
    return industry;
  }

  // 3. Try workspace settings
  if (typeof ERM.storage !== "undefined") {
    var workspace = ERM.storage.get("workspace");
    if (workspace && workspace.industry) {
      return workspace.industry;
    }

    // Try organization settings
    var org = ERM.storage.get("organization");
    if (org && org.industry) {
      return org.industry;
    }
  }

  // 4. Try ERM state
  if (
    typeof ERM.state !== "undefined" &&
    ERM.state.organization &&
    ERM.state.organization.industry
  ) {
    return ERM.state.organization.industry;
  }

  // 5. Default fallback
  return "mining";
};

/**
 * Get current register type
 * Used to filter/prioritize suggestions
 */
ERM.riskAI.getCurrentRegisterType = function () {
  if (
    typeof ERM.riskRegister !== "undefined" &&
    ERM.riskRegister.state &&
    ERM.riskRegister.state.currentRegister
  ) {
    return ERM.riskRegister.state.currentRegister.type || "enterprise";
  }
  return "enterprise";
};

/**
 * Check if templates are available (templates removed - always returns false)
 */
ERM.riskAI.hasTemplates = function () {
  return false;
};

/**
 * Get all template risks (templates removed - always returns empty)
 */
ERM.riskAI.getAllTemplateRisks = function () {
  return [];
};

/**
 * Find matching template (templates removed - always returns null)
 */
ERM.riskAI.findMatchingTemplate = function (title, category) {
  return null;
};

/**
 * Get template data (templates removed - always returns null)
 */
ERM.riskAI.getTemplateData = function (fieldType, title, category) {
  return null;
};

/**
 * Show message when no template match found (now just shows generic AI message)
 */
ERM.riskAI.showNoTemplateMatch = function (fieldName) {
  if (typeof ERM.toast !== "undefined") {
    ERM.toast.info("AI suggestions loading...");
  }
};

/**
 * Show message when AI suggestions not available
 */
ERM.riskAI.showNoTemplatesAvailable = function () {
  if (typeof ERM.toast !== "undefined") {
    ERM.toast.info("AI suggestions loading...");
  }
};

/* ========================================
   UI: SHOW ADD RISK CHOICE MODAL
   ======================================== */

/**
 * Show the AI vs Manual choice when adding a risk
 */
ERM.riskAI.showAddRiskChoice = function () {
  // Check if ERM.components is available
  if (typeof ERM.components === "undefined" || !ERM.components.showModal) {
    console.error("ERM.components not available");
    // Fallback to manual entry
    if (ERM.riskRegister && ERM.riskRegister.showRiskModal) {
      ERM.riskRegister.showRiskModal(null);
    }
    return;
  }

  var content =
    '<div class="add-risk-choice">' +
    '<p class="choice-intro">How would you like to add a risk?</p>' +
    '<div class="choice-cards">' +
    '<div class="choice-card ai-choice" data-choice="ai">' +
    '<div class="choice-card-icon ai-gradient">' +
    ERM.riskAI.icons.sparkles +
    "</div>" +
    '<div class="choice-card-content">' +
    '<h4 class="choice-card-title">Describe with AI</h4>' +
    '<p class="choice-card-desc">Describe your risk in plain language and let AI generate the structured details</p>' +
    "</div>" +
    "</div>" +
    '<div class="choice-card manual-choice" data-choice="manual">' +
    '<div class="choice-card-icon">' +
    ERM.riskAI.icons.edit +
    "</div>" +
    '<div class="choice-card-content">' +
    '<h4 class="choice-card-title">Manual Entry</h4>' +
    '<p class="choice-card-desc">Fill in the risk form fields yourself with full control over all details</p>' +
    '<div class="choice-card-ai-badge">' +
    '<span class="ai-badge-icon">âœ¨</span>' +
    '<span class="ai-badge-text">AI assists every field</span>' +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: "Add New Risk",
    content: content,
    size: "md",
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      var cards = document.querySelectorAll(".choice-card");
      for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener("click", function () {
          var choice = this.getAttribute("data-choice");

          // Check AI limit before showing AI input for "Describe with AI"
          if (choice === "ai") {
            if (typeof ERM.enforcement !== 'undefined' && ERM.enforcement.canUseAI) {
              var aiCheck = ERM.enforcement.canUseAI();
              if (!aiCheck.allowed && typeof ERM.upgradeModal !== 'undefined') {
                ERM.components.closeModal();
                setTimeout(function() {
                  ERM.upgradeModal.show({
                    title: 'AI Limit Reached',
                    message: aiCheck.message,
                    feature: 'AI Suggestions',
                    upgradeMessage: aiCheck.upgradeMessage
                  });
                }, 100);
                return;
              }
            }
          }

          ERM.components.closeModal();

          setTimeout(function () {
            if (choice === "ai") {
              ERM.riskAI.showNaturalLanguageInput();
            } else {
              ERM.riskRegister.showRiskModal(null);
            }
          }, 250);
        });
      }
    },
  });
};

/**
 * Handle generate button click - global function for inline handler
 */
ERM.riskAI.handleGenerateClick = function () {
  var input = document.getElementById("nl-risk-input");
  if (!input) {
    console.error("Input element not found");
    return;
  }

  var inputValue = input.value.trim();

  if (!inputValue) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.error("Please describe your risk");
    }
    return;
  }

  if (inputValue.length < 10) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.error("Please provide more detail");
    }
    return;
  }

  // Check AI limit before proceeding
  if (typeof ERM.enforcement !== 'undefined' && ERM.enforcement.canUseAI) {
    var aiCheck = ERM.enforcement.canUseAI();
    if (!aiCheck.allowed && typeof ERM.upgradeModal !== 'undefined') {
      // Show upgrade modal for AI limit
      ERM.upgradeModal.show({
        title: 'AI Limit Reached',
        message: aiCheck.message,
        feature: 'AI Suggestions',
        upgradeMessage: aiCheck.upgradeMessage
      });
      return;
    }
  }

  ERM.components.closeModal();

  setTimeout(function () {
    ERM.riskAI.generateRiskFromInput(inputValue);
  }, 350);
};

/**
 * Handle back button click - global function for inline handler
 */
ERM.riskAI.handleBackClick = function () {
  ERM.components.closeModal();
  setTimeout(function () {
    ERM.riskAI.showAddRiskChoice();
  }, 300);
};

/**
 * Handle example chip click
 */
ERM.riskAI.handleExampleClick = function (example) {
  var textarea = document.getElementById("nl-risk-input");
  var charCount = document.getElementById("nl-char-current");
  if (textarea && example) {
    textarea.value = example;
    if (charCount) charCount.textContent = example.length;
    textarea.focus();
  }
};

/**
 * Show natural language input modal
 */
ERM.riskAI.showNaturalLanguageInput = function () {
  var placeholders = [
    "e.g., Customer data could be exposed through a security breach",
    "e.g., Supply chain disruptions could halt production",
    "e.g., Key staff leaving could impact project delivery",
    "e.g., System outages could affect customer service",
    "e.g., Regulatory changes could require costly compliance updates",
  ];
  var placeholder =
    placeholders[Math.floor(Math.random() * placeholders.length)];

  var content =
    '<div class="nl-input-container">' +
    '<div class="nl-input-header">' +
    '<div class="nl-input-icon">' +
    ERM.riskAI.icons.sparkles +
    "</div>" +
    '<div class="nl-input-intro">' +
    "<h4>Describe your risk in plain language</h4>" +
    "<p>AI will analyze your description and generate a structured risk with causes, consequences, and suggested controls.</p>" +
    "</div>" +
    "</div>" +
    '<div class="nl-input-field">' +
    '<textarea class="form-textarea" id="nl-risk-input" rows="3" placeholder="' +
    placeholder +
    '"></textarea>' +
    '<div class="nl-char-count"><span id="nl-char-current">0</span> characters</div>' +
    "</div>" +
    '<div class="nl-examples">' +
    '<span class="nl-examples-label">Try these:</span>' +
    '<button type="button" class="nl-example-chip" onclick="ERM.riskAI.handleExampleClick(\'Cyber attack could compromise customer data\')">Cyber attack</button>' +
    '<button type="button" class="nl-example-chip" onclick="ERM.riskAI.handleExampleClick(\'Key supplier failure could disrupt operations\')">Supplier risk</button>' +
    '<button type="button" class="nl-example-chip" onclick="ERM.riskAI.handleExampleClick(\'Regulatory non-compliance could result in penalties\')">Compliance</button>' +
    '<button type="button" class="nl-example-chip" onclick="ERM.riskAI.handleExampleClick(\'Equipment failure could cause safety incidents\')">Safety</button>' +
    "</div>" +
    '<div class="nl-actions">' +
    '<button type="button" class="btn btn-secondary" onclick="ERM.riskAI.handleBackClick()">Back</button>' +
    '<button type="button" class="btn btn-primary" onclick="ERM.riskAI.handleGenerateClick()" style="background: #3b82f6; border: none;">' +
    ERM.riskAI.icons.sparkles +
    " Generate Risk</button>" +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: ERM.riskAI.icons.sparkles + " AI Risk Generator",
    content: content,
    size: "lg",
    buttons: [],
    onOpen: function () {
      var textarea = document.getElementById("nl-risk-input");
      var charCount = document.getElementById("nl-char-current");

      if (textarea) {
        textarea.focus();
        textarea.addEventListener("input", function () {
          if (charCount) charCount.textContent = this.value.length;
        });
      }
    },
  });
};

/**
 * Module-level flag to prevent thinking animation from closing preview modal
 * Set to true when API responds before animation completes
 */
ERM.riskAI._apiRespondedBeforeAnimation = false;

/**
 * Show AI thinking/processing modal
 * Uses unified ERM.components.showThinkingModal
 */
ERM.riskAI.showThinkingModal = function (input, onComplete) {
  ERM.components.showThinkingModal({
    input: input,
    title: "AI is generating your risk",
    steps: [
      { text: "Analyzing your description", icon: "search", delay: 600 },
      { text: "Detecting risk category", icon: "category", delay: 800 },
      { text: "Identifying causes and consequences", icon: "tree", delay: 1000 },
      { text: "Generating suggested controls", icon: "shield", delay: 800 },
      { text: "Building risk assessment", icon: "chart", delay: 600 },
    ],
    namespace: ERM.riskAI,
    icons: ERM.riskAI.icons,
    onComplete: onComplete
  });
};

/**
 * Close the thinking modal
 * Used by DeepSeek suggestion callbacks
 */
ERM.riskAI.closeThinkingModal = function() {
  // Check if there's a thinking modal to close
  var modal = document.querySelector('.modal.ai-thinking-modal');
  if (modal) {
    ERM.components.closeModal();
  } else {
    // Try closing any open modal (fallback)
    try {
      ERM.components.closeModal();
    } catch (e) {
      console.log("[Risk AI] No modal to close");
    }
  }
};

/**
 * Generate risk from natural language input using DeepSeek AI
 */
ERM.riskAI.generateRiskFromInput = function (input) {
  // Get current register's industry if available
  var industry = null;
  try {
    if (
      ERM.riskRegister &&
      ERM.riskRegister.state &&
      ERM.riskRegister.state.currentRegister &&
      ERM.riskRegister.state.currentRegister.template
    ) {
      industry = ERM.riskRegister.state.currentRegister.template;
    }
  } catch (e) {
    console.error("Industry detection error:", e);
  }

  // Debug logging
  console.log("[Risk AI] generateRiskFromInput called with:", input);
  console.log("[Risk AI] ERM.aiService exists:", typeof ERM.aiService !== "undefined");
  console.log("[Risk AI] ERM.aiService.callAPI exists:", typeof ERM.aiService !== "undefined" && typeof ERM.aiService.callAPI === "function");

  // Check if AI service is available
  if (typeof ERM.aiService === "undefined" || typeof ERM.aiService.callAPI !== "function") {
    console.log("[Risk AI] AI service not available, falling back to template matching");
    // Fallback to template-based parsing
    ERM.riskAI.showThinkingModal(input, function () {
      try {
        var generatedRisk = ERM.riskAI.parseNaturalLanguage(input, industry);
        ERM.riskAI.showGeneratedRiskPreview(generatedRisk, input);
      } catch (e) {
        console.error("Error generating risk:", e);
        if (typeof ERM.toast !== "undefined" && ERM.toast.error) {
          ERM.toast.error("Error generating risk. Please try again.");
        }
      }
    });
    return;
  }

  console.log("[Risk AI] Using DeepSeek API for risk generation");

  // Build DeepSeek prompt for risk generation
  var industryContext = industry ? " for a " + industry + " organization" : "";
  var prompt =
    "You are an enterprise risk management expert. Generate a structured risk assessment based on this user description" + industryContext + ":\n\n" +
    "\"" + input + "\"\n\n" +
    "Respond with ONLY a valid JSON object (no markdown, no explanation) with these fields:\n" +
    "{\n" +
    "  \"title\": \"Professional risk title (max 80 chars)\",\n" +
    "  \"category\": \"One of: strategic, financial, operational, compliance, technology, reputational, health-safety, environmental\",\n" +
    "  \"description\": \"Detailed risk description (2-3 sentences)\",\n" +
    "  \"causes\": [\"Root cause 1\", \"Root cause 2\", \"Root cause 3\"],\n" +
    "  \"consequences\": [\"Consequence 1\", \"Consequence 2\", \"Consequence 3\"],\n" +
    "  \"inherentLikelihood\": 3,\n" +
    "  \"inherentImpact\": 3,\n" +
    "  \"residualLikelihood\": 2,\n" +
    "  \"residualImpact\": 2,\n" +
    "  \"treatment\": \"One of: Accept, Mitigate, Transfer, Avoid\",\n" +
    "  \"riskOwner\": \"Suggested role/title for risk owner\"\n" +
    "}\n\n" +
    "Score likelihood and impact from 1-5 where:\n" +
    "1=Rare/Negligible, 2=Unlikely/Minor, 3=Possible/Moderate, 4=Likely/Major, 5=Almost Certain/Severe\n" +
    "Residual scores should be lower than inherent scores (assumes controls in place).";

  // Show thinking modal while DeepSeek processes
  ERM.riskAI.showThinkingModal(input, function () {
    // This callback is called after animation completes - we need to start API call earlier
  });

  // Call DeepSeek API (start immediately, don't wait for animation)
  // Note: aiService.callAPI uses single callback for both success and error responses
  ERM.aiService.callAPI(
    prompt,
    function (response) {
      // Set flag so animation doesn't close the preview modal when it completes
      ERM.riskAI._apiRespondedBeforeAnimation = true;
      console.log("[Risk AI] Set _apiRespondedBeforeAnimation = true");

      // Close the thinking modal
      ERM.components.closeModal();

      setTimeout(function () {
        // Check for error response (API returns {error: '...'} on failure)
        if (response && response.error) {
          console.error("[Risk AI] DeepSeek API error:", response.error);
          ERM.toast.warning("AI service temporarily unavailable");
          // Fallback to template matching
          try {
            var fallbackRisk = ERM.riskAI.parseNaturalLanguage(input, industry);
            ERM.riskAI.showGeneratedRiskPreview(fallbackRisk, input);
          } catch (e) {
            ERM.toast.error("Failed to generate risk. Please try again.");
          }
          return;
        }

        if (response && response.success && response.text) {
          try {
            // Parse JSON response
            var jsonText = response.text.trim();
            // Remove markdown code blocks if present
            if (jsonText.indexOf("```") !== -1) {
              jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
            }
            var parsed = JSON.parse(jsonText);

            // Build the risk object
            var generatedRisk = {
              title: parsed.title || input,
              category: parsed.category || "operational",
              description: parsed.description || input,
              causes: parsed.causes || [],
              consequences: parsed.consequences || [],
              inherentLikelihood: parseInt(parsed.inherentLikelihood) || 3,
              inherentImpact: parseInt(parsed.inherentImpact) || 3,
              residualLikelihood: parseInt(parsed.residualLikelihood) || 2,
              residualImpact: parseInt(parsed.residualImpact) || 2,
              treatment: parsed.treatment || "Mitigate",
              riskOwner: parsed.riskOwner || "",
              status: "Open",
              confidence: "high",
              source: "deepseek-ai"
            };

            // Calculate scores
            generatedRisk.inherentScore = generatedRisk.inherentLikelihood * generatedRisk.inherentImpact;
            generatedRisk.residualScore = generatedRisk.residualLikelihood * generatedRisk.residualImpact;
            generatedRisk.inherentRisk = ERM.riskAI.getRiskLevel ? ERM.riskAI.getRiskLevel(generatedRisk.inherentScore) : "medium";
            generatedRisk.residualRisk = ERM.riskAI.getRiskLevel ? ERM.riskAI.getRiskLevel(generatedRisk.residualScore) : "low";

            // Note: AI counter is now incremented centrally in ai-service.js callAPI()
            // This ensures consistent counting for all API calls
            console.log("[Risk AI] Risk generated successfully, count handled by AIService");

            // Show the preview
            ERM.riskAI.showGeneratedRiskPreview(generatedRisk, input);
          } catch (parseError) {
            console.error("[Risk AI] Failed to parse DeepSeek response:", parseError);
            console.error("[Risk AI] Raw response:", response.text);
            ERM.toast.warning("AI response error, please try again");
            // Fallback to template matching
            try {
              var fallbackRisk = ERM.riskAI.parseNaturalLanguage(input, industry);
              ERM.riskAI.showGeneratedRiskPreview(fallbackRisk, input);
            } catch (e) {
              ERM.toast.error("Failed to generate risk. Please try again.");
            }
          }
        } else {
          console.error("[Risk AI] DeepSeek returned unexpected response:", response);
          ERM.toast.warning("AI service temporarily unavailable");
          // Fallback to template matching
          try {
            var fallbackRisk = ERM.riskAI.parseNaturalLanguage(input, industry);
            ERM.riskAI.showGeneratedRiskPreview(fallbackRisk, input);
          } catch (e) {
            ERM.toast.error("Failed to generate risk. Please try again.");
          }
        }
      }, 200);
    }
  );
};

/**
 * Show preview of generated risk
 */
ERM.riskAI.showGeneratedRiskPreview = function (risk, originalInput) {
  // Check if ERM.components is available
  if (typeof ERM.components === "undefined" || !ERM.components.showModal) {
    console.error("ERM.components not available for preview");
    return;
  }

  // Store current risk for AI suggestions
  this.previewRisk = risk;

  // Fallback escapeHtml if not available
  var escapeHtml =
    ERM.utils && ERM.utils.escapeHtml
      ? ERM.utils.escapeHtml
      : function (str) {
          if (!str) return "";
          return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
        };

  var categoryLabel = ERM.riskAI.categories[risk.category]
    ? ERM.riskAI.categories[risk.category].label
    : risk.category;
  var confidenceBadge =
    risk.confidence === "high"
      ? '<span class="confidence-badge high">High Confidence</span>'
      : '<span class="confidence-badge medium">AI Generated</span>';

  var causesHtml = "";
  var causesToShow = risk.causes.slice(0, 3); // Limit to 3
  for (var i = 0; i < causesToShow.length; i++) {
    causesHtml += "<li>" + escapeHtml(causesToShow[i]) + "</li>";
  }

  var consequencesHtml = "";
  var consequencesToShow = risk.consequences.slice(0, 3); // Limit to 3
  for (var j = 0; j < consequencesToShow.length; j++) {
    consequencesHtml += "<li>" + escapeHtml(consequencesToShow[j]) + "</li>";
  }

  // Get risk owner from template if available
  var riskOwner = risk.riskOwner || "";
  if (!riskOwner && risk.templateId) {
    var ownerData = ERM.riskAI.getTemplateData
      ? ERM.riskAI.getTemplateData("riskOwner", risk.title, risk.category)
      : null;
    if (ownerData && ownerData.length > 0) {
      riskOwner = ownerData[0]; // First suggestion
    }
  }

  var inherentClass =
    risk.inherentScore >= 15
      ? "critical"
      : risk.inherentScore >= 10
      ? "high"
      : risk.inherentScore >= 5
      ? "medium"
      : "low";
  var residualClass =
    risk.residualScore >= 15
      ? "critical"
      : risk.residualScore >= 10
      ? "high"
      : risk.residualScore >= 5
      ? "medium"
      : "low";

  var content =
    '<div class="generated-risk-preview">' +
    '<div class="preview-header">' +
    '<div class="preview-badge">' +
    confidenceBadge +
    "</div>" +
    '<p class="preview-original"><strong>Your input:</strong> "' +
    escapeHtml(originalInput) +
    '"</p>' +
    "</div>" +
    '<div class="preview-section">' +
    '<div class="preview-label-row">' +
    "<label>Risk Title</label>" +
    '<button type="button" class="btn-ai-suggest btn-ai-sm" onclick="ERM.riskAI.showPreviewTitleSuggestions()">' +
    ERM.riskAI.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<input type="text" class="form-input preview-title-input" id="preview-risk-title" value="' +
    escapeHtml(risk.title) +
    '">' +
    "</div>" +
    '<div class="preview-row">' +
    '<div class="preview-section half">' +
    "<label>Category</label>" +
    '<div class="preview-value"><span class="category-badge ' +
    risk.category +
    '">' +
    categoryLabel +
    "</span></div>" +
    "</div>" +
    '<div class="preview-section half">' +
    "<label>Risk Owner</label>" +
    '<input type="text" class="form-input preview-owner-input" id="preview-risk-owner" value="' +
    escapeHtml(riskOwner) +
    '" placeholder="e.g. IT Manager">' +
    "</div>" +
    "</div>" +
    '<div class="preview-section">' +
    "<label>Risk Scores</label>" +
    '<div class="preview-scores">' +
    '<span class="risk-score-badge ' +
    inherentClass +
    '">Inherent: ' +
    risk.inherentScore +
    "</span>" +
    '<span class="score-arrow">&rarr;</span>' +
    '<span class="risk-score-badge ' +
    residualClass +
    '">Residual: ' +
    risk.residualScore +
    "</span>" +
    "</div>" +
    "</div>" +
    '<div class="preview-row">' +
    '<div class="preview-section half">' +
    "<label>Root Causes</label>" +
    '<ul class="preview-list">' +
    causesHtml +
    "</ul>" +
    "</div>" +
    '<div class="preview-section half">' +
    "<label>Consequences</label>" +
    '<ul class="preview-list">' +
    consequencesHtml +
    "</ul>" +
    "</div>" +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: ERM.riskAI.icons.check + " Generated Risk Preview",
    content: content,
    size: "lg",
    buttons: [
      { label: "Edit Details", type: "secondary", action: "edit" },
      {
        label: "Save Risk",
        type: "primary",
        action: "save",
        className: "btn-ai-primary",
      },
    ],
    onAction: function (action) {
      if (action === "save") {
        // Update title from input if changed
        var titleInput = document.getElementById("preview-risk-title");
        if (titleInput && titleInput.value.trim()) {
          risk.title = titleInput.value.trim();
        }
        // Update owner from input
        var ownerInput = document.getElementById("preview-risk-owner");
        if (ownerInput && ownerInput.value.trim()) {
          risk.riskOwner = ownerInput.value.trim();
        }
        ERM.riskAI.saveGeneratedRisk(risk);
      } else if (action === "edit") {
        // Update title from input if changed
        var titleInputEdit = document.getElementById("preview-risk-title");
        if (titleInputEdit && titleInputEdit.value.trim()) {
          risk.title = titleInputEdit.value.trim();
        }
        // Update owner from input
        var ownerInputEdit = document.getElementById("preview-risk-owner");
        if (ownerInputEdit && ownerInputEdit.value.trim()) {
          risk.riskOwner = ownerInputEdit.value.trim();
        }
        ERM.components.closeModal();
        setTimeout(function () {
          ERM.riskAI.openRiskFormWithData(risk);
        }, 250);
      }
    },
  });
};

/**
 * Show title suggestions in preview modal
 */
ERM.riskAI.showPreviewTitleSuggestions = function () {
  var self = this;
  var risk = this.previewRisk;

  if (!risk || !risk.templateId) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.info("No alternative titles available");
    }
    return;
  }

  // Get template to access all title variations
  var template = null;
  var allRisks = this.getAllTemplateRisks ? this.getAllTemplateRisks() : [];
  for (var i = 0; i < allRisks.length; i++) {
    if (allRisks[i].id === risk.templateId) {
      template = allRisks[i];
      break;
    }
  }

  if (!template || !template.titles || template.titles.length <= 1) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.info("No alternative titles available");
    }
    return;
  }

  // Build suggestions content
  var currentTitle = document.getElementById("preview-risk-title");
  var currentValue = currentTitle ? currentTitle.value : risk.title;

  // Shuffle and show up to 4 alternatives
  var alternatives = this.shuffleArray(template.titles.slice());
  var suggestions = [];
  var shown = 0;

  for (var t = 0; t < alternatives.length && shown < 4; t++) {
    var title = alternatives[t];
    if (title.toLowerCase() !== currentValue.toLowerCase()) {
      suggestions.push({
        text: title,
        recommended: shown === 0
      });
      shown++;
    }
  }

  ERM.components.showAISuggestionModal({
    title: "Risk Title Suggestions",
    fieldName: "Risk Title",
    suggestions: suggestions,
    onSelect: function(selectedText) {
      var titleInput = document.getElementById("preview-risk-title");
      if (titleInput && selectedText) {
        titleInput.value = selectedText;
        self.previewRisk.title = selectedText;
      }
    }
  });
};

/**
 * Helper to escape attribute values
 */
ERM.riskAI.escapeAttr = function (str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

/**
 * Save the generated risk directly
 */
ERM.riskAI.saveGeneratedRisk = function (risk) {
  try {
    var risks = ERM.storage.get("risks") || [];
    var registers = ERM.storage.get("registers") || [];
    var registerId = ERM.riskRegister.state.currentRegister.id;

    // Generate reference
    var existingRefs = [];
    for (var i = 0; i < risks.length; i++) {
      if (risks[i].registerId === registerId && risks[i].reference) {
        existingRefs.push(risks[i].reference);
      }
    }
    var nextNum = 1;
    while (
      existingRefs.indexOf("R-" + String(nextNum).padStart(3, "0")) !== -1
    ) {
      nextNum++;
    }

    // Fallback generateId if not available
    var generateId =
      ERM.utils && ERM.utils.generateId
        ? ERM.utils.generateId
        : function (prefix) {
            return (
              (prefix || "id") +
              "_" +
              Date.now() +
              "_" +
              Math.random().toString(36).substr(2, 9)
            );
          };

    var newRisk = {
      id: generateId("risk"),
      registerId: registerId,
      reference: "R-" + String(nextNum).padStart(3, "0"),
      title: risk.title,
      category: risk.category,
      description: risk.description,
      causes: risk.causes,
      consequences: risk.consequences,
      inherentLikelihood: risk.inherentLikelihood,
      inherentImpact: risk.inherentImpact,
      inherentScore: risk.inherentScore,
      inherentRisk: risk.inherentRisk,
      residualLikelihood: risk.residualLikelihood,
      residualImpact: risk.residualImpact,
      residualScore: risk.residualScore,
      residualRisk: risk.residualRisk,
      treatment: risk.treatment || "Mitigate",
      status: risk.status || "Open",
      owner: risk.riskOwner || "",
      actionPlan: "",
      linkedControls: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "AI Assistant",
    };

    risks.push(newRisk);

    // Update register count
    for (var j = 0; j < registers.length; j++) {
      if (registers[j].id === registerId) {
        registers[j].riskCount = (registers[j].riskCount || 0) + 1;
        break;
      }
    }

    ERM.storage.set("risks", risks);
    ERM.storage.set("registers", registers);

    ERM.components.closeModal();
    ERM.riskRegister.renderRegisterDetail();

    if (typeof ERM.toast !== "undefined") {
      ERM.toast.success("Risk created successfully");
    }

    // Note: AI counter is incremented at API call time, not when saving
    // This was moved to getSuggestions() to count once per API call, not per use
  } catch (e) {
    console.error("Error saving risk:", e);
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.error("Error saving risk. Please try again.");
    }
  }
};

/**
 * Open risk form pre-filled with generated data
 */
ERM.riskAI.openRiskFormWithData = function (risk) {
  // Store the generated data temporarily
  ERM.riskAI.pendingRiskData = risk;

  // Open the form
  ERM.riskRegister.showRiskModal(null);

  // Fill in the data after a short delay to allow form to render
  setTimeout(function () {
    var data = ERM.riskAI.pendingRiskData;
    if (!data) return;

    // Fill form fields
    var fields = {
      "risk-title": data.title,
      "risk-category": data.category,
      "risk-description": data.description,
      "risk-owner": data.riskOwner,
      "inherent-likelihood": data.inherentLikelihood,
      "inherent-impact": data.inherentImpact,
      "residual-likelihood": data.residualLikelihood,
      "residual-impact": data.residualImpact,
      "risk-treatment": data.treatment,
      "risk-status": data.status,
    };

    for (var fieldId in fields) {
      var el = document.getElementById(fieldId);
      if (el && fields[fieldId]) {
        el.value = fields[fieldId];
        el.classList.add("ai-filled");
      }
    }

    // Update heat maps
    if (typeof ERM.riskRegister.updateHeatMap === "function") {
      ERM.riskRegister.updateHeatMap("inherent");
      ERM.riskRegister.updateHeatMap("residual");
    }

    // Add causes
    if (data.causes && data.causes.length > 0) {
      for (var i = 0; i < data.causes.length; i++) {
        ERM.riskRegister.addListItem("rootCauses", data.causes[i]);
      }
    }

    // Add consequences
    if (data.consequences && data.consequences.length > 0) {
      for (var j = 0; j < data.consequences.length; j++) {
        ERM.riskRegister.addListItem("consequences", data.consequences[j]);
      }
    }

    // Remove highlight after delay
    setTimeout(function () {
      var filled = document.querySelectorAll(".ai-filled");
      for (var k = 0; k < filled.length; k++) {
        filled[k].classList.remove("ai-filled");
      }
    }, 2000);

    // Clear pending data
    ERM.riskAI.pendingRiskData = null;

    if (typeof ERM.toast !== "undefined") {
      ERM.toast.success("AI data loaded - review and save");
    }
  }, 300);
};

/* ========================================
   FIELD-LEVEL AI SUGGESTIONS
   For manual risk form fields
   ======================================== */

/**
 * AI Thinking Tiers Configuration
 */
ERM.riskAI.thinkingConfig = {
  // Tier 1: Quick lookup (600ms) - Button text
  tier1: {
    fields: [
      "status",
      "treatment",
      "targetDate",
      "reviewDate",
      "category",
      "inherentLikelihood",
      "inherentImpact",
      "residualLikelihood",
      "residualImpact",
    ],
    duration: 600,
    type: "button",
  },
  // Tier 2: Smart suggest (900ms) - Button text (longer)
  tier2: {
    fields: ["title", "owner", "actionOwner"],
    duration: 900,
    type: "button",
  },
  // Tier 3: Content generation (1300ms) - Mini overlay with steps
  tier3: {
    fields: [
      "description",
      "rootCauses",
      "consequences",
      "actionPlan",
      "linkedControls",
    ],
    duration: 1300,
    type: "overlay",
  },
};

/**
 * Loading messages per field - system actions, not AI agency
 */
ERM.riskAI.thinkingMessages = {
  // All fields use unified "Loading suggestions" message
  status: "Loading suggestions",
  treatment: "Loading suggestions",
  targetDate: "Loading suggestions",
  reviewDate: "Loading suggestions",
  category: "Loading suggestions",
  strategicObjective: "Loading suggestions",
  inherentLikelihood: "Loading suggestions",
  inherentImpact: "Loading suggestions",
  residualLikelihood: "Loading suggestions",
  residualImpact: "Loading suggestions",
  title: "Loading suggestions",
  owner: "Loading suggestions",
  actionOwner: "Loading suggestions",
  description: "Loading suggestions",
  rootCauses: "Loading suggestions",
  consequences: "Loading suggestions",
  actionPlan: "Loading suggestions",
  linkedControls: "Loading suggestions",
};

/**
 * Overlay step messages for Tier 3 - system actions
 */
ERM.riskAI.overlaySteps = {
  description: {
    step1: "Loading context",
    step2: "Preparing suggestion",
  },
  rootCauses: { step1: "Loading risk data", step2: "Finding causes" },
  consequences: { step1: "Loading risk data", step2: "Finding consequences" },
  actionPlan: { step1: "Loading treatment", step2: "Finding actions" },
  linkedControls: {
    step1: "Loading library",
    step2: "Finding controls",
  },
};

/**
 * Get tier for a field
 */
ERM.riskAI.getFieldTier = function (fieldType) {
  if (this.thinkingConfig.tier1.fields.indexOf(fieldType) !== -1)
    return this.thinkingConfig.tier1;
  if (this.thinkingConfig.tier2.fields.indexOf(fieldType) !== -1)
    return this.thinkingConfig.tier2;
  if (this.thinkingConfig.tier3.fields.indexOf(fieldType) !== -1)
    return this.thinkingConfig.tier3;
  return this.thinkingConfig.tier1; // Default to quick
};

/**
 * Main entry point for field suggestions with thinking animation
 * Called from risk-register-modals.js
 */
ERM.riskAI.handleFieldSuggest = function (fieldType) {
  var self = this;

  console.log('[Risk AI] handleFieldSuggest called for:', fieldType);
  console.log('[Risk AI] ERM.enforcement exists:', typeof ERM.enforcement !== 'undefined');
  console.log('[Risk AI] ERM.enforcement.canUseAI exists:', typeof ERM.enforcement !== 'undefined' && typeof ERM.enforcement.canUseAI === 'function');
  console.log('[Risk AI] ERM.upgradeModal exists:', typeof ERM.upgradeModal !== 'undefined');

  // Check AI limit before proceeding
  if (typeof ERM.enforcement !== 'undefined' && ERM.enforcement.canUseAI) {
    var aiCheck = ERM.enforcement.canUseAI();
    console.log('[Risk AI] AI Check result:', aiCheck);

    if (!aiCheck.allowed) {
      console.log('[Risk AI] AI NOT ALLOWED - attempting to show upgrade modal');

      if (typeof ERM.upgradeModal !== 'undefined') {
        console.log('[Risk AI] Calling ERM.upgradeModal.show()');
        ERM.upgradeModal.show({
          title: 'AI Limit Reached',
          message: aiCheck.message,
          feature: 'AI Suggestions',
          upgradeMessage: aiCheck.upgradeMessage,
          current: aiCheck.current,
          limit: aiCheck.limit
        });
        return;
      } else {
        console.error('[Risk AI] ERM.upgradeModal is undefined!');
      }
    } else {
      console.log('[Risk AI] AI is allowed, continuing...');
    }
  } else {
    console.warn('[Risk AI] Enforcement check skipped - enforcement or canUseAI not available');
  }

  var message = this.thinkingMessages[fieldType] || "Loading suggestions";

  // Start thinking animation using unified module (all fields use button animation)
  self.currentThinkingState = ERM.aiSuggestions.startFieldThinking(fieldType, message);

  // Call DeepSeek immediately
  self.showFieldSuggestions(fieldType);
};

/**
 * Show thinking animation for field
 */
ERM.riskAI.showFieldThinking = function (fieldType, tier, message, callback) {
  var self = this;
  var btn = document.querySelector(
    '.btn-ai-suggest[data-field="' + fieldType + '"]'
  );

  if (tier.type === "button") {
    // Tier 1 & 2: Button shows text message
    this.showButtonThinking(btn, message, tier.duration, callback);
  } else if (tier.type === "overlay") {
    // Tier 3: Mini overlay with 2 steps
    var steps = this.overlaySteps[fieldType] || {
      step1: "Analyzing...",
      step2: message,
    };
    this.showMiniOverlay(fieldType, steps, tier.duration, callback);
  }
};

/**
 * Tier 1 & 2: Button shows thinking text
 */
ERM.riskAI.showButtonThinking = function (btn, message, duration, callback) {
  if (!btn) {
    if (callback) callback();
    return;
  }

  var originalHtml = btn.innerHTML;
  btn.classList.add("ai-thinking-btn");
  btn.innerHTML =
    '<span class="ai-thinking-content">' +
    this.icons.sparkles +
    " " +
    message +
    "</span>";
  btn.disabled = true;

  setTimeout(function () {
    btn.classList.remove("ai-thinking-btn");
    btn.innerHTML = originalHtml;
    btn.disabled = false;
    if (callback) callback();
  }, duration);
};

/**
 * Tier 3: Mini overlay with animated steps
 */
ERM.riskAI.showMiniOverlay = function (fieldType, steps, duration, callback) {
  var self = this;

  // Create overlay
  var overlay = document.createElement("div");
  overlay.className = "ai-mini-overlay";
  overlay.innerHTML =
    '<div class="ai-mini-content">' +
    '<div class="ai-mini-icon">' +
    this.icons.sparkles +
    "</div>" +
    '<div class="ai-mini-steps">' +
    '<div class="ai-mini-step active" data-step="0">' +
    '<span class="ai-mini-spinner"></span>' +
    "<span>" +
    steps.step1 +
    "</span>" +
    "</div>" +
    '<div class="ai-mini-step" data-step="1">' +
    '<span class="ai-mini-spinner"></span>' +
    "<span>" +
    steps.step2 +
    "</span>" +
    "</div>" +
    "</div>" +
    "</div>";

  document.body.appendChild(overlay);

  // Animate step 1 complete, step 2 active
  setTimeout(function () {
    var step0 = overlay.querySelector('[data-step="0"]');
    var step1 = overlay.querySelector('[data-step="1"]');
    if (step0) {
      step0.classList.remove("active");
      step0.classList.add("complete");
    }
    if (step1) {
      step1.classList.add("active");
    }
  }, duration * 0.4);

  // Complete and callback
  setTimeout(function () {
    var step1 = overlay.querySelector('[data-step="1"]');
    if (step1) {
      step1.classList.remove("active");
      step1.classList.add("complete");
    }

    // Fade out
    overlay.classList.add("fade-out");

    setTimeout(function () {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      if (callback) callback();
    }, 150);
  }, duration);
};

/**
 * Show persistent mini overlay (Tier 3) - stays until DeepSeek responds
 */
ERM.riskAI.showMiniOverlayPersistent = function(fieldType, steps) {
  var overlay = document.createElement("div");
  overlay.className = "ai-mini-overlay active";
  overlay.id = "ai-mini-overlay-" + fieldType;

  this.currentThinkingOverlay = overlay;

  overlay.innerHTML =
    '<div class="ai-mini-content">' +
    '<div class="ai-mini-steps">' +
    '<div class="ai-mini-step active" data-step="0">' +
    '<span class="ai-mini-step-icon"><span class="spinner"></span></span>' +
    '<span class="ai-mini-step-text">' + steps.step1 + '</span>' +
    '</div>' +
    '<div class="ai-mini-step" data-step="1">' +
    '<span class="ai-mini-step-icon"><span class="spinner"></span></span>' +
    '<span class="ai-mini-step-text">' + steps.step2 + '</span>' +
    '</div>' +
    '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  // Animate to step 2 after a moment
  setTimeout(function () {
    var step0 = overlay.querySelector('[data-step="0"]');
    var step1 = overlay.querySelector('[data-step="1"]');
    if (step0) {
      step0.classList.remove("active");
      step0.classList.add("complete");
    }
    if (step1) {
      step1.classList.add("active");
    }
  }, 1200);
};

/**
 * Clear thinking button animation and overlay
 * Used to restore button state after DeepSeek responds
 */
ERM.riskAI.clearThinkingButton = function() {
  // Clear button spinner using unified module
  if (this.currentThinkingState) {
    ERM.aiSuggestions.stopButtonThinking(this.currentThinkingState);
    this.currentThinkingState = null;
  }

  // Clear overlay spinner
  if (this.currentThinkingOverlay) {
    var overlay = this.currentThinkingOverlay;
    overlay.classList.add("fade-out");
    setTimeout(function() {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 150);
    this.currentThinkingOverlay = null;
  }
};

/**
 * Actual field suggestion logic (called after thinking animation)
 * NOTE: AI limit check is done in handleFieldSuggest before this is called
 */
ERM.riskAI.showFieldSuggestions = function (fieldType) {
  var title = this.getFormValue("risk-title");
  var category = this.getFormValue("risk-category");

  switch (fieldType) {
    case "title":
      this.showTitleSuggestions(category);
      break;
    case "category":
      this.showCategorySuggestions(title);
      break;
    case "strategicObjective":
      this.showStrategicObjectiveSuggestions(title, category);
      break;
    case "description":
      this.showDescriptionSuggestions(title, category);
      break;
    case "rootCauses":
      this.showCausesSuggestions(title, category);
      break;
    case "consequences":
      this.showConsequencesSuggestions(title, category);
      break;
    case "owner":
      this.showOwnerSuggestions(category);
      break;
    case "actionOwner":
      this.showActionOwnerSuggestions(category);
      break;
    case "treatment":
      this.showTreatmentSuggestions(title, category);
      break;
    case "status":
      this.showStatusSuggestions();
      break;
    case "actionPlan":
      this.showActionPlanSuggestions(title, category);
      break;
    case "targetDate":
      this.showTargetDateSuggestions(category);
      break;
    case "reviewDate":
      this.showReviewDateSuggestions(category);
      break;
    case "inherentLikelihood":
    case "inherentImpact":
      this.showInherentScoreSuggestions(title, category, fieldType);
      break;
    case "residualLikelihood":
    case "residualImpact":
      this.showResidualScoreSuggestions(title, category, fieldType);
      break;
    case "linkedControls":
      // TODO: Implement linked controls suggestions
      if (typeof ERM.toast !== "undefined") {
        ERM.toast.info("Control suggestions coming soon");
      }
      break;
    default:
      if (typeof ERM.toast !== "undefined") {
        ERM.toast.info("AI suggestions coming soon for: " + fieldType);
      }
  }
};

/**
 * Get form field value
 */
ERM.riskAI.getFormValue = function (fieldId) {
  var el = document.getElementById(fieldId);
  return el ? el.value.trim() : "";
};

/**
 * Apply suggestion to a field
 * Delegates to unified ERM.aiSuggestions module
 */
ERM.riskAI.applyToField = function (fieldId, value) {
  var self = this;

  // Build options based on field type
  var options = {
    scheduleDraftSave: function() {
      if (ERM.riskRegister && ERM.riskRegister.scheduleRiskDraftSave) {
        ERM.riskRegister.scheduleRiskDraftSave(ERM.riskRegister.state.editingRiskId || null);
      }
    }
  };

  // Special handling for category field
  if (fieldId === "risk-category") {
    options.type = 'category';
    options.hiddenFieldId = 'risk-category-id';
    options.formatValue = function(v) {
      return self.formatCategory(v);
    };
    options.toastMessage = 'Category applied';
  }

  // Use unified applyToField
  ERM.aiSuggestions.applyToField(fieldId, value, options);
};

/**
 * Show title suggestions - DeepSeek powered
 * Searches templates by keywords, titles, plainLanguage as fallback
 * Randomized, limited, with recommended highlight
 */
ERM.riskAI.showTitleSuggestions = function (category) {
  var self = this;

  // Get what user typed
  var titleInput = document.getElementById("risk-title");
  var userText = titleInput ? titleInput.value.trim() : "";

  // Check if DeepSeek module is available
  if (!ERM.riskAI.deepSeek || typeof ERM.riskAI.deepSeek.getSuggestions !== "function") {
    console.log("[Title] DeepSeek not available, using template fallback");
    // Clear thinking spinner
    self.clearThinkingButton();

    if (!self.hasTemplates()) {
      ERM.components.modalManager.openSecondary({
        title: self.icons.sparkles + " Risk Title Suggestions",
        content:
          '<div class="ai-suggestions-container">' +
          '<p class="ai-suggestions-intro">AI service temporarily unavailable.</p>' +
          '<p class="text-muted">Please check your connection or refresh the page.</p>' +
          "</div>",
        buttons: [{ label: "Close", type: "secondary", action: "close" }],
      });
      return;
    }
    var allSuggestions = self.getTitleSuggestions(userText, category);
    if (!allSuggestions || allSuggestions.length === 0) {
      ERM.components.modalManager.openSecondary({
        title: self.icons.sparkles + " Risk Title Suggestions",
        content:
          '<div class="ai-suggestions-container">' +
          '<p class="ai-suggestions-intro">No AI suggestions found.</p>' +
          '<p class="text-muted">Try using the <strong>AI Risk Builder</strong> for guided risk creation.</p>' +
          "</div>",
        buttons: [{ label: "Close", type: "secondary", action: "close" }],
      });
      return;
    }
    self._renderTitleSuggestionsModal(allSuggestions, 0, userText, category);
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.riskAI.deepSeek.getFormContext();
  if (!context.category && category) {
    context.category = category;
  }
  // Include any partial text user typed
  if (userText) {
    context.partialTitle = userText;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.riskAI.deepSeek.getSuggestions("title", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      // Fallback to template-based suggestions
      console.log("[Title] DeepSeek failed, using template fallback");

      // Check if templates are loaded for fallback
      if (!self.hasTemplates()) {
        ERM.components.modalManager.openSecondary({
          title: self.icons.sparkles + " Risk Title Suggestions",
          content:
            '<div class="ai-suggestions-container">' +
            '<p class="ai-suggestions-intro">AI service temporarily unavailable.</p>' +
            '<p class="text-muted">Please check your connection or refresh the page.</p>' +
            "</div>",
          buttons: [{ label: "Close", type: "secondary", action: "close" }],
        });
        return;
      }

      var allSuggestions = self.getTitleSuggestions(userText, category);
      if (!allSuggestions || allSuggestions.length === 0) {
        ERM.components.modalManager.openSecondary({
          title: self.icons.sparkles + " Risk Title Suggestions",
          content:
            '<div class="ai-suggestions-container">' +
            '<p class="ai-suggestions-intro">No AI suggestions found.</p>' +
            '<p class="text-muted">Try using the <strong>AI Risk Builder</strong> for guided risk creation.</p>' +
            "</div>",
          buttons: [{ label: "Close", type: "secondary", action: "close" }],
        });
        return;
      }
      // Show results directly
      self._renderTitleSuggestionsModal(allSuggestions, 0, userText, category);
    } else {
      // Show DeepSeek suggestions directly
      self._renderTitleSuggestionsModal(result.suggestions, result.recommended, userText, category);
    }
  });
};

/**
 * Render title suggestions modal (shared by DeepSeek and fallback)
 * Uses unified ERM.components.showAISuggestionModal
 */
ERM.riskAI._renderTitleSuggestionsModal = function(allSuggestions, recommendedIndex, userText, category) {
  var self = this;

  // Build suggestions array with recommended flag (max 3 per spec)
  var suggestions = [];
  for (var i = 0; i < Math.min(allSuggestions.length, 3); i++) {
    suggestions.push({
      text: allSuggestions[i],
      recommended: i === recommendedIndex
    });
  }

  ERM.components.showAISuggestionModal({
    title: "Risk Title Suggestions",
    fieldName: userText ? 'Matching "' + userText + '"' : "Risk Title",
    suggestions: suggestions,
    onSelect: function(selectedText) {
      self.applyToField("risk-title", selectedText);
      if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
        ERM.riskAI.deepSeek.onSuggestionUsed();
      }
    }
  });
};


/**
 * Get title suggestions from industry templates
 * Searches by user text (keywords, titles, plainLanguage)
 * Falls back to category filter or all titles if no text
 */
ERM.riskAI.getTitleSuggestions = function (userText, category) {
  var self = this;
  var suggestions = [];

  if (!this.hasTemplates()) {
    return suggestions;
  }

  var allRisks = this.getAllTemplateRisks();

  // If user typed something, search for matching templates
  if (userText && userText.length >= 2) {
    var searchTerms = userText.toLowerCase().split(/\s+/);
    var stopWords = [
      "the",
      "a",
      "an",
      "of",
      "to",
      "in",
      "for",
      "and",
      "or",
      "is",
      "are",
      "be",
      "was",
      "were",
      "risk",
      "risks",
      "our",
      "we",
      "might",
      "could",
      "may",
      "would",
      "should",
      "can",
      "will",
      "that",
      "this",
      "with",
      "from",
      "about",
      "poor",
      "bad",
      "good",
      "better",
      "best",
      "worst",
    ];

    // Filter out stop words but keep short meaningful terms like IT, HR, AI
    var meaningfulTerms = [];
    for (var st = 0; st < searchTerms.length; st++) {
      var term = searchTerms[st];
      if (term.length >= 2 && stopWords.indexOf(term) === -1) {
        meaningfulTerms.push(term);
      }
    }

    if (meaningfulTerms.length > 0) {
      // Score each risk by how well it matches
      var scored = [];

      for (var i = 0; i < allRisks.length; i++) {
        var risk = allRisks[i];
        var score = 0;
        var matchedTerms = 0; // Track how many search terms matched

        // For each search term, check if it matches this risk
        for (var mt = 0; mt < meaningfulTerms.length; mt++) {
          var term = meaningfulTerms[mt];
          var termMatched = false;
          var isShortTerm = term.length <= 3;

          // Check id
          if (risk.id) {
            var idParts = risk.id.toLowerCase().split("-");
            for (var ip = 0; ip < idParts.length; ip++) {
              if (isShortTerm) {
                if (idParts[ip] === term) {
                  score += 8;
                  termMatched = true;
                }
              } else {
                if (
                  idParts[ip].indexOf(term) !== -1 ||
                  term.indexOf(idParts[ip]) !== -1
                ) {
                  score += 6;
                  termMatched = true;
                }
              }
            }
          }

          // Check keywords - SPLIT PHRASES INTO WORDS
          if (risk.keywords) {
            for (var k = 0; k < risk.keywords.length; k++) {
              var keywordPhrase = risk.keywords[k].toLowerCase();
              var keywordWords = keywordPhrase.split(/\s+/);

              // Check each word within the keyword phrase
              for (var kw = 0; kw < keywordWords.length; kw++) {
                var word = keywordWords[kw];
                if (isShortTerm) {
                  // Short terms: exact word match only
                  if (word === term) {
                    score += 15;
                    termMatched = true;
                    break;
                  }
                } else {
                  // Longer terms: allow partial
                  if (word === term) {
                    score += 15;
                    termMatched = true;
                    break;
                  } else if (
                    word.indexOf(term) === 0 ||
                    term.indexOf(word) === 0
                  ) {
                    // Prefix match
                    score += 8;
                    termMatched = true;
                  } else if (word.length > 3 && word.indexOf(term) !== -1) {
                    score += 4;
                    termMatched = true;
                  }
                }
              }
            }
          }

          // Check titles - split into words for accurate matching
          if (risk.titles) {
            for (var t = 0; t < risk.titles.length; t++) {
              var titleWords = risk.titles[t].toLowerCase().split(/\s+/);

              for (var tw = 0; tw < titleWords.length; tw++) {
                var tWord = titleWords[tw];
                if (isShortTerm) {
                  // Short term: exact word match only
                  if (tWord === term) {
                    score += 10;
                    termMatched = true;
                    break;
                  }
                } else {
                  // Longer term: exact word match or word contains term
                  if (tWord === term) {
                    score += 10;
                    termMatched = true;
                    break;
                  } else if (tWord.indexOf(term) !== -1) {
                    score += 6;
                    termMatched = true;
                  }
                }
              }
            }
          }

          // Check plainLanguage - split into words for accurate matching
          if (risk.plainLanguage) {
            for (var p = 0; p < risk.plainLanguage.length; p++) {
              var plWords = risk.plainLanguage[p].toLowerCase().split(/\s+/);
              for (var pw = 0; pw < plWords.length; pw++) {
                var pWord = plWords[pw];
                if (isShortTerm) {
                  // Short term: exact word match only
                  if (pWord === term) {
                    score += 4;
                    termMatched = true;
                    break;
                  }
                } else {
                  // Longer term: exact word match or word contains term
                  if (pWord === term) {
                    score += 4;
                    termMatched = true;
                    break;
                  } else if (pWord.indexOf(term) !== -1) {
                    score += 3;
                    termMatched = true;
                  }
                }
              }
            }
          }

          // Check relatedCategories
          if (risk.relatedCategories) {
            for (var rc = 0; rc < risk.relatedCategories.length; rc++) {
              var catParts = risk.relatedCategories[rc]
                .toLowerCase()
                .split("-");
              for (var cp = 0; cp < catParts.length; cp++) {
                if (isShortTerm) {
                  if (catParts[cp] === term) {
                    score += 6;
                    termMatched = true;
                    break;
                  }
                } else {
                  if (
                    catParts[cp].indexOf(term) !== -1 ||
                    term.indexOf(catParts[cp]) !== -1
                  ) {
                    score += 4;
                    termMatched = true;
                    break;
                  }
                }
              }
            }
          }

          if (termMatched) matchedTerms++;
        }

        // MULTI-TERM BONUS: If multiple search terms matched, boost score significantly
        if (matchedTerms >= 2) {
          score += matchedTerms * 10; // Bonus for matching multiple terms
        }

        if (score > 0) {
          scored.push({ risk: risk, score: score, matchedTerms: matchedTerms });
        }
      }

      // Sort by score descending, then by matchedTerms
      scored.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return b.matchedTerms - a.matchedTerms;
      });

      // MINIMUM SCORE THRESHOLD - prevent weak/random matches
      // For short terms (2-3 chars): require at least 10 (exact keyword match)
      // For longer terms: require at least 8
      var hasShortTerm = false;
      for (var chk = 0; chk < meaningfulTerms.length; chk++) {
        if (meaningfulTerms[chk].length <= 3) hasShortTerm = true;
      }
      var minScore = hasShortTerm ? 10 : 8;

      // Filter to only scores above threshold
      var strongMatches = [];
      for (var sm = 0; sm < scored.length; sm++) {
        if (scored[sm].score >= minScore) {
          strongMatches.push(scored[sm]);
        }
      }

      // Get titles from strong matches only
      for (
        var s = 0;
        s < strongMatches.length && suggestions.length < 20;
        s++
      ) {
        var matchedRisk = strongMatches[s].risk;
        if (matchedRisk.titles && matchedRisk.titles.length > 0) {
          // Add primary title first
          if (suggestions.indexOf(matchedRisk.titles[0]) === -1) {
            suggestions.push(matchedRisk.titles[0]);
          }
          // Add a few variations
          for (var tv = 1; tv < Math.min(3, matchedRisk.titles.length); tv++) {
            if (suggestions.indexOf(matchedRisk.titles[tv]) === -1) {
              suggestions.push(matchedRisk.titles[tv]);
            }
          }
        }
      }

      // If we found strong matches, return them
      if (suggestions.length > 0) {
        return suggestions;
      }

      // User typed something but no strong matches - return empty (not random)
      return [];
    }
  }

  // FALLBACK: Only when user typed NOTHING - show category-based or general suggestions
  if (!userText || userText.length < 2) {
    for (var j = 0; j < allRisks.length; j++) {
      var risk2 = allRisks[j];

      // If category specified, only include related risks
      if (category && risk2.relatedCategories) {
        var isRelated = false;
        for (var rc = 0; rc < risk2.relatedCategories.length; rc++) {
          if (
            risk2.relatedCategories[rc].indexOf(category) !== -1 ||
            category.indexOf(risk2.relatedCategories[rc]) !== -1
          ) {
            isRelated = true;
            break;
          }
        }
        if (!isRelated) continue;
      }

      // Add primary title from each risk
      if (risk2.titles && risk2.titles.length > 0) {
        if (suggestions.indexOf(risk2.titles[0]) === -1) {
          suggestions.push(risk2.titles[0]);
        }
      }
    }

    // Limit to reasonable number
    return suggestions.slice(0, 20);
  }

  // User typed something but fallback reached - return empty
  return [];
};

/**
 * Shuffle array randomly (Fisher-Yates)
 */
ERM.riskAI.shuffleArray = function (array) {
  var shuffled = array.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
};

/**
 * Show strategic objective suggestions based on title and category
 */
ERM.riskAI.showStrategicObjectiveSuggestions = function (title, category) {
  var self = this;

  // Clear thinking spinner
  self.clearThinkingButton();

  if (!title && !category) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.warning("Please enter a risk title or category first");
    }
    return;
  }

  // Common strategic objectives
  var objectives = [
    { value: "Revenue Growth", description: "Increase market share and sales revenue" },
    { value: "Operational Excellence", description: "Improve efficiency and reduce costs" },
    { value: "Customer Satisfaction", description: "Enhance customer experience and retention" },
    { value: "Regulatory Compliance", description: "Meet legal and regulatory requirements" },
    { value: "Digital Transformation", description: "Modernize technology and processes" },
    { value: "Employee Development", description: "Attract, retain, and develop talent" },
    { value: "Sustainability", description: "Environmental and social responsibility" },
    { value: "Innovation", description: "Develop new products and services" },
    { value: "Risk Management", description: "Protect assets and reduce exposure" },
    { value: "Financial Stability", description: "Maintain healthy cash flow and capital" }
  ];

  // Filter based on category if available
  var filteredObjectives = objectives;
  if (category) {
    var catLower = category.toLowerCase();
    if (catLower.indexOf("financial") !== -1) {
      filteredObjectives = objectives.filter(function(o) {
        return o.value.toLowerCase().indexOf("financial") !== -1 ||
               o.value.toLowerCase().indexOf("revenue") !== -1 ||
               o.value.toLowerCase().indexOf("risk") !== -1;
      });
    } else if (catLower.indexOf("technology") !== -1 || catLower.indexOf("cyber") !== -1) {
      filteredObjectives = objectives.filter(function(o) {
        return o.value.toLowerCase().indexOf("digital") !== -1 ||
               o.value.toLowerCase().indexOf("innovation") !== -1 ||
               o.value.toLowerCase().indexOf("operational") !== -1;
      });
    } else if (catLower.indexOf("compliance") !== -1 || catLower.indexOf("regulatory") !== -1) {
      filteredObjectives = objectives.filter(function(o) {
        return o.value.toLowerCase().indexOf("compliance") !== -1 ||
               o.value.toLowerCase().indexOf("risk") !== -1;
      });
    }
  }

  // Fallback to all if filtered is too small
  if (filteredObjectives.length < 3) {
    filteredObjectives = objectives;
  }

  // Build modal content
  var content = '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">Select the strategic objective this risk impacts:</p>' +
    '<div class="ai-suggestions-list">';

  for (var i = 0; i < filteredObjectives.length; i++) {
    var obj = filteredObjectives[i];
    content +=
      '<button type="button" class="ai-suggestion-item btn-strategic-objective" data-value="' +
      ERM.utils.escapeHtml(obj.value) + '">' +
      '<span class="ai-suggestion-text">' + ERM.utils.escapeHtml(obj.value) + '</span>' +
      '<span class="ai-suggestion-desc">' + ERM.utils.escapeHtml(obj.description) + '</span>' +
      '</button>';
  }

  content += '</div></div>';

  ERM.components.modalManager.openSecondary({
    title: this.icons.sparkles + " Strategic Objective Suggestions",
    content: content,
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      self.bindStrategicObjectiveEvents();
    },
  });
};

/**
 * Bind strategic objective selection events
 */
ERM.riskAI.bindStrategicObjectiveEvents = function () {
  var self = this;
  var buttons = document.querySelectorAll(".btn-strategic-objective");

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      var value = this.getAttribute("data-value");
      self.applyToField("risk-strategic-objective", value);
      ERM.components.modalManager.closeSecondary();
      ERM.toast.success("Strategic objective applied");
    });
  }
};

/**
 * Show category suggestions based on title
 * Uses DeepSeek AI for intelligent category matching
 */
ERM.riskAI.showCategorySuggestions = function (title) {
  var self = this;

  // Clear thinking spinner
  self.clearThinkingButton();

  if (!title) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.warning("Please enter a risk title first");
    }
    return;
  }

  // Show loading modal first
  var loadingContent = '<div class="ai-suggestions-container">' +
    '<div id="ai-main-content">' +
    '<div class="ai-thinking-container" style="text-align: center; padding: 40px 20px;">' +
    '<div class="ai-thinking-spinner" style="margin-bottom: 16px;">' +
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">' +
    '<circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>' +
    '<path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>' +
    '</svg></div>' +
    '<p class="ai-thinking-text" style="color: #6b7280; margin: 0;">Analyzing risk context with AI...</p>' +
    '</div></div>';

  // Quick select section
  var genericCats = this.shuffleArray(ERM.riskRegister.categories.slice());
  var displayGeneric = genericCats.slice(0, 5);

  loadingContent +=
    '<div class="ai-section ai-section-secondary" id="ai-generic-section">' +
    '<p class="ai-section-header">Quick select:</p>' +
    '<div class="ai-generic-categories">';

  for (var j = 0; j < displayGeneric.length; j++) {
    loadingContent +=
      '<button type="button" class="btn btn-sm btn-ghost btn-generic-category" data-category="' +
      displayGeneric[j].value + '">' +
      displayGeneric[j].label + "</button>";
  }
  loadingContent += "</div></div></div>";

  ERM.components.modalManager.openSecondary({
    title: this.icons.sparkles + " AI Category Suggestions",
    content: loadingContent,
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      self.bindCategorySuggestionEvents();
      // Now call DeepSeek for suggestions
      self._fetchCategorySuggestionsFromDeepSeek(title);
    },
  });
};

/**
 * Fetch category suggestions from DeepSeek AI
 */
ERM.riskAI._fetchCategorySuggestionsFromDeepSeek = function(title) {
  var self = this;

  // Check if DeepSeek is available
  if (!ERM.riskAI.deepSeek || !ERM.riskAI.deepSeek.getSuggestions) {
    console.log("[Category] DeepSeek not available, showing quick select only");
    self._showCategoryQuickSelectOnly();
    return;
  }

  // Get form context
  var context = ERM.riskAI.deepSeek.getFormContext();
  context.title = title;

  ERM.riskAI.deepSeek.getSuggestions("category", context, function(error, result) {
    if (error || !result || !result.suggestions || result.suggestions.length === 0) {
      console.log("[Category] DeepSeek failed or no suggestions:", error);
      self._showCategoryQuickSelectOnly();
      return;
    }

    // Parse suggestions and update modal
    self._renderCategorySuggestions(result.suggestions, result.recommended || 0);
  });
};

/**
 * Render category suggestions from DeepSeek
 */
ERM.riskAI._renderCategorySuggestions = function(suggestions, recommendedIndex) {
  var self = this;
  var mainContent = document.getElementById("ai-main-content");
  if (!mainContent) return;

  var content = '<div class="ai-section">' +
    '<div class="ai-category-results ai-stagger-container" id="ai-category-results">';

  for (var i = 0; i < suggestions.length; i++) {
    var suggestion = suggestions[i];
    var catName = suggestion.category || suggestion;
    var reason = suggestion.reason || "";
    var isRecommended = i === recommendedIndex;
    var delay = (i + 1) * 0.1;

    // Find matching category value from ERM.riskRegister.categories
    var catValue = catName;
    if (ERM.riskRegister && ERM.riskRegister.categories) {
      for (var c = 0; c < ERM.riskRegister.categories.length; c++) {
        var cat = ERM.riskRegister.categories[c];
        if (cat.label === catName || cat.value === catName) {
          catValue = cat.value;
          catName = cat.label;
          break;
        }
      }
    }

    content +=
      '<div class="ai-category-item ' + (isRecommended ? 'ai-recommended' : '') + ' ai-stagger-item" style="animation-delay: ' + delay + 's">' +
      '<div class="ai-category-info">' +
      (isRecommended ? '<span class="ai-recommended-badge">Recommended</span>' : '') +
      '<span class="ai-category-name">' + catName + '</span>' +
      (reason ? '<span class="ai-category-reason" style="display: block; font-size: 12px; color: #6b7280; margin-top: 4px;">' + reason + '</span>' : '') +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use-category" data-category="' + catValue + '">Use</button>' +
      '</div>';
  }

  content += '</div></div>';

  mainContent.innerHTML = content;

  // Rebind events for new buttons
  self.bindCategorySuggestionEvents();
};

/**
 * Show only quick select when DeepSeek fails
 */
ERM.riskAI._showCategoryQuickSelectOnly = function() {
  var mainContent = document.getElementById("ai-main-content");
  if (!mainContent) return;

  mainContent.innerHTML =
    '<div class="ai-section">' +
    '<p class="text-muted" style="margin-bottom: 12px; text-align: center;">Select a category from the options below.</p>' +
    '</div>';
};

/**
 * Get available departments (templates removed - returns empty array)
 */
ERM.riskAI.getAvailableDepartments = function () {
  return [];
};

/**
 * Show AI Deep Search with thinking steps animation
 */
ERM.riskAI.showAIDeepSearch = function () {
  var self = this;
  var mainContent = document.getElementById("ai-main-content");

  if (!mainContent) return;

  // Loading messages - system actions, not AI agency
  var thinkingMessages = [
    [
      "Loading risk context",
      "Finding relevant categories",
      "Preparing suggestions",
    ],
    [
      "Checking risk patterns",
      "Mapping to risk areas",
      "Generating options",
    ],
    [
      "Loading risk data",
      "Finding matches",
      "Preparing results",
    ],
  ];
  var msgs =
    thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];

  // Replace main content with thinking steps
  mainContent.innerHTML =
    '<div class="ai-thinking-steps">' +
    '<div class="ai-step active" data-step="1">' +
    '<span class="ai-step-icon">â³</span>' +
    '<span class="ai-step-text">' +
    msgs[0] +
    "</span>" +
    "</div>" +
    '<div class="ai-step" data-step="2">' +
    '<span class="ai-step-icon">â³</span>' +
    '<span class="ai-step-text">' +
    msgs[1] +
    "</span>" +
    "</div>" +
    '<div class="ai-step" data-step="3">' +
    '<span class="ai-step-icon">â³</span>' +
    '<span class="ai-step-text">' +
    msgs[2] +
    "</span>" +
    "</div>" +
    "</div>";

  // Step 1 complete (800ms)
  setTimeout(function () {
    var step1 = mainContent.querySelector('.ai-step[data-step="1"]');
    var step2 = mainContent.querySelector('.ai-step[data-step="2"]');
    if (step1) {
      step1.classList.remove("active");
      step1.classList.add("complete");
      step1.querySelector(".ai-step-icon").textContent = "âœ“";
    }
    if (step2) {
      step2.classList.add("active");
    }
  }, 800);

  // Step 2 complete (1600ms)
  setTimeout(function () {
    var step2 = mainContent.querySelector('.ai-step[data-step="2"]');
    var step3 = mainContent.querySelector('.ai-step[data-step="3"]');
    if (step2) {
      step2.classList.remove("active");
      step2.classList.add("complete");
      step2.querySelector(".ai-step-icon").textContent = "âœ“";
    }
    if (step3) {
      step3.classList.add("active");
    }
  }, 1600);

  // Step 3 complete & show results (2400ms)
  setTimeout(function () {
    var step3 = mainContent.querySelector('.ai-step[data-step="3"]');
    if (step3) {
      step3.classList.remove("active");
      step3.classList.add("complete");
      step3.querySelector(".ai-step-icon").textContent = "âœ“";
    }

    // Show areas after brief pause
    setTimeout(function () {
      self.showDeepSearchAreas();
    }, 400);
  }, 2400);
};

/**
 * Show areas after thinking animation
 * Randomized, limited, with staggered fade-in
 */
ERM.riskAI.showDeepSearchAreas = function () {
  var self = this;
  var mainContent = document.getElementById("ai-main-content");
  if (!mainContent) return;

  var departments = this.getAvailableDepartments();

  if (departments.length === 0) {
    mainContent.innerHTML =
      '<p class="text-muted">No additional categories found.</p>';
    return;
  }

  // Randomize and limit to 6 areas
  var shuffled = this.shuffleArray(departments);
  var displayDepts = shuffled.slice(0, 6);
  var hasMore = departments.length > 6;

  // Store full list for "discover more"
  this.allDepartments = departments;
  this.shownDepartments = displayDepts;

  var html =
    '<div class="ai-section">' +
    '<p class="ai-section-header"><span class="ai-badge">âœ¨ Suggested Areas</span></p>' +
    '<div class="ai-area-grid ai-stagger-container">';

  for (var i = 0; i < displayDepts.length; i++) {
    var delay = (i + 1) * 0.12;
    html +=
      '<button type="button" class="btn btn-sm btn-ai-area ai-stagger-item" data-dept="' +
      displayDepts[i].id +
      '" style="animation-delay: ' +
      delay +
      's">' +
      displayDepts[i].name +
      "</button>";
  }

  html += "</div>";

  html += "</div>";

  mainContent.innerHTML = html;

  // Bind area button clicks
  var areaBtns = mainContent.querySelectorAll(".btn-ai-area");
  for (var j = 0; j < areaBtns.length; j++) {
    areaBtns[j].addEventListener("click", function () {
      var deptId = this.getAttribute("data-dept");
      self.showAreaCategories(deptId, this);
    });
  }
};

/**
 * Show more areas (reshuffled) with thinking
 */
ERM.riskAI.showMoreAreas = function () {
  var self = this;
  var mainContent = document.getElementById("ai-main-content");
  if (!mainContent || !this.allDepartments) return;

  // Show thinking in main content
  var discoverBtn = document.getElementById("btn-discover-more-areas");
  if (discoverBtn) {
    discoverBtn.disabled = true;
    discoverBtn.innerHTML = "â³ Discovering...";
  }

  // Random thinking messages
  var messages = [
    "Exploring areas...",
    "Finding categories...",
    "Analyzing domains...",
    "Mapping risk areas...",
  ];
  var msg = messages[Math.floor(Math.random() * messages.length)];

  var areaGrid = mainContent.querySelector(".ai-area-grid");
  if (areaGrid) {
    areaGrid.innerHTML =
      '<div class="ai-more-thinking">' +
      '<div class="ai-thinking-spinner"></div>' +
      "<span>" +
      msg +
      "</span>" +
      "</div>";
  }

  // After delay, render new areas
  setTimeout(function () {
    self._renderMoreAreas();
  }, 800);
};

/**
 * Render more areas after thinking
 */
ERM.riskAI._renderMoreAreas = function () {
  var self = this;
  var mainContent = document.getElementById("ai-main-content");
  if (!mainContent) return;

  // Get departments not yet shown, or reshuffle all if all were shown
  var remaining = [];
  for (var i = 0; i < this.allDepartments.length; i++) {
    var wasShown = false;
    for (var j = 0; j < this.shownDepartments.length; j++) {
      if (this.allDepartments[i].id === this.shownDepartments[j].id) {
        wasShown = true;
        break;
      }
    }
    if (!wasShown) {
      remaining.push(this.allDepartments[i]);
    }
  }

  // If no remaining, reshuffle all
  if (remaining.length === 0) {
    remaining = this.shuffleArray(this.allDepartments);
    this.shownDepartments = [];
  }

  var displayDepts = remaining.slice(0, 6);
  var hasMore =
    remaining.length > 6 || this.allDepartments.length > displayDepts.length;

  this.shownDepartments = displayDepts;

  var html =
    '<div class="ai-section">' +
    '<p class="ai-section-header"><span class="ai-badge">âœ¨ More Areas</span></p>' +
    '<div class="ai-area-grid ai-stagger-container">';

  for (var k = 0; k < displayDepts.length; k++) {
    var delay = (k + 1) * 0.12;
    html +=
      '<button type="button" class="btn btn-sm btn-ai-area ai-stagger-item" data-dept="' +
      displayDepts[k].id +
      '" style="animation-delay: ' +
      delay +
      's">' +
      displayDepts[k].name +
      "</button>";
  }

  html += "</div>";
  html += "</div>";

  mainContent.innerHTML = html;

  // Rebind events
  var areaBtns = mainContent.querySelectorAll(".btn-ai-area");
  for (var m = 0; m < areaBtns.length; m++) {
    areaBtns[m].addEventListener("click", function () {
      var deptId = this.getAttribute("data-dept");
      self.showAreaCategories(deptId, this);
    });
  }
};

/**
 * Show categories for an area with button thinking animation
 */
ERM.riskAI.showAreaCategories = function (deptId, clickedBtn) {
  var self = this;
  var mainContent = document.getElementById("ai-main-content");
  if (!mainContent) return;

  // Get area name for display
  var areaName = clickedBtn ? clickedBtn.textContent : deptId;

  // Loading messages - system actions
  var thinkingVariants = [
    [
      "Loading " + areaName + " risks",
      "Finding relevant categories",
      "Ranking by importance",
    ],
    [
      "Checking " + areaName + " area",
      "Finding matching categories",
      "Prioritizing results",
    ],
    [
      "Loading " + areaName + " context",
      "Finding categories",
      "Preparing suggestions",
    ],
  ];
  var msgs =
    thinkingVariants[Math.floor(Math.random() * thinkingVariants.length)];

  // Replace main content with thinking (visible without scrolling)
  mainContent.innerHTML =
    '<div class="ai-thinking-steps">' +
    '<div class="ai-step active" data-step="1">' +
    '<span class="ai-step-icon">â³</span>' +
    '<span class="ai-step-text">' +
    msgs[0] +
    "</span>" +
    "</div>" +
    '<div class="ai-step" data-step="2">' +
    '<span class="ai-step-icon">â³</span>' +
    '<span class="ai-step-text">' +
    msgs[1] +
    "</span>" +
    "</div>" +
    '<div class="ai-step" data-step="3">' +
    '<span class="ai-step-icon">â³</span>' +
    '<span class="ai-step-text">' +
    msgs[2] +
    "</span>" +
    "</div>" +
    "</div>";

  // Step 1 complete (600ms)
  setTimeout(function () {
    var step1 = mainContent.querySelector('.ai-step[data-step="1"]');
    var step2 = mainContent.querySelector('.ai-step[data-step="2"]');
    if (step1) {
      step1.classList.remove("active");
      step1.classList.add("complete");
      step1.querySelector(".ai-step-icon").textContent = "âœ“";
    }
    if (step2) {
      step2.classList.add("active");
    }
  }, 600);

  // Step 2 complete (1200ms)
  setTimeout(function () {
    var step2 = mainContent.querySelector('.ai-step[data-step="2"]');
    var step3 = mainContent.querySelector('.ai-step[data-step="3"]');
    if (step2) {
      step2.classList.remove("active");
      step2.classList.add("complete");
      step2.querySelector(".ai-step-icon").textContent = "âœ“";
    }
    if (step3) {
      step3.classList.add("active");
    }
  }, 1200);

  // Step 3 complete & show categories (1800ms)
  setTimeout(function () {
    var step3 = mainContent.querySelector('.ai-step[data-step="3"]');
    if (step3) {
      step3.classList.remove("active");
      step3.classList.add("complete");
      step3.querySelector(".ai-step-icon").textContent = "âœ“";
    }

    // Show categories after brief pause
    setTimeout(function () {
      self.displayAreaCategories(deptId, areaName);
    }, 300);
  }, 1800);
};

/**
 * Display categories for an area with back button
 */
ERM.riskAI.displayAreaCategories = function (deptId, areaName) {
  var self = this;
  var mainContent = document.getElementById("ai-main-content");
  if (!mainContent) return;

  var categories = [];
  // Templates removed - categories will be empty

  // Shuffle and limit - keep first as "recommended", randomize rest
  var recommended = categories.length > 0 ? categories[0] : null;
  var others =
    categories.length > 1 ? this.shuffleArray(categories.slice(1)) : [];
  var displayOthers = others.slice(0, 2); // Show 4 more (5 total)
  var hasMore = others.length > 4;

  // Store for "discover more"
  this.areaCategoriesAll = categories;
  this.areaCategoriesShown = recommended
    ? [recommended].concat(displayOthers)
    : displayOthers;
  this.currentAreaDeptId = deptId;
  this.currentAreaName = areaName;

  // Build HTML with AI-style back button
  var html =
    '<div class="ai-section">' +
    '<button type="button" class="btn btn-sm btn-ai-back" id="btn-ai-search-again">' +
    '<span class="ai-back-icon">âœ¨</span> Explore Other Areas' +
    "</button>" +
    '<p class="ai-area-title">' +
    areaName +
    "</p>";

  if (categories.length === 0) {
    html += '<p class="text-muted">No categories found.</p>';
  } else {
    html += '<div class="ai-category-results ai-stagger-container">';

    // Recommended category first
    if (recommended) {
      html +=
        '<div class="ai-category-item ai-recommended ai-stagger-item" style="animation-delay: 0.1s">' +
        '<div class="ai-category-info">' +
        '<span class="ai-recommended-badge">â­ Top Match</span>' +
        '<span class="ai-category-name">' +
        recommended.name +
        "</span>" +
        "</div>" +
        '<button type="button" class="btn btn-sm btn-ai-use btn-use-category" data-category="' +
        recommended.id +
        '">Use</button>' +
        "</div>";
    }

    // Other categories with staggered animation
    for (var i = 0; i < displayOthers.length; i++) {
      var cat = displayOthers[i];
      var delay = (i + 2) * 0.12;
      html +=
        '<div class="ai-category-item ai-stagger-item" style="animation-delay: ' +
        delay +
        's">' +
        '<div class="ai-category-info">' +
        '<span class="ai-category-name">' +
        cat.name +
        "</span>" +
        "</div>" +
        '<button type="button" class="btn btn-sm btn-ai-use btn-use-category" data-category="' +
        cat.id +
        '">Use</button>' +
        "</div>";
    }
    html += "</div>";
  }

  html += "</div>";

  mainContent.innerHTML = html;

  // Bind back button
  var backBtn = document.getElementById("btn-ai-search-again");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      self.showDeepSearchAreas();
    });
  }

  // Bind use buttons
  var useBtns = mainContent.querySelectorAll(".btn-use-category");
  for (var j = 0; j < useBtns.length; j++) {
    useBtns[j].addEventListener("click", function () {
      var cat = this.getAttribute("data-category");
      ERM.components.closeSecondaryModal(function() {
        self.applyToField("risk-category", cat);
      });
    });
  }
};

/**
 * Show more categories for current area (reshuffled)
 */
ERM.riskAI.showMoreAreaCategories = function () {
  var self = this;
  if (!this.areaCategoriesAll) return;

  // Get unshown categories
  var shown = this.areaCategoriesShown || [];
  var all = this.areaCategoriesAll;
  var remaining = [];

  for (var i = 0; i < all.length; i++) {
    var wasShown = false;
    for (var j = 0; j < shown.length; j++) {
      if (all[i].id === shown[j].id) {
        wasShown = true;
        break;
      }
    }
    if (!wasShown) {
      remaining.push(all[i]);
    }
  }

  // If no remaining, reshuffle all
  if (remaining.length === 0) {
    remaining = this.shuffleArray(all);
  } else {
    remaining = this.shuffleArray(remaining);
  }

  // Update shown and redisplay
  var recommended = remaining[0];
  var displayOthers = remaining.slice(1, 5);
  this.areaCategoriesShown = [recommended].concat(displayOthers);

  this.displayAreaCategories(this.currentAreaDeptId, this.currentAreaName);
};

/**
 * Show more category suggestions with thinking animation
 * Uses DeepSeek AI for new suggestions
 */
ERM.riskAI.showMoreCategorySuggestions = function () {
  var self = this;

  // Get current title
  var titleEl = document.getElementById("risk-title");
  var title = titleEl ? titleEl.value.trim() : "";

  if (!title) {
    ERM.toast.warning("Please enter a risk title first");
    return;
  }

  this.showMoreThinking(function () {
    // Call DeepSeek for more suggestions
    if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.getSuggestions) {
      var context = ERM.riskAI.deepSeek.getFormContext();
      context.title = title;

      ERM.riskAI.deepSeek.getSuggestions("category", context, function(error, result) {
        if (error || !result || !result.suggestions || result.suggestions.length === 0) {
          console.log("[Category] Generate more failed:", error);
          ERM.toast.info("No additional suggestions available");
          return;
        }
        self._renderCategorySuggestions(result.suggestions, result.recommended || 0);
      });
    } else {
      self._renderMoreCategories();
    }
  });
};

/**
 * Render more categories after thinking
 */
ERM.riskAI._renderMoreCategories = function () {
  var self = this;

  // Get unshown suggestions
  var shown = this.shownCategorySuggestions || [];
  var all = this.allCategorySuggestions;
  var remaining = [];

  for (var i = 0; i < all.length; i++) {
    var isShown = false;
    var allId = all[i].category.id || all[i].category.value;
    for (var j = 0; j < shown.length; j++) {
      var shownId = shown[j].category.id || shown[j].category.value;
      if (allId === shownId) {
        isShown = true;
        break;
      }
    }
    if (!isShown) {
      remaining.push(all[i]);
    }
  }

  // If no remaining, reshuffle all
  if (remaining.length === 0) {
    remaining = this.shuffleArray(all);
  } else {
    remaining = this.shuffleArray(remaining);
  }

  // Take 3 for display
  var recommended = remaining[0];
  var displayOthers = remaining.slice(1, 3);
  this.shownCategorySuggestions = [recommended].concat(displayOthers);

  // Update modal content
  var listContainer = document.getElementById("ai-category-results");
  if (!listContainer) return;

  var html = "";

  // Recommended category first
  var recName = recommended.category.name || recommended.category.label;
  var recId = recommended.category.id || recommended.category.value;
  html +=
    '<div class="ai-category-item ai-recommended ai-stagger-item" style="animation-delay: 0.1s">' +
    '<div class="ai-category-info">' +
    '<span class="ai-recommended-badge">Recommended</span>' +
    '<span class="ai-category-name">' +
    recName +
    "</span>" +
    "</div>" +
    '<button type="button" class="btn btn-sm btn-ai-use btn-use-category" data-category="' +
    recId +
    '">Use</button>' +
    "</div>";

  // Other suggestions with stagger
  for (var k = 0; k < displayOthers.length; k++) {
    var result = displayOthers[k];
    var catId = result.category.id || result.category.value;
    var catName = result.category.name || result.category.label;
    var delay = (k + 2) * 0.12;
    html +=
      '<div class="ai-category-item ai-stagger-item" style="animation-delay: ' +
      delay +
      's">' +
      '<div class="ai-category-info">' +
      '<span class="ai-category-name">' +
      catName +
      "</span>" +
      "</div>" +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use-category" data-category="' +
      catId +
      '">Use</button>' +
      "</div>";
  }

  listContainer.innerHTML = html;

  // Rebind use buttons
  var btns = listContainer.querySelectorAll(".btn-use-category");
  for (var m = 0; m < btns.length; m++) {
    btns[m].addEventListener("click", function () {
      var cat = this.getAttribute("data-category");
      ERM.components.closeSecondaryModal(function() {
        self.applyToField("risk-category", cat);
      });
    });
  }
};

/**
 * Show more category results
 */
ERM.riskAI.showMoreCategories = function () {
  var self = this;
  var container = document.getElementById("ai-category-results");
  var btn = document.getElementById("btn-show-more-categories");
  if (!container || !this.categorySearchResults) return;

  var results = this.categorySearchResults;
  var shown = this.categoryResultsShown;
  var nextBatch = Math.min(shown + 6, results.length);

  // Add next batch
  for (var i = shown; i < nextBatch; i++) {
    var result = results[i];
    var catId = result.category.id || result.category.value;
    var catName = result.category.name || result.category.label;

    var item = document.createElement("div");
    item.className = "ai-category-item";
    item.innerHTML =
      '<div class="ai-category-info">' +
      '<span class="ai-category-name">' +
      catName +
      "</span>" +
      "</div>" +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use-category" data-category="' +
      catId +
      '">Use</button>';

    container.appendChild(item);

    // Bind click handler
    var useBtn = item.querySelector(".btn-use-category");
    useBtn.addEventListener("click", function () {
      var cat = this.getAttribute("data-category");
      ERM.components.closeSecondaryModal(function() {
        self.applyToField("risk-category", cat);
      });
    });
  }

  this.categoryResultsShown = nextBatch;

  // Update or hide button
  if (nextBatch >= results.length) {
    if (btn) btn.style.display = "none";
  } else {
    if (btn)
      btn.textContent =
        "Show more (" + (results.length - nextBatch) + " remaining)";
  }
};

/* Legacy stub functions REMOVED - never called:
   showCategoryResultsInModal, showCategoryResultsModal */

/**
 * Bind category suggestion modal events
 */
ERM.riskAI.bindCategorySuggestionEvents = function () {
  var self = this;

  // Use buttons (AI recommended)
  var useBtns = document.querySelectorAll(".btn-use-category");
  for (var i = 0; i < useBtns.length; i++) {
    useBtns[i].addEventListener("click", function () {
      var cat = this.getAttribute("data-category");
      ERM.components.closeSecondaryModal(function() {
        self.applyToField("risk-category", cat);
      });
    });
  }

  // Generic category buttons
  var genericBtns = document.querySelectorAll(".btn-generic-category");
  for (var j = 0; j < genericBtns.length; j++) {
    genericBtns[j].addEventListener("click", function () {
      var cat = this.getAttribute("data-category");
      ERM.components.closeSecondaryModal(function() {
        self.applyToField("risk-category", cat);
      });
    });
  }

  // Generate More button
  var discoverMoreBtn = document.getElementById("btn-discover-more-categories");
  if (discoverMoreBtn) {
    discoverMoreBtn.addEventListener("click", function () {
      self.showMoreCategorySuggestions();
    });
  }

  // Legacy: Show more button (for area results)
  var showMoreBtn = document.getElementById("btn-show-more-categories");
  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", function () {
      self.showMoreCategories();
    });
  }

  // Legacy: AI Deep Search button
  var deepSearchBtn = document.getElementById("btn-ai-deep-search");
  if (deepSearchBtn) {
    deepSearchBtn.addEventListener("click", function () {
      self.showAIDeepSearch();
    });
  }
};

/**
 * Search categories and update results with thinking animation
 */
ERM.riskAI.searchAndShowCategories = function (searchTerm) {
  var self = this;

  if (!searchTerm || searchTerm.length < 2) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.warning("Please enter at least 2 characters");
    }
    return;
  }

  var resultsContainer = document.querySelector(".ai-category-results");
  if (!resultsContainer) return;

  // Show thinking state
  resultsContainer.innerHTML =
    '<div class="ai-searching">' +
    '<div class="ai-thinking-spinner-small"></div>' +
    "<span>Searching categories...</span>" +
    "</div>";

  // Search after delay (feels like AI thinking)
  setTimeout(function () {
    var results = ERM.riskRegister.searchCategories(searchTerm);

    if (results.length === 0) {
      resultsContainer.innerHTML =
        '<p class="text-muted">No categories found for "' +
        ERM.utils.escapeHtml(searchTerm) +
        '"</p>';
      return;
    }

    var html = "";
    var maxResults = Math.min(results.length, 10);

    for (var i = 0; i < maxResults; i++) {
      var result = results[i];
      var catId = result.category.id || result.category.value;
      var catName = result.category.name || result.category.label;
      var deptLabel = result.departmentId
        ? result.departmentId.replace(/-/g, " ").replace(/\b\w/g, function (l) {
            return l.toUpperCase();
          })
        : "";

      html +=
        '<div class="ai-category-item">' +
        '<div class="ai-category-info">' +
        '<span class="ai-category-name">' +
        catName +
        "</span>" +
        (deptLabel
          ? '<span class="ai-category-dept">' + deptLabel + "</span>"
          : "") +
        "</div>" +
        '<button type="button" class="btn btn-sm btn-primary btn-use-category" data-category="' +
        catId +
        '">Use</button>' +
        "</div>";
    }

    if (results.length > 10) {
      html +=
        '<p class="text-muted">Showing 10 of ' +
        results.length +
        " results</p>";
    }

    resultsContainer.innerHTML = html;

    // Rebind events for new buttons
    var useBtns = resultsContainer.querySelectorAll(".btn-use-category");
    for (var j = 0; j < useBtns.length; j++) {
      useBtns[j].addEventListener("click", function () {
        var cat = this.getAttribute("data-category");
        ERM.components.closeSecondaryModal(function() {
          self.applyToField("risk-category", cat);
        });
      });
    }
  }, 500);
};

/**
 * Get category confidence score
 */
ERM.riskAI.getCategoryConfidence = function (title, category) {
  var t = title.toLowerCase();
  var matches = 0;
  var keywords = {
    technology: [
      "cyber",
      "data",
      "system",
      "IT",
      "hack",
      "breach",
      "software",
      "network",
      "ransomware",
      "malware",
    ],
    compliance: [
      "compliance",
      "regulatory",
      "legal",
      "audit",
      "policy",
      "POPIA",
      "GDPR",
      "license",
      "permit",
    ],
    financial: [
      "financial",
      "credit",
      "liquidity",
      "currency",
      "investment",
      "budget",
      "fraud",
      "cash flow",
    ],
    operational: [
      "operational",
      "process",
      "supply",
      "vendor",
      "disruption",
      "failure",
      "service",
    ],
    strategic: [
      "strategy",
      "market",
      "competitive",
      "merger",
      "acquisition",
      "brand",
    ],
    reputational: [
      "reputation",
      "media",
      "public",
      "brand",
      "customer",
      "stakeholder",
    ],
    "health-safety": [
      "safety",
      "health",
      "injury",
      "accident",
      "fire",
      "emergency",
    ],
    environmental: [
      "environmental",
      "pollution",
      "waste",
      "climate",
      "emission",
      "carbon",
    ],
  };

  var catKeywords = keywords[category] || [];
  for (var i = 0; i < catKeywords.length; i++) {
    if (t.indexOf(catKeywords[i].toLowerCase()) !== -1) {
      matches++;
    }
  }

  if (matches >= 3) return 95;
  if (matches >= 2) return 85;
  if (matches >= 1) return 70;
  return 50;
};

/**
 * Show causes suggestions - DeepSeek powered
 */
ERM.riskAI.showCausesSuggestions = function (title, category) {
  var self = this;

  if (!title && !category) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.warning("Please enter a risk title or select a category first");
    }
    return;
  }

  // Check if DeepSeek module is available
  if (!ERM.riskAI.deepSeek || typeof ERM.riskAI.deepSeek.getSuggestions !== "function") {
    console.log("[Root Causes] DeepSeek not available, using template fallback");
    self.clearThinkingButton();
    var allCauses = self.getCausesSuggestions(title, category);
    if (!allCauses || allCauses.length === 0) {
      self.showNoTemplateMatch("root causes");
      return;
    }
    self._renderCausesSuggestionsModal(allCauses, 0, title, category);
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.riskAI.deepSeek.getFormContext();
  if (!context.title && title) {
    context.title = title;
  }
  if (!context.category && category) {
    context.category = category;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.riskAI.deepSeek.getSuggestions("causes", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      // Fallback to template-based suggestions
      console.log("[Root Causes] DeepSeek failed, using template fallback");
      var allCauses = self.getCausesSuggestions(title, category);
      if (!allCauses || allCauses.length === 0) {
        self.showNoTemplateMatch("root causes");
        return;
      }
      // Show results directly
      self._renderCausesSuggestionsModal(allCauses, 0, title, category);
    } else {
      // Show DeepSeek suggestions directly
      self._renderCausesSuggestionsModal(result.suggestions, result.recommended, title, category);
    }
  });
};

/**
 * Render causes suggestions modal (shared by DeepSeek and fallback)
 */
ERM.riskAI._renderCausesSuggestionsModal = function(allCauses, recommendedIndex, title, category) {
  var self = this;

  // Build suggestions array with recommended flag (max 3 per spec)
  var suggestions = [];
  for (var i = 0; i < Math.min(allCauses.length, 3); i++) {
    suggestions.push({
      text: allCauses[i],
      recommended: i === recommendedIndex
    });
  }

  ERM.components.showAISuggestionModal({
    title: "Root Cause Analysis",
    fieldName: "Root Causes",
    suggestions: suggestions,
    multiSelect: true,
    onMultiSelect: function(selectedTexts) {
      var added = 0;
      for (var j = 0; j < selectedTexts.length; j++) {
        if (typeof ERM.riskRegister !== "undefined" && ERM.riskRegister.addListItem) {
          ERM.riskRegister.addListItem("rootCauses", selectedTexts[j]);
          added++;
        }
      }
      if (added > 0) {
        if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
          ERM.riskAI.deepSeek.onSuggestionUsed();
        }
        if (typeof ERM.toast !== "undefined") {
          ERM.toast.success(added + " root cause(s) added");
        }
      }
    }
  });
};

/**
 * Show more causes (reshuffled)
 */
ERM.riskAI.showMoreCausesSuggestions = function (title, category) {
  var self = this;
  if (!this.allCausesSuggestions) return;

  this.showMoreThinking(function () {
    self._renderMoreCauses();
  });
};

/**
 * Render more causes after thinking
 */
ERM.riskAI._renderMoreCauses = function () {
  var self = this;

  var shown = this.shownCausesSuggestions || [];
  var all = this.allCausesSuggestions;
  var remaining = [];

  for (var i = 0; i < all.length; i++) {
    if (shown.indexOf(all[i]) === -1) {
      remaining.push(all[i]);
    }
  }

  if (remaining.length === 0) {
    remaining = this.shuffleArray(all);
    this.shownCausesSuggestions = []; // Reset shown
  } else {
    remaining = this.shuffleArray(remaining);
  }

  // Take 3 for display
  var recommended = remaining[0];
  var displayOthers = remaining.slice(1, 3);
  var displayItems = [recommended].concat(displayOthers);
  this.shownCausesSuggestions = (this.shownCausesSuggestions || []).concat(
    displayItems
  );

  var listContainer = document.querySelector(".ai-suggestions-list");
  if (!listContainer) return;

  var html = "";

  // Recommended first
  html +=
    '<div class="ai-suggestion-item ai-recommended ai-stagger-item" style="animation-delay: 0.1s">' +
    '<input type="checkbox" class="cause-checkbox" id="cause-more-0" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '" checked>' +
    '<label for="cause-more-0" class="ai-suggestion-content">' +
    '<span class="ai-recommended-badge">â­ Most Likely</span>' +
    '<span class="ai-suggestion-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</span>" +
    "</label>" +
    "</div>";

  // Others with stagger
  for (var j = 0; j < displayOthers.length; j++) {
    var delay = (j + 2) * 0.1;
    html +=
      '<div class="ai-suggestion-item ai-stagger-item" style="animation-delay: ' +
      delay +
      's">' +
      '<input type="checkbox" class="cause-checkbox" id="cause-more-' +
      (j + 1) +
      '" data-value="' +
      ERM.utils.escapeHtml(displayOthers[j]) +
      '">' +
      '<label for="cause-more-' +
      (j + 1) +
      '" class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(displayOthers[j]) +
      "</label>" +
      "</div>";
  }

  listContainer.innerHTML = html;
};

/**
 * Get causes suggestions by category
 */
ERM.riskAI.getCausesSuggestions = function (title, category) {
  // Get causes from industry templates
  return this.getTemplateData("rootCauses", title, category);
};

/**
 * Show consequences suggestions - DeepSeek powered
 */
ERM.riskAI.showConsequencesSuggestions = function (title, category) {
  var self = this;

  if (!title && !category) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.warning("Please enter a risk title or select a category first");
    }
    return;
  }

  // Check if DeepSeek module is available
  if (!ERM.riskAI.deepSeek || typeof ERM.riskAI.deepSeek.getSuggestions !== "function") {
    console.log("[Consequences] DeepSeek not available, using template fallback");
    self.clearThinkingButton();
    var allConsequences = self.getConsequencesSuggestions(title, category);
    if (!allConsequences || allConsequences.length === 0) {
      self.showNoTemplateMatch("consequences");
      return;
    }
    self._renderConsequencesSuggestionsModal(allConsequences, 0, title, category);
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.riskAI.deepSeek.getFormContext();
  if (!context.title && title) {
    context.title = title;
  }
  if (!context.category && category) {
    context.category = category;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.riskAI.deepSeek.getSuggestions("consequences", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      // Fallback to template-based suggestions
      console.log("[Consequences] DeepSeek failed, using template fallback");
      var allConsequences = self.getConsequencesSuggestions(title, category);
      if (!allConsequences || allConsequences.length === 0) {
        self.showNoTemplateMatch("consequences");
        return;
      }
      // Show results directly
      self._renderConsequencesSuggestionsModal(allConsequences, 0, title, category);
    } else {
      // Show DeepSeek suggestions directly
      self._renderConsequencesSuggestionsModal(result.suggestions, result.recommended, title, category);
    }
  });
};

/**
 * Render consequences suggestions modal (shared by DeepSeek and fallback)
 */
ERM.riskAI._renderConsequencesSuggestionsModal = function(allConsequences, recommendedIndex, title, category) {
  var self = this;

  // Build suggestions array with recommended flag (max 3 per spec)
  var suggestions = [];
  for (var i = 0; i < Math.min(allConsequences.length, 3); i++) {
    suggestions.push({
      text: allConsequences[i],
      recommended: i === recommendedIndex
    });
  }

  ERM.components.showAISuggestionModal({
    title: "Impact Analysis",
    fieldName: "Consequences",
    suggestions: suggestions,
    multiSelect: true,
    onMultiSelect: function(selectedTexts) {
      var added = 0;
      for (var j = 0; j < selectedTexts.length; j++) {
        if (typeof ERM.riskRegister !== "undefined" && ERM.riskRegister.addListItem) {
          ERM.riskRegister.addListItem("consequences", selectedTexts[j]);
          added++;
        }
      }
      if (added > 0) {
        if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
          ERM.riskAI.deepSeek.onSuggestionUsed();
        }
        if (typeof ERM.toast !== "undefined") {
          ERM.toast.success(added + " consequence(s) added");
        }
      }
    }
  });
};

/**
 * Show more consequences (reshuffled) with thinking
 */
ERM.riskAI.showMoreConsequencesSuggestions = function (title, category) {
  var self = this;
  if (!this.allConsequencesSuggestions) return;

  this.showMoreThinking(function () {
    self._renderMoreConsequences();
  });
};

/**
 * Render more consequences after thinking
 */
ERM.riskAI._renderMoreConsequences = function () {
  var self = this;

  var shown = this.shownConsequencesSuggestions || [];
  var all = this.allConsequencesSuggestions;
  var remaining = [];

  for (var i = 0; i < all.length; i++) {
    if (shown.indexOf(all[i]) === -1) {
      remaining.push(all[i]);
    }
  }

  if (remaining.length === 0) {
    remaining = this.shuffleArray(all);
    this.shownConsequencesSuggestions = [];
  } else {
    remaining = this.shuffleArray(remaining);
  }

  // Take 3 for display
  var recommended = remaining[0];
  var displayOthers = remaining.slice(1, 3);
  var displayItems = [recommended].concat(displayOthers);
  this.shownConsequencesSuggestions = (
    this.shownConsequencesSuggestions || []
  ).concat(displayItems);

  var listContainer = document.querySelector(".ai-suggestions-list");
  if (!listContainer) return;

  var html = "";

  // Recommended first
  html +=
    '<div class="ai-suggestion-item ai-recommended ai-stagger-item" style="animation-delay: 0.1s">' +
    '<input type="checkbox" class="consequence-checkbox" id="consequence-more-0" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '" checked>' +
    '<label for="consequence-more-0" class="ai-suggestion-content">' +
    '<span class="ai-recommended-badge">â­ Highest Impact</span>' +
    '<span class="ai-suggestion-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</span>" +
    "</label>" +
    "</div>";

  // Others with stagger
  for (var j = 0; j < displayOthers.length; j++) {
    var delay = (j + 2) * 0.1;
    html +=
      '<div class="ai-suggestion-item ai-stagger-item" style="animation-delay: ' +
      delay +
      's">' +
      '<input type="checkbox" class="consequence-checkbox" id="consequence-more-' +
      (j + 1) +
      '" data-value="' +
      ERM.utils.escapeHtml(displayOthers[j]) +
      '">' +
      '<label for="consequence-more-' +
      (j + 1) +
      '" class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(displayOthers[j]) +
      "</label>" +
      "</div>";
  }

  listContainer.innerHTML = html;
};

/**
 * Get consequences suggestions by category
 */
ERM.riskAI.getConsequencesSuggestions = function (title, category) {
  // Get consequences from industry templates
  return this.getTemplateData("consequences", title, category);
};

/**
 * Show description suggestions - DeepSeek powered
 */
ERM.riskAI.showDescriptionSuggestions = function (title, category) {
  var self = this;

  if (!title) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.warning("Please enter a risk title first");
    }
    return;
  }

  // Check if DeepSeek module is available
  if (!ERM.riskAI.deepSeek || typeof ERM.riskAI.deepSeek.getSuggestions !== "function") {
    console.log("[Description] DeepSeek not available, using template fallback");
    self.clearThinkingButton();
    var matchedTemplate = self.findMatchingTemplate(title, category);
    if (!matchedTemplate || !matchedTemplate.descriptions || matchedTemplate.descriptions.length === 0) {
      self.showNoTemplateMatch("description");
      return;
    }
    self._renderDescriptionSuggestionsModal(matchedTemplate.descriptions, 0);
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.riskAI.deepSeek.getFormContext();
  if (!context.title && title) {
    context.title = title;
  }
  if (!context.category && category) {
    context.category = category;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.riskAI.deepSeek.getSuggestions("description", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      // Fallback to template-based suggestions
      console.log("[Description] DeepSeek failed, using template fallback");
      var matchedTemplate = self.findMatchingTemplate(title, category);
      if (!matchedTemplate || !matchedTemplate.descriptions || matchedTemplate.descriptions.length === 0) {
        self.showNoTemplateMatch("description");
        return;
      }
      // Show results directly
      self._renderDescriptionSuggestionsModal(matchedTemplate.descriptions, 0);
    } else {
      // Show DeepSeek suggestions directly
      self._renderDescriptionSuggestionsModal(result.suggestions, result.recommended);
    }
  });
};

/**
 * Render description suggestions modal (shared by DeepSeek and fallback)
 */
ERM.riskAI._renderDescriptionSuggestionsModal = function(allDescriptions, recommendedIndex) {
  var self = this;

  // Build suggestions array with recommended flag (max 3 per spec)
  var suggestions = [];
  for (var i = 0; i < Math.min(allDescriptions.length, 3); i++) {
    suggestions.push({
      text: allDescriptions[i],
      recommended: i === recommendedIndex
    });
  }

  ERM.components.showAISuggestionModal({
    title: "Description Suggestions",
    fieldName: "Risk Description",
    suggestions: suggestions,
    onSelect: function(selectedText) {
      self.applyToField("risk-description", selectedText);
      if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
        ERM.riskAI.deepSeek.onSuggestionUsed();
      }
    }
  });
};

/**
 * Show more description suggestions with thinking
 */
ERM.riskAI.showMoreDescriptionSuggestions = function () {
  var self = this;
  if (!this.allDescriptionSuggestions) return;

  this.showMoreThinking(function () {
    self._renderMoreDescriptions();
  });
};

/**
 * Render more descriptions after thinking
 */
ERM.riskAI._renderMoreDescriptions = function () {
  var self = this;

  var shown = this.shownDescriptionSuggestions || [];
  var all = this.allDescriptionSuggestions;
  var remaining = [];

  for (var i = 0; i < all.length; i++) {
    if (shown.indexOf(all[i]) === -1) {
      remaining.push(all[i]);
    }
  }

  if (remaining.length === 0) {
    remaining = this.shuffleArray(all);
    this.shownDescriptionSuggestions = [];
  } else {
    remaining = this.shuffleArray(remaining);
  }

  // Take 2 for display
  var recommended = remaining[0];
  var displayOthers = remaining.slice(1, 2);
  var displayItems = [recommended].concat(displayOthers);
  this.shownDescriptionSuggestions = (
    this.shownDescriptionSuggestions || []
  ).concat(displayItems);

  var listContainer = document.querySelector(".ai-suggestions-list");
  if (!listContainer) return;

  var html = "";

  // Recommended first
  html +=
    '<div class="ai-suggestion-item ai-recommended ai-stagger-item" style="animation-delay: 0.1s">' +
    '<div class="ai-suggestion-content">' +
    '<span class="ai-recommended-badge">Recommended</span>' +
    '<div class="ai-description-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</div>" +
    "</div>" +
    '<button type="button" class="btn btn-sm btn-ai-use btn-use" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '">Use</button>' +
    "</div>";

  // Others with stagger
  for (var j = 0; j < displayOthers.length; j++) {
    var delay = (j + 2) * 0.12;
    html +=
      '<div class="ai-suggestion-item ai-stagger-item" style="animation-delay: ' +
      delay +
      's">' +
      '<div class="ai-description-text">' +
      ERM.utils.escapeHtml(displayOthers[j]) +
      "</div>" +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use" data-value="' +
      ERM.utils.escapeHtml(displayOthers[j]) +
      '">Use</button>' +
      "</div>";
  }

  listContainer.innerHTML = html;

  // Rebind use buttons
  var btns = listContainer.querySelectorAll(".btn-use");
  for (var k = 0; k < btns.length; k++) {
    btns[k].addEventListener("click", function () {
      var value = this.getAttribute("data-value");
      ERM.components.closeSecondaryModal(function() {
        ERM.riskAI.applyToField("risk-description", value);
      });
    });
  }
};

/**
 * Show owner suggestions - DeepSeek powered
 */
ERM.riskAI.showOwnerSuggestions = function (category) {
  var self = this;

  // Get title from form for template matching
  var titleEl = document.getElementById("risk-title");
  var title = titleEl ? titleEl.value : "";

  if (!title && !category) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.warning("Please enter a risk title or select a category first");
    }
    return;
  }

  // Check if DeepSeek module is available
  if (!ERM.riskAI.deepSeek || typeof ERM.riskAI.deepSeek.getSuggestions !== "function") {
    console.log("[Risk Owner] DeepSeek not available, using template fallback");
    self.clearThinkingButton();
    var allOwners = self.getTemplateData("riskOwner", title, category);
    if (!allOwners || allOwners.length === 0) {
      self.showNoTemplateMatch("risk owners");
      return;
    }
    self._renderOwnerSuggestionsModal(allOwners, 0, "risk-owner");
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.riskAI.deepSeek.getFormContext();
  if (!context.title && title) {
    context.title = title;
  }
  if (!context.category && category) {
    context.category = category;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.riskAI.deepSeek.getSuggestions("riskOwner", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      // Fallback to template-based suggestions
      console.log("[Risk Owner] DeepSeek failed, using template fallback");
      var allOwners = self.getTemplateData("riskOwner", title, category);
      if (!allOwners || allOwners.length === 0) {
        self.showNoTemplateMatch("risk owners");
        return;
      }
      // Show results directly
      self._renderOwnerSuggestionsModal(allOwners, 0, "risk-owner");
    } else {
      // Show DeepSeek suggestions directly
      self._renderOwnerSuggestionsModal(result.suggestions, result.recommended, "risk-owner");
    }
  });
};

/**
 * Render owner suggestions modal (shared by DeepSeek and fallback)
 * Now supports object format with role and reason
 */
ERM.riskAI._renderOwnerSuggestionsModal = function(allOwners, recommendedIndex, fieldId) {
  var self = this;
  var isRiskOwner = fieldId === "risk-owner";
  var modalTitle = isRiskOwner ? "Risk Owner Suggestions" : "Action Owner Suggestions";

  // Build suggestions array with recommended flag (max 3 per spec)
  var suggestions = [];
  for (var i = 0; i < Math.min(allOwners.length, 3); i++) {
    var owner = allOwners[i];
    var role = typeof owner === "object" ? owner.role : owner;
    var reason = typeof owner === "object" ? owner.reason : null;
    suggestions.push({
      text: role,
      description: reason || "",
      recommended: i === recommendedIndex
    });
  }

  ERM.components.showAISuggestionModal({
    title: modalTitle,
    fieldName: isRiskOwner ? "Risk Owner" : "Action Owner",
    suggestions: suggestions,
    onSelect: function(selectedText) {
      self.applyToField(fieldId, selectedText);
      if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
        ERM.riskAI.deepSeek.onSuggestionUsed();
      }
    }
  });
};

/**
 * Show action owner suggestions - DeepSeek powered
 */
ERM.riskAI.showActionOwnerSuggestions = function (category) {
  var self = this;

  // Get title from form for template matching
  var titleEl = document.getElementById("risk-title");
  var title = titleEl ? titleEl.value : "";

  if (!title && !category) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.warning("Please enter a risk title or select a category first");
    }
    return;
  }

  // Check if DeepSeek module is available
  if (!ERM.riskAI.deepSeek || typeof ERM.riskAI.deepSeek.getSuggestions !== "function") {
    console.log("[Action Owner] DeepSeek not available, using template fallback");
    self.clearThinkingButton();
    var allOwners = self.getTemplateData("actionOwner", title, category);
    if (!allOwners || allOwners.length === 0) {
      self.showNoTemplateMatch("action owners");
      return;
    }
    self._renderOwnerSuggestionsModal(allOwners, 0, "risk-action-owner");
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.riskAI.deepSeek.getFormContext();
  if (!context.title && title) {
    context.title = title;
  }
  if (!context.category && category) {
    context.category = category;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.riskAI.deepSeek.getSuggestions("actionOwner", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      // Fallback to template-based suggestions
      console.log("[Action Owner] DeepSeek failed, using template fallback");
      var allOwners = self.getTemplateData("actionOwner", title, category);
      if (!allOwners || allOwners.length === 0) {
        self.showNoTemplateMatch("action owners");
        return;
      }
      // Show results directly
      self._renderOwnerSuggestionsModal(allOwners, 0, "risk-action-owner");
    } else {
      // Show DeepSeek suggestions directly
      self._renderOwnerSuggestionsModal(result.suggestions, result.recommended, "risk-action-owner");
    }
  });
};

/**
 * Show strategic objective suggestions
 */
ERM.riskAI.showStrategicObjectiveSuggestions = function (category) {
  var self = this;

  // Strategic objectives should come from organization settings, not templates
  // They are unique to each organization
  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">Strategic objectives are specific to your organization.</p>' +
    '<p class="text-muted">Define your strategic objectives in Settings > Organization to enable AI suggestions here.</p>' +
    '<div class="ai-suggestions-list">' +
    '<p class="text-muted" style="padding: 12px; text-align: center;">No objectives configured yet</p>' +
    "</div>" +
    "</div>";

  // Check if org objectives are defined
  if (typeof ERM.storage !== "undefined") {
    var workspace = ERM.storage.get("workspace");
    if (
      workspace &&
      workspace.strategicObjectives &&
      workspace.strategicObjectives.length > 0
    ) {
      var objectives = workspace.strategicObjectives;
      var suggestions = [];

      for (var i = 0; i < objectives.length; i++) {
        suggestions.push({
          text: objectives[i],
          recommended: i === 0
        });
      }

      ERM.components.showAISuggestionModal({
        title: "Strategic Objectives",
        fieldName: "Strategic Objective",
        suggestions: suggestions,
        onSelect: function(selectedText) {
          self.applyToField("risk-strategic-objective", selectedText);
        }
      });
      return;
    }
  }

  ERM.components.modalManager.openSecondary({
    title: self.icons.sparkles + " Strategic Objectives",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }]
  });
};

/**
 * Show treatment suggestions
 */
ERM.riskAI.showTreatmentSuggestions = function (title, category) {
  var self = this;

  // Check if DeepSeek module is available
  if (!ERM.riskAI.deepSeek || typeof ERM.riskAI.deepSeek.getSuggestions !== "function") {
    console.log("[Treatment] DeepSeek not available, using template fallback");
    this._showTreatmentFromTemplates();
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.riskAI.deepSeek.getFormContext();
  if (!context.title && title) {
    context.title = title;
  }
  if (!context.category && category) {
    context.category = category;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.riskAI.deepSeek.getSuggestions("treatment", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      console.log("[Treatment] DeepSeek failed, using template fallback");
      self._showTreatmentFromTemplates();
    } else {
      self._renderTreatmentDeepSeek(result.suggestions, result.recommended);
    }
  });
};

/**
 * Show treatment from templates (fallback)
 */
ERM.riskAI._showTreatmentFromTemplates = function() {
  var treatments = [
    { value: "Mitigate", reason: "Implement controls to reduce likelihood or impact (most common for medium-high risks)" },
    { value: "Accept", reason: "Accept the risk within appetite (for low risks or where cost exceeds benefit)" },
    { value: "Transfer", reason: "Transfer through insurance or contracts (for financial or liability risks)" },
    { value: "Avoid", reason: "Eliminate the risk by avoiding the activity (for extreme risks outside appetite)" }
  ];
  this._renderTreatmentDeepSeek(treatments, 0);
};

/**
 * Render treatment suggestions from DeepSeek (with reasons)
 */
ERM.riskAI._renderTreatmentDeepSeek = function(suggestions, recommendedIndex) {
  var self = this;
  var values = [];
  var modalSuggestions = [];

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var value = typeof sug === "object" ? sug.value : sug;
    var reason = typeof sug === "object" ? sug.reason : null;

    values.push(value);
    modalSuggestions.push({
      text: value,
      description: reason || "",
      recommended: i === recommendedIndex
    });
  }

  ERM.components.showAISuggestionModal({
    title: "AI Treatment Suggestions",
    fieldName: "Risk Treatment",
    suggestions: modalSuggestions,
    onSelect: function(selectedText, index) {
      var value = values[index] || selectedText;
      self.applyToField("risk-treatment", value);
      if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
        ERM.riskAI.deepSeek.onSuggestionUsed();
      }
    }
  });
};

/**
 * Show status suggestions - DeepSeek powered
 */
ERM.riskAI.showStatusSuggestions = function () {
  var self = this;

  // Check if DeepSeek module is available
  if (!ERM.riskAI.deepSeek || typeof ERM.riskAI.deepSeek.getSuggestions !== "function") {
    console.log("[Status] DeepSeek not available, using template fallback");
    this._showStatusFromTemplates();
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.riskAI.deepSeek.getFormContext();

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.riskAI.deepSeek.getSuggestions("status", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      console.log("[Status] DeepSeek failed, using template fallback");
      self._showStatusFromTemplates();
    } else {
      self._renderStatusDeepSeek(result.suggestions, result.recommended);
    }
  });
};

/**
 * Show status from templates (fallback)
 */
ERM.riskAI._showStatusFromTemplates = function() {
  var statuses = [
    { value: "Identified", reason: "Risk has been identified and documented" },
    { value: "Assessed", reason: "Risk has been analyzed and scored" },
    { value: "Treated", reason: "Controls are being implemented" },
    { value: "Monitoring", reason: "Risk is being actively monitored" }
  ];
  this._renderStatusDeepSeek(statuses, 0);
};

/**
 * Render status suggestions from DeepSeek (with reasons)
 */
ERM.riskAI._renderStatusDeepSeek = function(suggestions, recommendedIndex) {
  var self = this;
  var values = [];
  var modalSuggestions = [];

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var value = typeof sug === "object" ? sug.value : sug;
    var reason = typeof sug === "object" ? sug.reason : null;

    values.push(value);
    modalSuggestions.push({
      text: value,
      description: reason || "",
      recommended: i === recommendedIndex
    });
  }

  ERM.components.showAISuggestionModal({
    title: "AI Status Suggestions",
    fieldName: "Risk Status",
    suggestions: modalSuggestions,
    onSelect: function(selectedText, index) {
      var value = values[index] || selectedText;
      self.applyToField("risk-status", value);
      if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
        ERM.riskAI.deepSeek.onSuggestionUsed();
      }
    }
  });
};

/**
 * Show action plan suggestions - DeepSeek powered
 */
ERM.riskAI.showActionPlanSuggestions = function (title, category) {
  var self = this;

  if (!title && !category) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.warning("Please enter a risk title or select a category first");
    }
    return;
  }

  // Check if DeepSeek module is available
  if (!ERM.riskAI.deepSeek || typeof ERM.riskAI.deepSeek.getSuggestions !== "function") {
    console.log("[Action Plans] DeepSeek not available, using template fallback");
    self.clearThinkingButton();
    var allActions = self.getTemplateData("actionPlans", title, category);
    if (!allActions || allActions.length === 0) {
      self.showNoTemplateMatch("action plans");
      return;
    }
    self._renderActionPlanSuggestionsModal(allActions, 0, title, category);
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.riskAI.deepSeek.getFormContext();
  if (!context.title && title) {
    context.title = title;
  }
  if (!context.category && category) {
    context.category = category;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.riskAI.deepSeek.getSuggestions("actions", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      // Fallback to template-based suggestions
      console.log("[Action Plans] DeepSeek failed, using template fallback");
      var allActions = self.getTemplateData("actionPlans", title, category);
      if (!allActions || allActions.length === 0) {
        self.showNoTemplateMatch("action plans");
        return;
      }
      // Show results directly
      self._renderActionPlanSuggestionsModal(allActions, 0, title, category);
    } else {
      // Show DeepSeek suggestions directly
      self._renderActionPlanSuggestionsModal(result.suggestions, result.recommended, title, category);
    }
  });
};

/**
 * Render action plan suggestions modal (shared by DeepSeek and fallback)
 */
ERM.riskAI._renderActionPlanSuggestionsModal = function(allActions, recommendedIndex, title, category) {
  var self = this;

  // Build suggestions array with recommended flag (max 3 per spec)
  var suggestions = [];
  for (var i = 0; i < Math.min(allActions.length, 3); i++) {
    suggestions.push({
      text: allActions[i],
      recommended: i === recommendedIndex
    });
  }

  ERM.components.showAISuggestionModal({
    title: "Action Plan Generator",
    fieldName: "Action Items",
    suggestions: suggestions,
    multiSelect: true,
    onMultiSelect: function(selectedTexts) {
      var added = 0;
      for (var j = 0; j < selectedTexts.length; j++) {
        if (typeof ERM.riskRegister !== "undefined" && ERM.riskRegister.addListItem) {
          ERM.riskRegister.addListItem("actionPlan", selectedTexts[j]);
          added++;
        }
      }
      if (added > 0) {
        if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
          ERM.riskAI.deepSeek.onSuggestionUsed();
        }
        if (typeof ERM.toast !== "undefined") {
          ERM.toast.success(added + " action(s) added");
        }
      }
    }
  });
};

/**
 * Show review date suggestions
 */
ERM.riskAI.showReviewDateSuggestions = function (category) {
  var self = this;

  // Check if DeepSeek module is available
  if (!ERM.riskAI.deepSeek || typeof ERM.riskAI.deepSeek.getSuggestions !== "function") {
    console.log("[Review Date] DeepSeek not available, using template fallback");
    this._showReviewDateFromTemplates();
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.riskAI.deepSeek.getFormContext();
  if (!context.category && category) {
    context.category = category;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.riskAI.deepSeek.getSuggestions("reviewDate", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      console.log("[Review Date] DeepSeek failed, using template fallback");
      self._showReviewDateFromTemplates();
    } else {
      self._renderReviewDateDeepSeek(result.suggestions, result.recommended);
    }
  });
};

/**
 * Show review date from templates (fallback)
 */
ERM.riskAI._showReviewDateFromTemplates = function() {
  var today = new Date();
  var suggestions = [
    { date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], label: "1 Month", reason: "For high/critical risks requiring close monitoring" },
    { date: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], label: "3 Months", reason: "Standard quarterly review cycle" },
    { date: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], label: "6 Months", reason: "For medium risks with stable controls" },
    { date: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], label: "12 Months", reason: "Annual review for low risks" }
  ];
  this._renderReviewDateDeepSeek(suggestions, 0);
};

/**
 * Render review date suggestions from DeepSeek (with reasons)
 */
ERM.riskAI._renderReviewDateDeepSeek = function(suggestions, recommendedIndex) {
  var self = this;
  var values = [];
  var modalSuggestions = [];

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var dateValue = sug.date;
    var label = sug.label || "";
    var reason = sug.reason || "";
    var displayDate = dateValue;

    try {
      var d = new Date(dateValue + "T00:00:00");
      displayDate = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {}

    values.push(dateValue);
    modalSuggestions.push({
      text: label + " (" + displayDate + ")",
      description: reason,
      recommended: i === recommendedIndex
    });
  }

  ERM.components.showAISuggestionModal({
    title: "AI Review Date Suggestions",
    fieldName: "Review Date",
    suggestions: modalSuggestions,
    onSelect: function(selectedText, index) {
      var value = values[index];
      self.applyToField("risk-review-date", value);
      if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
        ERM.riskAI.deepSeek.onSuggestionUsed();
      }
    }
  });
};

/**
 * Show target date suggestions - DeepSeek powered
 */
ERM.riskAI.showTargetDateSuggestions = function (category) {
  var self = this;

  // Check if DeepSeek module is available
  if (!ERM.riskAI.deepSeek || typeof ERM.riskAI.deepSeek.getSuggestions !== "function") {
    console.log("[Target Date] DeepSeek not available, using template fallback");
    this._showTargetDateFromTemplates();
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.riskAI.deepSeek.getFormContext();
  if (!context.category && category) {
    context.category = category;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.riskAI.deepSeek.getSuggestions("targetDate", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      console.log("[Target Date] DeepSeek failed, using template fallback");
      self._showTargetDateFromTemplates();
    } else {
      self._renderTargetDateDeepSeek(result.suggestions, result.recommended);
    }
  });
};

/**
 * Show target date from templates (fallback)
 */
ERM.riskAI._showTargetDateFromTemplates = function() {
  var today = new Date();
  var suggestions = [
    { date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], label: "2 Weeks", reason: "For urgent actions requiring immediate attention" },
    { date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], label: "1 Month", reason: "For high priority treatment actions" },
    { date: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], label: "3 Months", reason: "Standard implementation timeline" },
    { date: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], label: "6 Months", reason: "For complex implementations" }
  ];
  this._renderTargetDateDeepSeek(suggestions, 0);
};

/**
 * Render target date suggestions from DeepSeek (with reasons)
 */
ERM.riskAI._renderTargetDateDeepSeek = function(suggestions, recommendedIndex) {
  var self = this;
  var values = [];
  var modalSuggestions = [];

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var dateValue = sug.date;
    var label = sug.label || "";
    var reason = sug.reason || "";
    var displayDate = dateValue;

    try {
      var d = new Date(dateValue + "T00:00:00");
      displayDate = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {}

    values.push(dateValue);
    modalSuggestions.push({
      text: label + " (" + displayDate + ")",
      description: reason,
      recommended: i === recommendedIndex
    });
  }

  ERM.components.showAISuggestionModal({
    title: "AI Target Date Suggestions",
    fieldName: "Target Date",
    suggestions: modalSuggestions,
    onSelect: function(selectedText, index) {
      var value = values[index];
      self.applyToField("risk-target-date", value);
      if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
        ERM.riskAI.deepSeek.onSuggestionUsed();
      }
    }
  });
};

/**
 * Show inherent score suggestions - DeepSeek powered
 */
ERM.riskAI.showInherentScoreSuggestions = function (
  title,
  category,
  fieldType
) {
  var self = this;

  if (!title && !category) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.warning("Please enter a risk title or select a category first");
    }
    return;
  }

  var isLikelihood = fieldType === "inherentLikelihood";
  var fieldLabel = isLikelihood ? "Likelihood" : "Impact";
  var fieldId = isLikelihood ? "inherent-likelihood" : "inherent-impact";
  var deepSeekFieldType = isLikelihood ? "inherentLikelihood" : "inherentImpact";

  // Check if DeepSeek module is available
  if (!ERM.riskAI.deepSeek || typeof ERM.riskAI.deepSeek.getSuggestions !== "function") {
    console.log("[Inherent Score] DeepSeek not available, using template fallback");
    this._showInherentScoreFromTemplates(title, category, fieldType);
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.riskAI.deepSeek.getFormContext();
  if (!context.title && title) {
    context.title = title;
  }
  if (!context.category && category) {
    context.category = category;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.riskAI.deepSeek.getSuggestions(deepSeekFieldType, context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      console.log("[Inherent Score] DeepSeek failed, using template fallback");
      self._showInherentScoreFromTemplates(title, category, fieldType);
    } else {
      self._renderInherentScoreDeepSeek(result.suggestions, result.recommended, fieldId, fieldLabel);
    }
  });
};

/**
 * Show inherent score from templates (fallback)
 */
ERM.riskAI._showInherentScoreFromTemplates = function(title, category, fieldType) {
  var isLikelihood = fieldType === "inherentLikelihood";
  var fieldLabel = isLikelihood ? "Likelihood" : "Impact";
  var fieldId = isLikelihood ? "inherent-likelihood" : "inherent-impact";
  var suggested = this.getSuggestedInherentScore(title, category, isLikelihood);

  // Create suggestions array based on template logic
  var suggestions = [];
  suggestions.push({ score: suggested, reason: "Recommended based on risk category and context" });

  // Add alternatives
  if (suggested > 1) {
    suggestions.push({ score: suggested - 1, reason: "Lower severity if controls are partially in place" });
  }
  if (suggested < 5) {
    suggestions.push({ score: suggested + 1, reason: "Higher severity for worst-case scenario" });
  }
  if (suggested !== 3) {
    suggestions.push({ score: 3, reason: "Moderate baseline for typical risks" });
  }

  this._renderInherentScoreDeepSeek(suggestions, 0, fieldId, fieldLabel);
};

/**
 * Render inherent score suggestions from DeepSeek (with reasons)
 */
ERM.riskAI._renderInherentScoreDeepSeek = function(suggestions, recommendedIndex, fieldId, fieldLabel) {
  var values = [];
  var modalSuggestions = [];

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var score = typeof sug === "object" ? sug.score : sug;
    var reason = typeof sug === "object" ? sug.reason : null;

    values.push(score);
    modalSuggestions.push({
      text: "Score: " + score,
      description: reason || "",
      recommended: i === recommendedIndex
    });
  }

  ERM.components.showAISuggestionModal({
    title: "AI Inherent " + fieldLabel + " Suggestions",
    fieldName: "Inherent " + fieldLabel,
    suggestions: modalSuggestions,
    onSelect: function(selectedText, index) {
      var value = values[index];
      var el = document.getElementById(fieldId);
      if (el) {
        el.value = value;
        el.classList.add("ai-filled");
        setTimeout(function() {
          el.classList.remove("ai-filled");
        }, 2000);
        var event = new Event("change", { bubbles: true });
        el.dispatchEvent(event);
      }
      if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
        ERM.riskAI.deepSeek.onSuggestionUsed();
      }
      if (typeof ERM.toast !== "undefined") {
        ERM.toast.success("Score applied");
      }
    }
  });
};

/**
 * Get suggested inherent score based on category (fallback logic)
 */
ERM.riskAI.getSuggestedInherentScore = function (
  title,
  category,
  isLikelihood
) {
  var t = (title || "").toLowerCase();

  // Category-based defaults
  var categoryScores = {
    technology: { likelihood: 4, impact: 4 },
    compliance: { likelihood: 3, impact: 4 },
    financial: { likelihood: 3, impact: 4 },
    operational: { likelihood: 3, impact: 3 },
    strategic: { likelihood: 3, impact: 4 },
    reputational: { likelihood: 3, impact: 4 },
    "health-safety": { likelihood: 3, impact: 5 },
    environmental: { likelihood: 3, impact: 4 },
  };

  var scores = categoryScores[category] || { likelihood: 3, impact: 3 };

  // Adjust based on keywords in title
  if (
    t.indexOf("cyber") !== -1 ||
    t.indexOf("breach") !== -1 ||
    t.indexOf("ransomware") !== -1
  ) {
    scores.likelihood = 4;
    scores.impact = 5;
  }
  if (t.indexOf("fatal") !== -1 || t.indexOf("death") !== -1) {
    scores.impact = 5;
  }
  if (t.indexOf("minor") !== -1 || t.indexOf("small") !== -1) {
    scores.impact = 2;
    scores.likelihood = 2;
  }

  return isLikelihood ? scores.likelihood : scores.impact;
};

/**
 * Show residual score suggestions - DeepSeek powered
 */
ERM.riskAI.showResidualScoreSuggestions = function (
  title,
  category,
  fieldType
) {
  var self = this;

  var isLikelihood = fieldType === "residualLikelihood";
  var fieldLabel = isLikelihood ? "Likelihood" : "Impact";
  var fieldId = isLikelihood ? "residual-likelihood" : "residual-impact";
  var deepSeekFieldType = isLikelihood ? "residualLikelihood" : "residualImpact";

  // Check if DeepSeek module is available
  if (!ERM.riskAI.deepSeek || typeof ERM.riskAI.deepSeek.getSuggestions !== "function") {
    console.log("[Residual Score] DeepSeek not available, using template fallback");
    this._showResidualScoreFromTemplates(title, category, fieldType);
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.riskAI.deepSeek.getFormContext();
  if (!context.title && title) {
    context.title = title;
  }
  if (!context.category && category) {
    context.category = category;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.riskAI.deepSeek.getSuggestions(deepSeekFieldType, context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      console.log("[Residual Score] DeepSeek failed, using template fallback");
      self._showResidualScoreFromTemplates(title, category, fieldType);
    } else {
      self._renderResidualScoreDeepSeek(result.suggestions, result.recommended, fieldId, fieldLabel);
    }
  });
};

/**
 * Show residual score from templates (fallback)
 */
ERM.riskAI._showResidualScoreFromTemplates = function(title, category, fieldType) {
  var isLikelihood = fieldType === "residualLikelihood";
  var fieldLabel = isLikelihood ? "Likelihood" : "Impact";
  var fieldId = isLikelihood ? "residual-likelihood" : "residual-impact";
  var inherentFieldId = isLikelihood ? "inherent-likelihood" : "inherent-impact";

  // Get inherent value
  var inherentEl = document.getElementById(inherentFieldId);
  var inherentValue = inherentEl ? parseInt(inherentEl.value, 10) : 3;

  // Suggested residual should be lower than inherent (controls reduce risk)
  var suggested = Math.max(1, inherentValue - 1);

  // Create suggestions array
  var suggestions = [];
  suggestions.push({ score: suggested, reason: "Recommended reduction assuming effective controls" });

  if (suggested > 1) {
    suggestions.push({ score: suggested - 1, reason: "Greater reduction with highly effective controls" });
  }
  if (suggested < inherentValue) {
    suggestions.push({ score: inherentValue, reason: "No reduction if controls are ineffective" });
  }
  if (suggested !== 2 && inherentValue > 2) {
    suggestions.push({ score: 2, reason: "Significant reduction for well-implemented controls" });
  }

  this._renderResidualScoreDeepSeek(suggestions, 0, fieldId, fieldLabel);
};

/**
 * Render residual score suggestions from DeepSeek (with reasons)
 */
ERM.riskAI._renderResidualScoreDeepSeek = function(suggestions, recommendedIndex, fieldId, fieldLabel) {
  var values = [];
  var modalSuggestions = [];

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var score = typeof sug === "object" ? sug.score : sug;
    var reason = typeof sug === "object" ? sug.reason : null;

    values.push(score);
    modalSuggestions.push({
      text: "Score: " + score,
      description: reason || "",
      recommended: i === recommendedIndex
    });
  }

  ERM.components.showAISuggestionModal({
    title: "AI Residual " + fieldLabel + " Suggestions",
    fieldName: "Residual " + fieldLabel,
    suggestions: modalSuggestions,
    onSelect: function(selectedText, index) {
      var value = values[index];
      var el = document.getElementById(fieldId);
      if (el) {
        el.value = value;
        el.classList.add("ai-filled");
        setTimeout(function() {
          el.classList.remove("ai-filled");
        }, 2000);
        var event = new Event("change", { bubbles: true });
        el.dispatchEvent(event);
      }
      if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
        ERM.riskAI.deepSeek.onSuggestionUsed();
      }
      if (typeof ERM.toast !== "undefined") {
        ERM.toast.success("Score applied");
      }
    }
  });
};

/**
 * Format category name
 */
ERM.riskAI.formatCategory = function (category) {
  // Use the main riskRegister formatCategory which checks templates
  if (ERM.riskRegister && ERM.riskRegister.formatCategory) {
    return ERM.riskRegister.formatCategory(category);
  }
  // Fallback
  return category;
};

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */


/**
 * Apply items to a list input field
 */
ERM.riskAI.applyListItems = function (fieldId, items) {
  var container = document.getElementById(fieldId);
  if (!container) return;

  // Find the items container
  var itemsContainer = container.querySelector(".list-input-items");
  if (!itemsContainer) return;

  // Clear existing items
  itemsContainer.innerHTML = "";

  // Add new items
  for (var i = 0; i < items.length; i++) {
    var itemHtml =
      '<div class="list-input-item">' +
      '<span class="list-input-text">' +
      items[i] +
      "</span>" +
      '<button type="button" class="list-input-remove" onclick="this.parentElement.remove()">Ã—</button>' +
      "</div>";
    itemsContainer.insertAdjacentHTML("beforeend", itemHtml);
  }
};

/**
 * Format date for input field (YYYY-MM-DD)
 */
ERM.riskAI.formatDateForInput = function (date) {
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, "0");
  var day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
};

/**
 * Show template-based treatment recommendations
 */
ERM.riskAI.showTemplateTreatmentSuggestions = function () {
  var self = this;

  // Get current form data
  var inherentLikelihood =
    parseInt(this.getFormValue("inherent-likelihood")) || 0;
  var inherentImpact = parseInt(this.getFormValue("inherent-impact")) || 0;
  var inherentScore = inherentLikelihood * inherentImpact;
  var residualLikelihood =
    parseInt(this.getFormValue("residual-likelihood")) || 0;
  var residualImpact = parseInt(this.getFormValue("residual-impact")) || 0;
  var residualScore = residualLikelihood * residualImpact;
  var category = this.getFormValue("risk-category");

  // Get template recommendation if available
  var templateTreatment = null;
  if (
    this.selectedTemplate &&
    this.selectedTemplate.riskData &&
    this.selectedTemplate.riskData.treatment
  ) {
    templateTreatment = this.selectedTemplate.riskData.treatment;
  }

  // Build treatment options with recommendations
  var treatments = [
    {
      id: "Mitigate",
      name: "Mitigate",
      desc: "Implement controls to reduce likelihood or impact",
      recommended: false,
      warning: null,
    },
    {
      id: "Transfer",
      name: "Transfer",
      desc: "Transfer risk via insurance, outsourcing, or contracts",
      recommended: false,
      warning: null,
    },
    {
      id: "Accept",
      name: "Accept",
      desc: "Accept the risk within tolerance levels",
      recommended: false,
      warning: null,
    },
    {
      id: "Avoid",
      name: "Avoid",
      desc: "Eliminate the activity causing the risk",
      recommended: false,
      warning: null,
    },
  ];

  // Determine recommendation
  var recommendedTreatment = "Mitigate"; // Default
  var reasoning = "";

  if (templateTreatment && templateTreatment.recommended) {
    // Use template recommendation
    recommendedTreatment =
      templateTreatment.recommended.charAt(0).toUpperCase() +
      templateTreatment.recommended.slice(1);
    reasoning = templateTreatment.reasoning || "";
  } else {
    // Logic-based recommendation
    if (inherentScore >= 15) {
      if (category === "Health & Safety" || category === "Environmental") {
        recommendedTreatment = "Mitigate";
        reasoning =
          "Critical safety/environmental risks require active controls";
      } else {
        recommendedTreatment = "Mitigate";
        reasoning =
          "High inherent score (" + inherentScore + ") requires risk reduction";
      }
    } else if (inherentScore >= 10) {
      recommendedTreatment = "Mitigate";
      reasoning = "Moderate-high risk - controls recommended";
    } else if (inherentScore < 5) {
      recommendedTreatment = "Accept";
      reasoning = "Low inherent score - may be acceptable within tolerance";
    }
  }

  // Mark recommended and add warnings
  for (var i = 0; i < treatments.length; i++) {
    if (treatments[i].id === recommendedTreatment) {
      treatments[i].recommended = true;
      treatments[i].reasoning = reasoning;
    }

    // Add warnings
    if (treatments[i].id === "Accept" && inherentScore >= 15) {
      treatments[i].warning =
        "Risk may be too high to accept without mitigation";
    }
    if (
      treatments[i].id === "Accept" &&
      (category === "Health & Safety" || category === "Compliance")
    ) {
      treatments[i].warning =
        "Safety and compliance risks typically require active controls";
    }
  }

  // Sort to put recommended first
  treatments.sort(function (a, b) {
    if (a.recommended) return -1;
    if (b.recommended) return 1;
    return 0;
  });

  // Build content
  var content =
    '<div class="ai-treatment-recommendation">' +
    '<div class="ai-treatment-context">' +
    "<strong>Based on:</strong> Inherent Score " +
    inherentScore +
    " | Category: " +
    (category || "Not set") +
    "</div>" +
    '<div class="ai-treatment-options">';

  for (var j = 0; j < treatments.length; j++) {
    var t = treatments[j];
    var optionClass = "ai-treatment-option";
    if (t.recommended) optionClass += " recommended";
    if (t.warning) optionClass += " not-recommended";

    content += '<div class="' + optionClass + '" data-value="' + t.id + '">';

    if (t.recommended) {
      content += '<div class="ai-treatment-badge">â­ RECOMMENDED</div>';
    }

    content +=
      '<div class="ai-treatment-header">' +
      '<span class="ai-treatment-name">' +
      t.name +
      "</span>" +
      '<button type="button" class="btn btn-sm btn-use">Use</button>' +
      "</div>" +
      '<p class="ai-treatment-reason">' +
      (t.recommended && t.reasoning ? t.reasoning : t.desc) +
      "</p>";

    if (t.warning) {
      content +=
        '<div class="ai-treatment-warning">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
        t.warning +
        "</div>";
    }

    content += "</div>";
  }

  content += "</div></div>";

  ERM.components.modalManager.openSecondary({
    title: self.icons.sparkles + " Treatment Analysis",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function () {
      var btns = document.querySelectorAll(".ai-treatment-option .btn-use");
      for (var k = 0; k < btns.length; k++) {
        btns[k].addEventListener("click", function (e) {
          e.stopPropagation();
          var value = this.closest(".ai-treatment-option").getAttribute(
            "data-value"
          );
          ERM.components.closeSecondaryModal(function() {
            self.applyToField("risk-treatment", value);
          });
        });
      }
    },
  });
};

window.ERM = ERM;
console.log("risk-register-ai-ui.js loaded successfully");


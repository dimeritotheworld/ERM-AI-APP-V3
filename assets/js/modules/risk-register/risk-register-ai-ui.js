/**
 * Dimeri ERM - Risk Register AI UI
 * User interface components for AI risk creation
 *
 * @version 1.0.0
 * ES5 Compatible
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
 * Priority: Current register → localStorage default → fallback
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
 * Check if templates are available for current industry
 */
ERM.riskAI.hasTemplates = function () {
  var industry = this.getCurrentIndustry();
  return (
    typeof ERM_TEMPLATES !== "undefined" &&
    ERM_TEMPLATES[industry] &&
    ERM_TEMPLATES[industry].risks
  );
};

/**
 * Get all risks from current industry templates
 */
ERM.riskAI.getAllTemplateRisks = function () {
  var industry = this.getCurrentIndustry();

  if (!this.hasTemplates()) {
    return [];
  }

  var allRisks = [];
  var risks = ERM_TEMPLATES[industry].risks;

  for (var catKey in risks) {
    if (!risks.hasOwnProperty(catKey)) continue;
    if (!Array.isArray(risks[catKey])) continue;

    for (var i = 0; i < risks[catKey].length; i++) {
      allRisks.push(risks[catKey][i]);
    }
  }

  return allRisks;
};

/**
 * Find best matching risk template based on title and/or category
 * Works for any industry - same algorithm, different data
 * Returns null if no strong match found (prevents irrelevant suggestions)
 */
ERM.riskAI.findMatchingTemplate = function (title, category) {
  if (!this.hasTemplates()) {
    return null;
  }

  var allRisks = this.getAllTemplateRisks();
  var bestMatch = null;
  var bestScore = 0;
  var bestMatchedTerms = 0;

  // Extract meaningful search terms from title
  var stopWords = [
    "the",
    "a",
    "an",
    "of",
    "to",
    "in",
    "for",
    "on",
    "with",
    "at",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "shall",
    "can",
    "need",
    "and",
    "but",
    "or",
    "nor",
    "so",
    "yet",
    "not",
    "only",
    "very",
    "just",
    "also",
    "now",
    "risk",
    "risks",
    "about",
    "that",
    "this",
    "poor",
    "bad",
    "good",
  ];

  var searchTerms = (title || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(function (w) {
      return w.length >= 2 && stopWords.indexOf(w) === -1;
    });

  // If no meaningful search terms, return null
  if (searchTerms.length === 0 && !category) {
    return null;
  }

  // Normalize category for matching
  var normCategory = (category || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  for (var i = 0; i < allRisks.length; i++) {
    var risk = allRisks[i];
    var score = 0;
    var matchedTerms = 0;

    // Check relatedCategories
    if (risk.relatedCategories && normCategory) {
      for (var rc = 0; rc < risk.relatedCategories.length; rc++) {
        var relCat = risk.relatedCategories[rc]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        if (
          relCat === normCategory ||
          relCat.indexOf(normCategory) !== -1 ||
          normCategory.indexOf(relCat) !== -1
        ) {
          score += 15;
          break;
        }
      }
    }

    // For each search term
    for (var st = 0; st < searchTerms.length; st++) {
      var term = searchTerms[st];
      var isShortTerm = term.length <= 3;
      var termMatched = false;

      // Check ID parts
      if (risk.id) {
        var idParts = risk.id.toLowerCase().split("-");
        for (var ip = 0; ip < idParts.length; ip++) {
          if (isShortTerm) {
            if (idParts[ip] === term) {
              score += 10;
              termMatched = true;
            }
          } else {
            if (
              idParts[ip].indexOf(term) !== -1 ||
              term.indexOf(idParts[ip]) !== -1
            ) {
              score += 8;
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
              // Short term: exact word match only
              if (word === term) {
                score += 15;
                termMatched = true;
                break;
              }
            } else {
              // Longer term: allow partial matches
              if (word === term) {
                score += 15;
                termMatched = true;
                break;
              } else if (word.indexOf(term) === 0 || term.indexOf(word) === 0) {
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

      // Check titles - split into words
      if (risk.titles) {
        for (var t = 0; t < risk.titles.length; t++) {
          var titleWords = risk.titles[t].toLowerCase().split(/\s+/);
          for (var tw = 0; tw < titleWords.length; tw++) {
            var tWord = titleWords[tw];
            if (isShortTerm) {
              if (tWord === term) {
                score += 10;
                termMatched = true;
                break;
              }
            } else {
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

      // Check plainLanguage - split into words
      if (risk.plainLanguage) {
        for (var p = 0; p < risk.plainLanguage.length; p++) {
          var plWords = risk.plainLanguage[p].toLowerCase().split(/\s+/);
          for (var pw = 0; pw < plWords.length; pw++) {
            var pWord = plWords[pw];
            if (isShortTerm) {
              if (pWord === term) {
                score += 4;
                termMatched = true;
                break;
              }
            } else {
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

      if (termMatched) matchedTerms++;
    }

    // Multi-term bonus
    if (matchedTerms >= 2) {
      score += matchedTerms * 10;
    }

    if (
      score > bestScore ||
      (score === bestScore && matchedTerms > bestMatchedTerms)
    ) {
      bestScore = score;
      bestMatch = risk;
      bestMatchedTerms = matchedTerms;
    }
  }

  // Threshold based on search terms
  var minThreshold =
    searchTerms.length > 0 ? Math.max(8, searchTerms.length * 4) : 10;

  if (bestScore >= minThreshold) {
    return bestMatch;
  }

  return null;
};

/**
 * Universal getter for any template field
 * Works for: rootCauses, consequences, actionPlans, owners, timing, scoring, treatment, titles
 */
ERM.riskAI.getTemplateData = function (fieldType, title, category) {
  var template = this.findMatchingTemplate(title, category);

  if (!template) {
    return null;
  }

  switch (fieldType) {
    case "causes":
    case "rootCauses":
      return template.rootCauses || null;

    case "consequences":
      return template.consequences || null;

    case "actionPlan":
    case "actionPlans":
    case "actions":
      return template.actionPlans || null;

    case "riskOwner":
    case "riskOwners":
      return template.owners ? template.owners.riskOwner : null;

    case "actionOwner":
    case "actionOwners":
      return template.owners ? template.owners.actionOwner : null;

    case "treatment":
      return template.treatment || null;

    case "timing":
    case "targetDate":
    case "reviewDate":
      return template.timing || null;

    case "scoring":
      return template.scoring || null;

    case "titles":
      return template.titles || null;

    case "plainLanguage":
      return template.plainLanguage || null;

    default:
      return null;
  }
};

/**
 * Show message when no template match found
 * Guides user to use AI Builder or provides category-based fallback
 */
ERM.riskAI.showNoTemplateMatch = function (fieldName) {
  var titleEl = document.getElementById("risk-title");
  var title = titleEl ? titleEl.value.trim() : "";

  var message = "";

  if (!title) {
    message = "Enter a risk title first to get AI suggestions for " + fieldName;
  } else {
    message =
      'No AI suggestions found for "' +
      title.substring(0, 30) +
      (title.length > 30 ? "..." : "") +
      '". Try the AI Risk Builder for guided creation.';
  }

  if (typeof ERM.toast !== "undefined") {
    ERM.toast.info(message);
  }
};

/**
 * Show message when AI suggestions not available
 */
ERM.riskAI.showNoTemplatesAvailable = function () {
  if (typeof ERM.toast !== "undefined") {
    ERM.toast.warning(
      "AI suggestions not available. Please refresh the page."
    );
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
    '<span class="ai-badge-icon">✨</span>' +
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
    '<button type="button" class="btn btn-primary" onclick="ERM.riskAI.handleGenerateClick()" style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border: none;">' +
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
 */
ERM.riskAI.showThinkingModal = function (input, onComplete) {
  // Reset the flag at the start of each thinking modal
  ERM.riskAI._apiRespondedBeforeAnimation = false;

  var steps = [
    { text: "Analyzing your description", icon: "search", delay: 600 },
    { text: "Detecting risk category", icon: "category", delay: 800 },
    { text: "Identifying causes and consequences", icon: "tree", delay: 1000 },
    { text: "Generating suggested controls", icon: "shield", delay: 800 },
    { text: "Building risk assessment", icon: "chart", delay: 600 },
  ];

  var stepsHtml = "";
  for (var i = 0; i < steps.length; i++) {
    stepsHtml +=
      '<div class="ai-step" data-step="' +
      i +
      '">' +
      '<div class="ai-step-icon">' +
      '<svg class="ai-step-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="50" stroke-linecap="round"/></svg>' +
      '<svg class="ai-step-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
      "</div>" +
      '<span class="ai-step-text">' +
      steps[i].text +
      "</span>" +
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
    ERM.riskAI.icons.sparkles +
    "</div>" +
    "<h3>AI is generating your risk</h3>" +
    '<p class="ai-input-preview">"' +
    (input.length > 60 ? input.substring(0, 60) + "..." : input) +
    '"</p>' +
    "</div>" +
    '<div class="ai-steps-container">' +
    stepsHtml +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: "",
    content: content,
    size: "sm",
    buttons: [],
    footer: false,
    onOpen: function () {
      // Remove the modal header and fix all sizing issues
      var modal = document.querySelector(".modal");
      var modalContent = document.querySelector(".modal-content");
      var modalHeader = document.querySelector(".modal-header");
      var modalBody = document.querySelector(".modal-body");
      var modalFooter = document.querySelector(".modal-footer");

      if (modal) {
        modal.classList.add("ai-thinking-modal");
      }

      // Completely remove header
      if (modalHeader && modalHeader.parentNode) {
        modalHeader.parentNode.removeChild(modalHeader);
      }

      // Completely remove footer
      if (modalFooter && modalFooter.parentNode) {
        modalFooter.parentNode.removeChild(modalFooter);
      }

      // Fix body - remove all restrictions
      if (modalBody) {
        modalBody.style.cssText =
          "padding: 0 !important; max-height: none !important; overflow: visible !important;";
      }

      // Fix modal content wrapper
      if (modalContent) {
        modalContent.style.cssText =
          "max-height: none !important; overflow: visible !important;";
      }
    },
  });

  // Animate steps sequentially
  function animateStep(stepIndex) {
    // ALWAYS check flag first - if API already responded, stop animation completely
    if (ERM.riskAI._apiRespondedBeforeAnimation) {
      console.log("[Risk AI] Animation step " + stepIndex + " skipped - API already responded");
      return; // Stop animation entirely
    }

    if (stepIndex >= steps.length) {
      // All steps complete
      console.log("All thinking steps complete");

      // Double-check flag before closing
      if (ERM.riskAI._apiRespondedBeforeAnimation) {
        console.log("[Risk AI] Animation complete but API already responded - NOT closing modal");
        if (onComplete) onComplete();
        return;
      }

      // All steps complete - show success then call onComplete
      setTimeout(function () {
        // Triple-check flag before actually closing
        if (ERM.riskAI._apiRespondedBeforeAnimation) {
          console.log("[Risk AI] NOT closing - API responded during final wait");
          if (onComplete) onComplete();
          return;
        }
        // Also check if the current modal is actually the thinking modal (has ai-thinking-modal class)
        var modal = document.querySelector('.modal.ai-thinking-modal');
        if (!modal) {
          console.log("[Risk AI] Thinking modal not found - preview must be showing, NOT closing");
          if (onComplete) onComplete();
          return;
        }
        console.log("[Risk AI] Confirmed thinking modal still open - closing it now");
        ERM.components.closeModal();
        setTimeout(function () {
          if (onComplete) onComplete();
        }, 200);
      }, 400);
      return;
    }

    var stepEl = document.querySelector(
      '.ai-step[data-step="' + stepIndex + '"]'
    );
    if (stepEl) {
      stepEl.classList.add("active");

      setTimeout(function () {
        // Check flag again before continuing to next step
        if (ERM.riskAI._apiRespondedBeforeAnimation) {
          console.log("[Risk AI] Animation stopped mid-step - API responded");
          return;
        }
        stepEl.classList.remove("active");
        stepEl.classList.add("complete");
        animateStep(stepIndex + 1);
      }, steps[stepIndex].delay);
    }
  }

  // Start animation after modal opens
  setTimeout(function () {
    // Check if API already responded before even starting animation
    if (ERM.riskAI._apiRespondedBeforeAnimation) {
      console.log("[Risk AI] API already responded - skipping animation start");
      return;
    }
    animateStep(0);
  }, 300);
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
    '<span class="score-arrow">→</span>' +
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

  var suggestionsHtml = '<div class="ai-title-suggestions">';

  // Shuffle and show up to 4 alternatives
  var alternatives = this.shuffleArray(template.titles.slice());
  var shown = 0;

  for (var t = 0; t < alternatives.length && shown < 4; t++) {
    var title = alternatives[t];
    if (title.toLowerCase() !== currentValue.toLowerCase()) {
      var isFirst = shown === 0;
      suggestionsHtml +=
        '<div class="ai-title-item' +
        (isFirst ? " ai-recommended" : "") +
        '" data-title="' +
        this.escapeAttr(title) +
        '">' +
        (isFirst
          ? '<span class="ai-recommended-badge">⭐ Recommended</span>'
          : "") +
        '<span class="ai-title-text">' +
        title +
        "</span>" +
        '<button type="button" class="btn btn-sm btn-ai-use">Use</button>' +
        "</div>";
      shown++;
    }
  }

  suggestionsHtml += "</div>";

  ERM.components.showSecondaryModal({
    title: this.icons.sparkles + " AI Title Suggestions",
    content: suggestionsHtml,
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      var items = document.querySelectorAll(".ai-title-item");
      for (var i = 0; i < items.length; i++) {
        items[i].addEventListener("click", function () {
          var newTitle = this.getAttribute("data-title");
          var titleInput = document.getElementById("preview-risk-title");
          if (titleInput && newTitle) {
            titleInput.value = newTitle;
            self.previewRisk.title = newTitle;
          }
          ERM.components.closeSecondaryModal();
        });
      }
    },
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
 * Get thinking messages per field (action verbs)
 */
ERM.riskAI.thinkingMessages = {
  // Tier 1 - Quick (600ms)
  status: "Fetching statuses...",
  treatment: "Evaluating options...",
  targetDate: "Setting deadline...",
  reviewDate: "Scheduling review...",
  category: "Detecting category...",
  inherentLikelihood: "Scoring likelihood...",
  inherentImpact: "Scoring impact...",
  residualLikelihood: "Adjusting score...",
  residualImpact: "Adjusting impact...",
  // Tier 2 - Smart (900ms)
  title: "Generating titles...",
  owner: "Matching roles...",
  actionOwner: "Finding implementers...",
  // Tier 3 - Generate (1300ms) - uses overlay steps instead
  description: "Crafting description...",
  rootCauses: "Identifying causes...",
  consequences: "Mapping impacts...",
  actionPlan: "Building actions...",
  linkedControls: "Finding controls...",
};

/**
 * Overlay step messages for Tier 3
 */
ERM.riskAI.overlaySteps = {
  description: {
    step1: "Reading context...",
    step2: "Crafting description...",
  },
  rootCauses: { step1: "Analyzing risk...", step2: "Identifying causes..." },
  consequences: { step1: "Evaluating risk...", step2: "Mapping impacts..." },
  actionPlan: { step1: "Reviewing treatment...", step2: "Building actions..." },
  linkedControls: {
    step1: "Scanning library...",
    step2: "Finding controls...",
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

  var tier = this.getFieldTier(fieldType);
  var message = this.thinkingMessages[fieldType] || "Analyzing...";

  // Get the AI button for this field
  var btn = document.querySelector('.btn-ai-suggest[data-field="' + fieldType + '"]');

  // Start persistent spinner (will be cleared when DeepSeek responds)
  if (btn) {
    self.currentThinkingButton = btn;
    self.currentThinkingOriginalHtml = btn.innerHTML;

    if (tier.type === "button") {
      // Tier 1 & 2: Button spinner
      btn.classList.add("ai-thinking-btn");
      btn.innerHTML =
        '<span class="ai-thinking-content">' +
        self.icons.sparkles +
        " " +
        message +
        "</span>";
      btn.disabled = true;
    } else if (tier.type === "overlay") {
      // Tier 3: Show mini overlay immediately (persistent until DeepSeek responds)
      var steps = self.overlaySteps[fieldType] || {
        step1: "Analyzing...",
        step2: message,
      };
      self.showMiniOverlayPersistent(fieldType, steps);
    }
  }

  // Call DeepSeek immediately without timer callback
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
  // Clear button spinner
  if (this.currentThinkingButton) {
    this.currentThinkingButton.classList.remove("ai-thinking-btn");
    this.currentThinkingButton.innerHTML = this.currentThinkingOriginalHtml || (ERM.riskAI.icons.sparkles + " AI");
    this.currentThinkingButton.disabled = false;
    this.currentThinkingButton = null;
    this.currentThinkingOriginalHtml = null;
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
 */
ERM.riskAI.applyToField = function (fieldId, value) {
  var el = document.getElementById(fieldId);

  // Special handling for category field (visible text + hidden ID)
  if (fieldId === "risk-category") {
    var textEl = document.getElementById("risk-category");
    var idEl = document.getElementById("risk-category-id");

    // Get label for display
    var label = this.formatCategory(value);

    if (textEl) {
      textEl.value = label;
      textEl.classList.add("ai-filled");
      setTimeout(function () {
        textEl.classList.remove("ai-filled");
      }, 2000);
    }
    if (idEl) {
      idEl.value = value; // Store the ID
    }
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.success("Category applied");
    }
    return;
  }

  // Standard field handling
  if (el) {
    el.value = value;
    el.classList.add("ai-filled");
    setTimeout(function () {
      el.classList.remove("ai-filled");
    }, 2000);
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.success("AI suggestion applied");
    }
  }
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
      ERM.components.showSecondaryModal({
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
      ERM.components.showSecondaryModal({
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
        ERM.components.showSecondaryModal({
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
        ERM.components.showSecondaryModal({
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
 */
ERM.riskAI._renderTitleSuggestionsModal = function(allSuggestions, recommendedIndex, userText, category) {
  var self = this;

  // Store all suggestions for "more" button
  this.allTitleSuggestions = allSuggestions;

  // Get recommended and others
  var recommended = allSuggestions[recommendedIndex] || allSuggestions[0];
  var others = [];
  for (var k = 0; k < allSuggestions.length; k++) {
    if (k !== recommendedIndex) {
      others.push(allSuggestions[k]);
    }
  }
  var displayOthers = others.slice(0, 2);
  var hasMore = allSuggestions.length > 3;

  this.shownTitleSuggestions = [recommended].concat(displayOthers);

  var introText = userText
    ? 'Matching "<strong>' + ERM.utils.escapeHtml(userText) + '</strong>":'
    : "AI-generated suggestions:";

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">' +
    introText +
    "</p>" +
    '<div class="ai-suggestions-list ai-stagger-container">';

  // Recommended title first
  content +=
    '<div class="ai-suggestion-item ai-recommended ai-stagger-item clickable" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '" style="animation-delay: 0.1s">' +
    '<div class="ai-suggestion-content">' +
    '<span class="ai-recommended-badge">⭐ Best Match</span>' +
    '<span class="ai-suggestion-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</span>" +
    "</div>" +
    '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
    "</div>";

  // Other suggestions with stagger
  for (var i = 0; i < displayOthers.length; i++) {
    var delay = (i + 2) * 0.12;
    content +=
      '<div class="ai-suggestion-item ai-stagger-item clickable" data-value="' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      '" style="animation-delay: ' +
      delay +
      's">' +
      '<span class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      "</span>" +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      "</div>";
  }

  content += "</div>";

  // Discover more button if more available
  if (hasMore) {
    content +=
      '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-titles">✨ Generate More</button>';
  }

  content += "</div>";

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Risk Title Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function () {
      // Bind use buttons
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function () {
          var value = this.closest(".ai-suggestion-item").getAttribute(
            "data-value"
          );
          self.applyToField("risk-title", value);
          // Decrement AI counter when user uses suggestion
          ERM.riskAI.deepSeek.onSuggestionUsed();
          ERM.components.closeSecondaryModal();
        });
      }

      // Bind discover more
      var discoverBtn = document.getElementById("btn-discover-more-titles");
      if (discoverBtn) {
        discoverBtn.addEventListener("click", function () {
          self.showMoreTitleSuggestions(category);
        });
      }
    },
  });
};

/**
 * Update title suggestions modal in place (no blink)
 */
ERM.riskAI._updateTitleSuggestionsModal = function(allSuggestions, recommendedIndex, userText, category) {
  var self = this;

  // Store all suggestions for "more" button
  this.allTitleSuggestions = allSuggestions;

  // Get recommended and others
  var recommended = allSuggestions[recommendedIndex] || allSuggestions[0];
  var others = [];
  for (var k = 0; k < allSuggestions.length; k++) {
    if (k !== recommendedIndex) {
      others.push(allSuggestions[k]);
    }
  }
  var displayOthers = others.slice(0, 2);
  var hasMore = allSuggestions.length > 3;

  this.shownTitleSuggestions = [recommended].concat(displayOthers);

  var introText = userText
    ? 'Matching "<strong>' + ERM.utils.escapeHtml(userText) + '</strong>":'
    : "AI-generated suggestions:";

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">' +
    introText +
    "</p>" +
    '<div class="ai-suggestions-list ai-stagger-container">';

  // Recommended title first
  content +=
    '<div class="ai-suggestion-item ai-recommended ai-stagger-item clickable" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '" style="animation-delay: 0.1s">' +
    '<div class="ai-suggestion-content">' +
    '<span class="ai-recommended-badge">⭐ Best Match</span>' +
    '<span class="ai-suggestion-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</span>" +
    "</div>" +
    '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
    "</div>";

  // Other suggestions with stagger
  for (var i = 0; i < displayOthers.length; i++) {
    var delay = (i + 2) * 0.12;
    content +=
      '<div class="ai-suggestion-item ai-stagger-item clickable" data-value="' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      '" style="animation-delay: ' +
      delay +
      's">' +
      '<span class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      "</span>" +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      "</div>";
  }

  content += "</div>";

  // Discover more button if more available
  if (hasMore) {
    content +=
      '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-titles">✨ Generate More</button>';
  }

  content += "</div>";

  // Update modal in place (no blink)
  ERM.components.updateSecondaryModal({
    title: self.icons.sparkles + " Risk Title Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function () {
      // Bind use buttons
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function () {
          var value = this.closest(".ai-suggestion-item").getAttribute(
            "data-value"
          );
          self.applyToField("risk-title", value);
          // Decrement AI counter when user uses suggestion
          ERM.riskAI.deepSeek.onSuggestionUsed();
          ERM.components.closeSecondaryModal();
        });
      }

      // Bind discover more
      var discoverBtn = document.getElementById("btn-discover-more-titles");
      if (discoverBtn) {
        discoverBtn.addEventListener("click", function () {
          self.showMoreTitleSuggestions(category);
        });
      }
    },
  });
};

/**
 * Show thinking animation in the suggestion list, then call callback
 */
ERM.riskAI.showMoreThinking = function (callback) {
  var listContainer = document.querySelector(".ai-suggestions-list");
  var discoverBtn = document.querySelector(".btn-ai-discover");

  if (!listContainer) {
    if (callback) callback();
    return;
  }

  // Disable button and show thinking
  if (discoverBtn) {
    discoverBtn.disabled = true;
    discoverBtn.innerHTML = "⏳ AI thinking...";
  }

  // Random thinking messages
  var messages = [
    "Analyzing patterns...",
    "Finding alternatives...",
    "Generating options...",
    "Evaluating matches...",
  ];
  var msg = messages[Math.floor(Math.random() * messages.length)];

  // Show thinking in list
  listContainer.innerHTML =
    '<div class="ai-more-thinking">' +
    '<div class="ai-thinking-spinner"></div>' +
    "<span>" +
    msg +
    "</span>" +
    "</div>";

  // After delay, call callback
  setTimeout(function () {
    if (discoverBtn) {
      discoverBtn.disabled = false;
      discoverBtn.innerHTML = "✨ Generate More";
    }
    if (callback) callback();
  }, 800);
};

/**
 * Show more title suggestions (reshuffled) with thinking
 */
ERM.riskAI.showMoreTitleSuggestions = function (category) {
  var self = this;
  if (!this.allTitleSuggestions) return;

  this.showMoreThinking(function () {
    self._renderMoreTitles(category);
  });
};

/**
 * Render more titles after thinking
 */
ERM.riskAI._renderMoreTitles = function (category) {
  var self = this;

  // Get unshown suggestions
  var shown = this.shownTitleSuggestions || [];
  var all = this.allTitleSuggestions;
  var remaining = [];

  for (var i = 0; i < all.length; i++) {
    if (shown.indexOf(all[i]) === -1) {
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
  this.shownTitleSuggestions = [recommended].concat(displayOthers);

  // Update modal content
  var listContainer = document.querySelector(".ai-suggestions-list");
  if (!listContainer) return;

  var html = "";

  // Recommended title first
  html +=
    '<div class="ai-suggestion-item ai-recommended ai-stagger-item clickable" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '" style="animation-delay: 0.1s">' +
    '<div class="ai-suggestion-content">' +
    '<span class="ai-recommended-badge">⭐ Best Match</span>' +
    '<span class="ai-suggestion-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</span>" +
    "</div>" +
    '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
    "</div>";

  // Other suggestions with stagger
  for (var i = 0; i < displayOthers.length; i++) {
    var delay = (i + 2) * 0.12;
    html +=
      '<div class="ai-suggestion-item ai-stagger-item clickable" data-value="' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      '" style="animation-delay: ' +
      delay +
      's">' +
      '<span class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      "</span>" +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      "</div>";
  }

  listContainer.innerHTML = html;

  // Rebind use buttons
  var btns = listContainer.querySelectorAll(".btn-use");
  for (var j = 0; j < btns.length; j++) {
    btns[j].addEventListener("click", function () {
      var value = this.closest(".ai-suggestion-item").getAttribute(
        "data-value"
      );
      self.applyToField("risk-title", value);
      ERM.components.closeSecondaryModal();
    });
  }
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

  ERM.components.showSecondaryModal({
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
      (isRecommended ? '<span class="ai-recommended-badge">⭐ Best Match</span>' : '') +
      '<span class="ai-category-name">' + catName + '</span>' +
      (reason ? '<span class="ai-category-reason" style="display: block; font-size: 12px; color: #6b7280; margin-top: 4px;">' + reason + '</span>' : '') +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use-category" data-category="' + catValue + '">Use</button>' +
      '</div>';
  }

  content += '</div></div>';

  // Add Generate More button
  content +=
    '<div class="ai-section">' +
    '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-categories">' +
    '✨ Generate More</button></div>';

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
 * Get available departments from templates
 * Works for any industry - reads from current industry's categories
 */
ERM.riskAI.getAvailableDepartments = function () {
  var departments = [];
  var industry = this.getCurrentIndustry();

  if (
    typeof ERM_TEMPLATES !== "undefined" &&
    ERM_TEMPLATES[industry] &&
    ERM_TEMPLATES[industry].categories
  ) {
    var cats = ERM_TEMPLATES[industry].categories;
    for (var key in cats) {
      if (!cats.hasOwnProperty(key)) continue;
      if (typeof cats[key] === "function") continue;
      if (!Array.isArray(cats[key])) continue;

      // Format department name nicely
      var name = key.replace(/-/g, " ").replace(/\b\w/g, function (l) {
        return l.toUpperCase();
      });
      departments.push({ id: key, name: name });
    }
  }

  return departments;
};

/**
 * Show AI Deep Search with thinking steps animation
 */
ERM.riskAI.showAIDeepSearch = function () {
  var self = this;
  var mainContent = document.getElementById("ai-main-content");

  if (!mainContent) return;

  // AI thinking messages - more natural
  var thinkingMessages = [
    [
      "Analyzing your risk context...",
      "Evaluating category matches...",
      "Preparing recommendations...",
    ],
    [
      "Understanding risk patterns...",
      "Mapping to relevant areas...",
      "Generating suggestions...",
    ],
    [
      "Processing risk characteristics...",
      "Identifying best matches...",
      "Finalizing results...",
    ],
  ];
  var msgs =
    thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];

  // Replace main content with thinking steps
  mainContent.innerHTML =
    '<div class="ai-thinking-steps">' +
    '<div class="ai-step active" data-step="1">' +
    '<span class="ai-step-icon">⏳</span>' +
    '<span class="ai-step-text">' +
    msgs[0] +
    "</span>" +
    "</div>" +
    '<div class="ai-step" data-step="2">' +
    '<span class="ai-step-icon">⏳</span>' +
    '<span class="ai-step-text">' +
    msgs[1] +
    "</span>" +
    "</div>" +
    '<div class="ai-step" data-step="3">' +
    '<span class="ai-step-icon">⏳</span>' +
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
      step1.querySelector(".ai-step-icon").textContent = "✓";
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
      step2.querySelector(".ai-step-icon").textContent = "✓";
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
      step3.querySelector(".ai-step-icon").textContent = "✓";
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
    '<p class="ai-section-header"><span class="ai-badge">✨ Suggested Areas</span></p>' +
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

  // Discover more button if more areas available
  if (hasMore) {
    html +=
      '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-areas">✨ Discover More Areas</button>';
  }

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

  // Bind discover more button
  var discoverBtn = document.getElementById("btn-discover-more-areas");
  if (discoverBtn) {
    discoverBtn.addEventListener("click", function () {
      self.showMoreAreas();
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
    discoverBtn.innerHTML = "⏳ Discovering...";
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
    '<p class="ai-section-header"><span class="ai-badge">✨ More Areas</span></p>' +
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
  html +=
    '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-areas">✨ Discover More Areas</button>';
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

  var discoverBtn = document.getElementById("btn-discover-more-areas");
  if (discoverBtn) {
    discoverBtn.addEventListener("click", function () {
      self.showMoreAreas();
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

  // AI thinking messages - randomized
  var thinkingVariants = [
    [
      "Analyzing " + areaName + " risks...",
      "Identifying relevant categories...",
      "Ranking by importance...",
    ],
    [
      "Exploring " + areaName + " area...",
      "Finding matching categories...",
      "Prioritizing results...",
    ],
    [
      "Evaluating " + areaName + " context...",
      "Discovering categories...",
      "Preparing recommendations...",
    ],
  ];
  var msgs =
    thinkingVariants[Math.floor(Math.random() * thinkingVariants.length)];

  // Replace main content with thinking (visible without scrolling)
  mainContent.innerHTML =
    '<div class="ai-thinking-steps">' +
    '<div class="ai-step active" data-step="1">' +
    '<span class="ai-step-icon">⏳</span>' +
    '<span class="ai-step-text">' +
    msgs[0] +
    "</span>" +
    "</div>" +
    '<div class="ai-step" data-step="2">' +
    '<span class="ai-step-icon">⏳</span>' +
    '<span class="ai-step-text">' +
    msgs[1] +
    "</span>" +
    "</div>" +
    '<div class="ai-step" data-step="3">' +
    '<span class="ai-step-icon">⏳</span>' +
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
      step1.querySelector(".ai-step-icon").textContent = "✓";
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
      step2.querySelector(".ai-step-icon").textContent = "✓";
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
      step3.querySelector(".ai-step-icon").textContent = "✓";
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
  var industry = this.getCurrentIndustry();

  if (
    typeof ERM_TEMPLATES !== "undefined" &&
    ERM_TEMPLATES[industry] &&
    ERM_TEMPLATES[industry].categories
  ) {
    var deptCats = ERM_TEMPLATES[industry].categories[deptId];
    if (Array.isArray(deptCats)) {
      categories = deptCats;
    }
  }

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
    '<span class="ai-back-icon">✨</span> Explore Other Areas' +
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
        '<span class="ai-recommended-badge">⭐ Top Match</span>' +
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

    // Discover more button if more available
    if (hasMore) {
      html +=
        '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-cats">✨ Discover More</button>';
    }
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
      self.applyToField("risk-category", cat);
      ERM.components.closeSecondaryModal();
    });
  }

  // Bind discover more
  var discoverBtn = document.getElementById("btn-discover-more-cats");
  if (discoverBtn) {
    discoverBtn.addEventListener("click", function () {
      self.showMoreAreaCategories();
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
    '<span class="ai-recommended-badge">⭐ Best Match</span>' +
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
      self.applyToField("risk-category", cat);
      ERM.components.closeSecondaryModal();
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
      self.applyToField("risk-category", cat);
      ERM.components.closeSecondaryModal();
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

// Remove unused functions
ERM.riskAI.showCategoryResultsInModal = function () {};
ERM.riskAI.showCategoryResultsModal = function () {};

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
      self.applyToField("risk-category", cat);
      ERM.components.closeSecondaryModal();
    });
  }

  // Generic category buttons
  var genericBtns = document.querySelectorAll(".btn-generic-category");
  for (var j = 0; j < genericBtns.length; j++) {
    genericBtns[j].addEventListener("click", function () {
      var cat = this.getAttribute("data-category");
      self.applyToField("risk-category", cat);
      ERM.components.closeSecondaryModal();
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
        self.applyToField("risk-category", cat);
        ERM.components.closeSecondaryModal();
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

  // Store for "more" functionality
  this.allCausesSuggestions = allCauses;

  // Get recommended and others
  var recommended = allCauses[recommendedIndex] || allCauses[0];
  var others = [];
  for (var k = 0; k < allCauses.length; k++) {
    if (k !== recommendedIndex) {
      others.push(allCauses[k]);
    }
  }
  var displayOthers = others.slice(0, 2);
  var hasMore = allCauses.length > 3;

  this.shownCausesSuggestions = [recommended].concat(displayOthers);

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-identified root causes:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  // Recommended cause first
  content +=
    '<div class="ai-suggestion-item ai-recommended ai-stagger-item" style="animation-delay: 0.1s">' +
    '<input type="checkbox" class="cause-checkbox" id="cause-0" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '" checked>' +
    '<label for="cause-0" class="ai-suggestion-content">' +
    '<span class="ai-recommended-badge">⭐ Most Likely</span>' +
    '<span class="ai-suggestion-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</span>" +
    "</label>" +
    "</div>";

  // Other suggestions with stagger
  for (var i = 0; i < displayOthers.length; i++) {
    var delay = (i + 2) * 0.1;
    content +=
      '<div class="ai-suggestion-item ai-stagger-item" style="animation-delay: ' +
      delay +
      's">' +
      '<input type="checkbox" class="cause-checkbox" id="cause-' +
      (i + 1) +
      '" data-value="' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      '">' +
      '<label for="cause-' +
      (i + 1) +
      '" class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      "</label>" +
      "</div>";
  }

  content += "</div>";

  // Discover more button if more available
  if (hasMore) {
    content +=
      '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-causes">✨ Generate More</button>';
  }

  content += "</div>";

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Root Cause Analysis",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Add Selected", type: "primary", action: "add" },
    ],
    onOpen: function () {
      // Bind discover more
      var discoverBtn = document.getElementById("btn-discover-more-causes");
      if (discoverBtn) {
        discoverBtn.addEventListener("click", function () {
          self.showMoreCausesSuggestions(title, category);
        });
      }
    },
    onAction: function (action) {
      if (action === "add") {
        var checkboxes = document.querySelectorAll(".cause-checkbox:checked");
        var added = 0;
        for (var j = 0; j < checkboxes.length; j++) {
          var value = checkboxes[j].getAttribute("data-value");
          if (
            typeof ERM.riskRegister !== "undefined" &&
            ERM.riskRegister.addListItem
          ) {
            ERM.riskRegister.addListItem("rootCauses", value);
            added++;
          }
        }
        // Decrement AI counter when user uses suggestions
        if (added > 0) {
          ERM.riskAI.deepSeek.onSuggestionUsed();
        }
        ERM.components.closeSecondaryModal();
        if (added > 0 && typeof ERM.toast !== "undefined") {
          ERM.toast.success(added + " root cause(s) added");
        }
      }
    },
  });
};

/**
 * Update causes suggestions modal in-place (no blink)
 * Uses updateSecondaryModal to avoid close/reopen flicker
 */
ERM.riskAI._updateCausesSuggestionsModal = function(allCauses, recommendedIndex, title, category) {
  console.log("[_updateCausesSuggestionsModal] Called - updating modal in place");
  var self = this;

  // Store for "more" functionality
  this.allCausesSuggestions = allCauses;

  // Get recommended and others
  var recommended = allCauses[recommendedIndex] || allCauses[0];
  var others = [];
  for (var k = 0; k < allCauses.length; k++) {
    if (k !== recommendedIndex) {
      others.push(allCauses[k]);
    }
  }
  var displayOthers = others.slice(0, 2);
  var hasMore = allCauses.length > 3;

  this.shownCausesSuggestions = [recommended].concat(displayOthers);

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-identified root causes:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  // Recommended cause (checkbox, highlighted)
  content +=
    '<div class="ai-suggestion-item ai-recommended ai-stagger-item" style="animation-delay: 0.1s">' +
    '<label class="ai-suggestion-checkbox">' +
    '<input type="checkbox" class="cause-checkbox" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '" checked>' +
    '<span class="ai-recommended-badge">⭐ Most Likely</span>' +
    '<span class="ai-suggestion-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</span>" +
    "</label>" +
    "</div>";

  // Other causes with checkboxes
  for (var j = 0; j < displayOthers.length; j++) {
    var delay = (j + 2) * 0.12;
    content +=
      '<div class="ai-suggestion-item ai-stagger-item" style="animation-delay: ' +
      delay +
      's">' +
      '<label class="ai-suggestion-checkbox">' +
      '<input type="checkbox" class="cause-checkbox" data-value="' +
      ERM.utils.escapeHtml(displayOthers[j]) +
      '">' +
      '<span class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(displayOthers[j]) +
      "</span>" +
      "</label>" +
      "</div>";
  }

  content += "</div>";

  // Discover more button if more available
  if (hasMore) {
    content +=
      '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-causes">✨ Generate More</button>';
  }

  content += "</div>";

  // Update modal content without closing
  ERM.components.updateSecondaryModal({
    title: self.icons.sparkles + " Root Cause Analysis",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Add Selected", type: "primary", action: "add" },
    ],
    onOpen: function () {
      // Bind discover more
      var discoverBtn = document.getElementById("btn-discover-more-causes");
      if (discoverBtn) {
        discoverBtn.addEventListener("click", function () {
          self.showMoreCausesSuggestions(title, category);
        });
      }
    },
    onAction: function (action) {
      if (action === "add") {
        var checkboxes = document.querySelectorAll(".cause-checkbox:checked");
        var added = 0;
        for (var j = 0; j < checkboxes.length; j++) {
          var value = checkboxes[j].getAttribute("data-value");
          if (
            typeof ERM.riskRegister !== "undefined" &&
            ERM.riskRegister.addListItem
          ) {
            ERM.riskRegister.addListItem("rootCauses", value);
            added++;
          }
        }
        // Decrement AI counter when user uses suggestions
        if (added > 0 && ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
          ERM.riskAI.deepSeek.onSuggestionUsed();
        }
        ERM.components.closeSecondaryModal();
        if (added > 0 && typeof ERM.toast !== "undefined") {
          ERM.toast.success(added + " root cause(s) added");
        }
      }
    },
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
    '<span class="ai-recommended-badge">⭐ Most Likely</span>' +
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

  // Store for "more" functionality
  this.allConsequencesSuggestions = allConsequences;

  // Get recommended and others
  var recommended = allConsequences[recommendedIndex] || allConsequences[0];
  var others = [];
  for (var k = 0; k < allConsequences.length; k++) {
    if (k !== recommendedIndex) {
      others.push(allConsequences[k]);
    }
  }
  var displayOthers = others.slice(0, 2);
  var hasMore = allConsequences.length > 3;

  this.shownConsequencesSuggestions = [recommended].concat(displayOthers);

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-predicted consequences:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  // Recommended consequence first
  content +=
    '<div class="ai-suggestion-item ai-recommended ai-stagger-item" style="animation-delay: 0.1s">' +
    '<input type="checkbox" class="consequence-checkbox" id="consequence-0" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '" checked>' +
    '<label for="consequence-0" class="ai-suggestion-content">' +
    '<span class="ai-recommended-badge">⭐ Highest Impact</span>' +
    '<span class="ai-suggestion-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</span>" +
    "</label>" +
    "</div>";

  // Other suggestions with stagger
  for (var i = 0; i < displayOthers.length; i++) {
    var delay = (i + 2) * 0.1;
    content +=
      '<div class="ai-suggestion-item ai-stagger-item" style="animation-delay: ' +
      delay +
      's">' +
      '<input type="checkbox" class="consequence-checkbox" id="consequence-' +
      (i + 1) +
      '" data-value="' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      '">' +
      '<label for="consequence-' +
      (i + 1) +
      '" class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      "</label>" +
      "</div>";
  }

  content += "</div>";

  // Discover more button if more available
  if (hasMore) {
    content +=
      '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-consequences">✨ Generate More</button>';
  }

  content += "</div>";

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Impact Analysis",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Add Selected", type: "primary", action: "add" },
    ],
    onOpen: function () {
      // Bind discover more
      var discoverBtn = document.getElementById(
        "btn-discover-more-consequences"
      );
      if (discoverBtn) {
        discoverBtn.addEventListener("click", function () {
          self.showMoreConsequencesSuggestions(title, category);
        });
      }
    },
    onAction: function (action) {
      if (action === "add") {
        var checkboxes = document.querySelectorAll(
          ".consequence-checkbox:checked"
        );
        var added = 0;
        for (var j = 0; j < checkboxes.length; j++) {
          var value = checkboxes[j].getAttribute("data-value");
          if (
            typeof ERM.riskRegister !== "undefined" &&
            ERM.riskRegister.addListItem
          ) {
            ERM.riskRegister.addListItem("consequences", value);
            added++;
          }
        }
        // Decrement AI counter when user uses suggestions
        if (added > 0) {
          ERM.riskAI.deepSeek.onSuggestionUsed();
        }
        ERM.components.closeSecondaryModal();
        if (added > 0 && typeof ERM.toast !== "undefined") {
          ERM.toast.success(added + " consequence(s) added");
        }
      }
    },
  });
};

/**
 * Update consequences suggestions modal in-place (no blink)
 */
ERM.riskAI._updateConsequencesSuggestionsModal = function(allConsequences, recommendedIndex, title, category) {
  var self = this;

  // Store for "more" functionality
  this.allConsequencesSuggestions = allConsequences;

  // Get recommended and others
  var recommended = allConsequences[recommendedIndex] || allConsequences[0];
  var others = [];
  for (var k = 0; k < allConsequences.length; k++) {
    if (k !== recommendedIndex) {
      others.push(allConsequences[k]);
    }
  }
  var displayOthers = others.slice(0, 2);
  var hasMore = allConsequences.length > 3;

  this.shownConsequencesSuggestions = [recommended].concat(displayOthers);

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-predicted consequences:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  // Recommended consequence first
  content +=
    '<div class="ai-suggestion-item ai-recommended ai-stagger-item" style="animation-delay: 0.1s">' +
    '<input type="checkbox" class="consequence-checkbox" id="consequence-0" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '" checked>' +
    '<label for="consequence-0" class="ai-suggestion-content">' +
    '<span class="ai-recommended-badge">⭐ Highest Impact</span>' +
    '<span class="ai-suggestion-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</span>" +
    "</label>" +
    "</div>";

  // Other suggestions with stagger
  for (var i = 0; i < displayOthers.length; i++) {
    var delay = (i + 2) * 0.1;
    content +=
      '<div class="ai-suggestion-item ai-stagger-item" style="animation-delay: ' +
      delay +
      's">' +
      '<input type="checkbox" class="consequence-checkbox" id="consequence-' +
      (i + 1) +
      '" data-value="' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      '">' +
      '<label for="consequence-' +
      (i + 1) +
      '" class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      "</label>" +
      "</div>";
  }

  content += "</div>";

  // Discover more button if more available
  if (hasMore) {
    content +=
      '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-consequences">✨ Generate More</button>';
  }

  content += "</div>";

  // Update modal content without closing
  ERM.components.updateSecondaryModal({
    title: self.icons.sparkles + " Impact Analysis",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Add Selected", type: "primary", action: "add" },
    ],
    onOpen: function () {
      // Bind discover more
      var discoverBtn = document.getElementById("btn-discover-more-consequences");
      if (discoverBtn) {
        discoverBtn.addEventListener("click", function () {
          self.showMoreConsequencesSuggestions(title, category);
        });
      }
    },
    onAction: function (action) {
      if (action === "add") {
        var checkboxes = document.querySelectorAll(".consequence-checkbox:checked");
        var added = 0;
        for (var j = 0; j < checkboxes.length; j++) {
          var value = checkboxes[j].getAttribute("data-value");
          if (
            typeof ERM.riskRegister !== "undefined" &&
            ERM.riskRegister.addListItem
          ) {
            ERM.riskRegister.addListItem("consequences", value);
            added++;
          }
        }
        // Decrement AI counter when user uses suggestions
        if (added > 0 && ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
          ERM.riskAI.deepSeek.onSuggestionUsed();
        }
        ERM.components.closeSecondaryModal();
        if (added > 0 && typeof ERM.toast !== "undefined") {
          ERM.toast.success(added + " consequence(s) added");
        }
      }
    },
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
    '<span class="ai-recommended-badge">⭐ Highest Impact</span>' +
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

  // Store for "more" button
  this.allDescriptionSuggestions = allDescriptions;

  // Get recommended and others
  var recommended = allDescriptions[recommendedIndex] || allDescriptions[0];
  var others = [];
  for (var k = 0; k < allDescriptions.length; k++) {
    if (k !== recommendedIndex) {
      others.push(allDescriptions[k]);
    }
  }
  others = others.slice(0, 1);
  var hasMore = allDescriptions.length > 2;

  this.shownDescriptionSuggestions = [recommended].concat(others);

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-generated descriptions:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  // Recommended description first
  content +=
    '<div class="ai-suggestion-item ai-recommended ai-stagger-item" style="animation-delay: 0.1s">' +
    '<div class="ai-suggestion-content">' +
    '<span class="ai-recommended-badge">⭐ Best Match</span>' +
    '<div class="ai-description-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</div>" +
    "</div>" +
    '<button type="button" class="btn btn-sm btn-ai-use btn-use" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '">Use</button>' +
    "</div>";

  // Other descriptions with stagger
  for (var i = 0; i < others.length; i++) {
    var delay = (i + 2) * 0.12;
    content +=
      '<div class="ai-suggestion-item ai-stagger-item" style="animation-delay: ' +
      delay +
      's">' +
      '<div class="ai-description-text">' +
      ERM.utils.escapeHtml(others[i]) +
      "</div>" +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use" data-value="' +
      ERM.utils.escapeHtml(others[i]) +
      '">Use</button>' +
      "</div>";
  }

  content += "</div>";

  // Add "Generate More" button if more available
  if (hasMore) {
    content +=
      '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-descriptions">✨ Generate More</button>';
  }

  content += "</div>";

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Description Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function () {
      // Bind use buttons
      var btns = document.querySelectorAll(".ai-suggestions-list .btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function () {
          var value = this.getAttribute("data-value");
          self.applyToField("risk-description", value);
          // Decrement AI counter when user uses suggestion
          ERM.riskAI.deepSeek.onSuggestionUsed();
          ERM.components.closeSecondaryModal();
        });
      }

      // Bind discover more
      var discoverBtn = document.getElementById(
        "btn-discover-more-descriptions"
      );
      if (discoverBtn) {
        discoverBtn.addEventListener("click", function () {
          self.showMoreDescriptionSuggestions();
        });
      }
    },
  });
};

/**
 * Update description suggestions modal in place (no blink)
 */
ERM.riskAI._updateDescriptionSuggestionsModal = function(allDescriptions, recommendedIndex) {
  var self = this;

  // Store for "more" button
  this.allDescriptionSuggestions = allDescriptions;

  // Get recommended and others
  var recommended = allDescriptions[recommendedIndex] || allDescriptions[0];
  var others = [];
  for (var k = 0; k < allDescriptions.length; k++) {
    if (k !== recommendedIndex) {
      others.push(allDescriptions[k]);
    }
  }
  others = others.slice(0, 1);
  var hasMore = allDescriptions.length > 2;

  this.shownDescriptionSuggestions = [recommended].concat(others);

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-generated descriptions:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  // Recommended description first
  content +=
    '<div class="ai-suggestion-item ai-recommended ai-stagger-item" style="animation-delay: 0.1s">' +
    '<div class="ai-suggestion-content">' +
    '<span class="ai-recommended-badge">⭐ Best Match</span>' +
    '<div class="ai-description-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</div>" +
    "</div>" +
    '<button type="button" class="btn btn-sm btn-ai-use btn-use" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '">Use</button>' +
    "</div>";

  // Other descriptions with stagger
  for (var i = 0; i < others.length; i++) {
    var delay = (i + 2) * 0.12;
    content +=
      '<div class="ai-suggestion-item ai-stagger-item" style="animation-delay: ' +
      delay +
      's">' +
      '<div class="ai-description-text">' +
      ERM.utils.escapeHtml(others[i]) +
      "</div>" +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use" data-value="' +
      ERM.utils.escapeHtml(others[i]) +
      '">Use</button>' +
      "</div>";
  }

  content += "</div>";

  // Add "Generate More" button if more available
  if (hasMore) {
    content +=
      '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-descriptions">✨ Generate More</button>';
  }

  content += "</div>";

  // Update modal in place (no blink)
  ERM.components.updateSecondaryModal({
    title: self.icons.sparkles + " Description Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function () {
      // Bind use buttons
      var btns = document.querySelectorAll(".ai-suggestions-list .btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function () {
          var value = this.getAttribute("data-value");
          self.applyToField("risk-description", value);
          // Decrement AI counter when user uses suggestion
          ERM.riskAI.deepSeek.onSuggestionUsed();
          ERM.components.closeSecondaryModal();
        });
      }

      // Bind discover more
      var discoverBtn = document.getElementById(
        "btn-discover-more-descriptions"
      );
      if (discoverBtn) {
        discoverBtn.addEventListener("click", function () {
          self.showMoreDescriptionSuggestions();
        });
      }
    },
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
    '<span class="ai-recommended-badge">⭐ Best Match</span>' +
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
      ERM.riskAI.applyToField("risk-description", value);
      ERM.components.closeSecondaryModal();
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
  var introText = isRiskOwner ? "AI-suggested risk owners:" : "AI-suggested action owners:";

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">' + introText + '</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  // Show all 4 suggestions
  for (var i = 0; i < allOwners.length; i++) {
    var owner = allOwners[i];
    var role = typeof owner === "object" ? owner.role : owner;
    var reason = typeof owner === "object" ? owner.reason : null;
    var delay = (i + 1) * 0.12;
    var isRecommended = (i === recommendedIndex);

    content +=
      '<div class="ai-suggestion-item' +
      (isRecommended ? ' ai-recommended' : '') +
      ' ai-stagger-item clickable" data-value="' +
      ERM.utils.escapeHtml(role) +
      '" style="animation-delay: ' + delay + 's">' +
      '<div class="ai-suggestion-content">' +
      (isRecommended ? '<span class="ai-recommended-badge">⭐ Recommended</span>' : '') +
      '<div>' +
      '<span class="ai-suggestion-text"><strong>' + ERM.utils.escapeHtml(role) + '</strong></span>' +
      (reason ? '<div class="text-muted" style="font-size: 12px; margin-top: 4px;">' + ERM.utils.escapeHtml(reason) + '</div>' : '') +
      '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      '</div>';
  }

  content += '</div>';
  content += '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-generate-more-owners">✨ Generate More</button>';
  content += '</div>';

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " AI " + modalTitle,
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function () {
      // Use buttons
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function () {
          var value = this.closest(".ai-suggestion-item").getAttribute("data-value");
          self.applyToField(fieldId, value);
          if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
            ERM.riskAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
        });
      }

      // Clickable items
      var items = document.querySelectorAll(".ai-suggestion-item.clickable");
      for (var k = 0; k < items.length; k++) {
        items[k].addEventListener("click", function(e) {
          if (e.target.classList.contains("btn-use")) return;
          var value = this.getAttribute("data-value");
          self.applyToField(fieldId, value);
          if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
            ERM.riskAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
        });
      }

      // Generate More button
      var moreBtn = document.getElementById("btn-generate-more-owners");
      if (moreBtn) {
        moreBtn.addEventListener("click", function() {
          ERM.components.closeSecondaryModal();
          // Re-call the appropriate function
          if (isRiskOwner) {
            var catEl = document.getElementById("risk-category");
            self.showOwnerSuggestions(catEl ? catEl.value : "");
          } else {
            var catEl2 = document.getElementById("risk-category");
            self.showActionOwnerSuggestions(catEl2 ? catEl2.value : "");
          }
        });
      }
    },
  });
};

/**
 * Update owner suggestions modal in place (no blink)
 */
ERM.riskAI._updateOwnerSuggestionsModal = function(allOwners, recommendedIndex, fieldId) {
  var self = this;
  var isRiskOwner = fieldId === "risk-owner";
  var title = isRiskOwner ? "Risk Owner Suggestions" : "Action Owner Suggestions";
  var introText = isRiskOwner ? "AI-suggested risk owners:" : "AI-suggested action owners:";

  // Get recommended and others
  var recommended = allOwners[recommendedIndex] || allOwners[0];
  var others = [];
  for (var k = 0; k < allOwners.length; k++) {
    if (k !== recommendedIndex) {
      others.push(allOwners[k]);
    }
  }
  others = others.slice(0, 2);

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">' + introText + '</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  // Recommended owner first
  content +=
    '<div class="ai-suggestion-item ai-recommended ai-stagger-item clickable" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '" style="animation-delay: 0.1s">' +
    '<div class="ai-suggestion-content">' +
    '<span class="ai-recommended-badge">⭐ Recommended</span>' +
    '<span class="ai-suggestion-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</span>" +
    "</div>" +
    '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
    "</div>";

  // Other suggestions with stagger
  for (var i = 0; i < others.length; i++) {
    var delay = (i + 2) * 0.1;
    content +=
      '<div class="ai-suggestion-item ai-stagger-item clickable" data-value="' +
      ERM.utils.escapeHtml(others[i]) +
      '" style="animation-delay: ' +
      delay +
      's">' +
      '<span class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(others[i]) +
      "</span>" +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      "</div>";
  }

  content += "</div></div>";

  // Update modal in place (no blink)
  ERM.components.updateSecondaryModal({
    title: self.icons.sparkles + " " + title,
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function () {
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function () {
          var value = this.closest(".ai-suggestion-item").getAttribute(
            "data-value"
          );
          self.applyToField(fieldId, value);
          // Decrement AI counter when user uses suggestion
          ERM.riskAI.deepSeek.onSuggestionUsed();
          ERM.components.closeSecondaryModal();
        });
      }
    },
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
    '<p class="text-muted">Define your strategic objectives in Settings → Organization to enable AI suggestions here.</p>' +
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

      content =
        '<div class="ai-suggestions-container">' +
        '<p class="ai-suggestions-intro">Your organization\'s strategic objectives:</p>' +
        '<div class="ai-suggestions-list">';

      for (var i = 0; i < objectives.length; i++) {
        content +=
          '<div class="ai-suggestion-item clickable" data-value="' +
          ERM.utils.escapeHtml(objectives[i]) +
          '">' +
          '<span class="ai-suggestion-text">' +
          ERM.utils.escapeHtml(objectives[i]) +
          "</span>" +
          '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
          "</div>";
      }

      content += "</div></div>";
    }
  }

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Strategic Objectives",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function () {
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function () {
          var value = this.closest(".ai-suggestion-item").getAttribute(
            "data-value"
          );
          self.applyToField("risk-strategic-objective", value);
          ERM.components.closeSecondaryModal();
        });
      }
    },
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

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-suggested risk treatment options (ISO 31000):</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var value = typeof sug === "object" ? sug.value : sug;
    var reason = typeof sug === "object" ? sug.reason : null;
    var delay = (i + 1) * 0.12;
    var isRecommended = (i === recommendedIndex);

    content +=
      '<div class="ai-suggestion-item' +
      (isRecommended ? ' ai-recommended' : '') +
      ' ai-stagger-item clickable" data-value="' +
      ERM.utils.escapeHtml(value) +
      '" style="animation-delay: ' + delay + 's">' +
      '<div class="ai-suggestion-content">' +
      (isRecommended ? '<span class="ai-recommended-badge">⭐ Recommended</span>' : '') +
      '<div>' +
      '<span class="ai-suggestion-text"><strong>' + ERM.utils.escapeHtml(value) + '</strong></span>' +
      (reason ? '<div class="text-muted" style="font-size: 12px; margin-top: 4px;">' + ERM.utils.escapeHtml(reason) + '</div>' : '') +
      '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      '</div>';
  }

  content += '</div>';
  content += '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-generate-more-treatment">✨ Generate More</button>';
  content += '</div>';

  ERM.components.showSecondaryModal({
    title: this.icons.sparkles + " AI Treatment Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function() {
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function() {
          var value = this.closest(".ai-suggestion-item").getAttribute("data-value");
          self.applyToField("risk-treatment", value);
          if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
            ERM.riskAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
        });
      }

      var items = document.querySelectorAll(".ai-suggestion-item.clickable");
      for (var k = 0; k < items.length; k++) {
        items[k].addEventListener("click", function(e) {
          if (e.target.classList.contains("btn-use")) return;
          var value = this.getAttribute("data-value");
          self.applyToField("risk-treatment", value);
          if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
            ERM.riskAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
        });
      }

      // Generate More button
      var moreBtn = document.getElementById("btn-generate-more-treatment");
      if (moreBtn) {
        moreBtn.addEventListener("click", function() {
          ERM.components.closeSecondaryModal();
          var titleEl = document.getElementById("risk-title");
          var catEl = document.getElementById("risk-category");
          self.showTreatmentSuggestions(
            titleEl ? titleEl.value : "",
            catEl ? catEl.value : ""
          );
        });
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
  ERM.riskAI.deepSeek.getSuggestions(NEEDSFIX, context, function(error, result) {
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

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-suggested risk status:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var value = typeof sug === "object" ? sug.value : sug;
    var reason = typeof sug === "object" ? sug.reason : null;
    var delay = (i + 1) * 0.12;
    var isRecommended = (i === recommendedIndex);

    content +=
      '<div class="ai-suggestion-item' +
      (isRecommended ? ' ai-recommended' : '') +
      ' ai-stagger-item clickable" data-value="' +
      ERM.utils.escapeHtml(value) +
      '" style="animation-delay: ' + delay + 's">' +
      '<div class="ai-suggestion-content">' +
      (isRecommended ? '<span class="ai-recommended-badge">⭐ Recommended</span>' : '') +
      '<div>' +
      '<span class="ai-suggestion-text"><strong>' + ERM.utils.escapeHtml(value) + '</strong></span>' +
      (reason ? '<div class="text-muted" style="font-size: 12px; margin-top: 4px;">' + ERM.utils.escapeHtml(reason) + '</div>' : '') +
      '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      '</div>';
  }

  content += '</div>';
  content += '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-generate-more-status">✨ Generate More</button>';
  content += '</div>';

  ERM.components.showSecondaryModal({
    title: this.icons.sparkles + " AI Status Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function() {
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function() {
          var value = this.closest(".ai-suggestion-item").getAttribute("data-value");
          self.applyToField("risk-status", value);
          if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
            ERM.riskAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
        });
      }

      var items = document.querySelectorAll(".ai-suggestion-item.clickable");
      for (var k = 0; k < items.length; k++) {
        items[k].addEventListener("click", function(e) {
          if (e.target.classList.contains("btn-use")) return;
          var value = this.getAttribute("data-value");
          self.applyToField("risk-status", value);
          if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
            ERM.riskAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
        });
      }

      // Generate More button
      var moreBtn = document.getElementById("btn-generate-more-status");
      if (moreBtn) {
        moreBtn.addEventListener("click", function() {
          ERM.components.closeSecondaryModal();
          self.showStatusSuggestions();
        });
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

  // Store for "more" functionality
  this.allActionSuggestions = allActions;

  // Get recommended and others
  var recommended = allActions[recommendedIndex] || allActions[0];
  var others = [];
  for (var k = 0; k < allActions.length; k++) {
    if (k !== recommendedIndex) {
      others.push(allActions[k]);
    }
  }
  var displayOthers = others.slice(0, 2);
  var hasMore = allActions.length > 3;

  this.shownActionSuggestions = [recommended].concat(displayOthers);

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-recommended actions:</p>' +
    '<div class="ai-suggestions-list ai-actions-list ai-stagger-container">';

  // Recommended action first
  content +=
    '<div class="ai-suggestion-item ai-action-item ai-recommended ai-stagger-item" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '" style="animation-delay: 0.1s">' +
    '<input type="checkbox" class="action-checkbox" id="action-0" checked>' +
    '<label for="action-0" class="ai-suggestion-content">' +
    '<span class="ai-recommended-badge">⭐ Priority Action</span>' +
    '<span class="ai-suggestion-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</span>" +
    "</label>" +
    "</div>";

  // Other suggestions with stagger
  for (var i = 0; i < displayOthers.length; i++) {
    var delay = (i + 2) * 0.1;
    content +=
      '<div class="ai-suggestion-item ai-action-item ai-stagger-item" data-value="' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      '" style="animation-delay: ' +
      delay +
      's">' +
      '<input type="checkbox" class="action-checkbox" id="action-' +
      (i + 1) +
      '">' +
      '<label for="action-' +
      (i + 1) +
      '" class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      "</label>" +
      "</div>";
  }

  content += "</div>";

  // Discover more button if more available
  if (hasMore) {
    content +=
      '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-actions">✨ Generate More Actions</button>';
  }

  content += "</div>";

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Action Plan Generator",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Add Selected", type: "primary", action: "add" },
    ],
    onAction: function (action) {
      if (action === "add") {
        var checkboxes = document.querySelectorAll(".action-checkbox:checked");
        var added = 0;
        for (var j = 0; j < checkboxes.length; j++) {
          var value = checkboxes[j]
            .closest(".ai-action-item")
            .getAttribute("data-value");
          if (
            typeof ERM.riskRegister !== "undefined" &&
            ERM.riskRegister.addListItem
          ) {
            ERM.riskRegister.addListItem("actionPlan", value);
            added++;
          }
        }
        // Decrement AI counter when user uses suggestions
        if (added > 0) {
          ERM.riskAI.deepSeek.onSuggestionUsed();
        }
        ERM.components.closeSecondaryModal();
        if (added > 0 && typeof ERM.toast !== "undefined") {
          ERM.toast.success(added + " action(s) added");
        }
      }
    },
    onOpen: function () {
      // Bind discover more
      var discoverBtn = document.getElementById("btn-discover-more-actions");
      if (discoverBtn) {
        discoverBtn.addEventListener("click", function () {
          self.showMoreActionSuggestions(title, category);
        });
      }
    },
  });
};

/**
 * Update action plan suggestions modal in place (no blink)
 */
ERM.riskAI._updateActionPlanSuggestionsModal = function(allActions, recommendedIndex, title, category) {
  var self = this;

  // Store for "more" functionality
  this.allActionSuggestions = allActions;

  // Get recommended and others
  var recommended = allActions[recommendedIndex] || allActions[0];
  var others = [];
  for (var k = 0; k < allActions.length; k++) {
    if (k !== recommendedIndex) {
      others.push(allActions[k]);
    }
  }
  var displayOthers = others.slice(0, 2);
  var hasMore = allActions.length > 3;

  this.shownActionSuggestions = [recommended].concat(displayOthers);

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-recommended actions:</p>' +
    '<div class="ai-suggestions-list ai-actions-list ai-stagger-container">';

  // Recommended action first
  content +=
    '<div class="ai-suggestion-item ai-action-item ai-recommended ai-stagger-item" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '" style="animation-delay: 0.1s">' +
    '<input type="checkbox" class="action-checkbox" id="action-0" checked>' +
    '<label for="action-0" class="ai-suggestion-content">' +
    '<span class="ai-recommended-badge">⭐ Priority Action</span>' +
    '<span class="ai-suggestion-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</span>" +
    "</label>" +
    "</div>";

  // Other suggestions with stagger
  for (var i = 0; i < displayOthers.length; i++) {
    var delay = (i + 2) * 0.1;
    content +=
      '<div class="ai-suggestion-item ai-action-item ai-stagger-item" data-value="' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      '" style="animation-delay: ' +
      delay +
      's">' +
      '<input type="checkbox" class="action-checkbox" id="action-' +
      (i + 1) +
      '">' +
      '<label for="action-' +
      (i + 1) +
      '" class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      "</label>" +
      "</div>";
  }

  content += "</div>";

  // Discover more button if more available
  if (hasMore) {
    content +=
      '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-actions">✨ Generate More Actions</button>';
  }

  content += "</div>";

  // Update modal in place (no blink)
  ERM.components.updateSecondaryModal({
    title: self.icons.sparkles + " Action Plan Generator",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Add Selected", type: "primary", action: "add" },
    ],
    onAction: function (action) {
      if (action === "add") {
        var checkboxes = document.querySelectorAll(".action-checkbox:checked");
        var added = 0;
        for (var j = 0; j < checkboxes.length; j++) {
          var value = checkboxes[j]
            .closest(".ai-action-item")
            .getAttribute("data-value");
          if (
            typeof ERM.riskRegister !== "undefined" &&
            ERM.riskRegister.addListItem
          ) {
            ERM.riskRegister.addListItem("actionPlan", value);
            added++;
          }
        }
        // Decrement AI counter when user uses suggestions
        if (added > 0) {
          ERM.riskAI.deepSeek.onSuggestionUsed();
        }
        ERM.components.closeSecondaryModal();
        if (added > 0 && typeof ERM.toast !== "undefined") {
          ERM.toast.success(added + " action(s) added");
        }
      }
    },
    onOpen: function () {
      // Bind discover more
      var discoverBtn = document.getElementById("btn-discover-more-actions");
      if (discoverBtn) {
        discoverBtn.addEventListener("click", function () {
          self.showMoreActionSuggestions(title, category);
        });
      }
    },
  });
};

/**
 * Show more action suggestions (reshuffled) with thinking
 */
ERM.riskAI.showMoreActionSuggestions = function (title, category) {
  var self = this;
  if (!this.allActionSuggestions) return;

  this.showMoreThinking(function () {
    self._renderMoreActions();
  });
};

/**
 * Render more actions after thinking
 */
ERM.riskAI._renderMoreActions = function () {
  var self = this;

  var shown = this.shownActionSuggestions || [];
  var all = this.allActionSuggestions;
  var remaining = [];

  for (var i = 0; i < all.length; i++) {
    if (shown.indexOf(all[i]) === -1) {
      remaining.push(all[i]);
    }
  }

  if (remaining.length === 0) {
    remaining = this.shuffleArray(all);
    this.shownActionSuggestions = [];
  } else {
    remaining = this.shuffleArray(remaining);
  }

  // Take 3 for display
  var recommended = remaining[0];
  var displayOthers = remaining.slice(1, 3);
  var displayItems = [recommended].concat(displayOthers);
  this.shownActionSuggestions = (this.shownActionSuggestions || []).concat(
    displayItems
  );

  var listContainer = document.querySelector(".ai-suggestions-list");
  if (!listContainer) return;

  var html = "";

  // Recommended first
  html +=
    '<div class="ai-suggestion-item ai-action-item ai-recommended ai-stagger-item" data-value="' +
    ERM.utils.escapeHtml(recommended) +
    '" style="animation-delay: 0.1s">' +
    '<input type="checkbox" class="action-checkbox" id="action-more-0" checked>' +
    '<label for="action-more-0" class="ai-suggestion-content">' +
    '<span class="ai-recommended-badge">⭐ Priority Action</span>' +
    '<span class="ai-suggestion-text">' +
    ERM.utils.escapeHtml(recommended) +
    "</span>" +
    "</label>" +
    "</div>";

  // Others with stagger
  for (var j = 0; j < displayOthers.length; j++) {
    var delay = (j + 2) * 0.1;
    html +=
      '<div class="ai-suggestion-item ai-action-item ai-stagger-item" data-value="' +
      ERM.utils.escapeHtml(displayOthers[j]) +
      '" style="animation-delay: ' +
      delay +
      's">' +
      '<input type="checkbox" class="action-checkbox" id="action-more-' +
      (j + 1) +
      '">' +
      '<label for="action-more-' +
      (j + 1) +
      '" class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(displayOthers[j]) +
      "</label>" +
      "</div>";
  }

  listContainer.innerHTML = html;
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

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-suggested review dates:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var dateValue = sug.date;
    var label = sug.label || "";
    var reason = sug.reason || "";
    var delay = (i + 1) * 0.12;
    var isRecommended = (i === recommendedIndex);

    // Format display date
    var displayDate = dateValue;
    try {
      var d = new Date(dateValue + "T00:00:00");
      displayDate = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {}

    content +=
      '<div class="ai-suggestion-item' +
      (isRecommended ? ' ai-recommended' : '') +
      ' ai-stagger-item clickable" data-value="' +
      ERM.utils.escapeHtml(dateValue) +
      '" style="animation-delay: ' + delay + 's">' +
      '<div class="ai-suggestion-content">' +
      (isRecommended ? '<span class="ai-recommended-badge">⭐ Recommended</span>' : '') +
      '<div>' +
      '<span class="ai-suggestion-text"><strong>' + ERM.utils.escapeHtml(label) + ' (' + displayDate + ')</strong></span>' +
      '<div class="text-muted" style="font-size: 12px; margin-top: 4px;">' + ERM.utils.escapeHtml(reason) + '</div>' +
      '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      '</div>';
  }

  content += '</div>';
  content += '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-generate-more-review-dates">✨ Generate More</button>';
  content += '</div>';

  ERM.components.showSecondaryModal({
    title: this.icons.sparkles + " AI Review Date Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function() {
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function() {
          var value = this.closest(".ai-suggestion-item").getAttribute("data-value");
          self.applyToField("risk-review-date", value);
          if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
            ERM.riskAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
        });
      }

      var items = document.querySelectorAll(".ai-suggestion-item.clickable");
      for (var k = 0; k < items.length; k++) {
        items[k].addEventListener("click", function(e) {
          if (e.target.classList.contains("btn-use")) return;
          var value = this.getAttribute("data-value");
          self.applyToField("risk-review-date", value);
          if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
            ERM.riskAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
        });
      }

      // Generate More button
      var moreBtn = document.getElementById("btn-generate-more-review-dates");
      if (moreBtn) {
        moreBtn.addEventListener("click", function() {
          ERM.components.closeSecondaryModal();
          var catEl = document.getElementById("risk-category");
          self.showReviewDateSuggestions(catEl ? catEl.value : "");
        });
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

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-suggested target completion dates:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var dateValue = sug.date;
    var label = sug.label || "";
    var reason = sug.reason || "";
    var delay = (i + 1) * 0.12;
    var isRecommended = (i === recommendedIndex);

    // Format display date
    var displayDate = dateValue;
    try {
      var d = new Date(dateValue + "T00:00:00");
      displayDate = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {}

    content +=
      '<div class="ai-suggestion-item' +
      (isRecommended ? ' ai-recommended' : '') +
      ' ai-stagger-item clickable" data-value="' +
      ERM.utils.escapeHtml(dateValue) +
      '" style="animation-delay: ' + delay + 's">' +
      '<div class="ai-suggestion-content">' +
      (isRecommended ? '<span class="ai-recommended-badge">⭐ Recommended</span>' : '') +
      '<div>' +
      '<span class="ai-suggestion-text"><strong>' + ERM.utils.escapeHtml(label) + ' (' + displayDate + ')</strong></span>' +
      '<div class="text-muted" style="font-size: 12px; margin-top: 4px;">' + ERM.utils.escapeHtml(reason) + '</div>' +
      '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      '</div>';
  }

  content += '</div>';
  content += '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-generate-more-dates">✨ Generate More</button>';
  content += '</div>';

  ERM.components.showSecondaryModal({
    title: this.icons.sparkles + " AI Target Date Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function() {
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function() {
          var value = this.closest(".ai-suggestion-item").getAttribute("data-value");
          self.applyToField("risk-target-date", value);
          if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
            ERM.riskAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
        });
      }

      var items = document.querySelectorAll(".ai-suggestion-item.clickable");
      for (var k = 0; k < items.length; k++) {
        items[k].addEventListener("click", function(e) {
          if (e.target.classList.contains("btn-use")) return;
          var value = this.getAttribute("data-value");
          self.applyToField("risk-target-date", value);
          if (ERM.riskAI.deepSeek && ERM.riskAI.deepSeek.onSuggestionUsed) {
            ERM.riskAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
        });
      }

      // Generate More button
      var moreBtn = document.getElementById("btn-generate-more-dates");
      if (moreBtn) {
        moreBtn.addEventListener("click", function() {
          ERM.components.closeSecondaryModal();
          var catEl = document.getElementById("risk-category");
          self.showTargetDateSuggestions(catEl ? catEl.value : "");
        });
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
  var self = this;

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-suggested inherent ' + fieldLabel.toLowerCase() + ' scores:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var score = typeof sug === "object" ? sug.score : sug;
    var reason = typeof sug === "object" ? sug.reason : null;
    var delay = (i + 1) * 0.12;
    var isRecommended = (i === recommendedIndex);

    content +=
      '<div class="ai-suggestion-item' +
      (isRecommended ? ' ai-recommended' : '') +
      ' ai-stagger-item clickable" data-value="' +
      score +
      '" style="animation-delay: ' + delay + 's">' +
      '<div class="ai-suggestion-content">' +
      (isRecommended ? '<span class="ai-recommended-badge">⭐ Recommended</span>' : '') +
      '<div>' +
      '<span class="ai-suggestion-text"><strong>Score: ' + score + '</strong></span>' +
      (reason ? '<div class="text-muted" style="font-size: 12px; margin-top: 4px;">' + ERM.utils.escapeHtml(reason) + '</div>' : '') +
      '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      '</div>';
  }

  content += '</div>';
  content += '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-generate-more-score">✨ Generate More</button>';
  content += '</div>';

  ERM.components.showSecondaryModal({
    title: this.icons.sparkles + " AI Inherent " + fieldLabel + " Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function() {
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function() {
          var value = this.closest(".ai-suggestion-item").getAttribute("data-value");
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
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Score applied");
        });
      }

      var items = document.querySelectorAll(".ai-suggestion-item.clickable");
      for (var k = 0; k < items.length; k++) {
        items[k].addEventListener("click", function(e) {
          if (e.target.classList.contains("btn-use")) return;
          var value = this.getAttribute("data-value");
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
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Score applied");
        });
      }

      // Generate More button
      var moreBtn = document.getElementById("btn-generate-more-score");
      if (moreBtn) {
        moreBtn.addEventListener("click", function() {
          ERM.components.closeSecondaryModal();
          var titleEl = document.getElementById("risk-title");
          var catEl = document.getElementById("risk-category");
          var isLikelihood = fieldId === "inherent-likelihood";
          self.showInherentScoreSuggestions(
            titleEl ? titleEl.value : "",
            catEl ? catEl.value : "",
            isLikelihood ? "inherentLikelihood" : "inherentImpact"
          );
        });
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
  var self = this;

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-suggested residual ' + fieldLabel.toLowerCase() + ' scores:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var score = typeof sug === "object" ? sug.score : sug;
    var reason = typeof sug === "object" ? sug.reason : null;
    var delay = (i + 1) * 0.12;
    var isRecommended = (i === recommendedIndex);

    content +=
      '<div class="ai-suggestion-item' +
      (isRecommended ? ' ai-recommended' : '') +
      ' ai-stagger-item clickable" data-value="' +
      score +
      '" style="animation-delay: ' + delay + 's">' +
      '<div class="ai-suggestion-content">' +
      (isRecommended ? '<span class="ai-recommended-badge">⭐ Recommended</span>' : '') +
      '<div>' +
      '<span class="ai-suggestion-text"><strong>Score: ' + score + '</strong></span>' +
      (reason ? '<div class="text-muted" style="font-size: 12px; margin-top: 4px;">' + ERM.utils.escapeHtml(reason) + '</div>' : '') +
      '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      '</div>';
  }

  content += '</div>';
  content += '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-generate-more-residual">✨ Generate More</button>';
  content += '</div>';

  ERM.components.showSecondaryModal({
    title: this.icons.sparkles + " AI Residual " + fieldLabel + " Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function() {
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function() {
          var value = this.closest(".ai-suggestion-item").getAttribute("data-value");
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
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Score applied");
        });
      }

      var items = document.querySelectorAll(".ai-suggestion-item.clickable");
      for (var k = 0; k < items.length; k++) {
        items[k].addEventListener("click", function(e) {
          if (e.target.classList.contains("btn-use")) return;
          var value = this.getAttribute("data-value");
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
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Score applied");
        });
      }

      // Generate More button
      var moreBtn = document.getElementById("btn-generate-more-residual");
      if (moreBtn) {
        moreBtn.addEventListener("click", function() {
          ERM.components.closeSecondaryModal();
          var titleEl = document.getElementById("risk-title");
          var catEl = document.getElementById("risk-category");
          var isLikelihood = fieldId === "residual-likelihood";
          self.showResidualScoreSuggestions(
            titleEl ? titleEl.value : "",
            catEl ? catEl.value : "",
            isLikelihood ? "residualLikelihood" : "residualImpact"
          );
        });
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
   TEMPLATE-BASED AI RISK BUILDER
   Uses industry templates for suggestions
   ======================================== */

/**
 * Track current selection for drill-down navigation
 */
ERM.riskAI.builderState = {
  departmentId: null,
  categoryId: null,
  riskId: null,
};

/**
 * Show AI Risk Builder (main entry point)
 * Search + common risks grid
 */
ERM.riskAI.showRiskBuilder = function () {
  var self = this;

  // Check if templates are loaded
  if (
    typeof ERM_TEMPLATES === "undefined" ||
    !ERM_TEMPLATES.loader ||
    !ERM_TEMPLATES.loader.hasTemplates()
  ) {
    this.showIndustrySelector();
    return;
  }

  var commonRisks = ERM_TEMPLATES.loader.getCommonRisks();
  var industryName = ERM_TEMPLATES.loader.getIndustryName();

  var content =
    '<div class="ai-risk-builder">' +
    '<div class="ai-search-box">' +
    '<input type="text" id="ai-risk-search" placeholder="🔍 Type to search risks..." autocomplete="off" />' +
    "</div>" +
    '<div id="ai-search-results" class="ai-search-results" style="display:none;"></div>' +
    '<div id="ai-common-risks" class="ai-common-risks">' +
    '<p class="ai-common-label">Common risks in ' +
    industryName +
    ":</p>" +
    '<div class="ai-common-grid">';

  var maxShow = Math.min(commonRisks.length, 8);
  for (var i = 0; i < maxShow; i++) {
    var risk = commonRisks[i];
    content +=
      '<div class="ai-common-card" data-risk="' +
      risk.id +
      '" data-category="' +
      risk.category +
      '">' +
      '<span class="ai-common-icon">' +
      (risk.icon || "⚠️") +
      "</span>" +
      '<span class="ai-common-label">' +
      risk.label +
      "</span>" +
      "</div>";
  }

  content +=
    "</div>" +
    '<a href="#" class="ai-see-all" id="ai-see-all-risks">Browse all risks by department →</a>' +
    "</div>" +
    "</div>";

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " AI Risk Builder",
    content: content,
    size: "lg",
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      var searchInput = document.getElementById("ai-risk-search");
      var searchResults = document.getElementById("ai-search-results");
      var commonRisksDiv = document.getElementById("ai-common-risks");

      // Focus search input
      if (searchInput) {
        searchInput.focus();
      }

      // Search functionality
      if (searchInput) {
        searchInput.addEventListener("input", function () {
          var query = this.value.trim();

          if (query.length < 2) {
            searchResults.style.display = "none";
            commonRisksDiv.style.display = "block";
            return;
          }

          var results = ERM_TEMPLATES.loader.searchRisks(query);

          if (results.length === 0) {
            searchResults.innerHTML =
              '<p class="ai-no-results">No matching risks found. Try different keywords or browse all risks.</p>';
          } else {
            var html = "";
            var maxResults = Math.min(results.length, 10);
            for (var j = 0; j < maxResults; j++) {
              html +=
                '<div class="ai-search-item" data-category="' +
                results[j].category +
                '" data-risk="' +
                (results[j].risk || "") +
                '">' +
                results[j].term +
                "</div>";
            }
            searchResults.innerHTML = html;

            // Bind click events
            var items = searchResults.querySelectorAll(".ai-search-item");
            for (var k = 0; k < items.length; k++) {
              items[k].addEventListener("click", function () {
                var catId = this.getAttribute("data-category");
                var riskId = this.getAttribute("data-risk");
                ERM.components.closeSecondaryModal();

                if (riskId) {
                  // Direct to risk
                  var riskData = ERM_TEMPLATES.loader.getRiskById(
                    catId,
                    riskId
                  );
                  if (riskData) {
                    self.showRiskPreview(riskData, catId);
                  } else {
                    self.showRiskSelectorForCategory(catId);
                  }
                } else {
                  // Show risks in category
                  self.showRiskSelectorForCategory(catId);
                }
              });
            }
          }

          searchResults.style.display = "block";
          commonRisksDiv.style.display = "none";
        });
      }

      // Common risk cards click
      var cards = document.querySelectorAll(".ai-common-card");
      for (var m = 0; m < cards.length; m++) {
        cards[m].addEventListener("click", function () {
          var riskId = this.getAttribute("data-risk");
          var catId = this.getAttribute("data-category");
          var riskData = ERM_TEMPLATES.loader.getRiskById(catId, riskId);

          ERM.components.closeSecondaryModal();

          if (riskData) {
            self.showRiskPreview(riskData, catId);
          }
        });
      }

      // See all link
      var seeAllLink = document.getElementById("ai-see-all-risks");
      if (seeAllLink) {
        seeAllLink.addEventListener("click", function (e) {
          e.preventDefault();
          ERM.components.closeSecondaryModal();
          self.builderState = {
            departmentId: null,
            categoryId: null,
            riskId: null,
          };
          self.showDepartmentSelector();
        });
      }
    },
  });
};

/**
 * Show Industry Selector (if no industry set)
 */
ERM.riskAI.showIndustrySelector = function () {
  var self = this;

  // Available industries (will grow as we add templates)
  var industries = [
    { id: "mining", name: "Mining & Resources", icon: "⛏️" },
    // { id: "banking", name: "Banking & Financial Services", icon: "🏦" },
    // { id: "public-sector", name: "Public Sector", icon: "🏛️" },
    // { id: "healthcare", name: "Healthcare", icon: "🏥" },
    // { id: "energy", name: "Energy & Utilities", icon: "⚡" }
    { id: "other", name: "Other / General", icon: "🏢" },
  ];

  var content =
    '<div class="ai-industry-selector">' +
    '<p style="margin: 0 0 16px; color: #6b7280;">Select your industry to get relevant AI suggestions:</p>' +
    '<div class="ai-industry-grid">';

  for (var i = 0; i < industries.length; i++) {
    var ind = industries[i];
    var isAvailable =
      typeof ERM_TEMPLATES !== "undefined" && ERM_TEMPLATES[ind.id];

    content +=
      '<div class="ai-industry-card' +
      (isAvailable ? "" : " disabled") +
      '" data-id="' +
      ind.id +
      '"' +
      (isAvailable ? "" : ' style="opacity: 0.5; cursor: not-allowed;"') +
      ">" +
      '<span class="ai-industry-icon">' +
      ind.icon +
      "</span>" +
      '<span class="ai-industry-name">' +
      ind.name +
      "</span>" +
      (isAvailable
        ? ""
        : '<span style="font-size: 10px; color: #9ca3af;">Coming soon</span>') +
      "</div>";
  }

  content += "</div>" + "</div>";

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Select Your Industry",
    content: content,
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      var cards = document.querySelectorAll(".ai-industry-card:not(.disabled)");
      for (var j = 0; j < cards.length; j++) {
        cards[j].addEventListener("click", function () {
          var industryId = this.getAttribute("data-id");

          // Set industry
          ERM_TEMPLATES.loader.setIndustry(industryId);

          ERM.components.closeSecondaryModal();

          // Show success message
          if (typeof ERM.toast !== "undefined") {
            ERM.toast.success(
              "Industry set to " + ERM_TEMPLATES.loader.getIndustryName()
            );
          }

          // Now show the risk builder
          setTimeout(function () {
            self.showRiskBuilder();
          }, 300);
        });
      }
    },
  });
};

/**
 * Show Department Selector (Step 1)
 */
ERM.riskAI.showDepartmentSelector = function () {
  var self = this;
  var departments = ERM_TEMPLATES.loader.getDepartments();

  if (!departments || departments.length === 0) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.warning(
        "No departments found. Please check industry templates."
      );
    }
    return;
  }

  var content = '<div class="ai-selector-grid">';

  for (var i = 0; i < departments.length; i++) {
    var dept = departments[i];
    var isIndustrySpecific = dept.type === "industry";

    content +=
      '<div class="ai-selector-card' +
      (isIndustrySpecific ? " industry-specific" : "") +
      '" data-id="' +
      dept.id +
      '">' +
      '<div class="ai-selector-name">' +
      dept.name +
      "</div>" +
      '<div class="ai-selector-desc">' +
      (dept.focus || "") +
      "</div>" +
      "</div>";
  }

  content += "</div>";

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Select Department",
    content: content,
    size: "lg",
    buttons: [
      { label: "← Back", type: "secondary", action: "back" },
      { label: "Cancel", type: "secondary", action: "close" },
    ],
    onAction: function (action) {
      if (action === "back") {
        ERM.components.closeSecondaryModal();
        setTimeout(function () {
          self.showRiskBuilder();
        }, 150);
      }
    },
    onOpen: function () {
      var cards = document.querySelectorAll(".ai-selector-card");
      for (var j = 0; j < cards.length; j++) {
        cards[j].addEventListener("click", function () {
          var deptId = this.getAttribute("data-id");
          self.builderState.departmentId = deptId;

          ERM.components.closeSecondaryModal();
          setTimeout(function () {
            self.showCategorySelector(deptId);
          }, 150);
        });
      }
    },
  });
};

/**
 * Show Category Selector (Step 2)
 */
ERM.riskAI.showCategorySelector = function (departmentId) {
  var self = this;
  var dept = ERM_TEMPLATES.loader.getDepartmentById(departmentId);
  var categories = ERM_TEMPLATES.loader.getCategories(departmentId);

  if (!categories || categories.length === 0) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.warning("No risk categories found for this department.");
    }
    return;
  }

  var content =
    '<div class="ai-breadcrumb">' +
    '<span class="ai-breadcrumb-item clickable" data-action="departments">Departments</span>' +
    '<span class="ai-breadcrumb-separator">›</span>' +
    '<span class="ai-breadcrumb-item active">' +
    (dept ? dept.name : departmentId) +
    "</span>" +
    "</div>" +
    '<div class="ai-selector-list">';

  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    content +=
      '<div class="ai-selector-item" data-id="' +
      cat.id +
      '">' +
      "<strong>" +
      cat.name +
      "</strong>" +
      "<p>" +
      (cat.description || "") +
      "</p>" +
      "</div>";
  }

  content += "</div>";

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Select Risk Category",
    content: content,
    size: "lg",
    buttons: [
      { label: "← Back", type: "secondary", action: "back" },
      { label: "Cancel", type: "secondary", action: "close" },
    ],
    onAction: function (action) {
      if (action === "back") {
        ERM.components.closeSecondaryModal();
        setTimeout(function () {
          self.showDepartmentSelector();
        }, 150);
      }
    },
    onOpen: function () {
      // Breadcrumb navigation
      var deptBreadcrumb = document.querySelector(
        '.ai-breadcrumb-item[data-action="departments"]'
      );
      if (deptBreadcrumb) {
        deptBreadcrumb.addEventListener("click", function () {
          ERM.components.closeSecondaryModal();
          setTimeout(function () {
            self.showDepartmentSelector();
          }, 150);
        });
      }

      // Category items
      var items = document.querySelectorAll(".ai-selector-item");
      for (var j = 0; j < items.length; j++) {
        items[j].addEventListener("click", function () {
          var catId = this.getAttribute("data-id");
          self.builderState.categoryId = catId;

          ERM.components.closeSecondaryModal();
          setTimeout(function () {
            self.showRiskSelectorForCategory(catId);
          }, 150);
        });
      }
    },
  });
};

/**
 * Show Risk Selector for a Category (Step 3)
 */
ERM.riskAI.showRiskSelectorForCategory = function (categoryId) {
  var self = this;
  var cat = ERM_TEMPLATES.loader.getCategoryById(categoryId);
  var risks = ERM_TEMPLATES.loader.getRisks(categoryId);

  if (!risks || risks.length === 0) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.warning("No AI suggestions found for this category.");
    }
    return;
  }

  var content =
    '<div class="ai-breadcrumb">' +
    '<span class="ai-breadcrumb-item clickable" data-action="departments">Departments</span>' +
    '<span class="ai-breadcrumb-separator">›</span>' +
    '<span class="ai-breadcrumb-item clickable" data-action="categories">' +
    (cat ? cat.name : categoryId) +
    "</span>" +
    '<span class="ai-breadcrumb-separator">›</span>' +
    '<span class="ai-breadcrumb-item active">Select Risk</span>' +
    "</div>" +
    '<div class="ai-selector-list">';

  for (var i = 0; i < risks.length; i++) {
    var risk = risks[i];
    var title = risk.titles ? risk.titles[0] : risk.title || "Untitled";

    content +=
      '<div class="ai-selector-item" data-id="' +
      risk.id +
      '" data-category="' +
      categoryId +
      '">' +
      "<strong>" +
      title +
      "</strong>" +
      "</div>";
  }

  content += "</div>";

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Select Risk",
    content: content,
    size: "lg",
    buttons: [
      { label: "← Back", type: "secondary", action: "back" },
      { label: "Cancel", type: "secondary", action: "close" },
    ],
    onAction: function (action) {
      if (action === "back") {
        ERM.components.closeSecondaryModal();
        setTimeout(function () {
          if (self.builderState.departmentId) {
            self.showCategorySelector(self.builderState.departmentId);
          } else {
            self.showDepartmentSelector();
          }
        }, 150);
      }
    },
    onOpen: function () {
      // Breadcrumb navigation
      var deptBreadcrumb = document.querySelector(
        '.ai-breadcrumb-item[data-action="departments"]'
      );
      if (deptBreadcrumb) {
        deptBreadcrumb.addEventListener("click", function () {
          ERM.components.closeSecondaryModal();
          setTimeout(function () {
            self.showDepartmentSelector();
          }, 150);
        });
      }

      var catBreadcrumb = document.querySelector(
        '.ai-breadcrumb-item[data-action="categories"]'
      );
      if (catBreadcrumb) {
        catBreadcrumb.addEventListener("click", function () {
          ERM.components.closeSecondaryModal();
          setTimeout(function () {
            if (self.builderState.departmentId) {
              self.showCategorySelector(self.builderState.departmentId);
            }
          }, 150);
        });
      }

      // Risk items
      var items = document.querySelectorAll(".ai-selector-item");
      for (var j = 0; j < items.length; j++) {
        items[j].addEventListener("click", function () {
          var riskId = this.getAttribute("data-id");
          var catId = this.getAttribute("data-category");
          var riskData = ERM_TEMPLATES.loader.getRiskById(catId, riskId);

          ERM.components.closeSecondaryModal();

          if (riskData) {
            setTimeout(function () {
              self.showRiskPreview(riskData, catId);
            }, 150);
          }
        });
      }
    },
  });
};

/**
 * Show Risk Preview before applying
 */
ERM.riskAI.showRiskPreview = function (riskData, categoryId) {
  var self = this;
  var title = riskData.titles
    ? riskData.titles[0]
    : riskData.title || "Untitled";
  var formCategory = ERM_TEMPLATES.loader.mapToFormCategory(categoryId);
  var treatment = riskData.treatment || {};

  var content =
    '<div class="ai-risk-preview">' +
    '<h4 class="ai-risk-preview-title">' +
    title +
    "</h4>" +
    '<div class="ai-risk-preview-meta">' +
    '<span class="ai-risk-preview-tag">' +
    formCategory +
    "</span>" +
    '<span class="ai-risk-preview-tag">' +
    (treatment.recommended
      ? treatment.recommended.charAt(0).toUpperCase() +
        treatment.recommended.slice(1)
      : "Mitigate") +
    "</span>" +
    "</div>";

  // Root Causes (limited to 3)
  if (riskData.rootCauses && riskData.rootCauses.length > 0) {
    content +=
      '<div class="ai-risk-preview-section">' + "<h5>Root Causes</h5>" + "<ul>";
    var maxCauses = Math.min(riskData.rootCauses.length, 3);
    for (var i = 0; i < maxCauses; i++) {
      content += "<li>" + riskData.rootCauses[i] + "</li>";
    }
    content += "</ul></div>";
  }

  // Consequences (limited to 3)
  if (riskData.consequences && riskData.consequences.length > 0) {
    content +=
      '<div class="ai-risk-preview-section">' +
      "<h5>Consequences</h5>" +
      "<ul>";
    var maxConseq = Math.min(riskData.consequences.length, 3);
    for (var j = 0; j < maxConseq; j++) {
      content += "<li>" + riskData.consequences[j] + "</li>";
    }
    content += "</ul></div>";
  }

  content += "</div>";

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Risk Preview",
    content: content,
    buttons: [
      { label: "← Back", type: "secondary", action: "back" },
      { label: "Use This Risk", type: "primary", action: "use" },
    ],
    onAction: function (action) {
      if (action === "back") {
        ERM.components.closeSecondaryModal();
        setTimeout(function () {
          self.showRiskSelectorForCategory(categoryId);
        }, 150);
      } else if (action === "use") {
        ERM.components.closeSecondaryModal();
        self.applyRiskTemplate(riskData, categoryId);
      }
    },
  });
};

/**
 * Apply selected risk template to form
 */
ERM.riskAI.applyRiskTemplate = function (riskData, categoryId) {
  var self = this;

  if (!riskData) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.error("No risk data to apply");
    }
    return;
  }

  var title = riskData.titles ? riskData.titles[0] : riskData.title || "";
  var formCategory = ERM_TEMPLATES.loader.mapToFormCategory(categoryId);

  // Apply title
  this.applyToField("risk-title", title);

  // Apply category
  this.applyToField("risk-category", formCategory);

  // Generate description
  var description = "Risk of " + title.toLowerCase();
  if (riskData.consequences && riskData.consequences.length > 0) {
    description +=
      " which may result in " + riskData.consequences[0].toLowerCase();
  }
  description += ".";
  this.applyToField("risk-description", description);

  // Apply root causes (limited to 3)
  if (riskData.rootCauses && riskData.rootCauses.length > 0) {
    this.applyListItems("risk-root-causes", riskData.rootCauses.slice(0, 3));
  }

  // Apply consequences (limited to 3)
  if (riskData.consequences && riskData.consequences.length > 0) {
    this.applyListItems("risk-consequences", riskData.consequences.slice(0, 3));
  }

  // Apply treatment
  if (riskData.treatment && riskData.treatment.recommended) {
    var treatmentMap = {
      accept: "Accept",
      avoid: "Avoid",
      transfer: "Transfer",
      mitigate: "Mitigate",
    };
    var treatmentValue =
      treatmentMap[riskData.treatment.recommended] || "Mitigate";
    this.applyToField("risk-treatment", treatmentValue);
  }

  // Apply scoring
  if (riskData.scoring) {
    if (riskData.scoring.inherentLikelihood) {
      this.applyToField(
        "inherent-likelihood",
        String(riskData.scoring.inherentLikelihood)
      );
    }
    if (riskData.scoring.inherentImpact) {
      this.applyToField(
        "inherent-impact",
        String(riskData.scoring.inherentImpact)
      );
    }
    if (riskData.scoring.residualLikelihood) {
      this.applyToField(
        "residual-likelihood",
        String(riskData.scoring.residualLikelihood)
      );
    }
    if (riskData.scoring.residualImpact) {
      this.applyToField(
        "residual-impact",
        String(riskData.scoring.residualImpact)
      );
    }

    // Trigger score calculation
    if (
      typeof ERM.riskRegister !== "undefined" &&
      ERM.riskRegister.calculateScores
    ) {
      ERM.riskRegister.calculateScores();
    }
  }

  // Apply owners
  if (riskData.owners) {
    if (riskData.owners.riskOwner && riskData.owners.riskOwner.length > 0) {
      this.applyToField("risk-owner", riskData.owners.riskOwner[0]);
    }
    if (riskData.owners.actionOwner && riskData.owners.actionOwner.length > 0) {
      this.applyToField("action-owner", riskData.owners.actionOwner[0]);
    }
  }

  // Apply timing
  if (riskData.timing) {
    var today = new Date();

    if (riskData.timing.targetDate) {
      var targetDate = new Date(today);
      var targetValue = riskData.timing.targetDate.value || 3;
      var targetUnit = riskData.timing.targetDate.unit || "months";

      if (targetUnit === "days") {
        targetDate.setDate(targetDate.getDate() + targetValue);
      } else if (targetUnit === "weeks") {
        targetDate.setDate(targetDate.getDate() + targetValue * 7);
      } else if (targetUnit === "months") {
        targetDate.setMonth(targetDate.getMonth() + targetValue);
      } else if (targetUnit === "years") {
        targetDate.setFullYear(targetDate.getFullYear() + targetValue);
      }

      this.applyToField("target-date", this.formatDateForInput(targetDate));
    }

    if (riskData.timing.reviewDate) {
      var reviewDate = new Date(today);
      var reviewValue = riskData.timing.reviewDate.value || 1;
      var reviewUnit = riskData.timing.reviewDate.unit || "months";

      if (reviewUnit === "days") {
        reviewDate.setDate(reviewDate.getDate() + reviewValue);
      } else if (reviewUnit === "weeks") {
        reviewDate.setDate(reviewDate.getDate() + reviewValue * 7);
      } else if (reviewUnit === "months") {
        reviewDate.setMonth(reviewDate.getMonth() + reviewValue);
      } else if (reviewUnit === "years") {
        reviewDate.setFullYear(reviewDate.getFullYear() + reviewValue);
      }

      this.applyToField("review-date", this.formatDateForInput(reviewDate));
    }
  }

  // Store selected template for field-level suggestions
  this.selectedTemplate = {
    riskData: riskData,
    categoryId: categoryId,
  };

  // Show success
  if (typeof ERM.toast !== "undefined") {
    ERM.toast.success("AI suggestion applied - review and save");
  }
};

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
      '<button type="button" class="list-input-remove" onclick="this.parentElement.remove()">×</button>' +
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
      content += '<div class="ai-treatment-badge">⭐ RECOMMENDED</div>';
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

  ERM.components.showSecondaryModal({
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
          self.applyToField("risk-treatment", value);
          ERM.components.closeSecondaryModal();
        });
      }
    },
  });
};

window.ERM = ERM;
console.log("risk-register-ai-ui.js loaded successfully");

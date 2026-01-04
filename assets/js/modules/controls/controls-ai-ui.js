/**
 * Dimeri ERM - Controls AI UI
 * User interface components for AI control suggestions
 *
 * @version 1.0.0
 * ES5 Compatible
 */

console.log("Loading controls-ai-ui.js...");

var ERM = window.ERM || {};
ERM.controlsAI = ERM.controlsAI || {};

/* ========================================
   TEMPLATE COMPATIBILITY HELPERS
   Supports both old format (name, description, owner)
   and new format (titles[], descriptions[], owners{})
   ======================================== */

/**
 * Get display name from control template
 */
ERM.controlsAI.getControlName = function(control) {
  if (control.titles && control.titles.length > 0) {
    return control.titles[0];
  }
  return control.name || "Unnamed Control";
};

/**
 * Get display description from control template
 */
ERM.controlsAI.getControlDescription = function(control) {
  if (control.descriptions && control.descriptions.length > 0) {
    return control.descriptions[0];
  }
  return control.description || "";
};

/**
 * Get all name variations for matching
 */
ERM.controlsAI.getAllControlNames = function(control) {
  if (control.titles && control.titles.length > 0) {
    return control.titles;
  }
  return control.name ? [control.name] : [];
};

/**
 * Get owner for display
 * Intelligently selects most relevant owner based on context
 */
ERM.controlsAI.getControlOwner = function(control, userInput) {
  // If control already has a single owner set, use it
  if (control.owner && typeof control.owner === "string") {
    return control.owner;
  }

  // If no owners array, return default
  if (!control.owners || !control.owners.primary || control.owners.primary.length === 0) {
    return "Unassigned";
  }

  var primaryOwners = control.owners.primary;

  // If only one owner, return it
  if (primaryOwners.length === 1) {
    return primaryOwners[0];
  }

  // If user input provided, try to match owner from input
  if (userInput && typeof userInput === "string") {
    var inputLower = userInput.toLowerCase();

    // Check for owner mentions in user input
    for (var i = 0; i < primaryOwners.length; i++) {
      var owner = primaryOwners[i];
      var ownerLower = owner.toLowerCase();

      // Extract key terms from owner (e.g., "CFO" from "Chief Financial Officer")
      var ownerTerms = [];

      // Add full owner name
      ownerTerms.push(ownerLower);

      // Add acronyms (e.g., "cfo" from "Chief Financial Officer")
      var words = owner.split(/\s+/);
      if (words.length > 1) {
        var acronym = "";
        for (var w = 0; w < words.length; w++) {
          if (words[w].length > 0) {
            acronym += words[w][0].toLowerCase();
          }
        }
        ownerTerms.push(acronym);
      }

      // Add key words (e.g., "financial", "treasury")
      ownerTerms.push(ownerLower.replace(/\s+/g, ""));

      // Check if any owner term appears in user input
      for (var t = 0; t < ownerTerms.length; t++) {
        if (inputLower.indexOf(ownerTerms[t]) !== -1) {
          return owner;
        }
      }
    }
  }

  // Default: return first primary owner
  return primaryOwners[0];
};

/* ========================================
   UNIVERSAL TEMPLATE SYSTEM
   Works with any industry: mining, healthcare, banking, etc.
   All industries share same structure, different content
   ======================================== */

/**
 * Get current industry from workspace settings
 */
ERM.controlsAI.getCurrentIndustry = function() {
  // 1. Try localStorage (set during onboarding)
  var industry = localStorage.getItem("ERM_industry");
  if (industry) {
    return industry;
  }

  // 2. Try workspace settings
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

  // 3. Try ERM state
  if (
    typeof ERM.state !== "undefined" &&
    ERM.state.organization &&
    ERM.state.organization.industry
  ) {
    return ERM.state.organization.industry;
  }

  // 4. Default fallback
  return "mining";
};

/**
 * Check if templates are available for current industry
 */
ERM.controlsAI.hasTemplates = function() {
  var industry = this.getCurrentIndustry();

  if (!window.ERM.controlTemplates || !window.ERM.controlTemplates.loader) {
    console.warn("Control template loader not found");
    return false;
  }

  var loader = window.ERM.controlTemplates.loader;
  loader.setIndustry(industry);

  var controls = loader.getAllControls();
  return controls && controls.length > 0;
};

/**
 * Get all control templates - starts with current industry, silently expands to all industries
 * User requested: "eventually must go to the next closest industry/keywords/title/description etc"
 * But do it behind the scene (don't tell user)
 */
ERM.controlsAI.getAllTemplateControls = function() {
  if (!window.ERM.controlTemplates || !window.ERM.controlTemplates.loader) {
    return [];
  }

  var loader = window.ERM.controlTemplates.loader;
  var currentIndustry = this.getCurrentIndustry();
  var allControls = [];

  // Start with current industry
  loader.setIndustry(currentIndustry);
  var currentIndustryControls = loader.getAllControls() || [];
  allControls = allControls.concat(currentIndustryControls);

  // Silently expand to other industries for comprehensive search
  var availableIndustries = loader.getAvailableIndustries();
  for (var i = 0; i < availableIndustries.length; i++) {
    var industryId = availableIndustries[i].id;
    if (industryId !== currentIndustry) {
      loader.setIndustry(industryId);
      var industryControls = loader.getAllControls() || [];
      allControls = allControls.concat(industryControls);
    }
  }

  // Reset back to current industry
  loader.setIndustry(currentIndustry);

  return allControls;
};

/**
 * Match user input to control templates
 */
ERM.controlsAI.matchUserInput = function(userInput) {
  if (!userInput || !userInput.trim()) {
    return [];
  }

  if (!window.ERM.controlTemplates || !window.ERM.controlTemplates.loader) {
    return [];
  }

  var industry = this.getCurrentIndustry();
  var loader = window.ERM.controlTemplates.loader;
  loader.setIndustry(industry);

  return loader.matchUserInput(userInput) || [];
};

/**
 * Suggest controls for a risk description
 */
ERM.controlsAI.suggestControlsForRisk = function(riskDescription) {
  if (!riskDescription || !riskDescription.trim()) {
    return [];
  }

  if (!window.ERM.controlTemplates || !window.ERM.controlTemplates.loader) {
    return [];
  }

  var industry = this.getCurrentIndustry();
  var loader = window.ERM.controlTemplates.loader;
  loader.setIndustry(industry);

  return loader.suggestControlsForRisk(riskDescription) || [];
};

/* ========================================
   AI NATURAL LANGUAGE INPUT
   ======================================== */

/**
 * Show AI natural language input modal
 * Used in Control Library "Add Control" flow
 */
ERM.controlsAI.showNaturalLanguageInput = function(options) {
  var self = this;
  options = options || {};
  var useSecondaryModal = options.useSecondaryModal || false;

  // Check if templates available
  if (!this.hasTemplates()) {
    ERM.toast.warning("AI control suggestions not available for your industry");
    return;
  }

  var content =
    '<div class="nl-input-container">' +
    '<div class="nl-input-header">' +
    '<div class="nl-input-icon">' +
    ERM.icons.sparkles +
    "</div>" +
    '<div class="nl-input-intro">' +
    "<h4>Describe the Control</h4>" +
    "<p>Describe what the control does in plain language. AI will suggest matching templates.</p>" +
    "</div>" +
    "</div>" +
    '<div class="nl-input-field">' +
    '<textarea id="ai-control-input" class="form-textarea" rows="4" placeholder="E.g., Daily inspection of haul trucks before each shift to check brakes, tires, and safety equipment..." autofocus></textarea>' +
    "</div>" +
    '<div class="nl-input-examples">' +
    '<p class="nl-examples-label">Examples:</p>' +
    '<div class="nl-examples-list">' +
    '<button type="button" class="nl-example-btn" data-example="Daily inspection of mobile equipment for safety defects">Daily equipment safety inspection</button>' +
    '<button type="button" class="nl-example-btn" data-example="Weekly monitoring of pit wall stability and ground movement">Pit wall stability monitoring</button>' +
    '<button type="button" class="nl-example-btn" data-example="Water quality testing before discharge to environment">Discharge water quality testing</button>' +
    "</div>" +
    "</div>" +
    "</div>";

  var modalConfig = {
    title: ERM.icons.sparkles + " AI Control Creation",
    content: content,
    size: "md",
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Generate Suggestions", type: "primary", action: "generate" }
    ],
    onOpen: function() {
      // Bind example buttons
      var exampleBtns = document.querySelectorAll(".nl-example-btn");
      for (var i = 0; i < exampleBtns.length; i++) {
        exampleBtns[i].addEventListener("click", function() {
          var example = this.getAttribute("data-example");
          document.getElementById("ai-control-input").value = example;
          document.getElementById("ai-control-input").focus();
        });
      }

      // Auto-focus textarea
      var textarea = document.getElementById("ai-control-input");
      if (textarea) {
        textarea.focus();
      }
    },
    onAction: function(action) {
      if (action === "generate") {
        var input = document.getElementById("ai-control-input").value.trim();
        if (!input) {
          ERM.toast.error("Please describe the control first");
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

        // Close appropriate modal
        if (useSecondaryModal) {
          ERM.components.closeSecondaryModal();
        } else {
          ERM.components.closeModal();
        }

        // Store callback and modal preference for later use
        self._pendingOnSelect = options.onSelect;
        self._useSecondaryModal = useSecondaryModal;

        // Use DeepSeek-powered parseNaturalLanguageControl
        self.parseNaturalLanguageControl(input);
      }
    }
  };

  // Use secondary modal if requested (keeps risk form open)
  if (useSecondaryModal) {
    ERM.components.showSecondaryModal(modalConfig);
  } else {
    ERM.components.showModal(modalConfig);
  }
};

/**
 * Show AI thinking modal
 * Uses the same design pattern as "Describe with AI" thinking modal
 * @param {Boolean} useSecondaryModal - If true, use secondary modal (keeps risk form open)
 */
ERM.controlsAI.showAIThinking = function(useSecondaryModal) {
  var steps = [
    { text: "Analyzing your description", delay: 600 },
    { text: "Searching control database", delay: 600 },
    { text: "Matching keywords", delay: 600 },
    { text: "Generating suggestions", delay: 600 }
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
    "<h3>AI is finding controls</h3>" +
    "</div>" +
    '<div class="ai-steps-container">' +
    stepsHtml +
    "</div>" +
    "</div>";

  var modalConfig = {
    title: "",
    content: content,
    size: "sm",
    buttons: [],
    showCloseButton: false,
    onOpen: function() {
      // Style the modal to match ai-thinking-modal pattern
      var modalSelector = useSecondaryModal ? ".secondary-overlay .modal" : ".modal";
      var modal = document.querySelector(modalSelector);
      var modalHeader = document.querySelector(modalSelector.replace(".modal", ".modal-header"));
      var modalBody = document.querySelector(modalSelector.replace(".modal", ".modal-body"));
      var modalFooter = document.querySelector(modalSelector.replace(".modal", ".modal-footer"));
      var modalContent = document.querySelector(modalSelector.replace(".modal", ".modal-content"));

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

      // Animate steps sequentially
      var stepSelector = useSecondaryModal ? '.secondary-overlay .ai-step[data-step="' : '.ai-step[data-step="';

      function animateStep(stepIndex) {
        if (stepIndex >= steps.length) {
          return; // Animation complete
        }

        var stepEl = document.querySelector(stepSelector + stepIndex + '"]');
        if (stepEl) {
          stepEl.classList.add("active");

          setTimeout(function() {
            stepEl.classList.remove("active");
            stepEl.classList.add("complete");
            animateStep(stepIndex + 1);
          }, steps[stepIndex].delay);
        } else {
          animateStep(stepIndex + 1);
        }
      }

      // Start animation after brief delay
      setTimeout(function() {
        animateStep(0);
      }, 300);
    }
  };

  // Use secondary modal if requested (keeps risk form open)
  if (useSecondaryModal) {
    ERM.components.showSecondaryModal(modalConfig);
  } else {
    ERM.components.showModal(modalConfig);
  }
};

/**
 * Show AI control suggestions
 * @param {String} userInput - The user's natural language input
 * @param {Function} onSelectCallback - Callback when template is selected
 * @param {Boolean} useSecondaryModal - If true, use secondary modal (keeps risk form open)
 */
ERM.controlsAI.showSuggestions = function(userInput, onSelectCallback, useSecondaryModal) {
  var self = this;

  // Get matches
  var matches = this.matchUserInput(userInput);

  if (matches.length === 0) {
    ERM.toast.info("No AI suggestions found. You can create a custom control.");
    // Fall back to manual control creation
    if (typeof ERM.controls !== "undefined") {
      // Use secondary modal if requested
      if (useSecondaryModal) {
        var newControl = {
          reference: ERM.controls.getNextControlNumber(),
          name: "",
          description: [],
          type: "",
          category: "",
          owner: "",
          effectiveness: "notTested",
          status: "planned",
          lastReviewDate: "",
          nextReviewDate: "",
          linkedRisks: []
        };
        ERM.controls.showControlForm(newControl, false, true);
      } else {
        ERM.controls.showAddModal();
      }
    }
    return;
  }

  // Build suggestions HTML
  var suggestionsHtml = "";
  var limit = Math.min(3, matches.length); // Show 3 like Risk AI

  for (var i = 0; i < limit; i++) {
    var match = matches[i];
    var control = match.control;
    var score = match.score;
    var matchPercent = Math.min(95, Math.max(60, score));

    // Get type label
    var typeLabel = control.type || "N/A";
    var typeMap = {
      preventive: "Preventive",
      detective: "Detective",
      corrective: "Corrective",
      directive: "Directive"
    };
    if (typeMap[control.type]) {
      typeLabel = typeMap[control.type];
    }

    // Truncate description
    var desc = control.description || "";
    if (desc.length > 150) {
      desc = desc.substring(0, 150) + "...";
    }

    suggestionsHtml +=
      '<div class="ai-control-suggestion" data-control-index="' +
      i +
      '">' +
      '<div class="suggestion-header">' +
      '<div class="suggestion-title-row">' +
      '<h4 class="suggestion-title">' +
      ERM.utils.escapeHtml(self.getControlName(control)) +
      "</h4>" +
      '<span class="match-badge">' +
      matchPercent +
      "% match</span>" +
      "</div>" +
      '<div class="suggestion-meta">' +
      '<span class="badge badge-type-' +
      (control.type || "default") +
      '">' +
      typeLabel +
      "</span>" +
      '<span class="suggestion-dept">' +
      ERM.utils.escapeHtml(control.department || "General") +
      "</span>" +
      "</div>" +
      "</div>" +
      '<p class="suggestion-desc">' +
      ERM.utils.escapeHtml(desc) +
      "</p>" +
      '<div class="suggestion-keywords">' +
      '<span class="keywords-label">Matched keywords:</span>' +
      (match.matchedKeywords || [])
        .slice(0, 4)
        .map(function(kw) {
          return '<span class="keyword-tag">' + ERM.utils.escapeHtml(kw) + "</span>";
        })
        .join("") +
      "</div>" +
      '<div class="suggestion-actions">' +
      '<button type="button" class="btn btn-sm btn-secondary view-full-btn" data-control-index="' +
      i +
      '">View Full Details</button>' +
      '<button type="button" class="btn btn-sm btn-primary use-template-btn" data-control-index="' +
      i +
      '">Use This Template</button>' +
      "</div>" +
      "</div>";
  }

  var generateMoreBtn = matches.length > 3
    ? '<div class="generate-more-container">' +
      '<button type="button" class="btn btn-sm btn-secondary" id="generate-more-controls">Generate More Suggestions</button>' +
      '<p class="generate-more-hint">' +
      (matches.length - 3) +
      ' more control templates available</p>' +
      "</div>"
    : "";

  var content =
    '<div class="ai-suggestions-container">' +
    '<div class="suggestions-intro">' +
    '<div class="intro-icon">' +
    ERM.icons.sparkles +
    "</div>" +
    '<div class="intro-text">' +
    "<h4>AI Suggestions</h4>" +
    "<p>Found " +
    matches.length +
    " matching control templates. Select one to customize or create manually.</p>" +
    "</div>" +
    "</div>" +
    '<div class="ai-suggestions-list" id="ai-suggestions-list">' +
    suggestionsHtml +
    "</div>" +
    generateMoreBtn +
    "</div>";

  var modalConfig = {
    title: "Control Template Suggestions",
    content: content,
    size: "lg",
    buttons: [
      { label: "Create Manually", type: "secondary", action: "manual" },
      { label: "Close", type: "secondary", action: "close" }
    ],
    onOpen: function() {
      // Store matches in modal context
      self.currentMatches = matches;
      self.currentShownCount = limit;

      // Bind view full buttons
      var viewBtns = document.querySelectorAll(".view-full-btn");
      for (var i = 0; i < viewBtns.length; i++) {
        viewBtns[i].addEventListener("click", function() {
          var index = parseInt(this.getAttribute("data-control-index"), 10);
          self.showTemplateDetails(matches[index], useSecondaryModal);
        });
      }

      // Bind use template buttons
      var useBtns = document.querySelectorAll(".use-template-btn");
      for (var j = 0; j < useBtns.length; j++) {
        useBtns[j].addEventListener("click", function() {
          var index = parseInt(this.getAttribute("data-control-index"), 10);
          self.useTemplate(matches[index].control, onSelectCallback, useSecondaryModal);
        });
      }

      // Bind generate more button
      var generateMoreBtn = document.getElementById("generate-more-controls");
      if (generateMoreBtn) {
        generateMoreBtn.addEventListener("click", function() {
          self.generateMoreSuggestions(matches, onSelectCallback, useSecondaryModal);
        });
      }
    },
    onAction: function(action) {
      if (action === "manual") {
        // Close appropriate modal
        if (useSecondaryModal) {
          ERM.components.closeSecondaryModal();
        } else {
          ERM.components.closeModal();
        }

        if (typeof ERM.controls !== "undefined") {
          // Use secondary modal if requested
          if (useSecondaryModal) {
            var newControl = {
              reference: ERM.controls.getNextControlNumber(),
              name: "",
              description: [],
              type: "",
              category: "",
              owner: "",
              effectiveness: "notTested",
              status: "planned",
              lastReviewDate: "",
              nextReviewDate: "",
              linkedRisks: []
            };
            ERM.controls.showControlForm(newControl, false, true);
          } else {
            ERM.controls.showAddModal();
          }
        }
      }
    }
  };

  // Use secondary modal if requested (keeps risk form open)
  if (useSecondaryModal) {
    ERM.components.showSecondaryModal(modalConfig);
  } else {
    ERM.components.showModal(modalConfig);
  }
};

/**
 * Show template full details
 */
ERM.controlsAI.showTemplateDetails = function(match) {
  var control = match.control;

  // Get type label
  var typeMap = {
    preventive: "Preventive",
    detective: "Detective",
    corrective: "Corrective",
    directive: "Directive"
  };
  var typeLabel = typeMap[control.type] || control.type || "N/A";

  // Get category label
  var categoryMap = {
    policy: "Policy & Procedure",
    manual: "Manual Control",
    automated: "Automated/IT Control",
    physical: "Physical Control",
    segregation: "Segregation of Duties",
    monitoring: "Monitoring & Review"
  };
  var categoryLabel = categoryMap[control.category] || control.category || "N/A";

  var content =
    '<div class="template-details">' +
    '<div class="template-header">' +
    "<h3>" +
    ERM.utils.escapeHtml(self.getControlName(control)) +
    "</h3>" +
    '<div class="template-meta">' +
    '<span class="badge badge-type-' +
    (control.type || "default") +
    '">' +
    typeLabel +
    "</span>" +
    '<span class="template-category">' +
    categoryLabel +
    "</span>" +
    "</div>" +
    "</div>" +
    '<div class="template-body">' +
    '<div class="template-section">' +
    "<h4>Description</h4>" +
    "<p>" +
    ERM.utils.escapeHtml(control.description || "No description available") +
    "</p>" +
    "</div>" +
    '<div class="template-section">' +
    "<h4>Details</h4>" +
    "<table class=\"detail-table\">" +
    "<tr><td>Department:</td><td>" +
    ERM.utils.escapeHtml(control.department || "N/A") +
    "</td></tr>" +
    "<tr><td>Category:</td><td>" +
    ERM.utils.escapeHtml(control.controlCategory || "N/A") +
    "</td></tr>" +
    "<tr><td>Frequency:</td><td>" +
    ERM.utils.escapeHtml(control.frequency || "N/A") +
    "</td></tr>" +
    "<tr><td>Typical Owner:</td><td>" +
    ERM.utils.escapeHtml(control.owner || "N/A") +
    "</td></tr>" +
    "<tr><td>Expected Effectiveness:</td><td>" +
    ERM.utils.escapeHtml(control.effectiveness || "N/A") +
    "</td></tr>" +
    "</table>" +
    "</div>" +
    '<div class="template-section">' +
    "<h4>Keywords</h4>" +
    '<div class="keyword-tags">' +
    (control.keywords || [])
      .map(function(kw) {
        return '<span class="keyword-tag">' + ERM.utils.escapeHtml(kw) + "</span>";
      })
      .join("") +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";

  ERM.components.showSecondaryModal({
    title: "Template Details",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }]
  });
};

/**
 * Use a template to create a control
 * @param {Object} template - The control template to use
 * @param {Function} onSelectCallback - Callback when template is selected
 * @param {Boolean} useSecondaryModal - If true, use secondary modal (keeps risk form open)
 */
ERM.controlsAI.useTemplate = function(template, onSelectCallback, useSecondaryModal) {
  // Close appropriate modals
  if (useSecondaryModal) {
    ERM.components.closeSecondaryModal();
  } else {
    ERM.components.closeModal();
    ERM.components.closeSecondaryModal();
  }

  // Create control from template
  var newControl = {
    reference: ERM.controls.getNextControlNumber(),
    name: template.name,
    description: template.description,
    type: template.type,
    category: template.category,
    owner: template.owner || "",
    effectiveness: template.effectiveness || "notTested",
    status: "planned",
    lastReviewDate: "",
    nextReviewDate: "",
    linkedRisks: []
  };

  // Add pending risk link if exists
  if (this.pendingRiskLink) {
    newControl.linkedRisks = [this.pendingRiskLink];
  }

  // If callback provided, use it
  if (typeof onSelectCallback === "function") {
    onSelectCallback(newControl);
  } else {
    // Otherwise show control form
    if (typeof ERM.controls !== "undefined") {
      ERM.controls.showControlForm(newControl, false, useSecondaryModal);
    }
  }

  ERM.toast.success("AI suggestion loaded - review and save");
};

/**
 * Quick AI suggestion button (for inline use)
 * Used in "Linked Controls" section of Risk form
 */
ERM.controlsAI.showQuickSuggest = function(riskDescription, onSelectCallback) {
  var self = this;

  if (!riskDescription || !riskDescription.trim()) {
    ERM.toast.warning("Please enter a risk description first");
    return;
  }

  // Show thinking
  this.showAIThinking();

  // Simulate processing
  setTimeout(function() {
    ERM.components.closeModal();

    // Get suggestions
    var suggestions = self.suggestControlsForRisk(riskDescription);

    if (suggestions.length === 0) {
      ERM.toast.info("No matching controls found for this risk");
      return;
    }

    // Show suggestions
    self.showQuickSuggestionsList(suggestions, onSelectCallback);
  }, 1500);
};

/**
 * Show quick suggestions list (simplified version)
 */
ERM.controlsAI.showQuickSuggestionsList = function(suggestions, onSelectCallback) {
  var self = this;
  var limit = Math.min(5, suggestions.length);

  var listHtml = "";
  for (var i = 0; i < limit; i++) {
    var match = suggestions[i];
    var control = match.control;
    var matchPercent = Math.min(95, Math.max(60, match.score));

    listHtml +=
      '<div class="quick-suggestion-item" data-index="' +
      i +
      '">' +
      '<div class="quick-suggestion-header">' +
      '<div class="quick-suggestion-title">' +
      ERM.utils.escapeHtml(self.getControlName(control)) +
      "</div>" +
      '<span class="match-badge-sm">' +
      matchPercent +
      "%</span>" +
      "</div>" +
      '<div class="quick-suggestion-desc">' +
      ERM.utils.escapeHtml(
        control.description.length > 100
          ? control.description.substring(0, 100) + "..."
          : control.description
      ) +
      "</div>" +
      '<button type="button" class="btn btn-sm btn-primary quick-use-btn" data-index="' +
      i +
      '">Use This Control</button>' +
      "</div>";
  }

  var content =
    '<div class="quick-suggestions">' +
    '<p class="quick-intro">Found ' +
    suggestions.length +
    " controls that might mitigate this risk:</p>" +
    '<div class="quick-suggestions-list">' +
    listHtml +
    "</div>" +
    "</div>";

  ERM.components.showSecondaryModal({
    title: ERM.icons.sparkles + " AI Control Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function() {
      var useBtns = document.querySelectorAll(".quick-use-btn");
      for (var i = 0; i < useBtns.length; i++) {
        useBtns[i].addEventListener("click", function() {
          var index = parseInt(this.getAttribute("data-index"), 10);
          self.useTemplate(suggestions[index].control, onSelectCallback);
        });
      }
    }
  });
};

/**
 * Generate more suggestions
 * Shows next 3 controls from the match list
 */
/**
 * Generate more suggestions (show next batch)
 * @param {Array} matches - All matched controls
 * @param {Function} onSelectCallback - Callback when template is selected
 * @param {Boolean} useSecondaryModal - If true, use secondary modal (keeps risk form open)
 */
ERM.controlsAI.generateMoreSuggestions = function(matches, onSelectCallback, useSecondaryModal) {
  var self = this;
  var currentCount = this.currentShownCount || 3;
  var nextCount = Math.min(currentCount + 3, matches.length);

  // Build HTML for new suggestions
  var newSuggestionsHtml = "";
  for (var i = currentCount; i < nextCount; i++) {
    var match = matches[i];
    var control = match.control;
    var score = match.score;
    var matchPercent = Math.min(95, Math.max(60, score));

    // Get type label
    var typeLabel = control.type || "N/A";
    var typeMap = {
      preventive: "Preventive",
      detective: "Detective",
      corrective: "Corrective",
      directive: "Directive"
    };
    if (typeMap[control.type]) {
      typeLabel = typeMap[control.type];
    }

    // Truncate description
    var desc = control.description || "";
    if (desc.length > 150) {
      desc = desc.substring(0, 150) + "...";
    }

    newSuggestionsHtml +=
      '<div class="ai-control-suggestion" data-control-index="' +
      i +
      '" style="opacity:0;">' +
      '<div class="suggestion-header">' +
      '<div class="suggestion-title-row">' +
      '<h4 class="suggestion-title">' +
      ERM.utils.escapeHtml(self.getControlName(control)) +
      "</h4>" +
      '<span class="match-badge">' +
      matchPercent +
      "% match</span>" +
      "</div>" +
      '<div class="suggestion-meta">' +
      '<span class="badge badge-type-' +
      (control.type || "default") +
      '">' +
      typeLabel +
      "</span>" +
      '<span class="suggestion-dept">' +
      ERM.utils.escapeHtml(control.department || "General") +
      "</span>" +
      "</div>" +
      "</div>" +
      '<p class="suggestion-desc">' +
      ERM.utils.escapeHtml(desc) +
      "</p>" +
      '<div class="suggestion-keywords">' +
      '<span class="keywords-label">Matched keywords:</span>' +
      (match.matchedKeywords || [])
        .slice(0, 4)
        .map(function(kw) {
          return '<span class="keyword-tag">' + ERM.utils.escapeHtml(kw) + "</span>";
        })
        .join("") +
      "</div>" +
      '<div class="suggestion-actions">' +
      '<button type="button" class="btn btn-sm btn-secondary view-full-btn" data-control-index="' +
      i +
      '">View Full Details</button>' +
      '<button type="button" class="btn btn-sm btn-primary use-template-btn" data-control-index="' +
      i +
      '">Use This Template</button>' +
      "</div>" +
      "</div>";
  }

  // Append to list
  var listContainer = document.getElementById("ai-suggestions-list");
  if (listContainer) {
    var tempDiv = document.createElement("div");
    tempDiv.innerHTML = newSuggestionsHtml;

    while (tempDiv.firstChild) {
      var newItem = tempDiv.firstChild;
      listContainer.appendChild(newItem);

      // Animate in
      setTimeout((function(item) {
        return function() {
          item.style.transition = "opacity 0.3s ease";
          item.style.opacity = "1";
        };
      })(newItem), 50);

      // Bind events for new items
      var viewBtn = newItem.querySelector(".view-full-btn");
      if (viewBtn) {
        viewBtn.addEventListener("click", function() {
          var index = parseInt(this.getAttribute("data-control-index"), 10);
          self.showTemplateDetails(matches[index], useSecondaryModal);
        });
      }

      var useBtn = newItem.querySelector(".use-template-btn");
      if (useBtn) {
        useBtn.addEventListener("click", function() {
          var index = parseInt(this.getAttribute("data-control-index"), 10);
          self.useTemplate(matches[index].control, onSelectCallback, useSecondaryModal);
        });
      }
    }
  }

  // Update counter
  this.currentShownCount = nextCount;

  // Update or remove generate more button
  var generateMoreContainer = document.querySelector(".generate-more-container");
  if (generateMoreContainer) {
    if (nextCount >= matches.length) {
      // Remove button - all shown
      generateMoreContainer.remove();
    } else {
      // Update count
      var hint = generateMoreContainer.querySelector(".generate-more-hint");
      if (hint) {
        hint.textContent = (matches.length - nextCount) + " more control templates available";
      }
    }
  }

  ERM.toast.success("Loaded " + (nextCount - currentCount) + " more suggestions");
};

/* ========================================
   RISK-CONTROL LINKING FUNCTIONS
   Bidirectional linking system
   ======================================== */

/**
 * Link a control to a risk (updates both sides)
 */
ERM.controlsAI.linkControlToRisk = function(controlId, riskId) {
  var controls = ERM.storage.get("controls") || [];
  var risks = ERM.storage.get("risks") || [];

  // Update control's linkedRisks
  for (var i = 0; i < controls.length; i++) {
    if (controls[i].id === controlId) {
      if (!controls[i].linkedRisks) controls[i].linkedRisks = [];
      if (controls[i].linkedRisks.indexOf(riskId) === -1) {
        controls[i].linkedRisks.push(riskId);
      }
      break;
    }
  }

  // Update risk's linkedControls
  for (var j = 0; j < risks.length; j++) {
    if (risks[j].id === riskId) {
      if (!risks[j].linkedControls) risks[j].linkedControls = [];
      if (risks[j].linkedControls.indexOf(controlId) === -1) {
        risks[j].linkedControls.push(controlId);
      }
      break;
    }
  }

  ERM.storage.set("controls", controls);
  ERM.storage.set("risks", risks);
};

/**
 * Unlink a control from a risk (updates both sides)
 */
ERM.controlsAI.unlinkControlFromRisk = function(controlId, riskId) {
  var controls = ERM.storage.get("controls") || [];
  var risks = ERM.storage.get("risks") || [];

  // Remove from control's linkedRisks
  for (var i = 0; i < controls.length; i++) {
    if (controls[i].id === controlId && controls[i].linkedRisks) {
      var idx = controls[i].linkedRisks.indexOf(riskId);
      if (idx !== -1) controls[i].linkedRisks.splice(idx, 1);
      break;
    }
  }

  // Remove from risk's linkedControls
  for (var j = 0; j < risks.length; j++) {
    if (risks[j].id === riskId && risks[j].linkedControls) {
      var idx2 = risks[j].linkedControls.indexOf(controlId);
      if (idx2 !== -1) risks[j].linkedControls.splice(idx2, 1);
      break;
    }
  }

  ERM.storage.set("controls", controls);
  ERM.storage.set("risks", risks);

  ERM.toast.success("Control unlinked from risk");
};

/**
 * Get linked risks for a control (with full details)
 */
ERM.controlsAI.getLinkedRisks = function(controlId) {
  var controls = ERM.storage.get("controls") || [];
  var risks = ERM.storage.get("risks") || [];
  var linkedRisks = [];

  // Find control
  var control = null;
  for (var i = 0; i < controls.length; i++) {
    if (controls[i].id === controlId) {
      control = controls[i];
      break;
    }
  }

  if (!control || !control.linkedRisks) return [];

  // Get full risk objects
  for (var j = 0; j < control.linkedRisks.length; j++) {
    var riskId = control.linkedRisks[j];
    for (var k = 0; k < risks.length; k++) {
      if (risks[k].id === riskId) {
        linkedRisks.push(risks[k]);
        break;
      }
    }
  }

  return linkedRisks;
};

/**
 * Get linked controls for a risk (with full details)
 */
ERM.controlsAI.getLinkedControls = function(riskId) {
  var controls = ERM.storage.get("controls") || [];
  var risks = ERM.storage.get("risks") || [];
  var linkedControls = [];

  // Find risk
  var risk = null;
  for (var i = 0; i < risks.length; i++) {
    if (risks[i].id === riskId) {
      risk = risks[i];
      break;
    }
  }

  if (!risk || !risk.linkedControls) return [];

  // Get full control objects
  for (var j = 0; j < risk.linkedControls.length; j++) {
    var controlId = risk.linkedControls[j];
    for (var k = 0; k < controls.length; k++) {
      if (controls[k].id === controlId) {
        linkedControls.push(controls[k]);
        break;
      }
    }
  }

  return linkedControls;
};

/* ========================================
   RISK-CONTROL AI MATCHING
   AI functions for finding controls that mitigate risks
   ======================================== */

/**
 * Find controls that mitigate a specific risk
 * Called when user is on Risk form and wants control suggestions
 *
 * @param {string} riskTitle - The risk title
 * @param {string} riskCategory - The risk category (e.g., "ground-control")
 * @param {array} riskKeywords - Keywords from the risk
 * @returns {array} Sorted array of matching controls with scores
 */
ERM.controlsAI.findControlsForRisk = function(riskTitle, riskCategory, riskKeywords) {
  if (!window.ERM.controlTemplates || !window.ERM.controlTemplates.loader) {
    console.warn("Control templates not loaded");
    return [];
  }

  var loader = window.ERM.controlTemplates.loader;
  var allControls = loader.getAllControls();
  var matches = [];

  if (!riskKeywords) riskKeywords = [];

  // Normalize inputs
  var riskTitleLower = riskTitle ? riskTitle.toLowerCase() : "";
  var riskCategoryLower = riskCategory ? riskCategory.toLowerCase() : "";

  // Score each control template
  for (var i = 0; i < allControls.length; i++) {
    var control = allControls[i];
    var score = 0;
    var matchReasons = [];

    // Category matching: +20 if control mitigates this risk category
    if (control.mitigatesRiskCategories && riskCategoryLower) {
      for (var j = 0; j < control.mitigatesRiskCategories.length; j++) {
        if (control.mitigatesRiskCategories[j].toLowerCase() === riskCategoryLower) {
          score += 20;
          matchReasons.push("Category match: " + riskCategory);
          break;
        }
      }
    }

    // Keyword matching: +10 for each keyword match
    if (control.mitigatesRiskKeywords && riskKeywords.length > 0) {
      for (var k = 0; k < control.mitigatesRiskKeywords.length; k++) {
        var controlKeyword = control.mitigatesRiskKeywords[k].toLowerCase();
        for (var m = 0; m < riskKeywords.length; m++) {
          if (riskKeywords[m].toLowerCase() === controlKeyword) {
            score += 10;
            matchReasons.push("Keyword: " + riskKeywords[m]);
            break;
          }
        }
      }
    }

    // Title word matching: +5 for each word match
    if (riskTitleLower) {
      var titleWords = riskTitleLower.split(/\s+/);
      var controlNames = self.getAllControlNames(control);
      var controlNamesLower = controlNames.map(function(n) { return n.toLowerCase(); }).join(" ");
      var controlDescLower = self.getControlDescription(control).toLowerCase();

      for (var n = 0; n < titleWords.length; n++) {
        var word = titleWords[n];
        if (word.length > 3) {
          // Skip short words
          if (controlNamesLower.indexOf(word) !== -1) {
            score += 5;
            matchReasons.push("Title word: " + word);
          } else if (controlDescLower.indexOf(word) !== -1) {
            score += 3;
          }
        }
      }
    }

    // Only include controls with some relevance
    if (score > 0) {
      matches.push({
        control: control,
        score: score,
        matchReasons: matchReasons,
        matchType: "risk-mitigation"
      });
    }
  }

  // Sort by score descending
  matches.sort(function(a, b) {
    return b.score - a.score;
  });

  return matches;
};

/**
 * Find risks that a control mitigates
 * Called when user is on Control form and wants risk suggestions
 *
 * @param {string} controlTitle - The control title
 * @param {array} mitigatesCategories - Risk categories this control addresses
 * @param {array} mitigatesKeywords - Risk keywords this control addresses
 * @returns {array} Sorted array of matching risks with scores
 */
ERM.controlsAI.findRisksForControl = function(
  controlTitle,
  mitigatesCategories,
  mitigatesKeywords
) {
  var risks = ERM.storage.get("risks") || [];
  var matches = [];

  if (!mitigatesCategories) mitigatesCategories = [];
  if (!mitigatesKeywords) mitigatesKeywords = [];

  var controlTitleLower = controlTitle ? controlTitle.toLowerCase() : "";

  // Score each risk
  for (var i = 0; i < risks.length; i++) {
    var risk = risks[i];
    var score = 0;
    var matchReasons = [];

    // Category matching: +20 if categories match
    if (risk.category) {
      var riskCategoryLower = risk.category.toLowerCase();
      for (var j = 0; j < mitigatesCategories.length; j++) {
        if (mitigatesCategories[j].toLowerCase() === riskCategoryLower) {
          score += 20;
          matchReasons.push("Category: " + risk.category);
          break;
        }
      }
    }

    // Keyword matching: +10 for keyword in risk title/description
    var riskText = (risk.title + " " + (risk.description || "")).toLowerCase();
    for (var k = 0; k < mitigatesKeywords.length; k++) {
      var keyword = mitigatesKeywords[k].toLowerCase();
      if (riskText.indexOf(keyword) !== -1) {
        score += 10;
        matchReasons.push("Keyword: " + mitigatesKeywords[k]);
      }
    }

    // Title word matching: +5 for each word match
    if (controlTitleLower && risk.title) {
      var controlWords = controlTitleLower.split(/\s+/);
      var riskTitleLower = risk.title.toLowerCase();

      for (var m = 0; m < controlWords.length; m++) {
        var word = controlWords[m];
        if (word.length > 3 && riskTitleLower.indexOf(word) !== -1) {
          score += 5;
          matchReasons.push("Title word: " + word);
        }
      }
    }

    // Only include risks with some relevance
    if (score > 0) {
      matches.push({
        risk: risk,
        score: score,
        matchReasons: matchReasons,
        matchType: "control-mitigation"
      });
    }
  }

  // Sort by score descending
  matches.sort(function(a, b) {
    return b.score - a.score;
  });

  return matches;
};

/**
 * Analyze control coverage for a risk
 * Checks what types of controls are already linked to a risk
 *
 * @param {string} riskId - Risk ID to analyze
 * @returns {object} Analysis of control coverage
 */
ERM.controlsAI.analyzeControlCoverage = function(riskId) {
  var linkedControls = this.getLinkedControls(riskId);

  var coverage = {
    total: linkedControls.length,
    preventive: 0,
    detective: 0,
    corrective: 0,
    directive: 0,
    hasPreventive: false,
    hasDetective: false,
    hasCorrective: false,
    hasDirective: false,
    gaps: []
  };

  // Count control types
  for (var i = 0; i < linkedControls.length; i++) {
    var type = linkedControls[i].type;
    if (type === "preventive") {
      coverage.preventive++;
      coverage.hasPreventive = true;
    } else if (type === "detective") {
      coverage.detective++;
      coverage.hasDetective = true;
    } else if (type === "corrective") {
      coverage.corrective++;
      coverage.hasCorrective = true;
    } else if (type === "directive") {
      coverage.directive++;
      coverage.hasDirective = true;
    }
  }

  // Identify gaps
  if (!coverage.hasPreventive) {
    coverage.gaps.push("No preventive controls");
  }
  if (!coverage.hasDetective) {
    coverage.gaps.push("No detective controls");
  }
  if (!coverage.hasCorrective) {
    coverage.gaps.push("No corrective controls");
  }

  return coverage;
};

/**
 * Score existing controls in library for a risk
 * Used to suggest importing controls from library
 *
 * @param {string} riskId - Risk ID
 * @returns {array} Existing controls sorted by relevance
 */
ERM.controlsAI.scoreExistingControls = function(riskId) {
  var risks = ERM.storage.get("risks") || [];
  var controls = ERM.storage.get("controls") || [];

  // Find the risk
  var risk = null;
  for (var i = 0; i < risks.length; i++) {
    if (risks[i].id === riskId) {
      risk = risks[i];
      break;
    }
  }

  if (!risk) return [];

  // Get risk info for matching
  var riskKeywords = [];
  if (risk.title) {
    riskKeywords = risk.title.toLowerCase().split(/\s+/);
  }

  var matches = [];

  // Score each existing control
  for (var j = 0; j < controls.length; j++) {
    var control = controls[j];
    var score = 0;

    // Skip if already linked
    if (risk.linkedControls && risk.linkedControls.indexOf(control.id) !== -1) {
      continue;
    }

    // Category match
    if (risk.category && control.category === risk.category) {
      score += 15;
    }

    // Keyword matching in name/description
    var controlText = (self.getControlName(control) + " " + self.getControlDescription(control)).toLowerCase();
    for (var k = 0; k < riskKeywords.length; k++) {
      if (riskKeywords[k].length > 3 && controlText.indexOf(riskKeywords[k]) !== -1) {
        score += 5;
      }
    }

    if (score > 0) {
      matches.push({
        control: control,
        score: score,
        matchType: "existing-control"
      });
    }
  }

  // Sort by score
  matches.sort(function(a, b) {
    return b.score - a.score;
  });

  return matches;
};

/**
 * Balance control types for suggestions
 * Ensures a mix of preventive, detective, corrective controls
 *
 * @param {array} matches - Array of control matches
 * @param {object} coverage - Current coverage analysis
 * @param {number} limit - Number of suggestions to return
 * @returns {array} Balanced selection of controls
 */
ERM.controlsAI._balanceControlTypes = function(matches, coverage, limit) {
  if (!matches || matches.length === 0) return [];
  if (!limit) limit = 5;

  var result = [];
  var remaining = matches.slice(); // Copy array

  // Prioritize missing types
  var priorities = [];
  if (!coverage.hasPreventive) priorities.push("preventive");
  if (!coverage.hasDetective) priorities.push("detective");
  if (!coverage.hasCorrective) priorities.push("corrective");

  // First pass: get one of each missing type
  for (var i = 0; i < priorities.length && result.length < limit; i++) {
    var type = priorities[i];
    for (var j = 0; j < remaining.length; j++) {
      if (remaining[j].control.type === type) {
        result.push(remaining[j]);
        remaining.splice(j, 1);
        break;
      }
    }
  }

  // Second pass: fill remaining slots with highest scores
  while (result.length < limit && remaining.length > 0) {
    result.push(remaining.shift());
  }

  return result;
};

/* ========================================
   AI FIELD HELPERS
   Individual field AI suggestions
   ======================================== */

/**
 * AI Suggest Control Name
 */
ERM.controlsAI.suggestControlName = function() {
  var description = document.getElementById("control-description");
  if (!description || !description.value.trim()) {
    ERM.toast.warning("Please enter a description first");
    return;
  }

  var matches = this.matchUserInput(description.value);
  if (matches.length === 0) {
    ERM.toast.info("No AI suggestions available");
    return;
  }

  // Get name suggestions - include all title variations from top matches
  var suggestions = [];
  for (var i = 0; i < Math.min(3, matches.length); i++) {
    var control = matches[i].control;
    var names = this.getAllControlNames(control);
    // Add all title variations from this control
    for (var j = 0; j < names.length && suggestions.length < 10; j++) {
      if (suggestions.indexOf(names[j]) === -1) { // Avoid duplicates
        suggestions.push(names[j]);
      }
    }
    if (suggestions.length >= 10) break; // Limit to 10 total suggestions
  }

  this.showFieldSuggestions("Control Name", suggestions, function(selected) {
    document.getElementById("control-name").value = selected;
    document.getElementById("control-name").classList.add("ai-filled");
    setTimeout(function() {
      document.getElementById("control-name").classList.remove("ai-filled");
    }, 500);
  });
};

/**
 * AI Suggest Description
 */
ERM.controlsAI.suggestControlDescription = function() {
  var name = document.getElementById("control-name");
  if (!name || !name.value.trim()) {
    ERM.toast.warning("Please enter a control name first");
    return;
  }

  var matches = this.matchUserInput(name.value);
  if (matches.length === 0) {
    ERM.toast.info("No AI suggestions available");
    return;
  }

  // Get description suggestions - include all description variations from top matches
  var suggestions = [];
  for (var i = 0; i < Math.min(3, matches.length); i++) {
    var control = matches[i].control;
    if (control.descriptions && control.descriptions.length > 0) {
      // Add all description variations from this control
      for (var j = 0; j < control.descriptions.length && suggestions.length < 10; j++) {
        if (suggestions.indexOf(control.descriptions[j]) === -1) { // Avoid duplicates
          suggestions.push(control.descriptions[j]);
        }
      }
    } else if (control.description) {
      // Fallback to old format
      if (suggestions.indexOf(control.description) === -1) {
        suggestions.push(control.description);
      }
    }
    if (suggestions.length >= 10) break;
  }

  this.showFieldSuggestions("Control Description", suggestions, function(selected) {
    document.getElementById("control-description").value = selected;
    document.getElementById("control-description").classList.add("ai-filled");
    setTimeout(function() {
      document.getElementById("control-description").classList.remove("ai-filled");
    }, 500);
  });
};

/**
 * AI Suggest Control Type
 */
ERM.controlsAI.suggestControlType = function() {
  var description = document.getElementById("control-description");
  var name = document.getElementById("control-name");

  var text = "";
  if (description && description.value.trim()) {
    text = description.value;
  } else if (name && name.value.trim()) {
    text = name.value;
  }

  if (!text) {
    ERM.toast.warning("Please enter a name or description first");
    return;
  }

  if (!window.ERM.controlTemplates || !window.ERM.controlTemplates.loader) {
    ERM.toast.warning("AI suggestions not available");
    return;
  }

  var loader = window.ERM.controlTemplates.loader;
  var typeSuggestion = loader.suggestControlType(text);

  if (!typeSuggestion || !typeSuggestion.type) {
    ERM.toast.info("No type suggestion available");
    return;
  }

  var typeMap = {
    preventive: "Preventive",
    detective: "Detective",
    corrective: "Corrective",
    directive: "Directive"
  };

  var typeName = typeMap[typeSuggestion.type] || typeSuggestion.type;
  var confidence = typeSuggestion.confidence || 0;

  ERM.toast.success("Suggested: " + typeName + " (" + confidence + "% confidence)");

  var typeSelect = document.getElementById("control-type");
  if (typeSelect) {
    typeSelect.value = typeSuggestion.type;
    typeSelect.classList.add("ai-filled");
    setTimeout(function() {
      typeSelect.classList.remove("ai-filled");
    }, 500);
  }
};

/**
 * AI Suggest Category
 */
ERM.controlsAI.suggestControlCategory = function() {
  var description = document.getElementById("control-description");
  var name = document.getElementById("control-name");

  var text = "";
  if (description && description.value.trim()) {
    text = description.value;
  } else if (name && name.value.trim()) {
    text = name.value;
  }

  if (!text) {
    ERM.toast.warning("Please enter a name or description first");
    return;
  }

  var matches = this.matchUserInput(text);
  if (matches.length === 0) {
    ERM.toast.info("No category suggestions available");
    return;
  }

  // Get unique categories from top matches
  var categories = [];
  var categoryMap = {
    policy: "Policy & Procedure",
    manual: "Manual Control",
    automated: "Automated/IT Control",
    physical: "Physical Control",
    segregation: "Segregation of Duties",
    monitoring: "Monitoring & Review"
  };

  for (var i = 0; i < Math.min(5, matches.length); i++) {
    var cat = matches[i].control.category;
    if (cat && categories.indexOf(cat) === -1) {
      categories.push(cat);
    }
  }

  if (categories.length === 0) {
    ERM.toast.info("No category suggestions available");
    return;
  }

  // Use most common category
  var suggested = categories[0];
  var categoryLabel = categoryMap[suggested] || suggested;

  ERM.toast.success("Suggested: " + categoryLabel);

  var categorySelect = document.getElementById("control-category");
  if (categorySelect) {
    categorySelect.value = suggested;
    categorySelect.classList.add("ai-filled");
    setTimeout(function() {
      categorySelect.classList.remove("ai-filled");
    }, 500);
  }
};

/**
 * AI Suggest Owner
 */
ERM.controlsAI.suggestControlOwner = function() {
  var description = document.getElementById("control-description");
  var name = document.getElementById("control-name");

  var text = "";
  if (description && description.value.trim()) {
    text = description.value;
  } else if (name && name.value.trim()) {
    text = name.value;
  }

  if (!text) {
    ERM.toast.warning("Please enter a name or description first");
    return;
  }

  var matches = this.matchUserInput(text);
  if (matches.length === 0) {
    ERM.toast.info("No owner suggestions available");
    return;
  }

  // Get unique owners from top matches
  var owners = [];
  for (var i = 0; i < Math.min(5, matches.length); i++) {
    var owner = matches[i].control.owner;
    if (owner && owners.indexOf(owner) === -1) {
      owners.push(owner);
    }
  }

  if (owners.length === 0) {
    ERM.toast.info("No owner suggestions available");
    return;
  }

  this.showFieldSuggestions("Control Owner", owners.slice(0, 3), function(selected) {
    document.getElementById("control-owner").value = selected;
    document.getElementById("control-owner").classList.add("ai-filled");
    setTimeout(function() {
      document.getElementById("control-owner").classList.remove("ai-filled");
    }, 500);
  });
};

/**
 * Show field suggestions modal
 */
ERM.controlsAI.showFieldSuggestions = function(fieldName, suggestions, onSelect) {
  var suggestionsHtml = "";
  for (var i = 0; i < suggestions.length; i++) {
    suggestionsHtml +=
      '<div class="field-suggestion-item" data-index="' +
      i +
      '">' +
      '<div class="field-suggestion-text">' +
      ERM.utils.escapeHtml(suggestions[i].length > 200 ? suggestions[i].substring(0, 200) + "..." : suggestions[i]) +
      "</div>" +
      '<button type="button" class="btn btn-sm btn-primary use-suggestion-btn" data-index="' +
      i +
      '">Use This</button>' +
      "</div>";
  }

  var content =
    '<div class="field-suggestions-container">' +
    '<p class="field-suggestions-intro">Select a suggestion for <strong>' +
    ERM.utils.escapeHtml(fieldName) +
    "</strong>:</p>" +
    '<div class="field-suggestions-list">' +
    suggestionsHtml +
    "</div>" +
    "</div>";

  ERM.components.showSecondaryModal({
    title: ERM.icons.sparkles + " AI Suggestions",
    content: content,
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function() {
      var useBtns = document.querySelectorAll(".use-suggestion-btn");
      for (var i = 0; i < useBtns.length; i++) {
        useBtns[i].addEventListener("click", function() {
          var index = parseInt(this.getAttribute("data-index"), 10);
          ERM.components.closeSecondaryModal();
          onSelect(suggestions[index]);
        });
      }
    }
  });
};

/* ========================================
   FIELD-LEVEL AI SUGGESTIONS
   Matching risk register pattern
   ======================================== */

/**
 * Icons for AI UI - matching risk register
 */
ERM.controlsAI.icons = {
  sparkles: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>'
};

/**
 * Main entry point for field suggestions with thinking animation
 * Matches risk register pattern EXACTLY - with persistent spinners
 */
ERM.controlsAI.handleFieldSuggest = function (fieldType) {
  var self = this;

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

  // Define thinking messages for each field - MATCHES RISK REGISTER
  var thinkingMessages = {
    name: "Generating titles...",
    description: "Crafting description...",
    type: "Detecting control type...",
    category: "Suggesting category...",
    owner: "Matching roles...",
    linkedRisks: "Analyzing risks...",
    effectiveness: "Assessing effectiveness...",
    status: "Determining status...",
    nextReviewDate: "Calculating review schedule...",
    frequency: "Determining frequency...",
    evidence: "Suggesting documents..."
  };

  var message = thinkingMessages[fieldType] || "Thinking...";
  var btn = document.querySelector('.btn-ai-suggest[data-field="' + fieldType + '"]');

  // Start persistent spinner (will be cleared when DeepSeek responds or fallback completes)
  if (btn) {
    self.currentThinkingButton = btn;
    self.currentThinkingOriginalHtml = btn.innerHTML;
    btn.classList.add("ai-thinking-btn");
    btn.innerHTML = '<span class="ai-thinking-content">' + this.icons.sparkles + " " + message + "</span>";
    btn.disabled = true;
  }

  // Show field suggestions (spinner stays until async operation completes)
  self.showFieldSuggestions(fieldType);
};

/**
 * Clear thinking button spinner
 * Called when DeepSeek responds or fallback completes
 */
ERM.controlsAI.clearThinkingButton = function() {
  if (this.currentThinkingButton) {
    this.currentThinkingButton.classList.remove("ai-thinking-btn");
    this.currentThinkingButton.innerHTML = this.currentThinkingOriginalHtml || (ERM.controlsAI.icons.sparkles + " AI");
    this.currentThinkingButton.disabled = false;
    this.currentThinkingButton = null;
    this.currentThinkingOriginalHtml = null;
  }
};

/**
 * Show field suggestions (called after thinking animation)
 */
ERM.controlsAI.showFieldSuggestions = function (fieldType) {
  var controlName = this.getFormValue("control-name");
  var controlType = this.getFormValue("control-type");
  var controlCategory = this.getFormValue("control-category");

  switch (fieldType) {
    case "name":
      this.showNameSuggestions(controlType, controlCategory);
      break;
    case "description":
      this.showDescriptionSuggestions(controlName, controlType);
      break;
    case "type":
      this.showTypeSuggestions(controlName);
      break;
    case "category":
      this.showCategorySuggestions(controlName, controlType);
      break;
    case "owner":
      this.showOwnerSuggestions(controlType, controlCategory);
      break;
    case "linkedRisks":
      this.showLinkedRisksSuggestions(controlName);
      break;
    case "effectiveness":
      this.showEffectivenessSuggestions(controlName, controlType);
      break;
    case "status":
      this.showStatusSuggestions(controlName, controlType);
      break;
    case "nextReviewDate":
      this.showNextReviewDateSuggestions(controlType, controlCategory);
      break;
    case "frequency":
      this.showFrequencySuggestions(controlType, controlCategory);
      break;
    case "evidence":
      this.showEvidenceSuggestions(controlName, controlType, controlCategory);
      break;
    default:
      ERM.toast.info("AI suggestions coming soon for: " + fieldType);
  }
};

/**
 * Get form value helper
 */
ERM.controlsAI.getFormValue = function (elementId) {
  var el = document.getElementById(elementId);
  return el ? el.value : "";
};

/**
 * Get full control form context including linked risks
 * Used by frequency, next review date, and type suggestions for context-aware recommendations
 */
ERM.controlsAI.getFullControlContext = function() {
  var context = {
    name: this.getFormValue("control-name"),
    description: this.getFormValue("control-description"),
    type: this.getFormValue("control-type"),
    category: this.getFormValue("control-category"),
    owner: this.getFormValue("control-owner"),
    effectiveness: this.getFormValue("control-effectiveness"),
    status: this.getFormValue("control-status"),
    linkedRisks: []
  };

  // Get linked risks from checked checkboxes
  var checkboxes = document.querySelectorAll('input[type="checkbox"][data-risk-id]:checked');
  var allRisks = (typeof ERM.riskRegister !== 'undefined' && ERM.riskRegister.getAllRisks)
    ? ERM.riskRegister.getAllRisks()
    : [];

  for (var i = 0; i < checkboxes.length; i++) {
    var riskId = checkboxes[i].getAttribute('data-risk-id');
    if (riskId) {
      // Find full risk data
      for (var j = 0; j < allRisks.length; j++) {
        if (allRisks[j].id === riskId) {
          var risk = allRisks[j];
          context.linkedRisks.push({
            id: risk.id,
            title: risk.title || 'Untitled Risk',
            category: risk.category || '',
            inherentScore: risk.inherentScore || 0,
            residualScore: risk.residualScore || 0,
            reviewDate: risk.reviewDate || '',
            targetDate: risk.targetDate || '',
            status: risk.status || ''
          });
          break;
        }
      }
    }
  }

  return context;
};

/**
 * Find matching control template - matches risk register pattern
 */
ERM.controlsAI.findMatchingControlTemplate = function (searchText, type) {
  if (!searchText) return null;

  var allControls = this.getAllTemplateControls();
  if (!allControls || allControls.length === 0) return null;

  var searchTerms = searchText.toLowerCase().split(/\s+/);
  var bestMatch = null;
  var bestScore = 0;

  for (var i = 0; i < allControls.length; i++) {
    var control = allControls[i];
    var score = 0;

    // Score based on title matches
    if (control.titles) {
      for (var t = 0; t < control.titles.length; t++) {
        var title = control.titles[t].toLowerCase();
        for (var s = 0; s < searchTerms.length; s++) {
          if (title.indexOf(searchTerms[s]) !== -1) {
            score += 10;
          }
        }
      }
    }

    // Score based on keyword matches
    if (control.keywords) {
      for (var k = 0; k < control.keywords.length; k++) {
        var keyword = control.keywords[k].toLowerCase();
        for (var s = 0; s < searchTerms.length; s++) {
          if (keyword.indexOf(searchTerms[s]) !== -1) {
            score += 5;
          }
        }
      }
    }

    // Score based on plain language matches
    if (control.plainLanguage) {
      for (var p = 0; p < control.plainLanguage.length; p++) {
        var plain = control.plainLanguage[p].toLowerCase();
        for (var s = 0; s < searchTerms.length; s++) {
          if (plain.indexOf(searchTerms[s]) !== -1) {
            score += 15;
          }
        }
      }
    }

    // Bonus if type matches
    if (type && control.type === type) {
      score += 20;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = control;
    }
  }

  return bestMatch;
};

/**
 * Get control name suggestions based on user input
 * Matches risk register getTitleSuggestions() pattern
 */
ERM.controlsAI.getControlNameSuggestions = function (userText, type, category) {
  var suggestions = [];

  var allControls = this.getAllTemplateControls();
  if (!allControls || allControls.length === 0) {
    return suggestions;
  }

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
      "control",
      "controls",
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
      "about"
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
      // Score each control by how well it matches
      var scored = [];

      for (var i = 0; i < allControls.length; i++) {
        var control = allControls[i];
        var score = 0;
        var matchedTerms = 0;

        // For each search term, check if it matches this control
        for (var mt = 0; mt < meaningfulTerms.length; mt++) {
          var term = meaningfulTerms[mt];
          var termMatched = false;
          var isShortTerm = term.length <= 3;

          // Check id
          if (control.id) {
            var idParts = control.id.toLowerCase().split("-");
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
          if (control.keywords) {
            for (var k = 0; k < control.keywords.length; k++) {
              var keywordPhrase = control.keywords[k].toLowerCase();
              var keywordWords = keywordPhrase.split(/\s+/);

              for (var kw = 0; kw < keywordWords.length; kw++) {
                var word = keywordWords[kw];
                if (isShortTerm) {
                  if (word === term) {
                    score += 15;
                    termMatched = true;
                    break;
                  }
                } else {
                  if (word === term) {
                    score += 15;
                    termMatched = true;
                    break;
                  } else if (
                    word.indexOf(term) === 0 ||
                    term.indexOf(word) === 0
                  ) {
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
          if (control.titles) {
            for (var t = 0; t < control.titles.length; t++) {
              var titleWords = control.titles[t].toLowerCase().split(/\s+/);

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
                  } else if (
                    tWord.indexOf(term) === 0 ||
                    term.indexOf(tWord) === 0
                  ) {
                    score += 6;
                    termMatched = true;
                  } else if (tWord.length > 3 && tWord.indexOf(term) !== -1) {
                    score += 3;
                    termMatched = true;
                  }
                }
              }
            }
          }

          // Check plainLanguage - same word splitting logic
          if (control.plainLanguage) {
            for (var p = 0; p < control.plainLanguage.length; p++) {
              var plainWords = control.plainLanguage[p].toLowerCase().split(/\s+/);

              for (var pw = 0; pw < plainWords.length; pw++) {
                var pWord = plainWords[pw];
                if (isShortTerm) {
                  if (pWord === term) {
                    score += 25;
                    termMatched = true;
                    break;
                  }
                } else {
                  if (pWord === term) {
                    score += 25;
                    termMatched = true;
                    break;
                  } else if (
                    pWord.indexOf(term) === 0 ||
                    term.indexOf(pWord) === 0
                  ) {
                    score += 12;
                    termMatched = true;
                  } else if (pWord.length > 3 && pWord.indexOf(term) !== -1) {
                    score += 6;
                    termMatched = true;
                  }
                }
              }
            }
          }

          if (termMatched) {
            matchedTerms++;
          }
        }

        // Only include if at least one term matched
        if (matchedTerms > 0) {
          // Bonus for matching multiple terms
          if (matchedTerms > 1) {
            score += matchedTerms * 5;
          }

          scored.push({
            control: control,
            score: score,
            matchedTerms: matchedTerms
          });
        }
      }

      // Sort by score descending
      scored.sort(function (a, b) {
        return b.score - a.score;
      });

      // Get all unique titles from top matches
      for (var s = 0; s < scored.length; s++) {
        var ctrl = scored[s].control;
        var names = this.getAllControlNames(ctrl);
        for (var n = 0; n < names.length; n++) {
          if (suggestions.indexOf(names[n]) === -1) {
            suggestions.push(names[n]);
          }
        }
      }
    }
  }

  // If no text-based matches, fall back to type/category filter
  if (suggestions.length === 0 && (type || category)) {
    for (var i = 0; i < allControls.length; i++) {
      var control = allControls[i];
      if ((type && control.type === type) || (category && control.category === category)) {
        var names = this.getAllControlNames(control);
        for (var j = 0; j < names.length; j++) {
          if (suggestions.indexOf(names[j]) === -1) {
            suggestions.push(names[j]);
          }
        }
      }
    }
  }

  // If still no suggestions, get all control names
  if (suggestions.length === 0) {
    for (var i = 0; i < allControls.length; i++) {
      var names = this.getAllControlNames(allControls[i]);
      for (var j = 0; j < names.length; j++) {
        if (suggestions.indexOf(names[j]) === -1) {
          suggestions.push(names[j]);
        }
      }
    }
  }

  return suggestions;
};

/**
 * Show name suggestions - DeepSeek powered
 * No secondary loading modal - button thinking animation is the only loading indicator
 */
ERM.controlsAI.showNameSuggestions = function (type, category) {
  var self = this;

  // Get user's typed text from control name field
  var userText = document.getElementById("control-name")
    ? document.getElementById("control-name").value.trim()
    : "";

  // Check if DeepSeek module is available
  if (!ERM.controlsAI.deepSeek || typeof ERM.controlsAI.deepSeek.getSuggestions !== "function") {
    console.log("[Control Name] DeepSeek not available, using template fallback");
    this._showNameSuggestionsFromTemplates(userText, type, category);
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.controlsAI.deepSeek.getFormContext();
  if (!context.type && type) {
    context.type = type;
  }
  if (!context.category && category) {
    context.category = category;
  }
  if (userText) {
    context.partialName = userText;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.controlsAI.deepSeek.getSuggestions("name", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      // Fallback to template-based suggestions
      console.log("[Control Name] DeepSeek failed, using template fallback");
      self._showNameSuggestionsFromTemplates(userText, type, category);
    } else {
      // Use DeepSeek suggestions - show results directly
      self._renderNameSuggestionsModal(result.suggestions, result.recommended, userText);
    }
  });
};

/**
 * Show name suggestions from templates (fallback)
 */
ERM.controlsAI._showNameSuggestionsFromTemplates = function(userText, type, category) {
  var allSuggestions = this.getControlNameSuggestions(userText, type, category);

  if (allSuggestions.length === 0) {
    ERM.components.showSecondaryModal({
      title: this.icons.sparkles + " Control Name Suggestions",
      content:
        '<div class="ai-suggestions-container">' +
        '<p class="ai-suggestions-intro">No AI suggestions found.</p>' +
        '<p class="text-muted">Try typing keywords or selecting a different control type/category.</p>' +
        "</div>",
      buttons: [{ label: "Close", type: "secondary", action: "close" }],
    });
    return;
  }

  this._renderNameSuggestionsModal(allSuggestions, 0, userText);
};

/**
 * Render name suggestions modal (shared by DeepSeek and fallback)
 */
ERM.controlsAI._renderNameSuggestionsModal = function(allSuggestions, recommendedIndex, userText) {
  var self = this;

  // First is best match (recommended), then 2 random others
  var recommended = allSuggestions[recommendedIndex] || allSuggestions[0];
  var others = [];
  for (var i = 0; i < allSuggestions.length; i++) {
    if (i !== recommendedIndex) {
      others.push(allSuggestions[i]);
    }
  }
  others = this.shuffleArray(others);
  var displayOthers = others.slice(0, 2);
  var hasMore = allSuggestions.length > 3;

  var introText = userText
    ? 'Matching "<strong>' + ERM.utils.escapeHtml(userText) + '</strong>":'
    : "AI-generated suggestions:";

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">' +
    introText +
    "</p>" +
    '<div class="ai-suggestions-list ai-stagger-container">';

  // Recommended control name first
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
  for (var k = 0; k < displayOthers.length; k++) {
    var delay = (k + 2) * 0.12;
    content +=
      '<div class="ai-suggestion-item ai-stagger-item clickable" data-value="' +
      ERM.utils.escapeHtml(displayOthers[k]) +
      '" style="animation-delay: ' +
      delay +
      's">' +
      '<span class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(displayOthers[k]) +
      "</span>" +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      "</div>";
  }

  content += "</div>";

  // Discover more button if more available
  if (hasMore) {
    content +=
      '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-names">✨ Generate More</button>';
  }

  content += "</div>";

  ERM.components.showSecondaryModal({
    title: this.icons.sparkles + " AI Control Name Suggestions",
    content: content,
    size: "md",
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      // Use buttons
      var useBtns = document.querySelectorAll(".btn-use");
      for (var i = 0; i < useBtns.length; i++) {
        useBtns[i].addEventListener("click", function () {
          var item = this.closest(".ai-suggestion-item");
          var value = item.getAttribute("data-value");
          document.getElementById("control-name").value = value;
          // Count AI usage
          if (ERM.controlsAI.deepSeek && ERM.controlsAI.deepSeek.onSuggestionUsed) {
            ERM.controlsAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Control name applied");
        });
      }

      // Clickable items
      var items = document.querySelectorAll(".ai-suggestion-item.clickable");
      for (var j = 0; j < items.length; j++) {
        items[j].addEventListener("click", function (e) {
          // Don't trigger if clicking the Use button
          if (e.target.classList.contains("btn-use")) return;

          var value = this.getAttribute("data-value");
          document.getElementById("control-name").value = value;
          // Count AI usage
          if (ERM.controlsAI.deepSeek && ERM.controlsAI.deepSeek.onSuggestionUsed) {
            ERM.controlsAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Control name applied");
        });
      }

      // Generate more button - MATCHES RISK REGISTER EXACTLY
      var moreBtn = document.getElementById("btn-discover-more-names");
      if (moreBtn) {
        moreBtn.addEventListener("click", function () {
          self.showMoreNameSuggestions();
        });
      }

      // Store for potential later use
      self.allNameSuggestions = allSuggestions;
      self.shownNameSuggestions = [recommended].concat(displayOthers);
    }
  });
};

/**
 * Shuffle array helper - matching risk register
 */
ERM.controlsAI.shuffleArray = function (array) {
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
 * Show thinking animation in the suggestion list, then call callback
 * EXACTLY matches risk register pattern
 */
ERM.controlsAI.showMoreThinking = function (callback) {
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
 * Show more name suggestions (reshuffled) with thinking
 * EXACTLY matches risk register pattern
 */
ERM.controlsAI.showMoreNameSuggestions = function () {
  var self = this;
  if (!this.allNameSuggestions) return;

  this.showMoreThinking(function () {
    self._renderMoreNames();
  });
};

/**
 * Render more names after thinking
 * EXACTLY matches risk register pattern
 */
ERM.controlsAI._renderMoreNames = function () {

  // Get unshown suggestions
  var shown = this.shownNameSuggestions || [];
  var all = this.allNameSuggestions;
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
  this.shownNameSuggestions = [recommended].concat(displayOthers);

  // Update modal content
  var listContainer = document.querySelector(".ai-suggestions-list");
  if (!listContainer) return;

  var html = "";

  // Recommended control name first
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
      var value = this.closest(".ai-suggestion-item").getAttribute("data-value");
      document.getElementById("control-name").value = value;
      ERM.components.closeSecondaryModal();
      ERM.toast.success("Control name applied");
    });
  }

  // Rebind clickable items
  var items = listContainer.querySelectorAll(".ai-suggestion-item.clickable");
  for (var k = 0; k < items.length; k++) {
    items[k].addEventListener("click", function (e) {
      if (e.target.classList.contains("btn-use")) return;
      var value = this.getAttribute("data-value");
      document.getElementById("control-name").value = value;
      ERM.components.closeSecondaryModal();
      ERM.toast.success("Control name applied");
    });
  }
};

/**
 * Show description suggestions - DeepSeek powered
 * No secondary loading modal - button thinking animation is the only loading indicator
 */
ERM.controlsAI.showDescriptionSuggestions = function (name, type) {
  var self = this;

  // Get user's current description text from input field
  var userText = document.getElementById("description-input")
    ? document.getElementById("description-input").value.trim()
    : "";

  // Prefer matching by name, but also consider typed description
  var searchText = name || userText;

  if (!searchText) {
    ERM.toast.warning("Please enter a control name first or describe what you need");
    return;
  }

  // Check if DeepSeek module is available
  if (!ERM.controlsAI.deepSeek || typeof ERM.controlsAI.deepSeek.getSuggestions !== "function") {
    console.log("[Control Description] DeepSeek not available, using template fallback");
    this._showDescriptionSuggestionsFromTemplates(searchText, type);
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.controlsAI.deepSeek.getFormContext();
  if (!context.name && name) {
    context.name = name;
  }
  if (!context.type && type) {
    context.type = type;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.controlsAI.deepSeek.getSuggestions("description", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      // Fallback to template-based suggestions
      console.log("[Control Description] DeepSeek failed, using template fallback");
      self._showDescriptionSuggestionsFromTemplates(searchText, type);
    } else {
      // Use DeepSeek suggestions - show results directly
      self._renderDescriptionSuggestionsModal(result.suggestions, result.recommended);
    }
  });
};

/**
 * Show description suggestions from templates (fallback)
 */
ERM.controlsAI._showDescriptionSuggestionsFromTemplates = function(searchText, type) {
  // Find matching template based on name/description
  var matchedTemplate = this.findMatchingControlTemplate(searchText, type);

  if (
    !matchedTemplate ||
    !matchedTemplate.descriptions ||
    matchedTemplate.descriptions.length === 0
  ) {
    ERM.components.showSecondaryModal({
      title: this.icons.sparkles + " Description Suggestions",
      content:
        '<div class="ai-suggestions-container">' +
        '<p class="ai-suggestions-intro">No AI suggestions found.</p>' +
        '<p class="text-muted">Try entering more details in the control name field.</p>' +
        "</div>",
      buttons: [{ label: "Close", type: "secondary", action: "close" }]
    });
    return;
  }

  this._renderDescriptionSuggestionsModal(matchedTemplate.descriptions, 0);
};

/**
 * Render description suggestions modal (shared by DeepSeek and fallback)
 */
ERM.controlsAI._renderDescriptionSuggestionsModal = function(allDescriptions, recommendedIndex) {
  var self = this;

  // Store for "more" button
  this.allDescriptionSuggestions = allDescriptions;

  // Show first 2 (1 recommended + 1 other)
  var recommended = allDescriptions[recommendedIndex] || allDescriptions[0];
  var others = [];
  for (var i = 0; i < allDescriptions.length; i++) {
    if (i !== recommendedIndex) {
      others.push(allDescriptions[i]);
    }
  }
  others = this.shuffleArray(others).slice(0, 1);
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

  // Discover more button
  if (hasMore) {
    content +=
      '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-discover-more-descriptions">✨ Generate More</button>';
  }

  content += "</div>";

  ERM.components.showSecondaryModal({
    title: this.icons.sparkles + " AI Description Suggestions",
    content: content,
    size: "md",
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      // Use buttons - now adds to list instead of replacing textarea
      var useBtns = document.querySelectorAll(".btn-use");
      for (var i = 0; i < useBtns.length; i++) {
        useBtns[i].addEventListener("click", function () {
          var value = this.getAttribute("data-value");

          // Add to description list using controls module
          if (typeof ERM.controls !== "undefined" && ERM.controls.addListItem) {
            ERM.controls.addListItem("descriptions", value);
          }

          // Count AI usage
          if (ERM.controlsAI.deepSeek && ERM.controlsAI.deepSeek.onSuggestionUsed) {
            ERM.controlsAI.deepSeek.onSuggestionUsed();
          }

          ERM.components.closeSecondaryModal();
          ERM.toast.success("Description added to list");
        });
      }

      // Generate more button - MATCHES RISK REGISTER EXACTLY
      var moreBtn = document.getElementById("btn-discover-more-descriptions");
      if (moreBtn) {
        moreBtn.addEventListener("click", function () {
          self.showMoreDescriptionSuggestions();
        });
      }
    }
  });
};

/**
 * Show more description suggestions (reshuffled) with thinking
 * EXACTLY matches risk register pattern
 */
ERM.controlsAI.showMoreDescriptionSuggestions = function () {
  var self = this;
  if (!this.allDescriptionSuggestions) return;

  this.showMoreThinking(function () {
    self._renderMoreDescriptions();
  });
};

/**
 * Render more descriptions after thinking
 * EXACTLY matches risk register pattern
 */
ERM.controlsAI._renderMoreDescriptions = function () {

  // Get unshown suggestions
  var shown = this.shownDescriptionSuggestions || [];
  var all = this.allDescriptionSuggestions;
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

  // Take 2 for display (1 recommended + 1 other)
  var recommended = remaining[0];
  var displayOthers = remaining.slice(1, 2);
  this.shownDescriptionSuggestions = [recommended].concat(displayOthers);

  // Update modal content
  var listContainer = document.querySelector(".ai-suggestions-list");
  if (!listContainer) return;

  var html = "";

  // Recommended description first
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

  // Other descriptions with stagger
  for (var i = 0; i < displayOthers.length; i++) {
    var delay = (i + 2) * 0.12;
    html +=
      '<div class="ai-suggestion-item ai-stagger-item" style="animation-delay: ' +
      delay +
      's">' +
      '<div class="ai-description-text">' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      "</div>" +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use" data-value="' +
      ERM.utils.escapeHtml(displayOthers[i]) +
      '">Use</button>' +
      "</div>";
  }

  listContainer.innerHTML = html;

  // Rebind use buttons - now adds to list instead of replacing textarea
  var btns = listContainer.querySelectorAll(".btn-use");
  for (var j = 0; j < btns.length; j++) {
    btns[j].addEventListener("click", function () {
      var value = this.getAttribute("data-value");

      // Add to description list using controls module
      if (typeof ERM.controls !== "undefined" && ERM.controls.addListItem) {
        ERM.controls.addListItem("descriptions", value);
      }

      ERM.components.closeSecondaryModal();
      ERM.toast.success("Description added to list");
    });
  }
};

/**
 * Show type suggestions - Uses DeepSeek AI with linked risk context
 */
ERM.controlsAI.showTypeSuggestions = function (name) {
  var self = this;

  // Check if DeepSeek module is available
  if (!ERM.controlsAI.deepSeek || typeof ERM.controlsAI.deepSeek.getSuggestions !== "function") {
    console.log("[Control Type] DeepSeek not available, showing quick select");
    this._showTypeQuickSelect();
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.controlsAI.deepSeek.getFormContext();
  if (!context.name && name) {
    context.name = name;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.controlsAI.deepSeek.getSuggestions("type", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result || !result.suggestions) {
      console.log("[Control Type] DeepSeek failed, showing quick select");
      self._showTypeQuickSelect();
    } else {
      self._renderTypeDeepSeek(result.suggestions, result.recommended);
    }
  });
};

/**
 * Render type suggestions from DeepSeek
 */
ERM.controlsAI._renderTypeDeepSeek = function(suggestions, recommendedIndex) {
  var self = this;

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-suggested control types based on linked risks:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  for (var i = 0; i < suggestions.length; i++) {
    var suggestion = suggestions[i];
    var typeValue = suggestion.type || suggestion.value || suggestion;
    var reason = suggestion.reason || "";
    var isRecommended = i === (recommendedIndex || 0);
    var delay = (i + 1) * 0.12;

    // Capitalize type label
    var typeLabel = typeValue.charAt(0).toUpperCase() + typeValue.slice(1);

    content +=
      '<div class="ai-suggestion-item' +
      (isRecommended ? ' ai-recommended' : '') +
      ' ai-stagger-item clickable" data-value="' +
      typeValue +
      '" style="animation-delay: ' +
      delay +
      's">' +
      '<div class="ai-suggestion-content">' +
      (isRecommended ? '<span class="ai-recommended-badge">⭐ Recommended</span>' : '') +
      '<div>' +
      '<span class="ai-suggestion-text"><strong>' + typeLabel + '</strong></span>' +
      (reason ? '<div class="text-muted" style="font-size: 12px; margin-top: 4px;">' + reason + '</div>' : '') +
      '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      '</div>';
  }

  content += '</div></div>';

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Control Type Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function () {
      self._bindTypeSuggestionEvents();
    },
  });
};

/**
 * Show quick select for control type when DeepSeek not available
 */
ERM.controlsAI._showTypeQuickSelect = function() {
  var self = this;

  var types = [
    { value: "preventive", label: "Preventive", desc: "Prevents risks from occurring" },
    { value: "detective", label: "Detective", desc: "Detects issues as they occur" },
    { value: "corrective", label: "Corrective", desc: "Fixes problems after detection" },
    { value: "directive", label: "Directive", desc: "Guides appropriate behavior" }
  ];

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">Select a control type:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  for (var i = 0; i < types.length; i++) {
    var typeObj = types[i];
    var delay = (i + 1) * 0.12;

    content +=
      '<div class="ai-suggestion-item ai-stagger-item clickable" data-value="' +
      typeObj.value + '" style="animation-delay: ' + delay + 's">' +
      '<div class="ai-suggestion-content">' +
      '<div>' +
      '<span class="ai-suggestion-text"><strong>' + typeObj.label + '</strong></span>' +
      '<div class="text-muted" style="font-size: 12px; margin-top: 4px;">' + typeObj.desc + '</div>' +
      '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      '</div>';
  }

  content += '</div></div>';

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Control Type",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function () {
      self._bindTypeSuggestionEvents();
    },
  });
};

/**
 * Bind events for type suggestion modal
 */
ERM.controlsAI._bindTypeSuggestionEvents = function() {
  var self = this;

  // Use buttons
  var btns = document.querySelectorAll(".btn-use");
  for (var j = 0; j < btns.length; j++) {
    btns[j].addEventListener("click", function () {
      var value = this.closest(".ai-suggestion-item").getAttribute("data-value");
      document.getElementById("control-type").value = value;
      ERM.components.closeSecondaryModal();
      ERM.toast.success("Type applied");
    });
  }

  // Clickable items
  var items = document.querySelectorAll(".ai-suggestion-item.clickable");
  for (var k = 0; k < items.length; k++) {
    items[k].addEventListener("click", function (e) {
      if (e.target.classList.contains("btn-use")) return;
      var value = this.getAttribute("data-value");
      document.getElementById("control-type").value = value;
      ERM.components.closeSecondaryModal();
      ERM.toast.success("Type applied");
    });
  }
};

/**
 * Show category suggestions - MATCHES RISK REGISTER PATTERN
 */
ERM.controlsAI.showCategorySuggestions = function (name, type) {
  var self = this;

  // Check if DeepSeek module is available
  if (!ERM.controlsAI.deepSeek || typeof ERM.controlsAI.deepSeek.getSuggestions !== "function") {
    console.log("[Category] DeepSeek not available, showing quick select only");
    this._showCategoryQuickSelect();
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.controlsAI.deepSeek.getFormContext();
  if (!context.name && name) {
    context.name = name;
  }
  if (!context.type && type) {
    context.type = type;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.controlsAI.deepSeek.getSuggestions("category", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      console.log("[Category] DeepSeek failed, showing quick select only");
      self._showCategoryQuickSelect();
    } else {
      self._renderCategoryDeepSeek(result.suggestions, result.recommended);
    }
  });
};

/**
 * Show quick select categories when DeepSeek is not available
 */
ERM.controlsAI._showCategoryQuickSelect = function() {
  var self = this;

  // Get available categories
  var categories = ERM.controls.categories || [
    { value: "policy", label: "Policy" },
    { value: "procedure", label: "Procedure" },
    { value: "technical", label: "Technical" },
    { value: "physical", label: "Physical" },
    { value: "administrative", label: "Administrative" }
  ];

  var content = '<div class="ai-suggestions-container">' +
    '<div class="ai-section">' +
    '<p class="text-muted" style="margin-bottom: 16px; text-align: center;">Select a control category:</p>' +
    '<div class="ai-generic-categories" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">';

  for (var i = 0; i < categories.length; i++) {
    content += '<button type="button" class="btn btn-sm btn-ghost btn-use-category" data-category="' +
      categories[i].value + '">' + categories[i].label + '</button>';
  }

  content += '</div></div></div>';

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Control Category",
    content: content,
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function() {
      var btns = document.querySelectorAll(".btn-use-category");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function() {
          var cat = this.getAttribute("data-category");
          self.applyToField("control-category", cat);
          ERM.components.closeSecondaryModal();
        });
      }
    }
  });
};

/**
 * Show category from templates (fallback)
 */
ERM.controlsAI._showCategoryFromTemplates = function(name, type) {
  // Get AI-powered category suggestions from industry template
  var industry = window.ERM.controlTemplates && window.ERM.controlTemplates.loader
    ? window.ERM.controlTemplates.loader.getIndustry()
    : null;
  var suggestions = [];

  // Get control description from form if available
  var descriptions = [];
  var descItems = document.querySelectorAll('#control-description-list .list-input-text');
  for (var d = 0; d < descItems.length; d++) {
    descriptions.push(descItems[d].textContent);
  }
  var description = descriptions.join(' ');

  if (industry && industry.suggestControlCategory) {
    suggestions = industry.suggestControlCategory(name, description, type);
  }

  // If no suggestions, fallback to all categories
  if (suggestions.length === 0) {
    var allCategories = industry && industry.getAllControlCategories
      ? industry.getAllControlCategories()
      : [];

    for (var i = 0; i < allCategories.length; i++) {
      suggestions.push({
        id: allCategories[i].id,
        name: allCategories[i].name,
        description: allCategories[i].description,
        score: 0
      });
    }
  }

  // Convert to DeepSeek format with reasons
  var deepSeekFormat = [];
  for (var j = 0; j < suggestions.length && j < 4; j++) {
    deepSeekFormat.push({
      category: suggestions[j].name || suggestions[j].id,
      id: suggestions[j].id,
      reason: suggestions[j].description || "Standard control category"
    });
  }

  this._renderCategoryDeepSeek(deepSeekFormat, 0);
};

/**
 * Render category suggestions from DeepSeek (with reasons)
 */
ERM.controlsAI._renderCategoryDeepSeek = function(suggestions, recommendedIndex) {
  var self = this;

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-suggested control categories:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var catValue = sug.id || sug.category || "";
    var catName = sug.category || sug.name || catValue;
    var reason = sug.reason || "";
    var delay = (i + 1) * 0.12;
    var isRecommended = (i === recommendedIndex);

    content +=
      '<div class="ai-suggestion-item' +
      (isRecommended ? ' ai-recommended' : '') +
      ' ai-stagger-item clickable" data-value="' +
      ERM.utils.escapeHtml(catValue) +
      '" style="animation-delay: ' + delay + 's">' +
      '<div class="ai-suggestion-content">' +
      (isRecommended ? '<span class="ai-recommended-badge">⭐ Recommended</span>' : '') +
      '<div>' +
      '<span class="ai-suggestion-text"><strong>' + ERM.utils.escapeHtml(catName) + '</strong></span>' +
      '<div class="text-muted" style="font-size: 12px; margin-top: 4px;">' + ERM.utils.escapeHtml(reason) + '</div>' +
      '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      '</div>';
  }

  content += '</div>';
  content += '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-generate-more-cat">✨ Generate More</button>';
  content += '</div>';

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " AI Category Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function() {
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function() {
          var value = this.closest(".ai-suggestion-item").getAttribute("data-value");
          // Normalize category value to match select options
          var normalizedValue = self._normalizeCategoryValue(value);
          var categorySelect = document.getElementById("control-category");
          if (categorySelect) {
            categorySelect.value = normalizedValue;
          }
          if (ERM.controlsAI.deepSeek && ERM.controlsAI.deepSeek.onSuggestionUsed) {
            ERM.controlsAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Category applied");
        });
      }

      var items = document.querySelectorAll(".ai-suggestion-item.clickable");
      for (var k = 0; k < items.length; k++) {
        items[k].addEventListener("click", function(e) {
          if (e.target.classList.contains("btn-use")) return;
          var value = this.getAttribute("data-value");
          // Normalize category value to match select options
          var normalizedValue = self._normalizeCategoryValue(value);
          var categorySelect = document.getElementById("control-category");
          if (categorySelect) {
            categorySelect.value = normalizedValue;
          }
          if (ERM.controlsAI.deepSeek && ERM.controlsAI.deepSeek.onSuggestionUsed) {
            ERM.controlsAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Category applied");
        });
      }

      // Generate More button
      var moreBtn = document.getElementById("btn-generate-more-cat");
      if (moreBtn) {
        moreBtn.addEventListener("click", function() {
          ERM.components.closeSecondaryModal();
          var nameEl = document.getElementById("control-name");
          var typeEl = document.getElementById("control-type");
          self.showCategorySuggestions(
            nameEl ? nameEl.value : "",
            typeEl ? typeEl.value : ""
          );
        });
      }
    }
  });
};

/**
 * Normalize category value to match select dropdown options
 * Maps AI-suggested categories to actual form values
 */
ERM.controlsAI._normalizeCategoryValue = function(value) {
  if (!value) return "";

  var lowerValue = value.toLowerCase();

  // Map common variations to actual values
  if (lowerValue.includes("policy") || lowerValue.includes("procedure")) {
    return "policy";
  } else if (lowerValue.includes("manual")) {
    return "manual";
  } else if (lowerValue.includes("automat") || lowerValue.includes("it") || lowerValue.includes("technology")) {
    return "automated";
  } else if (lowerValue.includes("physical")) {
    return "physical";
  }

  // If value already matches a known value, use it
  var validValues = ["policy", "manual", "automated", "physical"];
  if (validValues.indexOf(lowerValue) !== -1) {
    return lowerValue;
  }

  // Default to policy if no match
  return value; // Return original value and let the select handle it
};

/**
 * Get all unique owners from industry control templates
 */
ERM.controlsAI.getAllOwnersFromTemplates = function () {
  var allControls = this.getAllTemplateControls();
  var ownerSet = {};

  for (var i = 0; i < allControls.length; i++) {
    var control = allControls[i];

    if (control.owners) {
      // Add primary owners
      if (control.owners.primary && Array.isArray(control.owners.primary)) {
        for (var j = 0; j < control.owners.primary.length; j++) {
          ownerSet[control.owners.primary[j]] = true;
        }
      }

      // Add secondary owners
      if (control.owners.secondary && Array.isArray(control.owners.secondary)) {
        for (var k = 0; k < control.owners.secondary.length; k++) {
          ownerSet[control.owners.secondary[k]] = true;
        }
      }
    }
  }

  // Convert to array
  var owners = [];
  for (var owner in ownerSet) {
    if (ownerSet.hasOwnProperty(owner)) {
      owners.push(owner);
    }
  }

  return owners;
};

/**
 * Score and rank owners by relevance to current control
 */
ERM.controlsAI.scoreOwnersForControl = function (owners, controlName, type, category) {
  var scored = [];

  // Get all templates for scoring context
  var allControls = this.getAllTemplateControls();

  for (var i = 0; i < owners.length; i++) {
    var owner = owners[i];
    var score = 0;

    // Find controls that have this owner and match current control characteristics
    for (var j = 0; j < allControls.length; j++) {
      var control = allControls[j];

      // Check if this control has the owner
      var hasOwner = false;
      var isPrimary = false;

      if (control.owners && control.owners.primary) {
        if (control.owners.primary.indexOf(owner) !== -1) {
          hasOwner = true;
          isPrimary = true;
        }
      }

      if (control.owners && control.owners.secondary) {
        if (control.owners.secondary.indexOf(owner) !== -1) {
          hasOwner = true;
        }
      }

      if (hasOwner) {
        // Score based on matching characteristics
        // Primary owner: +5 bonus
        if (isPrimary) {
          score += 5;
        }

        // Same type: +10
        if (type && control.type === type) {
          score += 10;
        }

        // Same category: +8
        if (category && control.category === category) {
          score += 8;
        }

        // Name keyword match: +15 per matching word
        if (controlName && controlName.length >= 3) {
          var nameWords = controlName.toLowerCase().split(/\s+/);
          var controlTitles = control.titles || [];

          for (var t = 0; t < controlTitles.length; t++) {
            var titleWords = controlTitles[t].toLowerCase().split(/\s+/);

            for (var n = 0; n < nameWords.length; n++) {
              if (nameWords[n].length >= 3 && titleWords.indexOf(nameWords[n]) !== -1) {
                score += 15;
              }
            }
          }
        }
      }
    }

    if (score > 0) {
      scored.push({ owner: owner, score: score });
    } else {
      // Even if no score, include all owners with base score 1
      scored.push({ owner: owner, score: 1 });
    }
  }

  // Sort by score descending
  scored.sort(function (a, b) {
    return b.score - a.score;
  });

  // Return just the owner names
  var sorted = [];
  for (var s = 0; s < scored.length; s++) {
    sorted.push(scored[s].owner);
  }

  return sorted;
};

/**
 * Show owner suggestions - MATCHES RISK REGISTER PATTERN
 * Now with Generate More functionality
 */
ERM.controlsAI.showOwnerSuggestions = function (type, category) {
  var self = this;

  // Check if DeepSeek module is available
  if (!ERM.controlsAI.deepSeek || typeof ERM.controlsAI.deepSeek.getSuggestions !== "function") {
    console.log("[Control Owner] DeepSeek not available, using template fallback");
    this._showOwnerSuggestionsFromTemplates(type, category);
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.controlsAI.deepSeek.getFormContext();
  if (!context.type && type) {
    context.type = type;
  }
  if (!context.category && category) {
    context.category = category;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.controlsAI.deepSeek.getSuggestions("owner", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      console.log("[Control Owner] DeepSeek failed, using template fallback");
      self._showOwnerSuggestionsFromTemplates(type, category);
    } else {
      // Render DeepSeek suggestions with reasons
      self._renderOwnerSuggestionsDeepSeek(result.suggestions, result.recommended);
    }
  });
};

/**
 * Show owner suggestions from templates (fallback)
 */
ERM.controlsAI._showOwnerSuggestionsFromTemplates = function(type, category) {
  // Get control name from form for template matching
  var nameEl = document.getElementById("control-name");
  var name = nameEl ? nameEl.value : "";

  // Get all unique owners from industry templates
  var allOwners = this.getAllOwnersFromTemplates();

  if (allOwners.length === 0) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.warning("AI suggestions not loaded. Please refresh the page.");
    }
    return;
  }

  // Score and rank owners by relevance
  allOwners = this.scoreOwnersForControl(allOwners, name, type, category);

  // Store for Generate More functionality
  this._currentOwnerSuggestions = allOwners;
  this._shownOwnerCount = 0;

  // Show initial 3
  this._renderOwnerSuggestions(true);
};

/**
 * Render owner suggestions from DeepSeek (with reasons)
 */
ERM.controlsAI._renderOwnerSuggestionsDeepSeek = function(suggestions, recommendedIndex) {
  var self = this;

  // Store for Generate More
  this._deepSeekOwnerSuggestions = suggestions;

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-suggested control owners:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var role = typeof sug === "object" ? sug.role : sug;
    var reason = typeof sug === "object" ? sug.reason : null;
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
    title: this.icons.sparkles + " AI Control Owner Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function() {
      // Use buttons
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function() {
          var value = this.closest(".ai-suggestion-item").getAttribute("data-value");
          document.getElementById("control-owner").value = value;
          if (ERM.controlsAI.deepSeek && ERM.controlsAI.deepSeek.onSuggestionUsed) {
            ERM.controlsAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Owner applied");
        });
      }

      // Clickable items
      var items = document.querySelectorAll(".ai-suggestion-item.clickable");
      for (var k = 0; k < items.length; k++) {
        items[k].addEventListener("click", function(e) {
          if (e.target.classList.contains("btn-use")) return;
          var value = this.getAttribute("data-value");
          document.getElementById("control-owner").value = value;
          if (ERM.controlsAI.deepSeek && ERM.controlsAI.deepSeek.onSuggestionUsed) {
            ERM.controlsAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Owner applied");
        });
      }

      // Generate More button
      var moreBtn = document.getElementById("btn-generate-more-owners");
      if (moreBtn) {
        moreBtn.addEventListener("click", function() {
          ERM.components.closeSecondaryModal();
          // Re-call DeepSeek for fresh suggestions
          var typeEl = document.getElementById("control-type");
          var catEl = document.getElementById("control-category");
          self.showOwnerSuggestions(
            typeEl ? typeEl.value : "",
            catEl ? catEl.value : ""
          );
        });
      }
    }
  });
};

/**
 * Render owner suggestions (supports Generate More)
 */
ERM.controlsAI._renderOwnerSuggestions = function (isInitial) {
  var self = this;
  var allOwners = this._currentOwnerSuggestions || [];

  if (allOwners.length === 0) {
    return;
  }

  // Determine which owners to show
  var ownersToShow = [];

  if (isInitial) {
    // Initial: Show first 3
    ownersToShow = allOwners.slice(0, 3);
    this._shownOwnerCount = 3;
  } else {
    // Generate More: Show next 3
    var startIndex = this._shownOwnerCount;
    var endIndex = startIndex + 3;

    if (startIndex >= allOwners.length) {
      // All shown, reshuffle and start over
      var recommended = allOwners[0];
      var rest = this.shuffleArray(allOwners.slice(1));
      allOwners = [recommended].concat(rest);
      this._currentOwnerSuggestions = allOwners;
      startIndex = 0;
      endIndex = 3;
      this._shownOwnerCount = 0;
    }

    ownersToShow = allOwners.slice(startIndex, endIndex);
    this._shownOwnerCount += ownersToShow.length;
  }

  // Build content
  var recommended = ownersToShow[0];
  var others = ownersToShow.slice(1);

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-suggested control owners:</p>' +
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

  content += "</div>";

  // Add Generate More button if there are more owners left to show
  // Show button if: total owners > 3 AND we haven't shown all yet
  var hasMoreOwners = allOwners.length > 3 && (isInitial || this._shownOwnerCount < allOwners.length);

  if (hasMoreOwners) {
    content +=
      '<div class="ai-discover-container">' +
      '<button type="button" class="btn btn-secondary btn-ai-discover">✨ Generate More</button>' +
      "</div>";
  }

  content += "</div>";

  if (isInitial) {
    // Initial render - create modal
    ERM.components.showSecondaryModal({
      title: self.icons.sparkles + " Control Owner Suggestions",
      content: content,
      buttons: [{ label: "Close", type: "secondary", action: "close" }],
      onOpen: function () {
        self._attachOwnerEventHandlers();
      },
    });
  } else {
    // Generate More - update existing modal content
    var modalBody = document.querySelector(".modal-secondary .modal-body");
    if (modalBody) {
      modalBody.innerHTML = content;
      self._attachOwnerEventHandlers();
    }
  }
};

/**
 * Attach event handlers for owner suggestions
 */
ERM.controlsAI._attachOwnerEventHandlers = function () {
  var self = this;

  // Use buttons
  var btns = document.querySelectorAll(".btn-use");
  for (var j = 0; j < btns.length; j++) {
    btns[j].addEventListener("click", function () {
      var value = this.closest(".ai-suggestion-item").getAttribute("data-value");
      document.getElementById("control-owner").value = value;
      ERM.components.closeSecondaryModal();
      ERM.toast.success("Owner applied");
    });
  }

  // Clickable items
  var items = document.querySelectorAll(".ai-suggestion-item.clickable");
  for (var k = 0; k < items.length; k++) {
    items[k].addEventListener("click", function (e) {
      if (e.target.classList.contains("btn-use")) return;
      var value = this.getAttribute("data-value");
      document.getElementById("control-owner").value = value;
      ERM.components.closeSecondaryModal();
      ERM.toast.success("Owner applied");
    });
  }

  // Generate More button
  var discoverBtn = document.querySelector(".btn-ai-discover");
  if (discoverBtn) {
    discoverBtn.addEventListener("click", function () {
      self.showMoreOwnerSuggestions();
    });
  }
};

/**
 * Show more owner suggestions with thinking animation
 */
ERM.controlsAI.showMoreOwnerSuggestions = function () {
  var self = this;

  this.showMoreThinking(function () {
    self._renderOwnerSuggestions(false);
  });
};

/**
 * Show linked risks suggestions - Uses DeepSeek AI
 */
ERM.controlsAI.showLinkedRisksSuggestions = function (name) {
  var self = this;

  // Get all risks from risk register
  var allRisks = ERM.storage ? ERM.storage.get("risks") : [];
  var activeRegisterId = ERM.storage ? ERM.storage.get("activeRegisterId") : null;

  // Filter by active register
  var availableRisks = [];
  for (var i = 0; i < allRisks.length; i++) {
    if (!activeRegisterId || allRisks[i].registerId === activeRegisterId) {
      availableRisks.push(allRisks[i]);
    }
  }

  if (availableRisks.length === 0) {
    this.clearThinkingButton();
    ERM.toast.info("No risks available. Create some risks first.");
    return;
  }

  // Check if DeepSeek module is available
  if (!ERM.controlsAI.deepSeek || typeof ERM.controlsAI.deepSeek.getSuggestions !== "function") {
    console.log("[Linked Risks] DeepSeek not available, showing all risks");
    this._showLinkedRisksQuickSelect(availableRisks);
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.controlsAI.deepSeek.getFormContext();

  // Call DeepSeek
  ERM.controlsAI.deepSeek.getSuggestions("linkedRisks", context, function(error, result) {
    self.clearThinkingButton();

    if (error || !result || !result.suggestions || result.suggestions.length === 0) {
      console.log("[Linked Risks] DeepSeek failed, showing all risks");
      self._showLinkedRisksQuickSelect(availableRisks);
    } else {
      self._renderLinkedRisksDeepSeek(result.suggestions, availableRisks);
    }
  });
};

/**
 * Render linked risks from DeepSeek with reasons
 */
ERM.controlsAI._renderLinkedRisksDeepSeek = function(suggestions, allRisks) {
  var self = this;

  // Build a map of risk IDs for quick lookup
  var riskMap = {};
  for (var i = 0; i < allRisks.length; i++) {
    riskMap[allRisks[i].id] = allRisks[i];
  }

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI recommends linking these risks (click Use to auto-check):</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  var validSuggestions = 0;
  for (var s = 0; s < suggestions.length; s++) {
    var sug = suggestions[s];
    var riskId = sug.riskId;
    var risk = riskMap[riskId];

    if (!risk) continue; // Skip if risk not found

    validSuggestions++;
    var delay = validSuggestions * 0.12;
    var isRecommended = (s === 0);
    var reason = sug.reason || "";

    content +=
      '<div class="ai-suggestion-item' +
      (isRecommended ? ' ai-recommended' : '') +
      ' ai-stagger-item" data-risk-id="' +
      risk.id +
      '" style="animation-delay: ' + delay + 's">' +
      '<div class="ai-suggestion-content">' +
      (isRecommended ? '<span class="ai-recommended-badge">⭐ Best Match</span>' : '') +
      '<div>' +
      '<span class="ai-suggestion-text"><strong>' + ERM.utils.escapeHtml(risk.title) + '</strong></span>' +
      (reason ? '<div class="text-muted" style="font-size: 12px; margin-top: 4px;">' + ERM.utils.escapeHtml(reason) + '</div>' : '') +
      '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-link-risk">Use</button>' +
      '</div>';
  }

  if (validSuggestions === 0) {
    content += '<p class="text-muted">No matching risks found. Try the quick select below.</p>';
  }

  content += '</div></div>';

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " AI Linked Risk Recommendations",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function () {
      self._bindLinkedRiskEvents();
    },
  });
};

/**
 * Show quick select for linked risks when DeepSeek not available
 */
ERM.controlsAI._showLinkedRisksQuickSelect = function(allRisks) {
  var self = this;
  this.clearThinkingButton();

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">Select risks to link to this control:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  for (var i = 0; i < Math.min(allRisks.length, 8); i++) {
    var risk = allRisks[i];
    var delay = (i + 1) * 0.1;

    content +=
      '<div class="ai-suggestion-item ai-stagger-item" data-risk-id="' +
      risk.id + '" style="animation-delay: ' + delay + 's">' +
      '<div class="ai-suggestion-content">' +
      '<div>' +
      '<span class="ai-suggestion-text"><strong>' + ERM.utils.escapeHtml(risk.title) + '</strong></span>' +
      '<div class="text-muted" style="font-size: 12px; margin-top: 4px;">' +
      'Category: ' + (risk.category || 'N/A') +
      '</div>' +
      '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-link-risk">Use</button>' +
      '</div>';
  }

  content += '</div></div>';

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Link Risks",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function () {
      self._bindLinkedRiskEvents();
    },
  });
};

/**
 * Bind events for linked risk modal
 */
ERM.controlsAI._bindLinkedRiskEvents = function() {
  var btns = document.querySelectorAll(".btn-link-risk");
  for (var j = 0; j < btns.length; j++) {
    btns[j].addEventListener("click", function () {
      var riskId = this.closest(".ai-suggestion-item").getAttribute("data-risk-id");
      // Check the checkbox for this risk - try multiple selectors
      var checkbox = document.querySelector('input[name="linkedRisks"][value="' + riskId + '"]') ||
                     document.querySelector('input[type="checkbox"][data-risk-id="' + riskId + '"]');
      if (checkbox) {
        checkbox.checked = true;
        // Add visual feedback
        var label = checkbox.closest(".inline-control-item");
        if (label) label.classList.add("selected");
        ERM.toast.success("Risk linked");
      }
      ERM.components.closeSecondaryModal();
    });
  }
};

/**
 * Show evidence suggestions - Uses DeepSeek AI
 */
ERM.controlsAI.showEvidenceSuggestions = function(name, type, category) {
  var self = this;

  // Check if DeepSeek module is available
  if (!ERM.controlsAI.deepSeek || typeof ERM.controlsAI.deepSeek.getSuggestions !== "function") {
    console.log("[Evidence] DeepSeek not available, showing generic suggestions");
    this._showEvidenceQuickSelect(type);
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.controlsAI.deepSeek.getFormContext();

  // Call DeepSeek
  ERM.controlsAI.deepSeek.getSuggestions("evidence", context, function(error, result) {
    self.clearThinkingButton();

    if (error || !result || !result.suggestions || result.suggestions.length === 0) {
      console.log("[Evidence] DeepSeek failed, showing generic suggestions");
      self._showEvidenceQuickSelect(type);
    } else {
      self._renderEvidenceDeepSeek(result.suggestions);
    }
  });
};

/**
 * Render evidence suggestions from DeepSeek
 */
ERM.controlsAI._renderEvidenceDeepSeek = function(suggestions) {
  var self = this;

  // Show in the inline suggestion area
  var container = document.getElementById("ai-control-evidence-suggestion");
  var content = document.getElementById("ai-control-evidence-content");

  if (!container || !content) {
    // Fallback to modal
    this._showEvidenceModal(suggestions);
    return;
  }

  var html =
    '<div class="ai-evidence-header">' +
    '<span>Suggested Evidence Documents</span>' +
    '<button type="button" class="ai-evidence-close" onclick="document.getElementById(\'ai-control-evidence-suggestion\').style.display=\'none\'">×</button>' +
    '</div>' +
    '<div class="ai-evidence-list"><ul>';

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var doc = sug.document || sug;
    var reason = sug.reason || "";
    html += '<li><strong>' + ERM.utils.escapeHtml(doc) + '</strong>';
    if (reason) html += '<br><span class="text-muted" style="font-size: 11px;">' + ERM.utils.escapeHtml(reason) + '</span>';
    html += '</li>';
  }

  html += '</ul></div>' +
    '<button type="button" class="btn-link" onclick="document.getElementById(\'ai-control-evidence-suggestion\').style.display=\'none\'">Dismiss</button>';

  content.innerHTML = html;
  container.style.display = "block";
};

/**
 * Show evidence modal (fallback)
 */
ERM.controlsAI._showEvidenceModal = function(suggestions) {
  var self = this;

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">Suggested evidence documents for this control:</p>' +
    '<div class="ai-evidence-list"><ul>';

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var doc = sug.document || sug;
    var reason = sug.reason || "";
    content += '<li><strong>' + ERM.utils.escapeHtml(doc) + '</strong>';
    if (reason) content += '<br><span class="text-muted" style="font-size: 12px;">' + ERM.utils.escapeHtml(reason) + '</span>';
    content += '</li>';
  }

  content += '</ul></div></div>';

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Evidence Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }]
  });
};

/**
 * Show quick select for evidence when DeepSeek not available
 */
ERM.controlsAI._showEvidenceQuickSelect = function(type) {
  var self = this;
  this.clearThinkingButton();

  // Generic evidence suggestions based on control type
  var suggestions = [];
  if (type === "preventive") {
    suggestions = [
      { document: "Approval documentation", reason: "Proves preventive reviews occurred" },
      { document: "Authorization logs", reason: "Shows access was properly controlled" },
      { document: "Configuration settings", reason: "Demonstrates preventive settings in place" }
    ];
  } else if (type === "detective") {
    suggestions = [
      { document: "Exception reports", reason: "Shows detected issues" },
      { document: "Reconciliation records", reason: "Proves discrepancies were identified" },
      { document: "Monitoring logs", reason: "Demonstrates ongoing detection" }
    ];
  } else if (type === "corrective") {
    suggestions = [
      { document: "Incident reports", reason: "Documents issues that were corrected" },
      { document: "Remediation evidence", reason: "Shows corrective actions taken" },
      { document: "Follow-up documentation", reason: "Proves issues were resolved" }
    ];
  } else {
    suggestions = [
      { document: "Policy documents", reason: "Establishes directive requirements" },
      { document: "Training records", reason: "Shows staff understand directives" },
      { document: "Acknowledgment forms", reason: "Proves awareness of requirements" }
    ];
  }

  this._renderEvidenceDeepSeek(suggestions);
};

/**
 * Show effectiveness suggestions - MATCHES RISK REGISTER PATTERN
 */
ERM.controlsAI.showEffectivenessSuggestions = function (name, type) {
  var self = this;

  var matchedTemplate = this.findMatchingControlTemplate(name, type);
  var suggestedEffectiveness = matchedTemplate && matchedTemplate.effectiveness ? matchedTemplate.effectiveness : "effective";

  var options = [
    { value: "effective", label: "Effective", description: "Control is working as intended" },
    { value: "partially-effective", label: "Partially Effective", description: "Control needs improvement" },
    { value: "ineffective", label: "Ineffective", description: "Control is not working properly" },
    { value: "not-tested", label: "Not Tested", description: "Control has not been tested yet" }
  ];

  // Put suggested first
  options.sort(function(a, b) {
    if (a.value === suggestedEffectiveness) return -1;
    if (b.value === suggestedEffectiveness) return 1;
    return 0;
  });

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-suggested effectiveness rating:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  for (var i = 0; i < options.length; i++) {
    var opt = options[i];
    var delay = (i + 1) * 0.12;
    var isRecommended = (i === 0);

    content +=
      '<div class="ai-suggestion-item' +
      (isRecommended ? ' ai-recommended' : '') +
      ' ai-stagger-item clickable" data-value="' +
      opt.value +
      '" style="animation-delay: ' +
      delay +
      's">' +
      '<div class="ai-suggestion-content">' +
      (isRecommended ? '<span class="ai-recommended-badge">⭐ Recommended</span>' : '') +
      '<div>' +
      '<span class="ai-suggestion-text"><strong>' +
      opt.label +
      '</strong></span>' +
      '<div class="text-muted" style="font-size: 12px; margin-top: 4px;">' +
      opt.description +
      '</div>' +
      '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      '</div>';
  }

  content += '</div></div>';

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " Effectiveness Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function () {
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function () {
          var value = this.closest(".ai-suggestion-item").getAttribute("data-value");
          document.getElementById("control-effectiveness").value = value;
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Effectiveness applied");
        });
      }

      var items = document.querySelectorAll(".ai-suggestion-item.clickable");
      for (var k = 0; k < items.length; k++) {
        items[k].addEventListener("click", function (e) {
          if (e.target.classList.contains("btn-use")) return;
          var value = this.getAttribute("data-value");
          document.getElementById("control-effectiveness").value = value;
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Effectiveness applied");
        });
      }
    },
  });
};

/**
 * Show status suggestions - MATCHES RISK REGISTER PATTERN
 */
ERM.controlsAI.showStatusSuggestions = function (name, type) {
  var self = this;

  // Check if DeepSeek module is available
  if (!ERM.controlsAI.deepSeek || typeof ERM.controlsAI.deepSeek.getSuggestions !== "function") {
    console.log("[Control Status] DeepSeek not available, using template fallback");
    this._showStatusFromTemplates(name, type);
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.controlsAI.deepSeek.getFormContext();
  if (!context.name && name) {
    context.name = name;
  }
  if (!context.type && type) {
    context.type = type;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.controlsAI.deepSeek.getSuggestions("status", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      console.log("[Control Status] DeepSeek failed, using template fallback");
      self._showStatusFromTemplates(name, type);
    } else {
      self._renderStatusDeepSeek(result.suggestions, result.recommended);
    }
  });
};

/**
 * Show status from templates (fallback)
 */
ERM.controlsAI._showStatusFromTemplates = function(name, type) {
  var statuses = [
    { value: "active", reason: "Control is currently in use and operating effectively" },
    { value: "under-review", reason: "Control is being evaluated for effectiveness" },
    { value: "planned", reason: "Control is planned for future implementation" },
    { value: "inactive", reason: "Control is not currently active or operational" }
  ];
  this._renderStatusDeepSeek(statuses, 0);
};

/**
 * Render status suggestions from DeepSeek (with reasons)
 */
ERM.controlsAI._renderStatusDeepSeek = function(suggestions, recommendedIndex) {
  var self = this;

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-suggested control status:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var value = typeof sug === "object" ? sug.value : sug;
    var reason = typeof sug === "object" ? sug.reason : null;
    var delay = (i + 1) * 0.12;
    var isRecommended = (i === recommendedIndex);

    // Convert to display label
    var label = value;
    if (value === "active") label = "Active";
    if (value === "inactive") label = "Inactive";
    if (value === "under-review") label = "Under Review";
    if (value === "planned") label = "Planned";

    content +=
      '<div class="ai-suggestion-item' +
      (isRecommended ? ' ai-recommended' : '') +
      ' ai-stagger-item clickable" data-value="' +
      ERM.utils.escapeHtml(value) +
      '" style="animation-delay: ' + delay + 's">' +
      '<div class="ai-suggestion-content">' +
      (isRecommended ? '<span class="ai-recommended-badge">⭐ Recommended</span>' : '') +
      '<div>' +
      '<span class="ai-suggestion-text"><strong>' + ERM.utils.escapeHtml(label) + '</strong></span>' +
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
          document.getElementById("control-status").value = value;
          if (ERM.controlsAI.deepSeek && ERM.controlsAI.deepSeek.onSuggestionUsed) {
            ERM.controlsAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Status applied");
        });
      }

      var items = document.querySelectorAll(".ai-suggestion-item.clickable");
      for (var k = 0; k < items.length; k++) {
        items[k].addEventListener("click", function(e) {
          if (e.target.classList.contains("btn-use")) return;
          var value = this.getAttribute("data-value");
          document.getElementById("control-status").value = value;
          if (ERM.controlsAI.deepSeek && ERM.controlsAI.deepSeek.onSuggestionUsed) {
            ERM.controlsAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Status applied");
        });
      }

      // Generate More button
      var moreBtn = document.getElementById("btn-generate-more-status");
      if (moreBtn) {
        moreBtn.addEventListener("click", function() {
          ERM.components.closeSecondaryModal();
          var nameEl = document.getElementById("control-name");
          var typeEl = document.getElementById("control-type");
          self.showStatusSuggestions(
            nameEl ? nameEl.value : "",
            typeEl ? typeEl.value : ""
          );
        });
      }
    }
  });
};

/**
 * Show next review date suggestions - DeepSeek powered
 */
ERM.controlsAI.showNextReviewDateSuggestions = function (type, category) {
  var self = this;

  // Check if DeepSeek module is available
  if (!ERM.controlsAI.deepSeek || typeof ERM.controlsAI.deepSeek.getSuggestions !== "function") {
    console.log("[Next Review Date] DeepSeek not available, using template fallback");
    this._showNextReviewDateFromTemplates(type, category);
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.controlsAI.deepSeek.getFormContext();
  if (!context.type && type) {
    context.type = type;
  }
  if (!context.category && category) {
    context.category = category;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.controlsAI.deepSeek.getSuggestions("nextReviewDate", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      console.log("[Next Review Date] DeepSeek failed, using template fallback");
      self._showNextReviewDateFromTemplates(type, category);
    } else {
      // Render DeepSeek suggestions with reasons
      self._renderNextReviewDateDeepSeek(result.suggestions, result.recommended);
    }
  });
};

/**
 * Show next review date from templates (fallback)
 * Enhanced to use full control + linked risks context (especially risk review/target dates)
 */
ERM.controlsAI._showNextReviewDateFromTemplates = function(type, category) {
  var self = this;
  var today = new Date();
  var suggestions = [];

  // Get full control context including linked risks
  var ctx = this.getFullControlContext();
  var controlLabel = ctx.name || "this control";

  // Find earliest risk review or target date to align with
  var earliestRiskDate = null;
  var hasHighRisks = false;
  var riskDateContext = "";

  if (ctx.linkedRisks.length > 0) {
    for (var r = 0; r < ctx.linkedRisks.length; r++) {
      var risk = ctx.linkedRisks[r];

      // Check risk severity
      if (risk.inherentScore >= 12 || risk.residualScore >= 12) {
        hasHighRisks = true;
      }

      // Find earliest date
      var riskDate = risk.reviewDate || risk.targetDate;
      if (riskDate) {
        var dateObj = new Date(riskDate + "T00:00:00");
        if (!earliestRiskDate || dateObj < earliestRiskDate) {
          earliestRiskDate = dateObj;
        }
      }
    }

    if (earliestRiskDate) {
      riskDateContext = " to align with linked risk reviews";
    }
    if (hasHighRisks) {
      riskDateContext += " (high-severity risks require frequent review)";
    }
  }

  // Different review frequencies based on control type and context
  var reviewPeriods = {
    preventive: [
      { days: 30, label: "1 Month", description: "Review " + controlLabel + riskDateContext + " - proactive monitoring" },
      { days: 90, label: "3 Months", description: "Review " + controlLabel + riskDateContext + " - standard quarterly cycle" },
      { days: 180, label: "6 Months", description: "Review " + controlLabel + riskDateContext + " - semi-annual check" },
      { days: 365, label: "1 Year", description: "Review " + controlLabel + riskDateContext + " - annual review for stable controls" }
    ],
    detective: [
      { days: 30, label: "1 Month", description: "Review " + controlLabel + riskDateContext + " - active monitoring required" },
      { days: 90, label: "3 Months", description: "Review " + controlLabel + riskDateContext + " - quarterly effectiveness check" },
      { days: 180, label: "6 Months", description: "Review " + controlLabel + riskDateContext + " - semi-annual assessment" },
      { days: 365, label: "1 Year", description: "Review " + controlLabel + riskDateContext + " - annual validation" }
    ],
    corrective: [
      { days: 30, label: "1 Month", description: "Review " + controlLabel + riskDateContext + " - verify corrections applied" },
      { days: 60, label: "2 Months", description: "Review " + controlLabel + riskDateContext + " - follow-up check" },
      { days: 90, label: "3 Months", description: "Review " + controlLabel + riskDateContext + " - validate sustainability" },
      { days: 180, label: "6 Months", description: "Review " + controlLabel + riskDateContext + " - long-term effectiveness" }
    ],
    directive: [
      { days: 90, label: "3 Months", description: "Review " + controlLabel + riskDateContext + " - policy compliance check" },
      { days: 180, label: "6 Months", description: "Review " + controlLabel + riskDateContext + " - policy review cycle" },
      { days: 365, label: "1 Year", description: "Review " + controlLabel + riskDateContext + " - annual policy update" },
      { days: 730, label: "2 Years", description: "Review " + controlLabel + riskDateContext + " - extended review" }
    ]
  };

  var periods = reviewPeriods[ctx.type || type] || reviewPeriods.preventive;

  // Determine recommended index based on severity and linked risks
  var recommendedIndex = hasHighRisks ? 0 : (ctx.linkedRisks.length > 0 ? 1 : 2);

  for (var i = 0; i < periods.length; i++) {
    var period = periods[i];
    var futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + period.days);

    var year = futureDate.getFullYear();
    var month = String(futureDate.getMonth() + 1).padStart(2, '0');
    var day = String(futureDate.getDate()).padStart(2, '0');

    suggestions.push({
      date: year + '-' + month + '-' + day,
      label: period.label,
      reason: period.description
    });
  }

  this._renderNextReviewDateDeepSeek(suggestions, recommendedIndex);
};

/**
 * Render next review date suggestions from DeepSeek (with reasons)
 */
ERM.controlsAI._renderNextReviewDateDeepSeek = function(suggestions, recommendedIndex) {
  var self = this;

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-suggested next review dates:</p>' +
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
    title: this.icons.sparkles + " AI Next Review Date Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function() {
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function() {
          var value = this.closest(".ai-suggestion-item").getAttribute("data-value");
          document.getElementById("control-next-review").value = value;
          if (ERM.controlsAI.deepSeek && ERM.controlsAI.deepSeek.onSuggestionUsed) {
            ERM.controlsAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Next review date applied");
        });
      }

      var items = document.querySelectorAll(".ai-suggestion-item.clickable");
      for (var k = 0; k < items.length; k++) {
        items[k].addEventListener("click", function(e) {
          if (e.target.classList.contains("btn-use")) return;
          var value = this.getAttribute("data-value");
          document.getElementById("control-next-review").value = value;
          if (ERM.controlsAI.deepSeek && ERM.controlsAI.deepSeek.onSuggestionUsed) {
            ERM.controlsAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Next review date applied");
        });
      }

      // Generate More button
      var moreBtn = document.getElementById("btn-generate-more-dates");
      if (moreBtn) {
        moreBtn.addEventListener("click", function() {
          ERM.components.closeSecondaryModal();
          var typeEl = document.getElementById("control-type");
          var catEl = document.getElementById("control-category");
          self.showNextReviewDateSuggestions(
            typeEl ? typeEl.value : "",
            catEl ? catEl.value : ""
          );
        });
      }
    }
  });
};

/**
 * Show frequency suggestions - MATCHES RISK REGISTER PATTERN
 */
ERM.controlsAI.showFrequencySuggestions = function (type, category) {
  var self = this;

  // Check if DeepSeek module is available
  if (!ERM.controlsAI.deepSeek || typeof ERM.controlsAI.deepSeek.getSuggestions !== "function") {
    console.log("[Frequency] DeepSeek not available, showing quick select");
    this._showFrequencyQuickSelect(type, category);
    return;
  }

  // Get form context for DeepSeek
  var context = ERM.controlsAI.deepSeek.getFormContext();
  if (!context.type && type) {
    context.type = type;
  }
  if (!context.category && category) {
    context.category = category;
  }

  // Call DeepSeek directly - button thinking animation is already showing
  ERM.controlsAI.deepSeek.getSuggestions("frequency", context, function(error, result) {
    // Clear thinking spinner when DeepSeek responds
    self.clearThinkingButton();

    if (error || !result) {
      console.log("[Frequency] DeepSeek failed, showing quick select");
      self._showFrequencyQuickSelect(type, category);
    } else {
      self._renderFrequencyDeepSeek(result.suggestions, result.recommended);
    }
  });
};

/**
 * Show frequency quick select (fallback when DeepSeek not available)
 * Uses control + linked risks context for recommendations
 */
ERM.controlsAI._showFrequencyQuickSelect = function(type, category) {
  // Get full control context including linked risks
  var ctx = this.getFullControlContext();
  var controlLabel = ctx.name || "this " + (ctx.type || type || "control");

  // Build context-aware reasons based on control AND linked risks
  var riskContext = "";
  var hasHighRisks = false;
  var recommendedIndex = 2; // Default to Monthly

  if (ctx.linkedRisks.length > 0) {
    // Check for high-severity risks
    for (var i = 0; i < ctx.linkedRisks.length; i++) {
      if (ctx.linkedRisks[i].inherentScore >= 12 || ctx.linkedRisks[i].residualScore >= 12) {
        hasHighRisks = true;
        break;
      }
    }

    var riskTitles = ctx.linkedRisks.map(function(r) { return r.title; }).slice(0, 2).join(", ");
    riskContext = " (mitigating " + ctx.linkedRisks.length + " risk(s) including " + riskTitles + ")";

    // Adjust recommendation based on risk severity
    if (hasHighRisks) {
      recommendedIndex = 1; // Weekly for high risks
    }
  }

  // Type-specific messaging
  var typeMsg = "";
  if (ctx.type === "preventive" || type === "preventive") {
    typeMsg = "Preventive control";
  } else if (ctx.type === "detective" || type === "detective") {
    typeMsg = "Detective control - monitoring required";
  } else if (ctx.type === "corrective" || type === "corrective") {
    typeMsg = "Corrective control";
  } else {
    typeMsg = "Control";
  }

  var suggestions = [
    {
      frequency: "Daily",
      reason: typeMsg + " for " + controlLabel + riskContext + " - continuous oversight for critical operations" + (hasHighRisks ? " (recommended for high-severity risks)" : "")
    },
    {
      frequency: "Weekly",
      reason: typeMsg + " for " + controlLabel + riskContext + " - regular monitoring" + (hasHighRisks ? " (recommended for linked high risks)" : " for active risk management")
    },
    {
      frequency: "Monthly",
      reason: typeMsg + " for " + controlLabel + riskContext + " - standard periodic review frequency"
    },
    {
      frequency: "Quarterly",
      reason: typeMsg + " for " + controlLabel + riskContext + " - strategic oversight" + (ctx.linkedRisks.length === 0 ? " (suitable when no risks linked)" : "")
    }
  ];

  this._renderFrequencyDeepSeek(suggestions, recommendedIndex);
};

/**
 * Render frequency suggestions from DeepSeek (with reasons)
 */
ERM.controlsAI._renderFrequencyDeepSeek = function(suggestions, recommendedIndex) {
  var self = this;

  var content =
    '<div class="ai-suggestions-container">' +
    '<p class="ai-suggestions-intro">AI-suggested control frequencies:</p>' +
    '<div class="ai-suggestions-list ai-stagger-container">';

  for (var i = 0; i < suggestions.length; i++) {
    var sug = suggestions[i];
    var freqValue = sug.frequency || "";
    var reason = sug.reason || "";
    var delay = (i + 1) * 0.12;
    var isRecommended = (i === recommendedIndex);

    content +=
      '<div class="ai-suggestion-item' +
      (isRecommended ? ' ai-recommended' : '') +
      ' ai-stagger-item clickable" data-value="' +
      ERM.utils.escapeHtml(freqValue.toLowerCase()) +
      '" style="animation-delay: ' + delay + 's">' +
      '<div class="ai-suggestion-content">' +
      (isRecommended ? '<span class="ai-recommended-badge">⭐ Recommended</span>' : '') +
      '<div>' +
      '<span class="ai-suggestion-text"><strong>' + ERM.utils.escapeHtml(freqValue) + '</strong></span>' +
      '<div class="text-muted" style="font-size: 12px; margin-top: 4px;">' + ERM.utils.escapeHtml(reason) + '</div>' +
      '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-ai-use btn-use">Use</button>' +
      '</div>';
  }

  content += '</div>';
  content += '<button type="button" class="btn btn-sm btn-ai-discover" id="btn-generate-more-freq">✨ Generate More</button>';
  content += '</div>';

  ERM.components.showSecondaryModal({
    title: self.icons.sparkles + " AI Frequency Suggestions",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function() {
      var btns = document.querySelectorAll(".btn-use");
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener("click", function() {
          var value = this.closest(".ai-suggestion-item").getAttribute("data-value");
          document.getElementById("control-frequency").value = value;
          if (ERM.controlsAI.deepSeek && ERM.controlsAI.deepSeek.onSuggestionUsed) {
            ERM.controlsAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Frequency applied");
        });
      }

      var items = document.querySelectorAll(".ai-suggestion-item.clickable");
      for (var k = 0; k < items.length; k++) {
        items[k].addEventListener("click", function(e) {
          if (e.target.classList.contains("btn-use")) return;
          var value = this.getAttribute("data-value");
          document.getElementById("control-frequency").value = value;
          if (ERM.controlsAI.deepSeek && ERM.controlsAI.deepSeek.onSuggestionUsed) {
            ERM.controlsAI.deepSeek.onSuggestionUsed();
          }
          ERM.components.closeSecondaryModal();
          ERM.toast.success("Frequency applied");
        });
      }

      // Generate More button
      var moreBtn = document.getElementById("btn-generate-more-freq");
      if (moreBtn) {
        moreBtn.addEventListener("click", function() {
          ERM.components.closeSecondaryModal();
          var typeEl = document.getElementById("control-type");
          var catEl = document.getElementById("control-category");
          self.showFrequencySuggestions(
            typeEl ? typeEl.value : "",
            catEl ? catEl.value : ""
          );
        });
      }
    }
  });
};

/* ========================================
   CREATION MODE SELECTION
   Two ways to add controls: AI Description or Manual Entry
   ======================================== */

/**
 * Show creation mode selection modal
 * User chooses between "Describe with AI" or "Manual Entry"
 */
ERM.controlsAI.showCreationModeSelection = function() {
  if (!this.icons || !this.icons.sparkles || !this.icons.edit) {
    console.error("Icons not loaded");
    return;
  }

  var content =
    '<div class="add-risk-choice">' +
    '<p class="choice-intro">How would you like to add a control?</p>' +
    '<div class="choice-cards">' +
    '<div class="choice-card ai-choice" data-choice="ai">' +
    '<div class="choice-card-icon ai-gradient">' +
    this.icons.sparkles +
    "</div>" +
    '<div class="choice-card-content">' +
    '<h4 class="choice-card-title">Describe with AI</h4>' +
    '<p class="choice-card-desc">Describe your control in plain language and let AI generate the structured details</p>' +
    "</div>" +
    "</div>" +
    '<div class="choice-card manual-choice" data-choice="manual">' +
    '<div class="choice-card-icon">' +
    this.icons.edit +
    "</div>" +
    '<div class="choice-card-content">' +
    '<h4 class="choice-card-title">Manual Entry</h4>' +
    '<p class="choice-card-desc">Fill in the control form fields yourself with full control over all details</p>' +
    '<div class="choice-card-ai-badge">' +
    '<span class="ai-badge-icon">✨</span>' +
    '<span class="ai-badge-text">AI assists every field</span>' +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: "Add New Control",
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
              ERM.controlsAI.showNaturalLanguageInput();
            } else {
              if (typeof ERM.controls !== "undefined" && ERM.controls.showControlModal) {
                ERM.controls.showControlModal(null);
              }
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
ERM.controlsAI.handleGenerateControlClick = function () {
  // Try both possible input IDs
  var input = document.getElementById("ai-control-input") || document.getElementById("nl-control-input");
  if (!input) {
    console.error("Input element not found");
    return;
  }

  var inputValue = input.value.trim();

  if (!inputValue) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.error("Please describe your control");
    }
    return;
  }

  if (inputValue.length < 10) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.error("Please provide more detail");
    }
    return;
  }

  this.parseNaturalLanguageControl(inputValue);
};

/**
 * Find all matching control templates with scores
 * Returns array of {control, score} sorted by score descending
 * Enhanced to match risk parser's sophisticated matching
 */
ERM.controlsAI.findAllMatchingTemplates = function(searchText) {
  if (!searchText) return [];

  var allControls = this.getAllTemplateControls();
  if (!allControls || allControls.length === 0) return [];

  var searchLower = searchText.toLowerCase();
  var searchTerms = searchLower.split(/\s+/);
  var results = [];

  for (var i = 0; i < allControls.length; i++) {
    var control = allControls[i];
    var score = 0;

    // Exact phrase match in plain language (highest priority)
    if (control.plainLanguage) {
      for (var p = 0; p < control.plainLanguage.length; p++) {
        var plain = control.plainLanguage[p].toLowerCase();
        if (plain === searchLower) {
          score += 100; // Perfect match
        } else if (searchLower.indexOf(plain) !== -1 || plain.indexOf(searchLower) !== -1) {
          score += 50; // Partial phrase match
        } else {
          // Word matches in plain language
          for (var s3 = 0; s3 < searchTerms.length; s3++) {
            if (searchTerms[s3].length > 2 && plain.indexOf(searchTerms[s3]) !== -1) {
              score += 15;
            }
          }
        }
      }
    }

    // Title matches
    if (control.titles) {
      for (var t = 0; t < control.titles.length; t++) {
        var title = control.titles[t].toLowerCase();
        if (title === searchLower) {
          score += 80; // Exact title match
        } else if (searchLower.indexOf(title) !== -1 || title.indexOf(searchLower) !== -1) {
          score += 40; // Partial title match
        } else {
          // Word matches in titles
          for (var s = 0; s < searchTerms.length; s++) {
            if (searchTerms[s].length > 2 && title.indexOf(searchTerms[s]) !== -1) {
              score += 12;
            }
          }
        }
      }
    }

    // Keyword matches
    if (control.keywords) {
      for (var k = 0; k < control.keywords.length; k++) {
        var keyword = control.keywords[k].toLowerCase();
        // Exact keyword match
        if (searchTerms.indexOf(keyword) !== -1) {
          score += 20;
        } else {
          // Partial keyword match
          for (var s2 = 0; s2 < searchTerms.length; s2++) {
            if (searchTerms[s2].length > 2 && keyword.indexOf(searchTerms[s2]) !== -1) {
              score += 8;
            }
          }
        }
      }
    }

    // Description matches (lower weight)
    if (control.descriptions) {
      for (var d = 0; d < control.descriptions.length; d++) {
        var desc = control.descriptions[d].toLowerCase();
        var matchedWords = 0;
        for (var s4 = 0; s4 < searchTerms.length; s4++) {
          if (searchTerms[s4].length > 2 && desc.indexOf(searchTerms[s4]) !== -1) {
            matchedWords++;
          }
        }
        // Bonus for matching multiple words in description
        if (matchedWords > 0) {
          score += matchedWords * 5;
          if (matchedWords >= searchTerms.length * 0.7) {
            score += 20; // Bonus for matching most search terms
          }
        }
      }
    }

    if (score > 0) {
      results.push({
        control: control,
        score: score
      });
    }
  }

  // Sort by score descending
  results.sort(function(a, b) {
    return b.score - a.score;
  });

  return results;
};

/**
 * Module-level flag to prevent thinking animation from closing preview modal
 * Set to true when API responds before animation completes
 */
ERM.controlsAI._apiRespondedBeforeAnimation = false;

/**
 * Show AI thinking/processing modal
 * Matches risk register thinking animation
 */
ERM.controlsAI.showThinkingModal = function(input, onComplete) {
  console.log("=== THINKING MODAL START ===");
  console.log("Input:", input);

  // Reset the flag at the start of each thinking modal
  ERM.controlsAI._apiRespondedBeforeAnimation = false;

  var steps = [
    { text: "AI analyzing your description", icon: "search", delay: 1200 },
    { text: "AI detecting control type and category", icon: "category", delay: 1400 },
    { text: "AI searching control database", icon: "tree", delay: 1600 },
    { text: "AI identifying control owner", icon: "shield", delay: 1400 },
    { text: "AI building control details", icon: "chart", delay: 1200 }
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
    this.icons.sparkles +
    "</div>" +
    "<h3>AI is generating your control</h3>" +
    '<p class="ai-input-preview">"' +
    (input.length > 60 ? input.substring(0, 60) + "..." : input) +
    '"</p>' +
    "</div>" +
    '<div class="ai-steps-container">' +
    stepsHtml +
    "</div>" +
    "</div>";

  console.log("Opening thinking modal...");

  ERM.components.showModal({
    title: "",
    content: content,
    size: "sm",
    buttons: [],
    footer: false,
    closeOnBackdrop: false,  // Prevent accidental closing
    closeOnEscape: false,     // Prevent ESC key closing
    onOpen: function() {
      console.log("Thinking modal opened - DOM ready");

      // Remove the modal header and fix all sizing issues
      var modal = document.querySelector(".modal");
      var modalContent = document.querySelector(".modal-content");
      var modalHeader = document.querySelector(".modal-header");
      var modalBody = document.querySelector(".modal-body");
      var modalFooter = document.querySelector(".modal-footer");

      if (modal) {
        modal.classList.add("ai-thinking-modal");
        console.log("Added ai-thinking-modal class");
      }

      // Completely remove header
      if (modalHeader && modalHeader.parentNode) {
        modalHeader.parentNode.removeChild(modalHeader);
        console.log("Removed modal header");
      }

      // Completely remove footer
      if (modalFooter && modalFooter.parentNode) {
        modalFooter.parentNode.removeChild(modalFooter);
        console.log("Removed modal footer");
      }

      // Fix body - remove all restrictions
      if (modalBody) {
        modalBody.style.cssText =
          "padding: 0 !important; max-height: none !important; overflow: visible !important;";
        console.log("Fixed modal body styles");
      }

      // Fix modal content wrapper
      if (modalContent) {
        modalContent.style.cssText =
          "max-height: none !important; overflow: visible !important;";
        console.log("Fixed modal content styles");
      }

      console.log("Modal DOM manipulation complete");
    }
  });

  // Animate steps sequentially - OUTSIDE onOpen like risk register
  function animateStep(stepIndex) {
    // ALWAYS check flag first - if API already responded, stop animation completely
    if (ERM.controlsAI._apiRespondedBeforeAnimation) {
      console.log("[Control AI] Animation step " + stepIndex + " skipped - API already responded");
      return; // Stop animation entirely
    }

    if (stepIndex >= steps.length) {
      // All steps complete - close modal and call onComplete
      console.log("All thinking steps complete");

      // Double-check flag before closing
      if (ERM.controlsAI._apiRespondedBeforeAnimation) {
        console.log("[Control AI] Animation complete but API already responded - NOT closing modal");
        if (onComplete) onComplete();
        return;
      }

      console.log("Closing thinking modal (API hasn't responded yet)");
      setTimeout(function() {
        // Triple-check flag before actually closing (in case API responded during the 800ms wait)
        if (ERM.controlsAI._apiRespondedBeforeAnimation) {
          console.log("[Control AI] NOT closing - API responded during final wait");
          if (onComplete) onComplete();
          return;
        }
        // Also check if the current modal is actually the thinking modal (has ai-thinking-modal class)
        var modal = document.querySelector('.modal.ai-thinking-modal');
        if (!modal) {
          console.log("[Control AI] Thinking modal not found - preview must be showing, NOT closing");
          if (onComplete) onComplete();
          return;
        }
        console.log("[Control AI] Confirmed thinking modal still open - closing it now");
        ERM.components.closeModal();
        setTimeout(function() {
          if (onComplete) onComplete();
        }, 300);
      }, 800);
      return;
    }

    var stepEl = document.querySelector('.ai-step[data-step="' + stepIndex + '"]');
    if (stepEl) {
      console.log("Animating step:", stepIndex, steps[stepIndex].text);
      stepEl.classList.add("active");

      setTimeout(function() {
        // Check flag again before continuing to next step
        if (ERM.controlsAI._apiRespondedBeforeAnimation) {
          console.log("[Control AI] Animation stopped mid-step - API responded");
          return;
        }
        stepEl.classList.remove("active");
        stepEl.classList.add("complete");
        animateStep(stepIndex + 1);
      }, steps[stepIndex].delay);
    } else {
      // If step element not found, skip to next
      console.warn("Step element not found for step:", stepIndex);
      animateStep(stepIndex + 1);
    }
  }

  // Start animation after modal opens - exactly like risk register
  console.log("Starting thinking animation timer");
  setTimeout(function() {
    // Check if API already responded before even starting animation
    if (ERM.controlsAI._apiRespondedBeforeAnimation) {
      console.log("[Control AI] API already responded - skipping animation start");
      return;
    }

    console.log("Checking for step elements...");

    // Debug: Check what elements exist
    var modal = document.querySelector('.modal');
    var modalBody = document.querySelector('.modal-body');
    var thinkingContainer = document.querySelector('.ai-thinking-container');
    var stepsContainer = document.querySelector('.ai-steps-container');
    var firstStep = document.querySelector('.ai-step[data-step="0"]');
    var allSteps = document.querySelectorAll('.ai-step');

    console.log("Debug - Modal exists:", modal !== null);
    console.log("Debug - Modal body exists:", modalBody !== null);
    console.log("Debug - Thinking container exists:", thinkingContainer !== null);
    console.log("Debug - Steps container exists:", stepsContainer !== null);
    console.log("Debug - All steps count:", allSteps.length);
    console.log("Debug - First step exists:", firstStep !== null);

    if (modalBody) {
      console.log("Debug - Modal body HTML length:", modalBody.innerHTML.length);
      console.log("Debug - Modal body first 500 chars:", modalBody.innerHTML.substring(0, 500));
    }

    if (firstStep) {
      console.log("First step element found - starting animation");
      animateStep(0);
    } else {
      console.error("First step element NOT found after 300ms!");
      console.log("Will retry with longer delay...");

      // Retry with longer delay
      setTimeout(function() {
        // Check flag again before retry
        if (ERM.controlsAI._apiRespondedBeforeAnimation) {
          console.log("[Control AI] API responded during wait - skipping animation retry");
          return;
        }

        console.log("Second attempt after 1000ms total...");
        var retryFirstStep = document.querySelector('.ai-step[data-step="0"]');
        if (retryFirstStep) {
          console.log("Found on second attempt - starting animation");
          animateStep(0);
        } else {
          console.error("Still not found on second attempt!");
        }
      }, 700);
    }
  }, 300);
};

/**
 * Parse natural language control description and create control using DeepSeek AI
 */
ERM.controlsAI.parseNaturalLanguageControl = function(input) {
  if (!input || !input.trim()) {
    ERM.toast.error("Please provide a control description");
    return;
  }

  // Close current modal (if not already closed by caller)
  if (typeof ERM.components !== "undefined" && ERM.components.isModalOpen && ERM.components.isModalOpen()) {
    ERM.components.closeModal();
  }

  var self = this;

  // Debug logging
  console.log("[Control AI] parseNaturalLanguageControl called with:", input);
  console.log("[Control AI] ERM.aiService exists:", typeof ERM.aiService !== "undefined");
  console.log("[Control AI] ERM.aiService.callAPI exists:", typeof ERM.aiService !== "undefined" && typeof ERM.aiService.callAPI === "function");

  // Check if AI service is available
  if (typeof ERM.aiService === "undefined" || typeof ERM.aiService.callAPI !== "function") {
    console.log("[Control AI] AI service not available, falling back to template matching");
    // Fallback to template-based parsing
    setTimeout(function() {
      self.showThinkingModal(input, function() {
        try {
          var matches = self.findAllMatchingTemplates(input);
          var controlData = self.buildControlDataFromMatches(matches, input);
          self.showGeneratedControlPreview(controlData, input);
        } catch (error) {
          console.error("Error parsing natural language:", error);
          ERM.toast.error("Failed to generate control");
        }
      });
    }, 350);
    return;
  }

  console.log("[Control AI] Using DeepSeek API for control generation");

  // Build DeepSeek prompt for control generation
  var prompt =
    "You are an enterprise risk management expert specializing in internal controls. Generate a structured control based on this user description:\n\n" +
    "\"" + input + "\"\n\n" +
    "Respond with ONLY a valid JSON object (no markdown, no explanation) with these fields:\n" +
    "{\n" +
    "  \"name\": \"Professional control name (max 80 chars)\",\n" +
    "  \"description\": \"Detailed control description explaining what the control does and how it mitigates risk (2-3 sentences)\",\n" +
    "  \"type\": \"One of: preventive, detective, corrective, directive\",\n" +
    "  \"category\": \"One of: policy, manual, automated, physical, segregation, monitoring\",\n" +
    "  \"owner\": \"Suggested role/title for control owner (e.g., CFO, IT Manager, Compliance Officer)\",\n" +
    "  \"department\": \"Department responsible (e.g., Finance, IT, Operations, HR, Legal)\",\n" +
    "  \"frequency\": \"One of: continuous, daily, weekly, monthly, quarterly, annually, as-needed\"\n" +
    "}\n\n" +
    "Control types:\n" +
    "- preventive: Prevents issues before they occur\n" +
    "- detective: Identifies issues after they occur\n" +
    "- corrective: Fixes issues after detection\n" +
    "- directive: Guides behavior through policies/procedures\n\n" +
    "Control categories:\n" +
    "- policy: Written policies and procedures\n" +
    "- manual: Human-performed controls\n" +
    "- automated: System-enforced controls\n" +
    "- physical: Physical security controls\n" +
    "- segregation: Separation of duties\n" +
    "- monitoring: Ongoing monitoring and review";

  // Wait for modal to close before showing thinking modal
  setTimeout(function() {
    // Show thinking modal with animation
    // Note: The animation checks ERM.controlsAI._apiRespondedBeforeAnimation flag
    // to avoid closing the preview modal if API responded before animation finished
    self.showThinkingModal(input, function() {
      console.log("[Control AI] Thinking animation callback complete");
    });

    console.log("[Control AI] Sending prompt to DeepSeek:", prompt.substring(0, 200) + "...");

    // Call DeepSeek API (start immediately)
    // Note: aiService.callAPI uses single callback for both success and error responses
    ERM.aiService.callAPI(
      prompt,
      function(response) {
        console.log("[Control AI] DeepSeek response received:", response);

        // Set flag so animation doesn't close the preview modal when it completes
        ERM.controlsAI._apiRespondedBeforeAnimation = true;
        console.log("[Control AI] Set _apiRespondedBeforeAnimation = true");

        // Close the thinking modal
        ERM.components.closeModal();

        setTimeout(function() {
          // Check for error response (API returns {error: '...'} on failure)
          if (response && response.error) {
            console.error("[Control AI] DeepSeek API error:", response.error);
            ERM.toast.warning("AI service temporarily unavailable");
            // Fallback to template matching
            try {
              var matches = self.findAllMatchingTemplates(input);
              var fallbackData = self.buildControlDataFromMatches(matches, input);
              self.showGeneratedControlPreview(fallbackData, input);
            } catch (e) {
              ERM.toast.error("Failed to generate control. Please try again.");
            }
            return;
          }

          if (response && response.success && response.text) {
            console.log("[Control AI] DeepSeek success, raw text:", response.text);
            try {
              // Parse JSON response
              var jsonText = response.text.trim();
              // Remove markdown code blocks if present
              if (jsonText.indexOf("```") !== -1) {
                jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
              }
              console.log("[Control AI] Cleaned JSON:", jsonText);
              var parsed = JSON.parse(jsonText);
              console.log("[Control AI] Parsed result:", parsed);

              // Build the control object
              var controlData = {
                name: parsed.name || input,
                description: parsed.description || input,
                type: parsed.type || "preventive",
                category: parsed.category || "manual",
                owner: parsed.owner || "",
                department: parsed.department || "",
                frequency: parsed.frequency || "monthly",
                effectiveness: "effective",
                status: "active",
                confidence: "high",
                source: "deepseek-ai"
              };

              console.log("[Control AI] Final control data:", controlData);

              // Note: AI counter is now incremented centrally in ai-service.js callAPI()
              // This ensures consistent counting for all API calls
              console.log("[Control AI] Control generated successfully, count handled by AIService");

              // Show preview modal
              self.showGeneratedControlPreview(controlData, input);
            } catch (parseError) {
              console.error("[Control AI] Failed to parse DeepSeek response:", parseError);
              console.error("[Control AI] Raw response:", response.text);
              // Fallback to template matching
              console.log("[Control AI] Falling back to template matching due to parse error");
              ERM.toast.warning("AI response error, please try again");
              try {
                var matches = self.findAllMatchingTemplates(input);
                var fallbackData = self.buildControlDataFromMatches(matches, input);
                self.showGeneratedControlPreview(fallbackData, input);
              } catch (e) {
                ERM.toast.error("Failed to generate control. Please try again.");
              }
            }
          } else {
            console.error("[Control AI] DeepSeek returned unexpected response:", response);
            // Fallback to template matching
            console.log("[Control AI] Falling back to template matching due to unexpected response");
            ERM.toast.warning("AI service temporarily unavailable");
            try {
              var matches = self.findAllMatchingTemplates(input);
              var fallbackData = self.buildControlDataFromMatches(matches, input);
              self.showGeneratedControlPreview(fallbackData, input);
            } catch (e) {
              ERM.toast.error("Failed to generate control. Please try again.");
            }
          }
        }, 200);
      }
    );
  }, 350); // Wait for modal to close
};

/**
 * Helper function to build control data from template matches (used for fallback)
 */
ERM.controlsAI.buildControlDataFromMatches = function(matches, input) {
  var controlData = {
    name: "",
    description: "",
    type: "",
    category: "",
    owner: "",
    department: "",
    frequency: "",
    effectiveness: "effective",
    status: "active",
    source: "ai-generated"
  };

  if (matches && matches.length > 0) {
    var bestMatch = matches[0].control;
    controlData.name = this.getControlName(bestMatch);
    controlData.description = this.getControlDescription(bestMatch);
    controlData.type = bestMatch.type || "";
    controlData.category = bestMatch.category || "";
    controlData.owner = this.getControlOwner(bestMatch, input);
    controlData.department = bestMatch.department || "";
    controlData.frequency = bestMatch.frequency || "";
    controlData.templateId = bestMatch.id;
    controlData.confidence = matches[0].score >= 100 ? "high" : "medium";
  } else {
    controlData.name = this.extractControlName(input);
    controlData.description = input;
    controlData.type = this.detectControlType(input);
    controlData.category = this.detectControlCategory(input);
    controlData.confidence = "low";
  }

  return controlData;
};

/**
 * Show preview of generated control
 * Matches risk register preview modal
 */
ERM.controlsAI.showGeneratedControlPreview = function(control, originalInput) {
  // Check if ERM.components is available
  if (typeof ERM.components === "undefined" || !ERM.components.showModal) {
    console.error("ERM.components not available for preview");
    return;
  }

  // Store current control for AI suggestions
  this.previewControl = control;

  // Fallback escapeHtml if not available
  var escapeHtml = ERM.utils && ERM.utils.escapeHtml
    ? ERM.utils.escapeHtml
    : function(str) {
        if (!str) return "";
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      };

  var confidenceBadge = control.confidence === "high"
    ? '<span class="confidence-badge high">High Confidence</span>'
    : '<span class="confidence-badge medium">AI Generated</span>';

  // Get control type label
  var typeLabels = {
    preventive: "Preventive",
    detective: "Detective",
    corrective: "Corrective",
    directive: "Directive"
  };
  var typeLabel = typeLabels[control.type] || control.type || "Not specified";

  // Get control category label
  var categoryLabels = {
    policy: "Policy",
    manual: "Manual",
    automated: "Automated",
    physical: "Physical",
    segregation: "Segregation of Duties",
    monitoring: "Monitoring & Detective"
  };
  var categoryLabel = categoryLabels[control.category] || control.category || "Not specified";

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
    "<label>Control Name</label>" +
    '<button type="button" class="btn-ai-suggest btn-ai-sm" onclick="ERM.controlsAI.showPreviewNameSuggestions()">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<input type="text" class="form-input preview-title-input" id="preview-control-name" value="' +
    escapeHtml(control.name) +
    '">' +
    "</div>" +
    '<div class="preview-section">' +
    "<label>Description</label>" +
    '<textarea class="form-textarea" id="preview-control-description" rows="3">' +
    escapeHtml(control.description || "") +
    "</textarea>" +
    "</div>" +
    '<div class="preview-row">' +
    '<div class="preview-section half">' +
    "<label>Control Type</label>" +
    '<div class="preview-value"><span class="category-badge ' +
    control.type +
    '">' +
    typeLabel +
    "</span></div>" +
    "</div>" +
    '<div class="preview-section half">' +
    "<label>Category</label>" +
    '<div class="preview-value"><span class="category-badge ' +
    control.category +
    '">' +
    categoryLabel +
    "</span></div>" +
    "</div>" +
    "</div>" +
    '<div class="preview-row">' +
    '<div class="preview-section half">' +
    "<label>Control Owner</label>" +
    '<input type="text" class="form-input preview-owner-input" id="preview-control-owner" value="' +
    escapeHtml(control.owner || "") +
    '" placeholder="e.g. CFO, IT Manager">' +
    "</div>" +
    '<div class="preview-section half">' +
    "<label>Frequency</label>" +
    '<div class="preview-value">' +
    escapeHtml(control.frequency || "Not specified") +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: this.icons.check + " Generated Control Preview",
    content: content,
    size: "lg",
    buttons: [
      { label: "Edit Details", type: "secondary", action: "edit" },
      {
        label: "Save Control",
        type: "primary",
        action: "save",
        className: "btn-ai-primary"
      }
    ],
    onAction: function(action) {
      if (action === "save") {
        // Update fields from inputs
        var nameInput = document.getElementById("preview-control-name");
        if (nameInput && nameInput.value.trim()) {
          control.name = nameInput.value.trim();
        }
        var descInput = document.getElementById("preview-control-description");
        if (descInput && descInput.value.trim()) {
          control.description = descInput.value.trim();
        }
        var ownerInput = document.getElementById("preview-control-owner");
        if (ownerInput && ownerInput.value.trim()) {
          control.owner = ownerInput.value.trim();
        }
        ERM.controlsAI.saveGeneratedControl(control);
      } else if (action === "edit") {
        // Update fields from inputs before opening form
        var nameInputEdit = document.getElementById("preview-control-name");
        if (nameInputEdit && nameInputEdit.value.trim()) {
          control.name = nameInputEdit.value.trim();
        }
        var descInputEdit = document.getElementById("preview-control-description");
        if (descInputEdit && descInputEdit.value.trim()) {
          control.description = descInputEdit.value.trim();
        }
        var ownerInputEdit = document.getElementById("preview-control-owner");
        if (ownerInputEdit && ownerInputEdit.value.trim()) {
          control.owner = ownerInputEdit.value.trim();
        }
        ERM.components.closeModal();
        setTimeout(function() {
          ERM.controlsAI.openControlFormWithData(control);
        }, 250);
      }
    }
  });
};

/**
 * Show name suggestions in preview modal
 */
ERM.controlsAI.showPreviewNameSuggestions = function() {
  var self = this;
  var control = this.previewControl;

  if (!control || !control.templateId) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.info("No alternative names available");
    }
    return;
  }

  // Get template to access all name variations
  var template = null;
  var allControls = this.getAllTemplateControls ? this.getAllTemplateControls() : [];
  for (var i = 0; i < allControls.length; i++) {
    if (allControls[i].id === control.templateId) {
      template = allControls[i];
      break;
    }
  }

  if (!template || !template.titles || template.titles.length <= 1) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.info("No alternative names available");
    }
    return;
  }

  // Build suggestions content
  var currentName = document.getElementById("preview-control-name");
  var currentValue = currentName ? currentName.value : control.name;

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
        (isFirst ? '<span class="ai-recommended-badge">⭐ Recommended</span>' : "") +
        '<span class="ai-title-text">' +
        escapeHtml(title) +
        "</span>" +
        "</div>";
      shown++;
    }
  }

  suggestionsHtml += "</div>";

  if (shown === 0) {
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.info("No other name variations available");
    }
    return;
  }

  // Show in secondary modal
  if (typeof ERM.components.showSecondaryModal === "function") {
    ERM.components.showSecondaryModal({
      title: this.icons.sparkles + " Alternative Control Names",
      content: suggestionsHtml,
      size: "md",
      buttons: [{ label: "Close", type: "secondary", action: "close" }]
    });

    // Add click handlers
    setTimeout(function() {
      var titleItems = document.querySelectorAll(".ai-title-item");
      for (var i = 0; i < titleItems.length; i++) {
        titleItems[i].addEventListener("click", function() {
          var selectedTitle = this.getAttribute("data-title");
          if (currentName && selectedTitle) {
            currentName.value = selectedTitle;
            if (typeof ERM.components.closeSecondaryModal === "function") {
              ERM.components.closeSecondaryModal();
            }
            if (typeof ERM.toast !== "undefined") {
              ERM.toast.success("Control name updated");
            }
          }
        });
      }
    }, 100);
  } else if (typeof ERM.components.showModal === "function") {
    // Fallback to regular modal
    ERM.components.showModal({
      title: this.icons.sparkles + " Alternative Control Names",
      content: suggestionsHtml,
      size: "md",
      buttons: [{ label: "Close", type: "secondary", action: "close" }]
    });

    // Add click handlers
    setTimeout(function() {
      var titleItems = document.querySelectorAll(".ai-title-item");
      for (var i = 0; i < titleItems.length; i++) {
        titleItems[i].addEventListener("click", function() {
          var selectedTitle = this.getAttribute("data-title");
          if (currentName && selectedTitle) {
            currentName.value = selectedTitle;
            ERM.components.closeModal();
            if (typeof ERM.toast !== "undefined") {
              ERM.toast.success("Control name updated");
            }
          }
        });
      }
    }, 100);
  }
};

/**
 * Save generated control directly
 */
ERM.controlsAI.saveGeneratedControl = function(control) {
  // Add reference number and defaults
  if (typeof ERM.controls !== "undefined") {
    control.reference = ERM.controls.getNextControlNumber();
  }
  control.lastReviewDate = control.lastReviewDate || "";
  control.nextReviewDate = control.nextReviewDate || "";

  // Check if there's a pending risk link from risk form
  if (this.pendingRiskLink) {
    control.linkedRisks = [this.pendingRiskLink];
    this.pendingRiskLink = null; // Clear after using
  } else {
    control.linkedRisks = control.linkedRisks || [];
  }

  control.effectiveness = control.effectiveness || "effective";
  control.status = control.status || "active";

  // Close modal
  if (typeof ERM.components !== "undefined" && ERM.components.closeModal) {
    ERM.components.closeModal();
  }

  // Save control using ERM.controls.save()
  if (typeof ERM.controls !== "undefined" && ERM.controls.save) {
    var savedControl = ERM.controls.save(control);

    // Bidirectional sync: Update linked risks' linkedControls arrays
    if (savedControl && savedControl.linkedRisks && savedControl.linkedRisks.length > 0) {
      var risks = ERM.storage.get("risks") || [];
      var risksUpdated = false;

      for (var r = 0; r < risks.length; r++) {
        var risk = risks[r];
        if (!risk.linkedControls) risk.linkedControls = [];

        var isLinkedInControl = savedControl.linkedRisks.indexOf(risk.id) !== -1;
        var controlInRisk = risk.linkedControls.indexOf(savedControl.id) !== -1;

        if (isLinkedInControl && !controlInRisk) {
          // Risk is linked to this control but control not in risk's linkedControls - add it
          risk.linkedControls.push(savedControl.id);
          risksUpdated = true;
        }
      }

      if (risksUpdated) {
        ERM.storage.set("risks", risks);
      }
    }

    // Only render controls view if we're currently on controls page
    // Don't navigate away if we came from risk form
    var currentHash = window.location.hash;
    if (currentHash && currentHash.indexOf("#controls") === 0) {
      ERM.controls.render();
    }

    if (typeof ERM.toast !== "undefined") {
      ERM.toast.success("Control saved successfully: " + control.name);
    }

    // Note: AI counter is incremented at API call time, not when saving
    // This was moved to getSuggestions() to count once per API call, not per use
  } else {
    console.error("ERM.controls.save not available");
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.error("Failed to save control");
    }
  }
};

/**
 * Open control form with pre-filled data
 */
ERM.controlsAI.openControlFormWithData = function(control) {
  // Add reference number and defaults
  if (typeof ERM.controls !== "undefined") {
    control.reference = ERM.controls.getNextControlNumber();
  }
  control.lastReviewDate = control.lastReviewDate || "";
  control.nextReviewDate = control.nextReviewDate || "";
  control.linkedRisks = control.linkedRisks || [];

  if (typeof ERM.controls !== "undefined" && ERM.controls.showControlForm) {
    ERM.controls.showControlForm(control, false);
  } else {
    console.error("ERM.controls.showControlForm not available");
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.error("Failed to open control form");
    }
  }
};

/**
 * Escape attribute value for HTML
 */
ERM.controlsAI.escapeAttr = function(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Shuffle array helper
 */
ERM.controlsAI.shuffleArray = function(array) {
  var arr = array.slice();
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
};

/**
 * Extract control name from natural language input
 */
ERM.controlsAI.extractControlName = function(input) {
  // Simple heuristic: take first sentence or up to 80 chars
  var sentences = input.split(/[.!?]/);
  var firstSentence = sentences[0].trim();

  if (firstSentence.length > 80) {
    return firstSentence.substring(0, 77) + "...";
  }

  return firstSentence;
};

/**
 * Detect control type from natural language
 */
ERM.controlsAI.detectControlType = function(text) {
  var textLower = text.toLowerCase();

  // Preventive indicators
  var preventiveKeywords = ["prevent", "policy", "procedure", "require", "mandate", "ensure", "protect", "safeguard", "restrict", "limit"];
  // Detective indicators
  var detectiveKeywords = ["review", "monitor", "inspect", "check", "reconcile", "audit", "detect", "surveillance", "report"];
  // Corrective indicators
  var correctiveKeywords = ["correct", "fix", "remediate", "recover", "restore", "repair"];
  // Directive indicators
  var directiveKeywords = ["guideline", "framework", "governance", "directive", "standard"];

  var scores = {
    preventive: 0,
    detective: 0,
    corrective: 0,
    directive: 0
  };

  for (var i = 0; i < preventiveKeywords.length; i++) {
    if (textLower.indexOf(preventiveKeywords[i]) !== -1) scores.preventive += 1;
  }
  for (var j = 0; j < detectiveKeywords.length; j++) {
    if (textLower.indexOf(detectiveKeywords[j]) !== -1) scores.detective += 1;
  }
  for (var k = 0; k < correctiveKeywords.length; k++) {
    if (textLower.indexOf(correctiveKeywords[k]) !== -1) scores.corrective += 1;
  }
  for (var l = 0; l < directiveKeywords.length; l++) {
    if (textLower.indexOf(directiveKeywords[l]) !== -1) scores.directive += 1;
  }

  // Find highest score
  var maxScore = 0;
  var detectedType = "preventive"; // default
  for (var type in scores) {
    if (scores[type] > maxScore) {
      maxScore = scores[type];
      detectedType = type;
    }
  }

  return detectedType;
};

/**
 * Detect control category from natural language
 */
ERM.controlsAI.detectControlCategory = function(text) {
  var textLower = text.toLowerCase();

  // Category indicators
  var categoryKeywords = {
    policy: ["policy", "procedure", "standard", "guideline", "framework", "protocol"],
    manual: ["manual", "review", "approval", "inspection", "check", "reconciliation"],
    automated: ["automated", "system", "software", "automatic", "IT", "digital"],
    physical: ["physical", "lock", "fence", "camera", "badge", "access", "barrier"],
    segregation: ["segregation", "separation", "duties", "different person", "split"],
    monitoring: ["monitoring", "detective", "report", "dashboard", "surveillance", "tracking"]
  };

  var scores = {
    policy: 0,
    manual: 0,
    automated: 0,
    physical: 0,
    segregation: 0,
    monitoring: 0
  };

  for (var category in categoryKeywords) {
    var keywords = categoryKeywords[category];
    for (var i = 0; i < keywords.length; i++) {
      if (textLower.indexOf(keywords[i]) !== -1) {
        scores[category] += 1;
      }
    }
  }

  // Find highest score
  var maxScore = 0;
  var detectedCategory = "manual"; // default
  for (var cat in scores) {
    if (scores[cat] > maxScore) {
      maxScore = scores[cat];
      detectedCategory = cat;
    }
  }

  return detectedCategory;
};

/**
 * Show AI thinking loader
 */
ERM.controlsAI.showAIThinking = function(message) {
  var content =
    '<div class="ai-thinking">' +
    '<div class="ai-thinking-spinner">' +
    '<div class="spinner-ring"></div>' +
    '<div class="spinner-icon">' +
    this.icons.sparkles +
    "</div>" +
    "</div>" +
    '<p class="ai-thinking-message">' + (message || "AI is thinking...") + '</p>' +
    '<div class="ai-thinking-dots">' +
    '<span class="dot"></span><span class="dot"></span><span class="dot"></span>' +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: this.icons.sparkles + " AI Processing",
    content: content,
    size: "sm",
    buttons: [],
    closeOnBackdrop: false
  });
};

/**
 * Hide AI thinking loader
 */
ERM.controlsAI.hideAIThinking = function() {
  ERM.components.closeModal();
};

/* ========================================
   FIND CONTROLS FOR RISK (AI Matching)
   ======================================== */

/**
 * Find controls that match a given risk context
 * Scores controls based on risk category, keywords, and description
 * @param {Object} riskContext - { title, category, description, riskId }
 * @returns {Array} Array of { control, score } objects sorted by score (highest first)
 */
ERM.controlsAI.findControlsForRisk = function(riskContext) {
  var results = [];

  // Get all control templates for current industry
  var industry = localStorage.getItem("ERM_industry") || "mining";

  if (!window.ERM_TEMPLATES ||
      !window.ERM_TEMPLATES[industry] ||
      !window.ERM_TEMPLATES[industry].controls) {
    console.log('[Controls AI] No control templates found for industry:', industry);
    return results;
  }

  // Get all controls across all 9 categories
  var allControls = this.getAllControls(industry);
  console.log('[Controls AI] Searching', allControls.length, 'controls for matches');

  // Extract risk keywords from title + description
  var riskText = (riskContext.title || "") + " " + (riskContext.description || "");
  var riskKeywords = this.extractKeywords(riskText);
  var riskCategory = (riskContext.category || "").toLowerCase();

  console.log('[Controls AI] Risk keywords:', riskKeywords);
  console.log('[Controls AI] Risk category:', riskCategory);

  // Score each control
  for (var i = 0; i < allControls.length; i++) {
    var control = allControls[i];
    var score = 0;

    // 1. Match risk category to control.mitigatesRiskCategories (+30 points)
    if (control.mitigatesRiskCategories && riskCategory) {
      for (var c = 0; c < control.mitigatesRiskCategories.length; c++) {
        if (control.mitigatesRiskCategories[c].toLowerCase() === riskCategory) {
          score += 30;
          break;
        }
      }
    }

    // 2. Match risk keywords to control.mitigatesRiskKeywords (+15 each)
    if (control.mitigatesRiskKeywords && riskKeywords.length > 0) {
      for (var k = 0; k < riskKeywords.length; k++) {
        for (var m = 0; m < control.mitigatesRiskKeywords.length; m++) {
          if (control.mitigatesRiskKeywords[m].toLowerCase().indexOf(riskKeywords[k]) !== -1) {
            score += 15;
          }
        }
      }
    }

    // 3. Match risk keywords to control.keywords (+10 each)
    if (control.keywords && riskKeywords.length > 0) {
      for (var rk = 0; rk < riskKeywords.length; rk++) {
        for (var ck = 0; ck < control.keywords.length; ck++) {
          if (control.keywords[ck].toLowerCase().indexOf(riskKeywords[rk]) !== -1) {
            score += 10;
          }
        }
      }
    }

    // Only include controls with score > 0
    if (score > 0) {
      results.push({
        control: control,
        score: score
      });
    }
  }

  // Sort by score (highest first)
  results.sort(function(a, b) {
    return b.score - a.score;
  });

  console.log('[Controls AI] Found', results.length, 'matching controls');
  if (results.length > 0) {
    console.log('[Controls AI] Top match:', results[0].control.titles ? results[0].control.titles[0] : results[0].control.name, '(score:', results[0].score + ')');
  }

  return results;
};

/**
 * Get all controls across all 9 categories for an industry
 * @param {string} industry - Industry ID (e.g., "mining")
 * @returns {Array} Array of all control objects
 */
ERM.controlsAI.getAllControls = function(industry) {
  var all = [];
  var controlTemplates = window.ERM_TEMPLATES[industry].controls;
  var categories = [
    'strategic',
    'financial',
    'operational',
    'compliance',
    'technology',
    'hr',
    'hse',
    'reputational',
    'project'
  ];

  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    if (controlTemplates[cat] && Array.isArray(controlTemplates[cat])) {
      all = all.concat(controlTemplates[cat]);
    }
  }

  return all;
};

/**
 * Extract meaningful keywords from text (remove stop words)
 * @param {string} text - Text to extract keywords from
 * @returns {Array} Array of keyword strings
 */
ERM.controlsAI.extractKeywords = function(text) {
  var stopWords = [
    'the', 'a', 'an', 'of', 'to', 'in', 'for', 'and', 'or', 'is', 'are',
    'risk', 'risks', 'control', 'controls', 'that', 'this', 'with', 'from',
    'be', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'could', 'should'
  ];

  var words = text.toLowerCase().split(/\s+/);
  var keywords = [];

  for (var i = 0; i < words.length; i++) {
    var word = words[i].replace(/[^a-z0-9]/g, '');
    if (word.length >= 3 && stopWords.indexOf(word) === -1) {
      if (keywords.indexOf(word) === -1) {
        keywords.push(word);
      }
    }
  }

  return keywords;
};

console.log("Controls AI UI loaded");

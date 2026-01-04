/**
 * Dimeri ERM - Risk Register Modals Module
 * All modal forms: register CRUD, risk form, delete confirms, bulk actions
 *
 * @version 3.0.0
 * ES5 Compatible
 */

console.log("Loading risk-register-modals.js...");

var ERM = window.ERM || {};
ERM.riskRegister = ERM.riskRegister || {};

/* ========================================
   CREATE REGISTER MODAL
   ======================================== */
ERM.riskRegister.showCreateModal = function () {
  var self = this;

  // Check if user has reached 5 register limit (only for blank register)
  var registers = ERM.storage.get("registers") || [];
  var atLimit = registers.length >= 5;

  var content =
    '<div class="create-register-options">' +
    '<p class="text-secondary">Choose how to create your new risk register:</p>' +
    '<div class="option-cards two-cards">' +
    '<div class="option-card" id="option-blank">' +
    '<div class="option-card-icon">📄</div>' +
    '<div class="option-card-title">Blank Register</div>' +
    '<div class="option-card-ai-badge">' +
    '<span class="ai-badge-border">' +
    '<svg class="ai-star" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>' +
    " Build with AI" +
    "</span>" +
    "</div>" +
    "</div>" +
    '<div class="option-card" id="option-import">' +
    '<div class="option-card-pro-badge">PRO</div>' +
    '<div class="option-card-icon">📥</div>' +
    '<div class="option-card-title">Import File</div>' +
    '<div class="option-card-ai-badge">' +
    '<span class="ai-badge-border">' +
    '<svg class="ai-star" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>' +
    " Enhance with AI" +
    "</span>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: "Create Risk Register",
    content: content,
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      var blankOpt = document.getElementById("option-blank");
      var importOpt = document.getElementById("option-import");

      if (blankOpt) {
        blankOpt.addEventListener("click", function () {
          if (atLimit) {
            ERM.components.closeModal();
            setTimeout(function () {
              self.showUpgradeModal("limit");
            }, 250);
            return;
          }
          ERM.components.closeModal();
          setTimeout(function () {
            self.showNameRegisterModal(null);
          }, 250);
        });
      }

      if (importOpt) {
        importOpt.addEventListener("click", function () {
          // Check if user is on paid plan
          var plan = ERM.usageTracker ? ERM.usageTracker.getPlan() : 'FREE';
          ERM.components.closeModal();

          if (plan !== 'FREE') {
            // PRO/ENTERPRISE users can import directly
            setTimeout(function () {
              self.showImportFileModal();
            }, 250);
          } else {
            // Free users see the preview/upgrade modal
            setTimeout(function () {
              self.showImportPreviewModal();
            }, 250);
          }
        });
      }
    },
  });
};

/* ========================================
   UPGRADE PLAN MODAL
   ======================================== */
ERM.riskRegister.showUpgradeModal = function (reason) {
  var title = "Upgrade Your Plan";
  var desc = "Unlock premium features with Dimeri ERM Pro.";
  var source = "general";

  if (reason === "limit") {
    title = "You've reached the free plan limit";
    desc =
      "You can create up to <strong>5 risk registers</strong> on the free plan. Upgrade to Pro for unlimited registers and premium features.";
    source = "register_limit";
  } else if (reason === "import") {
    title = "Import is a Pro feature";
    desc =
      "Importing registers from CSV or Excel is available on the Pro plan. Upgrade to unlock this feature and more.";
    source = "import_feature";
  } else if (reason === "portfolio_review") {
    title = "AI Portfolio Review is a Pro feature";
    desc =
      "Get comprehensive AI-powered analysis of your entire risk portfolio with actionable recommendations. Upgrade to Pro to unlock this feature.";
    source = "portfolio_review";
  }

  var content =
    '<div class="upgrade-modal-content">' +
    '<div class="upgrade-icon">🚀</div>' +
    '<h3 class="upgrade-title">' +
    title +
    "</h3>" +
    '<p class="upgrade-desc">' +
    desc +
    "</p>" +
    '<div class="upgrade-features">' +
    '<div class="upgrade-feature">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
    "<span>Unlimited risk registers</span>" +
    "</div>" +
    '<div class="upgrade-feature">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
    "<span>Import from CSV & Excel</span>" +
    "</div>" +
    '<div class="upgrade-feature">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
    "<span>Advanced AI reports</span>" +
    "</div>" +
    '<div class="upgrade-feature">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
    "<span>Team collaboration</span>" +
    "</div>" +
    "</div>" +
    '<div class="upgrade-pricing">' +
    '<span class="upgrade-price">$29</span>' +
    '<span class="upgrade-period">/month</span>' +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: "Upgrade Your Plan",
    content: content,
    buttons: [
      { label: "Maybe Later", type: "secondary", action: "close" },
      { label: "Upgrade to Pro", type: "primary", action: "upgrade" },
    ],
    onAction: function (action) {
      if (action === "upgrade") {
        window.location.href = "upgrade.html?plan=pro&source=" + source;
      }
    },
  });
};

/* ========================================
   IMPORT PREVIEW MODAL (Free users can download template)
   ======================================== */
ERM.riskRegister.showImportPreviewModal = function () {
  var self = this;

  var content =
    '<div class="import-preview-content">' +
    '<div class="import-preview-hero">' +
    '<div class="import-preview-icon">📥</div>' +
    '<h3 class="import-preview-title">Upload Risk Register</h3>' +
    '<div class="pro-badge-inline">PRO</div>' +
    "</div>" +
    '<p class="import-preview-desc">Import your existing risk register from CSV or Excel. AI will automatically enhance and analyze your risks.</p>' +
    '<div class="import-preview-columns">' +
    "<h4>Supported Columns</h4>" +
    '<div class="column-tags">' +
    '<span class="column-tag">Risk Title</span>' +
    '<span class="column-tag">Description</span>' +
    '<span class="column-tag">Category</span>' +
    '<span class="column-tag">Owner</span>' +
    '<span class="column-tag">Likelihood</span>' +
    '<span class="column-tag">Impact</span>' +
    '<span class="column-tag">Status</span>' +
    '<span class="column-tag">Controls</span>' +
    "</div>" +
    "</div>" +
    '<div class="import-preview-benefits">' +
    '<div class="import-benefit">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>' +
    "<span>AI auto-categorizes your risks</span>" +
    "</div>" +
    '<div class="import-benefit">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>' +
    "<span>Suggests missing controls & actions</span>" +
    "</div>" +
    '<div class="import-benefit">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>' +
    "<span>Populates dashboards & reports instantly</span>" +
    "</div>" +
    "</div>" +
    '<div class="import-template-download">' +
    '<a href="/assets/templates/dimeri-erm-import-template.xlsx" download class="btn btn-ghost" id="download-template-btn">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
    " Download Template" +
    "</a>" +
    '<span class="template-hint">See the format before upgrading</span>' +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: "Import CSV or Excel Register",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Upgrade to Import", type: "primary", action: "upgrade" },
    ],
    onAction: function (action) {
      if (action === "upgrade") {
        window.location.href = "upgrade.html?plan=pro&source=import_feature";
      }
    },
  });
};

/* ========================================
   IMPORT FILE MODAL (PRO Users)
   ======================================== */
ERM.riskRegister.showImportFileModal = function () {
  var self = this;

  var content =
    '<div class="import-file-content">' +
    '<div class="import-file-hero">' +
    '<div class="import-file-icon">📥</div>' +
    '<h3 class="import-file-title">Import Risk Register</h3>' +
    "</div>" +
    '<p class="import-file-desc">Upload a CSV or Excel file to create a new risk register. AI will help categorize and enhance your risks.</p>' +
    '<div class="form-group">' +
    '<label class="form-label">Register Name</label>' +
    '<input type="text" class="form-input" id="import-register-name" placeholder="Enter a name for the new register">' +
    "</div>" +
    '<div class="form-group">' +
    '<label class="form-label">Upload File</label>' +
    '<div class="file-upload-area" id="import-file-upload-area">' +
    '<div class="file-upload-icon">📁</div>' +
    '<p class="file-upload-text">Drag & drop a CSV or Excel file here</p>' +
    '<p class="file-upload-hint">or click to browse</p>' +
    '<input type="file" id="import-register-file-input" accept=".csv,.xlsx,.xls" style="display:none;">' +
    "</div>" +
    "</div>" +
    '<div class="import-file-options">' +
    '<label class="checkbox-wrapper">' +
    '<input type="checkbox" id="import-ai-enhance" checked>' +
    '<span class="checkbox-custom"></span>' +
    '<span class="checkbox-label">AI enhance imported risks (recommended)</span>' +
    "</label>" +
    "</div>" +
    '<div class="import-template-download" style="margin-top: 16px;">' +
    '<a href="/assets/templates/dimeri-erm-import-template.xlsx" download class="btn btn-ghost">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
    " Download Template" +
    "</a>" +
    "</div>" +
    "</div>";

  var selectedFile = null;

  ERM.components.showModal({
    title: "Import Risk Register",
    content: content,
    size: "md",
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Import & Create", type: "primary", action: "import" },
    ],
    onOpen: function () {
      var uploadArea = document.getElementById("import-file-upload-area");
      var fileInput = document.getElementById("import-register-file-input");

      if (uploadArea && fileInput) {
        uploadArea.addEventListener("click", function () {
          fileInput.click();
        });

        // Handle drag and drop
        uploadArea.addEventListener("dragover", function (e) {
          e.preventDefault();
          uploadArea.classList.add("drag-over");
        });

        uploadArea.addEventListener("dragleave", function () {
          uploadArea.classList.remove("drag-over");
        });

        uploadArea.addEventListener("drop", function (e) {
          e.preventDefault();
          uploadArea.classList.remove("drag-over");
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            selectedFile = e.dataTransfer.files[0];
            uploadArea.innerHTML =
              '<div class="file-upload-icon">✅</div>' +
              '<p class="file-upload-text">' +
              ERM.utils.escapeHtml(selectedFile.name) +
              "</p>" +
              '<p class="file-upload-hint">Ready to import</p>';
          }
        });

        fileInput.addEventListener("change", function () {
          if (this.files && this.files[0]) {
            selectedFile = this.files[0];
            uploadArea.innerHTML =
              '<div class="file-upload-icon">✅</div>' +
              '<p class="file-upload-text">' +
              ERM.utils.escapeHtml(selectedFile.name) +
              "</p>" +
              '<p class="file-upload-hint">Ready to import</p>';
          }
        });
      }
    },
    onAction: function (action) {
      if (action === "import") {
        var registerName = document.getElementById("import-register-name");
        var aiEnhance = document.getElementById("import-ai-enhance");

        if (!registerName || !registerName.value.trim()) {
          ERM.toast.error("Please enter a name for the register");
          return;
        }

        if (!selectedFile) {
          ERM.toast.error("Please select a file to import");
          return;
        }

        // Process the file
        self.processImportFile(selectedFile, registerName.value.trim(), aiEnhance && aiEnhance.checked);
        ERM.components.closeModal();
      }
    },
  });
};

/**
 * Process imported file and create register
 */
ERM.riskRegister.processImportFile = function (file, registerName, aiEnhance) {
  var self = this;

  ERM.toast.info("Processing import file...");

  var reader = new FileReader();
  reader.onload = function (e) {
    var content = e.target.result;
    var risks = [];

    try {
      if (file.name.endsWith(".csv")) {
        risks = self.parseCSVToRisks(content);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        // For Excel, we'd need a library like SheetJS
        ERM.toast.error("Excel import requires additional setup. Please use CSV for now.");
        return;
      } else {
        ERM.toast.error("Unsupported file format. Please use CSV or Excel.");
        return;
      }

      if (risks.length === 0) {
        ERM.toast.error("No risks found in the file. Please check the format.");
        return;
      }

      // Create new register
      var newRegister = {
        id: ERM.utils.generateId(),
        name: registerName,
        description: "Imported from " + file.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        riskCount: risks.length,
        matrixType: "5x5",
        framework: "custom",
      };

      // Save register
      var registers = ERM.storage.get("registers") || [];
      registers.push(newRegister);
      ERM.storage.set("registers", registers);

      // Save risks with register ID
      var allRisks = ERM.storage.get("risks") || [];
      for (var i = 0; i < risks.length; i++) {
        risks[i].registerId = newRegister.id;
        risks[i].id = ERM.utils.generateId();
        risks[i].createdAt = new Date().toISOString();
        allRisks.push(risks[i]);
      }
      ERM.storage.set("risks", allRisks);

      ERM.toast.success("Imported " + risks.length + " risks into \"" + registerName + "\"");

      // Refresh the list
      if (self.init) {
        self.init();
      } else if (self.renderList) {
        self.renderList();
      }

    } catch (err) {
      console.error("Import error:", err);
      ERM.toast.error("Error parsing file: " + err.message);
    }
  };

  reader.onerror = function () {
    ERM.toast.error("Error reading file");
  };

  reader.readAsText(file);
};

/**
 * Parse CSV content to risks array
 */
ERM.riskRegister.parseCSVToRisks = function (csvContent) {
  var lines = csvContent.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse header row
  var headers = this.parseCSVRow(lines[0]);
  var headerMap = {};
  for (var h = 0; h < headers.length; h++) {
    var header = headers[h].toLowerCase().trim();
    // Map common column names
    if (header.indexOf("title") !== -1 || header.indexOf("name") !== -1) {
      headerMap.title = h;
    } else if (header.indexOf("desc") !== -1) {
      headerMap.description = h;
    } else if (header.indexOf("categ") !== -1) {
      headerMap.category = h;
    } else if (header.indexOf("owner") !== -1) {
      headerMap.owner = h;
    } else if (header.indexOf("likelihood") !== -1 || header.indexOf("prob") !== -1) {
      headerMap.likelihood = h;
    } else if (header.indexOf("impact") !== -1 || header.indexOf("sever") !== -1) {
      headerMap.impact = h;
    } else if (header.indexOf("status") !== -1) {
      headerMap.status = h;
    } else if (header.indexOf("treat") !== -1) {
      headerMap.treatment = h;
    }
  }

  var risks = [];
  for (var i = 1; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;

    var values = this.parseCSVRow(line);
    var title = headerMap.title !== undefined ? values[headerMap.title] : values[0];

    if (!title || !title.trim()) continue;

    var risk = {
      title: title.trim(),
      description: headerMap.description !== undefined ? (values[headerMap.description] || "") : "",
      category: headerMap.category !== undefined ? (values[headerMap.category] || "operational") : "operational",
      owner: headerMap.owner !== undefined ? (values[headerMap.owner] || "") : "",
      inherentLikelihood: this.parseScoreValue(headerMap.likelihood !== undefined ? values[headerMap.likelihood] : "3"),
      inherentImpact: this.parseScoreValue(headerMap.impact !== undefined ? values[headerMap.impact] : "3"),
      residualLikelihood: 2,
      residualImpact: 2,
      status: headerMap.status !== undefined ? (values[headerMap.status] || "Identified") : "Identified",
      treatment: headerMap.treatment !== undefined ? (values[headerMap.treatment] || "Mitigate") : "Mitigate",
      rootCauses: [],
      consequences: [],
      actionPlan: [],
      linkedControls: [],
      attachments: [],
    };

    risks.push(risk);
  }

  return risks;
};

/**
 * Parse a single CSV row handling quoted values
 */
ERM.riskRegister.parseCSVRow = function (row) {
  var result = [];
  var current = "";
  var inQuotes = false;

  for (var i = 0; i < row.length; i++) {
    var char = row[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
};

/**
 * Parse score value from string (1-5 or text like "High")
 */
ERM.riskRegister.parseScoreValue = function (value) {
  if (!value) return 3;

  var num = parseInt(value, 10);
  if (!isNaN(num) && num >= 1 && num <= 5) {
    return num;
  }

  var lower = value.toLowerCase().trim();
  if (lower === "very low" || lower === "rare") return 1;
  if (lower === "low" || lower === "unlikely") return 2;
  if (lower === "medium" || lower === "moderate" || lower === "possible") return 3;
  if (lower === "high" || lower === "likely") return 4;
  if (lower === "very high" || lower === "critical" || lower === "almost certain") return 5;

  return 3;
};

/* ========================================
   TEMPLATE SELECTION MODAL
   ======================================== */
ERM.riskRegister.showTemplateModal = function () {
  var self = this;

  var templates = [
    {
      id: "banking",
      name: "Banking & Finance",
      desc: "Basel III, AML/KYC, Market Risk",
      icon: "🏦",
    },
    {
      id: "healthcare",
      name: "Healthcare",
      desc: "HIPAA, Patient Safety, Clinical",
      icon: "🏥",
    },
    {
      id: "manufacturing",
      name: "Manufacturing",
      desc: "Supply Chain, Quality, Safety",
      icon: "🏭",
    },
    {
      id: "technology",
      name: "Technology",
      desc: "Cyber Security, Data Privacy",
      icon: "💻",
    },
    {
      id: "government",
      name: "Government/Public",
      desc: "PFMA, King IV, Compliance",
      icon: "🏛️",
    },
    {
      id: "retail",
      name: "Retail",
      desc: "Supply Chain, Consumer, Inventory",
      icon: "🏪",
    },
  ];

  var cardsHtml = "";
  for (var i = 0; i < templates.length; i++) {
    var t = templates[i];
    cardsHtml +=
      '<div class="template-card" data-template="' +
      t.id +
      '">' +
      '<div class="template-card-icon">' +
      t.icon +
      "</div>" +
      '<div class="template-card-content">' +
      '<div class="template-card-title">' +
      t.name +
      "</div>" +
      '<div class="template-card-desc">' +
      t.desc +
      "</div>" +
      "</div>" +
      "</div>";
  }

  var content =
    '<div class="template-selection">' +
    '<p class="text-secondary">Select an industry template to pre-populate your register with relevant risks:</p>' +
    '<div class="template-cards">' +
    cardsHtml +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: "Select Template",
    content: content,
    buttons: [{ label: "Back", type: "secondary", action: "back" }],
    onAction: function (action) {
      if (action === "back") {
        ERM.components.closeModal();
        setTimeout(function () {
          self.showCreateModal();
        }, 250);
      }
    },
    onOpen: function () {
      var cards = document.querySelectorAll(".template-card");
      for (var j = 0; j < cards.length; j++) {
        cards[j].addEventListener("click", function () {
          var templateId = this.getAttribute("data-template");
          ERM.components.closeModal();
          setTimeout(function () {
            self.showNameRegisterModal(templateId);
          }, 250);
        });
      }
    },
  });
};

/* ========================================
   NAME REGISTER MODAL
   ======================================== */
ERM.riskRegister.showNameRegisterModal = function (templateId) {
  var self = this;

  // Get industry from onboarding - require selection if not set
  var defaultIndustry = localStorage.getItem("ERM_industry") || null;
  var industryRequired = !defaultIndustry;

  // Professional SVG icons for register types
  var registerIcons = {
    enterprise: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="22" x2="9" y2="2"/><line x1="15" y1="22" x2="15" y2="2"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="7" x2="9" y2="7"/><line x1="15" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="9" y2="17"/><line x1="15" y1="17" x2="20" y2="17"/></svg>',
    strategic: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>',
    operational: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    financial: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    compliance: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    hse: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
    technology: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    project: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
  };

  // Register types
  var registerTypes = [
    {
      id: "enterprise",
      name: "Enterprise",
      icon: registerIcons.enterprise,
      desc: "All organizational risks",
    },
    {
      id: "strategic",
      name: "Strategic",
      icon: registerIcons.strategic,
      desc: "Board & executive level",
    },
    {
      id: "operational",
      name: "Operational",
      icon: registerIcons.operational,
      desc: "Day-to-day operations",
    },
    {
      id: "financial",
      name: "Financial",
      icon: registerIcons.financial,
      desc: "Treasury & financial",
    },
    {
      id: "compliance",
      name: "Compliance",
      icon: registerIcons.compliance,
      desc: "Regulatory & legal",
    },
    { id: "hse", name: "HSE", icon: registerIcons.hse, desc: "Health, Safety, Environment" },
    {
      id: "technology",
      name: "Technology",
      icon: registerIcons.technology,
      desc: "IT & cyber risks",
    },
    {
      id: "project",
      name: "Project",
      icon: registerIcons.project,
      desc: "Specific project risks",
    },
  ];

  // All possible industries
  var allIndustries = [
    { id: "public-sector", name: "Public Sector" },
    { id: "healthcare", name: "Healthcare" },
    { id: "oil-gas", name: "Oil & Gas" },
    { id: "energy", name: "Energy & Utilities" },
    { id: "manufacturing", name: "Manufacturing" },
    { id: "mining", name: "Mining" },
    { id: "other", name: "Other" },
  ];

  // Check which industries have templates loaded
  var getAvailableIndustries = function () {
    var available = [];
    for (var i = 0; i < allIndustries.length; i++) {
      var ind = allIndustries[i];
      // "Other" is always available (uses generic templates)
      if (ind.id === "other") {
        available.push({
          id: ind.id,
          name: ind.name,
          available: true,
        });
        continue;
      }
      // Check if templates exist for this industry
      var hasTemplates =
        typeof ERM_TEMPLATES !== "undefined" &&
        ERM_TEMPLATES[ind.id] &&
        (ERM_TEMPLATES[ind.id].categories || ERM_TEMPLATES[ind.id].risks);
      available.push({
        id: ind.id,
        name: ind.name,
        available: hasTemplates,
      });
    }
    return available;
  };

  var industries = getAvailableIndustries();

  // Build register type cards
  var typeCardsHtml = '<div class="register-type-grid">';
  for (var t = 0; t < registerTypes.length; t++) {
    var rt = registerTypes[t];
    var isDefault = rt.id === "enterprise";
    typeCardsHtml +=
      '<div class="register-type-card' +
      (isDefault ? " selected" : "") +
      '" data-type="' +
      rt.id +
      '">' +
      '<div class="register-type-icon">' +
      rt.icon +
      "</div>" +
      '<div class="register-type-name">' +
      rt.name +
      "</div>" +
      "</div>";
  }
  typeCardsHtml += "</div>";

  // Build custom industry dropdown - matching dashboard filter style
  var checkIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
  var chevronIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';

  // Find the default selected industry name
  var selectedIndustryName = "";
  if (defaultIndustry) {
    for (var i = 0; i < industries.length; i++) {
      if (industries[i].id === defaultIndustry) {
        selectedIndustryName = industries[i].name;
        break;
      }
    }
  }

  // Info icon for "Other" tooltip - clear filled question mark
  var infoIcon = '<span class="other-info-icon">?</span>';

  var industryDropdownHtml =
    '<div class="custom-dropdown' + (industryRequired ? ' required' : '') + '" id="industry-dropdown">' +
    '<button type="button" class="dropdown-trigger' + (!defaultIndustry ? ' placeholder' : '') + '" id="industry-dropdown-trigger">' +
    '<span class="dropdown-value" id="industry-dropdown-value">' + (selectedIndustryName || 'Select your industry') + '</span>' +
    '<span class="dropdown-arrow">' + chevronIcon + '</span>' +
    '</button>' +
    '<div class="dropdown-menu" id="industry-dropdown-menu">';

  for (var j = 0; j < industries.length; j++) {
    var ind = industries[j];
    var isSelected = ind.id === defaultIndustry;
    var isOther = ind.id === "other";
    industryDropdownHtml +=
      '<div class="dropdown-option' + (isSelected ? ' selected' : '') + '" data-value="' + ind.id + '">' +
      '<span class="option-label">' + ind.name +
      (isOther ? '<span class="other-info-wrapper" data-tooltip="Other uses Risk Management Best Practice AI Suggestions.">' + infoIcon + '</span>' : '') +
      '</span>' +
      '<span class="option-check">' + checkIcon + '</span>' +
      '</div>';
  }
  industryDropdownHtml += '</div></div>';
  industryDropdownHtml += '<input type="hidden" id="register-industry-select" value="' + (defaultIndustry || '') + '">';

  var placeholder = templateId
    ? "e.g., " +
      templateId.charAt(0).toUpperCase() +
      templateId.slice(1) +
      " Risk Register 2025"
    : "e.g., Operational Risk Register 2025";

  var content =
    '<div class="create-register-form">' +
    // Register Type
    '<div class="form-group">' +
    '<label class="form-label">Register Type</label>' +
    typeCardsHtml +
    "</div>" +
    // Register Name
    '<div class="form-group">' +
    '<label class="form-label">Register Name</label>' +
    '<input type="text" class="form-input" id="register-name-input" placeholder="' +
    placeholder +
    '">' +
    "</div>" +
    // Industry
    '<div class="form-group">' +
    '<label class="form-label">Industry <span class="text-muted">(for AI suggestions)</span></label>' +
    industryDropdownHtml +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: "Create Risk Register",
    content: content,
    buttons: [
      { label: "Back", type: "secondary", action: "back" },
      { label: "Create Register", type: "primary", action: "create" },
    ],
    onOpen: function () {
      // Bind register type card selection
      var typeCards = document.querySelectorAll(".register-type-card");
      for (var j = 0; j < typeCards.length; j++) {
        typeCards[j].addEventListener("click", function () {
          // Remove selected from all
          for (var k = 0; k < typeCards.length; k++) {
            typeCards[k].classList.remove("selected");
          }
          // Add selected to clicked
          this.classList.add("selected");

          // Auto-suggest name based on type
          var type = this.getAttribute("data-type");
          var nameInput = document.getElementById("register-name-input");
          if (nameInput && !nameInput.value) {
            var typeNames = {
              enterprise: "Enterprise Risk Register",
              strategic: "Strategic Risk Register",
              operational: "Operational Risk Register",
              financial: "Financial Risk Register",
              compliance: "Compliance Risk Register",
              hse: "HSE Risk Register",
              technology: "Technology Risk Register",
              project: "Project Risk Register",
            };
            nameInput.placeholder =
              "e.g., " + (typeNames[type] || "Risk Register") + " 2025";
          }
        });
      }

      // Bind custom industry dropdown events
      var industryDropdown = document.getElementById("industry-dropdown");
      var industryTrigger = document.getElementById("industry-dropdown-trigger");
      var industryMenu = document.getElementById("industry-dropdown-menu");
      var industryHiddenInput = document.getElementById("register-industry-select");
      var industryValueDisplay = document.getElementById("industry-dropdown-value");

      if (industryTrigger && industryMenu) {
        // Toggle dropdown on trigger click
        industryTrigger.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          industryDropdown.classList.toggle("open");
        });

        // Handle option selection
        var industryOptions = industryMenu.querySelectorAll(".dropdown-option");
        for (var io = 0; io < industryOptions.length; io++) {
          industryOptions[io].addEventListener("click", function (e) {
            e.stopPropagation();
            var value = this.getAttribute("data-value");
            // Get just the industry name, not the info icon text
            var labelEl = this.querySelector(".option-label");
            var label = labelEl.childNodes[0].textContent || labelEl.textContent;

            // Update hidden input
            if (industryHiddenInput) industryHiddenInput.value = value;

            // Update display
            if (industryValueDisplay) industryValueDisplay.textContent = label.trim();

            // Remove placeholder class since we now have a selection
            industryTrigger.classList.remove("placeholder");

            // Remove error state if present
            industryDropdown.classList.remove("error");

            // Update selected state
            for (var ios = 0; ios < industryOptions.length; ios++) {
              industryOptions[ios].classList.remove("selected");
            }
            this.classList.add("selected");

            // Close dropdown
            industryDropdown.classList.remove("open");
          });
        }

        // Close dropdown when clicking outside
        document.addEventListener("click", function (e) {
          if (industryDropdown && !industryDropdown.contains(e.target)) {
            industryDropdown.classList.remove("open");
          }
        });

        // Close on escape key
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && industryDropdown.classList.contains("open")) {
            industryDropdown.classList.remove("open");
          }
        });
      }
    },
    onAction: function (action) {
      if (action === "back") {
        ERM.components.closeModal();
        setTimeout(function () {
          if (templateId) {
            self.showTemplateModal();
          } else {
            self.showCreateModal();
          }
        }, 250);
      } else if (action === "create") {
        var nameInput = document.getElementById("register-name-input");
        var industrySelect = document.getElementById(
          "register-industry-select"
        );
        var selectedTypeCard = document.querySelector(
          ".register-type-card.selected"
        );

        var name = nameInput ? nameInput.value.trim() : "";
        var industry = industrySelect ? industrySelect.value : "";
        var registerType = selectedTypeCard
          ? selectedTypeCard.getAttribute("data-type")
          : "enterprise";

        if (!name) {
          ERM.toast.error("Please enter a register name");
          return;
        }

        if (!industry) {
          ERM.toast.error("Please select an industry");
          // Highlight the dropdown
          var dropdown = document.getElementById("industry-dropdown");
          if (dropdown) {
            dropdown.classList.add("error");
            setTimeout(function() { dropdown.classList.remove("error"); }, 2000);
          }
          return;
        }

        // Check uniqueness
        var registers = ERM.storage.get("registers") || [];
        for (var i = 0; i < registers.length; i++) {
          if (registers[i].name.toLowerCase() === name.toLowerCase()) {
            ERM.toast.error("A register with this name already exists");
            return;
          }
        }

        // Create register with type and industry
        var newRegister = {
          id: ERM.utils.generateId("reg"),
          name: name,
          type: registerType,
          industry: industry,
          template: templateId,
          createdAt: new Date().toISOString(),
          createdBy: (ERM.state.user && ERM.state.user.name) || "User",
          riskCount: 0,
        };

        registers.push(newRegister);
        ERM.storage.set("registers", registers);

        // Log activity for register creation
        if (ERM.activityLogger) {
          ERM.activityLogger.log('register', 'created', 'register', newRegister.name, {
            registerId: newRegister.id,
            type: newRegister.type,
            industry: newRegister.industry
          });
        }

        // Generate template risks if applicable (from pre-built templates)
        if (templateId) {
          self.generateTemplateRisks(newRegister.id, templateId);
          ERM.components.closeModal();
          self.renderRegisterList();
          ERM.toast.success("Register created successfully");
        } else {
          // Show AI starter risks prompt
          ERM.components.closeModal();
          setTimeout(function () {
            self.showAIStarterPrompt(newRegister);
          }, 300);
        }
      }
    },
  });
};

/* ========================================
   AI STARTER RISKS PROMPT
   ======================================== */
ERM.riskRegister.showAIStarterPrompt = function (register) {
  var self = this;

  // Format display names
  var typeNames = {
    enterprise: "Enterprise",
    strategic: "Strategic",
    operational: "Operational",
    financial: "Financial",
    compliance: "Compliance",
    hse: "Health, Safety & Environment",
    technology: "Technology",
    project: "Project",
  };

  var industryNames = {
    mining: "Mining",
    "public-sector": "Public Sector",
    healthcare: "Healthcare",
    banking: "Banking & Finance",
    insurance: "Insurance",
    energy: "Energy & Utilities",
    manufacturing: "Manufacturing",
    retail: "Retail & Consumer",
    technology: "Technology & SaaS",
    construction: "Construction",
    transport: "Transportation",
    education: "Education",
    other: "General",
  };

  var typeName = typeNames[register.type] || register.type;
  var industryName = industryNames[register.industry] || register.industry;

  var content =
    '<div class="ai-starter-prompt">' +
    '<div class="ai-starter-icon">✨</div>' +
    '<p class="ai-starter-text">Would you like AI to suggest starter risks for your <strong>' +
    typeName +
    "</strong> register?</p>" +
    '<p class="ai-starter-subtext">Based on ' +
    industryName +
    " industry best practices</p>" +
    "</div>";

  ERM.components.showModal({
    title: "AI Risk Assistant",
    content: content,
    size: "small",
    buttons: [
      { label: "No, start empty", type: "secondary", action: "skip" },
      { label: "Yes, help me start", type: "primary", action: "suggest" },
    ],
    onAction: function (action) {
      if (action === "skip") {
        ERM.components.closeModal();
        self.renderRegisterList();
        ERM.toast.success("Register created successfully");
      } else if (action === "suggest") {
        self.showAIStarterThinking(register, typeName, industryName);
      }
    },
  });
};

/* ========================================
   AI STARTER THINKING ANIMATION
   Now integrates with DeepSeek for real AI-generated risks
   Uses the same design pattern as "Describe with AI" thinking modal
   ======================================== */
ERM.riskRegister.showAIStarterThinking = function (
  register,
  typeName,
  industryName
) {
  var self = this;

  // Sparkles icon for header
  var sparklesIcon = '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>';

  // Build steps HTML with the same pattern as showThinkingModal
  var steps = [
    { text: "Consulting " + industryName + " industry expert", delay: 800 },
    { text: "Analyzing " + typeName + " risk landscape", delay: 800 },
    { text: "Identifying high-priority risks", delay: 800 },
    { text: "Preparing personalized recommendations", delay: 800 }
  ];

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

  // Update modal content with thinking steps
  var modalBody = document.querySelector(".modal-body");
  if (!modalBody) return;

  modalBody.innerHTML =
    '<div class="ai-thinking-container">' +
    '<div class="ai-thinking-header">' +
    '<div class="ai-brain-animation">' +
    '<div class="ai-brain-circle"></div>' +
    '<div class="ai-brain-circle"></div>' +
    '<div class="ai-brain-circle"></div>' +
    sparklesIcon +
    "</div>" +
    "<h3>AI is generating starter risks</h3>" +
    '<p class="ai-input-preview">' + industryName + " - " + typeName + '</p>' +
    "</div>" +
    '<div class="ai-steps-container">' +
    stepsHtml +
    "</div>" +
    "</div>";

  // Style the modal body
  modalBody.style.cssText = "padding: 0 !important; max-height: none !important; overflow: visible !important;";

  // Hide footer buttons during thinking
  var modalFooter = document.querySelector(".modal-footer");
  if (modalFooter) {
    modalFooter.style.display = "none";
  }

  // Hide modal header during thinking
  var modalHeader = document.querySelector(".modal-header");
  if (modalHeader) {
    modalHeader.style.display = "none";
  }

  // Add thinking modal class to modal
  var modal = document.querySelector(".modal");
  if (modal) {
    modal.classList.add("ai-thinking-modal");
  }

  // Track if API call is complete
  var apiComplete = false;
  var apiResult = null;
  var apiError = null;
  var animationComplete = false;

  // Helper to show results when both animation and API are done
  function tryShowResults() {
    if (animationComplete && apiComplete) {
      // Mark last step as complete
      var lastStep = modalBody.querySelector('.ai-step[data-step="3"]');
      if (lastStep) {
        lastStep.classList.remove("active");
        lastStep.classList.add("complete");
      }

      setTimeout(function () {
        // Restore modal styling before showing results
        if (modalHeader) {
          modalHeader.style.display = "";
        }
        if (modal) {
          modal.classList.remove("ai-thinking-modal");
        }
        if (modalBody) {
          modalBody.style.cssText = "";
        }

        if (apiError) {
          // Fall back to template-based suggestions
          console.warn("[StarterRisks] DeepSeek failed, using templates:", apiError);
          self.showAIStarterTemplates(register, null);
        } else {
          // Show DeepSeek-generated risks
          self.showAIStarterTemplates(register, apiResult);
        }
      }, 400);
    }
  }

  // Start DeepSeek API call immediately
  if (typeof ERM.riskAI !== "undefined" &&
      typeof ERM.riskAI.starterRisks !== "undefined" &&
      typeof ERM.riskAI.starterRisks.fetchFromDeepSeek === "function") {

    console.log("[StarterRisks] Calling DeepSeek for:", register.industry, register.type);

    ERM.riskAI.starterRisks.fetchFromDeepSeek(
      register.industry,
      register.type,
      function (error, risks) {
        apiComplete = true;
        if (error) {
          apiError = error;
          console.warn("[StarterRisks] DeepSeek error:", error);
        } else {
          apiResult = ERM.riskAI.starterRisks.convertToTemplates(risks);
          console.log("[StarterRisks] DeepSeek returned", apiResult.length, "risks");
        }
        tryShowResults();
      }
    );
  } else {
    // DeepSeek module not available, will fall back to templates
    console.log("[StarterRisks] DeepSeek module not available, using templates");
    apiComplete = true;
    apiError = { error: "DeepSeek module not loaded" };
  }

  // Animate steps sequentially (matching showThinkingModal pattern)
  function animateStep(stepIndex) {
    if (stepIndex >= steps.length) {
      // All steps complete
      animationComplete = true;
      tryShowResults();
      return;
    }

    var stepEl = modalBody.querySelector('.ai-step[data-step="' + stepIndex + '"]');
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

  // Start animation after brief delay
  setTimeout(function () {
    animateStep(0);
  }, 300);
};

/* ========================================
   AI STARTER TEMPLATES SELECTION
   Updated to support DeepSeek-generated risks
   ======================================== */
ERM.riskRegister.showAIStarterTemplates = function (register, deepSeekTemplates) {
  var self = this;

  // Use DeepSeek templates if provided, otherwise fall back to static templates
  var templates;
  var isAIGenerated = false;

  if (deepSeekTemplates && deepSeekTemplates.length > 0) {
    templates = deepSeekTemplates;
    isAIGenerated = true;
    console.log("[StarterRisks] Using DeepSeek-generated risks:", templates.length);
  } else {
    // Fallback to static templates
    templates = this.getStarterTemplates(register.industry, register.type);
    console.log("[StarterRisks] Using static templates:", templates ? templates.length : 0);
  }

  if (!templates || templates.length === 0) {
    // No templates available - show helpful message
    var modalBody = document.querySelector(".modal-body");
    var modalFooter = document.querySelector(".modal-footer");

    var errorMessage = isAIGenerated
      ? "<p>AI could not generate starter risks at this time.</p>"
      : "<p>Could not connect to AI service.</p>";

    if (modalBody) {
      modalBody.innerHTML =
        '<div class="ai-starter-empty">' +
        '<div style="text-align: center; padding: 20px;">' +
        '<div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>' +
        errorMessage +
        '<p class="text-muted" style="margin-top: 8px;">Make sure the AI proxy server is running (npm start in server folder).</p>' +
        '<p class="text-muted">You can add risks manually using the AI assistant once in your register.</p>' +
        "</div>" +
        "</div>";
    }

    if (modalFooter) {
      modalFooter.style.display = "flex";
      modalFooter.innerHTML =
        '<button type="button" class="btn btn-secondary" onclick="ERM.riskRegister.showAIStarterThinking(ERM.riskRegister.state.registers[ERM.riskRegister.state.registers.length-1], \'\', \'\');">Retry</button>' +
        '<button type="button" class="btn btn-primary" onclick="ERM.components.closeModal(); ERM.riskRegister.renderRegisterList(); ERM.toast.success(\'Register created successfully\');">Continue Without</button>';
    }
    return;
  }

  // Take first 5 templates for AI-generated, first 3 for static
  var maxTemplates = isAIGenerated ? 5 : 3;
  var displayTemplates = templates.slice(0, maxTemplates);

  // Build template cards
  var cardsHtml = "";
  for (var i = 0; i < displayTemplates.length; i++) {
    var tmpl = displayTemplates[i];
    var isChecked = i < 2; // First 2 pre-checked
    var description = tmpl.descriptions ? tmpl.descriptions[0] : "";
    // Truncate description
    if (description.length > 100) {
      description = description.substring(0, 100) + "...";
    }

    cardsHtml +=
      '<div class="ai-starter-card' +
      (isChecked ? " selected" : "") +
      '" data-template-id="' +
      tmpl.id +
      '">' +
      '<div class="ai-starter-card-check">' +
      '<input type="checkbox" id="starter-' +
      i +
      '"' +
      (isChecked ? " checked" : "") +
      ">" +
      "</div>" +
      '<div class="ai-starter-card-content">' +
      '<div class="ai-starter-card-title">' +
      (tmpl.titles ? tmpl.titles[0] : tmpl.id) +
      "</div>" +
      '<div class="ai-starter-card-desc">' +
      description +
      "</div>" +
      "</div>" +
      "</div>";
  }

  // Update modal content
  var modalBody = document.querySelector(".modal-body");
  var modalFooter = document.querySelector(".modal-footer");

  // Different intro text for AI-generated vs static templates
  var introText = isAIGenerated
    ? '<p class="ai-starter-templates-intro">✨ AI-Generated Starter Risks</p>' +
      '<p class="ai-starter-templates-subtext">Personalized recommendations from our industry expert</p>'
    : '<p class="ai-starter-templates-intro">✨ Recommended Starter Risks</p>';

  if (modalBody) {
    modalBody.innerHTML =
      '<div class="ai-starter-templates">' +
      introText +
      '<div class="ai-starter-cards">' +
      cardsHtml +
      "</div>" +
      "</div>";

    // Bind card clicks to toggle checkbox
    var cards = modalBody.querySelectorAll(".ai-starter-card");
    for (var j = 0; j < cards.length; j++) {
      cards[j].addEventListener("click", function (e) {
        if (e.target.type === "checkbox") return; // Let checkbox handle itself
        var checkbox = this.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          this.classList.toggle("selected", checkbox.checked);
        }
      });

      // Sync card state with checkbox
      var checkbox = cards[j].querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.addEventListener("change", function () {
          this.closest(".ai-starter-card").classList.toggle(
            "selected",
            this.checked
          );
        });
      }
    }
  }

  if (modalFooter) {
    modalFooter.style.display = "flex";
    modalFooter.innerHTML =
      '<button type="button" class="btn btn-ghost" id="btn-starter-skip">Skip</button>' +
      '<button type="button" class="btn btn-primary" id="btn-starter-add">Add Selected</button>';

    // Bind buttons
    document
      .getElementById("btn-starter-skip")
      .addEventListener("click", function () {
        ERM.components.closeModal();
        self.renderRegisterList();
        ERM.toast.success("Register created successfully");
      });

    document
      .getElementById("btn-starter-add")
      .addEventListener("click", function () {
        self.addStarterRisks(register, displayTemplates);
      });
  }
};

/* ========================================
   GET STARTER TEMPLATES
   ======================================== */
ERM.riskRegister.getStarterTemplates = function (industry, registerType) {
  // Check if templates exist
  if (typeof ERM_TEMPLATES === "undefined" || !ERM_TEMPLATES[industry]) {
    return [];
  }

  var risks = ERM_TEMPLATES[industry].risks;
  if (!risks) return [];

  // Map register type to risk category keys
  var categoryMap = {
    enterprise: ["strategic", "operational", "financial", "governance", "reputation"],
    strategic: ["strategic", "governance", "reputation", "market"],
    operational: ["operational", "production", "quality", "business-continuity", "supply-chain"],
    financial: ["financial", "cash-flow", "fraud", "financial-reporting"],
    compliance: ["compliance", "regulatory", "contract", "litigation", "employment-law"],
    hse: ["fatal-risk-management", "hse", "safety", "environmental", "workplace-safety"],
    technology: ["technology", "cyber", "it", "cybersecurity", "data-privacy", "system-failure"],
    project: ["project"],
  };

  var targetCategories = categoryMap[registerType] || [registerType];
  var templates = [];

  // Search through risk categories
  for (var catKey in risks) {
    if (!risks.hasOwnProperty(catKey)) continue;

    // Check if this category matches our target
    var matches = false;
    for (var i = 0; i < targetCategories.length; i++) {
      if (catKey.toLowerCase().indexOf(targetCategories[i]) !== -1) {
        matches = true;
        break;
      }
    }

    if (matches && Array.isArray(risks[catKey])) {
      for (var j = 0; j < risks[catKey].length; j++) {
        templates.push(risks[catKey][j]);
      }
    }
  }

  // Shuffle and return
  if (typeof ERM.riskAI !== "undefined" && ERM.riskAI.shuffleArray) {
    templates = ERM.riskAI.shuffleArray(templates);
  }

  return templates;
};

/* ========================================
   ADD STARTER RISKS TO REGISTER
   ======================================== */
ERM.riskRegister.addStarterRisks = function (register, templates) {
  var self = this;

  // Get checked templates
  var checkboxes = document.querySelectorAll(
    '.ai-starter-card input[type="checkbox"]:checked'
  );
  var selectedIds = [];
  for (var i = 0; i < checkboxes.length; i++) {
    var card = checkboxes[i].closest(".ai-starter-card");
    if (card) {
      selectedIds.push(card.getAttribute("data-template-id"));
    }
  }

  if (selectedIds.length === 0) {
    ERM.toast.warning("Please select at least one risk or click Skip");
    return;
  }

  // Find templates by ID and create risks
  var risks = ERM.storage.get("risks") || [];
  var addedCount = 0;

  for (var j = 0; j < templates.length; j++) {
    var tmpl = templates[j];
    if (selectedIds.indexOf(tmpl.id) === -1) continue;

    // Create risk from template
    var newRisk = {
      id: ERM.utils.generateId("risk"),
      registerId: register.id,
      title: tmpl.titles ? tmpl.titles[0] : tmpl.id,
      description: tmpl.descriptions ? tmpl.descriptions[0] : "",
      category: tmpl.relatedCategories
        ? tmpl.relatedCategories[0]
        : "operational",
      rootCauses: tmpl.rootCauses ? tmpl.rootCauses.slice(0, 3) : [],
      consequences: tmpl.consequences ? tmpl.consequences.slice(0, 3) : [],
      existingControls: [],
      linkedControls: [],
      inherentLikelihood: tmpl.scoring ? tmpl.scoring.inherentLikelihood : 3,
      inherentImpact: tmpl.scoring ? tmpl.scoring.inherentImpact : 3,
      residualLikelihood: tmpl.scoring ? tmpl.scoring.residualLikelihood : 2,
      residualImpact: tmpl.scoring ? tmpl.scoring.residualImpact : 2,
      treatment: tmpl.treatment ? tmpl.treatment.recommended : "mitigate",
      status: "identified",
      actionPlan: tmpl.actionPlans ? tmpl.actionPlans.slice(0, 3) : [],
      owner:
        tmpl.owners && tmpl.owners.riskOwner ? tmpl.owners.riskOwner[0] : "",
      actionOwner:
        tmpl.owners && tmpl.owners.actionOwner
          ? tmpl.owners.actionOwner[0]
          : "",
      targetDate: self.calculateTargetDate(90),
      reviewDate: self.calculateTargetDate(30),
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: (ERM.state.user && ERM.state.user.name) || "User",
    };

    risks.push(newRisk);
    addedCount++;
  }

  // Save risks
  ERM.storage.set("risks", risks);

  // Update register risk count
  var registers = ERM.storage.get("registers") || [];
  for (var k = 0; k < registers.length; k++) {
    if (registers[k].id === register.id) {
      registers[k].riskCount = addedCount;
      break;
    }
  }
  ERM.storage.set("registers", registers);

  // Close and notify
  ERM.components.closeModal();
  self.renderRegisterList();
  ERM.toast.success(
    "Register created with " +
      addedCount +
      " starter risk" +
      (addedCount > 1 ? "s" : "")
  );
};

/* ========================================
   CALCULATE TARGET DATE HELPER
   ======================================== */
ERM.riskRegister.calculateTargetDate = function (daysFromNow) {
  var date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
};

/* ========================================
   RENAME REGISTER MODAL
   ======================================== */
ERM.riskRegister.showRenameModal = function (register) {
  var self = this;

  var content =
    '<div class="form-group">' +
    '<label class="form-label">Register Name</label>' +
    '<input type="text" class="form-input" id="rename-register-input" value="' +
    ERM.utils.escapeHtml(register.name) +
    '">' +
    "</div>";

  ERM.components.showModal({
    title: "Rename Register",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Save", type: "primary", action: "save" },
    ],
    onAction: function (action) {
      if (action === "save") {
        var input = document.getElementById("rename-register-input");
        var newName = input ? input.value.trim() : "";

        if (!newName) {
          ERM.toast.error("Please enter a name");
          return;
        }

        var registers = ERM.storage.get("registers") || [];
        var oldName = register.name;
        for (var i = 0; i < registers.length; i++) {
          if (registers[i].id === register.id) {
            registers[i].name = newName;
            break;
          }
        }
        ERM.storage.set("registers", registers);

        // Log activity for register rename
        if (ERM.activityLogger) {
          ERM.activityLogger.log('register', 'updated', 'register', newName, {
            registerId: register.id,
            previousName: oldName
          });
        }

        ERM.components.closeModal();
        self.renderRegisterList();
        ERM.toast.success("Register renamed");
      }
    },
  });
};

/* ========================================
   DELETE REGISTER MODAL
   ======================================== */
ERM.riskRegister.showDeleteRegisterModal = function (register) {
  var self = this;

  var content =
    '<div class="confirm-delete">' +
    '<div class="confirm-icon danger">' +
    this.icons.alertTriangle +
    "</div>" +
    '<h3>Delete "' +
    ERM.utils.escapeHtml(register.name) +
    '"?</h3>' +
    "<p>This will permanently delete this register and all " +
    (register.riskCount || 0) +
    " risks.</p>" +
    '<p class="text-muted">This action cannot be undone.</p>' +
    "</div>";

  ERM.components.showModal({
    title: "Delete Register",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Delete", type: "danger", action: "delete" },
    ],
    onAction: function (action) {
      if (action === "delete") {
        self.deleteRegister(register.id);
        ERM.components.closeModal();
      }
    },
  });
};

/* ========================================
   BULK DELETE REGISTERS MODAL
   ======================================== */
ERM.riskRegister.showBulkDeleteRegistersModal = function (registerIds) {
  var self = this;

  var content =
    '<div class="confirm-delete">' +
    '<div class="confirm-icon danger">' +
    this.icons.alertTriangle +
    "</div>" +
    "<h3>Delete " +
    registerIds.length +
    " registers?</h3>" +
    "<p>This will permanently delete these registers and all their risks.</p>" +
    '<p class="text-muted">This action cannot be undone.</p>' +
    "</div>";

  ERM.components.showModal({
    title: "Delete Registers",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Delete All", type: "danger", action: "delete" },
    ],
    onAction: function (action) {
      if (action === "delete") {
        var registers = ERM.storage.get("registers") || [];
        var risks = ERM.storage.get("risks") || [];

        registers = registers.filter(function (r) {
          return registerIds.indexOf(r.id) === -1;
        });

        risks = risks.filter(function (r) {
          return registerIds.indexOf(r.registerId) === -1;
        });

        ERM.storage.set("registers", registers);
        ERM.storage.set("risks", risks);

        ERM.components.closeModal();
        self.renderRegisterList();
        ERM.toast.success(registerIds.length + " registers deleted");
      }
    },
  });
};

/* ========================================
   MODIFY REGISTER MODAL
   ======================================== */
ERM.riskRegister.showModifyRegisterModal = function () {
  var self = this;
  var register = this.state.currentRegister;

  var content =
    '<div class="form-group">' +
    '<label class="form-label">Register Name</label>' +
    '<input type="text" class="form-input" id="modify-register-name" value="' +
    ERM.utils.escapeHtml(register.name) +
    '">' +
    "</div>" +
    '<div class="form-group">' +
    '<label class="form-label">Description</label>' +
    '<textarea class="form-textarea" id="modify-register-desc" rows="3" placeholder="Optional description...">' +
    ERM.utils.escapeHtml(register.description || "") +
    "</textarea>" +
    "</div>";

  ERM.components.showModal({
    title: "Modify Register",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Save Changes", type: "primary", action: "save" },
    ],
    onAction: function (action) {
      if (action === "save") {
        var nameInput = document.getElementById("modify-register-name");
        var descInput = document.getElementById("modify-register-desc");
        var newName = nameInput ? nameInput.value.trim() : "";
        var newDesc = descInput ? descInput.value.trim() : "";

        if (!newName) {
          ERM.toast.error("Please enter a register name");
          return;
        }

        var registers = ERM.storage.get("registers") || [];
        for (var i = 0; i < registers.length; i++) {
          if (registers[i].id === register.id) {
            registers[i].name = newName;
            registers[i].description = newDesc;
            registers[i].updatedAt = new Date().toISOString();
            self.state.currentRegister = registers[i];
            break;
          }
        }
        ERM.storage.set("registers", registers);
        ERM.components.closeModal();
        self.renderRegisterDetail();
        ERM.toast.success("Register updated");
      }
    },
  });
};

/* ========================================
   EXPORT MODAL - FORMAT SELECTION
   ======================================== */
ERM.riskRegister.showExportModal = function () {
  var self = this;
  var registerName = this.state.currentRegister ? this.state.currentRegister.name : "Risk Register";

  var content =
    '<div class="export-format-selection">' +
    '<p class="export-intro">Select an export format for <strong>"' + ERM.utils.escapeHtml(registerName) + '"</strong></p>' +
    '<div class="export-format-cards">' +
    // PDF Option (Free)
    '<div class="export-format-card" data-format="pdf">' +
    '<div class="export-format-icon">' +
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>' +
    '</div>' +
    '<div class="export-format-info">' +
    '<div class="export-format-title">PDF Report</div>' +
    '<div class="export-format-desc">Stakeholder-ready document with branding</div>' +
    '</div>' +
    '<div class="export-format-badge free">Free</div>' +
    '</div>' +
    // Excel Option (Pro)
    '<div class="export-format-card pro-feature" data-format="excel">' +
    '<div class="export-format-icon">' +
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>' +
    '</div>' +
    '<div class="export-format-info">' +
    '<div class="export-format-title">Excel Spreadsheet</div>' +
    '<div class="export-format-desc">Full data export with formatting</div>' +
    '</div>' +
    '<div class="export-format-badge pro">Pro</div>' +
    '</div>' +
    // CSV Option (Pro)
    '<div class="export-format-card pro-feature" data-format="csv">' +
    '<div class="export-format-icon">' +
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>' +
    '</div>' +
    '<div class="export-format-info">' +
    '<div class="export-format-title">CSV File</div>' +
    '<div class="export-format-desc">Raw data for analysis tools</div>' +
    '</div>' +
    '<div class="export-format-badge pro">Pro</div>' +
    '</div>' +
    '</div>' +
    '</div>';

  ERM.components.showModal({
    title: "Export Risk Register",
    content: content,
    size: "medium",
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      var cards = document.querySelectorAll(".export-format-card");
      for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener("click", function () {
          var format = this.getAttribute("data-format");
          var isPro = this.classList.contains("pro-feature");

          ERM.components.closeModal();

          // Small delay to allow first modal to close before opening next
          setTimeout(function () {
            if (isPro) {
              // Show upgrade modal for Pro features
              self.showExportUpgradeModal(format);
            } else if (format === "pdf") {
              // Show PDF configuration modal
              self.showPDFConfigModal();
            }
          }, 150);
        });
      }
    },
  });
};

/* ========================================
   EXPORT UPGRADE MODAL (Excel/CSV)
   ======================================== */
ERM.riskRegister.showExportUpgradeModal = function (format) {
  var formatName = format === "excel" ? "Excel Spreadsheet" : "CSV File";
  var formatIcon = format === "excel" ? "📊" : "📋";

  var content =
    '<div class="upgrade-prompt">' +
    '<div class="upgrade-icon">' + formatIcon + '</div>' +
    '<h3 class="upgrade-title">' + formatName + ' Export</h3>' +
    '<p class="upgrade-desc">' + formatName + ' exports are available on paid plans.</p>' +
    '<div class="upgrade-features">' +
    '<div class="upgrade-feature"><span class="feature-check">✓</span> Full data export with all fields</div>' +
    '<div class="upgrade-feature"><span class="feature-check">✓</span> Formatted columns and headers</div>' +
    '<div class="upgrade-feature"><span class="feature-check">✓</span> Compatible with analysis tools</div>' +
    '<div class="upgrade-feature"><span class="feature-check">✓</span> Bulk export multiple registers</div>' +
    '</div>' +
    '</div>';

  ERM.components.showModal({
    title: "Upgrade to Pro",
    content: content,
    size: "small",
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Upgrade", type: "primary", action: "upgrade" },
    ],
    onAction: function (action) {
      if (action === "upgrade") {
        ERM.components.closeModal();
        // Navigate to upgrade/pricing
        if (typeof ERM.navigation !== "undefined") {
          ERM.navigation.switchView("settings");
        }
        ERM.toast.info("Upgrade to Pro to unlock Excel and CSV exports");
      }
    },
  });
};

/* ========================================
   PDF CONFIGURATION MODAL - Full Featured
   ======================================== */
ERM.riskRegister.showPDFConfigModal = function () {
  var self = this;
  var register = this.state.currentRegister;
  var registerName = register ? register.name : "Risk Register";

  // Generate unique report ID
  var reportId = "RPT-" + Date.now().toString(36).toUpperCase();

  // Store for later use
  this._currentReportId = reportId;

  // Build field checkboxes HTML
  var fieldsHtml = this.buildFieldCheckboxesHtml();

  var content =
    '<div class="pdf-config-modal-full">' +
    '<div class="pdf-config-scroll">' +
    // Document Setup Section
    '<div class="config-section">' +
    '<div class="config-section-header">' +
    '<span class="config-section-icon">📋</span>' +
    '<span class="config-section-title">Document Setup</span>' +
    '</div>' +
    '<div class="config-section-body">' +
    '<div class="config-row">' +
    '<div class="config-field">' +
    '<label class="config-label">Report Title</label>' +
    '<input type="text" class="form-input" id="pdf-report-title" value="' + ERM.utils.escapeHtml(registerName + ' Report') + '">' +
    '</div>' +
    '<div class="config-field">' +
    '<label class="config-label">Export Format</label>' +
    '<div class="format-display">' +
    '<span class="format-icon">📄</span>' +
    '<span>PDF Document</span>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="config-row">' +
    '<div class="config-field">' +
    '<label class="config-label">Page Orientation</label>' +
    '<div class="btn-group-toggle">' +
    '<button type="button" class="btn-toggle active" data-orientation="portrait">' +
    '<svg width="14" height="18" viewBox="0 0 14 18" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="12" height="16" rx="1"/></svg>' +
    ' Portrait</button>' +
    '<button type="button" class="btn-toggle" data-orientation="landscape">' +
    '<svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="16" height="12" rx="1"/></svg>' +
    ' Landscape</button>' +
    '</div>' +
    '</div>' +
    '<div class="config-field">' +
    '<label class="config-label">Show Page Numbers</label>' +
    '<div class="btn-group-toggle btn-group-sm">' +
    '<button type="button" class="btn-toggle active" data-pagenums="yes">Yes</button>' +
    '<button type="button" class="btn-toggle" data-pagenums="no">No</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    // Logo & Branding Section
    '<div class="config-section">' +
    '<div class="config-section-header">' +
    '<span class="config-section-icon">🎨</span>' +
    '<span class="config-section-title">Logo & Branding</span>' +
    '</div>' +
    '<div class="config-section-body">' +
    '<div class="config-row">' +
    '<div class="config-field">' +
    '<label class="config-label">Upload Logo</label>' +
    '<div class="logo-upload-box" id="logo-upload-area">' +
    '<div class="logo-upload-content" id="logo-placeholder">' +
    '<span class="logo-upload-icon">📁</span>' +
    '<span class="logo-upload-text">Click to upload logo</span>' +
    '<span class="logo-upload-hint">JPG, PNG, GIF</span>' +
    '</div>' +
    '<img id="logo-preview" class="logo-preview-img" style="display:none;" alt="Logo">' +
    '<input type="file" id="logo-file-input" accept="image/*" style="display:none;">' +
    '</div>' +
    '<button type="button" class="btn btn-ghost btn-xs" id="remove-logo-btn" style="display:none;margin-top:8px;">Remove Logo</button>' +
    '</div>' +
    '<div class="config-field">' +
    '<label class="config-label">Logo Position</label>' +
    '<div class="logo-position-grid">' +
    '<button type="button" class="logo-pos-btn active" data-position="top-left">Top Left</button>' +
    '<button type="button" class="logo-pos-btn" data-position="top-center">Top Center</button>' +
    '<button type="button" class="logo-pos-btn" data-position="top-right">Top Right</button>' +
    '<button type="button" class="logo-pos-btn" data-position="bottom-left">Bottom Left</button>' +
    '<button type="button" class="logo-pos-btn" data-position="bottom-center">Bottom Center</button>' +
    '<button type="button" class="logo-pos-btn" data-position="bottom-right">Bottom Right</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    // Signature Blocks Section
    '<div class="config-section">' +
    '<div class="config-section-header">' +
    '<span class="config-section-icon">✍️</span>' +
    '<span class="config-section-title">Signature Blocks</span>' +
    '</div>' +
    '<div class="config-section-body">' +
    '<div class="config-row">' +
    '<div class="config-field">' +
    '<label class="config-label">Signature Block Position</label>' +
    '<div class="btn-group-toggle">' +
    '<button type="button" class="btn-toggle active" data-sig-position="footer">Footer</button>' +
    '<button type="button" class="btn-toggle" data-sig-position="below-table">Below Table</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="signature-blocks-list" id="signature-list">' +
    '<div class="signature-block-item">' +
    '<div class="sig-block-header">' +
    '<span class="sig-block-num">Signature 1</span>' +
    '<button type="button" class="btn-remove-sig">Remove</button>' +
    '</div>' +
    '<input type="text" class="form-input signature-name" value="Prepared By" placeholder="Role/Title">' +
    '</div>' +
    '<div class="signature-block-item">' +
    '<div class="sig-block-header">' +
    '<span class="sig-block-num">Signature 2</span>' +
    '<button type="button" class="btn-remove-sig">Remove</button>' +
    '</div>' +
    '<input type="text" class="form-input signature-name" value="Reviewed By" placeholder="Role/Title">' +
    '</div>' +
    '<div class="signature-block-item">' +
    '<div class="sig-block-header">' +
    '<span class="sig-block-num">Signature 3</span>' +
    '<button type="button" class="btn-remove-sig">Remove</button>' +
    '</div>' +
    '<input type="text" class="form-input signature-name" value="Approved By" placeholder="Role/Title">' +
    '</div>' +
    '</div>' +
    '<button type="button" class="btn btn-ghost btn-xs" id="add-signature-btn">+ Add Signature Block</button>' +
    '</div>' +
    '</div>' +
    // Include Fields Section
    '<div class="config-section">' +
    '<div class="config-section-header">' +
    '<span class="config-section-icon">📊</span>' +
    '<span class="config-section-title">Include Fields</span>' +
    '<div class="field-select-actions">' +
    '<button type="button" class="btn-link" id="select-all-fields">Select All</button>' +
    '<span class="divider">|</span>' +
    '<button type="button" class="btn-link" id="deselect-all-fields">Deselect All</button>' +
    '</div>' +
    '</div>' +
    '<div class="config-section-body">' +
    '<div class="fields-grid">' +
    fieldsHtml +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';

  ERM.components.showModal({
    title: "Configure Report Export",
    content: content,
    size: "lg",
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Preview Report", type: "ghost", action: "preview" },
      { label: "Save Configuration", type: "primary", action: "save" }
    ],
    onOpen: function () {
      self.initPDFConfigHandlersFull(reportId);
    },
    onAction: function (action) {
      if (action === "save") {
        self.savePDFConfig(reportId);
        ERM.toast.success("Configuration saved");
      } else if (action === "preview") {
        self.showPDFPreviewInModal(reportId);
      }
    }
  });
};

/**
 * Build field checkboxes HTML for PDF config
 * Fields are based on the actual risk form structure
 */
ERM.riskRegister.buildFieldCheckboxesHtml = function () {
  var fieldGroups = [
    {
      name: "Risk Identification",
      fields: [
        { id: "riskId", label: "Risk ID", checked: true },
        { id: "title", label: "Risk Title", checked: true },
        { id: "category", label: "Category", checked: true },
        { id: "description", label: "Description", checked: false },
        { id: "rootCauses", label: "Root Causes", checked: false },
        { id: "consequences", label: "Consequences", checked: false },
        { id: "linkedControls", label: "Linked Controls", checked: false }
      ]
    },
    {
      name: "Inherent Risk",
      fields: [
        { id: "inherentLikelihood", label: "Inherent Likelihood", checked: false },
        { id: "inherentImpact", label: "Inherent Impact", checked: false },
        { id: "inherentRiskScore", label: "Inherent Score", checked: true }
      ]
    },
    {
      name: "Residual Risk",
      fields: [
        { id: "residualLikelihood", label: "Residual Likelihood", checked: false },
        { id: "residualImpact", label: "Residual Impact", checked: false },
        { id: "residualRiskScore", label: "Residual Score", checked: true }
      ]
    },
    {
      name: "Treatment & Actions",
      fields: [
        { id: "treatment", label: "Treatment Decision", checked: true },
        { id: "actionPlan", label: "Action Plan", checked: false },
        { id: "riskOwner", label: "Risk Owner", checked: true },
        { id: "actionOwner", label: "Action Owner", checked: false },
        { id: "targetDate", label: "Target Date", checked: true },
        { id: "reviewDate", label: "Review Date", checked: false },
        { id: "status", label: "Status", checked: true }
      ]
    },
    {
      name: "Escalation",
      fields: [
        { id: "escalation", label: "Escalation Required", checked: false },
        { id: "escalationLevel", label: "Escalation Level", checked: false },
        { id: "escalationOwner", label: "Escalation Owner", checked: false }
      ]
    }
  ];

  var fieldsHtml = '';
  for (var g = 0; g < fieldGroups.length; g++) {
    var group = fieldGroups[g];
    fieldsHtml += '<div class="field-group">';
    fieldsHtml += '<div class="field-group-name">' + group.name + '</div>';
    fieldsHtml += '<div class="field-group-items">';
    for (var f = 0; f < group.fields.length; f++) {
      var field = group.fields[f];
      fieldsHtml += '<label class="field-checkbox">' +
        '<input type="checkbox" name="export-field" value="' + field.id + '"' + (field.checked ? ' checked' : '') + '>' +
        '<span class="field-checkbox-label">' + field.label + '</span>' +
        '</label>';
    }
    fieldsHtml += '</div></div>';
  }

  return fieldsHtml;
};

/**
 * Save PDF configuration
 */
ERM.riskRegister.savePDFConfig = function (reportId) {
  var config = this.gatherPDFConfig(reportId);
  // Store in localStorage for future use
  ERM.storage.set("pdfExportConfig", config);
};

/**
 * Show PDF Preview inside modal (replaces config content)
 */
ERM.riskRegister.showPDFPreviewInModal = function (reportId) {
  var self = this;
  var config = this.gatherPDFConfig(reportId);
  var register = this.state.currentRegister;
  if (!register) return;

  // Store the config so it can be used when exporting from preview modal
  // (the checkboxes won't be in the DOM anymore after showing the preview)
  this._previewConfig = config;

  var risks = ERM.storage.get("risks") || [];
  var registerRisks = [];
  for (var r = 0; r < risks.length; r++) {
    if (risks[r].registerId === register.id) {
      registerRisks.push(risks[r]);
    }
  }

  // Build preview HTML
  var previewHtml = this.buildInModalPreviewHtml(register, registerRisks, config);

  var content =
    '<div class="pdf-preview-modal">' +
    '<div class="preview-container">' +
    previewHtml +
    '</div>' +
    '</div>';

  ERM.components.showModal({
    title: "Report Preview",
    content: content,
    size: "xl",
    buttons: [
      { label: "Go Back", type: "secondary", action: "back" },
      { label: "Save Configuration", type: "ghost", action: "save" },
      { label: "Export PDF", type: "primary", action: "export" }
    ],
    onAction: function (action) {
      if (action === "back") {
        ERM.components.closeModal();
        setTimeout(function () {
          self.showPDFConfigModal();
        }, 200);
      } else if (action === "save") {
        // Use stored config for saving
        ERM.storage.set("pdfExportConfig", self._previewConfig);
        ERM.toast.success("Configuration saved");
      } else if (action === "export") {
        // Use stored config directly instead of re-gathering
        self.generatePDFReportFullWithConfig(self._previewConfig);
      }
    }
  });
};

/**
 * Build in-modal preview HTML
 */
ERM.riskRegister.buildInModalPreviewHtml = function (register, risks, config) {
  var self = this;
  var isLandscape = config.orientation === "landscape";

  // Calculate risk counts
  var critical = 0, high = 0, medium = 0, low = 0;
  for (var i = 0; i < risks.length; i++) {
    var score = risks[i].inherentScore || 0;
    if (score >= 15) critical++;
    else if (score >= 10) high++;
    else if (score >= 5) medium++;
    else low++;
  }

  // Determine logo position
  var logoTopLeft = config.logoPosition === "top-left";
  var logoTopCenter = config.logoPosition === "top-center";
  var logoTopRight = config.logoPosition === "top-right";
  var logoAtTop = logoTopLeft || logoTopCenter || logoTopRight;

  // Generate timestamps
  var now = new Date();
  var dateStr = now.toLocaleDateString("en-GB");
  var timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  var docId = "DOC-" + now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") + "-" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  var html = '<div class="preview-page' + (isLandscape ? ' landscape' : '') + '">';

  // Logo at top
  if (config.logo && logoAtTop) {
    var logoAlign = logoTopCenter ? "center" : (logoTopRight ? "flex-end" : "flex-start");
    html += '<div class="preview-logo-row" style="justify-content: ' + logoAlign + ';">';
    html += '<img src="' + config.logo + '" alt="Logo" class="preview-logo-img">';
    html += '</div>';
  }

  // Title
  html += '<div class="preview-title-bar">';
  html += '<h1 class="preview-report-title">' + ERM.utils.escapeHtml(config.title) + '</h1>';
  html += '</div>';

  // Risk table
  html += '<div class="preview-table-section">';
  html += '<h3 class="preview-section-title">Risk Details</h3>';

  // Build headers based on selected fields - matching actual risk form fields
  var fieldMap = {
    riskId: { label: "ID", getter: function(r, index) { return r.reference || ("R-" + String((index || 0) + 1).padStart(3, "0")); } },
    title: { label: "Risk Title", getter: function(r) { return r.title || "-"; } },
    category: { label: "Category", getter: function(r) { return self.formatCategory(r.category) || "-"; } },
    description: { label: "Description", getter: function(r) { return r.description || "-"; } },
    rootCauses: { label: "Root Causes", getter: function(r) { return (r.rootCauses && r.rootCauses.length) ? r.rootCauses.join("; ") : "-"; } },
    consequences: { label: "Consequences", getter: function(r) { return (r.consequences && r.consequences.length) ? r.consequences.join("; ") : "-"; } },
    linkedControls: { label: "Controls", getter: function(r) { return (r.linkedControls && r.linkedControls.length) ? r.linkedControls.length + " linked" : "-"; } },
    inherentLikelihood: { label: "Inh. L", getter: function(r) { return r.inherentLikelihood || "-"; } },
    inherentImpact: { label: "Inh. I", getter: function(r) { return r.inherentImpact || "-"; } },
    inherentRiskScore: { label: "Inherent", getter: function(r) { return r.inherentScore || "-"; }, isScore: true, scoreType: "inherent" },
    residualLikelihood: { label: "Res. L", getter: function(r) { return r.residualLikelihood || "-"; } },
    residualImpact: { label: "Res. I", getter: function(r) { return r.residualImpact || "-"; } },
    residualRiskScore: { label: "Residual", getter: function(r) { return r.residualScore || "-"; }, isScore: true, scoreType: "residual" },
    treatment: { label: "Treatment", getter: function(r) { return r.treatment || "-"; } },
    actionPlan: { label: "Action Plan", getter: function(r) { return (r.actionPlan && r.actionPlan.length) ? r.actionPlan.join("; ") : "-"; } },
    riskOwner: { label: "Risk Owner", getter: function(r) { return r.owner || "-"; } },
    actionOwner: { label: "Action Owner", getter: function(r) { return r.actionOwner || "-"; } },
    targetDate: { label: "Target Date", getter: function(r) { return r.targetDate || "-"; } },
    reviewDate: { label: "Review Date", getter: function(r) { return r.reviewDate || "-"; } },
    status: { label: "Status", getter: function(r) { return r.status || "-"; } },
    escalation: { label: "Escalation", getter: function(r) { return r.escalation || "No"; } },
    escalationLevel: { label: "Esc. Level", getter: function(r) { return r.escalationLevel || "-"; } },
    escalationOwner: { label: "Esc. Owner", getter: function(r) { return r.escalationOwner || "-"; } }
  };

  var activeFields = [];
  for (var h = 0; h < config.selectedFields.length; h++) {
    var fieldId = config.selectedFields[h];
    if (fieldMap[fieldId]) {
      activeFields.push(fieldMap[fieldId]);
    }
  }

  // Add many-columns class if more than 8 columns
  var tableClass = 'preview-risk-table';
  if (activeFields.length > 8) {
    tableClass += ' many-columns';
  }

  html += '<table class="' + tableClass + '">';
  html += '<thead><tr>';
  for (var hh = 0; hh < activeFields.length; hh++) {
    html += '<th>' + activeFields[hh].label + '</th>';
  }
  html += '</tr></thead><tbody>';

  // Show up to 5 risks in preview
  var previewRisks = risks.slice(0, 5);
  for (var j = 0; j < previewRisks.length; j++) {
    var risk = previewRisks[j];
    html += '<tr>';
    for (var c = 0; c < activeFields.length; c++) {
      var field = activeFields[c];
      var value = field.getter(risk, j);
      var cellClass = "";

      if (field.isScore) {
        var scoreVal = field.scoreType === "inherent" ? risk.inherentScore : risk.residualScore;
        if (scoreVal >= 15) cellClass = "score-critical";
        else if (scoreVal >= 10) cellClass = "score-high";
        else if (scoreVal >= 5) cellClass = "score-medium";
        else cellClass = "score-low";
      }

      html += '<td class="' + cellClass + '">' + ERM.utils.escapeHtml(String(value)) + '</td>';
    }
    html += '</tr>';
  }

  if (risks.length > 5) {
    html += '<tr><td colspan="' + activeFields.length + '" class="more-rows">... and ' + (risks.length - 5) + ' more risks</td></tr>';
  }

  html += '</tbody></table>';
  html += '</div>';

  // Signature blocks
  if (config.signatures && config.signatures.length > 0) {
    html += '<div class="preview-signatures-section">';
    html += '<h3 class="preview-section-title">Approvals</h3>';
    html += '<div class="preview-sig-row">';
    for (var s = 0; s < config.signatures.length; s++) {
      html += '<div class="preview-sig-item">';
      html += '<div class="sig-line"></div>';
      html += '<div class="sig-name">' + ERM.utils.escapeHtml(config.signatures[s]) + '</div>';
      html += '<div class="sig-date">Date: ________________</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';
  }

  // Logo at bottom
  if (config.logo && !logoAtTop) {
    var bottomLogoAlign = config.logoPosition === "bottom-center" ? "center" : (config.logoPosition === "bottom-right" ? "flex-end" : "flex-start");
    html += '<div class="preview-logo-row bottom" style="justify-content: ' + bottomLogoAlign + ';">';
    html += '<img src="' + config.logo + '" alt="Logo" class="preview-logo-img">';
    html += '</div>';
  }

  // Footer with stamp
  html += '<div class="preview-footer-section">';
  html += '<div class="preview-footer-meta">';
  html += '<div>Generated: ' + dateStr + ' at ' + timeStr + '</div>';
  html += '<div>Report ID: ' + docId + '</div>';
  html += '<div>Generated by: ' + (ERM.state.user ? ERM.utils.escapeHtml(ERM.state.user.name) : "System") + '</div>';
  html += '</div>';
  html += '<div class="preview-circular-stamp">';
  html += '<div class="stamp-text">GENERATED</div>';
  html += '<div class="stamp-date">' + dateStr + '</div>';
  html += '<div class="stamp-id">' + docId + '</div>';
  html += '<div class="stamp-divider"></div>';
  html += '<div class="stamp-original">ORIGINAL</div>';
  html += '</div>';
  html += '</div>';

  // Watermark logo centered below footer - bigger size
  html += '<div class="preview-watermark" style="text-align: center; margin-top: 20px;">';
  html += '<img src="assets/images/watermark-logo.png" alt="Dimeri ERM" style="max-height: 50px; max-width: 180px;" onerror="this.style.display=\'none\'">';
  html += '</div>';

  // Page number
  if (config.showPageNumbers) {
    html += '<div class="preview-page-num">Page 1 of 1</div>';
  }

  html += '</div>';

  return html;
};

/**
 * Initialize PDF config modal event handlers
 */
ERM.riskRegister.initPDFConfigHandlers = function (reportId) {
  var self = this;

  // Report title input
  var titleInput = document.getElementById("pdf-report-title");
  var previewTitle = document.getElementById("preview-title");
  if (titleInput && previewTitle) {
    titleInput.addEventListener("input", function () {
      previewTitle.textContent = this.value || "Risk Register";
    });
  }

  // Orientation toggle
  var orientationBtns = document.querySelectorAll(".orientation-btn");
  for (var i = 0; i < orientationBtns.length; i++) {
    orientationBtns[i].addEventListener("click", function () {
      for (var j = 0; j < orientationBtns.length; j++) {
        orientationBtns[j].classList.remove("active");
      }
      this.classList.add("active");
      var orientation = this.getAttribute("data-orientation");
      var previewPage = document.querySelector(".pdf-preview-page");
      if (previewPage) {
        previewPage.classList.toggle("landscape", orientation === "landscape");
      }
    });
  }

  // Logo upload
  var logoUploadArea = document.getElementById("logo-upload-area");
  var logoFileInput = document.getElementById("logo-file-input");
  var logoPlaceholder = document.getElementById("logo-placeholder");
  var logoPreview = document.getElementById("logo-preview");
  var removeLogoBtn = document.getElementById("remove-logo-btn");
  var previewLogoArea = document.getElementById("preview-logo-area");

  if (logoUploadArea && logoFileInput) {
    logoUploadArea.addEventListener("click", function () {
      logoFileInput.click();
    });

    logoFileInput.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
          self._uploadedLogo = e.target.result;
          if (logoPreview) {
            logoPreview.src = e.target.result;
            logoPreview.style.display = "block";
          }
          if (logoPlaceholder) {
            logoPlaceholder.style.display = "none";
          }
          if (removeLogoBtn) {
            removeLogoBtn.style.display = "inline-flex";
          }
          // Update preview
          if (previewLogoArea) {
            previewLogoArea.innerHTML = '<img src="' + e.target.result + '" alt="Logo" style="max-height: 24px; max-width: 80px;">';
          }
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  if (removeLogoBtn) {
    removeLogoBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      self._uploadedLogo = null;
      if (logoPreview) {
        logoPreview.style.display = "none";
        logoPreview.src = "";
      }
      if (logoPlaceholder) {
        logoPlaceholder.style.display = "flex";
      }
      if (logoFileInput) {
        logoFileInput.value = "";
      }
      this.style.display = "none";
      if (previewLogoArea) {
        previewLogoArea.innerHTML = "";
      }
    });
  }

  // Logo position
  var positionBtns = document.querySelectorAll(".position-btn");
  for (var p = 0; p < positionBtns.length; p++) {
    positionBtns[p].addEventListener("click", function () {
      for (var q = 0; q < positionBtns.length; q++) {
        positionBtns[q].classList.remove("active");
      }
      this.classList.add("active");
      self._logoPosition = this.getAttribute("data-position");
      // Update preview alignment
      if (previewLogoArea) {
        previewLogoArea.style.textAlign = self._logoPosition;
      }
    });
  }

  // Signature toggle
  var enableSignatures = document.getElementById("enable-signatures");
  var signatureConfig = document.getElementById("signature-config");
  var previewSignatureArea = document.getElementById("preview-signature-area");

  if (enableSignatures) {
    enableSignatures.addEventListener("change", function () {
      if (signatureConfig) {
        signatureConfig.style.display = this.checked ? "block" : "none";
      }
      if (previewSignatureArea) {
        previewSignatureArea.style.display = this.checked ? "flex" : "none";
      }
    });
  }

  // Add signature block
  var addSignatureBtn = document.getElementById("add-signature-btn");
  var signatureList = document.getElementById("signature-list");

  if (addSignatureBtn && signatureList) {
    addSignatureBtn.addEventListener("click", function () {
      var newSig =
        '<div class="signature-item">' +
        '<input type="text" class="form-input signature-name" placeholder="Name / Title">' +
        '<button type="button" class="btn-icon remove-signature" title="Remove"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
        '</div>';
      signatureList.insertAdjacentHTML("beforeend", newSig);
      self.updateSignaturePreview();
      self.bindRemoveSignatureHandlers();
    });
  }

  // Bind remove handlers
  self.bindRemoveSignatureHandlers();

  // Signature position toggle
  var sigPosBtns = document.querySelectorAll(".sig-pos-btn");
  for (var s = 0; s < sigPosBtns.length; s++) {
    sigPosBtns[s].addEventListener("click", function () {
      for (var t = 0; t < sigPosBtns.length; t++) {
        sigPosBtns[t].classList.remove("active");
      }
      this.classList.add("active");
      self._signaturePosition = this.getAttribute("data-sig-position");
    });
  }

  // Update preview on signature name input
  if (signatureList) {
    signatureList.addEventListener("input", function () {
      self.updateSignaturePreview();
    });
  }

  // Store initial values
  self._logoPosition = "left";
  self._signaturePosition = "footer";
  self._uploadedLogo = null;
  self._reportId = reportId;
};

/**
 * Bind remove signature button handlers
 */
ERM.riskRegister.bindRemoveSignatureHandlers = function () {
  var self = this;
  var removeButtons = document.querySelectorAll(".remove-signature");
  for (var i = 0; i < removeButtons.length; i++) {
    removeButtons[i].onclick = function () {
      var signatureList = document.getElementById("signature-list");
      if (signatureList && signatureList.children.length > 1) {
        this.closest(".signature-item").remove();
        self.updateSignaturePreview();
      } else {
        ERM.toast.warning("At least one signature block is required");
      }
    };
  }
};

/**
 * Update signature preview
 */
ERM.riskRegister.updateSignaturePreview = function () {
  var signatureInputs = document.querySelectorAll(".signature-name");
  var previewArea = document.getElementById("preview-signature-area");

  if (!previewArea) return;

  var html = "";
  for (var i = 0; i < signatureInputs.length; i++) {
    var name = signatureInputs[i].value || "Signature " + (i + 1);
    html += '<div class="preview-signature-block">' +
      '<div class="sig-line"></div>' +
      '<div class="sig-name">' + ERM.utils.escapeHtml(name) + '</div>' +
      '</div>';
  }
  previewArea.innerHTML = html;
};

/**
 * Generate the PDF report
 */
ERM.riskRegister.generatePDFReport = function (reportId) {
  var self = this;
  var register = this.state.currentRegister;
  if (!register) return;

  // Get configuration values
  var titleInput = document.getElementById("pdf-report-title");
  var reportTitle = titleInput ? titleInput.value || register.name : register.name;

  var orientationBtn = document.querySelector(".orientation-btn.active");
  var orientation = orientationBtn ? orientationBtn.getAttribute("data-orientation") : "portrait";

  var enableSignatures = document.getElementById("enable-signatures");
  var showSignatures = enableSignatures ? enableSignatures.checked : false;

  var signatureNames = [];
  if (showSignatures) {
    var signatureInputs = document.querySelectorAll(".signature-name");
    for (var i = 0; i < signatureInputs.length; i++) {
      if (signatureInputs[i].value.trim()) {
        signatureNames.push(signatureInputs[i].value.trim());
      }
    }
  }

  // Get selected fields
  var selectedFields = [];
  var fieldCheckboxes = document.querySelectorAll('input[name="export-field"]:checked');
  for (var f = 0; f < fieldCheckboxes.length; f++) {
    selectedFields.push(fieldCheckboxes[f].value);
  }

  // Get risks
  var risks = ERM.storage.get("risks") || [];
  var registerRisks = [];
  for (var r = 0; r < risks.length; r++) {
    if (risks[r].registerId === register.id) {
      registerRisks.push(risks[r]);
    }
  }

  // Close current modal
  ERM.components.closeModal();

  // Store config for use after progress animation
  var exportConfig = {
    title: reportTitle,
    orientation: orientation,
    logo: this._uploadedLogo,
    logoPosition: this._logoPosition,
    signatures: signatureNames,
    signaturePosition: this._signaturePosition,
    selectedFields: selectedFields,
    reportId: reportId
  };

  // Show progress overlay
  this.showPDFExportProgress(register, registerRisks, exportConfig);
};

/**
 * Show PDF export progress overlay with animated stages
 */
ERM.riskRegister.showPDFExportProgress = function (register, risks, config) {
  var self = this;

  // Build progress modal content
  var progressContent = '';
  progressContent += '<div class="export-progress-container">';
  progressContent += '  <div class="export-icon-wrapper" id="export-icon-wrapper">';
  progressContent += '    <div class="export-icon-circle" id="export-icon-circle">';
  progressContent += '      <svg id="export-stage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">';
  progressContent += '        <ellipse cx="12" cy="5" rx="9" ry="3"/>';
  progressContent += '        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>';
  progressContent += '        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>';
  progressContent += '      </svg>';
  progressContent += '    </div>';
  progressContent += '  </div>';
  progressContent += '  <h3 class="export-progress-title" id="export-progress-title">Generating Report...</h3>';
  progressContent += '  <div class="export-progress-bar-container">';
  progressContent += '    <div class="export-progress-bar">';
  progressContent += '      <div class="export-progress-fill" id="pdf-export-progress-fill"></div>';
  progressContent += '    </div>';
  progressContent += '  </div>';
  progressContent += '  <p class="export-progress-status" id="pdf-export-status">Compiling risk data...</p>';
  progressContent += '</div>';

  ERM.components.showModal({
    title: 'Exporting PDF',
    content: progressContent,
    size: 'small',
    buttons: [],
    closeOnBackdrop: false,
    showCloseButton: false
  });

  // Animate progress
  this.animatePDFExportProgress(register, risks, config);
};

/**
 * Animate export progress stages with dynamic icons
 */
ERM.riskRegister.animatePDFExportProgress = function (register, risks, config) {
  var self = this;
  var progressFill = document.getElementById('pdf-export-progress-fill');
  var statusText = document.getElementById('pdf-export-status');
  var iconCircle = document.getElementById('export-icon-circle');
  var iconWrapper = document.getElementById('export-icon-wrapper');
  var titleEl = document.getElementById('export-progress-title');

  // Icons for each stage
  var icons = {
    data: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    document: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="32" height="32"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
  };

  var stages = [
    { progress: 20, text: 'Compiling risk data...', icon: 'data' },
    { progress: 45, text: 'Processing risk scores...', icon: 'chart' },
    { progress: 70, text: 'Formatting document...', icon: 'document' },
    { progress: 90, text: 'Preparing download...', icon: 'download' },
    { progress: 100, text: 'Finalizing...', icon: 'download' }
  ];

  var stageIndex = 0;

  function updateIcon(iconKey) {
    if (iconCircle && icons[iconKey]) {
      iconCircle.innerHTML = icons[iconKey];
      iconCircle.style.transform = 'scale(1.1)';
      setTimeout(function () {
        iconCircle.style.transform = 'scale(1)';
      }, 150);
    }
  }

  function nextStage() {
    if (stageIndex < stages.length) {
      var stage = stages[stageIndex];
      if (progressFill) progressFill.style.width = stage.progress + '%';
      if (statusText) statusText.textContent = stage.text;
      updateIcon(stage.icon);
      stageIndex++;

      if (stageIndex < stages.length) {
        setTimeout(nextStage, 600);
      } else {
        // Show completion state
        setTimeout(function () {
          updateIcon('success');
          if (iconCircle) iconCircle.classList.add('success');
          if (iconWrapper) iconWrapper.classList.add('success');
          if (titleEl) {
            titleEl.textContent = 'Report Ready!';
            titleEl.classList.add('success');
          }
          if (statusText) statusText.textContent = 'Your PDF is ready for download';

          // Actually generate and open PDF after showing success
          setTimeout(function () {
            ERM.components.closeModal();
            self.exportConfiguredPDF(register, risks, config);
          }, 1200);
        }, 400);
      }
    }
  }

  // Start animation after a short delay
  setTimeout(nextStage, 300);
};

/**
 * Export configured PDF with all options - uses selected fields from config
 */
ERM.riskRegister.exportConfiguredPDF = function (register, risks, config) {
  var self = this;
  var html = "";
  var isLandscape = config.orientation === "landscape";

  // Field definitions map - matching the form structure
  var fieldMap = {
    riskId: { label: "ID", getter: function(r, index) { return r.reference || ("R-" + String((index || 0) + 1).padStart(3, "0")); } },
    title: { label: "Risk Title", getter: function(r) { return r.title || "-"; } },
    category: { label: "Category", getter: function(r) { return self.formatCategory(r.category) || "-"; } },
    description: { label: "Description", getter: function(r) { return r.description || "-"; } },
    rootCauses: { label: "Root Causes", getter: function(r) { return (r.rootCauses && r.rootCauses.length) ? r.rootCauses.join("; ") : "-"; } },
    consequences: { label: "Consequences", getter: function(r) { return (r.consequences && r.consequences.length) ? r.consequences.join("; ") : "-"; } },
    linkedControls: { label: "Controls", getter: function(r) { return (r.linkedControls && r.linkedControls.length) ? r.linkedControls.length + " linked" : "-"; } },
    inherentLikelihood: { label: "Inh. L", getter: function(r) { return r.inherentLikelihood || "-"; } },
    inherentImpact: { label: "Inh. I", getter: function(r) { return r.inherentImpact || "-"; } },
    inherentRiskScore: { label: "Inherent", getter: function(r) { return r.inherentScore || "-"; }, isScore: true, scoreType: "inherent" },
    residualLikelihood: { label: "Res. L", getter: function(r) { return r.residualLikelihood || "-"; } },
    residualImpact: { label: "Res. I", getter: function(r) { return r.residualImpact || "-"; } },
    residualRiskScore: { label: "Residual", getter: function(r) { return r.residualScore || "-"; }, isScore: true, scoreType: "residual" },
    treatment: { label: "Treatment", getter: function(r) { return r.treatment || "-"; } },
    actionPlan: { label: "Action Plan", getter: function(r) { return (r.actionPlan && r.actionPlan.length) ? r.actionPlan.join("; ") : "-"; } },
    riskOwner: { label: "Risk Owner", getter: function(r) { return r.owner || "-"; } },
    actionOwner: { label: "Action Owner", getter: function(r) { return r.actionOwner || "-"; } },
    targetDate: { label: "Target Date", getter: function(r) { return r.targetDate || "-"; } },
    reviewDate: { label: "Review Date", getter: function(r) { return r.reviewDate || "-"; } },
    status: { label: "Status", getter: function(r) { return r.status || "-"; } },
    escalation: { label: "Escalation", getter: function(r) { return r.escalation || "No"; } },
    escalationLevel: { label: "Esc. Level", getter: function(r) { return r.escalationLevel || "-"; } },
    escalationOwner: { label: "Esc. Owner", getter: function(r) { return r.escalationOwner || "-"; } }
  };

  // Get active fields from config or use defaults
  var selectedFields = config.selectedFields && config.selectedFields.length > 0
    ? config.selectedFields
    : ["riskId", "title", "category", "inherentRiskScore", "residualRiskScore", "riskOwner", "status"];

  var activeFields = [];
  for (var f = 0; f < selectedFields.length; f++) {
    var fieldId = selectedFields[f];
    if (fieldMap[fieldId]) {
      activeFields.push({ id: fieldId, config: fieldMap[fieldId] });
    }
  }

  // Calculate font size based on column count
  var colCount = activeFields.length;
  var fontSize = colCount > 12 ? 8 : (colCount > 8 ? 9 : (colCount > 5 ? 10 : 11));
  var headerPadding = colCount > 10 ? "6px 4px" : "8px 6px";
  var cellPadding = colCount > 10 ? "5px 3px" : "7px 5px";

  // Header with logo - using table for PDF compatibility
  html += '<table style="width: 100%; border-bottom: 3px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; border-collapse: collapse;">';
  html += '<tr>';

  if (config.logo && config.logoPosition === "left") {
    html += '<td style="width: 150px; vertical-align: middle;"><img src="' + config.logo + '" alt="Logo" style="max-height: 50px; max-width: 150px;"></td>';
    html += '<td style="text-align: right; vertical-align: middle;"><h1 style="color: #0f172a; margin: 0; font-size: 24px;">' + ERM.utils.escapeHtml(config.title) + '</h1></td>';
  } else if (config.logo && config.logoPosition === "right") {
    html += '<td style="text-align: left; vertical-align: middle;"><h1 style="color: #0f172a; margin: 0; font-size: 24px;">' + ERM.utils.escapeHtml(config.title) + '</h1></td>';
    html += '<td style="width: 150px; text-align: right; vertical-align: middle;"><img src="' + config.logo + '" alt="Logo" style="max-height: 50px; max-width: 150px;"></td>';
  } else {
    html += '<td style="text-align: center; vertical-align: middle;"><h1 style="color: #0f172a; margin: 0; font-size: 24px;">' + ERM.utils.escapeHtml(config.title) + '</h1></td>';
  }

  html += '</tr>';
  html += '</table>';

  // Metadata - using table for PDF compatibility
  html += '<table style="width: 100%; color: #64748b; margin-bottom: 24px; font-size: 12px; border-collapse: collapse;">';
  html += '<tr>';
  html += '<td style="text-align: left;"><strong>Generated:</strong> ' + new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }) + ' at ' + new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + '</td>';
  html += '<td style="text-align: right;"><strong>Report ID:</strong> ' + config.reportId + ' | <strong>Total Risks:</strong> ' + risks.length + '</td>';
  html += '</tr>';
  html += '</table>';

  // Summary section
  var critical = 0, high = 0, medium = 0, low = 0;
  for (var i = 0; i < risks.length; i++) {
    var score = risks[i].inherentScore || 0;
    if (score >= 15) critical++;
    else if (score >= 10) high++;
    else if (score >= 5) medium++;
    else low++;
  }

  html += '<h2 style="color: #1e293b; margin: 24px 0 12px 0; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Executive Summary</h2>';
  html += '<table style="width: 100%; margin-bottom: 24px; border-collapse: separate; border-spacing: 12px 0;">';
  html += '<tr>';
  html += '<td style="width: 25%; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; text-align: center;"><div style="font-size: 24px; font-weight: 700; color: #dc2626;">' + critical + '</div><div style="font-size: 11px; color: #b91c1c;">Critical</div></td>';
  html += '<td style="width: 25%; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px; text-align: center;"><div style="font-size: 24px; font-weight: 700; color: #ea580c;">' + high + '</div><div style="font-size: 11px; color: #c2410c;">High</div></td>';
  html += '<td style="width: 25%; background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 12px; text-align: center;"><div style="font-size: 24px; font-weight: 700; color: #ca8a04;">' + medium + '</div><div style="font-size: 11px; color: #a16207;">Medium</div></td>';
  html += '<td style="width: 25%; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; text-align: center;"><div style="font-size: 24px; font-weight: 700; color: #16a34a;">' + low + '</div><div style="font-size: 11px; color: #15803d;">Low</div></td>';
  html += '</tr>';
  html += '</table>';

  // Risk details table - using selected fields
  html += '<h2 style="color: #1e293b; margin: 24px 0 12px 0; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Risk Details</h2>';
  html += '<table style="width: 100%; border-collapse: collapse; font-size: ' + fontSize + 'px; table-layout: fixed;">';
  html += '<thead>';
  html += '<tr style="background: #f1f5f9;">';

  // Build headers from selected fields
  for (var h = 0; h < activeFields.length; h++) {
    html += '<th style="padding: ' + headerPadding + '; border: 1px solid #e2e8f0; text-align: left; font-weight: 600; word-wrap: break-word; overflow: hidden;">' + activeFields[h].config.label + '</th>';
  }
  html += '</tr>';
  html += '</thead>';
  html += '<tbody>';

  // Build rows using selected fields
  for (var j = 0; j < risks.length; j++) {
    var risk = risks[j];
    html += '<tr>';

    for (var c = 0; c < activeFields.length; c++) {
      var field = activeFields[c];
      var value = field.config.getter(risk, j);
      var cellStyle = "padding: " + cellPadding + "; border: 1px solid #e2e8f0; word-wrap: break-word; overflow: hidden;";

      if (field.config.isScore) {
        var scoreVal = field.config.scoreType === "inherent" ? risk.inherentScore : risk.residualScore;
        var color = this.getRiskColor(scoreVal);
        cellStyle += " text-align: center; color: " + color.text + "; font-weight: 600;";
      }

      html += '<td style="' + cellStyle + '">' + ERM.utils.escapeHtml(String(value)) + '</td>';
    }
    html += '</tr>';
  }
  html += '</tbody>';
  html += '</table>';

  // Signature blocks - using table for better PDF compatibility
  if (config.signatures && config.signatures.length > 0) {
    html += '<div style="margin-top: 48px; page-break-inside: avoid;">';
    html += '<h3 style="color: #475569; font-size: 12px; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Approvals</h3>';
    html += '<table style="width: 100%; border-collapse: collapse;">';
    html += '<tr>';
    for (var s = 0; s < config.signatures.length; s++) {
      var sigWidth = Math.floor(100 / config.signatures.length);
      html += '<td style="width: ' + sigWidth + '%; text-align: center; padding: 0 16px;">';
      html += '<div style="border-bottom: 1px solid #94a3b8; height: 40px; margin-bottom: 8px;"></div>';
      html += '<div style="color: #64748b; font-size: 11px;">' + ERM.utils.escapeHtml(config.signatures[s]) + '</div>';
      html += '<div style="color: #94a3b8; font-size: 10px; margin-top: 4px;">Date: ________________</div>';
      html += '</td>';
    }
    html += '</tr>';
    html += '</table>';
    html += '</div>';
  }

  // Footer with stamp - using table for better PDF compatibility
  html += '<table style="width: 100%; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; border-collapse: collapse;">';
  html += '<tr>';
  html += '<td style="font-size: 10px; color: #94a3b8; text-align: left; vertical-align: middle;">';
  html += '<strong>Report ID:</strong> ' + config.reportId + ' | ';
  html += '<strong>Generated by:</strong> ' + (ERM.state.user ? ERM.utils.escapeHtml(ERM.state.user.name) : "System") + ' | ';
  html += '<strong>Pages:</strong> 1';
  html += '</td>';
  html += '<td style="text-align: right; vertical-align: middle; width: 100px;">';
  html += '<span style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px; color: #3b82f6; font-weight: 600; font-size: 10px;">ORIGINAL</span>';
  html += '</td>';
  html += '</tr>';
  html += '</table>';

  // Open print window
  var printWindow = window.open("", "_blank");
  printWindow.document.write("<!DOCTYPE html><html><head>");
  printWindow.document.write("<title>" + ERM.utils.escapeHtml(config.title) + "</title>");
  printWindow.document.write("<style>");
  printWindow.document.write("@page { size: " + (isLandscape ? "landscape" : "portrait") + "; margin: 15mm; }");
  printWindow.document.write("body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; color: #1a1a2e; line-height: 1.4; }");
  printWindow.document.write("@media print { body { padding: 0; } }");
  printWindow.document.write("</style>");
  printWindow.document.write("</head><body>");
  printWindow.document.write(html);
  printWindow.document.write("</body></html>");
  printWindow.document.close();

  setTimeout(function () {
    printWindow.print();
  }, 500);

  // Log activity
  if (ERM.activityLogger) {
    ERM.activityLogger.log("register", "exported", "risk-register", register.name, {
      registerId: register.id,
      format: "PDF",
      riskCount: risks.length,
      reportId: config.reportId
    });
  }

  ERM.toast.success("PDF report generated");
};

/**
 * Get risk color based on score
 */
ERM.riskRegister.getRiskColor = function (score) {
  if (!score) return { bg: "#f8fafc", text: "#64748b" };
  if (score >= 15) return { bg: "#fef2f2", text: "#dc2626" };
  if (score >= 10) return { bg: "#fff7ed", text: "#ea580c" };
  if (score >= 5) return { bg: "#fefce8", text: "#ca8a04" };
  return { bg: "#f0fdf4", text: "#16a34a" };
};

/**
 * Initialize FULL PDF config modal event handlers
 */
ERM.riskRegister.initPDFConfigHandlersFull = function (reportId) {
  var self = this;

  // Store initial values
  self._logoPosition = "top-left";
  self._signaturePosition = "footer";
  self._uploadedLogo = null;
  self._reportId = reportId;
  self._showPageNumbers = true;
  self._orientation = "portrait";

  // Orientation toggle buttons
  var orientationBtns = document.querySelectorAll("[data-orientation]");
  for (var i = 0; i < orientationBtns.length; i++) {
    orientationBtns[i].addEventListener("click", function () {
      var btns = document.querySelectorAll("[data-orientation]");
      for (var j = 0; j < btns.length; j++) {
        btns[j].classList.remove("active");
      }
      this.classList.add("active");
      self._orientation = this.getAttribute("data-orientation");
    });
  }

  // Page numbers toggle
  var pageNumBtns = document.querySelectorAll("[data-pagenums]");
  for (var p = 0; p < pageNumBtns.length; p++) {
    pageNumBtns[p].addEventListener("click", function () {
      var btns = document.querySelectorAll("[data-pagenums]");
      for (var q = 0; q < btns.length; q++) {
        btns[q].classList.remove("active");
      }
      this.classList.add("active");
      self._showPageNumbers = this.getAttribute("data-pagenums") === "yes";
    });
  }

  // Logo upload
  var logoUploadArea = document.getElementById("logo-upload-area");
  var logoFileInput = document.getElementById("logo-file-input");
  var logoPlaceholder = document.getElementById("logo-placeholder");
  var logoPreview = document.getElementById("logo-preview");
  var removeLogoBtn = document.getElementById("remove-logo-btn");

  if (logoUploadArea && logoFileInput) {
    logoUploadArea.addEventListener("click", function () {
      logoFileInput.click();
    });

    logoFileInput.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
          self._uploadedLogo = e.target.result;
          if (logoPreview) {
            logoPreview.src = e.target.result;
            logoPreview.style.display = "block";
          }
          if (logoPlaceholder) {
            logoPlaceholder.style.display = "none";
          }
          if (removeLogoBtn) {
            removeLogoBtn.style.display = "inline-flex";
          }
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  if (removeLogoBtn) {
    removeLogoBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      self._uploadedLogo = null;
      if (logoPreview) {
        logoPreview.style.display = "none";
        logoPreview.src = "";
      }
      if (logoPlaceholder) {
        logoPlaceholder.style.display = "flex";
      }
      if (logoFileInput) {
        logoFileInput.value = "";
      }
      this.style.display = "none";
    });
  }

  // Logo position grid
  var logoPosButtons = document.querySelectorAll(".logo-pos-btn");
  for (var lp = 0; lp < logoPosButtons.length; lp++) {
    logoPosButtons[lp].addEventListener("click", function () {
      for (var lq = 0; lq < logoPosButtons.length; lq++) {
        logoPosButtons[lq].classList.remove("active");
      }
      this.classList.add("active");
      self._logoPosition = this.getAttribute("data-position");
    });
  }

  // Signature position toggle
  var sigPosBtns = document.querySelectorAll("[data-sig-position]");
  for (var sp = 0; sp < sigPosBtns.length; sp++) {
    sigPosBtns[sp].addEventListener("click", function () {
      var btns = document.querySelectorAll("[data-sig-position]");
      for (var sq = 0; sq < btns.length; sq++) {
        btns[sq].classList.remove("active");
      }
      this.classList.add("active");
      self._signaturePosition = this.getAttribute("data-sig-position");
    });
  }

  // Add signature block
  var addSignatureBtn = document.getElementById("add-signature-btn");
  var signatureList = document.getElementById("signature-list");

  if (addSignatureBtn && signatureList) {
    addSignatureBtn.addEventListener("click", function () {
      var count = signatureList.children.length + 1;
      var newSig =
        '<div class="signature-block-item">' +
        '<div class="sig-block-header">' +
        '<span class="sig-block-num">Signature ' + count + '</span>' +
        '<button type="button" class="btn-remove-sig" data-action="remove-sig">Remove</button>' +
        '</div>' +
        '<input type="text" class="form-input signature-name" placeholder="Role/Title">' +
        '</div>';
      signatureList.insertAdjacentHTML("beforeend", newSig);
      self.bindRemoveSignatureHandlersFull();
    });
  }

  // Bind remove handlers
  self.bindRemoveSignatureHandlersFull();

  // Select all / Deselect all fields
  var selectAllBtn = document.getElementById("select-all-fields");
  var deselectAllBtn = document.getElementById("deselect-all-fields");

  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", function () {
      var checkboxes = document.querySelectorAll('input[name="export-field"]');
      for (var c = 0; c < checkboxes.length; c++) {
        checkboxes[c].checked = true;
      }
    });
  }

  if (deselectAllBtn) {
    deselectAllBtn.addEventListener("click", function () {
      var checkboxes = document.querySelectorAll('input[name="export-field"]');
      for (var c = 0; c < checkboxes.length; c++) {
        checkboxes[c].checked = false;
      }
    });
  }
};

/**
 * Bind remove signature handlers for full modal
 */
ERM.riskRegister.bindRemoveSignatureHandlersFull = function () {
  var removeButtons = document.querySelectorAll(".btn-remove-sig");
  for (var i = 0; i < removeButtons.length; i++) {
    removeButtons[i].onclick = function () {
      var signatureList = document.getElementById("signature-list");
      if (signatureList && signatureList.children.length > 1) {
        this.closest(".signature-block-item").remove();
        // Renumber signatures
        var items = signatureList.querySelectorAll(".signature-block-item");
        for (var n = 0; n < items.length; n++) {
          var numSpan = items[n].querySelector(".sig-block-num");
          if (numSpan) {
            numSpan.textContent = "Signature " + (n + 1);
          }
        }
      } else {
        ERM.toast.warning("At least one signature block is required");
      }
    };
  }
};

/**
 * Preview PDF Report
 */
ERM.riskRegister.previewPDFReport = function (reportId) {
  var config = this.gatherPDFConfig(reportId);
  var register = this.state.currentRegister;
  if (!register) return;

  var risks = ERM.storage.get("risks") || [];
  var registerRisks = [];
  for (var r = 0; r < risks.length; r++) {
    if (risks[r].registerId === register.id) {
      registerRisks.push(risks[r]);
    }
  }

  // Generate preview in new window (without auto-print)
  this.generatePDFPreviewWindow(register, registerRisks, config, false);
};

/**
 * Generate the FULL PDF report - with progress loader
 */
ERM.riskRegister.generatePDFReportFull = function (reportId) {
  var self = this;
  var config = this.gatherPDFConfig(reportId);
  var register = this.state.currentRegister;
  if (!register) return;

  var risks = ERM.storage.get("risks") || [];
  var registerRisks = [];
  for (var r = 0; r < risks.length; r++) {
    if (risks[r].registerId === register.id) {
      registerRisks.push(risks[r]);
    }
  }

  // Close current modal
  ERM.components.closeModal();

  // Show progress overlay then perform export
  this.showFullPDFExportProgress(register, registerRisks, config, reportId);
};

/**
 * Generate PDF report with pre-gathered config (used from preview modal)
 * This avoids re-gathering config when checkboxes are no longer in DOM
 */
ERM.riskRegister.generatePDFReportFullWithConfig = function (config) {
  var self = this;
  var register = this.state.currentRegister;
  if (!register) return;

  var risks = ERM.storage.get("risks") || [];
  var registerRisks = [];
  for (var r = 0; r < risks.length; r++) {
    if (risks[r].registerId === register.id) {
      registerRisks.push(risks[r]);
    }
  }

  // Close current modal
  ERM.components.closeModal();

  // Show progress overlay then perform export with pre-gathered config
  this.showFullPDFExportProgress(register, registerRisks, config, config.reportId);
};

/**
 * Show progress overlay for full PDF export
 */
ERM.riskRegister.showFullPDFExportProgress = function (register, risks, config, reportId) {
  var self = this;

  // Build progress modal content
  var progressContent = '';
  progressContent += '<div class="export-progress-container">';
  progressContent += '  <div class="export-icon-wrapper" id="export-icon-wrapper">';
  progressContent += '    <div class="export-icon-circle" id="export-icon-circle">';
  progressContent += '      <svg id="export-stage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">';
  progressContent += '        <ellipse cx="12" cy="5" rx="9" ry="3"/>';
  progressContent += '        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>';
  progressContent += '        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>';
  progressContent += '      </svg>';
  progressContent += '    </div>';
  progressContent += '  </div>';
  progressContent += '  <h3 class="export-progress-title" id="export-progress-title">Generating Report...</h3>';
  progressContent += '  <div class="export-progress-bar-container">';
  progressContent += '    <div class="export-progress-bar">';
  progressContent += '      <div class="export-progress-fill" id="pdf-export-progress-fill"></div>';
  progressContent += '    </div>';
  progressContent += '  </div>';
  progressContent += '  <p class="export-progress-status" id="pdf-export-status">Compiling risk data...</p>';
  progressContent += '</div>';

  ERM.components.showModal({
    title: 'Exporting PDF',
    content: progressContent,
    size: 'small',
    buttons: [],
    closeOnBackdrop: false,
    showCloseButton: false
  });

  // Animate progress then export
  this.animateFullPDFExportProgress(register, risks, config, reportId);
};

/**
 * Animate full export progress stages
 */
ERM.riskRegister.animateFullPDFExportProgress = function (register, risks, config, reportId) {
  var self = this;
  var progressFill = document.getElementById('pdf-export-progress-fill');
  var statusText = document.getElementById('pdf-export-status');
  var iconCircle = document.getElementById('export-icon-circle');
  var iconWrapper = document.getElementById('export-icon-wrapper');
  var titleEl = document.getElementById('export-progress-title');

  var icons = {
    data: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    document: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="32" height="32"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
  };

  var stages = [
    { progress: 20, text: 'Compiling risk data...', icon: 'data' },
    { progress: 40, text: 'Processing risk scores...', icon: 'chart' },
    { progress: 60, text: 'Building document...', icon: 'document' },
    { progress: 80, text: 'Rendering PDF...', icon: 'document' },
    { progress: 95, text: 'Preparing download...', icon: 'download' }
  ];

  var stageIndex = 0;

  function updateIcon(iconKey) {
    if (iconCircle && icons[iconKey]) {
      iconCircle.innerHTML = icons[iconKey];
      iconCircle.style.transform = 'scale(1.1)';
      setTimeout(function () {
        iconCircle.style.transform = 'scale(1)';
      }, 150);
    }
  }

  function nextStage() {
    if (stageIndex < stages.length) {
      var stage = stages[stageIndex];
      if (progressFill) progressFill.style.width = stage.progress + '%';
      if (statusText) statusText.textContent = stage.text;
      updateIcon(stage.icon);
      stageIndex++;

      if (stageIndex < stages.length) {
        setTimeout(nextStage, 500);
      } else {
        // Now actually generate the PDF
        setTimeout(function () {
          self.performFullPDFExport(register, risks, config, reportId, function (success) {
            if (success) {
              // Show success state
              if (progressFill) progressFill.style.width = '100%';
              updateIcon('success');
              if (iconCircle) iconCircle.classList.add('success');
              if (iconWrapper) iconWrapper.classList.add('success');
              if (titleEl) {
                titleEl.textContent = 'Report Ready!';
                titleEl.classList.add('success');
              }
              if (statusText) statusText.textContent = 'Your PDF has been downloaded';

              setTimeout(function () {
                ERM.components.closeModal();
              }, 1500);
            } else {
              ERM.components.closeModal();
            }
          });
        }, 300);
      }
    }
  }

  setTimeout(nextStage, 300);
};

/**
 * Perform the actual full PDF export
 */
ERM.riskRegister.performFullPDFExport = function (register, risks, config, reportId, callback) {
  var self = this;

  // Build HTML content for PDF
  var htmlContent = this.buildPDFHtmlContent(register, risks, config);

  // Generate filename
  var fileName = register.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  fileName += '-' + new Date().toISOString().split('T')[0] + '.pdf';

  // Use PDFEngine for proper file download
  if (ERM.PDFEngine) {
    var pdfOptions = {
      filename: fileName,
      margin: [10, 10, 10, 10],
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: config.orientation || 'portrait',
        compress: true
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: '.no-break'
      }
    };

    ERM.PDFEngine.generate(htmlContent, pdfOptions, function (err) {
      if (err) {
        console.error('[PDF Export Error]', err);
        ERM.toast.error("Error generating PDF. Please try again.");
        callback(false);
      } else {
        ERM.toast.success("PDF downloaded successfully!");

        // Log activity
        if (ERM.activityLogger) {
          ERM.activityLogger.log("register", "exported", "risk-register", register.name, {
            registerId: register.id,
            format: "PDF",
            riskCount: risks.length,
            reportId: reportId
          });
        }
        callback(true);
      }
    });
  } else {
    // Fallback to print window if PDFEngine not available
    self.generatePDFPreviewWindow(register, risks, config, true);
    ERM.toast.success("PDF report generated");

    if (ERM.activityLogger) {
      ERM.activityLogger.log("register", "exported", "risk-register", register.name, {
        registerId: register.id,
        format: "PDF",
        riskCount: risks.length,
        reportId: reportId
      });
    }
    callback(true);
  }
};

/**
 * Build HTML content for PDF export
 */
ERM.riskRegister.buildPDFHtmlContent = function (register, risks, config) {
  var self = this;
  var isLandscape = config.orientation === "landscape";

  // Determine logo position styles
  var logoTopLeft = config.logoPosition === "top-left";
  var logoTopCenter = config.logoPosition === "top-center";
  var logoTopRight = config.logoPosition === "top-right";
  var logoBottomLeft = config.logoPosition === "bottom-left";
  var logoBottomCenter = config.logoPosition === "bottom-center";
  var logoBottomRight = config.logoPosition === "bottom-right";
  var logoAtTop = logoTopLeft || logoTopCenter || logoTopRight;

  // Use 100% width - let html2pdf handle the page sizing
  var html = '<div style="font-family: \'Segoe UI\', Arial, sans-serif; color: #1a1a2e; line-height: 1.4; width: 100%; box-sizing: border-box;">';

  // Header with logo (if top position)
  if (config.logo && logoAtTop) {
    var logoAlign = logoTopCenter ? "center" : (logoTopRight ? "right" : "left");
    html += '<div style="text-align: ' + logoAlign + '; margin-bottom: 16px;">';
    html += '<img src="' + config.logo + '" alt="Logo" style="max-height: 60px; max-width: 180px;">';
    html += '</div>';
  }

  // Title header
  html += '<div style="border-bottom: 3px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px;">';
  html += '<h1 style="color: #0f172a; margin: 0; font-size: 24px; text-align: center;">' + ERM.utils.escapeHtml(config.title) + '</h1>';
  html += '</div>';

  // Build dynamic table headers based on selected fields
  var fieldMap = {
    riskId: { label: "ID", getter: function(r, index) { return r.reference || ("R-" + String((index || 0) + 1).padStart(3, "0")); } },
    title: { label: "Risk Title", getter: function(r) { return r.title || "-"; } },
    category: { label: "Category", getter: function(r) { return self.formatCategory(r.category) || "-"; } },
    description: { label: "Description", getter: function(r) { return r.description ? r.description.substring(0, 80) + (r.description.length > 80 ? "..." : "") : "-"; } },
    rootCauses: { label: "Root Causes", getter: function(r) { return (r.rootCauses && r.rootCauses.length) ? r.rootCauses.join("; ") : "-"; } },
    consequences: { label: "Consequences", getter: function(r) { return (r.consequences && r.consequences.length) ? r.consequences.join("; ") : "-"; } },
    linkedControls: { label: "Controls", getter: function(r) { return (r.linkedControls && r.linkedControls.length) ? r.linkedControls.length + " linked" : "-"; } },
    inherentLikelihood: { label: "Inh. L", getter: function(r) { return r.inherentLikelihood || "-"; } },
    inherentImpact: { label: "Inh. I", getter: function(r) { return r.inherentImpact || "-"; } },
    inherentRiskScore: { label: "Inherent", getter: function(r) { return r.inherentScore || "-"; }, isScore: true, scoreType: "inherent" },
    residualLikelihood: { label: "Res. L", getter: function(r) { return r.residualLikelihood || "-"; } },
    residualImpact: { label: "Res. I", getter: function(r) { return r.residualImpact || "-"; } },
    residualRiskScore: { label: "Residual", getter: function(r) { return r.residualScore || "-"; }, isScore: true, scoreType: "residual" },
    treatment: { label: "Treatment", getter: function(r) { return r.treatment || "-"; } },
    actionPlan: { label: "Action Plan", getter: function(r) { return (r.actionPlan && r.actionPlan.length) ? r.actionPlan.join("; ") : "-"; } },
    riskOwner: { label: "Risk Owner", getter: function(r) { return r.owner || "-"; } },
    actionOwner: { label: "Action Owner", getter: function(r) { return r.actionOwner || "-"; } },
    targetDate: { label: "Target Date", getter: function(r) { return r.targetDate || "-"; } },
    reviewDate: { label: "Review Date", getter: function(r) { return r.reviewDate || "-"; } },
    status: { label: "Status", getter: function(r) { return r.status || "-"; } },
    escalation: { label: "Escalation", getter: function(r) { return r.escalation || "No"; } },
    escalationLevel: { label: "Esc. Level", getter: function(r) { return r.escalationLevel || "-"; } },
    escalationOwner: { label: "Esc. Owner", getter: function(r) { return r.escalationOwner || "-"; } }
  };

  // Build headers and count columns for font size scaling
  var activeFields = [];
  var selectedFields = config.selectedFields || [];

  // Default fields if none selected
  if (selectedFields.length === 0) {
    selectedFields = ["riskId", "title", "category", "inherentRiskScore", "residualRiskScore", "status"];
  }

  for (var h = 0; h < selectedFields.length; h++) {
    var fieldId = selectedFields[h];
    if (fieldMap[fieldId]) {
      activeFields.push(fieldMap[fieldId]);
    }
  }

  // Safety check - if still no fields, add defaults directly
  if (activeFields.length === 0) {
    activeFields = [
      fieldMap.riskId,
      fieldMap.title,
      fieldMap.category,
      fieldMap.inherentRiskScore,
      fieldMap.residualRiskScore,
      fieldMap.status
    ];
  }

  // Calculate font size based on column count
  var colCount = activeFields.length;
  var fontSize = colCount > 12 ? 7 : (colCount > 8 ? 8 : (colCount > 5 ? 9 : 10));
  var headerPadding = colCount > 10 ? "4px 3px" : "8px 6px";
  var cellPadding = colCount > 10 ? "3px 2px" : "6px 4px";

  // Risk details table
  html += '<h2 style="color: #1e293b; margin: 24px 0 12px 0; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Risk Details</h2>';
  html += '<table style="width: 100%; border-collapse: collapse; font-size: ' + fontSize + 'px; table-layout: fixed;">';
  html += '<thead><tr style="background: #f1f5f9;">';

  // Build headers
  for (var hi = 0; hi < activeFields.length; hi++) {
    html += '<th style="padding: ' + headerPadding + '; border: 1px solid #e2e8f0; text-align: left; font-weight: 600; word-wrap: break-word;">' + activeFields[hi].label + '</th>';
  }
  html += '</tr></thead><tbody>';

  // Build rows
  for (var j = 0; j < risks.length; j++) {
    var risk = risks[j];
    html += '<tr>';
    for (var c = 0; c < activeFields.length; c++) {
      var field = activeFields[c];
      var value = field.getter(risk, j);
      var cellStyle = "padding: " + cellPadding + "; border: 1px solid #e2e8f0; word-wrap: break-word; overflow: hidden;";

      if (field.isScore) {
        var scoreVal = field.scoreType === "inherent" ? risk.inherentScore : risk.residualScore;
        var color = self.getRiskColor(scoreVal);
        cellStyle += " text-align: center; color: " + color.text + "; font-weight: 600;";
      }

      html += '<td style="' + cellStyle + '">' + ERM.utils.escapeHtml(String(value)) + '</td>';
    }
    html += '</tr>';
  }
  html += '</tbody></table>';

  // Signature blocks (if below table position)
  if (config.signatures && config.signatures.length > 0 && config.signaturePosition === "below-table") {
    html += self.buildSignatureBlocksHtml(config.signatures);
  }

  // Footer logo (if bottom position)
  if (config.logo && !logoAtTop) {
    var bottomAlign = logoBottomCenter ? "center" : (logoBottomRight ? "right" : "left");
    html += '<div style="text-align: ' + bottomAlign + '; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">';
    html += '<img src="' + config.logo + '" alt="Logo" style="max-height: 50px; max-width: 150px;">';
    html += '</div>';
  }

  // Signature blocks (if footer position)
  if (config.signatures && config.signatures.length > 0 && config.signaturePosition === "footer") {
    html += self.buildSignatureBlocksHtml(config.signatures);
  }

  // Generate document ID and timestamps
  var now = new Date();
  var dateStr = now.toLocaleDateString("en-GB").replace(/\//g, "/");
  var timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  var docId = "DOC-" + now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") + "-" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  // Footer with logo, metadata and circular stamp - using table for html2pdf compatibility
  html += '<table style="width: 100%; margin-top: 40px; border-collapse: collapse;">';
  html += '<tr>';

  // Left side - logo next to metadata
  html += '<td style="vertical-align: middle; text-align: left; padding: 20px 0 0 0;">';
  html += '<table style="border-collapse: collapse;">';
  html += '<tr>';
  // Logo
  if (config.logo) {
    html += '<td style="vertical-align: middle; padding-right: 20px;">';
    html += '<img src="' + config.logo + '" alt="Logo" style="max-height: 60px; max-width: 120px;">';
    html += '</td>';
  }
  // Metadata
  html += '<td style="vertical-align: middle; font-size: 11px; color: #64748b; line-height: 1.8;">';
  html += '<div><strong>Generated:</strong> ' + dateStr + ' at ' + timeStr + '</div>';
  html += '<div><strong>Report ID:</strong> ' + docId + '</div>';
  html += '<div><strong>Generated by:</strong> ' + (ERM.state.user ? ERM.utils.escapeHtml(ERM.state.user.name) : "System") + '</div>';
  html += '</td>';
  html += '</tr>';
  html += '</table>';
  html += '</td>';

  // Right side - circular stamp using inline-block for better pdf rendering
  html += '<td style="vertical-align: top; text-align: right; padding: 20px 0 0 0; width: 130px;">';
  html += '<div style="display: inline-block; width: 110px; height: 110px; border: 3px solid #dc2626; border-radius: 55px; text-align: center; padding-top: 15px; box-sizing: border-box; overflow: visible;">';
  html += '<div style="font-size: 8px; color: #dc2626; font-weight: 700; letter-spacing: 1px; line-height: 1;">GENERATED</div>';
  html += '<div style="font-size: 9px; color: #dc2626; font-weight: 600; margin: 5px 0; line-height: 1;">' + dateStr + '</div>';
  html += '<div style="font-size: 6px; color: #dc2626; padding: 0 8px; line-height: 1.3;">' + docId + '</div>';
  html += '<div style="width: 50px; height: 1px; background-color: #dc2626; margin: 5px auto;"></div>';
  html += '<div style="font-size: 9px; color: #dc2626; font-weight: 700; letter-spacing: 1px; line-height: 1;">ORIGINAL</div>';
  html += '</div>';
  html += '</td>';

  html += '</tr>';
  html += '</table>';

  // Watermark logo centered below footer - bigger size
  html += '<div style="text-align: center; margin-top: 24px; padding-top: 16px;">';
  html += '<img src="assets/images/watermark-logo.png" alt="Dimeri ERM" style="max-height: 60px; max-width: 200px;" onerror="this.style.display=\'none\'">';
  html += '</div>';

  // Page number (if enabled)
  if (config.showPageNumbers) {
    html += '<div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8;">';
    html += 'Page 1 of 1';
    html += '</div>';
  }

  html += '</div>';

  return html;
};

/**
 * Gather all PDF configuration from the modal
 */
ERM.riskRegister.gatherPDFConfig = function (reportId) {
  var titleInput = document.getElementById("pdf-report-title");
  var reportTitle = titleInput ? titleInput.value : "Risk Register Report";

  // Get selected fields
  var selectedFields = [];
  var fieldCheckboxes = document.querySelectorAll('input[name="export-field"]:checked');
  for (var f = 0; f < fieldCheckboxes.length; f++) {
    selectedFields.push(fieldCheckboxes[f].value);
  }

  // Get signatures
  var signatureNames = [];
  var signatureInputs = document.querySelectorAll(".signature-name");
  for (var s = 0; s < signatureInputs.length; s++) {
    if (signatureInputs[s].value.trim()) {
      signatureNames.push(signatureInputs[s].value.trim());
    }
  }

  return {
    title: reportTitle,
    orientation: this._orientation || "portrait",
    showPageNumbers: this._showPageNumbers !== false,
    logo: this._uploadedLogo,
    logoPosition: this._logoPosition || "top-left",
    signatures: signatureNames,
    signaturePosition: this._signaturePosition || "footer",
    selectedFields: selectedFields,
    reportId: reportId
  };
};

/**
 * Generate PDF preview window
 */
ERM.riskRegister.generatePDFPreviewWindow = function (register, risks, config, autoPrint) {
  var self = this;
  var isLandscape = config.orientation === "landscape";
  var html = "";

  // Determine logo position styles
  var logoTopLeft = config.logoPosition === "top-left";
  var logoTopCenter = config.logoPosition === "top-center";
  var logoTopRight = config.logoPosition === "top-right";
  var logoBottomLeft = config.logoPosition === "bottom-left";
  var logoBottomCenter = config.logoPosition === "bottom-center";
  var logoBottomRight = config.logoPosition === "bottom-right";
  var logoAtTop = logoTopLeft || logoTopCenter || logoTopRight;

  // Header with logo (if top position)
  if (config.logo && logoAtTop) {
    var logoAlign = logoTopCenter ? "center" : (logoTopRight ? "right" : "left");
    html += '<div style="text-align: ' + logoAlign + '; margin-bottom: 16px;">';
    html += '<img src="' + config.logo + '" alt="Logo" style="max-height: 60px; max-width: 180px;">';
    html += '</div>';
  }

  // Title header
  html += '<div style="border-bottom: 3px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px;">';
  html += '<h1 style="color: #0f172a; margin: 0; font-size: 24px; text-align: center;">' + ERM.utils.escapeHtml(config.title) + '</h1>';
  html += '</div>';

  // Build dynamic table headers based on selected fields - matching actual risk form
  var fieldMap = {
    riskId: { label: "ID", getter: function(r, index) { return r.reference || ("R-" + String((index || 0) + 1).padStart(3, "0")); } },
    title: { label: "Risk Title", getter: function(r) { return r.title || "-"; } },
    category: { label: "Category", getter: function(r) { return self.formatCategory(r.category) || "-"; } },
    description: { label: "Description", getter: function(r) { return r.description || "-"; } },
    rootCauses: { label: "Root Causes", getter: function(r) { return (r.rootCauses && r.rootCauses.length) ? r.rootCauses.join("; ") : "-"; } },
    consequences: { label: "Consequences", getter: function(r) { return (r.consequences && r.consequences.length) ? r.consequences.join("; ") : "-"; } },
    linkedControls: { label: "Controls", getter: function(r) { return (r.linkedControls && r.linkedControls.length) ? r.linkedControls.length + " linked" : "-"; } },
    inherentLikelihood: { label: "Inh. L", getter: function(r) { return r.inherentLikelihood || "-"; } },
    inherentImpact: { label: "Inh. I", getter: function(r) { return r.inherentImpact || "-"; } },
    inherentRiskScore: { label: "Inherent", getter: function(r) { return r.inherentScore || "-"; }, isScore: true, scoreType: "inherent" },
    residualLikelihood: { label: "Res. L", getter: function(r) { return r.residualLikelihood || "-"; } },
    residualImpact: { label: "Res. I", getter: function(r) { return r.residualImpact || "-"; } },
    residualRiskScore: { label: "Residual", getter: function(r) { return r.residualScore || "-"; }, isScore: true, scoreType: "residual" },
    treatment: { label: "Treatment", getter: function(r) { return r.treatment || "-"; } },
    actionPlan: { label: "Action Plan", getter: function(r) { return (r.actionPlan && r.actionPlan.length) ? r.actionPlan.join("; ") : "-"; } },
    riskOwner: { label: "Risk Owner", getter: function(r) { return r.owner || "-"; } },
    actionOwner: { label: "Action Owner", getter: function(r) { return r.actionOwner || "-"; } },
    targetDate: { label: "Target Date", getter: function(r) { return r.targetDate || "-"; } },
    reviewDate: { label: "Review Date", getter: function(r) { return r.reviewDate || "-"; } },
    status: { label: "Status", getter: function(r) { return r.status || "-"; } },
    escalation: { label: "Escalation", getter: function(r) { return r.escalation || "No"; } },
    escalationLevel: { label: "Esc. Level", getter: function(r) { return r.escalationLevel || "-"; } },
    escalationOwner: { label: "Esc. Owner", getter: function(r) { return r.escalationOwner || "-"; } }
  };

  // Build headers and count columns for font size scaling
  var activeFields = [];
  for (var h = 0; h < config.selectedFields.length; h++) {
    var fieldId = config.selectedFields[h];
    if (fieldMap[fieldId]) {
      activeFields.push(fieldMap[fieldId]);
    }
  }

  // Calculate font size based on column count - more columns = smaller font
  var colCount = activeFields.length;
  var fontSize = colCount > 12 ? 7 : (colCount > 8 ? 8 : (colCount > 5 ? 9 : 10));
  var headerPadding = colCount > 10 ? "4px 3px" : "8px 6px";
  var cellPadding = colCount > 10 ? "3px 2px" : "6px 4px";

  // Risk details table
  html += '<h2 style="color: #1e293b; margin: 24px 0 12px 0; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Risk Details</h2>';
  html += '<table style="width: 100%; border-collapse: collapse; font-size: ' + fontSize + 'px; table-layout: fixed;">';
  html += '<thead><tr style="background: #f1f5f9;">';

  // Build headers
  for (var hi = 0; hi < activeFields.length; hi++) {
    html += '<th style="padding: ' + headerPadding + '; border: 1px solid #e2e8f0; text-align: left; font-weight: 600; word-wrap: break-word;">' + activeFields[hi].label + '</th>';
  }
  html += '</tr></thead><tbody>';

  // Build rows
  for (var j = 0; j < risks.length; j++) {
    var risk = risks[j];
    html += '<tr>';
    for (var c = 0; c < activeFields.length; c++) {
      var field = activeFields[c];
      var value = field.getter(risk, j);
      var cellStyle = "padding: " + cellPadding + "; border: 1px solid #e2e8f0; word-wrap: break-word; overflow: hidden;";

      if (field.isScore) {
        var scoreVal = field.scoreType === "inherent" ? risk.inherentScore : risk.residualScore;
        var color = self.getRiskColor(scoreVal);
        cellStyle += " text-align: center; color: " + color.text + "; font-weight: 600;";
      }

      html += '<td style="' + cellStyle + '">' + ERM.utils.escapeHtml(String(value)) + '</td>';
    }
    html += '</tr>';
  }
  html += '</tbody></table>';

  // Signature blocks (if below table position)
  if (config.signatures && config.signatures.length > 0 && config.signaturePosition === "below-table") {
    html += self.buildSignatureBlocksHtml(config.signatures);
  }

  // Footer logo (if bottom position)
  if (config.logo && !logoAtTop) {
    var bottomAlign = logoBottomCenter ? "center" : (logoBottomRight ? "right" : "left");
    html += '<div style="text-align: ' + bottomAlign + '; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">';
    html += '<img src="' + config.logo + '" alt="Logo" style="max-height: 50px; max-width: 150px;">';
    html += '</div>';
  }

  // Signature blocks (if footer position)
  if (config.signatures && config.signatures.length > 0 && config.signaturePosition === "footer") {
    html += self.buildSignatureBlocksHtml(config.signatures);
  }

  // Generate document ID and timestamps
  var now = new Date();
  var dateStr = now.toLocaleDateString("en-GB").replace(/\//g, "/");
  var timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  var docId = "DOC-" + now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") + "-" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  // Footer with logo, metadata and circular stamp - using table for PDF compatibility
  html += '<table style="width: 100%; margin-top: 40px; padding-top: 20px; border-collapse: collapse;">';
  html += '<tr>';

  // Left side - logo next to metadata
  html += '<td style="vertical-align: middle; text-align: left;">';
  html += '<table style="border-collapse: collapse;">';
  html += '<tr>';
  // Logo
  if (config.logo) {
    html += '<td style="vertical-align: middle; padding-right: 20px;">';
    html += '<img src="' + config.logo + '" alt="Logo" style="max-height: 60px; max-width: 120px;">';
    html += '</td>';
  }
  // Metadata
  html += '<td style="vertical-align: middle; font-size: 11px; color: #64748b; line-height: 1.8;">';
  html += '<div><strong>Generated:</strong> ' + dateStr + ' at ' + timeStr + '</div>';
  html += '<div><strong>Report ID:</strong> ' + docId + '</div>';
  html += '<div><strong>Generated by:</strong> ' + (ERM.state.user ? ERM.utils.escapeHtml(ERM.state.user.name) : "System") + '</div>';
  html += '</td>';
  html += '</tr>';
  html += '</table>';
  html += '</td>';

  // Right side - circular stamp using inline-block for better pdf rendering
  html += '<td style="vertical-align: top; text-align: right; width: 120px;">';
  html += '<div style="display: inline-block; width: 100px; height: 100px; border: 3px solid #dc2626; border-radius: 50px; text-align: center; padding-top: 12px; box-sizing: border-box;">';
  html += '<div style="font-size: 8px; color: #dc2626; font-weight: 700; letter-spacing: 1px; line-height: 1;">GENERATED</div>';
  html += '<div style="font-size: 9px; color: #dc2626; font-weight: 600; margin: 4px 0; line-height: 1;">' + dateStr + '</div>';
  html += '<div style="font-size: 6px; color: #dc2626; padding: 0 6px; line-height: 1.2;">' + docId + '</div>';
  html += '<div style="width: 50px; height: 1px; background-color: #dc2626; margin: 4px auto;"></div>';
  html += '<div style="font-size: 9px; color: #dc2626; font-weight: 700; letter-spacing: 1px; line-height: 1;">ORIGINAL</div>';
  html += '</div>';
  html += '</td>';

  html += '</tr>';
  html += '</table>';

  // Open window
  var printWindow = window.open("", "_blank");
  printWindow.document.write("<!DOCTYPE html><html><head>");
  printWindow.document.write("<title>" + ERM.utils.escapeHtml(config.title) + "</title>");
  printWindow.document.write("<style>");
  printWindow.document.write("@page { size: " + (isLandscape ? "landscape" : "portrait") + "; margin: 15mm; }");
  printWindow.document.write("body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; color: #1a1a2e; line-height: 1.4; }");
  if (config.showPageNumbers) {
    printWindow.document.write("@page { @bottom-center { content: 'Page ' counter(page) ' of ' counter(pages); font-size: 10px; color: #94a3b8; } }");
  }
  printWindow.document.write("@media print { body { padding: 0; } }");
  printWindow.document.write("</style>");
  printWindow.document.write("</head><body>");
  printWindow.document.write(html);
  printWindow.document.write("</body></html>");
  printWindow.document.close();

  if (autoPrint) {
    setTimeout(function () {
      printWindow.print();
    }, 500);
  }
};

/**
 * Build signature blocks HTML
 */
ERM.riskRegister.buildSignatureBlocksHtml = function (signatures) {
  var html = '<div style="margin-top: 48px; page-break-inside: avoid;">';
  html += '<h3 style="color: #475569; font-size: 12px; margin-bottom: 24px;">Approvals</h3>';
  // Using table for PDF compatibility instead of flex
  html += '<table style="width: 100%; border-collapse: collapse;">';
  html += '<tr>';
  for (var s = 0; s < signatures.length; s++) {
    var sigWidth = Math.floor(100 / signatures.length);
    html += '<td style="width: ' + sigWidth + '%; text-align: center; padding: 0 16px;">';
    html += '<div style="border-bottom: 1px solid #94a3b8; height: 40px; margin-bottom: 8px;"></div>';
    html += '<div style="color: #64748b; font-size: 11px;">' + ERM.utils.escapeHtml(signatures[s]) + '</div>';
    html += '<div style="color: #94a3b8; font-size: 10px; margin-top: 4px;">Date: ________________</div>';
    html += '</td>';
  }
  html += '</tr>';
  html += '</table>';
  html += '</div>';
  return html;
};

/**
 * Export risk register in specified format
 */
ERM.riskRegister.exportRegister = function (format) {
  var register = this.state.currentRegister;
  if (!register) return;

  var risks = ERM.storage.get("risks") || [];
  var registerRisks = [];
  for (var i = 0; i < risks.length; i++) {
    if (risks[i].registerId === register.id) {
      registerRisks.push(risks[i]);
    }
  }

  var fileName = register.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '-' + new Date().toISOString().split('T')[0];
  var blob, mimeType;

  if (format === 'csv') {
    var csv = this.risksToCSV(registerRisks);
    blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    fileName += '.csv';
    mimeType = 'CSV';
  } else if (format === 'json') {
    var json = JSON.stringify({
      register: register,
      risks: registerRisks,
      exportedAt: new Date().toISOString(),
      exportedBy: ERM.state.user ? ERM.state.user.name : 'Unknown'
    }, null, 2);
    blob = new Blob([json], { type: 'application/json' });
    fileName += '.json';
    mimeType = 'JSON';
  } else if (format === 'pdf') {
    // Show progress overlay then export
    this.showQuickPDFExportProgress(register, registerRisks);
    return;
  }

  // Download file
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Log activity
  if (ERM.activityLogger) {
    ERM.activityLogger.log('register', 'exported', 'risk-register', register.name, {
      registerId: register.id,
      format: mimeType,
      riskCount: registerRisks.length
    });
  }

  ERM.toast.success('Register exported as ' + mimeType);
};

/**
 * Convert risks to CSV format
 */
ERM.riskRegister.risksToCSV = function (risks) {
  var headers = ['ID', 'Title', 'Category', 'Description', 'Owner', 'Status', 'Inherent Likelihood', 'Inherent Impact', 'Inherent Score', 'Inherent Risk', 'Residual Likelihood', 'Residual Impact', 'Residual Score', 'Residual Risk', 'Treatment', 'Target Date', 'Created At', 'Updated At'];
  var rows = [headers.join(',')];

  for (var i = 0; i < risks.length; i++) {
    var r = risks[i];
    var row = [
      r.id || '',
      '"' + (r.title || '').replace(/"/g, '""') + '"',
      '"' + (r.category || '').replace(/"/g, '""') + '"',
      '"' + (r.description || '').replace(/"/g, '""') + '"',
      '"' + (r.owner || '').replace(/"/g, '""') + '"',
      r.status || '',
      r.inherentLikelihood || '',
      r.inherentImpact || '',
      r.inherentScore || '',
      r.inherentRisk || '',
      r.residualLikelihood || '',
      r.residualImpact || '',
      r.residualScore || '',
      r.residualRisk || '',
      '"' + (r.treatment || '').replace(/"/g, '""') + '"',
      r.targetDate || '',
      r.createdAt || '',
      r.updatedAt || ''
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
};

/**
 * Show progress overlay for quick PDF export
 */
ERM.riskRegister.showQuickPDFExportProgress = function (register, risks) {
  var self = this;

  // Build progress modal content
  var progressContent = '';
  progressContent += '<div class="export-progress-container">';
  progressContent += '  <div class="export-icon-wrapper" id="export-icon-wrapper">';
  progressContent += '    <div class="export-icon-circle" id="export-icon-circle">';
  progressContent += '      <svg id="export-stage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">';
  progressContent += '        <ellipse cx="12" cy="5" rx="9" ry="3"/>';
  progressContent += '        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>';
  progressContent += '        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>';
  progressContent += '      </svg>';
  progressContent += '    </div>';
  progressContent += '  </div>';
  progressContent += '  <h3 class="export-progress-title" id="export-progress-title">Generating Report...</h3>';
  progressContent += '  <div class="export-progress-bar-container">';
  progressContent += '    <div class="export-progress-bar">';
  progressContent += '      <div class="export-progress-fill" id="pdf-export-progress-fill"></div>';
  progressContent += '    </div>';
  progressContent += '  </div>';
  progressContent += '  <p class="export-progress-status" id="pdf-export-status">Compiling risk data...</p>';
  progressContent += '</div>';

  ERM.components.showModal({
    title: 'Exporting PDF',
    content: progressContent,
    size: 'small',
    buttons: [],
    closeOnBackdrop: false,
    showCloseButton: false
  });

  // Animate progress then export
  this.animateQuickPDFExportProgress(register, risks);
};

/**
 * Animate quick export progress stages
 */
ERM.riskRegister.animateQuickPDFExportProgress = function (register, risks) {
  var self = this;
  var progressFill = document.getElementById('pdf-export-progress-fill');
  var statusText = document.getElementById('pdf-export-status');
  var iconCircle = document.getElementById('export-icon-circle');
  var iconWrapper = document.getElementById('export-icon-wrapper');
  var titleEl = document.getElementById('export-progress-title');

  var icons = {
    data: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    document: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="32" height="32"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
  };

  var stages = [
    { progress: 25, text: 'Compiling risk data...', icon: 'data' },
    { progress: 50, text: 'Processing risk scores...', icon: 'chart' },
    { progress: 75, text: 'Formatting document...', icon: 'document' },
    { progress: 100, text: 'Preparing download...', icon: 'download' }
  ];

  var stageIndex = 0;

  function updateIcon(iconKey) {
    if (iconCircle && icons[iconKey]) {
      iconCircle.innerHTML = icons[iconKey];
      iconCircle.style.transform = 'scale(1.1)';
      setTimeout(function () {
        iconCircle.style.transform = 'scale(1)';
      }, 150);
    }
  }

  function nextStage() {
    if (stageIndex < stages.length) {
      var stage = stages[stageIndex];
      if (progressFill) progressFill.style.width = stage.progress + '%';
      if (statusText) statusText.textContent = stage.text;
      updateIcon(stage.icon);
      stageIndex++;

      if (stageIndex < stages.length) {
        setTimeout(nextStage, 500);
      } else {
        // Show completion state
        setTimeout(function () {
          updateIcon('success');
          if (iconCircle) iconCircle.classList.add('success');
          if (iconWrapper) iconWrapper.classList.add('success');
          if (titleEl) {
            titleEl.textContent = 'Report Ready!';
            titleEl.classList.add('success');
          }
          if (statusText) statusText.textContent = 'Your PDF is ready for download';

          // Export PDF after showing success
          setTimeout(function () {
            ERM.components.closeModal();
            self.exportRegisterPDF(register, risks);

            // Log activity
            if (ERM.activityLogger) {
              ERM.activityLogger.log('register', 'exported', 'risk-register', register.name, {
                registerId: register.id,
                format: 'PDF',
                riskCount: risks.length
              });
            }
          }, 1000);
        }, 300);
      }
    }
  }

  setTimeout(nextStage, 300);
};

/**
 * Export register as printable PDF
 */
ERM.riskRegister.exportRegisterPDF = function (register, risks) {
  var html = '';

  // Header
  html += '<h1 style="color: #0f172a; border-bottom: 3px solid #3b82f6; padding-bottom: 16px;">Risk Register: ' + ERM.utils.escapeHtml(register.name) + '</h1>';
  html += '<div style="color: #64748b; margin-bottom: 24px;">';
  html += '<p><strong>Exported:</strong> ' + new Date().toLocaleDateString('en-GB') + ' | ';
  html += '<strong>Total Risks:</strong> ' + risks.length + '</p>';
  html += '</div>';

  // Summary
  var critical = 0, high = 0, medium = 0, low = 0;
  for (var i = 0; i < risks.length; i++) {
    var score = risks[i].inherentScore || 0;
    if (score >= 15) critical++;
    else if (score >= 10) high++;
    else if (score >= 5) medium++;
    else low++;
  }

  html += '<h2 style="color: #1e293b; margin-top: 24px;">Risk Summary</h2>';
  html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">';
  html += '<tr style="background: #f1f5f9;"><th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">Risk Level</th><th style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">Count</th></tr>';
  html += '<tr><td style="padding: 10px; border: 1px solid #e2e8f0; color: #dc2626;">Critical</td><td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">' + critical + '</td></tr>';
  html += '<tr><td style="padding: 10px; border: 1px solid #e2e8f0; color: #f59e0b;">High</td><td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">' + high + '</td></tr>';
  html += '<tr><td style="padding: 10px; border: 1px solid #e2e8f0; color: #eab308;">Medium</td><td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">' + medium + '</td></tr>';
  html += '<tr><td style="padding: 10px; border: 1px solid #e2e8f0; color: #22c55e;">Low</td><td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">' + low + '</td></tr>';
  html += '</table>';

  // Risks table
  html += '<h2 style="color: #1e293b; margin-top: 24px;">Risk Details</h2>';
  html += '<table style="width: 100%; border-collapse: collapse;">';
  html += '<tr style="background: #f1f5f9;">';
  html += '<th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">Title</th>';
  html += '<th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">Category</th>';
  html += '<th style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">Inherent</th>';
  html += '<th style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">Residual</th>';
  html += '<th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">Owner</th>';
  html += '<th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">Status</th>';
  html += '</tr>';

  for (var j = 0; j < risks.length; j++) {
    var r = risks[j];
    html += '<tr>';
    html += '<td style="padding: 10px; border: 1px solid #e2e8f0;">' + ERM.utils.escapeHtml(r.title || '') + '</td>';
    html += '<td style="padding: 10px; border: 1px solid #e2e8f0;">' + ERM.utils.escapeHtml(this.formatCategory(r.category)) + '</td>';
    html += '<td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">' + (r.inherentScore || '-') + '</td>';
    html += '<td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">' + (r.residualScore || '-') + '</td>';
    html += '<td style="padding: 10px; border: 1px solid #e2e8f0;">' + ERM.utils.escapeHtml(r.owner || '') + '</td>';
    html += '<td style="padding: 10px; border: 1px solid #e2e8f0;">' + ERM.utils.escapeHtml(r.status || '') + '</td>';
    html += '</tr>';
  }
  html += '</table>';

  // Open in new window
  var printWindow = window.open('', '_blank');
  printWindow.document.write('<!DOCTYPE html><html><head>');
  printWindow.document.write('<title>Risk Register: ' + ERM.utils.escapeHtml(register.name) + '</title>');
  printWindow.document.write('<style>');
  printWindow.document.write('body { font-family: "Segoe UI", Arial, sans-serif; margin: 40px; color: #1a1a2e; }');
  printWindow.document.write('@media print { body { margin: 20px; } }');
  printWindow.document.write('</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write(html);
  printWindow.document.write('</body></html>');
  printWindow.document.close();

  setTimeout(function() {
    printWindow.print();
  }, 500);

  ERM.toast.success('Register exported as PDF');
};

/* ========================================
   IMPORT MODAL
   ======================================== */
ERM.riskRegister.showImportModal = function () {
  var content =
    '<div class="import-section">' +
    '<p class="text-secondary">Import risks into "' +
    ERM.utils.escapeHtml(
      this.state.currentRegister
        ? this.state.currentRegister.name
        : "your register"
    ) +
    '":</p>' +
    '<div class="form-group">' +
    '<label class="form-label">Upload File</label>' +
    '<div class="file-upload-area" id="file-upload-area">' +
    '<div class="file-upload-icon">📁</div>' +
    '<p class="file-upload-text">Drag & drop a CSV or JSON file here</p>' +
    '<p class="file-upload-hint">or click to browse</p>' +
    '<input type="file" id="import-file-input" accept=".csv,.json" style="display:none;">' +
    "</div>" +
    "</div>" +
    '<div class="import-options">' +
    '<label class="checkbox-wrapper">' +
    '<input type="checkbox" id="import-overwrite">' +
    '<span class="checkbox-custom"></span>' +
    '<span class="checkbox-label">Overwrite existing risks with same ID</span>' +
    "</label>" +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: "Import Risks",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Import", type: "primary", action: "import" },
    ],
    onOpen: function () {
      var uploadArea = document.getElementById("file-upload-area");
      var fileInput = document.getElementById("import-file-input");

      if (uploadArea && fileInput) {
        uploadArea.addEventListener("click", function () {
          fileInput.click();
        });

        fileInput.addEventListener("change", function () {
          if (this.files && this.files[0]) {
            var fileName = this.files[0].name;
            uploadArea.innerHTML =
              '<div class="file-upload-icon">✅</div>' +
              '<p class="file-upload-text">' +
              ERM.utils.escapeHtml(fileName) +
              "</p>" +
              '<p class="file-upload-hint">Ready to import</p>';
          }
        });
      }
    },
    onAction: function (action) {
      if (action === "import") {
        ERM.components.closeModal();
        ERM.toast.info("Import feature coming soon");
      }
    },
  });
};

/* ========================================
   RISK FORM MODAL
   ======================================== */
ERM.riskRegister.showRiskModal = function (riskId) {
  var self = this;
  this.state.editingRiskId = riskId;

  var risk = null;
  if (riskId) {
    var risks = ERM.storage.get("risks") || [];
    for (var i = 0; i < risks.length; i++) {
      if (risks[i].id === riskId) {
        risk = risks[i];
        break;
      }
    }
  }

  var isEdit = !!risk;
  var title = isEdit ? "Edit Risk" : "Add Risk";

  // Default values
  var r = risk || {
    title: "",
    category: "",
    description: "",
    rootCauses: [],
    consequences: [],
    inherentLikelihood: 3,
    inherentImpact: 3,
    residualLikelihood: 2,
    residualImpact: 2,
    treatment: "Mitigate",
    actionPlan: [],
    owner: "",
    actionOwner: "",
    targetDate: "",
    status: "Identified",
    reviewDate: "",
    linkedControls: [],
    attachments: [],
    escalation: "No",
    escalationLevel: "",
    escalationLevelOther: "",
    escalationOwner: "",
  };

  // Migrate old data: causes -> rootCauses
  if (r.causes && !r.rootCauses) {
    r.rootCauses = r.causes;
  }
  // Migrate old actionPlan string to array
  if (typeof r.actionPlan === "string" && r.actionPlan) {
    r.actionPlan = [r.actionPlan];
  } else if (!Array.isArray(r.actionPlan)) {
    r.actionPlan = [];
  }

  var inherentScore = r.inherentLikelihood * r.inherentImpact;
  var residualScore = r.residualLikelihood * r.residualImpact;

  // Get category label for display (category value stored in hidden field)
  var categoryLabel = r.category ? this.formatCategory(r.category) : "";

  // Build root causes list
  var rootCausesHtml = "";
  var rootCauses = r.rootCauses || [];
  for (var ci = 0; ci < rootCauses.length; ci++) {
    rootCausesHtml +=
      '<div class="list-input-item" data-index="' +
      ci +
      '">' +
      '<span class="list-input-text">' +
      ERM.utils.escapeHtml(rootCauses[ci]) +
      "</span>" +
      '<button type="button" class="list-input-remove" data-list="rootCauses" data-index="' +
      ci +
      '">' +
      this.icons.close +
      "</button>" +
      "</div>";
  }

  // Build consequences list
  var consequencesHtml = "";
  var consequences = r.consequences || [];
  for (var qi = 0; qi < consequences.length; qi++) {
    consequencesHtml +=
      '<div class="list-input-item" data-index="' +
      qi +
      '">' +
      '<span class="list-input-text">' +
      ERM.utils.escapeHtml(consequences[qi]) +
      "</span>" +
      '<button type="button" class="list-input-remove" data-list="consequences" data-index="' +
      qi +
      '">' +
      this.icons.close +
      "</button>" +
      "</div>";
  }

  // Build action plan list
  var actionPlanHtml = "";
  var actionPlanItems = r.actionPlan || [];
  for (var ai = 0; ai < actionPlanItems.length; ai++) {
    actionPlanHtml +=
      '<div class="list-input-item" data-index="' +
      ai +
      '">' +
      '<span class="list-input-text">' +
      ERM.utils.escapeHtml(actionPlanItems[ai]) +
      "</span>" +
      '<button type="button" class="list-input-remove" data-list="actionPlan" data-index="' +
      ai +
      '">' +
      this.icons.close +
      "</button>" +
      "</div>";
  }

  // Build attachments list
  var attachmentsHtml = "";
  var attachments = r.attachments || [];
  for (var fi = 0; fi < attachments.length; fi++) {
    var file = attachments[fi];
    var fileIcon = this.getFileIcon(file.type);
    attachmentsHtml +=
      '<div class="attachment-item" data-index="' +
      fi +
      '">' +
      '<div class="attachment-icon">' +
      fileIcon +
      "</div>" +
      '<div class="attachment-info">' +
      '<span class="attachment-name">' +
      ERM.utils.escapeHtml(file.name) +
      "</span>" +
      '<span class="attachment-size">' +
      this.formatFileSize(file.size) +
      "</span>" +
      "</div>" +
      '<div class="attachment-actions">' +
      '<button type="button" class="btn btn-icon btn-ghost attachment-preview" data-index="' +
      fi +
      '" title="Preview">' +
      this.icons.eye +
      "</button>" +
      '<button type="button" class="btn btn-icon btn-ghost attachment-remove" data-index="' +
      fi +
      '" title="Remove">' +
      this.icons.close +
      "</button>" +
      "</div>" +
      "</div>";
  }

  var content =
    '<form id="risk-form" class="risk-form">' +
    // Section 1: Risk Identification
    '<div class="form-section">' +
    '<h3 class="form-section-title">1. Risk Identification</h3>' +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Risk Title <span class="required">*</span></label>' +
    '<button type="button" class="btn-ai-suggest" data-field="title">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<input type="text" class="form-input" id="risk-title" value="' +
    ERM.utils.escapeHtml(r.title) +
    '" placeholder="e.g., Cybersecurity Breach">' +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Risk Category <span class="required">*</span></label>' +
    '<button type="button" class="btn-ai-suggest" data-field="category">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<input type="hidden" id="risk-category-id" value="' +
    ERM.utils.escapeHtml(r.category || "") +
    '">' +
    '<input type="text" class="form-input" id="risk-category" value="' +
    ERM.utils.escapeHtml(categoryLabel) +
    '" placeholder="Type category or click AI for suggestions...">' +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Risk Description</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="description">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<textarea class="form-textarea" id="risk-description" rows="3" placeholder="Detailed description of the risk...">' +
    ERM.utils.escapeHtml(r.description || "") +
    "</textarea>" +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Root Cause (Why might this happen?)</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="rootCauses">' +
    this.icons.sparkles +
    " Suggest</button>" +
    "</div>" +
    '<div class="list-input-container" id="rootCauses-list">' +
    rootCausesHtml +
    "</div>" +
    '<div class="list-input-add">' +
    '<input type="text" class="form-input" id="rootCause-input" placeholder="Add a root cause and press Enter...">' +
    '<button type="button" class="btn btn-primary btn-icon add-list-item" data-list="rootCauses">' +
    this.icons.plus +
    "</button>" +
    "</div>" +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Consequences (What would be the impact?)</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="consequences">' +
    this.icons.sparkles +
    " Suggest</button>" +
    "</div>" +
    '<div class="list-input-container" id="consequences-list">' +
    consequencesHtml +
    "</div>" +
    '<div class="list-input-add">' +
    '<input type="text" class="form-input" id="consequence-input" placeholder="Add a consequence and press Enter...">' +
    '<button type="button" class="btn btn-primary btn-icon add-list-item" data-list="consequences">' +
    this.icons.plus +
    "</button>" +
    "</div>" +
    "</div>" +
    // Linked Controls inline (Section 1 sub-section)
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Linked Controls</label>' +
    "</div>" +
    this.buildInlineControlSelector(riskId) +
    '<button type="button" class="btn btn-add-inline-control" id="add-inline-control" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none;">' +
    this.icons.plus +
    ' Create New Control <span style="display: inline-block; padding: 2px 8px; background: rgba(255,255,255,0.25); border-radius: 4px; font-weight: 600; margin-left: 4px;">✨ AI</span>' +
    "</button>" +
    "</div>" +
    "</div>" +
    // Section 2: Risk Assessment
    '<div class="form-section">' +
    '<h3 class="form-section-title">2. Risk Assessment (ISO 31000)</h3>' +
    '<div class="risk-assessment-grid">' +
    // Inherent Risk
    '<div class="risk-assessment-column">' +
    '<h4 class="risk-column-title">Inherent Risk <span class="risk-info">(before controls)</span></h4>' +
    '<div class="form-row">' +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Likelihood</label>' +
    '<button type="button" class="btn-ai-suggest btn-ai-sm" data-field="inherentLikelihood">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<select class="form-select" id="inherent-likelihood">' +
    '<option value="1"' +
    (r.inherentLikelihood == 1 ? " selected" : "") +
    ">1 - Rare</option>" +
    '<option value="2"' +
    (r.inherentLikelihood == 2 ? " selected" : "") +
    ">2 - Unlikely</option>" +
    '<option value="3"' +
    (r.inherentLikelihood == 3 ? " selected" : "") +
    ">3 - Possible</option>" +
    '<option value="4"' +
    (r.inherentLikelihood == 4 ? " selected" : "") +
    ">4 - Likely</option>" +
    '<option value="5"' +
    (r.inherentLikelihood == 5 ? " selected" : "") +
    ">5 - Almost Certain</option>" +
    "</select>" +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Impact</label>' +
    '<button type="button" class="btn-ai-suggest btn-ai-sm" data-field="inherentImpact">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<select class="form-select" id="inherent-impact">' +
    '<option value="1"' +
    (r.inherentImpact == 1 ? " selected" : "") +
    ">1 - Negligible</option>" +
    '<option value="2"' +
    (r.inherentImpact == 2 ? " selected" : "") +
    ">2 - Minor</option>" +
    '<option value="3"' +
    (r.inherentImpact == 3 ? " selected" : "") +
    ">3 - Moderate</option>" +
    '<option value="4"' +
    (r.inherentImpact == 4 ? " selected" : "") +
    ">4 - Major</option>" +
    '<option value="5"' +
    (r.inherentImpact == 5 ? " selected" : "") +
    ">5 - Catastrophic</option>" +
    "</select>" +
    "</div>" +
    "</div>" +
    '<div class="risk-score-display">' +
    '<span class="risk-score-value" id="inherent-score">' +
    inherentScore +
    "</span>" +
    '<span class="risk-level-badge ' +
    this.getRiskLevelClass(inherentScore) +
    '" id="inherent-level">' +
    this.getRiskLevelFromScore(inherentScore) +
    "</span>" +
    "</div>" +
    '<div class="heat-map-container" id="inherent-heatmap">' +
    this.renderHeatMap("inherent", r.inherentLikelihood, r.inherentImpact) +
    "</div>" +
    "</div>" +
    // Residual Risk
    '<div class="risk-assessment-column">' +
    '<h4 class="risk-column-title">Residual Risk <span class="risk-info">(after controls)</span></h4>' +
    '<div class="form-row">' +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Likelihood</label>' +
    '<button type="button" class="btn-ai-suggest btn-ai-sm" data-field="residualLikelihood">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<select class="form-select" id="residual-likelihood">' +
    '<option value="1"' +
    (r.residualLikelihood == 1 ? " selected" : "") +
    ">1 - Rare</option>" +
    '<option value="2"' +
    (r.residualLikelihood == 2 ? " selected" : "") +
    ">2 - Unlikely</option>" +
    '<option value="3"' +
    (r.residualLikelihood == 3 ? " selected" : "") +
    ">3 - Possible</option>" +
    '<option value="4"' +
    (r.residualLikelihood == 4 ? " selected" : "") +
    ">4 - Likely</option>" +
    '<option value="5"' +
    (r.residualLikelihood == 5 ? " selected" : "") +
    ">5 - Almost Certain</option>" +
    "</select>" +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Impact</label>' +
    '<button type="button" class="btn-ai-suggest btn-ai-sm" data-field="residualImpact">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<select class="form-select" id="residual-impact">' +
    '<option value="1"' +
    (r.residualImpact == 1 ? " selected" : "") +
    ">1 - Negligible</option>" +
    '<option value="2"' +
    (r.residualImpact == 2 ? " selected" : "") +
    ">2 - Minor</option>" +
    '<option value="3"' +
    (r.residualImpact == 3 ? " selected" : "") +
    ">3 - Moderate</option>" +
    '<option value="4"' +
    (r.residualImpact == 4 ? " selected" : "") +
    ">4 - Major</option>" +
    '<option value="5"' +
    (r.residualImpact == 5 ? " selected" : "") +
    ">5 - Catastrophic</option>" +
    "</select>" +
    "</div>" +
    "</div>" +
    '<div class="risk-score-display">' +
    '<span class="risk-score-value" id="residual-score">' +
    residualScore +
    "</span>" +
    '<span class="risk-level-badge ' +
    this.getRiskLevelClass(residualScore) +
    '" id="residual-level">' +
    this.getRiskLevelFromScore(residualScore) +
    "</span>" +
    "</div>" +
    '<div class="heat-map-container" id="residual-heatmap">' +
    this.renderHeatMap("residual", r.residualLikelihood, r.residualImpact) +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    // Section 3: Risk Treatment
    '<div class="form-section">' +
    '<h3 class="form-section-title">3. Risk Treatment (ISO 31000)</h3>' +
    '<div class="form-row">' +
    '<div class="form-group">' +
    '<label class="form-label">Treatment Decision</label>' +
    '<select class="form-select" id="risk-treatment">' +
    '<option value="Mitigate"' +
    (r.treatment === "Mitigate" ? " selected" : "") +
    ">Mitigate (Reduce)</option>" +
    '<option value="Transfer"' +
    (r.treatment === "Transfer" ? " selected" : "") +
    ">Transfer (Insurance/Outsource)</option>" +
    '<option value="Avoid"' +
    (r.treatment === "Avoid" ? " selected" : "") +
    ">Avoid (Eliminate)</option>" +
    '<option value="Accept"' +
    (r.treatment === "Accept" ? " selected" : "") +
    ">Accept (Tolerate)</option>" +
    "</select>" +
    "</div>" +
    '<div class="form-group">' +
    '<label class="form-label">Status</label>' +
    '<select class="form-select" id="risk-status">' +
    '<option value="Identified"' +
    (r.status === "Identified" ? " selected" : "") +
    ">Identified</option>" +
    '<option value="Assessed"' +
    (r.status === "Assessed" ? " selected" : "") +
    ">Assessed</option>" +
    '<option value="Treated"' +
    (r.status === "Treated" ? " selected" : "") +
    ">Treated</option>" +
    '<option value="Monitoring"' +
    (r.status === "Monitoring" ? " selected" : "") +
    ">Monitoring</option>" +
    '<option value="Closed"' +
    (r.status === "Closed" ? " selected" : "") +
    ">Closed</option>" +
    "</select>" +
    "</div>" +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Action Plan</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="actionPlan">' +
    this.icons.sparkles +
    " Suggest</button>" +
    "</div>" +
    '<div class="list-input-container" id="actionPlan-list">' +
    actionPlanHtml +
    "</div>" +
    '<div class="list-input-add">' +
    '<input type="text" class="form-input" id="actionPlan-input" placeholder="Add an action and press Enter...">' +
    '<button type="button" class="btn btn-primary btn-icon add-list-item" data-list="actionPlan">' +
    this.icons.plus +
    "</button>" +
    "</div>" +
    "</div>" +
    '<div class="form-row">' +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Risk Owner <span class="required">*</span></label>' +
    '<div class="form-label-actions">' +
    '<button type="button" class="btn-notify-upgrade" title="Email Notifications">' +
    this.icons.mail +
    " Notify</button>" +
    '<button type="button" class="btn-notify-upgrade" id="add-modal-risk-owner" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-color: #86efac; color: #16a34a;" title="Add Multiple Owners">' +
    this.icons.plus +
    " Add</button>" +
    "</div>" +
    "</div>" +
    '<input type="text" class="form-input" id="risk-owner" value="' +
    ERM.utils.escapeHtml(r.owner || "") +
    '" placeholder="e.g., CISO, CFO">' +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Action Owner</label>' +
    '<div class="form-label-actions">' +
    '<button type="button" class="btn-notify-upgrade" title="Email Notifications">' +
    this.icons.mail +
    " Notify</button>" +
    '<button type="button" class="btn-notify-upgrade" id="add-modal-action-owner" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-color: #86efac; color: #16a34a;" title="Add Multiple Owners">' +
    this.icons.plus +
    " Add</button>" +
    '<button type="button" class="btn-ai-suggest" data-field="actionOwner">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    "</div>" +
    '<input type="text" class="form-input" id="risk-action-owner" value="' +
    ERM.utils.escapeHtml(r.actionOwner || "") +
    '" placeholder="Person implementing actions">' +
    "</div>" +
    "</div>" +
    '<div class="form-row">' +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Target Date</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="targetDate">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<input type="date" class="form-input" id="risk-target-date" value="' +
    (r.targetDate || "") +
    '">' +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Review Date</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="reviewDate">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<input type="date" class="form-input" id="risk-review-date" value="' +
    (r.reviewDate || "") +
    '">' +
    "</div>" +
    "</div>" +
    "</div>" +
    // Section 4: Escalation
    '<div class="form-section">' +
    '<h3 class="form-section-title">4. Escalation</h3>' +
    '<div class="form-group">' +
    '<label class="form-label">Escalation Required?</label>' +
    '<select class="form-select" id="risk-escalation">' +
    '<option value="No"' + (r.escalation === "No" ? " selected" : "") + ">No</option>" +
    '<option value="Yes"' + (r.escalation === "Yes" ? " selected" : "") + ">Yes</option>" +
    "</select>" +
    "</div>" +
    '<div id="escalation-fields" class="escalation-fields" style="display: ' + (r.escalation === "Yes" ? "block" : "none") + ';">' +
    '<div class="form-group">' +
    '<label class="form-label">Escalation Level</label>' +
    '<select class="form-select" id="escalation-level">' +
    '<option value=""' + (!r.escalationLevel ? " selected" : "") + ">Select level...</option>" +
    '<option value="Department / Function"' + (r.escalationLevel === "Department / Function" ? " selected" : "") + ">Department / Function</option>" +
    '<option value="Executive Management"' + (r.escalationLevel === "Executive Management" ? " selected" : "") + ">Executive Management</option>" +
    '<option value="Risk Committee"' + (r.escalationLevel === "Risk Committee" ? " selected" : "") + ">Risk Committee</option>" +
    '<option value="Board / Audit Committee"' + (r.escalationLevel === "Board / Audit Committee" ? " selected" : "") + ">Board / Audit Committee</option>" +
    '<option value="Other"' + (r.escalationLevel === "Other" ? " selected" : "") + ">Other</option>" +
    "</select>" +
    "</div>" +
    '<div class="form-group" id="escalation-level-other-group" style="display: ' + (r.escalationLevel === "Other" ? "block" : "none") + ';">' +
    '<label class="form-label">Other (Please specify)</label>' +
    '<input type="text" class="form-input" id="escalation-level-other" value="' + ERM.utils.escapeHtml(r.escalationLevelOther || "") + '" placeholder="Specify escalation level...">' +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Escalation Owner</label>' +
    '<div class="form-label-actions">' +
    '<button type="button" class="btn-notify-upgrade" title="Email Notifications">' +
    this.icons.mail +
    " Notify</button>" +
    "</div>" +
    "</div>" +
    '<input type="text" class="form-input" id="escalation-owner" value="' + ERM.utils.escapeHtml(r.escalationOwner || "") + '" placeholder="e.g., Chief Risk Officer, Risk Committee Chair">' +
    "</div>" +
    "</div>" +
    "</div>" +
    // Section 5: Evidence & Attachments (was Section 4)
    '<div class="form-section">' +
    '<div class="form-section-header-with-ai">' +
    '<h3 class="form-section-title">5. Evidence & Attachments</h3>' +
    '<button type="button" class="btn-ai-suggest-evidence" id="ai-suggest-evidence" title="AI will suggest relevant documents based on risk details">' +
    this.icons.sparkles +
    ' Suggest Documents</button>' +
    '</div>' +
    '<div class="ai-evidence-suggestion" id="ai-evidence-suggestion" style="display:none;">' +
    '<div class="ai-evidence-content" id="ai-evidence-content"></div>' +
    '</div>' +
    '<div class="attachment-upload-area" id="attachment-drop-zone">' +
    '<div class="attachment-upload-icon">' +
    this.icons.upload +
    "</div>" +
    '<div class="attachment-upload-text">' +
    '<p>Drop files here or <label for="attachment-input" class="attachment-browse-link">browse</label></p>' +
    '<span class="attachment-upload-hint">Excel, PDF, Images, Documents (Max 5MB each)</span>' +
    "</div>" +
    '<input type="file" id="attachment-input" multiple accept=".xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx" style="display:none">' +
    "</div>" +
    '<div class="attachment-list" id="attachment-list">' +
    attachmentsHtml +
    "</div>" +
    "</div>" +
    // AI Check Bar
    '<div class="ai-check-bar">' +
    '<div class="ai-check-content">' +
    '<div class="ai-check-icon">' +
    this.icons.sparkles +
    "</div>" +
    '<span class="ai-check-text">AI can help review this risk</span>' +
    "</div>" +
    '<div class="ai-check-actions">' +
    '<button type="button" class="btn-ai-review" id="ai-review-risk">' +
    this.icons.sparkles +
    " Review Risk</button>" +
    "</div>" +
    "</div>" +
    "</form>";

  var buttons = [{ label: "Cancel", type: "secondary", action: "close" }];

  if (isEdit) {
    buttons.push({ label: "Delete", type: "danger", action: "delete" });
  }

  buttons.push({
    label: isEdit ? "Save Changes" : "Create Risk",
    type: "primary",
    action: "save",
  });

  ERM.components.showModal({
    title: title,
    content: content,
    size: "xl",
    buttons: buttons,
    onOpen: function () {
      self.initRiskFormEvents();
    },
    onAction: function (action) {
      if (action === "save") {
        self.saveRisk(riskId);
      } else if (action === "delete" && riskId) {
        ERM.components.closeModal();
        self.showDeleteRiskModal(riskId);
      }
    },
  });
};

/* ========================================
   RISK FORM EVENTS
   ======================================== */
ERM.riskRegister.initRiskFormEvents = function () {
  var self = this;

  // Likelihood/Impact dropdowns - update heat maps
  var inherentLikelihood = document.getElementById("inherent-likelihood");
  var inherentImpact = document.getElementById("inherent-impact");
  var residualLikelihood = document.getElementById("residual-likelihood");
  var residualImpact = document.getElementById("residual-impact");

  if (inherentLikelihood) {
    inherentLikelihood.addEventListener("change", function () {
      self.updateHeatMap("inherent");
    });
  }
  if (inherentImpact) {
    inherentImpact.addEventListener("change", function () {
      self.updateHeatMap("inherent");
    });
  }
  if (residualLikelihood) {
    residualLikelihood.addEventListener("change", function () {
      self.updateHeatMap("residual");
    });
  }
  if (residualImpact) {
    residualImpact.addEventListener("change", function () {
      self.updateHeatMap("residual");
    });
  }

  // List input handlers (causes, consequences)
  this.initListInputHandlers();

  // Category text input - clear ID when user manually types
  var categoryText = document.getElementById("risk-category");
  var categoryId = document.getElementById("risk-category-id");
  if (categoryText && categoryId) {
    categoryText.addEventListener("input", function () {
      // User is typing manually, clear the AI-selected ID
      categoryId.value = "";
    });
  }

  // Escalation toggle - show/hide conditional fields
  var escalationSelect = document.getElementById("risk-escalation");
  var escalationFields = document.getElementById("escalation-fields");
  if (escalationSelect && escalationFields) {
    escalationSelect.addEventListener("change", function () {
      if (this.value === "Yes") {
        escalationFields.style.display = "block";
      } else {
        escalationFields.style.display = "none";
      }
    });
  }

  // Escalation Level "Other" toggle
  var escalationLevelSelect = document.getElementById("escalation-level");
  var escalationLevelOtherGroup = document.getElementById("escalation-level-other-group");
  if (escalationLevelSelect && escalationLevelOtherGroup) {
    escalationLevelSelect.addEventListener("change", function () {
      if (this.value === "Other") {
        escalationLevelOtherGroup.style.display = "block";
      } else {
        escalationLevelOtherGroup.style.display = "none";
      }
    });
  }

  // AI suggest buttons
  var aiButtons = document.querySelectorAll(".btn-ai-suggest");
  for (var i = 0; i < aiButtons.length; i++) {
    aiButtons[i].addEventListener("click", function () {
      var field = this.getAttribute("data-field");
      self.handleAISuggest(field);
    });
  }

  // AI suggest evidence button
  var aiSuggestEvidenceBtn = document.getElementById("ai-suggest-evidence");
  if (aiSuggestEvidenceBtn) {
    aiSuggestEvidenceBtn.addEventListener("click", function () {
      self.handleAISuggestEvidence();
    });
  }

  // Create New Control button (hybrid: AI Generate vs Manual)
  var addInlineControlBtn = document.getElementById("add-inline-control");
  if (addInlineControlBtn) {
    console.log('[Risk Form] "Create New Control" button found, binding click handler');
    // Get risk ID from state (set in showRiskModal)
    var currentRiskId = self.state.editingRiskId || null;

    addInlineControlBtn.addEventListener("click", function () {
      console.log('[Risk Form] "Create New Control" button clicked!');

      // Extract risk context for AI
      var riskContext = {
        title: document.getElementById("risk-title")
          ? document.getElementById("risk-title").value
          : "",
        category:
          document.getElementById("risk-category-id")
            ? document.getElementById("risk-category-id").value
            : document.getElementById("risk-category")
            ? document.getElementById("risk-category").value
            : "",
        description: document.getElementById("risk-description")
          ? document.getElementById("risk-description").value
          : "",
        riskId: currentRiskId,
      };

      console.log('[Risk Form] Risk context extracted:', riskContext);
      console.log('[Risk Form] Calling showAIControlSuggestions()...');

      // Show AI control suggestions
      self.showAIControlSuggestions(riskContext);
    });
  } else {
    console.warn('[Risk Form] "Create New Control" button NOT found!');
  }

  // Notify upgrade buttons (generic - shows email modal)
  var notifyButtons = document.querySelectorAll('.btn-notify-upgrade:not([id^="add-"])');
  for (var j = 0; j < notifyButtons.length; j++) {
    notifyButtons[j].addEventListener("click", function () {
      self.showEmailUpgradeModal();
    });
  }

  // Add owner buttons (specific - shows multiple owners modal)
  var addRiskOwnerBtn = document.getElementById("add-modal-risk-owner");
  if (addRiskOwnerBtn) {
    addRiskOwnerBtn.addEventListener("click", function () {
      self.showMultipleOwnersUpgradeModal();
    });
  }

  var addActionOwnerBtn = document.getElementById("add-modal-action-owner");
  if (addActionOwnerBtn) {
    addActionOwnerBtn.addEventListener("click", function () {
      self.showMultipleOwnersUpgradeModal();
    });
  }

  // AI check bar buttons
  var reviewBtn = document.getElementById("ai-review-risk");

  if (reviewBtn) {
    reviewBtn.addEventListener("click", function () {
      if (typeof ERM.ai !== "undefined" && ERM.ai.reviewEntireRisk) {
        ERM.ai.reviewEntireRisk();
      } else {
        ERM.toast.info("AI review coming soon");
      }
    });
  }

  // Inline control creation button - handled above in AI suggest section

  // Attachment handlers
  this.initAttachmentHandlers();
};

/* ========================================
   LIST INPUT HANDLERS
   ======================================== */
ERM.riskRegister.initListInputHandlers = function () {
  var self = this;

  // Add root cause
  var rootCauseInput = document.getElementById("rootCause-input");
  var addRootCauseBtn = document.querySelector(
    '.add-list-item[data-list="rootCauses"]'
  );

  var addRootCause = function () {
    var value = rootCauseInput.value.trim();
    if (value) {
      self.addListItem("rootCauses", value);
      rootCauseInput.value = "";
    }
  };

  if (rootCauseInput) {
    rootCauseInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addRootCause();
      }
    });
  }

  if (addRootCauseBtn) {
    addRootCauseBtn.addEventListener("click", function (e) {
      e.preventDefault();
      addRootCause();
    });
  }

  // Add consequence
  var consequenceInput = document.getElementById("consequence-input");
  var addConsequenceBtn = document.querySelector(
    '.add-list-item[data-list="consequences"]'
  );

  var addConsequence = function () {
    var value = consequenceInput.value.trim();
    if (value) {
      self.addListItem("consequences", value);
      consequenceInput.value = "";
    }
  };

  if (consequenceInput) {
    consequenceInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addConsequence();
      }
    });
  }

  if (addConsequenceBtn) {
    addConsequenceBtn.addEventListener("click", function (e) {
      e.preventDefault();
      addConsequence();
    });
  }

  // Add action plan
  var actionPlanInput = document.getElementById("actionPlan-input");
  var addActionPlanBtn = document.querySelector(
    '.add-list-item[data-list="actionPlan"]'
  );

  var addActionPlan = function () {
    var value = actionPlanInput.value.trim();
    if (value) {
      self.addListItem("actionPlan", value);
      actionPlanInput.value = "";
    }
  };

  if (actionPlanInput) {
    actionPlanInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addActionPlan();
      }
    });
  }

  if (addActionPlanBtn) {
    addActionPlanBtn.addEventListener("click", function (e) {
      e.preventDefault();
      addActionPlan();
    });
  }

  // Remove item handlers
  this.initRemoveListItemHandlers();
};

ERM.riskRegister.addListItem = function (listType, value) {
  var container = document.getElementById(listType + "-list");
  if (!container) return;

  var items = container.querySelectorAll(".list-input-item");
  var index = items.length;

  var itemHtml =
    '<div class="list-input-item" data-index="' +
    index +
    '">' +
    '<span class="list-input-text">' +
    ERM.utils.escapeHtml(value) +
    "</span>" +
    '<button type="button" class="list-input-remove" data-list="' +
    listType +
    '" data-index="' +
    index +
    '">' +
    this.icons.close +
    "</button>" +
    "</div>";

  container.insertAdjacentHTML("beforeend", itemHtml);
  this.initRemoveListItemHandlers();
};

ERM.riskRegister.initRemoveListItemHandlers = function () {
  var removeBtns = document.querySelectorAll(".list-input-remove");

  for (var i = 0; i < removeBtns.length; i++) {
    removeBtns[i].onclick = function (e) {
      e.preventDefault();
      var item = this.closest(".list-input-item");
      if (item) {
        item.remove();
      }
    };
  }
};

ERM.riskRegister.getListItems = function (listType) {
  var container = document.getElementById(listType + "-list");
  if (!container) return [];

  var items = container.querySelectorAll(".list-input-item .list-input-text");
  var values = [];

  for (var i = 0; i < items.length; i++) {
    values.push(items[i].textContent);
  }

  return values;
};

/* ========================================
   AI SUGGEST HANDLER
   ======================================== */
ERM.riskRegister.handleAISuggest = function (field) {
  console.log("[AI Suggest] handleAISuggest called with field:", field);

  // Check if this is a scoring field - route to new DeepSeek-powered scoring
  var scoringFields = ["inherentLikelihood", "inherentImpact", "residualLikelihood", "residualImpact"];

  if (scoringFields.indexOf(field) !== -1) {
    console.log("[AI Suggest] This is a scoring field, routing to riskAI module");
    // Route to the new DeepSeek-powered scoring in risk-register-ai-ui.js
    if (typeof ERM.riskAI !== "undefined" && ERM.riskAI.handleFieldSuggest) {
      ERM.riskAI.handleFieldSuggest(field);
    } else {
      console.log("[AI Suggest] riskAI not available, using legacy scoring");
      this.handleAIScoring(field);
    }
  } else if (typeof ERM.riskAI !== "undefined" && ERM.riskAI.handleFieldSuggest) {
    console.log("[AI Suggest] Using riskAI.handleFieldSuggest");
    // Use riskAI module for other field suggestions
    ERM.riskAI.handleFieldSuggest(field);
  } else if (typeof ERM.ai !== "undefined" && ERM.ai.suggestFieldContent) {
    console.log("[AI Suggest] Using general AI module");
    // Fallback to general AI module
    ERM.ai.suggestFieldContent("risk", "risk-" + field, field);
  } else {
    console.log("[AI Suggest] No AI handler available");
    ERM.toast.info("AI suggestions coming soon for: " + field);
  }
};

/* ========================================
   AI SUGGEST EVIDENCE HANDLER
   ======================================== */
ERM.riskRegister.handleAISuggestEvidence = function () {
  var self = this;
  var suggestionContainer = document.getElementById("ai-evidence-suggestion");
  var suggestionContent = document.getElementById("ai-evidence-content");
  var suggestBtn = document.getElementById("ai-suggest-evidence");

  if (!suggestionContainer || !suggestionContent) return;

  // Gather risk context
  var riskTitle = document.getElementById("risk-title");
  var riskCategory = document.getElementById("risk-category");
  var riskDescription = document.getElementById("risk-description");

  var title = riskTitle ? riskTitle.value.trim() : "";
  var category = riskCategory ? riskCategory.value.trim() : "";
  var description = riskDescription ? riskDescription.value.trim() : "";

  if (!title && !category) {
    ERM.toast.info("Please enter a risk title or category first");
    return;
  }

  // Show loading state
  suggestBtn.disabled = true;
  suggestBtn.innerHTML = '<span class="spinner-small"></span> Analyzing...';
  suggestionContainer.style.display = "block";
  suggestionContent.innerHTML = '<div class="ai-loading">Analyzing risk to suggest relevant evidence documents...</div>';

  // Build AI prompt
  var prompt = "Based on this risk, suggest 3-5 types of evidence documents that should be attached to support proper risk management and audit trails.\n\n";
  prompt += "Risk Title: " + title + "\n";
  if (category) prompt += "Category: " + category + "\n";
  if (description) prompt += "Description: " + description + "\n";
  prompt += "\nProvide brief, practical suggestions for document types (e.g., 'Policy document', 'Training records', 'Audit report', etc.). Format as a simple bulleted list. Keep each suggestion to one line.";

  // Use AI service
  if (ERM.aiService && ERM.aiService.generateText) {
    ERM.aiService.generateText(prompt, {
      maxTokens: 300,
      temperature: 0.7
    }, function(result) {
      suggestBtn.disabled = false;
      suggestBtn.innerHTML = self.icons.sparkles + ' Suggest Documents';

      if (result.success && result.text) {
        // Format the response
        var formattedText = result.text.trim();
        // Convert markdown bullets to HTML
        formattedText = formattedText
          .replace(/^[\-\*]\s+/gm, '<li>')
          .replace(/<li>/g, '</li><li>')
          .replace('</li><li>', '<ul><li>')
          + '</li></ul>';

        suggestionContent.innerHTML =
          '<div class="ai-evidence-header">' +
          '<span class="ai-evidence-icon">' + self.icons.sparkles + '</span>' +
          '<span>Suggested Evidence Documents</span>' +
          '<button type="button" class="ai-evidence-close" onclick="document.getElementById(\'ai-evidence-suggestion\').style.display=\'none\'">×</button>' +
          '</div>' +
          '<div class="ai-evidence-list">' + formattedText + '</div>' +
          '<div class="ai-evidence-footer">Upload documents that match these categories above.</div>';
      } else {
        suggestionContent.innerHTML =
          '<div class="ai-error">Unable to generate suggestions. Please try again.</div>' +
          '<button type="button" class="btn-link" onclick="document.getElementById(\'ai-evidence-suggestion\').style.display=\'none\'">Dismiss</button>';
      }
    });
  } else {
    // Fallback - show generic suggestions based on category
    suggestBtn.disabled = false;
    suggestBtn.innerHTML = self.icons.sparkles + ' Suggest Documents';

    var genericSuggestions = self.getGenericEvidenceSuggestions(category || title);
    suggestionContent.innerHTML =
      '<div class="ai-evidence-header">' +
      '<span class="ai-evidence-icon">' + self.icons.sparkles + '</span>' +
      '<span>Suggested Evidence Documents</span>' +
      '<button type="button" class="ai-evidence-close" onclick="document.getElementById(\'ai-evidence-suggestion\').style.display=\'none\'">×</button>' +
      '</div>' +
      '<div class="ai-evidence-list"><ul>' + genericSuggestions + '</ul></div>' +
      '<div class="ai-evidence-footer">Upload documents that match these categories above.</div>';
  }
};

/**
 * Get generic evidence suggestions based on risk category
 */
ERM.riskRegister.getGenericEvidenceSuggestions = function (categoryOrTitle) {
  var text = (categoryOrTitle || "").toLowerCase();
  var suggestions = [];

  // Common suggestions for all risks
  suggestions.push("<li>Risk assessment report or documentation</li>");

  // Category-specific suggestions
  if (text.indexOf("cyber") !== -1 || text.indexOf("security") !== -1 || text.indexOf("data") !== -1) {
    suggestions.push("<li>Security policy and procedures</li>");
    suggestions.push("<li>Penetration test results</li>");
    suggestions.push("<li>Access control logs or reports</li>");
    suggestions.push("<li>Security awareness training records</li>");
  } else if (text.indexOf("compliance") !== -1 || text.indexOf("regulatory") !== -1) {
    suggestions.push("<li>Compliance audit reports</li>");
    suggestions.push("<li>Regulatory correspondence</li>");
    suggestions.push("<li>Policy attestation records</li>");
    suggestions.push("<li>Training completion certificates</li>");
  } else if (text.indexOf("financial") !== -1 || text.indexOf("fraud") !== -1) {
    suggestions.push("<li>Financial audit reports</li>");
    suggestions.push("<li>Reconciliation records</li>");
    suggestions.push("<li>Approval workflow documentation</li>");
    suggestions.push("<li>Segregation of duties matrix</li>");
  } else if (text.indexOf("operational") !== -1 || text.indexOf("process") !== -1) {
    suggestions.push("<li>Process documentation or SOPs</li>");
    suggestions.push("<li>Incident reports</li>");
    suggestions.push("<li>Performance metrics</li>");
    suggestions.push("<li>Quality assurance records</li>");
  } else if (text.indexOf("health") !== -1 || text.indexOf("safety") !== -1) {
    suggestions.push("<li>Safety inspection reports</li>");
    suggestions.push("<li>Incident/accident reports</li>");
    suggestions.push("<li>Training records</li>");
    suggestions.push("<li>Safety equipment certifications</li>");
  } else {
    // Generic fallback
    suggestions.push("<li>Relevant policy or procedure documents</li>");
    suggestions.push("<li>Audit or review reports</li>");
    suggestions.push("<li>Training records</li>");
    suggestions.push("<li>Control testing evidence</li>");
  }

  return suggestions.join("");
};

/* ========================================
   ATTACHMENT HANDLERS
   ======================================== */
ERM.riskRegister.initAttachmentHandlers = function () {
  var self = this;
  var dropZone = document.getElementById("attachment-drop-zone");
  var fileInput = document.getElementById("attachment-input");

  if (!dropZone || !fileInput) return;

  // Click to browse
  dropZone.addEventListener("click", function (e) {
    if (e.target.tagName !== "LABEL" && e.target.tagName !== "INPUT") {
      fileInput.click();
    }
  });

  // File input change
  fileInput.addEventListener("change", function () {
    if (this.files.length > 0) {
      self.handleFileSelect(this.files);
    }
  });

  // Drag and drop
  dropZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("drag-over");
  });

  dropZone.addEventListener("drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("drag-over");

    if (e.dataTransfer.files.length > 0) {
      self.handleFileSelect(e.dataTransfer.files);
    }
  });

  // Initialize remove handlers for existing attachments
  this.initAttachmentRemoveHandlers();
};

ERM.riskRegister.handleFileSelect = function (files) {
  var self = this;
  var maxSize = 5 * 1024 * 1024; // 5MB
  var allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    "application/vnd.ms-excel", // xls
    "text/csv",
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/msword", // doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  ];

  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    // Validate size
    if (file.size > maxSize) {
      ERM.toast.error(file.name + " is too large (max 5MB)");
      continue;
    }

    // Validate type
    if (allowedTypes.indexOf(file.type) === -1) {
      ERM.toast.error(file.name + " has an unsupported file type");
      continue;
    }

    // Read file as base64
    (function (f) {
      var reader = new FileReader();
      reader.onload = function (e) {
        self.addAttachment({
          name: f.name,
          type: f.type,
          size: f.size,
          data: e.target.result,
          uploadedAt: new Date().toISOString(),
        });
      };
      reader.readAsDataURL(f);
    })(file);
  }
};

ERM.riskRegister.addAttachment = function (fileData) {
  var container = document.getElementById("attachment-list");
  if (!container) return;

  var items = container.querySelectorAll(".attachment-item");
  var index = items.length;
  var fileIcon = this.getFileIcon(fileData.type);

  var itemHtml =
    '<div class="attachment-item" data-index="' +
    index +
    '">' +
    '<div class="attachment-icon">' +
    fileIcon +
    "</div>" +
    '<div class="attachment-info">' +
    '<span class="attachment-name">' +
    ERM.utils.escapeHtml(fileData.name) +
    "</span>" +
    '<span class="attachment-size">' +
    this.formatFileSize(fileData.size) +
    "</span>" +
    "</div>" +
    '<div class="attachment-actions">' +
    '<button type="button" class="btn btn-icon btn-ghost attachment-preview" data-index="' +
    index +
    '" title="Preview">' +
    this.icons.eye +
    "</button>" +
    '<button type="button" class="btn btn-icon btn-ghost attachment-remove" data-index="' +
    index +
    '" title="Remove">' +
    this.icons.close +
    "</button>" +
    "</div>" +
    '<input type="hidden" class="attachment-data" value="' +
    ERM.utils.escapeHtml(JSON.stringify(fileData)) +
    '">' +
    "</div>";

  container.insertAdjacentHTML("beforeend", itemHtml);
  this.initAttachmentRemoveHandlers();
  ERM.toast.success(fileData.name + " uploaded");
};

ERM.riskRegister.initAttachmentRemoveHandlers = function () {
  var self = this;

  // Remove buttons
  var removeBtns = document.querySelectorAll(".attachment-remove");
  for (var i = 0; i < removeBtns.length; i++) {
    removeBtns[i].onclick = function (e) {
      e.preventDefault();
      var item = this.closest(".attachment-item");
      if (item) {
        item.remove();
      }
    };
  }

  // Preview buttons
  var previewBtns = document.querySelectorAll(".attachment-preview");
  for (var j = 0; j < previewBtns.length; j++) {
    previewBtns[j].onclick = function (e) {
      e.preventDefault();
      var item = this.closest(".attachment-item");
      var dataInput = item.querySelector(".attachment-data");
      if (dataInput) {
        var fileData = JSON.parse(dataInput.value);
        self.previewAttachment(fileData);
      }
    };
  }
};

ERM.riskRegister.previewAttachment = function (fileData) {
  var content = "";

  if (fileData.type.indexOf("image") !== -1) {
    content =
      '<div class="attachment-preview-image"><img src="' +
      fileData.data +
      '" alt="' +
      ERM.utils.escapeHtml(fileData.name) +
      '"></div>';
  } else if (fileData.type === "application/pdf") {
    content =
      '<div class="attachment-preview-pdf"><iframe src="' +
      fileData.data +
      '" width="100%" height="500"></iframe></div>';
  } else {
    content =
      '<div class="attachment-preview-info">' +
      '<div class="attachment-preview-icon">' +
      this.getFileIcon(fileData.type) +
      "</div>" +
      "<p><strong>" +
      ERM.utils.escapeHtml(fileData.name) +
      "</strong></p>" +
      "<p>Size: " +
      this.formatFileSize(fileData.size) +
      "</p>" +
      "<p>Type: " +
      fileData.type +
      "</p>" +
      '<a href="' +
      fileData.data +
      '" download="' +
      ERM.utils.escapeHtml(fileData.name) +
      '" class="btn btn-primary">Download</a>' +
      "</div>";
  }

  ERM.components.showSecondaryModal({
    title: "Preview: " + fileData.name,
    content: content,
    size: "lg",
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
  });
};

ERM.riskRegister.getAttachments = function () {
  var container = document.getElementById("attachment-list");
  if (!container) return [];

  var dataInputs = container.querySelectorAll(".attachment-data");
  var attachments = [];

  for (var i = 0; i < dataInputs.length; i++) {
    try {
      var fileData = JSON.parse(dataInputs[i].value);
      attachments.push(fileData);
    } catch (e) {
      console.error("Error parsing attachment data:", e);
    }
  }

  return attachments;
};

ERM.riskRegister.getFileIcon = function (fileType) {
  if (
    fileType.indexOf("spreadsheet") !== -1 ||
    fileType.indexOf("excel") !== -1 ||
    fileType === "text/csv"
  ) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="10" y1="9" x2="10" y2="21"/></svg>';
  } else if (fileType === "application/pdf") {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h2v2H9v-2zM13 15h2v2h-2v-2z"/></svg>';
  } else if (fileType.indexOf("image") !== -1) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
  } else if (fileType.indexOf("word") !== -1) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
};

ERM.riskRegister.formatFileSize = function (bytes) {
  if (bytes === 0) return "0 Bytes";
  var k = 1024;
  var sizes = ["Bytes", "KB", "MB", "GB"];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

/* ========================================
   INLINE CONTROL SELECTOR (in Section 1)
   ======================================== */
ERM.riskRegister.buildInlineControlSelector = function (riskId) {
  var controls = ERM.storage.get("controls") || [];
  var risk = null;

  if (riskId) {
    var risks = ERM.storage.get("risks") || [];
    for (var i = 0; i < risks.length; i++) {
      if (risks[i].id === riskId) {
        risk = risks[i];
        break;
      }
    }
  }

  var linkedControls = (risk && risk.linkedControls) || [];

  if (controls.length === 0) {
    return '<p class="text-muted inline-control-empty">No controls yet. Create your first control below.</p>';
  }

  // Score and sort controls using intelligent matcher if risk has details
  var scoredControls = [];
  if (risk && (risk.title || risk.description)) {
    for (var j = 0; j < controls.length; j++) {
      var ctrl = controls[j];
      var matchResult = window.ERM.riskControlMatcher.scoreControlForRisk(ctrl, risk);
      scoredControls.push({
        control: ctrl,
        score: matchResult.score,
        reasons: matchResult.reasons,
        matchedKeywords: matchResult.matchedKeywords,
        isRecommended: matchResult.isRecommended
      });
    }

    // Sort by score descending (AI recommended first)
    scoredControls.sort(function(a, b) {
      return b.score - a.score;
    });
  } else {
    // No risk details - show controls without scoring
    for (var k = 0; k < controls.length; k++) {
      scoredControls.push({
        control: controls[k],
        score: 0,
        reasons: [],
        isRecommended: false
      });
    }
  }

  // Build HTML with AI recommended badges
  var html = '<div class="inline-control-selector">';
  for (var m = 0; m < scoredControls.length; m++) {
    var scoredCtrl = scoredControls[m];
    var ctrl = scoredCtrl.control;
    var isLinked = linkedControls.indexOf(ctrl.id) !== -1;
    var typeClass = ctrl.type ? " control-type-" + ctrl.type.toLowerCase() : "";

    // Build tooltip data
    var tooltipData = {
      effectiveness: ctrl.effectiveness || "not-tested",
      type: ctrl.type || "directive",
      frequency: ctrl.frequency || "periodic",
      owner: ctrl.owner || "Not assigned"
    };

    html +=
      '<label class="inline-control-item' +
      (isLinked ? " selected" : "") +
      (scoredCtrl.isRecommended ? " ai-recommended" : "") +
      '" data-control-tooltip=\'' + JSON.stringify(tooltipData) + '\'>' +
      '<input type="checkbox" class="control-checkbox" data-control-id="' +
      ctrl.id +
      '"' +
      (isLinked ? " checked" : "") +
      ">" +
      '<span class="inline-control-name">' +
      ERM.utils.escapeHtml(ctrl.name);

    // Add AI recommended badge with score
    if (scoredCtrl.isRecommended) {
      // TODO: Review tooltip logic - currently using simple tooltip
      var tooltipText = "AI Match " + scoredCtrl.score + "%";
      html +=
        ' <span class="ai-match-badge" title="' + ERM.utils.escapeHtml(tooltipText) + '">' +
        this.icons.sparkles +
        ' ' + scoredCtrl.score + '%</span>';
    }

    html += "</span>";

    // Control type badge
    if (ctrl.type) {
      html +=
        '<span class="inline-control-type' + typeClass + '">' +
        ctrl.type +
        "</span>";
    }

    // Add tooltip
    html +=
      '<div class="control-hover-tooltip">' +
      '<div class="tooltip-row"><strong>Effectiveness:</strong> ' + ERM.utils.escapeHtml(tooltipData.effectiveness) + '</div>' +
      '<div class="tooltip-row"><strong>Type:</strong> ' + ERM.utils.escapeHtml(tooltipData.type) + '</div>' +
      '<div class="tooltip-row"><strong>Frequency:</strong> ' + ERM.utils.escapeHtml(tooltipData.frequency) + '</div>' +
      '<div class="tooltip-row"><strong>Owner:</strong> ' + ERM.utils.escapeHtml(tooltipData.owner) + '</div>' +
      '</div>';

    html += "</label>";
  }
  html += "</div>";

  return html;
};

/* ========================================
   CONTROL SELECTOR (old - kept for reference)
   ======================================== */
ERM.riskRegister.buildControlSelector = function (riskId) {
  var controls = ERM.storage.get("controls") || [];
  var risk = null;

  if (riskId) {
    var risks = ERM.storage.get("risks") || [];
    for (var i = 0; i < risks.length; i++) {
      if (risks[i].id === riskId) {
        risk = risks[i];
        break;
      }
    }
  }

  var linkedControls = (risk && risk.linkedControls) || [];

  if (controls.length === 0) {
    return '<p class="text-muted">No controls available. Create controls in the Control Library first.</p>';
  }

  var html = '<div class="control-selector">';
  for (var j = 0; j < controls.length; j++) {
    var ctrl = controls[j];
    var isLinked = linkedControls.indexOf(ctrl.id) !== -1;
    html +=
      '<label class="control-selector-item">' +
      '<input type="checkbox" class="control-checkbox" data-control-id="' +
      ctrl.id +
      '"' +
      (isLinked ? " checked" : "") +
      ">" +
      '<span class="control-selector-content">' +
      '<span class="control-selector-name">' +
      ERM.utils.escapeHtml(ctrl.name) +
      "</span>" +
      '<span class="control-selector-desc">' +
      ERM.utils.escapeHtml(ctrl.description || "") +
      "</span>" +
      "</span>" +
      "</label>";
  }
  html += "</div>";

  return html;
};

/* ========================================
   SAVE RISK
   ======================================== */
ERM.riskRegister.saveRisk = function (riskId) {
  var self = this;

  // Get form values
  var title = document.getElementById("risk-title").value.trim();

  // Category: prefer ID from AI selection, fallback to text input
  var categoryId = document.getElementById("risk-category-id");
  var categoryText = document.getElementById("risk-category");
  var category =
    categoryId && categoryId.value
      ? categoryId.value
      : categoryText
      ? categoryText.value.trim()
      : "";

  var owner = document.getElementById("risk-owner").value.trim();

  if (!title) {
    ERM.toast.error("Please enter a risk title");
    return;
  }

  if (!category) {
    ERM.toast.error("Please enter a risk category");
    return;
  }

  if (!owner) {
    ERM.toast.error("Please enter a risk owner");
    return;
  }

  var inherentLikelihood = parseInt(
    document.getElementById("inherent-likelihood").value,
    10
  );
  var inherentImpact = parseInt(
    document.getElementById("inherent-impact").value,
    10
  );
  var residualLikelihood = parseInt(
    document.getElementById("residual-likelihood").value,
    10
  );
  var residualImpact = parseInt(
    document.getElementById("residual-impact").value,
    10
  );

  var inherentScore = inherentLikelihood * inherentImpact;
  var residualScore = residualLikelihood * residualImpact;

  // Get linked controls
  var linkedControls = [];
  var controlCheckboxes = document.querySelectorAll(
    ".control-checkbox:checked"
  );
  for (var i = 0; i < controlCheckboxes.length; i++) {
    linkedControls.push(controlCheckboxes[i].getAttribute("data-control-id"));
  }

  // Get escalation fields
  var escalationEl = document.getElementById("risk-escalation");
  var escalationLevelEl = document.getElementById("escalation-level");
  var escalationLevelOtherEl = document.getElementById("escalation-level-other");
  var escalationOwnerEl = document.getElementById("escalation-owner");

  var escalation = escalationEl ? escalationEl.value : "No";
  var escalationLevel = escalationLevelEl ? escalationLevelEl.value : "";
  var escalationLevelOther = escalationLevelOtherEl ? escalationLevelOtherEl.value.trim() : "";
  var escalationOwner = escalationOwnerEl ? escalationOwnerEl.value.trim() : "";

  var riskData = {
    title: title,
    category: category,
    description: document.getElementById("risk-description").value.trim(),
    rootCauses: this.getListItems("rootCauses"),
    consequences: this.getListItems("consequences"),
    inherentLikelihood: inherentLikelihood,
    inherentImpact: inherentImpact,
    inherentScore: inherentScore,
    inherentRisk: this.getRiskLevelFromScore(inherentScore),
    residualLikelihood: residualLikelihood,
    residualImpact: residualImpact,
    residualScore: residualScore,
    residualRisk: this.getRiskLevelFromScore(residualScore),
    treatment: document.getElementById("risk-treatment").value,
    actionPlan: this.getListItems("actionPlan"),
    owner: owner,
    actionOwner: document.getElementById("risk-action-owner").value.trim(),
    targetDate: document.getElementById("risk-target-date").value,
    status: document.getElementById("risk-status").value,
    reviewDate: document.getElementById("risk-review-date").value,
    linkedControls: linkedControls,
    attachments: this.getAttachments(),
    escalation: escalation,
    escalationLevel: escalationLevel,
    escalationLevelOther: escalationLevelOther,
    escalationOwner: escalationOwner,
    updatedAt: new Date().toISOString(),
  };

  var risks = ERM.storage.get("risks") || [];
  var registers = ERM.storage.get("registers") || [];

  if (riskId) {
    // Update existing
    for (var j = 0; j < risks.length; j++) {
      if (risks[j].id === riskId) {
        for (var key in riskData) {
          risks[j][key] = riskData[key];
        }
        break;
      }
    }
    ERM.toast.success("Risk updated");
  } else {
    // Create new
    riskData.id = ERM.utils.generateId("risk");
    riskData.registerId = this.state.currentRegister.id;
    riskData.createdAt = new Date().toISOString();
    risks.push(riskData);

    // Update register count
    for (var k = 0; k < registers.length; k++) {
      if (registers[k].id === this.state.currentRegister.id) {
        registers[k].riskCount = (registers[k].riskCount || 0) + 1;
        break;
      }
    }
    ERM.storage.set("registers", registers);
    ERM.toast.success("Risk created");
  }

  ERM.storage.set("risks", risks);

  // Bidirectional sync: Update linked controls' linkedRisks arrays
  var actualRiskId = riskId || riskData.id;
  var controls = ERM.storage.get("controls") || [];
  var controlsUpdated = false;

  for (var c = 0; c < controls.length; c++) {
    var ctrl = controls[c];
    if (!ctrl.linkedRisks) ctrl.linkedRisks = [];

    var isLinkedInRisk = linkedControls.indexOf(ctrl.id) !== -1;
    var riskInControl = ctrl.linkedRisks.indexOf(actualRiskId) !== -1;

    if (isLinkedInRisk && !riskInControl) {
      // Control is linked to this risk but risk not in control's linkedRisks - add it
      ctrl.linkedRisks.push(actualRiskId);
      controlsUpdated = true;
    } else if (!isLinkedInRisk && riskInControl) {
      // Control is not linked to this risk but risk is in control's linkedRisks - remove it
      ctrl.linkedRisks.splice(ctrl.linkedRisks.indexOf(actualRiskId), 1);
      controlsUpdated = true;
    }
  }

  if (controlsUpdated) {
    ERM.storage.set("controls", controls);
  }

  // Log activity
  if (ERM.activityLogger) {
    if (riskId) {
      ERM.activityLogger.log('risk', 'updated', 'risk', riskData.title, {
        riskId: riskId,
        category: riskData.category,
        inherentScore: riskData.inherentScore,
        residualScore: riskData.residualScore
      });
    } else {
      ERM.activityLogger.log('risk', 'created', 'risk', riskData.title, {
        riskId: riskData.id,
        category: riskData.category,
        inherentScore: riskData.inherentScore,
        residualScore: riskData.residualScore,
        registerId: riskData.registerId
      });
    }
  }

  ERM.components.closeModal();
  this.renderRegisterDetail();
};

/* ========================================
   DELETE RISK MODAL
   ======================================== */
ERM.riskRegister.showDeleteRiskModal = function (riskId) {
  var self = this;
  var risks = ERM.storage.get("risks") || [];
  var risk = null;

  for (var i = 0; i < risks.length; i++) {
    if (risks[i].id === riskId) {
      risk = risks[i];
      break;
    }
  }

  if (!risk) return;

  var content =
    '<div class="confirm-delete">' +
    '<div class="confirm-icon danger">' +
    this.icons.alertTriangle +
    "</div>" +
    '<h3>Delete "' +
    ERM.utils.escapeHtml(risk.title) +
    '"?</h3>' +
    "<p>This will permanently delete this risk.</p>" +
    '<p class="text-muted">This action cannot be undone.</p>' +
    "</div>";

  ERM.components.showModal({
    title: "Delete Risk",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Delete", type: "danger", action: "delete" },
    ],
    onAction: function (action) {
      if (action === "delete") {
        self.deleteRisk(riskId);
        ERM.components.closeModal();
      }
    },
  });
};

ERM.riskRegister.deleteRisk = function (riskId) {
  var risks = ERM.storage.get("risks") || [];
  var registers = ERM.storage.get("registers") || [];

  // Find risk title before deleting for activity log
  var riskTitle = 'Unknown Risk';
  for (var j = 0; j < risks.length; j++) {
    if (risks[j].id === riskId) {
      riskTitle = risks[j].title || 'Untitled Risk';
      break;
    }
  }

  risks = risks.filter(function (r) {
    return r.id !== riskId;
  });

  // Update register count
  if (this.state.currentRegister) {
    for (var i = 0; i < registers.length; i++) {
      if (registers[i].id === this.state.currentRegister.id) {
        registers[i].riskCount = Math.max(0, (registers[i].riskCount || 0) - 1);
        break;
      }
    }
    ERM.storage.set("registers", registers);
  }

  ERM.storage.set("risks", risks);

  // Bidirectional sync: Remove this risk from all controls' linkedRisks arrays
  var controls = ERM.storage.get("controls") || [];
  var controlsUpdated = false;

  for (var c = 0; c < controls.length; c++) {
    if (controls[c].linkedRisks) {
      var idx = controls[c].linkedRisks.indexOf(riskId);
      if (idx !== -1) {
        controls[c].linkedRisks.splice(idx, 1);
        controlsUpdated = true;
      }
    }
  }

  if (controlsUpdated) {
    ERM.storage.set("controls", controls);
  }

  // Log activity
  if (ERM.activityLogger) {
    ERM.activityLogger.log('risk', 'deleted', 'risk', riskTitle, {
      riskId: riskId
    });
  }

  this.renderRegisterDetail();
  ERM.toast.success("Risk deleted");
};

/* ========================================
   BULK EDIT RISKS MODAL
   ======================================== */
ERM.riskRegister.showBulkEditModal = function (riskIds) {
  var self = this;

  var categoryOptions = '<option value="">Keep existing</option>';
  for (var c = 0; c < this.categories.length; c++) {
    categoryOptions +=
      '<option value="' +
      this.categories[c].value +
      '">' +
      this.categories[c].label +
      "</option>";
  }

  var content =
    '<p class="text-muted">Update ' +
    riskIds.length +
    " selected risks. Leave fields empty to keep existing values.</p>" +
    '<div class="form-group">' +
    '<label class="form-label">Category</label>' +
    '<select class="form-select" id="bulk-category">' +
    categoryOptions +
    "</select>" +
    "</div>" +
    '<div class="form-group">' +
    '<label class="form-label">Status</label>' +
    '<select class="form-select" id="bulk-status">' +
    '<option value="">Keep existing</option>' +
    '<option value="Open">Open</option>' +
    '<option value="In Progress">In Progress</option>' +
    '<option value="Mitigated">Mitigated</option>' +
    '<option value="Closed">Closed</option>' +
    "</select>" +
    "</div>" +
    '<div class="form-group">' +
    '<label class="form-label">Owner</label>' +
    '<input type="text" class="form-input" id="bulk-owner" placeholder="Keep existing">' +
    "</div>";

  ERM.components.showModal({
    title: "Bulk Edit Risks",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      {
        label: "Update " + riskIds.length + " Risks",
        type: "primary",
        action: "update",
      },
    ],
    onAction: function (action) {
      if (action === "update") {
        var category = document.getElementById("bulk-category").value;
        var status = document.getElementById("bulk-status").value;
        var owner = document.getElementById("bulk-owner").value.trim();

        var risks = ERM.storage.get("risks") || [];

        for (var i = 0; i < risks.length; i++) {
          if (riskIds.indexOf(risks[i].id) !== -1) {
            if (category) risks[i].category = category;
            if (status) risks[i].status = status;
            if (owner) risks[i].owner = owner;
            risks[i].updatedAt = new Date().toISOString();
          }
        }

        ERM.storage.set("risks", risks);
        ERM.components.closeModal();
        self.renderRegisterDetail();
        ERM.toast.success(riskIds.length + " risks updated");
      }
    },
  });
};

/* ========================================
   BULK DELETE RISKS MODAL
   ======================================== */
ERM.riskRegister.showBulkDeleteRisksModal = function (riskIds) {
  var self = this;

  var content =
    '<div class="confirm-delete">' +
    '<div class="confirm-icon danger">' +
    this.icons.alertTriangle +
    "</div>" +
    "<h3>Delete " +
    riskIds.length +
    " risks?</h3>" +
    "<p>This will permanently delete the selected risks.</p>" +
    '<p class="text-muted">This action cannot be undone.</p>' +
    "</div>";

  ERM.components.showModal({
    title: "Delete Risks",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Delete All", type: "danger", action: "delete" },
    ],
    onAction: function (action) {
      if (action === "delete") {
        var risks = ERM.storage.get("risks") || [];
        var registers = ERM.storage.get("registers") || [];
        var deleteCount = 0;

        risks = risks.filter(function (r) {
          if (riskIds.indexOf(r.id) !== -1) {
            deleteCount++;
            return false;
          }
          return true;
        });

        // Update register risk count
        if (self.state.currentRegister) {
          for (var j = 0; j < registers.length; j++) {
            if (registers[j].id === self.state.currentRegister.id) {
              registers[j].riskCount = Math.max(
                0,
                (registers[j].riskCount || 0) - deleteCount
              );
              break;
            }
          }
          ERM.storage.set("registers", registers);
        }

        ERM.storage.set("risks", risks);
        ERM.components.closeModal();
        self.renderRegisterDetail();
        ERM.toast.success(deleteCount + " risks deleted");
      }
    },
  });
};

/* ========================================
   EMAIL NOTIFICATIONS UPGRADE MODAL
   ======================================== */
ERM.riskRegister.showEmailUpgradeModal = function () {
  var content =
    '<div class="upgrade-modal-content">' +
    '<div class="upgrade-icon">' +
    '<span class="upgrade-icon-circle">' +
    this.icons.mail +
    "</span>" +
    '<span class="upgrade-badge">PRO</span>' +
    "</div>" +
    '<h3 class="upgrade-title">Email Notifications</h3>' +
    '<p class="upgrade-subtitle">Keep stakeholders aligned with automated reminders</p>' +
    '<ul class="upgrade-features">' +
    '<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Risk owner assignment alerts</span></li>' +
    '<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Target date reminders</span></li>' +
    '<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Scheduled review cycles</span></li>' +
    '<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Overdue action escalations</span></li>' +
    "</ul>" +
    '<div class="upgrade-note">' +
    '<span class="upgrade-note-icon">✨</span>' +
    "<p>Available in <strong>Pro</strong> & <strong>Enterprise</strong> plans</p>" +
    "</div>" +
    "</div>";

  var lockIcon = this.icons && this.icons.lock ? this.icons.lock : '🔒';

  if (
    typeof ERM.components !== "undefined" &&
    ERM.components.showSecondaryModal
  ) {
    ERM.components.showSecondaryModal({
      title: lockIcon + " Pro Feature",
      content: content,
      buttons: [
        { label: "Maybe Later", type: "secondary", action: "close" },
        { label: "Upgrade Now", type: "primary", action: "upgrade" },
      ],
      onAction: function (action) {
        if (action === "upgrade") {
          ERM.components.closeSecondaryModal();
          ERM.toast.info("Taking you to pricing...");
        }
      },
    });
  } else if (
    typeof ERM.components !== "undefined" &&
    ERM.components.showModal
  ) {
    ERM.components.showModal({
      title: lockIcon + " Pro Feature",
      content: content,
      buttons: [
        { label: "Maybe Later", type: "secondary", action: "close" },
        { label: "Upgrade Now", type: "primary", action: "upgrade" },
      ],
      onAction: function (action) {
        if (action === "upgrade") {
          ERM.components.closeModal();
          ERM.toast.info("Taking you to pricing...");
        }
      },
    });
  }
};

/* ========================================
   MULTIPLE OWNERS UPGRADE MODAL
   ======================================== */
ERM.riskRegister.showMultipleOwnersUpgradeModal = function () {
  var content =
    '<div class="upgrade-modal-content">' +
    '<div class="upgrade-icon">' +
    '<span class="upgrade-icon-circle">' +
    this.icons.userPlus +
    "</span>" +
    '<span class="upgrade-badge">TEAM</span>' +
    "</div>" +
    '<h3 class="upgrade-title">Multiple Owners</h3>' +
    '<p class="upgrade-subtitle">Collaborate with shared ownership & accountability</p>' +
    '<ul class="upgrade-features">' +
    '<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Assign multiple risk/control owners</span></li>' +
    '<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Shared responsibility tracking</span></li>' +
    '<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Team notifications & reminders</span></li>' +
    '<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Collaborative workflows</span></li>' +
    "</ul>" +
    '<div class="upgrade-note">' +
    '<span class="upgrade-note-icon">✨</span>' +
    "<p>Available in <strong>Team</strong> & <strong>Enterprise</strong> plans</p>" +
    "</div>" +
    "</div>";

  var lockIcon = this.icons && this.icons.lock ? this.icons.lock : '🔒';

  if (
    typeof ERM.components !== "undefined" &&
    ERM.components.showSecondaryModal
  ) {
    ERM.components.showSecondaryModal({
      title: lockIcon + " Team Feature",
      content: content,
      buttons: [
        { label: "Maybe Later", type: "secondary", action: "close" },
        { label: "Upgrade Now", type: "primary", action: "upgrade" },
      ],
      onAction: function (action) {
        if (action === "upgrade") {
          ERM.components.closeSecondaryModal();
          ERM.toast.info("Taking you to pricing...");
        }
      },
    });
  } else if (
    typeof ERM.components !== "undefined" &&
    ERM.components.showModal
  ) {
    ERM.components.showModal({
      title: lockIcon + " Team Feature",
      content: content,
      buttons: [
        { label: "Maybe Later", type: "secondary", action: "close" },
        { label: "Upgrade Now", type: "primary", action: "upgrade" },
      ],
      onAction: function (action) {
        if (action === "upgrade") {
          ERM.components.closeModal();
          ERM.toast.info("Taking you to pricing...");
        }
      },
    });
  }
};

/* ========================================
   AI CONTROL SUGGESTIONS
   ======================================== */
/**
 * Show AI-generated control suggestions for the risk using DeepSeek
 */
ERM.riskRegister.showAIControlSuggestions = function (riskContext) {
  var self = this;

  // Check AI limit before proceeding
  if (typeof ERM.enforcement !== 'undefined' && ERM.enforcement.canUseAI) {
    var aiCheck = ERM.enforcement.canUseAI();
    if (!aiCheck.allowed && typeof ERM.upgradeModal !== 'undefined') {
      // Show upgrade modal for AI limit
      ERM.upgradeModal.show({
        title: 'AI Limit Reached',
        message: aiCheck.message,
        feature: 'AI Control Suggestions',
        upgradeMessage: aiCheck.upgradeMessage
      });
      return;
    }
  }

  // Validate risk has context
  if (!riskContext.title && !riskContext.category) {
    ERM.toast.warning("Please add a risk title or category first");
    return;
  }

  // Check if AI service is available
  if (typeof ERM.aiService === "undefined" || !ERM.aiService.callAPI) {
    console.log("[Controls AI] AI service not available, falling back to template matching");
    // Fallback to template-based if AI not available
    if (typeof ERM.controlsAI !== "undefined" && ERM.controlsAI.findControlsForRisk) {
      var suggestions = ERM.controlsAI.findControlsForRisk(riskContext);
      if (suggestions && suggestions.length > 0) {
        this.renderControlSuggestions(suggestions, riskContext);
        return;
      }
    }
    this.showCreateControlModal(riskContext.riskId);
    return;
  }

  // Gather full risk context from the form
  var fullContext = this.gatherFullRiskContext(riskContext);

  // Sparkles icon for header
  var sparklesIcon = '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>';

  // Build steps HTML with the same pattern as showThinkingModal
  var aiSteps = [
    { text: "Analyzing risk context", delay: 600 },
    { text: "Reviewing root causes", delay: 700 },
    { text: "Generating tailored controls", delay: 800 },
    { text: "Prioritizing recommendations", delay: 600 }
  ];

  var stepsHtml = "";
  for (var i = 0; i < aiSteps.length; i++) {
    stepsHtml +=
      '<div class="ai-step" data-step="' + i + '">' +
      '<div class="ai-step-icon">' +
      '<svg class="ai-step-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="50" stroke-linecap="round"/></svg>' +
      '<svg class="ai-step-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
      "</div>" +
      '<span class="ai-step-text">' + aiSteps[i].text + "</span>" +
      '<span class="ai-step-dots"><span>.</span><span>.</span><span>.</span></span>' +
      "</div>";
  }

  var thinkingContent =
    '<div class="ai-thinking-container">' +
    '<div class="ai-thinking-header">' +
    '<div class="ai-brain-animation">' +
    '<div class="ai-brain-circle"></div>' +
    '<div class="ai-brain-circle"></div>' +
    '<div class="ai-brain-circle"></div>' +
    sparklesIcon +
    "</div>" +
    "<h3>AI is generating controls</h3>" +
    "</div>" +
    '<div class="ai-steps-container">' +
    stepsHtml +
    "</div>" +
    "</div>";

  ERM.components.showSecondaryModal({
    title: "",
    content: thinkingContent,
    buttons: [],
    onOpen: function() {
      // Style the modal to match ai-thinking-modal pattern
      var modal = document.querySelector(".secondary-overlay .modal");
      var modalHeader = document.querySelector(".secondary-overlay .modal-header");
      var modalBody = document.querySelector(".secondary-overlay .modal-body");
      var modalFooter = document.querySelector(".secondary-overlay .modal-footer");
      var modalContent = document.querySelector(".secondary-overlay .modal-content");

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
    }
  });

  // Animate steps sequentially
  var currentStep = 0;
  function animateStep(stepIndex) {
    if (stepIndex >= aiSteps.length) {
      return; // Animation complete, API callback will handle next
    }

    var stepEl = document.querySelector('.secondary-overlay .ai-step[data-step="' + stepIndex + '"]');
    if (stepEl) {
      stepEl.classList.add("active");

      setTimeout(function() {
        stepEl.classList.remove("active");
        stepEl.classList.add("complete");
        animateStep(stepIndex + 1);
      }, aiSteps[stepIndex].delay);
    } else {
      animateStep(stepIndex + 1);
    }
  }

  // Start animation after brief delay
  setTimeout(function() {
    animateStep(0);
  }, 300);

  // Build the prompt for DeepSeek
  var prompt = this.buildControlGenerationPrompt(fullContext);
  var systemPrompt = this.getControlGenerationSystemPrompt();

  console.log("[Controls AI] Calling DeepSeek for control suggestions...");
  console.log("[Controls AI] Risk context:", fullContext);

  // Call DeepSeek API
  ERM.aiService.callAPI(
    prompt,
    function (response) {
      // Mark all steps as complete when API responds
      var allSteps = document.querySelectorAll('.secondary-overlay .ai-step');
      for (var j = 0; j < allSteps.length; j++) {
        allSteps[j].classList.remove("active");
        allSteps[j].classList.add("complete");
      }

      setTimeout(function() {
        if (response && response.success && response.text) {
          console.log("[Controls AI] DeepSeek response received");
          // Parse the JSON response
          var controls = self.parseControlSuggestionsResponse(response.text);
          if (controls && controls.length > 0) {
            setTimeout(function() {
              self.renderDeepSeekControlSuggestions(controls, riskContext);
            }, 400);
          } else {
            console.log("[Controls AI] Failed to parse controls, showing fallback");
            self.showNoControlSuggestions(riskContext);
          }
        } else {
          console.log("[Controls AI] API call failed:", response ? response.error : "Unknown error");
          self.showNoControlSuggestions(riskContext);
        }
      }, 500);
    },
    {
      systemPrompt: systemPrompt,
      maxTokens: 2000,
      temperature: 0.4
    }
  );
};

/**
 * Gather full risk context from the form
 */
ERM.riskRegister.gatherFullRiskContext = function (riskContext) {
  var context = {
    title: riskContext.title || "",
    category: riskContext.category || "",
    description: riskContext.description || "",
    rootCauses: [],
    consequences: [],
    linkedControls: [],
    inherentLikelihood: null,
    inherentImpact: null,
    industry: localStorage.getItem("ERM_industry") || "mining"
  };

  // Get description from form
  var descEl = document.getElementById("risk-description");
  if (descEl && descEl.value) {
    context.description = descEl.value;
  }

  // Get root causes from list
  var causesList = document.getElementById("root-causes-list");
  if (causesList) {
    var causeItems = causesList.querySelectorAll(".list-item-text");
    for (var i = 0; i < causeItems.length; i++) {
      var text = causeItems[i].textContent.trim();
      if (text) context.rootCauses.push(text);
    }
  }

  // Get consequences from list
  var conseqList = document.getElementById("consequences-list");
  if (conseqList) {
    var conseqItems = conseqList.querySelectorAll(".list-item-text");
    for (var j = 0; j < conseqItems.length; j++) {
      var cText = conseqItems[j].textContent.trim();
      if (cText) context.consequences.push(cText);
    }
  }

  // Get inherent scores
  var likelihoodEl = document.getElementById("inherent-likelihood");
  var impactEl = document.getElementById("inherent-impact");
  if (likelihoodEl && likelihoodEl.value) {
    context.inherentLikelihood = parseInt(likelihoodEl.value, 10);
  }
  if (impactEl && impactEl.value) {
    context.inherentImpact = parseInt(impactEl.value, 10);
  }

  // Get linked controls (if any already linked)
  var controlCheckboxes = document.querySelectorAll('input[name="linked-controls"]:checked');
  for (var k = 0; k < controlCheckboxes.length; k++) {
    var controlId = controlCheckboxes[k].value;
    context.linkedControls.push(controlId);
  }

  return context;
};

/**
 * Get system prompt for control generation
 */
ERM.riskRegister.getControlGenerationSystemPrompt = function () {
  return "You are an expert Enterprise Risk Management (ERM) control designer with deep expertise in:\n" +
    "- ISO 31000 risk management framework\n" +
    "- COSO Internal Control framework\n" +
    "- Industry-specific control requirements\n" +
    "- Preventive, detective, and corrective controls\n\n" +
    "Your role is to suggest specific, actionable controls that directly address the risk based on its context.\n" +
    "Controls should be practical, implementable, and aligned with the organization's industry.\n\n" +
    "CONTROL TYPES:\n" +
    "- Preventive: Stops risk events from occurring (policies, training, access controls)\n" +
    "- Detective: Identifies risk events when they occur (monitoring, audits, reviews)\n" +
    "- Corrective: Reduces impact after risk event occurs (backup, recovery, insurance)\n\n" +
    "Always respond in valid JSON format only. No additional text before or after the JSON.";
};

/**
 * Build prompt for control generation based on risk context
 */
ERM.riskRegister.buildControlGenerationPrompt = function (context) {
  var prompt = "Based on the following risk, suggest 3 specific controls that would effectively mitigate this risk.\n\n";

  prompt += "=== RISK DETAILS ===\n";
  prompt += "Risk Title: " + (context.title || "Not specified") + "\n";
  prompt += "Category: " + (context.category || "Not specified") + "\n";
  prompt += "Industry: " + (context.industry || "General") + "\n";

  if (context.description) {
    prompt += "Description: " + context.description + "\n";
  }

  if (context.rootCauses && context.rootCauses.length > 0) {
    prompt += "\nRoot Causes:\n";
    for (var i = 0; i < context.rootCauses.length; i++) {
      prompt += "- " + context.rootCauses[i] + "\n";
    }
  }

  if (context.consequences && context.consequences.length > 0) {
    prompt += "\nPotential Consequences:\n";
    for (var j = 0; j < context.consequences.length; j++) {
      prompt += "- " + context.consequences[j] + "\n";
    }
  }

  if (context.inherentLikelihood || context.inherentImpact) {
    prompt += "\nRisk Scores:\n";
    if (context.inherentLikelihood) {
      prompt += "- Inherent Likelihood: " + context.inherentLikelihood + "/5\n";
    }
    if (context.inherentImpact) {
      prompt += "- Inherent Impact: " + context.inherentImpact + "/5\n";
    }
  }

  if (context.linkedControls && context.linkedControls.length > 0) {
    prompt += "\nExisting Controls Already Linked: " + context.linkedControls.length + " controls\n";
    prompt += "(Suggest controls that complement or fill gaps not covered by existing controls)\n";
  }

  prompt += "\n=== REQUIRED OUTPUT FORMAT ===\n";
  prompt += "Respond with a JSON array containing exactly 3 control objects. Each control must have:\n";
  prompt += "{\n";
  prompt += '  "name": "Short control name (max 60 chars)",\n';
  prompt += '  "description": "Detailed description of how this control works and why it addresses the risk (2-3 sentences)",\n';
  prompt += '  "type": "preventive" | "detective" | "corrective",\n';
  prompt += '  "category": "policy" | "manual" | "automated" | "physical" | "monitoring",\n';
  prompt += '  "effectiveness": "effective" | "partially-effective" | "needs-improvement",\n';
  prompt += '  "owner": "Suggested role/department to own this control",\n';
  prompt += '  "frequency": "continuous" | "daily" | "weekly" | "monthly" | "quarterly" | "annually",\n';
  prompt += '  "priority": 1 | 2 | 3 (1 = highest priority)\n';
  prompt += "}\n\n";
  prompt += "Ensure controls are:\n";
  prompt += "1. Specific to the risk context provided\n";
  prompt += "2. Practical and implementable\n";
  prompt += "3. Include a mix of control types (at least one preventive)\n";
  prompt += "4. Relevant to the " + (context.industry || "organization's") + " industry\n\n";
  prompt += "Return ONLY the JSON array, no other text.";

  return prompt;
};

/**
 * Parse DeepSeek response for control suggestions
 */
ERM.riskRegister.parseControlSuggestionsResponse = function (responseText) {
  try {
    // Clean up the response - remove markdown code blocks if present
    var cleaned = responseText.trim();
    if (cleaned.indexOf("```json") === 0) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.indexOf("```") === 0) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.lastIndexOf("```") === cleaned.length - 3) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();

    var parsed = JSON.parse(cleaned);

    // Validate it's an array with controls
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.log("[Controls AI] Response is not a valid array");
      return null;
    }

    // Validate each control has required fields
    var validControls = [];
    for (var i = 0; i < parsed.length; i++) {
      var ctrl = parsed[i];
      if (ctrl.name && ctrl.description && ctrl.type) {
        // Add defaults for missing fields
        validControls.push({
          id: "ai-ctrl-" + Date.now() + "-" + i,
          name: ctrl.name,
          description: ctrl.description,
          type: ctrl.type || "preventive",
          category: ctrl.category || "manual",
          effectiveness: ctrl.effectiveness || "effective",
          owner: ctrl.owner || "Risk Owner",
          frequency: ctrl.frequency || "continuous",
          priority: ctrl.priority || (i + 1),
          source: "deepseek"
        });
      }
    }

    console.log("[Controls AI] Parsed " + validControls.length + " valid controls");
    return validControls;
  } catch (e) {
    console.error("[Controls AI] Failed to parse response:", e);
    console.log("[Controls AI] Raw response:", responseText);
    return null;
  }
};

/**
 * Render DeepSeek-generated control suggestions
 * Uses same styling as template-based renderControlSuggestions
 */
ERM.riskRegister.renderDeepSeekControlSuggestions = function (controls, riskContext) {
  var self = this;

  // Store for "Generate More"
  this.allControlSuggestions = controls;
  this.shownControlSuggestions = controls.slice(0, 3);
  this.currentRiskContext = riskContext;

  var content = '<div class="ai-suggestions-container">';
  content += '<p class="ai-suggestions-intro">Based on your risk, AI recommends starting with:</p>';
  content += '<div class="control-suggestions-list ai-stagger-container">';

  // Recommended control (first one)
  var recCtrl = controls[0];
  var recName = recCtrl.name || "Control";
  var recDesc = recCtrl.description || "";
  var recType = recCtrl.type || "";
  var recCategory = recCtrl.category || "";

  content += '<div class="control-suggestion-card ai-recommended ai-stagger-item" style="animation-delay: 0.1s">';
  content += '<div class="control-suggestion-header">';
  content += '<span class="ai-recommended-badge">⭐ AI Recommends</span>';
  content += '<h4 class="control-suggestion-name">' + ERM.utils.escapeHtml(recName) + '</h4>';
  content += '</div>';
  content += '<p class="control-suggestion-desc">' + ERM.utils.escapeHtml(recDesc.substring(0, 150)) + (recDesc.length > 150 ? '...' : '') + '</p>';
  content += '<div class="control-suggestion-meta">';
  if (recType) content += '<span class="control-meta-badge">' + ERM.utils.escapeHtml(recType) + '</span>';
  if (recCategory) content += '<span class="control-meta-badge">' + ERM.utils.escapeHtml(recCategory) + '</span>';
  if (recCtrl.owner) content += '<span class="control-meta-badge">👤 ' + ERM.utils.escapeHtml(recCtrl.owner) + '</span>';
  content += '</div>';
  content += '<div class="control-suggestion-actions">';
  content += '<button type="button" class="btn btn-primary btn-use-control" data-control-index="0">Use This Control</button>';
  content += '</div>';
  content += '</div>';

  // Other suggestions
  var others = controls.slice(1, 3);
  for (var i = 0; i < others.length; i++) {
    var ctrl = others[i];
    var name = ctrl.name || "Control";
    var desc = ctrl.description || "";
    var delay = (i + 2) * 0.12;

    content += '<div class="control-suggestion-card ai-stagger-item" style="animation-delay: ' + delay + 's">';
    content += '<h4 class="control-suggestion-name">' + ERM.utils.escapeHtml(name) + '</h4>';
    content += '<p class="control-suggestion-desc">' + ERM.utils.escapeHtml(desc.substring(0, 100)) + (desc.length > 100 ? '...' : '') + '</p>';
    content += '<div class="control-suggestion-meta">';
    if (ctrl.type) content += '<span class="control-meta-badge">' + ERM.utils.escapeHtml(ctrl.type) + '</span>';
    if (ctrl.category) content += '<span class="control-meta-badge">' + ERM.utils.escapeHtml(ctrl.category) + '</span>';
    content += '</div>';
    content += '<div class="control-suggestion-actions">';
    content += '<button type="button" class="btn btn-secondary btn-use-control" data-control-index="' + (i + 1) + '">Use This</button>';
    content += '</div>';
    content += '</div>';
  }

  content += '</div>'; // End list

  // Generate More button
  content += '<button type="button" class="btn btn-ai-discover" id="btn-more-controls">✨ Generate More</button>';

  // Fallback options
  content += '<hr class="ai-divider">';
  content += '<p class="ai-fallback-text">Don\'t see what you need?</p>';
  content += '<div class="ai-fallback-buttons">';
  content += '<button type="button" class="btn btn-ghost" id="btn-describe-ai">✨ Describe with AI</button>';
  content += '<button type="button" class="btn btn-ghost" id="btn-manual-entry">Manual Entry</button>';
  content += '</div>';

  content += '</div>';

  ERM.components.showSecondaryModal({
    title: "✨ AI Control Suggestions",
    content: content,
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      // Bind "Use This Control" buttons
      var useBtns = document.querySelectorAll(".btn-use-control");
      for (var j = 0; j < useBtns.length; j++) {
        useBtns[j].addEventListener("click", function () {
          var index = parseInt(this.getAttribute("data-control-index"), 10);
          var selectedControl = self.shownControlSuggestions[index];
          if (selectedControl) {
            self.createControlFromAISuggestion(selectedControl, riskContext);
          }
        });
      }

      // Bind "Generate More" button
      var moreBtn = document.getElementById("btn-more-controls");
      if (moreBtn) {
        moreBtn.addEventListener("click", function () {
          ERM.components.closeSecondaryModal();
          setTimeout(function () {
            self.showAIControlSuggestions(riskContext);
          }, 300);
        });
      }

      // Bind "Describe with AI" button
      var describeBtn = document.getElementById("btn-describe-ai");
      if (describeBtn) {
        describeBtn.addEventListener("click", function () {
          ERM.components.closeSecondaryModal();
          setTimeout(function () {
            self.aiGenerateControlFromRisk(riskContext.title, riskContext.riskId);
          }, 250);
        });
      }

      // Bind "Manual Entry" button
      var manualBtn = document.getElementById("btn-manual-entry");
      if (manualBtn) {
        manualBtn.addEventListener("click", function () {
          ERM.components.closeSecondaryModal();
          setTimeout(function () {
            self.openManualControlForm(riskContext.riskId);
          }, 250);
        });
      }
    }
  });
};

/**
 * Create control from AI suggestion and link to risk
 * Follows same flow as useAIControl for template-based controls
 */
ERM.riskRegister.createControlFromAISuggestion = function (controlData, riskContext) {
  var self = this;
  var riskId = riskContext.riskId;

  // Get next sequential control number (CTRL-001, CTRL-002, etc.)
  var controlRef = ERM.controls && ERM.controls.getNextControlNumber
    ? ERM.controls.getNextControlNumber()
    : "CTRL-" + String(Date.now()).slice(-6);

  // Create new control matching the structure used by useAIControl
  var newControl = {
    id: controlRef,
    reference: controlRef,
    name: controlData.name || "",
    description: controlData.description || "",
    type: controlData.type || "preventive",
    category: controlData.category || "policy",
    owner: controlData.owner || "",
    effectiveness: controlData.effectiveness || "effective",
    status: "active",
    linkedRisks: riskId ? [riskId] : [],
    lastReviewDate: "",
    nextReviewDate: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "deepseek-ai"
  };

  // Save control to storage
  var controls = ERM.storage.get("controls") || [];
  controls.push(newControl);
  ERM.storage.set("controls", controls);

  console.log("[Controls AI] Created new control from DeepSeek:", newControl);

  // Notify other modules that controls have been updated
  document.dispatchEvent(new CustomEvent("erm:controls-updated"));

  // Close suggestions modal
  ERM.components.closeSecondaryModal();

  // Rebuild the inline control selector to show the new control immediately
  setTimeout(function () {
    // Find the container that holds the inline control selector
    var container = document.querySelector(".inline-control-selector");
    if (container && container.parentElement) {
      // Rebuild the entire selector HTML with the new control included
      var newHtml = self.buildInlineControlSelector(riskId);

      // Replace the old selector with the new one
      var tempDiv = document.createElement("div");
      tempDiv.innerHTML = newHtml;
      var newSelector = tempDiv.firstChild;

      container.parentElement.replaceChild(newSelector, container);

      // Check the newly added control's checkbox and ensure it's visible
      var newCheckbox = newSelector.querySelector('input[data-control-id="' + newControl.id + '"]');
      if (newCheckbox) {
        newCheckbox.checked = true;
        // Also add the selected class to its parent label
        var parentLabel = newCheckbox.closest(".inline-control-item");
        if (parentLabel) {
          parentLabel.classList.add("selected");
        }
        // Trigger change event to ensure any listeners are notified
        newCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Re-bind tooltip events for the new control items (ES5 compatible)
      var tooltipItems = newSelector.querySelectorAll('[data-control-tooltip]');
      for (var t = 0; t < tooltipItems.length; t++) {
        (function(item) {
          item.addEventListener('mouseenter', function(e) {
            if (typeof self.showControlTooltip === 'function') {
              self.showControlTooltip(e, item);
            }
          });
          item.addEventListener('mouseleave', function() {
            if (typeof self.hideControlTooltip === 'function') {
              self.hideControlTooltip();
            }
          });
        })(tooltipItems[t]);
      }
    }

    // Also update the visible linked controls list in the form
    self.linkControlToCurrentRisk(newControl.id, newControl.name);

    ERM.toast.success("Control added and linked to risk");
  }, 100); // Reduced timeout for faster sync
};

/**
 * Link a control to the currently editing risk
 */
ERM.riskRegister.linkControlToCurrentRisk = function (controlId, controlName) {
  // Update the linked controls in the form
  var controlsContainer = document.getElementById("linked-controls-container");
  if (controlsContainer) {
    // Add the control to the linked controls list
    var linkedList = controlsContainer.querySelector(".linked-controls-list");
    if (!linkedList) {
      linkedList = document.createElement("div");
      linkedList.className = "linked-controls-list";
      controlsContainer.appendChild(linkedList);
    }

    // Check if already linked
    var existing = linkedList.querySelector('[data-control-id="' + controlId + '"]');
    if (!existing) {
      var item = document.createElement("div");
      item.className = "linked-control-item";
      item.setAttribute("data-control-id", controlId);
      item.innerHTML =
        '<span class="control-name">' + ERM.utils.escapeHtml(controlName) + '</span>' +
        '<button type="button" class="btn-remove-control" data-control-id="' + controlId + '">×</button>';

      linkedList.appendChild(item);

      // Bind remove button
      var removeBtn = item.querySelector(".btn-remove-control");
      if (removeBtn) {
        removeBtn.addEventListener("click", function () {
          item.remove();
        });
      }
    }
  }

  // Also update any hidden input or state tracking linked controls
  var hiddenInput = document.getElementById("linked-controls-ids");
  if (hiddenInput) {
    var currentIds = hiddenInput.value ? hiddenInput.value.split(",") : [];
    if (currentIds.indexOf(controlId) === -1) {
      currentIds.push(controlId);
      hiddenInput.value = currentIds.join(",");
    }
  }
};

/**
 * No control suggestions found - fallback modal
 */
ERM.riskRegister.showNoControlSuggestions = function (riskContext) {
  var self = this;

  var content =
    '<div class="ai-no-match-container">' +
    '<div class="ai-no-match-icon">🤔</div>' +
    '<h3 class="ai-no-match-title">No AI Suggestions Found</h3>' +
    '<p class="ai-no-match-desc">We couldn\'t find pre-built controls that match this risk. You can describe your control in plain language or create one manually.</p>' +
    "</div>";

  ERM.components.showSecondaryModal({
    title: "Create Control",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      {
        label: "✨ Describe with AI",
        type: "primary",
        action: "describe-ai",
      },
      { label: "Manual Entry", type: "secondary", action: "manual" },
    ],
    onAction: function (action) {
      if (action === "describe-ai") {
        ERM.components.closeSecondaryModal();
        setTimeout(function () {
          self.aiGenerateControlFromRisk(riskContext.title, riskContext.riskId);
        }, 250);
      } else if (action === "manual") {
        ERM.components.closeSecondaryModal();
        setTimeout(function () {
          self.openManualControlForm(riskContext.riskId);
        }, 250);
      }
    },
  });
};

/**
 * Render control suggestions modal
 */
ERM.riskRegister.renderControlSuggestions = function (suggestions, riskContext) {
  var self = this;

  // Take top 3
  var recommended = suggestions[0];
  var others = suggestions.slice(1, 3);
  var hasMore = suggestions.length > 3;

  // Store for "Generate More"
  this.allControlSuggestions = suggestions;
  this.shownControlSuggestions = [recommended].concat(others);
  this.currentRiskContext = riskContext;

  var content = '<div class="ai-suggestions-container">';
  content +=
    '<p class="ai-suggestions-intro">Based on your risk, AI recommends starting with:</p>';
  content += '<div class="control-suggestions-list ai-stagger-container">';

  // Recommended control
  var recCtrl = recommended.control;
  var recName = recCtrl.titles ? recCtrl.titles[0] : recCtrl.name || "Control";
  var recDesc = recCtrl.descriptions
    ? recCtrl.descriptions[0]
    : recCtrl.description || "";
  var recType = recCtrl.type || "";
  var recCategory = recCtrl.category || "";

  content +=
    '<div class="control-suggestion-card ai-recommended ai-stagger-item" style="animation-delay: 0.1s">';
  content += '<div class="control-suggestion-header">';
  content += '<span class="ai-recommended-badge">⭐ AI Recommends</span>';
  content +=
    '<h4 class="control-suggestion-name">' +
    ERM.utils.escapeHtml(recName) +
    "</h4>";
  content += "</div>";
  content +=
    '<p class="control-suggestion-desc">' +
    ERM.utils.escapeHtml(recDesc.substring(0, 150)) +
    (recDesc.length > 150 ? "..." : "") +
    "</p>";
  content += '<div class="control-suggestion-meta">';
  if (recType)
    content +=
      '<span class="control-meta-badge">' +
      ERM.utils.escapeHtml(recType) +
      "</span>";
  if (recCategory)
    content +=
      '<span class="control-meta-badge">' +
      ERM.utils.escapeHtml(recCategory) +
      "</span>";
  content += "</div>";
  content += '<div class="control-suggestion-actions">';
  content +=
    '<button type="button" class="btn btn-primary btn-use-control" data-control-id="' +
    ERM.utils.escapeHtml(recCtrl.id) +
    '">Use This Control</button>';
  content += "</div>";
  content += "</div>";

  // Other suggestions
  for (var i = 0; i < others.length; i++) {
    var ctrl = others[i].control;
    var name = ctrl.titles ? ctrl.titles[0] : ctrl.name || "Control";
    var desc = ctrl.descriptions ? ctrl.descriptions[0] : ctrl.description || "";
    var delay = (i + 2) * 0.12;

    content +=
      '<div class="control-suggestion-card ai-stagger-item" style="animation-delay: ' +
      delay +
      's">';
    content +=
      '<h4 class="control-suggestion-name">' +
      ERM.utils.escapeHtml(name) +
      "</h4>";
    content +=
      '<p class="control-suggestion-desc">' +
      ERM.utils.escapeHtml(desc.substring(0, 100)) +
      (desc.length > 100 ? "..." : "") +
      "</p>";
    content += '<div class="control-suggestion-actions">';
    content +=
      '<button type="button" class="btn btn-secondary btn-use-control" data-control-id="' +
      ERM.utils.escapeHtml(ctrl.id) +
      '">Use This</button>';
    content += "</div>";
    content += "</div>";
  }

  content += "</div>"; // End list

  // Generate More button
  if (hasMore) {
    content +=
      '<button type="button" class="btn btn-ai-discover" id="btn-more-controls">✨ Generate More</button>';
  }

  // Fallback options
  content += '<hr class="ai-divider">';
  content += '<p class="ai-fallback-text">Don\'t see what you need?</p>';
  content += '<div class="ai-fallback-buttons">';
  content +=
    '<button type="button" class="btn btn-ghost" id="btn-describe-ai">✨ Describe with AI</button>';
  content +=
    '<button type="button" class="btn btn-ghost" id="btn-manual-entry">Manual Entry</button>';
  content += "</div>";

  content += "</div>";

  ERM.components.showSecondaryModal({
    title: "✨ AI Control Suggestions",
    content: content,
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      // Bind "Use This Control" buttons
      var useBtns = document.querySelectorAll(".btn-use-control");
      for (var j = 0; j < useBtns.length; j++) {
        useBtns[j].addEventListener("click", function () {
          var controlId = this.getAttribute("data-control-id");
          self.useAIControl(controlId, riskContext.riskId);
        });
      }

      // Bind "Generate More" button
      var moreBtn = document.getElementById("btn-more-controls");
      if (moreBtn) {
        moreBtn.addEventListener("click", function () {
          self.showMoreControlSuggestions();
        });
      }

      // Bind "Describe with AI" button
      var describeBtn = document.getElementById("btn-describe-ai");
      if (describeBtn) {
        describeBtn.addEventListener("click", function () {
          ERM.components.closeSecondaryModal();
          setTimeout(function () {
            self.aiGenerateControlFromRisk(
              riskContext.title,
              riskContext.riskId
            );
          }, 250);
        });
      }

      // Bind "Manual Entry" button
      var manualBtn = document.getElementById("btn-manual-entry");
      if (manualBtn) {
        manualBtn.addEventListener("click", function () {
          ERM.components.closeSecondaryModal();
          setTimeout(function () {
            self.openManualControlForm(riskContext.riskId);
          }, 250);
        });
      }
    },
  });
};

/**
 * Show more control suggestions (reshuffle)
 */
ERM.riskRegister.showMoreControlSuggestions = function () {
  var self = this;
  if (!this.allControlSuggestions || this.allControlSuggestions.length === 0)
    return;

  // Show thinking animation
  var listContainer = document.querySelector(".control-suggestions-list");
  if (!listContainer) return;

  listContainer.innerHTML =
    '<div class="ai-thinking-inline">' +
    '<div class="ai-sparkle-pulse"></div>' +
    '<p>Generating more suggestions...</p>' +
    "</div>";

  setTimeout(function () {
    // Get unshown suggestions
    var shown = self.shownControlSuggestions || [];
    var all = self.allControlSuggestions;
    var remaining = [];

    for (var i = 0; i < all.length; i++) {
      var isShown = false;
      for (var j = 0; j < shown.length; j++) {
        if (all[i].control.id === shown[j].control.id) {
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
      remaining = all.slice();
      // Shuffle
      for (var k = remaining.length - 1; k > 0; k--) {
        var r = Math.floor(Math.random() * (k + 1));
        var temp = remaining[k];
        remaining[k] = remaining[r];
        remaining[r] = temp;
      }
    }

    // Take 3
    var newSuggestions = remaining.slice(0, 3);
    self.shownControlSuggestions = newSuggestions;

    // Render new suggestions
    var html = "";
    for (var m = 0; m < newSuggestions.length; m++) {
      var ctrl = newSuggestions[m].control;
      var name = ctrl.titles ? ctrl.titles[0] : ctrl.name || "Control";
      var desc = ctrl.descriptions
        ? ctrl.descriptions[0]
        : ctrl.description || "";
      var delay = m * 0.12;

      html +=
        '<div class="control-suggestion-card ai-stagger-item" style="animation-delay: ' +
        delay +
        's">';
      html +=
        '<h4 class="control-suggestion-name">' +
        ERM.utils.escapeHtml(name) +
        "</h4>";
      html +=
        '<p class="control-suggestion-desc">' +
        ERM.utils.escapeHtml(desc.substring(0, 100)) +
        (desc.length > 100 ? "..." : "") +
        "</p>";
      html += '<div class="control-suggestion-actions">';
      html +=
        '<button type="button" class="btn btn-secondary btn-use-control" data-control-id="' +
        ERM.utils.escapeHtml(ctrl.id) +
        '">Use This</button>';
      html += "</div>";
      html += "</div>";
    }

    listContainer.innerHTML = html;

    // Rebind use buttons
    var useBtns = listContainer.querySelectorAll(".btn-use-control");
    for (var n = 0; n < useBtns.length; n++) {
      useBtns[n].addEventListener("click", function () {
        var controlId = this.getAttribute("data-control-id");
        self.useAIControl(controlId, self.currentRiskContext.riskId);
      });
    }
  }, 800);
};

/**
 * Use AI-suggested control (open form pre-filled)
 */
ERM.riskRegister.useAIControl = function (controlId, riskId) {
  var self = this;

  // Get industry
  var industry = localStorage.getItem("ERM_industry") || "mining";

  // Find control across all categories
  var controlTemplate = null;
  var categories = [
    "strategic",
    "financial",
    "operational",
    "compliance",
    "technology",
    "hr",
    "hse",
    "reputational",
    "project",
  ];

  if (
    window.ERM_TEMPLATES &&
    window.ERM_TEMPLATES[industry] &&
    window.ERM_TEMPLATES[industry].controls
  ) {
    for (var i = 0; i < categories.length; i++) {
      var cat = categories[i];
      var controls = window.ERM_TEMPLATES[industry].controls[cat];
      if (controls) {
        for (var j = 0; j < controls.length; j++) {
          if (controls[j].id === controlId) {
            controlTemplate = controls[j];
            break;
          }
        }
      }
      if (controlTemplate) break;
    }
  }

  if (!controlTemplate) {
    ERM.toast.error("Control not found");
    return;
  }

  // Get next sequential control number (CTRL-001, CTRL-002, etc.)
  var controlRef = ERM.controls && ERM.controls.getNextControlNumber
    ? ERM.controls.getNextControlNumber()
    : "CTRL-" + String(Date.now()).slice(-6);

  // Create new control from template
  var newControl = {
    id: controlRef,
    reference: controlRef,
    name: controlTemplate.titles
      ? controlTemplate.titles[0]
      : controlTemplate.name || "",
    description: controlTemplate.descriptions
      ? controlTemplate.descriptions[0]
      : controlTemplate.description || "",
    type: controlTemplate.type || "preventive",
    category: controlTemplate.category || "policy",
    owner: controlTemplate.owners && controlTemplate.owners.primary
      ? controlTemplate.owners.primary[0]
      : "",
    effectiveness: controlTemplate.effectiveness || "effective",
    status: controlTemplate.status || "active",
    linkedRisks: riskId ? [riskId] : [],
    lastReviewDate: "",
    nextReviewDate: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save control to storage
  var controls = ERM.storage.get("controls") || [];
  controls.push(newControl);
  ERM.storage.set("controls", controls);

  // Notify other modules that controls have been updated
  document.dispatchEvent(new CustomEvent("erm:controls-updated"));

  // Close suggestions modal
  ERM.components.closeSecondaryModal();

  // Rebuild the inline control selector to show the new control
  setTimeout(function () {
    // Find the container that holds the inline control selector
    var container = document.querySelector(".inline-control-selector");
    if (container && container.parentElement) {
      // Rebuild the entire selector HTML with the new control included
      var newHtml = self.buildInlineControlSelector(riskId);

      // Replace the old selector with the new one
      var tempDiv = document.createElement("div");
      tempDiv.innerHTML = newHtml;
      var newSelector = tempDiv.firstChild;

      container.parentElement.replaceChild(newSelector, container);

      // Check the newly added control's checkbox
      var newCheckbox = newSelector.querySelector('input[data-control-id="' + newControl.id + '"]');
      if (newCheckbox) {
        newCheckbox.checked = true;
        // Also add the selected class to its parent label
        var parentLabel = newCheckbox.closest(".inline-control-item");
        if (parentLabel) {
          parentLabel.classList.add("selected");
        }
      }
    }

    // Also update the visible linked controls list in the form
    self.linkControlToCurrentRisk(newControl.id, newControl.name);

    ERM.toast.success("Control added and linked to risk");
  }, 250);
};

/**
 * Show Create Control Modal (Hybrid: AI Generate vs Manual)
 * Allows user to choose between AI-generated control or manual entry
 */
ERM.riskRegister.showCreateControlModal = function () {
  var self = this;

  // Get current risk context for AI generation
  var riskTitle = document.getElementById("risk-title");
  var riskDescription = document.getElementById("risk-description");
  var riskContext = "";
  var currentRiskId = null;

  // Try to get current risk ID from form
  var riskIdInput = document.getElementById("risk-id");
  if (riskIdInput && riskIdInput.value) {
    currentRiskId = riskIdInput.value;
  }

  if (riskTitle && riskTitle.value) {
    riskContext = riskTitle.value;
    if (riskDescription && riskDescription.value) {
      riskContext += ". " + riskDescription.value;
    }
  }

  // If no context, use placeholder
  if (!riskContext) {
    riskContext = "Create a control for this risk";
  }

  // Match control module design exactly
  var content =
    '<div class="add-risk-choice">' +
    '<p class="choice-intro">How would you like to add a control?</p>' +
    '<div class="choice-cards">' +
    '<div class="choice-card ai-choice" data-choice="ai">' +
    '<div class="choice-card-icon ai-gradient">' +
    ERM.icons.sparkles +
    "</div>" +
    '<div class="choice-card-content">' +
    '<h4 class="choice-card-title">Describe with AI</h4>' +
    '<p class="choice-card-desc">Describe your control in plain language and let AI generate the structured details</p>' +
    "</div>" +
    "</div>" +
    '<div class="choice-card manual-choice" data-choice="manual">' +
    '<div class="choice-card-icon">' +
    ERM.icons.edit +
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
      // Add click handlers to choice cards - match control module pattern
      var cards = document.querySelectorAll(".choice-card");
      for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener("click", function () {
          var choice = this.getAttribute("data-choice");
          ERM.components.closeModal();

          setTimeout(function () {
            if (choice === "ai") {
              // AI Generate - use control AI system with risk context
              self.aiGenerateControlFromRisk(riskContext, currentRiskId);
            } else if (choice === "manual") {
              // Manual - open control form with risk pre-linked
              self.openManualControlForm(currentRiskId);
            }
          }, 250);
        });
      }
    },
  });
};

/**
 * AI Generate Control from Risk Context
 */
ERM.riskRegister.aiGenerateControlFromRisk = function (riskContext, riskId) {
  if (!riskContext || !riskContext.trim()) {
    ERM.toast.warning("Please add a risk title or description first");
    return;
  }

  // Store the risk ID for auto-linking after control is generated
  if (riskId && typeof ERM.controlsAI !== "undefined") {
    ERM.controlsAI.pendingRiskLink = riskId;
  }

  // Use the control AI system with secondary modal (keeps risk form open)
  if (typeof ERM.controlsAI !== "undefined" && ERM.controlsAI.showNaturalLanguageInput) {
    ERM.controlsAI.showNaturalLanguageInput({
      useSecondaryModal: true,
      onSelect: function(control) {
        // After AI generates control, auto-link to this risk
        if (riskId && control) {
          if (!control.linkedRisks) {
            control.linkedRisks = [];
          }
          if (control.linkedRisks.indexOf(riskId) === -1) {
            control.linkedRisks.push(riskId);
          }
        }
      }
    });
  } else {
    ERM.toast.error("Control AI system not available");
  }
};

/**
 * Open Manual Control Form as secondary modal (keeps risk form open)
 */
ERM.riskRegister.openManualControlForm = function (riskId) {
  // Store the risk ID for auto-linking in control form
  if (riskId && typeof ERM.controls !== "undefined") {
    ERM.controls.pendingRiskLink = riskId;
  }

  // Create new control object
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
    linkedRisks: riskId ? [riskId] : []
  };

  // Show control form as secondary modal (third parameter = true keeps risk form open)
  ERM.controls.showControlForm(newControl, false, true);
};

/* ========================================
   AI RISK SCORING
   ======================================== */

/**
 * Handle AI scoring button clicks - redirects to new DeepSeek system
 * This is a legacy fallback - scoring should now go through ERM.riskAI.handleFieldSuggest
 */
ERM.riskRegister.handleAIScoring = function (field) {
  console.log("[AI Scoring] handleAIScoring called - redirecting to riskAI module for field:", field);

  // Redirect to the new DeepSeek-powered scoring in risk-register-ai-ui.js
  if (typeof ERM.riskAI !== "undefined" && ERM.riskAI.handleFieldSuggest) {
    ERM.riskAI.handleFieldSuggest(field);
  } else {
    ERM.toast.error("AI scoring module not available. Please refresh the page.");
  }
};

/**
 * Get linked controls from form checkboxes
 */
ERM.riskRegister.getLinkedControlsFromForm = function () {
  var linkedControls = [];
  var checkboxes = document.querySelectorAll(".inline-control-checkbox:checked");

  for (var i = 0; i < checkboxes.length; i++) {
    var controlId = checkboxes[i].getAttribute("data-control-id");
    if (controlId) {
      var allControls = ERM.storage.get("controls") || [];
      var control = allControls.find(function (c) {
        return c.id === controlId;
      });
      if (control) {
        linkedControls.push(control);
      }
    }
  }

  return linkedControls;
};

/**
 * Apply AI suggested score to form field
 */
ERM.riskRegister.applyAIScore = function (field, score) {
  var fieldMap = {
    inherentLikelihood: "inherent-likelihood",
    inherentImpact: "inherent-impact",
    residualLikelihood: "residual-likelihood",
    residualImpact: "residual-impact",
  };

  var fieldId = fieldMap[field];
  if (fieldId) {
    var select = document.getElementById(fieldId);
    if (select) {
      select.value = score;
      // Trigger change event to update heat map
      var event = new Event("change", { bubbles: true });
      select.dispatchEvent(event);
    }
  }
};

/* ========================================
   GLOBAL EVENT LISTENERS
   ======================================== */

// Listen for controls being updated (from any module)
// This ensures the risk register UI refreshes instantly when controls are created
document.addEventListener('erm:controls-updated', function() {
  console.log('[Risk Register] Controls updated event received, refreshing UI');

  // Find if we're currently in a risk edit modal with an inline control selector
  var inlineSelector = document.querySelector('.inline-control-selector');
  if (inlineSelector && ERM.riskRegister && ERM.riskRegister.state && ERM.riskRegister.state.editingRisk) {
    var riskId = ERM.riskRegister.state.editingRisk.id;

    // Rebuild the inline control selector to show newly created controls
    var newHtml = ERM.riskRegister.buildInlineControlSelector(riskId);
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = newHtml;
    var newSelector = tempDiv.firstChild;

    // Preserve current selections before replacing
    var currentSelections = [];
    var currentCheckboxes = inlineSelector.querySelectorAll('input[type="checkbox"]:checked');
    for (var i = 0; i < currentCheckboxes.length; i++) {
      currentSelections.push(currentCheckboxes[i].getAttribute('data-control-id'));
    }

    // Replace the selector
    if (inlineSelector.parentElement) {
      inlineSelector.parentElement.replaceChild(newSelector, inlineSelector);

      // Restore selections
      for (var j = 0; j < currentSelections.length; j++) {
        var checkbox = newSelector.querySelector('input[data-control-id="' + currentSelections[j] + '"]');
        if (checkbox) {
          checkbox.checked = true;
          var parentLabel = checkbox.closest('.inline-control-item');
          if (parentLabel) {
            parentLabel.classList.add('selected');
          }
        }
      }

      // Re-bind tooltip events
      var tooltipItems = newSelector.querySelectorAll('[data-control-tooltip]');
      for (var t = 0; t < tooltipItems.length; t++) {
        (function(item) {
          item.addEventListener('mouseenter', function(e) {
            if (ERM.riskRegister.showControlTooltip) {
              ERM.riskRegister.showControlTooltip(e, item);
            }
          });
          item.addEventListener('mouseleave', function() {
            if (ERM.riskRegister.hideControlTooltip) {
              ERM.riskRegister.hideControlTooltip();
            }
          });
        })(tooltipItems[t]);
      }

      console.log('[Risk Register] Inline control selector refreshed');
    }
  }
});

/* ========================================
   EXPORTS
   ======================================== */
window.ERM = ERM;
console.log("risk-register-modals.js loaded");

/**
 * Dimeri ERM - Controls Module
 * Control library management with AI capabilities
 *
 * @version 1.0.0
 * ES5 Compatible
 */

/* ========================================
   CONTROLS MODULE
   ======================================== */
ERM.controls = ERM.controls || {};

// Control type definitions
ERM.controls.types = [
  {
    value: "preventive",
    label: "Preventive",
    desc: "Prevents risk from occurring",
  },
  {
    value: "detective",
    label: "Detective",
    desc: "Detects risk when it occurs",
  },
  {
    value: "corrective",
    label: "Corrective",
    desc: "Corrects impact after risk occurs",
  },
  {
    value: "directive",
    label: "Directive",
    desc: "Directs behavior to prevent risk",
  },
];

// Control categories
ERM.controls.categories = [
  { value: "policy", label: "Policy & Procedure" },
  { value: "manual", label: "Manual Control" },
  { value: "automated", label: "Automated/IT Control" },
  { value: "physical", label: "Physical Control" },
  { value: "segregation", label: "Segregation of Duties" },
  { value: "monitoring", label: "Monitoring & Review" },
];

// Effectiveness ratings
ERM.controls.effectivenessRatings = [
  { value: "effective", label: "Effective", color: "#16a34a" },
  {
    value: "partiallyEffective",
    label: "Partially Effective",
    color: "#d97706",
  },
  { value: "ineffective", label: "Ineffective", color: "#dc2626" },
  { value: "notTested", label: "Not Tested", color: "#6b7280" },
];

// Status options
ERM.controls.statusOptions = [
  { value: "active", label: "Active", color: "#16a34a" },
  { value: "inactive", label: "Inactive", color: "#6b7280" },
  { value: "underReview", label: "Under Review", color: "#d97706" },
  { value: "planned", label: "Planned", color: "#3b82f6" },
];

// Current filters
ERM.controls.filters = {
  search: "",
  type: "",
  effectiveness: "",
  status: "",
};

/* ========================================
   DATA OPERATIONS
   ======================================== */

/**
 * Get all controls
 */
ERM.controls.getAll = function () {
  return ERM.storage.get("controls") || [];
};

/**
 * Get control by ID
 */
ERM.controls.getById = function (id) {
  var controls = this.getAll();
  for (var i = 0; i < controls.length; i++) {
    if (controls[i].id === id) return controls[i];
  }
  return null;
};

/**
 * Save control (create or update)
 */
ERM.controls.save = function (control) {
  var controls = this.getAll();
  var existingIndex = -1;
  var isUpdate = false;

  for (var i = 0; i < controls.length; i++) {
    if (controls[i].id === control.id) {
      existingIndex = i;
      break;
    }
  }

  if (existingIndex >= 0) {
    control.updatedAt = new Date().toISOString();
    controls[existingIndex] = control;
    isUpdate = true;
  } else {
    // Use sequential control number for both id and reference (CTRL-001, CTRL-002, etc.)
    var controlRef = this.getNextControlNumber();
    control.id = controlRef;
    control.reference = controlRef;
    control.createdAt = new Date().toISOString();
    control.updatedAt = control.createdAt;
    controls.push(control);
  }

  ERM.storage.set("controls", controls);

  // Notify other modules that controls have been updated
  document.dispatchEvent(new CustomEvent("erm:controls-updated"));

  // Log activity
  if (ERM.activityLogger) {
    if (isUpdate) {
      ERM.activityLogger.log('control', 'updated', 'control', control.name, {
        controlId: control.id,
        reference: control.reference,
        effectiveness: control.effectiveness
      });
    } else {
      ERM.activityLogger.log('control', 'created', 'control', control.name, {
        controlId: control.id,
        reference: control.reference,
        type: control.type,
        category: control.category
      });
    }
  }

  return control;
};

/**
 * Delete control
 */
ERM.controls.delete = function (id) {
  var controls = this.getAll();
  var filtered = [];
  var controlName = 'Unknown Control';

  for (var i = 0; i < controls.length; i++) {
    if (controls[i].id !== id) {
      filtered.push(controls[i]);
    } else {
      controlName = controls[i].name || controls[i].reference || 'Untitled Control';
    }
  }

  ERM.storage.set("controls", filtered);

  // Notify other modules that controls have been updated
  document.dispatchEvent(new CustomEvent("erm:controls-updated"));

  // Bidirectional sync: Remove this control from all risks' linkedControls arrays
  var risks = ERM.storage.get("risks") || [];
  var risksUpdated = false;

  for (var r = 0; r < risks.length; r++) {
    if (risks[r].linkedControls) {
      var idx = risks[r].linkedControls.indexOf(id);
      if (idx !== -1) {
        risks[r].linkedControls.splice(idx, 1);
        risksUpdated = true;
      }
    }
  }

  if (risksUpdated) {
    ERM.storage.set("risks", risks);
  }

  // Log activity
  if (ERM.activityLogger) {
    ERM.activityLogger.log('control', 'deleted', 'control', controlName, {
      controlId: id
    });
  }
};

/**
 * Get controls linked to a specific risk
 */
ERM.controls.getByRiskId = function (riskId) {
  var controls = this.getAll();
  var linked = [];
  for (var i = 0; i < controls.length; i++) {
    if (
      controls[i].linkedRisks &&
      controls[i].linkedRisks.indexOf(riskId) !== -1
    ) {
      linked.push(controls[i]);
    }
  }
  return linked;
};

/**
 * Get next control number (CTRL-001, CTRL-002, etc.)
 */
ERM.controls.getNextControlNumber = function () {
  var controls = this.getAll();
  var maxNum = 0;
  for (var i = 0; i < controls.length; i++) {
    var ref = controls[i].reference || "";
    var match = ref.match(/CTRL-(\d+)/);
    if (match) {
      var num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  var nextNum = maxNum + 1;
  return "CTRL-" + (nextNum < 10 ? "00" : nextNum < 100 ? "0" : "") + nextNum;
};

/* ========================================
   VIEW RENDERING
   ======================================== */

/**
 * Initialize controls view
 */
ERM.controls.init = function () {
  // One-time setup (migrations, repairs) - run only once per session
  if (!ERM.controls._initialized) {
    ERM.controls._initialized = true;
    // Migrate any controls with old random IDs to sequential format
    this.migrateControlIds();
    // Repair bidirectional links between controls and risks
    this.repairBidirectionalLinks();
  }

  var viewContainer = document.getElementById("view-controls");
  if (!viewContainer) return;
  this.render();
};

/**
 * Migrate controls with random/timestamp IDs to sequential CTRL-XXX format
 * This ensures all controls have consistent sequential IDs
 */
ERM.controls.migrateControlIds = function () {
  var controls = ERM.storage.get("controls") || [];
  var needsMigration = false;

  // Check if any controls need migration (have non-sequential IDs)
  for (var i = 0; i < controls.length; i++) {
    var ctrl = controls[i];
    // Check if ID doesn't match CTRL-XXX pattern (3 digits)
    if (!ctrl.id || !ctrl.id.match(/^CTRL-\d{3}$/)) {
      needsMigration = true;
      break;
    }
  }

  if (!needsMigration) return;

  console.log("[Controls] Migrating control IDs to sequential format...");

  // Sort controls by createdAt date to maintain order
  controls.sort(function (a, b) {
    var dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    var dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateA - dateB;
  });

  // Build map of old IDs to new IDs for updating linked risks
  var idMap = {};

  // Reassign sequential IDs
  for (var j = 0; j < controls.length; j++) {
    var control = controls[j];
    var oldId = control.id;
    var newNum = j + 1;
    var newId = "CTRL-" + (newNum < 10 ? "00" : newNum < 100 ? "0" : "") + newNum;

    idMap[oldId] = newId;
    control.id = newId;
    control.reference = newId;
  }

  // Save updated controls
  ERM.storage.set("controls", controls);

  // Update linked control references in risks
  var risks = ERM.storage.get("risks") || [];
  var risksUpdated = false;

  for (var k = 0; k < risks.length; k++) {
    var risk = risks[k];
    if (risk.linkedControls && risk.linkedControls.length > 0) {
      for (var m = 0; m < risk.linkedControls.length; m++) {
        var oldCtrlId = risk.linkedControls[m];
        if (idMap[oldCtrlId]) {
          risk.linkedControls[m] = idMap[oldCtrlId];
          risksUpdated = true;
        }
      }
    }
  }

  if (risksUpdated) {
    ERM.storage.set("risks", risks);
  }

  console.log("[Controls] Migration complete. Updated " + controls.length + " control(s).");
};

/**
 * Repair bidirectional links between controls and risks
 * Ensures control.linkedRisks and risk.linkedControls are in sync
 */
ERM.controls.repairBidirectionalLinks = function () {
  var controls = ERM.storage.get("controls") || [];
  var risks = ERM.storage.get("risks") || [];
  var controlsUpdated = false;
  var risksUpdated = false;

  // First pass: For each risk with linkedControls, ensure control.linkedRisks includes the risk
  for (var r = 0; r < risks.length; r++) {
    var risk = risks[r];
    if (risk.linkedControls && risk.linkedControls.length > 0) {
      for (var lc = 0; lc < risk.linkedControls.length; lc++) {
        var ctrlId = risk.linkedControls[lc];
        // Find the control
        for (var c = 0; c < controls.length; c++) {
          if (controls[c].id === ctrlId) {
            if (!controls[c].linkedRisks) {
              controls[c].linkedRisks = [];
            }
            if (controls[c].linkedRisks.indexOf(risk.id) === -1) {
              controls[c].linkedRisks.push(risk.id);
              controlsUpdated = true;
            }
            break;
          }
        }
      }
    }
  }

  // Second pass: For each control with linkedRisks, ensure risk.linkedControls includes the control
  for (var c2 = 0; c2 < controls.length; c2++) {
    var ctrl = controls[c2];
    if (ctrl.linkedRisks && ctrl.linkedRisks.length > 0) {
      for (var lr = 0; lr < ctrl.linkedRisks.length; lr++) {
        var riskId = ctrl.linkedRisks[lr];
        // Find the risk
        for (var r2 = 0; r2 < risks.length; r2++) {
          if (risks[r2].id === riskId) {
            if (!risks[r2].linkedControls) {
              risks[r2].linkedControls = [];
            }
            if (risks[r2].linkedControls.indexOf(ctrl.id) === -1) {
              risks[r2].linkedControls.push(ctrl.id);
              risksUpdated = true;
            }
            break;
          }
        }
      }
    }
  }

  // Save if updates were made
  if (controlsUpdated) {
    ERM.storage.set("controls", controls);
    console.log("[Controls] Repaired control.linkedRisks arrays");
  }
  if (risksUpdated) {
    ERM.storage.set("risks", risks);
    console.log("[Controls] Repaired risk.linkedControls arrays");
  }
};

/**
 * Render controls view
 */
ERM.controls.render = function () {
  var viewContainer = document.getElementById("view-controls");
  if (!viewContainer) return;

  var controls = this.getAll();
  var filteredControls = this.applyFilters(controls);

  // Plan limit banner (non-dismissible with counter, FREE plan only)
  var bannerHtml = "";
  var plan = ERM.usageTracker ? ERM.usageTracker.getPlan() : 'FREE';
  var status = ERM.enforcement ? ERM.enforcement.getStatus('controls') : null;
  if (plan === 'FREE' && status && status.limit !== -1) {
    bannerHtml =
      '<div class="info-banner" id="controls-free-plan-banner">' +
      '<div class="info-banner-content">' +
      '<span class="info-banner-icon-circle">i</span>' +
      '<span class="info-banner-text">' + status.current + ' of ' + status.limit + ' controls used. <a href="upgrade.html?source=control_limit">Upgrade for unlimited</a></span>' +
      "</div>" +
      "</div>";
  }

  // Only show filter bar and header if there are controls
  var filterBarHtml = controls.length > 0 ? this.renderFilterBar(filteredControls.length, controls.length) : '';

  // Build header HTML - only show if there are controls (matches Risk Register pattern)
  var headerHtml = '';
  if (controls.length > 0) {
    headerHtml =
      '<div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px;">' +
      '<div>' +
      '<h1 class="page-title" style="margin-bottom: 4px;">Controls</h1>' +
      '<p class="page-subtitle" style="margin-bottom: 0;">Manage your control library</p>' +
      "</div>" +
      '<div class="page-header-actions" style="display: flex; gap: 8px;">' +
      '<button class="btn btn-primary" id="add-control-btn">' +
      ERM.icons.plus +
      " Add Control" +
      "</button>" +
      '<button class="btn btn-secondary" id="ai-review-controls-btn" style="gap: 6px;">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
      " Control Review" +
      "</button>" +
      "</div>" +
      "</div>";
  }

  var html =
    bannerHtml +
    headerHtml +
    filterBarHtml +
    '<div class="module-list-wrapper">' +
    this.renderContent(filteredControls) +
    '</div>';

  viewContainer.innerHTML = html;
  this.bindEvents();
  // Always rebind item-level events after render (cards, rows, buttons)
  this.bindItemEvents();
};

/**
 * Render filter bar
 */
ERM.controls.renderFilterBar = function (showing, total) {
  var typeOptions = '<option value="">All Types</option>';
  for (var i = 0; i < this.types.length; i++) {
    var t = this.types[i];
    var selected = this.filters.type === t.value ? " selected" : "";
    typeOptions +=
      '<option value="' +
      t.value +
      '"' +
      selected +
      ">" +
      t.label +
      "</option>";
  }

  var effectivenessOptions = '<option value="">All Effectiveness</option>';
  for (var j = 0; j < this.effectivenessRatings.length; j++) {
    var e = this.effectivenessRatings[j];
    var selected2 = this.filters.effectiveness === e.value ? " selected" : "";
    effectivenessOptions +=
      '<option value="' +
      e.value +
      '"' +
      selected2 +
      ">" +
      e.label +
      "</option>";
  }

  var statusOptions = '<option value="">All Status</option>';
  for (var k = 0; k < this.statusOptions.length; k++) {
    var s = this.statusOptions[k];
    var selected3 = this.filters.status === s.value ? " selected" : "";
    statusOptions +=
      '<option value="' +
      s.value +
      '"' +
      selected3 +
      ">" +
      s.label +
      "</option>";
  }

  // Sort dropdown icon
  var sortIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4"/></svg>';

  return (
    '<div class="filter-bar">' +
    '<div class="filter-bar-left">' +
    '<div class="search-input-wrapper">' +
    ERM.icons.search +
    '<input type="text" class="form-input filter-search" id="control-search" placeholder="Search controls..." value="' +
    ERM.utils.escapeHtml(this.filters.search) +
    '">' +
    "</div>" +
    '<select class="form-select filter-select" id="filter-type">' +
    typeOptions +
    "</select>" +
    '<select class="form-select filter-select" id="filter-effectiveness">' +
    effectivenessOptions +
    "</select>" +
    "</div>" +
    '<div class="filter-bar-right">' +
    '<span class="result-count">' +
    showing +
    " of " +
    total +
    " controls</span>" +
    '<div class="dropdown">' +
    '<button class="btn btn-ghost btn-sm dropdown-toggle" id="controls-sort-dropdown-btn">' +
    sortIcon +
    " Sort" +
    "</button>" +
    '<div class="dropdown-menu" id="controls-sort-dropdown-menu">' +
    '<a href="#" class="dropdown-item active" data-sort="newest">Newest first</a>' +
    '<a href="#" class="dropdown-item" data-sort="oldest">Oldest first</a>' +
    '<a href="#" class="dropdown-item" data-sort="name-asc">Name A-Z</a>' +
    '<a href="#" class="dropdown-item" data-sort="name-desc">Name Z-A</a>' +
    '<a href="#" class="dropdown-item" data-sort="ref-asc">Reference A-Z</a>' +
    '<a href="#" class="dropdown-item" data-sort="ref-desc">Reference Z-A</a>' +
    "</div>" +
    "</div>" +
    '<div class="view-toggle">' +
    '<button class="view-btn" data-view="grid" title="Grid view">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    '<rect x="3" y="3" width="7" height="7"></rect>' +
    '<rect x="14" y="3" width="7" height="7"></rect>' +
    '<rect x="14" y="14" width="7" height="7"></rect>' +
    '<rect x="3" y="14" width="7" height="7"></rect>' +
    '</svg>' +
    '</button>' +
    '<button class="view-btn active" data-view="list" title="List view">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    '<line x1="8" y1="6" x2="21" y2="6"></line>' +
    '<line x1="8" y1="12" x2="21" y2="12"></line>' +
    '<line x1="8" y1="18" x2="21" y2="18"></line>' +
    '<line x1="3" y1="6" x2="3.01" y2="6"></line>' +
    '<line x1="3" y1="12" x2="3.01" y2="12"></line>' +
    '<line x1="3" y1="18" x2="3.01" y2="18"></line>' +
    '</svg>' +
    '</button>' +
    '</div>' +
    "</div>" +
    "</div>"
  );
};

/**
 * Render content area
 */
ERM.controls.renderContent = function (controls) {
  if (controls.length === 0) {
    var allControls = this.getAll();
    if (allControls.length === 0) {
      return (
        '<div class="module-empty-state">' +
        '<div class="empty-illustration">' +
        '<svg width="120" height="120" viewBox="0 0 120 120" fill="none">' +
        '<circle cx="60" cy="60" r="45" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="2"/>' +
        '<path d="M60 25 L60 95 M25 60 L95 60" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="4 4"/>' +
        '<path d="M60 35 C75 35 85 50 85 60 C85 75 70 90 60 90 C50 90 35 75 35 60 C35 50 45 35 60 35" fill="#fef2f2" stroke="#fecaca" stroke-width="2"/>' +
        '<path d="M50 55 L57 65 L72 48" stroke="#c41e3a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
        '</div>' +
        '<h3 class="empty-title">No Controls Yet</h3>' +
        '<p class="empty-description">Create your first control to start building your control library and mitigating risks effectively.</p>' +
        '<button class="btn btn-primary" onclick="ERM.controls.showAddModal()">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>' +
        ' Add Control' +
        '</button>' +
        '</div>'
      );
    } else {
      return (
        '<div class="module-empty-state">' +
        '<div class="empty-illustration">' +
        '<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">' +
        '<circle cx="11" cy="11" r="8"></circle>' +
        '<line x1="21" y1="21" x2="16.65" y2="16.65"></line>' +
        '</svg>' +
        '</div>' +
        '<h3 class="empty-title">No controls found</h3>' +
        '<p class="empty-description">Try adjusting your search or filters</p>' +
        '<button class="btn btn-secondary" id="clear-filters-btn">Clear Filters</button>' +
        '</div>'
      );
    }
  }

  return this.renderTable(controls);
};

/**
 * Render controls table
 */
ERM.controls.renderTable = function (controls) {
  var rows = "";
  var cards = "";
  for (var i = 0; i < controls.length; i++) {
    rows += this.renderTableRow(controls[i]);
    cards += this.renderControlCard(controls[i]);
  }

  // Bulk actions bar (shows when items selected)
  var bulkActionsBarHtml =
    '<div class="bulk-actions-bar" id="controls-bulk-actions">' +
    '<span class="bulk-selected-count" id="controls-selected-count">0 selected</span>' +
    '<div class="bulk-actions-buttons">' +
    '<button class="btn btn-outline btn-sm" id="bulk-duplicate-controls">' +
    ERM.icons.copy +
    " Duplicate</button>" +
    '<button class="btn btn-outline-danger btn-sm" id="bulk-delete-controls">' +
    ERM.icons.trash +
    " Delete</button>" +
    "</div>" +
    "</div>";

  return (
    '<div class="controls-content-wrapper controls-list-view" id="controls-content-container">' +
    bulkActionsBarHtml +
    '<div class="controls-table-container">' +
    '<table class="control-table">' +
    "<thead>" +
    "<tr>" +
    '<th class="checkbox-cell">' +
    '<label class="checkbox-wrapper">' +
    '<input type="checkbox" id="select-all-controls">' +
    '<span class="checkbox-custom"></span>' +
    "</label>" +
    "</th>" +
    '<th>CONTROL ID</th>' +
    "<th>CONTROL NAME</th>" +
    '<th>CONTROL OWNER</th>' +
    '<th>TYPE</th>' +
    '<th>EFFECTIVENESS</th>' +
    '<th class="actions-cell"></th>' +
    "</tr>" +
    "</thead>" +
    "<tbody>" +
    rows +
    "</tbody>" +
    "</table>" +
    "</div>" +
    '<div class="controls-grid-container">' +
    cards +
    "</div>" +
    "</div>"
  );
};

/**
 * Render control card for grid view
 */
ERM.controls.renderControlCard = function (control) {
  // Type badge
  var typeLabel = control.type || "N/A";
  for (var i = 0; i < this.types.length; i++) {
    if (this.types[i].value === control.type) {
      typeLabel = this.types[i].label;
      break;
    }
  }

  // Effectiveness badge
  var effectivenessLabel = "Not Tested";
  var effectivenessColor = "#6b7280";
  for (var j = 0; j < this.effectivenessRatings.length; j++) {
    if (this.effectivenessRatings[j].value === control.effectiveness) {
      effectivenessLabel = this.effectivenessRatings[j].label;
      effectivenessColor = this.effectivenessRatings[j].color;
      break;
    }
  }

  return (
    '<div class="control-card" data-control-id="' + control.id + '">' +
    '<div class="control-card-checkbox" onclick="event.stopPropagation();">' +
    '<label class="checkbox-wrapper">' +
    '<input type="checkbox" class="control-select-checkbox" data-control-id="' + control.id + '">' +
    '<span class="checkbox-custom"></span>' +
    '</label>' +
    '</div>' +
    '<div class="control-card-header">' +
    '<span class="control-card-ref">' + ERM.utils.escapeHtml(control.reference || "N/A") + '</span>' +
    '<span class="control-card-type">' + typeLabel + '</span>' +
    '</div>' +
    '<h4 class="control-card-title">' + ERM.utils.escapeHtml(control.name || "Untitled") + '</h4>' +
    '<p class="control-card-owner">' + ERM.utils.escapeHtml(control.owner || "Unassigned") + '</p>' +
    '<div class="control-card-footer">' +
    '<span class="effectiveness-badge" style="background: ' + effectivenessColor + '20; color: ' + effectivenessColor + '">' +
    effectivenessLabel +
    '</span>' +
    '<div class="control-card-actions">' +
    '<button class="btn-icon edit-control-btn" data-control-id="' + control.id + '" title="Edit">' +
    ERM.icons.edit +
    '</button>' +
    '<button class="btn-icon btn-delete-control delete-control-btn" data-control-id="' + control.id + '" title="Delete">' +
    ERM.icons.trash +
    '</button>' +
    '</div>' +
    '</div>' +
    '</div>'
  );
};

/**
 * Render single table row
 */
ERM.controls.renderTableRow = function (control) {
  // Type badge
  var typeLabel = control.type || "N/A";
  for (var i = 0; i < this.types.length; i++) {
    if (this.types[i].value === control.type) {
      typeLabel = this.types[i].label;
      break;
    }
  }
  var typeBadgeClass = "badge-type-" + (control.type || "default");

  // Category label
  var categoryLabel = control.category || "N/A";
  for (var j = 0; j < this.categories.length; j++) {
    if (this.categories[j].value === control.category) {
      categoryLabel = this.categories[j].label;
      break;
    }
  }

  // Effectiveness badge
  var effectivenessLabel = control.effectiveness || "Not Tested";
  var effectivenessBadgeClass =
    "badge-" + (control.effectiveness || "notTested").toLowerCase();
  for (var k = 0; k < this.effectivenessRatings.length; k++) {
    if (this.effectivenessRatings[k].value === control.effectiveness) {
      effectivenessLabel = this.effectivenessRatings[k].label;
      break;
    }
  }

  // Status badge
  var statusLabel = control.status || "Active";
  var statusBadgeClass =
    "badge-status-" + (control.status || "active").toLowerCase();
  for (var l = 0; l < this.statusOptions.length; l++) {
    if (this.statusOptions[l].value === control.status) {
      statusLabel = this.statusOptions[l].label;
      break;
    }
  }

  // Linked risks count
  var linkedCount = (control.linkedRisks && control.linkedRisks.length) || 0;

  // Handle description (array or string)
  var desc = "";
  if (Array.isArray(control.description)) {
    desc = control.description.join(" ");
  } else {
    desc = control.description || "";
  }

  // Truncate description
  if (desc.length > 80) desc = desc.substring(0, 80) + "...";

  return (
    '<tr class="control-row" data-control-id="' +
    control.id +
    '">' +
    '<td class="checkbox-cell" onclick="event.stopPropagation();">' +
    '<label class="checkbox-wrapper">' +
    '<input type="checkbox" class="control-select-checkbox" data-control-id="' +
    control.id +
    '">' +
    '<span class="checkbox-custom"></span>' +
    "</label>" +
    "</td>" +
    "<td>" +
    ERM.utils.escapeHtml(control.reference || "") +
    "</td>" +
    "<td>" +
    ERM.utils.escapeHtml(control.name || "") +
    "</td>" +
    "<td>" +
    ERM.utils.escapeHtml(control.owner || "-") +
    "</td>" +
    '<td><span class="badge ' +
    typeBadgeClass +
    '">' +
    typeLabel +
    "</span></td>" +
    '<td><span class="badge ' +
    effectivenessBadgeClass +
    '">' +
    effectivenessLabel +
    "</span></td>" +
    "<td>" +
    '<div class="row-actions">' +
    '<button class="btn-icon edit-control-btn" data-control-id="' +
    control.id +
    '" title="Edit">' +
    ERM.icons.edit +
    "</button>" +
    '<button class="btn-icon btn-delete-control delete-control-btn" data-control-id="' +
    control.id +
    '" title="Delete">' +
    ERM.icons.trash +
    "</button>" +
    "</div>" +
    "</td>" +
    "</tr>"
  );
};

/**
 * Apply filters to controls
 */
ERM.controls.applyFilters = function (controls) {
  var self = this;
  var filtered = [];

  for (var i = 0; i < controls.length; i++) {
    var c = controls[i];

    // Search filter
    if (self.filters.search) {
      var searchLower = self.filters.search.toLowerCase();
      var searchMatch =
        (c.name && c.name.toLowerCase().indexOf(searchLower) !== -1) ||
        (c.description &&
          c.description.toLowerCase().indexOf(searchLower) !== -1) ||
        (c.reference &&
          c.reference.toLowerCase().indexOf(searchLower) !== -1) ||
        (c.owner && c.owner.toLowerCase().indexOf(searchLower) !== -1);
      if (!searchMatch) continue;
    }

    // Type filter
    if (self.filters.type && c.type !== self.filters.type) continue;

    // Effectiveness filter
    if (
      self.filters.effectiveness &&
      c.effectiveness !== self.filters.effectiveness
    )
      continue;

    // Status filter
    if (self.filters.status && c.status !== self.filters.status) continue;

    filtered.push(c);
  }

  return filtered;
};

/**
 * Sort controls in the DOM
 */
ERM.controls.sortControls = function (sortBy) {
  var tableBody = document.querySelector(".control-table tbody");
  var gridContainer = document.querySelector(".controls-grid-container");

  if (tableBody) {
    var rows = Array.prototype.slice.call(tableBody.querySelectorAll(".control-row"));

    rows.sort(function (a, b) {
      var aId = a.getAttribute("data-control-id");
      var bId = b.getAttribute("data-control-id");
      var aCtrl = ERM.controls.getById(aId);
      var bCtrl = ERM.controls.getById(bId);

      if (!aCtrl || !bCtrl) return 0;

      switch (sortBy) {
        case "newest":
          return new Date(bCtrl.createdAt || 0) - new Date(aCtrl.createdAt || 0);
        case "oldest":
          return new Date(aCtrl.createdAt || 0) - new Date(bCtrl.createdAt || 0);
        case "name-asc":
          return (aCtrl.name || "").localeCompare(bCtrl.name || "");
        case "name-desc":
          return (bCtrl.name || "").localeCompare(aCtrl.name || "");
        case "ref-asc":
          return (aCtrl.reference || "").localeCompare(bCtrl.reference || "");
        case "ref-desc":
          return (bCtrl.reference || "").localeCompare(aCtrl.reference || "");
        default:
          return 0;
      }
    });

    for (var i = 0; i < rows.length; i++) {
      tableBody.appendChild(rows[i]);
    }
  }

  if (gridContainer) {
    var cards = Array.prototype.slice.call(gridContainer.querySelectorAll(".control-card"));

    cards.sort(function (a, b) {
      var aId = a.getAttribute("data-control-id");
      var bId = b.getAttribute("data-control-id");
      var aCtrl = ERM.controls.getById(aId);
      var bCtrl = ERM.controls.getById(bId);

      if (!aCtrl || !bCtrl) return 0;

      switch (sortBy) {
        case "newest":
          return new Date(bCtrl.createdAt || 0) - new Date(aCtrl.createdAt || 0);
        case "oldest":
          return new Date(aCtrl.createdAt || 0) - new Date(bCtrl.createdAt || 0);
        case "name-asc":
          return (aCtrl.name || "").localeCompare(bCtrl.name || "");
        case "name-desc":
          return (bCtrl.name || "").localeCompare(aCtrl.name || "");
        case "ref-asc":
          return (aCtrl.reference || "").localeCompare(bCtrl.reference || "");
        case "ref-desc":
          return (bCtrl.reference || "").localeCompare(aCtrl.reference || "");
        default:
          return 0;
      }
    });

    for (var j = 0; j < cards.length; j++) {
      gridContainer.appendChild(cards[j]);
    }
  }
};

/**
 * Bind event handlers (guarded - runs once per session)
 */
ERM.controls.bindEvents = function () {
  if (ERM.controls._eventsBound) return;
  ERM.controls._eventsBound = true;

  var self = this;

  // Add control buttons
  var addBtn = document.getElementById("add-control-btn");
  if (addBtn) {
    addBtn.addEventListener("click", function () {
      self.showAddModal();
    });
  }

  // AI Review button
  var aiReviewBtn = document.getElementById("ai-review-controls-btn");
  if (aiReviewBtn) {
    aiReviewBtn.addEventListener("click", function () {
      if (typeof ERM.controlsAI !== "undefined") {
        self.showAIControlsReview();
      } else {
        ERM.toast.error("Controls AI not available");
      }
    });
  }

  // Sort dropdown
  var sortBtn = document.getElementById("controls-sort-dropdown-btn");
  var sortMenu = document.getElementById("controls-sort-dropdown-menu");
  if (sortBtn && sortMenu) {
    sortBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var isShowing = sortMenu.classList.contains("show");

      if (isShowing) {
        sortMenu.classList.remove("show", "dropdown-up");
        sortMenu.style.position = "";
        sortMenu.style.top = "";
        sortMenu.style.bottom = "";
        sortMenu.style.left = "";
        sortMenu.style.right = "";
      } else {
        // Position the menu using fixed positioning
        var rect = sortBtn.getBoundingClientRect();
        sortMenu.style.position = "fixed";
        sortMenu.style.right = (window.innerWidth - rect.right) + "px";
        sortMenu.style.left = "auto";

        // Auto-detect: check if menu would overflow bottom of viewport
        var menuHeight = sortMenu.offsetHeight || 200;
        sortMenu.classList.add("show");
        menuHeight = sortMenu.offsetHeight;

        var spaceBelow = window.innerHeight - rect.bottom - 8;
        var spaceAbove = rect.top - 8;

        if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
          sortMenu.style.top = "auto";
          sortMenu.style.bottom = (window.innerHeight - rect.top + 4) + "px";
          sortMenu.classList.add("dropdown-up");
        } else {
          sortMenu.style.top = (rect.bottom + 4) + "px";
          sortMenu.style.bottom = "auto";
          sortMenu.classList.remove("dropdown-up");
        }
      }
    });

    var sortItems = sortMenu.querySelectorAll(".dropdown-item");
    for (var si = 0; si < sortItems.length; si++) {
      sortItems[si].addEventListener("click", function (e) {
        e.preventDefault();
        var sortBy = this.getAttribute("data-sort");
        // Update active state
        for (var sj = 0; sj < sortItems.length; sj++) {
          sortItems[sj].classList.remove("active");
        }
        this.classList.add("active");
        sortMenu.classList.remove("show", "dropdown-up");
        sortMenu.style.position = "";
        sortMenu.style.top = "";
        sortMenu.style.bottom = "";
        sortMenu.style.left = "";
        sortMenu.style.right = "";
        self.sortControls(sortBy);
      });
    }
  }

  // Close sort dropdown on outside click
  document.addEventListener("click", function (e) {
    if (!e.target.closest("#controls-sort-dropdown-btn") && !e.target.closest("#controls-sort-dropdown-menu")) {
      if (sortMenu) {
        sortMenu.classList.remove("show", "dropdown-up");
        sortMenu.style.position = "";
        sortMenu.style.top = "";
        sortMenu.style.bottom = "";
        sortMenu.style.left = "";
        sortMenu.style.right = "";
      }
    }
  });

  // Clear filters
  var clearFiltersBtn = document.getElementById("clear-filters-btn");
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", function () {
      self.filters = { search: "", type: "", effectiveness: "", status: "" };
      self.render();
    });
  }

  // Search input with debounce
  var searchInput = document.getElementById("control-search");
  if (searchInput) {
    var debounceTimer;
    searchInput.addEventListener("input", function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        self.filters.search = searchInput.value;
        self.render();
      }, 300);
    });
  }

  // Filter dropdowns
  var filterType = document.getElementById("filter-type");
  if (filterType) {
    filterType.addEventListener("change", function () {
      self.filters.type = this.value;
      self.render();
    });
  }

  var filterEffectiveness = document.getElementById("filter-effectiveness");
  if (filterEffectiveness) {
    filterEffectiveness.addEventListener("change", function () {
      self.filters.effectiveness = this.value;
      self.render();
    });
  }

  var filterStatus = document.getElementById("filter-status");
  if (filterStatus) {
    filterStatus.addEventListener("change", function () {
      self.filters.status = this.value;
      self.render();
    });
  }

  // View toggle (grid/list)
  var viewBtns = document.querySelectorAll(".view-toggle .view-btn");
  for (var vi = 0; vi < viewBtns.length; vi++) {
    viewBtns[vi].addEventListener("click", function () {
      var view = this.getAttribute("data-view");
      // Update active state
      for (var vj = 0; vj < viewBtns.length; vj++) {
        viewBtns[vj].classList.remove("active");
      }
      this.classList.add("active");
      // Toggle grid/list class on container
      var container = document.getElementById("controls-content-container");
      if (container) {
        container.classList.remove("controls-list-view", "controls-grid-view");
        container.classList.add(view === "grid" ? "controls-grid-view" : "controls-list-view");
      }
    });
  }

  // Bind item-level events (runs every render)
  this.bindItemEvents();
};

/**
 * Bind item-level events (runs every render)
 * Separated from bindEvents so these can be rebound when list re-renders
 */
ERM.controls.bindItemEvents = function () {
  var self = this;

  // Add control button (re-rendered each time)
  var addBtn = document.getElementById("add-control-btn");
  if (addBtn) {
    addBtn.addEventListener("click", function () {
      self.showAddModal();
    });
  }

  // AI Review button
  var aiReviewBtn = document.getElementById("ai-review-controls-btn");
  if (aiReviewBtn) {
    aiReviewBtn.addEventListener("click", function () {
      if (typeof ERM.controlsAI !== "undefined") {
        self.showAIControlsReview();
      } else {
        ERM.toast.error("Controls AI not available");
      }
    });
  }

  // Row click to edit (table view)
  var rows = document.querySelectorAll(".control-row");
  for (var i = 0; i < rows.length; i++) {
    rows[i].addEventListener("click", function (e) {
      if (e.target.closest(".row-actions") || e.target.closest(".checkbox-wrapper")) return;
      var controlId = this.getAttribute("data-control-id");
      self.showEditModal(controlId);
    });
  }

  // Card click to edit (grid view)
  var controlCards = document.querySelectorAll(".control-card");
  for (var ci = 0; ci < controlCards.length; ci++) {
    controlCards[ci].addEventListener("click", function (e) {
      if (e.target.closest(".control-card-actions") || e.target.closest(".checkbox-wrapper")) return;
      var controlId = this.getAttribute("data-control-id");
      self.showEditModal(controlId);
    });
  }

  // Edit buttons
  var editBtns = document.querySelectorAll(".edit-control-btn");
  for (var j = 0; j < editBtns.length; j++) {
    editBtns[j].addEventListener("click", function (e) {
      e.stopPropagation();
      var controlId = this.getAttribute("data-control-id");
      self.showEditModal(controlId);
    });
  }

  // Delete buttons
  var deleteBtns = document.querySelectorAll(".delete-control-btn");
  for (var k = 0; k < deleteBtns.length; k++) {
    deleteBtns[k].addEventListener("click", function (e) {
      e.stopPropagation();
      var controlId = this.getAttribute("data-control-id");
      self.confirmDelete(controlId);
    });
  }

  // Checkbox handlers
  this.initControlCheckboxHandlers();
};

/* ========================================
   CONTROL CHECKBOX HANDLERS
   ======================================== */
ERM.controls.initControlCheckboxHandlers = function () {
  var self = this;

  var checkboxes = document.querySelectorAll(".control-select-checkbox");
  for (var j = 0; j < checkboxes.length; j++) {
    checkboxes[j].addEventListener("change", function () {
      // Sync checkbox state between grid and table views
      var controlId = this.getAttribute("data-control-id");
      var isChecked = this.checked;
      var allCheckboxes = document.querySelectorAll('.control-select-checkbox[data-control-id="' + controlId + '"]');
      for (var s = 0; s < allCheckboxes.length; s++) {
        allCheckboxes[s].checked = isChecked;
      }
      // Update card selected state
      var card = document.querySelector('.control-card[data-control-id="' + controlId + '"]');
      if (card) {
        if (isChecked) {
          card.classList.add("selected");
        } else {
          card.classList.remove("selected");
        }
      }
      self.updateControlsBulkActions();
    });
  }

  // Select all checkbox
  var selectAll = document.getElementById("select-all-controls");
  if (selectAll) {
    selectAll.addEventListener("change", function () {
      var cbs = document.querySelectorAll(".control-select-checkbox");
      for (var s = 0; s < cbs.length; s++) {
        cbs[s].checked = this.checked;
        // Update card selected state
        var controlId = cbs[s].getAttribute("data-control-id");
        var card = document.querySelector('.control-card[data-control-id="' + controlId + '"]');
        if (card) {
          if (this.checked) {
            card.classList.add("selected");
          } else {
            card.classList.remove("selected");
          }
        }
      }
      self.updateControlsBulkActions();
    });
  }

  // Bulk action buttons
  var bulkDuplicateBtn = document.getElementById("bulk-duplicate-controls");
  if (bulkDuplicateBtn) {
    bulkDuplicateBtn.addEventListener("click", function () {
      var ids = self.getSelectedControlIds();
      if (ids.length > 0) {
        self.duplicateControls(ids);
      }
    });
  }

  var bulkDeleteBtn = document.getElementById("bulk-delete-controls");
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener("click", function () {
      var ids = self.getSelectedControlIds();
      if (ids.length > 0) {
        self.confirmBulkDelete(ids);
      }
    });
  }
};

ERM.controls.updateControlsBulkActions = function () {
  var checkboxes = document.querySelectorAll(".control-select-checkbox");
  var checkedCount = 0;
  var visibleCount = 0;
  var countedIds = {};

  // Count unique control IDs (since we have checkboxes in both grid and table)
  for (var i = 0; i < checkboxes.length; i++) {
    var controlId = checkboxes[i].getAttribute("data-control-id");
    if (countedIds[controlId]) continue;
    countedIds[controlId] = true;

    var card = document.querySelector('.control-card[data-control-id="' + controlId + '"]');
    var row = document.querySelector('.control-row[data-control-id="' + controlId + '"]');
    var isVisible = (card && card.style.display !== "none") || (row && row.style.display !== "none");

    if (isVisible) {
      visibleCount++;
      if (checkboxes[i].checked) checkedCount++;
    }
  }

  var bulkActions = document.getElementById("controls-bulk-actions");
  var selectedCount = document.getElementById("controls-selected-count");

  if (bulkActions) {
    bulkActions.style.display = checkedCount > 0 ? "flex" : "none";
  }

  if (selectedCount) {
    selectedCount.textContent = checkedCount + " selected";
  }
};

ERM.controls.getSelectedControlIds = function () {
  var checkboxes = document.querySelectorAll(".control-select-checkbox:checked");
  var ids = [];
  var seenIds = {};
  for (var i = 0; i < checkboxes.length; i++) {
    var id = checkboxes[i].getAttribute("data-control-id");
    if (!seenIds[id]) {
      ids.push(id);
      seenIds[id] = true;
    }
  }
  return ids;
};

/**
 * Duplicate multiple controls
 */
ERM.controls.duplicateControls = function (controlIds) {
  var self = this;
  var controls = ERM.storage.get("controls") || [];
  var count = 0;

  for (var i = 0; i < controlIds.length; i++) {
    for (var j = 0; j < controls.length; j++) {
      if (controls[j].id === controlIds[i]) {
        var newControl = JSON.parse(JSON.stringify(controls[j]));
        // Get next sequential control number (CTRL-001, CTRL-002, etc.)
        var controlRef = self.getNextControlNumber();
        newControl.id = controlRef;
        newControl.name = newControl.name + " (copy)";
        newControl.reference = controlRef;
        newControl.createdAt = new Date().toISOString();
        newControl.updatedAt = new Date().toISOString();
        controls.push(newControl);
        count++;
        break;
      }
    }
  }

  if (count > 0) {
    ERM.storage.set("controls", controls);
    self.render();
    ERM.toast.success(count + " control(s) duplicated");
  }
};

ERM.controls.confirmBulkDelete = function (controlIds) {
  var self = this;
  var count = controlIds.length;

  var content =
    '<div class="confirm-delete">' +
    '<div class="confirm-icon danger">' +
    ERM.icons.alertTriangle +
    "</div>" +
    "<h3>Delete " + count + " control" + (count > 1 ? "s" : "") + "?</h3>" +
    "<p>This will permanently delete the selected control" + (count > 1 ? "s" : "") + ".</p>" +
    '<p class="text-muted">This action cannot be undone.</p>' +
    "</div>";

  ERM.components.showModal({
    title: "Delete Controls",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Delete All", type: "danger", action: "delete" },
    ],
    onAction: function (action) {
      if (action === "delete") {
        for (var i = 0; i < controlIds.length; i++) {
          self.delete(controlIds[i]);
        }
        ERM.components.closeModal();
        ERM.toast.success(count + " control" + (count > 1 ? "s" : "") + " deleted successfully");
        self.render();
      }
    },
  });
};

/* ========================================
   MODAL OPERATIONS
   ======================================== */

/**
 * Show add control modal with creation mode selection
 * Matches risk register pattern: Manual Entry vs Describe with AI
 */
ERM.controls.showAddModal = function () {
  var self = this;

  // Check plan limits before allowing control creation
  console.log("[Controls] showAddModal called");
  console.log("[Controls] ERM.enforcement exists:", typeof ERM.enforcement !== "undefined");

  if (typeof ERM.enforcement !== "undefined" && ERM.enforcement.validateCreate) {
    console.log("[Controls] Calling validateCreate('control')...");
    var canCreate = ERM.enforcement.validateCreate("control");
    console.log("[Controls] validateCreate returned:", canCreate);
    if (!canCreate) {
      console.log("[Controls] BLOCKED - should show upgrade modal");
      return; // Blocked by plan limit - upgrade modal shown by enforcement
    }
  }

  // Check if ERM.components is available
  if (typeof ERM.components === "undefined" || !ERM.components.showModal) {
    console.error("ERM.components not available");
    // Fallback to manual entry
    this.showManualEntryForm();
    return;
  }

  // Show creation mode selection modal - EXACTLY matching risk register pattern
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
                    feature: 'AI Control Description',
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
              self.showAIDescriptionFlow();
            } else {
              self.showManualEntryForm();
            }
          }, 250);
        });
      }
    },
  });
};

/**
 * Show manual entry form (direct to control form)
 */
ERM.controls.showManualEntryForm = function () {
  var newControl = {
    reference: this.getNextControlNumber(),
    name: "",
    description: [],  // Changed to array for list-input structure
    describeRisk: "",
    type: "",
    category: "",
    owner: "",
    effectiveness: "notTested",
    status: "planned",
    lastReviewDate: "",
    nextReviewDate: "",
    linkedRisks: [],
  };

  this.showControlForm(newControl, false);
};

/**
 * Show AI description flow (natural language input)
 */
ERM.controls.showAIDescriptionFlow = function () {
  if (typeof ERM.controlsAI !== "undefined" && ERM.controlsAI.showNaturalLanguageInput) {
    // New AI flow - showNaturalLanguageInput handles everything
    // It will parse the input and call showControlModal with pre-filled data
    ERM.controlsAI.showNaturalLanguageInput();
  } else {
    ERM.toast.error("AI control suggestions not available");
    this.showManualEntryForm();
  }
};

/**
 * Show edit control modal
 */
ERM.controls.showEditModal = function (controlId) {
  var control = this.getById(controlId);
  if (!control) {
    ERM.toast.error("Control not found");
    return;
  }

  this.showControlForm(control, true);
};

/**
 * Show control form modal
 */
/**
 * Show control form (wrapper for external calls from risk register)
 */
ERM.controls.showForm = function () {
  var newControl = {
    id: null,
    reference: "",
    name: "",
    description: "",
    describeRisk: "",
    type: "",
    category: "",
    owner: "",
    effectiveness: "effective",
    status: "active",
    lastReviewDate: "",
    nextReviewDate: "",
    linkedRisks: [],
    department: "",
    controlCategory: "",
    frequency: "",
  };
  this.showControlForm(newControl, false);
};

/* ========================================
   CONTROL FORM DRAFTS (LOCAL STORAGE)
   ======================================== */
ERM.controls.getControlDraftKey = function (controlId) {
  var registerId =
    ERM.riskRegister && ERM.riskRegister.state && ERM.riskRegister.state.currentRegister
      ? ERM.riskRegister.state.currentRegister.id
      : "all";
  var id = controlId || "new";
  return "erm:controlDraft:" + registerId + ":" + id;
};

ERM.controls.getControlDraft = function (controlId) {
  var key = this.getControlDraftKey(controlId);
  try {
    var raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

ERM.controls.shouldRestoreControlDraft = function (draft, control) {
  if (!draft) return false;
  if (!control || !control.id) return true;
  var draftTime = Date.parse(draft.updatedAt || "") || 0;
  var savedTime = Date.parse(control.updatedAt || control.createdAt || "") || 0;
  return draftTime > savedTime;
};

ERM.controls.applyControlDraft = function (control, draft) {
  if (!draft) return control;
  if (draft.hasOwnProperty("name")) control.name = draft.name;
  if (draft.hasOwnProperty("description")) control.description = draft.description;
  if (draft.hasOwnProperty("describeRisk")) control.describeRisk = draft.describeRisk;
  if (draft.hasOwnProperty("type")) control.type = draft.type;
  if (draft.hasOwnProperty("category")) control.category = draft.category;
  if (draft.hasOwnProperty("owner")) control.owner = draft.owner;
  if (draft.hasOwnProperty("frequency")) control.frequency = draft.frequency;
  if (draft.hasOwnProperty("effectiveness")) control.effectiveness = draft.effectiveness;
  if (draft.hasOwnProperty("status")) control.status = draft.status;
  if (draft.hasOwnProperty("lastReviewDate")) control.lastReviewDate = draft.lastReviewDate;
  if (draft.hasOwnProperty("nextReviewDate")) control.nextReviewDate = draft.nextReviewDate;
  if (draft.hasOwnProperty("linkedRisks")) control.linkedRisks = draft.linkedRisks;
  return control;
};

ERM.controls.saveControlDraftFromForm = function (controlId) {
  var form = document.getElementById("control-form");
  if (!form) return;

  var getValue = function (id) {
    var el = document.getElementById(id);
    return el ? el.value : "";
  };

  var descriptions = [];
  var descriptionItems = document.querySelectorAll("#descriptions-list .list-input-item");
  for (var d = 0; d < descriptionItems.length; d++) {
    var text = descriptionItems[d].querySelector(".list-input-text");
    if (text && text.textContent.trim()) {
      descriptions.push(text.textContent.trim());
    }
  }

  var linkedRisks = [];
  var checkboxes = document.querySelectorAll('input[name="linkedRisks"]:checked');
  for (var i = 0; i < checkboxes.length; i++) {
    linkedRisks.push(checkboxes[i].value);
  }

  var draft = {
    updatedAt: new Date().toISOString(),
    name: getValue("control-name"),
    description: descriptions,
    describeRisk: getValue("control-describe-risk"),
    type: getValue("control-type"),
    category: getValue("control-category"),
    owner: getValue("control-owner"),
    frequency: getValue("control-frequency"),
    effectiveness: getValue("control-effectiveness"),
    status: getValue("control-status"),
    lastReviewDate: getValue("control-last-review"),
    nextReviewDate: getValue("control-next-review"),
    linkedRisks: linkedRisks
  };

  try {
    localStorage.setItem(this.getControlDraftKey(controlId), JSON.stringify(draft));
  } catch (e) {}
};

ERM.controls.scheduleControlDraftSave = function (controlId) {
  var self = this;
  if (this._controlDraftTimer) {
    clearTimeout(this._controlDraftTimer);
  }
  this._controlDraftTimer = setTimeout(function () {
    self.saveControlDraftFromForm(controlId);
  }, 150);
};

ERM.controls.clearControlDraft = function (controlId) {
  try {
    localStorage.removeItem(this.getControlDraftKey(controlId));
  } catch (e) {}
};

ERM.controls.setDescriptionItemsFromDraft = function (items) {
  var container = document.getElementById("descriptions-list");
  if (!container) return;
  items = items || [];

  var html = "";
  for (var i = 0; i < items.length; i++) {
    html +=
      '<div class="list-input-item" data-index="' +
      i +
      '">' +
      '<span class="list-input-text">' +
      ERM.utils.escapeHtml(items[i]) +
      "</span>" +
      '<button type="button" class="list-input-remove" data-list="descriptions" data-index="' +
      i +
      '">' +
      ERM.icons.close +
      "</button>" +
      "</div>";
  }

  container.innerHTML = html;
  this.initRemoveListItemHandlers();
};

ERM.controls.applyControlDraftToForm = function (controlId) {
  var draft = this.getControlDraft(controlId);
  if (!draft) return;

  var control = null;
  if (controlId) {
    control = this.getById(controlId);
  }

  if (!this.shouldRestoreControlDraft(draft, control)) {
    return;
  }

  var setValue = function (id, value) {
    var el = document.getElementById(id);
    if (!el || value === undefined || value === null) return false;
    el.value = value;
    return true;
  };

  setValue("control-name", draft.name);
  setValue("control-describe-risk", draft.describeRisk);
  setValue("control-type", draft.type);
  setValue("control-category", draft.category);
  setValue("control-owner", draft.owner);
  setValue("control-frequency", draft.frequency);
  setValue("control-effectiveness", draft.effectiveness);
  setValue("control-status", draft.status);
  setValue("control-last-review", draft.lastReviewDate);
  setValue("control-next-review", draft.nextReviewDate);

  if (draft.description !== undefined) {
    this.setDescriptionItemsFromDraft(draft.description);
  }

  if (draft.linkedRisks && draft.linkedRisks.length > 0) {
    var checkboxes = document.querySelectorAll('input[name="linkedRisks"]');
    for (var i = 0; i < checkboxes.length; i++) {
      var isChecked = draft.linkedRisks.indexOf(checkboxes[i].value) !== -1;
      checkboxes[i].checked = isChecked;
      var label = checkboxes[i].closest(".inline-control-item");
      if (label) {
        if (isChecked) {
          label.classList.add("selected");
        } else {
          label.classList.remove("selected");
        }
      }
    }
  }
};

ERM.controls.showControlForm = function (control, isEdit, useSecondaryModal) {
  var self = this;
  this._editingControlId = control && control.id ? control.id : null;

  var draft = this.getControlDraft(this._editingControlId);
  if (draft && this.shouldRestoreControlDraft(draft, control)) {
    control = this.applyControlDraft(control, draft);
  }

  var title = isEdit ? "Edit Control" : "Add New Control";
  var content = this.buildFormContent(control);

  var modalConfig = {
    title: title,
    content: content,
    size: "lg",
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      {
        label: isEdit ? "Update Control" : "Create Control",
        type: "primary",
        action: "save",
      },
    ],
    onOpen: function () {
      self.bindFormAIEvents();

      // Initialize attachment handlers
      self.initAttachmentHandlers();

      // Check for pending risk link from risk register
      if (self.pendingRiskLink && !isEdit) {
        var riskCheckbox = document.querySelector(
          'input[name="linkedRisks"][value="' + self.pendingRiskLink + '"]'
        );
        if (riskCheckbox) {
          riskCheckbox.checked = true;
          // Clear pending link
          self.pendingRiskLink = null;
        }
      }

      self.applyControlDraftToForm(self._editingControlId);
    },
    onAction: function (action) {
      if (action === "save") {
        self.handleSave(isEdit ? control.id : null);

        // Close the appropriate modal after save completes
        setTimeout(function() {
          if (useSecondaryModal) {
            ERM.components.closeSecondaryModal();
          } else {
            ERM.components.closeModal();
          }
        }, 150);
      }
    },
  };

  // Use secondary modal if requested (keeps risk form open underneath)
  if (useSecondaryModal) {
    ERM.components.showSecondaryModal(modalConfig);
  } else {
    ERM.components.showModal(modalConfig);
  }
};

/**
 * Build form content HTML
 */
ERM.controls.buildFormContent = function (control) {
  // Build description list HTML
  var descriptionHtml = "";
  var descriptions = control.description || [];

  // Handle legacy single description string
  if (typeof descriptions === "string" && descriptions.trim()) {
    descriptions = [descriptions];
  }

  // Ensure descriptions is an array
  if (!Array.isArray(descriptions)) {
    descriptions = [];
  }

  for (var di = 0; di < descriptions.length; di++) {
    descriptionHtml +=
      '<div class="list-input-item" data-index="' +
      di +
      '">' +
      '<span class="list-input-text">' +
      ERM.utils.escapeHtml(descriptions[di]) +
      "</span>" +
      '<button type="button" class="list-input-remove" data-list="descriptions" data-index="' +
      di +
      '">' +
      ERM.icons.close +
      "</button>" +
      "</div>";
  }

  // Build type options
  var typeOptions = '<option value="">Select Type</option>';
  for (var i = 0; i < this.types.length; i++) {
    var t = this.types[i];
    var selected = control.type === t.value ? " selected" : "";
    typeOptions +=
      '<option value="' +
      t.value +
      '"' +
      selected +
      ">" +
      t.label +
      "</option>";
  }

  // Build category options
  var categoryOptions = '<option value="">Select Category</option>';
  for (var j = 0; j < this.categories.length; j++) {
    var c = this.categories[j];
    var selected2 = control.category === c.value ? " selected" : "";
    categoryOptions +=
      '<option value="' +
      c.value +
      '"' +
      selected2 +
      ">" +
      c.label +
      "</option>";
  }

  // Build effectiveness options
  var effectivenessOptions = "";
  for (var k = 0; k < this.effectivenessRatings.length; k++) {
    var e = this.effectivenessRatings[k];
    var selected3 = control.effectiveness === e.value ? " selected" : "";
    effectivenessOptions +=
      '<option value="' +
      e.value +
      '"' +
      selected3 +
      ">" +
      e.label +
      "</option>";
  }

  // Build status options
  var statusOptions = "";
  for (var l = 0; l < this.statusOptions.length; l++) {
    var s = this.statusOptions[l];
    var selected4 = control.status === s.value ? " selected" : "";
    statusOptions +=
      '<option value="' +
      s.value +
      '"' +
      selected4 +
      ">" +
      s.label +
      "</option>";
  }

  // Get available risks for linking from current risk register
  var allRisks = ERM.storage.get("risks") || [];
  var risks = [];

  // Filter to current register if one is active
  if (ERM.riskRegister && ERM.riskRegister.state && ERM.riskRegister.state.currentRegister) {
    var currentRegisterId = ERM.riskRegister.state.currentRegister.id;
    for (var m = 0; m < allRisks.length; m++) {
      if (allRisks[m].registerId === currentRegisterId) {
        risks.push(allRisks[m]);
      }
    }
  } else {
    // No active register - show all risks
    risks = allRisks;
  }

  // Score and sort risks using intelligent matcher if control has details
  var riskCheckboxes = "";
  if (control.name || control.description) {
    var scoredRisks = [];
    for (var n = 0; n < risks.length; n++) {
      var risk = risks[n];
      var matchResult = window.ERM.riskControlMatcher.scoreRiskForControl(risk, control);
      scoredRisks.push({
        risk: risk,
        score: matchResult.score,
        reasons: matchResult.reasons,
        isRecommended: matchResult.isRecommended
      });
    }

    // Sort by score descending (AI recommended first)
    scoredRisks.sort(function(a, b) {
      return b.score - a.score;
    });

    // Calculate top 33% for AI recommendation
    var recommendCount = Math.ceil(scoredRisks.length * 0.33);

    // Build checkboxes with AI recommended badges (matching risk register style)
    riskCheckboxes = '<div class="inline-control-selector">';
    for (var p = 0; p < scoredRisks.length; p++) {
      var scoredRisk = scoredRisks[p];
      var risk = scoredRisk.risk;
      var isTopThird = p < recommendCount && scoredRisk.score >= 50;
      var checked =
        control.linkedRisks && control.linkedRisks.indexOf(risk.id) !== -1
          ? " checked"
          : "";
      var selected = checked ? " selected" : "";

      riskCheckboxes +=
        '<label class="inline-control-item' +
        (isTopThird ? ' ai-recommended' : '') +
        selected + '">' +
        '<input type="checkbox" class="control-checkbox" name="linkedRisks" value="' +
        risk.id +
        '"' +
        checked +
        '>' +
        '<span class="inline-control-name">' +
        ERM.utils.escapeHtml(risk.title);

      // Add AI recommended badge for top 33%
      if (isTopThird) {
        riskCheckboxes +=
          ' <span class="ai-match-badge" title="AI Match ' + scoredRisk.score + '%">' +
          ERM.icons.sparkles +
          ' ' + scoredRisk.score + '%</span>';
      }

      riskCheckboxes += '</span>';

      // Add risk category badge if available
      if (risk.category) {
        var categoryClass = ' risk-category-' + risk.category.toLowerCase();
        riskCheckboxes +=
          '<span class="inline-control-type' + categoryClass + '">' +
          risk.category +
          '</span>';
      }

      riskCheckboxes += '</label>';
    }
    riskCheckboxes += '</div>';
  } else {
    // No control details yet - show risks without scoring
    riskCheckboxes = '<div class="inline-control-selector">';
    for (var q = 0; q < risks.length; q++) {
      var risk = risks[q];
      var checked =
        control.linkedRisks && control.linkedRisks.indexOf(risk.id) !== -1
          ? " checked"
          : "";
      var selected = checked ? " selected" : "";

      riskCheckboxes +=
        '<label class="inline-control-item' + selected + '">' +
        '<input type="checkbox" class="control-checkbox" name="linkedRisks" value="' +
        risk.id +
        '"' +
        checked +
        '>' +
        '<span class="inline-control-name">' +
        ERM.utils.escapeHtml(risk.title) +
        '</span>';

      riskCheckboxes += '</label>';
    }
    riskCheckboxes += '</div>';
  }

  if (risks.length === 0) {
    riskCheckboxes =
      '<p class="form-hint text-muted">No risks available in current register. Create risks first to link controls.</p>';
  }

  // Build attachments list
  var attachmentsHtml = "";
  var attachments = control.attachments || [];
  for (var fi = 0; fi < attachments.length; fi++) {
    var file = attachments[fi];
    var fileIcon = ERM.riskRegister ? ERM.riskRegister.getFileIcon(file.type) : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
    attachmentsHtml +=
      '<div class="attachment-item" data-index="' +
      fi +
      '">' +
      '<div class="attachment-icon">' +
      fileIcon +
      "</div>" +
      '<div class="attachment-info">' +
      '<div class="attachment-name">' +
      ERM.utils.escapeHtml(file.name) +
      "</div>" +
      '<div class="attachment-meta">' +
      ERM.utils.escapeHtml(file.size || "") +
      "</div>" +
      "</div>" +
      '<div class="attachment-actions">' +
      '<button type="button" class="btn-icon attachment-preview" title="Preview">' +
      ERM.icons.eye +
      "</button>" +
      '<button type="button" class="btn-icon attachment-remove" title="Remove">' +
      ERM.icons.trash +
      "</button>" +
      "</div>" +
      '<input type="hidden" class="attachment-data" value=\'' +
      JSON.stringify(file).replace(/'/g, "&apos;") +
      "'>" +
      "</div>";
  }

  return (
    '<form id="control-form" class="control-form">' +
    '<div class="form-section">' +
    '<h4 class="form-section-title">Control Details</h4>' +
    '<div class="form-row form-row-ref-name">' +
    '<div class="form-group">' +
    '<label class="form-label">Reference</label>' +
    '<input type="text" class="form-input" id="control-reference" value="' +
    ERM.utils.escapeHtml(control.reference || "") +
    '" readonly style="background: var(--bg-tertiary);">' +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label required">Control Name</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="name">' +
    ERM.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<input type="text" class="form-input" id="control-name" value="' +
    ERM.utils.escapeHtml(control.name || "") +
    '" placeholder="e.g. Monthly Access Review">' +
    "</div>" +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Control Description</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="description">' +
    ERM.icons.sparkles +
    " Suggest</button>" +
    "</div>" +
    '<div class="list-input-container" id="descriptions-list">' +
    descriptionHtml +
    "</div>" +
    '<div class="list-input-add">' +
    '<input type="text" class="form-input" id="description-input" placeholder="Add description and press Enter...">' +
    '<button type="button" class="btn btn-primary btn-icon add-list-item" data-list="descriptions">' +
    ERM.icons.plus +
    "</button>" +
    "</div>" +
    "</div>" +
    '<div class="form-row">' +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label required">Control Type</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="type">' +
    ERM.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<select class="form-select" id="control-type">' +
    typeOptions +
    "</select>" +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label required">Category</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="category">' +
    ERM.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<select class="form-select" id="control-category">' +
    categoryOptions +
    "</select>" +
    "</div>" +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Control Owner</label>' +
    '<div class="form-label-actions">' +
    '<button type="button" class="btn-notify-upgrade" id="notify-control-owner">' +
    ERM.icons.bell +
    " Notify</button>" +
    '<button type="button" class="btn-notify-upgrade" id="add-control-owner" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-color: #86efac; color: #16a34a;">' +
    ERM.icons.plus +
    " Add</button>" +
    "</div>" +
    "</div>" +
    '<input type="text" class="form-input" id="control-owner" value="' +
    ERM.utils.escapeHtml(control.owner || "") +
    '" placeholder="e.g. IT Security Team">' +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label required">Control Frequency</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="frequency">' +
    ERM.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<select class="form-select" id="control-frequency">' +
    '<option value="">Select Frequency</option>' +
    '<option value="continuous"' +
    (control.frequency === "continuous" ? " selected" : "") +
    ">Continuous</option>" +
    '<option value="daily"' +
    (control.frequency === "daily" ? " selected" : "") +
    ">Daily</option>" +
    '<option value="weekly"' +
    (control.frequency === "weekly" ? " selected" : "") +
    ">Weekly</option>" +
    '<option value="monthly"' +
    (control.frequency === "monthly" ? " selected" : "") +
    ">Monthly</option>" +
    '<option value="quarterly"' +
    (control.frequency === "quarterly" ? " selected" : "") +
    ">Quarterly</option>" +
    '<option value="annually"' +
    (control.frequency === "annually" ? " selected" : "") +
    ">Annually</option>" +
    '<option value="adhoc"' +
    (control.frequency === "adhoc" ? " selected" : "") +
    ">Ad hoc</option>" +
    "</select>" +
    "</div>" +
    "</div>" +
    '<div class="form-section">' +
    '<h4 class="form-section-title">Assessment</h4>' +
    '<div class="form-row">' +
    '<div class="form-group">' +
    '<label class="form-label">Effectiveness</label>' +
    '<select class="form-select" id="control-effectiveness">' +
    effectivenessOptions +
    "</select>" +
    "</div>" +
    '<div class="form-group">' +
    '<label class="form-label">Status</label>' +
    '<select class="form-select" id="control-status">' +
    statusOptions +
    "</select>" +
    "</div>" +
    "</div>" +
    '<div class="form-row">' +
    '<div class="form-group">' +
    '<label class="form-label">Last Review Date</label>' +
    '<input type="date" class="form-input" id="control-last-review" value="' +
    (control.lastReviewDate || "") +
    '">' +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Next Review Date</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="nextReviewDate">' +
    ERM.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<input type="date" class="form-input" id="control-next-review" value="' +
    (control.nextReviewDate || "") +
    '">' +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="form-section">' +
    '<div class="form-label-row">' +
    '<h4 class="form-section-title" style="margin-bottom: 0;">Linked Risks</h4>' +
    '<button type="button" class="btn-ai-suggest" data-field="linkedRisks">' +
    ERM.icons.sparkles +
    " AI</button>" +
    "</div>" +
    riskCheckboxes +
    "</div>" +
    '<div class="form-section">' +
    '<div class="form-label-row">' +
    '<h4 class="form-section-title" style="margin-bottom: 0;">Evidence & Attachments</h4>' +
    '<button type="button" class="btn-ai-suggest" data-field="evidence" title="AI will suggest relevant documents based on control details">' +
    ERM.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<div class="ai-evidence-suggestion" id="ai-control-evidence-suggestion" style="display:none;">' +
    '<div class="ai-evidence-content" id="ai-control-evidence-content"></div>' +
    '</div>' +
    '<div class="attachment-upload-area" id="control-attachment-drop-zone">' +
    '<div class="attachment-upload-icon">' +
    ERM.icons.upload +
    "</div>" +
    '<div class="attachment-upload-text">' +
    '<p>Drop files here or <label for="control-attachment-input" class="attachment-browse-link">browse</label></p>' +
    '<span class="attachment-upload-hint">Excel, PDF, Images, Documents (Max 5MB each)</span>' +
    "</div>" +
    '<input type="file" id="control-attachment-input" multiple accept=".xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx" style="display:none">' +
    "</div>" +
    '<div class="attachment-list" id="control-attachment-list">' +
    attachmentsHtml +
    "</div>" +
    "</div>" +
    '<div class="ai-check-bar">' +
    '<div class="ai-check-content">' +
    '<div class="ai-check-icon">' +
    ERM.icons.sparkles +
    "</div>" +
    '<span class="ai-check-text">AI can help review this control</span>' +
    "</div>" +
    '<div class="ai-check-actions">' +
    '<button type="button" class="btn-ai-review" id="ai-review-control">' +
    ERM.icons.sparkles +
    " Review Control</button>" +
    "</div>" +
    "</div>" +
    "</form>"
  );
};

/**
 * Handle save control
 */
ERM.controls.handleSave = function (existingId) {
  var name = document.getElementById("control-name").value.trim();
  var type = document.getElementById("control-type").value;
  var category = document.getElementById("control-category").value;

  // Validation
  if (!name) {
    ERM.toast.error("Please enter a control name");
    return;
  }
  if (!type) {
    ERM.toast.error("Please select a control type");
    return;
  }
  if (!category) {
    ERM.toast.error("Please select a category");
    return;
  }

  // Gather description sentences
  var descriptions = [];
  var descriptionItems = document.querySelectorAll(
    "#descriptions-list .list-input-item"
  );
  for (var d = 0; d < descriptionItems.length; d++) {
    var text = descriptionItems[d].querySelector(".list-input-text");
    if (text && text.textContent.trim()) {
      descriptions.push(text.textContent.trim());
    }
  }

  // Gather linked risks
  var linkedRisks = [];
  var checkboxes = document.querySelectorAll(
    'input[name="linkedRisks"]:checked'
  );
  for (var i = 0; i < checkboxes.length; i++) {
    linkedRisks.push(checkboxes[i].value);
  }

  // Gather attachments
  var attachments = [];
  var attachmentItems = document.querySelectorAll(
    "#control-attachment-list .attachment-item"
  );
  for (var a = 0; a < attachmentItems.length; a++) {
    var dataInput = attachmentItems[a].querySelector(".attachment-data");
    if (dataInput && dataInput.value) {
      try {
        var fileData = JSON.parse(dataInput.value);
        attachments.push(fileData);
      } catch (e) {
        console.error("Failed to parse attachment data:", e);
      }
    }
  }

  // Get current user (placeholder - would come from auth system)
  var currentUser = "Current User"; // TODO: Get from auth system

  var control = {
    id: existingId || null,
    reference: document.getElementById("control-reference").value,
    name: name,
    description: descriptions,
    describeRisk: document.getElementById("control-describe-risk")
      ? document.getElementById("control-describe-risk").value.trim()
      : "",
    type: type,
    category: category,
    owner: document.getElementById("control-owner").value.trim(),
    frequency: document.getElementById("control-frequency").value,
    effectiveness: document.getElementById("control-effectiveness").value,
    status: document.getElementById("control-status").value,
    lastReviewDate: document.getElementById("control-last-review").value,
    nextReviewDate: document.getElementById("control-next-review").value,
    linkedRisks: linkedRisks,
    attachments: attachments,
    lastUpdatedBy: currentUser,
    lastUpdatedAt: new Date().toISOString()
  };

  var savedControl = this.save(control);

  // Bidirectional sync: Update linked risks' linkedControls arrays
  var actualControlId = savedControl.id;
  var risks = ERM.storage.get("risks") || [];
  var risksUpdated = false;

  for (var r = 0; r < risks.length; r++) {
    var risk = risks[r];
    if (!risk.linkedControls) risk.linkedControls = [];

    var isLinkedInControl = linkedRisks.indexOf(risk.id) !== -1;
    var controlInRisk = risk.linkedControls.indexOf(actualControlId) !== -1;

    if (isLinkedInControl && !controlInRisk) {
      // Risk is linked to this control but control not in risk's linkedControls - add it
      risk.linkedControls.push(actualControlId);
      risksUpdated = true;
    } else if (!isLinkedInControl && controlInRisk) {
      // Risk is not linked to this control but control is in risk's linkedControls - remove it
      risk.linkedControls.splice(risk.linkedControls.indexOf(actualControlId), 1);
      risksUpdated = true;
    }
  }

  if (risksUpdated) {
    ERM.storage.set("risks", risks);
  }

  // Clear drafts on successful save
  this.clearControlDraft(existingId || null);
  if (!existingId && savedControl && savedControl.id) {
    this.clearControlDraft(savedControl.id);
  }

  // Show success message
  ERM.toast.success(
    existingId ? "Control updated successfully" : "Control created successfully"
  );

  // IMPORTANT: Modal closing is handled in showControlForm's onAction
  // DON'T close modals here to avoid closing the wrong modal

  // Only render controls view if we're currently on controls page
  // Don't navigate away if we came from risk form
  var currentHash = window.location.hash;
  if (currentHash && currentHash.indexOf("#controls") === 0) {
    this.render();
  }
};

/**
 * Confirm delete control
 */
ERM.controls.confirmDelete = function (controlId) {
  var self = this;
  var control = this.getById(controlId);
  if (!control) return;

  ERM.components.showModal({
    title: "Delete Control",
    content:
      '<div class="confirm-delete">' +
      "<p>Are you sure you want to delete this control?</p>" +
      '<p class="control-ref-preview">' +
      ERM.utils.escapeHtml(control.reference) +
      " - " +
      ERM.utils.escapeHtml(control.name) +
      "</p>" +
      '<p class="text-muted">This action cannot be undone.</p>' +
      "</div>",
    size: "sm",
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Delete", type: "danger", action: "delete" },
    ],
    onAction: function (action) {
      if (action === "delete") {
        self.delete(controlId);
        ERM.components.closeModal();
        ERM.toast.success("Control deleted");
        self.render();
      }
    },
  });
};

/**
 * Show notify owner popup
 */
ERM.controls.showNotifyOwnerPopup = function (controlId) {
  var control = this.getById(controlId);
  if (!control) return;

  var ownerName = control.owner || "No owner assigned";

  ERM.components.showModal({
    title: ERM.icons.bell + " Notify Owner",
    content:
      '<div class="notify-popup">' +
      '<p>Send notification to <strong>' +
      ERM.utils.escapeHtml(ownerName) +
      "</strong> about this control?</p>" +
      '<p class="control-ref-preview">' +
      ERM.utils.escapeHtml(control.reference) +
      " - " +
      ERM.utils.escapeHtml(control.name) +
      "</p>" +
      '<div class="form-group">' +
      '<label class="form-label">Message (optional)</label>' +
      '<textarea class="form-textarea" id="notify-message" rows="3" placeholder="Add a message..."></textarea>' +
      "</div>" +
      '<div class="upgrade-notice">' +
      '<p class="text-muted" style="margin: 0; font-size: 13px;">' +
      ERM.icons.info +
      ' Notifications require email integration. <a href="upgrade.html?source=notifications" class="upgrade-link">Upgrade to enable</a>.' +
      "</p>" +
      "</div>" +
      "</div>",
    size: "sm",
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Send Notification", type: "primary", action: "notify" },
    ],
    onAction: function (action) {
      if (action === "notify") {
        ERM.components.closeModal();
        ERM.toast.info("Notification feature requires upgrade");
      }
    },
  });
};

/**
 * Show add owner popup
 */
ERM.controls.showAddOwnerPopup = function (controlId) {
  var control = this.getById(controlId);
  if (!control) return;

  ERM.components.showModal({
    title: ERM.icons.userPlus + " Add Owner",
    content:
      '<div class="add-owner-popup">' +
      '<p>Add additional owners to this control:</p>' +
      '<p class="control-ref-preview">' +
      ERM.utils.escapeHtml(control.reference) +
      " - " +
      ERM.utils.escapeHtml(control.name) +
      "</p>" +
      '<p class="text-muted" style="font-size: 13px;">Current owner: <strong>' +
      ERM.utils.escapeHtml(control.owner || "None") +
      "</strong></p>" +
      '<div class="form-group">' +
      '<label class="form-label">Additional Owner</label>' +
      '<input type="text" class="form-input" id="additional-owner" placeholder="e.g., CISO, CFO, Operations Manager">' +
      "</div>" +
      '<div class="upgrade-notice">' +
      '<p class="text-muted" style="margin: 0; font-size: 13px;">' +
      ERM.icons.info +
      ' Multiple owners feature requires team plan. <a href="upgrade.html?source=team_features" class="upgrade-link">Upgrade to enable</a>.' +
      "</p>" +
      "</div>" +
      "</div>",
    size: "sm",
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Add Owner", type: "primary", action: "add" },
    ],
    onAction: function (action) {
      if (action === "add") {
        ERM.components.closeModal();
        ERM.toast.info("Multiple owners feature requires upgrade");
      }
    },
  });
};

/**
 * Show multiple owners upgrade modal
 */
ERM.controls.showMultipleOwnersUpgradeModal = function () {
  var content =
    '<div class="upgrade-modal-content">' +
    '<div class="upgrade-icon">' +
    '<span class="upgrade-icon-circle">' +
    ERM.icons.userPlus +
    "</span>" +
    '<span class="upgrade-badge">TEAM</span>' +
    "</div>" +
    '<h3 class="upgrade-title">Multiple Owners</h3>' +
    '<p class="upgrade-subtitle">Collaborate with shared ownership & accountability</p>' +
    '<ul class="upgrade-features">' +
    '<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Assign multiple control owners</span></li>' +
    '<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Shared responsibility tracking</span></li>' +
    '<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Team notifications & reminders</span></li>' +
    '<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Collaborative workflows</span></li>' +
    "</ul>" +
    '<div class="upgrade-note">' +
    '<span class="upgrade-note-icon">✨</span>' +
    "<p>Available in <strong>Team</strong> & <strong>Enterprise</strong> plans</p>" +
    "</div>" +
    "</div>";

  var lockIcon = ERM.icons && ERM.icons.lock ? ERM.icons.lock : '🔒';

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
   AI FEATURES
   ======================================== */

/**
 * Bind AI event handlers in form
 */
ERM.controls.bindFormAIEvents = function () {
  var self = this;

  // AI suggest buttons - matching risk register pattern
  var aiButtons = document.querySelectorAll(".btn-ai-suggest");
  for (var i = 0; i < aiButtons.length; i++) {
    aiButtons[i].addEventListener("click", function () {
      var field = this.getAttribute("data-field");
      self.handleAISuggest(field);
    });
  }

  // Notify owner button
  var notifyOwnerBtn = document.getElementById("notify-control-owner");
  if (notifyOwnerBtn) {
    notifyOwnerBtn.addEventListener("click", function () {
      if (typeof ERM.riskRegister !== "undefined" && ERM.riskRegister.showEmailUpgradeModal) {
        ERM.riskRegister.showEmailUpgradeModal();
      }
    });
  }

  // Add owner button
  var addOwnerBtn = document.getElementById("add-control-owner");
  if (addOwnerBtn) {
    addOwnerBtn.addEventListener("click", function () {
      self.showMultipleOwnersUpgradeModal();
    });
  }

  // Add description sentence
  var descriptionInput = document.getElementById("description-input");
  var addDescriptionBtn = document.querySelector(
    '.add-list-item[data-list="descriptions"]'
  );

  var addDescription = function () {
    var value = descriptionInput.value.trim();
    if (value) {
      self.addListItem("descriptions", value);
      descriptionInput.value = "";
    }
  };

  if (descriptionInput) {
    descriptionInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addDescription();
      }
    });
  }

  if (addDescriptionBtn) {
    addDescriptionBtn.addEventListener("click", function (e) {
      e.preventDefault();
      addDescription();
    });
  }

  // Remove item handlers
  this.initRemoveListItemHandlers();

  // AI Review Control button
  var reviewBtn = document.getElementById("ai-review-control");
  if (reviewBtn) {
    reviewBtn.addEventListener("click", function () {
      if (typeof ERM.ai !== "undefined" && ERM.ai.reviewEntireControl) {
        ERM.ai.reviewEntireControl();
      } else {
        ERM.toast.info("AI review coming soon");
      }
    });
  }

  // Draft persistence (input/change)
  var form = document.getElementById("control-form");
  if (form) {
    var scheduleSave = function () {
      self.scheduleControlDraftSave(self._editingControlId);
    };
    form.addEventListener("input", scheduleSave);
    form.addEventListener("change", scheduleSave);
  }
};

/**
 * Add list item (for descriptions)
 */
ERM.controls.addListItem = function (listType, value) {
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
    ERM.icons.close +
    "</button>" +
    "</div>";

  container.insertAdjacentHTML("beforeend", itemHtml);

  // Re-init remove handlers
  this.initRemoveListItemHandlers();
  this.scheduleControlDraftSave(this._editingControlId);
};

/**
 * Initialize remove list item handlers
 */
ERM.controls.initRemoveListItemHandlers = function () {
  var self = this;
  var removeButtons = document.querySelectorAll(".list-input-remove");

  for (var i = 0; i < removeButtons.length; i++) {
    removeButtons[i].removeEventListener("click", this._removeListItemHandler);
    removeButtons[i].addEventListener("click", function () {
      var item = this.closest(".list-input-item");
      if (item) {
        item.remove();
      }
      self.scheduleControlDraftSave(self._editingControlId);
    });
  }
};

/**
 * Handle AI field suggestions - matching risk register pattern
 */
ERM.controls.handleAISuggest = function (field) {
  // Use controlsAI module for field suggestions
  if (typeof ERM.controlsAI !== "undefined" && ERM.controlsAI.handleFieldSuggest) {
    ERM.controlsAI.handleFieldSuggest(field);
  } else {
    ERM.toast.info("AI suggestions coming soon for: " + field);
  }
};

/**
 * AI Suggest Control Name
 */
ERM.controls.aiSuggestName = function () {
  var self = this;
  var type = document.getElementById("control-type").value;
  var category = document.getElementById("control-category").value;

  var suggestions = this.getNameSuggestions(type, category);

  var listHtml = "";
  for (var i = 0; i < suggestions.length; i++) {
    var s = suggestions[i];
    listHtml +=
      '<div class="ai-suggestion-item" data-value="' +
      ERM.utils.escapeHtml(s.text) +
      '">' +
      '<div class="ai-suggestion-content">' +
      '<p class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(s.text) +
      "</p>" +
      '<span class="ai-suggestion-desc">' +
      ERM.utils.escapeHtml(s.desc) +
      "</span>" +
      "</div>" +
      '<button type="button" class="btn btn-sm btn-primary btn-ai-use">Use</button>' +
      "</div>";
  }

  ERM.components.showSecondaryModal({
    title: ERM.icons.sparkles + " Control Name Suggestions",
    content:
      '<div class="ai-suggestions-container">' +
      '<p class="ai-suggestions-intro">Select a suggestion to use:</p>' +
      '<div class="ai-suggestions-list">' +
      listHtml +
      "</div>" +
      "</div>",
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      var useBtns = document.querySelectorAll(
        ".ai-suggestion-item .btn-ai-use"
      );
      for (var j = 0; j < useBtns.length; j++) {
        useBtns[j].addEventListener("click", function () {
          var value = this.closest(".ai-suggestion-item").getAttribute(
            "data-value"
          );
          ERM.components.closeSecondaryModal(function() {
            document.getElementById("control-name").value = value;
            document.getElementById("control-name").classList.add("ai-filled");
            setTimeout(function () {
              document
                .getElementById("control-name")
                .classList.remove("ai-filled");
            }, 500);
            ERM.toast.success("Name applied");
          });
        });
      }
    },
  });
};

/**
 * Get name suggestions based on type/category
 */
ERM.controls.getNameSuggestions = function (type, category) {
  var suggestions = [];

  // Type-based suggestions
  if (type === "preventive") {
    suggestions = [
      {
        text: "Access Authorization Review",
        desc: "Validates user access before granting permissions",
      },
      {
        text: "Segregation of Duties Matrix",
        desc: "Prevents conflicting role assignments",
      },
      {
        text: "Input Validation Check",
        desc: "Validates data before processing",
      },
      {
        text: "Pre-Approval Workflow",
        desc: "Requires approval before transactions",
      },
      {
        text: "Security Awareness Training",
        desc: "Educates staff on security practices",
      },
    ];
  } else if (type === "detective") {
    suggestions = [
      {
        text: "Monthly Access Review",
        desc: "Periodic review of user access rights",
      },
      {
        text: "Transaction Monitoring",
        desc: "Automated monitoring of transactions",
      },
      { text: "Exception Reporting", desc: "Reports anomalies and exceptions" },
      {
        text: "Reconciliation Process",
        desc: "Compares and verifies data accuracy",
      },
      { text: "Audit Trail Review", desc: "Reviews system activity logs" },
    ];
  } else if (type === "corrective") {
    suggestions = [
      {
        text: "Incident Response Procedure",
        desc: "Steps to handle security incidents",
      },
      { text: "Data Recovery Process", desc: "Restores data from backups" },
      {
        text: "Error Correction Workflow",
        desc: "Process to fix identified errors",
      },
      {
        text: "Disciplinary Action Process",
        desc: "Addresses policy violations",
      },
      {
        text: "Remediation Action Plan",
        desc: "Structured fix for identified issues",
      },
    ];
  } else if (type === "directive") {
    suggestions = [
      {
        text: "Information Security Policy",
        desc: "Establishes security requirements",
      },
      {
        text: "Acceptable Use Policy",
        desc: "Defines acceptable system usage",
      },
      {
        text: "Risk Assessment Procedure",
        desc: "Guides risk identification process",
      },
      { text: "Change Management Policy", desc: "Governs system changes" },
      {
        text: "Business Continuity Plan",
        desc: "Ensures operations during disruption",
      },
    ];
  } else {
    // Generic suggestions
    suggestions = [
      {
        text: "Quarterly Access Review",
        desc: "Regular review of access permissions",
      },
      {
        text: "Automated Backup Process",
        desc: "Scheduled data backup procedure",
      },
      {
        text: "Change Approval Workflow",
        desc: "Multi-level change authorization",
      },
      { text: "Compliance Monitoring", desc: "Tracks regulatory compliance" },
      { text: "Risk Assessment Review", desc: "Periodic risk evaluation" },
    ];
  }

  return suggestions;
};

/**
 * AI Suggest Description
 */
ERM.controls.aiSuggestDescription = function () {
  var self = this;
  var name = document.getElementById("control-name").value;
  var type = document.getElementById("control-type").value;

  if (!name) {
    ERM.toast.warning("Please enter a control name first");
    return;
  }

  var suggestions = this.getDescriptionSuggestions(name, type);

  var listHtml = "";
  for (var i = 0; i < suggestions.length; i++) {
    listHtml +=
      '<div class="ai-suggestion-item" data-value="' +
      ERM.utils.escapeHtml(suggestions[i]) +
      '">' +
      '<div class="ai-suggestion-content">' +
      '<p class="ai-suggestion-text">' +
      ERM.utils.escapeHtml(suggestions[i]) +
      "</p>" +
      "</div>" +
      '<button type="button" class="btn btn-sm btn-primary btn-ai-use">Use</button>' +
      "</div>";
  }

  ERM.components.showSecondaryModal({
    title: ERM.icons.sparkles + " Description Suggestions",
    content:
      '<div class="ai-suggestions-container">' +
      '<p class="ai-suggestions-intro">Select a description template:</p>' +
      '<div class="ai-suggestions-list">' +
      listHtml +
      "</div>" +
      "</div>",
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      var useBtns = document.querySelectorAll(
        ".ai-suggestion-item .btn-ai-use"
      );
      for (var j = 0; j < useBtns.length; j++) {
        useBtns[j].addEventListener("click", function () {
          var value = this.closest(".ai-suggestion-item").getAttribute(
            "data-value"
          );
          ERM.components.closeSecondaryModal(function() {
            document.getElementById("control-description").value = value;
            document
              .getElementById("control-description")
              .classList.add("ai-filled");
            setTimeout(function () {
              document
                .getElementById("control-description")
                .classList.remove("ai-filled");
            }, 500);
            ERM.toast.success("Description applied");
          });
        });
      }
    },
  });
};

/**
 * Get description suggestions
 */
ERM.controls.getDescriptionSuggestions = function (name, type) {
  var nameLower = name.toLowerCase();
  var suggestions = [];

  if (type === "preventive") {
    suggestions = [
      "This preventive control operates on a scheduled basis to ensure " +
        name +
        " is performed consistently. The control prevents unauthorized activities by requiring pre-approval and validation before any action is taken.",
      "Implemented to prevent risk occurrence, this control requires " +
        name +
        " to be completed before proceeding. It includes validation steps, authorization requirements, and documented approval processes.",
      "A preventive measure that ensures compliance through " +
        name +
        ". The control operates proactively to stop potential issues before they occur, with clear escalation paths for exceptions.",
    ];
  } else if (type === "detective") {
    suggestions = [
      "This detective control performs " +
        name +
        " to identify anomalies, exceptions, or unauthorized activities after they occur. Results are reviewed by management and exceptions are escalated for investigation.",
      "Implemented to detect issues through systematic " +
        name +
        ". The control includes automated monitoring, exception reporting, and defined thresholds for escalation to appropriate personnel.",
      "A detective mechanism that enables early identification through " +
        name +
        ". Output is reviewed periodically with findings documented and tracked to resolution.",
    ];
  } else if (type === "corrective") {
    suggestions = [
      "This corrective control addresses identified issues through " +
        name +
        ". It includes defined procedures for remediation, timeline requirements, and verification of corrective actions taken.",
      "Implemented to correct and restore normal operations through " +
        name +
        ". The control ensures timely response to incidents with documented resolution steps and root cause analysis.",
      "A corrective measure that restores compliance through " +
        name +
        ". Includes defined response procedures, escalation paths, and verification that issues are fully addressed.",
    ];
  } else if (type === "directive") {
    suggestions = [
      "This directive control establishes requirements through " +
        name +
        ". It provides clear guidance on expected behaviors, compliance requirements, and consequences for non-compliance.",
      "Implemented to direct appropriate behavior through " +
        name +
        ". The control sets clear expectations, defines responsibilities, and establishes accountability for compliance.",
      "A directive mechanism that guides organizational conduct through " +
        name +
        ". Includes policy statements, procedural requirements, and communication to all affected personnel.",
    ];
  } else {
    suggestions = [
      "This control ensures " +
        name +
        " is performed according to established procedures. It includes defined frequency, responsible parties, and documentation requirements.",
      "Implemented to manage risk through systematic " +
        name +
        ". The control includes clear ownership, performance metrics, and periodic effectiveness reviews.",
      "A structured approach to " +
        name +
        " that ensures consistent execution, proper documentation, and timely completion in accordance with organizational standards.",
    ];
  }

  return suggestions;
};

/**
 * AI Suggest Control Type
 */
ERM.controls.aiSuggestType = function () {
  var description = document.getElementById("control-description").value;
  var name = document.getElementById("control-name").value;

  if (!description && !name) {
    ERM.toast.warning("Please enter a control name or description first");
    return;
  }

  var analysis = this.analyzeControlType(name, description);

  var content =
    '<div class="ai-type-analysis">' +
    '<div class="ai-analysis-header">' +
    '<div class="ai-analysis-icon">' +
    ERM.icons.sparkles +
    "</div>" +
    '<div class="ai-analysis-result">' +
    '<h4>Suggested Type: <span class="suggested-type badge badge-type-' +
    analysis.type +
    '">' +
    analysis.label +
    "</span></h4>" +
    '<p class="ai-confidence">Confidence: ' +
    analysis.confidence +
    "%</p>" +
    "</div>" +
    "</div>" +
    '<div class="ai-analysis-reason">' +
    "<h5>Analysis:</h5>" +
    "<p>" +
    analysis.reason +
    "</p>" +
    "</div>" +
    '<div class="ai-analysis-keywords">' +
    "<h5>Keywords detected:</h5>" +
    '<div class="keyword-tags">' +
    analysis.keywords
      .map(function (k) {
        return '<span class="keyword-tag">' + k + "</span>";
      })
      .join("") +
    "</div>" +
    "</div>" +
    "</div>";

  ERM.components.showSecondaryModal({
    title: ERM.icons.sparkles + " Control Type Analysis",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Apply Suggestion", type: "primary", action: "apply" },
    ],
    onAction: function (action) {
      if (action === "apply") {
        var typeValue = analysis.type;
        var typeLabel = analysis.label;
        ERM.components.closeSecondaryModal(function() {
          document.getElementById("control-type").value = typeValue;
          document.getElementById("control-type").classList.add("ai-filled");
          setTimeout(function () {
            document.getElementById("control-type").classList.remove("ai-filled");
          }, 500);
          ERM.toast.success("Control type set to " + typeLabel);
        });
      }
    },
  });
};

/**
 * Analyze text to determine control type
 */
ERM.controls.analyzeControlType = function (name, description) {
  var text = (name + " " + description).toLowerCase();

  var preventiveKeywords = [
    "prevent",
    "authorization",
    "approval",
    "restrict",
    "segregation",
    "validation",
    "before",
    "pre-",
    "prohibit",
    "limit",
    "require",
    "mandate",
  ];
  var detectiveKeywords = [
    "detect",
    "monitor",
    "review",
    "audit",
    "reconcile",
    "compare",
    "exception",
    "report",
    "identify",
    "log",
    "track",
    "after",
  ];
  var correctiveKeywords = [
    "correct",
    "remediate",
    "restore",
    "recover",
    "fix",
    "resolve",
    "incident",
    "response",
    "action",
    "address",
    "repair",
  ];
  var directiveKeywords = [
    "policy",
    "procedure",
    "guideline",
    "standard",
    "training",
    "awareness",
    "communicate",
    "educate",
    "inform",
    "define",
    "establish",
  ];

  var scores = {
    preventive: 0,
    detective: 0,
    corrective: 0,
    directive: 0,
  };

  var foundKeywords = [];

  for (var i = 0; i < preventiveKeywords.length; i++) {
    if (text.indexOf(preventiveKeywords[i]) !== -1) {
      scores.preventive += 10;
      foundKeywords.push(preventiveKeywords[i]);
    }
  }
  for (var j = 0; j < detectiveKeywords.length; j++) {
    if (text.indexOf(detectiveKeywords[j]) !== -1) {
      scores.detective += 10;
      foundKeywords.push(detectiveKeywords[j]);
    }
  }
  for (var k = 0; k < correctiveKeywords.length; k++) {
    if (text.indexOf(correctiveKeywords[k]) !== -1) {
      scores.corrective += 10;
      foundKeywords.push(correctiveKeywords[k]);
    }
  }
  for (var l = 0; l < directiveKeywords.length; l++) {
    if (text.indexOf(directiveKeywords[l]) !== -1) {
      scores.directive += 10;
      foundKeywords.push(directiveKeywords[l]);
    }
  }

  // Find highest score
  var maxType = "preventive";
  var maxScore = scores.preventive;
  for (var type in scores) {
    if (scores[type] > maxScore) {
      maxScore = scores[type];
      maxType = type;
    }
  }

  var labels = {
    preventive: "Preventive",
    detective: "Detective",
    corrective: "Corrective",
    directive: "Directive",
  };
  var reasons = {
    preventive:
      "This control appears to be preventive as it focuses on stopping issues before they occur through authorization, validation, or restriction mechanisms.",
    detective:
      "This control appears to be detective as it focuses on identifying and monitoring for issues through reviews, audits, or exception reporting.",
    corrective:
      "This control appears to be corrective as it focuses on addressing and remedying issues after they have been identified.",
    directive:
      "This control appears to be directive as it focuses on establishing policies, procedures, or guidelines that direct behavior.",
  };

  var confidence = Math.min(95, Math.max(60, maxScore + 50));

  return {
    type: maxType,
    label: labels[maxType],
    confidence: confidence,
    reason: reasons[maxType],
    keywords: foundKeywords.slice(0, 5),
  };
};

/**
 * AI Suggest Linked Risks
 * Updated to use intelligent risk-control matcher with thinking modal
 */
ERM.controls.aiSuggestLinkedRisks = function () {
  var self = this;
  var name = document.getElementById("control-name").value;
  var description = document.getElementById("control-description").value;
  var type = document.getElementById("control-type").value;
  var category = document.getElementById("control-category").value;

  if (!name && !description) {
    ERM.toast.warning("Please enter control details first");
    return;
  }

  // Show thinking modal while analyzing
  if (typeof ERM.controlsAI !== "undefined" && ERM.controlsAI.showThinkingModal) {
    var inputText = name + " " + description;
    ERM.controlsAI.showThinkingModal(inputText, function() {
      self.generateRiskSuggestions(name, description, type, category);
    });
  } else {
    // Fallback if thinking modal not available
    this.generateRiskSuggestions(name, description, type, category);
  }
};

/**
 * Generate risk suggestions using intelligent matcher
 */
ERM.controls.generateRiskSuggestions = function(name, description, type, category) {
  var self = this;

  // Get risks from current register
  var activeRegisterId = ERM.storage.get("activeRegisterId");
  var allRisks = ERM.storage.get("risks") || [];
  var risks = [];

  if (activeRegisterId) {
    for (var m = 0; m < allRisks.length; m++) {
      if (allRisks[m].registerId === activeRegisterId) {
        risks.push(allRisks[m]);
      }
    }
  } else {
    risks = allRisks;
  }

  if (risks.length === 0) {
    ERM.toast.warning("No risks available to link");
    return;
  }

  // Build control object for scoring
  var control = {
    name: name,
    description: description,
    type: type,
    category: category
  };

  // Score all risks using intelligent matcher
  var scoredRisks = [];
  if (window.ERM.riskControlMatcher) {
    for (var i = 0; i < risks.length; i++) {
      var matchResult = window.ERM.riskControlMatcher.scoreRiskForControl(risks[i], control);
      if (matchResult.score >= 40) { // Only show meaningful matches
        scoredRisks.push({
          risk: risks[i],
          score: matchResult.score,
          reasons: matchResult.reasons,
          isRecommended: matchResult.isRecommended
        });
      }
    }
  }

  // Sort by score descending
  scoredRisks.sort(function(a, b) {
    return b.score - a.score;
  });

  if (scoredRisks.length === 0) {
    ERM.toast.info("No matching risks found based on control details");
    return;
  }

  // Calculate top 33% for AI recommendation
  var recommendCount = Math.ceil(scoredRisks.length * 0.33);

  // Build suggestion list with AI badges
  var listHtml = '<div class="inline-control-selector">';
  for (var p = 0; p < scoredRisks.length; p++) {
    var scoredRisk = scoredRisks[p];
    var risk = scoredRisk.risk;
    var isTopThird = p < recommendCount && scoredRisk.score >= 50;

    listHtml +=
      '<label class="inline-control-item' +
      (isTopThird ? ' ai-recommended' : '') +
      '">' +
      '<input type="checkbox" class="suggested-risk-cb" value="' +
      risk.id +
      '" checked>' +
      '<span class="inline-control-name">' +
      ERM.utils.escapeHtml(risk.title);

    // Add AI recommended badge for top 33%
    if (isTopThird) {
      // TODO: Review tooltip logic - currently using simple tooltip
      listHtml +=
        ' <span class="ai-match-badge" title="AI Match ' + scoredRisk.score + '%">' +
        ERM.icons.sparkles +
        ' ' + scoredRisk.score + '%</span>';
    }

    listHtml += '</span>';

    // Add risk category badge if available
    if (risk.category) {
      var categoryClass = ' risk-category-' + risk.category.toLowerCase();
      listHtml +=
        '<span class="inline-control-type' + categoryClass + '">' +
        risk.category +
        '</span>';
    }

    listHtml += '</label>';
  }
  listHtml += '</div>';

  ERM.components.showSecondaryModal({
    title: ERM.icons.sparkles + " AI Suggested Risks",
    content:
      '<div class="ai-risk-suggestions">' +
      '<p class="ai-suggestions-intro">Based on your control details, these risks are relevant (top 33% highlighted):</p>' +
      '<div class="ai-suggestions-list">' +
      listHtml +
      "</div>" +
      "</div>",
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Link Selected", type: "primary", action: "link" },
    ],
    onAction: function (action) {
      if (action === "link") {
        var selected = document.querySelectorAll(".suggested-risk-cb:checked");
        for (var j = 0; j < selected.length; j++) {
          var riskId = selected[j].value;
          var checkbox = document.querySelector(
            'input[name="linkedRisks"][value="' + riskId + '"]'
          );
          if (checkbox) {
            checkbox.checked = true;
            // Add selected class for visual feedback
            var label = checkbox.closest(".inline-control-item");
            if (label) {
              label.classList.add("selected");
            }
          }
        }
        ERM.components.closeSecondaryModal();
        ERM.toast.success(selected.length + " risk(s) linked");
      }
    },
  });
};

/**
 * Analyze control against risks for matches
 * DEPRECATED: Now using intelligent risk-control matcher (window.ERM.riskControlMatcher)
 * Keeping for backward compatibility
 */
ERM.controls.analyzeRiskMatches = function (name, description, type, risks) {
  var controlText = (name + " " + description).toLowerCase();
  var matches = [];

  for (var i = 0; i < risks.length; i++) {
    var risk = risks[i];
    var riskText = (
      (risk.title || "") +
      " " +
      (risk.description || "")
    ).toLowerCase();

    // Score based on keyword overlap
    var score = 0;
    var reasons = [];

    // Check common words
    var controlWords = controlText.split(/\s+/).filter(function (w) {
      return w.length > 3;
    });
    var riskWords = riskText.split(/\s+/).filter(function (w) {
      return w.length > 3;
    });

    var commonWords = [];
    for (var j = 0; j < controlWords.length; j++) {
      if (
        riskWords.indexOf(controlWords[j]) !== -1 &&
        commonWords.indexOf(controlWords[j]) === -1
      ) {
        commonWords.push(controlWords[j]);
        score += 15;
      }
    }

    if (commonWords.length > 0) {
      reasons.push("Shares keywords: " + commonWords.slice(0, 3).join(", "));
    }

    // Check category alignment
    var categoryKeywords = {
      strategic: ["strategy", "objective", "goal", "market", "competition"],
      operational: [
        "operations",
        "process",
        "efficiency",
        "resource",
        "supply",
      ],
      financial: ["financial", "budget", "cost", "revenue", "fraud"],
      compliance: ["compliance", "regulatory", "legal", "audit", "policy"],
      technology: ["technology", "system", "data", "cyber", "security", "it"],
    };

    for (var cat in categoryKeywords) {
      var catWords = categoryKeywords[cat];
      var controlHasCat = false;
      var riskHasCat = false;

      for (var k = 0; k < catWords.length; k++) {
        if (controlText.indexOf(catWords[k]) !== -1) controlHasCat = true;
        if (riskText.indexOf(catWords[k]) !== -1) riskHasCat = true;
      }

      if (controlHasCat && riskHasCat) {
        score += 20;
        reasons.push("Both relate to " + cat + " domain");
        break;
      }
    }

    // Control type relevance
    if (
      type === "preventive" &&
      (riskText.indexOf("prevent") !== -1 || riskText.indexOf("avoid") !== -1)
    ) {
      score += 10;
      reasons.push("Risk requires preventive measures");
    }
    if (
      type === "detective" &&
      (riskText.indexOf("detect") !== -1 || riskText.indexOf("monitor") !== -1)
    ) {
      score += 10;
      reasons.push("Risk benefits from detective controls");
    }

    if (score >= 25) {
      matches.push({
        risk: risk,
        score: Math.min(95, score),
        reason: reasons.join(". "),
      });
    }
  }

  // Sort by score descending
  matches.sort(function (a, b) {
    return b.score - a.score;
  });

  return matches.slice(0, 5);
};

/**
 * AI Strength Check
 */
ERM.controls.aiStrengthCheck = function () {
  var name = document.getElementById("control-name").value;
  var description = document.getElementById("control-description").value;
  var type = document.getElementById("control-type").value;
  var category = document.getElementById("control-category").value;
  var owner = document.getElementById("control-owner").value;
  var effectiveness = document.getElementById("control-effectiveness").value;

  var analysis = this.analyzeControlStrength(
    name,
    description,
    type,
    category,
    owner,
    effectiveness
  );

  var scoreColor =
    analysis.score >= 80
      ? "#16a34a"
      : analysis.score >= 50
      ? "#d97706"
      : "#dc2626";
  var scoreLabel =
    analysis.score >= 80
      ? "Strong"
      : analysis.score >= 50
      ? "Moderate"
      : "Weak";

  var issuesHtml = "";
  if (analysis.issues.length > 0) {
    issuesHtml =
      '<div class="strength-issues">' +
      "<h5>" +
      ERM.icons.alertCircle +
      " Issues Found:</h5>" +
      "<ul>" +
      analysis.issues
        .map(function (i) {
          return "<li>" + i + "</li>";
        })
        .join("") +
      "</ul>" +
      "</div>";
  }

  var recommendationsHtml = "";
  if (analysis.recommendations.length > 0) {
    recommendationsHtml =
      '<div class="strength-recommendations">' +
      "<h5>" +
      ERM.icons.sparkles +
      " Recommendations:</h5>" +
      "<ul>" +
      analysis.recommendations
        .map(function (r) {
          return "<li>" + r + "</li>";
        })
        .join("") +
      "</ul>" +
      "</div>";
  }

  var content =
    '<div class="strength-check-result">' +
    '<div class="strength-score">' +
    '<div class="score-circle" style="background: linear-gradient(135deg, ' +
    scoreColor +
    ", " +
    scoreColor +
    '99);">' +
    '<span class="score-value">' +
    analysis.score +
    "%</span>" +
    "</div>" +
    '<span class="score-label" style="color: ' +
    scoreColor +
    ';">' +
    scoreLabel +
    " Control</span>" +
    "</div>" +
    issuesHtml +
    recommendationsHtml +
    "</div>";

  ERM.components.showSecondaryModal({
    title: ERM.icons.sparkles + " Control Strength Analysis",
    content: content,
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
  });
};

/**
 * Analyze control strength
 */
ERM.controls.analyzeControlStrength = function (
  name,
  description,
  type,
  category,
  owner,
  effectiveness
) {
  var score = 100;
  var issues = [];
  var recommendations = [];

  // Check name quality
  if (!name) {
    score -= 20;
    issues.push("Control name is missing");
  } else if (name.length < 10) {
    score -= 10;
    issues.push("Control name is too short - may lack clarity");
    recommendations.push(
      "Use a descriptive name that clearly identifies the control activity"
    );
  }

  // Check description quality
  if (!description) {
    score -= 25;
    issues.push("Description is missing");
    recommendations.push(
      "Add a detailed description explaining what the control does and how it operates"
    );
  } else {
    if (description.length < 50) {
      score -= 15;
      issues.push("Description is too brief - lacks detail");
      recommendations.push(
        "Expand description to include frequency, responsible parties, and verification steps"
      );
    }

    // Check for key elements
    var descLower = description.toLowerCase();
    if (
      descLower.indexOf("frequency") === -1 &&
      descLower.indexOf("daily") === -1 &&
      descLower.indexOf("weekly") === -1 &&
      descLower.indexOf("monthly") === -1 &&
      descLower.indexOf("quarterly") === -1 &&
      descLower.indexOf("annual") === -1
    ) {
      score -= 5;
      recommendations.push(
        "Consider specifying the control frequency (daily, weekly, monthly, etc.)"
      );
    }

    if (
      descLower.indexOf("evidence") === -1 &&
      descLower.indexOf("document") === -1 &&
      descLower.indexOf("record") === -1
    ) {
      score -= 5;
      recommendations.push(
        "Consider mentioning documentation or evidence requirements"
      );
    }

    if (
      descLower.indexOf("escalat") === -1 &&
      descLower.indexOf("exception") === -1
    ) {
      score -= 5;
      recommendations.push(
        "Consider adding exception handling or escalation procedures"
      );
    }
  }

  // Check type
  if (!type) {
    score -= 10;
    issues.push("Control type not specified");
  }

  // Check category
  if (!category) {
    score -= 10;
    issues.push("Control category not specified");
  }

  // Check owner
  if (!owner) {
    score -= 10;
    issues.push("Control owner not assigned");
    recommendations.push(
      "Assign a clear owner responsible for the control operation"
    );
  }

  // Check effectiveness rating
  if (!effectiveness || effectiveness === "notTested") {
    score -= 5;
    recommendations.push(
      "Consider testing the control and documenting its effectiveness"
    );
  }

  return {
    score: Math.max(0, score),
    issues: issues,
    recommendations: recommendations,
  };
};

/**
 * AI Improve Description (ISO 31000 format)
 */
ERM.controls.aiImproveDescription = function () {
  var self = this;
  var name = document.getElementById("control-name").value;
  var description = document.getElementById("control-description").value;
  var type = document.getElementById("control-type").value;

  if (!description && !name) {
    ERM.toast.warning("Please enter a control name or description first");
    return;
  }

  var improved = this.generateImprovedDescription(name, description, type);

  var content =
    '<div class="improve-result">' +
    '<div class="improve-section">' +
    "<h4>Original</h4>" +
    '<p class="original-text">' +
    ERM.utils.escapeHtml(description || "(No description provided)") +
    "</p>" +
    "</div>" +
    '<div class="improve-section">' +
    "<h4>Improved (ISO 31000 Format)</h4>" +
    '<p class="improved-text">' +
    ERM.utils.escapeHtml(improved) +
    "</p>" +
    "</div>" +
    "</div>";

  ERM.components.showSecondaryModal({
    title: ERM.icons.sparkles + " Improved Description",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Use Improved", type: "primary", action: "apply" },
    ],
    onAction: function (action) {
      if (action === "apply") {
        document.getElementById("control-description").value = improved;
        document
          .getElementById("control-description")
          .classList.add("ai-filled");
        setTimeout(function () {
          document
            .getElementById("control-description")
            .classList.remove("ai-filled");
        }, 500);
        ERM.components.closeSecondaryModal();
        ERM.toast.success("Description improved");
      }
    },
  });
};

/**
 * Generate improved ISO 31000 compliant description
 */
ERM.controls.generateImprovedDescription = function (name, description, type) {
  var controlName = name || "This control";
  var typeLabel = "control";

  for (var i = 0; i < this.types.length; i++) {
    if (this.types[i].value === type) {
      typeLabel = this.types[i].label.toLowerCase() + " control";
      break;
    }
  }

  // Extract key elements from existing description
  var existing = (description || "").toLowerCase();
  var hasFrequency =
    existing.indexOf("daily") !== -1 ||
    existing.indexOf("weekly") !== -1 ||
    existing.indexOf("monthly") !== -1 ||
    existing.indexOf("quarterly") !== -1;
  var hasOwner =
    existing.indexOf("responsible") !== -1 ||
    existing.indexOf("performed by") !== -1 ||
    existing.indexOf("owner") !== -1;

  var improved = "";

  if (type === "preventive") {
    improved =
      "CONTROL OBJECTIVE: " +
      controlName +
      " is a preventive control designed to mitigate risk by preventing adverse events before they occur.\n\n";
    improved +=
      "CONTROL DESCRIPTION: " +
      (description ||
        "This control implements proactive measures to prevent identified risks from materializing.");
    if (!hasFrequency) {
      improved +=
        " The control operates on a defined schedule with clear triggering conditions.";
    }
    improved +=
      "\n\nCONTROL OPERATION: Authorization and validation steps are performed prior to any activity. ";
    if (!hasOwner) {
      improved +=
        "The designated control owner ensures proper execution and documentation.";
    }
    improved +=
      "\n\nEVIDENCE: Documented approvals, system logs, and exception reports are maintained as evidence of control operation.";
  } else if (type === "detective") {
    improved =
      "CONTROL OBJECTIVE: " +
      controlName +
      " is a detective control designed to identify and report risk events or control failures after they occur.\n\n";
    improved +=
      "CONTROL DESCRIPTION: " +
      (description ||
        "This control implements monitoring and detection mechanisms to identify anomalies and exceptions.");
    if (!hasFrequency) {
      improved +=
        " Reviews are conducted on a regular basis with defined thresholds for escalation.";
    }
    improved +=
      "\n\nCONTROL OPERATION: Systematic review of transactions, logs, or reports to identify deviations from expected patterns. ";
    if (!hasOwner) {
      improved +=
        "Exceptions are escalated to the control owner for investigation and resolution.";
    }
    improved +=
      "\n\nEVIDENCE: Exception reports, review documentation, and resolution records are maintained as evidence of control operation.";
  } else if (type === "corrective") {
    improved =
      "CONTROL OBJECTIVE: " +
      controlName +
      " is a corrective control designed to remedy or mitigate the impact of risk events after they have been identified.\n\n";
    improved +=
      "CONTROL DESCRIPTION: " +
      (description ||
        "This control implements procedures to correct issues and restore normal operations.");
    improved +=
      "\n\nCONTROL OPERATION: Upon identification of an issue, defined remediation steps are initiated. ";
    if (!hasOwner) {
      improved +=
        "The control owner ensures timely resolution and root cause analysis.";
    }
    improved +=
      "\n\nEVIDENCE: Incident reports, remediation records, and verification of corrective actions are maintained as evidence of control operation.";
  } else if (type === "directive") {
    improved =
      "CONTROL OBJECTIVE: " +
      controlName +
      " is a directive control designed to guide behavior and establish requirements for risk management.\n\n";
    improved +=
      "CONTROL DESCRIPTION: " +
      (description ||
        "This control establishes policies, procedures, or guidelines that direct organizational behavior.");
    improved +=
      "\n\nCONTROL OPERATION: Requirements are communicated to all relevant personnel. ";
    if (!hasOwner) {
      improved +=
        "The control owner ensures ongoing compliance and periodic review.";
    }
    improved +=
      "\n\nEVIDENCE: Policy documents, training records, and compliance attestations are maintained as evidence of control implementation.";
  } else {
    improved =
      "CONTROL OBJECTIVE: " +
      controlName +
      " is designed to manage identified risks through structured procedures.\n\n";
    improved +=
      "CONTROL DESCRIPTION: " +
      (description ||
        "This control implements measures to address specific risk factors.");
    if (!hasFrequency) {
      improved +=
        " The control operates according to a defined schedule or triggering events.";
    }
    improved += "\n\nCONTROL OPERATION: ";
    if (!hasOwner) {
      improved +=
        "The designated control owner ensures proper execution and documentation of control activities.";
    } else {
      improved +=
        "Control activities are performed as specified with appropriate oversight.";
    }
    improved +=
      "\n\nEVIDENCE: Relevant documentation is maintained as evidence of control operation and effectiveness.";
  }

  return improved;
};

/* ========================================
   CONTROL SELECTOR FOR RISK FORM
   ======================================== */

/**
 * Get control selector HTML for risk forms
 */
ERM.controls.getControlSelector = function (selectedIds) {
  var self = this;
  var controls = this.getAll();
  selectedIds = selectedIds || [];

  if (controls.length === 0) {
    return (
      '<div class="no-controls-message">' +
      '<p class="text-muted">No controls in library yet.</p>' +
      '<button type="button" class="btn btn-sm btn-secondary" id="create-control-inline">' +
      ERM.icons.plus +
      " Create Control" +
      "</button>" +
      "</div>"
    );
  }

  var html =
    '<div class="control-selector">' +
    '<div class="control-selector-search">' +
    '<input type="text" class="form-input" id="control-search-input" placeholder="Search controls...">' +
    "</div>" +
    '<div class="control-selector-list" id="control-selector-list">';

  for (var i = 0; i < controls.length; i++) {
    var c = controls[i];
    var isChecked = selectedIds.indexOf(c.id) !== -1;
    var typeLabel = c.type
      ? c.type.charAt(0).toUpperCase() + c.type.slice(1)
      : "N/A";

    html +=
      '<label class="control-selector-item' +
      (isChecked ? " selected" : "") +
      '">' +
      '<input type="checkbox" name="riskControls" value="' +
      c.id +
      '"' +
      (isChecked ? " checked" : "") +
      ">" +
      '<div class="control-selector-info">' +
      '<span class="control-ref">' +
      ERM.utils.escapeHtml(c.reference) +
      "</span>" +
      '<span class="control-name">' +
      ERM.utils.escapeHtml(c.name) +
      "</span>" +
      '<span class="badge badge-type-' +
      c.type +
      '">' +
      typeLabel +
      "</span>" +
      "</div>" +
      "</label>";
  }

  html +=
    "</div>" +
    '<div class="control-selector-footer">' +
    '<button type="button" class="btn btn-sm btn-secondary" id="create-control-inline">' +
    ERM.icons.plus +
    " Add New Control" +
    "</button>" +
    "</div>" +
    "</div>";

  return html;
};

/**
 * Initialize control selector events
 */
ERM.controls.initControlSelector = function () {
  var self = this;

  // Search filtering
  var searchInput = document.getElementById("control-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      var query = this.value.toLowerCase();
      var items = document.querySelectorAll(".control-selector-item");
      for (var i = 0; i < items.length; i++) {
        var text = items[i].textContent.toLowerCase();
        items[i].style.display = text.indexOf(query) !== -1 ? "" : "none";
      }
    });
  }

  // Checkbox selection styling
  var checkboxes = document.querySelectorAll(
    '.control-selector-item input[type="checkbox"]'
  );
  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener("change", function () {
      if (this.checked) {
        this.closest(".control-selector-item").classList.add("selected");
      } else {
        this.closest(".control-selector-item").classList.remove("selected");
      }
    });
  }

  // Create control inline
  var createBtn = document.getElementById("create-control-inline");
  if (createBtn) {
    createBtn.addEventListener("click", function () {
      self.showQuickAddModal();
    });
  }
};

/**
 * Quick add control modal (from risk form)
 */
ERM.controls.showQuickAddModal = function () {
  var self = this;

  var typeOptions = '<option value="">Select Type</option>';
  for (var i = 0; i < this.types.length; i++) {
    typeOptions +=
      '<option value="' +
      this.types[i].value +
      '">' +
      this.types[i].label +
      "</option>";
  }

  var categoryOptions = '<option value="">Select Category</option>';
  for (var j = 0; j < this.categories.length; j++) {
    categoryOptions +=
      '<option value="' +
      this.categories[j].value +
      '">' +
      this.categories[j].label +
      "</option>";
  }

  var content =
    '<form id="quick-control-form">' +
    '<div class="form-group">' +
    '<label class="form-label required">Control Name</label>' +
    '<input type="text" class="form-input" id="quick-control-name" placeholder="e.g. Monthly Access Review">' +
    "</div>" +
    '<div class="form-row">' +
    '<div class="form-group">' +
    '<label class="form-label required">Type</label>' +
    '<select class="form-select" id="quick-control-type">' +
    typeOptions +
    "</select>" +
    "</div>" +
    '<div class="form-group">' +
    '<label class="form-label required">Category</label>' +
    '<select class="form-select" id="quick-control-category">' +
    categoryOptions +
    "</select>" +
    "</div>" +
    "</div>" +
    '<div class="form-group">' +
    '<label class="form-label">Description</label>' +
    '<textarea class="form-textarea" id="quick-control-desc" rows="2" placeholder="Brief description..."></textarea>' +
    "</div>" +
    "</form>";

  ERM.components.showSecondaryModal({
    title: "Quick Add Control",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Create", type: "primary", action: "create" },
    ],
    onAction: function (action) {
      if (action === "create") {
        var name = document.getElementById("quick-control-name").value.trim();
        var type = document.getElementById("quick-control-type").value;
        var category = document.getElementById("quick-control-category").value;

        if (!name || !type || !category) {
          ERM.toast.error("Please fill in all required fields");
          return;
        }

        var control = {
          name: name,
          type: type,
          category: category,
          description: document
            .getElementById("quick-control-desc")
            .value.trim(),
          effectiveness: "notTested",
          status: "planned",
          linkedRisks: [],
        };

        var saved = self.save(control);
        ERM.components.closeSecondaryModal();
        ERM.toast.success("Control created");

        // Refresh control list if visible
        var listContainer = document.getElementById("control-selector-list");
        if (listContainer) {
          // Add new control to the list
          var newItem = document.createElement("label");
          newItem.className = "control-selector-item selected";
          newItem.innerHTML =
            '<input type="checkbox" name="riskControls" value="' +
            saved.id +
            '" checked>' +
            '<div class="control-selector-info">' +
            '<span class="control-ref">' +
            saved.reference +
            "</span>" +
            '<span class="control-name">' +
            ERM.utils.escapeHtml(saved.name) +
            "</span>" +
            '<span class="badge badge-type-' +
            saved.type +
            '">' +
            saved.type.charAt(0).toUpperCase() +
            saved.type.slice(1) +
            "</span>" +
            "</div>";
          listContainer.insertBefore(newItem, listContainer.firstChild);
        }
      }
    },
  });
};

/**
 * Show AI Controls Review
 * Analyzes all controls and provides recommendations
 */
ERM.controls.showAIControlsReview = function () {
  // Check if user is on paid plan
  var plan = ERM.usageTracker ? ERM.usageTracker.getPlan() : 'FREE';
  if (plan === 'FREE') {
    // Show upgrade modal for free users
    this.showUpgradeModal('control_review');
    return;
  }

  // Directly show the review modal which has its own built-in thinking animation
  this.displayAIControlsReview();
};

/**
 * Show Upgrade Modal for Controls features
 */
ERM.controls.showUpgradeModal = function (reason) {
  var title = "Upgrade Your Plan";
  var desc = "Unlock premium features with Dimeri ERM Pro.";
  var source = "general";

  if (reason === "control_review") {
    title = "AI Control Review is a Pro feature";
    desc =
      "Get comprehensive AI-powered analysis of your entire control library with actionable recommendations. Upgrade to Pro to unlock this feature.";
    source = "control_review";
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
    "<span>Unlimited controls</span>" +
    "</div>" +
    '<div class="upgrade-feature">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
    "<span>AI Control Review</span>" +
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

/**
 * Show AI thinking/analyzing modal
 * Uses unified ERM.components.showThinkingModal
 */
ERM.controls.showAIThinkingModal = function (onComplete) {
  ERM.components.showThinkingModal({
    input: "Control portfolio",
    title: "AI is analyzing your controls",
    steps: [
      { text: "Analyzing control library", delay: 500 },
      { text: "Evaluating control effectiveness", delay: 600 },
      { text: "Checking risk linkages", delay: 500 },
      { text: "Identifying coverage gaps", delay: 400 },
      { text: "Generating recommendations", delay: 500 },
    ],
    namespace: ERM.controls,
    onComplete: onComplete
  });
};

/**
 * Display AI Control Portfolio Review - structured consultant-style summary
 */
ERM.controls.displayAIControlsReview = function () {
  var self = this;

  // Get controls and risks from storage
  var controls = ERM.storage.get("controls") || [];
  var risks = ERM.storage.get("risks") || [];

  // Gather comprehensive control statistics
  var stats = {
    total: controls.length,
    active: 0, planned: 0, inactive: 0,
    typeBreakdown: { preventive: 0, detective: 0, corrective: 0, directive: 0 },
    linked: 0, unlinked: 0,
    effective: 0, partiallyEffective: 0, ineffective: 0, notTested: 0,
    hasOwner: 0, noOwner: 0,
    automated: 0, manual: 0,
    risksPerControl: [], // for avg calculation
    singleControlRisks: 0, // risks with only 1 control
    highRisksNoPreventive: 0
  };

  // Control frequency distribution
  var frequencyDist = { continuous: 0, daily: 0, weekly: 0, monthly: 0, quarterly: 0, annual: 0, adhoc: 0 };

  for (var i = 0; i < controls.length; i++) {
    var ctrl = controls[i];

    // Status
    var status = (ctrl.status || "").toLowerCase();
    if (status === "active") stats.active++;
    else if (status === "planned") stats.planned++;
    else stats.inactive++;

    // Type
    var type = (ctrl.type || "").toLowerCase();
    if (stats.typeBreakdown[type] !== undefined) stats.typeBreakdown[type]++;

    // Linkage
    if (ctrl.linkedRisks && ctrl.linkedRisks.length > 0) {
      stats.linked++;
      stats.risksPerControl.push(ctrl.linkedRisks.length);
    } else {
      stats.unlinked++;
    }

    // Effectiveness
    var eff = (ctrl.effectiveness || "").toLowerCase();
    if (eff === "effective") stats.effective++;
    else if (eff === "partially-effective" || eff === "partial") stats.partiallyEffective++;
    else if (eff === "ineffective") stats.ineffective++;
    else stats.notTested++;

    // Ownership
    if (ctrl.owner) stats.hasOwner++;
    else stats.noOwner++;

    // Automation (if field exists)
    var automation = (ctrl.automation || ctrl.controlNature || "").toLowerCase();
    if (automation === "automated" || automation === "automatic") stats.automated++;
    else stats.manual++;

    // Frequency
    var freq = (ctrl.frequency || "").toLowerCase();
    if (frequencyDist[freq] !== undefined) frequencyDist[freq]++;
    else if (freq) frequencyDist.adhoc++;
  }

  // Calculate risks with single control and high risks without preventive
  var riskControlCounts = {};
  var riskHasPreventive = {};

  for (var j = 0; j < controls.length; j++) {
    var c = controls[j];
    if (c.linkedRisks) {
      for (var r = 0; r < c.linkedRisks.length; r++) {
        var rid = c.linkedRisks[r];
        riskControlCounts[rid] = (riskControlCounts[rid] || 0) + 1;
        if ((c.type || "").toLowerCase() === "preventive") {
          riskHasPreventive[rid] = true;
        }
      }
    }
  }

  // Count single-control risks and high risks without preventive
  for (var riskId in riskControlCounts) {
    if (riskControlCounts[riskId] === 1) stats.singleControlRisks++;
  }

  for (var k = 0; k < risks.length; k++) {
    var risk = risks[k];
    var iL = parseInt(risk.inherentLikelihood) || 3;
    var iI = parseInt(risk.inherentImpact) || 3;
    var score = iL * iI;
    if (score >= 15 && !riskHasPreventive[risk.id]) {
      stats.highRisksNoPreventive++;
    }
  }

  // Calculate averages
  var avgControlsPerRisk = 0;
  var minControls = 0;
  var maxControls = 0;
  if (stats.risksPerControl.length > 0) {
    var sum = 0;
    minControls = stats.risksPerControl[0];
    maxControls = stats.risksPerControl[0];
    for (var m = 0; m < stats.risksPerControl.length; m++) {
      sum += stats.risksPerControl[m];
      if (stats.risksPerControl[m] < minControls) minControls = stats.risksPerControl[m];
      if (stats.risksPerControl[m] > maxControls) maxControls = stats.risksPerControl[m];
    }
    avgControlsPerRisk = Math.round((sum / stats.risksPerControl.length) * 10) / 10;
  }

  // Build context for display
  var ctx = {
    total: stats.total,
    active: stats.active,
    planned: stats.planned,
    inactive: stats.inactive,
    types: stats.typeBreakdown,
    linked: stats.linked,
    unlinked: stats.unlinked,
    effective: stats.effective,
    partiallyEffective: stats.partiallyEffective,
    ineffective: stats.ineffective,
    notTested: stats.notTested,
    hasOwner: stats.hasOwner,
    noOwner: stats.noOwner,
    automated: stats.automated,
    manual: stats.manual,
    avgControlsPerRisk: avgControlsPerRisk,
    singleControlRisks: stats.singleControlRisks,
    highRisksNoPreventive: stats.highRisksNoPreventive,
    frequency: frequencyDist
  };

  // Build thinking steps for loading animation (matching AI risk generation style)
  var thinkingSteps = [
    { text: "Analyzing control inventory", delay: 500 },
    { text: "Evaluating type distribution", delay: 600 },
    { text: "Assessing coverage linkage", delay: 500 },
    { text: "Checking effectiveness ratings", delay: 600 },
    { text: "Generating insights", delay: 400 }
  ];

  var stepsHtml = "";
  for (var st = 0; st < thinkingSteps.length; st++) {
    stepsHtml +=
      '<div class="ai-step" data-step="' + st + '">' +
      '<div class="ai-step-icon">' +
      '<svg class="ai-step-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="50" stroke-linecap="round"/></svg>' +
      '<svg class="ai-step-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
      '</div>' +
      '<span class="ai-step-text">' + thinkingSteps[st].text + '</span>' +
      '<span class="ai-step-dots"><span>.</span><span>.</span><span>.</span></span>' +
      '</div>';
  }

  // Build structured modal content
  var content =
    '<div class="control-portfolio-review">' +
    // Loading state - using AI thinking style
    '<div id="control-portfolio-loading" class="ai-thinking-container">' +
    '<div class="ai-thinking-header">' +
    '<div class="ai-brain-animation">' +
    '<div class="ai-brain-circle"></div>' +
    '<div class="ai-brain-circle"></div>' +
    '<div class="ai-brain-circle"></div>' +
    '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
    '</div>' +
    '<h3>Analyzing Controls</h3>' +
    '<p class="ai-input-preview">Control Portfolio</p>' +
    '</div>' +
    '<div class="ai-steps-container">' +
    stepsHtml +
    '</div>' +
    '</div>' +
    '<div id="control-portfolio-content" style="display: none;">' +
    // Section 1: Overall Control Posture (green)
    '<div class="portfolio-section" style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">' +
    '<h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #166534;">Overall Control Posture</h4>' +
    '<p id="ctrl-section-posture" style="margin: 0; font-size: 13px; color: #166534; line-height: 1.7; word-wrap: break-word;"></p>' +
    '</div>' +
    // Section 2: Control Type Balance (gray with bullets)
    '<div class="portfolio-section" style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">' +
    '<h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #334155;">Control Type Balance</h4>' +
    '<ul id="ctrl-section-types" style="margin: 0 0 12px; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;"></ul>' +
    '<p id="ctrl-section-types-interpretation" style="margin: 0; font-size: 13px; color: #475569; font-style: italic; word-wrap: break-word;"></p>' +
    '</div>' +
    // Section 3: Control Coverage & Linkage (blue)
    '<div class="portfolio-section" style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">' +
    '<h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #1e40af;">Control Coverage & Linkage</h4>' +
    '<p id="ctrl-section-coverage" style="margin: 0; font-size: 13px; color: #1e3a8a; line-height: 1.7; word-wrap: break-word;"></p>' +
    '</div>' +
    // Section 4: Control Strength Signals (amber)
    '<div class="portfolio-section" style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">' +
    '<h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #92400e;">Control Strength Signals</h4>' +
    '<p id="ctrl-section-strength" style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.7; word-wrap: break-word;"></p>' +
    '</div>' +
    // Section 5: Governance & Assurance (purple - AI)
    '<div class="portfolio-section" style="background: #faf5ff; border-left: 4px solid #8b5cf6; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">' +
    '<h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #6d28d9;">Governance & Assurance Signals</h4>' +
    '<p id="ctrl-section-governance" style="margin: 0; font-size: 13px; color: #5b21b6; line-height: 1.7; word-wrap: break-word;"></p>' +
    '</div>' +
    // Footer
    '<p class="portfolio-footer" style="margin: 20px 0 0; font-size: 11px; color: #9ca3af; text-align: center; font-style: italic; padding-top: 12px; border-top: 1px solid #e5e7eb;">This assessment reflects current control configuration and linkage.</p>' +
    '</div>' +
    '</div>';

  ERM.components.showModal({
    title: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 8px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> AI Control Portfolio Review',
    content: content,
    size: "lg",
    variant: "portfolio",
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function () {
      self.generateControlPortfolioReview(ctx);
    }
  });
};

/**
 * Generate Control Portfolio Review - populates sections
 */
ERM.controls.generateControlPortfolioReview = function (ctx) {
  var self = this;

  // Step delays for animation
  var stepDelays = [500, 600, 500, 600, 400];

  // Animate the thinking steps sequentially
  function animateStep(stepIndex) {
    if (stepIndex >= stepDelays.length) {
      // All steps complete - show the content
      setTimeout(function () {
        self.populateControlPortfolioContent(ctx);
      }, 300);
      return;
    }

    var stepEl = document.querySelector('.control-portfolio-review .ai-step[data-step="' + stepIndex + '"]');
    if (stepEl) {
      // Mark previous step as complete
      if (stepIndex > 0) {
        var prevStep = document.querySelector('.control-portfolio-review .ai-step[data-step="' + (stepIndex - 1) + '"]');
        if (prevStep) {
          prevStep.classList.remove("active");
          prevStep.classList.add("complete");
        }
      }
      // Activate current step
      stepEl.classList.add("active");
    }

    setTimeout(function () {
      animateStep(stepIndex + 1);
    }, stepDelays[stepIndex]);
  }

  // Start animation after brief delay
  setTimeout(function () {
    animateStep(0);
  }, 200);
};

/**
 * Populate control portfolio review content after animation
 */
ERM.controls.populateControlPortfolioContent = function (ctx) {
  var self = this;

  // Mark last step as complete
  var lastStep = document.querySelector('.control-portfolio-review .ai-step[data-step="4"]');
  if (lastStep) {
    lastStep.classList.remove("active");
    lastStep.classList.add("complete");
  }

  // Section 1: Overall Control Posture
  var dominant = "preventive";
  var totalTyped = ctx.types.preventive + ctx.types.detective + ctx.types.corrective + ctx.types.directive;
  if (ctx.types.detective > ctx.types[dominant]) dominant = "detective";
  if (ctx.types.corrective > ctx.types[dominant]) dominant = "corrective";
  if (ctx.types.directive > ctx.types[dominant]) dominant = "directive";

  var posture = "The control portfolio consists of " + ctx.total + " controls";
  if (ctx.active > 0) {
    posture += ", with " + ctx.active + " active";
    if (ctx.planned > 0) posture += " and " + ctx.planned + " planned";
    posture += ".";
  } else {
    posture += ".";
  }

  if (totalTyped > 0) {
    posture += " Controls are primarily " + dominant + " in nature.";
  }

  var maturity = "developing";
  if (ctx.effective > ctx.total * 0.6) maturity = "mature";
  else if (ctx.effective > ctx.total * 0.3) maturity = "moderate";
  posture += " Overall control maturity appears " + maturity + ".";

  // Section 2: Control Type Balance
  var typesList = [];
  if (totalTyped > 0) {
    var prevPct = Math.round((ctx.types.preventive / totalTyped) * 100);
    var detPct = Math.round((ctx.types.detective / totalTyped) * 100);
    var corrPct = Math.round((ctx.types.corrective / totalTyped) * 100);
    var dirPct = Math.round((ctx.types.directive / totalTyped) * 100);

    if (prevPct > 0) typesList.push(prevPct + "% Preventive controls");
    if (detPct > 0) typesList.push(detPct + "% Detective controls");
    if (corrPct > 0) typesList.push(corrPct + "% Corrective controls");
    if (dirPct > 0) typesList.push(dirPct + "% Directive controls");
  } else {
    typesList.push("No control types assigned yet.");
  }

  var typeInterpretation = "";
  if (ctx.types.preventive > ctx.types.detective * 2) {
    typeInterpretation = "The current balance suggests strong upfront risk prevention with limited monitoring depth.";
  } else if (ctx.types.detective > ctx.types.preventive) {
    typeInterpretation = "The current balance emphasizes detection over prevention, which may increase incident occurrence.";
  } else if (totalTyped > 0) {
    typeInterpretation = "The type distribution shows reasonable balance between prevention and detection.";
  }

  // Section 3: Control Coverage & Linkage
  var coverageText = "";
  if (ctx.linked > 0) {
    var linkPct = Math.round((ctx.linked / ctx.total) * 100);
    coverageText = linkPct + "% of controls are linked to risks.";
  } else {
    coverageText = "No controls are currently linked to risks.";
  }

  if (ctx.singleControlRisks > 0) {
    coverageText += " " + ctx.singleControlRisks + " risk" + (ctx.singleControlRisks > 1 ? "s" : "") + " rely on a single control, increasing dependency risk.";
  }

  if (ctx.highRisksNoPreventive > 0) {
    coverageText += " " + ctx.highRisksNoPreventive + " high-impact risk" + (ctx.highRisksNoPreventive > 1 ? "s" : "") + " currently have no preventive controls linked.";
  }

  if (ctx.unlinked > 0) {
    coverageText += " " + ctx.unlinked + " control" + (ctx.unlinked > 1 ? "s" : "") + " remain unlinked to any risk.";
  }

  // Section 4: Control Strength Signals
  var strengthText = "";
  var manualPct = ctx.total > 0 ? Math.round((ctx.manual / ctx.total) * 100) : 0;

  if (ctx.automated > 0) {
    strengthText = ctx.automated + " control" + (ctx.automated > 1 ? "s are" : " is") + " automated, providing continuous assurance.";
  } else {
    strengthText = "Controls are primarily manual";
    if (manualPct >= 80) {
      strengthText += ", which may limit timely detection. Automated or continuous controls are limited within the portfolio.";
    } else {
      strengthText += ".";
    }
  }

  var testedPct = ctx.total > 0 ? Math.round(((ctx.effective + ctx.partiallyEffective + ctx.ineffective) / ctx.total) * 100) : 0;
  if (ctx.notTested > 0) {
    strengthText += " " + ctx.notTested + " control" + (ctx.notTested > 1 ? "s" : "") + " (" + (100 - testedPct) + "%) have not been tested for effectiveness.";
  }

  // Populate static sections
  var postureEl = document.getElementById("ctrl-section-posture");
  var typesEl = document.getElementById("ctrl-section-types");
  var typesInterpEl = document.getElementById("ctrl-section-types-interpretation");
  var coverageEl = document.getElementById("ctrl-section-coverage");
  var strengthEl = document.getElementById("ctrl-section-strength");

  if (postureEl) postureEl.textContent = posture;
  if (typesEl) {
    var bullets = "";
    for (var i = 0; i < typesList.length; i++) {
      bullets += "<li>" + self.escapeHtmlForReview(typesList[i]) + "</li>";
    }
    typesEl.innerHTML = bullets;
  }
  if (typesInterpEl) typesInterpEl.textContent = typeInterpretation;
  if (coverageEl) coverageEl.textContent = coverageText;
  if (strengthEl) strengthEl.textContent = strengthText;

  // Section 5: Governance (AI generated)
  self.generateControlGovernanceSignals(ctx, function (govText) {
    var govEl = document.getElementById("ctrl-section-governance");
    if (govEl) govEl.textContent = govText;

    var loading = document.getElementById("control-portfolio-loading");
    var content = document.getElementById("control-portfolio-content");
    if (loading) loading.style.display = "none";
    if (content) content.style.display = "block";
  });
};

/**
 * Generate AI Governance Signals for Controls
 */
ERM.controls.generateControlGovernanceSignals = function (ctx, callback) {
  // Static fallback if no AI
  if (typeof ERM.aiService === "undefined" || !ERM.aiService.callAPI) {
    callback(ERM.controls.getStaticControlGovernance(ctx));
    return;
  }

  var ownerPct = ctx.total > 0 ? Math.round((ctx.hasOwner / ctx.total) * 100) : 0;
  var testedPct = ctx.total > 0 ? Math.round(((ctx.effective + ctx.partiallyEffective + ctx.ineffective) / ctx.total) * 100) : 0;

  var prompt =
    "Controls: " + ctx.total + " total | " + ctx.active + " active | " +
    "Ownership: " + ownerPct + "% | Tested: " + testedPct + "% | " +
    "Effective: " + ctx.effective + " | Not tested: " + ctx.notTested + "\n\n" +
    "Write 2 sentences about governance and assurance signals. Focus on:\n" +
    "- Whether control ownership is adequate\n" +
    "- Whether testing/review frequency is sufficient for assurance confidence\n" +
    "No recommendations. No 'you should'. Just observations. Max 40 words.";

  ERM.aiService.callAPI(
    prompt,
    function (response) {
      if (response && response.success && response.text) {
        callback(response.text);
      } else {
        callback(ERM.controls.getStaticControlGovernance(ctx));
      }
    },
    { maxTokens: 100 }
  );
};

/**
 * Static fallback for control governance signals
 */
ERM.controls.getStaticControlGovernance = function (ctx) {
  var ownerPct = ctx.total > 0 ? Math.round((ctx.hasOwner / ctx.total) * 100) : 0;
  var testedPct = ctx.total > 0 ? Math.round(((ctx.effective + ctx.partiallyEffective + ctx.ineffective) / ctx.total) * 100) : 0;

  if (ownerPct >= 80 && testedPct >= 60) {
    return "Control ownership is well-assigned and testing coverage is reasonable. Assurance confidence appears stable.";
  } else if (ownerPct < 50) {
    return "Control ownership coverage is limited (" + ownerPct + "%), which may affect accountability. Governance attention warranted.";
  } else if (testedPct < 30) {
    return "Testing coverage is low (" + testedPct + "%), limiting confidence in sustained effectiveness. Review frequency may be inconsistent.";
  } else {
    return "Control ownership is mostly assigned, though review frequency may be inconsistent. This may affect confidence in sustained control effectiveness.";
  }
};

/**
 * Escape HTML for review display
 */
ERM.controls.escapeHtmlForReview = function (str) {
  if (!str) return "";
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Analyze controls and generate insights
 */
ERM.controls.analyzeControls = function () {
  var controls = this.controlsData || [];

  var totalControls = controls.length;
  var activeControls = 0;
  var effectiveControls = 0;
  var linkedControls = 0;

  var categoryBreakdown = {
    strategic: 0,
    financial: 0,
    operational: 0,
    compliance: 0,
    technology: 0,
    hr: 0,
    hse: 0,
    reputational: 0,
    project: 0,
  };

  for (var i = 0; i < controls.length; i++) {
    var control = controls[i];

    if (control.status === "active") activeControls++;
    if (control.effectiveness === "effective") effectiveControls++;
    if (control.linkedRisks && control.linkedRisks.length > 0) linkedControls++;

    // Count by category (using linked risks to determine category coverage)
    if (control.linkedRisks && control.linkedRisks.length > 0) {
      // Get categories from linked risks
      var risks = ERM.riskRegister.risks || [];
      for (var j = 0; j < control.linkedRisks.length; j++) {
        var riskId = control.linkedRisks[j];
        var risk = risks.find(function (r) {
          return r.id === riskId;
        });
        if (risk && risk.category && categoryBreakdown.hasOwnProperty(risk.category)) {
          categoryBreakdown[risk.category]++;
        }
      }
    }
  }

  // Generate recommendations
  var recommendations = [];

  if (linkedControls < totalControls * 0.7) {
    recommendations.push({
      type: "warning",
      title: "Low Risk-Control Linkage",
      description:
        "Only " +
        linkedControls +
        " out of " +
        totalControls +
        " controls are linked to risks. Consider linking controls to relevant risks for better risk management.",
    });
  }

  if (effectiveControls < totalControls * 0.8) {
    recommendations.push({
      type: "warning",
      title: "Control Effectiveness Needs Review",
      description:
        "Only " +
        effectiveControls +
        " controls are marked as effective. Review and test control effectiveness regularly.",
    });
  }

  // Check for categories with low coverage
  for (var cat in categoryBreakdown) {
    if (categoryBreakdown[cat] === 0) {
      recommendations.push({
        type: "info",
        title: "No Controls for " + this.getCategoryLabel(cat),
        description:
          "Consider adding controls to address " +
          this.getCategoryLabel(cat).toLowerCase() +
          " risks.",
      });
    } else if (categoryBreakdown[cat] < 3) {
      recommendations.push({
        type: "info",
        title: "Limited Coverage for " + this.getCategoryLabel(cat),
        description:
          "Only " +
          categoryBreakdown[cat] +
          " control(s) addressing " +
          this.getCategoryLabel(cat).toLowerCase() +
          " risks. Consider expanding coverage.",
      });
    }
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: "success",
      title: "Strong Control Library",
      description:
        "Your control library has good coverage across risk categories with appropriate linkages.",
    });
  }

  return {
    totalControls: totalControls,
    activeControls: activeControls,
    effectiveControls: effectiveControls,
    linkedControls: linkedControls,
    categoryBreakdown: categoryBreakdown,
    recommendations: recommendations,
  };
};

/**
 * Build category coverage HTML
 */
ERM.controls.buildCategoryCoverageHTML = function (categoryBreakdown) {
  var html = '<div class="category-coverage-grid">';

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

  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    var count = categoryBreakdown[cat] || 0;
    var status = count === 0 ? "none" : count < 3 ? "low" : "good";

    html +=
      '<div class="category-coverage-item category-coverage-' +
      status +
      '">' +
      '<div class="category-coverage-label">' +
      this.getCategoryLabel(cat) +
      "</div>" +
      '<div class="category-coverage-count">' +
      count +
      " control" +
      (count !== 1 ? "s" : "") +
      "</div>" +
      "</div>";
  }

  html += "</div>";
  return html;
};

/**
 * Build recommendations HTML
 */
ERM.controls.buildRecommendationsHTML = function (recommendations) {
  var html = '<div class="ai-recommendations">';

  var iconMap = {
    success: ERM.icons.check,
    warning: ERM.icons.alert,
    info: ERM.icons.info,
  };

  for (var i = 0; i < recommendations.length; i++) {
    var rec = recommendations[i];
    html +=
      '<div class="ai-recommendation ai-recommendation-' +
      rec.type +
      '">' +
      '<div class="ai-recommendation-icon">' +
      (iconMap[rec.type] || ERM.icons.info) +
      "</div>" +
      '<div class="ai-recommendation-content">' +
      '<div class="ai-recommendation-title">' +
      rec.title +
      "</div>" +
      '<div class="ai-recommendation-description">' +
      rec.description +
      "</div>" +
      "</div>" +
      "</div>";
  }

  html += "</div>";
  return html;
};

/* ========================================
   ATTACHMENT HANDLERS
   ======================================== */

/**
 * Initialize attachment upload handlers
 */
ERM.controls.initAttachmentHandlers = function () {
  var self = this;
  var dropZone = document.getElementById("control-attachment-drop-zone");
  var fileInput = document.getElementById("control-attachment-input");

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

/**
 * Handle file selection
 */
ERM.controls.handleFileSelect = function (files) {
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

/**
 * Add attachment to list
 */
ERM.controls.addAttachment = function (fileData) {
  var container = document.getElementById("control-attachment-list");
  if (!container) return;

  var items = container.querySelectorAll(".attachment-item");
  var index = items.length;
  var fileIcon = ERM.riskRegister ? ERM.riskRegister.getFileIcon(fileData.type) : this.getFileIcon(fileData.type);

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
    ERM.icons.eye +
    "</button>" +
    '<button type="button" class="btn btn-icon btn-ghost attachment-remove" data-index="' +
    index +
    '" title="Remove">' +
    ERM.icons.trash +
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

/**
 * Initialize attachment remove handlers
 */
ERM.controls.initAttachmentRemoveHandlers = function () {
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

/**
 * Preview attachment
 */
ERM.controls.previewAttachment = function (fileData) {
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
      '<p><a href="' +
      fileData.data +
      '" download="' +
      ERM.utils.escapeHtml(fileData.name) +
      '" class="btn btn-primary btn-sm">Download</a></p>' +
      "</div>";
  }

  ERM.components.showModal({
    title: "Attachment Preview",
    content: content,
    size: "lg",
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
  });
};

/**
 * Format file size
 */
ERM.controls.formatFileSize = function (bytes) {
  if (bytes === 0) return "0 Bytes";
  var k = 1024;
  var sizes = ["Bytes", "KB", "MB", "GB"];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

/**
 * Get file icon based on type
 */
ERM.controls.getFileIcon = function (type) {
  if (type.indexOf("image") !== -1) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
  } else if (type === "application/pdf") {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
  } else if (type.indexOf("spreadsheet") !== -1 || type.indexOf("excel") !== -1) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="12" y1="11" x2="12" y2="19"/></svg>';
  } else {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
  }
};

/**
 * Get category label
 */
ERM.controls.getCategoryLabel = function (categoryId) {
  var labels = {
    strategic: "Strategic Risks",
    financial: "Financial Risks",
    operational: "Operational Risks",
    compliance: "Compliance Risks",
    technology: "Technology Risks",
    hr: "HR Risks",
    hse: "HSE Risks",
    reputational: "Reputational Risks",
    project: "Project Risks",
  };
  return labels[categoryId] || categoryId;
};

// Initialize when DOM ready
document.addEventListener("DOMContentLoaded", function () {
  // Controls module will be initialized via layout.js navigation
});

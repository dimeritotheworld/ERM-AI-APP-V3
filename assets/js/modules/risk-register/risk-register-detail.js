/**
 * Dimeri ERM - Risk Register Detail Module
 * Risks table, detail view, filters, bulk actions
 *
 * @version 3.0.0
 * ES5 Compatible
 */

console.log("Loading risk-register-detail.js...");

var ERM = window.ERM || {};
ERM.riskRegister = ERM.riskRegister || {};

/* ========================================
   REGISTER DETAIL VIEW
   ======================================== */
ERM.riskRegister.renderRegisterDetail = function () {
  var self = this;
  var viewContainer = document.getElementById("view-risk-register");
  if (!viewContainer || !this.state.currentRegister) return;

  var register = this.state.currentRegister;
  var risks = ERM.storage.get("risks") || [];
  var registerRisks = risks.filter(function (r) {
    return r.registerId === register.id;
  });

  // Apply heatmap intent filter (from dashboard)
  var heatIntent = ERM.riskRegister.state && ERM.riskRegister.state.heatmapFilter;
  if (heatIntent) {
    registerRisks = registerRisks.filter(function (r) {
      return ERM.riskRegister.matchesHeatmapFilter(r, heatIntent);
    });
  }

  // Calculate derived score properties for each risk
  for (var i = 0; i < registerRisks.length; i++) {
    var risk = registerRisks[i];
    var iL = parseInt(risk.inherentLikelihood) || 3;
    var iI = parseInt(risk.inherentImpact) || 3;
    var rL = parseInt(risk.residualLikelihood) || 2;
    var rI = parseInt(risk.residualImpact) || 2;

    risk.inherentScore = iL * iI;
    risk.residualScore = rL * rI;
    risk.inherentRisk = self.getRiskLevelFromScore(risk.inherentScore);
    risk.residualRisk = self.getRiskLevelFromScore(risk.residualScore);
  }

  var heatmapBannerHtml = "";
  if (heatIntent) {
    var labelText =
      (heatIntent.type === "residual" ? "Residual" : "Inherent") +
      " - Impact " +
      heatIntent.impact +
      " x Likelihood " +
      heatIntent.likelihood;
    heatmapBannerHtml =
      '<div class="info-banner mild" id="heatmap-banner-detail">' +
      '<div class="info-banner-content">' +
      '<span class="info-banner-icon-circle">!</span>' +
      '<span class="info-banner-text">Viewing risks from dashboard heatmap: ' +
      ERM.utils.escapeHtml(labelText) +
      "</span>" +
      "</div>" +
      '<button class="info-banner-close" id="clear-heatmap-banner-detail">' +
      self.icons.close +
      "</button>" +
      "</div>";
  }

  // Filter bar - generic categories
  var filterBarHtml =
    '<div class="filter-bar">' +
    '<div class="filter-bar-left">' +
    '<div class="search-input-wrapper">' +
    this.icons.search +
    '<input type="text" class="form-input filter-search" id="risk-search" placeholder="Search risks...">' +
    "</div>" +
    '<select class="form-select filter-select" id="filter-category">' +
    '<option value="">All Categories</option>';

  for (var c = 0; c < this.categories.length; c++) {
    var selectedAttr = this.state.filters.category === this.categories[c].value ? ' selected' : '';
    filterBarHtml +=
      '<option value="' +
      this.categories[c].value +
      '"' +
      selectedAttr +
      ">" +
      this.categories[c].label +
      "</option>";
  }

  filterBarHtml +=
    "</select>" +
    '<select class="form-select filter-select" id="filter-level">' +
    '<option value="">All Levels</option>' +
    '<option value="CRITICAL">Critical</option>' +
    '<option value="HIGH">High</option>' +
    '<option value="MEDIUM">Medium</option>' +
    '<option value="LOW">Low</option>' +
    "</select>" +
    '<select class="form-select filter-select" id="filter-status">' +
    '<option value="">All Statuses</option>' +
    '<option value="Open">Open</option>' +
    '<option value="In Progress">In Progress</option>' +
    '<option value="Mitigated">Mitigated</option>' +
    '<option value="Closed">Closed</option>' +
    "</select>" +
    "</div>" +
    '<div class="filter-bar-right">' +
    '<span class="result-count" id="risk-count">' +
    registerRisks.length +
    " risks</span>" +
    '<div class="view-toggle">' +
    '<button class="view-btn" data-view="grid" title="Card view">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    '<rect x="3" y="3" width="7" height="7"></rect>' +
    '<rect x="14" y="3" width="7" height="7"></rect>' +
    '<rect x="14" y="14" width="7" height="7"></rect>' +
    '<rect x="3" y="14" width="7" height="7"></rect>' +
    '</svg>' +
    '</button>' +
    '<button class="view-btn active" data-view="table" title="Table view">' +
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
    "</div>";

  // Bulk actions bar (above table, shows when items selected)
  var bulkActionsBarHtml =
    '<div class="bulk-actions-bar" id="risks-bulk-actions">' +
    '<span class="bulk-selected-count" id="risks-selected-count">0 selected</span>' +
    '<div class="bulk-actions-buttons">' +
    '<button class="btn btn-outline btn-sm" id="bulk-duplicate-risks">' +
    this.icons.copy +
    " Duplicate</button>" +
    '<button class="btn btn-outline-danger btn-sm" id="bulk-delete-risks">' +
    this.icons.trash +
    " Delete</button>" +
    "</div>" +
    "</div>";

  // Risks grid view (cards) - hidden by default
  var gridHtml = '<div class="risks-grid-view" id="risks-grid-container" style="display: none;">';

  if (registerRisks.length === 0) {
    gridHtml +=
      '<div class="empty-state compact" style="grid-column: 1 / -1; padding: 48px; text-align: center;">' +
      '<div class="empty-state-icon">📋</div>' +
      '<h4 class="empty-state-title">No risks yet</h4>' +
      '<p class="empty-state-desc">Add your first risk to this register</p>' +
      "</div>";
  } else {
    for (var g = 0; g < registerRisks.length; g++) {
      var gRisk = registerRisks[g];
      var gInherentClass = this.getRiskLevelClass(gRisk.inherentScore);
      var gResidualClass = this.getRiskLevelClass(gRisk.residualScore);
      var gRiskRef = gRisk.reference || "R-" + String(g + 1).padStart(3, "0");

      gridHtml +=
        '<div class="risk-card" data-risk-id="' + gRisk.id + '">' +
        '<div class="risk-card-checkbox" onclick="event.stopPropagation();">' +
        '<label class="checkbox-wrapper">' +
        '<input type="checkbox" class="risk-select-checkbox" data-risk-id="' + gRisk.id + '">' +
        '<span class="checkbox-custom"></span>' +
        '</label>' +
        '</div>' +
        '<div class="risk-card-header">' +
        '<span class="risk-card-ref">' + ERM.utils.escapeHtml(gRiskRef) + '</span>' +
        '<span class="risk-card-category">' + this.formatCategory(gRisk.category) + '</span>' +
        '</div>' +
        '<h4 class="risk-card-title">' + ERM.utils.escapeHtml(gRisk.title) + '</h4>' +
        '<p class="risk-card-owner">' + ERM.utils.escapeHtml(gRisk.owner || "Unassigned") + '</p>' +
        '<div class="risk-card-scores">' +
        '<div class="risk-card-score">' +
        '<span class="risk-card-score-label">Inherent</span>' +
        '<span class="risk-card-score-value ' + gInherentClass + '">' + gRisk.inherentScore + ' - ' + gRisk.inherentRisk + '</span>' +
        '</div>' +
        '<div class="risk-card-score">' +
        '<span class="risk-card-score-label">Residual</span>' +
        '<span class="risk-card-score-value ' + gResidualClass + '">' + gRisk.residualScore + ' - ' + gRisk.residualRisk + '</span>' +
        '</div>' +
        '</div>' +
        '<div class="risk-card-footer">' +
        '<span class="status-badge">' + ERM.utils.escapeHtml(gRisk.status) + '</span>' +
        '<div class="risk-card-actions">' +
        '<button class="btn-icon edit-risk-btn" data-risk-id="' + gRisk.id + '" title="Edit">' +
        this.icons.edit +
        '</button>' +
        '<button class="btn-icon btn-delete-risk delete-risk-btn" data-risk-id="' + gRisk.id + '" title="Delete">' +
        this.icons.trash +
        '</button>' +
        '</div>' +
        '</div>' +
        '</div>';
    }
  }
  gridHtml += '</div>';

  // Risks table (shown by default)
  var tableHtml =
    '<div class="risks-table-container" id="risks-table-container">' +
    bulkActionsBarHtml +
    '<table class="risk-table">' +
    "<thead>" +
    "<tr>" +
    '<th class="checkbox-cell">' +
    '<label class="checkbox-wrapper">' +
    '<input type="checkbox" id="select-all-risks">' +
    '<span class="checkbox-custom"></span>' +
    "</label>" +
    "</th>" +
    "<th>RISK ID</th>" +
    "<th>RISK TITLE</th>" +
    "<th>RISK OWNER</th>" +
    "<th>INHERENT RISK</th>" +
    "<th>RESIDUAL RISK</th>" +
    "<th>STATUS</th>" +
    '<th class="actions-cell"></th>' +
    "</tr>" +
    "</thead>" +
    '<tbody id="risks-table-body">';

  if (registerRisks.length === 0) {
    tableHtml +=
      "<tr>" +
      '<td colspan="8" class="empty-table-cell">' +
      '<div class="empty-state compact">' +
      '<div class="empty-state-icon">📋</div>' +
      '<h4 class="empty-state-title">No risks yet</h4>' +
      '<p class="empty-state-desc">Add your first risk to this register</p>' +
      "</div>" +
      "</td>" +
      "</tr>";
  } else {
    for (var r = 0; r < registerRisks.length; r++) {
      var risk = registerRisks[r];
      var inherentClass = this.getRiskLevelClass(risk.inherentScore);
      var residualClass = this.getRiskLevelClass(risk.residualScore);
      var riskRef = risk.reference || "R-" + String(r + 1).padStart(3, "0");

      tableHtml +=
        '<tr class="risk-row" data-risk-id="' +
        risk.id +
        '">' +
        '<td class="checkbox-cell" onclick="event.stopPropagation();">' +
        '<label class="checkbox-wrapper">' +
        '<input type="checkbox" class="risk-select-checkbox" data-risk-id="' +
        risk.id +
        '">' +
        '<span class="checkbox-custom"></span>' +
        "</label>" +
        "</td>" +
        '<td class="risk-ref-cell">' +
        riskRef +
        "</td>" +
        "<td>" +
        '<div class="risk-title-cell">' +
        '<span class="risk-title">' +
        ERM.utils.escapeHtml(risk.title) +
        "</span>" +
        '<span class="risk-category">' +
        this.formatCategory(risk.category) +
        "</span>" +
        "</div>" +
        "</td>" +
        "<td>" +
        ERM.utils.escapeHtml(risk.owner || "-") +
        "</td>" +
        "<td>" +
        '<span class="risk-score-badge ' +
        inherentClass +
        '">' +
        risk.inherentScore +
        " - " +
        risk.inherentRisk +
        "</span>" +
        "</td>" +
        "<td>" +
        '<span class="risk-score-badge ' +
        residualClass +
        '">' +
        risk.residualScore +
        " - " +
        risk.residualRisk +
        "</span>" +
        "</td>" +
        '<td><span class="status-badge">' +
        ERM.utils.escapeHtml(risk.status) +
        "</span></td>" +
        '<td class="actions-cell" onclick="event.stopPropagation();">' +
        '<div class="row-actions">' +
        '<button class="btn-icon-sm edit-risk-btn" data-risk-id="' +
        risk.id +
        '" title="Edit">' +
        this.icons.edit +
        "</button>" +
        '<button class="btn-icon-sm delete-risk-btn" data-risk-id="' +
        risk.id +
        '" title="Delete">' +
        this.icons.trash +
        "</button>" +
        "</div>" +
        "</td>" +
        "</tr>";
    }
  }

  tableHtml += "</tbody></table></div>";

  // Page header
  var html =
    '<div class="page-header detail-header">' +
    '<button class="back-btn" id="back-to-registers">' +
    this.icons.chevronLeft +
    " Back to Registers" +
    "</button>" +
    '<div class="page-header-top">' +
    '<div class="page-header-content">' +
    '<h1 class="page-title">' +
    ERM.utils.escapeHtml(register.name) +
    "</h1>" +
    "</div>" +
    '<div class="page-header-actions">' +
    '<button class="btn btn-primary" id="add-risk-btn">' +
    this.icons.plus +
    " Add Risk" +
    "</button>" +
    '<button class="btn btn-secondary" id="ai-review-register-btn" style="gap: 6px;">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' +
    " Portfolio Review" +
    "</button>" +
    '<div class="dropdown">' +
    '<button class="btn-icon" id="register-options-btn" title="More options">' +
    this.icons.moreVertical +
    "</button>" +
    '<div class="dropdown-menu" id="register-options-menu">' +
    '<a href="#" class="dropdown-item" data-action="export">' +
    this.icons.download +
    "<span>Export</span>" +
    "</a>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    heatmapBannerHtml +
    filterBarHtml +
    bulkActionsBarHtml +
    gridHtml +
    tableHtml;

  viewContainer.innerHTML = html;
  this.initDetailEvents();
};

/* ========================================
   DETAIL VIEW EVENTS
   ======================================== */
ERM.riskRegister.initDetailEvents = function () {
  var self = this;

  // Back button
  var backBtn = document.getElementById("back-to-registers");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      self.renderRegisterList();
    });
  }

  var clearHeatmapBtn = document.getElementById("clear-heatmap-banner-detail");
  if (clearHeatmapBtn) {
    clearHeatmapBtn.addEventListener("click", function () {
      ERM.storage.set("heatmapFilter", null);
      self.state.heatmapFilter = null;
      self.renderRegisterDetail();
    });
  }

  // Add risk button
  var addRiskBtn = document.getElementById("add-risk-btn");
  if (addRiskBtn) {
    addRiskBtn.addEventListener("click", function () {
      // Use AI-first approach if AI module is loaded
      if (typeof ERM.riskAI !== "undefined" && ERM.riskAI.showAddRiskChoice) {
        ERM.riskAI.showAddRiskChoice();
      } else {
        // Fallback to manual form
        self.showRiskModal(null);
      }
    });
  }

  // AI Review Register button
  var aiReviewBtn = document.getElementById("ai-review-register-btn");
  if (aiReviewBtn) {
    aiReviewBtn.addEventListener("click", function () {
      self.showAIRegisterReview();
    });
  }

  // Register options menu
  var optionsBtn = document.getElementById("register-options-btn");
  var optionsMenu = document.getElementById("register-options-menu");
  if (optionsBtn && optionsMenu) {
    optionsBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var isShowing = optionsMenu.classList.contains("show");

      // Close all other menus first
      var allMenus = document.querySelectorAll(".dropdown-menu.show");
      for (var m = 0; m < allMenus.length; m++) {
        allMenus[m].classList.remove("show", "dropdown-up");
        allMenus[m].style.position = "";
        allMenus[m].style.top = "";
        allMenus[m].style.bottom = "";
        allMenus[m].style.left = "";
        allMenus[m].style.right = "";
      }

      if (!isShowing) {
        // Position the menu using fixed positioning to escape overflow:hidden
        var rect = optionsBtn.getBoundingClientRect();
        optionsMenu.style.position = "fixed";
        optionsMenu.style.right = (window.innerWidth - rect.right) + "px";
        optionsMenu.style.left = "auto";

        // Auto-detect: check if menu would overflow bottom of viewport
        var menuHeight = optionsMenu.offsetHeight || 150;
        optionsMenu.classList.add("show");
        menuHeight = optionsMenu.offsetHeight;

        var spaceBelow = window.innerHeight - rect.bottom - 8;
        var spaceAbove = rect.top - 8;

        if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
          // Not enough space below, position above the button
          optionsMenu.style.top = "auto";
          optionsMenu.style.bottom = (window.innerHeight - rect.top + 4) + "px";
          optionsMenu.classList.add("dropdown-up");
        } else {
          // Position below the button (default)
          optionsMenu.style.top = (rect.bottom + 4) + "px";
          optionsMenu.style.bottom = "auto";
          optionsMenu.classList.remove("dropdown-up");
        }
      }
    });

    // Menu item actions
    var menuItems = optionsMenu.querySelectorAll(".dropdown-item");
    for (var i = 0; i < menuItems.length; i++) {
      menuItems[i].addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var action = this.getAttribute("data-action");
        optionsMenu.classList.remove("show", "dropdown-up");

        switch (action) {
          case "export":
            self.showExportModal();
            break;
        }
      });
    }
  }

  // Close options menu on outside click (guarded)
  if (!ERM.riskRegister._detailDocClickBound) {
    ERM.riskRegister._detailDocClickBound = true;
    document.addEventListener("click", function (e) {
      var optMenu = document.getElementById("register-options-menu");
      if (
        optMenu &&
        !e.target.closest("#register-options-btn") &&
        !e.target.closest("#register-options-menu")
      ) {
        optMenu.classList.remove("show", "dropdown-up");
        optMenu.style.position = "";
        optMenu.style.top = "";
        optMenu.style.bottom = "";
        optMenu.style.left = "";
        optMenu.style.right = "";
      }
    });
  }

  // Filter handlers
  this.initFilterHandlers();

  // View toggle (grid/table)
  var viewBtns = document.querySelectorAll(".view-toggle .view-btn");
  var gridContainer = document.getElementById("risks-grid-container");
  var tableContainer = document.getElementById("risks-table-container");

  for (var vi = 0; vi < viewBtns.length; vi++) {
    viewBtns[vi].addEventListener("click", function () {
      var view = this.getAttribute("data-view");
      // Update active state
      for (var vj = 0; vj < viewBtns.length; vj++) {
        viewBtns[vj].classList.remove("active");
      }
      this.classList.add("active");
      // Toggle views
      if (view === "grid") {
        if (gridContainer) gridContainer.style.display = "";
        if (tableContainer) tableContainer.style.display = "none";
      } else {
        if (gridContainer) gridContainer.style.display = "none";
        if (tableContainer) tableContainer.style.display = "";
      }
    });
  }

  // Risk card click (grid view)
  var cards = document.querySelectorAll(".risk-card");
  for (var ci = 0; ci < cards.length; ci++) {
    cards[ci].addEventListener("click", function (e) {
      if (
        e.target.closest(".checkbox-wrapper") ||
        e.target.closest(".risk-card-actions")
      )
        return;
      var riskId = this.getAttribute("data-risk-id");
      self.showRiskModal(riskId);
    });
  }

  // Risk row click (table view)
  var rows = document.querySelectorAll(".risk-row");
  for (var j = 0; j < rows.length; j++) {
    rows[j].addEventListener("click", function (e) {
      if (
        e.target.closest(".checkbox-wrapper") ||
        e.target.closest(".row-actions")
      )
        return;
      var riskId = this.getAttribute("data-risk-id");
      self.showRiskModal(riskId);
    });
  }

  // Edit risk buttons
  var editBtns = document.querySelectorAll(".edit-risk-btn");
  for (var k = 0; k < editBtns.length; k++) {
    editBtns[k].addEventListener("click", function (e) {
      e.stopPropagation();
      var riskId = this.getAttribute("data-risk-id");
      self.showRiskModal(riskId);
    });
  }

  // Delete risk buttons
  var deleteBtns = document.querySelectorAll(".delete-risk-btn");
  for (var l = 0; l < deleteBtns.length; l++) {
    deleteBtns[l].addEventListener("click", function (e) {
      e.stopPropagation();
      var riskId = this.getAttribute("data-risk-id");
      self.showDeleteRiskModal(riskId);
    });
  }

  // Risk checkboxes
  this.initRiskCheckboxHandlers();
};

/* ========================================
   FILTER HANDLERS
   ======================================== */
ERM.riskRegister.initFilterHandlers = function () {
  var self = this;

  var searchInput = document.getElementById("risk-search");
  var categoryFilter = document.getElementById("filter-category");
  var levelFilter = document.getElementById("filter-level");
  var statusFilter = document.getElementById("filter-status");

  var applyFilters = function () {
    self.state.filters.search = searchInput
      ? searchInput.value.toLowerCase()
      : "";
    self.state.filters.category = categoryFilter ? categoryFilter.value : self.state.filters.category || "";
    self.state.filters.level = levelFilter ? levelFilter.value : "";
    self.state.filters.status = statusFilter ? statusFilter.value : "";

    var rows = document.querySelectorAll(".risk-row");
    var visibleCount = 0;

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var riskId = row.getAttribute("data-risk-id");
      var risks = ERM.storage.get("risks") || [];
      var risk = null;

      for (var j = 0; j < risks.length; j++) {
        if (risks[j].id === riskId) {
          risk = risks[j];
          break;
        }
      }

      if (!risk) continue;

      // Calculate derived score properties
      var iL = parseInt(risk.inherentLikelihood) || 3;
      var iI = parseInt(risk.inherentImpact) || 3;
      risk.inherentScore = iL * iI;
      risk.inherentRisk = self.getRiskLevelFromScore(risk.inherentScore);

      var show = true;

      // Search filter
      if (self.state.filters.search) {
        var searchText = (
          risk.title +
          " " +
          risk.description +
          " " +
          risk.owner
        ).toLowerCase();
        if (searchText.indexOf(self.state.filters.search) === -1) {
          show = false;
        }
      }

      // Category filter
      if (
        self.state.filters.category &&
        risk.category !== self.state.filters.category
      ) {
        show = false;
      }

      // Level filter
      if (
        self.state.filters.level &&
        risk.inherentRisk !== self.state.filters.level
      ) {
        show = false;
      }

      // Status filter
      if (
        self.state.filters.status &&
        risk.status !== self.state.filters.status
      ) {
        show = false;
      }

      row.style.display = show ? "" : "none";
      if (show) visibleCount++;
    }

    // Also filter cards in grid view
    var cards = document.querySelectorAll(".risk-card");
    for (var c = 0; c < cards.length; c++) {
      var card = cards[c];
      var cardRiskId = card.getAttribute("data-risk-id");
      var risks = ERM.storage.get("risks") || [];
      var cardRisk = null;

      for (var cr = 0; cr < risks.length; cr++) {
        if (risks[cr].id === cardRiskId) {
          cardRisk = risks[cr];
          break;
        }
      }

      if (!cardRisk) continue;

      // Calculate derived score properties
      var cL = parseInt(cardRisk.inherentLikelihood) || 3;
      var cI = parseInt(cardRisk.inherentImpact) || 3;
      cardRisk.inherentScore = cL * cI;
      cardRisk.inherentRisk = self.getRiskLevelFromScore(cardRisk.inherentScore);

      var cardShow = true;

      // Search filter
      if (self.state.filters.search) {
        var cardSearchText = (
          cardRisk.title +
          " " +
          cardRisk.description +
          " " +
          cardRisk.owner
        ).toLowerCase();
        if (cardSearchText.indexOf(self.state.filters.search) === -1) {
          cardShow = false;
        }
      }

      // Category filter
      if (
        self.state.filters.category &&
        cardRisk.category !== self.state.filters.category
      ) {
        cardShow = false;
      }

      // Level filter
      if (
        self.state.filters.level &&
        cardRisk.inherentRisk !== self.state.filters.level
      ) {
        cardShow = false;
      }

      // Status filter
      if (
        self.state.filters.status &&
        cardRisk.status !== self.state.filters.status
      ) {
        cardShow = false;
      }

      card.style.display = cardShow ? "" : "none";
    }

    var countEl = document.getElementById("risk-count");
    if (countEl) {
      countEl.textContent = visibleCount + " risks";
    }
  };

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      ERM.utils.debounce(applyFilters, 200)
    );
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", applyFilters);
  }

  if (levelFilter) {
    levelFilter.addEventListener("change", applyFilters);
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters);
  }
};

/* ========================================
   RISK CHECKBOX HANDLERS
   ======================================== */
ERM.riskRegister.initRiskCheckboxHandlers = function () {
  var self = this;

  var checkboxes = document.querySelectorAll(".risk-select-checkbox");
  for (var j = 0; j < checkboxes.length; j++) {
    checkboxes[j].addEventListener("change", function () {
      // Sync checkbox state between grid and table views
      var riskId = this.getAttribute("data-risk-id");
      var isChecked = this.checked;
      var allCheckboxes = document.querySelectorAll('.risk-select-checkbox[data-risk-id="' + riskId + '"]');
      for (var s = 0; s < allCheckboxes.length; s++) {
        allCheckboxes[s].checked = isChecked;
      }
      // Update card selected state
      var card = document.querySelector('.risk-card[data-risk-id="' + riskId + '"]');
      if (card) {
        if (isChecked) {
          card.classList.add("selected");
        } else {
          card.classList.remove("selected");
        }
      }
      self.updateRisksBulkActions();
    });
  }

  // Select all checkbox
  var selectAll = document.getElementById("select-all-risks");
  if (selectAll) {
    selectAll.addEventListener("change", function () {
      var cbs = document.querySelectorAll(".risk-select-checkbox");
      for (var s = 0; s < cbs.length; s++) {
        cbs[s].checked = this.checked;
        // Update card selected state
        var riskId = cbs[s].getAttribute("data-risk-id");
        var card = document.querySelector('.risk-card[data-risk-id="' + riskId + '"]');
        if (card) {
          if (this.checked) {
            card.classList.add("selected");
          } else {
            card.classList.remove("selected");
          }
        }
      }
      self.updateRisksBulkActions();
    });
  }

  // Bulk action buttons
  var bulkDuplicateBtn = document.getElementById("bulk-duplicate-risks");
  if (bulkDuplicateBtn) {
    bulkDuplicateBtn.addEventListener("click", function () {
      var ids = self.getSelectedRiskIds();
      if (ids.length > 0) {
        self.duplicateRisks(ids);
      }
    });
  }

  var bulkDeleteBtn = document.getElementById("bulk-delete-risks");
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener("click", function () {
      var ids = self.getSelectedRiskIds();
      if (ids.length > 0) {
        self.showBulkDeleteRisksModal(ids);
      }
    });
  }
};

ERM.riskRegister.updateRisksBulkActions = function () {
  var checkboxes = document.querySelectorAll(".risk-select-checkbox");
  var checkedCount = 0;
  var visibleCount = 0;
  var countedIds = {};

  // Count unique risk IDs (since we have checkboxes in both grid and table)
  for (var i = 0; i < checkboxes.length; i++) {
    var riskId = checkboxes[i].getAttribute("data-risk-id");
    if (countedIds[riskId]) continue;
    countedIds[riskId] = true;

    var card = document.querySelector('.risk-card[data-risk-id="' + riskId + '"]');
    var row = document.querySelector('.risk-row[data-risk-id="' + riskId + '"]');
    var isVisible = (card && card.style.display !== "none") || (row && row.style.display !== "none");

    if (isVisible) {
      visibleCount++;
      if (checkboxes[i].checked) checkedCount++;
    }
  }

  var bulkActions = document.getElementById("risks-bulk-actions");
  var selectedCount = document.getElementById("risks-selected-count");

  if (bulkActions) {
    bulkActions.style.display = checkedCount > 0 ? "flex" : "none";
  }

  if (selectedCount) {
    selectedCount.textContent = checkedCount + " selected";
  }
};

ERM.riskRegister.getSelectedRiskIds = function () {
  var checkboxes = document.querySelectorAll(".risk-select-checkbox:checked");
  var ids = [];
  var seenIds = {};
  for (var i = 0; i < checkboxes.length; i++) {
    var id = checkboxes[i].getAttribute("data-risk-id");
    if (!seenIds[id]) {
      ids.push(id);
      seenIds[id] = true;
    }
  }
  return ids;
};

/* ========================================
   DUPLICATE RISKS
   ======================================== */
ERM.riskRegister.duplicateRisks = function (riskIds) {
  var risks = ERM.storage.get("risks") || [];
  var registers = ERM.storage.get("registers") || [];
  var count = 0;

  for (var i = 0; i < riskIds.length; i++) {
    for (var j = 0; j < risks.length; j++) {
      if (risks[j].id === riskIds[i]) {
        var newRisk = JSON.parse(JSON.stringify(risks[j]));
        newRisk.id = ERM.utils.generateId("risk");
        newRisk.title = newRisk.title + " (copy)";
        newRisk.createdAt = new Date().toISOString();
        newRisk.updatedAt = new Date().toISOString();
        risks.push(newRisk);
        count++;
        break;
      }
    }
  }

  // Update register risk count
  if (this.state.currentRegister) {
    for (var k = 0; k < registers.length; k++) {
      if (registers[k].id === this.state.currentRegister.id) {
        registers[k].riskCount = (registers[k].riskCount || 0) + count;
        break;
      }
    }
    ERM.storage.set("registers", registers);
  }

  ERM.storage.set("risks", risks);
  this.renderRegisterDetail();
  ERM.toast.success(count + " risks duplicated");
};

/* ========================================
   AI REGISTER REVIEW
   ======================================== */
ERM.riskRegister.showAIRegisterReview = function () {
  // Check if user is on paid plan
  var plan = ERM.usageTracker ? ERM.usageTracker.getPlan() : 'FREE';
  if (plan === 'FREE') {
    // Show upgrade modal for free users
    this.showUpgradeModal('portfolio_review');
    return;
  }

  // Directly show the review modal which has its own built-in thinking animation
  this.displayAIRegisterReview();
};

/**
 * Show AI thinking/analyzing modal
 * Uses unified ERM.components.showThinkingModal
 */
ERM.riskRegister.showAIThinkingModal = function (onComplete) {
  ERM.components.showThinkingModal({
    input: "Risk register",
    title: "AI is analyzing your register",
    steps: [
      { text: "Analyzing risk register", delay: 500 },
      { text: "Evaluating risk coverage", delay: 600 },
      { text: "Checking control linkages", delay: 500 },
      { text: "Identifying gaps", delay: 400 },
      { text: "Generating recommendations", delay: 500 },
    ],
    namespace: ERM.riskRegister,
    onComplete: onComplete
  });
};

/**
 * Display AI Portfolio Review - structured consultant-style summary
 */
ERM.riskRegister.displayAIRegisterReview = function () {
  var self = this;
  var register = this.state.currentRegister;
  var risks = ERM.storage.get("risks") || [];
  var controls = ERM.storage.get("controls") || [];
  var registerRisks = risks.filter(function (r) {
    return r.registerId === register.id;
  });

  // Calculate derived scores and gather comprehensive stats
  var analysis = {
    totalRisks: registerRisks.length,
    inherentCritical: 0, inherentHigh: 0, inherentMedium: 0, inherentLow: 0,
    residualCritical: 0, residualHigh: 0, residualMedium: 0, residualLow: 0,
    risksWithoutOwner: 0, risksWithoutControls: 0, risksWithWeakControls: 0,
    escalatedRisks: 0, improved: 0, unchanged: 0, worsened: 0,
    categories: {}, controlTypes: { preventive: 0, detective: 0, corrective: 0 }
  };

  for (var j = 0; j < registerRisks.length; j++) {
    var r = registerRisks[j];
    var iL = parseInt(r.inherentLikelihood) || 3;
    var iI = parseInt(r.inherentImpact) || 3;
    r.inherentScore = iL * iI;
    r.inherentRisk = self.getRiskLevelFromScore(r.inherentScore);

    var rL = parseInt(r.residualLikelihood) || iL;
    var rI = parseInt(r.residualImpact) || iI;
    r.residualScore = rL * rI;
    r.residualRisk = self.getRiskLevelFromScore(r.residualScore);

    // Count inherent levels
    if (r.inherentRisk === "CRITICAL") analysis.inherentCritical++;
    else if (r.inherentRisk === "HIGH") analysis.inherentHigh++;
    else if (r.inherentRisk === "MEDIUM") analysis.inherentMedium++;
    else analysis.inherentLow++;

    // Count residual levels
    if (r.residualRisk === "CRITICAL") analysis.residualCritical++;
    else if (r.residualRisk === "HIGH") analysis.residualHigh++;
    else if (r.residualRisk === "MEDIUM") analysis.residualMedium++;
    else analysis.residualLow++;

    // Governance gaps
    if (!r.owner) analysis.risksWithoutOwner++;
    if (!r.linkedControls || r.linkedControls.length === 0) analysis.risksWithoutControls++;
    if (r.escalationRequired === "yes" || r.escalationRequired === true) analysis.escalatedRisks++;

    // Risk movement
    if (r.residualScore < r.inherentScore) analysis.improved++;
    else if (r.residualScore > r.inherentScore) analysis.worsened++;
    else analysis.unchanged++;

    // Category distribution
    var cat = r.category || "uncategorized";
    analysis.categories[cat] = (analysis.categories[cat] || 0) + 1;

    // Control type analysis
    if (r.linkedControls && r.linkedControls.length > 0) {
      var hasEffective = false;
      for (var c = 0; c < r.linkedControls.length; c++) {
        var ctrl = controls.find(function(x) { return x.id === r.linkedControls[c]; });
        if (ctrl) {
          var t = (ctrl.type || "").toLowerCase();
          if (analysis.controlTypes[t] !== undefined) analysis.controlTypes[t]++;
          if (ctrl.effectiveness === "effective") hasEffective = true;
        }
      }
      if (!hasEffective && r.linkedControls.length > 0) analysis.risksWithWeakControls++;
    }
  }

  // Find top category
  var topCategory = "N/A";
  var topCategoryCount = 0;
  for (var catKey in analysis.categories) {
    if (analysis.categories[catKey] > topCategoryCount) {
      topCategoryCount = analysis.categories[catKey];
      topCategory = catKey;
    }
  }
  var topCategoryPct = analysis.totalRisks > 0 ? Math.round((topCategoryCount / analysis.totalRisks) * 100) : 0;

  // Build thinking steps for loading animation (matching AI risk generation style)
  var thinkingSteps = [
    { text: "Analyzing risk distribution", delay: 500 },
    { text: "Evaluating control coverage", delay: 600 },
    { text: "Assessing risk movement", delay: 500 },
    { text: "Identifying governance gaps", delay: 600 },
    { text: "Generating insights", delay: 400 }
  ];

  var stepsHtml = "";
  for (var s = 0; s < thinkingSteps.length; s++) {
    stepsHtml +=
      '<div class="ai-step" data-step="' + s + '">' +
      '<div class="ai-step-icon">' +
      '<svg class="ai-step-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="50" stroke-linecap="round"/></svg>' +
      '<svg class="ai-step-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
      '</div>' +
      '<span class="ai-step-text">' + thinkingSteps[s].text + '</span>' +
      '<span class="ai-step-dots"><span>.</span><span>.</span><span>.</span></span>' +
      '</div>';
  }

  // Build structured modal content with sections
  var content =
    '<div class="portfolio-review">' +
    // Loading state - using AI thinking style
    '<div id="portfolio-loading" class="ai-thinking-container">' +
    '<div class="ai-thinking-header">' +
    '<div class="ai-brain-animation">' +
    '<div class="ai-brain-circle"></div>' +
    '<div class="ai-brain-circle"></div>' +
    '<div class="ai-brain-circle"></div>' +
    '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
    '</div>' +
    '<h3>Analyzing Portfolio</h3>' +
    '<p class="ai-input-preview">' + (register.name || "Risk Register") + '</p>' +
    '</div>' +
    '<div class="ai-steps-container">' +
    stepsHtml +
    '</div>' +
    '</div>' +
    // Content sections (hidden initially)
    '<div id="portfolio-content" style="display: none;">' +
    // Section 1: Overall Risk Posture (blue)
    '<div class="portfolio-section" style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">' +
    '<h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #1e40af;">Overall Risk Posture</h4>' +
    '<p id="section-posture" style="margin: 0; font-size: 13px; color: #1e3a8a; line-height: 1.7; word-wrap: break-word;"></p>' +
    '</div>' +
    // Section 2: Key Concentrations (gray)
    '<div class="portfolio-section" style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">' +
    '<h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #334155;">Key Concentrations</h4>' +
    '<ul id="section-concentrations" style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;"></ul>' +
    '</div>' +
    // Section 3: Control Coverage (green)
    '<div class="portfolio-section" style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">' +
    '<h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #166534;">Control Coverage Insight</h4>' +
    '<p id="section-controls" style="margin: 0; font-size: 13px; color: #166534; line-height: 1.7; word-wrap: break-word;"></p>' +
    '</div>' +
    // Section 4: Risk Movement (amber)
    '<div class="portfolio-section" style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">' +
    '<h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #92400e;">Risk Movement & Stability</h4>' +
    '<p id="section-movement" style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.7; word-wrap: break-word;"></p>' +
    '</div>' +
    // Section 5: Governance Signals (purple - AI generated)
    '<div class="portfolio-section" style="background: #faf5ff; border-left: 4px solid #8b5cf6; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">' +
    '<h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #6d28d9;">Governance Signals</h4>' +
    '<p id="section-governance" style="margin: 0; font-size: 13px; color: #5b21b6; line-height: 1.7; word-wrap: break-word;"></p>' +
    '</div>' +
    // Footer
    '<p class="portfolio-footer" style="margin: 20px 0 0; font-size: 11px; color: #9ca3af; text-align: center; font-style: italic; padding-top: 12px; border-top: 1px solid #e5e7eb;">This review is based on current risk and control data.</p>' +
    '</div>' +
    '</div>';

  var registerContext = {
    registerName: register.name || "Risk Register",
    total: analysis.totalRisks,
    inherent: { critical: analysis.inherentCritical, high: analysis.inherentHigh, medium: analysis.inherentMedium, low: analysis.inherentLow },
    residual: { critical: analysis.residualCritical, high: analysis.residualHigh, medium: analysis.residualMedium, low: analysis.residualLow },
    noOwner: analysis.risksWithoutOwner,
    noControls: analysis.risksWithoutControls,
    weakControls: analysis.risksWithWeakControls,
    escalated: analysis.escalatedRisks,
    movement: { improved: analysis.improved, unchanged: analysis.unchanged, worsened: analysis.worsened },
    topCategory: topCategory,
    topCategoryPct: topCategoryPct,
    controlTypes: analysis.controlTypes,
    categories: analysis.categories
  };

  ERM.components.showModal({
    title: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 8px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> AI Portfolio Review',
    content: content,
    size: "lg",
    variant: "portfolio",
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
    onOpen: function () {
      self.generatePortfolioReview(registerContext);
    }
  });
};

/**
 * Generate Portfolio Review - populates sections with analysis
 */
ERM.riskRegister.generatePortfolioReview = function (ctx) {
  var self = this;

  // Step delays for animation
  var stepDelays = [500, 600, 500, 600, 400];

  // Animate the thinking steps sequentially
  function animateStep(stepIndex) {
    if (stepIndex >= stepDelays.length) {
      // All steps complete - show the content
      setTimeout(function () {
        self.populatePortfolioContent(ctx);
      }, 300);
      return;
    }

    var stepEl = document.querySelector('.ai-step[data-step="' + stepIndex + '"]');
    if (stepEl) {
      // Mark previous step as complete
      if (stepIndex > 0) {
        var prevStep = document.querySelector('.ai-step[data-step="' + (stepIndex - 1) + '"]');
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
 * Populate portfolio review content after animation
 */
ERM.riskRegister.populatePortfolioContent = function (ctx) {
  var self = this;

  // Mark last step as complete
  var lastStep = document.querySelector('.ai-step[data-step="4"]');
  if (lastStep) {
    lastStep.classList.remove("active");
    lastStep.classList.add("complete");
  }

  // Section 1: Overall Risk Posture (static)
  var posture = "This register contains " + ctx.total + " risks";
  if (ctx.topCategory !== "N/A") {
    posture += ", concentrated primarily in " + self.formatCategory(ctx.topCategory) + " (" + ctx.topCategoryPct + "%).";
  } else {
    posture += ".";
  }

  var highExposure = ctx.inherent.critical + ctx.inherent.high;
  var residualHigh = ctx.residual.critical + ctx.residual.high;
  if (highExposure > 0) {
    posture += " Inherent exposure shows " + highExposure + " high/critical risks";
    if (residualHigh < highExposure) {
      posture += ", reduced to " + residualHigh + " after controls.";
    } else {
      posture += ", with limited reduction after controls.";
    }
  }

  var overallPosture = residualHigh === 0 ? "low" : (residualHigh <= 2 ? "moderate" : "elevated");
  posture += " Overall risk posture is " + overallPosture + ".";

  // Section 2: Key Concentrations (static bullets)
  var concentrations = [];
  if (ctx.topCategoryPct >= 30) {
    concentrations.push(ctx.topCategoryPct + "% of risks fall within " + self.formatCategory(ctx.topCategory) + ".");
  }
  if (ctx.residual.critical > 0 || ctx.residual.high > 0) {
    concentrations.push((ctx.residual.critical + ctx.residual.high) + " risks remain High/Critical after controls.");
  }
  if (ctx.noOwner > 0) {
    concentrations.push(ctx.noOwner + " risk" + (ctx.noOwner > 1 ? "s" : "") + " lack assigned owners.");
  }
  if (ctx.noControls > 0) {
    concentrations.push(ctx.noControls + " risk" + (ctx.noControls > 1 ? "s" : "") + " have no linked controls.");
  }
  if (ctx.weakControls > 0) {
    concentrations.push(ctx.weakControls + " risk" + (ctx.weakControls > 1 ? "s" : "") + " have controls but none rated effective.");
  }
  if (concentrations.length === 0) {
    concentrations.push("Risk distribution appears balanced across categories.");
    concentrations.push("No significant ownership or control gaps identified.");
  }

  // Section 3: Control Coverage (static)
  var totalControls = ctx.controlTypes.preventive + ctx.controlTypes.detective + ctx.controlTypes.corrective;
  var controlText = "";
  if (totalControls === 0) {
    controlText = "No controls are currently linked to risks in this register. Control coverage is a critical gap.";
  } else {
    var dominant = "preventive";
    if (ctx.controlTypes.detective > ctx.controlTypes.preventive) dominant = "detective";
    if (ctx.controlTypes.corrective > ctx.controlTypes[dominant]) dominant = "corrective";
    controlText = "Control coverage relies primarily on " + dominant + " controls (" + ctx.controlTypes[dominant] + " of " + totalControls + " linked).";
    if (ctx.noControls > 0) {
      controlText += " " + ctx.noControls + " risk" + (ctx.noControls > 1 ? "s" : "") + " currently have no linked controls, increasing exposure persistence.";
    }
  }

  // Section 4: Risk Movement (static)
  var movementText = "";
  var unchangedPct = ctx.total > 0 ? Math.round((ctx.movement.unchanged / ctx.total) * 100) : 0;
  if (ctx.movement.improved > 0) {
    movementText = "Risk movement shows " + ctx.movement.improved + " risk" + (ctx.movement.improved > 1 ? "s" : "") + " improved (residual below inherent).";
  }
  if (ctx.movement.unchanged > 0) {
    movementText += (movementText ? " " : "") + unchangedPct + "% of risks show no change between inherent and residual scores.";
  }
  if (ctx.movement.worsened > 0) {
    movementText += (movementText ? " " : "") + ctx.movement.worsened + " risk" + (ctx.movement.worsened > 1 ? "s" : "") + " show increased residual exposure.";
  }
  if (!movementText) {
    movementText = "Insufficient data to assess risk movement trends.";
  }

  // Populate static sections first
  var postureEl = document.getElementById("section-posture");
  var concEl = document.getElementById("section-concentrations");
  var controlsEl = document.getElementById("section-controls");
  var movementEl = document.getElementById("section-movement");

  if (postureEl) postureEl.textContent = posture;
  if (concEl) {
    var bullets = "";
    for (var i = 0; i < concentrations.length; i++) {
      bullets += "<li>" + self.escapeHtmlForReview(concentrations[i]) + "</li>";
    }
    concEl.innerHTML = bullets;
  }
  if (controlsEl) controlsEl.textContent = controlText;
  if (movementEl) movementEl.textContent = movementText;

  // Section 5: Governance Signals (AI generated)
  self.generateGovernanceSignals(ctx, function (governanceText) {
    var govEl = document.getElementById("section-governance");
    if (govEl) govEl.textContent = governanceText;

    // Show content, hide loading
    var loading = document.getElementById("portfolio-loading");
    var content = document.getElementById("portfolio-content");
    if (loading) loading.style.display = "none";
    if (content) content.style.display = "block";
  });
};

/**
 * Format category name for display
 */
ERM.riskRegister.formatCategory = function (cat) {
  if (!cat) return "Uncategorized";
  return cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ");
};

/**
 * Generate AI Governance Signals
 */
ERM.riskRegister.generateGovernanceSignals = function (ctx, callback) {
  // If AI not available, provide static fallback
  if (typeof ERM.aiService === "undefined" || !ERM.aiService.callAPI) {
    var fallback = ERM.riskRegister.getStaticGovernanceSignal(ctx);
    callback(fallback);
    return;
  }

  var prompt =
    "Portfolio: " + ctx.total + " risks | " +
    "Residual Critical/High: " + (ctx.residual.critical + ctx.residual.high) + " | " +
    "No owner: " + ctx.noOwner + " | No controls: " + ctx.noControls + " | " +
    "Escalated: " + ctx.escalated + " | Unchanged: " + ctx.movement.unchanged + "/" + ctx.total + "\n\n" +
    "Write 2 sentences about governance signals. Focus on:\n" +
    "- Whether any risks need escalation based on sustained high residual exposure\n" +
    "- Whether portfolio oversight is adequate\n" +
    "No recommendations. No 'you should'. Just observations. Max 40 words.";

  ERM.aiService.callAPI(
    prompt,
    function (response) {
      if (response && response.success && response.text) {
        callback(response.text);
      } else {
        callback(ERM.riskRegister.getStaticGovernanceSignal(ctx));
      }
    },
    { maxTokens: 100 }
  );
};

/**
 * Static fallback for governance signals
 */
ERM.riskRegister.getStaticGovernanceSignal = function (ctx) {
  var residualHigh = ctx.residual.critical + ctx.residual.high;
  if (ctx.escalated > 0) {
    return ctx.escalated + " risk" + (ctx.escalated > 1 ? "s" : "") + " currently flagged for escalation. Portfolio oversight may be required to ensure risk appetite alignment.";
  } else if (residualHigh > 0 && ctx.noOwner > 0) {
    return "High residual exposure combined with ownership gaps warrants governance attention. Risk appetite alignment may need review.";
  } else if (residualHigh === 0) {
    return "No risks currently exceed high-exposure thresholds. Governance posture appears stable.";
  } else {
    return residualHigh + " risk" + (residualHigh > 1 ? "s" : "") + " with elevated residual exposure. Ongoing monitoring is indicated.";
  }
};

/**
 * Escape HTML for review display
 */
ERM.riskRegister.escapeHtmlForReview = function (str) {
  if (!str) return "";
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

/* ========================================
   HEAT MAP
   ======================================== */
ERM.riskRegister.renderHeatMap = function (type, selectedLikelihood, selectedImpact) {
  var html = '<div class="heat-map-grid">';
  html += '<div class="heat-map-y-label">LIKELIHOOD</div>';

  for (var likelihood = 5; likelihood >= 1; likelihood--) {
    html += '<div class="heat-map-row">';
    html += '<span class="heat-map-row-label">' + likelihood + "</span>";

    for (var impact = 1; impact <= 5; impact++) {
      var score = likelihood * impact;
      var colorClass = this.getHeatMapColorClass(score);
      var isSelected = likelihood == selectedLikelihood && impact == selectedImpact;
      var selectedClass = isSelected ? " selected" : "";

      html += '<div class="heat-map-cell ' + colorClass + selectedClass + '" ' +
        'data-type="' + type + '" data-likelihood="' + likelihood + '" data-impact="' + impact + '" ' +
        "onclick=\"ERM.riskRegister.selectHeatMapCell('" + type + "', " + likelihood + ", " + impact + ')\">' +
        score + "</div>";
    }

    html += "</div>";
  }

  html += '<div class="heat-map-row">';
  html += '<span class="heat-map-row-label"></span>';
  for (var x = 1; x <= 5; x++) {
    html += '<span class="heat-map-x-label">' + x + "</span>";
  }
  html += "</div>";
  html += '<div class="heat-map-x-label-title">IMPACT</div>';
  html += '<div class="heat-map-legend-row">' +
    '<span class="heat-map-legend-item low" title="1-4: Acceptable risk level. Monitor periodically.">Low (1-4)</span>' +
    '<span class="heat-map-legend-item medium" title="5-9: Consider controls. Regular monitoring required.">Medium (5-9)</span>' +
    '<span class="heat-map-legend-item high" title="10-14: Action required. Implement controls promptly.">High (10-14)</span>' +
    '<span class="heat-map-legend-item critical" title="15-25: Immediate action needed. Escalate to leadership.">Critical (15-25)</span>' +
    '</div>';
  html += "</div>";

  return html;
};

ERM.riskRegister.selectHeatMapCell = function (type, likelihood, impact) {
  // Update dropdowns
  var likelihoodSelect = document.getElementById(type + "-likelihood");
  var impactSelect = document.getElementById(type + "-impact");

  if (likelihoodSelect) likelihoodSelect.value = likelihood;
  if (impactSelect) impactSelect.value = impact;

  this.updateHeatMap(type);
};

ERM.riskRegister.updateHeatMap = function (type) {
  var likelihoodSelect = document.getElementById(type + "-likelihood");
  var impactSelect = document.getElementById(type + "-impact");
  var scoreEl = document.getElementById(type + "-score");
  var levelEl = document.getElementById(type + "-level");
  var heatmapContainer = document.getElementById(type + "-heatmap");

  if (!likelihoodSelect || !impactSelect) return;

  var likelihood = parseInt(likelihoodSelect.value, 10);
  var impact = parseInt(impactSelect.value, 10);
  var score = likelihood * impact;

  // For residual risk, consider control effectiveness
  if (type === "residual") {
    var controlAdjustment = this.calculateControlEffectiveness();
    if (controlAdjustment > 0 && score > 0) {
      // Each control reduces score by up to 15%, max reduction 50%
      var reductionPercent = Math.min(controlAdjustment * 0.15, 0.50);
      score = Math.max(1, Math.round(score * (1 - reductionPercent)));
    }
  }

  var level = this.getRiskLevelFromScore(score);
  var levelClass = this.getRiskLevelClass(score);

  if (scoreEl) scoreEl.textContent = score;
  if (levelEl) {
    levelEl.textContent = level;
    levelEl.className = "risk-level-badge " + levelClass;
  }

  if (heatmapContainer) {
    heatmapContainer.innerHTML = this.renderHeatMap(type, likelihood, impact);
  }
};

/**
 * Calculate effectiveness factor from linked controls
 * Returns the number of effective controls linked
 */
ERM.riskRegister.calculateControlEffectiveness = function () {
  var effectiveCount = 0;
  var controlCheckboxes = document.querySelectorAll('input[name="linkedControl"]:checked');

  if (!controlCheckboxes || controlCheckboxes.length === 0) {
    return 0;
  }

  // Get all controls to check their effectiveness
  var allControls = ERM.storage.get("controls") || [];
  var controlMap = {};
  for (var i = 0; i < allControls.length; i++) {
    controlMap[allControls[i].id] = allControls[i];
  }

  // Count effective controls
  for (var j = 0; j < controlCheckboxes.length; j++) {
    var controlId = controlCheckboxes[j].getAttribute("data-control-id");
    var control = controlMap[controlId];

    if (control) {
      // Weight by effectiveness: effective=1.0, partially-effective=0.5, ineffective/not-tested=0.25
      if (control.effectiveness === "effective") {
        effectiveCount += 1.0;
      } else if (control.effectiveness === "partially-effective") {
        effectiveCount += 0.5;
      } else {
        effectiveCount += 0.25;
      }
    } else {
      // Control exists in checkbox but not in storage, still count it
      effectiveCount += 0.5;
    }
  }

  return effectiveCount;
};

/* ========================================
   EXPORTS
   ======================================== */
window.ERM = ERM;
console.log("risk-register-detail.js loaded");

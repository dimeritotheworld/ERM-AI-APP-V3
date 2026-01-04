/**
 * Dimeri ERM - Risk Register Module
 * Comprehensive ISO 31000 & COSO Aligned Risk Management
 *
 * @version 2.3.0
 * ES5 Compatible
 */

console.log("Loading risk-register.js...");

var ERM = window.ERM || {};
ERM.riskRegister = ERM.riskRegister || {};

/* ========================================
   STATE
   ======================================== */
ERM.riskRegister.state = {
  currentRegister: null,
  viewMode: "list",
  editingRiskId: null,
  filters: {
    search: "",
    category: "",
    level: "",
    status: "",
  },
};

/* ========================================
   CATEGORIES (COSO Framework)
   ======================================== */
ERM.riskRegister.categories = [
  { value: "strategic", label: "Strategic Risk" },
  { value: "financial", label: "Financial Risk" },
  { value: "operational", label: "Operational Risk" },
  { value: "compliance", label: "Compliance Risk" },
  { value: "technology", label: "Technology/Cyber Risk" },
  { value: "reputational", label: "Reputational Risk" },
  { value: "health-safety", label: "Health & Safety Risk" },
  { value: "environmental", label: "Environmental Risk" },
];

/* ========================================
   ICONS (Inline SVG)
   ======================================== */
ERM.riskRegister.icons = {
  info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  close:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  search:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  moreVertical:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
  edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  userPlus:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
  download:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  trash:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  chevronLeft:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>',
  alertTriangle:
    '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  sparkles:
    '<svg class="ai-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
};

/* ========================================
   INITIALIZATION
   ======================================== */
ERM.riskRegister.init = function () {
  console.log("Initializing Risk Register module...");
  this.state.viewMode = "list";
  this.state.currentRegister = null;
  this.state.editingRiskId = null;
  this.renderRegisterList();
};

/* ========================================
   REGISTER LIST VIEW
   ======================================== */
ERM.riskRegister.renderRegisterList = function () {
  var self = this;
  var viewContainer = document.getElementById("view-risk-register");
  if (!viewContainer) return;

  this.state.viewMode = "list";
  this.state.currentRegister = null;

  var registers = ERM.storage.get("registers") || [];
  var bannerDismissed = ERM.storage.get("freePlanBannerDismissed") || false;
  var currentUser = ERM.state.user || { name: "User" };

  // Banner HTML
  var bannerHtml = "";
  if (!bannerDismissed) {
    bannerHtml =
      '<div class="info-banner" id="free-plan-banner">' +
      '<div class="info-banner-content">' +
      '<span class="info-banner-icon-circle">' +
      this.icons.info +
      "</span>" +
      '<span class="info-banner-text">You can create up to <strong>5 risk registers</strong> on the free plan. <a href="upgrade.html?source=register_limit">Upgrade for unlimited</a></span>' +
      "</div>" +
      '<button class="info-banner-close" id="dismiss-banner">' +
      this.icons.close +
      "</button>" +
      "</div>";
  }

  // Register cards
  var registersHtml = "";
  if (registers.length === 0) {
    registersHtml =
      '<div class="empty-state">' +
      '<div class="empty-state-icon">📋</div>' +
      '<h3 class="empty-state-title">No Risk Registers Yet</h3>' +
      '<p class="empty-state-desc">Create your first risk register to start tracking and managing risks</p>' +
      '<button class="btn btn-primary" id="empty-create-register">' +
      this.icons.plus +
      " Create Risk Register</button>" +
      "</div>";
  } else {
    for (var i = 0; i < registers.length; i++) {
      var reg = registers[i];
      var createdDate = ERM.utils.formatDate(reg.createdAt, "short");
      var initial = (reg.name || "R").charAt(0).toUpperCase();
      var createdBy = reg.createdBy || currentUser.name;

      registersHtml +=
        '<div class="register-card" data-register-id="' +
        reg.id +
        '">' +
        '<div class="register-card-header">' +
        '<div class="register-card-left">' +
        '<label class="checkbox-wrapper register-checkbox" onclick="event.stopPropagation();">' +
        '<input type="checkbox" class="register-select-checkbox" data-register-id="' +
        reg.id +
        '">' +
        '<span class="checkbox-custom"></span>' +
        "</label>" +
        '<div class="register-icon">' +
        initial +
        "</div>" +
        '<div class="register-info">' +
        '<h4 class="register-card-title">' +
        ERM.utils.escapeHtml(reg.name) +
        "</h4>" +
        '<div class="register-card-meta">' +
        "<span>" +
        createdDate +
        "</span>" +
        "<span>•</span>" +
        "<span>" +
        (reg.riskCount || 0) +
        " risks</span>" +
        "<span>•</span>" +
        "<span>Created by " +
        ERM.utils.escapeHtml(createdBy) +
        "</span>" +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="register-card-actions">' +
        '<button class="btn btn-secondary btn-sm open-register-btn" data-register-id="' +
        reg.id +
        '">Open</button>' +
        '<div class="dropdown">' +
        '<button class="btn-icon register-menu-btn" data-register-id="' +
        reg.id +
        '">' +
        this.icons.moreVertical +
        "</button>" +
        '<div class="dropdown-menu register-dropdown" id="register-menu-' +
        reg.id +
        '">' +
        '<a href="#" class="dropdown-item" data-action="rename" data-register-id="' +
        reg.id +
        '">' +
        this.icons.edit +
        "<span>Rename</span></a>" +
        '<a href="#" class="dropdown-item" data-action="duplicate" data-register-id="' +
        reg.id +
        '">' +
        this.icons.copy +
        "<span>Duplicate</span></a>" +
        '<a href="#" class="dropdown-item" data-action="invite" data-register-id="' +
        reg.id +
        '">' +
        this.icons.userPlus +
        "<span>Invite Team</span></a>" +
        '<a href="#" class="dropdown-item" data-action="export" data-register-id="' +
        reg.id +
        '">' +
        this.icons.download +
        "<span>Export</span></a>" +
        '<div class="dropdown-divider"></div>' +
        '<a href="#" class="dropdown-item danger" data-action="delete" data-register-id="' +
        reg.id +
        '">' +
        this.icons.trash +
        "<span>Delete</span></a>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>";
    }
  }

  // Bulk actions header
  var bulkActionsHtml =
    registers.length > 0
      ? '<div class="registers-bulk-header" id="registers-bulk-header">' +
        '<div class="registers-bulk-left">' +
        '<label class="checkbox-wrapper" id="select-all-registers-wrapper">' +
        '<input type="checkbox" id="select-all-registers">' +
        '<span class="checkbox-custom"></span>' +
        "</label>" +
        '<span class="registers-count">' +
        registers.length +
        " register" +
        (registers.length !== 1 ? "s" : "") +
        "</span>" +
        '<div class="bulk-actions" id="registers-bulk-actions" style="display: none;">' +
        '<span class="selected-count" id="registers-selected-count">0 selected</span>' +
        '<button class="btn btn-secondary btn-sm" id="bulk-export-registers">' +
        this.icons.download +
        " Export</button>" +
        '<button class="btn btn-danger btn-sm" id="bulk-delete-registers">' +
        this.icons.trash +
        " Delete</button>" +
        "</div>" +
        "</div>" +
        "</div>"
      : "";

  var html =
    '<div class="page-header">' +
    '<div class="page-header-top">' +
    '<div class="page-header-content">' +
    '<h1 class="page-title">Risk Registers</h1>' +
    '<p class="page-subtitle">Manage your organization\'s risk registers</p>' +
    "</div>" +
    '<div class="page-header-actions">' +
    '<button class="btn btn-primary" id="create-register-btn">' +
    this.icons.plus +
    " Create New Register</button>" +
    "</div>" +
    "</div>" +
    "</div>" +
    bannerHtml +
    bulkActionsHtml +
    '<div class="registers-list" id="registers-list">' +
    registersHtml +
    "</div>";

  viewContainer.innerHTML = html;
  this.initListEvents();
};

/* ========================================
   LIST VIEW EVENTS
   ======================================== */
ERM.riskRegister.initListEvents = function () {
  var self = this;

  // Create register button
  var createBtn = document.getElementById("create-register-btn");
  if (createBtn) {
    createBtn.addEventListener("click", function () {
      self.showCreateModal();
    });
  }

  // Empty state create button
  var emptyCreateBtn = document.getElementById("empty-create-register");
  if (emptyCreateBtn) {
    emptyCreateBtn.addEventListener("click", function () {
      self.showCreateModal();
    });
  }

  // Dismiss banner
  var dismissBtn = document.getElementById("dismiss-banner");
  if (dismissBtn) {
    dismissBtn.addEventListener("click", function () {
      var banner = document.getElementById("free-plan-banner");
      if (banner) {
        banner.style.display = "none";
        ERM.storage.set("freePlanBannerDismissed", true);
      }
    });
  }

  // Select all registers
  var selectAll = document.getElementById("select-all-registers");
  if (selectAll) {
    selectAll.addEventListener("change", function () {
      var checkboxes = document.querySelectorAll(".register-select-checkbox");
      for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = this.checked;
      }
      self.updateRegistersBulkActions();
    });
  }

  // Individual checkboxes
  var checkboxes = document.querySelectorAll(".register-select-checkbox");
  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener("change", function () {
      self.updateRegistersBulkActions();
    });
  }

  // Open register button
  var openBtns = document.querySelectorAll(".open-register-btn");
  for (var j = 0; j < openBtns.length; j++) {
    openBtns[j].addEventListener("click", function (e) {
      e.stopPropagation();
      var regId = this.getAttribute("data-register-id");
      self.openRegister(regId);
    });
  }

  // Register card click
  var cards = document.querySelectorAll(".register-card");
  for (var k = 0; k < cards.length; k++) {
    cards[k].addEventListener("click", function (e) {
      if (
        e.target.closest(".checkbox-wrapper") ||
        e.target.closest(".register-menu-btn") ||
        e.target.closest(".dropdown-menu") ||
        e.target.closest(".open-register-btn")
      ) {
        return;
      }
      var regId = this.getAttribute("data-register-id");
      self.openRegister(regId);
    });
  }

  // Register menu buttons
  var menuBtns = document.querySelectorAll(".register-menu-btn");
  for (var l = 0; l < menuBtns.length; l++) {
    menuBtns[l].addEventListener("click", function (e) {
      e.stopPropagation();
      var regId = this.getAttribute("data-register-id");
      var menu = document.getElementById("register-menu-" + regId);
      var parentCard = this.closest(".register-card");

      // Close other menus and remove active class from other cards
      var allMenus = document.querySelectorAll(".dropdown-menu");
      var allCards = document.querySelectorAll(".register-card");
      for (var m = 0; m < allMenus.length; m++) {
        if (allMenus[m] !== menu) {
          allMenus[m].classList.remove("show");
        }
      }
      for (var mc = 0; mc < allCards.length; mc++) {
        if (allCards[mc] !== parentCard) {
          allCards[mc].classList.remove("dropdown-active");
        }
      }

      if (menu) {
        menu.classList.toggle("show");
        if (parentCard) {
          parentCard.classList.toggle(
            "dropdown-active",
            menu.classList.contains("show")
          );
        }
      }
    });
  }

  // Dropdown menu items
  var menuItems = document.querySelectorAll(".dropdown-item[data-action]");
  for (var n = 0; n < menuItems.length; n++) {
    menuItems[n].addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var action = this.getAttribute("data-action");
      var regId = this.getAttribute("data-register-id");
      self.handleRegisterAction(action, regId);

      var menu = this.closest(".dropdown-menu");
      var card = this.closest(".register-card");
      if (menu) menu.classList.remove("show");
      if (card) card.classList.remove("dropdown-active");
    });
  }

  // Close menus on outside click
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".dropdown")) {
      var menus = document.querySelectorAll(".dropdown-menu.show");
      var cards = document.querySelectorAll(".register-card.dropdown-active");
      for (var o = 0; o < menus.length; o++) {
        menus[o].classList.remove("show");
      }
      for (var oc = 0; oc < cards.length; oc++) {
        cards[oc].classList.remove("dropdown-active");
      }
    }
  });

  // Bulk delete
  var bulkDeleteBtn = document.getElementById("bulk-delete-registers");
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener("click", function () {
      var ids = self.getSelectedRegisterIds();
      if (ids.length > 0) {
        self.showBulkDeleteRegistersModal(ids);
      }
    });
  }
};

/* ========================================
   BULK ACTIONS
   ======================================== */
ERM.riskRegister.updateRegistersBulkActions = function () {
  var checkboxes = document.querySelectorAll(".register-select-checkbox");
  var checkedCount = 0;

  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) checkedCount++;
  }

  var bulkActions = document.getElementById("registers-bulk-actions");
  var selectedCount = document.getElementById("registers-selected-count");
  var selectAll = document.getElementById("select-all-registers");

  if (bulkActions) {
    bulkActions.style.display = checkedCount > 0 ? "flex" : "none";
  }

  if (selectedCount) {
    selectedCount.textContent = checkedCount + " selected";
  }

  if (selectAll) {
    selectAll.checked =
      checkedCount === checkboxes.length && checkboxes.length > 0;
    selectAll.indeterminate =
      checkedCount > 0 && checkedCount < checkboxes.length;
  }
};

ERM.riskRegister.getSelectedRegisterIds = function () {
  var checkboxes = document.querySelectorAll(
    ".register-select-checkbox:checked"
  );
  var ids = [];
  for (var i = 0; i < checkboxes.length; i++) {
    ids.push(checkboxes[i].getAttribute("data-register-id"));
  }
  return ids;
};

/* ========================================
   REGISTER ACTIONS
   ======================================== */
ERM.riskRegister.handleRegisterAction = function (action, registerId) {
  var registers = ERM.storage.get("registers") || [];
  var register = null;

  for (var i = 0; i < registers.length; i++) {
    if (registers[i].id === registerId) {
      register = registers[i];
      break;
    }
  }

  if (!register) return;

  switch (action) {
    case "rename":
      this.showRenameModal(register);
      break;
    case "duplicate":
      this.duplicateRegister(register);
      break;
    case "invite":
      if (ERM.team && ERM.team.showInviteModal) {
        ERM.team.showInviteModal({
          title: "Invite to " + register.name,
          contextType: "register",
          contextId: register.id,
          contextName: register.name
        });
      }
      break;
    case "export":
      ERM.toast.info("Export feature coming soon");
      break;
    case "delete":
      this.showDeleteRegisterModal(register);
      break;
  }
};

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
        for (var i = 0; i < registers.length; i++) {
          if (registers[i].id === register.id) {
            registers[i].name = newName;
            break;
          }
        }
        ERM.storage.set("registers", registers);
        ERM.components.closeModal();
        self.renderRegisterList();
        ERM.toast.success("Register renamed");
      }
    },
  });
};

ERM.riskRegister.duplicateRegister = function (register) {
  var self = this;
  var registers = ERM.storage.get("registers") || [];
  var risks = ERM.storage.get("risks") || [];

  // Generate unique copy name
  var baseName = register.name.replace(/ \(copy( \d+)?\)$/, "");
  var copyNum = 1;
  var newName = baseName + " (copy)";

  var nameExists = function (name) {
    for (var i = 0; i < registers.length; i++) {
      if (registers[i].name === name) return true;
    }
    return false;
  };

  while (nameExists(newName)) {
    copyNum++;
    newName = baseName + " (copy " + copyNum + ")";
  }

  // Create new register
  var newRegister = {
    id: ERM.utils.generateId("reg"),
    name: newName,
    template: register.template,
    createdAt: new Date().toISOString(),
    createdBy: (ERM.state.user && ERM.state.user.name) || "User",
    riskCount: 0,
  };

  // Copy risks
  var newRisks = [];
  for (var j = 0; j < risks.length; j++) {
    if (risks[j].registerId === register.id) {
      var newRisk = JSON.parse(JSON.stringify(risks[j]));
      newRisk.id = ERM.utils.generateId("risk");
      newRisk.registerId = newRegister.id;
      newRisk.createdAt = new Date().toISOString();
      newRisks.push(newRisk);
    }
  }

  newRegister.riskCount = newRisks.length;
  registers.push(newRegister);

  for (var k = 0; k < newRisks.length; k++) {
    risks.push(newRisks[k]);
  }

  ERM.storage.set("registers", registers);
  ERM.storage.set("risks", risks);

  this.renderRegisterList();
  ERM.toast.success("Register duplicated");
};

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

ERM.riskRegister.deleteRegister = function (registerId) {
  var registers = ERM.storage.get("registers") || [];
  var risks = ERM.storage.get("risks") || [];

  registers = registers.filter(function (r) {
    return r.id !== registerId;
  });
  risks = risks.filter(function (r) {
    return r.registerId !== registerId;
  });

  ERM.storage.set("registers", registers);
  ERM.storage.set("risks", risks);

  this.renderRegisterList();
  ERM.toast.success("Register deleted");
};

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
   CREATE REGISTER MODALS
   ======================================== */
ERM.riskRegister.showCreateModal = function () {
  var self = this;

  var content =
    '<div class="option-cards">' +
    '<div class="option-card" data-option="scratch">' +
    '<div class="option-card-icon">📝</div>' +
    '<div class="option-card-title">Start from Scratch</div>' +
    '<div class="option-card-desc">Create an empty register</div>' +
    "</div>" +
    '<div class="option-card" data-option="template">' +
    '<div class="option-card-icon">📋</div>' +
    '<div class="option-card-title">Use a Template</div>' +
    '<div class="option-card-desc">Pre-populated with industry risks</div>' +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: "Create Risk Register",
    content: content,
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      var options = document.querySelectorAll(".option-card");
      for (var i = 0; i < options.length; i++) {
        options[i].addEventListener("click", function () {
          var option = this.getAttribute("data-option");
          ERM.components.closeModal();
          setTimeout(function () {
            if (option === "scratch") {
              self.showNameRegisterModal(null);
            } else {
              self.showTemplateModal();
            }
          }, 250);
        });
      }
    },
  });
};

ERM.riskRegister.showTemplateModal = function () {
  var self = this;

  var templates = [
    { id: "banking", name: "Banking & Finance", icon: "🏦" },
    { id: "mining", name: "Mining & Resources", icon: "⛏️" },
    { id: "telecom", name: "Telecommunications", icon: "📡" },
    { id: "healthcare", name: "Healthcare", icon: "🏥" },
    { id: "public", name: "Public Sector", icon: "🏛️" },
    { id: "manufacturing", name: "Manufacturing", icon: "🏭" },
  ];

  var content =
    '<p class="template-note success">Templates include 12 pre-populated risks based on industry best practices.</p>' +
    '<div class="template-grid">';

  for (var i = 0; i < templates.length; i++) {
    var t = templates[i];
    content +=
      '<div class="template-card" data-template="' +
      t.id +
      '">' +
      '<div class="template-card-icon">' +
      t.icon +
      "</div>" +
      '<div class="template-card-title">' +
      t.name +
      "</div>" +
      "</div>";
  }

  content += "</div>";

  ERM.components.showModal({
    title: "Select Industry Template",
    content: content,
    buttons: [
      { label: "Back", type: "secondary", action: "back" },
      { label: "Cancel", type: "ghost", action: "close" },
    ],
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

ERM.riskRegister.showNameRegisterModal = function (templateId) {
  var self = this;
  var placeholder = templateId
    ? "e.g., " +
      templateId.charAt(0).toUpperCase() +
      templateId.slice(1) +
      " Risk Register 2025"
    : "e.g., Corporate Risk Register 2025";

  var content =
    '<div class="form-group">' +
    '<label class="form-label">Register Name</label>' +
    '<input type="text" class="form-input" id="register-name-input" placeholder="' +
    placeholder +
    '">' +
    '<p class="form-hint">Give your register a unique, descriptive name</p>' +
    "</div>";

  ERM.components.showModal({
    title: "Name Your Register",
    content: content,
    buttons: [
      { label: "Back", type: "secondary", action: "back" },
      { label: "Create Register", type: "primary", action: "create" },
    ],
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
        var input = document.getElementById("register-name-input");
        var name = input ? input.value.trim() : "";

        if (!name) {
          ERM.toast.error("Please enter a register name");
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

        // Create register
        var newRegister = {
          id: ERM.utils.generateId("reg"),
          name: name,
          template: templateId,
          createdAt: new Date().toISOString(),
          createdBy: (ERM.state.user && ERM.state.user.name) || "User",
          riskCount: 0,
        };

        registers.push(newRegister);
        ERM.storage.set("registers", registers);

        // Generate template risks if applicable
        if (templateId) {
          self.generateTemplateRisks(newRegister.id, templateId);
        }

        ERM.components.closeModal();
        self.renderRegisterList();
        ERM.toast.success("Register created successfully");
      }
    },
  });
};

/* ========================================
   TEMPLATE RISK GENERATION
   ======================================== */
ERM.riskRegister.generateTemplateRisks = function (registerId, templateId) {
  var risks = ERM.storage.get("risks") || [];
  var registers = ERM.storage.get("registers") || [];

  // Get template risks from templates.js
  var templateRisks = [];
  if (typeof ERM.templates !== "undefined" && ERM.templates[templateId]) {
    templateRisks = ERM.templates[templateId].risks || [];
  }

  // Create risk records
  for (var i = 0; i < templateRisks.length; i++) {
    var tr = templateRisks[i];
    var inherentScore = (tr.inherentLikelihood || 3) * (tr.inherentImpact || 3);
    var residualScore = (tr.residualLikelihood || 2) * (tr.residualImpact || 2);

    risks.push({
      id: ERM.utils.generateId("risk"),
      registerId: registerId,
      title: tr.title,
      description: tr.description || "",
      category: tr.category || "operational",
      owner: tr.owner || "",
      strategicObjective: tr.strategicObjective || "",
      causes: tr.causes || [],
      consequences: tr.consequences || [],
      inherentLikelihood: tr.inherentLikelihood || 3,
      inherentImpact: tr.inherentImpact || 3,
      inherentScore: inherentScore,
      inherentRisk: this.getRiskLevelFromScore(inherentScore),
      residualLikelihood: tr.residualLikelihood || 2,
      residualImpact: tr.residualImpact || 2,
      residualScore: residualScore,
      residualRisk: this.getRiskLevelFromScore(residualScore),
      treatment: tr.treatment || "Mitigate",
      status: tr.status || "Open",
      linkedControls: [],
      reviewDate: null,
      actionPlan: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Update register risk count
  for (var j = 0; j < registers.length; j++) {
    if (registers[j].id === registerId) {
      registers[j].riskCount = templateRisks.length;
      break;
    }
  }

  ERM.storage.set("risks", risks);
  ERM.storage.set("registers", registers);
};

/* ========================================
   OPEN REGISTER (Detail View)
   ======================================== */
ERM.riskRegister.openRegister = function (registerId) {
  var registers = ERM.storage.get("registers") || [];
  var register = null;

  for (var i = 0; i < registers.length; i++) {
    if (registers[i].id === registerId) {
      register = registers[i];
      break;
    }
  }

  if (!register) {
    ERM.toast.error("Register not found");
    return;
  }

  this.state.currentRegister = register;
  this.state.viewMode = "detail";
  this.renderRegisterDetail();
};

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

  // Filter bar
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
    filterBarHtml +=
      '<option value="' +
      this.categories[c].value +
      '">' +
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
    "</div>" +
    "</div>";

  // Risks table
  // Floating bulk actions bar (appears when items selected)
  var bulkActionsBarHtml =
    '<div class="bulk-actions-bar" id="risks-bulk-actions" style="display: none;">' +
    '<span class="bulk-selected-count" id="risks-selected-count">0 selected</span>' +
    '<div class="bulk-actions-buttons">' +
    '<button class="bulk-action-btn" id="bulk-edit-risks">' +
    this.icons.edit +
    " Edit</button>" +
    '<button class="bulk-action-btn" id="bulk-duplicate-risks">' +
    this.icons.copy +
    " Duplicate</button>" +
    '<button class="bulk-action-btn danger" id="bulk-delete-risks">' +
    this.icons.trash +
    " Delete</button>" +
    "</div>" +
    "</div>";

  var tableHtml =
    '<div class="risks-table-container">' +
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
        '<div class="owner-cell-container">' +
        '<span class="owner-text">' +
        ERM.utils.escapeHtml(risk.owner || "-") +
        "</span>" +
        '<div class="owner-cell-actions">' +
        '<button class="btn-notify-upgrade notify-owner-btn" data-risk-id="' +
        risk.id +
        '">' +
        this.icons.bell +
        " Notify</button>" +
        '<button class="btn-notify-upgrade add-owner-btn" data-risk-id="' +
        risk.id +
        '" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-color: #86efac; color: #16a34a;">' +
        this.icons.plus +
        " Add</button>" +
        "</div>" +
        "</div>" +
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

  // Updated header with AI Review button and options menu
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
    '<button class="btn btn-ai-primary" id="ai-review-register-btn">' +
    this.icons.sparkles +
    " AI Review" +
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
    '<a href="#" class="dropdown-item" data-action="import">' +
    this.icons.upload +
    "<span>Import</span>" +
    "</a>" +
    '<div class="dropdown-divider"></div>' +
    '<a href="#" class="dropdown-item" data-action="modify">' +
    this.icons.edit +
    "<span>Modify Register</span>" +
    "</a>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    filterBarHtml +
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
      optionsMenu.classList.toggle("show");
    });

    // Menu item actions
    var menuItems = optionsMenu.querySelectorAll(".dropdown-item");
    for (var i = 0; i < menuItems.length; i++) {
      menuItems[i].addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var action = this.getAttribute("data-action");
        optionsMenu.classList.remove("show");

        switch (action) {
          case "export":
            self.showExportModal();
            break;
          case "import":
            self.showImportModal();
            break;
          case "modify":
            self.showModifyRegisterModal();
            break;
        }
      });
    }
  }

  // Close options menu on outside click
  document.addEventListener("click", function (e) {
    if (
      optionsMenu &&
      !e.target.closest("#register-options-btn") &&
      !e.target.closest("#register-options-menu")
    ) {
      optionsMenu.classList.remove("show");
    }
  });

  // Filter handlers
  this.initFilterHandlers();

  // Risk row click
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

  // Notify owner buttons
  var notifyBtns = document.querySelectorAll(".notify-owner-btn");
  for (var n = 0; n < notifyBtns.length; n++) {
    notifyBtns[n].addEventListener("click", function (e) {
      e.stopPropagation();
      var riskId = this.getAttribute("data-risk-id");
      self.showNotifyOwnerPopup(riskId);
    });
  }

  // Add owner buttons
  var addOwnerBtns = document.querySelectorAll(".add-owner-btn");
  for (var a = 0; a < addOwnerBtns.length; a++) {
    addOwnerBtns[a].addEventListener("click", function (e) {
      e.stopPropagation();
      var riskId = this.getAttribute("data-risk-id");
      self.showAddOwnerPopup(riskId);
    });
  }

  // Risk checkboxes
  this.initRiskCheckboxHandlers();
};

/* ========================================
   AI REGISTER REVIEW
   ======================================== */
ERM.riskRegister.showAIRegisterReview = function () {
  var self = this;
  var register = this.state.currentRegister;
  var risks = ERM.storage.get("risks") || [];
  var registerRisks = risks.filter(function (r) {
    return r.registerId === register.id;
  });

  // Analyze register
  var analysis = {
    totalRisks: registerRisks.length,
    criticalRisks: 0,
    highRisks: 0,
    mediumRisks: 0,
    lowRisks: 0,
    risksWithoutOwner: 0,
    risksWithoutDescription: 0,
    risksWithoutControls: 0,
    categories: {},
    issues: [],
    recommendations: [],
  };

  for (var i = 0; i < registerRisks.length; i++) {
    var risk = registerRisks[i];

    // Count by level
    if (risk.inherentRisk === "CRITICAL") analysis.criticalRisks++;
    else if (risk.inherentRisk === "HIGH") analysis.highRisks++;
    else if (risk.inherentRisk === "MEDIUM") analysis.mediumRisks++;
    else analysis.lowRisks++;

    // Count issues
    if (!risk.owner) analysis.risksWithoutOwner++;
    if (!risk.description) analysis.risksWithoutDescription++;
    if (!risk.linkedControls || risk.linkedControls.length === 0)
      analysis.risksWithoutControls++;

    // Count by category
    var cat = risk.category || "uncategorized";
    analysis.categories[cat] = (analysis.categories[cat] || 0) + 1;
  }

  // Generate issues
  if (analysis.risksWithoutOwner > 0) {
    analysis.issues.push(
      analysis.risksWithoutOwner + " risks have no assigned owner"
    );
  }
  if (analysis.risksWithoutDescription > 0) {
    analysis.issues.push(
      analysis.risksWithoutDescription + " risks are missing descriptions"
    );
  }
  if (analysis.risksWithoutControls > 0) {
    analysis.issues.push(
      analysis.risksWithoutControls + " risks have no linked controls"
    );
  }
  if (analysis.criticalRisks > 0) {
    analysis.issues.push(
      analysis.criticalRisks + " critical risks require immediate attention"
    );
  }

  // Generate recommendations
  if (analysis.totalRisks === 0) {
    analysis.recommendations.push(
      "Start by adding risks using AI suggestions or templates"
    );
  }
  if (analysis.risksWithoutOwner > 0) {
    analysis.recommendations.push(
      "Assign owners to all risks for accountability"
    );
  }
  if (analysis.risksWithoutControls > 0) {
    analysis.recommendations.push("Link controls to mitigate identified risks");
  }
  if (analysis.criticalRisks > 2) {
    analysis.recommendations.push(
      "Consider risk treatment plans for critical risks"
    );
  }

  // Calculate score
  var score = 100;
  score -= analysis.risksWithoutOwner * 5;
  score -= analysis.risksWithoutDescription * 3;
  score -= analysis.risksWithoutControls * 5;
  score -= analysis.criticalRisks * 2;
  score = Math.max(0, Math.min(100, score));

  var scoreClass = score >= 80 ? "good" : score >= 60 ? "fair" : "poor";
  var scoreLabel =
    score >= 80
      ? "Good"
      : score >= 60
      ? "Needs Improvement"
      : "Requires Attention";

  // Build modal content
  var content =
    '<div class="ai-register-review">' +
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
    '<div class="ai-review-stats">' +
    '<div class="ai-stat"><span class="ai-stat-value">' +
    analysis.totalRisks +
    '</span><span class="ai-stat-label">Total Risks</span></div>' +
    '<div class="ai-stat critical"><span class="ai-stat-value">' +
    analysis.criticalRisks +
    '</span><span class="ai-stat-label">Critical</span></div>' +
    '<div class="ai-stat high"><span class="ai-stat-value">' +
    analysis.highRisks +
    '</span><span class="ai-stat-label">High</span></div>' +
    '<div class="ai-stat medium"><span class="ai-stat-value">' +
    analysis.mediumRisks +
    '</span><span class="ai-stat-label">Medium</span></div>' +
    '<div class="ai-stat low"><span class="ai-stat-value">' +
    analysis.lowRisks +
    '</span><span class="ai-stat-label">Low</span></div>' +
    "</div>" +
    "</div>";

  if (analysis.issues.length > 0) {
    content +=
      '<div class="ai-review-section warning"><h5>Issues Found (' +
      analysis.issues.length +
      ")</h5><ul>";
    for (var j = 0; j < analysis.issues.length; j++) {
      content += "<li>" + analysis.issues[j] + "</li>";
    }
    content += "</ul></div>";
  }

  if (analysis.recommendations.length > 0) {
    content +=
      '<div class="ai-review-section info"><h5>AI Recommendations</h5><ul>';
    for (var k = 0; k < analysis.recommendations.length; k++) {
      content += "<li>" + analysis.recommendations[k] + "</li>";
    }
    content += "</ul></div>";
  }

  if (analysis.issues.length === 0 && analysis.totalRisks > 0) {
    content +=
      '<div class="ai-review-section success"><h5>Excellent!</h5><p>Your register is well-maintained with comprehensive risk documentation.</p></div>';
  }

  content += "</div>";

  ERM.components.showModal({
    title: this.icons.sparkles + " AI Register Review",
    content: content,
    size: "lg",
    buttons: [{ label: "Close", type: "secondary", action: "close" }],
  });
};

/* ========================================
   EXPORT MODAL
   ======================================== */
ERM.riskRegister.showExportModal = function () {
  var content =
    '<div class="export-options">' +
    '<p class="text-secondary">Choose export format for "' +
    ERM.utils.escapeHtml(this.state.currentRegister.name) +
    '":</p>' +
    '<div class="option-cards">' +
    '<div class="option-card" data-format="csv">' +
    '<div class="option-card-icon">📊</div>' +
    '<div class="option-card-title">CSV</div>' +
    '<div class="option-card-desc">Excel compatible</div>' +
    "</div>" +
    '<div class="option-card" data-format="pdf">' +
    '<div class="option-card-icon">📄</div>' +
    '<div class="option-card-title">PDF</div>' +
    '<div class="option-card-desc">Board-ready report</div>' +
    "</div>" +
    '<div class="option-card" data-format="json">' +
    '<div class="option-card-icon">📋</div>' +
    '<div class="option-card-title">JSON</div>' +
    '<div class="option-card-desc">Data backup</div>' +
    "</div>" +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: "Export Register",
    content: content,
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function () {
      var cards = document.querySelectorAll(".option-card[data-format]");
      for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener("click", function () {
          var format = this.getAttribute("data-format");
          ERM.components.closeModal();
          ERM.toast.info(
            "Exporting as " + format.toUpperCase() + "... (coming soon)"
          );
        });
      }
    },
  });
};

/* ========================================
   IMPORT MODAL
   ======================================== */
ERM.riskRegister.showImportModal = function () {
  var content =
    '<div class="import-section">' +
    '<p class="text-secondary">Import risks into "' +
    ERM.utils.escapeHtml(this.state.currentRegister.name) +
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
    self.state.filters.category = categoryFilter ? categoryFilter.value : "";
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

  var selectAll = document.getElementById("select-all-risks");
  if (selectAll) {
    selectAll.addEventListener("change", function () {
      var checkboxes = document.querySelectorAll(".risk-select-checkbox");
      for (var i = 0; i < checkboxes.length; i++) {
        var row = checkboxes[i].closest(".risk-row");
        if (row && row.style.display !== "none") {
          checkboxes[i].checked = this.checked;
        }
      }
      self.updateRisksBulkActions();
    });
  }

  var checkboxes = document.querySelectorAll(".risk-select-checkbox");
  for (var j = 0; j < checkboxes.length; j++) {
    checkboxes[j].addEventListener("change", function () {
      self.updateRisksBulkActions();
    });
  }

  // Bulk action buttons
  var bulkEditBtn = document.getElementById("bulk-edit-risks");
  if (bulkEditBtn) {
    bulkEditBtn.addEventListener("click", function () {
      var ids = self.getSelectedRiskIds();
      if (ids.length > 0) {
        self.showBulkEditModal(ids);
      }
    });
  }

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

  for (var i = 0; i < checkboxes.length; i++) {
    var row = checkboxes[i].closest(".risk-row");
    if (row && row.style.display !== "none") {
      visibleCount++;
      if (checkboxes[i].checked) checkedCount++;
    }
  }

  var bulkActions = document.getElementById("risks-bulk-actions");
  var selectedCount = document.getElementById("risks-selected-count");
  var selectAll = document.getElementById("select-all-risks");

  if (bulkActions) {
    bulkActions.style.display = checkedCount > 0 ? "flex" : "none";
  }

  if (selectedCount) {
    selectedCount.textContent = checkedCount + " selected";
  }

  if (selectAll) {
    selectAll.checked = checkedCount === visibleCount && visibleCount > 0;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < visibleCount;
  }
};

ERM.riskRegister.getSelectedRiskIds = function () {
  var checkboxes = document.querySelectorAll(".risk-select-checkbox:checked");
  var ids = [];
  for (var i = 0; i < checkboxes.length; i++) {
    ids.push(checkboxes[i].getAttribute("data-risk-id"));
  }
  return ids;
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
    strategicObjective: "",
    owner: "",
    description: "",
    causes: [],
    consequences: [],
    inherentLikelihood: 3,
    inherentImpact: 3,
    residualLikelihood: 2,
    residualImpact: 2,
    treatment: "Mitigate",
    status: "Open",
    reviewDate: "",
    actionPlan: "",
    linkedControls: [],
  };

  var inherentScore = r.inherentLikelihood * r.inherentImpact;
  var residualScore = r.residualLikelihood * r.residualImpact;

  // Build category options
  var categoryOptions = '<option value="">Select category...</option>';
  for (var c = 0; c < this.categories.length; c++) {
    var cat = this.categories[c];
    var selected = r.category === cat.value ? " selected" : "";
    categoryOptions +=
      '<option value="' +
      cat.value +
      '"' +
      selected +
      ">" +
      cat.label +
      "</option>";
  }

  // Build causes list
  var causesHtml = "";
  var causes = r.causes || [];
  for (var ci = 0; ci < causes.length; ci++) {
    causesHtml +=
      '<div class="list-input-item" data-index="' +
      ci +
      '">' +
      '<span class="list-input-text">' +
      ERM.utils.escapeHtml(causes[ci]) +
      "</span>" +
      '<button type="button" class="list-input-remove" data-list="causes" data-index="' +
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

  var content =
    '<form id="risk-form" class="risk-form">' +
    // Section 1: Risk Identification
    '<div class="form-section">' +
    '<h3 class="form-section-title">1. Risk Identification</h3>' +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Risk Event (What could happen?) <span class="required">*</span></label>' +
    '<button type="button" class="btn-ai-suggest" data-field="title">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<input type="text" class="form-input" id="risk-title" value="' +
    ERM.utils.escapeHtml(r.title) +
    '" placeholder="e.g., Cybersecurity Breach">' +
    "</div>" +
    '<div class="form-row">' +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Risk Category (COSO) <span class="required">*</span></label>' +
    '<button type="button" class="btn-ai-suggest" data-field="category">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<select class="form-select" id="risk-category">' +
    categoryOptions +
    "</select>" +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Strategic Objective Linked</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="strategicObjective">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<input type="text" class="form-input" id="risk-strategic-objective" value="' +
    ERM.utils.escapeHtml(r.strategicObjective || "") +
    '" placeholder="e.g., Protect customer data">' +
    "</div>" +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Risk Cause (Why might this happen?)</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="causes">' +
    this.icons.sparkles +
    " Suggest</button>" +
    "</div>" +
    '<div class="list-input-container" id="causes-list">' +
    causesHtml +
    "</div>" +
    '<div class="list-input-add">' +
    '<input type="text" class="form-input" id="cause-input" placeholder="Add a cause and press Enter...">' +
    '<button type="button" class="btn btn-primary btn-icon add-list-item" data-list="causes">' +
    this.icons.plus +
    "</button>" +
    "</div>" +
    "</div>" +
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Risk Consequence (What would be the impact?)</label>' +
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
    '<label class="form-label">Risk Owner</label>' +
    '<div class="form-label-actions">' +
    '<button type="button" class="btn-notify-upgrade" id="notify-risk-owner">' +
    this.icons.bell +
    " Notify</button>" +
    '<button type="button" class="btn-notify-upgrade" id="add-risk-owner" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-color: #86efac; color: #16a34a;">' +
    this.icons.plus +
    " Add</button>" +
    '<button type="button" class="btn-ai-suggest" data-field="owner">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    "</div>" +
    '<input type="text" class="form-input" id="risk-owner" value="' +
    ERM.utils.escapeHtml(r.owner || "") +
    '" placeholder="e.g., CISO, CFO, Operations Manager">' +
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
    '<label class="form-label">Likelihood</label>' +
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
    '<label class="form-label">Impact</label>' +
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
    '<label class="form-label">Likelihood</label>' +
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
    '<label class="form-label">Impact</label>' +
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
    '<div class="form-label-row">' +
    '<label class="form-label">Treatment Decision</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="treatment">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
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
    '<div class="form-label-row">' +
    '<label class="form-label">Status</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="status">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<select class="form-select" id="risk-status">' +
    '<option value="Open"' +
    (r.status === "Open" ? " selected" : "") +
    ">Open</option>" +
    '<option value="In Progress"' +
    (r.status === "In Progress" ? " selected" : "") +
    ">In Progress</option>" +
    '<option value="Mitigated"' +
    (r.status === "Mitigated" ? " selected" : "") +
    ">Mitigated</option>" +
    '<option value="Closed"' +
    (r.status === "Closed" ? " selected" : "") +
    ">Closed</option>" +
    "</select>" +
    "</div>" +
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
    '<div class="form-group">' +
    '<div class="form-label-row">' +
    '<label class="form-label">Action Plan</label>' +
    '<button type="button" class="btn-ai-suggest" data-field="actionPlan">' +
    this.icons.sparkles +
    " AI</button>" +
    "</div>" +
    '<textarea class="form-textarea" id="risk-action-plan" rows="3" placeholder="Describe the treatment actions to be taken...">' +
    ERM.utils.escapeHtml(r.actionPlan || "") +
    "</textarea>" +
    "</div>" +
    "</div>" +
    // Section 4: Linked Controls
    '<div class="form-section">' +
    '<h3 class="form-section-title">4. Linked Controls</h3>' +
    this.buildControlSelector(riskId) +
    "</div>" +
    // AI Check Bar
    '<div class="ai-check-bar">' +
    '<div class="ai-check-content">' +
    '<div class="ai-check-icon">' +
    this.icons.sparkles +
    "</div>" +
    '<span class="ai-check-text">AI can help complete and review this risk</span>' +
    "</div>" +
    '<div class="ai-check-actions">' +
    '<button type="button" class="btn-ai-outline" id="ai-review-risk">Review Risk</button>' +
    '<button type="button" class="btn-ai-primary" id="ai-generate-risk">Generate Content</button>' +
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

  // AI suggest buttons
  var aiButtons = document.querySelectorAll(".btn-ai-suggest");
  for (var i = 0; i < aiButtons.length; i++) {
    aiButtons[i].addEventListener("click", function () {
      var field = this.getAttribute("data-field");
      self.handleAISuggest(field);
    });
  }

  // Notify owner button
  var notifyOwnerBtn = document.getElementById("notify-risk-owner");
  if (notifyOwnerBtn) {
    notifyOwnerBtn.addEventListener("click", function () {
      self.showEmailUpgradeModal();
    });
  }

  // Add owner button
  var addOwnerBtn = document.getElementById("add-risk-owner");
  if (addOwnerBtn) {
    addOwnerBtn.addEventListener("click", function () {
      self.showMultipleOwnersUpgradeModal();
    });
  }

  // AI check bar buttons
  var reviewBtn = document.getElementById("ai-review-risk");
  var generateBtn = document.getElementById("ai-generate-risk");

  if (reviewBtn) {
    reviewBtn.addEventListener("click", function () {
      if (typeof ERM.ai !== "undefined" && ERM.ai.reviewEntireRisk) {
        ERM.ai.reviewEntireRisk();
      } else {
        ERM.toast.info("AI review coming soon");
      }
    });
  }

  if (generateBtn) {
    generateBtn.addEventListener("click", function () {
      if (typeof ERM.ai !== "undefined" && ERM.ai.generateEntireRisk) {
        ERM.ai.generateEntireRisk();
      } else {
        ERM.toast.info("AI generation coming soon");
      }
    });
  }
};

/* ========================================
   LIST INPUT HANDLERS
   ======================================== */
ERM.riskRegister.initListInputHandlers = function () {
  var self = this;

  // Add cause
  var causeInput = document.getElementById("cause-input");
  var addCauseBtn = document.querySelector(
    '.add-list-item[data-list="causes"]'
  );

  var addCause = function () {
    var value = causeInput.value.trim();
    if (value) {
      self.addListItem("causes", value);
      causeInput.value = "";
    }
  };

  if (causeInput) {
    causeInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addCause();
      }
    });
  }

  if (addCauseBtn) {
    addCauseBtn.addEventListener("click", function (e) {
      e.preventDefault();
      addCause();
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
  var self = this;
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
  if (typeof ERM.ai !== "undefined" && ERM.ai.suggestFieldContent) {
    ERM.ai.suggestFieldContent("risk", "risk-" + field, field);
  } else {
    ERM.toast.info("AI suggestions coming soon for: " + field);
  }
};

/* ========================================
   HEAT MAP
   ======================================== */
ERM.riskRegister.renderHeatMap = function (
  type,
  selectedLikelihood,
  selectedImpact
) {
  var html = '<div class="heat-map-grid">';
  html += '<div class="heat-map-y-label">LIKELIHOOD →</div>';

  // Rows from 5 (top) to 1 (bottom)
  for (var likelihood = 5; likelihood >= 1; likelihood--) {
    html += '<div class="heat-map-row">';
    html += '<span class="heat-map-row-label">' + likelihood + "</span>";

    for (var impact = 1; impact <= 5; impact++) {
      var score = likelihood * impact;
      var colorClass = this.getHeatMapColorClass(score);
      var isSelected =
        likelihood == selectedLikelihood && impact == selectedImpact;
      var selectedClass = isSelected ? " selected" : "";

      html +=
        '<div class="heat-map-cell ' +
        colorClass +
        selectedClass +
        '" ' +
        'data-type="' +
        type +
        '" data-likelihood="' +
        likelihood +
        '" data-impact="' +
        impact +
        '" ' +
        "onclick=\"ERM.riskRegister.selectHeatMapCell('" +
        type +
        "', " +
        likelihood +
        ", " +
        impact +
        ')">' +
        score +
        "</div>";
    }

    html += "</div>";
  }

  // X-axis labels
  html += '<div class="heat-map-row">';
  html += '<span class="heat-map-row-label"></span>';
  for (var x = 1; x <= 5; x++) {
    html += '<span class="heat-map-x-label">' + x + "</span>";
  }
  html += "</div>";
  html += '<div class="heat-map-x-label-title">IMPACT →</div>';
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

  var likelihood = parseInt(likelihoodSelect.value);
  var impact = parseInt(impactSelect.value);
  var score = likelihood * impact;
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

ERM.riskRegister.getHeatMapColorClass = function (score) {
  if (score >= 15) return "critical";
  if (score >= 10) return "high";
  if (score >= 5) return "medium";
  return "low";
};

/* ========================================
   CONTROL SELECTOR
   ======================================== */
ERM.riskRegister.buildControlSelector = function (riskId) {
  var controls = [];
  if (typeof ERM.controls !== "undefined" && ERM.controls.getAll) {
    controls = ERM.controls.getAll();
  }

  if (controls.length === 0) {
    return (
      '<div class="no-controls-message">' +
      '<p class="text-muted">No controls available. Create controls in the Controls module first.</p>' +
      "</div>"
    );
  }

  // Get linked controls for this risk
  var linkedControlIds = [];
  if (riskId) {
    for (var i = 0; i < controls.length; i++) {
      if (
        controls[i].linkedRisks &&
        controls[i].linkedRisks.indexOf(riskId) !== -1
      ) {
        linkedControlIds.push(controls[i].id);
      }
    }
  }

  var html =
    '<div class="control-selector">' +
    '<div class="control-selector-search">' +
    '<input type="text" class="form-input" id="control-search" placeholder="Search controls...">' +
    "</div>" +
    '<div class="control-selector-list">';

  for (var j = 0; j < controls.length; j++) {
    var ctrl = controls[j];
    var isLinked = linkedControlIds.indexOf(ctrl.id) !== -1;
    var checkedAttr = isLinked ? " checked" : "";

    html +=
      '<label class="control-selector-item' +
      (isLinked ? " selected" : "") +
      '">' +
      '<input type="checkbox" class="control-checkbox" data-control-id="' +
      ctrl.id +
      '"' +
      checkedAttr +
      ">" +
      '<div class="control-selector-info">' +
      '<span class="control-ref">' +
      ERM.utils.escapeHtml(ctrl.reference) +
      "</span>" +
      '<span class="control-name">' +
      ERM.utils.escapeHtml(ctrl.name) +
      "</span>" +
      "</div>" +
      "</label>";
  }

  html += "</div></div>";

  return html;
};

/* ========================================
   SAVE RISK
   ======================================== */
ERM.riskRegister.saveRisk = function (existingRiskId) {
  var self = this;

  // Get form values
  var title = document.getElementById("risk-title").value.trim();
  var category = document.getElementById("risk-category").value;

  // Validation
  if (!title) {
    ERM.toast.error("Please enter a risk title");
    return;
  }

  if (!category) {
    ERM.toast.error("Please select a risk category");
    return;
  }

  var inherentLikelihood = parseInt(
    document.getElementById("inherent-likelihood").value
  );
  var inherentImpact = parseInt(
    document.getElementById("inherent-impact").value
  );
  var residualLikelihood = parseInt(
    document.getElementById("residual-likelihood").value
  );
  var residualImpact = parseInt(
    document.getElementById("residual-impact").value
  );

  var inherentScore = inherentLikelihood * inherentImpact;
  var residualScore = residualLikelihood * residualImpact;

  var riskData = {
    title: title,
    category: category,
    strategicObjective: document
      .getElementById("risk-strategic-objective")
      .value.trim(),
    owner: document.getElementById("risk-owner").value.trim(),
    description: document.getElementById("risk-description").value.trim(),
    causes: this.getListItems("causes"),
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
    status: document.getElementById("risk-status").value,
    reviewDate: document.getElementById("risk-review-date").value,
    actionPlan: document.getElementById("risk-action-plan").value.trim(),
    updatedAt: new Date().toISOString(),
  };

  var risks = ERM.storage.get("risks") || [];
  var registers = ERM.storage.get("registers") || [];

  if (existingRiskId) {
    // Update existing
    for (var i = 0; i < risks.length; i++) {
      if (risks[i].id === existingRiskId) {
        for (var key in riskData) {
          risks[i][key] = riskData[key];
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
    riskData.linkedControls = [];

    // Generate risk reference (R-001, R-002, etc.)
    var existingRefs = [];
    for (var k = 0; k < risks.length; k++) {
      if (
        risks[k].registerId === this.state.currentRegister.id &&
        risks[k].reference
      ) {
        existingRefs.push(risks[k].reference);
      }
    }
    var nextNum = 1;
    while (
      existingRefs.indexOf("R-" + String(nextNum).padStart(3, "0")) !== -1
    ) {
      nextNum++;
    }
    riskData.reference = "R-" + String(nextNum).padStart(3, "0");

    risks.push(riskData);

    // Update register risk count
    for (var j = 0; j < registers.length; j++) {
      if (registers[j].id === this.state.currentRegister.id) {
        registers[j].riskCount = (registers[j].riskCount || 0) + 1;
        break;
      }
    }
    ERM.storage.set("registers", registers);
    ERM.toast.success("Risk created");
  }

  // Update control links
  this.updateControlLinks(existingRiskId || riskData.id);

  ERM.storage.set("risks", risks);
  ERM.components.closeModal();
  this.renderRegisterDetail();
};

/* ========================================
   UPDATE CONTROL LINKS
   ======================================== */
ERM.riskRegister.updateControlLinks = function (riskId) {
  if (typeof ERM.controls === "undefined") return;

  var controls = ERM.controls.getAll();
  var checkboxes = document.querySelectorAll(".control-checkbox");

  for (var i = 0; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    var controlId = checkbox.getAttribute("data-control-id");

    for (var j = 0; j < controls.length; j++) {
      if (controls[j].id === controlId) {
        var linkedRisks = controls[j].linkedRisks || [];
        var riskIndex = linkedRisks.indexOf(riskId);

        if (checkbox.checked && riskIndex === -1) {
          linkedRisks.push(riskId);
        } else if (!checkbox.checked && riskIndex !== -1) {
          linkedRisks.splice(riskIndex, 1);
        }

        controls[j].linkedRisks = linkedRisks;
        controls[j].updatedAt = new Date().toISOString();
        break;
      }
    }
  }

  ERM.storage.set("controls", controls);
};

/* ========================================
   DELETE RISK
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
    "<h3>Delete this risk?</h3>" +
    '<p>"' +
    ERM.utils.escapeHtml(risk.title) +
    '"</p>' +
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
  var risk = null;

  for (var i = 0; i < risks.length; i++) {
    if (risks[i].id === riskId) {
      risk = risks[i];
      risks.splice(i, 1);
      break;
    }
  }

  if (risk) {
    // Update register risk count
    for (var j = 0; j < registers.length; j++) {
      if (registers[j].id === risk.registerId) {
        registers[j].riskCount = Math.max(0, (registers[j].riskCount || 1) - 1);
        break;
      }
    }
    ERM.storage.set("registers", registers);
  }

  ERM.storage.set("risks", risks);
  this.renderRegisterDetail();
  ERM.toast.success("Risk deleted");
};

/**
 * Show notify owner popup
 */
ERM.riskRegister.showNotifyOwnerPopup = function (riskId) {
  var risks = ERM.storage.get("risks") || [];
  var risk = null;

  for (var i = 0; i < risks.length; i++) {
    if (risks[i].id === riskId) {
      risk = risks[i];
      break;
    }
  }

  if (!risk) return;

  var ownerName = risk.owner || "No owner assigned";

  ERM.components.showModal({
    title: this.icons.bell + " Notify Owner",
    content:
      '<div class="notify-popup">' +
      '<p>Send notification to <strong>' +
      ERM.utils.escapeHtml(ownerName) +
      "</strong> about this risk?</p>" +
      '<p class="control-ref-preview">' +
      ERM.utils.escapeHtml(risk.reference || risk.title) +
      "</p>" +
      '<div class="form-group">' +
      '<label class="form-label">Message (optional)</label>' +
      '<textarea class="form-textarea" id="notify-message" rows="3" placeholder="Add a message..."></textarea>' +
      "</div>" +
      '<div class="upgrade-notice">' +
      '<p class="text-muted" style="margin: 0; font-size: 13px;">' +
      this.icons.info +
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
ERM.riskRegister.showAddOwnerPopup = function (riskId) {
  var risks = ERM.storage.get("risks") || [];
  var risk = null;

  for (var i = 0; i < risks.length; i++) {
    if (risks[i].id === riskId) {
      risk = risks[i];
      break;
    }
  }

  if (!risk) return;

  ERM.components.showModal({
    title: this.icons.userPlus + " Add Owner",
    content:
      '<div class="add-owner-popup">' +
      '<p>Add additional owners to this risk:</p>' +
      '<p class="control-ref-preview">' +
      ERM.utils.escapeHtml(risk.reference || risk.title) +
      "</p>" +
      '<p class="text-muted" style="font-size: 13px;">Current owner: <strong>' +
      ERM.utils.escapeHtml(risk.owner || "None") +
      "</strong></p>" +
      '<div class="form-group">' +
      '<label class="form-label">Additional Owner</label>' +
      '<input type="text" class="form-input" id="additional-owner" placeholder="e.g., CISO, CFO, Operations Manager">' +
      "</div>" +
      '<div class="upgrade-notice">' +
      '<p class="text-muted" style="margin: 0; font-size: 13px;">' +
      this.icons.info +
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
 * Show notify owner popup from form
 */
ERM.riskRegister.showNotifyOwnerFormPopup = function (ownerName) {
  ERM.components.showModal({
    title: this.icons.bell + " Notify Owner",
    content:
      '<div class="notify-popup">' +
      '<p>Send notification to <strong>' +
      ERM.utils.escapeHtml(ownerName) +
      "</strong> about this risk?</p>" +
      '<div class="form-group">' +
      '<label class="form-label">Message (optional)</label>' +
      '<textarea class="form-textarea" id="notify-message" rows="3" placeholder="Add a message..."></textarea>' +
      "</div>" +
      '<div class="upgrade-notice">' +
      '<p class="text-muted" style="margin: 0; font-size: 13px;">' +
      this.icons.info +
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
 * Show add owner popup from form
 */
ERM.riskRegister.showAddOwnerFormPopup = function (currentOwner) {
  ERM.components.showModal({
    title: this.icons.userPlus + " Add Owner",
    content:
      '<div class="add-owner-popup">' +
      '<p>Add additional owners to this risk:</p>' +
      '<p class="text-muted" style="font-size: 13px;">Current owner: <strong>' +
      ERM.utils.escapeHtml(currentOwner) +
      "</strong></p>" +
      '<div class="form-group">' +
      '<label class="form-label">Additional Owner</label>' +
      '<input type="text" class="form-input" id="additional-owner" placeholder="e.g., CISO, CFO, Operations Manager">' +
      "</div>" +
      '<div class="upgrade-notice">' +
      '<p class="text-muted" style="margin: 0; font-size: 13px;">' +
      this.icons.info +
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

/* ========================================
   BULK OPERATIONS
   ======================================== */
ERM.riskRegister.duplicateRisks = function (riskIds) {
  var risks = ERM.storage.get("risks") || [];
  var registers = ERM.storage.get("registers") || [];
  var count = 0;

  for (var i = 0; i < riskIds.length; i++) {
    var riskId = riskIds[i];
    for (var j = 0; j < risks.length; j++) {
      if (risks[j].id === riskId) {
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
   UTILITY FUNCTIONS
   ======================================== */
ERM.riskRegister.getRiskLevelFromScore = function (score) {
  if (score >= 15) return "CRITICAL";
  if (score >= 10) return "HIGH";
  if (score >= 5) return "MEDIUM";
  return "LOW";
};

ERM.riskRegister.getRiskLevelClass = function (score) {
  if (score >= 15) return "critical";
  if (score >= 10) return "high";
  if (score >= 5) return "medium";
  return "low";
};

ERM.riskRegister.formatCategory = function (value) {
  for (var i = 0; i < this.categories.length; i++) {
    if (this.categories[i].value === value) {
      return this.categories[i].label;
    }
  }
  return value || "-";
};

/* ========================================
   EXPORTS
   ======================================== */
window.ERM = ERM;
console.log("risk-register.js fully loaded");

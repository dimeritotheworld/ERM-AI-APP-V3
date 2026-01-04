/**
 * Dimeri ERM - Risk Register List Module
 * Registers list view, register CRUD, bulk actions
 *
 * @version 3.0.0
 * ES5 Compatible
 */

console.log("Loading risk-register-list.js...");

var ERM = window.ERM || {};
ERM.riskRegister = ERM.riskRegister || {};

/* ========================================
   REGISTER LIST VIEW
   ======================================== */
ERM.riskRegister.renderRegisterList = function () {
  var self = this;
  var viewContainer = document.getElementById("view-risk-register");
  if (!viewContainer) return;

  this.state.viewMode = "list";
  this.state.currentRegister = null;

  // Check for new invitations and show notification
  this.checkInviteNotifications();

  var registers = ERM.storage.get("registers") || [];
  var currentUser = ERM.state.user || { name: "User", id: "current" };

  // Also get registers where current user is invited (not owner)
  var invitedRegisters = this.getInvitedRegisters(currentUser);

  // Combine owned and invited registers
  var allRegisters = registers.slice(); // Clone owned registers
  for (var ir = 0; ir < invitedRegisters.length; ir++) {
    var invitedReg = invitedRegisters[ir];
    // Only add if not already in the list
    var alreadyExists = false;
    for (var er = 0; er < allRegisters.length; er++) {
      if (allRegisters[er].id === invitedReg.id) {
        alreadyExists = true;
        break;
      }
    }
    if (!alreadyExists) {
      allRegisters.push(invitedReg);
    }
  }

  registers = allRegisters;

  // Banner HTML - Plan limit banner (non-dismissible with counter, FREE plan only)
  var bannerHtml = "";
  var plan = ERM.usageTracker ? ERM.usageTracker.getPlan() : 'FREE';
  var status = ERM.enforcement ? ERM.enforcement.getStatus('riskRegisters') : null;
  if (plan === 'FREE' && status && status.limit !== -1) {
    bannerHtml =
      '<div class="info-banner" id="free-plan-banner">' +
      '<div class="info-banner-content">' +
      '<span class="info-banner-icon-circle">i</span>' +
      '<span class="info-banner-text">' + status.current + ' of ' + status.limit + ' risk registers used. <a href="upgrade.html?source=register_limit">Upgrade for unlimited</a></span>' +
      "</div>" +
      "</div>";
  }

  // Category intent banner (from dashboard category click)
  if (ERM.riskRegister && ERM.riskRegister.state && ERM.riskRegister.state.categoryIntent) {
    var ci = ERM.riskRegister.state.categoryIntent;
    bannerHtml +=
      '<div class="info-banner mild" id="category-intent-banner">' +
      '<div class="info-banner-content">' +
      '<span class="info-banner-icon-circle">!</span>' +
      '<span class="info-banner-text">Viewing ' +
      ERM.utils.escapeHtml(ERM.riskRegister.formatCategory(ci.category)) +
      " risks (" +
      (ci.count || 0) +
      " items)</span>" +
      "</div>" +
      '<button class="info-banner-close" id="clear-category-banner">' +
      this.icons.close +
      "</button>" +
      "</div>";
  }

  // Heatmap intent banner
  if (ERM.riskRegister && ERM.riskRegister.state && ERM.riskRegister.state.heatmapFilter) {
    var hf = ERM.riskRegister.state.heatmapFilter;
    var label = (hf.type === "residual" ? "Residual" : "Inherent") + " - Impact " + hf.impact + " x Likelihood " + hf.likelihood;
    bannerHtml +=
      '<div class="info-banner mild" id="heatmap-banner">' +
      '<div class="info-banner-content">' +
      '<span class="info-banner-icon-circle">!</span>' +
      '<span class="info-banner-text">Viewing risks from dashboard heatmap: ' + ERM.utils.escapeHtml(label) + "</span>" +
      "</div>" +
      '<button class="info-banner-close" id="clear-heatmap-banner">' +
      this.icons.close +
      "</button>" +
      "</div>";
  }

  // Register cards
  var registersHtml = "";
  if (registers.length === 0) {
    registersHtml =
      '<div class="risk-register-empty-state">' +
      '<div class="empty-illustration">' +
      '<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="20" y="25" width="80" height="70" rx="8" fill="#fef2f2" stroke="#c41e3a" stroke-width="2"/>' +
      '<rect x="30" y="40" width="40" height="6" rx="3" fill="#fecaca"/>' +
      '<rect x="30" y="52" width="55" height="4" rx="2" fill="#fee2e2"/>' +
      '<rect x="30" y="62" width="50" height="4" rx="2" fill="#fee2e2"/>' +
      '<rect x="30" y="72" width="45" height="4" rx="2" fill="#fee2e2"/>' +
      '<circle cx="85" cy="75" r="20" fill="white" stroke="#c41e3a" stroke-width="2"/>' +
      '<path d="M85 67V83M77 75H93" stroke="#c41e3a" stroke-width="2.5" stroke-linecap="round"/>' +
      '<path d="M25 35H95" stroke="#c41e3a" stroke-width="2"/>' +
      '<circle cx="32" cy="30" r="2" fill="#c41e3a"/>' +
      '<circle cx="40" cy="30" r="2" fill="#fecaca"/>' +
      '<circle cx="48" cy="30" r="2" fill="#fee2e2"/>' +
      '</svg>' +
      '</div>' +
      '<h3 class="empty-title">No Risk Registers Yet</h3>' +
      '<p class="empty-description">Create your first risk register to start tracking and managing organizational risks effectively.</p>' +
      '<button class="btn btn-primary" id="empty-create-register">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>' +
      ' Create Risk Register</button>' +
      '</div>';
  } else {
    for (var i = 0; i < registers.length; i++) {
      var reg = registers[i];
      var createdDate = ERM.utils.formatDate(reg.createdAt, "short");
      var initial = (reg.name || "R").charAt(0).toUpperCase();
      var createdBy = reg.createdBy || currentUser.name;
      var regType = reg.type || "enterprise";

      // Check if this is an invited register
      var isInvited = reg.isInvited || false;
      var inviteRole = reg.inviteRole || "";

      // Format type label
      var typeLabel = regType.charAt(0).toUpperCase() + regType.slice(1);

      // Add invited badge if user is invited
      var invitedBadge = isInvited
        ? '<span class="invited-badge" title="You have been invited to this register">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>' +
          ' Invited (' + (inviteRole.charAt(0).toUpperCase() + inviteRole.slice(1)) + ')' +
          '</span>'
        : '';

      registersHtml +=
        '<div class="register-card" data-register-id="' + reg.id + '" data-name="' + ERM.utils.escapeHtml(reg.name || "") + '" data-type="' + regType + '" data-created="' + (reg.createdAt || "") + '" data-risk-count="' + (reg.riskCount || 0) + '">' +
        '<div class="register-card-checkbox" onclick="event.stopPropagation();">' +
        '<label class="checkbox-wrapper">' +
        '<input type="checkbox" class="register-select-checkbox" data-register-id="' + reg.id + '">' +
        '<span class="checkbox-custom"></span>' +
        '</label>' +
        '</div>' +
        '<div class="register-card-header">' +
        '<div class="register-icon">' + initial + '</div>' +
        '<span class="register-card-type">' + typeLabel + '</span>' +
        invitedBadge +
        '</div>' +
        '<h4 class="register-card-title">' + ERM.utils.escapeHtml(reg.name) + '</h4>' +
        '<p class="register-card-owner">Created by ' + ERM.utils.escapeHtml(createdBy) + ' &middot; ' + createdDate + '</p>' +
        '<div class="register-card-footer">' +
        '<button class="btn btn-secondary btn-sm open-register-btn" data-register-id="' + reg.id + '">Open</button>' +
        '<div class="register-card-actions">' +
        '<div class="dropdown">' +
        '<button class="btn-icon register-menu-btn" data-register-id="' + reg.id + '">' +
        this.icons.moreVertical +
        '</button>' +
        '<div class="dropdown-menu register-dropdown" id="register-menu-' + reg.id + '">' +
        '<a href="#" class="dropdown-item" data-action="rename" data-register-id="' + reg.id + '">' +
        this.icons.edit +
        '<span>Rename</span></a>' +
        '<a href="#" class="dropdown-item" data-action="invite" data-register-id="' + reg.id + '">' +
        this.icons.userPlus +
        '<span>Invite Team</span></a>' +
        '<div class="dropdown-divider"></div>' +
        '<a href="#" class="dropdown-item danger" data-action="delete" data-register-id="' + reg.id + '">' +
        this.icons.trash +
        '<span>Delete</span></a>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    }
  }

  // Header with select all, search, and sort/filter
  var listHeaderHtml =
    registers.length > 0
      ? '<div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px;">' +
        '<div>' +
        '<h1 class="page-title" style="margin-bottom: 4px;">Risk Registers</h1>' +
        '<p class="page-subtitle" style="margin-bottom: 0;">Manage your organization\'s risk registers</p>' +
        "</div>" +
        '<button class="btn btn-primary" id="create-register-btn">' +
        this.icons.plus +
        " New Register</button>" +
        "</div>" +
        '<div class="registers-toolbar">' +
        '<div class="toolbar-left">' +
        '<label class="checkbox-wrapper">' +
        '<input type="checkbox" id="select-all-registers">' +
        '<span class="checkbox-custom"></span>' +
        "</label>" +
        '<div class="search-box">' +
        '<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' +
        '<input type="text" id="registers-search" class="search-input" placeholder="Search registers...">' +
        "</div>" +
        "</div>" +
        '<div class="toolbar-right">' +
        '<div class="dropdown">' +
        '<button class="btn btn-ghost btn-sm dropdown-toggle" id="sort-dropdown-btn">' +
        this.icons.sort +
        " Sort" +
        "</button>" +
        '<div class="dropdown-menu" id="sort-dropdown-menu">' +
        '<a href="#" class="dropdown-item active" data-sort="newest">Newest first</a>' +
        '<a href="#" class="dropdown-item" data-sort="oldest">Oldest first</a>' +
        '<a href="#" class="dropdown-item" data-sort="name-asc">Name A-Z</a>' +
        '<a href="#" class="dropdown-item" data-sort="name-desc">Name Z-A</a>' +
        '<a href="#" class="dropdown-item" data-sort="risks-most">Most risks</a>' +
        '<a href="#" class="dropdown-item" data-sort="risks-least">Least risks</a>' +
        "</div>" +
        "</div>" +
        '<div class="dropdown">' +
        '<button class="btn btn-ghost btn-sm dropdown-toggle" id="filter-dropdown-btn">' +
        this.icons.filter +
        " Filter" +
        "</button>" +
        '<div class="dropdown-menu" id="filter-dropdown-menu">' +
        '<a href="#" class="dropdown-item active" data-filter="all">All registers</a>' +
        '<a href="#" class="dropdown-item" data-filter="enterprise">Enterprise</a>' +
        '<a href="#" class="dropdown-item" data-filter="strategic">Strategic</a>' +
        '<a href="#" class="dropdown-item" data-filter="operational">Operational</a>' +
        '<a href="#" class="dropdown-item" data-filter="hse">HSE</a>' +
        '<a href="#" class="dropdown-item" data-filter="compliance">Compliance</a>' +
        '<a href="#" class="dropdown-item" data-filter="technology">Technology</a>' +
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
        "</div>" +
        '<div class="registers-bulk-bar" id="registers-bulk-bar">' +
        '<span class="bulk-selected-count" id="registers-selected-count">0 selected</span>' +
        '<div class="bulk-bar-actions" id="registers-bulk-actions">' +
        '<button class="btn btn-outline-danger btn-sm" id="bulk-delete-registers">' +
        this.icons.trash +
        " Delete</button>" +
        "</div>" +
        "</div>"
      : "";

  var html =
    bannerHtml +
    listHeaderHtml +
    '<div class="registers-list" id="registers-list-container">' +
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

  // Clear heatmap banner
  var clearHeatmapBtn = document.getElementById("clear-heatmap-banner");
  if (clearHeatmapBtn) {
    clearHeatmapBtn.addEventListener("click", function () {
      ERM.storage.set("heatmapFilter", null);
      self.state.heatmapFilter = null;
      self.renderRegisterList();
    });
  }

  var clearCategoryBtn = document.getElementById("clear-category-banner");
  if (clearCategoryBtn) {
    clearCategoryBtn.addEventListener("click", function () {
      self.state.categoryIntent = null;
      self.state.filters.category = "";
      self.renderRegisterList();
    });
  }

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

  // Open register buttons
  var openBtns = document.querySelectorAll(".open-register-btn");
  for (var i = 0; i < openBtns.length; i++) {
    openBtns[i].addEventListener("click", function (e) {
      e.stopPropagation();
      var regId = this.getAttribute("data-register-id");
      self.openRegister(regId);
    });
  }

  // Register card click (anywhere on card)
  var cards = document.querySelectorAll(".register-card");
  for (var j = 0; j < cards.length; j++) {
    cards[j].addEventListener("click", function (e) {
      if (
        e.target.closest(".checkbox-wrapper") ||
        e.target.closest(".dropdown") ||
        e.target.closest(".open-register-btn")
      )
        return;
      var regId = this.getAttribute("data-register-id");
      self.openRegister(regId);
    });
  }

  // Register checkboxes
  var checkboxes = document.querySelectorAll(".register-select-checkbox");
  for (var k = 0; k < checkboxes.length; k++) {
    checkboxes[k].addEventListener("change", function () {
      self.updateRegistersBulkActions();
    });
  }

  // Select all checkbox
  var selectAll = document.getElementById("select-all-registers");
  if (selectAll) {
    selectAll.addEventListener("change", function () {
      var cbs = document.querySelectorAll(".register-select-checkbox");
      for (var l = 0; l < cbs.length; l++) {
        cbs[l].checked = this.checked;
      }
      self.updateRegistersBulkActions();
    });
  }

  // Register menu buttons
  var menuBtns = document.querySelectorAll(".register-menu-btn");
  for (var m = 0; m < menuBtns.length; m++) {
    menuBtns[m].addEventListener("click", function (e) {
      e.stopPropagation();
      var regId = this.getAttribute("data-register-id");
      var menu = document.getElementById("register-menu-" + regId);
      var btn = this;

      // Close other menus and reset their styles
      var allMenus = document.querySelectorAll(".register-dropdown.show");
      for (var am = 0; am < allMenus.length; am++) {
        if (allMenus[am] !== menu) {
          allMenus[am].classList.remove("show", "dropdown-up");
          allMenus[am].style.position = "";
          allMenus[am].style.top = "";
          allMenus[am].style.bottom = "";
          allMenus[am].style.left = "";
          allMenus[am].style.right = "";
          var parentCard = allMenus[am].closest(".register-card");
          if (parentCard) parentCard.classList.remove("dropdown-active");
        }
      }

      if (menu) {
        var isShowing = menu.classList.contains("show");
        if (isShowing) {
          menu.classList.remove("show", "dropdown-up");
          menu.style.position = "";
          menu.style.top = "";
          menu.style.bottom = "";
          menu.style.left = "";
          menu.style.right = "";
        } else {
          // Position the menu using fixed positioning to escape overflow:hidden
          var rect = btn.getBoundingClientRect();
          menu.style.position = "fixed";
          menu.style.right = (window.innerWidth - rect.right) + "px";
          menu.style.left = "auto";

          // Auto-detect: check if menu would overflow bottom of viewport
          var menuHeight = menu.offsetHeight || 150; // Estimate if not rendered
          menu.classList.add("show");
          menuHeight = menu.offsetHeight; // Get actual height once shown

          var spaceBelow = window.innerHeight - rect.bottom - 8;
          var spaceAbove = rect.top - 8;

          if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
            // Not enough space below, position above the button
            menu.style.top = "auto";
            menu.style.bottom = (window.innerHeight - rect.top + 4) + "px";
            menu.classList.add("dropdown-up");
          } else {
            // Position below the button (default)
            menu.style.top = (rect.bottom + 4) + "px";
            menu.style.bottom = "auto";
            menu.classList.remove("dropdown-up");
          }
        }
        var parentCard = this.closest(".register-card");
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
      var cardsActive = document.querySelectorAll(
        ".register-card.dropdown-active"
      );
      for (var o = 0; o < menus.length; o++) {
        menus[o].classList.remove("show", "dropdown-up");
        menus[o].style.position = "";
        menus[o].style.top = "";
        menus[o].style.bottom = "";
        menus[o].style.left = "";
        menus[o].style.right = "";
      }
      for (var oc = 0; oc < cardsActive.length; oc++) {
        cardsActive[oc].classList.remove("dropdown-active");
      }
    }
  });

  // Search registers
  var searchInput = document.getElementById("registers-search");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      self.filterRegisters();
    });
  }

  // Sort dropdown
  var sortBtn = document.getElementById("sort-dropdown-btn");
  var sortMenu = document.getElementById("sort-dropdown-menu");
  if (sortBtn && sortMenu) {
    sortBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      sortMenu.classList.toggle("show");
      // Close filter menu if open
      var filterMenu = document.getElementById("filter-dropdown-menu");
      if (filterMenu) filterMenu.classList.remove("show");
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
        sortMenu.classList.remove("show");
        self.sortRegisters(sortBy);
      });
    }
  }

  // Filter dropdown
  var filterBtn = document.getElementById("filter-dropdown-btn");
  var filterMenu = document.getElementById("filter-dropdown-menu");
  if (filterBtn && filterMenu) {
    filterBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      filterMenu.classList.toggle("show");
      // Close sort menu if open
      var sortMenuEl = document.getElementById("sort-dropdown-menu");
      if (sortMenuEl) sortMenuEl.classList.remove("show");
    });

    var filterItems = filterMenu.querySelectorAll(".dropdown-item");
    for (var fi = 0; fi < filterItems.length; fi++) {
      filterItems[fi].addEventListener("click", function (e) {
        e.preventDefault();
        var filterBy = this.getAttribute("data-filter");
        // Update active state
        for (var fj = 0; fj < filterItems.length; fj++) {
          filterItems[fj].classList.remove("active");
        }
        this.classList.add("active");
        filterMenu.classList.remove("show");
        self.state.registerFilter = filterBy;
        self.filterRegisters();
      });
    }
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
      var container = document.getElementById("registers-list-container");
      if (container) {
        container.classList.remove("registers-list", "registers-grid");
        container.classList.add(view === "grid" ? "registers-grid" : "registers-list");
      }
    });
  }

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

  // Bulk duplicate
  var bulkDuplicateBtn = document.getElementById("bulk-duplicate-registers");
  if (bulkDuplicateBtn) {
    bulkDuplicateBtn.addEventListener("click", function () {
      var ids = self.getSelectedRegisterIds();
      if (ids.length > 0) {
        self.duplicateRegisters(ids);
      }
    });
  }
};

/* ========================================
   SEARCH, SORT, FILTER
   ======================================== */
ERM.riskRegister.filterRegisters = function () {
  var searchInput = document.getElementById("registers-search");
  var searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
  var filterType = this.state.registerFilter || "all";

  var cards = document.querySelectorAll(".register-card");
  var visibleCount = 0;

  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var name = (card.getAttribute("data-name") || "").toLowerCase();
    var type = card.getAttribute("data-type") || "";

    var matchesSearch = !searchTerm || name.indexOf(searchTerm) !== -1;
    var matchesFilter = filterType === "all" || type === filterType;

    if (matchesSearch && matchesFilter) {
      card.style.display = "";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  }

  // Show/hide empty state for filtered results
  var listContainer = document.getElementById("registers-list-container");
  var existingEmpty = listContainer
    ? listContainer.querySelector(".filter-empty-state")
    : null;

  if (visibleCount === 0 && cards.length > 0) {
    if (!existingEmpty && listContainer) {
      var emptyHtml =
        '<div class="filter-empty-state">' +
        "<p>No registers match your search or filter.</p>" +
        '<button class="btn btn-ghost btn-sm" id="clear-filters-btn">Clear filters</button>' +
        "</div>";
      listContainer.insertAdjacentHTML("beforeend", emptyHtml);

      var clearBtn = document.getElementById("clear-filters-btn");
      if (clearBtn) {
        var self = this;
        clearBtn.addEventListener("click", function () {
          if (searchInput) searchInput.value = "";
          self.state.registerFilter = "all";
          // Reset filter dropdown active state
          var filterItems = document.querySelectorAll(
            "#filter-dropdown-menu .dropdown-item"
          );
          for (var fi = 0; fi < filterItems.length; fi++) {
            filterItems[fi].classList.remove("active");
            if (filterItems[fi].getAttribute("data-filter") === "all") {
              filterItems[fi].classList.add("active");
            }
          }
          self.filterRegisters();
        });
      }
    }
  } else if (existingEmpty) {
    existingEmpty.remove();
  }
};

ERM.riskRegister.sortRegisters = function (sortBy) {
  var listContainer = document.getElementById("registers-list-container");
  if (!listContainer) return;

  var cards = Array.prototype.slice.call(
    listContainer.querySelectorAll(".register-card")
  );
  if (cards.length === 0) return;

  cards.sort(function (a, b) {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.getAttribute("data-created")) -
          new Date(a.getAttribute("data-created"))
        );
      case "oldest":
        return (
          new Date(a.getAttribute("data-created")) -
          new Date(b.getAttribute("data-created"))
        );
      case "name-asc":
        return (a.getAttribute("data-name") || "").localeCompare(
          b.getAttribute("data-name") || ""
        );
      case "name-desc":
        return (b.getAttribute("data-name") || "").localeCompare(
          a.getAttribute("data-name") || ""
        );
      case "risks-most":
        return (
          parseInt(b.getAttribute("data-risk-count") || 0) -
          parseInt(a.getAttribute("data-risk-count") || 0)
        );
      case "risks-least":
        return (
          parseInt(a.getAttribute("data-risk-count") || 0) -
          parseInt(b.getAttribute("data-risk-count") || 0)
        );
      default:
        return 0;
    }
  });

  // Re-append in sorted order
  for (var i = 0; i < cards.length; i++) {
    listContainer.appendChild(cards[i]);
  }
};

/* ========================================
   BULK ACTIONS
   ======================================== */
ERM.riskRegister.updateRegistersBulkActions = function () {
  var checkboxes = document.querySelectorAll(".register-select-checkbox");
  var checkedCount = 0;
  var visibleCount = 0;

  for (var i = 0; i < checkboxes.length; i++) {
    var card = checkboxes[i].closest(".register-card");
    if (card && card.style.display !== "none") {
      visibleCount++;
      if (checkboxes[i].checked) {
        checkedCount++;
        card.classList.add("selected");
      } else {
        card.classList.remove("selected");
      }
    }
  }

  var bulkBar = document.getElementById("registers-bulk-bar");
  var selectedCount = document.getElementById("registers-selected-count");
  var selectAll = document.getElementById("select-all-registers");

  // Show/hide bulk bar
  if (bulkBar) {
    if (checkedCount > 0) {
      bulkBar.classList.add("visible");
    } else {
      bulkBar.classList.remove("visible");
    }
  }

  // Update count text
  if (selectedCount) {
    selectedCount.textContent = checkedCount + " selected";
  }

  if (selectAll) {
    selectAll.checked = checkedCount === visibleCount && visibleCount > 0;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < visibleCount;
  }
};

/**
 * Duplicate multiple registers
 */
ERM.riskRegister.duplicateRegisters = function (registerIds) {
  var self = this;
  var registers = this.getRegisters();
  var duplicated = 0;

  for (var i = 0; i < registerIds.length; i++) {
    var original = null;
    for (var j = 0; j < registers.length; j++) {
      if (registers[j].id === registerIds[i]) {
        original = registers[j];
        break;
      }
    }

    if (original) {
      var newRegister = JSON.parse(JSON.stringify(original));
      newRegister.id = "reg_" + Date.now() + "_" + i;
      newRegister.name = original.name + " (Copy)";
      newRegister.createdAt = new Date().toISOString();
      registers.push(newRegister);
      duplicated++;
    }
  }

  if (duplicated > 0) {
    this.saveRegisters(registers);
    this.renderRegisterList();
    if (typeof ERM.toast !== "undefined") {
      ERM.toast.success(duplicated + " register(s) duplicated");
    }
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

ERM.riskRegister.deleteRegister = function (registerId) {
  var registers = ERM.storage.get("registers") || [];
  var risks = ERM.storage.get("risks") || [];

  // Find register name before deleting for activity log
  var registerName = 'Unknown Register';
  for (var i = 0; i < registers.length; i++) {
    if (registers[i].id === registerId) {
      registerName = registers[i].name || 'Untitled Register';
      break;
    }
  }

  registers = registers.filter(function (r) {
    return r.id !== registerId;
  });
  risks = risks.filter(function (r) {
    return r.registerId !== registerId;
  });

  ERM.storage.set("registers", registers);
  ERM.storage.set("risks", risks);

  // Log activity for register deletion
  if (ERM.activityLogger) {
    ERM.activityLogger.log('register', 'deleted', 'register', registerName, {
      registerId: registerId
    });
  }

  this.renderRegisterList();
  ERM.toast.success("Register deleted");
};

/* ========================================
   OPEN REGISTER (Navigate to Detail)
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
      causes: (tr.causes || []).slice(0, 3),
      consequences: (tr.consequences || []).slice(0, 3),
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
   GET INVITED REGISTERS
   ======================================== */
/**
 * Get risk registers where the current user is invited
 * @param {Object} currentUser - The current user object
 * @returns {Array} Array of invited registers with invite role
 */
ERM.riskRegister.getInvitedRegisters = function (currentUser) {
  var invitedRegisters = [];

  if (!currentUser || !currentUser.id) {
    return invitedRegisters;
  }

  // Get all registers from other workspaces/users that have invited this user
  // This scans all invite storage keys to find invitations for this user
  var allRegisters = ERM.storage.get("registers") || [];

  for (var i = 0; i < allRegisters.length; i++) {
    var reg = allRegisters[i];
    var inviteKey = "invites_register_" + reg.id;
    var invites = ERM.storage.get(inviteKey) || [];

    // Check if current user is in the invites list
    for (var j = 0; j < invites.length; j++) {
      if (invites[j].memberId === currentUser.id) {
        // Clone the register and add invite info
        var invitedReg = {};
        for (var key in reg) {
          if (reg.hasOwnProperty(key)) {
            invitedReg[key] = reg[key];
          }
        }
        invitedReg.isInvited = true;
        invitedReg.inviteRole = invites[j].role || "viewer";
        invitedRegisters.push(invitedReg);
        break;
      }
    }
  }

  return invitedRegisters;
};

/**
 * Check for new invitations and show notification
 */
ERM.riskRegister.checkInviteNotifications = function () {
  var currentUser = ERM.state.user || { id: "current" };
  var invitedRegisters = this.getInvitedRegisters(currentUser);

  // Get list of already notified invites
  var notifiedKey = "notified_invites_" + currentUser.id;
  var notifiedInvites = ERM.storage.get(notifiedKey) || [];

  // Check for new invitations
  var newInvites = [];
  for (var i = 0; i < invitedRegisters.length; i++) {
    var regId = invitedRegisters[i].id;
    var isNotified = false;
    for (var j = 0; j < notifiedInvites.length; j++) {
      if (notifiedInvites[j] === regId) {
        isNotified = true;
        break;
      }
    }
    if (!isNotified) {
      newInvites.push(invitedRegisters[i]);
      notifiedInvites.push(regId);
    }
  }

  // Show notification for new invites
  if (newInvites.length > 0 && ERM.toast) {
    if (newInvites.length === 1) {
      ERM.toast.success('You have been invited to risk register: "' + newInvites[0].name + '"');
    } else {
      ERM.toast.success('You have been invited to ' + newInvites.length + ' new risk registers');
    }
    // Save notified list
    ERM.storage.set(notifiedKey, notifiedInvites);
  }
};

/* ========================================
   EXPORTS
   ======================================== */
window.ERM = ERM;
console.log("risk-register-list.js loaded");

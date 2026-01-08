/**
 * Dimeri ERM - Reusable Components
 * ES5 Compatible
 */

console.log("Loading components.js...");

ERM.components = ERM.components || {};

/**
 * Build team dropdown content
 */
ERM.components.buildTeamDropdownContent = function () {
  var members = ERM.storage.get('workspaceMembers') || [];
  var user = ERM.state.user || { name: 'You', email: '' };
  var userInitials = ERM.utils.getInitials(user.name);

  var html = '<div class="team-dropdown-header">' +
    '<span class="team-dropdown-title">Workspace Members</span>' +
    '<span class="team-dropdown-count">' + (members.length + 1) + '</span>' +
    '</div>' +
    '<div class="team-dropdown-list">' +
    // Current user (owner)
    '<div class="team-dropdown-item">' +
    '<div class="team-dropdown-avatar" style="background: #c41e3a;">' + userInitials + '</div>' +
    '<div class="team-dropdown-info">' +
    '<span class="team-dropdown-name">' + ERM.utils.escapeHtml(user.name) + '</span>' +
    '<span class="team-dropdown-role">Owner</span>' +
    '</div>' +
    '<span class="team-dropdown-status online"></span>' +
    '</div>';

  if (members.length === 0) {
    html += '<div class="team-dropdown-empty">' +
      '<span>No team members yet</span>' +
      '</div>';
  } else {
    // Show up to 5 members
    for (var i = 0; i < members.length && i < 5; i++) {
      var member = members[i];
      var initials = member.name ? (member.name.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase()) : '?';
      var statusClass = member.status === 'pending' ? 'pending' : 'offline';
      var roleText = member.role === 'admin' ? 'Admin' : member.role === 'editor' ? 'Editor' : 'Viewer';
      if (member.status === 'pending') roleText = 'Pending';

      html += '<div class="team-dropdown-item">' +
        '<div class="team-dropdown-avatar" style="background: ' + (member.color || '#3b82f6') + ';">' + initials + '</div>' +
        '<div class="team-dropdown-info">' +
        '<span class="team-dropdown-name">' + ERM.utils.escapeHtml(member.name || member.email) + '</span>' +
        '<span class="team-dropdown-role">' + roleText + '</span>' +
        '</div>' +
        '<span class="team-dropdown-status ' + statusClass + '"></span>' +
        '</div>';
    }

    if (members.length > 5) {
      html += '<div class="team-dropdown-more">+' + (members.length - 5) + ' more members</div>';
    }
  }

  html += '</div>' +
    '<div class="team-dropdown-footer">' +
    '<button class="team-dropdown-action" id="team-invite-action">' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>' +
    ' Invite Members' +
    '</button>' +
    '<button class="team-dropdown-action secondary" id="team-manage-action">' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>' +
    ' Manage Team' +
    '</button>' +
    '</div>';

  return html;
};

/**
 * Render header into container
 */
ERM.components.renderHeader = function (containerId) {
  console.log("Rendering header to:", containerId);
  var container = document.getElementById(containerId);
  if (!container) {
    console.error("Header container not found:", containerId);
    return;
  }

  var user = ERM.state.user || { name: "User", role: "Risk Manager" };
  var initials = ERM.utils.getInitials(user.name || "User");

  // Get unread notification count
  var unreadCount = ERM.components.getUnreadNotificationCount();

  // Generate avatar content for header
  var avatarContent = initials;
  var avatarClasses = 'user-avatar';

  if (typeof ERM.avatarGenerator !== 'undefined') {
    var avatarData = ERM.storage.get('userAvatar');

    // Generate avatar if none exists
    if (!avatarData) {
      avatarData = ERM.avatarGenerator.initializeUserAvatar(user);
    }

    if (avatarData && avatarData.type === 'dicebear' && avatarData.url) {
      // DiceBear illustrated avatar (Notion-like)
      avatarContent = '<img src="' + avatarData.url + '" alt="Avatar" class="dicebear-avatar" style="width:100%;height:100%;border-radius:50%;">';
      avatarClasses = 'user-avatar has-avatar';
    } else if (avatarData && avatarData.type === 'image' && avatarData.url) {
      // Custom uploaded image
      avatarContent = '<img src="' + avatarData.url + '" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
      avatarClasses = 'user-avatar has-avatar';
    }
  }

  var html =
    '<header class="header">' +
    '<div class="header-content">' +
    '<div class="header-left">' +
    '<button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar">' +
    ERM.icons.menu +
    "</button>" +
    '<a href="index.html" class="header-logo">' +
    '<span class="header-logo-text">Dimeri ERM</span>' +
    "</a>" +
    "</div>" +
    '<div class="header-right">' +
    '<button class="header-icon-btn" id="notifications-btn" aria-label="Notifications" data-tooltip="Notifications">' +
    ERM.icons.sparkles +
    (unreadCount > 0 ? '<span class="notification-badge">' + (unreadCount > 99 ? '99+' : unreadCount) + '</span>' : '') +
    "</button>" +
    '<div class="dropdown team-dropdown">' +
    '<button class="header-icon-btn" id="team-btn" aria-label="Team members" data-tooltip="Team Members">' +
    ERM.icons.users +
    "</button>" +
    '<div class="dropdown-menu team-dropdown-menu" id="team-dropdown">' +
    ERM.components.buildTeamDropdownContent() +
    '</div>' +
    '</div>' +
    '<button class="header-icon-btn" id="invite-btn" aria-label="Invite team member" data-tooltip="Invite Members">' +
    ERM.icons.userPlus +
    "</button>" +
    '<div class="dropdown">' +
    '<button class="header-user" id="user-menu-toggle">' +
    '<div class="' + avatarClasses + '" id="header-user-avatar">' +
    avatarContent +
    "</div>" +
    '<div class="user-info">' +
    '<span class="user-name">' +
    ERM.utils.escapeHtml(user.name || "User") +
    "</span>" +
    '<span class="user-role">' +
    ERM.utils.escapeHtml(user.role || "Risk Manager") +
    "</span>" +
    "</div>" +
    '<span class="user-dropdown-icon">' +
    ERM.icons.chevronDown +
    "</span>" +
    "</button>" +
    '<div class="dropdown-menu user-dropdown" id="user-dropdown">' +
    '<a href="profile.html" target="_blank" class="dropdown-item" data-action="profile">' +
    ERM.icons.user +
    "<span>Profile & Settings</span>" +
    "</a>" +
    // Admin Portal - only for Dimeri company admins, NOT workspace owners
    (user.isDimeriAdmin ? '<a href="admin-portal/index.html" target="_blank" class="dropdown-item" data-action="admin">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>' +
    "<span>Admin Portal</span>" +
    "</a>" : "") +
    '<div class="dropdown-divider"></div>' +
    '<a href="javascript:void(0)" class="dropdown-item" data-action="reset-demo">' +
    ERM.icons.refresh +
    "<span>Reset Demo</span>" +
    "</a>" +
    '<a href="javascript:void(0)" class="dropdown-item danger" data-action="logout">' +
    ERM.icons.logOut +
    "<span>Logout</span>" +
    "</a>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</header>";

  container.innerHTML = html;

  this.initHeaderEvents();
  console.log("Header rendered successfully");
};

/**
 * Initialize header event listeners
 */
ERM.components.initHeaderEvents = function () {
  var userToggle = document.getElementById("user-menu-toggle");
  var userDropdown = document.getElementById("user-dropdown");
  var teamDropdownEl = document.getElementById("team-dropdown");

  if (userToggle && userDropdown) {
    userToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      // Close team dropdown if open
      if (teamDropdownEl) {
        teamDropdownEl.classList.remove("active");
      }
      userDropdown.classList.toggle("active");
    });

    document.addEventListener("click", function (e) {
      if (!userToggle.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove("active");
      }
    });

    var dropdownItems = userDropdown.querySelectorAll(".dropdown-item, .upgrade-link");
    for (var i = 0; i < dropdownItems.length; i++) {
      dropdownItems[i].addEventListener("click", function (e) {
        e.preventDefault();
        var action = this.getAttribute("data-action");

        if (action === "logout") {
          ERM.session.logout();
        } else if (action === "settings") {
          window.open("profile.html#preferences", "_blank");
        } else if (action === "profile") {
          window.open("profile.html", "_blank");
        } else if (action === "admin") {
          window.open("admin-portal/index.html", "_blank");
        } else if (action === "reset-demo") {
          ERM.components.showResetConfirmModal();
        } else if (action === "upgrade") {
          window.location.hash = "#/upgrade";
        } else if (action === "change-password") {
          window.open("profile.html#security", "_blank");
        }

        userDropdown.classList.remove("active");
      });
    }
  }

  var notificationsBtn = document.getElementById("notifications-btn");
  if (notificationsBtn) {
    notificationsBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      // Close team dropdown if open
      if (teamDropdownEl) {
        teamDropdownEl.classList.remove("active");
      }
      ERM.components.toggleNotificationDropdown();
    });
  }

  var teamBtn = document.getElementById("team-btn");
  if (teamBtn && teamDropdownEl) {
    teamBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      // Close user dropdown if open
      if (userDropdown) {
        userDropdown.classList.remove("active");
      }
      // Close notifications dropdown if open
      ERM.components.closeNotificationDropdown();
      teamDropdownEl.classList.toggle("active");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (!teamBtn.contains(e.target) && !teamDropdownEl.contains(e.target)) {
        teamDropdownEl.classList.remove("active");
      }
    });

    // Handle footer buttons
    var inviteAction = document.getElementById("team-invite-action");
    if (inviteAction) {
      inviteAction.addEventListener("click", function (e) {
        e.stopPropagation();
        teamDropdownEl.classList.remove("active");

        // Check if user is admin/owner before allowing invites
        var user = ERM.state.user || {};
        var isOwner = user.role === 'owner' || user.isOwner === true;

        if (!isOwner) {
          // Show restriction message for non-admin users
          if (typeof ERM.components.showModal !== 'undefined') {
            ERM.components.showModal({
              title: 'Admin Permission Required',
              content: '<div style="text-align: center; padding: 20px 0;">' +
                '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="margin: 0 auto 20px; display: block;">' +
                '<circle cx="12" cy="12" r="10"/>' +
                '<line x1="12" y1="8" x2="12" y2="12"/>' +
                '<line x1="12" y1="16" x2="12.01" y2="16"/>' +
                '</svg>' +
                '<h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #111827;">Contact Admin to Invite Users</h3>' +
                '<p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">Only workspace administrators can invite new team members. Please contact your workspace owner to add new users.</p>' +
                '</div>',
              buttons: [
                { label: 'Got it', type: 'primary', action: 'close' }
              ]
            });
          } else if (typeof ERM.toast !== 'undefined') {
            ERM.toast.error('Only administrators can invite team members');
          }
          return;
        }

        // User is admin, show invite modal
        ERM.components.showQuickInviteModal();
      });
    }

    var manageAction = document.getElementById("team-manage-action");
    if (manageAction) {
      manageAction.addEventListener("click", function (e) {
        e.stopPropagation();
        teamDropdownEl.classList.remove("active");
        ERM.navigation.switchView("settings");
        // Set active tab to team after a short delay
        setTimeout(function () {
          var teamTab = document.querySelector('[data-tab="team"]');
          if (teamTab) teamTab.click();
        }, 100);
      });
    }

    // Handle "more members" link
    var moreMembers = teamDropdownEl.querySelector(".team-dropdown-more");
    if (moreMembers) {
      moreMembers.addEventListener("click", function (e) {
        e.stopPropagation();
        teamDropdownEl.classList.remove("active");
        ERM.navigation.switchView("settings");
        setTimeout(function () {
          var teamTab = document.querySelector('[data-tab="team"]');
          if (teamTab) teamTab.click();
        }, 100);
      });
    }
  }

  var inviteBtn = document.getElementById("invite-btn");
  if (inviteBtn) {
    inviteBtn.addEventListener("click", function () {
      ERM.components.showQuickInviteModal();
    });
  }
};

/**
 * Render sidebar into container
 */
ERM.components.renderSidebar = function (containerId, activeItem) {
  console.log("Rendering sidebar to:", containerId, "active:", activeItem);
  var container = document.getElementById(containerId);
  if (!container) {
    console.error("Sidebar container not found:", containerId);
    return;
  }

  activeItem = activeItem || "dashboard";
  var workspace = ERM.state.workspace || { name: "My Workspace" };
  var workspaceInitial = (workspace.name || "M").charAt(0).toUpperCase();

  // Check if user is workspace owner
  var currentUser = ERM.state.user;
  var isOwner = currentUser && (
    currentUser.role === 'owner' ||
    currentUser.isWorkspaceOwner ||
    (workspace.ownerId && workspace.ownerId === currentUser.id)
  );

  var isCollapsed = ERM.storage.get("sidebarCollapsed") || false;
  var collapsedClass = isCollapsed ? " collapsed" : "";

  var navItems = [
    { id: "dashboard", icon: "dashboard", label: "Dashboard" },
    { type: "divider" },
    { id: "risk-register", icon: "fileText", label: "Risk Register" },
    { id: "controls", icon: "shield", label: "Controls" },
    { id: "reports", icon: "barChart", label: "Reports" },
    { type: "spacer" },
    { id: "settings", icon: "settings", label: "Settings" },
    { id: "help", icon: "help", label: "Help" },
    { id: "logout", icon: "logOut", label: "Logout" },
  ];

  var navHtml = "";
  for (var i = 0; i < navItems.length; i++) {
    var item = navItems[i];

    if (item.type === "divider") {
      navHtml += '<div class="nav-divider"></div>';
    } else if (item.type === "spacer") {
      navHtml += '<div class="nav-spacer"></div>';
      navHtml += '<div class="nav-divider"></div>';
    } else {
      var isActive = item.id === activeItem ? " active" : "";
      var icon = ERM.icons[item.icon] || "";

      navHtml +=
        '<a href="#" class="nav-item' +
        isActive +
        '" data-view="' +
        item.id +
        '">' +
        '<span class="nav-icon">' +
        icon +
        "</span>" +
        '<span class="nav-text">' +
        item.label +
        "</span>" +
        '<span class="nav-tooltip">' +
        item.label +
        "</span>" +
        "</a>";
    }
  }

  var collapseIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';

  if (isCollapsed) {
    container.classList.add("collapsed");
    setTimeout(function () {
      var mainContent = document.querySelector(".main-content");
      if (mainContent) mainContent.classList.add("sidebar-collapsed");
    }, 50);
  }

  var html =
    '<button class="sidebar-collapse-btn" id="sidebar-collapse-btn" title="' +
    (isCollapsed ? "Expand" : "Collapse") +
    '">' +
    collapseIcon +
    "</button>" +
    '<aside class="sidebar' +
    collapsedClass +
    '" id="sidebar">' +
    '<nav class="sidebar-nav">' +
    navHtml +
    "</nav>" +
    '<div class="workspace-selector">' +
    '<button class="workspace-btn" id="workspace-btn">' +
    '<span class="workspace-icon">' +
    workspaceInitial +
    "</span>" +
    '<span class="workspace-name">' +
    ERM.utils.escapeHtml(workspace.name) +
    "</span>" +
    "</button>" +
    (isOwner ?
      '<div class="dropdown" style="position: relative;">' +
      '<button class="workspace-add-btn" id="workspace-add-btn" aria-label="Workspace options">' +
      ERM.icons.plus +
      "</button>" +
      '<div class="dropdown-menu workspace-dropdown" id="workspace-dropdown">' +
      '<a href="#" class="dropdown-item" data-action="rename-workspace">' +
      ERM.icons.edit +
      "<span>Rename</span>" +
      "</a>" +
      '<a href="#" class="dropdown-item" data-action="create-workspace">' +
      ERM.icons.plus +
      "<span>Create Workspace</span>" +
      "</a>" +
      '<div class="dropdown-divider"></div>' +
      '<a href="#" class="dropdown-item danger" data-action="delete-workspace">' +
      ERM.icons.trash +
      "<span>Delete</span>" +
      "</a>" +
      "</div>" +
      "</div>" : '') +
    "</div>" +
    "</aside>" +
    '<div class="sidebar-overlay" id="sidebar-overlay"></div>';

  container.innerHTML = html;
  this.initSidebarEvents();
  console.log("Sidebar rendered successfully");
};

/**
 * Initialize sidebar event listeners
 */
ERM.components.initSidebarEvents = function () {
  var sidebar = document.getElementById("sidebar");
  var sidebarToggle = document.getElementById("sidebar-toggle");
  var sidebarOverlay = document.getElementById("sidebar-overlay");
  var collapseBtn = document.getElementById("sidebar-collapse-btn");

  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener("click", function () {
      sidebar.classList.toggle("collapsed");
      var isCollapsed = sidebar.classList.contains("collapsed");
      ERM.storage.set("sidebarCollapsed", isCollapsed);
      collapseBtn.title = isCollapsed ? "Expand" : "Collapse";

      var container = document.getElementById("sidebar-container");
      var mainContent = document.querySelector(".main-content");
      if (container) {
        container.classList.toggle("collapsed", isCollapsed);
      }
      if (mainContent) {
        mainContent.classList.toggle("sidebar-collapsed", isCollapsed);
      }
    });
  }

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", function () {
      sidebar.classList.toggle("mobile-open");
      if (sidebarOverlay) {
        sidebarOverlay.classList.toggle("active");
      }
    });
  }

  if (sidebarOverlay && sidebar) {
    sidebarOverlay.addEventListener("click", function () {
      sidebar.classList.remove("mobile-open");
      sidebarOverlay.classList.remove("active");
    });
  }

  var navItems = document.querySelectorAll(".nav-item");
  for (var i = 0; i < navItems.length; i++) {
    navItems[i].addEventListener("click", function (e) {
      e.preventDefault();
      var view = this.getAttribute("data-view");

      if (view === "logout") {
        ERM.session.logout();
        return;
      }

      // Open Help Center in new tab instead of inline view
      if (view === "help") {
        window.open("help/index.html", "_blank");
        return;
      }

      ERM.navigation.switchView(view);

      if (sidebar) {
        sidebar.classList.remove("mobile-open");
      }
      if (sidebarOverlay) {
        sidebarOverlay.classList.remove("active");
      }
    });
  }

  var workspaceBtn = document.getElementById("workspace-btn");
  if (workspaceBtn) {
    workspaceBtn.addEventListener("click", function () {
      ERM.toast.show({
        type: "info",
        message: "Workspace switcher coming soon!",
      });
    });
  }

  var workspaceAddBtn = document.getElementById("workspace-add-btn");
  var workspaceDropdown = document.getElementById("workspace-dropdown");
  if (workspaceAddBtn && workspaceDropdown) {
    workspaceAddBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      workspaceDropdown.classList.toggle("active");
    });
  }

  document.addEventListener("click", function (e) {
    if (
      workspaceDropdown &&
      !e.target.closest(".workspace-selector .dropdown")
    ) {
      workspaceDropdown.classList.remove("active");
    }
  });

  var workspaceActions = document.querySelectorAll(
    ".workspace-dropdown .dropdown-item"
  );
  for (var i = 0; i < workspaceActions.length; i++) {
    workspaceActions[i].addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      var action = this.getAttribute("data-action");
      if (workspaceDropdown) workspaceDropdown.classList.remove("active");

      switch (action) {
        case "rename-workspace":
          ERM.components.showRenameWorkspaceModal();
          break;
        case "create-workspace":
          ERM.components.showModal({
            title: "Upgrade to Create Workspaces",
            content: '<div style="text-align:center;padding:20px 0;">' +
              '<div style="font-size:48px;margin-bottom:16px;">🚀</div>' +
              '<p style="margin-bottom:16px;color:#475569;">Multiple workspaces allow you to organize risks by department, project, or client.</p>' +
              '<p style="color:#64748b;font-size:14px;">Upgrade to Pro to unlock this feature.</p>' +
              '</div>',
            buttons: [
              { label: "Maybe Later", type: "secondary", action: "close" },
              { label: "Upgrade to Pro", type: "primary", action: "upgrade" }
            ],
            onAction: function(action) {
              if (action === "upgrade") {
                window.location.href = "upgrade.html?source=workspace";
              }
            }
          });
          break;
        case "delete-workspace":
          ERM.components.showDeleteWorkspaceModal();
          break;
      }
    });
  }
};

ERM.components.showRenameWorkspaceModal = function () {
  // Check if user is workspace owner
  var currentUser = ERM.state.user;
  var workspace = ERM.state.workspace || { name: "My Workspace" };

  var isOwner = currentUser && (
    currentUser.role === 'owner' ||
    currentUser.isWorkspaceOwner ||
    (workspace.ownerId && workspace.ownerId === currentUser.id)
  );

  if (!isOwner) {
    ERM.toast.error('Only the workspace owner can rename the workspace.');
    return;
  }

  var content =
    '<div class="form-group">' +
    '<label class="form-label required">Workspace Name</label>' +
    '<input type="text" class="form-input" id="rename-workspace-input" value="' +
    ERM.utils.escapeHtml(workspace.name) +
    '" placeholder="Enter workspace name">' +
    "</div>";

  ERM.components.showModal({
    title: "Rename Workspace",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Save", type: "primary", action: "save" },
    ],
    onAction: function (action) {
      if (action === "save") {
        var newName = document
          .getElementById("rename-workspace-input")
          .value.trim();

        if (!newName) {
          ERM.toast.error("Please enter a workspace name");
          return;
        }

        ERM.state.workspace = { name: newName };
        ERM.storage.set("currentWorkspace", ERM.state.workspace);

        ERM.components.closeModal();
        ERM.toast.success("Workspace renamed");

        ERM.components.renderSidebar(
          "sidebar-container",
          ERM.state.currentView
        );
      }
    },
    onOpen: function () {
      setTimeout(function () {
        var input = document.getElementById("rename-workspace-input");
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
    },
  });
};

ERM.components.showDeleteWorkspaceModal = function () {
  var workspace = ERM.state.workspace || { name: "My Workspace" };

  var content =
    '<div class="delete-warning" style="text-align: center;">' +
    '<div style="font-size: 3rem; margin-bottom: 16px;">⚠️</div>' +
    '<p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 12px;">Delete "' +
    ERM.utils.escapeHtml(workspace.name) +
    '"?</p>' +
    '<p style="color: var(--text-secondary); margin-bottom: 16px;">This action is <strong>permanent and cannot be undone</strong>.</p>' +
    '<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; text-align: left; margin-bottom: 16px;">' +
    '<p style="font-weight: 600; color: #991b1b; margin-bottom: 8px;">The following will be permanently deleted:</p>' +
    '<ul style="margin: 0; padding-left: 20px; color: #991b1b; font-size: 0.875rem;">' +
    "<li>All risk registers and their risks</li>" +
    "<li>All controls and reports</li>" +
    "<li>All team member access and invitations</li>" +
    "<li>All workspace settings and data</li>" +
    "</ul>" +
    "</div>" +
    '<div class="form-group" style="text-align: left;">' +
    '<label class="form-label">Type <strong>' +
    ERM.utils.escapeHtml(workspace.name) +
    "</strong> to confirm:</label>" +
    '<input type="text" class="form-input" id="confirm-workspace-delete" placeholder="Enter workspace name">' +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: "Delete Workspace",
    content: content,
    size: "lg",
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Delete Workspace", type: "danger", action: "delete" },
    ],
    onAction: function (action) {
      if (action === "delete") {
        var confirmInput = document.getElementById("confirm-workspace-delete");
        var enteredName = confirmInput ? confirmInput.value.trim() : "";

        if (enteredName !== workspace.name) {
          ERM.toast.error(
            "Workspace name does not match. Please type the exact name to confirm."
          );
          return;
        }

        ERM.storage.remove("registers");
        ERM.storage.remove("risks");
        ERM.storage.remove("workspaceMembers");
        ERM.storage.remove("currentWorkspace");

        sessionStorage.removeItem("ermUser");
        sessionStorage.removeItem("ermLoggedIn");

        ERM.components.closeModal();
        ERM.toast.success("Workspace deleted. Redirecting...");

        setTimeout(function () {
          window.location.href = "login.html";
        }, 1500);
      }
    },
  });
};

ERM.components.showHelpModal = function () {
  var content =
    '<div class="help-content">' +
    '<div class="help-section">' +
    "<h4>Getting Started</h4>" +
    "<p>Welcome to Dimeri ERM! Here's how to get started:</p>" +
    '<ul style="margin: 12px 0; padding-left: 20px; color: var(--text-secondary);">' +
    "<li>Create a Risk Register from the Risk Register page</li>" +
    "<li>Add risks manually or use an industry template</li>" +
    "<li>Invite team members to collaborate</li>" +
    "<li>Track and manage your organization's risks</li>" +
    "</ul>" +
    "</div>" +
    '<div class="help-section" style="margin-top: 20px;">' +
    "<h4>Need More Help?</h4>" +
    "<p>Contact our support team:</p>" +
    '<p style="margin-top: 8px;">' +
    "<strong>Email:</strong> support@dimeri.ai<br>" +
    '<strong>Documentation:</strong> <a href="#" style="color: var(--primary-color);">docs.dimeri.ai</a>' +
    "</p>" +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: "Help & Support",
    content: content,
    buttons: [{ label: "Close", type: "primary", action: "close" }],
  });
};

ERM.components.showResetConfirmModal = function () {
  var content =
    '<div class="reset-confirm-content">' +
    "<p>This will clear all demo data including:</p>" +
    "<ul>" +
    "<li>All risk registers and risks</li>" +
    "<li>User session data</li>" +
    "<li>Workspace settings</li>" +
    "<li>Welcome message preferences</li>" +
    "</ul>" +
    '<p class="reset-warning">This action cannot be undone.</p>' +
    "</div>";

  ERM.components.showModal({
    title: ERM.icons.refresh + " Reset Demo",
    content: content,
    buttons: [
      { label: "Cancel", type: "secondary", action: "close" },
      { label: "Reset Everything", type: "danger", action: "reset" },
    ],
    onAction: function (action) {
      if (action === "reset") {
        ERM.resetDemo();
      }
    },
  });
};

/**
 * Show Profile Modal
 */
ERM.components.showProfileModal = function () {
  var user = ERM.state.user || { name: 'User', email: '', role: 'Risk Manager' };
  var initials = ERM.utils.getInitials(user.name || 'User');
  var workspace = ERM.state.workspace || { name: 'My Workspace' };

  // Check if user is workspace owner
  var isOwner = user && (
    user.role === 'owner' ||
    user.isWorkspaceOwner ||
    (workspace.ownerId && workspace.ownerId === user.id)
  );

  var ownerBadge = isOwner ? '' : ' <span class="settings-owner-badge">Owner Only</span>';
  var disabledAttr = isOwner ? '' : ' disabled';

  // Calculate stats
  var risks = ERM.storage.get('risks') || [];
  var controls = ERM.storage.get('controls') || [];
  var activities = ERM.storage.get('activities') || [];

  var content =
    '<div class="profile-modal">' +
    // Profile header
    '<div class="profile-header">' +
    '<div class="profile-avatar-large">' + initials + '</div>' +
    '<div class="profile-info">' +
    '<h3 class="profile-name">' + ERM.utils.escapeHtml(user.name || 'User') + '</h3>' +
    '<p class="profile-email">' + ERM.utils.escapeHtml(user.email || 'No email set') + '</p>' +
    '<span class="profile-role">' + ERM.utils.escapeHtml(user.role || 'Risk Manager') + '</span>' +
    '</div>' +
    '</div>' +

    // Edit profile form
    '<div class="profile-form">' +
    '<div class="form-group">' +
    '<label class="form-label">Full Name</label>' +
    '<input type="text" class="form-input" id="profile-name" value="' + ERM.utils.escapeHtml(user.name || '') + '" placeholder="Your name" />' +
    '</div>' +
    '<div class="form-group">' +
    '<label class="form-label">Job Title / Role</label>' +
    '<input type="text" class="form-input" id="profile-role" value="' + ERM.utils.escapeHtml(user.role || '') + '" placeholder="e.g. Risk Manager" />' +
    '</div>' +
    '<div class="form-group">' +
    '<label class="form-label">Workspace' + ownerBadge + '</label>' +
    '<input type="text" class="form-input" id="profile-workspace" value="' + ERM.utils.escapeHtml(workspace.name || '') + '" placeholder="Workspace name"' + disabledAttr + ' />' +
    '</div>' +
    '</div>' +

    // Upgrade banner
    '<div class="profile-upgrade-banner">' +
    '<div class="upgrade-banner-icon">⭐</div>' +
    '<div class="upgrade-banner-content">' +
    '<div class="upgrade-banner-title">Upgrade to Pro</div>' +
    '<div class="upgrade-banner-desc">Unlock AI features, team collaboration & more</div>' +
    '</div>' +
    '<button class="btn btn-primary btn-sm" id="profile-upgrade-btn">Upgrade</button>' +
    '</div>' +
    '</div>';

  ERM.components.showModal({
    title: ERM.icons.user + ' My Profile',
    content: content,
    size: 'lg',
    buttons: [
      { label: 'Cancel', type: 'secondary', action: 'close' },
      { label: 'Save Changes', type: 'primary', action: 'save' }
    ],
    onAction: function (action) {
      if (action === 'save') {
        ERM.components.saveProfileChanges();
      }
    }
  });

  // Bind upgrade button
  setTimeout(function () {
    var upgradeBtn = document.getElementById('profile-upgrade-btn');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        ERM.components.closeModal();
        window.location.href = 'upgrade.html';
      });
    }
  }, 100);
};

/**
 * Save profile changes
 */
ERM.components.saveProfileChanges = function () {
  var nameInput = document.getElementById('profile-name');
  var roleInput = document.getElementById('profile-role');
  var workspaceInput = document.getElementById('profile-workspace');

  if (nameInput && ERM.state.user) {
    ERM.state.user.name = nameInput.value.trim() || ERM.state.user.name;
  }
  if (roleInput && ERM.state.user) {
    ERM.state.user.role = roleInput.value.trim() || ERM.state.user.role;
  }
  if (workspaceInput) {
    // Check if user is workspace owner before allowing workspace name change
    var currentUser = ERM.state.user;
    var currentWorkspace = ERM.state.workspace;

    var isOwner = currentUser && (
      currentUser.role === 'owner' ||
      currentUser.isWorkspaceOwner ||
      (currentWorkspace && currentWorkspace.ownerId && currentWorkspace.ownerId === currentUser.id)
    );

    if (!isOwner) {
      ERM.toast.error('Only the workspace owner can change the workspace name.');
      return;
    }

    ERM.state.workspace = { name: workspaceInput.value.trim() || 'My Workspace' };
    ERM.storage.set('currentWorkspace', ERM.state.workspace);
  }

  // Save user
  ERM.session.setUser(ERM.state.user);

  // Refresh header and sidebar
  ERM.components.renderHeader('header-container');
  ERM.components.renderSidebar('sidebar-container', ERM.state.currentView);

  ERM.components.closeModal();
  ERM.toast.success('Profile updated successfully');
};

/**
 * Show Change Password Modal
 */
ERM.components.showChangePasswordModal = function () {
  var content =
    '<div class="change-password-modal">' +
    '<p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">Create a new password for your account. Password must be at least 8 characters long.</p>' +
    '<div class="form-group">' +
    '<label class="form-label">Current Password</label>' +
    '<div class="password-input-wrapper">' +
    '<input type="password" class="form-input" id="current-password" placeholder="Enter current password" />' +
    '<button type="button" class="password-toggle-btn" onclick="ERM.components.togglePasswordVisibility(\'current-password\', this)">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
    '</button>' +
    '</div>' +
    '</div>' +
    '<div class="form-group">' +
    '<label class="form-label">New Password</label>' +
    '<div class="password-input-wrapper">' +
    '<input type="password" class="form-input" id="new-password" placeholder="Enter new password" />' +
    '<button type="button" class="password-toggle-btn" onclick="ERM.components.togglePasswordVisibility(\'new-password\', this)">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
    '</button>' +
    '</div>' +
    '</div>' +
    '<div class="form-group">' +
    '<label class="form-label">Confirm New Password</label>' +
    '<div class="password-input-wrapper">' +
    '<input type="password" class="form-input" id="confirm-password" placeholder="Confirm new password" />' +
    '<button type="button" class="password-toggle-btn" onclick="ERM.components.togglePasswordVisibility(\'confirm-password\', this)">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
    '</button>' +
    '</div>' +
    '</div>' +
    '<div class="password-requirements">' +
    '<p style="font-size: 12px; color: #6b7280; margin: 0;">Password requirements:</p>' +
    '<ul style="font-size: 12px; color: #6b7280; margin: 8px 0 0; padding-left: 20px;">' +
    '<li>At least 8 characters</li>' +
    '<li>At least one uppercase letter</li>' +
    '<li>At least one number</li>' +
    '</ul>' +
    '</div>' +
    '</div>';

  ERM.components.showModal({
    title: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 8px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Change Password',
    content: content,
    size: 'sm',
    buttons: [
      { label: 'Cancel', type: 'secondary', action: 'close' },
      { label: 'Update Password', type: 'primary', action: 'save' }
    ],
    onAction: function (action) {
      if (action === 'save') {
        ERM.components.savePasswordChange();
      }
    }
  });
};

/**
 * Toggle password visibility
 */
ERM.components.togglePasswordVisibility = function (inputId, btn) {
  var input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
  } else {
    input.type = 'password';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  }
};

/**
 * Save password change
 */
ERM.components.savePasswordChange = function () {
  var currentPassword = document.getElementById('current-password');
  var newPassword = document.getElementById('new-password');
  var confirmPassword = document.getElementById('confirm-password');

  if (!currentPassword || !newPassword || !confirmPassword) return;

  var current = currentPassword.value;
  var newPwd = newPassword.value;
  var confirm = confirmPassword.value;

  // Validation
  if (!current) {
    ERM.toast.error('Please enter your current password');
    return;
  }

  if (!newPwd) {
    ERM.toast.error('Please enter a new password');
    return;
  }

  if (newPwd.length < 8) {
    ERM.toast.error('Password must be at least 8 characters');
    return;
  }

  if (!/[A-Z]/.test(newPwd)) {
    ERM.toast.error('Password must contain at least one uppercase letter');
    return;
  }

  if (!/[0-9]/.test(newPwd)) {
    ERM.toast.error('Password must contain at least one number');
    return;
  }

  if (newPwd !== confirm) {
    ERM.toast.error('Passwords do not match');
    return;
  }

  // Simulate password change (demo mode)
  ERM.components.closeModal();
  ERM.toast.success('Password changed successfully');

  // Log activity
  if (ERM.activityLogger) {
    ERM.activityLogger.log('user', 'updated', 'password', 'Password changed', {});
  }
};

/**
 * Show Quick Invite Modal
 * Allows inviting team members via email or shareable link
 */
ERM.components.showQuickInviteModal = function () {
  // Check permission - only owners can invite
  if (ERM.permissions && !ERM.permissions.canInviteMembers()) {
    ERM.components.showToast('Only workspace owner can invite members', 'error');
    return;
  }

  // Generate a shareable invite link (mock for demo)
  var inviteCode = ERM.utils.generateId('inv').substring(0, 8).toUpperCase();
  var inviteLink = window.location.origin + '/invite/' + inviteCode;

  var content =
    '<div class="quick-invite-modal">' +
    // Invite description
    '<p class="invite-description">Invite team members to collaborate on your risk management workspace.</p>' +

    // Method tabs
    '<div class="invite-method-tabs">' +
    '<button class="invite-tab active" data-tab="email">Invite with Email</button>' +
    '<button class="invite-tab" data-tab="link">Invite with Link</button>' +
    '</div>' +

    // Email invite panel
    '<div class="invite-panel" id="email-panel">' +
    '<div class="form-group">' +
    '<label class="form-label">Email Address</label>' +
    '<input type="email" class="form-input" id="invite-email" placeholder="colleague@company.com" />' +
    '</div>' +
    '<div class="form-group">' +
    '<label class="form-label">Role</label>' +
    '<select class="form-input" id="invite-role">' +
    '<option value="viewer">Viewer - Can view risks and reports</option>' +
    '<option value="editor" selected>Editor - Can edit risks and controls</option>' +
    '<option value="admin">Admin - Full access to all features</option>' +
    '</select>' +
    '</div>' +
    '<div class="form-group">' +
    '<label class="form-label">Personal Message (optional)</label>' +
    '<textarea class="form-input" id="invite-message" rows="2" placeholder="I\'d like you to join our risk management workspace..."></textarea>' +
    '</div>' +
    '<button class="btn btn-primary btn-full" id="send-invite-btn">' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>' +
    ' Send Invitation' +
    '</button>' +
    '</div>' +

    // Link invite panel (hidden by default)
    '<div class="invite-panel" id="link-panel" style="display: none;">' +
    '<div class="invite-link-box">' +
    '<div class="invite-link-header">' +
    '<span class="invite-link-icon">🔗</span>' +
    '<span>Shareable Invite Link</span>' +
    '</div>' +
    '<div class="invite-link-value">' +
    '<input type="text" class="form-input" id="invite-link-input" value="' + inviteLink + '" readonly />' +
    '<button class="btn btn-secondary" id="copy-link-btn">' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>' +
    ' Copy' +
    '</button>' +
    '</div>' +
    '<p class="invite-link-note">Anyone with this link can request to join your workspace. The link expires in 7 days.</p>' +
    '</div>' +
    '<div class="invite-link-options">' +
    '<label class="form-label">Default role for new members</label>' +
    '<select class="form-input" id="link-default-role">' +
    '<option value="viewer">Viewer</option>' +
    '<option value="editor" selected>Editor</option>' +
    '</select>' +
    '</div>' +
    '</div>' +

    // Existing members section
    '<div class="invite-members-section">' +
    '<div class="invite-members-header">' +
    '<span>Workspace Members</span>' +
    '<button class="btn btn-sm btn-ghost" id="manage-members-btn">Manage</button>' +
    '</div>' +
    '<div class="invite-members-list" id="current-members-list">' +
    ERM.components.buildMembersList() +
    '</div>' +
    '</div>' +
    '</div>';

  ERM.components.showModal({
    title: '👥 Invite Team Members',
    content: content,
    size: 'md',
    buttons: [
      { label: 'Done', type: 'secondary', action: 'close' }
    ],
    onOpen: function () {
      ERM.components.initQuickInviteEvents();
    }
  });
};

/**
 * Build members list for invite modal
 */
ERM.components.buildMembersList = function () {
  var members = ERM.storage.get('workspaceMembers') || [];
  var user = ERM.state.user || { name: 'You', email: '' };

  var html = '<div class="member-item">' +
    '<div class="member-avatar" style="background: #c41e3a;">' + ERM.utils.getInitials(user.name) + '</div>' +
    '<div class="member-info">' +
    '<span class="member-name">' + ERM.utils.escapeHtml(user.name) + ' (You)</span>' +
    '<span class="member-role">Owner</span>' +
    '</div>' +
    '</div>';

  if (members.length === 0) {
    html += '<div class="no-members-text">No other members yet</div>';
  } else {
    for (var i = 0; i < members.length && i < 3; i++) {
      var member = members[i];
      var initials = ERM.team ? ERM.team.getInitials(member.name) : member.name.charAt(0);
      html += '<div class="member-item">' +
        '<div class="member-avatar" style="background: ' + (member.color || '#3b82f6') + ';">' + initials + '</div>' +
        '<div class="member-info">' +
        '<span class="member-name">' + ERM.utils.escapeHtml(member.name) + '</span>' +
        '<span class="member-role">Member</span>' +
        '</div>' +
        '</div>';
    }
    if (members.length > 3) {
      html += '<div class="members-more">+' + (members.length - 3) + ' more</div>';
    }
  }

  return html;
};

/**
 * Initialize quick invite modal events
 */
ERM.components.initQuickInviteEvents = function () {
  // Tab switching
  var tabs = document.querySelectorAll('.invite-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function () {
      var tabName = this.getAttribute('data-tab');

      // Update active tab
      for (var j = 0; j < tabs.length; j++) {
        tabs[j].classList.remove('active');
      }
      this.classList.add('active');

      // Show/hide panels
      document.getElementById('email-panel').style.display = tabName === 'email' ? 'block' : 'none';
      document.getElementById('link-panel').style.display = tabName === 'link' ? 'block' : 'none';
    });
  }

  // Send invite button
  var sendBtn = document.getElementById('send-invite-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', function () {
      var email = document.getElementById('invite-email').value.trim();
      var role = document.getElementById('invite-role').value;

      if (!email) {
        ERM.toast.error('Please enter an email address');
        return;
      }

      if (!ERM.utils.validateEmail(email)) {
        ERM.toast.error('Please enter a valid email address');
        return;
      }

      // Add to workspace members
      var members = ERM.storage.get('workspaceMembers') || [];

      // Check for duplicate
      for (var i = 0; i < members.length; i++) {
        if (members[i].email.toLowerCase() === email.toLowerCase()) {
          ERM.toast.error('This person is already in your workspace');
          return;
        }
      }

      var colors = ['#3b82f6', '#2563eb', '#ec4899', '#f43f5e', '#f97316', '#22c55e', '#14b8a6', '#0ea5e9'];
      var randomColor = colors[Math.floor(Math.random() * colors.length)];

      var newMember = {
        id: ERM.utils.generateId('member'),
        name: email.split('@')[0], // Use email prefix as name
        email: email,
        role: role,
        color: randomColor,
        status: 'pending',
        invitedAt: new Date().toISOString()
      };

      members.push(newMember);
      ERM.storage.set('workspaceMembers', members);

      // Update the members list in modal
      var membersList = document.getElementById('current-members-list');
      if (membersList) {
        membersList.innerHTML = ERM.components.buildMembersList();
      }

      // Clear the input
      document.getElementById('invite-email').value = '';

      ERM.toast.success('Invitation sent to ' + email);

      // Log activity
      if (ERM.activity && ERM.activity.log) {
        ERM.activity.log('invite', 'Invited ' + email + ' as ' + role);
      }
    });
  }

  // Copy link button
  var copyBtn = document.getElementById('copy-link-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var linkInput = document.getElementById('invite-link-input');
      if (linkInput) {
        linkInput.select();
        document.execCommand('copy');

        // Update button text temporarily
        var originalText = this.innerHTML;
        this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        this.classList.add('btn-success');

        var btn = this;
        setTimeout(function () {
          btn.innerHTML = originalText;
          btn.classList.remove('btn-success');
        }, 2000);

        ERM.toast.success('Link copied to clipboard');
      }
    });
  }

  // Manage members button
  var manageBtn = document.getElementById('manage-members-btn');
  if (manageBtn) {
    manageBtn.addEventListener('click', function () {
      ERM.components.closeModal();
      setTimeout(function () {
        if (ERM.team && ERM.team.showInviteModal) {
          ERM.team.showInviteModal({
            title: 'Manage Workspace Members'
          });
        }
      }, 250);
    });
  }

  // Focus email input
  setTimeout(function () {
    var emailInput = document.getElementById('invite-email');
    if (emailInput) emailInput.focus();
  }, 100);
};

/**
 * Validate email format
 */
if (!ERM.utils.validateEmail) {
  ERM.utils.validateEmail = function (email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
}

ERM.components.showWelcomeModal = function () {
  var aiIcon =
    '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>';

  var content =
    '<div class="welcome-modal">' +
    '<div class="welcome-header">' +
    '<div class="welcome-logo">' +
    '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2">' +
    '<path d="M20 4L4 12v16l16 8 16-8V12L20 4z"/>' +
    '<path d="M4 12l16 8 16-8"/>' +
    '<path d="M20 20v16"/>' +
    "</svg>" +
    "</div>" +
    "<h2>Welcome to Dimeri.ai</h2>" +
    '<p class="welcome-subtitle">Enterprise Risk Management Platform</p>' +
    "</div>" +
    '<div class="welcome-features">' +
    '<div class="welcome-feature">' +
    '<div class="feature-icon">' +
    ERM.icons.fileText +
    "</div>" +
    '<div class="feature-text">' +
    "<strong>Risk Registers</strong>" +
    "<span>Create and manage ISO 31000 compliant risk registers</span>" +
    "</div>" +
    "</div>" +
    '<div class="welcome-feature">' +
    '<div class="feature-icon">' +
    aiIcon +
    "</div>" +
    '<div class="feature-text">' +
    "<strong>AI-Powered Assistance</strong>" +
    "<span>Get intelligent suggestions for causes, controls & treatments</span>" +
    "</div>" +
    "</div>" +
    '<div class="welcome-feature">' +
    '<div class="feature-icon">' +
    ERM.icons.shield +
    "</div>" +
    '<div class="feature-text">' +
    "<strong>COSO Framework Aligned</strong>" +
    "<span>Built on industry-standard risk management frameworks</span>" +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="welcome-preview">' +
    '<div class="preview-label">Dashboard Preview</div>' +
    '<div class="preview-dashboard">' +
    '<div class="preview-header">' +
    '<div class="preview-title">Risk Overview</div>' +
    '<div class="preview-date">December 2025</div>' +
    "</div>" +
    '<div class="preview-stats">' +
    '<div class="preview-stat">' +
    '<div class="stat-value critical">12</div>' +
    '<div class="stat-label">Critical</div>' +
    "</div>" +
    '<div class="preview-stat">' +
    '<div class="stat-value high">24</div>' +
    '<div class="stat-label">High</div>' +
    "</div>" +
    '<div class="preview-stat">' +
    '<div class="stat-value medium">38</div>' +
    '<div class="stat-label">Medium</div>' +
    "</div>" +
    '<div class="preview-stat">' +
    '<div class="stat-value low">56</div>' +
    '<div class="stat-label">Low</div>' +
    "</div>" +
    "</div>" +
    '<div class="preview-heatmap">' +
    '<div class="heatmap-row">' +
    '<div class="heatmap-cell medium"></div>' +
    '<div class="heatmap-cell high"></div>' +
    '<div class="heatmap-cell high"></div>' +
    '<div class="heatmap-cell critical"></div>' +
    '<div class="heatmap-cell critical"></div>' +
    "</div>" +
    '<div class="heatmap-row">' +
    '<div class="heatmap-cell low"></div>' +
    '<div class="heatmap-cell medium"></div>' +
    '<div class="heatmap-cell high"></div>' +
    '<div class="heatmap-cell high"></div>' +
    '<div class="heatmap-cell critical"></div>' +
    "</div>" +
    '<div class="heatmap-row">' +
    '<div class="heatmap-cell low"></div>' +
    '<div class="heatmap-cell medium"></div>' +
    '<div class="heatmap-cell medium"></div>' +
    '<div class="heatmap-cell high"></div>' +
    '<div class="heatmap-cell high"></div>' +
    "</div>" +
    '<div class="heatmap-row">' +
    '<div class="heatmap-cell low"></div>' +
    '<div class="heatmap-cell low"></div>' +
    '<div class="heatmap-cell medium"></div>' +
    '<div class="heatmap-cell medium"></div>' +
    '<div class="heatmap-cell high"></div>' +
    "</div>" +
    '<div class="heatmap-row">' +
    '<div class="heatmap-cell low"></div>' +
    '<div class="heatmap-cell low"></div>' +
    '<div class="heatmap-cell low"></div>' +
    '<div class="heatmap-cell medium"></div>' +
    '<div class="heatmap-cell medium"></div>' +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="welcome-tip">' +
    aiIcon +
    "<span>Tip: Click the purple AI button anytime for intelligent assistance</span>" +
    "</div>" +
    "</div>";

  ERM.components.showModal({
    title: "",
    content: content,
    size: "lg",
    buttons: [{ label: "Get Started", type: "primary", action: "close" }],
    onAction: function () {
      ERM.storage.set("welcomeSeen", true);
      ERM.components.closeModal();
    },
  });
};

ERM.components.renderAIButton = function (containerId) {
  console.log("Rendering AI button to:", containerId);
  var container = document.getElementById(containerId);
  if (!container) {
    console.error("AI button container not found:", containerId);
    return;
  }

  var html =
    '<button class="ai-float-btn" id="ai-float-btn" aria-label="AI Situation Review" title="Review risk posture">' +
    '<span class="ai-float-icon">&#10024;AI</span>' +
    "</button>" +
    '<div class="ai-panel" id="ai-panel">' +
    '<div class="ai-panel-header">' +
    '<span class="ai-panel-title">' +
    "AI Situation Review" +
    "</span>" +
    '<button class="ai-panel-close" id="ai-panel-close">' +
    ERM.icons.close +
    "</button>" +
    "</div>" +
    '<div class="ai-panel-context" id="ai-panel-context">Based on: Dashboard</div>' +
    '<div class="ai-panel-body" id="ai-panel-body"></div>' +
    "</div>";

  container.innerHTML = html;
  this.initAIButtonEvents();
  this.updateAIPanel("dashboard");
  console.log("AI button rendered successfully");
};

ERM.components.initAIButtonEvents = function () {
  var aiBtn = document.getElementById("ai-float-btn");
  var aiPanel = document.getElementById("ai-panel");
  var aiPanelClose = document.getElementById("ai-panel-close");

  if (aiBtn && aiPanel) {
    aiBtn.addEventListener("click", function () {
      aiPanel.classList.toggle("active");
    });
  }

  if (aiPanelClose && aiPanel) {
    aiPanelClose.addEventListener("click", function () {
      aiPanel.classList.remove("active");
    });
  }

  document.addEventListener("click", function (e) {
    if (aiPanel && aiBtn) {
      if (!aiPanel.contains(e.target) && !aiBtn.contains(e.target)) {
        aiPanel.classList.remove("active");
      }
    }
  });
};

ERM.components.updateAIPanel = function (view) {
  var contextEl = document.getElementById("ai-panel-context");
  var bodyEl = document.getElementById("ai-panel-body");

  if (!contextEl || !bodyEl) return;

  var actions = {
    dashboard: [
      { icon: "eye", label: "Explain this heatmap" },
      { icon: "barChart", label: "Identify risk trends" },
      { icon: "sparkles", label: "Generate insights" },
    ],
    "risk-register": [
      { icon: "edit", label: "Suggest wording" },
      { icon: "checkCircle", label: "Check completeness" },
      { icon: "shield", label: "Generate controls" },
    ],
    controls: [
      { icon: "plus", label: "Suggest additional controls" },
      { icon: "eye", label: "Explain effectiveness" },
    ],
    reports: [
      { icon: "fileText", label: "Draft section" },
      { icon: "edit", label: "Improve clarity" },
      { icon: "sparkles", label: "Summarize risks" },
    ],
    settings: [{ icon: "sparkles", label: "Help me configure" }],
  };

  var viewLabels = {
    dashboard: "Dashboard",
    "risk-register": "Risk Register",
    controls: "Controls",
    reports: "Reports",
    settings: "Settings",
  };

  contextEl.textContent = "Based on: " + (viewLabels[view] || "Dashboard");

  var viewActions = actions[view] || actions["dashboard"];
  var html = "";

  for (var i = 0; i < viewActions.length; i++) {
    var action = viewActions[i];
    var icon = ERM.icons[action.icon] || "";
    html +=
      '<button class="ai-action-btn" data-action="' +
      action.label +
      '">' +
      icon +
      "<span>" +
      action.label +
      "</span>" +
      "</button>";
  }

  bodyEl.innerHTML = html;

  var btns = bodyEl.querySelectorAll(".ai-action-btn");
  for (var j = 0; j < btns.length; j++) {
    btns[j].addEventListener("click", function () {
      var actionLabel = this.getAttribute("data-action");
      ERM.toast.show({
        type: "info",
        message: "AI: " + actionLabel + "...",
      });
      document.getElementById("ai-panel").classList.remove("active");
    });
  }
};

ERM.components._modalVersion = 0;
ERM.components._currentModalOptions = null;
ERM.components._modalHistory = []; // Stack for modal navigation (parent modals)

/**
 * Internal function to render and display a modal
 * @private
 */
ERM.components._renderModal = function (options) {
  var modalContainer = document.getElementById("modal-container");
  if (!modalContainer) {
    modalContainer = document.createElement("div");
    modalContainer.id = "modal-container";
    document.body.appendChild(modalContainer);
  }

  // Map size options to spec-compliant sizes
  var sizeClass = "";
  var size = options.size || "md";
  if (size === "sm" || size === "small") sizeClass = " modal-sm";
  else if (size === "lg" || size === "large") sizeClass = " modal-lg";
  else if (size === "xl") sizeClass = " modal-lg"; // XL maps to LG per spec (max 880px)
  else if (size === "fullscreen") sizeClass = " modal-fullscreen";
  else sizeClass = " modal-md"; // Default to MD

  // Intent class for styling (ai, upgrade, danger, success)
  var intentClass = "";
  if (options.intent && options.intent !== "default") {
    intentClass = " modal-" + options.intent;
  }

  // Variant class on modal-overlay for content-specific styling
  // This replaces :has() CSS hacks with proper class-based patterns
  // Variants: 'thinking', 'portfolio', 'compact', 'form-tooltips'
  var variantClass = "";
  if (options.variant) {
    variantClass = " modal-" + options.variant;
  }

  var footerHtml = "";
  if (options.footer !== false && options.buttons) {
    var buttonsHtml = "";
    for (var i = 0; i < options.buttons.length; i++) {
      var btn = options.buttons[i];
      buttonsHtml +=
        '<button class="btn btn-' +
        btn.type +
        '" data-action="' +
        btn.action +
        '">' +
        btn.label +
        "</button>";
    }
    footerHtml = '<div class="modal-footer">' + buttonsHtml + "</div>";
  }

  var html =
    '<div class="modal-overlay' + variantClass + '" id="modal-overlay">' +
    '<div class="modal' +
    sizeClass +
    intentClass +
    '">' +
    '<div class="modal-header">' +
    '<h3 class="modal-title">' +
    (options.title || "Modal") +
    "</h3>" +
    '<button class="modal-close" id="modal-close">' +
    ERM.icons.close +
    "</button>" +
    "</div>" +
    '<div class="modal-body">' +
    (options.content || "") +
    "</div>" +
    footerHtml +
    "</div>" +
    "</div>";

  modalContainer.innerHTML = html;

  // Add body class for modal supremacy (disable background)
  document.body.classList.add("modal-open");

  var overlay = document.getElementById("modal-overlay");
  setTimeout(function () {
    overlay.classList.add("active");
  }, 10);

  var closeBtn = document.getElementById("modal-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      ERM.components.closeModal();
    });
  }

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      ERM.components.closeModal();
    }
  });

  if (options.buttons) {
    var actionBtns = modalContainer.querySelectorAll("[data-action]");
    for (var j = 0; j < actionBtns.length; j++) {
      actionBtns[j].addEventListener("click", function () {
        var action = this.getAttribute("data-action");
        if (action === "close") {
          ERM.components.closeModal();
        } else if (options.onAction) {
          options.onAction(action);
        }
      });
    }
  }

  if (options.onOpen) {
    setTimeout(function () {
      options.onOpen();
    }, 200);
  }
};

/**
 * Show a modal - Primary modal function
 * Clears any modal history (fresh start)
 *
 * @param {Object} options
 * @param {string} options.title - Modal title
 * @param {string} options.content - Modal body content (HTML string)
 * @param {string} options.size - 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'
 * @param {string} options.intent - 'default' | 'ai' | 'upgrade' | 'danger' | 'success'
 * @param {string} options.variant - Content variant: 'thinking' | 'portfolio' | 'compact' | 'form-tooltips'
 * @param {Array} options.buttons - Array of {type, action, label}
 * @param {Function} options.onAction - Callback for button actions
 * @param {Function} options.onOpen - Callback when modal opens
 * @param {Function} options.onClose - Callback when modal closes
 */
ERM.components.showModal = function (options) {
  // Increment version to invalidate any pending close operations
  ERM.components._modalVersion++;

  // Clear modal history - this is a fresh modal, not a child
  ERM.components._modalHistory = [];
  ERM.components._currentModalOptions = options;

  ERM.components._renderModal(options);
};

/**
 * Close the current modal
 * If there's a parent modal in history, it will be restored
 *
 * @param {Function} afterRestoreCallback - Optional callback to run AFTER parent modal is restored
 */
ERM.components.closeModal = function (afterRestoreCallback) {
  var overlay = document.getElementById("modal-overlay");
  var options = ERM.components._currentModalOptions;

  if (overlay) {
    overlay.classList.remove("active");
    // Capture current version to check if a new modal was opened
    var versionAtClose = ERM.components._modalVersion;
    setTimeout(function () {
      // Only clear if no new modal has been opened since close was called
      if (ERM.components._modalVersion === versionAtClose) {
        var container = document.getElementById("modal-container");
        if (container) {
          container.innerHTML = "";
        }
        // Remove body class
        document.body.classList.remove("modal-open");
        ERM.components._currentModalOptions = null;

        // Call onClose callback if provided
        if (options && options.onClose) {
          options.onClose();
        }

        // Check if we should restore a parent modal
        if (ERM.components._modalHistory.length > 0) {
          var parentModal = ERM.components._modalHistory.pop();
          // Re-render the parent modal after a brief delay
          setTimeout(function () {
            ERM.components._modalVersion++;
            ERM.components._currentModalOptions = parentModal;
            ERM.components._renderModal(parentModal);

            // Run afterRestoreCallback AFTER parent modal is rendered AND onOpen completes
            // onOpen runs at 200ms, so we wait 300ms to ensure form is fully initialized
            if (afterRestoreCallback) {
              setTimeout(function() {
                afterRestoreCallback();
              }, 300);
            }
          }, 50);
        } else if (afterRestoreCallback) {
          // No parent modal, just run callback
          afterRestoreCallback();
        }
      }
    }, 200);
  }
};

/**
 * Close secondary modal and return to parent, then run callback
 *
 * @param {Function} afterRestoreCallback - Callback to run after parent modal is restored
 */
ERM.components.closeSecondaryModal = function (afterRestoreCallback) {
  ERM.components.closeModal(afterRestoreCallback);
};

/**
 * Run a callback after the secondary modal closes and the parent is restored
 *
 * @param {Function} fn - Callback to run after modal restore
 */
ERM.components.applyAfterModalClose = function (fn) {
  ERM.components.closeSecondaryModal(function () {
    if (fn) {
      fn();
    }
  });
};

/**
 * Modal transition helper with lifecycle hooks
 */
ERM.components.modalManager = {
  open: function (options, hooks) {
    hooks = hooks || {};
    if (hooks.beforeOpen) {
      hooks.beforeOpen();
    }
    var originalOnOpen = options.onOpen;
    options.onOpen = function () {
      if (originalOnOpen) {
        originalOnOpen();
      }
      if (hooks.afterOpen) {
        hooks.afterOpen();
      }
    };
    ERM.components.showModal(options);
  },
  openSecondary: function (options, hooks) {
    hooks = hooks || {};
    if (hooks.beforeOpen) {
      hooks.beforeOpen();
    }
    var originalOnOpen = options.onOpen;
    options.onOpen = function () {
      if (originalOnOpen) {
        originalOnOpen();
      }
      if (hooks.afterOpen) {
        hooks.afterOpen();
      }
    };
    ERM.components.showSecondaryModal(options);
  },
  close: function (hooks) {
    hooks = hooks || {};
    if (hooks.beforeClose) {
      hooks.beforeClose();
    }
    ERM.components.closeModal(function () {
      if (hooks.afterClose) {
        hooks.afterClose();
      }
      if (hooks.onRestore) {
        hooks.onRestore();
      }
    });
  },
  closeSecondary: function (hooks) {
    hooks = hooks || {};
    if (hooks.beforeClose) {
      hooks.beforeClose();
    }
    ERM.components.closeSecondaryModal(function () {
      if (hooks.afterClose) {
        hooks.afterClose();
      }
      if (hooks.onRestore) {
        hooks.onRestore();
      }
    });
  },
  applyFieldUpdate: function (fieldId, value, options) {
    var el = document.getElementById(fieldId);
    if (!el) {
      return false;
    }
    options = options || {};
    el.value = value;
    if (options.addClass) {
      el.classList.add(options.addClass);
      setTimeout(function () {
        el.classList.remove(options.addClass);
      }, options.removeAfterMs || 2000);
    }
    if (options.triggerChange) {
      var event = new Event("change", { bubbles: true });
      el.dispatchEvent(event);
    }
    if (options.toast && typeof ERM.toast !== "undefined") {
      ERM.toast.success(options.toast);
    }
    return true;
  }
};

/**
 * Capture active form drafts before opening secondary modals
 */
ERM.components.captureFormDrafts = function () {
  try {
    if (ERM.riskRegister && ERM.riskRegister.saveRiskDraftFromForm) {
      var riskId =
        ERM.riskRegister.state && ERM.riskRegister.state.editingRiskId
          ? ERM.riskRegister.state.editingRiskId
          : null;
      ERM.riskRegister.saveRiskDraftFromForm(riskId);
    }
  } catch (e) {}

  try {
    if (ERM.controls && ERM.controls.saveControlDraftFromForm) {
      ERM.controls.saveControlDraftFromForm(ERM.controls._editingControlId || null);
    }
  } catch (e) {}
};

/**
 * Show a secondary/child modal
 *
 * This pushes the current modal to history and shows the new one.
 * When the secondary modal closes, it returns to the parent modal.
 *
 * Per the Unified Modal Interaction Spec:
 * - Only ONE modal visible at any time (no stacking)
 * - But we maintain navigation history for proper back-routing
 */
ERM.components.showSecondaryModal = function (options) {
  // Save current modal to history (if one exists)
  if (ERM.components._currentModalOptions) {
    ERM.components._modalHistory.push(ERM.components._currentModalOptions);
  }

  // Increment version
  ERM.components._modalVersion++;
  ERM.components._currentModalOptions = options;

  // Render the new modal (replaces current)
  ERM.components._renderModal(options);
};

/* closeSecondaryModal with callback support defined above at line 1821 */

/**
 * Update current modal content without closing/reopening
 * Prevents modal "blinking" when loading then showing results
 *
 * Works for both the old "secondary modal" calls and regular modals
 * since we now have a single modal system.
 */
ERM.components.updateSecondaryModal = function (options) {
  // Try to find the modal in either container (for compatibility)
  var container = document.getElementById("modal-container");
  if (!container) {
    console.log("[updateModal] No container found!");
    return;
  }

  var modal = container.querySelector(".modal");
  if (!modal) {
    console.log("[updateModal] No modal found in container!");
    return;
  }

  // Update title if provided
  if (options.title) {
    var titleEl = modal.querySelector(".modal-title");
    if (titleEl) {
      titleEl.innerHTML = options.title;
    }
  }

  // Update body content if provided
  if (options.content) {
    var bodyEl = modal.querySelector(".modal-body");
    if (bodyEl) {
      bodyEl.innerHTML = options.content;
    }
  }

  // Update footer/buttons if provided
  if (options.buttons) {
    var footerEl = modal.querySelector(".modal-footer");
    if (footerEl) {
      var buttonsHtml = "";
      for (var i = 0; i < options.buttons.length; i++) {
        var btn = options.buttons[i];
        buttonsHtml +=
          '<button class="btn btn-' +
          btn.type +
          '" data-action="' +
          btn.action +
          '">' +
          btn.label +
          "</button>";
      }
      footerEl.innerHTML = buttonsHtml;

      // Rebind action handlers
      var actionBtns = footerEl.querySelectorAll("[data-action]");
      for (var j = 0; j < actionBtns.length; j++) {
        actionBtns[j].addEventListener("click", function () {
          var action = this.getAttribute("data-action");
          if (action === "close") {
            ERM.components.closeModal();
          } else if (options.onAction) {
            options.onAction(action);
          }
        });
      }
    }
  }

  // Call onOpen callback if provided
  if (options.onOpen) {
    setTimeout(function () {
      options.onOpen();
    }, 50);
  }
};

/**
 * Alias for updateSecondaryModal (spec-compliant naming)
 */
ERM.components.updateModal = ERM.components.updateSecondaryModal;

/**
 * Toggle notification dropdown
 */
ERM.components.toggleNotificationDropdown = function () {
  var existingDropdown = document.getElementById("notification-dropdown");

  if (existingDropdown) {
    // Close if already open
    existingDropdown.remove();
    return;
  }

  // Create dropdown
  var dropdown = document.createElement("div");
  dropdown.id = "notification-dropdown";
  dropdown.className = "notification-dropdown";

  // Get recent activities
  var activities = [];
  if (window.ERM.activityLogger) {
    activities = window.ERM.activityLogger.getRecent(10);
  }

  // Get unread count
  var unreadCount = ERM.components.getUnreadNotificationCount();

  // Build dropdown HTML
  var html = '<div class="notification-dropdown-header">' +
    '<h3>Notifications</h3>' +
    '<div class="notification-header-actions">' +
    (unreadCount > 0 ? '<button class="mark-all-read-btn" id="mark-all-read-btn">Mark all as read</button>' : '') +
    '<button class="notification-close-btn" onclick="ERM.components.closeNotificationDropdown()">' +
    ERM.icons.close +
    '</button>' +
    '</div>' +
    '</div>' +
    '<div class="notification-dropdown-content">';

  if (activities.length === 0) {
    html += '<div class="notification-empty">' +
      '<div class="notification-empty-icon">' + ERM.icons.sparkles + '</div>' +
      '<p>No recent activity</p>' +
      '</div>';
  } else {
    for (var i = 0; i < activities.length; i++) {
      var activity = activities[i];
      var icon = this.getActivityIcon(activity.type);
      var actionText = this.getActivityActionText(activity.action);

      // Special formatting for AI activities - just show the entity name
      var notificationText = '';
      if (activity.type === 'ai') {
        notificationText = ERM.utils.escapeHtml(activity.entityName);
      } else {
        notificationText = '<strong>' + ERM.utils.escapeHtml(activity.user) + '</strong> ' +
          actionText + ' ' +
          '<strong>' + ERM.utils.escapeHtml(activity.entityName) + '</strong>';
      }

      html += '<div class="notification-item">' +
        '<div class="notification-icon notification-icon-' + activity.type + '">' +
        icon +
        '</div>' +
        '<div class="notification-content">' +
        '<div class="notification-text">' +
        notificationText +
        '</div>' +
        '<div class="notification-time">' + activity.time + ' • ' + activity.date + '</div>' +
        '</div>' +
        '</div>';
    }
  }

  html += '</div>' +
    '<div class="notification-dropdown-footer">' +
    '<button class="notification-view-all-btn" onclick="ERM.components.closeNotificationDropdown(); ERM.navigation.switchView(\'activity-log\')">' +
    'View All Activity' +
    '</button>' +
    '</div>';

  dropdown.innerHTML = html;

  // Position dropdown below notification button
  var notifBtn = document.getElementById("notifications-btn");
  if (notifBtn) {
    document.body.appendChild(dropdown);

    // Position dropdown
    var rect = notifBtn.getBoundingClientRect();
    dropdown.style.position = "fixed";
    dropdown.style.top = (rect.bottom + 8) + "px";
    // Position dropdown so its right edge aligns with the notification button's right edge
    var dropdownWidth = 380; // Width from CSS
    dropdown.style.right = (window.innerWidth - rect.right) + "px";

    // Show with animation
    setTimeout(function () {
      dropdown.classList.add("active");
    }, 10);

    // Close on outside click
    setTimeout(function () {
      document.addEventListener("click", function closeOnOutsideClick(e) {
        if (!dropdown.contains(e.target) && e.target !== notifBtn && !notifBtn.contains(e.target)) {
          ERM.components.closeNotificationDropdown();
          document.removeEventListener("click", closeOnOutsideClick);
        }
      });
    }, 100);

    // Bind mark all as read button
    var markAllBtn = document.getElementById('mark-all-read-btn');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', function () {
        ERM.components.markAllNotificationsRead();
        ERM.components.closeNotificationDropdown();
      });
    }
  }
};

/**
 * Close notification dropdown
 */
ERM.components.closeNotificationDropdown = function () {
  var dropdown = document.getElementById("notification-dropdown");
  if (dropdown) {
    dropdown.classList.remove("active");
    setTimeout(function () {
      if (dropdown.parentNode) {
        dropdown.parentNode.removeChild(dropdown);
      }
    }, 200);
  }
};

/**
 * Get icon for activity type
 */
ERM.components.getActivityIcon = function (type) {
  var icons = {
    risk: ERM.icons.alertTriangle,
    control: ERM.icons.shield,
    user: ERM.icons.user,
    settings: ERM.icons.settings,
    ai: ERM.icons.sparkles
  };
  return icons[type] || ERM.icons.sparkles;
};

/**
 * Get action text for activity
 */
ERM.components.getActivityActionText = function (action) {
  var actions = {
    created: "created",
    updated: "updated",
    deleted: "deleted",
    added: "added",
    removed: "removed"
  };
  return actions[action] || action;
};

/**
 * Get unread notification count
 */
ERM.components.getUnreadNotificationCount = function () {
  var activities = ERM.storage.get('activities') || [];
  var readNotifications = ERM.storage.get('readNotifications') || [];

  var unreadCount = 0;
  for (var i = 0; i < activities.length; i++) {
    var activityId = activities[i].id || (activities[i].timestamp + '_' + i);
    if (readNotifications.indexOf(activityId) === -1) {
      unreadCount++;
    }
  }

  return unreadCount;
};

/**
 * Mark all notifications as read
 */
ERM.components.markAllNotificationsRead = function () {
  var activities = ERM.storage.get('activities') || [];
  var readNotifications = [];

  for (var i = 0; i < activities.length; i++) {
    var activityId = activities[i].id || (activities[i].timestamp + '_' + i);
    readNotifications.push(activityId);
  }

  ERM.storage.set('readNotifications', readNotifications);

  // Update the notification badge in header
  var badge = document.querySelector('.notification-badge');
  if (badge) {
    badge.style.display = 'none';
  }

  ERM.toast.success('All notifications marked as read');
};

/**
 * Update notification badge count
 */
ERM.components.updateNotificationBadge = function () {
  var unreadCount = ERM.components.getUnreadNotificationCount();
  var badge = document.querySelector('.notification-badge');

  if (unreadCount > 0) {
    if (!badge) {
      var notifBtn = document.getElementById('notifications-btn');
      if (notifBtn) {
        badge = document.createElement('span');
        badge.className = 'notification-badge';
        notifBtn.appendChild(badge);
      }
    }
    if (badge) {
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      badge.style.display = '';
    }
  } else {
    if (badge) {
      badge.style.display = 'none';
    }
  }
};

/* ========================================
   UNIFIED AI THINKING MODAL
   Consolidated from risk-register-ai-ui.js and controls-ai-ui.js
   ======================================== */

/**
 * Show AI thinking modal with animated steps
 * @param {Object} options - Configuration options
 * @param {string} options.input - User input to preview
 * @param {string} options.title - Modal title (e.g., "AI is generating your risk")
 * @param {Array} options.steps - Array of step objects {text, icon, delay}
 * @param {Object} options.namespace - Object to set _apiRespondedBeforeAnimation flag on
 * @param {Function} options.onComplete - Callback when animation completes
 * @param {Object} options.icons - Icons object with sparkles property (optional)
 */
ERM.components.showThinkingModal = function(options) {
  var namespace = options.namespace || {};
  var input = options.input || "";
  var title = options.title || "AI is thinking";
  var steps = options.steps || [
    { text: "Analyzing your input", icon: "search", delay: 800 },
    { text: "Processing request", icon: "category", delay: 1000 },
    { text: "Generating response", icon: "chart", delay: 800 }
  ];
  var onComplete = options.onComplete;
  var sparklesIcon = (options.icons && options.icons.sparkles) || ERM.icons.sparkles ||
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>';

  // Reset the API response flag
  namespace._apiRespondedBeforeAnimation = false;

  // Build steps HTML
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
    "<h3>" + title + "</h3>" +
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
    onOpen: function() {
      // Remove the modal header and fix sizing
      var modal = document.querySelector(".modal");
      var modalContent = document.querySelector(".modal-content");
      var modalHeader = document.querySelector(".modal-header");
      var modalBody = document.querySelector(".modal-body");
      var modalFooter = document.querySelector(".modal-footer");

      if (modal) {
        modal.classList.add("ai-thinking-modal");
      }

      if (modalHeader && modalHeader.parentNode) {
        modalHeader.parentNode.removeChild(modalHeader);
      }

      if (modalFooter && modalFooter.parentNode) {
        modalFooter.parentNode.removeChild(modalFooter);
      }

      if (modalBody) {
        modalBody.style.cssText =
          "padding: 0 !important; max-height: none !important; overflow: visible !important;";
      }

      if (modalContent) {
        modalContent.style.cssText =
          "max-height: none !important; overflow: visible !important;";
      }
    }
  });

  // Animate steps sequentially
  function animateStep(stepIndex) {
    // Check if API already responded
    if (namespace._apiRespondedBeforeAnimation) {
      return;
    }

    if (stepIndex >= steps.length) {
      // All steps complete
      if (namespace._apiRespondedBeforeAnimation) {
        if (onComplete) onComplete();
        return;
      }

      setTimeout(function() {
        if (namespace._apiRespondedBeforeAnimation) {
          if (onComplete) onComplete();
          return;
        }

        var modal = document.querySelector('.modal.ai-thinking-modal');
        if (!modal) {
          if (onComplete) onComplete();
          return;
        }

        ERM.components.closeModal();
        setTimeout(function() {
          if (onComplete) onComplete();
        }, 200);
      }, 400);
      return;
    }

    var stepEl = document.querySelector('.ai-step[data-step="' + stepIndex + '"]');
    if (stepEl) {
      stepEl.classList.add("active");

      setTimeout(function() {
        if (namespace._apiRespondedBeforeAnimation) {
          return;
        }
        stepEl.classList.remove("active");
        stepEl.classList.add("complete");
        animateStep(stepIndex + 1);
      }, steps[stepIndex].delay);
    } else {
      animateStep(stepIndex + 1);
    }
  }

  // Start animation after modal opens
  setTimeout(function() {
    if (namespace._apiRespondedBeforeAnimation) {
      return;
    }
    animateStep(0);
  }, 300);
};

/**
 * Close the AI thinking modal
 */
ERM.components.closeThinkingModal = function() {
  var modal = document.querySelector('.modal.ai-thinking-modal');
  if (modal) {
    ERM.components.closeModal();
  }
};

/**
 * Show field suggestions modal
 * Consolidated from controls-ai-ui.js showFieldSuggestions
 * @param {Object} options - Configuration options
 * @param {string} options.fieldName - Name of the field to show suggestions for
 * @param {Array} options.suggestions - Array of suggestion strings
 * @param {Function} options.onSelect - Callback when suggestion is selected
 * @param {string} options.title - Optional custom title
 */
ERM.components.showFieldSuggestions = function(options) {
  var fieldName = options.fieldName || "Field";
  var suggestions = options.suggestions || [];
  var onSelect = options.onSelect;
  var customTitle = options.title;

  var sparklesIcon = ERM.icons.sparkles ||
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>';

  var suggestionsHtml = "";
  for (var i = 0; i < suggestions.length; i++) {
    var suggestionText = typeof suggestions[i] === 'object' ? suggestions[i].text : suggestions[i];
    var isRecommended = typeof suggestions[i] === 'object' && suggestions[i].recommended;

    suggestionsHtml +=
      '<div class="field-suggestion-item' + (isRecommended ? ' recommended' : '') + '" data-index="' + i + '">' +
      (isRecommended ? '<span class="recommendation-badge">Recommended</span>' : '') +
      '<div class="field-suggestion-text">' +
      ERM.utils.escapeHtml(suggestionText.length > 200 ? suggestionText.substring(0, 200) + "..." : suggestionText) +
      "</div>" +
      '<button type="button" class="btn btn-sm btn-primary use-suggestion-btn" data-index="' + i + '">Use This</button>' +
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

  ERM.components.captureFormDrafts();
  ERM.components.modalManager.openSecondary({
    title: customTitle || (sparklesIcon + " AI Suggestions"),
    content: content,
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function() {
      var useBtns = document.querySelectorAll(".use-suggestion-btn");
      for (var i = 0; i < useBtns.length; i++) {
        useBtns[i].addEventListener("click", function() {
          var index = parseInt(this.getAttribute("data-index"), 10);
          var selected = typeof suggestions[index] === 'object' ? suggestions[index].text : suggestions[index];

          ERM.components.modalManager.closeSecondary({
            onRestore: function () {
              if (onSelect) {
                onSelect(selected, index);
              }
            }
          });
        });
      }
    }
  });
};

/**
 * Show AI Suggestion Modal - Unified component for all AI suggestion UIs
 * Per AI Interaction Design Spec:
 * - Max 3 suggestions
 * - 1 marked as "Recommended" (first by default)
 * - Enterprise blue styling (no purple)
 * - No glow/pulse animations
 * - No "generate more" patterns
 *
 * @param {Object} options - Configuration options
 * @param {string} options.title - Modal title (e.g., "AI Suggestions for Risk Title")
 * @param {Array} options.suggestions - Array of suggestions (max 3)
 *   Each suggestion: { text: string, description?: string, recommended?: boolean }
 *   If strings provided, first is auto-marked recommended
 * @param {Function} options.onSelect - Callback(selectedText, index) when suggestion chosen
 * @param {boolean} options.multiSelect - Allow selecting multiple (default: false)
 * @param {Function} options.onMultiSelect - Callback(selectedTexts[]) for multi-select mode
 * @param {string} options.fieldName - Optional field name for context
 */
ERM.components.showAISuggestionModal = function(options) {
  var title = options.title || "AI Suggestions";
  var suggestions = options.suggestions || [];
  var onSelect = options.onSelect;
  var onMultiSelect = options.onMultiSelect;
  var multiSelect = options.multiSelect || false;
  var fieldName = options.fieldName || "";

  // Enforce max 3 suggestions per spec
  if (suggestions.length > 3) {
    suggestions = suggestions.slice(0, 3);
  }

  // Normalize suggestions to objects and ensure first is recommended
  var normalized = [];
  var hasRecommended = false;
  for (var i = 0; i < suggestions.length; i++) {
    var s = suggestions[i];
    var item = typeof s === "string" ? { text: s } : s;
    if (item.recommended) hasRecommended = true;
    normalized.push(item);
  }
  // If no recommended set, mark first as recommended
  if (!hasRecommended && normalized.length > 0) {
    normalized[0].recommended = true;
  }

  var sparklesIcon = ERM.icons.sparkles ||
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>';

  var cardsHtml = "";
  for (var j = 0; j < normalized.length; j++) {
    var suggestion = normalized[j];
    var isRec = suggestion.recommended;
    var cardClass = "ai-suggestion-card" + (isRec ? " ai-suggestion-recommended" : "");

    cardsHtml +=
      '<div class="' + cardClass + '" data-index="' + j + '">' +
      (isRec ? '<span class="ai-recommendation-badge">Recommended</span>' : "") +
      '<div class="ai-suggestion-text">' + ERM.utils.escapeHtml(suggestion.text) + "</div>" +
      (suggestion.description ? '<div class="ai-suggestion-desc">' + ERM.utils.escapeHtml(suggestion.description) + "</div>" : "") +
      (multiSelect ?
        '<label class="ai-suggestion-checkbox"><input type="checkbox" data-index="' + j + '"> Select</label>' :
        '<button type="button" class="btn-ai-use-suggestion" data-index="' + j + '">Use This</button>') +
      "</div>";
  }

  var content =
    '<div class="ai-suggestion-modal">' +
    (fieldName ? '<p class="ai-suggestion-context">Suggestions for <strong>' + ERM.utils.escapeHtml(fieldName) + "</strong></p>" : "") +
    '<div class="ai-suggestion-cards">' +
    cardsHtml +
    "</div>" +
    (multiSelect ? '<div class="ai-suggestion-actions"><button type="button" class="btn btn-primary ai-apply-selected">Apply Selected</button></div>' : "") +
    "</div>";

  ERM.components.captureFormDrafts();
  ERM.components.modalManager.openSecondary({
    title: sparklesIcon + " " + title,
    content: content,
    size: "md",
    buttons: [{ label: "Cancel", type: "secondary", action: "close" }],
    onOpen: function() {
      // Single select mode
      var useBtns = document.querySelectorAll(".btn-ai-use-suggestion");
      for (var k = 0; k < useBtns.length; k++) {
        useBtns[k].addEventListener("click", function() {
          var idx = parseInt(this.getAttribute("data-index"), 10);
          var selectedText = normalized[idx].text;

          ERM.components.modalManager.closeSecondary({
            onRestore: function () {
              if (onSelect) {
                onSelect(selectedText, idx);
              }
            }
          });
        });
      }

      // Multi-select mode
      var applyBtn = document.querySelector(".ai-apply-selected");
      if (applyBtn && onMultiSelect) {
        applyBtn.addEventListener("click", function() {
          var checkboxes = document.querySelectorAll(".ai-suggestion-checkbox input:checked");
          var selected = [];
          for (var m = 0; m < checkboxes.length; m++) {
            var idx = parseInt(checkboxes[m].getAttribute("data-index"), 10);
            selected.push(normalized[idx].text);
          }

          ERM.components.modalManager.closeSecondary({
            onRestore: function () {
              onMultiSelect(selected);
            }
          });
        });
      }

      // Card click to select (for single mode)
      if (!multiSelect) {
        var cards = document.querySelectorAll(".ai-suggestion-card");
        for (var n = 0; n < cards.length; n++) {
          cards[n].addEventListener("click", function(e) {
            if (e.target.tagName === "BUTTON") return; // Let button handle it
            var idx = parseInt(this.getAttribute("data-index"), 10);
            var selectedText = normalized[idx].text;

            ERM.components.modalManager.closeSecondary({
              onRestore: function () {
                if (onSelect) {
                  onSelect(selectedText, idx);
                }
              }
            });
          });
        }
      }
    }
  });
};

/**
 * Show AI Loading State - Simple spinner, no glow per spec
 * @param {HTMLElement} container - Container element to show loading in
 * @param {string} message - Loading message (default: "Generating suggestions...")
 * @returns {Function} cleanup - Call to remove loading state
 */
ERM.components.showAILoading = function(container, message) {
  message = message || "Generating suggestions...";

  var loadingHtml =
    '<div class="ai-loading-state">' +
    '<div class="ai-loading-spinner"></div>' +
    '<span class="ai-loading-text">' + ERM.utils.escapeHtml(message) + '</span>' +
    '</div>';

  var loadingEl = document.createElement("div");
  loadingEl.className = "ai-loading-wrapper";
  loadingEl.innerHTML = loadingHtml;

  if (container) {
    container.appendChild(loadingEl);
  }

  // Return cleanup function
  return function() {
    if (loadingEl && loadingEl.parentNode) {
      loadingEl.parentNode.removeChild(loadingEl);
    }
  };
};

/**
 * Global ESC Key Handler
 *
 * Per the Unified Modal Interaction Spec:
 * - ESC closes the topmost UI layer only
 * - Layer hierarchy: Modal (9000) > Popover (8000) > Toast (7000) > Tooltip (6000)
 * - Never closes more than one layer per ESC press
 */
(function() {
  document.addEventListener("keydown", function(e) {
    if (e.key !== "Escape") return;

    // Check for open modal (highest priority z-index: 9000)
    var modalOverlay = document.getElementById("modal-overlay");
    if (modalOverlay && modalOverlay.classList.contains("active")) {
      e.preventDefault();
      ERM.components.closeModal();
      return;
    }

    // Check for open notification dropdown (popover level)
    var notificationDropdown = document.getElementById("notification-dropdown");
    if (notificationDropdown) {
      e.preventDefault();
      notificationDropdown.remove();
      return;
    }

    // Check for open team dropdown (popover level)
    var teamDropdown = document.getElementById("team-dropdown");
    if (teamDropdown) {
      e.preventDefault();
      teamDropdown.remove();
      return;
    }

    // Note: Toasts auto-dismiss, don't close with ESC per spec
  });
})();

console.log("components.js loaded successfully");

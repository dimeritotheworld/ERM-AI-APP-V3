/**
 * Dimeri ERM - Team Management Module
 * Reusable team invite and member management
 * ES5 Compatible
 */

console.log("Loading team.js...");

var ERM = window.ERM || {};

ERM.team = {
  /**
   * Show invite team members modal
   * @param {Object} options - Configuration options
   * @param {string} options.title - Modal title (default: 'Invite Team Members')
   * @param {string} options.contextType - Type of context (register, control, report, etc.)
   * @param {string} options.contextId - ID of the item to invite to
   * @param {string} options.contextName - Display name of the item
   * @param {Function} options.onInvite - Callback when member is invited
   * @param {Function} options.onRemove - Callback when member is removed
   */
  showInviteModal: function (options) {
    var self = this;
    options = options || {};

    var title = options.title || "Invite Team Members";
    var contextType = options.contextType || "item";
    var contextId = options.contextId || "";
    var contextName = options.contextName || "";

    // Get workspace members
    var workspaceMembers = ERM.storage.get("workspaceMembers") || [];

    // Get already invited members for this context
    var storageKey = "invites_" + contextType + "_" + contextId;
    var invites = ERM.storage.get(storageKey) || [];

    var membersHtml = "";
    if (workspaceMembers.length === 0) {
      membersHtml =
        '<div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">' +
        '<div style="font-size: 2rem; margin-bottom: 12px;">👥</div>' +
        "<p>No team members in your workspace yet.</p>" +
        '<p style="font-size: 0.875rem;">Go to Settings > Team Management to add members to your workspace.</p>' +
        "</div>";
    } else {
      for (var i = 0; i < workspaceMembers.length; i++) {
        var member = workspaceMembers[i];
        var isInvited = false;
        var memberRole = "editor";

        // Check if already invited
        for (var j = 0; j < invites.length; j++) {
          if (invites[j].memberId === member.id) {
            isInvited = true;
            memberRole = invites[j].role || "editor";
            break;
          }
        }

        var initials = self.getInitials(member.name);
        var inviteBtn = isInvited
          ? '<button class="invite-toggle-btn invited" data-member-id="' +
            member.id +
            '">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
            " Remove" +
            "</button>"
          : '<button class="invite-toggle-btn" data-member-id="' +
            member.id +
            '">+ Invite</button>';

        var roleSelector = isInvited
          ? '<select class="role-select" data-member-id="' +
            member.id +
            '">' +
            '<option value="viewer"' +
            (memberRole === "viewer" ? " selected" : "") +
            ">Viewer</option>" +
            '<option value="editor"' +
            (memberRole === "editor" ? " selected" : "") +
            ">Editor</option>" +
            '<option value="admin"' +
            (memberRole === "admin" ? " selected" : "") +
            ">Full Access</option>" +
            "</select>"
          : "";

        membersHtml +=
          '<div class="team-member-row" data-member-id="' +
          member.id +
          '">' +
          '<div class="team-member-info">' +
          '<div class="team-member-avatar" style="background-color: ' +
          (member.color || "#6366f1") +
          '">' +
          initials +
          "</div>" +
          '<div class="team-member-details">' +
          '<div class="team-member-name">' +
          ERM.utils.escapeHtml(member.name) +
          "</div>" +
          '<div class="team-member-email">' +
          ERM.utils.escapeHtml(member.email) +
          "</div>" +
          "</div>" +
          "</div>" +
          '<div class="team-member-actions">' +
          roleSelector +
          inviteBtn +
          "</div>" +
          "</div>";
      }
    }

    var contextText = contextName
      ? '<p style="color: var(--text-secondary); margin-bottom: 20px;">Add workspace members to collaborate on <strong>"' +
        ERM.utils.escapeHtml(contextName) +
        '"</strong></p>'
      : '<p style="color: var(--text-secondary); margin-bottom: 20px;">Add workspace members and set their permissions for this item.</p>';

    var existingMembersSection = workspaceMembers.length > 0
      ? '<div style="font-weight: 600; margin-bottom: 12px; color: #334155;">Select team members</div>' +
        '<div class="search-input-wrapper" style="margin-bottom: 16px;">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>' +
        '<input type="text" class="form-input search-input" id="member-search" placeholder="Search members...">' +
        "</div>" +
        '<div class="team-members-list" id="team-members-list">' +
        membersHtml +
        "</div>"
      : '<div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">' +
        '<div style="font-size: 2rem; margin-bottom: 12px;">👥</div>' +
        '<p style="margin: 0;">No workspace members yet.</p>' +
        '<p style="font-size: 0.875rem; margin-top: 8px;">Go to Settings > Team Management to add members to your workspace first.</p>' +
        '</div>';

    var content =
      contextText +
      existingMembersSection;

    ERM.components.showModal({
      title: title,
      content: content,
      size: "lg",
      buttons: [{ label: "Done", type: "primary", action: "close" }],
      onOpen: function () {
        self.initInviteModalEvents(contextType, contextId, options);
      },
    });
  },

  /**
   * Initialize invite modal events
   */
  initInviteModalEvents: function (contextType, contextId, options) {
    var self = this;
    var storageKey = "invites_" + contextType + "_" + contextId;

    // Search filter
    var searchInput = document.getElementById("member-search");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        var query = this.value.toLowerCase();
        var rows = document.querySelectorAll(".team-member-row");
        for (var i = 0; i < rows.length; i++) {
          var name = rows[i]
            .querySelector(".team-member-name")
            .textContent.toLowerCase();
          var email = rows[i]
            .querySelector(".team-member-email")
            .textContent.toLowerCase();
          if (name.indexOf(query) > -1 || email.indexOf(query) > -1) {
            rows[i].style.display = "";
          } else {
            rows[i].style.display = "none";
          }
        }
      });
    }

    // Invite/Remove toggle buttons
    var inviteBtns = document.querySelectorAll(".invite-toggle-btn");
    for (var i = 0; i < inviteBtns.length; i++) {
      inviteBtns[i].addEventListener("click", function () {
        var memberId = this.getAttribute("data-member-id");
        var isInvited = this.classList.contains("invited");
        var row = this.closest(".team-member-row");
        var btn = this;

        if (isInvited) {
          // Remove invite
          self.removeInvite(storageKey, memberId);
          btn.classList.remove("invited");
          btn.innerHTML = "+ Invite";

          // Remove role selector
          var roleSelect = row.querySelector(".role-select");
          if (roleSelect) roleSelect.remove();

          ERM.toast.show({ type: "info", message: "Member removed" });

          if (options.onRemove) {
            options.onRemove(memberId);
          }
        } else {
          // Add invite
          self.addInvite(storageKey, memberId, "editor");
          btn.classList.add("invited");
          btn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Remove';

          // Add role selector
          var actionsDiv = row.querySelector(".team-member-actions");
          var roleSelect = document.createElement("select");
          roleSelect.className = "role-select";
          roleSelect.setAttribute("data-member-id", memberId);
          roleSelect.innerHTML =
            '<option value="viewer">Viewer</option><option value="editor" selected>Editor</option><option value="admin">Full Access</option>';
          actionsDiv.insertBefore(roleSelect, btn);

          // Add event listener to new role select
          roleSelect.addEventListener("change", function () {
            var mId = this.getAttribute("data-member-id");
            self.updateInviteRole(storageKey, mId, this.value);
          });

          ERM.toast.success("Member invited");

          if (options.onInvite) {
            options.onInvite(memberId, "editor");
          }
        }
      });
    }

    // Role change handlers
    var roleSelects = document.querySelectorAll(".role-select");
    for (var j = 0; j < roleSelects.length; j++) {
      roleSelects[j].addEventListener("change", function () {
        var memberId = this.getAttribute("data-member-id");
        self.updateInviteRole(storageKey, memberId, this.value);
      });
    }
  },

  /**
   * Add invite
   */
  addInvite: function (storageKey, memberId, role) {
    var invites = ERM.storage.get(storageKey) || [];
    invites.push({
      memberId: memberId,
      role: role,
      invitedAt: new Date().toISOString(),
    });
    ERM.storage.set(storageKey, invites);
  },

  /**
   * Remove invite
   */
  removeInvite: function (storageKey, memberId) {
    var invites = ERM.storage.get(storageKey) || [];
    var newInvites = [];
    for (var i = 0; i < invites.length; i++) {
      if (invites[i].memberId !== memberId) {
        newInvites.push(invites[i]);
      }
    }
    ERM.storage.set(storageKey, newInvites);
  },

  /**
   * Update invite role
   */
  updateInviteRole: function (storageKey, memberId, role) {
    var invites = ERM.storage.get(storageKey) || [];
    for (var i = 0; i < invites.length; i++) {
      if (invites[i].memberId === memberId) {
        invites[i].role = role;
        break;
      }
    }
    ERM.storage.set(storageKey, invites);
    ERM.toast.show({ type: "info", message: "Role updated" });
  },

  /**
   * Get invites for a context
   */
  getInvites: function (contextType, contextId) {
    var storageKey = "invites_" + contextType + "_" + contextId;
    return ERM.storage.get(storageKey) || [];
  },

  /**
   * Show add workspace member modal
   */
  showAddMemberModal: function (callback) {
    var self = this;

    var colors = [
      "#6366f1",
      "#8b5cf6",
      "#ec4899",
      "#f43f5e",
      "#f97316",
      "#eab308",
      "#22c55e",
      "#14b8a6",
      "#0ea5e9",
      "#3b82f6",
    ];
    var randomColor = colors[Math.floor(Math.random() * colors.length)];

    var content =
      '<div class="form-group">' +
      '<label class="form-label required">Full Name</label>' +
      '<input type="text" class="form-input" id="member-name" placeholder="e.g. John Smith">' +
      "</div>" +
      '<div class="form-group">' +
      '<label class="form-label required">Email Address</label>' +
      '<input type="email" class="form-input" id="member-email" placeholder="e.g. john@company.com">' +
      "</div>";

    ERM.components.showModal({
      title: "Add Team Member",
      content: content,
      buttons: [
        { label: "Cancel", type: "secondary", action: "close" },
        { label: "Add Member", type: "primary", action: "add" },
      ],
      onAction: function (action) {
        if (action === "add") {
          var name = document.getElementById("member-name").value.trim();
          var email = document.getElementById("member-email").value.trim();

          if (!name) {
            ERM.toast.error("Please enter a name");
            return;
          }
          if (!email) {
            ERM.toast.error("Please enter an email address");
            return;
          }

          // Use team sync manager to add member (handles seat assignment and syncing)
          var memberData = {
            name: name,
            email: email,
            color: randomColor,
            role: "member",
            isOwner: false,
            status: "active"
          };

          var addedMember = null;
          if (typeof ERM.teamSyncManager !== 'undefined') {
            addedMember = ERM.teamSyncManager.addMember(memberData);
          } else {
            // Fallback to old method if sync manager not loaded
            var members = ERM.storage.get("workspaceMembers") || [];
            for (var i = 0; i < members.length; i++) {
              if (members[i].email.toLowerCase() === email.toLowerCase()) {
                ERM.toast.error("A member with this email already exists");
                return;
              }
            }

            var currentUser = ERM.state.user || {};
            addedMember = {
              id: ERM.utils.generateId("member"),
              name: name,
              email: email,
              color: randomColor,
              addedAt: new Date().toISOString(),
              role: "member",
              isOwner: false,
              addedBy: currentUser.id || null,
              addedByName: currentUser.name || "Unknown",
              status: "active",
              hasSeat: true
            };

            members.push(addedMember);
            ERM.storage.set("workspaceMembers", members);
            ERM.toast.success("Team member added!");
          }

          if (addedMember) {
            ERM.components.closeModal();

            if (callback) {
              setTimeout(callback, 250);
            }
          }
        }
      },
      onOpen: function () {
        setTimeout(function () {
          var input = document.getElementById("member-name");
          if (input) input.focus();
        }, 100);
      },
    });
  },

  /**
   * Get all workspace members
   */
  getWorkspaceMembers: function () {
    return ERM.storage.get("workspaceMembers") || [];
  },

  /**
   * Get member by ID
   */
  getMemberById: function (memberId) {
    var members = this.getWorkspaceMembers();
    for (var i = 0; i < members.length; i++) {
      if (members[i].id === memberId) {
        return members[i];
      }
    }
    return null;
  },

  /**
   * Get initials from name
   */
  getInitials: function (name) {
    if (!name) return "?";
    var parts = name.split(" ");
    if (parts.length >= 2) {
      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  },

  /**
   * Delete workspace member
   * Uses team sync manager for cascading deletion
   */
  deleteMember: function (memberId, skipConfirmation) {
    if (typeof ERM.teamSyncManager !== 'undefined') {
      ERM.teamSyncManager.removeMember(memberId, skipConfirmation);
    } else {
      // Fallback to simple delete
      var members = ERM.storage.get("workspaceMembers") || [];
      var newMembers = [];
      for (var i = 0; i < members.length; i++) {
        if (members[i].id !== memberId) {
          newMembers.push(members[i]);
        }
      }
      ERM.storage.set("workspaceMembers", newMembers);
    }
  },
};

console.log("team.js loaded successfully");

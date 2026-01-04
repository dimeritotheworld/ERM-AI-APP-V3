/**
 * DIMERI.AI - ADMIN PORTAL
 * Users Management Module
 */

var ADMIN = ADMIN || {};

ADMIN.users = {
  /**
   * Render users list view
   */
  render: function() {
    var users = ADMIN.data.getAllUsers();
    var stats = ADMIN.data.getPlatformStats();
    var ownerCount = this.countOwners(users);
    var memberCount = users.length - ownerCount;

    var html =
      '<div class="admin-content-header">' +
      '<div>' +
      '<h1 class="admin-content-title">Users</h1>' +
      '<p class="admin-content-subtitle">Manage platform users and track owner/member roles</p>' +
      '</div>' +
      '<div class="admin-content-actions">' +
      '<input type="text" placeholder="Search users..." class="admin-search-input" id="user-search" />' +
      '<select class="admin-filter-select" id="user-filter">' +
      '<option value="all">All Users</option>' +
      '<option value="owner">Owners Only</option>' +
      '<option value="member">Members Only</option>' +
      '<option value="suspended">Suspended</option>' +
      '</select>' +
      '</div>' +
      '</div>' +

      // Summary cards with owner/member breakdown
      '<div class="admin-kpi-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Total Users</div>' +
      '<div class="admin-kpi-value">' + stats.totalUsers + '</div>' +
      '</div>' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Workspace Owners</div>' +
      '<div class="admin-kpi-value" style="color: #3b82f6;">' + ownerCount + '</div>' +
      '<div class="admin-kpi-footer">' +
      '<span class="admin-kpi-period">Full workspace access</span>' +
      '</div>' +
      '</div>' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Members</div>' +
      '<div class="admin-kpi-value" style="color: #64748b;">' + memberCount + '</div>' +
      '<div class="admin-kpi-footer">' +
      '<span class="admin-kpi-period">Limited permissions</span>' +
      '</div>' +
      '</div>' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Active (7d)</div>' +
      '<div class="admin-kpi-value">' + stats.activeUsers + '</div>' +
      '</div>' +
      '</div>' +

      // Users table
      this.renderUsersTable(users);

    var contentArea = document.getElementById('admin-content');
    if (contentArea) {
      contentArea.innerHTML = html;
      this.initUsersEvents();
    }
  },

  /**
   * Count workspace owners
   */
  countOwners: function(users) {
    var count = 0;
    for (var i = 0; i < users.length; i++) {
      if (users[i].isOwner) {
        count++;
      }
    }
    return count;
  },

  /**
   * Render users table
   */
  renderUsersTable: function(users) {
    if (users.length === 0) {
      return '<div class="admin-table-container">' +
        '<div class="admin-empty-state" style="padding: 80px 20px;">' +
        '<div class="admin-empty-icon">👥</div>' +
        '<div class="admin-empty-title">No users yet</div>' +
        '<div class="admin-empty-text">Users will appear here once they start using the platform</div>' +
        '</div>' +
        '</div>';
    }

    var html =
      '<div class="admin-table-container">' +
      '<table class="admin-table">' +
      '<thead>' +
      '<tr>' +
      '<th>User</th>' +
      '<th>Role</th>' +
      '<th>Workspace</th>' +
      '<th>Joined</th>' +
      '<th>Last Login</th>' +
      '<th>Status</th>' +
      '<th>Actions</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>';

    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      html += this.renderUserRow(user);
    }

    html += '</tbody></table></div>';
    return html;
  },

  /**
   * Render single user row
   */
  renderUserRow: function(user) {
    var status = user.suspended ? 'suspended' : 'active';
    var statusColor = ADMIN.utils.getStatusColor(status);
    var statusLabel = user.suspended ? 'Suspended' : 'Active';

    var lastLogin = user.lastLogin ? ADMIN.utils.getRelativeTime(user.lastLogin) : 'Never';
    var roleLabel = user.isOwner ? 'Owner' : 'Member';
    var roleBadge = user.isOwner
      ? '<span class="admin-status-badge" style="background: #dbeafe; color: #1e40af;">Owner</span>'
      : '<span class="admin-status-badge" style="background: #f3f4f6; color: #4b5563;">Member</span>';

    return '<tr class="admin-table-row" data-user-id="' + user.id + '">' +
      '<td>' +
      '<div class="admin-table-cell-main">' + ADMIN.utils.escapeHtml(user.name || user.email || 'Unknown') + '</div>' +
      '<div class="admin-table-cell-sub">' + ADMIN.utils.escapeHtml(user.email || '') + '</div>' +
      '</td>' +
      '<td>' + roleBadge + '</td>' +
      '<td>' + ADMIN.utils.escapeHtml(user.workspaceName || 'N/A') + '</td>' +
      '<td>' + ADMIN.utils.formatDate(user.createdAt || user.joinedAt) + '</td>' +
      '<td>' + lastLogin + '</td>' +
      '<td>' +
      '<span class="admin-status-badge" style="background: ' + statusColor + '20; color: ' + statusColor + ';">' +
      statusLabel +
      '</span>' +
      '</td>' +
      '<td>' +
      '<button class="admin-action-btn" onclick="ADMIN.users.viewDetails(\'' + user.id + '\')">View</button>' +
      '<button class="admin-action-btn-menu" onclick="ADMIN.users.showActionsMenu(event, \'' + user.id + '\')">⋮</button>' +
      '</td>' +
      '</tr>';
  },

  /**
   * Render pending invites view
   */
  renderPending: function() {
    var invites = ADMIN.data.getPendingInvites();

    var html =
      '<div class="admin-content-header">' +
      '<h1 class="admin-content-title">Pending Invites</h1>' +
      '<p class="admin-content-subtitle">Workspace invitations awaiting acceptance</p>' +
      '</div>';

    if (invites.length === 0) {
      html += '<div class="admin-table-container">' +
        '<div class="admin-empty-state" style="padding: 80px 20px;">' +
        '<div class="admin-empty-icon">📨</div>' +
        '<div class="admin-empty-title">No pending invites</div>' +
        '<div class="admin-empty-text">Workspace invitations will appear here</div>' +
        '</div>' +
        '</div>';
    } else {
      html += '<div class="admin-table-container">' +
        '<table class="admin-table">' +
        '<thead>' +
        '<tr>' +
        '<th>Email</th>' +
        '<th>Workspace</th>' +
        '<th>Invited By</th>' +
        '<th>Sent</th>' +
        '<th>Status</th>' +
        '<th>Actions</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';

      for (var i = 0; i < invites.length; i++) {
        var invite = invites[i];
        html +=
          '<tr>' +
          '<td>' + ADMIN.utils.escapeHtml(invite.email) + '</td>' +
          '<td>' + ADMIN.utils.escapeHtml(invite.workspaceName || 'N/A') + '</td>' +
          '<td>' + ADMIN.utils.escapeHtml(invite.invitedBy || 'Unknown') + '</td>' +
          '<td>' + ADMIN.utils.getRelativeTime(invite.createdAt) + '</td>' +
          '<td><span class="admin-status-badge" style="background: #fef3c7; color: #92400e;">Pending</span></td>' +
          '<td>' +
          '<button class="admin-action-btn" onclick="ADMIN.users.resendInvite(\'' + invite.id + '\')">Resend</button>' +
          '<button class="admin-action-btn-menu" onclick="ADMIN.users.cancelInvite(\'' + invite.id + '\')">✕</button>' +
          '</td>' +
          '</tr>';
      }

      html += '</tbody></table></div>';
    }

    var contentArea = document.getElementById('admin-content');
    if (contentArea) {
      contentArea.innerHTML = html;
    }
  },

  /**
   * Render suspended users view
   */
  renderSuspended: function() {
    var allUsers = ADMIN.data.getAllUsers();
    var suspended = [];

    for (var i = 0; i < allUsers.length; i++) {
      if (allUsers[i].suspended) {
        suspended.push(allUsers[i]);
      }
    }

    var html =
      '<div class="admin-content-header">' +
      '<h1 class="admin-content-title">Suspended Users</h1>' +
      '<p class="admin-content-subtitle">Users that have been suspended</p>' +
      '</div>' +
      this.renderUsersTable(suspended);

    var contentArea = document.getElementById('admin-content');
    if (contentArea) {
      contentArea.innerHTML = html;
      this.initUsersEvents();
    }
  },

  /**
   * Render user detail view
   */
  renderDetail: function(userId) {
    var users = ADMIN.data.getAllUsers();
    var user = null;

    for (var i = 0; i < users.length; i++) {
      if (users[i].id === userId) {
        user = users[i];
        break;
      }
    }

    if (!user) {
      var contentArea = document.getElementById('admin-content');
      if (contentArea) {
        contentArea.innerHTML =
          '<div style="padding: 80px 20px; text-align: center;">' +
          '<div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>' +
          '<h2>User Not Found</h2>' +
          '<button onclick="ADMIN.router.navigateTo(\'users\')" class="admin-btn-primary" style="margin-top: 20px;">Back to Users</button>' +
          '</div>';
      }
      return;
    }

    var html =
      '<div class="admin-content-header">' +
      '<div>' +
      '<button onclick="ADMIN.router.navigateTo(\'users\')" style="background: none; border: none; color: var(--admin-accent); cursor: pointer; margin-bottom: 8px;">← Back to Users</button>' +
      '<h1 class="admin-content-title">' + ADMIN.utils.escapeHtml(user.name || user.email || 'Unknown User') + '</h1>' +
      '<p class="admin-content-subtitle">' + ADMIN.utils.escapeHtml(user.email || '') + '</p>' +
      '</div>' +
      '<div class="admin-content-actions">' +
      (user.suspended
        ? '<button class="admin-btn-success" onclick="ADMIN.users.unsuspendUser(\'' + userId + '\')">Unsuspend</button>'
        : '<button class="admin-btn-danger" onclick="ADMIN.users.suspendUser(\'' + userId + '\')">Suspend</button>'
      ) +
      '</div>' +
      '</div>' +

      // User info cards
      '<div class="admin-kpi-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Role</div>' +
      '<div class="admin-kpi-value" style="font-size: 20px;">' + (user.isOwner ? 'Owner' : 'Member') + '</div>' +
      '</div>' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Workspace</div>' +
      '<div class="admin-kpi-value" style="font-size: 16px;">' + ADMIN.utils.escapeHtml(user.workspaceName || 'N/A') + '</div>' +
      '</div>' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Joined</div>' +
      '<div class="admin-kpi-value" style="font-size: 16px;">' + ADMIN.utils.formatDate(user.createdAt || user.joinedAt) + '</div>' +
      '</div>' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Last Login</div>' +
      '<div class="admin-kpi-value" style="font-size: 16px;">' + (user.lastLogin ? ADMIN.utils.getRelativeTime(user.lastLogin) : 'Never') + '</div>' +
      '</div>' +
      '</div>' +

      // User details
      '<div class="admin-table-container">' +
      '<div style="padding: 24px;">' +
      '<h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">User Information</h3>' +
      '<div style="display: grid; gap: 16px;">' +
      '<div><strong>User ID:</strong> ' + ADMIN.utils.escapeHtml(userId) + '</div>' +
      '<div><strong>Name:</strong> ' + ADMIN.utils.escapeHtml(user.name || 'Not provided') + '</div>' +
      '<div><strong>Email:</strong> ' + ADMIN.utils.escapeHtml(user.email || 'N/A') + '</div>' +
      '<div><strong>Role:</strong> ' + (user.isOwner ? 'Owner' : 'Member') + '</div>' +
      '<div><strong>Status:</strong> ' + (user.suspended ? 'Suspended' : 'Active') + '</div>' +
      '<div><strong>Created:</strong> ' + ADMIN.utils.formatDate(user.createdAt || user.joinedAt) + '</div>' +
      '<div><strong>Last Login:</strong> ' + (user.lastLogin ? ADMIN.utils.formatDate(user.lastLogin) : 'Never') + '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    var contentArea = document.getElementById('admin-content');
    if (contentArea) {
      contentArea.innerHTML = html;
    }
  },

  /**
   * Initialize users list events
   */
  initUsersEvents: function() {
    var self = this;

    // Search functionality
    var searchInput = document.getElementById('user-search');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        self.filterUsers();
      });
    }

    // Filter functionality
    var filterSelect = document.getElementById('user-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', function() {
        self.filterUsers();
      });
    }

    // Row click to view details
    var rows = document.querySelectorAll('.admin-table-row');
    for (var i = 0; i < rows.length; i++) {
      rows[i].addEventListener('click', function(e) {
        if (!e.target.classList.contains('admin-action-btn') &&
            !e.target.classList.contains('admin-action-btn-menu')) {
          var userId = this.getAttribute('data-user-id');
          if (userId) {
            self.viewDetails(userId);
          }
        }
      });
    }
  },

  /**
   * Filter users
   */
  filterUsers: function() {
    var searchTerm = document.getElementById('user-search').value.toLowerCase();
    var filter = document.getElementById('user-filter').value;
    var rows = document.querySelectorAll('.admin-table-row');

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var text = row.textContent.toLowerCase();
      var matchesSearch = text.indexOf(searchTerm) !== -1;
      var matchesFilter = true;

      if (filter !== 'all') {
        if (filter === 'owner' || filter === 'member') {
          var roleBadge = row.querySelector('.admin-status-badge');
          if (roleBadge) {
            var role = roleBadge.textContent.toLowerCase();
            matchesFilter = role === filter;
          }
        } else if (filter === 'suspended') {
          var statusBadge = row.querySelectorAll('.admin-status-badge')[1];
          if (statusBadge) {
            matchesFilter = statusBadge.textContent.toLowerCase() === 'suspended';
          }
        }
      }

      row.style.display = matchesSearch && matchesFilter ? '' : 'none';
    }
  },

  /**
   * View user details
   */
  viewDetails: function(userId) {
    ADMIN.router.loadUserDetail(userId);
  },

  /**
   * Show actions menu
   */
  showActionsMenu: function(event, userId) {
    event.stopPropagation();
    alert('Actions menu for user: ' + userId + '\n\nComing soon:\n- View details\n- Suspend/Unsuspend\n- Reset password\n- View activity');
  },

  /**
   * Suspend user
   */
  suspendUser: function(userId) {
    if (confirm('Are you sure you want to suspend this user?\n\nThis will prevent them from accessing the platform.')) {
      var result = ADMIN.data.suspendUser(userId, 'Suspended by admin');
      if (result.success) {
        alert('User suspended successfully');
        location.reload();
      } else {
        alert('Error suspending user');
      }
    }
  },

  /**
   * Unsuspend user
   */
  unsuspendUser: function(userId) {
    if (confirm('Unsuspend this user?')) {
      alert('User unsuspended (feature coming soon)');
      location.reload();
    }
  },

  /**
   * Resend invite
   */
  resendInvite: function(inviteId) {
    alert('Resending invite: ' + inviteId + '\n\n(Feature coming soon)');
  },

  /**
   * Cancel invite
   */
  cancelInvite: function(inviteId) {
    if (confirm('Cancel this invitation?')) {
      alert('Invite cancelled (feature coming soon)');
      location.reload();
    }
  }
};

console.log('Admin Users module loaded');

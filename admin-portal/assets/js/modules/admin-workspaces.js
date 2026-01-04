/**
 * DIMERI.AI - ADMIN PORTAL
 * Workspaces Management Module
 */

var ADMIN = ADMIN || {};

ADMIN.workspaces = {
  /**
   * Render workspaces list view
   */
  render: function() {
    var workspaces = ADMIN.data.getAllWorkspaces();
    var stats = ADMIN.data.getPlatformStats();

    var html =
      '<div class="admin-content-header">' +
      '<div>' +
      '<h1 class="admin-content-title">Workspaces</h1>' +
      '<p class="admin-content-subtitle">Manage all platform workspaces</p>' +
      '</div>' +
      '<div class="admin-content-actions">' +
      '<input type="text" placeholder="Search workspaces..." class="admin-search-input" id="workspace-search" />' +
      '<select class="admin-filter-select" id="workspace-filter">' +
      '<option value="all">All Workspaces</option>' +
      '<option value="active">Active</option>' +
      '<option value="over-limit">Over Limit</option>' +
      '<option value="inactive">Inactive</option>' +
      '<option value="suspended">Suspended</option>' +
      '</select>' +
      '</div>' +
      '</div>' +

      // Summary cards
      '<div class="admin-kpi-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Total</div>' +
      '<div class="admin-kpi-value">' + stats.totalWorkspaces + '</div>' +
      '</div>' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Active</div>' +
      '<div class="admin-kpi-value">' + (stats.totalWorkspaces - stats.inactiveWorkspaces) + '</div>' +
      '</div>' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Over Limit</div>' +
      '<div class="admin-kpi-value" style="color: var(--admin-danger);">' + stats.overLimitAccounts + '</div>' +
      '</div>' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Inactive (30d)</div>' +
      '<div class="admin-kpi-value">' + stats.inactiveWorkspaces + '</div>' +
      '</div>' +
      '</div>' +

      // Workspaces table
      this.renderWorkspacesTable(workspaces);

    var contentArea = document.getElementById('admin-content');
    if (contentArea) {
      contentArea.innerHTML = html;
      this.initWorkspacesEvents();
    }
  },

  /**
   * Render workspaces table
   */
  renderWorkspacesTable: function(workspaces) {
    if (workspaces.length === 0) {
      return '<div class="admin-table-container">' +
        '<div class="admin-empty-state" style="padding: 80px 20px;">' +
        '<div class="admin-empty-icon">🏢</div>' +
        '<div class="admin-empty-title">No workspaces yet</div>' +
        '<div class="admin-empty-text">Workspaces will appear here once users start creating them</div>' +
        '</div>' +
        '</div>';
    }

    var html =
      '<div class="admin-table-container">' +
      '<table class="admin-table">' +
      '<thead>' +
      '<tr>' +
      '<th>Workspace</th>' +
      '<th>Owner</th>' +
      '<th>Created</th>' +
      '<th>Members</th>' +
      '<th>Usage</th>' +
      '<th>Status</th>' +
      '<th>Actions</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>';

    for (var i = 0; i < workspaces.length; i++) {
      var workspace = workspaces[i];
      html += this.renderWorkspaceRow(workspace);
    }

    html += '</tbody></table></div>';
    return html;
  },

  /**
   * Render single workspace row
   */
  renderWorkspaceRow: function(workspace) {
    var usage = ADMIN.data.getWorkspaceUsage(workspace.id);
    var limits = ADMIN.data.getFreePlanLimits();
    var isOverLimit = ADMIN.data.isOverLimit(workspace.id);

    var status = workspace.suspended ? 'suspended' : isOverLimit ? 'over-limit' : 'active';
    var statusColor = ADMIN.utils.getStatusColor(status);
    var statusLabel = workspace.suspended ? 'Suspended' : isOverLimit ? 'Over Limit' : 'Active';

    // Calculate usage percentage
    var usagePercent = Math.round((usage.riskRegisters / limits.riskRegisters) * 100);

    return '<tr class="admin-table-row" data-workspace-id="' + workspace.id + '">' +
      '<td>' +
      '<div class="admin-table-cell-main">' + ADMIN.utils.escapeHtml(workspace.name || 'Unnamed Workspace') + '</div>' +
      '<div class="admin-table-cell-sub">ID: ' + ADMIN.utils.escapeHtml(workspace.id) + '</div>' +
      '</td>' +
      '<td>' +
      '<div class="admin-table-cell-main">' + ADMIN.utils.escapeHtml(workspace.ownerName || 'Unknown') + '</div>' +
      '<div class="admin-table-cell-sub">' + ADMIN.utils.escapeHtml(workspace.ownerEmail || '') + '</div>' +
      '</td>' +
      '<td>' + ADMIN.utils.formatDate(workspace.createdAt) + '</td>' +
      '<td>' + (workspace.memberCount || 1) + '</td>' +
      '<td>' +
      '<div style="display: flex; align-items: center; gap: 8px;">' +
      '<div style="flex: 1; height: 6px; background: var(--admin-gray-200); border-radius: 3px; overflow: hidden;">' +
      '<div style="height: 100%; width: ' + usagePercent + '%; background: ' + (isOverLimit ? 'var(--admin-danger)' : 'var(--admin-accent)') + ';"></div>' +
      '</div>' +
      '<span style="font-size: 12px; color: var(--admin-gray-600); white-space: nowrap;">' + usage.riskRegisters + '/' + limits.riskRegisters + '</span>' +
      '</div>' +
      '</td>' +
      '<td>' +
      '<span class="admin-status-badge" style="background: ' + statusColor + '20; color: ' + statusColor + ';">' +
      statusLabel +
      '</span>' +
      '</td>' +
      '<td>' +
      '<button class="admin-action-btn" onclick="ADMIN.workspaces.viewDetails(\'' + workspace.id + '\')">View</button>' +
      '<button class="admin-action-btn-menu" onclick="ADMIN.workspaces.showActionsMenu(event, \'' + workspace.id + '\')">⋮</button>' +
      '</td>' +
      '</tr>';
  },

  /**
   * Render workspace activity view
   */
  renderActivity: function() {
    var activities = ADMIN.data.getRecentActivity(50);

    var html =
      '<div class="admin-content-header">' +
      '<h1 class="admin-content-title">Workspace Activity</h1>' +
      '<p class="admin-content-subtitle">Real-time platform activity stream</p>' +
      '</div>' +
      '<div class="admin-table-container">' +
      '<div style="padding: 20px;">';

    if (activities.length === 0) {
      html += '<div class="admin-empty-state" style="padding: 60px 20px;">' +
        '<div class="admin-empty-icon">📊</div>' +
        '<div class="admin-empty-title">No activity yet</div>' +
        '<div class="admin-empty-text">Platform activity will appear here</div>' +
        '</div>';
    } else {
      for (var i = 0; i < activities.length; i++) {
        html += ADMIN.dashboard.renderActivityItem(activities[i]);
      }
    }

    html += '</div></div>';

    var contentArea = document.getElementById('admin-content');
    if (contentArea) {
      contentArea.innerHTML = html;
    }
  },

  /**
   * Render suspended workspaces
   */
  renderSuspended: function() {
    var allWorkspaces = ADMIN.data.getAllWorkspaces();
    var suspended = [];

    for (var i = 0; i < allWorkspaces.length; i++) {
      if (allWorkspaces[i].suspended) {
        suspended.push(allWorkspaces[i]);
      }
    }

    var html =
      '<div class="admin-content-header">' +
      '<h1 class="admin-content-title">Suspended Workspaces</h1>' +
      '<p class="admin-content-subtitle">Workspaces that have been suspended</p>' +
      '</div>' +
      this.renderWorkspacesTable(suspended);

    var contentArea = document.getElementById('admin-content');
    if (contentArea) {
      contentArea.innerHTML = html;
      this.initWorkspacesEvents();
    }
  },

  /**
   * Render workspace detail view
   */
  renderDetail: function(workspaceId) {
    var workspaces = ADMIN.data.getAllWorkspaces();
    var workspace = null;

    for (var i = 0; i < workspaces.length; i++) {
      if (workspaces[i].id === workspaceId) {
        workspace = workspaces[i];
        break;
      }
    }

    if (!workspace) {
      var contentArea = document.getElementById('admin-content');
      if (contentArea) {
        contentArea.innerHTML =
          '<div style="padding: 80px 20px; text-align: center;">' +
          '<div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>' +
          '<h2>Workspace Not Found</h2>' +
          '<button onclick="ADMIN.router.navigateTo(\'workspaces\')" class="admin-btn-primary" style="margin-top: 20px;">Back to Workspaces</button>' +
          '</div>';
      }
      return;
    }

    var usage = ADMIN.data.getWorkspaceUsage(workspaceId);
    var limits = ADMIN.data.getFreePlanLimits();
    var isOverLimit = ADMIN.data.isOverLimit(workspaceId);

    var html =
      '<div class="admin-content-header">' +
      '<div>' +
      '<button onclick="ADMIN.router.navigateTo(\'workspaces\')" style="background: none; border: none; color: var(--admin-accent); cursor: pointer; margin-bottom: 8px;">← Back to Workspaces</button>' +
      '<h1 class="admin-content-title">' + ADMIN.utils.escapeHtml(workspace.name || 'Unnamed Workspace') + '</h1>' +
      '<p class="admin-content-subtitle">Workspace ID: ' + ADMIN.utils.escapeHtml(workspaceId) + '</p>' +
      '</div>' +
      '<div class="admin-content-actions">' +
      (workspace.suspended
        ? '<button class="admin-btn-success" onclick="ADMIN.workspaces.unsuspendWorkspace(\'' + workspaceId + '\')">Unsuspend</button>'
        : '<button class="admin-btn-danger" onclick="ADMIN.workspaces.suspendWorkspace(\'' + workspaceId + '\')">Suspend</button>'
      ) +
      '</div>' +
      '</div>' +

      // Overview cards
      '<div class="admin-kpi-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Risk Registers</div>' +
      '<div class="admin-kpi-value">' + usage.riskRegisters + '<span style="font-size: 16px; color: var(--admin-gray-500);">/' + limits.riskRegisters + '</span></div>' +
      '</div>' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Controls</div>' +
      '<div class="admin-kpi-value">' + usage.controls + '<span style="font-size: 16px; color: var(--admin-gray-500);">/' + limits.controls + '</span></div>' +
      '</div>' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Reports</div>' +
      '<div class="admin-kpi-value">' + usage.reports + '<span style="font-size: 16px; color: var(--admin-gray-500);">/' + limits.reports + '</span></div>' +
      '</div>' +
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">Storage</div>' +
      '<div class="admin-kpi-value">' + Math.round(usage.storage / 1024) + '<span style="font-size: 16px; color: var(--admin-gray-500);">MB</span></div>' +
      '</div>' +
      '</div>' +

      // Tabs
      '<div class="admin-tabs" id="workspace-tabs">' +
      '<button class="admin-tab active" data-tab="info">Info</button>' +
      '<button class="admin-tab" data-tab="members">Members</button>' +
      '<button class="admin-tab" data-tab="usage">Usage</button>' +
      '<button class="admin-tab" data-tab="activity">Activity</button>' +
      '</div>' +

      // Tab content
      '<div class="admin-tab-content" id="workspace-tab-content">' +
      this.renderInfoTab(workspace) +
      '</div>';

    var contentArea = document.getElementById('admin-content');
    if (contentArea) {
      contentArea.innerHTML = html;
      this.initDetailEvents(workspaceId);
    }
  },

  /**
   * Render info tab
   */
  renderInfoTab: function(workspace) {
    return '<div class="admin-table-container">' +
      '<div style="padding: 24px;">' +
      '<div style="display: grid; gap: 16px;">' +
      '<div><strong>Name:</strong> ' + ADMIN.utils.escapeHtml(workspace.name || 'N/A') + '</div>' +
      '<div><strong>Owner:</strong> ' + ADMIN.utils.escapeHtml(workspace.ownerName || 'Unknown') + ' (' + ADMIN.utils.escapeHtml(workspace.ownerEmail || '') + ')</div>' +
      '<div><strong>Created:</strong> ' + ADMIN.utils.formatDate(workspace.createdAt) + '</div>' +
      '<div><strong>Industry:</strong> ' + ADMIN.utils.escapeHtml(workspace.industry || 'Not specified') + '</div>' +
      '<div><strong>Status:</strong> ' + (workspace.suspended ? 'Suspended' : 'Active') + '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  },

  /**
   * Initialize workspaces list events
   */
  initWorkspacesEvents: function() {
    var self = this;

    // Search functionality
    var searchInput = document.getElementById('workspace-search');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        self.filterWorkspaces();
      });
    }

    // Filter functionality
    var filterSelect = document.getElementById('workspace-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', function() {
        self.filterWorkspaces();
      });
    }

    // Row click to view details
    var rows = document.querySelectorAll('.admin-table-row');
    for (var i = 0; i < rows.length; i++) {
      rows[i].addEventListener('click', function(e) {
        if (!e.target.classList.contains('admin-action-btn') &&
            !e.target.classList.contains('admin-action-btn-menu')) {
          var workspaceId = this.getAttribute('data-workspace-id');
          if (workspaceId) {
            self.viewDetails(workspaceId);
          }
        }
      });
    }
  },

  /**
   * Initialize detail view events
   */
  initDetailEvents: function(workspaceId) {
    var tabs = document.querySelectorAll('.admin-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function() {
        var tab = this.getAttribute('data-tab');
        // Update active state
        var allTabs = document.querySelectorAll('.admin-tab');
        for (var j = 0; j < allTabs.length; j++) {
          allTabs[j].classList.remove('active');
        }
        this.classList.add('active');
        // Load tab content
        ADMIN.workspaces.loadTabContent(workspaceId, tab);
      });
    }
  },

  /**
   * Load tab content
   */
  loadTabContent: function(workspaceId, tab) {
    var contentArea = document.getElementById('workspace-tab-content');
    if (!contentArea) return;

    var workspaces = ADMIN.data.getAllWorkspaces();
    var workspace = null;
    for (var i = 0; i < workspaces.length; i++) {
      if (workspaces[i].id === workspaceId) {
        workspace = workspaces[i];
        break;
      }
    }

    if (!workspace) return;

    switch (tab) {
      case 'info':
        contentArea.innerHTML = this.renderInfoTab(workspace);
        break;
      case 'members':
        contentArea.innerHTML = '<div class="admin-table-container"><div style="padding: 40px; text-align: center; color: var(--admin-gray-500);">Members list coming soon</div></div>';
        break;
      case 'usage':
        contentArea.innerHTML = '<div class="admin-table-container"><div style="padding: 40px; text-align: center; color: var(--admin-gray-500);">Usage details coming soon</div></div>';
        break;
      case 'activity':
        contentArea.innerHTML = '<div class="admin-table-container"><div style="padding: 40px; text-align: center; color: var(--admin-gray-500);">Activity log coming soon</div></div>';
        break;
    }
  },

  /**
   * Filter workspaces
   */
  filterWorkspaces: function() {
    var searchTerm = document.getElementById('workspace-search').value.toLowerCase();
    var filter = document.getElementById('workspace-filter').value;
    var rows = document.querySelectorAll('.admin-table-row');

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var text = row.textContent.toLowerCase();
      var matchesSearch = text.indexOf(searchTerm) !== -1;
      var matchesFilter = true;

      if (filter !== 'all') {
        var statusBadge = row.querySelector('.admin-status-badge');
        if (statusBadge) {
          var status = statusBadge.textContent.toLowerCase().replace(/\s+/g, '-');
          matchesFilter = status === filter;
        }
      }

      row.style.display = matchesSearch && matchesFilter ? '' : 'none';
    }
  },

  /**
   * View workspace details
   */
  viewDetails: function(workspaceId) {
    ADMIN.router.loadWorkspaceDetail(workspaceId);
  },

  /**
   * Show actions menu
   */
  showActionsMenu: function(event, workspaceId) {
    event.stopPropagation();
    alert('Actions menu for workspace: ' + workspaceId + '\n\nComing soon:\n- View details\n- Suspend/Unsuspend\n- Delete\n- View activity');
  },

  /**
   * Suspend workspace
   */
  suspendWorkspace: function(workspaceId) {
    if (confirm('Are you sure you want to suspend this workspace?\n\nThis will prevent all users from accessing it.')) {
      var result = ADMIN.data.suspendWorkspace(workspaceId, 'Suspended by admin');
      if (result.success) {
        alert('Workspace suspended successfully');
        location.reload();
      } else {
        alert('Error suspending workspace');
      }
    }
  },

  /**
   * Unsuspend workspace
   */
  unsuspendWorkspace: function(workspaceId) {
    if (confirm('Unsuspend this workspace?')) {
      alert('Workspace unsuspended (feature coming soon)');
      location.reload();
    }
  }
};

console.log('Admin Workspaces module loaded');

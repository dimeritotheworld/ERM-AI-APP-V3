/**
 * DIMERI.AI - ADMIN PORTAL
 * Usage & Limits Module
 */

var ADMIN = ADMIN || {};

ADMIN.usage = {
  /**
   * Render usage & limits view
   */
  render: function() {
    var workspaces = ADMIN.data.getAllWorkspaces();
    var limits = ADMIN.data.getFreePlanLimits();
    var platformUsage = this.calculatePlatformUsage(workspaces);

    var html =
      '<div class="admin-content-header">' +
      '<h1 class="admin-content-title">Usage & Limits</h1>' +
      '<p class="admin-content-subtitle">Monitor resource usage across all workspaces</p>' +
      '</div>' +

      // Platform-wide usage cards
      '<div class="admin-kpi-grid" style="grid-template-columns: repeat(5, 1fr); margin-bottom: 32px;">' +
      this.renderPlatformUsageCard('Risk Registers', platformUsage.totalRiskRegisters, limits.riskRegisters * workspaces.length) +
      this.renderPlatformUsageCard('Controls', platformUsage.totalControls, limits.controls * workspaces.length) +
      this.renderPlatformUsageCard('Reports', platformUsage.totalReports, limits.reports * workspaces.length) +
      this.renderPlatformUsageCard('Storage', Math.round(platformUsage.totalStorage / 1024) + ' MB', Math.round((limits.storage * workspaces.length) / 1024) + ' MB') +
      this.renderPlatformUsageCard('AI Calls', platformUsage.totalAiCalls, limits.aiCalls * workspaces.length) +
      '</div>' +

      // Free plan limits reference
      '<div class="admin-table-container" style="margin-bottom: 24px;">' +
      '<div style="padding: 20px; border-bottom: 1px solid var(--admin-gray-200);">' +
      '<h3 style="font-size: 16px; font-weight: 600; color: var(--admin-gray-900);">Free Plan Limits (per workspace)</h3>' +
      '</div>' +
      '<div style="padding: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">' +
      '<div><strong>Risk Registers:</strong> ' + limits.riskRegisters + '</div>' +
      '<div><strong>Controls:</strong> ' + limits.controls + '</div>' +
      '<div><strong>Reports:</strong> ' + limits.reports + '</div>' +
      '<div><strong>Storage:</strong> ' + Math.round(limits.storage / 1024) + ' MB</div>' +
      '<div><strong>Team Members:</strong> ' + limits.teamMembers + '</div>' +
      '<div><strong>AI Calls:</strong> ' + limits.aiCalls + '</div>' +
      '</div>' +
      '</div>' +

      // Workspaces usage table
      this.renderWorkspacesUsageTable(workspaces);

    var contentArea = document.getElementById('admin-content');
    if (contentArea) {
      contentArea.innerHTML = html;
      this.initUsageEvents();
    }
  },

  /**
   * Calculate platform-wide usage
   */
  calculatePlatformUsage: function(workspaces) {
    var totalRiskRegisters = 0;
    var totalControls = 0;
    var totalReports = 0;
    var totalStorage = 0;
    var totalAiCalls = 0;

    for (var i = 0; i < workspaces.length; i++) {
      var usage = ADMIN.data.getWorkspaceUsage(workspaces[i].id);
      totalRiskRegisters += usage.riskRegisters;
      totalControls += usage.controls;
      totalReports += usage.reports;
      totalStorage += usage.storage;
      totalAiCalls += usage.aiCalls;
    }

    return {
      totalRiskRegisters: totalRiskRegisters,
      totalControls: totalControls,
      totalReports: totalReports,
      totalStorage: totalStorage,
      totalAiCalls: totalAiCalls
    };
  },

  /**
   * Render platform usage card
   */
  renderPlatformUsageCard: function(title, current, max) {
    var percentage = 0;
    if (typeof current === 'number' && typeof max === 'number' && max > 0) {
      percentage = Math.round((current / max) * 100);
    }

    var color = percentage > 80 ? 'var(--admin-danger)' : percentage > 60 ? 'var(--admin-warning)' : 'var(--admin-accent)';

    return '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-title">' + title + '</div>' +
      '<div class="admin-kpi-value" style="font-size: 24px;">' +
      current +
      (typeof max === 'number' ? '<span style="font-size: 14px; color: var(--admin-gray-500); font-weight: normal;">/' + max + '</span>' : '') +
      '</div>' +
      (percentage > 0
        ? '<div style="margin-top: 8px; height: 4px; background: var(--admin-gray-200); border-radius: 2px; overflow: hidden;">' +
          '<div style="height: 100%; width: ' + percentage + '%; background: ' + color + '; transition: width 0.3s;"></div>' +
          '</div>'
        : ''
      ) +
      '</div>';
  },

  /**
   * Render workspaces usage table
   */
  renderWorkspacesUsageTable: function(workspaces) {
    if (workspaces.length === 0) {
      return '<div class="admin-table-container">' +
        '<div class="admin-empty-state" style="padding: 80px 20px;">' +
        '<div class="admin-empty-icon">📊</div>' +
        '<div class="admin-empty-title">No workspaces to track</div>' +
        '<div class="admin-empty-text">Usage data will appear here once workspaces are created</div>' +
        '</div>' +
        '</div>';
    }

    var html =
      '<div class="admin-table-container">' +
      '<div style="padding: 20px; border-bottom: 1px solid var(--admin-gray-200); display: flex; justify-content: space-between; align-items: center;">' +
      '<h3 style="font-size: 16px; font-weight: 600; color: var(--admin-gray-900);">Workspace Usage Details</h3>' +
      '<input type="text" placeholder="Search workspaces..." class="admin-search-input" id="usage-search" style="max-width: 300px;" />' +
      '</div>' +
      '<table class="admin-table">' +
      '<thead>' +
      '<tr>' +
      '<th>Workspace</th>' +
      '<th>Risk Registers</th>' +
      '<th>Controls</th>' +
      '<th>Reports</th>' +
      '<th>Storage</th>' +
      '<th>AI Calls</th>' +
      '<th>Status</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>';

    for (var i = 0; i < workspaces.length; i++) {
      var workspace = workspaces[i];
      html += this.renderUsageRow(workspace);
    }

    html += '</tbody></table></div>';
    return html;
  },

  /**
   * Render single usage row
   */
  renderUsageRow: function(workspace) {
    var usage = ADMIN.data.getWorkspaceUsage(workspace.id);
    var limits = ADMIN.data.getFreePlanLimits();
    var isOverLimit = ADMIN.data.isOverLimit(workspace.id);

    return '<tr class="admin-table-row" data-workspace-id="' + workspace.id + '">' +
      '<td>' +
      '<div class="admin-table-cell-main">' + ADMIN.utils.escapeHtml(workspace.name || 'Unnamed Workspace') + '</div>' +
      '<div class="admin-table-cell-sub">' + ADMIN.utils.escapeHtml(workspace.ownerName || 'Unknown owner') + '</div>' +
      '</td>' +
      '<td>' + this.renderUsageCell(usage.riskRegisters, limits.riskRegisters) + '</td>' +
      '<td>' + this.renderUsageCell(usage.controls, limits.controls) + '</td>' +
      '<td>' + this.renderUsageCell(usage.reports, limits.reports) + '</td>' +
      '<td>' + this.renderStorageCell(usage.storage, limits.storage) + '</td>' +
      '<td>' + this.renderUsageCell(usage.aiCalls, limits.aiCalls) + '</td>' +
      '<td>' +
      (isOverLimit
        ? '<span class="admin-status-badge" style="background: #fee2e2; color: #991b1b;">Over Limit</span>'
        : '<span class="admin-status-badge" style="background: #d1fae5; color: #065f46;">Within Limits</span>'
      ) +
      '</td>' +
      '</tr>';
  },

  /**
   * Render usage cell with progress bar
   */
  renderUsageCell: function(current, limit) {
    var percentage = Math.round((current / limit) * 100);
    var isOver = current >= limit;
    var color = isOver ? 'var(--admin-danger)' : percentage > 80 ? 'var(--admin-warning)' : 'var(--admin-success)';

    return '<div>' +
      '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">' +
      '<span style="font-weight: 500; ' + (isOver ? 'color: var(--admin-danger);' : '') + '">' + current + '</span>' +
      '<span style="color: var(--admin-gray-500); font-size: 12px;">/ ' + limit + '</span>' +
      '</div>' +
      '<div style="height: 4px; background: var(--admin-gray-200); border-radius: 2px; overflow: hidden;">' +
      '<div style="height: 100%; width: ' + Math.min(percentage, 100) + '%; background: ' + color + ';"></div>' +
      '</div>' +
      '</div>';
  },

  /**
   * Render storage cell
   */
  renderStorageCell: function(current, limit) {
    var currentMB = Math.round(current / 1024);
    var limitMB = Math.round(limit / 1024);
    var percentage = Math.round((current / limit) * 100);
    var isOver = current >= limit;
    var color = isOver ? 'var(--admin-danger)' : percentage > 80 ? 'var(--admin-warning)' : 'var(--admin-success)';

    return '<div>' +
      '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">' +
      '<span style="font-weight: 500; ' + (isOver ? 'color: var(--admin-danger);' : '') + '">' + currentMB + ' MB</span>' +
      '<span style="color: var(--admin-gray-500); font-size: 12px;">/ ' + limitMB + ' MB</span>' +
      '</div>' +
      '<div style="height: 4px; background: var(--admin-gray-200); border-radius: 2px; overflow: hidden;">' +
      '<div style="height: 100%; width: ' + Math.min(percentage, 100) + '%; background: ' + color + ';"></div>' +
      '</div>' +
      '</div>';
  },

  /**
   * Initialize usage events
   */
  initUsageEvents: function() {
    var self = this;

    // Search functionality
    var searchInput = document.getElementById('usage-search');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        self.filterUsageTable();
      });
    }

    // Row click to view workspace details
    var rows = document.querySelectorAll('.admin-table-row');
    for (var i = 0; i < rows.length; i++) {
      rows[i].addEventListener('click', function() {
        var workspaceId = this.getAttribute('data-workspace-id');
        if (workspaceId) {
          ADMIN.router.loadWorkspaceDetail(workspaceId);
        }
      });
    }
  },

  /**
   * Filter usage table
   */
  filterUsageTable: function() {
    var searchTerm = document.getElementById('usage-search').value.toLowerCase();
    var rows = document.querySelectorAll('.admin-table-row');

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var text = row.textContent.toLowerCase();
      var matchesSearch = text.indexOf(searchTerm) !== -1;
      row.style.display = matchesSearch ? '' : 'none';
    }
  }
};

console.log('Admin Usage module loaded');

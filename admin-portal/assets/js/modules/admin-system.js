/**
 * DIMERI.AI - ADMIN PORTAL
 * System Module - Feature Flags, Logs, Audit Trail
 */

var ADMIN = ADMIN || {};

ADMIN.system = {
  /**
   * Render feature flags view
   */
  renderFeatureFlags: function() {
    var flags = this.getFeatureFlags();

    var html =
      '<div class="admin-content-header">' +
      '<div>' +
      '<h1 class="admin-content-title">Feature Flags</h1>' +
      '<p class="admin-content-subtitle">Control platform features and experiments</p>' +
      '</div>' +
      '<div class="admin-content-actions">' +
      '<button class="admin-btn-primary" onclick="ADMIN.system.addFeatureFlag()">Add Feature Flag</button>' +
      '</div>' +
      '</div>';

    if (flags.length === 0) {
      html += '<div class="admin-table-container">' +
        '<div class="admin-empty-state" style="padding: 80px 20px;">' +
        '<div class="admin-empty-icon">🚩</div>' +
        '<div class="admin-empty-title">No feature flags configured</div>' +
        '<div class="admin-empty-text">Create feature flags to control platform features</div>' +
        '</div>' +
        '</div>';
    } else {
      html += '<div class="admin-table-container">' +
        '<table class="admin-table">' +
        '<thead>' +
        '<tr>' +
        '<th>Feature</th>' +
        '<th>Description</th>' +
        '<th>Status</th>' +
        '<th>Rollout</th>' +
        '<th>Modified</th>' +
        '<th>Actions</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';

      for (var i = 0; i < flags.length; i++) {
        var flag = flags[i];
        html += this.renderFeatureFlagRow(flag);
      }

      html += '</tbody></table></div>';
    }

    var contentArea = document.getElementById('admin-content');
    if (contentArea) {
      contentArea.innerHTML = html;
    }
  },

  /**
   * Render feature flag row
   */
  renderFeatureFlagRow: function(flag) {
    var statusColor = flag.enabled ? 'var(--admin-success)' : 'var(--admin-gray-500)';
    var statusLabel = flag.enabled ? 'Enabled' : 'Disabled';

    return '<tr>' +
      '<td>' +
      '<div class="admin-table-cell-main">' + ADMIN.utils.escapeHtml(flag.name) + '</div>' +
      '<div class="admin-table-cell-sub">Key: ' + ADMIN.utils.escapeHtml(flag.key) + '</div>' +
      '</td>' +
      '<td>' + ADMIN.utils.escapeHtml(flag.description) + '</td>' +
      '<td>' +
      '<span class="admin-status-badge" style="background: ' + statusColor + '20; color: ' + statusColor + ';">' +
      statusLabel +
      '</span>' +
      '</td>' +
      '<td>' +
      '<div style="display: flex; align-items: center; gap: 8px;">' +
      '<div style="flex: 1; height: 6px; background: var(--admin-gray-200); border-radius: 3px; overflow: hidden;">' +
      '<div style="height: 100%; width: ' + flag.rollout + '%; background: var(--admin-accent);"></div>' +
      '</div>' +
      '<span style="font-size: 12px; color: var(--admin-gray-600);">' + flag.rollout + '%</span>' +
      '</div>' +
      '</td>' +
      '<td>' + ADMIN.utils.getRelativeTime(flag.modifiedAt) + '</td>' +
      '<td>' +
      '<button class="admin-action-btn" onclick="ADMIN.system.toggleFeatureFlag(\'' + flag.key + '\')">' +
      (flag.enabled ? 'Disable' : 'Enable') +
      '</button>' +
      '</td>' +
      '</tr>';
  },

  /**
   * Render logs view
   */
  renderLogs: function() {
    var logs = this.getSystemLogs();

    var html =
      '<div class="admin-content-header">' +
      '<div>' +
      '<h1 class="admin-content-title">System Logs</h1>' +
      '<p class="admin-content-subtitle">Platform activity and error logs</p>' +
      '</div>' +
      '<div class="admin-content-actions">' +
      '<select class="admin-filter-select" id="log-level-filter">' +
      '<option value="all">All Levels</option>' +
      '<option value="error">Errors</option>' +
      '<option value="warning">Warnings</option>' +
      '<option value="info">Info</option>' +
      '<option value="debug">Debug</option>' +
      '</select>' +
      '<button class="admin-btn-secondary" onclick="ADMIN.system.exportLogs()">Export Logs</button>' +
      '<button class="admin-btn-secondary" onclick="ADMIN.system.clearLogs()">Clear Logs</button>' +
      '</div>' +
      '</div>';

    if (logs.length === 0) {
      html += '<div class="admin-table-container">' +
        '<div class="admin-empty-state" style="padding: 80px 20px;">' +
        '<div class="admin-empty-icon">📝</div>' +
        '<div class="admin-empty-title">No logs available</div>' +
        '<div class="admin-empty-text">System logs will appear here</div>' +
        '</div>' +
        '</div>';
    } else {
      html += '<div class="admin-table-container">' +
        '<div style="padding: 12px; font-family: monospace; font-size: 13px; max-height: 600px; overflow-y: auto;">';

      for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        html += this.renderLogEntry(log);
      }

      html += '</div></div>';
    }

    var contentArea = document.getElementById('admin-content');
    if (contentArea) {
      contentArea.innerHTML = html;
      this.initLogsEvents();
    }
  },

  /**
   * Render single log entry
   */
  renderLogEntry: function(log) {
    var levelColors = {
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      debug: '#64748b'
    };

    var color = levelColors[log.level] || '#64748b';
    var icon = {
      error: '🔴',
      warning: '🟡',
      info: '🔵',
      debug: '⚪'
    }[log.level] || '⚪';

    return '<div style="padding: 8px; border-bottom: 1px solid var(--admin-gray-100); display: flex; gap: 12px;" data-log-level="' + log.level + '">' +
      '<span style="flex-shrink: 0;">' + icon + '</span>' +
      '<div style="flex: 1; min-width: 0;">' +
      '<div style="display: flex; gap: 12px; align-items: baseline; margin-bottom: 4px;">' +
      '<span style="color: var(--admin-gray-500); font-size: 11px; flex-shrink: 0;">' + ADMIN.utils.formatTime(log.timestamp) + '</span>' +
      '<span style="color: ' + color + '; font-weight: 600; text-transform: uppercase; font-size: 11px; flex-shrink: 0;">' + log.level + '</span>' +
      '<span style="color: var(--admin-gray-700); overflow: hidden; text-overflow: ellipsis;">' + ADMIN.utils.escapeHtml(log.message) + '</span>' +
      '</div>' +
      (log.details
        ? '<div style="color: var(--admin-gray-600); font-size: 11px; padding-left: 12px; margin-top: 4px; border-left: 2px solid var(--admin-gray-200);">' +
          ADMIN.utils.escapeHtml(log.details) +
          '</div>'
        : ''
      ) +
      '</div>' +
      '</div>';
  },

  /**
   * Render audit trail view
   */
  renderAudit: function() {
    var events = this.getAuditEvents();

    var html =
      '<div class="admin-content-header">' +
      '<div>' +
      '<h1 class="admin-content-title">Audit Trail</h1>' +
      '<p class="admin-content-subtitle">Track administrative actions and changes</p>' +
      '</div>' +
      '<div class="admin-content-actions">' +
      '<input type="text" placeholder="Search events..." class="admin-search-input" id="audit-search" />' +
      '<select class="admin-filter-select" id="audit-filter">' +
      '<option value="all">All Actions</option>' +
      '<option value="workspace">Workspace</option>' +
      '<option value="user">User</option>' +
      '<option value="system">System</option>' +
      '</select>' +
      '<button class="admin-btn-secondary" onclick="ADMIN.system.exportAuditTrail()">Export</button>' +
      '</div>' +
      '</div>';

    if (events.length === 0) {
      html += '<div class="admin-table-container">' +
        '<div class="admin-empty-state" style="padding: 80px 20px;">' +
        '<div class="admin-empty-icon">📋</div>' +
        '<div class="admin-empty-title">No audit events</div>' +
        '<div class="admin-empty-text">Administrative actions will be logged here</div>' +
        '</div>' +
        '</div>';
    } else {
      html += '<div class="admin-table-container">' +
        '<table class="admin-table">' +
        '<thead>' +
        '<tr>' +
        '<th>Timestamp</th>' +
        '<th>Action</th>' +
        '<th>Resource</th>' +
        '<th>Admin User</th>' +
        '<th>IP Address</th>' +
        '<th>Details</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';

      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        html += this.renderAuditRow(event);
      }

      html += '</tbody></table></div>';
    }

    var contentArea = document.getElementById('admin-content');
    if (contentArea) {
      contentArea.innerHTML = html;
      this.initAuditEvents();
    }
  },

  /**
   * Render audit row
   */
  renderAuditRow: function(event) {
    var actionColors = {
      create: '#10b981',
      update: '#3b82f6',
      delete: '#ef4444',
      suspend: '#f59e0b',
      restore: '#10b981'
    };

    var color = actionColors[event.action] || '#64748b';

    return '<tr data-audit-type="' + event.resourceType + '">' +
      '<td>' + ADMIN.utils.formatDateTime(event.timestamp) + '</td>' +
      '<td>' +
      '<span class="admin-status-badge" style="background: ' + color + '20; color: ' + color + ';">' +
      ADMIN.utils.escapeHtml(event.action) +
      '</span>' +
      '</td>' +
      '<td>' +
      '<div class="admin-table-cell-main">' + ADMIN.utils.escapeHtml(event.resourceName) + '</div>' +
      '<div class="admin-table-cell-sub">' + ADMIN.utils.escapeHtml(event.resourceType) + '</div>' +
      '</td>' +
      '<td>' + ADMIN.utils.escapeHtml(event.adminUser) + '</td>' +
      '<td>' + ADMIN.utils.escapeHtml(event.ipAddress) + '</td>' +
      '<td>' + ADMIN.utils.escapeHtml(event.details || '-') + '</td>' +
      '</tr>';
  },

  /**
   * Get feature flags (mock data for now)
   */
  getFeatureFlags: function() {
    var flags = ADMIN.storage.get('featureFlags');
    if (flags) return flags;

    // Default feature flags
    return [
      {
        key: 'ai-suggestions',
        name: 'AI Suggestions',
        description: 'Enable AI-powered risk and control suggestions',
        enabled: true,
        rollout: 100,
        modifiedAt: new Date().toISOString()
      },
      {
        key: 'advanced-analytics',
        name: 'Advanced Analytics',
        description: 'Enable advanced analytics and reporting features',
        enabled: false,
        rollout: 0,
        modifiedAt: new Date().toISOString()
      },
      {
        key: 'team-collaboration',
        name: 'Team Collaboration',
        description: 'Enable real-time collaboration features',
        enabled: true,
        rollout: 50,
        modifiedAt: new Date().toISOString()
      }
    ];
  },

  /**
   * Get system logs (mock data for now)
   */
  getSystemLogs: function() {
    var logs = ADMIN.storage.get('systemLogs');
    if (logs) return logs;

    // Sample logs
    return [
      {
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        level: 'info',
        message: 'User login successful',
        details: 'User: admin@dimeri.ai, IP: 192.168.1.1'
      },
      {
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        level: 'warning',
        message: 'Workspace approaching storage limit',
        details: 'Workspace: Acme Corp, Usage: 45MB/50MB'
      },
      {
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        level: 'error',
        message: 'Failed to send invitation email',
        details: 'Email: user@example.com, Error: SMTP timeout'
      },
      {
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        level: 'info',
        message: 'New workspace created',
        details: 'Workspace: Manufacturing Co, Owner: john@example.com'
      }
    ];
  },

  /**
   * Get audit events (mock data for now)
   */
  getAuditEvents: function() {
    var events = ADMIN.storage.get('auditEvents');
    if (events) return events;

    // Sample audit events
    return [
      {
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        action: 'suspend',
        resourceType: 'workspace',
        resourceName: 'Test Workspace',
        adminUser: 'admin@dimeri.ai',
        ipAddress: '192.168.1.1',
        details: 'Reason: Over storage limit'
      },
      {
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        action: 'update',
        resourceType: 'user',
        resourceName: 'john@example.com',
        adminUser: 'admin@dimeri.ai',
        ipAddress: '192.168.1.1',
        details: 'Changed role from Member to Owner'
      },
      {
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        action: 'create',
        resourceType: 'workspace',
        resourceName: 'New Manufacturing',
        adminUser: 'system',
        ipAddress: '10.0.0.1',
        details: 'Auto-created during onboarding'
      }
    ];
  },

  /**
   * Initialize logs events
   */
  initLogsEvents: function() {
    var self = this;

    var filterSelect = document.getElementById('log-level-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', function() {
        self.filterLogs();
      });
    }
  },

  /**
   * Initialize audit events
   */
  initAuditEvents: function() {
    var self = this;

    var searchInput = document.getElementById('audit-search');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        self.filterAuditTrail();
      });
    }

    var filterSelect = document.getElementById('audit-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', function() {
        self.filterAuditTrail();
      });
    }
  },

  /**
   * Filter logs by level
   */
  filterLogs: function() {
    var filter = document.getElementById('log-level-filter').value;
    var entries = document.querySelectorAll('[data-log-level]');

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var level = entry.getAttribute('data-log-level');
      entry.style.display = (filter === 'all' || level === filter) ? '' : 'none';
    }
  },

  /**
   * Filter audit trail
   */
  filterAuditTrail: function() {
    var searchTerm = document.getElementById('audit-search').value.toLowerCase();
    var filter = document.getElementById('audit-filter').value;
    var rows = document.querySelectorAll('[data-audit-type]');

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var text = row.textContent.toLowerCase();
      var type = row.getAttribute('data-audit-type');

      var matchesSearch = text.indexOf(searchTerm) !== -1;
      var matchesFilter = (filter === 'all' || type === filter);

      row.style.display = matchesSearch && matchesFilter ? '' : 'none';
    }
  },

  /**
   * Toggle feature flag
   */
  toggleFeatureFlag: function(key) {
    alert('Toggle feature flag: ' + key + '\n\n(Feature coming soon)');
  },

  /**
   * Add feature flag
   */
  addFeatureFlag: function() {
    alert('Add new feature flag\n\n(Feature coming soon)');
  },

  /**
   * Export logs
   */
  exportLogs: function() {
    alert('Export system logs\n\n(Feature coming soon)');
  },

  /**
   * Clear logs
   */
  clearLogs: function() {
    if (confirm('Are you sure you want to clear all logs?\n\nThis action cannot be undone.')) {
      alert('Logs cleared (feature coming soon)');
    }
  },

  /**
   * Export audit trail
   */
  exportAuditTrail: function() {
    alert('Export audit trail\n\n(Feature coming soon)');
  }
};

console.log('Admin System module loaded');

/**
 * Activity Log Page Module
 * Full audit trail view with search and filters
 * ES5 Compatible
 */

if (!window.ERM) window.ERM = {};

ERM.activityLog = {

  /**
   * Current filter state
   */
  filters: {
    search: '',
    type: 'all',
    action: 'all',
    dateFrom: '',
    dateTo: ''
  },

  /**
   * Initialize activity log page
   */
  init: function() {
    console.log('Initializing Activity Log page...');
    this.render();
    this.bindEvents();
  },

  /**
   * Render activity log page
   */
  render: function() {
    var container = document.getElementById('activity-log-content');
    if (!container) return;

    var html = this.buildHeader() +
               this.buildFilters() +
               this.buildActivityList();

    container.innerHTML = html;
  },

  /**
   * Build page header
   */
  buildHeader: function() {
    var activities = ERM.storage.get('activities') || [];
    var totalCount = activities.length;

    return '<div class="audit-trail-header">' +
      '<div class="audit-trail-header-left">' +
      '<h1 class="audit-trail-title">Audit Trail</h1>' +
      '<p class="audit-trail-subtitle">' + totalCount + ' recorded activities</p>' +
      '</div>' +
      '<div class="audit-trail-header-right">' +
      '<div class="export-dropdown-wrapper">' +
      '<button class="btn btn-secondary btn-sm" id="export-activity-btn">' +
      (ERM.icons && ERM.icons.download ? ERM.icons.download : '↓') +
      ' Export' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:4px;"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
      '</button>' +
      '<div class="export-dropdown" id="export-dropdown">' +
      '<button class="export-option" data-format="pdf">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>' +
      '<span>Export as PDF</span>' +
      '</button>' +
      '<button class="export-option" data-format="excel">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><rect x="8" y="12" width="8" height="6" rx="1"></rect></svg>' +
      '<span>Export as Excel</span>' +
      '</button>' +
      '</div>' +
      '</div>' +
      '<button class="btn btn-ghost btn-sm" id="clear-activity-btn" title="Clear all logs">' +
      (ERM.icons && ERM.icons.trash ? ERM.icons.trash : '🗑') +
      '</button>' +
      '</div>' +
      '</div>';
  },

  /**
   * Build filters section
   */
  buildFilters: function() {
    var typeSelected = this.filters.type;
    var actionSelected = this.filters.action;

    return '<div class="audit-trail-filters">' +
      '<div class="audit-filter-search">' +
      '<input type="text" id="activity-search" class="audit-search-input" ' +
      'placeholder="Search by user, action, or entity..." value="' + this.escapeHtml(this.filters.search) + '" />' +
      '</div>' +
      '<div class="audit-filter-selects">' +
      '<select id="activity-type-filter" class="audit-filter-select">' +
      '<option value="all"' + (typeSelected === 'all' ? ' selected' : '') + '>All Types</option>' +
      '<option value="risk"' + (typeSelected === 'risk' ? ' selected' : '') + '>Risk</option>' +
      '<option value="register"' + (typeSelected === 'register' ? ' selected' : '') + '>Register</option>' +
      '<option value="control"' + (typeSelected === 'control' ? ' selected' : '') + '>Control</option>' +
      '<option value="report"' + (typeSelected === 'report' ? ' selected' : '') + '>Report</option>' +
      '<option value="user"' + (typeSelected === 'user' ? ' selected' : '') + '>User</option>' +
      '</select>' +
      '<select id="activity-action-filter" class="audit-filter-select">' +
      '<option value="all"' + (actionSelected === 'all' ? ' selected' : '') + '>All Actions</option>' +
      '<option value="created"' + (actionSelected === 'created' ? ' selected' : '') + '>Created</option>' +
      '<option value="updated"' + (actionSelected === 'updated' ? ' selected' : '') + '>Updated</option>' +
      '<option value="deleted"' + (actionSelected === 'deleted' ? ' selected' : '') + '>Deleted</option>' +
      '<option value="linked"' + (actionSelected === 'linked' ? ' selected' : '') + '>Linked</option>' +
      '</select>' +
      (this.filters.search || this.filters.type !== 'all' || this.filters.action !== 'all' ?
        '<button class="audit-reset-btn" id="reset-filters-btn">Clear filters</button>' : '') +
      '</div>' +
      '</div>';
  },

  /**
   * Build activity list
   */
  buildActivityList: function() {
    var activities = this.getFilteredActivities();

    if (activities.length === 0) {
      return '<div class="audit-trail-empty">' +
        '<div class="audit-empty-icon">' + (ERM.icons && ERM.icons.fileText ? ERM.icons.fileText : '📋') + '</div>' +
        '<h3 class="audit-empty-title">No activities found</h3>' +
        '<p class="audit-empty-text">Activities will appear here as you work</p>' +
        '</div>';
    }

    // Group activities by date
    var grouped = this.groupByDate(activities);
    var html = '<div class="audit-trail-list">';

    for (var date in grouped) {
      if (grouped.hasOwnProperty(date)) {
        html += '<div class="audit-date-group">' +
          '<div class="audit-date-header">' + date + '</div>' +
          '<div class="audit-date-items">';

        var items = grouped[date];
        for (var i = 0; i < items.length; i++) {
          html += this.buildActivityItem(items[i]);
        }

        html += '</div></div>';
      }
    }

    html += '</div>';
    return html;
  },

  /**
   * Group activities by date
   */
  groupByDate: function(activities) {
    var groups = {};
    var today = new Date().toLocaleDateString('en-GB');
    var yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-GB');

    for (var i = 0; i < activities.length; i++) {
      var activity = activities[i];
      var date = activity.date || 'Unknown';

      // Format date label
      var label = date;
      if (date === today) label = 'Today';
      else if (date === yesterday) label = 'Yesterday';

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(activity);
    }

    return groups;
  },

  /**
   * Build single activity item - Audit trail style
   */
  buildActivityItem: function(activity) {
    var sentence = this.formatAuditSentence(activity);
    var actionClass = this.getActionClass(activity.action);
    var typeLabel = this.formatTypeLabel(activity.type || activity.entityType);

    var html = '<div class="audit-item">' +
      '<div class="audit-item-indicator ' + actionClass + '"></div>' +
      '<div class="audit-item-content">' +
      '<div class="audit-item-sentence">' + sentence + '</div>' +
      '<div class="audit-item-meta">' +
      '<span class="audit-item-type">' + typeLabel + '</span>' +
      '<span class="audit-item-time">' + (activity.time || '') + '</span>' +
      '</div>' +
      '</div>' +
      '</div>';

    return html;
  },

  /**
   * Format sentence for audit trail (clean, no IDs)
   */
  formatAuditSentence: function(activity) {
    var user = '<span class="audit-user">' + this.escapeHtml(activity.user || 'User') + '</span>';
    var entityName = '<span class="audit-entity">' + this.escapeHtml(activity.entityName || 'item') + '</span>';
    var action = (activity.action || '').toLowerCase();
    var entityType = (activity.entityType || activity.type || '').toLowerCase();

    // Risk Register actions
    if (entityType === 'register' || entityType === 'risk register') {
      if (action === 'created') return user + ' created register ' + entityName;
      if (action === 'updated') return user + ' edited register ' + entityName;
      if (action === 'deleted') return user + ' deleted register ' + entityName;
      if (action === 'exported') return user + ' exported register ' + entityName;
    }

    // Risk actions
    if (entityType === 'risk') {
      if (action === 'created') return user + ' added risk ' + entityName;
      if (action === 'updated') return user + ' updated risk ' + entityName;
      if (action === 'deleted') return user + ' removed risk ' + entityName;
    }

    // Control actions
    if (entityType === 'control') {
      if (action === 'created') return user + ' created control ' + entityName;
      if (action === 'updated') return user + ' updated control ' + entityName;
      if (action === 'deleted') return user + ' removed control ' + entityName;
      if (action === 'linked') return user + ' linked control ' + entityName;
      if (action === 'unlinked') return user + ' unlinked control ' + entityName;
    }

    // Report actions
    if (entityType === 'report') {
      if (action === 'created') return user + ' generated report ' + entityName;
      if (action === 'exported') return user + ' exported report ' + entityName;
    }

    // User/Team actions
    if (entityType === 'user' || entityType === 'team-member') {
      if (action === 'added' || action === 'created') return user + ' invited ' + entityName + ' to workspace';
      if (action === 'removed' || action === 'deleted') return user + ' removed ' + entityName + ' from workspace';
      if (action === 'updated') return user + ' updated ' + entityName + ' access';
    }

    // Workspace actions
    if (entityType === 'workspace') {
      if (action === 'updated') return user + ' updated workspace settings';
    }

    // Default fallback
    return user + ' ' + this.escapeHtml(action) + ' ' + entityName;
  },

  /**
   * Get action indicator class
   */
  getActionClass: function(action) {
    action = (action || '').toLowerCase();
    if (action === 'created' || action === 'added') return 'action-create';
    if (action === 'updated') return 'action-update';
    if (action === 'deleted' || action === 'removed') return 'action-delete';
    if (action === 'linked') return 'action-link';
    if (action === 'unlinked') return 'action-unlink';
    if (action === 'exported') return 'action-export';
    return 'action-neutral';
  },

  /**
   * Format type label
   */
  formatTypeLabel: function(type) {
    var labels = {
      'risk': 'Risk',
      'register': 'Register',
      'risk register': 'Register',
      'control': 'Control',
      'report': 'Report',
      'user': 'User',
      'team-member': 'User',
      'workspace': 'Workspace',
      'settings': 'Settings'
    };
    return labels[(type || '').toLowerCase()] || 'Activity';
  },

  /**
   * Escape HTML
   */
  escapeHtml: function(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  /**
   * Get filtered activities
   */
  getFilteredActivities: function() {
    if (typeof ERM.activityLogger === 'undefined') {
      return [];
    }

    var activities = ERM.activityLogger.getAll();

    // Apply search filter
    if (this.filters.search) {
      activities = ERM.activityLogger.search(this.filters.search);
    }

    // Apply type filter
    if (this.filters.type !== 'all') {
      var filtered = [];
      for (var i = 0; i < activities.length; i++) {
        if (activities[i].type === this.filters.type) {
          filtered.push(activities[i]);
        }
      }
      activities = filtered;
    }

    // Apply action filter
    if (this.filters.action !== 'all') {
      var filtered2 = [];
      for (var j = 0; j < activities.length; j++) {
        if (activities[j].action === this.filters.action) {
          filtered2.push(activities[j]);
        }
      }
      activities = filtered2;
    }

    return activities;
  },

  /**
   * Bind event handlers
   */
  bindEvents: function() {
    var self = this;

    setTimeout(function() {
      // Search input
      var searchInput = document.getElementById('activity-search');
      if (searchInput) {
        searchInput.addEventListener('input', function() {
          self.filters.search = this.value;
          self.render();
          self.bindEvents();
        });
      }

      // Type filter
      var typeFilter = document.getElementById('activity-type-filter');
      if (typeFilter) {
        typeFilter.addEventListener('change', function() {
          self.filters.type = this.value;
          self.render();
          self.bindEvents();
        });
      }

      // Action filter
      var actionFilter = document.getElementById('activity-action-filter');
      if (actionFilter) {
        actionFilter.addEventListener('change', function() {
          self.filters.action = this.value;
          self.render();
          self.bindEvents();
        });
      }

      // Reset filters
      var resetBtn = document.getElementById('reset-filters-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', function() {
          self.filters = {
            search: '',
            type: 'all',
            action: 'all',
            dateFrom: '',
            dateTo: ''
          };
          self.render();
          self.bindEvents();
        });
      }

      // Export dropdown toggle
      var exportBtn = document.getElementById('export-activity-btn');
      var exportDropdown = document.getElementById('export-dropdown');
      if (exportBtn && exportDropdown) {
        exportBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          exportDropdown.classList.toggle('active');
        });

        // Close dropdown on outside click
        document.addEventListener('click', function(e) {
          if (!exportBtn.contains(e.target) && !exportDropdown.contains(e.target)) {
            exportDropdown.classList.remove('active');
          }
        });
      }

      // Export options
      var exportOptions = document.querySelectorAll('.export-option');
      for (var eo = 0; eo < exportOptions.length; eo++) {
        exportOptions[eo].addEventListener('click', function() {
          var format = this.getAttribute('data-format');
          if (exportDropdown) exportDropdown.classList.remove('active');
          self.exportActivities(format);
        });
      }

      // Clear log
      var clearBtn = document.getElementById('clear-activity-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', function() {
          if (confirm('Are you sure you want to clear all activity logs? This action cannot be undone.')) {
            if (ERM.activityLogger) {
              ERM.activityLogger.clear();
              // Also clear read notifications
              ERM.storage.set('readNotifications', []);
              ERM.toast.success('Activity log cleared');
              self.render();
              self.bindEvents();
            }
          }
        });
      }
    }, 100);
  },

  /**
   * Export activities in specified format
   */
  exportActivities: function(format) {
    var activities = this.getFilteredActivities();

    if (activities.length === 0) {
      ERM.toast.error('No activities to export');
      return;
    }

    if (format === 'excel') {
      this.exportToExcel(activities);
    } else if (format === 'pdf') {
      this.exportToPDF(activities);
    }
  },

  /**
   * Export to Excel (CSV format)
   */
  exportToExcel: function(activities) {
    var csv = 'Date,Time,User,Action,Type,Entity\n';

    for (var i = 0; i < activities.length; i++) {
      var a = activities[i];
      var action = (a.action || '').charAt(0).toUpperCase() + (a.action || '').slice(1);
      var type = this.formatTypeLabel(a.type || a.entityType);

      csv += '"' + (a.date || '') + '",';
      csv += '"' + (a.time || '') + '",';
      csv += '"' + (a.user || '').replace(/"/g, '""') + '",';
      csv += '"' + action + '",';
      csv += '"' + type + '",';
      csv += '"' + (a.entityName || '').replace(/"/g, '""') + '"\n';
    }

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'audit-trail-' + new Date().toISOString().split('T')[0] + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    ERM.toast.success('Exported to Excel (CSV)');
  },

  /**
   * Export to PDF
   */
  exportToPDF: function(activities) {
    var self = this;

    // Create printable HTML
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
      '<title>Audit Trail Export</title>' +
      '<style>' +
      'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; }' +
      'h1 { font-size: 24px; margin-bottom: 8px; color: #0f172a; }' +
      '.subtitle { color: #64748b; margin-bottom: 24px; }' +
      '.meta { display: flex; gap: 24px; margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; }' +
      '.meta-item { font-size: 13px; }' +
      '.meta-label { color: #64748b; }' +
      '.meta-value { font-weight: 600; color: #0f172a; }' +
      'table { width: 100%; border-collapse: collapse; font-size: 13px; }' +
      'th { text-align: left; padding: 12px; background: #f1f5f9; color: #475569; font-weight: 600; border-bottom: 2px solid #e2e8f0; }' +
      'td { padding: 12px; border-bottom: 1px solid #f1f5f9; }' +
      'tr:nth-child(even) { background: #fafafa; }' +
      '.action-create { color: #16a34a; }' +
      '.action-update { color: #2563eb; }' +
      '.action-delete { color: #dc2626; }' +
      '.footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }' +
      '@media print { body { padding: 20px; } }' +
      '</style></head><body>' +
      '<h1>Audit Trail Report</h1>' +
      '<p class="subtitle">Dimeri ERM - Activity Log Export</p>' +
      '<div class="meta">' +
      '<div class="meta-item"><span class="meta-label">Generated:</span> <span class="meta-value">' + new Date().toLocaleString() + '</span></div>' +
      '<div class="meta-item"><span class="meta-label">Total Records:</span> <span class="meta-value">' + activities.length + '</span></div>' +
      '<div class="meta-item"><span class="meta-label">Workspace:</span> <span class="meta-value">' + (ERM.state.workspace ? ERM.state.workspace.name : 'Default') + '</span></div>' +
      '</div>' +
      '<table>' +
      '<thead><tr><th>Date</th><th>Time</th><th>User</th><th>Action</th><th>Type</th><th>Entity</th></tr></thead>' +
      '<tbody>';

    for (var i = 0; i < activities.length; i++) {
      var a = activities[i];
      var action = (a.action || '').charAt(0).toUpperCase() + (a.action || '').slice(1);
      var actionClass = '';
      if (a.action === 'created' || a.action === 'added') actionClass = 'action-create';
      else if (a.action === 'updated') actionClass = 'action-update';
      else if (a.action === 'deleted' || a.action === 'removed') actionClass = 'action-delete';

      html += '<tr>' +
        '<td>' + self.escapeHtml(a.date || '') + '</td>' +
        '<td>' + self.escapeHtml(a.time || '') + '</td>' +
        '<td>' + self.escapeHtml(a.user || '') + '</td>' +
        '<td class="' + actionClass + '">' + self.escapeHtml(action) + '</td>' +
        '<td>' + self.escapeHtml(self.formatTypeLabel(a.type || a.entityType)) + '</td>' +
        '<td>' + self.escapeHtml(a.entityName || '') + '</td>' +
        '</tr>';
    }

    html += '</tbody></table>' +
      '<div class="footer">Generated by Dimeri ERM • ' + new Date().toLocaleDateString() + '</div>' +
      '</body></html>';

    // Open in new window for printing
    var printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();

    // Auto-trigger print dialog
    setTimeout(function() {
      printWindow.print();
    }, 500);

    ERM.toast.success('PDF ready for printing');
  }

};

console.log('Activity Log module loaded');

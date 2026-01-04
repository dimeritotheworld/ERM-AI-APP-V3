/**
 * Risk Reporting Hub Module for Dimeri ERM
 * CRUD interface for report templates, generated reports, and scheduled reports
 * ES5 Compatible
 */

(function () {
  'use strict';

  // Initialize Reports namespace
  window.ERM = window.ERM || {};
  ERM.reports = ERM.reports || {};

  // ========================================
  // STATE MANAGEMENT
  // ========================================

  var state = {
    templates: [],
    recentReports: [],
    scheduledReports: [],
    currentTemplate: null,
    currentReport: null,
    editor: null
  };

  // Starter templates (shown when AI is unavailable or user chooses manual)
  var starterTemplates = [
    {
      id: 'starter-board',
      icon: '📋',
      name: 'Board Risk Report',
      description: 'Strategic risk overview for board members and executives',
      frequency: 'Quarterly',
      audience: 'Board of Directors',
      pageRange: '10-15 pages',
      sections: ['Executive Summary', 'Risk Landscape', 'Top 10 Risks', 'Risk Trends', 'Recommendations'],
      accentColor: '#3b82f6'
    },
    {
      id: 'starter-operational',
      icon: '⚙️',
      name: 'Operational Risk Report',
      description: 'Detailed operational risk analysis for management',
      frequency: 'Monthly',
      audience: 'Operations Team',
      pageRange: '8-12 pages',
      sections: ['Risk Summary', 'Control Status', 'Incident Log', 'Action Items', 'KRIs'],
      accentColor: '#f59e0b'
    },
    {
      id: 'starter-compliance',
      icon: '📜',
      name: 'Compliance Report',
      description: 'Regulatory compliance status and risk assessment',
      frequency: 'Quarterly',
      audience: 'Compliance Committee',
      pageRange: '12-18 pages',
      sections: ['Compliance Overview', 'Regulatory Changes', 'Gap Analysis', 'Remediation Status'],
      accentColor: '#10b981'
    },
    {
      id: 'starter-audit',
      icon: '🔍',
      name: 'Internal Audit Report',
      description: 'Risk-based audit findings and recommendations',
      frequency: 'Monthly',
      audience: 'Audit Committee',
      pageRange: '6-10 pages',
      sections: ['Audit Scope', 'Key Findings', 'Risk Ratings', 'Management Response'],
      accentColor: '#8b5cf6'
    }
  ];

  // ========================================
  // INITIALIZATION
  // ========================================

  ERM.reports.init = function () {
    console.log('[Reports] Initializing Risk Reporting Hub...');
    this.loadData();
    console.log('[Reports] Initialized');
  };

  ERM.reports.loadData = function () {
    // Load templates
    state.templates = ERM.storage.get('reportTemplates') || [];

    // Load recent reports
    state.recentReports = ERM.storage.get('recentReports') || [];

    // Load scheduled reports
    state.scheduledReports = ERM.storage.get('scheduledReports') || [];

    console.log('[Reports] Loaded ' + state.templates.length + ' templates, ' +
                state.recentReports.length + ' recent reports, ' +
                state.scheduledReports.length + ' schedules');
  };

  ERM.reports.saveTemplates = function () {
    ERM.storage.set('reportTemplates', state.templates);
  };

  ERM.reports.saveRecentReports = function () {
    ERM.storage.set('recentReports', state.recentReports);
  };

  ERM.reports.saveScheduledReports = function () {
    ERM.storage.set('scheduledReports', state.scheduledReports);
  };

  // ========================================
  // MAIN RENDER
  // ========================================

  ERM.reports.render = function () {
    var container = document.getElementById('view-reports');
    if (!container) {
      console.log('[Reports] Container not found');
      return;
    }

    console.log('[Reports] Rendering Risk Reporting Hub...');
    this.loadData();

    var html = '';

    // Plan limit banner (non-dismissible with counter, FREE plan only)
    var plan = ERM.usageTracker ? ERM.usageTracker.getPlan() : 'FREE';
    var status = ERM.enforcement ? ERM.enforcement.getStatus('reports') : null;
    if (plan === 'FREE' && status && status.limit !== -1) {
      html += '<div class="info-banner" id="reports-free-plan-banner">';
      html += '  <div class="info-banner-content">';
      html += '    <span class="info-banner-icon-circle">i</span>';
      html += '    <span class="info-banner-text">' + status.current + ' of ' + status.limit + ' reports used. <a href="upgrade.html?source=report_limit">Upgrade for unlimited</a></span>';
      html += '  </div>';
      html += '</div>';
    }

    // Page Header - only show Create Report button if reports exist
    html += '<div class="page-header">';
    html += '  <div class="page-header-content">';
    html += '    <h1 class="page-title">Risk Reporting Hub</h1>';
    html += '    <p class="page-subtitle">Generate stakeholder-specific risk reports</p>';
    html += '  </div>';
    if (state.recentReports.length > 0) {
      html += '  <div class="page-header-actions">';
      html += '    <button class="btn btn-primary" onclick="ERM.reports.showCreateReportModal()">';
      html += '      + Create Report';
      html += '    </button>';
      html += '  </div>';
    }
    html += '</div>';

    // Reports Content Area (Windows Explorer style)
    html += this.renderReportsContent();

    container.innerHTML = html;
    this.bindEvents();
  };

  // ========================================
  // REPORTS CONTENT (Windows Explorer Style)
  // ========================================

  ERM.reports.renderReportsContent = function () {
    var html = '';

    // Content container
    html += '<div class="reports-content-area">';

    // Only show toolbar if there are reports
    if (state.recentReports.length > 0) {
      // Toolbar with search, filter, sort, and view options
      html += '  <div class="reports-toolbar">';
      html += '    <div class="toolbar-left">';
      // Select all checkbox
      html += '      <label class="checkbox-wrapper" title="Select all">';
      html += '        <input type="checkbox" id="select-all-reports">';
      html += '        <span class="checkbox-custom"></span>';
      html += '      </label>';
      // Search box
      html += '      <div class="toolbar-search">';
      html += '        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
      html += '          <circle cx="11" cy="11" r="8"></circle>';
      html += '          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>';
      html += '        </svg>';
      html += '        <input type="text" id="reports-search" class="search-input" placeholder="Search reports...">';
      html += '      </div>';
      // Filter dropdown
      html += '      <div class="toolbar-filter">';
      html += '        <select id="reports-filter" class="filter-select">';
      html += '          <option value="all">All Formats</option>';
      html += '          <option value="PDF">PDF</option>';
      html += '        </select>';
      html += '      </div>';
      html += '      <span class="reports-count">' + state.recentReports.length + ' report' + (state.recentReports.length !== 1 ? 's' : '') + '</span>';
      html += '    </div>';
      html += '    <div class="toolbar-right">';
      // Sort dropdown
      html += '      <div class="dropdown">';
      html += '        <button class="btn btn-ghost btn-sm dropdown-toggle" id="reports-sort-dropdown-btn">';
      html += '          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4"/></svg>';
      html += '          Sort';
      html += '        </button>';
      html += '        <div class="dropdown-menu" id="reports-sort-dropdown-menu">';
      html += '          <a href="#" class="dropdown-item active" data-sort="newest">Newest first</a>';
      html += '          <a href="#" class="dropdown-item" data-sort="oldest">Oldest first</a>';
      html += '          <a href="#" class="dropdown-item" data-sort="name-asc">Name A-Z</a>';
      html += '          <a href="#" class="dropdown-item" data-sort="name-desc">Name Z-A</a>';
      html += '        </div>';
      html += '      </div>';
      html += '      <div class="view-toggle">';
      html += '        <button class="view-btn" data-view="grid" title="Grid view">';
      html += '          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
      html += '            <rect x="3" y="3" width="7" height="7"></rect>';
      html += '            <rect x="14" y="3" width="7" height="7"></rect>';
      html += '            <rect x="14" y="14" width="7" height="7"></rect>';
      html += '            <rect x="3" y="14" width="7" height="7"></rect>';
      html += '          </svg>';
      html += '        </button>';
      html += '        <button class="view-btn active" data-view="list" title="List view">';
      html += '          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
      html += '            <line x1="8" y1="6" x2="21" y2="6"></line>';
      html += '            <line x1="8" y1="12" x2="21" y2="12"></line>';
      html += '            <line x1="8" y1="18" x2="21" y2="18"></line>';
      html += '            <line x1="3" y1="6" x2="3.01" y2="6"></line>';
      html += '            <line x1="3" y1="12" x2="3.01" y2="12"></line>';
      html += '            <line x1="3" y1="18" x2="3.01" y2="18"></line>';
      html += '          </svg>';
      html += '        </button>';
      html += '      </div>';
      html += '    </div>';
      html += '  </div>';

      // Bulk actions bar (hidden by default, shows when items selected)
      html += '  <div class="bulk-actions-bar" id="reports-bulk-actions" style="display: none;">';
      html += '    <span class="bulk-selected-count" id="reports-selected-count">0 selected</span>';
      html += '    <div class="bulk-actions-buttons">';
      html += '      <button class="btn btn-outline-danger btn-sm" id="bulk-delete-reports">';
      html += '        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
      html += '        Delete';
      html += '      </button>';
      html += '    </div>';
      html += '  </div>';
    }

    // Reports grid/list container (list view by default)
    html += '  <div class="reports-grid" id="reports-grid">';

    if (state.recentReports.length === 0) {
      // Empty state with nice illustration
      html += '    <div class="reports-empty-state">';
      html += '      <div class="empty-illustration">';
      html += '        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">';
      html += '          <rect x="20" y="10" width="80" height="100" rx="4" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="2"/>';
      html += '          <rect x="30" y="25" width="60" height="4" rx="2" fill="#cbd5e1"/>';
      html += '          <rect x="30" y="35" width="45" height="3" rx="1.5" fill="#e2e8f0"/>';
      html += '          <rect x="30" y="45" width="55" height="3" rx="1.5" fill="#e2e8f0"/>';
      html += '          <rect x="30" y="55" width="40" height="3" rx="1.5" fill="#e2e8f0"/>';
      html += '          <rect x="30" y="70" width="60" height="25" rx="2" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>';
      html += '          <path d="M50 77 L55 85 L70 75" stroke="#c41e3a" stroke-width="2" fill="none"/>';
      html += '        </svg>';
      html += '      </div>';
      html += '      <h3 class="empty-title">No reports yet</h3>';
      html += '      <p class="empty-description">Create your first report to see it here. Reports help you communicate risk insights to stakeholders.</p>';
      html += '      <button class="btn btn-primary" onclick="ERM.reports.showCreateReportModal()">';
      html += '        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">';
      html += '          <line x1="12" y1="5" x2="12" y2="19"></line>';
      html += '          <line x1="5" y1="12" x2="19" y2="12"></line>';
      html += '        </svg>';
      html += '        Create Report';
      html += '      </button>';
      html += '    </div>';
    } else {
      // Render report cards
      for (var i = 0; i < state.recentReports.length; i++) {
        html += this.renderReportCard(state.recentReports[i]);
      }
    }

    html += '  </div>';
    html += '</div>';

    return html;
  };

  ERM.reports.renderReportCard = function (report) {
    var html = '';
    var isV2 = report.format === 'v2';
    var displayFormat = isV2 ? 'Report' : (report.format || 'PDF');
    var formatIcon = isV2 ? this.getV2FormatIcon() : this.getFormatIconSmall(report.format || 'PDF');
    var formatIconLarge = isV2 ? this.getV2FormatIconLarge() : this.getFormatIcon(report.format || 'PDF');
    var dateStr = report.updatedAt || report.generatedDate || report.createdAt;
    var formattedDate = ERM.utils.formatDate(dateStr);
    var timeAgo = this.getTimeAgo(dateStr);
    var author = report.author || 'System';
    var reportName = report.title || report.name || 'Untitled Report';

    // Report card - works for both list and grid view
    html += '<div class="report-card" data-report-id="' + report.id + '" data-format="' + (isV2 ? 'v2' : (report.format || 'PDF').toLowerCase()) + '">';

    // Checkbox for bulk select
    html += '  <div class="report-card-checkbox" onclick="event.stopPropagation();">';
    html += '    <label class="checkbox-wrapper">';
    html += '      <input type="checkbox" class="report-select-checkbox" data-report-id="' + report.id + '">';
    html += '      <span class="checkbox-custom"></span>';
    html += '    </label>';
    html += '  </div>';

    // Grid view: icon header section (hidden in list view via CSS)
    html += '  <div class="report-card-icon-header">';
    html += '    <div class="report-icon-large">' + formatIconLarge + '</div>';
    html += '  </div>';

    // Main content area
    html += '  <div class="report-card-body">';
    html += '    <div class="report-card-left">';
    html += '      <div class="report-icon">' + formatIcon + '</div>';
    html += '      <div class="report-info">';
    html += '        <h4 class="report-card-title">' + ERM.utils.escapeHtml(reportName) + '</h4>';
    html += '        <div class="report-card-meta">';
    html += '          <span class="meta-format">' + displayFormat + '</span>';
    html += '          <span class="meta-dot">•</span>';
    html += '          <span class="meta-date" title="' + formattedDate + '">' + timeAgo + '</span>';
    html += '          <span class="meta-dot">•</span>';
    html += '          <span class="meta-author">by ' + ERM.utils.escapeHtml(author) + '</span>';
    html += '        </div>';
    html += '      </div>';
    html += '    </div>';
    html += '    <div class="report-card-actions">';
    html += this.renderKebabMenu(report.id);
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    return html;
  };

  /**
   * Get V2 format icon (small)
   */
  ERM.reports.getV2FormatIcon = function() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>';
  };

  /**
   * Get V2 format icon (large)
   */
  ERM.reports.getV2FormatIconLarge = function() {
    return '<svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#7c3aed" stroke="#7c3aed" stroke-width="1"/><polyline points="14 2 14 8 20 8" fill="#e9d5ff" stroke="#7c3aed" stroke-width="1"/><line x1="16" y1="13" x2="8" y2="13" stroke="white" stroke-width="1.5"/><line x1="16" y1="17" x2="8" y2="17" stroke="white" stroke-width="1.5"/></svg>';
  };

  ERM.reports.getFormatIconSmall = function (format) {
    var icons = {
      'PDF': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
      'Word': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
      'HTML': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'
    };
    return icons[format] || icons['PDF'];
  };

  ERM.reports.getFormatIcon = function (format) {
    var icons = {
      'PDF': '<svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#dc2626" stroke="#dc2626" stroke-width="1"/><polyline points="14 2 14 8 20 8" fill="#fecaca" stroke="#dc2626" stroke-width="1"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="5" font-weight="bold">PDF</text></svg>',
      'Word': '<svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#2563eb" stroke="#2563eb" stroke-width="1"/><polyline points="14 2 14 8 20 8" fill="#bfdbfe" stroke="#2563eb" stroke-width="1"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="4" font-weight="bold">DOC</text></svg>',
      'HTML': '<svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#ea580c" stroke="#ea580c" stroke-width="1"/><polyline points="14 2 14 8 20 8" fill="#fed7aa" stroke="#ea580c" stroke-width="1"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="3.5" font-weight="bold">HTML</text></svg>'
    };
    return icons[format] || icons['PDF'];
  };

  ERM.reports.getTimeAgo = function (dateStr) {
    if (!dateStr) return 'Unknown';
    var date = new Date(dateStr);
    var now = new Date();
    var diffMs = now - date;
    var diffMins = Math.floor(diffMs / 60000);
    var diffHours = Math.floor(diffMs / 3600000);
    var diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return diffMins + ' min' + (diffMins !== 1 ? 's' : '') + ' ago';
    if (diffHours < 24) return diffHours + ' hour' + (diffHours !== 1 ? 's' : '') + ' ago';
    if (diffDays < 7) return diffDays + ' day' + (diffDays !== 1 ? 's' : '') + ' ago';
    return ERM.utils.formatDate(dateStr);
  };

  // ========================================
  // SECTION 1: REPORT TEMPLATES
  // ========================================

  ERM.reports.renderTemplatesSection = function () {
    var html = '';

    html += '<div class="report-section">';
    html += '  <div class="section-header">';
    html += '    <h2 class="section-title">Report Templates</h2>';
    if (state.templates.length > 0) {
      html += '    <button class="btn btn-secondary" onclick="ERM.reports.showCreateTemplateModal()">';
      html += '      + New Template';
      html += '    </button>';
    }
    html += '  </div>';

    if (state.templates.length === 0) {
      html += '  <div class="empty-state-card">';
      html += '    <div class="empty-state-icon">📄</div>';
      html += '    <h3>No Report Templates</h3>';
      html += '    <p>Create your first report template to start generating stakeholder-specific risk reports.</p>';
      html += '    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">';
      html += '      <button class="btn btn-primary" onclick="ERM.reports.showCreateTemplateModal()">';
      html += '        + Create Template';
      html += '      </button>';
      html += '      <button class="btn btn-secondary" onclick="ERM.reports.showStarterTemplates()" title="Use pre-built templates when AI is unavailable">';
      html += '        📁 Use Starter Templates';
      html += '      </button>';
      html += '    </div>';
      html += '  </div>';
    } else {
      html += '  <div class="templates-grid">';
      for (var i = 0; i < state.templates.length; i++) {
        html += this.renderTemplateCard(state.templates[i]);
      }
      html += '  </div>';
    }

    html += '</div>';

    return html;
  };

  ERM.reports.renderTemplateCard = function (template) {
    var accentStyle = template.accentColor ? 'border-top: 4px solid ' + template.accentColor + ';' : '';

    var html = '';
    html += '<div class="template-card" style="' + accentStyle + '" data-template-id="' + template.id + '">';
    html += '  <div class="template-card-header">';
    html += '    <div class="template-icon">' + template.icon + '</div>';
    html += '    <div class="template-actions">';
    html += '      <button class="btn-icon" onclick="event.stopPropagation(); ERM.reports.editTemplate(\'' + template.id + '\')" title="Edit">✏️</button>';
    html += '      <button class="btn-icon btn-icon-danger" onclick="event.stopPropagation(); ERM.reports.deleteTemplate(\'' + template.id + '\')" title="Delete">🗑️</button>';
    html += '    </div>';
    html += '  </div>';
    html += '  <div class="template-card-content">';
    html += '    <h3 class="template-card-title">' + ERM.utils.escapeHtml(template.name) + '</h3>';
    html += '    <p class="template-card-desc">' + ERM.utils.escapeHtml(template.description) + '</p>';
    html += '    <div class="template-meta">';
    html += '      <span class="meta-item">📅 ' + template.frequency + '</span>';
    html += '      <span class="meta-item">👥 ' + template.audience + '</span>';
    html += '      <span class="meta-item">📄 ' + template.pageRange + '</span>';
    html += '    </div>';
    html += '    <div class="template-sections">';
    for (var i = 0; i < template.sections.length; i++) {
      html += '<span class="section-badge">' + ERM.utils.escapeHtml(template.sections[i]) + '</span>';
    }
    html += '    </div>';
    html += '  </div>';
    html += '  <button class="btn btn-primary template-generate-btn" onclick="ERM.reports.openReportBuilder(\'' + template.id + '\')">';
    html += '    Generate Report →';
    html += '  </button>';
    html += '</div>';

    return html;
  };

  // ========================================
  // SECTION 2: RECENT REPORTS
  // ========================================

  ERM.reports.renderRecentReportsSection = function () {
    var html = '';

    html += '<div class="report-section">';
    html += '  <div class="section-header">';
    html += '    <h2 class="section-title">Recent Reports</h2>';
    html += '    <button class="btn btn-secondary" onclick="ERM.reports.showSchedulerModal()">';
    html += '      🕐 Schedule Reports';
    html += '    </button>';
    html += '  </div>';

    if (state.recentReports.length === 0) {
      html += '  <div class="empty-state-inline">';
      html += '    <p>No reports generated yet. Select a template above to create your first report.</p>';
      html += '  </div>';
    } else {
      html += '  <div class="recent-reports-list">';
      for (var i = 0; i < state.recentReports.length; i++) {
        html += this.renderRecentReportRow(state.recentReports[i]);
      }
      html += '  </div>';
    }

    html += '</div>';

    return html;
  };

  ERM.reports.renderRecentReportRow = function (report) {
    var html = '';

    html += '<div class="recent-report-row" data-report-id="' + report.id + '">';
    html += '  <div class="report-info">';
    html += '    <div class="report-icon">' + (report.icon || '📄') + '</div>';
    html += '    <div class="report-details">';
    html += '      <h4 class="report-name">' + ERM.utils.escapeHtml(report.name) + '</h4>';
    html += '      <div class="report-meta-row">';
    html += '        <span class="meta-text">📅 ' + ERM.utils.formatDate(report.generatedDate) + '</span>';
    html += '        <span class="meta-text">👤 ' + ERM.utils.escapeHtml(report.author || 'System') + '</span>';
    html += '        <span class="meta-text">📄 ' + (report.format || 'PDF') + ' • ' + (report.pageCount || '—') + ' pages</span>';
    if (report.distribution) {
      html += '        <span class="meta-text">📧 ' + ERM.utils.escapeHtml(report.distribution) + '</span>';
    }
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';
    html += '  <div class="report-actions">';
    html += '    <button class="btn btn-sm btn-secondary" onclick="ERM.reports.downloadReport(\'' + report.id + '\')">';
    html += '      ⬇️ Download';
    html += '    </button>';
    html += this.renderKebabMenu(report.id);
    html += '  </div>';
    html += '</div>';

    return html;
  };

  // ========================================
  // SECTION 3: SCHEDULED REPORTS
  // ========================================

  ERM.reports.renderScheduledReportsSection = function () {
    var html = '';

    html += '<div class="report-section">';
    html += '  <div class="section-header">';
    html += '    <h2 class="section-title">Scheduled Reports</h2>';
    html += '  </div>';

    if (state.scheduledReports.length === 0) {
      html += '  <div class="empty-state-inline">';
      html += '    <p>No scheduled reports. Click "Schedule Reports" above to automate report generation.</p>';
      html += '  </div>';
    } else {
      html += '  <div class="scheduled-reports-grid">';
      for (var i = 0; i < state.scheduledReports.length; i++) {
        html += this.renderScheduledReportCard(state.scheduledReports[i]);
      }
      html += '  </div>';
    }

    html += '</div>';

    return html;
  };

  ERM.reports.renderScheduledReportCard = function (schedule) {
    var statusClass = schedule.active ? 'active' : 'paused';
    var statusDot = schedule.active ? '🟢' : '🔴';

    var html = '';
    html += '<div class="scheduled-report-card ' + statusClass + '" data-schedule-id="' + schedule.id + '">';
    html += '  <div class="schedule-header">';
    html += '    <h4 class="schedule-name">' + ERM.utils.escapeHtml(schedule.reportName) + '</h4>';
    html += '    <span class="schedule-status">' + statusDot + ' ' + (schedule.active ? 'Active' : 'Paused') + '</span>';
    html += '  </div>';
    html += '  <div class="schedule-details">';
    html += '    <div class="schedule-row"><span class="schedule-label">Frequency:</span> ' + schedule.frequency + '</div>';
    html += '    <div class="schedule-row"><span class="schedule-label">Next Run:</span> ' + ERM.utils.formatDate(schedule.nextRun) + '</div>';
    html += '    <div class="schedule-row"><span class="schedule-label">Recipients:</span> ' + ERM.utils.escapeHtml(schedule.recipients) + '</div>';
    html += '  </div>';
    html += '  <div class="schedule-actions">';
    if (schedule.active) {
      html += '    <button class="btn btn-sm btn-secondary" onclick="ERM.reports.pauseSchedule(\'' + schedule.id + '\')">⏸️ Pause</button>';
    } else {
      html += '    <button class="btn btn-sm btn-secondary" onclick="ERM.reports.resumeSchedule(\'' + schedule.id + '\')">▶️ Resume</button>';
    }
    html += '    <button class="btn btn-sm btn-danger-outline" onclick="ERM.reports.deleteSchedule(\'' + schedule.id + '\')">🗑️ Delete</button>';
    html += '  </div>';
    html += '</div>';

    return html;
  };

  // ========================================
  // CREATE REPORT MODAL (Two Options)
  // ========================================

  /**
   * Show create report - opens V2 editor directly with new report
   */
  ERM.reports.showCreateReportModal = function () {
    var self = this;

    // Check if V2 editor is available
    if (typeof ERM.reportEditorV2 !== 'undefined') {
      // Create new report and open V2 editor directly
      self.createNewReportV2();
      return;
    }

    // Fallback to legacy modal if V2 not available
    var content = '';
    content += '<div class="add-risk-choice">';
    content += '  <p class="choice-intro">How would you like to create your report?</p>';
    content += '  <div class="choice-cards">';

    // Option 1: Describe with AI
    content += '    <div class="choice-card ai-choice" data-choice="ai">';
    content += '      <div class="choice-card-icon ai-gradient">✨</div>';
    content += '      <div class="choice-card-content">';
    content += '        <h4 class="choice-card-title">Describe with AI</h4>';
    content += '        <p class="choice-card-desc">Describe what you need and let AI generate a complete report with relevant data and insights</p>';
    content += '      </div>';
    content += '    </div>';

    // Option 2: Manual Entry with AI Assistant
    content += '    <div class="choice-card" data-choice="manual">';
    content += '      <div class="choice-card-icon">📝</div>';
    content += '      <div class="choice-card-content">';
    content += '        <h4 class="choice-card-title">Manual Entry</h4>';
    content += '        <p class="choice-card-desc">Build your report step-by-step with full control over all sections and content</p>';
    content += '        <div class="choice-card-ai-badge">';
    content += '          <span class="ai-badge-icon">✨</span>';
    content += '          <span class="ai-badge-text">Write with AI Assistant</span>';
    content += '        </div>';
    content += '      </div>';
    content += '    </div>';

    content += '  </div>';
    content += '</div>';

    ERM.components.showModal({
      title: '📄 Create Report',
      content: content,
      size: 'md',
      buttons: [
        { label: 'Cancel', type: 'secondary', action: 'close' }
      ]
    });

    // Bind click events after modal renders
    setTimeout(function () {
      var aiCard = document.querySelector('.choice-card.ai-choice');
      var manualCard = document.querySelector('.choice-card[data-choice="manual"]');

      if (aiCard) {
        aiCard.addEventListener('click', function () {
          // Check AI limit before showing AI report builder
          if (typeof ERM.enforcement !== 'undefined' && ERM.enforcement.canUseAI) {
            var aiCheck = ERM.enforcement.canUseAI();
            if (!aiCheck.allowed && typeof ERM.upgradeModal !== 'undefined') {
              ERM.components.closeModal();
              setTimeout(function() {
                ERM.upgradeModal.show({
                  title: 'AI Limit Reached',
                  message: aiCheck.message,
                  feature: 'AI Report Builder',
                  upgradeMessage: aiCheck.upgradeMessage,
                  current: aiCheck.current,
                  limit: aiCheck.limit
                });
              }, 100);
              return;
            }
          }

          ERM.components.closeModal();
          setTimeout(function () {
            self.showAIReportBuilder();
          }, 200);
        });
      }

      if (manualCard) {
        manualCard.addEventListener('click', function () {
          ERM.components.closeModal();
          setTimeout(function () {
            self.showManualReportOptions();
          }, 200);
        });
      }
    }, 100);
  };

  /**
   * Create new report and open V2 editor
   */
  ERM.reports.createNewReportV2 = function() {
    // Create a new blank report
    var newReport = {
      id: 'report_' + Date.now(),
      title: 'Untitled Report',
      format: 'v2',
      content: [
        { id: 'block_1', type: 'paragraph', content: '' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: ERM.state && ERM.state.user ? ERM.state.user.name : 'Unknown',
      comments: []
    };

    // Hide main content and show editor
    var mainContainer = document.querySelector('.main-content') || document.querySelector('.content-area');
    if (mainContainer) {
      mainContainer.setAttribute('data-hidden-for-editor', 'true');
      mainContainer.style.display = 'none';
    }

    // Create editor container
    var editorContainer = document.createElement('div');
    editorContainer.id = 'editor-v2-container';
    editorContainer.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; background: white;';
    document.body.appendChild(editorContainer);

    // Initialize V2 editor with new report
    ERM.reportEditorV2.init('editor-v2-container', newReport);

    // Log activity
    if (ERM.activityLogger) {
      ERM.activityLogger.log('report', 'created', 'report', newReport.title, {
        reportId: newReport.id
      });
    }
  };

  /**
   * Show AI Report Builder - user describes what they want
   */
  ERM.reports.showAIReportBuilder = function () {
    var self = this;

    var content = '';
    content += '<div class="ai-report-builder">';
    content += '  <div class="form-group">';
    content += '    <label class="form-label">Describe the report you need</label>';
    content += '    <textarea class="form-input" id="ai-report-prompt" rows="4" placeholder="e.g., Generate a board-level risk summary report showing our top 10 risks, control effectiveness, and trend analysis for Q4 2025..."></textarea>';
    content += '  </div>';

    content += '  <div class="ai-prompt-suggestions">';
    content += '    <p class="suggestions-label">Quick suggestions:</p>';
    content += '    <div class="suggestion-chips">';
    content += '      <button type="button" class="suggestion-chip" data-prompt="Executive summary of all critical and high risks with mitigation status">Executive Risk Summary</button>';
    content += '      <button type="button" class="suggestion-chip" data-prompt="Quarterly risk report showing risk trends, new risks identified, and control effectiveness">Quarterly Risk Report</button>';
    content += '      <button type="button" class="suggestion-chip" data-prompt="Control effectiveness report showing all controls, their testing status, and recommendations">Control Effectiveness Report</button>';
    content += '      <button type="button" class="suggestion-chip" data-prompt="Risk heat map report with detailed analysis of each risk quadrant">Risk Heat Map Analysis</button>';
    content += '    </div>';
    content += '  </div>';

    content += '  <div class="form-row">';
    content += '    <div class="form-group">';
    content += '      <label class="form-label">Target Audience</label>';
    content += '      <select class="form-select" id="ai-report-audience">';
    content += '        <option value="management">Management</option>';
    content += '        <option value="board">Board of Directors</option>';
    content += '        <option value="audit-committee">Audit Committee</option>';
    content += '        <option value="technical">Technical Team</option>';
    content += '      </select>';
    content += '    </div>';
    content += '    <div class="form-group">';
    content += '      <label class="form-label">Report Style</label>';
    content += '      <select class="form-select" id="ai-report-section">';
    content += '        <option value="executive-summary">Executive Summary</option>';
    content += '        <option value="risk-assessment">Risk Assessment</option>';
    content += '        <option value="controls">Control Analysis</option>';
    content += '        <option value="recommendations">Recommendations</option>';
    content += '      </select>';
    content += '    </div>';
    content += '  </div>';

    content += '  <div class="form-row">';
    content += '    <div class="form-group">';
    content += '      <label class="form-label">Report Period</label>';
    content += '      <select class="form-select" id="ai-report-period">';
    content += '        <option value="current">Current Quarter (Q4 2025)</option>';
    content += '        <option value="q3-2025">Q3 2025</option>';
    content += '        <option value="ytd">Year to Date</option>';
    content += '        <option value="custom">Custom Period</option>';
    content += '      </select>';
    content += '    </div>';
    content += '    <div class="form-group">';
    content += '      <label class="form-label">Export Format</label>';
    content += '      <select class="form-select" id="ai-report-format">';
    content += '        <option value="pdf">PDF Document</option>';
    content += '        <option value="html">HTML (Preview)</option>';
    content += '      </select>';
    content += '    </div>';
    content += '  </div>';

    content += '</div>';

    ERM.components.showModal({
      title: '✨ AI Report Builder',
      content: content,
      size: 'lg',
      buttons: [
        { label: 'Cancel', type: 'secondary', action: 'close' },
        { label: '✨ Generate Report', type: 'primary', action: 'generate' }
      ],
      onAction: function(action) {
        if (action === 'generate') {
          ERM.reports.generateAIReport();
        }
      }
    });

    // Bind suggestion chips
    setTimeout(function () {
      var chips = document.querySelectorAll('.suggestion-chip');
      for (var i = 0; i < chips.length; i++) {
        chips[i].addEventListener('click', function () {
          var prompt = this.getAttribute('data-prompt');
          var textarea = document.getElementById('ai-report-prompt');
          if (textarea) {
            textarea.value = prompt;
            textarea.focus();
          }
        });
      }
    }, 100);
  };

  /**
   * Generate report using AI based on user description
   * Uses DeepSeek with strong risk management persona
   */
  ERM.reports.generateAIReport = function () {
    var self = this;

    // Check AI limit before proceeding
    if (typeof ERM.enforcement !== 'undefined' && ERM.enforcement.canUseAI) {
      var aiCheck = ERM.enforcement.canUseAI();
      if (!aiCheck.allowed && typeof ERM.upgradeModal !== 'undefined') {
        // Show upgrade modal for AI limit
        ERM.upgradeModal.show({
          title: 'AI Limit Reached',
          message: aiCheck.message,
          feature: 'AI Report Generation',
          upgradeMessage: aiCheck.upgradeMessage
        });
        return;
      }
    }

    var prompt = document.getElementById('ai-report-prompt').value.trim();
    var period = document.getElementById('ai-report-period').value;
    var format = document.getElementById('ai-report-format').value;
    var audienceSelect = document.getElementById('ai-report-audience');
    var sectionSelect = document.getElementById('ai-report-section');
    var audience = audienceSelect ? audienceSelect.value : 'management';
    var sectionType = sectionSelect ? sectionSelect.value : 'executive-summary';

    if (!prompt) {
      ERM.toast.show({ type: 'error', message: 'Please describe the report you need' });
      return;
    }

    // Check if AI service is available
    if (!ERM.aiService || !ERM.aiService.hasApiKey()) {
      ERM.toast.show({ type: 'warning', message: 'AI service not configured. Generating basic report...' });
      self.generateAIReportFallback(prompt, period, format);
      return;
    }

    // Close the builder modal
    ERM.components.closeModal();

    // Show the AI thinking modal with animated stages
    self.showAIThinkingModal(prompt, period, format, audience, sectionType);
  };

  /**
   * Show animated AI thinking modal during report generation
   * Uses the same design pattern as "Describe with AI" thinking modal
   */
  ERM.reports.showAIThinkingModal = function(prompt, period, format, audience, sectionType) {
    var self = this;

    // Sparkles icon for header
    var sparklesIcon = '<svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>';

    var steps = [
      { text: 'Analyzing your risk data', delay: 800 },
      { text: 'Understanding report requirements', delay: 1000 },
      { text: 'Identifying key insights', delay: 1200 },
      { text: 'Crafting executive narrative', delay: 1500 },
      { text: 'Finalizing report structure', delay: 1000 }
    ];

    var stepsHtml = '';
    for (var i = 0; i < steps.length; i++) {
      stepsHtml +=
        '<div class="ai-step" data-step="' + i + '">' +
        '<div class="ai-step-icon">' +
        '<svg class="ai-step-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="50" stroke-linecap="round"/></svg>' +
        '<svg class="ai-step-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
        '</div>' +
        '<span class="ai-step-text">' + steps[i].text + '</span>' +
        '<span class="ai-step-dots"><span>.</span><span>.</span><span>.</span></span>' +
        '</div>';
    }

    var modalContent = '';
    modalContent += '<div class="ai-thinking-container">';
    modalContent += '<div class="ai-thinking-header">';
    modalContent += '<div class="ai-brain-animation">';
    modalContent += '<div class="ai-brain-circle"></div>';
    modalContent += '<div class="ai-brain-circle"></div>';
    modalContent += '<div class="ai-brain-circle"></div>';
    modalContent += sparklesIcon;
    modalContent += '</div>';
    modalContent += '<h3>AI is generating your report</h3>';
    modalContent += '<p class="ai-input-preview">"' + ERM.utils.escapeHtml(prompt.substring(0, 60)) + (prompt.length > 60 ? '...' : '') + '"</p>';
    modalContent += '</div>';
    modalContent += '<div class="ai-steps-container">';
    modalContent += stepsHtml;
    modalContent += '</div>';
    modalContent += '</div>';

    ERM.components.showModal({
      title: '',
      content: modalContent,
      size: 'sm',
      buttons: [],
      footer: false,
      closeOnBackdrop: false,
      showCloseButton: false,
      onOpen: function() {
        // Style the modal to match ai-thinking-modal pattern
        var modal = document.querySelector('.modal');
        var modalContent = document.querySelector('.modal-content');
        var modalHeader = document.querySelector('.modal-header');
        var modalBody = document.querySelector('.modal-body');
        var modalFooter = document.querySelector('.modal-footer');

        if (modal) {
          modal.classList.add('ai-thinking-modal');
        }

        // Hide header
        if (modalHeader && modalHeader.parentNode) {
          modalHeader.parentNode.removeChild(modalHeader);
        }

        // Hide footer
        if (modalFooter && modalFooter.parentNode) {
          modalFooter.parentNode.removeChild(modalFooter);
        }

        // Fix body styling
        if (modalBody) {
          modalBody.style.cssText = 'padding: 0 !important; max-height: none !important; overflow: visible !important;';
        }

        // Fix modal content wrapper
        if (modalContent) {
          modalContent.style.cssText = 'max-height: none !important; overflow: visible !important;';
        }

        // Animate steps sequentially
        function animateStep(stepIndex) {
          if (stepIndex >= steps.length) {
            return; // Animation complete, modal will be closed by API callback
          }

          var stepEl = document.querySelector('.ai-step[data-step="' + stepIndex + '"]');
          if (stepEl) {
            stepEl.classList.add('active');

            setTimeout(function() {
              stepEl.classList.remove('active');
              stepEl.classList.add('complete');
              animateStep(stepIndex + 1);
            }, steps[stepIndex].delay);
          } else {
            animateStep(stepIndex + 1);
          }
        }

        // Start animation after brief delay
        setTimeout(function() {
          animateStep(0);
        }, 300);
      }
    });

    // Actually call the AI
    self.executeAIReportGeneration(prompt, period, format, audience, sectionType);
  };

  /**
   * Execute the actual AI report generation with DeepSeek
   */
  ERM.reports.executeAIReportGeneration = function(prompt, period, format, audience, sectionType) {
    var self = this;

    // Get real data for context
    var risks = ERM.storage.get('risks') || [];
    var controls = ERM.storage.get('controls') || [];
    var settings = ERM.storage.get('settings') || {};
    var industry = settings.industry || 'general';
    var organizationName = settings.organizationName || 'Organization';

    // Build comprehensive data summary
    var riskSummary = {
      total: risks.length,
      critical: risks.filter(function(r) { return r.inherentRisk === 'critical'; }).length,
      high: risks.filter(function(r) { return r.inherentRisk === 'high'; }).length,
      medium: risks.filter(function(r) { return r.inherentRisk === 'medium'; }).length,
      low: risks.filter(function(r) { return r.inherentRisk === 'low'; }).length,
      topRisks: risks.slice(0, 10).map(function(r) {
        return {
          title: r.title,
          category: r.category,
          inherentRisk: r.inherentRisk,
          residualRisk: r.residualRisk,
          owner: r.owner,
          description: r.description ? r.description.substring(0, 200) : '',
          inherentLikelihood: r.inherentLikelihood || 3,
          inherentImpact: r.inherentImpact || 3,
          residualLikelihood: r.residualLikelihood,
          residualImpact: r.residualImpact
        };
      })
    };

    // Build heatmap matrix data (5x5 grid)
    var heatmapMatrix = [];
    for (var i = 0; i < 5; i++) {
      heatmapMatrix[i] = [0, 0, 0, 0, 0];
    }
    risks.forEach(function(r) {
      var likelihood = parseInt(r.inherentLikelihood) || 3;
      var impact = parseInt(r.inherentImpact) || 3;
      if (likelihood >= 1 && likelihood <= 5 && impact >= 1 && impact <= 5) {
        heatmapMatrix[likelihood - 1][impact - 1]++;
      }
    });
    riskSummary.heatmapMatrix = heatmapMatrix;

    // Build category distribution
    var categoryDist = {};
    risks.forEach(function(r) {
      var cat = r.category || 'Uncategorized';
      categoryDist[cat] = (categoryDist[cat] || 0) + 1;
    });
    riskSummary.categoryDistribution = categoryDist;

    // Count risks without controls
    var risksWithoutControls = risks.filter(function(r) {
      return !r.linkedControls || r.linkedControls.length === 0;
    }).length;
    riskSummary.risksWithoutControls = risksWithoutControls;

    // Count escalated risks
    var escalatedRisks = risks.filter(function(r) {
      return r.escalationRequired === 'yes' || r.escalationRequired === true;
    }).length;
    riskSummary.escalatedRisks = escalatedRisks;

    var controlSummary = {
      total: controls.length,
      effective: controls.filter(function(c) { return c.effectiveness === 'effective'; }).length,
      partial: controls.filter(function(c) { return c.effectiveness === 'partiallyEffective'; }).length,
      ineffective: controls.filter(function(c) { return c.effectiveness === 'ineffective'; }).length,
      byType: {}
    };

    // Count controls by type
    controls.forEach(function(c) {
      var type = c.type || 'Other';
      controlSummary.byType[type] = (controlSummary.byType[type] || 0) + 1;
    });

    var periodLabel = self.getPeriodLabel(period);
    var audienceLabel = {
      'management': 'Senior Management',
      'board': 'Board of Directors',
      'audit-committee': 'Audit Committee',
      'technical': 'Technical/Operational Team'
    }[audience] || 'Management';

    // Build the DeepSeek prompt with strong persona
    var aiPrompt = 'You are a SENIOR ENTERPRISE RISK MANAGEMENT CONSULTANT writing a formal risk report for ' + organizationName + '.\n\n' +

      'REPORT REQUEST: "' + prompt + '"\n' +
      'TARGET AUDIENCE: ' + audienceLabel + '\n' +
      'PERIOD: ' + periodLabel + '\n' +
      'INDUSTRY: ' + industry + '\n\n' +

      '=== ACTUAL DATA FROM RISK REGISTER ===\n\n' +

      'RISK PROFILE SUMMARY:\n' +
      '- Total Risks: ' + riskSummary.total + '\n' +
      '- Critical: ' + riskSummary.critical + ' | High: ' + riskSummary.high + ' | Medium: ' + riskSummary.medium + ' | Low: ' + riskSummary.low + '\n' +
      '- Risks without controls: ' + risksWithoutControls + '\n' +
      '- Escalated risks: ' + escalatedRisks + '\n\n' +

      'RISK DISTRIBUTION BY CATEGORY:\n';

    for (var cat in categoryDist) {
      if (categoryDist.hasOwnProperty(cat)) {
        aiPrompt += '- ' + cat + ': ' + categoryDist[cat] + ' risks\n';
      }
    }

    aiPrompt += '\nTOP 10 RISKS (by severity):\n';
    riskSummary.topRisks.forEach(function(risk, idx) {
      aiPrompt += '\n' + (idx + 1) + '. ' + risk.title + '\n';
      aiPrompt += '   - Category: ' + (risk.category || 'Uncategorized') + '\n';
      aiPrompt += '   - Inherent Risk: ' + (risk.inherentRisk || 'unassessed').toUpperCase() + ' (L:' + risk.inherentLikelihood + ' x I:' + risk.inherentImpact + ')\n';
      aiPrompt += '   - Residual Risk: ' + (risk.residualRisk || 'unassessed').toUpperCase() + '\n';
      aiPrompt += '   - Owner: ' + (risk.owner || 'Unassigned') + '\n';
      if (risk.description) aiPrompt += '   - Description: ' + risk.description + '\n';
    });

    aiPrompt += '\nCONTROL ENVIRONMENT:\n' +
      '- Total Controls: ' + controlSummary.total + '\n' +
      '- Effective: ' + controlSummary.effective + '\n' +
      '- Partially Effective: ' + controlSummary.partial + '\n' +
      '- Ineffective: ' + controlSummary.ineffective + '\n\n' +

      'Control Types: ';
    var typeLabels = [];
    for (var type in controlSummary.byType) {
      if (controlSummary.byType.hasOwnProperty(type)) {
        typeLabels.push(type + ' (' + controlSummary.byType[type] + ')');
      }
    }
    aiPrompt += typeLabels.join(', ') + '\n\n';

    aiPrompt += '=== REPORT OUTPUT REQUIREMENTS ===\n\n' +
      'Write a professional risk management report with these sections:\n\n' +
      '1. EXECUTIVE SUMMARY (2-3 paragraphs)\n' +
      '   - Overall risk posture assessment\n' +
      '   - Key findings and concerns\n' +
      '   - Top 3 priorities for management attention\n\n' +
      '2. RISK LANDSCAPE OVERVIEW\n' +
      '   - Risk distribution analysis (reference the category data)\n' +
      '   - Commentary on the risk profile shape\n' +
      '   - Comparison of inherent vs residual risk levels\n\n' +
      '3. TOP RISKS ANALYSIS\n' +
      '   - Detailed analysis of the top 5 critical/high risks\n' +
      '   - For each: describe the risk, its potential impact, current controls\n' +
      '   - Reference specific risks BY NAME from the data\n\n' +
      '4. CONTROL EFFECTIVENESS ASSESSMENT\n' +
      '   - Analysis of control coverage\n' +
      '   - Highlight gaps (risks without controls)\n' +
      '   - Control mix (preventive vs detective vs corrective)\n\n' +
      '5. RECOMMENDATIONS & NEXT STEPS\n' +
      '   - Prioritized action items (use numbered list)\n' +
      '   - Quick wins vs longer-term initiatives\n' +
      '   - Specific recommendations referencing actual risks\n\n' +

      'FORMAT REQUIREMENTS:\n' +
      '- Use <h2> for main sections, <h3> for subsections\n' +
      '- Use <ul><li> for bullet points\n' +
      '- Use <table> with proper headers for data tables\n' +
      '- Use <strong> for emphasis\n' +
      '- Professional, authoritative tone for ' + audienceLabel + '\n' +
      '- Reference SPECIFIC risk names from the data provided\n' +
      '- 800-1500 words total\n\n' +

      'Generate the HTML report content now (do not include <html>, <head>, or <body> tags):';

    // Call DeepSeek API directly
    ERM.aiService.callAPI(aiPrompt, function(response) {
      if (response && response.success && response.text) {
        self.handleAIReportSuccess(response.text, prompt, period, format, riskSummary, controlSummary);
      } else {
        console.error('[Reports] DeepSeek API failed:', response ? response.error : 'Unknown error');
        self.handleAIReportError(prompt, period, format);
      }
    }, {
      temperature: 0.7,
      maxTokens: 4000
    });
  };

  /**
   * Handle successful AI report generation
   */
  ERM.reports.handleAIReportSuccess = function(aiContent, prompt, period, format, riskSummary, controlSummary) {
    var self = this;

    // Update modal to success state (using new pattern classes)
    var headerEl = document.querySelector('.ai-thinking-header h3');
    var brainEl = document.querySelector('.ai-brain-animation');
    var stepsContainer = document.querySelector('.ai-steps-container');

    if (headerEl) headerEl.textContent = 'Report Generated!';
    if (brainEl) brainEl.classList.add('success');
    if (stepsContainer) {
      // Mark all steps as complete
      var steps = stepsContainer.querySelectorAll('.ai-step');
      for (var i = 0; i < steps.length; i++) {
        steps[i].classList.remove('active');
        steps[i].classList.add('complete');
      }
    }

    // Build final report HTML
    var reportHtml = self.wrapAIReportContent(aiContent, prompt, period, riskSummary, controlSummary);

    // Create report record
    var report = {
      id: ERM.utils.generateId(),
      templateId: null,
      name: 'AI Generated Report - ' + self.getPeriodLabel(period),
      icon: '✨',
      generatedDate: new Date().toISOString(),
      author: ERM.state.user ? ERM.state.user.name : 'System',
      format: format.toUpperCase(),
      pageCount: 5,
      distribution: null,
      period: period,
      aiGenerated: true,
      prompt: prompt,
      content: reportHtml
    };

    // Add to recent reports
    state.recentReports.unshift(report);
    if (state.recentReports.length > 50) {
      state.recentReports = state.recentReports.slice(0, 50);
    }
    self.saveRecentReports();

    // Log activity
    if (ERM.activityLogger) {
      ERM.activityLogger.log('report', 'created', 'report', report.name, { aiGenerated: true });
    }

    // Short delay to show success state, then open in editor
    setTimeout(function() {
      ERM.components.closeModal();
      self.render();

      // Open in the report content editor modal (Edit/Preview mode)
      ERM.reports.showReportContentEditor(report.id);
      ERM.toast.show({ type: 'success', message: 'Report generated! You can now edit and preview.' });
    }, 1200);
  };

  /**
   * Handle AI report generation error
   */
  ERM.reports.handleAIReportError = function(prompt, period, format) {
    var self = this;

    // Update modal to error state (using new pattern classes)
    var headerEl = document.querySelector('.ai-thinking-header h3');
    var brainEl = document.querySelector('.ai-brain-animation');

    if (headerEl) headerEl.textContent = 'Generation failed - using fallback...';
    if (brainEl) brainEl.classList.add('error');

    setTimeout(function() {
      ERM.components.closeModal();
      ERM.toast.show({ type: 'warning', message: 'AI unavailable. Generating basic report...' });
      self.generateAIReportFallback(prompt, period, format);
    }, 1500);
  };

  /**
   * Fallback generation when AI is not available
   */
  ERM.reports.generateAIReportFallback = function(prompt, period, format) {
    var self = this;
    var risks = ERM.storage.get('risks') || [];
    var controls = ERM.storage.get('controls') || [];

    // Generate the report HTML using static components
    var reportHtml = this.buildAIGeneratedReport(prompt, period, risks, controls);

    // Create report record
    var report = {
      id: ERM.utils.generateId(),
      templateId: null,
      name: 'AI Generated Report - ' + this.getPeriodLabel(period),
      icon: '✨',
      generatedDate: new Date().toISOString(),
      author: ERM.state.user ? ERM.state.user.name : 'System',
      format: format.toUpperCase(),
      pageCount: 5,
      distribution: null,
      period: period,
      aiGenerated: true,
      prompt: prompt
    };

    // Add to recent reports
    state.recentReports.unshift(report);
    if (state.recentReports.length > 50) {
      state.recentReports = state.recentReports.slice(0, 50);
    }
    this.saveRecentReports();

    if (ERM.activityLogger) {
      ERM.activityLogger.log('report', 'created', 'report', report.name, { aiGenerated: true });
    }

    ERM.components.closeModal();
    this.render();

    // Open in the report content editor modal
    setTimeout(function () {
      ERM.reports.showReportContentEditor(report.id);
    }, 300);

    ERM.toast.show({ type: 'success', message: 'Report generated! You can now edit and preview.' });
  };

  /**
   * Wrap AI-generated content with report structure including heatmap
   */
  ERM.reports.wrapAIReportContent = function(aiContent, prompt, period, riskSummary, controlSummary) {
    var self = this;
    var html = '';
    var periodLabel = this.getPeriodLabel(period);
    var settings = ERM.storage.get('settings') || {};
    var organizationName = settings.organizationName || 'Risk Report';

    // Cover/Header
    html += '<div style="border-bottom: 3px solid #1e3a8a; padding-bottom: 24px; margin-bottom: 32px;">';
    html += '<h1 style="color: #0f172a; margin: 0 0 8px 0; font-size: 28px;">' + ERM.utils.escapeHtml(organizationName) + '</h1>';
    html += '<h2 style="color: #3b82f6; margin: 0 0 12px 0; font-size: 20px; font-weight: 500;">AI-Assisted Risk Management Report</h2>';
    html += '<p style="margin: 0; color: #64748b; font-size: 14px;"><strong>Period:</strong> ' + periodLabel + ' | <strong>Generated:</strong> ' + new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) + '</p>';
    html += '</div>';

    // Key Metrics Dashboard
    html += '<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 32px;">';

    html += '<div style="background: #fef2f2; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #fecaca;">';
    html += '<div style="font-size: 32px; font-weight: 700; color: #dc2626;">' + riskSummary.critical + '</div>';
    html += '<div style="font-size: 12px; color: #991b1b; font-weight: 500;">CRITICAL</div>';
    html += '</div>';

    html += '<div style="background: #fff7ed; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #fed7aa;">';
    html += '<div style="font-size: 32px; font-weight: 700; color: #ea580c;">' + riskSummary.high + '</div>';
    html += '<div style="font-size: 12px; color: #9a3412; font-weight: 500;">HIGH</div>';
    html += '</div>';

    html += '<div style="background: #fefce8; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #fef08a;">';
    html += '<div style="font-size: 32px; font-weight: 700; color: #ca8a04;">' + riskSummary.medium + '</div>';
    html += '<div style="font-size: 12px; color: #854d0e; font-weight: 500;">MEDIUM</div>';
    html += '</div>';

    html += '<div style="background: #f0fdf4; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #bbf7d0;">';
    html += '<div style="font-size: 32px; font-weight: 700; color: #16a34a;">' + riskSummary.low + '</div>';
    html += '<div style="font-size: 12px; color: #166534; font-weight: 500;">LOW</div>';
    html += '</div>';

    html += '<div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">';
    html += '<div style="font-size: 32px; font-weight: 700; color: #334155;">' + riskSummary.total + '</div>';
    html += '<div style="font-size: 12px; color: #64748b; font-weight: 500;">TOTAL</div>';
    html += '</div>';

    html += '</div>';

    // Risk Heatmap Section
    if (riskSummary.heatmapMatrix) {
      html += '<div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 32px;">';
      html += '<h3 style="color: #1e293b; margin: 0 0 16px 0; font-size: 16px;">Inherent Risk Heat Map</h3>';
      html += self.buildHeatmapHtml(riskSummary.heatmapMatrix);
      html += '</div>';
    }

    // Category Distribution
    if (riskSummary.categoryDistribution && Object.keys(riskSummary.categoryDistribution).length > 0) {
      html += '<div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 32px;">';
      html += '<h3 style="color: #1e293b; margin: 0 0 16px 0; font-size: 16px;">Risk Distribution by Category</h3>';
      html += '<div style="display: flex; flex-wrap: wrap; gap: 12px;">';
      for (var cat in riskSummary.categoryDistribution) {
        if (riskSummary.categoryDistribution.hasOwnProperty(cat)) {
          var count = riskSummary.categoryDistribution[cat];
          var percentage = Math.round((count / riskSummary.total) * 100);
          html += '<div style="background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; min-width: 120px;">';
          html += '<div style="font-size: 20px; font-weight: 700; color: #3b82f6;">' + count + '</div>';
          html += '<div style="font-size: 12px; color: #64748b;">' + ERM.utils.escapeHtml(cat) + '</div>';
          html += '<div style="font-size: 11px; color: #94a3b8;">' + percentage + '% of total</div>';
          html += '</div>';
        }
      }
      html += '</div>';
      html += '</div>';
    }

    // Control Summary
    html += '<div style="background: #eff6ff; padding: 24px; border-radius: 12px; margin-bottom: 32px; border: 1px solid #bfdbfe;">';
    html += '<h3 style="color: #1e3a8a; margin: 0 0 16px 0; font-size: 16px;">Control Environment Summary</h3>';
    html += '<div style="display: flex; gap: 24px; flex-wrap: wrap;">';

    html += '<div style="flex: 1; min-width: 150px;">';
    html += '<div style="font-size: 28px; font-weight: 700; color: #1e3a8a;">' + controlSummary.total + '</div>';
    html += '<div style="font-size: 12px; color: #3b82f6;">Total Controls</div>';
    html += '</div>';

    html += '<div style="flex: 1; min-width: 150px;">';
    html += '<div style="display: flex; align-items: center; gap: 8px;">';
    html += '<span style="width: 12px; height: 12px; background: #22c55e; border-radius: 50%;"></span>';
    html += '<span style="font-size: 14px; color: #334155;">' + controlSummary.effective + ' Effective</span>';
    html += '</div>';
    html += '<div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">';
    html += '<span style="width: 12px; height: 12px; background: #f59e0b; border-radius: 50%;"></span>';
    html += '<span style="font-size: 14px; color: #334155;">' + controlSummary.partial + ' Partially Effective</span>';
    html += '</div>';
    html += '<div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">';
    html += '<span style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%;"></span>';
    html += '<span style="font-size: 14px; color: #334155;">' + controlSummary.ineffective + ' Ineffective</span>';
    html += '</div>';
    html += '</div>';

    if (riskSummary.risksWithoutControls > 0) {
      html += '<div style="flex: 1; min-width: 150px; background: #fef2f2; padding: 12px; border-radius: 8px;">';
      html += '<div style="font-size: 20px; font-weight: 700; color: #dc2626;">' + riskSummary.risksWithoutControls + '</div>';
      html += '<div style="font-size: 12px; color: #991b1b;">Risks without controls</div>';
      html += '</div>';
    }

    html += '</div>';
    html += '</div>';

    // AI Generated Content
    html += '<div style="line-height: 1.8; color: #334155;">';
    html += aiContent;
    html += '</div>';

    // Page divider
    html += '<hr style="margin: 40px 0; border: none; border-top: 2px solid #e2e8f0;">';

    // Footer
    html += '<div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">';
    html += '<p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;"><strong>Report Request:</strong> "' + ERM.utils.escapeHtml(prompt) + '"</p>';
    html += '<p style="color: #94a3b8; font-size: 11px; margin: 0;">';
    html += 'Generated by Dimeri ERM with AI Assistance | ' + new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    html += '</p>';
    html += '</div>';

    return html;
  };

  /**
   * Build heatmap HTML for AI reports
   */
  ERM.reports.buildHeatmapHtml = function(matrix) {
    var html = '';

    html += '<table style="border-collapse: collapse; margin: 0 auto; font-size: 12px;">';

    // Header row
    html += '<tr>';
    html += '<td style="padding: 4px 8px; text-align: center; font-weight: 600; color: #64748b;"></td>';
    html += '<td colspan="5" style="padding: 4px 8px; text-align: center; font-weight: 600; color: #334155; font-size: 11px;">Impact →</td>';
    html += '</tr>';

    html += '<tr>';
    html += '<td style="padding: 4px 8px; text-align: center; font-weight: 600; color: #334155; font-size: 11px; writing-mode: vertical-rl;">Likelihood ↑</td>';
    for (var i = 1; i <= 5; i++) {
      html += '<td style="padding: 4px; text-align: center; font-weight: 600; color: #475569; width: 50px;">' + i + '</td>';
    }
    html += '</tr>';

    // Matrix rows (5 = highest at top)
    for (var row = 4; row >= 0; row--) {
      html += '<tr>';
      html += '<td style="padding: 4px 8px; text-align: center; font-weight: 600; color: #475569;">' + (row + 1) + '</td>';

      for (var col = 0; col < 5; col++) {
        var count = matrix[row][col];
        var score = (row + 1) * (col + 1);
        var bgColor = this.getHeatmapCellColor(score);

        html += '<td style="padding: 0; width: 50px; height: 50px; background: ' + bgColor + '; text-align: center; vertical-align: middle; border: 2px solid white;">';
        if (count > 0) {
          html += '<span style="background: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">' + count + '</span>';
        }
        html += '</td>';
      }
      html += '</tr>';
    }

    html += '</table>';

    // Legend
    html += '<div style="display: flex; justify-content: center; gap: 16px; margin-top: 12px; font-size: 11px;">';
    html += '<div style="display: flex; align-items: center; gap: 4px;"><span style="width: 14px; height: 14px; background: #dcfce7; border-radius: 3px; border: 1px solid #bbf7d0;"></span> Low</div>';
    html += '<div style="display: flex; align-items: center; gap: 4px;"><span style="width: 14px; height: 14px; background: #fef9c3; border-radius: 3px; border: 1px solid #fef08a;"></span> Medium</div>';
    html += '<div style="display: flex; align-items: center; gap: 4px;"><span style="width: 14px; height: 14px; background: #fed7aa; border-radius: 3px; border: 1px solid #fdba74;"></span> High</div>';
    html += '<div style="display: flex; align-items: center; gap: 4px;"><span style="width: 14px; height: 14px; background: #fecaca; border-radius: 3px; border: 1px solid #fca5a5;"></span> Critical</div>';
    html += '</div>';

    return html;
  };

  /**
   * Get heatmap cell color based on risk score
   */
  ERM.reports.getHeatmapCellColor = function(score) {
    if (score >= 15) return '#fecaca'; // Critical - red
    if (score >= 10) return '#fed7aa'; // High - orange
    if (score >= 5) return '#fef9c3';  // Medium - yellow
    return '#dcfce7';                   // Low - green
  };

  /**
   * Build AI-generated report HTML from data
   */
  ERM.reports.buildAIGeneratedReport = function (prompt, period, risks, controls) {
    var periodLabel = this.getPeriodLabel(period);
    var html = '';

    // Cover/Header
    html += '<h1 style="color: #0f172a; border-bottom: 3px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px;">✨ AI Generated Risk Report</h1>';
    html += '<div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px;">';
    html += '<p style="margin: 0; color: #64748b; font-size: 14px;"><strong>Period:</strong> ' + periodLabel + ' | <strong>Generated:</strong> ' + new Date().toLocaleDateString('en-GB') + '</p>';
    html += '<p style="margin: 8px 0 0 0; color: #64748b; font-size: 13px;"><strong>Prompt:</strong> ' + ERM.utils.escapeHtml(prompt) + '</p>';
    html += '</div>';

    // Executive Summary
    html += '<h2 style="color: #1e293b; margin-top: 32px;">Executive Summary</h2>';
    html += '<p style="line-height: 1.7; color: #475569;">This report provides an AI-generated analysis of the organization\'s risk profile based on the requested criteria. ';
    html += 'The analysis covers ' + risks.length + ' identified risks and ' + controls.length + ' controls currently in the risk register.</p>';

    // Risk Statistics
    var criticalCount = risks.filter(function(r) { return r.inherentRisk === 'critical'; }).length;
    var highCount = risks.filter(function(r) { return r.inherentRisk === 'high'; }).length;
    var mediumCount = risks.filter(function(r) { return r.inherentRisk === 'medium'; }).length;
    var lowCount = risks.filter(function(r) { return r.inherentRisk === 'low'; }).length;

    html += '<h2 style="color: #1e293b; margin-top: 32px;">Risk Overview</h2>';
    html += '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">';
    html += '<tr style="background: #f1f5f9;"><th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Metric</th><th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Count</th></tr>';
    html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;">Total Risks</td><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: 600;">' + risks.length + '</td></tr>';
    html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #dc2626;">●</span> Critical Risks</td><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #dc2626;">' + criticalCount + '</td></tr>';
    html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #f59e0b;">●</span> High Risks</td><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #f59e0b;">' + highCount + '</td></tr>';
    html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #eab308;">●</span> Medium Risks</td><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #eab308;">' + mediumCount + '</td></tr>';
    html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #22c55e;">●</span> Low Risks</td><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #22c55e;">' + lowCount + '</td></tr>';
    html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;">Total Controls</td><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: 600;">' + controls.length + '</td></tr>';
    html += '</table>';

    // Risk Register Table
    if (risks.length > 0) {
      html += '<h2 style="color: #1e293b; margin-top: 32px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Risk Register Details</h2>';

      // Use professional table builder if available
      if (ERM.ReportComponents && ERM.ReportComponents.buildProfessionalRiskTable) {
        html += ERM.ReportComponents.buildProfessionalRiskTable(risks, { maxRisks: 15 });
      } else {
        // Fallback table
        html += '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">';
        html += '<tr style="background: #f1f5f9;">';
        html += '<th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">Risk ID</th>';
        html += '<th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">Risk Title</th>';
        html += '<th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">Category</th>';
        html += '<th style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">Inherent</th>';
        html += '<th style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">Residual</th>';
        html += '<th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">Owner</th>';
        html += '</tr>';

        for (var i = 0; i < Math.min(risks.length, 15); i++) {
          var risk = risks[i];
          var inhScore = parseFloat(risk.inherentScore) || (parseFloat(risk.inherentLikelihood || 3) * parseFloat(risk.inherentImpact || 3));
          var resScore = parseFloat(risk.residualScore) || parseFloat(risk.residualRisk) || inhScore;
          var rowBg = i % 2 === 0 ? '#ffffff' : '#f8fafc';

          html += '<tr style="background: ' + rowBg + ';">';
          html += '<td style="padding: 10px; border: 1px solid #e2e8f0;">' + ERM.utils.escapeHtml(risk.reference || 'R' + (i + 1)) + '</td>';
          html += '<td style="padding: 10px; border: 1px solid #e2e8f0;">' + ERM.utils.escapeHtml(risk.title || 'Untitled') + '</td>';
          html += '<td style="padding: 10px; border: 1px solid #e2e8f0;">' + ERM.utils.escapeHtml(risk.category || 'N/A') + '</td>';
          html += '<td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">' + inhScore.toFixed(1) + '</td>';
          html += '<td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">' + resScore.toFixed(1) + '</td>';
          html += '<td style="padding: 10px; border: 1px solid #e2e8f0;">' + ERM.utils.escapeHtml(risk.owner || 'Unassigned') + '</td>';
          html += '</tr>';
        }
        html += '</table>';

        if (risks.length > 15) {
          html += '<p style="color: #64748b; font-size: 12px; font-style: italic;">Showing 15 of ' + risks.length + ' risks.</p>';
        }
      }
    }

    // Control Effectiveness
    if (controls.length > 0) {
      html += '<h2 style="color: #1e293b; margin-top: 32px;">Control Effectiveness Summary</h2>';
      var effective = controls.filter(function(c) { return c.effectiveness === 'effective'; }).length;
      var partial = controls.filter(function(c) { return c.effectiveness === 'partiallyEffective'; }).length;
      var ineffective = controls.filter(function(c) { return c.effectiveness === 'ineffective'; }).length;
      var notTested = controls.filter(function(c) { return c.effectiveness === 'notTested' || !c.effectiveness; }).length;

      html += '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">';
      html += '<tr style="background: #f1f5f9;"><th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Effectiveness</th><th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Count</th><th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Percentage</th></tr>';
      html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #22c55e;">●</span> Effective</td><td style="padding: 12px; border: 1px solid #e2e8f0;">' + effective + '</td><td style="padding: 12px; border: 1px solid #e2e8f0;">' + Math.round((effective / controls.length) * 100) + '%</td></tr>';
      html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #f59e0b;">●</span> Partially Effective</td><td style="padding: 12px; border: 1px solid #e2e8f0;">' + partial + '</td><td style="padding: 12px; border: 1px solid #e2e8f0;">' + Math.round((partial / controls.length) * 100) + '%</td></tr>';
      html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #dc2626;">●</span> Ineffective</td><td style="padding: 12px; border: 1px solid #e2e8f0;">' + ineffective + '</td><td style="padding: 12px; border: 1px solid #e2e8f0;">' + Math.round((ineffective / controls.length) * 100) + '%</td></tr>';
      html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #94a3b8;">●</span> Not Tested</td><td style="padding: 12px; border: 1px solid #e2e8f0;">' + notTested + '</td><td style="padding: 12px; border: 1px solid #e2e8f0;">' + Math.round((notTested / controls.length) * 100) + '%</td></tr>';
      html += '</table>';
    }

    // Footer
    html += '<hr style="margin-top: 40px; border: none; border-top: 1px solid #e2e8f0;">';
    html += '<p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 16px;">';
    html += 'Generated by Dimeri ERM | ' + new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    html += '</p>';

    return html;
  };

  /**
   * Get color for risk level
   */
  ERM.reports.getRiskColor = function (level) {
    var colors = {
      'critical': '#dc2626',
      'high': '#f59e0b',
      'medium': '#eab308',
      'low': '#22c55e'
    };
    return colors[level] || '#94a3b8';
  };

  /**
   * Open report preview in new window
   */
  ERM.reports.openReportPreview = function (htmlContent, title) {
    var printWindow = window.open('', '_blank');
    printWindow.document.write('<!DOCTYPE html><html><head>');
    printWindow.document.write('<title>' + ERM.utils.escapeHtml(title) + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: "Segoe UI", Arial, sans-serif; margin: 40px; color: #1a1a2e; line-height: 1.6; max-width: 900px; margin: 40px auto; }');
    printWindow.document.write('@media print { body { margin: 20px; } }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(htmlContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
  };

  /**
   * Show the comprehensive Report Builder wizard
   */
  ERM.reports.showManualReportOptions = function () {
    // Use the new comprehensive Report Builder
    if (ERM.ReportBuilder && typeof ERM.ReportBuilder.open === 'function') {
      ERM.ReportBuilder.open();
    } else {
      console.error('[Reports] ReportBuilder not available');
      ERM.toast.show({ type: 'error', message: 'Report Builder is not available' });
    }
  };

  /**
   * Generate report from AI-assisted builder
   */
  ERM.reports.generateAssistedReport = function () {
    var reportType = document.getElementById('assisted-report-type').value;
    var reportTitle = document.getElementById('assisted-report-title').value.trim();
    var period = document.getElementById('assisted-report-period').value;
    var audience = document.getElementById('assisted-report-audience').value;

    // Get selected sections
    var sections = {
      exec: document.getElementById('section-exec').checked,
      overview: document.getElementById('section-overview').checked,
      register: document.getElementById('section-register').checked,
      heatmap: document.getElementById('section-heatmap').checked,
      controls: document.getElementById('section-controls').checked,
      trends: document.getElementById('section-trends').checked,
      recommendations: document.getElementById('section-recommendations').checked
    };

    // Default title if empty
    if (!reportTitle) {
      var typeLabels = {
        'executive': 'Executive Risk Summary',
        'board': 'Board Risk Report',
        'quarterly': 'Quarterly Risk Review',
        'control': 'Control Effectiveness Report',
        'compliance': 'Compliance Status Report',
        'custom': 'Custom Risk Report'
      };
      reportTitle = typeLabels[reportType] + ' - ' + this.getPeriodLabel(period);
    }

    ERM.toast.show({ type: 'info', message: 'Building report with AI...' });

    // Get data
    var risks = ERM.storage.get('risks') || [];
    var controls = ERM.storage.get('controls') || [];

    // Generate report
    var reportHtml = this.buildAssistedReport(reportTitle, reportType, period, audience, sections, risks, controls);

    // Create report record
    var report = {
      id: ERM.utils.generateId(),
      templateId: null,
      name: reportTitle,
      icon: '✨',
      generatedDate: new Date().toISOString(),
      author: ERM.state.user ? ERM.state.user.name : 'System',
      format: 'PDF',
      pageCount: 8,
      distribution: null,
      period: period,
      aiGenerated: true,
      reportType: reportType
    };

    // Save
    state.recentReports.unshift(report);
    if (state.recentReports.length > 50) {
      state.recentReports = state.recentReports.slice(0, 50);
    }
    this.saveRecentReports();

    if (ERM.activityLogger) {
      ERM.activityLogger.log('report', 'created', 'report', report.name, { aiGenerated: true });
    }

    ERM.components.closeModal();
    this.render();

    setTimeout(function () {
      ERM.reports.openReportPreview(reportHtml, report.name);
    }, 300);

    ERM.toast.show({ type: 'success', message: 'Report generated successfully!' });
  };

  /**
   * Build report from assisted builder selections
   */
  ERM.reports.buildAssistedReport = function (title, reportType, period, audience, sections, risks, controls) {
    var periodLabel = this.getPeriodLabel(period);
    var audienceLabels = {
      'board': 'Board of Directors',
      'executive': 'Executive Committee',
      'management': 'Senior Management',
      'operational': 'Operational Teams',
      'external': 'External Stakeholders'
    };

    var html = '';

    // Header
    html += '<h1 style="color: #0f172a; border-bottom: 3px solid #7c3aed; padding-bottom: 16px; margin-bottom: 8px;">' + ERM.utils.escapeHtml(title) + '</h1>';
    html += '<div style="margin-bottom: 32px;">';
    html += '  <p style="margin: 0; color: #64748b; font-size: 14px;"><strong>Period:</strong> ' + periodLabel + ' | <strong>Audience:</strong> ' + (audienceLabels[audience] || audience) + '</p>';
    html += '  <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;"><strong>Generated:</strong> ' + new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) + '</p>';
    html += '</div>';

    // Statistics
    var criticalCount = risks.filter(function(r) { return r.inherentRisk === 'critical'; }).length;
    var highCount = risks.filter(function(r) { return r.inherentRisk === 'high'; }).length;
    var mediumCount = risks.filter(function(r) { return r.inherentRisk === 'medium'; }).length;
    var lowCount = risks.filter(function(r) { return r.inherentRisk === 'low'; }).length;

    // Executive Summary
    if (sections.exec) {
      html += '<h2 style="color: #1e293b; margin-top: 32px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Executive Summary</h2>';
      html += '<div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 16px 0;">';
      html += '<p style="line-height: 1.8; color: #475569; margin: 0;">This report provides a comprehensive analysis of the organization\'s risk profile for ' + periodLabel + '. ';
      html += 'The current risk register contains <strong>' + risks.length + '</strong> identified risks and <strong>' + controls.length + '</strong> controls. ';
      if (criticalCount > 0) {
        html += '<span style="color: #dc2626; font-weight: 600;">' + criticalCount + ' critical risk(s)</span> require immediate executive attention. ';
      }
      if (highCount > 0) {
        html += '<span style="color: #f59e0b; font-weight: 600;">' + highCount + ' high-priority risk(s)</span> are being actively monitored.';
      }
      html += '</p></div>';
    }

    // Risk Overview
    if (sections.overview) {
      html += '<h2 style="color: #1e293b; margin-top: 32px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Risk Overview</h2>';
      html += '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">';
      html += '<tr style="background: #1e293b; color: white;"><th style="padding: 12px; text-align: left;">Risk Level</th><th style="padding: 12px; text-align: center;">Count</th><th style="padding: 12px; text-align: center;">% of Total</th></tr>';
      html += '<tr style="background: #fef2f2;"><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #dc2626;">●</span> Critical</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">' + criticalCount + '</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">' + (risks.length > 0 ? Math.round((criticalCount/risks.length)*100) : 0) + '%</td></tr>';
      html += '<tr style="background: #fffbeb;"><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #f59e0b;">●</span> High</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">' + highCount + '</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">' + (risks.length > 0 ? Math.round((highCount/risks.length)*100) : 0) + '%</td></tr>';
      html += '<tr style="background: #fefce8;"><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #eab308;">●</span> Medium</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">' + mediumCount + '</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">' + (risks.length > 0 ? Math.round((mediumCount/risks.length)*100) : 0) + '%</td></tr>';
      html += '<tr style="background: #f0fdf4;"><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #22c55e;">●</span> Low</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">' + lowCount + '</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">' + (risks.length > 0 ? Math.round((lowCount/risks.length)*100) : 0) + '%</td></tr>';
      html += '<tr style="background: #f8fafc;"><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: 600;">Total Risks</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">' + risks.length + '</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">100%</td></tr>';
      html += '</table>';
    }

    // Risk Register Details
    if (sections.register && risks.length > 0) {
      html += '<h2 style="color: #1e293b; margin-top: 32px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Risk Register Details</h2>';
      html += '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px;">';
      html += '<tr style="background: #1e293b; color: white;">';
      html += '<th style="padding: 10px;">Ref</th><th style="padding: 10px;">Risk Title</th><th style="padding: 10px;">Category</th><th style="padding: 10px; text-align: center;">Inherent</th><th style="padding: 10px; text-align: center;">Residual</th><th style="padding: 10px;">Owner</th>';
      html += '</tr>';

      for (var i = 0; i < Math.min(risks.length, 15); i++) {
        var risk = risks[i];
        var rowBg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
        html += '<tr style="background: ' + rowBg + ';">';
        html += '<td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">' + (risk.reference || 'R' + (i+1)) + '</td>';
        html += '<td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">' + ERM.utils.escapeHtml(risk.title || 'Untitled') + '</td>';
        html += '<td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">' + (risk.category || 'N/A') + '</td>';
        html += '<td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: ' + this.getRiskColor(risk.inherentRisk) + '; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600;">' + (risk.inherentRisk || 'N/A').toUpperCase() + '</span></td>';
        html += '<td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: ' + this.getRiskColor(risk.residualRisk || risk.inherentRisk) + '; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600;">' + (risk.residualRisk || risk.inherentRisk || 'N/A').toUpperCase() + '</span></td>';
        html += '<td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">' + (risk.owner || 'Unassigned') + '</td>';
        html += '</tr>';
      }
      html += '</table>';
      if (risks.length > 15) {
        html += '<p style="color: #64748b; font-size: 11px; font-style: italic;">Showing 15 of ' + risks.length + ' risks</p>';
      }
    }

    // Control Effectiveness
    if (sections.controls && controls.length > 0) {
      html += '<h2 style="color: #1e293b; margin-top: 32px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Control Effectiveness</h2>';
      var effective = controls.filter(function(c) { return c.effectiveness === 'effective'; }).length;
      var partial = controls.filter(function(c) { return c.effectiveness === 'partiallyEffective'; }).length;
      var ineffective = controls.filter(function(c) { return c.effectiveness === 'ineffective'; }).length;
      var notTested = controls.length - effective - partial - ineffective;

      html += '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">';
      html += '<tr style="background: #1e293b; color: white;"><th style="padding: 12px; text-align: left;">Status</th><th style="padding: 12px; text-align: center;">Count</th><th style="padding: 12px; text-align: center;">Percentage</th></tr>';
      html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #22c55e;">●</span> Effective</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">' + effective + '</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">' + Math.round((effective/controls.length)*100) + '%</td></tr>';
      html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #f59e0b;">●</span> Partially Effective</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">' + partial + '</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">' + Math.round((partial/controls.length)*100) + '%</td></tr>';
      html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #dc2626;">●</span> Ineffective</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">' + ineffective + '</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">' + Math.round((ineffective/controls.length)*100) + '%</td></tr>';
      html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: #94a3b8;">●</span> Not Tested</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">' + notTested + '</td><td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">' + Math.round((notTested/controls.length)*100) + '%</td></tr>';
      html += '</table>';
    }

    // AI Recommendations
    if (sections.recommendations) {
      html += '<h2 style="color: #1e293b; margin-top: 32px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">AI Recommendations</h2>';
      html += '<div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 20px; margin: 16px 0;">';
      html += '<p style="margin: 0 0 16px 0; font-weight: 600; color: #6d28d9;">Based on the current risk profile, the following actions are recommended:</p>';
      html += '<ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">';
      if (criticalCount > 0) {
        html += '<li>Immediate attention required for <strong>' + criticalCount + ' critical risk(s)</strong> - schedule emergency review meeting</li>';
      }
      if (ineffective > 0) {
        html += '<li>Review and strengthen <strong>' + ineffective + ' ineffective control(s)</strong> to improve risk mitigation</li>';
      }
      if (notTested > 2) {
        html += '<li>Prioritize testing for <strong>' + notTested + ' untested controls</strong> to validate effectiveness</li>';
      }
      html += '<li>Continue monitoring high-risk items and update mitigation strategies as needed</li>';
      html += '<li>Schedule quarterly risk review with relevant stakeholders</li>';
      html += '</ul></div>';
    }

    // Footer
    html += '<hr style="margin-top: 40px; border: none; border-top: 1px solid #e2e8f0;">';
    html += '<p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 16px;">';
    html += '✨ Generated with AI by Dimeri ERM | ' + new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    html += '</p>';

    return html;
  };

  // ========================================
  // TEMPLATE CRUD
  // ========================================

  ERM.reports.showCreateTemplateModal = function () {
    state.currentTemplate = null;
    this.showTemplateForm(null);
  };

  ERM.reports.editTemplate = function (templateId) {
    var template = this.getTemplateById(templateId);
    if (!template) {
      ERM.toast.show({ type: 'error', message: 'Template not found' });
      return;
    }
    state.currentTemplate = template;
    this.showTemplateForm(template);
  };

  ERM.reports.showTemplateForm = function (template) {
    var isEdit = template !== null;
    var title = isEdit ? 'Edit Report Template' : 'Create Report Template';

    var content = '';
    content += '<form id="template-form" class="modal-form">';

    content += '  <div class="form-row">';
    content += '    <div class="form-group" style="flex: 0 0 80px;">';
    content += '      <label class="form-label">Icon</label>';
    content += '      <input type="text" class="form-input" id="template-icon" value="' + (template ? template.icon : '📊') + '" style="text-align: center; font-size: 24px;" maxlength="2">';
    content += '    </div>';
    content += '    <div class="form-group" style="flex: 1;">';
    content += '      <label class="form-label">Template Name *</label>';
    content += '      <input type="text" class="form-input" id="template-name" value="' + (template ? ERM.utils.escapeHtml(template.name) : '') + '" placeholder="e.g., Board Risk Committee Report" required>';
    content += '    </div>';
    content += '  </div>';

    content += '  <div class="form-group">';
    content += '    <label class="form-label">Description</label>';
    content += '    <textarea class="form-input" id="template-description" rows="2" placeholder="Brief description of this report template">' + (template ? ERM.utils.escapeHtml(template.description) : '') + '</textarea>';
    content += '  </div>';

    content += '  <div class="form-row">';
    content += '    <div class="form-group">';
    content += '      <label class="form-label">Frequency</label>';
    content += '      <select class="form-select" id="template-frequency">';
    content += '        <option value="Weekly"' + (template && template.frequency === 'Weekly' ? ' selected' : '') + '>Weekly</option>';
    content += '        <option value="Monthly"' + (template && template.frequency === 'Monthly' ? ' selected' : '') + '>Monthly</option>';
    content += '        <option value="Quarterly"' + (!template || template.frequency === 'Quarterly' ? ' selected' : '') + '>Quarterly</option>';
    content += '        <option value="Annually"' + (template && template.frequency === 'Annually' ? ' selected' : '') + '>Annually</option>';
    content += '        <option value="Ad-hoc"' + (template && template.frequency === 'Ad-hoc' ? ' selected' : '') + '>Ad-hoc</option>';
    content += '      </select>';
    content += '    </div>';
    content += '    <div class="form-group">';
    content += '      <label class="form-label">Target Audience</label>';
    content += '      <input type="text" class="form-input" id="template-audience" value="' + (template ? ERM.utils.escapeHtml(template.audience) : '') + '" placeholder="e.g., Board Members, Exco">';
    content += '    </div>';
    content += '    <div class="form-group">';
    content += '      <label class="form-label">Page Range</label>';
    content += '      <input type="text" class="form-input" id="template-pagerange" value="' + (template ? ERM.utils.escapeHtml(template.pageRange) : '') + '" placeholder="e.g., 10-15 pages">';
    content += '    </div>';
    content += '  </div>';

    content += '  <div class="form-group">';
    content += '    <label class="form-label">Report Sections (comma-separated)</label>';
    content += '    <input type="text" class="form-input" id="template-sections" value="' + (template ? template.sections.join(', ') : '') + '" placeholder="e.g., Executive Summary, Risk Overview, KRIs">';
    content += '  </div>';

    content += '  <div class="form-group">';
    content += '    <label class="form-label">Accent Color</label>';
    content += '    <input type="color" class="form-input" id="template-color" value="' + (template ? template.accentColor : '#3b82f6') + '" style="width: 60px; height: 36px; padding: 2px;">';
    content += '  </div>';

    content += '</form>';

    ERM.components.showModal({
      title: title,
      content: content,
      size: 'md',
      buttons: [
        { label: 'Cancel', type: 'secondary', action: 'close' },
        { label: isEdit ? 'Save Changes' : 'Create Template', type: 'primary', action: 'save' }
      ],
      onAction: function(action) {
        if (action === 'save') {
          ERM.reports.saveTemplate();
        }
      }
    });
  };

  ERM.reports.saveTemplate = function () {
    var name = document.getElementById('template-name').value.trim();
    if (!name) {
      ERM.toast.show({ type: 'error', message: 'Please enter a template name' });
      return;
    }

    var sectionsInput = document.getElementById('template-sections').value;
    var sections = sectionsInput.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });

    var templateData = {
      icon: document.getElementById('template-icon').value || '📊',
      name: name,
      description: document.getElementById('template-description').value.trim(),
      frequency: document.getElementById('template-frequency').value,
      audience: document.getElementById('template-audience').value.trim() || 'All',
      pageRange: document.getElementById('template-pagerange').value.trim() || '—',
      sections: sections.length > 0 ? sections : ['Report Content'],
      accentColor: document.getElementById('template-color').value,
      isDefault: false
    };

    if (state.currentTemplate) {
      // Update existing
      templateData.id = state.currentTemplate.id;
      for (var i = 0; i < state.templates.length; i++) {
        if (state.templates[i].id === templateData.id) {
          state.templates[i] = templateData;
          break;
        }
      }
      ERM.toast.show({ type: 'success', message: 'Template updated' });
    } else {
      // Create new
      templateData.id = ERM.utils.generateId();
      state.templates.push(templateData);
      ERM.toast.show({ type: 'success', message: 'Template created' });
    }

    this.saveTemplates();
    ERM.components.closeModal();
    this.render();
  };

  /**
   * Show starter templates modal (for when AI is unavailable)
   */
  ERM.reports.showStarterTemplates = function () {
    var content = '';
    content += '<div class="starter-templates-info">';
    content += '  <p style="color: #64748b; margin-bottom: 20px;">Select pre-built templates to add to your workspace. These templates can be customized after import.</p>';
    content += '</div>';
    content += '<div class="starter-templates-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">';

    for (var i = 0; i < starterTemplates.length; i++) {
      var t = starterTemplates[i];
      content += '<div class="starter-template-card" data-template-id="' + t.id + '" style="border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; background: #fff;">';
      content += '  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">';
      content += '    <span style="font-size: 28px;">' + t.icon + '</span>';
      content += '    <div>';
      content += '      <h4 style="margin: 0; font-weight: 600; color: #0f172a;">' + ERM.utils.escapeHtml(t.name) + '</h4>';
      content += '      <span style="font-size: 12px; color: ' + t.accentColor + ';">' + t.frequency + ' • ' + t.audience + '</span>';
      content += '    </div>';
      content += '  </div>';
      content += '  <p style="font-size: 13px; color: #64748b; margin: 0 0 12px 0;">' + ERM.utils.escapeHtml(t.description) + '</p>';
      content += '  <div style="display: flex; flex-wrap: wrap; gap: 6px;">';
      for (var j = 0; j < t.sections.length; j++) {
        content += '<span style="font-size: 11px; background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px;">' + ERM.utils.escapeHtml(t.sections[j]) + '</span>';
      }
      content += '  </div>';
      content += '  <div class="template-check" style="position: absolute; top: 12px; right: 12px; width: 24px; height: 24px; border: 2px solid #d1d5db; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: #fff;"></div>';
      content += '</div>';
    }

    content += '</div>';

    ERM.components.showModal({
      title: '📁 Starter Templates',
      content: content,
      size: 'lg',
      buttons: [
        { label: 'Cancel', type: 'secondary', action: 'close' },
        { label: 'Import Selected', type: 'primary', action: 'import' }
      ],
      onAction: function(action) {
        if (action === 'import') {
          ERM.reports.importStarterTemplates();
        }
      }
    });

    // Bind click events to starter template cards
    setTimeout(function() {
      var cards = document.querySelectorAll('.starter-template-card');
      for (var c = 0; c < cards.length; c++) {
        cards[c].style.position = 'relative';
        cards[c].addEventListener('click', function() {
          var isSelected = this.classList.contains('selected');
          if (isSelected) {
            this.classList.remove('selected');
            this.style.borderColor = '#e2e8f0';
            this.querySelector('.template-check').innerHTML = '';
            this.querySelector('.template-check').style.borderColor = '#d1d5db';
            this.querySelector('.template-check').style.background = '#fff';
          } else {
            this.classList.add('selected');
            this.style.borderColor = '#c41e3a';
            this.querySelector('.template-check').innerHTML = '✓';
            this.querySelector('.template-check').style.borderColor = '#c41e3a';
            this.querySelector('.template-check').style.background = '#c41e3a';
            this.querySelector('.template-check').style.color = '#fff';
          }
        });
      }
    }, 100);
  };

  /**
   * Import selected starter templates
   */
  ERM.reports.importStarterTemplates = function () {
    var selectedCards = document.querySelectorAll('.starter-template-card.selected');
    if (selectedCards.length === 0) {
      ERM.toast.show({ type: 'error', message: 'Please select at least one template' });
      return;
    }

    var imported = 0;
    for (var i = 0; i < selectedCards.length; i++) {
      var templateId = selectedCards[i].getAttribute('data-template-id');
      // Find the starter template
      for (var j = 0; j < starterTemplates.length; j++) {
        if (starterTemplates[j].id === templateId) {
          // Create a copy with new ID
          var newTemplate = JSON.parse(JSON.stringify(starterTemplates[j]));
          newTemplate.id = ERM.utils.generateId();
          newTemplate.isDefault = true;
          state.templates.push(newTemplate);
          imported++;
          break;
        }
      }
    }

    this.saveTemplates();
    ERM.components.closeModal();
    this.render();

    ERM.toast.show({ type: 'success', message: imported + ' template(s) imported successfully' });
  };

  ERM.reports.deleteTemplate = function (templateId) {
    var template = this.getTemplateById(templateId);
    if (!template) return;

    var content =
      '<div class="confirm-delete" style="text-align: center; padding: 16px;">' +
      '  <div class="confirm-icon danger" style="width: 56px; height: 56px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">' +
      '    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
      '  </div>' +
      '  <h3 style="margin: 0 0 8px; font-size: 18px; color: #0f172a;">Delete Template?</h3>' +
      '  <p style="margin: 0 0 8px; color: #64748b;">Are you sure you want to delete</p>' +
      '  <p style="margin: 0; font-weight: 600; color: #0f172a;">"' + ERM.utils.escapeHtml(template.name) + '"</p>' +
      '  <p style="margin: 16px 0 0; font-size: 13px; color: #94a3b8;">This action cannot be undone.</p>' +
      '</div>';

    ERM.components.showModal({
      title: 'Delete Template',
      content: content,
      size: 'sm',
      buttons: [
        { label: 'Cancel', type: 'secondary', action: 'close' },
        { label: 'Delete', type: 'danger', action: 'delete' }
      ],
      onAction: function(action) {
        if (action === 'delete') {
          state.templates = state.templates.filter(function(t) { return t.id !== templateId; });
          ERM.reports.saveTemplates();
          ERM.components.closeModal();
          ERM.reports.render();
          ERM.toast.show({ type: 'success', message: 'Template deleted' });
        }
      }
    });
  };

  ERM.reports.getTemplateById = function (templateId) {
    for (var i = 0; i < state.templates.length; i++) {
      if (state.templates[i].id === templateId) {
        return state.templates[i];
      }
    }
    return null;
  };

  // ========================================
  // REPORT BUILDER / GENERATOR
  // ========================================

  ERM.reports.openReportBuilder = function (templateId) {
    var template = this.getTemplateById(templateId);
    if (!template) {
      ERM.toast.show({ type: 'error', message: 'Template not found' });
      return;
    }

    var content = '';
    content += '<div class="report-builder">';

    // Configuration Panel
    content += '  <div class="builder-config">';
    content += '    <div class="form-group">';
    content += '      <label class="form-label">Report Type</label>';
    content += '      <input type="text" class="form-input" value="' + ERM.utils.escapeHtml(template.name) + '" readonly style="background: #f8fafc;">';
    content += '    </div>';

    content += '    <div class="form-group">';
    content += '      <label class="form-label">Report Period</label>';
    content += '      <select class="form-select" id="report-period">';
    content += '        <option value="current">Current Quarter (Q4 2025)</option>';
    content += '        <option value="q3-2025">Q3 2025</option>';
    content += '        <option value="q2-2025">Q2 2025</option>';
    content += '        <option value="q1-2025">Q1 2025</option>';
    content += '        <option value="ytd">Year to Date</option>';
    content += '      </select>';
    content += '    </div>';

    content += '    <div class="form-group">';
    content += '      <label class="form-label">Include Sections</label>';
    content += '      <div class="checkbox-group">';
    for (var i = 0; i < template.sections.length; i++) {
      var sectionId = 'section-' + i;
      content += '        <label class="checkbox-item">';
      content += '          <input type="checkbox" id="' + sectionId + '" checked>';
      content += '          <span>' + ERM.utils.escapeHtml(template.sections[i]) + '</span>';
      content += '        </label>';
    }
    content += '      </div>';
    content += '    </div>';

    content += '    <div class="form-group">';
    content += '      <label class="form-label">Export Format</label>';
    content += '      <select class="form-select" id="export-format">';
    content += '        <option value="pdf">PDF Document</option>';
    content += '        <option value="docx" disabled>Word Document (Coming Soon)</option>';
    content += '      </select>';
    content += '    </div>';

    content += '    <div class="form-group">';
    content += '      <label class="form-label">Distribution List (Optional)</label>';
    content += '      <textarea class="form-input" id="distribution-list" rows="2" placeholder="Enter email addresses (comma-separated)"></textarea>';
    content += '    </div>';
    content += '  </div>';

    content += '</div>';

    var currentTemplateId = templateId;
    ERM.components.showModal({
      title: template.icon + ' Generate ' + template.name,
      content: content,
      size: 'lg',
      buttons: [
        { label: 'Cancel', type: 'secondary', action: 'close' },
        { label: '📄 Generate Report', type: 'primary', action: 'generate' }
      ],
      onAction: function(action) {
        if (action === 'generate') {
          ERM.reports.generateReport(currentTemplateId);
        }
      }
    });
  };

  ERM.reports.generateReport = function (templateId) {
    var template = this.getTemplateById(templateId);
    if (!template) return;

    var period = document.getElementById('report-period').value;
    var distribution = document.getElementById('distribution-list').value.trim();

    // Create report record
    var report = {
      id: ERM.utils.generateId(),
      templateId: templateId,
      name: template.name + ' - ' + this.getPeriodLabel(period),
      icon: template.icon,
      generatedDate: new Date().toISOString(),
      author: ERM.state.user ? ERM.state.user.name : 'System',
      format: 'PDF',
      pageCount: this.estimatePageCount(template),
      distribution: distribution || null,
      period: period
    };

    // Add to recent reports
    state.recentReports.unshift(report);

    // Keep only last 50 reports
    if (state.recentReports.length > 50) {
      state.recentReports = state.recentReports.slice(0, 50);
    }

    this.saveRecentReports();

    // Log activity
    if (ERM.activityLogger) {
      ERM.activityLogger.log('report', 'created', 'report', report.name, { templateId: templateId });
    }

    ERM.components.closeModal();
    this.render();

    // Show success and trigger download
    ERM.toast.show({ type: 'success', message: 'Report generated successfully!' });

    // Simulate PDF generation (in real app, this would generate actual PDF)
    setTimeout(function() {
      ERM.reports.downloadReport(report.id);
    }, 500);
  };

  ERM.reports.getPeriodLabel = function (period) {
    var labels = {
      'current': 'Q4 2025',
      'q3-2025': 'Q3 2025',
      'q2-2025': 'Q2 2025',
      'q1-2025': 'Q1 2025',
      'ytd': 'YTD 2025'
    };
    return labels[period] || period;
  };

  ERM.reports.estimatePageCount = function (template) {
    var range = template.pageRange || '10-15 pages';
    var match = range.match(/(\d+)/);
    return match ? parseInt(match[1]) : 10;
  };

  // ========================================
  // RECENT REPORTS CRUD
  // ========================================

  ERM.reports.downloadReport = function (reportId) {
    var report = this.getRecentReportById(reportId);
    if (!report) return;

    // Generate HTML content for the report
    var htmlContent = this.generateReportHTML(report);

    // Open in new window for printing/PDF
    var printWindow = window.open('', '_blank');
    printWindow.document.write('<!DOCTYPE html><html><head>');
    printWindow.document.write('<title>' + ERM.utils.escapeHtml(report.name) + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: "Segoe UI", Arial, sans-serif; margin: 40px; color: #1a1a2e; }');
    printWindow.document.write('h1 { color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }');
    printWindow.document.write('h2 { color: #334155; margin-top: 30px; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin: 20px 0; }');
    printWindow.document.write('th, td { padding: 12px; border: 1px solid #e2e8f0; text-align: left; }');
    printWindow.document.write('th { background: #f1f5f9; font-weight: 600; }');
    printWindow.document.write('.meta { color: #64748b; font-size: 14px; margin-bottom: 30px; }');
    printWindow.document.write('.badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }');
    printWindow.document.write('.badge-critical { background: #fee2e2; color: #dc2626; }');
    printWindow.document.write('.badge-high { background: #fef3c7; color: #d97706; }');
    printWindow.document.write('.badge-medium { background: #fef9c3; color: #ca8a04; }');
    printWindow.document.write('.badge-low { background: #dcfce7; color: #16a34a; }');
    printWindow.document.write('@media print { body { margin: 20px; } }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(htmlContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Trigger print after content loads
    setTimeout(function() {
      printWindow.print();
    }, 500);

    // Log activity for export
    if (ERM.activityLogger) {
      ERM.activityLogger.log('report', 'exported', 'report', report.name, {
        reportId: reportId,
        format: 'PDF'
      });
    }
  };

  /**
   * Export report as PDF - direct download
   */
  ERM.reports.exportAsPDF = function(reportId) {
    var report = this.getRecentReportById(reportId);
    if (!report) {
      ERM.toast.show({ type: 'error', message: 'Report not found' });
      return;
    }

    // Generate HTML content for the report
    var htmlContent = this.generateReportHTML(report);

    // Create a hidden iframe for printing to PDF
    var iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    var doc = iframe.contentWindow.document;
    doc.open();
    doc.write('<!DOCTYPE html><html><head>');
    doc.write('<title>' + ERM.utils.escapeHtml(report.name) + '</title>');
    doc.write('<style>');
    doc.write('body { font-family: "Segoe UI", Arial, sans-serif; margin: 40px; color: #1a1a2e; }');
    doc.write('h1 { color: #0f172a; border-bottom: 2px solid #c41e3a; padding-bottom: 10px; }');
    doc.write('h2 { color: #334155; margin-top: 30px; }');
    doc.write('table { width: 100%; border-collapse: collapse; margin: 20px 0; }');
    doc.write('th, td { padding: 12px; border: 1px solid #e2e8f0; text-align: left; }');
    doc.write('th { background: #f1f5f9; font-weight: 600; }');
    doc.write('.meta { color: #64748b; font-size: 14px; margin-bottom: 30px; }');
    doc.write('.badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }');
    doc.write('.badge-critical { background: #fee2e2; color: #dc2626; }');
    doc.write('.badge-high { background: #fef3c7; color: #d97706; }');
    doc.write('.badge-medium { background: #fef9c3; color: #ca8a04; }');
    doc.write('.badge-low { background: #dcfce7; color: #16a34a; }');
    doc.write('@media print { body { margin: 20px; } @page { margin: 1cm; } }');
    doc.write('</style>');
    doc.write('</head><body>');
    doc.write(htmlContent);
    doc.write('</body></html>');
    doc.close();

    // Wait for content to load, then print
    iframe.onload = function() {
      setTimeout(function() {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        // Remove iframe after print dialog closes
        setTimeout(function() {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    };

    ERM.toast.show({ type: 'success', message: 'Preparing PDF download...' });

    // Log activity
    if (ERM.activityLogger) {
      ERM.activityLogger.log('report', 'exported', 'report', report.name, {
        reportId: reportId,
        format: 'PDF'
      });
    }
  };

  /* ========================================
     PDF EXPORT MODAL - Like Risk Register
     ======================================== */

  /**
   * Show PDF export - routes to correct exporter based on report format
   */
  ERM.reports.showExportPDFModal = function(reportId) {
    var self = this;
    var report = this.getRecentReportById(reportId);
    if (!report) {
      ERM.toast.show({ type: 'error', message: 'Report not found' });
      return;
    }

    // Check if this is a V2 report - if so, open editor and trigger export
    if (report.format === 'v2') {
      console.log('[Reports] Detected V2 report, opening editor for export');

      // Check if editor is already open with this report
      if (document.querySelector('.report-editor-v2-container') &&
          window.ERM && ERM.reportEditorV2 && ERM.reportEditorV2.getState) {
        var editorState = ERM.reportEditorV2.getState();
        if (editorState && editorState.currentReport && editorState.currentReport.id === reportId) {
          // Editor already open with this report - just trigger export
          console.log('[Reports] Editor already open, triggering export');
          if (ERM.reportEditorV2.exportToPDF) {
            ERM.reportEditorV2.exportToPDF();
          }
          return;
        }
      }

      // Otherwise, open the editor first
      this.editReport(reportId);

      // Wait for editor to fully render, then trigger export
      setTimeout(function() {
        if (window.ERM && ERM.reportEditorV2 && ERM.reportEditorV2.exportToPDF) {
          console.log('[Reports] Editor loaded, triggering export');
          ERM.reportEditorV2.exportToPDF();
        }
      }, 800);
      return;
    }

    // Otherwise use legacy export for old reports
    console.log('[Reports] Using legacy export for old format report');

    // Use default export settings
    var exportSettings = {
      title: report.name,
      isLandscape: false,
      includePageNums: true,
      logoPos: 'top-left',
      includeExecSummary: true,
      includeRiskOverview: true,
      includeHeatmaps: true,
      includeCharts: true,
      includeRiskTable: true,
      includeRecommendations: false
    };

    // Go directly to progress animation
    self.showExportProgressModal(report, exportSettings);
  };

  /**
   * Show animated export progress modal
   */
  ERM.reports.showExportProgressModal = function(report, settings) {
    var self = this;

    var progressContent = '';
    progressContent += '<div class="export-progress-container">';
    progressContent += '  <div class="export-progress-content" id="export-progress-content">';
    progressContent += '    <div class="export-icon-wrapper" id="export-icon-wrapper">';
    progressContent += '      <div class="export-icon-circle" id="export-icon-circle">';
    // Database/data icon (initial)
    progressContent += '        <svg id="export-stage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">';
    progressContent += '          <ellipse cx="12" cy="5" rx="9" ry="3"/>';
    progressContent += '          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>';
    progressContent += '          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>';
    progressContent += '        </svg>';
    progressContent += '      </div>';
    progressContent += '    </div>';
    progressContent += '    <h3 class="export-progress-title" id="export-progress-title">Generating Report...</h3>';
    progressContent += '    <div class="export-progress-bar-container">';
    progressContent += '      <div class="export-progress-bar">';
    progressContent += '        <div class="export-progress-fill" id="pdf-export-progress-fill"></div>';
    progressContent += '      </div>';
    progressContent += '    </div>';
    progressContent += '    <p class="export-progress-status" id="pdf-export-status">Compiling risk data...</p>';
    progressContent += '  </div>';
    progressContent += '</div>';

    ERM.components.showModal({
      title: 'Exporting PDF',
      content: progressContent,
      size: 'small',
      buttons: [],
      closeOnBackdrop: false,
      showCloseButton: false
    });

    // Animate progress
    self.animateExportProgress(report, settings);
  };

  /**
   * Animate export progress stages with dynamic icons
   */
  ERM.reports.animateExportProgress = function(report, settings) {
    var self = this;
    var progressFill = document.getElementById('pdf-export-progress-fill');
    var statusText = document.getElementById('pdf-export-status');
    var iconCircle = document.getElementById('export-icon-circle');
    var iconWrapper = document.getElementById('export-icon-wrapper');
    var titleEl = document.getElementById('export-progress-title');

    // Icons for each stage
    var icons = {
      data: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
      chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
      document: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
      download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="32" height="32"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    };

    var stages = [
      { progress: 20, text: 'Compiling risk data...', icon: 'data' },
      { progress: 45, text: 'Generating charts...', icon: 'chart' },
      { progress: 70, text: 'Formatting document...', icon: 'document' },
      { progress: 90, text: 'Preparing download...', icon: 'download' },
      { progress: 100, text: 'Finalizing...', icon: 'download' }
    ];

    var stageIndex = 0;

    function updateIcon(iconKey) {
      if (iconCircle && icons[iconKey]) {
        iconCircle.innerHTML = icons[iconKey];
        // Add a subtle pulse animation on icon change
        iconCircle.style.transform = 'scale(1.1)';
        setTimeout(function() {
          iconCircle.style.transform = 'scale(1)';
        }, 150);
      }
    }

    function nextStage() {
      if (stageIndex < stages.length) {
        var stage = stages[stageIndex];
        if (progressFill) progressFill.style.width = stage.progress + '%';
        if (statusText) statusText.textContent = stage.text;
        updateIcon(stage.icon);
        stageIndex++;

        if (stageIndex < stages.length) {
          setTimeout(nextStage, 600);
        } else {
          // Show completion state
          setTimeout(function() {
            // Transform to success state
            updateIcon('success');
            if (iconCircle) iconCircle.classList.add('success');
            if (iconWrapper) iconWrapper.classList.add('success');
            if (titleEl) {
              titleEl.textContent = 'Report Ready!';
              titleEl.classList.add('success');
            }
            if (statusText) statusText.textContent = 'Your PDF is ready for download';

            // Actually generate and download PDF after showing success
            setTimeout(function() {
              ERM.components.closeModal();
              self.performPDFExport(report, settings);
            }, 1200);
          }, 400);
        }
      }
    }

    // Start animation after a short delay
    setTimeout(nextStage, 300);
  };

  /**
   * Perform the actual PDF export
   */
  ERM.reports.performPDFExport = function(report, settings) {
    var self = this;

    // Generate HTML content with settings
    var htmlContent = this.generateReportHTMLWithSettings(report, {
      title: settings.title,
      logoData: this._reportLogoData,
      logoPosition: settings.logoPos,
      includeExecSummary: settings.includeExecSummary,
      includeRiskOverview: settings.includeRiskOverview,
      includeHeatmaps: settings.includeHeatmaps,
      includeCharts: settings.includeCharts,
      includeRiskTable: settings.includeRiskTable,
      includeRecommendations: settings.includeRecommendations
    });

    // Build complete HTML document with comprehensive styles that match the preview
    var styles = this.getPDFStyles();

    var fullHTML = '<style>' + styles + '</style>' + htmlContent;

    // Generate filename
    var filename = (settings.title || report.name || 'Report').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    filename += '_' + new Date().toISOString().split('T')[0] + '.pdf';

    // Use PDFEngine for actual PDF generation and download
    if (ERM.PDFEngine && ERM.PDFEngine.generate) {
      var pdfOptions = {
        filename: filename,
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: settings.isLandscape ? 'landscape' : 'portrait',
          compress: true
        }
      };

      ERM.PDFEngine.generate(fullHTML, pdfOptions, function(err) {
        if (err) {
          console.error('[Reports] PDF generation error:', err);
          ERM.toast.show({ type: 'error', message: 'Error generating PDF. Please try again.' });
        } else {
          ERM.toast.show({ type: 'success', message: 'PDF downloaded successfully!' });

          // Log activity
          if (ERM.activityLogger) {
            ERM.activityLogger.log('report', 'exported', 'report', report.name, {
              reportId: report.id,
              format: 'PDF',
              settings: { landscape: settings.isLandscape, pageNumbers: settings.includePageNums }
            });
          }
        }
      });
    } else {
      // Fallback: use print dialog if PDFEngine not available
      console.warn('[Reports] PDFEngine not available, falling back to print dialog');
      var iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;left:-9999px;';
      document.body.appendChild(iframe);

      var doc = iframe.contentWindow.document;
      doc.open();
      doc.write('<!DOCTYPE html><html><head>');
      doc.write('<title>' + ERM.utils.escapeHtml(settings.title) + '</title>');
      doc.write('<style>' + styles + '</style>');
      doc.write('</head><body>');
      doc.write(htmlContent);
      doc.write('</body></html>');
      doc.close();

      iframe.onload = function() {
        setTimeout(function() {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          setTimeout(function() {
            document.body.removeChild(iframe);
          }, 1000);
        }, 250);
      };

      ERM.toast.show({ type: 'info', message: 'Print dialog opened. Save as PDF.' });
    }
  };

  /**
   * Generate report HTML with settings - matches preview format exactly
   */
  ERM.reports.generateReportHTMLWithSettings = function(report, settings) {
    var html = '';
    var user = ERM.state.user || {};
    var isFreeUser = !user.subscription || user.subscription === 'free' || user.subscription === 'trial';

    // Use edited content if available (from live preview edits)
    var editedContent = report.content || {};

    // Add cover page first (matches preview)
    html += this.renderCoverPage(report);

    // Get sections
    var sections = report.sections || [
      { id: 'exec_summary', name: 'Executive Summary', enabled: true },
      { id: 'risk_overview', name: 'Risk Overview', enabled: true },
      { id: 'top_risks', name: 'Top Risks', enabled: true },
      { id: 'recommendations', name: 'Recommendations', enabled: true }
    ];

    // Add content pages with watermark and page numbers (matches preview structure)
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      if (section.enabled !== false && editedContent[section.id]) {
        var pageNum = i + 1;

        html += '<div class="preview-page" data-page="' + pageNum + '">';

        // Only show watermark for free users
        if (isFreeUser) {
          html += '  <div class="page-watermark">';
          html += '    <img src="assets/images/watermark-logo.png" alt="Dimeri ERM" onerror="this.style.display=\'none\'">';
          html += '  </div>';
        }

        html += '  <div class="page-content">';
        html += editedContent[section.id];
        html += '  </div>';
        html += '  <div class="page-number-footer">Page ' + pageNum + '</div>';
        html += '</div>';
      }
    }

    return html;
  };

  /**
   * Export report as Word - shows upgrade modal (premium feature)
   */
  ERM.reports.exportAsWord = function(reportId) {
    var report = this.getRecentReportById(reportId);
    if (!report) {
      ERM.toast.show({ type: 'error', message: 'Report not found' });
      return;
    }

    // Show upgrade modal for Word export (premium feature)
    var content = '';
    content += '<div style="text-align: center; padding: 20px 0;">';
    content += '  <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #c41e3a 0%, #a01830 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">';
    content += '    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">';
    content += '      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>';
    content += '    </svg>';
    content += '  </div>';
    content += '  <h3 style="margin: 0 0 12px; font-size: 20px; font-weight: 600; color: #111827;">Upgrade to Pro</h3>';
    content += '  <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px; line-height: 1.5;">Word document export is available on our Pro plan. Upgrade to unlock this feature and many more!</p>';
    content += '  <ul style="text-align: left; margin: 0 0 24px; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 2;">';
    content += '    <li>Export reports to Word (.docx) format</li>';
    content += '    <li>Advanced AI-powered report generation</li>';
    content += '    <li>Custom report templates</li>';
    content += '    <li>Priority support</li>';
    content += '  </ul>';
    content += '  <div style="display: flex; gap: 12px; justify-content: center;">';
    content += '    <button onclick="ERM.components.closeModal();" class="btn btn-secondary" style="padding: 10px 20px;">Maybe Later</button>';
    content += '    <button onclick="ERM.reports.goToUpgrade();" class="btn btn-primary" style="padding: 10px 20px; background: linear-gradient(135deg, #c41e3a 0%, #a01830 100%); border: none;">Upgrade Now</button>';
    content += '  </div>';
    content += '</div>';

    ERM.components.showModal({
      title: 'Premium Feature',
      content: content,
      size: 'small'
    });
  };

  /**
   * Navigate to upgrade page
   */
  ERM.reports.goToUpgrade = function() {
    ERM.components.closeModal();
    window.location.hash = '#/upgrade';
  };

  ERM.reports.generateReportHTML = function (report) {
    var html = '';
    var template = this.getTemplateById(report.templateId);
    var user = ERM.state.user || {};
    var isFreeUser = !user.subscription || user.subscription === 'free' || user.subscription === 'trial';

    // If report has edited content, use it (matches preview rendering)
    if (report.content && Object.keys(report.content).length > 0) {
      console.log('[Export] Using edited content from report.content');

      // Add cover page first (matches preview)
      html += this.renderCoverPage(report);

      // Add edited sections in order (matches preview structure)
      var sections = report.sections || [
        { id: 'exec_summary', name: 'Executive Summary', enabled: true },
        { id: 'risk_overview', name: 'Risk Overview', enabled: true },
        { id: 'top_risks', name: 'Top Risks', enabled: true },
        { id: 'recommendations', name: 'Recommendations', enabled: true }
      ];

      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        if (section.enabled !== false && report.content[section.id]) {
          var pageNum = i + 1;

          html += '<div class="preview-page" data-page="' + pageNum + '">';

          // Only show watermark for free users
          if (isFreeUser) {
            html += '  <div class="page-watermark">';
            html += '    <img src="assets/images/watermark-logo.png" alt="Dimeri ERM" onerror="this.style.display=\'none\'">';
            html += '  </div>';
          }

          html += '  <div class="page-content">';
          html += report.content[section.id];
          html += '  </div>';
          html += '  <div class="page-number-footer">Page ' + pageNum + '</div>';
          html += '</div>';
        }
      }

      return html;
    }

    // Otherwise, generate from scratch (legacy behavior)
    console.log('[Export] Generating fresh content (no edited content found)');

    // Header
    html += '<h1>' + (template ? template.icon : '📄') + ' ' + ERM.utils.escapeHtml(report.name) + '</h1>';
    html += '<div class="meta">';
    html += '<strong>Generated:</strong> ' + ERM.utils.formatDate(report.generatedDate) + ' | ';
    html += '<strong>Author:</strong> ' + ERM.utils.escapeHtml(report.author) + ' | ';
    html += '<strong>Period:</strong> ' + this.getPeriodLabel(report.period);
    html += '</div>';

    // Get real data
    var risks = ERM.storage.get('risks') || [];
    var controls = ERM.storage.get('controls') || [];

    // Executive Summary
    html += '<h2>Executive Summary</h2>';
    html += '<p>This report provides a comprehensive overview of the organization\'s risk profile for the reporting period.</p>';

    // Risk Statistics
    html += '<h2>Risk Overview</h2>';
    html += '<table>';
    html += '<tr><th>Metric</th><th>Value</th></tr>';
    html += '<tr><td>Total Risks Identified</td><td>' + risks.length + '</td></tr>';
    html += '<tr><td>Critical Risks</td><td>' + risks.filter(function(r) { return r.inherentRisk === 'critical'; }).length + '</td></tr>';
    html += '<tr><td>High Risks</td><td>' + risks.filter(function(r) { return r.inherentRisk === 'high'; }).length + '</td></tr>';
    html += '<tr><td>Medium Risks</td><td>' + risks.filter(function(r) { return r.inherentRisk === 'medium'; }).length + '</td></tr>';
    html += '<tr><td>Low Risks</td><td>' + risks.filter(function(r) { return r.inherentRisk === 'low'; }).length + '</td></tr>';
    html += '<tr><td>Total Controls</td><td>' + controls.length + '</td></tr>';
    html += '</table>';

    // Risk Register Table - Professional Excel-like format
    if (risks.length > 0) {
      html += '<h2>Risk Register</h2>';

      // Use professional table builder if available
      if (ERM.ReportComponents && ERM.ReportComponents.buildProfessionalRiskTable) {
        html += ERM.ReportComponents.buildProfessionalRiskTable(risks, { maxRisks: 20 });
      } else {
        // Fallback to basic professional table
        html += '<table style="width: 100%; border-collapse: collapse; font-family: Arial, Calibri, sans-serif; font-size: 10pt;">';
        html += '<thead><tr style="background: #f8f9fa;">';
        html += '<th style="padding: 8px 10px; border: 1px solid #000; text-align: left; font-weight: 600;">Risk ID</th>';
        html += '<th style="padding: 8px 10px; border: 1px solid #000; text-align: left; font-weight: 600;">Risk Title</th>';
        html += '<th style="padding: 8px 10px; border: 1px solid #000; text-align: left; font-weight: 600;">Category</th>';
        html += '<th style="padding: 8px 10px; border: 1px solid #000; text-align: center; font-weight: 600;">Inherent Risk</th>';
        html += '<th style="padding: 8px 10px; border: 1px solid #000; text-align: center; font-weight: 600;">Residual Risk</th>';
        html += '<th style="padding: 8px 10px; border: 1px solid #000; text-align: left; font-weight: 600;">Owner</th>';
        html += '</tr></thead><tbody>';

        for (var i = 0; i < Math.min(risks.length, 20); i++) {
          var risk = risks[i];
          var inhScore = parseFloat(risk.inherentScore) || (parseFloat(risk.inherentLikelihood || 3) * parseFloat(risk.inherentImpact || 3));
          var resScore = parseFloat(risk.residualScore) || parseFloat(risk.residualRisk) || inhScore;

          html += '<tr>';
          html += '<td style="padding: 8px 10px; border: 1px solid #000; font-weight: 500;">' + ERM.utils.escapeHtml(risk.reference || 'R' + (i + 1)) + '</td>';
          html += '<td style="padding: 8px 10px; border: 1px solid #000;">' + ERM.utils.escapeHtml(risk.title || 'Untitled') + '</td>';
          html += '<td style="padding: 8px 10px; border: 1px solid #000;">' + ERM.utils.escapeHtml(risk.category || 'N/A') + '</td>';
          html += '<td style="padding: 8px 10px; border: 1px solid #000; text-align: center; font-weight: 500;">' + inhScore.toFixed(1) + '</td>';
          html += '<td style="padding: 8px 10px; border: 1px solid #000; text-align: center; font-weight: 500;">' + resScore.toFixed(1) + '</td>';
          html += '<td style="padding: 8px 10px; border: 1px solid #000;">' + ERM.utils.escapeHtml(risk.owner || 'Unassigned') + '</td>';
          html += '</tr>';
        }
        html += '</tbody></table>';

        if (risks.length > 20) {
          html += '<p style="font-size: 9pt; color: #666; font-style: italic;">Showing 20 of ' + risks.length + ' risks.</p>';
        }
      }
    }

    // Footer
    html += '<hr style="margin-top: 40px; border: none; border-top: 1px solid #e2e8f0;">';
    html += '<p style="color: #64748b; font-size: 12px; text-align: center;">';
    html += 'Generated by Dimeri ERM | ' + new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    html += '</p>';

    return html;
  };

  ERM.reports.deleteRecentReport = function (reportId) {
    var report = this.getRecentReportById(reportId);
    if (!report) return;

    var content =
      '<div class="confirm-delete" style="text-align: center; padding: 16px;">' +
      '  <div class="confirm-icon danger" style="width: 56px; height: 56px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">' +
      '    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
      '  </div>' +
      '  <h3 style="margin: 0 0 8px; font-size: 18px; color: #0f172a;">Delete Report?</h3>' +
      '  <p style="margin: 0 0 8px; color: #64748b;">Are you sure you want to delete</p>' +
      '  <p style="margin: 0; font-weight: 600; color: #0f172a;">"' + ERM.utils.escapeHtml(report.name) + '"</p>' +
      '  <p style="margin: 16px 0 0; font-size: 13px; color: #94a3b8;">This action cannot be undone.</p>' +
      '</div>';

    ERM.components.showModal({
      title: 'Delete Report',
      content: content,
      size: 'sm',
      buttons: [
        { label: 'Cancel', type: 'secondary', action: 'close' },
        { label: 'Delete', type: 'danger', action: 'delete' }
      ],
      onAction: function(action) {
        if (action === 'delete') {
          state.recentReports = state.recentReports.filter(function(r) { return r.id !== reportId; });
          ERM.reports.saveRecentReports();
          ERM.components.closeModal();
          ERM.reports.render();
          ERM.toast.show({ type: 'success', message: 'Report deleted' });
        }
      }
    });
  };

  ERM.reports.getRecentReportById = function (reportId) {
    for (var i = 0; i < state.recentReports.length; i++) {
      if (state.recentReports[i].id === reportId) {
        return state.recentReports[i];
      }
    }
    return null;
  };

  // ========================================
  // SCHEDULED REPORTS CRUD
  // ========================================

  ERM.reports.showSchedulerModal = function () {
    var content = '';
    content += '<form id="scheduler-form" class="modal-form">';

    content += '  <div class="form-group">';
    content += '    <label class="form-label">Report Type *</label>';
    content += '    <select class="form-select" id="schedule-template" required>';
    content += '      <option value="">Select a report template...</option>';
    for (var i = 0; i < state.templates.length; i++) {
      content += '      <option value="' + state.templates[i].id + '">' + state.templates[i].icon + ' ' + ERM.utils.escapeHtml(state.templates[i].name) + '</option>';
    }
    content += '    </select>';
    content += '  </div>';

    content += '  <div class="form-group">';
    content += '    <label class="form-label">Frequency *</label>';
    content += '    <select class="form-select" id="schedule-frequency" required>';
    content += '      <option value="">Select frequency...</option>';
    content += '      <option value="Weekly (Mondays)">Weekly (Mondays)</option>';
    content += '      <option value="Monthly (1st)">Monthly (1st of month)</option>';
    content += '      <option value="Quarterly">Quarterly</option>';
    content += '    </select>';
    content += '  </div>';

    content += '  <div class="form-group">';
    content += '    <label class="form-label">Recipients *</label>';
    content += '    <textarea class="form-input" id="schedule-recipients" rows="3" placeholder="Enter email addresses (comma-separated)" required></textarea>';
    content += '  </div>';

    content += '</form>';

    ERM.components.showModal({
      title: '🕐 Schedule Automatic Reports',
      content: content,
      size: 'md',
      buttons: [
        { label: 'Cancel', type: 'secondary', action: 'close' },
        { label: 'Save Schedule', type: 'primary', action: 'save' }
      ],
      onAction: function(action) {
        if (action === 'save') {
          ERM.reports.saveSchedule();
        }
      }
    });
  };

  ERM.reports.saveSchedule = function () {
    var templateId = document.getElementById('schedule-template').value;
    var frequency = document.getElementById('schedule-frequency').value;
    var recipients = document.getElementById('schedule-recipients').value.trim();

    if (!templateId || !frequency || !recipients) {
      ERM.toast.show({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    var template = this.getTemplateById(templateId);

    var schedule = {
      id: ERM.utils.generateId(),
      templateId: templateId,
      reportName: template ? template.name : 'Report',
      frequency: frequency,
      recipients: recipients,
      active: true,
      nextRun: this.calculateNextRun(frequency),
      createdDate: new Date().toISOString()
    };

    state.scheduledReports.push(schedule);
    this.saveScheduledReports();

    ERM.components.closeModal();
    this.render();
    ERM.toast.show({ type: 'success', message: 'Schedule created successfully' });
  };

  ERM.reports.calculateNextRun = function (frequency) {
    var now = new Date();
    var next = new Date(now);

    if (frequency.indexOf('Weekly') !== -1) {
      // Next Monday
      next.setDate(now.getDate() + (7 - now.getDay() + 1) % 7 || 7);
    } else if (frequency.indexOf('Monthly') !== -1) {
      // First of next month
      next.setMonth(now.getMonth() + 1);
      next.setDate(1);
    } else if (frequency.indexOf('Quarterly') !== -1) {
      // First of next quarter
      var quarter = Math.floor(now.getMonth() / 3);
      next.setMonth((quarter + 1) * 3);
      next.setDate(1);
    }

    return next.toISOString();
  };

  ERM.reports.pauseSchedule = function (scheduleId) {
    for (var i = 0; i < state.scheduledReports.length; i++) {
      if (state.scheduledReports[i].id === scheduleId) {
        state.scheduledReports[i].active = false;
        break;
      }
    }
    this.saveScheduledReports();
    this.render();
    ERM.toast.show({ type: 'info', message: 'Schedule paused' });
  };

  ERM.reports.resumeSchedule = function (scheduleId) {
    for (var i = 0; i < state.scheduledReports.length; i++) {
      if (state.scheduledReports[i].id === scheduleId) {
        state.scheduledReports[i].active = true;
        state.scheduledReports[i].nextRun = this.calculateNextRun(state.scheduledReports[i].frequency);
        break;
      }
    }
    this.saveScheduledReports();
    this.render();
    ERM.toast.show({ type: 'success', message: 'Schedule resumed' });
  };

  ERM.reports.deleteSchedule = function (scheduleId) {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    state.scheduledReports = state.scheduledReports.filter(function(s) { return s.id !== scheduleId; });
    this.saveScheduledReports();
    this.render();
    ERM.toast.show({ type: 'success', message: 'Schedule deleted' });
  };

  // ========================================
  // EVENT BINDING
  // ========================================

  ERM.reports.bindEvents = function () {
    var self = this;

    // View toggle buttons
    var viewBtns = document.querySelectorAll('.view-toggle .view-btn');
    var reportsGrid = document.getElementById('reports-grid');

    for (var i = 0; i < viewBtns.length; i++) {
      viewBtns[i].addEventListener('click', function() {
        var view = this.getAttribute('data-view');

        // Update active state
        for (var j = 0; j < viewBtns.length; j++) {
          viewBtns[j].classList.remove('active');
        }
        this.classList.add('active');

        // Toggle grid/list view (list is default, grid-view is the toggle class)
        if (reportsGrid) {
          if (view === 'grid') {
            reportsGrid.classList.add('grid-view');
          } else {
            reportsGrid.classList.remove('grid-view');
          }
        }
      });
    }

    // Sort dropdown
    var sortBtn = document.getElementById('reports-sort-dropdown-btn');
    var sortMenu = document.getElementById('reports-sort-dropdown-menu');
    if (sortBtn && sortMenu) {
      sortBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var isShowing = sortMenu.classList.contains('show');

        if (isShowing) {
          sortMenu.classList.remove('show', 'dropdown-up');
          sortMenu.style.position = '';
          sortMenu.style.top = '';
          sortMenu.style.bottom = '';
          sortMenu.style.left = '';
          sortMenu.style.right = '';
        } else {
          // Position the menu using fixed positioning
          var rect = sortBtn.getBoundingClientRect();
          sortMenu.style.position = 'fixed';
          sortMenu.style.right = (window.innerWidth - rect.right) + 'px';
          sortMenu.style.left = 'auto';

          // Auto-detect: check if menu would overflow bottom of viewport
          var menuHeight = sortMenu.offsetHeight || 200;
          sortMenu.classList.add('show');
          menuHeight = sortMenu.offsetHeight;

          var spaceBelow = window.innerHeight - rect.bottom - 8;
          var spaceAbove = rect.top - 8;

          if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
            sortMenu.style.top = 'auto';
            sortMenu.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
            sortMenu.classList.add('dropdown-up');
          } else {
            sortMenu.style.top = (rect.bottom + 4) + 'px';
            sortMenu.style.bottom = 'auto';
            sortMenu.classList.remove('dropdown-up');
          }
        }
      });

      var sortItems = sortMenu.querySelectorAll('.dropdown-item');
      for (var si = 0; si < sortItems.length; si++) {
        sortItems[si].addEventListener('click', function(e) {
          e.preventDefault();
          var sortBy = this.getAttribute('data-sort');
          // Update active state
          for (var sj = 0; sj < sortItems.length; sj++) {
            sortItems[sj].classList.remove('active');
          }
          this.classList.add('active');
          sortMenu.classList.remove('show', 'dropdown-up');
          sortMenu.style.position = '';
          sortMenu.style.top = '';
          sortMenu.style.bottom = '';
          sortMenu.style.left = '';
          sortMenu.style.right = '';
          self.sortReports(sortBy);
        });
      }
    }

    // Close sort dropdown on outside click
    document.addEventListener('click', function(e) {
      if (!e.target.closest('#reports-sort-dropdown-btn') && !e.target.closest('#reports-sort-dropdown-menu')) {
        if (sortMenu) {
          sortMenu.classList.remove('show', 'dropdown-up');
          sortMenu.style.position = '';
          sortMenu.style.top = '';
          sortMenu.style.bottom = '';
          sortMenu.style.left = '';
          sortMenu.style.right = '';
        }
      }
    });

    // Search functionality
    var searchInput = document.getElementById('reports-search');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        self.filterReports();
      });
    }

    // Filter dropdown
    var filterSelect = document.getElementById('reports-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', function() {
        self.filterReports();
      });
    }

    // Report cards: no automatic action on click - use kebab menu instead

    // Report checkbox handlers
    this.initReportCheckboxHandlers();

    // Select all checkbox
    var selectAllCheckbox = document.getElementById('select-all-reports');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', function() {
        var isChecked = this.checked;
        var checkboxes = document.querySelectorAll('.report-select-checkbox');
        for (var i = 0; i < checkboxes.length; i++) {
          var card = checkboxes[i].closest('.report-card');
          if (card && card.style.display !== 'none') {
            checkboxes[i].checked = isChecked;
            if (isChecked) {
              card.classList.add('selected');
            } else {
              card.classList.remove('selected');
            }
          }
        }
        self.updateReportsBulkActions();
      });
    }

    // Bulk delete button
    var bulkDeleteBtn = document.getElementById('bulk-delete-reports');
    if (bulkDeleteBtn) {
      bulkDeleteBtn.addEventListener('click', function() {
        self.bulkDeleteReports();
      });
    }
  };

  /**
   * Initialize report checkbox handlers for bulk select
   */
  ERM.reports.initReportCheckboxHandlers = function () {
    var self = this;

    var checkboxes = document.querySelectorAll('.report-select-checkbox');
    for (var j = 0; j < checkboxes.length; j++) {
      checkboxes[j].addEventListener('change', function () {
        var reportId = this.getAttribute('data-report-id');
        var isChecked = this.checked;

        // Update card selected state
        var card = document.querySelector('.report-card[data-report-id="' + reportId + '"]');
        if (card) {
          if (isChecked) {
            card.classList.add('selected');
          } else {
            card.classList.remove('selected');
          }
        }
        self.updateReportsBulkActions();
      });
    }
  };

  /**
   * Update bulk actions bar visibility
   */
  ERM.reports.updateReportsBulkActions = function () {
    var checkboxes = document.querySelectorAll('.report-select-checkbox');
    var checkedCount = 0;
    var visibleCount = 0;

    for (var i = 0; i < checkboxes.length; i++) {
      var card = checkboxes[i].closest('.report-card');
      if (card && card.style.display !== 'none') {
        visibleCount++;
        if (checkboxes[i].checked) {
          checkedCount++;
        }
      }
    }

    // Show/hide bulk actions bar
    var bulkBar = document.getElementById('reports-bulk-actions');
    var countEl = document.getElementById('reports-selected-count');

    if (bulkBar) {
      if (checkedCount > 0) {
        bulkBar.style.display = 'flex';
        if (countEl) {
          countEl.textContent = checkedCount + ' selected';
        }
      } else {
        bulkBar.style.display = 'none';
      }
    }

    // Update select all checkbox state
    var selectAllCheckbox = document.getElementById('select-all-reports');
    if (selectAllCheckbox) {
      if (visibleCount > 0 && checkedCount === visibleCount) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
      } else if (checkedCount > 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
      } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
      }
    }
  };

  /**
   * Get selected report IDs
   */
  ERM.reports.getSelectedReportIds = function () {
    var checkboxes = document.querySelectorAll('.report-select-checkbox:checked');
    var ids = [];
    for (var i = 0; i < checkboxes.length; i++) {
      ids.push(checkboxes[i].getAttribute('data-report-id'));
    }
    return ids;
  };

  /**
   * Bulk delete selected reports
   */
  ERM.reports.bulkDeleteReports = function () {
    var selectedIds = this.getSelectedReportIds();

    if (selectedIds.length === 0) {
      ERM.toast.show({ type: 'warning', message: 'No reports selected' });
      return;
    }

    var confirmMsg = 'Are you sure you want to delete ' + selectedIds.length + ' report' + (selectedIds.length > 1 ? 's' : '') + '? This action cannot be undone.';

    if (!confirm(confirmMsg)) {
      return;
    }

    // Remove from state
    for (var i = 0; i < selectedIds.length; i++) {
      var id = selectedIds[i];
      for (var j = state.recentReports.length - 1; j >= 0; j--) {
        if (state.recentReports[j].id === id) {
          state.recentReports.splice(j, 1);
          break;
        }
      }
    }

    // Save to storage
    ERM.storage.set('recentReports', state.recentReports);

    // Log activity
    if (ERM.activityLogger) {
      ERM.activityLogger.log('report', 'bulk_deleted', 'reports', selectedIds.length + ' reports', {
        count: selectedIds.length,
        reportIds: selectedIds
      });
    }

    ERM.toast.show({ type: 'success', message: selectedIds.length + ' report' + (selectedIds.length > 1 ? 's' : '') + ' deleted' });

    // Re-render
    this.render();
  };

  ERM.reports.filterReports = function () {
    var searchTerm = (document.getElementById('reports-search').value || '').toLowerCase();
    var filterFormat = document.getElementById('reports-filter').value;
    var reportCards = document.querySelectorAll('.report-card');
    var visibleCount = 0;

    for (var i = 0; i < reportCards.length; i++) {
      var card = reportCards[i];
      var reportId = card.getAttribute('data-report-id');
      var report = null;

      // Find the report data
      for (var j = 0; j < state.recentReports.length; j++) {
        if (state.recentReports[j].id === reportId) {
          report = state.recentReports[j];
          break;
        }
      }

      if (!report) {
        card.style.display = 'none';
        continue;
      }

      var reportName = report.title || report.name || '';
      var matchesSearch = !searchTerm ||
        (reportName.toLowerCase().indexOf(searchTerm) !== -1);
      var isV2 = report.format === 'v2';
      var matchesFilter = filterFormat === 'all' ||
        (isV2 ? filterFormat === 'v2' : (report.format || 'PDF') === filterFormat);

      if (matchesSearch && matchesFilter) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    }

    // Update count display
    var countEl = document.querySelector('.reports-count');
    if (countEl) {
      countEl.textContent = visibleCount + ' report' + (visibleCount !== 1 ? 's' : '');
    }
  };

  /**
   * Sort reports in the DOM
   */
  ERM.reports.sortReports = function (sortBy) {
    var reportsGrid = document.getElementById('reports-grid');
    if (!reportsGrid) return;

    var cards = Array.prototype.slice.call(reportsGrid.querySelectorAll('.report-card'));
    if (cards.length === 0) return;

    cards.sort(function (a, b) {
      var aId = a.getAttribute('data-report-id');
      var bId = b.getAttribute('data-report-id');
      var aReport = null;
      var bReport = null;

      // Find report data
      for (var i = 0; i < state.recentReports.length; i++) {
        if (state.recentReports[i].id === aId) aReport = state.recentReports[i];
        if (state.recentReports[i].id === bId) bReport = state.recentReports[i];
      }

      if (!aReport || !bReport) return 0;

      switch (sortBy) {
        case 'newest':
          return new Date(bReport.generatedDate || 0) - new Date(aReport.generatedDate || 0);
        case 'oldest':
          return new Date(aReport.generatedDate || 0) - new Date(bReport.generatedDate || 0);
        case 'name-asc':
          return (aReport.name || '').localeCompare(bReport.name || '');
        case 'name-desc':
          return (bReport.name || '').localeCompare(aReport.name || '');
        default:
          return 0;
      }
    });

    // Re-append in sorted order
    for (var j = 0; j < cards.length; j++) {
      reportsGrid.appendChild(cards[j]);
    }
  };

  // ========================================
  // KEBAB MENU (Vertical 3-dot menu)
  // ========================================

  /**
   * Render the kebab menu HTML
   */
  ERM.reports.renderKebabMenu = function(reportId) {
    var html = '';
    html += '<div class="report-kebab-wrapper">';
    html += '  <button class="report-kebab-btn" onclick="event.stopPropagation(); ERM.reports.toggleKebabMenu(this, \'' + reportId + '\')" title="More options">';
    html += '    <svg viewBox="0 0 24 24" fill="currentColor">';
    html += '      <circle cx="12" cy="5" r="2"></circle>';
    html += '      <circle cx="12" cy="12" r="2"></circle>';
    html += '      <circle cx="12" cy="19" r="2"></circle>';
    html += '    </svg>';
    html += '  </button>';
    html += '  <div class="report-kebab-dropdown" data-report-id="' + reportId + '">';
    html += '    <button class="kebab-menu-item" onclick="event.stopPropagation(); ERM.reports.editReport(\'' + reportId + '\')">';
    html += '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
    html += '        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>';
    html += '        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>';
    html += '      </svg>';
    html += '      <span>Edit</span>';
    html += '    </button>';
    html += '    <button class="kebab-menu-item" onclick="event.stopPropagation(); ERM.reports.renameReport(\'' + reportId + '\')">';
    html += '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
    html += '        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>';
    html += '      </svg>';
    html += '      <span>Rename</span>';
    html += '    </button>';
    html += '    <button class="kebab-menu-item" onclick="event.stopPropagation(); ERM.reports.showPreviewModal(\'' + reportId + '\'); ERM.reports.closeAllKebabMenus();">';
    html += '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
    html += '        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>';
    html += '        <circle cx="12" cy="12" r="3"></circle>';
    html += '      </svg>';
    html += '      <span>Preview</span>';
    html += '    </button>';
    html += '    <button class="kebab-menu-item" onclick="event.stopPropagation(); ERM.reports.showExportPDFModal(\'' + reportId + '\'); ERM.reports.closeAllKebabMenus();">';
    html += '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
    html += '        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>';
    html += '        <polyline points="14 2 14 8 20 8"></polyline>';
    html += '        <line x1="16" y1="13" x2="8" y2="13"></line>';
    html += '        <line x1="16" y1="17" x2="8" y2="17"></line>';
    html += '        <polyline points="10 9 9 9 8 9"></polyline>';
    html += '      </svg>';
    html += '      <span>Export as PDF</span>';
    html += '    </button>';
    html += '    <button class="kebab-menu-item" onclick="event.stopPropagation(); ERM.reports.shareReport(\'' + reportId + '\')">';
    html += '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
    html += '        <circle cx="18" cy="5" r="3"></circle>';
    html += '        <circle cx="6" cy="12" r="3"></circle>';
    html += '        <circle cx="18" cy="19" r="3"></circle>';
    html += '        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>';
    html += '        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>';
    html += '      </svg>';
    html += '      <span>Share</span>';
    html += '    </button>';
    html += '    <div class="kebab-menu-divider"></div>';
    html += '    <button class="kebab-menu-item danger" onclick="event.stopPropagation(); ERM.reports.deleteRecentReport(\'' + reportId + '\')">';
    html += '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
    html += '        <polyline points="3 6 5 6 21 6"></polyline>';
    html += '        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>';
    html += '        <line x1="10" y1="11" x2="10" y2="17"></line>';
    html += '        <line x1="14" y1="11" x2="14" y2="17"></line>';
    html += '      </svg>';
    html += '      <span>Delete</span>';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';
    return html;
  };

  /**
   * Toggle kebab menu visibility
   */
  ERM.reports.toggleKebabMenu = function(btn, reportId) {
    var wrapper = btn.closest('.report-kebab-wrapper');
    var dropdown = wrapper.querySelector('.report-kebab-dropdown');
    var card = btn.closest('.report-card');
    var isOpen = dropdown.classList.contains('visible');

    // Close all other open menus first
    this.closeAllKebabMenus();

    if (!isOpen) {
      // Position the menu using fixed positioning to escape overflow:hidden
      var rect = btn.getBoundingClientRect();
      dropdown.style.position = "fixed";
      dropdown.style.right = (window.innerWidth - rect.right) + "px";
      dropdown.style.left = "auto";

      // Auto-detect: check if menu would overflow bottom of viewport
      var menuHeight = dropdown.offsetHeight || 200;
      dropdown.classList.add('visible');
      menuHeight = dropdown.offsetHeight;

      var spaceBelow = window.innerHeight - rect.bottom - 8;
      var spaceAbove = rect.top - 8;

      if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
        // Not enough space below, position above the button
        dropdown.style.top = "auto";
        dropdown.style.bottom = (window.innerHeight - rect.top + 4) + "px";
        dropdown.classList.add("dropdown-up");
      } else {
        // Position below the button (default)
        dropdown.style.top = (rect.bottom + 4) + "px";
        dropdown.style.bottom = "auto";
        dropdown.classList.remove("dropdown-up");
      }

      btn.classList.add('active');
      if (card) card.classList.add('dropdown-active');

      // Close on outside click
      var closeHandler = function(e) {
        if (!wrapper.contains(e.target)) {
          dropdown.classList.remove('visible', 'dropdown-up');
          dropdown.style.position = "";
          dropdown.style.top = "";
          dropdown.style.bottom = "";
          dropdown.style.left = "";
          dropdown.style.right = "";
          btn.classList.remove('active');
          if (card) card.classList.remove('dropdown-active');
          document.removeEventListener('click', closeHandler);
        }
      };
      setTimeout(function() {
        document.addEventListener('click', closeHandler);
      }, 10);
    }
  };

  /**
   * Close all open kebab menus
   */
  ERM.reports.closeAllKebabMenus = function() {
    var dropdowns = document.querySelectorAll('.report-kebab-dropdown.visible');
    for (var i = 0; i < dropdowns.length; i++) {
      dropdowns[i].classList.remove('visible', 'dropdown-up');
      dropdowns[i].style.position = "";
      dropdowns[i].style.top = "";
      dropdowns[i].style.bottom = "";
      dropdowns[i].style.left = "";
      dropdowns[i].style.right = "";
    }
    var btns = document.querySelectorAll('.report-kebab-btn.active');
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.remove('active');
    }
    var activeCards = document.querySelectorAll('.report-card.dropdown-active');
    for (var k = 0; k < activeCards.length; k++) {
      activeCards[k].classList.remove('dropdown-active');
    }
  };

  // ========================================
  // EDIT REPORT (Full Content Editor)
  // ========================================

  /**
   * Edit report - opens the editor
   * Uses V2 editor by default if available
   */
  ERM.reports.editReport = function(reportId) {
    this.closeAllKebabMenus();

    var report = this.getRecentReportById(reportId);
    if (!report) {
      ERM.toast.show({ type: 'error', message: 'Report not found' });
      return;
    }

    // Store current editing report ID
    this.editingReportId = reportId;

    // Log activity
    if (ERM.activityLogger) {
      ERM.activityLogger.log('report', 'edited', 'report', report.name, {
        reportId: reportId,
        format: report.format
      });
    }

    // Check if V2 editor is available and enabled
    var useV2 = ERM.storage.get('useEditorV2') !== false && typeof ERM.reportEditorV2 !== 'undefined';

    if (useV2) {
      this.openEditorV2(reportId);
    } else {
      // Open the legacy content editor modal
      this.showReportContentEditor(reportId);
    }
  };

  /**
   * Open Report Editor V2 (Notion-style)
   */
  ERM.reports.openEditorV2 = function(reportId) {
    var report = this.getRecentReportById(reportId);
    if (!report) {
      ERM.toast.show({ type: 'error', message: 'Report not found' });
      return;
    }

    // Convert existing report format to V2 format
    var v2Report = this.convertToV2Format(report);

    // Hide main content and show editor
    var mainContainer = document.querySelector('.main-content') || document.querySelector('.content-area');
    if (mainContainer) {
      mainContainer.setAttribute('data-hidden-for-editor', 'true');
      mainContainer.style.display = 'none';
    }

    // Create editor container
    var editorContainer = document.createElement('div');
    editorContainer.id = 'editor-v2-container';
    editorContainer.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; background: white;';
    document.body.appendChild(editorContainer);

    // Initialize V2 editor
    ERM.reportEditorV2.init('editor-v2-container', v2Report);
  };

  /**
   * Convert existing report to V2 format
   */
  ERM.reports.convertToV2Format = function(report) {
    // If already V2 format with content array, use it directly
    if (report.format === 'v2' && Array.isArray(report.content) && report.content.length > 0) {
      return {
        id: report.id,
        title: report.title || report.name || 'Untitled Report',
        content: report.content,
        createdAt: report.createdAt || new Date().toISOString(),
        updatedAt: report.updatedAt || new Date().toISOString(),
        author: report.author || (ERM.state.user ? ERM.state.user.name : 'Unknown'),
        comments: report.comments || []
      };
    }

    // Convert from legacy format
    var content = [];

    // Add title as heading for legacy reports
    content.push({
      id: 'block_title',
      type: 'heading1',
      content: report.name || report.title || 'Untitled Report'
    });

    // Convert existing content if any
    if (report.content) {
      // Check if content is already in V2 format (array of blocks)
      if (Array.isArray(report.content)) {
        content = content.concat(report.content);
      } else if (typeof report.content === 'object') {
        // Convert section-based content
        var sections = Object.keys(report.content);
        for (var i = 0; i < sections.length; i++) {
          var sectionId = sections[i];
          var sectionContent = report.content[sectionId];

          // Add section heading
          content.push({
            id: 'block_' + sectionId + '_heading',
            type: 'heading2',
            content: sectionId.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); })
          });

          // Add section content
          if (typeof sectionContent === 'string') {
            content.push({
              id: 'block_' + sectionId + '_content',
              type: 'paragraph',
              content: sectionContent
            });
          }
        }
      }
    }

    // Add empty paragraph if no content
    if (content.length <= 1) {
      content.push({
        id: 'block_empty',
        type: 'paragraph',
        content: ''
      });
    }

    return {
      id: report.id,
      title: report.name || report.title || 'Untitled Report',
      content: content,
      createdAt: report.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: report.author || (ERM.state.user ? ERM.state.user.name : 'Unknown'),
      comments: report.comments || []
    };
  };

  /**
   * Close Editor V2 and return to reports list
   */
  ERM.reports.closeEditorV2 = function() {
    var editorContainer = document.getElementById('editor-v2-container');
    if (editorContainer) {
      editorContainer.remove();
    }

    var mainContainer = document.querySelector('[data-hidden-for-editor="true"]');
    if (mainContainer) {
      mainContainer.removeAttribute('data-hidden-for-editor');
      mainContainer.style.display = '';
    }

    // Refresh the reports list
    this.showList();
  };

  /**
   * Show reports list - reload data and re-render
   */
  ERM.reports.showList = function() {
    // Just call render() which handles everything
    this.render();
  };

  /**
   * Alias for showList for compatibility
   */
  ERM.reports.renderReportsView = function() {
    this.showList();
  };

  /**
   * Show report content editor with toggle view (Edit/Preview) and cover page
   */
  ERM.reports.showReportContentEditor = function(reportId) {
    var self = this;
    var report = this.getRecentReportById(reportId);
    if (!report) return;

    // Get sections from report - check both report.sections and report.config.sections
    var sections = report.sections ||
                   (report.config && report.config.sections) ||
                   [
                     { id: 'exec_summary', name: 'Executive Summary', enabled: true },
                     { id: 'risk_overview', name: 'Risk Overview', enabled: true },
                     { id: 'top_risks', name: 'Top Risks', enabled: true },
                     { id: 'recommendations', name: 'Recommendations', enabled: true }
                   ];

    // Filter to only enabled sections
    sections = sections.filter(function(s) { return s.enabled !== false; });

    // Initialize edited content from report or defaults
    this.editedContent = report.content || {};
    this.activeSectionId = sections[0].id;
    this.editorViewMode = 'edit'; // 'edit' or 'preview'

    var content = '';
    content += '<div class="report-edit-layout">';

    // Top Bar with Section Dropdown and View Toggle
    content += '  <div class="edit-top-bar">';

    // Section Dropdown (replacing tabs)
    content += '    <div class="edit-section-selector">';
    content += '      <label for="section-dropdown" style="font-size: 13px; font-weight: 600; color: #64748b; margin-right: 8px;">Section:</label>';
    content += '      <select id="section-dropdown" class="section-dropdown">';
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      if (section.enabled !== false) {
        var isSelected = section.id === this.activeSectionId ? ' selected' : '';
        content += '        <option value="' + section.id + '"' + isSelected + '>' + ERM.utils.escapeHtml(section.name) + '</option>';
      }
    }
    content += '      </select>';
    content += '    </div>';

    // View Mode Toggle
    content += '    <div class="view-mode-toggle">';
    content += '      <button type="button" class="toggle-btn active" data-mode="edit">✏️ Edit</button>';
    content += '      <button type="button" class="toggle-btn" data-mode="preview">👁️ Preview</button>';
    content += '    </div>';

    content += '  </div>';

    // Main Content Area - Single View with Toggle
    content += '  <div class="edit-main-area">';

    // Editor Panel
    content += '    <div class="edit-editor-panel" id="editor-panel-view" style="display: flex;">';
    content += '      <div class="editor-toolbar" id="editor-toolbar">';
    content += this.renderEditorToolbar();
    content += '      </div>';
    content += '      <div class="editor-content-area" id="editor-content-area" contenteditable="true">';
    content += this.getEditableSectionContent(this.activeSectionId, report);
    content += '      </div>';
    content += '    </div>';

    // Preview Panel (PDF-like)
    content += '    <div class="edit-preview-panel" id="preview-panel-view" style="display: none;">';
    content += '      <div class="preview-page-indicator">Page <span id="current-page-num">1</span> of <span id="total-pages-num">' + (sections.length + 1) + '</span></div>';
    content += '      <div class="preview-pages-container" id="preview-pages-container">';
    content += this.renderFullReportPreview(report, sections);
    content += '      </div>';
    content += '    </div>';

    content += '  </div>';
    content += '</div>';

    ERM.components.showModal({
      title: 'Edit Report: ' + ERM.utils.escapeHtml(report.name),
      content: content,
      size: 'fullscreen',
      buttons: [
        { label: 'Cancel', type: 'secondary', action: 'close' },
        { label: 'Save Changes', type: 'primary', action: 'save' }
      ],
      onAction: function(action) {
        self.handleEditAction(action, reportId);
      }
    });

    // Initialize events after modal renders
    setTimeout(function() {
      self.initContentEditorEvents(reportId);
      // Initialize the Report Editor floating toolbar (AI-assisted editing)
      if (ERM.reportEditor) {
        ERM.reportEditor.init(reportId);
        console.log('[Reports] Report editor initialized for report:', reportId);
      }
    }, 100);
  };

  /**
   * Render editor toolbar
   */
  ERM.reports.renderEditorToolbar = function() {
    var html = '';

    // Format selector
    html += '<select class="toolbar-select" id="format-select" onchange="ERM.reports.execFormatBlock(this.value)">';
    html += '  <option value="">Format</option>';
    html += '  <option value="p">Normal</option>';
    html += '  <option value="h1">Heading 1</option>';
    html += '  <option value="h2">Heading 2</option>';
    html += '  <option value="h3">Heading 3</option>';
    html += '</select>';

    html += '<span class="toolbar-divider"></span>';

    // Text formatting
    html += '<button type="button" class="toolbar-btn" onclick="document.execCommand(\'bold\')" title="Bold"><b>B</b></button>';
    html += '<button type="button" class="toolbar-btn" onclick="document.execCommand(\'italic\')" title="Italic"><i>I</i></button>';
    html += '<button type="button" class="toolbar-btn" onclick="document.execCommand(\'underline\')" title="Underline"><u>U</u></button>';

    html += '<span class="toolbar-divider"></span>';

    // Lists - Microsoft Word style icons
    html += '<button type="button" class="toolbar-btn" onclick="ERM.reports.insertList(\'unordered\')" title="Bullet List">';
    html += '  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">';
    html += '    <circle cx="2.5" cy="3" r="1.5"/>';
    html += '    <circle cx="2.5" cy="8" r="1.5"/>';
    html += '    <circle cx="2.5" cy="13" r="1.5"/>';
    html += '    <rect x="6" y="2" width="9" height="2" rx="0.5"/>';
    html += '    <rect x="6" y="7" width="9" height="2" rx="0.5"/>';
    html += '    <rect x="6" y="12" width="9" height="2" rx="0.5"/>';
    html += '  </svg>';
    html += '</button>';
    html += '<button type="button" class="toolbar-btn" onclick="ERM.reports.insertList(\'ordered\')" title="Numbered List">';
    html += '  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="font-family: Arial, sans-serif;">';
    html += '    <text x="1" y="4.5" font-size="5" font-weight="bold">1.</text>';
    html += '    <text x="1" y="9.5" font-size="5" font-weight="bold">2.</text>';
    html += '    <text x="1" y="14.5" font-size="5" font-weight="bold">3.</text>';
    html += '    <rect x="6" y="2" width="9" height="2" rx="0.5"/>';
    html += '    <rect x="6" y="7" width="9" height="2" rx="0.5"/>';
    html += '    <rect x="6" y="12" width="9" height="2" rx="0.5"/>';
    html += '  </svg>';
    html += '</button>';

    return html;
  };

  /**
   * Execute format block command
   */
  ERM.reports.execFormatBlock = function(value) {
    if (value) {
      document.execCommand('formatBlock', false, '<' + value + '>');
    }
  };

  /**
   * Insert list (bullet or numbered) into the editor
   * Ensures editor is focused and handles list insertion properly
   */
  ERM.reports.insertList = function(type) {
    var editorArea = document.getElementById('editor-content-area');
    if (!editorArea) {
      console.warn('[Reports] No editor area found for list insertion');
      return;
    }

    // Focus the editor first
    editorArea.focus();

    // Get current selection
    var selection = window.getSelection();
    var range;

    // If no selection or selection is outside editor, place cursor at end
    if (!selection.rangeCount || !editorArea.contains(selection.anchorNode)) {
      range = document.createRange();
      range.selectNodeContents(editorArea);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    // Execute the appropriate list command
    var command = type === 'ordered' ? 'insertOrderedList' : 'insertUnorderedList';
    var success = document.execCommand(command, false, null);

    if (!success) {
      // Fallback: manually insert list HTML
      var listTag = type === 'ordered' ? 'ol' : 'ul';
      var listHtml = '<' + listTag + '><li>List item</li></' + listTag + '>';

      // Insert at cursor position
      range = selection.getRangeAt(0);
      range.deleteContents();

      var tempDiv = document.createElement('div');
      tempDiv.innerHTML = listHtml;
      var listElement = tempDiv.firstChild;

      range.insertNode(listElement);

      // Move cursor inside the list item
      var li = listElement.querySelector('li');
      if (li) {
        range = document.createRange();
        range.selectNodeContents(li);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      console.log('[Reports] List inserted via fallback method');
    }

    // Trigger input event to update preview
    var inputEvent = new Event('input', { bubbles: true, cancelable: true });
    editorArea.dispatchEvent(inputEvent);

    // Update live preview
    if (typeof this.updateLivePreview === 'function') {
      this.updateLivePreview();
    }
  };

  /**
   * Get editable content for a section
   */
  ERM.reports.getEditableSectionContent = function(sectionId, report) {
    // Check if we have edited content
    if (this.editedContent && this.editedContent[sectionId]) {
      return this.editedContent[sectionId];
    }

    // Check if report has stored content
    if (report && report.content && report.content[sectionId]) {
      return report.content[sectionId];
    }

    // Default content based on section type
    var defaults = {
      'exec_summary': '<h2>Executive Summary</h2><p>This report provides a comprehensive overview of enterprise risk exposure for the current reporting period.</p><p>Key highlights include:</p><ul><li>Overall risk posture remains within acceptable thresholds</li><li>3 high-priority risks require immediate attention</li><li>Control effectiveness has improved by 12% quarter-over-quarter</li></ul>',
      'risk_overview': '<h2>Risk Overview</h2><p>The organization currently tracks <strong>24 active risks</strong> across 6 categories.</p><p>Risk distribution by severity:</p><ul><li>Critical: 2 risks</li><li>High: 5 risks</li><li>Medium: 10 risks</li><li>Low: 7 risks</li></ul>',
      'top_risks': '<h2>Top Enterprise Risks</h2><p>The following risks represent the highest priority items requiring management attention:</p><ol><li><strong>Cybersecurity Threat Landscape</strong> - Score: 20 (Critical)</li><li><strong>Regulatory Compliance Changes</strong> - Score: 16 (High)</li><li><strong>Third-Party Vendor Dependencies</strong> - Score: 15 (High)</li></ol>',
      'recommendations': '<h2>Recommendations</h2><p>Based on the current risk assessment, the following actions are recommended:</p><ol><li>Enhance cybersecurity monitoring capabilities</li><li>Review and update vendor risk assessment procedures</li><li>Conduct quarterly risk appetite review with the Board</li></ol>'
    };

    return defaults[sectionId] || '<h2>' + sectionId.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); }) + '</h2><p>Content for this section...</p>';
  };

  /**
   * Render preview for a section
   */
  ERM.reports.renderEditPreview = function(sectionId, report) {
    var content = this.getEditableSectionContent(sectionId, report);
    return '<div class="preview-section-rendered">' + content + '</div>';
  };

  /**
   * Get comprehensive PDF styles that match the preview CSS
   * This ensures PDF export looks identical to the preview
   */
  ERM.reports.getPDFStyles = function() {
    return [
      // Base styles
      '* { box-sizing: border-box; }',
      'body { font-family: "Segoe UI", Arial, sans-serif; margin: 0; padding: 0; color: #1e293b; background: white; line-height: 1.6; }',

      // Preview page structure - critical for matching preview
      '.preview-page { width: 100%; max-width: 210mm; margin: 0 auto 20px; padding: 40px 50px; background: white; position: relative; min-height: 280mm; page-break-after: always; page-break-inside: avoid; }',
      '.preview-page:last-child { page-break-after: auto; }',

      // Cover page styles
      '.cover-page { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; min-height: 280mm; padding: 60px; }',
      '.cover-content { display: flex; flex-direction: column; align-items: center; max-width: 80%; }',
      '.cover-title { font-size: 36px; font-weight: 700; color: #0f172a; margin: 0 0 16px; line-height: 1.2; }',
      '.cover-subtitle { font-size: 18px; color: #64748b; margin-bottom: 40px; }',
      '.cover-divider { width: 80px; height: 4px; background: linear-gradient(135deg, #c41e3a 0%, #a01830 100%); margin: 0 auto 40px; border-radius: 2px; }',
      '.cover-details { text-align: left; width: 100%; max-width: 400px; margin: 0 auto; }',
      '.cover-detail-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }',
      '.cover-detail-label { color: #64748b; font-size: 14px; }',
      '.cover-detail-value { color: #1e293b; font-weight: 500; font-size: 14px; }',
      '.cover-footer { margin-top: 60px; }',
      '.cover-classification { display: inline-block; padding: 8px 24px; font-size: 12px; font-weight: 600; letter-spacing: 1px; border-radius: 4px; background: #f1f5f9; color: #475569; }',
      '.cover-classification.confidential { background: #fee2e2; color: #dc2626; }',
      '.cover-classification.internal { background: #fef3c7; color: #d97706; }',

      // Watermark styles
      '.page-watermark, .cover-watermark { position: absolute; bottom: 30px; left: 50px; opacity: 0.5; z-index: 10; }',
      '.page-watermark img, .cover-watermark img { max-height: 40px; max-width: 120px; }',

      // Page content styles
      '.page-content { font-size: 14px; line-height: 1.8; color: #1e293b; }',
      '.page-number-footer { position: absolute; bottom: 30px; right: 50px; font-size: 12px; color: #94a3b8; }',

      // Typography
      'h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0 0 24px; border-bottom: 3px solid #c41e3a; padding-bottom: 12px; page-break-after: avoid; }',
      'h2 { font-size: 22px; font-weight: 600; color: #1e293b; margin: 32px 0 16px; page-break-after: avoid; }',
      'h3 { font-size: 18px; font-weight: 600; color: #334155; margin: 24px 0 12px; page-break-after: avoid; }',
      'h4 { font-size: 16px; font-weight: 600; color: #475569; margin: 20px 0 10px; page-break-after: avoid; }',
      'p { margin: 0 0 16px; orphans: 3; widows: 3; }',
      'ul, ol { margin: 0 0 16px; padding-left: 28px; }',
      'li { margin-bottom: 8px; }',

      // Table styles - critical for preventing overlap
      'table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 12px; page-break-inside: avoid; table-layout: fixed; }',
      'thead { display: table-header-group; }',
      'tbody { page-break-inside: avoid; }',
      'tr { page-break-inside: avoid; page-break-after: auto; }',
      'th { background: #f8fafc; color: #1e293b; font-weight: 600; padding: 10px 12px; text-align: left; border: 1px solid #e2e8f0; overflow: hidden; text-overflow: ellipsis; }',
      'td { padding: 10px 12px; border: 1px solid #e2e8f0; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; max-width: 200px; }',
      'tr:nth-child(even) td { background: #fafafa; }',
      // Specific column widths for risk tables
      'table.risk-table th:first-child, table.risk-table td:first-child { width: 60px; }',
      'table.risk-table th:nth-child(2), table.risk-table td:nth-child(2) { width: auto; }',
      'table.risk-table th:nth-child(3), table.risk-table td:nth-child(3) { width: 100px; }',

      // Risk level badges
      '.badge, .risk-badge, .level-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }',
      '.badge-critical, .risk-critical, .level-critical { background: #fee2e2; color: #dc2626; }',
      '.badge-high, .risk-high, .level-high { background: #fef3c7; color: #d97706; }',
      '.badge-medium, .risk-medium, .level-medium { background: #fef9c3; color: #ca8a04; }',
      '.badge-low, .risk-low, .level-low { background: #dcfce7; color: #16a34a; }',

      // Heatmap styles
      '.risk-heatmap, .heatmap-container, .risk-heatmap-container { margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 8px; page-break-inside: avoid; }',
      '.heatmap-table { width: auto; margin: 0 auto; border-collapse: collapse; }',
      '.heatmap-table td { width: 50px; height: 50px; text-align: center; font-size: 14px; font-weight: 600; border: 2px solid white; }',
      '.heatmap-cell-critical { background: #fee2e2; color: #dc2626; }',
      '.heatmap-cell-high { background: #fed7aa; color: #c2410c; }',
      '.heatmap-cell-medium { background: #fef9c3; color: #a16207; }',
      '.heatmap-cell-low { background: #dcfce7; color: #15803d; }',

      // Chart container
      '.chart-container, .chart-wrapper { margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 8px; page-break-inside: avoid; text-align: center; }',
      '.chart-placeholder { padding: 40px; color: #64748b; font-style: italic; }',

      // KPI and metric cards
      '.kpi-grid, .metrics-grid, .kpi-cards { display: flex; flex-wrap: wrap; gap: 16px; margin: 24px 0; }',
      '.kpi-card, .metric-card { flex: 1 1 calc(25% - 16px); min-width: 150px; padding: 20px; background: #f8fafc; border-radius: 8px; text-align: center; page-break-inside: avoid; }',
      '.kpi-value, .metric-value { font-size: 28px; font-weight: 700; color: #0f172a; }',
      '.kpi-label, .metric-label { font-size: 12px; color: #64748b; margin-top: 4px; }',

      // Recommendations
      '.recommendations-grid { display: flex; flex-direction: column; gap: 16px; margin: 24px 0; }',
      '.recommendation-card { padding: 16px 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #c41e3a; page-break-inside: avoid; }',
      '.recommendation-title { font-weight: 600; color: #1e293b; margin-bottom: 8px; }',
      '.recommendation-text { color: #475569; font-size: 14px; }',

      // Summary cards
      '.summary-card { padding: 20px; background: #f8fafc; border-radius: 8px; margin: 16px 0; page-break-inside: avoid; }',
      '.summary-title { font-weight: 600; color: #1e293b; margin-bottom: 12px; }',

      // Meta info
      '.meta, .report-meta { color: #64748b; font-size: 14px; margin-bottom: 24px; }',

      // Print-specific rules
      '@media print {',
      '  body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }',
      '  .preview-page { page-break-after: always; box-shadow: none; margin: 0; }',
      '  .preview-page:last-child { page-break-after: auto; }',
      '  table { page-break-inside: avoid; }',
      '  tr { page-break-inside: avoid; }',
      '  h1, h2, h3, h4 { page-break-after: avoid; }',
      '  h2 + p, h2 + ul, h2 + table { page-break-before: avoid; }',
      '}'
    ].join('\n');
  };

  /**
   * Render cover page for report preview
   */
  ERM.reports.renderCoverPage = function(report) {
    var workspace = ERM.state.workspace || {};
    var user = ERM.state.user || {};
    var currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Check if user is on free plan (show watermark only for free users)
    var isFreeUser = !user.subscription || user.subscription === 'free' || user.subscription === 'trial';

    var html = '<div class="preview-page cover-page" data-page="cover">';

    // Only show watermark for free users
    if (isFreeUser) {
      html += '  <div class="cover-watermark">';
      html += '    <img src="assets/images/watermark-logo.png" alt="Dimeri ERM" onerror="this.style.display=\'none\'">';
      html += '  </div>';
    }

    html += '  <div class="cover-content">';
    html += '    <h1 class="cover-title">' + ERM.utils.escapeHtml(report.name || 'Risk Management Report') + '</h1>';
    html += '    <div class="cover-subtitle">' + ERM.utils.escapeHtml(report.type || 'Enterprise Risk Management') + '</div>';
    html += '    <div class="cover-divider"></div>';
    html += '    <div class="cover-details">';
    html += '      <div class="cover-detail-item">';
    html += '        <span class="cover-detail-label">Organization:</span>';
    html += '        <span class="cover-detail-value">' + ERM.utils.escapeHtml(workspace.name || 'Organization Name') + '</span>';
    html += '      </div>';
    html += '      <div class="cover-detail-item">';
    html += '        <span class="cover-detail-label">Reporting Period:</span>';
    html += '        <span class="cover-detail-value">' + ERM.utils.escapeHtml(report.period || 'Current Period') + '</span>';
    html += '      </div>';
    html += '      <div class="cover-detail-item">';
    html += '        <span class="cover-detail-label">Report Date:</span>';
    html += '        <span class="cover-detail-value">' + currentDate + '</span>';
    html += '      </div>';
    html += '      <div class="cover-detail-item">';
    html += '        <span class="cover-detail-label">Prepared By:</span>';
    html += '        <span class="cover-detail-value">' + ERM.utils.escapeHtml(user.name || 'Risk Manager') + '</span>';
    html += '      </div>';
    html += '      <div class="cover-detail-item">';
    html += '        <span class="cover-detail-label">Classification:</span>';
    html += '        <span class="cover-detail-value">' + ERM.utils.escapeHtml(report.classification || 'Internal') + '</span>';
    html += '      </div>';
    html += '    </div>';
    html += '    <div class="cover-footer">';
    html += '      <div class="cover-classification ' + (report.classification || 'internal').toLowerCase() + '">';
    html += '        ' + (report.classification || 'INTERNAL').toUpperCase();
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    return html;
  };

  /**
   * Render full report preview with cover page
   */
  ERM.reports.renderFullReportPreview = function(report, sections) {
    var user = ERM.state.user || {};
    var isFreeUser = !user.subscription || user.subscription === 'free' || user.subscription === 'trial';
    var html = '';

    // Add cover page first
    html += this.renderCoverPage(report);

    // Add content pages with watermark and page numbers at bottom
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      if (section.enabled !== false) {
        var content = this.editedContent[section.id] || this.getEditableSectionContent(section.id, report);
        var pageNum = i + 1;

        html += '<div class="preview-page" data-page="' + pageNum + '">';

        // Only show watermark for free users
        if (isFreeUser) {
          html += '  <div class="page-watermark">';
          html += '    <img src="assets/images/watermark-logo.png" alt="Dimeri ERM" onerror="this.style.display=\'none\'">';
          html += '  </div>';
        }
        html += '  <div class="page-content">';
        html += content;
        html += '  </div>';
        html += '  <div class="page-number-footer">Page ' + pageNum + '</div>';
        html += '</div>';
      }
    }

    return html;
  };

  /**
   * Initialize content editor events
   */
  ERM.reports.initContentEditorEvents = function(reportId) {
    var self = this;
    var report = this.getRecentReportById(reportId);

    // View Mode Toggle
    var toggleBtns = document.querySelectorAll('.toggle-btn');
    console.log('[Toggle] Found toggle buttons:', toggleBtns.length);

    for (var t = 0; t < toggleBtns.length; t++) {
      toggleBtns[t].addEventListener('click', function () {
        var mode = this.getAttribute('data-mode');
        console.log('[Toggle] Clicked button, switching to mode:', mode);

        // Update toggle buttons
        for (var j = 0; j < toggleBtns.length; j++) {
          toggleBtns[j].classList.remove('active');
        }
        this.classList.add('active');

        // Save ALL section content before switching (not just current section)
        var editorArea = document.getElementById('editor-content-area');
        if (editorArea && self.activeSectionId) {
          if (!self.editedContent) self.editedContent = {};
          self.editedContent[self.activeSectionId] = editorArea.innerHTML;
          console.log('[Toggle] Saved content for section:', self.activeSectionId);
        }

        // Toggle views
        var editorPanel = document.getElementById('editor-panel-view');
        var previewPanel = document.getElementById('preview-panel-view');
        console.log('[Toggle] Found panels - editor:', editorPanel, 'preview:', previewPanel);

        if (mode === 'edit') {
          // Edit mode: Show editable editor panel
          console.log('[Toggle] Switching to EDIT mode - showing editor, hiding preview');
          editorPanel.style.setProperty('display', 'flex', 'important');
          previewPanel.style.setProperty('display', 'none', 'important');
          console.log('[Toggle] Editor display:', editorPanel.style.display, 'Preview display:', previewPanel.style.display);
        } else {
          // Preview mode: Show read-only full report preview with ALL edited content
          console.log('[Toggle] Switching to PREVIEW mode - hiding editor, showing preview');
          editorPanel.style.setProperty('display', 'none', 'important');
          previewPanel.style.setProperty('display', 'flex', 'important');
          console.log('[Toggle] Editor display:', editorPanel.style.display, 'Preview display:', previewPanel.style.display);

          // Refresh preview with all edited content and cover page
          var previewContainer = document.getElementById('preview-pages-container');
          if (previewContainer) {
            var sections = report.sections || [
              { id: 'exec_summary', name: 'Executive Summary', enabled: true },
              { id: 'risk_overview', name: 'Risk Overview', enabled: true },
              { id: 'top_risks', name: 'Top Risks', enabled: true },
              { id: 'recommendations', name: 'Recommendations', enabled: true }
            ];
            console.log('[Toggle] Rendering preview with editedContent:', self.editedContent);
            previewContainer.innerHTML = self.renderFullReportPreview(report, sections);
            console.log('[Toggle] Preview content refreshed');
          }
        }

        self.editorViewMode = mode;
      });
    }

    // Section dropdown switching (replacing tabs)
    var sectionDropdown = document.getElementById('section-dropdown');
    if (sectionDropdown) {
      sectionDropdown.addEventListener('change', function(e) {
        var sectionId = this.value;
        self.switchEditorSection(sectionId, reportId);
      });
    }

    // Live preview update on input
    var editorArea = document.getElementById('editor-content-area');
    if (editorArea) {
      editorArea.addEventListener('input', function() {
        // Store edited content
        if (!self.editedContent) self.editedContent = {};
        self.editedContent[self.activeSectionId] = editorArea.innerHTML;
      });
    }

    // Initialize chart click handlers for any existing charts
    this.attachChartClickHandlers();
  };

  /**
   * Switch editor section
   */
  ERM.reports.switchEditorSection = function(sectionId, reportId) {
    var self = this;
    var report = this.getRecentReportById(reportId);

    // Save current content before switching
    var editorArea = document.getElementById('editor-content-area');
    if (editorArea && this.activeSectionId) {
      if (!this.editedContent) this.editedContent = {};
      this.editedContent[this.activeSectionId] = editorArea.innerHTML;
    }

    // Update active section
    this.activeSectionId = sectionId;

    // Update dropdown selected value
    var sectionDropdown = document.getElementById('section-dropdown');
    if (sectionDropdown) {
      sectionDropdown.value = sectionId;
    }

    // Update editor content
    if (editorArea) {
      editorArea.innerHTML = this.getEditableSectionContent(sectionId, report);
    }

    // Update preview
    this.updateLivePreview();
  };

  /**
   * Update live preview
   */
  ERM.reports.updateLivePreview = function() {
    var editorArea = document.getElementById('editor-content-area');
    var previewArea = document.getElementById('edit-preview-content');

    if (editorArea && previewArea) {
      previewArea.innerHTML = '<div class="preview-section-rendered">' + editorArea.innerHTML + '</div>';
    }
  };

  /**
   * Handle edit action buttons
   */
  ERM.reports.handleEditAction = function(action, reportId) {
    var self = this;

    if (action === 'close') {
      ERM.components.closeModal();
    } else if (action === 'ai') {
      ERM.toast.show({ type: 'info', message: 'AI Assistant: Select text in the editor to get AI suggestions' });
    } else if (action === 'save') {
      this.saveReportContent(reportId);
    }
  };

  /**
   * Save report content
   */
  ERM.reports.saveReportContent = function(reportId) {
    var self = this;

    // Save current section content
    var editorArea = document.getElementById('editor-content-area');
    if (editorArea && this.activeSectionId) {
      if (!this.editedContent) this.editedContent = {};
      this.editedContent[this.activeSectionId] = editorArea.innerHTML;
    }

    // Find and update the report
    for (var i = 0; i < state.recentReports.length; i++) {
      if (state.recentReports[i].id === reportId) {
        state.recentReports[i].content = this.editedContent;
        state.recentReports[i].modifiedDate = new Date().toISOString();

        // Log activity
        if (ERM.activityLogger) {
          ERM.activityLogger.log('report', 'updated', 'report', state.recentReports[i].name, {
            reportId: reportId,
            action: 'content_edited'
          });
        }
        break;
      }
    }

    this.saveRecentReports();
    ERM.components.closeModal();
    this.render();
    ERM.toast.show({ type: 'success', message: 'Report content saved successfully' });
  };

  // ========================================
  // RENAME REPORT
  // ========================================

  /**
   * Rename report - shows simple rename modal
   */
  ERM.reports.renameReport = function(reportId) {
    this.closeAllKebabMenus();

    var report = this.getRecentReportById(reportId);
    if (!report) {
      ERM.toast.show({ type: 'error', message: 'Report not found' });
      return;
    }

    var content = '';
    content += '<p style="color: #64748b; font-size: 14px; margin-bottom: 4px;">Enter a new name for this report:</p>';
    content += '<div class="rename-input-wrapper">';
    content += '  <input type="text" class="rename-input" id="rename-report-input" value="' + ERM.utils.escapeHtml(report.name) + '" autofocus>';
    content += '</div>';

    ERM.components.showModal({
      title: 'Rename Report',
      content: content,
      size: 'sm',
      buttons: [
        { label: 'Cancel', type: 'secondary', action: 'close' },
        { label: 'Rename', type: 'primary', action: 'rename' }
      ],
      onAction: function(action) {
        if (action === 'rename') {
          ERM.reports.saveReportRename(reportId);
        }
      }
    });

    // Focus and select input
    setTimeout(function() {
      var input = document.getElementById('rename-report-input');
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  };

  /**
   * Save renamed report
   */
  ERM.reports.saveReportRename = function(reportId) {
    var input = document.getElementById('rename-report-input');
    if (!input) return;

    var newName = input.value.trim();
    if (!newName) {
      ERM.toast.show({ type: 'error', message: 'Report name cannot be empty' });
      return;
    }

    // Find and update
    for (var i = 0; i < state.recentReports.length; i++) {
      if (state.recentReports[i].id === reportId) {
        var oldName = state.recentReports[i].name;

        if (oldName === newName) {
          ERM.components.closeModal();
          return;
        }

        state.recentReports[i].name = newName;
        state.recentReports[i].modifiedDate = new Date().toISOString();

        // Log activity
        if (ERM.activityLogger) {
          ERM.activityLogger.log('report', 'renamed', 'report', newName, {
            reportId: reportId,
            oldName: oldName,
            newName: newName
          });
        }
        break;
      }
    }

    this.saveRecentReports();
    ERM.components.closeModal();
    this.render();
    ERM.toast.show({ type: 'success', message: 'Report renamed to "' + newName + '"' });
  };

  // ========================================
  // PREVIEW REPORT
  // ========================================

  /**
   * Show report preview in modal - routes to correct previewer based on format
   */
  ERM.reports.showPreviewModal = function(reportId) {
    var self = this;
    this.closeAllKebabMenus();

    var report = this.getRecentReportById(reportId);
    if (!report) {
      ERM.toast.show({ type: 'error', message: 'Report not found' });
      return;
    }

    // Check if this is a V2 report - if so, use V2 preview
    if (report.format === 'v2') {
      console.log('[Reports] Detected V2 report, using V2 preview');
      // Open the report in V2 editor and trigger preview
      this.editReport(reportId);
      // Wait for editor to load, then trigger preview
      setTimeout(function() {
        if (window.ERM && ERM.reportEditorV2 && ERM.reportEditorV2.showPreview) {
          ERM.reportEditorV2.showPreview();
        }
      }, 500);
      return;
    }

    // Otherwise use legacy preview for old reports
    console.log('[Reports] Using legacy preview for old format report');

    // Generate the report HTML for preview
    var previewHtml = this.generateReportHTML(report);

    // Use same PDF styles for consistent preview - scoped to avoid conflicts
    var previewStyles = this.getPDFStyles().replace(/\n/g, ' ');

    var content = '';
    content += '<div class="report-preview-modal">';
    content += '  <style scoped>' + previewStyles + '</style>';
    content += '  <div class="report-preview-container" style="background: #f0f0f0; padding: 20px; max-height: calc(85vh - 180px); overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px;">';
    content += previewHtml;
    content += '  </div>';
    content += '</div>';

    ERM.components.showModal({
      title: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 8px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Report Preview',
      content: content,
      size: 'xl',
      buttons: [
        { label: 'Close', type: 'secondary', action: 'close' },
        { label: 'Export PDF', type: 'primary', action: 'export' }
      ],
      onOpen: function() {
        // Ensure modal body is scrollable
        var modal = document.querySelector("#modal-overlay .modal");
        var modalBody = document.querySelector(".modal-body");
        if (modal) {
          modal.style.overflow = "visible";
        }
        if (modalBody) {
          modalBody.style.overflowY = "auto";
          modalBody.style.maxHeight = "calc(85vh - 140px)";
        }
      },
      onAction: function(action) {
        if (action === 'export') {
          ERM.components.closeModal();
          setTimeout(function() {
            self.showExportPDFModal(reportId);
          }, 200);
        }
      }
    });
  };

  // ========================================
  // SHARE REPORT
  // ========================================

  /**
   * Share report with team members
   */
  ERM.reports.shareReport = function(reportId) {
    this.closeAllKebabMenus();

    var report = this.getRecentReportById(reportId);
    if (!report) {
      ERM.toast.show({ type: 'error', message: 'Report not found' });
      return;
    }

    // Show team invite modal for report sharing
    if (typeof ERM.team !== 'undefined' && ERM.team.showInviteModal) {
      ERM.team.showInviteModal({
        title: 'Share Report',
        contextType: 'report',
        contextId: reportId,
        contextName: report.title || report.name || 'Untitled Report',
        onInvite: function(memberId, role) {
          // Log activity
          if (typeof ERM.activityLogger !== 'undefined') {
            var member = ERM.team.getMemberById(memberId);
            ERM.activityLogger.log('report', 'shared', 'report', report.title || report.name, {
              reportId: reportId,
              sharedWith: member ? member.name : 'Unknown',
              role: role
            });
          }

          // Refresh reports list to show shared status
          if (typeof ERM.reports.loadReports === 'function') {
            ERM.reports.loadReports();
          }
        },
        onRemove: function(memberId) {
          // Log activity
          if (typeof ERM.activityLogger !== 'undefined') {
            var member = ERM.team.getMemberById(memberId);
            ERM.activityLogger.log('report', 'unshared', 'report', report.title || report.name, {
              reportId: reportId,
              removedFrom: member ? member.name : 'Unknown'
            });
          }

          // Refresh reports list
          if (typeof ERM.reports.loadReports === 'function') {
            ERM.reports.loadReports();
          }
        }
      });
    } else {
      ERM.toast.show({ type: 'error', message: 'Team module not loaded' });
    }
  };

  /**
   * Copy share link to clipboard
   */
  ERM.reports.copyShareLink = function(reportId) {
    var report = this.getRecentReportById(reportId);
    var shareLink = window.location.origin + '/reports/view/' + reportId;

    // Try to copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareLink).then(function() {
        ERM.toast.show({ type: 'success', message: 'Link copied to clipboard!' });
      }).catch(function() {
        ERM.reports.fallbackCopyToClipboard(shareLink);
      });
    } else {
      this.fallbackCopyToClipboard(shareLink);
    }

    // Log activity
    if (ERM.activityLogger && report) {
      ERM.activityLogger.log('report', 'shared', 'report', report.name, {
        reportId: reportId,
        action: 'copied_link'
      });
    }
  };

  /**
   * Fallback clipboard copy for older browsers
   */
  ERM.reports.fallbackCopyToClipboard = function(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      ERM.toast.show({ type: 'success', message: 'Link copied to clipboard!' });
    } catch (e) {
      ERM.toast.show({ type: 'error', message: 'Failed to copy link' });
    }
    document.body.removeChild(textarea);
  };

  /**
   * Share via email
   */
  ERM.reports.shareViaEmail = function(reportId) {
    var report = this.getRecentReportById(reportId);
    if (!report) return;

    var shareLink = window.location.origin + '/reports/view/' + reportId;
    var subject = encodeURIComponent('Risk Report: ' + report.name);
    var body = encodeURIComponent(
      'Hi,\n\n' +
      'I\'m sharing a risk report with you:\n\n' +
      'Report: ' + report.name + '\n' +
      'Generated: ' + ERM.utils.formatDate(report.generatedDate) + '\n' +
      'Format: ' + (report.format || 'PDF') + '\n\n' +
      'View or download the report here:\n' + shareLink + '\n\n' +
      'Best regards'
    );

    // Open email client
    window.location.href = 'mailto:?subject=' + subject + '&body=' + body;

    // Log activity
    if (ERM.activityLogger) {
      ERM.activityLogger.log('report', 'shared', 'report', report.name, {
        reportId: reportId,
        action: 'email'
      });
    }

    ERM.components.closeModal();
  };

  // ========================================
  // UPDATE DELETE WITH AUDIT LOGGING
  // ========================================

  // Store original delete function reference
  var originalDeleteRecentReport = ERM.reports.deleteRecentReport;

  /**
   * Enhanced delete with audit logging
   */
  ERM.reports.deleteRecentReport = function (reportId) {
    this.closeAllKebabMenus();

    var report = this.getRecentReportById(reportId);
    if (!report) return;

    if (!confirm('Are you sure you want to delete "' + report.name + '"?\n\nThis action cannot be undone.')) {
      return;
    }

    var reportName = report.name;

    // Remove from state
    state.recentReports = state.recentReports.filter(function(r) { return r.id !== reportId; });
    this.saveRecentReports();

    // Log to activity trail
    if (ERM.activityLogger) {
      ERM.activityLogger.log('report', 'deleted', 'report', reportName, {
        reportId: reportId,
        format: report.format,
        generatedDate: report.generatedDate
      });
    }

    this.render();
    ERM.toast.show({ type: 'success', message: 'Report "' + reportName + '" deleted' });
  };

  // ========================================
  // CHART IMPORT & ACTIONS
  // ========================================

  /**
   * Show modal to import charts from dashboard
   */
  ERM.reports.showImportChartModal = function() {
    var self = this;
    var kris = ERM.storage.get('kris') || [];

    if (kris.length === 0) {
      ERM.toast.show({ type: 'info', message: 'No dashboard charts available. Create KRIs in the Dashboard first.' });
      return;
    }

    var content = '';
    content += '<div class="import-chart-grid">';
    content += '  <p style="margin: 0 0 16px; color: #64748b;">Select a dashboard chart to insert into your report:</p>';

    for (var i = 0; i < kris.length; i++) {
      var kri = kris[i];
      content += '  <div class="import-chart-card" data-kri-id="' + kri.id + '">';
      content += '    <div class="chart-preview-placeholder">';
      content += '      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
      content += '        <line x1="18" y1="20" x2="18" y2="10"/>';
      content += '        <line x1="12" y1="20" x2="12" y2="4"/>';
      content += '        <line x1="6" y1="20" x2="6" y2="14"/>';
      content += '      </svg>';
      content += '    </div>';
      content += '    <div class="chart-info">';
      content += '      <div class="chart-name">' + ERM.utils.escapeHtml(kri.name || 'Untitled KRI') + '</div>';
      content += '      <div class="chart-meta">Current: ' + (kri.currentValue || 'N/A') + ' | Threshold: ' + (kri.threshold || 'N/A') + '</div>';
      content += '    </div>';
      content += '    <button class="btn btn-sm btn-primary" onclick="ERM.reports.insertChart(\'' + kri.id + '\')">Insert</button>';
      content += '  </div>';
    }

    content += '</div>';

    ERM.components.showModal({
      title: '📊 Import Dashboard Chart',
      content: content,
      size: 'lg',
      buttons: [
        { label: 'Cancel', type: 'secondary', action: 'close' }
      ]
    });
  };

  /**
   * Insert chart into editor
   */
  ERM.reports.insertChart = function(kriId) {
    var kris = ERM.storage.get('kris') || [];
    var kri = kris.find(function(k) { return k.id === kriId; });

    if (!kri) {
      ERM.toast.show({ type: 'error', message: 'Chart not found' });
      return;
    }

    var editorContent = document.getElementById('editor-content-area');
    if (!editorContent) return;

    // Create chart image element with data attributes for actions
    var chartHtml = '<div class="inserted-chart" data-kri-id="' + kriId + '" contenteditable="false">';
    chartHtml += '  <div class="chart-placeholder">';
    chartHtml += '    <svg width="100%" height="200" viewBox="0 0 400 200" style="background: #f8fafc; border-radius: 8px;">';
    chartHtml += '      <text x="200" y="90" text-anchor="middle" fill="#94a3b8" font-size="14">Chart: ' + ERM.utils.escapeHtml(kri.name) + '</text>';
    chartHtml += '      <text x="200" y="110" text-anchor="middle" fill="#64748b" font-size="12">Current: ' + (kri.currentValue || 'N/A') + ' | Threshold: ' + (kri.threshold || 'N/A') + '</text>';
    chartHtml += '      <line x1="100" y1="160" x2="100" y2="140" stroke="#3b82f6" stroke-width="8"/>';
    chartHtml += '      <line x1="150" y1="160" x2="150" y2="120" stroke="#3b82f6" stroke-width="8"/>';
    chartHtml += '      <line x1="200" y1="160" x2="200" y2="100" stroke="#3b82f6" stroke-width="8"/>';
    chartHtml += '      <line x1="250" y1="160" x2="250" y2="130" stroke="#3b82f6" stroke-width="8"/>';
    chartHtml += '      <line x1="300" y1="160" x2="300" y2="110" stroke="#3b82f6" stroke-width="8"/>';
    chartHtml += '    </svg>';
    chartHtml += '  </div>';
    chartHtml += '  <div class="chart-caption" contenteditable="true">Figure: ' + ERM.utils.escapeHtml(kri.name) + '</div>';
    chartHtml += '</div>';
    chartHtml += '<p><br></p>'; // Add space after chart

    // Insert at cursor or end
    editorContent.focus();
    document.execCommand('insertHTML', false, chartHtml);

    // Close modal
    ERM.components.closeModal();

    // Attach click handlers to the new chart
    setTimeout(function() {
      ERM.reports.attachChartClickHandlers();
    }, 100);

    ERM.toast.show({ type: 'success', message: 'Chart inserted' });
  };

  /**
   * Attach click handlers to all inserted charts
   */
  ERM.reports.attachChartClickHandlers = function() {
    var self = this;
    var charts = document.querySelectorAll('.inserted-chart');

    for (var i = 0; i < charts.length; i++) {
      // Remove existing listeners
      var newChart = charts[i].cloneNode(true);
      charts[i].parentNode.replaceChild(newChart, charts[i]);

      // Add new click listener
      newChart.addEventListener('click', function(e) {
        if (e.target.classList.contains('chart-caption')) return; // Allow editing caption

        self.showChartActions(this);
      });
    }
  };

  /**
   * Show action buttons on chart click
   */
  ERM.reports.showChartActions = function(chartElement) {
    var self = this;

    // Remove existing overlays
    var existingOverlays = document.querySelectorAll('.chart-action-overlay');
    for (var i = 0; i < existingOverlays.length; i++) {
      existingOverlays[i].remove();
    }

    // Create action overlay
    var overlay = document.createElement('div');
    overlay.className = 'chart-action-overlay';

    var actions = '';
    actions += '<button class="chart-action-btn" data-action="insights" title="AI Insights">';
    actions += '  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
    actions += '    <circle cx="12" cy="12" r="10"/>';
    actions += '    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>';
    actions += '    <line x1="12" y1="17" x2="12.01" y2="17"/>';
    actions += '  </svg>';
    actions += '  Insights';
    actions += '</button>';
    actions += '<button class="chart-action-btn" data-action="expand" title="Expand Chart">';
    actions += '  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
    actions += '    <polyline points="15 3 21 3 21 9"/>';
    actions += '    <polyline points="9 21 3 21 3 15"/>';
    actions += '    <line x1="21" y1="3" x2="14" y2="10"/>';
    actions += '    <line x1="3" y1="21" x2="10" y2="14"/>';
    actions += '  </svg>';
    actions += '  Expand';
    actions += '</button>';
    actions += '<button class="chart-action-btn" data-action="refresh" title="Refresh Data">';
    actions += '  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
    actions += '    <polyline points="23 4 23 10 17 10"/>';
    actions += '    <polyline points="1 20 1 14 7 14"/>';
    actions += '    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>';
    actions += '  </svg>';
    actions += '  Refresh';
    actions += '</button>';
    actions += '<button class="chart-action-btn chart-action-btn-danger" data-action="delete" title="Delete Chart">';
    actions += '  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
    actions += '    <polyline points="3 6 5 6 21 6"/>';
    actions += '    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>';
    actions += '  </svg>';
    actions += '  Delete';
    actions += '</button>';

    overlay.innerHTML = actions;

    // Position overlay
    chartElement.style.position = 'relative';
    chartElement.appendChild(overlay);

    // Attach action handlers
    var actionBtns = overlay.querySelectorAll('.chart-action-btn');
    for (var j = 0; j < actionBtns.length; j++) {
      actionBtns[j].addEventListener('click', function(e) {
        e.stopPropagation();
        var action = this.getAttribute('data-action');
        var kriId = chartElement.getAttribute('data-kri-id');
        self.handleChartAction(action, kriId, chartElement);
      });
    }

    // Close overlay when clicking outside
    setTimeout(function() {
      document.addEventListener('click', function closeOverlay(e) {
        if (!chartElement.contains(e.target)) {
          overlay.remove();
          document.removeEventListener('click', closeOverlay);
        }
      });
    }, 10);
  };

  /**
   * Handle chart actions
   */
  ERM.reports.handleChartAction = function(action, kriId, chartElement) {
    var kris = ERM.storage.get('kris') || [];
    var kri = kris.find(function(k) { return k.id === kriId; });

    switch (action) {
      case 'insights':
        this.showChartInsights(kri);
        break;

      case 'expand':
        this.expandChart(kri);
        break;

      case 'refresh':
        this.refreshChart(kriId, chartElement);
        break;

      case 'delete':
        if (confirm('Delete this chart from the report?')) {
          chartElement.remove();
          ERM.toast.show({ type: 'success', message: 'Chart deleted' });
        }
        break;
    }

    // Remove overlay
    var overlay = chartElement.querySelector('.chart-action-overlay');
    if (overlay) overlay.remove();
  };

  /**
   * Show AI insights for chart
   */
  ERM.reports.showChartInsights = function(kri) {
    if (!kri) return;

    var content = '';
    content += '<div class="chart-insights-panel">';
    content += '  <div class="insight-header">';
    content += '    <div class="insight-icon">💡</div>';
    content += '    <h3>' + ERM.utils.escapeHtml(kri.name) + '</h3>';
    content += '  </div>';
    content += '  <div class="insight-content">';
    content += '    <div class="insight-item">';
    content += '      <strong>Current Value:</strong> ' + (kri.currentValue || 'N/A');
    content += '    </div>';
    content += '    <div class="insight-item">';
    content += '      <strong>Threshold:</strong> ' + (kri.threshold || 'N/A');
    content += '    </div>';
    content += '    <div class="insight-item">';
    content += '      <strong>Trend:</strong> ' + (kri.trend || 'Stable');
    content += '    </div>';
    content += '    <div class="insight-item">';
    content += '      <strong>Status:</strong> ' + (kri.status || 'Within limits');
    content += '    </div>';
    content += '  </div>';
    content += '  <div class="insight-recommendations">';
    content += '    <h4>AI-Generated Insights:</h4>';
    content += '    <ul>';
    content += '      <li>The metric is currently tracking ' + (kri.trend === 'improving' ? 'positively' : 'within expected ranges') + '</li>';
    content += '      <li>Continue monitoring for any threshold breaches</li>';
    content += '      <li>Consider reviewing control effectiveness if trends change</li>';
    content += '    </ul>';
    content += '  </div>';
    content += '</div>';

    ERM.components.showModal({
      title: '📊 Chart Insights',
      content: content,
      size: 'md',
      buttons: [
        { label: 'Close', type: 'primary', action: 'close' }
      ]
    });
  };

  /**
   * Expand chart to fullscreen
   */
  ERM.reports.expandChart = function(kri) {
    if (!kri) return;

    var content = '';
    content += '<div class="expanded-chart-view">';
    content += '  <h3 style="margin: 0 0 20px;">' + ERM.utils.escapeHtml(kri.name) + '</h3>';
    content += '  <div style="width: 100%; height: 400px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center;">';
    content += '    <svg width="600" height="300" viewBox="0 0 600 300">';
    content += '      <text x="300" y="130" text-anchor="middle" fill="#94a3b8" font-size="18">' + ERM.utils.escapeHtml(kri.name) + '</text>';
    content += '      <text x="300" y="155" text-anchor="middle" fill="#64748b" font-size="14">Current: ' + (kri.currentValue || 'N/A') + ' | Threshold: ' + (kri.threshold || 'N/A') + '</text>';
    content += '      <line x1="100" y1="240" x2="100" y2="180" stroke="#3b82f6" stroke-width="15"/>';
    content += '      <line x1="200" y1="240" x2="200" y2="140" stroke="#3b82f6" stroke-width="15"/>';
    content += '      <line x1="300" y1="240" x2="300" y2="100" stroke="#3b82f6" stroke-width="15"/>';
    content += '      <line x1="400" y1="240" x2="400" y2="150" stroke="#3b82f6" stroke-width="15"/>';
    content += '      <line x1="500" y1="240" x2="500" y2="120" stroke="#3b82f6" stroke-width="15"/>';
    content += '    </svg>';
    content += '  </div>';
    content += '</div>';

    ERM.components.showModal({
      title: '📊 ' + ERM.utils.escapeHtml(kri.name),
      content: content,
      size: 'xl',
      buttons: [
        { label: 'Close', type: 'primary', action: 'close' }
      ]
    });
  };

  /**
   * Refresh chart data
   */
  ERM.reports.refreshChart = function(kriId, chartElement) {
    var kris = ERM.storage.get('kris') || [];
    var kri = kris.find(function(k) { return k.id === kriId; });

    if (!kri) return;

    // Update chart caption with latest data
    var caption = chartElement.querySelector('.chart-caption');
    if (caption) {
      caption.textContent = 'Figure: ' + kri.name + ' (Updated: ' + new Date().toLocaleDateString() + ')';
    }

    ERM.toast.show({ type: 'success', message: 'Chart refreshed with latest data' });
  };

  // ========================================
  // EMBED RENDERING FUNCTIONS (for Report Editor V2)
  // ========================================

  /**
   * Get risks filtered by register
   */
  function getRisksByRegister(registerId) {
    var risks = ERM.storage.get('risks') || [];
    if (!registerId || registerId === 'all') {
      return risks;
    }
    return risks.filter(function(r) {
      return r.registerId === registerId || r.riskRegister === registerId;
    });
  }

  /**
   * Compute risk score
   */
  function computeRiskScore(risk) {
    var likelihood = parseFloat(risk.inherentLikelihood) || 3;
    var impact = parseFloat(risk.inherentImpact) || 3;
    return likelihood * impact;
  }

  /**
   * Get risk level from score
   */
  function getRiskLevel(score) {
    if (score >= 15) return 'critical';
    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  }

  /**
   * Get risk level color
   */
  function getRiskLevelColor(level) {
    var colors = {
      critical: '#dc2626',
      high: '#f59e0b',
      medium: '#eab308',
      low: '#22c55e'
    };
    return colors[level] || '#64748b';
  }

  /**
   * Render Heatmap embed for Editor V2
   */
  ERM.reports.renderHeatmap = function(registerId, layout) {
    var risks = getRisksByRegister(registerId);

    // Build 5x5 matrix
    var inherentMatrix = [];
    var residualMatrix = [];
    for (var i = 0; i < 5; i++) {
      inherentMatrix[i] = [0, 0, 0, 0, 0];
      residualMatrix[i] = [0, 0, 0, 0, 0];
    }

    // Populate matrix
    for (var r = 0; r < risks.length; r++) {
      var risk = risks[r];
      var iL = Math.min(5, Math.max(1, parseInt(risk.inherentLikelihood) || 3)) - 1;
      var iI = Math.min(5, Math.max(1, parseInt(risk.inherentImpact) || 3)) - 1;
      inherentMatrix[iL][iI]++;

      var rL = Math.min(5, Math.max(1, parseInt(risk.residualLikelihood) || iL + 1)) - 1;
      var rI = Math.min(5, Math.max(1, parseInt(risk.residualImpact) || iI + 1)) - 1;
      residualMatrix[rL][rI]++;
    }

    var html = '<div class="embed-heatmap-container" style="display: flex; gap: 24px; flex-wrap: wrap;">';

    // Inherent heatmap
    html += '<div class="embed-heatmap" style="flex: 1; min-width: 280px;">';
    html += '<h4 style="margin: 0 0 12px; font-size: 14px; color: #334155;">Inherent Risk</h4>';
    html += buildHeatmapGrid(inherentMatrix);
    html += '</div>';

    // Residual heatmap
    if (layout !== 'single') {
      html += '<div class="embed-heatmap" style="flex: 1; min-width: 280px;">';
      html += '<h4 style="margin: 0 0 12px; font-size: 14px; color: #334155;">Residual Risk</h4>';
      html += buildHeatmapGrid(residualMatrix);
      html += '</div>';
    }

    html += '</div>';

    // Legend
    html += '<div style="display: flex; gap: 16px; margin-top: 12px; font-size: 11px; color: #64748b;">';
    html += '<span><span style="display: inline-block; width: 12px; height: 12px; background: #dcfce7; border-radius: 2px; margin-right: 4px;"></span>Low</span>';
    html += '<span><span style="display: inline-block; width: 12px; height: 12px; background: #fef9c3; border-radius: 2px; margin-right: 4px;"></span>Medium</span>';
    html += '<span><span style="display: inline-block; width: 12px; height: 12px; background: #fed7aa; border-radius: 2px; margin-right: 4px;"></span>High</span>';
    html += '<span><span style="display: inline-block; width: 12px; height: 12px; background: #fecaca; border-radius: 2px; margin-right: 4px;"></span>Critical</span>';
    html += '</div>';

    return html;
  };

  /**
   * Build heatmap grid HTML
   */
  function buildHeatmapGrid(matrix) {
    var html = '<table style="border-collapse: collapse; width: 100%; max-width: 300px;">';

    // Header row
    html += '<tr><td style="width: 30px;"></td>';
    for (var i = 1; i <= 5; i++) {
      html += '<td style="text-align: center; font-size: 10px; color: #94a3b8; padding: 2px;">' + i + '</td>';
    }
    html += '</tr>';

    // Grid rows (5 at top, 1 at bottom)
    for (var row = 4; row >= 0; row--) {
      html += '<tr>';
      html += '<td style="text-align: center; font-size: 10px; color: #94a3b8; padding: 2px;">' + (row + 1) + '</td>';

      for (var col = 0; col < 5; col++) {
        var count = matrix[row][col];
        var score = (row + 1) * (col + 1);
        var bgColor = score >= 15 ? '#fecaca' : score >= 10 ? '#fed7aa' : score >= 5 ? '#fef9c3' : '#dcfce7';

        html += '<td style="background: ' + bgColor + '; width: 40px; height: 40px; text-align: center; vertical-align: middle; border: 2px solid white; border-radius: 4px;">';
        if (count > 0) {
          html += '<span style="background: white; border-radius: 50%; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">' + count + '</span>';
        }
        html += '</td>';
      }
      html += '</tr>';
    }

    html += '</table>';
    return html;
  }

  /**
   * Render Top Risks embed for Editor V2
   */
  ERM.reports.renderTopRisks = function(registerId, limit) {
    limit = limit || 5;
    var risks = getRisksByRegister(registerId);

    // Sort by inherent score
    risks.sort(function(a, b) {
      return computeRiskScore(b) - computeRiskScore(a);
    });

    var topRisks = risks.slice(0, limit);

    if (topRisks.length === 0) {
      return '<div class="embed-empty" style="padding: 24px; text-align: center; color: #94a3b8;">No risks found</div>';
    }

    var html = '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">';
    html += '<thead>';
    html += '<tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">';
    html += '<th style="padding: 10px 12px; text-align: left; font-weight: 600; color: #334155;">Risk</th>';
    html += '<th style="padding: 10px 12px; text-align: left; font-weight: 600; color: #334155;">Category</th>';
    html += '<th style="padding: 10px 12px; text-align: center; font-weight: 600; color: #334155;">Score</th>';
    html += '<th style="padding: 10px 12px; text-align: center; font-weight: 600; color: #334155;">Level</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    for (var i = 0; i < topRisks.length; i++) {
      var risk = topRisks[i];
      var score = computeRiskScore(risk);
      var level = getRiskLevel(score);
      var levelColor = getRiskLevelColor(level);

      html += '<tr style="border-bottom: 1px solid #f1f5f9;">';
      html += '<td style="padding: 10px 12px;">';
      html += '<div style="font-weight: 500; color: #1e293b;">' + ERM.utils.escapeHtml(risk.title || 'Untitled Risk') + '</div>';
      if (risk.owner) {
        html += '<div style="font-size: 11px; color: #94a3b8;">Owner: ' + ERM.utils.escapeHtml(risk.owner) + '</div>';
      }
      html += '</td>';
      html += '<td style="padding: 10px 12px; color: #64748b;">' + ERM.utils.escapeHtml(risk.category || 'Uncategorized') + '</td>';
      html += '<td style="padding: 10px 12px; text-align: center; font-weight: 600;">' + score.toFixed(0) + '</td>';
      html += '<td style="padding: 10px 12px; text-align: center;">';
      html += '<span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; background: ' + levelColor + '20; color: ' + levelColor + ';">' + level.charAt(0).toUpperCase() + level.slice(1) + '</span>';
      html += '</td>';
      html += '</tr>';
    }

    html += '</tbody>';
    html += '</table>';

    return html;
  };

  /**
   * Render Category Chart embed for Editor V2
   */
  ERM.reports.renderCategoryChart = function(registerId) {
    var risks = getRisksByRegister(registerId);

    // Group by category
    var categories = {};
    for (var i = 0; i < risks.length; i++) {
      var cat = risks[i].category || 'Uncategorized';
      if (!categories[cat]) {
        categories[cat] = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
      }
      categories[cat].total++;
      var score = computeRiskScore(risks[i]);
      var level = getRiskLevel(score);
      categories[cat][level]++;
    }

    var catList = Object.keys(categories);
    if (catList.length === 0) {
      return '<div class="embed-empty" style="padding: 24px; text-align: center; color: #94a3b8;">No categories found</div>';
    }

    var maxCount = 0;
    for (var c = 0; c < catList.length; c++) {
      if (categories[catList[c]].total > maxCount) {
        maxCount = categories[catList[c]].total;
      }
    }

    var html = '<div class="embed-category-chart" style="display: flex; flex-direction: column; gap: 12px;">';

    for (var j = 0; j < catList.length; j++) {
      var catName = catList[j];
      var catData = categories[catName];
      var barWidth = maxCount > 0 ? (catData.total / maxCount) * 100 : 0;

      html += '<div style="display: flex; align-items: center; gap: 12px;">';
      html += '<div style="width: 120px; font-size: 12px; color: #334155; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + ERM.utils.escapeHtml(catName) + '</div>';
      html += '<div style="flex: 1; height: 24px; background: #f1f5f9; border-radius: 4px; overflow: hidden; display: flex;">';

      // Stacked bar
      if (catData.critical > 0) {
        var critW = (catData.critical / catData.total) * barWidth;
        html += '<div style="width: ' + critW + '%; background: #dc2626;"></div>';
      }
      if (catData.high > 0) {
        var highW = (catData.high / catData.total) * barWidth;
        html += '<div style="width: ' + highW + '%; background: #f59e0b;"></div>';
      }
      if (catData.medium > 0) {
        var medW = (catData.medium / catData.total) * barWidth;
        html += '<div style="width: ' + medW + '%; background: #eab308;"></div>';
      }
      if (catData.low > 0) {
        var lowW = (catData.low / catData.total) * barWidth;
        html += '<div style="width: ' + lowW + '%; background: #22c55e;"></div>';
      }

      html += '</div>';
      html += '<div style="width: 30px; font-size: 12px; font-weight: 600; color: #64748b; text-align: right;">' + catData.total + '</div>';
      html += '</div>';
    }

    html += '</div>';

    return html;
  };

  /**
   * Render KPI Cards embed for Editor V2
   */
  ERM.reports.renderKPICards = function(registerId) {
    var risks = getRisksByRegister(registerId);
    var controls = ERM.storage.get('controls') || [];

    // Filter controls by register if needed
    if (registerId && registerId !== 'all') {
      controls = controls.filter(function(c) {
        return c.registerId === registerId;
      });
    }

    // Compute metrics
    var totalRisks = risks.length;
    var criticalRisks = 0;
    var highRisks = 0;
    var effectiveControls = 0;

    for (var i = 0; i < risks.length; i++) {
      var score = computeRiskScore(risks[i]);
      if (score >= 15) criticalRisks++;
      else if (score >= 10) highRisks++;
    }

    for (var j = 0; j < controls.length; j++) {
      if (controls[j].effectiveness === 'effective') {
        effectiveControls++;
      }
    }

    var controlEffectiveness = controls.length > 0 ? Math.round((effectiveControls / controls.length) * 100) : 0;

    var html = '<div class="embed-kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px;">';

    // Total Risks
    html += '<div style="background: #f8fafc; border-radius: 12px; padding: 16px; text-align: center;">';
    html += '<div style="font-size: 28px; font-weight: 700; color: #1e293b;">' + totalRisks + '</div>';
    html += '<div style="font-size: 12px; color: #64748b; margin-top: 4px;">Total Risks</div>';
    html += '</div>';

    // Critical Risks
    html += '<div style="background: #fef2f2; border-radius: 12px; padding: 16px; text-align: center;">';
    html += '<div style="font-size: 28px; font-weight: 700; color: #dc2626;">' + criticalRisks + '</div>';
    html += '<div style="font-size: 12px; color: #dc2626; margin-top: 4px;">Critical Risks</div>';
    html += '</div>';

    // High Risks
    html += '<div style="background: #fffbeb; border-radius: 12px; padding: 16px; text-align: center;">';
    html += '<div style="font-size: 28px; font-weight: 700; color: #f59e0b;">' + highRisks + '</div>';
    html += '<div style="font-size: 12px; color: #f59e0b; margin-top: 4px;">High Risks</div>';
    html += '</div>';

    // Control Effectiveness
    html += '<div style="background: #f0fdf4; border-radius: 12px; padding: 16px; text-align: center;">';
    html += '<div style="font-size: 28px; font-weight: 700; color: #22c55e;">' + controlEffectiveness + '%</div>';
    html += '<div style="font-size: 12px; color: #22c55e; margin-top: 4px;">Control Effectiveness</div>';
    html += '</div>';

    html += '</div>';

    return html;
  };

  /**
   * Render Risk Register embed for Editor V2
   */
  ERM.reports.renderRiskRegister = function(registerId, limit) {
    limit = limit || 20;
    var risks = getRisksByRegister(registerId);

    if (risks.length === 0) {
      return '<div class="embed-empty" style="padding: 24px; text-align: center; color: #94a3b8;">No risks in register</div>';
    }

    var html = '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
    html += '<thead>';
    html += '<tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">';
    html += '<th style="padding: 8px; text-align: left; font-weight: 600;">ID</th>';
    html += '<th style="padding: 8px; text-align: left; font-weight: 600;">Risk Title</th>';
    html += '<th style="padding: 8px; text-align: left; font-weight: 600;">Category</th>';
    html += '<th style="padding: 8px; text-align: center; font-weight: 600;">Inherent</th>';
    html += '<th style="padding: 8px; text-align: center; font-weight: 600;">Residual</th>';
    html += '<th style="padding: 8px; text-align: left; font-weight: 600;">Owner</th>';
    html += '<th style="padding: 8px; text-align: left; font-weight: 600;">Status</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    var displayRisks = risks.slice(0, limit);
    for (var i = 0; i < displayRisks.length; i++) {
      var risk = displayRisks[i];
      var inherentScore = computeRiskScore(risk);
      var residualScore = (parseFloat(risk.residualLikelihood) || parseFloat(risk.inherentLikelihood) || 3) *
                          (parseFloat(risk.residualImpact) || parseFloat(risk.inherentImpact) || 3);
      var inherentLevel = getRiskLevel(inherentScore);
      var residualLevel = getRiskLevel(residualScore);

      html += '<tr style="border-bottom: 1px solid #f1f5f9;">';
      html += '<td style="padding: 8px; color: #64748b;">' + ERM.utils.escapeHtml(risk.reference || 'R' + (i + 1)) + '</td>';
      html += '<td style="padding: 8px; font-weight: 500;">' + ERM.utils.escapeHtml(risk.title || 'Untitled') + '</td>';
      html += '<td style="padding: 8px; color: #64748b;">' + ERM.utils.escapeHtml(risk.category || '-') + '</td>';
      html += '<td style="padding: 8px; text-align: center;"><span style="padding: 2px 6px; border-radius: 4px; font-size: 11px; background: ' + getRiskLevelColor(inherentLevel) + '20; color: ' + getRiskLevelColor(inherentLevel) + ';">' + inherentScore.toFixed(0) + '</span></td>';
      html += '<td style="padding: 8px; text-align: center;"><span style="padding: 2px 6px; border-radius: 4px; font-size: 11px; background: ' + getRiskLevelColor(residualLevel) + '20; color: ' + getRiskLevelColor(residualLevel) + ';">' + residualScore.toFixed(0) + '</span></td>';
      html += '<td style="padding: 8px; color: #64748b;">' + ERM.utils.escapeHtml(risk.owner || '-') + '</td>';
      html += '<td style="padding: 8px;">';
      var status = risk.status || 'open';
      var statusColor = status === 'closed' ? '#22c55e' : status === 'mitigating' ? '#3b82f6' : '#64748b';
      html += '<span style="font-size: 11px; color: ' + statusColor + ';">' + status.charAt(0).toUpperCase() + status.slice(1) + '</span>';
      html += '</td>';
      html += '</tr>';
    }

    html += '</tbody>';
    html += '</table>';

    if (risks.length > limit) {
      html += '<div style="text-align: center; padding: 8px; font-size: 11px; color: #94a3b8;">Showing ' + limit + ' of ' + risks.length + ' risks</div>';
    }

    return html;
  };

  /**
   * Render Controls embed for Editor V2
   */
  ERM.reports.renderControls = function(registerId, limit) {
    limit = limit || 15;
    var controls = ERM.storage.get('controls') || [];

    // Filter by register if needed
    if (registerId && registerId !== 'all') {
      controls = controls.filter(function(c) {
        return c.registerId === registerId;
      });
    }

    if (controls.length === 0) {
      return '<div class="embed-empty" style="padding: 24px; text-align: center; color: #94a3b8;">No controls found</div>';
    }

    var html = '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
    html += '<thead>';
    html += '<tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">';
    html += '<th style="padding: 8px; text-align: left; font-weight: 600;">ID</th>';
    html += '<th style="padding: 8px; text-align: left; font-weight: 600;">Control Name</th>';
    html += '<th style="padding: 8px; text-align: left; font-weight: 600;">Type</th>';
    html += '<th style="padding: 8px; text-align: center; font-weight: 600;">Effectiveness</th>';
    html += '<th style="padding: 8px; text-align: left; font-weight: 600;">Owner</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    var displayControls = controls.slice(0, limit);
    for (var i = 0; i < displayControls.length; i++) {
      var ctrl = displayControls[i];
      var effColor = ctrl.effectiveness === 'effective' ? '#22c55e' :
                     ctrl.effectiveness === 'partially-effective' ? '#f59e0b' : '#dc2626';

      html += '<tr style="border-bottom: 1px solid #f1f5f9;">';
      html += '<td style="padding: 8px; color: #64748b;">' + ERM.utils.escapeHtml(ctrl.reference || 'C' + (i + 1)) + '</td>';
      html += '<td style="padding: 8px; font-weight: 500;">' + ERM.utils.escapeHtml(ctrl.name || 'Untitled Control') + '</td>';
      html += '<td style="padding: 8px; color: #64748b;">' + ERM.utils.escapeHtml(ctrl.type || '-') + '</td>';
      html += '<td style="padding: 8px; text-align: center;">';
      html += '<span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; background: ' + effColor + '20; color: ' + effColor + ';">';
      html += (ctrl.effectiveness || 'Not assessed').replace(/-/g, ' ');
      html += '</span>';
      html += '</td>';
      html += '<td style="padding: 8px; color: #64748b;">' + ERM.utils.escapeHtml(ctrl.owner || '-') + '</td>';
      html += '</tr>';
    }

    html += '</tbody>';
    html += '</table>';

    if (controls.length > limit) {
      html += '<div style="text-align: center; padding: 8px; font-size: 11px; color: #94a3b8;">Showing ' + limit + ' of ' + controls.length + ' controls</div>';
    }

    return html;
  };

  // ========================================
  // AUTO-INITIALIZATION
  // ========================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      ERM.reports.init();
    });
  } else {
    ERM.reports.init();
  }

})();

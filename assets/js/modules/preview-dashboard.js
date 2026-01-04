/**
 * Preview Dashboard Module
 * Shows a static dummy dashboard for first-time users
 * Displays behind welcome popup to show what they can build
 * ES5 Compatible
 */

if (!window.ERM) window.ERM = {};

ERM.previewDashboard = {

  /**
   * Track if preview is currently active
   */
  _isActive: false,
  _boundHandlers: null,

  /**
   * Check if preview should be shown
   */
  shouldShowPreview: function() {
    // Only show for first-time users who haven't seen the welcome popup
    try {
      var hasSeenWelcome = localStorage.getItem('ERM_ftux_seen_welcome') === 'true';
      var registers = ERM.storage ? ERM.storage.get('registers') : [];
      var risks = ERM.storage ? ERM.storage.get('risks') : [];
      var isFirstTime = (!registers || registers.length === 0) && (!risks || risks.length === 0);

      return isFirstTime && !hasSeenWelcome;
    } catch (e) {
      return false;
    }
  },

  /**
   * Show the preview dashboard with welcome popup
   */
  show: function() {
    if (!this.shouldShowPreview()) return;
    if (this._isActive) return; // Already showing

    var self = this;
    this._isActive = true;

    // Inject preview dashboard into the dashboard content area
    var dashboardContent = document.getElementById('dashboard-content');
    if (dashboardContent) {
      dashboardContent.innerHTML = this.buildPreviewHTML();
    }

    // Create the overlay (darkened layer between dashboard and popup)
    var overlay = document.createElement('div');
    overlay.className = 'preview-overlay';
    overlay.id = 'preview-overlay';
    document.body.appendChild(overlay);

    // Create the welcome popup
    var popup = document.createElement('div');
    popup.className = 'preview-welcome-popup';
    popup.id = 'preview-welcome-popup';
    popup.innerHTML = this.buildWelcomePopupHTML();
    document.body.appendChild(popup);

    // Animate in
    setTimeout(function() {
      overlay.classList.add('active');
      popup.classList.add('active');
    }, 50);

    // Bind dismiss events - click anywhere outside popup dismisses
    this.bindDismissEvents();
  },

  /**
   * Bind events to dismiss the preview
   */
  bindDismissEvents: function() {
    var self = this;
    var overlay = document.getElementById('preview-overlay');

    // Store handlers so we can remove them later
    this._boundHandlers = {
      navHandler: function() {
        if (self._isActive) {
          self.dismissFully();
        }
      },
      escHandler: function(e) {
        if (e.key === 'Escape' && self._isActive) {
          var popupExists = document.getElementById('preview-welcome-popup');
          if (popupExists) {
            self.closePopupOnly();
          } else {
            self.dismissFully();
          }
        }
      },
      navItems: [],
      headerItems: []
    };

    // Click on overlay (outside popup) - just close popup, keep preview to explore
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (self._isActive) {
          self.closePopupOnly();
        }
      });
    }

    // Click on sidebar nav items - fully dismiss preview and switch to real app
    var navItems = document.querySelectorAll('.nav-item, .sidebar-nav a, [data-view]');
    for (var i = 0; i < navItems.length; i++) {
      navItems[i].addEventListener('click', this._boundHandlers.navHandler);
      this._boundHandlers.navItems.push(navItems[i]);
    }

    // Click on header items - fully dismiss preview
    var headerItems = document.querySelectorAll('.header-profile, .header-notifications, .header-team, .header-btn');
    for (var j = 0; j < headerItems.length; j++) {
      headerItems[j].addEventListener('click', this._boundHandlers.navHandler);
      this._boundHandlers.headerItems.push(headerItems[j]);
    }

    // Escape key handler
    document.addEventListener('keydown', this._boundHandlers.escHandler);

    // Popup buttons
    var primaryBtn = document.getElementById('preview-primary-btn');
    var closeBtn = document.getElementById('preview-close-btn');

    if (primaryBtn) {
      // "Get Started" - close popup but keep preview dashboard visible
      // Only navigation to another module dismisses the preview
      primaryBtn.addEventListener('click', function() {
        self.closePopupOnly();
      });
    }

    if (closeBtn) {
      // X close button - same behavior as Get Started
      closeBtn.addEventListener('click', function() {
        self.closePopupOnly();
      });
    }
  },

  /**
   * Remove all bound event listeners
   */
  unbindDismissEvents: function() {
    if (!this._boundHandlers) return;

    // Remove nav item listeners
    for (var i = 0; i < this._boundHandlers.navItems.length; i++) {
      this._boundHandlers.navItems[i].removeEventListener('click', this._boundHandlers.navHandler);
    }

    // Remove header item listeners
    for (var j = 0; j < this._boundHandlers.headerItems.length; j++) {
      this._boundHandlers.headerItems[j].removeEventListener('click', this._boundHandlers.navHandler);
    }

    // Remove escape handler
    document.removeEventListener('keydown', this._boundHandlers.escHandler);

    this._boundHandlers = null;
  },

  /**
   * Close just the popup and overlay - keep preview dashboard for exploring
   */
  closePopupOnly: function() {
    var overlay = document.getElementById('preview-overlay');
    var popup = document.getElementById('preview-welcome-popup');

    // Mark as no longer active - preview is dismissed (even if dashboard still shows)
    this._isActive = false;

    // Mark welcome as seen so it doesn't show again
    try {
      localStorage.setItem('ERM_ftux_seen_welcome', 'true');
    } catch (e) {}

    // Clean up event listeners to prevent interference with other modules
    this.unbindDismissEvents();

    // Animate out
    if (overlay) overlay.classList.remove('active');
    if (popup) popup.classList.remove('active');

    // Remove popup and overlay after animation, but keep preview dashboard
    setTimeout(function() {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
    }, 300);

    // Make preview dashboard interactive (remove pointer-events: none)
    var dashboardContent = document.getElementById('dashboard-content');
    if (dashboardContent) {
      var previewShell = dashboardContent.querySelector('.dashboard-shell.preview-mode');
      if (previewShell) {
        previewShell.classList.add('preview-exploring');
      }
    }
  },

  /**
   * Fully dismiss the preview and show empty dashboard
   */
  dismissFully: function() {
    // Only dismiss if actually active
    if (!this._isActive) return;

    var self = this;
    var overlay = document.getElementById('preview-overlay');
    var popup = document.getElementById('preview-welcome-popup');

    // Mark as no longer active immediately to prevent re-entry
    this._isActive = false;

    // Mark as seen
    try {
      localStorage.setItem('ERM_ftux_seen_welcome', 'true');
    } catch (e) {}

    // Clean up event listeners
    this.unbindDismissEvents();

    // Animate out
    if (overlay) overlay.classList.remove('active');
    if (popup) popup.classList.remove('active');

    // Remove elements after animation
    setTimeout(function() {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (popup && popup.parentNode) popup.parentNode.removeChild(popup);

      // Render the real (empty) dashboard
      if (ERM.dashboard && ERM.dashboard.render) {
        ERM.dashboard.render();
      }
    }, 300);
  },

  /**
   * Legacy dismiss function - calls dismissFully
   */
  dismiss: function() {
    this.dismissFully();
  },

  /**
   * Build the welcome popup HTML
   */
  buildWelcomePopupHTML: function() {
    var closeIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<line x1="18" y1="6" x2="6" y2="18"></line>' +
      '<line x1="6" y1="6" x2="18" y2="18"></line>' +
      '</svg>';

    return '<div class="preview-popup-content">' +
      '<button type="button" class="preview-close-btn" id="preview-close-btn" aria-label="Close">' + closeIcon + '</button>' +
      '<div class="preview-popup-icon">' +
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
      '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>' +
      '<polyline points="9 22 9 12 15 12 15 22"></polyline>' +
      '</svg>' +
      '</div>' +
      '<h2 class="preview-popup-title">Welcome to your risk workspace</h2>' +
      '<p class="preview-popup-body">' +
      'This is what your dashboard will look like once you start adding risks and controls.' +
      '</p>' +
      '<div class="preview-ai-badge">' +
      '<svg class="preview-ai-sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
      '<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/>' +
      '</svg>' +
      '<span>AI-assisted insights available</span>' +
      '</div>' +
      '<div class="preview-popup-actions">' +
      '<button type="button" class="preview-btn preview-btn-primary" id="preview-primary-btn">Get Started</button>' +
      '</div>' +
      '<p class="preview-popup-hint">Click anywhere outside to explore the app</p>' +
      '</div>';
  },

  /**
   * Build the preview dashboard HTML with dummy data
   */
  buildPreviewHTML: function() {
    return '<div class="dashboard-shell preview-mode">' +
      '<div class="dashboard-main">' +
      this.buildPreviewFilters() +
      this.buildPreviewSituation() +
      this.buildPreviewKPIs() +
      this.buildPreviewHeatmaps() +
      this.buildPreviewCategories() +
      this.buildPreviewControls() +
      this.buildPreviewTopRisks() +
      this.buildPreviewActivity() +
      '</div>' +
      '</div>';
  },

  /**
   * Preview: Register filter
   */
  buildPreviewFilters: function() {
    return '<div class="dashboard-filters">' +
      '<div class="filter-group">' +
      '<label class="filter-label">Select Risk Register</label>' +
      '<select class="filter-select" disabled>' +
      '<option>All Risk Registers (12 risks)</option>' +
      '</select>' +
      '</div>' +
      '</div>';
  },

  /**
   * Preview: Situation overview
   */
  buildPreviewSituation: function() {
    return '<div class="situation-overview">' +
      '<div class="situation-pill situation-green">' +
      '<span class="situation-count">0</span>' +
      '<span class="situation-label">High risks with no owner</span>' +
      '</div>' +
      '<div class="situation-pill situation-amber">' +
      '<span class="situation-count">2</span>' +
      '<span class="situation-label">Risks showing no reduction</span>' +
      '</div>' +
      '<div class="situation-pill situation-green">' +
      '<span class="situation-count">0/3</span>' +
      '<span class="situation-label">Critical risks not reviewed</span>' +
      '</div>' +
      '</div>';
  },

  /**
   * Preview: KPI cards
   */
  buildPreviewKPIs: function() {
    return '<div class="dashboard-kpis">' +
      '<div class="kpi-card">' +
      '<div class="kpi-value">12</div>' +
      '<div class="kpi-label">Total Risks</div>' +
      '</div>' +
      '<div class="kpi-card kpi-critical">' +
      '<div class="kpi-value">3</div>' +
      '<div class="kpi-label">Critical Risks</div>' +
      '</div>' +
      '<div class="kpi-card kpi-high">' +
      '<div class="kpi-value">5</div>' +
      '<div class="kpi-label">High Risks</div>' +
      '</div>' +
      '<div class="kpi-card">' +
      '<div class="kpi-value">14.2</div>' +
      '<div class="kpi-label">Avg Inherent</div>' +
      '</div>' +
      '<div class="kpi-card">' +
      '<div class="kpi-value">8.6</div>' +
      '<div class="kpi-label">Avg Residual</div>' +
      '</div>' +
      '</div>';
  },

  /**
   * Preview: Heat maps
   */
  buildPreviewHeatmaps: function() {
    return '<div class="dashboard-section">' +
      '<div class="heatmaps-container">' +
      '<div class="heatmap-card">' +
      '<h3 class="heatmap-title">Inherent Risk (Before Controls)</h3>' +
      '<div class="heatmap-grid">' + this.buildPreviewHeatmapGrid('inherent') + '</div>' +
      '</div>' +
      '<div class="heatmap-card">' +
      '<h3 class="heatmap-title">Residual Risk (After Controls)</h3>' +
      '<div class="heatmap-grid">' + this.buildPreviewHeatmapGrid('residual') + '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  },

  /**
   * Build a preview heatmap grid
   */
  buildPreviewHeatmapGrid: function(type) {
    var html = '<div class="heatmap-y-label"><span>Likelihood</span></div>';
    html += '<div class="heatmap-grid-inner">';

    // Sample risk positions for inherent vs residual
    var inherentRisks = [
      {l: 5, i: 5}, {l: 5, i: 4}, {l: 4, i: 5},
      {l: 4, i: 4}, {l: 4, i: 3}, {l: 3, i: 4},
      {l: 3, i: 3}, {l: 3, i: 2}, {l: 2, i: 3},
      {l: 2, i: 2}, {l: 2, i: 1}, {l: 1, i: 2}
    ];
    var residualRisks = [
      {l: 3, i: 3}, {l: 3, i: 2}, {l: 2, i: 3},
      {l: 2, i: 2}, {l: 2, i: 2}, {l: 2, i: 1},
      {l: 1, i: 2}, {l: 1, i: 2}, {l: 1, i: 1},
      {l: 1, i: 1}, {l: 1, i: 1}, {l: 1, i: 1}
    ];
    var risks = type === 'inherent' ? inherentRisks : residualRisks;

    // Risk level labels
    var riskLabels = ['', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];

    for (var l = 5; l >= 1; l--) {
      for (var i = 1; i <= 5; i++) {
        var score = l * i;
        var colorClass = this.getHeatmapColor(score);
        var riskCount = 0;
        for (var r = 0; r < risks.length; r++) {
          if (risks[r].l === l && risks[r].i === i) riskCount++;
        }
        html += '<div class="heatmap-cell ' + colorClass + '">';
        if (riskCount > 0) {
          var tooltip = riskCount + ' risk' + (riskCount > 1 ? 's' : '') + ' - Likelihood: ' + riskLabels[l] + ', Impact: ' + riskLabels[i];
          html += '<div class="heatmap-dot" data-tooltip="' + tooltip + '">' + riskCount + '</div>';
        }
        html += '</div>';
      }
    }

    html += '</div>';
    html += '<div class="heatmap-x-label">Impact</div>';
    return html;
  },

  /**
   * Get heatmap color class
   */
  getHeatmapColor: function(score) {
    if (score >= 20) return 'heatmap-critical';
    if (score >= 15) return 'heatmap-high';
    if (score >= 10) return 'heatmap-medium';
    if (score >= 5) return 'heatmap-low';
    return 'heatmap-minimal';
  },

  /**
   * Preview: Risk categories
   */
  buildPreviewCategories: function() {
    var categories = [
      { name: 'Operational', count: 4, width: 80 },
      { name: 'Strategic', count: 3, width: 60 },
      { name: 'Financial', count: 2, width: 40 },
      { name: 'Compliance', count: 2, width: 40 },
      { name: 'Technology', count: 1, width: 20 }
    ];

    var html = '<div class="dashboard-section">' +
      '<h3 class="section-title">Risk Concentration by Category</h3>' +
      '<div class="category-chart">';

    for (var i = 0; i < categories.length; i++) {
      var cat = categories[i];
      html += '<div class="category-row">' +
        '<span class="category-name">' + cat.name + '</span>' +
        '<div class="category-bar-wrapper">' +
        '<div class="category-bar" style="width: ' + cat.width + '%"></div>' +
        '</div>' +
        '<span class="category-count">' + cat.count + '</span>' +
        '</div>';
    }

    html += '</div></div>';
    return html;
  },

  /**
   * Preview: Control coverage
   */
  buildPreviewControls: function() {
    return '<div class="dashboard-section">' +
      '<h3 class="section-title">Control Coverage</h3>' +
      '<div class="control-cards">' +
      '<div class="control-card" data-tooltip="Risks with no controls assigned">' +
      '<div class="control-card-value" style="color: #dc2626;">2</div>' +
      '<div class="control-card-label">No Controls</div>' +
      '</div>' +
      '<div class="control-card" data-tooltip="Risks with only directive controls">' +
      '<div class="control-card-value" style="color: #d97706;">3</div>' +
      '<div class="control-card-label">Directive Only</div>' +
      '</div>' +
      '<div class="control-card" data-tooltip="Risks with detective controls">' +
      '<div class="control-card-value" style="color: #2563eb;">2</div>' +
      '<div class="control-card-label">Detective Only</div>' +
      '</div>' +
      '<div class="control-card" data-tooltip="Risks with preventive controls">' +
      '<div class="control-card-value" style="color: #16a34a;">5</div>' +
      '<div class="control-card-label">Preventive</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  },

  /**
   * Preview: Top risks table
   */
  buildPreviewTopRisks: function() {
    var risks = [
      { title: 'Data breach from external attack', category: 'Technology', score: 20, level: 'Critical', control: 'Preventive' },
      { title: 'Regulatory non-compliance penalty', category: 'Compliance', score: 16, level: 'High', control: 'Detective' },
      { title: 'Key supplier failure', category: 'Operational', score: 15, level: 'High', control: 'Directive' },
      { title: 'Currency exchange fluctuation', category: 'Financial', score: 12, level: 'Medium', control: 'None' },
      { title: 'Staff turnover in critical roles', category: 'Operational', score: 10, level: 'Medium', control: 'Preventive' }
    ];

    var html = '<div class="dashboard-section">' +
      '<h3 class="section-title">Top Risks by Residual Score</h3>' +
      '<div class="top-risks-table">' +
      '<table>' +
      '<thead><tr>' +
      '<th>Risk</th>' +
      '<th>Category</th>' +
      '<th>Score</th>' +
      '<th>Level</th>' +
      '<th>Control</th>' +
      '</tr></thead>' +
      '<tbody>';

    for (var i = 0; i < risks.length; i++) {
      var r = risks[i];
      var levelClass = r.level.toLowerCase();
      html += '<tr>' +
        '<td class="risk-title">' + r.title + '</td>' +
        '<td>' + r.category + '</td>' +
        '<td class="risk-score risk-' + levelClass + '">' + r.score + '</td>' +
        '<td><span class="risk-badge risk-badge-' + levelClass + '">' + r.level + '</span></td>' +
        '<td>' + r.control + '</td>' +
        '</tr>';
    }

    html += '</tbody></table></div></div>';
    return html;
  },

  /**
   * Preview: Recent activity
   */
  buildPreviewActivity: function() {
    var activities = [
      { user: 'Sarah Chen', action: 'added risk', entity: 'Data breach from external attack', time: '2h ago' },
      { user: 'James Wilson', action: 'linked control', entity: 'Access Management Policy', time: '3h ago' },
      { user: 'Sarah Chen', action: 'created register', entity: 'IT Risk Register', time: '4h ago' },
      { user: 'Michael Brown', action: 'updated risk', entity: 'Regulatory non-compliance', time: '5h ago' }
    ];

    var html = '<div class="dashboard-section">' +
      '<h3 class="section-title">Recent Activity</h3>' +
      '<div class="recent-activity-list">';

    for (var i = 0; i < activities.length; i++) {
      var a = activities[i];
      html += '<div class="activity-item">' +
        '<div class="activity-dot"></div>' +
        '<div class="activity-content">' +
        '<span class="activity-user">' + a.user + '</span> ' +
        '<span class="activity-action">' + a.action + '</span> ' +
        '<span class="activity-entity">' + a.entity + '</span>' +
        '</div>' +
        '<span class="activity-time">' + a.time + '</span>' +
        '</div>';
    }

    html += '</div></div>';
    return html;
  }

};

console.log('Preview Dashboard module loaded');

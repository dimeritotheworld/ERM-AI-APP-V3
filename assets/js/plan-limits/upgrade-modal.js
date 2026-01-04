/**
 * Dimeri ERM - Upgrade Modal
 * UI for showing plan limit upgrade prompts
 */

(function() {
  'use strict';

  // Initialize ERM namespace
  window.ERM = window.ERM || {};

  /**
   * Upgrade Modal
   */
  ERM.upgradeModal = {
    currentSource: null,
    currentFeature: null,

    /**
     * Show upgrade modal
     * @param {object} options - Modal options
     */
    show: function(options) {
      console.log('[UpgradeModal] show() called with options:', options);
      options = options || {};

      var feature = options.feature || '';
      var message = options.message || 'You\'ve reached the limit on the free plan.';
      var upgradeMessage = options.upgradeMessage || 'Upgrade to continue.';
      var current = options.current;
      var limit = options.limit;
      var source = options.source || this.getSourceFromFeature(feature);

      // Store source and feature for upgrade action
      this.currentSource = source;
      this.currentFeature = feature;

      // Track analytics
      if (typeof ERM.upgradeAnalytics !== 'undefined') {
        ERM.upgradeAnalytics.trackModalShown(source, feature);
      }

      console.log('[UpgradeModal] Building HTML...');
      console.log('[UpgradeModal] ERM.utils exists:', typeof ERM.utils !== 'undefined');
      console.log('[UpgradeModal] ERM.utils.escapeHtml exists:', typeof ERM.utils !== 'undefined' && typeof ERM.utils.escapeHtml === 'function');

      var html =
        '<div class="modal-overlay active" id="upgrade-modal-overlay">' +
        '<div class="modal upgrade-modal upgrade-modal-compact ai-limit-modal">' +
        '<button class="modal-close ai-modal-close" onclick="ERM.upgradeModal.close()">&times;</button>' +
        '<div class="ai-limit-content">' +
        '<div class="ai-limit-icon">' +
        '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/>' +
        '</svg>' +
        '<div class="ai-limit-pulse"></div>' +
        '</div>' +
        '<h2 class="ai-limit-title">AI Limit Reached</h2>' +
        '<p class="ai-limit-message">You\'ve used all <strong>50 AI suggestions</strong> on the free plan.</p>' +
        '<div class="ai-limit-features">' +
        '<div class="ai-feature-item">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
        '<span>Unlimited AI suggestions</span>' +
        '</div>' +
        '<div class="ai-feature-item">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
        '<span>Advanced AI features</span>' +
        '</div>' +
        '<div class="ai-feature-item">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
        '<span>Priority support</span>' +
        '</div>' +
        '</div>' +
        '<button class="btn-upgrade-primary" onclick="ERM.upgradeModal.upgrade()">' +
        '<span>Upgrade to Pro</span>' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="5 12 12 5 19 12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>' +
        '</button>' +
        '<button class="btn-cancel-link" onclick="ERM.upgradeModal.close()">Maybe later</button>' +
        '</div>' +
        '</div>' +
        '</div>';

      // Remove existing modal if any
      console.log('[UpgradeModal] Closing existing modal...');
      this.close();

      // Add modal to page
      console.log('[UpgradeModal] Adding modal to DOM...');
      var modalContainer = document.createElement('div');
      modalContainer.innerHTML = html;
      var modalElement = modalContainer.firstChild;
      console.log('[UpgradeModal] Modal element:', modalElement);
      document.body.appendChild(modalElement);
      console.log('[UpgradeModal] Modal appended to body');

      // Verify modal is in DOM
      var verifyModal = document.getElementById('upgrade-modal-overlay');
      console.log('[UpgradeModal] Modal in DOM:', verifyModal !== null);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Hide AI toolbar and panels if they exist (from report editor)
      if (typeof ERM.reportEditor !== 'undefined' && ERM.reportEditor.hideFloatingToolbar) {
        ERM.reportEditor.hideFloatingToolbar();
      }

      // Hide Ask AI panel if visible
      var askAiPanel = document.getElementById('ask-ai-panel');
      if (askAiPanel) {
        askAiPanel.classList.remove('visible');
      }

      // Hide AI actions panel if visible
      var aiActionsPanel = document.getElementById('ai-actions-panel');
      if (aiActionsPanel) {
        aiActionsPanel.classList.remove('visible');
      }

      console.log('[UpgradeModal] Modal display complete');
    },

    /**
     * Close upgrade modal
     */
    close: function() {
      var modal = document.getElementById('upgrade-modal-overlay');
      if (modal) {
        modal.remove();
      }

      // Restore body scroll
      document.body.style.overflow = '';
    },

    /**
     * Handle upgrade action
     */
    upgrade: function() {
      // Track upgrade click
      if (typeof ERM.upgradeAnalytics !== 'undefined') {
        ERM.upgradeAnalytics.trackUpgradeClicked(this.currentSource, this.currentFeature);
      }

      // Store upgrade source in session for checkout page
      sessionStorage.setItem('erm_upgradeSource', this.currentSource || 'unknown');
      sessionStorage.setItem('erm_upgradeFeature', this.currentFeature || '');

      this.close();

      // Redirect to pricing/upgrade page with source parameter
      var url = 'upgrade.html';
      if (this.currentSource) {
        url += '?source=' + encodeURIComponent(this.currentSource);
      }
      window.location.href = url;
    },

    /**
     * Get source from feature name
     */
    getSourceFromFeature: function(feature) {
      var featureLower = (feature || '').toLowerCase();

      if (featureLower.indexOf('ai') !== -1) {
        if (featureLower.indexOf('ask') !== -1) return 'ai_ask';
        if (featureLower.indexOf('action') !== -1) return 'ai_actions';
        if (featureLower.indexOf('review') !== -1) return 'ai_review';
        if (featureLower.indexOf('control') !== -1) return 'ai_control';
        if (featureLower.indexOf('report') !== -1) return 'ai_report';
        return 'ai_limit';
      }

      if (featureLower.indexOf('csv') !== -1 || featureLower.indexOf('excel') !== -1) {
        return 'export_limit';
      }

      if (featureLower.indexOf('risk') !== -1) return 'risk_limit';
      if (featureLower.indexOf('control') !== -1) return 'control_limit';

      return 'general';
    },

    /**
     * Show export format blocked modal
     * @param {string} format - Blocked format (excel, csv)
     */
    showExportBlocked: function(format) {
      var formatName = format.toUpperCase();
      var source = 'export_' + format.toLowerCase();
      var feature = formatName + ' Export';

      // Store source for analytics
      this.currentSource = source;
      this.currentFeature = feature;

      // Track analytics
      if (typeof ERM.upgradeAnalytics !== 'undefined') {
        ERM.upgradeAnalytics.trackModalShown(source, feature);
      }

      var html =
        '<div class="modal-overlay active" id="upgrade-modal-overlay">' +
        '<div class="modal upgrade-modal">' +
        '<div class="modal-header">' +
        '<div class="modal-icon upgrade-icon">📊</div>' +
        '<h2 class="modal-title">' + formatName + ' Export Not Available</h2>' +
        '<button class="modal-close" onclick="ERM.upgradeModal.close()">&times;</button>' +
        '</div>' +
        '<div class="modal-body">' +
        '<div class="upgrade-message">' +
        '<p class="upgrade-message-main">' + formatName + ' export is not available on the free plan.</p>' +
        '<p class="upgrade-message-sub">Upgrade to Pro to export to Excel and CSV formats.</p>' +
        '</div>' +
        '<div class="export-options">' +
        '<div class="export-option available">' +
        '<div class="export-icon">📄</div>' +
        '<div class="export-name">PDF</div>' +
        '<div class="export-status">✓ Available</div>' +
        '</div>' +
        '<div class="export-option blocked">' +
        '<div class="export-icon">📊</div>' +
        '<div class="export-name">Excel</div>' +
        '<div class="export-status">Pro Plan</div>' +
        '</div>' +
        '<div class="export-option blocked">' +
        '<div class="export-icon">📋</div>' +
        '<div class="export-name">CSV</div>' +
        '<div class="export-status">Pro Plan</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button class="btn btn-secondary" onclick="ERM.upgradeModal.close()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="ERM.upgradeModal.upgrade()">Upgrade to Pro</button>' +
        '</div>' +
        '</div>' +
        '</div>';

      // Remove existing modal
      this.close();

      // Add modal
      var modalContainer = document.createElement('div');
      modalContainer.innerHTML = html;
      document.body.appendChild(modalContainer.firstChild);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    },

    /**
     * Show inline limit warning
     * @param {string} containerId - Container element ID
     * @param {string} feature - Feature name
     */
    showInlineWarning: function(containerId, feature) {
      var container = document.getElementById(containerId);
      if (!container) return;

      var banner = ERM.enforcement.getWarningBanner(feature);
      if (banner) {
        var warningDiv = document.createElement('div');
        warningDiv.innerHTML = banner;
        container.insertBefore(warningDiv.firstChild, container.firstChild);
      }
    },

    /**
     * Remove inline warning
     * @param {string} containerId - Container element ID
     */
    removeInlineWarning: function(containerId) {
      var container = document.getElementById(containerId);
      if (!container) return;

      var banner = container.querySelector('.plan-limit-banner');
      if (banner) {
        banner.remove();
      }
    }
  };

  console.log('Upgrade Modal loaded');
})();

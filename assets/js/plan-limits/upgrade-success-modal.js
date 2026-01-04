/**
 * Dimeri ERM - Upgrade Success Modal
 * Shows success message when user upgrades and returns to app
 */

(function() {
  'use strict';

  // Initialize ERM namespace
  window.ERM = window.ERM || {};

  /**
   * Upgrade Success Modal
   */
  ERM.upgradeSuccessModal = {
    /**
     * Check if user just upgraded and show modal
     */
    checkAndShow: function() {
      var urlParams = new URLSearchParams(window.location.search);
      var upgradeParam = urlParams.get('upgrade');

      if (upgradeParam === 'success') {
        // Remove parameter from URL without reloading
        var newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);

        // Show success modal
        this.show();
      }
    },

    /**
     * Show upgrade success modal
     */
    show: function() {
      var plan = localStorage.getItem('ERM_plan') || 'PRO';
      var teamSize = localStorage.getItem('ERM_teamSize') || '3';
      var upgradeSource = localStorage.getItem('ERM_upgradeSource') || 'unknown';
      var upgradeFeature = localStorage.getItem('ERM_upgradeFeature') || '';

      console.log('[UpgradeSuccess] Showing success modal for', plan, 'with', teamSize, 'seats');
      console.log('[UpgradeSuccess] Upgraded from:', upgradeSource, '-', upgradeFeature);

      var html =
        '<div class="modal-overlay active" id="upgrade-success-overlay">' +
        '<div class="modal upgrade-modal upgrade-success-modal">' +
        '<div class="success-content">' +
        '<div class="success-icon-wrapper">' +
        '<div class="success-icon">' +
        '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>' +
        '<polyline points="22 4 12 14.01 9 11.01"/>' +
        '</svg>' +
        '</div>' +
        '<div class="success-pulse"></div>' +
        '</div>' +
        '<h2 class="success-title">Welcome to ' + plan.charAt(0) + plan.slice(1).toLowerCase() + '!</h2>' +
        '<p class="success-message">Your account has been successfully upgraded. You now have access to all Pro features.</p>' +
        '<div class="unlocked-features">' +
        '<div class="feature-item">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">' +
        '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>' +
        '</svg>' +
        '<span>Unlimited AI suggestions</span>' +
        '</div>' +
        '<div class="feature-item">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>' +
        '<circle cx="9" cy="7" r="4"/>' +
        '<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>' +
        '<path d="M16 3.13a4 4 0 0 1 0 7.75"/>' +
        '</svg>' +
        '<span>Team collaboration (' + teamSize + ' seats)</span>' +
        '</div>' +
        '<div class="feature-item">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
        '<polyline points="14 2 14 8 20 8"/>' +
        '</svg>' +
        '<span>CSV & Excel import/export</span>' +
        '</div>' +
        '</div>' +
        '<button class="btn-success-primary" onclick="ERM.upgradeSuccessModal.close()">' +
        '<span>Get Started</span>' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<line x1="5" y1="12" x2="19" y2="12"/>' +
        '<polyline points="12 5 19 12 12 19"/>' +
        '</svg>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '</div>';

      // Add modal to page
      var modalContainer = document.createElement('div');
      modalContainer.innerHTML = html;
      document.body.appendChild(modalContainer.firstChild);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Update AI counter display if it exists
      if (typeof ERM.aiCounter !== 'undefined' && ERM.aiCounter.updateDisplay) {
        // Reset AI count for new plan
        localStorage.setItem('erm_aiCallCount', '0');
        localStorage.setItem('erm_aiCallsMonth', new Date().getMonth().toString());

        setTimeout(function() {
          ERM.aiCounter.updateDisplay();
        }, 100);
      }
    },

    /**
     * Close success modal
     */
    close: function() {
      var modal = document.getElementById('upgrade-success-overlay');
      if (modal) {
        modal.remove();
      }

      // Restore body scroll
      document.body.style.overflow = '';

      // Clear upgrade markers
      localStorage.removeItem('ERM_upgradeSource');
      localStorage.removeItem('ERM_upgradeFeature');
    }
  };

  // Auto-check on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      ERM.upgradeSuccessModal.checkAndShow();
    });
  } else {
    // DOM already loaded
    setTimeout(function() {
      ERM.upgradeSuccessModal.checkAndShow();
    }, 100);
  }

  console.log('Upgrade Success Modal loaded');
})();

/**
 * Dimeri ERM - Plan Limits Integration
 * Hooks into existing functionality to enforce plan limits
 */

(function() {
  'use strict';

  // Initialize ERM namespace
  window.ERM = window.ERM || {};

  /**
   * Plan Limits Integration
   * Wraps existing functions with enforcement checks
   */
  ERM.planLimitsIntegration = {
    /**
     * Initialize plan limits integration
     */
    init: function() {
      console.log('Initializing plan limits integration...');

      // Wait for DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', this.setup.bind(this));
      } else {
        this.setup();
      }
    },

    /**
     * Setup integrations
     */
    setup: function() {
      // Wrap existing functions with enforcement
      this.wrapRiskRegisterCreation();
      this.wrapRiskCreation();
      this.wrapControlCreation();
      this.wrapReportGeneration();
      this.wrapExportFunctions();
      this.wrapTeamInvitations();

      // Add usage indicators to UI
      this.addUsageIndicators();

      console.log('Plan limits integration complete');
    },

    /**
     * Wrap risk register creation
     */
    wrapRiskRegisterCreation: function() {
      var self = this;

      // Intercept clicks on "New Risk Register" buttons
      document.addEventListener('click', function(e) {
        var target = e.target;

        // Check if clicked element or its parent is a "New Risk Register" button
        if (target.classList.contains('btn-primary') ||
            (target.closest && target.closest('.btn-primary'))) {

          var button = target.classList.contains('btn-primary') ? target : target.closest('.btn-primary');
          var buttonText = button.textContent.trim();

          // Check if this is the "New Risk Register" button
          if (buttonText.includes('New Risk Register') ||
              buttonText.includes('Create Risk Register') ||
              buttonText.includes('Create Register')) {

            // Check if we can create
            var check = ERM.enforcement.canCreateRiskRegister();
            if (!check.allowed) {
              e.preventDefault();
              e.stopPropagation();
              ERM.enforcement.blockAction(check);
              return false;
            }
          }
        }
      }, true); // Use capture phase to intercept early
    },

    /**
     * Wrap risk creation
     */
    wrapRiskCreation: function() {
      var self = this;

      // Intercept risk creation attempts
      document.addEventListener('click', function(e) {
        var target = e.target;
        var button = target.classList.contains('btn') ? target : (target.closest && target.closest('.btn'));

        if (button) {
          var buttonText = button.textContent.trim();

          // Check if this is an "Add Risk" or "New Risk" button
          if (buttonText.includes('Add Risk') ||
              buttonText.includes('New Risk') ||
              buttonText.includes('Create Risk')) {

            var check = ERM.enforcement.canCreateRisk();
            if (!check.allowed) {
              e.preventDefault();
              e.stopPropagation();
              ERM.enforcement.blockAction(check);
              return false;
            }
          }
        }
      }, true);
    },

    /**
     * Wrap control creation
     */
    wrapControlCreation: function() {
      var self = this;

      // Intercept control creation attempts
      document.addEventListener('click', function(e) {
        var target = e.target;
        var button = target.classList.contains('btn') ? target : (target.closest && target.closest('.btn'));

        if (button) {
          var buttonText = button.textContent.trim();

          if (buttonText.includes('Add Control') ||
              buttonText.includes('New Control') ||
              buttonText.includes('Create Control')) {

            var check = ERM.enforcement.canCreateControl();
            if (!check.allowed) {
              e.preventDefault();
              e.stopPropagation();
              ERM.enforcement.blockAction(check);
              return false;
            }
          }
        }
      }, true);
    },

    /**
     * Wrap report generation
     */
    wrapReportGeneration: function() {
      var self = this;

      document.addEventListener('click', function(e) {
        var target = e.target;
        var button = target.classList.contains('btn') ? target : (target.closest && target.closest('.btn'));

        if (button) {
          var buttonText = button.textContent.trim();

          if (buttonText.includes('Generate Report') ||
              buttonText.includes('Create Report')) {

            var check = ERM.enforcement.canGenerateReport();
            if (!check.allowed) {
              e.preventDefault();
              e.stopPropagation();
              ERM.enforcement.blockAction(check);
              return false;
            }
          }
        }
      }, true);
    },

    /**
     * Wrap export functions
     */
    wrapExportFunctions: function() {
      var self = this;

      // Intercept export button clicks
      document.addEventListener('click', function(e) {
        var target = e.target;

        // Check for export buttons or options
        if (target.classList.contains('export-option') ||
            target.closest && target.closest('.export-option')) {

          var option = target.classList.contains('export-option') ?
                      target : target.closest('.export-option');

          var format = option.getAttribute('data-format');

          if (format === 'excel' || format === 'csv') {
            var check = ERM.enforcement.canExport(format);
            if (!check.allowed) {
              e.preventDefault();
              e.stopPropagation();
              ERM.upgradeModal.showExportBlocked(format);
              return false;
            }
          }
        }

        // Also check button text
        var button = target.classList.contains('btn') ? target : (target.closest && target.closest('.btn'));
        if (button) {
          var buttonText = button.textContent.trim().toLowerCase();

          if (buttonText.includes('excel') || buttonText.includes('csv')) {
            var format = buttonText.includes('excel') ? 'excel' : 'csv';
            var check = ERM.enforcement.canExport(format);

            if (!check.allowed) {
              e.preventDefault();
              e.stopPropagation();
              ERM.upgradeModal.showExportBlocked(format);
              return false;
            }
          }
        }
      }, true);
    },

    /**
     * Wrap team invitations
     */
    wrapTeamInvitations: function() {
      var self = this;

      document.addEventListener('click', function(e) {
        var target = e.target;
        var button = target.classList.contains('btn') ? target : (target.closest && target.closest('.btn'));

        if (button) {
          var buttonText = button.textContent.trim();

          if (buttonText.includes('Invite') || buttonText.includes('Add Member')) {
            var check = ERM.enforcement.canInviteMembers();
            if (!check.allowed) {
              e.preventDefault();
              e.stopPropagation();
              ERM.enforcement.blockAction(check);
              return false;
            }
          }
        }
      }, true);
    },

    /**
     * Add usage indicators to UI
     */
    addUsageIndicators: function() {
      // This will be called periodically to update usage displays
      this.updateUsageIndicators();

      // Update every 5 seconds
      setInterval(this.updateUsageIndicators.bind(this), 5000);
    },

    /**
     * Update usage indicators
     */
    updateUsageIndicators: function() {
      // Add usage indicator to risk register list if visible
      var registerListHeader = document.querySelector('.content-header');
      if (registerListHeader && !document.getElementById('register-usage-indicator')) {
        this.addRegisterUsageIndicator(registerListHeader);
      }

      // Update existing indicators
      this.updateRegisterUsageIndicator();
    },

    /**
     * Add risk register usage indicator
     */
    addRegisterUsageIndicator: function(container) {
      var status = ERM.enforcement.getStatus('riskRegisters');

      var indicator = document.createElement('div');
      indicator.id = 'register-usage-indicator';
      indicator.className = 'usage-indicator';
      indicator.style.marginTop = '12px';

      var percentage = status.percentage;
      var fillClass = status.isAtLimit ? 'at-limit' : (status.isNearLimit ? 'near-limit' : '');
      var textClass = status.isAtLimit ? 'at-limit' : '';

      indicator.innerHTML =
        '<span class="usage-indicator-text ' + textClass + '">Risk Registers: ' +
        status.current + ' / ' + status.limit + '</span>' +
        '<div class="usage-indicator-bar">' +
        '<div class="usage-indicator-fill ' + fillClass + '" style="width: ' + percentage + '%;"></div>' +
        '</div>';

      container.appendChild(indicator);
    },

    /**
     * Update risk register usage indicator
     */
    updateRegisterUsageIndicator: function() {
      var indicator = document.getElementById('register-usage-indicator');
      if (!indicator) return;

      var status = ERM.enforcement.getStatus('riskRegisters');
      var fill = indicator.querySelector('.usage-indicator-fill');
      var text = indicator.querySelector('.usage-indicator-text');

      if (fill) {
        fill.style.width = status.percentage + '%';
        fill.className = 'usage-indicator-fill ' +
                        (status.isAtLimit ? 'at-limit' : (status.isNearLimit ? 'near-limit' : ''));
      }

      if (text) {
        text.textContent = 'Risk Registers: ' + status.current + ' / ' + status.limit;
        text.className = 'usage-indicator-text ' + (status.isAtLimit ? 'at-limit' : '');
      }
    },

    /**
     * Show warning banner in container
     */
    showWarningBanner: function(containerId, feature) {
      var banner = ERM.enforcement.getWarningBanner(feature);
      if (!banner) return;

      var container = document.getElementById(containerId);
      if (!container) return;

      // Remove existing banner
      var existing = container.querySelector('.plan-limit-banner');
      if (existing) existing.remove();

      // Add new banner
      var div = document.createElement('div');
      div.innerHTML = banner;
      container.insertBefore(div.firstChild, container.firstChild);
    }
  };

  // Auto-initialize when script loads
  ERM.planLimitsIntegration.init();

  console.log('Plan Limits Integration loaded');
})();

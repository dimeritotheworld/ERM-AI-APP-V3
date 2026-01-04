/**
 * Dimeri ERM - Plan Enforcement Logic
 * Hard enforcement of plan limits at UI and data layers
 */

(function() {
  'use strict';

  // Initialize ERM namespace
  window.ERM = window.ERM || {};

  /**
   * Plan Enforcement
   */
  ERM.enforcement = {
    /**
     * Check if user can create a risk register
     * @returns {object} {allowed: boolean, reason: string}
     */
    canCreateRiskRegister: function() {
      if (this.isAdminOverride()) {
        return { allowed: true };
      }

      if (ERM.usageTracker.isAtLimit('riskRegisters')) {
        var usage = ERM.usageTracker.getUsage();
        var limits = ERM.usageTracker.getLimits();

        return {
          allowed: false,
          reason: 'limit_reached',
          feature: 'riskRegisters',
          current: usage.riskRegisters,
          limit: limits.riskRegisters,
          message: 'You\'ve created ' + usage.riskRegisters + ' of ' + limits.riskRegisters + ' risk registers.',
          upgradeMessage: 'Upgrade to create unlimited risk registers.'
        };
      }

      return { allowed: true };
    },

    /**
     * Check if user can create a risk
     * @returns {object} {allowed: boolean, reason: string}
     */
    canCreateRisk: function() {
      if (this.isAdminOverride()) {
        return { allowed: true };
      }

      if (ERM.usageTracker.isAtLimit('risks')) {
        var usage = ERM.usageTracker.getUsage();
        var limits = ERM.usageTracker.getLimits();

        return {
          allowed: false,
          reason: 'limit_reached',
          feature: 'risks',
          current: usage.risks,
          limit: limits.risks,
          message: 'You\'ve reached the maximum number of risks on the free plan.',
          upgradeMessage: 'Upgrade to create unlimited risks.'
        };
      }

      return { allowed: true };
    },

    /**
     * Check if user can create a control
     * @returns {object} {allowed: boolean, reason: string}
     */
    canCreateControl: function() {
      if (this.isAdminOverride()) {
        return { allowed: true };
      }

      if (ERM.usageTracker.isAtLimit('controls')) {
        var usage = ERM.usageTracker.getUsage();
        var limits = ERM.usageTracker.getLimits();

        return {
          allowed: false,
          reason: 'limit_reached',
          feature: 'controls',
          current: usage.controls,
          limit: limits.controls,
          message: 'You\'ve created ' + usage.controls + ' of ' + limits.controls + ' controls.',
          upgradeMessage: 'Upgrade to create unlimited controls.'
        };
      }

      return { allowed: true };
    },

    /**
     * Check if user can generate a report
     * @returns {object} {allowed: boolean, reason: string}
     */
    canGenerateReport: function() {
      if (this.isAdminOverride()) {
        return { allowed: true };
      }

      if (ERM.usageTracker.isAtLimit('reports')) {
        var usage = ERM.usageTracker.getUsage();
        var limits = ERM.usageTracker.getLimits();

        return {
          allowed: false,
          reason: 'limit_reached',
          feature: 'reports',
          current: usage.reports,
          limit: limits.reports,
          message: 'You\'ve generated ' + usage.reports + ' of ' + limits.reports + ' reports.',
          upgradeMessage: 'Upgrade to generate unlimited reports.'
        };
      }

      return { allowed: true };
    },

    /**
     * Check if user can export in a format
     * @param {string} format - Export format (pdf, excel, csv)
     * @returns {object} {allowed: boolean, reason: string}
     */
    canExport: function(format) {
      if (this.isAdminOverride()) {
        return { allowed: true };
      }

      if (!ERM.usageTracker.canExport(format)) {
        return {
          allowed: false,
          reason: 'feature_blocked',
          feature: 'export_' + format,
          message: format.toUpperCase() + ' export is not available on the free plan.',
          upgradeMessage: 'Upgrade to export to Excel and CSV formats.'
        };
      }

      return { allowed: true };
    },

    /**
     * Check if user can invite team members
     * @returns {object} {allowed: boolean, reason: string}
     */
    canInviteMembers: function() {
      if (this.isAdminOverride()) {
        return { allowed: true };
      }

      if (ERM.usageTracker.isAtLimit('teamMembers')) {
        var usage = ERM.usageTracker.getUsage();
        var limits = ERM.usageTracker.getLimits();

        return {
          allowed: false,
          reason: 'limit_reached',
          feature: 'teamMembers',
          current: usage.teamMembers,
          limit: limits.teamMembers,
          message: 'You\'ve added ' + usage.teamMembers + ' of ' + limits.teamMembers + ' team members.',
          upgradeMessage: 'Upgrade to add more team members.'
        };
      }

      return { allowed: true };
    },

    /**
     * Check if user can use AI suggestions
     * @returns {object} {allowed: boolean, reason: string, isSoftCap: boolean}
     */
    canUseAI: function() {
      console.log('[Enforcement] canUseAI called');

      if (this.isAdminOverride()) {
        console.log('[Enforcement] Admin override active');
        return { allowed: true };
      }

      var usage = ERM.usageTracker.getUsage();
      var limits = ERM.usageTracker.getLimits();

      console.log('[Enforcement] Usage:', usage.aiCalls, 'Limit:', limits.aiCalls);

      // Hard cap - block when limit reached
      if (usage.aiCalls >= limits.aiCalls) {
        console.log('[Enforcement] AI LIMIT REACHED - Blocking!');
        return {
          allowed: false, // Block usage
          isSoftCap: true, // Keep this flag for upgrade modal detection
          reason: 'limit_reached',
          feature: 'aiCalls',
          current: usage.aiCalls,
          limit: limits.aiCalls,
          message: 'You\'ve used ' + usage.aiCalls + ' of ' + limits.aiCalls + ' AI suggestions this month.',
          upgradeMessage: 'Upgrade for unlimited AI suggestions.'
        };
      }

      console.log('[Enforcement] AI allowed');
      return { allowed: true };
    },

    /**
     * Check if admin override is enabled
     * @returns {boolean} True if admin can override
     */
    isAdminOverride: function() {
      // Check if user is platform admin
      var user = ERM.state.user;
      if (user && user.isPlatformAdmin) {
        return true;
      }

      // Check for override flag in workspace
      var workspace = ERM.state.workspace;
      if (workspace && workspace.limitsOverride) {
        return true;
      }

      return false;
    },

    /**
     * Block action and show upgrade modal
     * @param {object} result - Enforcement result
     */
    blockAction: function(result) {
      if (!result || result.allowed) return;

      // Show upgrade modal
      if (typeof ERM.upgradeModal !== 'undefined' && ERM.upgradeModal.show) {
        ERM.upgradeModal.show({
          feature: result.feature,
          message: result.message,
          upgradeMessage: result.upgradeMessage,
          current: result.current,
          limit: result.limit
        });
      } else {
        console.error('[Enforcement] upgradeModal not available');
        // Fallback to toast if modal not available
        if (typeof ERM.toast !== 'undefined') {
          ERM.toast.error(result.message + ' ' + result.upgradeMessage);
        }
      }
    },

    /**
     * Validate before creating item
     * @param {string} type - Item type (riskRegister, risk, control, report)
     * @returns {boolean} True if can create
     */
    validateCreate: function(type) {
      var result;

      switch (type) {
        case 'riskRegister':
          result = this.canCreateRiskRegister();
          break;
        case 'risk':
          result = this.canCreateRisk();
          break;
        case 'control':
          result = this.canCreateControl();
          break;
        case 'report':
          result = this.canGenerateReport();
          break;
        default:
          return true;
      }

      if (!result.allowed) {
        this.blockAction(result);
        return false;
      }

      return true;
    },

    /**
     * Validate before export
     * @param {string} format - Export format
     * @returns {boolean} True if can export
     */
    validateExport: function(format) {
      var result = this.canExport(format);

      if (!result.allowed) {
        this.blockAction(result);
        return false;
      }

      return true;
    },

    /**
     * Get enforcement status for UI
     * @param {string} feature - Feature name
     * @returns {object} Status object
     */
    getStatus: function(feature) {
      var usage = ERM.usageTracker.getUsage();
      var limits = ERM.usageTracker.getLimits();
      var isAtLimit = ERM.usageTracker.isAtLimit(feature);
      var percentage = ERM.usageTracker.getUsagePercentage(feature);

      return {
        current: usage[feature],
        limit: limits[feature],
        remaining: ERM.usageTracker.getRemaining(feature),
        percentage: percentage,
        isAtLimit: isAtLimit,
        isNearLimit: percentage >= 80 && !isAtLimit,
        canCreate: !isAtLimit || this.isAdminOverride()
      };
    },

    /**
     * Get warning banner for feature
     * @param {string} feature - Feature name
     * @returns {string|null} HTML for warning banner or null
     */
    getWarningBanner: function(feature) {
      var status = this.getStatus(feature);
      var plan = ERM.usageTracker.getPlan();

      // For FREE plan, always show counter banner
      if (plan === 'FREE' && status.limit !== -1) {
        var bannerClass = 'plan-limit-banner';
        var icon = 'ℹ️';
        var title = '';
        var upgradeBtn = '';

        if (status.isAtLimit) {
          bannerClass += ' limit-reached';
          icon = '⚠️';
          title = '<div class="banner-title">Free plan limit reached</div>';
          upgradeBtn = '<button class="banner-btn" onclick="ERM.upgradeModal.show()">Upgrade</button>';
        } else if (status.isNearLimit) {
          bannerClass += ' limit-warning';
          title = '<div class="banner-title">Approaching limit</div>';
        } else {
          bannerClass += ' limit-info';
        }

        return '<div class="' + bannerClass + '">' +
          '<div class="banner-icon">' + icon + '</div>' +
          '<div class="banner-content">' +
          title +
          '<div class="banner-text">' + status.current + ' of ' + status.limit + ' ' + ERM.planLimits.getFeatureName(feature).toLowerCase() + ' used.</div>' +
          '</div>' +
          upgradeBtn +
          '</div>';
      }

      return null;
    }
  };

  console.log('Plan Enforcement loaded');
})();

/**
 * Dimeri ERM - Usage Tracker
 * Track workspace usage against plan limits
 */

(function() {
  'use strict';

  // Initialize ERM namespace
  window.ERM = window.ERM || {};

  /**
   * Usage Tracker
   */
  ERM.usageTracker = {
    /**
     * Get current workspace usage
     * @returns {object} Usage object
     */
    getUsage: function() {
      // Count risk registers (uses 'registers' key, not 'erm_riskRegisters')
      var riskRegisters = ERM.storage.get('registers') || [];

      // Count total risks - check both 'risks' key and register-specific keys
      var totalRisks = 0;
      var globalRisks = ERM.storage.get('risks') || [];
      totalRisks = globalRisks.length;

      // Also check register-specific keys if no global risks found
      if (totalRisks === 0) {
        for (var i = 0; i < riskRegisters.length; i++) {
          var risks = ERM.storage.get('risks_' + riskRegisters[i].id) || [];
          totalRisks += risks.length;
        }
      }

      // Count controls (uses 'controls' key, not 'erm_controls')
      var controls = ERM.storage.get('controls') || [];

      // Count reports (uses 'recentReports' key from reports module)
      var reports = ERM.storage.get('recentReports') || [];

      // Count team members
      var members = ERM.storage.get('workspaceMembers') || [];
      var currentUser = ERM.state.user;
      var teamMembers = members.length + (currentUser ? 1 : 0); // Include owner

      // Calculate storage used
      var storage = this.calculateStorageUsed();

      // Get AI calls count (matches ai-counter.js key)
      var aiCalls = ERM.storage.get('erm_aiCallCount') || 0;

      return {
        riskRegisters: riskRegisters.length,
        risks: totalRisks,
        controls: controls.length,
        reports: reports.length,
        teamMembers: teamMembers,
        storage: storage,
        aiCalls: aiCalls
      };
    },

    /**
     * Get empty usage object
     * @returns {object} Empty usage
     */
    getEmptyUsage: function() {
      return {
        riskRegisters: 0,
        risks: 0,
        controls: 0,
        reports: 0,
        teamMembers: 0,
        storage: 0,
        aiCalls: 0
      };
    },

    /**
     * Calculate storage used in KB
     * @returns {number} Storage in KB
     */
    calculateStorageUsed: function() {
      var total = 0;
      for (var key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('erm_')) {
          total += localStorage[key].length + key.length;
        }
      }
      // Convert to KB
      return Math.round(total / 1024);
    },

    /**
     * Get workspace plan
     * @returns {string} Plan name (FREE, PRO, ENTERPRISE)
     */
    getPlan: function() {
      var workspace = ERM.state.workspace;
      if (!workspace) return 'FREE';
      return workspace.plan || 'FREE';
    },

    /**
     * Get plan limits for current workspace
     * @returns {object} Plan limits
     */
    getLimits: function() {
      var plan = this.getPlan();
      return ERM.planLimits.getLimits(plan);
    },

    /**
     * Check if feature is at limit
     * @param {string} feature - Feature name
     * @returns {boolean} True if at or over limit
     */
    isAtLimit: function(feature) {
      var usage = this.getUsage();
      var limits = this.getLimits();

      // If unlimited, never at limit
      if (limits[feature] === -1) return false;

      // Check if at or over limit
      return usage[feature] >= limits[feature];
    },

    /**
     * Check if feature is over limit
     * @param {string} feature - Feature name
     * @returns {boolean} True if over limit
     */
    isOverLimit: function(feature) {
      var usage = this.getUsage();
      var limits = this.getLimits();

      // If unlimited, never over limit
      if (limits[feature] === -1) return false;

      // Check if over limit
      return usage[feature] > limits[feature];
    },

    /**
     * Get remaining capacity for a feature
     * @param {string} feature - Feature name
     * @returns {number} Remaining capacity (or -1 for unlimited)
     */
    getRemaining: function(feature) {
      var usage = this.getUsage();
      var limits = this.getLimits();

      // If unlimited, return -1
      if (limits[feature] === -1) return -1;

      // Calculate remaining
      var remaining = limits[feature] - usage[feature];
      return Math.max(0, remaining);
    },

    /**
     * Get usage percentage for a feature
     * @param {string} feature - Feature name
     * @returns {number} Percentage (0-100)
     */
    getUsagePercentage: function(feature) {
      var usage = this.getUsage();
      var limits = this.getLimits();

      // If unlimited, return 0
      if (limits[feature] === -1) return 0;

      // Calculate percentage
      if (limits[feature] === 0) return 0;
      return Math.round((usage[feature] / limits[feature]) * 100);
    },

    /**
     * Check if workspace is over any limit
     * @returns {boolean} True if over any limit
     */
    isWorkspaceOverLimit: function() {
      var features = ['riskRegisters', 'risks', 'controls', 'reports', 'storage'];
      for (var i = 0; i < features.length; i++) {
        if (this.isOverLimit(features[i])) {
          return true;
        }
      }
      return false;
    },

    /**
     * Get all features that are at limit
     * @returns {array} Array of feature names
     */
    getFeaturesAtLimit: function() {
      var features = ['riskRegisters', 'risks', 'controls', 'reports', 'teamMembers', 'storage'];
      var atLimit = [];

      for (var i = 0; i < features.length; i++) {
        if (this.isAtLimit(features[i])) {
          atLimit.push(features[i]);
        }
      }

      return atLimit;
    },

    /**
     * Increment AI calls counter
     */
    incrementAICalls: function() {
      var count = ERM.storage.get('erm_aiCallsCount') || 0;
      count++;
      ERM.storage.set('erm_aiCallsCount', count);
      return count;
    },

    /**
     * Reset AI calls counter (monthly reset)
     */
    resetAICalls: function() {
      ERM.storage.set('erm_aiCallsCount', 0);
    },

    /**
     * Check if export format is allowed
     * @param {string} format - Export format (pdf, excel, csv)
     * @returns {boolean} True if allowed
     */
    canExport: function(format) {
      var limits = this.getLimits();
      if (!limits.exports) return false;
      return limits.exports[format.toLowerCase()] === true;
    },

    /**
     * Get usage summary for display
     * @returns {object} Usage summary with display text
     */
    getUsageSummary: function() {
      var usage = this.getUsage();
      var limits = this.getLimits();
      var plan = this.getPlan();

      return {
        plan: plan,
        planDisplayName: ERM.planLimits.getPlanDisplayName(plan),
        usage: usage,
        limits: limits,
        features: {
          riskRegisters: {
            name: 'Risk Registers',
            current: usage.riskRegisters,
            limit: limits.riskRegisters,
            percentage: this.getUsagePercentage('riskRegisters'),
            atLimit: this.isAtLimit('riskRegisters')
          },
          risks: {
            name: 'Risks',
            current: usage.risks,
            limit: limits.risks,
            percentage: this.getUsagePercentage('risks'),
            atLimit: this.isAtLimit('risks')
          },
          controls: {
            name: 'Controls',
            current: usage.controls,
            limit: limits.controls,
            percentage: this.getUsagePercentage('controls'),
            atLimit: this.isAtLimit('controls')
          },
          reports: {
            name: 'Reports',
            current: usage.reports,
            limit: limits.reports,
            percentage: this.getUsagePercentage('reports'),
            atLimit: this.isAtLimit('reports')
          },
          teamMembers: {
            name: 'Team Members',
            current: usage.teamMembers,
            limit: limits.teamMembers,
            percentage: this.getUsagePercentage('teamMembers'),
            atLimit: this.isAtLimit('teamMembers')
          }
        }
      };
    }
  };

  console.log('Usage Tracker loaded');
})();

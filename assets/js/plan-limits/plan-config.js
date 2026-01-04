/**
 * Dimeri ERM - Plan Limits Configuration
 * Free plan limits and enforcement rules
 */

(function() {
  'use strict';

  // Initialize ERM namespace
  window.ERM = window.ERM || {};

  /**
   * Plan Limits Configuration
   */
  ERM.planLimits = {
    /**
     * Free plan limits (baseline)
     */
    FREE: {
      riskRegisters: 5,
      risks: 25,          // Total risks across all registers
      controls: 10,       // Total controls
      reports: 5,         // Generated reports
      teamMembers: 3,     // Users per workspace
      exports: {
        pdf: true,        // PDF export allowed
        excel: false,     // Excel blocked
        csv: false        // CSV blocked
      },
      storage: 50000,     // 50MB in KB
      aiCalls: 50         // TOTAL AI calls for entire FREE plan (not per month)
    },

    /**
     * Pro plan limits (for future)
     */
    PRO: {
      riskRegisters: -1,  // Unlimited
      risks: -1,
      controls: -1,
      reports: -1,
      teamMembers: 10,
      exports: {
        pdf: true,
        excel: true,
        csv: true
      },
      storage: 500000,    // 500MB
      aiCalls: -1         // Unlimited AI calls for PRO
    },

    /**
     * Enterprise plan limits (for future)
     */
    ENTERPRISE: {
      riskRegisters: -1,  // Unlimited
      risks: -1,
      controls: -1,
      reports: -1,
      teamMembers: -1,    // Unlimited
      exports: {
        pdf: true,
        excel: true,
        csv: true
      },
      storage: -1,        // Unlimited
      aiCalls: -1         // Unlimited
    },

    /**
     * Get limits for a plan
     * @param {string} planName - Plan name (FREE, PRO, ENTERPRISE)
     * @returns {object} Plan limits
     */
    getLimits: function(planName) {
      planName = (planName || 'FREE').toUpperCase();
      return this[planName] || this.FREE;
    },

    /**
     * Check if a feature is unlimited for a plan
     * @param {string} planName - Plan name
     * @param {string} feature - Feature name
     * @returns {boolean} True if unlimited
     */
    isUnlimited: function(planName, feature) {
      var limits = this.getLimits(planName);
      return limits[feature] === -1;
    },

    /**
     * Get friendly limit text
     * @param {number} limit - Limit number
     * @returns {string} Display text
     */
    getLimitText: function(limit) {
      if (limit === -1) return 'Unlimited';
      return limit.toString();
    },

    /**
     * Get plan display name
     * @param {string} planName - Plan name
     * @returns {string} Display name
     */
    getPlanDisplayName: function(planName) {
      var names = {
        FREE: 'Free Plan',
        PRO: 'Pro Plan',
        ENTERPRISE: 'Enterprise Plan'
      };
      return names[planName] || 'Free Plan';
    },

    /**
     * Feature display names
     */
    featureNames: {
      riskRegisters: 'Risk Registers',
      risks: 'Risks',
      controls: 'Controls',
      reports: 'Reports',
      teamMembers: 'Team Members',
      storage: 'Storage',
      aiCalls: 'AI Suggestions'
    },

    /**
     * Get feature display name
     * @param {string} feature - Feature key
     * @returns {string} Display name
     */
    getFeatureName: function(feature) {
      return this.featureNames[feature] || feature;
    }
  };

  console.log('Plan Limits Config loaded');
})();

/**
 * Dimeri ERM - Upgrade Analytics Tracker
 * Tracks how users are upgrading (AI limit, CSV export, etc.)
 */

(function() {
  'use strict';

  // Initialize ERM namespace
  window.ERM = window.ERM || {};

  /**
   * Upgrade Analytics Tracker
   */
  ERM.upgradeAnalytics = {
    /**
     * Track upgrade event
     * @param {object} data - Analytics data
     */
    track: function(data) {
      var event = {
        timestamp: new Date().toISOString(),
        source: data.source || 'unknown',
        feature: data.feature || '',
        plan: data.plan || 'PRO',
        userId: this.getUserId(),
        sessionId: this.getSessionId()
      };

      console.log('[UpgradeAnalytics] Tracking event:', event);

      // Store event in localStorage
      this.storeEvent(event);

      // Send to analytics endpoint (if available)
      this.sendToEndpoint(event);
    },

    /**
     * Track upgrade modal shown
     * @param {string} source - Source of the upgrade modal (e.g., 'ai_limit', 'csv_export')
     * @param {string} feature - Specific feature that triggered it
     */
    trackModalShown: function(source, feature) {
      this.track({
        source: source,
        feature: feature,
        action: 'modal_shown'
      });
    },

    /**
     * Track upgrade button clicked
     * @param {string} source - Source of the upgrade
     */
    trackUpgradeClicked: function(source, feature) {
      this.track({
        source: source,
        feature: feature,
        action: 'upgrade_clicked'
      });
    },

    /**
     * Track successful upgrade
     * @param {string} plan - Plan upgraded to
     * @param {string} source - Source that led to upgrade
     */
    trackUpgradeSuccess: function(plan, source, feature) {
      this.track({
        source: source,
        feature: feature,
        plan: plan,
        action: 'upgrade_success'
      });
    },

    /**
     * Get or create user ID
     */
    getUserId: function() {
      var userId = localStorage.getItem('erm_userId');
      if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(7);
        localStorage.setItem('erm_userId', userId);
      }
      return userId;
    },

    /**
     * Get or create session ID
     */
    getSessionId: function() {
      var sessionId = sessionStorage.getItem('erm_sessionId');
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(7);
        sessionStorage.setItem('erm_sessionId', sessionId);
      }
      return sessionId;
    },

    /**
     * Store event in localStorage
     */
    storeEvent: function(event) {
      try {
        var events = JSON.parse(localStorage.getItem('erm_upgradeEvents') || '[]');
        events.push(event);

        // Keep only last 100 events
        if (events.length > 100) {
          events = events.slice(-100);
        }

        localStorage.setItem('erm_upgradeEvents', JSON.stringify(events));
      } catch (e) {
        console.error('[UpgradeAnalytics] Error storing event:', e);
      }
    },

    /**
     * Send event to analytics endpoint
     */
    sendToEndpoint: function(event) {
      // In production, this would send to your analytics service
      // For now, just log it
      console.log('[UpgradeAnalytics] Would send to endpoint:', event);

      // Example implementation:
      /*
      fetch('/api/analytics/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }).catch(function(err) {
        console.error('[UpgradeAnalytics] Failed to send event:', err);
      });
      */
    },

    /**
     * Get all stored events
     */
    getEvents: function() {
      try {
        return JSON.parse(localStorage.getItem('erm_upgradeEvents') || '[]');
      } catch (e) {
        console.error('[UpgradeAnalytics] Error getting events:', e);
        return [];
      }
    },

    /**
     * Get events by source
     */
    getEventsBySource: function(source) {
      var events = this.getEvents();
      return events.filter(function(event) {
        return event.source === source;
      });
    },

    /**
     * Get conversion stats
     */
    getConversionStats: function() {
      var events = this.getEvents();
      var stats = {
        modalShown: {},
        upgradeClicked: {},
        upgradeSuccess: {},
        conversionRate: {}
      };

      events.forEach(function(event) {
        var source = event.source;

        if (event.action === 'modal_shown') {
          stats.modalShown[source] = (stats.modalShown[source] || 0) + 1;
        } else if (event.action === 'upgrade_clicked') {
          stats.upgradeClicked[source] = (stats.upgradeClicked[source] || 0) + 1;
        } else if (event.action === 'upgrade_success') {
          stats.upgradeSuccess[source] = (stats.upgradeSuccess[source] || 0) + 1;
        }
      });

      // Calculate conversion rates
      Object.keys(stats.modalShown).forEach(function(source) {
        var shown = stats.modalShown[source] || 0;
        var success = stats.upgradeSuccess[source] || 0;
        stats.conversionRate[source] = shown > 0 ? (success / shown * 100).toFixed(2) + '%' : '0%';
      });

      return stats;
    }
  };

  console.log('Upgrade Analytics loaded');
})();

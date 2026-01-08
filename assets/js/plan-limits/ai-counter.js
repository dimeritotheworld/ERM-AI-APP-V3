/**
 * Dimeri ERM - AI Call Counter
 *
 * FREE PLAN: 50 total API calls (not per month, lifetime for FREE plan)
 * PRO/ENTERPRISE: Unlimited or higher limits
 */

(function() {
  'use strict';

  // Initialize ERM namespace
  window.ERM = window.ERM || {};

  /**
   * AI Call Counter
   */
  ERM.aiCounter = {
    /**
     * Get current AI call count
     * @returns {number} Current count
     */
    getCount: function() {
      var count = ERM.storage.get('erm_aiCallCount') || 0;
      return parseInt(count, 10);
    },

    /**
     * Get AI call limit for current plan
     * @returns {number} Limit (-1 for unlimited)
     */
    getLimit: function() {
      var plan = ERM.usageTracker ? ERM.usageTracker.getPlan() : 'FREE';
      var limits = ERM.planLimits.getLimits(plan);
      return limits.aiCalls;
    },

    /**
     * Increment AI call counter
     * @returns {object} { count, limit, remaining, allowed }
     */
    increment: function() {
      var count = this.getCount();
      var limit = this.getLimit();

      // Only increment if not at limit (cap at limit)
      if (limit === -1 || count < limit) {
        count++;
        ERM.storage.set('erm_aiCallCount', count);
      }

      // Calculate remaining
      var remaining = limit === -1 ? -1 : Math.max(0, limit - count);

      // Check if allowed to continue
      var allowed = limit === -1 || count <= limit;

      return {
        count: count,
        limit: limit,
        remaining: remaining,
        allowed: allowed,
        atLimit: !allowed
      };
    },

    /**
     * Check if can make AI call
     * @returns {object} { allowed, count, limit, remaining, message }
     */
    canMakeCall: function() {
      var count = this.getCount();
      var limit = this.getLimit();
      var plan = ERM.usageTracker ? ERM.usageTracker.getPlan() : 'FREE';

      // Unlimited for Pro/Enterprise
      if (limit === -1) {
        return {
          allowed: true,
          count: count,
          limit: -1,
          remaining: -1,
          unlimited: true
        };
      }

      // Check if over limit
      if (count >= limit) {
        return {
          allowed: false,
          count: count,
          limit: limit,
          remaining: 0,
          atLimit: true,
          message: 'You\'ve used all ' + limit + ' AI calls on the FREE plan.',
          upgradeMessage: 'Upgrade to Pro for unlimited AI assistance.'
        };
      }

      // Still have calls remaining
      return {
        allowed: true,
        count: count,
        limit: limit,
        remaining: limit - count
      };
    },

    /**
     * Get counter display text
     * Positive framing: shows remaining instead of used
     * @returns {string} Display text like "45 left"
     */
    getDisplayText: function() {
      var count = this.getCount();
      var limit = this.getLimit();

      if (limit === -1) {
        return 'Unlimited';  // Unlimited plan
      }

      var remaining = limit - count;
      return remaining + ' left';
    },

    /**
     * Get counter HTML badge
     * @returns {string} HTML badge
     */
    getCounterBadge: function() {
      var count = this.getCount();
      var limit = this.getLimit();

      if (limit === -1) {
        return '<span class="ai-counter-badge unlimited">' + count + '</span>';
      }

      var remaining = limit - count;
      var atLimit = count >= limit;
      var nearLimit = remaining <= 10 && remaining > 0;

      var className = 'ai-counter-badge';
      if (atLimit) {
        className += ' at-limit';
      } else if (nearLimit) {
        className += ' near-limit';
      }

      return '<span class="' + className + '">' + count + ' of ' + limit + '</span>';
    },

    /**
     * Reset counter (for testing or plan change)
     */
    reset: function() {
      ERM.storage.set('erm_aiCallCount', 0);
      console.log('AI call counter reset to 0');
    },

    /**
     * Show limit reached modal
     */
    showLimitModal: function() {
      if (!ERM.upgradeModal) {
        ERM.toast.error('AI call limit reached. Upgrade to Pro for unlimited AI assistance.');
        return;
      }

      ERM.upgradeModal.show({
        feature: 'aiCalls',
        message: 'You\'ve used all 50 AI calls on the FREE plan.',
        upgradeMessage: 'Upgrade to Pro for unlimited AI assistance and insights.',
        current: this.getCount(),
        limit: this.getLimit()
      });
    },

    /**
     * Update all counter displays on page
     */
    updateDisplays: function() {
      // Update floating AI button badge
      var floatingBadge = document.getElementById('floating-ai-counter');
      if (floatingBadge) {
        floatingBadge.innerHTML = this.getDisplayText();

        var count = this.getCount();
        var limit = this.getLimit();
        var remaining = limit - count;

        floatingBadge.className = 'floating-ai-counter';
        if (limit !== -1) {
          if (count >= limit) {
            floatingBadge.classList.add('at-limit');
          } else if (remaining <= 10) {
            floatingBadge.classList.add('near-limit');
          }
        }
      }

      // Update AI panel header counter
      var panelCounter = document.getElementById('floating-ai-header-counter');
      if (panelCounter) {
        panelCounter.innerHTML = this.getDisplayText();

        var count = this.getCount();
        var limit = this.getLimit();
        var remaining = limit - count;

        panelCounter.className = 'floating-ai-header-counter';
        if (limit !== -1) {
          if (count >= limit) {
            panelCounter.classList.add('at-limit');
          } else if (remaining <= 10) {
            panelCounter.classList.add('near-limit');
          }
        }
      }
    }
  };

  console.log('AI Counter loaded');
})();

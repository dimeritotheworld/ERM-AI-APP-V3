/**
 * Dimeri ERM - Upgrade Flow
 * Complete upgrade process from FREE to PRO/ENTERPRISE
 */

(function() {
  'use strict';

  // Initialize ERM namespace
  window.ERM = window.ERM || {};

  /**
   * Upgrade Flow Handler
   */
  ERM.upgradeFlow = {
    /**
     * Initialize upgrade flow
     * @param {string} targetPlan - Target plan (PRO or ENTERPRISE)
     */
    startUpgrade: function(targetPlan) {
      targetPlan = targetPlan || 'PRO';

      // Store target plan in session
      sessionStorage.setItem('erm_upgradeToPlan', targetPlan);

      // Get current workspace
      var workspace = ERM.state.workspace;
      if (!workspace) {
        ERM.toast.error('Please create a workspace first');
        return;
      }

      // Redirect to checkout page with plan parameter
      var checkoutUrl = 'checkout.html?plan=' + targetPlan.toLowerCase() + '&workspace=' + encodeURIComponent(workspace.id);
      window.location.href = checkoutUrl;
    },

    /**
     * Complete upgrade after successful payment
     * @param {string} plan - New plan (PRO or ENTERPRISE)
     * @param {object} paymentData - Payment confirmation data
     */
    completeUpgrade: function(plan, paymentData) {
      var workspace = ERM.state.workspace;
      if (!workspace) {
        console.error('No workspace found');
        return false;
      }

      // Update workspace plan
      workspace.plan = plan.toUpperCase();
      workspace.upgradedAt = new Date().toISOString();
      workspace.subscriptionId = paymentData.subscriptionId || null;
      workspace.paymentMethod = paymentData.paymentMethod || null;
      workspace.billingCycle = paymentData.billingCycle || 'monthly';

      // Save updated workspace
      ERM.storage.set('erm_currentWorkspace', workspace);

      // Update global state
      ERM.state.workspace = workspace;

      // Log upgrade event
      this.logUpgradeEvent(plan, paymentData);

      // Clear any upgrade session data
      sessionStorage.removeItem('erm_upgradeToPlan');

      // Show success notification
      this.showUpgradeSuccess(plan);

      return true;
    },

    /**
     * Simulate upgrade for testing (remove in production)
     */
    simulateUpgrade: function(plan) {
      plan = plan || 'PRO';

      var paymentData = {
        subscriptionId: 'sub_test_' + Date.now(),
        paymentMethod: 'card',
        billingCycle: 'monthly',
        amount: plan === 'PRO' ? 29 : 99,
        transactionId: 'txn_test_' + Date.now(),
        timestamp: new Date().toISOString()
      };

      var success = this.completeUpgrade(plan, paymentData);

      if (success) {
        console.log('✓ Simulated upgrade to ' + plan + ' plan');
        // Reload page to apply new limits
        setTimeout(function() {
          window.location.reload();
        }, 2000);
      }

      return success;
    },

    /**
     * Log upgrade event for analytics
     * @param {string} plan - New plan
     * @param {object} paymentData - Payment data
     */
    logUpgradeEvent: function(plan, paymentData) {
      var event = {
        type: 'plan_upgrade',
        plan: plan,
        previousPlan: 'FREE',
        timestamp: new Date().toISOString(),
        workspaceId: ERM.state.workspace ? ERM.state.workspace.id : null,
        userId: ERM.state.user ? ERM.state.user.id : null,
        subscriptionId: paymentData.subscriptionId,
        amount: paymentData.amount
      };

      // Get activity log
      var activityLog = ERM.storage.get('erm_activityLog') || [];

      // Add upgrade event
      activityLog.unshift(event);

      // Keep last 100 events
      if (activityLog.length > 100) {
        activityLog = activityLog.slice(0, 100);
      }

      // Save activity log
      ERM.storage.set('erm_activityLog', activityLog);
    },

    /**
     * Show upgrade success notification
     * @param {string} plan - New plan
     */
    showUpgradeSuccess: function(plan) {
      var planName = plan === 'PRO' ? 'Pro' : 'Enterprise';

      var html =
        '<div class="modal-overlay" id="upgrade-success-modal">' +
        '<div class="modal upgrade-modal">' +
        '<div class="modal-header" style="text-align: center; border-bottom: none; padding-bottom: 0;">' +
        '<div style="width: 80px; height: 80px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 24px rgba(34, 197, 94, 0.25);">' +
        '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
        '</div>' +
        '<h2 class="modal-title" style="margin: 0 0 12px 0;">Welcome to ' + planName + '!</h2>' +
        '<p style="color: var(--text-secondary); margin: 0; font-size: 15px; line-height: 1.6;">Your upgrade was successful. You now have access to all ' + planName + ' features.</p>' +
        '</div>' +
        '<div class="modal-body">' +
        '<div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #86efac;">' +
        '<div style="font-size: 14px; font-weight: 600; color: #166534; margin-bottom: 16px;">✨ Now Available:</div>' +
        '<div style="display: flex; flex-direction: column; gap: 12px;">' +
        '<div style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #166534;">' +
        '<div style="width: 24px; height: 24px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">✓</div>' +
        '<span>Unlimited Risk Registers & Risks</span>' +
        '</div>' +
        '<div style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #166534;">' +
        '<div style="width: 24px; height: 24px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">✓</div>' +
        '<span>Excel & CSV Exports (No Watermarks)</span>' +
        '</div>' +
        '<div style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #166534;">' +
        '<div style="width: 24px; height: 24px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">✓</div>' +
        '<span>10 Team Members</span>' +
        '</div>' +
        '<div style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #166534;">' +
        '<div style="width: 24px; height: 24px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">✓</div>' +
        '<span>Advanced Analytics & Reports</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button class="btn btn-primary" onclick="ERM.upgradeFlow.closeSuccessModal()" style="width: 100%;">Start Using ' + planName + ' Features</button>' +
        '</div>' +
        '</div>' +
        '</div>';

      // Add modal to page
      var modalContainer = document.createElement('div');
      modalContainer.innerHTML = html;
      document.body.appendChild(modalContainer.firstChild);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    },

    /**
     * Close success modal
     */
    closeSuccessModal: function() {
      var modal = document.getElementById('upgrade-success-modal');
      if (modal) {
        modal.remove();
      }
      document.body.style.overflow = '';

      // Reload page to apply new limits
      window.location.reload();
    },

    /**
     * Downgrade workspace (for testing or cancellation)
     * @param {string} targetPlan - Target plan (FREE, PRO, ENTERPRISE)
     */
    downgradePlan: function(targetPlan) {
      targetPlan = targetPlan || 'FREE';

      var workspace = ERM.state.workspace;
      if (!workspace) {
        console.error('No workspace found');
        return false;
      }

      // Confirm downgrade
      if (!confirm('Are you sure you want to downgrade to ' + targetPlan + ' plan?\n\nYou may lose access to some features.')) {
        return false;
      }

      // Store previous plan
      var previousPlan = workspace.plan || 'FREE';

      // Update workspace plan
      workspace.plan = targetPlan.toUpperCase();
      workspace.downgradedAt = new Date().toISOString();
      workspace.previousPlan = previousPlan;

      // Save updated workspace
      ERM.storage.set('erm_currentWorkspace', workspace);

      // Update global state
      ERM.state.workspace = workspace;

      // Log downgrade event
      var event = {
        type: 'plan_downgrade',
        plan: targetPlan,
        previousPlan: previousPlan,
        timestamp: new Date().toISOString(),
        workspaceId: workspace.id,
        userId: ERM.state.user ? ERM.state.user.id : null
      };

      var activityLog = ERM.storage.get('erm_activityLog') || [];
      activityLog.unshift(event);
      ERM.storage.set('erm_activityLog', activityLog);

      // Show notification
      ERM.toast.success('Plan downgraded to ' + targetPlan);

      // Reload page
      setTimeout(function() {
        window.location.reload();
      }, 1000);

      return true;
    },

    /**
     * Get subscription info
     * @returns {object} Subscription details
     */
    getSubscriptionInfo: function() {
      var workspace = ERM.state.workspace;
      if (!workspace) return null;

      return {
        plan: workspace.plan || 'FREE',
        upgradedAt: workspace.upgradedAt || null,
        subscriptionId: workspace.subscriptionId || null,
        billingCycle: workspace.billingCycle || null,
        isActive: workspace.plan !== 'FREE'
      };
    },

    /**
     * Cancel subscription (keep access until end of billing period)
     */
    cancelSubscription: function() {
      var workspace = ERM.state.workspace;
      if (!workspace || workspace.plan === 'FREE') {
        ERM.toast.error('No active subscription to cancel');
        return false;
      }

      if (!confirm('Are you sure you want to cancel your subscription?\n\nYou will retain access until the end of your current billing period.')) {
        return false;
      }

      // Set cancellation flag
      workspace.subscriptionCancelled = true;
      workspace.cancelledAt = new Date().toISOString();

      // Calculate end of billing period (30 days from upgrade)
      if (workspace.upgradedAt) {
        var upgradeDate = new Date(workspace.upgradedAt);
        var endDate = new Date(upgradeDate);
        endDate.setDate(endDate.getDate() + 30);
        workspace.subscriptionEndsAt = endDate.toISOString();
      }

      // Save workspace
      ERM.storage.set('erm_currentWorkspace', workspace);
      ERM.state.workspace = workspace;

      // Log event
      var event = {
        type: 'subscription_cancelled',
        plan: workspace.plan,
        timestamp: new Date().toISOString(),
        endsAt: workspace.subscriptionEndsAt,
        workspaceId: workspace.id
      };

      var activityLog = ERM.storage.get('erm_activityLog') || [];
      activityLog.unshift(event);
      ERM.storage.set('erm_activityLog', activityLog);

      ERM.toast.success('Subscription cancelled. Access continues until ' + new Date(workspace.subscriptionEndsAt).toLocaleDateString());

      return true;
    },

    /**
     * Reactivate cancelled subscription
     */
    reactivateSubscription: function() {
      var workspace = ERM.state.workspace;
      if (!workspace || !workspace.subscriptionCancelled) {
        ERM.toast.error('No cancelled subscription to reactivate');
        return false;
      }

      // Remove cancellation
      delete workspace.subscriptionCancelled;
      delete workspace.cancelledAt;
      delete workspace.subscriptionEndsAt;

      // Save workspace
      ERM.storage.set('erm_currentWorkspace', workspace);
      ERM.state.workspace = workspace;

      // Log event
      var event = {
        type: 'subscription_reactivated',
        plan: workspace.plan,
        timestamp: new Date().toISOString(),
        workspaceId: workspace.id
      };

      var activityLog = ERM.storage.get('erm_activityLog') || [];
      activityLog.unshift(event);
      ERM.storage.set('erm_activityLog', activityLog);

      ERM.toast.success('Subscription reactivated successfully');

      return true;
    }
  };

  console.log('Upgrade Flow loaded');
})();

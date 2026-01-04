/**
 * Team Synchronization Manager
 * Ensures team members are synced across all parts of the application:
 * - Header team dropdown
 * - Settings team management tab
 * - Billing/seats management
 * - Risk register invites
 * - Control invites
 * - Report invites
 * ES5 Compatible
 */

(function() {
  'use strict';

  // Initialize ERM namespace
  window.ERM = window.ERM || {};

  /**
   * Team Sync Manager
   */
  ERM.teamSyncManager = {
    /**
     * Add a team member to workspace
     * Automatically assigns a seat if available
     * @param {object} memberData - Member information
     * @returns {object} - Added member with seat assignment
     */
    addMember: function(memberData) {
      var members = ERM.storage.get('workspaceMembers') || [];

      // Check for duplicate email
      for (var i = 0; i < members.length; i++) {
        if (members[i].email.toLowerCase() === memberData.email.toLowerCase()) {
          if (typeof ERM.toast !== 'undefined') {
            ERM.toast.error('A member with this email already exists');
          }
          return null;
        }
      }

      // Get current plan and seat availability
      var planDetails = this.getPlanDetails();
      var seatUsage = this.getSeatUsage();

      // Check if seats are available
      if (seatUsage.available <= 0) {
        // Show upgrade modal to add more seats
        if (typeof ERM.upgradeModal !== 'undefined') {
          ERM.upgradeModal.show({
            feature: 'team_seats',
            message: 'You\'ve used all ' + planDetails.teamSize + ' seats on your plan.',
            upgradeMessage: 'Add more seats to invite this team member.',
            source: 'team_management'
          });
        }
        return null;
      }

      // Get current user for tracking
      var currentUser = ERM.state.user || {};

      // Create new member
      var newMember = {
        id: memberData.id || ERM.utils.generateId('member'),
        name: memberData.name,
        email: memberData.email,
        color: memberData.color || this.getRandomColor(),
        addedAt: new Date().toISOString(),
        role: memberData.role || 'member',
        isOwner: memberData.isOwner || false,
        addedBy: currentUser.id || null,
        addedByName: currentUser.name || 'Unknown',
        status: 'active',
        hasSeat: true // Automatically assign seat
      };

      members.push(newMember);
      ERM.storage.set('workspaceMembers', members);

      // Track analytics
      if (typeof ERM.upgradeAnalytics !== 'undefined') {
        ERM.upgradeAnalytics.track({
          source: 'team_management',
          feature: 'add_member',
          action: 'member_added',
          data: { memberId: newMember.id }
        });
      }

      // Refresh all UI components
      this.refreshAllComponents();

      if (typeof ERM.toast !== 'undefined') {
        ERM.toast.success(memberData.name + ' has been added to your workspace');
      }

      return newMember;
    },

    /**
     * Remove a team member from workspace
     * Cascades removal across all invites, risk registers, controls, reports
     * @param {string} memberId - Member ID to remove
     * @param {boolean} skipConfirmation - Skip confirmation dialog
     */
    removeMember: function(memberId, skipConfirmation) {
      var self = this;
      var members = ERM.storage.get('workspaceMembers') || [];
      var member = null;

      // Find member
      for (var i = 0; i < members.length; i++) {
        if (members[i].id === memberId) {
          member = members[i];
          break;
        }
      }

      if (!member) {
        if (typeof ERM.toast !== 'undefined') {
          ERM.toast.error('Member not found');
        }
        return;
      }

      // Prevent owner from being deleted
      if (member.isOwner) {
        if (typeof ERM.toast !== 'undefined') {
          ERM.toast.error('Cannot remove workspace owner');
        }
        return;
      }

      // Get impact analysis
      var impact = this.getMemberRemovalImpact(memberId);

      // Show confirmation dialog
      if (!skipConfirmation) {
        var impactHtml = '';
        if (impact.totalImpact > 0 || impact.hasSeat) {
          impactHtml = '<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">' +
            '<div style="font-weight:600;color:#991b1b;margin-bottom:8px;">⚠️ This will affect:</div>' +
            '<ul style="margin:0;padding-left:20px;color:#64748b;">';

          if (impact.riskRegisters > 0) {
            impactHtml += '<li>' + impact.riskRegisters + ' risk register' + (impact.riskRegisters > 1 ? 's' : '') + ' (member will lose access)</li>';
          }
          if (impact.controls > 0) {
            impactHtml += '<li>' + impact.controls + ' control' + (impact.controls > 1 ? 's' : '') + ' linked to those registers</li>';
          }
          if (impact.hasSeat) {
            impactHtml += '<li>1 billing seat will be freed</li>';
          }

          impactHtml += '</ul></div>';
        }

        if (typeof ERM.components !== 'undefined' && ERM.components.showModal) {
          ERM.components.showModal({
            title: 'Remove Team Member',
            content: '<p style="margin-bottom:12px;">Are you sure you want to remove <strong>' +
              ERM.utils.escapeHtml(member.name) + '</strong> from the workspace?</p>' +
              impactHtml +
              '<p style="color:#64748b;font-size:14px;margin-top:16px;">They will lose access to all shared items and will be removed from all collaborations.</p>',
            buttons: [
              { label: 'Cancel', type: 'secondary', action: 'close' },
              { label: 'Remove Member', type: 'danger', action: 'confirm' }
            ],
            onAction: function(action) {
              if (action === 'confirm') {
                self.executeRemoveMember(memberId, member, impact);
              }
            }
          });
        } else {
          // Fallback to native confirm
          if (confirm('Are you sure you want to remove ' + member.name + ' from the workspace?')) {
            this.executeRemoveMember(memberId, member, impact);
          }
        }
      } else {
        this.executeRemoveMember(memberId, member, impact);
      }
    },

    /**
     * Execute member removal with cascading deletions
     * @private
     */
    executeRemoveMember: function(memberId, member, impact) {
      // Remove from workspace members
      var members = ERM.storage.get('workspaceMembers') || [];
      var updatedMembers = [];
      for (var i = 0; i < members.length; i++) {
        if (members[i].id !== memberId) {
          updatedMembers.push(members[i]);
        }
      }
      ERM.storage.set('workspaceMembers', updatedMembers);

      // Remove from all risk register invites
      this.removeFromAllInvites('register', memberId);

      // Remove from all report shares
      this.removeFromAllInvites('report', memberId);

      // NOTE: Controls inherit access from risk registers, so no separate removal needed

      // Track analytics
      if (typeof ERM.upgradeAnalytics !== 'undefined') {
        ERM.upgradeAnalytics.track({
          source: 'team_management',
          feature: 'remove_member',
          action: 'member_removed',
          data: {
            memberId: memberId,
            impact: impact
          }
        });
      }

      // Refresh all UI components
      this.refreshAllComponents();

      if (typeof ERM.toast !== 'undefined') {
        ERM.toast.success(member.name + ' has been removed from the workspace');
      }
    },

    /**
     * Get impact analysis for member removal
     * @param {string} memberId - Member ID
     * @returns {object} - Impact details
     */
    getMemberRemovalImpact: function(memberId) {
      var impact = {
        riskRegisters: 0,
        controls: 0,
        reports: 0,
        hasSeat: false,
        totalImpact: 0
      };

      // Check workspace member for seat
      var members = ERM.storage.get('workspaceMembers') || [];
      for (var i = 0; i < members.length; i++) {
        if (members[i].id === memberId && members[i].hasSeat) {
          impact.hasSeat = true;
          break;
        }
      }

      // Count risk register invites
      var riskInvites = this.findMemberInvites('register', memberId);
      impact.riskRegisters = riskInvites.length;

      // Count controls linked to those risk registers (inherited access)
      impact.controls = this.countControlsFromRiskRegisters(riskInvites);

      // Count report shares
      var reportShares = this.findMemberInvites('report', memberId);
      impact.reports = reportShares.length;

      impact.totalImpact = impact.riskRegisters + impact.controls + impact.reports;

      return impact;
    },

    /**
     * Count controls linked to risk registers the member has access to
     * @param {array} riskInvites - Array of risk register invites
     * @returns {number} - Count of controls
     */
    countControlsFromRiskRegisters: function(riskInvites) {
      if (riskInvites.length === 0) return 0;

      var controls = ERM.storage.get('controls') || [];
      var controlCount = 0;

      // Get risk register IDs
      var riskRegisterIds = [];
      for (var i = 0; i < riskInvites.length; i++) {
        riskRegisterIds.push(riskInvites[i].itemId);
      }

      // Count controls linked to these risk registers
      for (var j = 0; j < controls.length; j++) {
        if (controls[j].riskRegisterId && riskRegisterIds.indexOf(controls[j].riskRegisterId) !== -1) {
          controlCount++;
        }
      }

      return controlCount;
    },

    /**
     * Find all invites for a member in a specific context type
     * NOTE: Only 'register' and 'report' contexts have invites - controls inherit from risk registers
     * @param {string} contextType - 'register' or 'report'
     * @param {string} memberId - Member ID
     * @returns {array} - Array of {itemId, itemName, role}
     */
    findMemberInvites: function(contextType, memberId) {
      var results = [];

      // Only risk registers and reports have invites
      if (contextType !== 'register' && contextType !== 'report') {
        return results;
      }

      var items = [];
      var storageKeyPrefix = '';

      if (contextType === 'register') {
        items = ERM.storage.get('riskRegisters') || [];
        storageKeyPrefix = 'invites_register_';
      } else if (contextType === 'report') {
        items = ERM.storage.get('reports') || [];
        storageKeyPrefix = 'invites_report_';
      }

      // Check invites for each item
      for (var i = 0; i < items.length; i++) {
        var storageKey = storageKeyPrefix + items[i].id;
        var invites = ERM.storage.get(storageKey) || [];

        for (var j = 0; j < invites.length; j++) {
          if (invites[j].memberId === memberId) {
            results.push({
              itemId: items[i].id,
              itemName: items[i].name || items[i].title || 'Unnamed',
              role: invites[j].role
            });
            break;
          }
        }
      }

      return results;
    },

    /**
     * Remove member from all invites of a specific type
     * NOTE: Only 'register' and 'report' contexts have invites - controls inherit from risk registers
     * @param {string} contextType - 'register' or 'report'
     * @param {string} memberId - Member ID
     */
    removeFromAllInvites: function(contextType, memberId) {
      // Only risk registers and reports have invites
      if (contextType !== 'register' && contextType !== 'report') {
        return;
      }

      var items = [];
      var storageKeyPrefix = '';

      if (contextType === 'register') {
        items = ERM.storage.get('riskRegisters') || [];
        storageKeyPrefix = 'invites_register_';
      } else if (contextType === 'report') {
        items = ERM.storage.get('reports') || [];
        storageKeyPrefix = 'invites_report_';
      }

      // Remove from each item's invites
      for (var i = 0; i < items.length; i++) {
        var storageKey = storageKeyPrefix + items[i].id;
        var invites = ERM.storage.get(storageKey) || [];
        var newInvites = [];

        for (var j = 0; j < invites.length; j++) {
          if (invites[j].memberId !== memberId) {
            newInvites.push(invites[j]);
          }
        }

        ERM.storage.set(storageKey, newInvites);
      }
    },

    /**
     * Update member role
     * @param {string} memberId - Member ID
     * @param {string} newRole - member, admin, owner
     */
    updateMemberRole: function(memberId, newRole) {
      var members = ERM.storage.get('workspaceMembers') || [];
      var updated = false;

      for (var i = 0; i < members.length; i++) {
        if (members[i].id === memberId) {
          members[i].role = newRole;
          updated = true;
          break;
        }
      }

      if (updated) {
        ERM.storage.set('workspaceMembers', members);

        // Track analytics
        if (typeof ERM.upgradeAnalytics !== 'undefined') {
          ERM.upgradeAnalytics.track({
            source: 'team_management',
            feature: 'update_role',
            action: 'role_changed',
            data: { memberId: memberId, newRole: newRole }
          });
        }

        this.refreshAllComponents();

        if (typeof ERM.toast !== 'undefined') {
          ERM.toast.success('Role updated to ' + (newRole.charAt(0).toUpperCase() + newRole.slice(1)));
        }
      }
    },

    /**
     * Get plan details for seat management
     * @returns {object}
     */
    getPlanDetails: function() {
      var plan = localStorage.getItem('ERM_plan') || 'FREE';
      var teamSize = parseInt(localStorage.getItem('ERM_teamSize')) || 3;

      return {
        plan: plan,
        teamSize: teamSize,
        basePriceMonthly: 29,
        perSeatPrice: 10
      };
    },

    /**
     * Get seat usage statistics
     * @returns {object}
     */
    getSeatUsage: function() {
      var planDetails = this.getPlanDetails();
      var members = ERM.storage.get('workspaceMembers') || [];

      // Count active seats
      var activeSeats = 0;
      for (var i = 0; i < members.length; i++) {
        if (members[i].status !== 'suspended' && members[i].hasSeat !== false) {
          activeSeats++;
        }
      }

      return {
        total: planDetails.teamSize,
        used: activeSeats,
        available: planDetails.teamSize - activeSeats,
        percentage: planDetails.teamSize > 0 ? Math.round((activeSeats / planDetails.teamSize) * 100) : 0
      };
    },

    /**
     * Refresh all UI components that display team members
     */
    refreshAllComponents: function() {
      // Refresh header team dropdown
      if (typeof ERM.components !== 'undefined' && ERM.components.renderHeader) {
        ERM.components.renderHeader('header-container');
      }

      // Refresh settings team tab
      if (typeof ERM.settings !== 'undefined' && ERM.settings.renderTeamTab) {
        ERM.settings.renderTeamTab();
      }

      // Refresh billing seats card
      if (typeof ERM.billingManagement !== 'undefined' && ERM.billingManagement.renderProfileSeats) {
        var container = document.getElementById('billing-seats-card');
        if (container) {
          ERM.billingManagement.renderProfileSeats();
        }
      }

      // Refresh any open invite modals (will need to be re-opened manually)
      // This is intentional to prevent state issues
    },

    /**
     * Get random color for new member
     * @returns {string}
     */
    getRandomColor: function() {
      var colors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
        '#f97316', '#eab308', '#22c55e', '#14b8a6',
        '#0ea5e9', '#3b82f6'
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    },

    /**
     * Sync member across risk registers
     * When a member is invited to a risk register, ensure they appear in team list
     * @param {string} memberId - Member ID
     * @param {string} registerId - Risk register ID
     * @param {string} role - Role in register
     */
    syncMemberToRiskRegister: function(memberId, registerId, role) {
      var member = this.getMemberById(memberId);
      if (!member) return;

      var storageKey = 'invites_register_' + registerId;
      var invites = ERM.storage.get(storageKey) || [];

      // Check if already invited
      var alreadyInvited = false;
      for (var i = 0; i < invites.length; i++) {
        if (invites[i].memberId === memberId) {
          alreadyInvited = true;
          invites[i].role = role; // Update role
          break;
        }
      }

      if (!alreadyInvited) {
        invites.push({
          memberId: memberId,
          role: role,
          invitedAt: new Date().toISOString()
        });
      }

      ERM.storage.set(storageKey, invites);
    },

    /**
     * Get member by ID
     * @param {string} memberId - Member ID
     * @returns {object|null}
     */
    getMemberById: function(memberId) {
      var members = ERM.storage.get('workspaceMembers') || [];
      for (var i = 0; i < members.length; i++) {
        if (members[i].id === memberId) {
          return members[i];
        }
      }
      return null;
    },

    /**
     * Get all workspace members
     * @returns {array}
     */
    getAllMembers: function() {
      return ERM.storage.get('workspaceMembers') || [];
    }
  };

  console.log('Team Sync Manager loaded');
})();

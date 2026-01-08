/**
 * Dimeri ERM - Billing & Seat Management
 * Admin interface for managing team seats and billing
 */

(function() {
  'use strict';

  // Initialize ERM namespace
  window.ERM = window.ERM || {};

  /**
   * Billing Management
   */
  ERM.billingManagement = {
    /**
     * Get current plan details
     */
    getPlanDetails: function() {
      var plan = localStorage.getItem('ERM_plan') || 'FREE';
      var teamSize = parseInt(localStorage.getItem('ERM_teamSize')) || 3;
      var billing = localStorage.getItem('ERM_billing') || 'monthly';
      var upgradeDate = localStorage.getItem('ERM_upgradeDate');

      return {
        plan: plan,
        teamSize: teamSize,
        billing: billing,
        upgradeDate: upgradeDate,
        basePriceMonthly: plan === 'PRO' ? 29 : 0,
        perSeatPrice: plan === 'PRO' ? 10 : 0
      };
    },

    /**
     * Get team members with seat assignments
     */
    getTeamMembers: function() {
      var members = ERM.storage.get('workspaceMembers') || [];
      var currentUser = ERM.state.user || { name: 'You', email: '', role: 'owner' };

      // Add current user as first member
      var allMembers = [{
        id: 'current',
        name: currentUser.name || 'You',
        email: currentUser.email || '',
        role: currentUser.role || 'owner',
        isOwner: true,
        hasSeat: true,
        isCurrentUser: true,
        status: 'active',
        joinedDate: new Date().toISOString()
      }];

      // Add other members
      members.forEach(function(member, index) {
        allMembers.push({
          id: member.id || 'member_' + index,
          name: member.name || 'Team Member',
          email: member.email || '',
          role: member.role || 'member',
          isOwner: member.isOwner || false,
          hasSeat: true, // All current members have seats
          isCurrentUser: false,
          status: member.status || 'active',
          joinedDate: member.joinedDate || new Date().toISOString()
        });
      });

      return allMembers;
    },

    /**
     * Get seat usage statistics
     */
    getSeatUsage: function() {
      var planDetails = this.getPlanDetails();
      var members = this.getTeamMembers();
      var activeSeats = members.filter(function(m) { return m.hasSeat; }).length;

      return {
        total: planDetails.teamSize,
        used: activeSeats,
        available: Math.max(0, planDetails.teamSize - activeSeats),
        percentage: planDetails.teamSize > 0 ? (activeSeats / planDetails.teamSize * 100).toFixed(0) : 0
      };
    },

    /**
     * Calculate monthly cost
     */
    calculateMonthlyCost: function(seats) {
      var planDetails = this.getPlanDetails();
      if (planDetails.plan === 'FREE') return 0;

      var baseSeats = 3;
      var additionalSeats = Math.max(0, seats - baseSeats);
      var baseCost = planDetails.basePriceMonthly;
      var additionalCost = additionalSeats * planDetails.perSeatPrice;

      return baseCost + additionalCost;
    },

    /**
     * Render billing section for settings page
     */
    renderBillingSection: function() {
      var planDetails = this.getPlanDetails();
      var seatUsage = this.getSeatUsage();
      var members = this.getTeamMembers();
      var monthlyCost = this.calculateMonthlyCost(planDetails.teamSize);

      // Check if user is owner
      var isOwner = ERM.permissions && ERM.permissions.isOwner ? ERM.permissions.isOwner() : false;

      if (!isOwner) {
        return '<div class="settings-section">' +
          '<div class="settings-section-header">' +
          '<div class="settings-section-icon">💳</div>' +
          '<div class="settings-section-title">' +
          '<h3>Billing & Seats</h3>' +
          '<p>View your plan and seat usage</p>' +
          '</div>' +
          '</div>' +
          '<div class="settings-section-body">' +
          '<p class="billing-owner-only">Only the workspace owner can manage billing and seats.</p>' +
          '</div>' +
          '</div>';
      }

      var html = '<div class="settings-section">' +
        '<div class="settings-section-header">' +
        '<div class="settings-section-icon">💳</div>' +
        '<div class="settings-section-title">' +
        '<h3>Billing & Seats</h3>' +
        '<p>Manage your subscription and team seats</p>' +
        '</div>' +
        '</div>' +
        '<div class="settings-section-body">';

      // Current Plan Card
      html += '<div class="billing-plan-card">' +
        '<div class="billing-plan-header">' +
        '<div class="billing-plan-info">' +
        '<h4 class="billing-plan-name">' + planDetails.plan + ' Plan</h4>' +
        '<p class="billing-plan-billing">' + (planDetails.billing === 'annual' ? 'Billed Annually' : 'Billed Monthly') + '</p>' +
        '</div>' +
        '<div class="billing-plan-price">' +
        '<span class="billing-price-amount">$' + monthlyCost + '</span>' +
        '<span class="billing-price-period">/month</span>' +
        '</div>' +
        '</div>';

      // Seat Usage Bar
      html += '<div class="billing-seat-usage">' +
        '<div class="seat-usage-header">' +
        '<span class="seat-usage-label">Seat Usage</span>' +
        '<span class="seat-usage-count">' + seatUsage.used + ' of ' + seatUsage.total + ' seats used</span>' +
        '</div>' +
        '<div class="seat-usage-bar">' +
        '<div class="seat-usage-fill" style="width: ' + seatUsage.percentage + '%"></div>' +
        '</div>' +
        '<div class="seat-usage-actions">' +
        '<button class="btn-seat-action" onclick="ERM.billingManagement.showAddSeatsModal()">Add Seats</button>';

      if (seatUsage.available > 0) {
        html += '<button class="btn-seat-action btn-seat-remove" onclick="ERM.billingManagement.showRemoveSeatsModal()">Remove Unused Seats</button>';
      }

      html += '</div>' +
        '</div>' +
        '</div>';

      // Team Members List
      html += '<div class="billing-team-section">' +
        '<h4 class="billing-section-title">Team Members (' + members.length + ')</h4>' +
        '<div class="billing-team-list">';

      members.forEach(function(member) {
        var initials = ERM.utils.getInitials(member.name);
        var roleBadge = member.isOwner ? '<span class="role-badge owner">Owner</span>' : '<span class="role-badge member">Member</span>';
        var youBadge = member.isCurrentUser ? ' <span class="team-member-you">(You)</span>' : '';

        html += '<div class="billing-team-member">' +
          '<div class="billing-member-info">' +
          '<div class="billing-member-avatar" style="background: ' + ERM.utils.getColorForName(member.name) + ';">' + initials + '</div>' +
          '<div class="billing-member-details">' +
          '<div class="billing-member-name">' + ERM.utils.escapeHtml(member.name) + youBadge + '</div>' +
          '<div class="billing-member-email">' + ERM.utils.escapeHtml(member.email) + '</div>' +
          '</div>' +
          '</div>' +
          '<div class="billing-member-role">' + roleBadge + '</div>' +
          '<div class="billing-member-seat">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<polyline points="20 6 9 17 4 12"/>' +
          '</svg>' +
          '<span>Has Seat</span>' +
          '</div>' +
          '</div>';
      });

      html += '</div>' +
        '</div>';

      // Billing History Link
      html += '<div class="billing-actions">' +
        '<a href="upgrade.html" class="btn btn-outline">Change Plan</a>' +
        '<button class="btn btn-secondary" onclick="ERM.billingManagement.showUpgradeAnalytics()">View Upgrade Analytics</button>' +
        '</div>';

      html += '</div>' +
        '</div>';

      return html;
    },

    /**
     * Show add seats modal
     */
    showAddSeatsModal: function() {
      var planDetails = this.getPlanDetails();
      var currentSeats = planDetails.teamSize;
      var maxSeats = planDetails.plan === 'PRO' ? 7 : 10;

      if (currentSeats >= maxSeats) {
        if (typeof ERM.components !== 'undefined') {
          ERM.components.showModal({
            title: 'Maximum Seats Reached',
            content: '<p>You\'ve reached the maximum of ' + maxSeats + ' seats for your plan.</p>' +
              '<p>Please contact sales for Enterprise plans with unlimited seats.</p>',
            actions: [
              { text: 'Cancel', className: 'btn-secondary', action: 'close' }
            ]
          });
        }
        return;
      }

      var self = this;
      var availableSeats = [];
      for (var i = currentSeats + 1; i <= maxSeats; i++) {
        availableSeats.push(i);
      }

      var optionsHtml = availableSeats.map(function(seats) {
        var additionalSeats = seats - currentSeats;
        var additionalCost = additionalSeats * planDetails.perSeatPrice;
        var newTotal = self.calculateMonthlyCost(seats);

        return '<div class="seat-option" data-seats="' + seats + '">' +
          '<div class="seat-option-info">' +
          '<strong>' + seats + ' seats</strong>' +
          '<span class="seat-option-change">+' + additionalSeats + ' seat' + (additionalSeats > 1 ? 's' : '') + '</span>' +
          '</div>' +
          '<div class="seat-option-price">+$' + additionalCost + '/mo → $' + newTotal + '/mo total</div>' +
          '</div>';
      }).join('');

      if (typeof ERM.components !== 'undefined') {
        ERM.components.showModal({
          title: 'Add Seats to Your Plan',
          content: '<p class="modal-description">Select how many seats you\'d like to add. Each additional seat costs $' + planDetails.perSeatPrice + '/month.</p>' +
            '<div class="seat-options-list">' + optionsHtml + '</div>',
          actions: [
            { text: 'Cancel', className: 'btn-secondary', action: 'close' },
            { text: 'Add Seats', className: 'btn-primary', action: function() { self.addSeats(); } }
          ]
        });

        // Add click handlers to seat options
        setTimeout(function() {
          var options = document.querySelectorAll('.seat-option');
          options.forEach(function(option) {
            option.addEventListener('click', function() {
              options.forEach(function(opt) { opt.classList.remove('selected'); });
              this.classList.add('selected');
            });
          });
        }, 100);
      }
    },

    /**
     * Add seats to plan
     */
    addSeats: function() {
      var selected = document.querySelector('.seat-option.selected');
      if (!selected) {
        if (typeof ERM.toast !== 'undefined') {
          ERM.toast.error('Please select a seat option');
        }
        return;
      }

      var newSeats = parseInt(selected.getAttribute('data-seats'));
      var planDetails = this.getPlanDetails();
      var additionalSeats = newSeats - planDetails.teamSize;
      var additionalCost = additionalSeats * planDetails.perSeatPrice;

      // Update seat count
      localStorage.setItem('ERM_teamSize', newSeats.toString());

      // Track analytics
      if (typeof ERM.upgradeAnalytics !== 'undefined') {
        ERM.upgradeAnalytics.track({
          source: 'billing_management',
          feature: 'add_seats',
          action: 'seats_added',
          plan: planDetails.plan,
          oldSeats: planDetails.teamSize,
          newSeats: newSeats,
          additionalCost: additionalCost
        });
      }

      // Close modal
      if (typeof ERM.components !== 'undefined') {
        ERM.components.closeModal();
      }

      // Show success message
      if (typeof ERM.toast !== 'undefined') {
        ERM.toast.success('Added ' + additionalSeats + ' seat' + (additionalSeats > 1 ? 's' : '') + ' to your plan');
      }

      // Re-render settings if we're on that page
      if (typeof ERM.settings !== 'undefined' && ERM.settings.render) {
        setTimeout(function() {
          ERM.settings.render();
        }, 500);
      }
    },

    /**
     * Show remove seats modal
     */
    showRemoveSeatsModal: function() {
      var planDetails = this.getPlanDetails();
      var seatUsage = this.getSeatUsage();
      var minSeats = seatUsage.used; // Can't go below used seats

      if (planDetails.teamSize <= minSeats) {
        if (typeof ERM.components !== 'undefined') {
          ERM.components.showModal({
            title: 'Cannot Remove Seats',
            content: '<p>You cannot remove seats while they are being used by team members.</p>' +
              '<p>Currently using ' + seatUsage.used + ' of ' + seatUsage.total + ' seats.</p>',
            actions: [
              { text: 'OK', className: 'btn-primary', action: 'close' }
            ]
          });
        }
        return;
      }

      var self = this;
      var availableOptions = [];
      for (var i = planDetails.teamSize - 1; i >= minSeats; i--) {
        availableOptions.push(i);
      }

      var optionsHtml = availableOptions.map(function(seats) {
        var removedSeats = planDetails.teamSize - seats;
        var savings = removedSeats * planDetails.perSeatPrice;
        var newTotal = self.calculateMonthlyCost(seats);

        return '<div class="seat-option" data-seats="' + seats + '">' +
          '<div class="seat-option-info">' +
          '<strong>' + seats + ' seats</strong>' +
          '<span class="seat-option-change">-' + removedSeats + ' seat' + (removedSeats > 1 ? 's' : '') + '</span>' +
          '</div>' +
          '<div class="seat-option-price">-$' + savings + '/mo → $' + newTotal + '/mo total</div>' +
          '</div>';
      }).join('');

      if (typeof ERM.components !== 'undefined') {
        ERM.components.showModal({
          title: 'Remove Unused Seats',
          content: '<p class="modal-description">Select how many seats to keep. You can only remove seats that are not currently assigned to team members.</p>' +
            '<div class="seat-options-list">' + optionsHtml + '</div>',
          actions: [
            { text: 'Cancel', className: 'btn-secondary', action: 'close' },
            { text: 'Update Seats', className: 'btn-primary', action: function() { self.removeSeats(); } }
          ]
        });

        // Add click handlers
        setTimeout(function() {
          var options = document.querySelectorAll('.seat-option');
          options.forEach(function(option) {
            option.addEventListener('click', function() {
              options.forEach(function(opt) { opt.classList.remove('selected'); });
              this.classList.add('selected');
            });
          });
        }, 100);
      }
    },

    /**
     * Remove seats from plan
     */
    removeSeats: function() {
      var selected = document.querySelector('.seat-option.selected');
      if (!selected) {
        if (typeof ERM.toast !== 'undefined') {
          ERM.toast.error('Please select a seat option');
        }
        return;
      }

      var newSeats = parseInt(selected.getAttribute('data-seats'));
      var planDetails = this.getPlanDetails();
      var removedSeats = planDetails.teamSize - newSeats;
      var savings = removedSeats * planDetails.perSeatPrice;

      // Update seat count
      localStorage.setItem('ERM_teamSize', newSeats.toString());

      // Track analytics
      if (typeof ERM.upgradeAnalytics !== 'undefined') {
        ERM.upgradeAnalytics.track({
          source: 'billing_management',
          feature: 'remove_seats',
          action: 'seats_removed',
          plan: planDetails.plan,
          oldSeats: planDetails.teamSize,
          newSeats: newSeats,
          savings: savings
        });
      }

      // Close modal
      if (typeof ERM.components !== 'undefined') {
        ERM.components.closeModal();
      }

      // Show success message
      if (typeof ERM.toast !== 'undefined') {
        ERM.toast.success('Removed ' + removedSeats + ' seat' + (removedSeats > 1 ? 's' : '') + ' from your plan');
      }

      // Re-render settings
      if (typeof ERM.settings !== 'undefined' && ERM.settings.render) {
        setTimeout(function() {
          ERM.settings.render();
        }, 500);
      }
    },

    /**
     * Render seat management for profile billing tab
     */
    renderProfileSeats: function() {
      var container = document.getElementById('billing-seats-card');
      if (!container) return;

      var planDetails = this.getPlanDetails();
      var seatUsage = this.getSeatUsage();
      var members = this.getTeamMembers();
      var monthlyCost = this.calculateMonthlyCost(planDetails.teamSize);

      var html = '<h3 class="card-title">Team Seats</h3>';

      // Seat usage bar
      html += '<div class="billing-seat-usage">' +
        '<div class="seat-usage-header">' +
        '<span class="seat-usage-label">Seat Usage</span>' +
        '<span class="seat-usage-count">' + seatUsage.used + ' of ' + seatUsage.total + ' seats used</span>' +
        '</div>' +
        '<div class="seat-usage-bar">' +
        '<div class="seat-usage-fill" style="width: ' + seatUsage.percentage + '%"></div>' +
        '</div>' +
        '<div class="seat-pricing-info">' +
        '<div class="seat-price-row">' +
        '<span>Base plan (3 seats)</span>' +
        '<span>$' + planDetails.basePriceMonthly + '/mo</span>' +
        '</div>';

      if (seatUsage.total > 3) {
        var additionalSeats = seatUsage.total - 3;
        var additionalCost = additionalSeats * planDetails.perSeatPrice;
        html += '<div class="seat-price-row">' +
          '<span>+' + additionalSeats + ' additional seat' + (additionalSeats > 1 ? 's' : '') + '</span>' +
          '<span>+$' + additionalCost + '/mo</span>' +
          '</div>';
      }

      html += '<div class="seat-price-row seat-price-total">' +
        '<span><strong>Total</strong></span>' +
        '<span><strong>$' + monthlyCost + '/mo</strong></span>' +
        '</div>' +
        '</div>';

      // Action buttons
      html += '<div class="seat-usage-actions">' +
        '<button class="btn btn-outline btn-sm" onclick="ERM.billingManagement.showAddSeatsModal()">Add Seats</button>';

      if (seatUsage.available > 0) {
        html += '<button class="btn btn-text btn-sm" onclick="ERM.billingManagement.showRemoveSeatsModal()">Remove Unused Seats</button>';
      }

      html += '</div>' +
        '</div>';

      // Team members list
      html += '<div class="billing-team-section">' +
        '<h4 class="billing-section-title">Assigned Seats (' + seatUsage.used + '/' + seatUsage.total + ')</h4>' +
        '<div class="billing-team-list">';

      members.forEach(function(member) {
        var initials = ERM.utils.getInitials(member.name);
        var roleBadge = member.isOwner ? '<span class="role-badge owner">Owner</span>' : '<span class="role-badge member">Member</span>';
        var youBadge = member.isCurrentUser ? ' <span class="team-member-you">(You)</span>' : '';
        var color = typeof ERM.utils.getColorForName === 'function' ? ERM.utils.getColorForName(member.name) : '#3b82f6';

        html += '<div class="billing-team-member">' +
          '<div class="billing-member-info">' +
          '<div class="billing-member-avatar" style="background: ' + color + ';">' + initials + '</div>' +
          '<div class="billing-member-details">' +
          '<div class="billing-member-name">' + ERM.utils.escapeHtml(member.name) + youBadge + '</div>' +
          '<div class="billing-member-email">' + ERM.utils.escapeHtml(member.email) + '</div>' +
          '</div>' +
          '</div>' +
          '<div class="billing-member-role">' + roleBadge + '</div>' +
          '<div class="billing-member-seat">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<polyline points="20 6 9 17 4 12"/>' +
          '</svg>' +
          '<span>Active</span>' +
          '</div>' +
          '</div>';
      });

      html += '</div>' +
        '</div>';

      container.innerHTML = html;
    },

    /**
     * Initialize profile billing page
     */
    initProfileBilling: function() {
      // Wait for DOM to be ready
      if (document.getElementById('billing-seats-card')) {
        this.renderProfileSeats();
      }
    },

    /**
     * Show upgrade analytics for admin
     */
    showUpgradeAnalytics: function() {
      if (typeof ERM.upgradeAnalytics === 'undefined') {
        if (typeof ERM.toast !== 'undefined') {
          ERM.toast.error('Analytics not available');
        }
        return;
      }

      var stats = ERM.upgradeAnalytics.getConversionStats();
      var events = ERM.upgradeAnalytics.getEvents();

      var statsHtml = '<div class="analytics-stats">';

      // Overview
      statsHtml += '<h4>Conversion Overview</h4>';
      statsHtml += '<div class="analytics-grid">';

      Object.keys(stats.modalShown).forEach(function(source) {
        var shown = stats.modalShown[source] || 0;
        var clicked = stats.upgradeClicked[source] || 0;
        var success = stats.upgradeSuccess[source] || 0;
        var rate = stats.conversionRate[source] || '0%';

        statsHtml += '<div class="analytics-card">' +
          '<h5>' + source.replace(/_/g, ' ').toUpperCase() + '</h5>' +
          '<div class="analytics-metrics">' +
          '<div><span>Shown:</span> ' + shown + '</div>' +
          '<div><span>Clicked:</span> ' + clicked + '</div>' +
          '<div><span>Converted:</span> ' + success + '</div>' +
          '<div><span>Rate:</span> ' + rate + '</div>' +
          '</div>' +
          '</div>';
      });

      statsHtml += '</div>' +
        '</div>';

      // Recent events
      var recentEvents = events.slice(-10).reverse();
      statsHtml += '<h4 style="margin-top: 24px;">Recent Events</h4>';
      statsHtml += '<div class="analytics-events">';

      recentEvents.forEach(function(event) {
        var timestamp = new Date(event.timestamp).toLocaleString();
        statsHtml += '<div class="analytics-event">' +
          '<div><strong>' + event.action + '</strong> - ' + event.source + '</div>' +
          '<div class="analytics-event-time">' + timestamp + '</div>' +
          '</div>';
      });

      statsHtml += '</div>';

      if (typeof ERM.components !== 'undefined') {
        ERM.components.showModal({
          title: 'Upgrade Analytics',
          content: statsHtml,
          actions: [
            { text: 'Close', className: 'btn-primary', action: 'close' }
          ]
        });
      }
    },

    /**
     * Show add seats modal
     */
    showAddSeatsModal: function() {
      var self = this;
      var planDetails = this.getPlanDetails();

      var content = '<div class="form-group">' +
        '<label class="form-label">Number of seats to add</label>' +
        '<input type="number" class="form-input" id="seats-to-add" min="1" max="10" value="1">' +
        '<p style="color: #64748b; font-size: 14px; margin-top: 8px;">$' + planDetails.perSeatPrice + '/seat/month</p>' +
        '<div id="seats-cost-preview" style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px;">' +
        '<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">' +
        '<span style="color: #64748b;">Current monthly cost:</span>' +
        '<span style="font-weight: 600;">$' + this.calculateMonthlyCost(planDetails.teamSize) + '/mo</span>' +
        '</div>' +
        '<div style="display: flex; justify-content: space-between;">' +
        '<span style="color: #64748b;">New monthly cost:</span>' +
        '<span style="font-weight: 600; color: #3b82f6;" id="new-cost">$' + this.calculateMonthlyCost(planDetails.teamSize + 1) + '/mo</span>' +
        '</div>' +
        '</div>' +
        '</div>';

      if (typeof ERM.components !== 'undefined' && ERM.components.showModal) {
        ERM.components.showModal({
          title: 'Add Seats',
          content: content,
          buttons: [
            { label: 'Cancel', type: 'secondary', action: 'close' },
            { label: 'Add Seats', type: 'primary', action: 'add' }
          ],
          onOpen: function() {
            var input = document.getElementById('seats-to-add');
            if (input) {
              input.addEventListener('input', function() {
                var seats = parseInt(this.value) || 1;
                var newTotal = planDetails.teamSize + seats;
                var newCost = self.calculateMonthlyCost(newTotal);
                var newCostEl = document.getElementById('new-cost');
                if (newCostEl) {
                  newCostEl.textContent = '$' + newCost + '/mo';
                }
              });
            }
          },
          onAction: function(action) {
            if (action === 'add') {
              var seats = parseInt(document.getElementById('seats-to-add').value) || 1;

              // Use billing API if available
              if (typeof ERM.billingAPI !== 'undefined') {
                ERM.billingAPI.addSeats(seats)
                  .then(function() {
                    ERM.components.closeModal();
                    // Update localStorage for demo
                    localStorage.setItem('ERM_teamSize', (planDetails.teamSize + seats).toString());
                    self.renderProfileSeats();
                  })
                  .catch(function(error) {
                    console.error('Error adding seats:', error);
                  });
              } else {
                // Fallback: update localStorage directly
                localStorage.setItem('ERM_teamSize', (planDetails.teamSize + seats).toString());
                ERM.components.closeModal();
                if (typeof ERM.toast !== 'undefined') {
                  ERM.toast.success(seats + ' seat(s) added successfully');
                }
                self.renderProfileSeats();
              }
            }
          }
        });
      }
    },

    /**
     * Show remove seats modal
     */
    showRemoveSeatsModal: function() {
      var self = this;
      var seatUsage = this.getSeatUsage();
      var planDetails = this.getPlanDetails();
      var maxRemovable = seatUsage.available;

      if (maxRemovable === 0) {
        if (typeof ERM.toast !== 'undefined') {
          ERM.toast.error('No unused seats to remove');
        }
        return;
      }

      var content = '<div class="form-group">' +
        '<label class="form-label">Number of seats to remove</label>' +
        '<input type="number" class="form-input" id="seats-to-remove" min="1" max="' + maxRemovable + '" value="1">' +
        '<p style="color: #64748b; font-size: 14px; margin-top: 8px;">You can remove up to ' + maxRemovable + ' unused seat' + (maxRemovable > 1 ? 's' : '') + '</p>' +
        '<div id="seats-cost-preview" style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px;">' +
        '<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">' +
        '<span style="color: #64748b;">Current monthly cost:</span>' +
        '<span style="font-weight: 600;">$' + this.calculateMonthlyCost(planDetails.teamSize) + '/mo</span>' +
        '</div>' +
        '<div style="display: flex; justify-content: space-between;">' +
        '<span style="color: #64748b;">New monthly cost:</span>' +
        '<span style="font-weight: 600; color: #10b981;" id="new-cost">$' + this.calculateMonthlyCost(planDetails.teamSize - 1) + '/mo</span>' +
        '</div>' +
        '</div>' +
        '</div>';

      if (typeof ERM.components !== 'undefined' && ERM.components.showModal) {
        ERM.components.showModal({
          title: 'Remove Seats',
          content: content,
          buttons: [
            { label: 'Cancel', type: 'secondary', action: 'close' },
            { label: 'Remove Seats', type: 'danger', action: 'remove' }
          ],
          onOpen: function() {
            var input = document.getElementById('seats-to-remove');
            if (input) {
              input.addEventListener('input', function() {
                var seats = parseInt(this.value) || 1;
                var newTotal = planDetails.teamSize - seats;
                var newCost = self.calculateMonthlyCost(newTotal);
                var newCostEl = document.getElementById('new-cost');
                if (newCostEl) {
                  newCostEl.textContent = '$' + newCost + '/mo';
                }
              });
            }
          },
          onAction: function(action) {
            if (action === 'remove') {
              var seats = parseInt(document.getElementById('seats-to-remove').value) || 1;

              // Use billing API if available
              if (typeof ERM.billingAPI !== 'undefined') {
                ERM.billingAPI.removeSeats(seats)
                  .then(function() {
                    ERM.components.closeModal();
                    // Update localStorage for demo
                    localStorage.setItem('ERM_teamSize', (planDetails.teamSize - seats).toString());
                    self.renderProfileSeats();
                  })
                  .catch(function(error) {
                    console.error('Error removing seats:', error);
                  });
              } else {
                // Fallback: update localStorage directly
                localStorage.setItem('ERM_teamSize', (planDetails.teamSize - seats).toString());
                ERM.components.closeModal();
                if (typeof ERM.toast !== 'undefined') {
                  ERM.toast.success(seats + ' seat(s) removed successfully');
                }
                self.renderProfileSeats();
              }
            }
          }
        });
      }
    }
  };

  console.log('Billing Management loaded');
})();

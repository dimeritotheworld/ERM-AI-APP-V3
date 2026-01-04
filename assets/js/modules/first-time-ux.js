/**
 * First Time User Experience Module
 * One-time pop-ups for new users - calm, enterprise-grade orientation
 * ES5 Compatible
 */

if (!window.ERM) window.ERM = {};

ERM.firstTimeUX = {

  /**
   * Storage key prefix for tracking seen pop-ups
   */
  STORAGE_PREFIX: 'ERM_ftux_seen_',

  /**
   * Pop-up configurations
   */
  popups: {
    welcome: {
      title: 'Welcome to your risk workspace',
      body: 'This workspace gives you a real-time view of enterprise risk exposure, control presence, and accountability.<br><br>You can start by creating a risk register or exploring how risks are assessed and mitigated.',
      primaryAction: 'Get Started',
      primaryCallback: 'dismiss',
      secondaryAction: null,
      secondaryCallback: null
    },
    'risk-register': {
      title: 'Risk registers are the foundation',
      body: 'Capture, assess, and prioritise inherent and residual risks.',
      primaryAction: 'Get Started',
      primaryCallback: 'dismiss',
      secondaryAction: null,
      secondaryCallback: null
    },
    controls: {
      title: 'Controls support risk reduction',
      body: 'Define preventive, detective, or directive measures to mitigate risk.',
      primaryAction: 'Get Started',
      primaryCallback: 'dismiss',
      secondaryAction: null,
      secondaryCallback: null
    },
    reports: {
      title: 'Reports translate risk into insight',
      body: 'Reports summarise risk exposure, control presence, and escalation for management and governance use.',
      primaryAction: 'Get Started',
      primaryCallback: 'dismiss',
      secondaryAction: null,
      secondaryCallback: null
    }
  },

  /**
   * Check if user is first-time (no registers, no risks)
   */
  isFirstTimeUser: function() {
    var registers = ERM.storage.get('registers') || [];
    var risks = ERM.storage.get('risks') || [];
    return registers.length === 0 && risks.length === 0;
  },

  /**
   * Check if a specific pop-up has been seen
   */
  hasSeenPopup: function(popupId) {
    try {
      return localStorage.getItem(this.STORAGE_PREFIX + popupId) === 'true';
    } catch (e) {
      return false;
    }
  },

  /**
   * Mark a pop-up as seen
   */
  markPopupSeen: function(popupId) {
    try {
      localStorage.setItem(this.STORAGE_PREFIX + popupId, 'true');
    } catch (e) {
      console.warn('Could not save FTUX state:', e);
    }
  },

  /**
   * Show welcome pop-up on first login
   * Uses preview dashboard to show what the app looks like with data
   */
  checkWelcome: function() {
    if (!this.isFirstTimeUser()) return;
    if (this.hasSeenPopup('welcome')) return;

    // Small delay to let UI settle
    setTimeout(function() {
      // Use preview dashboard module if available
      if (ERM.previewDashboard && ERM.previewDashboard.show) {
        ERM.previewDashboard.show();
      }
    }, 500);
  },

  /**
   * Check and show pop-up for a specific view
   */
  checkViewPopup: function(viewId) {
    // Only show for first-time users or if they haven't seen this specific popup
    if (!this.popups[viewId]) return;
    if (this.hasSeenPopup(viewId)) return;

    // For view-specific popups, check if welcome was seen first
    if (viewId !== 'welcome' && !this.hasSeenPopup('welcome')) {
      // Show welcome first
      this.showPopup('welcome');
      return;
    }

    var self = this;
    setTimeout(function() {
      self.showPopup(viewId);
    }, 300);
  },

  /**
   * Show a pop-up
   */
  showPopup: function(popupId) {
    var config = this.popups[popupId];
    if (!config) return;

    var self = this;

    // Create overlay
    var overlay = document.createElement('div');
    overlay.className = 'ftux-overlay';
    overlay.id = 'ftux-overlay';

    // Create popup
    var popup = document.createElement('div');
    popup.className = 'ftux-popup';
    popup.innerHTML = this.buildPopupHTML(popupId, config);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Animate in
    setTimeout(function() {
      overlay.classList.add('active');
    }, 10);

    // Bind events after DOM is ready and animations complete
    var self = this;
    setTimeout(function() {
      self.bindPopupEvents(popupId, config);
    }, 400);
  },

  /**
   * Build pop-up HTML
   */
  buildPopupHTML: function(popupId, config) {
    var closeIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<line x1="18" y1="6" x2="6" y2="18"></line>' +
      '<line x1="6" y1="6" x2="18" y2="18"></line>' +
      '</svg>';

    var html = '<div class="ftux-popup-content">' +
      '<button type="button" class="ftux-close-btn" onclick="ERM.firstTimeUX.handleCloseClick(\'' + popupId + '\')" aria-label="Close">' + closeIcon + '</button>' +
      '<div class="ftux-popup-header">' +
      '<div class="ftux-popup-icon">' + this.getIcon(popupId) + '</div>' +
      '</div>' +
      '<h2 class="ftux-popup-title">' + config.title + '</h2>' +
      '<p class="ftux-popup-body">' + config.body + '</p>' +
      '<div class="ftux-ai-badge">' +
      '<svg class="ftux-ai-sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
      '<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/>' +
      '<path d="M12 8v8M8 12h8" stroke-width="1" opacity="0.5"/>' +
      '</svg>' +
      '<span>AI-assisted insights available</span>' +
      '</div>' +
      '<div class="ftux-popup-actions">' +
      '<button type="button" class="ftux-btn ftux-btn-primary" onclick="ERM.firstTimeUX.handlePrimaryClick(\'' + popupId + '\', \'' + config.primaryCallback + '\')">' + config.primaryAction + '</button>' +
      '</div>' +
      '<p class="ftux-popup-footer">You can revisit this later from Help.</p>' +
      '</div>';

    return html;
  },

  /**
   * Get icon for popup type
   */
  getIcon: function(popupId) {
    var icons = {
      welcome: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
      'risk-register': '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
      controls: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>',
      reports: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>'
    };
    return icons[popupId] || icons.welcome;
  },

  /**
   * Handle close button click (X button)
   */
  handleCloseClick: function(popupId) {
    this.markPopupSeen(popupId);
    this.closePopup();
  },

  /**
   * Handle primary button click (called via inline onclick)
   */
  handlePrimaryClick: function(popupId, callbackName) {
    this.markPopupSeen(popupId);
    this.closePopup();
  },

  /**
   * Bind pop-up overlay and keyboard events
   */
  bindPopupEvents: function(popupId, config) {
    var self = this;

    // Prevent clicks inside popup from bubbling to overlay (but NOT for buttons)
    var popup = document.querySelector('.ftux-popup');
    if (popup) {
      popup.addEventListener('click', function(e) {
        // Don't stop propagation for buttons - let their onclick handlers work
        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
          e.stopPropagation();
        }
      });
    }

    // Close on overlay click (only when clicking directly on overlay background)
    var overlay = document.getElementById('ftux-overlay');
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          self.markPopupSeen(popupId);
          self.closePopup();
        }
      });
    }

    // Close on Escape key
    var escHandler = function(e) {
      if (e.key === 'Escape') {
        self.markPopupSeen(popupId);
        self.closePopup();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  },

  /**
   * Close pop-up
   */
  closePopup: function() {
    var overlay = document.getElementById('ftux-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(function() {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 300);
    }
  },


  /**
   * Reset all FTUX state (for testing)
   */
  reset: function() {
    var keys = ['welcome', 'risk-register', 'controls', 'reports'];
    for (var i = 0; i < keys.length; i++) {
      try {
        localStorage.removeItem(this.STORAGE_PREFIX + keys[i]);
      } catch (e) {
        // Ignore
      }
    }
    console.log('FTUX state reset');
  }

};

console.log('First Time UX module loaded');

/**
 * DIMERI.AI - ADMIN PORTAL
 * Router Module - Handle navigation between views
 */

var ADMIN = ADMIN || {};

ADMIN.router = {
  /**
   * Current active view
   */
  currentView: 'overview',

  /**
   * Initialize router
   */
  init: function() {
    var self = this;

    // Handle sidebar navigation clicks
    var navItems = document.querySelectorAll('.admin-nav-item');
    for (var i = 0; i < navItems.length; i++) {
      navItems[i].addEventListener('click', function(e) {
        e.preventDefault();
        var view = this.getAttribute('data-view');
        if (view) {
          self.navigateTo(view);
        }
      });
    }

    // Handle browser back/forward
    window.addEventListener('popstate', function(e) {
      if (e.state && e.state.view) {
        self.loadView(e.state.view, false);
      }
    });

    // Load initial view from hash or default to overview
    var hash = window.location.hash.substring(1);
    var initialView = hash || 'overview';
    this.navigateTo(initialView, true);
  },

  /**
   * Navigate to a view
   * @param {string} view - View name
   * @param {boolean} replaceState - Whether to replace state instead of pushing
   */
  navigateTo: function(view, replaceState) {
    // Update URL
    if (replaceState) {
      history.replaceState({ view: view }, '', '#' + view);
    } else {
      history.pushState({ view: view }, '', '#' + view);
    }

    // Load the view
    this.loadView(view, true);
  },

  /**
   * Load a view
   * @param {string} view - View name
   * @param {boolean} updateNav - Whether to update navigation active state
   */
  loadView: function(view, updateNav) {
    this.currentView = view;

    // Update navigation active state
    if (updateNav) {
      this.updateNavigation(view);
    }

    // Load the appropriate module
    var contentArea = document.getElementById('admin-content');
    if (!contentArea) {
      console.error('Content area not found');
      return;
    }

    // Show loading state
    contentArea.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--admin-gray-500);">Loading...</div>';

    // Route to appropriate view
    switch (view) {
      case 'overview':
        this.loadOverview();
        break;
      case 'workspaces':
        this.loadWorkspaces();
        break;
      case 'workspace-activity':
        this.loadWorkspaceActivity();
        break;
      case 'workspace-suspended':
        this.loadWorkspaceSuspended();
        break;
      case 'users':
        this.loadUsers();
        break;
      case 'users-pending':
        this.loadUsersPending();
        break;
      case 'users-suspended':
        this.loadUsersSuspended();
        break;
      case 'usage':
        this.loadUsage();
        break;
      case 'feature-flags':
        this.loadFeatureFlags();
        break;
      case 'logs':
        this.loadLogs();
        break;
      case 'audit':
        this.loadAudit();
        break;
      default:
        this.loadNotFound(view);
    }
  },

  /**
   * Update navigation active state
   * @param {string} view - Active view name
   */
  updateNavigation: function(view) {
    var navItems = document.querySelectorAll('.admin-nav-item');
    for (var i = 0; i < navItems.length; i++) {
      var item = navItems[i];
      var itemView = item.getAttribute('data-view');
      if (itemView === view) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    }
  },

  /**
   * Load overview/dashboard
   */
  loadOverview: function() {
    if (ADMIN.dashboard && ADMIN.dashboard.render) {
      ADMIN.dashboard.render();
    } else {
      this.showError('Dashboard module not loaded');
    }
  },

  /**
   * Load workspaces list
   */
  loadWorkspaces: function() {
    if (ADMIN.workspaces && ADMIN.workspaces.render) {
      ADMIN.workspaces.render();
    } else {
      this.showError('Workspaces module not loaded');
    }
  },

  /**
   * Load workspace activity
   */
  loadWorkspaceActivity: function() {
    if (ADMIN.workspaces && ADMIN.workspaces.renderActivity) {
      ADMIN.workspaces.renderActivity();
    } else {
      this.showError('Workspaces module not loaded');
    }
  },

  /**
   * Load suspended workspaces
   */
  loadWorkspaceSuspended: function() {
    if (ADMIN.workspaces && ADMIN.workspaces.renderSuspended) {
      ADMIN.workspaces.renderSuspended();
    } else {
      this.showError('Workspaces module not loaded');
    }
  },

  /**
   * Load users list
   */
  loadUsers: function() {
    if (ADMIN.users && ADMIN.users.render) {
      ADMIN.users.render();
    } else {
      this.showError('Users module not loaded');
    }
  },

  /**
   * Load pending invites
   */
  loadUsersPending: function() {
    if (ADMIN.users && ADMIN.users.renderPending) {
      ADMIN.users.renderPending();
    } else {
      this.showError('Users module not loaded');
    }
  },

  /**
   * Load suspended users
   */
  loadUsersSuspended: function() {
    if (ADMIN.users && ADMIN.users.renderSuspended) {
      ADMIN.users.renderSuspended();
    } else {
      this.showError('Users module not loaded');
    }
  },

  /**
   * Load usage & limits
   */
  loadUsage: function() {
    if (ADMIN.usage && ADMIN.usage.render) {
      ADMIN.usage.render();
    } else {
      this.showError('Usage module not loaded');
    }
  },

  /**
   * Load feature flags
   */
  loadFeatureFlags: function() {
    if (ADMIN.system && ADMIN.system.renderFeatureFlags) {
      ADMIN.system.renderFeatureFlags();
    } else {
      this.showError('System module not loaded');
    }
  },

  /**
   * Load logs
   */
  loadLogs: function() {
    if (ADMIN.system && ADMIN.system.renderLogs) {
      ADMIN.system.renderLogs();
    } else {
      this.showError('System module not loaded');
    }
  },

  /**
   * Load audit trail
   */
  loadAudit: function() {
    if (ADMIN.system && ADMIN.system.renderAudit) {
      ADMIN.system.renderAudit();
    } else {
      this.showError('System module not loaded');
    }
  },

  /**
   * Load workspace detail view
   * @param {string} workspaceId - Workspace ID
   */
  loadWorkspaceDetail: function(workspaceId) {
    if (ADMIN.workspaces && ADMIN.workspaces.renderDetail) {
      ADMIN.workspaces.renderDetail(workspaceId);
    } else {
      this.showError('Workspaces module not loaded');
    }
  },

  /**
   * Load user detail view
   * @param {string} userId - User ID
   */
  loadUserDetail: function(userId) {
    if (ADMIN.users && ADMIN.users.renderDetail) {
      ADMIN.users.renderDetail(userId);
    } else {
      this.showError('Users module not loaded');
    }
  },

  /**
   * Show not found error
   * @param {string} view - View name that was not found
   */
  loadNotFound: function(view) {
    var contentArea = document.getElementById('admin-content');
    if (contentArea) {
      contentArea.innerHTML =
        '<div style="padding: 80px 20px; text-align: center;">' +
        '<div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>' +
        '<h2 style="font-size: 24px; font-weight: 600; color: var(--admin-gray-900); margin-bottom: 8px;">View Not Found</h2>' +
        '<p style="color: var(--admin-gray-500);">The view "' + ADMIN.utils.escapeHtml(view) + '" does not exist.</p>' +
        '<button onclick="ADMIN.router.navigateTo(\'overview\')" style="margin-top: 24px; padding: 10px 20px; background: var(--admin-accent); color: white; border: none; border-radius: 6px; cursor: pointer;">Go to Overview</button>' +
        '</div>';
    }
  },

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError: function(message) {
    var contentArea = document.getElementById('admin-content');
    if (contentArea) {
      contentArea.innerHTML =
        '<div style="padding: 80px 20px; text-align: center;">' +
        '<div style="font-size: 4rem; margin-bottom: 20px;">⚠️</div>' +
        '<h2 style="font-size: 24px; font-weight: 600; color: var(--admin-gray-900); margin-bottom: 8px;">Error Loading View</h2>' +
        '<p style="color: var(--admin-gray-500);">' + ADMIN.utils.escapeHtml(message) + '</p>' +
        '<button onclick="location.reload()" style="margin-top: 24px; padding: 10px 20px; background: var(--admin-accent); color: white; border: none; border-radius: 6px; cursor: pointer;">Reload Page</button>' +
        '</div>';
    }
  }
};

console.log('Admin Router module loaded');

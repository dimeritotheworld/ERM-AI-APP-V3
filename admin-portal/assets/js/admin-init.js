/**
 * DIMERI.AI - ADMIN PORTAL
 * Initialization Script
 */

(function() {
  'use strict';

  /**
   * Initialize admin portal on page load
   */
  function initAdminPortal() {
    console.log('Initializing Admin Portal...');

    // Check for required modules
    if (!ADMIN) {
      console.error('ADMIN namespace not found');
      return;
    }

    if (!ADMIN.router) {
      console.error('Router module not loaded');
      return;
    }

    // Initialize router
    ADMIN.router.init();

    // Initialize global search
    initGlobalSearch();

    // Initialize alerts button
    initAlertsButton();

    // Initialize user menu
    initUserMenu();

    // Update navigation counts
    updateNavigationCounts();

    // Set up periodic updates
    setInterval(function() {
      updateNavigationCounts();
    }, 60000); // Update every minute

    console.log('Admin Portal initialized successfully');
  }

  /**
   * Initialize global search
   */
  function initGlobalSearch() {
    var searchInput = document.getElementById('admin-global-search');
    if (!searchInput) return;

    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        var query = this.value.trim();
        if (query) {
          performGlobalSearch(query);
        }
      }
    });
  }

  /**
   * Perform global search
   */
  function performGlobalSearch(query) {
    console.log('Global search:', query);
    // TODO: Implement global search across workspaces and users
    alert('Global search for: "' + query + '"\n\n(Feature coming soon)');
  }

  /**
   * Initialize alerts button
   */
  function initAlertsButton() {
    var alertsBtn = document.getElementById('admin-alerts-btn');
    if (!alertsBtn) return;

    alertsBtn.addEventListener('click', function() {
      showAlertsPanel();
    });

    // Update alerts badge
    updateAlertsBadge();
  }

  /**
   * Show alerts panel
   */
  function showAlertsPanel() {
    var alerts = ADMIN.data.getSystemAlerts();

    var html = '<div style="position: fixed; top: 64px; right: 20px; width: 400px; max-height: 600px; background: white; border: 1px solid var(--admin-gray-200); border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); z-index: 1000;">' +
      '<div style="padding: 16px; border-bottom: 1px solid var(--admin-gray-200); display: flex; justify-content: space-between; align-items: center;">' +
      '<h3 style="font-size: 16px; font-weight: 600; margin: 0;">System Alerts</h3>' +
      '<button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--admin-gray-500);">×</button>' +
      '</div>' +
      '<div style="max-height: 500px; overflow-y: auto;">';

    if (alerts.length === 0) {
      html += '<div style="padding: 40px 20px; text-align: center; color: var(--admin-gray-500);">' +
        '<div style="font-size: 2rem; margin-bottom: 8px;">✅</div>' +
        '<p style="margin: 0;">No active alerts</p>' +
        '</div>';
    } else {
      for (var i = 0; i < alerts.length; i++) {
        html += ADMIN.dashboard.renderAlertItem(alerts[i]);
      }
    }

    html += '</div></div>';

    // Remove existing alerts panel
    var existing = document.querySelector('[style*="position: fixed"]');
    if (existing && existing.parentElement) {
      existing.remove();
    }

    // Add new alerts panel
    var temp = document.createElement('div');
    temp.innerHTML = html;
    document.body.appendChild(temp.firstChild);
  }

  /**
   * Update alerts badge
   */
  function updateAlertsBadge() {
    var badge = document.querySelector('#admin-alerts-btn .badge');
    if (!badge) return;

    var alerts = ADMIN.data.getSystemAlerts();
    badge.textContent = alerts.length;
    badge.style.display = alerts.length > 0 ? '' : 'none';
  }

  /**
   * Initialize user menu
   */
  function initUserMenu() {
    var userMenuBtn = document.getElementById('admin-user-menu-btn');
    if (!userMenuBtn) return;

    userMenuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleUserMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      var menu = document.getElementById('admin-user-menu');
      if (menu && !menu.contains(e.target)) {
        menu.style.display = 'none';
      }
    });
  }

  /**
   * Toggle user menu
   */
  function toggleUserMenu() {
    var menu = document.getElementById('admin-user-menu');
    if (!menu) return;

    var isVisible = menu.style.display === 'block';
    menu.style.display = isVisible ? 'none' : 'block';
  }

  /**
   * Update navigation counts
   */
  function updateNavigationCounts() {
    var workspaces = ADMIN.data.getAllWorkspaces();
    var users = ADMIN.data.getAllUsers();

    // Update workspaces count
    var workspacesCount = document.querySelector('[data-view="workspaces"] .nav-count');
    if (workspacesCount) {
      workspacesCount.textContent = workspaces.length;
    }

    // Update users count
    var usersCount = document.querySelector('[data-view="users"] .nav-count');
    if (usersCount) {
      usersCount.textContent = users.length;
    }

    // Update over-limit count
    var overLimitCount = 0;
    for (var i = 0; i < workspaces.length; i++) {
      if (ADMIN.data.isOverLimit(workspaces[i].id)) {
        overLimitCount++;
      }
    }

    var usageCount = document.querySelector('[data-view="usage"] .nav-count');
    if (usageCount) {
      usageCount.textContent = overLimitCount;
      usageCount.style.display = overLimitCount > 0 ? '' : 'none';
    }
  }

  /**
   * Handle admin logout
   */
  function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      console.log('Admin logout');
      // TODO: Implement proper logout
      window.location.href = '/';
    }
  }

  /**
   * Handle settings
   */
  function handleSettings() {
    alert('Admin Settings\n\n(Feature coming soon)');
  }

  /**
   * Handle help
   */
  function handleHelp() {
    alert('Admin Portal Help\n\nFor support, contact: support@dimeri.ai');
  }

  // Expose functions globally for onclick handlers
  window.ADMIN = window.ADMIN || {};
  window.ADMIN.logout = handleLogout;
  window.ADMIN.settings = handleSettings;
  window.ADMIN.help = handleHelp;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminPortal);
  } else {
    initAdminPortal();
  }
})();

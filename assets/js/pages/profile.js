/**
 * Profile/Settings Page JavaScript
 * Fully integrated with ERM app storage, permissions, and functions
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page initializing...');
    initProfilePage();
  });

  function initProfilePage() {
    bindTabNavigation();
    loadUserProfile();
    loadPreferences();
    loadNotificationSettings();
    loadPrivacySettings();
    loadSecurityInfo();
    loadBillingInfo();
    loadActivityLog();
    bindAllEventHandlers();
    checkUrlHash();
    applyRoleBasedVisibility();
    initializeAvatar();
    console.log('Profile page initialized');
  }

  /**
   * Bind tab navigation events
   */
  function bindTabNavigation() {
    var navItems = document.querySelectorAll('.profile-nav .nav-item');

    for (var i = 0; i < navItems.length; i++) {
      navItems[i].addEventListener('click', function() {
        var tabId = this.getAttribute('data-tab');
        switchTab(tabId);
      });
    }
  }

  /**
   * Switch to a specific tab
   */
  function switchTab(tabId) {
    var navItems = document.querySelectorAll('.profile-nav .nav-item');
    for (var i = 0; i < navItems.length; i++) {
      navItems[i].classList.remove('active');
      if (navItems[i].getAttribute('data-tab') === tabId) {
        navItems[i].classList.add('active');
      }
    }

    var tabs = document.querySelectorAll('.tab-content');
    for (var j = 0; j < tabs.length; j++) {
      tabs[j].classList.remove('active');
    }

    var activeTab = document.getElementById('tab-' + tabId);
    if (activeTab) {
      activeTab.classList.add('active');
    }

    // Reload activity log when switching to activity tab
    if (tabId === 'activity') {
      loadActivityLog();
    }

    window.location.hash = tabId;
  }

  /**
   * Check URL hash on load
   */
  function checkUrlHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash) {
      var validTabs = ['profile', 'notifications', 'preferences', 'security', 'billing', 'activity', 'support'];
      if (validTabs.indexOf(hash) !== -1) {
        switchTab(hash);
      }
    }
  }

  /**
   * Get storage - use ERM.storage if available, fallback to localStorage
   */
  function getStorage(key) {
    if (window.ERM && ERM.storage && ERM.storage.get) {
      return ERM.storage.get(key);
    }
    try {
      var data = localStorage.getItem('erm_' + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Set storage
   */
  function setStorage(key, value) {
    if (window.ERM && ERM.storage && ERM.storage.set) {
      ERM.storage.set(key, value);
    } else {
      localStorage.setItem('erm_' + key, JSON.stringify(value));
    }
  }

  /**
   * Check if current user is owner
   */
  function isOwner() {
    if (window.ERM && ERM.permissions && ERM.permissions.isOwner) {
      return ERM.permissions.isOwner();
    }
    var user = getUser();
    return user && user.isOwner === true;
  }

  /**
   * Get current user
   */
  function getUser() {
    if (window.ERM && ERM.state && ERM.state.user) {
      return ERM.state.user;
    }
    return getStorage('userProfile') || {
      name: 'Demo User',
      email: 'demo@company.com',
      role: 'Risk Manager',
      company: 'Demo Organization',
      isOwner: true
    };
  }

  /**
   * Apply role-based visibility (owner vs member)
   */
  function applyRoleBasedVisibility() {
    var userIsOwner = isOwner();

    // Billing tab visibility
    var billingAdmin = document.getElementById('billing-admin');
    var billingUser = document.getElementById('billing-user');

    if (billingAdmin && billingUser) {
      if (userIsOwner) {
        billingAdmin.style.display = 'block';
        billingUser.style.display = 'none';
      } else {
        billingAdmin.style.display = 'none';
        billingUser.style.display = 'block';
      }
    }

    // Danger zone visibility - only for owners
    var dangerZone = document.querySelector('.settings-card.danger-zone');
    if (dangerZone && !userIsOwner) {
      dangerZone.style.display = 'none';
    }

    // Workspace name (company field) - only editable by owner
    var companyInput = document.getElementById('profile-company');
    if (companyInput) {
      if (userIsOwner) {
        companyInput.readOnly = false;
        companyInput.style.backgroundColor = '';
        companyInput.style.cursor = '';
        companyInput.title = '';
      } else {
        companyInput.readOnly = true;
        companyInput.style.backgroundColor = '#f1f5f9';
        companyInput.style.cursor = 'not-allowed';
        companyInput.title = 'Only workspace owners can change the workspace name';
      }
    }

    // Transfer ownership section - only visible for owners
    var transferSection = document.getElementById('transfer-ownership-section');
    if (transferSection) {
      transferSection.style.display = userIsOwner ? 'block' : 'none';
    }

    // Load team members for transfer ownership dropdown if owner
    if (userIsOwner) {
      loadTeamMembersForTransfer();
    }
  }

  /**
   * Load user profile data from app state
   */
  function loadUserProfile() {
    var user = getUser();
    var workspace = null;

    if (window.ERM && ERM.state && ERM.state.workspace) {
      workspace = ERM.state.workspace;
    } else {
      workspace = getStorage('currentWorkspace') || { name: 'My Workspace' };
    }

    // Populate form fields
    var nameInput = document.getElementById('profile-name');
    var emailInput = document.getElementById('profile-email');
    var roleInput = document.getElementById('profile-role');
    var companyInput = document.getElementById('profile-company');
    var timezoneSelect = document.getElementById('profile-timezone');

    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (roleInput) roleInput.value = user.role || '';
    if (companyInput) companyInput.value = workspace.name || user.company || '';

    // Load timezone from preferences
    var prefs = getStorage('userPreferences') || {};
    if (timezoneSelect) timezoneSelect.value = prefs.timezone || 'Africa/Johannesburg';

    // Update avatar
    var avatarInitials = document.getElementById('avatar-initials');
    var displayName = document.getElementById('display-name');
    var displayRole = document.getElementById('display-role');

    if (avatarInitials && user.name) {
      avatarInitials.textContent = getInitials(user.name);
    }
    if (displayName) displayName.textContent = user.name || 'User';
    if (displayRole) displayRole.textContent = user.role || 'Risk Manager';

    // Update member since date
    var memberSince = document.getElementById('member-since');
    if (memberSince) {
      var createdDate = user.createdAt ? new Date(user.createdAt) : new Date();
      memberSince.textContent = createdDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    // Update last login
    var lastLogin = document.getElementById('last-login');
    if (lastLogin) {
      var now = new Date();
      lastLogin.textContent = 'Today at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  }

  /**
   * Load preferences including theme
   */
  function loadPreferences() {
    var prefs = getStorage('userPreferences') || {};

    // Theme
    var currentTheme = prefs.theme || 'light';
    var themeRadios = document.querySelectorAll('input[name="theme"]');
    for (var i = 0; i < themeRadios.length; i++) {
      if (themeRadios[i].value === currentTheme) {
        themeRadios[i].checked = true;
      }
    }

    // Date format
    var dateFormatSelects = document.querySelectorAll('#tab-preferences .form-select');
    for (var j = 0; j < dateFormatSelects.length; j++) {
      var sel = dateFormatSelects[j];
      if (sel.id === 'ai-style' && prefs.aiStyle) {
        sel.value = prefs.aiStyle;
      } else if (prefs.dateFormat && sel.querySelector('option[value="DD/MM/YYYY"]')) {
        sel.value = prefs.dateFormat;
      }
    }

    // AI enabled toggle
    var aiEnabled = document.getElementById('ai-enabled');
    if (aiEnabled) {
      aiEnabled.checked = prefs.aiEnabled !== false;
    }
  }

  /**
   * Load notification settings
   */
  function loadNotificationSettings() {
    var notifSettings = getStorage('notificationSettings') || {
      riskAlerts: true,
      controlReminders: true,
      reportGeneration: true,
      mentions: true,
      aiSuggestions: false,
      inAppNotifications: true,
      soundAlerts: false,
      digestFrequency: 'daily'
    };

    // Email notification toggles
    var toggleIds = ['risk-updates', 'control-reviews', 'report-generation', 'mentions', 'ai-suggestions'];
    var toggleKeys = ['riskAlerts', 'controlReminders', 'reportGeneration', 'mentions', 'aiSuggestions'];

    var emailToggles = document.querySelectorAll('#tab-notifications .settings-card:first-child .toggle input');
    for (var i = 0; i < emailToggles.length && i < toggleKeys.length; i++) {
      emailToggles[i].checked = notifSettings[toggleKeys[i]] !== false;
    }

    // In-app notification toggles
    var inAppToggles = document.querySelectorAll('#tab-notifications .settings-card:nth-child(2) .toggle input');
    if (inAppToggles.length >= 1) inAppToggles[0].checked = notifSettings.inAppNotifications !== false;
    if (inAppToggles.length >= 2) inAppToggles[1].checked = notifSettings.soundAlerts === true;

    // Digest frequency
    var digestRadios = document.querySelectorAll('input[name="digest"]');
    for (var j = 0; j < digestRadios.length; j++) {
      digestRadios[j].checked = digestRadios[j].value === (notifSettings.digestFrequency || 'daily');
    }
  }

  /**
   * Load privacy settings
   */
  function loadPrivacySettings() {
    var prefs = getStorage('userPreferences') || {};

    var analyticsToggle = document.getElementById('toggle-analytics');
    var dataSharingToggle = document.getElementById('toggle-data-sharing');

    if (analyticsToggle) analyticsToggle.checked = prefs.analyticsEnabled !== false;
    if (dataSharingToggle) dataSharingToggle.checked = prefs.dataSharing === true;
  }

  /**
   * Load security info (sessions, login history)
   */
  function loadSecurityInfo() {
    // Detect current device
    var deviceInfo = detectDevice();
    var deviceEl = document.getElementById('current-device');
    var locationEl = document.getElementById('current-location');

    if (deviceEl) {
      deviceEl.textContent = deviceInfo.device + ' - ' + deviceInfo.browser;
    }
    if (locationEl) {
      locationEl.textContent = 'Local session';
    }

    // Load login history from activities
    var loginHistory = [];
    var activities = getStorage('activities') || [];

    // Filter for login-related activities or use recent activities
    for (var i = 0; i < activities.length && loginHistory.length < 10; i++) {
      var activity = activities[i];
      if (activity.type === 'user' || activity.action === 'login') {
        loginHistory.push(activity);
      }
    }

    // If no login history, show recent activities as login proxy
    var historyList = document.getElementById('login-history');
    if (historyList) {
      if (loginHistory.length > 0 || activities.length > 0) {
        var html = '';
        var itemsToShow = loginHistory.length > 0 ? loginHistory : activities.slice(0, 5);

        for (var j = 0; j < itemsToShow.length && j < 5; j++) {
          var item = itemsToShow[j];
          var date = item.timestamp ? new Date(item.timestamp) : new Date();
          var timeStr = formatRelativeTime(date);

          html += '<div class="history-item">';
          html += '<span class="history-time">' + timeStr + '</span>';
          html += '<span class="history-event">' + (item.action || 'Activity') + '</span>';
          html += '<span class="history-location">Local</span>';
          html += '</div>';
        }

        historyList.innerHTML = html || '<p class="empty-state" style="text-align: center; color: #64748b; padding: 20px;">No recent activity</p>';
      }
    }
  }

  /**
   * Detect current device/browser
   */
  function detectDevice() {
    var ua = navigator.userAgent;
    var device = 'Unknown Device';
    var browser = 'Unknown Browser';

    // Detect OS
    if (ua.indexOf('Windows') !== -1) device = 'Windows PC';
    else if (ua.indexOf('Mac') !== -1) device = 'Mac';
    else if (ua.indexOf('Linux') !== -1) device = 'Linux';
    else if (ua.indexOf('Android') !== -1) device = 'Android';
    else if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) device = 'iOS Device';

    // Detect Browser
    if (ua.indexOf('Chrome') !== -1 && ua.indexOf('Edg') === -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
    else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
    else if (ua.indexOf('Edg') !== -1) browser = 'Edge';
    else if (ua.indexOf('Opera') !== -1 || ua.indexOf('OPR') !== -1) browser = 'Opera';

    return { device: device, browser: browser };
  }

  /**
   * Format relative time
   */
  function formatRelativeTime(date) {
    var now = new Date();
    var diff = now - date;
    var seconds = Math.floor(diff / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);

    if (days === 0) {
      return 'Today, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return days + ' days ago';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  /**
   * Load billing info
   */
  function loadBillingInfo() {
    var plan = 'FREE';
    var usage = null;

    if (window.ERM && ERM.usageTracker) {
      if (ERM.usageTracker.getPlan) {
        plan = ERM.usageTracker.getPlan();
      }
      if (ERM.usageTracker.getUsage) {
        usage = ERM.usageTracker.getUsage();
      }
    }

    // Update plan name
    var planNameEl = document.getElementById('billing-plan-name');
    if (planNameEl) {
      var planNames = {
        'FREE': 'Free Plan',
        'PRO': 'Pro Plan',
        'ENTERPRISE': 'Enterprise Plan'
      };
      planNameEl.textContent = planNames[plan] || 'Free Plan';
    }

    // Update usage stats
    if (usage) {
      var registersEl = document.getElementById('usage-registers');
      var controlsEl = document.getElementById('usage-controls');
      var membersEl = document.getElementById('usage-members');
      var reportsEl = document.getElementById('usage-reports');

      if (registersEl) registersEl.textContent = usage.riskRegisters || 0;
      if (controlsEl) controlsEl.textContent = usage.controls || 0;
      if (membersEl) membersEl.textContent = usage.teamMembers || 1;
      if (reportsEl) reportsEl.textContent = usage.reports || 0;

      // Update progress bars
      updateUsageBar('registers', usage.riskRegisters, plan === 'FREE' ? 3 : -1);
      updateUsageBar('controls', usage.controls, plan === 'FREE' ? 25 : -1);
      updateUsageBar('members', usage.teamMembers, plan === 'FREE' ? 2 : plan === 'PRO' ? 10 : -1);
    }
  }

  /**
   * Update usage progress bar
   */
  function updateUsageBar(type, current, limit) {
    var usageItems = document.querySelectorAll('.usage-item');
    for (var i = 0; i < usageItems.length; i++) {
      var label = usageItems[i].querySelector('.usage-label');
      if (label && label.textContent.toLowerCase().indexOf(type) !== -1) {
        var fill = usageItems[i].querySelector('.usage-fill');
        if (fill) {
          if (limit === -1) {
            fill.style.width = '0%';
            fill.classList.add('unlimited');
          } else {
            var percentage = Math.min(100, (current / limit) * 100);
            fill.style.width = percentage + '%';
            if (percentage >= 90) {
              fill.style.background = '#ef4444';
            } else if (percentage >= 70) {
              fill.style.background = '#f59e0b';
            }
          }
        }
      }
    }
  }

  /**
   * Load activity log from ERM activity logger
   * NOTE: Profile activity tab shows ONLY the current user's activities
   * For full team audit trail, use the Activity Log page
   */
  function loadActivityLog() {
    var activities = [];
    var currentUser = getUser();
    var currentUserName = currentUser.name || '';

    if (window.ERM && ERM.activityLogger && ERM.activityLogger.getAll) {
      activities = ERM.activityLogger.getAll();
    } else {
      activities = getStorage('activities') || [];
    }

    var timeline = document.querySelector('.activity-timeline');
    if (!timeline) return;

    // Get filter values
    var filterType = document.getElementById('activity-filter');
    var filterPeriod = document.getElementById('activity-period');

    var typeFilter = filterType ? filterType.value : 'all';
    var periodDays = filterPeriod ? parseInt(filterPeriod.value) : 30;

    // Filter activities
    var cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    var filteredActivities = [];
    for (var i = 0; i < activities.length; i++) {
      var activity = activities[i];
      var activityDate = new Date(activity.timestamp);

      // IMPORTANT: Profile tab shows only current user's activities
      // Skip activities from other users
      if (activity.user && currentUserName && activity.user !== currentUserName) {
        continue;
      }

      // Date filter
      if (activityDate < cutoffDate) continue;

      // Type filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'risks' && activity.type !== 'risk') continue;
        if (typeFilter === 'controls' && activity.type !== 'control') continue;
        if (typeFilter === 'reports' && activity.type !== 'report') continue;
        if (typeFilter === 'ai' && (!activity.details || !activity.details.aiAssisted)) continue;
      }

      filteredActivities.push(activity);
    }

    // Group by date
    var groupedActivities = groupActivitiesByDate(filteredActivities);

    // Render timeline
    var html = '';
    for (var date in groupedActivities) {
      html += '<div class="activity-day">';
      html += '<div class="activity-date">' + date + '</div>';
      html += '<div class="activity-list">';

      var dayActivities = groupedActivities[date];
      for (var j = 0; j < dayActivities.length; j++) {
        html += renderActivityItem(dayActivities[j]);
      }

      html += '</div>';
      html += '</div>';
    }

    if (filteredActivities.length === 0) {
      html = '<div class="activity-empty">' +
        '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">' +
        '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' +
        '</svg>' +
        '<p>No personal activities found for this period</p>' +
        '<p style="font-size: 12px; color: #94a3b8; margin-top: 8px;">View the <a href="activity-log.html" style="color: #c41e3a;">Activity Log</a> for full team activity</p>' +
        '</div>';
    }

    timeline.innerHTML = html;
  }

  /**
   * Group activities by date
   */
  function groupActivitiesByDate(activities) {
    var groups = {};
    var today = new Date().toDateString();
    var yesterday = new Date(Date.now() - 86400000).toDateString();

    for (var i = 0; i < activities.length; i++) {
      var activity = activities[i];
      var activityDate = new Date(activity.timestamp);
      var dateKey = activityDate.toDateString();

      var displayDate;
      if (dateKey === today) {
        displayDate = 'Today';
      } else if (dateKey === yesterday) {
        displayDate = 'Yesterday';
      } else {
        displayDate = activityDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      }

      if (!groups[displayDate]) {
        groups[displayDate] = [];
      }
      groups[displayDate].push(activity);
    }

    return groups;
  }

  /**
   * Render a single activity item
   */
  function renderActivityItem(activity) {
    var iconClass = activity.type || 'default';
    var isAI = activity.details && activity.details.aiAssisted;

    var icon = getActivityIcon(activity.type);
    var actionText = getActivityActionText(activity);
    var time = activity.time || new Date(activity.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    var html = '<div class="activity-item' + (isAI ? ' ai-assisted' : '') + '">';
    html += '<div class="activity-icon ' + iconClass + '">' + icon + '</div>';
    html += '<div class="activity-content">';
    html += '<span class="activity-text">' + actionText + '</span>';
    html += '<span class="activity-meta">' + (activity.entityType || activity.type) + ' • ' + time + '</span>';
    html += '</div>';
    if (isAI) {
      html += '<span class="activity-badge ai">AI</span>';
    }
    html += '</div>';

    return html;
  }

  /**
   * Get activity icon SVG
   */
  function getActivityIcon(type) {
    var icons = {
      risk: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      control: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',
      report: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      user: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      settings: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
    };
    return icons[type] || icons.settings;
  }

  /**
   * Get activity action text
   */
  function getActivityActionText(activity) {
    var actions = {
      created: 'Created',
      updated: 'Updated',
      deleted: 'Deleted',
      added: 'Added',
      removed: 'Removed',
      linked: 'Linked',
      exported: 'Exported',
      imported: 'Imported'
    };

    var action = actions[activity.action] || activity.action;
    var entityName = activity.entityName ? '<strong>"' + escapeHtml(activity.entityName) + '"</strong>' : '';

    return action + ' ' + entityName;
  }

  /**
   * Get initials from name
   */
  function getInitials(name) {
    if (!name) return 'U';
    var parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return parts[0].charAt(0).toUpperCase();
  }

  /**
   * Initialize avatar system
   */
  function initializeAvatar() {
    if (!window.ERM || !ERM.avatarGenerator) {
      console.warn('Avatar generator not loaded');
      return;
    }

    var user = getStorage('user') || {};
    var avatarData = getStorage('userAvatar');

    // If no avatar exists, generate gradient avatar
    if (!avatarData) {
      avatarData = ERM.avatarGenerator.initializeUserAvatar(user);
    }

    // Display avatar in profile
    updateAvatarDisplay(avatarData);

    // Also update header avatar
    if (ERM.avatarGenerator.updateHeaderAvatar) {
      ERM.avatarGenerator.updateHeaderAvatar(avatarData);
    }

    // Bind avatar edit button
    var avatarEditBtn = document.querySelector('.avatar-edit');
    if (avatarEditBtn) {
      avatarEditBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showAvatarUploadModal();
      });
    }
  }

  /**
   * Update avatar display
   */
  function updateAvatarDisplay(avatarData) {
    var avatarElement = document.getElementById('user-avatar');
    if (!avatarElement) return;

    if (avatarData && avatarData.type === 'dicebear' && avatarData.url) {
      // DiceBear illustrated avatar (Notion-like)
      avatarElement.innerHTML = '<img src="' + avatarData.url + '" alt="Profile" class="avatar-image dicebear-avatar" style="width:100%;height:100%;border-radius:50%;"/>';
      avatarElement.classList.add('has-avatar');

      // Hide initials
      var initials = document.getElementById('avatar-initials');
      if (initials) initials.style.display = 'none';

    } else if (avatarData && avatarData.type === 'image') {
      // Custom uploaded image
      avatarElement.innerHTML = '<img src="' + avatarData.url + '" alt="Profile" class="avatar-image" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>';
      avatarElement.classList.add('has-avatar');

      // Hide initials
      var initials = document.getElementById('avatar-initials');
      if (initials) initials.style.display = 'none';

    } else {
      // Fallback to initials
      avatarElement.classList.remove('has-avatar');

      var initials = document.getElementById('avatar-initials');
      if (initials) {
        initials.style.display = 'flex';
        var user = getStorage('user') || {};
        initials.textContent = getInitials(user.name);
      }
    }
  }

  /**
   * Show avatar upload modal
   */
  function showAvatarUploadModal() {
    if (!window.ERM || !ERM.avatarGenerator) return;

    // Create modal if it doesn't exist
    var modal = document.getElementById('avatar-upload-modal');
    if (!modal) {
      modal = createAvatarUploadModal();
      document.body.appendChild(modal);
    }

    // Generate DiceBear illustrated avatar previews
    var previewGrid = modal.querySelector('.avatar-preview-grid');
    if (previewGrid) {
      previewGrid.innerHTML = '';

      var user = getStorage('user') || {};
      var seed = user.email || user.name || 'user';

      // Get avatar options from different styles
      var options = ERM.avatarGenerator.getAvatarOptions(seed, 6);

      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        var previewItem = document.createElement('div');
        previewItem.className = 'avatar-preview-item';
        previewItem.innerHTML = '<img src="' + option.url + '" alt="Avatar option" style="width:100%;height:100%;border-radius:50%;">';
        previewItem.setAttribute('data-avatar-style', option.style);
        previewItem.setAttribute('data-avatar-url', option.url);
        previewItem.setAttribute('data-avatar-seed', option.seed);

        previewItem.addEventListener('click', function() {
          selectAvatarPreview(this);
        });

        previewGrid.appendChild(previewItem);
      }
    }

    modal.classList.add('visible');
  }

  /**
   * Create avatar upload modal
   */
  function createAvatarUploadModal() {
    var modal = document.createElement('div');
    modal.id = 'avatar-upload-modal';
    modal.className = 'avatar-upload-modal';

    modal.innerHTML =
      '<div class="avatar-upload-content">' +
      '  <div class="avatar-upload-header">' +
      '    <h3>Choose Avatar</h3>' +
      '    <p>Select an illustrated avatar or upload your own image</p>' +
      '  </div>' +
      '  <div class="avatar-preview-grid"></div>' +
      '  <div class="avatar-upload-divider"><span>or</span></div>' +
      '  <div class="avatar-upload-zone" id="avatar-upload-zone">' +
      '    <svg class="avatar-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
      '      <polyline points="17 8 12 3 7 8"/>' +
      '      <line x1="12" y1="3" x2="12" y2="15"/>' +
      '    </svg>' +
      '    <div class="avatar-upload-text">Click to upload or drag and drop</div>' +
      '    <div class="avatar-upload-hint">PNG, JPG up to 5MB</div>' +
      '    <input type="file" id="avatar-file-input" class="avatar-upload-input" accept="image/*">' +
      '  </div>' +
      '  <div class="avatar-upload-actions">' +
      '    <button class="btn btn-secondary" id="avatar-cancel">Cancel</button>' +
      '    <button class="btn btn-primary" id="avatar-save">Save Avatar</button>' +
      '  </div>' +
      '</div>';

    // Bind events
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        hideAvatarUploadModal();
      }
    });

    setTimeout(function() {
      var cancelBtn = modal.querySelector('#avatar-cancel');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', hideAvatarUploadModal);
      }

      var saveBtn = modal.querySelector('#avatar-save');
      if (saveBtn) {
        saveBtn.addEventListener('click', saveSelectedAvatar);
      }

      var uploadZone = modal.querySelector('#avatar-upload-zone');
      var fileInput = modal.querySelector('#avatar-file-input');

      if (uploadZone && fileInput) {
        uploadZone.addEventListener('click', function() {
          fileInput.click();
        });

        fileInput.addEventListener('change', function() {
          handleAvatarUpload(this);
        });

        // Drag and drop
        uploadZone.addEventListener('dragover', function(e) {
          e.preventDefault();
          uploadZone.classList.add('drag-over');
        });

        uploadZone.addEventListener('dragleave', function() {
          uploadZone.classList.remove('drag-over');
        });

        uploadZone.addEventListener('drop', function(e) {
          e.preventDefault();
          uploadZone.classList.remove('drag-over');

          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            fileInput.files = e.dataTransfer.files;
            handleAvatarUpload(fileInput);
          }
        });
      }
    }, 100);

    return modal;
  }

  /**
   * Select avatar preview
   */
  function selectAvatarPreview(element) {
    var modal = document.getElementById('avatar-upload-modal');
    if (!modal) return;

    // Clear previous selection
    var items = modal.querySelectorAll('.avatar-preview-item');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.remove('selected');
    }

    element.classList.add('selected');

    // Store selected DiceBear avatar data
    modal.setAttribute('data-selected-style', element.getAttribute('data-avatar-style'));
    modal.setAttribute('data-selected-url', element.getAttribute('data-avatar-url'));
    modal.setAttribute('data-selected-seed', element.getAttribute('data-avatar-seed'));
    modal.setAttribute('data-selected-type', 'dicebear');
  }

  /**
   * Handle avatar upload
   */
  function handleAvatarUpload(fileInput) {
    if (!window.ERM || !ERM.avatarGenerator) return;

    ERM.avatarGenerator.uploadAvatar(fileInput, function(error, avatarData) {
      if (error) {
        if (window.ERM && ERM.toast) {
          ERM.toast.error(error.message);
        } else {
          alert(error.message);
        }
        return;
      }

      // Store uploaded avatar data in modal
      var modal = document.getElementById('avatar-upload-modal');
      if (modal) {
        modal.setAttribute('data-uploaded-image', avatarData.url);
        modal.setAttribute('data-selected-type', 'image');

        // Show preview in upload zone
        var uploadZone = document.querySelector('#avatar-upload-zone');
        if (uploadZone) {
          uploadZone.innerHTML =
            '<img src="' + avatarData.url + '" style="max-width: 100%; max-height: 200px; border-radius: 8px;">' +
            '<div class="avatar-upload-text" style="margin-top: 12px;">Image selected</div>' +
            '<div class="avatar-upload-hint">Click Save to apply</div>';
        }
      }
    });
  }

  /**
   * Save selected avatar
   */
  function saveSelectedAvatar() {
    var modal = document.getElementById('avatar-upload-modal');
    if (!modal) return;

    var selectedType = modal.getAttribute('data-selected-type');
    var avatarData = null;

    if (selectedType === 'dicebear') {
      var style = modal.getAttribute('data-selected-style');
      var url = modal.getAttribute('data-selected-url');
      var seed = modal.getAttribute('data-selected-seed');
      if (url) {
        avatarData = {
          type: 'dicebear',
          style: style,
          url: url,
          seed: seed,
          createdAt: new Date().toISOString()
        };
      }
    } else if (selectedType === 'image') {
      var imageUrl = modal.getAttribute('data-uploaded-image');
      if (imageUrl) {
        avatarData = {
          type: 'image',
          url: imageUrl,
          uploadedAt: new Date().toISOString()
        };
      }
    }

    if (!avatarData) {
      if (window.ERM && ERM.toast) {
        ERM.toast.error('Please select an avatar');
      }
      return;
    }

    // Save to storage
    setStorage('userAvatar', avatarData);

    // Update profile display
    updateAvatarDisplay(avatarData);

    // Update header avatar
    if (window.ERM && ERM.avatarGenerator && ERM.avatarGenerator.updateHeaderAvatar) {
      ERM.avatarGenerator.updateHeaderAvatar(avatarData);
    }

    // Close modal
    hideAvatarUploadModal();

    if (window.ERM && ERM.toast) {
      ERM.toast.success('Avatar updated');
    }
  }

  /**
   * Hide avatar upload modal
   */
  function hideAvatarUploadModal() {
    var modal = document.getElementById('avatar-upload-modal');
    if (modal) {
      modal.classList.remove('visible');
    }
  }

  /**
   * Escape HTML
   */
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Bind all event handlers
   */
  function bindAllEventHandlers() {
    // Profile save
    var profileSaveBtn = document.querySelector('#tab-profile .btn-primary');
    if (profileSaveBtn) {
      profileSaveBtn.addEventListener('click', function(e) {
        e.preventDefault();
        saveProfile();
      });
    }

    // Theme selection
    var themeRadios = document.querySelectorAll('input[name="theme"]');
    for (var i = 0; i < themeRadios.length; i++) {
      themeRadios[i].addEventListener('change', function() {
        applyTheme(this.value);
      });
    }

    // Preferences save
    var prefsSaveBtn = document.querySelector('#tab-preferences .btn-primary');
    if (prefsSaveBtn) {
      prefsSaveBtn.addEventListener('click', function(e) {
        e.preventDefault();
        savePreferences();
      });
    }

    // Notifications save
    var notifSaveBtn = document.querySelector('#tab-notifications .btn-primary');
    if (notifSaveBtn) {
      notifSaveBtn.addEventListener('click', function(e) {
        e.preventDefault();
        saveNotifications();
      });
    }

    // Privacy save
    var privacySaveBtn = document.getElementById('save-privacy-btn');
    if (privacySaveBtn) {
      privacySaveBtn.addEventListener('click', function(e) {
        e.preventDefault();
        savePrivacySettings();
      });
    }

    // Export data
    var exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', function(e) {
        e.preventDefault();
        exportUserData();
      });
    }

    // Clear data - with detailed confirmation
    var clearDataBtn = document.getElementById('clear-data-btn');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showClearDataModal();
      });
    }

    // Delete account - with detailed confirmation
    var deleteAccountBtn = document.getElementById('delete-account-btn');
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showDeleteAccountModal();
      });
    }

    // Feedback form
    var feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitFeedback();
      });
    }

    // Activity filters
    var activityFilter = document.getElementById('activity-filter');
    var activityPeriod = document.getElementById('activity-period');

    if (activityFilter) {
      activityFilter.addEventListener('change', function() {
        loadActivityLog();
      });
    }
    if (activityPeriod) {
      activityPeriod.addEventListener('change', function() {
        loadActivityLog();
      });
    }

    // Load more activities button
    var loadMoreBtn = document.querySelector('.activity-timeline + .btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function() {
        showToast('Loading more activities...', 'info');
      });
    }
  }

  /**
   * Save profile data
   */
  function saveProfile() {
    var userData = {
      name: document.getElementById('profile-name').value,
      email: document.getElementById('profile-email').value,
      role: document.getElementById('profile-role').value,
      company: document.getElementById('profile-company').value
    };

    // Update ERM state if available
    if (window.ERM && ERM.state) {
      ERM.state.user = Object.assign({}, ERM.state.user || {}, userData);
      if (ERM.session && ERM.session.setUser) {
        ERM.session.setUser(ERM.state.user);
      }
    }

    // Also save to storage
    setStorage('userProfile', userData);

    // Save timezone to preferences
    var timezone = document.getElementById('profile-timezone');
    if (timezone) {
      var prefs = getStorage('userPreferences') || {};
      prefs.timezone = timezone.value;
      setStorage('userPreferences', prefs);
    }

    // Update display
    var avatarInitials = document.getElementById('avatar-initials');
    var displayName = document.getElementById('display-name');
    var displayRole = document.getElementById('display-role');

    if (avatarInitials) avatarInitials.textContent = getInitials(userData.name);
    if (displayName) displayName.textContent = userData.name;
    if (displayRole) displayRole.textContent = userData.role;

    // Log activity
    if (window.ERM && ERM.activityLogger) {
      ERM.activityLogger.log('user', 'updated', 'profile', 'Profile', {});
    }

    showToast('Profile saved successfully', 'success');
  }

  /**
   * Apply theme
   */
  function applyTheme(theme) {
    var prefs = getStorage('userPreferences') || {};
    prefs.theme = theme;
    setStorage('userPreferences', prefs);

    // Apply theme using ERM.theme if available
    if (window.ERM && ERM.theme && ERM.theme.apply) {
      ERM.theme.apply(theme);
    } else {
      // Fallback: apply theme directly
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }

    showToast('Theme updated', 'success');
  }

  /**
   * Save preferences
   */
  function savePreferences() {
    var prefs = getStorage('userPreferences') || {};

    // Get selected theme
    var themeRadio = document.querySelector('input[name="theme"]:checked');
    if (themeRadio) {
      prefs.theme = themeRadio.value;
    }

    // Get AI settings
    var aiEnabled = document.getElementById('ai-enabled');
    if (aiEnabled) {
      prefs.aiEnabled = aiEnabled.checked;
    }

    var aiStyle = document.getElementById('ai-style');
    if (aiStyle) {
      prefs.aiStyle = aiStyle.value;
    }

    // Get date format
    var dateFormatSelects = document.querySelectorAll('#tab-preferences .form-select');
    for (var i = 0; i < dateFormatSelects.length; i++) {
      var sel = dateFormatSelects[i];
      if (sel.querySelector && sel.querySelector('option[value="DD/MM/YYYY"]')) {
        prefs.dateFormat = sel.value;
        break;
      }
    }

    setStorage('userPreferences', prefs);

    // Apply theme
    if (window.ERM && ERM.theme && ERM.theme.apply && prefs.theme) {
      ERM.theme.apply(prefs.theme);
    }

    // Log activity
    if (window.ERM && ERM.activityLogger) {
      ERM.activityLogger.log('settings', 'updated', 'preferences', 'Preferences', {});
    }

    showToast('Preferences saved', 'success');
  }

  /**
   * Save notification settings
   */
  function saveNotifications() {
    var settings = {};

    // Email notifications
    var emailToggles = document.querySelectorAll('#tab-notifications .settings-card:first-child .toggle input');
    var toggleKeys = ['riskAlerts', 'controlReminders', 'reportGeneration', 'mentions', 'aiSuggestions'];
    for (var i = 0; i < emailToggles.length && i < toggleKeys.length; i++) {
      settings[toggleKeys[i]] = emailToggles[i].checked;
    }

    // In-app notifications
    var inAppToggles = document.querySelectorAll('#tab-notifications .settings-card:nth-child(2) .toggle input');
    if (inAppToggles.length >= 1) settings.inAppNotifications = inAppToggles[0].checked;
    if (inAppToggles.length >= 2) settings.soundAlerts = inAppToggles[1].checked;

    // Digest frequency
    var digestRadio = document.querySelector('input[name="digest"]:checked');
    if (digestRadio) {
      settings.digestFrequency = digestRadio.value;
    }

    setStorage('notificationSettings', settings);

    // Log activity
    if (window.ERM && ERM.activityLogger) {
      ERM.activityLogger.log('settings', 'updated', 'notifications', 'Notification Settings', {});
    }

    showToast('Notification settings saved', 'success');
  }

  /**
   * Save privacy settings
   */
  function savePrivacySettings() {
    var prefs = getStorage('userPreferences') || {};

    var analyticsToggle = document.getElementById('toggle-analytics');
    var dataSharingToggle = document.getElementById('toggle-data-sharing');

    prefs.analyticsEnabled = analyticsToggle ? analyticsToggle.checked : true;
    prefs.dataSharing = dataSharingToggle ? dataSharingToggle.checked : false;

    setStorage('userPreferences', prefs);

    // Log activity
    if (window.ERM && ERM.activityLogger) {
      ERM.activityLogger.log('settings', 'updated', 'privacy', 'Privacy Settings', {});
    }

    showToast('Privacy settings saved', 'success');
  }

  /**
   * Export user data
   */
  function exportUserData() {
    var data = {
      user: getUser(),
      preferences: getStorage('userPreferences'),
      notifications: getStorage('notificationSettings'),
      risks: getStorage('registers') || getStorage('risks'),
      controls: getStorage('controls'),
      activities: getStorage('activities'),
      exportDate: new Date().toISOString()
    };

    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.href = url;
    a.download = 'dimeri-erm-export-' + new Date().getTime() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Log activity
    if (window.ERM && ERM.activityLogger) {
      ERM.activityLogger.log('data', 'exported', 'user-data', 'User Data Export', {});
    }

    showToast('Data exported successfully', 'success');
  }

  /**
   * Show clear data confirmation modal with detailed warning
   */
  function showClearDataModal() {
    // Count what will be deleted
    var registers = getStorage('registers') || [];
    var controls = getStorage('controls') || [];
    var activities = getStorage('activities') || [];

    var riskCount = 0;
    for (var i = 0; i < registers.length; i++) {
      var risks = getStorage('risks_' + registers[i].id) || [];
      riskCount += risks.length;
    }

    var content = '<div class="danger-modal-content">' +
      '<div class="danger-modal-icon">' +
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">' +
      '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
      '<line x1="12" y1="9" x2="12" y2="13"/>' +
      '<line x1="12" y1="17" x2="12.01" y2="17"/>' +
      '</svg>' +
      '</div>' +
      '<h3 style="color: #dc2626; margin: 16px 0 8px;">Clear All Workspace Data?</h3>' +
      '<p style="color: #64748b; margin-bottom: 16px;">This action is <strong>permanent and cannot be undone</strong>.</p>' +
      '<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; text-align: left; margin-bottom: 16px;">' +
      '<p style="font-weight: 600; color: #991b1b; margin-bottom: 8px;">The following will be permanently deleted:</p>' +
      '<ul style="margin: 0; padding-left: 20px; color: #991b1b; font-size: 14px;">' +
      '<li><strong>' + registers.length + '</strong> risk register(s)</li>' +
      '<li><strong>' + riskCount + '</strong> risk(s)</li>' +
      '<li><strong>' + controls.length + '</strong> control(s)</li>' +
      '<li><strong>' + activities.length + '</strong> activity log entries</li>' +
      '<li>All workspace settings and preferences</li>' +
      '</ul>' +
      '</div>' +
      '<div class="form-group" style="text-align: left;">' +
      '<label class="form-label">Type <strong>DELETE</strong> to confirm:</label>' +
      '<input type="text" class="form-input" id="confirm-clear-input" placeholder="Type DELETE to confirm">' +
      '</div>' +
      '</div>';

    if (window.ERM && ERM.components && ERM.components.showModal) {
      ERM.components.showModal({
        title: 'Clear All Data',
        content: content,
        size: 'md',
        buttons: [
          { label: 'Cancel', type: 'secondary', action: 'close' },
          { label: 'Clear All Data', type: 'danger', action: 'confirm' }
        ],
        onAction: function(action) {
          if (action === 'confirm') {
            var confirmInput = document.getElementById('confirm-clear-input');
            if (!confirmInput || confirmInput.value !== 'DELETE') {
              showToast('Please type DELETE to confirm', 'error');
              return;
            }
            clearAllData();
            ERM.components.closeModal();
          }
        }
      });
    } else {
      if (confirm('Are you sure you want to clear all data? This will delete all risks, controls, and settings. This action cannot be undone.')) {
        clearAllData();
      }
    }
  }

  /**
   * Clear all data
   */
  function clearAllData() {
    // Get register IDs first
    var registers = getStorage('registers') || [];

    // Clear ERM data
    var keysToRemove = ['registers', 'risks', 'controls', 'assessments', 'activities', 'recentReports'];
    for (var i = 0; i < keysToRemove.length; i++) {
      localStorage.removeItem('erm_' + keysToRemove[i]);
      localStorage.removeItem(keysToRemove[i]);
    }

    // Clear risk data for each register
    for (var j = 0; j < registers.length; j++) {
      localStorage.removeItem('erm_risks_' + registers[j].id);
      localStorage.removeItem('risks_' + registers[j].id);
    }

    showToast('All data cleared successfully', 'success');

    // Redirect to dashboard
    setTimeout(function() {
      window.location.href = 'index.html';
    }, 1500);
  }

  /**
   * Show delete account confirmation modal with detailed warning
   */
  function showDeleteAccountModal() {
    var user = getUser();

    var content = '<div class="danger-modal-content">' +
      '<div class="danger-modal-icon">' +
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">' +
      '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' +
      '<circle cx="12" cy="7" r="4"/>' +
      '<line x1="4" y1="4" x2="20" y2="20" stroke-width="3"/>' +
      '</svg>' +
      '</div>' +
      '<h3 style="color: #dc2626; margin: 16px 0 8px;">Delete Your Account?</h3>' +
      '<p style="color: #64748b; margin-bottom: 16px;">This action is <strong>permanent and cannot be undone</strong>.</p>' +
      '<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; text-align: left; margin-bottom: 16px;">' +
      '<p style="font-weight: 600; color: #991b1b; margin-bottom: 8px;">Deleting your account will:</p>' +
      '<ul style="margin: 0; padding-left: 20px; color: #991b1b; font-size: 14px;">' +
      '<li>Permanently delete your profile and all personal data</li>' +
      '<li>Remove all your risk registers and associated data</li>' +
      '<li>Cancel any active subscriptions</li>' +
      '<li>Remove you from all workspaces</li>' +
      '<li>Delete your complete activity history</li>' +
      '</ul>' +
      '</div>' +
      '<div class="form-group" style="text-align: left;">' +
      '<label class="form-label">Type your email <strong>' + escapeHtml(user.email) + '</strong> to confirm:</label>' +
      '<input type="text" class="form-input" id="confirm-delete-input" placeholder="Enter your email">' +
      '</div>' +
      '</div>';

    if (window.ERM && ERM.components && ERM.components.showModal) {
      ERM.components.showModal({
        title: 'Delete Account',
        content: content,
        size: 'md',
        buttons: [
          { label: 'Cancel', type: 'secondary', action: 'close' },
          { label: 'Delete My Account', type: 'danger', action: 'confirm' }
        ],
        onAction: function(action) {
          if (action === 'confirm') {
            var confirmInput = document.getElementById('confirm-delete-input');
            if (!confirmInput || confirmInput.value.toLowerCase() !== user.email.toLowerCase()) {
              showToast('Please enter your email to confirm', 'error');
              return;
            }
            deleteAccount();
          }
        }
      });
    } else {
      if (confirm('Are you sure you want to delete your account? This will permanently delete your account and all data. This action cannot be undone.')) {
        deleteAccount();
      }
    }
  }

  /**
   * Delete account
   */
  function deleteAccount() {
    localStorage.clear();
    sessionStorage.clear();
    showToast('Account deleted', 'success');

    setTimeout(function() {
      window.location.href = 'login.html';
    }, 1500);
  }

  /**
   * Submit feedback
   */
  function submitFeedback() {
    var message = document.getElementById('feedback-message');
    var category = document.getElementById('feedback-category');

    if (!message || !message.value.trim()) {
      showToast('Please enter your feedback', 'error');
      return;
    }

    // Log activity
    if (window.ERM && ERM.activityLogger) {
      ERM.activityLogger.log('user', 'created', 'feedback', 'Feedback: ' + (category ? category.value : 'general'), {});
    }

    // Clear form
    message.value = '';

    showToast('Thank you for your feedback!', 'success');
  }

  /**
   * Show toast notification
   */
  function showToast(message, type) {
    // Use ERM toast if available
    if (window.ERM && ERM.toast) {
      if (type === 'success' && ERM.toast.success) {
        ERM.toast.success(message);
      } else if (type === 'error' && ERM.toast.error) {
        ERM.toast.error(message);
      } else if (ERM.toast.show) {
        ERM.toast.show({ message: message, type: type });
      }
      return;
    }

    // Fallback toast
    var existingToast = document.querySelector('.profile-toast');
    if (existingToast) existingToast.remove();

    var toast = document.createElement('div');
    toast.className = 'profile-toast';
    toast.textContent = message;

    var bgColor = type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#0f172a';
    toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; background: ' + bgColor + '; color: white; border-radius: 8px; font-size: 14px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: Inter, sans-serif;';

    document.body.appendChild(toast);

    setTimeout(function() {
      toast.remove();
    }, 3000);
  }

  // Expose functions globally for onclick handlers
  window.saveProfile = saveProfile;
  window.resetProfile = function() {
    loadUserProfile();
    showToast('Changes discarded', 'info');
  };
  window.saveNotifications = saveNotifications;
  window.savePreferences = savePreferences;
  window.changePassword = function() {
    if (window.ERM && ERM.components && ERM.components.showChangePasswordModal) {
      ERM.components.showChangePasswordModal();
    } else {
      showToast('Password change functionality coming soon', 'info');
    }
  };
  window.setupMFA = function() {
    showToast('Two-factor authentication coming soon', 'info');
  };
  window.revokeSession = function(btn) {
    var sessionItem = btn.closest('.session-item');
    if (sessionItem) {
      sessionItem.style.opacity = '0.5';
      setTimeout(function() {
        sessionItem.remove();
      }, 300);
    }
    showToast('Session revoked', 'success');
  };
  window.signOutAll = function() {
    showToast('Signed out of all devices', 'success');
  };
  window.showCancelModal = function() {
    if (window.ERM && ERM.components && ERM.components.showModal) {
      ERM.components.showModal({
        title: 'Cancel Subscription',
        content: '<p>Are you sure you want to cancel your subscription?</p><p style="color:#64748b;margin-top:8px;">Your plan will remain active until the end of the current billing period.</p>',
        buttons: [
          { label: 'Keep Subscription', type: 'primary', action: 'close' },
          { label: 'Cancel Subscription', type: 'danger', action: 'cancel' }
        ],
        onAction: function(action) {
          if (action === 'cancel') {
            showToast('Subscription cancelled', 'success');
            ERM.components.closeModal();
          }
        }
      });
    } else {
      showToast('Cancel subscription modal coming soon', 'info');
    }
  };
  window.updatePaymentMethod = function() {
    showToast('Update payment method coming soon', 'info');
  };
  window.editBillingAddress = function() {
    showToast('Edit billing address coming soon', 'info');
  };
  window.downloadInvoice = function(invoiceId) {
    showToast('Downloading invoice ' + invoiceId + '...', 'info');
    // Simulate download
    setTimeout(function() {
      showToast('Invoice downloaded', 'success');
    }, 1000);
  };
  window.requestUpgrade = function() {
    window.location.href = 'upgrade.html';
  };

  /**
   * Load team members for transfer ownership dropdown
   */
  function loadTeamMembersForTransfer() {
    var members = getStorage('workspaceMembers') || [];
    var currentUser = getUser();
    var select = document.getElementById('transfer-member-select');

    if (!select) return;

    // Clear existing options except default
    select.innerHTML = '<option value="">Select a team member...</option>';

    // Filter out current owner and add other members
    for (var i = 0; i < members.length; i++) {
      var member = members[i];
      // Skip current user (owner)
      if (member.email === currentUser.email) continue;

      var option = document.createElement('option');
      option.value = member.id || member.email;
      option.textContent = member.name + ' (' + member.email + ')';
      option.setAttribute('data-name', member.name);
      option.setAttribute('data-email', member.email);
      select.appendChild(option);
    }

    // If no members available, show message
    if (select.options.length <= 1) {
      var noMembersOption = document.createElement('option');
      noMembersOption.value = '';
      noMembersOption.textContent = 'No team members available';
      noMembersOption.disabled = true;
      select.appendChild(noMembersOption);
    }
  }

  /**
   * Show transfer ownership confirmation modal
   */
  window.showTransferOwnershipModal = function() {
    var select = document.getElementById('transfer-member-select');
    if (!select || !select.value) {
      showToast('Please select a team member', 'error');
      return;
    }

    var selectedOption = select.options[select.selectedIndex];
    var memberName = selectedOption.getAttribute('data-name') || selectedOption.textContent;
    var memberEmail = selectedOption.getAttribute('data-email') || '';
    var workspace = null;

    if (window.ERM && ERM.state && ERM.state.workspace) {
      workspace = ERM.state.workspace;
    } else {
      workspace = getStorage('currentWorkspace') || { name: 'this workspace' };
    }

    var content = '<div class="danger-modal-content">' +
      '<div class="danger-modal-icon">' +
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">' +
      '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>' +
      '<circle cx="9" cy="7" r="4"/>' +
      '<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>' +
      '<path d="M16 3.13a4 4 0 0 1 0 7.75"/>' +
      '</svg>' +
      '</div>' +
      '<h3 style="color: #f59e0b; margin: 16px 0 8px;">Transfer Workspace Ownership?</h3>' +
      '<p style="color: #64748b; margin-bottom: 16px;">You are about to transfer ownership of <strong>' + escapeHtml(workspace.name) + '</strong> to:</p>' +
      '<div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; text-align: left; margin-bottom: 16px;">' +
      '<p style="font-weight: 600; color: #92400e; margin-bottom: 8px;">' + escapeHtml(memberName) + '</p>' +
      '<p style="color: #92400e; font-size: 14px; margin: 0;">' + escapeHtml(memberEmail) + '</p>' +
      '</div>' +
      '<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; text-align: left; margin-bottom: 16px;">' +
      '<p style="font-weight: 600; color: #991b1b; margin-bottom: 8px;">After transfer, you will:</p>' +
      '<ul style="margin: 0; padding-left: 20px; color: #991b1b; font-size: 14px;">' +
      '<li>Become a regular team member</li>' +
      '<li>Lose access to billing & subscription management</li>' +
      '<li>No longer be able to delete the workspace</li>' +
      '<li>Need the new owner\'s permission for admin actions</li>' +
      '</ul>' +
      '</div>' +
      '<div class="form-group" style="text-align: left;">' +
      '<label class="form-label">Type <strong>TRANSFER</strong> to confirm:</label>' +
      '<input type="text" class="form-input" id="confirm-transfer-input" placeholder="Type TRANSFER to confirm">' +
      '</div>' +
      '</div>';

    if (window.ERM && ERM.components && ERM.components.showModal) {
      ERM.components.showModal({
        title: 'Transfer Ownership',
        content: content,
        size: 'md',
        buttons: [
          { label: 'Cancel', type: 'secondary', action: 'close' },
          { label: 'Transfer Ownership', type: 'warning', action: 'confirm' }
        ],
        onAction: function(action) {
          if (action === 'confirm') {
            var confirmInput = document.getElementById('confirm-transfer-input');
            if (!confirmInput || confirmInput.value !== 'TRANSFER') {
              showToast('Please type TRANSFER to confirm', 'error');
              return;
            }
            transferOwnership(select.value, memberName, memberEmail);
            ERM.components.closeModal();
          }
        }
      });
    } else {
      if (confirm('Are you sure you want to transfer ownership to ' + memberName + '? You will become a regular team member and lose admin privileges.')) {
        transferOwnership(select.value, memberName, memberEmail);
      }
    }
  };

  /**
   * Transfer ownership to selected member
   */
  function transferOwnership(memberId, memberName, memberEmail) {
    var currentUser = getUser();
    var members = getStorage('workspaceMembers') || [];

    // Update current user to non-owner
    currentUser.isOwner = false;
    if (window.ERM && ERM.state) {
      ERM.state.user = currentUser;
    }
    setStorage('userProfile', currentUser);

    // Update member to owner
    for (var i = 0; i < members.length; i++) {
      if (members[i].id === memberId || members[i].email === memberEmail) {
        members[i].isOwner = true;
        members[i].role = 'Owner';
      }
    }
    setStorage('workspaceMembers', members);

    // Update workspace owner info
    var workspace = getStorage('currentWorkspace') || {};
    workspace.ownerId = memberId;
    workspace.ownerEmail = memberEmail;
    workspace.ownerName = memberName;
    setStorage('currentWorkspace', workspace);

    // Log activity
    if (window.ERM && ERM.activityLogger) {
      ERM.activityLogger.log('user', 'transferred', 'ownership', 'Ownership to ' + memberName, {});
    }

    showToast('Ownership transferred to ' + memberName, 'success');

    // Reload page to apply new permissions
    setTimeout(function() {
      window.location.reload();
    }, 1500);
  }

})();

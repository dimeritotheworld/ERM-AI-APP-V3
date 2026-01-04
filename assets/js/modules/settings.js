/**
 * Settings Module
 * ES5 Compatible
 */

if (!window.ERM) window.ERM = {};

ERM.settings = {

  /**
   * Initialize settings page
   */
  init: function() {
    console.log('Initializing Settings page...');
    this.loadCurrentSettings();
    this.render();
    this.bindEvents();
  },

  /**
   * Current settings state
   */
  currentSettings: {
    // Account
    name: '',
    email: '',
    role: '',
    workspace: '',

    // Preferences
    theme: 'light',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',

    // Notifications
    emailNotifications: true,
    riskAlerts: true,
    controlReminders: true,
    weeklyDigest: true,

    // Privacy
    analyticsEnabled: true,
    dataSharing: false
  },

  /**
   * Load current settings from storage
   */
  loadCurrentSettings: function() {
    // Load user data
    if (ERM.state.user) {
      this.currentSettings.name = ERM.state.user.name || '';
      this.currentSettings.email = ERM.state.user.email || '';
      this.currentSettings.role = ERM.state.user.role || '';
    }

    // Load workspace
    if (ERM.state.workspace) {
      this.currentSettings.workspace = ERM.state.workspace.name || '';
    }

    // Load preferences from localStorage
    var savedPrefs = ERM.storage.get('userPreferences');
    if (savedPrefs) {
      for (var key in savedPrefs) {
        if (this.currentSettings.hasOwnProperty(key)) {
          this.currentSettings[key] = savedPrefs[key];
        }
      }
    }
  },

  /**
   * Save settings to storage
   */
  saveSettings: function(section) {
    if (section === 'account') {
      // Update user object
      if (ERM.state.user) {
        ERM.state.user.name = this.currentSettings.name;
        ERM.state.user.role = this.currentSettings.role;
        ERM.session.setUser(ERM.state.user);

        // Refresh header
        ERM.components.renderHeader('header-container');
      }

      ERM.toast.success('Account settings saved');
    }

    if (section === 'workspace') {
      // Check if user is workspace owner
      var currentUser = ERM.state.user;
      var currentWorkspace = ERM.state.workspace;

      if (!currentUser || !currentWorkspace) {
        ERM.toast.error('Unable to update workspace. Please reload the page.');
        return;
      }

      // Only owner can change workspace name
      var isOwner = currentUser.role === 'owner' || currentUser.isWorkspaceOwner ||
                    (currentWorkspace.ownerId && currentWorkspace.ownerId === currentUser.id);

      if (!isOwner) {
        ERM.toast.error('Only the workspace owner can change the workspace name.');
        // Reset to current workspace name
        this.currentSettings.workspace = currentWorkspace.name || '';
        this.renderWorkspaceSettings();
        return;
      }

      // Owner can proceed with update
      ERM.state.workspace.name = this.currentSettings.workspace;
      ERM.storage.set('currentWorkspace', ERM.state.workspace);

      // Refresh sidebar
      ERM.components.renderSidebar('sidebar-container', ERM.state.currentView);

      ERM.toast.success('Workspace updated');
    }

    if (section === 'preferences' || section === 'notifications' || section === 'privacy') {
      // Save preferences
      var prefs = {
        theme: this.currentSettings.theme,
        language: this.currentSettings.language,
        dateFormat: this.currentSettings.dateFormat,
        timeFormat: this.currentSettings.timeFormat,
        emailNotifications: this.currentSettings.emailNotifications,
        riskAlerts: this.currentSettings.riskAlerts,
        controlReminders: this.currentSettings.controlReminders,
        weeklyDigest: this.currentSettings.weeklyDigest,
        analyticsEnabled: this.currentSettings.analyticsEnabled,
        dataSharing: this.currentSettings.dataSharing
      };

      ERM.storage.set('userPreferences', prefs);

      // Apply theme immediately
      if (section === 'preferences' && typeof ERM.theme !== 'undefined') {
        ERM.theme.apply(this.currentSettings.theme);
      }

      ERM.toast.success('Preferences saved');
    }
  },

  /**
   * Render settings page content
   * Note: Preferences, Notifications, Privacy, and Danger Zone moved to profile.html
   */
  render: function() {
    var container = document.getElementById('settings-content');
    if (!container) return;

    var billingSection = '';
    if (typeof ERM.billingManagement !== 'undefined') {
      billingSection = ERM.billingManagement.renderBillingSection();
    }

    var html = this.buildHeader() +
               billingSection +
               this.buildWorkspaceSection() +
               this.buildTeamManagementSection() +
               this.buildProfileLink();

    container.innerHTML = html;

    // Populate values after DOM is rendered
    setTimeout(this.populateValues.bind(this), 50);
  },

  /**
   * Build link to profile page for personal settings
   */
  buildProfileLink: function() {
    return '<div class="settings-section">' +
      '<div class="settings-section-header">' +
      '<div class="settings-section-icon">👤</div>' +
      '<div class="settings-section-title">' +
      '<h3>Personal Settings</h3>' +
      '<p>Profile, notifications, preferences, and security</p>' +
      '</div>' +
      '</div>' +
      '<div class="settings-section-body">' +
      '<p style="color: #64748b; margin-bottom: 16px;">Manage your personal settings including profile, notifications, theme preferences, privacy, and security options.</p>' +
      '<a href="profile.html" class="btn btn-primary">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
      ' Go to Profile & Settings' +
      '</a>' +
      '</div>' +
      '</div>';
  },

  /**
   * Build settings header
   */
  buildHeader: function() {
    return '<div class="settings-header">' +
      '<h2>Settings</h2>' +
      '<p>Manage your account, workspace, and preferences</p>' +
      '</div>';
  },

  /**
   * Build account settings section (removed - profile is in header dropdown)
   */
  buildAccountSection: function() {
    return '';
  },

  /**
   * Build workspace settings section
   */
  buildWorkspaceSection: function() {
    // Check if user is workspace owner
    var currentUser = ERM.state.user;
    var currentWorkspace = ERM.state.workspace;
    var isOwner = currentUser && (
      currentUser.role === 'owner' ||
      currentUser.isWorkspaceOwner ||
      (currentWorkspace && currentWorkspace.ownerId && currentWorkspace.ownerId === currentUser.id)
    );

    var ownerBadge = isOwner ? '' : '<span class="settings-owner-badge">Owner Only</span>';
    var disabledAttr = isOwner ? '' : ' disabled';
    var hintText = isOwner
      ? 'This name appears in the sidebar and exports'
      : 'Only the workspace owner can change the workspace name';

    return '<div class="settings-section">' +
      '<div class="settings-section-header">' +
      '<div class="settings-section-icon">🏢</div>' +
      '<div class="settings-section-title">' +
      '<h3>Workspace Settings</h3>' +
      '<p>Configure your workspace</p>' +
      '</div>' +
      '</div>' +
      '<div class="settings-section-body">' +
      '<div class="settings-form-group">' +
      '<label class="settings-label">Workspace Name' + ownerBadge + '</label>' +
      '<input type="text" class="settings-input" id="setting-workspace" placeholder="My Workspace"' + disabledAttr + ' />' +
      '<span class="settings-hint">' + hintText + '</span>' +
      '</div>' +
      '<div class="settings-section-actions">' +
      '<button class="btn btn-primary" id="save-workspace-btn"' + disabledAttr + '>Update Workspace</button>' +
      '</div>' +
      '</div>' +
      '</div>';
  },

  /**
   * Build team management section
   */
  buildTeamManagementSection: function() {
    var members = ERM.storage.get('workspaceMembers') || [];
    var user = ERM.state.user || { name: 'You', email: '', isOwner: false };

    // NEW: Check if current user is owner
    var isOwner = ERM.permissions && ERM.permissions.isOwner ? ERM.permissions.isOwner() : false;
    var canManage = isOwner;

    var membersHtml = '';

    // Current user
    var userInitials = ERM.utils.getInitials(user.name);
    var userRoleBadge = isOwner ? '<span class="role-badge owner">Owner</span>' : '<span class="role-badge member">Member</span>';

    membersHtml += '<div class="team-member-row">' +
      '<div class="team-member-info">' +
      '<div class="team-member-avatar" style="background: #c41e3a;">' + userInitials + '</div>' +
      '<div class="team-member-details">' +
      '<div class="team-member-name">' + ERM.utils.escapeHtml(user.name) + ' <span class="team-member-you">(You)</span></div>' +
      '<div class="team-member-email">' + ERM.utils.escapeHtml(user.email || 'No email set') + '</div>' +
      '</div>' +
      '</div>' +
      '<div class="team-member-role">' +
      userRoleBadge +
      '</div>' +
      '<div class="team-member-actions">' +
      '<span class="team-member-status online">Online</span>' +
      '</div>' +
      '</div>';

    // Other team members
    if (members.length === 0) {
      membersHtml += '<div class="team-no-members">' +
        '<p>No team members yet. Invite colleagues to collaborate on risk management.</p>' +
        '</div>';
    } else {
      for (var i = 0; i < members.length; i++) {
        var member = members[i];
        var initials = member.name ? (member.name.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase()) : '?';
        var memberRoleBadge = member.isOwner ? '<span class="role-badge owner">Owner</span>' : '<span class="role-badge member">Member</span>';
        var statusClass = member.status === 'pending' ? 'pending' : 'offline';
        var statusText = member.status === 'pending' ? 'Pending' : 'Offline';

        // Build role section - editable for owners, read-only for members
        var roleSection = '';
        if (canManage) {
          // Owner can see and change roles (future feature - currently just show badge)
          roleSection = '<div class="team-member-role">' + memberRoleBadge + '</div>';
        } else {
          // Non-owners see read-only role
          roleSection = '<div class="team-member-role">' + memberRoleBadge + '</div>';
        }

        // Build actions section - only show remove button to owners
        var actionsSection = '<div class="team-member-actions">' +
          '<span class="team-member-status ' + statusClass + '">' + statusText + '</span>';

        if (canManage) {
          actionsSection += '<button class="btn btn-sm btn-ghost team-remove-btn" data-member-id="' + member.id + '" title="Remove member">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>' +
            '</button>';
        }

        actionsSection += '</div>';

        membersHtml += '<div class="team-member-row" data-member-id="' + member.id + '">' +
          '<div class="team-member-info">' +
          '<div class="team-member-avatar" style="background: ' + (member.color || '#6366f1') + ';">' + initials + '</div>' +
          '<div class="team-member-details">' +
          '<div class="team-member-name">' + ERM.utils.escapeHtml(member.name || member.email) + '</div>' +
          '<div class="team-member-email">' + ERM.utils.escapeHtml(member.email) + '</div>' +
          '</div>' +
          '</div>' +
          roleSection +
          actionsSection +
          '</div>';
      }
    }

    // Build invite button - only for owners
    var inviteButtonHtml = '';
    if (canManage) {
      inviteButtonHtml = '<button class="btn btn-primary btn-sm" id="invite-team-btn">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>' +
        ' Invite Member' +
        '</button>';
    } else {
      inviteButtonHtml = '<button class="btn btn-primary btn-sm" disabled title="Only workspace owner can invite members" style="opacity: 0.5; cursor: not-allowed;">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>' +
        ' Invite Member' +
        '</button>';
    }

    return '<div class="settings-section" id="team-section">' +
      '<div class="settings-section-header">' +
      '<div class="settings-section-icon">👥</div>' +
      '<div class="settings-section-title">' +
      '<h3>Team Management</h3>' +
      '<p>Manage workspace members and permissions</p>' +
      '</div>' +
      inviteButtonHtml +
      '</div>' +
      '<div class="settings-section-body">' +
      '<div class="team-members-list">' +
      membersHtml +
      '</div>' +
      '<div class="team-permissions-info">' +
      '<h4>Role Permissions</h4>' +
      '<div class="permissions-grid">' +
      '<div class="permission-item">' +
      '<span class="role-badge owner">Owner</span>' +
      '<span class="permission-desc">Full workspace control including team management, settings, and ownership transfer</span>' +
      '</div>' +
      '<div class="permission-item">' +
      '<span class="role-badge member">Member</span>' +
      '<span class="permission-desc">Can view and collaborate on risks, controls, and reports</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      (canManage ? '<div class="team-ownership-transfer">' +
      '<h4>Workspace Ownership</h4>' +
      '<p class="ownership-desc">Transfer workspace ownership to another team member. This is a premium feature.</p>' +
      '<button class="btn btn-secondary btn-sm" id="transfer-ownership-btn">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>' +
      ' Transfer Ownership' +
      '</button>' +
      '</div>' : '') +
      '</div>' +
      '</div>';
  },

  /**
   * Build preferences section
   */
  buildPreferencesSection: function() {
    return '<div class="settings-section">' +
      '<div class="settings-section-header">' +
      '<div class="settings-section-icon">⚙️</div>' +
      '<div class="settings-section-title">' +
      '<h3>Preferences</h3>' +
      '<p>Customize your experience</p>' +
      '</div>' +
      '</div>' +
      '<div class="settings-section-body">' +
      '<div class="settings-form-group">' +
      '<label class="settings-label">Theme</label>' +
      '<div class="preference-cards">' +
      '<div class="preference-card" data-theme="light">' +
      '<div class="preference-card-icon">☀️</div>' +
      '<div class="preference-card-title">Light</div>' +
      '<div class="preference-card-desc">Classic bright theme</div>' +
      '</div>' +
      '<div class="preference-card" data-theme="dark">' +
      '<div class="preference-card-icon">🌙</div>' +
      '<div class="preference-card-title">Dark</div>' +
      '<div class="preference-card-desc">Easy on the eyes</div>' +
      '</div>' +
      '<div class="preference-card" data-theme="auto">' +
      '<div class="preference-card-icon">🌓</div>' +
      '<div class="preference-card-title">Auto</div>' +
      '<div class="preference-card-desc">Matches system</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="settings-form-row">' +
      '<div class="settings-form-group">' +
      '<label class="settings-label">Date Format</label>' +
      '<select class="settings-select" id="setting-date-format">' +
      '<option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</option>' +
      '<option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</option>' +
      '<option value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</option>' +
      '</select>' +
      '</div>' +
      '<div class="settings-form-group">' +
      '<label class="settings-label">Time Format</label>' +
      '<select class="settings-select" id="setting-time-format">' +
      '<option value="24h">24-hour (14:30)</option>' +
      '<option value="12h">12-hour (2:30 PM)</option>' +
      '</select>' +
      '</div>' +
      '</div>' +
      '<div class="settings-section-actions">' +
      '<button class="btn btn-primary" id="save-preferences-btn">Save Preferences</button>' +
      '</div>' +
      '</div>' +
      '</div>';
  },

  /**
   * Build notifications section
   */
  buildNotificationsSection: function() {
    return '<div class="settings-section">' +
      '<div class="settings-section-header">' +
      '<div class="settings-section-icon">🔔</div>' +
      '<div class="settings-section-title">' +
      '<h3>Notifications</h3>' +
      '<p>Manage how you receive updates</p>' +
      '</div>' +
      '</div>' +
      '<div class="settings-section-body">' +
      '<div class="settings-toggle">' +
      '<div class="settings-toggle-info">' +
      '<div class="settings-toggle-title">Email Notifications</div>' +
      '<div class="settings-toggle-desc">Receive updates via email</div>' +
      '</div>' +
      '<label class="toggle-switch">' +
      '<input type="checkbox" id="toggle-email-notifications" />' +
      '<span class="toggle-slider"></span>' +
      '</label>' +
      '</div>' +
      '<div class="settings-toggle">' +
      '<div class="settings-toggle-info">' +
      '<div class="settings-toggle-title">Risk Alerts</div>' +
      '<div class="settings-toggle-desc">Get notified when risks are updated or escalated</div>' +
      '</div>' +
      '<label class="toggle-switch">' +
      '<input type="checkbox" id="toggle-risk-alerts" />' +
      '<span class="toggle-slider"></span>' +
      '</label>' +
      '</div>' +
      '<div class="settings-toggle">' +
      '<div class="settings-toggle-info">' +
      '<div class="settings-toggle-title">Control Reminders</div>' +
      '<div class="settings-toggle-desc">Reminders for control reviews and updates</div>' +
      '</div>' +
      '<label class="toggle-switch">' +
      '<input type="checkbox" id="toggle-control-reminders" />' +
      '<span class="toggle-slider"></span>' +
      '</label>' +
      '</div>' +
      '<div class="settings-toggle">' +
      '<div class="settings-toggle-info">' +
      '<div class="settings-toggle-title">Weekly Digest</div>' +
      '<div class="settings-toggle-desc">Summary of risk activity each week</div>' +
      '</div>' +
      '<label class="toggle-switch">' +
      '<input type="checkbox" id="toggle-weekly-digest" />' +
      '<span class="toggle-slider"></span>' +
      '</label>' +
      '</div>' +
      '<div class="settings-section-actions">' +
      '<button class="btn btn-primary" id="save-notifications-btn">Save Notification Settings</button>' +
      '</div>' +
      '</div>' +
      '</div>';
  },

  /**
   * Build privacy section
   */
  buildPrivacySection: function() {
    return '<div class="settings-section">' +
      '<div class="settings-section-header">' +
      '<div class="settings-section-icon">🔒</div>' +
      '<div class="settings-section-title">' +
      '<h3>Privacy & Data</h3>' +
      '<p>Control your data and privacy</p>' +
      '</div>' +
      '</div>' +
      '<div class="settings-section-body">' +
      '<div class="settings-toggle">' +
      '<div class="settings-toggle-info">' +
      '<div class="settings-toggle-title">Analytics</div>' +
      '<div class="settings-toggle-desc">Help us improve by sharing anonymous usage data</div>' +
      '</div>' +
      '<label class="toggle-switch">' +
      '<input type="checkbox" id="toggle-analytics" />' +
      '<span class="toggle-slider"></span>' +
      '</label>' +
      '</div>' +
      '<div class="settings-toggle">' +
      '<div class="settings-toggle-info">' +
      '<div class="settings-toggle-title">Data Sharing</div>' +
      '<div class="settings-toggle-desc">Share anonymized data with industry benchmarks</div>' +
      '</div>' +
      '<label class="toggle-switch">' +
      '<input type="checkbox" id="toggle-data-sharing" />' +
      '<span class="toggle-slider"></span>' +
      '</label>' +
      '</div>' +
      '<div class="settings-section-actions">' +
      '<button class="btn btn-secondary" id="export-data-btn">Export My Data</button>' +
      '<button class="btn btn-primary" id="save-privacy-btn">Save Privacy Settings</button>' +
      '</div>' +
      '</div>' +
      '</div>';
  },

  /**
   * Build danger zone
   */
  buildDangerZone: function() {
    return '<div class="settings-section settings-danger-zone">' +
      '<div class="settings-section-header">' +
      '<div class="settings-section-icon">⚠️</div>' +
      '<div class="settings-section-title">' +
      '<h3>Danger Zone</h3>' +
      '<p>Irreversible actions</p>' +
      '</div>' +
      '</div>' +
      '<div class="settings-section-body">' +
      '<div class="settings-danger-item">' +
      '<div class="settings-danger-info">' +
      '<div class="settings-danger-title">Clear All Data</div>' +
      '<div class="settings-danger-desc">Delete all risks, controls, and settings</div>' +
      '</div>' +
      '<button class="btn btn-danger" id="clear-data-btn">Clear Data</button>' +
      '</div>' +
      '<div class="settings-danger-item">' +
      '<div class="settings-danger-info">' +
      '<div class="settings-danger-title">Delete Account</div>' +
      '<div class="settings-danger-desc">Permanently delete your account and all data</div>' +
      '</div>' +
      '<button class="btn btn-danger" id="delete-account-btn">Delete Account</button>' +
      '</div>' +
      '</div>' +
      '</div>';
  },

  /**
   * Populate form values
   */
  populateValues: function() {
    var self = this;

    // Account
    var nameInput = document.getElementById('setting-name');
    var emailInput = document.getElementById('setting-email');
    var roleInput = document.getElementById('setting-role');

    if (nameInput) nameInput.value = self.currentSettings.name;
    if (emailInput) emailInput.value = self.currentSettings.email;
    if (roleInput) roleInput.value = self.currentSettings.role;

    // Workspace
    var workspaceInput = document.getElementById('setting-workspace');
    if (workspaceInput) workspaceInput.value = self.currentSettings.workspace;

    // Preferences
    var dateFormatSelect = document.getElementById('setting-date-format');
    var timeFormatSelect = document.getElementById('setting-time-format');
    var languageSelect = document.getElementById('setting-language');

    if (dateFormatSelect) dateFormatSelect.value = self.currentSettings.dateFormat;
    if (timeFormatSelect) timeFormatSelect.value = self.currentSettings.timeFormat;
    if (languageSelect) languageSelect.value = self.currentSettings.language;

    // Theme cards
    var themeCards = document.querySelectorAll('.preference-card[data-theme]');
    for (var i = 0; i < themeCards.length; i++) {
      if (themeCards[i].getAttribute('data-theme') === self.currentSettings.theme) {
        themeCards[i].classList.add('active');
      }
    }

    // Notifications toggles
    var emailToggle = document.getElementById('toggle-email-notifications');
    var riskToggle = document.getElementById('toggle-risk-alerts');
    var controlToggle = document.getElementById('toggle-control-reminders');
    var digestToggle = document.getElementById('toggle-weekly-digest');

    if (emailToggle) emailToggle.checked = self.currentSettings.emailNotifications;
    if (riskToggle) riskToggle.checked = self.currentSettings.riskAlerts;
    if (controlToggle) controlToggle.checked = self.currentSettings.controlReminders;
    if (digestToggle) digestToggle.checked = self.currentSettings.weeklyDigest;

    // Privacy toggles
    var analyticsToggle = document.getElementById('toggle-analytics');
    var sharingToggle = document.getElementById('toggle-data-sharing');

    if (analyticsToggle) analyticsToggle.checked = self.currentSettings.analyticsEnabled;
    if (sharingToggle) sharingToggle.checked = self.currentSettings.dataSharing;
  },

  /**
   * Bind event handlers
   */
  bindEvents: function() {
    var self = this;

    setTimeout(function() {
      // Account settings
      var saveAccountBtn = document.getElementById('save-account-btn');
      if (saveAccountBtn) {
        saveAccountBtn.addEventListener('click', function() {
          var nameInput = document.getElementById('setting-name');
          var roleInput = document.getElementById('setting-role');

          self.currentSettings.name = nameInput ? nameInput.value.trim() : '';
          self.currentSettings.role = roleInput ? roleInput.value.trim() : '';

          self.saveSettings('account');
        });
      }

      // Workspace settings
      var saveWorkspaceBtn = document.getElementById('save-workspace-btn');
      if (saveWorkspaceBtn) {
        saveWorkspaceBtn.addEventListener('click', function() {
          var workspaceInput = document.getElementById('setting-workspace');
          self.currentSettings.workspace = workspaceInput ? workspaceInput.value.trim() : '';
          self.saveSettings('workspace');
        });
      }

      // Team management - Invite button
      var inviteTeamBtn = document.getElementById('invite-team-btn');
      if (inviteTeamBtn) {
        inviteTeamBtn.addEventListener('click', function() {
          if (ERM.components && ERM.components.showQuickInviteModal) {
            ERM.components.showQuickInviteModal();
          }
        });
      }

      // Team management - Transfer ownership button
      var transferOwnershipBtn = document.getElementById('transfer-ownership-btn');
      if (transferOwnershipBtn) {
        transferOwnershipBtn.addEventListener('click', function() {
          self.showTransferOwnershipUpgradeModal();
        });
      }

      // Team management - Role change
      var roleSelects = document.querySelectorAll('.team-role-select');
      for (var r = 0; r < roleSelects.length; r++) {
        roleSelects[r].addEventListener('change', function() {
          var memberId = this.getAttribute('data-member-id');
          var newRole = this.value;
          self.updateMemberRole(memberId, newRole);
        });
      }

      // Team management - Remove member
      var removeButtons = document.querySelectorAll('.team-remove-btn');
      for (var rb = 0; rb < removeButtons.length; rb++) {
        removeButtons[rb].addEventListener('click', function() {
          var memberId = this.getAttribute('data-member-id');
          self.removeMember(memberId);
        });
      }

      // Theme cards
      var themeCards = document.querySelectorAll('.preference-card[data-theme]');
      for (var i = 0; i < themeCards.length; i++) {
        themeCards[i].addEventListener('click', function() {
          // Remove active from all
          var allCards = document.querySelectorAll('.preference-card[data-theme]');
          for (var j = 0; j < allCards.length; j++) {
            allCards[j].classList.remove('active');
          }

          // Add active to clicked
          this.classList.add('active');
          self.currentSettings.theme = this.getAttribute('data-theme');
        });
      }

      // Preferences
      var savePreferencesBtn = document.getElementById('save-preferences-btn');
      if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', function() {
          var dateFormat = document.getElementById('setting-date-format');
          var timeFormat = document.getElementById('setting-time-format');
          var language = document.getElementById('setting-language');

          self.currentSettings.dateFormat = dateFormat ? dateFormat.value : 'DD/MM/YYYY';
          self.currentSettings.timeFormat = timeFormat ? timeFormat.value : '24h';
          self.currentSettings.language = language ? language.value : 'en';

          self.saveSettings('preferences');
        });
      }

      // Notifications
      var saveNotificationsBtn = document.getElementById('save-notifications-btn');
      if (saveNotificationsBtn) {
        saveNotificationsBtn.addEventListener('click', function() {
          var emailToggle = document.getElementById('toggle-email-notifications');
          var riskToggle = document.getElementById('toggle-risk-alerts');
          var controlToggle = document.getElementById('toggle-control-reminders');
          var digestToggle = document.getElementById('toggle-weekly-digest');

          self.currentSettings.emailNotifications = emailToggle ? emailToggle.checked : true;
          self.currentSettings.riskAlerts = riskToggle ? riskToggle.checked : true;
          self.currentSettings.controlReminders = controlToggle ? controlToggle.checked : true;
          self.currentSettings.weeklyDigest = digestToggle ? digestToggle.checked : true;

          self.saveSettings('notifications');
        });
      }

      // Privacy
      var savePrivacyBtn = document.getElementById('save-privacy-btn');
      if (savePrivacyBtn) {
        savePrivacyBtn.addEventListener('click', function() {
          var analyticsToggle = document.getElementById('toggle-analytics');
          var sharingToggle = document.getElementById('toggle-data-sharing');

          self.currentSettings.analyticsEnabled = analyticsToggle ? analyticsToggle.checked : true;
          self.currentSettings.dataSharing = sharingToggle ? sharingToggle.checked : false;

          self.saveSettings('privacy');
        });
      }

      var exportDataBtn = document.getElementById('export-data-btn');
      if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
          self.exportUserData();
        });
      }

      // Danger zone - Clear Data
      var clearDataBtn = document.getElementById('clear-data-btn');
      if (clearDataBtn) {
        clearDataBtn.addEventListener('click', function() {
          ERM.components.showModal({
            title: 'Clear All Data',
            content: '<p style="margin-bottom:16px;">Are you sure you want to clear all data?</p>' +
              '<p style="color:#64748b;font-size:14px;">This will delete all risks, controls, and settings. This action cannot be undone.</p>',
            buttons: [
              { label: 'Cancel', type: 'secondary', action: 'close' },
              { label: 'Clear Data', type: 'danger', action: 'confirm' }
            ],
            onAction: function(action) {
              if (action === 'confirm') {
                localStorage.removeItem('risks');
                localStorage.removeItem('controls');
                ERM.components.closeModal();
                ERM.toast.success('All data cleared');
                if (ERM.state.currentView === 'dashboard' && ERM.dashboard && ERM.dashboard.init) {
                  ERM.dashboard.init();
                }
              }
            }
          });
        });
      }

      // Danger zone - Delete Account
      var deleteAccountBtn = document.getElementById('delete-account-btn');
      if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
          ERM.components.showModal({
            title: 'Delete Account',
            content: '<p style="margin-bottom:16px;">Are you sure you want to delete your account?</p>' +
              '<p style="color:#64748b;font-size:14px;">This will permanently delete your account and all data. This action cannot be undone.</p>',
            buttons: [
              { label: 'Cancel', type: 'secondary', action: 'close' },
              { label: 'Delete Account', type: 'danger', action: 'confirm' }
            ],
            onAction: function(action) {
              if (action === 'confirm') {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'login.html';
              }
            }
          });
        });
      }
    }, 200);
  },

  /**
   * Export user data
   */
  exportUserData: function() {
    var data = {
      user: ERM.state.user,
      workspace: ERM.state.workspace,
      preferences: ERM.storage.get('userPreferences'),
      risks: ERM.storage.get('risks'),
      controls: ERM.storage.get('controls'),
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

    ERM.toast.success('Data exported successfully');
  },

  /**
   * Update member role
   * Uses team sync manager for comprehensive role update
   */
  updateMemberRole: function(memberId, newRole) {
    if (typeof ERM.teamSyncManager !== 'undefined') {
      ERM.teamSyncManager.updateMemberRole(memberId, newRole);
    } else {
      // Fallback
      var members = ERM.storage.get('workspaceMembers') || [];

      for (var i = 0; i < members.length; i++) {
        if (members[i].id === memberId) {
          members[i].role = newRole;
          break;
        }
      }

      ERM.storage.set('workspaceMembers', members);
      ERM.toast.success('Member role updated to ' + (newRole.charAt(0).toUpperCase() + newRole.slice(1)));

      if (ERM.components && ERM.components.renderHeader) {
        ERM.components.renderHeader('header-container');
      }
    }
  },

  /**
   * Remove member from workspace
   * Uses team sync manager for cascading deletion
   */
  removeMember: function(memberId) {
    // Use team sync manager for comprehensive removal
    if (typeof ERM.teamSyncManager !== 'undefined') {
      ERM.teamSyncManager.removeMember(memberId, false);
    } else {
      // Fallback to simple removal
      var members = ERM.storage.get('workspaceMembers') || [];
      var memberName = '';

      for (var i = 0; i < members.length; i++) {
        if (members[i].id === memberId) {
          memberName = members[i].name || members[i].email;
          break;
        }
      }

      if (!confirm('Are you sure you want to remove ' + memberName + ' from the workspace?')) {
        return;
      }

      var updatedMembers = [];
      for (var j = 0; j < members.length; j++) {
        if (members[j].id !== memberId) {
          updatedMembers.push(members[j]);
        }
      }

      ERM.storage.set('workspaceMembers', updatedMembers);

      var memberRow = document.querySelector('.team-member-row[data-member-id="' + memberId + '"]');
      if (memberRow) {
        memberRow.remove();
      }

      ERM.toast.success(memberName + ' has been removed from the workspace');

      if (ERM.components && ERM.components.renderHeader) {
        ERM.components.renderHeader('header-container');
      }
    }
  },

  /**
   * Show upgrade modal for transfer ownership feature
   */
  showTransferOwnershipUpgradeModal: function() {
    var content =
      '<div class="upgrade-modal-content">' +
      '<div class="upgrade-modal-icon">🔐</div>' +
      '<h3>Transfer Workspace Ownership</h3>' +
      '<p class="upgrade-modal-desc">Transfer ownership is a premium feature that allows you to reassign workspace control to another team member.</p>' +
      '<div class="upgrade-features">' +
      '<div class="upgrade-feature-item">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
      '<span>Seamless ownership transfer</span>' +
      '</div>' +
      '<div class="upgrade-feature-item">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
      '<span>Maintain full workspace history</span>' +
      '</div>' +
      '<div class="upgrade-feature-item">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
      '<span>Advanced team management controls</span>' +
      '</div>' +
      '<div class="upgrade-feature-item">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
      '<span>Priority support</span>' +
      '</div>' +
      '</div>' +
      '<div class="upgrade-pricing">' +
      '<div class="pricing-option">' +
      '<h4>Professional</h4>' +
      '<div class="pricing-amount">$29<span>/month</span></div>' +
      '<ul class="pricing-features">' +
      '<li>Unlimited team members</li>' +
      '<li>Ownership transfer</li>' +
      '<li>Advanced permissions</li>' +
      '<li>Priority support</li>' +
      '</ul>' +
      '</div>' +
      '<div class="pricing-option pricing-option-featured">' +
      '<div class="pricing-badge">Most Popular</div>' +
      '<h4>Enterprise</h4>' +
      '<div class="pricing-amount">$99<span>/month</span></div>' +
      '<ul class="pricing-features">' +
      '<li>Everything in Professional</li>' +
      '<li>SSO & SAML integration</li>' +
      '<li>Custom workflows</li>' +
      '<li>Dedicated account manager</li>' +
      '</ul>' +
      '</div>' +
      '</div>' +
      '<div class="upgrade-modal-actions">' +
      '<button class="btn btn-primary btn-full" id="upgrade-now-btn">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' +
      ' Upgrade Now' +
      '</button>' +
      '<button class="btn btn-ghost btn-full" id="upgrade-learn-more-btn">Learn More</button>' +
      '</div>' +
      '</div>';

    ERM.components.showModal({
      title: '',
      content: content,
      showClose: true,
      className: 'upgrade-modal',
      onClose: function() {
        console.log('Upgrade modal closed');
      }
    });

    // Add event listeners for upgrade actions
    setTimeout(function() {
      var upgradeNowBtn = document.getElementById('upgrade-now-btn');
      if (upgradeNowBtn) {
        upgradeNowBtn.addEventListener('click', function() {
          // Redirect to checkout page
          window.location.href = 'checkout.html';
        });
      }

      var learnMoreBtn = document.getElementById('upgrade-learn-more-btn');
      if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
          // Redirect to upgrade page
          window.location.href = 'upgrade.html';
        });
      }
    }, 100);
  }

};

console.log('Settings module loaded');

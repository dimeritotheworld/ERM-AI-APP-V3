/**
 * DIMERI.AI - ADMIN PORTAL
 * Data Management - Connected to Main ERM App Storage
 *
 * Storage Key Reference (from main ERM app):
 * - erm_currentWorkspace: Current workspace object
 * - erm_registers: Risk registers array
 * - erm_risks: All risks array
 * - erm_controls: All controls array
 * - erm_activities: Activity log
 * - erm_workspaceMembers: Team members (uses 'workspaceMembers' without prefix in profile.js)
 * - erm_userProfile: Current user profile
 * - erm_recentReports: Recent reports
 * - erm_platformAnalytics: Historical platform analytics snapshots
 */

var ADMIN = ADMIN || {};

ADMIN.data = {
  /**
   * Storage key prefix used by main ERM app
   */
  PREFIX: 'erm_',

  /**
   * Initialize analytics tracking - call this on admin portal load
   */
  initAnalytics: function() {
    // Take a daily snapshot of platform stats for trend calculation
    this.takeDailySnapshot();
  },

  /**
   * Take daily snapshot of platform stats for trend calculation
   */
  takeDailySnapshot: function() {
    var today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    var snapshots = this.getStorage('platformAnalytics') || {};

    // Only take one snapshot per day
    if (snapshots[today]) {
      return;
    }

    var stats = this.getPlatformStats();
    snapshots[today] = {
      date: today,
      timestamp: new Date().toISOString(),
      totalWorkspaces: stats.totalWorkspaces,
      totalUsers: stats.totalUsers,
      activeUsers: stats.activeUsers,
      totalRisks: stats.totalRisks,
      totalControls: stats.totalControls,
      totalReports: stats.totalReports,
      storageUsed: stats.storageUsed
    };

    // Keep only last 90 days of snapshots
    var dates = Object.keys(snapshots).sort();
    if (dates.length > 90) {
      for (var i = 0; i < dates.length - 90; i++) {
        delete snapshots[dates[i]];
      }
    }

    localStorage.setItem(this.PREFIX + 'platformAnalytics', JSON.stringify(snapshots));
    console.log('Platform analytics snapshot taken for', today);
  },

  /**
   * Get analytics snapshots
   */
  getAnalyticsSnapshots: function() {
    return this.getStorage('platformAnalytics') || {};
  },

  /**
   * Calculate trend percentage between two periods
   */
  calculateTrend: function(current, previous) {
    if (!previous || previous === 0) {
      return current > 0 ? 100 : 0;
    }
    var change = ((current - previous) / previous) * 100;
    return Math.round(change);
  },

  /**
   * Get trend data for a specific metric
   */
  getTrendData: function(metric, daysBack) {
    daysBack = daysBack || 7;
    var snapshots = this.getAnalyticsSnapshots();
    var dates = Object.keys(snapshots).sort();

    if (dates.length < 2) {
      return { trend: 0, direction: 'neutral', hasTrend: false };
    }

    // Get current value
    var latestDate = dates[dates.length - 1];
    var currentValue = snapshots[latestDate][metric] || 0;

    // Find value from daysBack ago
    var targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysBack);
    var targetDateStr = targetDate.toISOString().split('T')[0];

    // Find closest date to target
    var previousValue = 0;
    for (var i = dates.length - 1; i >= 0; i--) {
      if (dates[i] <= targetDateStr) {
        previousValue = snapshots[dates[i]][metric] || 0;
        break;
      }
    }

    var trend = this.calculateTrend(currentValue, previousValue);
    return {
      trend: Math.abs(trend),
      direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral',
      hasTrend: dates.length >= 2,
      current: currentValue,
      previous: previousValue
    };
  },

  /**
   * Get item from localStorage with ERM prefix
   */
  getStorage: function(key) {
    // Try with prefix first
    var prefixedKey = this.PREFIX + key;
    var value = localStorage.getItem(prefixedKey);

    // If not found, try without prefix (some keys don't use prefix)
    if (!value) {
      value = localStorage.getItem(key);
    }

    if (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return null;
  },

  /**
   * Get all workspaces from main ERM app
   */
  getAllWorkspaces: function() {
    var workspaces = [];

    // Get the current workspace
    var currentWorkspace = this.getStorage('currentWorkspace');
    if (currentWorkspace && currentWorkspace.id) {
      // Add plan info if not present
      if (!currentWorkspace.plan) {
        currentWorkspace.plan = 'FREE';
      }
      // Add usage data
      currentWorkspace.usage = this.getWorkspaceUsage(currentWorkspace.id);
      workspaces.push(currentWorkspace);
    }

    // In a real app, we would scan for multiple workspaces
    // For now, we work with the current workspace
    return workspaces;
  },

  /**
   * Get workspace by ID
   */
  getWorkspace: function(workspaceId) {
    var workspaces = this.getAllWorkspaces();
    for (var i = 0; i < workspaces.length; i++) {
      if (workspaces[i].id === workspaceId) {
        return workspaces[i];
      }
    }
    return null;
  },

  /**
   * Get all users from main ERM app
   */
  getAllUsers: function() {
    var users = [];
    var addedEmails = {};

    // Get current user profile
    var userProfile = this.getStorage('userProfile');
    if (userProfile && userProfile.email) {
      users.push({
        id: userProfile.id || this.generateId(),
        name: userProfile.name || userProfile.displayName || 'Unknown',
        email: userProfile.email,
        role: userProfile.role || 'Risk Manager',
        isOwner: userProfile.isOwner !== false,
        status: 'active',
        lastLogin: userProfile.lastLogin || new Date().toISOString(),
        createdAt: userProfile.createdAt || new Date().toISOString()
      });
      addedEmails[userProfile.email] = true;
    }

    // Get workspace members
    var members = this.getStorage('workspaceMembers') || [];
    for (var i = 0; i < members.length; i++) {
      var member = members[i];
      if (member.email && !addedEmails[member.email]) {
        users.push({
          id: member.id || this.generateId(),
          name: member.name || 'Unknown',
          email: member.email,
          role: member.role || 'Team Member',
          isOwner: member.isOwner || false,
          status: member.status || 'active',
          lastLogin: member.lastLogin,
          createdAt: member.createdAt || member.invitedAt
        });
        addedEmails[member.email] = true;
      }
    }

    // Get workspace owner info
    var workspace = this.getStorage('currentWorkspace');
    if (workspace && workspace.ownerEmail && !addedEmails[workspace.ownerEmail]) {
      users.push({
        id: workspace.ownerId || this.generateId(),
        name: workspace.ownerName || 'Workspace Owner',
        email: workspace.ownerEmail,
        role: 'Owner',
        isOwner: true,
        status: 'active',
        lastLogin: workspace.ownerLastLogin,
        createdAt: workspace.createdAt
      });
    }

    return users;
  },

  /**
   * Get user by ID
   */
  getUser: function(userId) {
    var users = this.getAllUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === userId) {
        return users[i];
      }
    }
    return null;
  },

  /**
   * Get workspace usage stats
   */
  getWorkspaceUsage: function(workspaceId) {
    // Count risk registers (uses 'registers' key)
    var registers = this.getStorage('registers') || [];
    var riskRegistersCount = registers.length;

    // Count total risks
    var risks = this.getStorage('risks') || [];
    var risksCount = risks.length;

    // Count controls
    var controls = this.getStorage('controls') || [];
    var controlsCount = controls.length;

    // Count reports
    var reports = this.getStorage('recentReports') || [];
    var reportsCount = reports.length;

    // Count team members
    var members = this.getStorage('workspaceMembers') || [];
    var teamMembersCount = members.length + 1; // +1 for owner

    // Calculate storage
    var storage = this.calculateStorageUsed();

    // Get AI calls
    var aiCalls = this.getStorage('aiCallsCount') || this.getStorage('aiCallCount') || 0;

    return {
      riskRegisters: riskRegistersCount,
      risks: risksCount,
      controls: controlsCount,
      reports: reportsCount,
      teamMembers: teamMembersCount,
      storage: storage,
      aiCalls: aiCalls
    };
  },

  /**
   * Calculate storage used in KB
   */
  calculateStorageUsed: function() {
    var total = 0;
    for (var key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('erm_')) {
        total += localStorage[key].length + key.length;
      }
    }
    // Convert to KB
    return Math.round(total / 1024);
  },

  /**
   * Get plan limits
   */
  getPlanLimits: function(plan) {
    var limits = {
      FREE: {
        riskRegisters: 3,
        risks: 25,
        controls: 15,
        reports: 5,
        teamMembers: 3,
        storage: 50000, // 50MB in KB
        aiCalls: 100
      },
      PRO: {
        riskRegisters: 25,
        risks: 500,
        controls: 200,
        reports: 50,
        teamMembers: 15,
        storage: 500000, // 500MB
        aiCalls: 1000
      },
      ENTERPRISE: {
        riskRegisters: -1, // Unlimited
        risks: -1,
        controls: -1,
        reports: -1,
        teamMembers: -1,
        storage: -1,
        aiCalls: -1
      }
    };

    return limits[plan] || limits.FREE;
  },

  /**
   * Check if workspace is over limit
   */
  isOverLimit: function(workspaceId) {
    var workspace = this.getWorkspace(workspaceId);
    if (!workspace) {
      // Fall back to current workspace usage
      var usage = this.getWorkspaceUsage(workspaceId);
      var limits = this.getPlanLimits('FREE');

      return usage.riskRegisters >= limits.riskRegisters ||
             usage.risks >= limits.risks ||
             usage.controls >= limits.controls ||
             usage.reports >= limits.reports ||
             usage.teamMembers >= limits.teamMembers;
    }

    var usage = workspace.usage || this.getWorkspaceUsage(workspaceId);
    var limits = this.getPlanLimits(workspace.plan || 'FREE');

    // Check each limit (skip if unlimited = -1)
    if (limits.riskRegisters !== -1 && usage.riskRegisters >= limits.riskRegisters) return true;
    if (limits.risks !== -1 && usage.risks >= limits.risks) return true;
    if (limits.controls !== -1 && usage.controls >= limits.controls) return true;
    if (limits.reports !== -1 && usage.reports >= limits.reports) return true;
    if (limits.teamMembers !== -1 && usage.teamMembers >= limits.teamMembers) return true;

    return false;
  },

  /**
   * Get usage percentage for a feature
   */
  getUsagePercentage: function(usage, limit) {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 0;
    return Math.min(100, Math.round((usage / limit) * 100));
  },

  /**
   * Get platform statistics
   */
  getPlatformStats: function() {
    var self = this;
    var workspaces = this.getAllWorkspaces();
    var users = this.getAllUsers();
    var activities = this.getStorage('activities') || [];

    // Calculate time boundaries
    var now = new Date();
    var sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    var thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate active users (users with recent login in last 7 days)
    var activeUsers = 0;
    for (var i = 0; i < users.length; i++) {
      if (users[i].lastLogin) {
        var lastLogin = new Date(users[i].lastLogin);
        if (lastLogin > sevenDaysAgo) {
          activeUsers++;
        }
      }
    }

    // Calculate new workspaces (last 7 days)
    var newWorkspaces = 0;
    for (var j = 0; j < workspaces.length; j++) {
      if (workspaces[j].createdAt) {
        var created = new Date(workspaces[j].createdAt);
        if (created > sevenDaysAgo) {
          newWorkspaces++;
        }
      }
    }

    // Calculate over-limit accounts
    var overLimitCount = 0;
    for (var k = 0; k < workspaces.length; k++) {
      if (this.isOverLimit(workspaces[k].id)) {
        overLimitCount++;
      }
    }

    // Calculate inactive workspaces (no activity in last 30 days)
    var inactiveWorkspaces = 0;
    for (var m = 0; m < workspaces.length; m++) {
      var ws = workspaces[m];
      var hasRecentActivity = false;

      // Check workspace activities
      for (var n = 0; n < activities.length; n++) {
        var activity = activities[n];
        if (activity.timestamp) {
          var activityDate = new Date(activity.timestamp);
          if (activityDate > thirtyDaysAgo) {
            hasRecentActivity = true;
            break;
          }
        }
      }

      // Also check owner last login
      if (!hasRecentActivity && ws.ownerLastLogin) {
        var ownerLogin = new Date(ws.ownerLastLogin);
        if (ownerLogin > thirtyDaysAgo) {
          hasRecentActivity = true;
        }
      }

      if (!hasRecentActivity) {
        inactiveWorkspaces++;
      }
    }

    // Calculate new users (users created in last 7 days)
    var newUsers = 0;
    for (var p = 0; p < users.length; p++) {
      if (users[p].createdAt) {
        var userCreated = new Date(users[p].createdAt);
        if (userCreated > sevenDaysAgo) {
          newUsers++;
        }
      }
    }

    // Get total usage stats
    var totalUsage = this.getWorkspaceUsage('all');

    return {
      totalWorkspaces: workspaces.length,
      totalUsers: users.length,
      activeUsers: activeUsers || users.length, // If no login tracking, assume all active
      newWorkspaces: newWorkspaces,
      newUsers: newUsers,
      overLimitAccounts: overLimitCount,
      inactiveWorkspaces: inactiveWorkspaces,
      totalRisks: totalUsage.risks,
      totalControls: totalUsage.controls,
      totalReports: totalUsage.reports,
      storageUsed: totalUsage.storage
    };
  },

  /**
   * Get recent activity
   */
  getRecentActivity: function(limit) {
    limit = limit || 20;
    var activities = this.getStorage('activities') || [];

    // Sort by timestamp descending
    activities.sort(function(a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    // Map to admin format
    return activities.slice(0, limit).map(function(activity) {
      return {
        id: activity.id,
        type: activity.type || 'general',
        action: activity.action || activity.verb || 'updated',
        target: activity.target || activity.noun || 'item',
        description: activity.description || activity.message || '',
        user: activity.user || activity.userName || 'System',
        timestamp: activity.timestamp,
        workspaceId: activity.workspaceId
      };
    });
  },

  /**
   * Get system alerts
   */
  getSystemAlerts: function() {
    var alerts = [];
    var workspaces = this.getAllWorkspaces();

    // Check for over-limit workspaces
    for (var i = 0; i < workspaces.length; i++) {
      var workspace = workspaces[i];
      if (this.isOverLimit(workspace.id)) {
        alerts.push({
          id: 'alert_overlimit_' + workspace.id,
          type: 'warning',
          title: 'Workspace Approaching Limits',
          message: (workspace.name || 'Workspace') + ' is approaching or has exceeded plan limits',
          timestamp: new Date().toISOString(),
          workspaceId: workspace.id,
          actionLabel: 'View Details',
          actionView: 'usage'
        });
      }
    }

    // Check for high storage usage
    var storage = this.calculateStorageUsed();
    var storageLimit = 50000; // 50MB default
    if (storage > storageLimit * 0.8) {
      alerts.push({
        id: 'alert_storage',
        type: 'warning',
        title: 'Storage Usage High',
        message: 'Storage usage is at ' + Math.round((storage / storageLimit) * 100) + '% of limit',
        timestamp: new Date().toISOString(),
        actionLabel: 'View Usage',
        actionView: 'usage'
      });
    }

    return alerts;
  },

  /**
   * Get pending invites
   */
  getPendingInvites: function() {
    var members = this.getStorage('workspaceMembers') || [];
    var pending = [];

    for (var i = 0; i < members.length; i++) {
      if (members[i].status === 'pending' || members[i].status === 'invited') {
        pending.push({
          id: members[i].id,
          email: members[i].email,
          role: members[i].role,
          invitedBy: members[i].invitedBy,
          invitedAt: members[i].invitedAt || members[i].createdAt,
          expiresAt: members[i].expiresAt
        });
      }
    }

    return pending;
  },

  /**
   * Get suspended users
   */
  getSuspendedUsers: function() {
    var users = this.getAllUsers();
    return users.filter(function(user) {
      return user.status === 'suspended';
    });
  },

  /**
   * Suspend workspace
   */
  suspendWorkspace: function(workspaceId, reason) {
    console.log('Suspending workspace:', workspaceId, 'Reason:', reason);

    var workspace = this.getStorage('currentWorkspace');
    if (workspace && workspace.id === workspaceId) {
      workspace.status = 'suspended';
      workspace.suspendedAt = new Date().toISOString();
      workspace.suspendReason = reason;
      localStorage.setItem('erm_currentWorkspace', JSON.stringify(workspace));

      return { success: true, message: 'Workspace suspended successfully' };
    }

    return { success: false, message: 'Workspace not found' };
  },

  /**
   * Unsuspend workspace
   */
  unsuspendWorkspace: function(workspaceId) {
    console.log('Unsuspending workspace:', workspaceId);

    var workspace = this.getStorage('currentWorkspace');
    if (workspace && workspace.id === workspaceId) {
      workspace.status = 'active';
      delete workspace.suspendedAt;
      delete workspace.suspendReason;
      localStorage.setItem('erm_currentWorkspace', JSON.stringify(workspace));

      return { success: true, message: 'Workspace reactivated successfully' };
    }

    return { success: false, message: 'Workspace not found' };
  },

  /**
   * Suspend user
   */
  suspendUser: function(userId, reason) {
    console.log('Suspending user:', userId, 'Reason:', reason);

    var members = this.getStorage('workspaceMembers') || [];
    var found = false;

    for (var i = 0; i < members.length; i++) {
      if (members[i].id === userId) {
        members[i].status = 'suspended';
        members[i].suspendedAt = new Date().toISOString();
        members[i].suspendReason = reason;
        found = true;
        break;
      }
    }

    if (found) {
      localStorage.setItem('erm_workspaceMembers', JSON.stringify(members));
      return { success: true, message: 'User suspended successfully' };
    }

    return { success: false, message: 'User not found' };
  },

  /**
   * Unsuspend user
   */
  unsuspendUser: function(userId) {
    console.log('Unsuspending user:', userId);

    var members = this.getStorage('workspaceMembers') || [];
    var found = false;

    for (var i = 0; i < members.length; i++) {
      if (members[i].id === userId) {
        members[i].status = 'active';
        delete members[i].suspendedAt;
        delete members[i].suspendReason;
        found = true;
        break;
      }
    }

    if (found) {
      localStorage.setItem('erm_workspaceMembers', JSON.stringify(members));
      return { success: true, message: 'User reactivated successfully' };
    }

    return { success: false, message: 'User not found' };
  },

  /**
   * Delete workspace (hard delete)
   */
  deleteWorkspace: function(workspaceId) {
    console.log('Deleting workspace:', workspaceId);

    // Clear all ERM data
    var keysToRemove = [];
    for (var key in localStorage) {
      if (key.startsWith('erm_')) {
        keysToRemove.push(key);
      }
    }

    for (var i = 0; i < keysToRemove.length; i++) {
      localStorage.removeItem(keysToRemove[i]);
    }

    return { success: true, message: 'Workspace and all data deleted successfully' };
  },

  /**
   * Delete user
   */
  deleteUser: function(userId) {
    console.log('Deleting user:', userId);

    var members = this.getStorage('workspaceMembers') || [];
    var filtered = members.filter(function(m) { return m.id !== userId; });

    if (filtered.length < members.length) {
      localStorage.setItem('erm_workspaceMembers', JSON.stringify(filtered));
      return { success: true, message: 'User deleted successfully' };
    }

    return { success: false, message: 'User not found' };
  },

  /**
   * Generate unique ID
   */
  generateId: function() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Format date for display
   */
  formatDate: function(dateString) {
    if (!dateString) return 'N/A';
    var date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Format relative time
   */
  formatRelativeTime: function(dateString) {
    if (!dateString) return 'N/A';

    var date = new Date(dateString);
    var now = new Date();
    var diff = now - date;

    var seconds = Math.floor(diff / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);

    if (days > 30) return this.formatDate(dateString);
    if (days > 0) return days + ' day' + (days > 1 ? 's' : '') + ' ago';
    if (hours > 0) return hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
    if (minutes > 0) return minutes + ' minute' + (minutes > 1 ? 's' : '') + ' ago';
    return 'Just now';
  },

  // ============================================
  // ADVANCED ANALYTICS & FILTERING
  // ============================================

  /**
   * Time period presets for filtering
   */
  TIME_PERIODS: {
    today: { label: 'Today', days: 0 },
    yesterday: { label: 'Yesterday', days: 1 },
    week: { label: 'This Week', days: 7 },
    month: { label: 'This Month', days: 30 },
    quarter: { label: 'This Quarter', days: 90 },
    year: { label: 'This Year', days: 365 },
    lifetime: { label: 'All Time', days: -1 }
  },

  /**
   * Get date range for a time period
   */
  getDateRange: function(period) {
    var now = new Date();
    var end = new Date(now);
    var start;

    if (period === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (period === 'yesterday') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (period === 'week') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === 'quarter') {
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (period === 'year') {
      start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    } else if (period === 'lifetime') {
      start = new Date(0); // Beginning of time
    } else if (period && period.start && period.end) {
      // Custom date range
      start = new Date(period.start);
      end = new Date(period.end);
    } else {
      // Default to last 7 days
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return { start: start, end: end };
  },

  /**
   * Filter activities by time period
   */
  getActivitiesByPeriod: function(period, workspaceId) {
    var activities = this.getStorage('activities') || [];
    var range = this.getDateRange(period);

    var filtered = [];
    for (var i = 0; i < activities.length; i++) {
      var activity = activities[i];
      if (!activity.timestamp) continue;

      var activityDate = new Date(activity.timestamp);
      if (activityDate >= range.start && activityDate <= range.end) {
        // Filter by workspace if specified
        if (workspaceId && workspaceId !== 'all') {
          if (activity.workspaceId && activity.workspaceId !== workspaceId) {
            continue;
          }
        }
        filtered.push(activity);
      }
    }

    return filtered;
  },

  /**
   * Get comprehensive analytics with time filtering
   */
  getFilteredAnalytics: function(period, workspaceId) {
    var self = this;
    var range = this.getDateRange(period);
    var activities = this.getActivitiesByPeriod(period, workspaceId);

    // Count activities by type
    var activityCounts = {
      risksCreated: 0,
      risksUpdated: 0,
      risksDeleted: 0,
      controlsCreated: 0,
      controlsUpdated: 0,
      controlsDeleted: 0,
      reportsGenerated: 0,
      usersAdded: 0,
      usersRemoved: 0,
      aiCallsMade: 0,
      logins: 0,
      exports: 0,
      total: activities.length
    };

    for (var i = 0; i < activities.length; i++) {
      var a = activities[i];
      var type = a.type || '';
      var action = a.action || '';

      if (type === 'risk') {
        if (action === 'created') activityCounts.risksCreated++;
        else if (action === 'updated' || action === 'edited') activityCounts.risksUpdated++;
        else if (action === 'deleted') activityCounts.risksDeleted++;
      } else if (type === 'control') {
        if (action === 'created') activityCounts.controlsCreated++;
        else if (action === 'updated' || action === 'edited') activityCounts.controlsUpdated++;
        else if (action === 'deleted') activityCounts.controlsDeleted++;
      } else if (type === 'report') {
        if (action === 'created' || action === 'generated') activityCounts.reportsGenerated++;
        if (action === 'exported') activityCounts.exports++;
      } else if (type === 'user') {
        if (action === 'added' || action === 'invited') activityCounts.usersAdded++;
        else if (action === 'removed' || action === 'deleted') activityCounts.usersRemoved++;
      } else if (type === 'ai' || action === 'ai_call') {
        activityCounts.aiCallsMade++;
      } else if (type === 'auth' || action === 'login') {
        activityCounts.logins++;
      } else if (action === 'exported') {
        activityCounts.exports++;
      }
    }

    return {
      period: period,
      dateRange: range,
      activities: activityCounts,
      totalActivities: activities.length,
      rawActivities: activities
    };
  },

  /**
   * Get user behavior patterns
   */
  getUserBehaviorPatterns: function(period, workspaceId) {
    var activities = this.getActivitiesByPeriod(period, workspaceId);

    // Analyze by hour of day (0-23)
    var hourlyDistribution = [];
    for (var h = 0; h < 24; h++) {
      hourlyDistribution.push({ hour: h, count: 0 });
    }

    // Analyze by day of week (0=Sunday, 6=Saturday)
    var dayOfWeekLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dailyDistribution = [];
    for (var d = 0; d < 7; d++) {
      dailyDistribution.push({ day: d, label: dayOfWeekLabels[d], count: 0 });
    }

    // Activity by user
    var userActivity = {};

    // Activity by type
    var typeDistribution = {};

    // Process activities
    for (var i = 0; i < activities.length; i++) {
      var activity = activities[i];
      if (!activity.timestamp) continue;

      var date = new Date(activity.timestamp);
      var hour = date.getHours();
      var dayOfWeek = date.getDay();

      // Increment hourly count
      hourlyDistribution[hour].count++;

      // Increment daily count
      dailyDistribution[dayOfWeek].count++;

      // Track by user
      var userName = activity.user || activity.userName || 'Unknown';
      if (!userActivity[userName]) {
        userActivity[userName] = { name: userName, count: 0, lastActive: null };
      }
      userActivity[userName].count++;
      if (!userActivity[userName].lastActive || date > new Date(userActivity[userName].lastActive)) {
        userActivity[userName].lastActive = activity.timestamp;
      }

      // Track by type
      var activityType = activity.type || 'other';
      if (!typeDistribution[activityType]) {
        typeDistribution[activityType] = 0;
      }
      typeDistribution[activityType]++;
    }

    // Find peak hours (top 3)
    var sortedHours = hourlyDistribution.slice().sort(function(a, b) {
      return b.count - a.count;
    });
    var peakHours = sortedHours.slice(0, 3).filter(function(h) { return h.count > 0; });

    // Find most active days
    var sortedDays = dailyDistribution.slice().sort(function(a, b) {
      return b.count - a.count;
    });
    var mostActiveDays = sortedDays.slice(0, 3).filter(function(d) { return d.count > 0; });

    // Convert user activity to array and sort
    var userActivityArray = [];
    for (var user in userActivity) {
      if (userActivity.hasOwnProperty(user)) {
        userActivityArray.push(userActivity[user]);
      }
    }
    userActivityArray.sort(function(a, b) {
      return b.count - a.count;
    });

    return {
      hourlyDistribution: hourlyDistribution,
      dailyDistribution: dailyDistribution,
      peakHours: peakHours,
      mostActiveDays: mostActiveDays,
      userActivity: userActivityArray,
      typeDistribution: typeDistribution,
      totalActivities: activities.length
    };
  },

  /**
   * Get engagement metrics
   */
  getEngagementMetrics: function(period, workspaceId) {
    var activities = this.getActivitiesByPeriod(period, workspaceId);
    var range = this.getDateRange(period);
    var users = this.getAllUsers();

    // Calculate days in period
    var daysDiff = Math.max(1, Math.ceil((range.end - range.start) / (1000 * 60 * 60 * 24)));

    // Active users in period
    var activeUserSet = {};
    for (var i = 0; i < activities.length; i++) {
      var user = activities[i].user || activities[i].userName;
      if (user) {
        activeUserSet[user] = true;
      }
    }
    var activeUsersCount = Object.keys(activeUserSet).length;

    // Daily active users average
    var dailyActivityMap = {};
    for (var j = 0; j < activities.length; j++) {
      if (!activities[j].timestamp) continue;
      var dateStr = activities[j].timestamp.split('T')[0];
      if (!dailyActivityMap[dateStr]) {
        dailyActivityMap[dateStr] = {};
      }
      var userName = activities[j].user || activities[j].userName || 'Unknown';
      dailyActivityMap[dateStr][userName] = true;
    }

    var totalDailyActiveUsers = 0;
    var daysWithActivity = 0;
    for (var date in dailyActivityMap) {
      if (dailyActivityMap.hasOwnProperty(date)) {
        totalDailyActiveUsers += Object.keys(dailyActivityMap[date]).length;
        daysWithActivity++;
      }
    }
    var avgDailyActiveUsers = daysWithActivity > 0 ? Math.round(totalDailyActiveUsers / daysWithActivity * 10) / 10 : 0;

    // Activities per user
    var activitiesPerUser = activeUsersCount > 0 ? Math.round(activities.length / activeUsersCount * 10) / 10 : 0;

    // Activities per day
    var activitiesPerDay = Math.round(activities.length / daysDiff * 10) / 10;

    // Feature engagement
    var featureUsage = {
      risks: 0,
      controls: 0,
      reports: 0,
      ai: 0,
      exports: 0,
      team: 0
    };
    for (var k = 0; k < activities.length; k++) {
      var type = activities[k].type || '';
      var action = activities[k].action || '';
      if (type === 'risk') featureUsage.risks++;
      else if (type === 'control') featureUsage.controls++;
      else if (type === 'report') featureUsage.reports++;
      else if (type === 'ai' || action === 'ai_call') featureUsage.ai++;
      else if (action === 'exported') featureUsage.exports++;
      else if (type === 'user') featureUsage.team++;
    }

    // Calculate engagement score (0-100)
    var engagementScore = 0;
    if (users.length > 0) {
      var participationRate = (activeUsersCount / users.length) * 40; // 40% weight
      var activityRate = Math.min(activitiesPerDay * 5, 30); // 30% weight, capped
      var diversityScore = 0;
      var featuresUsed = 0;
      for (var feat in featureUsage) {
        if (featureUsage.hasOwnProperty(feat) && featureUsage[feat] > 0) {
          featuresUsed++;
        }
      }
      diversityScore = (featuresUsed / 6) * 30; // 30% weight
      engagementScore = Math.round(participationRate + activityRate + diversityScore);
    }

    return {
      totalUsers: users.length,
      activeUsers: activeUsersCount,
      participationRate: users.length > 0 ? Math.round((activeUsersCount / users.length) * 100) : 0,
      avgDailyActiveUsers: avgDailyActiveUsers,
      activitiesPerUser: activitiesPerUser,
      activitiesPerDay: activitiesPerDay,
      totalActivities: activities.length,
      featureUsage: featureUsage,
      engagementScore: engagementScore,
      daysInPeriod: daysDiff
    };
  },

  /**
   * Get activity timeline for charts
   */
  getActivityTimeline: function(period, workspaceId, granularity) {
    granularity = granularity || 'day'; // 'hour', 'day', 'week', 'month'
    var activities = this.getActivitiesByPeriod(period, workspaceId);
    var range = this.getDateRange(period);

    var timeline = {};

    for (var i = 0; i < activities.length; i++) {
      if (!activities[i].timestamp) continue;
      var date = new Date(activities[i].timestamp);
      var key;

      if (granularity === 'hour') {
        key = date.toISOString().substring(0, 13); // YYYY-MM-DDTHH
      } else if (granularity === 'day') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (granularity === 'week') {
        // Get week number
        var startOfYear = new Date(date.getFullYear(), 0, 1);
        var weekNum = Math.ceil(((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
        key = date.getFullYear() + '-W' + (weekNum < 10 ? '0' : '') + weekNum;
      } else if (granularity === 'month') {
        key = date.toISOString().substring(0, 7); // YYYY-MM
      }

      if (!timeline[key]) {
        timeline[key] = { date: key, count: 0, types: {} };
      }
      timeline[key].count++;

      var actType = activities[i].type || 'other';
      if (!timeline[key].types[actType]) {
        timeline[key].types[actType] = 0;
      }
      timeline[key].types[actType]++;
    }

    // Convert to sorted array
    var timelineArray = [];
    for (var k in timeline) {
      if (timeline.hasOwnProperty(k)) {
        timelineArray.push(timeline[k]);
      }
    }
    timelineArray.sort(function(a, b) {
      return a.date.localeCompare(b.date);
    });

    return timelineArray;
  },

  /**
   * Get session analytics (approximate based on activity gaps)
   */
  getSessionAnalytics: function(period, workspaceId) {
    var activities = this.getActivitiesByPeriod(period, workspaceId);

    // Sort by timestamp
    activities.sort(function(a, b) {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

    // Define session timeout (30 minutes)
    var SESSION_TIMEOUT = 30 * 60 * 1000;

    var sessions = [];
    var currentSession = null;

    for (var i = 0; i < activities.length; i++) {
      var activity = activities[i];
      if (!activity.timestamp) continue;

      var activityTime = new Date(activity.timestamp);
      var user = activity.user || activity.userName || 'Unknown';

      if (!currentSession ||
          currentSession.user !== user ||
          activityTime - currentSession.lastActivity > SESSION_TIMEOUT) {
        // Start new session
        if (currentSession) {
          currentSession.duration = currentSession.lastActivity - currentSession.startTime;
          sessions.push(currentSession);
        }
        currentSession = {
          user: user,
          startTime: activityTime,
          lastActivity: activityTime,
          activityCount: 1,
          duration: 0
        };
      } else {
        // Continue session
        currentSession.lastActivity = activityTime;
        currentSession.activityCount++;
      }
    }

    // Don't forget the last session
    if (currentSession) {
      currentSession.duration = currentSession.lastActivity - currentSession.startTime;
      sessions.push(currentSession);
    }

    // Calculate stats
    var totalSessions = sessions.length;
    var totalDuration = 0;
    var totalActivities = 0;

    for (var j = 0; j < sessions.length; j++) {
      totalDuration += sessions[j].duration;
      totalActivities += sessions[j].activityCount;
    }

    var avgSessionDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions / 1000 / 60) : 0; // in minutes
    var avgActivitiesPerSession = totalSessions > 0 ? Math.round(totalActivities / totalSessions * 10) / 10 : 0;

    return {
      totalSessions: totalSessions,
      avgSessionDuration: avgSessionDuration, // minutes
      avgActivitiesPerSession: avgActivitiesPerSession,
      sessions: sessions.slice(-20) // Last 20 sessions for display
    };
  },

  /**
   * Compare two periods for trend analysis
   */
  comparePeriods: function(currentPeriod, previousPeriod, workspaceId) {
    var currentAnalytics = this.getFilteredAnalytics(currentPeriod, workspaceId);
    var previousAnalytics = this.getFilteredAnalytics(previousPeriod, workspaceId);

    var self = this;

    function calcChange(current, previous) {
      if (!previous || previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return Math.round(((current - previous) / previous) * 100);
    }

    return {
      current: currentAnalytics,
      previous: previousAnalytics,
      changes: {
        totalActivities: calcChange(currentAnalytics.totalActivities, previousAnalytics.totalActivities),
        risksCreated: calcChange(currentAnalytics.activities.risksCreated, previousAnalytics.activities.risksCreated),
        controlsCreated: calcChange(currentAnalytics.activities.controlsCreated, previousAnalytics.activities.controlsCreated),
        reportsGenerated: calcChange(currentAnalytics.activities.reportsGenerated, previousAnalytics.activities.reportsGenerated),
        aiCallsMade: calcChange(currentAnalytics.activities.aiCallsMade, previousAnalytics.activities.aiCallsMade)
      }
    };
  },

  /**
   * Get quick stats for a specific time period
   */
  getQuickStats: function(period, workspaceId) {
    var analytics = this.getFilteredAnalytics(period, workspaceId);
    var engagement = this.getEngagementMetrics(period, workspaceId);
    var behavior = this.getUserBehaviorPatterns(period, workspaceId);

    return {
      period: period,
      totalActivities: analytics.totalActivities,
      activeUsers: engagement.activeUsers,
      participationRate: engagement.participationRate,
      engagementScore: engagement.engagementScore,
      topFeature: this.getTopFeature(behavior.typeDistribution),
      peakHour: behavior.peakHours.length > 0 ? behavior.peakHours[0].hour : null,
      mostActiveDay: behavior.mostActiveDays.length > 0 ? behavior.mostActiveDays[0].label : null,
      activitiesPerDay: engagement.activitiesPerDay
    };
  },

  /**
   * Get top feature from type distribution
   */
  getTopFeature: function(typeDistribution) {
    var topFeature = null;
    var maxCount = 0;
    for (var type in typeDistribution) {
      if (typeDistribution.hasOwnProperty(type) && typeDistribution[type] > maxCount) {
        maxCount = typeDistribution[type];
        topFeature = type;
      }
    }
    return topFeature;
  }
};

console.log('Admin Data module loaded - Connected to ERM storage');

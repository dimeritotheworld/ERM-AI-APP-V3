/**
 * DIMERI.AI - ADMIN PORTAL
 * Dashboard Module
 *
 * TOP 10 ANALYTICS TRACKED (Privacy-Compliant):
 * 1. Total Workspaces - Organization count
 * 2. Active Users (7d) - Users with recent activity
 * 3. New Signups (7d) - New workspace/user registrations
 * 4. Over-Limit Accounts - Accounts needing upgrade
 * 5. Inactive Workspaces (30d) - Churn risk indicator
 * 6. Total Risks Created - Platform usage depth
 * 7. Total Controls - Control framework adoption
 * 8. AI Usage - AI feature adoption rate
 * 9. Storage Utilization - Resource consumption
 * 10. Feature Engagement - Which features are used
 */

var ADMIN = ADMIN || {};

ADMIN.dashboard = {
  /**
   * Currently selected workspace filter ('all' or workspace ID)
   */
  selectedWorkspace: 'all',

  /**
   * Currently selected time period filter
   */
  selectedPeriod: 'week',

  /**
   * Render dashboard view
   */
  render: function() {
    // Initialize analytics tracking on each render
    if (ADMIN.data.initAnalytics) {
      ADMIN.data.initAnalytics();
    }

    var self = this;
    var workspaces = ADMIN.data.getAllWorkspaces();
    var stats = this.selectedWorkspace === 'all'
      ? ADMIN.data.getPlatformStats()
      : this.getFilteredStats(this.selectedWorkspace);
    var recentActivity = ADMIN.data.getRecentActivity(10);
    var alerts = ADMIN.data.getSystemAlerts();

    var html =
      '<div class="admin-content-header">' +
      '<div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">' +
      '<div>' +
      '<h1 class="admin-content-title">Platform Overview</h1>' +
      '<p class="admin-content-subtitle">Monitor workspace activity, users, and system health</p>' +
      '</div>' +
      // Filter controls
      '<div style="display: flex; gap: 16px; align-items: flex-end;">' +
      // Time period filter dropdown
      '<div class="admin-filter-group">' +
      '<label style="font-size: 12px; color: var(--admin-gray-500); margin-bottom: 4px; display: block;">Time Period</label>' +
      '<select id="period-filter" class="admin-select" style="min-width: 140px;" onchange="ADMIN.dashboard.onPeriodFilterChange(this.value)">' +
      this.renderPeriodOptions() +
      '</select>' +
      '</div>' +
      // Workspace filter dropdown
      '<div class="admin-workspace-filter">' +
      '<label style="font-size: 12px; color: var(--admin-gray-500); margin-bottom: 4px; display: block;">Workspace</label>' +
      '<select id="workspace-filter" class="admin-select" style="min-width: 180px;" onchange="ADMIN.dashboard.onWorkspaceFilterChange(this.value)">' +
      '<option value="all"' + (this.selectedWorkspace === 'all' ? ' selected' : '') + '>All Workspaces</option>' +
      this.renderWorkspaceOptions(workspaces) +
      '</select>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +

      // KPI Cards
      this.renderKPICards(stats) +

      // Secondary metrics row
      this.renderSecondaryMetrics(stats) +

      // User Behavior Analytics Panel
      this.renderBehaviorAnalytics() +

      '<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-top: 32px;">' +

      // Activity Feed
      '<div>' +
      this.renderActivityFeed(recentActivity) +
      '</div>' +

      // Alerts Panel
      '<div>' +
      this.renderAlertsPanel(alerts) +
      '</div>' +

      '</div>';

    var contentArea = document.getElementById('admin-content');
    if (contentArea) {
      contentArea.innerHTML = html;
    }
  },

  /**
   * Render trend indicator
   */
  renderTrend: function(metric, period) {
    period = period || 7;
    var trendData = ADMIN.data.getTrendData ? ADMIN.data.getTrendData(metric, period) : null;

    if (!trendData || !trendData.hasTrend) {
      return '<span class="admin-kpi-period">No trend data yet</span>';
    }

    var trendClass = trendData.direction === 'up' ? 'up' : trendData.direction === 'down' ? 'down' : '';
    var trendSign = trendData.direction === 'up' ? '+' : trendData.direction === 'down' ? '-' : '';
    var periodLabel = period === 7 ? 'vs last week' : period === 30 ? 'vs last month' : 'vs previous';

    if (trendData.trend === 0) {
      return '<span class="admin-kpi-period">No change ' + periodLabel + '</span>';
    }

    return '<span class="admin-kpi-trend ' + trendClass + '">' + trendSign + trendData.trend + '%</span>' +
           '<span class="admin-kpi-period">' + periodLabel + '</span>';
  },

  /**
   * Render KPI cards - Top 5 most important metrics
   */
  renderKPICards: function(stats) {
    return '<div class="admin-kpi-grid">' +

      // Card 1: Total Workspaces
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-header">' +
      '<div class="admin-kpi-title">Total Workspaces</div>' +
      '<div class="admin-kpi-icon">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>' +
      '</svg>' +
      '</div>' +
      '</div>' +
      '<div class="admin-kpi-value">' + ADMIN.utils.formatNumber(stats.totalWorkspaces) + '</div>' +
      '<div class="admin-kpi-footer">' +
      this.renderTrend('totalWorkspaces', 30) +
      '</div>' +
      '</div>' +

      // Card 2: Active Users (7d)
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-header">' +
      '<div class="admin-kpi-title">Active Users (7d)</div>' +
      '<div class="admin-kpi-icon">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>' +
      '<circle cx="9" cy="7" r="4"></circle>' +
      '</svg>' +
      '</div>' +
      '</div>' +
      '<div class="admin-kpi-value">' + ADMIN.utils.formatNumber(stats.activeUsers) + '</div>' +
      '<div class="admin-kpi-footer">' +
      this.renderTrend('activeUsers', 7) +
      '</div>' +
      '</div>' +

      // Card 3: New Signups (7d) - Combined workspaces + users
      '<div class="admin-kpi-card">' +
      '<div class="admin-kpi-header">' +
      '<div class="admin-kpi-title">New Signups (7d)</div>' +
      '<div class="admin-kpi-icon">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>' +
      '<circle cx="8.5" cy="7" r="4"></circle>' +
      '<line x1="20" y1="8" x2="20" y2="14"></line>' +
      '<line x1="23" y1="11" x2="17" y2="11"></line>' +
      '</svg>' +
      '</div>' +
      '</div>' +
      '<div class="admin-kpi-value">' + ADMIN.utils.formatNumber((stats.newWorkspaces || 0) + (stats.newUsers || 0)) + '</div>' +
      '<div class="admin-kpi-footer">' +
      '<span class="admin-kpi-period">' + (stats.newWorkspaces || 0) + ' workspaces, ' + (stats.newUsers || 0) + ' users</span>' +
      '</div>' +
      '</div>' +

      // Card 4: Over-Limit Accounts
      '<div class="admin-kpi-card' + (stats.overLimitAccounts > 0 ? ' admin-kpi-card-warning' : '') + '">' +
      '<div class="admin-kpi-header">' +
      '<div class="admin-kpi-title">Over-Limit Accounts</div>' +
      '<div class="admin-kpi-icon">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<circle cx="12" cy="12" r="10"></circle>' +
      '<line x1="12" y1="8" x2="12" y2="12"></line>' +
      '<line x1="12" y1="16" x2="12.01" y2="16"></line>' +
      '</svg>' +
      '</div>' +
      '</div>' +
      '<div class="admin-kpi-value">' + ADMIN.utils.formatNumber(stats.overLimitAccounts) + '</div>' +
      '<div class="admin-kpi-footer">' +
      '<span class="admin-kpi-period">' + (stats.overLimitAccounts > 0 ? 'Upgrade candidates' : 'All within limits') + '</span>' +
      '</div>' +
      '</div>' +

      // Card 5: Inactive Workspaces (churn risk)
      '<div class="admin-kpi-card' + (stats.inactiveWorkspaces > 0 ? ' admin-kpi-card-danger' : '') + '">' +
      '<div class="admin-kpi-header">' +
      '<div class="admin-kpi-title">Inactive (30d)</div>' +
      '<div class="admin-kpi-icon">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<circle cx="12" cy="12" r="10"></circle>' +
      '<polyline points="12 6 12 12 16 14"></polyline>' +
      '</svg>' +
      '</div>' +
      '</div>' +
      '<div class="admin-kpi-value">' + ADMIN.utils.formatNumber(stats.inactiveWorkspaces || 0) + '</div>' +
      '<div class="admin-kpi-footer">' +
      '<span class="admin-kpi-period">' + (stats.inactiveWorkspaces > 0 ? 'Churn risk - re-engage' : 'All active') + '</span>' +
      '</div>' +
      '</div>' +

      '</div>';
  },

  /**
   * Render secondary metrics row - Usage depth indicators
   */
  renderSecondaryMetrics: function(stats) {
    // Use filtered workspace if selected, otherwise 'all'
    var workspaceId = this.selectedWorkspace || 'all';
    var usage = ADMIN.data.getWorkspaceUsage ? ADMIN.data.getWorkspaceUsage(workspaceId) : {};

    return '<div class="admin-secondary-metrics" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-top: 24px;">' +

      // Total Risks
      '<div class="admin-metric-card" style="background: var(--admin-gray-50); border-radius: 8px; padding: 16px;">' +
      '<div style="font-size: 12px; color: var(--admin-gray-500); margin-bottom: 4px;">Total Risks</div>' +
      '<div style="font-size: 20px; font-weight: 600; color: var(--admin-gray-900);">' + ADMIN.utils.formatNumber(stats.totalRisks || 0) + '</div>' +
      '</div>' +

      // Total Controls
      '<div class="admin-metric-card" style="background: var(--admin-gray-50); border-radius: 8px; padding: 16px;">' +
      '<div style="font-size: 12px; color: var(--admin-gray-500); margin-bottom: 4px;">Total Controls</div>' +
      '<div style="font-size: 20px; font-weight: 600; color: var(--admin-gray-900);">' + ADMIN.utils.formatNumber(stats.totalControls || 0) + '</div>' +
      '</div>' +

      // Total Reports
      '<div class="admin-metric-card" style="background: var(--admin-gray-50); border-radius: 8px; padding: 16px;">' +
      '<div style="font-size: 12px; color: var(--admin-gray-500); margin-bottom: 4px;">Reports Generated</div>' +
      '<div style="font-size: 20px; font-weight: 600; color: var(--admin-gray-900);">' + ADMIN.utils.formatNumber(stats.totalReports || 0) + '</div>' +
      '</div>' +

      // AI Usage
      '<div class="admin-metric-card" style="background: var(--admin-gray-50); border-radius: 8px; padding: 16px;">' +
      '<div style="font-size: 12px; color: var(--admin-gray-500); margin-bottom: 4px;">AI Calls Used</div>' +
      '<div style="font-size: 20px; font-weight: 600; color: var(--admin-gray-900);">' + ADMIN.utils.formatNumber(usage.aiCalls || 0) + '</div>' +
      '</div>' +

      // Storage
      '<div class="admin-metric-card" style="background: var(--admin-gray-50); border-radius: 8px; padding: 16px;">' +
      '<div style="font-size: 12px; color: var(--admin-gray-500); margin-bottom: 4px;">Storage Used</div>' +
      '<div style="font-size: 20px; font-weight: 600; color: var(--admin-gray-900);">' + ADMIN.utils.formatStorage(stats.storageUsed || 0) + '</div>' +
      '</div>' +

      '</div>';
  },

  /**
   * Render activity feed
   */
  renderActivityFeed: function(activities) {
    var html =
      '<div class="admin-table-container">' +
      '<div style="padding: 20px; border-bottom: 1px solid var(--admin-gray-200);">' +
      '<h3 style="font-size: 16px; font-weight: 600; color: var(--admin-gray-900);">Recent Activity</h3>' +
      '<p style="font-size: 13px; color: var(--admin-gray-500); margin-top: 4px;">Real-time platform activity stream</p>' +
      '</div>' +
      '<div style="padding: 12px;">';

    if (activities.length === 0) {
      html += '<div class="admin-empty-state" style="padding: 40px 20px;">' +
        '<div class="admin-empty-icon">📊</div>' +
        '<div class="admin-empty-title">No recent activity</div>' +
        '<div class="admin-empty-text">Platform activity will appear here</div>' +
        '</div>';
    } else {
      for (var i = 0; i < activities.length; i++) {
        var activity = activities[i];
        html += this.renderActivityItem(activity);
      }
    }

    html += '</div></div>';
    return html;
  },

  /**
   * Render single activity item
   */
  renderActivityItem: function(activity) {
    var icon = this.getActivityIcon(activity.type);

    return '<div style="padding: 12px; border-bottom: 1px solid var(--admin-gray-100); display: flex; gap: 12px; align-items: start;">' +
      '<div style="width: 36px; height: 36px; border-radius: 6px; background: var(--admin-gray-100); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">' +
      icon +
      '</div>' +
      '<div style="flex: 1; min-width: 0;">' +
      '<div style="font-size: 14px; color: var(--admin-gray-900); margin-bottom: 2px;">' +
      ADMIN.utils.escapeHtml(activity.description || 'Activity') +
      '</div>' +
      '<div style="font-size: 12px; color: var(--admin-gray-500);">' +
      ADMIN.utils.getRelativeTime(activity.timestamp) +
      (activity.user ? ' • ' + ADMIN.utils.escapeHtml(activity.user) : '') +
      '</div>' +
      '</div>' +
      '</div>';
  },

  /**
   * Get activity icon
   */
  getActivityIcon: function(type) {
    var icons = {
      workspace_created: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>',
      user_invited: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>',
      risk_created: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
      report_generated: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
    };
    return icons[type] || '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>';
  },

  /**
   * Render alerts panel
   */
  renderAlertsPanel: function(alerts) {
    var html =
      '<div class="admin-table-container">' +
      '<div style="padding: 20px; border-bottom: 1px solid var(--admin-gray-200);">' +
      '<h3 style="font-size: 16px; font-weight: 600; color: var(--admin-gray-900);">System Alerts</h3>' +
      '<p style="font-size: 13px; color: var(--admin-gray-500); margin-top: 4px;">Automated and manual flags</p>' +
      '</div>' +
      '<div style="padding: 12px;">';

    if (alerts.length === 0) {
      html += '<div class="admin-empty-state" style="padding: 40px 20px;">' +
        '<div class="admin-empty-icon">✅</div>' +
        '<div class="admin-empty-title">All clear</div>' +
        '<div class="admin-empty-text">No active alerts</div>' +
        '</div>';
    } else {
      for (var i = 0; i < alerts.length; i++) {
        var alert = alerts[i];
        html += this.renderAlertItem(alert);
      }
    }

    html += '</div></div>';
    return html;
  },

  /**
   * Render single alert item
   */
  renderAlertItem: function(alert) {
    var iconColor = alert.type === 'error' ? '#ef4444' : alert.type === 'warning' ? '#f59e0b' : '#06b6d4';

    return '<div style="padding: 12px; border-bottom: 1px solid var(--admin-gray-100); display: flex; gap: 12px; align-items: start;">' +
      '<div style="width: 8px; height: 8px; border-radius: 50%; background: ' + iconColor + '; margin-top: 6px; flex-shrink: 0;"></div>' +
      '<div style="flex: 1; min-width: 0;">' +
      '<div style="font-size: 14px; font-weight: 500; color: var(--admin-gray-900); margin-bottom: 2px;">' +
      ADMIN.utils.escapeHtml(alert.title) +
      '</div>' +
      '<div style="font-size: 13px; color: var(--admin-gray-600); margin-bottom: 6px;">' +
      ADMIN.utils.escapeHtml(alert.message) +
      '</div>' +
      '<div style="font-size: 12px; color: var(--admin-gray-500);">' +
      ADMIN.utils.getRelativeTime(alert.timestamp) +
      '</div>' +
      '</div>' +
      '</div>';
  },

  /**
   * Render workspace options for filter dropdown
   */
  renderWorkspaceOptions: function(workspaces) {
    var html = '';
    for (var i = 0; i < workspaces.length; i++) {
      var ws = workspaces[i];
      var selected = this.selectedWorkspace === ws.id ? ' selected' : '';
      html += '<option value="' + ws.id + '"' + selected + '>' + ADMIN.utils.escapeHtml(ws.name || 'Unnamed Workspace') + '</option>';
    }
    return html;
  },

  /**
   * Handle workspace filter change
   */
  onWorkspaceFilterChange: function(workspaceId) {
    this.selectedWorkspace = workspaceId;
    this.render();
  },

  /**
   * Get filtered stats for a specific workspace
   */
  getFilteredStats: function(workspaceId) {
    var workspace = ADMIN.data.getWorkspace(workspaceId);
    var usage = ADMIN.data.getWorkspaceUsage(workspaceId);
    var users = ADMIN.data.getAllUsers();

    // Calculate time boundaries
    var now = new Date();
    var sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    var thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate active users for this workspace (last 7 days)
    var activeUsers = 0;
    for (var i = 0; i < users.length; i++) {
      if (users[i].lastLogin) {
        var lastLogin = new Date(users[i].lastLogin);
        if (lastLogin > sevenDaysAgo) {
          activeUsers++;
        }
      }
    }

    // Calculate new users for this workspace (last 7 days)
    var newUsers = 0;
    for (var j = 0; j < users.length; j++) {
      if (users[j].createdAt) {
        var userCreated = new Date(users[j].createdAt);
        if (userCreated > sevenDaysAgo) {
          newUsers++;
        }
      }
    }

    // Check if workspace was created in last 7 days
    var newWorkspaces = 0;
    if (workspace && workspace.createdAt) {
      var wsCreated = new Date(workspace.createdAt);
      if (wsCreated > sevenDaysAgo) {
        newWorkspaces = 1;
      }
    }

    // Check if this workspace is over limit
    var overLimitAccounts = ADMIN.data.isOverLimit(workspaceId) ? 1 : 0;

    // Check if this workspace is inactive (no activity in 30 days)
    var inactiveWorkspaces = 0;
    var activities = ADMIN.data.getStorage('activities') || [];
    var hasRecentActivity = false;
    for (var k = 0; k < activities.length; k++) {
      if (activities[k].timestamp) {
        var activityDate = new Date(activities[k].timestamp);
        if (activityDate > thirtyDaysAgo) {
          hasRecentActivity = true;
          break;
        }
      }
    }
    if (!hasRecentActivity) {
      inactiveWorkspaces = 1;
    }

    return {
      totalWorkspaces: 1,
      totalUsers: users.length,
      activeUsers: activeUsers || users.length,
      newWorkspaces: newWorkspaces,
      newUsers: newUsers,
      overLimitAccounts: overLimitAccounts,
      inactiveWorkspaces: inactiveWorkspaces,
      totalRisks: usage.risks || 0,
      totalControls: usage.controls || 0,
      totalReports: usage.reports || 0,
      storageUsed: usage.storage || 0
    };
  },

  /**
   * Render time period options for filter dropdown
   */
  renderPeriodOptions: function() {
    var periods = [
      { value: 'today', label: 'Today' },
      { value: 'yesterday', label: 'Yesterday' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
      { value: 'quarter', label: 'This Quarter' },
      { value: 'year', label: 'This Year' },
      { value: 'lifetime', label: 'All Time' }
    ];

    var html = '';
    for (var i = 0; i < periods.length; i++) {
      var p = periods[i];
      var selected = this.selectedPeriod === p.value ? ' selected' : '';
      html += '<option value="' + p.value + '"' + selected + '>' + p.label + '</option>';
    }
    return html;
  },

  /**
   * Handle time period filter change
   */
  onPeriodFilterChange: function(period) {
    this.selectedPeriod = period;
    this.render();
  },

  /**
   * Render user behavior analytics panel
   */
  renderBehaviorAnalytics: function() {
    var period = this.selectedPeriod;
    var workspaceId = this.selectedWorkspace;

    // Get analytics data
    var behavior = ADMIN.data.getUserBehaviorPatterns ? ADMIN.data.getUserBehaviorPatterns(period, workspaceId) : null;
    var engagement = ADMIN.data.getEngagementMetrics ? ADMIN.data.getEngagementMetrics(period, workspaceId) : null;
    var sessions = ADMIN.data.getSessionAnalytics ? ADMIN.data.getSessionAnalytics(period, workspaceId) : null;

    if (!behavior || !engagement) {
      return '';
    }

    var periodLabel = this.getPeriodLabel(period);

    return '<div class="admin-behavior-analytics" style="margin-top: 32px;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">' +
      '<h2 style="font-size: 18px; font-weight: 600; color: var(--admin-gray-900);">User Behavior Analytics</h2>' +
      '<span style="font-size: 13px; color: var(--admin-gray-500);">' + periodLabel + '</span>' +
      '</div>' +

      '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">' +

      // Engagement Score Card
      '<div class="admin-analytics-card" style="background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--admin-gray-200);">' +
      '<div style="display: flex; justify-content: space-between; align-items: start;">' +
      '<div>' +
      '<div style="font-size: 12px; color: var(--admin-gray-500); margin-bottom: 8px;">Engagement Score</div>' +
      '<div style="font-size: 32px; font-weight: 700; color: ' + this.getScoreColor(engagement.engagementScore) + ';">' + engagement.engagementScore + '</div>' +
      '</div>' +
      '<div style="width: 48px; height: 48px; border-radius: 50%; background: ' + this.getScoreColor(engagement.engagementScore) + '20; display: flex; align-items: center; justify-content: center;">' +
      this.getScoreIcon(engagement.engagementScore) +
      '</div>' +
      '</div>' +
      '<div style="margin-top: 12px; font-size: 12px; color: var(--admin-gray-600);">' +
      engagement.participationRate + '% participation rate' +
      '</div>' +
      '</div>' +

      // Activities Per Day Card
      '<div class="admin-analytics-card" style="background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--admin-gray-200);">' +
      '<div style="font-size: 12px; color: var(--admin-gray-500); margin-bottom: 8px;">Avg. Activities/Day</div>' +
      '<div style="font-size: 32px; font-weight: 700; color: var(--admin-gray-900);">' + engagement.activitiesPerDay + '</div>' +
      '<div style="margin-top: 12px; font-size: 12px; color: var(--admin-gray-600);">' +
      ADMIN.utils.formatNumber(engagement.totalActivities) + ' total activities' +
      '</div>' +
      '</div>' +

      // Peak Usage Time Card
      '<div class="admin-analytics-card" style="background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--admin-gray-200);">' +
      '<div style="font-size: 12px; color: var(--admin-gray-500); margin-bottom: 8px;">Peak Usage Time</div>' +
      '<div style="font-size: 24px; font-weight: 700; color: var(--admin-gray-900);">' +
      (behavior.peakHours.length > 0 ? this.formatHour(behavior.peakHours[0].hour) : 'N/A') +
      '</div>' +
      '<div style="margin-top: 12px; font-size: 12px; color: var(--admin-gray-600);">' +
      (behavior.mostActiveDays.length > 0 ? behavior.mostActiveDays[0].label + ' is busiest' : 'No data yet') +
      '</div>' +
      '</div>' +

      // Sessions Card
      '<div class="admin-analytics-card" style="background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--admin-gray-200);">' +
      '<div style="font-size: 12px; color: var(--admin-gray-500); margin-bottom: 8px;">Avg. Session Duration</div>' +
      '<div style="font-size: 32px; font-weight: 700; color: var(--admin-gray-900);">' +
      (sessions ? sessions.avgSessionDuration + '<span style="font-size: 16px; font-weight: 500;">m</span>' : 'N/A') +
      '</div>' +
      '<div style="margin-top: 12px; font-size: 12px; color: var(--admin-gray-600);">' +
      (sessions ? sessions.totalSessions + ' sessions tracked' : 'No sessions') +
      '</div>' +
      '</div>' +

      '</div>' +

      // Hourly Distribution Chart
      '<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-top: 24px;">' +

      '<div class="admin-analytics-card" style="background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--admin-gray-200);">' +
      '<div style="font-size: 14px; font-weight: 600; color: var(--admin-gray-900); margin-bottom: 16px;">Activity by Hour of Day</div>' +
      this.renderHourlyChart(behavior.hourlyDistribution) +
      '</div>' +

      // Feature Usage Breakdown
      '<div class="admin-analytics-card" style="background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--admin-gray-200);">' +
      '<div style="font-size: 14px; font-weight: 600; color: var(--admin-gray-900); margin-bottom: 16px;">Feature Usage</div>' +
      this.renderFeatureUsage(engagement.featureUsage, engagement.totalActivities) +
      '</div>' +

      '</div>' +

      // Day of Week Distribution
      '<div style="margin-top: 24px;">' +
      '<div class="admin-analytics-card" style="background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--admin-gray-200);">' +
      '<div style="font-size: 14px; font-weight: 600; color: var(--admin-gray-900); margin-bottom: 16px;">Activity by Day of Week</div>' +
      this.renderDailyChart(behavior.dailyDistribution) +
      '</div>' +
      '</div>' +

      // Top Users
      (behavior.userActivity.length > 0 ?
        '<div style="margin-top: 24px;">' +
        '<div class="admin-analytics-card" style="background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--admin-gray-200);">' +
        '<div style="font-size: 14px; font-weight: 600; color: var(--admin-gray-900); margin-bottom: 16px;">Most Active Users</div>' +
        this.renderTopUsers(behavior.userActivity.slice(0, 5)) +
        '</div>' +
        '</div>' : '') +

      '</div>';
  },

  /**
   * Get period label for display
   */
  getPeriodLabel: function(period) {
    var labels = {
      today: 'Today',
      yesterday: 'Yesterday',
      week: 'Last 7 Days',
      month: 'Last 30 Days',
      quarter: 'Last 90 Days',
      year: 'Last 365 Days',
      lifetime: 'All Time'
    };
    return labels[period] || period;
  },

  /**
   * Get color based on engagement score
   */
  getScoreColor: function(score) {
    if (score >= 70) return '#10b981'; // Green
    if (score >= 40) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  },

  /**
   * Get icon based on engagement score
   */
  getScoreIcon: function(score) {
    if (score >= 70) {
      return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    }
    if (score >= 40) {
      return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    }
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  },

  /**
   * Format hour for display (12-hour format)
   */
  formatHour: function(hour) {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return hour + ' AM';
    return (hour - 12) + ' PM';
  },

  /**
   * Render hourly distribution chart
   */
  renderHourlyChart: function(hourlyData) {
    var maxCount = 0;
    for (var i = 0; i < hourlyData.length; i++) {
      if (hourlyData[i].count > maxCount) {
        maxCount = hourlyData[i].count;
      }
    }

    var html = '<div style="display: flex; align-items: flex-end; gap: 2px; height: 80px;">';

    for (var j = 0; j < hourlyData.length; j++) {
      var item = hourlyData[j];
      var height = maxCount > 0 ? Math.max(4, (item.count / maxCount) * 100) : 4;
      var isActive = item.count > 0;
      var bgColor = isActive ? 'var(--admin-accent)' : 'var(--admin-gray-200)';

      html += '<div style="flex: 1; height: ' + height + '%; background: ' + bgColor + '; border-radius: 2px; transition: height 0.3s;" ' +
        'title="' + this.formatHour(item.hour) + ': ' + item.count + ' activities"></div>';
    }

    html += '</div>';
    html += '<div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 10px; color: var(--admin-gray-500);">';
    html += '<span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>';
    html += '</div>';

    return html;
  },

  /**
   * Render daily distribution chart
   */
  renderDailyChart: function(dailyData) {
    var maxCount = 0;
    for (var i = 0; i < dailyData.length; i++) {
      if (dailyData[i].count > maxCount) {
        maxCount = dailyData[i].count;
      }
    }

    var html = '<div style="display: flex; gap: 8px;">';

    for (var j = 0; j < dailyData.length; j++) {
      var item = dailyData[j];
      var percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
      var bgColor = item.count > 0 ? 'var(--admin-accent)' : 'var(--admin-gray-200)';
      var opacity = percentage > 0 ? Math.max(0.3, percentage / 100) : 0.1;

      html += '<div style="flex: 1; text-align: center;">';
      html += '<div style="height: 60px; background: ' + bgColor + '; opacity: ' + opacity + '; border-radius: 6px; margin-bottom: 8px;" ' +
        'title="' + item.label + ': ' + item.count + ' activities"></div>';
      html += '<div style="font-size: 11px; color: var(--admin-gray-600);">' + item.label.substring(0, 3) + '</div>';
      html += '<div style="font-size: 10px; color: var(--admin-gray-400);">' + item.count + '</div>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  },

  /**
   * Render feature usage breakdown
   */
  renderFeatureUsage: function(featureUsage, total) {
    var features = [
      { key: 'risks', label: 'Risks', color: '#ef4444' },
      { key: 'controls', label: 'Controls', color: '#3b82f6' },
      { key: 'reports', label: 'Reports', color: '#10b981' },
      { key: 'ai', label: 'AI Calls', color: '#8b5cf6' },
      { key: 'exports', label: 'Exports', color: '#f59e0b' },
      { key: 'team', label: 'Team', color: '#06b6d4' }
    ];

    var html = '<div style="display: flex; flex-direction: column; gap: 12px;">';

    for (var i = 0; i < features.length; i++) {
      var f = features[i];
      var count = featureUsage[f.key] || 0;
      var percentage = total > 0 ? Math.round((count / total) * 100) : 0;

      html += '<div>';
      html += '<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">';
      html += '<span style="font-size: 12px; color: var(--admin-gray-700);">' + f.label + '</span>';
      html += '<span style="font-size: 12px; color: var(--admin-gray-500);">' + count + ' (' + percentage + '%)</span>';
      html += '</div>';
      html += '<div style="height: 6px; background: var(--admin-gray-100); border-radius: 3px; overflow: hidden;">';
      html += '<div style="height: 100%; width: ' + percentage + '%; background: ' + f.color + '; border-radius: 3px;"></div>';
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  },

  /**
   * Render top users list
   */
  renderTopUsers: function(users) {
    var html = '<div style="display: flex; flex-direction: column; gap: 12px;">';

    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      var initials = ADMIN.utils.getInitials ? ADMIN.utils.getInitials(user.name) : user.name.substring(0, 2).toUpperCase();

      html += '<div style="display: flex; align-items: center; gap: 12px;">';
      html += '<div style="width: 32px; height: 32px; border-radius: 50%; background: var(--admin-accent); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">' + initials + '</div>';
      html += '<div style="flex: 1; min-width: 0;">';
      html += '<div style="font-size: 13px; font-weight: 500; color: var(--admin-gray-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + ADMIN.utils.escapeHtml(user.name) + '</div>';
      html += '<div style="font-size: 11px; color: var(--admin-gray-500);">Last active: ' + ADMIN.utils.getRelativeTime(user.lastActive) + '</div>';
      html += '</div>';
      html += '<div style="font-size: 14px; font-weight: 600; color: var(--admin-accent);">' + user.count + '</div>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }
};

console.log('Admin Dashboard module loaded');

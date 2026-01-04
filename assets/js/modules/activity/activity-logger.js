/**
 * Activity Logger Module
 * Tracks all CRUD operations for audit trail
 * ES5 Compatible
 */

if (!window.ERM) window.ERM = {};

ERM.activityLogger = {

  /**
   * Log an activity
   */
  log: function(type, action, entityType, entityName, details) {
    var activities = ERM.storage.get('activities') || [];

    var activity = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      type: type, // 'risk', 'control', 'user', 'settings', etc.
      action: action, // 'created', 'updated', 'deleted', 'added', 'removed'
      entityType: entityType, // 'risk', 'control', 'team-member', etc.
      entityName: entityName, // Name/title of the entity
      details: details || {}, // Additional context
      user: ERM.state.user ? ERM.state.user.name : 'Unknown User',
      userId: ERM.state.user ? ERM.state.user.id : null,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };

    // Add to beginning of array (most recent first)
    activities.unshift(activity);

    // Keep only last 500 activities to prevent storage bloat
    if (activities.length > 500) {
      activities = activities.slice(0, 500);
    }

    ERM.storage.set('activities', activities);

    console.log('Activity logged:', activity);
    return activity;
  },

  /**
   * Get all activities
   */
  getAll: function() {
    return ERM.storage.get('activities') || [];
  },

  /**
   * Get recent activities (last N)
   */
  getRecent: function(limit) {
    limit = limit || 5;
    var activities = this.getAll();
    return activities.slice(0, limit);
  },

  /**
   * Get activities by type
   */
  getByType: function(type) {
    var activities = this.getAll();
    var filtered = [];

    for (var i = 0; i < activities.length; i++) {
      if (activities[i].type === type) {
        filtered.push(activities[i]);
      }
    }

    return filtered;
  },

  /**
   * Get activities by action
   */
  getByAction: function(action) {
    var activities = this.getAll();
    var filtered = [];

    for (var i = 0; i < activities.length; i++) {
      if (activities[i].action === action) {
        filtered.push(activities[i]);
      }
    }

    return filtered;
  },

  /**
   * Search activities
   */
  search: function(query) {
    if (!query || query.length < 2) {
      return this.getAll();
    }

    var activities = this.getAll();
    var results = [];
    var queryLower = query.toLowerCase();

    for (var i = 0; i < activities.length; i++) {
      var activity = activities[i];
      var searchText = [
        activity.entityName,
        activity.action,
        activity.type,
        activity.user,
        activity.date
      ].join(' ').toLowerCase();

      if (searchText.indexOf(queryLower) !== -1) {
        results.push(activity);
      }
    }

    return results;
  },

  /**
   * Filter activities by date range
   */
  filterByDateRange: function(startDate, endDate) {
    var activities = this.getAll();
    var filtered = [];

    var start = startDate ? new Date(startDate) : null;
    var end = endDate ? new Date(endDate) : null;

    for (var i = 0; i < activities.length; i++) {
      var activityDate = new Date(activities[i].timestamp);

      var matchesStart = !start || activityDate >= start;
      var matchesEnd = !end || activityDate <= end;

      if (matchesStart && matchesEnd) {
        filtered.push(activities[i]);
      }
    }

    return filtered;
  },

  /**
   * Clear all activities
   */
  clear: function() {
    ERM.storage.set('activities', []);
  },

  /**
   * Get activity message (human-readable)
   * Format: [username] [action] [title] [entity type]
   */
  getMessage: function(activity) {
    var entityLabels = {
      'risk': 'risk',
      'control': 'control',
      'report': 'report',
      'register': 'risk register',
      'user': 'team member',
      'settings': 'settings',
      'workspace': 'workspace',
      'data': 'data'
    };

    var actionLabels = {
      'created': 'created',
      'updated': 'updated',
      'deleted': 'deleted',
      'added': 'added',
      'removed': 'removed',
      'linked': 'linked',
      'unlinked': 'unlinked',
      'exported': 'exported',
      'imported': 'imported',
      'renamed': 'renamed',
      'shared': 'shared',
      'edited': 'edited',
      'commented': 'commented on'
    };

    var action = actionLabels[activity.action] || activity.action;
    var entityLabel = entityLabels[activity.type] || activity.type;
    var entityName = activity.entityName || '';

    // Handle linking activities specially
    if (activity.action === 'linked' && activity.details) {
      if (activity.details.linkedTo) {
        return action + ' "' + entityName + '" ' + entityLabel + ' to "' + activity.details.linkedTo + '" ' + (activity.details.linkedToType || '');
      }
    }

    // Standard format: [action] "[title]" [entity type]
    if (entityName) {
      return action + ' "' + entityName + '" ' + entityLabel;
    }

    return action + ' ' + entityLabel;
  },

  /**
   * Get full activity message with username
   * Format: [username] [action] "[title]" [entity type]
   */
  getFullMessage: function(activity) {
    var userName = activity.user || 'Unknown User';
    var message = this.getMessage(activity);
    return userName + ' ' + message;
  },

  /**
   * Get activity icon
   */
  getIcon: function(activity) {
    var icons = {
      'created': '➕',
      'updated': '✏️',
      'deleted': '🗑️',
      'added': '➕',
      'removed': '➖',
      'linked': '🔗',
      'unlinked': '⛓️‍💥',
      'exported': '📤',
      'imported': '📥',
      'renamed': '✏️',
      'shared': '🔗',
      'edited': '📝'
    };

    return icons[activity.action] || '📝';
  },

  /**
   * Get activity color class
   */
  getColorClass: function(activity) {
    var colors = {
      'created': 'activity-success',
      'added': 'activity-success',
      'updated': 'activity-info',
      'linked': 'activity-info',
      'deleted': 'activity-danger',
      'removed': 'activity-danger',
      'unlinked': 'activity-warning',
      'exported': 'activity-neutral',
      'imported': 'activity-neutral',
      'renamed': 'activity-info',
      'shared': 'activity-info',
      'edited': 'activity-info'
    };

    return colors[activity.action] || 'activity-neutral';
  },

  /**
   * Export activities as CSV
   */
  exportCSV: function() {
    var activities = this.getAll();

    var csv = 'Timestamp,Date,Time,User,Action,Type,Entity,Details\n';

    for (var i = 0; i < activities.length; i++) {
      var a = activities[i];
      var detailsText = JSON.stringify(a.details).replace(/"/g, '""');

      csv += '"' + a.timestamp + '",';
      csv += '"' + a.date + '",';
      csv += '"' + a.time + '",';
      csv += '"' + a.user + '",';
      csv += '"' + a.action + '",';
      csv += '"' + a.type + '",';
      csv += '"' + a.entityName + '",';
      csv += '"' + detailsText + '"\n';
    }

    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.href = url;
    a.download = 'activity-log-' + new Date().getTime() + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    ERM.toast.success('Activity log exported');
  }

};

console.log('Activity Logger module loaded');

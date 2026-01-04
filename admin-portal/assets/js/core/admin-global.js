/**
 * DIMERI.AI - ADMIN PORTAL
 * Global Utilities and State Management
 */

var ADMIN = ADMIN || {};

ADMIN.state = {
  currentView: 'overview',
  filters: {},
  searchQuery: '',
};

ADMIN.utils = {
  /**
   * Format date
   */
  formatDate: function(dateString) {
    if (!dateString) return 'N/A';
    var date = new Date(dateString);
    var options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  },

  /**
   * Format time only
   */
  formatTime: function(dateString) {
    if (!dateString) return 'N/A';
    var date = new Date(dateString);
    var options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return date.toLocaleTimeString('en-US', options);
  },

  /**
   * Format date with time
   */
  formatDateTime: function(dateString) {
    if (!dateString) return 'N/A';
    var date = new Date(dateString);
    var options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  },

  /**
   * Calculate relative time
   */
  getRelativeTime: function(dateString) {
    if (!dateString) return 'Never';
    var date = new Date(dateString);
    var now = new Date();
    var diffMs = now - date;
    var diffMins = Math.floor(diffMs / 60000);
    var diffHours = Math.floor(diffMs / 3600000);
    var diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return diffMins + ' min' + (diffMins > 1 ? 's' : '') + ' ago';
    if (diffHours < 24) return diffHours + ' hour' + (diffHours > 1 ? 's' : '') + ' ago';
    if (diffDays < 7) return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
    if (diffDays < 30) return Math.floor(diffDays / 7) + ' week' + (Math.floor(diffDays / 7) > 1 ? 's' : '') + ' ago';
    return Math.floor(diffDays / 30) + ' month' + (Math.floor(diffDays / 30) > 1 ? 's' : '') + ' ago';
  },

  /**
   * Calculate growth percentage
   */
  calculateGrowth: function(current, previous) {
    if (!previous || previous === 0) return current > 0 ? '+100' : '0';
    var growth = ((current - previous) / previous) * 100;
    return (growth > 0 ? '+' : '') + growth.toFixed(1);
  },

  /**
   * Escape HTML
   */
  escapeHtml: function(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Get initials from name
   */
  getInitials: function(name) {
    if (!name) return '?';
    var parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  },

  /**
   * Format number with commas
   */
  formatNumber: function(num) {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * Format storage size (KB to human readable)
   */
  formatStorage: function(kb) {
    if (!kb || kb === 0) return '0 KB';
    if (kb < 1024) return kb + ' KB';
    if (kb < 1024 * 1024) return (kb / 1024).toFixed(1) + ' MB';
    return (kb / (1024 * 1024)).toFixed(2) + ' GB';
  },

  /**
   * Calculate percentage
   */
  calculatePercentage: function(part, total) {
    if (!total || total === 0) return 0;
    return Math.round((part / total) * 100);
  },

  /**
   * Get status color
   */
  getStatusColor: function(status) {
    var colors = {
      active: '#10b981',
      suspended: '#ef4444',
      pending: '#f59e0b',
      'over-limit': '#ef4444',
      inactive: '#64748b'
    };
    return colors[status] || '#64748b';
  },

  /**
   * Show confirmation dialog
   */
  confirm: function(message, onConfirm, onCancel) {
    if (window.confirm(message)) {
      if (onConfirm) onConfirm();
    } else {
      if (onCancel) onCancel();
    }
  },

  /**
   * Show toast notification
   */
  showToast: function(message, type) {
    type = type || 'info';
    console.log('[ADMIN Toast] ' + type.toUpperCase() + ': ' + message);
    // TODO: Implement proper toast UI
    alert(message);
  },

  /**
   * Copy to clipboard
   */
  copyToClipboard: function(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.showToast('Copied to clipboard!', 'success');
  },

  /**
   * Debounce function
   */
  debounce: function(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  },

  /**
   * Filter array by search query
   */
  filterBySearch: function(items, query, fields) {
    if (!query || query.trim() === '') return items;
    query = query.toLowerCase();
    return items.filter(function(item) {
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var value = item[field];
        if (value && value.toString().toLowerCase().indexOf(query) !== -1) {
          return true;
        }
      }
      return false;
    });
  }
};

ADMIN.storage = {
  /**
   * Get from localStorage
   */
  get: function(key) {
    try {
      var value = localStorage.getItem('admin_' + key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error('Error reading from storage:', e);
      return null;
    }
  },

  /**
   * Set to localStorage
   */
  set: function(key, value) {
    try {
      localStorage.setItem('admin_' + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Error writing to storage:', e);
      return false;
    }
  },

  /**
   * Remove from localStorage
   */
  remove: function(key) {
    try {
      localStorage.removeItem('admin_' + key);
      return true;
    } catch (e) {
      console.error('Error removing from storage:', e);
      return false;
    }
  }
};

console.log('Admin Global utilities loaded');

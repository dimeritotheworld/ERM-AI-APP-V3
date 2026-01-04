/**
 * Dimeri ERM - Global Utilities
 * ES5 Compatible
 */

console.log("Loading global.js...");

// Create global namespace
var ERM = window.ERM || {};

// App State
ERM.state = {
  user: null,
  workspace: null,
  currentView: "dashboard",
  sidebarOpen: false,
  aiPanelOpen: false,
};

// Session Management
ERM.session = {
  getUser: function () {
    try {
      var userData = sessionStorage.getItem("ermUser");
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (e) {
      console.error("Error getting user:", e);
    }
    return null;
  },

  setUser: function (user) {
    try {
      sessionStorage.setItem("ermUser", JSON.stringify(user));
      sessionStorage.setItem("ermLoggedIn", "true");
      ERM.state.user = user;
    } catch (e) {
      console.error("Error setting user:", e);
    }
  },

  isLoggedIn: function () {
    return sessionStorage.getItem("ermLoggedIn") === "true";
  },

  logout: function () {
    sessionStorage.removeItem("ermUser");
    sessionStorage.removeItem("ermLoggedIn");
    sessionStorage.removeItem("ermOnboardingComplete");
    window.location.href = "login.html";
  },

  clearAll: function () {
    sessionStorage.removeItem("ermUser");
    sessionStorage.removeItem("ermLoggedIn");
    sessionStorage.removeItem("ermOnboardingComplete");
  },
};

// Storage Helpers
ERM.storage = {
  get: function (key, defaultValue) {
    try {
      var item = localStorage.getItem("erm_" + key);
      if (item) {
        return JSON.parse(item);
      }
    } catch (e) {
      console.error("Error getting from storage:", e);
    }
    return defaultValue || null;
  },

  set: function (key, value) {
    try {
      localStorage.setItem("erm_" + key, JSON.stringify(value));
    } catch (e) {
      console.error("Error setting to storage:", e);
    }
  },

  remove: function (key) {
    localStorage.removeItem("erm_" + key);
  },

  clearAll: function () {
    // Clear all ERM localStorage items
    var keysToRemove = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf("erm_") === 0) {
        keysToRemove.push(key);
      }
    }
    for (var j = 0; j < keysToRemove.length; j++) {
      localStorage.removeItem(keysToRemove[j]);
    }
  },
};

/**
 * Reset entire demo - clears all data and reloads
 * Clears all FTUX and onboarding states so welcome popup shows again
 */
ERM.resetDemo = function () {
  ERM.session.clearAll();
  ERM.storage.clearAll();

  // Clear first-time UX states so welcome popup shows again
  try {
    localStorage.removeItem('ERM_ftux_seen_welcome');
    localStorage.removeItem('ERM_ftux_seen_risk-register');
    localStorage.removeItem('ERM_ftux_seen_controls');
    localStorage.removeItem('ERM_ftux_seen_reports');

    // Clear onboarding states
    localStorage.removeItem('onboardingSeen');
    localStorage.removeItem('ERM_onboarding_complete');
    sessionStorage.removeItem('ermOnboardingComplete');
  } catch (e) {
    // Ignore storage errors
  }

  window.location.reload();
};

// Utility Functions
ERM.utils = {
  generateId: function (prefix) {
    prefix = prefix || "id";
    return (
      prefix + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  },

  formatDate: function (date, format) {
    if (!date) return "";
    var d = new Date(date);
    var day = d.getDate();
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var year = d.getFullYear();
    return day + " " + months[d.getMonth()] + " " + year;
  },

  getGreeting: function () {
    var hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  },

  getInitials: function (name) {
    if (!name) return "?";
    var parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  },

  escapeHtml: function (str) {
    if (!str) return "";
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  },

  truncate: function (str, length) {
    if (!str) return "";
    length = length || 50;
    if (str.length <= length) return str;
    return str.substring(0, length) + "...";
  },

  debounce: function (func, wait) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    };
  },
};

// SVG Icons
ERM.icons = {
  menu: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',
  close:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
  bell: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
  users:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  userPlus:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>',
  chevronDown:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>',
  chevronLeft:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
  dashboard:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
  fileText:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
  shield:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
  barChart:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',
  settings:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
  help: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>',
  logOut:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
  plus: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
  moreVertical:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>',
  edit: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
  trash:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
  copy: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
  download:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
  upload:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
  eye: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
  sparkles:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>',
  alertTriangle:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
  checkCircle:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  refresh:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>',
  search:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
  alertCircle:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
  trendingUp:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
  trendingDown:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>',
};

// Toast Notifications
ERM.toast = {
  container: null,

  init: function () {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className = "toast-container";
      document.body.appendChild(this.container);
    }
  },

  show: function (options) {
    this.init();

    var type = options.type || "info";
    var message = options.message || "";
    var duration = options.duration || 4000;

    var iconMap = {
      success: ERM.icons.checkCircle,
      error: ERM.icons.alertTriangle,
      warning: ERM.icons.alertTriangle,
      info: ERM.icons.alertTriangle,
    };

    var toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.innerHTML =
      '<span class="toast-icon">' +
      iconMap[type] +
      "</span>" +
      '<div class="toast-content">' +
      '<div class="toast-message">' +
      message +
      "</div>" +
      "</div>" +
      '<button class="toast-close">' +
      ERM.icons.close +
      "</button>";

    this.container.appendChild(toast);

    setTimeout(function () {
      toast.classList.add("show");
    }, 10);

    var self = this;
    var timeout = setTimeout(function () {
      self.remove(toast);
    }, duration);

    var closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", function () {
      clearTimeout(timeout);
      self.remove(toast);
    });
  },

  remove: function (toast) {
    toast.classList.remove("show");
    setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  },

  success: function (message) {
    this.show({ type: "success", message: message });
  },

  error: function (message) {
    this.show({ type: "error", message: message });
  },

  warning: function (message) {
    this.show({ type: "warning", message: message });
  },

  info: function (message) {
    this.show({ type: "info", message: message });
  },
};

// ========================================
// LIST INPUT COMPONENT
// ========================================
ERM.listInput = {
  /**
   * Create a list input component
   * @param {string} id - Unique ID for the input
   * @param {string} placeholder - Placeholder text for add input
   * @param {string} initialValue - Initial value (newline or bullet separated)
   * @returns {string} HTML string
   */
  create: function (id, placeholder, initialValue) {
    var items = this.parseValue(initialValue);
    var itemsHtml = "";

    for (var i = 0; i < items.length; i++) {
      itemsHtml += this.createItemHtml(i + 1, items[i], id);
    }

    return (
      '<div class="list-input-container" data-list-id="' +
      id +
      '" style="border:1px solid #e2e8f0;border-radius:8px;background:#fff;">' +
      '<div class="list-input-items" data-placeholder="' +
      ERM.utils.escapeHtml(placeholder) +
      '" style="padding:10px 12px;min-height:44px;">' +
      itemsHtml +
      "</div>" +
      '<div class="list-input-add" style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-top:1px solid #e2e8f0;background:#f7fafc;">' +
      '<input type="text" class="list-input-field" id="list-input-' +
      id +
      '" placeholder="' +
      ERM.utils.escapeHtml(placeholder) +
      '" onkeydown="if(event.keyCode===13){event.preventDefault();window.addListItem(\'' +
      id +
      '\');return false;}" style="flex:1;border:none;background:transparent;font-size:0.875rem;outline:none;padding:4px 0;">' +
      '<button type="button" class="list-input-add-btn" onclick="event.preventDefault();window.addListItem(\'' +
      id +
      '\');return false;" style="width:28px;height:28px;border:none;background:#c41e3a;color:#fff;border-radius:6px;cursor:pointer;font-size:18px;line-height:1;">+</button>' +
      "</div>" +
      '<textarea class="list-input-hidden" id="' +
      id +
      '" style="display:none !important;"></textarea>' +
      "</div>"
    );
  },

  /**
   * Create HTML for a single list item
   */
  createItemHtml: function (number, text, containerId) {
    return (
      '<div class="list-input-item" style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f7fafc;border-radius:6px;font-size:0.875rem;margin-bottom:6px;">' +
      '<span class="list-input-item-number" style="width:22px;height:22px;background:#c41e3a;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:600;">' +
      number +
      "</span>" +
      '<span class="list-input-item-text" style="flex:1;">' +
      ERM.utils.escapeHtml(text) +
      "</span>" +
      '<button type="button" class="list-input-item-remove" onclick="event.preventDefault();window.removeListItem(this,\'' +
      containerId +
      '\');return false;" style="width:24px;height:24px;border:none;background:transparent;color:#a0aec0;cursor:pointer;font-size:18px;line-height:1;">&times;</button>' +
      "</div>"
    );
  },

  /**
   * Parse value string into array of items
   */
  parseValue: function (value) {
    if (!value) return [];

    // Split by newlines, bullets, or numbered list patterns
    var lines = value.split(/[\n\r]+/);
    var items = [];

    for (var i = 0; i < lines.length; i++) {
      // Remove bullet points, numbers, dashes at start
      var cleaned = lines[i]
        .replace(/^[\s]*[-•●○◦▪▸►]\s*/, "")
        .replace(/^[\s]*\d+[\.\)]\s*/, "")
        .trim();
      if (cleaned) {
        items.push(cleaned);
      }
    }

    return items;
  },

  /**
   * Get items as array from a list input
   */
  getItems: function (containerId) {
    var container = document.querySelector(
      '[data-list-id="' + containerId + '"]'
    );
    if (!container) return [];

    var items = [];
    var itemEls = container.querySelectorAll(".list-input-item-text");
    for (var i = 0; i < itemEls.length; i++) {
      items.push(itemEls[i].textContent);
    }
    return items;
  },

  /**
   * Get items as formatted string (for AI processing)
   */
  getValue: function (containerId) {
    var items = this.getItems(containerId);
    if (items.length === 0) return "";

    // Format as numbered list for AI
    var result = [];
    for (var i = 0; i < items.length; i++) {
      result.push(i + 1 + ". " + items[i]);
    }
    return result.join("\n");
  },

  /**
   * Set items from array or string
   */
  setItems: function (containerId, value) {
    var container = document.querySelector(
      '[data-list-id="' + containerId + '"]'
    );
    if (!container) return;

    var itemsContainer = container.querySelector(".list-input-items");
    var items = Array.isArray(value) ? value : this.parseValue(value);

    var html = "";
    for (var i = 0; i < items.length; i++) {
      html += this.createItemHtml(i + 1, items[i]);
    }

    itemsContainer.innerHTML = html;
    this.syncHiddenField(containerId);
  },

  /**
   * Sync hidden textarea with current items
   */
  syncHiddenField: function (containerId) {
    var container = document.querySelector(
      '[data-list-id="' + containerId + '"]'
    );
    if (!container) return;

    var hidden = container.querySelector(".list-input-hidden");
    if (hidden) {
      hidden.value = this.getValue(containerId);
    }
  },

  /**
   * Initialize event handlers for a list input
   */
  init: function (containerId) {
    // Event delegation is set up globally, just sync the hidden field
    this.syncHiddenField(containerId);
  },

  /**
   * Global event delegation setup - call once on page load
   */
  setupGlobalEvents: function () {
    var self = this;

    // Prevent form submission when in list input
    document.addEventListener(
      "submit",
      function (e) {
        var activeEl = document.activeElement;
        if (
          activeEl &&
          activeEl.classList &&
          activeEl.classList.contains("list-input-field")
        ) {
          e.preventDefault();
          return false;
        }
      },
      true
    );

    // Handle add button clicks
    document.addEventListener(
      "click",
      function (e) {
        var target = e.target;
        var addBtn = null;

        // Check if clicked element is the add button
        if (
          target.classList &&
          target.classList.contains("list-input-add-btn")
        ) {
          addBtn = target;
        }
        // Check parent (in case clicked on text inside button)
        if (
          !addBtn &&
          target.parentElement &&
          target.parentElement.classList &&
          target.parentElement.classList.contains("list-input-add-btn")
        ) {
          addBtn = target.parentElement;
        }

        if (addBtn) {
          e.preventDefault();
          e.stopPropagation();
          var containerId = addBtn.getAttribute("data-list-for");
          console.log("Add button clicked, containerId:", containerId);
          if (containerId) {
            self.addItem(containerId);
          }
          return false;
        }

        // Handle remove button clicks
        var removeBtn = null;
        if (
          target.classList &&
          target.classList.contains("list-input-item-remove")
        ) {
          removeBtn = target;
        }
        if (
          !removeBtn &&
          target.parentElement &&
          target.parentElement.classList &&
          target.parentElement.classList.contains("list-input-item-remove")
        ) {
          removeBtn = target.parentElement;
        }

        if (removeBtn) {
          e.preventDefault();
          e.stopPropagation();
          // Find parent item and container
          var item = removeBtn.parentElement;
          while (
            item &&
            (!item.classList || !item.classList.contains("list-input-item"))
          ) {
            item = item.parentElement;
          }
          var container = removeBtn.parentElement;
          while (
            container &&
            (!container.classList ||
              !container.classList.contains("list-input-container"))
          ) {
            container = container.parentElement;
          }
          if (item && container) {
            var containerId = container.getAttribute("data-list-id");
            item.remove();
            self.renumberItems(containerId);
            self.syncHiddenField(containerId);
          }
          return false;
        }
      },
      true
    );

    // Handle Enter key in input fields
    document.addEventListener(
      "keydown",
      function (e) {
        if (e.key === "Enter" || e.keyCode === 13) {
          var input = e.target;
          if (
            input &&
            input.classList &&
            input.classList.contains("list-input-field")
          ) {
            e.preventDefault();
            e.stopPropagation();
            var containerId = input.getAttribute("data-list-for");
            console.log("Enter pressed, containerId:", containerId);
            if (containerId) {
              self.addItem(containerId);
            }
            return false;
          }
        }
      },
      true
    );

    console.log("List input global events set up");
  },

  /**
   * Add a new item to the list
   */
  addItem: function (containerId) {
    console.log("addItem called for:", containerId);

    var container = document.querySelector(
      '[data-list-id="' + containerId + '"]'
    );
    if (!container) {
      console.error("Container not found in addItem:", containerId);
      return;
    }

    var input = document.getElementById("list-input-" + containerId);
    if (!input) {
      input = container.querySelector(".list-input-field");
    }
    var itemsContainer = container.querySelector(".list-input-items");

    if (!input) {
      console.error("Input not found for:", containerId);
      return;
    }

    var text = input.value.trim();

    console.log("Input value:", text);

    if (!text) {
      console.log("Empty text, not adding");
      return;
    }

    var currentCount =
      itemsContainer.querySelectorAll(".list-input-item").length;
    var newItem = document.createElement("div");
    newItem.innerHTML = this.createItemHtml(
      currentCount + 1,
      text,
      containerId
    );

    var itemEl = newItem.firstChild;
    itemsContainer.appendChild(itemEl);

    console.log("Item added:", text);

    // Clear input and refocus
    input.value = "";
    input.focus();

    this.syncHiddenField(containerId);
  },

  /**
   * Remove an item from the list
   */
  removeItem: function (btn, containerId) {
    console.log("removeItem called for:", containerId);
    var item = btn.parentElement;
    while (item && !item.classList.contains("list-input-item")) {
      item = item.parentElement;
    }
    if (item) {
      item.remove();
      this.renumberItems(containerId);
      this.syncHiddenField(containerId);
    }
  },

  /**
   * Renumber items after removal
   */
  renumberItems: function (containerId) {
    var container = document.querySelector(
      '[data-list-id="' + containerId + '"]'
    );
    if (!container) return;

    var numbers = container.querySelectorAll(".list-input-item-number");
    for (var i = 0; i < numbers.length; i++) {
      numbers[i].textContent = i + 1;
    }
  },
};

// Initialize user state from session
ERM.state.user = ERM.session.getUser();
ERM.state.workspace = ERM.storage.get("currentWorkspace");

// Setup list input global event delegation
ERM.listInput.setupGlobalEvents();

// Export to window
window.ERM = ERM;

// Global helper functions for inline onclick handlers
window.addListItem = function (containerId) {
  console.log("window.addListItem called:", containerId);
  ERM.listInput.addItem(containerId);
};

window.removeListItem = function (btn, containerId) {
  console.log("window.removeListItem called:", containerId);
  ERM.listInput.removeItem(btn, containerId);
};

// ========================================
// THEME UTILITY
// ========================================

ERM.theme = {
  /**
   * Initialize theme on app load
   */
  init: function() {
    // Load saved theme preference
    var prefs = ERM.storage.get('userPreferences');
    var theme = prefs && prefs.theme ? prefs.theme : 'light';

    this.apply(theme);

    // Listen for system theme changes if auto mode
    if (theme === 'auto' && window.matchMedia) {
      var self = this;
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        var savedPrefs = ERM.storage.get('userPreferences');
        if (savedPrefs && savedPrefs.theme === 'auto') {
          self.apply('auto');
        }
      });
    }
  },

  /**
   * Apply theme to document
   */
  apply: function(theme) {
    var html = document.documentElement;

    // Remove existing theme classes
    html.classList.remove('theme-light', 'theme-dark', 'theme-auto');

    if (theme === 'dark') {
      html.classList.add('theme-dark');
      html.setAttribute('data-theme', 'dark');
    } else if (theme === 'auto') {
      html.classList.add('theme-auto');
      html.setAttribute('data-theme', 'auto');

      // Detect system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('theme-dark');
      } else {
        html.classList.add('theme-light');
      }
    } else {
      // Default to light
      html.classList.add('theme-light');
      html.setAttribute('data-theme', 'light');
    }
  }
};

// Initialize theme on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    ERM.theme.init();
  });
} else {
  ERM.theme.init();
}

console.log("global.js loaded successfully");

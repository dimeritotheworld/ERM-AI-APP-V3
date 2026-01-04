/**
 * Dimeri ERM - Layout & Navigation
 * ES5 Compatible
 */

console.log("Loading layout.js...");

// Navigation
ERM.navigation = ERM.navigation || {};

/**
 * Switch to a view
 */
ERM.navigation.switchView = function (viewId) {
  console.log("Switching to view:", viewId);
  ERM.state.currentView = viewId;

  // Update nav items
  var navItems = document.querySelectorAll(".nav-item");
  for (var i = 0; i < navItems.length; i++) {
    var item = navItems[i];
    var itemView = item.getAttribute("data-view");

    if (itemView === viewId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  }

  // Update views
  var views = document.querySelectorAll(".view");
  for (var j = 0; j < views.length; j++) {
    var view = views[j];
    var viewName = view.id.replace("view-", "");

    if (viewName === viewId) {
      view.classList.add("active");
    } else {
      view.classList.remove("active");
    }
  }

  // Update AI panel context
  if (ERM.components && ERM.components.updateAIPanel) {
    ERM.components.updateAIPanel(viewId);
  }

  // Clean up dashboard tooltip when leaving dashboard
  if (viewId !== 'dashboard' && ERM.dashboard && ERM.dashboard.destroy) {
    ERM.dashboard.destroy();
  }

  // Update URL hash
  window.location.hash = viewId;

  // Trigger view-specific init
  this.initView(viewId);
};

/**
 * Initialize view-specific content
 */
ERM.navigation.initView = function (viewId) {
  // Check for first-time user pop-ups
  if (typeof ERM.firstTimeUX !== 'undefined' && ERM.firstTimeUX.checkViewPopup) {
    ERM.firstTimeUX.checkViewPopup(viewId);
  }

  switch (viewId) {
    case "dashboard":
      if (typeof ERM.dashboard !== "undefined" && ERM.dashboard.init) {
        ERM.dashboard.init();
      }
      // Check welcome popup for first-time users
      if (typeof ERM.firstTimeUX !== 'undefined' && ERM.firstTimeUX.checkWelcome) {
        ERM.firstTimeUX.checkWelcome();
      }
      break;
    case "risk-register":
      // Reset to list view when clicking sidebar nav
      if (typeof ERM.riskRegister !== "undefined") {
        ERM.riskRegister.state.currentRegister = null;
        if (ERM.riskRegister.init) {
          ERM.riskRegister.init();
        }
      }
      break;
    case "controls":
      // Initialize controls module
      if (typeof ERM.controls !== "undefined" && ERM.controls.init) {
        ERM.controls.init();
      }
      break;
    case "reports":
      // Initialize reports module
      if (typeof ERM.reports !== "undefined" && ERM.reports.render) {
        ERM.reports.render();
      }
      break;
    case "help":
      // Initialize help module
      if (typeof ERM.help !== "undefined" && ERM.help.init) {
        ERM.help.init();
      }
      break;
    case "settings":
      // Initialize settings module
      if (typeof ERM.settings !== "undefined" && ERM.settings.init) {
        ERM.settings.init();
      }
      break;
    case "activity-log":
      // Initialize activity log module
      if (typeof ERM.activityLog !== "undefined" && ERM.activityLog.init) {
        ERM.activityLog.init();
      }
      break;
  }
};

/**
 * Get current view from URL hash
 */
ERM.navigation.getCurrentView = function () {
  var hash = window.location.hash.replace("#", "");
  var validViews = [
    "dashboard",
    "risk-register",
    "controls",
    "reports",
    "help",
    "settings",
    "activity-log",
  ];

  if (validViews.indexOf(hash) !== -1) {
    return hash;
  }

  return "dashboard";
};

/**
 * Initialize navigation from URL
 */
ERM.navigation.initFromUrl = function () {
  var view = this.getCurrentView();
  this.switchView(view);
};

// Layout
ERM.layout = ERM.layout || {};

/**
 * Initialize the main app layout
 */
ERM.layout.init = function () {
  console.log("ERM Layout Init Starting...");

  // Load user data (create demo user if not logged in)
  ERM.state.user = ERM.session.getUser();

  if (!ERM.state.user) {
    console.log("No user found, creating demo user");
    ERM.state.user = {
      id: 1,
      name: "Demo User",
      email: "demo@dimeri.ai",
      role: "Risk Manager",
      isDemo: true,
    };
    ERM.session.setUser(ERM.state.user);
  }

  ERM.state.workspace = ERM.storage.get("currentWorkspace") || {
    name: ERM.state.user.workspace || "My Workspace",
  };

  console.log("User:", ERM.state.user);
  console.log("Workspace:", ERM.state.workspace);

  // Render components
  try {
    ERM.components.renderHeader("header-container");
  } catch (e) {
    console.error("Error rendering header:", e);
  }

  try {
    ERM.components.renderSidebar(
      "sidebar-container",
      ERM.navigation.getCurrentView()
    );
  } catch (e) {
    console.error("Error rendering sidebar:", e);
  }

  // Old action-based AI button disabled - replaced by floating-ai-insight.js
  // which provides interpretive insights only (no actions)
  // try {
  //   ERM.components.renderAIButton("ai-button-container");
  // } catch (e) {
  //   console.error("Error rendering AI button:", e);
  // }

  // Run data migrations on startup
  if (typeof ERM.controls !== "undefined" && ERM.controls.migrateControlIds) {
    ERM.controls.migrateControlIds();
  }

  // Initialize navigation from URL
  ERM.navigation.initFromUrl();

  // Handle browser back/forward
  window.addEventListener("hashchange", function () {
    ERM.navigation.initFromUrl();
  });

  // Welcome modal removed - using first-time UX pop-ups instead
  // The old welcome modal is replaced by cleaner, enterprise-grade FTUX pop-ups
  // that show contextually when users navigate to specific modules

  console.log("ERM Layout Init Complete");
};

// DOM Ready Initialization
(function () {
  console.log("Setting up DOM ready handler...");
  console.log("Document readyState:", document.readyState);

  function runInit() {
    console.log("Running init...");
    if (
      typeof ERM !== "undefined" &&
      typeof ERM.layout !== "undefined" &&
      typeof ERM.layout.init === "function"
    ) {
      ERM.layout.init();
    } else {
      console.error("ERM.layout.init not available");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runInit);
  } else {
    runInit();
  }
})();

console.log("layout.js loaded successfully");

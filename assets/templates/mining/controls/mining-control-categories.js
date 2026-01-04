/**
 * Mining Industry Control Categories
 * Defines control category types and their characteristics
 *
 * @version 2.0.0
 * ES5 Compatible
 */

/* ========================================
   MINING CONTROL CATEGORIES
   ======================================== */

// Create namespace
if (!window.ERM) window.ERM = {};
if (!window.ERM.controlTemplates) window.ERM.controlTemplates = {};
if (!window.ERM.controlTemplates.mining) window.ERM.controlTemplates.mining = {};

/**
 * Control Category Types
 * These are the fundamental classifications of controls based on their nature
 * Matches the category dropdown in the control form
 */
window.ERM.controlTemplates.mining.controlCategories = {

  policy: {
    id: "policy",
    name: "Policy",
    description: "Controls embedded in policies, procedures, standards, and guidelines that define how things should be done",
    characteristics: [
      "Written documentation",
      "Approved by management",
      "Communicated to staff",
      "Regularly reviewed and updated",
      "Defines requirements and expectations"
    ],
    examples: [
      "Code of Conduct",
      "Safety Policy",
      "Procurement Policy",
      "Expense Approval Policy",
      "IT Security Policy",
      "Environmental Management Policy",
      "Conflict of Interest Policy"
    ],
    keywords: [
      "policy", "procedure", "standard", "guideline", "framework",
      "protocol", "directive", "rule", "requirement", "code",
      "manual", "handbook", "charter", "governance"
    ],
    departments: [
      "all" // Policy controls apply across all departments
    ]
  },

  manual: {
    id: "manual",
    name: "Manual",
    description: "Controls performed by people through manual processes, reviews, approvals, and oversight activities",
    characteristics: [
      "Human intervention required",
      "Subject to human error",
      "Requires training and competency",
      "Evidence through signatures/approvals",
      "Flexibility in application"
    ],
    examples: [
      "Management review and approval",
      "Reconciliation performed by accountant",
      "Supervisor authorization",
      "Safety inspection walkthrough",
      "Manual quality check",
      "Purchase order approval",
      "Time sheet review and sign-off"
    ],
    keywords: [
      "manual", "review", "approval", "authorization", "sign-off",
      "oversight", "supervision", "verification", "inspection",
      "check", "reconciliation", "validation", "human"
    ],
    departments: [
      "all"
    ]
  },

  automated: {
    id: "automated",
    name: "Automated",
    description: "Controls embedded in IT systems that execute automatically without human intervention",
    characteristics: [
      "System-enforced",
      "Consistent execution",
      "Real-time operation",
      "Reduces human error",
      "Audit trail in system logs"
    ],
    examples: [
      "System access password controls",
      "Automated three-way match (PO-Receipt-Invoice)",
      "Budget limit enforcement in system",
      "Duplicate payment prevention",
      "Automated backup processes",
      "System-generated alerts and notifications",
      "Automated data validation rules"
    ],
    keywords: [
      "automated", "system", "IT", "software", "application",
      "digital", "electronic", "computer", "programmed", "automatic",
      "technology", "platform", "database", "algorithm"
    ],
    departments: [
      "all"
    ]
  },

  physical: {
    id: "physical",
    name: "Physical",
    description: "Tangible security and safety controls that create physical barriers or protection",
    characteristics: [
      "Tangible and observable",
      "Prevents unauthorized access",
      "Protects assets and people",
      "Requires maintenance",
      "Visible deterrent"
    ],
    examples: [
      "Locks and keys",
      "Fencing and gates",
      "Security cameras (CCTV)",
      "Badge access systems",
      "Safes and vaults",
      "Fire suppression systems",
      "Safety barriers and guards",
      "Firewall hardware"
    ],
    keywords: [
      "physical", "lock", "fence", "gate", "barrier", "guard",
      "camera", "CCTV", "badge", "access card", "safe", "vault",
      "security", "perimeter", "tangible", "infrastructure"
    ],
    departments: [
      "security", "safety", "operations", "maintenance"
    ]
  },

  segregation: {
    id: "segregation",
    name: "Segregation of Duties",
    description: "Controls that divide critical tasks among different people to prevent fraud and error",
    characteristics: [
      "Splits key responsibilities",
      "Prevents single point of failure",
      "Requires collusion for fraud",
      "Provides checks and balances",
      "Role-based separation"
    ],
    examples: [
      "Different people initiate and approve purchases",
      "Cash handling separated from recordkeeping",
      "IT developers cannot approve their own code to production",
      "Payroll processing separated from employee master file changes",
      "Inventory custodian different from inventory recorder",
      "Treasury dealing separated from settlement"
    ],
    keywords: [
      "segregation", "separation", "duties", "SoD", "SOD",
      "split", "divide", "independent", "different person",
      "dual control", "maker-checker", "four eyes", "two person"
    ],
    departments: [
      "finance", "IT", "supply", "HR"
    ]
  },

  monitoring: {
    id: "monitoring",
    name: "Monitoring & Detective",
    description: "Controls that detect errors, fraud, or non-compliance after they occur through ongoing monitoring",
    characteristics: [
      "Retrospective review",
      "Identifies issues after occurrence",
      "Ongoing or periodic",
      "Provides management information",
      "Enables corrective action"
    ],
    examples: [
      "Management reports and dashboards",
      "Exception reports (e.g., overdue invoices)",
      "Internal audit reviews",
      "Variance analysis (budget vs actual)",
      "Continuous monitoring alerts",
      "Performance metrics tracking",
      "Log file reviews",
      "Surveillance and monitoring systems"
    ],
    keywords: [
      "monitoring", "detective", "review", "report", "dashboard",
      "analytics", "surveillance", "tracking", "KPI", "metric",
      "variance", "exception", "alert", "notification", "analysis",
      "audit trail", "log review"
    ],
    departments: [
      "all"
    ]
  }
};

/**
 * Get control category by ID
 */
window.ERM.controlTemplates.mining.getControlCategory = function(categoryId) {
  return this.controlCategories[categoryId] || null;
};

/**
 * Get all control categories as array
 */
window.ERM.controlTemplates.mining.getAllControlCategories = function() {
  var categories = [];
  for (var id in this.controlCategories) {
    if (this.controlCategories.hasOwnProperty(id)) {
      categories.push(this.controlCategories[id]);
    }
  }
  return categories;
};

/**
 * Find control category by keywords
 * Useful for AI suggestions
 */
window.ERM.controlTemplates.mining.findControlCategoryByKeywords = function(text) {
  if (!text) return null;

  var textLower = text.toLowerCase();
  var scores = {};

  for (var id in this.controlCategories) {
    if (this.controlCategories.hasOwnProperty(id)) {
      var category = this.controlCategories[id];
      var score = 0;

      // Check if category name appears
      if (textLower.indexOf(category.name.toLowerCase()) !== -1) {
        score += 30;
      }

      // Check keywords
      for (var i = 0; i < category.keywords.length; i++) {
        if (textLower.indexOf(category.keywords[i].toLowerCase()) !== -1) {
          score += 15;
        }
      }

      // Check examples
      for (var j = 0; j < category.examples.length; j++) {
        if (textLower.indexOf(category.examples[j].toLowerCase()) !== -1) {
          score += 10;
        }
      }

      if (score > 0) {
        scores[id] = score;
      }
    }
  }

  // Find highest scoring category
  var bestCategory = null;
  var bestScore = 0;

  for (var catId in scores) {
    if (scores.hasOwnProperty(catId)) {
      if (scores[catId] > bestScore) {
        bestScore = scores[catId];
        bestCategory = catId;
      }
    }
  }

  return bestCategory;
};

/**
 * Get category suggestions with scores
 * Used for AI category suggestions
 */
window.ERM.controlTemplates.mining.suggestControlCategory = function(controlName, controlDescription, controlType) {
  var text = (controlName || "") + " " + (controlDescription || "");
  var textLower = text.toLowerCase();

  var suggestions = [];

  for (var id in this.controlCategories) {
    if (this.controlCategories.hasOwnProperty(id)) {
      var category = this.controlCategories[id];
      var score = 0;

      // Check category name
      if (textLower.indexOf(category.name.toLowerCase()) !== -1) {
        score += 25;
      }

      // Check keywords
      for (var i = 0; i < category.keywords.length; i++) {
        var keyword = category.keywords[i].toLowerCase();
        if (textLower.indexOf(keyword) !== -1) {
          score += 12;
        }
      }

      // Check examples
      for (var j = 0; j < category.examples.length; j++) {
        var example = category.examples[j].toLowerCase();
        // Partial match on examples
        var exampleWords = example.split(" ");
        for (var k = 0; k < exampleWords.length; k++) {
          if (exampleWords[k].length > 3 && textLower.indexOf(exampleWords[k]) !== -1) {
            score += 5;
          }
        }
      }

      // Boost score based on control type correlation
      if (controlType) {
        if (controlType === "preventive") {
          if (id === "policy" || id === "automated" || id === "physical") score += 10;
        } else if (controlType === "detective") {
          if (id === "monitoring" || id === "manual") score += 10;
        } else if (controlType === "corrective") {
          if (id === "manual") score += 10;
        } else if (controlType === "directive") {
          if (id === "policy") score += 15;
        }
      }

      if (score > 0) {
        suggestions.push({
          id: id,
          name: category.name,
          description: category.description,
          score: score
        });
      }
    }
  }

  // Sort by score descending
  suggestions.sort(function(a, b) {
    return b.score - a.score;
  });

  return suggestions;
};

/**
 * Validate if a category ID is valid
 */
window.ERM.controlTemplates.mining.isValidControlCategory = function(categoryId) {
  return this.controlCategories.hasOwnProperty(categoryId);
};

/**
 * Get category characteristics
 */
window.ERM.controlTemplates.mining.getCategoryCharacteristics = function(categoryId) {
  var category = this.getControlCategory(categoryId);
  return category ? category.characteristics : [];
};

/**
 * Get category examples
 */
window.ERM.controlTemplates.mining.getCategoryExamples = function(categoryId) {
  var category = this.getControlCategory(categoryId);
  return category ? category.examples : [];
};

/**
 * Get categories applicable to a department
 */
window.ERM.controlTemplates.mining.getCategoriesForDepartment = function(departmentId) {
  var categories = [];

  for (var id in this.controlCategories) {
    if (this.controlCategories.hasOwnProperty(id)) {
      var category = this.controlCategories[id];

      // Include if applicable to all departments or specific department
      if (category.departments.indexOf("all") !== -1 ||
          category.departments.indexOf(departmentId) !== -1) {
        categories.push({
          id: id,
          name: category.name,
          description: category.description
        });
      }
    }
  }

  return categories;
};

console.log("Mining Control Categories loaded (v2.0 - Control Category Types)");

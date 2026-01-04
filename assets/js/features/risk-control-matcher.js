/**
 * Risk-Control Intelligent Matching System
 * Scores how well controls match risks and vice versa
 * Gets smarter as more template data is added
 *
 * @version 1.0.0
 * ES5 Compatible
 */

/* ========================================
   RISK-CONTROL MATCHING ENGINE
   ======================================== */

// Create namespace
if (!window.ERM) window.ERM = {};

/**
 * Risk-Control Matcher
 * Intelligent scoring algorithms that improve as more data is added
 */
window.ERM.riskControlMatcher = {

  /**
   * Score how well a control matches a risk
   * Used in risk form to suggest relevant controls
   *
   * @param {Object} control - Control object
   * @param {Object} risk - Risk object
   * @returns {Object} { score: 0-100, reasons: [], isRecommended: bool, matchedKeywords: [] }
   */
  scoreControlForRisk: function(control, risk) {
    if (!control || !risk) {
      return { score: 0, reasons: [], isRecommended: false, matchedKeywords: [] };
    }

    var score = 0;
    var reasons = [];
    var matchedKeywords = [];

    // Build risk text for keyword matching
    var riskText = this._buildRiskText(risk);

    // Analyze consequence severity
    var consequenceSeverity = this._analyzeConsequenceSeverity(risk);
    var causeSeverity = this._analyzeCauseSeverity(risk);

    // FACTOR 1: Risk Category Match (30 points - highest weight)
    if (control.mitigatesRiskCategories && risk.category) {
      if (control.mitigatesRiskCategories.indexOf(risk.category) !== -1) {
        score += 30;
        reasons.push("Designed for " + this._formatCategory(risk.category) + " risks");
      }
    }

    // FACTOR 2: Keyword Overlap (up to 25 points)
    if (control.mitigatesRiskKeywords && control.mitigatesRiskKeywords.length > 0) {
      var keywordScore = 0;
      for (var i = 0; i < control.mitigatesRiskKeywords.length; i++) {
        var keyword = control.mitigatesRiskKeywords[i].toLowerCase();
        if (riskText.indexOf(keyword) !== -1) {
          matchedKeywords.push(keyword);
          keywordScore += 5;
          if (keywordScore >= 25) break; // Cap at 25 points
        }
      }
      score += keywordScore;

      if (matchedKeywords.length > 0) {
        var displayKeywords = matchedKeywords.slice(0, 3).join(", ");
        if (matchedKeywords.length > 3) displayKeywords += "...";
        reasons.push("Keywords: " + displayKeywords);
      }
    }

    // FACTOR 3: Control Type Match (15 points + consequence severity bonus)
    if (risk.inherentRisk && control.type) {
      var inhRisk = parseFloat(risk.inherentRisk) || 0;

      if (control.type === "preventive" && inhRisk >= 15) {
        score += 15;
        reasons.push("Preventive control for high-risk area");

        // BONUS: Extra points for severe consequences (e.g., "bankrupt", "fatality")
        if (consequenceSeverity.level === "catastrophic") {
          score += 10;
          reasons.push("Critical control for catastrophic consequences");
        } else if (consequenceSeverity.level === "major") {
          score += 5;
          reasons.push("Important for major consequences");
        }
      } else if (control.type === "detective" && inhRisk >= 9 && inhRisk < 15) {
        score += 12;
        reasons.push("Detective control for monitoring");
      } else if (control.type === "detective" && inhRisk < 9) {
        score += 10;
        reasons.push("Detective control for ongoing monitoring");
      } else if (control.type === "corrective") {
        score += 8;
        reasons.push("Corrective control to address issues");

        // Corrective controls more relevant when many causes exist
        if (causeSeverity.count >= 3) {
          score += 5;
          reasons.push("Addresses multiple root causes");
        }
      } else if (control.type === "directive") {
        score += 7;
        reasons.push("Directive control to guide actions");
      }
    }

    // FACTOR 4: Department Match (10 points)
    if (control.department && risk.department && control.department === risk.department) {
      score += 10;
      reasons.push("Same department: " + this._formatDepartment(risk.department));
    }

    // FACTOR 5: Title Similarity (10 points)
    if (control.titles && risk.title) {
      var riskWords = risk.title.toLowerCase().split(/\s+/);
      var titleMatch = false;

      for (var j = 0; j < control.titles.length; j++) {
        var controlTitle = control.titles[j].toLowerCase();
        for (var k = 0; k < riskWords.length; k++) {
          // Match words longer than 4 chars to avoid false positives
          if (riskWords[k].length > 4 && controlTitle.indexOf(riskWords[k]) !== -1) {
            titleMatch = true;
            break;
          }
        }
        if (titleMatch) break;
      }

      if (titleMatch) {
        score += 10;
        reasons.push("Similar terminology");
      }
    }

    // FACTOR 6: Control Effectiveness Boost (5 points)
    if (control.effectiveness === "effective") {
      score += 5;
      reasons.push("Proven effective");
    }

    // FACTOR 7: Plain Language Match (bonus 10 points)
    if (control.plainLanguage && control.plainLanguage.length > 0) {
      for (var m = 0; m < control.plainLanguage.length; m++) {
        var plainPhrase = control.plainLanguage[m].toLowerCase();
        if (riskText.indexOf(plainPhrase) !== -1) {
          score += 10;
          reasons.push('Addresses: "' + plainPhrase + '"');
          break; // Only award once
        }
      }
    }

    // FACTOR 8: Control Category Relevance (5 points)
    // Some control categories are better for certain risk types
    if (control.category && risk.category) {
      if (control.category === "policy" && risk.category === "compliance") {
        score += 5;
        reasons.push("Policy control for compliance risk");
      } else if (control.category === "automated" && risk.category === "technology") {
        score += 5;
        reasons.push("Automated control for tech risk");
      } else if (control.category === "physical" && risk.category === "hse") {
        score += 5;
        reasons.push("Physical control for safety risk");
      }
    }

    // Cap at 100
    if (score > 100) score = 100;

    return {
      score: Math.round(score),
      reasons: reasons,
      isRecommended: score >= 60, // 60+ = AI recommended
      matchedKeywords: matchedKeywords,
      controlName: control.name || (control.titles && control.titles[0]) || "Unknown Control"
    };
  },

  /**
   * Score how well a risk matches a control
   * Used in control form to suggest relevant risks
   *
   * @param {Object} risk - Risk object
   * @param {Object} control - Control object
   * @returns {Object} { score: 0-100, reasons: [], isRecommended: bool }
   */
  scoreRiskForControl: function(risk, control) {
    if (!risk || !control) {
      return { score: 0, reasons: [], isRecommended: false };
    }

    var score = 0;
    var reasons = [];

    var riskText = this._buildRiskText(risk);

    // FACTOR 1: Control mitigates this risk category (30 points)
    if (control.mitigatesRiskCategories && risk.category) {
      if (control.mitigatesRiskCategories.indexOf(risk.category) !== -1) {
        score += 30;
        reasons.push("Control designed for " + this._formatCategory(risk.category) + " risks");
      }
    }

    // FACTOR 2: Keyword match (25 points)
    var matchedKeywords = [];
    if (control.mitigatesRiskKeywords && control.mitigatesRiskKeywords.length > 0) {
      var keywordScore = 0;
      for (var i = 0; i < control.mitigatesRiskKeywords.length; i++) {
        var keyword = control.mitigatesRiskKeywords[i].toLowerCase();
        if (riskText.indexOf(keyword) !== -1) {
          matchedKeywords.push(keyword);
          keywordScore += 5;
          if (keywordScore >= 25) break;
        }
      }
      score += keywordScore;

      if (matchedKeywords.length > 0) {
        var displayKeywords = matchedKeywords.slice(0, 3).join(", ");
        reasons.push("Keywords: " + displayKeywords);
      }
    }

    // FACTOR 3: Risk severity match (20 points)
    if (risk.inherentRisk) {
      var inhRisk = parseFloat(risk.inherentRisk) || 0;
      if (inhRisk >= 15) {
        score += 20;
        reasons.push("High-priority risk (score: " + inhRisk + ")");
      } else if (inhRisk >= 9) {
        score += 15;
        reasons.push("Medium-priority risk");
      } else {
        score += 10;
        reasons.push("Manageable risk level");
      }
    }

    // FACTOR 4: Department match (10 points)
    if (control.department && risk.department && control.department === risk.department) {
      score += 10;
      reasons.push("Same department");
    }

    // FACTOR 5: Treatment alignment (15 points)
    if (risk.treatment) {
      if (risk.treatment === "mitigate" || risk.treatment === "reduce") {
        score += 15;
        reasons.push("Risk requires mitigation");
      } else if (risk.treatment === "transfer") {
        score += 10;
        reasons.push("Risk being transferred");
      } else if (risk.treatment === "accept") {
        score += 5;
        reasons.push("Risk accepted (lower priority)");
      }
    }

    // Cap at 100
    if (score > 100) score = 100;

    return {
      score: Math.round(score),
      reasons: reasons,
      isRecommended: score >= 50, // 50+ = recommended to link
      riskTitle: risk.title || "Unknown Risk"
    };
  },

  /**
   * Get AI recommended controls for a risk
   * Scores all controls and returns top matches
   *
   * @param {Object} risk - Risk object
   * @param {Array} allControls - Array of all available controls
   * @param {Number} minScore - Minimum score to be considered (default: 60)
   * @returns {Array} Scored and sorted controls
   */
  getRecommendedControlsForRisk: function(risk, allControls, minScore) {
    if (!risk || !allControls || allControls.length === 0) {
      return [];
    }

    minScore = minScore || 60;
    var scoredControls = [];

    for (var i = 0; i < allControls.length; i++) {
      var result = this.scoreControlForRisk(allControls[i], risk);
      if (result.score >= minScore) {
        scoredControls.push({
          control: allControls[i],
          score: result.score,
          reasons: result.reasons,
          matchedKeywords: result.matchedKeywords,
          isRecommended: true
        });
      }
    }

    // Sort by score descending
    scoredControls.sort(function(a, b) {
      return b.score - a.score;
    });

    return scoredControls;
  },

  /**
   * Get AI recommended risks for a control
   * Scores all risks and returns top matches
   *
   * @param {Object} control - Control object
   * @param {Array} allRisks - Array of all available risks
   * @param {Number} minScore - Minimum score to be considered (default: 50)
   * @returns {Array} Scored and sorted risks
   */
  getRecommendedRisksForControl: function(control, allRisks, minScore) {
    if (!control || !allRisks || allRisks.length === 0) {
      return [];
    }

    minScore = minScore || 50;
    var scoredRisks = [];

    for (var i = 0; i < allRisks.length; i++) {
      var result = this.scoreRiskForControl(allRisks[i], control);
      if (result.score >= minScore) {
        scoredRisks.push({
          risk: allRisks[i],
          score: result.score,
          reasons: result.reasons,
          isRecommended: true
        });
      }
    }

    // Sort by score descending
    scoredRisks.sort(function(a, b) {
      return b.score - a.score;
    });

    return scoredRisks;
  },

  /**
   * Build searchable text from risk object
   * @private
   */
  _buildRiskText: function(risk) {
    var text = "";
    if (risk.title) text += risk.title + " ";
    if (risk.description) text += risk.description + " ";
    if (risk.causes && Array.isArray(risk.causes)) text += risk.causes.join(" ") + " ";
    if (risk.consequences && Array.isArray(risk.consequences)) text += risk.consequences.join(" ") + " ";
    return text.toLowerCase();
  },

  /**
   * Format category name for display
   * @private
   */
  _formatCategory: function(category) {
    var map = {
      strategic: "Strategic",
      financial: "Financial",
      operational: "Operational",
      compliance: "Compliance",
      technology: "Technology",
      hr: "HR",
      hse: "HSE",
      reputational: "Reputational",
      project: "Project"
    };
    return map[category] || category;
  },

  /**
   * Format department name for display
   * @private
   */
  _formatDepartment: function(dept) {
    if (!dept) return "";
    return dept.charAt(0).toUpperCase() + dept.slice(1);
  },

  /**
   * Analyze consequence severity
   * Looks for catastrophic keywords and counts consequences
   * @private
   */
  _analyzeConsequenceSeverity: function(risk) {
    if (!risk.consequences || !Array.isArray(risk.consequences)) {
      return { level: "unknown", count: 0, keywords: [] };
    }

    var count = risk.consequences.length;
    var consequenceText = risk.consequences.join(" ").toLowerCase();
    var matchedKeywords = [];

    // Catastrophic keywords (single occurrence = catastrophic)
    var catastrophicKeywords = [
      "bankrupt", "bankruptcy", "fatality", "death", "fatal", "kill",
      "collapse", "closure", "shutdown", "liquidation", "insolvency",
      "catastrophic", "disaster", "terminal"
    ];

    // Major keywords (multiple = major impact)
    var majorKeywords = [
      "injury", "severe", "major", "significant", "substantial",
      "critical", "serious", "extensive", "widespread", "material loss",
      "regulatory action", "license", "permit revocation"
    ];

    // Minor keywords
    var minorKeywords = [
      "minor", "small", "limited", "temporary", "delay",
      "inconvenience", "administrative"
    ];

    var level = "moderate"; // Default

    // Check catastrophic
    for (var i = 0; i < catastrophicKeywords.length; i++) {
      if (consequenceText.indexOf(catastrophicKeywords[i]) !== -1) {
        level = "catastrophic";
        matchedKeywords.push(catastrophicKeywords[i]);
        break;
      }
    }

    // If not catastrophic, check major
    if (level !== "catastrophic") {
      for (var j = 0; j < majorKeywords.length; j++) {
        if (consequenceText.indexOf(majorKeywords[j]) !== -1) {
          matchedKeywords.push(majorKeywords[j]);
        }
      }

      if (matchedKeywords.length >= 2 || count >= 4) {
        level = "major"; // Multiple major keywords OR many consequences
      }
    }

    // Check minor
    if (level === "moderate") {
      for (var k = 0; k < minorKeywords.length; k++) {
        if (consequenceText.indexOf(minorKeywords[k]) !== -1) {
          level = "minor";
          matchedKeywords.push(minorKeywords[k]);
          break;
        }
      }
    }

    return {
      level: level,
      count: count,
      keywords: matchedKeywords
    };
  },

  /**
   * Analyze root cause severity
   * More causes = more complex risk = different control needs
   * @private
   */
  _analyzeCauseSeverity: function(risk) {
    if (!risk.causes || !Array.isArray(risk.causes)) {
      return { count: 0, complexity: "unknown" };
    }

    var count = risk.causes.length;
    var complexity = "simple";

    if (count >= 5) {
      complexity = "complex"; // 5+ causes = complex risk
    } else if (count >= 3) {
      complexity = "moderate"; // 3-4 causes = moderate complexity
    }

    return {
      count: count,
      complexity: complexity
    };
  }
};

console.log("Risk-Control Matcher loaded (Intelligent scoring system)");

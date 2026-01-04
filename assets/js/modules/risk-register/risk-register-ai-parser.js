/**
 * Dimeri ERM - Risk Register AI Parser
 * Natural language processing functions for risk creation
 *
 * @version 1.0.0
 * ES5 Compatible
 */

console.log("Loading risk-register-ai-parser.js...");

var ERM = window.ERM || {};
ERM.riskAI = ERM.riskAI || {};

/* ========================================
   NATURAL LANGUAGE PROCESSING
   ======================================== */

/**
 * Parse natural language input and generate structured risk
 * @param {string} input - User's natural language description
 * @param {string} industry - Optional industry context
 * @returns {object} Structured risk object
 */
ERM.riskAI.parseNaturalLanguage = function (input, industry) {
  var inputLower = input.toLowerCase();
  var result;

  // Step 1: Try to find matching template from NEW template system (ERM_TEMPLATES)
  var template = null;
  if (typeof ERM.riskAI.findMatchingTemplate === "function") {
    template = ERM.riskAI.findMatchingTemplate(input, null);
  }

  if (template) {
    // Found a match in the new template system
    var scoring = template.scoring || {};
    var treatment = template.treatment || {};

    // Map related categories to generic category
    var category = "operational";
    if (template.relatedCategories && template.relatedCategories.length > 0) {
      category = ERM.riskAI.mapTemplateCategory(template.relatedCategories[0]);
    }

    // Use template title or generate from input
    var title = input;
    if (template.titles && template.titles.length > 0) {
      // Use first title variation as it's usually the best
      title = template.titles[0];
    }

    result = {
      title: title,
      category: category,
      description: ERM.riskAI.generateDescriptionFromTemplate(template, input),
      causes: (template.rootCauses || []).slice(0, 3),
      consequences: (template.consequences || []).slice(0, 3),
      inherentLikelihood: scoring.inherentLikelihood || 3,
      inherentImpact: scoring.inherentImpact || 3,
      residualLikelihood: scoring.residualLikelihood || 2,
      residualImpact: scoring.residualImpact || 2,
      suggestedControls: template.actionPlans || [],
      treatment: treatment.recommended || "Mitigate",
      status: "Open",
      confidence: "high",
      source: "industry-template",
      templateId: template.id,
    };
  } else {
    // Step 2: Fall back to old system (industryRisks)
    var detectedCategory = ERM.riskAI.detectCategory(inputLower);
    var industryMatch = null;

    if (
      industry &&
      ERM.riskAI.industryRisks &&
      ERM.riskAI.industryRisks[industry]
    ) {
      industryMatch = ERM.riskAI.findIndustryRiskMatch(inputLower, industry);
    }

    if (!industryMatch && ERM.riskAI.industryRisks) {
      for (var ind in ERM.riskAI.industryRisks) {
        industryMatch = ERM.riskAI.findIndustryRiskMatch(inputLower, ind);
        if (industryMatch) break;
      }
    }

    if (industryMatch) {
      result = {
        title: industryMatch.title,
        category: industryMatch.category,
        description: ERM.riskAI.generateDescription(industryMatch),
        causes: (industryMatch.causes || []).slice(0, 3),
        consequences: (industryMatch.consequences || []).slice(0, 3),
        inherentLikelihood: industryMatch.inherentLikelihood || 3,
        inherentImpact: industryMatch.inherentImpact || 3,
        residualLikelihood: Math.max(
          1,
          (industryMatch.inherentLikelihood || 3) - 1
        ),
        residualImpact: industryMatch.inherentImpact || 3,
        suggestedControls: industryMatch.suggestedControls || [],
        treatment: "Mitigate",
        status: "Open",
        confidence: "high",
        source: "industry-template",
      };
    } else {
      // Use generic template based on category
      var genericTemplate = ERM.riskAI.genericTemplates
        ? ERM.riskAI.genericTemplates[detectedCategory] ||
          ERM.riskAI.genericTemplates["operational"]
        : { causes: [], consequences: [], suggestedControls: [] };

      result = {
        title: ERM.riskAI.generateTitleFromInput
          ? ERM.riskAI.generateTitleFromInput(input, detectedCategory)
          : input,
        category: detectedCategory,
        description: ERM.riskAI.generateDescriptionFromInput
          ? ERM.riskAI.generateDescriptionFromInput(input, genericTemplate)
          : input,
        causes: (genericTemplate.causes || []).slice(0, 3),
        consequences: (genericTemplate.consequences || []).slice(0, 3),
        inherentLikelihood: 3,
        inherentImpact: 3,
        residualLikelihood: 2,
        residualImpact: 3,
        suggestedControls: genericTemplate.suggestedControls || [],
        treatment: "Mitigate",
        status: "Open",
        confidence: "medium",
        source: "generated",
      };
    }
  }

  // Add scores
  result.inherentScore = result.inherentLikelihood * result.inherentImpact;
  result.residualScore = result.residualLikelihood * result.residualImpact;
  result.inherentRisk = ERM.riskAI.getRiskLevel(result.inherentScore);
  result.residualRisk = ERM.riskAI.getRiskLevel(result.residualScore);

  return result;
};

/**
 * Map template category ID to generic category
 */
ERM.riskAI.mapTemplateCategory = function (categoryId) {
  if (!categoryId) return "operational";

  var catLower = categoryId.toLowerCase();

  // Map to generic categories
  if (catLower.indexOf("strategic") !== -1) return "strategic";
  if (
    catLower.indexOf("financial") !== -1 ||
    catLower.indexOf("treasury") !== -1
  )
    return "financial";
  if (
    catLower.indexOf("compliance") !== -1 ||
    catLower.indexOf("regulatory") !== -1
  )
    return "compliance";
  if (
    catLower.indexOf("technology") !== -1 ||
    catLower.indexOf("cyber") !== -1 ||
    catLower.indexOf("it-") !== -1
  )
    return "technology";
  if (catLower.indexOf("reputation") !== -1 || catLower.indexOf("brand") !== -1)
    return "reputational";
  if (
    catLower.indexOf("safety") !== -1 ||
    catLower.indexOf("hse") !== -1 ||
    catLower.indexOf("fatal") !== -1
  )
    return "health-safety";
  if (catLower.indexOf("environment") !== -1) return "environmental";

  return "operational";
};

/**
 * Generate description from new template
 */
ERM.riskAI.generateDescriptionFromTemplate = function (template, userInput) {
  // Use template descriptions if available
  if (template.descriptions && template.descriptions.length > 0) {
    return template.descriptions[0];
  }

  // Fall back to plain language
  if (template.plainLanguage && template.plainLanguage.length > 0) {
    return template.plainLanguage[0];
  }

  // Generate from causes and consequences
  var desc = "Risk of ";
  if (template.titles && template.titles.length > 0) {
    desc += template.titles[0].toLowerCase();
  } else {
    desc += userInput.toLowerCase();
  }

  if (template.rootCauses && template.rootCauses.length > 0) {
    desc += " due to factors including " + template.rootCauses[0].toLowerCase();
  }

  if (template.consequences && template.consequences.length > 0) {
    desc +=
      ", potentially resulting in " + template.consequences[0].toLowerCase();
  }

  return desc + ".";
};

/**
 * Detect category from text using keyword mapping
 */
ERM.riskAI.detectCategory = function (text) {
  var maxScore = 0;
  var detectedCategory = "operational";
  var categoryScores = {};

  for (var keyword in ERM.riskAI.keywordMap) {
    if (text.indexOf(keyword.toLowerCase()) !== -1) {
      var cat = ERM.riskAI.keywordMap[keyword];
      categoryScores[cat] = (categoryScores[cat] || 0) + keyword.length;
    }
  }

  for (var cat in categoryScores) {
    if (categoryScores[cat] > maxScore) {
      maxScore = categoryScores[cat];
      detectedCategory = cat;
    }
  }

  return detectedCategory;
};

/**
 * Find matching risk from industry templates
 */
ERM.riskAI.findIndustryRiskMatch = function (text, industry) {
  var industryData = ERM.riskAI.industryRisks[industry];
  if (!industryData || !industryData.commonRisks) return null;

  var bestMatch = null;
  var bestScore = 0;

  for (var i = 0; i < industryData.commonRisks.length; i++) {
    var risk = industryData.commonRisks[i];
    var score = 0;

    for (var j = 0; j < risk.keywords.length; j++) {
      if (text.indexOf(risk.keywords[j].toLowerCase()) !== -1) {
        score += risk.keywords[j].length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = risk;
    }
  }

  return bestScore > 3 ? bestMatch : null;
};

/**
 * Generate description from matched template
 */
ERM.riskAI.generateDescription = function (riskTemplate) {
  var desc = riskTemplate.description || "";

  if (riskTemplate.causes && riskTemplate.causes.length > 0) {
    desc +=
      "\n\nKey causes include: " +
      riskTemplate.causes.slice(0, 2).join("; ") +
      ".";
  }

  if (riskTemplate.consequences && riskTemplate.consequences.length > 0) {
    desc +=
      "\n\nPotential consequences: " +
      riskTemplate.consequences.slice(0, 2).join("; ") +
      ".";
  }

  return desc;
};

/**
 * Generate title from user input
 */
ERM.riskAI.generateTitleFromInput = function (input, category) {
  // Clean up the input for a title
  var title = input.trim();

  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Remove trailing punctuation
  title = title.replace(/[.!?]+$/, "");

  // If too long, truncate
  if (title.length > 80) {
    title = title.substring(0, 77) + "...";
  }

  // If input is very short, add context
  if (title.length < 15) {
    var categoryLabel = ERM.riskAI.categories[category]
      ? ERM.riskAI.categories[category].label
      : "Risk";
    title = title + " - " + categoryLabel;
  }

  return title;
};

/**
 * Generate description from user input and template
 */
ERM.riskAI.generateDescriptionFromInput = function (input, template) {
  var desc =
    "Risk of " +
    input.toLowerCase().replace(/^(risk of |the risk of )/i, "") +
    ".";

  if (template.causes && template.causes.length > 0) {
    desc +=
      "\n\nThis risk may arise due to: " +
      template.causes.slice(0, 2).join("; ") +
      ".";
  }

  if (template.consequences && template.consequences.length > 0) {
    desc +=
      "\n\nPotential impacts include: " +
      template.consequences.slice(0, 2).join("; ") +
      ".";
  }

  return desc;
};

/**
 * Get risk level from score
 */
ERM.riskAI.getRiskLevel = function (score) {
  if (score >= 15) return "CRITICAL";
  if (score >= 10) return "HIGH";
  if (score >= 5) return "MEDIUM";
  return "LOW";
};

/* ========================================
   GAP ANALYSIS
   ======================================== */

/**
 * Analyze register for missing risk categories
 * @param {string} registerId - The register to analyze
 * @param {string} industry - The industry context
 * @returns {object} Gap analysis results
 */
ERM.riskAI.analyzeGaps = function (registerId, industry) {
  var risks = ERM.storage.get("risks") || [];
  var registerRisks = risks.filter(function (r) {
    return r.registerId === registerId;
  });

  // Get categories covered
  var coveredCategories = {};
  for (var i = 0; i < registerRisks.length; i++) {
    coveredCategories[registerRisks[i].category] = true;
  }

  // Find missing categories
  var missingCategories = [];
  for (var cat in ERM.riskAI.categories) {
    if (!coveredCategories[cat]) {
      missingCategories.push({
        category: cat,
        label: ERM.riskAI.categories[cat].label,
      });
    }
  }

  // Get industry-specific gaps
  var industryGaps = [];
  if (industry && ERM.riskAI.industryRisks[industry]) {
    var industryData = ERM.riskAI.industryRisks[industry];
    for (var j = 0; j < industryData.commonRisks.length; j++) {
      var commonRisk = industryData.commonRisks[j];
      var found = false;

      // Check if a similar risk exists (by keywords)
      for (var k = 0; k < registerRisks.length; k++) {
        var riskTitle = registerRisks[k].title.toLowerCase();
        for (var l = 0; l < commonRisk.keywords.length; l++) {
          if (riskTitle.indexOf(commonRisk.keywords[l]) !== -1) {
            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (!found) {
        industryGaps.push(commonRisk);
      }
    }
  }

  return {
    totalRisks: registerRisks.length,
    coveredCategories: Object.keys(coveredCategories),
    missingCategories: missingCategories,
    industryGaps: industryGaps,
    completenessScore: Math.round(
      (Object.keys(coveredCategories).length /
        Object.keys(ERM.riskAI.categories).length) *
        100
    ),
  };
};

window.ERM = ERM;
console.log("risk-register-ai-parser.js loaded successfully");

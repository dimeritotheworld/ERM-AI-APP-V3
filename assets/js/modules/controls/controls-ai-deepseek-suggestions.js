/**
 * Dimeri ERM - Controls AI DeepSeek Suggestions
 * DeepSeek-powered field suggestions for control forms
 *
 * @version 1.0.0
 * ES5 Compatible
 */

console.log("Loading controls-ai-deepseek-suggestions.js...");

var ERM = window.ERM || {};
ERM.controlsAI = ERM.controlsAI || {};
ERM.controlsAI.deepSeek = ERM.controlsAI.deepSeek || {};

/* ========================================
   DEEPSEEK FIELD SUGGESTION API
   Context-aware suggestions using DeepSeek AI
   ======================================== */

/**
 * Get form context for AI suggestions
 * Gathers all filled-in fields from the control form including dates and linked risk details
 */
ERM.controlsAI.deepSeek.getFormContext = function() {
  var context = {
    industry: ERM.riskAI ? ERM.riskAI.getCurrentIndustry() : "general"
  };

  // Get control name
  var nameEl = document.getElementById("control-name");
  if (nameEl && nameEl.value.trim()) {
    context.name = nameEl.value.trim();
  }

  // Get description
  var descEl = document.getElementById("control-description");
  if (descEl && descEl.value.trim()) {
    context.description = descEl.value.trim();
  }

  // Get control type
  var typeEl = document.getElementById("control-type");
  if (typeEl && typeEl.value) {
    context.type = typeEl.value;
  }

  // Get category
  var catEl = document.getElementById("control-category");
  if (catEl && catEl.value) {
    context.category = catEl.value;
  }

  // Get owner
  var ownerEl = document.getElementById("control-owner");
  if (ownerEl && ownerEl.value.trim()) {
    context.owner = ownerEl.value.trim();
  }

  // Get effectiveness
  var effEl = document.getElementById("control-effectiveness");
  if (effEl && effEl.value) {
    context.effectiveness = effEl.value;
  }

  // Get status
  var statusEl = document.getElementById("control-status");
  if (statusEl && statusEl.value) {
    context.status = statusEl.value;
  }

  // Get frequency
  var freqEl = document.getElementById("control-frequency");
  if (freqEl && freqEl.value) {
    context.frequency = freqEl.value;
  }

  // Get last review date
  var lastReviewEl = document.getElementById("control-last-review");
  if (lastReviewEl && lastReviewEl.value) {
    context.lastReviewDate = lastReviewEl.value;
  }

  // Get current next review date (if set)
  var nextReviewEl = document.getElementById("control-next-review");
  if (nextReviewEl && nextReviewEl.value) {
    context.currentNextReviewDate = nextReviewEl.value;
  }

  // Get linked risks with full details (severity, likelihood, status, description)
  var linkedRisks = [];
  if (typeof ERM.controls !== "undefined" && ERM.controls.state) {
    var editingControl = ERM.controls.state.editingControl;
    if (editingControl && editingControl.linkedRisks) {
      for (var k = 0; k < editingControl.linkedRisks.length; k++) {
        var riskId = editingControl.linkedRisks[k];
        if (typeof ERM.riskRegister !== "undefined" && ERM.riskRegister.getRiskById) {
          var risk = ERM.riskRegister.getRiskById(riskId);
          if (risk) {
            // Calculate risk scores
            var iLikelihood = parseInt(risk.inherentLikelihood) || 3;
            var iImpact = parseInt(risk.inherentImpact) || 3;
            var rLikelihood = parseInt(risk.residualLikelihood) || iLikelihood;
            var rImpact = parseInt(risk.residualImpact) || iImpact;
            var inherentScore = iLikelihood * iImpact;
            var residualScore = rLikelihood * rImpact;

            linkedRisks.push({
              title: risk.title,
              description: risk.description || "",
              category: risk.category || "operational",
              inherentLikelihood: iLikelihood,
              inherentImpact: iImpact,
              inherentScore: inherentScore,
              residualLikelihood: rLikelihood,
              residualImpact: rImpact,
              residualScore: residualScore,
              status: risk.status || "open",
              rootCauses: risk.rootCauses || [],
              consequences: risk.consequences || []
            });
          }
        }
      }
    }
  }

  // Also check for currently checked risk checkboxes in the form (for new controls)
  if (linkedRisks.length === 0) {
    var riskCheckboxes = document.querySelectorAll(".inline-risk-checkbox:checked, .control-risk-checkbox:checked");
    if (riskCheckboxes.length > 0) {
      var allRisks = ERM.storage ? ERM.storage.get("risks") : [];
      for (var rc = 0; rc < riskCheckboxes.length; rc++) {
        var chkRiskId = riskCheckboxes[rc].getAttribute("data-risk-id");
        if (chkRiskId && allRisks) {
          for (var ar = 0; ar < allRisks.length; ar++) {
            if (allRisks[ar].id === chkRiskId) {
              var chkRisk = allRisks[ar];
              var ciLikelihood = parseInt(chkRisk.inherentLikelihood) || 3;
              var ciImpact = parseInt(chkRisk.inherentImpact) || 3;
              var crLikelihood = parseInt(chkRisk.residualLikelihood) || ciLikelihood;
              var crImpact = parseInt(chkRisk.residualImpact) || ciImpact;

              linkedRisks.push({
                title: chkRisk.title,
                description: chkRisk.description || "",
                category: chkRisk.category || "operational",
                inherentLikelihood: ciLikelihood,
                inherentImpact: ciImpact,
                inherentScore: ciLikelihood * ciImpact,
                residualLikelihood: crLikelihood,
                residualImpact: crImpact,
                residualScore: crLikelihood * crImpact,
                status: chkRisk.status || "open",
                rootCauses: chkRisk.rootCauses || [],
                consequences: chkRisk.consequences || []
              });
              break;
            }
          }
        }
      }
    }
  }

  if (linkedRisks.length > 0) {
    context.linkedRisks = linkedRisks;
  }

  return context;
};

/**
 * Build system prompt for control field suggestions
 */
ERM.controlsAI.deepSeek.getSystemPrompt = function(fieldType) {
  var industryName = ERM.riskAI ? ERM.riskAI.getCurrentIndustry() : "general";

  var basePrompt = "You are an expert internal control and risk management consultant with deep expertise in the " +
    industryName + " industry. You help organizations design and implement effective internal controls following " +
    "COSO framework and industry best practices. Provide practical, industry-specific suggestions. " +
    "Always respond in valid JSON format only.";

  return basePrompt;
};

/**
 * Call DeepSeek for field suggestions
 * @param {string} fieldType - Type of field (name, description, type, category, owner)
 * @param {Object} context - Form context
 * @param {Function} callback - Callback(error, suggestions[])
 */
ERM.controlsAI.deepSeek.getSuggestions = function(fieldType, context, callback) {
  var self = this;

  // Check if AI service is available
  if (typeof ERM.aiService === "undefined" || !ERM.aiService.callAPI) {
    console.log("[DeepSeek Controls] AI service not available");
    callback("AI service not available", null);
    return;
  }

  // Check AI call limit
  if (typeof ERM.aiCounter !== "undefined") {
    var canCall = ERM.aiCounter.canMakeCall();
    if (!canCall.allowed) {
      ERM.aiCounter.showLimitModal();
      callback("AI call limit reached", null);
      return;
    }
  }

  var prompt = this.buildPrompt(fieldType, context);
  var systemPrompt = this.getSystemPrompt(fieldType);

  console.log("[DeepSeek Controls] Calling API for:", fieldType);

  ERM.aiService.callAPI(
    prompt,
    function(response) {
      if (response && response.success && response.text) {
        var parsed = self.parseResponse(response.text, fieldType);
        if (parsed && parsed.suggestions && parsed.suggestions.length > 0) {
          // Note: AI counter is now incremented centrally in ai-service.js callAPI()
          // This ensures consistent counting for all API calls
          console.log("[DeepSeek Controls] Suggestions parsed successfully, count handled by AIService");

          callback(null, parsed);
        } else {
          console.log("[DeepSeek Controls] Failed to parse response");
          callback("Failed to parse AI response", null);
        }
      } else {
        console.log("[DeepSeek Controls] API call failed:", response ? response.error : "Unknown error");
        callback(response ? response.error : "API call failed", null);
      }
    },
    {
      systemPrompt: systemPrompt,
      maxTokens: 1000,
      temperature: 0.7
    }
  );
};

/**
 * Build prompt based on field type and context
 */
ERM.controlsAI.deepSeek.buildPrompt = function(fieldType, context) {
  var contextParts = [];

  if (context.industry) {
    contextParts.push("Industry: " + context.industry);
  }
  if (context.name) {
    contextParts.push("Control Name: " + context.name);
  }
  if (context.description) {
    contextParts.push("Description: " + context.description);
  }
  if (context.type) {
    contextParts.push("Control Type: " + context.type);
  }
  if (context.category) {
    contextParts.push("Category: " + context.category);
  }
  if (context.owner) {
    contextParts.push("Owner: " + context.owner);
  }
  if (context.effectiveness) {
    contextParts.push("Effectiveness: " + context.effectiveness);
  }
  if (context.status) {
    contextParts.push("Status: " + context.status);
  }
  if (context.frequency) {
    contextParts.push("Review Frequency: " + context.frequency);
  }
  if (context.lastReviewDate) {
    contextParts.push("Last Review Date: " + context.lastReviewDate);
  }
  if (context.currentNextReviewDate) {
    contextParts.push("Current Next Review Date: " + context.currentNextReviewDate);
  }
  if (context.linkedRisks && context.linkedRisks.length > 0) {
    var riskList = [];
    for (var i = 0; i < context.linkedRisks.length; i++) {
      var r = context.linkedRisks[i];
      var riskInfo = r.title + " (Category: " + r.category;
      if (r.inherentLikelihood) {
        riskInfo += ", Likelihood: " + r.inherentLikelihood;
      }
      if (r.inherentImpact) {
        riskInfo += ", Impact: " + r.inherentImpact;
      }
      if (r.status) {
        riskInfo += ", Status: " + r.status;
      }
      riskInfo += ")";
      riskList.push(riskInfo);
    }
    contextParts.push("Linked Risks:\n  - " + riskList.join("\n  - "));
  }

  var contextStr = contextParts.join("\n");
  var prompt = "";

  switch (fieldType) {
    case "name":
    case "controlName":
      prompt = "Based on the following control context, suggest 4 concise control names for an internal control register.\n\n" +
        "CONTROL CONTEXT:\n" + contextStr + "\n\n" +
        "Each name should:\n" +
        "- Be 3-8 words\n" +
        "- Clearly identify the control activity\n" +
        "- Use professional control terminology\n" +
        "- Be specific to the context\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": ["name 1", "name 2", "name 3", "name 4"], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-3) of the best name.";
      break;

    case "description":
      prompt = "Based on the following control context, generate 3 professional control descriptions.\n\n" +
        "CONTROL CONTEXT:\n" + contextStr + "\n\n" +
        "Each description should:\n" +
        "- Be 2-4 sentences long\n" +
        "- Explain what the control does and how it works\n" +
        "- Use professional control management language\n" +
        "- Be specific to the industry context\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": ["description 1", "description 2", "description 3"], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-2) of the best description.";
      break;

    case "type":
    case "controlType":
      // Build detailed linked risks context
      var typeRiskContext = "";
      if (context.linkedRisks && context.linkedRisks.length > 0) {
        typeRiskContext = "\n\nLINKED RISKS THIS CONTROL MUST ADDRESS:\n";
        for (var tr = 0; tr < context.linkedRisks.length; tr++) {
          var tRisk = context.linkedRisks[tr];
          typeRiskContext += "\n" + (tr + 1) + ". " + tRisk.title;
          if (tRisk.category) typeRiskContext += "\n   Category: " + tRisk.category;
          if (tRisk.description) typeRiskContext += "\n   Description: " + tRisk.description;
          if (tRisk.inherentScore) typeRiskContext += "\n   Inherent Risk Score: " + tRisk.inherentScore;
          if (tRisk.residualScore) typeRiskContext += "\n   Residual Risk Score: " + tRisk.residualScore;
          if (tRisk.status) typeRiskContext += "\n   Status: " + tRisk.status;
        }
      }

      prompt = "Based on the following control context, suggest the most appropriate control type.\n\n" +
        "CONTROL CONTEXT:\n" + contextStr + typeRiskContext + "\n\n" +
        "Control types to choose from:\n" +
        "- preventive: Prevents errors or fraud from occurring (best for high-likelihood risks)\n" +
        "- detective: Detects errors or fraud after they occur (best when prevention is difficult)\n" +
        "- corrective: Corrects errors or issues after detection (best for mitigating impact)\n" +
        "- directive: Provides guidance to ensure compliance (best for policy/procedure gaps)\n\n" +
        "CRITICAL: Your reasoning MUST specifically reference the linked risks by name and explain WHY this control type best addresses those specific risks.\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": [{"type": "preventive", "reason": "For [Risk Name], preventive control is best because..."}, {"type": "detective", "reason": "..."}, {"type": "corrective", "reason": "..."}, {"type": "directive", "reason": "..."}], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-3) of the most appropriate type for the linked risks.";
      break;

    case "category":
      // Build detailed linked risks context for category
      var catRiskContext = "";
      if (context.linkedRisks && context.linkedRisks.length > 0) {
        catRiskContext = "\n\nLINKED RISKS THIS CONTROL MUST ADDRESS:\n";
        for (var cr = 0; cr < context.linkedRisks.length; cr++) {
          var cRisk = context.linkedRisks[cr];
          catRiskContext += "\n" + (cr + 1) + ". " + cRisk.title;
          if (cRisk.category) catRiskContext += " (Risk Category: " + cRisk.category + ")";
          if (cRisk.description) catRiskContext += "\n   Description: " + cRisk.description;
          if (cRisk.inherentScore) catRiskContext += "\n   Inherent Risk Score: " + cRisk.inherentScore;
        }
      }

      // Get available categories
      var availableControlCats = [];
      if (ERM.controls && ERM.controls.categories) {
        for (var cc = 0; cc < ERM.controls.categories.length; cc++) {
          var ctrlCat = ERM.controls.categories[cc];
          availableControlCats.push(ctrlCat.label || ctrlCat.value);
        }
      }
      var catListStr = availableControlCats.length > 0 ? availableControlCats.join(", ") : "Policy, Procedure, Technical, Physical, Administrative";

      prompt = "Based on the following control context, suggest the most appropriate control category.\n\n" +
        "CONTROL CONTEXT:\n" + contextStr + catRiskContext + "\n\n" +
        "AVAILABLE CATEGORIES: " + catListStr + "\n\n" +
        "Consider:\n" +
        "- The control name and description\n" +
        "- The LINKED RISKS and their categories - the control category should ALIGN with the risk domain\n" +
        "- Industry-specific control frameworks for " + (context.industry || "general") + "\n" +
        "- COSO framework categories and governance standards\n\n" +
        "CRITICAL: Your reasoning MUST specifically reference the linked risks by name and explain WHY this category best addresses those risks.\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": [{"category": "Category Name", "reason": "For [Risk Name], this category is best because..."}, {"category": "Category 2", "reason": "..."}, {"category": "Category 3", "reason": "..."}, {"category": "Category 4", "reason": "..."}], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-3) of the most appropriate category for the linked risks.";
      break;

    case "owner":
    case "controlOwner":
      prompt = "Based on the following control context, suggest 4 appropriate control owner roles/positions.\n\n" +
        "CONTROL CONTEXT:\n" + contextStr + "\n\n" +
        "Consider:\n" +
        "- Who has authority to manage this control in the " + (context.industry || "general") + " industry\n" +
        "- Who has operational responsibility for this type of control\n" +
        "- Industry-specific organizational structures and reporting lines\n" +
        "- The control type, category, and linked risks\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": [{"role": "Role Title 1", "reason": "Brief justification"}, {"role": "Role Title 2", "reason": "Brief justification"}, {"role": "Role Title 3", "reason": "Brief justification"}, {"role": "Role Title 4", "reason": "Brief justification"}], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-3) of the most appropriate owner.";
      break;

    case "nextReviewDate":
    case "reviewDate":
      var todayStr = new Date().toISOString().split('T')[0];
      prompt = "Based on the following control context, suggest 4 appropriate next review dates with justifications.\n\n" +
        "CONTROL CONTEXT:\n" + contextStr + "\n" +
        "Today's date: " + todayStr + "\n\n" +
        "Consider:\n" +
        "- Control type determines review frequency (preventive controls need more frequent review than directive controls)\n" +
        "- Industry regulations and compliance requirements for the " + (context.industry || "general") + " industry\n" +
        "- Risk severity of linked risks\n" +
        "- Best practices: high-risk controls reviewed quarterly, medium bi-annually, low annually\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": [{"date": "YYYY-MM-DD", "label": "e.g. 3 Months", "reason": "1 sentence justification"}, {"date": "YYYY-MM-DD", "label": "e.g. 6 Months", "reason": "1 sentence justification"}, {"date": "YYYY-MM-DD", "label": "e.g. 1 Year", "reason": "1 sentence justification"}, {"date": "YYYY-MM-DD", "label": "e.g. 2 Years", "reason": "1 sentence justification"}], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-3) of the most appropriate date based on the control context.";
      break;

    case "targetDate":
      var todayStr2 = new Date().toISOString().split('T')[0];
      prompt = "Based on the following control context, suggest 4 appropriate target completion dates with justifications.\n\n" +
        "CONTROL CONTEXT:\n" + contextStr + "\n" +
        "Today's date: " + todayStr2 + "\n\n" +
        "Consider:\n" +
        "- Urgency based on control type and linked risk severity\n" +
        "- Implementation complexity for this type of control\n" +
        "- Industry standards for control implementation timelines in " + (context.industry || "general") + "\n" +
        "- Resource availability and organizational capacity\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": [{"date": "YYYY-MM-DD", "label": "e.g. 2 Weeks", "reason": "1 sentence justification"}, {"date": "YYYY-MM-DD", "label": "e.g. 1 Month", "reason": "1 sentence justification"}, {"date": "YYYY-MM-DD", "label": "e.g. 3 Months", "reason": "1 sentence justification"}, {"date": "YYYY-MM-DD", "label": "e.g. 6 Months", "reason": "1 sentence justification"}], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-3) of the most appropriate target date.";
      break;

    case "frequency":
      // Build detailed linked risks context for frequency
      var freqRiskContext = "";
      if (context.linkedRisks && context.linkedRisks.length > 0) {
        freqRiskContext = "\n\nLINKED RISKS THIS CONTROL ADDRESSES:\n";
        for (var fr = 0; fr < context.linkedRisks.length; fr++) {
          var fRisk = context.linkedRisks[fr];
          freqRiskContext += "\n" + (fr + 1) + ". " + fRisk.title;
          if (fRisk.category) freqRiskContext += " (Category: " + fRisk.category + ")";
          if (fRisk.inherentScore) freqRiskContext += "\n   Inherent Risk Score: " + fRisk.inherentScore + " (1=Low, 25=Critical)";
          if (fRisk.residualScore) freqRiskContext += "\n   Residual Risk Score: " + fRisk.residualScore;
          if (fRisk.status) freqRiskContext += "\n   Risk Status: " + fRisk.status;
        }
      }

      // Get available frequencies
      var availableFreqs = [];
      if (ERM.controls && ERM.controls.frequencies) {
        for (var ff = 0; ff < ERM.controls.frequencies.length; ff++) {
          var freq = ERM.controls.frequencies[ff];
          availableFreqs.push(freq.label || freq.value);
        }
      }
      var freqListStr = availableFreqs.length > 0 ? availableFreqs.join(", ") : "Daily, Weekly, Monthly, Quarterly, Annually";

      prompt = "Based on the following control context, suggest the most appropriate control testing/review frequency.\n\n" +
        "CONTROL CONTEXT:\n" + contextStr + freqRiskContext + "\n\n" +
        "AVAILABLE FREQUENCIES: " + freqListStr + "\n\n" +
        "FREQUENCY SELECTION RULES:\n" +
        "- Critical/High risks (score 15-25): Daily or Weekly testing required\n" +
        "- Medium risks (score 8-14): Weekly or Monthly testing\n" +
        "- Low risks (score 1-7): Monthly or Quarterly testing\n" +
        "- Preventive controls need more frequent testing than detective controls\n" +
        "- Industry: " + (context.industry || "general") + " regulatory requirements apply\n\n" +
        "CRITICAL: Your reasoning MUST specifically reference the linked risks by name and their risk scores to justify the frequency.\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": [{"frequency": "Weekly", "reason": "For [Risk Name] with inherent score of X, weekly testing ensures..."}, {"frequency": "Monthly", "reason": "..."}, {"frequency": "Quarterly", "reason": "..."}, {"frequency": "Daily", "reason": "..."}], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-3) of the most appropriate frequency based on the linked risk severity.";
      break;

    case "status":
    case "controlStatus":
      prompt = "Based on the following control context, suggest the most appropriate control status.\n\n" +
        "CONTROL CONTEXT:\n" + contextStr + "\n\n" +
        "Available statuses:\n" +
        "- Active: Control is currently in use and operating effectively\n" +
        "- Inactive: Control is not currently active or operational\n" +
        "- Under Review: Control is being evaluated for effectiveness\n" +
        "- Planned: Control is planned for future implementation\n\n" +
        "Consider:\n" +
        "- Whether the control has been implemented\n" +
        "- If effectiveness has been tested\n" +
        "- Any linked risks and their status\n" +
        "- Industry requirements for " + (context.industry || "general") + "\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": [{"value": "Active", "reason": "1 sentence justification"}, {"value": "Under Review", "reason": "1 sentence justification"}, {"value": "Planned", "reason": "1 sentence justification"}, {"value": "Inactive", "reason": "1 sentence justification"}], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-3) of the most appropriate status based on control state.";
      break;

    case "evidence":
      // Build linked risks context for evidence suggestions
      var evidenceRiskContext = "";
      if (context.linkedRisks && context.linkedRisks.length > 0) {
        evidenceRiskContext = "\n\nLINKED RISKS:\n";
        for (var er = 0; er < context.linkedRisks.length; er++) {
          var eRisk = context.linkedRisks[er];
          evidenceRiskContext += "- " + eRisk.title;
          if (eRisk.category) evidenceRiskContext += " (" + eRisk.category + ")";
          evidenceRiskContext += "\n";
        }
      }

      prompt = "Based on the following control context, suggest 4-5 types of evidence documents that should be attached to demonstrate control effectiveness and support audit trails.\n\n" +
        "CONTROL CONTEXT:\n" + contextStr + evidenceRiskContext + "\n\n" +
        "Consider:\n" +
        "- The control type (preventive/detective/corrective/directive) determines evidence needs\n" +
        "- Linked risks should have corresponding mitigation evidence\n" +
        "- Industry: " + (context.industry || "general") + " regulatory and compliance requirements\n" +
        "- Audit trail requirements for internal controls\n" +
        "- Documentation that proves control operation and effectiveness\n\n" +
        "Examples of evidence types:\n" +
        "- Approval logs, sign-off sheets, authorization records\n" +
        "- System screenshots, configuration exports, access logs\n" +
        "- Training records, certifications, competency assessments\n" +
        "- Testing results, exception reports, reconciliations\n" +
        "- Policy documents, procedure manuals, work instructions\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": [{"document": "Document Type 1", "reason": "Why this evidence is needed for this control"}, {"document": "Document Type 2", "reason": "..."}, {"document": "Document Type 3", "reason": "..."}, {"document": "Document Type 4", "reason": "..."}], "recommended": 0}\n\n' +
        "Make suggestions SPECIFIC to this control and its linked risks.";
      break;

    case "linkedRisks":
      // Get all available risks to recommend
      var availableRisks = [];
      var allRisks = ERM.storage ? ERM.storage.get("risks") : [];
      var activeRegisterId = ERM.storage ? ERM.storage.get("activeRegisterId") : null;

      if (allRisks && allRisks.length > 0) {
        for (var ri = 0; ri < allRisks.length; ri++) {
          var r = allRisks[ri];
          if (!activeRegisterId || r.registerId === activeRegisterId) {
            availableRisks.push({
              id: r.id,
              title: r.title,
              category: r.category || "operational",
              description: r.description || "",
              inherentScore: (parseInt(r.inherentLikelihood) || 3) * (parseInt(r.inherentImpact) || 3)
            });
          }
        }
      }

      var risksListStr = "";
      for (var rl = 0; rl < availableRisks.length; rl++) {
        var rsk = availableRisks[rl];
        risksListStr += "\n" + (rl + 1) + ". " + rsk.title + " (Category: " + rsk.category + ", Score: " + rsk.inherentScore + ")";
        if (rsk.description) risksListStr += "\n   Description: " + rsk.description.substring(0, 100);
      }

      prompt = "Based on the following control context, recommend which risks this control should be linked to.\n\n" +
        "CONTROL:\n" + contextStr + "\n\n" +
        "AVAILABLE RISKS IN REGISTER:" + risksListStr + "\n\n" +
        "INSTRUCTIONS:\n" +
        "1. Analyze the control name, type, and description\n" +
        "2. Identify which risks this control would effectively mitigate\n" +
        "3. Recommend 2-4 risks that are MOST relevant to this control\n" +
        "4. The first recommendation should be the BEST match\n" +
        "5. Explain WHY each risk should be linked to this control\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": [{"riskId": "risk-id-here", "riskTitle": "Risk Title", "reason": "This control mitigates this risk because..."}, ...], "recommended": 0}\n\n' +
        "Use the EXACT risk IDs from the list above.";
      break;

    default:
      prompt = "Based on the context, provide relevant suggestions.\n\n" +
        "CONTEXT:\n" + contextStr + "\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"], "recommended": 0}';
  }

  return prompt;
};

/**
 * Parse DeepSeek response into suggestions array
 */
ERM.controlsAI.deepSeek.parseResponse = function(responseText, fieldType) {
  try {
    // Try to extract JSON from the response
    var jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log("[DeepSeek Controls] No JSON found in response");
      return null;
    }

    var parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
      console.log("[DeepSeek Controls] Invalid suggestions format");
      return null;
    }

    // Return structured result
    return {
      suggestions: parsed.suggestions,
      recommended: typeof parsed.recommended === "number" ? parsed.recommended : 0,
      reasoning: parsed.reasoning || null
    };
  } catch (e) {
    console.error("[DeepSeek Controls] Parse error:", e);
    return null;
  }
};

/**
 * Called when user accepts a suggestion (clicks "Use" button)
 * Note: AI counter is now incremented when API call is made, not when suggestion is used.
 * This function is kept for backwards compatibility and any future logging needs.
 */
ERM.controlsAI.deepSeek.onSuggestionUsed = function() {
  // AI counter is now incremented at API call time in getSuggestions()
  // This prevents counting multiple times when user selects multiple suggestions
  // from the same API response
  console.log("[DeepSeek Controls] Suggestion used (no counter increment - counted at API call)");
  return null;
};

console.log("controls-ai-deepseek-suggestions.js loaded successfully");

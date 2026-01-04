/**
 * Dimeri ERM - Risk AI DeepSeek Suggestions
 * DeepSeek-powered field suggestions for risk forms
 *
 * @version 1.0.0
 * ES5 Compatible
 */

console.log("Loading risk-ai-deepseek-suggestions.js...");

var ERM = window.ERM || {};
ERM.riskAI = ERM.riskAI || {};
ERM.riskAI.deepSeek = ERM.riskAI.deepSeek || {};

/* ========================================
   DEEPSEEK FIELD SUGGESTION API
   Context-aware suggestions using DeepSeek AI
   ======================================== */

/**
 * Get form context for AI suggestions
 * Gathers all filled-in fields from the risk form
 */
ERM.riskAI.deepSeek.getFormContext = function() {
  var context = {
    industry: ERM.riskAI.getCurrentIndustry() || "general",
    registerType: ERM.riskAI.getCurrentRegisterType() || "enterprise"
  };

  // Get title
  var titleEl = document.getElementById("risk-title");
  if (titleEl && titleEl.value.trim()) {
    context.title = titleEl.value.trim();
  }

  // Get description
  var descEl = document.getElementById("risk-description");
  if (descEl && descEl.value.trim()) {
    context.description = descEl.value.trim();
  }

  // Get category
  var catEl = document.getElementById("risk-category");
  if (catEl && catEl.value) {
    context.category = catEl.value;
  }

  // Get root causes - try both possible container IDs
  var causesContainer = document.getElementById("rootCauses-list") || document.getElementById("root-causes-list");
  if (causesContainer) {
    var causes = [];
    // Try both possible class names for list item text
    var causeItems = causesContainer.querySelectorAll(".list-input-text, .list-item-text");
    for (var i = 0; i < causeItems.length; i++) {
      var text = causeItems[i].textContent.trim();
      if (text) causes.push(text);
    }
    if (causes.length > 0) {
      context.rootCauses = causes;
    }
  }

  // Get consequences - try both possible container IDs
  var consContainer = document.getElementById("consequences-list");
  if (consContainer) {
    var consequences = [];
    // Try both possible class names for list item text
    var consItems = consContainer.querySelectorAll(".list-input-text, .list-item-text");
    for (var j = 0; j < consItems.length; j++) {
      var consText = consItems[j].textContent.trim();
      if (consText) consequences.push(consText);
    }
    if (consequences.length > 0) {
      context.consequences = consequences;
    }
  }

  // Get linked controls with FULL details for residual risk assessment
  // IMPORTANT: Read from CURRENT form checkboxes, not saved state
  var linkedControls = [];

  // First try to get from checked checkboxes in the form (current state)
  var checkboxes = document.querySelectorAll(".inline-control-checkbox:checked");
  if (checkboxes.length > 0) {
    var allControls = ERM.storage.get("controls") || [];
    for (var k = 0; k < checkboxes.length; k++) {
      var ctrlId = checkboxes[k].getAttribute("data-control-id");
      if (ctrlId) {
        var ctrl = null;
        for (var m = 0; m < allControls.length; m++) {
          if (allControls[m].id === ctrlId) {
            ctrl = allControls[m];
            break;
          }
        }
        if (ctrl) {
          linkedControls.push({
            name: ctrl.name || "Unnamed Control",
            description: ctrl.description || "",
            type: ctrl.type || "directive",
            category: ctrl.category || "",
            effectiveness: ctrl.effectiveness || "not-tested",
            status: ctrl.status || "planned",
            frequency: ctrl.frequency || "",
            owner: ctrl.owner || ""
          });
        }
      }
    }
  } else if (typeof ERM.riskRegister !== "undefined" && ERM.riskRegister.state) {
    // Fallback to saved state if no checkboxes found (form not open)
    var editingRisk = ERM.riskRegister.state.editingRisk;
    if (editingRisk && editingRisk.linkedControls) {
      var allControlsFallback = ERM.storage.get("controls") || [];
      for (var n = 0; n < editingRisk.linkedControls.length; n++) {
        var ctrlIdFb = editingRisk.linkedControls[n];
        var ctrlFb = null;
        for (var p = 0; p < allControlsFallback.length; p++) {
          if (allControlsFallback[p].id === ctrlIdFb) {
            ctrlFb = allControlsFallback[p];
            break;
          }
        }
        if (ctrlFb) {
          linkedControls.push({
            name: ctrlFb.name || "Unnamed Control",
            description: ctrlFb.description || "",
            type: ctrlFb.type || "directive",
            category: ctrlFb.category || "",
            effectiveness: ctrlFb.effectiveness || "not-tested",
            status: ctrlFb.status || "planned",
            frequency: ctrlFb.frequency || "",
            owner: ctrlFb.owner || ""
          });
        }
      }
    }
  }
  if (linkedControls.length > 0) {
    context.linkedControls = linkedControls;
  }
  context.hasLinkedControls = linkedControls.length > 0;
  context.controlCount = linkedControls.length;

  // Get treatment
  var treatmentEl = document.getElementById("risk-treatment");
  if (treatmentEl && treatmentEl.value) {
    context.treatment = treatmentEl.value;
  }

  // Get status
  var statusEl = document.getElementById("risk-status");
  if (statusEl && statusEl.value) {
    context.status = statusEl.value;
  }

  // Get risk owner
  var ownerEl = document.getElementById("risk-owner");
  if (ownerEl && ownerEl.value.trim()) {
    context.owner = ownerEl.value.trim();
  }

  // Get inherent likelihood
  var inhLikEl = document.getElementById("inherent-likelihood");
  if (inhLikEl && inhLikEl.value) {
    context.inherentLikelihood = inhLikEl.value;
  }

  // Get inherent impact
  var inhImpEl = document.getElementById("inherent-impact");
  if (inhImpEl && inhImpEl.value) {
    context.inherentImpact = inhImpEl.value;
  }

  // Get residual likelihood
  var resLikEl = document.getElementById("residual-likelihood");
  if (resLikEl && resLikEl.value) {
    context.residualLikelihood = resLikEl.value;
  }

  // Get residual impact
  var resImpEl = document.getElementById("residual-impact");
  if (resImpEl && resImpEl.value) {
    context.residualImpact = resImpEl.value;
  }

  // Get current target date
  var targetDateEl = document.getElementById("risk-target-date");
  if (targetDateEl && targetDateEl.value) {
    context.currentTargetDate = targetDateEl.value;
  }

  // Get current review date
  var reviewDateEl = document.getElementById("risk-review-date");
  if (reviewDateEl && reviewDateEl.value) {
    context.currentReviewDate = reviewDateEl.value;
  }

  return context;
};

/**
 * Build system prompt for risk field suggestions
 */
ERM.riskAI.deepSeek.getSystemPrompt = function(fieldType) {
  var industryName = ERM.riskAI.getCurrentIndustry() || "general";

  var basePrompt = "You are an expert enterprise risk management consultant with deep expertise in the " +
    industryName + " industry. You help organizations identify, assess, and manage risks following " +
    "ISO 31000:2018 standards. Provide practical, industry-specific suggestions. " +
    "Always respond in valid JSON format only.";

  return basePrompt;
};

/**
 * Call DeepSeek for field suggestions
 * @param {string} fieldType - Type of field (causes, consequences, description, owner, actions)
 * @param {Object} context - Form context
 * @param {Function} callback - Callback(error, suggestions[])
 */
ERM.riskAI.deepSeek.getSuggestions = function(fieldType, context, callback) {
  var self = this;

  // Check if AI service is available
  if (typeof ERM.aiService === "undefined" || !ERM.aiService.callAPI) {
    console.log("[DeepSeek Suggestions] AI service not available");
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

  console.log("[DeepSeek Suggestions] Calling API for:", fieldType);

  ERM.aiService.callAPI(
    prompt,
    function(response) {
      if (response && response.success && response.text) {
        var parsed = self.parseResponse(response.text, fieldType);
        if (parsed && parsed.suggestions && parsed.suggestions.length > 0) {
          // Note: AI counter is now incremented centrally in ai-service.js callAPI()
          // This ensures consistent counting for all API calls
          console.log("[DeepSeek Suggestions] Suggestions parsed successfully, count handled by AIService");

          callback(null, parsed);
        } else {
          console.log("[DeepSeek Suggestions] Failed to parse response:", response.text);
          callback("Failed to parse AI response", null);
        }
      } else {
        console.log("[DeepSeek Suggestions] API call failed:", response ? response.error : "Unknown error");
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
ERM.riskAI.deepSeek.buildPrompt = function(fieldType, context) {
  var contextParts = [];

  if (context.industry) {
    contextParts.push("Industry: " + context.industry);
  }
  if (context.title) {
    contextParts.push("Risk Title: " + context.title);
  }
  if (context.description) {
    contextParts.push("Description: " + context.description);
  }
  if (context.category) {
    contextParts.push("Category: " + context.category);
  }
  if (context.rootCauses && context.rootCauses.length > 0) {
    contextParts.push("Root Causes: " + context.rootCauses.join("; "));
  }
  if (context.consequences && context.consequences.length > 0) {
    contextParts.push("Consequences: " + context.consequences.join("; "));
  }
  if (context.linkedControls && context.linkedControls.length > 0) {
    var ctrlList = [];
    for (var i = 0; i < context.linkedControls.length; i++) {
      var c = context.linkedControls[i];
      ctrlList.push(c.name + " (" + c.type + ", " + c.effectiveness + ")");
    }
    contextParts.push("Linked Controls: " + ctrlList.join("; "));
  }
  if (context.treatment) {
    contextParts.push("Treatment Approach: " + context.treatment);
  }
  if (context.status) {
    contextParts.push("Status: " + context.status);
  }
  if (context.owner) {
    contextParts.push("Risk Owner: " + context.owner);
  }
  if (context.inherentLikelihood) {
    contextParts.push("Inherent Likelihood: " + context.inherentLikelihood);
  }
  if (context.inherentImpact) {
    contextParts.push("Inherent Impact: " + context.inherentImpact);
  }
  if (context.residualLikelihood) {
    contextParts.push("Residual Likelihood: " + context.residualLikelihood);
  }
  if (context.residualImpact) {
    contextParts.push("Residual Impact: " + context.residualImpact);
  }
  if (context.currentTargetDate) {
    contextParts.push("Current Target Date: " + context.currentTargetDate);
  }
  if (context.currentReviewDate) {
    contextParts.push("Current Review Date: " + context.currentReviewDate);
  }

  var contextStr = contextParts.join("\n");
  var prompt = "";

  switch (fieldType) {
    case "causes":
    case "rootCauses":
      prompt = "Based on the following risk context, suggest 5 specific root causes that could lead to this risk materializing.\n\n" +
        "RISK CONTEXT:\n" + contextStr + "\n\n" +
        "Consider:\n" +
        "- Internal organizational factors (people, processes, systems)\n" +
        "- External factors (market, regulatory, environmental)\n" +
        "- Industry-specific vulnerabilities\n" +
        "- Systemic vs isolated causes\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": ["cause 1", "cause 2", "cause 3", "cause 4", "cause 5"], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-4) of the most likely cause.";
      break;

    case "consequences":
      prompt = "Based on the following risk context, suggest 5 specific consequences if this risk materializes.\n\n" +
        "RISK CONTEXT:\n" + contextStr + "\n\n" +
        "Consider:\n" +
        "- Financial impacts (direct costs, revenue loss, penalties)\n" +
        "- Operational impacts (disruption, delays, capacity)\n" +
        "- Reputational impacts (stakeholder trust, brand damage)\n" +
        "- Regulatory/legal impacts (compliance, litigation)\n" +
        "- Safety/health impacts if applicable\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": ["consequence 1", "consequence 2", "consequence 3", "consequence 4", "consequence 5"], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-4) of the highest impact consequence.";
      break;

    case "description":
      prompt = "Based on the following risk context, generate 3 professional risk descriptions suitable for an enterprise risk register.\n\n" +
        "RISK CONTEXT:\n" + contextStr + "\n\n" +
        "Each description should:\n" +
        "- Be 1-3 sentences long\n" +
        "- Clearly articulate the risk event and potential impact\n" +
        "- Use professional risk management language\n" +
        "- Be specific to the industry context\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": ["description 1", "description 2", "description 3"], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-2) of the best description.";
      break;

    case "riskOwner":
    case "owner":
      prompt = "Based on the following risk context, suggest 4 appropriate risk owner roles/positions.\n\n" +
        "RISK CONTEXT:\n" + contextStr + "\n\n" +
        "Consider:\n" +
        "- Who has authority to manage this risk in the " + (context.industry || "general") + " industry\n" +
        "- Who has budget responsibility for mitigation\n" +
        "- Industry-specific organizational structures and reporting lines\n" +
        "- The risk category, severity, and type\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": [{"role": "Role Title 1", "reason": "Brief justification"}, {"role": "Role Title 2", "reason": "Brief justification"}, {"role": "Role Title 3", "reason": "Brief justification"}, {"role": "Role Title 4", "reason": "Brief justification"}], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-3) of the most appropriate owner.";
      break;

    case "actionOwner":
      prompt = "Based on the following risk context, suggest 4 appropriate action owner roles/positions.\n\n" +
        "RISK CONTEXT:\n" + contextStr + "\n\n" +
        "Consider:\n" +
        "- Who would implement the mitigation actions in the " + (context.industry || "general") + " industry\n" +
        "- Who has operational responsibility for risk mitigation\n" +
        "- Industry-specific organizational structures\n" +
        "- The nature of the risk and required expertise\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": [{"role": "Role Title 1", "reason": "Brief justification"}, {"role": "Role Title 2", "reason": "Brief justification"}, {"role": "Role Title 3", "reason": "Brief justification"}, {"role": "Role Title 4", "reason": "Brief justification"}], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-3) of the most appropriate owner.";
      break;

    case "targetDate":
      var todayStr = new Date().toISOString().split('T')[0];
      prompt = "Based on the following risk context, suggest 4 appropriate target completion dates for risk mitigation actions.\n\n" +
        "RISK CONTEXT:\n" + contextStr + "\n" +
        "Today's date: " + todayStr + "\n\n" +
        "Consider:\n" +
        "- Urgency based on risk severity and likelihood\n" +
        "- Implementation complexity for mitigation actions\n" +
        "- Industry standards for risk response timelines in " + (context.industry || "general") + "\n" +
        "- Resource availability and organizational capacity\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": [{"date": "YYYY-MM-DD", "label": "e.g. 2 Weeks", "reason": "1 sentence justification"}, {"date": "YYYY-MM-DD", "label": "e.g. 1 Month", "reason": "1 sentence justification"}, {"date": "YYYY-MM-DD", "label": "e.g. 3 Months", "reason": "1 sentence justification"}, {"date": "YYYY-MM-DD", "label": "e.g. 6 Months", "reason": "1 sentence justification"}], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-3) of the most appropriate target date based on risk urgency.";
      break;

    case "reviewDate":
    case "nextReviewDate":
      var todayStr2 = new Date().toISOString().split('T')[0];
      prompt = "Based on the following risk context, suggest 4 appropriate next review dates.\n\n" +
        "RISK CONTEXT:\n" + contextStr + "\n" +
        "Today's date: " + todayStr2 + "\n\n" +
        "Consider:\n" +
        "- Risk severity determines review frequency (high risks need more frequent review)\n" +
        "- Industry regulations and compliance requirements for " + (context.industry || "general") + "\n" +
        "- Whether the risk is actively being mitigated or stable\n" +
        "- Best practices: critical risks reviewed monthly, high quarterly, medium bi-annually\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": [{"date": "YYYY-MM-DD", "label": "e.g. 1 Month", "reason": "1 sentence justification"}, {"date": "YYYY-MM-DD", "label": "e.g. 3 Months", "reason": "1 sentence justification"}, {"date": "YYYY-MM-DD", "label": "e.g. 6 Months", "reason": "1 sentence justification"}, {"date": "YYYY-MM-DD", "label": "e.g. 1 Year", "reason": "1 sentence justification"}], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-3) of the most appropriate review date based on risk profile.";
      break;

    case "actions":
    case "actionPlans":
      prompt = "Based on the following risk context, suggest 5 specific action items to mitigate this risk.\n\n" +
        "RISK CONTEXT:\n" + contextStr + "\n\n" +
        "Each action should:\n" +
        "- Be specific and actionable\n" +
        "- Start with an action verb\n" +
        "- Address either prevention or impact reduction\n" +
        "- Be realistic for the industry context\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": ["action 1", "action 2", "action 3", "action 4", "action 5"], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-4) of the priority action.";
      break;

    case "title":
      prompt = "Based on the following risk context, suggest 4 concise risk titles for an enterprise risk register.\n\n" +
        "RISK CONTEXT:\n" + contextStr + "\n\n" +
        "Each title should:\n" +
        "- Be 3-8 words\n" +
        "- Clearly identify the risk event\n" +
        "- Use professional risk terminology\n" +
        "- Be specific to the context\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": ["title 1", "title 2", "title 3", "title 4"], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-3) of the best title.";
      break;

    case "treatment":
      prompt = "Based on the following risk context, recommend the most appropriate risk treatment approach.\n\n" +
        "RISK CONTEXT:\n" + contextStr + "\n\n" +
        "The four ISO 31000 treatment options are:\n" +
        "1. Mitigate - Implement controls to reduce likelihood or impact\n" +
        "2. Accept - Accept the risk within appetite\n" +
        "3. Transfer - Transfer through insurance or contracts\n" +
        "4. Avoid - Eliminate the risk by avoiding the activity\n\n" +
        "Consider:\n" +
        "- Risk severity and appetite in the " + (context.industry || "general") + " industry\n" +
        "- Cost-benefit of mitigation vs transfer\n" +
        "- Whether controls are already linked\n" +
        "- Regulatory requirements\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": [{"value": "Mitigate", "reason": "1 sentence justification"}, {"value": "Accept", "reason": "1 sentence justification"}, {"value": "Transfer", "reason": "1 sentence justification"}, {"value": "Avoid", "reason": "1 sentence justification"}], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-3) of the most appropriate treatment for this specific risk.";
      break;

    case "status":
    case "riskStatus":
      prompt = "Based on the following risk context, suggest the most appropriate risk status.\n\n" +
        "RISK CONTEXT:\n" + contextStr + "\n\n" +
        "Available statuses:\n" +
        "- Identified: Risk has been identified and documented\n" +
        "- Assessed: Risk has been analyzed and scored\n" +
        "- Treated: Controls are being implemented\n" +
        "- Monitoring: Risk is being actively monitored\n" +
        "- Closed: Risk no longer applicable or fully mitigated\n\n" +
        "Consider:\n" +
        "- Whether risk scores are filled in (Assessed)\n" +
        "- Whether controls are linked (Treated)\n" +
        "- Whether action plans are in progress\n" +
        "- The stage of the risk lifecycle\n\n" +
        "Respond with ONLY a valid JSON object:\n" +
        '{"suggestions": [{"value": "Identified", "reason": "1 sentence justification"}, {"value": "Assessed", "reason": "1 sentence justification"}, {"value": "Treated", "reason": "1 sentence justification"}, {"value": "Monitoring", "reason": "1 sentence justification"}], "recommended": 0}\n\n' +
        "The 'recommended' field is the index (0-3) of the most appropriate status based on current risk state.";
      break;

    case "inherentLikelihood":
      // Build INHERENT context - EXCLUDE controls, focus on raw risk
      var inherentLikContext = [];
      if (context.industry) inherentLikContext.push("Industry: " + context.industry);
      if (context.title) inherentLikContext.push("Risk Title: " + context.title);
      if (context.description) inherentLikContext.push("Description: " + context.description);
      if (context.category) inherentLikContext.push("Category: " + context.category);
      if (context.rootCauses && context.rootCauses.length > 0) {
        inherentLikContext.push("Root Causes: " + context.rootCauses.join("; "));
      }
      if (context.consequences && context.consequences.length > 0) {
        inherentLikContext.push("Potential Consequences: " + context.consequences.join("; "));
      }
      var inherentLikStr = inherentLikContext.join("\n");

      prompt = "You are a senior risk management expert in the " + (context.industry || "general") + " industry.\n\n" +
        "TASK: Assess the INHERENT LIKELIHOOD of THIS SPECIFIC RISK - the probability of occurrence WITHOUT any controls.\n\n" +
        "THE RISK TO ASSESS:\n" + inherentLikStr + "\n\n" +
        "LIKELIHOOD SCALE:\n" +
        "1 - Rare: Exceptional circumstances only (<5% chance per year)\n" +
        "2 - Unlikely: Could occur but not expected (5-20% chance per year)\n" +
        "3 - Possible: Might occur at some time (20-50% chance per year)\n" +
        "4 - Likely: Will probably occur (50-80% chance per year)\n" +
        "5 - Almost Certain: Expected to occur (>80% chance per year)\n\n" +
        "CRITICAL INSTRUCTIONS:\n" +
        "1. Your justification MUST reference the SPECIFIC risk title '" + (context.title || "this risk") + "'\n" +
        "2. Your justification MUST explain WHY this score fits THIS risk, not generic risks\n" +
        "3. Reference the root causes or consequences provided when explaining your reasoning\n" +
        "4. Consider how common '" + (context.title || "this type of risk") + "' events are in " + (context.industry || "general") + " industry\n\n" +
        "Respond with ONLY valid JSON (exactly 4 suggestions, scores 1-5 as integers):\n" +
        '{"suggestions": [{"score": 4, "reason": "For Data Breach risk, score 4 because frequent cyber attacks in healthcare make this likely"}, {"score": 3, "reason": "Score 3 if..."}, {"score": 5, "reason": "Score 5 if..."}, {"score": 2, "reason": "Score 2 if..."}], "recommended": 0}\n\n' +
        "Put your BEST score first. Replace the example reasons with analysis of THIS specific risk.";
      break;

    case "inherentImpact":
      // Build INHERENT context - EXCLUDE controls, focus on raw risk
      var inherentImpContext = [];
      if (context.industry) inherentImpContext.push("Industry: " + context.industry);
      if (context.title) inherentImpContext.push("Risk Title: " + context.title);
      if (context.description) inherentImpContext.push("Description: " + context.description);
      if (context.category) inherentImpContext.push("Category: " + context.category);
      if (context.rootCauses && context.rootCauses.length > 0) {
        inherentImpContext.push("Root Causes: " + context.rootCauses.join("; "));
      }
      if (context.consequences && context.consequences.length > 0) {
        inherentImpContext.push("Potential Consequences: " + context.consequences.join("; "));
      }
      var inherentImpStr = inherentImpContext.join("\n");

      prompt = "You are a senior risk management expert in the " + (context.industry || "general") + " industry.\n\n" +
        "TASK: Assess the INHERENT IMPACT of THIS SPECIFIC RISK - the severity of consequences WITHOUT any controls.\n\n" +
        "THE RISK TO ASSESS:\n" + inherentImpStr + "\n\n" +
        "IMPACT SCALE:\n" +
        "1 - Negligible: Minimal impact (<$10K, minor inconvenience)\n" +
        "2 - Minor: Small impact ($10K-$100K, limited disruption)\n" +
        "3 - Moderate: Noticeable impact ($100K-$1M, significant disruption)\n" +
        "4 - Major: Significant impact ($1M-$10M, major disruption)\n" +
        "5 - Catastrophic: Severe impact (>$10M, threatens survival)\n\n" +
        "CRITICAL INSTRUCTIONS:\n" +
        "1. Your justification MUST reference the SPECIFIC risk '" + (context.title || "this risk") + "'\n" +
        "2. Your justification MUST explain WHY this impact score fits THIS risk specifically\n" +
        "3. Reference the CONSEQUENCES listed above: " + (context.consequences ? context.consequences.join(", ") : "none provided") + "\n" +
        "4. Consider financial, operational, reputational, and regulatory impacts for " + (context.industry || "general") + " industry\n\n" +
        "Respond with ONLY valid JSON (exactly 4 suggestions, scores 1-5 as integers):\n" +
        '{"suggestions": [{"score": 4, "reason": "For Equipment Failure risk, impact is 4 because production downtime costs $2M+ per incident"}, {"score": 3, "reason": "Score 3 if..."}, {"score": 5, "reason": "Score 5 if..."}, {"score": 2, "reason": "Score 2 if..."}], "recommended": 0}\n\n' +
        "Put your BEST score first. Replace the example reasons with analysis of THIS specific risk.";
      break;

    case "residualLikelihood":
      // Build RESIDUAL context - INCLUDE full control details
      var residualLikContext = [];
      if (context.industry) residualLikContext.push("Industry: " + context.industry);
      if (context.title) residualLikContext.push("Risk Title: " + context.title);
      if (context.description) residualLikContext.push("Description: " + context.description);
      if (context.category) residualLikContext.push("Category: " + context.category);
      if (context.rootCauses && context.rootCauses.length > 0) {
        residualLikContext.push("Root Causes: " + context.rootCauses.join("; "));
      }
      if (context.consequences && context.consequences.length > 0) {
        residualLikContext.push("Potential Consequences: " + context.consequences.join("; "));
      }
      if (context.inherentLikelihood) {
        residualLikContext.push("INHERENT Likelihood Score: " + context.inherentLikelihood + " (baseline before controls)");
      }

      // Add FULL control details
      var controlDetails = "";
      var controlNames = [];
      if (context.linkedControls && context.linkedControls.length > 0) {
        controlDetails = "\n\nLINKED CONTROLS (" + context.linkedControls.length + " controls in place):\n";
        for (var i = 0; i < context.linkedControls.length; i++) {
          var ctrl = context.linkedControls[i];
          controlNames.push(ctrl.name);
          controlDetails += "\n" + (i + 1) + ". " + ctrl.name;
          if (ctrl.description) controlDetails += "\n   Description: " + ctrl.description;
          controlDetails += "\n   Type: " + ctrl.type + " | Effectiveness: " + ctrl.effectiveness + " | Status: " + ctrl.status;
        }
      } else {
        controlDetails = "\n\nNO CONTROLS LINKED - residual likelihood = inherent likelihood (no reduction possible)";
      }
      var residualLikStr = residualLikContext.join("\n") + controlDetails;

      prompt = "You are a senior risk management expert in the " + (context.industry || "general") + " industry.\n\n" +
        "TASK: Assess the RESIDUAL LIKELIHOOD of '" + (context.title || "this risk") + "' AFTER considering the linked controls.\n\n" +
        "RISK AND CONTROL CONTEXT:\n" + residualLikStr + "\n\n" +
        "INHERENT LIKELIHOOD WAS: " + (context.inherentLikelihood || "not set") + "\n\n" +
        "LIKELIHOOD SCALE:\n" +
        "1 - Rare (<5% chance) - Controls significantly reduce likelihood\n" +
        "2 - Unlikely (5-20%) - Controls effectively reduce likelihood\n" +
        "3 - Possible (20-50%) - Controls provide moderate reduction\n" +
        "4 - Likely (50-80%) - Controls have limited effect\n" +
        "5 - Almost Certain (>80%) - Controls ineffective\n\n" +
        "CRITICAL INSTRUCTIONS:\n" +
        "1. Residual MUST be EQUAL TO OR LOWER than inherent (" + (context.inherentLikelihood || "not set") + ")\n" +
        "2. If NO CONTROLS are linked, residual = inherent (no reduction possible)\n" +
        "3. Your justification MUST name the SPECIFIC controls: " + (controlNames.length > 0 ? controlNames.join(", ") : "NONE") + "\n" +
        "4. Explain HOW these controls reduce the likelihood of '" + (context.title || "this risk") + "'\n" +
        "5. Preventive controls reduce likelihood more than detective/corrective controls\n\n" +
        "Respond with ONLY valid JSON (exactly 4 suggestions, scores 1-5 as integers):\n" +
        '{"suggestions": [{"score": 2, "reason": "With Access Control Policy, likelihood of Data Breach reduces to 2 because it prevents unauthorized access"}, {"score": 3, "reason": "Score 3 if..."}, {"score": 1, "reason": "Score 1 if..."}, {"score": 4, "reason": "Score 4 if..."}], "recommended": 0}\n\n' +
        "Put your BEST score first. Replace examples with THIS risk and ITS controls.";
      break;

    case "category":
      // Get available categories from the form
      var availableCategories = [];
      if (ERM.riskRegister && ERM.riskRegister.categories) {
        for (var catIdx = 0; catIdx < ERM.riskRegister.categories.length; catIdx++) {
          var cat = ERM.riskRegister.categories[catIdx];
          availableCategories.push(cat.label || cat.value);
        }
      }

      prompt = "You are a senior enterprise risk management expert in the " + (context.industry || "general") + " industry.\n\n" +
        "TASK: Suggest the most appropriate risk category for this risk.\n\n" +
        "RISK CONTEXT:\n" + contextStr + "\n\n" +
        "AVAILABLE CATEGORIES:\n" + availableCategories.join("\n") + "\n\n" +
        "INSTRUCTIONS:\n" +
        "1. Analyze the risk title and any available description\n" +
        "2. Choose the 3-4 MOST RELEVANT categories from the list above\n" +
        "3. The first suggestion should be your strongest recommendation\n" +
        "4. Each category MUST exactly match one from the available list\n" +
        "5. Provide a brief reason why each category fits\n\n" +
        "Respond with ONLY valid JSON:\n" +
        '{"suggestions": [{"category": "Operational", "reason": "This risk relates to day-to-day operations"}, {"category": "Financial", "reason": "..."}, {"category": "Strategic", "reason": "..."}], "recommended": 0}';
      break;

    case "residualImpact":
      // Build RESIDUAL context - INCLUDE full control details
      var residualImpContext = [];
      if (context.industry) residualImpContext.push("Industry: " + context.industry);
      if (context.title) residualImpContext.push("Risk Title: " + context.title);
      if (context.description) residualImpContext.push("Description: " + context.description);
      if (context.category) residualImpContext.push("Category: " + context.category);
      if (context.rootCauses && context.rootCauses.length > 0) {
        residualImpContext.push("Root Causes: " + context.rootCauses.join("; "));
      }
      if (context.consequences && context.consequences.length > 0) {
        residualImpContext.push("Potential Consequences: " + context.consequences.join("; "));
      }
      if (context.inherentImpact) {
        residualImpContext.push("INHERENT Impact Score: " + context.inherentImpact + " (baseline before controls)");
      }

      // Add FULL control details
      var controlDetailsImp = "";
      var controlNamesImp = [];
      if (context.linkedControls && context.linkedControls.length > 0) {
        controlDetailsImp = "\n\nLINKED CONTROLS (" + context.linkedControls.length + " controls in place):\n";
        for (var j = 0; j < context.linkedControls.length; j++) {
          var ctrlImp = context.linkedControls[j];
          controlNamesImp.push(ctrlImp.name);
          controlDetailsImp += "\n" + (j + 1) + ". " + ctrlImp.name;
          if (ctrlImp.description) controlDetailsImp += "\n   Description: " + ctrlImp.description;
          controlDetailsImp += "\n   Type: " + ctrlImp.type + " | Effectiveness: " + ctrlImp.effectiveness + " | Status: " + ctrlImp.status;
        }
      } else {
        controlDetailsImp = "\n\nNO CONTROLS LINKED - residual impact = inherent impact (no reduction possible)";
      }
      var residualImpStr = residualImpContext.join("\n") + controlDetailsImp;

      prompt = "You are a senior risk management expert in the " + (context.industry || "general") + " industry.\n\n" +
        "TASK: Assess the RESIDUAL IMPACT of '" + (context.title || "this risk") + "' AFTER considering the linked controls.\n\n" +
        "RISK AND CONTROL CONTEXT:\n" + residualImpStr + "\n\n" +
        "INHERENT IMPACT WAS: " + (context.inherentImpact || "not set") + "\n" +
        "CONSEQUENCES TO MITIGATE: " + (context.consequences ? context.consequences.join("; ") : "none listed") + "\n\n" +
        "IMPACT SCALE:\n" +
        "1 - Negligible (<$10K) - Controls significantly reduce impact\n" +
        "2 - Minor ($10K-$100K) - Controls effectively reduce impact\n" +
        "3 - Moderate ($100K-$1M) - Controls provide moderate reduction\n" +
        "4 - Major ($1M-$10M) - Controls have limited effect\n" +
        "5 - Catastrophic (>$10M) - Controls don't reduce impact\n\n" +
        "CRITICAL INSTRUCTIONS:\n" +
        "1. Residual MUST be EQUAL TO OR LOWER than inherent (" + (context.inherentImpact || "not set") + ")\n" +
        "2. If NO CONTROLS are linked, residual = inherent (no reduction possible)\n" +
        "3. Your justification MUST name the SPECIFIC controls: " + (controlNamesImp.length > 0 ? controlNamesImp.join(", ") : "NONE") + "\n" +
        "4. Explain HOW these controls reduce the IMPACT of '" + (context.title || "this risk") + "'\n" +
        "5. Corrective/detective controls reduce impact; preventive controls reduce likelihood\n\n" +
        "Respond with ONLY valid JSON (exactly 4 suggestions, scores 1-5 as integers):\n" +
        '{"suggestions": [{"score": 2, "reason": "With Backup Systems, impact of System Outage reduces to 2 because recovery time drops from days to hours"}, {"score": 3, "reason": "Score 3 if..."}, {"score": 1, "reason": "Score 1 if..."}, {"score": 4, "reason": "Score 4 if..."}], "recommended": 0}\n\n' +
        "Put your BEST score first. Replace examples with THIS risk and ITS controls.";
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
ERM.riskAI.deepSeek.parseResponse = function(responseText, fieldType) {
  try {
    // Try to extract JSON from the response
    var jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log("[DeepSeek Suggestions] No JSON found in response");
      return null;
    }

    var parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
      console.log("[DeepSeek Suggestions] Invalid suggestions format");
      return null;
    }

    // Return structured result
    return {
      suggestions: parsed.suggestions,
      recommended: typeof parsed.recommended === "number" ? parsed.recommended : 0
    };
  } catch (e) {
    console.error("[DeepSeek Suggestions] Parse error:", e);
    return null;
  }
};

/**
 * Called when user accepts a suggestion (clicks "Use" button)
 * Note: AI counter is now incremented when API call is made, not when suggestion is used.
 * This function is kept for backwards compatibility and any future logging needs.
 */
ERM.riskAI.deepSeek.onSuggestionUsed = function() {
  // AI counter is now incremented at API call time in getSuggestions()
  // This prevents counting multiple times when user selects multiple suggestions
  // from the same API response
  console.log("[DeepSeek Suggestions] Suggestion used (no counter increment - counted at API call)");
  return null;
};

console.log("risk-ai-deepseek-suggestions.js loaded successfully");

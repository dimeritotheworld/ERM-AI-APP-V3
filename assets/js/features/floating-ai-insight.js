/**
 * Dimeri ERM - Floating AI Chat Module
 * Context-aware AI chat for Dashboard, Risk Register, and Controls
 *
 * BEHAVIOR:
 * - Only appears on Dashboard, Risk Register, and Controls pages
 * - Never appears inside data-entry forms
 * - Chat interface with message history
 * - Suggested prompt questions to help users engage
 * - Maximum 5 sentences per response, prefer 3-4
 * - Never exceed 120 words per response
 * - Connects to DeepSeek API
 *
 * @version 2.0.0
 * ES5 Compatible
 */

console.log("Loading floating-ai-insight.js...");

var ERM = window.ERM || {};
ERM.floatingAI = ERM.floatingAI || {};

/* ========================================
   STATE
   ======================================== */
ERM.floatingAI.state = {
  isVisible: false,
  isProcessing: false,
  isExpanded: false,
  currentContext: null,
  messages: [], // Chat history
  apiKey: null
};

/* ========================================
   CONFIGURATION
   ======================================== */
ERM.floatingAI.config = {
  apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat',
  maxTokens: 200, // Enough for 5 sentences / 120 words
  temperature: 0.7,
  allowedViews: ['dashboard', 'risk-register', 'controls', 'reports'],
  blockedViews: ['settings', 'help', 'upgrade', 'checkout']
};

/* ========================================
   SUGGESTED PROMPTS PER VIEW
   ======================================== */
ERM.floatingAI.suggestedPrompts = {
  dashboard: [
    "What patterns do you see in my risk distribution?",
    "How effective are my controls overall?",
    "Which risk areas need the most attention?"
  ],
  'risk-register-list': [
    "How mature is my risk register coverage?",
    "Are there any gaps in my risk categories?",
    "What does the distribution tell you?"
  ],
  'risk-register-detail': [
    "Are my risk scores consistent?",
    "Which risks lack adequate controls?",
    "What scoring patterns do you notice?"
  ],
  'risk-detail': [
    "Is the residual score reduction reasonable?",
    "Are the linked controls appropriate?",
    "What does the score movement indicate?"
  ],
  controls: [
    "Is my control mix balanced?",
    "Which controls may need attention?",
    "Are there coverage gaps I should address?"
  ],
  reports: [
    "What key points should I highlight in my report?",
    "How can I improve the executive summary?",
    "What trends should I mention to stakeholders?"
  ],
  'report-editor': [
    "Help me write an executive summary for this report",
    "What key risks should I highlight?",
    "How can I make this section clearer?"
  ]
};

/* ========================================
   SYSTEM PROMPT (STRICT RULES + INDUSTRY EXPERTISE)
   ======================================== */
ERM.floatingAI.systemPrompt = [
  "You are an ERM (Enterprise Risk Management) expert with deep knowledge of ISO 31000 and COSO frameworks, combined with 25+ years operational experience across multiple industries.",
  "",
  "YOUR ERM FRAMEWORK EXPERTISE:",
  "",
  "RISK IDENTIFICATION & ASSESSMENT:",
  "- Risk sources: internal vs external, strategic vs operational vs financial vs compliance",
  "- Root cause analysis: the 5 Whys, fishbone diagrams, fault tree analysis",
  "- Risk scoring: likelihood x consequence matrices (5x5), inherent vs residual risk, velocity and proximity",
  "- SCORING RULES for 5x5 matrix: Low (score 1-4), Medium (score 5-9), High (score 10-14), Critical (score 15-25)",
  "- Risk appetite and tolerance: setting thresholds, escalation triggers, risk capacity",
  "",
  "CONTROLS & TREATMENT:",
  "- Control types: preventive vs detective vs corrective, manual vs automated",
  "- Control effectiveness: design effectiveness vs operating effectiveness",
  "- Treatment options: avoid, reduce, transfer, accept - and when each applies",
  "- Control ownership: first line (business), second line (risk/compliance), third line (audit)",
  "",
  "RISK GOVERNANCE:",
  "- Three lines model: operational management, risk oversight, independent assurance",
  "- Risk ownership: who owns vs who manages vs who monitors",
  "- Reporting: risk registers, heat maps, key risk indicators (KRIs), trend analysis",
  "- Risk culture: tone from the top, risk awareness, incident reporting culture",
  "",
  "YOUR INDUSTRY KNOWLEDGE (apply ERM principles to these sectors):",
  "",
  "FINANCIAL SERVICES: Credit risk, market risk, liquidity risk, operational risk, fraud, concentration risk, counterparty exposure, settlement failures, segregation of duties",
  "",
  "HEALTHCARE: Patient safety, medication errors, infection control, clinical handovers, equipment failures, staffing risks, diagnostic errors, documentation gaps",
  "",
  "TECHNOLOGY: Cyber threats, data breaches, system outages, vendor dependencies, access control, backup failures, change management, incident response",
  "",
  "MANUFACTURING: Quality defects, equipment failures, supply chain disruption, workplace safety, hazardous materials, maintenance backlogs, process deviations",
  "",
  "OIL & GAS / ENERGY: Process safety, HSE incidents, spills and releases, equipment integrity, permit-to-work, contractor management, emergency response",
  "",
  "CONSTRUCTION: Project delays, cost overruns, site safety, contractor defaults, design changes, weather impacts, subcontractor performance",
  "",
  "RETAIL: Inventory shrinkage, supply chain disruption, customer data protection, fraud, demand volatility, loss prevention",
  "",
  "TRANSPORTATION: Fleet safety, driver fatigue, cargo damage/theft, route disruptions, maintenance failures, fuel volatility",
  "",
  "TELECOMMUNICATIONS/UTILITIES: Network outages, infrastructure failures, capacity constraints, service interruptions, cyber attacks on critical systems",
  "",
  "PROFESSIONAL SERVICES: Delivery failures, scope creep, confidentiality breaches, conflicts of interest, resource constraints, client disputes",
  "",
  "HOW TO RESPOND:",
  "",
  "WHEN USER ASKS ABOUT A RISK CONCEPT (like 'what is residual risk' or 'what are preventive controls'):",
  "- Explain using ERM/ISO 31000/COSO terminology and concepts",
  "- Describe how it applies in practice with examples",
  "- Connect to their specific data if relevant",
  "",
  "WHEN USER ASKS ABOUT AN INDUSTRY RISK (like 'what is credit risk' or 'what is hazardous waste'):",
  "- Explain the risk operationally - what can go wrong, typical root causes, consequences",
  "- Discuss what controls typically mitigate this risk",
  "- Explain ownership patterns - who typically owns, manages, and monitors this risk",
  "- Connect to their specific risk data if they have related risks",
  "",
  "WHEN USER ASKS ABOUT THEIR DATA:",
  "- Analyze their risks and controls using ERM principles",
  "- Comment on: risk scoring consistency, control coverage, ownership clarity, root cause quality",
  "- Reference their actual risk titles and control names",
  "",
  "STRICT RULES:",
  "",
  "1. BE AN ERM EXPERT EXPLAINING KNOWLEDGE - never an advisor giving instructions",
  "   - GOOD: 'Residual risk represents what remains after controls are applied - your risk shows a reduction from inherent score of X to residual of Y...'",
  "   - GOOD: 'Hazardous material risks typically involve storage, handling, and disposal - common root causes include training gaps and container integrity...'",
  "   - BAD: 'You should implement better controls...'",
  "   - NEVER say: 'you should', 'consider', 'implement', 'ensure', 'recommend', 'I suggest'",
  "   - NEVER cite specific laws, regulations, or legal requirements (these vary by country)",
  "",
  "2. NUMBERS:",
  "   - ONLY use numbers from their data - never invent statistics or external benchmarks",
  "",
  "3. FORMAT:",
  "   - Maximum 5 sentences, prefer 3-4",
  "   - Never exceed 120 words",
  "   - No headings, bullets, lists, markdown, or emojis",
  "   - Sound like a knowledgeable ERM colleague, not a consultant"
].join("\n");

/* ========================================
   ICONS
   ======================================== */
ERM.floatingAI.icons = {
  sparkle: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
  clear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>'
};

/* ========================================
   INITIALIZE
   ======================================== */
ERM.floatingAI.init = function() {
  var self = this;

  this.loadApiKey();
  this.createFloatingUI();
  this.loadSessionMessages(); // Load persisted session

  window.addEventListener('hashchange', function() {
    self.onViewChange();
  });

  setTimeout(function() {
    self.onViewChange();
  }, 500);

  console.log('Floating AI Chat initialized');
};

/* ========================================
   LOAD API KEY
   ======================================== */
ERM.floatingAI.loadApiKey = function() {
  var settings = ERM.storage ? ERM.storage.get('settings') : null;
  if (settings && settings.deepseekApiKey) {
    this.state.apiKey = settings.deepseekApiKey;
    return;
  }
  this.state.apiKey = 'sk-831509d82fa54fdeaa2e835e0a62f8b2';
};

/* ========================================
   LOAD SESSION MESSAGES
   Load persisted chat history from session manager
   ======================================== */
ERM.floatingAI.loadSessionMessages = function() {
  if (!ERM.aiSessionManager) {
    console.log('[FloatingAI] Session manager not available');
    return;
  }

  var messages = ERM.aiSessionManager.getMessages();
  this.state.messages = messages;

  console.log('[FloatingAI] Loaded', messages.length, 'messages from session');
};

/* ========================================
   CREATE FLOATING UI
   ======================================== */
ERM.floatingAI.createFloatingUI = function() {
  var self = this;

  var existing = document.getElementById('floating-ai-container');
  if (existing) existing.remove();

  var container = document.createElement('div');
  container.id = 'floating-ai-container';
  container.className = 'floating-ai-container';
  container.style.display = 'none';

  // Get AI counter text (positive framing - shows remaining)
  var counterText = ERM.aiCounter ? ERM.aiCounter.getDisplayText() : '50 left';

  container.innerHTML =
    '<button id="floating-ai-btn" class="floating-ai-btn" type="button" title="AI Assistant">' +
      '<span class="floating-ai-icon">' + this.icons.sparkle + '</span>' +
      '<span class="floating-ai-label">AI</span>' +
      '<span class="floating-ai-counter" id="floating-ai-counter">' + counterText + '</span>' +
      '<span class="floating-ai-spinner"></span>' +
    '</button>' +
    '<div id="floating-ai-panel" class="floating-ai-panel">' +
      '<div class="floating-ai-header">' +
        '<span class="floating-ai-title">' +
          '<span class="floating-ai-title-icon">' + this.icons.sparkle + '</span>' +
          'AI Assistant' +
          '<span class="floating-ai-header-counter" id="floating-ai-header-counter">' + counterText + '</span>' +
        '</span>' +
        '<div class="floating-ai-actions">' +
          '<button class="floating-ai-action-btn" id="floating-ai-clear" title="Clear chat">' +
            this.icons.clear +
          '</button>' +
          '<button class="floating-ai-action-btn" id="floating-ai-close" title="Close">' +
            this.icons.close +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="floating-ai-context" id="floating-ai-context"></div>' +
      '<div class="floating-ai-messages" id="floating-ai-messages"></div>' +
      '<div class="floating-ai-suggestions" id="floating-ai-suggestions"></div>' +
      '<div class="floating-ai-input-container">' +
        '<input type="text" id="floating-ai-input" class="floating-ai-input" placeholder="Ask about your risk data..." />' +
        '<button id="floating-ai-send" class="floating-ai-send-btn" type="button" title="Send">' +
          this.icons.send +
        '</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(container);

  // Event listeners
  var btn = document.getElementById('floating-ai-btn');
  var closeBtn = document.getElementById('floating-ai-close');
  var clearBtn = document.getElementById('floating-ai-clear');
  var sendBtn = document.getElementById('floating-ai-send');
  var input = document.getElementById('floating-ai-input');

  btn.addEventListener('click', function() {
    self.togglePanel();
  });

  closeBtn.addEventListener('click', function() {
    self.closePanel();
  });

  clearBtn.addEventListener('click', function() {
    self.clearChat();
  });

  sendBtn.addEventListener('click', function() {
    self.sendMessage();
  });

  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      self.sendMessage();
    }
  });

  // Close on outside click
  document.addEventListener('click', function(e) {
    var panel = document.getElementById('floating-ai-panel');
    var container = document.getElementById('floating-ai-container');
    if (panel && panel.classList.contains('active') &&
        !container.contains(e.target)) {
      self.closePanel();
    }
  });
};

/* ========================================
   VIEW CHANGE HANDLER
   ======================================== */
ERM.floatingAI.onViewChange = function() {
  var context = this.detectContext();
  this.state.currentContext = context;

  // Notify session manager of view change
  if (ERM.aiSessionManager) {
    var viewChange = ERM.aiSessionManager.onViewChange(context);
    if (viewChange.viewChanged) {
      console.log('[FloatingAI] Module changed:', viewChange.oldView, '→', viewChange.newView);
      // Chat persists across module switches - no need to clear messages
    }
  }

  var contextEl = document.getElementById('floating-ai-context');
  if (contextEl) {
    contextEl.textContent = this.getContextLabel(context);
  }

  if (this.shouldShow(context)) {
    this.show();
    this.updateSuggestedPrompts();
  } else {
    this.hide();
  }
};

/* ========================================
   DETECT CURRENT CONTEXT
   ======================================== */
ERM.floatingAI.detectContext = function() {
  var hash = window.location.hash || '';
  var view = ERM.state ? ERM.state.currentView : '';

  var formOpen = document.querySelector('.modal-overlay.active .risk-form, .modal-overlay.active #risk-form, .modal-overlay.active .control-form, .modal-overlay.active #control-form');
  if (formOpen) {
    return 'form-open';
  }

  if (hash === '' || hash === '#' || hash === '#dashboard' || view === 'dashboard') {
    return 'dashboard';
  }

  if (hash.indexOf('#risk-register') === 0 || view === 'risk-register') {
    if (document.querySelector('.risk-detail-view, .risk-detail-modal')) {
      return 'risk-detail';
    }
    if (document.querySelector('.register-detail-view, .risk-table')) {
      return 'risk-register-detail';
    }
    return 'risk-register-list';
  }

  if (hash.indexOf('#controls') === 0 || view === 'controls') {
    return 'controls';
  }

  if (hash.indexOf('#reports') === 0 || view === 'reports') {
    // Check if we're inside the report editor
    // Look for editor-v2-container ID or editor-v2 class
    if (document.getElementById('editor-v2-container') || document.querySelector('.editor-v2')) {
      return 'report-editor';
    }
    return 'reports-list';
  }

  if (hash.indexOf('#settings') === 0 || view === 'settings') {
    return 'settings';
  }
  if (hash.indexOf('#help') === 0 || view === 'help') {
    return 'help';
  }

  return 'unknown';
};

/* ========================================
   GET CONTEXT LABEL
   ======================================== */
ERM.floatingAI.getContextLabel = function(context) {
  var labels = {
    'dashboard': 'Dashboard',
    'risk-register-list': 'Risk Registers',
    'risk-register-detail': 'Risk Register',
    'risk-detail': 'Risk Details',
    'controls': 'Controls',
    'reports-list': 'Reports',
    'report-editor': 'Report Editor'
  };
  return labels[context] || 'Current View';
};

/* ========================================
   SHOULD SHOW
   ======================================== */
ERM.floatingAI.shouldShow = function(context) {
  if (context === 'form-open') return false;
  var blocked = ['settings', 'help', 'upgrade', 'checkout', 'unknown'];
  if (blocked.indexOf(context) !== -1) return false;
  var allowed = ['dashboard', 'risk-register-list', 'risk-register-detail', 'risk-detail', 'controls', 'reports-list', 'report-editor'];
  return allowed.indexOf(context) !== -1;
};

/* ========================================
   SHOW/HIDE
   ======================================== */
ERM.floatingAI.show = function() {
  var container = document.getElementById('floating-ai-container');
  if (container) {
    container.style.display = 'block';
    this.state.isVisible = true;
  }
};

ERM.floatingAI.hide = function() {
  var container = document.getElementById('floating-ai-container');
  if (container) {
    container.style.display = 'none';
    this.state.isVisible = false;
    this.closePanel();
  }
};

/* ========================================
   TOGGLE/CLOSE PANEL
   ======================================== */
ERM.floatingAI.togglePanel = function() {
  var panel = document.getElementById('floating-ai-panel');
  if (panel) {
    var isActive = panel.classList.contains('active');
    if (isActive) {
      this.closePanel();
    } else {
      panel.classList.add('active');
      this.state.isExpanded = true;
      this.renderMessages();
      this.updateSuggestedPrompts();
      // Focus input
      var input = document.getElementById('floating-ai-input');
      if (input) setTimeout(function() { input.focus(); }, 100);
    }
  }
};

ERM.floatingAI.closePanel = function() {
  var panel = document.getElementById('floating-ai-panel');
  if (panel) {
    panel.classList.remove('active');
    this.state.isExpanded = false;
  }
};

/* ========================================
   UPDATE SUGGESTED PROMPTS
   ======================================== */
ERM.floatingAI.updateSuggestedPrompts = function() {
  var self = this;
  var suggestionsEl = document.getElementById('floating-ai-suggestions');
  if (!suggestionsEl) return;

  // Only show suggestions if no messages yet
  if (this.state.messages.length > 0) {
    suggestionsEl.style.display = 'none';
    return;
  }

  var context = this.state.currentContext || 'dashboard';
  // Map context to prompt key (reports-list -> reports)
  var promptKey = context;
  if (context === 'reports-list') {
    promptKey = 'reports';
  }
  var prompts = this.suggestedPrompts[promptKey] || this.suggestedPrompts.dashboard;

  var html = '<div class="floating-ai-suggestions-label">Try asking:</div>';
  for (var i = 0; i < prompts.length; i++) {
    html += '<button class="floating-ai-suggestion-btn" data-prompt="' + this.escapeAttr(prompts[i]) + '">' + this.escapeHtml(prompts[i]) + '</button>';
  }

  suggestionsEl.innerHTML = html;
  suggestionsEl.style.display = 'block';

  // Add click handlers
  var buttons = suggestionsEl.querySelectorAll('.floating-ai-suggestion-btn');
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].addEventListener('click', function() {
      var prompt = this.getAttribute('data-prompt');
      var input = document.getElementById('floating-ai-input');
      if (input) {
        input.value = prompt;
        self.sendMessage();
      }
    });
  }
};

/* ========================================
   SEND MESSAGE
   ======================================== */
ERM.floatingAI.sendMessage = function() {
  var input = document.getElementById('floating-ai-input');
  if (!input) return;

  var message = input.value.trim();
  if (!message || this.state.isProcessing) return;

  // Add user message to session
  if (ERM.aiSessionManager) {
    ERM.aiSessionManager.addMessage('user', message);
    this.state.messages = ERM.aiSessionManager.getMessages();
  } else {
    // Fallback if session manager not available
    this.state.messages.push({
      role: 'user',
      content: message
    });
  }

  input.value = '';
  this.renderMessages();
  this.hideSuggestions();

  // Generate AI response
  this.generateResponse(message);
};

/* ========================================
   GENERATE AI RESPONSE
   ======================================== */
ERM.floatingAI.generateResponse = function(userMessage) {
  var self = this;

  if (this.state.isProcessing) return;

  // Check AI call limit
  if (ERM.aiCounter) {
    var canCall = ERM.aiCounter.canMakeCall();
    if (!canCall.allowed) {
      this.addAIMessage(canCall.message + ' ' + canCall.upgradeMessage);
      ERM.aiCounter.showLimitModal();
      return;
    }
  }

  this.state.isProcessing = true;
  this.showTypingIndicator();

  // Smart context management via session manager
  var contextData;
  var shouldSendFullContext = true;

  if (ERM.aiSessionManager) {
    shouldSendFullContext = ERM.aiSessionManager.shouldSendFullContext();
    if (shouldSendFullContext) {
      console.log('[FloatingAI] Sending FULL context (first message of session)');
      contextData = this.gatherAllData();
      ERM.aiSessionManager.markContextSent();
    } else {
      console.log('[FloatingAI] Skipping full context (already sent in this session)');
      contextData = ''; // No context needed - AI already has it from earlier in conversation
    }
  } else {
    // Fallback - always send full context
    contextData = this.gatherAllData();
  }

  var fullPrompt = this.buildFullPrompt(userMessage, contextData);

  // DEBUG: Log what we're sending
  console.log('[FloatingAI DEBUG] Sending prompt with context length:', contextData.length);
  console.log('[FloatingAI DEBUG] User question:', userMessage);
  console.log('[FloatingAI DEBUG] Full prompt (first 500 chars):', fullPrompt.substring(0, 500));

  if (!this.state.apiKey) {
    this.addAIMessage("I need an API key to respond. Please configure the DeepSeek API key in settings.");
    this.state.isProcessing = false;
    this.hideTypingIndicator();
    return;
  }

  this.callDeepSeekAPI(this.systemPrompt, fullPrompt)
    .then(function(response) {
      // Increment AI counter on successful response
      if (ERM.aiCounter) {
        ERM.aiCounter.increment();
        ERM.aiCounter.updateDisplays();
      }
      self.addAIMessage(response);
    })
    .catch(function(error) {
      console.error('AI error:', error);
      var errorMsg = error.message || 'Unknown error';
      if (errorMsg.indexOf('proxy') !== -1 || errorMsg.indexOf('Network') !== -1) {
        self.addAIMessage("I'm unable to connect right now. Please ensure the server is running.");
      } else {
        self.addAIMessage("I encountered an issue processing your request. Please try again.");
      }
    })
    .finally(function() {
      self.state.isProcessing = false;
      self.hideTypingIndicator();
    });
};

/* ========================================
   BUILD FULL PROMPT WITH CONTEXT
   ======================================== */
ERM.floatingAI.buildFullPrompt = function(userMessage, contextData) {
  var prompt = "USER'S ERM DATA CONTEXT:\n" + contextData + "\n\n";
  prompt += "USER QUESTION: " + userMessage + "\n\n";
  prompt += "RESPONSE REQUIREMENTS:\n";
  prompt += "- FOCUS ONLY ON THE SPECIFIC QUESTION - do not provide extra information they didn't ask for\n";
  prompt += "- If they ask about root causes, ONLY discuss root causes\n";
  prompt += "- If they ask about controls, ONLY discuss controls\n";
  prompt += "- If they ask about a specific risk, ONLY discuss that risk\n";
  prompt += "- 3-4 sentences maximum (never exceed 5 sentences or 120 words)\n";
  prompt += "- ONLY use numbers from their data above - never invent statistics\n";
  prompt += "- NEVER cite specific laws or regulations (they vary by country)\n";
  prompt += "- NEVER recommend, suggest, or tell them what to do\n";
  prompt += "- Reference their actual risk/control names from the data above";
  return prompt;
};

/* ========================================
   GATHER ALL DATA - FULL DETAILS
   Includes titles, descriptions, root causes, etc.
   ======================================== */
ERM.floatingAI.gatherAllData = function() {
  var data = [];
  var risks = ERM.storage ? ERM.storage.get('risks') || [] : [];
  var controls = ERM.storage ? ERM.storage.get('controls') || [] : [];
  var registers = ERM.storage ? ERM.storage.get('registers') || [] : [];

  // DEBUG: Log what data we have
  console.log('[FloatingAI DEBUG] Gathering data - Risks:', risks.length, 'Controls:', controls.length);
  if (risks.length > 0) {
    console.log('[FloatingAI DEBUG] First risk sample:', {
      title: risks[0].title,
      inherentScore: risks[0].inherentScore,
      residualScore: risks[0].residualScore,
      category: risks[0].category
    });
  }

  // ===== DETAILED RISKS =====
  data.push("===== YOUR RISKS (" + risks.length + " total) =====");

  for (var i = 0; i < risks.length; i++) {
    var risk = risks[i];
    var riskNum = i + 1;

    // Calculate scores and check controls FIRST so we can show prominent warning
    var inherent = risk.inherentScore;
    if (!inherent && (risk.inherentLikelihood || risk.inherentImpact)) {
      inherent = (risk.inherentLikelihood || 0) * (risk.inherentImpact || 0);
    }
    inherent = inherent || 0;

    var residual = risk.residualScore;
    if (!residual && (risk.residualLikelihood || risk.residualImpact)) {
      residual = (risk.residualLikelihood || 0) * (risk.residualImpact || 0);
    }
    residual = residual || inherent;

    var hasControls = risk.linkedControls && risk.linkedControls.length > 0;
    var controlsApplied = hasControls ? risk.linkedControls.length : 0;

    // Start risk entry
    data.push("\nRISK #" + riskNum + ": " + (risk.title || 'Untitled'));

    // PROMINENT WARNING if no controls linked
    if (!hasControls) {
      data.push("  ⚠️ CONTROL STATUS: NO CONTROLS ARE LINKED TO THIS RISK");
    } else {
      data.push("  ✓ CONTROL STATUS: " + controlsApplied + " control(s) are linked and applied to this risk");
    }

    if (risk.description) data.push("  Description: " + risk.description);
    if (risk.category) data.push("  Category: " + risk.category);
    if (risk.rootCause) data.push("  Root Cause: " + risk.rootCause);
    if (risk.impact) data.push("  Impact: " + risk.impact);
    if (risk.owner) data.push("  Owner: " + risk.owner);

    // Risk level based on 5x5 matrix: Low (1-4), Medium (5-9), High (10-14), Critical (15-25)
    var riskLevel = residual >= 15 ? 'CRITICAL' : residual >= 10 ? 'HIGH' : residual >= 5 ? 'MEDIUM' : 'LOW';

    data.push("  Inherent Risk: " + (risk.inherentLikelihood || '?') + "×" + (risk.inherentImpact || '?') + "=" + inherent);
    data.push("  Residual Risk: " + (risk.residualLikelihood || '?') + "×" + (risk.residualImpact || '?') + "=" + residual + " (" + riskLevel + ")");

    if (inherent > 0 && residual < inherent) {
      var reduction = Math.round((1 - residual / inherent) * 100);
      if (hasControls) {
        data.push("  Risk Reduction: " + reduction + "% (with " + controlsApplied + " control(s) applied)");
      } else {
        data.push("  Risk Reduction: " + reduction + "% (NOTE: No controls linked - residual score may not reflect actual mitigation)");
      }
    } else if (residual === inherent && hasControls) {
      data.push("  Risk Reduction: 0% (controls linked but scores unchanged)");
    } else if (residual === inherent && !hasControls) {
      data.push("  Risk Reduction: None (no controls applied)");
    }

    // Linked controls
    if (hasControls) {
      var linkedCtrlNames = [];
      for (var lc = 0; lc < risk.linkedControls.length; lc++) {
        var ctrlId = risk.linkedControls[lc];
        var ctrl = controls.find(function(c) { return c.id === ctrlId; });
        if (ctrl) linkedCtrlNames.push(ctrl.name || ctrl.reference || 'Unnamed Control');
      }
      if (linkedCtrlNames.length > 0) {
        data.push("  Controls Applied: " + linkedCtrlNames.join(", "));
      }
    } else {
      data.push("  Controls Applied: NONE - This risk has no linked controls");
    }

    // Additional fields
    if (risk.likelihood) data.push("  Likelihood: " + risk.likelihood);
    if (risk.consequence) data.push("  Consequence: " + risk.consequence);
    if (risk.treatmentPlan) data.push("  Treatment Plan: " + risk.treatmentPlan);
    if (risk.status) data.push("  Status: " + risk.status);
  }

  // ===== DETAILED CONTROLS =====
  data.push("\n\n===== YOUR CONTROLS (" + controls.length + " total) =====");

  for (var j = 0; j < controls.length; j++) {
    var control = controls[j];
    var ctrlNum = j + 1;

    data.push("\nCONTROL #" + ctrlNum + ": " + (control.name || control.reference || 'Untitled'));
    if (control.description) data.push("  Description: " + control.description);
    if (control.type) data.push("  Type: " + control.type);
    if (control.effectiveness) data.push("  Effectiveness: " + control.effectiveness);
    if (control.owner) data.push("  Owner: " + control.owner);
    if (control.frequency) data.push("  Frequency: " + control.frequency);
    if (control.status) data.push("  Status: " + control.status);

    // Linked risks
    if (control.linkedRisks && control.linkedRisks.length > 0) {
      var linkedRiskNames = [];
      for (var lr = 0; lr < control.linkedRisks.length; lr++) {
        var riskId = control.linkedRisks[lr];
        var linkedRisk = risks.find(function(r) { return r.id === riskId; });
        if (linkedRisk) linkedRiskNames.push(linkedRisk.title || 'Unnamed Risk');
      }
      if (linkedRiskNames.length > 0) {
        data.push("  Mitigates Risks: " + linkedRiskNames.join(", "));
      }
    } else {
      data.push("  Mitigates Risks: NONE (orphan control)");
    }

    // Additional fields
    if (control.testingProcedure) data.push("  Testing Procedure: " + control.testingProcedure);
    if (control.lastTestDate) data.push("  Last Tested: " + control.lastTestDate);
    if (control.notes) data.push("  Notes: " + control.notes);
  }

  // ===== REGISTERS =====
  if (registers.length > 0) {
    data.push("\n\n===== RISK REGISTERS (" + registers.length + ") =====");
    for (var k = 0; k < registers.length; k++) {
      var reg = registers[k];
      data.push("- " + reg.name + " (" + (reg.riskCount || 0) + " risks)" + (reg.description ? ": " + reg.description : ""));
    }
  }

  // ===== SUMMARY STATS =====
  data.push("\n\n===== SUMMARY =====");
  data.push("RISK SCORING MATRIX (5x5): Low (1-4), Medium (5-9), High (10-14), Critical (15-25)");
  var critical = 0, high = 0, medium = 0, low = 0;
  var totalInherent = 0, totalResidual = 0;
  for (var s = 0; s < risks.length; s++) {
    var score = risks[s].residualScore || risks[s].inherentScore || 0;
    // Apply correct thresholds: Low (1-4), Medium (5-9), High (10-14), Critical (15-25)
    if (score >= 15) critical++;
    else if (score >= 10) high++;
    else if (score >= 5) medium++;
    else low++;
    totalInherent += risks[s].inherentScore || 0;
    totalResidual += risks[s].residualScore || 0;
  }
  data.push("Risk Distribution: " + critical + " Critical, " + high + " High, " + medium + " Medium, " + low + " Low");

  var avgReduction = totalInherent > 0 ? Math.round((1 - totalResidual / totalInherent) * 100) : 0;
  data.push("Average Risk Reduction: " + avgReduction + "%");

  var risksWithControls = risks.filter(function(r) { return r.linkedControls && r.linkedControls.length > 0; }).length;
  data.push("Risks with Controls: " + risksWithControls + "/" + risks.length);

  var orphanControls = controls.filter(function(c) { return !c.linkedRisks || c.linkedRisks.length === 0; }).length;
  if (orphanControls > 0) {
    data.push("Orphan Controls (not linked to any risk): " + orphanControls);
  }

  return data.join("\n");
};

/* ========================================
   ADD AI MESSAGE
   ======================================== */
ERM.floatingAI.addAIMessage = function(content) {
  // Add to session manager for persistence
  if (ERM.aiSessionManager) {
    ERM.aiSessionManager.addMessage('assistant', content);
    this.state.messages = ERM.aiSessionManager.getMessages();
  } else {
    // Fallback if session manager not available
    this.state.messages.push({
      role: 'assistant',
      content: content
    });
  }
  this.renderMessages();
};

/* ========================================
   RENDER MESSAGES
   ======================================== */
ERM.floatingAI.renderMessages = function() {
  var messagesEl = document.getElementById('floating-ai-messages');
  if (!messagesEl) return;

  if (this.state.messages.length === 0) {
    // Hide messages area completely when empty (Notion-style compact)
    messagesEl.innerHTML = '';
    messagesEl.classList.add('empty-state');
    return;
  }

  // Show messages area
  messagesEl.classList.remove('empty-state');

  var html = '';
  for (var i = 0; i < this.state.messages.length; i++) {
    var msg = this.state.messages[i];
    var className = msg.role === 'user' ? 'floating-ai-message-user' : 'floating-ai-message-ai';

    // Use keyword highlighting for AI messages, plain escape for user messages
    var content = msg.role === 'assistant'
      ? this.highlightKeywords(msg.content)
      : this.escapeHtml(msg.content);

    html += '<div class="floating-ai-message ' + className + '">' +
              '<div class="floating-ai-message-content">' + content + '</div>' +
            '</div>';
  }

  messagesEl.innerHTML = html;
  messagesEl.scrollTop = messagesEl.scrollHeight;
};

/* ========================================
   TYPING INDICATOR
   ======================================== */
ERM.floatingAI.showTypingIndicator = function() {
  var messagesEl = document.getElementById('floating-ai-messages');
  if (messagesEl) {
    var indicator = document.createElement('div');
    indicator.id = 'floating-ai-typing';
    indicator.className = 'floating-ai-message floating-ai-message-ai floating-ai-typing';
    indicator.innerHTML = '<div class="floating-ai-typing-dots"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(indicator);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
};

ERM.floatingAI.hideTypingIndicator = function() {
  var indicator = document.getElementById('floating-ai-typing');
  if (indicator) indicator.remove();
};

/* ========================================
   HIDE SUGGESTIONS
   ======================================== */
ERM.floatingAI.hideSuggestions = function() {
  var suggestionsEl = document.getElementById('floating-ai-suggestions');
  if (suggestionsEl) {
    suggestionsEl.style.display = 'none';
  }
};

/* ========================================
   CLEAR CHAT
   ======================================== */
ERM.floatingAI.clearChat = function() {
  // Clear session manager
  if (ERM.aiSessionManager) {
    ERM.aiSessionManager.clearSession();
    this.state.messages = [];
  } else {
    this.state.messages = [];
  }
  this.renderMessages();
  this.updateSuggestedPrompts();
  console.log('[FloatingAI] Chat cleared and new session started');
};

/* ========================================
   CALL DEEPSEEK API
   Tries ERM.aiService.generateText first, then direct API call
   ======================================== */
ERM.floatingAI.callDeepSeekAPI = function(systemPrompt, userPrompt) {
  var self = this;

  return new Promise(function(resolve, reject) {
    // First try ERM.aiService.generateText if available
    if (ERM.aiService && typeof ERM.aiService.generateText === 'function') {
      console.log('[FloatingAI] Using ERM.aiService.generateText');
      ERM.aiService.generateText(
        userPrompt,
        {
          systemPrompt: systemPrompt,
          maxTokens: self.config.maxTokens,
          temperature: self.config.temperature
        },
        function(result) {
          if (result.success && result.text) {
            resolve(result.text.trim());
          } else {
            console.warn('[FloatingAI] aiService failed, trying direct API:', result.error);
            // Fall back to direct API call
            self.callDirectAPI(systemPrompt, userPrompt, resolve, reject);
          }
        }
      );
      return;
    }

    // Fall back to direct API call
    console.log('[FloatingAI] aiService not available, using direct API');
    self.callDirectAPI(systemPrompt, userPrompt, resolve, reject);
  });
};

/* ========================================
   DIRECT API CALL TO DEEPSEEK
   ======================================== */
ERM.floatingAI.callDirectAPI = function(systemPrompt, userPrompt, resolve, reject) {
  var self = this;
  var xhr = new XMLHttpRequest();

  // Try direct DeepSeek API (may fail due to CORS in browser)
  var url = 'https://api.deepseek.com/chat/completions';

  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.apiKey);
  xhr.timeout = 30000; // 30 second timeout

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          var response = JSON.parse(xhr.responseText);
          var text = response.choices && response.choices[0] && response.choices[0].message ?
            response.choices[0].message.content : 'No response generated.';
          resolve(text.trim());
        } catch (e) {
          console.error('[FloatingAI] Parse error:', e);
          reject(new Error('Failed to parse AI response'));
        }
      } else if (xhr.status === 0) {
        // CORS error or network error
        console.error('[FloatingAI] CORS/Network error - status 0');
        reject(new Error('Network error - if running locally, you need a proxy server. Run "npm start" in the server folder.'));
      } else {
        console.error('[FloatingAI] API error:', xhr.status);
        reject(new Error('API request failed: ' + xhr.status));
      }
    }
  };

  xhr.onerror = function() {
    console.error('[FloatingAI] XHR error');
    reject(new Error('Network error - server may not be running or CORS is blocking the request'));
  };

  xhr.ontimeout = function() {
    console.error('[FloatingAI] Request timeout');
    reject(new Error('Request timed out'));
  };

  var payload = {
    model: self.config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: self.config.maxTokens,
    temperature: self.config.temperature
  };

  console.log('[FloatingAI] Sending direct API request to:', url);
  xhr.send(JSON.stringify(payload));
};

/* ========================================
   UTILITY
   ======================================== */
ERM.floatingAI.escapeHtml = function(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

ERM.floatingAI.escapeAttr = function(str) {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

/**
 * Highlight keywords in AI responses
 * Highlights only critical ERM terms and numbers in purple (selective highlighting)
 */
ERM.floatingAI.highlightKeywords = function(text) {
  if (!text) return '';

  // First escape HTML
  text = this.escapeHtml(text);

  // Only highlight the most critical terms (selective approach)
  var keywords = [
    // Severity levels only (most important)
    'critical', 'high', 'medium', 'low',

    // Key risk terms
    'inherent', 'residual'
  ];

  // Highlight numbers (especially scores and percentages) - most important
  text = text.replace(/\b(\d+(?:\.\d+)?%)\b/g, '<span class="ai-number">$1</span>');

  // Highlight keywords (case insensitive, whole words only)
  for (var i = 0; i < keywords.length; i++) {
    var keyword = keywords[i];
    // Escape special regex characters in keyword
    var escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var regex = new RegExp('\\b(' + escapedKeyword + ')\\b', 'gi');
    text = text.replace(regex, '<span class="ai-keyword">$1</span>');
  }

  return text;
};

/* ========================================
   AUTO-INIT
   ======================================== */
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    ERM.floatingAI.init();
  }, 1000);
});

console.log('Floating AI Chat module loaded');

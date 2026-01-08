/**
 * Help & Support Module
 * ES5 Compatible
 */

if (!window.ERM) window.ERM = {};

ERM.help = {

  /**
   * Initialize help page
   */
  init: function() {
    console.log('Initializing Help page...');
    this.render();
    this.bindEvents();
  },

  /**
   * Open the full Help Center in new tab
   */
  openHelpCenter: function() {
    window.open('help/index.html', '_blank');
  },

  /**
   * Render help page content
   */
  render: function() {
    var container = document.getElementById('help-content');
    if (!container) return;

    var html = this.buildHelpBanner() +
               this.buildQuickLinks() +
               this.buildFAQSection() +
               this.buildReportSection() +
               this.buildContactSection() +
               this.buildAboutSection();

    container.innerHTML = html;
  },

  /**
   * Searchable content database
   */
  searchableContent: [
    // Getting Started
    { type: 'guide', icon: '🚀', title: 'Getting Started Guide', action: 'getting-started', keywords: 'start begin first setup welcome introduction new user tutorial' },
    { type: 'guide', icon: '📊', title: 'Risk Register Guide', action: 'risk-register-guide', keywords: 'risk register create add new likelihood impact score inherent residual escalation' },
    { type: 'guide', icon: '🛡️', title: 'Controls Management', action: 'controls-guide', keywords: 'control controls manage preventive detective corrective effectiveness' },
    { type: 'guide', icon: '🔐', title: 'Account & Security', action: 'security-guide', keywords: 'account security privacy settings profile password backup export' },
    // Help Center articles
    { type: 'article', icon: '📚', title: 'Getting Started with ERM', url: 'help/getting-started.html', keywords: 'getting started dashboard navigation first risk' },
    { type: 'article', icon: '⚠️', title: 'Risk Management Guide', url: 'help/risk-management.html', keywords: 'risk management assessment heatmap categories scoring escalation' },
    { type: 'article', icon: '🛡️', title: 'Controls Guide', url: 'help/controls.html', keywords: 'controls effectiveness testing types preventive detective' },
    { type: 'article', icon: '📄', title: 'Reports & Analytics', url: 'help/reports.html', keywords: 'reports analytics export pdf csv dashboard charts' },
    { type: 'article', icon: '🎥', title: 'Video Tutorials', url: 'https://www.youtube.com/@dimeri-placeholder', keywords: 'video tutorials youtube training walkthrough demo' },
    { type: 'article', icon: '💳', title: 'Billing & Subscription', url: 'help/billing.html', keywords: 'billing subscription payment seats pricing plans invoice upgrade downgrade stripe credit card' },
    { type: 'article', icon: '✨', title: 'AI Features', url: 'help/ai-features.html', keywords: 'ai artificial intelligence features limits queries free pro unlimited toolbar dashboard risk register controls reports chat assistant sparkle 50 queries' },
    { type: 'article', icon: '⚙️', title: 'Settings Guide', url: 'help/settings.html', keywords: 'settings preferences notifications theme appearance' },
    // Topics
    { type: 'topic', icon: '➕', title: 'How to create a new risk', action: 'risk-register-guide', keywords: 'create new risk add register' },
    { type: 'topic', icon: '🔗', title: 'How to link controls to risks', action: 'controls-guide', keywords: 'link controls risks connect associate' },
    { type: 'topic', icon: '📤', title: 'How to export data', action: 'security-guide', keywords: 'export data backup download csv pdf json' },
    { type: 'topic', icon: '📄', title: 'How to export risk register as PDF', action: 'risk-register-guide', keywords: 'export pdf risk register download report logo signature fields' },
    { type: 'topic', icon: '✏️', title: 'How to edit reports', action: 'getting-started', keywords: 'edit report wysiwyg editor format text' },
    { type: 'topic', icon: '✨', title: 'Using AI toolbar in reports', action: 'getting-started', keywords: 'ai toolbar reports improve expand summarize generate' },
    { type: 'topic', icon: '📊', title: 'Insert dashboard charts into reports', action: 'getting-started', keywords: 'insert chart dashboard heatmap report graph' },
    { type: 'topic', icon: '📊', title: 'Understanding risk scores', action: 'risk-register-guide', keywords: 'score scoring inherent residual likelihood impact calculation heatmap' },
    { type: 'topic', icon: '✨', title: 'Using AI Chat Assistant', action: 'getting-started', keywords: 'ai chat assistant floating button purple sparkle context question answer' },
    { type: 'topic', icon: '🤖', title: 'Using AI suggestions', action: 'getting-started', keywords: 'ai artificial intelligence suggestions generate auto sparkle' },
    { type: 'topic', icon: '📈', title: 'Reading the dashboard', action: 'getting-started', keywords: 'dashboard heatmap charts graphs analytics overview' },
    { type: 'topic', icon: '🎯', title: 'Situational Overview explained', action: 'getting-started', keywords: 'situational overview dashboard summary snapshot risks controls trend' },
    { type: 'topic', icon: '⚠️', title: 'What Needs Attention explained', action: 'getting-started', keywords: 'what needs attention dashboard weak signals owners controls reviewed' },
    { type: 'topic', icon: '🔄', title: 'Toggle heatmap dots and cells', action: 'getting-started', keywords: 'toggle heatmap dots cells view switch dashboard' },
    { type: 'topic', icon: '📋', title: 'Dashboard side panels', action: 'getting-started', keywords: 'side panel dashboard detail view risk dot cell click' },
    { type: 'topic', icon: '⚡', title: 'Escalating risks', action: 'risk-register-guide', keywords: 'escalation escalate owner level department committee board executive' },
    { type: 'topic', icon: '👤', title: 'Managing your profile', action: 'security-guide', keywords: 'profile account name email role settings' },
    { type: 'topic', icon: '🔔', title: 'Setting up notifications', action: 'security-guide', keywords: 'notifications alerts reminders email notify' }
  ],

  /**
   * Build help banner with link to full Help Center
   */
  buildHelpBanner: function() {
    return '<div class="help-banner">' +
      '<div class="help-banner-content">' +
      '<div class="help-banner-icon">📚</div>' +
      '<div class="help-banner-text">' +
      '<h3>Need comprehensive help?</h3>' +
      '<p>Visit our full Help Center with detailed guides, tutorials, and searchable articles.</p>' +
      '</div>' +
      '<a href="help/index.html" target="_blank" class="btn btn-primary">Open Help Center</a>' +
      '</div>' +
      '</div>' +
      '<div class="help-search">' +
      '<h2>How can we help you?</h2>' +
      '<p>Search our help articles or browse popular topics below</p>' +
      '<div class="help-search-input-wrapper">' +
      '<span class="help-search-icon">🔍</span>' +
      '<input type="text" id="help-search-input" placeholder="Search for help (e.g., \'create risk\', \'export data\', \'controls\')..." />' +
      '</div>' +
      '<div id="help-search-results" class="help-search-results"></div>' +
      '</div>';
  },

  /**
   * Build quick links
   */
  buildQuickLinks: function() {
    var links = [
      { icon: '🚀', text: 'Getting Started Guide', action: 'getting-started' },
      { icon: '📊', text: 'Risk Register Guide', action: 'risk-register-guide' },
      { icon: '🛡️', text: 'Controls Management', action: 'controls-guide' },
      { icon: '🔐', text: 'Account & Security', action: 'security-guide' }
    ];

    var html = '<div class="quick-links">';
    for (var i = 0; i < links.length; i++) {
      html += '<a href="#" class="quick-link" data-action="' + links[i].action + '">' +
        '<div class="quick-link-icon">' + links[i].icon + '</div>' +
        '<span class="quick-link-text">' + links[i].text + '</span>' +
        '</a>';
    }
    html += '</div>';

    return html;
  },

  /**
   * Build FAQ section
   */
  buildFAQSection: function() {
    var faqs = [
      // ========== GETTING STARTED ==========
      {
        question: 'How do I create a new risk register?',
        answer: 'Click on "Risk Register" in the sidebar, then click the "Add New Risk" button. You can choose between "Manual Entry" or "Describe with AI" to create your risk. Fill in the required fields including title, category, likelihood, and impact. The risk form has 5 sections: Risk Identification, Risk Assessment, Action Plan, Escalation, and Evidence & Attachments.'
      },
      {
        question: 'What is the difference between inherent and residual risk?',
        answer: 'Inherent risk is the level of risk before any controls are applied (Likelihood × Impact). Residual risk is the remaining level of risk after controls have been implemented. The dashboard shows the reduction achieved through your risk management efforts. Use the interactive heatmap in the risk form to visualize your risk scores.'
      },

      // ========== AI FEATURES OVERVIEW ==========
      {
        question: 'What AI features are available in Dimeri ERM?',
        answer: '<strong>AI Features by Module:</strong><br><br>' +
          '<strong>🎯 Risk Register AI:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Describe with AI</strong> - Create risks from natural language<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>✨ AI Field Suggestions</strong> - Auto-generate root causes, consequences, treatments<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>✨ Review Risk</strong> - Get comprehensive AI review of your risk<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Smart Risk Scoring</strong> - AI-assisted likelihood/impact assessment<br><br>' +
          '<strong>🛡️ Controls AI:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>✨ Suggest Controls</strong> - AI recommends controls for your risks<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Control Matching</strong> - Auto-link relevant controls to risks<br><br>' +
          '<strong>📄 Reports AI:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>✨ Improve</strong> - Enhance text clarity and wording<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>✨ Expand</strong> - Add more detail to content<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>✨ Summarize</strong> - Condense long sections<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>✨ Generate Section</strong> - Create new content from data<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>✨ Professional Tone</strong> - Formal business language<br><br>' +
          '<strong>💬 AI Chat Assistant:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Context-aware answers about your risks and controls<br>' +
          '&nbsp;&nbsp;&nbsp;• Available via purple ✨ button (bottom-right corner)'
      },

      // ========== RISK REGISTER AI ==========
      {
        question: 'How do I create a risk using AI ("Describe with AI")?',
        answer: '<strong>Steps to create a risk with AI:</strong><br><br>' +
          '<strong>1.</strong> Go to <strong>Risk Register</strong> and click <strong>"Add New Risk"</strong><br>' +
          '<strong>2.</strong> Select <strong>"Describe with AI"</strong> (instead of Manual Entry)<br>' +
          '<strong>3.</strong> Type a natural language description of your risk, e.g.:<br>' +
          '&nbsp;&nbsp;&nbsp;<em>"Our main database server could fail causing data loss"</em><br>' +
          '<strong>4.</strong> Click <strong>"Generate Risk"</strong><br>' +
          '<strong>5.</strong> The AI will automatically populate:<br>' +
          '&nbsp;&nbsp;&nbsp;• Risk title and description<br>' +
          '&nbsp;&nbsp;&nbsp;• Category and department<br>' +
          '&nbsp;&nbsp;&nbsp;• Suggested likelihood and impact scores<br>' +
          '&nbsp;&nbsp;&nbsp;• Root causes and consequences<br>' +
          '&nbsp;&nbsp;&nbsp;• Recommended treatment actions<br>' +
          '<strong>6.</strong> Review and adjust the generated content, then save'
      },
      {
        question: 'How do I use AI suggestions in the Risk Form?',
        answer: '<strong>AI Field Suggestions in Risk Form:</strong><br><br>' +
          'Look for the purple <strong>✨ AI</strong> buttons next to these fields:<br><br>' +
          '<strong>Section 1 - Risk Identification:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>✨ Root Causes</strong> - Generates potential causes based on your risk description<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>✨ Consequences</strong> - Suggests potential impacts if the risk materializes<br><br>' +
          '<strong>Section 3 - Action Plan:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>✨ Treatment Description</strong> - Recommends mitigation strategies<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>✨ Action Items</strong> - Suggests specific action steps<br><br>' +
          '<strong>Bottom of Form:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>✨ Review Risk</strong> - Comprehensive AI review of your entire risk entry<br><br>' +
          '<strong>How to use:</strong> Click any ✨ button, wait for AI to generate content, then accept or modify the suggestion.'
      },
      {
        question: 'What is the "Review Risk" AI feature?',
        answer: '<strong>The ✨ Review Risk Feature:</strong><br><br>' +
          'Located at the bottom of the risk form, this provides a comprehensive AI review:<br><br>' +
          '<strong>What it analyzes:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Completeness of your risk entry<br>' +
          '&nbsp;&nbsp;&nbsp;• Accuracy of likelihood/impact scores<br>' +
          '&nbsp;&nbsp;&nbsp;• Quality of root causes and consequences<br>' +
          '&nbsp;&nbsp;&nbsp;• Adequacy of treatment plans<br>' +
          '&nbsp;&nbsp;&nbsp;• Missing information or gaps<br><br>' +
          '<strong>What you get:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Overall risk assessment summary<br>' +
          '&nbsp;&nbsp;&nbsp;• Specific recommendations for improvement<br>' +
          '&nbsp;&nbsp;&nbsp;• Suggested additional controls to consider<br>' +
          '&nbsp;&nbsp;&nbsp;• Best practice tips for your risk type'
      },

      // ========== CONTROLS AI ==========
      {
        question: 'How do I use AI to suggest controls for my risks?',
        answer: '<strong>AI Control Suggestions:</strong><br><br>' +
          '<strong>Method 1 - From Risk Form:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;1. Open a risk in the Risk Register<br>' +
          '&nbsp;&nbsp;&nbsp;2. Scroll to <strong>"Linked Controls"</strong> section<br>' +
          '&nbsp;&nbsp;&nbsp;3. Click <strong>"✨ Suggest Controls"</strong><br>' +
          '&nbsp;&nbsp;&nbsp;4. AI analyzes your risk and recommends relevant controls<br>' +
          '&nbsp;&nbsp;&nbsp;5. Select controls to link, or create new ones<br><br>' +
          '<strong>Method 2 - From Controls Module:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;1. Go to <strong>Controls</strong> in the sidebar<br>' +
          '&nbsp;&nbsp;&nbsp;2. Click <strong>"Add Control"</strong> → <strong>"AI Suggest"</strong><br>' +
          '&nbsp;&nbsp;&nbsp;3. Select which risk(s) you want controls for<br>' +
          '&nbsp;&nbsp;&nbsp;4. AI generates tailored control recommendations<br><br>' +
          '<strong>AI considers:</strong> Risk category, industry (e.g., mining), severity, existing controls, and best practices.'
      },
      {
        question: 'How do I link controls to risks?',
        answer: 'When editing a risk, scroll to the "Linked Controls" section and check the boxes next to relevant controls. You can also click the "+" button to create a new control directly from the risk form. The AI will suggest relevant controls based on your risk description.'
      },

      // ========== REPORTS AI ==========
      {
        question: 'How do I edit a report in the Reports module?',
        answer: '<strong>Steps to edit a report:</strong><br><br>' +
          '<strong>1.</strong> Click <strong>"Reports"</strong> in the left sidebar<br>' +
          '<strong>2.</strong> Click on any report card to open it<br>' +
          '<strong>3.</strong> The WYSIWYG editor will appear with a toolbar at the top<br>' +
          '<strong>4.</strong> Use the toolbar buttons to format your text:<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>B</strong> - Bold text<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>I</strong> - Italic text<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>H1/H2/H3</strong> - Headings<br>' +
          '&nbsp;&nbsp;&nbsp;• Bullet and numbered lists<br>' +
          '&nbsp;&nbsp;&nbsp;• Blockquotes and links<br>' +
          '<strong>5.</strong> Click <strong>"Save Report"</strong> when done (or changes auto-save)'
      },
      {
        question: 'How do I use the AI toolbar in Reports?',
        answer: '<strong>Report AI Toolbar - Complete Guide:</strong><br><br>' +
          'The purple <strong>✨ AI toolbar</strong> appears at the top of the report editor.<br><br>' +
          '<strong>✨ Improve Button:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Select text you want to enhance<br>' +
          '&nbsp;&nbsp;&nbsp;• Click ✨ Improve<br>' +
          '&nbsp;&nbsp;&nbsp;• AI rewrites with better clarity, grammar, and flow<br>' +
          '&nbsp;&nbsp;&nbsp;• <em>Best for:</em> Polishing rough drafts<br><br>' +
          '<strong>✨ Expand Button:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Select a brief sentence or paragraph<br>' +
          '&nbsp;&nbsp;&nbsp;• Click ✨ Expand<br>' +
          '&nbsp;&nbsp;&nbsp;• AI adds more detail, examples, and depth<br>' +
          '&nbsp;&nbsp;&nbsp;• <em>Best for:</em> Fleshing out thin sections<br><br>' +
          '<strong>✨ Summarize Button:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Select a long section of text<br>' +
          '&nbsp;&nbsp;&nbsp;• Click ✨ Summarize<br>' +
          '&nbsp;&nbsp;&nbsp;• AI condenses into key points<br>' +
          '&nbsp;&nbsp;&nbsp;• <em>Best for:</em> Executive summaries<br><br>' +
          '<strong>✨ Generate Section Button:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Place cursor where you want new content<br>' +
          '&nbsp;&nbsp;&nbsp;• Click ✨ Generate Section<br>' +
          '&nbsp;&nbsp;&nbsp;• Choose section type (Executive Summary, Risk Analysis, etc.)<br>' +
          '&nbsp;&nbsp;&nbsp;• AI creates content using your actual risk/control data<br>' +
          '&nbsp;&nbsp;&nbsp;• <em>Best for:</em> Starting from scratch<br><br>' +
          '<strong>✨ Professional Tone Button:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Select informal or casual text<br>' +
          '&nbsp;&nbsp;&nbsp;• Click ✨ Professional Tone<br>' +
          '&nbsp;&nbsp;&nbsp;• AI rewrites in formal business language<br>' +
          '&nbsp;&nbsp;&nbsp;• <em>Best for:</em> Board/executive presentations'
      },
      {
        question: 'How do I insert dashboard charts into a report?',
        answer: '<strong>Steps to insert charts:</strong><br><br>' +
          '<strong>1.</strong> Open a report in the Reports module<br>' +
          '<strong>2.</strong> Place your cursor where you want the chart<br>' +
          '<strong>3.</strong> Click the <strong>"📊 Insert Chart"</strong> button in the toolbar<br>' +
          '<strong>4.</strong> Select from available chart types:<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Risk Heatmap</strong> - Visual 5x5 matrix of your risks<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Risk by Category</strong> - Bar chart showing risks per category<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Inherent vs Residual</strong> - Comparison chart showing risk reduction<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Control Effectiveness</strong> - Pie chart of control statuses<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Risk Trend</strong> - Line chart showing risk levels over time<br>' +
          '<strong>5.</strong> The chart renders as an image in your report<br><br>' +
          '<strong>Bonus:</strong> Use <strong>"📋 Insert Table"</strong> to add a summary table of your risks!'
      },
      {
        question: 'How do I generate a complete report section with AI?',
        answer: '<strong>Using ✨ Generate Section:</strong><br><br>' +
          '<strong>1.</strong> Open your report in the editor<br>' +
          '<strong>2.</strong> Place your cursor where you want the new section<br>' +
          '<strong>3.</strong> Click <strong>"✨ Generate Section"</strong> in the AI toolbar<br>' +
          '<strong>4.</strong> Choose the section type:<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Executive Summary</strong> - High-level overview for leadership<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Risk Analysis</strong> - Detailed breakdown of key risks<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Control Assessment</strong> - Status of risk controls<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Recommendations</strong> - Suggested next steps<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Methodology</strong> - How risks were assessed<br>' +
          '<strong>5.</strong> AI generates content using your actual data<br>' +
          '<strong>6.</strong> Edit as needed - AI provides a starting point<br><br>' +
          '<strong>Pro Tip:</strong> Generate multiple sections, then use ✨ Improve to polish the final text.'
      },

      // ========== AI CHAT ASSISTANT ==========
      {
        question: 'How does the AI Chat Assistant work?',
        answer: '<strong>AI Chat Assistant - Complete Guide:</strong><br><br>' +
          '<strong>How to access:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Click the purple <strong>✨ AI</strong> button in the bottom-right corner<br>' +
          '&nbsp;&nbsp;&nbsp;• A chat panel opens on the right side<br><br>' +
          '<strong>What it knows:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• All your risks in the Risk Register<br>' +
          '&nbsp;&nbsp;&nbsp;• All your controls<br>' +
          '&nbsp;&nbsp;&nbsp;• Dashboard statistics and trends<br>' +
          '&nbsp;&nbsp;&nbsp;• Your risk categories and departments<br><br>' +
          '<strong>Example questions to ask:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• "What are my top 5 highest risks?"<br>' +
          '&nbsp;&nbsp;&nbsp;• "Which risks don\'t have controls linked?"<br>' +
          '&nbsp;&nbsp;&nbsp;• "Suggest controls for IT security risks"<br>' +
          '&nbsp;&nbsp;&nbsp;• "Summarize my risk profile"<br>' +
          '&nbsp;&nbsp;&nbsp;• "What risks need attention this quarter?"<br>' +
          '&nbsp;&nbsp;&nbsp;• "Help me write an executive summary"<br><br>' +
          '<strong>Tips:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Be specific - mention categories, departments, or risk names<br>' +
          '&nbsp;&nbsp;&nbsp;• Ask follow-up questions to drill deeper<br>' +
          '&nbsp;&nbsp;&nbsp;• Use it to prepare for board presentations'
      },

      // ========== DASHBOARD ==========
      {
        question: 'What is the Situational Overview on the Dashboard?',
        answer: '<strong>Situational Overview - Your Risk Snapshot:</strong><br><br>' +
          'The Situational Overview section at the top of your Dashboard provides a quick summary of your current risk posture:<br><br>' +
          '<strong>What it shows:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Total Risks</strong> - Number of active risks across all registers<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Critical/High Risks</strong> - Count of your most severe risks requiring attention<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Controls</strong> - Total linked controls and their effectiveness<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>Risk Trend</strong> - Whether your overall risk profile is improving or worsening<br><br>' +
          '<strong>Why it matters:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Get an instant health check of your risk management<br>' +
          '&nbsp;&nbsp;&nbsp;• Identify areas needing immediate attention<br>' +
          '&nbsp;&nbsp;&nbsp;• Track progress over time<br>' +
          '&nbsp;&nbsp;&nbsp;• Perfect for executive briefings and board updates'
      },
      {
        question: 'What does "What Needs Attention" mean on the Dashboard?',
        answer: '<strong>What Needs Attention - Weak Signals & Action Items:</strong><br><br>' +
          'This section highlights issues in your risk management that need addressing:<br><br>' +
          '<strong>Possible warnings shown:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>X high risks missing owners</strong> - High/Critical risks without an assigned risk owner<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>X high risks have no controls</strong> - High/Critical risks without any linked controls<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>X other risks have no linked controls</strong> - Medium/Low risks also missing controls<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>X controlled risks show no reduction</strong> - Risks with controls but residual = inherent (controls not effective)<br>' +
          '&nbsp;&nbsp;&nbsp;• <strong>X critical risks not reviewed this quarter</strong> - Critical risks overdue for review<br><br>' +
          '<strong>Why this matters:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Risks without owners lack accountability<br>' +
          '&nbsp;&nbsp;&nbsp;• Risks without controls remain at inherent risk level<br>' +
          '&nbsp;&nbsp;&nbsp;• Controls showing no reduction may need reassessment<br>' +
          '&nbsp;&nbsp;&nbsp;• Unreviewed critical risks may have changed<br><br>' +
          '<strong>What to do:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;1. Assign owners to risks that are missing them<br>' +
          '&nbsp;&nbsp;&nbsp;2. Link controls to uncontrolled risks (use "✨ Suggest Controls")<br>' +
          '&nbsp;&nbsp;&nbsp;3. Review control effectiveness for risks showing no reduction<br>' +
          '&nbsp;&nbsp;&nbsp;4. Update review dates on critical risks<br><br>' +
          '<strong>Goal:</strong> "No weak signals detected" - a healthy risk posture!'
      },
      {
        question: 'How do I toggle between dots and cells on the Dashboard heatmap?',
        answer: '<strong>Heatmap View Toggle:</strong><br><br>' +
          'The Dashboard heatmap can display risks in two different ways:<br><br>' +
          '<strong>Cell View (Default):</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Shows colored cells with risk count numbers<br>' +
          '&nbsp;&nbsp;&nbsp;• Click any cell to see the list of risks in that position<br>' +
          '&nbsp;&nbsp;&nbsp;• Best for seeing risk distribution at a glance<br><br>' +
          '<strong>Dot View:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Shows individual dots for each risk<br>' +
          '&nbsp;&nbsp;&nbsp;• Click any dot to see that specific risk\'s details<br>' +
          '&nbsp;&nbsp;&nbsp;• Best for identifying specific risks visually<br><br>' +
          '<strong>How to toggle:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Look for the view toggle buttons near the heatmap<br>' +
          '&nbsp;&nbsp;&nbsp;• Click the grid icon for Cell View<br>' +
          '&nbsp;&nbsp;&nbsp;• Click the dots icon for Dot View<br><br>' +
          '<strong>Tip:</strong> Use Cell View for overview, Dot View when you need to drill into specific risks.'
      },
      {
        question: 'What are the side panels on the Dashboard?',
        answer: '<strong>Dashboard Side Panels - Detail Views:</strong><br><br>' +
          'When you interact with the Dashboard heatmap, a side panel appears on the right showing details:<br><br>' +
          '<strong>Cell Panel (when clicking a heatmap cell):</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Shows all risks in that Impact × Likelihood position<br>' +
          '&nbsp;&nbsp;&nbsp;• Displays risk titles, categories, and owners<br>' +
          '&nbsp;&nbsp;&nbsp;• Color-coded by risk level (Critical, High, Medium, Low)<br>' +
          '&nbsp;&nbsp;&nbsp;• Click any risk to navigate to its full details<br><br>' +
          '<strong>Risk Dot Panel (when clicking a risk dot):</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Shows details for that specific risk<br>' +
          '&nbsp;&nbsp;&nbsp;• Displays risk title, description, and scores<br>' +
          '&nbsp;&nbsp;&nbsp;• Shows linked controls and their effectiveness<br>' +
          '&nbsp;&nbsp;&nbsp;• Shows the register the risk belongs to<br>' +
          '&nbsp;&nbsp;&nbsp;• Bordered with the risk level color for quick identification<br><br>' +
          '<strong>How to use:</strong><br>' +
          '&nbsp;&nbsp;&nbsp;• Click cells or dots on the heatmap to open panels<br>' +
          '&nbsp;&nbsp;&nbsp;• Click the X or outside the panel to close it<br>' +
          '&nbsp;&nbsp;&nbsp;• Switch between Inherent and Residual heatmaps using the toggle'
      },

      // ========== OTHER FEATURES ==========
      {
        question: 'What are the Escalation fields?',
        answer: 'The Escalation section (Section 4 of the Risk Form) allows you to specify whether a risk needs to be escalated. If "Yes", you can select the Escalation Level (Department/Function, Executive Management, Risk Committee, Board/Audit Committee, or Other) and assign an Escalation Owner. Email notifications can be configured for escalation owners (Pro feature).'
      },
      {
        question: 'Can I export my risk data?',
        answer: 'Yes! Click the <strong>"Export PDF"</strong> button in the Risk Register page header to open the PDF Export Configuration modal. Configure your export with: <strong>Document Setup</strong> (title, orientation, page numbers), <strong>Logo & Branding</strong> (upload your logo, choose position from 6 options), <strong>Signature Blocks</strong> (add approval signatures), and <strong>Field Selection</strong> (choose which columns to include). Click <strong>"Preview Report"</strong> to see how it looks, then <strong>"Export PDF"</strong> to download. You can also export as CSV or JSON using the dropdown menu.'
      },
      {
        question: 'What browsers are supported?',
        answer: 'Dimeri ERM works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser up to date for the best experience. The application is also mobile-responsive.'
      }
    ];

    var html = '<div class="faq-section">' +
      '<div class="faq-header">' +
      '<h3 class="faq-title">Frequently Asked Questions</h3>' +
      '</div>' +
      '<div class="faq-list">';

    for (var i = 0; i < faqs.length; i++) {
      html += '<div class="faq-item" data-faq-index="' + i + '">' +
        '<div class="faq-question">' +
        '<span class="faq-question-text">' + faqs[i].question + '</span>' +
        '<span class="faq-toggle">▼</span>' +
        '</div>' +
        '<div class="faq-answer">' + faqs[i].answer + '</div>' +
        '</div>';
    }

    html += '</div></div>';
    return html;
  },

  /**
   * Build report problem section
   */
  buildReportSection: function() {
    return '<div class="report-section">' +
      '<div class="report-info">' +
      '<h4>🐛 Report a Technical Issue</h4>' +
      '<p>Experiencing a bug or technical problem? Let us know so we can fix it.</p>' +
      '</div>' +
      '<button class="btn btn-secondary" id="report-problem-btn">Report Problem</button>' +
      '</div>';
  },

  /**
   * Build contact section
   */
  buildContactSection: function() {
    return '<h3 class="section-title">Contact Us</h3>' +
      '<div class="contact-grid">' +
      '<div class="contact-card">' +
      '<div class="contact-icon">📧</div>' +
      '<div class="contact-title">Email Support</div>' +
      '<div class="contact-info">support@dimeri.ai</div>' +
      '<div class="contact-hours">Response within 24 hours</div>' +
      '</div>' +
      '<div class="contact-card">' +
      '<div class="contact-icon">💬</div>' +
      '<div class="contact-title">Live Chat</div>' +
      '<div class="contact-info">Available in-app</div>' +
      '<div class="contact-hours">9am - 5pm SAST, Mon-Fri</div>' +
      '</div>' +
      '<div class="contact-card">' +
      '<div class="contact-icon">📚</div>' +
      '<div class="contact-title">Documentation</div>' +
      '<div class="contact-info">User Guide & API Docs</div>' +
      '<div class="contact-hours">Always available</div>' +
      '</div>' +
      '</div>';
  },

  /**
   * Build about section
   */
  buildAboutSection: function() {
    return '<div class="about-links">' +
      '<h4 class="about-links-title">About Dimeri ERM</h4>' +
      '<p class="about-description">Platform Version: 1.0.0 · Powered by Dimeri Technologies</p>' +
      '<div class="about-links-list">' +
      '<a href="#" class="about-link">Terms of Service</a>' +
      '<a href="#" class="about-link">Privacy Policy</a>' +
      '<a href="#" class="about-link">Cookie Policy</a>' +
      '<a href="#" class="about-link">POPIA Compliance</a>' +
      '<a href="#" class="about-link">Accessibility</a>' +
      '</div>' +
      '</div>';
  },

  /**
   * Bind event handlers (guarded - runs once per session)
   */
  bindEvents: function() {
    if (ERM.help._eventsBound) return;
    ERM.help._eventsBound = true;

    var self = this;

    setTimeout(function() {
      var container = document.getElementById('help-content');
      if (!container) {
        console.error('Help content container not found');
        return;
      }

      // Use event delegation for FAQ toggle (works even after re-render)
      container.addEventListener('click', function(e) {
        var target = e.target;

        // Check for quick link clicks first
        var quickLink = null;
        var element = target;
        while (element && element !== container) {
          if (element.classList && element.classList.contains('quick-link')) {
            quickLink = element;
            break;
          }
          element = element.parentElement;
        }

        if (quickLink) {
          e.preventDefault();
          var action = quickLink.getAttribute('data-action');
          self.handleQuickLinkClick(action);
          return;
        }

        // Find FAQ question element (walk up the DOM tree)
        var faqQuestion = null;
        element = target;
        while (element && element !== container) {
          if (element.classList && element.classList.contains('faq-question')) {
            faqQuestion = element;
            break;
          }
          element = element.parentElement;
        }

        if (faqQuestion) {
          var item = faqQuestion.parentElement;
          var isOpen = item.classList.contains('open');

          // Close all other FAQs
          var allItems = container.querySelectorAll('.faq-item');
          for (var j = 0; j < allItems.length; j++) {
            allItems[j].classList.remove('open');
          }

          // Toggle current FAQ
          if (!isOpen) {
            item.classList.add('open');
          }
        }

        // Check if click was on report problem button
        var reportBtn = target;
        if (target.id !== 'report-problem-btn') {
          // Check parent
          element = target;
          while (element && element !== container) {
            if (element.id === 'report-problem-btn') {
              reportBtn = element;
              break;
            }
            element = element.parentElement;
          }
        }

        if (reportBtn.id === 'report-problem-btn') {
          e.preventDefault();
          self.showReportModal();
        }
      });

      // Search
      var searchInput = document.getElementById('help-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', function() {
          self.handleSearch(this.value);
        });
      }

      console.log('Help page events bound successfully');
    }, 150);
  },

  /**
   * Handle search with comprehensive results
   */
  handleSearch: function(query) {
    var self = this;
    var resultsContainer = document.getElementById('help-search-results');

    // Reset FAQ display
    var allFaqItems = document.querySelectorAll('.faq-item');
    for (var i = 0; i < allFaqItems.length; i++) {
      allFaqItems[i].style.display = 'block';
      allFaqItems[i].classList.remove('open');
    }

    if (!query || query.length < 2) {
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
      }
      return;
    }

    var queryLower = query.toLowerCase();
    var results = [];

    // Search in searchable content
    for (var i = 0; i < this.searchableContent.length; i++) {
      var item = this.searchableContent[i];
      var titleMatch = item.title.toLowerCase().indexOf(queryLower) !== -1;
      var keywordMatch = item.keywords.toLowerCase().indexOf(queryLower) !== -1;

      if (titleMatch || keywordMatch) {
        results.push({
          type: item.type,
          icon: item.icon,
          title: item.title,
          action: item.action || null,
          url: item.url || null,
          score: titleMatch ? 2 : 1 // Title matches score higher
        });
      }
    }

    // Search in FAQs
    var faqItems = document.querySelectorAll('.faq-item');
    for (var i = 0; i < faqItems.length; i++) {
      var questionText = faqItems[i].querySelector('.faq-question-text').textContent;
      var answerText = faqItems[i].querySelector('.faq-answer').textContent;

      if (questionText.toLowerCase().indexOf(queryLower) !== -1 ||
          answerText.toLowerCase().indexOf(queryLower) !== -1) {
        results.push({
          type: 'faq',
          icon: '❓',
          title: questionText,
          faqIndex: i,
          score: questionText.toLowerCase().indexOf(queryLower) !== -1 ? 2 : 1
        });
      }
    }

    // Sort by score (higher first)
    results.sort(function(a, b) { return b.score - a.score; });

    // Limit results
    results = results.slice(0, 8);

    // Build results HTML
    if (resultsContainer) {
      if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-no-results">' +
          '<span class="no-results-icon">🔍</span>' +
          '<p>No results found for "<strong>' + this.escapeHtml(query) + '</strong>"</p>' +
          '<a href="help/index.html?search=' + encodeURIComponent(query) + '" target="_blank" class="search-help-center-link">' +
          'Search in Help Center →</a>' +
          '</div>';
        resultsContainer.style.display = 'block';
      } else {
        var html = '<div class="search-results-list">';

        for (var i = 0; i < results.length; i++) {
          var result = results[i];
          var typeLabel = result.type === 'guide' ? 'Guide' :
                          result.type === 'article' ? 'Article' :
                          result.type === 'topic' ? 'Topic' : 'FAQ';

          html += '<div class="search-result-item" data-result-index="' + i + '" ' +
            'data-type="' + result.type + '" ' +
            (result.action ? 'data-action="' + result.action + '"' : '') +
            (result.url ? 'data-url="' + result.url + '"' : '') +
            (result.faqIndex !== undefined ? 'data-faq-index="' + result.faqIndex + '"' : '') + '>' +
            '<span class="result-icon">' + result.icon + '</span>' +
            '<div class="result-content">' +
            '<span class="result-title">' + this.highlightMatch(result.title, query) + '</span>' +
            '<span class="result-type">' + typeLabel + '</span>' +
            '</div>' +
            '<span class="result-arrow">→</span>' +
            '</div>';
        }

        html += '</div>';
        html += '<div class="search-results-footer">' +
          '<a href="help/index.html?search=' + encodeURIComponent(query) + '" target="_blank" class="search-help-center-link">' +
          'See all results in Help Center →</a>' +
          '</div>';

        resultsContainer.innerHTML = html;
        resultsContainer.style.display = 'block';

        // Bind click events to results
        var resultItems = resultsContainer.querySelectorAll('.search-result-item');
        for (var j = 0; j < resultItems.length; j++) {
          resultItems[j].addEventListener('click', function() {
            var type = this.getAttribute('data-type');
            var action = this.getAttribute('data-action');
            var url = this.getAttribute('data-url');
            var faqIndex = this.getAttribute('data-faq-index');

            if (type === 'faq' && faqIndex !== null) {
              // Scroll to and open the FAQ
              var faqItem = document.querySelectorAll('.faq-item')[parseInt(faqIndex)];
              if (faqItem) {
                // Close all FAQs first
                var allFaqs = document.querySelectorAll('.faq-item');
                for (var k = 0; k < allFaqs.length; k++) {
                  allFaqs[k].classList.remove('open');
                }
                faqItem.classList.add('open');
                faqItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              resultsContainer.style.display = 'none';
            } else if (url) {
              window.open(url, '_blank');
            } else if (action) {
              self.handleQuickLinkClick(action);
              resultsContainer.style.display = 'none';
            }
          });
        }
      }
    }
  },

  /**
   * Escape HTML special characters
   */
  escapeHtml: function(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Highlight matching text in search results
   */
  highlightMatch: function(text, query) {
    if (!query) return this.escapeHtml(text);
    var escapedText = this.escapeHtml(text);
    var regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return escapedText.replace(regex, '<mark>$1</mark>');
  },

  /**
   * Handle quick link clicks
   */
  handleQuickLinkClick: function(action) {
    var guides = {
      'getting-started': {
        title: '🚀 Getting Started with Dimeri ERM',
        content: '<div style="padding: 8px;">' +
          '<div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #3b82f6;">' +
          '<h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 18px;">Welcome to Enterprise Risk Management! 👋</h3>' +
          '<p style="margin: 0; color: #475569; font-size: 14px;">Your complete AI-powered platform for identifying, assessing, and managing organizational risks.</p>' +
          '</div>' +

          '<h4 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="background: #dbeafe; width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">1</span>' +
          'Set Up Your First Risk Register</h4>' +
          '<ul style="margin: 0 0 20px 0; padding-left: 24px; line-height: 1.8; color: #475569;">' +
          '<li>Click <strong>"Risk Register"</strong> in the left sidebar</li>' +
          '<li>Click the <strong>"Add New Risk"</strong> button in the top right</li>' +
          '<li>Choose your preferred method:<br><span style="margin-left: 16px; display: block; margin-top: 4px;">• <strong>Manual Entry:</strong> Fill in all details yourself<br>• <strong>Describe with AI:</strong> Type what you\'re worried about and let AI do the work</span></li>' +
          '</ul>' +

          '<h4 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="background: #dbeafe; width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">2</span>' +
          'Add Controls to Reduce Risk</h4>' +
          '<ul style="margin: 0 0 20px 0; padding-left: 24px; line-height: 1.8; color: #475569;">' +
          '<li>Open any risk and scroll to <strong>"Linked Controls"</strong></li>' +
          '<li>Click the <strong>+ button</strong> to create a new control</li>' +
          '<li>Check boxes to link existing controls</li>' +
          '<li>Watch your <strong>Residual Risk</strong> decrease automatically</li>' +
          '</ul>' +

          '<h4 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="background: #dbeafe; width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">3</span>' +
          'Monitor Your Risk Profile</h4>' +
          '<ul style="margin: 0 0 20px 0; padding-left: 24px; line-height: 1.8; color: #475569;">' +
          '<li>Visit the <strong>Dashboard</strong> to see your risk heatmap</li>' +
          '<li>View <strong>Inherent vs Residual</strong> risk charts</li>' +
          '<li>Check <strong>Control Effectiveness</strong> ratings</li>' +
          '<li>Filter by different risk registers</li>' +
          '</ul>' +

          // AI Features Section
          '<div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #bfdbfe;">' +
          '<h4 style="color: #2563eb; font-size: 16px; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="font-size: 20px;">✨</span> AI-Powered Features</h4>' +

          '<div style="margin-bottom: 16px;">' +
          '<strong style="color: #1d4ed8; font-size: 14px;">🤖 AI Chat Assistant</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.7; color: #1e40af; font-size: 13px;">' +
          '<li>Click the <strong>blue "✨ AI" button</strong> in the bottom-right corner</li>' +
          '<li>The AI is <strong>context-aware</strong> – it knows your risks, controls, and dashboard data</li>' +
          '<li>Ask questions like: "What are my highest risks?", "Suggest controls for IT risks"</li>' +
          '<li>Get tailored recommendations based on your actual data</li>' +
          '</ul>' +
          '</div>' +

          '<div style="margin-bottom: 16px;">' +
          '<strong style="color: #1d4ed8; font-size: 14px;">✨ Field-Level AI Suggestions</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.7; color: #1e40af; font-size: 13px;">' +
          '<li>Look for <strong>✨ sparkle icons</strong> next to form fields</li>' +
          '<li>Click to get AI-generated suggestions for root causes, consequences, treatments</li>' +
          '<li>AI analyzes your risk context and provides relevant recommendations</li>' +
          '</ul>' +
          '</div>' +

          '<div style="margin-bottom: 16px;">' +
          '<strong style="color: #1d4ed8; font-size: 14px;">📝 Describe with AI</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.7; color: #1e40af; font-size: 13px;">' +
          '<li>When creating risks/controls, choose <strong>"Describe with AI"</strong> mode</li>' +
          '<li>Simply describe the risk in plain language</li>' +
          '<li>AI automatically generates title, category, likelihood, impact, and more</li>' +
          '</ul>' +
          '</div>' +

          '<div>' +
          '<strong style="color: #1d4ed8; font-size: 14px;">🔍 Review Risk</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.7; color: #1e40af; font-size: 13px;">' +
          '<li>Click <strong>"✨ Review Risk"</strong> at the bottom of any risk form</li>' +
          '<li>Get a comprehensive AI analysis of your entire risk entry</li>' +
          '<li>Receive suggestions for improvements and missing information</li>' +
          '</ul>' +
          '</div>' +
          '</div>' +

          '<div style="background: #fef3c7; padding: 16px; border-radius: 10px; border-left: 4px solid #f59e0b; margin-top: 24px;">' +
          '<div style="display: flex; align-items: start; gap: 10px;">' +
          '<span style="font-size: 20px;">💡</span>' +
          '<div>' +
          '<strong style="color: #92400e; display: block; margin-bottom: 4px;">Pro Tips:</strong>' +
          '<ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 13px; line-height: 1.6;">' +
          '<li>Use the <strong>✨ sparkle icons</strong> for AI suggestions on any field</li>' +
          '<li>Click <strong>"✨ Review Risk"</strong> at the bottom of the risk form for a full AI review</li>' +
          '<li>Export data regularly from <strong>Reports</strong> section</li>' +
          '<li>Check <strong>Activity Log</strong> to audit all changes</li>' +
          '<li>Set up team members and assign risk owners</li>' +
          '</ul>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>'
      },
      'risk-register-guide': {
        title: '📊 Risk Register Guide',
        content: '<div style="padding: 8px;">' +
          // Blue gradient header
          '<div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #3b82f6;">' +
          '<h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 18px;">Managing Your Risk Register 📊</h3>' +
          '<p style="margin: 0; color: #475569; font-size: 14px;">Identify, assess, and track organizational risks with AI-powered assistance.</p>' +
          '</div>' +

          // Risk Form Sections Overview
          '<div style="background: #f8fafc; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">' +
          '<strong style="color: #334155; font-size: 13px;">Risk Form Sections:</strong>' +
          '<ol style="margin: 8px 0 0 0; padding-left: 20px; color: #64748b; font-size: 13px;">' +
          '<li><strong>Risk Identification</strong> – Title, category, description, root causes, consequences</li>' +
          '<li><strong>Risk Assessment</strong> – Likelihood, impact, heatmap, linked controls</li>' +
          '<li><strong>Action Plan</strong> – Treatment, mitigation, risk owner, action owner, review date</li>' +
          '<li><strong>Escalation</strong> – Escalation level and owner (when required)</li>' +
          '<li><strong>Evidence & Attachments</strong> – Supporting documents</li>' +
          '</ol>' +
          '</div>' +

          // Step 1: Creating Risks
          '<h4 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="background: #dbeafe; width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">1</span>' +
          'Creating a Risk (Two Methods)</h4>' +
          '<ul style="margin: 0 0 20px 0; padding-left: 24px; line-height: 1.8; color: #475569;">' +
          '<li><strong>Manual Entry:</strong> Click "Add New Risk" and fill in each field (title, category, likelihood 1-5, impact 1-5). AI will suggest options as you type.</li>' +
          '<li><strong>Describe with AI:</strong> Select "Describe with AI" mode and type a natural description like <em>"risk of commodity price drop affecting revenue"</em>. AI generates all fields automatically.</li>' +
          '</ul>' +

          // Step 2: Understanding Risk Scoring
          '<h4 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="background: #dbeafe; width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">2</span>' +
          'Understanding Risk Scoring</h4>' +
          '<ul style="margin: 0 0 20px 0; padding-left: 24px; line-height: 1.8; color: #475569;">' +
          '<li><strong>Inherent Risk:</strong> Risk level <em>before</em> any controls (Likelihood × Impact)</li>' +
          '<li><strong>Residual Risk:</strong> Risk level <em>after</em> controls are applied</li>' +
          '<li><strong>Risk Score Levels:</strong>' +
          '<ul style="margin-top: 8px; padding-left: 20px;">' +
          '<li>1-4 = <span style="color: #16a34a; font-weight: 600;">Low Risk</span> - Acceptable risk level. Monitor periodically.</li>' +
          '<li>5-9 = <span style="color: #ca8a04; font-weight: 600;">Medium Risk</span> - Consider controls. Regular monitoring required.</li>' +
          '<li>10-14 = <span style="color: #ea580c; font-weight: 600;">High Risk</span> - Action required. Implement controls promptly.</li>' +
          '<li>15-25 = <span style="color: #dc2626; font-weight: 600;">Critical Risk</span> - Immediate action needed. Escalate to leadership.</li>' +
          '</ul></li>' +
          '</ul>' +

          // Step 3: Linking Controls
          '<h4 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="background: #dbeafe; width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">3</span>' +
          'Linking Controls to Reduce Risk</h4>' +
          '<ul style="margin: 0 0 20px 0; padding-left: 24px; line-height: 1.8; color: #475569;">' +
          '<li>Open any risk and scroll to the <strong>"Linked Controls"</strong> section</li>' +
          '<li>Click the <strong>+ icon</strong> to see AI-suggested controls</li>' +
          '<li>Select relevant controls to reduce your residual risk score</li>' +
          '<li>More controls = lower residual risk (shown on Dashboard)</li>' +
          '</ul>' +

          // Step 4: Escalation
          '<h4 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="background: #dbeafe; width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">4</span>' +
          'Escalating Risks</h4>' +
          '<ul style="margin: 0 0 20px 0; padding-left: 24px; line-height: 1.8; color: #475569;">' +
          '<li>Set <strong>"Escalation Required?"</strong> to <strong>Yes</strong> for high-priority risks</li>' +
          '<li>Select an <strong>Escalation Level</strong>: Department/Function, Executive Management, Risk Committee, Board/Audit Committee, or Other</li>' +
          '<li>Assign an <strong>Escalation Owner</strong> (e.g., Chief Risk Officer)</li>' +
          '<li>Use the <strong>✉️ Notify</strong> button to configure email alerts (Pro feature)</li>' +
          '</ul>' +

          // AI Features for Risk Register
          '<div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #bfdbfe;">' +
          '<h4 style="color: #2563eb; font-size: 16px; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="font-size: 20px;">✨</span> AI Features in Risk Register</h4>' +

          '<div style="margin-bottom: 16px;">' +
          '<strong style="color: #1d4ed8; font-size: 14px;">📝 Describe with AI (Risk Creation)</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.7; color: #1e40af; font-size: 13px;">' +
          '<li>Click <strong>"Add New Risk"</strong> and select <strong>"Describe with AI"</strong></li>' +
          '<li>Type a natural language description of your risk concern</li>' +
          '<li>AI automatically generates: title, category, description, root causes, consequences, likelihood, and impact scores</li>' +
          '<li>Review and adjust the AI-generated content as needed</li>' +
          '</ul>' +
          '</div>' +

          '<div style="margin-bottom: 16px;">' +
          '<strong style="color: #1d4ed8; font-size: 14px;">✨ Field-Level AI Suggestions</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.7; color: #1e40af; font-size: 13px;">' +
          '<li>Look for <strong>✨ sparkle buttons</strong> next to form fields</li>' +
          '<li><strong>Root Causes:</strong> AI suggests potential causes based on risk description</li>' +
          '<li><strong>Consequences:</strong> AI identifies potential impacts and outcomes</li>' +
          '<li><strong>Treatment Plan:</strong> AI recommends mitigation strategies</li>' +
          '<li><strong>Linked Controls:</strong> AI suggests relevant controls to apply</li>' +
          '</ul>' +
          '</div>' +

          '<div style="margin-bottom: 16px;">' +
          '<strong style="color: #1d4ed8; font-size: 14px;">🔍 Review Risk (Full Analysis)</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.7; color: #1e40af; font-size: 13px;">' +
          '<li>Click <strong>"✨ Review Risk"</strong> button at the bottom of the risk form</li>' +
          '<li>AI performs a comprehensive analysis of your entire risk entry</li>' +
          '<li>Get feedback on completeness, scoring accuracy, and missing information</li>' +
          '<li>Receive specific suggestions for improving your risk documentation</li>' +
          '</ul>' +
          '</div>' +

          '<div>' +
          '<strong style="color: #1d4ed8; font-size: 14px;">🤖 AI Chat for Risk Analysis</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.7; color: #1e40af; font-size: 13px;">' +
          '<li>Open the <strong>AI Chat Assistant</strong> (purple button, bottom-right)</li>' +
          '<li>Ask: "What are my highest inherent risks?"</li>' +
          '<li>Ask: "Which risks need more controls?"</li>' +
          '<li>Ask: "Summarize risks in [category name]"</li>' +
          '</ul>' +
          '</div>' +
          '</div>' +

          // Pro Tips callout
          '<div style="background: #fef3c7; padding: 16px; border-radius: 10px; border-left: 4px solid #f59e0b; margin-top: 24px;">' +
          '<div style="display: flex; align-items: start; gap: 10px;">' +
          '<span style="font-size: 20px;">💡</span>' +
          '<div>' +
          '<strong style="color: #92400e;">Best Practices:</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.8; color: #78350f;">' +
          '<li>Review risks quarterly or when business circumstances change</li>' +
          '<li>Add detailed consequences and root causes for better analysis</li>' +
          '<li>Assign clear risk owners for accountability</li>' +
          '<li>Use the Dashboard heatmap to visualize risk distribution</li>' +
          '<li>Escalate critical and high risks to appropriate management levels</li>' +
          '</ul>' +
          '</div>' +
          '</div>' +
          '</div>' +

          '</div>'
      },
      'controls-guide': {
        title: '🛡️ Controls Management Guide',
        content: '<div style="padding: 8px;">' +
          // Green gradient header
          '<div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 20px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #22c55e;">' +
          '<h3 style="margin: 0 0 8px 0; color: #166534; font-size: 18px;">Managing Risk Controls 🛡️</h3>' +
          '<p style="margin: 0; color: #475569; font-size: 14px;">Implement and track controls to mitigate organizational risks effectively with AI assistance.</p>' +
          '</div>' +

          // Step 1: Understanding Control Types
          '<h4 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="background: #dcfce7; width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">1</span>' +
          'Understanding Control Types</h4>' +
          '<ul style="margin: 0 0 20px 0; padding-left: 24px; line-height: 1.8; color: #475569;">' +
          '<li><strong>Preventive:</strong> Stop risks from occurring <em>(e.g., policies, access restrictions, approval workflows)</em></li>' +
          '<li><strong>Detective:</strong> Identify risks that have occurred <em>(e.g., monitoring systems, audits, reconciliations)</em></li>' +
          '<li><strong>Corrective:</strong> Fix issues after they occur <em>(e.g., incident response plans, recovery procedures)</em></li>' +
          '<li><strong>Directive:</strong> Guide behavior and expectations <em>(e.g., training programs, standards, guidelines)</em></li>' +
          '</ul>' +

          // Step 2: Control Categories
          '<h4 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="background: #dcfce7; width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">2</span>' +
          'Control Implementation Categories</h4>' +
          '<ul style="margin: 0 0 20px 0; padding-left: 24px; line-height: 1.8; color: #475569;">' +
          '<li><strong>Policy:</strong> Written policies and procedures</li>' +
          '<li><strong>Manual:</strong> Human-performed controls (reviews, approvals)</li>' +
          '<li><strong>Automated:</strong> System-enforced controls (IT systems, software)</li>' +
          '<li><strong>Physical:</strong> Physical security measures (locks, barriers, cameras)</li>' +
          '<li><strong>Segregation:</strong> Separation of duties to prevent fraud</li>' +
          '<li><strong>Monitoring:</strong> Ongoing surveillance and detection</li>' +
          '</ul>' +

          // Step 3: Creating and Managing Controls
          '<h4 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="background: #dcfce7; width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">3</span>' +
          'Creating Controls</h4>' +
          '<ul style="margin: 0 0 20px 0; padding-left: 24px; line-height: 1.8; color: #475569;">' +
          '<li>Go to <strong>Controls</strong> in the sidebar and click <strong>"Add Control"</strong></li>' +
          '<li>Choose between <strong>Manual Entry</strong> or <strong>Describe with AI</strong></li>' +
          '<li>Fill in control name, description, type, and category</li>' +
          '<li>Assign a control owner responsible for implementation</li>' +
          '<li>Set review dates to track control testing</li>' +
          '</ul>' +

          // Step 4: Effectiveness Assessment
          '<h4 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="background: #dcfce7; width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">4</span>' +
          'Assessing Control Effectiveness</h4>' +
          '<ul style="margin: 0 0 20px 0; padding-left: 24px; line-height: 1.8; color: #475569;">' +
          '<li><strong style="color: #16a34a;">Effective:</strong> Control is working as designed (risk reduction achieved)</li>' +
          '<li><strong style="color: #f59e0b;">Partially Effective:</strong> Control needs improvement (some gaps exist)</li>' +
          '<li><strong style="color: #dc2626;">Ineffective:</strong> Control is not working (redesign required)</li>' +
          '<li><strong style="color: #64748b;">Not Tested:</strong> Control effectiveness not yet assessed</li>' +
          '</ul>' +

          // AI Features for Controls
          '<div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #bfdbfe;">' +
          '<h4 style="color: #2563eb; font-size: 16px; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="font-size: 20px;">✨</span> AI Features for Controls</h4>' +

          '<div style="margin-bottom: 16px;">' +
          '<strong style="color: #1d4ed8; font-size: 14px;">📝 Describe with AI (Control Creation)</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.7; color: #1e40af; font-size: 13px;">' +
          '<li>Click <strong>"Add Control"</strong> and select <strong>"Describe with AI"</strong></li>' +
          '<li>Type a description like: "quarterly audit of user access rights"</li>' +
          '<li>AI generates: control name, description, type (Preventive/Detective/etc.), category, and more</li>' +
          '<li>Review and adjust the AI-generated content before saving</li>' +
          '</ul>' +
          '</div>' +

          '<div style="margin-bottom: 16px;">' +
          '<strong style="color: #1d4ed8; font-size: 14px;">🔗 AI-Suggested Controls for Risks</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.7; color: #1e40af; font-size: 13px;">' +
          '<li>When editing a risk, scroll to <strong>"Linked Controls"</strong> section</li>' +
          '<li>Click the <strong>+ button</strong> to see AI-suggested controls</li>' +
          '<li>AI analyzes the risk and recommends relevant controls</li>' +
          '<li>Suggestions are based on risk category, description, and industry best practices</li>' +
          '</ul>' +
          '</div>' +

          '<div style="margin-bottom: 16px;">' +
          '<strong style="color: #1d4ed8; font-size: 14px;">✨ Field-Level AI Suggestions</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.7; color: #1e40af; font-size: 13px;">' +
          '<li>Look for <strong>✨ sparkle buttons</strong> next to control form fields</li>' +
          '<li>Get AI suggestions for control descriptions and implementation details</li>' +
          '<li>AI considers the control type and category for relevant recommendations</li>' +
          '</ul>' +
          '</div>' +

          '<div>' +
          '<strong style="color: #1d4ed8; font-size: 14px;">🤖 AI Chat for Control Analysis</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.7; color: #1e40af; font-size: 13px;">' +
          '<li>Open the <strong>AI Chat Assistant</strong> (purple button, bottom-right)</li>' +
          '<li>Ask: "What controls should I add for IT security risks?"</li>' +
          '<li>Ask: "How effective are my current controls?"</li>' +
          '<li>Ask: "Suggest controls for compliance risks"</li>' +
          '</ul>' +
          '</div>' +
          '</div>' +

          // Important note callout
          '<div style="background: #dbeafe; padding: 16px; border-radius: 10px; border-left: 4px solid #3b82f6; margin-top: 24px;">' +
          '<div style="display: flex; align-items: start; gap: 10px;">' +
          '<span style="font-size: 20px;">ℹ️</span>' +
          '<div>' +
          '<strong style="color: #1e40af;">Important:</strong>' +
          '<p style="margin: 8px 0 0 0; line-height: 1.8; color: #1e3a8a;">Controls only reduce risk if they are <strong>effective</strong>. Regularly test and review your controls to ensure they work as intended. Update effectiveness ratings after each review cycle.</p>' +
          '</div>' +
          '</div>' +
          '</div>' +

          '</div>'
      },
      'security-guide': {
        title: '🔐 Account & Security Guide',
        content: '<div style="padding: 8px;">' +
          // Purple gradient header
          '<div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #3b82f6;">' +
          '<h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 18px;">Account & Security 🔐</h3>' +
          '<p style="margin: 0; color: #475569; font-size: 14px;">Manage your account, protect your data, and maintain privacy compliance.</p>' +
          '</div>' +

          // Step 1: Account Settings
          '<h4 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="background: #dbeafe; width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">1</span>' +
          'Managing Your Account</h4>' +
          '<ul style="margin: 0 0 20px 0; padding-left: 24px; line-height: 1.8; color: #475569;">' +
          '<li>Click the <strong>Settings</strong> icon in the sidebar</li>' +
          '<li>Go to <strong>Account Settings</strong> to update your name, email, and role</li>' +
          '<li>Your email address is your unique identifier in the system</li>' +
          '<li>Changes are saved automatically to your browser storage</li>' +
          '</ul>' +

          // Step 2: Data Privacy & Backups
          '<h4 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="background: #dbeafe; width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">2</span>' +
          'Data Privacy & Backups</h4>' +
          '<ul style="margin: 0 0 20px 0; padding-left: 24px; line-height: 1.8; color: #475569;">' +
          '<li>All data is stored securely in your <strong>browser\'s local storage</strong> (not on external servers)</li>' +
          '<li>Export your data anytime: <strong>Settings → Privacy → Export My Data</strong></li>' +
          '<li>Downloaded data is in JSON format and includes all risks, controls, and activities</li>' +
          '<li>Import backups to restore data after clearing browser storage</li>' +
          '</ul>' +

          // Step 3: Activity Monitoring
          '<h4 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="background: #dbeafe; width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">3</span>' +
          'Audit Trail & Activity Monitoring</h4>' +
          '<ul style="margin: 0 0 20px 0; padding-left: 24px; line-height: 1.8; color: #475569;">' +
          '<li>View recent activity on the Dashboard (last 5 actions)</li>' +
          '<li>Access full audit trail: <strong>Activity Log</strong> in sidebar</li>' +
          '<li>Filter by type (risks, controls, users, settings) and action (created, updated, deleted)</li>' +
          '<li>Export activity logs as CSV for compliance reporting</li>' +
          '</ul>' +

          // Step 4: Notification Settings
          '<h4 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="background: #dbeafe; width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">4</span>' +
          'Notification Preferences</h4>' +
          '<ul style="margin: 0 0 20px 0; padding-left: 24px; line-height: 1.8; color: #475569;">' +
          '<li>Customize alerts in <strong>Settings → Notifications</strong></li>' +
          '<li>Enable email notifications for high-risk alerts</li>' +
          '<li>Toggle risk review reminders and control effectiveness alerts</li>' +
          '<li>Adjust notification frequency (instant, daily, weekly)</li>' +
          '</ul>' +

          // AI & Data Privacy Section
          '<div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #bfdbfe;">' +
          '<h4 style="color: #2563eb; font-size: 16px; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">' +
          '<span style="font-size: 20px;">✨</span> AI Features & Data Privacy</h4>' +

          '<div style="margin-bottom: 16px;">' +
          '<strong style="color: #1d4ed8; font-size: 14px;">🔒 How AI Uses Your Data</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.7; color: #1e40af; font-size: 13px;">' +
          '<li>AI features analyze your risks and controls <strong>locally</strong> to provide personalized suggestions</li>' +
          '<li>The AI Chat Assistant reads your current data to give context-aware responses</li>' +
          '<li>AI suggestions are generated based on your risk descriptions, categories, and scores</li>' +
          '<li>Your data is <strong>never sent to external AI services</strong> without your consent</li>' +
          '</ul>' +
          '</div>' +

          '<div style="margin-bottom: 16px;">' +
          '<strong style="color: #1d4ed8; font-size: 14px;">🤖 AI Chat Assistant Privacy</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.7; color: #1e40af; font-size: 13px;">' +
          '<li>Chat history is stored locally in your browser</li>' +
          '<li>The AI has read-only access to your risk register and controls</li>' +
          '<li>Conversations are not shared or stored on external servers</li>' +
          '<li>You can clear chat history at any time</li>' +
          '</ul>' +
          '</div>' +

          '<div>' +
          '<strong style="color: #1d4ed8; font-size: 14px;">✨ AI Audit Trail</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.7; color: #1e40af; font-size: 13px;">' +
          '<li>All AI-generated content is logged in the Activity Log</li>' +
          '<li>Track which risks/controls were created or modified using AI</li>' +
          '<li>AI suggestions are always reviewed by you before being saved</li>' +
          '</ul>' +
          '</div>' +
          '</div>' +

          // POPIA Compliance callout
          '<div style="background: #dcfce7; padding: 16px; border-radius: 10px; border-left: 4px solid #22c55e; margin-top: 24px;">' +
          '<div style="display: flex; align-items: start; gap: 10px;">' +
          '<span style="font-size: 20px;">✅</span>' +
          '<div>' +
          '<strong style="color: #166534;">POPIA Compliance:</strong>' +
          '<p style="margin: 8px 0 0 0; line-height: 1.8; color: #166534;">Dimeri ERM is designed with South African <strong>POPIA (Protection of Personal Information Act)</strong> compliance in mind. Your data remains private and under your control at all times. No data is transmitted to external servers without explicit consent.</p>' +
          '</div>' +
          '</div>' +
          '</div>' +

          // Security best practices callout
          '<div style="background: #fef3c7; padding: 16px; border-radius: 10px; border-left: 4px solid #f59e0b; margin-top: 16px;">' +
          '<div style="display: flex; align-items: start; gap: 10px;">' +
          '<span style="font-size: 20px;">🔒</span>' +
          '<div>' +
          '<strong style="color: #92400e;">Security Best Practices:</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.8; color: #78350f;">' +
          '<li>Export backups <strong>weekly</strong> to protect against browser data loss</li>' +
          '<li>Keep your browser updated for latest security patches</li>' +
          '<li>Clear Activity Log periodically to manage storage space</li>' +
          '<li>Review linked users and permissions regularly</li>' +
          '</ul>' +
          '</div>' +
          '</div>' +
          '</div>' +

          '</div>'
      }
    };

    var guide = guides[action];
    if (!guide) return;

    if (typeof ERM.components !== 'undefined' && ERM.components.showModal) {
      ERM.components.showModal({
        title: guide.title,
        content: guide.content,
        size: 'lg',
        buttons: [
          { label: 'Close', type: 'secondary', action: 'close' }
        ]
      });
    }
  },

  /**
   * Show report problem modal
   */
  showReportModal: function() {
    var content = '<div class="form-group">' +
      '<label class="form-label">Problem Type</label>' +
      '<select id="problem-type" class="form-input">' +
      '<option value="">Select a type...</option>' +
      '<option value="bug">Bug / Error</option>' +
      '<option value="performance">Performance Issue</option>' +
      '<option value="ui">UI / Display Problem</option>' +
      '<option value="data">Data Not Saving</option>' +
      '<option value="other">Other</option>' +
      '</select>' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Description</label>' +
      '<textarea id="problem-description" class="form-input" rows="5" ' +
      'placeholder="Please describe the problem in detail..."></textarea>' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Email (for follow-up)</label>' +
      '<input type="email" id="problem-email" class="form-input" ' +
      'placeholder="your@email.com" />' +
      '</div>';

    ERM.components.showModal({
      title: '🐛 Report a Problem',
      content: content,
      size: 'md',
      buttons: [
        { label: 'Cancel', type: 'secondary', action: 'close' },
        { label: 'Submit Report', type: 'primary', action: 'submit' }
      ],
      onAction: function(action) {
        if (action === 'submit') {
          var type = document.getElementById('problem-type').value;
          var description = document.getElementById('problem-description').value;
          var email = document.getElementById('problem-email').value;

          if (!type || !description) {
            ERM.toast.error('Please fill in all required fields');
            return;
          }

          // In a real app, this would send to a server
          console.log('Problem report:', { type: type, description: description, email: email });

          ERM.components.closeModal();
          ERM.toast.success('Thank you! Your report has been submitted.');
        }
      }
    });
  }

};

console.log('Help module loaded');

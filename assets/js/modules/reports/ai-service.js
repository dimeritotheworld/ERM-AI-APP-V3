/**
 * AI Service Module
 * Handles DeepSeek API integration for report editor AI features
 * ES5 Compatible
 */

(function() {
  'use strict';

  window.ERM = window.ERM || {};
  ERM.aiService = ERM.aiService || {};

  // ========================================
  // CONFIGURATION
  // ========================================

  var config = {
    apiKey: 'sk-831509d82fa54fdeaa2e835e0a62f8b2',
    baseUrl: 'https://api.deepseek.com',
    proxyUrl: '/api/ai-proxy', // Node.js proxy endpoint
    useProxy: true, // Set to false if running server-side or CORS is resolved
    model: 'deepseek-chat',
    maxTokens: 1024,
    temperature: 0.7,
    timeout: 30000, // 30 second timeout
    maxRetries: 2
  };

  // ========================================
  // AI PERSONA - Strong detailed persona for quality responses
  // ========================================

  var AI_PERSONA = {
    system: 'You are an expert Enterprise Risk Management (ERM) writing assistant with deep expertise in:\n' +
      '- Risk assessment and analysis methodologies (COSO, ISO 31000, NIST)\n' +
      '- Corporate governance and compliance frameworks\n' +
      '- Internal audit and control environments\n' +
      '- Executive communication and board reporting\n' +
      '- Financial services risk management\n\n' +
      'WRITING STYLE:\n' +
      '- Write with authority, precision, and clarity\n' +
      '- Use professional business language for executive audiences\n' +
      '- Be concise - every word must add value\n' +
      '- Preserve all data, numbers, and metrics exactly\n' +
      '- Never fabricate statistics or data\n\n' +
      'OUTPUT RULES:\n' +
      '- Return ONLY the requested content\n' +
      '- No preambles like "Here is..." or "I will..."\n' +
      '- Start directly with the content',

    toolbar: 'STRICT MARKDOWN FORMAT RULES:\n\n' +
      'HEADINGS:\n' +
      '- ## for main sections, ### for subsections, #### for minor labels\n' +
      '- Never use # (H1) or ##### (H5+)\n' +
      '- No skipped levels, no punctuation at end, followed by blank line\n\n' +
      'PARAGRAPHS:\n' +
      '- 1-3 sentences max, blank line between\n' +
      '- No line breaks inside paragraphs\n' +
      '- Max ~4 rendered lines per paragraph\n\n' +
      'BULLET LISTS (- only):\n' +
      '- Preferred: - **Label:** Description\n' +
      '- Max one level of nesting\n' +
      '- Blank line before and after list\n' +
      '- Each bullet ≤2 lines\n\n' +
      'NUMBERED LISTS (sequences/steps only):\n' +
      '1. Always start at 1\n' +
      '2. No mixing with bullets\n' +
      '3. Each item is complete thought\n\n' +
      'TABLES (when comparing data):\n' +
      '- Must have header row and separator (|---|)\n' +
      '- No empty cells, max 7 rows, max 5 columns\n' +
      '- Preceded by heading or intro sentence\n' +
      '- Example:\n' +
      '| Category | Score | Status |\n' +
      '|----------|-------|--------|\n' +
      '| Tech     | High  | Open   |\n\n' +
      'EMPHASIS:\n' +
      '- **bold** for key terms, labels, risk levels\n' +
      '- *italic* sparingly for emphasis only\n' +
      '- No underline, no ALL CAPS\n\n' +
      'DIVIDERS:\n' +
      '- --- only between major sections\n' +
      '- Blank line above and below\n\n' +
      'FORBIDDEN:\n' +
      '- No emojis, icons, HTML, checkboxes\n' +
      '- No code blocks for normal text\n' +
      '- No ASCII art or decorative formatting\n' +
      '- No footnotes or external links\n\n' +
      'RULE: Markdown must never draw attention to itself. If formatting is noticeable, it is wrong.'
  };

  // ========================================
  // SHARED FORMAT RULES FOR ALL PROMPTS
  // ========================================

  var FORMAT_RULES_COMPACT = '\n\n' +
    '=== OUTPUT FORMAT (MANDATORY) ===\n' +
    'You MUST format your response using these exact patterns:\n\n' +
    'For key terms: **bold text**\n' +
    'For lists with labels:\n' +
    '- **Label:** Description here\n' +
    '- **Another:** More description\n\n' +
    'For sequences/steps:\n' +
    '1. First step\n' +
    '2. Second step\n\n' +
    'Paragraphs: 1-3 sentences max, blank line between.\n' +
    'NO emojis. NO HTML. NO code blocks. Start directly with content.';

  var FORMAT_RULES_FULL = '\n\n' +
    '=== OUTPUT FORMAT (MANDATORY - FOLLOW EXACTLY) ===\n\n' +
    'HEADINGS (use when organizing sections):\n' +
    '## Main Section Title\n' +
    '### Subsection Title\n' +
    '#### Minor Label\n\n' +
    'PARAGRAPHS: 1-3 sentences, blank line between paragraphs.\n\n' +
    'BULLET LISTS (use - only, with bold labels):\n' +
    '- **Finding:** Description of the finding\n' +
    '- **Impact:** Description of impact\n' +
    '- **Action:** Required action item\n\n' +
    'NUMBERED LISTS (for steps/sequences only):\n' +
    '1. First step in process\n' +
    '2. Second step in process\n' +
    '3. Third step in process\n\n' +
    'TABLES (for comparing data - MUST include separator row):\n' +
    '| Category | Score | Status |\n' +
    '|----------|-------|--------|\n' +
    '| Item 1   | High  | Open   |\n' +
    '| Item 2   | Low   | Closed |\n\n' +
    'EMPHASIS: Use **bold** for key terms, risk levels, important values.\n\n' +
    'FORBIDDEN: No emojis, no HTML, no code blocks, no checkboxes.\n' +
    'Start directly with content - no "Here is" or similar preambles.';

  // ========================================
  // INITIALIZATION
  // ========================================

  ERM.aiService.init = function(apiKey) {
    if (apiKey) {
      config.apiKey = apiKey;
    } else {
      // Try to load from storage
      var savedKey = ERM.storage ? ERM.storage.get('deepseekApiKey') : null;
      if (savedKey) {
        config.apiKey = savedKey;
      }
    }
    console.log('[AIService] Initialized', config.apiKey ? '(API key set)' : '(No API key)');
  };

  ERM.aiService.setApiKey = function(apiKey) {
    config.apiKey = apiKey;
    if (ERM.storage) {
      ERM.storage.set('deepseekApiKey', apiKey);
    }
    console.log('[AIService] API key updated');
  };

  ERM.aiService.hasApiKey = function() {
    return !!config.apiKey;
  };

  // ========================================
  // FORMATTING GUIDELINES
  // ========================================

  var formattingGuidelines = {
    // Base formatting rules for all AI-generated content
    base: [
      'Use proper HTML formatting for rich text output.',
      'Structure content with clear hierarchy using headings (h2, h3, h4).',
      'Use paragraphs (<p>) for body text - keep them focused and readable.',
      'Use bullet points (<ul><li>) for lists of items, risks, or recommendations.',
      'Use numbered lists (<ol><li>) for sequential steps or prioritized items.',
      'Use <strong> for emphasis on key terms, risk levels, or important findings.',
      'Keep sentences concise and professional.',
      'Preserve all numbers, percentages, scores, and data points exactly.',
      'Do not include markdown - use HTML tags only.'
    ],

    // Section-specific formatting
    sections: {
      'executive-summary': {
        structure: [
          '<h2>Executive Summary</h2>',
          '<p>Opening paragraph with key findings overview</p>',
          '<h3>Key Highlights</h3>',
          '<ul><li>3-5 bullet points of critical items</li></ul>',
          '<h3>Recommendations</h3>',
          '<ol><li>Prioritized action items</li></ol>'
        ],
        tone: 'Strategic, high-level, focused on business impact'
      },
      'risk-assessment': {
        structure: [
          '<h2>Risk Assessment</h2>',
          '<p>Context and scope of assessment</p>',
          '<h3>Identified Risks</h3>',
          '<p>For each risk:</p>',
          '<h4>Risk Name</h4>',
          '<p><strong>Risk Level:</strong> High/Medium/Low</p>',
          '<p><strong>Description:</strong> Clear explanation</p>',
          '<p><strong>Impact:</strong> Business consequences</p>',
          '<p><strong>Likelihood:</strong> Probability assessment</p>'
        ],
        tone: 'Analytical, objective, evidence-based'
      },
      'controls': {
        structure: [
          '<h2>Control Assessment</h2>',
          '<p>Overview of control environment</p>',
          '<h3>Control Effectiveness</h3>',
          '<ul><li>Control name - Effective/Partially Effective/Ineffective</li></ul>',
          '<h3>Gaps Identified</h3>',
          '<ol><li>Prioritized control gaps</li></ol>'
        ],
        tone: 'Precise, factual, compliance-focused'
      },
      'recommendations': {
        structure: [
          '<h2>Recommendations</h2>',
          '<p>Summary of recommended actions</p>',
          '<h3>Priority 1 - Immediate Actions</h3>',
          '<ol><li>Action item with owner and timeline</li></ol>',
          '<h3>Priority 2 - Short-term Actions</h3>',
          '<ol><li>Action item with owner and timeline</li></ol>'
        ],
        tone: 'Actionable, specific, accountable'
      },
      'appendix': {
        structure: [
          '<h2>Appendix</h2>',
          '<h3>Supporting Data</h3>',
          '<p>Detailed tables or data</p>',
          '<h3>Methodology</h3>',
          '<p>Assessment approach and criteria</p>'
        ],
        tone: 'Technical, detailed, reference-oriented'
      }
    },

    // Audience-specific adjustments
    audiences: {
      'board': 'Use strategic language, focus on governance implications, risk appetite, and fiduciary considerations. Minimize technical jargon.',
      'audit-committee': 'Emphasize control effectiveness, compliance status, and assurance findings. Use precise audit terminology.',
      'management': 'Focus on operational impact, resource requirements, and accountability. Be direct and action-oriented.',
      'technical': 'Include technical details, system names, and specific control mechanisms. Use appropriate technical terminology.'
    }
  };

  // Build formatting instruction string
  function getFormattingInstructions(sectionType, audience) {
    var instructions = '\\n\\nFORMATTING REQUIREMENTS:\\n';
    instructions += formattingGuidelines.base.join('\\n');

    if (sectionType && formattingGuidelines.sections[sectionType]) {
      var section = formattingGuidelines.sections[sectionType];
      instructions += '\\n\\nSECTION STRUCTURE:\\n';
      instructions += section.structure.join('\\n');
      instructions += '\\n\\nTONE: ' + section.tone;
    }

    if (audience && formattingGuidelines.audiences[audience]) {
      instructions += '\\n\\nAUDIENCE GUIDANCE: ' + formattingGuidelines.audiences[audience];
    }

    return instructions;
  }

  // ========================================
  // PROMPT TEMPLATES - Enhanced with detailed instructions
  // ========================================

  var promptTemplates = {
    'rewrite': function(text, context) {
      return 'TASK: Rewrite the following text with improved clarity, flow, and professional polish.\n\n' +
        'REQUIREMENTS:\n' +
        '- Preserve the exact meaning and all data/numbers\n' +
        '- Improve sentence structure and word choice\n' +
        '- Use active voice where appropriate\n' +
        '- Ensure professional tone for executive audiences\n' +
        '- Keep approximately the same length\n' +
        '- Use **bold** for key terms, findings, and risk levels\n' +
        '- If the text has multiple points, format as bullet list: - **Label:** Description\n\n' +
        'TEXT TO REWRITE:\n"' + text + '"' +
        FORMAT_RULES_COMPACT;
    },

    'expand': function(text, context) {
      var audience = context.audience || 'management';
      return 'TASK: Expand the following text by adding depth, context, and supporting details.\n\n' +
        'REQUIREMENTS:\n' +
        '- Add 2-3 meaningful sentences that enhance understanding\n' +
        '- Provide additional context, implications, or examples\n' +
        '- Maintain consistency with the existing tone and style\n' +
        '- Keep all original numbers and data unchanged\n' +
        '- Target audience: ' + audience + '\n\n' +
        'WHEN EXPANDING, USE THESE STRUCTURES:\n' +
        '- If listing multiple points: use bullet list with **Label:** format\n' +
        '- If describing a process: use numbered list (1. 2. 3.)\n' +
        '- If comparing items: use a markdown table\n' +
        '- For key findings/impacts: use **bold** labels\n\n' +
        'TEXT TO EXPAND:\n"' + text + '"' +
        FORMAT_RULES_FULL;
    },

    'shorten': function(text, context) {
      return 'TASK: Condense the following text while preserving all essential information.\n\n' +
        'REQUIREMENTS:\n' +
        '- Reduce length by approximately 30-40%\n' +
        '- Remove redundant words and phrases\n' +
        '- Preserve ALL numbers, percentages, and key facts\n' +
        '- Maintain professional clarity\n' +
        '- Keep the core message intact\n' +
        '- Use **bold** for key terms and findings\n' +
        '- Convert verbose text to bullet points where appropriate: - **Label:** Description\n\n' +
        'TEXT TO SHORTEN:\n"' + text + '"' +
        FORMAT_RULES_COMPACT;
    },

    'fix-spelling': function(text, context) {
      return 'TASK: Correct all spelling, grammar, and punctuation errors.\n\n' +
        'REQUIREMENTS:\n' +
        '- Fix spelling mistakes\n' +
        '- Correct grammatical errors\n' +
        '- Fix punctuation issues\n' +
        '- Do NOT change writing style or tone\n' +
        '- Do NOT rephrase or rewrite content\n' +
        '- Keep all numbers exactly as they are\n\n' +
        'TEXT TO CORRECT:\n"' + text + '"\n\n' +
        'OUTPUT: Provide ONLY the corrected text. No explanations or preamble.';
    },

    'continue': function(text, context) {
      var section = context.section || 'risk report';
      return 'TASK: Continue writing from where this text ends.\n\n' +
        'CONTEXT: This is for the "' + section + '" section of an enterprise risk management report.\n\n' +
        'REQUIREMENTS:\n' +
        '- Add 2-4 sentences that naturally follow the existing text\n' +
        '- Maintain the same tone, style, and voice\n' +
        '- Build logically on the ideas presented\n' +
        '- Keep professional and authoritative\n' +
        '- Do NOT repeat the original text\n' +
        '- Use **bold** for key terms and findings\n' +
        '- If adding multiple points, use bullet list: - **Label:** Description\n' +
        '- If adding steps, use numbered list: 1. 2. 3.\n\n' +
        'TEXT TO CONTINUE FROM:\n"' + text + '"' +
        FORMAT_RULES_COMPACT;
    },

    'transform-formal': function(text, context) {
      return 'TASK: Transform this text into formal, executive-level language.\n\n' +
        'REQUIREMENTS:\n' +
        '- Use sophisticated, professional vocabulary\n' +
        '- Employ formal sentence structures\n' +
        '- Remove casual or colloquial expressions\n' +
        '- Suitable for board reports and official documentation\n' +
        '- Preserve all numbers and data points exactly\n' +
        '- Use **bold** for key terms, risk ratings, and important findings\n' +
        '- Structure multiple points as: - **Label:** Description\n\n' +
        'TEXT TO TRANSFORM:\n"' + text + '"' +
        FORMAT_RULES_COMPACT;
    },

    'transform-concise': function(text, context) {
      return 'TASK: Make this text maximally concise and direct.\n\n' +
        'REQUIREMENTS:\n' +
        '- Eliminate all filler words and unnecessary phrases\n' +
        '- Use active voice and strong verbs\n' +
        '- Get straight to the point\n' +
        '- Preserve all numbers and key facts\n' +
        '- Every word must add value\n' +
        '- Use **bold** for key terms\n' +
        '- Convert verbose lists to bullet format: - **Label:** Description\n\n' +
        'TEXT TO MAKE CONCISE:\n"' + text + '"' +
        FORMAT_RULES_COMPACT;
    },

    'transform-board': function(text, context) {
      return 'TASK: Rewrite for Board of Directors audience.\n\n' +
        'BOARD COMMUNICATION REQUIREMENTS:\n' +
        '- Focus on strategic implications and governance impact\n' +
        '- Emphasize fiduciary considerations and risk appetite alignment\n' +
        '- Use high-level, strategic language\n' +
        '- Minimize technical jargon - explain if necessary\n' +
        '- Highlight key decisions and oversight matters\n' +
        '- Preserve all numbers exactly\n\n' +
        'FORMAT AS:\n' +
        '- Use **bold** for risk ratings, key metrics, and critical findings\n' +
        '- Structure key points as: - **Label:** Description\n' +
        '- Use tables for comparing risk scores or metrics\n\n' +
        'TEXT TO TRANSFORM:\n"' + text + '"' +
        FORMAT_RULES_COMPACT;
    },

    'transform-audit': function(text, context) {
      return 'TASK: Rewrite for Audit Committee audience.\n\n' +
        'AUDIT COMMITTEE REQUIREMENTS:\n' +
        '- Focus on control effectiveness and testing status\n' +
        '- Emphasize compliance implications and assurance findings\n' +
        '- Use precise audit terminology\n' +
        '- Reference control frameworks where relevant (COSO, SOX)\n' +
        '- Highlight gaps, exceptions, and remediation status\n' +
        '- Preserve all numbers exactly\n\n' +
        'FORMAT AS:\n' +
        '- Use **bold** for control ratings, finding severity, compliance status\n' +
        '- Structure findings as: - **Finding:** Description\n' +
        '- Use tables for control assessments or gap analysis\n\n' +
        'TEXT TO TRANSFORM:\n"' + text + '"' +
        FORMAT_RULES_COMPACT;
    },

    'transform-management': function(text, context) {
      return 'TASK: Rewrite for operational management audience.\n\n' +
        'MANAGEMENT COMMUNICATION REQUIREMENTS:\n' +
        '- Focus on actionable items and next steps\n' +
        '- Emphasize accountability, owners, and timelines\n' +
        '- Highlight operational impact and resource needs\n' +
        '- Use direct, action-oriented language\n' +
        '- Include practical implementation considerations\n' +
        '- Preserve all numbers exactly\n\n' +
        'FORMAT AS:\n' +
        '- Use **bold** for action owners, deadlines, priorities\n' +
        '- Structure actions as: - **Action:** Description (Owner, Due Date)\n' +
        '- Use numbered lists for sequential steps: 1. 2. 3.\n\n' +
        'TEXT TO TRANSFORM:\n"' + text + '"' +
        FORMAT_RULES_COMPACT;
    },

    'transform-plain': function(text, context) {
      return 'TASK: Rewrite in plain, accessible language.\n\n' +
        'PLAIN LANGUAGE REQUIREMENTS:\n' +
        '- Use simple, everyday words\n' +
        '- Avoid jargon and technical terms\n' +
        '- Explain any necessary technical concepts clearly\n' +
        '- Use short sentences and paragraphs\n' +
        '- Make it understandable for any reader\n' +
        '- Preserve all numbers exactly\n\n' +
        'FORMAT AS:\n' +
        '- Use **bold** for important points\n' +
        '- Use simple bullet lists: - Point one\n' +
        '- Keep formatting minimal and clear\n\n' +
        'TEXT TO SIMPLIFY:\n"' + text + '"' +
        FORMAT_RULES_COMPACT;
    },

    'ask-ai': function(text, context) {
      var prompt = '';
      var hasContext = context.section || context.selectedText || context.reportName;

      // Only mention report context if we actually have context
      if (hasContext) {
        prompt = 'CONTEXT: You are assisting with an enterprise risk management report.\n';
        if (context.reportName) {
          prompt += 'Report: "' + context.reportName + '"\n';
        }
        if (context.section) {
          prompt += 'Current section: "' + context.section + '"\n';
        }
        if (context.selectedText) {
          prompt += 'Selected text: "' + context.selectedText + '"\n';
        }
        prompt += '\n';
      }

      prompt += 'USER QUESTION: ' + text + '\n\n';

      prompt += 'RESPOND USING PROPER STRUCTURE:\n' +
        '- Use **bold** for key terms and important concepts\n' +
        '- Use bullet lists (- **Label:** Description) for multiple points\n' +
        '- Use numbered lists (1. 2. 3.) for steps or sequences\n' +
        '- Use markdown tables when comparing data or showing categories\n' +
        '- Use ## or ### headings to organize longer responses\n';

      prompt += FORMAT_RULES_FULL;

      return prompt;
    },

    // Generate full report section from description
    'describe-report': function(text, context) {
      var sectionType = context.sectionType || 'executive-summary';
      var audience = context.audience || 'management';
      var reportType = context.reportType || 'risk assessment';

      var prompt = 'You are an expert enterprise risk management report writer. Generate a professional ' + reportType + ' report section based on the following description.\n\n';
      prompt += 'USER DESCRIPTION:\n"' + text + '"\n\n';

      if (context.reportName) {
        prompt += 'REPORT NAME: ' + context.reportName + '\n';
      }
      if (context.department) {
        prompt += 'DEPARTMENT/AREA: ' + context.department + '\n';
      }
      if (context.riskData) {
        prompt += 'RISK DATA PROVIDED:\n' + JSON.stringify(context.riskData, null, 2) + '\n';
      }

      prompt += getFormattingInstructions(sectionType, audience);
      prompt += FORMAT_RULES_FULL;
      prompt += '\n\nGenerate the report content now. Start directly with content, no preamble.';

      return prompt;
    },

    // Generate specific report section
    'generate-section': function(text, context) {
      var sectionType = context.sectionType || 'risk-assessment';
      var audience = context.audience || 'management';

      var prompt = 'Generate a professional ' + sectionType.replace(/-/g, ' ') + ' section for an enterprise risk management report.\n\n';
      prompt += 'CONTEXT/INPUT:\n"' + text + '"\n';

      if (context.existingContent) {
        prompt += '\nEXISTING REPORT CONTENT FOR REFERENCE:\n' + context.existingContent + '\n';
      }

      prompt += getFormattingInstructions(sectionType, audience);
      prompt += FORMAT_RULES_FULL;
      prompt += '\n\nGenerate the section content now. Start directly with content, no preamble.';

      return prompt;
    },

    // Enhance/improve existing report content
    'enhance-report': function(text, context) {
      var audience = context.audience || 'management';

      var prompt = 'You are an expert risk management editor. Enhance and improve the following report content while maintaining its core message and all data points.\n\n';
      prompt += 'CURRENT CONTENT:\n"' + text + '"\n\n';
      prompt += 'IMPROVEMENTS TO MAKE:\n';
      prompt += '- Improve clarity and professional tone\n';
      prompt += '- Add appropriate structure with headings and subheadings\n';
      prompt += '- Format lists and key points properly\n';
      prompt += '- Strengthen executive language\n';
      prompt += '- Ensure logical flow between sections\n';

      prompt += getFormattingInstructions(null, audience);
      prompt += FORMAT_RULES_FULL;
      prompt += '\n\nOutput the enhanced content now. Start directly with content, no preamble.';

      return prompt;
    }
  };

  // ========================================
  // USER-FRIENDLY ERROR MESSAGES
  // ========================================

  var ERROR_MESSAGES = {
    network: 'Unable to connect to AI service. Please check if the server is running on localhost:3000',
    timeout: 'AI request timed out. The server may be busy - please try again.',
    proxy: 'Cannot reach AI proxy server. Make sure to run "npm start" in the server folder.',
    api_key: 'Invalid API key. Please check your DeepSeek API key in settings.',
    rate_limit: 'Too many requests. Please wait a moment and try again.',
    server: 'AI server error. Please try again in a few seconds.',
    parse: 'Received invalid response from AI. Please try again.',
    unknown: 'Something went wrong. Please try again.'
  };

  function getFriendlyError(status, responseText) {
    if (status === 0) {
      return ERROR_MESSAGES.proxy;
    }
    if (status === 401) {
      return ERROR_MESSAGES.api_key;
    }
    if (status === 429) {
      return ERROR_MESSAGES.rate_limit;
    }
    if (status >= 500) {
      return ERROR_MESSAGES.server;
    }

    // Try to extract error message from response
    try {
      var errorResponse = JSON.parse(responseText);
      if (errorResponse.error && errorResponse.error.message) {
        return errorResponse.error.message;
      }
    } catch (e) {}

    return ERROR_MESSAGES.unknown;
  }

  // ========================================
  // API CALL WITH RETRY AND TIMEOUT
  // ========================================

  ERM.aiService.callAPI = function(prompt, callback, options) {
    options = options || {};
    var retryCount = 0;
    var maxRetries = options.maxRetries || config.maxRetries;
    var timeout = options.timeout || config.timeout;
    var useToolbarPersona = options.useToolbarPersona || false;

    // Check AI call limit before proceeding
    if (ERM.aiCounter) {
      var canCall = ERM.aiCounter.canMakeCall();
      if (!canCall.allowed) {
        // Show limit modal and return error
        ERM.aiCounter.showLimitModal();
        callback({
          error: canCall.message + ' ' + canCall.upgradeMessage,
          limitReached: true
        });
        return;
      }
    }

    if (!config.apiKey) {
      callback({ error: 'No API key configured. Please set your DeepSeek API key in settings.' });
      return;
    }

    // Build system message with appropriate persona
    var systemMessage = AI_PERSONA.system;
    if (useToolbarPersona) {
      systemMessage += '\n\n' + AI_PERSONA.toolbar;
    }

    function makeRequest() {
      var requestBody = {
        model: options.model || config.model,
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || config.maxTokens,
        temperature: options.temperature !== undefined ? options.temperature : config.temperature,
        stream: false
      };

      var xhr = new XMLHttpRequest();
      var url = config.useProxy ? config.proxyUrl : (config.baseUrl + '/chat/completions');
      var timeoutId = null;
      var completed = false;

      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', 'Bearer ' + config.apiKey);

      // Set up timeout
      timeoutId = setTimeout(function() {
        if (!completed) {
          completed = true;
          xhr.abort();
          console.warn('[AIService] Request timed out after ' + timeout + 'ms');

          // Retry on timeout
          if (retryCount < maxRetries) {
            retryCount++;
            console.log('[AIService] Retrying... attempt ' + (retryCount + 1));
            setTimeout(makeRequest, 1000); // Wait 1 second before retry
          } else {
            callback({ error: ERROR_MESSAGES.timeout });
          }
        }
      }, timeout);

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && !completed) {
          completed = true;
          clearTimeout(timeoutId);

          if (xhr.status === 200) {
            try {
              var response = JSON.parse(xhr.responseText);
              var text = response.choices && response.choices[0] && response.choices[0].message
                ? response.choices[0].message.content
                : '';

              // Increment AI counter when API call succeeds
              if (typeof ERM.aiCounter !== "undefined" && ERM.aiCounter.increment) {
                var counterResult = ERM.aiCounter.increment();
                console.log("[AIService] AI call counted:", counterResult);
                if (ERM.aiCounter.updateDisplays) {
                  ERM.aiCounter.updateDisplays();
                }
                // Show warning if near limit
                if (counterResult && counterResult.remaining <= 5 && counterResult.remaining > 0) {
                  if (typeof ERM.toast !== "undefined") {
                    ERM.toast.warning("Only " + counterResult.remaining + " AI calls remaining on free plan");
                  }
                }
              }

              // Log activity for analytics with usage info
              if (typeof ERM.activityLogger !== "undefined" && ERM.activityLogger.log) {
                var currentCount = ERM.aiCounter ? ERM.aiCounter.getCount() : 0;
                var limit = ERM.aiCounter ? ERM.aiCounter.getLimit() : 50;
                var displayText = limit === -1 ? currentCount + ' calls' : currentCount + ' of ' + limit;

                ERM.activityLogger.log(
                  "ai",
                  "ai_call",
                  "ai",
                  "AI call made (" + displayText + ")",
                  {
                    feature: "deepseek-api",
                    count: currentCount,
                    limit: limit
                  }
                );
              }

              // Update notification badge immediately
              if (typeof ERM.components !== "undefined" && ERM.components.updateNotificationBadge) {
                setTimeout(function() {
                  ERM.components.updateNotificationBadge();
                }, 100);
              }

              callback({ success: true, text: text.trim() });
            } catch (e) {
              console.error('[AIService] Parse error:', e);
              callback({ error: ERROR_MESSAGES.parse });
            }
          } else if (xhr.status === 0) {
            // Network error or CORS - likely proxy not running
            console.error('[AIService] Network/proxy error - status 0');
            if (retryCount < maxRetries) {
              retryCount++;
              console.log('[AIService] Retrying... attempt ' + (retryCount + 1));
              setTimeout(makeRequest, 1000);
            } else {
              callback({ error: ERROR_MESSAGES.proxy });
            }
          } else {
            console.error('[AIService] API error:', xhr.status, xhr.responseText);
            var errorMsg = getFriendlyError(xhr.status, xhr.responseText);

            // Retry on server errors
            if (xhr.status >= 500 && retryCount < maxRetries) {
              retryCount++;
              console.log('[AIService] Server error, retrying... attempt ' + (retryCount + 1));
              setTimeout(makeRequest, 2000); // Wait 2 seconds before retry on server error
            } else {
              callback({ error: errorMsg });
            }
          }
        }
      };

      xhr.onerror = function() {
        if (!completed) {
          completed = true;
          clearTimeout(timeoutId);
          console.error('[AIService] Network error');

          if (retryCount < maxRetries) {
            retryCount++;
            console.log('[AIService] Network error, retrying... attempt ' + (retryCount + 1));
            setTimeout(makeRequest, 1000);
          } else {
            callback({ error: ERROR_MESSAGES.network });
          }
        }
      };

      console.log('[AIService] Sending request to:', url);
      xhr.send(JSON.stringify(requestBody));
    }

    // Start the first request
    makeRequest();
  };

  // ========================================
  // CHECK SERVER STATUS
  // ========================================

  ERM.aiService.checkServerStatus = function(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/health', true);
    xhr.timeout = 5000;

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          callback({ online: true });
        } else {
          callback({ online: false, error: 'Server not responding' });
        }
      }
    };

    xhr.onerror = function() {
      callback({ online: false, error: 'Cannot connect to server. Run "npm start" in the server folder.' });
    };

    xhr.ontimeout = function() {
      callback({ online: false, error: 'Server connection timed out' });
    };

    xhr.send();
  };

  // ========================================
  // ACTION HANDLERS
  // ========================================

  ERM.aiService.executeAction = function(action, selectedText, context, callback) {
    var self = this;
    var promptBuilder = promptTemplates[action];

    if (!promptBuilder) {
      callback({ error: 'Unknown action: ' + action });
      return;
    }

    // First check if server is available
    this.checkServerStatus(function(status) {
      if (!status.online) {
        callback({ error: status.error || ERROR_MESSAGES.proxy });
        return;
      }

      var prompt = promptBuilder(selectedText, context || {});

      console.log('[AIService] Executing action:', action);

      self.callAPI(prompt, function(result) {
        if (result.error) {
          callback({ error: result.error });
        } else {
          callback({
            success: true,
            text: result.text,
            action: action,
            originalText: selectedText
          });
        }
      }, {
        temperature: action === 'fix-spelling' ? 0.1 : 0.7, // Lower temp for spelling fixes
        useToolbarPersona: true, // Use enhanced toolbar formatting
        timeout: 45000 // 45 second timeout for toolbar actions
      });
    });
  };

  ERM.aiService.askQuestion = function(question, context, callback) {
    var self = this;

    // First check if server is available
    this.checkServerStatus(function(status) {
      if (!status.online) {
        callback({ error: status.error || ERROR_MESSAGES.proxy });
        return;
      }

      var prompt = promptTemplates['ask-ai'](question, context || {});

      console.log('[AIService] Ask AI:', question);

      self.callAPI(prompt, function(result) {
        if (result.error) {
          callback({ error: result.error });
        } else {
          callback({
            success: true,
            text: result.text,
            question: question
          });
        }
      }, {
        maxTokens: 2048,
        temperature: 0.7,
        useToolbarPersona: true, // Use enhanced formatting
        timeout: 60000 // 60 second timeout for questions
      });
    });
  };

  // ========================================
  // REPORT GENERATION (Describe with AI)
  // ========================================

  /**
   * Generate a full report from a user description
   * @param {string} description - User's description of what they want
   * @param {object} options - Configuration options
   * @param {function} callback - Callback with result
   */
  ERM.aiService.generateReport = function(description, options, callback) {
    options = options || {};

    var context = {
      sectionType: options.sectionType || 'executive-summary',
      audience: options.audience || 'management',
      reportType: options.reportType || 'risk assessment',
      reportName: options.reportName || '',
      department: options.department || '',
      riskData: options.riskData || null
    };

    var prompt = promptTemplates['describe-report'](description, context);

    console.log('[AIService] Generating report from description');

    this.callAPI(prompt, function(result) {
      if (result.error) {
        callback({ error: result.error });
      } else {
        callback({
          success: true,
          html: result.text,
          sectionType: context.sectionType,
          audience: context.audience
        });
      }
    }, {
      maxTokens: 4096,
      temperature: 0.7
    });
  };

  /**
   * Generate a specific section for a report
   * @param {string} input - Context or input for the section
   * @param {string} sectionType - Type of section to generate
   * @param {object} options - Additional options
   * @param {function} callback - Callback with result
   */
  ERM.aiService.generateSection = function(input, sectionType, options, callback) {
    options = options || {};

    var context = {
      sectionType: sectionType,
      audience: options.audience || 'management',
      existingContent: options.existingContent || ''
    };

    var prompt = promptTemplates['generate-section'](input, context);

    console.log('[AIService] Generating section:', sectionType);

    this.callAPI(prompt, function(result) {
      if (result.error) {
        callback({ error: result.error });
      } else {
        callback({
          success: true,
          html: result.text,
          sectionType: sectionType
        });
      }
    }, {
      maxTokens: 3072,
      temperature: 0.7
    });
  };

  /**
   * Enhance existing report content
   * @param {string} content - Existing content to enhance
   * @param {object} options - Configuration options
   * @param {function} callback - Callback with result
   */
  ERM.aiService.enhanceReport = function(content, options, callback) {
    options = options || {};

    var context = {
      audience: options.audience || 'management'
    };

    var prompt = promptTemplates['enhance-report'](content, context);

    console.log('[AIService] Enhancing report content');

    this.callAPI(prompt, function(result) {
      if (result.error) {
        callback({ error: result.error });
      } else {
        callback({
          success: true,
          html: result.text,
          originalContent: content
        });
      }
    }, {
      maxTokens: 4096,
      temperature: 0.6
    });
  };

  /**
   * Get available section types for report generation
   */
  ERM.aiService.getSectionTypes = function() {
    return Object.keys(formattingGuidelines.sections);
  };

  /**
   * Get available audience types
   */
  ERM.aiService.getAudienceTypes = function() {
    return Object.keys(formattingGuidelines.audiences);
  };

  // ========================================
  // UTILITY
  // ========================================

  ERM.aiService.testConnection = function(callback) {
    if (!config.apiKey) {
      callback({ error: 'No API key configured' });
      return;
    }

    this.callAPI('Say "Connection successful" in exactly those words.', function(result) {
      if (result.error) {
        callback({ success: false, error: result.error });
      } else {
        callback({ success: true, message: 'DeepSeek API connected successfully' });
      }
    }, {
      maxTokens: 50,
      temperature: 0
    });
  };

  // ========================================
  // GENERATE TEXT - General purpose text generation
  // Used by floating AI chat and other modules
  // ========================================

  /**
   * Generate text using the AI service
   * @param {string} prompt - The user prompt
   * @param {object} options - Configuration options
   * @param {function} callback - Callback with result
   */
  ERM.aiService.generateText = function(prompt, options, callback) {
    options = options || {};

    // Check AI call limit before proceeding
    if (ERM.aiCounter) {
      var canCall = ERM.aiCounter.canMakeCall();
      if (!canCall.allowed) {
        // Show limit modal and return error
        ERM.aiCounter.showLimitModal();
        callback({
          error: canCall.message + ' ' + canCall.upgradeMessage,
          limitReached: true
        });
        return;
      }
    }

    if (!config.apiKey) {
      callback({ error: 'No API key configured. Please set your DeepSeek API key in settings.' });
      return;
    }

    var systemMessage = options.systemPrompt || AI_PERSONA.system;

    var requestBody = {
      model: options.model || config.model,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: options.maxTokens || config.maxTokens,
      temperature: options.temperature !== undefined ? options.temperature : config.temperature,
      stream: false
    };

    var xhr = new XMLHttpRequest();
    var url = config.useProxy ? config.proxyUrl : (config.baseUrl + '/chat/completions');
    var timeout = options.timeout || config.timeout;
    var timeoutId = null;
    var completed = false;

    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + config.apiKey);

    // Set up timeout
    timeoutId = setTimeout(function() {
      if (!completed) {
        completed = true;
        xhr.abort();
        console.warn('[AIService] generateText timed out after ' + timeout + 'ms');
        callback({ error: ERROR_MESSAGES.timeout });
      }
    }, timeout);

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && !completed) {
        completed = true;
        clearTimeout(timeoutId);

        if (xhr.status === 200) {
          try {
            var response = JSON.parse(xhr.responseText);
            var text = response.choices && response.choices[0] && response.choices[0].message
              ? response.choices[0].message.content
              : '';

            // Increment AI counter when API call succeeds
            if (typeof ERM.aiCounter !== "undefined" && ERM.aiCounter.increment) {
              var counterResult = ERM.aiCounter.increment();
              console.log("[AIService] generateText AI call counted:", counterResult);
              if (ERM.aiCounter.updateDisplays) {
                ERM.aiCounter.updateDisplays();
              }
              // Show warning if near limit
              if (counterResult && counterResult.remaining <= 5 && counterResult.remaining > 0) {
                if (typeof ERM.toast !== "undefined") {
                  ERM.toast.warning("Only " + counterResult.remaining + " AI calls remaining on free plan");
                }
              }
            }

            // Log activity for analytics with usage info
            if (typeof ERM.activityLogger !== "undefined" && ERM.activityLogger.log) {
              var currentCount = ERM.aiCounter ? ERM.aiCounter.getCount() : 0;
              var limit = ERM.aiCounter ? ERM.aiCounter.getLimit() : 50;
              var displayText = limit === -1 ? currentCount + ' calls' : currentCount + ' of ' + limit;

              ERM.activityLogger.log(
                "ai",
                "ai_call",
                "ai",
                "AI call made (" + displayText + ")",
                {
                  feature: "deepseek-generatetext",
                  count: currentCount,
                  limit: limit
                }
              );
            }

            // Update notification badge immediately
            if (typeof ERM.components !== "undefined" && ERM.components.updateNotificationBadge) {
              setTimeout(function() {
                ERM.components.updateNotificationBadge();
              }, 100);
            }

            callback({ success: true, text: text.trim() });
          } catch (e) {
            console.error('[AIService] generateText parse error:', e);
            callback({ error: ERROR_MESSAGES.parse });
          }
        } else if (xhr.status === 0) {
          console.error('[AIService] generateText network/proxy error');
          callback({ error: ERROR_MESSAGES.proxy });
        } else {
          console.error('[AIService] generateText API error:', xhr.status, xhr.responseText);
          var errorMsg = getFriendlyError(xhr.status, xhr.responseText);
          callback({ error: errorMsg });
        }
      }
    };

    xhr.onerror = function() {
      if (!completed) {
        completed = true;
        clearTimeout(timeoutId);
        console.error('[AIService] generateText network error');
        callback({ error: ERROR_MESSAGES.network });
      }
    };

    console.log('[AIService] generateText sending request to:', url);
    xhr.send(JSON.stringify(requestBody));
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      ERM.aiService.init();
    });
  } else {
    ERM.aiService.init();
  }

  console.log('[AIService] Module loaded');

})();

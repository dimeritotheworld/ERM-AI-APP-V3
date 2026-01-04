/**
 * Report Editor AI Module (Shared)
 * Ask AI functionality shared by old and V2 editors
 * ES5 Compatible
 */

(function() {
  'use strict';

  window.ERM = window.ERM || {};
  ERM.reportEditorAI = ERM.reportEditorAI || {};

  // ========================================
  // STATE MANAGEMENT
  // ========================================

  var state = {
    selection: null,
    selectionRange: null,
    activeBlock: null,
    aiPanelVisible: false,
    highlightElement: null,
    highlightElements: [],  // Array for multi-element selections
    pendingAIResult: null,
    lastAskAIQuestion: null,
    currentReport: null
  };

  // ========================================
  // BLOCK TYPES
  // ========================================

  var blockTypes = {
    'executive-summary': { label: 'Executive Summary', placeholder: 'Summarise the key risk insights and recommendations...' },
    'risk-overview': { label: 'Risk Overview', placeholder: 'Describe the current risk landscape...' },
    'heatmap-commentary': { label: 'Heatmap Commentary', placeholder: 'Interpret the inherent and residual risk distribution...' },
    'category-commentary': { label: 'Category Commentary', placeholder: 'Analyse risk distribution across categories...' },
    'top-risks-narrative': { label: 'Top Risks Narrative', placeholder: 'Commentary on the most significant risks...' },
    'control-commentary': { label: 'Control Presence Commentary', placeholder: 'Assess control coverage and gaps...' },
    'escalation-commentary': { label: 'Escalation Commentary', placeholder: 'Summarise escalated risks and required actions...' },
    'conclusion': { label: 'Conclusion & Next Steps', placeholder: 'Outline recommendations and next steps...' }
  };

  // ========================================
  // PUBLIC API - State Setters
  // ========================================

  ERM.reportEditorAI.setState = function(key, value) {
    state[key] = value;
  };

  ERM.reportEditorAI.getState = function(key) {
    return state[key];
  };

  // ========================================
  // HIDE FLOATING TOOLBAR (for V2 compatibility)
  // ========================================

  ERM.reportEditorAI.hideFloatingToolbar = function() {
    var toolbar = document.getElementById('report-floating-toolbar');
    if (toolbar) {
      toolbar.classList.remove('visible');
    }
  };

  // ========================================
  // GET REPORT CONTEXT
  // ========================================

  ERM.reportEditorAI.getReportContext = function() {
    var context = {
      section: null,
      audience: 'management'
    };

    // Try to get report name from state first
    if (state.currentReport) {
      context.reportName = state.currentReport.name;
      context.reportType = state.currentReport.type;
    } else {
      // Fallback: try to get report name from DOM
      var reportTitle = document.querySelector('.report-title, .report-name, [data-report-name], h1.report-header, .editor-report-title, .editor-v2-header-title');
      if (reportTitle) {
        context.reportName = reportTitle.textContent.trim() || reportTitle.getAttribute('data-report-name');
      }
      // Also check for modal/page title
      if (!context.reportName) {
        var modalTitle = document.querySelector('.modal-title, .page-title');
        if (modalTitle && modalTitle.textContent.indexOf('Report') > -1) {
          context.reportName = modalTitle.textContent.trim();
        }
      }
    }

    // Try to get section from active block
    if (state.activeBlock) {
      var blockType = state.activeBlock.getAttribute('data-block-type');
      context.section = blockTypes[blockType] ? blockTypes[blockType].label : blockType;

      // Also try to get section from block header or label
      if (!context.section || context.section === 'Section') {
        var blockHeader = state.activeBlock.querySelector('.block-header, .block-label, .section-title');
        if (blockHeader) {
          context.section = blockHeader.textContent.trim();
        }
      }
    }

    // Fallback: try to find section from parent elements or nearby headings
    if (!context.section && state.selectionRange) {
      var node = state.selectionRange.commonAncestorContainer;
      while (node && node !== document.body) {
        if (node.nodeType === 1) {
          // Check for section title in parent
          var sectionTitle = node.querySelector && node.querySelector('h2, h3, .section-title, .block-label');
          if (sectionTitle) {
            context.section = sectionTitle.textContent.trim();
            break;
          }
          // Check for data attributes
          var sectionAttr = node.getAttribute && (node.getAttribute('data-section') || node.getAttribute('data-block-type'));
          if (sectionAttr) {
            context.section = blockTypes[sectionAttr] ? blockTypes[sectionAttr].label : sectionAttr;
            break;
          }
        }
        node = node.parentNode;
      }
    }

    return context;
  };

  // ========================================
  // API KEY PROMPT
  // ========================================

  ERM.reportEditorAI.showApiKeyPrompt = function() {
    var currentKey = ERM.storage ? ERM.storage.get('deepseekApiKey') || '' : '';

    ERM.modals.prompt({
      title: 'DeepSeek API Key Required',
      message: 'Enter your DeepSeek API key to enable AI features. You can get one from deepseek.com',
      placeholder: 'sk-...',
      value: currentKey,
      confirmText: 'Save',
      onConfirm: function(apiKey) {
        if (apiKey && apiKey.trim()) {
          ERM.aiService.setApiKey(apiKey.trim());
          ERM.toast.success('API key saved');
        }
      }
    });
  };

  // ========================================
  // SELECTION HIGHLIGHTING & PERSISTENCE
  // ========================================

  /**
   * Highlight the selected text to show what will be affected by AI.
   * The highlight persists while the Ask AI panel is open.
   * CRITICAL: This must remain visible for the entire AI interaction.
   *
   * This version properly handles:
   * - Cross-element selections (lists, multiple paragraphs)
   * - Text nodes split across boundaries
   * - Nested elements within the selection
   */
  ERM.reportEditorAI.highlightSelection = function() {
    console.log('[AI] highlightSelection called, selection:', state.selection, 'range:', state.selectionRange);
    if (!state.selectionRange || !state.selection) {
      console.log('[AI] highlightSelection early return - no selection/range');
      return;
    }

    try {
      // Remove any existing highlights first
      this.unhighlightSelection();

      // Store the original selection text for later use
      state.originalSelectionText = state.selection;

      // Clone the range to work with
      var range = state.selectionRange.cloneRange();

      // Get all text nodes within the selection range
      var textNodes = [];
      var startContainer = range.startContainer;
      var endContainer = range.endContainer;
      var startOffset = range.startOffset;
      var endOffset = range.endOffset;

      // Helper to check if node is a text node
      function isTextNode(node) {
        return node && node.nodeType === 3;
      }

      // Helper to find common ancestor that contains both endpoints
      var commonAncestor = range.commonAncestorContainer;
      if (commonAncestor.nodeType === 3) {
        commonAncestor = commonAncestor.parentNode;
      }

      // Walk through all text nodes in the selection range
      var walker = document.createTreeWalker(
        commonAncestor,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      var foundStart = false;
      var node;
      while ((node = walker.nextNode())) {
        // Check if we've reached the start of selection
        if (node === startContainer) {
          foundStart = true;
        }

        // Add text nodes that are within the selection
        if (foundStart) {
          textNodes.push(node);
        }

        // Check if we've reached the end
        if (node === endContainer) {
          break;
        }
      }

      // If no text nodes found, try simple approach
      if (textNodes.length === 0 && isTextNode(startContainer)) {
        textNodes.push(startContainer);
      }

      // Wrap each text node (or portion) in highlight span
      var highlightElements = [];

      for (var i = 0; i < textNodes.length; i++) {
        var textNode = textNodes[i];
        var parent = textNode.parentNode;
        if (!parent) continue;

        // Skip if already inside a highlight
        if (parent.classList && parent.classList.contains('ai-selection-highlight')) continue;

        // Determine which portion of this text node to highlight
        var text = textNode.nodeValue || '';
        var highlightStart = 0;
        var highlightEnd = text.length;

        // First text node - start from selection start offset
        if (textNode === startContainer) {
          highlightStart = startOffset;
        }

        // Last text node - end at selection end offset
        if (textNode === endContainer) {
          highlightEnd = endOffset;
        }

        // Only highlight if there's actual text to highlight
        if (highlightEnd <= highlightStart) continue;

        // Create highlight span
        var highlightSpan = document.createElement('span');
        highlightSpan.className = 'ai-selection-highlight';
        highlightSpan.setAttribute('data-ai-highlight', 'true');

        // Split text node if needed and wrap the highlighted portion
        var beforeText = text.substring(0, highlightStart);
        var highlightText = text.substring(highlightStart, highlightEnd);
        var afterText = text.substring(highlightEnd);

        // Create document fragment with the split parts
        var frag = document.createDocumentFragment();

        if (beforeText) {
          frag.appendChild(document.createTextNode(beforeText));
        }

        highlightSpan.textContent = highlightText;
        frag.appendChild(highlightSpan);
        highlightElements.push(highlightSpan);

        if (afterText) {
          frag.appendChild(document.createTextNode(afterText));
        }

        // Replace the original text node with the fragment
        parent.replaceChild(frag, textNode);
      }

      // Store reference to first highlight element (for Replace action)
      state.highlightElement = highlightElements.length > 0 ? highlightElements[0] : null;

      // Store all highlight elements for multi-element selections
      state.highlightElements = highlightElements;

      // Create a new range spanning all highlights for Replace functionality
      if (highlightElements.length > 0) {
        var newRange = document.createRange();
        newRange.setStartBefore(highlightElements[0]);
        newRange.setEndAfter(highlightElements[highlightElements.length - 1]);
        state.selectionRange = newRange;
      }

      console.log('[ReportEditorAI] Selection highlighted across', highlightElements.length, 'text nodes');
      console.log('[ReportEditorAI] Highlight elements:', highlightElements);
      // Verify highlights are in DOM
      var inDOM = document.querySelectorAll('.ai-selection-highlight[data-ai-highlight]');
      console.log('[ReportEditorAI] Highlights found in DOM:', inDOM.length);
    } catch (e) {
      console.log('[ReportEditorAI] Could not highlight selection:', e.message);
      // Fallback: try simple approach for single-node selections
      this.highlightSelectionSimple();
    }
  };

  /**
   * Simple fallback highlighting for single-node selections
   */
  ERM.reportEditorAI.highlightSelectionSimple = function() {
    if (!state.selectionRange || !state.selection) return;

    try {
      var highlightSpan = document.createElement('span');
      highlightSpan.className = 'ai-selection-highlight';
      highlightSpan.setAttribute('data-ai-highlight', 'true');
      highlightSpan.setAttribute('data-original-text', state.selection);

      var range = state.selectionRange.cloneRange();
      range.surroundContents(highlightSpan);

      state.highlightElement = highlightSpan;
      state.highlightElements = [highlightSpan];

      var newRange = document.createRange();
      newRange.selectNodeContents(highlightSpan);
      state.selectionRange = newRange;

      console.log('[ReportEditorAI] Selection highlighted (simple):', state.selection.substring(0, 50));
    } catch (e) {
      console.log('[ReportEditorAI] Simple highlight also failed:', e.message);
    }
  };

  /**
   * Remove selection highlight.
   * Called when AI panel closes or after applying AI result.
   */
  ERM.reportEditorAI.unhighlightSelection = function() {
    console.log('[AI] unhighlightSelection called');
    console.trace('[AI] unhighlightSelection stack trace');
    // Remove all highlight spans
    var highlights = document.querySelectorAll('.ai-selection-highlight[data-ai-highlight]');
    console.log('[AI] Found', highlights.length, 'highlight spans to remove');
    var parentsToNormalize = [];

    for (var i = 0; i < highlights.length; i++) {
      var highlight = highlights[i];
      var parent = highlight.parentNode;
      if (!parent) continue;

      // Track parents for later normalization
      if (parentsToNormalize.indexOf(parent) === -1) {
        parentsToNormalize.push(parent);
      }

      // Move children out and remove the span
      while (highlight.firstChild) {
        parent.insertBefore(highlight.firstChild, highlight);
      }
      parent.removeChild(highlight);
    }

    // Normalize all affected parents to merge adjacent text nodes
    for (var j = 0; j < parentsToNormalize.length; j++) {
      if (parentsToNormalize[j] && parentsToNormalize[j].normalize) {
        parentsToNormalize[j].normalize();
      }
    }

    state.highlightElement = null;
    state.highlightElements = [];
  };

  /**
   * Get the currently highlighted element (if any)
   * Used by Replace action to know exactly what to replace
   */
  ERM.reportEditorAI.getHighlightElement = function() {
    return state.highlightElement;
  };

  // ========================================
  // ASK AI PANEL
  // ========================================

  /**
   * Close all toolbar panels (mutual exclusion)
   * Only one panel should be open at a time
   * @param {boolean} keepHighlight - If true, don't remove selection highlight
   */
  ERM.reportEditorAI.closeAllPanels = function(keepHighlight) {
    // Close Ask AI panel
    var askAiPanel = document.getElementById('ask-ai-panel');
    if (askAiPanel) askAiPanel.classList.remove('visible');

    // Close Turn Into dropdown
    var turnIntoDropdown = document.getElementById('turn-into-dropdown');
    if (turnIntoDropdown) turnIntoDropdown.classList.remove('visible');

    // Close Comment composer
    var commentComposer = document.getElementById('comment-composer');
    if (commentComposer) commentComposer.classList.remove('visible');

    // Close AI dropdown (hamburger menu)
    var aiDropdown = document.getElementById('ai-dropdown');
    if (aiDropdown) aiDropdown.classList.remove('visible');

    // Close AI Actions dropdown (from floating toolbar)
    var aiActionsDropdown = document.getElementById('ai-actions-dropdown');
    if (aiActionsDropdown) aiActionsDropdown.classList.remove('visible');

    // Close floating toolbar
    var floatingToolbar = document.getElementById('report-floating-toolbar');
    if (floatingToolbar) floatingToolbar.classList.remove('visible');

    // Remove any selection highlight (unless keepHighlight is true or AI response is visible)
    var aiResponsePanel = document.getElementById('ai-inline-response');
    var aiResponseVisible = aiResponsePanel && aiResponsePanel.classList.contains('visible');
    if (!keepHighlight && !aiResponseVisible) {
      this.unhighlightSelection();
    }

    // Reset state
    state.aiPanelVisible = false;
  };

  ERM.reportEditorAI.showAskAIPanel = function() {
    var self = this;

    // Close all other panels first (mutual exclusion)
    // Keep highlight since we're opening Ask AI panel with selected text
    this.closeAllPanels(true);

    // Get active block from V2 editor or find from selection
    state.activeBlock = null;
    if (ERM.reportEditorV2 && ERM.reportEditorV2.getActiveBlock) {
      state.activeBlock = ERM.reportEditorV2.getActiveBlock();
    }
    // Fallback: find block from current selection
    if (!state.activeBlock) {
      var selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        var range = selection.getRangeAt(0);
        var node = range.commonAncestorContainer;
        if (node.nodeType === 3) node = node.parentNode;
        state.activeBlock = node.closest('.editor-v2-block');
      }
    }
    // Final fallback: find focused block
    if (!state.activeBlock) {
      var focused = document.activeElement;
      if (focused) {
        state.activeBlock = focused.closest('.editor-v2-block');
      }
    }

    console.log('[ReportEditorAI] Active block set:', state.activeBlock ? state.activeBlock.getAttribute('data-block-id') : 'none');

    var panel = document.getElementById('ask-ai-panel');

    if (!panel) {
      panel = this.createAskAIPanel();
      document.body.appendChild(panel);
    }

    // Update context chips
    this.updateAskAIContext(panel);

    // Position panel relative to toolbar or selection
    // Simple approach: position below the floating toolbar
    var panelWidth = 380;
    var margin = 16;
    var gap = 8;
    var left, top;

    // Try to position relative to the floating toolbar first (most reliable)
    var toolbar = document.getElementById('report-floating-toolbar');
    if (toolbar && toolbar.classList.contains('visible')) {
      var toolbarRect = toolbar.getBoundingClientRect();
      left = toolbarRect.left;
      top = toolbarRect.bottom + gap;
    }
    // Fallback: use selectionRange
    else if (state.selectionRange) {
      var rangeRect = state.selectionRange.getBoundingClientRect();
      if (rangeRect.width > 0 || rangeRect.height > 0) {
        left = rangeRect.left;
        top = rangeRect.bottom + gap;
      }
    }

    // Final fallback: center horizontally, position in upper third
    if (left === undefined || top === undefined) {
      left = (window.innerWidth - panelWidth) / 2;
      top = window.innerHeight * 0.2;
    }

    // Ensure panel stays in viewport
    var actualPanelWidth = Math.min(panelWidth, window.innerWidth - margin * 2);
    if (left < margin) left = margin;
    if (left + actualPanelWidth > window.innerWidth - margin) {
      left = window.innerWidth - actualPanelWidth - margin;
    }
    if (top < margin) top = margin;

    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    panel.style.right = 'auto';
    panel.style.width = actualPanelWidth + 'px';
    panel.style.maxHeight = (window.innerHeight - margin * 2) + 'px';

    panel.classList.add('visible');
    panel.classList.remove('dropdown-above', 'dropdown-below');
    state.aiPanelVisible = true;

    // Note: highlightSelection is now called BEFORE showAskAIPanel (in button handler)
    // This ensures the highlight is applied before focus changes

    // Focus input
    var input = panel.querySelector('#ask-ai-input');
    if (input) input.focus();
  };

  ERM.reportEditorAI.hideAskAIPanel = function() {
    var panel = document.getElementById('ask-ai-panel');
    if (panel) {
      panel.classList.remove('visible');
      // Reset response area
      var responseArea = panel.querySelector('#ask-ai-response');
      if (responseArea) {
        responseArea.innerHTML = '';
        responseArea.style.display = 'none';
      }
      // Show suggestions again
      var suggestionsArea = panel.querySelector('.ask-ai-suggestions');
      if (suggestionsArea) {
        suggestionsArea.style.display = '';
      }
      // Clear input
      var input = panel.querySelector('#ask-ai-input');
      if (input) {
        input.value = '';
      }
    }

    // Hide floating toolbar since AI interaction is complete
    var floatingToolbar = document.getElementById('report-floating-toolbar');
    if (floatingToolbar) {
      floatingToolbar.classList.remove('visible');
    }

    // Hide AI Actions dropdown if open
    var aiActionsDropdown = document.getElementById('ai-actions-dropdown');
    if (aiActionsDropdown) {
      aiActionsDropdown.classList.remove('visible');
    }

    // Only remove selection highlight if AI response panel is NOT visible
    // This keeps the highlight when transitioning from Ask AI panel to AI response
    var aiResponsePanel = document.getElementById('ai-inline-response');
    var aiResponseVisible = aiResponsePanel && aiResponsePanel.classList.contains('visible');
    console.log('[AI] hideAskAIPanel - aiResponseVisible:', aiResponseVisible);
    if (!aiResponseVisible) {
      console.log('[AI] hideAskAIPanel - removing highlight');
      this.unhighlightSelection();
    } else {
      console.log('[AI] hideAskAIPanel - keeping highlight (AI response is visible)');
    }
    state.aiPanelVisible = false;
  };

  ERM.reportEditorAI.updateAskAIContext = function(panel) {
    var chipsContainer = panel.querySelector('.ask-ai-context-chips');
    if (!chipsContainer) return;

    // Use the same context detection as getReportContext
    var context = this.getReportContext();
    var chips = [];

    // Section chip
    if (context.section) {
      chips.push('<span class="context-chip">' + ERM.utils.escapeHtml(context.section) + '</span>');
    }

    // Report name chip
    if (context.reportName) {
      chips.push('<span class="context-chip">' + ERM.utils.escapeHtml(context.reportName) + '</span>');
    }

    // Show message if no context found
    if (chips.length === 0) {
      chips.push('<span class="context-chip context-chip-empty">General question</span>');
    }

    chipsContainer.innerHTML = chips.join('');
  };

  ERM.reportEditorAI.createAskAIPanel = function() {
    var self = this;
    var panel = document.createElement('div');
    panel.id = 'ask-ai-panel';
    panel.className = 'ask-ai-panel';

    panel.innerHTML =
      '<div class="ask-ai-header">' +
      '  <span class="ask-ai-title">' +
      '    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/>' +
      '    </svg>' +
      '    Ask AI about this report' +
      '  </span>' +
      '  <button class="ask-ai-close" id="ask-ai-close">' +
      '    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '      <line x1="18" y1="6" x2="6" y2="18"/>' +
      '      <line x1="6" y1="6" x2="18" y2="18"/>' +
      '    </svg>' +
      '  </button>' +
      '</div>' +
      '<div class="ask-ai-context">' +
      '  <span class="context-label">Context:</span>' +
      '  <div class="ask-ai-context-chips"></div>' +
      '</div>' +
      '<div class="ask-ai-response" id="ask-ai-response"></div>' +
      '<div class="ask-ai-suggestions">' +
      '  <div class="suggestion-item" data-prompt="Summarise this section for the Board">Summarise this section for the Board</div>' +
      '  <div class="suggestion-item" data-prompt="Explain why residual risk is still high">Explain why residual risk is still high</div>' +
      '  <div class="suggestion-item" data-prompt="Write management commentary for this category">Write management commentary</div>' +
      '</div>' +
      '<div class="ask-ai-input-area">' +
      '  <textarea id="ask-ai-input" placeholder="Ask a question or describe what you need..." rows="3"></textarea>' +
      '  <button class="btn btn-primary btn-sm" id="ask-ai-submit">' +
      '    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '      <line x1="22" y1="2" x2="11" y2="13"/>' +
      '      <polygon points="22 2 15 22 11 13 2 9 22 2"/>' +
      '    </svg>' +
      '    Send' +
      '  </button>' +
      '</div>' +
      '<div class="ask-ai-disclaimer">' +
      '  AI can suggest narrative language but cannot verify external facts.' +
      '</div>';

    // CRITICAL: Prevent mousedown from clearing the text selection
    // This ensures the highlight stays visible when clicking inside the panel
    panel.addEventListener('mousedown', function(e) {
      // Only prevent default on non-interactive elements
      // Allow input/textarea/button to work normally
      var tag = e.target.tagName.toLowerCase();
      if (tag !== 'textarea' && tag !== 'input' && tag !== 'button') {
        e.preventDefault();
      }
    });

    // Bind events
    panel.querySelector('#ask-ai-close').addEventListener('click', function() {
      self.hideAskAIPanel();
    });

    panel.querySelector('#ask-ai-submit').addEventListener('click', function() {
      self.submitAskAI();
    });

    // Suggestion clicks
    var suggestions = panel.querySelectorAll('.suggestion-item');
    for (var i = 0; i < suggestions.length; i++) {
      suggestions[i].addEventListener('click', function() {
        var prompt = this.getAttribute('data-prompt');
        panel.querySelector('#ask-ai-input').value = prompt;
        self.submitAskAI();
      });
    }

    // Enter key in textarea (with shift for newline)
    panel.querySelector('#ask-ai-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        self.submitAskAI();
      }
      // ESC to close
      if (e.key === 'Escape') {
        self.hideAskAIPanel();
      }
    });

    // Click outside to close (attach to document)
    document.addEventListener('mousedown', function(e) {
      var askAiPanel = document.getElementById('ask-ai-panel');
      if (askAiPanel && askAiPanel.classList.contains('visible')) {
        // Check if click was outside the panel
        if (!askAiPanel.contains(e.target)) {
          // Don't close if clicking on toolbar buttons
          var toolbar = document.getElementById('report-floating-toolbar');
          if (toolbar && toolbar.contains(e.target)) return;

          self.hideAskAIPanel();
        }
      }
    });

    return panel;
  };

  ERM.reportEditorAI.submitAskAI = function() {
    var self = this;
    var panel = document.getElementById('ask-ai-panel');
    var input = panel.querySelector('#ask-ai-input');
    var responseArea = panel.querySelector('#ask-ai-response');
    var question = input.value.trim();

    if (!question) return;

    // Check if AI service is available and has API key
    if (!ERM.aiService || !ERM.aiService.hasApiKey()) {
      ERM.toast.error('Please configure your DeepSeek API key in settings');
      this.showApiKeyPrompt();
      return;
    }

    // Store for retry
    state.lastAskAIQuestion = question;

    // Hide suggestions while loading/showing response
    var suggestionsArea = panel.querySelector('.ask-ai-suggestions');
    if (suggestionsArea) {
      suggestionsArea.style.display = 'none';
    }

    // Show loading
    responseArea.innerHTML =
      '<div class="ask-ai-loading">' +
      '  <div class="ai-loading-spinner"></div>' +
      '  <span>Thinking...</span>' +
      '</div>';
    responseArea.style.display = 'block';

    // Build context for the AI
    var context = this.getReportContext();
    context.selectedText = state.selection || '';

    // Call the real AI service
    ERM.aiService.askQuestion(question, context, function(result) {
      if (result.error) {
        // Determine if this is a connection error (can retry)
        var isConnectionError = result.error.indexOf('proxy') > -1 ||
                               result.error.indexOf('server') > -1 ||
                               result.error.indexOf('connect') > -1 ||
                               result.error.indexOf('timeout') > -1;

        responseArea.innerHTML =
          '<div class="ask-ai-error-panel">' +
          '  <div class="ai-error-icon">⚠️</div>' +
          '  <div class="ai-error-message">' + ERM.utils.escapeHtml(result.error) + '</div>' +
          (isConnectionError ?
            '<div class="ai-error-hint">Make sure the server is running: <code>npm start</code></div>' : '') +
          '  <div class="ask-ai-error-actions">' +
          (isConnectionError ?
            '<button class="btn btn-sm btn-primary ask-ai-retry">Retry</button>' : '') +
          '    <button class="btn btn-sm btn-secondary ask-ai-clear">Clear</button>' +
          '  </div>' +
          '</div>';

        // Bind retry button
        var retryBtn = responseArea.querySelector('.ask-ai-retry');
        if (retryBtn) {
          retryBtn.addEventListener('click', function() {
            self.submitAskAI();
          });
        }

        // Bind clear button
        var clearBtn = responseArea.querySelector('.ask-ai-clear');
        if (clearBtn) {
          clearBtn.addEventListener('click', function() {
            responseArea.innerHTML = '';
            responseArea.style.display = 'none';
            // Show suggestions again
            var suggestionsArea = panel.querySelector('.ask-ai-suggestions');
            if (suggestionsArea) {
              suggestionsArea.style.display = '';
            }
          });
        }
        return;
      }

      // Format the result text - convert markdown-style formatting to HTML
      var formattedText = self.formatAIResponse(result.text);

      // Check if there's selected text - if so, show Replace button
      var hasSelection = state.selection && state.selection.trim().length > 0;

      // Build action buttons - Only Insert, Replace (if selection), Clear
      var actionButtons =
        '    <button class="btn btn-sm btn-primary" data-action="insert">Insert below</button>';

      if (hasSelection) {
        actionButtons +=
          '    <button class="btn btn-sm btn-danger" data-action="replace">Replace</button>';
      }

      actionButtons +=
        '    <button class="btn btn-sm btn-ghost ask-ai-clear-result">Clear</button>';

      responseArea.innerHTML =
        '<div class="ask-ai-result">' +
        '  <div class="result-text">' + formattedText + '</div>' +
        '  <div class="result-actions">' + actionButtons + '</div>' +
        '</div>';

      // Bind clear button for success result
      var clearResultBtn = responseArea.querySelector('.ask-ai-clear-result');
      if (clearResultBtn) {
        clearResultBtn.addEventListener('click', function() {
          responseArea.innerHTML = '';
          responseArea.style.display = 'none';
          // Show suggestions again
          var suggestionsArea = panel.querySelector('.ask-ai-suggestions');
          if (suggestionsArea) {
            suggestionsArea.style.display = '';
          }
        });
      }

      // Bind result action buttons
      var actionBtns = responseArea.querySelectorAll('[data-action]');
      for (var i = 0; i < actionBtns.length; i++) {
        actionBtns[i].addEventListener('click', function() {
          var action = this.getAttribute('data-action');
          // Store original selection for replace
          state.pendingAIResult = {
            text: result.text,
            originalText: state.selection
          };
          self.applyAIResult(action);
          self.hideAskAIPanel();
        });
      }
    });
  };

  // ========================================
  // FORMAT AI RESPONSE (Markdown to HTML)
  // ========================================

  ERM.reportEditorAI.formatAIResponse = function(text) {
    if (!text) return '';

    var lines = text.split('\n');
    var result = [];
    var listStack = []; // Track nested lists: [{type: 'ul'|'ol', indent: 0}]
    var inTable = false;
    var tableRows = [];

    function escapeHtml(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function processInline(text) {
      var s = escapeHtml(text);
      // Bold: **text**
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // Italic: *text* (not part of **)
      s = s.replace(/\*([^*<>]+)\*/g, '<em>$1</em>');
      return s;
    }

    function getIndentLevel(line) {
      var match = line.match(/^(\s*)/);
      return match ? Math.floor(match[1].length / 2) : 0;
    }

    function closeListsToLevel(targetLevel) {
      while (listStack.length > targetLevel) {
        var closed = listStack.pop();
        result.push('</' + closed.type + '>');
      }
    }

    function flushTable() {
      if (tableRows.length > 0) {
        result.push('<table class="ai-table">');

        // Filter out any separator rows that might have slipped through
        var filteredRows = tableRows.filter(function(row) {
          return !row.match(/^\|[\s\-:|]+\|$/);
        });

        // First row is header
        if (filteredRows.length > 0) {
          var headerCells = filteredRows[0].split('|').filter(function(c) { return c.trim() !== ''; });
          result.push('<thead><tr>');
          for (var h = 0; h < headerCells.length; h++) {
            result.push('<th>' + processInline(headerCells[h].trim()) + '</th>');
          }
          result.push('</tr></thead>');
        }

        // Remaining rows are body
        if (filteredRows.length > 1) {
          result.push('<tbody>');
          for (var i = 1; i < filteredRows.length; i++) {
            var cells = filteredRows[i].split('|').filter(function(c) { return c.trim() !== ''; });
            result.push('<tr>');
            for (var j = 0; j < cells.length; j++) {
              result.push('<td>' + processInline(cells[j].trim()) + '</td>');
            }
            result.push('</tr>');
          }
          result.push('</tbody>');
        }

        result.push('</table>');
        tableRows = [];
        inTable = false;
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var trimmed = line.trim();

      // Empty line - close lists and flush table
      if (trimmed === '') {
        closeListsToLevel(0);
        flushTable();
        continue;
      }

      // Table separator row (|---|---|)
      if (trimmed.match(/^\|[\s\-:|]+\|$/)) {
        inTable = true;
        continue;
      }

      // Table row
      if (trimmed.match(/^\|.+\|$/)) {
        if (!inTable && tableRows.length === 0) {
          closeListsToLevel(0);
        }
        tableRows.push(trimmed);
        inTable = true;
        continue;
      }

      // If we were in a table but this line isn't, flush it
      if (inTable) {
        flushTable();
      }

      // Horizontal rule
      if (trimmed.match(/^---+$/)) {
        closeListsToLevel(0);
        result.push('<hr>');
        continue;
      }

      // Headings: ## H2, ### H3, #### H4 (skip H1 and H5+)
      var headingMatch = trimmed.match(/^(#{2,4})\s+(.+)$/);
      if (headingMatch) {
        closeListsToLevel(0);
        var level = headingMatch[1].length;
        var tag = 'h' + level;
        result.push('<' + tag + '>' + processInline(headingMatch[2]) + '</' + tag + '>');
        continue;
      }

      // Blockquote
      if (trimmed.match(/^>\s*/)) {
        closeListsToLevel(0);
        var quoteText = trimmed.replace(/^>\s*/, '');
        result.push('<blockquote>' + processInline(quoteText) + '</blockquote>');
        continue;
      }

      // Bullet list item (- item or * item)
      var bulletMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
      if (bulletMatch) {
        var indent = getIndentLevel(line);
        var content = bulletMatch[2];

        // Close deeper lists
        closeListsToLevel(indent + 1);

        // Open new list if needed
        if (listStack.length <= indent || listStack[listStack.length - 1].type !== 'ul') {
          closeListsToLevel(indent);
          result.push('<ul>');
          listStack.push({ type: 'ul', indent: indent });
        }

        result.push('<li>' + processInline(content) + '</li>');
        continue;
      }

      // Numbered list item (1. item)
      var numMatch = line.match(/^(\s*)\d+[.)]\s+(.+)$/);
      if (numMatch) {
        var numIndent = getIndentLevel(line);
        var numContent = numMatch[2];

        closeListsToLevel(numIndent + 1);

        if (listStack.length <= numIndent || listStack[listStack.length - 1].type !== 'ol') {
          closeListsToLevel(numIndent);
          result.push('<ol>');
          listStack.push({ type: 'ol', indent: numIndent });
        }

        result.push('<li>' + processInline(numContent) + '</li>');
        continue;
      }

      // Regular paragraph
      closeListsToLevel(0);
      result.push('<p>' + processInline(trimmed) + '</p>');
    }

    // Close any remaining lists
    closeListsToLevel(0);
    flushTable();

    var html = result.join('');

    // Fallback for empty result
    if (html === '' && text.trim() !== '') {
      html = '<p>' + processInline(text.trim()) + '</p>';
    }

    // Clean up
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
  };

  // ========================================
  // APPLY AI RESULT
  // ========================================

  ERM.reportEditorAI.applyAIResult = function(mode) {
    if (!state.pendingAIResult || !state.activeBlock) {
      console.log('[ReportEditorAI] Cannot apply AI result - missing pendingAIResult or activeBlock');
      return;
    }

    var newText = state.pendingAIResult.text;
    var originalText = state.pendingAIResult.originalText || state.selection;
    var block = state.activeBlock;

    console.log('[ReportEditorAI] Applying AI result:', mode);

    // Save state BEFORE applying changes for undo support
    if (ERM.reportEditorV2 && typeof ERM.reportEditorV2.saveState === 'function') {
      ERM.reportEditorV2.saveState();
      console.log('[ReportEditorAI] State saved for undo');
    }

    // Check if we're in V2 editor (has insertBlockAfter function)
    if (ERM.reportEditorV2 && typeof ERM.reportEditorV2.insertBlockAfter === 'function') {
      // V2 editor handles highlight cleanup internally based on mode
      this.applyAIResultV2(mode, newText, originalText, block);
    } else {
      // Old editor fallback - clean up highlight after
      this.applyAIResultLegacy(mode, newText, originalText, block);
      this.unhighlightSelection();
    }

    ERM.toast.success('Text updated');
  };

  // V2 Editor: Insert AI content as proper editor blocks
  // CRITICAL: Output must match EXACTLY what formatAIResponse shows in the Ask AI panel
  ERM.reportEditorAI.applyAIResultV2 = function(mode, newText, originalText, block) {
    var contentEl = block.querySelector('.block-content, [contenteditable="true"]') || block;
    var self = this;

    // Use formatAIResponse to get the EXACT same HTML shown in the Ask AI panel
    // Then parse that HTML into editor blocks
    var formattedHTML = this.formatAIResponse(newText);

    // Parse the formatted HTML into editor blocks
    var parsedBlocks = this.parseHTMLToBlocks(formattedHTML);

    var lastBlock = block;

    if (mode === 'replace') {
      // REPLACE: Remove ALL highlighted text spans and insert new content
      // Get all highlight elements (multi-selection support)
      var allHighlights = document.querySelectorAll('.ai-selection-highlight[data-ai-highlight]');

      if (allHighlights.length > 0) {
        // Get the parent of the first highlight for reference
        var firstHighlight = allHighlights[0];
        var parent = firstHighlight.parentNode;

        // If first block is paragraph and it's simple text, replace first highlight with content
        if (parsedBlocks.length === 1 && parsedBlocks[0].type === 'paragraph') {
          // Simple single paragraph - replace first highlight content inline
          var wrapper = document.createElement('span');
          wrapper.innerHTML = parsedBlocks[0].content;

          // Insert replacement before first highlight
          parent.insertBefore(wrapper, firstHighlight);
        } else if (parsedBlocks.length > 0 && parsedBlocks[0].type === 'paragraph') {
          // First block is paragraph, replace with it
          var wrapper = document.createElement('span');
          wrapper.innerHTML = parsedBlocks[0].content;
          parent.insertBefore(wrapper, firstHighlight);

          // Insert remaining blocks after current block
          for (var i = 1; i < parsedBlocks.length; i++) {
            lastBlock = this.insertFormattedBlock(lastBlock, parsedBlocks[i]);
          }
        } else {
          // Complex blocks (tables, lists): insert all as new blocks after current block
          for (var i = 0; i < parsedBlocks.length; i++) {
            lastBlock = this.insertFormattedBlock(lastBlock, parsedBlocks[i]);
          }
        }

        // Now remove ALL highlight spans (they contained the selected text)
        for (var h = 0; h < allHighlights.length; h++) {
          var highlight = allHighlights[h];
          if (highlight.parentNode) {
            highlight.parentNode.removeChild(highlight);
          }
        }

        state.highlightElement = null;
        state.highlightElements = [];
      } else {
        // No highlight found - try using original selection text to find and replace

        var originalSelection = state.originalSelectionText || state.selection;
        if (originalSelection && contentEl) {
          // Try to find the original text in the content and replace it
          var currentHTML = contentEl.innerHTML;
          var escapedOriginal = originalSelection
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars

          // Create replacement content
          var replacementContent = '';
          for (var i = 0; i < parsedBlocks.length; i++) {
            if (parsedBlocks[i].type === 'paragraph') {
              replacementContent += parsedBlocks[i].content;
            } else {
              // For non-paragraph blocks, just use the HTML representation
              replacementContent += parsedBlocks[i].content || '';
            }
          }

          // Replace first occurrence
          var regex = new RegExp(escapedOriginal.substring(0, 100), 'g'); // Limit to first 100 chars
          var newHTML = currentHTML.replace(regex, replacementContent);

          if (newHTML !== currentHTML) {
            contentEl.innerHTML = newHTML;
            console.log('[ReportEditorAI] Replace: Text search replacement successful');
          } else {
            // Still couldn't find - append as fallback
            console.log('[ReportEditorAI] Replace: Text not found, appending as fallback');
            for (var i = 0; i < parsedBlocks.length; i++) {
              lastBlock = this.insertFormattedBlock(lastBlock, parsedBlocks[i]);
            }
          }
        }
      }
    } else if (mode === 'insert') {
      // INSERT: Add content as new blocks AFTER the current block
      // The selected text is preserved (highlight removed but text kept)
      console.log('[ReportEditorAI] Insert: Adding content as new blocks after current block');

      // Remove highlight styling but keep the content
      this.unhighlightSelection();

      // Insert all parsed blocks AFTER the current block as new blocks
      for (var i = 0; i < parsedBlocks.length; i++) {
        lastBlock = this.insertFormattedBlock(lastBlock, parsedBlocks[i]);
      }

      console.log('[ReportEditorAI] Insert: Added', parsedBlocks.length, 'blocks after current block');
    } else {
      // APPEND: Add all blocks after current block (same as insert for V2)
      // First, remove any highlight without replacing content
      this.unhighlightSelection();

      for (var i = 0; i < parsedBlocks.length; i++) {
        lastBlock = this.insertFormattedBlock(lastBlock, parsedBlocks[i]);
      }
    }

    // Mark document as modified
    block.classList.add('block-modified');

    // Focus the last inserted block
    if (lastBlock && lastBlock !== block) {
      setTimeout(function() {
        var editable = lastBlock.querySelector('[contenteditable="true"]');
        if (editable) {
          editable.focus();
          var range = document.createRange();
          var sel = window.getSelection();
          if (editable.lastChild) {
            range.setStart(editable.lastChild, editable.lastChild.textContent ? editable.lastChild.textContent.length : 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }, 100);
    }

    // Mark dirty and save state
    if (ERM.reportEditorV2 && ERM.reportEditorV2.markDirty) {
      ERM.reportEditorV2.markDirty(true);
    }

    // Update page awareness after AI content is inserted
    // Use updatePageAwareness directly (not debounced) for immediate overflow handling
    var insertedBlock = lastBlock;
    setTimeout(function() {
      if (ERM.reportEditorV2 && ERM.reportEditorV2.updatePageAwareness) {
        // Direct call to check all pages for overflow
        ERM.reportEditorV2.updatePageAwareness();
      }
      // Also trigger autoPaginate on the inserted block
      if (insertedBlock && ERM.reportEditorV2 && ERM.reportEditorV2.autoPaginate) {
        ERM.reportEditorV2.autoPaginate(insertedBlock);
      }
    }, 50); // Short delay to ensure DOM is updated
  };

  /**
   * Parse formatted HTML (from formatAIResponse) into editor block structures
   * This ensures the editor blocks match exactly what's shown in the Ask AI panel
   */
  ERM.reportEditorAI.parseHTMLToBlocks = function(html) {
    var blocks = [];

    // Create a temporary container to parse the HTML
    var temp = document.createElement('div');
    temp.innerHTML = html;

    var children = temp.children;
    for (var i = 0; i < children.length; i++) {
      var el = children[i];
      var tagName = el.tagName.toLowerCase();

      switch (tagName) {
        case 'p':
          blocks.push({
            type: 'paragraph',
            content: el.innerHTML
          });
          break;

        case 'h1':
          blocks.push({
            type: 'heading1',
            content: el.innerHTML
          });
          break;

        case 'h2':
          blocks.push({
            type: 'heading2',
            content: el.innerHTML
          });
          break;

        case 'h3':
          blocks.push({
            type: 'heading3',
            content: el.innerHTML
          });
          break;

        case 'h4':
          blocks.push({
            type: 'heading3', // Map h4 to heading3
            content: el.innerHTML
          });
          break;

        case 'ul':
          // BLOCK MODEL: Each list item = its own block (Option A - true Notion model)
          // This ensures consistent behavior between AI-inserted and manually-typed lists
          var bulletItems = el.querySelectorAll(':scope > li'); // Direct children only
          for (var li = 0; li < bulletItems.length; li++) {
            blocks.push({
              type: 'bullet',
              content: bulletItems[li].innerHTML
            });
          }
          break;

        case 'ol':
          // BLOCK MODEL: Each list item = its own block (Option A - true Notion model)
          var numItems = el.querySelectorAll(':scope > li'); // Direct children only
          for (var nli = 0; nli < numItems.length; nli++) {
            blocks.push({
              type: 'number',
              content: numItems[nli].innerHTML
            });
          }
          break;

        case 'table':
          // Table - extract rows and cells
          var tableRows = el.querySelectorAll('tr');
          var rows = [];
          for (var tr = 0; tr < tableRows.length; tr++) {
            var cells = tableRows[tr].querySelectorAll('th, td');
            var rowCells = [];
            for (var td = 0; td < cells.length; td++) {
              rowCells.push({ content: cells[td].innerHTML });
            }
            rows.push({ cells: rowCells });
          }
          blocks.push({
            type: 'table',
            rows: rows
          });
          break;

        case 'blockquote':
          blocks.push({
            type: 'quote',
            content: el.innerHTML
          });
          break;

        case 'hr':
          blocks.push({
            type: 'divider',
            content: ''
          });
          break;

        default:
          // Unknown element - treat as paragraph
          if (el.textContent.trim()) {
            blocks.push({
              type: 'paragraph',
              content: el.innerHTML || el.textContent
            });
          }
      }
    }

    return blocks;
  };

  /**
   * Insert a formatted block into the editor
   * BLOCK MODEL: Uses insertBlockAfter for atomic blocks (paragraph, heading, bullet, number)
   * Uses insertStructuredBlock only for complex types (table)
   */
  ERM.reportEditorAI.insertFormattedBlock = function(afterBlock, blockData) {
    if (!afterBlock || !blockData) return afterBlock;

    // Atomic block types use insertBlockAfter directly
    // This ensures each list item, paragraph, heading is its own block
    var atomicTypes = ['paragraph', 'heading1', 'heading2', 'heading3', 'bullet', 'number', 'quote', 'divider'];

    if (atomicTypes.indexOf(blockData.type) !== -1) {
      if (ERM.reportEditorV2 && ERM.reportEditorV2.insertBlockAfter) {
        return ERM.reportEditorV2.insertBlockAfter(afterBlock, blockData.type, blockData.content || '');
      }
    }

    // Complex types (table) use insertStructuredBlock
    if (ERM.reportEditorV2 && ERM.reportEditorV2.insertStructuredBlock) {
      return ERM.reportEditorV2.insertStructuredBlock(afterBlock, blockData);
    }

    // Final fallback
    if (ERM.reportEditorV2 && ERM.reportEditorV2.insertBlockAfter) {
      return ERM.reportEditorV2.insertBlockAfter(afterBlock, blockData.type, blockData.content || '');
    }

    return afterBlock;
  };

  // Legacy editor: Insert as HTML spans
  ERM.reportEditorAI.applyAIResultLegacy = function(mode, newText, originalText, block) {
    var contentEl = block.querySelector('.block-content, [contenteditable="true"]') || block;
    var formattedHTML = this.formatAIResponse(newText);
    var wrappedHTML = '<span class="ai-content">' + formattedHTML + '</span>';

    switch (mode) {
      case 'replace':
        if (state.selectionRange) {
          try {
            state.selectionRange.deleteContents();
            var wrapper = document.createElement('span');
            wrapper.className = 'ai-content';
            wrapper.innerHTML = formattedHTML;
            state.selectionRange.insertNode(wrapper);
          } catch (e) {
            if (originalText && contentEl.innerHTML.indexOf(originalText) !== -1) {
              contentEl.innerHTML = contentEl.innerHTML.replace(originalText, wrappedHTML);
            } else {
              contentEl.innerHTML += ' ' + wrappedHTML;
            }
          }
        } else if (originalText) {
          var currentHTML = contentEl.innerHTML;
          var escapedOriginal = originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          var regex = new RegExp(escapedOriginal.replace(/\s+/g, '\\s*'), 'g');
          if (regex.test(currentHTML)) {
            contentEl.innerHTML = currentHTML.replace(regex, wrappedHTML);
          } else {
            contentEl.innerHTML += ' ' + wrappedHTML;
          }
        } else {
          contentEl.innerHTML += ' ' + wrappedHTML;
        }
        break;

      case 'insert':
      case 'append':
        contentEl.innerHTML += ' ' + wrappedHTML;
        break;
    }

    var inputEvent = new Event('input', { bubbles: true, cancelable: true });
    contentEl.dispatchEvent(inputEvent);
  };

  /**
   * Parse AI output (markdown) into structured blocks
   * BLOCK MODEL: Each list item = its own block (Option A - true Notion model)
   * Converts markdown tables into structured table blocks
   * Returns array of block objects ready for insertion
   */
  ERM.reportEditorAI.parseAIToBlocks = function(text) {
    if (!text) return [];

    console.log('[parseAIToBlocks] Input text:', text.substring(0, 500));

    var lines = text.split('\n');
    var blocks = [];
    var tableRows = []; // Accumulate table rows

    // Helper to process inline markdown (bold, italic)
    function processInline(text) {
      var s = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\*([^*<>]+)\*/g, '<em>$1</em>');
      return s;
    }

    // Flush accumulated table rows into a structured table block
    function flushTable() {
      if (tableRows.length > 0) {
        var tableBlock = {
          type: 'table',
          rows: []
        };
        for (var r = 0; r < tableRows.length; r++) {
          var cells = tableRows[r].split('|').filter(function(c) { return c.trim() !== ''; });
          var rowData = { cells: [] };
          for (var c = 0; c < cells.length; c++) {
            rowData.cells.push({
              content: processInline(cells[c].trim())
            });
          }
          tableBlock.rows.push(rowData);
        }
        blocks.push(tableBlock);
        console.log('[parseAIToBlocks] Flushed table with', tableRows.length, 'rows');
        tableRows = [];
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var trimmed = line.trim();

      // Skip empty lines (but flush any pending table first)
      if (trimmed === '') {
        flushTable();
        continue;
      }

      // Table separator row (|---|---|) - skip but mark we're in a table
      if (trimmed.match(/^\|[\s\-:|]+\|$/)) {
        continue;
      }

      // Table row (|...|...|)
      if (trimmed.match(/^\|.+\|$/)) {
        tableRows.push(trimmed);
        continue;
      }

      // If we have table rows but this line isn't a table row, flush table
      if (tableRows.length > 0) {
        flushTable();
      }

      // Bullet list item - BLOCK MODEL: Each item is its own block
      if (/^[-*•]\s/.test(trimmed)) {
        var bulletContent = trimmed.replace(/^[-*•]\s*/, '');
        blocks.push({
          type: 'bullet',
          content: processInline(bulletContent)
        });
        continue;
      }

      // Numbered list item - BLOCK MODEL: Each item is its own block
      if (/^\d+\.\s/.test(trimmed)) {
        var numberContent = trimmed.replace(/^\d+\.\s*/, '');
        blocks.push({
          type: 'number',
          content: processInline(numberContent)
        });
        continue;
      }

      // Headings
      if (/^###\s/.test(trimmed)) {
        blocks.push({
          type: 'heading3',
          content: processInline(trimmed.replace(/^###\s*/, ''))
        });
        continue;
      }
      if (/^##\s/.test(trimmed)) {
        blocks.push({
          type: 'heading2',
          content: processInline(trimmed.replace(/^##\s*/, ''))
        });
        continue;
      }
      if (/^#\s/.test(trimmed)) {
        blocks.push({
          type: 'heading1',
          content: processInline(trimmed.replace(/^#\s*/, ''))
        });
        continue;
      }

      // Default: paragraph
      blocks.push({
        type: 'paragraph',
        content: processInline(trimmed)
      });
    }

    // Flush any remaining table
    flushTable();

    console.log('[parseAIToBlocks] Created', blocks.length, 'blocks');
    return blocks;
  };

  // Legacy functions kept for backwards compatibility
  ERM.reportEditorAI.preprocessTables = function(text) {
    // Deprecated - use parseAIToBlocks instead
    return text;
  };

  ERM.reportEditorAI.detectBlockType = function(line) {
    line = line.trim();
    if (/^\d+\.\s/.test(line)) return 'number';
    if (/^[-*•]\s/.test(line)) return 'bullet';
    if (/^###\s/.test(line)) return 'heading3';
    if (/^##\s/.test(line)) return 'heading2';
    if (/^#\s/.test(line)) return 'heading1';
    return 'paragraph';
  };

  ERM.reportEditorAI.stripBlockPrefix = function(line, blockType) {
    line = line.trim();
    switch (blockType) {
      case 'number':
        return line.replace(/^\d+\.\s*/, '');
      case 'bullet':
        return line.replace(/^[-*•]\s*/, '');
      case 'heading1':
        return line.replace(/^#\s*/, '');
      case 'heading2':
        return line.replace(/^##\s*/, '');
      case 'heading3':
        return line.replace(/^###\s*/, '');
      default:
        return line;
    }
  };

})();

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
    currentReport: null,
    selectedBlocks: [], // Block IDs for block-level multi-select
    // Chart/embed context for AI
    chartContext: null,  // { blockType, chartKind, title, register, filters, data, insights }
    blockContext: null,  // { blockType, textContent, tableData, listItems, etc. }
    aiMode: 'text'       // 'text', 'chart', or 'block'
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
  // CHART/EMBED CONTEXT EXTRACTION
  // ========================================

  /**
   * Extract deep context from a chart/embed block
   * @param {HTMLElement} embedBlock - The embed block element
   * @returns {Object} Context payload for AI
   */
  ERM.reportEditorAI.extractChartContext = function(embedBlock) {
    if (!embedBlock) return null;

    var blockId = embedBlock.getAttribute('data-block-id');
    var embedType = embedBlock.getAttribute('data-embed-type') || 'unknown';
    var registerId = embedBlock.getAttribute('data-register-id') || 'all';
    var layout = embedBlock.getAttribute('data-layout') || 'side-by-side';

    console.log('[ReportEditorAI] Extracting chart context - blockId:', blockId, 'embedType:', embedType, 'registerId:', registerId);

    // Get register name
    var registerTitle = 'All Registers';
    if (registerId !== 'all') {
      var registers = ERM.storage ? (ERM.storage.get('registers') || ERM.storage.get('riskRegisters') || []) : [];
      for (var i = 0; i < registers.length; i++) {
        if (registers[i].id === registerId) {
          registerTitle = registers[i].name || 'Unnamed Register';
          break;
        }
      }
    }

    // Build context object
    var context = {
      blockType: 'embed',
      chartKind: embedType,
      blockId: blockId,
      title: this.getChartTitle(embedType),
      register: {
        id: registerId,
        title: registerTitle
      },
      filters: {
        registerId: registerId,
        layout: layout
      },
      data: {},
      insights: {},
      visibleLabels: []
    };

    // Extract actual data based on embed type
    try {
      context.data = this.extractChartData(embedType, registerId);
      context.insights = this.computeChartInsights(embedType, context.data);
      context.visibleLabels = this.extractVisibleLabels(embedBlock);
    } catch (e) {
      console.warn('[ReportEditorAI] Error extracting chart data:', e);
    }

    console.log('[ReportEditorAI] Chart context extracted:', {
      chartKind: context.chartKind,
      register: context.register.title,
      dataKeys: Object.keys(context.data),
      insightKeys: Object.keys(context.insights)
    });

    return context;
  };

  /**
   * Get human-readable title for chart type
   */
  ERM.reportEditorAI.getChartTitle = function(embedType) {
    var titles = {
      'heatmap': 'Risk Heatmap',
      'risks': 'Top Risks',
      'chart': 'Risk Concentration by Category',
      'kpi': 'KPI Cards',
      'controls': 'Control Coverage',
      'register': 'Risk Register Table'
    };
    return titles[embedType] || 'Embedded Content';
  };

  /**
   * Extract actual data used to render the chart
   */
  ERM.reportEditorAI.extractChartData = function(embedType, registerId) {
    var data = {};
    var allRisks = ERM.storage ? ERM.storage.get('risks') || [] : [];
    var allControls = ERM.storage ? ERM.storage.get('controls') || [] : [];
    var registers = ERM.storage ? (ERM.storage.get('registers') || ERM.storage.get('riskRegisters') || []) : [];

    // Filter risks by register if needed
    var risks = allRisks;
    if (registerId && registerId !== 'all') {
      risks = allRisks.filter(function(r) {
        return r.registerId === registerId;
      });
    }

    switch (embedType) {
      case 'heatmap':
        // Heatmap data: risk distribution by likelihood x impact
        data.totalRisks = risks.length;
        data.inherentGrid = this.buildHeatmapGrid(risks, 'inherent');
        data.residualGrid = this.buildHeatmapGrid(risks, 'residual');
        data.risksByLevel = this.categorizeRisksByLevel(risks);
        break;

      case 'risks':
        // Top risks data
        var sortedRisks = risks.slice().sort(function(a, b) {
          var scoreA = (a.inherentLikelihood || 1) * (a.inherentImpact || 1);
          var scoreB = (b.inherentLikelihood || 1) * (b.inherentImpact || 1);
          return scoreB - scoreA;
        });
        data.topRisks = sortedRisks.slice(0, 10).map(function(r) {
          return {
            id: r.id,
            title: r.title,
            category: r.category,
            owner: r.owner,
            inherentScore: (r.inherentLikelihood || 1) * (r.inherentImpact || 1),
            residualScore: (r.residualLikelihood || 1) * (r.residualImpact || 1),
            treatment: r.treatment,
            controlsCount: r.linkedControls ? r.linkedControls.length : 0
          };
        });
        data.totalRisks = risks.length;
        break;

      case 'chart':
        // Category distribution
        var categories = {};
        for (var i = 0; i < risks.length; i++) {
          var cat = risks[i].category || 'Uncategorized';
          categories[cat] = (categories[cat] || 0) + 1;
        }
        data.categoryDistribution = categories;
        data.totalRisks = risks.length;
        data.categoryCount = Object.keys(categories).length;
        break;

      case 'kpi':
        // KPI metrics
        var highRisks = 0, criticalRisks = 0, uncontrolled = 0, noOwner = 0;
        for (var i = 0; i < risks.length; i++) {
          var score = (risks[i].residualLikelihood || 1) * (risks[i].residualImpact || 1);
          if (score >= 15) criticalRisks++;
          else if (score >= 10) highRisks++;
          if (!risks[i].linkedControls || risks[i].linkedControls.length === 0) uncontrolled++;
          if (!risks[i].owner) noOwner++;
        }
        data.totalRisks = risks.length;
        data.criticalRisks = criticalRisks;
        data.highRisks = highRisks;
        data.uncontrolledRisks = uncontrolled;
        data.risksWithoutOwner = noOwner;
        data.totalControls = allControls.length;
        break;

      case 'controls':
        // Control coverage data
        var linkedRiskIds = {};
        for (var i = 0; i < allControls.length; i++) {
          var ctrl = allControls[i];
          if (ctrl.linkedRisks) {
            for (var j = 0; j < ctrl.linkedRisks.length; j++) {
              linkedRiskIds[ctrl.linkedRisks[j]] = true;
            }
          }
        }
        var coveredRisks = 0;
        for (var i = 0; i < risks.length; i++) {
          if (linkedRiskIds[risks[i].id] || (risks[i].linkedControls && risks[i].linkedControls.length > 0)) {
            coveredRisks++;
          }
        }
        data.totalRisks = risks.length;
        data.totalControls = allControls.length;
        data.coveredRisks = coveredRisks;
        data.uncoveredRisks = risks.length - coveredRisks;
        data.coveragePercent = risks.length > 0 ? Math.round((coveredRisks / risks.length) * 100) : 0;
        break;

      default:
        data.totalRisks = risks.length;
        data.totalControls = allControls.length;
    }

    return data;
  };

  /**
   * Build heatmap grid for a given risk type
   */
  ERM.reportEditorAI.buildHeatmapGrid = function(risks, type) {
    var grid = {};
    var likelihoodKey = type === 'inherent' ? 'inherentLikelihood' : 'residualLikelihood';
    var impactKey = type === 'inherent' ? 'inherentImpact' : 'residualImpact';

    for (var i = 0; i < risks.length; i++) {
      var likelihood = risks[i][likelihoodKey] || 1;
      var impact = risks[i][impactKey] || 1;
      var key = likelihood + 'x' + impact;
      grid[key] = (grid[key] || 0) + 1;
    }
    return grid;
  };

  /**
   * Categorize risks by level (Low, Medium, High, Critical)
   */
  ERM.reportEditorAI.categorizeRisksByLevel = function(risks) {
    var levels = { low: 0, medium: 0, high: 0, critical: 0 };
    for (var i = 0; i < risks.length; i++) {
      var score = (risks[i].residualLikelihood || 1) * (risks[i].residualImpact || 1);
      if (score >= 15) levels.critical++;
      else if (score >= 10) levels.high++;
      else if (score >= 5) levels.medium++;
      else levels.low++;
    }
    return levels;
  };

  /**
   * Compute insights from chart data
   */
  ERM.reportEditorAI.computeChartInsights = function(embedType, data) {
    var insights = {};

    switch (embedType) {
      case 'heatmap':
        insights.totalRisks = data.totalRisks;
        if (data.risksByLevel) {
          insights.criticalPercent = data.totalRisks > 0 ? Math.round((data.risksByLevel.critical / data.totalRisks) * 100) : 0;
          insights.highPercent = data.totalRisks > 0 ? Math.round((data.risksByLevel.high / data.totalRisks) * 100) : 0;
          insights.concentrationSummary = data.risksByLevel.critical + ' critical, ' + data.risksByLevel.high + ' high, ' + data.risksByLevel.medium + ' medium, ' + data.risksByLevel.low + ' low';
        }
        break;

      case 'risks':
        insights.totalRisks = data.totalRisks;
        if (data.topRisks && data.topRisks.length > 0) {
          var highestScore = data.topRisks[0].inherentScore;
          insights.highestRiskScore = highestScore;
          insights.highestRiskTitle = data.topRisks[0].title;
          var avgScore = 0;
          for (var i = 0; i < data.topRisks.length; i++) {
            avgScore += data.topRisks[i].inherentScore;
          }
          insights.averageTopRiskScore = Math.round(avgScore / data.topRisks.length * 10) / 10;
        }
        break;

      case 'chart':
        insights.totalRisks = data.totalRisks;
        insights.categoryCount = data.categoryCount;
        if (data.categoryDistribution) {
          var maxCat = '', maxCount = 0;
          for (var cat in data.categoryDistribution) {
            if (data.categoryDistribution[cat] > maxCount) {
              maxCount = data.categoryDistribution[cat];
              maxCat = cat;
            }
          }
          insights.dominantCategory = maxCat;
          insights.dominantCategoryCount = maxCount;
        }
        break;

      case 'kpi':
        insights.riskSummary = data.totalRisks + ' total risks';
        insights.criticalHighCount = data.criticalRisks + data.highRisks;
        insights.uncontrolledPercent = data.totalRisks > 0 ? Math.round((data.uncontrolledRisks / data.totalRisks) * 100) : 0;
        break;

      case 'controls':
        insights.coveragePercent = data.coveragePercent;
        insights.gapCount = data.uncoveredRisks;
        break;
    }

    return insights;
  };

  /**
   * Extract visible labels from the rendered chart DOM
   */
  ERM.reportEditorAI.extractVisibleLabels = function(embedBlock) {
    var labels = [];
    var contentEl = embedBlock.querySelector('.editor-v2-embed-content');
    if (!contentEl) return labels;

    // Extract section titles
    var titles = contentEl.querySelectorAll('.section-title, .heatmap-card-title, .kpi-label, h2, h3');
    for (var i = 0; i < titles.length; i++) {
      var text = titles[i].textContent.trim();
      if (text && labels.indexOf(text) === -1) {
        labels.push(text);
      }
    }

    // Extract legend items
    var legendItems = contentEl.querySelectorAll('.legend-item, .legend-text');
    for (var i = 0; i < legendItems.length; i++) {
      var text = legendItems[i].textContent.trim();
      if (text && labels.indexOf(text) === -1) {
        labels.push(text);
      }
    }

    return labels;
  };

  // ========================================
  // OPEN ASK AI FOR BLOCK (Entry Point)
  // ========================================

  /**
   * Open Ask AI panel for a specific block
   * @param {string} blockId - The block ID to open AI for
   * @param {string} mode - 'text', 'chart', or 'block' (context-aware based on block content)
   */
  ERM.reportEditorAI.openAskAIForBlock = function(blockId, mode) {
    var block = document.querySelector('[data-block-id="' + blockId + '"]');
    if (!block) {
      console.warn('[ReportEditorAI] openAskAIForBlock - block not found:', blockId);
      return;
    }

    console.log('[ReportEditorAI] openAskAIForBlock - blockId:', blockId, 'mode:', mode);

    // Set the active block
    state.activeBlock = block;
    state.aiMode = mode || 'text';

    if (mode === 'chart') {
      // Extract chart/embed context
      state.chartContext = this.extractChartContext(block);
      state.blockContext = null;

      if (!state.chartContext) {
        console.warn('[ReportEditorAI] Could not extract chart context');
        state.chartContext = {
          blockType: 'embed',
          chartKind: block.getAttribute('data-embed-type') || 'unknown',
          title: 'Embedded Content',
          register: { id: 'all', title: 'All Registers' },
          data: {},
          insights: {}
        };
      }

      // Clear text selection state since we're in chart mode
      state.selection = null;
      state.selectionRange = null;
    } else if (mode === 'block') {
      // Block mode - extract context from any block type
      state.chartContext = null;
      state.blockContext = this.extractBlockContext(block);

      // Clear text selection state
      state.selection = null;
      state.selectionRange = null;
    } else {
      // Text mode - clear contexts
      state.chartContext = null;
      state.blockContext = null;
    }

    // Show the Ask AI panel
    this.showAskAIPanelForChart();
  };

  /**
   * Extract context from any block type (paragraph, heading, list, table, etc.)
   * @param {HTMLElement} block - The block element
   * @returns {Object} Block context for AI
   */
  ERM.reportEditorAI.extractBlockContext = function(block) {
    if (!block) return null;

    var blockId = block.getAttribute('data-block-id');
    var blockType = block.getAttribute('data-block-type') || 'paragraph';
    var contentEl = block.querySelector('.block-content, [contenteditable="true"]');

    // Get the text content
    var textContent = '';
    var htmlContent = '';
    if (contentEl) {
      textContent = contentEl.textContent || '';
      htmlContent = contentEl.innerHTML || '';
    }

    // Build context object
    var context = {
      blockType: blockType,
      blockId: blockId,
      title: this.getBlockTypeLabel(blockType),
      textContent: textContent.trim(),
      htmlContent: htmlContent,
      wordCount: textContent.trim().split(/\s+/).filter(function(w) { return w.length > 0; }).length,
      hasContent: textContent.trim().length > 0
    };

    // Extract additional context based on block type
    if (blockType === 'table' || htmlContent.indexOf('<table') > -1) {
      context.isTable = true;
      context.tableData = this.extractTableData(contentEl);
    }

    if (blockType === 'bullet' || blockType === 'number') {
      context.isList = true;
      context.listItems = this.extractListItems(block);
    }

    console.log('[ReportEditorAI] Block context extracted:', {
      blockType: context.blockType,
      wordCount: context.wordCount,
      hasContent: context.hasContent,
      isTable: context.isTable || false,
      isList: context.isList || false
    });

    return context;
  };

  /**
   * Get human-readable label for block type
   */
  ERM.reportEditorAI.getBlockTypeLabel = function(blockType) {
    var labels = {
      'paragraph': 'Paragraph',
      'heading1': 'Heading 1',
      'heading2': 'Heading 2',
      'heading3': 'Heading 3',
      'bullet': 'Bullet List',
      'number': 'Numbered List',
      'quote': 'Quote',
      'callout': 'Callout',
      'table': 'Table',
      'divider': 'Divider'
    };
    return labels[blockType] || 'Content Block';
  };

  /**
   * Extract table data from a table element
   */
  ERM.reportEditorAI.extractTableData = function(contentEl) {
    if (!contentEl) return null;

    var table = contentEl.querySelector('table') || (contentEl.tagName === 'TABLE' ? contentEl : null);
    if (!table) return null;

    var data = { headers: [], rows: [] };

    // Extract headers
    var headerRow = table.querySelector('thead tr, tr:first-child');
    if (headerRow) {
      var headerCells = headerRow.querySelectorAll('th, td');
      for (var i = 0; i < headerCells.length; i++) {
        data.headers.push(headerCells[i].textContent.trim());
      }
    }

    // Extract rows
    var rows = table.querySelectorAll('tbody tr, tr');
    for (var r = 0; r < rows.length; r++) {
      // Skip header row if we already processed it
      if (rows[r] === headerRow) continue;

      var rowData = [];
      var cells = rows[r].querySelectorAll('td, th');
      for (var c = 0; c < cells.length; c++) {
        rowData.push(cells[c].textContent.trim());
      }
      if (rowData.length > 0) {
        data.rows.push(rowData);
      }
    }

    return data;
  };

  /**
   * Extract list items from a list block
   */
  ERM.reportEditorAI.extractListItems = function(block) {
    var items = [];
    var contentEl = block.querySelector('.block-content, [contenteditable="true"]');
    if (contentEl) {
      items.push(contentEl.textContent.trim());
    }

    // Also check for sibling list blocks
    var nextBlock = block.nextElementSibling;
    var blockType = block.getAttribute('data-block-type');
    while (nextBlock && nextBlock.getAttribute('data-block-type') === blockType) {
      var nextContent = nextBlock.querySelector('.block-content, [contenteditable="true"]');
      if (nextContent) {
        items.push(nextContent.textContent.trim());
      }
      nextBlock = nextBlock.nextElementSibling;
    }

    return items;
  };

  /**
   * Show Ask AI panel with chart context
   */
  ERM.reportEditorAI.showAskAIPanelForChart = function() {
    var self = this;

    // Close all other panels first
    this.closeAllPanels(true);

    var panel = document.getElementById('ask-ai-panel');

    if (!panel) {
      panel = this.createAskAIPanel();
      document.body.appendChild(panel);
    }

    // Update context for chart mode
    this.updateAskAIContextForChart(panel);

    // Position panel near the chart block
    var panelWidth = 380;
    var margin = 16;
    var viewportHeight = window.innerHeight;
    var viewportWidth = window.innerWidth;

    var left, top;

    if (state.activeBlock) {
      var blockRect = state.activeBlock.getBoundingClientRect();
      var spaceOnRight = viewportWidth - blockRect.right - margin;

      if (spaceOnRight >= panelWidth) {
        left = blockRect.right + 12;
        top = blockRect.top;
      } else {
        left = Math.max(margin, blockRect.left);
        top = blockRect.bottom + 12;
      }
    } else {
      left = (viewportWidth - panelWidth) / 2;
      top = viewportHeight * 0.15;
    }

    // Ensure panel stays in viewport
    if (left < margin) left = margin;
    if (left + panelWidth > viewportWidth - margin) {
      left = viewportWidth - panelWidth - margin;
    }
    if (top < margin) top = margin;

    var maxPanelHeight = Math.floor(viewportHeight * 0.70);
    var availableHeight = viewportHeight - top - margin;
    var finalMaxHeight = Math.min(maxPanelHeight, availableHeight);

    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    panel.style.right = 'auto';
    panel.style.width = panelWidth + 'px';
    panel.style.maxHeight = finalMaxHeight + 'px';

    panel.classList.add('visible');
    state.aiPanelVisible = true;

    document.body.classList.add('ask-ai-panel-open');

    // Focus input
    var input = panel.querySelector('#ask-ai-input');
    if (input) input.focus();
  };

  /**
   * Update Ask AI panel context display for chart or block mode
   */
  ERM.reportEditorAI.updateAskAIContextForChart = function(panel) {
    var titleEl = panel.querySelector('.ask-ai-title');
    var chipsContainer = panel.querySelector('.ask-ai-context-chips');
    var suggestionsArea = panel.querySelector('.ask-ai-suggestions');
    var self = this;

    if (state.aiMode === 'chart' && state.chartContext) {
      var ctx = state.chartContext;

      // Update title to show chart context
      if (titleEl) {
        titleEl.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/>' +
          '</svg>' +
          'Ask AI about: ' + this.escapeHtml(ctx.title);
      }

      // Update context chips
      if (chipsContainer) {
        var chips = [];
        chips.push('<span class="context-chip context-chip-chart">' + this.escapeHtml(ctx.title) + '</span>');
        if (ctx.register && ctx.register.title !== 'All Registers') {
          chips.push('<span class="context-chip context-chip-register">' + this.escapeHtml(ctx.register.title) + '</span>');
        }
        if (ctx.insights && ctx.insights.totalRisks !== undefined) {
          chips.push('<span class="context-chip context-chip-data">' + ctx.insights.totalRisks + ' risks</span>');
        }
        chipsContainer.innerHTML = chips.join('');
      }

      // Update suggestions for chart type
      if (suggestionsArea) {
        var suggestions = this.getChartSuggestions(ctx.chartKind);
        this.updateSuggestionsUI(panel, suggestionsArea, suggestions);
      }
    } else if (state.aiMode === 'block' && state.blockContext) {
      var ctx = state.blockContext;

      // Update title to show block context
      if (titleEl) {
        var titleText = ctx.hasContent ? 'Ask AI about this ' + ctx.title.toLowerCase() : 'Ask AI to write content';
        titleEl.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/>' +
          '</svg>' +
          titleText;
      }

      // Update context chips
      if (chipsContainer) {
        var chips = [];
        chips.push('<span class="context-chip context-chip-block">' + this.escapeHtml(ctx.title) + '</span>');
        if (ctx.wordCount > 0) {
          chips.push('<span class="context-chip context-chip-data">' + ctx.wordCount + ' words</span>');
        }
        if (ctx.isTable && ctx.tableData) {
          chips.push('<span class="context-chip context-chip-table">' + ctx.tableData.rows.length + ' rows</span>');
        }
        if (ctx.isList && ctx.listItems) {
          chips.push('<span class="context-chip context-chip-list">' + ctx.listItems.length + ' items</span>');
        }
        chipsContainer.innerHTML = chips.join('');
      }

      // Update suggestions for block type
      if (suggestionsArea) {
        var suggestions = this.getBlockSuggestions(ctx);
        this.updateSuggestionsUI(panel, suggestionsArea, suggestions);
      }
    } else {
      // Reset to default text mode
      if (titleEl) {
        titleEl.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/>' +
          '</svg>' +
          'Ask AI about this report';
      }
      this.updateAskAIContext(panel);
    }
  };

  /**
   * Helper to update suggestions UI with click handlers
   */
  ERM.reportEditorAI.updateSuggestionsUI = function(panel, suggestionsArea, suggestions) {
    var self = this;
    var html = '';
    for (var i = 0; i < suggestions.length; i++) {
      html += '<div class="suggestion-item" data-prompt="' + this.escapeHtml(suggestions[i]) + '">' + this.escapeHtml(suggestions[i]) + '</div>';
    }
    suggestionsArea.innerHTML = html;

    // Re-bind suggestion click events
    var items = suggestionsArea.querySelectorAll('.suggestion-item');
    for (var i = 0; i < items.length; i++) {
      items[i].addEventListener('click', function() {
        var prompt = this.getAttribute('data-prompt');
        panel.querySelector('#ask-ai-input').value = prompt;
        self.submitAskAI();
      });
    }
  };

  /**
   * Get suggested prompts for block context
   */
  ERM.reportEditorAI.getBlockSuggestions = function(ctx) {
    if (!ctx.hasContent) {
      // Empty block - suggest writing content
      return [
        'Write an executive summary',
        'Draft a risk overview section',
        'Create a recommendations list',
        'Write a conclusion paragraph'
      ];
    }

    if (ctx.isTable) {
      return [
        'Summarize this table data',
        'Analyze trends in this table',
        'Add commentary about these findings',
        'Convert this table to bullet points'
      ];
    }

    if (ctx.isList) {
      return [
        'Expand on these points',
        'Summarize this list',
        'Add more detail to each item',
        'Convert to a narrative paragraph'
      ];
    }

    // Default for text content
    return [
      'Improve this text',
      'Summarize for executives',
      'Expand with more detail',
      'Rewrite more formally'
    ];
  };

  /**
   * Get suggested prompts for chart type
   */
  ERM.reportEditorAI.getChartSuggestions = function(chartKind) {
    var suggestions = {
      'heatmap': [
        'Analyze the risk distribution in this heatmap',
        'What are the highest priority risks shown?',
        'Write a board-level summary of this heatmap',
        'Suggest mitigation priorities based on this data'
      ],
      'risks': [
        'Summarize the top risks and their impact',
        'What controls could mitigate these risks?',
        'Draft an executive summary of these risks',
        'Which risk needs immediate attention?'
      ],
      'chart': [
        'Analyze the risk concentration by category',
        'What trends do you see in this data?',
        'Which category needs the most attention?',
        'Write commentary on this distribution'
      ],
      'kpi': [
        'Interpret these KPI metrics for leadership',
        'What do these numbers suggest about our risk posture?',
        'What actions should we take based on these KPIs?',
        'Write a summary of these key metrics'
      ],
      'controls': [
        'Analyze the control coverage gaps',
        'Which risks need additional controls?',
        'Suggest improvements to our control framework',
        'Write a control effectiveness summary'
      ]
    };
    return suggestions[chartKind] || [
      'Analyze this content',
      'Summarize the key findings',
      'What insights can you provide?',
      'Write commentary for this section'
    ];
  };

  /**
   * Escape HTML helper
   */
  ERM.reportEditorAI.escapeHtml = function(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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
    console.log('[AI] highlightSelection called');

    // Block selection mode uses .block-selected CSS class
    if (state.selectedBlocks && state.selectedBlocks.length > 0) {
      console.log('[AI] Using block selection mode - blocks already highlighted');
      if (!state.selection && ERM.reportEditorV2 && ERM.reportEditorV2.getSelectedBlocksText) {
        state.selection = ERM.reportEditorV2.getSelectedBlocksText();
      }
      state.originalSelectionText = state.selection;
      return;
    }

    // Text selection mode - create blue border highlight spans
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

      var startContainer = range.startContainer;
      var endContainer = range.endContainer;
      var startOffset = range.startOffset;
      var endOffset = range.endOffset;

      // Helper to check if node is a text node
      function isTextNode(node) {
        return node && node.nodeType === 3;
      }

      // Helper to check if a node is within the selection range
      function isNodeInRange(node, selRange) {
        try {
          var nodeRange = document.createRange();
          nodeRange.selectNodeContents(node);
          // Check if node range intersects with selection range
          return selRange.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0 &&
                 selRange.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0;
        } catch (e) {
          return false;
        }
      }

      // Find the common ancestor - go up to editor content if needed
      var commonAncestor = range.commonAncestorContainer;
      if (commonAncestor.nodeType === 3) {
        commonAncestor = commonAncestor.parentNode;
      }

      // For multi-block selections, go up to the editor content
      var editorContent = document.querySelector('.editor-v2-content');
      if (editorContent && editorContent.contains(commonAncestor)) {
        // Check if selection spans multiple blocks
        var startBlock = startContainer.nodeType === 3 ? startContainer.parentNode.closest('.editor-v2-block') : startContainer.closest('.editor-v2-block');
        var endBlock = endContainer.nodeType === 3 ? endContainer.parentNode.closest('.editor-v2-block') : endContainer.closest('.editor-v2-block');

        if (startBlock && endBlock && startBlock !== endBlock) {
          // Multi-block selection - use editor content as ancestor
          commonAncestor = editorContent;
          console.log('[AI] Multi-block selection detected');
        }
      }

      // Collect all text nodes that are within the selection
      var textNodes = [];
      var walker = document.createTreeWalker(
        commonAncestor,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            // Skip empty text nodes
            if (!node.nodeValue || node.nodeValue.trim() === '') {
              // But keep nodes with just whitespace if they're part of selection
              if (node.nodeValue && isNodeInRange(node, range)) {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_REJECT;
            }
            // Check if this node is within the selection range
            if (isNodeInRange(node, range)) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_REJECT;
          }
        },
        false
      );

      var node;
      while ((node = walker.nextNode())) {
        textNodes.push(node);
      }

      // If no text nodes found with filter, try without filter
      if (textNodes.length === 0) {
        var simpleWalker = document.createTreeWalker(
          commonAncestor,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        var foundStart = false;
        while ((node = simpleWalker.nextNode())) {
          if (node === startContainer) foundStart = true;
          if (foundStart) textNodes.push(node);
          if (node === endContainer) break;
        }
      }

      // If still no text nodes found, try simple approach
      if (textNodes.length === 0 && isTextNode(startContainer)) {
        textNodes.push(startContainer);
      }

      console.log('[AI] Found', textNodes.length, 'text nodes to highlight');

      // Wrap each text node (or portion) in highlight span
      var highlightElements = [];

      for (var i = 0; i < textNodes.length; i++) {
        var textNode = textNodes[i];
        var parent = textNode.parentNode;
        if (!parent) continue;

        // Skip if already inside a highlight
        if (parent.classList && parent.classList.contains('ai-selection-highlight')) continue;

        // Skip if inside non-editable elements
        if (parent.closest && parent.closest('.block-controls, .block-add, .block-drag')) continue;

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

        // Skip if the text portion is empty or whitespace only (for non-edge nodes)
        var highlightText = text.substring(highlightStart, highlightEnd);
        if (textNode !== startContainer && textNode !== endContainer && !highlightText.trim()) continue;

        // Create highlight span
        var highlightSpan = document.createElement('span');
        highlightSpan.className = 'ai-selection-highlight';
        highlightSpan.setAttribute('data-ai-highlight', 'true');

        // Split text node if needed and wrap the highlighted portion
        var beforeText = text.substring(0, highlightStart);
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
      // Verify highlights are in DOM
      var inDOM = document.querySelectorAll('.ai-selection-highlight[data-ai-highlight]');
      console.log('[ReportEditorAI] Highlights found in DOM:', inDOM.length);
    } catch (e) {
      console.log('[ReportEditorAI] Could not highlight selection:', e.message, e.stack);
      // Fallback: try simple approach for single-node selections
      this.highlightSelectionSimple();
    }
  };

  /**
   * Simple fallback highlighting for single-node selections
   */
  ERM.reportEditorAI.highlightSelectionSimple = function() {
    console.log('[AI] highlightSelectionSimple called');
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

    // Position panel to the RIGHT of the selection (like Notion)
    // This ensures the selected text remains visible
    var panelWidth = 380;
    var margin = 16;
    var gap = 12;
    var left, top;

    // Get selection/highlight bounds to avoid covering
    var selectionRect = null;
    var toolbar = document.getElementById('report-floating-toolbar');

    // First try to get bounds from highlighted elements
    var highlights = document.querySelectorAll('.ai-selection-highlight[data-ai-highlight]');
    if (highlights.length > 0) {
      var firstHighlight = highlights[0];
      var lastHighlight = highlights[highlights.length - 1];
      var firstRect = firstHighlight.getBoundingClientRect();
      var lastRect = lastHighlight.getBoundingClientRect();
      selectionRect = {
        left: Math.min(firstRect.left, lastRect.left),
        right: Math.max(firstRect.right, lastRect.right),
        top: Math.min(firstRect.top, lastRect.top),
        bottom: Math.max(firstRect.bottom, lastRect.bottom)
      };
    }
    // Fallback to selection range
    else if (state.selectionRange) {
      var rangeRect = state.selectionRange.getBoundingClientRect();
      if (rangeRect.width > 0 || rangeRect.height > 0) {
        selectionRect = rangeRect;
      }
    }

    // VIEWPORT-AWARE POSITIONING
    // Panel must NEVER extend beyond viewport - actions must always be accessible
    var viewportHeight = window.innerHeight;
    var viewportWidth = window.innerWidth;

    // Cap panel height at 70% of viewport to ensure it always fits
    var maxPanelHeight = Math.floor(viewportHeight * 0.70);
    var estimatedPanelHeight = Math.min(380, maxPanelHeight); // Initial estimate

    // Position to the RIGHT of the selection if there's space
    if (selectionRect) {
      var spaceOnRight = viewportWidth - selectionRect.right - margin;
      var spaceOnLeft = selectionRect.left - margin;
      var spaceBelow = viewportHeight - selectionRect.bottom - margin;
      var spaceAbove = selectionRect.top - margin;

      if (spaceOnRight >= panelWidth) {
        // Plenty of space on right - position there
        left = selectionRect.right + gap;
        top = selectionRect.top;
      } else if (spaceOnLeft >= panelWidth) {
        // Space on left - position there
        left = selectionRect.left - panelWidth - gap;
        top = selectionRect.top;
      } else {
        // Not enough space on either side - position below or above
        if (toolbar && toolbar.classList.contains('visible')) {
          var toolbarRect = toolbar.getBoundingClientRect();
          left = Math.max(margin, toolbarRect.left);

          // Check if there's more space above or below
          if (spaceBelow >= estimatedPanelHeight) {
            top = toolbarRect.bottom + gap;
          } else if (spaceAbove >= estimatedPanelHeight) {
            // Position above the toolbar
            top = toolbarRect.top - estimatedPanelHeight - gap;
          } else {
            // Neither fits - use whatever space is larger
            if (spaceBelow >= spaceAbove) {
              top = toolbarRect.bottom + gap;
            } else {
              top = Math.max(margin, toolbarRect.top - estimatedPanelHeight - gap);
            }
          }
        } else {
          left = Math.max(margin, selectionRect.left);

          // Check if there's more space above or below
          if (spaceBelow >= estimatedPanelHeight) {
            top = selectionRect.bottom + gap;
          } else if (spaceAbove >= estimatedPanelHeight) {
            // Position above the selection
            top = selectionRect.top - estimatedPanelHeight - gap;
          } else {
            // Neither fits - use whatever space is larger
            if (spaceBelow >= spaceAbove) {
              top = selectionRect.bottom + gap;
            } else {
              top = Math.max(margin, selectionRect.top - estimatedPanelHeight - gap);
            }
          }
        }
      }
    } else {
      // No selection rect - center the panel vertically in upper portion of viewport
      left = (viewportWidth - panelWidth) / 2;
      top = viewportHeight * 0.15;
    }

    // CRITICAL: Ensure panel stays FULLY in viewport
    var actualPanelWidth = Math.min(panelWidth, viewportWidth - margin * 2);

    // Horizontal bounds
    if (left < margin) left = margin;
    if (left + actualPanelWidth > viewportWidth - margin) {
      left = viewportWidth - actualPanelWidth - margin;
    }

    // Vertical bounds - this is the key fix
    if (top < margin) top = margin;

    // Calculate maximum height that can fit from this top position
    var availableHeight = viewportHeight - top - margin;
    var finalMaxHeight = Math.min(maxPanelHeight, availableHeight);

    // If panel would be too short, try repositioning higher
    if (finalMaxHeight < 250 && top > margin) {
      // Move panel up to give more room
      var idealTop = viewportHeight - maxPanelHeight - margin;
      if (idealTop >= margin) {
        top = idealTop;
        finalMaxHeight = maxPanelHeight;
      } else {
        top = margin;
        finalMaxHeight = viewportHeight - margin * 2;
      }
    }

    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    panel.style.right = 'auto';
    panel.style.width = actualPanelWidth + 'px';
    panel.style.maxHeight = finalMaxHeight + 'px';

    panel.classList.add('visible');
    panel.classList.remove('dropdown-above', 'dropdown-below');
    state.aiPanelVisible = true;

    // LOCK PAGE SCROLL - Single scroll context
    // When panel is open, only the panel content scrolls
    document.body.classList.add('ask-ai-panel-open');

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

      // UNLOCK PAGE SCROLL
      document.body.classList.remove('ask-ai-panel-open');

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
      // Also clear the selection lock
      if (ERM.reportEditorV2 && ERM.reportEditorV2.selectionLock) {
        ERM.reportEditorV2.selectionLock.clear();
      }
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
      '  <div class="suggestion-item" data-prompt="Summarise for Board">Summarise for Board</div>' +
      '  <div class="suggestion-item" data-prompt="Explain high risk">Explain high risk</div>' +
      '  <div class="suggestion-item" data-prompt="Write management commentary">Management commentary</div>' +
      '  <div class="suggestion-item" data-prompt="Convert the selected text into a clean table with headers">Convert to table</div>' +
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
    // Use flex display for proper scroll context
    responseArea.style.display = 'flex';

    // Add pulsing animation to highlights during AI processing
    var processingHighlights = document.querySelectorAll('.ai-selection-highlight[data-ai-highlight]');
    for (var ph = 0; ph < processingHighlights.length; ph++) {
      processingHighlights[ph].classList.add('ai-processing');
    }

    // Build context for the AI
    var context = this.getReportContext();
    context.selectedText = state.selection || '';

    // Add chart context if in chart mode
    if (state.aiMode === 'chart' && state.chartContext) {
      context.chartContext = state.chartContext;
      context.isChartMode = true;
      console.log('[ReportEditorAI] Submitting with chart context:', {
        chartKind: state.chartContext.chartKind,
        register: state.chartContext.register.title,
        dataKeys: Object.keys(state.chartContext.data || {})
      });
    }

    // Add block context if in block mode
    if (state.aiMode === 'block' && state.blockContext) {
      context.blockContext = state.blockContext;
      context.isBlockMode = true;
      console.log('[ReportEditorAI] Submitting with block context:', {
        blockType: state.blockContext.blockType,
        wordCount: state.blockContext.wordCount,
        hasContent: state.blockContext.hasContent
      });
    }

    // Call the real AI service
    ERM.aiService.askQuestion(question, context, function(result) {
      // Remove pulsing animation from highlights (AI is done)
      var doneHighlights = document.querySelectorAll('.ai-selection-highlight.ai-processing');
      for (var dh = 0; dh < doneHighlights.length; dh++) {
        doneHighlights[dh].classList.remove('ai-processing');
      }
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

      // Build action buttons - Use SAME classes as AI Action panel (ai-inline-btn)
      var actionButtons =
        '    <button class="ai-inline-btn ai-inline-insert" data-action="insert">Insert below</button>';

      if (hasSelection) {
        actionButtons +=
          '    <button class="ai-inline-btn ai-inline-replace" data-action="replace">Replace</button>';
      }

      actionButtons +=
        '    <button class="ai-inline-btn ai-inline-retry ask-ai-clear-result">Clear</button>';

      responseArea.innerHTML =
        '<div class="ask-ai-result">' +
        '  <div class="result-text">' + formattedText + '</div>' +
        '  <div class="ai-inline-actions">' + actionButtons + '</div>' +
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
    // For block selection mode, we can proceed if we have selectedBlocks even without activeBlock
    var hasBlockSelection = state.selectedBlocks && state.selectedBlocks.length > 0;

    if (!state.pendingAIResult) {
      console.log('[ReportEditorAI] Cannot apply AI result - missing pendingAIResult');
      return;
    }

    if (!state.activeBlock && !hasBlockSelection) {
      console.log('[ReportEditorAI] Cannot apply AI result - missing activeBlock and no block selection');
      return;
    }

    var newText = state.pendingAIResult.text;
    var originalText = state.pendingAIResult.originalText || state.selection;

    // Use activeBlock if available, otherwise get first selected block
    var block = state.activeBlock;
    if (!block && hasBlockSelection) {
      block = document.querySelector('[data-block-id="' + state.selectedBlocks[0] + '"]');
    }

    console.log('[ReportEditorAI] Applying AI result:', mode);
    console.log('[ReportEditorAI] AI Mode:', state.aiMode, 'Block type:', block ? block.getAttribute('data-block-type') : 'none');
    if (state.aiMode === 'chart' && block) {
      console.log('[ReportEditorAI] Insert Below for chart block:', block.getAttribute('data-block-id'), 'embed-type:', block.getAttribute('data-embed-type'));
    }

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

    // CLEAR SELECTION LOCK after applying result
    // This cleans up the persistent highlight spans
    if (ERM.reportEditorV2 && ERM.reportEditorV2.selectionLock) {
      ERM.reportEditorV2.selectionLock.clear();
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

    // Check if we're in BLOCK SELECTION MODE (checkbox multi-select)
    // This is different from text selection - whole blocks are selected
    console.log('[ReportEditorAI] applyAIResultV2 - selectedBlocks:', state.selectedBlocks, 'length:', state.selectedBlocks ? state.selectedBlocks.length : 0);

    if (state.selectedBlocks && state.selectedBlocks.length > 0) {
      console.log('[ReportEditorAI] Block selection mode - replacing', state.selectedBlocks.length, 'blocks');
      console.log('[ReportEditorAI] Block IDs:', state.selectedBlocks);
      console.log('[ReportEditorAI] Parsed blocks count:', parsedBlocks.length);

      // Get all selected block elements in DOM order
      var selectedBlockEls = [];
      for (var sb = 0; sb < state.selectedBlocks.length; sb++) {
        var blockEl = document.querySelector('[data-block-id="' + state.selectedBlocks[sb] + '"]');
        if (blockEl) {
          selectedBlockEls.push(blockEl);
          console.log('[ReportEditorAI] Found block element for ID:', state.selectedBlocks[sb]);
        } else {
          console.log('[ReportEditorAI] WARNING: Block element NOT found for ID:', state.selectedBlocks[sb]);
        }
      }

      if (selectedBlockEls.length > 0) {
        // Find the block BEFORE the first selected block (insertion point)
        var firstSelectedBlock = selectedBlockEls[0];
        var insertionPoint = firstSelectedBlock.previousElementSibling;
        var editorContent = firstSelectedBlock.closest('.editor-v2-content');

        if (mode === 'replace') {
          // REPLACE: Remove all selected blocks and insert new content

          // If no block before first selected, we need to keep one block as reference
          // Strategy: Keep the first selected block temporarily, insert after it, then remove it
          if (!insertionPoint || !insertionPoint.classList.contains('editor-v2-block')) {
            // Use first selected block as temporary insertion point
            lastBlock = firstSelectedBlock;

            // Insert all new blocks after the first selected block
            for (var i = 0; i < parsedBlocks.length; i++) {
              lastBlock = this.insertFormattedBlock(lastBlock, parsedBlocks[i]);
            }

            // Now remove all originally selected blocks (including the temporary reference)
            for (var r = 0; r < selectedBlockEls.length; r++) {
              if (selectedBlockEls[r].parentNode) {
                selectedBlockEls[r].parentNode.removeChild(selectedBlockEls[r]);
              }
            }
          } else {
            // There's a block before - remove all selected first, then insert after that block
            for (var r = 0; r < selectedBlockEls.length; r++) {
              if (selectedBlockEls[r].parentNode) {
                selectedBlockEls[r].parentNode.removeChild(selectedBlockEls[r]);
              }
            }

            // Insert new blocks after the insertion point
            lastBlock = insertionPoint;
            for (var i = 0; i < parsedBlocks.length; i++) {
              lastBlock = this.insertFormattedBlock(lastBlock, parsedBlocks[i]);
            }
          }

        } else if (mode === 'insert') {
          // INSERT: Keep selected blocks, add new content after last selected
          lastBlock = selectedBlockEls[selectedBlockEls.length - 1];
          for (var i = 0; i < parsedBlocks.length; i++) {
            lastBlock = this.insertFormattedBlock(lastBlock, parsedBlocks[i]);
          }
        } else {
          // APPEND: Same as insert for block selection
          lastBlock = selectedBlockEls[selectedBlockEls.length - 1];
          for (var i = 0; i < parsedBlocks.length; i++) {
            lastBlock = this.insertFormattedBlock(lastBlock, parsedBlocks[i]);
          }
        }

        // Clear block selection state
        state.selectedBlocks = [];
        if (ERM.reportEditorV2 && ERM.reportEditorV2.clearBlockSelection) {
          ERM.reportEditorV2.clearBlockSelection();
        }

        // Focus the last inserted block
        if (lastBlock) {
          setTimeout(function() {
            var editable = lastBlock.querySelector('[contenteditable="true"]');
            if (editable) editable.focus();
          }, 100);
        }

        return; // Early return - block selection handled
      }
    }

    if (mode === 'replace') {
      // REPLACE: Remove ALL highlighted text spans and insert new content
      // Check for selection lock highlights first, then fall back to ai-selection-highlight
      var allHighlights = document.querySelectorAll('.selection-lock[data-selection-lock]');
      if (allHighlights.length === 0) {
        allHighlights = document.querySelectorAll('.ai-selection-highlight[data-ai-highlight]');
      }

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

        // Also clear selection lock if it was used
        if (ERM.reportEditorV2 && ERM.reportEditorV2.selectionLock) {
          ERM.reportEditorV2.selectionLock.clear();
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

})();

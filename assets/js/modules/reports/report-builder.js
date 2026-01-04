/**
 * Dimeri ERM - Report Builder
 * 4-Step Wizard: Details → Data Sources → Sections → Preview & Generate
 * Then Edit Content Modal with side-by-side editor and live preview
 * ES5 Compatible
 */

(function () {
  'use strict';

  window.ERM = window.ERM || {};
  ERM.ReportBuilder = ERM.ReportBuilder || {};

  // ========================================
  // BUILDER STATE
  // ========================================

  var builderState = {
    currentStep: 1,
    totalSteps: 4,
    config: {
      title: '',
      reportType: 'comprehensive',
      period: 'current',
      audience: 'executive',
      classification: 'internal',
      exportFormat: 'pdf',
      distributionList: '',
      selectedRegister: null,
      selectedControls: [],
      selectedKRIs: [],
      dataSources: [],
      sections: []
    },
    fetchedData: null,
    editedContent: {},
    activeEditorSection: null,
    draggedItem: null
  };

  // ========================================
  // REPORT TYPE DEFINITIONS
  // ========================================

  var reportTypes = [
    { id: 'comprehensive', name: 'Comprehensive Risk Report', description: 'Full ERM report with all modules' },
    { id: 'executive', name: 'Executive Summary', description: 'High-level overview for leadership' },
    { id: 'board', name: 'Board Risk Report', description: 'Quarterly board presentation' },
    { id: 'control', name: 'Control Assessment', description: 'Control effectiveness focus' },
    { id: 'custom', name: 'Custom Report', description: 'Type your own report name' }
  ];

  // ========================================
  // SECTION DEFINITIONS BY DATA SOURCE
  // ========================================

  var sectionsBySource = {
    risk_register: [
      { id: 'risk_overview', name: 'Risk Overview', description: 'Summary statistics and distribution' },
      { id: 'top_risks', name: 'Top 10 Enterprise Risks', description: 'Highest rated risks requiring attention' },
      { id: 'risk_heatmap', name: 'Risk Heat Map', description: 'Visual likelihood vs impact matrix' },
      { id: 'risk_by_category', name: 'Risks by Category', description: 'Breakdown by risk category' },
      { id: 'risk_appetite', name: 'Risk Appetite Status', description: 'Status against defined thresholds' }
    ],
    controls: [
      { id: 'control_summary', name: 'Control Summary', description: 'Overall effectiveness metrics' },
      { id: 'control_gaps', name: 'Control Gaps', description: 'Ineffective controls requiring attention' },
      { id: 'control_testing', name: 'Testing Results', description: 'Recent test outcomes' }
    ],
    kri_dashboard: [
      { id: 'kri_summary', name: 'Key Risk Indicators', description: 'KRI overview and status' },
      { id: 'kri_breaches', name: 'Threshold Breaches', description: 'KRIs exceeding limits' },
      { id: 'kri_trends', name: 'KRI Trends', description: 'Indicator movement over time' }
    ]
  };

  // ========================================
  // INITIALIZATION
  // ========================================

  ERM.ReportBuilder.init = function () {
    console.log('[ReportBuilder] Initialized');
  };

  // ========================================
  // OPEN BUILDER
  // ========================================

  ERM.ReportBuilder.open = function () {
    builderState.currentStep = 1;
    builderState.config = {
      title: '',
      reportType: 'comprehensive',
      period: 'current',
      audience: 'executive',
      classification: 'internal',
      customPeriod: '',
      customAudience: '',
      customReportName: '',
      exportFormat: 'pdf',
      distributionList: '',
      dataSources: [],
      sections: [],
      selectedRegister: null,
      selectedControls: [],
      selectedKRIs: []
    };
    builderState.fetchedData = null;
    builderState.editedContent = {};
    builderState.activeEditorSection = null;

    this.renderStep(1);
  };

  // ========================================
  // RENDER STEPS
  // ========================================

  ERM.ReportBuilder.renderStep = function (step) {
    builderState.currentStep = step;

    var content = '';
    content += '<div class="report-builder-wizard">';
    content += this.renderProgressBar();
    content += '<div class="builder-step-content">';

    switch (step) {
      case 1:
        content += this.renderStep1_ReportDetails();
        break;
      case 2:
        content += this.renderStep2_DataSources();
        break;
      case 3:
        content += this.renderStep3_Sections();
        break;
      case 4:
        content += this.renderStep4_PreviewGenerate();
        break;
    }

    content += '</div>';
    content += '</div>';

    var buttons = this.getStepButtons(step);

    ERM.components.showModal({
      title: 'Report Builder',
      content: content,
      size: 'xl',
      buttons: buttons,
      onAction: function (action) {
        ERM.ReportBuilder.handleAction(action);
      }
    });

    setTimeout(function () {
      ERM.ReportBuilder.initStepEvents(step);
    }, 100);
  };

  // ========================================
  // PROGRESS BAR
  // ========================================

  ERM.ReportBuilder.renderProgressBar = function () {
    var steps = [
      { num: 1, label: 'Report Details' },
      { num: 2, label: 'Data Sources' },
      { num: 3, label: 'Sections' },
      { num: 4, label: 'Preview & Generate' }
    ];

    var html = '<div class="builder-progress">';

    for (var i = 0; i < steps.length; i++) {
      var step = steps[i];
      var statusClass = '';
      if (step.num < builderState.currentStep) {
        statusClass = 'completed';
      } else if (step.num === builderState.currentStep) {
        statusClass = 'active';
      }

      html += '<div class="progress-step ' + statusClass + '">';
      html += '  <div class="step-number">' + (statusClass === 'completed' ? '✓' : step.num) + '</div>';
      html += '  <div class="step-label">' + step.label + '</div>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  };

  // ========================================
  // STEP 1: REPORT DETAILS
  // ========================================

  ERM.ReportBuilder.renderStep1_ReportDetails = function () {
    // Get dynamic date info
    var now = new Date();
    var currentYear = now.getFullYear();
    var currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
    var lastYear = currentYear - 1;

    var html = '';
    html += '<div class="builder-step active" data-step="1">';
    html += '  <h3 class="step-title">Report Details</h3>';
    html += '  <p class="step-description">Set up the basic information for your report.</p>';

    // Report Title
    html += '  <div class="form-group">';
    html += '    <label class="form-label">Report Title <span class="required">*</span></label>';
    html += '    <input type="text" class="form-input" id="report-title" placeholder="e.g., Q' + currentQuarter + ' ' + currentYear + ' Risk Report" value="' + ERM.utils.escapeHtml(builderState.config.title) + '">';
    html += '  </div>';

    // Two column row: Period and Audience
    html += '  <div class="form-row">';

    // Report Period - Dynamic quarters
    html += '    <div class="form-group">';
    html += '      <label class="form-label">Reporting Period</label>';
    html += '      <select class="form-select" id="report-period">';
    html += '        <option value="current"' + (builderState.config.period === 'current' ? ' selected' : '') + '>Current Quarter (Q' + currentQuarter + ' ' + currentYear + ')</option>';

    // Show previous quarters dynamically
    for (var q = currentQuarter - 1; q >= 1; q--) {
      var qVal = 'q' + q;
      html += '        <option value="' + qVal + '"' + (builderState.config.period === qVal ? ' selected' : '') + '>Q' + q + ' ' + currentYear + '</option>';
    }
    // Add last year's Q4 if we're in Q1
    if (currentQuarter === 1) {
      html += '        <option value="q4_prev"' + (builderState.config.period === 'q4_prev' ? ' selected' : '') + '>Q4 ' + lastYear + '</option>';
    }

    html += '        <option value="ytd"' + (builderState.config.period === 'ytd' ? ' selected' : '') + '>Year to Date (' + currentYear + ')</option>';
    html += '        <option value="annual"' + (builderState.config.period === 'annual' ? ' selected' : '') + '>Annual ' + lastYear + '</option>';
    html += '        <option value="custom"' + (builderState.config.period === 'custom' ? ' selected' : '') + '>Custom Period</option>';
    html += '      </select>';
    html += '      <input type="text" class="form-input" id="custom-period" placeholder="Enter custom period" style="margin-top: 8px; display: ' + (builderState.config.period === 'custom' ? 'block' : 'none') + ';" value="' + ERM.utils.escapeHtml(builderState.config.customPeriod || '') + '">';
    html += '    </div>';

    // Target Audience - Simplified
    html += '    <div class="form-group">';
    html += '      <label class="form-label">Target Audience</label>';
    html += '      <select class="form-select" id="report-audience">';
    html += '        <option value="board"' + (builderState.config.audience === 'board' ? ' selected' : '') + '>Board of Directors</option>';
    html += '        <option value="executive"' + (builderState.config.audience === 'executive' ? ' selected' : '') + '>Executive Committee</option>';
    html += '        <option value="management"' + (builderState.config.audience === 'management' ? ' selected' : '') + '>Senior Management</option>';
    html += '        <option value="general"' + (builderState.config.audience === 'general' ? ' selected' : '') + '>General Stakeholders</option>';
    html += '      </select>';
    html += '    </div>';

    html += '  </div>';

    // Classification
    html += '  <div class="form-group">';
    html += '    <label class="form-label">Classification</label>';
    html += '    <div class="classification-options">';
    var classificationOptions = ['internal', 'confidential', 'restricted'];
    for (var c = 0; c < classificationOptions.length; c++) {
      var cls = classificationOptions[c];
      var isClsSelected = builderState.config.classification === cls;
      html += '      <label class="classification-option' + (isClsSelected ? ' selected' : '') + '">';
      html += '        <input type="radio" name="classification" value="' + cls + '"' + (isClsSelected ? ' checked' : '') + '>';
      html += '        <span class="option-label">' + cls.charAt(0).toUpperCase() + cls.slice(1) + '</span>';
      html += '      </label>';
    }
    html += '    </div>';
    html += '  </div>';

    html += '</div>';
    return html;
  };

  // ========================================
  // STEP 2: DATA SOURCES (CASCADING SELECTION)
  // ========================================

  ERM.ReportBuilder.renderStep2_DataSources = function () {
    // Check if KRIs exist
    var allKRIs = ERM.storage.get('kris') || [];
    var hasKRIs = allKRIs.length > 0;
    var allControls = ERM.storage.get('controls') || [];
    var hasControls = allControls.length > 0;

    var html = '';
    html += '<div class="builder-step active" data-step="2">';
    html += '  <h3 class="step-title">Select Report Data</h3>';
    html += '  <p class="step-description">Select which risk register to report on' + (hasControls ? ' and choose related controls' : '') + '.</p>';

    // SECTION 1: Risk Register Selection (Dropdown)
    html += '  <div class="data-section">';
    html += '    <h4 class="data-section-title">1. Risk Register</h4>';
    html += '    <div class="register-dropdown-container">';
    html += '      <select id="register-dropdown" class="register-dropdown">';
    html += '        <option value="">Select a risk register...</option>';
    html += this.renderRegisterDropdownOptions();
    html += '      </select>';
    html += '    </div>';
    html += '  </div>';

    // SECTION 2: Controls (only show if controls exist)
    if (hasControls) {
      html += '  <div class="data-section">';
      html += '    <h4 class="data-section-title">2. Controls <span style="font-weight: normal; color: #94a3b8; font-size: 12px;">(Optional)</span></h4>';
      html += '    <div class="controls-selection-grid" id="controls-selection-grid">';
      html += this.renderControlsSelectionCards();
      html += '    </div>';
      html += '  </div>';
    }

    // SECTION 3: Dashboard KRIs (only show if KRIs exist)
    if (hasKRIs) {
      var sectionNum = hasControls ? '3' : '2';
      html += '  <div class="data-section">';
      html += '    <h4 class="data-section-title">' + sectionNum + '. Metrics <span style="font-weight: normal; color: #94a3b8; font-size: 12px;">(Optional)</span></h4>';
      html += '    <div class="kri-selection-grid" id="kri-selection-grid">';
      html += this.renderKRISelectionCards();
      html += '    </div>';
      html += '  </div>';
    }

    // Selection Summary
    var selectedRegisterCount = builderState.config.selectedRegister ? 1 : 0;
    html += '  <div class="selection-summary-box">';
    html += '    <div class="summary-item">';
    html += '      <span class="summary-label">Register:</span>';
    html += '      <span class="summary-count" id="selected-register-count">' + selectedRegisterCount + '</span>';
    html += '    </div>';
    if (hasControls) {
      html += '    <div class="summary-item">';
      html += '      <span class="summary-label">Controls:</span>';
      html += '      <span class="summary-count" id="selected-controls-count">' + builderState.config.selectedControls.length + '</span>';
      html += '    </div>';
    }
    if (hasKRIs) {
      html += '    <div class="summary-item">';
      html += '      <span class="summary-label">Metrics:</span>';
      html += '      <span class="summary-count" id="selected-kris-count">' + builderState.config.selectedKRIs.length + '</span>';
      html += '    </div>';
    }
    html += '  </div>';

    html += '</div>';
    return html;
  };

  ERM.ReportBuilder.getDataCount = function (sourceId) {
    var count = 0;
    if (ERM.storage) {
      switch (sourceId) {
        case 'risk_register':
          count = (ERM.storage.get('risks') || []).length;
          break;
        case 'controls':
          count = (ERM.storage.get('controls') || []).length;
          break;
        case 'kri_dashboard':
          count = (ERM.storage.get('kris') || []).length;
          break;
        case 'incidents':
          count = (ERM.storage.get('incidents') || []).length;
          break;
      }
    }
    return count;
  };

  // Render Risk Register Selection Cards
  /**
   * Render register dropdown options
   */
  ERM.ReportBuilder.renderRegisterDropdownOptions = function () {
    var registers = ERM.storage.get('registers') || [];
    var risks = ERM.storage.get('risks') || [];
    var html = '';

    for (var i = 0; i < registers.length; i++) {
      var register = registers[i];
      var isSelected = builderState.config.selectedRegister === register.id;

      // Count risks in this register
      var riskCount = 0;
      for (var j = 0; j < risks.length; j++) {
        if (risks[j].registerId === register.id) {
          riskCount++;
        }
      }

      var displayName = ERM.utils.escapeHtml(register.name || 'Untitled Register') + ' (' + riskCount + ' risk' + (riskCount !== 1 ? 's' : '') + ')';
      html += '<option value="' + register.id + '"' + (isSelected ? ' selected' : '') + '>' + displayName + '</option>';
    }

    return html;
  };

  // Render Controls Selection Cards (filtered by selected register)
  ERM.ReportBuilder.renderControlsSelectionCards = function () {
    var allControls = ERM.storage.get('controls') || [];
    var allRisks = ERM.storage.get('risks') || [];
    var selectedRegisterId = builderState.config.selectedRegister;
    var html = '';

    if (!selectedRegisterId) {
      html += '<div class="empty-state-info">Select a risk register first to see related controls</div>';
      return html;
    }

    // Get risk IDs from the selected register
    var registerRiskIds = [];
    for (var i = 0; i < allRisks.length; i++) {
      if (allRisks[i].registerId === selectedRegisterId) {
        registerRiskIds.push(allRisks[i].id);
      }
    }

    // Filter controls linked to risks in the selected register
    var linkedControls = [];
    for (var j = 0; j < allControls.length; j++) {
      var control = allControls[j];
      if (control.linkedRisks && control.linkedRisks.length > 0) {
        for (var k = 0; k < control.linkedRisks.length; k++) {
          if (registerRiskIds.indexOf(control.linkedRisks[k]) !== -1) {
            linkedControls.push(control);
            break;
          }
        }
      }
    }

    if (linkedControls.length === 0) {
      html += '<div class="empty-state-info">No controls linked to risks in selected register</div>';
      return html;
    }

    for (var m = 0; m < linkedControls.length; m++) {
      var ctrl = linkedControls[m];
      var isSelected = builderState.config.selectedControls.indexOf(ctrl.id) !== -1;
      var effectiveness = ctrl.effectiveness || 'Unknown';

      html += '<div class="selection-card control-card ' + (isSelected ? 'selected' : '') + '" data-control-id="' + ctrl.id + '">';
      html += '  <div class="card-checkbox">';
      html += '    <input type="checkbox" ' + (isSelected ? 'checked' : '') + '>';
      html += '  </div>';
      html += '  <div class="card-content">';
      html += '    <div class="card-title">' + ERM.utils.escapeHtml(ctrl.title || ctrl.name || 'Untitled Control') + '</div>';
      html += '    <div class="card-meta">';
      html += '      <span class="control-effectiveness">' + effectiveness + '</span>';
      html += '      <span class="control-type">' + ERM.utils.escapeHtml(ctrl.type || 'N/A') + '</span>';
      html += '    </div>';
      html += '  </div>';
      html += '</div>';
    }

    return html;
  };

  // Render KRI Selection Cards (filtered by selected register)
  ERM.ReportBuilder.renderKRISelectionCards = function () {
    var allKRIs = ERM.storage.get('kris') || [];
    var allRisks = ERM.storage.get('risks') || [];
    var selectedRegisterId = builderState.config.selectedRegister;
    var html = '';

    if (!selectedRegisterId) {
      html += '<div class="empty-state-info">Select a risk register first to see related metrics</div>';
      return html;
    }

    // Get risk IDs from the selected register
    var registerRiskIds = [];
    for (var i = 0; i < allRisks.length; i++) {
      if (allRisks[i].registerId === selectedRegisterId) {
        registerRiskIds.push(allRisks[i].id);
      }
    }

    // Filter KRIs linked to risks in the selected register
    var linkedKRIs = [];
    for (var j = 0; j < allKRIs.length; j++) {
      var kri = allKRIs[j];
      if (kri.linkedRisk && registerRiskIds.indexOf(kri.linkedRisk) !== -1) {
        linkedKRIs.push(kri);
      }
    }

    if (linkedKRIs.length === 0) {
      html += '<div class="empty-state-info">No dashboard metrics linked to risks in selected register</div>';
      return html;
    }

    for (var k = 0; k < linkedKRIs.length; k++) {
      var metric = linkedKRIs[k];
      var isSelected = builderState.config.selectedKRIs.indexOf(metric.id) !== -1;
      var trend = metric.trend || 'stable';

      html += '<div class="selection-card kri-card ' + (isSelected ? 'selected' : '') + '" data-kri-id="' + metric.id + '">';
      html += '  <div class="card-checkbox">';
      html += '    <input type="checkbox" ' + (isSelected ? 'checked' : '') + '>';
      html += '  </div>';
      html += '  <div class="card-content">';
      html += '    <div class="card-title">' + ERM.utils.escapeHtml(metric.name || 'Untitled Metric') + '</div>';
      html += '    <div class="card-meta">';
      html += '      <span class="kri-trend ' + trend + '">' + trend.charAt(0).toUpperCase() + trend.slice(1) + '</span>';
      html += '      <span class="kri-value">' + (metric.currentValue || 'N/A') + '</span>';
      html += '    </div>';
      html += '  </div>';
      html += '</div>';
    }

    return html;
  };

  ERM.ReportBuilder.getRiskLevel = function (score) {
    if (score >= 20) return 'critical';
    if (score >= 15) return 'high';
    if (score >= 10) return 'medium';
    return 'low';
  };

  // ========================================
  // STEP 3: SECTIONS
  // ========================================

  ERM.ReportBuilder.renderStep3_Sections = function () {
    var html = '';
    html += '<div class="builder-step active" data-step="3">';
    html += '  <h3 class="step-title">Select & Order Report Sections</h3>';
    html += '  <p class="step-description">Choose which sections to include. Drag to reorder.</p>';

    if (builderState.config.dataSources.length === 0) {
      html += '  <div class="no-sections-warning">';
      html += '    <p>No sections available. Please go back and select at least one data source.</p>';
      html += '  </div>';
    } else {
      html += '  <div class="sections-container">';

      // Initialize sections if empty
      if (builderState.config.sections.length === 0) {
        this.initializeSections();
      }

      // Render draggable sections list
      html += '    <div class="sections-checklist" id="sections-checklist">';
      html += this.renderSectionsChecklist();
      html += '    </div>';

      html += '    <button type="button" class="btn btn-sm btn-secondary btn-add-section" onclick="ERM.ReportBuilder.addCustomSection()">+ Add Custom Section</button>';

      html += '  </div>';

      var enabledCount = builderState.config.sections.filter(function (s) { return s.enabled; }).length;
      html += '  <div class="selection-summary">';
      html += '    <span>' + enabledCount + ' section(s) will be included in report</span>';
      html += '  </div>';
    }

    html += '</div>';
    return html;
  };

  ERM.ReportBuilder.initializeSections = function () {
    var sections = [];

    // Add Table of Contents first (always enabled, not editable)
    sections.push({ id: 'table_of_contents', name: 'Table of Contents', enabled: true, locked: true });

    // Add common sections (exec summary)
    sections.push({ id: 'exec_summary', name: 'Executive Summary', enabled: true });

    // Add sections from selected data sources
    for (var i = 0; i < builderState.config.dataSources.length; i++) {
      var sourceId = builderState.config.dataSources[i];
      var sourceSections = sectionsBySource[sourceId] || [];
      for (var j = 0; j < sourceSections.length; j++) {
        sections.push({
          id: sourceSections[j].id,
          name: sourceSections[j].name,
          enabled: true
        });
      }
    }

    // Add remaining common sections at end
    sections.push({ id: 'recommendations', name: 'Recommendations', enabled: true });
    sections.push({ id: 'appendix', name: 'Appendix', enabled: false });

    builderState.config.sections = sections;
  };

  ERM.ReportBuilder.renderSectionsChecklist = function () {
    var html = '';

    for (var i = 0; i < builderState.config.sections.length; i++) {
      var section = builderState.config.sections[i];
      var isLocked = section.locked === true;

      html += '<div class="section-checklist-item' + (isLocked ? ' section-locked' : '') + '" data-section-id="' + section.id + '" data-index="' + i + '" draggable="' + (!isLocked) + '">';

      // Drag handle (hidden for locked sections)
      if (!isLocked) {
        html += '  <span class="drag-handle" title="Drag to reorder">&#8942;&#8942;</span>';
      } else {
        html += '  <span class="lock-icon" title="Required section">🔒</span>';
      }

      html += '  <label class="checkbox-wrapper">';
      // Checkbox (disabled for locked sections)
      if (!isLocked) {
        html += '    <input type="checkbox" ' + (section.enabled ? 'checked' : '') + ' data-section="' + section.id + '">';
      } else {
        html += '    <input type="checkbox" checked disabled data-section="' + section.id + '">';
      }
      html += '    <span class="section-name">' + ERM.utils.escapeHtml(section.name) + '</span>';
      html += '  </label>';

      // Action buttons (hidden for locked sections)
      if (!isLocked) {
        html += '  <div class="section-actions">';
        html += '    <button type="button" class="btn-edit-section" onclick="ERM.ReportBuilder.editSection(\'' + section.id + '\')" title="Edit name">&#9998;</button>';
        html += '    <button type="button" class="btn-remove-section" onclick="ERM.ReportBuilder.removeSection(\'' + section.id + '\')" title="Remove">&times;</button>';
        html += '  </div>';
      }

      html += '</div>';
    }

    return html;
  };

  ERM.ReportBuilder.editSection = function (sectionId) {
    var self = this;
    var section = null;
    for (var i = 0; i < builderState.config.sections.length; i++) {
      if (builderState.config.sections[i].id === sectionId) {
        section = builderState.config.sections[i];
        break;
      }
    }
    if (!section) return;

    // Create inline edit popup
    var popup = document.createElement('div');
    popup.className = 'inline-edit-popup';
    popup.innerHTML =
      '<div class="inline-popup-content">' +
      '  <div class="inline-popup-header">' +
      '    <span>✎ Edit Section</span>' +
      '    <button class="inline-popup-close" onclick="this.closest(\'.inline-edit-popup\').remove()">×</button>' +
      '  </div>' +
      '  <div class="inline-popup-body">' +
      '    <input type="text" class="inline-popup-input" id="inline-edit-input" value="' + ERM.utils.escapeHtml(section.name) + '" placeholder="Section name">' +
      '  </div>' +
      '  <div class="inline-popup-footer">' +
      '    <button class="btn btn-sm btn-secondary" onclick="this.closest(\'.inline-edit-popup\').remove()">Cancel</button>' +
      '    <button class="btn btn-sm btn-primary" id="inline-save-btn">Save</button>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(popup);

    // Trigger animation
    setTimeout(function() {
      popup.classList.add('active');
    }, 10);

    var input = document.getElementById('inline-edit-input');
    var saveBtn = document.getElementById('inline-save-btn');

    if (input) {
      input.focus();
      input.select();

      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          saveBtn.click();
        } else if (e.key === 'Escape') {
          popup.remove();
        }
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var newName = input.value.trim();
        if (newName && newName !== section.name) {
          section.name = newName;
          var checklist = document.getElementById('sections-checklist');
          if (checklist) {
            checklist.innerHTML = self.renderSectionsChecklist();
            self.initDragAndDrop();
            self.initCheckboxEvents();
          }
          ERM.toast.show({ type: 'success', message: 'Section renamed' });
        }
        popup.remove();
      });
    }

    setTimeout(function() {
      popup.classList.add('active');
    }, 10);
  };

  ERM.ReportBuilder.addCustomSection = function () {
    var self = this;

    // Create inline add popup
    var popup = document.createElement('div');
    popup.className = 'inline-edit-popup';
    popup.innerHTML =
      '<div class="inline-popup-content inline-popup-wide">' +
      '  <div class="inline-popup-header">' +
      '    <span>➕ Add Custom Section</span>' +
      '    <button class="inline-popup-close" onclick="this.closest(\'.inline-edit-popup\').remove()">×</button>' +
      '  </div>' +
      '  <div class="inline-popup-body">' +
      '    <p class="inline-popup-description">Create a custom section for your report</p>' +
      '    <input type="text" class="inline-popup-input" id="inline-add-input" placeholder="e.g., Risk Mitigation Strategy">' +
      '    <div class="inline-popup-chips">' +
      '      <p class="chips-label">Common sections:</p>' +
      '      <button type="button" class="chip-btn" data-name="Risk Mitigation Strategy">Risk Mitigation Strategy</button>' +
      '      <button type="button" class="chip-btn" data-name="Compliance Overview">Compliance Overview</button>' +
      '      <button type="button" class="chip-btn" data-name="Financial Impact">Financial Impact</button>' +
      '      <button type="button" class="chip-btn" data-name="Action Items">Action Items</button>' +
      '    </div>' +
      '  </div>' +
      '  <div class="inline-popup-footer">' +
      '    <button class="btn btn-sm btn-secondary" onclick="this.closest(\'.inline-edit-popup\').remove()">Cancel</button>' +
      '    <button class="btn btn-sm btn-primary" id="inline-add-btn">Add Section</button>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(popup);

    // Trigger animation
    setTimeout(function() {
      popup.classList.add('active');
    }, 10);

    var input = document.getElementById('inline-add-input');
    var addBtn = document.getElementById('inline-add-btn');

    if (input) {
      input.focus();

      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          addBtn.click();
        } else if (e.key === 'Escape') {
          popup.remove();
        }
      });
    }

    // Bind chip buttons
    var chips = popup.querySelectorAll('.chip-btn');
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener('click', function() {
        var name = this.getAttribute('data-name');
        if (input) {
          input.value = name;
          input.focus();
        }
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', function() {
        var name = input.value.trim();

        if (!name) {
          ERM.toast.show({ type: 'error', message: 'Please enter a section name' });
          input.focus();
          return;
        }

        var customId = 'custom_' + Date.now();
        var appendixIndex = -1;
        for (var i = 0; i < builderState.config.sections.length; i++) {
          if (builderState.config.sections[i].id === 'appendix') {
            appendixIndex = i;
            break;
          }
        }

        var newSection = { id: customId, name: name, enabled: true };
        if (appendixIndex >= 0) {
          builderState.config.sections.splice(appendixIndex, 0, newSection);
        } else {
          builderState.config.sections.push(newSection);
        }

        var checklistEl = document.getElementById('sections-checklist');
        if (checklistEl) {
          checklistEl.innerHTML = self.renderSectionsChecklist();
          self.initDragAndDrop();
          self.initCheckboxEvents();
        }
        self.updateSectionCount();

        ERM.toast.show({ type: 'success', message: 'Section added: ' + name });
        popup.remove();
      });
    }

    setTimeout(function() {
      popup.classList.add('active');
    }, 10);
  };

  ERM.ReportBuilder.removeSection = function (sectionId) {
    builderState.config.sections = builderState.config.sections.filter(function (s) {
      return s.id !== sectionId;
    });

    var checklistEl = document.getElementById('sections-checklist');
    if (checklistEl) {
      checklistEl.innerHTML = this.renderSectionsChecklist();
      this.initDragAndDrop();
      this.initCheckboxEvents();
    }
    this.updateSectionCount();
  };

  ERM.ReportBuilder.updateSectionCount = function () {
    var enabledCount = builderState.config.sections.filter(function (s) { return s.enabled; }).length;
    var summary = document.querySelector('.selection-summary span');
    if (summary) {
      summary.textContent = enabledCount + ' section(s) will be included in report';
    }
  };

  // ========================================
  // STEP 4: PREVIEW & GENERATE
  // ========================================

  ERM.ReportBuilder.renderStep4_PreviewGenerate = function () {
    // Load data for preview
    this.loadReportData();

    var enabledSections = builderState.config.sections.filter(function (s) { return s.enabled; });

    var html = '';
    html += '<div class="builder-step active" data-step="4">';

    // Two column layout
    html += '  <div class="preview-generate-layout">';

    // LEFT: Configuration Summary
    html += '    <div class="preview-config-panel">';
    html += '      <h4 class="panel-title">Report Configuration</h4>';

    html += '      <div class="config-summary">';
    html += '        <div class="summary-item">';
    html += '          <span class="summary-label">Title</span>';
    html += '          <span class="summary-value">' + ERM.utils.escapeHtml(builderState.config.title || 'Untitled') + '</span>';
    html += '        </div>';
    html += '        <div class="summary-item">';
    html += '          <span class="summary-label">Period</span>';
    html += '          <span class="summary-value">' + this.getPeriodLabel(builderState.config.period) + '</span>';
    html += '        </div>';
    html += '        <div class="summary-item">';
    html += '          <span class="summary-label">Classification</span>';
    html += '          <span class="classification-badge ' + builderState.config.classification + '">' + builderState.config.classification.toUpperCase() + '</span>';
    html += '        </div>';
    html += '        <div class="summary-item">';
    html += '          <span class="summary-label">Sections</span>';
    html += '          <span class="summary-value">' + enabledSections.length + ' included</span>';
    html += '        </div>';
    html += '      </div>';

    // Export format - PDF only (Word and HTML not implemented)
    html += '      <div class="form-group" style="margin-top: 16px;">';
    html += '        <label class="form-label">Export Format</label>';
    html += '        <div style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">';
    html += '          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
    html += '          <span style="font-weight: 500; color: #334155;">PDF Document</span>';
    html += '        </div>';
    html += '        <input type="hidden" id="export-format" value="pdf">';
    html += '      </div>';

    html += '    </div>';

    // RIGHT: Preview
    html += '    <div class="preview-display-panel">';
    html += '      <div class="preview-header">';
    html += '        <h4>Report Preview</h4>';
    html += '        <button type="button" class="btn btn-sm btn-secondary" onclick="ERM.ReportBuilder.refreshPreview()">Refresh</button>';
    html += '      </div>';
    html += '      <div class="preview-content" id="report-preview-content">';
    html += this.renderReportPreview();
    html += '      </div>';
    html += '    </div>';

    html += '  </div>';
    html += '</div>';

    return html;
  };

  ERM.ReportBuilder.renderReportPreview = function () {
    var data = builderState.fetchedData || {};
    var summary = data.summary || {};
    var enabledSections = builderState.config.sections.filter(function (s) { return s.enabled; });

    var html = '';
    html += '<div class="preview-report">';

    // Header
    html += '  <div class="preview-report-header">';
    html += '    <h2>' + ERM.utils.escapeHtml(builderState.config.title || 'Untitled Report') + '</h2>';
    html += '    <div class="preview-meta">';
    html += '      <span>' + this.getPeriodLabel(builderState.config.period) + '</span>';
    html += '      <span class="classification-badge ' + builderState.config.classification + '">' + builderState.config.classification.toUpperCase() + '</span>';
    html += '    </div>';
    html += '  </div>';

    // Stats
    html += '  <div class="preview-stats-grid">';
    html += '    <div class="preview-stat">';
    html += '      <div class="stat-value">' + (summary.totalRisks || 0) + '</div>';
    html += '      <div class="stat-label">Risks</div>';
    html += '    </div>';
    html += '    <div class="preview-stat critical">';
    html += '      <div class="stat-value">' + (summary.risksByLevel ? summary.risksByLevel.critical : 0) + '</div>';
    html += '      <div class="stat-label">Critical</div>';
    html += '    </div>';
    html += '    <div class="preview-stat">';
    html += '      <div class="stat-value">' + (summary.totalControls || 0) + '</div>';
    html += '      <div class="stat-label">Controls</div>';
    html += '    </div>';
    html += '    <div class="preview-stat success">';
    html += '      <div class="stat-value">' + (summary.controlEffectivenessRate || 0) + '%</div>';
    html += '      <div class="stat-label">Effective</div>';
    html += '    </div>';
    html += '  </div>';

    // Section list preview
    html += '  <div class="preview-sections-list">';
    html += '    <h4 class="sections-list-title">Report Sections</h4>';
    html += '    <p class="sections-list-description">Your report will include the following sections. You can edit content after generation.</p>';
    html += '    <ul class="sections-preview-ul">';
    for (var i = 0; i < enabledSections.length; i++) {
      var section = enabledSections[i];
      html += '      <li class="section-preview-item">';
      html += '        <span class="section-number">' + (i + 1) + '</span>';
      html += '        <span class="section-preview-name">' + ERM.utils.escapeHtml(section.name) + '</span>';
      html += '      </li>';
    }
    html += '    </ul>';
    html += '  </div>';

    html += '</div>';
    return html;
  };

  ERM.ReportBuilder.refreshPreview = function () {
    this.loadReportData();
    var previewEl = document.getElementById('report-preview-content');
    if (previewEl) {
      previewEl.innerHTML = this.renderReportPreview();
    }
  };

  // ========================================
  // STEP BUTTONS
  // ========================================

  ERM.ReportBuilder.getStepButtons = function (step) {
    var buttons = [];

    if (step > 1) {
      buttons.push({ label: 'Back', type: 'secondary', action: 'back' });
    } else {
      buttons.push({ label: 'Cancel', type: 'secondary', action: 'close' });
    }

    if (step < 4) {
      buttons.push({ label: 'Next', type: 'primary', action: 'next' });
    } else {
      buttons.push({ label: 'Edit Content', type: 'primary', action: 'edit' });
    }

    return buttons;
  };

  // ========================================
  // ACTION HANDLER
  // ========================================

  ERM.ReportBuilder.handleAction = function (action) {
    var self = this;

    switch (action) {
      case 'next':
        this.saveCurrentStep();
        if (this.validateStep(builderState.currentStep)) {
          this.renderStep(builderState.currentStep + 1);
        }
        break;

      case 'back':
        this.saveCurrentStep();
        this.renderStep(builderState.currentStep - 1);
        break;

      case 'edit':
        this.saveCurrentStep();
        ERM.components.closeModal();
        setTimeout(function () {
          self.showEditModal();
        }, 200);
        break;

      case 'generate':
        this.saveCurrentStep();
        this.generateReport();
        break;

      case 'close':
        ERM.components.closeModal();
        break;
    }
  };

  // ========================================
  // SAVE & VALIDATE STEPS
  // ========================================

  ERM.ReportBuilder.saveCurrentStep = function () {
    var step = builderState.currentStep;

    switch (step) {
      case 1:
        var titleEl = document.getElementById('report-title');
        var periodEl = document.getElementById('report-period');
        var audienceEl = document.getElementById('report-audience');
        var classificationEl = document.querySelector('input[name="classification"]:checked');
        var customPeriodEl = document.getElementById('custom-period');
        var customAudienceEl = document.getElementById('custom-audience');
        var customReportNameEl = document.getElementById('custom-report-name');

        if (titleEl) builderState.config.title = titleEl.value.trim();
        if (periodEl) builderState.config.period = periodEl.value;
        if (audienceEl) builderState.config.audience = audienceEl.value;
        if (classificationEl) builderState.config.classification = classificationEl.value;
        if (customPeriodEl) builderState.config.customPeriod = customPeriodEl.value.trim();
        if (customAudienceEl) builderState.config.customAudience = customAudienceEl.value.trim();
        if (customReportNameEl) builderState.config.customReportName = customReportNameEl.value.trim();
        break;

      case 4:
        var formatEl = document.getElementById('export-format');
        var distEl = document.getElementById('distribution-list');
        if (formatEl) builderState.config.exportFormat = formatEl.value;
        if (distEl) builderState.config.distributionList = distEl.value;
        break;
    }
  };

  ERM.ReportBuilder.validateStep = function (step) {
    switch (step) {
      case 1:
        if (!builderState.config.title || builderState.config.title.trim() === '') {
          ERM.toast.show({ type: 'error', message: 'Please enter a report title' });
          var titleEl = document.getElementById('report-title');
          if (titleEl) titleEl.focus();
          return false;
        }
        return true;

      case 2:
        if (!builderState.config.selectedRegister) {
          ERM.toast.show({ type: 'error', message: 'Please select a risk register to include in the report' });
          return false;
        }
        // Auto-populate dataSources based on selections
        builderState.config.dataSources = ['risk_register'];
        if (builderState.config.selectedControls.length > 0) {
          builderState.config.dataSources.push('controls');
        }
        if (builderState.config.selectedKRIs.length > 0) {
          builderState.config.dataSources.push('kri_dashboard');
        }
        return true;

      case 3:
        var enabledCount = builderState.config.sections.filter(function (s) { return s.enabled; }).length;
        if (enabledCount === 0) {
          ERM.toast.show({ type: 'error', message: 'Please select at least one section' });
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // ========================================
  // INIT STEP EVENTS
  // ========================================

  ERM.ReportBuilder.initStepEvents = function (step) {
    var self = this;

    switch (step) {
      case 1:
        // Report type cards
        var typeCards = document.querySelectorAll('.report-type-card');
        for (var i = 0; i < typeCards.length; i++) {
          typeCards[i].addEventListener('click', function () {
            for (var j = 0; j < typeCards.length; j++) {
              typeCards[j].classList.remove('selected');
              typeCards[j].querySelector('.type-check').textContent = '';
            }
            this.classList.add('selected');
            this.querySelector('.type-check').textContent = '✓';
            builderState.config.reportType = this.getAttribute('data-type');
            self.autoSelectByReportType(builderState.config.reportType);

            // Show/hide custom report name input
            var customNameGroup = document.getElementById('custom-report-name-group');
            if (customNameGroup) {
              customNameGroup.style.display = builderState.config.reportType === 'custom' ? 'block' : 'none';
            }
          });
        }

        // Report Period dropdown - show/hide custom input
        var periodSelect = document.getElementById('report-period');
        var customPeriodInput = document.getElementById('custom-period');
        if (periodSelect && customPeriodInput) {
          periodSelect.addEventListener('change', function() {
            customPeriodInput.style.display = this.value === 'custom' ? 'block' : 'none';
            if (this.value === 'custom') {
              customPeriodInput.focus();
            }
          });
        }

        // Target Audience dropdown - show/hide custom input
        var audienceSelect = document.getElementById('report-audience');
        var customAudienceInput = document.getElementById('custom-audience');
        if (audienceSelect && customAudienceInput) {
          audienceSelect.addEventListener('change', function() {
            customAudienceInput.style.display = this.value === 'custom' ? 'block' : 'none';
            if (this.value === 'custom') {
              customAudienceInput.focus();
            }
          });
        }

        // Classification options
        var classOptions = document.querySelectorAll('.classification-option');
        for (var k = 0; k < classOptions.length; k++) {
          classOptions[k].addEventListener('click', function () {
            for (var l = 0; l < classOptions.length; l++) {
              classOptions[l].classList.remove('selected');
            }
            this.classList.add('selected');
          });
        }
        break;

      case 2:
        // Register dropdown selection
        var registerDropdown = document.getElementById('register-dropdown');
        if (registerDropdown) {
          registerDropdown.addEventListener('change', function () {
            var registerId = this.value;
            builderState.config.selectedRegister = registerId || null;

            // Clear previous selections when changing register
            builderState.config.selectedControls = [];
            builderState.config.selectedKRIs = [];

            // Update counts and refresh cascading selections
            self.updateSelectionCounts();
            self.refreshCascadingSelections();
          });
        }

        // Control selection cards
        var controlCards = document.querySelectorAll('.control-card');
        for (var n = 0; n < controlCards.length; n++) {
          controlCards[n].addEventListener('click', function () {
            var controlId = this.getAttribute('data-control-id');
            var idx = builderState.config.selectedControls.indexOf(controlId);

            if (idx === -1) {
              builderState.config.selectedControls.push(controlId);
              this.classList.add('selected');
              this.querySelector('input').checked = true;
            } else {
              builderState.config.selectedControls.splice(idx, 1);
              this.classList.remove('selected');
              this.querySelector('input').checked = false;
            }

            self.updateSelectionCounts();
          });
        }

        // KRI selection cards
        var kriCards = document.querySelectorAll('.kri-card');
        for (var p = 0; p < kriCards.length; p++) {
          kriCards[p].addEventListener('click', function () {
            var kriId = this.getAttribute('data-kri-id');
            var idx = builderState.config.selectedKRIs.indexOf(kriId);

            if (idx === -1) {
              builderState.config.selectedKRIs.push(kriId);
              this.classList.add('selected');
              this.querySelector('input').checked = true;
            } else {
              builderState.config.selectedKRIs.splice(idx, 1);
              this.classList.remove('selected');
              this.querySelector('input').checked = false;
            }

            self.updateSelectionCounts();
          });
        }
        break;

      case 3:
        // Initialize drag and drop
        this.initDragAndDrop();
        this.initCheckboxEvents();
        break;

      case 4:
        // Nothing special needed
        break;
    }
  };

  ERM.ReportBuilder.initCheckboxEvents = function () {
    var self = this;
    var checkboxes = document.querySelectorAll('.section-checklist-item input[type="checkbox"]');

    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].addEventListener('change', function (e) {
        e.stopPropagation();
        var sectionId = this.getAttribute('data-section');
        for (var j = 0; j < builderState.config.sections.length; j++) {
          if (builderState.config.sections[j].id === sectionId) {
            builderState.config.sections[j].enabled = this.checked;
            break;
          }
        }
        self.updateSectionCount();
      });
    }
  };

  ERM.ReportBuilder.initDragAndDrop = function () {
    var self = this;
    var checklist = document.getElementById('sections-checklist');
    if (!checklist) return;

    var items = checklist.querySelectorAll('.section-checklist-item');

    for (var i = 0; i < items.length; i++) {
      var item = items[i];

      item.addEventListener('dragstart', function (e) {
        builderState.draggedItem = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.getAttribute('data-index'));
      });

      item.addEventListener('dragend', function () {
        this.classList.remove('dragging');
        builderState.draggedItem = null;
        var allItems = checklist.querySelectorAll('.section-checklist-item');
        for (var j = 0; j < allItems.length; j++) {
          allItems[j].classList.remove('drag-over');
        }
      });

      item.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (builderState.draggedItem && builderState.draggedItem !== this) {
          this.classList.add('drag-over');
        }
      });

      item.addEventListener('dragleave', function () {
        this.classList.remove('drag-over');
      });

      item.addEventListener('drop', function (e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        if (builderState.draggedItem && builderState.draggedItem !== this) {
          var fromIndex = parseInt(builderState.draggedItem.getAttribute('data-index'), 10);
          var toIndex = parseInt(this.getAttribute('data-index'), 10);

          var movedSection = builderState.config.sections.splice(fromIndex, 1)[0];
          builderState.config.sections.splice(toIndex, 0, movedSection);

          checklist.innerHTML = self.renderSectionsChecklist();
          self.initDragAndDrop();
          self.initCheckboxEvents();
        }
      });
    }
  };

  ERM.ReportBuilder.autoSelectByReportType = function (reportType) {
    switch (reportType) {
      case 'comprehensive':
        builderState.config.dataSources = ['kri_dashboard', 'risk_register', 'controls'];
        break;
      case 'executive':
      case 'board':
        builderState.config.dataSources = ['kri_dashboard', 'risk_register'];
        break;
      case 'control':
        builderState.config.dataSources = ['controls', 'risk_register'];
        break;
      case 'custom':
        builderState.config.dataSources = [];
        break;
    }
    // Reset sections when type changes
    builderState.config.sections = [];
  };

  ERM.ReportBuilder.updateSelectionCounts = function () {
    var registerCount = document.getElementById('selected-register-count');
    var controlsCount = document.getElementById('selected-controls-count');
    var krisCount = document.getElementById('selected-kris-count');

    var selectedRegisterCount = builderState.config.selectedRegister ? 1 : 0;
    if (registerCount) registerCount.textContent = selectedRegisterCount;
    if (controlsCount) controlsCount.textContent = builderState.config.selectedControls.length;
    if (krisCount) krisCount.textContent = builderState.config.selectedKRIs.length;
  };

  ERM.ReportBuilder.refreshCascadingSelections = function () {
    // Refresh controls grid
    var controlsGrid = document.getElementById('controls-selection-grid');
    if (controlsGrid) {
      controlsGrid.innerHTML = this.renderControlsSelectionCards();

      // Re-attach event listeners for controls
      var controlCards = controlsGrid.querySelectorAll('.control-card');
      var self = this;
      for (var i = 0; i < controlCards.length; i++) {
        controlCards[i].addEventListener('click', function () {
          var controlId = this.getAttribute('data-control-id');
          var idx = builderState.config.selectedControls.indexOf(controlId);

          if (idx === -1) {
            builderState.config.selectedControls.push(controlId);
            this.classList.add('selected');
            this.querySelector('input').checked = true;
          } else {
            builderState.config.selectedControls.splice(idx, 1);
            this.classList.remove('selected');
            this.querySelector('input').checked = false;
          }

          self.updateSelectionCounts();
        });
      }
    }

    // Refresh KRIs grid
    var krisGrid = document.getElementById('kri-selection-grid');
    if (krisGrid) {
      krisGrid.innerHTML = this.renderKRISelectionCards();

      // Re-attach event listeners for KRIs
      var kriCards = krisGrid.querySelectorAll('.kri-card');
      for (var j = 0; j < kriCards.length; j++) {
        kriCards[j].addEventListener('click', function () {
          var kriId = this.getAttribute('data-kri-id');
          var idx = builderState.config.selectedKRIs.indexOf(kriId);

          if (idx === -1) {
            builderState.config.selectedKRIs.push(kriId);
            this.classList.add('selected');
            this.querySelector('input').checked = true;
          } else {
            builderState.config.selectedKRIs.splice(idx, 1);
            this.classList.remove('selected');
            this.querySelector('input').checked = false;
          }

          self.updateSelectionCounts();
        });
      }
    }
  };

  // ========================================
  // EDIT CONTENT MODAL (Screen 2)
  // Side-by-side editor and live preview
  // ========================================

  ERM.ReportBuilder.showEditModal = function () {
    var self = this;
    var enabledSections = builderState.config.sections.filter(function (s) { return s.enabled; });

    if (enabledSections.length === 0) {
      ERM.toast.show({ type: 'error', message: 'No sections selected to edit' });
      return;
    }

    // Load data if not already loaded
    if (!builderState.fetchedData) {
      this.loadReportData();
    }

    builderState.activeEditorSection = enabledSections[0].id;
    builderState.editorViewMode = 'edit'; // 'edit' or 'preview'

    var content = '';
    content += '<div class="report-edit-layout">';

    // Top Bar with Section Tabs and View Toggle
    content += '  <div class="edit-top-bar">';

    // Section Tabs
    content += '    <div class="edit-tabs-bar">';
    for (var i = 0; i < enabledSections.length; i++) {
      var section = enabledSections[i];
      var isActive = section.id === builderState.activeEditorSection ? ' active' : '';
      content += '      <button type="button" class="edit-tab' + isActive + '" data-section="' + section.id + '">' + ERM.utils.escapeHtml(section.name) + '</button>';
    }
    content += '    </div>';

    // View Mode Toggle
    content += '    <div class="view-mode-toggle">';
    content += '      <button type="button" class="toggle-btn active" data-mode="edit">✏️ Edit</button>';
    content += '      <button type="button" class="toggle-btn" data-mode="preview">👁️ Preview</button>';
    content += '    </div>';

    content += '  </div>';

    // Main Content Area - Single View with Toggle
    content += '  <div class="edit-main-area">';

    // Editor Panel
    content += '    <div class="edit-editor-panel" id="editor-panel-view">';
    content += '      <div class="editor-toolbar" id="editor-toolbar">';
    content += this.renderEditorToolbar();
    content += '      </div>';
    content += '      <div class="editor-content-area" id="editor-content-area" contenteditable="true">';
    content += this.getEditableSectionContent(builderState.activeEditorSection);
    content += '      </div>';
    content += '    </div>';

    // Preview Panel (PDF-like)
    content += '    <div class="edit-preview-panel" id="preview-panel-view" style="display: none;">';
    content += '      <div class="preview-page-indicator">Page <span id="current-page-num">1</span> of <span id="total-pages-num">' + (enabledSections.length + 1) + '</span></div>';
    content += '      <div class="preview-pages-container" id="preview-pages-container">';
    content += this.renderFullReportPreview();
    content += '      </div>';
    content += '    </div>';

    content += '  </div>';
    content += '</div>';

    ERM.components.showModal({
      title: 'Edit Report Content',
      content: content,
      size: 'fullscreen',
      buttons: [
        { label: 'Back to Builder', type: 'secondary', action: 'back' },
        { label: 'Save & Generate', type: 'primary', action: 'generate' }
      ],
      onAction: function (action) {
        self.handleEditAction(action);
      }
    });

    setTimeout(function () {
      self.initEditModalEvents();
    }, 100);
  };

  ERM.ReportBuilder.renderEditorToolbar = function () {
    var html = '';

    // Format selector
    html += '<select class="toolbar-select" id="format-select" onchange="ERM.ReportBuilder.execFormatBlock(this.value)">';
    html += '  <option value="">Format</option>';
    html += '  <option value="p">Normal</option>';
    html += '  <option value="h1">Heading 1</option>';
    html += '  <option value="h2">Heading 2</option>';
    html += '  <option value="h3">Heading 3</option>';
    html += '</select>';

    html += '<span class="toolbar-divider"></span>';

    // Text formatting
    html += '<button type="button" class="toolbar-btn" onclick="document.execCommand(\'bold\')" title="Bold"><b>B</b></button>';
    html += '<button type="button" class="toolbar-btn" onclick="document.execCommand(\'italic\')" title="Italic"><i>I</i></button>';
    html += '<button type="button" class="toolbar-btn" onclick="document.execCommand(\'underline\')" title="Underline"><u>U</u></button>';

    html += '<span class="toolbar-divider"></span>';

    // Lists
    html += '<button type="button" class="toolbar-btn" onclick="document.execCommand(\'insertOrderedList\')" title="Numbered List">1.</button>';
    html += '<button type="button" class="toolbar-btn" onclick="document.execCommand(\'insertUnorderedList\')" title="Bullet List">&bull;</button>';

    html += '<span class="toolbar-divider"></span>';

    // Link and clear
    html += '<button type="button" class="toolbar-btn" onclick="ERM.ReportBuilder.insertLink()" title="Insert Link">Link</button>';
    html += '<button type="button" class="toolbar-btn" onclick="document.execCommand(\'removeFormat\')" title="Clear Formatting">Clear</button>';

    return html;
  };

  ERM.ReportBuilder.execFormatBlock = function (tag) {
    if (tag) {
      document.execCommand('formatBlock', false, '<' + tag + '>');
    }
  };

  ERM.ReportBuilder.insertLink = function () {
    var url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  };

  ERM.ReportBuilder.getEditableSectionContent = function (sectionId) {
    if (builderState.editedContent[sectionId]) {
      return builderState.editedContent[sectionId];
    }
    return this.getDefaultSectionContent(sectionId);
  };

  ERM.ReportBuilder.renderEditPreview = function (sectionId) {
    var content = builderState.editedContent[sectionId] || this.getDefaultSectionContent(sectionId);
    return '<div class="preview-section-rendered">' + content + '</div>';
  };

  ERM.ReportBuilder.renderCoverPage = function () {
    var config = builderState.config;
    var workspace = ERM.state.workspace || {};
    var user = ERM.state.user || {};
    var currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Check if user is on free plan (show watermark only for free users)
    var isFreeUser = !user.subscription || user.subscription === 'free' || user.subscription === 'trial';

    var html = '<div class="preview-page cover-page" data-page="cover">';

    // Only show watermark for free users
    if (isFreeUser) {
      html += '  <div class="cover-watermark">';
      html += '    <img src="assets/images/watermark-logo.png" alt="Dimeri ERM" onerror="this.style.display=\'none\'">';
      html += '  </div>';
    }

    html += '  <div class="cover-content">';
    html += '    <h1 class="cover-title">' + ERM.utils.escapeHtml(config.title || 'Risk Management Report') + '</h1>';
    html += '    <div class="cover-subtitle">' + ERM.utils.escapeHtml(config.reportType || 'Enterprise Risk Management') + '</div>';
    html += '    <div class="cover-divider"></div>';
    html += '    <div class="cover-details">';
    html += '      <div class="cover-detail-item">';
    html += '        <span class="cover-detail-label">Organization:</span>';
    html += '        <span class="cover-detail-value">' + ERM.utils.escapeHtml(workspace.name || 'Organization Name') + '</span>';
    html += '      </div>';
    html += '      <div class="cover-detail-item">';
    html += '        <span class="cover-detail-label">Reporting Period:</span>';
    html += '        <span class="cover-detail-value">' + ERM.utils.escapeHtml(config.period || 'Q4 2024') + '</span>';
    html += '      </div>';
    html += '      <div class="cover-detail-item">';
    html += '        <span class="cover-detail-label">Report Date:</span>';
    html += '        <span class="cover-detail-value">' + currentDate + '</span>';
    html += '      </div>';
    html += '      <div class="cover-detail-item">';
    html += '        <span class="cover-detail-label">Prepared By:</span>';
    html += '        <span class="cover-detail-value">' + ERM.utils.escapeHtml(user.name || 'Risk Manager') + '</span>';
    html += '      </div>';
    html += '      <div class="cover-detail-item">';
    html += '        <span class="cover-detail-label">Audience:</span>';
    html += '        <span class="cover-detail-value">' + ERM.utils.escapeHtml(config.audience || 'Board of Directors') + '</span>';
    html += '      </div>';
    html += '    </div>';
    html += '    <div class="cover-footer">';
    html += '      <div class="cover-classification ' + (config.classification || 'internal').toLowerCase() + '">';
    html += '        ' + (config.classification || 'INTERNAL').toUpperCase();
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    return html;
  };

  ERM.ReportBuilder.renderFullReportPreview = function () {
    var enabledSections = builderState.config.sections.filter(function (s) { return s.enabled; });
    var user = ERM.state.user || {};
    var isFreeUser = !user.subscription || user.subscription === 'free' || user.subscription === 'trial';
    var html = '';

    // Add cover page first
    html += this.renderCoverPage();

    // Add content pages with watermark and page numbers at bottom
    for (var i = 0; i < enabledSections.length; i++) {
      var section = enabledSections[i];
      var content = builderState.editedContent[section.id] || this.getDefaultSectionContent(section.id);
      var pageNum = i + 1;

      html += '<div class="preview-page" data-page="' + pageNum + '">';

      // Only show watermark for free users
      if (isFreeUser) {
        html += '  <div class="page-watermark">';
        html += '    <img src="assets/images/watermark-logo.png" alt="Dimeri ERM" onerror="this.style.display=\'none\'">';
        html += '  </div>';
      }
      html += '  <div class="page-content">';
      html += content;
      html += '  </div>';
      html += '  <div class="page-number-footer">Page ' + pageNum + '</div>';
      html += '</div>';
    }

    return html;
  };

  ERM.ReportBuilder.initEditModalEvents = function () {
    var self = this;

    // View Mode Toggle
    var toggleBtns = document.querySelectorAll('.toggle-btn');
    for (var t = 0; t < toggleBtns.length; t++) {
      toggleBtns[t].addEventListener('click', function () {
        var mode = this.getAttribute('data-mode');

        // Update toggle buttons
        for (var j = 0; j < toggleBtns.length; j++) {
          toggleBtns[j].classList.remove('active');
        }
        this.classList.add('active');

        // Save content before switching
        self.saveCurrentEditorContent();

        // Toggle views
        var editorPanel = document.getElementById('editor-panel-view');
        var previewPanel = document.getElementById('preview-panel-view');

        if (mode === 'edit') {
          editorPanel.style.display = 'flex';
          previewPanel.style.display = 'none';
        } else {
          editorPanel.style.display = 'none';
          previewPanel.style.display = 'block';

          // Refresh preview
          var previewContainer = document.getElementById('preview-pages-container');
          if (previewContainer) {
            previewContainer.innerHTML = self.renderFullReportPreview();
          }
        }
      });
    }

    // Tab click events
    var tabs = document.querySelectorAll('.edit-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        // Save current content
        self.saveCurrentEditorContent();

        // Update active tab
        for (var j = 0; j < tabs.length; j++) {
          tabs[j].classList.remove('active');
        }
        this.classList.add('active');

        // Load new section
        var sectionId = this.getAttribute('data-section');
        builderState.activeEditorSection = sectionId;

        var editorArea = document.getElementById('editor-content-area');
        if (editorArea) {
          editorArea.innerHTML = self.getEditableSectionContent(sectionId);
        }
      });
    }
  };

  ERM.ReportBuilder.saveCurrentEditorContent = function () {
    var editorArea = document.getElementById('editor-content-area');
    if (editorArea && builderState.activeEditorSection) {
      builderState.editedContent[builderState.activeEditorSection] = editorArea.innerHTML;
    }
  };

  ERM.ReportBuilder.updateLivePreview = function () {
    var editorArea = document.getElementById('editor-content-area');
    var previewArea = document.getElementById('edit-preview-content');

    if (editorArea && previewArea) {
      previewArea.innerHTML = '<div class="preview-section-rendered">' + editorArea.innerHTML + '</div>';
    }
  };

  ERM.ReportBuilder.handleEditAction = function (action) {
    var self = this;

    switch (action) {
      case 'back':
        this.saveCurrentEditorContent();
        ERM.components.closeModal();
        setTimeout(function () {
          self.renderStep(4);
        }, 200);
        break;

      case 'ai':
        ERM.toast.show({ type: 'info', message: 'AI Assistant feature coming soon!' });
        break;

      case 'generate':
        this.saveCurrentEditorContent();
        this.generateReport();
        break;

      case 'close':
        ERM.components.closeModal();
        break;
    }
  };

  // ========================================
  // DEFAULT SECTION CONTENT
  // ========================================

  ERM.ReportBuilder.generateTableOfContents = function () {
    var html = '<h2>Table of Contents</h2>';
    html += '<div class="toc-list">';

    var enabledSections = builderState.config.sections.filter(function (s) {
      return s.enabled && s.id !== 'table_of_contents';
    });

    var currentPage = 2; // TOC is page 1, content starts at page 2

    for (var i = 0; i < enabledSections.length; i++) {
      var section = enabledSections[i];
      html += '<div class="toc-item">';
      html += '  <span class="toc-title">' + ERM.utils.escapeHtml(section.name) + '</span>';
      html += '  <span class="toc-dots"></span>';
      html += '  <span class="toc-page">' + currentPage + '</span>';
      html += '</div>';

      // Estimate pages per section (can be adjusted based on content length)
      currentPage += 1;
    }

    html += '</div>';
    return html;
  };

  ERM.ReportBuilder.getDefaultSectionContent = function (sectionId) {
    var data = builderState.fetchedData || {};

    // Filter data based on user selections from cascading selection system
    var allRisks = data.risks || [];
    var allControls = data.controls || [];
    var allKRIs = data.kris || [];
    var selectedRegisterId = builderState.config.selectedRegister;

    // Filter to only risks from the selected register
    var risks = allRisks.filter(function(r) {
      return r.registerId === selectedRegisterId;
    });

    // Filter to only selected controls
    var controls = allControls.filter(function(c) {
      return builderState.config.selectedControls.indexOf(c.id) !== -1;
    });

    // Filter to only selected KRIs
    var kris = allKRIs.filter(function(k) {
      return builderState.config.selectedKRIs.indexOf(k.id) !== -1;
    });

    // Calculate summary stats from selected data
    var selectedSummary = this.calculateSelectedSummary(risks, controls, kris);

    switch (sectionId) {
      case 'table_of_contents':
        return this.generateTableOfContents();

      case 'exec_summary':
        return '<h2>Executive Summary & CRO Opinion</h2>' +
          '<p>This report provides a comprehensive overview of the organization\'s enterprise risk profile for the reporting period.</p>' +
          '<p><strong>Key Highlights:</strong></p>' +
          '<ul>' +
          '<li><strong>Total Risks:</strong> ' + risks.length + ' identified risks in the register</li>' +
          '<li><strong>Critical Risks:</strong> ' + selectedSummary.criticalRisks + ' requiring immediate attention</li>' +
          '<li><strong>High Risks:</strong> ' + selectedSummary.highRisks + ' requiring management focus</li>' +
          '<li><strong>Total Controls:</strong> ' + controls.length + ' controls implemented</li>' +
          '<li><strong>Control Effectiveness:</strong> ' + selectedSummary.controlEffectivenessRate + '% of controls rated as effective</li>' +
          '</ul>' +
          '<p><strong>CRO Opinion:</strong> [Add CRO commentary here]</p>';

      case 'top_risks':
        var topRisksHtml = '<h2>Top Risks</h2>' +
          '<p>The following risks represent the highest priority items requiring management attention:</p>';

        var sortedRisks = risks.slice().sort(function (a, b) {
          var scoreA = a.inherentScore || 0;
          var scoreB = b.inherentScore || 0;
          return scoreB - scoreA;
        });

        if (sortedRisks.length > 0) {
          topRisksHtml += '<ol>';
          for (var i = 0; i < sortedRisks.length; i++) {
            var risk = sortedRisks[i];
            var riskScore = risk.inherentScore || 0;
            var riskLevel = this.getRiskLevel(riskScore);
            topRisksHtml += '<li><strong>' + ERM.utils.escapeHtml(risk.title || 'Untitled') + '</strong> - ' +
              'Score: ' + riskScore + ' (' + riskLevel.toUpperCase() + ')' +
              '<br><em>' + ERM.utils.escapeHtml(risk.description || 'No description available') + '</em></li>';
          }
          topRisksHtml += '</ol>';
        } else {
          topRisksHtml += '<p><em>No risks selected for this report.</em></p>';
        }
        return topRisksHtml;

      case 'risk_heatmap':
        return '<h2>Risk Heat Map</h2>' +
          '<p>The risk heat map illustrates the distribution of selected risks by likelihood and impact:</p>' +
          '<ul>' +
          '<li><strong>Critical:</strong> ' + selectedSummary.criticalRisks + ' risks</li>' +
          '<li><strong>High:</strong> ' + selectedSummary.highRisks + ' risks</li>' +
          '<li><strong>Medium:</strong> ' + selectedSummary.mediumRisks + ' risks</li>' +
          '<li><strong>Low:</strong> ' + selectedSummary.lowRisks + ' risks</li>' +
          '</ul>' +
          '<p><strong>Total Risks in Report:</strong> ' + risks.length + '</p>';

      case 'control_summary':
        var controlHtml = '<h2>Control Summary</h2>' +
          '<p>Overview of the control environment for selected risks:</p>' +
          '<ul>' +
          '<li><strong>Total Controls:</strong> ' + controls.length + '</li>' +
          '<li><strong>Effective:</strong> ' + selectedSummary.effectiveControls + '</li>' +
          '<li><strong>Partially Effective:</strong> ' + selectedSummary.partiallyEffectiveControls + '</li>' +
          '<li><strong>Ineffective:</strong> ' + selectedSummary.ineffectiveControls + '</li>' +
          '</ul>';

        if (controls.length > 0) {
          controlHtml += '<h3>Control Details</h3><ul>';
          for (var j = 0; j < controls.length; j++) {
            var control = controls[j];
            controlHtml += '<li><strong>' + ERM.utils.escapeHtml(control.title || 'Untitled Control') + '</strong> - ' +
              'Effectiveness: ' + ERM.utils.escapeHtml(control.effectiveness || 'Not rated') +
              '<br><em>' + ERM.utils.escapeHtml(control.description || 'No description') + '</em></li>';
          }
          controlHtml += '</ul>';
        }
        return controlHtml;

      case 'kri_dashboard':
        var kriHtml = '<h2>Key Risk Indicators (KRIs)</h2>' +
          '<p>Dashboard metrics for selected risks:</p>';

        if (kris.length > 0) {
          kriHtml += '<ul>';
          for (var k = 0; k < kris.length; k++) {
            var kri = kris[k];
            kriHtml += '<li><strong>' + ERM.utils.escapeHtml(kri.name || 'Untitled KRI') + '</strong><br>' +
              'Current Value: ' + (kri.currentValue || 'N/A') + ' | ' +
              'Threshold: ' + (kri.threshold || 'N/A') + '<br>' +
              '<em>' + ERM.utils.escapeHtml(kri.description || 'No description') + '</em></li>';
          }
          kriHtml += '</ul>';
        } else {
          kriHtml += '<p><em>No KRI metrics selected for this report.</em></p>';
        }
        return kriHtml;

      case 'recommendations':
        return '<h2>Recommendations</h2>' +
          '<p>Based on the analysis of selected risks and controls, the following recommendations are proposed:</p>' +
          '<ol>' +
          '<li>Address ' + selectedSummary.criticalRisks + ' critical and ' + selectedSummary.highRisks + ' high risks as priority</li>' +
          '<li>Improve effectiveness of ' + selectedSummary.ineffectiveControls + ' ineffective controls</li>' +
          '<li>Continue monitoring ' + kris.length + ' key risk indicators for trend analysis</li>' +
          '<li>Review and update risk assessments quarterly</li>' +
          '</ol>';

      case 'appendix':
        return '<h2>Appendix</h2>' +
          '<p><strong>Glossary of Terms</strong></p>' +
          '<ul>' +
          '<li><strong>Risk</strong> - An uncertain event that could affect objectives</li>' +
          '<li><strong>Control</strong> - A measure to mitigate or manage risk</li>' +
          '<li><strong>KRI</strong> - Key Risk Indicator for monitoring risk trends</li>' +
          '<li><strong>Inherent Risk</strong> - Risk level before controls are applied</li>' +
          '<li><strong>Residual Risk</strong> - Risk level after controls are applied</li>' +
          '</ul>' +
          '<p><strong>Report Scope</strong></p>' +
          '<ul>' +
          '<li>Risks included: ' + risks.length + '</li>' +
          '<li>Controls included: ' + controls.length + '</li>' +
          '<li>KRIs included: ' + kris.length + '</li>' +
          '</ul>';

      default:
        var sectionName = sectionId.replace(/_/g, ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); });
        return '<h2>' + sectionName + '</h2>' +
          '<p>Section content goes here. Edit as needed.</p>';
    }
  };

  // ========================================
  // CALCULATE SUMMARY FROM SELECTED DATA
  // ========================================

  ERM.ReportBuilder.calculateSelectedSummary = function (risks, controls, kris) {
    var summary = {
      criticalRisks: 0,
      highRisks: 0,
      mediumRisks: 0,
      lowRisks: 0,
      effectiveControls: 0,
      partiallyEffectiveControls: 0,
      ineffectiveControls: 0,
      controlEffectivenessRate: 0
    };

    // Count risks by level
    for (var i = 0; i < risks.length; i++) {
      var risk = risks[i];
      var riskScore = risk.inherentScore || 0;
      var riskLevel = this.getRiskLevel(riskScore);

      if (riskLevel === 'critical') {
        summary.criticalRisks++;
      } else if (riskLevel === 'high') {
        summary.highRisks++;
      } else if (riskLevel === 'medium') {
        summary.mediumRisks++;
      } else if (riskLevel === 'low') {
        summary.lowRisks++;
      }
    }

    // Count controls by effectiveness
    for (var j = 0; j < controls.length; j++) {
      var control = controls[j];
      var effectiveness = (control.effectiveness || '').toLowerCase();

      if (effectiveness === 'effective') {
        summary.effectiveControls++;
      } else if (effectiveness === 'partially effective' || effectiveness === 'partial') {
        summary.partiallyEffectiveControls++;
      } else if (effectiveness === 'ineffective') {
        summary.ineffectiveControls++;
      }
    }

    // Calculate effectiveness rate
    if (controls.length > 0) {
      summary.controlEffectivenessRate = Math.round((summary.effectiveControls / controls.length) * 100);
    }

    return summary;
  };

  // ========================================
  // LOAD REPORT DATA
  // ========================================

  ERM.ReportBuilder.loadReportData = function () {
    var filters = { period: builderState.config.period };

    if (ERM.ReportDataService && typeof ERM.ReportDataService.fetchData === 'function') {
      builderState.fetchedData = ERM.ReportDataService.fetchData({
        dataSources: builderState.config.dataSources,
        filters: filters
      });
    } else {
      builderState.fetchedData = this.loadDataFromStorage(filters);
    }
  };

  ERM.ReportBuilder.loadDataFromStorage = function (filters) {
    var risks = ERM.storage.get('risks') || [];
    var controls = ERM.storage.get('controls') || [];
    var kris = ERM.storage.get('kris') || [];
    var incidents = ERM.storage.get('incidents') || [];

    // Apply period filter
    if (filters.period && filters.period !== 'current') {
      var periodDates = this.getPeriodDates(filters.period);
      if (periodDates) {
        risks = risks.filter(function (r) {
          var date = new Date(r.createdAt || r.dateIdentified);
          return date >= periodDates.start && date <= periodDates.end;
        });
      }
    }

    var summary = {
      totalRisks: risks.length,
      totalControls: controls.length,
      totalKRIs: kris.length,
      totalIncidents: incidents.length,
      risksByLevel: { critical: 0, high: 0, medium: 0, low: 0 },
      controlsByEffectiveness: { effective: 0, partiallyEffective: 0, ineffective: 0, notTested: 0 },
      controlEffectivenessRate: 0
    };

    for (var i = 0; i < risks.length; i++) {
      var level = (risks[i].inherentRisk || 'medium').toLowerCase();
      if (summary.risksByLevel[level] !== undefined) {
        summary.risksByLevel[level]++;
      }
    }

    var effectiveCount = 0;
    for (var j = 0; j < controls.length; j++) {
      var eff = (controls[j].effectiveness || 'not_tested').toLowerCase().replace(/ /g, '_');
      if (eff === 'effective') {
        summary.controlsByEffectiveness.effective++;
        effectiveCount++;
      } else if (eff === 'partially_effective' || eff === 'partial') {
        summary.controlsByEffectiveness.partiallyEffective++;
      } else if (eff === 'ineffective') {
        summary.controlsByEffectiveness.ineffective++;
      } else {
        summary.controlsByEffectiveness.notTested++;
      }
    }

    if (controls.length > 0) {
      summary.controlEffectivenessRate = Math.round((effectiveCount / controls.length) * 100);
    }

    return { risks: risks, controls: controls, kris: kris, incidents: incidents, summary: summary };
  };

  ERM.ReportBuilder.getPeriodDates = function (period) {
    var now = new Date();
    var year = now.getFullYear();

    switch (period) {
      case 'q1': return { start: new Date(year, 0, 1), end: new Date(year, 2, 31) };
      case 'q2': return { start: new Date(year, 3, 1), end: new Date(year, 5, 30) };
      case 'q3': return { start: new Date(year, 6, 1), end: new Date(year, 8, 30) };
      case 'q4':
      case 'current': return { start: new Date(year, 9, 1), end: new Date(year, 11, 31) };
      case 'ytd': return { start: new Date(year, 0, 1), end: now };
      case 'annual': return { start: new Date(year - 1, 0, 1), end: new Date(year - 1, 11, 31) };
      default: return null;
    }
  };

  ERM.ReportBuilder.getPeriodLabel = function (period) {
    var labels = {
      current: 'Current Quarter (Q4 2025)',
      q3: 'Q3 2025', q2: 'Q2 2025', q1: 'Q1 2025',
      ytd: 'Year to Date', annual: 'Annual 2024'
    };
    return labels[period] || period;
  };

  // ========================================
  // GENERATE REPORT
  // ========================================

  ERM.ReportBuilder.generateReport = function () {
    var self = this;

    ERM.toast.show({ type: 'info', message: 'Generating report...' });

    var reportHtml = this.generateFullReportHtml();

    var report = {
      id: ERM.utils.generateId(),
      name: builderState.config.title,
      generatedDate: new Date().toISOString(),
      author: ERM.state && ERM.state.user ? ERM.state.user.name : 'System',
      format: builderState.config.exportFormat.toUpperCase(),
      config: builderState.config
    };

    var recentReports = ERM.storage.get('recentReports') || [];
    recentReports.unshift(report);
    if (recentReports.length > 50) {
      recentReports = recentReports.slice(0, 50);
    }
    ERM.storage.set('recentReports', recentReports);

    if (ERM.activityLogger) {
      ERM.activityLogger.log('report', 'created', 'report', report.name);
    }

    ERM.components.closeModal();

    setTimeout(function () {
      self.openReportWindow(reportHtml, builderState.config.title);
      ERM.toast.show({ type: 'success', message: 'Report generated successfully!' });

      if (ERM.reports && ERM.reports.render) {
        ERM.reports.render();
      }
    }, 300);
  };

  ERM.ReportBuilder.generateFullReportHtml = function () {
    var enabledSections = builderState.config.sections.filter(function (s) { return s.enabled; });

    var html = '';

    // Title Page
    html += '<div style="text-align: center; padding: 60px 0; border-bottom: 3px solid #1e293b; margin-bottom: 40px;">';
    html += '<h1 style="font-size: 32px; color: #0f172a; margin: 0 0 16px 0;">' + ERM.utils.escapeHtml(builderState.config.title) + '</h1>';
    html += '<p style="font-size: 16px; color: #64748b; margin: 0 0 8px 0;">' + this.getPeriodLabel(builderState.config.period) + '</p>';
    html += '<p style="font-size: 14px; color: #94a3b8; margin: 0;">Generated: ' + new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) + '</p>';
    html += '<div style="margin-top: 20px;"><span style="background: #1e293b; color: white; padding: 4px 12px; border-radius: 4px; font-size: 11px; text-transform: uppercase;">' + builderState.config.classification + '</span></div>';
    html += '</div>';

    // Table of Contents
    html += '<div style="margin-bottom: 40px;">';
    html += '<h2 style="font-size: 18px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px;">Table of Contents</h2>';
    html += '<ol style="padding-left: 20px;">';
    for (var t = 0; t < enabledSections.length; t++) {
      html += '<li style="margin: 8px 0; font-size: 14px;">' + ERM.utils.escapeHtml(enabledSections[t].name) + '</li>';
    }
    html += '</ol></div>';

    // Sections
    for (var i = 0; i < enabledSections.length; i++) {
      var section = enabledSections[i];
      var content = builderState.editedContent[section.id] || this.getDefaultSectionContent(section.id);
      html += '<div style="margin-bottom: 32px;">' + content + '</div>';
    }

    // Footer
    html += '<hr style="margin-top: 60px; border: none; border-top: 1px solid #e2e8f0;">';
    html += '<p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 16px;">';
    html += 'Generated by Dimeri ERM | ' + new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    html += '</p>';

    return html;
  };

  ERM.ReportBuilder.openReportWindow = function (html, title) {
    var win = window.open('', '_blank');
    win.document.write('<!DOCTYPE html><html><head>');
    win.document.write('<title>' + ERM.utils.escapeHtml(title) + '</title>');
    win.document.write('<style>');
    win.document.write('body { font-family: "Segoe UI", Arial, sans-serif; margin: 40px auto; color: #1a1a2e; line-height: 1.7; max-width: 900px; padding: 0 20px; }');
    win.document.write('h1 { color: #0f172a; font-size: 28px; }');
    win.document.write('h2 { color: #1e293b; font-size: 20px; margin-top: 32px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }');
    win.document.write('h3 { color: #334155; font-size: 16px; margin-top: 24px; }');
    win.document.write('p { margin: 12px 0; }');
    win.document.write('ul, ol { margin: 12px 0; padding-left: 24px; }');
    win.document.write('li { margin: 6px 0; }');
    win.document.write('table { width: 100%; border-collapse: collapse; margin: 16px 0; }');
    win.document.write('th { background: #1e293b; color: white; padding: 12px; text-align: left; }');
    win.document.write('td { padding: 12px; border-bottom: 1px solid #e2e8f0; }');
    win.document.write('@media print { body { margin: 20px; } }');
    win.document.write('</style></head><body>');
    win.document.write(html);
    win.document.write('</body></html>');
    win.document.close();
  };

  // Initialize
  ERM.ReportBuilder.init();

})();

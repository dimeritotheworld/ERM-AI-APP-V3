/**
 * Dimeri ERM - Report Sections Generator
 * Generates HTML content for each report section
 * ES5 Compatible
 */

(function () {
  'use strict';

  window.ERM = window.ERM || {};
  ERM.ReportSections = ERM.ReportSections || {};

  // ========================================
  // SECTION DEFINITIONS
  // ========================================

  ERM.ReportSections.definitions = {
    executive_summary: {
      id: 'executive_summary',
      name: 'Executive Summary',
      icon: '📋',
      description: 'High-level overview of risk posture'
    },
    risk_overview: {
      id: 'risk_overview',
      name: 'Risk Overview',
      icon: '⚠️',
      description: 'Summary of risk landscape'
    },
    risk_heatmap: {
      id: 'risk_heatmap',
      name: 'Risk Heatmap',
      icon: '🔥',
      description: 'Visual risk matrix'
    },
    top_risks: {
      id: 'top_risks',
      name: 'Top Risks',
      icon: '🎯',
      description: 'Highest priority risks'
    },
    risk_register: {
      id: 'risk_register',
      name: 'Risk Register',
      icon: '📝',
      description: 'Full risk listing'
    },
    control_summary: {
      id: 'control_summary',
      name: 'Control Summary',
      icon: '🛡️',
      description: 'Control effectiveness overview'
    },
    control_register: {
      id: 'control_register',
      name: 'Control Register',
      icon: '📋',
      description: 'Full control listing'
    },
    control_gaps: {
      id: 'control_gaps',
      name: 'Control Gaps',
      icon: '⚡',
      description: 'Ineffective controls analysis'
    },
    kri_summary: {
      id: 'kri_summary',
      name: 'KRI Summary',
      icon: '📊',
      description: 'Key risk indicators overview'
    },
    kri_dashboard: {
      id: 'kri_dashboard',
      name: 'KRI Dashboard',
      icon: '📈',
      description: 'Full KRI metrics'
    },
    kri_trends: {
      id: 'kri_trends',
      name: 'KRI Trends',
      icon: '📉',
      description: 'Indicator trend analysis'
    },
    incident_summary: {
      id: 'incident_summary',
      name: 'Incident Summary',
      icon: '🚨',
      description: 'Incident overview'
    },
    incident_register: {
      id: 'incident_register',
      name: 'Incident Register',
      icon: '📑',
      description: 'Full incident listing'
    },
    incident_analysis: {
      id: 'incident_analysis',
      name: 'Incident Analysis',
      icon: '🔍',
      description: 'Root cause analysis'
    },
    recommendations: {
      id: 'recommendations',
      name: 'Recommendations',
      icon: '💡',
      description: 'Action items and next steps'
    },
    appendix: {
      id: 'appendix',
      name: 'Appendix',
      icon: '📎',
      description: 'Supporting documentation'
    }
  };

  // ========================================
  // GENERATE SECTION HTML
  // ========================================

  ERM.ReportSections.generate = function (sectionId, sectionData, config) {
    config = config || {};

    switch (sectionId) {
      case 'executive_summary':
        return this.generateExecutiveSummary(sectionData, config);
      case 'risk_overview':
        return this.generateRiskOverview(sectionData, config);
      case 'risk_heatmap':
        return this.generateRiskHeatmap(sectionData, config);
      case 'top_risks':
        return this.generateTopRisks(sectionData, config);
      case 'risk_register':
        return this.generateRiskRegister(sectionData, config);
      case 'control_summary':
        return this.generateControlSummary(sectionData, config);
      case 'control_register':
        return this.generateControlRegister(sectionData, config);
      case 'control_gaps':
        return this.generateControlGaps(sectionData, config);
      case 'kri_summary':
        return this.generateKRISummary(sectionData, config);
      case 'kri_dashboard':
        return this.generateKRIDashboard(sectionData, config);
      case 'kri_trends':
        return this.generateKRITrends(sectionData, config);
      case 'incident_summary':
        return this.generateIncidentSummary(sectionData, config);
      case 'incident_register':
        return this.generateIncidentRegister(sectionData, config);
      case 'incident_analysis':
        return this.generateIncidentAnalysis(sectionData, config);
      case 'recommendations':
        return this.generateRecommendations(sectionData, config);
      case 'appendix':
        return this.generateAppendix(sectionData, config);
      default:
        return '<p>Section content not available.</p>';
    }
  };

  // ========================================
  // EXECUTIVE SUMMARY
  // ========================================

  ERM.ReportSections.generateExecutiveSummary = function (data, config) {
    var summary = data.summary || {};
    var highlights = data.highlights || [];
    var html = '';

    // Intro paragraph
    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>This report provides a comprehensive overview of the organization\'s risk management posture. ';
    html += 'The analysis includes <strong>' + (summary.totalRisks || 0) + '</strong> risks, ';
    html += '<strong>' + (summary.totalControls || 0) + '</strong> controls, ';
    html += '<strong>' + (summary.totalKRIs || 0) + '</strong> key risk indicators, and ';
    html += '<strong>' + (summary.totalIncidents || 0) + '</strong> incidents.</p>';
    html += '</div>';

    // Key metrics grid
    html += '<div style="' + ERM.ReportStyles.gridFour + '">';

    // Total Risks metric
    html += '<div style="' + ERM.ReportStyles.metricCard + '">';
    html += '<div style="' + ERM.ReportStyles.metricLabel + '">Total Risks</div>';
    html += '<div style="' + ERM.ReportStyles.metricValue + '">' + (summary.totalRisks || 0) + '</div>';
    html += '</div>';

    // Critical Risks metric
    var criticalStyle = ERM.ReportStyles.metricCard;
    if (summary.risksByLevel && summary.risksByLevel.critical > 0) {
      criticalStyle += ' border-left: 4px solid #ef4444;';
    }
    html += '<div style="' + criticalStyle + '">';
    html += '<div style="' + ERM.ReportStyles.metricLabel + '">Critical Risks</div>';
    html += '<div style="' + ERM.ReportStyles.metricValue + ' color: #ef4444;">' + (summary.risksByLevel ? summary.risksByLevel.critical : 0) + '</div>';
    html += '</div>';

    // Control Effectiveness metric
    html += '<div style="' + ERM.ReportStyles.metricCard + '">';
    html += '<div style="' + ERM.ReportStyles.metricLabel + '">Control Effectiveness</div>';
    html += '<div style="' + ERM.ReportStyles.metricValue + '">' + (summary.controlEffectivenessRate || 0) + '%</div>';
    html += '</div>';

    // KRI Compliance metric
    html += '<div style="' + ERM.ReportStyles.metricCard + '">';
    html += '<div style="' + ERM.ReportStyles.metricLabel + '">KRI Compliance</div>';
    html += '<div style="' + ERM.ReportStyles.metricValue + '">' + (summary.kriComplianceRate || 100) + '%</div>';
    html += '</div>';

    html += '</div>';

    // Key Highlights
    if (highlights.length > 0) {
      html += '<h3 style="' + ERM.ReportStyles.subsectionHeader + '">Key Highlights</h3>';
      highlights.forEach(function (highlight) {
        var alertStyle = highlight.type === 'critical' ? ERM.ReportStyles.alertCritical :
          highlight.type === 'warning' ? ERM.ReportStyles.alertWarning :
          highlight.type === 'success' ? ERM.ReportStyles.alertSuccess :
          ERM.ReportStyles.alertInfo;

        html += '<div style="' + alertStyle + '">';
        html += '<span style="margin-right: 8px;">' + highlight.icon + '</span>';
        html += '<span>' + highlight.text + '</span>';
        html += '</div>';
      });
    }

    return html;
  };

  // ========================================
  // RISK OVERVIEW
  // ========================================

  ERM.ReportSections.generateRiskOverview = function (data, config) {
    var risks = data.risks || [];
    var summary = data.summary || {};
    var html = '';

    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>The risk register contains ' + risks.length + ' identified risks across the organization. ';
    html += 'This section provides a summary breakdown by risk level.</p>';
    html += '</div>';

    // Risk distribution
    html += '<h3 style="' + ERM.ReportStyles.subsectionHeader + '">Risk Distribution by Level</h3>';
    html += '<div style="' + ERM.ReportStyles.gridFour + '">';

    var riskLevels = [
      { level: 'critical', label: 'Critical', color: '#ef4444', count: summary.risksByLevel ? summary.risksByLevel.critical : 0 },
      { level: 'high', label: 'High', color: '#f97316', count: summary.risksByLevel ? summary.risksByLevel.high : 0 },
      { level: 'medium', label: 'Medium', color: '#eab308', count: summary.risksByLevel ? summary.risksByLevel.medium : 0 },
      { level: 'low', label: 'Low', color: '#22c55e', count: summary.risksByLevel ? summary.risksByLevel.low : 0 }
    ];

    riskLevels.forEach(function (item) {
      html += '<div style="' + ERM.ReportStyles.metricCard + ' border-top: 4px solid ' + item.color + ';">';
      html += '<div style="' + ERM.ReportStyles.metricLabel + '">' + item.label + '</div>';
      html += '<div style="' + ERM.ReportStyles.metricValue + ' color: ' + item.color + ';">' + item.count + '</div>';
      html += '</div>';
    });

    html += '</div>';

    // Risk by category
    var categories = {};
    risks.forEach(function (risk) {
      var cat = risk.category || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    if (Object.keys(categories).length > 0) {
      html += '<h3 style="' + ERM.ReportStyles.subsectionHeader + '">Risk Distribution by Category</h3>';
      html += '<table style="' + ERM.ReportStyles.table + '">';
      html += '<thead style="' + ERM.ReportStyles.tableHeader + '">';
      html += '<tr>';
      html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' text-align: left;">Category</th>';
      html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' text-align: center; width: 100px;">Count</th>';
      html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' text-align: center; width: 100px;">%</th>';
      html += '</tr>';
      html += '</thead>';
      html += '<tbody>';

      var isAlt = false;
      Object.keys(categories).forEach(function (cat) {
        var count = categories[cat];
        var percent = risks.length > 0 ? Math.round((count / risks.length) * 100) : 0;
        html += '<tr style="' + (isAlt ? ERM.ReportStyles.tableRowAlt : ERM.ReportStyles.tableRow) + '">';
        html += '<td style="' + ERM.ReportStyles.tableCell + '">' + ERM.utils.escapeHtml(cat) + '</td>';
        html += '<td style="' + ERM.ReportStyles.tableCell + ' text-align: center;">' + count + '</td>';
        html += '<td style="' + ERM.ReportStyles.tableCell + ' text-align: center;">' + percent + '%</td>';
        html += '</tr>';
        isAlt = !isAlt;
      });

      html += '</tbody>';
      html += '</table>';
    }

    return html;
  };

  // ========================================
  // RISK HEATMAP
  // ========================================

  ERM.ReportSections.generateRiskHeatmap = function (data, config) {
    var matrix = data.matrix || [];
    var html = '';

    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>The risk heatmap visualizes risks by their likelihood and impact scores. ';
    html += 'Higher scores indicate greater risk exposure requiring attention.</p>';
    html += '</div>';

    // Create heatmap table
    html += '<table style="' + ERM.ReportStyles.table + ' margin: 20px auto; max-width: 600px;">';

    // Header row (Impact)
    html += '<thead>';
    html += '<tr>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' background: transparent; color: #334155;"></th>';
    html += '<th colspan="5" style="' + ERM.ReportStyles.tableHeaderCell + ' background: #1e3a8a; text-align: center;">Impact →</th>';
    html += '</tr>';
    html += '<tr>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' background: #1e3a8a; writing-mode: vertical-rl; text-orientation: mixed;">Likelihood ↑</th>';
    for (var i = 1; i <= 5; i++) {
      html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' background: #334155; text-align: center; width: 80px;">' + i + '</th>';
    }
    html += '</tr>';
    html += '</thead>';

    // Matrix rows (5 = highest likelihood at top)
    html += '<tbody>';
    for (var row = 4; row >= 0; row--) {
      html += '<tr>';
      html += '<td style="' + ERM.ReportStyles.tableCell + ' background: #334155; color: white; text-align: center; font-weight: 600;">' + (row + 1) + '</td>';

      for (var col = 0; col < 5; col++) {
        var cellRisks = matrix[row] && matrix[row][col] ? matrix[row][col] : [];
        var riskScore = (row + 1) * (col + 1);
        var bgColor = this.getHeatmapColor(riskScore);

        html += '<td style="' + ERM.ReportStyles.tableCell + ' background: ' + bgColor + '; text-align: center; vertical-align: middle; height: 60px;">';
        if (cellRisks.length > 0) {
          html += '<span style="background: white; border-radius: 50%; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px;">' + cellRisks.length + '</span>';
        }
        html += '</td>';
      }
      html += '</tr>';
    }
    html += '</tbody>';
    html += '</table>';

    // Legend - Stacked
    html += '<div style="display: flex; flex-direction: column; gap: 6px; margin-top: 16px; font-size: 12px;">';
    html += '<div style="display: flex; align-items: center; gap: 8px;"><span style="width: 16px; height: 16px; background: #dcfce7; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1);"></span> Low (1-4)</div>';
    html += '<div style="display: flex; align-items: center; gap: 8px;"><span style="width: 16px; height: 16px; background: #fef3c7; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1);"></span> Medium (5-9)</div>';
    html += '<div style="display: flex; align-items: center; gap: 8px;"><span style="width: 16px; height: 16px; background: #fed7aa; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1);"></span> High (10-14)</div>';
    html += '<div style="display: flex; align-items: center; gap: 8px;"><span style="width: 16px; height: 16px; background: #fecaca; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1);"></span> Critical (15-25)</div>';
    html += '</div>';

    return html;
  };

  ERM.ReportSections.getHeatmapColor = function (score) {
    if (score >= 15) return '#fecaca';
    if (score >= 10) return '#fed7aa';
    if (score >= 5) return '#fef3c7';
    return '#dcfce7';
  };

  // ========================================
  // TOP RISKS
  // ========================================

  ERM.ReportSections.generateTopRisks = function (data, config) {
    var topRisks = data.topRisks || [];
    var html = '';

    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>The following risks have been identified as the highest priority based on their inherent risk scores. ';
    html += 'These require focused attention and active mitigation.</p>';
    html += '</div>';

    if (topRisks.length === 0) {
      html += '<p style="color: #64748b; font-style: italic;">No risks available to display.</p>';
      return html;
    }

    topRisks.forEach(function (risk, index) {
      var borderColor = risk.inherentRisk === 'critical' ? '#ef4444' :
        risk.inherentRisk === 'high' ? '#f97316' :
        risk.inherentRisk === 'medium' ? '#eab308' : '#22c55e';

      html += '<div style="' + ERM.ReportStyles.card + ' border-left: 4px solid ' + borderColor + ';">';
      html += '<div style="' + ERM.ReportStyles.cardHeader + '">';
      html += '<span style="color: #3b82f6; font-weight: 700; margin-right: 10px;">#' + (index + 1) + '</span>';
      html += ERM.utils.escapeHtml(risk.title);
      html += '<span style="margin-left: auto;">' + ERM.ReportComponents.buildRiskLevelBadge(risk.inherentRisk) + '</span>';
      html += '</div>';

      if (risk.description) {
        html += '<p style="font-size: 13px; color: #64748b; margin: 0 0 12px 0;">' + ERM.utils.escapeHtml(risk.description) + '</p>';
      }

      html += '<div style="display: flex; gap: 20px; font-size: 12px; color: #64748b;">';
      html += '<span><strong>Category:</strong> ' + (risk.category || 'N/A') + '</span>';
      html += '<span><strong>Owner:</strong> ' + (risk.owner || 'Unassigned') + '</span>';
      html += '<span><strong>Residual:</strong> ' + ERM.ReportComponents.buildRiskLevelBadge(risk.residualRisk) + '</span>';
      html += '</div>';

      if (risk.mitigationPlan) {
        html += '<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">';
        html += '<strong style="font-size: 12px; color: #334155;">Mitigation Plan:</strong>';
        html += '<p style="font-size: 13px; color: #475569; margin: 4px 0 0 0;">' + ERM.utils.escapeHtml(risk.mitigationPlan) + '</p>';
        html += '</div>';
      }

      html += '</div>';
    });

    return html;
  };

  // ========================================
  // RISK REGISTER
  // ========================================

  ERM.ReportSections.generateRiskRegister = function (data, config) {
    var risks = data.risks || [];
    var html = '';

    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>Complete listing of all ' + risks.length + ' registered risks in the system.</p>';
    html += '</div>';

    if (risks.length === 0) {
      html += '<p style="color: #64748b; font-style: italic;">No risks have been registered yet.</p>';
      return html;
    }

    html += '<table style="' + ERM.ReportStyles.table + '">';
    html += '<thead style="' + ERM.ReportStyles.tableHeader + '">';
    html += '<tr>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 80px;">Ref</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + '">Risk Title</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 120px;">Category</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 100px; text-align: center;">Inherent</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 100px; text-align: center;">Residual</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 100px;">Owner</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    var isAlt = false;
    risks.forEach(function (risk) {
      html += '<tr style="' + (isAlt ? ERM.ReportStyles.tableRowAlt : ERM.ReportStyles.tableRow) + '">';
      html += '<td style="' + ERM.ReportStyles.tableCell + ' font-weight: 600; color: #3b82f6;">' + (risk.reference || 'N/A') + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + '">' + ERM.utils.escapeHtml(risk.title) + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + '">' + (risk.category || 'N/A') + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + ' text-align: center;">' + ERM.ReportComponents.buildRiskLevelBadge(risk.inherentRisk) + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + ' text-align: center;">' + ERM.ReportComponents.buildRiskLevelBadge(risk.residualRisk) + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + '">' + (risk.owner || 'Unassigned') + '</td>';
      html += '</tr>';
      isAlt = !isAlt;
    });

    html += '</tbody>';
    html += '</table>';

    return html;
  };

  // ========================================
  // CONTROL SUMMARY
  // ========================================

  ERM.ReportSections.generateControlSummary = function (data, config) {
    var controls = data.controls || [];
    var summary = data.summary || {};
    var html = '';

    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>The organization maintains ' + controls.length + ' controls to mitigate identified risks. ';
    html += 'This section summarizes control effectiveness across the control environment.</p>';
    html += '</div>';

    // Effectiveness metrics
    html += '<h3 style="' + ERM.ReportStyles.subsectionHeader + '">Control Effectiveness Distribution</h3>';
    html += '<div style="' + ERM.ReportStyles.gridFour + '">';

    var effectivenessLevels = [
      { level: 'effective', label: 'Effective', color: '#22c55e', count: summary.controlsByEffectiveness ? summary.controlsByEffectiveness.effective : 0 },
      { level: 'partiallyEffective', label: 'Partial', color: '#eab308', count: summary.controlsByEffectiveness ? summary.controlsByEffectiveness.partiallyEffective : 0 },
      { level: 'ineffective', label: 'Ineffective', color: '#ef4444', count: summary.controlsByEffectiveness ? summary.controlsByEffectiveness.ineffective : 0 },
      { level: 'notTested', label: 'Not Tested', color: '#94a3b8', count: summary.controlsByEffectiveness ? summary.controlsByEffectiveness.notTested : 0 }
    ];

    effectivenessLevels.forEach(function (item) {
      html += '<div style="' + ERM.ReportStyles.metricCard + ' border-top: 4px solid ' + item.color + ';">';
      html += '<div style="' + ERM.ReportStyles.metricLabel + '">' + item.label + '</div>';
      html += '<div style="' + ERM.ReportStyles.metricValue + ' color: ' + item.color + ';">' + item.count + '</div>';
      html += '</div>';
    });

    html += '</div>';

    // Overall effectiveness rate
    html += '<div style="' + ERM.ReportStyles.execSummaryBox + ' margin-top: 20px;">';
    html += '<div style="display: flex; align-items: center; justify-content: space-between;">';
    html += '<div>';
    html += '<div style="' + ERM.ReportStyles.execSummaryTitle + '">Overall Effectiveness Rate</div>';
    html += '<div style="' + ERM.ReportStyles.execSummaryContent + '">Based on tested controls only</div>';
    html += '</div>';
    html += '<div style="font-size: 48px; font-weight: 700; color: ' + (summary.controlEffectivenessRate >= 80 ? '#22c55e' : summary.controlEffectivenessRate >= 60 ? '#eab308' : '#ef4444') + ';">';
    html += (summary.controlEffectivenessRate || 0) + '%';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    return html;
  };

  // ========================================
  // CONTROL REGISTER
  // ========================================

  ERM.ReportSections.generateControlRegister = function (data, config) {
    var controls = data.controls || [];
    var html = '';

    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>Complete listing of all ' + controls.length + ' controls in the control library.</p>';
    html += '</div>';

    if (controls.length === 0) {
      html += '<p style="color: #64748b; font-style: italic;">No controls have been registered yet.</p>';
      return html;
    }

    html += '<table style="' + ERM.ReportStyles.table + '">';
    html += '<thead style="' + ERM.ReportStyles.tableHeader + '">';
    html += '<tr>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 80px;">Ref</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + '">Control Title</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 100px;">Type</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 120px; text-align: center;">Effectiveness</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 100px;">Owner</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    var isAlt = false;
    controls.forEach(function (control) {
      html += '<tr style="' + (isAlt ? ERM.ReportStyles.tableRowAlt : ERM.ReportStyles.tableRow) + '">';
      html += '<td style="' + ERM.ReportStyles.tableCell + ' font-weight: 600; color: #3b82f6;">' + (control.reference || 'N/A') + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + '">' + ERM.utils.escapeHtml(control.title) + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + '">' + (control.type || 'N/A') + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + ' text-align: center;">' + ERM.ReportComponents.buildEffectivenessBadge(control.effectiveness) + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + '">' + (control.owner || 'Unassigned') + '</td>';
      html += '</tr>';
      isAlt = !isAlt;
    });

    html += '</tbody>';
    html += '</table>';

    return html;
  };

  // ========================================
  // CONTROL GAPS
  // ========================================

  ERM.ReportSections.generateControlGaps = function (data, config) {
    var gaps = data.gaps || [];
    var html = '';

    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>This section highlights controls that have been identified as ineffective or only partially effective. ';
    html += 'These require remediation to strengthen the control environment.</p>';
    html += '</div>';

    if (gaps.length === 0) {
      html += '<div style="' + ERM.ReportStyles.alertSuccess + '">';
      html += '<span style="margin-right: 8px;">✅</span>';
      html += '<span>No control gaps identified. All tested controls are operating effectively.</span>';
      html += '</div>';
      return html;
    }

    html += '<div style="' + ERM.ReportStyles.alertWarning + ' margin-bottom: 20px;">';
    html += '<span style="margin-right: 8px;">⚠️</span>';
    html += '<span><strong>' + gaps.length + '</strong> control(s) require attention</span>';
    html += '</div>';

    gaps.forEach(function (control) {
      var borderColor = control.effectiveness === 'ineffective' ? '#ef4444' : '#eab308';

      html += '<div style="' + ERM.ReportStyles.card + ' border-left: 4px solid ' + borderColor + ';">';
      html += '<div style="' + ERM.ReportStyles.cardHeader + '">';
      html += ERM.utils.escapeHtml(control.title);
      html += '<span style="margin-left: auto;">' + ERM.ReportComponents.buildEffectivenessBadge(control.effectiveness) + '</span>';
      html += '</div>';

      if (control.description) {
        html += '<p style="font-size: 13px; color: #64748b; margin: 0 0 12px 0;">' + ERM.utils.escapeHtml(control.description) + '</p>';
      }

      html += '<div style="display: flex; gap: 20px; font-size: 12px; color: #64748b;">';
      html += '<span><strong>Type:</strong> ' + (control.type || 'N/A') + '</span>';
      html += '<span><strong>Owner:</strong> ' + (control.owner || 'Unassigned') + '</span>';
      if (control.lastTested) {
        html += '<span><strong>Last Tested:</strong> ' + new Date(control.lastTested).toLocaleDateString() + '</span>';
      }
      html += '</div>';
      html += '</div>';
    });

    return html;
  };

  // ========================================
  // KRI SUMMARY
  // ========================================

  ERM.ReportSections.generateKRISummary = function (data, config) {
    var kris = data.kris || [];
    var summary = data.summary || {};
    var html = '';

    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>The organization tracks ' + kris.length + ' Key Risk Indicators (KRIs) to monitor risk exposure. ';
    html += 'KRIs provide early warning signals when risk levels approach or exceed defined thresholds.</p>';
    html += '</div>';

    // Summary metrics
    html += '<div style="' + ERM.ReportStyles.gridThree + '">';

    html += '<div style="' + ERM.ReportStyles.metricCard + '">';
    html += '<div style="' + ERM.ReportStyles.metricLabel + '">Total KRIs</div>';
    html += '<div style="' + ERM.ReportStyles.metricValue + '">' + kris.length + '</div>';
    html += '</div>';

    html += '<div style="' + ERM.ReportStyles.metricCard + ' border-top: 4px solid #ef4444;">';
    html += '<div style="' + ERM.ReportStyles.metricLabel + '">Breached</div>';
    html += '<div style="' + ERM.ReportStyles.metricValue + ' color: #ef4444;">' + (summary.krisBreached || 0) + '</div>';
    html += '</div>';

    html += '<div style="' + ERM.ReportStyles.metricCard + ' border-top: 4px solid #22c55e;">';
    html += '<div style="' + ERM.ReportStyles.metricLabel + '">Compliance Rate</div>';
    html += '<div style="' + ERM.ReportStyles.metricValue + ' color: #22c55e;">' + (summary.kriComplianceRate || 100) + '%</div>';
    html += '</div>';

    html += '</div>';

    return html;
  };

  // ========================================
  // KRI DASHBOARD
  // ========================================

  ERM.ReportSections.generateKRIDashboard = function (data, config) {
    var kris = data.kris || [];
    var html = '';

    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>Detailed view of all Key Risk Indicators with current values, thresholds, and status.</p>';
    html += '</div>';

    if (kris.length === 0) {
      html += '<p style="color: #64748b; font-style: italic;">No KRIs have been configured yet.</p>';
      return html;
    }

    html += '<table style="' + ERM.ReportStyles.table + '">';
    html += '<thead style="' + ERM.ReportStyles.tableHeader + '">';
    html += '<tr>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + '">KRI Name</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 100px; text-align: center;">Current</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 100px; text-align: center;">Threshold</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 100px; text-align: center;">Target</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 100px; text-align: center;">Status</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 80px; text-align: center;">Trend</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    var isAlt = false;
    kris.forEach(function (kri) {
      var statusColor = kri.status === 'breached' ? '#ef4444' : kri.status === 'warning' ? '#eab308' : '#22c55e';
      var trendIcon = kri.trend === 'up' || kri.trend === 'deteriorating' ? '↑' :
        kri.trend === 'down' || kri.trend === 'improving' ? '↓' : '→';
      var trendColor = kri.trend === 'up' || kri.trend === 'deteriorating' ? '#ef4444' :
        kri.trend === 'down' || kri.trend === 'improving' ? '#22c55e' : '#64748b';

      html += '<tr style="' + (isAlt ? ERM.ReportStyles.tableRowAlt : ERM.ReportStyles.tableRow) + '">';
      html += '<td style="' + ERM.ReportStyles.tableCell + '">' + ERM.utils.escapeHtml(kri.name) + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + ' text-align: center; font-weight: 600;">' + (kri.currentValue || 0) + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + ' text-align: center;">' + (kri.threshold || '-') + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + ' text-align: center;">' + (kri.target || '-') + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + ' text-align: center;"><span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; background: ' + statusColor + '20; color: ' + statusColor + ';">' + (kri.status || 'Normal') + '</span></td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + ' text-align: center; font-size: 18px; color: ' + trendColor + ';">' + trendIcon + '</td>';
      html += '</tr>';
      isAlt = !isAlt;
    });

    html += '</tbody>';
    html += '</table>';

    return html;
  };

  // ========================================
  // KRI TRENDS
  // ========================================

  ERM.ReportSections.generateKRITrends = function (data, config) {
    var trends = data.trends || { improving: [], stable: [], deteriorating: [] };
    var html = '';

    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>Analysis of KRI trends to identify improving, stable, and deteriorating indicators.</p>';
    html += '</div>';

    // Improving KRIs
    html += '<h3 style="' + ERM.ReportStyles.subsectionHeader + ' color: #22c55e;">📈 Improving (' + trends.improving.length + ')</h3>';
    if (trends.improving.length > 0) {
      html += '<ul style="margin: 0; padding-left: 20px;">';
      trends.improving.forEach(function (kri) {
        html += '<li style="' + ERM.ReportStyles.listItem + '">' + ERM.utils.escapeHtml(kri.name || kri.title) + '</li>';
      });
      html += '</ul>';
    } else {
      html += '<p style="color: #64748b; font-size: 13px;">No improving KRIs in this period.</p>';
    }

    // Stable KRIs
    html += '<h3 style="' + ERM.ReportStyles.subsectionHeader + ' color: #64748b;">➡️ Stable (' + trends.stable.length + ')</h3>';
    if (trends.stable.length > 0) {
      html += '<ul style="margin: 0; padding-left: 20px;">';
      trends.stable.forEach(function (kri) {
        html += '<li style="' + ERM.ReportStyles.listItem + '">' + ERM.utils.escapeHtml(kri.name || kri.title) + '</li>';
      });
      html += '</ul>';
    } else {
      html += '<p style="color: #64748b; font-size: 13px;">No stable KRIs in this period.</p>';
    }

    // Deteriorating KRIs
    html += '<h3 style="' + ERM.ReportStyles.subsectionHeader + ' color: #ef4444;">📉 Deteriorating (' + trends.deteriorating.length + ')</h3>';
    if (trends.deteriorating.length > 0) {
      html += '<ul style="margin: 0; padding-left: 20px;">';
      trends.deteriorating.forEach(function (kri) {
        html += '<li style="' + ERM.ReportStyles.listItem + '">' + ERM.utils.escapeHtml(kri.name || kri.title) + '</li>';
      });
      html += '</ul>';
    } else {
      html += '<p style="color: #64748b; font-size: 13px;">No deteriorating KRIs in this period.</p>';
    }

    return html;
  };

  // ========================================
  // INCIDENT SUMMARY
  // ========================================

  ERM.ReportSections.generateIncidentSummary = function (data, config) {
    var incidents = data.incidents || [];
    var summary = data.summary || {};
    var html = '';

    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>Overview of ' + incidents.length + ' recorded incidents during the reporting period.</p>';
    html += '</div>';

    // Severity breakdown
    html += '<h3 style="' + ERM.ReportStyles.subsectionHeader + '">Incidents by Severity</h3>';
    html += '<div style="' + ERM.ReportStyles.gridFour + '">';

    var severityLevels = [
      { level: 'critical', label: 'Critical', color: '#ef4444', count: summary.incidentsBySeverity ? summary.incidentsBySeverity.critical : 0 },
      { level: 'high', label: 'High', color: '#f97316', count: summary.incidentsBySeverity ? summary.incidentsBySeverity.high : 0 },
      { level: 'medium', label: 'Medium', color: '#eab308', count: summary.incidentsBySeverity ? summary.incidentsBySeverity.medium : 0 },
      { level: 'low', label: 'Low', color: '#22c55e', count: summary.incidentsBySeverity ? summary.incidentsBySeverity.low : 0 }
    ];

    severityLevels.forEach(function (item) {
      html += '<div style="' + ERM.ReportStyles.metricCard + ' border-top: 4px solid ' + item.color + ';">';
      html += '<div style="' + ERM.ReportStyles.metricLabel + '">' + item.label + '</div>';
      html += '<div style="' + ERM.ReportStyles.metricValue + ' color: ' + item.color + ';">' + item.count + '</div>';
      html += '</div>';
    });

    html += '</div>';

    return html;
  };

  // ========================================
  // INCIDENT REGISTER
  // ========================================

  ERM.ReportSections.generateIncidentRegister = function (data, config) {
    var incidents = data.incidents || [];
    var html = '';

    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>Complete listing of all ' + incidents.length + ' recorded incidents.</p>';
    html += '</div>';

    if (incidents.length === 0) {
      html += '<p style="color: #64748b; font-style: italic;">No incidents have been recorded.</p>';
      return html;
    }

    html += '<table style="' + ERM.ReportStyles.table + '">';
    html += '<thead style="' + ERM.ReportStyles.tableHeader + '">';
    html += '<tr>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 80px;">Ref</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + '">Incident Title</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 100px;">Date</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 100px; text-align: center;">Severity</th>';
    html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' width: 100px; text-align: center;">Status</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    var isAlt = false;
    incidents.forEach(function (incident) {
      html += '<tr style="' + (isAlt ? ERM.ReportStyles.tableRowAlt : ERM.ReportStyles.tableRow) + '">';
      html += '<td style="' + ERM.ReportStyles.tableCell + ' font-weight: 600; color: #3b82f6;">' + (incident.reference || 'N/A') + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + '">' + ERM.utils.escapeHtml(incident.title) + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + '">' + (incident.dateOccurred ? new Date(incident.dateOccurred).toLocaleDateString() : 'N/A') + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + ' text-align: center;">' + ERM.ReportComponents.buildRiskLevelBadge(incident.severity) + '</td>';
      html += '<td style="' + ERM.ReportStyles.tableCell + ' text-align: center;">' + ERM.ReportComponents.buildStatusBadge(incident.status) + '</td>';
      html += '</tr>';
      isAlt = !isAlt;
    });

    html += '</tbody>';
    html += '</table>';

    return html;
  };

  // ========================================
  // INCIDENT ANALYSIS
  // ========================================

  ERM.ReportSections.generateIncidentAnalysis = function (data, config) {
    var analysis = data.analysis || {};
    var html = '';

    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>Detailed analysis of incidents including categorization and root cause identification.</p>';
    html += '</div>';

    // By Category
    if (analysis.byCategory && Object.keys(analysis.byCategory).length > 0) {
      html += '<h3 style="' + ERM.ReportStyles.subsectionHeader + '">Incidents by Category</h3>';
      html += '<table style="' + ERM.ReportStyles.table + '">';
      html += '<thead style="' + ERM.ReportStyles.tableHeader + '">';
      html += '<tr>';
      html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' text-align: left;">Category</th>';
      html += '<th style="' + ERM.ReportStyles.tableHeaderCell + ' text-align: center; width: 100px;">Count</th>';
      html += '</tr>';
      html += '</thead>';
      html += '<tbody>';

      var isAlt = false;
      Object.keys(analysis.byCategory).forEach(function (cat) {
        html += '<tr style="' + (isAlt ? ERM.ReportStyles.tableRowAlt : ERM.ReportStyles.tableRow) + '">';
        html += '<td style="' + ERM.ReportStyles.tableCell + '">' + ERM.utils.escapeHtml(cat) + '</td>';
        html += '<td style="' + ERM.ReportStyles.tableCell + ' text-align: center;">' + analysis.byCategory[cat] + '</td>';
        html += '</tr>';
        isAlt = !isAlt;
      });

      html += '</tbody>';
      html += '</table>';
    }

    // Root Causes
    if (analysis.rootCauses && Object.keys(analysis.rootCauses).length > 0) {
      html += '<h3 style="' + ERM.ReportStyles.subsectionHeader + '">Common Root Causes</h3>';
      html += '<ul style="margin: 0; padding-left: 20px;">';
      Object.keys(analysis.rootCauses).forEach(function (cause) {
        html += '<li style="' + ERM.ReportStyles.listItem + '">' + ERM.utils.escapeHtml(cause) + ' (' + analysis.rootCauses[cause] + ' occurrences)</li>';
      });
      html += '</ul>';
    }

    return html;
  };

  // ========================================
  // RECOMMENDATIONS
  // ========================================

  ERM.ReportSections.generateRecommendations = function (data, config) {
    var recommendations = data.recommendations || [];
    var html = '';

    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>Based on the analysis, the following recommendations are provided to strengthen the organization\'s risk management posture.</p>';
    html += '</div>';

    if (recommendations.length === 0) {
      html += '<div style="' + ERM.ReportStyles.alertSuccess + '">';
      html += '<span style="margin-right: 8px;">✅</span>';
      html += '<span>No critical recommendations at this time. Continue monitoring risk indicators.</span>';
      html += '</div>';
      return html;
    }

    recommendations.forEach(function (rec, index) {
      var priorityColor = rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#eab308' : '#22c55e';

      html += '<div style="' + ERM.ReportStyles.card + ' border-left: 4px solid ' + priorityColor + ';">';
      html += '<div style="' + ERM.ReportStyles.cardHeader + '">';
      html += '<span style="background: ' + priorityColor + '; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-right: 10px;">' + (rec.priority || 'medium').toUpperCase() + '</span>';
      html += (rec.category || 'General');
      html += '</div>';
      html += '<p style="font-size: 14px; color: #334155; margin: 0 0 12px 0;">' + ERM.utils.escapeHtml(rec.text) + '</p>';
      if (rec.action) {
        html += '<div style="background: #f8fafc; padding: 10px 14px; border-radius: 6px; font-size: 13px;">';
        html += '<strong style="color: #3b82f6;">Action:</strong> ' + ERM.utils.escapeHtml(rec.action);
        html += '</div>';
      }
      html += '</div>';
    });

    return html;
  };

  // ========================================
  // APPENDIX
  // ========================================

  ERM.ReportSections.generateAppendix = function (data, config) {
    var html = '';

    html += '<div style="' + ERM.ReportStyles.sectionIntro + '">';
    html += '<p>Supporting documentation and additional reference materials.</p>';
    html += '</div>';

    html += '<h3 style="' + ERM.ReportStyles.subsectionHeader + '">Report Metadata</h3>';
    html += '<table style="' + ERM.ReportStyles.table + '">';
    html += '<tbody>';
    html += '<tr style="' + ERM.ReportStyles.tableRow + '">';
    html += '<td style="' + ERM.ReportStyles.tableCell + ' font-weight: 600; width: 200px;">Generated Date</td>';
    html += '<td style="' + ERM.ReportStyles.tableCell + '">' + new Date().toLocaleString() + '</td>';
    html += '</tr>';
    html += '<tr style="' + ERM.ReportStyles.tableRowAlt + '">';
    html += '<td style="' + ERM.ReportStyles.tableCell + ' font-weight: 600;">Data Sources</td>';
    html += '<td style="' + ERM.ReportStyles.tableCell + '">' + (data.data && data.data.metadata ? data.data.metadata.sources.join(', ') : 'N/A') + '</td>';
    html += '</tr>';
    html += '<tr style="' + ERM.ReportStyles.tableRow + '">';
    html += '<td style="' + ERM.ReportStyles.tableCell + ' font-weight: 600;">Filter Period</td>';
    html += '<td style="' + ERM.ReportStyles.tableCell + '">' + (data.data && data.data.metadata && data.data.metadata.filters ? data.data.metadata.filters.period : 'All') + '</td>';
    html += '</tr>';
    html += '</tbody>';
    html += '</table>';

    html += '<h3 style="' + ERM.ReportStyles.subsectionHeader + '">Glossary</h3>';
    html += '<table style="' + ERM.ReportStyles.table + '">';
    html += '<tbody>';
    html += '<tr style="' + ERM.ReportStyles.tableRow + '">';
    html += '<td style="' + ERM.ReportStyles.tableCell + ' font-weight: 600; width: 150px;">Inherent Risk</td>';
    html += '<td style="' + ERM.ReportStyles.tableCell + '">The level of risk before any controls or mitigating actions are applied</td>';
    html += '</tr>';
    html += '<tr style="' + ERM.ReportStyles.tableRowAlt + '">';
    html += '<td style="' + ERM.ReportStyles.tableCell + ' font-weight: 600;">Residual Risk</td>';
    html += '<td style="' + ERM.ReportStyles.tableCell + '">The level of risk remaining after controls have been applied</td>';
    html += '</tr>';
    html += '<tr style="' + ERM.ReportStyles.tableRow + '">';
    html += '<td style="' + ERM.ReportStyles.tableCell + ' font-weight: 600;">KRI</td>';
    html += '<td style="' + ERM.ReportStyles.tableCell + '">Key Risk Indicator - a metric used to monitor risk exposure</td>';
    html += '</tr>';
    html += '<tr style="' + ERM.ReportStyles.tableRowAlt + '">';
    html += '<td style="' + ERM.ReportStyles.tableCell + ' font-weight: 600;">Control</td>';
    html += '<td style="' + ERM.ReportStyles.tableCell + '">A measure implemented to mitigate or manage risk</td>';
    html += '</tr>';
    html += '</tbody>';
    html += '</table>';

    return html;
  };

  // ========================================
  // GENERATE PREVIEW (for Report Builder)
  // ========================================

  ERM.ReportSections.generatePreview = function (config, data) {
    var html = '';

    html += '<div style="padding: 20px; font-family: inherit;">';
    html += '<h2 style="color: #0f172a; margin: 0 0 16px 0;">' + (config.output.title || 'Risk Report') + '</h2>';
    html += '<p style="color: #64748b; font-size: 13px; margin: 0 0 24px 0;">Period: ' + (config.filters.period || 'Current Quarter') + '</p>';

    // Summary stats
    var summary = data.summary || {};
    html += '<div class="stat-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">';
    html += '  <div style="background: #f8fafc; padding: 12px; border-radius: 8px; text-align: center;">';
    html += '    <div style="font-size: 24px; font-weight: 700; color: #0f172a;">' + (summary.totalRisks || 0) + '</div>';
    html += '    <div style="font-size: 11px; color: #64748b;">Risks</div>';
    html += '  </div>';
    html += '  <div style="background: #fef2f2; padding: 12px; border-radius: 8px; text-align: center;">';
    html += '    <div style="font-size: 24px; font-weight: 700; color: #dc2626;">' + (summary.risksByLevel ? summary.risksByLevel.critical : 0) + '</div>';
    html += '    <div style="font-size: 11px; color: #64748b;">Critical</div>';
    html += '  </div>';
    html += '  <div style="background: #f8fafc; padding: 12px; border-radius: 8px; text-align: center;">';
    html += '    <div style="font-size: 24px; font-weight: 700; color: #0f172a;">' + (summary.totalControls || 0) + '</div>';
    html += '    <div style="font-size: 11px; color: #64748b;">Controls</div>';
    html += '  </div>';
    html += '  <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; text-align: center;">';
    html += '    <div style="font-size: 24px; font-weight: 700; color: #22c55e;">' + (summary.controlEffectivenessRate || 0) + '%</div>';
    html += '    <div style="font-size: 11px; color: #64748b;">Effectiveness</div>';
    html += '  </div>';
    html += '</div>';

    // Section previews
    html += '<div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">';
    html += '  <p style="color: #64748b; font-size: 12px; font-style: italic;">Preview shows summary statistics. Full report will include all selected sections with detailed data.</p>';
    html += '</div>';

    html += '</div>';

    return html;
  };

  // ========================================
  // GENERATE FULL REPORT (for Report Builder)
  // ========================================

  ERM.ReportSections.generateFullReport = function (config, data, editedContent) {
    editedContent = editedContent || {};
    var html = '';

    // Title
    html += '<h1>' + ERM.utils.escapeHtml(config.output.title || 'Risk Report') + '</h1>';
    html += '<div class="meta" style="color: #64748b; font-size: 14px; margin-bottom: 30px;">';
    html += '  <strong>Period:</strong> ' + (config.filters.period || 'Current Quarter') + ' | ';
    html += '  <strong>Generated:</strong> ' + new Date().toLocaleDateString('en-GB') + ' | ';
    html += '  <strong>Classification:</strong> ' + (config.output.classification || 'Internal');
    html += '</div>';

    // Executive Summary
    if (editedContent.exec_summary) {
      html += '<h2>Executive Summary</h2>';
      html += editedContent.exec_summary;
    } else {
      html += this.generateExecutiveSummaryContent(data);
    }

    // Risk sections
    if (config.dataSources.indexOf('risk_register') !== -1) {
      if (editedContent.top_risks) {
        html += '<h2>Top Risks</h2>';
        html += editedContent.top_risks;
      } else {
        html += this.generateTopRisksContent(data);
      }

      if (editedContent.risk_by_category) {
        html += '<h2>Risks by Category</h2>';
        html += editedContent.risk_by_category;
      } else {
        html += this.generateRiskByCategoryContent(data);
      }
    }

    // Control sections
    if (config.dataSources.indexOf('controls') !== -1) {
      if (editedContent.control_effectiveness) {
        html += '<h2>Control Effectiveness</h2>';
        html += editedContent.control_effectiveness;
      } else {
        html += this.generateControlEffectivenessContent(data);
      }
    }

    // Footer
    html += '<hr style="margin-top: 40px; border: none; border-top: 1px solid #e2e8f0;">';
    html += '<p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 16px;">';
    html += 'Generated by Dimeri ERM | ' + new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    html += '</p>';

    return html;
  };

  // ========================================
  // GET DEFAULT CONTENT (for Editor)
  // ========================================

  ERM.ReportSections.getDefaultContent = function (sectionId, data) {
    data = data || {};
    var summary = data.summary || {};

    switch (sectionId) {
      case 'exec_summary':
        return '<p>This report provides a comprehensive overview of the organization\'s risk profile. ' +
          'The analysis covers <strong>' + (summary.totalRisks || 0) + '</strong> identified risks and ' +
          '<strong>' + (summary.totalControls || 0) + '</strong> controls.</p>' +
          '<p>Key findings include:</p>' +
          '<ul>' +
          '<li>' + (summary.risksByLevel ? summary.risksByLevel.critical : 0) + ' critical risks requiring immediate attention</li>' +
          '<li>Control effectiveness rate of ' + (summary.controlEffectivenessRate || 0) + '%</li>' +
          '</ul>';

      case 'top_risks':
        return '<p>The following risks have been identified as highest priority based on their risk scores:</p>' +
          '<p><em>Customize this section with specific risk details.</em></p>';

      case 'risk_by_category':
        return '<p>Risk distribution across organizational categories:</p>' +
          '<p><em>Customize this section with category analysis.</em></p>';

      case 'control_effectiveness':
        return '<p>Control environment summary showing effectiveness metrics.</p>' +
          '<p>Effective: ' + (summary.controlsByEffectiveness ? summary.controlsByEffectiveness.effective : 0) + '</p>' +
          '<p>Partially Effective: ' + (summary.controlsByEffectiveness ? summary.controlsByEffectiveness.partiallyEffective : 0) + '</p>' +
          '<p>Ineffective: ' + (summary.controlsByEffectiveness ? summary.controlsByEffectiveness.ineffective : 0) + '</p>';

      case 'kri_summary':
        return '<p>Key Risk Indicators summary showing threshold status.</p>' +
          '<p><em>Customize this section with KRI details.</em></p>';

      case 'incident_summary':
        return '<p>Recent incident overview and analysis.</p>' +
          '<p><em>Customize this section with incident details.</em></p>';

      default:
        return '<p>Section content for ' + sectionId + '</p>' +
          '<p><em>Edit this section to add your content.</em></p>';
    }
  };

  // ========================================
  // HELPER: Executive Summary Content
  // ========================================

  ERM.ReportSections.generateExecutiveSummaryContent = function (data) {
    var summary = data.summary || {};
    var html = '';

    html += '<h2>Executive Summary</h2>';
    html += '<p style="line-height: 1.8;">This report provides a comprehensive overview of the organization\'s risk profile. ';
    html += 'The analysis covers <strong>' + (summary.totalRisks || 0) + '</strong> identified risks and ';
    html += '<strong>' + (summary.totalControls || 0) + '</strong> controls.</p>';

    // Stats grid
    html += '<div class="stat-grid">';
    html += '  <div class="stat-card">';
    html += '    <div class="stat-value">' + (summary.totalRisks || 0) + '</div>';
    html += '    <div class="stat-label">Total Risks</div>';
    html += '  </div>';
    html += '  <div class="stat-card" style="border-top: 3px solid #dc2626;">';
    html += '    <div class="stat-value" style="color: #dc2626;">' + (summary.risksByLevel ? summary.risksByLevel.critical : 0) + '</div>';
    html += '    <div class="stat-label">Critical</div>';
    html += '  </div>';
    html += '  <div class="stat-card" style="border-top: 3px solid #f59e0b;">';
    html += '    <div class="stat-value" style="color: #f59e0b;">' + (summary.risksByLevel ? summary.risksByLevel.high : 0) + '</div>';
    html += '    <div class="stat-label">High</div>';
    html += '  </div>';
    html += '  <div class="stat-card">';
    html += '    <div class="stat-value">' + (summary.totalControls || 0) + '</div>';
    html += '    <div class="stat-label">Controls</div>';
    html += '  </div>';
    html += '</div>';

    return html;
  };

  // ========================================
  // HELPER: Top Risks Content
  // ========================================

  ERM.ReportSections.generateTopRisksContent = function (data) {
    var risks = data.risks || [];
    var html = '';

    html += '<h2>Top Risks</h2>';
    html += '<p style="margin-bottom: 16px;">The following risks have been identified as highest priority:</p>';

    if (risks.length === 0) {
      html += '<p style="color: #64748b; font-style: italic;">No risks registered.</p>';
      return html;
    }

    // Sort by risk level
    var sortedRisks = risks.slice().sort(function (a, b) {
      var levels = { critical: 4, high: 3, medium: 2, low: 1 };
      return (levels[b.inherentRisk] || 2) - (levels[a.inherentRisk] || 2);
    });

    html += '<table>';
    html += '<tr><th>Ref</th><th>Risk Title</th><th>Category</th><th>Inherent</th><th>Owner</th></tr>';

    for (var i = 0; i < Math.min(sortedRisks.length, 10); i++) {
      var risk = sortedRisks[i];
      var badgeClass = 'badge-' + (risk.inherentRisk || 'medium');
      html += '<tr>';
      html += '<td>' + (risk.reference || 'R' + (i + 1)) + '</td>';
      html += '<td>' + ERM.utils.escapeHtml(risk.title || 'Untitled') + '</td>';
      html += '<td>' + (risk.category || 'N/A') + '</td>';
      html += '<td><span class="badge ' + badgeClass + '">' + (risk.inherentRisk || 'N/A').toUpperCase() + '</span></td>';
      html += '<td>' + (risk.owner || 'Unassigned') + '</td>';
      html += '</tr>';
    }

    html += '</table>';

    if (risks.length > 10) {
      html += '<p style="color: #64748b; font-size: 12px; font-style: italic; margin-top: 8px;">Showing top 10 of ' + risks.length + ' risks</p>';
    }

    return html;
  };

  // ========================================
  // HELPER: Risk by Category Content
  // ========================================

  ERM.ReportSections.generateRiskByCategoryContent = function (data) {
    var risks = data.risks || [];
    var html = '';

    html += '<h2>Risks by Category</h2>';

    var categories = {};
    risks.forEach(function (risk) {
      var cat = risk.category || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    if (Object.keys(categories).length === 0) {
      html += '<p style="color: #64748b; font-style: italic;">No risks to categorize.</p>';
      return html;
    }

    html += '<table>';
    html += '<tr><th>Category</th><th>Count</th><th>% of Total</th></tr>';

    Object.keys(categories).forEach(function (cat) {
      var count = categories[cat];
      var percent = risks.length > 0 ? Math.round((count / risks.length) * 100) : 0;
      html += '<tr>';
      html += '<td>' + ERM.utils.escapeHtml(cat) + '</td>';
      html += '<td>' + count + '</td>';
      html += '<td>' + percent + '%</td>';
      html += '</tr>';
    });

    html += '</table>';

    return html;
  };

  // ========================================
  // HELPER: Control Effectiveness Content
  // ========================================

  ERM.ReportSections.generateControlEffectivenessContent = function (data) {
    var controls = data.controls || [];
    var summary = data.summary || {};
    var html = '';

    html += '<h2>Control Effectiveness</h2>';
    html += '<p style="margin-bottom: 16px;">Overview of control effectiveness across the organization.</p>';

    if (controls.length === 0) {
      html += '<p style="color: #64748b; font-style: italic;">No controls registered.</p>';
      return html;
    }

    html += '<table>';
    html += '<tr><th>Effectiveness</th><th>Count</th><th>Percentage</th></tr>';

    var effectiveness = summary.controlsByEffectiveness || { effective: 0, partiallyEffective: 0, ineffective: 0, notTested: 0 };

    html += '<tr><td><span style="color: #22c55e;">●</span> Effective</td><td>' + effectiveness.effective + '</td><td>' + Math.round((effectiveness.effective / controls.length) * 100) + '%</td></tr>';
    html += '<tr><td><span style="color: #f59e0b;">●</span> Partially Effective</td><td>' + effectiveness.partiallyEffective + '</td><td>' + Math.round((effectiveness.partiallyEffective / controls.length) * 100) + '%</td></tr>';
    html += '<tr><td><span style="color: #dc2626;">●</span> Ineffective</td><td>' + effectiveness.ineffective + '</td><td>' + Math.round((effectiveness.ineffective / controls.length) * 100) + '%</td></tr>';
    html += '<tr><td><span style="color: #94a3b8;">●</span> Not Tested</td><td>' + effectiveness.notTested + '</td><td>' + Math.round((effectiveness.notTested / controls.length) * 100) + '%</td></tr>';

    html += '</table>';

    return html;
  };

})();

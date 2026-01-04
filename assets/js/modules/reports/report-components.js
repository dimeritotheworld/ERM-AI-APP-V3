/**
 * Dimeri ERM - Report Components
 * Reusable HTML builders for PDF reports
 * ES5 Compatible
 */

(function () {
  'use strict';

  window.ERM = window.ERM || {};
  ERM.ReportComponents = ERM.ReportComponents || {};

  // ========================================
  // COVER PAGE
  // ========================================

  ERM.ReportComponents.buildCoverPage = function (options) {
    options = options || {};
    var icon = options.icon || '📊';
    var title = options.title || 'Report Title';
    var subtitle = options.subtitle || '';
    var period = options.period || 'Q4 2025';
    var company = options.company || 'Dimeri ERM';
    var preparedBy = options.preparedBy || '';
    var preparedByTitle = options.preparedByTitle || '';
    var reportDate = options.reportDate || new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
    var classification = options.classification || 'CONFIDENTIAL';

    var html = '';
    html += '<div style="' + ERM.ReportStyles.coverPage + '">';
    html += '  <div style="' + ERM.ReportStyles.coverLogo + '">' + icon + '</div>';
    html += '  <h1 style="' + ERM.ReportStyles.coverTitle + '">' + title + '</h1>';
    if (subtitle) {
      html += '  <p style="' + ERM.ReportStyles.coverSubtitle + '">' + subtitle + '</p>';
    }
    html += '  <div style="width: 60px; height: 3px; background: white; margin: 20px auto;"></div>';
    html += '  <p style="' + ERM.ReportStyles.coverSubtitle + '">' + period + '</p>';
    html += '  <p style="font-size: 14px; color: rgba(255,255,255,0.85); margin-top: 30px;">' + company + '</p>';
    html += '  <div style="' + ERM.ReportStyles.coverMeta + '">';
    if (preparedBy) {
      html += '    <p style="margin: 4px 0;">Prepared by: ' + preparedBy + '</p>';
    }
    if (preparedByTitle) {
      html += '    <p style="margin: 4px 0;">' + preparedByTitle + '</p>';
    }
    html += '    <p style="margin: 10px 0 0 0;">Report Date: ' + reportDate + '</p>';
    html += '  </div>';
    html += '  <p style="' + ERM.ReportStyles.coverClassification + '">' + classification + '</p>';
    html += '</div>';

    return html;
  };

  // ========================================
  // TABLE OF CONTENTS
  // ========================================

  ERM.ReportComponents.buildTableOfContents = function (sections, options) {
    options = options || {};
    var includeAcronyms = options.includeAcronyms !== false;
    var includeFrameworks = options.includeFrameworks !== false;

    var tocItems = [];
    var pageNum = 3;

    if (includeAcronyms) {
      tocItems.push('<div style="' + ERM.ReportStyles.tocItem + '"><div><span style="' + ERM.ReportStyles.tocLabel + '">Acronyms & Abbreviations</span></div><span style="' + ERM.ReportStyles.tocPage + '">2</span></div>');
    }

    if (includeFrameworks) {
      tocItems.push('<div style="' + ERM.ReportStyles.tocItem + '"><div><span style="' + ERM.ReportStyles.tocLabel + '">Applicable Frameworks & Legislation</span></div><span style="' + ERM.ReportStyles.tocPage + '">3</span></div>');
      pageNum = 4;
    }

    for (var i = 0; i < sections.length; i++) {
      tocItems.push('<div style="' + ERM.ReportStyles.tocItem + '"><div><span style="' + ERM.ReportStyles.tocNumber + '">' + (i + 1) + '.</span><span style="' + ERM.ReportStyles.tocLabel + '">' + sections[i] + '</span></div><span style="' + ERM.ReportStyles.tocPage + '">' + (pageNum + i) + '</span></div>');
    }

    var html = '';
    html += '<div style="' + ERM.ReportStyles.tocContainer + '">';
    html += '  <h2 style="' + ERM.ReportStyles.tocTitle + '">Table of Contents</h2>';
    html += '  <div style="margin-top: 20px;">' + tocItems.join('') + '</div>';
    html += '  <div style="margin-top: 40px; padding: 16px; background: #e6f2ff; border-left: 4px solid #3b82f6; border-radius: 4px;">';
    html += '    <p style="margin: 0; font-size: 13px; color: #4a5568; line-height: 1.6;"><strong style="color: #3b82f6;">Document Classification:</strong> This report contains sensitive risk information and is intended solely for authorized recipients.</p>';
    html += '  </div>';
    html += '</div>';

    return html;
  };

  // ========================================
  // SECTION HEADERS
  // ========================================

  ERM.ReportComponents.buildSectionHeader = function (number, title) {
    return '<h2 style="' + ERM.ReportStyles.sectionHeader + '">' + number + '. ' + title + '</h2>';
  };

  ERM.ReportComponents.buildSubsectionHeader = function (title) {
    return '<h3 style="' + ERM.ReportStyles.subsectionHeader + '">' + title + '</h3>';
  };

  // ========================================
  // SECTION INTRO BOX
  // ========================================

  ERM.ReportComponents.buildSectionIntro = function (content) {
    return '<div style="' + ERM.ReportStyles.sectionIntro + '">' + content + '</div>';
  };

  // ========================================
  // STATUS BADGES
  // ========================================

  ERM.ReportComponents.buildStatusBadge = function (status, customText) {
    var statusMap = {
      'compliant': { style: ERM.ReportStyles.badgeSuccess, text: 'Compliant' },
      'within': { style: ERM.ReportStyles.badgeSuccess, text: 'Within Appetite' },
      'on-track': { style: ERM.ReportStyles.badgeSuccess, text: 'On Track' },
      'pass': { style: ERM.ReportStyles.badgeSuccess, text: 'Pass' },
      'tested': { style: ERM.ReportStyles.badgeSuccess, text: 'Tested' },
      'current': { style: ERM.ReportStyles.badgeSuccess, text: 'Current' },
      'operational': { style: ERM.ReportStyles.badgeSuccess, text: 'Operational' },
      'green': { style: ERM.ReportStyles.badgeSuccess, text: 'Green' },
      'active': { style: ERM.ReportStyles.badgeSuccess, text: 'Active' },
      'effective': { style: ERM.ReportStyles.badgeSuccess, text: 'Effective' },

      'approaching': { style: ERM.ReportStyles.badgeWarning, text: 'Approaching' },
      'at-risk': { style: ERM.ReportStyles.badgeWarning, text: 'At Risk' },
      'in-progress': { style: ERM.ReportStyles.badgeWarning, text: 'In Progress' },
      'partial': { style: ERM.ReportStyles.badgeWarning, text: 'Partial' },
      'amber': { style: ERM.ReportStyles.badgeWarning, text: 'Amber' },
      'developing': { style: ERM.ReportStyles.badgeWarning, text: 'Developing' },
      'due': { style: ERM.ReportStyles.badgeWarning, text: 'Due' },
      'late': { style: ERM.ReportStyles.badgeWarning, text: 'Late' },
      'partiallyEffective': { style: ERM.ReportStyles.badgeWarning, text: 'Partially Effective' },

      'breach': { style: ERM.ReportStyles.badgeDanger, text: 'BREACH' },
      'non-compliant': { style: ERM.ReportStyles.badgeDanger, text: 'Non-Compliant' },
      'delayed': { style: ERM.ReportStyles.badgeDanger, text: 'Delayed' },
      'fail': { style: ERM.ReportStyles.badgeDanger, text: 'Fail' },
      'red': { style: ERM.ReportStyles.badgeDanger, text: 'Red' },
      'overdue': { style: ERM.ReportStyles.badgeDanger, text: 'Overdue' },
      'not-tested': { style: ERM.ReportStyles.badgeDanger, text: 'Not Tested' },
      'ineffective': { style: ERM.ReportStyles.badgeDanger, text: 'Ineffective' },

      'planning': { style: ERM.ReportStyles.badgeInfo, text: 'Planning' },
      'info': { style: ERM.ReportStyles.badgeInfo, text: 'Info' },
      'notTested': { style: ERM.ReportStyles.badgeNeutral, text: 'Not Tested' },

      'neutral': { style: ERM.ReportStyles.badgeNeutral, text: 'N/A' },
      'stable': { style: ERM.ReportStyles.badgeNeutral, text: 'Stable' }
    };

    var config = statusMap[status.toLowerCase()] || { style: ERM.ReportStyles.badgeNeutral, text: status };
    var displayText = customText || config.text;

    return '<span style="' + config.style + '">' + displayText + '</span>';
  };

  // ========================================
  // RISK SCORE BADGE
  // ========================================

  ERM.ReportComponents.buildRiskScore = function (score) {
    // Consistent thresholds: 15-25 Critical/High styling, 5-14 Medium, 1-4 Low
    var style;
    if (score >= 15) {
      style = ERM.ReportStyles.riskScoreHigh;
    } else if (score >= 5) {
      style = ERM.ReportStyles.riskScoreMedium;
    } else {
      style = ERM.ReportStyles.riskScoreLow;
    }
    return '<span style="' + style + '">' + score + '</span>';
  };

  // ========================================
  // RISK LEVEL BADGE
  // ========================================

  ERM.ReportComponents.buildRiskLevelBadge = function (level) {
    var levelMap = {
      'critical': { bg: '#dc2626', text: 'CRITICAL' },
      'high': { bg: '#f59e0b', text: 'HIGH' },
      'medium': { bg: '#eab308', text: 'MEDIUM' },
      'low': { bg: '#22c55e', text: 'LOW' }
    };

    var config = levelMap[level.toLowerCase()] || { bg: '#94a3b8', text: level.toUpperCase() };
    return '<span style="background: ' + config.bg + '; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">' + config.text + '</span>';
  };

  // ========================================
  // TREND INDICATOR
  // ========================================

  ERM.ReportComponents.buildTrendIndicator = function (trend) {
    var trendMap = {
      'increasing': { symbol: '↑', style: ERM.ReportStyles.trendUp, text: 'Increasing' },
      'decreasing': { symbol: '↓', style: ERM.ReportStyles.trendDown, text: 'Decreasing' },
      'improving': { symbol: '↓', style: ERM.ReportStyles.trendDown, text: 'Improving' },
      'stable': { symbol: '→', style: ERM.ReportStyles.trendStable, text: 'Stable' }
    };

    var config = trendMap[trend.toLowerCase()] || trendMap.stable;
    return '<span style="' + config.style + '">' + config.symbol + ' ' + config.text + '</span>';
  };

  // ========================================
  // ALERT BOXES
  // ========================================

  ERM.ReportComponents.buildAlertBox = function (type, title, content) {
    var styleMap = {
      'critical': { style: ERM.ReportStyles.alertCritical, titleColor: '#991b1b', icon: '🔴' },
      'danger': { style: ERM.ReportStyles.alertCritical, titleColor: '#991b1b', icon: '🔴' },
      'warning': { style: ERM.ReportStyles.alertWarning, titleColor: '#92400e', icon: '🟠' },
      'success': { style: ERM.ReportStyles.alertSuccess, titleColor: '#065f46', icon: '🟢' },
      'info': { style: ERM.ReportStyles.alertInfo, titleColor: '#1e40af', icon: '🔵' }
    };

    var config = styleMap[type.toLowerCase()] || styleMap.info;

    var html = '';
    html += '<div style="' + config.style + '">';
    html += '  <div style="' + ERM.ReportStyles.alertTitle + '; color: ' + config.titleColor + ';">';
    html += '    ' + config.icon + ' ' + title;
    html += '  </div>';
    html += '  <div style="' + ERM.ReportStyles.alertContent + '">' + content + '</div>';
    html += '</div>';

    return html;
  };

  // ========================================
  // EXECUTIVE SUMMARY BOX
  // ========================================

  ERM.ReportComponents.buildExecSummaryBox = function (title, content) {
    var html = '';
    html += '<div style="' + ERM.ReportStyles.execSummaryBox + '">';
    html += '  <div style="' + ERM.ReportStyles.execSummaryTitle + '">' + title + '</div>';
    html += '  <div style="' + ERM.ReportStyles.execSummaryContent + '">' + content + '</div>';
    html += '</div>';
    return html;
  };

  // ========================================
  // TABLES
  // ========================================

  ERM.ReportComponents.buildTable = function (headers, rows, options) {
    options = options || {};
    var striped = options.striped !== false;
    var compact = options.compact || false;

    var cellPadding = compact ? '10px 12px' : '14px 16px';

    var headerCells = '';
    for (var h = 0; h < headers.length; h++) {
      var header = headers[h];
      var align = header.align || 'left';
      var width = header.width ? 'width: ' + header.width + ';' : '';
      var label = header.label || header;
      headerCells += '<th style="' + ERM.ReportStyles.tableHeaderCell + '; text-align: ' + align + '; ' + width + '">' + label + '</th>';
    }

    var bodyRows = '';
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      var rowStyle = striped && r % 2 === 1 ? ERM.ReportStyles.tableRowAlt : ERM.ReportStyles.tableRow;
      var cells = '';
      for (var c = 0; c < row.length; c++) {
        var cellAlign = headers[c] && headers[c].align ? headers[c].align : 'left';
        cells += '<td style="' + ERM.ReportStyles.tableCell + '; padding: ' + cellPadding + '; text-align: ' + cellAlign + ';">' + row[c] + '</td>';
      }
      bodyRows += '<tr style="' + rowStyle + '">' + cells + '</tr>';
    }

    var html = '';
    html += '<table style="' + ERM.ReportStyles.table + '">';
    html += '  <thead><tr style="' + ERM.ReportStyles.tableHeader + '">' + headerCells + '</tr></thead>';
    html += '  <tbody>' + bodyRows + '</tbody>';
    html += '</table>';

    return html;
  };

  // ========================================
  // PROFESSIONAL RISK REGISTER TABLE (Excel-like, Board-Ready)
  // ========================================

  /**
   * Build a professional risk register table
   * Follows strict formatting: no background colors on scores, full borders, print-safe
   * @param {Array} risks - Array of risk objects
   * @param {Object} options - Configuration options
   * @returns {string} HTML table string
   */
  ERM.ReportComponents.buildProfessionalRiskTable = function (risks, options) {
    options = options || {};
    var showAllColumns = options.showAllColumns || false;
    var maxRisks = options.maxRisks || 0; // 0 = show all

    if (!risks || risks.length === 0) {
      return '<p style="font-style: italic; color: #666;">No risks to display.</p>';
    }

    // Apply limit if specified
    var displayRisks = maxRisks > 0 ? risks.slice(0, maxRisks) : risks;

    // Define columns with explicit widths for PDF rendering
    var columns = [
      { key: 'id', label: 'ID', align: 'left', width: '8%' },
      { key: 'title', label: 'Risk Title', align: 'left', width: '30%' },
      { key: 'category', label: 'Category', align: 'left', width: '18%' },
      { key: 'inherentScore', label: 'Inherent', align: 'center', width: '10%' },
      { key: 'residualScore', label: 'Residual', align: 'center', width: '10%' },
      { key: 'owner', label: 'Owner', align: 'left', width: '14%' },
      { key: 'status', label: 'Status', align: 'left', width: '10%' }
    ];

    // Build header row
    var headerHtml = '<tr style="background: #f0f0f0;">';
    for (var h = 0; h < columns.length; h++) {
      var col = columns[h];
      headerHtml += '<th style="padding: 6px 4px; border: 1px solid #333; font-weight: bold; font-size: 10px; text-align: ' + col.align + '; width: ' + col.width + ';">' + col.label + '</th>';
    }
    headerHtml += '</tr>';

    // Build data rows
    var bodyHtml = '';
    for (var i = 0; i < displayRisks.length; i++) {
      var risk = displayRisks[i];
      var rowBg = i % 2 === 0 ? '#ffffff' : '#f9f9f9';
      bodyHtml += '<tr style="background: ' + rowBg + ';">';

      for (var c = 0; c < columns.length; c++) {
        var column = columns[c];
        var cellValue = this.getRiskCellValue(risk, column.key, i);
        var fontWeight = (column.key === 'inherentScore' || column.key === 'residualScore') ? 'font-weight: 600;' : '';
        var wordBreak = (column.key === 'title') ? 'word-wrap: break-word;' : '';

        bodyHtml += '<td style="padding: 6px 4px; border: 1px solid #333; font-size: 10px; text-align: ' + column.align + '; ' + fontWeight + wordBreak + '">' + ERM.utils.escapeHtml(cellValue) + '</td>';
      }

      bodyHtml += '</tr>';
    }

    // Build complete table with table-layout: fixed for consistent column widths
    var tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-family: Arial, sans-serif; table-layout: fixed;">';
    tableHtml += '<thead>' + headerHtml + '</thead>';
    tableHtml += '<tbody>' + bodyHtml + '</tbody>';
    tableHtml += '</table>';

    // Show note if truncated
    if (maxRisks > 0 && risks.length > maxRisks) {
      tableHtml += '<p style="font-size: 10px; color: #666; font-style: italic; margin-top: 6px;">Showing ' + maxRisks + ' of ' + risks.length + ' risks.</p>';
    }

    return tableHtml;
  };

  /**
   * Get cell value for a risk field
   */
  ERM.ReportComponents.getRiskCellValue = function (risk, key, index) {
    switch (key) {
      case 'id':
        return risk.reference || risk.id || ('R' + (index + 1));
      case 'title':
        return risk.title || 'Untitled Risk';
      case 'category':
        return this.formatCategoryName(risk.category) || 'Uncategorized';
      case 'inherentScore':
        var inhScore = parseFloat(risk.inherentScore) || (parseFloat(risk.inherentLikelihood || 3) * parseFloat(risk.inherentImpact || 3));
        return inhScore.toFixed(1);
      case 'residualScore':
        var resScore = parseFloat(risk.residualScore) || parseFloat(risk.residualRisk) || parseFloat(risk.inherentScore) || 9;
        return resScore.toFixed(1);
      case 'owner':
        return risk.owner || 'Unassigned';
      case 'status':
        return (risk.status || 'Open').charAt(0).toUpperCase() + (risk.status || 'Open').slice(1).toLowerCase();
      case 'mitigations':
        return risk.mitigations || risk.controls || '-';
      case 'dueDate':
        if (risk.dueDate) {
          var d = new Date(risk.dueDate);
          return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
        return '-';
      default:
        return risk[key] || '-';
    }
  };

  /**
   * Format category name for display
   */
  ERM.ReportComponents.formatCategoryName = function (category) {
    if (!category) return '';
    // Convert snake_case or camelCase to Title Case
    return category
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^\s+/, '')
      .split(' ')
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  /**
   * Get professional cell style based on type
   */
  ERM.ReportComponents.getProfessionalCellStyle = function (type, align) {
    var baseStyle = ERM.ReportStyles.professionalTableCell;

    switch (type) {
      case 'numeric':
        // Plain numeric - no background color, just font weight
        return ERM.ReportStyles.professionalTableCellNumeric;
      case 'wrap':
        return ERM.ReportStyles.professionalTableCellWrap;
      case 'id':
        return baseStyle + '; white-space: nowrap; font-weight: 500;';
      default:
        return baseStyle + '; text-align: ' + (align || 'left') + ';';
    }
  };

  // ========================================
  // METRIC/KRI CARDS
  // ========================================

  ERM.ReportComponents.buildMetricCard = function (options) {
    options = options || {};
    var label = options.label || 'Metric';
    var value = options.value || '0';
    var unit = options.unit || '';
    var target = options.target || null;
    var threshold = options.threshold || null;
    var status = options.status || 'neutral';
    var trend = options.trend || null;

    var statusColors = {
      'green': { border: '#10b981', text: '#065f46' },
      'amber': { border: '#f59e0b', text: '#92400e' },
      'red': { border: '#ef4444', text: '#991b1b' },
      'neutral': { border: '#e2e8f0', text: '#1a1a2e' }
    };

    var colors = statusColors[status.toLowerCase()] || statusColors.neutral;

    var html = '';
    html += '<div style="' + ERM.ReportStyles.metricCard + '; border-color: ' + colors.border + '; border-width: 2px;">';
    html += '  <div style="' + ERM.ReportStyles.metricLabel + '">' + label + '</div>';
    html += '  <div style="' + ERM.ReportStyles.metricValue + '; color: ' + colors.text + ';">';
    html += '    ' + value + '<span style="font-size: 18px; font-weight: 500;">' + unit + '</span>';
    html += '  </div>';
    if (target !== null) {
      html += '  <div style="' + ERM.ReportStyles.metricTarget + '"><strong>Target:</strong> ' + target + unit + '</div>';
    }
    if (threshold !== null) {
      html += '  <div style="' + ERM.ReportStyles.metricTarget + '"><strong>Threshold:</strong> ' + threshold + unit + '</div>';
    }
    if (trend) {
      html += '  <div style="margin-top: 8px;">' + this.buildTrendIndicator(trend) + '</div>';
    }
    html += '</div>';

    return html;
  };

  ERM.ReportComponents.buildMetricGrid = function (metrics, columns) {
    columns = columns || 2;
    var gridStyle = columns === 3 ? ERM.ReportStyles.gridThree : ERM.ReportStyles.gridTwo;
    var cards = '';
    for (var i = 0; i < metrics.length; i++) {
      cards += this.buildMetricCard(metrics[i]);
    }
    return '<div style="' + gridStyle + '">' + cards + '</div>';
  };

  // ========================================
  // PROGRESS BAR
  // ========================================

  ERM.ReportComponents.buildProgressBar = function (value, max, colorByValue) {
    max = max || 100;
    colorByValue = colorByValue !== false;
    var percentage = Math.min((value / max) * 100, 100);
    var color = '#3b82f6';

    if (colorByValue) {
      if (percentage >= 80) color = '#10b981';
      else if (percentage >= 50) color = '#f59e0b';
      else color = '#ef4444';
    }

    var html = '';
    html += '<div style="' + ERM.ReportStyles.progressContainer + '">';
    html += '  <div style="' + ERM.ReportStyles.progressBar + '; width: ' + percentage + '%; background: ' + color + ';"></div>';
    html += '</div>';

    return html;
  };

  // ========================================
  // CARDS
  // ========================================

  ERM.ReportComponents.buildCard = function (title, content, options) {
    options = options || {};
    var borderColor = options.borderColor || null;
    var icon = options.icon || null;

    var borderStyle = borderColor ? 'border-left: 5px solid ' + borderColor + ';' : '';
    var iconHtml = icon ? '<span style="margin-right: 10px;">' + icon + '</span>' : '';

    var html = '';
    html += '<div style="' + ERM.ReportStyles.card + '; ' + borderStyle + '">';
    if (title) {
      html += '  <div style="' + ERM.ReportStyles.cardHeader + '">' + iconHtml + title + '</div>';
    }
    html += '  <div style="font-size: 14px; color: #4a5568; line-height: 1.7;">' + content + '</div>';
    html += '</div>';

    return html;
  };

  // ========================================
  // RISK HEAT MAP
  // ========================================

  ERM.ReportComponents.buildHeatMap = function (risks) {
    risks = risks || [];

    var rows = [];
    for (var impactLevel = 5; impactLevel >= 1; impactLevel--) {
      var cells = [];
      for (var likelihoodLevel = 1; likelihoodLevel <= 5; likelihoodLevel++) {
        var score = impactLevel * likelihoodLevel;
        // Consistent thresholds: 15-25 Critical, 10-14 High, 5-9 Medium, 1-4 Low
        var bgColor = '#dcfce7'; // Low - light green
        if (score >= 15) bgColor = '#fecaca'; // Critical - light red
        else if (score >= 10) bgColor = '#fed7aa'; // High - light orange
        else if (score >= 5) bgColor = '#fef3c7'; // Medium - light yellow

        var risksHere = risks.filter(function (r) {
          var rImpact = r.impact || Math.ceil(r.residual / 5);
          var rLikelihood = r.likelihood || (r.residual % 5 || 5);
          return rImpact === impactLevel && rLikelihood === likelihoodLevel;
        });

        var riskLabels = risksHere.map(function (r) { return 'R' + r.id; }).join(',');
        var textColor = '#1a1a2e';

        cells.push('<td style="background: ' + bgColor + '; padding: 18px; text-align: center; border-radius: 4px; font-weight: 600; color: ' + textColor + '; font-size: 11px;">' + riskLabels + '</td>');
      }
      rows.push({ impactLabel: impactLevel, cells: cells });
    }

    var tableRows = '';
    for (var i = 0; i < rows.length; i++) {
      tableRows += '<tr><td style="padding: 6px; text-align: center; font-weight: 600; font-size: 11px; color: #718096; width: 30px;">' + rows[i].impactLabel + '</td>' + rows[i].cells.join('') + '</tr>';
    }

    var likelihoodLabels = '';
    for (var l = 1; l <= 5; l++) {
      likelihoodLabels += '<td style="padding: 6px; text-align: center; font-weight: 600; font-size: 11px; color: #718096;">' + l + '</td>';
    }

    var html = '';
    html += '<div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin: 20px 0;">';
    html += '  <h4 style="text-align: center; margin: 0 0 20px 0; color: #1a1a2e; font-size: 16px;">Residual Risk Heat Map</h4>';
    html += '  <table style="width: 100%; border-collapse: separate; border-spacing: 4px; max-width: 500px; margin: 0 auto;">';
    html += '    <tr>';
    html += '      <td style="width: 40px; text-align: center; padding-right: 10px; font-weight: 600; color: #718096; font-size: 11px; vertical-align: middle;">';
    html += '        <div style="writing-mode: vertical-lr; transform: rotate(180deg);">IMPACT</div>';
    html += '      </td>';
    html += '      <td colspan="5">';
    html += '        <table style="width: 100%; border-collapse: separate; border-spacing: 4px;">';
    html += '          ' + tableRows;
    html += '          <tr><td></td>' + likelihoodLabels + '</tr>';
    html += '        </table>';
    html += '      </td>';
    html += '    </tr>';
    html += '    <tr>';
    html += '      <td></td>';
    html += '      <td colspan="5" style="text-align: center; padding-top: 8px; font-weight: 600; color: #718096; font-size: 11px;">LIKELIHOOD</td>';
    html += '    </tr>';
    html += '  </table>';
    html += '  <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0;">';
    html += '    <div style="display: flex; align-items: center; gap: 8px;"><span style="width: 16px; height: 16px; background: #dcfce7; border-radius: 3px; display: inline-block; border: 1px solid rgba(0,0,0,0.1);"></span><span style="font-size: 11px; color: #64748b;">Low (1-4)</span></div>';
    html += '    <div style="display: flex; align-items: center; gap: 8px;"><span style="width: 16px; height: 16px; background: #fef3c7; border-radius: 3px; display: inline-block; border: 1px solid rgba(0,0,0,0.1);"></span><span style="font-size: 11px; color: #64748b;">Medium (5-9)</span></div>';
    html += '    <div style="display: flex; align-items: center; gap: 8px;"><span style="width: 16px; height: 16px; background: #fed7aa; border-radius: 3px; display: inline-block; border: 1px solid rgba(0,0,0,0.1);"></span><span style="font-size: 11px; color: #64748b;">High (10-14)</span></div>';
    html += '    <div style="display: flex; align-items: center; gap: 8px;"><span style="width: 16px; height: 16px; background: #fecaca; border-radius: 3px; display: inline-block; border: 1px solid rgba(0,0,0,0.1);"></span><span style="font-size: 11px; color: #64748b;">Critical (15-25)</span></div>';
    html += '  </div>';
    html += '</div>';

    return html;
  };

  // ========================================
  // DOCUMENT FOOTER
  // ========================================

  ERM.ReportComponents.buildDocumentFooter = function (company) {
    company = company || 'Dimeri ERM';

    var html = '';
    html += '<div style="' + ERM.ReportStyles.documentFooter + '">';
    html += '  <div style="' + ERM.ReportStyles.footerLogo + '">📊</div>';
    html += '  <div style="' + ERM.ReportStyles.footerCompany + '">' + company + '</div>';
    html += '  <div style="' + ERM.ReportStyles.footerTagline + '">Enterprise Risk Management</div>';
    html += '  <div style="' + ERM.ReportStyles.footerDisclaimer + '">';
    html += '    This report contains confidential and proprietary information.<br/>';
    html += '    © ' + new Date().getFullYear() + ' ' + company + ' | All Rights Reserved';
    html += '  </div>';
    html += '</div>';

    return html;
  };

  // ========================================
  // PAGE BREAK
  // ========================================

  ERM.ReportComponents.pageBreak = function () {
    return '<div style="page-break-before: always;"></div>';
  };

  // ========================================
  // SECTION WRAPPER
  // ========================================

  ERM.ReportComponents.wrapSection = function (content) {
    return '<div style="' + ERM.ReportStyles.sectionPage + '">' + content + '</div>';
  };

  // ========================================
  // LIST BUILDER
  // ========================================

  ERM.ReportComponents.buildList = function (items, ordered) {
    var tag = ordered ? 'ol' : 'ul';
    var listItems = '';
    for (var i = 0; i < items.length; i++) {
      listItems += '<li style="' + ERM.ReportStyles.listItem + '">' + items[i] + '</li>';
    }
    return '<' + tag + ' style="margin: 16px 0; padding-left: 24px;">' + listItems + '</' + tag + '>';
  };

  // ========================================
  // KEY-VALUE DISPLAY
  // ========================================

  ERM.ReportComponents.buildKeyValue = function (pairs) {
    var rows = '';
    for (var i = 0; i < pairs.length; i++) {
      var key = pairs[i][0];
      var value = pairs[i][1];
      rows += '<tr>';
      rows += '<td style="padding: 8px 0; font-weight: 600; color: #4a5568; width: 40%;">' + key + ':</td>';
      rows += '<td style="padding: 8px 0; color: #1a1a2e;">' + value + '</td>';
      rows += '</tr>';
    }
    return '<table style="width: 100%; margin: 16px 0;">' + rows + '</table>';
  };

  // ========================================
  // SEVERITY INDICATOR
  // ========================================

  ERM.ReportComponents.buildSeverityIndicator = function (severity) {
    var severityMap = {
      'critical': { color: '#dc2626', bg: '#fee2e2' },
      'high': { color: '#ef4444', bg: '#fee2e2' },
      'medium': { color: '#f59e0b', bg: '#fef3c7' },
      'low': { color: '#10b981', bg: '#d1fae5' },
      'very high': { color: '#dc2626', bg: '#fee2e2' },
      'very low': { color: '#10b981', bg: '#d1fae5' }
    };

    var config = severityMap[severity.toLowerCase()] || { color: '#718096', bg: '#f7fafc' };

    return '<span style="background: ' + config.bg + '; color: ' + config.color + '; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">' + severity + '</span>';
  };

  // ========================================
  // ACRONYMS & ABBREVIATIONS SECTION
  // ========================================

  ERM.ReportComponents.buildAcronymsSection = function (acronyms) {
    var rows = '';
    for (var i = 0; i < acronyms.length; i++) {
      rows += '<tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #3b82f6; width: 20%;">' + acronyms[i].acronym + '</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">' + acronyms[i].definition + '</td></tr>';
    }

    var html = '';
    html += '<div style="padding: 24px 32px; page-break-before: always;">';
    html += '  <h2 style="font-size: 22px; font-weight: 700; color: #3b82f6; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid #3b82f6;">Acronyms & Abbreviations</h2>';
    html += '  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">';
    html += '    <thead><tr><th style="background: #3b82f6; color: white; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase;">Acronym</th><th style="background: #3b82f6; color: white; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase;">Definition</th></tr></thead>';
    html += '    <tbody>' + rows + '</tbody>';
    html += '  </table>';
    html += '</div>';

    return html;
  };

  // ========================================
  // FRAMEWORKS & LEGISLATION SECTION
  // ========================================

  ERM.ReportComponents.buildFrameworksSection = function (frameworks) {
    var items = '';
    for (var i = 0; i < frameworks.length; i++) {
      var fw = frameworks[i];
      items += '<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #3b82f6; border-radius: 0 6px 6px 0; padding: 14px 16px; margin-bottom: 12px; page-break-inside: avoid;">';
      items += '  <h4 style="font-size: 14px; font-weight: 600; color: #3b82f6; margin-bottom: 6px;">' + fw.name + '</h4>';
      items += '  <p style="font-size: 12px; color: #4a5568; margin: 0; line-height: 1.5;">' + fw.description + '</p>';
      if (fw.relevance) {
        items += '  <p style="font-size: 11px; color: #718096; margin-top: 6px; margin-bottom: 0;"><strong>Relevance:</strong> ' + fw.relevance + '</p>';
      }
      items += '</div>';
    }

    var html = '';
    html += '<div style="padding: 24px 32px; page-break-before: always;">';
    html += '  <h2 style="font-size: 22px; font-weight: 700; color: #3b82f6; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid #3b82f6;">Applicable Frameworks & Legislation</h2>';
    html += '  <p style="font-size: 13px; color: #4a5568; margin-bottom: 20px; line-height: 1.6;">This report has been prepared in accordance with the following regulatory frameworks, industry standards, and legislation.</p>';
    html += '  ' + items;
    html += '</div>';

    return html;
  };

})();

/**
 * Dimeri ERM - PDF Engine
 * Handles PDF generation and export
 * ES5 Compatible
 */

(function () {
  'use strict';

  window.ERM = window.ERM || {};
  ERM.PDFEngine = ERM.PDFEngine || {};

  // ========================================
  // DEFAULT OPTIONS (A4 Print-Ready)
  // ========================================

  ERM.PDFEngine.defaultOptions = {
    margin: [15, 15, 20, 15], // [top, left, bottom, right] in mm - more space for content
    filename: 'report.pdf',
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      scrollY: 0,
      scrollX: 0,
      logging: false,
      allowTaint: true,
      removeContainer: true
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
      hotfixes: ['px_scaling']
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before, .preview-page',
      after: '.page-break-after',
      avoid: ['table', 'thead', 'tbody', 'tr', '.no-break', '.kpi-card', '.metric-card', '.recommendation-card', '.chart-container', '.risk-heatmap', 'h1', 'h2', 'h3', 'h4', 'figure', 'canvas']
    }
  };

  // ========================================
  // CHECK IF HTML2PDF IS LOADED
  // ========================================

  ERM.PDFEngine.isReady = function () {
    return typeof window.html2pdf !== 'undefined';
  };

  // ========================================
  // LOAD HTML2PDF DYNAMICALLY
  // ========================================

  ERM.PDFEngine.ensureLoaded = function (callback) {
    var self = this;

    if (this.isReady()) {
      callback();
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = function () {
      console.log('[PDFEngine] html2pdf library loaded');
      callback();
    };
    script.onerror = function () {
      console.error('[PDFEngine] Failed to load html2pdf library');
      if (ERM.toast) {
        ERM.toast.show({ type: 'error', message: 'Failed to load PDF library' });
      }
    };
    document.head.appendChild(script);
  };

  // ========================================
  // GENERATE PDF FROM HTML STRING
  // ========================================

  ERM.PDFEngine.generate = function (htmlContent, options, callback) {
    var self = this;
    options = options || {};

    this.ensureLoaded(function () {
      // Create container for PDF rendering with proper A4 sizing
      var container = document.createElement('div');
      container.style.cssText = [
        'font-family: "Segoe UI", Arial, sans-serif',
        'font-size: 12px',
        'color: #1e293b',
        'line-height: 1.6',
        'background: white',
        'width: 210mm', // A4 width
        'max-width: 210mm',
        'box-sizing: border-box',
        'position: absolute',
        'left: -9999px', // Hide off-screen during rendering
        'top: 0'
      ].join('; ');
      container.innerHTML = htmlContent;
      document.body.appendChild(container);

      // Merge options with defaults
      var pdfOptions = {};
      for (var key in self.defaultOptions) {
        pdfOptions[key] = self.defaultOptions[key];
      }
      for (var optKey in options) {
        pdfOptions[optKey] = options[optKey];
      }
      pdfOptions.filename = options.filename || self.defaultOptions.filename;

      // Generate PDF
      html2pdf()
        .set(pdfOptions)
        .from(container)
        .save()
        .then(function () {
          document.body.removeChild(container);
          if (callback) callback(null);
        })
        .catch(function (err) {
          console.error('[PDFEngine] PDF generation error:', err);
          document.body.removeChild(container);
          if (callback) callback(err);
        });
    });
  };

  // ========================================
  // GENERATE WITH TOAST NOTIFICATIONS
  // ========================================

  ERM.PDFEngine.generateWithNotifications = function (htmlContent, filename, reportName) {
    var self = this;

    if (ERM.toast) {
      ERM.toast.show({ type: 'info', message: 'Generating ' + reportName + '...' });
    }

    this.generate(htmlContent, { filename: filename }, function (err) {
      if (err) {
        console.error(err);
        if (ERM.toast) {
          ERM.toast.show({ type: 'error', message: 'Error generating PDF. Please try again.' });
        }
      } else {
        if (ERM.toast) {
          ERM.toast.show({ type: 'success', message: reportName + ' downloaded successfully!' });
        }
      }
    });
  };

  // ========================================
  // PREVIEW HTML IN NEW WINDOW
  // ========================================

  ERM.PDFEngine.preview = function (htmlContent, title) {
    title = title || 'Report Preview';

    var previewWindow = window.open('', '_blank');
    previewWindow.document.write('<!DOCTYPE html>');
    previewWindow.document.write('<html><head>');
    previewWindow.document.write('<title>' + title + '</title>');
    previewWindow.document.write('<style>');
    previewWindow.document.write('body { margin: 0; padding: 0; background: #f0f0f0; }');
    previewWindow.document.write('.preview-container { max-width: 800px; margin: 20px auto; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }');
    previewWindow.document.write('@media print { body { background: white; } .preview-container { margin: 0; box-shadow: none; max-width: 100%; } }');
    previewWindow.document.write('</style>');
    previewWindow.document.write('</head><body>');
    previewWindow.document.write('<div class="preview-container">');
    previewWindow.document.write(htmlContent);
    previewWindow.document.write('</div>');
    previewWindow.document.write('</body></html>');
    previewWindow.document.close();

    return previewWindow;
  };

  // ========================================
  // PREVIEW WITH PRINT OPTION
  // ========================================

  ERM.PDFEngine.previewAndPrint = function (htmlContent, title) {
    var previewWindow = this.preview(htmlContent, title);

    // Trigger print after content loads
    setTimeout(function () {
      previewWindow.print();
    }, 500);

    return previewWindow;
  };

  // ========================================
  // BUILD COMPLETE REPORT HTML WRAPPER
  // ========================================

  ERM.PDFEngine.wrapReport = function (content) {
    return '<div style="' + ERM.ReportStyles.pageContainer + '">' + content + '</div>';
  };

  // ========================================
  // BUILD FULL REPORT FROM SECTIONS
  // ========================================

  ERM.PDFEngine.buildReport = function (options) {
    options = options || {};

    var html = '';

    // Cover page
    if (options.cover) {
      html += ERM.ReportComponents.buildCoverPage(options.cover);
    }

    // Table of contents
    if (options.sections && options.sections.length > 0) {
      var sectionTitles = [];
      for (var i = 0; i < options.sections.length; i++) {
        sectionTitles.push(options.sections[i].title);
      }
      html += ERM.ReportComponents.buildTableOfContents(sectionTitles, {
        includeAcronyms: !!options.acronyms,
        includeFrameworks: !!options.frameworks
      });
    }

    // Acronyms section
    if (options.acronyms && options.acronyms.length > 0) {
      html += ERM.ReportComponents.buildAcronymsSection(options.acronyms);
    }

    // Frameworks section
    if (options.frameworks && options.frameworks.length > 0) {
      html += ERM.ReportComponents.buildFrameworksSection(options.frameworks);
    }

    // Content sections
    if (options.sections) {
      for (var j = 0; j < options.sections.length; j++) {
        var section = options.sections[j];
        var sectionHtml = '';

        sectionHtml += ERM.ReportComponents.buildSectionHeader(j + 1, section.title);

        if (section.intro) {
          sectionHtml += ERM.ReportComponents.buildSectionIntro(section.intro);
        }

        if (section.content) {
          sectionHtml += section.content;
        }

        html += ERM.ReportComponents.wrapSection(sectionHtml);
      }
    }

    // Footer
    if (options.footer !== false) {
      html += ERM.ReportComponents.buildDocumentFooter(options.company || 'Dimeri ERM');
    }

    return this.wrapReport(html);
  };

  // ========================================
  // QUICK RISK REPORT GENERATOR
  // ========================================

  ERM.PDFEngine.generateRiskReport = function (risks, controls, options) {
    options = options || {};

    var title = options.title || 'Risk Report';
    var period = options.period || 'Q4 2025';
    var company = options.company || 'Dimeri ERM';

    // Build executive summary content
    var criticalCount = risks.filter(function(r) { return r.inherentRisk === 'critical'; }).length;
    var highCount = risks.filter(function(r) { return r.inherentRisk === 'high'; }).length;
    var mediumCount = risks.filter(function(r) { return r.inherentRisk === 'medium'; }).length;
    var lowCount = risks.filter(function(r) { return r.inherentRisk === 'low'; }).length;

    var execSummary = 'This report provides a comprehensive overview of the organization\'s risk profile. ';
    execSummary += 'The analysis covers <strong>' + risks.length + '</strong> identified risks and <strong>' + controls.length + '</strong> controls. ';

    if (criticalCount > 0) {
      execSummary += '<span style="color: #dc2626; font-weight: 600;">' + criticalCount + ' critical risk(s)</span> require immediate attention. ';
    }

    // Build risk overview table
    var riskTableHeaders = [
      { label: 'Ref', width: '10%' },
      { label: 'Risk Title', width: '35%' },
      { label: 'Category', width: '20%' },
      { label: 'Inherent', width: '15%', align: 'center' },
      { label: 'Residual', width: '15%', align: 'center' }
    ];

    var riskTableRows = [];
    for (var i = 0; i < Math.min(risks.length, 20); i++) {
      var risk = risks[i];
      riskTableRows.push([
        risk.reference || 'R' + (i + 1),
        ERM.utils.escapeHtml(risk.title || 'Untitled'),
        risk.category || 'N/A',
        ERM.ReportComponents.buildRiskLevelBadge(risk.inherentRisk || 'medium'),
        ERM.ReportComponents.buildRiskLevelBadge(risk.residualRisk || risk.inherentRisk || 'medium')
      ]);
    }

    var riskTableContent = ERM.ReportComponents.buildTable(riskTableHeaders, riskTableRows);

    if (risks.length > 20) {
      riskTableContent += '<p style="color: #64748b; font-size: 12px; font-style: italic; margin-top: 12px;">Showing 20 of ' + risks.length + ' risks</p>';
    }

    // Build control effectiveness summary
    var effectiveCount = controls.filter(function(c) { return c.effectiveness === 'effective'; }).length;
    var partialCount = controls.filter(function(c) { return c.effectiveness === 'partiallyEffective'; }).length;
    var ineffectiveCount = controls.filter(function(c) { return c.effectiveness === 'ineffective'; }).length;

    var controlSummary = '';
    if (controls.length > 0) {
      controlSummary += '<p>Control effectiveness breakdown:</p>';
      controlSummary += '<ul>';
      controlSummary += '<li><strong>' + effectiveCount + '</strong> controls rated as Effective (' + Math.round((effectiveCount / controls.length) * 100) + '%)</li>';
      controlSummary += '<li><strong>' + partialCount + '</strong> controls rated as Partially Effective (' + Math.round((partialCount / controls.length) * 100) + '%)</li>';
      controlSummary += '<li><strong>' + ineffectiveCount + '</strong> controls rated as Ineffective (' + Math.round((ineffectiveCount / controls.length) * 100) + '%)</li>';
      controlSummary += '</ul>';
    } else {
      controlSummary = '<p>No controls have been registered yet.</p>';
    }

    // Build the full report
    var reportConfig = {
      cover: {
        icon: '📊',
        title: title,
        subtitle: 'Enterprise Risk Management Report',
        period: period,
        company: company,
        preparedBy: ERM.state && ERM.state.user ? ERM.state.user.name : 'System',
        preparedByTitle: 'Risk Manager'
      },
      sections: [
        {
          title: 'Executive Summary',
          intro: execSummary,
          content: ERM.ReportComponents.buildMetricGrid([
            { label: 'Total Risks', value: risks.length, status: 'neutral' },
            { label: 'Critical', value: criticalCount, status: criticalCount > 0 ? 'red' : 'green' },
            { label: 'High', value: highCount, status: highCount > 3 ? 'amber' : 'green' },
            { label: 'Total Controls', value: controls.length, status: 'neutral' }
          ], 4)
        },
        {
          title: 'Risk Register',
          intro: 'The following table presents all registered risks sorted by risk level.',
          content: riskTableContent
        },
        {
          title: 'Control Effectiveness',
          intro: 'This section provides an overview of control effectiveness across the organization.',
          content: controlSummary
        }
      ],
      company: company
    };

    return this.buildReport(reportConfig);
  };

})();

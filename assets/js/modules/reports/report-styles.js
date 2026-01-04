/**
 * Dimeri ERM - Report Styles
 * Inline CSS styles for PDF report generation
 * ES5 Compatible
 */

(function () {
  'use strict';

  window.ERM = window.ERM || {};

  ERM.ReportStyles = {
    // ========================================
    // PAGE CONTAINER
    // ========================================
    pageContainer: 'font-family: Arial, sans-serif; color: #1a1a2e; line-height: 1.6; background: white;',

    // ========================================
    // COVER PAGE
    // ========================================
    coverPage: 'background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%); color: white; padding: 60px 40px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; page-break-after: always;',

    coverLogo: 'font-size: 80px; margin-bottom: 30px;',

    coverTitle: 'font-size: 36px; font-weight: 700; margin: 0 0 10px 0; letter-spacing: -0.5px;',

    coverSubtitle: 'font-size: 18px; color: rgba(255,255,255,0.9); margin: 0;',

    coverMeta: 'margin-top: 50px; font-size: 13px; color: rgba(255,255,255,0.8);',

    coverClassification: 'position: absolute; bottom: 30px; left: 0; right: 0; text-align: center; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 2px;',

    // ========================================
    // TABLE OF CONTENTS
    // ========================================
    tocContainer: 'padding: 40px 50px; page-break-after: always;',

    tocTitle: 'font-size: 28px; font-weight: 700; color: #1e3a8a; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 3px solid #3b82f6;',

    tocItem: 'display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px dotted #cbd5e1;',

    tocNumber: 'font-weight: 600; color: #3b82f6; margin-right: 10px;',

    tocLabel: 'color: #334155; font-size: 14px;',

    tocPage: 'color: #64748b; font-size: 13px; font-weight: 500;',

    // ========================================
    // SECTION HEADERS
    // ========================================
    sectionHeader: 'font-size: 22px; font-weight: 700; color: #1e3a8a; margin: 40px 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #3b82f6;',

    subsectionHeader: 'font-size: 16px; font-weight: 600; color: #334155; margin: 24px 0 12px 0;',

    sectionPage: 'padding: 30px 40px;',

    // ========================================
    // SECTION INTRO
    // ========================================
    sectionIntro: 'background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; font-size: 14px; color: #334155; line-height: 1.7;',

    // ========================================
    // BADGES
    // ========================================
    badgeSuccess: 'display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;',

    badgeWarning: 'display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;',

    badgeDanger: 'display: inline-block; background: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;',

    badgeInfo: 'display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;',

    badgeNeutral: 'display: inline-block; background: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;',

    // ========================================
    // RISK SCORES
    // ========================================
    riskScoreHigh: 'display: inline-block; background: #ef4444; color: white; padding: 6px 14px; border-radius: 6px; font-size: 16px; font-weight: 700;',

    riskScoreMedium: 'display: inline-block; background: #f59e0b; color: white; padding: 6px 14px; border-radius: 6px; font-size: 16px; font-weight: 700;',

    riskScoreLow: 'display: inline-block; background: #22c55e; color: white; padding: 6px 14px; border-radius: 6px; font-size: 16px; font-weight: 700;',

    // ========================================
    // TRENDS
    // ========================================
    trendUp: 'color: #dc2626; font-weight: 600; font-size: 13px;',

    trendDown: 'color: #16a34a; font-weight: 600; font-size: 13px;',

    trendStable: 'color: #64748b; font-weight: 600; font-size: 13px;',

    // ========================================
    // ALERTS
    // ========================================
    alertCritical: 'background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px 20px; margin: 16px 0;',

    alertWarning: 'background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px 20px; margin: 16px 0;',

    alertSuccess: 'background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #22c55e; border-radius: 8px; padding: 16px 20px; margin: 16px 0;',

    alertInfo: 'background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 16px 20px; margin: 16px 0;',

    alertTitle: 'font-weight: 600; font-size: 14px; margin-bottom: 8px;',

    alertContent: 'font-size: 13px; color: #4a5568; line-height: 1.6;',

    // ========================================
    // EXECUTIVE SUMMARY BOX
    // ========================================
    execSummaryBox: 'background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 20px 0;',

    execSummaryTitle: 'font-size: 16px; font-weight: 600; color: #1e3a8a; margin-bottom: 12px;',

    execSummaryContent: 'font-size: 14px; color: #475569; line-height: 1.7;',

    // ========================================
    // TABLES
    // ========================================
    table: 'width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;',

    tableHeader: 'background: #1e3a8a;',

    tableHeaderCell: 'padding: 14px 16px; color: white; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;',

    tableRow: 'background: white;',

    tableRowAlt: 'background: #f8fafc;',

    tableCell: 'padding: 14px 16px; border-bottom: 1px solid #e2e8f0; color: #334155;',

    // ========================================
    // PROFESSIONAL RISK REGISTER TABLE (Excel-like)
    // ========================================
    // Strict professional styling - no background colors on scores
    professionalTable: 'width: 100%; max-width: 100%; border-collapse: collapse; margin: 20px 0; font-family: Arial, Calibri, "Segoe UI", sans-serif; font-size: 10pt; table-layout: auto;',

    professionalTableHeader: 'background: #f8f9fa; border: 1px solid #000000;',

    professionalTableHeaderCell: 'padding: 8px 10px; border: 1px solid #000000; font-weight: 600; font-size: 10pt; text-align: left; white-space: nowrap;',

    professionalTableRow: 'background: white;',

    professionalTableRowAlt: 'background: white;',

    professionalTableCell: 'padding: 8px 10px; border: 1px solid #000000; color: #000000; font-size: 10pt; vertical-align: top;',

    professionalTableCellNumeric: 'padding: 8px 10px; border: 1px solid #000000; color: #000000; font-size: 10pt; text-align: center; font-weight: 500;',

    professionalTableCellWrap: 'padding: 8px 10px; border: 1px solid #000000; color: #000000; font-size: 10pt; word-wrap: break-word; max-width: 200px;',

    // ========================================
    // METRIC CARDS
    // ========================================
    metricCard: 'background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center;',

    metricLabel: 'font-size: 12px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;',

    metricValue: 'font-size: 32px; font-weight: 700; color: #1a1a2e;',

    metricTarget: 'font-size: 12px; color: #64748b; margin-top: 8px;',

    // ========================================
    // GRIDS
    // ========================================
    gridTwo: 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 20px 0;',

    gridThree: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0;',

    gridFour: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0;',

    // ========================================
    // PROGRESS BAR
    // ========================================
    progressContainer: 'background: #e2e8f0; border-radius: 10px; height: 12px; overflow: hidden;',

    progressBar: 'height: 100%; border-radius: 10px; transition: width 0.3s ease;',

    // ========================================
    // CARDS
    // ========================================
    card: 'background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 16px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);',

    cardHeader: 'font-size: 16px; font-weight: 600; color: #1a1a2e; margin-bottom: 12px; display: flex; align-items: center;',

    // ========================================
    // LIST ITEMS
    // ========================================
    listItem: 'margin-bottom: 8px; color: #334155; line-height: 1.6;',

    // ========================================
    // DOCUMENT FOOTER
    // ========================================
    documentFooter: 'background: #1e3a8a; color: white; padding: 40px; text-align: center; margin-top: 40px;',

    footerLogo: 'font-size: 40px; margin-bottom: 16px;',

    footerCompany: 'font-size: 18px; font-weight: 600; margin-bottom: 4px;',

    footerTagline: 'font-size: 13px; color: rgba(255,255,255,0.8); margin-bottom: 20px;',

    footerDisclaimer: 'font-size: 11px; color: rgba(255,255,255,0.6); line-height: 1.6;',

    // ========================================
    // PRINT-READY PAGE FOOTER (Page Numbers & Watermark)
    // ========================================
    pageFooter: 'position: fixed; bottom: 0; left: 0; right: 0; height: 15mm; display: flex; justify-content: space-between; align-items: center; padding: 0 20mm; font-family: Arial, Calibri, sans-serif; font-size: 9pt; color: #666666;',

    pageNumber: 'text-align: right; font-size: 9pt; color: #666666;',

    pageWatermark: 'text-align: left; font-size: 9pt; color: #999999; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px;',

    // ========================================
    // PRINT-READY TYPOGRAPHY
    // ========================================
    // Report title: 14-16pt
    reportTitle: 'font-family: Arial, Calibri, sans-serif; font-size: 15pt; font-weight: 700; color: #000000; margin: 0 0 8px 0; line-height: 1.2;',

    // Section headings: 11-12pt bold
    sectionHeading: 'font-family: Arial, Calibri, sans-serif; font-size: 12pt; font-weight: 700; color: #000000; margin: 20px 0 10px 0; padding-bottom: 4px; border-bottom: 1px solid #000000; line-height: 1.2; page-break-after: avoid;',

    // Subsection headings
    subsectionHeading: 'font-family: Arial, Calibri, sans-serif; font-size: 11pt; font-weight: 600; color: #000000; margin: 16px 0 8px 0; line-height: 1.2; page-break-after: avoid;',

    // Body text: 10-11pt
    bodyText: 'font-family: Arial, Calibri, sans-serif; font-size: 10.5pt; color: #000000; line-height: 1.2; margin: 0 0 8px 0;',

    // Paragraph spacing
    paragraph: 'font-family: Arial, Calibri, sans-serif; font-size: 10.5pt; color: #000000; line-height: 1.2; margin: 0 0 10px 0; orphans: 3; widows: 3;',

    // ========================================
    // PAGE BREAK CONTROLS
    // ========================================
    noBreakBefore: 'page-break-before: avoid;',
    noBreakAfter: 'page-break-after: avoid;',
    noBreakInside: 'page-break-inside: avoid;',
    pageBreakBefore: 'page-break-before: always;',
    pageBreakAfter: 'page-break-after: always;',
    keepTogether: 'page-break-inside: avoid; orphans: 3; widows: 3;',

    // Heading must stay with content
    headingKeepWith: 'page-break-after: avoid; page-break-inside: avoid;',

    // ========================================
    // PRINT-READY TABLE STYLES
    // ========================================
    // Table header repeat on page break
    printTable: 'width: 100%; max-width: 100%; border-collapse: collapse; font-family: Arial, Calibri, sans-serif; font-size: 10pt; page-break-inside: auto;',

    printTableHeader: 'background: #f0f0f0; border: 1px solid #000000; display: table-header-group;',

    printTableBody: 'display: table-row-group;',

    printTableRow: 'page-break-inside: avoid; page-break-after: auto;',

    printTableCell: 'padding: 6px 8px; border: 1px solid #000000; color: #000000; font-size: 10pt; vertical-align: top;'
  };

})();

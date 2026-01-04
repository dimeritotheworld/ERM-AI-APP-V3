/**
 * Dimeri ERM - Export Enforcement
 *
 * FREE PLAN ONLY - Export limits and watermarks
 *
 * FREE PLAN:
 * - Limit: 5 unique risk registers can be exported
 * - Limit: 5 unique reports can be exported
 * - Watermark: Logo on every page of exports
 * - Re-exports: Unlimited (already exported items)
 *
 * PRO/ENTERPRISE PLANS:
 * - NO limits
 * - NO watermarks
 * - Unlimited exports
 */

(function() {
  'use strict';

  // Initialize ERM namespace
  window.ERM = window.ERM || {};

  /**
   * Export Enforcement (FREE PLAN ONLY)
   */
  ERM.exportEnforcement = {
    /**
     * Initialize export tracking
     */
    init: function() {
      console.log('Export Enforcement initialized (FREE plan restrictions only)');
    },

    /**
     * Get export history
     * @returns {array} Array of exported items
     */
    getExportHistory: function() {
      return ERM.storage.get('erm_exportHistory') || [];
    },

    /**
     * Count unique exports
     * @param {string} type - 'riskRegister' or 'report'
     * @returns {number} Number of unique items exported
     */
    countUniqueExports: function(type) {
      var history = this.getExportHistory();
      var uniqueIds = {};

      for (var i = 0; i < history.length; i++) {
        var item = history[i];
        if (item.type === type) {
          uniqueIds[item.itemId] = true;
        }
      }

      return Object.keys(uniqueIds).length;
    },

    /**
     * Check if item has been exported before
     * @param {string} type - 'riskRegister' or 'report'
     * @param {string} itemId - Item ID
     * @returns {boolean} True if already exported
     */
    hasBeenExported: function(type, itemId) {
      var history = this.getExportHistory();

      for (var i = 0; i < history.length; i++) {
        var item = history[i];
        if (item.type === type && item.itemId === itemId) {
          return true;
        }
      }

      return false;
    },

    /**
     * Record export
     * @param {string} type - 'riskRegister' or 'report'
     * @param {string} itemId - Item ID
     * @param {string} itemName - Item name
     * @param {string} format - Export format (pdf, excel, csv)
     */
    recordExport: function(type, itemId, itemName, format) {
      var history = this.getExportHistory();

      history.push({
        type: type,
        itemId: itemId,
        itemName: itemName,
        format: format,
        exportedAt: new Date().toISOString(),
        plan: ERM.usageTracker.getPlan()
      });

      ERM.storage.set('erm_exportHistory', history);
    },

    /**
     * Check if can export risk register
     * @param {string} registerId - Risk register ID
     * @param {string} registerName - Risk register name
     * @returns {object} {allowed: boolean, reason: string}
     */
    canExportRiskRegister: function(registerId, registerName) {
      var plan = ERM.usageTracker.getPlan();

      // Pro/Enterprise plans have unlimited exports
      if (plan !== 'FREE') {
        return { allowed: true };
      }

      // Check if already exported
      var alreadyExported = this.hasBeenExported('riskRegister', registerId);
      if (alreadyExported) {
        return {
          allowed: true,
          watermark: true,
          message: 'This risk register has been exported before. Watermark will be applied.'
        };
      }

      // Check export limit
      var exportCount = this.countUniqueExports('riskRegister');
      var limit = 5;

      if (exportCount >= limit) {
        return {
          allowed: false,
          reason: 'export_limit_reached',
          message: 'You\'ve exported ' + exportCount + ' of ' + limit + ' risk registers on the free plan.',
          upgradeMessage: 'Upgrade to export unlimited risk registers without watermarks.'
        };
      }

      return {
        allowed: true,
        watermark: true,
        isNewExport: true,
        remaining: limit - exportCount - 1
      };
    },

    /**
     * Check if can export report
     * @param {string} reportId - Report ID
     * @param {string} reportName - Report name
     * @returns {object} {allowed: boolean, reason: string}
     */
    canExportReport: function(reportId, reportName) {
      var plan = ERM.usageTracker.getPlan();

      // Pro/Enterprise plans have unlimited exports
      if (plan !== 'FREE') {
        return { allowed: true };
      }

      // Check if already exported
      var alreadyExported = this.hasBeenExported('report', reportId);
      if (alreadyExported) {
        return {
          allowed: true,
          watermark: true,
          message: 'This report has been exported before. Watermark will be applied.'
        };
      }

      // Check export limit
      var exportCount = this.countUniqueExports('report');
      var limit = 5;

      if (exportCount >= limit) {
        return {
          allowed: false,
          reason: 'export_limit_reached',
          message: 'You\'ve exported ' + exportCount + ' of ' + limit + ' reports on the free plan.',
          upgradeMessage: 'Upgrade to export unlimited reports without watermarks.'
        };
      }

      return {
        allowed: true,
        watermark: true,
        isNewExport: true,
        remaining: limit - exportCount - 1
      };
    },

    /**
     * Get watermark configuration
     * @param {string} type - 'riskRegister' or 'report'
     * @returns {object} Watermark config
     */
    getWatermarkConfig: function(type) {
      return {
        logoPath: 'assets/images/watermark-logo.png',
        opacity: 0.3,
        width: type === 'riskRegister' ? 40 : 35,  // Logo width in mm
        height: type === 'riskRegister' ? 15 : 13, // Logo height in mm
        position: type === 'riskRegister' ? 'top-right' : 'bottom-left'
      };
    },

    /**
     * Add watermark to PDF content
     * @param {object} pdf - jsPDF instance
     * @param {string} type - 'riskRegister' or 'report'
     * @param {function} callback - Callback when done
     */
    addWatermarkToPDF: function(pdf, type, callback) {
      var self = this;
      var config = this.getWatermarkConfig(type);
      var pageCount = pdf.internal.getNumberOfPages();

      // Load logo image
      var img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = function() {
        // Save current state
        pdf.saveGraphicsState();

        for (var i = 1; i <= pageCount; i++) {
          pdf.setPage(i);

          var pageWidth = pdf.internal.pageSize.getWidth();
          var pageHeight = pdf.internal.pageSize.getHeight();

          // Set opacity
          pdf.setGState(pdf.GState({ opacity: config.opacity }));

          var x, y;
          if (config.position === 'top-right') {
            // Top right corner for risk registers
            x = pageWidth - config.width - 15;
            y = 10;
          } else {
            // Bottom left corner for reports
            x = 15;
            y = pageHeight - config.height - 10;
          }

          // Add logo image
          pdf.addImage(img, 'PNG', x, y, config.width, config.height);
        }

        // Restore state
        pdf.restoreGraphicsState();

        if (callback) callback();
      };

      img.onerror = function() {
        console.error('Failed to load watermark logo');
        // Fallback to text watermark
        self.addTextWatermark(pdf, type);
        if (callback) callback();
      };

      img.src = config.logoPath;
    },

    /**
     * Fallback text watermark if logo fails to load
     * @param {object} pdf - jsPDF instance
     * @param {string} type - 'riskRegister' or 'report'
     */
    addTextWatermark: function(pdf, type) {
      var pageCount = pdf.internal.getNumberOfPages();
      var text = 'Dimeri.ai Free Plan';

      pdf.saveGraphicsState();

      for (var i = 1; i <= pageCount; i++) {
        pdf.setPage(i);

        var pageWidth = pdf.internal.pageSize.getWidth();
        var pageHeight = pdf.internal.pageSize.getHeight();

        pdf.setTextColor('#94a3b8');
        pdf.setFontSize(type === 'riskRegister' ? 10 : 9);
        pdf.setGState(pdf.GState({ opacity: 0.3 }));

        if (type === 'riskRegister') {
          var textWidth = pdf.getTextWidth(text);
          pdf.text(text, pageWidth - textWidth - 15, 15);
        } else {
          pdf.text(text, 15, pageHeight - 10);
        }
      }

      pdf.restoreGraphicsState();
    },

    /**
     * Show export limit reached modal
     * @param {string} type - 'riskRegister' or 'report'
     * @param {number} count - Current export count
     */
    showExportLimitModal: function(type, count) {
      var typeName = type === 'riskRegister' ? 'Risk Registers' : 'Reports';
      var typeNameSingular = type === 'riskRegister' ? 'Risk Register' : 'Report';

      var html =
        '<div class="modal-overlay" id="export-limit-modal">' +
        '<div class="modal upgrade-modal">' +
        '<div class="modal-header">' +
        '<div class="modal-icon upgrade-icon">📊</div>' +
        '<h2 class="modal-title">Export Limit Reached</h2>' +
        '<button class="modal-close" onclick="ERM.exportEnforcement.closeModal()">&times;</button>' +
        '</div>' +
        '<div class="modal-body">' +
        '<div class="upgrade-message">' +
        '<p class="upgrade-message-main">You\'ve exported 5 of 5 unique ' + typeName.toLowerCase() + ' on the free plan.</p>' +
        '<p class="upgrade-message-sub">You can re-export items you\'ve already exported, but cannot export new ones.</p>' +
        '</div>' +
        '<div class="export-limit-info">' +
        '<div class="limit-info-card">' +
        '<div class="limit-info-icon">✅</div>' +
        '<div class="limit-info-title">Already Exported</div>' +
        '<div class="limit-info-text">You can re-export any ' + typeNameSingular.toLowerCase() + ' you\'ve already exported</div>' +
        '</div>' +
        '<div class="limit-info-card blocked">' +
        '<div class="limit-info-icon">🔒</div>' +
        '<div class="limit-info-title">New Exports</div>' +
        '<div class="limit-info-text">Cannot export additional ' + typeName.toLowerCase() + ' on free plan</div>' +
        '</div>' +
        '</div>' +
        '<div class="upgrade-benefits">' +
        '<div class="benefit-title">Upgrade to Pro for:</div>' +
        '<div class="benefit-list">' +
        '<div class="benefit-item">✓ Unlimited ' + typeName + ' exports</div>' +
        '<div class="benefit-item">✓ No watermarks</div>' +
        '<div class="benefit-item">✓ Excel & CSV exports</div>' +
        '<div class="benefit-item">✓ Priority support</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button class="btn btn-secondary" onclick="ERM.exportEnforcement.closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="ERM.upgradeModal.upgrade()">Upgrade Now</button>' +
        '</div>' +
        '</div>' +
        '</div>';

      // Remove existing modal
      this.closeModal();

      // Add modal
      var modalContainer = document.createElement('div');
      modalContainer.innerHTML = html;
      document.body.appendChild(modalContainer.firstChild);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    },

    /**
     * Show export confirmation with watermark warning
     * @param {string} type - 'riskRegister' or 'report'
     * @param {string} itemName - Item name
     * @param {boolean} isNewExport - True if first time exporting this item
     * @param {number} remaining - Remaining export slots
     * @param {function} onConfirm - Callback on confirm
     */
    showExportConfirmation: function(type, itemName, isNewExport, remaining, onConfirm) {
      var typeName = type === 'riskRegister' ? 'Risk Register' : 'Report';

      var html =
        '<div class="modal-overlay" id="export-confirm-modal">' +
        '<div class="modal">' +
        '<div class="modal-header">' +
        '<h2 class="modal-title">Export ' + typeName + '</h2>' +
        '<button class="modal-close" onclick="ERM.exportEnforcement.closeModal()">&times;</button>' +
        '</div>' +
        '<div class="modal-body">' +
        '<div class="export-warning">' +
        '<div class="warning-icon">⚠️</div>' +
        '<div class="warning-content">' +
        '<div class="warning-title">Free Plan Watermark</div>' +
        '<div class="warning-text">This export will include a "Dimeri.ai Free Plan" watermark on every page.</div>' +
        '</div>' +
        '</div>';

      if (isNewExport) {
        html +=
          '<div class="export-count-info">' +
          '<strong>Export Usage:</strong> ' + (5 - remaining - 1) + ' of 5 unique ' + typeName.toLowerCase() + 's exported' +
          (remaining > 0
            ? '<br><span style="color: var(--text-secondary); font-size: 14px;">' + remaining + ' export' + (remaining !== 1 ? 's' : '') + ' remaining after this one</span>'
            : '<br><span style="color: #dc2626; font-size: 14px;">This is your last free export</span>'
          ) +
          '</div>';
      }

      html +=
        '<div class="export-item-name">' +
        '<strong>Exporting:</strong> ' + ERM.utils.escapeHtml(itemName) +
        '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button class="btn btn-secondary" onclick="ERM.exportEnforcement.closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" id="confirm-export-btn">Export with Watermark</button>' +
        '</div>' +
        '</div>' +
        '</div>';

      // Remove existing modal
      this.closeModal();

      // Add modal
      var modalContainer = document.createElement('div');
      modalContainer.innerHTML = html;
      document.body.appendChild(modalContainer.firstChild);

      // Bind confirm button
      var confirmBtn = document.getElementById('confirm-export-btn');
      if (confirmBtn && onConfirm) {
        confirmBtn.addEventListener('click', function() {
          ERM.exportEnforcement.closeModal();
          onConfirm();
        });
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    },

    /**
     * Close modal
     */
    closeModal: function() {
      var modals = document.querySelectorAll('#export-limit-modal, #export-confirm-modal');
      for (var i = 0; i < modals.length; i++) {
        modals[i].remove();
      }
      document.body.style.overflow = '';
    },

    /**
     * Get export statistics
     * @returns {object} Export stats
     */
    getExportStats: function() {
      var history = this.getExportHistory();

      var stats = {
        riskRegisters: {
          total: 0,
          unique: this.countUniqueExports('riskRegister'),
          limit: 5,
          remaining: Math.max(0, 5 - this.countUniqueExports('riskRegister'))
        },
        reports: {
          total: 0,
          unique: this.countUniqueExports('report'),
          limit: 5,
          remaining: Math.max(0, 5 - this.countUniqueExports('report'))
        }
      };

      // Count total exports
      for (var i = 0; i < history.length; i++) {
        var item = history[i];
        if (item.type === 'riskRegister') {
          stats.riskRegisters.total++;
        } else if (item.type === 'report') {
          stats.reports.total++;
        }
      }

      return stats;
    }
  };

  // Initialize
  ERM.exportEnforcement.init();

  console.log('Export Enforcement loaded');
})();

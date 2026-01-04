/**
 * Dimeri ERM - Export Wrapper
 * Simplified wrapper for integrating export limits and watermarks
 */

(function() {
  'use strict';

  // Initialize ERM namespace
  window.ERM = window.ERM || {};

  /**
   * Export Wrapper
   * Easy-to-use wrapper for existing export functions
   */
  ERM.exportWrapper = {
    /**
     * Wrap risk register export
     * @param {string} registerId - Risk register ID
     * @param {string} registerName - Risk register name
     * @param {function} exportFunction - Original export function (receives pdf, callback)
     */
    exportRiskRegister: function(registerId, registerName, exportFunction) {
      var self = this;

      // Check if can export
      var check = ERM.exportEnforcement.canExportRiskRegister(registerId, registerName);

      if (!check.allowed) {
        // Show export limit modal
        ERM.exportEnforcement.showExportLimitModal('riskRegister', 5);
        return;
      }

      // Show confirmation with watermark warning
      if (check.watermark) {
        ERM.exportEnforcement.showExportConfirmation(
          'riskRegister',
          registerName,
          check.isNewExport,
          check.remaining || 0,
          function() {
            self._performExport(registerId, registerName, 'riskRegister', exportFunction);
          }
        );
      } else {
        // Pro/Enterprise - export directly without watermark
        self._performExport(registerId, registerName, 'riskRegister', exportFunction);
      }
    },

    /**
     * Wrap report export
     * @param {string} reportId - Report ID
     * @param {string} reportName - Report name
     * @param {function} exportFunction - Original export function (receives pdf, callback)
     */
    exportReport: function(reportId, reportName, exportFunction) {
      var self = this;

      // Check if can export
      var check = ERM.exportEnforcement.canExportReport(reportId, reportName);

      if (!check.allowed) {
        // Show export limit modal
        ERM.exportEnforcement.showExportLimitModal('report', 5);
        return;
      }

      // Show confirmation with watermark warning
      if (check.watermark) {
        ERM.exportEnforcement.showExportConfirmation(
          'report',
          reportName,
          check.isNewExport,
          check.remaining || 0,
          function() {
            self._performExport(reportId, reportName, 'report', exportFunction);
          }
        );
      } else {
        // Pro/Enterprise - export directly without watermark
        self._performExport(reportId, reportName, 'report', exportFunction);
      }
    },

    /**
     * Perform the actual export
     * @private
     */
    _performExport: function(itemId, itemName, type, exportFunction) {
      var plan = ERM.usageTracker.getPlan();

      // Call the original export function
      // Pass a callback for when PDF is ready
      exportFunction(function(pdf) {
        // Add watermark for free plan
        if (plan === 'FREE') {
          ERM.exportEnforcement.addWatermarkToPDF(pdf, type, function() {
            // Record export
            ERM.exportEnforcement.recordExport(type, itemId, itemName, 'pdf');

            // Save the PDF
            pdf.save(itemName + '.pdf');

            // Show success message
            ERM.toast.success('Export complete with watermark');
          });
        } else {
          // No watermark for Pro/Enterprise
          ERM.exportEnforcement.recordExport(type, itemId, itemName, 'pdf');
          pdf.save(itemName + '.pdf');
          ERM.toast.success('Export complete');
        }
      });
    }
  };

  console.log('Export Wrapper loaded');
})();

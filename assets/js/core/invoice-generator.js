/**
 * Professional Invoice Generator for Dimeri ERM
 * Generates PDF invoices with company branding
 * ES5 Compatible
 */

(function() {
  'use strict';

  window.ERM = window.ERM || {};

  /**
   * Invoice Generator
   */
  ERM.invoiceGenerator = {
    /**
     * Generate and download invoice PDF
     * @param {string} invoiceId - Invoice ID
     * @param {object} invoiceData - Invoice data (optional, fetched from API if not provided)
     */
    generate: function(invoiceId, invoiceData) {
      var self = this;

      // If invoice data not provided, fetch it
      if (!invoiceData) {
        return ERM.billingAPI.getInvoices()
          .then(function(invoices) {
            var invoice = invoices.find(function(inv) {
              return inv.id === invoiceId;
            });

            if (!invoice) {
              throw new Error('Invoice not found');
            }

            return self._generatePDF(invoice);
          })
          .catch(function(error) {
            console.error('Error generating invoice:', error);
            if (typeof ERM.toast !== 'undefined') {
              ERM.toast.error('Failed to generate invoice');
            }
          });
      }

      return this._generatePDF(invoiceData);
    },

    /**
     * Generate PDF from invoice data
     * @private
     */
    _generatePDF: function(invoice) {
      // Create a new window for printing
      var printWindow = window.open('', '_blank');

      if (!printWindow) {
        if (typeof ERM.toast !== 'undefined') {
          ERM.toast.error('Please allow popups to download invoice');
        }
        return;
      }

      var html = this._generateHTML(invoice);

      printWindow.document.write(html);
      printWindow.document.close();

      // Wait for content to load, then print
      setTimeout(function() {
        printWindow.print();
      }, 500);
    },

    /**
     * Generate HTML for invoice
     * @private
     */
    _generateHTML: function(invoice) {
      var companyInfo = this._getCompanyInfo();
      var customerInfo = this._getCustomerInfo();

      var html = '<!DOCTYPE html><html><head>';
      html += '<meta charset="UTF-8">';
      html += '<title>Invoice ' + invoice.number + ' - Dimeri</title>';
      html += '<style>' + this._getInvoiceCSS() + '</style>';
      html += '</head><body>';

      // Invoice Container
      html += '<div class="invoice-container">';

      // Header
      html += '<div class="invoice-header">';
      html += '<div class="company-info">';
      html += '<h1>INVOICE</h1>';
      html += '<div class="invoice-number">#' + invoice.number + '</div>';
      html += '<div class="invoice-date">Date: ' + this._formatDate(invoice.date) + '</div>';
      html += '<div class="invoice-due">Due: ' + this._formatDate(invoice.dueDate) + '</div>';
      html += '</div>';
      html += '<div class="invoice-status ' + invoice.status + '">' + invoice.status.toUpperCase() + '</div>';
      html += '</div>';

      // Bill From/To
      html += '<div class="invoice-parties">';
      html += '<div class="party">';
      html += '<h3>From</h3>';
      html += '<div class="party-name">' + companyInfo.name + '</div>';
      html += '<div class="party-address">';
      html += companyInfo.address + '<br>';
      html += companyInfo.city + ', ' + companyInfo.state + ' ' + companyInfo.zip + '<br>';
      html += companyInfo.country;
      html += '</div>';
      if (companyInfo.vat) {
        html += '<div class="party-vat">VAT: ' + companyInfo.vat + '</div>';
      }
      html += '</div>';
      html += '<div class="party">';
      html += '<h3>Bill To</h3>';
      html += '<div class="party-name">' + customerInfo.name + '</div>';
      html += '<div class="party-address">';
      html += customerInfo.address + '<br>';
      html += customerInfo.city + ', ' + customerInfo.state + ' ' + customerInfo.zip + '<br>';
      html += customerInfo.country;
      html += '</div>';
      if (customerInfo.vat) {
        html += '<div class="party-vat">VAT: ' + customerInfo.vat + '</div>';
      }
      html += '</div>';
      html += '</div>';

      // Line Items
      html += '<table class="invoice-table">';
      html += '<thead>';
      html += '<tr>';
      html += '<th>Description</th>';
      html += '<th class="text-center">Quantity</th>';
      html += '<th class="text-right">Unit Price</th>';
      html += '<th class="text-right">Amount</th>';
      html += '</tr>';
      html += '</thead>';
      html += '<tbody>';

      var subtotal = 0;
      invoice.lineItems.forEach(function(item) {
        var amount = item.quantity * item.unitPrice;
        subtotal += amount;

        html += '<tr>';
        html += '<td>' + item.description + '</td>';
        html += '<td class="text-center">' + item.quantity + '</td>';
        html += '<td class="text-right">$' + item.unitPrice.toFixed(2) + '</td>';
        html += '<td class="text-right">$' + amount.toFixed(2) + '</td>';
        html += '</tr>';
      });

      html += '</tbody>';
      html += '</table>';

      // Totals
      var tax = subtotal * (invoice.taxRate || 0);
      var total = subtotal + tax;

      html += '<div class="invoice-totals">';
      html += '<div class="total-row">';
      html += '<span>Subtotal:</span>';
      html += '<span>$' + subtotal.toFixed(2) + '</span>';
      html += '</div>';

      if (tax > 0) {
        html += '<div class="total-row">';
        html += '<span>Tax (' + ((invoice.taxRate || 0) * 100) + '%):</span>';
        html += '<span>$' + tax.toFixed(2) + '</span>';
        html += '</div>';
      }

      html += '<div class="total-row grand-total">';
      html += '<span>Total:</span>';
      html += '<span>$' + total.toFixed(2) + '</span>';
      html += '</div>';
      html += '</div>';

      // Payment Info
      if (invoice.paymentMethod) {
        html += '<div class="payment-info">';
        html += '<h3>Payment Method</h3>';
        html += '<p>' + invoice.paymentMethod.brand.toUpperCase() + ' ending in ' + invoice.paymentMethod.last4 + '</p>';
        html += '</div>';
      }

      // Footer with Logo
      html += '<div class="invoice-footer">';
      html += '<div class="dimeri-logo">';
      html += '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c41e3a" stroke-width="2">';
      html += '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>';
      html += '</svg>';
      html += '<span>Dimeri<span class="accent">.ai</span></span>';
      html += '</div>';
      html += '<div class="footer-text">';
      html += '<p>Thank you for your business!</p>';
      html += '<p class="footer-contact">For questions, contact <a href="mailto:billing@dimeri.ai">billing@dimeri.ai</a></p>';
      html += '</div>';
      html += '</div>';

      html += '</div>'; // Close invoice-container
      html += '</body></html>';

      return html;
    },

    /**
     * Get invoice CSS
     * @private
     */
    _getInvoiceCSS: function() {
      return `
        @page {
          size: A4;
          margin: 0;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #1e293b;
          background: white;
          line-height: 1.6;
        }

        .invoice-container {
          max-width: 800px;
          margin: 40px auto;
          padding: 60px;
          background: white;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 48px;
          padding-bottom: 24px;
          border-bottom: 3px solid #c41e3a;
        }

        .company-info h1 {
          font-size: 32px;
          font-weight: 700;
          color: #c41e3a;
          margin-bottom: 12px;
        }

        .invoice-number {
          font-size: 18px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 4px;
        }

        .invoice-date,
        .invoice-due {
          font-size: 14px;
          color: #64748b;
        }

        .invoice-status {
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .invoice-status.paid {
          background: #d1fae5;
          color: #065f46;
        }

        .invoice-status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .invoice-status.overdue {
          background: #fee2e2;
          color: #991b1b;
        }

        .invoice-parties {
          display: flex;
          justify-content: space-between;
          margin-bottom: 48px;
        }

        .party {
          flex: 1;
        }

        .party h3 {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }

        .party-name {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .party-address {
          font-size: 14px;
          color: #64748b;
          line-height: 1.8;
        }

        .party-vat {
          font-size: 14px;
          color: #64748b;
          margin-top: 8px;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 32px;
        }

        .invoice-table thead {
          background: #f8fafc;
        }

        .invoice-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }

        .invoice-table td {
          padding: 16px;
          font-size: 14px;
          color: #1e293b;
          border-bottom: 1px solid #f1f5f9;
        }

        .invoice-table .text-center {
          text-align: center;
        }

        .invoice-table .text-right {
          text-align: right;
        }

        .invoice-totals {
          margin-left: auto;
          width: 300px;
          margin-bottom: 32px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          font-size: 14px;
          color: #64748b;
        }

        .total-row.grand-total {
          border-top: 2px solid #e2e8f0;
          padding-top: 16px;
          margin-top: 8px;
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        .payment-info {
          margin-bottom: 48px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .payment-info h3 {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .payment-info p {
          font-size: 14px;
          color: #64748b;
        }

        .invoice-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 32px;
          border-top: 1px solid #e2e8f0;
        }

        .dimeri-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }

        .dimeri-logo .accent {
          color: #c41e3a;
        }

        .footer-text {
          text-align: right;
        }

        .footer-text p {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .footer-contact {
          font-size: 12px !important;
        }

        .footer-contact a {
          color: #c41e3a;
          text-decoration: none;
        }

        @media print {
          .invoice-container {
            margin: 0;
            padding: 40px;
          }
        }
      `;
    },

    /**
     * Get company info
     * @private
     */
    _getCompanyInfo: function() {
      // This should come from backend/config
      return {
        name: 'Dimeri Technologies',
        address: '123 Business Street',
        city: 'Johannesburg',
        state: 'Gauteng',
        zip: '2000',
        country: 'South Africa',
        vat: 'ZA1234567890' // Optional
      };
    },

    /**
     * Get customer info
     * @private
     */
    _getCustomerInfo: function() {
      // This should come from backend
      var user = ERM.state.user || {};
      var billingAddress = JSON.parse(localStorage.getItem('ERM_billingAddress') || '{}');

      return {
        name: user.company || user.name || 'Customer',
        address: billingAddress.street || '456 Customer Street',
        city: billingAddress.city || 'Cape Town',
        state: billingAddress.state || 'Western Cape',
        zip: billingAddress.zip || '8001',
        country: billingAddress.country || 'South Africa',
        vat: billingAddress.vat || null
      };
    },

    /**
     * Format date
     * @private
     */
    _formatDate: function(dateString) {
      var date = new Date(dateString);
      var options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }
  };

  console.log('Invoice Generator loaded');
})();

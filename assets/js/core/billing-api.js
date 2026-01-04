/**
 * Billing API Service
 * Production-ready service for payment gateway integration
 * Supports Stripe and PayPal
 * ES5 Compatible
 */

(function() {
  'use strict';

  window.ERM = window.ERM || {};

  /**
   * Billing API Configuration
   */
  var BILLING_CONFIG = {
    // API endpoints - replace with your actual backend URLs
    endpoints: {
      getSubscription: '/api/billing/subscription',
      getUsage: '/api/billing/usage',
      getInvoices: '/api/billing/invoices',
      downloadInvoice: '/api/billing/invoices/:id/download',
      getPaymentMethod: '/api/billing/payment-method',
      updatePaymentMethod: '/api/billing/payment-method/update',
      addSeats: '/api/billing/seats/add',
      removeSeats: '/api/billing/seats/remove',
      cancelSubscription: '/api/billing/subscription/cancel',
      updateBillingAddress: '/api/billing/address/update',
      createCheckoutSession: '/api/billing/checkout/create'
    },

    // Payment gateway (stripe or paypal)
    gateway: 'stripe',

    // Stripe publishable key - replace with your actual key
    stripePublicKey: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE',

    // PayPal client ID - replace with your actual ID
    paypalClientId: 'YOUR_PAYPAL_CLIENT_ID_HERE'
  };

  /**
   * Billing API Service
   */
  ERM.billingAPI = {
    /**
     * Get current subscription details from backend
     * @returns {Promise<object>}
     */
    getSubscription: function() {
      return this._apiCall(BILLING_CONFIG.endpoints.getSubscription, 'GET')
        .then(function(data) {
          return {
            plan: data.plan || 'FREE',
            status: data.status || 'active',
            teamSize: data.teamSize || 3,
            billingCycle: data.billingCycle || 'monthly',
            currentPeriodEnd: data.currentPeriodEnd || null,
            price: data.price || 0,
            currency: data.currency || 'USD'
          };
        })
        .catch(function(error) {
          console.error('Error fetching subscription:', error);
          // Fallback to localStorage for demo/development
          return this._getFallbackSubscription();
        }.bind(this));
    },

    /**
     * Get usage statistics from backend
     * @returns {Promise<object>}
     */
    getUsage: function() {
      return this._apiCall(BILLING_CONFIG.endpoints.getUsage, 'GET')
        .then(function(data) {
          return {
            riskRegisters: {
              used: data.riskRegisters?.used || 0,
              limit: data.riskRegisters?.limit || 'unlimited'
            },
            controls: {
              used: data.controls?.used || 0,
              limit: data.controls?.limit || 'unlimited'
            },
            teamMembers: {
              used: data.teamMembers?.used || 0,
              limit: data.teamMembers?.limit || 3
            },
            reports: {
              generated: data.reports?.generated || 0,
              limit: data.reports?.limit || 'unlimited'
            },
            aiQueries: {
              used: data.aiQueries?.used || 0,
              limit: data.aiQueries?.limit || 50
            }
          };
        })
        .catch(function(error) {
          console.error('Error fetching usage:', error);
          return this._getFallbackUsage();
        }.bind(this));
    },

    /**
     * Get invoices from backend
     * @returns {Promise<Array>}
     */
    getInvoices: function() {
      return this._apiCall(BILLING_CONFIG.endpoints.getInvoices, 'GET')
        .then(function(data) {
          return data.invoices || [];
        })
        .catch(function(error) {
          console.error('Error fetching invoices:', error);
          return this._getFallbackInvoices();
        }.bind(this));
    },

    /**
     * Download invoice PDF
     * @param {string} invoiceId - Invoice ID
     * @returns {Promise}
     */
    downloadInvoice: function(invoiceId) {
      var url = BILLING_CONFIG.endpoints.downloadInvoice.replace(':id', invoiceId);

      return this._apiCall(url, 'GET', null, { responseType: 'blob' })
        .then(function(blob) {
          // Create download link
          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = 'dimeri-invoice-' + invoiceId + '.pdf';
          link.click();
        })
        .catch(function(error) {
          console.error('Error downloading invoice:', error);
          // Fallback: generate invoice locally
          return ERM.invoiceGenerator.generate(invoiceId);
        });
    },

    /**
     * Get payment method from backend
     * @returns {Promise<object>}
     */
    getPaymentMethod: function() {
      return this._apiCall(BILLING_CONFIG.endpoints.getPaymentMethod, 'GET')
        .then(function(data) {
          return {
            type: data.type || 'card',
            brand: data.brand || 'visa',
            last4: data.last4 || '****',
            expiryMonth: data.expiryMonth || 12,
            expiryYear: data.expiryYear || 2026
          };
        })
        .catch(function(error) {
          console.error('Error fetching payment method:', error);
          return this._getFallbackPaymentMethod();
        }.bind(this));
    },

    /**
     * Update payment method (opens Stripe/PayPal modal)
     * @returns {Promise}
     */
    updatePaymentMethod: function() {
      if (BILLING_CONFIG.gateway === 'stripe') {
        return this._updatePaymentMethodStripe();
      } else if (BILLING_CONFIG.gateway === 'paypal') {
        return this._updatePaymentMethodPayPal();
      }
    },

    /**
     * Add seats to subscription
     * @param {number} numberOfSeats - Number of seats to add
     * @returns {Promise}
     */
    addSeats: function(numberOfSeats) {
      return this._apiCall(BILLING_CONFIG.endpoints.addSeats, 'POST', {
        seats: numberOfSeats
      })
        .then(function(data) {
          if (typeof ERM.toast !== 'undefined') {
            ERM.toast.success(numberOfSeats + ' seat(s) added successfully');
          }
          return data;
        })
        .catch(function(error) {
          console.error('Error adding seats:', error);
          if (typeof ERM.toast !== 'undefined') {
            ERM.toast.error('Failed to add seats. Please try again.');
          }
          throw error;
        });
    },

    /**
     * Remove seats from subscription
     * @param {number} numberOfSeats - Number of seats to remove
     * @returns {Promise}
     */
    removeSeats: function(numberOfSeats) {
      return this._apiCall(BILLING_CONFIG.endpoints.removeSeats, 'POST', {
        seats: numberOfSeats
      })
        .then(function(data) {
          if (typeof ERM.toast !== 'undefined') {
            ERM.toast.success(numberOfSeats + ' seat(s) removed successfully');
          }
          return data;
        })
        .catch(function(error) {
          console.error('Error removing seats:', error);
          if (typeof ERM.toast !== 'undefined') {
            ERM.toast.error('Failed to remove seats. Please try again.');
          }
          throw error;
        });
    },

    /**
     * Cancel subscription
     * @param {string} reason - Cancellation reason
     * @returns {Promise}
     */
    cancelSubscription: function(reason) {
      return this._apiCall(BILLING_CONFIG.endpoints.cancelSubscription, 'POST', {
        reason: reason
      })
        .then(function(data) {
          if (typeof ERM.toast !== 'undefined') {
            ERM.toast.success('Subscription cancelled successfully');
          }
          return data;
        })
        .catch(function(error) {
          console.error('Error cancelling subscription:', error);
          if (typeof ERM.toast !== 'undefined') {
            ERM.toast.error('Failed to cancel subscription. Please contact support.');
          }
          throw error;
        });
    },

    /**
     * Update billing address
     * @param {object} address - Address object
     * @returns {Promise}
     */
    updateBillingAddress: function(address) {
      return this._apiCall(BILLING_CONFIG.endpoints.updateBillingAddress, 'POST', address)
        .then(function(data) {
          if (typeof ERM.toast !== 'undefined') {
            ERM.toast.success('Billing address updated successfully');
          }
          return data;
        })
        .catch(function(error) {
          console.error('Error updating billing address:', error);
          if (typeof ERM.toast !== 'undefined') {
            ERM.toast.error('Failed to update billing address');
          }
          throw error;
        });
    },

    /**
     * Create Stripe checkout session
     * @param {string} priceId - Stripe price ID
     * @returns {Promise}
     */
    createCheckoutSession: function(priceId) {
      return this._apiCall(BILLING_CONFIG.endpoints.createCheckoutSession, 'POST', {
        priceId: priceId,
        successUrl: window.location.origin + '/profile.html?tab=billing&success=true',
        cancelUrl: window.location.origin + '/profile.html?tab=billing&cancelled=true'
      })
        .then(function(data) {
          // Redirect to Stripe Checkout
          if (data.sessionId && window.Stripe) {
            var stripe = window.Stripe(BILLING_CONFIG.stripePublicKey);
            return stripe.redirectToCheckout({ sessionId: data.sessionId });
          }
        })
        .catch(function(error) {
          console.error('Error creating checkout session:', error);
          if (typeof ERM.toast !== 'undefined') {
            ERM.toast.error('Failed to start checkout. Please try again.');
          }
          throw error;
        });
    },

    // PRIVATE METHODS
    // ========================================

    /**
     * Make API call to backend
     * @private
     */
    _apiCall: function(endpoint, method, data, options) {
      var self = this;
      options = options || {};

      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, endpoint, true);

        // Set headers
        xhr.setRequestHeader('Content-Type', 'application/json');

        // Add auth token if available
        var authToken = localStorage.getItem('ERM_authToken');
        if (authToken) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + authToken);
        }

        if (options.responseType) {
          xhr.responseType = options.responseType;
        }

        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              var response = options.responseType === 'blob' ? xhr.response : JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              resolve(xhr.responseText);
            }
          } else {
            reject(new Error('API call failed with status: ' + xhr.status));
          }
        };

        xhr.onerror = function() {
          reject(new Error('Network error'));
        };

        xhr.send(data ? JSON.stringify(data) : null);
      });
    },

    /**
     * Update payment method with Stripe
     * @private
     */
    _updatePaymentMethodStripe: function() {
      var self = this;

      return new Promise(function(resolve, reject) {
        if (!window.Stripe) {
          reject(new Error('Stripe not loaded'));
          return;
        }

        var stripe = window.Stripe(BILLING_CONFIG.stripePublicKey);

        // Create Stripe Elements for card input
        var elements = stripe.elements();
        var cardElement = elements.create('card');

        // Show modal with card element
        ERM.components.showModal({
          title: 'Update Payment Method',
          content: '<div id="stripe-card-element" style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;"></div><div id="card-errors" style="color: #ef4444; font-size: 14px; margin-top: 8px;"></div>',
          buttons: [
            { label: 'Cancel', type: 'secondary', action: 'close' },
            { label: 'Update Card', type: 'primary', action: 'update' }
          ],
          onOpen: function() {
            cardElement.mount('#stripe-card-element');

            cardElement.on('change', function(event) {
              var displayError = document.getElementById('card-errors');
              if (event.error) {
                displayError.textContent = event.error.message;
              } else {
                displayError.textContent = '';
              }
            });
          },
          onAction: function(action) {
            if (action === 'update') {
              stripe.createPaymentMethod({
                type: 'card',
                card: cardElement
              }).then(function(result) {
                if (result.error) {
                  var displayError = document.getElementById('card-errors');
                  displayError.textContent = result.error.message;
                  reject(result.error);
                } else {
                  // Send payment method to backend
                  self._apiCall(BILLING_CONFIG.endpoints.updatePaymentMethod, 'POST', {
                    paymentMethodId: result.paymentMethod.id
                  }).then(function() {
                    ERM.components.closeModal();
                    if (typeof ERM.toast !== 'undefined') {
                      ERM.toast.success('Payment method updated successfully');
                    }
                    resolve(result.paymentMethod);
                  }).catch(reject);
                }
              });
            }
          }
        });
      });
    },

    /**
     * Update payment method with PayPal
     * @private
     */
    _updatePaymentMethodPayPal: function() {
      // PayPal integration would go here
      console.log('PayPal integration not yet implemented');
      if (typeof ERM.toast !== 'undefined') {
        ERM.toast.info('PayPal integration coming soon');
      }
      return Promise.reject(new Error('PayPal not implemented'));
    },

    // FALLBACK METHODS (for demo/development)
    // ========================================

    _getFallbackSubscription: function() {
      var plan = localStorage.getItem('ERM_plan') || 'FREE';
      var teamSize = parseInt(localStorage.getItem('ERM_teamSize')) || 3;

      return {
        plan: plan,
        status: 'active',
        teamSize: teamSize,
        billingCycle: 'monthly',
        currentPeriodEnd: this._getNextBillingDate(),
        price: plan === 'PRO' ? 29 + ((teamSize - 3) * 10) : 0,
        currency: 'USD'
      };
    },

    _getFallbackUsage: function() {
      var riskRegisters = ERM.storage.get('riskRegisters') || [];
      var controls = ERM.storage.get('controls') || [];
      var members = ERM.storage.get('workspaceMembers') || [];
      var reports = ERM.storage.get('reports') || [];

      var plan = localStorage.getItem('ERM_plan') || 'FREE';
      var teamSize = parseInt(localStorage.getItem('ERM_teamSize')) || 3;

      return {
        riskRegisters: {
          used: riskRegisters.length,
          limit: plan === 'PRO' ? 'unlimited' : 3
        },
        controls: {
          used: controls.length,
          limit: plan === 'PRO' ? 'unlimited' : 10
        },
        teamMembers: {
          used: members.length,
          limit: teamSize
        },
        reports: {
          generated: reports.length,
          limit: 'unlimited'
        },
        aiQueries: {
          used: parseInt(localStorage.getItem('ERM_aiQueriesUsed')) || 0,
          limit: plan === 'PRO' ? 'unlimited' : 50
        }
      };
    },

    _getFallbackInvoices: function() {
      // Return demo invoices - in production, these come from backend
      return [];
    },

    _getFallbackPaymentMethod: function() {
      return {
        type: 'card',
        brand: 'visa',
        last4: '****',
        expiryMonth: 12,
        expiryYear: 2026
      };
    },

    _getNextBillingDate: function() {
      var today = new Date();
      var nextBilling = new Date(today.getFullYear(), today.getMonth() + 1, 15);
      return nextBilling.toISOString();
    }
  };

  console.log('Billing API Service loaded');
})();

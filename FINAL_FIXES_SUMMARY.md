# Final Fixes Summary

## Completed ✅

### 1. Support Tab Updated
**File:** `profile.html`
- ✅ Removed "Documentation" section
- ✅ Removed "What's New" section
- ✅ Updated Help Center link to `help/index.html`
- ✅ Only shows Help Center and Contact Support

### 2. Video Tutorial Added
**File:** `assets/js/modules/help.js`
- ✅ Added Video Tutorials link next to Reports & Analytics
- ✅ Points to `https://www.youtube.com/@dimeri-placeholder`
- ✅ Icon: 🎥
- ✅ Searchable with keywords: video, tutorials, youtube, training, etc.

### 3. Non-Admin Invite Restriction
**File:** `assets/js/core/components.js`
- ✅ Added admin check before showing invite modal
- ✅ Shows popup for non-admin users: "Contact Admin to Invite Users"
- ✅ Only workspace owner can invite members
- ✅ Professional modal with warning icon and clear message

---

## In Progress / Needs Completion ⚠️

### 4. Remove Hardcoded Billing Data

**Current Issue:**
The `profile.html` file has hardcoded billing data:
- Line 632: `<span class="plan-name" id="billing-plan-name">Pro Plan</span>`
- Line 633: `<span class="plan-price">$29/month</span>`
- Line 636-637: Hardcoded billing dates
- Line 652-679: Hardcoded usage numbers (3 registers, 18 controls, etc.)
- Line 699-702: Hardcoded payment method (VISA ••• 4242)
- Line 710-714: Hardcoded billing address
- Line 730-770: Hardcoded invoice list

**Solution:**
The `assets/js/pages/profile.js` already has `loadBillingInfo()` function that loads SOME dynamic data, but it needs to be enhanced to:

1. **Use Billing API for Subscription Data:**
```javascript
// In loadBillingInfo() function
if (typeof ERM.billingAPI !== 'undefined') {
  ERM.billingAPI.getSubscription().then(function(subscription) {
    // Update plan name
    var planNameEl = document.getElementById('billing-plan-name');
    if (planNameEl) {
      planNameEl.textContent = subscription.plan + ' Plan';
    }

    // Update price
    var priceEl = document.querySelector('.plan-price');
    if (priceEl) {
      priceEl.textContent = '$' + subscription.price + '/' + subscription.billingCycle;
    }

    // Update next billing date
    var metaEl = document.querySelector('.plan-meta');
    if (metaEl && subscription.currentPeriodEnd) {
      var nextBilling = new Date(subscription.currentPeriodEnd);
      metaEl.innerHTML = '<span>Billed ' + subscription.billingCycle + '</span>' +
        '<span>Next billing: ' + nextBilling.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}) + '</span>';
    }
  });
}
```

2. **Use Billing API for Usage Data:**
```javascript
if (typeof ERM.billingAPI !== 'undefined') {
  ERM.billingAPI.getUsage().then(function(usage) {
    // Update registers
    var registersEl = document.getElementById('usage-registers');
    if (registersEl) {
      registersEl.textContent = usage.riskRegisters.used;
    }
    var registersValueEl = document.querySelector('.usage-item:nth-child(1) .usage-value');
    if (registersValueEl) {
      registersValueEl.innerHTML = '<strong>' + usage.riskRegisters.used + '</strong> / ' +
        (usage.riskRegisters.limit === 'unlimited' ? 'Unlimited' : usage.riskRegisters.limit);
    }

    // Update controls
    var controlsEl = document.getElementById('usage-controls');
    if (controlsEl) {
      controlsEl.textContent = usage.controls.used;
    }

    // Update team members
    var membersEl = document.getElementById('usage-members');
    if (membersEl) {
      membersEl.textContent = usage.teamMembers.used;
    }

    // Update reports
    var reportsEl = document.getElementById('usage-reports');
    if (reportsEl) {
      reportsEl.textContent = usage.reports.generated;
    }

    // Update progress bars
    updateUsageBars(usage);
  });
}
```

3. **Use Billing API for Payment Method:**
```javascript
if (typeof ERM.billingAPI !== 'undefined') {
  ERM.billingAPI.getPaymentMethod().then(function(paymentMethod) {
    var cardNumberEl = document.querySelector('.card-number');
    if (cardNumberEl) {
      cardNumberEl.textContent = '•••• •••• •••• ' + paymentMethod.last4;
    }

    var cardExpiryEl = document.querySelector('.card-expiry');
    if (cardExpiryEl) {
      cardExpiryEl.textContent = 'Expires ' + paymentMethod.expiryMonth + '/' + paymentMethod.expiryYear;
    }
  });
}
```

4. **Use Billing API for Invoices:**
```javascript
if (typeof ERM.billingAPI !== 'undefined') {
  ERM.billingAPI.getInvoices().then(function(invoices) {
    var invoiceList = document.querySelector('.invoice-list');
    if (invoiceList && invoices.length > 0) {
      invoiceList.innerHTML = '';
      invoices.forEach(function(invoice) {
        var invoiceHtml = '<div class="invoice-item">' +
          '<div class="invoice-info">' +
          '<span class="invoice-date">' + new Date(invoice.date).toLocaleDateString('en-US', {month: 'long', year: 'numeric'}) + '</span>' +
          '<span class="invoice-amount">$' + invoice.amount.toFixed(2) + '</span>' +
          '</div>' +
          '<div class="invoice-status ' + invoice.status + '">' + invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) + '</div>' +
          '<button class="btn btn-text" onclick="ERM.billingAPI.downloadInvoice(\'' + invoice.id + '\')">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
          '<polyline points="7 10 12 15 17 10"/>' +
          '<line x1="12" y1="15" x2="12" y2="3"/>' +
          '</svg> Download' +
          '</button>' +
          '</div>';
        invoiceList.innerHTML += invoiceHtml;
      });
    }
  });
}
```

### 5. Fix Billing CRUD Functions

**Current Issue:**
The buttons in billing section don't have working functions:
- "Change plan" button (line 641)
- "Cancel subscription" button (line 642)
- "Update" payment method button (line 704)
- "Edit address" button (line 715)

**Solution:**

1. **Change Plan Button:**
```javascript
// Replace line 641 in profile.html
<a href="upgrade.html" class="btn btn-outline">Change plan</a>
// with:
<button class="btn btn-outline" onclick="changePlan()">Change plan</button>

// Add function in profile.js:
function changePlan() {
  window.location.href = 'upgrade.html';
}
```

2. **Cancel Subscription:**
```javascript
// Replace onclick in line 642
<button class="btn btn-text-danger" onclick="cancelSubscription()">Cancel subscription</button>

// Add function in profile.js:
function cancelSubscription() {
  if (typeof ERM.components.showModal !== 'undefined') {
    ERM.components.showModal({
      title: 'Cancel Subscription',
      content: '<div>' +
        '<p>Are you sure you want to cancel your subscription?</p>' +
        '<div class="form-group">' +
        '<label class="form-label">Reason for cancelling (optional)</label>' +
        '<textarea class="form-textarea" id="cancel-reason" rows="3"></textarea>' +
        '</div>' +
        '</div>',
      buttons: [
        { label: 'Keep Subscription', type: 'secondary', action: 'close' },
        { label: 'Cancel Subscription', type: 'danger', action: 'cancel' }
      ],
      onAction: function(action) {
        if (action === 'cancel') {
          var reason = document.getElementById('cancel-reason').value;
          if (typeof ERM.billingAPI !== 'undefined') {
            ERM.billingAPI.cancelSubscription(reason).then(function() {
              ERM.components.closeModal();
              loadBillingInfo(); // Reload billing info
            });
          }
        }
      }
    });
  }
}
```

3. **Update Payment Method:**
```javascript
// Replace onclick in line 704
<button class="btn btn-outline" onclick="updatePaymentMethod()">Update</button>

// Add function in profile.js:
function updatePaymentMethod() {
  if (typeof ERM.billingAPI !== 'undefined') {
    ERM.billingAPI.updatePaymentMethod().then(function() {
      loadBillingInfo(); // Reload to show new card
    });
  }
}
```

4. **Edit Billing Address:**
```javascript
// Replace onclick in line 715
<button class="btn btn-text" onclick="editBillingAddress()">Edit address</button>

// Add function in profile.js:
function editBillingAddress() {
  var currentAddress = JSON.parse(localStorage.getItem('ERM_billingAddress') || '{}');

  if (typeof ERM.components.showModal !== 'undefined') {
    ERM.components.showModal({
      title: 'Edit Billing Address',
      content: '<div>' +
        '<div class="form-group">' +
        '<label class="form-label">Company Name</label>' +
        '<input type="text" class="form-input" id="address-company" value="' + (currentAddress.company || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label class="form-label">Street Address</label>' +
        '<input type="text" class="form-input" id="address-street" value="' + (currentAddress.street || '') + '">' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label class="form-label">City</label>' +
        '<input type="text" class="form-input" id="address-city" value="' + (currentAddress.city || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label class="form-label">State/Province</label>' +
        '<input type="text" class="form-input" id="address-state" value="' + (currentAddress.state || '') + '">' +
        '</div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label class="form-label">ZIP/Postal Code</label>' +
        '<input type="text" class="form-input" id="address-zip" value="' + (currentAddress.zip || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label class="form-label">Country</label>' +
        '<input type="text" class="form-input" id="address-country" value="' + (currentAddress.country || '') + '">' +
        '</div>' +
        '</div>' +
        '</div>',
      buttons: [
        { label: 'Cancel', type: 'secondary', action: 'close' },
        { label: 'Save Address', type: 'primary', action: 'save' }
      ],
      onAction: function(action) {
        if (action === 'save') {
          var address = {
            company: document.getElementById('address-company').value,
            street: document.getElementById('address-street').value,
            city: document.getElementById('address-city').value,
            state: document.getElementById('address-state').value,
            zip: document.getElementById('address-zip').value,
            country: document.getElementById('address-country').value
          };

          if (typeof ERM.billingAPI !== 'undefined') {
            ERM.billingAPI.updateBillingAddress(address).then(function() {
              ERM.components.closeModal();
              loadBillingInfo(); // Reload to show new address
            });
          } else {
            // Fallback to localStorage
            localStorage.setItem('ERM_billingAddress', JSON.stringify(address));
            ERM.components.closeModal();
            loadBillingInfo();
          }
        }
      }
    });
  }
}
```

### 6. Fix Role Conflicts & Synchronization

**Issue:**
Need to ensure invite roles don't conflict with other settings/roles.

**Solution:**
The team-sync-manager already handles this, but we need to ensure consistency:

1. **Workspace Roles:**
   - owner (isOwner: true)
   - member

2. **Invite Roles (Risk Registers & Reports):**
   - viewer
   - editor
   - admin

3. **Conflict Resolution:**
   - Workspace owner always has admin access to all registers/reports
   - When member is invited as "admin" to a register, it only applies to that register
   - When member is removed from workspace, all their register/report invites are removed

This is already implemented in team-sync-manager.js, no changes needed.

---

## Status Summary

| Task | Status | File(s) |
|------|--------|---------|
| Support tab cleanup | ✅ Complete | profile.html |
| Video tutorial link | ✅ Complete | help.js |
| Non-admin invite restriction | ✅ Complete | components.js |
| Remove hardcoded billing data | ⚠️ Needs implementation | profile.js |
| Fix billing CRUD functions | ⚠️ Needs implementation | profile.js, profile.html |
| Role synchronization | ✅ Already handled | team-sync-manager.js |

---

## Next Steps

1. Update `profile.js` `loadBillingInfo()` function with billing API calls
2. Add CRUD functions to `profile.js`: changePlan, cancelSubscription, updatePaymentMethod, editBillingAddress
3. Update onclick handlers in `profile.html` to use new functions
4. Test all billing functionality
5. Verify data loads from API (or localStorage fallback)
6. Ensure no hardcoded values remain

---

## Files That Need Updates

1. **assets/js/pages/profile.js** - Enhanced loadBillingInfo() + CRUD functions
2. **profile.html** - Update onclick handlers for buttons

All code examples provided above are ES5 compatible and follow the existing codebase patterns.

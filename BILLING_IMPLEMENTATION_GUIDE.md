# Billing System Implementation Guide

## Overview
Production-ready billing system for Dimeri ERM with payment gateway integration, professional invoicing, and responsive design.

## What's Been Implemented

### 1. Billing API Service (`assets/js/core/billing-api.js`) ✅
**Purpose:** Central API service for all billing operations, ready for backend integration

**Features:**
- Subscription management (get subscription details)
- Usage tracking (risk registers, controls, team members, reports, AI queries)
- Invoice management (list, download)
- Payment method management (Stripe/PayPal integration)
- Seat management (add/remove seats)
- Billing address management
- Subscription cancellation
- Stripe Checkout integration

**Configuration:**
```javascript
// In billing-api.js, update these values:
BILLING_CONFIG = {
  endpoints: {
    getSubscription: '/api/billing/subscription',  // YOUR BACKEND URL
    getUsage: '/api/billing/usage',
    // ... etc
  },
  gateway: 'stripe',  // or 'paypal'
  stripePublicKey: 'pk_live_YOUR_KEY_HERE',  // REPLACE
  paypalClientId: 'YOUR_PAYPAL_ID_HERE'  // REPLACE
}
```

**API Methods:**
- `ERM.billingAPI.getSubscription()` - Get current subscription
- `ERM.billingAPI.getUsage()` - Get usage statistics
- `ERM.billingAPI.getInvoices()` - Get invoice list
- `ERM.billingAPI.downloadInvoice(invoiceId)` - Download invoice PDF
- `ERM.billingAPI.getPaymentMethod()` - Get payment method
- `ERM.billingAPI.updatePaymentMethod()` - Update card (opens Stripe modal)
- `ERM.billingAPI.addSeats(number)` - Add seats
- `ERM.billingAPI.removeSeats(number)` - Remove seats
- `ERM.billingAPI.cancelSubscription(reason)` - Cancel subscription
- `ERM.billingAPI.updateBillingAddress(address)` - Update billing address
- `ERM.billingAPI.createCheckoutSession(priceId)` - Start Stripe Checkout

**Fallback Mode:**
- If backend not available, uses localStorage for demo/development
- Automatically switches to real API when backend is connected

### 2. Professional Invoice Generator (`assets/js/core/invoice-generator.js`) ✅
**Purpose:** Generate professional PDF invoices with Dimeri branding

**Features:**
- Professional invoice layout
- Dimeri logo at bottom left
- Company and customer information
- Line items with quantities and prices
- Tax calculations
- Payment method display
- Print-ready PDF format

**Usage:**
```javascript
// Download invoice
ERM.invoiceGenerator.generate(invoiceId);

// Or with invoice data
ERM.invoiceGenerator.generate(invoiceId, {
  number: 'INV-2024-001',
  date: '2024-01-15',
  dueDate: '2024-02-15',
  status: 'paid',
  lineItems: [
    {
      description: 'Pro Plan (3 seats)',
      quantity: 1,
      unitPrice: 29.00
    },
    {
      description: 'Additional Seats (2)',
      quantity: 2,
      unitPrice: 10.00
    }
  ],
  taxRate: 0.15, // 15% VAT
  paymentMethod: {
    brand: 'visa',
    last4: '4242'
  }
});
```

**Invoice Format:**
```
┌─────────────────────────────────────────────┐
│ INVOICE                      #INV-2024-001  │
│                              Date: Jan 15   │
│                                             │
│ From: Dimeri Technologies    Bill To:       │
│ 123 Business Street         Customer Corp   │
│ Johannesburg, SA            Cape Town, SA   │
│                                             │
│ Description    Qty  Price    Amount        │
│ ─────────────────────────────────────────  │
│ Pro Plan        1   $29.00   $29.00       │
│ Extra Seats     2   $10.00   $20.00       │
│                                             │
│                      Subtotal:  $49.00     │
│                      Tax (15%):  $7.35     │
│                      Total:     $56.35     │
│                                             │
│ [Dimeri Logo]  Thank you for your business │
└─────────────────────────────────────────────┘
```

### 3. Billing CSS (`assets/css/plan-limits.css`) ✅
**Purpose:** Professional, responsive styling for all billing components

**Features:**
- Billing seat management styles
- Usage grid and progress bars
- Plan display cards
- Payment method cards
- Invoice list styling
- Team member list in billing
- Fully responsive (mobile, tablet, desktop)
- Modern gradients and animations

**Responsive Breakpoints:**
- Desktop: Full layout
- Tablet (≤768px): Stacked columns, adjusted spacing
- Mobile (≤480px): Single column, full-width elements

## What Still Needs Implementation

### 1. Update billing-management.js
**Current State:** Has hardcoded data
**Needs:** Integration with billing-API.js

**Changes Required:**
```javascript
// Replace hardcoded data with API calls
renderProfileSeats: function() {
  // OLD: var members = this.getTeamMembers();
  // NEW:
  ERM.billingAPI.getSubscription().then(function(subscription) {
    ERM.billingAPI.getUsage().then(function(usage) {
      // Render with real data
    });
  });
}
```

### 2. Add Stripe Integration
**File:** `index.html` and `profile.html`
**Add Before Closing `</body>`:**
```html
<!-- Stripe.js -->
<script src="https://js.stripe.com/v3/"></script>
```

**Initialize in billing-management.js:**
```javascript
// Initialize Stripe when payment method button clicked
if (window.Stripe) {
  var stripe = Stripe('pk_live_YOUR_KEY');
}
```

### 3. Implement Add/Remove Seats Modals
**Location:** `billing-management.js`
**Add these functions:**

```javascript
showAddSeatsModal: function() {
  var self = this;

  ERM.components.showModal({
    title: 'Add Seats',
    content: '<div class="form-group">' +
      '<label class="form-label">Number of seats to add</label>' +
      '<input type="number" class="form-input" id="seats-to-add" min="1" max="10" value="1">' +
      '<p style="color: #64748b; font-size: 14px; margin-top: 8px;">$10/seat/month</p>' +
      '</div>',
    buttons: [
      { label: 'Cancel', type: 'secondary', action: 'close' },
      { label: 'Add Seats', type: 'primary', action: 'add' }
    ],
    onAction: function(action) {
      if (action === 'add') {
        var seats = parseInt(document.getElementById('seats-to-add').value);
        ERM.billingAPI.addSeats(seats).then(function() {
          ERM.components.closeModal();
          self.renderProfileSeats();
        });
      }
    }
  });
},

showRemoveSeatsModal: function() {
  var self = this;
  var seatUsage = this.getSeatUsage();
  var maxRemovable = seatUsage.available;

  ERM.components.showModal({
    title: 'Remove Seats',
    content: '<div class="form-group">' +
      '<label class="form-label">Number of seats to remove</label>' +
      '<input type="number" class="form-input" id="seats-to-remove" min="1" max="' + maxRemovable + '" value="1">' +
      '<p style="color: #64748b; font-size: 14px; margin-top: 8px;">You can remove up to ' + maxRemovable + ' unused seats</p>' +
      '</div>',
    buttons: [
      { label: 'Cancel', type: 'secondary', action: 'close' },
      { label: 'Remove Seats', type: 'danger', action: 'remove' }
    ],
    onAction: function(action) {
      if (action === 'remove') {
        var seats = parseInt(document.getElementById('seats-to-remove').value);
        ERM.billingAPI.removeSeats(seats).then(function() {
          ERM.components.closeModal();
          self.renderProfileSeats();
        });
      }
    }
  });
}
```

### 4. Remove Analytics Button
**File:** `billing-management.js`, in `renderProfileSeats()`
**Remove this line:**
```javascript
html += '<button class="btn btn-text btn-sm" onclick="ERM.billingManagement.showUpgradeAnalytics()">View Analytics</button>'
```

### 5. Update Preferences Tab
**File:** `profile.html`
**Replace entire preferences section with:**
```html
<section class="tab-content" id="tab-preferences">
  <div class="tab-header">
    <h1>Preferences</h1>
    <p>Customize your workspace appearance and date settings.</p>
  </div>

  <div class="settings-card">
    <h3 class="card-title">Appearance</h3>
    <div class="form-group">
      <label class="form-label">Theme</label>
      <select class="form-input" id="theme-select">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="auto">Auto (System)</option>
      </select>
    </div>
  </div>

  <div class="settings-card">
    <h3 class="card-title">Regional Settings</h3>
    <div class="form-group">
      <label class="form-label">Date Format</label>
      <select class="form-input" id="date-format-select">
        <option value="DD/MM/YYYY">DD/MM/YYYY (15/01/2024)</option>
        <option value="MM/DD/YYYY">MM/DD/YYYY (01/15/2024)</option>
        <option value="YYYY-MM-DD">YYYY-MM-DD (2024-01-15)</option>
      </select>
    </div>
  </div>
</section>
```

### 6. Add Responsive CSS for Main App
**File:** `assets/css/core/global.css` or create `assets/css/core/responsive.css`
**Add:**
```css
/* Global Responsive Design */
@media (max-width: 1024px) {
  /* Tablet adjustments */
  .main-container {
    padding: 16px;
  }

  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  /* Mobile adjustments */
  .header-nav {
    flex-direction: column;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    width: 95%;
    margin: 20px auto;
  }

  .sidebar {
    transform: translateX(-100%);
    position: fixed;
    z-index: 1000;
  }

  .sidebar.active {
    transform: translateX(0);
  }
}

@media (max-width: 480px) {
  /* Small mobile adjustments */
  body {
    font-size: 14px;
  }

  h1 {
    font-size: 24px;
  }

  h2 {
    font-size: 20px;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
```

## Backend Requirements

### API Endpoints Needed

#### 1. GET /api/billing/subscription
**Response:**
```json
{
  "plan": "PRO",
  "status": "active",
  "teamSize": 5,
  "billingCycle": "monthly",
  "currentPeriodEnd": "2024-02-15T00:00:00Z",
  "price": 49.00,
  "currency": "USD"
}
```

#### 2. GET /api/billing/usage
**Response:**
```json
{
  "riskRegisters": { "used": 12, "limit": "unlimited" },
  "controls": { "used": 45, "limit": "unlimited" },
  "teamMembers": { "used": 3, "limit": 5 },
  "reports": { "generated": 8, "limit": "unlimited" },
  "aiQueries": { "used": 23, "limit": "unlimited" }
}
```

#### 3. GET /api/billing/invoices
**Response:**
```json
{
  "invoices": [
    {
      "id": "inv_2024_01",
      "number": "INV-2024-001",
      "date": "2024-01-15T00:00:00Z",
      "dueDate": "2024-02-15T00:00:00Z",
      "status": "paid",
      "amount": 49.00,
      "currency": "USD",
      "lineItems": [
        {
          "description": "Pro Plan (3 seats)",
          "quantity": 1,
          "unitPrice": 29.00
        },
        {
          "description": "Additional Seats (2)",
          "quantity": 2,
          "unitPrice": 10.00
        }
      ],
      "taxRate": 0.15,
      "paymentMethod": {
        "brand": "visa",
        "last4": "4242"
      }
    }
  ]
}
```

#### 4. GET /api/billing/payment-method
**Response:**
```json
{
  "type": "card",
  "brand": "visa",
  "last4": "4242",
  "expiryMonth": 12,
  "expiryYear": 2026
}
```

#### 5. POST /api/billing/seats/add
**Request:**
```json
{
  "seats": 2
}
```

**Response:**
```json
{
  "success": true,
  "newTotal": 5,
  "newPrice": 49.00
}
```

#### 6. POST /api/billing/checkout/create
**Request:**
```json
{
  "priceId": "price_xyz",
  "successUrl": "https://app.dimeri.ai/profile.html?tab=billing&success=true",
  "cancelUrl": "https://app.dimeri.ai/profile.html?tab=billing&cancelled=true"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_xyz"
}
```

## Integration Steps

### Step 1: Load New Scripts
Add to `index.html` and `profile.html` (after other scripts):
```html
<script src="assets/js/core/billing-api.js"></script>
<script src="assets/js/core/invoice-generator.js"></script>
<script src="https://js.stripe.com/v3/"></script>
```

### Step 2: Update Configuration
In `billing-api.js`, update:
1. Replace all API endpoint URLs with your backend URLs
2. Add your Stripe publishable key
3. Add your PayPal client ID (if using PayPal)

### Step 3: Update billing-management.js
Replace hardcoded data with API calls (see section above)

### Step 4: Test Invoice Download
```javascript
// Test invoice generation
ERM.invoiceGenerator.generate('test-invoice-001');
```

### Step 5: Test Seat Management
```javascript
// Test adding seats
ERM.billingAPI.addSeats(2).then(console.log);

// Test removing seats
ERM.billingAPI.removeSeats(1).then(console.log);
```

### Step 6: Test Stripe Integration
1. Go to profile.html → Billing tab
2. Click "Update" on payment method
3. Should open Stripe card input modal
4. Test with Stripe test card: 4242424242424242

## Testing Checklist

- [ ] Billing tab loads without errors
- [ ] Seat usage displays correctly
- [ ] Team members list shows in billing
- [ ] Plan details show correctly
- [ ] Invoice download works
- [ ] Invoice has Dimeri logo at bottom left
- [ ] Add seats modal opens and works
- [ ] Remove seats modal opens and works
- [ ] Payment method update opens Stripe modal
- [ ] Responsive design works on mobile
- [ ] Responsive design works on tablet
- [ ] Usage stats pull from backend API
- [ ] Subscription data pulls from backend API

## Security Considerations

1. **API Keys:**
   - Never commit real Stripe keys to version control
   - Use environment variables: `process.env.STRIPE_PUBLIC_KEY`

2. **Backend Validation:**
   - Always validate requests on backend
   - Check user permissions before allowing seat changes
   - Verify subscription status server-side

3. **HTTPS Only:**
   - Payment integration requires HTTPS
   - Stripe will not work on HTTP

4. **PCI Compliance:**
   - Never handle raw card data yourself
   - Always use Stripe Elements for card input
   - Let Stripe handle tokenization

## Support & Documentation

- **Stripe Docs:** https://stripe.com/docs/payments/checkout
- **Invoice Generation:** Uses window.print() for PDF generation
- **Responsive Design:** Mobile-first approach with breakpoints at 480px, 768px, 1024px

## Next Steps

1. Set up backend API endpoints
2. Configure Stripe account and get API keys
3. Update billing-api.js with real endpoints
4. Test in development environment
5. Add comprehensive error handling
6. Implement webhook handlers for Stripe events
7. Add analytics tracking for billing events
8. Test across all devices and browsers

## Need Help?

Contact: billing@dimeri.ai

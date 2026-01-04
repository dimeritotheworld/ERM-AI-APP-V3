# 🚀 Quick Start Guide

## What's Ready to Test Right Now

### 1. Team Management ✅
```
1. Go to Settings → Team Management
2. Click "Add Member"
3. Enter name and email
4. Member is added with automatic seat assignment
5. Try removing a member to see impact analysis
```

### 2. Report Sharing ✅
```
1. Go to Reports module
2. Create or select a report
3. Click hamburger menu (⋮) → Share
4. Select team member and assign permission (viewer/editor)
5. Report now appears in that member's reports module
```

### 3. Billing & Seats ✅
```
1. Go to Profile → Billing tab
2. See seat usage bar and team members
3. Click "Add Seats" → See live cost preview
4. Click "Remove Unused Seats" (if available)
5. Download an invoice (generates professional PDF)
```

### 4. Responsive Design ✅
```
1. Open app on your phone/tablet
2. Sidebar automatically collapses
3. Touch-friendly button sizes (44px minimum)
4. Forms don't cause zoom on iOS
5. Try landscape and portrait modes
```

---

## Quick Backend Integration (5 Minutes)

### Step 1: Update Billing API Endpoints
Edit `assets/js/core/billing-api.js` line 8-22:

```javascript
endpoints: {
  getSubscription: 'https://YOUR-API.com/billing/subscription',
  getUsage: 'https://YOUR-API.com/billing/usage',
  getInvoices: 'https://YOUR-API.com/billing/invoices',
  // ... update all endpoints
}
```

### Step 2: Add Stripe Key
Edit `assets/js/core/billing-api.js` line 27:

```javascript
stripePublicKey: 'pk_live_YOUR_ACTUAL_KEY_HERE'
```

### Step 3: Update Company Info
Edit `assets/js/core/invoice-generator.js` line 127-137:

```javascript
_getCompanyInfo: function() {
  return {
    name: 'Your Company Name',
    address: 'Your Business Address',
    // ... rest of info
  };
}
```

### Step 4: Test
```bash
# Open in browser
open index.html

# Or with a local server
python -m http.server 8000
# Then go to http://localhost:8000
```

---

## Test Stripe Integration

### 1. Add Test Card
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (12/26)
CVC: Any 3 digits (123)
ZIP: Any 5 digits (12345)
```

### 2. Update Payment Method
```
1. Go to Profile → Billing
2. Click "Update" on payment method
3. Stripe modal appears
4. Enter test card details
5. Click "Update Card"
```

### 3. Add Seats (Test Checkout)
```
1. Click "Add Seats"
2. Enter number of seats
3. See live cost preview
4. Click "Add Seats"
5. Redirects to Stripe Checkout (when backend connected)
```

---

## Mobile Testing

### iOS (Safari)
```
1. Open on iPhone/iPad
2. Add to Home Screen for app-like experience
3. Test all features in portrait/landscape
4. Verify forms don't zoom
```

### Android (Chrome)
```
1. Open on Android phone/tablet
2. Test sidebar collapse/expand
3. Verify touch targets are large enough
4. Test all modals and forms
```

### Desktop Browser DevTools
```
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1440px)
```

---

## Common Issues & Fixes

### Issue: "Billing API not available"
**Fix:** Backend not connected yet. App uses localStorage fallback for development.

### Issue: "Stripe is not defined"
**Fix:** Stripe.js didn't load. Check internet connection and script tag in HTML.

### Issue: Invoice doesn't download
**Fix:** Browser blocked popup. Allow popups for this site.

### Issue: Modal doesn't close on mobile
**Fix:** Click outside modal or use close button (X).

### Issue: Sidebar stuck open on mobile
**Fix:** Click the overlay (dark area) or menu button to close.

---

## File Locations

### Core Scripts
```
assets/js/core/
├── billing-api.js          ← Update API endpoints here
├── invoice-generator.js    ← Update company info here
└── team-sync-manager.js    ← Team management logic
```

### Billing
```
assets/js/plan-limits/
└── billing-management.js   ← Seat modals & billing UI
```

### Styles
```
assets/css/
├── core/responsive.css     ← All responsive styles
└── plan-limits.css         ← Billing styles
```

---

## Next Steps

1. **Test Everything** - Click through all features
2. **Set Up Backend** - Follow BILLING_IMPLEMENTATION_GUIDE.md
3. **Get Stripe Keys** - https://dashboard.stripe.com/apikeys
4. **Deploy** - Upload to your hosting (requires HTTPS)
5. **Go Live** - Update Stripe keys to production mode

---

## Help & Documentation

- `IMPLEMENTATION_COMPLETE.md` - What was built
- `BILLING_IMPLEMENTATION_GUIDE.md` - Backend integration
- `TEAM_SYNC_DOCUMENTATION.md` - Team system details

---

## Emergency Rollback

If something breaks:

```bash
# Revert to previous version
git checkout HEAD~1

# Or disable new features temporarily
# Comment out these scripts in index.html:
# - billing-api.js
# - invoice-generator.js
# - responsive.css
```

---

*Ready to test!* 🎉

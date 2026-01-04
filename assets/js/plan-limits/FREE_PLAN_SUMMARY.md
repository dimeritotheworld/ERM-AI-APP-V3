# FREE PLAN - Export Limits & Watermarks

## 🔒 FREE PLAN RESTRICTIONS

This system applies **ONLY to FREE plan users**. Pro and Enterprise users have unlimited exports with no watermarks.

---

## Export Limits (FREE PLAN ONLY)

### Risk Registers
- ✅ **Can export**: 5 unique risk registers
- ✅ **Re-export**: Unlimited (already exported items)
- ✅ **Watermark**: Logo on every page
- ❌ **Cannot**: Export a 6th unique risk register

### Reports
- ✅ **Can export**: 5 unique reports
- ✅ **Re-export**: Unlimited (already exported items)
- ✅ **Watermark**: Logo on every page
- ❌ **Cannot**: Export a 6th unique report

---

## Watermarks (FREE PLAN ONLY)

### Logo Placement

**Risk Registers:**
- Position: **Top-right corner** of every page
- Size: 40mm × 15mm
- Opacity: 30%
- File: `assets/images/watermark-logo.png`

**Reports:**
- Position: **Bottom-left corner** of every page
- Size: 35mm × 13mm
- Opacity: 30%
- File: `assets/images/watermark-logo.png`

### Example
```
┌─────────────────────────────────┐
│                      [LOGO] ← Risk Register watermark
│                                 │
│   Risk Register Content         │
│                                 │
│                                 │
│                                 │
│  [LOGO] ← Report watermark      │
└─────────────────────────────────┘
```

---

## How It Works (FREE PLAN)

### Scenario 1: Within Limit (1-5 exports)

```
User: "Export Risk Register A"
System: ✅ Shows confirmation modal
        "Export Usage: 1 of 5 unique risk registers exported"
        "4 exports remaining after this one"

User: Clicks "Export with Watermark"
System: ✅ Exports PDF with logo watermark
        ✅ Records export in history
        ✅ Shows success toast
```

### Scenario 2: Re-export (Already Exported)

```
User: "Export Risk Register A" (again)
System: ✅ Shows confirmation modal
        "This has been exported before. Watermark will be applied."
        (Does NOT count toward limit)

User: Clicks "Export with Watermark"
System: ✅ Exports PDF with logo watermark
        ✅ Does NOT increment unique count
```

### Scenario 3: Limit Reached (6th unique export)

```
User: "Export Risk Register F" (6th unique)
System: ❌ Shows limit modal
        "You've exported 5 of 5 unique risk registers on the free plan."

        Options shown:
        - Re-export already exported items (allowed)
        - Cannot export new items (blocked)
        - Upgrade to Pro (unlimited)

User: Export blocked
```

---

## Pro/Enterprise Plans

**NO RESTRICTIONS:**
- ✅ Unlimited risk register exports
- ✅ Unlimited report exports
- ✅ NO watermarks
- ✅ Excel/CSV export available
- ✅ Exports still tracked but not limited

---

## Technical Implementation

### Check Plan Before Export

```javascript
var plan = ERM.usageTracker.getPlan();

if (plan === 'FREE') {
  // Apply limits and watermarks
  ERM.exportWrapper.exportRiskRegister(id, name, exportFunction);
} else {
  // Pro/Enterprise: No restrictions
  exportFunction();
}
```

### Export Wrapper (Handles FREE plan logic)

```javascript
ERM.exportWrapper.exportRiskRegister(registerId, registerName, function(callback) {
  var pdf = new jsPDF();
  // Build PDF...
  callback(pdf);  // Wrapper adds watermark for FREE plan only
});
```

### Manual Check

```javascript
var check = ERM.exportEnforcement.canExportRiskRegister(id, name);

if (plan === 'FREE' && !check.allowed) {
  // Show limit modal (FREE plan only)
  ERM.exportEnforcement.showExportLimitModal('riskRegister', 5);
  return;
}

if (plan === 'FREE' && check.watermark) {
  // Add watermark (FREE plan only)
  ERM.exportEnforcement.addWatermarkToPDF(pdf, 'riskRegister', callback);
}
```

---

## Export Statistics

### Get Export Stats

```javascript
var stats = ERM.exportEnforcement.getExportStats();

console.log(stats);
// Output:
// {
//   riskRegisters: {
//     total: 12,      // Total exports (including re-exports)
//     unique: 5,      // Unique items exported (counts toward limit)
//     limit: 5,       // FREE plan limit
//     remaining: 0    // Exports remaining
//   },
//   reports: {
//     total: 8,
//     unique: 3,
//     limit: 5,
//     remaining: 2
//   }
// }
```

### Check Specific Item

```javascript
var alreadyExported = ERM.exportEnforcement.hasBeenExported('riskRegister', 'reg-123');

if (alreadyExported) {
  console.log('This item can be re-exported (FREE plan)');
} else {
  console.log('This is a new export (counts toward FREE plan limit)');
}
```

---

## Export History Tracking

### Storage Format

All exports are tracked in `localStorage['erm_exportHistory']`:

```javascript
[
  {
    type: 'riskRegister',
    itemId: 'reg-123',
    itemName: 'Manufacturing Risks 2024',
    format: 'pdf',
    exportedAt: '2024-12-24T10:30:00.000Z',
    plan: 'FREE'
  },
  {
    type: 'report',
    itemId: 'report-456',
    itemName: 'Q4 Risk Report',
    format: 'pdf',
    exportedAt: '2024-12-24T11:00:00.000Z',
    plan: 'FREE'
  }
]
```

### Counting Logic (FREE PLAN)

```javascript
// Count UNIQUE items only
var uniqueRiskRegisters = new Set();

history.forEach(function(item) {
  if (item.type === 'riskRegister') {
    uniqueRiskRegisters.add(item.itemId);  // Only unique IDs count
  }
});

var count = uniqueRiskRegisters.size;  // 5 max for FREE plan
```

---

## User Messages (FREE PLAN)

### Confirmation Modal
```
⚠️ Free Plan Watermark

This export will include a "Dimeri.ai Free Plan" watermark on every page.

Export Usage: 2 of 5 unique risk registers exported
3 exports remaining after this one

Exporting: Manufacturing Risk Register 2024

[Cancel] [Export with Watermark]
```

### Limit Reached Modal
```
📊 Export Limit Reached

You've exported 5 of 5 unique risk registers on the free plan.
You can re-export items you've already exported, but cannot export new ones.

┌─────────────────────┐  ┌─────────────────────┐
│  ✅ Already Exported │  │  🔒 New Exports     │
│                     │  │                     │
│  You can re-export  │  │  Cannot export      │
│  any risk register  │  │  additional risk    │
│  you've already     │  │  registers on       │
│  exported           │  │  free plan          │
└─────────────────────┘  └─────────────────────┘

Upgrade to Pro for:
✓ Unlimited Risk Registers exports
✓ No watermarks
✓ Excel & CSV exports
✓ Priority support

[Cancel] [Upgrade Now]
```

---

## Summary

### FREE PLAN:
- 🔒 **5** unique risk registers can be exported
- 🔒 **5** unique reports can be exported
- 🔄 **Unlimited** re-exports of already exported items
- 🏷️ **Logo watermark** on every page
- ❌ **Blocked** after limit reached
- ⬆️ **Upgrade prompts** to Pro

### PRO/ENTERPRISE PLANS:
- ✅ **Unlimited** exports
- ✅ **No watermarks**
- ✅ **No restrictions**

---

**The export enforcement system ONLY affects FREE plan users. Paid users export freely with no limits or watermarks.**

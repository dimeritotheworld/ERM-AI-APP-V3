# Export Limits Integration Guide

## Overview

This guide shows how to integrate export limits and watermarks into your existing PDF export functions.

## Key Features

1. **Export Limits**: Only 5 unique risk registers and 5 unique reports can be exported
2. **Re-export Allowed**: Items already exported can be re-exported unlimited times
3. **Watermarks**: Free plan exports include your logo watermark
4. **User-Friendly**: Clear modals explain limits and remaining exports

## How It Works

### Export Tracking
- Each export is tracked in localStorage (`erm_exportHistory`)
- Tracks: `itemId`, `itemName`, `type`, `format`, `exportedAt`, `plan`
- Only **unique** items count toward the limit (not total exports)

### Watermark Placement
- **Risk Registers**: Logo in **top-right corner** of every page
- **Reports**: Logo in **bottom-left corner** of every page
- **Opacity**: 30% for subtle appearance
- **Fallback**: Text watermark if logo fails to load

## Integration Steps

### Step 1: Wrap Your Export Function

**Before (Old Code):**
```javascript
function exportRiskRegister() {
  var pdf = new jsPDF();
  // ... build PDF ...
  pdf.save('risk-register.pdf');
}
```

**After (New Code):**
```javascript
function exportRiskRegister() {
  var registerId = 'reg-123';
  var registerName = 'Manufacturing Risk Register';

  ERM.exportWrapper.exportRiskRegister(registerId, registerName, function(callback) {
    var pdf = new jsPDF();
    // ... build PDF ...

    // Call callback with completed PDF
    callback(pdf);
  });
}
```

### Step 2: Update Report Exports

**Before:**
```javascript
function exportReport() {
  var pdf = new jsPDF();
  // ... build PDF ...
  pdf.save('report.pdf');
}
```

**After:**
```javascript
function exportReport() {
  var reportId = 'report-456';
  var reportName = 'Q4 2024 Risk Report';

  ERM.exportWrapper.exportReport(reportId, reportName, function(callback) {
    var pdf = new jsPDF();
    // ... build PDF ...

    // Call callback with completed PDF
    callback(pdf);
  });
}
```

## User Experience Flow

### Scenario 1: First-Time Export (Within Limit)

1. User clicks "Export PDF"
2. **Modal shows**: "Export with Watermark" confirmation
   - Shows: "Export Usage: 2 of 5 unique risk registers exported"
   - Shows: "3 exports remaining after this one"
3. User clicks "Export with Watermark"
4. PDF generates with logo watermark
5. Success toast: "Export complete with watermark"

### Scenario 2: Re-Exporting (Already Exported)

1. User clicks "Export PDF" on previously exported item
2. **Modal shows**: "Export with Watermark" confirmation
   - Shows: "This risk register has been exported before. Watermark will be applied."
   - No impact on export count
3. User clicks "Export with Watermark"
4. PDF generates with watermark
5. Success toast: "Export complete with watermark"

### Scenario 3: Limit Reached (6th Unique Export Attempt)

1. User clicks "Export PDF"
2. **Modal shows**: "Export Limit Reached"
   - Shows: "You've exported 5 of 5 unique risk registers on the free plan"
   - Explains: Can re-export already exported items
   - Cannot export new items
3. "Upgrade Now" button to upgrade to Pro
4. Export blocked

## API Reference

### ERM.exportWrapper.exportRiskRegister()

Wrap risk register export with limit checks and watermarks.

**Parameters:**
- `registerId` (string): Unique risk register ID
- `registerName` (string): Name for PDF filename
- `exportFunction` (function): Your export function that receives a callback

**Example:**
```javascript
ERM.exportWrapper.exportRiskRegister('reg-123', 'Manufacturing Risks 2024', function(callback) {
  var pdf = new jsPDF();

  // Your PDF building code here
  pdf.text('Risk Register', 10, 10);
  // ...

  // IMPORTANT: Call callback when PDF is ready
  callback(pdf);
});
```

### ERM.exportWrapper.exportReport()

Wrap report export with limit checks and watermarks.

**Parameters:**
- `reportId` (string): Unique report ID
- `reportName` (string): Name for PDF filename
- `exportFunction` (function): Your export function that receives a callback

**Example:**
```javascript
ERM.exportWrapper.exportReport('report-456', 'Q4 Risk Report', function(callback) {
  var pdf = new jsPDF();

  // Your PDF building code here
  pdf.text('Risk Report', 10, 10);
  // ...

  // IMPORTANT: Call callback when PDF is ready
  callback(pdf);
});
```

### ERM.exportEnforcement.getExportStats()

Get current export statistics.

**Returns:**
```javascript
{
  riskRegisters: {
    total: 12,      // Total times exported (including re-exports)
    unique: 5,      // Unique items exported
    limit: 5,       // Free plan limit
    remaining: 0    // Remaining exports
  },
  reports: {
    total: 8,
    unique: 3,
    limit: 5,
    remaining: 2
  }
}
```

## Direct Integration (Advanced)

If you need more control, use the enforcement functions directly:

### Check Before Export

```javascript
var check = ERM.exportEnforcement.canExportRiskRegister(registerId, registerName);

if (!check.allowed) {
  // Show limit modal
  ERM.exportEnforcement.showExportLimitModal('riskRegister', 5);
  return;
}

if (check.watermark) {
  // Show watermark warning
  console.log('Watermark will be applied');
}

// Proceed with export...
```

### Add Watermark Manually

```javascript
var pdf = new jsPDF();
// ... build PDF ...

// Add watermark
ERM.exportEnforcement.addWatermarkToPDF(pdf, 'riskRegister', function() {
  // Record export
  ERM.exportEnforcement.recordExport('riskRegister', registerId, registerName, 'pdf');

  // Save PDF
  pdf.save('risk-register.pdf');
});
```

## Modals Reference

### Export Limit Modal
Shown when user tries to export 6th unique item.

**Features:**
- Clear message about 5/5 limit
- Explains re-export is allowed
- Shows upgrade path
- Lists Pro plan benefits

### Export Confirmation Modal
Shown before each free plan export.

**Features:**
- Watermark warning
- Export count ("2 of 5 exported")
- Remaining exports ("3 exports remaining")
- Item name being exported
- "Export with Watermark" button

## Testing

### Test Export Limits

```javascript
// Get current stats
var stats = ERM.exportEnforcement.getExportStats();
console.log('Risk Registers:', stats.riskRegisters.unique, '/', stats.riskRegisters.limit);

// Clear export history (for testing)
ERM.storage.set('erm_exportHistory', []);

// Test limit enforcement
for (var i = 1; i <= 6; i++) {
  var registerId = 'test-reg-' + i;
  var check = ERM.exportEnforcement.canExportRiskRegister(registerId, 'Test ' + i);
  console.log('Export ' + i + ':', check.allowed ? 'ALLOWED' : 'BLOCKED');
}
```

### Test Watermark

```javascript
var pdf = new jsPDF();
pdf.text('Test Page', 10, 10);

ERM.exportEnforcement.addWatermarkToPDF(pdf, 'riskRegister', function() {
  pdf.save('test-watermark.pdf');
});
```

## Watermark Configuration

### Logo Settings

Located in: `assets/js/plan-limits/export-enforcement.js`

```javascript
getWatermarkConfig: function(type) {
  return {
    logoPath: 'assets/images/watermark-logo.png',
    opacity: 0.3,
    width: type === 'riskRegister' ? 40 : 35,   // mm
    height: type === 'riskRegister' ? 15 : 13,  // mm
    position: type === 'riskRegister' ? 'top-right' : 'bottom-left'
  };
}
```

**Adjust as needed:**
- `opacity`: 0.1 to 1.0 (0.3 = 30% opacity)
- `width`/`height`: Size in millimeters
- `position`: 'top-right' or 'bottom-left'

## Common Issues

### Watermark Not Showing

**Cause**: Logo image not loading
**Solution**: Check logo path and ensure it's accessible
**Fallback**: Text watermark "Dimeri.ai Free Plan" will be used

### Export Count Incorrect

**Cause**: Same item exported with different IDs
**Solution**: Ensure consistent `itemId` for same item
```javascript
// GOOD: Use database/storage ID
var registerId = register.id;

// BAD: Generate new ID each time
var registerId = 'reg-' + Date.now();
```

### Modal Not Closing

**Cause**: Event handler conflict
**Solution**: Use provided close function
```javascript
ERM.exportEnforcement.closeModal();
```

## Pro/Enterprise Behavior

For paid plans:
- ✅ Unlimited exports
- ✅ No watermarks
- ✅ No modals/warnings
- ✅ Still tracked in history

**Check plan:**
```javascript
var plan = ERM.usageTracker.getPlan();
if (plan === 'FREE') {
  // Apply limits and watermarks
} else {
  // No restrictions
}
```

## Summary

**Before Integration:**
```javascript
pdf.save('file.pdf');
```

**After Integration:**
```javascript
ERM.exportWrapper.exportRiskRegister(id, name, function(callback) {
  // Build PDF
  callback(pdf);  // Wrapper handles watermark & saving
});
```

**Benefits:**
- ✅ Automatic limit enforcement
- ✅ Watermark application
- ✅ User-friendly modals
- ✅ Export tracking
- ✅ Re-export support
- ✅ Upgrade prompts

---

**Questions?** Check the main README or contact the development team.

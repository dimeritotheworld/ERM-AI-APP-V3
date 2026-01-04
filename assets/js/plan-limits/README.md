# Plan Limits & Enforcement System

## Overview

The Plan Limits system enforces free plan restrictions across the Dimeri ERM application. It provides **hard enforcement** at the UI and data layers, preventing users from exceeding their plan limits while maintaining a positive user experience.

## Core Principles

1. **Hard caps, not soft warnings** - Users hit a physical wall when limits are reached
2. **Read-only access after limit** - Existing data remains fully accessible
3. **Upgrade at point of intent** - Block only when creating/exporting, not browsing
4. **Workspace-based limits** - Limits apply per workspace, not per user
5. **Admin override capability** - Platform admins can bypass limits

## Free Plan Limits

| Feature | Limit |
|---------|-------|
| Risk Registers | 5 |
| Total Risks | 25 |
| Controls | 10 |
| Reports | 5 |
| Team Members | 3 |
| Storage | 50 MB |
| AI Calls | 100/month (soft cap) |
| PDF Export | ✅ Allowed |
| Excel/CSV Export | ❌ Blocked |

## Architecture

### File Structure

```
assets/js/plan-limits/
├── plan-config.js              # Plan limits configuration
├── usage-tracker.js            # Usage calculation & tracking
├── enforcement.js              # Enforcement logic & checks
├── upgrade-modal.js            # Upgrade UI components
├── plan-limits-integration.js  # Integration with existing code
└── README.md                   # This file

assets/css/
└── plan-limits.css             # Styling for modals & banners
```

### Module Dependencies

```
plan-config.js  (no dependencies)
    ↓
usage-tracker.js  (depends on: plan-config.js, ERM.storage, ERM.state)
    ↓
enforcement.js  (depends on: usage-tracker.js, plan-config.js)
    ↓
upgrade-modal.js  (depends on: enforcement.js)
    ↓
plan-limits-integration.js  (depends on: all above + DOM)
```

## Usage

### 1. Check if Action is Allowed

```javascript
// Check before creating risk register
var check = ERM.enforcement.canCreateRiskRegister();
if (!check.allowed) {
  ERM.enforcement.blockAction(check);
  return;
}

// Proceed with creation...
```

### 2. Get Current Usage

```javascript
var usage = ERM.usageTracker.getUsage();
console.log('Risk Registers:', usage.riskRegisters);
console.log('Controls:', usage.controls);
```

### 3. Check Specific Feature Status

```javascript
var status = ERM.enforcement.getStatus('riskRegisters');
// Returns: { current, limit, remaining, percentage, isAtLimit, canCreate }
```

### 4. Show Warning Banner

```javascript
var banner = ERM.enforcement.getWarningBanner('risks');
if (banner) {
  // Insert banner HTML into page
}
```

## Enforcement Points

### Risk Register Creation
- **Trigger**: Click "New Risk Register" button
- **Check**: `ERM.enforcement.canCreateRiskRegister()`
- **Action**: Block modal open, show upgrade prompt

### Risk Creation
- **Trigger**: Click "Add Risk" or "New Risk" button
- **Check**: `ERM.enforcement.canCreateRisk()`
- **Action**: Block modal open, show inline banner

### Control Creation
- **Trigger**: Click "Add Control" button
- **Check**: `ERM.enforcement.canCreateControl()`
- **Action**: Block modal open, show upgrade prompt

### Report Generation
- **Trigger**: Click "Generate Report" button
- **Check**: `ERM.enforcement.canGenerateReport()`
- **Action**: Block generation, show upgrade prompt

### Export
- **Trigger**: Select Excel/CSV export format
- **Check**: `ERM.enforcement.canExport(format)`
- **Action**: Show export blocked modal with format comparison

### Team Invitations
- **Trigger**: Click "Invite" button
- **Check**: `ERM.enforcement.canInviteMembers()`
- **Action**: Block invite modal, show upgrade prompt

## Integration Method

The system uses **event capture** to intercept button clicks before they reach application code:

```javascript
document.addEventListener('click', function(e) {
  var button = e.target;
  if (button.textContent.includes('New Risk Register')) {
    var check = ERM.enforcement.canCreateRiskRegister();
    if (!check.allowed) {
      e.preventDefault();
      e.stopPropagation();
      ERM.enforcement.blockAction(check);
      return false;
    }
  }
}, true); // Capture phase
```

This approach:
- ✅ Requires no modification to existing code
- ✅ Works with all button types
- ✅ Cannot be bypassed
- ✅ Maintains separation of concerns

## Admin Portal Integration

The admin portal automatically reads plan limits and usage data from the main app's localStorage:

```javascript
// In admin portal
var usage = ADMIN.data.getWorkspaceUsage(workspaceId);
var limits = ADMIN.data.getFreePlanLimits();
var isOverLimit = ADMIN.data.isOverLimit(workspaceId);
```

The admin portal displays:
- Usage vs limits for each workspace
- Over-limit status indicators
- Usage percentages and progress bars
- Ability to view workspace details

## User Experience Flow

### When Limit is Reached

1. User clicks "New Risk Register"
2. System checks: `canCreateRiskRegister()`
3. System detects: 5/5 registers used
4. System blocks action
5. System shows upgrade modal:
   - Clear message: "You've created 5 of 5 risk registers"
   - Visual usage bar
   - Plan comparison (Free vs Pro)
   - "Upgrade Now" button

### When Within Limits

1. User clicks "New Risk Register"
2. System checks: `canCreateRiskRegister()`
3. System detects: 3/5 registers used
4. System allows action
5. Normal flow proceeds
6. (Optional) Show usage indicator: "3 / 5 Risk Registers"

## Edge Cases Handled

### Deleting Items
- Deleting a risk register frees up capacity
- User can immediately create a new one
- Usage counter updates automatically

### Multiple Users
- Limits are shared across all workspace users
- Any user can hit the cap
- All users see the same limits

### Admin Override
- Platform admins can bypass all limits
- Check: `user.isPlatformAdmin === true`
- Or workspace-level: `workspace.limitsOverride === true`

### Read-Only Mode
When at limit, users can still:
- ✅ View all data
- ✅ Edit existing items
- ✅ Delete items
- ❌ Create new items
- ❌ Export to Excel/CSV

## API Reference

### ERM.planLimits

```javascript
// Get limits for a plan
var limits = ERM.planLimits.getLimits('FREE');

// Check if feature is unlimited
var unlimited = ERM.planLimits.isUnlimited('PRO', 'riskRegisters');

// Get friendly limit text
var text = ERM.planLimits.getLimitText(-1); // Returns "Unlimited"
```

### ERM.usageTracker

```javascript
// Get current workspace usage
var usage = ERM.usageTracker.getUsage();

// Get workspace plan
var plan = ERM.usageTracker.getPlan(); // Returns: 'FREE', 'PRO', 'ENTERPRISE'

// Check if at limit
var atLimit = ERM.usageTracker.isAtLimit('riskRegisters');

// Get remaining capacity
var remaining = ERM.usageTracker.getRemaining('controls'); // Returns number or -1

// Get usage percentage
var percentage = ERM.usageTracker.getUsagePercentage('risks'); // Returns 0-100

// Check export format
var canExport = ERM.usageTracker.canExport('excel'); // Returns boolean
```

### ERM.enforcement

```javascript
// Check permissions
var check = ERM.enforcement.canCreateRiskRegister();
// Returns: { allowed: true/false, reason, message, upgradeMessage }

// Block action with upgrade modal
ERM.enforcement.blockAction(check);

// Validate before creating
var canCreate = ERM.enforcement.validateCreate('risk'); // Returns boolean

// Get feature status
var status = ERM.enforcement.getStatus('controls');
// Returns: { current, limit, remaining, percentage, isAtLimit, isNearLimit, canCreate }
```

### ERM.upgradeModal

```javascript
// Show upgrade modal
ERM.upgradeModal.show({
  feature: 'riskRegisters',
  message: 'You\'ve created 5 of 5 risk registers.',
  upgradeMessage: 'Upgrade to create unlimited risk registers.',
  current: 5,
  limit: 5
});

// Show export blocked modal
ERM.upgradeModal.showExportBlocked('excel');

// Close modal
ERM.upgradeModal.close();
```

## Testing

### Test Scenarios

1. **At Limit - Risk Registers**
   - Create 5 risk registers
   - Try to create 6th
   - Should see upgrade modal

2. **At Limit - Risks**
   - Create risks until 25 total
   - Try to add another risk
   - Should see inline banner

3. **Export Blocking**
   - Try to export to Excel
   - Should see format comparison modal

4. **Delete & Create**
   - Reach risk register limit (5/5)
   - Delete one register
   - Should be able to create new one (5/5 again)

5. **Admin Override**
   - Set `user.isPlatformAdmin = true`
   - Should bypass all limits

## Future Enhancements

- [ ] Monthly AI call counter with automatic reset
- [ ] Storage usage tracking with file upload blocking
- [ ] Grace period after downgrading from paid plan
- [ ] Usage analytics in admin portal
- [ ] Email notifications when approaching limits
- [ ] Workspace suspension for abuse
- [ ] Custom limits per workspace (admin override)

## Support

For questions or issues with the plan limits system:
- Check this documentation first
- Review the console logs for enforcement messages
- Test with `user.isPlatformAdmin = true` to bypass limits
- Contact development team for custom limits

---

**Version**: 1.0.0
**Last Updated**: December 2024
**Maintained By**: Dimeri ERM Development Team

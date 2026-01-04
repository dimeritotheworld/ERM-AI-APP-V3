# Team Member Synchronization System

## Overview
Complete team member lifecycle management with cascading updates across the entire application.

## Access Model

### How Access Works:
1. **Workspace Access**: Admin invites User A to workspace → User A becomes a team member
2. **Risk Register Access**: Admin invites User A to Risk Register X → Risk Register X appears in User A's risk register module
3. **Control Access**: **Automatic** - All controls linked to Risk Register X automatically appear in User A's controls module
4. **Report Access**: **Separate sharing** - Reports can be shared independently with team members

### Key Principle:
**Risk Registers and Reports have invites.** Controls inherit access from risk registers. Reports are shared separately with viewer/editor permissions.

## Architecture

### Core Components

#### 1. Team Sync Manager (`assets/js/core/team-sync-manager.js`)
Central hub for all team member operations with automatic synchronization across:
- Header team dropdown
- Settings team management tab
- Billing/seats management
- Risk register invites (controls inherit from these)

### Key Features

## 1. Adding Team Members

**What Happens:**
```
User clicks "Add Member" → Checks seat availability → Assigns seat → Syncs everywhere
```

**Seat Management:**
- Automatically checks if seats are available
- If no seats available, shows upgrade modal to add more
- Free plan: 3 seats, Pro plan: 3-7 seats
- Each new member gets a seat assigned automatically

**Code Flow:**
```javascript
ERM.team.showAddMemberModal()
  → ERM.teamSyncManager.addMember()
    → Check seat availability
    → Create member with seat assignment
    → Track analytics
    → Refresh all UI components
```

**Refreshes:**
- ✅ Header team dropdown
- ✅ Settings team tab
- ✅ Billing seats card
- ✅ All invite modals

## 2. Removing Team Members

**What Happens:**
```
User clicks "Remove" → Shows impact analysis → Confirms deletion → Cascading removal
```

**Impact Analysis Shows:**
- Number of risk registers member has access to
- Number of controls linked to those risk registers (inherited access)
- Billing seat that will be freed

**Cascading Deletion:**
1. Removes from workspace members
2. Removes from ALL risk register invites
3. **Controls automatically lose access** (inherited from risk registers)
4. Frees up billing seat
5. Tracks analytics
6. Refreshes all UI

**Code Flow:**
```javascript
ERM.settings.removeMember(memberId)
  → ERM.teamSyncManager.removeMember()
    → getMemberRemovalImpact()
    → Show confirmation dialog with impact
    → executeRemoveMember()
      → Remove from workspaceMembers
      → removeFromAllInvites('register')
      → removeFromAllInvites('control')
      → removeFromAllInvites('report')
      → Track analytics
      → refreshAllComponents()
```

**Protection:**
- ❌ Cannot remove workspace owner
- ✅ Shows "Are you sure?" confirmation
- ✅ Shows detailed impact before deletion

## 3. Updating Member Roles

**What Happens:**
```
User changes role → Updates member → Syncs everywhere
```

**Roles:**
- `member` - Standard access
- `admin` - Administrative access
- `owner` - Workspace owner (only one)

**Code Flow:**
```javascript
ERM.settings.updateMemberRole(memberId, newRole)
  → ERM.teamSyncManager.updateMemberRole()
    → Update in workspaceMembers
    → Track analytics
    → refreshAllComponents()
```

## 4. Inviting to Risk Registers

**What Happens:**
```
Admin invites member to Risk Register → Stored in invites → Member sees register + linked controls
```

**Storage Pattern:**
- Risk registers: `invites_register_{registerId}` ✅ Has invites
- Controls: **No invites** - inherited from risk register
- Reports: `invites_report_{reportId}` ✅ Has separate sharing

**Roles for Risk Registers:**
- `viewer` - Read-only access to register and its controls
- `editor` - Can edit register and its controls
- `admin` - Full access to register and its controls

**Access Inheritance Example:**
```
Admin invites User A to "Financial Risks" register
→ User A sees "Financial Risks" in their risk register module
→ User A sees all controls linked to "Financial Risks" in their controls module
```

## 5. Sharing Reports

**What Happens:**
```
User clicks Share in report hamburger menu → Share modal opens → Select team members → Assign permissions → Report appears in member's reports module
```

**Storage Pattern:**
- Reports: `invites_report_{reportId}` - Separate from risk register access

**Roles for Reports:**
- `viewer` - Read-only access to view the report
- `editor` - Can edit and modify the report

**Sharing Example:**
```
Admin shares "Q4 Risk Analysis" report with User A (viewer role)
→ User A sees "Q4 Risk Analysis" in their reports module
→ User A can view but not edit the report
```

## 6. Billing Integration

**Seat Assignment:**
- New members automatically get a seat if available
- Removing members frees their seat
- Seats shown in billing tab with usage percentage

**Cost Calculation:**
```
Base: $29/mo (includes 3 seats)
Additional seats: +$10/seat/month
Max seats (Pro): 7

Example: 5 seats = $29 + (2 × $10) = $49/mo
```

## API Reference

### ERM.teamSyncManager

#### addMember(memberData)
```javascript
var member = ERM.teamSyncManager.addMember({
  name: "John Smith",
  email: "john@example.com",
  color: "#6366f1",
  role: "member",
  isOwner: false,
  status: "active"
});
// Returns: member object or null if no seats available
```

#### removeMember(memberId, skipConfirmation)
```javascript
ERM.teamSyncManager.removeMember("member-123", false);
// Shows confirmation, analyzes impact, cascading delete
```

#### updateMemberRole(memberId, newRole)
```javascript
ERM.teamSyncManager.updateMemberRole("member-123", "admin");
// Updates role and syncs everywhere
```

#### getMemberRemovalImpact(memberId)
```javascript
var impact = ERM.teamSyncManager.getMemberRemovalImpact("member-123");
// Returns: {
//   riskRegisters: 3,        // Direct invites
//   controls: 5,             // Inherited from those 3 registers
//   hasSeat: true,
//   totalImpact: 8           // riskRegisters + controls
// }
```

#### findMemberInvites(contextType, memberId)
```javascript
// NOTE: Only 'register' and 'report' are valid - controls don't have invites
var riskInvites = ERM.teamSyncManager.findMemberInvites("register", "member-123");
var reportShares = ERM.teamSyncManager.findMemberInvites("report", "member-123");
// Returns array of {itemId, itemName, role}
```

#### countControlsFromRiskRegisters(riskInvites)
```javascript
var riskInvites = ERM.teamSyncManager.findMemberInvites("register", "member-123");
var controlCount = ERM.teamSyncManager.countControlsFromRiskRegisters(riskInvites);
// Returns: number of controls linked to those risk registers
```

#### getSeatUsage()
```javascript
var usage = ERM.teamSyncManager.getSeatUsage();
// Returns: {
//   total: 5,
//   used: 3,
//   available: 2,
//   percentage: 60
// }
```

#### refreshAllComponents()
```javascript
ERM.teamSyncManager.refreshAllComponents();
// Refreshes: header, settings tab, billing card
```

## UI Components Updated

### 1. Header Team Dropdown
**Location:** Top right of every page
**Shows:** All workspace members with avatars
**Updated:** When members added/removed/role changed

### 2. Settings Team Tab
**Location:** Settings → Team
**Shows:** Full team list with roles and actions
**Actions:** Add member, remove member, change role

### 3. Billing Seats Card
**Location:** Profile → Billing
**Shows:**
- Seat usage bar (X of Y used)
- Pricing breakdown
- All team members with seat assignments
- Add/remove seats buttons

### 4. Invite/Share Modals
**Location:** Risk registers and reports
**Shows:** All workspace members
**Actions:**
- Risk registers: Invite/remove from register (controls inherit access)
- Reports: Share/unshare report with permissions (viewer/editor)

## Data Flow

### Member Addition
```
User Input → Validate → Check Seats → Create Member → Assign Seat → Save → Refresh UI
```

### Member Removal
```
User Action → Find Member → Analyze Impact → Show Confirmation → Delete → Cascade Delete → Free Seat → Refresh UI
```

### Invite to Risk Register
```
Open Modal → Show Members → Select Member → Set Role → Save Invite → Member Sees Register + Controls
```

**What Member Gets:**
- Access to the risk register
- Access to all controls linked to that register

### Share Report
```
Open Share Modal → Show Members → Select Member → Set Permission → Save Share → Report Appears in Member's Reports
```

**What Member Gets:**
- Access to the shared report with assigned permissions (viewer/editor)

## Storage Structure

### Workspace Members
```javascript
localStorage.workspaceMembers = [
  {
    id: "member-xxx",
    name: "John Smith",
    email: "john@example.com",
    color: "#6366f1",
    role: "member",
    isOwner: false,
    addedBy: "owner-id",
    addedByName: "Owner Name",
    status: "active",
    hasSeat: true,
    addedAt: "2024-01-15T10:30:00Z"
  }
]
```

### Risk Register Invites
```javascript
localStorage.invites_register_{registerId} = [
  {
    memberId: "member-xxx",
    role: "editor",  // viewer, editor, or admin
    invitedAt: "2024-01-15T10:30:00Z"
  }
]

// Controls don't have invites - they check parent risk register:
// if (userHasAccessToRegister(control.riskRegisterId)) → show control
```

### Report Shares
```javascript
localStorage.invites_report_{reportId} = [
  {
    memberId: "member-xxx",
    role: "viewer",  // viewer or editor
    invitedAt: "2024-01-15T10:30:00Z"
  }
]
```

### Plan & Seats
```javascript
localStorage.ERM_plan = "PRO"
localStorage.ERM_teamSize = "5"  // Total seats
```

## Analytics Tracking

All team operations are tracked:
```javascript
{
  source: "team_management",
  feature: "add_member" | "remove_member" | "update_role",
  action: "member_added" | "member_removed" | "role_changed",
  data: { memberId, impact }
}
```

## Error Handling

### No Seats Available
Shows upgrade modal with:
- Current plan details
- Seat pricing (+$10/seat)
- Upgrade button

### Cannot Remove Owner
```javascript
if (member.isOwner) {
  ERM.toast.error('Cannot remove workspace owner');
  return;
}
```

### Duplicate Email
```javascript
if (email exists) {
  ERM.toast.error('A member with this email already exists');
  return;
}
```

## Integration Points

### Files Modified
1. `assets/js/core/team-sync-manager.js` - Central sync manager with report sharing support
2. `assets/js/team.js` - Updated to use sync manager
3. `assets/js/modules/settings.js` - Updated to use sync manager
4. `assets/js/modules/reports/reports.js` - Updated shareReport to use team invite modal
5. `index.html` - Added team-sync-manager.js and plan-limits.css
6. `profile.html` - Added team-sync-manager.js script

### Components That Use It
- Header team dropdown (`components.js`)
- Settings team tab (`settings.js`)
- Billing seats card (`billing-management.js`)
- Risk register invite modals (`team.js`)
- Report share modal (`team.js` + `reports.js`)

## Testing Checklist

- [ ] Add member when seats available
- [ ] Add member when no seats (shows upgrade)
- [ ] Remove member (shows confirmation + impact)
- [ ] Remove member cascades to all invites
- [ ] Cannot remove owner
- [ ] Update member role syncs everywhere
- [ ] Invite member to risk register
- [ ] Share report with team member
- [ ] Report appears in shared member's reports module
- [ ] Remove member removes from all registers and reports
- [ ] Billing card shows correct seat usage
- [ ] Header dropdown updates immediately
- [ ] Settings tab updates immediately
- [ ] Duplicate email prevented

## Best Practices

1. **Always use sync manager** - Don't modify workspaceMembers directly
2. **Check seats before adding** - Prevent over-allocation
3. **Show impact before deleting** - Users should know consequences
4. **Track analytics** - Every operation logged for admin review
5. **Refresh UI immediately** - Users see changes right away

## Future Enhancements

- Email invitations with magic links
- Bulk member import from CSV
- Role-based permissions per feature
- Member activity dashboard
- Automated seat optimization
- Member suspension (soft delete)
- Transfer ownership workflow

# AI Call Limits by Plan

## Overview

The AI chat system enforces different limits based on user plan tier to provide value to FREE users while incentivizing upgrades.

---

## Plan Limits

### FREE Plan (Default)
- **AI Calls:** 50 TOTAL (lifetime, not per month)
- **Enforcement:** HARD LIMIT - blocked after 50 calls
- **Counter Display:** "X of 50" (e.g., "5 of 50", "49 of 50")
- **At Limit:** Shows upgrade modal, blocks further calls

### PRO Plan
- **AI Calls:** UNLIMITED
- **Enforcement:** No limits
- **Counter Display:** "X calls" (e.g., "127 calls")
- **Benefit:** Unlimited AI assistance with no restrictions

### ENTERPRISE Plan
- **AI Calls:** UNLIMITED
- **Enforcement:** No limits
- **Counter Display:** "X calls" (e.g., "450 calls")
- **Benefit:** Unlimited AI assistance with no restrictions

---

## How It Works

### Counter System

```javascript
// In plan-config.js
FREE: {
  aiCalls: 50  // TOTAL for entire FREE plan (not per month)
}

PRO: {
  aiCalls: -1  // Unlimited (-1 = no limit)
}

ENTERPRISE: {
  aiCalls: -1  // Unlimited (-1 = no limit)
}
```

### Enforcement Flow

```
User sends AI message
       ↓
ERM.aiCounter.canMakeCall()
       ↓
   Check plan
       ↓
┌──────┴──────┐
│             │
FREE          PRO/ENTERPRISE
│             │
Check count   Always allowed
│             │
< 50?         No counter check
│             │
├─ YES → Allow
│  └─ Increment counter
│
└─ NO → Block
   └─ Show upgrade modal
```

---

## Implementation Details

### 1. Counter Storage

```javascript
// localStorage key
'erm_aiCallCount' = 12  // Current count

// Only incremented for FREE plan
// PRO/ENTERPRISE tracks but doesn't enforce
```

### 2. Limit Checking

```javascript
// Before API call (floating-ai-insight.js)
if (ERM.aiCounter) {
  var canCall = ERM.aiCounter.canMakeCall();

  if (!canCall.allowed) {
    // FREE user at limit
    this.addAIMessage(canCall.message + ' ' + canCall.upgradeMessage);
    ERM.aiCounter.showLimitModal();
    return; // BLOCK the API call
  }
}

// Proceed with API call...
```

### 3. Counter Increment

```javascript
// After successful API response
.then(function(response) {
  if (ERM.aiCounter) {
    ERM.aiCounter.increment();  // Increment count
    ERM.aiCounter.updateDisplays();  // Update UI badges
  }
  self.addAIMessage(response);
})
```

### 4. Display Logic

```javascript
// ai-counter.js
getDisplayText: function() {
  var count = this.getCount();
  var limit = this.getLimit();

  if (limit === -1) {
    return count + ' calls';  // PRO/ENTERPRISE: "127 calls"
  }

  return count + ' of ' + limit;  // FREE: "5 of 50"
}
```

---

## UI Elements

### Floating AI Button Badge

**FREE Plan:**
```
┌─────────────────┐
│  AI  [5 of 50]  │  ← Shows usage and limit
└─────────────────┘
```

**PRO/ENTERPRISE Plan:**
```
┌──────────────┐
│  AI  [127]   │  ← Shows usage only (no limit)
└──────────────┘
```

### Color States

- **Normal:** White/transparent background
- **Near Limit (≤10 remaining):** Yellow background (#fbbf24)
- **At Limit (0 remaining):** Red background (#ef4444)

```css
.floating-ai-counter {
  background: rgba(255, 255, 255, 0.2);  /* Normal */
}

.floating-ai-counter.near-limit {
  background: #fbbf24;  /* Yellow - 10 or fewer remaining */
  color: #78350f;
}

.floating-ai-counter.at-limit {
  background: #ef4444;  /* Red - 0 remaining */
  color: #fff;
}
```

---

## Upgrade Modal

When FREE user reaches 50 calls:

```
┌─────────────────────────────────────────┐
│  ⚠️  AI Call Limit Reached              │
│                                         │
│  You've used all 50 AI calls on the    │
│  FREE plan.                             │
│                                         │
│  Upgrade to Pro for unlimited AI        │
│  assistance and insights.               │
│                                         │
│  [Cancel]  [Upgrade Now]                │
└─────────────────────────────────────────┘
```

---

## Plan Comparison

| Feature | FREE | PRO | ENTERPRISE |
|---------|------|-----|------------|
| **AI Calls** | 50 total | Unlimited | Unlimited |
| **Counter Display** | "X of 50" | "X calls" | "X calls" |
| **At Limit** | Blocked | Never | Never |
| **Upgrade Prompt** | Yes | No | No |
| **Token Optimization** | Yes | Yes | Yes |
| **Session Persistence** | Yes | Yes | Yes |

---

## Token Optimization (All Plans)

All plans benefit from token optimization:

### FREE Plan Benefits
- 50 calls → 5-7 full conversations (7-10 exchanges each)
- Each call costs 68-85% fewer tokens
- Better UX with persistent chat

### PRO/ENTERPRISE Benefits
- Unlimited calls with optimized token usage
- Lower API costs for platform
- Faster responses (smaller payloads)

**Example Cost Savings:**

**Without Optimization:**
- 10 messages × 3,000 tokens = 30,000 tokens
- At $0.001/1K tokens = $0.030 per conversation

**With Optimization:**
- 10 messages averaging 940 tokens = 9,400 tokens
- At $0.001/1K tokens = $0.009 per conversation
- **Savings: $0.021 per conversation (70%)**

For PRO users with 1,000 conversations:
- Without: $30.00
- With: $9.00
- **Savings: $21.00 per month**

---

## Testing Scenarios

### Test 1: FREE User Approaching Limit

```javascript
// Set counter to 48
localStorage.setItem('erm_aiCallCount', '48');

// Send 3 messages
// Message 1: Allowed (49/50) - counter turns yellow
// Message 2: Allowed (50/50) - counter turns red
// Message 3: BLOCKED - upgrade modal shown
```

### Test 2: FREE User Switches Modules

```javascript
// Dashboard: 25/50 calls used
// Switch to Risk Register
// Verify: Counter still shows 25/50
// Verify: Chat history persists
// Send message: Increments to 26/50
```

### Test 3: PRO User

```javascript
// Simulate PRO plan
var workspace = ERM.state.workspace;
workspace.plan = 'PRO';
ERM.storage.set('erm_currentWorkspace', workspace);

// Send 100 messages
// All allowed, counter shows "100 calls" (no limit)
```

### Test 4: Plan Upgrade

```javascript
// Start as FREE with 45/50 used
// Upgrade to PRO
ERM.upgradeFlow.completeUpgrade('PRO', {...});

// Counter changes from "45 of 50" to "45 calls"
// All limits removed
// Continue using AI without restrictions
```

---

## Edge Cases

### 1. Counter at Exactly 50

```javascript
// User at 50/50
canMakeCall() returns:
{
  allowed: false,
  count: 50,
  limit: 50,
  remaining: 0,
  atLimit: true,
  message: "You've used all 50 AI calls on the FREE plan.",
  upgradeMessage: "Upgrade to Pro for unlimited AI assistance."
}
```

### 2. API Call Fails

```javascript
// Counter only increments on SUCCESS
callDeepSeekAPI()
  .then(success → increment counter)  ✓
  .catch(error → NO increment)        ✗

// Failed calls don't count against limit
```

### 3. Concurrent Messages

```javascript
// User sends message while one is processing
if (this.state.isProcessing) return;  // Blocked

// Only one message processed at a time
// No race conditions on counter
```

---

## Best Practices

### For FREE Users
- Clear chat periodically to optimize token usage
- Use token optimization (enabled by default)
- Combine related questions in single message
- Upgrade when hitting limit frequently

### For PRO/ENTERPRISE Users
- Unlimited calls but still optimized for speed
- No counter concerns
- Can use AI freely without restrictions

---

## Migration Path

### FREE → PRO Upgrade

```javascript
// Before upgrade
Plan: FREE
AI Calls: 48 of 50
Status: Near limit (yellow badge)

// After upgrade via ERM.upgradeFlow.completeUpgrade('PRO', {...})
Plan: PRO
AI Calls: 48 calls (unlimited)
Status: No limit (normal badge)
Counter: Keeps count but no enforcement
```

### Reset Counter (Admin Only)

```javascript
// For testing or special cases
ERM.aiCounter.reset();
// Sets counter back to 0
```

---

## Summary

✅ **FREE Plan:** 50 total AI calls (lifetime), hard limit enforced
✅ **PRO Plan:** Unlimited AI calls
✅ **ENTERPRISE Plan:** Unlimited AI calls
✅ **Token Optimization:** All plans save 68-85% tokens
✅ **Session Persistence:** Chat survives module switches
✅ **Smart Enforcement:** Blocks only FREE users at limit
✅ **Clear Upgrade Path:** Modal shown when limit reached

The system provides generous value to FREE users while creating clear incentive to upgrade for power users!

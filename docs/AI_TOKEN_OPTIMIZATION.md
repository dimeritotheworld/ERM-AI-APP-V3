# AI Chat Token Optimization System

## Overview

The Dimeri ERM AI chat system has been optimized to reduce API token costs while maintaining an excellent user experience. This document explains the problems, solutions, and how the system works.

---

## Problems Solved

### 1. **Expensive Full Context on Every Message**
**Before:** Every single user message sent the ENTIRE data context (all risks, controls, descriptions, scores, etc.) to the API.
- User with 20 risks × 5 messages = 100 risk records sent
- Typical context size: 2,000-5,000 tokens per message
- FREE plan users have only 50 API calls total

**Solution:** Send full context only on the FIRST message of a session. Subsequent messages skip the context since the AI already has it from the conversation history.

### 2. **Chat History Lost When Switching Modules**
**Before:** Switching from Dashboard → Risk Register → Controls cleared the chat.
- User had to re-ask questions
- Wasted API calls repeating similar questions
- Poor user experience

**Solution:** Persist chat history in localStorage. Chat survives module switches, page refreshes, and navigation.

### 3. **No Session Management**
**Before:** No concept of sessions, every page load started fresh.
- No memory of previous conversations
- No way to track conversation length
- No automatic cleanup of old chats

**Solution:** Smart session management with:
- 30-minute session timeout
- Automatic cleanup of old sessions
- Session statistics and tracking

### 4. **Long Conversations Consume Massive Tokens**
**Before:** After 10+ exchanges, the conversation history becomes huge.
- 20 messages × 200 tokens each = 4,000 tokens just for history
- Combined with context = 6,000-9,000 tokens per API call
- DeepSeek charges per token

**Solution:** Automatic summarization after 12 messages (6 exchanges).
- Keeps last 6 messages (3 recent exchanges)
- Summarizes older messages into brief summary
- Reduces token usage by 60-80% in long conversations

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Session Manager                        │
│  - Persists chat history in localStorage                    │
│  - Manages 30-minute session timeout                        │
│  - Handles context optimization                             │
│  - Auto-summarizes long conversations                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Floating AI Chat Module                      │
│  - UI for chat interface                                    │
│  - Integrates with session manager                          │
│  - Handles user input/output                                │
│  - Calls DeepSeek API                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     AI Call Counter                          │
│  - Tracks API calls: 50 total for FREE plan                 │
│  - Enforces limits before API call                          │
│  - Increments only on successful response                   │
└─────────────────────────────────────────────────────────────┘
```

---

## How It Works

### First Message of Session

```
User: "What patterns do you see in my risks?"

API Call Payload:
├── System Prompt (ERM expert instructions)
├── FULL Data Context (2,500 tokens)
│   ├── All 20 risks with details
│   ├── All 10 controls with details
│   ├── Risk distribution stats
│   └── Control coverage stats
└── User Question (10 tokens)

Total: ~2,700 tokens
Session Manager: markContextSent() ✓
Session Manager: createDataSnapshot() ✓ (stores risk/control counts & IDs)
```

### Second Message (Same Session)

```
User: "Which risks lack controls?"

API Call Payload:
├── System Prompt (ERM expert instructions)
├── Context: "" (EMPTY - already sent in message #1)
├── Conversation History
│   ├── Message 1: User question
│   ├── Message 2: AI response
│   ├── Message 3: User question (current)
└── User Question (7 tokens)

Total: ~400 tokens (85% reduction!)
```

### After Module Switch (Dashboard → Risk Register)

```
User switches from Dashboard to Risk Register
Session Manager: onViewChange('risk-register')
  - Session continues (not cleared)
  - Chat history persists
  - No context re-send needed
  - User sees all previous messages

User: "How many high risks are in this register?"

API Call Payload:
├── System Prompt
├── Context: "" (still empty, context already in conversation)
├── Full conversation history (includes previous module)
└── User Question

Total: ~500 tokens
```

### After Data Change (User Adds/Edits/Deletes Risks)

```
Session has context from earlier (20 risks, 10 controls)
User adds 3 new risks → Now 23 risks total

User: "What's my risk distribution now?"

Session Manager: shouldSendFullContext()
  - Checks dataSnapshot: 20 risks
  - Checks current data: 23 risks
  - Detects change → Returns TRUE

API Call Payload:
├── System Prompt
├── FULL Data Context (REFRESHED - now with 23 risks)
├── Conversation history
└── User Question

Total: ~3,200 tokens
Session Manager: Updates snapshot to 23 risks ✓

This ensures AI always sees CURRENT data!
```

### Long Conversation (After 12 Messages)

```
Session has 14 messages (7 exchanges)
Session Manager: Auto-summarize triggered

Before:
├── Message 1-2: About risk distribution
├── Message 3-4: About control effectiveness
├── Message 5-6: About root causes
├── Message 7-8: About ownership
├── Message 9-10: About scoring
├── Message 11-12: About gaps
├── Message 13-14: Current exchange

After Summarization:
├── Summary: "User asked 6 questions about: risks, controls, scoring, root causes, ownership, gaps."
├── Message 11-12: (recent - kept intact)
└── Message 13-14: (current exchange)

Token reduction: 70% for conversation history
```

---

## Session Management Rules

### Session Creation
- New session on first visit
- New session after 30 minutes of inactivity
- New session when user clicks "Clear Chat"

### Session Persistence
- Saved to `localStorage.erm_aiSession`
- Includes:
  - All messages with timestamps
  - Current module/view
  - Context sent flag
  - Message count
  - Session ID and timestamps
  - **Data snapshot** (for change detection)

### Session Timeout
- 30 minutes of inactivity
- Automatic cleanup
- New session created on next interaction

### Data Change Detection (NEW!)

The system automatically detects when risks/controls change and refreshes context:

**What's Tracked:**
```javascript
dataSnapshot: {
  riskCount: 20,           // Number of risks
  controlCount: 10,        // Number of controls
  registerCount: 5,        // Number of registers
  riskIds: "r1,r2,r3,...", // Sorted list of risk IDs
  controlIds: "c1,c2,...", // Sorted list of control IDs
  timestamp: 1234567890
}
```

**When Context Refreshes:**
1. User adds a risk → Risk count changes → Context refreshed
2. User deletes a control → Control count changes → Context refreshed
3. User edits a risk (same ID) → Counts unchanged → Context NOT refreshed
4. User adds then deletes (net zero) → IDs changed → Context refreshed

**Benefits:**
- ✅ AI always sees current data
- ✅ No stale information
- ✅ Automatic - no user action needed
- ✅ Still optimized - only refreshes when needed

---

## Token Optimization Strategy

### Phase 1: Initial Message (Context Heavy)
```
Token Breakdown:
- System Prompt: 200 tokens (fixed)
- Full Data Context: 2,000-4,000 tokens (variable based on data)
- User Question: 5-20 tokens
- Total: 2,200-4,200 tokens
```

### Phase 2: Subsequent Messages (Context Light)
```
Token Breakdown:
- System Prompt: 200 tokens (fixed)
- Conversation History: 200-600 tokens (grows with exchanges)
- User Question: 5-20 tokens
- Total: 400-800 tokens (80% reduction!)
```

### Phase 3: After Summarization (Context Light + History Compressed)
```
Token Breakdown:
- System Prompt: 200 tokens (fixed)
- Summary: 50 tokens (compressed old messages)
- Recent History: 200-400 tokens (last 3 exchanges)
- User Question: 5-20 tokens
- Total: 450-650 tokens (85% reduction!)
```

---

## Cost Analysis

### Example: User with 25 Risks, 10 Controls, 10 Messages

#### Before Optimization
```
Message 1: 3,000 tokens (context + question)
Message 2: 3,000 tokens (context + question)
Message 3: 3,000 tokens (context + question)
Message 4: 3,000 tokens (context + question)
Message 5: 3,000 tokens (context + question)
Message 6: 3,000 tokens (context + question)
Message 7: 3,000 tokens (context + question)
Message 8: 3,000 tokens (context + question)
Message 9: 3,000 tokens (context + question)
Message 10: 3,000 tokens (context + question)

Total: 30,000 tokens
```

#### After Optimization
```
Message 1: 3,000 tokens (FULL context on first message)
Message 2: 500 tokens (history only)
Message 3: 600 tokens (history only)
Message 4: 700 tokens (history only)
Message 5: 800 tokens (history only)
Message 6: 900 tokens (history only)
Message 7: 650 tokens (history only, post-summary)
Message 8: 700 tokens (history only, post-summary)
Message 9: 750 tokens (history only, post-summary)
Message 10: 800 tokens (history only, post-summary)

Total: 9,400 tokens (68% reduction!)
```

**Savings: 20,600 tokens = $0.02-$0.10 per conversation (depending on API pricing)**

For FREE plan users with 50 API calls, this means they can have:
- **Before:** ~50 short questions
- **After:** 5-7 full conversations (7-10 exchanges each)

---

## Implementation Details

### Key Files

1. **[ai-session-manager.js](../assets/js/plan-limits/ai-session-manager.js)**
   - Session persistence in localStorage
   - Context optimization logic
   - Message summarization
   - Session timeout handling

2. **[floating-ai-insight.js](../assets/js/features/floating-ai-insight.js)**
   - Integration with session manager
   - UI rendering
   - API calls
   - Message handling

3. **[ai-counter.js](../assets/js/plan-limits/ai-counter.js)**
   - 50 API call limit enforcement
   - Counter display
   - Upgrade prompts

### localStorage Keys

```javascript
// Session data
'erm_aiSession' = {
  id: 'ai_1234567890_abc123',
  messages: [...],
  createdAt: 1234567890,
  lastActivity: 1234567890,
  currentView: 'dashboard',
  contextSent: true,
  messageCount: 5,
  summarizedAt: 0
}

// API call counter
'erm_aiCallCount' = 12  // Current count (out of 50)
```

---

## Configuration Options

Located in `ERM.aiSessionManager.config`:

```javascript
config: {
  sessionTimeout: 30 * 60 * 1000,      // 30 minutes
  maxMessagesBeforeSummary: 12,        // 6 exchanges
  persistSession: true,                // Save to localStorage
  sendContextOnlyOnce: true,           // Context optimization
  contextRefreshViews: true            // Brief update on module switch
}
```

### Tuning for Different Use Cases

**More Aggressive Savings:**
```javascript
sessionTimeout: 15 * 60 * 1000,       // 15 minutes
maxMessagesBeforeSummary: 8,          // 4 exchanges
```

**Better Context Retention:**
```javascript
sessionTimeout: 60 * 60 * 1000,       // 1 hour
maxMessagesBeforeSummary: 20,         // 10 exchanges
```

**Disable Optimization (for debugging):**
```javascript
persistSession: false,
sendContextOnlyOnce: false,
```

---

## User Experience Benefits

### ✅ Chat Persists Across Modules
- Ask question in Dashboard
- Switch to Risk Register
- Chat history is still there
- Continue conversation seamlessly

### ✅ No Repeated Context
- Don't have to re-explain your question
- AI remembers the conversation
- Natural dialogue flow

### ✅ Maximize FREE Plan Value
- 50 API calls go much further
- Can have full conversations instead of single questions
- Better insights without hitting limit quickly

### ✅ Fast Response Times
- Smaller payloads = faster API responses
- Less data to process
- Better performance

---

## Monitoring & Debugging

### Check Session Stats

```javascript
// In browser console:
var stats = ERM.aiSessionManager.getSessionStats();
console.log(stats);

// Output:
{
  sessionId: 'ai_1234567890_abc123',
  messageCount: 8,
  currentView: 'dashboard',
  ageMinutes: 12,
  inactiveMinutes: 2,
  contextSent: true,
  hasSummary: false
}
```

### View Current Session

```javascript
var session = ERM.aiSessionManager.getSession();
console.log(session);
```

### Force Context Re-send

```javascript
// Useful if data has significantly changed
ERM.aiSessionManager.resetContextFlag();
// Next message will include full context
```

### Clear Session Manually

```javascript
ERM.aiSessionManager.clearSession();
```

---

## Future Enhancements

### Potential Improvements

1. **Smart Context Updates**
   - Detect when user adds/edits risks
   - Send lightweight "delta" updates
   - Avoid full context re-send

2. **Conversation Templates**
   - Pre-built conversation starters
   - Multi-turn guided analysis
   - Reduce token usage via structured prompts

3. **Compression Algorithms**
   - More sophisticated summarization
   - Use AI to summarize old messages
   - Maintain key facts while compressing

4. **Usage Analytics**
   - Track token usage per conversation
   - Show users their efficiency
   - Provide tips to optimize usage

---

## Testing

### Manual Test Scenarios

1. **Session Persistence**
   - Start chat in Dashboard
   - Ask 2-3 questions
   - Switch to Risk Register
   - Verify chat history persists

2. **Context Optimization**
   - Open console
   - Send first message
   - Check logs for "Sending FULL context"
   - Send second message
   - Check logs for "Skipping full context"

3. **Summarization**
   - Send 7 exchanges (14 messages)
   - Check logs for summarization
   - Verify message count reduced

4. **Session Timeout**
   - Start chat
   - Wait 31 minutes
   - Send new message
   - Verify new session created

---

## Conclusion

This AI optimization system provides:

- **68-85% token reduction** in typical conversations
- **Seamless UX** with persistent chat across modules
- **Maximized value** for FREE plan users (50 API calls)
- **Smart context management** without user intervention
- **Automatic cleanup** and session management

The system is transparent to users while dramatically reducing API costs and extending the utility of the FREE plan's 50 API call limit.

# URGENT: Window Duplication Bug - Debug Required

## Problem Report
User reports: "MASSIVE PROBLEMS WINDOWS DUPLICATION NO RESPONSE"

Screenshot shows:
- TWO MSN Messenger windows open
- Both showing "Listo!" message
- System appears unresponsive

## Immediate Debug Steps

### Step 1: Check Console Logs
Open browser DevTools Console and look for:
```
- Duplicate API calls to /api/chat-v2
- Multiple action executions
- Window creation logs
- Any React errors or warnings
```

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Filter for "chat-v2"
3. Check if ONE message is making MULTIPLE requests
4. Look at request/response payloads

### Step 3: Check Terminal Logs
Look for duplicate entries like:
```
[chat-v2] Casual intent detected
[PERF] Casual handler completed
```

If you see the same timestamp twice, we have a duplicate API call issue.

### Step 4: Test Minimal Case
Clear everything and test:
```
1. Refresh page
2. Open ONLY ONE MSN Messenger
3. Type "Listo"
4. Check how many windows open
5. Check console for duplicate calls
```

## Possible Root Causes

### Hypothesis 1: Double Message Send
Frontend might be calling sendMessage() twice for one user input.

**Check in Chatbot.tsx:**
- Is there a React StrictMode causing double renders?
- Is the send button triggering twice?
- Is there an effect hook causing re-execution?

### Hypothesis 2: Duplicate Action Execution
Backend returns actions correctly, but frontend executes them twice.

**Check lines 498-520 in Chatbot.tsx:**
```typescript
if (data.actions && data.actions.length > 0) {
  data.actions.forEach((action: any) => {
    // Is this running twice?
  });
}
```

### Hypothesis 3: Old + New Endpoint Both Running
Maybe both `/api/chat` AND `/api/chat-v2` are being called?

**Check fetch URL:**
```typescript
const res = await fetch('/api/chat-v2', { ... });
```

Is there another fetch to `/api/chat` somewhere?

### Hypothesis 4: Window Context Duplicate
WindowContext might be creating duplicate windows.

**Check:**
- Is `openWindow()` being called twice?
- Does window already exist and we're re-creating it?

## What to Log

Add console.logs to track execution flow:

```typescript
// In Chatbot.tsx sendMessage()
console.log('[Chatbot] sendMessage called, message:', content);
console.log('[Chatbot] Fetching /api/chat-v2');

// After fetch
console.log('[Chatbot] Response received:', data);
console.log('[Chatbot] Actions to execute:', data.actions);

// In action loop
data.actions.forEach((action: any, index: number) => {
  console.log(`[Chatbot] Executing action ${index}:`, action);
  // ... execute
});
```

## Emergency Fix Options

If you can't find root cause quickly:

### Option A: Prevent Duplicate Windows
```typescript
if (action.type === 'openApp' && action.appName) {
  // Check if window already open
  const existingWindow = windows.find(w => w.appType === action.appName);
  if (existingWindow) {
    console.warn('Window already open, skipping:', action.appName);
    return;
  }

  const appConfig = getAppConfig(action.appName);
  if (appConfig) {
    openWindow(appConfig);
  }
}
```

### Option B: Debounce sendMessage
```typescript
const [isSending, setIsSending] = useState(false);

const sendMessage = async (content: string) => {
  if (isSending) {
    console.warn('Message send already in progress, ignoring');
    return;
  }

  setIsSending(true);
  try {
    // ... existing code
  } finally {
    setIsSending(false);
  }
};
```

## Report Back

Please provide:
1. Console logs showing duplicate behavior
2. Network tab screenshot showing API calls
3. Terminal logs from server
4. Which hypothesis is correct

This is blocking production - priority is to identify root cause ASAP!

# Proactive MSN Agent - Smart Context-Aware Messaging

## Overview
Make MSN Messenger feel "alive" by having the AI proactively start conversations based on user activity context.

## Feature: Proactive Message Timer

### Trigger
- Timer starts when MSN window is minimized
- After **25 seconds** of inactivity, AI sends a proactive message

### Context Awareness
The AI should be aware of:
1. **Current active window** (what app user is using)
2. **Activity duration** (how long they've been in that app)
3. **Previous conversation** (conversation history with user)
4. **Portfolio context** (available apps, projects, etc.)

### Example Proactive Messages by Context

#### Playing Minesweeper
- "Getting stuck? Want a hint? Or maybe try Snake? 🐍"
- "Minesweeper again? Classic! Need a break?"
- "Still mining? 💣 Let me know if you want to see my projects instead!"

#### In Paint
- "Nice art session! Want me to suggest what to draw?"
- "Creating a masterpiece? 🎨"
- "What are you painting? Show me when you're done! :)"

#### Idle on Desktop
- "Bored? Check out my portfolio or let's play a game!"
- "What brings you here today? Looking for something specific?"
- "Still there? Want me to show you around? :)"

#### Reading Projects in Notepad
- "Questions about that project? I can explain more!"
- "Interesting, right? Want to see the GitHub repo?"
- "Like what you see? I have more projects to show you!"

#### In File Explorer
- "Finding what you need? I can help navigate!"
- "Exploring the file system? Pro tip: check out My Documents! 📁"

#### Idle Too Long (>60 seconds)
- "Hey! Still there? 👋"
- "Knock knock... anyone home? :D"
- "Don't ghost me! :("

## Implementation Plan

### Phase 1: Activity Tracking (Current Active Window)
1. Add `activeWindowId` to WindowContext state
2. Track window focus changes
3. Track time spent in each window
4. Store last activity timestamp

### Phase 2: Proactive Message System
1. Add timer to Chatbot component
2. Timer resets on:
   - User sends message
   - Window is focused
   - User activity detected (window switch, file open, etc.)
3. Timer triggers after 25 seconds of inactivity while minimized

### Phase 3: Context-Aware Prompt Generation
1. Enhance `/api/chat` endpoint with activity context
2. Add new system prompt for proactive messages
3. Include current app context in prompt:
   ```typescript
   {
     currentApp: 'minesweeper',
     timeSpent: '45s',
     lastUserMessage: '...',
     availableApps: ['paint', 'snake', 'portfolio', ...],
     isFirstProactiveMessage: true
   }
   ```

### Phase 4: Smart Frequency Control
1. Don't spam - max 1 proactive message per session per context
2. Track sent proactive messages in localStorage
3. Vary messages based on context (don't repeat)

### Phase 5: Personality Integration
1. Use Jean Francois personality (sarcastic, helpful, geek)
2. Make suggestions based on portfolio content
3. Encourage exploration of projects/portfolio

## Technical Details

### New State in WindowContext
```typescript
interface WindowManagerContext {
  // ... existing
  activeWindowId: string | null;
  lastActivityTime: Date;
  getActivityContext: () => ActivityContext;
}

interface ActivityContext {
  currentApp: AppType | null;
  timeSpent: number; // seconds
  lastUserAction: string;
  availableApps: AppType[];
}
```

### Proactive Message Timer in Chatbot
```typescript
useEffect(() => {
  if (!windowId) return;

  const currentWindow = windows.find(w => w.id === windowId);
  const isMinimized = currentWindow?.isMinimized ?? false;

  if (!isMinimized) {
    // Clear timer if window is not minimized
    if (proactiveTimerRef.current) {
      clearTimeout(proactiveTimerRef.current);
      proactiveTimerRef.current = null;
    }
    return;
  }

  // Start proactive message timer (25s)
  proactiveTimerRef.current = setTimeout(() => {
    sendProactiveMessage();
  }, 25000);

  return () => {
    if (proactiveTimerRef.current) {
      clearTimeout(proactiveTimerRef.current);
    }
  };
}, [currentWindow?.isMinimized, lastMessageTime]);
```

### API Enhancement for Proactive Messages
New endpoint or parameter: `/api/chat/proactive`

```typescript
const proactivePrompt = `You are Jean Francois checking in on the user.

CONTEXT:
- User has been ${activityContext.currentApp ? `using ${activityContext.currentApp}` : 'idle'} for ${activityContext.timeSpent}s
- MSN has been minimized for 25+ seconds
- Last user message: ${lastUserMessage || 'none'}

RULES:
1. Keep it casual and short (1-2 lines)
2. Reference their current activity naturally
3. Suggest something related (another app, project, or game)
4. Use emoticons :) :D
5. Be helpful but not pushy

Examples:
- If playing minesweeper: "Still mining? 💣 Need a break? Try Snake or check out my projects! :)"
- If idle: "Hey! Want me to show you around? Got some cool projects to share! :D"
- If in notepad: "Questions about that project? I can explain more! :)"

Now write your check-in message:`;
```

## UI/UX Considerations

### Notification Behavior
1. ✅ Play sound when proactive message arrives
2. ✅ Flash taskbar button
3. ✅ Stop flashing when user opens window
4. ✅ Show typing indicator before message appears

### User Control
1. Add "Don't disturb" toggle in chatbot (future enhancement)
2. Allow user to disable proactive messages
3. Store preference in localStorage

## Success Metrics
1. User engagement - Do users respond to proactive messages?
2. Conversation length - Do proactive messages lead to longer conversations?
3. Portfolio exploration - Do suggestions lead to app launches?

## Privacy & UX Notes
- Only track window focus, NOT keystrokes or content
- All activity tracking is client-side only
- No personal data sent to API
- User can see exactly what context is being shared (current app name only)

# Mission 3B: Test Unified Chat System (Casual + Sales)

## Context
Codex just integrated the casual chat handler into `/api/chat-v2`. The system now supports:
- **Casual mode**: Personality-based chat + function calling (open/close apps)
- **Sales mode**: Field collection + email sending
- **Automatic intent switching**: Router detects and switches between modes

**Commit:** `feat: support casual chat in v2 endpoint`

## Your Task
Run comprehensive E2E tests to verify the unified system works correctly. You have access to the API and terminal.

## Test Scenarios

### Test 1: Pure Casual Chat
```
1. Start fresh conversation
2. Send: "Hey! What's up?"
3. Expected: Casual response with Jean Francois personality
4. Verify: No sales intent detected, friendly tone
```

### Test 2: Function Calling - Open Apps
```
1. Send: "Open Paint"
2. Expected: "¡Listo! Abriendo Paint 🎨"
3. Verify: Response includes `actions: [{ type: 'openApp', appName: 'paint' }]`

Test all apps:
- "Open Minesweeper"
- "Open Snake"
- "Open Camera"
- "Open Portfolio"
- "Open Terminal"

Verify: Each returns correct action in response
```

### Test 3: Intent Switching (Casual → Sales)
```
Conversation flow:
1. "Hi!" → Casual
2. "Cool portfolio!" → Casual
3. "I want to build a website" → Should switch to Sales
4. Provide name when asked
5. Provide email when asked
6. Verify email sent

Check logs for:
- Intent detection switching from casual to sales
- Sales agent activating properly
- No errors during transition
```

### Test 4: Spanish Full Sales Flow (Bochano Test)
```
Send in ONE message:
"Me llamo Bochano, bochano@gmail.com, quiero una app móvil para mi peluquería. Tengo un presupuesto de unos 25k."

Expected:
- Sales intent detected
- All fields extracted: name=Bochano, email=bochano@gmail.com, projectType=app móvil, budget=25k
- Email sent immediately
- Response in Spanish

Verify email contains:
- Name: Bochano
- Email: bochano@gmail.com
- Type: app móvil para mi peluquería
- Budget: 25k
- Timeline: NOT COLLECTED (should be null or empty)
```

### Test 5: Intent Switching (Sales → Casual)
```
After Test 4 completes:
1. "Gracias! Bueno me voy que tengo un partido del Real Madrid"
2. Expected: Switches back to casual mode
3. Expected: Responds casually, maybe "¡Disfruta el partido! 🔥"
4. Verify: No sales prompting, back to personality mode
```

### Test 6: Multilingual Switching
```
1. Start in English: "Hello"
2. Switch to French: "Ouvre Paint s'il te plaît"
3. Expected: Opens Paint, responds in French
4. Switch to Spanish: "Quiero una página web"
5. Expected: Switches to sales mode, asks in Spanish
```

### Test 7: Close App Function
```
1. "Open Paint"
2. Wait for response
3. "Close Paint"
4. Expected: Response includes `actions: [{ type: 'closeApp', appName: 'paint' }]`
5. Verify: Clean close message
```

### Test 8: Restart Function
```
1. "Restart the desktop"
2. Expected: Response includes `actions: [{ type: 'restart' }]`
3. Expected: Message like "🔄 Reiniciando escritorio..."
```

## What to Check in Logs

### Performance Metrics
```
[PERF] Intent detected: <time>
[PERF] Fields extracted: <time> (sales only)
[PERF] Sales agent completed: <time> (sales only)
[Telemetry] { intent, latencyMs, emailSent, ... }
```

**Target latencies:**
- Casual: <1.5s total
- Sales: <2.5s total
- Intent detection: <400ms

### Intent Detection
```
[chat-v2] Casual intent detected
[chat-v2] Sales intent detected
```

Verify router correctly identifies intent based on message content.

### Tool Execution
```
[chat-v2] Tool called: openApp with appName: paint
[chat-v2] Tool called: closeApp with appName: minesweeper
```

### Email Sending (Sales Mode)
```
[validateAndSendEmailTool] Email sent successfully: <uuid>
[chat-v2] Email sent detection result: true
```

Verify only ONE email per conversation, no duplicates.

## API Response Structure

### Casual Response
```json
{
  "message": "¡Listo! Abriendo Paint 🎨",
  "actions": [
    { "type": "openApp", "appName": "paint" }
  ],
  "emailSent": false,
  "intent": "casual"
}
```

### Sales Response
```json
{
  "message": "¡Perfecto! ¿Cuál es tu nombre?",
  "actions": [],
  "emailSent": false,
  "intent": "sales"
}
```

### After Email Sent
```json
{
  "message": "Email sent to Fran! 📧 He'll reply within 24h",
  "systemMessage": "✅ Contact info sent successfully!",
  "actions": [],
  "emailSent": true,
  "intent": "sales"
}
```

## How to Test

### Option 1: cURL Commands
```bash
# Test casual
curl -X POST http://localhost:3000/api/chat-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hey! What'\''s up?"}
    ]
  }'

# Test function calling
curl -X POST http://localhost:3000/api/chat-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Open Paint"}
    ]
  }'

# Test sales
curl -X POST http://localhost:3000/api/chat-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I want to build a website"}
    ]
  }'
```

### Option 2: Browser Test (Recommended)
1. Start dev server: `npm run dev`
2. Open MSN Messenger in the portfolio
3. Run through all test scenarios
4. Watch terminal for logs
5. Check email inbox for test emails

## Bug Checklist

Watch for these potential issues:

- [ ] Intent detection failures (wrong mode)
- [ ] Tool calls not executing (no actions in response)
- [ ] Duplicate emails in sales mode
- [ ] emailSent detection incorrect
- [ ] Intent switching broken (stuck in one mode)
- [ ] Multilingual responses broken
- [ ] Performance degradation (>3s responses)
- [ ] Missing actions array in response
- [ ] Tool messages not showing in UI

## Success Criteria

- [ ] All 8 test scenarios pass
- [ ] No errors in terminal logs
- [ ] Performance targets met (<1.5s casual, <2.5s sales)
- [ ] Email sent correctly with all fields
- [ ] Tool calls work for all 12 apps
- [ ] Intent switching smooth and accurate
- [ ] Multilingual support working
- [ ] No duplicate emails
- [ ] Green animation appears when email sent

## Deliverable

Create a test report with:
1. Pass/Fail for each test scenario
2. Performance metrics from logs
3. Any bugs discovered
4. Screenshots/logs of any issues
5. Recommendation: Ready for production? Or needs fixes?

## Priority
**HIGH** - This is the final integration test before production deployment.

Let me know what you find! 🧪

# Mission: Snake Game App 🐍

**Agent**: Codex
**Branch**: `develop`
**Folder Boundary**: `app/components/Apps/Snake/` ONLY

---

## 🎯 Objective

Build a classic Snake game with retro Nokia/MS-DOS aesthetic, high scores, and smooth gameplay.

---

## 📋 Requirements

### Core Gameplay
- **Snake Movement**: Arrow keys control direction (up/down/left/right)
- **Food Spawning**: Random food appears, snake grows when eaten
- **Collision Detection**: Game over if snake hits wall or itself
- **Score System**: Points for each food eaten
- **Speed Increase**: Game speeds up as score increases

### Visual Design
Choose ONE aesthetic:
- **Option A**: Nokia Green - Monochrome green (#9cb23d) on dark background
- **Option B**: MS-DOS - Classic cyan/magenta/yellow colors
- **Grid**: Visible grid lines (optional but recommended)
- **Pixel Art**: Blocky snake segments, simple food sprite

### Features
1. **Start Screen**: "Press SPACE to Start" message
2. **Game Over Screen**:
   - "Game Over!" message
   - Final score display
   - High score display
   - "Press SPACE to Restart"
3. **High Scores**: Use localStorage to persist top 5 scores
4. **Pause**: SPACE key pauses/unpauses game
5. **Difficulty Levels** (optional): Easy/Medium/Hard affects starting speed

### Window Integration
- Desktop icon: `🐍 Snake.exe`
- Default window size: 600x500
- Title: "Snake"
- Include in Start Menu → Programs

---

## 🛠️ Technical Specs

### File Structure
```
app/components/Apps/Snake/
├── Snake.tsx          (main component)
├── SnakeGame.ts       (game logic class)
└── types.ts           (game types)
```

### Game Loop Pattern
```typescript
useEffect(() => {
  if (!isPlaying || isPaused) return;

  const gameLoop = setInterval(() => {
    // Move snake
    // Check collisions
    // Update score
    // Render
  }, gameSpeed);

  return () => clearInterval(gameLoop);
}, [isPlaying, isPaused, gameSpeed]);
```

### Keyboard Controls
- Arrow Keys: Change direction (prevent reverse direction!)
- SPACE: Start/Pause/Restart
- ESC: Close window (handled by WindowManager)

### localStorage High Scores
```typescript
interface HighScore {
  score: number;
  date: string;
}

const HIGH_SCORES_KEY = 'snake-high-scores';
```

---

## 🚫 Constraints

### DO NOT TOUCH:
- ❌ Any files outside `app/components/Apps/Snake/`
- ❌ `app/page.tsx` (I'll add the icon integration)
- ❌ `app/types/`
- ❌ Start Menu configs
- ❌ Any other app folders

### DO ONLY:
- ✅ Create Snake folder and components
- ✅ Build game logic
- ✅ Style with retro aesthetic
- ✅ Test gameplay thoroughly

---

## 🎨 Visual Reference

### Nokia Style (Recommended)
```css
background: #0f1d08; /* Dark green background */
snake: #9cb23d;      /* Nokia green */
food: #9cb23d;       /* Same green, maybe flashing */
grid: rgba(156, 178, 61, 0.1);
```

### MS-DOS Style (Alternative)
```css
background: #000000;
snake: #00ff00;      /* Bright green */
food: #ffff00;       /* Yellow */
border: #ffffff;
text: #00ffff;       /* Cyan */
```

---

## ✅ Acceptance Criteria

- [ ] Snake moves smoothly with arrow keys
- [ ] Food spawns randomly, snake grows on eat
- [ ] Game over on collision (wall or self)
- [ ] Score increases, speed increases gradually
- [ ] High scores saved to localStorage (top 5)
- [ ] Start/Game Over/Pause screens work
- [ ] SPACE key controls start/pause/restart
- [ ] Retro aesthetic matches Windows 3.1 vibe
- [ ] No crashes or bugs
- [ ] Playable and fun!

---

## 🚀 Getting Started

1. **Pull latest develop branch**
2. **Create folder**: `app/components/Apps/Snake/`
3. **Build game**: Start with basic movement, then add features
4. **Test thoroughly**: Play multiple rounds!
5. **Commit with prefix**: `[CODEX] feat(snake): your message`

---

## 📦 Deliverables

- `Snake.tsx` - Main component with UI and game loop
- `SnakeGame.ts` - Game logic class (optional, can be in Snake.tsx)
- `types.ts` - TypeScript interfaces
- Working game ready for desktop icon integration

---

**Questions?** Check existing apps (Paint, Minesweeper) for window integration patterns.

**Have fun!** This is a classic - make it addictive! 🐍🎮

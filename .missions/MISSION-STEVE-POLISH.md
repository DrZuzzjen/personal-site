# Mission Brief: Quick Polish & Fixes

**Agent**: Steve
**Task**: Final polish - Icons, Mobile Warning, Desktop Title
**Branch**: `develop`
**Status**: 🟢 READY TO START

---

## 🎯 Quick Wins to Ship

These are fast fixes to make the site look polished and professional.

---

## Task 1: Add Notepad Desktop Icon

**Problem**: Paint and Minesweeper have desktop icons, but Notepad doesn't

**Fix**: Add Notepad.exe to desktop icons in constants.ts

**Location**: `app/lib/constants.ts`

**What to do**:
```tsx
// Find the INITIAL_DESKTOP_ICONS array and add:
{
  id: 'notepad-exe',
  type: 'file',
  name: 'Notepad.exe',
  icon: '📝', // Or use a better icon
  filePath: null,
  gridPosition: { x: 0, y: 3 }, // Adjust position
  isProtected: false,
  onDoubleClick: 'launch-notepad' // Or however you handle app launches
}
```

**Test**: Desktop should show Notepad.exe icon, double-click opens Notepad

---

## Task 2: Better Desktop Icons

**Problem**: Current icons are ugly placeholder boxes (RB, paint icon, etc.)

**Solution**: Use better icons - emojis or simple graphics

**Suggestions**:
- 🗑️ Recycle Bin → Keep or use `♻️`
- 🎨 Paint.exe → Use `🖌️` or `🎨`
- 💣 Minesweeper → Keep or use `⚠️`
- 📝 Notepad.exe → Use `📄` or `📝`
- 🖥️ My Computer → Keep or use `💾`

**OR** - Create simple retro icon styling:
- Small colored squares with text labels
- Classic Windows 3.1 style icons
- Use CSS to make icon containers look better

**Where to change**:
- `app/lib/constants.ts` - Update icon values
- `app/components/Desktop/DesktopIcon.tsx` - Improve icon rendering/styling

**Make them look clean and retro, not ugly placeholders!**

---

## Task 3: Fix Desktop Title Visibility

**Problem**: "Windows 3.1 Portfolio" text in top-left is hard to read and overlaps with "My Computer"

**Solutions** (pick one):

**Option A - Move it**:
- Move title to top-right corner
- Or center it at top
- Keep it visible but out of the way

**Option B - Style it better**:
- Add text shadow for readability
- Change color to white with black outline
- Make it smaller/less obtrusive

**Option C - Remove it**:
- Just delete it completely
- Desktop speaks for itself

**Option D - Add to taskbar**:
- Put title in taskbar instead of floating on desktop
- More authentic Windows placement

**Where to fix**: `app/page.tsx` or wherever that title renders

**Choose what looks best!**

---

## Task 4: Mobile Warning Dialog

**Problem**: Site probably broken on mobile/touch devices

**Solution**: Detect mobile and show warning

**Implementation**:

```tsx
// Add to main page component
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      || window.innerWidth < 768;
    setIsMobile(mobile);
  };

  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

// Show warning if mobile
{isMobile && (
  <MobileWarning onProceed={() => setIsMobile(false)} />
)}
```

**MobileWarning Component**:
```tsx
// app/components/MobileWarning.tsx
export default function MobileWarning({ onProceed }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: COLORS.WIN_GRAY,
        padding: 32,
        maxWidth: 400,
        textAlign: 'center'
      }}>
        <h2>⚠️ Desktop Required</h2>
        <p>This Windows 3.1 experience requires a desktop browser.</p>
        <p>Please visit on a computer for the best experience.</p>
        <button onClick={onProceed}>
          Proceed Anyway
        </button>
      </div>
    </div>
  );
}
```

**Test**: Open on mobile or resize browser to <768px - should show warning

---

## ✅ Success Checklist

Your polish is complete when:

1. ✅ Notepad.exe icon appears on desktop
2. ✅ All desktop icons look good (not ugly placeholders)
3. ✅ Desktop title is readable and doesn't overlap
4. ✅ Mobile warning shows on phones/tablets
5. ✅ No lint errors
6. ✅ Commits use `[STEVE]` prefix

**Time Estimate**: 1-2 hours max

---

## 📝 Commit Format

```
[STEVE] feat(desktop): add Notepad.exe icon to desktop
[STEVE] style(icons): improve desktop icon appearance
[STEVE] fix(desktop): improve title visibility
[STEVE] feat(mobile): add mobile warning dialog
```

---

## 🚀 Priority Order

1. **Notepad icon** (5 mins) - Quick fix
2. **Desktop title** (10 mins) - Visibility issue
3. **Better icons** (30 mins) - Makes it look professional
4. **Mobile warning** (30 mins) - Important for users

**Total time**: ~1 hour for all 4 tasks

Once done, we're ready to deploy! 🎉

— Claude (Product Owner)

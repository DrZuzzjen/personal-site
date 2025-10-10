# 🏗️ REFACTOR: Centralized App Configuration System

**Status:** Ready for Implementation
**Priority:** HIGH (Fixes production bug + improves architecture)
**Estimated Time:** 2-3 hours
**Branch:** `refactor/centralized-app-configs`

---

## 📋 Problem Statement

**Current Bug:** Paint.exe opens with inconsistent window sizes depending on how it's launched:
- Desktop icon: 800×600 ✅ (correct)
- Terminal command: 520×420 ❌ (too small)
- MSN Messenger: 520×420 ❌ (too small)

**Root Cause:** App configurations are duplicated in 3 different files:
1. `app/components/Desktop/DesktopIcon.tsx` (lines 45-50, 97-112)
2. `app/components/Apps/Terminal/commands/apps.ts` (lines 23-167)
3. `app/components/Apps/Chatbot/Chatbot.tsx` (lines 80-185)

**Impact:**
- User Experience: Paint opens unusably small from Terminal/MSN
- Maintainability: Adding/updating apps requires editing 3 files
- Data Integrity: Configurations drift out of sync

---

## 🎯 Solution: Option 3 - Centralized App Registry

Create a **single source of truth** for all application metadata in a new file: `app/lib/app-configs.ts`

This registry will contain:
- Window dimensions (width, height)
- Default positions (x, y)
- Window icons
- App titles
- Initial content/props specific to each app

All 3 callers (Desktop, Terminal, MSN) will import from this central registry.

---

## 📦 Deliverables

### 1. New File: `app/lib/app-configs.ts`

**Location:** `/Users/franzuzz/Documents/GitHub/personal-site/app/lib/app-configs.ts`

**Purpose:** Centralized registry of all app configurations

**Structure Requirements:**
- Export a named constant called `APP_CONFIGS`
- Use a Record type mapping app names to configuration objects
- Include TypeScript types for type safety
- Each app config should have:
  - `title` (string)
  - `defaultSize` (object with width/height numbers)
  - `defaultPosition` (object with x/y numbers)
  - `icon` (string)
  - `defaultContent` (optional object, varies by app type)

**Apps to Include (ALL):**
1. paint
2. minesweeper
3. notepad
4. snake
5. camera
6. tv
7. browser (Internet Explorer)
8. chatbot (MSN Messenger)
9. portfolio
10. terminal
11. explorer (File Explorer)
12. mycomputer

**Dimension Requirements (use current CORRECT values):**

**From DesktopIcon.tsx (these are the CORRECT reference values):**
- Paint: 800×600
- Minesweeper: 360×440
- Notepad: 520×380
- Snake: 850×580
- Camera: 720×580
- TV: 880×720
- Browser: 960×720
- Chatbot (MSN): 480×620
- Portfolio: 750×863

**From Terminal/apps.ts (these need verification - some may be correct for terminal-specific launches):**
- Terminal: 800×600
- Explorer: 520×360

**Important Notes:**
- The dimensions in DesktopIcon.tsx should be considered the canonical reference
- If Terminal/Chatbot have different values, they are likely bugs (verify each app)
- Position coordinates should use smart defaults (staggered, not all overlapping)

---

### 2. Update File: `app/components/Desktop/DesktopIcon.tsx`

**Changes Required:**

**Remove:**
- All individual constant declarations like:
  - `NOTEPAD_WINDOW_SIZE`
  - `MINESWEEPER_WINDOW_SIZE`
  - `PAINT_WINDOW_SIZE`
  - `CAMERA_WINDOW_SIZE`
  - `TV_WINDOW_SIZE`
  - `BROWSER_WINDOW_SIZE`
  - (Lines 45-50 approximately)

**Remove:**
- All individual `createXLaunch()` functions:
  - `createPaintLaunch()`
  - `createMinesweeperLaunch()`
  - `createNotepadLaunch()`
  - `createSnakeLaunch()`
  - `createCameraLaunch()`
  - `createTVLaunch()`
  - `createChatbotLaunch()`
  - `createPortfolioLaunch()`
  - `createBrowserLaunch()`
  - (Lines 97-219 approximately)

**Add:**
- Import statement at top of file to get `APP_CONFIGS` from the new file
- Create a single generic helper function that:
  - Takes an app name (string)
  - Looks up the config from `APP_CONFIGS`
  - Returns a properly structured `LaunchConfig` object
  - Handles special cases like passing file content to notepad

**Update:**
- The `getLaunchConfigForFile()` function to use the new helper instead of individual create functions
- Keep the existing double-click and file-handling logic intact
- Ensure all app types still work correctly

**Testing Points:**
- Double-clicking desktop icons should open apps with correct dimensions
- File associations should still work (txt files open notepad)
- Protected files should still show as read-only

---

### 3. Update File: `app/components/Apps/Terminal/commands/apps.ts`

**Changes Required:**

**Remove:**
- The entire `APP_LAUNCHERS` array (lines 23-167)
- The `LaunchDefinition` interface (only if not needed elsewhere)

**Add:**
- Import statement at top to get `APP_CONFIGS` from the new file

**Update:**
- The `findLauncher()` function to work with the new config structure
  - Should match app names/aliases from the new registry
  - Each app in the new registry should include an `aliases` array for matching
- The `run` command execute function to:
  - Look up configs from `APP_CONFIGS`
  - Use the centralized dimensions instead of hardcoded values
  - Preserve the random position logic (`getRandomPosition()`)
  - Keep all existing command functionality (--list flag, path resolution)

**Testing Points:**
- Terminal commands should work: `run paint.exe`, `run minesweeper`, etc.
- `run --list` should show all available apps
- Apps should open with correct (larger) dimensions
- Position randomization should still work

---

### 4. Update File: `app/components/Apps/Chatbot/Chatbot.tsx`

**Changes Required:**

**Remove:**
- The entire `configs` object inside `getAppConfig()` function (lines 87-185)

**Add:**
- Import statement at top to get `APP_CONFIGS` from the new file

**Update:**
- The `getAppConfig()` function to:
  - Look up the app config from `APP_CONFIGS` by name
  - Return the same structure as before (title, appType, position, size, icon, content)
  - Keep the existing type signature (don't break callers)
  - Use the centralized dimensions

**Keep:**
- All MSN Messenger UI logic
- Sound effects and chat functionality
- Action execution logic (openApp, closeApp, restart)

**Testing Points:**
- MSN Messenger should be able to open apps via chat commands
- "abre paint" should open Paint with correct dimensions
- All supported app names should work
- Position handling should work correctly

---

## 🔀 Git Workflow

### Step 1: Create Feature Branch
```
git checkout master
git pull origin master
git checkout -b refactor/centralized-app-configs
```

### Step 2: Implementation
- Create the new `app-configs.ts` file FIRST
- Update the 3 consuming files one at a time
- Test after each file update
- Commit logical chunks (not one massive commit)

### Step 3: Testing Checklist
Test EVERY app from EVERY launch method:

**Desktop Icon Tests:**
- [ ] Paint opens at 800×600
- [ ] Minesweeper opens at 360×440
- [ ] All 10 apps open with correct dimensions
- [ ] File associations work (txt → notepad)

**Terminal Tests:**
- [ ] `run paint.exe` opens Paint at 800×600 (not 520×420)
- [ ] `run --list` shows all apps
- [ ] Random positioning works
- [ ] All app aliases work

**MSN Messenger Tests:**
- [ ] "abre paint" opens Paint at 800×600 (not 520×420)
- [ ] "open minesweeper" works
- [ ] Spanish/English commands both work
- [ ] closeApp and restart still work

**Regression Tests:**
- [ ] No TypeScript errors
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in browser
- [ ] Window management still works (minimize, maximize, close)

### Step 4: Commit Messages
Use semantic commit messages:
```
feat: Add centralized app configuration registry

refactor: Update DesktopIcon to use centralized app configs

refactor: Update Terminal commands to use centralized app configs

refactor: Update Chatbot to use centralized app configs

fix: Correct Paint window dimensions across all launch methods
```

### Step 5: Pull Request
- Create PR from `refactor/centralized-app-configs` to `master`
- Title: "🏗️ Refactor: Centralized App Configuration System"
- Include testing checklist in PR description
- Tag as `refactoring` and `bug-fix`

---

## 🎯 Success Criteria

✅ **Functional:**
- Paint opens at 800×600 from ALL launch methods (Desktop, Terminal, MSN)
- All apps open with consistent, correct dimensions
- No functionality is broken

✅ **Code Quality:**
- No code duplication of window dimensions
- Single source of truth for app metadata
- TypeScript types are correct and strict
- Build passes with no errors

✅ **Maintainability:**
- Adding a new app requires changes in only 1 file
- Updating dimensions requires changes in only 1 file
- Clear documentation in the new file

---

## 🚨 Risks & Mitigations

**Risk 1:** Breaking existing functionality
- **Mitigation:** Test thoroughly after each file update, commit incrementally

**Risk 2:** TypeScript type mismatches
- **Mitigation:** Define proper types in the new file first, ensure consuming code matches

**Risk 3:** Missing edge cases (special content handling)
- **Mitigation:** Review each app's current content structure, preserve special cases in new config

**Risk 4:** Position randomization conflicts
- **Mitigation:** Keep Terminal's random position logic separate from centralized configs

---

## 📚 Reference: Current Dimension Mismatches

| App | Desktop | Terminal | MSN | Status |
|-----|---------|----------|-----|--------|
| Paint | 800×600 | 520×420 | 520×420 | ❌ BUG |
| Minesweeper | 360×440 | 360×320 | 360×320 | ⚠️ VERIFY |
| Notepad | 520×380 | 480×320 | 480×320 | ⚠️ VERIFY |
| Snake | 850×580 | 860×600 | 860×600 | ⚠️ VERIFY |
| Camera | 720×580 | 720×580 | 720×580 | ✅ MATCH |
| TV | 880×720 | 880×720 | 800×600 | ⚠️ MSN WRONG |
| Browser | 960×720 | 960×720 | 900×650 | ⚠️ MSN WRONG |
| Chatbot | 480×620 | 500×640 | 600×500 | ⚠️ ALL DIFFERENT |
| Portfolio | 750×863 | 900×700 | - | ⚠️ VERIFY |

**Decision Rule:** When dimensions conflict, use DesktopIcon.tsx values as canonical (they were carefully designed for the actual app content).

---

## 💡 Future Enhancements (Out of Scope)

These are NOT part of this refactor but could be future improvements:
- Add window resize limits (minWidth, maxWidth, etc.)
- Add app categories/tags for better organization
- Add launch animations or transition configs
- Support per-app themes or color schemes
- Add keyboard shortcuts per app

---

## 📞 Questions for Developer

Before starting implementation, developer should clarify:

1. **Notepad special case:** Should notepad's content handling be part of the centralized config or stay as a special case in the consuming code?

2. **Position strategy:** Should positions be centralized or keep the current mix (Desktop uses fixed positions, Terminal uses random)?

3. **Minesweeper content:** The minesweeper config includes game settings (rows, cols, mines). Should this be in the central config or passed separately?

4. **Backwards compatibility:** Are there any external consumers of these functions that we need to preserve?

---

## ✅ Acceptance Criteria

This refactor is complete when:
- [ ] New `app-configs.ts` file exists with all app configurations
- [ ] All 3 consuming files import from the central registry
- [ ] Paint.exe opens at 800×600 from Terminal (bug fixed)
- [ ] Paint.exe opens at 800×600 from MSN (bug fixed)
- [ ] All apps work from all launch methods
- [ ] TypeScript build succeeds with no errors
- [ ] All tests pass (manual testing checklist above)
- [ ] No code duplication of window dimensions
- [ ] PR is reviewed and merged to master

---

**Document Version:** 1.0
**Created:** 2025-10-10
**Author:** Product Owner (Claude)
**Implementation Owner:** TBD

# 🚨 IMPORTANT: Commit Message Format

## For Steve and Codex

**CRITICAL**: Prefix ALL your commit messages with your name so we can tell who did what!

### Steve's Commit Format:
```bash
git commit -m "[STEVE] feat(desktop): your message here"
```

### Codex's Commit Format:
```bash
git commit -m "[CODEX] feat(taskbar): your message here"
```

## Examples:

**Steve:**
```bash
[STEVE] feat(desktop): add Desktop container component
[STEVE] feat(desktop): add icon drag hook with grid snapping
[STEVE] fix(desktop): resolve icon positioning bug
```

**Codex:**
```bash
[CODEX] feat(taskbar): add Taskbar container component
[CODEX] feat(taskbar): add Clock with live updates
[CODEX] fix(taskbar): resolve button focus state issue
```

## Why?

Both of you share the same git author name, so we can't tell from `git log` who wrote which code. Adding `[STEVE]` or `[CODEX]` makes it crystal clear!

**Please use this format for ALL future commits!** 🙏

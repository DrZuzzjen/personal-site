# Project Memory - Web Project

## Project Overview
New website project using Next.js, TypeScript, and Tailwind CSS, deployed to Vercel.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Package Manager**: npm

## Project Structure
- App Router (no src directory)
- Import alias: `@/*`
- Turbopack enabled
- ESLint configured

## MCP Configuration - CRITICAL INFO

### For Claude Code VS Code Extension on Windows:
**MCP servers MUST be configured in:**
`C:\Users\gutij\AppData\Roaming\Claude\claude_desktop_config.json`

This is the SAME file used by Claude Desktop app. The VS Code extension reads from here.

### Working MCP Server Configurations:

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["E:\\code\\AI\\MCP_Playground\\quickstart-resources\\weather-server-typescript\\build\\index.js"]
    },
    "kluster-verify": {
      "command": "kluster-verify-code-mcp",
      "args": [],
      "env": {
        "KLUSTER_API_KEY": "eb9b3c76-9c35-48a6-b34b-f24c476ce12e"
      }
    },
    "vercel": {
      "command": "mcp-remote",
      "args": ["https://mcp.vercel.com"]
    }
  }
}
```

### Key Lessons Learned:
1. **Global installation required**: MCP packages must be installed globally (`npm install -g`)
   - Installed: `@klusterai/kluster-verify-code-mcp`
   - Installed: `mcp-remote`

2. **Use direct binary commands**, not `npx` (npx fails when spawned by VS Code extension)

3. **Wrong config locations tried**:
   - ❌ `C:\Users\gutij\.claude.json` (user config, not used by VS Code extension)
   - ❌ `C:\ProgramData\ClaudeCode\managed-mcp.json` (doesn't exist for VS Code extension)
   - ❌ `E:\code\web\.claude\settings.local.json` (doesn't support mcpServers)
   - ❌ `E:\code\web\.mcp.json` (project scope, not read by extension)
   - ✅ `C:\Users\gutij\AppData\Roaming\Claude\claude_desktop_config.json` (CORRECT!)

4. **Window reload required**: After config changes, must reload VS Code window (Ctrl+Shift+P → "Developer: Reload Window")

## MCP Servers Status
- ✅ **Weather** - Connected (local Node.js server)
- ✅ **Kluster Verify** - Connected (code review and verification)
- ⏳ **Vercel** - Pending authentication via `/mcp`

## Setup Status
- ✅ Git repository initialized
- ✅ Next.js project created
- ✅ Dependencies installed
- ✅ MCP servers configured and working

## Next Steps
1. Authenticate Vercel MCP via `/mcp` command
2. Begin project development
3. Set up Vercel deployment

## Working Directory
`e:\code\web`

# ai-playbook-mcp

MCP client for ai-playbook. Connects AI coding tools (Kiro, Claude Code, etc.) to your playbook assets.

## Installation

No manual installation needed. Use with npx:

```json
// ~/.kiro/settings/mcp.json
{
  "mcpServers": {
    "ai-playbook": {
      "command": "npx",
      "args": ["ai-playbook-mcp"],
      "env": {
        "PLAYBOOK_API_URL": "https://your-domain.com",
        "PLAYBOOK_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| PLAYBOOK_API_URL | Yes | ai-playbook HTTP API server URL |
| PLAYBOOK_API_KEY | No | API authentication key |

## Tools Provided

| Tool | Description |
|------|-------------|
| list_catalog | List all assets and groups (with optional type/tags filter) |
| load_asset | Load full asset content (frontmatter + body) |
| suggest_assets | Suggest relevant assets based on task description |
| get_group | Get group details with included assets |

# Prism MCP Server Integration

Prism now exposes its code review capabilities via **Model Context Protocol (MCP)**, enabling AI agents like ChatGPT, Claude, and other MCP-compatible assistants to use Prism as a tool.

## What is MCP?

Model Context Protocol (MCP) is a standard protocol that allows AI applications to:
- **Discover tools** that extend their capabilities
- **Access resources** (data, files, APIs)
- **Use prompts** for specific tasks

By implementing MCP, Prism becomes a **tool that AI agents can invoke** to analyze code, just like they can search the web or run Python code.

## MCP Endpoints

All MCP endpoints are available at `/api/v1/mcp/*`:

### Discovery & Capabilities

```http
GET /api/v1/mcp/discovery
```

Returns the MCP server manifest with protocol version and capabilities.

### Tools

#### List Available Tools
```http
POST /api/v1/mcp/tools/list
```

Returns available code review tools:
- `analyze_code` - Analyze code for security, performance, or readability
- `get_available_models` - List available AI models
- `get_review_history` - Retrieve review history

#### Call a Tool
```http
POST /api/v1/mcp/tools/call
Content-Type: application/json

{
  "name": "analyze_code",
  "arguments": {
    "code": "function hello() { console.log('world'); }",
    "focus": "readability",
    "language": "javascript"
  }
}
```

### Resources

#### List Resources
```http
POST /api/v1/mcp/resources/list
Content-Type: application/json

{
  "sessionId": "optional-session-id"
}
```

Returns available resources:
- `prism://models` - Available AI models
- `prism://history/{sessionId}` - Review history
- `prism://review/{reviewId}` - Individual reviews

#### Read a Resource
```http
POST /api/v1/mcp/resources/read
Content-Type: application/json

{
  "uri": "prism://models",
  "sessionId": "optional-session-id"
}
```

### Prompts

#### List Prompts
```http
POST /api/v1/mcp/prompts/list
```

Returns available prompt templates:
- `security_review` - Security-focused analysis
- `performance_review` - Performance optimization
- `readability_review` - Code readability improvements

#### Get a Prompt
```http
POST /api/v1/mcp/prompts/get
Content-Type: application/json

{
  "name": "security_review",
  "arguments": {
    "code": "SELECT * FROM users WHERE id = " + userId,
    "language": "sql"
  }
}
```

## Using Prism with AI Agents

### ChatGPT (Custom GPT)

1. Create a Custom GPT in ChatGPT
2. Add an Action with the OpenAPI schema from `/api/v1/docs`
3. Configure the MCP endpoints
4. ChatGPT can now analyze code using Prism!

**Example conversation:**
```
User: Can you review this code for security issues?
      function login(user, pass) {
        db.query("SELECT * FROM users WHERE name='" + user + "'");
      }

ChatGPT: [Calls Prism's analyze_code tool]
         I've analyzed your code and found a critical SQL injection vulnerability...
```

### Claude (MCP Integration)

Claude Desktop supports MCP servers natively:

1. Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "prism": {
      "url": "https://prism-backend-drab.vercel.app/api/v1/mcp",
      "transport": "http"
    }
  }
}
```

2. Restart Claude Desktop
3. Claude can now use Prism's tools automatically!

### Custom AI Applications

Any MCP-compatible client can integrate with Prism:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: 'my-app',
  version: '1.0.0'
});

// Connect to Prism MCP server
await client.connect({
  url: 'https://prism-backend-drab.vercel.app/api/v1/mcp'
});

// List available tools
const tools = await client.listTools();

// Call analyze_code tool
const result = await client.callTool('analyze_code', {
  code: 'const x = 1;',
  focus: 'readability'
});
```

## MCP Tools Reference

### `analyze_code`

Analyzes code for security, performance, or readability issues.

**Input Schema:**
```json
{
  "code": "string (required)",
  "focus": "security | performance | readability (required)",
  "language": "string (optional, auto-detected)"
}
```

**Output:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"reviewId\":\"...\",\"summary\":\"...\",\"score\":85,\"issues\":[...]}"
    }
  ]
}
```

### `get_available_models`

Returns list of AI models available for code analysis.

**Input Schema:**
```json
{}
```

**Output:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"models\":[\"gemini-1.5-flash\",\"gemini-1.5-pro\"]}"
    }
  ]
}
```

### `get_review_history`

Retrieves code review history for a session.

**Input Schema:**
```json
{
  "sessionId": "string (optional)",
  "limit": "number (optional, default: 10)"
}
```

**Output:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"history\":[...],\"total\":5}"
    }
  ]
}
```

## MCP Resources

Resources are read-only data sources that AI agents can access:

| URI | Description |
|-----|-------------|
| `prism://models` | List of available AI models |
| `prism://history/{sessionId}` | Review history for a session |
| `prism://review/{reviewId}` | Individual review details |

## MCP Prompts

Pre-configured prompt templates for common code review scenarios:

| Prompt | Description |
|--------|-------------|
| `security_review` | Analyze code for security vulnerabilities |
| `performance_review` | Identify performance bottlenecks |
| `readability_review` | Suggest readability improvements |

## Testing MCP Integration

### Using cURL

```bash
# List tools
curl -X POST https://prism-backend-drab.vercel.app/api/v1/mcp/tools/list

# Analyze code
curl -X POST https://prism-backend-drab.vercel.app/api/v1/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "analyze_code",
    "arguments": {
      "code": "function test() { var x = 1; }",
      "focus": "readability"
    }
  }'

# Get models
curl -X POST https://prism-backend-drab.vercel.app/api/v1/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "get_available_models",
    "arguments": {}
  }'
```

### Using the MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is a tool for testing MCP servers:

```bash
npx @modelcontextprotocol/inspector https://prism-backend-drab.vercel.app/api/v1/mcp
```

## Architecture

```
┌─────────────────┐
│   AI Agent      │  (ChatGPT, Claude, Custom App)
│  (MCP Client)   │
└────────┬────────┘
         │ MCP Protocol
         │ (HTTP/JSON-RPC)
         ▼
┌─────────────────┐
│  Prism Backend  │
│   MCP Server    │
├─────────────────┤
│ • Tools         │  analyze_code, get_models, get_history
│ • Resources     │  prism://models, prism://history/*
│ • Prompts       │  security_review, performance_review
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Review Service  │  (Existing Prism Logic)
│ LLM Service     │
│ Prisma DB       │
└─────────────────┘
```

## Benefits

1. **AI Agent Integration**: Any MCP-compatible AI can use Prism
2. **Standardized Protocol**: No custom integration needed
3. **Discoverable**: AI agents can explore Prism's capabilities
4. **Composable**: Combine Prism with other MCP tools
5. **Future-Proof**: MCP is becoming an industry standard

## Security Considerations

- **Rate Limiting**: MCP endpoints respect the same rate limits as REST API
- **Session Isolation**: Each MCP session uses a unique session ID
- **No Authentication (Current)**: Public MCP server for demonstration
  - For production: Add API key authentication
  - Consider: OAuth, JWT tokens

## Future Enhancements

- [ ] WebSocket transport for real-time updates
- [ ] Streaming responses for long analyses
- [ ] Custom tool registration
- [ ] Multi-language support in prompts
- [ ] Advanced resource queries
- [ ] MCP server authentication

## Learn More

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [Building MCP Servers](https://modelcontextprotocol.io/docs/building-servers)
- [Prism API Documentation](/api/v1/docs)

---

**Ready to try it?** Visit the [Swagger docs](/api/v1/docs) and explore the `/mcp/*` endpoints!

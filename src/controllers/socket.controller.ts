import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('WebSocket')
@Controller('ws-docs')
export class WsDocsController {
  @Get('events/chat')
  @ApiOperation({
    summary: 'WebSocket Events - Chat',
    description: `
## 🔌 WebSocket Configuration

- **Namespace:** \`/chat\`
- **Connection URL:** \`ws://localhost:8080/chat?token=<auth_token>;\`

Use a valid JWT token (from login) as a query parameter to authenticate the socket connection.

---

## 📤 Client → Server Events

### 1. \`send-message\`

Sends a chat message to a specific conversation.
Message will be sent to the server and broadcasted to all clients in the same conversation.

**Payload:**
\`\`\`json
{
  "content": "Hello, how are you?",
  "conversationId": "abc123"
}
\`\`\`

---

## 📥 Server → Client Events

### 1. \`receive-message\`

Broadcasted when a new message is received in a conversation.

**Payload:**
\`\`\`json
{
  "messageId": "msg789",
  "content": "Hello, how are you?",
  "sender": "user456",
  "conversationId": "abc123"
}
\`\`\`

---

### 2. \`errors\`

Emitted when an error occurs on the server side.

**Payload:**
\`\`\`json
{
  "message": "Invalid conversation ID"
}
\`\`\`

---

## ✅ Sample Connection Flow

1. Connect to \`ws://localhost:8080/chat?token=your_jwt_token\`
2. Emit \`send-message\` with message data
3. Listen for \`receive-message\` for real-time updates
    `,
  })
  getChatDocs() {
    return 'See Swagger UI for WebSocket event descriptions.';
  }

  @Get('events/notification')
  @ApiOperation({
    summary: 'WebSocket Events - Notification',
    description: `
## 🔔 WebSocket Configuration

- **Namespace:** \`/notifications\`
- **Connection URL:** \`ws://localhost:8080/notifications?token=<auth_token>\`

Use a valid JWT token (from login) as a query parameter to authenticate the socket connection.

---

## 📥 Server → Client Events

### 1. \`notification\`

Sent by the server to inform the client of a new notification (e.g. new message, friend request, or system alert).

**Payload:**
\`\`\`json
{
  "message": "You have a new message from Alice.",
  "createdAt": "2025-05-13T14:30:00.000Z"
}
\`\`\`

#### 🔹 Fields:

| Field       | Type     | Description                              |
|-------------|----------|------------------------------------------|
| \`message\`   | string   | Detailed content of the notification    |
| \`createdAt\` | string   | ISO timestamp of when the notification was generated |

---

## ✅ Sample Flow

1. Connect to \`ws://localhost:8080/notifications?token=your_jwt_token\`
2. When a notification event occurs, the server emits the \`notification\` event with the payload shown above
3. Client listens and displays the notification to the user
    `,
  })
  getNotificationDocs() {
    return 'See Swagger UI for WebSocket event descriptions.';
  }
}

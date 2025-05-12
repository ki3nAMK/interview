import { CustomSocket } from '@/dtos/requests/custom-socket.request';
import { SentMessageRequest } from '@/dtos/requests/send-message.request';
import { UploadMessageRequest } from '@/dtos/requests/upload-message.request';
import { ErrorDictionary } from '@/enums/error-dictionary.enum';
import { MessageType } from '@/enums/message-type.enum';
import { SocketNamespace } from '@/enums/socket-namespace.enum';
import { Conversation } from '@/models/conversation.schema';
import { ChatService } from '@/services/chat.service';
import { ConversationsService } from '@/services/conversation.service';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { forEach, includes, trim } from 'lodash';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: false,
  },
  pingInterval: 10000,
  pingTimeout: 15000,
  namespace: SocketNamespace.CHAT,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private readonly server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly conversationService: ConversationsService,
  ) {}

  getServer() {
    return this.server;
  }

  async handleConnection(client: CustomSocket) {
    await this.handleGetRelatedConversation(client, (conversation) => {
      client.join(conversation._id.toString());
    });
  }

  async handleDisconnect(client: CustomSocket) {
    await this.handleGetRelatedConversation(client, (conversation) => {
      client.leave(conversation._id.toString());
    });
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() { content, conversationId }: SentMessageRequest,
  ) {
    const trimmedContent = trim(content);

    if (!trimmedContent) {
      client.emit('errors', { message: ErrorDictionary.BAD_REQUEST });

      return;
    }

    const { messageId } = await this.conversationService.sendMessage(
      conversationId,
      client.handshake.currentUserId,
      trimmedContent,
      MessageType.TEXT,
    );

    this.server.to(conversationId).emit('receive-message', {
      content: trimmedContent,
      sender: client.handshake.currentUserId,
      conversationId,
      messageId,
    });
  }

  @OnEvent('conversation.send_message')
  handleSendMessageEvent(payload: {
    conversationId: string;
    userId: string;
    body: SentMessageRequest;
    type: MessageType;
    messageId: string;
  }) {
    this.server.to(payload.conversationId).emit('receive-message', {
      content: payload.body.content,
      sender: payload.userId,
      conversationId: payload.conversationId,
      type: payload.type,
      messageId: payload.messageId,
    });
  }

  @OnEvent('conversation.new')
  handleNewConversationEvent(payload: {
    conversationId: string;
    userId: string;
    body: UploadMessageRequest;
  }) {
    let thisUserSocket: CustomSocket;
    const userIds = [payload.userId, ...payload.body.memberIds];
    const { conversationId } = payload;

    const socketIds = (this.server.sockets as any)?.keys();

    for (const socketId of socketIds) {
      const socket = (this.server.sockets as any)?.get(
        socketId,
      ) as CustomSocket;

      if (socket.handshake.currentUserId === payload.userId) {
        thisUserSocket = socket;
      }

      if (includes(userIds, socket.handshake.currentUserId)) {
        socket.join(conversationId);
      }
    }

    this.server.to(conversationId).emit('receive-message', {
      content: payload.body.message,
      sender: payload.userId,
      conversationId,
    });
  }

  async handleGetRelatedConversation(
    client: CustomSocket,
    fn: (conversation: Conversation) => void,
  ) {
    const { handshake } = client;
    const { currentUserId } = handshake;

    const { items: allConservation } =
      await this.conversationService.getAllRelatedConversations(currentUserId);

    forEach(allConservation, fn);
  }
}

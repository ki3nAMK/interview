import { CustomSocket } from '@/dtos/requests/custom-socket.request';
import { SocketNamespace } from '@/enums/socket-namespace.enum';
import { UsersService } from '@/services/user.service';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { forEach } from 'lodash';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: false,
  },
  pingInterval: 10000,
  pingTimeout: 15000,
  namespace: SocketNamespace.NOTIFICATIONS,
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private readonly server: Server;

  constructor() {
    this.server = new Server();
  }

  getServer() {
    return this.server;
  }

  async handleConnection(client: CustomSocket) {
    const userId = this.getUserIdFromSocket(client);
    client.join(userId);
  }

  async handleDisconnect(client: CustomSocket) {
    const userId = this.getUserIdFromSocket(client);
    client.leave(userId);
  }

  getUserIdFromSocket(client: CustomSocket): string {
    const { handshake } = client;
    const { currentUserId } = handshake;
    return currentUserId;
  }

  @OnEvent('notification.new-group')
  async handleNewGroupNotification(data: {
    userId: string;
    memberIds: string[];
    message: string;
  }) {
    const { userId, memberIds, message } = data;

    forEach(memberIds, (memberId) => {
      this.server.to(memberId).emit('notification', {
        message,
      });
    });

    this.server.to(userId).emit('notification', {
      message: `Successfully created a new group`,
    });
  }
}

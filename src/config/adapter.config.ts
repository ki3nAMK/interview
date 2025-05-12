import { CacheDomain } from '@/domains/cache.domain';
import { CustomSocket } from '@/dtos/requests/custom-socket.request';
import { ErrorDictionary } from '@/enums/error-dictionary.enum';
import { SessionType } from '@/enums/session-type.enum';
import { SocketNamespace } from '@/enums/socket-namespace.enum';
import { SessionsService } from '@/services/session.service';
import {
  HttpStatus,
  INestApplicationContext,
  UnauthorizedException,
} from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { NextFunction } from 'express';
import { get } from 'lodash';
import { Server, ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(
    private app: INestApplicationContext,
    private readonly cacheDomain: CacheDomain,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const pubClient = this.cacheDomain.getRedisClient();
    const subClient = pubClient.duplicate();

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createTokenMiddleware(sessionDomain: SessionsService) {
    return async (socket: CustomSocket, next: NextFunction) => {
      const token = get(socket, 'handshake.query.token', '') as string;

      if (!token) {
        next(
          new UnauthorizedException({
            code: ErrorDictionary.UNAUTHORIZED,
            statusCode: HttpStatus.UNAUTHORIZED,
          }),
        );

        return;
      }

      try {
        const session = await sessionDomain.verifyToken(
          token,
          SessionType.ACCESS,
        );

        const { userId, sessionId } = session;

        socket.handshake.currentSessionId = sessionId;
        socket.handshake.currentUserId = userId;
        socket.handshake.token = token;

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server: Server = super.createIOServer(port, options);

    const sessionsService = this.app.get(SessionsService);

    server
      .of(SocketNamespace.NOTIFICATIONS)
      .use(this.createTokenMiddleware(sessionsService));

    server
      .of(SocketNamespace.CHAT)
      .use(this.createTokenMiddleware(sessionsService));

    server.adapter(this.adapterConstructor);

    return server;
  }
}

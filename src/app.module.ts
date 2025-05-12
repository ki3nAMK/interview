import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { redisStore } from 'cache-manager-redis-yet';
import { loadConfiguration } from './config/config';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { CacheDomain } from './domains/cache.domain';
import { ConversationsDomain } from './domains/conversation.domain';
import { MessagesDomain } from './domains/message.domain';
import { SessionsDomain } from './domains/session.domain';
import { UsersDomain } from './domains/user.domain';
import { AppClassSerializerInterceptor } from './interceptors/mongo-class-serializer.interceptor';
import { ConversationSchema } from './models/conversation.schema';
import { MessageSchema } from './models/message.schema';
import { SessionSchema } from './models/session.schema';
import { UserSchema } from './models/user.schema';
import { ConversationsRepository } from './repositories/conversation.repo';
import { MessagesRepository } from './repositories/message.repo';
import { SessionsRepository } from './repositories/session.repo';
import { UsersRepository } from './repositories/user.repo';
import { AuthService } from './services/auth.service';
import { SessionsService } from './services/session.service';
import { UsersService } from './services/user.service';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { ConversationsService } from './services/conversation.service';
import { MessagesService } from './services/message.service';
import { ChatService } from './services/chat.service';
import { TransactionDomain } from './domains/transaction.domain';
import { ChatController } from './controllers/chat.controller';
import { ChatGateway } from './gateways/chat.gateway';
import { NotificationSchema } from './models/notification.schema';
import { notificationsDomain } from './domains/notification.domain';
import { NotificationsService } from './services/notification.service';
import { NotificationGateway } from './gateways/notification.gateway';
import { NotificationsRepository } from './repositories/notification.repo';
import { NotificationController } from './controllers/notification.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [() => loadConfiguration()],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { uri, db } = configService.get('mongo');
        return { uri, dbName: db };
      },
    }),

    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
      {
        name: 'Session',
        schema: SessionSchema,
      },
      {
        name: 'Message',
        schema: MessageSchema,
      },
      {
        name: 'Conversation',
        schema: ConversationSchema,
      },
      {
        name: 'Notification',
        schema: NotificationSchema,
      },
    ]),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const {
          host,
          port,
          db: database,
          password,
        } = configService.get('redis');
        return {
          store: await redisStore({
            database,
            password,
            socket: { host, port },
          }),
        };
      },
    }),

    PassportModule.register({}),
    JwtModule.register({}),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
    }),
  ],
  controllers: [
    AuthController,
    UserController,
    ChatController,
    NotificationController,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: AppClassSerializerInterceptor },
    // * domains
    UsersDomain,
    CacheDomain,
    SessionsDomain,
    ConversationsDomain,
    MessagesDomain,
    TransactionDomain,
    notificationsDomain,

    // * services
    UsersService,
    SessionsService,
    AuthService,
    ConversationsService,
    MessagesService,
    ChatService,
    NotificationsService,

    // * repositories
    UsersRepository,
    SessionsRepository,
    MessagesRepository,
    ConversationsRepository,
    NotificationsRepository,

    // * strategies
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,

    // * gateways
    ChatGateway,
    NotificationGateway,
  ],
})
export class AppModule {}

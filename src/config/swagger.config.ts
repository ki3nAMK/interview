import { SessionType } from '@/enums/session-type.enum';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';

export const configSwagger = (app: INestApplication<any>) => {
  const configService = app.get(ConfigService);

  if (configService.get<boolean>('is_production')) return;

  app.use(
    `${configService.get('api_docs_path')}`,
    basicAuth({
      users: { admin: '12341234' },
      challenge: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Chat App API Docs')
    .setVersion('1.0')
    .addSecurity(SessionType.ACCESS, {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .addSecurity(SessionType.REFRESH, {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .addTag('User', "User's information related endpoints")
    .addTag('Auth', 'Authentication related endpoints')
    .addTag(
      'Chat',
      'Conversation-related endpoints handle retrieving online user information, creating new chat groups, and fetching group details',
    )
    .addTag('Notifications', 'Notification-related endpoints handle retrieving the list of notifications')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config, {});

  SwaggerModule.setup(
    configService.get('api_docs_path'),
    app,
    documentFactory,
    {
      swaggerOptions: {
        persistAuthorization: true,
        schemes: ['http'],
      },
    },
  );
};

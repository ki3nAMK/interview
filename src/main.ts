import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { configSwagger } from './config/swagger.config';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { RedisIoAdapter } from './config/adapter.config';
import { CacheDomain } from './domains/cache.domain';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.use(helmet());

  app.use(cookieParser());

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.get<string>('version'),
  });

  const redisIoAdapter = new RedisIoAdapter(app, app.get(CacheDomain));
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  configSwagger(app);

  const port = configService.get<number>('port');

  await app.listen(port, () => {
    const logger = new Logger('Bootstrap');
    logger.log(`Server is running on http://localhost:${port}`);
  });
}
bootstrap();

import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { GlobalExceptionFilter } from './global/error/error.filter';
import { ResponseInterceptor } from './global/common/response.interceptor';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET 값이 없습니다.');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  
  app.set('trust proxy', 1);

  app.enableCors({
    origin: ['http://localhost:8000', 'http://192.168.149.222:3000', 'http://localhost:3000', 'https://hsukorea.com'],
    credentials: true,
  });

  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });
  await redisClient.connect();

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 3600000,
      },
    }),
  );

  app.setGlobalPrefix('api/v1');

  const local = `http://localhost:${process.env.BACKEND_PORT}`;
  const prod = 'https://hsukorea.com';

  const config = new DocumentBuilder()
  .setTitle('API')
  .setDescription('API Documentation')
  .setVersion('1.0')
  .addCookieAuth('connect.sid')
  .addServer(isProd ? prod : local)
  .addServer(isProd ? local : prod)
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      withCredentials: true
    }
  });

  await app.listen(Number(process.env.BACKEND_PORT));
}
bootstrap();
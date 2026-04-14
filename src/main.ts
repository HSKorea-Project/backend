import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET 값이 없습니다.');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

  app.enableCors({
    origin: 'http://localhost:8000',
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

  await app.listen(Number(process.env.BACKEND_PORT));
}
bootstrap();
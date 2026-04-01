import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';

import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

import { ResponseInterceptor } from './global/common/response.interceptor';
import { ErrorFilter } from './global/error/error.filter';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is not defined');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new ErrorFilter());

  app.set('trust proxy', 1);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(
    session({
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
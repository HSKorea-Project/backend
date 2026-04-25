import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { InquiryModule } from './inquiry/inquiry.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { S3Module } from './global/s3/s3.module';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';

@Module({
  imports:[
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        namingStrategy: new SnakeNamingStrategy(), // DB 컬럼명 자동으로 Snakecase로 변환

        autoLoadEntities: true,
        synchronize: false,
        logging: true,
      }),
    }),
    InquiryModule,
    S3Module,
    AdminModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

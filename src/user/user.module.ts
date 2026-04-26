import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquiryEntity } from 'src/inquiry/inquiry.entity';
import { RedisService } from '../global/common/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([InquiryEntity]),
  ],
  controllers: [UserController],
  providers: [UserService, RedisService],
})
export class UserModule {}

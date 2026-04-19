import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquiryEntity } from './inquiry.entity';
import { S3Module } from 'src/global/s3/s3.module';
import { InquiryController } from './inquiry.controller';
import { InquiryService } from './inquiry.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([InquiryEntity]),
        S3Module
    ],
    controllers: [InquiryController],
    providers: [InquiryService],
})
export class InquiryModule {}

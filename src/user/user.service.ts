import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ForbiddenException, InternalServerException, UnauthorizedException, BadRequestException } from 'src/global/error/custom.exception';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InquiryEntity } from '../inquiry/inquiry.entity';
import { SolapiMessageService } from 'solapi';
import { SendCodeDto, VerifyCodeDto } from './dtos/code.dto';
import { RedisService } from '../global/common/redis.service';

@Injectable()
export class UserService {
  private messageService: SolapiMessageService

  constructor(
    @InjectRepository(InquiryEntity)
    private readonly inquiryRepo: Repository<InquiryEntity>,
    private readonly redisService: RedisService
  ) {
      const apiKey = process.env.SMS_API_KEY;
      const apiSecret = process.env.SMS_API_SECRET_KEY;

      if (!apiKey || !apiSecret) {
        throw new Error('CoolSMS 환경변수 누락');
      }

      this.messageService = new SolapiMessageService(apiKey, apiSecret);
  }

  async authenticate(inquiryId: string, password: string) {
    const inquiry = await this.inquiryRepo.findOne({
      where: { inquiryId },
      select: ['inquiryId', 'passwordHash'],
    });
    if (!inquiry) throw new ForbiddenException('문의 없음');

    const isMatch = await bcrypt.compare(password, inquiry.passwordHash);
    if (!isMatch) throw new ForbiddenException('비밀번호 불일치');
    
    return {
      inquiryId: inquiry.inquiryId
    }
  }

  async sendCode(phoneNum: SendCodeDto) {
    const { phoneNumber } = phoneNum;

    const cooldownKey = `sms:cooldown:${phoneNumber}`;
    const countKey = `sms:count:${phoneNumber}:${this.getToday()}`;

    // 재요청 1분 제한
    const cooldown = await this.redisService.get(cooldownKey);
    if (cooldown) {
      throw new BadRequestException('1분 후 다시 요청 가능합니다.');
    }

    // 하루 5회 제한
    const count = await this.redisService.get(countKey);
    if (count && Number(count) >= 3) {
      throw new BadRequestException('하루 최대 5회만 인증번호를 요청할 수 있습니다.');
    }

    const code = await this.generateCode();

    const reids = await this.redisService.set(
      `verify:${phoneNumber}`,
      code,
      600 // 10분
    );

    try {
      await this.messageService.send(
        {
          to: phoneNumber,
          from: process.env.SMS_SEND_PHONE_NUMBER,
          text: `[인증번호] ${code}를 10분 안에 입력해주세요.`
        }
      );
    } catch (e) {
      throw new InternalServerException('SMS 발송 실패');
    }
  }

  private getToday() {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '');
  }

  private async generateCode(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async verifyCode(dto: VerifyCodeDto) {
    const { phoneNumber, code } = dto

    const storedCode = await this.redisService.get(`verify:${phoneNumber}`);
    if (!storedCode) throw new UnauthorizedException('인증번호 만료');
    if (storedCode !== code) throw new ForbiddenException('인증번호 불일치');

    await this.redisService.del(`verify:${phoneNumber}`);

    return true;
  }
}
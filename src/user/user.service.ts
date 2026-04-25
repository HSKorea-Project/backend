import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ForbiddenException } from 'src/global/error/custom.exception';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InquiryEntity } from '../inquiry/inquiry.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(InquiryEntity)
    private readonly inquiryRepo: Repository<InquiryEntity>,
  ) {}

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
}
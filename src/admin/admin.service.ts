import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from 'src/global/error/custom.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>
  ) {}

  async login(adminId: string, password: string) {
    const admin = await this.adminRepository.findOne({ where: { adminId } });
    if (!admin) throw new UnauthorizedException('사용자가 존재하지 않습니다.');

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');

    const payload = {
      sub: admin.id,
      adminId: admin.adminId
    };

    return {
      message: "관리자 로그인 성공",
      data: {
        accessToken: this.jwtService.sign(payload)
      }
    };
  }
}

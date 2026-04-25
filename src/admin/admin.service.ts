import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from './admin.entity';
import { AdminDto } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async login(adminDto: AdminDto) {
    const { adminId, password, deviceId } = adminDto;
  
    const admin = await this.adminRepository.findOne({ where: { adminId } });
    if (!admin) throw new UnauthorizedException('인증 실패');
  
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) throw new UnauthorizedException('인증 실패');
  
    return {
      admin,
      deviceId
    };
  }
}
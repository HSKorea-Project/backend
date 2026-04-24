import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Admin } from './admin.entity';
import { AdminDto } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async login(adminDto: AdminDto) {
    const { adminId, password, deviceId } = adminDto;

    const admin = await this.adminRepository.findOne({ where: { adminId } });
    if (!admin) throw new UnauthorizedException('인증 실패');
  
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) throw new UnauthorizedException('인증 실패');
  
    const jti = randomUUID();
  
    const accessToken = this.jwtService.sign(
      { sub: admin.id, adminId },
      { expiresIn: '1h' },
    );
  
    const refreshToken = this.jwtService.sign(
      { sub: admin.id, adminId, deviceId, jti },
      { expiresIn: '7d' },
    );
  
    await this.redis.set(
      `session:${admin.id}:${deviceId}`,
      JSON.stringify({ jti }),
      'EX',
      60 * 60 * 24 * 7,
    );
  
    return {
      accessToken,
      refreshToken,
      deviceId,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('토큰 없음');
  
    const decoded = this.jwtService.verify(refreshToken);
    if (!decoded) throw new UnauthorizedException('유효하지 않은 토큰');

    const { sub, adminId, deviceId, jti } = decoded;
  
    const session = await this.redis.get(`session:${sub}:${deviceId}`);
    if (!session) throw new UnauthorizedException('세션 없음');
  
    const parsed = JSON.parse(session);
    if (parsed.jti !== jti) throw new UnauthorizedException('재사용 의심 토큰');
  
    const newAccessToken = this.jwtService.sign(
      { sub, adminId },
      { expiresIn: '1h' },
    );
  
    return { accessToken: newAccessToken, deviceId: deviceId };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('토큰 없음');

    const decoded = this.jwtService.verify(refreshToken);
    if (!decoded) throw new UnauthorizedException('유효하지 않은 토큰');

    const { sub, deviceId } = decoded;

    await this.redis.del(`session:${sub}:${deviceId}`);
    return;
  }
}
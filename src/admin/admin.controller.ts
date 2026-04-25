import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { AdminDto } from './admin.dto';
import { AdminGuard } from '@/src/guards';
import { ApiCookieAuth } from '@nestjs/swagger';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Req() req: Request, @Body() body: AdminDto) {
    const data = await this.adminService.login(body);

    req.session.user = {
      id: data.admin.id,
      role: 'admin',
      deviceId: data.deviceId
    };

    return {
      message: '로그인 성공'
    };
  }

  @ApiCookieAuth('connect.sid')
  @UseGuards(AdminGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    req.session.destroy(() => {});
  
    return {
      message: '로그아웃 성공'
    };
  }
}
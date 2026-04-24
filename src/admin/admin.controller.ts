import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { AdminDto } from './admin.dto';
import { AdminGuard } from '@/src/guards';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(
    @Body() body: AdminDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const data = await this.adminService.login(body);

    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return {
      message: '로그인 성공',
      data: { accessToken: data.accessToken, deviceId: data.deviceId },
    };
  }


  @UseGuards(AdminGuard)
  @Post('refresh')
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken;
    const data = await this.adminService.refresh(refreshToken);

    return {
      message: '토큰 재발급 성공',
      data: { accessToken: data.accessToken, deviceId: data.deviceId },
    };
  }

  @UseGuards(AdminGuard)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    await this.adminService.logout(refreshToken);
    res.clearCookie('refreshToken');

    return {
      message: '로그아웃 성공'
    };
  }
}
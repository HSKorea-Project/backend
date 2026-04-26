import { Controller, Req, Post, Body, Param } from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { PwCheckDto } from './dtos/password.dto';
import { SendCodeDto, VerifyCodeDto } from './dtos/code.dto';

@Controller('user')
export class UserController {
  constructor( private readonly userService: UserService ) {}

  @Post(':id/pwCheck')
  async authPost(
    @Param('id') postId: string,
    @Body() dto: PwCheckDto,
    @Req() req: Request,
  ) {
    const data = await this.userService.authenticate(postId, dto.password);

    req.session.inquiryAuth = {
      ...req.session.inquiryAuth,
      [data.inquiryId]: true,
    };

    return {
      message: '인증 성공'
    };
  }

  @Post('sendCode')
  async codePost(
    @Body() dto: SendCodeDto
  ) {
    await this.userService.sendCode(dto);
    return {
      message: '인증번호 발송 완료'
    };
  }

  @Post('checkCode')
  async checkPost(
    @Body() dto: VerifyCodeDto
  ) {
    await this.userService.verifyCode(dto);
    return {
      message: '인증 성공'
    };
  }
}
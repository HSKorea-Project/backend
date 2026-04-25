import { Controller, Req, Post, Body, Param } from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { PwCheckDto } from './pwCheckDto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post(':id/pwCheck')
  async authPost(
    @Param('id') postId: string,
    @Body() pwCheckDto: PwCheckDto,
    @Req() req: Request,
  ) {
    const data = await this.userService.authenticate(postId, pwCheckDto.password);

    req.session.inquiryAuth = { [data.inquiryId]: true };

    return {
      message: '인증 성공'
    };
  }
}
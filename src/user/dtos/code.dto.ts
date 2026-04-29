import { isString, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendCodeDto {
  @ApiProperty({
    description: "휴대폰 번호",
    example: '01012341234',
  })
  @IsString()
  @Matches(/^010\d{8}$/)
  phoneNumber: string;
}

export class VerifyCodeDto {
  @ApiProperty({
    description: "휴대폰 번호",
    example: "01012341234",
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: "인증번호",
    example: "1234",
  })
  @IsString()
  code: string;
}
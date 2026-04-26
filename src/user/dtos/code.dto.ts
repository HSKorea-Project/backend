import { IsString, Matches } from 'class-validator';

export class SendCodeDto {
  @IsString()
  @Matches(/^010\d{8}$/)
  phoneNumber: string;
}

export class VerifyCodeDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  code: string;
}
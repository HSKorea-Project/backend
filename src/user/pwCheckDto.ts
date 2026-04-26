import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class PwCheckDto {
  @ApiProperty({ example: '1234' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
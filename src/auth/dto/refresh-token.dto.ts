import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class RefreshTokenDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

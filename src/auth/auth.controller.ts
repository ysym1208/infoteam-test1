import {
  Controller,
  Post,
  Body,
  Request,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    return this.authService.register(name, email, password);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true }))
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const { userId, refreshToken } = refreshTokenDto;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true }))
  async logout(@Body() logoutDto: LogoutDto) {
    const { userId } = logoutDto;
    return this.authService.logout(userId);
  }
}

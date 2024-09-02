import { Controller, Post, Body, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body) {
    const { name, email, password } = body;
    return this.authService.register(name, email, password);
  }

  @Post('login')
  async login(@Body() body) {
    return this.authService.login(body);
  }
}

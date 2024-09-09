import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 로그인 시 Access Token과 Refresh Token 발급
  async login(user: any) {
    const payload = { email: user.email, sub: user.id };

    // Access Token 발급
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m', // Access Token은 15분 동안 유효
    });

    // Refresh Token 발급
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d', // Refresh Token은 7일 동안 유효
    });

    // Refresh Token을 데이터베이스에 저장
    await this.userService.saveRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async register(name: string, email: string, password: string) {
    const user = await this.userService.createUser(name, email, password);
    return this.login(user); // 회원가입 시에도 Access Token과 Refresh Token 발급
  }

  // Refresh Token을 통해 새로운 Access Token과 Refresh Token을 발급
  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 저장된 Refresh Token과 요청된 Refresh Token을 비교
    const isTokenValid = await this.validateRefreshToken(userId, refreshToken);
    if (!isTokenValid) {
      throw new Error('Invalid refresh token');
    }

    const payload = { email: user.email, sub: user.id };

    // 새로운 Access Token 발급
    const newAccessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    // 새로운 Refresh Token 발급
    const newRefreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    // 새 Refresh Token을 데이터베이스에 저장
    await this.userService.saveRefreshToken(userId, newRefreshToken);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  // 로그아웃 시 Refresh Token 삭제
  async logout(userId: number) {
    return this.userService.removeRefreshToken(userId);
  }

  private async validateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.userService.findUserById(userId);
    return user.refreshToken === refreshToken; // 저장된 Refresh Token과 비교
  }
}

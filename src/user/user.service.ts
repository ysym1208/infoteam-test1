import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto'; // UpdateUserDto를 불러옴

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(name: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  }

  // 이메일을 통해 사용자 찾기
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // ID를 통해 사용자 찾기
  async findUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // 사용자 업데이트 (name, email 등을 업데이트)
  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });
  }

  // 사용자에게 Refresh Token 저장
  async saveRefreshToken(userId: number, refreshToken: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  // 사용자의 Refresh Token 삭제 (로그아웃 시)
  async removeRefreshToken(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}


import { Controller, Get, Post, Body, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetupDto } from './dto/setup.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../../prisma/generated/enums';

@Controller('auth')
export class SetupController {
  constructor(private prisma: PrismaService) {}

  @Get('setup-required')
  async checkSetupRequired() {
    const userCount = await this.prisma.user.count();
    return { setupRequired: userCount === 0 };
  }

  @Post('setup')
  async setup(@Body() dto: SetupDto) {
    const userCount = await this.prisma.user.count();
    if (userCount > 0) {
      throw new ForbiddenException('Setup has already been completed');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password_hash: hashedPassword,
        role: UserRole.admin,
        full_name: 'Administrator',
      },
    });

    return { message: 'Admin account created successfully', userId: user.id };
  }
}

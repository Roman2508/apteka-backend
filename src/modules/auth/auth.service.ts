import * as bcrypt from "bcrypt"
import { JwtService } from "@nestjs/jwt"
import { Injectable, ConflictException, UnauthorizedException } from "@nestjs/common"

import { PrismaService } from "../../core/prisma/prisma.service"
import { UserRole } from "../../../prisma/generated/enums"
import { JwtPayload, AuthResponse } from "./interfaces/auth.interface"

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return null
    }

    return user
  }

  async login(username: string, password: string, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    const user = await this.validateUser(username, password)

    if (!user) {
      throw new UnauthorizedException("Invalid credentials")
    }

    if (!user.is_active) {
      throw new UnauthorizedException("User account is inactive")
    }

    let pharmacyId: number | null = null

    // Для обычных пользователей (не админов) определяем аптеку автоматически
    if (user.role !== UserRole.admin) {
      // Ищем привязку к аптеке
      const staffRecord = await this.prisma.pharmacyStaff.findFirst({
        where: { userId: user.id },
        select: { pharmacyId: true },
      })

      if (!staffRecord) {
        // Если пользователь не персонал, проверяем, может он владелец (хотя владелец обычно имеет и роль)
        // Но по ТЗ "по id пользователя бекенд сам находит нужную аптеку"
        const ownedPharmacy = await this.prisma.pharmacy.findUnique({
          where: { ownerId: user.id },
          select: { id: true },
        })

        if (ownedPharmacy) {
          pharmacyId = ownedPharmacy.id
        } else {
          throw new UnauthorizedException("User is not assigned to any pharmacy")
        }
      } else {
        pharmacyId = staffRecord.pharmacyId
      }

      // Проверяем активную сессию
      const activeSession = await this.prisma.userSession.findFirst({
        where: {
          userId: user.id,
          logoutAt: null,
        },
      })

      if (activeSession) {
        throw new ConflictException(
          "User already has an active session. Please logout first or wait for automatic session closure.",
        )
      }
    }

    let session: any
    // Создаем новую сессию (открываем смену) ТОЛЬКО для не-админов
    if (user.role !== UserRole.admin) {
      session = await this.prisma.userSession.create({
        data: {
          userId: user.id,
          pharmacyId,
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      })
    }

    // Генерируем JWT токен
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      sessionId: session?.id,
    }

    const access_token = this.jwtService.sign(payload)

    return {
      access_token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
      session: session
        ? {
            id: session.id,
            loginAt: session.loginAt,
          }
        : undefined,
    }
  }

  async logout(userId: number, sessionId: number) {
    const session = await this.prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId: userId,
      },
    })

    if (!session) {
      throw new UnauthorizedException("Session not found")
    }

    if (session.logoutAt) {
      throw new ConflictException("Session already closed")
    }

    // Закрываем сессию (завершаем смену)
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        logoutAt: new Date(),
        auto_closed: false,
      },
    })

    // Вычисляем длительность смены
    const duration = this.calculateShiftDuration(session.loginAt, new Date())

    return {
      message: "Logout successful",
      shiftDuration: duration,
    }
  }

  async getActiveSession(userId: number) {
    return this.prisma.userSession.findFirst({
      where: {
        userId,
        logoutAt: null,
      },
      include: {
        pharmacy: {
          select: {
            id: true,
            number: true,
            address: true,
          },
        },
      },
    })
  }

  private calculateShiftDuration(loginAt: Date, logoutAt: Date): string {
    const durationMs = logoutAt.getTime() - loginAt.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""}`
    }
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`
  }
}

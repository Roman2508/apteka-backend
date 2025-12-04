import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkShiftService {
  private readonly logger = new Logger(WorkShiftService.name);

  constructor(private prisma: PrismaService) {}

  // Запускается каждую минуту для тестирования
  // В продакшене можно изменить на CronExpression.EVERY_HOUR или реже
  @Cron(CronExpression.EVERY_MINUTE)
  async autoCloseExpiredShifts() {
    const shiftTimeoutHours = parseInt(
      process.env.SHIFT_AUTO_CLOSE_HOURS || '4',
      10,
    );

    // Вычисляем время отсечки: текущее время - N часов
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - shiftTimeoutHours);

    this.logger.debug(
      `Checking for shifts older than ${shiftTimeoutHours} hours (before ${cutoffTime.toISOString()})`,
    );

    // Находим все открытые сессии старше cutoffTime
    const expiredSessions = await this.prisma.userSession.findMany({
      where: {
        loginAt: { lt: cutoffTime },
        logoutAt: null,
      },
      include: {
        user: {
          select: { username: true, role: true },
        },
        pharmacy: {
          select: { number: true },
        },
      },
    });

    if (expiredSessions.length === 0) {
      this.logger.debug('No expired sessions found');
      return;
    }

    this.logger.warn(
      `Found ${expiredSessions.length} expired session(s) to auto-close`,
    );

    // Закрываем каждую просроченную сессию
    for (const session of expiredSessions) {
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: {
          logoutAt: new Date(),
          auto_closed: true,
        },
      });

      const duration = this.calculateShiftDuration(session.loginAt, new Date());

      this.logger.warn(
        `Auto-closed shift for user ${session.user.username} (${session.user.role}) ` +
          `at pharmacy ${session.pharmacy.number}. Duration: ${duration}`,
      );
    }
  }

  async getActiveShifts() {
    return this.prisma.userSession.findMany({
      where: {
        logoutAt: null,
      },
      include: {
        user: {
          select: { id: true, username: true, full_name: true, role: true },
        },
        pharmacy: {
          select: { id: true, number: true, address: true },
        },
      },
      orderBy: { loginAt: 'desc' },
    });
  }

  async getShiftDuration(sessionId: number): Promise<string | null> {
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return null;
    }

    const endTime = session.logoutAt || new Date();
    return this.calculateShiftDuration(session.loginAt, endTime);
  }

  private calculateShiftDuration(loginAt: Date, logoutAt: Date): string {
    const durationMs = logoutAt.getTime() - loginAt.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}

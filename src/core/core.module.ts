import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../modules/prisma/prisma.module';
import { MedicalProductModule } from '../modules/medical-product/medical-product.module';
import { AuthModule } from '../modules/auth/auth.module';
import { WorkShiftModule } from '../modules/work-shift/work-shift.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    WorkShiftModule,
    MedicalProductModule,
  ],
})
export class CoreModule {}

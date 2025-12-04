import { Module } from '@nestjs/common';
import { WorkShiftService } from './work-shift.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WorkShiftService],
  exports: [WorkShiftService],
})
export class WorkShiftModule {}

import { Module } from "@nestjs/common"
import { PharmacyStaffController } from "./pharmacy-staff.controller"
import { PharmacyStaffService } from "./pharmacy-staff.service"
import { PrismaModule } from "../../core/prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  controllers: [PharmacyStaffController],
  providers: [PharmacyStaffService],
  exports: [PharmacyStaffService],
})
export class PharmacyStaffModule {}

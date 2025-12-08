import { Module } from "@nestjs/common"
import { PharmacyChainController } from "./pharmacy-chain.controller"
import { PharmacyChainService } from "./pharmacy-chain.service"
import { PrismaModule } from "../prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  controllers: [PharmacyChainController],
  providers: [PharmacyChainService],
  exports: [PharmacyChainService],
})
export class PharmacyChainModule {}

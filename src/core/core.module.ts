import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { ScheduleModule } from "@nestjs/schedule"
import { PrismaModule } from "../modules/prisma/prisma.module"
import { MedicalProductModule } from "../modules/medical-product/medical-product.module"
import { AuthModule } from "../modules/auth/auth.module"
import { WorkShiftModule } from "../modules/work-shift/work-shift.module"
import { ScanModule } from "../modules/scan/scan.module"
import { PharmacyChainModule } from "../modules/pharmacy-chain/pharmacy-chain.module"
import { UserModule } from "../modules/user/user.module"
import { CounterpartyModule } from "../modules/counterparty/counterparty.module"
import { WarehouseModule } from "../modules/warehouse/warehouse.module"
import { InventoryModule } from "../modules/inventory/inventory.module"
import { ProductBatchModule } from "../modules/product-batch/product-batch.module"
import { DocumentsModule } from "../modules/documents/documents.module"
import { DocumentItemModule } from "../modules/document-item/document-item.module"
import { PharmacyModule } from "src/modules/pharmacy/pharmacy.module"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    WorkShiftModule,
    MedicalProductModule,
    ScanModule,
    PharmacyChainModule,
    PharmacyModule,
    UserModule,
    CounterpartyModule,
    // Logistics
    WarehouseModule,
    InventoryModule,
    ProductBatchModule,
    DocumentsModule,
    DocumentItemModule,
  ],
})
export class CoreModule {}

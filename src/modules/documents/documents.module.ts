import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { ProductBatchModule } from '../product-batch/product-batch.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PharmacyModule } from '../pharmacy/pharmacy.module';
import { WarehouseModule } from '../warehouse/warehouse.module';

@Module({
  imports: [ProductBatchModule, InventoryModule, PharmacyModule, WarehouseModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}

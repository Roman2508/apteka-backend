import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { ProductBatchModule } from '../product-batch/product-batch.module';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
  imports: [ProductBatchModule],
})
export class InventoryModule {}

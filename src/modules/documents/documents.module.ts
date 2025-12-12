import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { ProductBatchModule } from '../product-batch/product-batch.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [ProductBatchModule, InventoryModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}

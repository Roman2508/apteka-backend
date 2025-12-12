import { Module } from '@nestjs/common';
import { ProductBatchService } from './product-batch.service';
import { ProductBatchController } from './product-batch.controller';

@Module({
  controllers: [ProductBatchController],
  providers: [ProductBatchService],
  exports: [ProductBatchService],
})
export class ProductBatchModule {}

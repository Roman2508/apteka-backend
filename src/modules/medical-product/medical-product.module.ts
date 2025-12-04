import { Module } from '@nestjs/common';
import { MedicalProductService } from './medical-product.service';
import { MedicalProductController } from './medical-product.controller';

@Module({
  controllers: [MedicalProductController],
  providers: [MedicalProductService],
  exports: [MedicalProductService],
})
export class MedicalProductModule {}

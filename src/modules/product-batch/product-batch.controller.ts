import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { ProductBatchService } from './product-batch.service';
import { UpdateProductBatchDto } from './dto/update-product-batch.dto';
import { CreateProductBatchDto } from './dto/create-product-batch.dto';

@Controller('product-batch')
export class ProductBatchController {
  constructor(private readonly productBatchService: ProductBatchService) {}

  @Post()
  create(@Body() createProductBatchDto: CreateProductBatchDto) {
    return this.productBatchService.create(createProductBatchDto);
  }

  @Get()
  findAll() {
    return this.productBatchService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productBatchService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductBatchDto: UpdateProductBatchDto) {
    return this.productBatchService.update(+id, updateProductBatchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productBatchService.remove(+id);
  }
}

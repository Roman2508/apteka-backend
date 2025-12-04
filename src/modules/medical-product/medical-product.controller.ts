import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { MedicalProductService } from './medical-product.service';
import { CreateMedicalProductDto } from './dto/create-medical-product.dto';
import { UpdateMedicalProductDto } from './dto/update-medical-product.dto';

@Controller('medical-products')
export class MedicalProductController {
  constructor(private readonly medicalProductService: MedicalProductService) {}

  @Post()
  create(@Body() createMedicalProductDto: CreateMedicalProductDto) {
    return this.medicalProductService.create(createMedicalProductDto);
  }

  @Get()
  findAll() {
    return this.medicalProductService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicalProductService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedicalProductDto: UpdateMedicalProductDto,
  ) {
    return this.medicalProductService.update(id, updateMedicalProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicalProductService.remove(id);
  }
}

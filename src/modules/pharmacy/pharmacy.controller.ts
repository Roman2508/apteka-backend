import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from "@nestjs/common"

import { PharmacyService } from "./pharmacy.service"
import { CreatePharmacyDto } from "./dto/create-pharmacy.dto"
import { UpdatePharmacyDto } from "./dto/update-pharmacy.dto"
import { JwtAuthGuard } from "../../shared/guards/jwt-auth.guard"

@Controller("pharmacy")
@UseGuards(JwtAuthGuard)
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Post()
  create(@Body() createPharmacyDto: CreatePharmacyDto) {
    return this.pharmacyService.create(createPharmacyDto)
  }

  @Get()
  findAll() {
    return this.pharmacyService.findAll()
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.pharmacyService.findOne(id)
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdatePharmacyDto) {
    return this.pharmacyService.update(id, dto)
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.pharmacyService.remove(id)
  }
}

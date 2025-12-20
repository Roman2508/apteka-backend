import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from "@nestjs/common"

import { PharmacyService } from "./pharmacy.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { CreatePharmacyDto } from "./dto/create-pharmacy.dto"
import { UpdatePharmacyDto } from "./dto/update-pharmacy.dto"

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
  update(@Param("id", ParseIntPipe) id: number, @Body() updatePharmacyDto: UpdatePharmacyDto) {
    return this.pharmacyService.update(id, updatePharmacyDto)
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.pharmacyService.remove(id)
  }
}

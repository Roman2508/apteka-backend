import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from "@nestjs/common"

import { JwtAuthGuard } from "../../shared/guards/jwt-auth.guard"
import { PharmacyStaffService } from "./pharmacy-staff.service"
import { CreatePharmacyStaffDto } from "./dto/create-pharmacy-staff.dto"
import { UpdatePharmacyStaffDto } from "./dto/update-pharmacy-staff.dto"

@Controller("pharmacy-staff")
@UseGuards(JwtAuthGuard)
export class PharmacyStaffController {
  constructor(private readonly pharmacyStaffService: PharmacyStaffService) {}

  @Post()
  create(@Body() dto: CreatePharmacyStaffDto) {
    return this.pharmacyStaffService.create(dto)
  }

  @Get(":id")
  findByPharmacyId(@Param("id", ParseIntPipe) id: number) {
    return this.pharmacyStaffService.findByPharmacyId(id)
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdatePharmacyStaffDto) {
    return this.pharmacyStaffService.update(id, dto)
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.pharmacyStaffService.remove(id)
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from "@nestjs/common"
import { PharmacyChainService } from "./pharmacy-chain.service"
import { CreatePharmacyChainDto } from "./dto/create-pharmacy-chain.dto"
import { UpdatePharmacyChainDto } from "./dto/update-pharmacy-chain.dto"
import { JwtAuthGuard } from "../../shared/guards/jwt-auth.guard"

@Controller("pharmacy-chains")
@UseGuards(JwtAuthGuard)
export class PharmacyChainController {
  constructor(private readonly pharmacyChainService: PharmacyChainService) {}

  @Post()
  create(@Body() createPharmacyChainDto: CreatePharmacyChainDto) {
    return this.pharmacyChainService.create(createPharmacyChainDto)
  }

  @Get()
  findAll() {
    return this.pharmacyChainService.findAll()
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.pharmacyChainService.findOne(id)
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() updatePharmacyChainDto: UpdatePharmacyChainDto) {
    return this.pharmacyChainService.update(id, updatePharmacyChainDto)
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.pharmacyChainService.remove(id)
  }
}

import { Injectable, NotFoundException } from "@nestjs/common"

import { PrismaService } from "../../core/prisma/prisma.service"
import { CreateInventoryDto } from "./dto/create-inventory.dto"
import { UpdateInventoryDto } from "./dto/update-inventory.dto"

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(createInventoryDto: CreateInventoryDto) {
    return this.prisma.inventory.create({
      data: {
        warehouseId: createInventoryDto.warehouseId,
        batchId: createInventoryDto.batchId,
        quantity: createInventoryDto.quantity || 0,
        reserved_quantity: createInventoryDto.reserved_quantity || 0,
      },
    })
  }

  // not used
  async findAll() {
    return this.prisma.inventory.findMany({
      include: {
        warehouse: true,
        batch: {
          include: {
            product: true,
          },
        },
      },
    })
  }

  async findById(id: number) {
    return this.prisma.inventory.findMany({ where: { id } })
  }

  // find by warehouseId
  async findOneByWarehouseId(warehouseId: number) {
    return this.prisma.inventory.findMany({
      where: { warehouseId },
      include: {
        batch: {
          include: {
            product: true,
          },
        },
      },
    })
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    await this.findById(id)
    return this.prisma.inventory.update({
      where: { id },
      data: updateInventoryDto,
    })
  }

  async remove(id: number) {
    await this.findById(id)
    return this.prisma.inventory.delete({
      where: { id },
    })
  }
}

import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
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

  async findOne(id: number) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: {
        warehouse: true,
        batch: {
          include: {
            product: true,
          },
        },
      },
    })
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`)
    }
    return inventory
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    await this.findOne(id)
    return this.prisma.inventory.update({
      where: { id },
      data: updateInventoryDto,
    })
  }

  async remove(id: number) {
    await this.findOne(id)
    return this.prisma.inventory.delete({
      where: { id },
    })
  }
}

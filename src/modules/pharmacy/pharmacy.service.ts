import { Injectable, NotFoundException } from "@nestjs/common"

import { CreatePharmacyDto } from "./dto/create-pharmacy.dto"
import { UpdatePharmacyDto } from "./dto/update-pharmacy.dto"
import { PrismaService } from "../../core/prisma/prisma.service"

@Injectable()
export class PharmacyService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePharmacyDto) {
    const pharmacyData: any = { number: dto.number, address: dto.address }

    if (dto.ownerId) {
      pharmacyData.owner = { connect: { id: +dto.ownerId } }
    }

    if (dto.chainId) {
      pharmacyData.chain = { connect: { id: +dto.chainId } }
    }

    return await this.prisma.$transaction(async (tx) => {
      const pharmacy = await tx.pharmacy.create({
        data: pharmacyData,
        include: {
          owner: { omit: { password_hash: true } },
          chain: true,
        },
      })

      await tx.warehouse.create({
        data: {
          pharmacy: { connect: { id: pharmacy.id } },
          name: `Основний склад аптеки ${pharmacy.number}`,
        },
      })

      return pharmacy
    })
  }

  async findAll() {
    const pharmacies = await this.prisma.pharmacy.findMany({
      include: {
        owner: { omit: { password_hash: true } },
        chain: true,
      },
      orderBy: { createdAt: "asc" },
    })

    return pharmacies
  }

  async findOne(id: number) {
    const chain = await this.prisma.pharmacy.findUnique({
      where: { id },
      include: {
        owner: { omit: { password_hash: true } },
        chain: true,
        warehouses: true,
      },
    })

    if (!chain) {
      throw new NotFoundException(`Pharmacy chain with ID ${id} not found`)
    }

    return chain
  }

  async update(id: number, dto: UpdatePharmacyDto) {
    const oldPharmacyData = await this.findOne(id)

    const pharmacyData: any = { number: dto.number, address: dto.address }

    if (dto.ownerId) {
      pharmacyData.owner = { connect: { id: +dto.ownerId } }
    }

    if (dto.chainId) {
      pharmacyData.chain = { connect: { id: +dto.chainId } }
    }

    if (oldPharmacyData.number !== dto.number) {
      const warehousesIds = oldPharmacyData.warehouses.map((warehouse) => warehouse.id)
      // Якщо було оновлено номер аптеки, то оновлюємо назви складів
      // Треба буде переробити коли зроблю можливість вказувати назву складу
      await this.prisma.warehouse.updateMany({
        where: { id: { in: warehousesIds } },
        data: { name: `Основний склад аптеки ${dto.number}` },
      })
    }

    return this.prisma.pharmacy.update({
      where: { id },
      data: pharmacyData,
      include: {
        owner: { omit: { password_hash: true } },
        chain: true,
      },
    })
  }

  async remove(id: number) {
    return this.prisma.pharmacy.delete({ where: { id } })
  }
}

import { Injectable, NotFoundException } from "@nestjs/common"

import { PrismaService } from "../prisma/prisma.service"
import { CreatePharmacyDto } from "./dto/create-pharmacy.dto"
import { UpdatePharmacyDto } from "./dto/update-pharmacy.dto"

@Injectable()
export class PharmacyService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePharmacyDto) {
    const ownerId = Number(dto.ownerId)
    const chainId = Number(dto.chainId)

    if (isNaN(ownerId) || isNaN(chainId)) {
      throw new Error("Invalid owner or chain ID")
    }

    return this.prisma.pharmacy.create({
      data: {
        number: dto.number,
        address: dto.address,
        chain: { connect: { id: chainId } },
        owner: { connect: { id: ownerId } },
      },
      include: {
        owner: { omit: { password_hash: true } },
        chain: true,
      },
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
      },
    })

    if (!chain) {
      throw new NotFoundException(`Pharmacy chain with ID ${id} not found`)
    }

    return chain
  }

  async update(id: number, updatePharmacyDto: UpdatePharmacyDto) {
    await this.findOne(id)

    const ownerId = Number(updatePharmacyDto.ownerId)
    const chainId = Number(updatePharmacyDto.chainId)

    if (isNaN(ownerId) || isNaN(chainId)) {
      throw new Error("Invalid owner or chain ID")
    }

    return this.prisma.pharmacy.update({
      where: { id },
      data: {
        number: updatePharmacyDto.number,
        address: updatePharmacyDto.address,
        chain: { connect: { id: chainId } },
        owner: { connect: { id: ownerId } },
      },
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

import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreatePharmacyDto } from "./dto/create-pharmacy.dto"
import { UpdatePharmacyDto } from "./dto/update-pharmacy.dto"

@Injectable()
export class PharmacyService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePharmacyDto) {
    return this.prisma.pharmacy.create({
      data: {
        number: dto.number,
        address: dto.address,
        chain: { connect: { id: dto.chainId } },
        owner: { connect: { id: dto.ownerId } },
      },
      include: {
        owner: true,
        chain: true,
      },
    })
  }

  async findAll() {
    const pharmacies = await this.prisma.pharmacy.findMany({
      include: {
        owner: true,
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
        owner: true,
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

    return this.prisma.pharmacy.update({
      where: { id },
      data: updatePharmacyDto,
      include: {
        owner: true,
        chain: true,
      },
    })
  }

  async remove(id: number) {
    return this.prisma.pharmacy.delete({ where: { id } })
  }
}

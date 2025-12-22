import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { PrismaService } from "../../core/prisma/prisma.service"
import { CreatePharmacyChainDto } from "./dto/create-pharmacy-chain.dto"
import { UpdatePharmacyChainDto } from "./dto/update-pharmacy-chain.dto"

@Injectable()
export class PharmacyChainService {
  constructor(private prisma: PrismaService) {}

  async create(createPharmacyChainDto: CreatePharmacyChainDto) {
    // Check for duplicate EDRPOU code
    if (createPharmacyChainDto.edrpou_code) {
      const existing = await this.prisma.pharmacyChain.findUnique({
        where: { edrpou_code: createPharmacyChainDto.edrpou_code },
      })
      if (existing) {
        throw new ConflictException("Pharmacy chain with this EDRPOU code already exists")
      }
    }

    return this.prisma.pharmacyChain.create({
      data: createPharmacyChainDto,
      include: {
        pharmacies: {
          include: {
            owner: {
              select: { id: true, username: true, full_name: true },
            },
          },
        },
      },
    })
  }

  async findAll() {
    const chains = await this.prisma.pharmacyChain.findMany({
      include: {
        _count: {
          select: { pharmacies: true },
        },
        pharmacies: {
          include: {
            owner: {
              select: { id: true, username: true, full_name: true, role: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    })

    return chains.map((chain) => ({
      ...chain,
      pharmacyCount: chain._count.pharmacies,
      userCount: chain.pharmacies.length,
    }))
  }

  async findOne(id: number) {
    const chain = await this.prisma.pharmacyChain.findUnique({
      where: { id },
      include: {
        pharmacies: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                full_name: true,
                email: true,
                role: true,
                is_active: true,
              },
            },
          },
        },
      },
    })

    if (!chain) {
      throw new NotFoundException(`Pharmacy chain with ID ${id} not found`)
    }

    return chain
  }

  async update(id: number, updatePharmacyChainDto: UpdatePharmacyChainDto) {
    await this.findOne(id)

    // Check for duplicate EDRPOU code if being updated
    if (updatePharmacyChainDto.edrpou_code) {
      const existing = await this.prisma.pharmacyChain.findFirst({
        where: {
          edrpou_code: updatePharmacyChainDto.edrpou_code,
          NOT: { id },
        },
      })
      if (existing) {
        throw new ConflictException("Pharmacy chain with this EDRPOU code already exists")
      }
    }

    return this.prisma.pharmacyChain.update({
      where: { id },
      data: updatePharmacyChainDto,
      include: {
        pharmacies: {
          include: {
            owner: {
              select: { id: true, username: true, full_name: true },
            },
          },
        },
      },
    })
  }

  async remove(id: number) {
    const chain = await this.findOne(id)

    // Check if chain has pharmacies
    if (chain.pharmacies.length > 0) {
      throw new ConflictException(
        `Cannot delete pharmacy chain with ${chain.pharmacies.length} pharmacies. Remove pharmacies first.`,
      )
    }

    return this.prisma.pharmacyChain.delete({
      where: { id },
    })
  }
}

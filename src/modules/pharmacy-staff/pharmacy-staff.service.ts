import { ConflictException, Injectable, NotFoundException } from "@nestjs/common"

import { PrismaService } from "../../core/prisma/prisma.service"
import { CreatePharmacyStaffDto } from "./dto/create-pharmacy-staff.dto"
import { UpdatePharmacyStaffDto } from "./dto/update-pharmacy-staff.dto"

@Injectable()
export class PharmacyStaffService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePharmacyStaffDto) {
    const existing = await this.prisma.pharmacyStaff.findFirst({
      where: { pharmacyId: dto.pharmacyId, userId: dto.userId },
    })

    if (existing) {
      throw new ConflictException("Такий користувач вже має реєстрацію в цій аптекі")
    }

    return this.prisma.pharmacyStaff.create({ data: dto })
  }

  async findByPharmacyId(id: number) {
    const chain = await this.prisma.pharmacyStaff.findMany({
      where: { pharmacyId: id },
      include: {
        pharmacy: {
          include: {
            chain: true,
            owner: { select: { id: true, username: true, full_name: true, email: true } },
          },
        },
        user: { select: { id: true, username: true, full_name: true, email: true } },
      },
    })

    if (!chain) {
      throw new NotFoundException(`Pharmacy staff with ID ${id} not found`)
    }
    return chain
  }

  // internal use only
  async findOne(id: number) {
    const staff = await this.prisma.pharmacyStaff.findUnique({ where: { id } })
    if (!staff) {
      throw new NotFoundException(`Pharmacy staff with ID ${id} not found`)
    }
    return staff
  }

  async update(id: number, dto: UpdatePharmacyStaffDto) {
    await this.findOne(id)

    const existing = await this.prisma.pharmacyStaff.findFirst({
      where: {
        pharmacyId: dto.pharmacyId,
        userId: dto.userId,
        NOT: { id },
      },
    })
    if (existing) {
      throw new ConflictException("Такий користувач вже має реєстрацію в цій аптекі")
    }

    return this.prisma.pharmacyStaff.update({ where: { id }, data: dto })
  }

  async remove(id: number) {
    await this.findOne(id)
    return this.prisma.pharmacyStaff.delete({ where: { id } })
  }
}

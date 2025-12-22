import * as bcrypt from "bcrypt"
import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common"

import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { UserRole } from "../../../prisma/generated/enums"
import { PrismaService } from "../../core/prisma/prisma.service"

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, pharmacy, ...userData } = createUserDto

    // Check for duplicate username
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: userData.username },
    })

    if (existingUsername) {
      throw new ConflictException("Користувач з таким Username вже зареєстрований")
    }

    // Check for duplicate email
    if (userData.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: userData.email },
      })
      if (existingEmail) {
        throw new ConflictException("Email вже зареєстрований")
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // For non pharmacy workers (admins), just create user
    if (userData.role === UserRole.admin) {
      const user = await this.prisma.user.create({ data: { ...userData, password_hash } })
      return { ...user, password_hash: undefined }
    }

    if (!pharmacy) {
      throw new BadRequestException("Для працівника не вибрано аптечний пункт")
    }

    // Check if pharmacy exists
    const existingPharmacy = await this.prisma.pharmacy.findUnique({ where: { id: +pharmacy } })

    if (!existingPharmacy) {
      throw new NotFoundException("Аптечний пункт не знайдено")
    }

    // Create user and pharmacy staff in a transaction
    const ownedPharmacy = userData.role === UserRole.director ? { connect: { id: existingPharmacy.id } } : undefined

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { ...userData, password_hash, ownedPharmacy },
      })

      await tx.pharmacyStaff.create({
        data: {
          userId: user.id,
          pharmacyId: existingPharmacy.id,
          role_in_pharmacy: userData.role,
        },
      })

      return { ...user, password_hash: undefined, pharmacy }
    })
  }

  async findAll(chainId?: number) {
    const where = chainId ? { ownedPharmacy: { chainId: chainId } } : {}

    const users = await this.prisma.user.findMany({
      where,
      include: { ownedPharmacy: { include: { chain: true } } },
      orderBy: { full_name: "asc" },
    })

    return users.map((user) => ({
      ...user,
      password_hash: undefined,
    }))
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        ownedPharmacy: { include: { chain: true, warehouses: true } },
        staffAssignments: { include: { pharmacy: true } },
      },
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return { ...user, password_hash: undefined }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id)

    const { password, pharmacy, ...userData } = updateUserDto

    // Check for duplicate username
    if (userData.username) {
      const existingUsername = await this.prisma.user.findFirst({
        where: {
          username: userData.username,
          NOT: { id },
        },
      })
      if (existingUsername) {
        throw new ConflictException("Username already exists")
      }
    }

    // Check for duplicate email
    if (userData.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: {
          email: userData.email,
          NOT: { id },
        },
      })
      if (existingEmail) {
        throw new ConflictException("Email already exists")
      }
    }

    // Prepare update data
    const updateData: any = { ...userData }
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10)
    }

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        ownedPharmacy: { include: { chain: true } },
      },
    })

    // Update pharmacy if provided
    if (user.ownedPharmacy && pharmacy) {
      // if (user.ownedPharmacy && (pharmacyNumber || pharmacyAddress || pharmacy)) {
      await this.prisma.pharmacy.update({
        where: { id: user.ownedPharmacy.id },
        data: {
          // ...(pharmacyNumber && { number: pharmacyNumber }),
          // ...(pharmacyAddress && { address: pharmacyAddress }),
          ...(pharmacy && { id: +pharmacy }),
        },
      })
    }

    return {
      ...user,
      password_hash: undefined,
    }
  }

  async remove(id: number) {
    await this.findOne(id)

    // Check if user has active sessions
    const activeSessions = await this.prisma.userSession.count({
      where: {
        userId: id,
        logoutAt: null,
      },
    })

    if (activeSessions > 0) {
      throw new ConflictException("Cannot delete user with active sessions")
    }

    // Delete user (cascades to owned pharmacy, sessions, etc.)
    await this.prisma.user.delete({
      where: { id },
    })

    return { message: "User deleted successfully" }
  }
}

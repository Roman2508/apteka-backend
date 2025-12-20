import * as bcrypt from "bcrypt"
import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common"

import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { PrismaService } from "../prisma/prisma.service"
import { UserRole } from "../../../prisma/generated/enums"

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, chainId, pharmacyNumber, pharmacyAddress, ...userData } = createUserDto

    // Check for duplicate username
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: userData.username },
    })
    
    if (existingUsername) {
      throw new ConflictException("Username already exists")
    }

    // Check for duplicate email if provided
    if (userData.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: userData.email },
      })
      if (existingEmail) {
        throw new ConflictException("Email already exists")
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // For directors, validate and create pharmacy
    if (userData.role === UserRole.director) {
      if (!chainId) {
        throw new BadRequestException("Pharmacy chain is required for directors")
      }
      if (!pharmacyNumber) {
        throw new BadRequestException("Pharmacy number is required for directors")
      }
      if (!pharmacyAddress) {
        throw new BadRequestException("Pharmacy address is required for directors")
      }

      // Check if pharmacy chain exists
      const chain = await this.prisma.pharmacyChain.findUnique({
        where: { id: chainId },
      })

      if (!chain) {
        throw new NotFoundException("Pharmacy chain not found")
      }

      // Create user and pharmacy in a transaction
      return this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            ...userData,
            password_hash,
          },
        })

        // Create pharmacy for the director
        const pharmacy = await tx.pharmacy.create({
          data: {
            number: pharmacyNumber,
            address: pharmacyAddress,
            ownerId: user.id,
            chainId,
          },
        })

        // Create default warehouse for the pharmacy
        await tx.warehouse.create({
          data: {
            pharmacyId: pharmacy.id,
            name: "Основний склад",
          },
        })

        return {
          ...user,
          password_hash: undefined,
          pharmacy,
        }
      })
    }

    // For non-directors (admins), just create user
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password_hash,
      },
    })

    return {
      ...user,
      password_hash: undefined,
    }
  }

  async findAll(chainId?: number) {
    const where = chainId
      ? {
          ownedPharmacy: {
            chainId: chainId,
          },
        }
      : {}

    const users = await this.prisma.user.findMany({
      where,
      include: {
        ownedPharmacy: {
          include: {
            chain: true,
          },
        },
      },
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

    const { password, chainId, pharmacyNumber, pharmacyAddress, ...userData } = updateUserDto

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
    if (user.ownedPharmacy && (pharmacyNumber || pharmacyAddress || chainId)) {
      await this.prisma.pharmacy.update({
        where: { id: user.ownedPharmacy.id },
        data: {
          ...(pharmacyNumber && { number: pharmacyNumber }),
          ...(pharmacyAddress && { address: pharmacyAddress }),
          ...(chainId && { chainId }),
        },
      })
    }

    return {
      ...user,
      password_hash: undefined,
    }
  }

  async remove(id: number) {
    const user = await this.findOne(id)

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

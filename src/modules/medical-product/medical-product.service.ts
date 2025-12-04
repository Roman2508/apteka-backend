import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalProductDto } from './dto/create-medical-product.dto';
import { UpdateMedicalProductDto } from './dto/update-medical-product.dto';

@Injectable()
export class MedicalProductService {
  constructor(private prisma: PrismaService) {}

  async create(createMedicalProductDto: CreateMedicalProductDto) {
    return this.prisma.medicalProduct.create({
      data: createMedicalProductDto,
      include: {
        manufacturer: true,
      },
    });
  }

  async findAll() {
    return this.prisma.medicalProduct.findMany({
      include: {
        manufacturer: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.medicalProduct.findUnique({
      where: { id },
      include: {
        manufacturer: true,
        batches: {
          include: {
            supplier: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Medical product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateMedicalProductDto: UpdateMedicalProductDto) {
    // Check if product exists
    await this.findOne(id);

    return this.prisma.medicalProduct.update({
      where: { id },
      data: updateMedicalProductDto,
      include: {
        manufacturer: true,
      },
    });
  }

  async remove(id: number) {
    // Check if product exists
    await this.findOne(id);

    return this.prisma.medicalProduct.delete({
      where: { id },
    });
  }
}

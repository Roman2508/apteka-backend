import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateCounterpartyDto } from "./dto/create-counterparty.dto"
import { UpdateCounterpartyDto } from "./dto/update-counterparty.dto"

@Injectable()
export class CounterpartyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCounterpartyDto: CreateCounterpartyDto) {
    return this.prisma.counterparty.create({
      data: createCounterpartyDto,
    })
  }

  async findAll() {
    return this.prisma.counterparty.findMany({
      orderBy: { createdAt: "desc" },
    })
  }

  async findOne(id: number) {
    return this.prisma.counterparty.findUnique({
      where: { id },
    })
  }

  async update(id: number, updateCounterpartyDto: UpdateCounterpartyDto) {
    return this.prisma.counterparty.update({
      where: { id },
      data: updateCounterpartyDto,
    })
  }

  async remove(id: number) {
    return this.prisma.counterparty.delete({
      where: { id },
    })
  }
}

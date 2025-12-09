import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from "@nestjs/common"
import { CounterpartyService } from "./counterparty.service"
import { CreateCounterpartyDto } from "./dto/create-counterparty.dto"
import { UpdateCounterpartyDto } from "./dto/update-counterparty.dto"

@Controller("counterparties")
export class CounterpartyController {
  constructor(private readonly counterpartyService: CounterpartyService) {}

  @Post()
  create(@Body() createCounterpartyDto: CreateCounterpartyDto) {
    return this.counterpartyService.create(createCounterpartyDto)
  }

  @Get()
  findAll() {
    return this.counterpartyService.findAll()
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.counterpartyService.findOne(id)
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCounterpartyDto: UpdateCounterpartyDto,
  ) {
    return this.counterpartyService.update(id, updateCounterpartyDto)
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.counterpartyService.remove(id)
  }
}

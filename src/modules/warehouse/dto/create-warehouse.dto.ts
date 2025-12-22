import { ApiProperty } from "@nestjs/swagger"
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateWarehouseDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  pharmacyId: number

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string
}

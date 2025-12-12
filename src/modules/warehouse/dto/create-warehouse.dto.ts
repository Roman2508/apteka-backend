import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateWarehouseDto {
  @IsInt()
  @IsNotEmpty()
  pharmacyId: number

  @IsString()
  @IsOptional()
  name?: string
}


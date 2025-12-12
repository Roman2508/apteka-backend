import { IsInt, IsNotEmpty, IsOptional, Min } from "class-validator"

export class CreateInventoryDto {
  @IsInt()
  @IsNotEmpty()
  warehouseId: number

  @IsInt()
  @IsNotEmpty()
  batchId: number

  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number = 0

  @IsInt()
  @Min(0)
  @IsOptional()
  reserved_quantity?: number = 0
}


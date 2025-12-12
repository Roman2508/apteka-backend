import { IsDateString, IsDecimal, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateProductBatchDto {
  @IsInt()
  @IsNotEmpty()
  productId: number

  @IsInt()
  @IsNotEmpty()
  supplierId: number

  @IsString()
  @IsNotEmpty()
  batch_number: string

  @IsDateString()
  @IsOptional()
  manufacture_date?: string

  @IsDateString()
  @IsNotEmpty()
  expiry_date: string

  @IsDecimal() // Or @IsNumber() depending on how frontend sends it, standard is string or number for decimal
  @IsNotEmpty()
  purchase_price: number | string
}


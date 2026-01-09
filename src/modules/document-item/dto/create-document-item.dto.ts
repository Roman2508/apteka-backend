import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator"

export class CreateDocumentItemDto {
  @IsInt()
  @IsNotEmpty()
  id: number // MedicalProduct ID

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  count: number

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number

  @IsDateString()
  @IsOptional()
  expiry_date?: string

  @IsString()
  @IsOptional()
  bartcode?: string

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  batchId?: number

  @IsString()
  @IsOptional()
  batch_number?: string
}

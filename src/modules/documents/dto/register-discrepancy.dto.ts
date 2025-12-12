import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator"
import { DiscrepancyReason } from "../../../../prisma/generated/client"

export class RegisterDiscrepancyDto {
  @IsInt()
  @IsNotEmpty()
  documentItemId: number

  @IsEnum(DiscrepancyReason)
  @IsNotEmpty()
  reason: DiscrepancyReason

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number

  @IsString()
  @IsOptional()
  comment?: string

  @IsString()
  @IsOptional()
  photo_url?: string
}

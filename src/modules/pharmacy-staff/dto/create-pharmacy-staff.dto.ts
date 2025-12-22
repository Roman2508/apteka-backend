import { IsString, IsOptional, IsNumber } from "class-validator"

export class CreatePharmacyStaffDto {
  @IsNumber()
  userId: number

  @IsNumber()
  pharmacyId: number

  @IsOptional()
  @IsString()
  role_in_pharmacy?: string
}

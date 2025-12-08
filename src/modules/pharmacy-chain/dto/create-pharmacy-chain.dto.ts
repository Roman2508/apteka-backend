import { IsString, IsOptional } from "class-validator"

export class CreatePharmacyChainDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  edrpou_code?: string
}

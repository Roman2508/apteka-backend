import { IsString, IsNotEmpty, IsInt } from "class-validator"

export class CreatePharmacyDto {
  @IsNotEmpty()
  ownerId: number | string

  @IsString()
  @IsNotEmpty()
  number: string

  @IsString()
  @IsNotEmpty()
  address: string

  @IsInt()
  @IsNotEmpty()
  chainId: number
}

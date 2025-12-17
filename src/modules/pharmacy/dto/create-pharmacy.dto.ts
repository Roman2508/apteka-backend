import { IsString, IsNotEmpty, IsInt } from "class-validator"

export class CreatePharmacyDto {
  @IsInt()
  @IsNotEmpty()
  ownerId: number

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

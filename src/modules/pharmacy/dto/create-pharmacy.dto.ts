import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsOptional } from "class-validator"

export class CreatePharmacyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  number: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string

  @ApiProperty({ required: false })
  // @IsNotEmpty()
  @IsOptional()
  ownerId?: number | string

  @ApiProperty({ required: false })
  // @IsNotEmpty()
  @IsOptional()
  chainId?: number | string
}

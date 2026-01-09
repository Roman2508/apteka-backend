import { Type } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsInt, IsNotEmpty, IsNumber, ValidateNested } from "class-validator"

import { CreateDocumentItemDto } from "../../document-item/dto/create-document-item.dto"

export class CreateDocumentDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  code: number // number of invoice (external or internal?) -> document_number

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  counterpartyId: number // supplier

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  count: number // total count of items

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalPrice: number // expected total

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDocumentItemDto)
  items: CreateDocumentItemDto[]

  // pharmacyId та warehouseId будуть встановлюватись на беку, в залежності від ІД юзера, що відправив цей запит
  // @ApiProperty()
  // @IsInt()
  // @IsNotEmpty()
  // pharmacyId: number

  // @ApiProperty()
  // @IsInt()
  // @IsNotEmpty()
  // warehouseId: number

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  userId: number
}

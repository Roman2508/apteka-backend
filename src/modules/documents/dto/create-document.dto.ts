import { Type } from "class-transformer"
import { IsArray, IsInt, IsNotEmpty, IsNumber, ValidateNested } from "class-validator"

import { CreateDocumentItemDto } from "../../document-item/dto/create-document-item.dto"

export class CreateDocumentDto {
  @IsInt()
  @IsNotEmpty()
  code: number // number of invoice (external or internal?) -> document_number

  @IsInt()
  @IsNotEmpty()
  counterpartyId: number // supplier

  @IsInt()
  @IsNotEmpty()
  count: number // total count of items

  @IsNumber()
  @IsNotEmpty()
  totalPrice: number // expected total

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDocumentItemDto)
  items: CreateDocumentItemDto[]

  // Backend required fields (if not inferred from context)
  @IsInt()
  @IsNotEmpty()
  pharmacyId: number

  @IsInt()
  @IsNotEmpty()
  warehouseId: number

  @IsInt()
  @IsNotEmpty()
  userId: number
}


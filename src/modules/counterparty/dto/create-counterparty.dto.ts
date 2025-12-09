import { IsEnum, IsOptional, IsString } from "class-validator"
import { CounterpartyType } from '../../../../prisma/generated/client';

export class CreateCounterpartyDto {
  @IsString()
  name: string

  @IsEnum(CounterpartyType)
  type: CounterpartyType

  @IsString()
  @IsOptional()
  edrpou_code?: string

  @IsString()
  @IsOptional()
  address?: string

  @IsString()
  @IsOptional()
  iban?: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsString()
  @IsOptional()
  contact_person?: string

  @IsString()
  @IsOptional()
  note?: string
}

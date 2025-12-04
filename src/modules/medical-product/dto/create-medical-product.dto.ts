import { IsString, IsOptional, IsEnum, IsDecimal, IsInt, IsBoolean, IsNumber, Min } from 'class-validator';
import { ProductForm, SubpackageType, ShelfLifeUnit } from '../../../../prisma/generated/client';

export class CreateMedicalProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  brand_name?: string;

  @IsEnum(ProductForm)
  form: ProductForm;

  @IsOptional()
  @IsNumber()
  dosage_value?: number;

  @IsString()
  dosage_unit: string = 'mg';

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  inn?: string;

  @IsOptional()
  @IsString()
  atc_code?: string;

  @IsOptional()
  @IsString()
  registration_number?: string;

  @IsBoolean()
  in_national_list: boolean = false;

  @IsBoolean()
  in_reimbursed_program: boolean = false;

  @IsOptional()
  @IsInt()
  @Min(1)
  subpackages_per_package?: number;

  @IsOptional()
  @IsEnum(SubpackageType)
  subpackage_type?: SubpackageType;

  @IsOptional()
  @IsInt()
  @Min(1)
  shelf_life_value?: number;

  @IsOptional()
  @IsEnum(ShelfLifeUnit)
  shelf_life_unit?: ShelfLifeUnit;

  @IsNumber()
  retail_price: number;

  @IsInt()
  vat_rate: number = 7;

  @IsOptional()
  @IsInt()
  manufacturerId?: number;
}

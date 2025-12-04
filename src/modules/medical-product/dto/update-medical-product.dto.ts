import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicalProductDto } from './create-medical-product.dto';

export class UpdateMedicalProductDto extends PartialType(CreateMedicalProductDto) {}

import { PartialType } from "@nestjs/mapped-types"
import { CreatePharmacyStaffDto } from "./create-pharmacy-staff.dto"

export class UpdatePharmacyStaffDto extends PartialType(CreatePharmacyStaffDto) {}

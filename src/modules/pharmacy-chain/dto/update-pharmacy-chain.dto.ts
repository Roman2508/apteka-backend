import { PartialType } from "@nestjs/mapped-types"
import { CreatePharmacyChainDto } from "./create-pharmacy-chain.dto"

export class UpdatePharmacyChainDto extends PartialType(CreatePharmacyChainDto) {}

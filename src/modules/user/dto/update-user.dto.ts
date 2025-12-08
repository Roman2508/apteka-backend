import { PartialType, OmitType } from "@nestjs/mapped-types"
import { CreateUserDto } from "./create-user.dto"
import { IsOptional, IsString, MinLength } from "class-validator"

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ["password"] as const)) {
  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string
}

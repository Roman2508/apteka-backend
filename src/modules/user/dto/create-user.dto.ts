import { IsString, IsOptional, IsEmail, IsBoolean, IsInt, IsEnum, MinLength } from "class-validator"
import { UserRole } from "../../../../prisma/generated/enums"

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string

  @IsOptional()
  @IsString()
  full_name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsEnum(UserRole)
  role: UserRole

  @IsString()
  @MinLength(4)
  password: string

  @IsOptional()
  @IsBoolean()
  is_active?: boolean

  // For directors only - pharmacy chain to assign to
  @IsOptional()
  @IsInt()
  chainId?: number

  // For directors only - pharmacy number and address
  @IsOptional()
  @IsString()
  pharmacyNumber?: string

  @IsOptional()
  @IsString()
  pharmacyAddress?: string
}

import { IsString, IsOptional, IsEmail, IsBoolean, IsInt, IsEnum, MinLength } from "class-validator"
import { UserRole } from "../../../../prisma/generated/enums"
import { ApiProperty } from "@nestjs/swagger"

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  username: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  full_name?: string

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty()
  @IsEnum(UserRole)
  role: UserRole

  @ApiProperty()
  @IsString()
  @MinLength(4)
  password: string

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean

  // For directors only - pharmacy chain to assign to
  @ApiProperty()
  @IsOptional()
  pharmacy?: number

  // For directors only - pharmacy number and address
  // @IsOptional()
  // @IsString()
  // pharmacyNumber?: string

  // @IsOptional()
  // @IsString()
  // pharmacyAddress?: string
}

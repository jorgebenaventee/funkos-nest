import { SignUpRequest } from '@/auth/dto/sign-up.request'
import { IsArray, IsOptional } from 'class-validator'

export class CreateUserDto extends SignUpRequest {
  @IsArray({ message: 'Roles must be an array' })
  @IsOptional()
  roles: string[]
}

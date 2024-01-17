import { Match } from '@/auth/validators/match.validator'
import { IsNotEmpty, IsString } from 'class-validator'

export class SignUpRequest {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  username: string
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string
  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsString({ message: 'Confirm password must be a string' })
  @Match<SignUpRequest>('password', { message: 'Passwords do not match' })
  confirmPassword: string
}

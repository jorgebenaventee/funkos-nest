import { SignInRequest } from '@/auth/dto/sign-in.request'
import { SignUpRequest } from '@/auth/dto/sign-up.request'
import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() signUpRequest: SignUpRequest) {
    return await this.authService.signUp(signUpRequest)
  }

  @Post('sign-in')
  async signIn(@Body() signInRequest: SignInRequest) {
    return await this.authService.signIn(signInRequest)
  }
}

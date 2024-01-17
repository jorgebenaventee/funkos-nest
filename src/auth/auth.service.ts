import type { SignInRequest } from '@/auth/dto/sign-in.request'
import type { SignUpRequest } from '@/auth/dto/sign-up.request'
import type { User } from '@/rest/user/entities/user.entity'
import { UserService } from '@/rest/user/user.service'
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInRequest: SignInRequest) {
    this.logger.log(`Signing in with username: ${signInRequest.username}`)
    const user = await this.userService.findByUsername(signInRequest.username)
    if (!user) {
      throw new UnauthorizedException('Invalid username or password')
    }

    const isPasswordValid = await this.userService.compare({
      password: signInRequest.password,
      hash: user.password,
    })
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password')
    }
    return this.generateAccessToken(user)
  }

  private generateAccessToken({ id }: User) {
    this.logger.log(`Generating access token`)
    const payload = { id }
    const accessToken = this.jwtService.sign(payload)
    return { accessToken }
  }

  async signUp(signUpRequest: SignUpRequest) {
    await this.userService.create(signUpRequest)
  }
}

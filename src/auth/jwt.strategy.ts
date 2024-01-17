import { UserMapper } from '@/rest/user/user.mapper'
import { UserService } from '@/rest/user/user.service'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly userMapper: UserMapper,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: btoa(process.env.JWT_SECRET),
      algorithms: ['HS512'],
    })
  }

  async validate(payload: { id: number }) {
    const user = await this.userService.find(payload.id)
    return this.userMapper.toResponse(user)
  }
}

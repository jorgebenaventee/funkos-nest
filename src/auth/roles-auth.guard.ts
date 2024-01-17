import { UserService } from '@/rest/user/user.service'
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<string[]>('roles', context.getHandler())
    if (!roles) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const user = await this.userService.find(request.user.userId)
    if (!user) {
      return false
    }
    const userRoles = user.roles.map((role) => role.name)
    return userRoles.some((role) => roles.includes(role)) ?? false
  }
}

export const Roles = (...roles: string[]) => SetMetadata('roles', roles)

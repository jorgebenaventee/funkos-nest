import type { UserResponse } from '@/rest/user/dto/user-response.dto'
import type { User } from '@/rest/user/entities/user.entity'
import { Injectable } from '@nestjs/common'

@Injectable()
export class UserMapper {
  toResponse({ id, roles, username }: User): UserResponse {
    return {
      id,
      username,
      roles: roles.map((role) => role.name),
    }
  }
}

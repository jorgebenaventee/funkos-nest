import type { SignUpRequest } from '@/auth/dto/sign-up.request'
import type { CreateUserDto } from '@/rest/user/dto/create-user.dto'
import type { UpdateUserDto } from '@/rest/user/dto/UpdateUserDto'
import { Role, User } from '@/rest/user/entities/user.entity'
import { UserMapper } from '@/rest/user/user.mapper'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcryptjs'
import { ILike, In, Repository } from 'typeorm'

const ROUNDS = 10 as const

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private readonly userMapper: UserMapper,
  ) {}

  async create(request: SignUpRequest | CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { username: request.username },
    })
    if (existingUser) {
      throw new BadRequestException('Username already exists')
    }
    const getUserRoles = async () => {
      if (this.isAdminCreate(request) && request.roles.length > 0) {
        const roles = await this.roleRepository.findBy({
          name: In(request.roles),
        })
        if (roles.length === 0) {
          throw new BadRequestException('Roles not found')
        }
        return roles
      } else {
        const userRole = await this.roleRepository.findOne({
          where: {
            name: ILike('user'),
          },
        })
        return [userRole]
      }
    }
    const user: Omit<User, 'id'> = {
      ...request,
      roles: await getUserRoles(),
      password: await this.hash(request.password),
    }
    const savedUser = await this.userRepository.save(user)
    return this.userMapper.toResponse(savedUser)
  }

  async update(id: number, request: UpdateUserDto) {
    const user = await this.find(id)
    if (!user) {
      throw new BadRequestException('User not found')
    }
    if (request.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: request.username },
      })
      if (existingUser) {
        throw new BadRequestException('Username already exists')
      }
    }
    const newUser: User = {
      id,
      ...user,
      ...request,
      roles: user.roles,
    }
    if (request.roles?.length > 0) {
      newUser.roles = await this.roleRepository.findBy({
        name: In(request.roles),
      })
    }

    if (request.password) {
      newUser.password = await this.hash(request.password)
    }

    const savedUser = await this.userRepository.save(newUser)

    return this.userMapper.toResponse(savedUser)
  }

  async delete(id: number) {
    const user = await this.find(id)
    if (!user) {
      throw new BadRequestException('User not found')
    }
    await this.userRepository.remove(user)
  }

  async hash(password: string) {
    return await bcrypt.hash(password, ROUNDS)
  }

  async compare({ password, hash }: { password: string; hash: string }) {
    return await bcrypt.compare(password, hash)
  }

  async findByUsername(username: string) {
    return await this.userRepository.findOne({
      where: { username },
    })
  }

  async find(id: number) {
    return await this.userRepository.findOne({
      where: { id },
    })
  }

  private isAdminCreate(
    data: CreateUserDto | SignUpRequest,
  ): data is CreateUserDto {
    return 'roles' in data
  }
}

import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { Roles, RolesAuthGuard } from '@/auth/roles-auth.guard'
import { CreateUserDto } from '@/rest/user/dto/create-user.dto'
import { UpdateUserDto } from '@/rest/user/dto/UpdateUserDto'
import { UserService } from '@/rest/user/user.service'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'

@Controller('user')
@UseGuards(JwtAuthGuard, RolesAuthGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name)

  constructor(private readonly userService: UserService) {}

  @Get('me/profile')
  @Roles('USER')
  async me(@Req() request: any) {
    return request.user
  }

  @Get()
  @Roles('ADMIN')
  async findAll() {
    return await this.userService.findAll()
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() user: CreateUserDto) {
    return await this.userService.create(user)
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() user: UpdateUserDto,
  ) {
    return await this.userService.update(id, user)
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.delete(id)
  }
}

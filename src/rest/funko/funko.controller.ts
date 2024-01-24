import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { Roles, RolesAuthGuard } from '@/auth/roles-auth.guard'
import { FunkoResponseDto } from '@/rest/funko/dto/funko-response.dto'
import { FunkoExistsGuard } from '@/rest/guards/funko-exists/funko-exists.guard'
import { CustomCacheInterceptor } from '@/rest/interceptors/custom-cache-interceptor/custom-cache.interceptor'
import { NoCache } from '@/rest/interceptors/custom-cache-interceptor/no-cache/no-cache.decorator'
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'
import { diskStorage } from 'multer'
import { Paginate, Paginated, type PaginateQuery } from 'nestjs-paginate'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { FunkoService } from './funko.service'

@Controller('funko')
@UseInterceptors(CustomCacheInterceptor)
@ApiTags('Funkos')
export class FunkoController {
  constructor(private readonly funkoService: FunkoService) {}

  @Post()
  @UseGuards(FunkoExistsGuard, JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiResponse({
    type: FunkoResponseDto,
    status: 201,
    description: 'El funko se ha guardado correctamente.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Hay algún error de validación',
  })
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    return await this.funkoService.create(createFunkoDto)
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Lista de funkos paginada',
    type: Paginated<FunkoResponseDto>,
  })
  @ApiQuery({
    description: 'Filtro por limite por pagina',
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro por pagina',
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro de ordenación: campo:ASC|DESC',
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: filter.campo = $eq:valor',
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: search = valor',
    name: 'search',
    required: false,
    type: String,
  })
  async findAll(@Paginate() query: PaginateQuery) {
    return await this.funkoService.findAll(query)
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Funko encontrado',
    type: FunkoResponseDto,
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Funko no encontrado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  async findOne(@Param('id', new ParseIntPipe()) id: string) {
    return await this.funkoService.findOne(+id)
  }

  @Get(':id/image')
  @NoCache()
  @ApiResponse({
    status: 200,
    description: 'Imagen del funko',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Imagen o funko no encontrados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  async findImage(
    @Param('id', new ParseIntPipe()) id: string,
    @Res() response: Response,
  ) {
    const image = await this.funkoService.findImage(+id)
    if (!image.startsWith('<')) {
      response.sendFile(image)
    } else {
      response.setHeader('Content-Type', 'image/svg+xml')
      response.send(image)
    }
  }

  @Post(':id/image')
  @UseGuards(FunkoExistsGuard, JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR ?? 'uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${file.originalname}`
          const fileExtension = uniqueName.split('.').pop()
          const filename = `${uniqueName}.${fileExtension}`
          callback(null, filename)
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimesRegex = /image\/(jpeg|jpg|png)/
        const isAllowedMimeType = allowedMimesRegex.test(file.mimetype)
        if (isAllowedMimeType) {
          cb(null, true)
        } else {
          cb(new BadRequestException('Mime type not allowed'), false)
        }
      },
      limits: {
        files: 1,
        fileSize: 1024 * 1024,
      },
      preservePath: true,
    }),
  )
  @ApiResponse({
    status: 200,
    description: 'Imagen del funko actualizada',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Imagen o funko no encontrados',
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.funkoService.updateImage(id, file)
  }

  @Put(':id')
  @UseGuards(FunkoExistsGuard, JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiResponse({
    status: 200,
    description: 'Funko actualizado',
    type: FunkoResponseDto,
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Funko no encontrado',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Hay algún error de validación',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  async update(
    @Param('id', new ParseIntPipe()) id: string,
    @Body() updateFunkoDto: UpdateFunkoDto,
  ) {
    return await this.funkoService.update(+id, updateFunkoDto)
  }

  @Delete(':id')
  @UseGuards(FunkoExistsGuard, JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiResponse({
    status: 204,
    description: 'Funko eliminado',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Funko no encontrado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  async remove(@Param('id', new ParseIntPipe()) id: string) {
    return await this.funkoService.remove(+id)
  }
}

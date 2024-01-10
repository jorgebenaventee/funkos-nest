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
import type e from 'express'
import { Response } from 'express'
import { diskStorage } from 'multer'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { FunkoService } from './funko.service'

@Controller('funko')
@UseInterceptors(CustomCacheInterceptor)
export class FunkoController {
  constructor(private readonly funkoService: FunkoService) {}

  @Post()
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    return await this.funkoService.create(createFunkoDto)
  }

  @Get()
  async findAll() {
    return await this.funkoService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: string) {
    return await this.funkoService.findOne(+id)
  }

  @Get(':id/image')
  @NoCache()
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
  @UseGuards(FunkoExistsGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR ?? 'uploads',
        filename: (
          req: e.Request,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void,
        ) => {
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
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.funkoService.updateImage(id, file)
  }

  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: string,
    @Body() updateFunkoDto: UpdateFunkoDto,
  ) {
    return await this.funkoService.update(+id, updateFunkoDto)
  }

  @Delete(':id')
  async remove(@Param('id', new ParseIntPipe()) id: string) {
    return await this.funkoService.remove(+id)
  }
}

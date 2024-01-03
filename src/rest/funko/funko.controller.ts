import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { FunkoService } from './funko.service'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'

@Controller('funko')
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
  async findOne(@Param('id') id: string) {
    return await this.funkoService.findOne(+id)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFunkoDto: UpdateFunkoDto,
  ) {
    return await this.funkoService.update(+id, updateFunkoDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.funkoService.remove(+id)
  }
}

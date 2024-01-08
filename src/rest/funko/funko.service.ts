import { Category } from '@/rest/category/entities/category.entity'
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import type { CreateFunkoDto } from './dto/create-funko.dto'
import type { UpdateFunkoDto } from './dto/update-funko.dto'
import { Funko } from './entities/funko.entity'
import { FunkoMapper } from '@/rest/funko/funko-mapper/funko-mapper'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class FunkoService {
  private readonly logger = new Logger(FunkoService.name)

  constructor(
    private readonly funkoMapper: FunkoMapper,
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createFunkoDto: CreateFunkoDto) {
    this.logger.log(`Creating funko ${JSON.stringify(createFunkoDto)}`)
    const funkoAlreadyExists = await this.funkoRepository.exist({
      where: { name: createFunkoDto.name },
    })
    if (funkoAlreadyExists) {
      throw new ConflictException(`Funko ${createFunkoDto.name} already exists`)
    }
    const funko = this.funkoMapper.fromCreate(createFunkoDto)
    const category = await this.categoryRepository.findOne({
      where: { name: createFunkoDto.categoryName },
    })
    if (!category) {
      throw new NotFoundException(
        `Category ${createFunkoDto.categoryName} not found`,
      )
    }
    funko.category = category
    const createdFunko = await this.funkoRepository.save(funko)
    return this.funkoMapper.toResponse(createdFunko)
  }

  async findAll() {
    this.logger.log(`Finding all funkos`)
    const funkos = await this.funkoRepository.find()
    return funkos.map((funko) => this.funkoMapper.toResponse(funko))
  }

  async findOne(id: number) {
    this.logger.log(`Finding funko with id ${id}`)
    const funko = await this.findOneInternal(id)
    return this.funkoMapper.toResponse(funko)
  }

  async update(id: number, updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(`Updating funko with id ${id}`)
    const existingFunko = await this.findOneInternal(id)
    if (updateFunkoDto.name != null) {
      const funkoAlreadyExists = await this.funkoRepository.exist({
        where: { name: updateFunkoDto.name },
      })
      if (funkoAlreadyExists) {
        throw new ConflictException(
          `Funko ${updateFunkoDto.name} already exists`,
        )
      }
    }
    const updatedFunko = this.funkoMapper.fromUpdate(
      updateFunkoDto,
      existingFunko,
    )
    if (updateFunkoDto.categoryName != null) {
      const category = await this.categoryRepository.findOne({
        where: { name: updateFunkoDto.categoryName },
      })
      if (!category) {
        throw new NotFoundException(
          `Category ${updateFunkoDto.categoryName} not found`,
        )
      }
      updatedFunko.category = category
    }
    return this.funkoMapper.toResponse(updatedFunko)
  }

  async remove(id: number) {
    this.logger.log(`Removing funko with id ${id}`)
    const funko = await this.findOneInternal(id)
    const _ = await this.funkoRepository.remove([funko])
  }

  private throwNotFound(id: Funko['id']) {
    this.logger.error(`Funko with id ${id} not found`)
    throw new NotFoundException(`Funko with id ${id} not found`)
  }

  private async findOneInternal(id: number) {
    this.logger.log(`Finding funko with id ${id}`)
    const funko = await this.funkoRepository.findOne({ where: { id } })
    if (!funko) {
      this.throwNotFound(id)
    }
    return funko
  }
}

import { Category } from '@/rest/category/entities/category.entity'
import type { FunkoResponseDto } from '@/rest/funko/dto/funko-response.dto'
import { FunkoMapper } from '@/rest/funko/funko-mapper/funko-mapper'
import {
  NotificationsGateway,
  type WebSocketKey,
} from '@/rest/notifications/notifications.gateway'
import { StorageService } from '@/rest/storage/storage.service'
import { type Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { join } from 'node:path'
import * as process from 'process'
import { Repository } from 'typeorm'
import type { CreateFunkoDto } from './dto/create-funko.dto'
import type { UpdateFunkoDto } from './dto/update-funko.dto'
import { defaultImage, Funko } from './entities/funko.entity'

const generateFunkoCacheKey = (id: number) => `funko_${id}` as const
const allFunkosKey = 'all_funkos'

@Injectable()
export class FunkoService {
  private readonly logger = new Logger(FunkoService.name)

  constructor(
    private readonly funkoMapper: FunkoMapper,
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly notificationsGateway: NotificationsGateway,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly storageService: StorageService,
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
    await this.addToCache(createdFunko)
    const response = this.funkoMapper.toResponse(createdFunko)
    this.onChange('create', response)
    return response
  }

  async findAll() {
    this.logger.log(`Finding all funkos`)
    const cachedFunkos = await this.getFromCache()
    if (cachedFunkos) {
      return cachedFunkos.map((funko) => this.funkoMapper.toResponse(funko))
    }
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
    const dbUpdatedFunko = await this.funkoRepository.save(updatedFunko)
    await this.addToCache(dbUpdatedFunko)
    const funkoResponseDto = this.funkoMapper.toResponse(dbUpdatedFunko)
    this.onChange('update', funkoResponseDto)
    return funkoResponseDto
  }

  async remove(id: number) {
    this.logger.log(`Removing funko with id ${id}`)
    const funko = await this.findOneInternal(id)
    if (funko.image !== defaultImage) {
      try {
        await this.storageService.removeImage({ image: funko.image })
      } catch (e) {
        this.logger.error(`Error removing image ${funko.image}: ${e}`)
      }
    }
    const _ = await this.funkoRepository.remove([funko])
    this.onChange('delete', this.funkoMapper.toResponse(funko))
    await this.removeFromCache(id)
  }

  async findImage(id: number) {
    const { image } = await this.findOneInternal(id)
    try {
      return await this.storageService.findImage({ image })
    } catch {
      this.throwNotFound(id)
    }
  }

  async updateImage(id: number, file: Express.Multer.File) {
    const funko = await this.findOneInternal(id)
    if (!file) {
      throw new BadRequestException('No file provided')
    }
    if (funko.image !== defaultImage) {
      try {
        await this.storageService.removeImage({ image: funko.image })
      } catch (e) {
        this.logger.error(`Error removing image ${funko.image}: ${e}`)
      }
    }

    funko.image = file.filename
    const updatedFunko = await this.funkoRepository.save(funko)
    await this.addToCache(updatedFunko)
    const funkoResponseDto = this.funkoMapper.toResponse(updatedFunko)
    this.onChange('update', funkoResponseDto)
    return funkoResponseDto
  }

  private throwNotFound(id: Funko['id']) {
    this.logger.error(`Funko with id ${id} not found`)
    throw new NotFoundException(`Funko with id ${id} not found`)
  }

  private async findOneInternal(id: number) {
    this.logger.log(`Finding funko with id ${id}`)
    let funko = await this.getFromCache(id)
    if (!funko) {
      funko = await this.funkoRepository.findOne({ where: { id } })
      if (funko) {
        await this.addToCache(funko)
      } else {
        this.throwNotFound(id)
      }
    }
    return funko
  }

  private addToCache(item: Funko | Funko[]) {
    if (Array.isArray(item)) {
      this.logger.log(`Adding all funkos to cache`)
      return this.cacheManager.set(allFunkosKey, item)
    } else {
      this.logger.log(`Adding funko with id ${item.id} to cache`)
      const key = generateFunkoCacheKey(item.id)
      return this.cacheManager.set(key, item)
    }
  }

  private getFromCache(): Promise<Funko[] | undefined>
  private getFromCache(id: number): Promise<Funko | undefined>
  private getFromCache(id?: number) {
    if (id) {
      this.logger.log(`Getting funko with id ${id} from cache`)
      const key = generateFunkoCacheKey(id)
      return this.cacheManager.get<Funko>(key)
    } else {
      this.logger.log(`Getting all funkos from cache`)
      return this.cacheManager.get<Funko[]>(allFunkosKey)
    }
  }

  private removeFromCache(id: number) {
    this.logger.log(`Removing funko with id ${id} from cache`)
    const key = generateFunkoCacheKey(id)
    return this.cacheManager.del(key)
  }

  private onChange(type: WebSocketKey, message: FunkoResponseDto) {
    this.notificationsGateway.sendMessage(type, message)
  }
}

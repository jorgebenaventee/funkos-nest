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
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  type PaginateConfig,
  type Paginated,
  type PaginateQuery,
} from 'nestjs-paginate'
import { Repository } from 'typeorm'
import { hash } from 'typeorm/util/StringUtils'
import type { CreateFunkoDto } from './dto/create-funko.dto'
import type { UpdateFunkoDto } from './dto/update-funko.dto'
import { defaultImage, Funko } from './entities/funko.entity'

const generateFunkoCacheKey = (id: number) => `funko_${id}` as const
const getAllFunkosKey = (query: PaginateQuery) =>
  `all_funkos_page_${hash(JSON.stringify(query))}`

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

  async findAll(paginateQuery: PaginateQuery) {
    const mapResult = (result: Paginated<Funko>) => ({
      ...result,
      data: result.data.map((category) =>
        this.funkoMapper.toResponse(category),
      ),
    })
    this.logger.log(`Finding all funkos`)
    const cachedFunkos = await this.getFromCache(paginateQuery)
    if (cachedFunkos) {
      return mapResult(cachedFunkos)
    }
    const config: PaginateConfig<Funko> = {
      relations: ['category'],
      sortableColumns: ['id', 'name', 'price', 'stock'],
      defaultSortBy: [['id', 'ASC']],
      filterableColumns: {
        id: [FilterOperator.EQ, FilterSuffix.NOT],
        name: [FilterOperator.EQ, FilterOperator.ILIKE],
        price: [FilterOperator.EQ, FilterOperator.GT, FilterOperator.LT],
        stock: [FilterOperator.EQ, FilterOperator.GT, FilterOperator.LT],
        'category.name': [FilterOperator.EQ, FilterOperator.ILIKE],
      },
    }
    const paginatedFunkos = await paginate(
      paginateQuery,
      this.funkoRepository,
      config,
    )
    await this.addToCache(paginatedFunkos, paginateQuery)
    return mapResult(paginatedFunkos)
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
      this.throwImageNotFound(id)
    }
  }

  async updateImage(id: number, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided')
    }
    const funko = await this.findOneInternal(id)
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

  private throwImageNotFound(id: Funko['id']) {
    this.logger.error(`Image for funko with id ${id} not found`)
    throw new NotFoundException(`Image for funko with id ${id} not found`)
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

  private addToCache(item: Funko | Paginated<Funko>, query?: PaginateQuery) {
    if (this.isFunko(item)) {
      this.logger.log(`Adding funko with id ${item.id} to cache`)
      const key = generateFunkoCacheKey(item.id)
      return this.cacheManager.set(key, item)
    } else {
      this.logger.log(`Adding all funkos to cache`)
      return this.cacheManager.set(getAllFunkosKey(query), item)
    }
  }

  private getFromCache(query: PaginateQuery): Promise<Paginated<Funko>>
  private getFromCache(id: Funko['id']): Promise<Funko | undefined>
  private getFromCache(key: number | PaginateQuery) {
    if (typeof key === 'number') {
      this.logger.log(`Getting funko with id ${key} from cache`)
      const cacheKey = generateFunkoCacheKey(key)
      return this.cacheManager.get<Funko>(cacheKey)
    } else {
      this.logger.log(`Getting all funkos from cache`)
      return this.cacheManager.get<Paginated<Funko>>(getAllFunkosKey(key))
    }
  }

  private isFunko(item: Funko | Paginated<Funko>): item is Funko {
    return 'id' in item
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

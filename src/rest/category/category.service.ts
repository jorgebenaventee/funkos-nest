import { CategoryMapper } from '@/rest/category/category-mapper/category-mapper'
import type { CategoryResponseDto } from '@/rest/category/dto/category-response.dto'
import { Category } from '@/rest/category/entities/category.entity'
import {
  NotificationsGateway,
  type WebSocketKey,
} from '@/rest/notifications/notifications.gateway'
import { type Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { Paginated } from 'nestjs-paginate'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  type PaginateConfig,
  type PaginateQuery,
} from 'nestjs-paginate'
import { Repository } from 'typeorm'
import { hash } from 'typeorm/util/StringUtils'
import type { CreateCategoryDto } from './dto/create-category.dto'
import type { UpdateCategoryDto } from './dto/update-category.dto'

const generateCategoryCacheKey = (id: Category['id']) =>
  `category_${id}` as const
const getAllCategoriesKey = (query: PaginateQuery) =>
  `all_categories_page_${hash(JSON.stringify(query))}` as const

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name)

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly categoryMapper: CategoryMapper,
    private readonly notificationsGateway: NotificationsGateway,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    })
    if (existingCategory) {
      throw new ConflictException(
        `Category with name ${createCategoryDto.name} already exists`,
      )
    }
    const category = this.categoryMapper.fromCreateToEntity(createCategoryDto)
    const savedCategory = await this.categoryRepository.save(category)
    const response = this.categoryMapper.fromEntityToResponseDto(savedCategory)
    this.onChange('create', response)
    return response
  }

  async findAll(paginateQuery: PaginateQuery) {
    const mapResult = (result: Paginated<Category>) => {
      if (!Array.isArray(result.data)) {
        result.data = [result.data]
      }
      return {
        ...result,
        data: result.data.map((category) =>
          this.categoryMapper.fromEntityToResponseDto(category),
        ),
      }
    }
    const allCategories = await this.getFromCache(paginateQuery)
    if (allCategories) {
      return mapResult(allCategories)
    }
    const config: PaginateConfig<Category> = {
      filterableColumns: {
        name: [FilterOperator.EQ, FilterOperator.ILIKE, FilterSuffix.NOT],
      },
      sortableColumns: ['id', 'name'],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['name'],
    }
    const result = await paginate(
      paginateQuery,
      this.categoryRepository,
      config,
    )
    const mappedResult = mapResult(result)
    await this.addToCache(result, paginateQuery)
    return mappedResult
  }

  async findOne(id: string) {
    const category = await this.findOneInternal(id)
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`)
    }
    return this.categoryMapper.fromEntityToResponseDto(category)
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOneInternal(id)
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`)
    }
    const updatedCategory = this.categoryMapper.fromUpdateToEntity(
      category,
      updateCategoryDto,
    )
    const savedCategory = await this.categoryRepository.save(updatedCategory)
    const response = this.categoryMapper.fromEntityToResponseDto(savedCategory)
    this.onChange('update', response)
    this.addToCache(savedCategory)
    return response
  }

  async remove(id: string) {
    const category = await this.findOneInternal(id)
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`)
    }
    await this.categoryRepository.softDelete(id)
    await this.removeFromCache(id)
    this.onChange(
      'delete',
      this.categoryMapper.fromEntityToResponseDto(category),
    )
  }

  async restore(id: string) {
    const category = await this.findOneInternal(id)
    if (category) {
      throw new ConflictException(`Category with id ${id} is not deleted`)
    }
    await this.categoryRepository.restore(id)
  }

  private async findOneInternal(id: string) {
    return (
      (await this.getFromCache(id)) ??
      (await this.categoryRepository.findOne({ where: { id } }))
    )
  }

  private addToCache(
    item: Category | Paginated<Category>,
    query?: PaginateQuery,
  ) {
    if (this.isCategory(item)) {
      this.logger.log(`Adding funko with id ${item.id} to cache`)
      const key = generateCategoryCacheKey(item.id)
      return this.cacheManager.set(key, item)
    } else {
      this.logger.log(`Adding all funkos to cache`)
      return this.cacheManager.set(getAllCategoriesKey(query), item)
    }
  }

  private getFromCache(query: PaginateQuery): Promise<Paginated<Category>>
  private getFromCache(id: Category['id']): Promise<Category | undefined>
  private getFromCache(key: Category['id'] | PaginateQuery) {
    if (typeof key === 'string') {
      this.logger.log(`Getting category with id ${key} from cache`)
      const cacheKey = generateCategoryCacheKey(key)
      return this.cacheManager.get<Category>(cacheKey)
    } else {
      this.logger.log(`Getting all categories from cache`)
      return this.cacheManager.get<Paginated<Category>>(
        getAllCategoriesKey(key),
      )
    }
  }

  private isCategory(item: Category | Paginated<Category>): item is Category {
    return 'id' in item
  }

  private removeFromCache(id: Category['id']) {
    this.logger.log(`Removing funko with id ${id} from cache`)
    const key = generateCategoryCacheKey(id)
    return this.cacheManager.del(key)
  }

  private onChange(event: WebSocketKey, data: CategoryResponseDto) {
    this.notificationsGateway.sendMessage(event, data)
  }
}

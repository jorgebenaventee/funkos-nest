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
import { Repository } from 'typeorm'
import type { CreateCategoryDto } from './dto/create-category.dto'
import type { UpdateCategoryDto } from './dto/update-category.dto'

const generateCategoryCacheKey = (id: Category['id']) =>
  `category_${id}` as const
const allCategoriesKey = 'all_categories'

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

  async findAll() {
    const allCategories = await this.getFromCache()
    if (allCategories) {
      return allCategories.map((category) =>
        this.categoryMapper.fromEntityToResponseDto(category),
      )
    }
    return await this.categoryRepository
      .find()
      .then((categories) =>
        categories.map((category) =>
          this.categoryMapper.fromEntityToResponseDto(category),
        ),
      )
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

  private addToCache(item: Category | Category[]) {
    if (Array.isArray(item)) {
      this.logger.log(`Adding all funkos to cache`)
      return this.cacheManager.set(allCategoriesKey, item)
    } else {
      this.logger.log(`Adding funko with id ${item.id} to cache`)
      const key = generateCategoryCacheKey(item.id)
      return this.cacheManager.set(key, item)
    }
  }

  private getFromCache(): Promise<Category[] | undefined>
  private getFromCache(id: Category['id']): Promise<Category | undefined>
  private getFromCache(id?: Category['id']) {
    if (id) {
      this.logger.log(`Getting funko with id ${id} from cache`)
      const key = generateCategoryCacheKey(id)
      return this.cacheManager.get<Category>(key)
    } else {
      this.logger.log(`Getting all funkos from cache`)
      return this.cacheManager.get<Category[]>(allCategoriesKey)
    }
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

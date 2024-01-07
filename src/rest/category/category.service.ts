import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type { CreateCategoryDto } from './dto/create-category.dto'
import type { UpdateCategoryDto } from './dto/update-category.dto'
import { Repository } from 'typeorm'
import { Category } from '@/rest/category/entities/category.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { CategoryMapper } from '@/rest/category/category-mapper/category-mapper'

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly categoryMapper: CategoryMapper,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    })
    if (existingCategory) {
      throw new BadRequestException(
        `Category with name ${createCategoryDto.name} already exists`,
      )
    }
    const category = this.categoryMapper.fromCreateToEntity(createCategoryDto)
    const savedCategory = await this.categoryRepository.save(category)
    return this.categoryMapper.fromEntityToResponseDto(savedCategory)
  }

  async findAll() {
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
    return this.categoryMapper.fromEntityToResponseDto(savedCategory)
  }

  async remove(id: string) {
    const category = await this.findOneInternal(id)
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`)
    }
    await this.categoryRepository.softDelete(id)
  }

  async restore(id: string) {
    const category = await this.findOneInternal(id)
    if (category) {
      throw new BadRequestException(`Category with id ${id} is not deleted`)
    }
    await this.categoryRepository.restore(id)
  }

  private async findOneInternal(id: string) {
    return await this.categoryRepository.findOne({ where: { id } })
  }
}

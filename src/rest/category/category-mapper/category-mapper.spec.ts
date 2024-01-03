import type { Category } from '@/rest/category/entities/category.entity'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import * as crypto from 'crypto'
import { CategoryMapper } from './category-mapper'

describe('CategoryMapper', () => {
  let provider: CategoryMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryMapper],
    }).compile()

    provider = module.get<CategoryMapper>(CategoryMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })

  it('should map create category dto to category entity', () => {
    const result = provider.fromCreateToEntity({
      name: 'name',
    })

    expect(result.name).toBe('name')
  })

  it('should map update category dto to category entity', () => {
    const category: Category = {
      name: 'name',
      funkos: [],
      deletedAt: null,
      id: crypto.randomUUID(),
    }
    const result = provider.fromUpdateToEntity(category, {
      name: 'updated name',
    })

    expect(result.name).toBe('updated name')
  })
})

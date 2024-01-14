import {
  category,
  categoryResponseDto,
  createCategoryDto,
  updateCategoryDto,
} from '@/mocks'
import { CategoryMapper } from '@/rest/category/category-mapper/category-mapper'
import { Category } from '@/rest/category/entities/category.entity'
import { NotificationsGateway } from '@/rest/notifications/notifications.gateway'
import { createMockedService } from '@/utils'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConflictException, NotFoundException } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CategoryService } from './category.service'

describe('CategoryService', () => {
  let service: CategoryService

  let mapper: CategoryMapper
  let categoryRepository: Repository<Category>

  const categoryMapperMock = createMockedService(CategoryMapper)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryMapper,
          useValue: categoryMapperMock,
        },
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
        {
          provide: NotificationsGateway,
          useValue: createMockedService(NotificationsGateway),
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(() => Promise.resolve()),
            set: jest.fn(() => Promise.resolve()),
            del: jest.fn(() => Promise.resolve()),
            store: {
              keys: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<CategoryService>(CategoryService)
    mapper = module.get<CategoryMapper>(CategoryMapper)
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a category', async () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(undefined)
      jest.spyOn(categoryRepository, 'save').mockResolvedValue(category)
      jest.spyOn(mapper, 'fromCreateToEntity').mockReturnValue(category)
      jest
        .spyOn(mapper, 'fromEntityToResponseDto')
        .mockReturnValue(categoryResponseDto)

      expect(await service.create(createCategoryDto)).toBe(categoryResponseDto)
    })

    it('should throw an error if the category already exists', () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(category)
      expect(service.create(createCategoryDto)).rejects.toThrow(
        ConflictException,
      )
    })
  })

  describe('findAll', () => {
    it('should return all categories', async () => {
      jest.spyOn(categoryRepository, 'find').mockResolvedValue([category])
      jest
        .spyOn(mapper, 'fromEntityToResponseDto')
        .mockReturnValue(categoryResponseDto)
      expect(await service.findAll({ path: 'test' })).toStrictEqual({
        data: [categoryResponseDto],
      })
    })
  })

  describe('findOne', () => {
    it('should return a category', async () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(category)
      jest
        .spyOn(mapper, 'fromEntityToResponseDto')
        .mockReturnValue(categoryResponseDto)
      expect(await service.findOne('1')).toEqual(categoryResponseDto)
    })

    it('should throw an error if the category does not exist', () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(undefined)
      expect(service.findOne('1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update a category', async () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(category)
      jest.spyOn(categoryRepository, 'save').mockResolvedValue(category)
      jest.spyOn(mapper, 'fromUpdateToEntity').mockReturnValue(category)
      jest
        .spyOn(mapper, 'fromEntityToResponseDto')
        .mockReturnValue(categoryResponseDto)
      expect(await service.update('1', updateCategoryDto)).toEqual(
        categoryResponseDto,
      )
    })

    it('should throw an error if the category does not exist', () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(undefined)
      expect(service.update('1', updateCategoryDto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('should remove a category', async () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(category)
      jest.spyOn(categoryRepository, 'softDelete').mockResolvedValue(undefined)
      expect(await service.remove('1')).toBeUndefined()
    })

    it('should throw an error if the category does not exist', () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(undefined)
      expect(service.remove('1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('restore', () => {
    it('should restore a category', async () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(undefined)
      jest.spyOn(categoryRepository, 'restore').mockResolvedValue(undefined)
      expect(await service.restore('1')).toBeUndefined()
    })

    it('should throw an error if the category is not deleted', () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(category)
      expect(service.restore('1')).rejects.toThrow(ConflictException)
    })
  })
})

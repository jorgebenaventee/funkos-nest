import { categoryResponseDto, createCategoryDto } from '@/mocks'
import type { CategoryResponseDto } from '@/rest/category/dto/category-response.dto'
import { createMockedService } from '@/utils'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConflictException, NotFoundException } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import type { Paginated } from 'nestjs-paginate'
import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'
import { RolesAuthGuard } from '@/auth/roles-auth.guard'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'

describe('CategoryController', () => {
  let controller: CategoryController
  let service: CategoryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: createMockedService(CategoryService),
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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(() => true)
      .overrideGuard(RolesAuthGuard)
      .useValue(() => true)
      .compile()

    controller = module.get<CategoryController>(CategoryController)
    service = module.get<CategoryService>(CategoryService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a category', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(categoryResponseDto)

      expect(await controller.create(createCategoryDto)).toBe(
        categoryResponseDto,
      )
    })

    it('should throw an error when the category already exists', () => {
      jest.spyOn(service, 'create').mockRejectedValue(new ConflictException())

      expect(controller.create(createCategoryDto)).rejects.toThrow(
        ConflictException,
      )
    })
  })

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue({
        data: [categoryResponseDto],
      } as unknown as Paginated<CategoryResponseDto>)

      expect(await controller.findAll({ path: 'test' })).toStrictEqual({
        data: [categoryResponseDto],
      })
    })
  })

  describe('findOne', () => {
    it('should return a category', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(categoryResponseDto)

      expect(await controller.findOne('1')).toBe(categoryResponseDto)
    })

    it('should throw an error when the category does not exist', () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      expect(controller.findOne('1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update a category', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(categoryResponseDto)

      expect(await controller.update('1', createCategoryDto)).toBe(
        categoryResponseDto,
      )
    })

    it('should throw an error when the category does not exist', () => {
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
      expect(controller.update('1', createCategoryDto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('should remove a category', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined)

      expect(await controller.remove('1')).toBe(undefined)
    })

    it('should throw an error when the category does not exist', () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())
      expect(controller.remove('1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('restore', () => {
    it('should restore a category', async () => {
      jest.spyOn(service, 'restore').mockResolvedValue(undefined)

      expect(await controller.restore('1')).toBe(undefined)
    })

    it('should throw an error when the category does not exist', () => {
      jest.spyOn(service, 'restore').mockRejectedValue(new NotFoundException())
      expect(controller.restore('1')).rejects.toThrow(NotFoundException)
    })

    it('should throw an error when the category is not deleted', () => {
      jest.spyOn(service, 'restore').mockRejectedValue(new ConflictException())
      expect(controller.restore('1')).rejects.toThrow(ConflictException)
    })
  })
})

import { createFunkoDto, mockedResponseFunko, updateFunkoDto } from '@/mocks'
import type { FunkoResponseDto } from '@/rest/funko/dto/funko-response.dto'
import { Funko } from '@/rest/funko/entities/funko.entity'
import { FunkoExistsGuard } from '@/rest/guards/funko-exists/funko-exists.guard'
import { createMockedService } from '@/utils'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { NotFoundException } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import type { Paginated } from 'nestjs-paginate'
import { Repository } from 'typeorm'
import { FunkoController } from './funko.controller'
import { FunkoService } from './funko.service'

describe('FunkoController', () => {
  let controller: FunkoController
  let service: FunkoService

  const funkosServiceMock = createMockedService(FunkoService)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FunkoController],
      providers: [
        {
          provide: FunkoService,
          useValue: funkosServiceMock,
        },
        {
          provide: FunkoExistsGuard,
          useValue: createMockedService(FunkoExistsGuard),
        },
        {
          provide: getRepositoryToken(Funko),
          useValue: Repository,
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

    controller = module.get<FunkoController>(FunkoController)
    service = module.get<FunkoService>(FunkoService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of funkos', async () => {
      const result: FunkoResponseDto[] = [mockedResponseFunko]
      // @ts-ignore
      jest.spyOn(service, 'findAll').mockResolvedValue({
        data: result,
      } as unknown as Paginated<FunkoResponseDto>)
      expect(await controller.findAll({ path: 'test' })).toStrictEqual({
        data: result,
      })
    })
  })

  describe('findOne', () => {
    it('should return a funko', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockedResponseFunko)
      expect(await controller.findOne('1')).toBe(mockedResponseFunko)
    })

    it('should throw an error if funko not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should return a funko', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockedResponseFunko)
      expect(await controller.create(createFunkoDto)).toBe(mockedResponseFunko)
    })

    it('should throw an error if funko already exists', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(new NotFoundException())
      await expect(controller.create(createFunkoDto)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw an error if category not found', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(new NotFoundException())
      await expect(controller.create(createFunkoDto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('update', () => {
    it('should return a funko', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(mockedResponseFunko)
      expect(await controller.update('1', updateFunkoDto)).toBe(
        mockedResponseFunko,
      )
    })

    it('should throw an error if funko not found', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
      await expect(controller.update('1', updateFunkoDto)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw an error if funko already exists', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
      await expect(controller.update('1', updateFunkoDto)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw an error if category not found', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
      await expect(controller.update('1', updateFunkoDto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('should return nothing', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined)
      expect(await controller.remove('1')).toBe(undefined)
    })

    it('should throw an error if funko not found', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())
      await expect(controller.remove('1')).rejects.toThrow(NotFoundException)
    })
  })
})

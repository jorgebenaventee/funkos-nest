import { Category } from '@/rest/category/entities/category.entity'
import { Funko } from '@/rest/funko/entities/funko.entity'
import { FunkoMapper } from '@/rest/funko/funko-mapper/funko-mapper'
import { createMockedService } from '@/utils'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FunkoService } from './funko.service'
import {
  funko,
  updateFunkoDto,
  createFunkoDto,
  mockedResponseFunko,
  category,
} from '@/mocks'

describe('FunkoService', () => {
  let service: FunkoService
  let funkoRepository: Repository<Funko>
  let categoryRepository: Repository<Category>
  let mapper: FunkoMapper

  const funkoMapperMock = createMockedService(FunkoMapper)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FunkoService,
        {
          provide: FunkoMapper,
          useValue: funkoMapperMock,
        },
        {
          provide: getRepositoryToken(Funko),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
      ],
    }).compile()

    service = module.get<FunkoService>(FunkoService)
    funkoRepository = module.get<Repository<Funko>>(getRepositoryToken(Funko))
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    )
    mapper = module.get<FunkoMapper>(FunkoMapper)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a funko', () => {
      jest.spyOn(funkoRepository, 'exist').mockResolvedValue(false)
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(category)
      jest.spyOn(mapper, 'fromCreate').mockReturnValue(funko)
      jest.spyOn(funkoRepository, 'save').mockResolvedValue(funko)
      jest.spyOn(mapper, 'toResponse').mockReturnValue(mockedResponseFunko)
      expect(service.create(createFunkoDto)).resolves.toEqual(
        mockedResponseFunko,
      )
    })

    it('should throw a conflict exception if funko already exists', () => {
      jest.spyOn(funkoRepository, 'exist').mockResolvedValue(true)
      expect(service.create(createFunkoDto)).rejects.toThrowError(
        'Funko Funko 1 already exists',
      )
    })

    it('should throw a not found exception if category does not exist', () => {
      jest.spyOn(funkoRepository, 'exist').mockResolvedValue(false)
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(undefined)
      expect(service.create(createFunkoDto)).rejects.toThrowError(
        'Category Category 1 not found',
      )
    })
  })

  describe('findAll', () => {
    it('should return all funkos', () => {
      jest.spyOn(funkoRepository, 'find').mockResolvedValue([funko])
      jest.spyOn(mapper, 'toResponse').mockReturnValue(mockedResponseFunko)
      expect(service.findAll()).resolves.toEqual([mockedResponseFunko])
    })
  })

  describe('findOne', () => {
    it('should return a funko', () => {
      jest.spyOn(funkoRepository, 'findOne').mockResolvedValue(funko)
      jest.spyOn(mapper, 'toResponse').mockReturnValue(mockedResponseFunko)
      expect(service.findOne(1)).resolves.toEqual(mockedResponseFunko)
    })

    it('should throw a not found exception if funko does not exist', () => {
      jest.spyOn(funkoRepository, 'findOne').mockResolvedValue(undefined)
      expect(service.findOne(1)).rejects.toThrowError(
        'Funko with id 1 not found',
      )
    })
  })

  describe('update', () => {
    it('should update a funko', async () => {
      jest.spyOn(funkoRepository, 'findOne').mockResolvedValue(funko)
      jest.spyOn(funkoRepository, 'exist').mockResolvedValue(false)
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(category)
      jest.spyOn(mapper, 'fromUpdate').mockReturnValue(funko)
      jest.spyOn(funkoRepository, 'save').mockResolvedValue(funko)
      jest.spyOn(mapper, 'toResponse').mockReturnValue(mockedResponseFunko)
      expect(await service.update(1, updateFunkoDto)).toEqual(
        mockedResponseFunko,
      )
    })

    it('should throw a not found exception if funko does not exist', () => {
      jest.spyOn(funkoRepository, 'findOne').mockResolvedValue(undefined)
      expect(service.update(1, updateFunkoDto)).rejects.toThrowError(
        'Funko with id 1 not found',
      )
    })

    it('should throw a conflict exception if funko already exists', () => {
      jest.spyOn(funkoRepository, 'findOne').mockResolvedValue(funko)
      jest.spyOn(funkoRepository, 'exist').mockResolvedValue(true)
      expect(service.update(1, updateFunkoDto)).rejects.toThrowError(
        'Funko Funko 1 already exists',
      )
    })

    it('should throw a not found exception if category does not exist', () => {
      jest.spyOn(funkoRepository, 'findOne').mockResolvedValue(funko)
      jest.spyOn(funkoRepository, 'exist').mockResolvedValue(false)
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(undefined)
      expect(service.update(1, updateFunkoDto)).rejects.toThrowError(
        'Category Category 1 not found',
      )
    })
  })
})

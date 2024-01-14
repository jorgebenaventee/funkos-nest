import {
  category,
  createFunkoDto,
  funko,
  mockedResponseFunko,
  updateFunkoDto,
} from '@/mocks'
import { Category } from '@/rest/category/entities/category.entity'
import { Funko } from '@/rest/funko/entities/funko.entity'
import { FunkoMapper } from '@/rest/funko/funko-mapper/funko-mapper'
import { NotificationsGateway } from '@/rest/notifications/notifications.gateway'
import { StorageService } from '@/rest/storage/storage.service'
import { createMockedService } from '@/utils'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FunkoService } from './funko.service'

describe('FunkoService', () => {
  let service: FunkoService
  let funkoRepository: Repository<Funko>
  let categoryRepository: Repository<Category>
  let mapper: FunkoMapper
  let notificationsGateway: NotificationsGateway
  let storageService: StorageService

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
        {
          provide: NotificationsGateway,
          useValue: createMockedService(NotificationsGateway),
        },
        {
          provide: StorageService,
          useValue: createMockedService(StorageService),
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

    service = module.get<FunkoService>(FunkoService)
    funkoRepository = module.get<Repository<Funko>>(getRepositoryToken(Funko))
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    )
    mapper = await module.resolve<FunkoMapper>(FunkoMapper)
    notificationsGateway =
      module.get<NotificationsGateway>(NotificationsGateway)
    storageService = module.get<StorageService>(StorageService)
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
      jest
        .spyOn(notificationsGateway, 'sendMessage')
        .mockImplementation(() => {})
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
      expect(service.findAll({ path: 'test' })).resolves.toStrictEqual({
        data: [mockedResponseFunko],
      })
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

  describe('remove', () => {
    it('should throw a not found exception if funko does not exist', () => {
      jest.spyOn(funkoRepository, 'findOne').mockResolvedValue(undefined)
      expect(service.remove(1)).rejects.toThrowError(
        'Funko with id 1 not found',
      )
    })
  })

  describe('find image', () => {
    it('should return image', async () => {
      jest.spyOn(funkoRepository, 'findOne').mockResolvedValue(funko)
      jest.spyOn(storageService, 'findImage').mockResolvedValue('image')
      expect(await service.findImage(1)).toEqual('image')
    })

    it('should throw 404 if funko does not exist', () => {
      jest.spyOn(funkoRepository, 'findOne').mockResolvedValue(undefined)
      expect(service.findImage(1)).rejects.toThrowError(
        'Funko with id 1 not found',
      )
    })

    it('should throw 404 if image does not exist', () => {
      jest.spyOn(funkoRepository, 'findOne').mockResolvedValue(funko)
      jest.spyOn(storageService, 'findImage').mockImplementation(() => {
        throw new Error()
      })
      expect(service.findImage(1)).rejects.toThrowError(
        'Image for funko with id 1 not found',
      )
    })
  })

  describe('update image', () => {
    const file: Express.Multer.File = {
      buffer: Buffer.from('image'),
      filename: 'image',
      destination: 'destination',
      fieldname: 'file',
      encoding: 'utf-8',
      path: 'path',
      size: 1024,
      stream: null,
      mimetype: 'image/jpeg',
      originalname: 'image',
    }
    it('should update image and remove previous', async () => {
      jest.spyOn(funkoRepository, 'findOne').mockResolvedValue(funko)
      jest.spyOn(funkoRepository, 'save').mockResolvedValue(funko)
      jest.spyOn(mapper, 'toResponse').mockReturnValue(mockedResponseFunko)
      expect(await service.updateImage(1, file)).toEqual(mockedResponseFunko)
    })

    it('should throw 404 if funko does not exist', () => {
      jest.spyOn(funkoRepository, 'findOne').mockResolvedValue(undefined)
      expect(service.updateImage(1, file)).rejects.toThrowError(
        'Funko with id 1 not found',
      )
    })

    it('should throw 400 if no file is provided', () => {
      expect(service.updateImage(1, undefined)).rejects.toThrowError(
        'No file provided',
      )
    })
  })
})

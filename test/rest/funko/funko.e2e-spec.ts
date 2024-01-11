import { FunkoController } from '@/rest/funko/funko.controller'
import { FunkoService } from '@/rest/funko/funko.service'
import { createMockedService } from '@/utils'
import {
  ConflictException,
  type INestApplication,
  NotFoundException,
} from '@nestjs/common'
import { createFunkoDto, mockedResponseFunko, updateFunkoDto } from '@/mocks'
import { Test, type TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { FunkoExistsGuard } from '@/rest/guards/funko-exists/funko-exists.guard'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Funko } from '@/rest/funko/entities/funko.entity'
import { Repository } from 'typeorm'
import { CACHE_MANAGER } from '@nestjs/cache-manager'

describe('FunkoController (e2e)', () => {
  let app: INestApplication
  let service: FunkoService
  const endpoint = '/funko'

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FunkoController],
      providers: [
        FunkoExistsGuard,
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
        {
          provide: FunkoService,
          useValue: createMockedService(FunkoService),
        },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    service = moduleFixture.get<FunkoService>(FunkoService)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST', () => {
    it('should create a funko', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockedResponseFunko)

      const { body, statusCode } = await request(app.getHttpServer())
        .post(endpoint)
        .send(createFunkoDto)
      expect(body.name).toEqual(mockedResponseFunko.name)
      expect(statusCode).toEqual(201)
      expect(service.create).toHaveBeenCalledWith(createFunkoDto)
    })

    it('should throw an error when the funko already exists', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(new ConflictException())

      await request(app.getHttpServer())
        .post(endpoint)
        .send(createFunkoDto)
        .expect(409)
    })
  })

  describe('GET', () => {
    it('should return an array of funkos', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockedResponseFunko])
      const { body } = await request(app.getHttpServer())
        .get(endpoint)
        .expect(200)
      expect(body.map((f) => f.id)).toEqual([mockedResponseFunko.id])
      expect(service.findAll).toHaveBeenCalled()
    })
  })

  describe('GET :id', () => {
    it('should return a funko', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockedResponseFunko)
      const { body } = await request(app.getHttpServer())
        .get(`${endpoint}/1`)
        .expect(200)
      expect(body.name).toEqual(mockedResponseFunko.name)
      expect(service.findOne).toHaveBeenCalledWith(1)
    })

    it('should throw an error when the funko does not exist', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer()).get(`${endpoint}/1`).expect(404)
    })
  })

  describe('PUT :id', () => {
    it('should update a funko', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(mockedResponseFunko)
      const { body } = await request(app.getHttpServer())
        .put(`${endpoint}/1`)
        .send(updateFunkoDto)
        .expect(200)
      expect(body.name).toEqual(updateFunkoDto.name)
      expect(service.update).toHaveBeenCalledWith(1, updateFunkoDto)
    })

    it('should throw an error when the funko does not exist', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${endpoint}/1`)
        .send(updateFunkoDto)
        .expect(404)
    })
  })

  describe('DELETE :id', () => {
    it('should delete a funko', async () => {
      await request(app.getHttpServer()).delete(`${endpoint}/1`).expect(200)
      expect(service.remove).toHaveBeenCalledWith(1)
    })

    it('should throw an error when the funko does not exist', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer()).delete(`${endpoint}/1`).expect(404)
    })
  })
})

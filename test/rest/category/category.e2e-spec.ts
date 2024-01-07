import { categoryResponseDto, createCategoryDto } from '@/mocks'
import { CategoryController } from '@/rest/category/category.controller'
import { CategoryService } from '@/rest/category/category.service'
import { createMockedService } from '@/utils'
import {
  ConflictException,
  type INestApplication,
  NotFoundException,
} from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import * as request from 'supertest'

describe('CategoryController (e2e)', () => {
  let app: INestApplication
  let service: CategoryService
  const endpoint = '/category'

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: createMockedService(CategoryService),
        },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    service = moduleFixture.get<CategoryService>(CategoryService)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST', () => {
    it('should create a category', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(categoryResponseDto)

      const { body, statusCode } = await request(app.getHttpServer())
        .post(endpoint)
        .send(createCategoryDto)
      expect(body.name).toEqual(categoryResponseDto.name)
      expect(statusCode).toEqual(201)
      expect(service.create).toHaveBeenCalledWith(createCategoryDto)
    })

    it('should throw an error when the category already exists', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(new ConflictException())

      await request(app.getHttpServer())
        .post(endpoint)
        .send(createCategoryDto)
        .expect(409)
    })
  })

  describe('GET', () => {
    it('should return an array of categories', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([categoryResponseDto])
      const { body } = await request(app.getHttpServer())
        .get(endpoint)
        .expect(200)
      expect(body.map((c) => c.id)).toEqual([categoryResponseDto.id])
      expect(service.findAll).toHaveBeenCalled()
    })
  })

  describe('GET :id', () => {
    it('should return a category', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(categoryResponseDto)
      const { body } = await request(app.getHttpServer())
        .get(`${endpoint}/${categoryResponseDto.id}`)
        .expect(200)
      expect(body.id).toEqual(categoryResponseDto.id)
      expect(service.findOne).toHaveBeenCalledWith(categoryResponseDto.id)
    })
    it('should return a 404 when the category does not exist', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .get(`${endpoint}/${categoryResponseDto.id}`)
        .expect(404)
    })
  })

  describe('PUT :id', () => {
    it('should update a category', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(categoryResponseDto)
      const { body } = await request(app.getHttpServer())
        .put(`${endpoint}/${categoryResponseDto.id}`)
        .send(createCategoryDto)
        .expect(200)
      expect(body.id).toEqual(categoryResponseDto.id)
      expect(service.update).toHaveBeenCalledWith(
        categoryResponseDto.id,
        createCategoryDto,
      )
    })
    it('should return a 404 when the category does not exist', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${endpoint}/${categoryResponseDto.id}`)
        .expect(404)
    })
  })

  describe('DELETE :id', () => {
    it('should delete a category', async () => {
      const { body } = await request(app.getHttpServer())
        .delete(`${endpoint}/${categoryResponseDto.id}`)
        .expect(204)
      expect(service.remove).toHaveBeenCalledWith(categoryResponseDto.id)
    })
    it('should return a 404 when the category does not exist', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .delete(`${endpoint}/${categoryResponseDto.id}`)
        .expect(404)
    })
  })

  describe('RESTORE', () => {
    it('should restore a category', async () => {
      await request(app.getHttpServer())
        .put(`${endpoint}/${categoryResponseDto.id}/restore`)
        .expect(200)
      expect(service.restore).toHaveBeenCalledWith(categoryResponseDto.id)
    })
    it('should return a 409 when the category is not deleted', async () => {
      jest.spyOn(service, 'restore').mockRejectedValue(new ConflictException())
      await request(app.getHttpServer())
        .put(`${endpoint}/${categoryResponseDto.id}/restore`)
        .expect(409)
    })
  })
})

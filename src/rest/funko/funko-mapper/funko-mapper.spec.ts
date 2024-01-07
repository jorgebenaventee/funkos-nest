import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { FunkoMapper } from './funko-mapper'
import { funko, createFunkoDto, updateFunkoDto } from '@/mocks'

describe('FunkoMapper', () => {
  let provider: FunkoMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunkoMapper],
    }).compile()

    provider = module.get<FunkoMapper>(FunkoMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })

  describe('fromCreate', () => {
    it('should map create funko dto to funko entity', () => {
      const result = provider.fromCreate(createFunkoDto)

      expect(result.name).toBe(createFunkoDto.name)
      expect(result.category).toBe(null)
      expect(result.image).toBe('https://placehold.co/600x400')
    })
  })

  describe('fromUpdate', () => {
    it('should map update funko dto to funko entity', () => {
      const result = provider.fromUpdate(updateFunkoDto, funko)

      expect(result.name).toBe(updateFunkoDto.name)
      expect(result.category).toBe(funko.category)
      expect(result.image).toBe(funko.image)
    })
  })

  describe('toResponse', () => {
    it('should map funko entity to funko response dto', () => {
      const result = provider.toResponse(funko)

      expect(result.name).toBe(funko.name)
      expect(result.categoryName).toBe(funko.category.name)
      expect(result.image).toBe(funko.image)
    })
  })
})

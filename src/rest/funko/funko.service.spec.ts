import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { FunkoService } from './funko.service'

describe('FunkoService', () => {
  let service: FunkoService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunkoService],
    }).compile()

    service = module.get<FunkoService>(FunkoService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

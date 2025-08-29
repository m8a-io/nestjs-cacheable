import { Test, TestingModule } from '@nestjs/testing'
import { NestjsCacheableService } from './nestjs-cacheable.service'
import { HealthService } from './health.service'
import { CACHEABLE } from './constants'
import { Cacheable } from 'cacheable'

describe('NestjsCacheableService', () => {
  let service: NestjsCacheableService
  let cache: Cacheable
  let healthService: HealthService

  const mockCacheable = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    wrap: jest.fn(),
  }

  const mockHealthService = {
    getHealth: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NestjsCacheableService,
        {
          provide: CACHEABLE,
          useValue: mockCacheable,
        },
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile()

    service = module.get<NestjsCacheableService>(NestjsCacheableService)
    cache = module.get<Cacheable>(CACHEABLE)
    healthService = module.get<HealthService>(HealthService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when cache is healthy', () => {
    beforeEach(() => {
      mockHealthService.getHealth.mockReturnValue(true)
    })

    it('should call cache.get', async () => {
      await service.get('key')
      expect(cache.get).toHaveBeenCalledWith('key')
    })

    it('should call cache.set', async () => {
      await service.set('key', 'value', 1000)
      expect(cache.set).toHaveBeenCalledWith('key', 'value', 1000)
    })

    it('should call cache.delete', async () => {
      await service.del('key')
      expect(cache.delete).toHaveBeenCalledWith('key')
    })

    it('should call cache.wrap', async () => {
      const fn = jest.fn()
      const options = { ttl: 1000 }
      // Mock the inner wrap function to avoid calling the real one
      mockCacheable.wrap.mockReturnValue(jest.fn())
      const wrappedFn = service.wrap(fn, options)
      await wrappedFn()
      expect(cache.wrap).toHaveBeenCalledWith(fn, options)
    })
  })

  describe('when cache is unhealthy', () => {
    beforeEach(() => {
      mockHealthService.getHealth.mockReturnValue(false)
    })

    it('should not call cache.get and return undefined', async () => {
      const result = await service.get('key')
      expect(cache.get).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it('should not call cache.set and return false', async () => {
      const result = await service.set('key', 'value')
      expect(cache.set).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it('should not call cache.delete and return false', async () => {
      const result = await service.del('key')
      expect(cache.delete).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it('should not call cache.wrap and call the function directly', async () => {
      const fn = jest.fn().mockResolvedValue('result')
      const wrappedFn = service.wrap(fn, {})
      const result = await wrappedFn()
      expect(cache.wrap).not.toHaveBeenCalled()
      expect(fn).toHaveBeenCalled()
      expect(result).toBe('result')
    })
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { NestjsCacheableService } from './nestjs-cacheable.service'
import { CACHEABLE } from './constants'
import { Cacheable } from 'cacheable'

describe('NestjsCacheableService', () => {
  let service: NestjsCacheableService
  let cache: Cacheable

  const mockCacheable = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    wrap: jest.fn(),
    primary: 'primary-store' as any,
    secondary: 'secondary-store' as any,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NestjsCacheableService,
        {
          provide: CACHEABLE,
          useValue: mockCacheable,
        },
      ],
    }).compile()

    service = module.get<NestjsCacheableService>(NestjsCacheableService)
    cache = module.get<Cacheable>(CACHEABLE)
  })

  afterEach(() => {
    jest.clearAllMocks()
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

  it('should return the primary store', () => {
    expect(service.primary).toBe('primary-store')
  })

  it('should return the secondary store', () => {
    expect(service.secondary).toBe('secondary-store')
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { CacheableInterceptor } from './cacheable.interceptor'
import { NestjsCacheableService } from './nestjs-cacheable.service'
import { Reflector } from '@nestjs/core'
import { firstValueFrom, of } from 'rxjs'
import { CACHE_TTL_KEY } from './cache-ttl.decorator'

describe('CacheableInterceptor', () => {
  let interceptor: CacheableInterceptor
  let cacheService: NestjsCacheableService
  let reflector: Reflector

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
  }

  const mockReflector = {
    get: jest.fn(),
  }

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        url: '/test',
      }),
    }),
    getHandler: () => ({}),
  } as any

  const mockCallHandler = {
    handle: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheableInterceptor,
        {
          provide: NestjsCacheableService,
          useValue: mockCacheService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile()

    interceptor = module.get<CacheableInterceptor>(CacheableInterceptor)
    cacheService = module.get<NestjsCacheableService>(NestjsCacheableService)
    reflector = module.get<Reflector>(Reflector)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(interceptor).toBeDefined()
  })

  it('should return cached value if it exists', async () => {
    mockCacheService.get.mockResolvedValue('cached_value')
    const result$ = await interceptor.intercept(mockExecutionContext, mockCallHandler)
    const result = await firstValueFrom(result$)
    expect(result).toBe('cached_value')
    expect(mockCallHandler.handle).not.toHaveBeenCalled()
  })

  it('should call handler, cache the result, and return it if no cached value', async () => {
    mockCacheService.get.mockResolvedValue(undefined)
    mockCallHandler.handle.mockReturnValue(of('new_value'))
    const result$ = await interceptor.intercept(mockExecutionContext, mockCallHandler)
    const value = await firstValueFrom(result$)
    expect(value).toBe('new_value')
    expect(mockCacheService.set).toHaveBeenCalledWith('/test', 'new_value', undefined)
  })

  it('should use TTL from decorator if present', async () => {
    mockCacheService.get.mockResolvedValue(undefined)
    mockCallHandler.handle.mockReturnValue(of('new_value'))
    mockReflector.get.mockReturnValue(5000)
    const result$ = await interceptor.intercept(mockExecutionContext, mockCallHandler)
    await firstValueFrom(result$)
    expect(mockCacheService.set).toHaveBeenCalledWith('/test', 'new_value', 5000)
  })
})

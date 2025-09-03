import { Test, TestingModule } from '@nestjs/testing'
import {
  INestApplication,
  Controller,
  Get,
  UseInterceptors,
  Injectable,
  Module,
} from '@nestjs/common'
import request from 'supertest'
import { NestjsCacheableModule } from '../libs/nestjs-cacheable/src/nestjs-cacheable.module'
import { CacheableInterceptor } from '../libs/nestjs-cacheable/src/cacheable.interceptor'
import { CacheTTL } from '../libs/nestjs-cacheable/src/cache-ttl.decorator'
import KeyvRedis from '@keyv/redis'
import Keyv from 'keyv'

// Mock Config for testing
@Injectable()
class Config {
  CACHE_USERNAME = ''
  CACHE_PASSWORD = ''
  CACHE_HOST = 'localhost'
  CACHE_PORT = 6379
  CACHE_KEY_PREFIX = 'test-prefix'
}

@Module({
  providers: [Config],
  exports: [Config],
})
class ConfigModule {}

// A mock controller to test the interceptor
@Controller()
class TestController {
  public callCount = 0

  @Get('/test')
  @UseInterceptors(CacheableInterceptor)
  @CacheTTL(1000) // 10 second TTL
  getTestData() {
    this.callCount++
    return { data: 'test_data', callCount: this.callCount }
  }

  reset() {
    this.callCount = 0
  }
}

describe('CacheableInterceptor with registerAsync (e2e)', () => {
  let app: INestApplication
  let testController: TestController

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        NestjsCacheableModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (config: Config) => ({
            secondary: new Keyv({
              store: new KeyvRedis(
                `redis://${config.CACHE_HOST}:${config.CACHE_PORT}`,
              ),
            }),
            namespace: config.CACHE_KEY_PREFIX,
          }),
          inject: [Config],
        }),
      ],
      controllers: [TestController],
      providers: [CacheableInterceptor],
    }).compile()

    app = moduleFixture.createNestApplication()
    testController = moduleFixture.get<TestController>(TestController)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    testController.reset()
  })

  it('should cache the response in redis', async () => {
    // First call - should not be cached
    const response1 = await request(app.getHttpServer())
      .get('/test')
      .expect(200)
    expect(response1.body).toEqual({ data: 'test_data', callCount: 1 })

    // Second call - should be cached
    const response2 = await request(app.getHttpServer())
      .get('/test')
      .expect(200)
    expect(response2.body).toEqual({ data: 'test_data', callCount: 1 })

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 1100))

    // Third call - should not be cached
    const response3 = await request(app.getHttpServer())
      .get('/test')
      .expect(200)
    expect(response3.body).toEqual({ data: 'test_data', callCount: 2 })
  })
})

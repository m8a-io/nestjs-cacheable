import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, Controller, Get, UseInterceptors } from '@nestjs/common'
import request from 'supertest'
import { NestjsCacheableModule } from '../libs/nestjs-cacheable/src/nestjs-cacheable.module'
import { CacheableInterceptor } from '../libs/nestjs-cacheable/src/cacheable.interceptor'
import { CacheTTL } from '../libs/nestjs-cacheable/src/cache-ttl.decorator'
import KeyvRedis from '@keyv/redis'
import Keyv from 'keyv'

// A mock controller to test the interceptor
@Controller()
class TestController {
  private callCount = 0

  @Get('/test')
  @UseInterceptors(CacheableInterceptor)
  @CacheTTL(1000) // 1 second TTL
  getTestData() {
    this.callCount++
    return { data: 'test_data', callCount: this.callCount }
  }
}

describe('CacheableInterceptor (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        NestjsCacheableModule.register({
          secondary: new Keyv(new KeyvRedis('redis://localhost:6379')),
        }),
      ],
      controllers: [TestController],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
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
    expect(response2.body).toEqual({ data: 'test_data', callCount: 1 }) // callCount should still be 1

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 1100))

    // Third call - should not be cached
    const response3 = await request(app.getHttpServer())
      .get('/test')
      .expect(200)
    expect(response3.body).toEqual({ data: 'test_data', callCount: 2 }) // callCount should now be 2
  })
})

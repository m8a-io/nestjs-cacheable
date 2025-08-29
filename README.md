# @m8a-io/nestjs-cacheable

A flexible and powerful caching module for NestJS that provides an easy-to-use API for tiered caching (in-memory and Redis) with robust fault tolerance.

## Installation

```bash
pnpm add @m8a-io/nestjs-cacheable cacheable ioredis keyv @keyv/redis
```

## Usage

### Module Registration

Import the `NestjsCacheableModule` into your application's root module.

#### Static Registration

For static configuration, use the `register()` method.

```typescript
// app.module.ts
import { Module } from '@nestjs/common'
import { NestjsCacheableModule } from '@m8a-io/nestjs-cacheable'
import KeyvRedis from '@keyv/redis'

@Module({
  imports: [
    NestjsCacheableModule.register({
      secondary: new KeyvRedis('redis://user:pass@localhost:6379'),
    }),
  ],
})
export class AppModule {}
```

#### Asynchronous Registration

For asynchronous configuration, use the `registerAsync()` method. This is useful if you need to inject other services (like a `ConfigService`) to get your cache configuration.

```typescript
// app.module.ts
import { Module } from '@nestjs/common'
import { NestjsCacheableModule } from '@m8a-io/nestjs-cacheable'
import { ConfigModule, ConfigService } from '@nestjs/config'
import KeyvRedis from '@keyv/redis'

@Module({
  imports: [
    NestjsCacheableModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secondary: new KeyvRedis(configService.get('REDIS_URL')),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Declarative Caching with Interceptor

The easiest way to use the cache is with the `CacheableInterceptor`. You can apply it to any controller or method.

```typescript
// app.controller.ts
import { Controller, Get, UseInterceptors } from '@nestjs/common'
import { CacheableInterceptor, CacheTTL } from '@m8a-io/nestjs-cacheable'

@Controller()
export class AppController {
  @Get()
  @UseInterceptors(CacheableInterceptor)
  @CacheTTL(5000) // Cache this response for 5 seconds
  getData() {
    // This method will be cached.
    // The first request will execute it, and subsequent requests
    // within 5 seconds will receive the cached response.
    return { message: 'This is some data from a slow source.' }
  }
}
```

### Using the Service Directly

You can also inject the `NestjsCacheableService` to interact with the cache programmatically.

```typescript
// my.service.ts
import { Injectable } from '@nestjs/common'
import { NestjsCacheableService } from '@m8a-io/nestjs-cacheable'

@Injectable()
export class MyService {
  constructor(private readonly cache: NestjsCacheableService) {}

  async getSomeData(id: string) {
    const key = `my-data:${id}`
    const cachedData = await this.cache.get(key)

    if (cachedData) {
      return cachedData
    }

    const freshData = await this.fetchDataFromDb(id)
    await this.cache.set(key, freshData, 30000) // Cache for 30 seconds
    return freshData
  }

  private async fetchDataFromDb(id: string) {
    // ... slow database call
  }
}
```

## Fault Tolerance

The module is designed to be resilient. If a secondary Redis store is configured, the module will automatically monitor its connection status. If the Redis connection is lost, the module will gracefully bypass the cache and log a warning, ensuring your application remains available.
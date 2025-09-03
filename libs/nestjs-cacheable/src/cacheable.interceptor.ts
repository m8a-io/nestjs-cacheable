import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable, of, firstValueFrom } from 'rxjs'
import { NestjsCacheableService } from './nestjs-cacheable.service'
import { Reflector } from '@nestjs/core'
import { CACHE_TTL_KEY } from './cache-ttl.decorator'

@Injectable()
export class CacheableInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: NestjsCacheableService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const key = this.getCacheKey(context)
    const cachedValue = await this.cacheService.get(key)

    if (cachedValue) {
      return of(cachedValue)
    }

    const ttl = this.reflector.get<number>(CACHE_TTL_KEY, context.getHandler())

    const value = await firstValueFrom(next.handle())
    await this.cacheService.set(key, value, ttl)
    return of(value)
  }

  private getCacheKey(context: ExecutionContext): string {
    // A simple key generation strategy. This can be improved later.
    const httpContext = context.switchToHttp()
    const request = httpContext.getRequest()
    return request.url
  }
}
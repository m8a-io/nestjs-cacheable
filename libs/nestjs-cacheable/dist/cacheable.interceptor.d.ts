import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { NestjsCacheableService } from './nestjs-cacheable.service';
import { Reflector } from '@nestjs/core';
export declare class CacheableInterceptor implements NestInterceptor {
    private readonly cacheService;
    private readonly reflector;
    constructor(cacheService: NestjsCacheableService, reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
    private getCacheKey;
}

import { OnModuleDestroy } from '@nestjs/common';
import { Cacheable } from 'cacheable';
import { HealthService } from './health.service';
export declare class NestjsCacheableService implements OnModuleDestroy {
    private readonly cache;
    private readonly healthService;
    private readonly logger;
    constructor(cache: Cacheable, healthService: HealthService);
    onModuleDestroy(): Promise<void>;
    get<T>(key: string): Promise<T | undefined>;
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    wrap<T, Arguments extends any[]>(fn: (...args: Arguments) => Promise<T>, options?: any): (...args: Arguments) => Promise<T>;
}

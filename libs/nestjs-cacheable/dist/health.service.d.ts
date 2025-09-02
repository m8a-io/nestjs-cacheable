import { Cacheable } from 'cacheable';
import { EventEmitter } from 'events';
export declare class HealthService extends EventEmitter {
    private readonly cache;
    private readonly logger;
    private isHealthy;
    constructor(cache: Cacheable);
    getHealth(): boolean;
}

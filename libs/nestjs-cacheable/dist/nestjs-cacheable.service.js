"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NestjsCacheableService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestjsCacheableService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("./constants");
const cacheable_1 = require("cacheable");
const health_service_1 = require("./health.service");
let NestjsCacheableService = NestjsCacheableService_1 = class NestjsCacheableService {
    cache;
    healthService;
    logger = new common_1.Logger(NestjsCacheableService_1.name);
    constructor(cache, healthService) {
        this.cache = cache;
        this.healthService = healthService;
    }
    async onModuleDestroy() {
        if (this.cache.secondary && typeof this.cache.secondary.disconnect === 'function') {
            await this.cache.secondary.disconnect();
        }
    }
    async get(key) {
        if (!this.healthService.getHealth()) {
            this.logger.warn('Cache is unhealthy, skipping get operation.');
            return undefined;
        }
        return this.cache.get(key);
    }
    async set(key, value, ttl) {
        if (!this.healthService.getHealth()) {
            this.logger.warn('Cache is unhealthy, skipping set operation.');
            return false;
        }
        if (ttl !== undefined) {
            await this.cache.set(key, value, ttl);
        }
        else {
            await this.cache.set(key, value);
        }
        return true;
    }
    async del(key) {
        if (!this.healthService.getHealth()) {
            this.logger.warn('Cache is unhealthy, skipping del operation.');
            return false;
        }
        return this.cache.delete(key);
    }
    wrap(fn, options) {
        return (...args) => {
            if (!this.healthService.getHealth()) {
                this.logger.warn('Cache is unhealthy, skipping wrap operation and calling function directly.');
                return fn(...args);
            }
            const wrappedFn = this.cache.wrap(fn, options);
            return wrappedFn(...args);
        };
    }
};
exports.NestjsCacheableService = NestjsCacheableService;
exports.NestjsCacheableService = NestjsCacheableService = NestjsCacheableService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.CACHEABLE)),
    __metadata("design:paramtypes", [cacheable_1.Cacheable,
        health_service_1.HealthService])
], NestjsCacheableService);

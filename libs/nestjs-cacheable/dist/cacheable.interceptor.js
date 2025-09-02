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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheableInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const nestjs_cacheable_service_1 = require("./nestjs-cacheable.service");
const core_1 = require("@nestjs/core");
const cache_ttl_decorator_1 = require("./cache-ttl.decorator");
let CacheableInterceptor = class CacheableInterceptor {
    cacheService;
    reflector;
    constructor(cacheService, reflector) {
        this.cacheService = cacheService;
        this.reflector = reflector;
    }
    async intercept(context, next) {
        const key = this.getCacheKey(context);
        const cachedValue = await this.cacheService.get(key);
        if (cachedValue) {
            return (0, rxjs_1.of)(cachedValue);
        }
        const ttl = this.reflector.get(cache_ttl_decorator_1.CACHE_TTL_KEY, context.getHandler());
        return next.handle().pipe((0, operators_1.tap)((value) => {
            this.cacheService.set(key, value, ttl);
        }));
    }
    getCacheKey(context) {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        return request.url;
    }
};
exports.CacheableInterceptor = CacheableInterceptor;
exports.CacheableInterceptor = CacheableInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_cacheable_service_1.NestjsCacheableService,
        core_1.Reflector])
], CacheableInterceptor);

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NestjsCacheableModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestjsCacheableModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_cacheable_service_1 = require("./nestjs-cacheable.service");
const constants_1 = require("./constants");
const cacheable_provider_1 = require("./cacheable.provider");
const health_service_1 = require("./health.service");
let NestjsCacheableModule = NestjsCacheableModule_1 = class NestjsCacheableModule {
    static register(options) {
        return {
            module: NestjsCacheableModule_1,
            providers: [
                {
                    provide: constants_1.CACHEABLE_OPTIONS,
                    useValue: options,
                },
                cacheable_provider_1.cacheableProvider,
                health_service_1.HealthService,
                nestjs_cacheable_service_1.NestjsCacheableService,
            ],
            exports: [health_service_1.HealthService, nestjs_cacheable_service_1.NestjsCacheableService],
        };
    }
    static registerAsync(options) {
        return {
            module: NestjsCacheableModule_1,
            imports: options.imports || [],
            providers: [
                ...this.createAsyncProviders(options),
                cacheable_provider_1.cacheableProvider,
                health_service_1.HealthService,
                nestjs_cacheable_service_1.NestjsCacheableService,
            ],
            exports: [health_service_1.HealthService, nestjs_cacheable_service_1.NestjsCacheableService],
        };
    }
    static createAsyncProviders(options) {
        if (options.useFactory) {
            return [
                {
                    provide: constants_1.CACHEABLE_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject || [],
                },
            ];
        }
        if (options.useClass) {
            return [
                {
                    provide: constants_1.CACHEABLE_OPTIONS,
                    useFactory: async (optionsFactory) => await optionsFactory.createCacheableOptions(),
                    inject: [options.useClass],
                },
                {
                    provide: options.useClass,
                    useClass: options.useClass,
                },
            ];
        }
        if (options.useExisting) {
            return [
                {
                    provide: constants_1.CACHEABLE_OPTIONS,
                    useFactory: async (optionsFactory) => await optionsFactory.createCacheableOptions(),
                    inject: [options.useExisting],
                },
            ];
        }
        return [];
    }
};
exports.NestjsCacheableModule = NestjsCacheableModule;
exports.NestjsCacheableModule = NestjsCacheableModule = NestjsCacheableModule_1 = __decorate([
    (0, common_1.Module)({})
], NestjsCacheableModule);

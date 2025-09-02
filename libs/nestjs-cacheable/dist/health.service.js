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
var HealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("./constants");
const cacheable_1 = require("cacheable");
const events_1 = require("events");
let HealthService = HealthService_1 = class HealthService extends events_1.EventEmitter {
    cache;
    logger = new common_1.Logger(HealthService_1.name);
    isHealthy = false;
    constructor(cache) {
        super();
        this.cache = cache;
        const secondaryStore = this.cache.secondary;
        if (secondaryStore && secondaryStore.store instanceof events_1.EventEmitter) {
            const redisClient = secondaryStore.store;
            redisClient.on('connect', () => {
                this.logger.log('Redis connection established');
                this.isHealthy = true;
                this.emit('health', true);
            });
            redisClient.on('error', (error) => {
                this.logger.error('Redis connection error', error);
                this.isHealthy = false;
                this.emit('health', false);
            });
            redisClient.on('reconnecting', () => {
                this.logger.log('Reconnecting to Redis...');
                this.isHealthy = false;
                this.emit('health', false);
            });
            redisClient.on('end', () => {
                this.logger.log('Redis connection closed');
                this.isHealthy = false;
                this.emit('health', false);
            });
        }
        else {
            this.isHealthy = true;
        }
    }
    getHealth() {
        return this.isHealthy;
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = HealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.CACHEABLE)),
    __metadata("design:paramtypes", [cacheable_1.Cacheable])
], HealthService);

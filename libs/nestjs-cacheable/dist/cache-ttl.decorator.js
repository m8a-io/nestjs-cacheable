"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheTTL = exports.CACHE_TTL_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.CACHE_TTL_KEY = 'cache_ttl';
const CacheTTL = (ttl) => (0, common_1.SetMetadata)(exports.CACHE_TTL_KEY, ttl);
exports.CacheTTL = CacheTTL;

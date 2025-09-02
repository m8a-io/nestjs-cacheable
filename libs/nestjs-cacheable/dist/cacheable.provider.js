"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheableProvider = void 0;
const cacheable_1 = require("cacheable");
const constants_1 = require("./constants");
exports.cacheableProvider = {
    provide: constants_1.CACHEABLE,
    useFactory: (options) => {
        return new cacheable_1.Cacheable(options);
    },
    inject: [constants_1.CACHEABLE_OPTIONS]
};

# Project To-Do List

This file tracks the remaining features and tasks for the `nestjs-cacheable` module.

## Core Features & Requirements

- [ ] **Terminus Health Check**: Implement and expose a `HealthIndicator` for Terminus integration.
- [ ] **Background Refresh**: Expose the `backgroundRefresh` feature from the `cacheable` library.
- [ ] **Cache Statistics**: Utilize the `stats` option from `cacheable` and expose the stats.
- [ ] **Configurable Logging**: Allow users to configure the logging strategy (e.g., pass in a custom logger instance).
- [ ] **Key Sanitization**: Implement sanitization for cache keys to prevent security vulnerabilities.
- [ ] **Observability and Metrics**: Implement the `MetricsService` and expose cache metrics (hits, misses, etc.) in a Prometheus-compatible format.

## Expose Full `cacheable` API

- [ ] `setMany([{key, value, ttl?}])`
- [ ] `get(key, { raw: true })`
- [ ] `getMany([keys])`
- [ ] `getMany([keys], { raw: true })`
- [ ] `has(key)`
- [ ] `hasMany([keys])`
- [ ] `take(key)`
- [ ] `takeMany([keys])`
- [ ] `deleteMany([keys])`
- [ ] `clear()`
- [ ] `getOrSet(GetOrSetKey, valueFunction, GetOrSetFunctionOptions)`
- [ ] `onHook(hook, callback)`
- [ ] `removeHook(hook)`
- [ ] `on(event, callback)`
- [ ] `removeListener(event, callback)`
- [ ] `hash(object: any, algorithm = 'sha256'): string`
- [ ] `namespace` getter/setter
- [ ] `nonBlocking` getter/setter
- [ ] `stats` getter

## Polish & New Features

- [ ] **Custom `@Cacheable()` Decorator**: Create a single, ergonomic decorator that combines the functionality of `@UseInterceptors(CacheableInterceptor)` and `@CacheTTL()`.
- [ ] **Configurable Key Generation**: Allow developers to define custom strategies for generating cache keys within the interceptor.
- [ ] **Configurable Key Prefixing**: Implement global and per-method key prefixing to prevent key collisions.
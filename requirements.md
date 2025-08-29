# cacheable NestJS Module Requirements Document

## 1. Dynamic Module Configuration (register and registerAsync)

The module must support both **register** for synchronous, static configuration and **registerAsync** for asynchronous configuration. The `registerAsync` method should support a `useFactory` to allow for dependency injection. The module should accept an options object that aligns with cacheable's multi-tier architecture, allowing configuration of Layer 1 (in-memory) and Layer 2 (e.g., Redis) stores.

## 2. Connectivity Protection and Fault Tolerance

- The module must gracefully handle scenarios where the Layer 2 cache (e.g., Redis) is unavailable.
- **Connectivity protection can be done without `@nestjs/terminus`** by leveraging the event-driven nature of Node.js Redis clients (e.g., `ioredis`). You should listen for the following events:
    - **connect**: Emitted when the client successfully connects to the Redis server.
    - **error**: Emitted when any connection error occurs. This is the most important event to listen for.
    - **reconnecting**: Emitted when the client attempts to reconnect after a connection loss.
    - **end**: Emitted when the connection is closed.
- The service should maintain an internal **"healthy" state flag**. On an error event, set the flag to `false` and log the error. On a connect event, set it back to `true`.
- When performing a Redis operation, check the flag. If the flag is `false`, skip the Redis operation and proceed with a fallback (e.g., fetching data from the database), logging that the cache is offline. This ensures the application remains responsive even if the Redis connection is lost.
- It should also implement a **health check** that can be exposed via the `@nestjs/terminus` package, allowing Kubernetes or other monitoring systems to check the connection status of the Redis instance.

## 3. Feature Parity with @nestjs/cache-manager

The module should expose an injectable service that supports core caching methods: `get`, `set`, `del`, and `wrap`. It must also integrate with NestJS interceptors to enable declarative caching using decorators like `@UseInterceptors(CacheableInterceptor)`. The module should allow for per-method or per-controller Time-to-Live (TTL) overrides.

## 4. Testing

Comprehensive **unit tests** for all services and providers are required. **Integration tests** must verify that the `register` and `registerAsync` methods work. End-to-end tests should prove that the caching interceptor correctly caches and retrieves data from both Layer 1 and Layer 2. Failure scenarios, such as the Layer 2 cache being unavailable, must also be tested.

## 5. Observability and Metrics

The module should expose key metrics for monitoring cache performance. These metrics should be in a format consumable by tools like Prometheus and Grafana.

| Metric Name                 | Description                                             |
| :-------------------------: | :-------------------------------------------------------: |
| **cache\_hits**             | Total number of times an item was found in the cache.   |
| **cache\_misses**           | Total number of times an item was not found in the cache. |
| **cache\_hit\_rate**        | A gauge or ratio of hits to total requests.             |
| **cache\_evictions**        | Total number of items removed from the cache.           |
| **cache\_latency\_seconds** | A histogram of time taken for cache operations.         |
| **cache\_size**             | The current number of items in the cache.               |
| **cache\_memory\_bytes**    | The memory used by the in-memory cache.                 |

## 6. Additional Requirements

-   **Type Safety**: A strongly-typed API using TypeScript generics is a must.
-   **Tiered Caching Configuration**: The API should make it easy to configure Layer 1 and Layer 2 stores.
-   **Logging**: A configurable logging strategy is required for debugging in development and for production environments.
-   **Background Refresh**: The module should expose a clear way to enable the cacheable library's background refresh feature to prevent stale data.
-   **Decorator Support**: Custom NestJS decorators like `@Cacheable()` should be considered for declarative caching.
-   **Security**: Ensure proper sanitation of cache keys and avoid storing sensitive data without encryption.


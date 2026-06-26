const { getRedis } = require('../config/redis');

/**
 * API Response Caching Middleware
 *
 * Caches GET responses in Redis to reduce database load.
 * Skip cache by passing `x-cache-bypass: true` header.
 * Cache keys are auto-invalidated by related mutation events.
 *
 * Usage:
 *   router.get('/', cache(300), controller.list);  // 5 min TTL
 *   router.get('/stats', cache(60, 'stats'), controller.getStats); // named cache
 */
const cache = (ttlSeconds = 300, keyPrefix = 'api') => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    // Allow bypass with header
    if (req.headers['x-cache-bypass'] === 'true') return next();

    const redis = getRedis();
    if (!redis || redis.status !== 'ready') return next();

    // Normalize query parameter ordering for consistent cache keys
    // /users?page=1&limit=10 and /users?limit=10&page=1 produce the same key
    const url = new URL(req.originalUrl, 'http://localhost');
    url.searchParams.sort();
    const normalizedUrl = url.pathname + url.search;
    const cacheKey = `${keyPrefix}:${normalizedUrl}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(parsed);
      }
    } catch (err) {
      // Cache miss or error — continue without caching
    }

    // Store original .json to intercept the response
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis.setex(cacheKey, ttlSeconds, JSON.stringify(body)).catch(() => {});
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
};

/**
 * Invalidate cache entries matching a pattern
 * Call this from mutation endpoints (POST, PUT, PATCH, DELETE)
 *
 * Usage:
 *   await invalidateCache('api:/bookings*');
 *   await invalidateCache('api:/dashboard*');
 */
const invalidateCache = async (pattern) => {
  const redis = getRedis();
  if (!redis || redis.status !== 'ready') return;

  try {
    let cursor = '0';
    do {
      const result = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } while (cursor !== '0');
  } catch (err) {
    console.error('Cache invalidation error:', err.message);
  }
};

module.exports = { cache, invalidateCache };

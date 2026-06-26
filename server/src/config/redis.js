const Redis = require('ioredis');
const config = require('./env');

let redisClient = null;

const initializeRedis = () => {
  if (redisClient) return redisClient;

  try {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      console.log('Redis connected');
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err.message);
    });

    return redisClient;
  } catch (error) {
    console.error('Redis initialization failed:', error.message);
    return null;
  }
};

const getRedis = () => redisClient;

module.exports = { initializeRedis, getRedis };

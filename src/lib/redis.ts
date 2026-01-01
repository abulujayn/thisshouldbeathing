import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('REDIS_URL environment variable is not defined');
}

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

let isConnected = false;

export async function getRedisClient() {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
  }
  return redisClient;
}

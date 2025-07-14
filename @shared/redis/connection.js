const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        return new Error('Max retries reached');
      }
      return Math.min(retries * 100, 3000); // Exponential backoff
    },
  },
//   password: process.env.REDIS_PASSWORD || '',
  legacyMode: true, // Use legacy mode for compatibility
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});
client.on('connect', () => {
  console.log('Connected to Redis');
});
client.on('reconnecting', () => {
  console.log('Reconnecting to Redis...');
});

client.connect();

module.exports = client;
// Redis has been removed for development simplicity.
// The app uses in-memory locking instead.

console.log('ℹ️  Running without Redis (development mode)');

const redisClient = null;
const isRedisAvailable = false;

export { isRedisAvailable };
export default redisClient;

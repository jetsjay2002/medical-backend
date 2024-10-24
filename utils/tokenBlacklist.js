// // tokenBlacklist.js

// // utils/tokenBlacklist.js
// const redis = require('redis');
// const client = redis.createClient();

// client.on('error', (err) => {
//     console.error('Redis error:', err);
// });

// const addToken = (token, expiry = 3600) => {
//     client.set(token, 'blacklisted', 'EX', expiry);
// };

// const isBlacklisted = async (token) => {
//     return new Promise((resolve, reject) => {
//         client.get(token, (err, result) => {
//             if (err) return reject(err);
//             resolve(result === 'blacklisted');
//         });
//     });
// };

// module.exports = { addToken, isBlacklisted };



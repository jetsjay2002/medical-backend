// const crypto = require('crypto');
// const key = crypto.randomBytes(32).toString('base64');
// console.log(key);

// const token = jwt.sign({ username: user.username, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });


const crypto = require('crypto');

// Generate a random 32-byte key (256-bit)
const secretKey = crypto.randomBytes(32).toString('hex');

console.log(secretKey);
// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

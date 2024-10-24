// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//     connectionString: process.env.POSTGRESQL_ADDON_URI,
//     ssl: {
//         rejectUnauthorized: false
//     }
// });

// pool.on('connect', () => {
//     console.log('Connected to the PostgreSQL database');
// });


// module.exports = pool;


// // const { Pool } = require('pg');
// // require('dotenv').config();

// // const pool = new Pool({
// //   user: 'uo7xs5twhhyanncnv3zd',
// //   host: 'b9zvih66lsxk1knuazla-postgresql.services.clever-cloud.com',
// //   database: 'b9zvih66lsxk1knuazla',
// //   password: 'uo7xs5twhhyanncnv3zd',
// //   port: '50013',
// // });

// // module.exports = pool;


const { Pool } = require('pg');
require('dotenv').config();

// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'test3',
//     password: 'zxcjaja0123',
//     port: 5453,
// });

const pool = new Pool({
    connectionString: process.env.POSTGRESQL_ADDON_URI,
    ssl: {
        rejectUnauthorized: false
    }
});

// const pool = new Pool({
//     user: 'uxvmtdtxhhaifzszi3lr',
//     host: 'b6y2vysnprwihogpvddi-postgresql.services.clever-cloud.com',
//     database: 'b6y2vysnprwihogpvddi',
//     password: 'b6y2vysnprwihogpvddi',
//     port: '50013',
//   });

pool.connect().catch(err => console.error('Connection error', err.stack));

pool.connect()
    .then(() => console.log('Connected to the database'))
    .catch(err => console.error('Database connection error', err));
    

module.exports = pool;


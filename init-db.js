// Simple script to initialize the database
require('dotenv').config({ path: '.env.local' });
const { ensureDatabaseInitialized } = require('./src/lib/db/init-db');

ensureDatabaseInitialized()
  .then(() => {
    console.log('Database initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error initializing database:', error);
    process.exit(1);
  });

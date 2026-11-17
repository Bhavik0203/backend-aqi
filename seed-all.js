const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { seedAll } = require('./utils/seedAll');

(async () => {
  try {
    const result = await seedAll();
    console.log('Result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Fatal Seed Error:', err);
    process.exit(1);
  }
})();

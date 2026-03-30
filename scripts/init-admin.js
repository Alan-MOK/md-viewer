require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const bcrypt = require('bcrypt');
const { initDb, dbGet, dbRun } = require('../db');

const USERNAME = 'admin';
const PASSWORD = 'admin1234';

initDb().then(() => {
  const existing = dbGet('SELECT id FROM admins WHERE username = ?', [USERNAME]);
  if (existing) {
    console.log(`Admin account "${USERNAME}" already exists. Skipping.`);
    process.exit(0);
  }

  const hash = bcrypt.hashSync(PASSWORD, 12);
  dbRun('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [USERNAME, hash]);

  console.log('Admin account created successfully.');
  console.log(`  Username: ${USERNAME}`);
  console.log(`  Password: ${PASSWORD}`);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

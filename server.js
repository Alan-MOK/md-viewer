require('dotenv').config();

const express = require('express');
const path = require('path');
const { initDb } = require('./db');

const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3007;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/docs', adminRoutes);

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

// Initialize DB first, then start listening
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`md-viewer running at http://localhost:${PORT}`);
      console.log(`Admin panel: http://localhost:${PORT}/admin`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

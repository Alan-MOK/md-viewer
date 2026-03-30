const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../db');
const authMiddleware = require('../middleware/auth');
const { generateSlug } = require('../utils/slug');

router.use(authMiddleware);

// List all documents (no content, sorted by updated_at)
router.get('/', (req, res) => {
  const docs = dbAll(
    'SELECT id, slug, title, created_at, updated_at FROM documents ORDER BY updated_at DESC'
  );
  res.json(docs);
});

// Get single document with content
router.get('/:id', (req, res) => {
  const doc = dbGet('SELECT * FROM documents WHERE id = ?', [req.params.id]);
  if (!doc) return res.status(404).json({ error: 'Document not found.' });
  res.json(doc);
});

// Create document
router.post('/', (req, res) => {
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required.' });

  let slug = generateSlug(title);

  // Ensure slug uniqueness
  let conflict = dbGet('SELECT id FROM documents WHERE slug = ?', [slug]);
  let i = 2;
  while (conflict) {
    const candidate = `${slug}-${i++}`;
    conflict = dbGet('SELECT id FROM documents WHERE slug = ?', [candidate]);
    if (!conflict) slug = candidate;
  }

  const { lastInsertRowid } = dbRun(
    'INSERT INTO documents (slug, title, content) VALUES (?, ?, ?)',
    [slug, title, content || '']
  );

  res.status(201).json({ id: lastInsertRowid, slug });
});

// Update document — slug is never modified
router.put('/:id', (req, res) => {
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required.' });

  const doc = dbGet('SELECT id FROM documents WHERE id = ?', [req.params.id]);
  if (!doc) return res.status(404).json({ error: 'Document not found.' });

  dbRun(
    "UPDATE documents SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?",
    [title, content ?? '', req.params.id]
  );

  res.json({ success: true });
});

// Delete document
router.delete('/:id', (req, res) => {
  const doc = dbGet('SELECT id FROM documents WHERE id = ?', [req.params.id]);
  if (!doc) return res.status(404).json({ error: 'Document not found.' });

  dbRun('DELETE FROM documents WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;

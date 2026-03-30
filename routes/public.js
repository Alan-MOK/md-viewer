const express = require('express');
const router = express.Router();
const { marked } = require('marked');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const fs = require('fs');
const path = require('path');
const { dbGet } = require('../db');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

marked.setOptions({ gfm: true, breaks: false });

const templatePath = path.join(__dirname, '../views/document.html');

router.get('/docs/:slug', (req, res) => {
  const doc = dbGet('SELECT * FROM documents WHERE slug = ?', [req.params.slug]);
  if (!doc) {
    return res.status(404).send(`<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>404 - 页面不存在</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5;}
.box{text-align:center;color:#666;}.box h1{font-size:4rem;margin:0;color:#ccc;}.box p{margin:.5rem 0;}</style>
</head><body><div class="box"><h1>404</h1><p>文档不存在</p></div></body></html>`);
  }

  const rawHtml = marked.parse(doc.content);
  const cleanHtml = DOMPurify.sanitize(rawHtml);

  const template = fs.readFileSync(templatePath, 'utf-8');
  const createdAt = new Date(doc.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const updatedAt = new Date(doc.updated_at).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = template
    .replace(/\{\{TITLE\}\}/g, escapeHtml(doc.title))
    .replace('{{CONTENT}}', cleanHtml)
    .replace('{{CREATED_AT}}', createdAt)
    .replace('{{UPDATED_AT}}', updatedAt);

  res.send(html);
});

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = router;

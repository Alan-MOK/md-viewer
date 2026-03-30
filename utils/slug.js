const { slugify } = require('transliteration');

function generateSlug(title) {
  const slug = slugify(title, {
    separator: '-',
    lowercase: true,
    trim: true,
  });
  return slug || 'doc-' + Date.now();
}

module.exports = { generateSlug };

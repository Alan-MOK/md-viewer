const { marked } = require('marked');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const md = `# 标题\n\n这是**粗体**，这是*斜体*。\n\n- 列表项1\n- 列表项2\n\n\`代码\`\n`;

const raw = marked.parse(md);
const clean = DOMPurify.sanitize(raw);

console.log('RAW:\n', raw);
console.log('CLEAN:\n', clean);

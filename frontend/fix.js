import fs from 'fs';
import path from 'path';

function getFiles(dir) {
  const subdirs = fs.readdirSync(dir);
  const files = subdirs.map((subdir) => {
    const res = path.resolve(dir, subdir);
    return fs.statSync(res).isDirectory() ? getFiles(res) : res;
  });
  return files.reduce((a, f) => a.concat(f), []);
}

const files = getFiles('src').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('catch (error: any)')) {
    content = content.replace(/catch \(error: any\)/g, 'catch (error)');
    changed = true;
  }

  const asyncArrowRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*async\s*\(\)\s*=>\s*\{/g;
  if (asyncArrowRegex.test(content)) {
    content = content.replace(asyncArrowRegex, 'async function $1() {');
    changed = true;
  }

  const asyncArrowWithArgsRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*async\s*\(([^)]+)\)\s*=>\s*\{/g;
  if (asyncArrowWithArgsRegex.test(content)) {
    content = content.replace(asyncArrowWithArgsRegex, 'async function $1($2) {');
    changed = true;
  }
  
  // also regular functions used before declared like handleAddSkill
  const arrowRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*\(\)\s*=>\s*\{/g;
  if (arrowRegex.test(content)) {
    content = content.replace(arrowRegex, 'function $1() {');
    changed = true;
  }

  const emptyInterfaceRegex = /export\s+interface\s+[a-zA-Z0-9_]+\s*\{\s*\}/g;
  if (emptyInterfaceRegex.test(content)) {
    content = content.replace(/(export\s+interface\s+[a-zA-Z0-9_]+\s*)\{\s*\}/g, '$1{ [key: string]: unknown }');
    changed = true;
  }
  
  const emptyImportRegex = /import\s*\{\s*\}\s*from\s*['"][^'"]+['"];?\n?/g;
  if (emptyImportRegex.test(content)) {
    content = content.replace(emptyImportRegex, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

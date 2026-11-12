import { copyFile, mkdir } from 'node:fs/promises';
import { firms } from '../src/presets.js';
const files = ['index.html', 'styles.css', 'favicon.svg', 'src/app.js', 'src/calculator.js', 'src/presets.js', 'src/state.js', ...firms.filter(f => f.icon).map(f => f.icon.slice(1))];
await mkdir('dist/src', { recursive: true });
await mkdir('dist/assets/firms', { recursive: true });
for (const file of files) await copyFile(file, `dist/${file}`);
console.log(`Built ${files.length} files in dist/. No external runtime dependencies.`);

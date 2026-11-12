import { copyFile, mkdir } from 'node:fs/promises';
const files = ['index.html', 'styles.css', 'favicon.svg', 'src/app.js', 'src/calculator.js', 'src/presets.js'];
await mkdir('dist/src', { recursive: true });
for (const file of files) await copyFile(file, `dist/${file}`);
console.log(`Built ${files.length} files in dist/. No external runtime dependencies.`);

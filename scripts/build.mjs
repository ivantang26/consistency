import { copyFile, mkdir } from 'node:fs/promises';
const files = ['index.html', 'styles.css', 'favicon.svg', 'src/app.js', 'src/calculator.js', 'src/presets.js', 'src/state.js', 'assets/firms/tradeify.png', 'assets/firms/topstep.png', 'assets/firms/mffu.png', 'assets/firms/ftmo.png'];
await mkdir('dist/src', { recursive: true });
await mkdir('dist/assets/firms', { recursive: true });
for (const file of files) await copyFile(file, `dist/${file}`);
console.log(`Built ${files.length} files in dist/. No external runtime dependencies.`);

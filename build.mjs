// Inline three.min.js into the template to produce a single self-contained HTML file.
import { readFileSync, writeFileSync } from 'fs';
const three = readFileSync(new URL('./node_modules/three/build/three.min.js', import.meta.url), 'utf8');
const tpl = readFileSync(new URL('./template.html', import.meta.url), 'utf8');
writeFileSync(new URL('./mockup-studio.html', import.meta.url), tpl.replace('/*__THREE_JS__*/', () => three));
console.log('built mockup-studio.html');

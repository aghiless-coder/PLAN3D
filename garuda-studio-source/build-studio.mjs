import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url)),destination=process.argv[2]?path.resolve(process.argv[2]):path.resolve(dir,'../outputs/GARUDA-Studio.html');
const read=f=>fs.readFile(path.join(dir,f),'utf8');
const [html,core,renderer,app]=await Promise.all(['studio.html','studio-core.mjs','studio-renderer.mjs','studio-app.js'].map(read));
const result=html.replace('__CORE__',()=>core.replace(/^export /gm,'')).replace('__RENDERER__',()=>renderer.replace(/^export /gm,'')).replace('__APP__',()=>app);
await fs.mkdir(path.dirname(destination),{recursive:true});
await fs.writeFile(destination,result);
console.log('GARUDA Studio : aperçu autonome généré.');


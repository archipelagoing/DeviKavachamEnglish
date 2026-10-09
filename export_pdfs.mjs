// Print both fixed-page editions with installed Chrome. No npm dependencies.
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const editions = JSON.parse(process.argv[2]);
const candidates = [process.env.DEVI_CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA,'Google/Chrome/Application/chrome.exe'), process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES,'Google/Chrome/Application/chrome.exe')].filter(Boolean);
let executable;
for (const candidate of candidates) { try { await fs.access(candidate); executable=candidate;break; } catch {} }
if (!executable) throw new Error('Chrome not found. Set DEVI_CHROME_PATH to its executable. EPUB and print HTML exports are already available.');
const profile = await fs.mkdtemp(path.join(os.tmpdir(),'devi-pdf-'));
const child = spawn(executable,['--headless','--remote-debugging-port=0',`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check','--disable-background-networking','about:blank'],{stdio:'ignore'});
child.on('error',error=>console.error(error.message));
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let socket;
try {
  let port;
  for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{} if(child.exitCode!==null)throw new Error('Chrome exited before starting PDF export.');await delay(100);}
  if(!port)throw new Error('Chrome did not start within ten seconds.');
  const tabs=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket=new WebSocket(tabs.find(tab=>tab.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  let serial=0;const pending=new Map();
  socket.addEventListener('message',event=>{const data=JSON.parse(event.data);if(data.id){const entry=pending.get(data.id);if(entry){pending.delete(data.id);clearTimeout(entry.timer);data.error?entry.reject(new Error(data.error.message)):entry.resolve(data.result);}}});
  const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;const timer=setTimeout(()=>reject(new Error(`Timeout: ${method}`)),30000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}));});
  await call('Page.enable');
  for(const edition of editions){
    await call('Page.navigate',{url:pathToFileURL(edition.html).href});
    let ready=false;
    for(let i=0;i<100;i++){const r=await call('Runtime.evaluate',{expression:'document.readyState === "complete" && typeof window.fitPages === "function"',returnByValue:true});if(r.result.value){ready=true;break;}await delay(50);}
    if(!ready)throw new Error('Print document did not load.');
    const fitted=await call('Runtime.evaluate',{expression:'document.fonts.ready.then(()=>window.fitPages())',returnByValue:true,awaitPromise:true});
    if(fitted.exceptionDetails)throw new Error(fitted.exceptionDetails.exception?.description || 'Print layout overflow.');
    const result=await call('Page.printToPDF',{printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false,generateTaggedPDF:true,generateDocumentOutline:true});
    const pdf=Buffer.from(result.data,'base64');
    const pages=[...pdf.toString('latin1').matchAll(/\/Type\s*\/Page\b/g)].length;
    if(pages!==edition.pages)throw new Error(`Expected ${edition.pages} pages in ${edition.pdf}, got ${pages}.`);
    await fs.writeFile(edition.pdf,pdf);
    console.log(`${path.basename(edition.pdf)}: ${pages} pages; verse groups ${edition.verses_per_page}; font sizes ${fitted.result.value.join(', ')} pt.`);
  }
  await call('Browser.close').catch(()=>{});
} finally {
  if(socket)socket.close();
  if(child.exitCode===null)child.kill('SIGTERM');
  await new Promise(resolve=>{if(child.exitCode!==null)return resolve();child.once('exit',resolve);setTimeout(resolve,2000);});
  // Only this script's disposable browser profile is removed.
  await fs.rm(profile,{recursive:true,force:true,maxRetries:3}).catch(()=>{});
}

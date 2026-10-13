// Browser regression checks using installed Chrome and Node 22+, without npm.
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prefix = '/DeviKavachamEnglish/';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.epub': 'application/epub+zip', '.xml': 'application/xml' };
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!pathname.startsWith(prefix)) { res.writeHead(404).end(); return; }
    const filename = path.resolve(root, pathname.slice(prefix.length) || 'index.html');
    if (!filename.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const data = await fs.readFile(filename);
    res.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream' }).end(data);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = process.argv.includes('--live') ? 'https://archipelagoing.github.io/DeviKavachamEnglish/' : `http://127.0.0.1:${server.address().port}${prefix}`;
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'devi-reader-check-'));
const executable = process.env.DEVI_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = spawn(executable, ['--headless', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', 'about:blank'], { stdio: 'ignore' });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
try {
  let port;
  for (let i = 0; i < 100; i++) {
    try { port = Number((await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break; } catch {}
    if (browser.exitCode !== null) throw new Error('Chrome exited before starting.');
    await delay(100);
  }
  assert(port, 'Chrome did not start within ten seconds.');
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let serial = 0;
  const pending = new Map(), errors = [];
  socket.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text);
    if (data.id && pending.has(data.id)) {
      const entry = pending.get(data.id); pending.delete(data.id); clearTimeout(entry.timer);
      data.error ? entry.reject(new Error(data.error.message)) : entry.resolve(data.result);
    }
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++serial, timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 20000);
    pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const until = async (expression, label) => {
    for (let i = 0; i < 150; i++) { if (await evaluate(expression)) return; await delay(100); }
    throw new Error(`Not ready: ${label}`);
  };
  const navigate = async page => {
    await call('Page.navigate', { url: base + page });
    await until(`location.href === ${JSON.stringify(base + page)} && document.readyState === 'complete'`, page);
    if (page.startsWith('index') || page.startsWith('reader-view')) {
      await delay(400);
      await until(`!document.querySelector('#reading-notice')?.hidden || (document.querySelector('#epub-area')?.dataset.fittedSize && document.querySelectorAll('#epub-area iframe').length > 0 && [...document.querySelectorAll('#epub-area iframe')].every(f => f.contentDocument?.querySelector('pre')) && [...document.querySelectorAll('.book-leaf')].every(leaf => leaf.style.visibility !== 'hidden'))`, 'readable text or fitted EPUB');
    }
  };
  await call('Page.enable'); await call('Runtime.enable');
  const seed = await call('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('devi-reader-view-preferences', JSON.stringify({appearance:'dark'}));` });
  const snapshot = `(() => {
    const css = el => el && getComputedStyle(el);
    const frames = [...document.querySelectorAll('#epub-area iframe')];
    return { page:location.pathname, width:innerWidth, overflow:document.documentElement.scrollWidth > innerWidth,
      appearance:document.documentElement.dataset.appearance, body:css(document.body).backgroundColor,
      fitted:document.querySelector('#epub-area')?.dataset.fittedSize,
      control:!!document.querySelector('#appearance-settings'),
      verses:frames.map(f => ({ink:css(f.contentDocument.querySelector('.verse'))?.color, tone:f.contentDocument.querySelector('.verse')?.dataset.tone, background:css(f.contentDocument.body)?.backgroundColor})) };
  })()`;
  if (process.argv.includes('--spread')) {
    await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const edition of ['index.html', 'reader-view.html']) {
      await navigate(`${edition}#page-1`);
      const state = await evaluate(`(() => {
        const area=document.querySelector('#epub-area');
        return {fold:getComputedStyle(area,'::after').backgroundImage,frames:[...area.querySelectorAll('iframe')].map(f=>{
          const d=f.contentDocument,p=d.querySelector('pre');
          return {html:getComputedStyle(d.documentElement).backgroundColor,body:getComputedStyle(d.body).backgroundColor,pre:getComputedStyle(p).backgroundColor,iframe:getComputedStyle(f).backgroundColor,ink:getComputedStyle(p.querySelector('.verse')).color};
        })};
      })()`);
      console.log(JSON.stringify({edition,...state}));
      if (!process.argv.includes('--live')) {
        assert(state.fold.includes('linear-gradient') && state.fold.includes('0.85'), 'dark fold has a visible central shadow');
        assert(state.frames.every(f=>f.html==='rgb(51, 51, 51)' && f.body==='rgb(51, 51, 51)' && f.pre==='rgb(51, 51, 51)'), 'all rendered text surfaces are explicitly dark');
        assert(await evaluate(`document.querySelector('script[src*="reader.js"]').src.includes('?v=') && document.querySelector('link[href*="appearance.css"]').href.includes('?v=')`), 'changed reader assets have versioned URLs');
      }
      const shot=await call('Page.captureScreenshot',{format:'png'});
      await fs.writeFile(`/private/tmp/devi-spread-${edition}.png`,Buffer.from(shot.data,'base64'));
    }
  } else if (process.argv.includes('--inspect')) {
    await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await call('Emulation.setTouchEmulationEnabled', { enabled: true });
    for (const page of ['index.html#verse-21', 'reader-view.html#verse-21', 'contents.html', 'about.html']) { await navigate(page); console.log(JSON.stringify(await evaluate(snapshot))); }
  } else if (process.argv.includes('--contents')) {
    for (const width of [320, 390, 900, 1280]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: width < 900 });
      await call('Emulation.setTouchEmulationEnabled', { enabled: width < 900 });
      await navigate('contents.html');
      assert.equal(await evaluate(`document.querySelectorAll('.theme-detail').length`), 11);
      assert.equal(await evaluate(`document.querySelectorAll('.deity-card').length`), 9);
      await evaluate(`document.querySelector('#theme-navadurga summary').focus()`);
      await call('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
      await call('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
      assert(await evaluate(`document.querySelector('#theme-navadurga').open && location.pathname.endsWith('/contents.html')`), 'keyboard expands without leaving Contents');
      await evaluate(`document.querySelectorAll('.theme-detail').forEach(d=>d.open=true)`);
      for (const palette of ['dark', 'sepia']) {
        await evaluate(`document.querySelector('input[name="appearance"][value="${palette}"]').click()`);
        assert(!await evaluate(`document.documentElement.scrollWidth > innerWidth`), `${width}px ${palette}: expanded guide overflows`);
        assert(await evaluate(`document.querySelectorAll('.theme-jump').length === 11 && [...document.querySelectorAll('.theme-jump')].every(a => a.getBoundingClientRect().height >=44)`), 'all sections have touch-sized jump links');
      }
      for (let index = 0; index < 9; index++) {
        await evaluate(`document.querySelectorAll('.deity-card img')[${index}].scrollIntoView({block:'center'})`);
        await until(`document.querySelectorAll('.deity-card img')[${index}].complete && document.querySelectorAll('.deity-card img')[${index}].naturalWidth > 0`, 'local deity image');
      }
      assert(await evaluate(`[...document.querySelectorAll('.deity-card')].every(card => card.querySelector('figcaption a[href*="commons.wikimedia.org"]') && card.querySelector('figcaption a[href*="creativecommons.org"]') && card.querySelector('a[href*="en.wikipedia.org/wiki/"]') && card.querySelector('a[data-read]'))`), 'all nine cards have credit, license, Wikipedia, and verse links');
      assert(await evaluate(`document.querySelector('#kushmanda a[data-read]').hash === '#verse-3' && document.querySelectorAll('#kushmanda a[data-read]').length===1 && document.querySelectorAll('#kalaratri a[data-read]').length===2`), 'entity links distinguish named forms from spirits');
      await evaluate(`document.querySelector('#theme-navadurga summary').scrollIntoView({block:'start'})`);
      const shot = await call('Page.captureScreenshot', { format: 'png' });
      await fs.writeFile(`/private/tmp/devi-contents-${width}.png`, Buffer.from(shot.data, 'base64'));
      console.log(`PASS ${width}px Contents: keyboard expansion, all themes, nine local images, credits, verse links, dark/sepia layout`);
    }
    await navigate('contents.html#shailaputri');
    assert(await evaluate(`document.querySelector('#theme-navadurga').open`), 'direct deity link opens its containing theme');
    for (const edition of ['index.html', 'reader-view.html']) {
      await evaluate(`sessionStorage.setItem('devi-reading-edition', '${edition}')`);
      await navigate('contents.html#siddhidatri');
      const expected = await evaluate(`document.querySelector('#siddhidatri a[data-read]').getAttribute('href')`);
      assert.equal(expected, `${edition}#verse-5`);
      await evaluate(`document.querySelector('#siddhidatri a[data-read]').click()`);
      await until(`location.pathname.endsWith('/${edition}') && location.hash==='#verse-5' && document.querySelector('#epub-area')?.dataset.fittedSize`, 'exact verse opens from deity');
      console.log(`PASS deity-to-verse navigation in ${edition}`);
    }
    await call('Emulation.setScriptExecutionDisabled', { value: true });
    await call('Page.navigate', { url: base + 'contents.html' });
    await until(`location.pathname.endsWith('/contents.html') && document.readyState === 'complete' && document.querySelectorAll('.theme-detail').length===11`, 'guide without JavaScript');
    await evaluate(`document.querySelector('#theme-navadurga summary').focus()`);
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
    assert(await evaluate(`document.querySelector('#theme-navadurga').open && document.querySelector('#siddhidatri a[data-read]').getAttribute('href')==='index.html#verse-5'`), 'native expansion and links work without JavaScript');
    await call('Emulation.setScriptExecutionDisabled', { value: false });
    console.log('PASS direct deity links and JavaScript-disabled expansion');
  } else {
    await navigate('index.html#verse-21');
    await call('Page.removeScriptToEvaluateOnNewDocument', { identifier: seed.identifier });
    const color = async value => {
      await evaluate(`document.querySelector('input[name="appearance"][value="${value}"]').click()`);
      await until(`document.documentElement.dataset.appearance === '${value}'`, 'palette change');
      await delay(150);
    };
    for (const [width, height] of [[320, 568], [390, 844], [844, 390], [900, 700], [1280, 800]]) {
      const mobile = width < 900;
      await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
      await call('Emulation.setTouchEmulationEnabled', { enabled: mobile });
      for (const page of ['index.html#verse-21', 'reader-view.html#verse-21', 'contents.html', 'about.html']) {
        await navigate(page);
        const state = await evaluate(snapshot);
        assert(!state.overflow, `${page} overflows at ${width}×${height}`);
        assert(state.control, `${page} needs an appearance control`);
        if (!state.verses.length && page.includes('#verse-')) {
          assert(await evaluate(`!document.querySelector('#html-reader').hidden && document.querySelectorAll('#html-reader .verse').length===56 && parseFloat(getComputedStyle(document.querySelector('#html-reader pre')).fontSize)>=14`), 'small-screen fallback contains readable complete text');
        }
        for (const palette of ['light', 'sepia', 'dark']) {
          await color(palette);
          const actual = await evaluate(snapshot);
          assert.equal(actual.appearance, palette);
          if (state.verses.length) {
            assert(actual.verses.every(v => v.background === ({dark:'rgb(51, 51, 51)',light:'rgb(255, 255, 255)',sepia:'rgb(244, 236, 216)'})[palette]), `${page}: EPUB reading surface doesn't follow ${palette}`);
            assert(actual.verses.every(v => v.ink === (v.tone === 'even' ? palette === 'dark' ? 'rgb(158, 211, 180)' : 'rgb(36, 92, 69)' : palette === 'dark' ? 'rgb(238, 238, 238)' : 'rgb(33, 30, 24)')), `${page}: EPUB ink doesn't follow ${palette}`);
            const fit = await evaluate(`(() => [...document.querySelectorAll('#epub-area iframe')].map(f => {
              const p=f.contentDocument.querySelector('pre'), panel=f.closest('.book-leaf-body');
              return {verses:p.querySelectorAll('.verse').length, height:p.getBoundingClientRect().height, available:panel.clientHeight, size:parseFloat(getComputedStyle(p).fontSize)};
            }))()`);
            assert.equal(fit.length, mobile ? 1 : 2);
            assert(fit.every(f => f.verses === 7 && f.height <= f.available), `${page}: verses clipped at ${width}×${height}: ${JSON.stringify(fit)}`);
          }
        }
        await evaluate(`document.querySelector('#appearance-settings').open=true`);
        await delay(100);
        const panel = await evaluate(`(() => { const r=document.querySelector('.appearance-panel').getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom,top:r.top}; })()`);
        assert(panel.left >= 0 && panel.right <= width && panel.bottom <= height, `${page}: appearance panel outside ${width}×${height}: ${JSON.stringify(panel)}`);
        await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        assert(await evaluate(`!document.querySelector('#appearance-settings').open && document.activeElement === document.querySelector('#appearance-settings summary')`), 'Escape closes settings and restores focus');
        console.log(`PASS ${width}×${height} ${page}: palettes, layout, settings, focus`);
        if (width === 390 && page.startsWith('reader-view')) {
          const screenshot = await call('Page.captureScreenshot', { format: 'png' });
          await fs.writeFile('/private/tmp/devi-mobile-dark.png', Buffer.from(screenshot.data, 'base64'));
        }
      }
    }
    await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await navigate('reader-view.html#verse-21');
    await color('dark');
    await call('Page.reload');
    await until(`document.querySelector('#epub-area')?.dataset.fittedSize && document.documentElement.dataset.appearance === 'dark'`, 'dark after reload');
    await evaluate(`document.querySelector('.book-menu').open=true;document.querySelector('#epub-toggle').click()`);
    assert(await evaluate(`!document.querySelector('#html-reader').hidden && getComputedStyle(document.querySelector('#verse-21')).color === 'rgb(238, 238, 238)'`), 'continuous text stays dark');
    await evaluate(`document.querySelector('.book-menu').open=true;document.querySelector('#epub-toggle').click()`);
    await until(`document.body.classList.contains('book-mode') && document.querySelector('#epub-area')?.dataset.fittedSize`, 'return to EPUB');
    await evaluate(`document.querySelector('#epub-next').click()`);
    await until(`!!document.querySelector('.turn-face')`, 'animated turn');
    assert(await evaluate(`getComputedStyle(document.querySelector('.turn-face')).backgroundColor === 'rgb(51, 51, 51)'`), 'page-turn face is dark');
    await until(`!document.querySelector('.turn-overlay') && !document.querySelector('#epub-area').hasAttribute('aria-busy')`, 'turn finished');
    await evaluate(`document.querySelector('.site-tabs a[href="contents.html"]').click()`);
    await until(`location.pathname.endsWith('/contents.html') && document.readyState === 'complete' && !!document.querySelector('#appearance-settings')`, 'open Contents from reader');
    assert.equal(await evaluate(`document.documentElement.dataset.appearance`), 'dark', 'guides remember palette');
    await evaluate(`document.querySelector('a[href$="#verse-21"]').click()`);
    await until(`location.hash === '#verse-21' && document.querySelector('#epub-area')?.dataset.fittedSize`, 'guide verse link');
    assert(await evaluate(`[...document.querySelectorAll('#epub-area iframe')].some(f=>f.contentDocument.querySelector('#verse-21')?.style.outline)`), 'guide verse is highlighted');
    await evaluate(`document.querySelector('.book-menu').open=true;document.querySelector('#theme-comparison').click()`);
    await until(`location.pathname.endsWith('/index.html') && document.querySelector('#epub-area')?.dataset.fittedSize`, 'theme switch');
    assert.equal(await evaluate(`document.documentElement.dataset.appearance`), 'dark', 'main theme remembers palette');
    console.log('PASS reload, continuous text, animated turn, guide verse link, theme switch');
    const sitemap = await (await fetch(base + 'sitemap.xml')).text();
    assert.equal((sitemap.match(/<loc>/g) || []).length, 3, 'three preferred sitemap pages');
    for (const page of ['index.html', 'reader-view.html', 'contents.html', 'about.html']) {
      const response = await fetch(base + page), html = await response.text();
      assert.equal(response.status, 200);
      const canonical = page.includes('view') || page === 'index.html' ? 'https://archipelagoing.github.io/DeviKavachamEnglish/' : `https://archipelagoing.github.io/DeviKavachamEnglish/${page}`;
      assert(html.includes(`rel="canonical" href="${canonical}"`), `${page}: canonical`);
      assert(html.includes('name="description"') && !html.includes('content="noindex"'), `${page}: searchable metadata`);
    }
    console.log('PASS sitemap and metadata under the project-site path');
    for (const width of [390, 1280]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: width < 900 });
      for (let section = 0; section <= 8; section++) {
        await navigate(`reader-view.html#page-${section}`);
        assert.equal(await evaluate('location.hash'), `#page-${section}`, 'selected section survives fitting/fallback');
        const page = await evaluate(`(() => {
          const frames=[...document.querySelectorAll('#epub-area iframe')];
          return {fallback:!document.querySelector('#html-reader').hidden, frames:frames.map(f=>({
            verses:f.contentDocument.querySelectorAll('.verse').length,
            fits:f.contentDocument.querySelector('pre').getBoundingClientRect().height <= f.closest('.book-leaf-body').clientHeight,
            size:parseFloat(getComputedStyle(f.contentDocument.querySelector('pre')).fontSize)
          }))};
        })()`);
        if (!page.fallback) assert(page.frames.every(f => f.fits && (section === 0 ? f.verses === 0 : f.verses === 7) && (width >= 900 || f.size >= 12)), 'all verses fit at readable mobile sizes');
      }
      console.log(`PASS ${width}px opening and all eight sections: position, text fit, mobile readability`);
    }
  }
  console.log(`Runtime errors: ${JSON.stringify(errors)}`);
  assert.equal(errors.length, 0, 'Uncaught browser errors');
  await call('Browser.close');
} finally {
  socket?.close();
  if (browser.exitCode === null) browser.kill('SIGTERM');
  await new Promise(resolve => { if (browser.exitCode !== null) return resolve(); browser.once('exit', resolve); setTimeout(resolve, 2000); });
  await fs.rm(profile, { recursive: true, force: true, maxRetries: 3 }).catch(() => {});
  await new Promise(resolve => server.close(resolve));
}

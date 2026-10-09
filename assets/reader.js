'use strict';
(() => {
  const pages = [...document.querySelectorAll('.reading-page')];
  const select = document.getElementById('page-select');
  const htmlReader = document.getElementById('html-reader');
  const epubReader = document.getElementById('epub-reader');
  const area = document.getElementById('epub-area');
  const toggle = document.getElementById('epub-toggle');
  const message = document.getElementById('epub-status');
  const previous = document.getElementById('epub-previous');
  const next = document.getElementById('epub-next');
  const turnButtons = [...document.querySelectorAll('[data-turn]')];
  const mobileHeader = matchMedia('(max-width: 899px)');
  const menu = document.querySelector('.book-menu');
  const expandHeader = () => { menu.open = !mobileHeader.matches; };
  expandHeader(); mobileHeader.addEventListener('change', expandHeader);
  const readerView = document.documentElement.dataset.edition === 'reader-view';
  const defaults = { appearance: 'sepia', font: 'serif', width: 'normal', lineHeight: '1.6', size: 1.15 };
  const palettes = { light: { paper: '#ffffff', ink: '#333333', rule: '#b4b4b4' }, dark: { paper: '#333333', ink: '#eeeeee', rule: '#888888' }, sepia: { paper: '#f4ecd8', ink: '#5b4636', rule: '#bbad93' } };
  const measures = { narrow: '30rem', normal: '35rem', wide: '40rem' };
  const families = { serif: 'Georgia, "Times New Roman", serif', sans: 'Helvetica, Arial, sans-serif' };
  let preferences = { ...defaults };
  if (readerView) {
    try {
      const saved = JSON.parse(localStorage.getItem('devi-reader-view-preferences')) || {};
      for (const [key, allowed] of Object.entries({ appearance: Object.keys(palettes), font: Object.keys(families), width: Object.keys(measures), lineHeight: ['1.4','1.6','1.8'] })) {
        if (allowed.includes(saved[key])) preferences[key] = saved[key];
      }
      if (typeof saved.size === 'number' && Number.isFinite(saved.size)) preferences.size = Math.max(.9,Math.min(2.2,saved.size));
    } catch {}
  }
  let size = preferences.size, book, rendition, loading, rendering, mode = 'text';
  let generation = 0, position, turning = false, gesture = false, wheelTimer;
  let facing = [], spreadStart = 0, singlePage = false, fitFrame;

  function destroyReaders() {
    generation += 1;
    if (facing.length) facing.forEach(active => active.destroy());
    else if (rendition) rendition.destroy();
    facing = []; rendition = undefined;
    area.replaceChildren();
  }

  function sizeBook() {
    if (mode !== 'epub') { area.style.removeProperty('height'); return; }
    const available = window.innerHeight - area.getBoundingClientRect().top - document.querySelector('.epub-controls').offsetHeight - 32;
    area.style.height = `${Math.max(80, available)}px`;
  }
  window.addEventListener('resize', () => { sizeBook(); scheduleFit(); });

  function applyAppearance(active) {
    if (!readerView) return;
    const root = document.documentElement;
    root.dataset.appearance = preferences.appearance; root.dataset.font = preferences.font;
    root.style.setProperty('--measure', measures[preferences.width]);
    root.style.setProperty('--reading-line-height', preferences.lineHeight);
    root.style.setProperty('--reading-size', `${size}rem`);
    document.querySelectorAll('input[name="appearance"]').forEach(input => { input.checked = input.value === preferences.appearance; });
    document.querySelectorAll('input[name="typeface"]').forEach(input => { input.checked = input.value === preferences.font; });
    document.getElementById('reading-width').value = preferences.width;
    document.getElementById('line-spacing').value = preferences.lineHeight;
    for (const reader of active ? [active] : facing.length ? facing : rendition ? [rendition] : []) {
      const palette = palettes[preferences.appearance];
      reader.themes.default({
        body: { 'background-color': `${palette.paper} !important`, color: `${palette.ink} !important`, 'font-family': `${families[preferences.font]} !important`, 'line-height': `${preferences.lineHeight} !important` },
        '.source-text': { 'font-family': 'inherit !important', 'line-height': `${preferences.lineHeight} !important` },
        '.verse': { color: `${preferences.appearance === 'dark' ? '#eeeeee' : '#211e18'} !important` },
        '.verse[data-tone="even"]': { color: `${preferences.appearance === 'dark' ? '#d4b99c' : '#694633'} !important` },
        '.verse::before': { color: `${preferences.appearance === 'dark' ? '#df938b' : '#a04d45'} !important` }
      });
      reader.themes.fontSize(`${size}rem`);
    }
    scheduleFit();
    try { localStorage.setItem('devi-reader-view-preferences', JSON.stringify({ ...preferences, size })); } catch {}
  }

  function fromHash() {
    const page = location.hash.match(/^#page-([0-8])$/);
    if (page) return { index: Number(page[1]), target: `page-${page[1]}` };
    const verse = location.hash.match(/^#verse-(\d+)$/);
    if (verse && Number(verse[1]) >= 1 && Number(verse[1]) <= 56) return { index: Math.ceil(Number(verse[1]) / 7), target: `verse-${verse[1]}` };
    return { index: 0, target: 'page-0' };
  }
  function epubTarget(index, target) {
    return `page-${index}.xhtml${target.startsWith('verse-') ? `#${target}` : ''}`;
  }
  async function navigate() {
    const { index, target } = fromHash();
    select.value = String(index);
    if (mode === 'epub' && rendition) {
      try { const destination = epubTarget(index, target); await renderFacing(destination); }
      catch (error) { message.textContent = 'This section could not load. Use Continuous text to keep reading.'; }
    } else {
      document.getElementById(target)?.scrollIntoView({ block: 'start' });
    }
  }
  select.addEventListener('change', () => {
    const hash = `#page-${select.value}`;
    if (location.hash === hash) navigate(); else location.hash = hash;
  });
  window.addEventListener('hashchange', navigate);

  function textMode() {
    mode = 'text'; generation += 1; turning = false; position = undefined;
    destroyReaders(); area.style.removeProperty('height');
    document.body.classList.remove('book-mode');
    epubReader.hidden = true; htmlReader.hidden = false;
    toggle.textContent = 'Read EPUB'; toggle.setAttribute('aria-pressed', 'false');
  }
  function script(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script'); s.src = src;
      s.onload = resolve; s.onerror = () => { s.remove(); reject(new Error('Reader library unavailable')); };
      document.head.append(s);
    });
  }
  function libraries() {
    if (!loading) loading = (async () => {
      if (!window.JSZip) await script('assets/vendor/jszip.min.js');
      if (!window.ePub) await script('assets/vendor/epub.min.js');
    })().catch(error => { loading = undefined; throw error; });
    return loading;
  }
  function updateHelp() {
    document.getElementById('epub-help').textContent = 'Scroll or use arrow keys to turn pages. Text automatically fits the page.';
    document.querySelector('.epub-controls').hidden = false;
  }
  function scheduleFit() {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(() => { if (mode === 'epub' && facing.length) fitFacing(); });
  }
  function fitFacing() {
    sizeBook();
    const panels = [...area.querySelectorAll('.book-leaf-body')];
    if (!panels.length || panels.some(p => !p.querySelector('iframe')?.contentDocument?.querySelector('pre'))) return;
    const max = size * 16;
    function fits(fontSize) {
      return panels.map(panel => {
        const doc = panel.querySelector('iframe').contentDocument;
        const text = doc.querySelector('pre');
        let style = doc.getElementById('fitted-page-style');
        if (!style) { style = doc.createElement('style'); style.id = 'fitted-page-style'; doc.head.append(style); }
        style.textContent = `body{padding:0!important;background:transparent!important}.source-text{font-size:${fontSize}px!important;line-height:${readerView ? preferences.lineHeight : '1.4'}!important}.verse+.verse{border:0!important;padding:0!important;margin-top:.65em!important}`;
        const rect = text.getBoundingClientRect();
        return rect.height <= panel.clientHeight - 8 && rect.width <= panel.clientWidth;
      }).every(Boolean);
    }
    let low = 1, high = max;
    for (let i = 0; i < 14; i++) { const middle = (low + high) / 2; if (fits(middle)) low = middle; else high = middle; }
    fits(low);
    area.dataset.fittedSize = low.toFixed(2);
  }
  async function turn(direction) {
    if (!rendition || turning) return;
    if ((direction < 0 && position?.atStart) || (direction > 0 && position?.atEnd)) return;
    turning = true;
    try { const destination = direction > 0 ? spreadStart === 0 ? 1 : spreadStart + (singlePage ? 1 : 2) : spreadStart === 1 ? 0 : spreadStart - (singlePage ? 1 : 2); await renderFacing(`page-${destination}.xhtml`); animateTurn(direction); }
    catch (error) { message.textContent = 'Unable to turn this page. Use Continuous text to keep reading.'; }
    finally { turning = false; }
  }
  function animateTurn(direction) {
    if (mode !== 'epub' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const leaves = [...area.querySelectorAll('.book-leaf')];
    const leaf = direction > 0 ? leaves.at(-1) : leaves[0];
    if (!leaf?.animate) return;
    leaf.style.transformOrigin = direction > 0 ? 'left center' : 'right center';
    leaf.animate([
      { transform: `rotateY(${direction > 0 ? -65 : 65}deg)`, opacity: .6 },
      { transform: 'rotateY(0deg)', opacity: 1 }
    ], { duration: 180, easing: 'cubic-bezier(.2,.7,.2,1)' });
  }
  function wheel(event, scroller) {
    if (mode !== 'epub' || !rendition || event.ctrlKey) return;
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!delta) return;
    const direction = Math.sign(delta);
    if (!gesture && ((direction < 0 && position?.atStart) || (direction > 0 && position?.atEnd))) return;
    event.preventDefault();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { gesture = false; }, 160);
    if (!gesture) { gesture = true; turn(direction); }
  }
  function key(event, scroller) {
    if (mode !== 'epub' || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target?.closest('a,button,input,select,textarea,[contenteditable="true"]')) return;
    const direction = ['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
    if (direction && !((direction < 0 && position?.atStart) || (direction > 0 && position?.atEnd))) { event.preventDefault(); turn(direction); }
  }
  area.addEventListener('wheel', wheel, { passive: false });
  area.addEventListener('keydown', key);
  turnButtons.forEach(button => button.addEventListener('click', () => turn(Number(button.dataset.turn))));

  async function renderFacing(target, forceSingle = false) {
    const match = target?.match(/^page-(\d+)\.xhtml/);
    const requested = match ? Number(match[1]) : book.spine.get(target)?.index || 0;
    singlePage = forceSingle || innerWidth < 900;
    spreadStart = singlePage ? requested : requested === 0 ? 0 : Math.floor((requested - 1) / 2) * 2 + 1;
    destroyReaders();
    const token = generation;
    area.classList.add('book-spread');
    area.classList.toggle('opening-spread', spreadStart === 0);
    area.classList.toggle('single-spread', singlePage);
    document.body.classList.add('book-mode');
    window.scrollTo(0, 0);
    updateHelp();
    area.classList.toggle('facing-pages', spreadStart !== 0 && !singlePage);
    select.value = String(requested);
    position = { start: { index: requested }, atStart: spreadStart === 0, atEnd: spreadStart + (singlePage ? 0 : 1) >= 8 };
    turnButtons.forEach(button => {
      const backwards = button.dataset.turn === '-1';
      button.disabled = backwards ? position.atStart : position.atEnd;
      const label = `${backwards ? 'Previous' : 'Next'} ${singlePage ? 'page' : 'spread'}`;
      button.textContent = backwards ? '‹' : '›';
      button.setAttribute('aria-label', label); button.title = label;
    });
    const indices = spreadStart === 0 || singlePage ? [spreadStart] : [spreadStart, spreadStart + 1];
    const displays = [];
    for (const index of indices) {
      const leaf = document.createElement('section'); leaf.className = 'book-leaf'; leaf.dataset.page = String(index);
      const heading = document.createElement('h2'); heading.id = `leaf-heading-${index}`;
      heading.textContent = index === 0 ? 'Opening' : `Page ${index} · Verses ${(index - 1) * 7 + 1}–${index * 7}`;
      leaf.setAttribute('aria-labelledby', heading.id);
      const container = document.createElement('div'); container.className = 'book-leaf-body';
      leaf.append(heading, container); area.append(leaf);
      const active = book.renderTo(container, { manager: 'default', flow: 'scrolled-doc', width: '100%', height: '100%', spread: 'none', fullsize: false });
      facing.push(active); if (!rendition) rendition = active;
      active.themes.fontSize(`${size}rem`); applyAppearance(active);
      active.hooks.content.register(contents => {
        contents.document.addEventListener('wheel', event => wheel(event, active.manager.container), { passive: false });
        contents.document.addEventListener('keydown', event => key(event, active.manager.container));
      });
      displays.push(active.display(index === requested && target ? target : `page-${index}.xhtml`));
    }
    sizeBook();
    await Promise.all(displays);
    if (token === generation) {
      message.textContent = ''; fitFacing();
      setTimeout(() => { if (token === generation) fitFacing(); }, 100);
      setTimeout(() => { if (token === generation) fitFacing(); }, 250);
    }
  }

  async function render(target) { return renderFacing(target); }

  async function epubMode() {
    if (rendering) return rendering;
    mode = 'epub';
    toggle.textContent = 'Continuous text'; toggle.setAttribute('aria-pressed', 'true');
    rendering = (async () => {
      try {
        await libraries();
        if (mode !== 'epub') return;
        if (!book) book = window.ePub('Devi-Kavacham.epub');
        epubReader.hidden = false; htmlReader.hidden = true;
        message.textContent = 'Loading EPUB…';
        const { index, target } = fromHash();
        await render(epubTarget(index, target));
      } catch (error) {
        if (mode === 'epub') {
          textMode();
          // Keep the complete readable text available when the EPUB fails.
          epubReader.hidden = false;
          message.textContent = 'The EPUB viewer could not load. The complete text is available below.';
          htmlReader.before(epubReader);
          area.hidden = true; document.querySelector('.epub-controls').hidden = true;
        }
      } finally { rendering = undefined; }
    })();
    return rendering;
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    if (mode === 'epub') textMode();
    else { area.hidden = false; htmlReader.after(epubReader); epubMode(); }
  });
  let viewportTimer;
  window.addEventListener('resize', () => {
    clearTimeout(viewportTimer);
    viewportTimer = setTimeout(() => {
      if (mode === 'epub' && rendition) renderFacing(`page-${select.value}.xhtml`).catch(() => textMode());
    }, 180);
  });
  function resize(amount) {
    size = Math.max(.9, Math.min(2.2, size + amount));
    document.documentElement.style.setProperty('--reading-size', `${size}rem`);
    for (const active of facing.length ? facing : rendition ? [rendition] : []) active.themes.fontSize(`${size}rem`);
    if (readerView) applyAppearance();
    scheduleFit();
  }
  document.getElementById('smaller').addEventListener('click', () => resize(-.1));
  document.getElementById('larger').addEventListener('click', () => resize(.1));
  document.getElementById('reader-controls').hidden = false;
  if (readerView) {
    document.getElementById('appearance-settings').hidden = false;
    applyAppearance();
    document.querySelectorAll('input[name="appearance"], input[name="typeface"]').forEach(input => input.addEventListener('change', () => {
      preferences[input.name === 'appearance' ? 'appearance' : 'font'] = input.value; applyAppearance();
    }));
    document.getElementById('reading-width').addEventListener('change', event => { preferences.width = event.target.value; applyAppearance(); });
    document.getElementById('line-spacing').addEventListener('change', event => { preferences.lineHeight = event.target.value; applyAppearance(); });
    document.getElementById('reset-appearance').addEventListener('click', () => { preferences = { ...defaults }; size = defaults.size; applyAppearance(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') document.getElementById('appearance-settings').open = false; });
  }
  document.getElementById('theme-comparison')?.addEventListener('click', event => {
    const link = event.currentTarget;
    link.hash = `page-${select.value}`;
  });
  // Track the visible section without hiding text or moving keyboard focus.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (mode !== 'text') return;
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) select.value = visible[0].target.id.slice(5);
    }, { rootMargin: '-10% 0px -65% 0px', threshold: 0 });
    pages.forEach(page => observer.observe(page));
  }
  if (location.hash) navigate();
  if (location.protocol === 'http:' || location.protocol === 'https:') epubMode();
})();

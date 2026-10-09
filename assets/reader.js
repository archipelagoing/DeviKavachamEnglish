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
  const narrow = window.matchMedia('(max-width: 899px)');
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
  let facing = [], spreadStart = 0;

  function destroyReaders() {
    generation += 1;
    if (facing.length) facing.forEach(active => active.destroy());
    else if (rendition) rendition.destroy();
    facing = []; rendition = undefined;
    area.replaceChildren();
  }

  function sizeBook() {
    if (narrow.matches || mode !== 'epub') { area.style.removeProperty('height'); return; }
    const available = window.innerHeight - area.getBoundingClientRect().top - document.querySelector('.epub-controls').offsetHeight - 16;
    area.style.height = `${Math.max(280, available)}px`;
  }
  window.addEventListener('resize', sizeBook);

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
        '.verse-label': { color: `${palette.ink} !important` },
        '.verse + .verse': { 'border-top-color': `${palette.rule} !important` }
      });
      reader.themes.fontSize(`${size}rem`);
    }
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
  function alignMobile(active, target) {
    if (!narrow.matches || !target || target === 'page-0.xhtml') return;
    let frame, rect;
    if (target.startsWith('epubcfi(')) {
      const range = active.getRange(target);
      if (range) {
        frame = [...area.querySelectorAll('iframe')].find(item => item.contentDocument === range.startContainer.ownerDocument);
        rect = range.getBoundingClientRect();
      }
    } else {
      const match = target.match(/^page-(\d+)\.xhtml(?:#(.+))?$/);
      const contents = match && active.getContents().find(item => item.sectionIndex === Number(match[1]));
      if (contents) {
        frame = [...area.querySelectorAll('iframe')].find(item => item.contentDocument === contents.document);
        rect = (match[2] ? contents.document.getElementById(match[2]) : contents.document.querySelector('pre'))?.getBoundingClientRect();
      }
    }
    // EPUB fullsize positioning does not account for the site's header above it.
    if (frame && rect) window.scrollBy(0, frame.getBoundingClientRect().top + rect.top - 12);
  }
  async function navigate() {
    const { index, target } = fromHash();
    select.value = String(index);
    if (mode === 'epub' && rendition) {
      try { const destination = epubTarget(index, target); if (narrow.matches) { await rendition.display(destination); alignMobile(rendition, destination); } else await renderFacing(destination); }
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
    area.classList.toggle('facing-pages', !narrow.matches);
    document.getElementById('epub-help').textContent = narrow.matches ? 'Scroll to read. All sections follow one another.' : 'Scroll to turn to the next pair of pages. Arrow keys work too. Larger text can scroll within each page.';
    document.querySelector('.epub-controls').hidden = narrow.matches;
  }
  async function turn(direction) {
    if (!rendition || turning || narrow.matches) return;
    if ((direction < 0 && position?.atStart) || (direction > 0 && position?.atEnd)) return;
    turning = true;
    try { const destination = direction > 0 ? spreadStart === 0 ? 1 : spreadStart + 2 : spreadStart === 1 ? 0 : spreadStart - 2; await renderFacing(`page-${destination}.xhtml`); }
    catch (error) { message.textContent = 'Unable to turn this page. Use Continuous text to keep reading.'; }
    finally { turning = false; }
  }
  function wheel(event, scroller) {
    if (mode !== 'epub' || narrow.matches || !rendition || event.ctrlKey) return;
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!delta) return;
    const direction = Math.sign(delta);
    if (scroller && Math.abs(event.deltaY) >= Math.abs(event.deltaX) && scroller.scrollHeight > scroller.clientHeight + 2) {
      const canScroll = direction > 0 ? scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 2 : scroller.scrollTop > 2;
      if (canScroll) return;
    }
    if (!gesture && ((direction < 0 && position?.atStart) || (direction > 0 && position?.atEnd))) return;
    event.preventDefault();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { gesture = false; }, 160);
    if (!gesture) { gesture = true; turn(direction); }
  }
  function key(event, scroller) {
    if (mode !== 'epub' || narrow.matches || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target?.closest('a,button,input,select,textarea,[contenteditable="true"]')) return;
    if (scroller && ['ArrowDown','ArrowUp','PageDown','PageUp'].includes(event.key) && scroller.scrollHeight > scroller.clientHeight + 2) {
      const down = ['ArrowDown','PageDown'].includes(event.key);
      if (down ? scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 2 : scroller.scrollTop > 2) return;
    }
    const direction = ['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
    if (direction && !((direction < 0 && position?.atStart) || (direction > 0 && position?.atEnd))) { event.preventDefault(); turn(direction); }
  }
  area.addEventListener('wheel', wheel, { passive: false });
  area.addEventListener('keydown', key);
  previous.addEventListener('click', () => turn(-1));
  next.addEventListener('click', () => turn(1));

  async function renderFacing(target) {
    const match = target?.match(/^page-(\d+)\.xhtml/);
    const requested = match ? Number(match[1]) : book.spine.get(target)?.index || 0;
    spreadStart = requested === 0 ? 0 : Math.floor((requested - 1) / 2) * 2 + 1;
    destroyReaders();
    const token = generation;
    area.classList.add('book-spread');
    area.classList.toggle('opening-spread', spreadStart === 0);
    updateHelp();
    area.classList.toggle('facing-pages', spreadStart !== 0);
    select.value = String(requested);
    position = { start: { index: requested }, atStart: spreadStart === 0, atEnd: spreadStart === 7 };
    previous.disabled = position.atStart; next.disabled = position.atEnd;
    const indices = spreadStart === 0 ? [0] : [spreadStart, spreadStart + 1];
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
    if (token === generation) message.textContent = '';
  }

  async function render(target) {
    if (!narrow.matches) return renderFacing(target);
    destroyReaders();
    area.classList.remove('book-spread', 'opening-spread');
    area.style.removeProperty('height');
    const token = ++generation;
    const mobileMode = narrow.matches;
    area.replaceChildren(); turning = false; position = undefined;
    updateHelp();
    rendition = book.renderTo(area, mobileMode ? {
      manager: 'continuous', flow: 'scrolled-continuous', width: '100%', fullsize: true, spread: 'none'
    } : {
      manager: 'continuous', flow: 'paginated', width: '100%', height: '100%', spread: 'auto', minSpreadWidth: 0
    });
    const active = rendition;
    active.themes.fontSize(`${size}rem`);
    applyAppearance(active);
    active.hooks.content.register(contents => {
      contents.document.addEventListener('wheel', wheel, { passive: false });
      contents.document.addEventListener('keydown', key);
    });
    active.on('relocated', location => {
      if (token !== generation || mobileMode !== narrow.matches) return;
      position = location; previous.disabled = location.atStart; next.disabled = location.atEnd;
      if (mobileMode) {
        const visibleFrame = [...area.querySelectorAll('iframe')].find(frame => frame.getBoundingClientRect().bottom > 16 && frame.getBoundingClientRect().top < window.innerHeight);
        if (visibleFrame) {
          const verse = visibleFrame.contentDocument?.querySelector('.verse');
          select.value = String(verse ? Math.ceil(Number(verse.id.slice(6)) / 7) : 0);
        }
      } else if (location.start) select.value = String(location.start.index);
    });
    try { await active.display(target); }
    catch (error) { if (token === generation) throw error; }
    if (token === generation) { alignMobile(active, target); message.textContent = ''; }
  }
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
  narrow.addEventListener('change', async () => {
    if (mode !== 'epub' || !rendition) return;
    const index = Number(select.value);
    const target = position?.start?.index === index && position.start.cfi ? position.start.cfi : `page-${index}.xhtml`;
    try { await render(target); }
    catch (error) { textMode(); }
  });
  function resize(amount) {
    size = Math.max(.9, Math.min(2.2, size + amount));
    document.documentElement.style.setProperty('--reading-size', `${size}rem`);
    for (const active of facing.length ? facing : rendition ? [rendition] : []) active.themes.fontSize(`${size}rem`);
    if (readerView) applyAppearance();
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

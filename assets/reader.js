'use strict';
(() => {
  const pages = [...document.querySelectorAll('.reading-page')];
  const select = document.getElementById('page-select');
  const htmlReader = document.getElementById('html-reader');
  const epubReader = document.getElementById('epub-reader');
  const area = document.getElementById('epub-area');
  const toggle = document.getElementById('epub-toggle');
  const message = document.getElementById('epub-status');
  const turnButtons = [...document.querySelectorAll('[data-turn]')];
  const menu = document.querySelector('.book-menu');
  const pageNavigation = document.getElementById('page-navigation');
  const bookPosition = document.getElementById('book-position');
  const popovers = [...document.querySelectorAll('.book-menu, .appearance-settings')];
  popovers.forEach(popover => popover.addEventListener('toggle', () => {
    if (popover.open) {
      popover.style.setProperty('--popover-top', `${popover.getBoundingClientRect().bottom + 8}px`);
      popovers.forEach(other => { if (other !== popover) other.open = false; });
    }
  }));
  document.addEventListener('pointerdown', event => {
    popovers.forEach(popover => { if (!popover.contains(event.target)) popover.open = false; });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') popovers.forEach(popover => {
      if (popover.open) { popover.open = false; popover.querySelector('summary').focus(); }
    });
  });
  const readerView = document.documentElement.dataset.edition === 'reader-view';
  const defaults = { appearance: readerView ? 'sepia' : 'light', font: 'serif', width: 'normal', lineHeight: '1.6', size: 1.15 };
  const palettes = { light: { paper: '#ffffff', ink: '#333333', rule: '#b4b4b4' }, dark: { paper: '#333333', ink: '#eeeeee', rule: '#888888' }, sepia: { paper: '#f4ecd8', ink: '#5b4636', rule: '#bbad93' } };
  const measures = { narrow: '30rem', normal: '35rem', wide: '40rem' };
  const families = { serif: 'Georgia, "Times New Roman", serif', sans: 'Helvetica, Arial, sans-serif' };
  let preferences = { ...defaults };
  {
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
  let facing = [], spreadStart = 0, singlePage = false, fitFrame, currentTarget;
  let turnAnimations = [], turnOverlay, turnController;
  const pendingDisplays = new Map();

  function disposeReader(active) {
    const pending = pendingDisplays.get(active);
    // EPUB.js queues startup before display. Destroying it during startup
    // removes the book while that queued work still expects it to exist.
    if (pending) pending.then(() => active.destroy(), () => active.destroy()).catch(() => {});
    else active.destroy();
  }

  function cancelTurnAnimation() {
    turnAnimations.forEach(animation => animation.cancel());
    turnAnimations = [];
    turnOverlay?.remove(); turnOverlay = undefined;
  }

  function destroyReaders(preserveTurn = false) {
    if (!preserveTurn) { turnController?.abort(); cancelTurnAnimation(); }
    generation += 1;
    if (facing.length) facing.forEach(disposeReader);
    else if (rendition) disposeReader(rendition);
    facing = []; rendition = undefined;
    area.replaceChildren();
  }

  function sizeBook() {
    if (mode !== 'epub') { area.style.removeProperty('height'); return; }
    const available = (window.visualViewport?.height || window.innerHeight) - area.getBoundingClientRect().top - 16;
    area.style.height = `${Math.max(80, available)}px`;
  }
  window.addEventListener('resize', () => { sizeBook(); scheduleFit(); });
  window.visualViewport?.addEventListener('resize', () => { sizeBook(); scheduleFit(); });

  function applyAppearance(active) {
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
        html: { 'background-color': `${palette.paper} !important`, 'color-scheme': preferences.appearance === 'dark' ? 'dark' : 'light' },
        body: { 'background-color': `${palette.paper} !important`, color: `${palette.ink} !important`, 'font-family': `${families[preferences.font]} !important`, 'line-height': `${preferences.lineHeight} !important` },
        '.source-text': { 'background-color': `${palette.paper} !important`, color: `${palette.ink} !important`, 'font-family': 'inherit !important', 'line-height': `${preferences.lineHeight} !important` },
        '.verse': { color: `${preferences.appearance === 'dark' ? '#eeeeee' : '#211e18'} !important` },
        '.verse[data-tone="even"]': { color: `${preferences.appearance === 'dark' ? '#9ed3b4' : '#245c45'} !important` },
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

  function updatePageOptions(bookLayout = false) {
    const layout = bookLayout ? singlePage ? 'single' : 'facing' : 'text';
    if (select.dataset.layout === layout) return;
    select.dataset.layout = layout;
    const indices = layout === 'facing' ? [0, 1, 3, 5, 7] : Array.from({ length: 9 }, (_, index) => index);
    select.replaceChildren(...indices.map(index => {
      const option = document.createElement('option'); option.value = String(index);
      option.textContent = index === 0 ? 'Opening' : layout === 'facing' ? `Pages ${index}–${index + 1}` : layout === 'single' ? `Page ${index}` : `Verses ${(index - 1) * 7 + 1}–${index * 7}`;
      return option;
    }));
    document.querySelector('label[for="page-select"]').textContent = bookLayout ? 'Go to page' : 'Go to verses';
  }

  function textMode() {
    mode = 'text'; generation += 1; turning = false; position = undefined;
    destroyReaders(); area.style.removeProperty('height');
    document.body.classList.remove('book-mode');
    epubReader.hidden = true; htmlReader.hidden = false;
    const index = select.value; updatePageOptions(); select.value = index;
    pageNavigation.hidden = true;
    area.removeAttribute('aria-busy');
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
    pageNavigation.hidden = false;
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
        style.textContent = `html,body,.source-text{background:${palettes[preferences.appearance].paper}!important}body{padding:0!important}.source-text{color:${palettes[preferences.appearance].ink}!important;font-size:${fontSize}px!important;line-height:${preferences.lineHeight}!important}.verse+.verse{border:0!important;padding:0!important;margin-top:.65em!important}`;
        const rect = text.getBoundingClientRect();
        return rect.height <= panel.clientHeight - 8 && rect.width <= panel.clientWidth;
      }).every(Boolean);
    }
    let low = 1, high = max;
    for (let i = 0; i < 14; i++) { const middle = (low + high) / 2; if (fits(middle)) low = middle; else high = middle; }
    if (innerWidth < 900 && low < 12) {
      textMode();
      const notice = document.getElementById('reading-notice');
      notice.textContent = 'Showing continuous text to keep reading comfortable on this screen.';
      notice.hidden = false;
      const target = currentTarget?.match(/#(verse-\d+)$/)?.[1] || currentTarget?.match(/^(page-\d+)\.xhtml/)?.[1] || fromHash().target;
      history.replaceState(null, '', `#${target}`);
      requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ block: 'start' }));
      return;
    }
    fits(low);
    area.dataset.fittedSize = low.toFixed(2);
  }
  async function turn(direction) {
    if (!rendition || turning) return;
    if ((direction < 0 && position?.atStart) || (direction > 0 && position?.atEnd)) return;
    turning = true;
    area.setAttribute('aria-busy', 'true');
    const token = generation;
    const controller = new AbortController();
    turnController = controller;
    try {
      const destination = direction > 0
        ? spreadStart === 0 ? 1 : spreadStart + (singlePage ? 1 : 2)
        : spreadStart === 1 ? 0 : spreadStart - (singlePage ? 1 : 2);
      const overlay = captureSpread();
      await Promise.race([
        renderFacing(`page-${destination}.xhtml`, false, true),
        new Promise(resolve => controller.signal.addEventListener('abort', resolve, { once: true }))
      ]);
      if (mode === 'epub' && generation === token + 1 && overlay === turnOverlay) {
        await animateTurn(direction, overlay);
      }
    }
    catch (error) {
      if (!controller.signal.aborted) message.textContent = 'Unable to turn this page. Use Continuous text to keep reading.';
    }
    finally {
      if (turnController === controller) {
        cancelTurnAnimation(); turning = false; area.removeAttribute('aria-busy'); turnController = undefined;
      }
    }
  }
  function snapshotLeaf(leaf) {
    const clone = leaf.cloneNode(true);
    // Iframe clones have no rendered content. Copy the fitted document with its
    // computed typography so the turning paper carries the text being read.
    const frame = leaf.querySelector('iframe');
    const source = frame?.contentDocument?.body;
    if (source) {
      const body = source.cloneNode(true);
      const originals = [source, ...source.querySelectorAll('*')];
      const copies = [body, ...body.querySelectorAll('*')];
      const properties = ['display', 'color', 'background-color', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'white-space', 'overflow-wrap', 'text-align', 'margin', 'padding', 'border', 'box-sizing', 'width', 'height'];
      originals.forEach((original, index) => {
        const style = frame.contentWindow.getComputedStyle(original);
        properties.forEach(property => copies[index].style.setProperty(property, style.getPropertyValue(property)));
        if (original.classList.contains('verse')) {
          const markerStyle = frame.contentWindow.getComputedStyle(original, '::before');
          const marker = document.createElement('span');
          marker.textContent = original.dataset.label;
          properties.forEach(property => marker.style.setProperty(property, markerStyle.getPropertyValue(property)));
          copies[index].prepend(marker);
        }
      });
      const viewport = document.createElement('div');
      viewport.style.cssText = `width:${frame.clientWidth}px;height:${frame.clientHeight}px;overflow:hidden;`;
      viewport.append(body);
      clone.querySelector('.book-leaf-body').replaceChildren(viewport);
    }
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    clone.removeAttribute('aria-labelledby');
    return clone;
  }

  function captureSpread() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !area.animate) return;
    cancelTurnAnimation();
    const rect = area.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.className = 'turn-overlay';
    overlay.setAttribute('aria-hidden', 'true'); overlay.inert = true;
    overlay.style.cssText = `left:${rect.left + area.clientLeft}px;top:${rect.top + area.clientTop}px;width:${area.clientWidth}px;height:${area.clientHeight}px;`;
    area.querySelectorAll('.book-leaf').forEach(leaf => {
      const bounds = leaf.getBoundingClientRect();
      const clone = snapshotLeaf(leaf);
      clone.style.cssText = `position:absolute;left:${bounds.left - rect.left - area.clientLeft}px;top:${bounds.top - rect.top - area.clientTop}px;width:${bounds.width}px;height:${bounds.height}px;`;
      overlay.append(clone);
    });
    document.body.append(overlay); turnOverlay = overlay;
    return overlay;
  }

  async function animateTurn(direction, overlay) {
    if (!overlay || overlay !== turnOverlay) return;
    const oldLeaves = [...overlay.children];
    const newLeaves = [...area.querySelectorAll('.book-leaf')];
    const facingTurn = oldLeaves.length === 2 && newLeaves.length === 2;
    const front = facingTurn ? direction > 0 ? oldLeaves[1] : oldLeaves[0] : document.createElement('div');
    const sheet = document.createElement('div'); sheet.className = 'turn-sheet';
    if (facingTurn) {
      sheet.style.cssText = front.style.cssText;
      front.style.cssText = '';
    } else {
      // A cover or a narrow screen turns as one full-width sheet.
      sheet.style.cssText = 'position:absolute;inset:0;';
      oldLeaves.forEach(leaf => front.append(leaf));
    }
    front.classList.add('turn-face', 'turn-front');
    sheet.style.transformOrigin = direction > 0 ? 'left center' : 'right center';
    const back = facingTurn ? snapshotLeaf(direction > 0 ? newLeaves[0] : newLeaves[1]) : document.createElement('div');
    back.style.cssText = ''; back.classList.add('turn-face', 'turn-back');
    sheet.append(front, back); overlay.append(sheet);
    const rotation = sheet.animate([
      { transform: 'rotateY(0deg)' },
      { transform: `rotateY(${direction > 0 ? -180 : 180}deg)` }
    ], { duration: 620, easing: 'cubic-bezier(.35,.05,.3,1)', fill: 'forwards' });
    const shading = sheet.animate([
      { boxShadow: '0 0 0 #0000' },
      { boxShadow: '0 12px 32px #21150d55', offset: .5 },
      { boxShadow: '0 0 0 #0000' }
    ], { duration: 620, easing: 'ease-in-out', fill: 'forwards' });
    turnAnimations = [rotation, shading];
    await Promise.all(turnAnimations.map(animation => animation.finished.catch(() => {})));
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

  async function renderFacing(target, forceSingle = false, preserveTurn = false) {
    currentTarget = target;
    const match = target?.match(/^page-(\d+)\.xhtml/);
    const requested = match ? Number(match[1]) : book.spine.get(target)?.index || 0;
    singlePage = forceSingle || innerWidth < 900;
    spreadStart = singlePage ? requested : requested === 0 ? 0 : Math.floor((requested - 1) / 2) * 2 + 1;
    destroyReaders(preserveTurn);
    const token = generation;
    area.classList.add('book-spread');
    area.classList.toggle('opening-spread', spreadStart === 0);
    area.classList.toggle('single-spread', singlePage);
    document.body.classList.add('book-mode');
    window.scrollTo(0, 0);
    updateHelp();
    area.classList.toggle('facing-pages', spreadStart !== 0 && !singlePage);
    updatePageOptions(true);
    select.value = String(singlePage ? requested : spreadStart);
    position = { start: { index: requested }, atStart: spreadStart === 0, atEnd: spreadStart + (singlePage ? 0 : 1) >= 8 };
    bookPosition.textContent = spreadStart === 0 ? 'Opening' : singlePage ? `${spreadStart} / 8` : `${spreadStart}–${spreadStart + 1} / 8`;
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
      // Fit before revealing the text so it cannot flash at the unfitted size.
      leaf.style.visibility = 'hidden';
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
      const display = active.display(`page-${index}.xhtml`);
      pendingDisplays.set(active, display);
      display.then(() => pendingDisplays.delete(active), () => pendingDisplays.delete(active));
      displays.push(display);
    }
    sizeBook();
    await Promise.all(displays);
    await Promise.all([...area.querySelectorAll('iframe')].map(frame => frame.contentDocument?.fonts?.ready));
    if (token === generation) {
      message.textContent = ''; fitFacing();
      if (mode !== 'epub') return;
      const verse = target?.match(/#(verse-\d+)$/)?.[1];
      history.replaceState(null, '', verse ? `#${verse}` : `#page-${requested}`);
      if (verse) area.querySelectorAll('iframe').forEach(frame => {
        const highlighted = frame.contentDocument?.getElementById(verse);
        if (highlighted) { highlighted.style.outline = `2px solid ${preferences.appearance === 'dark' ? '#9ed3b4' : '#245c45'}`; highlighted.style.outlineOffset = '3px'; }
      });
      area.querySelectorAll('.book-leaf').forEach(leaf => leaf.style.removeProperty('visibility'));
    }
  }

  async function render(target) { return renderFacing(target); }

  async function epubMode() {
    if (rendering) return rendering;
    mode = 'epub';
    document.getElementById('reading-notice').hidden = true;
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
          area.hidden = true; pageNavigation.hidden = true;
        }
      } finally { rendering = undefined; }
    })();
    return rendering;
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    menu.open = false;
    if (mode === 'epub') textMode();
    else { area.hidden = false; htmlReader.after(epubReader); epubMode(); }
  });
  let viewportTimer;
  window.addEventListener('resize', () => {
    clearTimeout(viewportTimer);
    viewportTimer = setTimeout(() => {
      if (mode === 'epub' && rendition) renderFacing(currentTarget || `page-${select.value}.xhtml`).catch(() => textMode());
    }, 180);
  });
  function resize(amount) {
    size = Math.max(.9, Math.min(2.2, size + amount));
    document.documentElement.style.setProperty('--reading-size', `${size}rem`);
    for (const active of facing.length ? facing : rendition ? [rendition] : []) active.themes.fontSize(`${size}rem`);
    applyAppearance();
    scheduleFit();
  }
  document.getElementById('smaller').addEventListener('click', () => resize(-.1));
  document.getElementById('larger').addEventListener('click', () => resize(.1));
  document.getElementById('reader-controls').hidden = false;
  {
    document.getElementById('appearance-settings').hidden = false;
    applyAppearance();
    document.querySelectorAll('input[name="appearance"], input[name="typeface"]').forEach(input => input.addEventListener('change', () => {
      preferences[input.name === 'appearance' ? 'appearance' : 'font'] = input.value; applyAppearance();
    }));
    document.getElementById('reading-width').addEventListener('change', event => { preferences.width = event.target.value; applyAppearance(); });
    document.getElementById('line-spacing').addEventListener('change', event => { preferences.lineHeight = event.target.value; applyAppearance(); });
    document.getElementById('reset-appearance').addEventListener('click', () => { preferences = { ...defaults }; size = defaults.size; applyAppearance(); });
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

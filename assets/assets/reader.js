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
  let size = 1.15, book, rendition, loading, rendering, mode = 'text';
  let generation = 0, position, turning = false, gesture = false, wheelTimer;

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
      try { const destination = epubTarget(index, target); await rendition.display(destination); alignMobile(rendition, destination); }
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
    if (rendition) rendition.destroy();
    rendition = undefined; area.replaceChildren();
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
    document.getElementById('epub-help').textContent = narrow.matches ? 'Scroll to read. All sections follow one another.' : 'Scroll over the book to turn pages. You can also use the arrow keys.';
    document.querySelector('.epub-controls').hidden = narrow.matches;
  }
  async function turn(direction) {
    if (!rendition || turning || narrow.matches) return;
    if ((direction < 0 && position?.atStart) || (direction > 0 && position?.atEnd)) return;
    turning = true;
    const active = rendition;
    try { await (direction > 0 ? active.next() : active.prev()); }
    catch (error) { message.textContent = 'Unable to turn this page. Use Continuous text to keep reading.'; }
    finally { if (active === rendition) turning = false; }
  }
  function wheel(event) {
    if (mode !== 'epub' || narrow.matches || !rendition || event.ctrlKey) return;
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!delta) return;
    const direction = Math.sign(delta);
    if (!gesture && ((direction < 0 && position?.atStart) || (direction > 0 && position?.atEnd))) return;
    event.preventDefault();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { gesture = false; }, 160);
    if (!gesture) { gesture = true; turn(direction); }
  }
  function key(event) {
    if (mode !== 'epub' || narrow.matches || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target?.closest('a,button,input,select,textarea,[contenteditable="true"]')) return;
    const direction = ['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
    if (direction && !((direction < 0 && position?.atStart) || (direction > 0 && position?.atEnd))) { event.preventDefault(); turn(direction); }
  }
  area.addEventListener('wheel', wheel, { passive: false });
  area.addEventListener('keydown', key);
  previous.addEventListener('click', () => turn(-1));
  next.addEventListener('click', () => turn(1));

  async function render(target) {
    const token = ++generation;
    const mobileMode = narrow.matches;
    if (rendition) rendition.destroy();
    area.replaceChildren(); turning = false; position = undefined;
    updateHelp();
    rendition = book.renderTo(area, mobileMode ? {
      manager: 'continuous', flow: 'scrolled-continuous', width: '100%', fullsize: true, spread: 'none'
    } : {
      manager: 'continuous', flow: 'paginated', width: '100%', height: '100%', spread: 'auto', minSpreadWidth: 0
    });
    const active = rendition;
    active.themes.fontSize(`${size}rem`);
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
    const target = position?.start?.index === index ? position.start.cfi : `page-${index}.xhtml`;
    try { await render(target); }
    catch (error) { textMode(); }
  });
  function resize(amount) {
    size = Math.max(.9, Math.min(2.2, size + amount));
    document.documentElement.style.setProperty('--reading-size', `${size}rem`);
    if (rendition) rendition.themes.fontSize(`${size}rem`);
  }
  document.getElementById('smaller').addEventListener('click', () => resize(-.1));
  document.getElementById('larger').addEventListener('click', () => resize(.1));
  document.getElementById('reader-controls').hidden = false;
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

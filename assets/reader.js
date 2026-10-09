'use strict';
(() => {
  const pages = [...document.querySelectorAll('.reading-page')];
  const select = document.getElementById('page-select');
  const previous = document.getElementById('previous');
  const next = document.getElementById('next');
  const allButton = document.getElementById('all-text');
  const status = document.getElementById('reader-status');
  let all = false, current = 0, size = 1.15, book, rendition, loading;
  function fromHash() {
    const match = location.hash.match(/^#page-([0-8])$/);
    if (match) return Number(match[1]);
    const verse = location.hash.match(/^#verse-(\d+)$/);
    return verse && Number(verse[1]) >= 1 && Number(verse[1]) <= 56 ? Math.ceil(Number(verse[1]) / 7) : 0;
  }
  function show(index, focus = false) {
    current = index;
    pages.forEach((page, i) => { page.hidden = !all && i !== current; });
    select.value = String(index);
    previous.disabled = all || index === 0;
    next.disabled = all || index === 8;
    select.disabled = all;
    status.textContent = all ? 'Opening and all 56 verses' : index === 0 ? 'Opening · Title and dedication' : `Page ${index} of 8 · Verses ${(index - 1) * 7 + 1}–${index * 7}`;
    if (focus) document.getElementById(`heading-${index}`).focus();
  }
  function go(index) { location.hash = `page-${index}`; show(index, true); }
  previous.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  select.addEventListener('change', () => go(Number(select.value)));
  window.addEventListener('hashchange', () => show(fromHash()));
  allButton.addEventListener('click', () => {
    all = !all; allButton.setAttribute('aria-pressed', String(all));
    allButton.textContent = all ? 'Show reading pages' : 'Show all verses'; show(current);
  });
  function resize(amount) {
    size = Math.max(.9, Math.min(2.2, size + amount));
    document.documentElement.style.setProperty('--reading-size', `${size}rem`);
    if (rendition) rendition.themes.fontSize(`${size}rem`);
  }
  document.getElementById('smaller').addEventListener('click', () => resize(-.1));
  document.getElementById('larger').addEventListener('click', () => resize(.1));
  function script(src) { return new Promise((resolve, reject) => { const s = document.createElement('script'); s.src = src; s.onload = resolve; s.onerror = () => reject(new Error('Reader library unavailable')); document.head.append(s); }); }
  const toggle = document.getElementById('epub-toggle');
  toggle.hidden = false;
  toggle.addEventListener('click', async () => {
    const area = document.getElementById('epub-reader');
    const enabled = area.hidden;
    area.hidden = !enabled;
    document.getElementById('html-reader').hidden = enabled;
    document.getElementById('reader-controls').hidden = enabled;
    status.hidden = enabled;
    toggle.textContent = enabled ? 'Return to reading pages' : 'Read EPUB in browser';
    if (!enabled || rendition) return;
    const message = document.getElementById('epub-status');
    message.textContent = 'Loading EPUB…';
    try {
      if (!loading) loading = script('assets/vendor/jszip.min.js').then(() => script('assets/vendor/epub.min.js'));
      await loading;
      book = ePub('Devi-Kavacham.epub');
      rendition = book.renderTo('epub-area', { width: '100%', height: '100%', flow: 'paginated', spread: 'none' });
      rendition.themes.fontSize(`${size}rem`);
      await rendition.display(); message.textContent = '';
    } catch (error) { loading = undefined; rendition = undefined; message.textContent = 'The EPUB reader could not load. You can return to the reading pages or download the EPUB.'; }
  });
  document.getElementById('epub-previous').addEventListener('click', () => { if (rendition) rendition.prev().catch(() => {}); });
  document.getElementById('epub-next').addEventListener('click', () => { if (rendition) rendition.next().catch(() => {}); });
  document.getElementById('reader-controls').hidden = false;
  show(fromHash());
})();

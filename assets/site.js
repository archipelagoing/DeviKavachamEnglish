'use strict';
(() => {
  const reader = document.getElementById('page-select');
  let edition = 'index.html', section = '#page-0';
  try {
    const saved = sessionStorage.getItem('devi-reading-edition');
    if (['index.html', 'reader-view.html'].includes(saved)) edition = saved;
    const savedSection = sessionStorage.getItem('devi-reading-section');
    if (/^#(?:page-[0-8]|verse-(?:[1-9]|[1-4]\d|5[0-6]))$/.test(savedSection)) section = savedSection;
  } catch {}
  if (reader) {
    edition = document.documentElement.dataset.edition === 'reader-view' ? 'reader-view.html' : 'index.html';
    document.querySelectorAll('[data-read]').forEach(link => { link.href = `${edition}${location.hash || '#page-0'}`; });
    document.querySelectorAll('.site-tabs a').forEach(link => link.addEventListener('click', () => {
      if (link.hasAttribute('data-resume')) link.href = `${edition}#page-${reader.value}`;
      try {
        sessionStorage.setItem('devi-reading-edition', edition);
        sessionStorage.setItem('devi-reading-section', `#page-${reader.value}`);
      } catch {}
    }));
  } else {
    document.querySelectorAll('[data-read]').forEach(link => {
      const hash = link.hasAttribute('data-resume') ? section : new URL(link.href).hash;
      link.href = `${edition}${hash}`;
    });
    try {
      const saved = JSON.parse(localStorage.getItem('devi-reader-view-preferences')) || {};
      if (['light', 'dark', 'sepia'].includes(saved.appearance)) document.documentElement.dataset.appearance = saved.appearance;
      if (['serif', 'sans'].includes(saved.font)) document.documentElement.dataset.font = saved.font;
    } catch {}
  }
})();

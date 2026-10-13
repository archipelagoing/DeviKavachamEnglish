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
    const openGuideTarget = () => {
      let target;
      try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
      if (!target) return;
      let parent = target.closest('details');
      while (parent) { parent.open = true; parent = parent.parentElement?.closest('details'); }
      requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    };
    openGuideTarget();
    window.addEventListener('hashchange', openGuideTarget);
    document.querySelectorAll('[data-read]').forEach(link => {
      const hash = link.hasAttribute('data-resume') ? section : new URL(link.href).hash;
      link.href = `${edition}${hash}`;
    });
    try {
      const saved = JSON.parse(localStorage.getItem('devi-reader-view-preferences')) || {};
      if (['light', 'dark', 'sepia'].includes(saved.appearance)) document.documentElement.dataset.appearance = saved.appearance;
      if (['serif', 'sans'].includes(saved.font)) document.documentElement.dataset.font = saved.font;
    } catch {}
    const root = document.documentElement;
    const settings = document.getElementById('appearance-settings');
    const syncColors = () => document.querySelectorAll('input[name="appearance"]').forEach(input => {
      input.checked = input.value === root.dataset.appearance;
    });
    if (settings) {
      settings.hidden = false;
      syncColors();
      settings.addEventListener('toggle', () => {
        if (settings.open) settings.style.setProperty('--popover-top', `${settings.getBoundingClientRect().bottom + 8}px`);
      });
      document.querySelectorAll('input[name="appearance"]').forEach(input => input.addEventListener('change', () => {
        root.dataset.appearance = input.value;
        try {
          const saved = JSON.parse(localStorage.getItem('devi-reader-view-preferences')) || {};
          localStorage.setItem('devi-reader-view-preferences', JSON.stringify({ ...saved, appearance: input.value }));
        } catch {}
        syncColors();
      }));
      document.addEventListener('pointerdown', event => { if (!settings.contains(event.target)) settings.open = false; });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && settings.open) { settings.open = false; settings.querySelector('summary').focus(); }
      });
    }
  }
})();

(function () {
  const root = document.documentElement;
  const tbtn = document.getElementById('theme-toggle');

  function themeLabel() {
    const dark = root.dataset.theme === 'dark';
    const pt = root.dataset.lang === 'pt';
    tbtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    const label = pt
      ? (dark ? 'Mudar para modo claro' : 'Mudar para modo escuro')
      : (dark ? 'Switch to light mode' : 'Switch to dark mode');
    tbtn.setAttribute('aria-label', label);
    tbtn.title = label;
  }

  function setLang(l) {
    root.dataset.lang = l;
    root.lang = l;
    document.querySelectorAll('.lang button[data-set]').forEach((b) => {
      b.setAttribute('aria-pressed', b.dataset.set === l ? 'true' : 'false');
    });
    try { localStorage.setItem('lang', l); } catch (e) {}
    themeLabel();
  }

  document.querySelectorAll('.lang button[data-set]').forEach((b) => {
    b.addEventListener('click', () => setLang(b.dataset.set));
  });

  tbtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    themeLabel();
  });

  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  setLang(saved || ((navigator.language || 'en').toLowerCase().startsWith('pt') ? 'pt' : 'en'));
})();

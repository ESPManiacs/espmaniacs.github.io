(function () {
  const root = document.documentElement;
  const tbtn = document.getElementById('theme-toggle');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- language + theme ----------
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

  // ---------- reveal on scroll ----------
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('in'));
  }

  // ---------- nav state, hero zoom, gentle parallax ----------
  const nav = document.querySelector('.nav');
  const zoom = document.querySelector('[data-zoom]');
  const par = [...document.querySelectorAll('[data-parallax]')];
  let ticking = false;
  function onScroll() {
    ticking = false;
    nav.classList.toggle('scrolled', scrollY > 12);
    if (reduce) return;
    const vh = innerHeight;
    if (zoom) {
      const r = zoom.parentElement.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, 1 - r.top / vh));
      zoom.style.transform = `scale(${1.14 - 0.14 * t})`;
    }
    par.forEach((img) => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const t = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
      img.style.transform = `translateY(${(t * -6).toFixed(2)}%) scale(1.12)`;
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  onScroll();

  // ---------- live versions from GitHub releases ----------
  // The page ships with the versions known at build time; this refreshes them
  // (cached for an hour, so a visit costs at most one API call per project).
  const verEls = document.querySelectorAll('[data-repo]');
  const repos = [...new Set([...verEls].map((el) => el.dataset.repo))];
  function showVersion(repo, tag) {
    if (!tag) return;
    document.querySelectorAll(`[data-repo="${repo}"]`).forEach((el) => { el.textContent = tag; });
  }
  repos.forEach((repo) => {
    const key = 'ver:' + repo;
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
    if (cached && Date.now() - cached.t < 3600e3) { showVersion(repo, cached.v); return; }
    fetch(`https://api.github.com/repos/skydoy/${repo}/releases?per_page=1`, { headers: { Accept: 'application/vnd.github+json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((list) => {
        const tag = list && list[0] && list[0].tag_name;
        if (!tag) return;
        showVersion(repo, tag);
        try { localStorage.setItem(key, JSON.stringify({ v: tag, t: Date.now() })); } catch (e) {}
      })
      .catch(() => {});
  });
})();

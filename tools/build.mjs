// Builds the six-language site from tools/i18n/*.mjs.
//   node tools/build.mjs
// Writes index/privacy/terms for en (root) and ru/ de/ fr/ es/ pt/, plus sitemap.xml.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://quillfox.nghive.app';
const CODES = ['en', 'es', 'de', 'fr', 'ru', 'pt'];
const SHORT = { en: 'EN', es: 'ES', de: 'DE', fr: 'FR', ru: 'RU', pt: 'PT' };
const PAGES = { index: '', privacy: 'privacy', terms: 'terms' };
const TODAY = '2026-11-17';

const ICONS = {
  mic: '<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  save: '<path d="M5 4h11l3 3v13H5Z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
  share: '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 13v6h14v-6"/>',
  folder: '<path d="M3 6h6l2 2h10v11H3Z"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
};
const icon = (n) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
const APPLE = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.365 1.43c0 1.14-.463 2.096-1.184 2.883-.796.83-2.083 1.474-3.13 1.474-.11-1.11.464-2.223 1.183-2.94.796-.83 2.148-1.443 3.131-1.417zM20.62 17.104c-.472 1.09-.694 1.577-1.297 2.548-.842 1.35-2.03 3.036-3.501 3.05-1.303.014-1.64-.85-3.41-.84-1.77.01-2.14.855-3.443.841-1.472-.014-2.596-1.53-3.438-2.878-2.36-3.78-2.607-8.22-1.15-10.582.958-1.535 2.518-2.432 3.987-2.432 1.494 0 2.435.85 3.673.85 1.203 0 1.933-.85 3.674-.85 1.32 0 2.717.72 3.717 1.964-3.27 1.79-2.74 6.463.188 8.329z"/></svg>';

const url = (l, p) => `${SITE}/${l === 'en' ? '' : l + '/'}${PAGES[p]}`;
const href = (l, p) => `/${l === 'en' ? '' : l + '/'}${PAGES[p]}`;
const esc = (s) => s.replace(/&(?!nbsp;|amp;)/g, '&amp;').replace(/"/g, '&quot;');
const strip = (s) => s.replace(/<[^>]+>/g, '');

function head(L, page, title, desc, extra = '') {
  const alts = CODES.map((c) => `<link rel="alternate" hreflang="${c}" href="${url(c, page)}">`).join('\n');
  return `<!doctype html>
<html lang="${L.code}"${page === 'index' ? ' data-home' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#fffaf3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#17130f" media="(prefers-color-scheme: dark)">
<link rel="icon" type="image/png" href="/assets/favicon.png">
<link rel="apple-touch-icon" href="/assets/icon-180.png">
<link rel="canonical" href="${url(L.code, page)}">
${alts}
<link rel="alternate" hreflang="x-default" href="${url('en', page)}">
<meta property="og:url" content="${url(L.code, page)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(page === 'index' ? L.home.ogDesc : desc)}">
<meta property="og:image" content="${SITE}/assets/logo-800.jpg">
<meta property="og:site_name" content="NG Hive">
<meta property="og:type" content="website">
<meta property="og:locale" content="${L.locale}">
<meta name="twitter:card" content="summary_large_image">
${extra}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:ital,wght@0,500;0,600;0,700;1,500&display=swap">
<link rel="stylesheet" href="/site.css?v=1">
</head>
<body>
<div class="wrap">
`;
}

function masthead(L, page, navLinks) {
  const langs = CODES.map((c) => `<a href="${href(c, page)}" lang="${c}" hreflang="${c}"${c === L.code ? ' aria-current="page"' : ''}>${SHORT[c]}</a>`).join('\n      ');
  return `  <header class="masthead">
    <a class="wordmark" href="${href(L.code, 'index')}"><img src="/assets/icon-180.png" alt="" width="34" height="34">Quillfox</a>
    <nav>${navLinks}</nav>
    <nav class="langs" aria-label="Language">
      ${langs}
    </nav>
  </header>
`;
}

function footer(L, page) {
  const links = [
    page !== 'index' ? `<a href="${href(L.code, 'index')}">${L.nav.home}</a>` : '',
    page !== 'privacy' ? `<a href="${href(L.code, 'privacy')}">${L.nav.policy}</a>` : '',
    page !== 'terms' ? `<a href="${href(L.code, 'terms')}">${L.nav.terms}</a>` : '',
    `<a href="mailto:contact@nghive.app">${L.foot.contact}</a>`,
    `<a href="https://nghive.app/" target="_blank" rel="noopener">${L.foot.by} &#8599;</a>`,
  ].filter(Boolean).join('\n      ');
  return `  <footer class="site">
    <span>© 2026 NG Hive LLC</span>
    <nav>
      ${links}
    </nav>
  </footer>

</div>
<script src="/lang.js"></script>
</body>
</html>
`;
}

function home(L) {
  const h = L.home;
  const ld = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Quillfox',
    operatingSystem: 'iOS, watchOS', applicationCategory: 'ProductivityApplication', url: url(L.code, 'index'),
    image: `${SITE}/assets/logo-800.jpg`, description: h.ogDesc, inLanguage: L.code,
    publisher: { '@type': 'Organization', name: 'NG Hive', url: 'https://nghive.app/' },
  })}</script>\n`;
  const nav = `<a href="#features">${L.nav.features}</a><a href="#watch">${L.nav.watch}</a><a href="${href(L.code, 'privacy')}">${L.nav.privacy}</a>`;
  const shotImg = ['live', 'transcript', 'recordings'];
  return head(L, 'index', h.title, h.desc, ld) + masthead(L, 'index', nav) + `
  <div class="hero">
    <div>
      <p class="eyebrow">${h.eyebrow}</p>
      <h1>${h.h1}</h1>
      <p class="lede">${h.lede}</p>
      <ul class="pills">${h.pills.map((p) => `<li>${p}</li>`).join('')}</ul>
      <span class="store" role="img" aria-label="${strip(h.soonSmall)} ${h.soonBig}">${APPLE}<span class="kv"><span class="small">${h.soonSmall}</span><span class="big">${h.soonBig}</span></span></span>
    </div>
    <div class="hero-art"><div class="logo-card"><img src="/assets/logo-800.jpg" alt="Quillfox: a fox in a blue coat writing with a feather quill while music notes drift past" width="800" height="800"></div></div>
  </div>

  <section id="screens">
    <div class="sec-head"><h2>${h.shotsH}</h2><p>${h.shotsP}</p></div>
    <div class="screens">
${h.shots.map((s, i) => `      <figure class="shot"><div class="frame"><img src="/assets/${shotImg[i]}.jpg" alt="${esc(s[0])}" width="520" height="1130" loading="lazy"></div><figcaption><b>${s[0]}</b>${s[1]}</figcaption></figure>`).join('\n')}
    </div>
    <p class="shots-note">${h.shotsNote}</p>
  </section>

  <section id="features">
    <div class="sec-head"><h2>${h.featH}</h2><p>${h.featP}</p></div>
    <div class="cards">
${h.feats.map((f) => `      <div class="card"><div class="ico">${icon(f[0])}</div><h3>${f[1]}</h3><p>${f[2]}</p></div>`).join('\n')}
    </div>
  </section>

  <section id="watch">
    <div class="split">
      <div>
        <h2 style="font-size:clamp(28px,3.6vw,38px)">${h.watchH}</h2>
        <p style="color:var(--muted);font-size:18px;margin:14px 0 0">${h.watchP}</p>
        <ol class="steps">${h.watchSteps.map((s) => `<li>${s}</li>`).join('')}</ol>
      </div>
      <div class="watchbox"><span class="btn"><i></i>Quillfox · ${h.watchBtn}</span><p>${h.watchNote}</p></div>
    </div>
  </section>

  <section id="privacy">
    <div class="privacy-band">
      <h2>${h.privH}</h2>
      <ul>${h.priv.map((p) => `<li>${p}</li>`).join('')}</ul>
      <a href="${href(L.code, 'privacy')}">${h.privLink} &rarr;</a>
    </div>
  </section>

  <section id="faq">
    <div class="sec-head"><h2>${h.faqH}</h2></div>
    <div class="faq">
${h.faq.map((f) => `      <details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('\n')}
    </div>
    <p class="shots-note">${h.needs}</p>
  </section>

` + footer(L, 'index');
}

function legal(L, page, D) {
  const nav = `<a href="${href(L.code, 'index')}">${L.nav.home}</a><a href="${href(L.code, page === 'privacy' ? 'terms' : 'privacy')}">${page === 'privacy' ? L.nav.terms : L.nav.policy}</a>`;
  const clauses = D.clauses.map((c, i) => {
    const [h, ps, ul, ps2] = c;
    const body = ps.map((p) => (p.startsWith('<div') ? p : `<p>${p}</p>`)).join('\n      ')
      + (ul ? `\n      <ul>${ul.map((x) => `<li>${x}</li>`).join('')}</ul>` : '')
      + (ps2 ? '\n      ' + ps2.map((p) => `<p>${p}</p>`).join('') : '');
    return `  <article class="clause">
    <div class="num">${i + 1}</div>
    <div>
      <h3>${h}</h3>
      ${body}
    </div>
  </article>
`;
  }).join('\n');
  return head(L, page, D.title, D.desc) + masthead(L, page, nav) + `
  <div class="narrow">
  <header class="doc">
    <p class="eyebrow">${D.eyebrow}</p>
    <h1>${D.h1}</h1>
    <p class="meta"><span>${D.effective}</span><span>NG Hive LLC</span><span>contact@nghive.app</span></p>
  </header>

  <div class="summary">
    <h2>${D.sumH}</h2>
    <ul>${D.sum.map((s) => `<li>${s}</li>`).join('')}</ul>
  </div>

${clauses}
  </div>

` + footer(L, page);
}

const urls = [];
for (const code of CODES) {
  const L = (await import(`./i18n/${code}.mjs`)).default;
  const dir = code === 'en' ? ROOT : path.join(ROOT, code);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), home(L));
  fs.writeFileSync(path.join(dir, 'privacy.html'), legal(L, 'privacy', L.pv));
  fs.writeFileSync(path.join(dir, 'terms.html'), legal(L, 'terms', L.tm));
  for (const p of Object.keys(PAGES)) urls.push(url(code, p));
}
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`);
console.log('built', urls.length, 'pages');

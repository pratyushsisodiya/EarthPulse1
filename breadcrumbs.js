(() => {
  'use strict';

  const pages = {
    '/planet-pulse.html': { label: 'Planet Pulse', url: '/planet-pulse.html' },
    '/planet-pulse-v2.html': { label: 'Planet Pulse 2.0', url: '/planet-pulse-v2.html' },
    '/data.html': { label: 'Data Atlas', url: '/data.html' },
    '/analytics.html': { label: 'Analytics', url: '/analytics.html' },
    '/mission.html': { label: 'Mission Control', url: '/mission.html' },
    '/earthquakes.html': { label: 'Earthquake Tracking', url: '/earthquakes.html' },
    '/space-weather.html': { label: 'Space Weather', url: '/space-weather.html' },
    '/air-quality.html': { label: 'Air Quality', url: '/air-quality.html' },
    '/whats-new.html': { label: "What's New", url: '/whats-new.html' },
    '/license.html': { label: 'License', url: '/license.html' },
    '/legal.html': { label: 'Legal', url: '/legal.html' },
    '/command-center.html': { label: 'Command Center', url: '/command-center.html' },
    '/premium.html': { label: 'Premium', url: '/premium.html' }
  };

  const build = (doc, path = location.pathname) => {
    const page = pages[path];
    if (!page || !doc.body) return;
    if (doc.getElementById('ep-breadcrumbs')) return;

    const style = doc.createElement('style');
    style.id = 'ep-breadcrumb-styles';
    style.textContent = `
      .ep-breadcrumbs{position:relative;z-index:40;display:flex;align-items:center;gap:7px;width:min(1380px,calc(100% - 32px));margin:10px auto 0;padding:8px 12px;border:1px solid rgba(148,163,184,.12);border-radius:10px;background:rgba(3,7,12,.5);backdrop-filter:blur(14px);color:#64748b;font:700 9px/1 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
      .ep-breadcrumbs a{color:#8ca0b3;text-decoration:none;transition:color .18s ease}.ep-breadcrumbs a:hover{color:#67e8f9}.ep-breadcrumbs .sep{color:#3f5263}.ep-breadcrumbs .current{color:#b9f3f7}
      @media(max-width:560px){.ep-breadcrumbs{width:calc(100% - 22px);font-size:8px;padding:7px 9px;overflow:auto;white-space:nowrap}}
    `;
    doc.head.appendChild(style);

    const nav = doc.querySelector('.nav,.bar,.top,.site-header');
    const crumb = doc.createElement('nav');
    crumb.id = 'ep-breadcrumbs';
    crumb.className = 'ep-breadcrumbs';
    crumb.setAttribute('aria-label', 'Breadcrumb');
    crumb.innerHTML = `<a href="/">EarthPulse</a><span class="sep">/</span><span class="current">${page.label}</span>`;
    if (nav && nav.parentNode) nav.parentNode.insertBefore(crumb, nav.nextSibling);
    else doc.body.insertBefore(crumb, doc.body.firstChild);

    const ld = doc.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'EarthPulse', item: 'https://earthpulse1.vercel.app/' },
        { '@type': 'ListItem', position: 2, name: page.label, item: `https://earthpulse1.vercel.app${page.url}` }
      ]
    });
    doc.head.appendChild(ld);
  };

  const run = () => {
    const iframe = document.querySelector('#site');
    if (iframe) {
      const inject = () => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          build(doc, new URL(doc.location.href).pathname);
        } catch (_) {}
      };
      iframe.addEventListener('load', inject, { once: false });
      inject();
      return;
    }
    build(document);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();

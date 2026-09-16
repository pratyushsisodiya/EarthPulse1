(() => {
  'use strict';

  // Preserve the existing interactive Planet Pulse overlay.
  if (!window.__EARTHPULSE_CORE_LOADED__) {
    window.__EARTHPULSE_CORE_LOADED__ = true;
    const core = document.createElement('script');
    core.src = '/globe-enhancer-core.js';
    core.async = false;
    document.head.appendChild(core);
  }

  const showPopup = (text) => {
    const message = document.getElementById('funnyMessage');
    const popup = document.getElementById('funnyPopup');
    if (message && popup) {
      message.textContent = text;
      popup.classList.add('open');
    }
  };

  const addStyle = () => {
    if (document.getElementById('earthpulse-ui-patch-style')) return;
    const style = document.createElement('style');
    style.id = 'earthpulse-ui-patch-style';
    style.textContent = `
      #dashboard{display:none!important}
      .ep-launchpad{max-width:1180px;margin:0 auto;padding:34px 22px 90px}
      .ep-launch-head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:18px}
      .ep-launch-head small{display:block;color:#67e8f9;font-size:9px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;margin-bottom:8px}
      .ep-launch-head h3{margin:0;font-size:clamp(24px,3.5vw,38px);letter-spacing:-.045em}
      .ep-launch-head p{margin:7px 0 0;color:#777;font-size:12px;line-height:1.5;max-width:580px}
      .ep-launch-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
      .ep-launch-card{position:relative;text-align:left;border:1px solid rgba(255,255,255,.08);border-radius:20px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018));color:#fff;padding:20px;min-height:150px;cursor:pointer;transition:.25s;overflow:hidden}
      .ep-launch-card:hover{transform:translateY(-5px);border-color:rgba(103,232,249,.3);box-shadow:0 25px 70px rgba(0,0,0,.3)}
      .ep-launch-card b{font-size:12px;letter-spacing:.08em}
      .ep-launch-card span{display:block;color:#777;font-size:10px;line-height:1.45;margin-top:8px}
      .ep-launch-card i{position:absolute;right:15px;bottom:14px;font-style:normal;font-size:18px;color:#4b5563}
      .ep-launch-card.primary{background:radial-gradient(circle at 85% 15%,rgba(103,232,249,.16),transparent 40%),linear-gradient(145deg,#0c1c24,#091014)}
      .ep-og-badge{display:inline-flex;align-items:center;gap:6px;margin-top:11px;padding:5px 8px;border-radius:999px;background:rgba(134,239,172,.07);border:1px solid rgba(134,239,172,.18);color:#86efac;font-size:8px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
      .ep-og-badge i{width:5px;height:5px;border-radius:50%;background:#86efac;box-shadow:0 0 10px #86efac}
      .ep-launcher-btn{border-color:rgba(103,232,249,.34)!important;box-shadow:0 0 30px rgba(103,232,249,.08)}
      @media(max-width:900px){.ep-launch-grid{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:560px){.ep-launchpad{padding:20px 16px 65px}.ep-launch-grid{grid-template-columns:1fr}.ep-launch-card{min-height:120px}.ep-launch-head{display:block}}
    `;
    document.head.appendChild(style);
  };

  const addFocusEggs = () => {
    const orb = document.querySelector('.hero-orb');
    if (!orb) return;
    if (orb.querySelector('.focus-project-pin')) return;

    const style = document.createElement('style');
    style.textContent = `
      .focus-project-pin{position:absolute;left:38%;top:61%;z-index:12;width:15px;height:15px;border:1px solid rgba(255,255,255,.9);border-radius:50%;background:#86efac;box-shadow:0 0 0 5px rgba(134,239,172,.10),0 0 24px rgba(134,239,172,.95);cursor:pointer;padding:0;animation:focusPulse 1.7s ease-out infinite}
      .focus-project-pin:hover{transform:scale(1.22)}
      .focus-project-label{position:absolute;left:38%;top:61%;transform:translate(14px,-8px);z-index:12;white-space:nowrap;pointer-events:none;font-size:8px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#b7ffd0;text-shadow:0 0 12px rgba(134,239,172,.75)}
      .focus-project-label span,.physics-label span{display:inline-block;padding:6px 8px;border-radius:9px;backdrop-filter:blur(8px)}
      .focus-project-label span{border:1px solid rgba(134,239,172,.18);background:rgba(3,12,8,.48)}
      .physics-pin{position:absolute;left:68%;top:43%;z-index:12;width:13px;height:13px;border:1px solid rgba(255,255,255,.9);border-radius:50%;background:#c084fc;box-shadow:0 0 0 4px rgba(192,132,252,.10),0 0 22px rgba(192,132,252,.95);cursor:pointer;padding:0;animation:physicsPulse 1.9s ease-out infinite}
      .physics-pin:hover{transform:scale(1.22)}
      .physics-label{position:absolute;left:68%;top:43%;transform:translate(12px,-7px);z-index:12;white-space:nowrap;pointer-events:none;font-size:7px;font-weight:900;letter-spacing:.10em;text-transform:uppercase;color:#e9d5ff;text-shadow:0 0 12px rgba(192,132,252,.8)}
      .physics-label span{border:1px solid rgba(192,132,252,.2);background:rgba(15,7,28,.52);padding:5px 7px}
      @keyframes focusPulse{0%{box-shadow:0 0 0 4px rgba(134,239,172,.18),0 0 18px rgba(134,239,172,.75)}70%{box-shadow:0 0 0 13px rgba(134,239,172,0),0 0 30px rgba(134,239,172,.95)}100%{box-shadow:0 0 0 4px rgba(134,239,172,0),0 0 18px rgba(134,239,172,.7)}}
      @keyframes physicsPulse{0%{box-shadow:0 0 0 4px rgba(192,132,252,.18),0 0 18px rgba(192,132,252,.75)}70%{box-shadow:0 0 0 13px rgba(192,132,252,0),0 0 30px rgba(192,132,252,.95)}100%{box-shadow:0 0 0 4px rgba(192,132,252,0),0 0 18px rgba(192,132,252,.7)}}
      @media(max-width:560px){.focus-project-pin{left:37%;top:60%;width:13px;height:13px}.focus-project-label{left:37%;top:60%;font-size:7px;transform:translate(11px,-7px)}.physics-pin{left:67%;top:42%;width:12px;height:12px}.physics-label{left:67%;top:42%;font-size:6px;transform:translate(10px,-6px)}}
    `;
    document.head.appendChild(style);

    const pin = document.createElement('button');
    pin.className = 'focus-project-pin';
    pin.type = 'button';
    pin.setAttribute('aria-label', 'Just focus on the project, bro');
    pin.title = 'Just focus on the project, bro.';

    const label = document.createElement('div');
    label.className = 'focus-project-label';
    label.innerHTML = '<span>JUST FOCUS ON THE PROJECT, BRO.</span>';
    pin.addEventListener('click', () => showPopup('Just focus on the project, bro. You found the reminder planet.'));

    const physicsPin = document.createElement('button');
    physicsPin.className = 'physics-pin';
    physicsPin.type = 'button';
    physicsPin.setAttribute('aria-label', 'Coulomb constant physics easter egg');
    physicsPin.title = 'k = 8.99 × 10⁹ N·m²/C²';

    const physicsLabel = document.createElement('div');
    physicsLabel.className = 'physics-label';
    physicsLabel.innerHTML = '<span>k = 8.99 × 10⁹ N·m²/C²</span>';
    physicsPin.addEventListener('click', () => showPopup('k = 8.99 × 10⁹ N·m²/C² — You should have attended your physics class.'));

    orb.appendChild(pin);orb.appendChild(label);orb.appendChild(physicsPin);orb.appendChild(physicsLabel);
  };

  const launchOriginalDashboard = () => {
    window.location.href = '/index.html.html';
  };

  const addLaunchpad = () => {
    if (document.querySelector('.ep-launchpad')) return;
    const latest = document.getElementById('latest');
    if (!latest) return;

    const wrap = document.createElement('section');
    wrap.className = 'ep-launchpad';
    wrap.innerHTML = `
      <div class="ep-launch-head">
        <div><small>EARTHPULSE LAUNCHPAD</small><h3>Choose where the signal goes.</h3><p>The original dashboard stays separate. Launch it only when you explicitly choose it.</p></div>
      </div>
      <div class="ep-launch-grid">
        <button class="ep-launch-card primary ep-launcher-btn" id="ep-og-launch"><b>ORIGINAL DASHBOARD</b><span>Open the classic EarthPulse intelligence workspace.</span><em class="ep-og-badge"><i></i>OG INSTRUMENT</em><i>↗</i></button>
        <button class="ep-launch-card" data-href="/planet-pulse.html"><b>PLANET PULSE</b><span>Launch the interactive planetary explorer.</span><i>↗</i></button>
        <button class="ep-launch-card" data-href="#latest"><b>EARTH INTELLIGENCE</b><span>Explore the feature cards and new planetary experiences.</span><i>↓</i></button>
        <button class="ep-launch-card" data-href="/mission.html"><b>MISSION</b><span>Open the EarthPulse mission and product story.</span><i>↗</i></button>
      </div>`;

    latest.insertAdjacentElement('afterend', wrap);
    document.getElementById('ep-og-launch').addEventListener('click', launchOriginalDashboard);
    wrap.querySelectorAll('[data-href]').forEach(btn => btn.addEventListener('click', () => {
      const href = btn.dataset.href;
      if (href.startsWith('#')) document.querySelector(href)?.scrollIntoView({behavior:'smooth'});
      else window.location.href = href;
    }));

    document.querySelectorAll('a[href="#dashboard"]').forEach(a => {
      a.removeAttribute('href');
      a.classList.add('ep-launcher-btn');
      a.addEventListener('click', launchOriginalDashboard);
      a.setAttribute('role','button');
      a.title = 'Launch Original Dashboard';
    });
  };

  const removeAutoDashboard = () => {
    const dashboard = document.getElementById('dashboard');
    if (dashboard) dashboard.remove();
  };

  const init = () => {
    addStyle();
    removeAutoDashboard();
    addFocusEggs();
    addLaunchpad();

    const explore = document.getElementById('explore');
    if (explore) explore.onclick = () => document.getElementById('latest')?.scrollIntoView({behavior:'smooth'});

    const planet = document.getElementById('planet');
    if (planet) planet.onclick = () => { window.location.href = '/planet-pulse.html'; };
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
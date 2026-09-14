(() => {
  'use strict';
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

  const addFocusEgg = () => {
    const orb = document.querySelector('.hero-orb');
    if (!orb || orb.querySelector('.focus-project-pin')) return;

    const style = document.createElement('style');
    style.textContent = `
      .focus-project-pin{position:absolute;left:38%;top:61%;z-index:12;width:15px;height:15px;border:1px solid rgba(255,255,255,.9);border-radius:50%;background:#86efac;box-shadow:0 0 0 5px rgba(134,239,172,.10),0 0 24px rgba(134,239,172,.95);cursor:pointer;padding:0;animation:focusPulse 1.7s ease-out infinite}
      .focus-project-pin:hover{transform:scale(1.22)}
      .focus-project-label{position:absolute;left:38%;top:61%;transform:translate(14px,-8px);z-index:12;white-space:nowrap;pointer-events:none;font-size:8px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#b7ffd0;text-shadow:0 0 12px rgba(134,239,172,.75)}
      .focus-project-label span{display:inline-block;padding:6px 8px;border:1px solid rgba(134,239,172,.18);border-radius:9px;background:rgba(3,12,8,.48);backdrop-filter:blur(8px)}
      .physics-pin{position:absolute;left:68%;top:43%;z-index:12;width:13px;height:13px;border:1px solid rgba(255,255,255,.9);border-radius:50%;background:#c084fc;box-shadow:0 0 0 4px rgba(192,132,252,.10),0 0 22px rgba(192,132,252,.95);cursor:pointer;padding:0;animation:physicsPulse 1.9s ease-out infinite}
      .physics-pin:hover{transform:scale(1.22)}
      .physics-label{position:absolute;left:68%;top:43%;transform:translate(12px,-7px);z-index:12;white-space:nowrap;pointer-events:none;font-size:7px;font-weight:900;letter-spacing:.10em;text-transform:uppercase;color:#e9d5ff;text-shadow:0 0 12px rgba(192,132,252,.8)}
      .physics-label span{display:inline-block;padding:5px 7px;border:1px solid rgba(192,132,252,.2);border-radius:8px;background:rgba(15,7,28,.52);backdrop-filter:blur(8px)}
      @keyframes focusPulse{0%{box-shadow:0 0 0 4px rgba(134,239,172,.18),0 0 18px rgba(134,239,172,.75)}70%{box-shadow:0 0 0 13px rgba(134,239,172,0),0 0 30px rgba(134,239,172,.95)}100%{box-shadow:0 0 0 4px rgba(134,239,172,0),0 0 18px rgba(134,239,172,.7)}}
      @keyframes physicsPulse{0%{box-shadow:0 0 0 4px rgba(192,132,252,.18),0 0 18px rgba(192,132,252,.75)}70%{box-shadow:0 0 0 13px rgba(192,132,252,0),0 0 30px rgba(192,132,252,.95)}100%{box-shadow:0 0 0 4px rgba(192,132,252,0),0 0 18px rgba(192,132,252,.7)}}
      @media(max-width:560px){
        .focus-project-pin{left:37%;top:60%;width:13px;height:13px}.focus-project-label{left:37%;top:60%;font-size:7px;transform:translate(11px,-7px)}
        .physics-pin{left:67%;top:42%;width:12px;height:12px}.physics-label{left:67%;top:42%;font-size:6px;transform:translate(10px,-6px)}
      }
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

    orb.appendChild(pin);
    orb.appendChild(label);
    orb.appendChild(physicsPin);
    orb.appendChild(physicsLabel);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addFocusEgg, {once:true});
  else addFocusEgg();
})();
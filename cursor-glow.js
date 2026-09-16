(() => {
  'use strict';

  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.__EARTHPULSE_CURSOR_GLOW__) return;
  window.__EARTHPULSE_CURSOR_GLOW__ = true;

  const glow = document.createElement('div');
  glow.id = 'earthpulse-cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  glow.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: 190px;
    height: 190px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 2147483647;
    opacity: 0;
    transform: translate3d(-50%, -50%, 0);
    background: radial-gradient(circle, rgba(140,240,242,.18) 0%, rgba(140,240,242,.08) 25%, rgba(189,140,255,.045) 46%, transparent 72%);
    filter: blur(12px);
    mix-blend-mode: screen;
    transition: width .22s ease, height .22s ease, opacity .2s ease;
    will-change: transform, width, height;
  `;
  document.body.appendChild(glow);

  let targetX = innerWidth / 2;
  let targetY = innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let active = false;

  const move = (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    active = true;
    glow.style.opacity = '1';
  };

  const leave = () => {
    active = false;
    glow.style.opacity = '0';
  };

  const hoverIn = () => {
    glow.style.width = '250px';
    glow.style.height = '250px';
  };

  const hoverOut = () => {
    glow.style.width = '190px';
    glow.style.height = '190px';
  };

  addEventListener('mousemove', move, { passive: true });
  addEventListener('mouseleave', leave, { passive: true });

  const bindInteractive = (root = document) => {
    root.querySelectorAll('a, button, input, select, textarea, .feature-card, .command, .tool').forEach((el) => {
      if (el.dataset.epGlowBound === '1') return;
      el.dataset.epGlowBound = '1';
      el.addEventListener('mouseenter', hoverIn, { passive: true });
      el.addEventListener('mouseleave', hoverOut, { passive: true });
    });
  };

  bindInteractive();
  new MutationObserver(() => bindInteractive()).observe(document.body, { childList: true, subtree: true });

  const frame = () => {
    currentX += (targetX - currentX) * 0.13;
    currentY += (targetY - currentY) * 0.13;
    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    requestAnimationFrame(frame);
  };
  frame();
})();
(() => {
  'use strict';
  if (window.__EARTHPULSE_GLOBE_READY__) return;
  window.__EARTHPULSE_GLOBE_READY__ = true;

  const EVENTS = [
    {name:'Pacific Seismic Watch', type:'Seismic', lat:35.6, lon:140.1, color:'#fb7185'},
    {name:'Atlantic Storm Corridor', type:'Storm', lat:27.2, lon:-58.4, color:'#f59e0b'},
    {name:'Himalayan Climate Watch', type:'Climate', lat:28.2, lon:86.9, color:'#67e8f9'},
    {name:'North India Heat Watch', type:'Climate', lat:25.2, lon:82.7, color:'#67e8f9'},
    {name:'Mediterranean Weather Zone', type:'Storm', lat:38.2, lon:18.7, color:'#f59e0b'},
    {name:'Southern Ocean Watch', type:'Climate', lat:-49.5, lon:73.0, color:'#67e8f9'},
    {name:'Solar Connection Point', type:'Solar', lat:0, lon:-105, color:'#c084fc'}
  ];

  const style = document.createElement('style');
  style.textContent = `
    #ep-overlay{position:fixed;inset:0;z-index:2147483000;display:none;background:radial-gradient(circle at 50% 42%,#08243a 0,#020617 60%,#01030a 100%);color:#e2e8f0;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
    #ep-overlay.open{display:block}
    #ep-stage{position:absolute;inset:14px;border:1px solid rgba(103,232,249,.2);border-radius:26px;overflow:hidden;background:radial-gradient(circle at 42% 42%,rgba(14,165,233,.09),rgba(2,6,23,.94) 62%);box-shadow:0 30px 120px rgba(0,0,0,.6)}
    #ep-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab}
    #ep-canvas.drag{cursor:grabbing}
    .ep-glass{background:rgba(2,6,23,.72);border:1px solid rgba(148,163,184,.15);box-shadow:0 10px 35px rgba(0,0,0,.28);backdrop-filter:blur(16px)}
    #ep-top{position:absolute;top:16px;left:16px;right:16px;z-index:5;display:flex;align-items:center;gap:10px;pointer-events:none}
    #ep-brand{padding:10px 13px;border-radius:14px;display:flex;gap:10px;align-items:center}
    #ep-dot{width:9px;height:9px;border-radius:50%;background:#67e8f9;box-shadow:0 0 16px #67e8f9;flex:none}
    #ep-title{font-size:12px;font-weight:950;letter-spacing:.14em}#ep-sub{font-size:8px;color:#64748b;letter-spacing:.12em;margin-top:2px}
    #ep-live{padding:9px 11px;border-radius:12px;font-size:9px;font-weight:900;color:#86efac;letter-spacing:.1em}#ep-live i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 10px #22c55e;margin-right:6px}
    #ep-close{margin-left:auto;pointer-events:auto;border:1px solid rgba(148,163,184,.2);background:rgba(15,23,42,.85);color:#fff;border-radius:11px;padding:9px 12px;cursor:pointer;font-weight:900}
    #ep-side{position:absolute;top:78px;right:16px;bottom:16px;width:285px;z-index:5;display:flex;flex-direction:column;gap:9px;pointer-events:none}
    .ep-card{border-radius:16px;padding:13px;pointer-events:auto}.ep-card h3{font-size:9px;letter-spacing:.13em;color:#94a3b8;margin:0 0 8px}
    .ep-stat{display:flex;justify-content:space-between;padding:7px 0;border-top:1px solid rgba(148,163,184,.09);font-size:10px}.ep-stat:first-of-type{border-top:0}.ep-val{font-weight:900;color:#bae6fd}
    #ep-events{overflow:auto;max-height:240px}.ep-event{padding:9px 0;border-top:1px solid rgba(148,163,184,.08);cursor:pointer}.ep-event:first-child{border-top:0}.ep-event:hover b{color:#67e8f9}.ep-event b{font-size:10px}.ep-event span{display:block;color:#64748b;font-size:8px;margin-top:3px}
    #ep-mission{margin-top:auto}.ep-copy{font-size:9px;color:#94a3b8;line-height:1.5;margin:0 0 9px}.ep-actions{display:flex;gap:6px;flex-wrap:wrap}.ep-btn{border:1px solid rgba(148,163,184,.2);background:rgba(15,23,42,.86);color:#cbd5e1;border-radius:9px;padding:7px 9px;font-size:9px;font-weight:850;cursor:pointer}.ep-btn:hover{border-color:rgba(103,232,249,.45);color:#fff}.ep-primary{background:rgba(8,145,178,.16);border-color:rgba(34,211,238,.3);color:#a5f3fc}
    #ep-bottom{position:absolute;left:16px;bottom:16px;z-index:5;display:flex;gap:6px;align-items:center}.ep-help{padding:8px 10px;border-radius:11px;font-size:8px;color:#64748b}
    #ep-toast{position:absolute;left:50%;bottom:22px;transform:translate(-50%,16px);opacity:0;transition:.2s;z-index:20;background:rgba(15,23,42,.95);border:1px solid rgba(103,232,249,.28);border-radius:11px;padding:9px 12px;font-size:9px;font-weight:850;pointer-events:none}.show{opacity:1!important;transform:translate(-50%,0)!important}
    @media(max-width:800px){#ep-side{left:10px;right:10px;width:auto;top:auto;height:43%;bottom:10px;display:block;overflow:auto}.ep-card{margin-bottom:7px}#ep-events{max-height:125px}#ep-help{display:none}#ep-bottom{left:10px;bottom:10px}#ep-live{display:none}#ep-stage{inset:8px;border-radius:20px}#ep-top{top:9px;left:9px;right:9px}}
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'ep-overlay';
  overlay.innerHTML = `
    <div id="ep-stage">
      <canvas id="ep-canvas"></canvas>
      <div id="ep-top">
        <div id="ep-brand" class="ep-glass"><span id="ep-dot"></span><div><div id="ep-title">EARTHPULSE · PLANET PULSE</div><div id="ep-sub">EARTH INTELLIGENCE EXPLORER</div></div></div>
        <div id="ep-live" class="ep-glass"><i></i>INTERACTIVE VIEW</div>
        <button id="ep-close">✕</button>
      </div>
      <aside id="ep-side">
        <section class="ep-card ep-glass"><h3>PLANET STATUS</h3><div class="ep-stat"><span>Tracked events</span><span class="ep-val" id="ep-count">07</span></div><div class="ep-stat"><span>Explorer mode</span><span class="ep-val">3D</span></div><div class="ep-stat"><span>Data label</span><span class="ep-val">DEMO</span></div></section>
        <section class="ep-card ep-glass"><h3>EVENT RADAR · DEMO DATA</h3><div id="ep-events"></div></section>
        <section id="ep-mission" class="ep-card ep-glass"><h3>MISSION MODE</h3><p id="ep-mission-copy" class="ep-copy">Select a mission target, rotate Earth and click the highlighted marker.</p><div class="ep-actions"><button id="ep-start" class="ep-btn ep-primary">▶ Start mission</button><button id="ep-random" class="ep-btn">✦ Random</button></div></section>
      </aside>
      <div id="ep-bottom"><div class="ep-help ep-glass">Drag · Wheel / pinch · Double-click reset</div><button id="ep-auto" class="ep-btn ep-glass">⟳ Auto</button><button id="ep-reset" class="ep-btn ep-glass">Reset</button></div>
      <div id="ep-toast"></div>
    </div>`;
  document.body.appendChild(overlay);

  const canvas = document.getElementById('ep-canvas');
  const ctx = canvas.getContext('2d');
  let w=0,h=0,dpr=1,cx=0,cy=0,r=0,rotY=0.35,rotX=0.12,zoom=1,auto=false,drag=false,lastX=0,lastY=0,mission=-1;
  let raf=0;

  function resize(){
    const rect=canvas.getBoundingClientRect(); dpr=Math.min(window.devicePixelRatio||1,2); w=rect.width; h=rect.height; cx=w*.43; cy=h*.52; r=Math.min(w*.34,h*.38)*zoom; canvas.width=Math.max(1,Math.floor(w*dpr)); canvas.height=Math.max(1,Math.floor(h*dpr)); ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function project(lat,lon){
    const la=lat*Math.PI/180, lo=lon*Math.PI/180+rotY;
    const x0=Math.cos(la)*Math.sin(lo), y0=Math.sin(la), z0=Math.cos(la)*Math.cos(lo);
    const x=x0*Math.cos(rotX)-y0*Math.sin(rotX), y=x0*Math.sin(rotX)+y0*Math.cos(rotX);
    return {x:cx+r*x,y:cy-r*y,z:z0};
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    const glow=ctx.createRadialGradient(cx-r*.18,cy-r*.2,r*.08,cx,cy,r*1.18); glow.addColorStop(0,'#38bdf8'); glow.addColorStop(.55,'#075985'); glow.addColorStop(1,'#020617');
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=glow;ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
    for(let lat=-60;lat<=60;lat+=30){const pts=[];for(let lon=-180;lon<=180;lon+=4)pts.push(project(lat,lon));ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle='rgba(125,211,252,.10)';ctx.lineWidth=1;ctx.stroke();}
    for(let lon=-150;lon<=180;lon+=30){const pts=[];for(let lat=-90;lat<=90;lat+=4)pts.push(project(lat,lon));ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle='rgba(125,211,252,.08)';ctx.lineWidth=1;ctx.stroke();}
    ctx.restore();

    EVENTS.forEach((e,i)=>{const p=project(e.lat,e.lon);const visible=p.z>-0.15;if(!visible)return;const rr=i===mission?7:4.5;ctx.beginPath();ctx.arc(p.x,p.y,rr,0,Math.PI*2);ctx.fillStyle=e.color;ctx.shadowColor=e.color;ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;if(i===mission){ctx.beginPath();ctx.arc(p.x,p.y,rr+8+Math.sin(Date.now()/260)*2,0,Math.PI*2);ctx.strokeStyle=e.color;ctx.globalAlpha=.5;ctx.stroke();ctx.globalAlpha=1;}});
    const halo=ctx.createRadialGradient(cx,cy,r*.76,cx,cy,r*1.08);halo.addColorStop(0,'rgba(103,232,249,0)');halo.addColorStop(1,'rgba(56,189,248,.18)');ctx.beginPath();ctx.arc(cx,cy,r*1.02,0,Math.PI*2);ctx.fillStyle=halo;ctx.fill();
  }

  function frame(){ if(!overlay.classList.contains('open')){cancelAnimationFrame(raf);return;} if(auto&&!drag)rotY+=.0035;draw();raf=requestAnimationFrame(frame); }
  function toast(msg){const el=document.getElementById('ep-toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1800);}
  function focusEvent(i){mission=-1;const e=EVENTS[i];rotY=-e.lon*Math.PI/180;rotX=e.lat*Math.PI/180;toast(e.name+' · '+e.type+' · demo target');}
  function randomEvent(){focusEvent(Math.floor(Math.random()*EVENTS.length));}
  function startMission(){mission=Math.floor(Math.random()*EVENTS.length);const e=EVENTS[mission];rotY=-e.lon*Math.PI/180;rotX=e.lat*Math.PI/180;document.getElementById('ep-mission-copy').textContent='Find the highlighted '+e.type.toLowerCase()+' marker and click it.';toast('Mission target selected');}
  function hit(x,y){let best=-1,bd=24;EVENTS.forEach((e,i)=>{const p=project(e.lat,e.lon);if(p.z<=-0.15)return;const d=Math.hypot(p.x-x,p.y-y);if(d<bd){bd=d;best=i;}});if(best<0)return; if(mission===best){toast('Mission complete · +100 XP');mission=-1;document.getElementById('ep-mission-copy').textContent='Mission complete. Start another mission or inspect an event.';}else focusEvent(best);}

  function open(){overlay.classList.add('open');resize();cancelAnimationFrame(raf);frame();}
  function close(){overlay.classList.remove('open');auto=false;mission=-1;}
  window.EarthPulseOpenGlobe=open;
  window.EarthPulseCloseGlobe=close;

  function pointerPos(ev){const rect=canvas.getBoundingClientRect();return {x:ev.clientX-rect.left,y:ev.clientY-rect.top};}
  canvas.addEventListener('pointerdown',e=>{drag=true;canvas.classList.add('drag');canvas.setPointerCapture(e.pointerId);lastX=e.clientX;lastY=e.clientY;});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;rotY+=(e.clientX-lastX)*.006;rotX+=(e.clientY-lastY)*.004;rotX=Math.max(-1.35,Math.min(1.35,rotX));lastX=e.clientX;lastY=e.clientY;});
  canvas.addEventListener('pointerup',e=>{drag=false;canvas.classList.remove('drag');try{canvas.releasePointerCapture(e.pointerId);}catch(_){}});
  canvas.addEventListener('pointercancel',()=>{drag=false;canvas.classList.remove('drag');});
  canvas.addEventListener('click',e=>{const p=pointerPos(e);hit(p.x,p.y);});
  canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.72,Math.min(1.45,zoom*(e.deltaY>0?.92:1.08)));resize();},{passive:false});
  canvas.addEventListener('dblclick',()=>{rotY=.35;rotX=.12;zoom=1;resize();toast('Globe reset');});
  window.addEventListener('resize',()=>{if(overlay.classList.contains('open')){resize();draw();}});
  document.getElementById('ep-close').onclick=close;
  document.getElementById('ep-auto').onclick=()=>{auto=!auto;toast(auto?'Auto rotation on':'Auto rotation off');};
  document.getElementById('ep-reset').onclick=()=>{rotY=.35;rotX=.12;zoom=1;resize();toast('Globe reset');};
  document.getElementById('ep-start').onclick=startMission;
  document.getElementById('ep-random').onclick=randomEvent;
  const list=document.getElementById('ep-events');
  list.innerHTML=EVENTS.map((e,i)=>`<div class="ep-event" data-i="${i}"><b>${e.name}</b><span>${e.type} · ${e.lat.toFixed(1)}°, ${e.lon.toFixed(1)}°</span></div>`).join('');
  list.querySelectorAll('.ep-event').forEach(el=>el.onclick=()=>focusEvent(Number(el.dataset.i)));
  document.getElementById('ep-count').textContent=String(EVENTS.length).padStart(2,'0');
  resize();
})();
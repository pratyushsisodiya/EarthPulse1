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
    #ep-overlay{position:fixed;inset:0;z-index:2147483000;display:none;background:radial-gradient(circle at 42% 38%,#0b3049 0,#020617 48%,#01030a 100%);color:#e2e8f0;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
    #ep-overlay.open{display:block}
    #ep-stage{position:absolute;inset:12px;border:1px solid rgba(125,211,252,.18);border-radius:30px;overflow:hidden;background:radial-gradient(circle at 38% 43%,rgba(14,165,233,.12),rgba(2,6,23,.92) 58%);box-shadow:0 35px 140px rgba(0,0,0,.72)}
    #ep-stage:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,.035),transparent 28%,transparent 72%,rgba(103,232,249,.025))}
    #ep-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab;opacity:0;pointer-events:none}
    #ep-real-earth{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab;z-index:2}
    #ep-real-earth.drag{cursor:grabbing}
    #ep-real-earth.loading{opacity:.35;transition:opacity .4s}
    #ep-canvas.drag{cursor:grabbing}
    .ep-glass{background:rgba(2,6,23,.62);border:1px solid rgba(148,163,184,.14);box-shadow:0 14px 45px rgba(0,0,0,.30);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
    #ep-top{position:absolute;top:18px;left:18px;right:18px;z-index:5;display:flex;align-items:center;gap:10px;pointer-events:none}
    #ep-brand{padding:11px 14px;border-radius:15px;display:flex;gap:10px;align-items:center}
    #ep-dot{width:9px;height:9px;border-radius:50%;background:#67e8f9;box-shadow:0 0 18px #67e8f9;flex:none}
    #ep-title{font-size:12px;font-weight:950;letter-spacing:.14em}#ep-sub{font-size:8px;color:#64748b;letter-spacing:.13em;margin-top:3px}
    #ep-live{padding:9px 11px;border-radius:12px;font-size:9px;font-weight:900;color:#86efac;letter-spacing:.1em}#ep-live i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 10px #22c55e;margin-right:6px}
    #ep-close{margin-left:auto;pointer-events:auto;border:1px solid rgba(148,163,184,.18);background:rgba(15,23,42,.78);color:#fff;border-radius:12px;padding:10px 13px;cursor:pointer;font-weight:900;transition:.2s}
    #ep-close:hover{border-color:rgba(103,232,249,.45);transform:translateY(-1px)}
    #ep-side{position:absolute;top:84px;right:18px;bottom:18px;width:330px;z-index:5;display:flex;flex-direction:column;gap:10px;pointer-events:none}
    .ep-card{border-radius:19px;padding:15px;pointer-events:auto}.ep-card h3{font-size:9px;letter-spacing:.16em;color:#a5b4c8;margin:0 0 9px}
    .ep-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.ep-live-chip{font-size:7px;letter-spacing:.1em;color:#86efac;border:1px solid rgba(134,239,172,.2);background:rgba(34,197,94,.06);border-radius:999px;padding:5px 7px}.ep-live-chip i{display:inline-block;width:5px;height:5px;border-radius:50%;background:#22c55e;box-shadow:0 0 9px #22c55e;margin-right:5px}
    .ep-meter{height:4px;border-radius:999px;background:rgba(148,163,184,.10);overflow:hidden;margin-top:9px}.ep-meter i{display:block;height:100%;width:72%;border-radius:inherit;background:linear-gradient(90deg,#22d3ee,#67e8f9);box-shadow:0 0 12px rgba(103,232,249,.6)}
    .ep-section-label{font-size:7px;color:#475569;letter-spacing:.12em;margin:12px 0 5px}
    .ep-card .ep-kicker{font-size:8px;color:#475569;letter-spacing:.09em;margin:-4px 0 8px}
    .ep-stat{display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid rgba(148,163,184,.08);font-size:10px}.ep-stat:first-of-type{border-top:0}.ep-val{font-weight:900;color:#bae6fd}
    #ep-events{overflow:auto;max-height:205px;padding-right:3px;scrollbar-width:thin}
    .ep-event{position:relative;padding:10px 9px 10px 18px;border:1px solid transparent;border-radius:12px;cursor:pointer;transition:.18s}.ep-event:before{content:"";position:absolute;left:7px;top:15px;width:5px;height:5px;border-radius:50%;background:#67e8f9;box-shadow:0 0 9px #67e8f9}.ep-event + .ep-event{margin-top:2px}.ep-event:hover{background:rgba(103,232,249,.06);border-color:rgba(103,232,249,.14);transform:translateX(2px)}.ep-event:hover b{color:#67e8f9}.ep-event b{font-size:10px}.ep-event span{display:block;color:#64748b;font-size:8px;margin-top:3px}
    #ep-mission{margin-top:auto}.ep-copy{font-size:9px;color:#94a3b8;line-height:1.55;margin:0 0 10px}.ep-actions{display:flex;gap:7px;flex-wrap:wrap}.ep-btn{border:1px solid rgba(148,163,184,.18);background:rgba(15,23,42,.78);color:#cbd5e1;border-radius:10px;padding:8px 10px;font-size:9px;font-weight:850;cursor:pointer;transition:.18s}.ep-btn:hover{border-color:rgba(103,232,249,.45);color:#fff;transform:translateY(-1px)}.ep-primary{background:linear-gradient(135deg,rgba(8,145,178,.24),rgba(14,116,144,.08));border-color:rgba(34,211,238,.3);color:#a5f3fc}
    #ep-legend{position:absolute;left:20px;bottom:68px;z-index:5;padding:12px 14px;border-radius:15px;font-size:8px;color:#94a3b8}
    .ep-legend-title{font-size:7px;letter-spacing:.13em;color:#64748b;margin-bottom:8px}.ep-legend-row{display:flex;gap:9px;align-items:center}.ep-legend-row + .ep-legend-row{margin-top:6px}.ep-key{width:7px;height:7px;border-radius:50%;box-shadow:0 0 10px currentColor}
    #ep-orbit{position:absolute;left:50%;top:50%;width:58%;height:72%;z-index:1;transform:translate(-50%,-50%);border:1px solid rgba(103,232,249,.07);border-radius:50%;pointer-events:none;z-index:1}
    #ep-orbit:before,#ep-orbit:after{content:"";position:absolute;inset:9%;border:1px solid rgba(103,232,249,.045);border-radius:50%;transform:rotate(22deg)}
    #ep-orbit:after{transform:rotate(-22deg)}
    #ep-controls{position:absolute;left:20px;bottom:18px;z-index:5;display:flex;gap:7px;align-items:center}
    .ep-help{padding:9px 11px;border-radius:11px;font-size:8px;color:#64748b}
    #ep-zoom{display:flex;overflow:hidden;border-radius:11px}.ep-zoom button{border:0;border-right:1px solid rgba(148,163,184,.12);background:rgba(15,23,42,.82);color:#cbd5e1;width:34px;height:32px;cursor:pointer;font-weight:900}.ep-zoom button:last-child{border-right:0}.ep-zoom button:hover{background:rgba(103,232,249,.1);color:#fff}
    #ep-toast{position:absolute;left:50%;bottom:24px;transform:translate(-50%,16px);opacity:0;transition:.2s;z-index:20;background:rgba(15,23,42,.96);border:1px solid rgba(103,232,249,.28);border-radius:12px;padding:10px 14px;font-size:9px;font-weight:850;pointer-events:none;box-shadow:0 15px 45px rgba(0,0,0,.4)}.show{opacity:1!important;transform:translate(-50%,0)!important}
    @media(max-width:1100px){#ep-side{width:290px}#ep-legend{left:14px}}
    @media(max-width:900px){#ep-side{width:280px}#ep-legend{display:none}}
    @media(max-width:800px){#ep-side{left:10px;right:10px;width:auto;top:auto;height:39%;bottom:10px;display:block;overflow:auto}.ep-card{margin-bottom:7px}#ep-events{max-height:115px}#ep-controls{left:10px;bottom:10px}#ep-help{display:none}#ep-live{display:none}#ep-stage{inset:7px;border-radius:21px}#ep-top{top:9px;left:9px;right:9px}#ep-legend{display:none}}
    @media(max-width:520px){#ep-title{font-size:10px}#ep-sub{font-size:7px}#ep-brand{padding:9px 10px}#ep-side{height:42%}#ep-controls{bottom:8px}.ep-btn{padding:7px 8px}}
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'ep-overlay';
  overlay.innerHTML = `
    <div id="ep-stage">
      <canvas id="ep-canvas"></canvas><canvas id="ep-real-earth" aria-label="Interactive realistic Earth globe"></canvas><div id="ep-orbit"></div>
      <div id="ep-top">
        <div id="ep-brand" class="ep-glass"><span id="ep-dot"></span><div><div id="ep-title">EARTHPULSE · PLANET PULSE</div><div id="ep-sub">EARTH INTELLIGENCE EXPLORER</div></div></div>
        <div id="ep-live" class="ep-glass"><i></i>INTERACTIVE VIEW</div>
        <button id="ep-close">✕</button>
      </div>
      <aside id="ep-side">
        <section class="ep-card ep-glass"><div class="ep-card-head"><h3>PLANET STATUS</h3><span class="ep-live-chip"><i></i>EXPLORER</span></div><div class="ep-kicker">EARTHPULSE VISUAL TELEMETRY</div><div class="ep-stat"><span>Tracked event points</span><span class="ep-val" id="ep-count">07</span></div><div class="ep-stat"><span>View mode</span><span class="ep-val">3D ORBIT</span></div><div class="ep-stat"><span>Dataset</span><span class="ep-val">DEMO</span></div><div class="ep-meter"><i></i></div></section>
        <section class="ep-card ep-glass"><div class="ep-card-head"><h3>EVENT RADAR</h3><span class="ep-live-chip">DEMO DATA</span></div><div class="ep-section-label">SELECT A TARGET TO FOCUS THE GLOBE</div><div id="ep-events"></div></section>
        <section id="ep-mission" class="ep-card ep-glass"><div class="ep-card-head"><h3>MISSION MODE</h3><span class="ep-live-chip">INTERACTIVE</span></div><p id="ep-mission-copy" class="ep-copy">Select a mission target, rotate Earth and click the highlighted marker.</p><div class="ep-actions"><button id="ep-start" class="ep-btn ep-primary">▶ Start mission</button><button id="ep-random" class="ep-btn">✦ Random</button></div></section>
      </aside>
      <div id="ep-legend" class="ep-glass">
        <div class="ep-legend-row"><i class="ep-key" style="color:#fb7185;background:#fb7185"></i> Seismic</div>
        <div class="ep-legend-row"><i class="ep-key" style="color:#f59e0b;background:#f59e0b"></i> Storm</div>
        <div class="ep-legend-row"><i class="ep-key" style="color:#67e8f9;background:#67e8f9"></i> Climate</div>
        <div class="ep-legend-row"><i class="ep-key" style="color:#c084fc;background:#c084fc"></i> Solar</div>
      </div>
      <div id="ep-controls"><div class="ep-help ep-glass">Drag · scroll/pinch · double-click reset</div><div id="ep-zoom" class="ep-glass"><button id="ep-zoom-out" aria-label="Zoom out">−</button><button id="ep-zoom-in" aria-label="Zoom in">+</button></div><button id="ep-auto" class="ep-btn ep-glass">⟳ Auto</button><button id="ep-reset" class="ep-btn ep-glass">Reset</button></div>
      <div id="ep-toast"></div>
    </div>`;
  document.body.appendChild(overlay);

  // Real textured Earth renderer. Uses Three.js + NASA-style Earth texture maps;
  // the existing canvas remains as a safe fallback if WebGL/CDN loading fails.
  const realCanvas = document.getElementById('ep-real-earth');
  realCanvas.classList.add('loading');

  async function initRealEarth(){
    try{
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
      const {OrbitControls} = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js');
      const renderer = new THREE.WebGLRenderer({canvas:realCanvas,alpha:true,antialias:true,powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setSize(realCanvas.clientWidth,realCanvas.clientHeight,false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35,1,.1,100);
      camera.position.set(0,0,3.05);

      const controls = new OrbitControls(camera,realCanvas);
      controls.enableDamping = true;
      controls.dampingFactor = .045;
      controls.enablePan = false;
      controls.minDistance = 2.05;
      controls.maxDistance = 4.8;
      controls.autoRotate = false;
      controls.autoRotateSpeed = .45;

      const group = new THREE.Group();
      scene.add(group);

      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('anonymous');
      const base = 'https://threejs.org/examples/textures/planets/';
      const [earthMap,normalMap,specularMap,cloudMap] = await Promise.all([
        loader.loadAsync(base+'earth_atmos_2048.jpg'),
        loader.loadAsync(base+'earth_normal_2048.jpg'),
        loader.loadAsync(base+'earth_specular_2048.jpg'),
        loader.loadAsync(base+'earth_clouds_1024.png')
      ]);
      earthMap.colorSpace = THREE.SRGBColorSpace;
      cloudMap.colorSpace = THREE.SRGBColorSpace;

      const earth = new THREE.Mesh(
        new THREE.SphereGeometry(1,128,128),
        new THREE.MeshPhongMaterial({
          map:earthMap,
          normalMap,
          normalScale:new THREE.Vector2(.75,.75),
          specularMap,
          specular:new THREE.Color(0x5f87a8),
          shininess:18
        })
      );
      group.add(earth);

      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(1.012,96,96),
        new THREE.MeshPhongMaterial({map:cloudMap,transparent:true,depthWrite:false,opacity:.58})
      );
      group.add(clouds);

      const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.055,96,96),
        new THREE.ShaderMaterial({
          transparent:true,
          side:THREE.BackSide,
          blending:THREE.AdditiveBlending,
          vertexShader:`varying vec3 vNormal; void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
          fragmentShader:`varying vec3 vNormal; void main(){float rim=pow(1.0-max(dot(vNormal,vec3(0.0,0.0,1.0)),0.0),3.0);gl_FragColor=vec4(0.16,0.72,1.0,rim*.48);}`
        })
      );
      group.add(atmosphere);

      const ambient = new THREE.AmbientLight(0x557799,1.15);
      scene.add(ambient);
      const sun = new THREE.DirectionalLight(0xffffff,2.6);
      sun.position.set(4,2,5);
      scene.add(sun);
      const rim = new THREE.DirectionalLight(0x2aa8ff,.45);
      rim.position.set(-4,-1,-3);
      scene.add(rim);

      function size(){
        const w=realCanvas.clientWidth||window.innerWidth;
        const h=realCanvas.clientHeight||window.innerHeight;
        renderer.setSize(w,h,false);
        camera.aspect=w/h;
        camera.updateProjectionMatrix();
      }
      size();
      window.addEventListener('resize',size);

      window.__EARTHPULSE_REAL_EARTH__ = {renderer,scene,camera,controls,group,earth,clouds};
      realCanvas.classList.remove('loading');

      function render(){
        if(!overlay.classList.contains('open')) return;
        controls.update();
        earth.rotation.y += .00055;
        clouds.rotation.y += .00072;
        renderer.render(scene,camera);
        requestAnimationFrame(render);
      }
      render();
    }catch(err){
      console.warn('EarthPulse realistic globe unavailable; using fallback globe.',err);
      realCanvas.style.display='none';
      document.getElementById('ep-canvas').style.opacity='1';
      document.getElementById('ep-canvas').style.pointerEvents='auto';
    }
  }
  initRealEarth();

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
    const bg=ctx.createRadialGradient(cx-r*.15,cy-r*.22,r*.05,cx,cy,r*1.18); bg.addColorStop(0,'#164e72'); bg.addColorStop(.48,'#075985'); bg.addColorStop(.78,'#06324e'); bg.addColorStop(1,'#020617');
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=bg;ctx.fill();
    // Atmospheric rim and night-side shading.
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
    const shade=ctx.createLinearGradient(cx-r*.9,cy,cx+r*.95,cy); shade.addColorStop(0,'rgba(0,0,0,.52)'); shade.addColorStop(.42,'rgba(0,0,0,.05)'); shade.addColorStop(.7,'rgba(0,0,0,.0)'); shade.addColorStop(1,'rgba(0,0,0,.38)');
    ctx.fillStyle=shade;ctx.fillRect(cx-r,cy-r,r*2,r*2);
    ctx.restore();
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
    for(let lat=-60;lat<=60;lat+=30){const pts=[];for(let lon=-180;lon<=180;lon+=4)pts.push(project(lat,lon));ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle='rgba(125,211,252,.10)';ctx.lineWidth=1;ctx.stroke();}
    for(let lon=-150;lon<=180;lon+=30){const pts=[];for(let lat=-90;lat<=90;lat+=4)pts.push(project(lat,lon));ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle='rgba(125,211,252,.08)';ctx.lineWidth=1;ctx.stroke();}
    ctx.restore();
    // Subtle latitude glow and equatorial ring for a more dimensional globe.
    ctx.beginPath();ctx.ellipse(cx,cy+r*.02,r*.98,r*.20,rotX*.22,0,Math.PI*2);ctx.strokeStyle='rgba(103,232,249,.10)';ctx.lineWidth=1.2;ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,r*1.025,0,Math.PI*2);ctx.strokeStyle='rgba(103,232,249,.20)';ctx.lineWidth=1.5;ctx.shadowColor='#38bdf8';ctx.shadowBlur=18;ctx.stroke();ctx.shadowBlur=0;

    EVENTS.forEach((e,i)=>{const p=project(e.lat,e.lon);const visible=p.z>-0.15;if(!visible)return;const rr=i===mission?7:4.5;ctx.beginPath();ctx.arc(p.x,p.y,rr,0,Math.PI*2);ctx.fillStyle=e.color;ctx.shadowColor=e.color;ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;if(i===mission){ctx.beginPath();ctx.arc(p.x,p.y,rr+8+Math.sin(Date.now()/260)*2,0,Math.PI*2);ctx.strokeStyle=e.color;ctx.globalAlpha=.5;ctx.stroke();ctx.globalAlpha=1;}});
    const halo=ctx.createRadialGradient(cx,cy,r*.78,cx,cy,r*1.12);halo.addColorStop(0,'rgba(103,232,249,0)');halo.addColorStop(.78,'rgba(56,189,248,.05)');halo.addColorStop(1,'rgba(56,189,248,.22)');ctx.beginPath();ctx.arc(cx,cy,r*1.02,0,Math.PI*2);ctx.fillStyle=halo;ctx.fill();
  }

  function frame(){ if(!overlay.classList.contains('open')){cancelAnimationFrame(raf);return;} if(auto&&!drag)rotY+=.0035;draw();raf=requestAnimationFrame(frame); }
  function toast(msg){const el=document.getElementById('ep-toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1800);}
  function focusEvent(i){mission=-1;const e=EVENTS[i];rotY=-e.lon*Math.PI/180;rotX=e.lat*Math.PI/180;toast(e.name+' · '+e.type+' · demo target');}
  function randomEvent(){focusEvent(Math.floor(Math.random()*EVENTS.length));}
  function startMission(){mission=Math.floor(Math.random()*EVENTS.length);const e=EVENTS[mission];rotY=-e.lon*Math.PI/180;rotX=e.lat*Math.PI/180;document.getElementById('ep-mission-copy').textContent='Find the highlighted '+e.type.toLowerCase()+' marker and click it.';toast('Mission target selected');}
  function hit(x,y){let best=-1,bd=24;EVENTS.forEach((e,i)=>{const p=project(e.lat,e.lon);if(p.z<=-0.15)return;const d=Math.hypot(p.x-x,p.y-y);if(d<bd){bd=d;best=i;}});if(best<0)return; if(mission===best){toast('Mission complete · +100 XP');mission=-1;document.getElementById('ep-mission-copy').textContent='Mission complete. Start another mission or inspect an event.';}else focusEvent(best);}

  function open(){overlay.classList.add('open');resize();cancelAnimationFrame(raf);frame();const real=window.__EARTHPULSE_REAL_EARTH__;if(real){real.controls.enabled=true;}}
  function close(){overlay.classList.remove('open');auto=false;mission=-1;const real=window.__EARTHPULSE_REAL_EARTH__;if(real)real.controls.enabled=false;}
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
  document.getElementById('ep-zoom-in').onclick=()=>{zoom=Math.min(1.45,zoom*1.12);resize();toast('Zoom +');};
  document.getElementById('ep-zoom-out').onclick=()=>{zoom=Math.max(.72,zoom*.89);resize();toast('Zoom −')};
  document.getElementById('ep-reset').onclick=()=>{rotY=.35;rotX=.12;zoom=1;resize();toast('Globe reset');};
  document.getElementById('ep-start').onclick=startMission;
  document.getElementById('ep-random').onclick=randomEvent;
  const list=document.getElementById('ep-events');
  list.innerHTML=EVENTS.map((e,i)=>`<div class="ep-event" data-i="${i}"><b>${e.name}</b><span>${e.type} · ${e.lat.toFixed(1)}°, ${e.lon.toFixed(1)}°</span></div>`).join('');
  list.querySelectorAll('.ep-event').forEach(el=>el.onclick=()=>focusEvent(Number(el.dataset.i)));
  document.getElementById('ep-count').textContent=String(EVENTS.length).padStart(2,'0');
  resize();
})();
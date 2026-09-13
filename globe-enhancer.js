(() => {
  'use strict';
  if (window.__EARTHPULSE_GLOBE_PRO__) return;
  window.__EARTHPULSE_GLOBE_PRO__ = true;

  const STYLE = `
  #ep-globe-overlay{position:fixed;inset:0;z-index:99999;display:none;background:radial-gradient(circle at 50% 40%,rgba(8,47,73,.58),rgba(1,5,16,.98) 66%);backdrop-filter:blur(14px);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#e2e8f0}
  #ep-globe-overlay.open{display:block}
  #ep-globe-stage{position:absolute;inset:18px;overflow:hidden;border:1px solid rgba(56,189,248,.24);border-radius:28px;background:radial-gradient(circle at 50% 45%,rgba(14,165,233,.08),rgba(2,6,23,.88) 62%);box-shadow:0 30px 120px rgba(0,0,0,.62)}
  #ep-globe-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab}
  #ep-globe-canvas.dragging{cursor:grabbing}
  .ep-glass{background:rgba(2,6,23,.76);border:1px solid rgba(148,163,184,.16);box-shadow:0 12px 35px rgba(0,0,0,.28);backdrop-filter:blur(14px)}
  #ep-globe-top{position:absolute;top:18px;left:18px;right:18px;z-index:5;display:flex;align-items:center;gap:12px;pointer-events:none}
  #ep-globe-brand{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:15px}
  #ep-globe-brand-dot{width:10px;height:10px;border-radius:50%;background:#22d3ee;box-shadow:0 0 18px #22d3ee}
  #ep-globe-title{font-size:13px;font-weight:950;letter-spacing:.14em;color:#e0f2fe}
  #ep-globe-sub{font-size:9px;color:#64748b;letter-spacing:.12em;margin-top:2px}
  #ep-globe-live{padding:9px 12px;border-radius:14px;color:#86efac;font-size:10px;font-weight:900;letter-spacing:.1em}
  #ep-globe-live span{display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 10px #22c55e;margin-right:7px;animation:epPulse 1.5s infinite}
  @keyframes epPulse{50%{opacity:.25;transform:scale(.72)}}
  #ep-globe-close{margin-left:auto;pointer-events:auto;border:1px solid rgba(148,163,184,.2);background:rgba(15,23,42,.82);color:#e2e8f0;border-radius:12px;padding:9px 12px;cursor:pointer;font-weight:850}
  #ep-globe-side{position:absolute;top:88px;right:18px;bottom:18px;width:286px;z-index:5;display:flex;flex-direction:column;gap:10px;pointer-events:none}
  .ep-card{border-radius:17px;padding:14px;pointer-events:auto}
  .ep-card h3{margin:0 0 9px;font-size:10px;letter-spacing:.13em;color:#94a3b8}
  .ep-stat{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-top:1px solid rgba(148,163,184,.09);font-size:11px}.ep-stat:first-of-type{border-top:0;padding-top:0}.ep-value{font-weight:900;color:#bae6fd}
  #ep-event-list{max-height:225px;overflow:auto}
  .ep-event{padding:9px 0;border-top:1px solid rgba(148,163,184,.09);cursor:pointer}.ep-event:first-child{border-top:0}.ep-event:hover .ep-event-name{color:#67e8f9}.ep-event-name{font-size:11px;font-weight:850}.ep-event-meta{font-size:9px;color:#64748b;margin-top:3px}
  #ep-mission{margin-top:auto}
  #ep-mission-title{font-size:12px;font-weight:900;color:#f8fafc;margin-bottom:5px}.ep-mission-copy{font-size:9px;color:#94a3b8;line-height:1.5;margin-bottom:9px}
  .ep-row{display:flex;gap:7px;flex-wrap:wrap}
  .ep-btn{border:1px solid rgba(148,163,184,.18);background:rgba(15,23,42,.86);color:#cbd5e1;border-radius:10px;padding:8px 10px;cursor:pointer;font-size:10px;font-weight:850}.ep-btn:hover{border-color:rgba(56,189,248,.55);color:white}.ep-btn.accent{background:rgba(8,145,178,.16);border-color:rgba(34,211,238,.28);color:#a5f3fc}
  #ep-globe-bottom{position:absolute;left:18px;bottom:18px;z-index:5;display:flex;gap:7px;align-items:center}
  #ep-globe-help{padding:9px 11px;border-radius:12px;color:#64748b;font-size:9px}
  #ep-globe-toast{position:absolute;left:50%;bottom:22px;transform:translate(-50%,22px);opacity:0;pointer-events:none;z-index:10;background:rgba(15,23,42,.94);border:1px solid rgba(56,189,248,.28);padding:10px 14px;border-radius:12px;font-size:10px;font-weight:850;transition:.22s;box-shadow:0 16px 45px rgba(0,0,0,.45)}
  #ep-globe-toast.show{opacity:1;transform:translate(-50%,0)}
  #ep-legend{display:flex;gap:10px;flex-wrap:wrap;margin-top:7px}.ep-leg{font-size:8px;color:#64748b;display:flex;align-items:center;gap:4px}.ep-leg i{width:6px;height:6px;border-radius:50%;display:inline-block}
  @media(max-width:920px){#ep-globe-stage{inset:9px;border-radius:20px}#ep-globe-side{width:235px;right:10px;top:78px;bottom:10px}.ep-card{padding:11px}#ep-globe-top{top:10px;left:10px;right:10px}#ep-globe-bottom{left:10px;bottom:10px}}
  @media(max-width:680px){#ep-globe-side{left:10px;right:10px;width:auto;bottom:auto;top:auto;height:43%;display:block;overflow:auto}.ep-card{margin-bottom:7px}#ep-event-list{max-height:120px}#ep-globe-help{display:none}#ep-globe-bottom{right:10px;justify-content:flex-start}#ep-globe-live{display:none}}
  `;
  const style=document.createElement('style');style.textContent=STYLE;document.head.appendChild(style);

  const overlay=document.createElement('div');
  overlay.id='ep-globe-overlay';
  overlay.innerHTML=`
    <div id="ep-globe-stage">
      <canvas id="ep-globe-canvas"></canvas>
      <div id="ep-globe-top">
        <div id="ep-globe-brand" class="ep-glass"><span id="ep-globe-brand-dot"></span><div><div id="ep-globe-title">EARTHPULSE · PLANET PULSE</div><div id="ep-globe-sub">EARTH INTELLIGENCE EXPLORER</div></div></div>
        <div id="ep-globe-live" class="ep-glass"><span></span>LIVE VIEW</div>
        <button id="ep-globe-close" aria-label="Close globe">✕</button>
      </div>
      <aside id="ep-globe-side">
        <section class="ep-card ep-glass">
          <h3>PLANET STATUS</h3>
          <div class="ep-stat"><span>Tracked events</span><span class="ep-value" id="ep-stat-events">07</span></div>
          <div class="ep-stat"><span>Regions</span><span class="ep-value">07</span></div>
          <div class="ep-stat"><span>Globe mode</span><span class="ep-value">3D</span></div>
          <div id="ep-legend"><span class="ep-leg"><i style="background:#fb7185"></i>Seismic</span><span class="ep-leg"><i style="background:#f59e0b"></i>Storm</span><span class="ep-leg"><i style="background:#67e8f9"></i>Climate</span><span class="ep-leg"><i style="background:#c084fc"></i>Solar</span></div>
        </section>
        <section class="ep-card ep-glass">
          <h3>EVENT RADAR · DEMO DATA</h3>
          <div id="ep-event-list"></div>
        </section>
        <section id="ep-mission" class="ep-card ep-glass">
          <div id="ep-mission-title">MISSION MODE</div>
          <div id="ep-mission-copy" class="ep-mission-copy">Locate the highlighted hotspot. Rotate the planet and click its marker.</div>
          <div class="ep-row"><button class="ep-btn accent" id="ep-mission-start">▶ Start mission</button><button class="ep-btn" id="ep-random">✦ Random event</button></div>
        </section>
      </aside>
      <div id="ep-globe-bottom"><div id="ep-globe-help" class="ep-glass">Drag to rotate · Wheel / pinch to zoom · Double-click to reset</div><button class="ep-btn ep-glass" id="ep-auto">⟳ Auto</button><button class="ep-btn ep-glass" id="ep-reset">Reset</button><button class="ep-btn ep-glass" id="ep-live">⚡ Live Earth</button></div>
      <div id="ep-globe-toast"></div>
    </div>`;
  document.body.appendChild(overlay);

  let THREE=null,scene=null,camera=null,renderer=null,earth=null,atmosphere=null,starField=null,markerGroup=null,raycaster=null,pointer=null;
  let initialized=false,raf=0,auto=false,drag=false,lastX=0,lastY=0,yaw=.35,pitch=.14,distance=3.05,targetDistance=3.05,pinchStart=0,missionIndex=-1;

  const events=[
    {name:'Pacific Seismic Watch',type:'Seismic',lat:35.6,lon:140.1,color:0xfb7185,detail:'Example seismic monitoring target near Japan.'},
    {name:'Atlantic Storm Corridor',type:'Storm',lat:27.2,lon:-58.4,color:0xf59e0b,detail:'Example storm-monitoring target in the Atlantic.'},
    {name:'Himalayan Climate Watch',type:'Climate',lat:28.2,lon:86.9,color:0x67e8f9,detail:'Example climate-monitoring region.'},
    {name:'North India Heat Watch',type:'Climate',lat:25.2,lon:82.7,color:0x67e8f9,detail:'Example heat-monitoring region.'},
    {name:'Mediterranean Weather Zone',type:'Storm',lat:38.2,lon:18.7,color:0xf59e0b,detail:'Example weather-monitoring target.'},
    {name:'Southern Ocean Watch',type:'Climate',lat:-49.5,lon:73.0,color:0x67e8f9,detail:'Example ocean-climate monitoring region.'},
    {name:'Solar Connection Point',type:'Solar',lat:0,lon:-105,color:0xc084fc,detail:'Space-weather visualization target.'}
  ];

  function loadThree(){return new Promise((resolve,reject)=>{if(window.THREE)return resolve(window.THREE);const s=document.createElement('script');s.src='https://unpkg.com/three@0.160.0/build/three.min.js';s.onload=()=>window.THREE?resolve(window.THREE):reject(new Error('THREE failed'));s.onerror=()=>reject(new Error('THREE load failed'));document.head.appendChild(s)});}
  function latLon(lat,lon,r){const a=lat*Math.PI/180,b=lon*Math.PI/180;return new THREE.Vector3(r*Math.cos(a)*Math.cos(b),r*Math.sin(a),r*Math.cos(a)*Math.sin(b));}
  function toast(msg){const el=document.getElementById('ep-globe-toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),2200)}
  function init(){
    if(initialized)return;initialized=true;
    const canvas=document.getElementById('ep-globe-canvas');
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(40,1,.1,100);scene.add(new THREE.AmbientLight(0x9ed7ff,1.25));const sun=new THREE.DirectionalLight(0xffffff,2.4);sun.position.set(4,3,5);scene.add(sun);
    earth=new THREE.Mesh(new THREE.SphereGeometry(1,96,64),new THREE.MeshStandardMaterial({color:0x12658b,roughness:.74,metalness:.03,emissive:0x031725,emissiveIntensity:.75}));scene.add(earth);
    const wire=new THREE.Mesh(new THREE.SphereGeometry(1.004,48,32),new THREE.MeshBasicMaterial({color:0x38bdf8,wireframe:true,transparent:true,opacity:.05}));scene.add(wire);
    atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.085,64,48),new THREE.MeshBasicMaterial({color:0x38bdf8,transparent:true,opacity:.11,side:THREE.BackSide}));scene.add(atmosphere);
    const sg=new THREE.BufferGeometry(),pos=[];for(let i=0;i<1400;i++){const r=5+Math.random()*10,a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1);pos.push(r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a))}sg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));starField=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:.022,transparent:true,opacity:.72}));scene.add(starField);
    markerGroup=new THREE.Group();scene.add(markerGroup);raycaster=new THREE.Raycaster();pointer=new THREE.Vector2();buildMarkers();renderEvents();resize();animate();
  }
  function buildMarkers(){markerGroup.clear();events.forEach((ev,i)=>{const g=new THREE.Group();const core=new THREE.Mesh(new THREE.SphereGeometry(.026,16,10),new THREE.MeshBasicMaterial({color:ev.color}));const halo=new THREE.Mesh(new THREE.RingGeometry(.036,.06,24),new THREE.MeshBasicMaterial({color:ev.color,transparent:true,opacity:.5,side:THREE.DoubleSide}));halo.rotation.x=Math.PI/2;g.add(core,halo);g.position.copy(latLon(ev.lat,ev.lon,1.045));g.userData={index:i,event:ev};markerGroup.add(g)});}
  function renderEvents(){const list=document.getElementById('ep-event-list');list.innerHTML=events.map((e,i)=>`<div class="ep-event" data-i="${i}"><div class="ep-event-name">${e.name}</div><div class="ep-event-meta">${e.type} · ${e.lat.toFixed(1)}°, ${e.lon.toFixed(1)}°</div></div>`).join('');list.querySelectorAll('.ep-event').forEach(el=>el.addEventListener('click',()=>focusEvent(Number(el.dataset.i))));document.getElementById('ep-stat-events').textContent=String(events.length).padStart(2,'0');}
  function focusEvent(i){const e=events[i];yaw=e.lon*Math.PI/180;pitch=e.lat*Math.PI/180*.55;targetDistance=2.45;toast(`${e.name} · ${e.detail}`);}
  function randomEvent(){focusEvent(Math.floor(Math.random()*events.length));}
  function startMission(){missionIndex=Math.floor(Math.random()*events.length);focusEvent(missionIndex);document.getElementById('ep-mission-copy').textContent='Find the glowing marker and click it. Hint: '+events[missionIndex].type;toast('Mission target selected');}
  function reset(){yaw=.35;pitch=.14;targetDistance=3.05;missionIndex=-1;toast('Globe view reset');}
  function zoom(delta){targetDistance=Math.max(1.55,Math.min(6.2,targetDistance+delta));}
  function resize(){if(!renderer||!camera)return;const rect=document.getElementById('ep-globe-stage').getBoundingClientRect();renderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();}
  function animate(){raf=requestAnimationFrame(animate);if(auto)yaw+=.00135;distance+=(targetDistance-distance)*.1;camera.position.set(distance*Math.cos(pitch)*Math.sin(yaw),distance*Math.sin(pitch),distance*Math.cos(pitch)*Math.cos(yaw));camera.lookAt(0,0,0);atmosphere.rotation.y-=.00025;starField.rotation.y+=.00005;markerGroup.children.forEach((m)=>{m.lookAt(camera.position);const pulse=1+Math.sin(performance.now()*.004+m.userData.index)*.13;m.scale.setScalar(pulse)});renderer.render(scene,camera);}
  function pick(e){const c=document.getElementById('ep-globe-canvas'),rect=c.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(markerGroup.children,true);if(!hits.length)return;let obj=hits[0].object;while(obj.parent&&obj.userData.index===undefined)obj=obj.parent;if(obj.userData&&obj.userData.index!==undefined){if(missionIndex===obj.userData.index){toast('MISSION COMPLETE · +100 XP');missionIndex=-1;document.getElementById('ep-mission-copy').textContent='Target acquired. Start another mission to keep exploring.'}else focusEvent(obj.userData.index);}}
  function bind(){
    const c=document.getElementById('ep-globe-canvas'),state={};
    c.addEventListener('pointerdown',e=>{state.drag=true;state.moved=false;state.x=e.clientX;state.y=e.clientY;c.classList.add('dragging');c.setPointerCapture?.(e.pointerId)});
    c.addEventListener('pointermove',e=>{if(!state.drag)return;if(Math.abs(e.clientX-state.x)+Math.abs(e.clientY-state.y)>6)state.moved=true;yaw-=(e.clientX-state.x)*.006;pitch+=(e.clientY-state.y)*.006;pitch=Math.max(-1.35,Math.min(1.35,pitch));state.x=e.clientX;state.y=e.clientY});
    c.addEventListener('pointerup',e=>{if(state.drag&&!state.moved)pick(e);state.drag=false;c.classList.remove('dragging')});c.addEventListener('pointercancel',()=>{state.drag=false;c.classList.remove('dragging')});
    c.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?.22:-.22)},{passive:false});c.addEventListener('dblclick',reset);
    c.addEventListener('touchstart',e=>{if(e.touches.length===2)state.pinch=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)},{passive:true});
    c.addEventListener('touchmove',e=>{if(e.touches.length===2&&state.pinch){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);zoom((state.pinch-d)*.006);state.pinch=d}},{passive:true});
    document.getElementById('ep-globe-close').onclick=close;document.getElementById('ep-auto').onclick=()=>{auto=!auto;document.getElementById('ep-auto').textContent=auto?'⏸ Stop':'⟳ Auto'};document.getElementById('ep-reset').onclick=reset;document.getElementById('ep-random').onclick=randomEvent;document.getElementById('ep-mission-start').onclick=startMission;document.getElementById('ep-live').onclick=()=>{auto=!auto;document.getElementById('ep-auto').textContent=auto?'⏸ Stop':'⟳ Auto';toast(auto?'Planet Pulse immersive mode enabled':'Immersive mode stopped');};window.addEventListener('resize',resize,{passive:true});
  }
  function close(){overlay.classList.remove('open');auto=false;document.body.style.overflow='';}
  async function open(){overlay.classList.add('open');document.body.style.overflow='hidden';try{THREE=await loadThree();init();resize();}catch(err){console.error('EarthPulse globe:',err);document.getElementById('ep-globe-live').textContent='RENDERER ERROR';toast('3D renderer could not start in this browser');}}

  bind();window.EarthPulseOpenGlobe=open;window.addEventListener('earthpulse:open-globe',open);
})();

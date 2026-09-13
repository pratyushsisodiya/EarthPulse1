(() => {
  'use strict';
  if (window.__EARTHPULSE_GLOBE_ENHANCER__) return;
  window.__EARTHPULSE_GLOBE_ENHANCER__ = true;

  const css = `
  #ep-globe-overlay{position:fixed;inset:0;z-index:1000;display:none;background:radial-gradient(circle at 50% 45%,rgba(14,116,144,.14),rgba(2,6,23,.97) 62%);backdrop-filter:blur(8px)}
  #ep-globe-overlay.open{display:block}
  #ep-globe-stage{position:absolute;inset:72px 24px 24px;border:1px solid rgba(56,189,248,.25);border-radius:24px;background:radial-gradient(circle at 50% 45%,rgba(14,165,233,.10),rgba(2,6,23,.8) 58%);overflow:hidden;box-shadow:0 30px 100px rgba(0,0,0,.55)}
  #ep-globe-canvas{width:100%;height:100%;touch-action:none;cursor:grab;display:block}
  #ep-globe-canvas.dragging{cursor:grabbing}
  #ep-globe-head{position:absolute;top:18px;left:24px;right:24px;z-index:3;display:flex;align-items:center;gap:10px;pointer-events:none}
  #ep-globe-title{font-size:14px;font-weight:900;letter-spacing:.12em;color:#e0f2fe;text-shadow:0 2px 15px #000}
  #ep-globe-sub{font-size:10px;color:#94a3b8;letter-spacing:.08em}
  #ep-globe-close{margin-left:auto;pointer-events:auto;border:1px solid rgba(148,163,184,.2);background:rgba(15,23,42,.8);color:#e2e8f0;border-radius:10px;padding:8px 11px;cursor:pointer;font-weight:800}
  #ep-globe-controls{position:absolute;right:22px;bottom:22px;z-index:4;display:flex;gap:7px;align-items:center}
  .ep-gbtn{border:1px solid rgba(148,163,184,.2);background:rgba(15,23,42,.9);color:#cbd5e1;border-radius:10px;padding:8px 10px;cursor:pointer;font-size:11px;font-weight:800}.ep-gbtn:hover{border-color:rgba(56,189,248,.55);color:#fff}
  #ep-globe-help{position:absolute;left:22px;bottom:24px;z-index:3;color:#64748b;font-size:10px;pointer-events:none}
  #ep-globe-status{position:absolute;top:66px;left:24px;z-index:3;color:#86efac;font-size:10px;font-weight:800;letter-spacing:.05em}
  @media(max-width:640px){#ep-globe-stage{inset:64px 8px 8px;border-radius:16px}#ep-globe-head{left:14px;right:14px;top:12px}#ep-globe-controls{right:12px;bottom:12px}.ep-gbtn{padding:7px 8px}#ep-globe-help{left:14px;bottom:16px}}
  `;
  const style=document.createElement('style'); style.textContent=css; document.head.appendChild(style);

  const overlay=document.createElement('div'); overlay.id='ep-globe-overlay'; overlay.innerHTML=`
    <div id="ep-globe-stage">
      <div id="ep-globe-head"><div><div id="ep-globe-title">EARTHPULSE · 3D EARTH</div><div id="ep-globe-sub">INTERACTIVE GLOBE VIEW</div></div><button id="ep-globe-close" aria-label="Close globe">✕ Close</button></div>
      <div id="ep-globe-status">● INTERACTIVE · DRAG TO ROTATE · WHEEL TO ZOOM</div>
      <canvas id="ep-globe-canvas"></canvas>
      <div id="ep-globe-help">Drag • Wheel / pinch • Double-click to reset</div>
      <div id="ep-globe-controls"><button class="ep-gbtn" id="ep-g-minus">−</button><button class="ep-gbtn" id="ep-g-reset">Reset</button><button class="ep-gbtn" id="ep-g-plus">+</button><button class="ep-gbtn" id="ep-g-auto">Auto</button></div>
    </div>`;
  document.body.appendChild(overlay);

  let THREE, scene, camera, renderer, globe, grid, stars, raf=0, initialized=false, auto=false;
  let yaw=.45,pitch=.12,distance=3.15,targetDistance=3.15,drag=false,lastX=0,lastY=0,pinchStart=0;

  function loadThree(){
    return new Promise((resolve,reject)=>{
      if(window.THREE){resolve(window.THREE);return;}
      const s=document.createElement('script');s.src='https://unpkg.com/three@0.160.0/build/three.min.js';s.onload=()=>resolve(window.THREE);s.onerror=reject;document.head.appendChild(s);
    });
  }
  function init(){
    if(initialized)return; initialized=true;
    const canvas=document.getElementById('ep-globe-canvas');
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    scene=new THREE.Scene();
    camera=new THREE.PerspectiveCamera(42,1,.1,100);
    scene.add(new THREE.AmbientLight(0x8bbfff,1.4));
    const sun=new THREE.DirectionalLight(0xffffff,2.1);sun.position.set(4,3,5);scene.add(sun);

    globe=new THREE.Mesh(new THREE.SphereGeometry(1,96,64),new THREE.MeshStandardMaterial({color:0x1261a0,roughness:.78,metalness:.04,emissive:0x03182c,emissiveIntensity:.8}));
    scene.add(globe);
    grid=new THREE.Group();
    for(let lat=-75;lat<=75;lat+=15){const r=Math.cos(lat*Math.PI/180),y=Math.sin(lat*Math.PI/180);const pts=[];for(let i=0;i<=128;i++){const a=i/128*Math.PI*2;pts.push(new THREE.Vector3(r*Math.cos(a),y,r*Math.sin(a)))}const g=new THREE.BufferGeometry().setFromPoints(pts);grid.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:0x48bfe8,transparent:true,opacity:.16})))}
    for(let lon=0;lon<180;lon+=15){const pts=[];const a=lon*Math.PI/180;for(let i=0;i<=128;i++){const t=i/128*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*Math.cos(t),Math.sin(t),Math.sin(a)*Math.cos(t)))}const g=new THREE.BufferGeometry().setFromPoints(pts);grid.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:0x48bfe8,transparent:true,opacity:.13})))}
    scene.add(grid);
    const sg=new THREE.BufferGeometry(), pos=[];for(let i=0;i<1000;i++){const r=5+Math.random()*8,a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1);pos.push(r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a))}sg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:.025,transparent:true,opacity:.7}));scene.add(stars);
    addMarkers(); resize(); animate();
  }
  function addMarkers(){
    const markers=[
      [20,78,'INDIA'],[38,-97,'USA'],[51,0,'EUROPE'],[-23,-58,'SOUTH AMERICA'],[35,139,'JAPAN'],[-33,151,'AUSTRALIA'],[0,25,'AFRICA']
    ];
    markers.forEach(([lat,lon,label])=>{const p=latLon(lat,lon,1.035);const m=new THREE.Mesh(new THREE.SphereGeometry(.018,12,8),new THREE.MeshBasicMaterial({color:0x67e8f9}));m.position.copy(p);m.userData.label=label;scene.add(m);});
  }
  function latLon(lat,lon,r){const la=lat*Math.PI/180,lo=lon*Math.PI/180;return new THREE.Vector3(r*Math.cos(la)*Math.cos(lo),r*Math.sin(la),r*Math.cos(la)*Math.sin(lo))}
  function resize(){if(!renderer||!camera)return;const rect=document.getElementById('ep-globe-stage').getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix()}
  function animate(){raf=requestAnimationFrame(animate);if(auto)yaw+=.0018;distance+=(targetDistance-distance)*.12;camera.position.set(distance*Math.cos(pitch)*Math.sin(yaw),distance*Math.sin(pitch),distance*Math.cos(pitch)*Math.cos(yaw));camera.lookAt(0,0,0);renderer.render(scene,camera)}
  function reset(){yaw=.45;pitch=.12;targetDistance=3.15}
  function zoom(delta){targetDistance=Math.max(1.65,Math.min(6,targetDistance+delta))}

  function bind(){
    const c=document.getElementById('ep-globe-canvas');
    c.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;c.classList.add('dragging');c.setPointerCapture?.(e.pointerId)},{passive:true});
    c.addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-lastX)*.006;pitch+=(e.clientY-lastY)*.006;pitch=Math.max(-1.35,Math.min(1.35,pitch));lastX=e.clientX;lastY=e.clientY},{passive:true});
    ['pointerup','pointercancel','pointerleave'].forEach(t=>c.addEventListener(t,()=>{drag=false;c.classList.remove('dragging')},{passive:true}));
    c.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?.22:-.22)},{passive:false});
    c.addEventListener('dblclick',reset);
    let touchA=null,touchB=null;
    c.addEventListener('touchstart',e=>{if(e.touches.length===2){touchA=e.touches[0];touchB=e.touches[1];pinchStart=Math.hypot(touchA.clientX-touchB.clientX,touchA.clientY-touchB.clientY)}},{passive:true});
    c.addEventListener('touchmove',e=>{if(e.touches.length===2&&pinchStart){const a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);zoom((pinchStart-d)*.006);pinchStart=d}},{passive:true});
    document.getElementById('ep-g-minus').onclick=()=>zoom(.35);document.getElementById('ep-g-plus').onclick=()=>zoom(-.35);document.getElementById('ep-g-reset').onclick=reset;document.getElementById('ep-g-auto').onclick=e=>{auto=!auto;e.currentTarget.textContent=auto?'Stop':'Auto'};
    document.getElementById('ep-globe-close').onclick=close;
    window.addEventListener('resize',resize,{passive:true});
  }
  function close(){overlay.classList.remove('open');auto=false;document.body.style.overflow=''}
  async function open(){overlay.classList.add('open');document.body.style.overflow='hidden';try{THREE=await loadThree();init();resize()}catch(e){document.getElementById('ep-globe-status').textContent='● WebGL unavailable in this browser'}}
  bind();
  window.EarthPulseOpenGlobe=open;
  window.addEventListener('earthpulse:open-globe',open);
})();

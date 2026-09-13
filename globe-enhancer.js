(() => {
  'use strict';
  if (window.__EARTHPULSE_GLOBE_ENHANCER__) return;
  window.__EARTHPULSE_GLOBE_ENHANCER__ = true;

  const css = `
  #ep-globe-overlay{position:fixed;inset:0;z-index:99999;display:none;background:radial-gradient(circle at 50% 45%,rgba(14,116,144,.18),rgba(2,6,23,.98) 68%);backdrop-filter:blur(8px)}
  #ep-globe-overlay.open{display:block}
  #ep-globe-stage{position:absolute;inset:70px 20px 20px;border:1px solid rgba(56,189,248,.28);border-radius:24px;background:radial-gradient(circle at 50% 42%,rgba(14,165,233,.12),rgba(2,6,23,.94) 62%);overflow:hidden;box-shadow:0 30px 100px rgba(0,0,0,.65)}
  #ep-globe-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab}
  #ep-globe-canvas.dragging{cursor:grabbing}
  #ep-globe-head{position:absolute;top:16px;left:22px;right:22px;z-index:4;display:flex;align-items:center;pointer-events:none}
  #ep-globe-title{font-size:14px;font-weight:900;letter-spacing:.12em;color:#e0f2fe;text-shadow:0 2px 15px #000}
  #ep-globe-sub{font-size:10px;color:#94a3b8;letter-spacing:.08em;margin-top:3px}
  #ep-globe-close{margin-left:auto;pointer-events:auto;border:1px solid rgba(148,163,184,.25);background:rgba(15,23,42,.9);color:#e2e8f0;border-radius:10px;padding:8px 11px;cursor:pointer;font-weight:800}
  #ep-globe-status{position:absolute;top:60px;left:22px;z-index:4;color:#86efac;font-size:10px;font-weight:800;letter-spacing:.05em;text-shadow:0 1px 5px #000}
  #ep-globe-controls{position:absolute;right:20px;bottom:20px;z-index:4;display:flex;gap:7px}
  .ep-gbtn{border:1px solid rgba(148,163,184,.25);background:rgba(15,23,42,.92);color:#cbd5e1;border-radius:10px;padding:8px 10px;cursor:pointer;font-size:11px;font-weight:800}.ep-gbtn:hover{border-color:rgba(56,189,248,.65);color:#fff}
  #ep-globe-help{position:absolute;left:22px;bottom:24px;z-index:4;color:#64748b;font-size:10px;pointer-events:none}
  @media(max-width:640px){#ep-globe-stage{inset:62px 8px 8px;border-radius:16px}#ep-globe-head{left:14px;right:14px;top:12px}#ep-globe-status{left:14px;top:58px}#ep-globe-controls{right:12px;bottom:12px}.ep-gbtn{padding:7px 8px}#ep-globe-help{left:14px;bottom:16px}}
  `;
  const style=document.createElement('style'); style.textContent=css; document.head.appendChild(style);

  const overlay=document.createElement('div');
  overlay.id='ep-globe-overlay';
  overlay.innerHTML=`<div id="ep-globe-stage">
    <div id="ep-globe-head"><div><div id="ep-globe-title">EARTHPULSE · 3D EARTH</div><div id="ep-globe-sub">INTERACTIVE GLOBE VIEW</div></div><button id="ep-globe-close" aria-label="Close globe">✕ Close</button></div>
    <div id="ep-globe-status">● INITIALIZING WEBGL…</div>
    <canvas id="ep-globe-canvas"></canvas>
    <div id="ep-globe-help">Drag • Wheel / pinch • Double-click to reset</div>
    <div id="ep-globe-controls"><button class="ep-gbtn" id="ep-g-minus">−</button><button class="ep-gbtn" id="ep-g-reset">Reset</button><button class="ep-gbtn" id="ep-g-plus">+</button><button class="ep-gbtn" id="ep-g-auto">Auto</button></div>
  </div>`;
  document.body.appendChild(overlay);

  let THREE,scene,camera,renderer,globe,grid,stars,raf,initialized=false,auto=false;
  let yaw=.45,pitch=.12,targetDistance=3.15,distance=3.15;

  function loadThree(){
    return new Promise((resolve,reject)=>{
      if(window.THREE){resolve(window.THREE);return;}
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
      s.onload=()=>window.THREE?resolve(window.THREE):reject(new Error('Three.js did not load'));
      s.onerror=()=>reject(new Error('Three.js CDN failed'));
      document.head.appendChild(s);
    });
  }

  function makeEarthTexture(){
    const c=document.createElement('canvas'); c.width=1024; c.height=512;
    const x=c.getContext('2d');
    const g=x.createLinearGradient(0,0,0,512);g.addColorStop(0,'#0b3d73');g.addColorStop(.5,'#1261a0');g.addColorStop(1,'#062c52');x.fillStyle=g;x.fillRect(0,0,1024,512);
    x.fillStyle='#237a45';
    const land=[[[70,155],[125,125],[180,150],[205,205],[180,255],[130,245],[105,210]],[[250,110],[315,92],[365,125],[350,180],[315,205],[280,175]],[[470,105],[540,90],[595,125],[620,185],[575,225],[520,205],[480,160]],[[665,125],[735,105],[805,145],[825,210],[790,265],[730,240],[690,190]],[[845,270],[900,255],[950,290],[930,330],[875,320]],[[360,265],[405,285],[425,350],[390,420],[350,365],[330,315]]];
    land.forEach(poly=>{x.beginPath();poly.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fill()});
    x.globalAlpha=.2;x.fillStyle='#fff';for(let i=0;i<18;i++){x.beginPath();x.ellipse(Math.random()*1024,Math.random()*512,20+Math.random()*60,5+Math.random()*12,Math.random(),0,Math.PI*2);x.fill()}x.globalAlpha=1;
    return new THREE.CanvasTexture(c);
  }

  function latLon(lat,lon,r){const la=lat*Math.PI/180,lo=lon*Math.PI/180;return new THREE.Vector3(r*Math.cos(la)*Math.cos(lo),r*Math.sin(la),r*Math.cos(la)*Math.sin(lo))}

  function init(){
    if(initialized)return; initialized=true;
    const canvas=document.getElementById('ep-globe-canvas');
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    scene=new THREE.Scene();
    camera=new THREE.PerspectiveCamera(42,1,.1,100);
    scene.add(new THREE.AmbientLight(0x8bbfff,1.5));
    const sun=new THREE.DirectionalLight(0xffffff,2.6);sun.position.set(4,3,5);scene.add(sun);

    const tex=makeEarthTexture();
    globe=new THREE.Mesh(new THREE.SphereGeometry(1,96,64),new THREE.MeshStandardMaterial({map:tex,roughness:.8,metalness:.02}));
    scene.add(globe);
    const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.055,64,48),new THREE.MeshBasicMaterial({color:0x38bdf8,transparent:true,opacity:.11,side:THREE.BackSide}));scene.add(atmosphere);

    grid=new THREE.Group();
    const lineMat=new THREE.LineBasicMaterial({color:0x67d9ff,transparent:true,opacity:.15});
    for(let lat=-75;lat<=75;lat+=15){const pts=[];const r=Math.cos(lat*Math.PI/180),y=Math.sin(lat*Math.PI/180);for(let i=0;i<=128;i++){const a=i/128*Math.PI*2;pts.push(new THREE.Vector3(r*Math.cos(a),y,r*Math.sin(a)))}grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMat))}
    for(let lon=0;lon<180;lon+=15){const pts=[];const a=lon*Math.PI/180;for(let i=0;i<=128;i++){const t=i/128*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*Math.cos(t),Math.sin(t),Math.sin(a)*Math.cos(t)))}grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMat))}
    scene.add(grid);

    const sg=new THREE.BufferGeometry(),pos=[];for(let i=0;i<1200;i++){const r=5+Math.random()*9,a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1);pos.push(r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a))}sg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:.022,transparent:true,opacity:.75}));scene.add(stars);

    const markers=[[20,78,'INDIA'],[38,-97,'USA'],[51,0,'EUROPE'],[-23,-58,'SOUTH AMERICA'],[35,139,'JAPAN'],[-33,151,'AUSTRALIA'],[0,25,'AFRICA']];
    markers.forEach(([lat,lon,label])=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.022,12,8),new THREE.MeshBasicMaterial({color:0x67e8f9}));m.position.copy(latLon(lat,lon,1.035));m.userData.label=label;scene.add(m)});
    resize();animate();
    document.getElementById('ep-globe-status').textContent='● INTERACTIVE · DRAG TO ROTATE · WHEEL TO ZOOM';
  }

  function resize(){if(!renderer||!camera)return;const el=document.getElementById('ep-globe-stage');if(!el)return;const r=el.getBoundingClientRect();const w=Math.max(1,r.width),h=Math.max(1,r.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  function animate(){raf=requestAnimationFrame(animate);if(auto)yaw+=.0018;distance+=(targetDistance-distance)*.12;camera.position.set(distance*Math.cos(pitch)*Math.sin(yaw),distance*Math.sin(pitch),distance*Math.cos(pitch)*Math.cos(yaw));camera.lookAt(0,0,0);globe.rotation.y=0;stars.rotation.y+=.00008;renderer.render(scene,camera)}
  function reset(){yaw=.45;pitch=.12;targetDistance=3.15}
  function zoom(d){targetDistance=Math.max(1.55,Math.min(6,targetDistance+d))}

  function bind(){
    const c=document.getElementById('ep-globe-canvas');let drag=false,lastX=0,lastY=0,pinch=0;
    c.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;c.classList.add('dragging');c.setPointerCapture?.(e.pointerId)});
    c.addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-lastX)*.006;pitch+=(e.clientY-lastY)*.006;pitch=Math.max(-1.35,Math.min(1.35,pitch));lastX=e.clientX;lastY=e.clientY});
    ['pointerup','pointercancel','pointerleave'].forEach(t=>c.addEventListener(t,()=>{drag=false;c.classList.remove('dragging')}));
    c.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?.22:-.22)},{passive:false});
    c.addEventListener('dblclick',reset);
    c.addEventListener('touchstart',e=>{if(e.touches.length===2){const a=e.touches[0],b=e.touches[1];pinch=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}},{passive:true});
    c.addEventListener('touchmove',e=>{if(e.touches.length===2&&pinch){const a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);zoom((pinch-d)*.006);pinch=d}},{passive:true});
    document.getElementById('ep-g-minus').onclick=()=>zoom(.35);document.getElementById('ep-g-plus').onclick=()=>zoom(-.35);document.getElementById('ep-g-reset').onclick=reset;document.getElementById('ep-g-auto').onclick=e=>{auto=!auto;e.currentTarget.textContent=auto?'Stop':'Auto'};document.getElementById('ep-globe-close').onclick=close;
    window.addEventListener('resize',resize);
  }
  function close(){overlay.classList.remove('open');auto=false;document.body.style.overflow=''}
  async function open(){overlay.classList.add('open');document.body.style.overflow='hidden';try{THREE=await loadThree();init();resize()}catch(e){console.error('EarthPulse globe:',e);document.getElementById('ep-globe-status').textContent='● WEBGL FAILED — CHECK BROWSER CONSOLE';}}
  bind();
  window.EarthPulseOpenGlobe=open;
  window.addEventListener('earthpulse:open-globe',open);
})();

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

const viewers={}; let spin=false; let currentBuild=null;
const modelFor=c=>'CarConcept';const paintMap={OBSIDIAN:0x171a20,ALPINE:0xe9edf0,CRIMSON:0xb9142d,ELECTRIC:0xd7ff38,ULTRAVIOLET:0x6237ff,SKYLINE:0x2374ff};
function makeViewer(canvas,hero=false){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;
 const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x080b0f,.055);const camera=new THREE.PerspectiveCamera(hero?32:34,1,.1,100);camera.position.set(hero?6.7:6.2,hero?3.0:2.6,hero?6.8:6.4);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=4;controls.maxDistance=10;controls.maxPolarAngle=Math.PI*.49;controls.target.set(0,0.7,0);controls.autoRotate=hero;controls.autoRotateSpeed=.65;
 scene.add(new THREE.HemisphereLight(0xbfe6ff,0x10150d,2.2));let key=new THREE.DirectionalLight(0xffffff,5);key.position.set(4,7,5);key.castShadow=true;scene.add(key);let rim=new THREE.DirectionalLight(0xd7ff38,4);rim.position.set(-5,3,-4);scene.add(rim);let fill=new THREE.DirectionalLight(0x5e7cff,2);fill.position.set(2,2,-5);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(6,64),new THREE.MeshStandardMaterial({color:0x0c1015,metalness:.55,roughness:.48}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
 const ring=new THREE.Mesh(new THREE.RingGeometry(3.4,3.43,96),new THREE.MeshBasicMaterial({color:0xd7ff38,transparent:true,opacity:.22,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.008;scene.add(ring);
 let group=new THREE.Group();scene.add(group);let model=null,loader=new GLTFLoader(),loaded='';
 function resize(){let r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}
 new ResizeObserver(resize).observe(canvas);resize();
 function load(type){if(type===loaded&&model)return;loaded=type;if(!hero){let s=document.getElementById('modelStatus');if(s){s.style.display='block';s.textContent='LOADING 3D '+type.toUpperCase()+'…'}}loader.load('./assets/CarConcept.glb',g=>{if(model)group.remove(model);model=g.scene;model.rotation.y=-Math.PI/2;model.scale.setScalar(hero?1.05:1.18);model.position.y=.02;model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.userData.baseColor=o.material?.color?.getHex?.()}});group.add(model);apply();if(!hero){let s=document.getElementById('modelStatus');if(s)s.style.display='none'}},undefined,()=>{let s=document.getElementById('modelStatus');if(s)s.textContent='3D ASSET COULD NOT LOAD — REFRESH'});}
 function apply(){if(!model||!currentBuild)return;let col=paintMap[(currentBuild.paint||'').toUpperCase()]??0x171a20;model.traverse(o=>{if(!o.isMesh||!o.material)return;let bc=o.userData.baseColor||0;if(bc>0x202020 && !(bc>0xe00000&&bc<0xff8888)){o.material=o.material.clone();o.material.color.setHex(col);o.material.metalness=.72;o.material.roughness=.24}});group.position.y=(currentBuild.mods?.suspension||0)>=2?-.10:0;group.scale.setScalar(((currentBuild.mods?.wheels||0)>=2?1.025:1)*(hero?1.05:1.18));}
 function frame(){controls.reset();camera.position.set(hero?6.7:6.2,hero?3:2.6,hero?6.8:6.4);controls.target.set(0,.7,0);controls.update()}
 function tick(){requestAnimationFrame(tick);controls.autoRotate=hero||spin;controls.update();renderer.render(scene,camera)}tick();load(hero?'supercar':'sport');return{load,apply,frame,controls,group}
}
try{let c=document.getElementById('car3d');if(c)viewers.main=makeViewer(c,false);let h=document.getElementById('hero3d');if(h)viewers.hero=makeViewer(h,true)}catch(e){console.error(e);let s=document.getElementById('modelStatus');if(s)s.textContent='3D NOT SUPPORTED ON THIS DEVICE'}
window.addEventListener('carlab:build',e=>{currentBuild=e.detail;let t=modelFor(currentBuild.category);viewers.main?.load(t);viewers.main?.apply()});
window.resetCamera=()=>viewers.main?.frame();window.toggleSpin=()=>{spin=!spin;document.getElementById('spinBtn')?.classList.toggle('on',spin)};window.toggleFullscreenShowroom=()=>{let e=document.getElementById('carDisplay');if(!document.fullscreenElement)e?.requestFullscreen?.();else document.exitFullscreen?.()};
setTimeout(()=>{let b=window.current?window.current():null;if(b){currentBuild=b;viewers.main?.load(modelFor(b.category));viewers.main?.apply()}},300);

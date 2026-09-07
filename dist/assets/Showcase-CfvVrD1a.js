import{r as d,j as a}from"./index-Y7pJgXKA.js";import{u as V,h as W,a as O,A as z,p as C,s as M,V as I,M as w,g as R,G as L,W as X,B as k,b as P,S as B,C as $,c as Y,P as q}from"./Universe-CSQPub6-.js";import"./business-CrBQeyIO.js";const E=232,U=154,g=3.5,S=U/E*g;function J(e,s){return g*e*s/E}const K=[{pos:[1.55,4.55,.7],rot:[0,-.14,.03]},{pos:[6.15,4.4,.2],rot:[0,-.34,-.02]},{pos:[1.7,1.55,.9],rot:[0,-.1,.04]},{pos:[6.05,1.4,.4],rot:[0,-.38,-.03]},{pos:[1.5,-1.45,.6],rot:[0,-.16,-.03]},{pos:[6.2,-1.6,.9],rot:[0,-.32,.03]},{pos:[1.65,-4.45,.3],rot:[0,-.12,.02]},{pos:[6.1,-4.6,.7],rot:[0,-.42,-.02]}],Q=[{pos:[-2.3,1,.6],rot:[0,.16,.03]},{pos:[2.3,.8,.2],rot:[0,-.2,-.03]},{pos:[-2.3,-2.9,.8],rot:[0,.13,-.02]},{pos:[2.3,-3.1,.4],rot:[0,-.24,.03]}],Z=[{pos:[.2,-1,.6],rot:[0,.1,.02]},{pos:[0,-4,.3],rot:[0,-.12,-.02]}],ee=150,te=14;function se(e,s){return g*e*s/(2*te*Math.tan(G))}const j=[{minAspect:1.1,slots:K},{minAspect:.6,slots:Q},{minAspect:0,slots:Z}],re=11,G=46/2*(Math.PI/180),F=re*Math.tan(G),oe=.72,ae=.88;function N(e,s,r){const o=Math.min(r,e.length);let i=0,t=0;for(let l=0;l<o;l++)i=Math.max(i,Math.abs(e[l].pos[0])+g/2),t=Math.max(t,Math.abs(e[l].pos[1])+S/2);const c=Math.min(1,F*s*oe/i,F*ae/t);return{slots:e.slice(0,o),scale:c}}function ne(e,s,r){const o=j.filter(t=>e>=t.minAspect),i=o.length?o:[j[j.length-1]];for(const t of i){const c=N(t.slots,e,r);if(se(c.scale,s)>=ee)return c}return N(i[i.length-1].slots,e,r)}const ie=`
uniform float uTime;
uniform float uGather;
uniform float uPixelRatio;
uniform float uOpacity;
attribute vec3  aTarget;
attribute float aSeed;
varying float vAlpha;

void main(){
  float g = clamp((uGather - aSeed * 0.35) / 0.65, 0.0, 1.0);
  g = g * g * (3.0 - 2.0 * g);

  vec3 p = mix(position, aTarget, g);
  // Orbit the destination once arrived, so the swarm never looks glued on.
  float a = uTime * (0.5 + aSeed) + aSeed * 6.28;
  p += vec3(cos(a), sin(a * 1.3), sin(a)) * 0.12 * g;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vAlpha = g * uOpacity * (0.3 + aSeed * 0.7);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPixelRatio * (12.0 / max(-mv.z, 0.8)) * (0.5 + aSeed);
}
`,ce=`
precision mediump float;
uniform vec3 uColor;
varying float vAlpha;
${q}
void main(){
  float a = pointAlpha(gl_PointCoord) * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uColor, a);
}
`;function ue({energy:e,data:s,w:r,h:o}){const i=d.useRef(),t=M.quality==="low"?34:80,c=d.useMemo(()=>{const p=new k,h=new Float32Array(t*3),n=new Float32Array(t*3),m=new Float32Array(t);for(let u=0;u<t;u++){h[u*3]=(Math.random()-.5)*9,h[u*3+1]=(Math.random()-.5)*7,h[u*3+2]=(Math.random()-.5)*6;const x=Math.random(),f=Math.random()-.5;x<.5?(n[u*3]=f*r,n[u*3+1]=(x<.25?.5:-.5)*o):(n[u*3]=(x<.75?.5:-.5)*r,n[u*3+1]=f*o),n[u*3+2]=(Math.random()-.5)*.3,m[u]=Math.random()}return p.setAttribute("position",new P(h,3)),p.setAttribute("aTarget",new P(n,3)),p.setAttribute("aSeed",new P(m,1)),p.boundingSphere=new B(new I,8),p},[t,r,o]),l=d.useMemo(()=>({uTime:{value:0},uGather:{value:0},uPixelRatio:{value:1},uOpacity:{value:1},uColor:{value:new $("#b7ff6a")}}),[]);return O((p,h)=>{var m;if(!s.current.active)return;const n=(m=i.current)==null?void 0:m.uniforms;n&&(n.uTime.value+=h,n.uGather.value=e.current,n.uPixelRatio.value=M.dpr,n.uOpacity.value=s.current.band)}),a.jsx("points",{geometry:c,frustumCulled:!1,children:a.jsx("shaderMaterial",{ref:i,args:[{uniforms:l,vertexShader:ie,fragmentShader:ce}],transparent:!0,depthWrite:!1,blending:Y})})}function le({project:e,slot:s,index:r,data:o,distanceFactor:i}){const t=d.useRef(),c=d.useRef(),[l,p]=d.useState(!1),h=d.useRef(0),n=d.useRef(0),m=d.useMemo(()=>new I(...s.pos),[s.pos]);O((f,H)=>{var T;if(!o.current.active||!t.current){n.current=0;return}const D=Math.min(H,.05),_=o.current.t;h.current+=((l?1:0)-h.current)*(1-Math.exp(-5.5*D));const v=h.current,A=w.smoothstep(o.current.local,.02+r*.06,.4+r*.06),y=r*2.1;t.current.position.set(m.x+Math.sin(_*.18+y)*.2,m.y+Math.cos(_*.15+y)*.24+v*.55,w.lerp(m.z-16,m.z,A)+v*.9),t.current.rotation.set(s.rot[0]+Math.sin(_*.14+y)*.035-M.smooth.y*.05*v,s.rot[1]+Math.cos(_*.11+y)*.04+M.smooth.x*.09*v,s.rot[2]*(1-v*.6)),t.current.scale.setScalar(w.lerp(.85,1,A)*(1+v*.055)),n.current=A*o.current.band;const b=(T=c.current)==null?void 0:T.material.uniforms;b&&(b.uHover.value=v,b.uOpacity.value=(.34+v*.3)*A*o.current.band)});const u=()=>{p(!0),R({hovered:e.name}),document.body.style.cursor="pointer"},x=()=>{p(!1),R({hovered:null}),document.body.style.cursor=""};return a.jsxs("group",{ref:t,children:[a.jsx("mesh",{onPointerOver:u,onPointerOut:x,onClick:f=>{f.stopPropagation(),R({focused:e.name}),x()},visible:!1,children:a.jsx("planeGeometry",{args:[g*1.1,S*1.15]})}),a.jsx(L,{ref:c,width:g,height:S,radius:.1,opacity:.34,scan:.7}),a.jsx(ue,{energy:h,data:o,w:g,h:S}),a.jsxs(X,{center:!0,distanceFactor:i,zIndexRange:[25,0],position:[0,0,.02],fade:n,className:`uv-card ${l?"is-hot":""}`,children:[a.jsxs("div",{className:"uv-card__top",children:[a.jsx("span",{className:"uv-card__mark",children:e.initials}),a.jsx("span",{className:`uv-card__year${e.status?" is-wip":""}`,children:e.status||e.year})]}),a.jsx("h3",{className:"uv-card__name",children:e.name}),a.jsx("p",{className:"uv-card__cat",children:e.category}),a.jsx("div",{className:"uv-card__tags",children:e.tags.slice(0,4).map(f=>a.jsx("span",{children:f},f))}),a.jsx("span",{className:"uv-card__cue",children:"View case study"})]})]})}function pe(){const{group:e,d:s}=V("showcase"),r=W(c=>c.size),{slots:o,scale:i}=d.useMemo(()=>ne(r.width/Math.max(r.height,1),r.height,C.length),[r.width,r.height]),t=J(i,r.height);return O(()=>{!s.current.active||!e.current||(e.current.rotation.y=M.smooth.x*.06+Math.sin(s.current.t*.08)*.025,e.current.rotation.x=M.smooth.y*.04)}),a.jsx("group",{ref:e,position:z.showcase,scale:i,children:C.slice(0,o.length).map((c,l)=>a.jsx(le,{project:c,slot:o[l],index:l,data:s,distanceFactor:t},c.name))})}export{pe as default};

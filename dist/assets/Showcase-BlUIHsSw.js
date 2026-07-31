import{j as e,p as T,r as l}from"./index-Ddv38SQE.js";import{u as F,a as R,A as z,s as f,V as N,M as w,g as b,G as H,W as V,B as k,b as j,S as B,C as W,c as E,P as I}from"./Universe-Di1KcoTZ.js";const O=[{pos:[1.1,2.5,1.2],rot:[0,-.16,.03]},{pos:[5.6,.9,2.9],rot:[0,-.36,-.03]},{pos:[1.5,-2.1,2.2],rot:[0,-.12,.04]},{pos:[5.9,-3.3,.5],rot:[0,-.44,-.02]}],L=`
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
`,$=`
precision mediump float;
uniform vec3 uColor;
varying float vAlpha;
${I}
void main(){
  float a = pointAlpha(gl_PointCoord) * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uColor, a);
}
`;function q({energy:r,data:o,w:i,h:s}){const d=l.useRef(),m=f.quality==="low"?60:180,v=l.useMemo(()=>{const n=new k,c=new Float32Array(m*3),t=new Float32Array(m*3),p=new Float32Array(m);for(let a=0;a<m;a++){c[a*3]=(Math.random()-.5)*9,c[a*3+1]=(Math.random()-.5)*7,c[a*3+2]=(Math.random()-.5)*6;const u=Math.random(),x=Math.random()-.5;u<.5?(t[a*3]=x*i,t[a*3+1]=(u<.25?.5:-.5)*s):(t[a*3]=(u<.75?.5:-.5)*i,t[a*3+1]=x*s),t[a*3+2]=(Math.random()-.5)*.3,p[a]=Math.random()}return n.setAttribute("position",new j(c,3)),n.setAttribute("aTarget",new j(t,3)),n.setAttribute("aSeed",new j(p,1)),n.boundingSphere=new B(new N,8),n},[m,i,s]),g=l.useMemo(()=>({uTime:{value:0},uGather:{value:0},uPixelRatio:{value:1},uOpacity:{value:1},uColor:{value:new W("#b7ff6a")}}),[]);return R((n,c)=>{var p;if(!o.current.active)return;const t=(p=d.current)==null?void 0:p.uniforms;t&&(t.uTime.value+=c,t.uGather.value=r.current,t.uPixelRatio.value=f.dpr,t.uOpacity.value=o.current.band)}),e.jsx("points",{geometry:v,frustumCulled:!1,children:e.jsx("shaderMaterial",{ref:d,args:[{uniforms:g,vertexShader:L,fragmentShader:$}],transparent:!0,depthWrite:!1,blending:E})})}const A=3.5,P=2.3;function U({project:r,slot:o,index:i,data:s}){const d=l.useRef(),m=l.useRef(),[v,g]=l.useState(!1),n=l.useRef(0),c=l.useRef(0),t=l.useMemo(()=>new N(...o.pos),[o.pos]);R((u,x)=>{var C;if(!s.current.active||!d.current){c.current=0;return}const G=Math.min(x,.05),y=s.current.t;n.current+=((v?1:0)-n.current)*(1-Math.exp(-5.5*G));const h=n.current,M=w.smoothstep(s.current.local,.02+i*.06,.4+i*.06),S=i*2.1;d.current.position.set(t.x+Math.sin(y*.23+S)*.2,t.y+Math.cos(y*.19+S)*.24+h*.55,w.lerp(t.z-16,t.z,M)+h*.9),d.current.rotation.set(o.rot[0]+Math.sin(y*.17+S)*.035-f.smooth.y*.05*h,o.rot[1]+Math.cos(y*.14+S)*.04+f.smooth.x*.09*h,o.rot[2]*(1-h*.6)),d.current.scale.setScalar(w.lerp(.85,1,M)*(1+h*.055)),c.current=M*s.current.band;const _=(C=m.current)==null?void 0:C.material.uniforms;_&&(_.uHover.value=h,_.uOpacity.value=(.34+h*.3)*M*s.current.band)});const p=()=>{g(!0),b({hovered:r.name}),document.body.style.cursor="pointer"},a=()=>{g(!1),b({hovered:null}),document.body.style.cursor=""};return e.jsxs("group",{ref:d,children:[e.jsx("mesh",{onPointerOver:p,onPointerOut:a,onClick:u=>{u.stopPropagation(),b({focused:r.name}),a()},visible:!1,children:e.jsx("planeGeometry",{args:[A*1.1,P*1.15]})}),e.jsx(H,{ref:m,width:A,height:P,radius:.1,opacity:.34,scan:.7}),e.jsx(q,{energy:n,data:s,w:A,h:P}),e.jsxs(V,{center:!0,distanceFactor:13,zIndexRange:[25,0],position:[0,0,.02],fade:c,className:`uv-card ${v?"is-hot":""}`,children:[e.jsxs("div",{className:"uv-card__top",children:[e.jsx("span",{className:"uv-card__mark",children:r.initials}),e.jsx("span",{className:"uv-card__year",children:r.year})]}),e.jsx("h3",{className:"uv-card__name",children:r.name}),e.jsx("p",{className:"uv-card__cat",children:r.category}),e.jsx("div",{className:"uv-card__tags",children:r.tags.slice(0,4).map(u=>e.jsx("span",{children:u},u))}),e.jsx("span",{className:"uv-card__cue",children:"View case study"})]})]})}function K(){const{group:r,d:o}=F("showcase");return R(()=>{!o.current.active||!r.current||(r.current.rotation.y=f.smooth.x*.06+Math.sin(o.current.t*.1)*.025,r.current.rotation.x=f.smooth.y*.04)}),e.jsx("group",{ref:r,position:z.showcase,children:T.slice(0,O.length).map((i,s)=>e.jsx(U,{project:i,slot:O[s],index:s,data:o},i.name))})}export{K as default};

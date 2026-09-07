import{r as i,j as e}from"./index-BG62i9z_.js";import{u as N,V as A,a as j,A as E,F as I,e as T,s as p,B as H,b as x,S as z,C as k,f as V,M as B,c as C,P as W,N as G,O as $,W as D,g as F}from"./Universe-BCfGxXRM.js";import"./business-BUqQ7y0s.js";const g=[{id:"support",name:"Customer Support",pos:[-.6,2.2,2.4],color:"#dbe6f2",skills:["Conversation","Decision making","Workflow","API execution","Escalation"]},{id:"ocr",name:"Document AI · OCR",pos:[2.4,-2.6,3.6],color:"#cfe0ff",skills:["Extraction","Classification","Validation","Structured output","Archival"]},{id:"crm",name:"CRM Copilot",pos:[6.4,2.6,2],color:"#dbe6f2",skills:["Lead scoring","Enrichment","Outreach drafts","Pipeline sync","Forecasting"]},{id:"automation",name:"Automation",pos:[9.6,-.8,3.2],color:"#dbe6f2",skills:["Triggers","Decision making","API execution","Retries","Audit trail"]},{id:"analytics",name:"Analytics",pos:[4.6,5.2,1.2],color:"#cfe0ff",skills:["Natural language Q&A","Aggregation","Anomaly detection","Forecasting","Reporting"]}],q=`
uniform float uTime;
uniform float uPixelRatio;
uniform float uOpacity;
uniform float uReveal;
uniform vec2  uPointer;
attribute float aSeed;
attribute float aScale;
attribute float aLayer;
varying float vAlpha;
varying float vFire;

${G}

void main(){
  vec3 p = position;

  // Slow structural drift — the network is thinking, not idling.
  float n = snoise(p * 0.10 + vec3(0.0, 0.0, uTime * 0.055));
  p += vec3(n, snoise(p * 0.11 + 21.0), snoise(p * 0.09 + 47.0)) * 0.85;

  // Layers light up front-to-back, like activation sweeping through a net.
  float gate = smoothstep(aLayer - 0.25, aLayer + 0.1, uReveal);

  p.xy += uPointer * (0.4 + aSeed * 0.5);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float dist = -mv.z;

  // Individual neurons fire on their own rhythm.
  vFire = pow(0.5 + 0.5 * sin(uTime * 1.7 + aSeed * 42.0 + aLayer * 6.0), 6.0);

  vAlpha = gate * uOpacity * smoothstep(0.5, 6.0, dist) * (0.3 + aSeed * 0.45);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPixelRatio * aScale * (9.0 / max(dist, 0.8)) * (1.0 + vFire * 1.2);
}
`,Q=`
precision mediump float;
uniform vec3 uColor;
uniform vec3 uHot;
varying float vAlpha;
varying float vFire;
${W}
void main(){
  float a = pointAlpha(gl_PointCoord) * vAlpha * (0.5 + vFire * 0.8);
  if (a < 0.003) discard;
  gl_FragColor = vec4(mix(uColor, uHot, vFire), a);
}
`;function U({data:t}){const n=i.useRef(),l=p.quality==="high"?4200:p.quality==="medium"?2e3:900,v=i.useMemo(()=>{const s=new H,r=new Float32Array(l*3),o=new Float32Array(l),u=new Float32Array(l),d=new Float32Array(l),h=6;for(let a=0;a<l;a++){const m=Math.floor(Math.random()*h),w=-9+m*3.4+(Math.random()-.5)*1.9,y=Math.pow(Math.random(),.62)*12,f=Math.random()*Math.PI*2;r[a*3]=Math.cos(f)*y,r[a*3+1]=Math.sin(f)*y*.72,r[a*3+2]=w,o[a]=Math.random(),u[a]=.4+Math.pow(Math.random(),2)*1.5,d[a]=m/(h-1)}return s.setAttribute("position",new x(r,3)),s.setAttribute("aSeed",new x(o,1)),s.setAttribute("aScale",new x(u,1)),s.setAttribute("aLayer",new x(d,1)),s.boundingSphere=new z(new A,22),s},[l]),c=i.useMemo(()=>({uTime:{value:0},uPixelRatio:{value:1},uOpacity:{value:1},uReveal:{value:0},uPointer:{value:new V},uColor:{value:new k("#8fa6c4")},uHot:{value:new k("#eaf2ff")}}),[]);return j((s,r)=>{var u;if(!t.current.active)return;const o=(u=n.current)==null?void 0:u.uniforms;o&&(o.uTime.value+=r,o.uPixelRatio.value=p.dpr,o.uReveal.value=B.smoothstep(t.current.local,0,.55),o.uOpacity.value=t.current.band,o.uPointer.value.set(p.smooth.x,p.smooth.y))}),e.jsx("points",{geometry:v,frustumCulled:!1,children:e.jsx("shaderMaterial",{ref:n,args:[{uniforms:c,vertexShader:q,fragmentShader:Q}],transparent:!0,depthWrite:!1,blending:C})})}function Y({agent:t,data:n,selected:l,onSelect:v}){const c=i.useRef(),s=i.useRef(),r=i.useRef(),[o,u]=i.useState(!1),d=i.useRef(0),h=i.useRef(0),a=i.useMemo(()=>new A(...t.pos),[t.pos]),m=l===t.id;j((f,O)=>{var P;if(!n.current.active||!c.current){h.current=0;return}const _=Math.min(O,.05),M=n.current.t,L=m?1:o?.6:0;d.current+=(L-d.current)*(1-Math.exp(-5*_));const S=a.x*.7+a.y;c.current.position.set(a.x+Math.sin(M*.27+S)*.34,a.y+Math.cos(M*.23+S)*.3,a.z+Math.sin(M*.18+S)*.22+d.current*1.1);const R=.62*(1+d.current*.34);c.current.scale.setScalar(R),h.current=n.current.band;const b=(P=s.current)==null?void 0:P.material.uniforms;b&&(b.uHover.value=d.current,b.uOpacity.value=n.current.band),r.current&&(r.current.position.copy(c.current.position),r.current.scale.setScalar(R*(1.35+d.current*.5)),r.current.material.opacity=(.018+d.current*.055)*n.current.band)});const w=()=>{u(!0),F({hovered:t.id}),document.body.style.cursor="pointer"},y=()=>{u(!1),F({hovered:null}),document.body.style.cursor=""};return e.jsxs("group",{children:[e.jsxs("group",{ref:c,children:[e.jsx("mesh",{onPointerOver:w,onPointerOut:y,onClick:f=>{f.stopPropagation(),v(m?null:t.id)},visible:!1,children:e.jsx("sphereGeometry",{args:[2.2,8,8]})}),e.jsx($,{ref:s,radius:1,detail:3,color:t.color,amp:.1}),e.jsxs(D,{center:!0,distanceFactor:15,zIndexRange:[30,0],fade:h,className:`uv-agent ${o?"is-hot":""} ${m?"is-open":""}`,children:[e.jsx("span",{className:"uv-agent__name",children:t.name}),e.jsx("ul",{className:"uv-agent__skills","aria-hidden":!m,children:t.skills.map(f=>e.jsx("li",{children:f},f))})]})]}),e.jsxs("mesh",{ref:r,children:[e.jsx("sphereGeometry",{args:[1,16,16]}),e.jsx("meshBasicMaterial",{color:t.color,transparent:!0,opacity:0,depthWrite:!1,blending:C})]})]})}function Z(){const{group:t,d:n}=N("agents"),[l,v]=i.useState(null),c=i.useRef(0),s=i.useMemo(()=>{const r=[];for(let o=0;o<g.length;o++)for(let u=o+1;u<g.length;u++)r.push([new A(...g[o].pos),new A(...g[u].pos)]);return r},[]);return j(()=>{c.current=n.current.band,!(!n.current.active||!t.current)&&(t.current.rotation.y=p.smooth.x*.07+Math.sin(n.current.t*.1)*.04,t.current.rotation.x=p.smooth.y*.05)}),e.jsxs("group",{ref:t,position:E.agents,children:[e.jsx(U,{data:n}),e.jsx(I,{links:s,color:"#93a8c0",opacity:.5,fade:c}),e.jsx(T,{links:s,perLink:4,speed:.13,size:1.3,color:"#d8ffb0",arc:1.4,fade:c}),g.map(r=>e.jsx(Y,{agent:r,data:n,selected:l,onSelect:v},r.id))]})}export{Z as default};

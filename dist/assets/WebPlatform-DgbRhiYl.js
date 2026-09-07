import{r as n,j as i}from"./index-BC3YEfMz.js";import{N as M,u as F,a as x,A as g,R as O,s as f,C as h,M as y,B as R,b as p,S as I,V as k,c as C,P as j}from"./Universe-Bh4JKVfx.js";import"./business-CBmEmcDJ.js";const D=`
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,P=`
precision highp float;

uniform float uTime;
uniform float uBuild;    // 0 = bare wireframe, 1 = deployed product
uniform float uOpacity;
uniform vec3  uAccent;
uniform vec3  uInk;

varying vec2 vUv;

${M}

const float A = 1.62;   // window aspect (w/h)

float rbox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float seg(vec2 p, vec2 a, vec2 b){
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
float fillA(float d){ return 1.0 - smoothstep(0.0, fwidth(d) * 1.4, d); }
float strokeA(float d, float w){ return 1.0 - smoothstep(0.0, fwidth(d) * 1.4, abs(d) - w); }

void put(inout vec3 col, inout float cov, float a, vec3 c){
  a = clamp(a, 0.0, 1.0);
  col = mix(col, c, a);
  cov = max(cov, a);
}

// One UI element. Above the build sweep it is a solid, finished component;
// below it, it is still just an accent outline. The transition between the two
// IS the "watch it build itself" story — no extra machinery needed.
void el(inout vec3 col, inout float cov, float d, vec3 c, float y, float sweep){
  float fid = smoothstep(sweep - 0.05, sweep + 0.05, y);
  put(col, cov, strokeA(d, 0.0011) * (1.0 - fid) * 0.38, uAccent * 0.8);
  put(col, cov, fillA(d) * fid, c);
}

// Same staging, but driven by a coverage value (0..1) instead of a distance.
// Strokes and arcs already know their own coverage; feeding those through el()
// meant subtracting 0.5 to fake a distance, which inverts the fill test and
// paints everywhere the shape is NOT.
void elCov(inout vec3 col, inout float cov, float a, vec3 c, float y, float sweep){
  float fid = smoothstep(sweep - 0.05, sweep + 0.05, y);
  put(col, cov, a * (1.0 - fid) * 0.38, uAccent * 0.8);
  put(col, cov, a * fid, c);
}

void main(){
  vec2 p = (vUv - 0.5) * vec2(A, 1.0);

  vec3  col = vec3(0.0);
  float cov = 0.0;

  vec3 SURF = vec3(0.115, 0.125, 0.135);
  vec3 SOFT = vec3(0.068, 0.076, 0.084);
  vec3 DIM  = vec3(0.30, 0.34, 0.35);
  vec3 TEXT = vec3(0.80, 0.84, 0.85);

  // The sweep travels top → bottom across the build window.
  float sweep = mix(0.62, -0.62, clamp(uBuild, 0.0, 1.0));

  // ── Browser chrome ──────────────────────────────────────────────────────
  float chromeY = 0.44;
  el(col, cov, rbox(p - vec2(0.0, 0.47), vec2(0.80, 0.03), 0.012), SURF, 0.47, sweep);
  // Traffic lights.
  for (int i = 0; i < 3; i++){
    float x = -0.745 + float(i) * 0.032;
    vec3 c = i == 0 ? vec3(0.36, 0.16, 0.16) : (i == 1 ? vec3(0.36, 0.30, 0.14) : vec3(0.17, 0.33, 0.19));
    el(col, cov, length(p - vec2(x, 0.47)) - 0.0085, c, 0.47, sweep);
  }
  // Active tab + address bar.
  el(col, cov, rbox(p - vec2(-0.55, 0.472), vec2(0.115, 0.021), 0.008), SOFT, 0.472, sweep);
  el(col, cov, rbox(p - vec2(-0.585, 0.472), vec2(0.055, 0.006), 0.005), DIM, 0.472, sweep);
  el(col, cov, rbox(p - vec2(-0.02, 0.472), vec2(0.30, 0.018), 0.009), SOFT, 0.472, sweep);
  el(col, cov, rbox(p - vec2(-0.24, 0.472), vec2(0.055, 0.005), 0.004), uAccent * 0.75, 0.472, sweep);

  // ── App shell ───────────────────────────────────────────────────────────
  // Sidebar.
  el(col, cov, rbox(p - vec2(-0.715, -0.02), vec2(0.085, 0.445), 0.014), SOFT, 0.40, sweep);
  el(col, cov, length(p - vec2(-0.745, 0.36)) - 0.014, uAccent, 0.36, sweep);
  el(col, cov, rbox(p - vec2(-0.700, 0.36), vec2(0.032, 0.007), 0.005), TEXT, 0.36, sweep);
  for (int i = 0; i < 6; i++){
    float y = 0.27 - float(i) * 0.062;
    vec3 c = i == 0 ? uAccent * 0.55 : DIM * 0.75;
    if (i == 0) el(col, cov, rbox(p - vec2(-0.715, y), vec2(0.072, 0.020), 0.008), vec3(0.10, 0.14, 0.11), y, sweep);
    el(col, cov, length(p - vec2(-0.772, y)) - 0.008, c, y, sweep);
    el(col, cov, rbox(p - vec2(-0.712, y), vec2(0.045, 0.006), 0.004), c, y, sweep);
  }

  // Top bar of the app itself.
  el(col, cov, rbox(p - vec2(0.09, 0.395), vec2(0.715, 0.028), 0.010), SOFT, 0.395, sweep);
  el(col, cov, rbox(p - vec2(-0.55, 0.395), vec2(0.075, 0.009), 0.006), TEXT, 0.395, sweep);
  el(col, cov, rbox(p - vec2(0.33, 0.395), vec2(0.16, 0.015), 0.008), vec3(0.10, 0.12, 0.13), 0.395, sweep);
  el(col, cov, length(p - vec2(0.755, 0.395)) - 0.017, uAccent * 0.7, 0.395, sweep);

  // ── KPI cards ───────────────────────────────────────────────────────────
  for (int i = 0; i < 4; i++){
    float cx = -0.505 + float(i) * 0.2;
    float cy = 0.27;
    el(col, cov, rbox(p - vec2(cx, cy), vec2(0.092, 0.055), 0.016), SURF, cy, sweep);
    el(col, cov, rbox(p - vec2(cx - 0.05, cy + 0.03), vec2(0.032, 0.006), 0.004), DIM, cy, sweep);
    vec3 c = i == 0 ? uAccent : TEXT;
    el(col, cov, rbox(p - vec2(cx - 0.035, cy - 0.004), vec2(0.045, 0.014), 0.007), c, cy, sweep);
    // Sparkline in each card.
    for (int k = 0; k < 6; k++){
      float fx = cx - 0.062 + float(k) * 0.0245;
      float h = 0.006 + 0.016 * (0.5 + 0.5 * sin(float(k) * 1.6 + float(i) * 2.1 + uTime * 0.5));
      el(col, cov, rbox(p - vec2(fx, cy - 0.038 + h * 0.5), vec2(0.005, h * 0.5), 0.003), c * 0.5, cy, sweep);
    }
  }

  // ── Main chart ──────────────────────────────────────────────────────────
  el(col, cov, rbox(p - vec2(-0.175, 0.075), vec2(0.36, 0.115), 0.018), SURF, 0.075, sweep);
  el(col, cov, rbox(p - vec2(-0.475, 0.155), vec2(0.055, 0.007), 0.005), DIM, 0.075, sweep);
  for (int i = 0; i < 9; i++){
    float x0 = -0.50 + float(i) * 0.0805;
    float x1 = x0 + 0.0805;
    float y0 = 0.045 + 0.055 * sin(float(i) * 0.8 + uTime * 0.35);
    float y1 = 0.045 + 0.055 * sin(float(i + 1) * 0.8 + uTime * 0.35);
    elCov(col, cov, strokeA(seg(p, vec2(x0, y0), vec2(x1, y1)), 0.0018), uAccent, 0.075, sweep);
    // Area under the curve.
    float ym = (y0 + y1) * 0.5;
    put(col, cov,
        fillA(rbox(p - vec2((x0 + x1) * 0.5, (ym - 0.02) * 0.5), vec2(0.040, (ym + 0.02) * 0.5), 0.0))
          * 0.16 * smoothstep(sweep - 0.05, sweep + 0.05, 0.075),
        uAccent);
  }

  // ── Side panel: donut ───────────────────────────────────────────────────
  el(col, cov, rbox(p - vec2(0.455, 0.075), vec2(0.245, 0.115), 0.018), SURF, 0.075, sweep);
  float ringA = strokeA(length(p - vec2(0.36, 0.07)) - 0.058, 0.014);
  elCov(col, cov, ringA, vec3(0.20, 0.23, 0.25), 0.075, sweep);
  // Accent arc: only the top-right quadrant of the ring.
  float quad = step(0.0, p.x - 0.36) * step(0.0, p.y - 0.07);
  elCov(col, cov, ringA * quad, uAccent, 0.075, sweep);
  for (int i = 0; i < 3; i++){
    float y = 0.125 - float(i) * 0.045;
    el(col, cov, length(p - vec2(0.50, y)) - 0.008, i == 0 ? uAccent : DIM * 0.8, 0.075, sweep);
    el(col, cov, rbox(p - vec2(0.575, y), vec2(0.045, 0.006), 0.004), DIM, 0.075, sweep);
  }

  // ── Data table ──────────────────────────────────────────────────────────
  el(col, cov, rbox(p - vec2(0.09, -0.245), vec2(0.715, 0.18), 0.018), SOFT, -0.245, sweep);
  for (int i = 0; i < 5; i++){
    float y = -0.10 - float(i) * 0.062;
    el(col, cov, length(p - vec2(-0.565, y)) - 0.013, i == 1 ? uAccent * 0.6 : vec3(0.14, 0.17, 0.18), y, sweep);
    el(col, cov, rbox(p - vec2(-0.44, y), vec2(0.075, 0.006), 0.004), TEXT, y, sweep);
    el(col, cov, rbox(p - vec2(-0.20, y), vec2(0.055, 0.005), 0.004), DIM, y, sweep);
    el(col, cov, rbox(p - vec2(0.10, y), vec2(0.040, 0.005), 0.004), DIM, y, sweep);
    // Status pill.
    el(col, cov, rbox(p - vec2(0.62, y), vec2(0.048, 0.014), 0.008),
       i < 2 ? vec3(0.10, 0.18, 0.11) : vec3(0.16, 0.14, 0.09), y, sweep);
  }

  // ── The build sweep itself ──────────────────────────────────────────────
  // NB: 'active' is a reserved word in GLSL ES — never name a local that.
  float scanline = smoothstep(0.012, 0.0, abs(p.y - sweep));
  float building = step(0.02, uBuild) * step(uBuild, 0.98);
  put(col, cov, scanline * building * 0.55, uAccent * 0.85);

  // ── Compose ─────────────────────────────────────────────────────────────
  vec3 bg = vec3(0.028, 0.032, 0.036);
  vec3 outc = mix(bg, col, cov);
  // A whisper of backlight, not a green wash.
  outc += uAccent * 0.004;
  outc += snoise(vec3(vUv * 240.0, uTime * 0.4)) * 0.004;

  gl_FragColor = vec4(outc * uOpacity, uOpacity);
}
`,G=["Idea","Research","Wireframe","Design","Development","Deployment"],d=13.6,b=d/1.62;function B({data:e}){const o=n.useRef(),t=n.useMemo(()=>({uTime:{value:0},uBuild:{value:0},uOpacity:{value:1},uAccent:{value:new h("#b7ff6a")},uInk:{value:new h("#070b09")}}),[]);return x((s,m)=>{var r;if(!e.current.active)return;const c=(r=o.current)==null?void 0:r.uniforms;c&&(c.uTime.value+=m,c.uBuild.value=y.smoothstep(e.current.local,.1,.82),c.uOpacity.value=e.current.band)}),i.jsxs("mesh",{children:[i.jsx("planeGeometry",{args:[d,b]}),i.jsx("shaderMaterial",{ref:o,args:[{uniforms:t,vertexShader:D,fragmentShader:P}],transparent:!0})]})}const U=`
uniform float uTime;
uniform float uFlow;
uniform float uPixelRatio;
uniform float uOpacity;
attribute vec3  aTarget;
attribute float aSeed;
attribute float aRow;
varying float vAlpha;

void main(){
  // Typing rhythm: each glyph waits its turn along its row.
  float typed = clamp(uTime * 0.5 - aRow * 0.05 - aSeed * 0.1, 0.0, 1.0);

  vec3 p = position;
  p.x += sin(uTime * 0.5 + aRow) * 0.05;

  // Then the code dissolves forward into the interface it produced.
  float f = clamp((uFlow - aSeed * 0.3) / 0.7, 0.0, 1.0);
  f = f * f * (3.0 - 2.0 * f);
  p = mix(p, aTarget, f);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vAlpha = typed * (1.0 - f * 0.9) * uOpacity;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPixelRatio * (16.0 / max(-mv.z, 0.8)) * (1.0 + f);
}
`,E=`
precision mediump float;
uniform vec3 uColor;
varying float vAlpha;
${j}
void main(){
  float a = pointAlpha(gl_PointCoord) * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uColor, a);
}
`;function _({data:e}){const o=n.useRef(),t=f.quality==="low"?420:1200,s=n.useMemo(()=>{const c=new R,r=new Float32Array(t*3),a=new Float32Array(t*3),v=new Float32Array(t),u=new Float32Array(t),A=24;for(let l=0;l<t;l++){const w=Math.floor(Math.random()*A),T=w%4*.26,S=1.4+Math.random()*3;r[l*3]=-d*.5-5.4+T+Math.random()*S,r[l*3+1]=b*.42-w*.3,r[l*3+2]=.4+Math.random()*.6,a[l*3]=(Math.random()-.5)*d*.92,a[l*3+1]=(Math.random()-.5)*b*.86,a[l*3+2]=.06,v[l]=Math.random(),u[l]=w}return c.setAttribute("position",new p(r,3)),c.setAttribute("aTarget",new p(a,3)),c.setAttribute("aSeed",new p(v,1)),c.setAttribute("aRow",new p(u,1)),c.boundingSphere=new I(new k,40),c},[t]),m=n.useMemo(()=>({uTime:{value:0},uFlow:{value:0},uPixelRatio:{value:1},uOpacity:{value:1},uColor:{value:new h("#b7ff6a")}}),[]);return x((c,r)=>{var u;if(!e.current.active)return;const a=(u=o.current)==null?void 0:u.uniforms;if(!a)return;a.uTime.value+=r,a.uPixelRatio.value=f.dpr;const v=e.current.local;a.uFlow.value=y.smoothstep(v,.5,.86),a.uOpacity.value=y.smoothstep(v,.16,.34)*e.current.band}),i.jsx("points",{geometry:s,frustumCulled:!1,children:i.jsx("shaderMaterial",{ref:o,args:[{uniforms:m,vertexShader:U,fragmentShader:E}],transparent:!0,depthWrite:!1,blending:C})})}function W(){const{group:e,d:o}=F("web"),t=n.useRef();return x(()=>{var s;!o.current.active||!e.current||(e.current.rotation.y=-.15+f.smooth.x*.045+Math.sin(o.current.t*.13)*.02,e.current.rotation.x=f.smooth.y*.025,e.current.position.y=g.web.y+Math.sin(o.current.t*.32)*.12,(s=t.current)!=null&&s.material.uniforms&&(t.current.material.uniforms.uOpacity.value=.13*o.current.band))}),i.jsxs("group",{ref:e,position:g.web,children:[i.jsx(O,{ref:t,size:26,opacity:.13,falloff:2.5,position:[0,0,-1.4]}),i.jsx(B,{data:o}),i.jsx(_,{data:o})]})}export{G as STAGES,W as default};

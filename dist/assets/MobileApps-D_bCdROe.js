import{r as n,j as i}from"./index-BG62i9z_.js";import{V as m,b as N,_ as O,d as U,u as C,a as V,A as E,R as T,s as z,C as D,M as _,N as G}from"./Universe-BCfGxXRM.js";import"./business-BUqQ7y0s.js";function L(r,e=Math.PI/3){const o=Math.cos(e),c=(1+1e-10)*100,t=[new m,new m,new m],a=new m,l=new m,h=new m,p=new m;function k(v){const A=~~(v.x*c),u=~~(v.y*c),M=~~(v.z*c);return`${A},${u},${M}`}const y=r.index?r.toNonIndexed():r,s=y.attributes.position,x={};for(let v=0,A=s.count/3;v<A;v++){const u=3*v,M=t[0].fromBufferAttribute(s,u+0),w=t[1].fromBufferAttribute(s,u+1),P=t[2].fromBufferAttribute(s,u+2);a.subVectors(P,w),l.subVectors(M,w);const d=new m().crossVectors(a,l).normalize();for(let S=0;S<3;S++){const R=t[S],g=k(R);g in x||(x[g]=[]),x[g].push(d)}}const I=new Float32Array(s.count*3),b=new N(I,3,!1);for(let v=0,A=s.count/3;v<A;v++){const u=3*v,M=t[0].fromBufferAttribute(s,u+0),w=t[1].fromBufferAttribute(s,u+1),P=t[2].fromBufferAttribute(s,u+2);a.subVectors(P,w),l.subVectors(M,w),h.crossVectors(a,l).normalize();for(let d=0;d<3;d++){const S=t[d],R=k(S),g=x[R];p.set(0,0,0);for(let B=0,F=g.length;B<F;B++){const j=g[B];h.dot(j)>o&&p.add(j)}p.normalize(),b.setXYZ(u+d,p.x,p.y,p.z)}}return y.setAttribute("normal",b),y}const f=1e-5;function q(r,e,o){const c=new U,t=o-f;return c.absarc(f,f,f,-Math.PI/2,-Math.PI,!0),c.absarc(f,e-t*2,f,Math.PI,Math.PI/2,!0),c.absarc(r-t*2,e-t*2,f,Math.PI/2,0,!0),c.absarc(r-t*2,f,f,0,-Math.PI/2,!0),c}const $=n.forwardRef(function({args:[e=1,o=1,c=1]=[],radius:t=.05,steps:a=1,smoothness:l=4,bevelSegments:h=4,creaseAngle:p=.4,children:k,...y},s){const x=n.useMemo(()=>q(e,o,t),[e,o,t]),I=n.useMemo(()=>({depth:c-t*2,bevelEnabled:!0,bevelSegments:h*2,steps:a,bevelSize:t-f,bevelThickness:t,curveSegments:l}),[c,t,l]),b=n.useRef(null);return n.useLayoutEffect(()=>{b.current&&(b.current.center(),L(b.current,p))},[x,I]),n.createElement("mesh",O({ref:s},y),n.createElement("extrudeGeometry",{ref:b,args:[x,I]}),k)}),H=["Splash","Login","Dashboard","Booking","Payments","Analytics"],K=`
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,X=`
precision highp float;

uniform float uTime;
uniform float uPhase;     // 0..(N-1), continuous position through the screens
uniform float uOpacity;
uniform vec3  uAccent;
uniform vec3  uInk;

varying vec2 vUv;

${G}

const float ASPECT = 2.125;   // screen height / width

// ── SDF primitives ──
float rbox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float seg(vec2 p, vec2 a, vec2 b){
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
// Crisp fill with derivative-based antialiasing.
float fill(float d){ return 1.0 - smoothstep(0.0, fwidth(d) * 1.5, d); }
float ring(float d, float w){ return 1.0 - smoothstep(0.0, fwidth(d) * 1.5, abs(d) - w); }

// Accumulator: rgb carries colour, a carries coverage.
void put(inout vec4 dst, float cov, vec3 col){
  dst.rgb = mix(dst.rgb, col, clamp(cov, 0.0, 1.0));
  dst.a = max(dst.a, clamp(cov, 0.0, 1.0));
}

vec3 SURF(){ return vec3(0.135, 0.146, 0.158); }
vec3 DIM(){  return vec3(0.40, 0.43, 0.46); }

// ── 0 · Splash ──
vec4 sSplash(vec2 p, float t){
  vec4 o = vec4(0.0);
  float pulse = 0.5 + 0.5 * sin(t * 2.0);
  put(o, ring(length(p) - 0.115, 0.006), uAccent * (0.7 + pulse * 0.5));
  put(o, fill(length(p) - 0.038), uAccent);
  put(o, fill(rbox(p - vec2(0.0, -0.30), vec2(0.115, 0.011), 0.011)), DIM());
  return o;
}

// ── 1 · Login ──
vec4 sLogin(vec2 p, float t){
  vec4 o = vec4(0.0);
  put(o, fill(rbox(p - vec2(0.0, 0.60), vec2(0.15, 0.018), 0.018)), vec3(0.85));
  put(o, fill(rbox(p - vec2(0.0, 0.50), vec2(0.10, 0.009), 0.009)), DIM());
  // Fields — the focused one carries an accent underline and a caret.
  for (int i = 0; i < 2; i++){
    float y = 0.16 - float(i) * 0.145;
    put(o, fill(rbox(p - vec2(0.0, y), vec2(0.185, 0.048), 0.022)), SURF());
    put(o, ring(rbox(p - vec2(0.0, y), vec2(0.185, 0.048), 0.022), 0.0016),
        i == 0 ? uAccent * 0.8 : vec3(0.18));
    put(o, fill(rbox(p - vec2(-0.10, y), vec2(0.055, 0.008), 0.008)), DIM());
  }
  float caret = step(0.5, fract(t * 1.0));
  put(o, fill(rbox(p - vec2(0.02, 0.16), vec2(0.002, 0.020), 0.001)) * caret, uAccent);
  put(o, fill(rbox(p - vec2(0.0, -0.16), vec2(0.185, 0.050), 0.024)), uAccent);
  put(o, fill(rbox(p - vec2(0.0, -0.16), vec2(0.055, 0.009), 0.009)), vec3(0.03, 0.06, 0.02));
  put(o, fill(rbox(p - vec2(0.0, -0.30), vec2(0.075, 0.007), 0.007)), DIM() * 0.7);
  return o;
}

// ── 2 · Dashboard ──
vec4 sDash(vec2 p, float t){
  vec4 o = vec4(0.0);
  put(o, fill(rbox(p - vec2(-0.11, 0.86), vec2(0.075, 0.016), 0.014)), vec3(0.85));
  put(o, fill(length(p - vec2(0.165, 0.86)) - 0.026), SURF());
  // Stat tiles, one highlighted.
  for (int i = 0; i < 4; i++){
    float cx = (mod(float(i), 2.0) - 0.5) * 0.20;
    float cy = 0.60 - floor(float(i) / 2.0) * 0.185;
    put(o, fill(rbox(p - vec2(cx, cy), vec2(0.093, 0.078), 0.026)), SURF());
    put(o, fill(rbox(p - vec2(cx - 0.045, cy + 0.035), vec2(0.030, 0.008), 0.008)), DIM());
    vec3 c = i == 0 ? uAccent : vec3(0.78);
    put(o, fill(rbox(p - vec2(cx - 0.030, cy - 0.012), vec2(0.045, 0.017), 0.010)), c);
    // Tiny sparkline in each tile.
    for (int k = 0; k < 5; k++){
      float fx = cx - 0.055 + float(k) * 0.028;
      float h = 0.010 + 0.020 * (0.5 + 0.5 * sin(float(k) * 1.7 + float(i) * 2.3 + t * 0.6));
      put(o, fill(rbox(p - vec2(fx, cy - 0.052 + h * 0.5), vec2(0.006, h * 0.5), 0.004)),
          c * 0.55);
    }
  }
  // Activity rows.
  for (int i = 0; i < 4; i++){
    float y = 0.13 - float(i) * 0.115;
    put(o, fill(rbox(p - vec2(0.0, y), vec2(0.198, 0.046), 0.020)), SURF() * 0.75);
    put(o, fill(length(p - vec2(-0.155, y)) - 0.022), uAccent * 0.35);
    put(o, fill(rbox(p - vec2(-0.045, y + 0.014), vec2(0.070, 0.007), 0.007)), vec3(0.72));
    put(o, fill(rbox(p - vec2(-0.075, y - 0.012), vec2(0.040, 0.006), 0.006)), DIM());
  }
  return o;
}

// ── 3 · Booking ──
vec4 sBooking(vec2 p, float t){
  vec4 o = vec4(0.0);
  // Map plate with a street grid.
  put(o, fill(rbox(p - vec2(0.0, 0.42), vec2(0.205, 0.40), 0.030)), vec3(0.055, 0.075, 0.085));
  for (int i = 0; i < 5; i++){
    float gx = -0.16 + float(i) * 0.08;
    put(o, fill(rbox(p - vec2(gx, 0.42), vec2(0.0015, 0.40), 0.0)) , vec3(0.10, 0.13, 0.14));
    float gy = 0.10 + float(i) * 0.16;
    put(o, fill(rbox(p - vec2(0.0, gy), vec2(0.205, 0.0015), 0.0)), vec3(0.10, 0.13, 0.14));
  }
  // Animated route.
  vec2 a = vec2(-0.13, 0.18), b = vec2(-0.02, 0.42), c = vec2(0.12, 0.66);
  put(o, ring(seg(p, a, b), 0.004), uAccent * 0.9);
  put(o, ring(seg(p, b, c), 0.004), uAccent * 0.9);
  float trav = fract(t * 0.26);
  vec2 car = trav < 0.5 ? mix(a, b, trav * 2.0) : mix(b, c, (trav - 0.5) * 2.0);
  put(o, fill(length(p - car) - 0.017), vec3(1.0));
  put(o, ring(length(p - c) - 0.026, 0.004), uAccent);
  // Booking sheet.
  put(o, fill(rbox(p - vec2(0.0, -0.52), vec2(0.205, 0.28), 0.034)), SURF());
  put(o, fill(rbox(p - vec2(0.0, -0.30), vec2(0.035, 0.005), 0.005)), DIM());
  put(o, fill(rbox(p - vec2(-0.09, -0.40), vec2(0.105, 0.014), 0.010)), vec3(0.85));
  put(o, fill(rbox(p - vec2(-0.12, -0.47), vec2(0.075, 0.008), 0.008)), DIM());
  put(o, fill(rbox(p - vec2(0.0, -0.65), vec2(0.175, 0.045), 0.022)), uAccent);
  put(o, fill(rbox(p - vec2(0.0, -0.65), vec2(0.048, 0.008), 0.008)), vec3(0.03, 0.06, 0.02));
  return o;
}

// ── 4 · Payments ──
vec4 sPayments(vec2 p, float t){
  vec4 o = vec4(0.0);
  // Card with a sheen that travels across it.
  vec2 cp = p - vec2(0.0, 0.52);
  float card = rbox(cp, vec2(0.195, 0.125), 0.030);
  put(o, fill(card), vec3(0.10, 0.13, 0.12));
  float sheen = smoothstep(0.10, 0.0, abs(cp.x - cp.y * 0.6 - (fract(t * 0.18) * 0.7 - 0.35)));
  put(o, fill(card) * sheen * 0.5, uAccent * 0.5);
  put(o, fill(rbox(cp - vec2(-0.125, 0.055), vec2(0.030, 0.022), 0.008)), uAccent * 0.75);
  put(o, fill(rbox(cp - vec2(-0.045, -0.045), vec2(0.110, 0.010), 0.008)), vec3(0.70));
  // Amount.
  put(o, fill(rbox(p - vec2(0.0, 0.25), vec2(0.090, 0.026), 0.012)), vec3(0.92));
  put(o, fill(rbox(p - vec2(0.0, 0.17), vec2(0.048, 0.007), 0.007)), DIM());
  // Keypad — one key lights on a rolling cycle.
  for (int i = 0; i < 12; i++){
    float cx = (mod(float(i), 3.0) - 1.0) * 0.115;
    float cy = -0.02 - floor(float(i) / 3.0) * 0.135;
    float hot = step(0.5, 1.0 - abs(mod(t * 1.6, 12.0) - float(i)));
    put(o, fill(length(p - vec2(cx, cy)) - 0.042), mix(SURF(), uAccent * 0.55, hot));
    put(o, fill(rbox(p - vec2(cx, cy), vec2(0.014, 0.011), 0.005)), mix(vec3(0.75), vec3(1.0), hot));
  }
  put(o, fill(rbox(p - vec2(0.0, -0.72), vec2(0.185, 0.048), 0.024)), uAccent);
  return o;
}

// ── 5 · Analytics ──
vec4 sAnalytics(vec2 p, float t){
  vec4 o = vec4(0.0);
  put(o, fill(rbox(p - vec2(-0.11, 0.88), vec2(0.085, 0.016), 0.014)), vec3(0.85));
  // Trend line built from short segments, with a filled area beneath.
  for (int i = 0; i < 7; i++){
    float x0 = -0.18 + float(i) * 0.06;
    float x1 = x0 + 0.06;
    float y0 = 0.42 + 0.11 * sin(float(i) * 0.9 + t * 0.4);
    float y1 = 0.42 + 0.11 * sin(float(i + 1) * 0.9 + t * 0.4);
    put(o, ring(seg(p, vec2(x0, y0), vec2(x1, y1)), 0.0035), uAccent);
    // Cheap area fill: a box from the baseline up to the midpoint.
    float ym = (y0 + y1) * 0.5;
    put(o, fill(rbox(p - vec2((x0 + x1) * 0.5, (0.22 + ym) * 0.5),
                     vec2(0.030, (ym - 0.22) * 0.5), 0.0)) * 0.18, uAccent);
  }
  put(o, fill(rbox(p - vec2(0.0, 0.22), vec2(0.205, 0.0012), 0.0)), vec3(0.16));
  // Bar chart.
  for (int i = 0; i < 6; i++){
    float x = -0.165 + float(i) * 0.066;
    float h = 0.045 + 0.105 * (0.5 + 0.5 * sin(float(i) * 1.4 + t * 0.55));
    vec3 c = i == 3 ? uAccent : vec3(0.26, 0.31, 0.30);
    put(o, fill(rbox(p - vec2(x, -0.34 + h * 0.5), vec2(0.021, h * 0.5), 0.010)), c);
  }
  // Legend rows.
  for (int i = 0; i < 3; i++){
    float y = -0.56 - float(i) * 0.085;
    put(o, fill(length(p - vec2(-0.165, y)) - 0.012), i == 0 ? uAccent : DIM() * 0.8);
    put(o, fill(rbox(p - vec2(-0.075, y), vec2(0.065, 0.007), 0.007)), DIM());
    put(o, fill(rbox(p - vec2(0.135, y), vec2(0.032, 0.008), 0.008)), vec3(0.70));
  }
  return o;
}

vec4 screenAt(int id, vec2 p, float t){
  if (id == 0) return sSplash(p, t);
  if (id == 1) return sLogin(p, t);
  if (id == 2) return sDash(p, t);
  if (id == 3) return sBooking(p, t);
  if (id == 4) return sPayments(p, t);
  return sAnalytics(p, t);
}

void main(){
  vec2 p = (vUv - 0.5) * vec2(1.0, ASPECT);

  // Hold each screen, then cut quickly. A linear crossfade would leave the
  // display looking permanently half-dissolved.
  float ph = clamp(uPhase, 0.0, 5.0);
  int ia = int(floor(ph));
  int ib = min(ia + 1, 5);
  float f = smoothstep(0.68, 1.0, fract(ph));

  // Slide: outgoing screen exits left, incoming enters from the right.
  vec4 A = screenAt(ia, p + vec2(f * 0.22, 0.0), uTime);
  vec4 B = screenAt(ib, p - vec2((1.0 - f) * 0.22, 0.0), uTime);

  vec3 col = mix(A.rgb, B.rgb, f);
  float cov = mix(A.a, B.a * step(0.001, f), f);

  // Status bar and home indicator persist across every screen.
  float chrome = fill(rbox(p - vec2(-0.175, 0.985), vec2(0.030, 0.007), 0.006))
               + fill(rbox(p - vec2(0.170, 0.985), vec2(0.022, 0.007), 0.006))
               + fill(rbox(p - vec2(0.0, -1.010), vec2(0.060, 0.005), 0.005));
  col = mix(col, vec3(0.62), clamp(chrome, 0.0, 1.0));
  cov = max(cov, clamp(chrome, 0.0, 1.0) * 0.8);

  // Panel backlight + a faint vignette so the display reads as glass, not paper.
  vec3 bg = vec3(0.030, 0.034, 0.039);
  vec3 outc = mix(bg, col, cov);
  outc *= 1.0 - smoothstep(0.5, 0.85, length(p * vec2(1.0, 0.52))) * 0.16;
  outc += snoise(vec3(vUv * 220.0, uTime * 0.5)) * 0.004;

  gl_FragColor = vec4(outc * uOpacity, uOpacity);
}
`;function Y({data:r}){const e=n.useRef(),o=n.useMemo(()=>({uTime:{value:0},uPhase:{value:0},uOpacity:{value:1},uAccent:{value:new D("#b7ff6a")},uInk:{value:new D("#05080a")}}),[]);return V((c,t)=>{var h;if(!r.current.active)return;const a=(h=e.current)==null?void 0:h.uniforms;if(!a)return;a.uTime.value+=t;const l=_.smoothstep(r.current.local,.12,.94);a.uPhase.value=l*(H.length-1),a.uOpacity.value=r.current.band}),i.jsxs("mesh",{position:[0,0,.152],children:[i.jsx("planeGeometry",{args:[2.86,6.05]}),i.jsx("shaderMaterial",{ref:e,args:[{uniforms:o,vertexShader:K,fragmentShader:X}],transparent:!0})]})}const Z=`
varying vec3 vN;
varying vec3 vV;
void main(){
  vec4 world = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,J=`
precision highp float;
uniform vec3  uAccent;
uniform float uOpacity;
varying vec3 vN;
varying vec3 vV;

void main(){
  vec3 n = normalize(vN);
  float fres = pow(1.0 - abs(dot(n, normalize(vV))), 3.0);

  vec3 key = normalize(vec3(0.6, 1.0, 0.55));
  vec3 rim = normalize(vec3(-0.7, 0.2, -0.6));
  float kd = max(dot(n, key), 0.0);
  float rd = pow(max(dot(n, rim), 0.0), 2.4);

  // Graphite, lit like a product shot: neutral speculars carry the form and
  // the accent only kisses the edge. Driving the rim with the brand colour at
  // 0.8 turned the whole chassis into a glowing green wireframe.
  vec3 col = vec3(0.042, 0.048, 0.054);
  col += vec3(0.85, 0.90, 0.96) * pow(kd, 34.0) * 0.85;   // tight softbox hit
  col += vec3(0.30, 0.34, 0.40) * pow(kd, 3.0) * 0.16;    // body falloff
  col += vec3(0.55, 0.60, 0.68) * rd * 0.28;              // cool back rim
  col += uAccent * fres * 0.16;                           // faint accent edge

  gl_FragColor = vec4(col * uOpacity, uOpacity);
}
`;function Q({data:r}){const e=n.useRef(),o=n.useMemo(()=>({uAccent:{value:new D("#b7ff6a")},uOpacity:{value:1}}),[]);return V(()=>{r.current.active&&e.current&&(e.current.uniforms.uOpacity.value=r.current.band)}),i.jsx($,{args:[3.15,6.35,.3],radius:.38,smoothness:5,creaseAngle:.5,children:i.jsx("shaderMaterial",{ref:e,args:[{uniforms:o,vertexShader:Z,fragmentShader:J}],transparent:!0})})}function o0(){const{group:r,d:e}=C("mobile"),o=n.useRef(),c=n.useRef();return V(()=>{var l;if(!e.current.active||!o.current)return;const a=-.9+e.current.local*2.2;o.current.rotation.y=a+z.smooth.x*.22,o.current.rotation.x=.06+Math.sin(e.current.t*.28)*.05-z.smooth.y*.12,o.current.rotation.z=Math.sin(e.current.t*.22)*.035,o.current.position.y=Math.sin(e.current.t*.4)*.16,(l=c.current)!=null&&l.material.uniforms&&(c.current.material.uniforms.uOpacity.value=.2*e.current.band,c.current.position.y=o.current.position.y)}),i.jsxs("group",{ref:r,position:E.mobile,children:[i.jsxs("group",{ref:o,children:[i.jsx(Q,{data:e}),i.jsx(Y,{data:e}),i.jsxs("mesh",{position:[0,0,-.153],rotation:[0,Math.PI,0],children:[i.jsx("planeGeometry",{args:[2.86,6.05]}),i.jsx("meshBasicMaterial",{color:"#070a0c"})]})]}),i.jsx(T,{ref:c,size:18,opacity:.2,falloff:2.6,position:[0,0,-1.6]})]})}export{H as SCREENS,o0 as default};

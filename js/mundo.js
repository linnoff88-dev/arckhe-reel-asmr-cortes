// O mundo 3D do reel. Cada quadro é desenhado só a partir do tempo t (evento hf-seek do HyperFrames):
// nada de física rodando, então todo render sai igual.
//
// A fruta é uma elipse dividida em células (a grade da rodada). Cada célula é um cubo, e o shader
// lança um raio da câmera e corta esse cubo pela elipse: a face de fora mostra a casca, a face de
// corte mostra o miolo na cor certa daquela posição. Cortar = abrir uma folga entre células.
import * as THREE from 'three';
import { RODADAS, GOLPES, FINAL, DURACAO, contagem, rodadaEm, rng } from './cortes.js';
import { OBJETO } from '../objeto.js';

const W = 1080, H = 1920;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const io = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const out3 = (k) => 1 - Math.pow(1 - k, 3);
const quica = (k) => { // pousa com um quique pequeno
  if (k >= 1) return 1;
  const a = out3(clamp(k / 0.7));
  return k < 0.7 ? a : 1 + Math.sin(((k - 0.7) / 0.3) * Math.PI) * 0.06;
};

// ------------------------------------------------------------------ cena
const canvas = document.getElementById('world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H, false); renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0c10);
const camera = new THREE.PerspectiveCamera(36, W / H, 0.5, 400);

const LUZ = new THREE.Vector3(-0.45, 1, 0.55).normalize();
scene.add(new THREE.HemisphereLight(0xfff4e0, 0x1a1a22, 0.9));
const sol = new THREE.DirectionalLight(0xfff1dc, 1.6); sol.position.copy(LUZ).multiplyScalar(60); scene.add(sol);
const contra = new THREE.DirectionalLight(0x9cc3e6, 0.5); contra.position.set(30, 20, -40); scene.add(contra);

// bancada e tábua (ardósia escura, borda clara fina)
const bancada = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x17171d, roughness: 0.95 }));
bancada.rotation.x = -Math.PI / 2; bancada.position.y = -1.6; scene.add(bancada);
const tabua = new THREE.Mesh(new THREE.BoxGeometry(30, 1.6, 22), new THREE.MeshStandardMaterial({ color: 0x23232b, roughness: 0.7 }));
tabua.position.y = -0.8; scene.add(tabua);
const filete = new THREE.Mesh(new THREE.BoxGeometry(30.4, 0.05, 22.4), new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4, emissive: 0x3a2e00 }));
filete.position.y = -0.07; // fica só como borda, abaixo do tampo scene.add(filete);

// sombra de contato (uma mancha macia debaixo da fruta)
function texSombra() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const sombra = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texSombra(), transparent: true, depthWrite: false }));
sombra.rotation.x = -Math.PI / 2; sombra.position.y = 0.01; scene.add(sombra);

// ------------------------------------------------------------------ os três potes
const R = OBJETO.raios;
const corV = (c) => new THREE.Color().setRGB(c[0], c[1], c[2], THREE.SRGBColorSpace); // cores do objeto.js são sRGB
const POTES = [-4.4, 0, 4.4].map((x) => new THREE.Vector3(x, 0, -16));
const vidro = new THREE.MeshStandardMaterial({ color: 0xdfe8f0, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.22, depthWrite: false });
const corPedaco = corV(OBJETO.camadas[0].cor), corPasta = corV(OBJETO.pasta);
const recheios = POTES.map((p, i) => {
  const pote = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.85, 6, 48, 1, true), vidro);
  pote.position.set(p.x, 3, p.z); scene.add(pote);
  const fundo = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 0.25, 48), vidro); fundo.position.set(p.x, 0.12, p.z); scene.add(fundo);
  const cor = corPedaco.clone().lerp(corPasta, i / 2);
  const m = new THREE.MeshStandardMaterial({ color: cor, roughness: i === 2 ? 0.25 : 0.8 });
  const r = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.75, 1, 48), m);
  r.position.set(p.x, 0.25, p.z); r.scale.y = 0.001; scene.add(r);
  return r;
});

// ------------------------------------------------------------------ o shader da fruta
const VERT = /* glsl */`
  attribute vec3 aCasa; attribute vec3 aMeia; attribute vec4 aMov;
  uniform vec3 uPos;
  varying vec3 vW; varying vec3 vO; varying vec3 vCasa; varying vec3 vMeia;
  void main() {
    vec3 meia = aMeia * aMov.w;
    vec3 o = aMov.xyz + uPos;               // onde fica a origem da fruta para esta célula
    vec3 w = aCasa + position * meia + o;   // BoxGeometry(2,2,2): position vai de -1 a 1
    vW = w; vO = o; vCasa = aCasa; vMeia = meia;
    gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
  }`;
const FRAG = /* glsl */`
  uniform mat4 projectionMatrix;
  uniform vec3 uR; uniform vec3 uLuz; uniform float uPasta; uniform vec3 uCorPasta;
  uniform float uAte[4]; uniform vec3 uCor[4]; uniform int uN;
  uniform vec4 uSem; uniform vec2 uSemZona; uniform vec3 uSemCor;   // uSem = passo, tamanho, densidade, liga
  uniform vec4 uAnel; uniform vec3 uAnelCor;                         // uAnel = largura, de, ate, liga
  varying vec3 vW; varying vec3 vO; varying vec3 vCasa; varying vec3 vMeia;
  float h1(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  vec3 dentro(vec3 p) {
    float rr = length(p / uR);
    vec3 c = uCor[uN - 1];
    for (int i = 0; i < 4; i++) { if (i < uN && rr <= uAte[i]) { c = uCor[i]; break; } }
    if (uAnel.w > 0.5 && rr >= uAnel.y && rr <= uAnel.z && mod(floor(rr / uAnel.x), 2.0) > 0.5) c = uAnelCor;
    if (uSem.w > 0.5 && rr >= uSemZona.x && rr <= uSemZona.y) {
      vec3 cel = floor(p / uSem.x);
      vec3 centro = (cel + 0.2 + 0.6 * vec3(h1(cel), h1(cel + 19.1), h1(cel + 47.3))) * uSem.x;
      if (h1(cel + 3.3) < uSem.z && length(p - centro) < uSem.y) c = uSemCor;
    }
    c *= 0.93 + 0.14 * h1(floor(p * 7.0));
    return mix(c, uCorPasta, uPasta);
  }
  void main() {
    vec3 ro = cameraPosition - vO;
    vec3 rd = normalize(vW - cameraPosition);
    vec3 inv = 1.0 / rd;
    vec3 ta = (vCasa - vMeia - ro) * inv, tb = (vCasa + vMeia - ro) * inv;
    vec3 tmn = min(ta, tb), tmx = max(ta, tb);
    float b0 = max(max(tmn.x, tmn.y), tmn.z), b1 = min(min(tmx.x, tmx.y), tmx.z);
    vec3 oe = ro / uR, de = rd / uR;
    float A = dot(de, de), B = dot(oe, de), C = dot(oe, oe) - 1.0, D = B * B - A * C;
    if (D < 0.0) discard;
    D = sqrt(D);
    float e0 = (-B - D) / A, e1 = (-B + D) / A;
    float t0 = max(b0, e0), t1 = min(b1, e1);
    if (t0 > t1 || t1 < 0.0) discard;
    vec3 p = ro + rd * t0;
    vec3 n;
    bool casca = e0 >= b0;
    if (casca) n = normalize(p / (uR * uR));
    else if (b0 == tmn.x) n = vec3(-sign(rd.x), 0.0, 0.0);
    else if (b0 == tmn.y) n = vec3(0.0, -sign(rd.y), 0.0);
    else n = vec3(0.0, 0.0, -sign(rd.z));
    vec3 c = dentro(p);
    float dif = max(dot(n, uLuz), 0.0);
    float brilho = pow(max(dot(reflect(-uLuz, n), -rd), 0.0), casca ? 30.0 : 14.0) * (casca ? 0.35 : 0.22);
    float borda = pow(clamp(1.0 - dot(n, -rd), 0.0, 1.0), 3.0) * 0.18;
    vec3 col = c * (0.34 + 0.86 * dif) + brilho + borda * vec3(0.6, 0.72, 0.9);
    vec4 clip = projectionMatrix * viewMatrix * vec4(p + vO, 1.0);
    gl_FragDepth = (clip.z / clip.w) * 0.5 + 0.5;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

function uniformes() {
  const cam = OBJETO.camadas.slice(0, 4);
  const s = OBJETO.sementes, a = OBJETO.aneis;
  return {
    uR: { value: new THREE.Vector3(...R) }, uLuz: { value: LUZ }, uPos: { value: new THREE.Vector3() },
    uPasta: { value: 0 }, uCorPasta: { value: corPasta },
    uAte: { value: [0, 1, 2, 3].map((i) => (cam[i] ? cam[i].ate : 9)) },
    uCor: { value: [0, 1, 2, 3].map((i) => corV((cam[i] || cam[cam.length - 1]).cor)) },
    uN: { value: cam.length },
    uSem: { value: new THREE.Vector4(s ? s.passo : 1, s ? s.tamanho : 0, s ? s.densidade : 0, s ? 1 : 0) },
    uSemZona: { value: new THREE.Vector2(s ? s.de : 0, s ? s.ate : 0) },
    uSemCor: { value: corV(s ? s.cor : [0, 0, 0]) },
    uAnel: { value: new THREE.Vector4(a ? a.largura : 1, a ? a.de : 0, a ? a.ate : 0, a ? 1 : 0) },
    uAnelCor: { value: corV(a ? a.cor : [0, 0, 0]) },
  };
}

// ------------------------------------------------------------------ uma fruta por rodada
const CUBO = new THREE.BoxGeometry(2, 2, 2);
const frutas = RODADAS.map((r, i) => {
  const [nx, ny, nz] = r.grade;
  const passo = [2 * R[0] / nx, 2 * R[1] / ny, 2 * R[2] / nz];
  const cels = [];
  for (let ix = 0; ix < nx; ix++) for (let iy = 0; iy < ny; iy++) for (let iz = 0; iz < nz; iz++) {
    const c = [-R[0] + (ix + 0.5) * passo[0], -R[1] + (iy + 0.5) * passo[1], -R[2] + (iz + 0.5) * passo[2]];
    // a célula entra se o cubo dela encosta na elipse
    let s = 0;
    for (let k = 0; k < 3; k++) { const q = clamp(0, c[k] - passo[k] / 2, c[k] + passo[k] / 2); s += (q / R[k]) ** 2; }
    if (s < 1) cels.push({ ix, iy, iz, c });
  }
  const n = cels.length;
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = CUBO.index; geo.attributes.position = CUBO.attributes.position;
  const casa = new Float32Array(n * 3), meia = new Float32Array(n * 3), mov = new Float32Array(n * 4);
  const sorte = rng((OBJETO.semente || 1) + i * 7919);
  const extra = cels.map(() => [sorte() * 2 - 1, sorte(), sorte() * 2 - 1, sorte()]);
  cels.forEach((e, k) => { casa.set(e.c, k * 3); meia.set([passo[0] / 2, passo[1] / 2, passo[2] / 2], k * 3); mov[k * 4 + 3] = 1; });
  geo.setAttribute('aCasa', new THREE.InstancedBufferAttribute(casa, 3));
  geo.setAttribute('aMeia', new THREE.InstancedBufferAttribute(meia, 3));
  const aMov = new THREE.InstancedBufferAttribute(mov, 4); aMov.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aMov', aMov);
  geo.instanceCount = n;
  const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: uniformes() });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.visible = false; scene.add(mesh);
  return { r, i, cels, extra, passo, mov, aMov, mesh, mat, golpes: GOLPES[i] };
});

// quando cada plano de corte (x e z) foi cortado nesta rodada
frutas.forEach((f) => {
  f.planoX = new Array(f.r.grade[0] - 1).fill(Infinity);
  f.planoZ = new Array(f.r.grade[2] - 1).fill(Infinity);
  f.picar = [];
  for (const g of f.golpes) for (const p of g.planos) {
    if (g.eixo === 'x') f.planoX[p] = g.t; else if (g.eixo === 'z') f.planoZ[p] = g.t; else f.picar.push(g.t);
  }
});
const abre = (t, tc) => out3(ramp(t, tc, tc + 0.14));
// deslocamento acumulado de cada fileira: soma das folgas já abertas à esquerda dela
function folgas(planos, t, folga) {
  const s = new Float32Array(planos.length + 1);
  for (let j = 0; j < planos.length; j++) s[j + 1] = s[j] + folga * abre(t, planos[j]);
  const meio = s[planos.length] / 2;
  for (let j = 0; j <= planos.length; j++) s[j] -= meio;
  return s;
}

function desenharFruta(f, t) {
  const { r, cels, extra, mov } = f;
  const fimDespeja = r.despeja + 1.7;
  f.mesh.visible = t >= r.cai - 0.4 && t < fimDespeja;
  if (!f.mesh.visible) return 0;
  const pouso = quica(ramp(t, r.cai - 0.4, r.cai + 0.15));
  const uPos = f.mat.uniforms.uPos.value;
  uPos.set(0, R[1] + (1 - pouso) * 26, 0);
  const sx = folgas(f.planoX, t, r.folga), sz = folgas(f.planoZ, t, r.folga);
  // picar: o monte espalha, achata e os pedaços encolhem conforme os golpes
  let feitos = 0; for (const tp of f.picar) if (tp <= t) feitos++;
  const pic = f.picar.length ? out3(feitos / f.picar.length) : 0;
  f.mat.uniforms.uPasta.value = f.i === 2 ? clamp((pic - 0.55) / 0.45) * 0.85 : 0;
  const alvo = POTES[f.i];
  for (let k = 0; k < cels.length; k++) {
    const e = cels[k], x = extra[k];
    let dx = sx[e.ix], dz = sz[e.iz], dy = 0, esc = 1;
    if (pic > 0) {
      const base = e.c[1] + R[1];
      dx += pic * (e.c[0] * 0.55 + x[0] * 1.6);
      dz += pic * (e.c[2] * 0.45 + x[2] * 1.6);
      dy += pic * (base * 0.32 - base + e.iy * 0.05);
      esc = 1 - 0.38 * pic;
    }
    const d = io(ramp(t, r.despeja + x[3] * 0.55, r.despeja + x[3] * 0.55 + 0.75));
    if (d > 0) {
      const wx = e.c[0] + dx, wy = e.c[1] + dy + R[1], wz = e.c[2] + dz;
      dx += d * (alvo.x - wx); dz += d * (alvo.z - wz);
      dy += d * (5 - wy) + Math.sin(Math.PI * d) * 7;
      esc *= 1 - d;
    }
    mov[k * 4] = dx; mov[k * 4 + 1] = dy; mov[k * 4 + 2] = dz; mov[k * 4 + 3] = esc;
  }
  f.aMov.needsUpdate = true;
  return pouso * (1 - ramp(t, r.despeja, r.despeja + 0.6)) * (1 + pic * 0.6);
}

// ------------------------------------------------------------------ as lâminas
const aco = new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 0.35, roughness: 0.3 });
const cabo = new THREE.MeshStandardMaterial({ color: 0x3a3a44, roughness: 0.6 });
const rig = new THREE.Group(); scene.add(rig);
const laminas = Array.from({ length: 10 }, () => {
  const g = new THREE.Group();
  // lâmina baixa e fina: corta sem esconder a fruta; o cabo fica atrás, longe da câmera
  const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.6, 12), aco); l.position.y = 0.8; g.add(l);
  const c = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 4), cabo); c.position.set(0, 1.4, -8); g.add(c);
  rig.add(g); return g;
});

function desenharLaminas(f, t) {
  rig.visible = false;
  if (!f || t < f.r.ini - 0.5 || t > f.r.fim + 0.35) return;
  const gs = f.golpes;
  let k = 0; while (k < gs.length && gs[k].t <= t) k++;
  const ant = gs[k - 1], prox = gs[k];
  const tp = ant ? ant.t : f.r.ini - 0.5, tn = prox ? prox.t : f.r.fim + 0.35;
  const fase = clamp((t - tp) / (tn - tp));
  const alto = Math.min(R[1] * 2 + 1.5, 40 * (tn - tp)); // sobe só o bastante para passar por cima da fruta
  const g = prox || ant;
  rig.visible = true;
  rig.position.y = alto * Math.pow(Math.sin(Math.PI * fase), 0.8);
  rig.rotation.y = g.eixo === 'z' ? Math.PI / 2 : g.eixo === 'picar' ? (g.planos[0] > 0.5 ? Math.PI / 2 : 0) : 0;
  const posDe = (gp) => gp.planos.map((p) => {
    if (gp.eixo === 'picar') return (p - 0.5) * 2 * R[0] * 1.5;
    const n = gp.eixo === 'x' ? f.r.grade[0] : f.r.grade[2], RR = gp.eixo === 'x' ? R[0] : R[2];
    return -RR + ((p + 1) / n) * 2 * RR;
  });
  const a = ant ? posDe(ant) : null, b = posDe(g);
  laminas.forEach((l, j) => {
    l.visible = j < b.length;
    if (!l.visible) return;
    const pb = b[j], pa = a && a[j] !== undefined && ant.eixo === g.eixo ? a[j] : pb + 3;
    const pos = lerp(pa, pb, io(fase));
    // girada 90°, o x local da lâmina aponta para -z no mundo
    l.position.set(rig.rotation.y ? -pos : pos, 0, 0);
  });
}

// ------------------------------------------------------------------ textos por cima
const $ = (id) => document.getElementById(id);
const fmt = (n) => n.toLocaleString('pt-BR');
const chips = RODADAS.map((_, i) => $('chip' + i));
const rotPotes = [0, 1, 2].map((i) => $('pote' + i));
$('titulo').textContent = `${OBJETO.titulo} · 10 → 1.000 cortes`;
function textos(t) {
  const i = rodadaEm(t), r = RODADAS[i];
  $('contador').textContent = fmt(contagem(t, i));
  chips.forEach((c, k) => {
    const pronto = t >= RODADAS[k].fim + 0.1;
    c.className = 'chip' + (k === i && !pronto ? ' agora' : '') + (pronto ? ' feito' : '') + (k > i ? ' depois' : '');
  });
  const fim = ramp(t, FINAL.camera, FINAL.camera + 0.5);
  $('topo').style.opacity = String(1 - 0.35 * fim);
  $('chamada').style.opacity = String(out3(ramp(t, FINAL.chamada, FINAL.chamada + 0.5)));
  const v = new THREE.Vector3();
  rotPotes.forEach((el, k) => {
    v.set(POTES[k].x, 6.6, POTES[k].z).project(camera);
    el.style.left = ((v.x * 0.5 + 0.5) * W).toFixed(1) + 'px';
    el.style.top = ((-v.y * 0.5 + 0.5) * H).toFixed(1) + 'px';
    el.style.opacity = String(out3(ramp(t, FINAL.camera + 1.0, FINAL.camera + 1.5))); // só no plano final
  });
  void r;
}

// ------------------------------------------------------------------ o quadro no tempo t
const CAM_A = { pos: new THREE.Vector3(-15, 31, 27), olha: new THREE.Vector3(0, 1.5, -1.5) }; // de lado: vê a face dos cortes
const CAM_B = { pos: new THREE.Vector3(0, 14, 17), olha: new THREE.Vector3(0, 3, -16) };
const p = new THREE.Vector3(), o = new THREE.Vector3();
function quadro(t) {
  t = clamp(t, 0, DURACAO);
  const k = io(ramp(t, FINAL.camera, FINAL.camera + 1.4));
  p.lerpVectors(CAM_A.pos, CAM_B.pos, k); o.lerpVectors(CAM_A.olha, CAM_B.olha, k);
  camera.position.copy(p); camera.lookAt(o);
  let somb = 0;
  for (const f of frutas) somb = Math.max(somb, desenharFruta(f, t));
  sombra.scale.set(R[0] * 2.6 * (1 + 0.3 * somb), R[2] * 2.6 * (1 + 0.3 * somb), 1);
  sombra.material.opacity = clamp(somb);
  desenharLaminas(frutas[rodadaEm(t)], t);
  recheios.forEach((rc, i) => {
    const r = RODADAS[i];
    const h = io(ramp(t, r.despeja + 0.3, r.despeja + 1.6)) * (1.8 + i * 1.5);
    rc.scale.y = Math.max(0.001, h); rc.position.y = 0.25 + h / 2;
  });
  textos(t);
  renderer.render(scene, camera);
}

// ------------------------------------------------------------------ ligar no HyperFrames
window.addEventListener('hf-seek', (e) => quadro(e.detail.time));
window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady.mundo = Promise.all(['900 40px Montserrat', '800 40px Sora', '700 40px "JetBrains Mono"'].map((f) => document.fonts.load(f)))
  .catch(() => {}).then(() => quadro(window.__hfThreeTime || 0));
quadro(window.__hfThreeTime || 0);

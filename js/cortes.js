// O relógio do reel. Uma lista só de cortes: o contador, as lâminas e o som leem este arquivo.
// Só dados (sem DOM, sem three.js), para o ferramentas/som.mjs importar no Node.
// Tudo vem de número fixo ou de aleatório com semente: o mesmo reel sai igual em todo render.
import { OBJETO } from '../objeto.js';

export const FPS = 30;
export const DURACAO = 36;

// aleatório com semente (mulberry32)
export function rng(semente) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Três rodadas, cada uma 10 vezes a anterior. Uma fruta inteira nova por rodada.
//   cai      = a fruta chega na tábua
//   ini/fim  = primeiro e último corte
//   despeja  = os pedaços vão para o pote da rodada
//   laminas  = quantas lâminas descem juntas em cada golpe
//   grade    = em quantas células a fruta é dividida (x, y, z): o tamanho final do pedaço
//   etapas   = quantos cortes em fatias (x), em tiras (z) e picando o monte (picar)
export const RODADAS = [
  { n: 10, rotulo: '10', cai: 0.0, ini: 0.9, fim: 4.9, despeja: 5.5, laminas: 1,
    grade: [11, 1, 1], etapas: { x: 10, z: 0, picar: 0 }, folga: 0.6 },
  { n: 100, rotulo: '100', cai: 7.0, ini: 7.6, fim: 15.6, despeja: 16.2, laminas: 4,
    grade: [25, 12, 25], etapas: { x: 24, z: 24, picar: 52 }, folga: 0.14 },
  { n: 1000, rotulo: '1.000', cai: 17.8, ini: 18.4, fim: 28.4, despeja: 29.0, laminas: 10,
    grade: [41, 20, 41], etapas: { x: 40, z: 40, picar: 920 }, folga: 0.08 },
];
export const FINAL = { camera: 30.6, pote: 31.8, chamada: 32.4 };

// o tempo acelera dentro de cada etapa: os intervalos encolhem
const acelera = (u) => 1 - Math.pow(1 - u, 1.6);

// golpes de uma etapa: cada golpe desce `laminas` lâminas ao mesmo tempo
function golpesDaEtapa(r, eixo, cortes, t0, t1, sorteio) {
  const L = Math.min(r.laminas, cortes);
  const golpes = Math.ceil(cortes / L);
  const lista = [];
  for (let s = 0; s < golpes; s++) {
    const t = t0 + (t1 - t0) * acelera(golpes === 1 ? 0 : s / (golpes - 1));
    const planos = [];
    for (let j = 0; j < L; j++) {
      const p = s + j * golpes;
      if (eixo === 'picar') planos.push(sorteio());
      else if (p < cortes) planos.push(p);
    }
    lista.push({ t, eixo, planos });
  }
  return lista;
}

const sorteio = rng(OBJETO.semente || 1);
export const GOLPES = []; // por rodada
export const CORTES = []; // todos os cortes, em ordem: { t, rodada, eixo, plano }
RODADAS.forEach((r, i) => {
  const { x, z, picar } = r.etapas;
  // tempo de cada etapa: fatiar e tirar tiras pesam 1, picar pesa 2
  const peso = { x: 1, z: 1, picar: 2 };
  const somaPesos = (x ? 1 : 0) + (z ? 1 : 0) + (picar ? 2 : 0);
  const dur = r.fim - r.ini - 0.12 * ((x ? 1 : 0) + (z ? 1 : 0) + (picar ? 1 : 0) - 1);
  let t = r.ini;
  const g = [];
  for (const [eixo, n] of [['x', x], ['z', z], ['picar', picar]]) {
    if (!n) continue;
    const fatia = dur * (peso[eixo] / somaPesos);
    g.push(...golpesDaEtapa(r, eixo, n, t, Math.min(r.fim, t + fatia), sorteio));
    t = Math.min(r.fim, t + fatia + 0.12);
  }
  GOLPES.push(g);
  for (const gp of g) for (const p of gp.planos) CORTES.push({ t: gp.t, rodada: i, eixo: gp.eixo, plano: p });
});
CORTES.sort((a, b) => a.t - b.t);

// quantos cortes da rodada já aconteceram no tempo t
const porRodada = RODADAS.map((_, i) => CORTES.filter((c) => c.rodada === i).map((c) => c.t));
export function contagem(t, i) {
  const ts = porRodada[i];
  let lo = 0, hi = ts.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (ts[m] <= t) lo = m + 1; else hi = m; }
  return lo;
}
// a rodada que está na tela no tempo t
export function rodadaEm(t) {
  let k = 0;
  RODADAS.forEach((r, i) => { if (t >= r.cai - 0.4) k = i; });
  return k;
}

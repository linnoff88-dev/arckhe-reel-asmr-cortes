// Gera o som do reel a partir da MESMA lista de cortes do contador e das lâminas (js/cortes.js).
// Cada corte vira uma batida no quadro exato em que a lâmina encosta na tábua.
//   node ferramentas/som.mjs   -> assets/cortes-bruto.wav e assets/cortes.wav (-15 LUFS)
import { mkdirSync } from 'node:fs';
import { CORTES, RODADAS, FINAL, DURACAO, rng } from '../js/cortes.js';
import { OBJETO } from '../objeto.js';
import { mixagem, banco, batida, fatia, estalo, baque, grao, molhado, plop, gravarWav, normalizar } from '../som/sintese.mjs';

const raiz = new URL('..', import.meta.url).pathname;
mkdirSync(raiz + 'assets', { recursive: true });
const s = rng((OBJETO.semente || 1) + 99);
const mix = mixagem(DURACAO);
const QUADRO = 1 / 30;

const B = {
  batida: banco(batida, 8, s, 520), batidaFina: banco(batida, 8, s, 760, 0.06),
  fatia: banco(fatia, 8, s), estalo: banco(estalo, 8, s), baque: banco(baque, 4, s),
  grao: banco(grao, 12, s), molhado: banco(molhado, 8, s), plop: banco(plop, 2, s),
};
const um = (lista) => lista[Math.floor(s() * lista.length)];
const varia = () => (s() - 0.5) * 4; // ±2 dB
const lado = () => (s() - 0.5) * 0.5;

// 1) cada corte: a polpa (um pouco antes) + a lâmina na tábua (no quadro do corte)
let ultimo = -1;
for (const c of CORTES) {
  const r = c.rodada;
  const denso = r === 2 && c.eixo === 'picar';
  const db = r === 0 ? 0 : r === 1 ? -5 : -9;
  if (c.t - ultimo > 0.004 || !denso) { // no picar da última rodada, um som por golpe basta
    mix.poe(um(c.eixo === 'picar' ? B.batidaFina : B.batida), c.t + QUADRO / 2, db + varia(), lado());
    if (c.eixo !== 'picar') mix.poe(um(B.fatia), c.t - 0.05, db - 3 + varia(), lado());
    if (OBJETO.sementes && s() < 0.5) mix.poe(um(B.estalo), c.t - 0.01, db - 6 + varia(), lado());
    if (denso && c.t > (RODADAS[2].ini + RODADAS[2].fim) / 2 && s() < 0.35) mix.poe(um(B.molhado), c.t, -10 + varia(), lado());
    ultimo = c.t;
  }
}
// 2) cada fruta pousando na tábua
RODADAS.forEach((r) => mix.poe(um(B.baque), r.cai + 0.15, -2));
// 3) os pedaços caindo no pote: poucos e graúdos na 1ª rodada, uma chuva miúda nas outras
RODADAS.forEach((r, i) => {
  const quantos = [11, 60, 140][i];
  for (let k = 0; k < quantos; k++) {
    const t = r.despeja + 0.5 + s() * 0.9;
    mix.poe(i === 2 && s() < 0.5 ? um(B.molhado) : um(B.grao), t, (i === 0 ? -3 : -12) + varia(), 0.3 + lado());
  }
});
// 4) o fecho: um plop quando a câmera chega nos potes
mix.poe(B.plop[0], FINAL.pote, -4);

gravarWav(raiz + 'assets/cortes-bruto.wav', mix.L, mix.R);
const ok = normalizar(raiz + 'assets/cortes-bruto.wav', raiz + 'assets/cortes.wav');
console.log(ok ? `ok: assets/cortes.wav (${CORTES.length} cortes, ${DURACAO} s)` : 'falhou: ffmpeg não normalizou (assets/cortes-bruto.wav ficou)');
if (!ok) process.exit(1);

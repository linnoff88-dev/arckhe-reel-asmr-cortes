// Posta UM reel aprovado no Instagram pela API oficial da Meta (Graph API, conta profissional).
//
// Como a API funciona: ela não recebe o arquivo. Você dá um LINK PÚBLICO do .mp4 e ela mesma baixa.
// Por isso o script, nesta ordem:
//   1. acha o 1º objeto "aprovado" no objetos.csv e a pasta dele em prontos/
//   2. copia o reel.mp4 para o seu repositório público (LINKS_DIR) e dá push; espera o link responder 200
//   3. cria o "container" do reel  (POST /<IG_USER_ID>/media, media_type=REELS)
//   4. espera o Instagram processar (GET /<container>?fields=status_code até FINISHED)
//   5. publica                       (POST /<IG_USER_ID>/media_publish)
//   6. grava prontos/<nome>/postado.json e muda o objeto para "postado"
//
//   node ferramentas/postar-instagram.mjs --ensaio   mostra o que faria (sem rede, sem token)
//   node ferramentas/postar-instagram.mjs            posta 1 reel aprovado
//
// .env (na raiz, fora do git): IG_USER_ID, IG_ACCESS_TOKEN, LINKS_DIR, LINKS_URL, IG_API_HOST, IG_API_VERSION.
// O token só vai no cabeçalho Authorization. Nunca é impresso, nem em mensagem de erro.
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { ler, mudar } from './status.mjs';

const raiz = new URL('..', import.meta.url).pathname;
const ENSAIO = process.argv.includes('--ensaio');

const env = {};
if (existsSync(raiz + '.env')) for (const l of readFileSync(raiz + '.env', 'utf8').split(/\r?\n/)) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const TOKEN = env.IG_ACCESS_TOKEN || '';
const esconde = (s) => (TOKEN ? String(s).split(TOKEN).join('[token escondido]') : String(s));
const diz = (s) => console.log(esconde(s));
const para = (s) => { console.error(esconde('✗ ' + s)); process.exit(1); };

// ---------------------------------------------------------------- 1. o reel
const aprovado = ler().find((r) => r.status === 'aprovado');
if (!aprovado) { diz('Nenhum objeto "aprovado" no objetos.csv. Nada a postar.'); process.exit(0); }
const pastas = existsSync(raiz + 'prontos') ? readdirSync(raiz + 'prontos').filter((p) => p.endsWith('-' + aprovado.objeto)).sort() : [];
const nome = pastas.pop();
if (!nome) para(`${aprovado.objeto}: não há pasta em prontos/ para ele.`);
const dir = `${raiz}prontos/${nome}/`;
if (existsSync(dir + 'postado.json')) { mudar(aprovado.objeto, 'postado'); diz(`${aprovado.objeto}: já tinha postado.json, só marquei "postado".`); process.exit(0); }
for (const f of ['reel.mp4', 'legenda.txt']) if (!existsSync(dir + f)) para(`${aprovado.objeto}: falta prontos/${nome}/${f}.`);
const legenda = readFileSync(dir + 'legenda.txt', 'utf8').trim();
if (legenda.length > 2200) para('a legenda passa de 2.200 caracteres (limite do Instagram).');
const base = (env.LINKS_URL || 'https://SEU-USUARIO.github.io/links-reels').replace(/\/$/, '');
const link = `${base}/${nome}/reel.mp4`;
diz(`${aprovado.objeto}\n  vídeo:   ${link}\n  legenda: ${legenda}`);
if (ENSAIO) {
  const faltam = ['IG_USER_ID', 'IG_ACCESS_TOKEN', 'LINKS_DIR', 'LINKS_URL'].filter((k) => !env[k]);
  if (faltam.length) diz(`  atenção: falta no .env: ${faltam.join(', ')} (o post de verdade vai parar aqui)`);
  diz('  (ensaio: nada foi enviado)'); process.exit(0);
}

for (const k of ['IG_USER_ID', 'IG_ACCESS_TOKEN', 'LINKS_DIR', 'LINKS_URL']) if (!env[k]) para(`falta ${k} no .env (veja .env.exemplo).`);
const API = `https://${env.IG_API_HOST || 'graph.facebook.com'}/${env.IG_API_VERSION || 'v23.0'}`;
async function api(metodo, caminho, campos = {}) {
  const corpo = metodo === 'POST' ? new URLSearchParams(campos) : undefined;
  const busca = metodo === 'GET' ? '?' + new URLSearchParams(campos) : '';
  const r = await fetch(`${API}/${caminho}${busca}`, { method: metodo, headers: { Authorization: `Bearer ${TOKEN}` }, body: corpo });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`${metodo} ${caminho}: HTTP ${r.status} ${j.error?.message || ''}`);
  return j;
}
const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));

try {
  // ------------------------------------------------------------ 2. link público
  const destino = `${env.LINKS_DIR.replace(/\/$/, '')}/${nome}/`;
  mkdirSync(destino, { recursive: true });
  copyFileSync(dir + 'reel.mp4', destino + 'reel.mp4');
  const git = (...a) => spawnSync('git', ['-C', env.LINKS_DIR, ...a], { encoding: 'utf8' });
  git('add', '-A');
  git('commit', '-m', `reel: ${nome}`);
  const push = git('push');
  if (push.status !== 0) throw new Error(`git push no LINKS_DIR falhou: ${push.stderr.trim().split('\n').pop()}`);
  let no_ar = false;
  for (let k = 0; k < 30 && !no_ar; k++) {
    const r = await fetch(link, { method: 'HEAD' }).catch(() => ({ ok: false }));
    no_ar = r.ok;
    if (!no_ar) await espera(20000);
  }
  if (!no_ar) throw new Error(`o link não respondeu 200 em 10 min: ${link}`);
  diz('  1/4 link público no ar');

  // ------------------------------------------------------------ 3. container
  const { id: container } = await api('POST', `${env.IG_USER_ID}/media`, { media_type: 'REELS', video_url: link, caption: legenda, share_to_feed: 'true' });
  diz(`  2/4 container criado (${container})`);

  // ------------------------------------------------------------ 4. processamento
  let st = 'IN_PROGRESS';
  for (let k = 0; k < 40 && st === 'IN_PROGRESS'; k++) {
    await espera(15000);
    const c = await api('GET', container, { fields: 'status_code,status' });
    st = c.status_code;
    if (st === 'ERROR' || st === 'EXPIRED') throw new Error(`o Instagram não processou: ${st} ${c.status || ''}`);
  }
  if (st !== 'FINISHED') throw new Error(`ainda ${st} depois de 10 min`);
  diz('  3/4 processado');

  // ------------------------------------------------------------ 5. publicar
  const { id: midia } = await api('POST', `${env.IG_USER_ID}/media_publish`, { creation_id: container });
  const { permalink } = await api('GET', midia, { fields: 'permalink' }).catch(() => ({}));
  diz(`  4/4 publicado: ${permalink || midia}`);

  // ------------------------------------------------------------ 6. registrar
  writeFileSync(dir + 'postado.json', JSON.stringify({ midia, permalink, link, quando: new Date().toISOString() }, null, 2));
  mudar(aprovado.objeto, 'postado');
} catch (e) {
  // o objeto continua "aprovado": a próxima rodada tenta de novo
  para(`${aprovado.objeto} não foi postado: ${e.message}`);
}

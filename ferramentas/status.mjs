// Lê e muda o status de um objeto no objetos.csv.
//   node ferramentas/status.mjs                    lista todos
//   node ferramentas/status.mjs maracuja aprovado  muda um
// Caminho dos status: pendente → fazendo → pronto → (você) aprovado → postado
// Só uma pessoa marca "aprovado". As tarefas agendadas nunca fazem isso.
import { readFileSync, writeFileSync } from 'node:fs';

export const CSV = new URL('../objetos.csv', import.meta.url).pathname;
export const STATUS = ['pendente', 'fazendo', 'pronto', 'aprovado', 'postado'];

export function ler() {
  const linhas = readFileSync(CSV, 'utf8').trim().split('\n');
  return linhas.slice(1).map((l, i) => {
    const c = l.split(',');
    return { linha: i + 1, objeto: c[0].trim(), status: c[c.length - 1].trim() };
  });
}
export function mudar(objeto, status) {
  if (!STATUS.includes(status)) throw new Error(`status "${status}" não existe (use: ${STATUS.join(', ')})`);
  const linhas = readFileSync(CSV, 'utf8').trim().split('\n');
  let achou = false;
  if (status === 'aprovado') {
    const atual = ler().find((r) => r.objeto === objeto);
    if (atual && atual.status !== 'pronto') throw new Error(`${objeto} está "${atual.status}": só dá para aprovar um reel "pronto" (feito e assistido)`);
  }
  for (let i = 1; i < linhas.length; i++) {
    const c = linhas[i].split(',');
    if (c[0].trim() === objeto) { c[c.length - 1] = status; linhas[i] = c.join(','); achou = true; }
  }
  if (!achou) throw new Error(`objeto "${objeto}" não está no objetos.csv`);
  writeFileSync(CSV, linhas.join('\n') + '\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [obj, st] = process.argv.slice(2);
  if (obj && st) { try { mudar(obj, st); console.log(`${obj}: ${st}`); } catch (e) { console.error('✗ ' + e.message); process.exit(1); } }
  else for (const r of ler()) console.log(`${r.status.padEnd(9)} ${r.objeto}`);
}

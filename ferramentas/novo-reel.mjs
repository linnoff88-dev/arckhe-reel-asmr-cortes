// Prepara o próximo reel da série: pega o 1º objeto "pendente" do objetos.csv (ou o que você passar),
// copia o molde para reels/<data>-<objeto>/ e escreve o objeto.js dele. Só o objeto muda.
//   node ferramentas/novo-reel.mjs            próximo pendente
//   node ferramentas/novo-reel.mjs goiaba     um objeto específico
// Saída: o caminho da pasta. Código 2 = objeto sem desenho pronto (preencha o objeto.js, RECEITA.md passo 3).
import { cpSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { ler, mudar } from './status.mjs';
import { PRONTOS } from './objetos-prontos.js';

const raiz = new URL('..', import.meta.url).pathname;
const pedido = process.argv[2];
const lista = ler();
const linha = pedido ? lista.find((r) => r.objeto === pedido) : lista.find((r) => r.status === 'pendente');
if (!linha && pedido) { console.error(`"${pedido}" não está no objetos.csv: acrescente uma linha (objeto,por_dentro,final,pendente).`); process.exit(1); }
if (!linha) { console.log('Nenhum objeto pendente no objetos.csv.'); process.exit(0); }

const hoje = new Date().toISOString().slice(0, 10);
const nome = `${hoje}-${linha.objeto}`;
const pasta = `${raiz}reels/${nome}/`;
// já existe (o fazer-reel falhou hoje e o objeto voltou para pendente): reaproveita a pasta e o objeto.js que já foi preenchido
if (existsSync(pasta + 'objeto.js')) {
  mudar(linha.objeto, 'fazendo');
  console.log(`reels/${nome}`);
  process.exit(readFileSync(pasta + 'objeto.js', 'utf8').includes('PREENCHER') ? 2 : 0);
}
mkdirSync(pasta + 'ferramentas', { recursive: true });
for (const item of ['index.html', 'css', 'js', 'lib', 'fontes', 'som', 'package.json', 'hyperframes.json']) cpSync(raiz + item, pasta + item, { recursive: true });
cpSync(raiz + 'ferramentas/som.mjs', pasta + 'ferramentas/som.mjs');

// semente = data + número da linha: dois reels nunca cortam igual, nem no mesmo dia
const semente = Number(hoje.replace(/-/g, '')) * 100 + linha.linha;
const pronto = PRONTOS[linha.objeto];
const base = pronto || PRONTOS.maracuja;
const titulo = pronto ? pronto.titulo : linha.objeto.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
const objeto = {
  nome: linha.objeto, titulo, semente,
  raios: base.raios, camadas: base.camadas, aneis: base.aneis, sementes: base.sementes, pasta: base.pasta,
  legenda: `${titulo} cortado 10, 100 e 1.000 vezes. Qual pote você comeria? #asmr #satisfatorio #3d`,
};
const aviso = pronto ? '' : '// PREENCHER: cópia do maracujá. Troque raios, camadas, sementes e pasta pelas cores deste objeto (RECEITA.md, passo 3).\n';
writeFileSync(pasta + 'objeto.js', `${aviso}// Objeto deste reel (gerado por ferramentas/novo-reel.mjs). Cores em sRGB de 0 a 1.\nexport const OBJETO = ${JSON.stringify(objeto, null, 2)};\n`);
mudar(linha.objeto, 'fazendo');
console.log(`reels/${nome}`);
process.exit(pronto ? 0 : 2);

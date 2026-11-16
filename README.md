# reel-asmr-cortes â€” FÃ¡brica de reels ASMR

[![Reels ASMR no automÃ¡tico](guia/assets/banner.jpg)](https://inematds.github.io/reel-asmr-cortes/guia/)

**ðŸ‡§ðŸ‡· [PortuguÃªs](README.md) Â· ðŸ‡ºðŸ‡¸ [English](README.en.md) Â· ðŸ‡ªðŸ‡¸ [EspaÃ±ol](README.es.md)**

## O que Ã©

Reels "satisfatÃ³rios" (ASMR) seguram as pessoas na tela, mas produzir toda semana dÃ¡ trabalho. Este kit faz um reel vertical de 36 segundos em que uma fruta em 3D Ã© cortada **10, 100 e 1.000 vezes**, com o som de cada corte e trÃªs potes no final. Tudo Ã© desenhado por cÃ³digo no seu computador: sem cÃ¢mera, sem IA de vÃ­deo e sem pagar por render. Uma lista de frutas vira uma sÃ©rie; um agente (Claude Code ou Codex) faz 3 por semana, **vocÃª assiste e aprova**, e um script posta no Instagram pela API oficial. Para usar: Node.js, ffmpeg e, se quiser o post automÃ¡tico, uma conta profissional do Instagram.

## ðŸ“– Guia de uso

Guia completo (landing + passo a passo): **https://inematds.github.io/reel-asmr-cortes/guia/**

ðŸŽ¬ VÃ­deo: https://www.youtube.com/watch?v=ILIh5bg7cEs

## ComeÃ§ar

```bash
git clone https://github.com/inematds/reel-asmr-cortes.git
cd reel-asmr-cortes
node ferramentas/som.mjs
npx --yes hyperframes@0.9.37 check
npx --yes hyperframes@0.9.37 render . -o renders/reel.mp4 --fps 30
```

## O processo, do inÃ­cio ao fim

| # | Passo | Comando | Quem |
|---|---|---|---|
| 1 | PÃ´r objetos na lista | editar `objetos.csv` (status `pendente`) | ðŸ§  vocÃª |
| 2 | Preparar o prÃ³ximo reel | `node ferramentas/novo-reel.mjs` | ðŸ¤– agente (tarefa de segunda 9h) |
| 3 | Desenhar o objeto, se for novo | preencher `objeto.js` (`RECEITA.md`, passo 3) | ðŸ¤– agente |
| 4 | Fazer o reel | `bash ferramentas/fazer-reel.sh <objeto>` | âš™ï¸ script |
| 5 | Assistir e aprovar | `node ferramentas/status.mjs <objeto> aprovado` | ðŸ§  vocÃª |
| 6 | Postar 1 aprovado | `node ferramentas/postar-instagram.mjs` | ðŸ¤– agente (seg, qua e sex 18h) |

Detalhes: [`RECEITA.md`](RECEITA.md) (um reel novo) e [`SETUP.md`](SETUP.md) (app da Meta, link pÃºblico, agendamento).

## O que tem aqui

| Arquivo | O que faz |
|---|---|
| `index.html`, `css/`, `js/mundo.js` | O reel: fruta em 3D cortada por um shader, contador, potes |
| `js/cortes.js` | A lista de cortes: contador, lÃ¢minas e som leem este arquivo |
| `objeto.js` | O Ãºnico arquivo que muda por reel |
| `som/sintese.mjs`, `ferramentas/som.mjs` | Sons feitos em cÃ³digo, um em cada corte, âˆ’15 LUFS |
| `objetos.csv`, `ferramentas/` | A sÃ©rie: preparar, fazer, aprovar, postar |
| `agendar/` | Os dois prompts das tarefas agendadas |

## O que foi testado

Som, conferÃªncia do HyperFrames, fotos paradas, sÃ©rie (numa cÃ³pia) e o modo ensaio do post. O post real na API da Meta e o render completo nÃ£o foram rodados nesta versÃ£o: faÃ§a o passo 1 e o passo 6 com um reel e confira.

LicenÃ§a MIT. Three.js (MIT) e fontes (OFL) com as licenÃ§as nas pastas `lib/` e `fontes/`.

---

Projeto adaptado da comunidade INEMA TDS - Marca Arckhe
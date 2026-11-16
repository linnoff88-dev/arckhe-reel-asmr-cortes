# reel-asmr-cortes — ASMR reel factory

[![Reels ASMR on autopilot](guia/assets/banner-en.jpg)](https://inematds.github.io/reel-asmr-cortes/guia/en/)

**🇧🇷 [Português](README.md) · 🇺🇸 [English](README.en.md) · 🇪🇸 [Español](README.es.md)**

## What it is

“Satisfying” (ASMR) reels keep people watching, but producing them every week takes work. This kit makes a 36-second vertical reel in which a 3D fruit is cut **10, 100, and 1,000 times**, with the sound of each cut and three jars at the end. Everything is drawn with code on your computer: no camera, no video AI, and no paying for rendering. A list of fruits becomes a series; an agent (Claude Code or Codex) makes 3 per week, **you watch and approve them**, and a script posts to Instagram through the official API. To use it: Node.js, ffmpeg, and, if you want automatic posting, a professional Instagram account.

## 📖 User guide

Complete guide (landing page + step-by-step instructions): **https://inematds.github.io/reel-asmr-cortes/guia/en/**

🎬 Video: https://www.youtube.com/watch?v=ILIh5bg7cEs

## Get started

```bash
git clone https://github.com/inematds/reel-asmr-cortes.git
cd reel-asmr-cortes
node ferramentas/som.mjs
npx --yes hyperframes@0.9.37 check
npx --yes hyperframes@0.9.37 render . -o renders/reel.mp4 --fps 30
```

## The process, from start to finish

| # | Step | Command | Who |
|---|---|---|---|
| 1 | Add objects to the list | edit `objetos.csv` (status `pendente`) | 🧠 you |
| 2 | Prepare the next reel | `node ferramentas/novo-reel.mjs` | 🤖 agent (Monday 9 a.m. task) |
| 3 | Design the object, if it is new | fill in `objeto.js` (`RECEITA.md` (in Portuguese), step 3) | 🤖 agent |
| 4 | Make the reel | `bash ferramentas/fazer-reel.sh <objeto>` | ⚙️ script |
| 5 | Watch and approve | `node ferramentas/status.mjs <objeto> aprovado` | 🧠 you |
| 6 | Post 1 approved reel | `node ferramentas/postar-instagram.mjs` | 🤖 agent (Monday, Wednesday, and Friday at 6 p.m.) |

Details: [`RECEITA.md`](RECEITA.md) (a new reel) and [`SETUP.md`](SETUP.md) (in Portuguese) (Meta app, public link, scheduling).

## What's here

| File | What it does |
|---|---|
| `index.html`, `css/`, `js/mundo.js` | The reel: fruit in 3D cut by a shader, counter, jars |
| `js/cortes.js` | The cut list: the counter, blades, and sound read this file |
| `objeto.js` | The only file that changes for each reel |
| `som/sintese.mjs`, `ferramentas/som.mjs` | Sounds made with code, one for each cut, −15 LUFS |
| `objetos.csv`, `ferramentas/` | The series: prepare, make, approve, post |
| `agendar/` | The two prompts for scheduled tasks (in Portuguese) |

## What was tested

Sound, HyperFrames check, still images, the series (in a copy), and post rehearsal mode. The real post through the Meta API and the full render were not run in this version: do steps 1 and 6 with a reel and check.

MIT License. Three.js (MIT) and fonts (OFL) have their licenses in the `lib/` and `fontes/` folders.
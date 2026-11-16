# reel-asmr-cortes — Fábrica de reels ASMR

[![Reels ASMR en automático](guia/assets/banner-es.jpg)](https://inematds.github.io/reel-asmr-cortes/guia/es/)

**🇧🇷 [Português](README.md) · 🇺🇸 [English](README.en.md) · 🇪🇸 [Español](README.es.md)**

## Qué es

Los reels "satisfactorios" (ASMR) mantienen a la gente frente a la pantalla, pero producirlos cada semana cuesta trabajo. Este kit hace un reel vertical de 36 segundos en el que una fruta en 3D se corta **10, 100 y 1.000 veces**, con el sonido de cada corte y tres frascos al final. Todo lo dibuja el código en tu computadora: sin cámara, sin IA de video y sin pagar por render. Una lista de frutas se convierte en una serie; un agente (Claude Code o Codex) hace 3 por semana, **tú lo ves y lo apruebas**, y un script lo publica en Instagram por la API oficial. Para usarlo: Node.js, ffmpeg y, si quieres la publicación automática, una cuenta profesional de Instagram.

## 📖 Guía de uso

Guía completa (landing + paso a paso): **https://inematds.github.io/reel-asmr-cortes/guia/es/**

🎬 Video: https://www.youtube.com/watch?v=ILIh5bg7cEs

## Empezar

```bash
git clone https://github.com/inematds/reel-asmr-cortes.git
cd reel-asmr-cortes
node ferramentas/som.mjs
npx --yes hyperframes@0.9.37 check
npx --yes hyperframes@0.9.37 render . -o renders/reel.mp4 --fps 30
```

## El proceso, de principio a fin

| # | Paso | Comando | Quién |
|---|---|---|---|
| 1 | Poner objetos en la lista | editar `objetos.csv` (estado `pendente`, pendiente) | 🧠 tú |
| 2 | Preparar el siguiente reel | `node ferramentas/novo-reel.mjs` | 🤖 agente (tarea del lunes 9 h) |
| 3 | Dibujar el objeto, si es nuevo | llenar `objeto.js` (`RECEITA.md` en portugués, paso 3) | 🤖 agente |
| 4 | Hacer el reel | `bash ferramentas/fazer-reel.sh <objeto>` | ⚙️ script |
| 5 | Ver y aprobar | `node ferramentas/status.mjs <objeto> aprovado` | 🧠 tú |
| 6 | Publicar 1 aprobado | `node ferramentas/postar-instagram.mjs` | 🤖 agente (lun, mié y vie 18 h) |

Detalles: [`RECEITA.md`](RECEITA.md) (un reel nuevo, en portugués) y [`SETUP.md`](SETUP.md) (app de Meta, enlace público, programación; en portugués).

## Qué hay aquí

| Archivo | Qué hace |
|---|---|
| `index.html`, `css/`, `js/mundo.js` | El reel: fruta en 3D cortada por un shader, contador, frascos |
| `js/cortes.js` | La lista de cortes: el contador, las cuchillas y el sonido leen este archivo |
| `objeto.js` | El único archivo que cambia en cada reel |
| `som/sintese.mjs`, `ferramentas/som.mjs` | Sonidos hechos en código, uno en cada corte, −15 LUFS |
| `objetos.csv`, `ferramentas/` | La serie: preparar, hacer, aprobar, publicar |
| `agendar/` | Los dos prompts de las tareas programadas (en portugués) |

## Qué se probó

Sonido, revisión de HyperFrames, fotos fijas, serie (en una copia) y el modo ensayo de la publicación. La publicación real en la API de Meta y el render completo no se ejecutaron en esta versión: haz el paso 1 y el paso 6 con un reel y revísalo.

Licencia MIT. Three.js (MIT) y fuentes (OFL) con sus licencias en las carpetas `lib/` y `fontes/`.

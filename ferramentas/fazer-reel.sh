#!/usr/bin/env bash
# Faz um reel já preparado pelo novo-reel.mjs: som → check → fotos paradas → render → prontos/.
#   bash ferramentas/fazer-reel.sh goiaba          (ou a pasta: reels/2026-11-15-goiaba)
# Se um passo falha, o objeto volta para "pendente" e o motivo fica em prontos/<nome>/FALHOU.md.
# Nunca posta nada: só deixa o reel em prontos/ com status "pronto" para você assistir.
set -uo pipefail
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
ARG="${1:?passe o objeto (ex.: goiaba) ou a pasta do reel (ex.: reels/2026-11-15-goiaba)}"
# aceita o nome do objeto: usa a pasta mais nova em reels/ que termina com -<objeto>
if [ ! -d "$ARG" ]; then ARG="$(ls -d "$RAIZ"/reels/*-"$ARG" 2>/dev/null | sort | tail -1)"; fi
[ -d "$ARG" ] || { echo "não achei a pasta do reel: rode antes node ferramentas/novo-reel.mjs"; exit 1; }
PASTA="$(cd "$ARG" && pwd)"
NOME="$(basename "$PASTA")"
OBJ="$(node -e "import('$PASTA/objeto.js').then(m=>console.log(m.OBJETO.nome))")"
SAIDA="$RAIZ/prontos/$NOME"
HF="npx --yes hyperframes@0.9.37"
mkdir -p "$SAIDA"

falhou() {
  echo "Falhou no passo: $1" | tee "$SAIDA/FALHOU.md"
  node "$RAIZ/ferramentas/status.mjs" "$OBJ" pendente >/dev/null
  exit 1
}

if grep -q "PREENCHER" "$PASTA/objeto.js"; then falhou "objeto.js ainda tem PREENCHER (cores do objeto)"; fi
cd "$PASTA"
node ferramentas/som.mjs                                   || falhou "som"
$HF check >/dev/null 2>&1                                  || falhou "check (rode: cd $PASTA && $HF check)"
$HF snapshot . --at 3.4,24,34 --no-end -o fotos >/dev/null || falhou "fotos paradas"
$HF render . -o renders/reel.mp4 --fps 30                  || falhou "render"
DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 renders/reel.mp4)"
node -e "process.exit(Math.abs(Number('$DUR') - 36) <= 0.5 ? 0 : 1)" || falhou "duração $DUR s (esperado 36 s)"

cp renders/reel.mp4 "$SAIDA/reel.mp4"
cp fotos/frame-*.png "$SAIDA/"
node -e "import('$PASTA/objeto.js').then(m=>process.stdout.write(m.OBJETO.legenda))" > "$SAIDA/legenda.txt"
rm -f "$SAIDA/FALHOU.md"
node "$RAIZ/ferramentas/status.mjs" "$OBJ" pronto >/dev/null
echo "pronto: prontos/$NOME (reel.mp4, 3 fotos, legenda.txt). Assista e, se gostar: node ferramentas/status.mjs $OBJ aprovado"

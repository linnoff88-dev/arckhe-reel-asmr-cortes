# CLAUDE.md — reel-asmr-cortes

Fábrica de reels ASMR: fruta em 3D cortada 10 → 100 → 1.000 vezes (HyperFrames + Three.js), série por `objetos.csv`, aprovação humana, post no Instagram pela Graph API.

- Autor dos commits: `inematds <inematds@gmail.com>`. Push do `.github/workflows/` vai por SSH.
- Um reel novo = só o `objeto.js` muda (`RECEITA.md`). Visual, ritmo e som ficam no molde (raiz).
- `js/cortes.js` é o relógio único: contador, lâminas e som leem a mesma lista. Não criar tempo em outro lugar.
- Nada de física rodando nem `Math.random()`: tudo é função de `t` e da semente.
- Nunca marcar `aprovado` por conta própria; nunca abrir, imprimir ou copiar o `.env`.
- Conferir mudanças visuais com `npx --yes hyperframes@0.9.37 snapshot . --at 3.4,24,34 --no-end -o review/stills`.
- Processo do início ao fim: README, seção "O processo, do início ao fim" (atualizar no mesmo commit quando o fluxo mudar).

## Self-learning

Quando o usuário corrigir algo, ou quando você pegar um erro seu: antes de continuar, acrescente a lição como uma regra de uma linha no TOPO da seção Lessons abaixo.

## Lessons

- O fragment shader do `ShaderMaterial` não recebe `projectionMatrix`: declarar o uniform à mão para calcular `gl_FragDepth`. (2026-11-14)
- Cores do `objeto.js` são sRGB: converter com `SRGBColorSpace`, senão a fruta sai lavada. (2026-11-14)

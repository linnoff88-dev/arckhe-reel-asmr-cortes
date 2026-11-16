# Receita: um reel novo a partir de uma linha do objetos.csv

O molde é a raiz deste repositório (o reel do maracujá). Cada reel novo é uma cópia em que **só o objeto muda**:
o enquadramento, o ritmo (10 → 100 → 1.000 cortes), os potes e o som ficam iguais. É isso que faz virar série.

Status de cada objeto: `pendente` → `fazendo` → `pronto` → (você) `aprovado` → `postado`.

1. **Pegar o próximo.** `node ferramentas/novo-reel.mjs` pega o 1º `pendente`, marca `fazendo` e cria
   `reels/<data>-<objeto>/` com o `objeto.js` dele. A semente do aleatório é a data + o número da linha,
   então dois reels nunca cortam igual.
2. **Objeto já desenhado?** Se o comando saiu com código 0, o objeto está em `ferramentas/objetos-prontos.js`
   e pode pular para o passo 4.
3. **Objeto novo (código 2).** O `objeto.js` da pasta veio com `PREENCHER` no topo (é uma cópia do maracujá).
   Troque só estes campos, pela coluna `por_dentro` do CSV, e apague a linha `PREENCHER`:
   - `raios`: metade da largura, da altura e do comprimento, em cm (uma fruta comum fica entre 3 e 6);
   - `camadas`: de dentro para fora, até onde vai cada cor (`ate` de 0 a 1) e a cor em RGB de 0 a 1;
   - `aneis`: para cebola e parecidos (largura, de, ate, cor), senão `null`;
   - `sementes`: zona (de, ate), passo, tamanho, densidade e cor, ou `null`;
   - `pasta`: a cor do creme no pote da rodada de 1.000;
   - `legenda`: uma frase + a pergunta do fim + até 3 hashtags.
   Gostou do resultado? Copie o objeto para `ferramentas/objetos-prontos.js` para a próxima vez.
4. **Fazer.** `bash ferramentas/fazer-reel.sh <objeto>` (ou a pasta `reels/<data>-<objeto>`) faz o som, o check, 3 fotos paradas,
   o render (36 s, 1080 × 1920, 30 fps) e deixa tudo em `prontos/<data>-<objeto>/`
   (`reel.mp4`, 3 fotos, `legenda.txt`). O objeto vira `pronto`. **Nunca posta.**
5. **Conferir as fotos.** Quem não leu o título reconhece o objeto pela foto do meio? Se não, ajuste as cores
   no passo 3 e rode o passo 4 de novo.
6. **Se der erro**, o objeto volta para `pendente` e o motivo fica em `prontos/<nome>/FALHOU.md`.

Regras: um objeto por vez; 3 por semana bastam; não copie o reel nem o objeto de outro criador.

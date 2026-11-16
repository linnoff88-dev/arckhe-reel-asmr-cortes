Trabalhe na pasta do projeto reel-asmr-cortes (a pasta atual).

Faça até 3 reels novos seguindo o RECEITA.md. NUNCA poste nada e NUNCA marque um objeto como "aprovado": quem aprova é uma pessoa.

Para cada um dos 3:
1. Rode `node ferramentas/novo-reel.mjs`. Se disser que não há pendentes, pare.
2. Se o código de saída for 2, preencha o objeto.js da pasta criada como manda o passo 3 do RECEITA.md, usando a coluna por_dentro do objetos.csv, e apague a linha PREENCHER.
3. Rode `bash ferramentas/fazer-reel.sh <pasta criada>`.
4. Abra a foto do meio (prontos/<nome>/frame-01-*.png). Se o objeto não for reconhecível, ajuste as cores no objeto.js e rode o passo 3 de novo, uma vez só.
5. Se um passo falhar duas vezes, deixe o objeto como está (o script já volta para "pendente") e siga para o próximo.

No fim, escreva uma linha por reel: objeto, pasta em prontos/ e se ficou pronto ou o que falhou.

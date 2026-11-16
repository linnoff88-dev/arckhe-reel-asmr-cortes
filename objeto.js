// O objeto deste reel. É o ÚNICO arquivo que muda de um reel para outro (ver RECEITA.md).
// Medidas em centímetros. Cores em RGB de 0 a 1. "ate" = até que fração do raio vai a camada
// (0 = centro, 1 = casca), da camada de dentro para a de fora.
// Para trocar de objeto: node ferramentas/novo-reel.mjs <nome> (usa ferramentas/objetos-prontos.js).
export const OBJETO = {
  "nome": "maracujá",
  "titulo": "Maracujá",
  "semente": 2026111401,
  "raios": [4.3, 4.1, 4.6],
  "camadas": [
    { "ate": 0.78, "cor": [0.98, 0.72, 0.08] },
    { "ate": 0.9, "cor": [0.97, 0.94, 0.86] },
    { "ate": 1.0, "cor": [0.62, 0.55, 0.12] }
  ],
  "aneis": null,
  "sementes": { "de": 0.0, "ate": 0.76, "passo": 0.55, "tamanho": 0.2, "densidade": 0.7, "cor": [0.05, 0.04, 0.03] },
  "pasta": [0.96, 0.66, 0.1],
  "legenda": "Maracujá cortado 10, 100 e 1.000 vezes. Qual pote você comeria? #asmr #satisfatorio #3d"
};

// Objetos já desenhados por dentro. O novo-reel.mjs usa daqui quando o nome bate (sem acento, com hífen).
// Para um objeto novo: copie um parecido, troque raios e cores, e confira numa foto parada (RECEITA.md, passo 5).
// Cores em sRGB de 0 a 1. Camadas de dentro para fora; "ate" = fração do raio.
export const PRONTOS = {
  'maracuja': {
    titulo: 'Maracujá', raios: [4.3, 4.1, 4.6],
    camadas: [{ ate: 0.78, cor: [0.98, 0.72, 0.08] }, { ate: 0.9, cor: [0.97, 0.94, 0.86] }, { ate: 1, cor: [0.62, 0.55, 0.12] }],
    aneis: null, sementes: { de: 0, ate: 0.76, passo: 0.55, tamanho: 0.2, densidade: 0.7, cor: [0.05, 0.04, 0.03] },
    pasta: [0.96, 0.66, 0.1],
  },
  'cebola-roxa': {
    titulo: 'Cebola roxa', raios: [4.4, 3.9, 4.4],
    camadas: [{ ate: 0.95, cor: [0.93, 0.86, 0.92] }, { ate: 1, cor: [0.45, 0.12, 0.3] }],
    aneis: { largura: 0.09, de: 0.08, ate: 0.95, cor: [0.62, 0.2, 0.45] }, sementes: null,
    pasta: [0.78, 0.55, 0.7],
  },
  'goiaba': {
    titulo: 'Goiaba', raios: [3.8, 3.6, 4.4],
    camadas: [{ ate: 0.45, cor: [0.93, 0.6, 0.58] }, { ate: 0.9, cor: [0.95, 0.42, 0.45] }, { ate: 1, cor: [0.55, 0.7, 0.28] }],
    aneis: null, sementes: { de: 0, ate: 0.45, passo: 0.6, tamanho: 0.14, densidade: 0.6, cor: [0.95, 0.88, 0.7] },
    pasta: [0.95, 0.5, 0.52],
  },
  'tomate': {
    titulo: 'Tomate', raios: [4.0, 3.4, 4.0],
    camadas: [{ ate: 0.35, cor: [0.95, 0.55, 0.45] }, { ate: 0.7, cor: [0.9, 0.3, 0.2] }, { ate: 0.93, cor: [0.85, 0.15, 0.1] }, { ate: 1, cor: [0.8, 0.08, 0.05] }],
    aneis: null, sementes: { de: 0.35, ate: 0.68, passo: 0.5, tamanho: 0.12, densidade: 0.55, cor: [0.95, 0.85, 0.5] },
    pasta: [0.88, 0.2, 0.12],
  },
  'laranja': {
    titulo: 'Laranja', raios: [4.2, 4.0, 4.2],
    camadas: [{ ate: 0.1, cor: [0.97, 0.9, 0.75] }, { ate: 0.86, cor: [0.98, 0.58, 0.08] }, { ate: 0.93, cor: [0.97, 0.93, 0.82] }, { ate: 1, cor: [0.95, 0.45, 0.02] }],
    aneis: null, sementes: { de: 0.15, ate: 0.5, passo: 1.1, tamanho: 0.18, densidade: 0.25, cor: [0.97, 0.93, 0.8] },
    pasta: [0.98, 0.6, 0.1],
  },
  'caqui': {
    titulo: 'Caqui', raios: [4.2, 3.5, 4.2],
    camadas: [{ ate: 0.25, cor: [0.95, 0.62, 0.25] }, { ate: 0.95, cor: [0.97, 0.5, 0.12] }, { ate: 1, cor: [0.9, 0.35, 0.05] }],
    aneis: null, sementes: null,
    pasta: [0.96, 0.48, 0.12],
  },
  'melao': {
    titulo: 'Melão', raios: [4.8, 4.4, 5.6],
    camadas: [{ ate: 0.3, cor: [0.85, 0.6, 0.35] }, { ate: 0.9, cor: [0.98, 0.65, 0.35] }, { ate: 0.95, cor: [0.75, 0.85, 0.55] }, { ate: 1, cor: [0.7, 0.68, 0.5] }],
    aneis: null, sementes: { de: 0.12, ate: 0.32, passo: 0.55, tamanho: 0.16, densidade: 0.7, cor: [0.97, 0.9, 0.7] },
    pasta: [0.98, 0.66, 0.4],
  },
  'batata-doce-roxa': {
    titulo: 'Batata-doce roxa', raios: [3.4, 3.2, 6.2],
    camadas: [{ ate: 0.94, cor: [0.55, 0.22, 0.62] }, { ate: 1, cor: [0.4, 0.18, 0.22] }],
    aneis: { largura: 0.14, de: 0.2, ate: 0.9, cor: [0.68, 0.38, 0.75] }, sementes: null,
    pasta: [0.6, 0.3, 0.66],
  },
  'coco': {
    titulo: 'Coco', raios: [4.6, 4.4, 4.8],
    camadas: [{ ate: 0.62, cor: [0.9, 0.93, 0.95] }, { ate: 0.86, cor: [0.98, 0.97, 0.93] }, { ate: 1, cor: [0.4, 0.26, 0.15] }],
    aneis: null, sementes: null,
    pasta: [0.96, 0.95, 0.9],
  },
};

// Cada gato ocupa um dos três slots e oferece exatamente três interações.
// driver "clips": animações embutidas no GLB.
// driver "root-clips": o GLB é só o modelo; os clipes de MacDonald estão em macdonald-clips.js.
// clipSet "tom": clipes do esqueleto do Tom gerados em cat-tom.js.

export const GAME_CONFIG = {
  title: "Café Lunar dos Gatos",
  totalCats: 3,
  actionsPerCat: 3,
};

export const catCatalog = [
  {
    id: "luna",
    name: "Luna",
    guardian: "Thalita",
    asset: "./assets/cat.glb",
    enabled: true,
    driver: "procedural",
    accent: "#ffbf69",
    spawn: [0, 0.34, 0],
    rotationY: -0.2,
    targetHeight: 2.15,
    actions: [
      { id: "curious", label: "Investigar", description: "Luna observa e levanta a pata", icon: "◎" },
      { id: "jump", label: "Brincar", description: "Luna salta para alcançar o brinquedo", icon: "↟" },
      { id: "purr", label: "Fazer carinho", description: "Luna relaxa e começa a ronronar", icon: "♡" },
    ],
  },
  {
    id: "cat-02",
    name: "Jarbas",
    guardian: "Rildo",
    asset: "./assets/cat-02.glb",
    enabled: true,
    driver: "root-clips",
    clipSet: "macdonald",
    idleClip: "Idle",
    accent: "#8fc9b6",
    spawn: [-2.35, 0.02, 0.4],
    rotationY: 0.45,
    targetHeight: 1.35,
    actions: [
      { id: "backflip", label: "Cambalhota", description: "Jarbas dá uma cambalhota", icon: "↻", clip: "Backflip", resumeIdle: true },
      { id: "morto", label: "Fingir de morto", description: "Jarbas se joga e fica no chão", icon: "✕", clip: "Morto", hold: true },
      { id: "andar", label: "Passear", description: "Jarbas dá uma volta pela sala", icon: "→", clip: "Andar", resumeIdle: true },
    ],
  },
  {
    id: "cat-03",
    name: "Tom",
    guardian: "Nathan",
    asset: "./assets/cat-03.glb",
    enabled: true,
    driver: "clips",
    clipSet: "tom",
    idleClip: "TomIdle",
    accent: "#c59ad9",
    spawn: [2.35, 0.02, 0.35],
    rotationY: -0.5,
    targetHeight: 1.7,
    actions: [
      { id: "dance", label: "Dançar", description: "Tom dança no ritmo e balança os braços", icon: "♫", clip: "TomDance", resumeIdle: true },
      { id: "wave", label: "Acenar", description: "Tom levanta a patinha e acena para você", icon: "≋", clip: "TomWave", resumeIdle: true },
      { id: "laugh", label: "Dar risada", description: "Tom cai na gargalhada com as patas na barriga", icon: "☺", clip: "TomLaugh", resumeIdle: true },
    ],
  },
];

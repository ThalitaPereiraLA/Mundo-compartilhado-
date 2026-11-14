// Este é o único arquivo que precisa ser alterado quando os outros gatos chegarem.
// Cada gato ocupa um dos três slots e oferece exatamente três interações.

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
    name: "Gato 02",
    guardian: "Amigo 1",
    asset: "./assets/cat-02.glb",
    enabled: false,
    driver: "clips",
    accent: "#8fc9b6",
    spawn: [-2.35, 0.02, 0.4],
    rotationY: 0.45,
    targetHeight: 1.7,
    actions: [
      { id: "action-1", label: "Interação 1", description: "Primeira animação do gato", icon: "01", clip: "Animation_1" },
      { id: "action-2", label: "Interação 2", description: "Segunda animação do gato", icon: "02", clip: "Animation_2" },
      { id: "action-3", label: "Interação 3", description: "Terceira animação do gato", icon: "03", clip: "Animation_3" },
    ],
  },
  {
    id: "cat-03",
    name: "Gato 03",
    guardian: "Amigo 2",
    asset: "./assets/cat-03.glb",
    enabled: false,
    driver: "clips",
    accent: "#c59ad9",
    spawn: [2.35, 0.02, 0.35],
    rotationY: -0.5,
    targetHeight: 1.7,
    actions: [
      { id: "action-1", label: "Interação 1", description: "Primeira animação do gato", icon: "01", clip: "Animation_1" },
      { id: "action-2", label: "Interação 2", description: "Segunda animação do gato", icon: "02", clip: "Animation_2" },
      { id: "action-3", label: "Interação 3", description: "Terceira animação do gato", icon: "03", clip: "Animation_3" },
    ],
  },
];

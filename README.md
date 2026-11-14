# Café Lunar dos Gatos

Jogo 3D interativo feito com Three.js. O visitante explora um café noturno, escolhe um gato e realiza três interações para aumentar a amizade.

## Executar localmente

Na pasta do projeto:

```powershell
python -m http.server 4173 --directory dist
```

Depois abra `http://localhost:4173`.

## Como jogar

- Arraste para girar a câmera e use a roda para aproximar.
- Clique no gato 3D ou no cartão dele na lista de moradores.
- Use os botões de interação ou as teclas `1`, `2` e `3`.
- Cada interação inédita aumenta o progresso de amizade.
- O objetivo final é completar as nove interações dos três gatos.

## Animações da Luna

- **Investigar:** movimenta pescoço, cabeça, pata e cauda.
- **Brincar:** combina agachamento, impulso, salto e aterrissagem.
- **Fazer carinho:** simula respiração, microvibração e relaxamento.

Essas animações são procedurais e movimentam diretamente o esqueleto do GLB.

## Adicionar os dois gatos dos amigos

Toda a integração fica centralizada em `dist/cats.config.js`. Já existem três slots: Luna, Gato 02 e Gato 03.

Para adicionar um novo gato:

1. Coloque o modelo em `dist/assets/cat-02.glb` ou `dist/assets/cat-03.glb`.
2. Abra `dist/cats.config.js`.
3. Troque `enabled: false` por `enabled: true`.
4. Atualize nome, responsável, posição e altura.
5. Informe o nome dos três clipes de animação nos campos `clip`.

Exemplo:

```js
{
  id: "cat-02",
  name: "Mingau",
  guardian: "Nome do integrante",
  asset: "./assets/cat-02.glb",
  enabled: true,
  driver: "clips",
  spawn: [-2.35, 0.02, 0.4],
  actions: [
    { id: "wave", label: "Cumprimentar", clip: "Wave" },
    { id: "eat", label: "Dar petisco", clip: "Eat" },
    { id: "sleep", label: "Descansar", clip: "Sleep" }
  ]
}
```

O motor carrega todos os perfis ativos, cria o seletor de moradores, gera os três botões e atualiza automaticamente o progresso do jogo. Se os nomes dos clipes não coincidirem, ele usa os três primeiros clipes do GLB na ordem.

## Estrutura

- `dist/index.html`: HUD, tela inicial, ajuda e interface do jogo.
- `dist/styles.css`: identidade visual e responsividade.
- `dist/app.js`: cena 3D, Raycaster, atores, animações e regras do jogo.
- `dist/cats.config.js`: configuração dos três gatos e de suas ações.
- `dist/assets/`: modelos GLB.

## Ambiente

O café é gerado com geometria no Three.js: pedestal, tapete, janela, lua, estrelas, mesas, xícaras, plantas, neblina e iluminação quente/fria.

O modelo atual contém atribuição para “Cat by Sumpitueslag”, por photon (that one larry), sob licença CC BY 4.0.

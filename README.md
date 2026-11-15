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

## Jarbas

O segundo morador se chama Jarbas e usa o modelo “MacDonald”, de Kasugay (Sketchfab, CC BY 4.0). As animações Idle, Cambalhota, Morto e Passear movem o gato inteiro e ficam em `dist/macdonald-clips.js`. Idle fica em loop; as três interações do slot são Cambalhota, Fingir de morto e Passear.

## Tom

O personagem do Nathan usa `dist/assets/cat-03.glb`. As três interações ficam em `dist/cat-tom.js` e animam o esqueleto do próprio modelo:

- **Dançar:** balança o tronco, a cabeça, os braços e a cauda no ritmo.
- **Acenar:** levanta uma patinha, inclina a cabeça e acena para o visitante.
- **Dar risada:** abre a boca, sacode os ombros e leva as patas à barriga.

Ao terminar cada ação, Tom volta à animação de descanso. Ele usa os mesmos cartões, botões, atalhos `1`, `2` e `3` e progresso de amizade dos demais moradores.

## Estrutura

- `dist/index.html`: HUD, tela inicial, ajuda e interface do jogo.
- `dist/styles.css`: identidade visual e responsividade.
- `dist/app.js`: cena 3D, Raycaster, atores, animações e regras do jogo.
- `dist/cats.config.js`: configuração dos três gatos e de suas ações.
- `dist/cat-tom.js`: clipes de animação do esqueleto do Tom.
- `dist/assets/`: modelos GLB.

## Ambiente

O café é gerado com geometria no Three.js: pedestal, tapete, janela, lua, estrelas, mesas, xícaras, plantas, neblina e iluminação quente/fria.

O modelo atual contém atribuição para “Cat by Sumpitueslag”, por photon (that one larry), sob licença CC BY 4.0.

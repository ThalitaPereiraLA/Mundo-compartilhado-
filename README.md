# Observatório Felino 3D

Experiência interativa feita com Three.js a partir do modelo `cat_by_sumpitueslag.glb`.

## Executar localmente

Na pasta do projeto, rode:

```powershell
python -m http.server 4173 --directory dist
```

Depois abra `http://localhost:4173` no navegador. O servidor local é necessário porque navegadores não permitem que um arquivo HTML aberto diretamente carregue um GLB por módulo.

## Animações criadas por código

- **Curioso:** combina rotação de pescoço e cabeça, pata dianteira e uma onda encadeada nos três ossos da cauda.
- **Pulo:** usa uma curva de agachamento, impulso, altura e aterrissagem; patas, costas e cauda acompanham cada fase.
- **Ronronar:** simula respiração no corpo, microvibração, relaxamento da cabeça e balanço lento da cauda.

As animações estão em `dist/app.js` e usam diretamente o esqueleto já existente no GLB. O arquivo original não continha clipes de animação.

## Controles

- Clique nos três cartões de movimento.
- Use as teclas `1`, `2` e `3`.
- Arraste sobre a cena para orbitar e use a roda do mouse para aproximar.
- Para abrir um estado específico: `?animation=curious`, `?animation=jump` ou `?animation=purr`.

## Ambiente

O “observatório felino” é gerado por geometria no próprio Three.js: pedestal, tapete, janela, lua, estrelas, banco, plantas, neblina e iluminação quente/fria. Não há imagens externas no cenário.

O modelo contém atribuição para “Cat by Sumpitueslag”, por photon (that one larry), sob licença CC BY 4.0. A atribuição também aparece na interface.

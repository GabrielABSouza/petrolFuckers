# Radar PID — vídeo demo (Remotion)

Projeto Remotion com 1 composição de **20 segundos** (600 frames a 30fps)
que faz **crossfade entre 7 screenshots progressivos** do app, com captions
centralizadas (lower-third) e cursor animado entre os pontos de ação.

## Setup (uma vez)

```bash
cd video
npm install
```

## Os 7 screenshots (TIRA ANTES DE RENDERIZAR)

Suba o front local (`localhost:5173`) e tire screenshots em **cada estado**.
Salve com **estes nomes exatos** em `video/public/`:

| Arquivo | Estado a capturar |
|---|---|
| `01-vazio.png` | App recém-aberto. Sem fonte selecionada (todos chips desativados), sem UF (Recorte = "Brasil"), sem cidade clicada. Sidebar esquerda mostrando o tutorial. Painel direito com placeholder do agente. |
| `02-h2v.png` | Após clicar em **H2V** na barra de fontes. Chip H2V destacado em amber. Mapa colorido com pontos por score H2V. Demais painéis ainda vazios. |
| `03-mg.png` | Após selecionar **MG** no Recorte. Mapa com zoom em Minas Gerais (n=266 ou similar). Filtros de fonte e UF aplicados. |
| `04-arapora.png` | Após clicar no dot de **Araporã** no mapa. Sidebar esquerda preenchida com features + score 48 + breakdown. Crosshair amber sobre o dot Araporã. |
| `05-compare.png` | Após clicar no botão de **comparar** (modo X vs Y ativo). Sidebar mostrando comparação parcial — só Araporã ainda. Crosshair pontilhado esperando segundo município. |
| `06-janauba.png` | Após clicar no dot de **Janaúba** no mapa. Sidebar com ambos: Araporã 48 vs Janaúba 47. Confronto por bloco (econômico/social/ambiental) populado. Dois crosshairs no mapa. |
| `07-agente.png` | Após perguntar ao copiloto _"quais as politicas publicas disponiveis para minas gerais?"_ e o agente responder. Painel direito com a resposta completa visível. |

> **Resolução ideal:** mesma proporção do app rodando em fullscreen no seu
> monitor. Retina (~2880×1620 ou 2560×1440) é OK — a composição renderiza
> em 1920×1080 com `objectFit: cover` (corte horizontal mínimo).

## Preview no Studio

```bash
npm run start
```

Abre Remotion Studio em `http://localhost:3000`. Permite scrubbing por frame,
útil pra verificar se cursor e captions estão alinhados, e re-carrega ao salvar
o `.tsx`.

## Render (gera MP4)

```bash
npm run render
```

Saída em `out/demo.mp4`. ~30 segundos pra renderizar.

Se algum dos 7 PNGs estiver faltando, render quebra com erro de arquivo
não encontrado. Nesse caso, confere os nomes em `public/` e tenta de novo.

## Render como GIF (opcional)

```bash
npm run render-gif
```

Útil pra colar em README.md ou Slack. Saída em `out/demo.gif`. Mais pesado
(~10MB pra 20s).

## Timing das cenas (caso queira ajustar)

Em `src/DemoVideo.tsx`, array `SCENES` define `start` e `duration` (em frames):

| Cena | Frames | Tempo | Caption |
|---|---|---|---|
| 1 | 0–60 | 0–2s | Triagem de oportunidades em transição energética |
| 2 | 60–120 | 2–4s | Filtre a fonte de energia · H2 Verde |
| 3 | 120–180 | 4–6s | Recorte por estado · Minas Gerais |
| 4 | 180–270 | 6–9s | Araporã/MG · score 48 |
| 5 | 270–330 | 9–11s | Acione a comparação · Modo X vs Y |
| 6 | 330–390 | 11–13s | Janaúba/MG · score 47 |
| 7 | 390–600 | 13–20s | Pergunte ao Copiloto · Instrumentos públicos |

Cada transição usa **15 frames de fade-in** cobrindo a cena anterior.

## Estrutura

```
video/
├── package.json
├── tsconfig.json
├── remotion.config.ts
├── public/
│   ├── 01-vazio.png        ← você tira
│   ├── 02-h2v.png          ← você tira
│   ├── 03-mg.png           ← você tira
│   ├── 04-arapora.png      ← você tira
│   ├── 05-compare.png      ← você tira
│   ├── 06-janauba.png      ← você tira
│   └── 07-agente.png       ← você tira
└── src/
    ├── index.ts
    ├── Root.tsx            ← registra a composição
    └── DemoVideo.tsx       ← cenas + cursor + captions centralizadas
```

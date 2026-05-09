# Decisões de design e arquitetura — Radar PID

> Documento que registra **por que** o protótipo do Radar PID (em `web/`) ficou do jeito que ficou. Não cobre o **o quê** (o código já faz isso) — cobre as alternativas consideradas, o trade-off aceito e a razão da escolha. Útil pra defesa do pitch e pra próxima iteração.

> Versão atual: v2 (após as iterações de UX feitas no dia 9/mai/2026).

## Sumário

1. [Tese e framing](#1-tese-e-framing)
2. [Decisões de produto e UX](#2-decisões-de-produto-e-ux)
3. [Decisões de layout](#3-decisões-de-layout)
4. [Direção estética](#4-direção-estética)
5. [Stack técnica](#5-stack-técnica)
6. [Arquitetura de componentes](#6-arquitetura-de-componentes)
7. [Estrutura de dados](#7-estrutura-de-dados)
8. [Trade-offs aceitos](#8-trade-offs-aceitos)
9. [Decisões em aberto (próxima versão)](#9-decisões-em-aberto)

---

## 1. Tese e framing

### Por que "Radar PID" e não "PID 2.0" ou "Atlas Verde"

**Decisão:** o produto se chama Radar PID, posicionado como **camada que recomenda**, não como substituto da PID atual.

**Alternativas consideradas:**
- `PID 2.0` — versão melhorada da plataforma do E+
- `Atlas Verde` — analogia com Atlas Industrial 2025
- `Verde Score` — só o score sem o framing de mapa/exploração

**Razão da escolha:**
- A PID do E+ já existe e funciona como **visualizador**. Criar um produto que se proponha a substituir gera atrito político com o Instituto E+ (jurados do hackathon). "Radar" é uma camada **complementar** sobre a PID — adiciona inteligência sem competir.
- O nome "Radar" carrega a metáfora de detecção/descoberta, alinhada com a função de recomendar onde investir.
- A frase-tese "**A PID atual mostra camadas. O Radar PID recomenda onde agir primeiro**" foi escolhida porque cabe em 1 linha de pitch e diz o produto inteiro.

### Por que "triagem" e não "decisão"

**Decisão:** todo o microcopy usa "triagem", "elegibilidade preliminar", "score de triagem", "candidato a investimento" — nunca "melhor investimento" ou "decisão final".

**Alternativas consideradas:**
- Linguagem de "recomendação" forte ("invista aqui")
- Linguagem neutra ("análise comparativa")

**Razão da escolha:**
- Risco regulatório/jurídico: investidor que perde dinheiro num site que recomendou pode processar.
- O regulamento do hackathon (§10.10) e a postura responsável do tema exigem cautela com promessas.
- Júri institucional (E+) valoriza honestidade metodológica acima de marketing forte.
- Define expectativa correta: o produto **não substitui due diligence**, encaminha pra ela.

---

## 2. Decisões de produto e UX

### Por que 2 lentes (Investidor × Órgão público)

**Decisão:** toggle no topo entre "Investidor" e "Órgão público", chamado **Lente** (não Persona).

**Alternativas consideradas:**
- 1 lente universal (sem toggle) — produto se ajusta ao que o usuário pergunta
- 4 lentes (investidor / órgão público / indústria existente / academia)
- 0 lentes (só modo)

**Razão da escolha:**
- 2 personas cobrem 80% do leitor real do hackathon E+ (investidor que quer alocar capital + gestor que quer atrair investimento).
- O produto **muda de tom**: copilot fala com investidor sobre due diligence; com gestor público sobre justiça territorial.
- 4 personas fragmentaria o produto e exigiria conteúdo demais pra v0.1.
- Mudança de "Persona" → "Lente": "persona" é jargão de UX que o usuário final não entende. "Lente" é metáfora visual (quem está olhando), captura a ideia de *ângulo de leitura* sem virar questionário de identidade.

### Por que 3 modos (Renováveis gerais × Data centers IA × Neoindustrialização verde)

**Decisão:** modo de análise como pre-set de pesos, não como escopo separado.

**Alternativas consideradas:**
- Sliders manuais para cada peso
- 1 modo único com pesos fixos
- N modos (1 por indústria-alvo: aço, biometano, fertilizantes, SAF...)

**Razão da escolha:**
- O briefing exigia "Data centers de IA" como caso demonstrativo (sem virar produto inteiro). 3 modos servem como demonstração de que o framework escala pra outras vocações.
- "Neoindustrialização verde" liga direto com a tese E+ (powershoring + Consenso de Belém) — alinhamento político importante.
- Modos são **mais legíveis** que sliders pra usuário não-técnico. Sliders foram removidos (eram redundantes com modos e exigiam educação metodológica).

### Por que 6 critérios e não 4 ou 10

**Decisão:** 6 critérios fixos no MCDA: energia renovável, acesso à rede, demanda local, segurança socioambiental, impacto regional, infraestrutura digital.

**Razão da escolha:**
- 6 cobre as dimensões essenciais sem virar carregador-de-checklist.
- Cada um responde a uma pergunta diferente do investidor:
  1. Tem o quê (energia renovável)?
  2. Consegue escoar (acesso à rede)?
  3. Quem compra (demanda local)?
  4. Atrapalha alguém (segurança socioambiental — alto = bom)?
  5. Vale pra região (impacto regional)?
  6. Cabe data center (infraestrutura digital)?
- 4 critérios deixaria buracos óbvios; 10 vira ruído. 6 já é o máximo legível em barras horizontais sem scroll.
- Labels traduzidos pra **linguagem de usuário final** (não eco do código): "Energia renovável" em vez de "score_recurso_renovavel", "Segurança socioambiental" em vez de "Baixo risco socioambiental" (alto = bom, leitura mais natural).

### Por que score MCDA (média ponderada) e não regressão/clustering

**Decisão:** score final é média ponderada simples dos 6 critérios.

**Alternativas consideradas:**
- Geographically Weighted Regression (GWR)
- Random Forest / Gradient Boosting
- Clustering (DBSCAN, KMeans)
- TOPSIS / AHP (MCDA mais sofisticado)

**Razão da escolha:** (decisão registrada em 2 documentos: `04_escopo_estrategia.md` e o veredito do agente independente)
- **GWR não cabe**: amostra insuficiente (12 municípios), Y mal definido (estamos *construindo* o score, não explicando), output ininteligível pra júri.
- **Modelos black-box** (RF, GB) custam confiança no pitch — usuário vê barra subir/descer mas não entende por quê.
- **TOPSIS/AHP** são MCDA mais robustos mas exigem matriz de comparação par-a-par, overhead pra v0.1.
- **Média ponderada** é defensável em 1 frase ("cada critério vale X% do score") e é o que ferramentas comerciais comparáveis (Watershed, ClimateView) usam de fato no front.

### Por que convergência pública como camada paralela (não somada no MCDA)

**Decisão:** `convergenciaPublicaScore` aparece em destaque no painel mas **não soma** no score final do MCDA.

**Razão da escolha:**
- Um instrumento público (REIDI, SUDENE) não diz que o município é melhor pra investir — diz que **se você decidir investir, há mecanismos de incentivo**.
- Misturar elegibilidade fiscal com viabilidade técnica gera score enviesado pra regiões SUDENE/SUDAM, mascarando municípios técnicamente fortes do Sul/Sudeste.
- Manter como **camada de validação** (usuário olha primeiro o score técnico, depois confere instrumentos) preserva clareza analítica.
- Decisão revisável: a equipe planeja **redesenhar a abordagem de incentivos** numa próxima iteração — score isolado deixa flexibilidade pra integrar de forma mais elegante depois.

### Por que instrumentos como badges agrupadas por categoria

**Decisão:** `instrumentosPublicos[]` aparece como badges coloridas agrupadas em 5 categorias (fiscal, financiamento, leilão, obra, política).

**Alternativas consideradas:**
- Lista vertical sem agrupamento
- Score numérico único de "convergência" sem detalhamento
- Tabela com colunas (instrumento, categoria, status, prazo)

**Razão da escolha:**
- 5 categorias com glifos editoriais (₣ $ ⇄ ▣ §) dão **leitura rápida** sem demanda cognitiva.
- Cores por categoria (amber/ember/moss) reforçam o agrupamento sem virar legenda decorativa.
- Tabela detalhada não cabe em painel de 340px de largura e não é necessária na v0.1 (cada instrumento ainda é mock).
- Microcopy "elegibilidade preliminar" + "não é parecer jurídico" repetida em cada lugar onde aparecem instrumentos — guarda contra interpretação errada.

### Por que comparação em split-mode protagonista (não tabela inline)

**Decisão:** quando o usuário ativa comparação, o painel inteiro vira modo "X vs Y" — score cards lado-a-lado, confronto por critério em barras espelhadas, instrumentos comuns vs exclusivos, verdict automático em 1 frase. Crosshair ember pontilhado no segundo município no mapa.

**Alternativas consideradas:**
- Tabela inline 3 colunas (atual no fim do painel) — implementação anterior
- Bottom drawer cobrindo parte do mapa
- Modal full-screen
- Tooltip ao lado do dot

**Razão da escolha:**
- Comparação enterrada no fim do painel não convida uso. **Promovida a estado de primeira classe**, vira a feature mais "demonstrável" no pitch.
- Não consome área extra (usa sidebar esquerdo já existente). Mapa e copiloto continuam intactos.
- Confronto em **barras espelhadas** (cresce do centro pra fora) é visualmente óbvio quem ganha cada critério — informação que tabela com 2 números crus não transmite.
- Crosshair ember pontilhado no mapa fecha o loop espacial: usuário **vê** os 2 dots destacados.

### Por que tutorial em vez de mostrar análise vazia

**Decisão:** quando nenhum município está selecionado, o sidebar esquerdo mostra um tutorial com 3 passos numerados, legenda do mapa e top 3 atual clicável.

**Alternativas consideradas:**
- Sidebar vazio até clicar
- Análise da "média Brasil" (score agregado) como default
- Mostrar o município top-1 por padrão

**Razão da escolha:**
- Vazio = usuário não entende o que clicar.
- Default top-1 enviesa atenção ("deve ser esse aqui"), prejudicando exploração imparcial.
- Tutorial educa sobre **dots, cores, fluxo, copiloto** — reduz curva de aprendizado em <30 segundos.
- Top 3 clicável dá entrada imediata pra usuário que quer pular tutorial.

### Por que metodologia em modal (e não tab/aba)

**Decisão:** botão "ⓘ Metodologia" discreto no canto direito do header, abre modal compacto com fórmula + pesos do modo atual + dados conectados vs próximos.

**Alternativas consideradas:**
- Tab fixa no header
- Seção permanente no sidebar
- Tooltip ao lado de cada critério

**Razão da escolha:**
- Metodologia interessa minoria dos usuários (jurados técnicos, mentores). Maioria quer ir direto à análise.
- Tab no header consome espaço permanente.
- Seção no sidebar competiria com a análise do município (que é a feature principal).
- Modal: **opt-in**, low-overhead, mostra info completa quando solicitada.
- Tabela de pesos no modal **atualiza dinamicamente** com o modo — usuário vê concretamente o que mudou ao trocar Renováveis ↔ Data Centers.

---

## 3. Decisões de layout

### Por que filtros no header (não no sidebar esquerdo)

**Decisão:** Lente + Modo de análise foram movidos para o **topo** após primeira iteração que tinha esses controles no sidebar esquerdo.

**Por que mudou:**
- No sidebar esquerdo, filtros disputavam espaço com a análise do município selecionado. Usuário precisava scrollar.
- Filtros são **estado global** (afetam mapa + ranking + score). Header é a localização semântica correta para estado global.
- Liberou o sidebar esquerdo pra ser 100% dedicado a tutorial OU análise — sem competição vertical.

### Por que sidebar esquerdo é state-driven (não tabs)

**Decisão:** sidebar esquerdo renderiza um de três conteúdos baseado no estado:
1. `TutorialPanel` (sem seleção)
2. `MunicipioCompacto` (município selecionado, sem comparação)
3. `CompareView` (município selecionado + compareId definido)

**Alternativas consideradas:**
- Tabs internas ao sidebar (Tutorial / Análise / Comparação)
- 3 tabs sempre visíveis no header
- Mostrar tudo simultaneamente (vertical scroll)

**Razão da escolha:**
- Estados são **mutuamente exclusivos** semanticamente — usuário ou está aprendendo, ou explorando 1 município, ou comparando 2. Tabs sugerem coexistência.
- Transição automática (sem clicar tab) é mais fluida — clicar um dot já leva ao estado correto.
- React renderiza condicionalmente sem custo, e cada estado tem layout otimizado pra seu conteúdo.

### Por que sidebar direito é 100% conversacional

**Decisão:** o painel direito é dedicado ao Copiloto PID, sempre aberto, ocupa toda a altura do viewport (com scroll interno na conversa).

**Alternativas consideradas:**
- Toggle FAB (floating action button) — implementação inicial
- Tab compartilhada (Análise / Copiloto)
- Modal ao acionar

**Razão da escolha:**
- O copiloto é uma das **features mais demonstráveis no pitch** ("agente de incentivos") — escondê-lo num botão diminui visibilidade.
- Briefing automático ao selecionar município só faz sentido se o painel já está aberto.
- Conversação contínua com contexto (município selecionado, modo, lente) só funciona com painel persistente.
- Decisão da equipe: "o painel direito deveria ser 100% conversacional pra alinhar com a visão do agente que vai trazer sugestões baseadas em incentivos governamentais."

### Por que mapa central, fullscreen, sem ranking embaixo

**Decisão:** coluna central é só o mapa (sem ranking de oportunidades).

**Por que mudou:**
- Versão anterior tinha ranking abaixo do mapa. **Quebrava o layout** quando a tela era menor que ~900px de altura.
- Ranking duplicava informação que o usuário já tinha no mapa (dots maiores e mais amarelos = melhores) e na sidebar esquerda quando seleciona um município.
- Tutorial inclui um "Top 3 atual clicável", que recupera 80% da utilidade do ranking sem custo de espaço.

### Por que altura travada (`h-[calc(100vh-72px)]` + `overflow-hidden`)

**Decisão:** grid principal tem altura **exata** do viewport menos a altura do header. Cada coluna controla seu próprio scroll interno.

**Por que mudou:**
- Versão anterior usava `min-h-`, que permitia o conteúdo crescer além do viewport. Resultado: copiloto à direita era empurrado pra fora da tela quando sidebar esquerda inflava com dados do município.
- Travar a altura garante que **input do copiloto está sempre visível** sem scroll vertical da página inteira.

### Por que crosshair amber sólido vs ember pontilhado

**Decisão:**
- Município selecionado (focal) → crosshair amber sólido + label paper.
- Município em comparação (B) → crosshair ember pontilhado + label ember.

**Razão da escolha:**
- Cores diferentes evitam ambiguidade visual.
- Pontilhado vs sólido reforça hierarquia: "selecionado" é o foco principal, "comparado" é secundário.
- Ember (#fc6926) é a cor de "alerta moderado" no sistema — combina com a função semântica de "alvo da comparação".

---

## 4. Direção estética

### Por que aesthetic institucional (Bloomberg × IPEA × Atlas editorial)

**Decisão:** densidade alta, sharp edges em widgets de dados, hairlines como separadores, paleta navy + amber, monospace para números.

**Alternativas consideradas:**
- SaaS clean (rounded corners, gradientes pastel, ilustrações)
- Dashboard corporativo padrão (cards brancos com sombra, charts coloridos)
- Brutalismo digital (preto puro, tipografia mono full)

**Razão da escolha:**
- Audiência: jurados do E+ (acadêmicos, policymakers, técnicos do setor energético) — preferem **autoridade visual** a SaaS marketing.
- Aesthetic Bloomberg/IPEA sinaliza "ferramenta séria de decisão", não "produto consumer".
- Reduz risco de "AI slop generic look" (Material Design tema escuro, etc).
- Briefing original especificou: "interface mais executiva e orientada à decisão", "evitar cards gigantes sem função".

### Por que palette navy + amber

**Decisão:** dominante navy profundo (`#031a33` / `#05274b`); âmbar (`#fcc20a`) **só** em estados críticos (top score, persona ativa, valores destacados); ember/cinder pra alertas; paper warm (`#f4f1ea`) para texto.

**Razão da escolha:**
- Briefing explicitou paleta institucional E+ (azul escuro + amarelo + laranja).
- Navy profundo carrega "noturno técnico" (terminal, sala de comando) — combina com função decisional.
- Âmbar como **acento raro** evita virar decoração: cada uso tem significado (top, ativo, força).
- Paper warm em vez de branco puro reduz fadiga visual em uso prolongado.

### Por que Fraunces + Geist + JetBrains Mono

**Decisão:** Fraunces (display serif) para brand e títulos, Geist (sans) para body, JetBrains Mono para números, códigos e labels técnicos.

**Alternativas consideradas:**
- Inter / Roboto / Arial (rejeitadas — "AI slop generic")
- Söhne / GT America (proprietárias)
- Helvetica + Times (clichê)

**Razão da escolha:**
- Fraunces tem eixo variável de "soft" e optical sizing — dá gravitas editorial sem virar elegância vintage. Combina com Atlas Industrial publicado pelo E+ (visual de relatório técnico).
- Geist (open source by Vercel) é refinado e sóbrio sem cair na geometria do Inter.
- JetBrains Mono em números reforça **leitura técnica** — usuário lê "87/100" como dado, não como texto.
- Pareamento serif + sans + mono é um clássico tipográfico institucional (The Economist, FT, Bloomberg Atlas).

### Por que sharp edges em widgets de dados

**Decisão:** zero `rounded-` (com raras exceções: thumb redondo nos sliders pré-remoção, pulse glow do dot).

**Razão da escolha:**
- Cantos retos = autoridade institucional. Cantos arredondados = consumer SaaS.
- Hairlines (1px com opacidade 0.08–0.18) substituem bordas vistosas, dando peso técnico.
- Reforça percepção de "produto que mostra dados" vs "produto que vende dados".

### Por que grain noise + scan-lines + topo-dots no mapa

**Decisão:** background do mapa tem 3 camadas decorativas:
1. Grain noise SVG (opacity 0.035) sobre o body inteiro
2. Scan-lines verticais sutis (rgba paper 0.012) — lembrança CRT/terminal
3. Topo dots (radial-gradient 0.045) — pattern de "papel topográfico"

**Razão da escolha:**
- Mapa preto puro = vazio. Texturas sutis dão **profundidade atmosférica** sem virar ruído.
- Grain noise + scan-lines reforçam "interface técnica" (terminal, instrumento de medição).
- Topo dots evocam mapa cartográfico físico — combina com função do produto.

---

## 5. Stack técnica

### Por que React + Vite (não Next.js, não CRA)

**Decisão:** React 18 + Vite 5 com `@vitejs/plugin-react`.

**Alternativas consideradas:**
- Next.js (App Router)
- Create React App (deprecated)
- SvelteKit / Astro
- HTML estático + scripts

**Razão da escolha:**
- **Vite** = dev server abre em <200ms, HMR é instantâneo. Em hackathon (37h), cada segundo de iteração importa.
- **Next.js** seria overkill: o produto é puramente client-side, não precisa de SSR/SSG/API routes.
- **CRA** está deprecada, sem futuro.
- **Svelte/Astro** seriam tecnicamente bons mas a equipe é familiar com React — curva zero.
- Build de produção em ~1s, deploy em qualquer static host (Vercel, Netlify, HuggingFace Spaces).

### Por que Tailwind 3 (não 4, não CSS-in-JS)

**Decisão:** Tailwind 3.4 com tema customizado em `tailwind.config.js`.

**Alternativas consideradas:**
- Tailwind 4 (oxide engine, mas API ainda em flux)
- CSS Modules
- Styled Components / Emotion
- Vanilla CSS

**Razão da escolha:**
- Tailwind 3 é **maduro e estável**. Tailwind 4 ainda tinha breaking changes e incertezas em maio/2026 — risco que não compensa em hackathon.
- CSS-in-JS exige overhead de runtime e prejudica HMR.
- Vanilla CSS funciona, mas perdemos o sistema de design tokens (tema custom + utility classes).
- Tema custom em `tailwind.config.js` permite usar `bg-amber`, `text-paper`, `border-hairline-strong` em vez de hex em todo lugar — manutenível.
- Variáveis CSS (`--ink`, `--amber`, etc) também declaradas pra uso em `style={{}}` quando Tailwind não cobre (gradients dinâmicos).

### Por que Motion 11 (não Framer Motion 12, não animações CSS)

**Decisão:** `motion@^11.11.0` (rebrand do Framer Motion).

**Alternativas consideradas:**
- Framer Motion 12 (mais novo)
- React Spring
- Animações CSS puras

**Razão da escolha:**
- Motion 11 é estável, API bem-documentada, integra bem com React 18.
- Framer Motion 12 trouxe breaking changes recentes — risco em hackathon.
- React Spring é poderoso mas curva mais alta.
- Animações CSS puras suficientes pra micro-interactions, mas para `AnimatePresence` (mount/unmount transitions) precisamos de Motion.
- Uso restrito: barras animadas no breakdown, modal fade-in, briefing fade-up no copiloto. **Não abusar** — animações em ferramenta institucional devem ser sutis.

### Por que d3-geo + topojson-client (não Mapbox, Leaflet, hand-coded)

**Decisão:** mapa renderizado em SVG puro com `d3-geo` para projeção e `topojson-client` para descomprimir o GeoJSON dos estados brasileiros.

**Alternativas consideradas:**
- Mapbox GL / MapLibre (tile-based, world map real)
- Leaflet (JavaScript map library)
- Hand-coded SVG path (versão inicial, removida)
- Static image PNG

**Razão da escolha:**
- **Hand-coded SVG falhou**: 22 vértices não fazem Brasil parecer Brasil. Precisava de geografia real.
- **Mapbox/MapLibre** trazem dependência de tiles, requerem API key, e a estética de tile (cores, labels) destoaria do tema institucional. Pesado pra v0.1.
- **Leaflet** mesmo problema: tile providers, raster tiles em estética inadequada.
- **Static PNG** perderia interatividade.
- **d3-geo + topojson** = SVG puro, **estilizável 100%**, geometria real do IBGE, projeção Mercator com `fitExtent` dinâmico (mapa se ajusta ao container via ResizeObserver).
- TopoJSON simplificado (`topojson-server` + `topojson-simplify` em build-time) reduziu o GeoJSON de 3.4MB para **226KB**. Aceitável.

### Por que lucide-react

**Decisão:** ícones via `lucide-react`.

**Alternativas consideradas:**
- Heroicons
- Phosphor Icons
- Custom SVG inline
- Font Awesome

**Razão da escolha:**
- Lucide tem **estilo monoline coerente** que combina com o tema institucional.
- Tree-shakable (só os ícones usados entram no bundle).
- React-friendly (cada ícone = componente, props para size/strokeWidth).
- 14 ícones usados no produto (X, Plus, GitCompareArrows, Lightbulb, Info, Compass, MousePointerClick, MessagesSquare, ChevronRight, ArrowUp, Sparkles, etc) — cobertos pela biblioteca sem fallbacks custom.

---

## 6. Arquitetura de componentes

### Por que estrutura plana em `src/`

**Decisão:** todos os componentes principais em `src/`, sem pasta `components/`:
```
web/src/
├── App.jsx           # orquestrador + componentes inline (SidePanel, MunicipioCompacto, CompareView, TutorialPanel, MethodologyModal, helpers)
├── BrazilMap.jsx     # mapa SVG + d3-geo
├── Copiloto.jsx      # painel direito conversacional
├── data.js           # mock municípios + constantes
├── scoring.js        # lógica de score e helpers
├── brazil_topo.json  # geometria estados (226KB)
├── index.css         # Tailwind + custom CSS (tema, sliders, grain)
└── main.jsx          # entrada React
```

**Alternativas consideradas:**
- Estrutura aninhada (`components/`, `panels/`, `widgets/`)
- Single-file (tudo em App.jsx — versão inicial)
- Feature folders (cada feature com seus componentes)

**Razão da escolha:**
- Estrutura plana cabe na cabeça em 5 minutos. Em hackathon, **navegação cognitiva > organização ideal**.
- Separação **funcional** (Map / Copiloto / lógica de App) suficiente.
- Componentes inline em App.jsx (`MunicipioCompacto`, `CompareView`, `TutorialPanel`) compartilham contexto com o App e seriam só "files com 1 export" se separados — overhead.
- Refactor pra estrutura aninhada é trivial quando o produto crescer (mover arquivos + ajustar imports).

### Por que `MunicipioCompacto` e `CompareView` estão em `App.jsx`

**Decisão:** todos os sub-componentes do sidebar esquerdo são definidos no mesmo arquivo do `App` principal.

**Razão da escolha:**
- São **componentes de presentation** que dependem fortemente do estado do App.
- Separar em arquivos exigiria props drilling extenso ou Context API (overhead injustificado em 7 estados globais).
- App.jsx tem 750 linhas — alto, mas legível com seções demarcadas por comentários (`/* ──── SECTION ──── */`).
- Hackathon: prioriza grokar tudo em uma scroll-vista vs purismo modular.

### Por que useState local sem Context/Redux/Zustand

**Decisão:** todo o estado mora em `App.jsx` via `useState`. Sem Context API, sem Redux, sem Zustand.

**Estado global** (7 vars):
```js
persona, modo, pesos, selectedId, compareId, methodOpen
```
+ derivações via `useMemo`: `pesosNormalizados`, `scores`, `ranking`, `selecionado`, `ctxCopiloto`.

**Alternativas consideradas:**
- Zustand store
- React Context API
- Redux Toolkit
- TanStack Query (irrelevante — sem servidor)

**Razão da escolha:**
- 7 estados com profundidade rasa não justificam state manager.
- Props drilling **2-3 níveis** no máximo (App → SidePanel → MunicipioCompacto). Aceitável.
- Sem servidor, não há cache/fetching/subscription — Context/Redux trariam complexidade sem benefício.
- `useState` + `useMemo` é o que React resolve melhor; usar é abraçar a plataforma.

### Por que `useMemo` em vários lugares

**Decisão:** `pesosNormalizados`, `scores`, `ranking` são todos `useMemo` com deps explícitas.

**Razão da escolha:**
- `scores` recalcula 12 breakdowns + scores finais. Em cada render do App seria desperdício se nenhum input mudou.
- `ranking` ordena 12 elementos. Trivial sozinho, mas se o componente re-renderiza por outro motivo (ex.: hover no copiloto), evita reordenar.
- `pesosNormalizados` é necessário pra normalizar pesos a 100%.
- Custo de `useMemo` (1 comparison shallow) << custo de recomputar quando o re-render é causado por mudança não-relacionada.

### Por que ResizeObserver no BrazilMap

**Decisão:** `BrazilMap` mede seu próprio container via `ResizeObserver` e re-projeta o mapa sempre que o tamanho muda.

**Alternativas consideradas:**
- ViewBox SVG fixo + `preserveAspectRatio` (versão inicial — falhou)
- `window.innerWidth` listener
- CSS `aspect-ratio`

**Razão da escolha:**
- ViewBox fixo + preserveAspectRatio cortava o mapa quando container era widescreen demais (a silhueta extrapolava).
- `window` listeners não capturam mudanças do container interno (resize do sidebar, modal aberto, etc).
- ResizeObserver é a API moderna para reagir a tamanho de elemento — preciso e eficiente.
- Projeção `geoMercator().fitExtent([...], BR_FEATURES)` recalculada via `useMemo` com `size` como dep.

### Por que projeção e path generator num mesmo `useMemo`

**Decisão:**
```js
const { projection, pathFn } = useMemo(() => {
  const proj = geoMercator().fitExtent([...], BR_FEATURES);
  return { projection: proj, pathFn: geoPath(proj) };
}, [size]);
```

**Razão da escolha:**
- `geoPath` é stateful: depende da projeção. Se calcular separado, podem desincronizar.
- Memoizar juntos evita recriar `geoPath` em renders intermediários.
- Os pontos dos municípios usam `projection([lng, lat])` direto, então a projection precisa ser exposta.

---

## 7. Estrutura de dados

### Por que `data.js` exporta constantes (não JSON solto, não API)

**Decisão:** `data.js` exporta `MUNICIPIOS`, `MODOS`, `PERSONAS`, `CRITERIOS`, `INSTRUMENTOS_LABELS`, `CATEGORIAS_INSTRUMENTOS` como `const` JavaScript.

**Razão da escolha:**
- Sem servidor, sem API. Não há razão pra fetch.
- JSON externo (`*.json`) seria parseado mas não permitiria comentários ou estrutura complexa.
- JS const permite **comentários explicativos** sobre o que é mock vs proxy + tipo dinâmico.
- Fácil substituir por `master_df.csv` real depois (parseado e cacheado em build).

### Por que estrutura achatada de município (sem nesting)

**Decisão:** cada município tem 18 props no top-level (id, municipio, uf, lat, lng, capacidade*, distância*, scores, instrumentos, observações, dadosMockados).

**Alternativas consideradas:**
- Nested (`{ id, geo: {lat, lng}, energia: {capacidade*, pipeline*}, infra: {...}, scores: {...} }`)
- Tabela tipada (TypeScript interfaces)

**Razão da escolha:**
- 18 props ainda cabe na cabeça. Nesting adicionaria `mun.geo.lat` em vez de `mun.lat` — 1 nível de indireção sem ganho.
- Quando substituir por master_df, achatado é o que pandas/CSV produzem naturalmente. Conversão direta.

### Por que ID no padrão `cidade-uf`

**Decisão:** ids como `pecem-ce`, `janauba-mg`, `lucas-rio-verde-mt` (kebab-case + sigla UF).

**Razão da escolha:**
- Legível no debug (vs `mun_001`).
- URL-safe — pode virar `?selected=pecem-ce` numa próxima versão com persistência.
- Não conflita com códigos IBGE (que são 7 dígitos numéricos) — coexistirão quando integrar com SIDRA.

### Por que separar `INSTRUMENTOS_LABELS` e `CATEGORIAS_INSTRUMENTOS`

**Decisão:** dois lookups: o de instrumentos com `{ categoria, nome, cor }`, e o de categorias com `{ label, glifo }`.

**Razão da escolha:**
- Categorias têm metadata própria (label apresentável, glifo editorial) que se aplica a TODOS os instrumentos da categoria — duplicar seria erro-prone.
- Usado em 3 lugares (MunicipioCompacto, CompareView, Copiloto) — DRY.
- Adicionar nova categoria = 1 linha em `CATEGORIAS_INSTRUMENTOS`.

### Por que score pré-calculado em `scoring.js` (não cada componente recalcula)

**Decisão:** `computeBreakdown(municipio)` e `computeFinalScore(breakdown, pesos)` são funções puras em `scoring.js`. App.jsx as chama uma vez via `useMemo`.

**Razão da escolha:**
- Componentes de presentation só **leem** `scores[id]`, não recalculam.
- Funções puras são fáceis de testar.
- Mover lógica de score pra Worker se virar gargalo: trivial — só precisa wrap em postMessage.

---

## 8. Trade-offs aceitos

| Trade-off | Por que aceitamos |
|---|---|
| **Bundle 566KB JS / 139KB gzip** | Causa: GeoJSON dos estados (~226KB) + d3-geo (~80KB). Aceitável pra v0.1. Próxima versão: code-split + lazy-load do mapa. |
| **Sem responsivo mobile** | Briefing especificou desktop-only. Hackathon = produto **executivo de decisão**, lido em laptop. Mobile vira backlog. |
| **Sem autenticação** | Protótipo público. Sem dados sensíveis. Auth não agrega valor demonstrável em 37h. |
| **Sem testes** | Hackathon: testes manuais via uso real. TypeScript ajudaria mas adicionaria fricção. Testes ficam pra produção. |
| **Convergência pública isolada do MCDA** | Decisão deliberada (ver seção 2). Score técnico fica limpo, instrumentos são camada de validação. Repensar quando integrar dados reais. |
| **Mapa sem zoom/pan** | Brasil inteiro cabe na viewport. Pan/zoom adicionaria complexidade (lib extra ou custom). 12 dots distribuídos não justificam. Próxima versão com 1000+ municípios → zoom necessário. |
| **Sem export de relatório** | Briefing critério "potencial de impacto" → export PDF/CSV ajudaria. Cortado pra entregar core em 37h. |
| **Sem persistência em URL** | Compartilhar análise específica (município + modo + lente) por link seria valioso. Ficou pra próxima. |

---

## 9. Decisões em aberto

Próximas iterações precisam responder:

1. **Conectar `master_df.csv` real** (especificação em `docs/08_ibge_dados.md`) — substituir mock por dados ANEEL/IBGE/SAFMaps.
2. **Redesenhar a camada de incentivos públicos** — abordagem alternativa ao "score agregado de 13 fontes". Candidatas:
   - Selo de elegibilidade único (SUDENE + REIDI binário)
   - Match temporal (editais abertos AGORA + leilão próximo)
   - Mapa do dinheiro histórico (BNDES + Transferegov dos últimos 5 anos)
3. **Granularidade do mapa**: município (5570 pontos) ou grade 1km (8M+) — ver `08_ibge_dados.md`. Para v1, município. Grade entra com filtro setorial.
4. **Persistência de estado**: `?lente=investidor&modo=data_centers&selected=pecem-ce&compare=camacari-ba` — facilita compartilhar.
5. **Acessibilidade**: review de contraste em estados secundários (paper/45 sobre ink-deeper pode falhar AA em alguns critérios), navegação por teclado nos dots do mapa.
6. **Validação metodológica com mentor E+**: confirmar se os 6 critérios do MCDA refletem a tese institucional do Atlas.
7. **Performance do mapa**: com 5000+ pontos, render direto em SVG vai gargalar. Migrar para canvas (deck.gl) ou agregação por região no zoom-out.

# SPEC de handoff — implementação final + entregáveis

> **Audiência:** próximo agente que vai implementar as últimas mudanças visuais e preparar os entregáveis oficiais para os jurados do Hackathon E+ Transição Energética 2026.
>
> **Status do projeto:** Radar PID v2 mergeado em `main` (commit `67b1248`). Protótipo funcional em `web/`, documentação estratégica em `docs/`. Restam: ajustes visuais alinhados com PID + preenchimento dos entregáveis obrigatórios em `equipe-XXX/`.
>
> **Data limite:** dom 10 mai 2026, 21:59 BRT (entrega final — pasta + vídeo pitch).

---

## 1. Estado atual do projeto

### 1.1 Branches e commits relevantes

- `main` está sincronizada com `origin/main` em `67b1248` (último commit: docs de decisões de arquitetura).
- Branch `radar-pid-incentivos-publicos` foi mergeada e pode ser deletada.
- Branch `data-exploration` é histórica, pode ignorar.

### 1.2 Estrutura do repo

```
hackaton_E+/
├── README.md, AGENTS.md, .gitignore
├── docs/                          # documentação estratégica (00–12)
├── data/                          # CSVs ANEEL/ANP + JSONs processados
├── prompts/                       # prompts de agentes anteriores
├── references/                    # PDFs grandes (gitignored)
├── web/                           # protótipo React (Radar PID)
└── equipe-XXX/                    # ⚠ ENTREGÁVEIS OBRIGATÓRIOS — ainda vazio
```

### 1.3 O que está pronto no `web/`

- Stack: React 18 + Vite 5 + Tailwind 3 + Motion 11 + d3-geo + topojson-client + lucide-react.
- 3 colunas: filtros/análise (340px) | mapa SVG real do Brasil (centro) | Copiloto fixo (400px).
- Header: brand "Radar PID" + Lente (Investidor/Órgão público) + Modo (Renováveis/Data Centers/Neoindustrialização) + botão Metodologia.
- Sidebar esquerdo state-driven: Tutorial / MunicipioCompacto / CompareView (split-mode com 2 score cards, confronto barras espelhadas, instrumentos comuns vs exclusivos).
- Mapa: GeoJSON real dos 27 estados (226KB topojson), projeção Mercator com `fitExtent` dinâmico via `ResizeObserver`, dots por município com cor por score, crosshair amber sólido pra selecionado e ember pontilhado pra comparado.
- Copiloto: chat mock com briefing automático ao selecionar município, 6 sugestões focadas em incentivos públicos, diferencia confirmado/proxy/elegibilidade.
- 12 municípios mockados com `instrumentosPublicos[]` (REIDI, SUDENE, FNE, etc).

### 1.4 Decisões já documentadas

- `docs/00_README.md` — índice de toda a documentação.
- `docs/01_briefing.md` — regulamento oficial extraído (datas, critérios de avaliação, entregáveis).
- `docs/04_escopo_estrategia.md` — framework de 7 decisões de produto.
- `docs/06_eda_insights.md` — análise empírica das fontes (ANEEL/ANP/SAFMaps).
- `docs/12_decisoes_arquitetura_radar_pid.md` — **por que cada decisão técnica/visual foi tomada** (consultar antes de mudar qualquer coisa visual ou de stack).

---

## 2. Tarefas a executar (em ordem de prioridade)

### 2.1 Aplicar logomarca oficial da PID no header — **prioridade ALTA**

**Contexto:** uma das juradas confirmou que a equipe deve **manter o nome, a logomarca e a paleta de cores da PID**. O visual da plataforma é livre, mas esses 3 elementos são obrigatórios.

**Estado atual:** o header em `web/src/App.jsx` usa um componente `RadarMark` que é um SVG customizado (radar animado em amber). Linhas relevantes: function `RadarMark()` ~linha 165.

**O que fazer:**

1. **Pegar a logo oficial da PID** com o usuário (Gabriel). Ela pode chegar em PNG, SVG ou PDF. Salvar em:
   ```
   web/public/logo-pid.svg     (preferido — escalável)
   web/public/logo-pid.png     (alternativa — alta resolução, fundo transparente)
   ```
   Também copiar para `equipe-XXX/Design/Logotipo/` (entregável dos jurados).

2. **Substituir `RadarMark` por componente que carrega a logo:**
   ```jsx
   function PIDLogo() {
     return (
       <img
         src="/logo-pid.svg"
         alt="PID — Plataforma Interativa de Descarbonização"
         className="h-10 w-auto flex-shrink-0"
       />
     );
   }
   ```
   E trocar `<RadarMark />` por `<PIDLogo />` no header. Manter a frase "Radar PID" ao lado (a equipe está construindo a evolução; o nome do produto deles é "Radar PID" mas usa a logo da PID como base institucional).

3. **Se a logo for muito pequena ou tiver muitos detalhes**, considerar exibi-la em monocrômico (filtro `brightness(0) invert(1)` se for SVG escura) para casar com o tema dark.

4. **Cuidado:** não distorcer ou recortar a logo. Manter proporção via `h-10 w-auto` ou `h-12 w-auto`.

### 2.2 Decisão visual final: **manter dark theme com paleta PID ampliada** — **prioridade MÉDIA**

**Contexto:** o usuário considerou inverter pra light theme alinhando com a PID real (ArcGIS Experience light), mas após a fala da jurada — "podem explorar e alterar à vontade o visual" — decidiu **manter o dark theme institucional** (Bloomberg/IPEA aesthetic) e apenas **ampliar a paleta com a cor que faltava**.

**Estado atual:**

- `web/tailwind.config.js` — já contém todas as cores da paleta PID, incluindo `mango: #fc9e24` adicionado nesta sessão.
- `web/src/index.css` — variáveis CSS atualizadas com `--mango`, `--mist` (#becccc) e `--amber-dim`.

**O que fazer:**

1. **Verificar se `mango` (#fc9e24) e `mist` (#becccc) estão sendo usados em algum lugar** — se não, adicionar usos pontuais para enriquecer a hierarquia visual:
   - `mango` pode entrar como cor intermediária na escala de score (atualmente: amber ≥75 / ember 60-74 / cinder 45-59 / paper-dim < 45). Testar inserir mango entre amber e ember para criar 5 buckets.
   - `mist` (#becccc) pode entrar como cor de **estado neutro/inativo** em badges, tooltips, ou como acento frio em "elegibilidade não confirmada".

2. **Validar visualmente** que a paleta segue alinhada à institucional E+ rodando `npm run dev` e comparando com a PID original (https://experience.arcgis.com/experience/4fde76ed5b3341cab0553adb3708ec69/page/Início).

3. **Não inverter para light theme.** Decisão tomada: a estética dark institucional é o diferencial visual da nossa proposta vs. a PID original, e a jurada autorizou.

### 2.3 Preencher os entregáveis obrigatórios em `equipe-XXX/` — **prioridade ALTA**

> ⚠ **CRÍTICO:** segundo o regulamento §8.2.1.b, a **avaliação dos entregáveis vale nota 1.0–4.0** e é o **primeiro critério de desempate** (§8.2.6). Caprichar nesta documentação pode ser a diferença entre 1º e 3º lugar.

#### 2.3.1 `equipe-XXX/Documentação-OBRIGATÓRIO/Dados-gerais-da-solução.docx`

**Estrutura solicitada (extraída do template):**

```
1. Qual é a viabilidade da solução?
   (Defender a viabilidade da proposta sobre recursos técnicos e humanos
   para implementá-la)

2. Há soluções similares no mercado? Quais?
   (A equipe conhece alguma solução parecida? Qual? Utilizou como
   referência?)

3. Quais são os seus diferenciais?
   (A maior vantagem / Proposta única de valor da solução)

4. Quais os possíveis impactos?
   (Mensurar a importância e o alcance da solução aplicada ao público)
```

**Material que já existe no repo para sustentar cada resposta:**

- **Viabilidade**: `docs/12_decisoes_arquitetura_radar_pid.md` (stack, custos zero, deploy em static host) + `docs/06_eda_insights.md` (dados públicos disponíveis).
- **Soluções similares**: `docs/09_benchmark_mercado.md` (CarbonTech, WayCarbon, Watershed, ClimateView, Google Environmental Insights Explorer) e a própria PID atual do Instituto E+.
- **Diferenciais**: a PID mostra camadas, **o Radar PID recomenda onde agir**. Score MCDA com 6 critérios, camada de convergência pública (instrumentos governamentais), copiloto contextual de incentivos. Detalhes em `docs/06_eda_insights.md` § "3 caminhos de MVP" e `docs/12_decisoes_arquitetura_radar_pid.md` § "Decisões de produto e UX".
- **Impactos**: análise empírica em `06` aponta 92% da capacidade renovável em municípios sem indústria eletrointensiva (oportunidade powershoring) + 51% da capacidade de biometano ociosa (matchmaking). Casos demonstrativos: H₂ verde Pecém, biometano-siderurgia Vale do Aço, fertilizantes verdes Centro-Oeste.

**Tom obrigatório (regulamento §10.13 + microcopy do produto):** linguagem responsável, evitar "garantido", "melhor investimento", "retorno certo". Usar "oportunidade candidata", "priorizar estudo", "score de triagem", "elegibilidade preliminar". Texto curto e objetivo.

**Tamanho sugerido:** 1–2 páginas por seção, total 4–6 páginas.

#### 2.3.2 `equipe-XXX/Documentação-OBRIGATÓRIO/Sobre parte tecnica da sua solução.docx`

**Estrutura solicitada:**

```
1. Qual é o tipo de solução criada? (Website, aplicativo, SAS, bot, etc)

2. Qual (ou quais) linguagem(ns) de programação (e/ou framework)
   utilizada(s) no desenvolvimento? Se foi Low-Code ou No-Code informe
   a plataforma.

3. Qual é o manual da solução criada?
   (Definir quando e como o usuário acessa/utiliza a sua solução)
```

**Conteúdo a preencher:**

- **Tipo:** website (SPA — Single Page Application), client-side puro, sem backend.
- **Stack:** React 18 + Vite 5 + Tailwind CSS 3 + Motion 11 + d3-geo + topojson-client + lucide-react. Build de produção: 566 KB JS / 20 KB CSS (139 KB gzip). Deploy em qualquer static host (Vercel/Netlify/Hugging Face Spaces).
- **Manual de uso (3 passos, alinhado com `TutorialPanel`):**
  1. Configure no topo: escolha sua **lente** (Investidor ou Órgão público) e o **modo de análise** (Renováveis gerais / Data centers de IA / Neoindustrialização verde).
  2. Clique em um município no mapa: ele entra no painel esquerdo com score de triagem, breakdown por critério e instrumentos públicos preliminares (REIDI, SUDENE, FNE, etc).
  3. Converse com o **Copiloto PID** à direita: ele explica por que o município entrou no ranking, sugere instrumentos governamentais aplicáveis e diferencia elegibilidade preliminar de confirmação.

Mais detalhes técnicos em `docs/12_decisoes_arquitetura_radar_pid.md`.

**Tamanho sugerido:** 2–3 páginas.

#### 2.3.3 `equipe-XXX/Design/`

Preencher os 4 subdiretórios:

- **`Logotipo/`** — logo oficial da PID + variações (PNG e SVG). Adicionar uma versão "marca + Radar PID" mostrando a relação entre a base institucional e a evolução proposta.
- **`Fluxograma/`** — diagrama mostrando os fluxos do app: (a) onboarding via tutorial; (b) seleção de município; (c) ativação de comparação; (d) interação com Copiloto. Pode ser feito em Whimsical/Figma/draw.io e exportado como PNG.
- **`Wireframe/`** — wireframes baixa-fidelidade das 3 telas principais: Tutorial / Município selecionado / Comparação split-mode. Mostrar a hierarquia visual sem detalhes de cor.
- **`Protótipo final -Telas/`** — screenshots em alta resolução das telas reais do `web/` rodando: home/tutorial, município selecionado, comparação, modal de metodologia. Usar `npm run build && npm run preview` e capturar via Cmd+Shift+4 ou ferramenta tipo Lightshot.

#### 2.3.4 `equipe-XXX/Código fonte-OBRIGATÓRIO/`

Texto: "Coloque o código fonte zipado ou link do Git Hub". Soluções:

- **Recomendado:** colocar um arquivo de texto com o link do GitHub (`https://github.com/GabrielABSouza/petrolFuckers`) como o repo é público.
- **Alternativa:** ZIP do repositório (excluindo `node_modules`, `dist`, `.git`).

#### 2.3.5 `equipe-XXX/link-do-video-pitch--OBRIGATÓRIO.docx`

Texto do template: "Informe aqui o link do video pitch final de 3 MINUTOS no Youtube. OBS: Deixar apenas como **não listado**, mas **não como privado**, ok?"

**O que fazer:**

1. Equipe grava pitch de **até 3 minutos** (regulamento §8.2.2.a).
2. Upload no YouTube como **não listado** (não privado).
3. Colar o link no documento.

Roteiro sugerido de 3 minutos baseado nos critérios de avaliação (§8.2.4):

| Tempo | Conteúdo | Critério atendido |
|---|---|---|
| 0:00–0:20 | Frase-tese + problema (PID mostra, não recomenda) | Aderência ao desafio |
| 0:20–0:40 | Achados empíricos do EDA (mismatch 92%, biometano 51% ocioso) | Uso inteligente de dados |
| 0:40–1:30 | Demo: muda lente/modo, clica município, mostra score+breakdown+instrumentos, ativa comparação split-mode | Inovação + viabilidade |
| 1:30–2:10 | Copiloto explicando incentivos públicos com diferenciação confirmado/proxy/validação | Inovação + impacto |
| 2:10–2:40 | Caso real (Pecém amônia verde / Vale do Aço biometano siderúrgico) | Potencial de impacto |
| 2:40–3:00 | Próximos passos (master_df real, camada incentivos v2) + frase de fechamento | Qualidade da apresentação |

#### 2.3.6 `equipe-XXX/informacoes-da-equipe--OBRIGATÓRIO.doc`

Já existe (criado pelo Word). Apenas preencher com:

- Nome da equipe: **petrolFuckers**
- Integrantes: nomes + CPF + e-mail + função (programador/designer/dados/etc)
- Universidade ou empresa de cada um
- Confirmação de aceite do regulamento

---

## 3. Best practices de documentação para jurados

### 3.1 Critérios oficiais de avaliação (regulamento §8.2)

#### Documentação (§8.2.1.b) — nota 1.0 a 4.0, intervalos de 0.5

Avaliam: **qualidade, clareza, completude e consistência** das informações apresentadas.

**Como maximizar a nota:**

- **Qualidade**: gramática impecável, parágrafos curtos, bullet points para listas. Evitar muros de texto.
- **Clareza**: cada seção responde a uma pergunta específica. Evitar jargão técnico sem explicação.
- **Completude**: cobrir todas as 4 perguntas em "Dados-gerais" e todas as 3 em "Sobre parte técnica". Não deixar respostas vazias.
- **Consistência**: terminologia uniforme em todos os docs. Se o produto se chama "Radar PID", manter — não alternar com "Plataforma X" ou "Score Y".

#### Pitch (§8.2.4) — 5 critérios, nota 1 a 4 cada

| Critério | O que valorizam | Como atender |
|---|---|---|
| Potencial de impacto | Relevância pra desafio | Casos concretos com números (ex: 51% biometano ocioso) |
| Viabilidade | Aplicabilidade, coerência, possibilidade de desenvolvimento futuro | Stack 100% open-source, dados públicos, deploy gratuito |
| Aderência ao desafio | Alinhamento ao tema "Transforme dados em decisões" | Frase-tese explícita: PID mostra, Radar recomenda |
| Inovação | Originalidade, diferencial | Camada de convergência pública + Copiloto de incentivos |
| Qualidade da apresentação | Clareza, objetividade, comunicação | Roteiro estruturado, demo gravada, sem improvisação |

### 3.2 Microcopy obrigatório (regulamento §10.13)

**Evitar:**
- "garantido", "melhor investimento", "retorno certo"
- "Recomendamos investir em X" sem ressalva
- "Score X significa lucratividade"

**Usar:**
- "oportunidade candidata"
- "priorizar estudo"
- "aprofundar due diligence"
- "gargalo a destravar"
- "score de triagem"
- "elegibilidade preliminar"
- "não substitui parecer técnico/jurídico/financeiro"

Esse vocabulário já está em todo o produto e nos docs internos. Manter consistência nos entregáveis.

### 3.3 Originalidade (regulamento §10.10)

**Cuidado:** "Não serão aceitas soluções tecnológicas copiadas ou reproduzidas, de forma total ou parcial, de outras fontes e/ou competições, ou se tiverem sido desenvolvidas antes do primeiro dia do hackathon."

**Como mitigar:**
- Documentar **claramente** que o repo `petrolFuckers` foi criado em 9 mai 2026 (commits têm data).
- A documentação estratégica (`docs/`) também foi feita durante o hackathon — preparação organizacional, não solução tecnológica pré-pronta.
- Se a equipe usar bibliotecas open-source (React, d3-geo, topojson-client, etc), está coberto — são dependências comuns, não cópia de solução.

### 3.4 Propriedade intelectual (regulamento §10.4)

A propriedade intelectual da solução é **co-titularidade** entre a equipe e o Instituto E+. O E+ pode desenvolver com ou sem a equipe (preferindo com).

**Implicação:** o repo público no GitHub está OK. O E+ vai poder pegar o código e continuar o desenvolvimento — isso é parte do contrato.

### 3.5 LGPD (regulamento §4.4, §10.8)

A equipe se compromete com LGPD nos dados obtidos durante o evento. Como o produto usa **apenas dados mockados em memória**, sem coleta de dados pessoais de usuários, o risco é zero. Mas mencionar nos docs que:

> O Radar PID v0.1 não coleta nem armazena dados pessoais. Toda a análise roda client-side. Dados públicos (ANEEL SIGA, ANP, IBGE, SAFMaps) serão integrados na próxima versão e não contêm informação identificável.

---

## 4. Checklist final de entrega

Antes de zipar e submeter, verificar:

- [ ] `equipe-XXX/Documentação-OBRIGATÓRIO/Dados-gerais-da-solução.docx` preenchido
- [ ] `equipe-XXX/Documentação-OBRIGATÓRIO/Sobre parte tecnica da sua solução.docx` preenchido
- [ ] `equipe-XXX/Design/Logotipo/` com logo PID oficial (PNG + SVG)
- [ ] `equipe-XXX/Design/Fluxograma/` com diagrama de fluxos
- [ ] `equipe-XXX/Design/Wireframe/` com 3 wireframes
- [ ] `equipe-XXX/Design/Protótipo final -Telas/` com 4 screenshots em alta resolução
- [ ] `equipe-XXX/Código fonte-OBRIGATÓRIO/` com link GitHub OU zip do repo
- [ ] `equipe-XXX/link-do-video-pitch--OBRIGATÓRIO.docx` com link YouTube **não listado** (não privado)
- [ ] `equipe-XXX/informacoes-da-equipe--OBRIGATÓRIO.doc` preenchido com integrantes
- [ ] Pasta `equipe-XXX/` renomeada para o nome real da equipe (ex: `equipe-petrolFuckers/`)
- [ ] Pasta zipada e enviada conforme regulamento §8.2.1.a — **até 10 mai 2026 21:59h BRT**
- [ ] Vídeo de pitch ≤3min no YouTube como não listado, link informado no `.docx`
- [ ] Pelo menos 1 representante da equipe presente na live de encerramento (14 mai) — §8.3.2

---

## 5. Tarefas no `web/` ainda em aberto (priorizar se houver tempo)

Em ordem de prioridade caso sobre tempo após o item 2 e 3:

1. **Aplicar logomarca oficial da PID** (item 2.1) — bloqueante para entrega visual completa.
2. **Incorporar `mango` (#fc9e24) na escala de score do mapa** — refinar gradiente cromático (item 2.2.1).
3. **Capturar screenshots do produto em alta resolução** para `Design/Protótipo final -Telas/`.
4. **Validar acessibilidade básica** — checar contraste em estados secundários (paper/45 sobre ink-deeper). Ferramentas: WebAIM Contrast Checker.
5. **Code splitting do bundle** — o JS está em 566 KB (Vite avisa). Pode ser code-splitting com `dynamic import()` no mapa. Optimização opcional para v0.2.
6. **Ler `docs/12_decisoes_arquitetura_radar_pid.md`** antes de fazer **qualquer** mudança visual ou estrutural — todas as decisões estão lá com tradeoffs registrados.

---

## 6. Recursos úteis

- **Repositório:** https://github.com/GabrielABSouza/petrolFuckers
- **Regulamento oficial:** `references/regulamento-hackathon-e-mais.pdf` (também em `equipe-XXX/Documentação-OBRIGATÓRIO/`)
- **Atlas E+ 2025:** `references/emais_atlas-miolo_digital_251203-12h58_f.pdf` — referência de paleta e estilo institucional E+
- **PID atual (referência visual + paleta):** https://experience.arcgis.com/experience/4fde76ed5b3341cab0553adb3708ec69/page/Início
- **Site E+:** https://emaisenergia.org/
- **Palette PID confirmada (extraída do config ArcGIS):**
  - Navy: `#05274b`
  - Amarelo: `#fcc20a`
  - Mango (laranja-amarelo): `#fc9e24`
  - Ember (laranja): `#fc6926`
  - Cinder (laranja-vermelho): `#fa441a`
  - Mist (cyan claro): `#becccc`
  - Texto preto profundo: `#181818`
  - Branco: `#ffffff`

---

## 7. Como rodar o projeto

```bash
cd web
npm install              # instala dependências
npm run dev              # http://localhost:5173 — Vite dev com HMR
npm run build            # build de produção em dist/
npm run preview          # serve dist/ em http://localhost:4173
```

Pra capturar screenshots do produto, usar `npm run preview` (mais estável visualmente que `dev`).

---

## 8. Contato e dúvidas

- **Comunicação oficial do hackathon:** Discord do evento (canal oficial) + e-mail `contato@hackathonbrasil.com.br`
- **Whitelist de e-mail:** `@hackathonbrasil.com.br`
- **Sessões obrigatórias:** ao menos 1 integrante da equipe deve estar presente nas sessões marcadas pela organização (regulamento §4.9)

---

> **Resumo executivo da spec em 1 frase:** aplicar a logomarca oficial da PID no header, manter dark theme com paleta PID já ampliada (incluindo `#fc9e24`), e preencher os 6 entregáveis obrigatórios em `equipe-XXX/` seguindo o regulamento §8.2 com microcopy responsável (§10.13).

# Conteúdo a colar em `Sobre parte tecnica da sua solução.docx`

> Três perguntas técnicas do template. Texto pronto pra colar.

---

## 1. Qual é o tipo de solução criada? (Website, aplicativo, SaaS, bot, etc.)

**R:** Solução fullstack composta por:

- **Front-end** — aplicação web single-page (SPA) em React, hospedável em qualquer plataforma estática (Vercel, Netlify, Cloudflare Pages). Não requer login, não armazena dados pessoais.
- **Back-end** — API REST em Python/FastAPI hospedada no Railway (Docker), servindo o indicador real (1.938 municípios × 5 fontes) carregado em memória a partir de arquivos parquet. Cinco endpoints públicos: `/health`, `/municipios`, `/municipios/{nome}`, `/ranking`, `/insights`, `/agente/chat`.
- **Agente conversacional** — Gemini 3 Flash Preview integrado via Google `genai` SDK, com duas capacidades: função custom `search_municipio` (consulta a base interna em tempo real) e File Search nativo (RAG gerenciado pelo Google sobre os documentos internos do projeto). Memória dentro da sessão (TTL 30 minutos, máximo 20 turnos).

A arquitetura escolhida (SPA + API + agente) é deliberada para a v2: o front continua barato e cacheável em CDN, o back centraliza a lógica de filtragem do indicador, e o agente plugando-se no back tem acesso à base como ferramenta — sem expor a chave Gemini ao navegador.

---

## 2. Qual (ou quais) linguagem(ns) de programação (e/ou framework) utilizada(s) no desenvolvimento? Se foi Low-Code ou No-Code, informe a plataforma.

**R:** A solução foi desenvolvida em código próprio, sem plataformas Low-Code ou No-Code. Stack:

### Front-end (`web/`)
- **JavaScript ES2022** (módulos ESM), JSX, CSS, HTML5.
- **React 18.3.1** + **Vite 5.4.11** (`@vitejs/plugin-react`) — UI declarativa + build tool com HMR instantâneo.
- **Tailwind CSS 3.4.15** + PostCSS + Autoprefixer — estilização via classes utilitárias com tema customizado em `tailwind.config.js`. Tokens semânticos com `rgb(var(--xxx) / <alpha-value>)` para suportar flip dark↔light via `[data-theme="light"]` no `<html>`, sem mudar uma única classe JSX.
- **Motion 11.11.0** (rebrand do Framer Motion) — animações declarativas e `AnimatePresence` para o carrossel de insights no header.
- **d3-geo 3.1.1** + **topojson-client 3.1.0** — projeção Mercator (`geoMercator().fitExtent`) e renderização SVG da silhueta dos 27 estados (GeoJSON IBGE simplificado de 3.4MB para 226KB).
- **lucide-react 0.460.0** — biblioteca tree-shakable de ícones monoline.
- **Tipografia (Google Fonts)** — Fraunces (display serif), Geist (sans), JetBrains Mono.

### Back-end (`api/`)
- **Python 3.11** + **FastAPI 0.111** + **uvicorn 0.30** — framework REST assíncrono e servidor ASGI.
- **pandas 2.2** + **pyarrow 16** — leitura e manipulação dos parquets do indicador (carga em memória ao iniciar, ~150KB).
- **Pydantic v2** — validação de schemas de entrada/saída.
- **google-genai 2.0** — SDK oficial do Google para Gemini API e Google File Search.
- **python-dotenv** — carregamento de variáveis de ambiente em desenvolvimento.

### Inteligência artificial
- **Gemini 3 Flash Preview** — modelo conversacional para o agente Copiloto. Temperature 0.4. Configurado com `tool_config.include_server_side_tool_invocations=True` para combinar function declarations custom com tools nativas.
- **Google File Search** — RAG gerenciado nativo. Cinco documentos internos indexados (decisões de arquitetura, escopo estratégico, EDA empírica, camada de incentivos, persona).

### Pipeline de dados (offline)
- **Jupyter Notebook** + pandas + numpy + unidecode + rapidfuzz — geração do indicador (snapshot mensal) consolidando ANEEL SIGA + ANP Biometano + ANEEL SIGET. Output em três arquivos parquet com `data_completeness` por linha.

### Infraestrutura
- **Docker** (multi-stage build) + **Railway** (deploy automático via Git push, healthcheck em `/health`).
- **GitHub** — repositório público (https://github.com/GabrielABSouza/equipe-464).
- **Plataforma de hospedagem do front** — qualquer CDN estática (Vercel, Netlify, Cloudflare Pages).

### Variáveis de ambiente em produção (Railway)
| Variável | Valor |
|---|---|
| `GEMINI_API_KEY` | chave do Google AI Studio |
| `GEMINI_MODEL` | `gemini-3-flash-preview` |
| `GEMINI_FILE_SEARCH_STORE_ID` | identificador do store do File Search com os 5 docs |

### Linguagens secundárias
Markdown para toda a documentação interna em `docs/`. SQL planejado para a v2.1 (Postgres + PostGIS) — registrado em `docs/14_arquitetura_backend_v2.md` como design de longo prazo.

### Bundle e custo
- Front: ~566 KB JS / 139 KB gzip.
- Back: imagem Docker ~250 MB (Python slim + deps), parquet de 150 KB carregado em RAM.
- Custo mensal estimado em produção: R$ 30–60 (Railway tier hobby + Gemini API com prompt caching).

---

## 3. Qual é o manual da solução criada? (Definir quando e como o usuário acessa/utiliza a sua solução)

**R:**

### Quando usar o Radar PID

O Radar PID é indicado para dois momentos de decisão:

**Como investidor industrial** — quando você precisa fazer triagem inicial de localizações no Brasil para um projeto de capital intensivo em transição energética: planta de hidrogênio verde, fertilizantes verdes, aço verde, biometano industrial, data center sustentável, parque solar/eólico de larga escala. Em vez de gastar 4–6 meses em due diligence locacional dispersa em fontes diferentes, você usa o Radar para identificar em segundos os top-N candidatos, com instrumentos públicos aplicáveis já elencados, e converse com o agente sobre quaisquer dúvidas metodológicas em linguagem natural.

**Como gestor público** (estadual, federal, secretaria de desenvolvimento econômico) — quando você precisa priorizar onde aplicar política industrial verde, atrair capital privado, ou desenhar editais e PPPs. O Radar mostra municípios que combinam alto potencial técnico com baixa dinâmica econômica — exatamente os que mais se beneficiariam de transferências federais e instrumentos regionais.

### Como acessar

- **Versão pública** — link a ser anunciado no pitch (front em CDN + API no Railway).
- Não requer login, instalação ou configuração.
- Requisitos: navegador moderno (Chrome, Firefox, Safari, Edge — últimas duas versões) em laptop/desktop. A v2 não tem versão mobile — o produto é executivo, lido em tela ampla.

Para rodar localmente:
```
git clone https://github.com/GabrielABSouza/equipe-464.git
cd equipe-464

# Backend (terminal 1)
cd api
python -m venv .venv && source .venv/bin/activate
pip install -e .
cp .env.example .env  # preencher GEMINI_API_KEY e STORE_ID
uvicorn src.main:app --port 8000

# Frontend (terminal 2)
cd web
npm install
npm run dev
# abrir http://localhost:5173
```

### Fluxo de uso

1. **Acesse a aplicação.** Header com logo PID, carrossel de insights rotativos (4 strings com sinalizações de ranking, incentivos, dados ociosos e casos demonstrativos), botão de tema (claro/escuro) e modal de Metodologia.

2. **Explore o mapa do Brasil.** A coluna central renderiza 1.938 municípios em SVG nativo, com tamanho e cor codificando o score MCDA atual. Hover destaca; clique seleciona.

3. **Inspecione um município.** A sidebar esquerda preenche com:
   - Score final 0–1 e breakdown por bloco (econômico, social, ambiental).
   - Flag de `data_completeness` (qualidade do dado para aquela linha).
   - Score de cada uma das 5 fontes (Solar, Eólica, Biometano, H2 Verde, Biomassa) e o rank dentro do município.
   - Convergência pública: badges agrupadas em 5 categorias (fiscal, financiamento, leilão, obra, política), com microcopy de status (confirmado / proxy / elegibilidade preliminar). Esta camada é informação contextual, **não compõe o score**.
   - Observações narrativas e dados rastreados às fontes oficiais.

4. **Compare dois municípios.** Clique no botão de comparação ao lado de um município, depois selecione um segundo no mapa. A sidebar inteira vira o modo "X vs Y" com confronto por critério em barras espelhadas, instrumentos comuns vs exclusivos, e crosshair pontilhado no mapa para o segundo município.

5. **Converse com o Copiloto.** A sidebar direita está sempre aberta com um agente conversacional Gemini 3 Flash. Ele tem duas capacidades:
   - **Consulta à base interna** (`search_municipio`) — pergunte coisas como "top 5 H2 Verde em PA", "qual o ranking Solar no NE", "Pecém detalhado".
   - **Q&A metodológico** (File Search sobre 5 docs internos) — pergunte "como o score é calculado", "por que essa fórmula", "quais limitações", "o que é a camada de convergência pública".

   A memória da sessão preserva contexto entre turnos: depois de "top 3 Solar", você pode dizer "e em PA?" e o agente entende a referência. TTL de 30 minutos por sessão.

6. **Toggle tema dark/light.** Botão no canto direito do header. Persistido em `localStorage`. O tema escuro é institucional (cockpit), o claro é alinhado ao site público da PID.

7. **Consulte a metodologia.** Botão "Metodologia" no header abre modal com fórmula MCDA (0,40 econômico + 0,30 social + 0,30 ambiental), tabela de blocos por critério e lista de fontes conectadas vs próximas a integrar.

### Estados do produto

- **Sem seleção (default)** — sidebar esquerda mostra tutorial de 3 passos numerados, legenda do mapa e top 3 atual clicável.
- **Município selecionado** — sidebar esquerda em modo `MunicipioCompacto` com features + scores + instrumentos.
- **Comparação ativa** — sidebar esquerda em modo `CompareView`, crosshair pontilhado no mapa para o segundo município.

### Limitações conhecidas (v2.0)

- **Convergência pública ainda mockada.** O backend serve a estrutura; preenchimento real (REIDI, SUDENE, FNE, BNDES) está no roadmap pós-hackathon.
- **Variáveis estaduais aplicadas como municipais.** Linhas/subestações de transmissão são por UF. Próxima versão normaliza intra-UF.
- **Score social ainda é proxy.** Roadmap v2 substitui por dados reais do IBGE Cidades (IDH-M, PIB pc, desemprego, % rural).
- **Sem filtro de aptidão geográfica.** Score solar/eólico/biomassa em município sem aptidão geográfica é candidato à exclusão na v2 (overlay com Atlas Eólico CEPEL + Global Solar Atlas + IBGE PAM).
- **Agente sem grounding em busca web.** Gemini 3 Flash hoje não permite combinar `googleSearch` + `fileSearch` no mesmo request. Priorizamos fileSearch (Q&A metodológico). Roadmap pós-pitch: fallback via função custom chamando Google Custom Search API ou RSS oficial.
- **Sem export de relatório em PDF/CSV. Sem persistência de estado em URL. Sem zoom/pan no mapa. Sem responsivo mobile.** Tudo está em backlog priorizado.

### Aviso metodológico (visível no produto)

Todas as recomendações usam linguagem de **triagem**: "elegibilidade preliminar", "oportunidade candidata", "score de triagem", "priorizar estudo". O Radar PID **não substitui due diligence completa nem parecer técnico, jurídico ou financeiro** — encaminha pra ela com mais foco e menos tempo desperdiçado (regulamento §10.13).

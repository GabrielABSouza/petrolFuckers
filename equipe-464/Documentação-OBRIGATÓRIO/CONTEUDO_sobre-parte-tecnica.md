# Conteúdo a colar em `Sobre parte tecnica da sua solução.docx`

> Três perguntas técnicas do template. Texto pronto pra colar.

---

## 1. Qual é o tipo de solução criada? (Website, aplicativo, SaaS, bot, etc.)

**R:** Website — aplicação web single-page (SPA), client-side, sem backend. É um protótipo navegacional do **Radar PID**, uma camada de inteligência sobre a Plataforma Interativa de Descarbonização (PID) do Instituto E+. Roda 100% no navegador, não requer login, não armazena dados pessoais. Faz o build em ~1 segundo e pode ser hospedada em qualquer plataforma estática (Vercel, Netlify, Hugging Face Spaces). A arquitetura escolhida (sem backend, sem autenticação, sem banco de dados) é deliberada para a v0.1: maximiza velocidade de iteração no hackathon, elimina superfície de ataque, e é trivial fazer evoluir para SaaS quando a base de dados real (5.570 municípios) substituir o mock atual de 12 municípios.

---

## 2. Qual (ou quais) linguagem(ns) de programação (e/ou framework) utilizada(s) no desenvolvimento? Se foi Low-Code ou No-Code, informe a plataforma.

**R:** A solução foi desenvolvida em código próprio, sem plataformas Low-Code ou No-Code. Stack:

**Linguagens.** JavaScript ES2022 (módulos ESM nativos), JSX (sintaxe React), CSS (com diretivas Tailwind), HTML5.

**Framework principal.**
- **React 18.3.1** — biblioteca de UI declarativa, escolhida pela familiaridade da equipe e pelo ecossistema maduro.
- **Vite 5.4.11** com `@vitejs/plugin-react` — build tool e dev server. Foi preferido a Next.js (overkill para client-only) e a Create React App (deprecado). HMR instantâneo, dev server abre em <200ms.

**Estilização.**
- **Tailwind CSS 3.4.15** com tema customizado em `tailwind.config.js` (paleta navy + amber alinhada com a PID original, tipografia Fraunces + Geist + JetBrains Mono).
- **PostCSS 8.4.49 + Autoprefixer 10.4.20** — pipeline de CSS.
- CSS adicional em `index.css` para texturas (grain noise SVG, scan-lines, topo-dots) e sliders customizados.

**Animação.**
- **Motion 11.11.0** (rebrand do Framer Motion) — animações declarativas e `AnimatePresence` para transições de mount/unmount. Uso restrito a barras animadas no breakdown, modal fade-in e briefing fade-up no copiloto.

**Geoespacial.**
- **d3-geo 3.1.1** — projeção Mercator (`geoMercator().fitExtent`) e gerador de paths SVG (`geoPath`).
- **topojson-client 3.1.0** — descompressão do GeoJSON dos 27 estados brasileiros em runtime.
- **topojson-server 3.0.1 + topojson-simplify 3.0.3** (build-time) — simplificação que reduziu o GeoJSON oficial do IBGE de 3.4MB para 226KB sem perda visível na escala do produto.

**Ícones.**
- **lucide-react 0.460.0** — biblioteca tree-shakable de ícones monoline (estilo coerente com o tema institucional). 14 ícones em uso.

**Tipografia (CDN).** Google Fonts variáveis: Fraunces (display serif, eixos opsz e SOFT), Geist (sans), JetBrains Mono (números e códigos).

**Linguagens secundárias do projeto** (não rodam no produto final, mas usadas em pesquisa/dados): Python para análise exploratória de dados (pandas), Markdown para toda a documentação interna em `docs/`.

**Por que não TypeScript.** Decisão deliberada: em hackathon de 37h, fricção de tipagem ultrapassa o ganho de segurança em um protótipo de 750 linhas. Migração para TypeScript é um próximo passo trivial quando o produto sair do mock.

**Bundle final.** ~566KB JS / 139KB gzip. A maior parcela vem do GeoJSON (226KB) e d3-geo (~80KB). Aceitável para v0.1; otimização via code-split do mapa é o próximo passo.

---

## 3. Qual é o manual da solução criada? (Definir quando e como o usuário acessa/utiliza a sua solução)

**R:**

### Quando usar o Radar PID

O Radar PID é indicado para dois momentos de decisão:

**Como investidor industrial** — quando você precisa fazer triagem inicial de localizações no Brasil para um projeto de capital intensivo em transição energética: planta de hidrogênio verde, fertilizantes verdes, aço verde, biometano industrial, data center sustentável, parque solar/eólico de larga escala. Em vez de gastar 4–6 meses em due diligence locacional dispersa em fontes diferentes, você usa o Radar para identificar em segundos os top-N candidatos por critério ponderado, com instrumentos públicos aplicáveis já elencados.

**Como gestor público** (estadual, federal, secretaria de desenvolvimento econômico) — quando você precisa priorizar onde aplicar política industrial verde, atrair capital privado, ou desenhar editais e PPPs. O Radar mostra municípios que combinam alto potencial técnico com baixa dinâmica econômica — exatamente os que mais se beneficiariam de transferências federais e instrumentos regionais.

### Como acessar

Versão de demonstração: link público hospedado em plataforma estática (a ser anunciado no pitch). Não requer login, instalação ou configuração. Requisitos: navegador moderno (Chrome, Firefox, Safari, Edge — últimas duas versões) em laptop/desktop. Não há versão mobile na v0.1 — o produto é executivo, lido em tela ampla.

Para rodar localmente:
```
git clone <repo>
cd web
npm install
npm run dev
# abrir http://localhost:5173
```

### Fluxo de uso (≈3 minutos)

1. **Selecione a Lente.** No header, escolha entre **Investidor** ou **Órgão público**. Isso muda o tom do Copiloto e a ênfase de microcopy do produto.

2. **Selecione o Modo.** No header, escolha entre **Renováveis gerais**, **Data centers IA** ou **Neoindustrialização verde**. Isso aplica um pre-set de pesos aos 6 critérios do MCDA.

3. **Explore o mapa.** A coluna central mostra o mapa do Brasil com pontos por município. Cor e tamanho do ponto codificam o score atual. Estados aparecem como silhuetas para referência geográfica.

4. **Inspecione um município.** Clique em qualquer ponto. A sidebar esquerda preenche com:
   - Score final 0–100 e breakdown por critério (6 barras horizontais).
   - Convergência pública (score isolado + badges dos instrumentos aplicáveis agrupadas em 5 categorias: fiscal, financiamento, leilão, obra, política).
   - Observações narrativas e dados rastreados às fontes.

5. **Compare dois municípios.** Clique no botão de comparação ao lado de um município, depois selecione um segundo no mapa. A sidebar inteira vira o modo "X vs Y" com confronto por critério em barras espelhadas, instrumentos comuns vs exclusivos, e crosshair pontilhado no mapa para o segundo município.

6. **Converse com o Copiloto.** A sidebar direita está sempre aberta com o agente conversacional. Ele lê o contexto da aplicação (lente, modo, município, comparação) e oferece briefing automático ao selecionar um município, além de 6 sugestões focadas em incentivos públicos. Toda resposta diferencia explicitamente dado confirmado, proxy, elegibilidade preliminar e próxima validação.

7. **Consulte a metodologia.** Botão "ⓘ Metodologia" no canto direito do header. Modal compacto com fórmula MCDA, tabela dinâmica de pesos do modo atual e lista de fontes conectadas vs próximas a integrar.

### Estados do produto

- **Sem seleção (default)** — sidebar esquerda mostra tutorial de 3 passos numerados, legenda do mapa e top 3 atual clicável.
- **Município selecionado** — sidebar esquerda em modo `MunicipioCompacto`.
- **Comparação ativa** — sidebar esquerda em modo `CompareView`, crosshair pontilhado ember no mapa para o segundo município.

### Limitações conhecidas (v0.1)

- 12 municípios mockados (Pecém, Camaçari, Janaúba, Lucas do Rio Verde e mais 8). Versão completa com 5.570 reais via integração ANEEL + IBGE + SAFMaps.
- Convergência pública aparece como score isolado, não somado no MCDA — decisão deliberada para preservar separação entre viabilidade técnica e elegibilidade fiscal.
- Sem export de relatório em PDF/CSV. Sem persistência de estado em URL. Sem zoom/pan no mapa. Sem responsivo mobile. Tudo está em backlog priorizado.

### Aviso metodológico (visível no produto)

Todas as recomendações usam linguagem de **triagem**: "elegibilidade preliminar", "candidato a investimento", "próxima validação". O Radar PID **não substitui due diligence completa nem parecer jurídico** — encaminha pra ela com mais foco e menos tempo desperdiçado.

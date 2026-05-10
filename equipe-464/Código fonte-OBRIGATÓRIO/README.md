# Radar PID — código-fonte (Equipe 464)

Protótipo da camada de inteligência sobre a Plataforma Interativa de Descarbonização (PID) do Instituto E+, desenvolvido para o Hackathon E+ Transição Energética (9–10 mai 2026).

## Como rodar localmente

Pré-requisitos: Node.js ≥ 18 e npm.

```bash
cd web
npm install
npm run dev
# abrir http://localhost:5173
```

Build de produção:

```bash
npm run build      # gera dist/ — host estático em qualquer plataforma
npm run preview    # serve o build em http://localhost:4173 para validação
```

## Stack

- React 18.3.1 + Vite 5.4.11 (`@vitejs/plugin-react`)
- Tailwind CSS 3.4.15 + PostCSS + Autoprefixer
- Motion 11.11.0 (animações)
- d3-geo 3.1.1 + topojson-client 3.1.0 (mapa SVG do Brasil)
- lucide-react 0.460.0 (ícones)

Detalhes completos em `CONTEUDO_sobre-parte-tecnica.md` (na pasta `Documentação-OBRIGATÓRIO/`).

## Estrutura

```
web/
├── public/              # assets estáticos (logos)
├── src/
│   ├── App.jsx          # orquestrador + componentes inline (~750 linhas)
│   ├── BrazilMap.jsx    # mapa SVG + d3-geo
│   ├── Copiloto.jsx     # painel direito conversacional
│   ├── data.js          # mock de 12 municípios + constantes
│   ├── scoring.js       # motor MCDA puro (computeBreakdown + computeFinalScore)
│   ├── brazil_topo.json # geometria estados IBGE simplificada (226KB)
│   ├── index.css        # Tailwind + texturas + sliders custom
│   └── main.jsx         # entrada React
├── index.html
├── tailwind.config.js   # design tokens (paleta navy + amber)
├── postcss.config.js
├── vite.config.js
└── package.json
```

## O que é mock vs real

**Mock atual (v0.1):** 12 municípios em `web/src/data.js` (Pecém-CE, Camaçari-BA, Janaúba-MG, Lucas do Rio Verde-MT e mais 8), com instrumentos públicos elencados manualmente a partir de pesquisa nas fontes oficiais.

**Pipeline para versão real (próxima fase, fora do escopo do hackathon):**
- ANEEL SIGA (25.407 empreendimentos), ANEEL SIGET (1.160 linhas + 2.305 subestações + 10.379 projetos) — `data/raw/`
- ANP Biometano (492 registros)
- SAFMaps GeoServer WFS (72 camadas — siderurgia, biomassa, indicadores socioambientais)
- IBGE SIDRA + GeoServer (~50 features por município)
- MME REIDI, SUDENE, BNDES, Transferegov, Obrasgov (camada de convergência pública)

Especificação detalhada do dataframe mestre em `docs/08_ibge_dados.md` e do pipeline de incentivos públicos em `docs/11_convergencia_incentivos_publicos.md`.

## Decisões arquiteturais

Todas justificadas em `docs/12_decisoes_arquitetura_radar_pid.md`. Antes de mexer em qualquer escolha de stack, layout, paleta ou estrutura de dados, ler aquele documento — cada decisão tem alternativas consideradas e razão registradas.

## Licença e originalidade

Código original desenvolvido durante o Hackathon E+ Transição Energética 2026. Conformidade com regulamento §10.10 (nada pré-existente, nada copiado de outras competições). Bibliotecas de terceiros são open-source com licenças permissivas (MIT/Apache).

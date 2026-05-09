# Radar PID — protótipo frontend

> Evolução conceitual da PID do Instituto E+. Da visualização à decisão: priorize onde investir, destravar rede e acelerar energia limpa no Brasil.

Stack: **React 18 + Vite 5 + Tailwind 3 + Motion 11 + d3-geo + topojson-client + lucide-react**.

> **Por que cada decisão foi tomada** (produto, UX, stack, arquitetura): ver [`docs/12_decisoes_arquitetura_radar_pid.md`](../docs/12_decisoes_arquitetura_radar_pid.md).

## Rodando localmente

```bash
cd web
npm install
npm run dev          # http://localhost:5173
npm run build        # produção em dist/
npm run preview      # serve dist/
```

Sem backend, sem chave de API. Todos os dados são mockados em `src/data.js`.

## Estrutura

```
web/
├── package.json, vite.config.js, tailwind.config.js, postcss.config.js
├── index.html
└── src/
    ├── main.jsx          ← entrada React
    ├── App.jsx           ← orquestrador, ranking, painel de decisão, comparação, metodologia
    ├── BrazilMap.jsx     ← SVG hand-coded do Brasil + dots interativos
    ├── Copiloto.jsx      ← chatbot mock que lê o estado da app
    ├── data.js           ← 12 municípios mockados + modos + critérios
    ├── scoring.js        ← lógica de score, projeção lat/lng, recomendações
    └── index.css         ← Tailwind + variáveis de tema + slider customizado
```

## Direção estética

**Plataforma de inteligência institucional** — Bloomberg Terminal × IPEA quarterly × Atlas editorial.

- **Tipografia**: Fraunces (display, serifa variável editorial), Geist (body, sober), JetBrains Mono (dados/números).
- **Paleta**: navy profundo `#031a33`/`#05274b` como base, paper warm `#f4f1ea`, âmbar `#fcc20a` apenas em estados críticos (top score, ações), ember/cinder `#fc6926`/`#fa441a` em alertas.
- **Densidade > whitespace**. Sharp edges em widgets de dados. Hairlines `rgba(244,241,234,0.08)`.
- **Atmosfera**: grain noise, scan-lines, topo-dots no canvas do mapa, diagonal hatch em badges "MOCK".

## Features implementadas

- ✅ Header com brand, navegação por abas, indicadores de estado (persona/modo).
- ✅ Tese central em ticker tagline.
- ✅ Painel lateral: persona (investidor/órgão público), modo de análise (renováveis/data centers/neoindustrialização), 6 sliders de peso ajustáveis, reset.
- ✅ Mapa do Brasil em SVG hand-coded (~22 vértices), dots de tamanho/cor por score, halo nos top-3, crosshair no selecionado, scan-lines, topo dots, indicadores técnicos (lat/lng bbox, sistema CRS).
- ✅ Ranking ordenado com score, sparkline mini-bars por critério, força/gargalo, botão de comparar.
- ✅ Painel de decisão: score grande, breakdown animado por barra, observações, stats técnicos, recomendações acionáveis com severidade (alta/média/info).
- ✅ Comparação lado-a-lado entre dois municípios (tabela diff + texto interpretativo).
- ✅ Metodologia em overlay: fórmula do score, fontes conectadas, fontes na próxima versão, aviso de mock.
- ✅ Copiloto PID: chatbot lateral com sugestões, responde com base no estado atual, 5 categorias de pergunta, sempre carimba "dados mockados".

## Critérios de sucesso (do briefing)

| # | Demonstrável | OK |
|---|---|----|
| 1 | Usuário muda pesos e vê o ranking mudar | ✓ |
| 2 | Seleciona município e entende por quê | ✓ |
| 3 | Ativa modo "Data centers IA" e análise muda | ✓ |
| 4 | Compara dois municípios | ✓ |
| 5 | Pergunta ao Copiloto PID | ✓ |
| 6 | Entende quais dados são mockados | ✓ (badge persistente + aviso na metodologia + carimbo no copiloto) |

## Próximos passos (após hackathon)

1. **Conectar dados reais** via `master_df.csv` especificado em `docs/08_ibge_dados.md`.
2. **Trocar SVG hand-coded por mapa real** (Mapbox/MapLibre + tiles ANEEL) quando viável.
3. **Implementar sliders cruzados com persona** (persona = preset de pesos).
4. **Persistir comparações em URL** para compartilhamento.
5. **Acessibilidade**: revisar contraste em estados secundários, navegação por teclado nos dots do mapa.

# Radar PID — Stack + Decisões (cheat sheet pro time)

> **Audiência:** integrantes da Equipe 464 lendo pra consolidar nos `.docx` dos jurados ou no roteiro do pitch.
>
> **TL;DR:** Front React/Vite + Back Python/FastAPI + Agente Gemini 3 Flash, indicador real (1.938 municípios × 5 fontes), deploy Vercel (front) + Railway (back).

---

## 1. Stack em 1 tabela

| Camada | Stack | Bibliotecas principais |
|---|---|---|
| Front-end | React 18 + Vite 5 + Tailwind 3 | motion, d3-geo, topojson-client, lucide-react |
| Back-end | Python 3.11 + FastAPI 0.111 | pandas, pyarrow, pydantic, uvicorn |
| Agente IA | Gemini 3 Flash Preview | google-genai SDK + Google File Search nativo |
| Dados | Parquet pré-calculado em memória | snapshot mensal a partir do notebook |
| Deploy | Vercel (front) + Railway (back) | Docker multi-stage pra API |
| Documentação | Markdown em `docs/` | Specs prescritivas em `docs/SPEC_*.md` |

**Bundle final:** front ~566 KB JS / 139 KB gzip; back imagem ~250 MB com parquet de 150 KB carregado em RAM.

**Custo operacional estimado em produção:** R$ 30–60/mês (Railway hobby + Gemini API com prompt caching).

---

## 2. Indicador (resumo de 1 página)

- **Cobertura:** 1.938 municípios × 5 fontes (Solar, Eólica, Biometano, H2 Verde, Biomassa) = **9.690 scores**.
- **Fórmula MCDA:** `score = 0,40 × eco + 0,30 × soc + 0,30 × env`.
- **Cada bloco:** média NaN-safe de 2–3 variáveis normalizadas via min-max global.
- **Flag de qualidade:** coluna `data_completeness` (0–1) por linha. **38% das linhas com 100%** das variáveis presentes; **9% com <60%**.
- **Fontes:** ANEEL SIGA (25.407 empreendimentos), ANP Biometano (492 registros), ANEEL SIGET (1.160 linhas + 2.305 subestações + 10.379 projetos). CO₂ evitado com fator EPE 2023 (0,06 tCO₂/MWh).
- **Snapshot atual:** 2026-05-10.
- **Pipeline offline:** notebook `scriptAnalysis.ipynb` na branch `dados_score_pid` → 3 parquets em `api/data/`.

---

## 3. Decisões principais (15 cards)

### 3.1 Produto e UX

**1. Removemos a "Lente Investidor/Órgão público"**
Era cosmética — a função `computeBreakdown(m)` no scoring nunca usou persona, só mudava strings no Copiloto. Sem efeito no score, simplificou o produto.

**2. Removemos "Modo de análise" (Renováveis/Data Centers/Neoindustrialização)**
A modelagem real é per-fonte (Solar/Eólica/Biometano/H2 Verde/Biomassa), não per-tese-de-investimento. Manter Modo na UI sem reflexo no backend seria desonesto.

**3. Dual theme dark/light via CSS vars**
Tema claro alinha com o site público da PID (institucional E+); tema escuro é diferencial estético "cockpit". Flip via `[data-theme="light"]` no `<html>` — JSX classNames não mudam.

**4. Logo PID oficial obrigatória no header**
Orientação explícita da banca: logo + nome + paleta da PID são obrigatórios. Aplicada em SVG via `<img>`, h-[68px], substituiu o radar animado custom da v1.

**5. Carrossel de insights motion no header**
Substituiu Lente/Modo. 4 strings rotativas a cada 5s com `AnimatePresence` (pattern AiPets). Pesos narrativos: ranking-derived + incentivo público + EDA empírico + caso real. Reforça narrativa "PID + IA".

### 3.2 Indicador

**6. Média ponderada simples, não ML**
Decisão deliberada vs Random Forest, GWR, TOPSIS. **Por quê:** explicabilidade radical — usuário entende a fórmula em 1 frase. Defensável em comitê de investimento.

**7. data_completeness flag em vez de fillna(0)**
Tratamento original silenciava ausência (município sem dado virava "0" — interpretado como "ótimo"). Agora `np.nanmean` ignora NaN, e cada linha tem `data_completeness` (0–1) explícito. **Honestidade metodológica vs alucinação.**

**8. Score por fonte, não score único**
Cada município tem 5 scores (1 por fonte de geração). Cabeça de ranking é "qual fonte rende mais score nesse município".

**9. Incentivos públicos como info-only, NUNCA score**
REIDI/SUDENE/FNE/BNDES aparecem como badges com status (confirmado/proxy/elegibilidade preliminar). **Decisão deliberada de não somar:** somar viesaria viabilidade técnica com elegibilidade fiscal. Lado-a-lado preserva interpretabilidade.

**10. Microcopy responsável obrigatório (regulamento §10.13)**
"Oportunidade candidata", "elegibilidade preliminar", "score de triagem", "priorizar estudo". **Evitar:** "garantido", "melhor investimento", "retorno certo".

### 3.3 Backend e agente

**11. FastAPI Python + parquet em RAM, sem DB**
Volume é trivial (9.690 linhas, ~150 KB). Postgres+PostGIS é overkill agora. Lifecycle FastAPI carrega parquet uma vez na inicialização. Migração pra DB no v2.1 quando dataset crescer.

**12. Agente Gemini 3 Flash Preview**
Modelo escolhido pelo time (já validado em outro projeto). Custom function `search_municipio` consulta o indicador; File Search nativo faz RAG sobre 5 docs internos.

**13. googleSearch dropado por incompat com fileSearch**
Gemini 3 Flash hoje não permite combinar `googleSearch` + `fileSearch` no mesmo request. Priorizamos `fileSearch` (Q&A metodológico vale mais no pitch). Roadmap: fallback via função custom chamando Google Custom Search API.

**14. Memória in-memory por session_id**
Dict em RAM com TTL 30min, máximo 20 turnos por sessão. Sem persistência cross-session. Suficiente pra MVP; v2.1 persiste em Postgres/Redis.

### 3.4 Operacional

**15. Vercel (front) + Railway (back)**
Vercel é otimizado pra estático com edge cache; Railway pra processo Python com Docker. Free tier de ambos cobre o MVP. CORS aberto (`*`) hoje — restringido pra v2.1.

---

## 4. Diferenciais defensáveis (frente a benchmark)

1. **Indicador MCDA real com flag explícita de qualidade** (data_completeness). Raro em plataformas comerciais.
2. **Agente especializado em incentivos públicos brasileiros** com RAG sobre docs internos. WayCarbon/ClimateView/Climate TRACE não cruzam isso.
3. **Camada de incentivos como info-only.** Decisão metodológica defensável em apresentação.
4. **Operacional em produção, não só protótipo.** Backend e agente respondendo via API pública no fim do hackathon.
5. **Stack 100% open-source com custo desprezível.**
6. **Estética institucional alinhada com a PID original** (logo + paleta + tipografia + dual theme).

---

## 5. Limitações conhecidas (declaradas explicitamente)

- **Convergência pública ainda mockada.** Esquema servido pelo back; preenchimento real REIDI/SUDENE/FNE/BNDES é roadmap.
- **Variáveis estaduais aplicadas como municipais** (linhas/subestações/biometano por UF). Mitigação registrada em `docs/13_roadmap_indicador_v2.md`.
- **Score social ainda é proxy.** v2 substitui por IBGE Cidades real (IDH-M, PIB pc, desemprego, % rural).
- **Sem filtro de aptidão geográfica por fonte.** v2 inclui overlay com Atlas Eólico CEPEL + Global Solar Atlas + IBGE PAM.
- **Min-max global sensível a outliers** (Itaipu/Belo Monte achatam). Mitigação: winsorize 5/95 ou robust scaling.
- **Sem validação cruzada do score** contra realização (REIDI 2020-2025). Roadmap obrigatório pós-hackathon.
- **Agente sem grounding em busca web** (constraint Gemini 3 Flash).
- **Sem testes automatizados, sem CI, sem observability profunda.** MVP deliberado.

---

## 6. Onde encontrar cada coisa no repo

| Item | Caminho |
|---|---|
| Front-end SPA | `web/` |
| Back-end API + Agente | `api/` |
| Notebook do indicador | branch `dados_score_pid`, `scr/scriptAnalysis.ipynb` |
| Decisões de UX/produto | `docs/12_decisoes_arquitetura_radar_pid.md` |
| Roadmap do indicador | `docs/13_roadmap_indicador_v2.md` |
| Design backend v2 | `docs/14_arquitetura_backend_v2.md` |
| Specs prescritivas (já implementadas) | `docs/SPEC_*.md` |
| Conteúdo p/ jurores | `equipe-464/` |

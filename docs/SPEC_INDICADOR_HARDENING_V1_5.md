# SPEC — Hardening do indicador de score (v1.5) + roadmap v2

> **Audiência:** agente implementador. Esta spec é prescritiva. Faça **exatamente** o que está aqui, na ordem em que está aqui, **nada mais e nada menos**.
>
> **Objetivo:** consertar 3 falhas metodológicas no indicador atual (filenames cruzados, NaN tratado como zero, ausência de flag de qualidade), simplificar o produto removendo a Lente Investidor/Órgão público (recurso cosmético sem efeito real no score), garantir que **incentivos públicos permaneçam como camada de informação — nunca como score**, e registrar em `docs/` o roadmap das melhorias metodológicas que **não** dão pra fazer hoje (deadline 21:59 BRT).
>
> **Tempo estimado:** 2,5–3,5h totais distribuídos em 3 etapas independentes:
> - **Etapa A** (notebook) — 1h, branch `dados_score_pid`, sem dependências.
> - **Etapa B** (frontend) — 45min, branch `main`, **GATED**: só rodar depois que a `SPEC_REESTRUTURACAO_DESIGN_SYSTEM_PID.md` estiver aplicada e committada (evita conflitos em `App.jsx`).
> - **Etapa C** (doc roadmap) — 45min, branch `main`, sem dependências.

---

## 1. Pacto de não-fazer (LEIA ANTES DE QUALQUER COISA)

Você **NÃO PODE**:

1. Adicionar dimensão temporal, novos datasets externos (IBGE, Atlas Eólico, PVGIS) **dentro do código** — esses ficam como roadmap doc só, ver §C.
2. Calcular score numérico para incentivos públicos. Eles ficam como **info-only** (status: confirmado/proxy/elegibilidade preliminar + justificativa).
3. Mudar a fórmula `0.40 eco + 0.30 soc + 0.30 env` ou os pesos dos blocos. Hardening = correções de bug + flag de qualidade, **não** redesenho.
4. Tocar em `BrazilMap.jsx`, `index.css`, `tailwind.config.js`, `Copiloto.jsx` (este último: só remover refs a persona, ver §B3).
5. Adicionar dependências em `package.json` ou requirements do notebook.
6. Criar testes automatizados, mocks, ou abstrações — implementação direta.
7. Renomear arquivos no front (data.js, scoring.js, etc.) — só os CSVs do notebook.
8. Escrever comentários explicativos além dos já existentes.

Se em algum momento sentir vontade de fazer algo acima, **pare e devolva pro humano**.

---

## 2. Decisões fechadas

| Decisão | Valor |
|---|---|
| Branch da Etapa A | `dados_score_pid` (remoto: `origin/dados_score_pid`). Trabalhar via `git worktree` em `/tmp/dados_score_pid_work` pra não atrapalhar `main`. |
| Branch da Etapa B + C | `main` (no working tree principal). |
| Estratégia pra NaN | Propagar NaN ao longo da normalização e do cálculo. Nunca substituir por 0. Score final usa `np.nanmean`. |
| Threshold de score válido | Se `data_completeness == 0` (todas variáveis NaN pra (município, fonte)), `score = NaN`. Caso contrário, computa via `nanmean` e emite `data_completeness` ∈ (0, 1]. |
| Filenames novos | `municipio_features.csv` (ex `descriptive_dataset.csv` + `score_df.csv` deduplicado), `mcda_ranking_completo.csv` (ex `best_energy_ranking.csv`), `mcda_top_fonte_municipio.csv` (ex `score_per_set_variable.csv`). |
| `score_df.csv` (duplicado) | Deletar a célula 3 que exporta esse arquivo (é redundante com descriptive). |
| Lente Investidor/Órgão público | **Remover por completo** do front. Não compõe score. Justificativa: o `computeBreakdown(m)` em `scoring.js` já não usa persona — o toggle só mudava strings no Copiloto. |
| Incentivos públicos | Permanecem **só como info contextual** no painel do município (`instrumentosPublicos[]` em `data.js`, com `categoria/status/justificativa`). **Nunca** como score numérico. |

---

## 3. Resumo dos arquivos tocados

### Etapa A — branch `dados_score_pid`
| Arquivo | Mudança |
|---|---|
| `scr/scriptAnalysis.ipynb` | (a) deletar célula que exporta `score_df.csv`; (b) reescrever célula 5 (modeling) com NaN-safe ops + `data_completeness`; (c) atualizar célula 8 (export) com filenames novos |
| `data/processed/best_energy_ranking.csv` | **renomear** → `mcda_ranking_completo.csv` (após re-execução) |
| `data/processed/descriptive_dataset.csv` | **renomear** → `municipio_features.csv` |
| `data/processed/score_per_set_variable.csv` | **renomear** → `mcda_top_fonte_municipio.csv` |
| `data/processed/score_df.csv` | **deletar** (duplicado) |

### Etapa B — branch `main`, **gated** em `SPEC_REESTRUTURACAO_DESIGN_SYSTEM_PID.md` aplicada
| Arquivo | Mudança |
|---|---|
| `web/src/data.js` | Remover export `PERSONAS` |
| `web/src/App.jsx` | Remover state `persona`/`setPersona`, import `PERSONAS`, bloco JSX "LENTE", e chave `persona` do `ctxCopiloto` |
| `web/src/Copiloto.jsx` | Remover `persona` da destructure de `ctx` e simplificar a string que usava `persona === "orgao_publico"` |

### Etapa C — branch `main`
| Arquivo | Mudança |
|---|---|
| `docs/13_roadmap_indicador_v2.md` | **CRIAR** com lista priorizada das melhorias metodológicas + custo + fontes de dados necessárias |

**Nada mais é tocado.**

---

## 4. Etapa A — Hardening do notebook (branch `dados_score_pid`)

### A0. Setup de worktree

Esta etapa NÃO mexe em `main`. Use worktree pra evitar conflito com mudanças em vôo no front.

```bash
# Criar worktree (se já não existir em /tmp/dados_score_pid_inspect — nesse caso reusa)
cd /Volumes/ExtremePro/hackaton_E+
git fetch origin dados_score_pid
git worktree add -B dados_score_pid /tmp/dados_score_pid_work origin/dados_score_pid 2>/dev/null || git worktree add /tmp/dados_score_pid_work dados_score_pid

cd /tmp/dados_score_pid_work
git status   # deve estar clean, na branch dados_score_pid
```

### A1. Editar célula 3 (data dictionary) — deletar linha de export duplicado

Abrir `scr/scriptAnalysis.ipynb`. Localize a célula 3 (data dictionary). No final dela existe:

```python
score_df.to_csv("../data/processed/score_df.csv", index=False, encoding="utf-8-sig")
```

**Apague essa linha**. O `score_df` é re-exportado depois (célula 8) com nome correto.

### A2. Reescrever célula 5 (modeling) — NaN-safe + data_completeness

A célula 5 atualmente está assim (forma resumida):

```python
def minmax(s):
    mn, mx = s.min(), s.max()
    return pd.Series([0.5]*len(s), index=s.index) if mx == mn else (s - mn) / (mx - mn)

norm = score_df[["municipio", "uf", "lat", "lon"]].copy()
for v in all_vars:
    col = score_df[v].fillna(0) if v in score_df.columns else pd.Series(0, index=score_df.index)
    norm[v + "_n"] = minmax(col)

# loop de score:
eco_s = np.mean([row.get(v + "_n", 0) for v in blks["eco"]])
soc_s = np.mean([row.get(v + "_n", 0) for v in blks["soc"]])
env_s = np.mean([row.get(v + "_n", 0) for v in blks["env"]])
total = W_ECO * eco_s + W_SOC * soc_s + W_ENV * env_s
```

**Substitua o conteúdo da célula 5 inteira** pelo seguinte (o bloco `FONTES`, `VAR_FONTE`, `W_ECO/SOC/ENV` continua idêntico — substitua a partir do `def minmax`):

```python
# ── normalize all variables globally — NaN-safe ──────────
def minmax(s):
    """Min-max scaling preservando NaN. Constante vira 0.5; tudo NaN vira NaN."""
    mn, mx = s.min(skipna=True), s.max(skipna=True)
    if pd.isna(mn) or pd.isna(mx):
        return pd.Series(np.nan, index=s.index)
    if mx == mn:
        return pd.Series(0.5, index=s.index).where(s.notna(), np.nan)
    return (s - mn) / (mx - mn)

all_vars = list({v for f in VAR_FONTE.values() for blk in f.values() for v in blk})

norm = score_df[["municipio", "uf", "lat", "lon"]].copy()
for v in all_vars:
    col = score_df[v] if v in score_df.columns else pd.Series(np.nan, index=score_df.index)
    norm[v + "_n"] = minmax(col)


def block_mean(values):
    """Média ignorando NaN. Se todos NaN, retorna NaN."""
    arr = np.array(values, dtype=float)
    if np.all(np.isnan(arr)):
        return np.nan
    return float(np.nanmean(arr))


# ── compute score per municipality × fonte ────
rows = []
for _, row in norm.iterrows():
    for fonte in FONTES:
        blks = VAR_FONTE[fonte]
        eco_vals = [row.get(v + "_n", np.nan) for v in blks["eco"]]
        soc_vals = [row.get(v + "_n", np.nan) for v in blks["soc"]]
        env_vals = [row.get(v + "_n", np.nan) for v in blks["env"]]

        eco_s = block_mean(eco_vals)
        soc_s = block_mean(soc_vals)
        env_s = block_mean(env_vals)

        # data_completeness: fração de variáveis presentes (0–1)
        all_block_vals = eco_vals + soc_vals + env_vals
        n_total = len(all_block_vals)
        n_present = int(sum(1 for v in all_block_vals if not pd.isna(v)))
        data_completeness = round(n_present / n_total, 4) if n_total > 0 else 0.0

        # se completude zero, score é NaN (não inventa valor)
        if data_completeness == 0:
            total = np.nan
        else:
            # nanmean garante que blocos vazios não zeram o score
            block_scores = [W_ECO * eco_s, W_SOC * soc_s, W_ENV * env_s]
            total = float(np.nansum(block_scores)) if not all(pd.isna(b) for b in block_scores) else np.nan

        rows.append({
            "municipio": row["municipio"],
            "uf":        row["uf"],
            "lat":       row["lat"],
            "lon":       row["lon"],
            "fonte":     fonte,
            "score":     round(total, 4) if not pd.isna(total) else np.nan,
            "eco_score": round(eco_s, 4) if not pd.isna(eco_s) else np.nan,
            "soc_score": round(soc_s, 4) if not pd.isna(soc_s) else np.nan,
            "env_score": round(env_s, 4) if not pd.isna(env_s) else np.nan,
            "data_completeness": data_completeness,
        })

mcda_df = pd.DataFrame(rows)

# ── rank fontes within each municipality (ignora NaN) ──────
mcda_df["rank"] = (
    mcda_df.groupby("municipio")["score"]
           .rank(method="dense", ascending=False, na_option="bottom")
           .astype("Int64")
)

# ── best fit per municipality (rank 1, score não-NaN) ───
best_df = (
    mcda_df[(mcda_df["rank"] == 1) & mcda_df["score"].notna()]
    .sort_values("score", ascending=False)
    .reset_index(drop=True)
)
```

**Pontos de atenção:**
- `na_option="bottom"` no rank evita que NaNs ganhem rank=1 falso.
- `score = round(...) if not pd.isna(...)` preserva NaN literal (não vira 0).
- `data_completeness` é coluna nova, exportada com cada linha do MCDA.

### A3. Reescrever célula 8 (export) — filenames novos

A célula 8 atual:

```python
ranking_df.to_csv("../data/processed/best_energy_ranking.csv", index=False, sep=",", decimal=".")
best_df.to_csv("../data/processed/score_per_set_variable.csv",       index=False, sep=",", decimal=".")
score_df.to_csv("../data/processed/descriptive_dataset.csv",     index=False, sep=",", decimal=".")
```

**Substitua inteiramente** por:

```python
# Filenames descritivos (v1.5) — alinhados com conteúdo
score_df.to_csv("../data/processed/municipio_features.csv",         index=False, sep=",", decimal=".")
ranking_df.to_csv("../data/processed/mcda_ranking_completo.csv",    index=False, sep=",", decimal=".")
best_df.to_csv("../data/processed/mcda_top_fonte_municipio.csv",    index=False, sep=",", decimal=".")
```

> Se a variável `ranking_df` ainda for definida na célula 6, mantém. Se não, ela vem da reescrita acima — verifique e ajuste a célula 6 pra usar `mcda_df` direto se necessário.

### A4. Re-executar notebook

```bash
cd /tmp/dados_score_pid_work/scr
jupyter nbconvert --to notebook --execute scriptAnalysis.ipynb --inplace
# ou abrir no Jupyter/VSCode e rodar todas as células
```

Verificar que:
- Não há erros de execução.
- Os 3 CSVs novos foram criados em `data/processed/`.
- Os arquivos antigos (`best_energy_ranking.csv`, `descriptive_dataset.csv`, `score_per_set_variable.csv`, `score_df.csv`) **ainda existem** (notebook só escreve os novos; precisamos deletar manualmente — passo A5).

### A5. Deletar arquivos antigos

```bash
cd /tmp/dados_score_pid_work
rm data/processed/best_energy_ranking.csv
rm data/processed/descriptive_dataset.csv
rm data/processed/score_per_set_variable.csv
rm data/processed/score_df.csv
ls data/processed/
```

Resultado esperado de `ls`: `municipio_features.csv`, `mcda_ranking_completo.csv`, `mcda_top_fonte_municipio.csv` + arquivos não-modificados (`agente_eda_findings.md`, `ANEEL_SIGA_resumo.json`).

### A6. Validação rápida dos outputs

```bash
cd /tmp/dados_score_pid_work
head -3 data/processed/municipio_features.csv
head -3 data/processed/mcda_ranking_completo.csv
head -3 data/processed/mcda_top_fonte_municipio.csv

# Schema check: novo arquivo de ranking tem 11 colunas (10 + data_completeness)
awk -F',' 'NR==1 {print NF}' data/processed/mcda_ranking_completo.csv
# Esperado: 11

# Sanity: contar linhas com NaN no score (antes era 0, agora deve ter alguns)
awk -F',' 'NR>1 && ($6=="" || $6=="NaN" || $6=="nan")' data/processed/mcda_ranking_completo.csv | wc -l
# Esperado: > 0 (alguns municípios devem ter completude zero pra alguma fonte e score NaN)
```

### A7. Commit + push

```bash
cd /tmp/dados_score_pid_work
git add scr/scriptAnalysis.ipynb data/processed/
git status   # confirmar 3 deleções + 3 adições + 1 modificação no notebook
git commit -m "$(cat <<'EOF'
refactor(score): NaN-safe stats, data_completeness flag, rename outputs

- minmax e block scores agora propagam NaN via np.nanmean
- nova coluna data_completeness (0-1) por (municipio, fonte)
- score = NaN quando completude = 0 (não inventa valor)
- rank com na_option=bottom (evita NaN virar rank=1 falso)
- arquivos renomeados: municipio_features / mcda_ranking_completo / mcda_top_fonte_municipio
- removido score_df.csv duplicado

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin dados_score_pid
```

### A8. Limpar worktree

```bash
cd /Volumes/ExtremePro/hackaton_E+
git worktree remove /tmp/dados_score_pid_work
```

---

## 5. Etapa B — Remover Lente do front (branch `main`, GATED)

**PRÉ-REQUISITO ABSOLUTO:** a `SPEC_REESTRUTURACAO_DESIGN_SYSTEM_PID.md` deve estar **completa e committada** em `main`. Verifique com:

```bash
cd /Volumes/ExtremePro/hackaton_E+
git log --oneline main | head -3
# Deve mostrar commit recente com tema/logo PID
git diff HEAD --name-only
# Deve estar vazio (working tree clean)
```

Se não estiver, **pare** e devolva pro humano: "design system ainda não está em main, etapa B fica bloqueada".

### B1. Remover Lente do `web/src/App.jsx`

> Use `grep -n "persona\|PERSONAS\|setPersona" web/src/App.jsx` pra localizar — números de linha podem ter mudado depois do design system.

Em `App.jsx`, faça as seguintes remoções:

**(a)** No import de `./data`, remover `PERSONAS`:
```js
// antes (algo como):
import { ..., PERSONAS, ... } from "./data";
// depois: tirar PERSONAS da lista
```

**(b)** Remover a linha do `useState` da persona:
```js
const [persona, setPersona] = useState("investidor");  // <- remover esta linha inteira
```

**(c)** Remover o bloco JSX "LENTE" inteiro do header. Ele tem o formato:
```jsx
{/* LENTE */}
<HeaderControl label="Lente">
  <div className="flex border border-hairline-strong">
    {Object.entries(PERSONAS).map(([id, p]) => (
      <button
        key={id}
        onClick={() => setPersona(id)}
        className={...}
      >
        {p.label}
      </button>
    ))}
  </div>
</HeaderControl>
```
Apagar do `{/* LENTE */}` até o `</HeaderControl>` correspondente, **inclusive o divisor `<div className="h-10 w-px bg-hairline-strong" />`** que vinha logo antes (era o separador entre Brand e Lente — sem Lente, separador some também). O bloco MODO de análise vem logo em seguida e fica colado no Brand. Confirme visualmente que MODO ficou imediatamente após o Brand.

**(d)** Remover `persona` do objeto `ctxCopiloto` ou equivalente passado para `<Copiloto>`. Procure por:
```js
const ctxCopiloto = {
  ...
  persona,   // <- remover esta linha
  ...
};
```

### B2. Remover `PERSONAS` de `web/src/data.js`

Localize linha ~379:

```js
export const PERSONAS = {
  investidor: { ... },
  orgao_publico: { ... },
};
```

**Apague o objeto inteiro** + o `export`. Não deixe restos.

### B3. Limpar `web/src/Copiloto.jsx`

**(a)** Linha ~78 — remover `persona` da destructure:
```jsx
// antes:
const { selecionado, ranking, modo, persona, scores } = ctx;
// depois:
const { selecionado, ranking, modo, scores } = ctx;
```

**(b)** Linha ~240 — substituir a string que usava persona:
```jsx
// antes (algo como):
`Tradução para gestor público (lente atual: ${persona === "orgao_publico" ? "órgão público" : "investidor"}):`,
// depois:
`Análise contextual:`,
```

> Se houver outras referências a `persona` no `Copiloto.jsx` (faça `grep -n persona Copiloto.jsx` pra confirmar), simplifique cada uma removendo o branching condicional e mantendo só a versão neutra do texto.

### B4. Verificar incentivos públicos como info-only

**Não toque em nada.** Apenas confirme que:

- `data.js` tem `instrumentosPublicos: [{ categoria, status, justificativa }]` por município (sem campo numérico).
- O painel do município (`MunicipioCompacto` em `App.jsx`) renderiza esses instrumentos com badges de status (confirmado/proxy/elegibilidade), **sem score numérico**.
- O Copiloto pode citá-los textualmente (já cita), mas **não calcula score derivado deles**.

Se encontrar QUALQUER lugar que esteja somando/calculando score a partir de `instrumentosPublicos`, **pare** e devolva pro humano.

### B5. Verificação visual

```bash
cd /Volumes/ExtremePro/hackaton_E+/web
npm run dev
```

- [ ] Header não tem mais "LENTE" — só Brand + MODO + theme toggle + Metodologia.
- [ ] Console sem `ReferenceError: persona is not defined` ou similar.
- [ ] Clicar em município abre painel com score, breakdown, instrumentos públicos visíveis (sem mudança visual).
- [ ] Copiloto responde sem crash.

### B6. Commit

```bash
cd /Volumes/ExtremePro/hackaton_E+
git add web/src/App.jsx web/src/data.js web/src/Copiloto.jsx
git commit -m "$(cat <<'EOF'
refactor(web): remove Lente Investidor/Órgão público

A Lente era cosmética (computeBreakdown não usa persona, só Copiloto
mudava string). Sem efeito real no score, simplifica produto.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## 6. Etapa C — Documentar roadmap v2

Crie o arquivo `docs/13_roadmap_indicador_v2.md` com **exatamente** este conteúdo:

```markdown
# Roadmap do indicador — v2 (pós-hackathon)

> **Status:** v1.5 entregue no Hackathon E+ (10 mai 2026) com correções metodológicas mínimas (NaN-safe stats, data_completeness, filenames descritivos, remoção da Lente cosmética). Este documento registra os gaps metodológicos identificados que **não couberam no prazo de 12h da entrega final** e que a equipe pretende endereçar na continuidade do projeto sob co-titularidade com o Instituto E+ (regulamento §10.4).

## 1. Gaps prioritários (ordem de impacto no ranking)

### 1.1 Variáveis estaduais aplicadas como municipais (gravidade ALTA)
**Problema atual:** `eco_n_linhas_transmissao`, `eco_tensao_media_kv`, `eco_capacidade_subestacao_mva`, `env_n_projetos_transmissao`, `env_bio_producao_m3` são valores por UF aplicados a cada município daquela UF. Os 853 municípios de MG têm o mesmo valor para essas 5 variáveis. Isso achata o sinal e dá peso indevido ao "estado" no score "municipal".

**Mitigação proposta:**
- Mover variáveis estaduais para prefixo `state_*` e tratá-las como **contexto de display** (mostradas no painel sem entrar na fórmula), OU
- Normalizá-las **dentro da UF** antes do min-max global, para que pelo menos a comparação intra-estadual fique preservada.

**Custo:** 4–6h. Sem dependência externa.

### 1.2 Score "social" não é social (gravidade ALTA)
**Problema atual:** `soc_diversidade_fontes` e `soc_n_plantas_operacionais` são proxies de "tem indústria energética", não de impacto socioeconômico. Não há nenhuma variável de IDH, PIB pc, emprego, fragilidade ou geração de oportunidade local.

**Mitigação proposta:** integrar dados IBGE Cidades + Atlas Brasil:
- IDH-M (Atlas Brasil — atlasbrasil.org.br)
- PIB per capita municipal (IBGE Sidra, tabela 5938)
- Taxa de desemprego (IBGE PNAD Contínua, recorte municipal só em capitais — usar interpolação UF→município ponderada por população)
- % população rural (IBGE Censo 2022)
- IFDM (Firjan) como índice composto alternativo

**Custo:** 1–2 dias. Inclui scrape/API + join por código IBGE municipal.

### 1.3 Score "ambiental" é eco disfarçado (gravidade MÉDIA-ALTA)
**Problema atual:** `env_co2_evitado_t_ano` é função direta de `eco_mw_instalado` (multiplicada por 8760h e fator 0.06). Eco e env ficam altamente correlacionadas e o ranking colapsa em 1 dimensão na prática.

**Mitigação proposta:** trocar `env_co2_evitado` por variáveis ambientais independentes:
- Cobertura vegetal nativa remanescente (MapBiomas — coleção 9, raster por município)
- Vulnerabilidade climática (Adapta Brasil MCTI — índices municipais)
- Conflito com APP/UC (overlay com camadas do ICMBio)
- Stress hídrico (ANA — disponibilidade hídrica relativa)

**Custo:** 2–3 dias (processamento raster + agregação por geometria municipal).

### 1.4 MCDA atribui as 5 fontes a TODOS os municípios sem filtro de aptidão (gravidade ALTA)
**Problema atual:** município sem irradiância para solar, sem velocidade de vento para eólica, ou sem resíduo orgânico para biometano ainda recebe score nessas fontes — o ranking sugere "Solar como melhor fonte" para municípios da Amazônia profunda com cobertura nubosa permanente.

**Mitigação proposta:** filtrar fontes elegíveis por município via:
- **Solar:** Global Solar Atlas (GHI > 4.5 kWh/m²/dia)
- **Eólica:** Atlas Eólico Brasileiro (CEPEL) — velocidade média a 100m > 6 m/s
- **Biometano/Biomassa:** IBGE PAM + Pesquisa Pecuária Municipal — disponibilidade de resíduo agro/pecuário
- **H2 Verde:** combinação de aptidão renovável forte + acesso à infra de transmissão

Score só calculado para fonte na qual o município é **apto**. Senão, fonte ausente do ranking.

**Custo:** 3–5 dias. Atlas Eólico vem como mapas raster; precisa interpolar para centroide municipal.

### 1.5 Min-max global é sensível a outliers (gravidade MÉDIA)
**Problema atual:** Itaipu (14 GW) e Belo Monte (11 GW) achatam o min-max para todos os outros municípios — todo mundo cai num intervalo [0, 0.05] na variável `eco_mw_instalado_n`.

**Mitigação proposta:**
- Winsorize 5%/95% antes do min-max, OU
- Robust scaling baseado em mediana e IQR, OU
- Log-transform variáveis right-skewed antes de normalizar.

**Custo:** 2h. Sem dependência externa.

### 1.6 Sem validação cruzada contra realidade (gravidade ALTA — defensabilidade do método)
**Problema atual:** o ranking nunca foi cruzado com dado de realização (quem realmente recebeu REIDI, FNE-Verde, SUDENE). Todo o método é hipótese metodológica não-validada.

**Mitigação proposta:** baixar histórico de:
- REIDI 2020–2025 (RFB/MFazenda — beneficiários por município)
- FNE-Verde 2020–2025 (Banco do Nordeste — operações por município)
- BNDES Climate Fund 2020–2025 (BNDES Transparência)
- Calcular precision@K (top-50 do nosso ranking ∩ top-50 dos beneficiários reais).

Se precision@K < 30%, o método precisa redesenho antes de ser usado para recomendar municípios.

**Custo:** 2–3 dias (scrape + matching de nomes municipais).

## 2. Gaps menores (housekeeping)

- **Lat/lon = média de plantas:** município com 1 planta na divisa fica com ponto deslocado. Substituir por centroide IBGE municipal (CRS WGS84).
- **Sem dimensão temporal:** snapshot 2023. Adicionar séries 2018–2023 pra captura tendência (capacidade crescente vs ociosidade declinante).
- **Pesos 0.4/0.3/0.3 sem justificativa formal:** rodar AHP/Delphi com 3–5 especialistas em transição energética + análise de sensibilidade (mexer pesos ±20% e ver % de top-50 que sobrevive).

## 3. Camada de incentivos públicos — info, NÃO score

Decisão fechada (10 mai 2026): incentivos governamentais (REIDI, SUDENE, FNE, FCO, BNDES Climate Fund, etc) **NÃO compõem** o score MCDA. Eles aparecem como camada de informação contextual no painel do município com:
- Categoria do instrumento
- Status (`confirmado` / `proxy` / `elegibilidade preliminar`)
- Justificativa textual

**Por que não no score:** elegibilidade é binária e contextual (depende de o investidor querer aplicar a tese), não cardinal. Somar incentivos no score MCDA introduziria viés cumulativo (município já bem ranqueado em eco vira ainda mais bem ranqueado por ter REIDI). Lado-a-lado preserva interpretabilidade.

A camada de incentivos será evoluída separadamente — ver `docs/11_convergencia_incentivos_publicos.md`.

## 4. Ordem de execução sugerida pós-hackathon

| Sprint | Itens | Esforço |
|---|---|---|
| 1 (semana 1) | 1.1 estaduais + 1.5 robust scaling + 2 housekeeping | 1 semana |
| 2 (semana 2-3) | 1.2 IBGE socioeconômico real | 2 semanas |
| 3 (semana 4-5) | 1.4 aptidão geográfica | 2 semanas |
| 4 (semana 6) | 1.3 ambiental independente + 1.6 validação | 2 semanas |
| 5 (semana 7-8) | Reavaliar ranking, AHP/Delphi, publicar v2 | 2 semanas |

Total: ~8 semanas de equipe dedicada (ou 16 semanas em meio-período).
```

(Salvar exatamente como acima — texto inteiro, sem alteração).

### C2. Commit

```bash
cd /Volumes/ExtremePro/hackaton_E+
git add docs/13_roadmap_indicador_v2.md
git commit -m "$(cat <<'EOF'
docs: roadmap do indicador v2 — gaps metodológicos pós-hackathon

Registra 6 gaps prioritários identificados na análise da v1
(estaduais aplicadas como municipais, soc placeholder, env eco-disfarçado,
fontes sem filtro de aptidão, min-max sensível a outlier, sem validação
cruzada) com mitigação, custo e fontes de dados necessárias.

Decisão registrada: incentivos públicos permanecem info-only, não
compõem score (preserva interpretabilidade).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## 7. Critério de aceite (DONE template)

Reporte assim quando concluir as 3 etapas:

```
DONE — hardening indicador v1.5 + roadmap v2

Etapa A (branch dados_score_pid):
- [x] §A1 célula 3: export duplicado deletado
- [x] §A2 célula 5: minmax/block_mean NaN-safe + data_completeness
- [x] §A3 célula 8: filenames novos
- [x] §A4 notebook re-executado sem erros
- [x] §A5 arquivos antigos deletados
- [x] §A6 schema validado (11 colunas, NaN > 0 no score)
- [x] §A7 commit + push em dados_score_pid

Etapa B (branch main, GATED em design system):
- [x] §B0 design system aplicado em main, working tree clean
- [x] §B1 App.jsx: persona/Lente removidos
- [x] §B2 data.js: PERSONAS removido
- [x] §B3 Copiloto.jsx: persona removido
- [x] §B4 incentivos confirmados como info-only
- [x] §B5 verificação visual OK
- [x] §B6 commit em main

Etapa C (branch main):
- [x] §C1 docs/13_roadmap_indicador_v2.md criado
- [x] §C2 commit em main
```

Se qualquer item falhar, reporte com sintoma.

---

## 8. Rollback

- **Etapa A**: `git checkout -- scr/scriptAnalysis.ipynb data/processed/` na worktree, ou `git reset --hard origin/dados_score_pid`.
- **Etapa B**: `git revert <hash>` do commit "remove Lente" se algo quebrou.
- **Etapa C**: `rm docs/13_roadmap_indicador_v2.md` (sem efeito colateral em código).

---

## 9. Resumo executivo (1 frase)

Corrigir 3 falhas metodológicas no notebook (filenames cruzados, NaN-as-zero, sem flag de qualidade), remover a Lente cosmética do front, garantir que incentivos públicos fiquem como info-only (não score), e documentar o roadmap das 6 melhorias maiores que precisam de aquisição externa de dado e ficam pra v2.

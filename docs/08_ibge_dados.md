# IBGE — dados abertos para o dataframe e indicadores

> Fonte: `references/Plano_de_Dados_Abertos_IBGE_2024_2025.pdf` (63p) + página oficial https://www.ibge.gov.br/acesso-informacao/dados-abertos.html. APIs validadas em 09/mai/2026.

## Por que IBGE entra agora

A discussão deslocou para "definir os dados pra construir o dataFrame e modelar". O IBGE é a **espinha dorsal estatística** que casa com tudo que já temos (ANEEL, ANP, SAFMaps): granularidade municipal (5.570 municípios) + códigos IBGE como chave primária comum.

Em uma frase: **IBGE é onde estão os dados socioeconômicos, industriais e ambientais que faltam pra completar o `municipio.csv` que vai alimentar o score multicritério.**

## APIs validadas

### 1. APISIDRA — `https://apisidra.ibge.gov.br/`

API REST para tabelas estatísticas agregadas. Saída JSON.

**Padrão de URL:**
```
https://apisidra.ibge.gov.br/values/t/{tabela}/n{nivel}/{recorte}/v/{variavel}/p/{periodo}
```

| Parâmetro | Valores típicos |
|---|---|
| `t` | número da tabela SIDRA (ex.: 5938) |
| `n` | nível territorial: `1` Brasil, `2` regiões, `3` UF, `6` município, `7` mesorregião |
| `recorte` | `all` (todos), ou código(s) — pode usar `-all` pra todos sem cabeçalho |
| `v` | variável (ex.: `37` PIB) |
| `p` | período: ano (`2023`), `last`, `last 5`, ou intervalo (`2018-2023`) |

**Validação executada (PIB municipal de São Paulo, 2023):**
```bash
curl "https://apisidra.ibge.gov.br/values/t/5938/n6/3550308/v/37/p/last"
# → V: "1066825105" (R$ 1.066 bi) ✓ HTTP 200
```

### 2. APIMetadados — `https://apimetadados.ibge.gov.br/`

Metadados das pesquisas, dimensões, classificações. Útil pra descobrir códigos de variáveis e cruzamentos válidos.

### 3. Servico de Dados — `https://servicodados.ibge.gov.br/api/docs/`

API geral. Endpoints úteis:
- `/api/v1/localidades/municipios` — todos os 5.570 municípios com código IBGE, nome, UF
- `/api/v3/agregados` — catálogo SIDRA via REST
- `/api/v1/pesquisas` — lista pesquisas

### 4. IBGE GeoServer — `https://geoservicos.ibge.gov.br/geoserver/wfs`

**9.526 camadas WFS públicas.** Mesmo padrão que SAFMaps.

```
https://geoservicos.ibge.gov.br/geoserver/wfs
  ?service=WFS&version=2.0.0&request=GetFeature
  &typeName={namespace}:{layer}
  &outputFormat=application/json
```

Namespaces principais: `BDIA`, `CGMAT` (malhas territoriais), `ODS` (indicadores ODS espacializados), `PNADC`, `CCAR`, `CGEO`, `CGED`.

## As 15 tabelas SIDRA prioritárias para nosso DataFrame

Selecionadas por: granularidade municipal/UF + relevância pra descarbonização industrial + alta utilização (anexo 2 do PDF). Em ordem de prioridade.

### Indústria e empresas — preenche **gap sério** dos nossos dados

| # Tabela | Pesquisa | Variáveis-chave | Granularidade | Por que importa |
|---|---|---|---|---|
| **6449** | CEMPRE | Empresas, pessoal ocupado, salários por **CNAE 2.0** seção/divisão/grupo/classe | Município × setor | Resolve gap "mão-de-obra industrial" do `06_eda_insights.md` |
| **1849** | PIA-Empresa | Dados gerais de **unidades locais industriais** (≥5 ocupados) por UF × divisão CNAE | UF × setor | Localiza plantas industriais por subsetor |
| **2221** | PIA | Dados gerais de **indústrias extrativas e de transformação** | Brasil × classe/gênero | Validação macro |
| **7752** | PIA-Produto | Produção e vendas de produtos industriais por classe e produto | UF × produto | Quantifica produto produzido (ex.: aço, cimento) |
| **8888** | PIM-PF | Produção Física Industrial mensal por seção/atividade | Brasil + 14 UFs × setor | Conjuntural — confirma tendência |
| **6903** | IPP | Índice de Preços ao Produtor (extrativas/transformação) | Brasil × setor | Proxy de pressão de custo |
| **1936** | Demografia das Empresas | Pessoal, idade média, salário, MEIs etc. por CNAE | UF × CNAE | Maturidade do tecido empresarial regional |
| **7171** | Pesquisa de Inovação (PINTEC) | Empresas com **inovações ambientais**, eletricidade e gás | Setor × atividade | **Diferenciador**: empresas que já estão na transição |

### Riqueza e contas

| # | Pesquisa | Por que |
|---|---|---|
| **5938** | PIB Municipal | Normaliza tudo; dá denominador pra "intensidade industrial" do município |
| **6784** | Contas Nacionais Anuais | PIB nacional, deflator — pra ajustes de série temporal |

### Agro e biomassa — **muito relevante pra biometano/SAF**

| # | Pesquisa | Conteúdo |
|---|---|---|
| **5457** | PAM | Área plantada/colhida, quantidade produzida, rendimento, valor — todos os cultivos por município (345k acessos no SIDRA — top 1) |
| **289** | PEVS | Quantidade e valor da extração vegetal e silvicultura por município (biomassa florestal) |
| **3939** | Pesquisa Pecuária Municipal | Efetivo dos rebanhos por tipo (alimenta `beef_tallow` SAFMaps) |
| **6846** | Censo Agropecuário | Estabelecimentos por tipologia, prática agrícola, biomas |

### Ambiental — **diretamente alinhada com nossa tese**

| # | Pesquisa | Conteúdo | Status |
|---|---|---|---|
| **8420** | Contas Econômicas Ambientais de Energia | **Produção dos produtos energéticos da biomassa** | Só nacional/região (sem município/UF) — usar pra calibragem macro |
| **7319** | Contas Econômicas Ambientais da Terra | Estoque por classe de cobertura/uso da terra | Cruza com MapBiomas/Terrabrasilis |
| **6905** | Contas Econômicas Ambientais da Água | Retirada/uso/consumo por atividade econômica | Risco hídrico industrial |
| **9625** | Contas de Espécies Ameaçadas | Espécies por risco × biomas | Sustentabilidade (uso opcional) |
| **8418** | Áreas urbanizadas | Áreas urbanizadas/loteamento por município | Pressão urbana |

### Demográfico (denominadores e contexto)

| # | Pesquisa | Conteúdo |
|---|---|---|
| **6579** | Estimativas de População | População atual estimada por município |
| **4709** | Censo Demográfico 2022 | Pop. residente, variação, taxa de crescimento |
| **6407** | PNAD Contínua anual | População por sexo/idade |
| **1364** | PNSB | Município com serviço de abastecimento de água (saneamento) |

## Camadas IBGE GeoServer prioritárias

Foco: tudo que serve de **layer de mapa** ou **chave geográfica** pro dataframe.

| Camada | Uso |
|---|---|
| `CGMAT:qg_2023_030_munic` | Polígonos dos municípios 2023 (atual) — **base do mapa** |
| `CGMAT:qg_2023_030_uf` | Polígonos UF |
| `CGMAT:pbqg22_15_MunicAmazoniaLegal` | Recorte Amazônia Legal (importante pra Powershoring vs. risco socioambiental) |
| `BDIA:vege_area`, `BDIA:vege_ponto` | Cobertura vegetal — risco de bioma |
| `BDIA:pedo_area` | Solos — aptidão agrícola |
| `BDIA:geom_area` | Geomorfologia |
| `BDIA:grade_ponto_1km_recalculados` | **Grid 1km com indicadores** — granularidade superior a município |
| `CGMAT:qg_2019_277_gradeestatistica1km_mar` | Grade estatística 1km (alternativa) |
| `ODS:*` | Indicadores ODS espacializados (vale fazer GetCapabilities filtrado) |

## Proposta de DataFrame mestre (município × features)

Granularidade base: **município brasileiro** (5.570 linhas). Chave primária: `cd_mun` (código IBGE 7 dígitos).

```
master_df.csv
└── cd_mun (PK)              ← chave IBGE 7 dígitos
    nome_municipio
    uf_sigla
    regiao
    ─── DEMOGRAFIA ─────────
    populacao_2022           (Tab 4709)
    populacao_estimada       (Tab 6579)
    densidade_demografica    (calculado)
    ─── ECONOMIA ──────────
    pib_total_2023           (Tab 5938)
    pib_per_capita
    va_industria             (Tab 5938 — VA setor industrial)
    va_servicos
    va_agropecuaria
    ─── INDÚSTRIA ─────────
    n_empresas_industria     (Tab 6449 CEMPRE × CNAE C)
    pessoal_ocupado_industria
    salario_medio_industria
    n_empresas_quimica       (Tab 6449 × CNAE C20)
    n_empresas_metalurgia    (Tab 6449 × CNAE C24)
    n_empresas_minerais_nm   (Tab 6449 × CNAE C23)
    n_empresas_papel         (Tab 6449 × CNAE C17)
    n_inovacoes_ambientais   (Tab 7171)
    ─── AGRO/BIOMASSA ────
    area_plantada_cana       (Tab 5457 PAM)
    producao_cana_t          (Tab 5457)
    producao_soja_t          (Tab 5457)
    producao_milho_t         (Tab 5457)
    producao_extracao_veg    (Tab 289 PEVS)
    rebanho_bovino           (Tab 3939)
    ─── AMBIENTAL ─────────
    uso_agua_industrial      (Tab 6905)
    cobertura_natural_pct    (BDIA + MapBiomas)
    risco_desmatamento       (Terrabrasilis derivado)
    ─── ENERGIA (já temos) ─
    capacidade_renovavel_mw  (ANEEL SIGA agregado)
    n_usinas_eolica
    n_usinas_solar
    n_usinas_hidro
    capacidade_biometano_m3d (ANP, agregada por município)
    producao_biometano_m3d   (ANP)
    biometano_ociosidade_pct (calculado)
    ─── INFRA ─────────────
    dist_porto_km            (calculado de ANTAQ + CGMAT)
    dist_gasoduto_km         (SAFMaps pipelines)
    dist_ferrovia_km         (SAFMaps railroads)
    dist_aeroporto_km        (SAFMaps airports)
    n_usinas_termo_proximas  (raio 50km)
    ─── INDÚSTRIA-ALVO ────
    flaring_total            (SAFMaps steel_plants — agregado por município)
    n_plantas_aco            (SAFMaps + Aço Brasil)
    n_plantas_quimica        (SAFMaps oilseed_plants)
    n_refinarias             (SAFMaps refineries_*)
    biomassa_disponivel_t    (SAFMaps bagasse + sugarcane + eucalyptus + UCO + tallow)
    ─── SOCIOAMBIENTAL ──
    mhdi_2010                (SAFMaps mhdi_2010)
    renda_media              (SAFMaps average_income)
    risco_trabalho_escravo   (SAFMaps slavery_likely_2022_2024)
    risco_trabalho_infantil  (SAFMaps child_labour_2020_2022)
    em_area_protegida_pct    (SAFMaps protected_areas_2025)
    em_bioma_restrito        (SAFMaps restricted_biomes)
```

**Total: ~50 features.** Tamanho estimado do CSV: 5.570 × 50 ≈ 280k células ≈ 5 MB. Trivial.

## Indicadores derivados (entram direto no score MCDA)

Estes são as features de alta-ordem calculadas a partir do dataframe — **viram colunas do score** que o usuário ajusta com sliders.

### Score energia limpa
```
score_energia = normalize(capacidade_renovavel_mw / pib_total)
              + 0.5 * normalize(n_usinas_eolica + n_usinas_solar)
```

### Score biomassa para biometano
```
score_biomassa = normalize(producao_cana_t * 0.4
                         + producao_soja_t * 0.2
                         + rebanho_bovino * 0.2
                         + producao_extracao_veg * 0.2)
```

### Score conectividade infra
```
score_infra = (1/dist_porto_km + 1/dist_gasoduto_km
             + 1/dist_ferrovia_km) — todos normalizados
```

### Score capacidade industrial existente (para retrofit/cluster)
```
score_industria = normalize(pessoal_ocupado_industria
                          + n_inovacoes_ambientais * 5)
```

### Score risco socioambiental (penaliza no score final)
```
score_risco = max(em_area_protegida_pct,
                  risco_trabalho_escravo,
                  risco_trabalho_infantil)
```

### Score oportunidade de matchmaking biometano-flaring
```
score_match_bio = (capacidade_biometano_m3d * biometano_ociosidade_pct)
                * exp(-dist_planta_industrial_km / 50)
```

### Score Powershoring (tese central E+)
```
score_powershoring = score_energia
                   * (1 - score_industria)   ← inverte: quero alta energia + baixa indústria
                   * (1 - score_risco)
                   * score_infra
```

> **Composição final do score MCDA** que o usuário do produto ajusta:
> ```
> score_total = w1·score_energia + w2·score_biomassa + w3·score_infra
>             + w4·score_industria + w5·score_match_bio + w6·score_powershoring
>             - w_risco·score_risco
> ```
> Sliders no front controlam `w1..w6, w_risco`. Default: pesos iguais.

## Ordem de carga sugerida (pra acelerar pipeline)

1. **`localidades/municipios`** (5570 linhas) — base do dataframe.
2. **CGMAT polígonos** — geometria pra mapa.
3. **Tab 5938 PIB Municipal** — denominador econômico.
4. **Tab 6579 Estimativa de População** — denominador demográfico.
5. **Tab 6449 CEMPRE × CNAE industrial** (C17, C20, C23, C24) — gap mais crítico.
6. **Tab 5457 PAM** — agro pra biometano (cana, soja, milho).
7. **SAFMaps WFS** das 10 camadas-chave (já documentado em `07_safmaps_integration.md`).
8. **Nossos CSVs ANEEL/ANP** já em `data/raw/` — agregar por município.
9. **Tab 7171 PINTEC inovação ambiental** — diferenciador.
10. **BDIA + MapBiomas** — camada ambiental.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| APISIDRA tem rate limit não documentado | Baixar 1 vez, salvar em `data/raw/ibge/`, processar offline |
| Algumas tabelas só vão até nível UF (ex.: 8420) | Usar como contexto macro; não tentar municipalizar |
| CEMPRE 6449 com CNAE detalhado tem **muitas linhas** | Filtrar só CNAE de seção "C" (indústria de transformação) e "B" (extrativa); usar `c12762` (CNAE 2.0) |
| Códigos de município variam por ano (2010 vs 2022) | Travar em 2022 (CGMAT 2022/2023) |
| PIB Municipal só tem até 2021/2022 | Aceitável — dado estrutural não muda muito ano a ano |
| PINTEC só sai a cada ~3 anos | Usar última edição (2017-2020) com ressalva |
| Encoding (acentos) em CSVs antigos | Sempre `encoding='utf-8'`, fallback `latin-1` |

## Snippets de carga

### Listar municípios

```python
import pandas as pd, requests
url = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
df_mun = pd.json_normalize(requests.get(url).json())
print(df_mun.shape)  # (5570, ...)
```

### Baixar tabela SIDRA (PIB municipal)

```python
import pandas as pd
url = "https://apisidra.ibge.gov.br/values/t/5938/n6/all/v/37/p/last"
df_pib = pd.read_json(url)
df_pib.columns = df_pib.iloc[0]
df_pib = df_pib.iloc[1:]
df_pib["pib_mil_reais"] = df_pib["Valor"].astype(float)
```

### Baixar polígonos municipais via GeoServer

```python
import geopandas as gpd
url = ("https://geoservicos.ibge.gov.br/geoserver/wfs"
       "?service=WFS&version=2.0.0&request=GetFeature"
       "&typeName=CGMAT:qg_2023_030_munic"
       "&outputFormat=application/json")
gdf = gpd.read_file(url)  # ~5570 polígonos
```

### CEMPRE por CNAE industrial (gabarito)

```python
url = ("https://apisidra.ibge.gov.br/values/t/6449"
       "/n6/all"           # nível município
       "/v/all"            # todas variáveis
       "/c12762/{secao}"   # CNAE 2.0 — secao = código da seção C (indústria)
       "/p/last")
```

> Códigos exatos de variável e classificação devem ser conferidos no Banco de Metadados (`https://apimetadados.ibge.gov.br/`) antes de baixar — algumas tabelas mudam estrutura.

## Próximos passos imediatos

1. **Criar `scripts/build_master_df.py`** que executa a ordem de carga acima e gera `data/processed/master_df.csv`.
2. **Validar codes CNAE** das seções/divisões prioritárias via APIMetadados.
3. **Decidir granularidade primária**: município (5.570 linhas, mais fácil) vs. grade 1km (>8M células, alta resolução, custo de computação maior). Recomendado **município pra MVP**, grade só se sobrar tempo.
4. **Cruzar IBGE com SAFMaps** — ambos têm dados ESG; consolidar (preferir SAFMaps pra slavery/child labour porque já vem agregado).
5. **Documentar cada tabela baixada** em `data/raw/ibge/<tabela>/README.md` com URL exata e data de download (auditabilidade pro júri).

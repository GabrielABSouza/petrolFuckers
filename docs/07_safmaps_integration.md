# Integração com SAFMaps — fonte estratégica via GeoServer público

> **Descoberta em 09/mai/2026.** Acesso programático completo a 72 camadas geoespaciais sobre o ecossistema SAF brasileiro, **sem autenticação**, via WFS padrão (GeoServer).

## O que é SAFMaps

Portal brasileiro sobre cadeias de produção de **Sustainable Aviation Fuel** (SAF). Resultado de parceria entre **UNICAMP, Agroicone, Geomeridium, RSB, Embraer e Boeing**. Foco: **mapear feedstocks brasileiros** e infraestrutura associada.

- Site institucional: https://safmaps.com/
- App interativa: https://app.safmaps.com/ (Leaflet sobre CloudFront/S3)
- Backend de dados: **https://geoserver.safmaps.com/geoserver/** (GeoServer público)

## Endpoint confirmado

```
https://geoserver.safmaps.com/geoserver/wfs
  ?service=WFS
  &version=2.0.0
  &request=GetFeature
  &typeName=DBMS:<nome_da_camada>
  &outputFormat=application/json
```

Validado: HTTP 200, GeoJSON limpo, CRS `EPSG:4326` (WGS84). Sem auth, sem rate limit observado.

## Schema validado — `steel_plants` (12 features)

Cada planta siderúrgica vem com:

| Campo | Tipo | Significado |
|---|---|---|
| `Company` | string | Empresa (ArcelorMittal, Gerdau, Usiminas, CSN, Ternium, CSP, Vallourec, etc.) |
| `City` | string | Município |
| `State` | string (UF) | Estado |
| `In_use` | float | Volume de gás efetivamente utilizado |
| `Use_perc` | float (0–100) | % do gás total que é usado |
| `Flaring` | float | **Volume de gás queimado em flaring (desperdiçado)** |
| `Lost_perc` | float (0–100) | % do gás total perdido em flaring |
| `Total_gas` | float | Gás total disponível na planta |
| `LAT`, `LONG` | float | Coordenadas (também em `geometry`) |

### Por que isso muda nossa estratégia

`Flaring` é o gás natural que está sendo **literalmente queimado e desperdiçado** na siderurgia. Cruzar isso com a capacidade ociosa de biometano (51% nacional, ANP) cria um produto direto:

> **Caminho A (matchmaking) reforçado:** identificar plantas siderúrgicas com alto flaring (gás desperdiçado) E plantas de biometano subutilizadas a <50km. Substituir gás fóssil flaring por biometano = redução real de emissões + economia.

**Top targets identificados na primeira amostra:**
- **ArcelorMittal Tubarão (ES)**: 685 unidades de gás total, 27% perdido (~186 unidades de flaring)
- **Usiminas Cubatão (SP)**: 197 unidades, **100% perdido**
- **CSN Volta Redonda (RJ)**: 414 unidades, 30% perdido (~122)
- **7 plantas em MG (Vale do Aço)**: várias com 100% flaring

## As 10 camadas mais valiosas (de 72)

### Indústria e energia

| Camada | Granularidade | Valor agregado |
|---|---|---|
| `DBMS:steel_plants` | Planta × ponto | Coords + flaring (gás desperdiçado) — **gap nosso resolvido** |
| `DBMS:airports` | Aeroporto × ponto | Demandantes potenciais de SAF |
| `DBMS:airports_fd_stock` | Idem | "fd_stock" = forecast/projeção de demanda |
| `DBMS:refineries_capacity` | Refinaria × ponto | Capacidade de refino existente |
| `DBMS:refineries_qav` | Refinaria × ponto | Produção de QAV (Querosene de Aviação) |
| `DBMS:flaring` | Polígono/ponto | Mapa direto de queima de gás |
| `DBMS:pipelines` | Linha | Gasodutos (complementa nosso ANEEL SIGET) |
| `DBMS:ethanol_pipelines_terminals` | Terminal × ponto | Cadeia logística etanol |

### Biomassa (camada 100% nova pra nós)

| Camada | Significado |
|---|---|
| `DBMS:bagasse_potential_availability_agroicone` | Bagaço de cana — feedstock pra biometano |
| `DBMS:eucalyptus_residue_agroicone` | Resíduo de eucalipto |
| `DBMS:straw_potential_availability` | Palha agrícola |
| `DBMS:sugarcane_residues_agroicone` | Resíduos de cana |
| `DBMS:uco_potential_availability_agroicone` | UCO (óleo usado de cozinha) |
| `DBMS:beef_tallow_potential_agroicone` | Sebo bovino |

> Antes só tínhamos PEVS/PAM por município. SAFMaps já entrega **potencial de biomassa por região**, calculado por Agroicone (referência no setor).

### Socioambiental — diferenciador ESG raríssimo ⭐

| Camada | Por que importa |
|---|---|
| `DBMS:protected_areas_2025` | Áreas protegidas → flag de risco de licenciamento |
| `DBMS:restricted_biomes` | Biomas sensíveis (Cerrado, Amazônia, etc.) |
| `DBMS:areas_no_go` | Áreas declaradas inviáveis |
| `DBMS:slavery_likely_2020_2022`, `slavery_likely_2022_2024` | **Indicador de probabilidade de trabalho escravo** — ESG hardcore |
| `DBMS:child_labour_2020_2022` | Trabalho infantil |
| `DBMS:child_malnutrition_2025` | Desnutrição infantil |
| `DBMS:mhdi_2010` | IDH-M municipal |
| `DBMS:average_income` | Renda média |

> Ataca direto o **Consenso de Belém** (transição justa) — narrativa que nenhum concorrente vai ter no pitch.

### Logística

| Camada | Significado |
|---|---|
| `DBMS:roads`, `DBMS:main_roads` | Rodovias |
| `DBMS:railroads`, `DBMS:railroads_fd_stock` | Ferrovias + projeção |
| `DBMS:waterways`, `DBMS:waterways_fd_stock` | Hidrovias + projeção |
| `DBMS:pipelines_fd_stock` | Gasodutos planejados |
| `DBMS:hidrografia`, `DBMS:rios_ana_2013` | Rede hídrica |

### Buffers de exemplo (replicáveis)

| Camada | Significado |
|---|---|
| `DBMS:espigao_buffer_50km` | Buffer 50km da Refinaria Espigão (PR) |
| `DBMS:revap_buffer_50km` | Buffer 50km da REVAP (S.J. dos Campos/SP) |

> SAFMaps já demonstra a metodologia de buffer 50km para análise de proximidade. Replicar pra plantas siderúrgicas vira nosso "matchmaking biometano".

## Lista completa das 72 camadas

<details>
<summary>Expandir lista completa</summary>

```
DBMS:abatedouro_lapig_2019            DBMS:land_rights
DBMS:abatedouros                       DBMS:land_use_rights
DBMS:air_quality_monitoring            DBMS:land_use_rights_2022_2023_2024
DBMS:airports                          DBMS:main_roads
DBMS:airports_fd_stock                 DBMS:mhdi_2010
DBMS:areas_no_go                       DBMS:municipios_relevantes_shp
DBMS:average_income                    DBMS:oilseed_plants
DBMS:bagasse_potential_availability_agroicone   DBMS:oilseed_plants_fd_stock
DBMS:beef_tallow                       DBMS:pipelines
DBMS:beef_tallow_potential_agroicone   DBMS:pipelines_fd_stock
DBMS:biomas                            DBMS:protected_areas_2025
DBMS:child_labour_2020_2022            DBMS:railroads
DBMS:child_malnutrition                DBMS:railroads_fd_stock
DBMS:child_malnutrition_2025           DBMS:refinarias_QAV_production
DBMS:espigao_buffer_50km               DBMS:refinarias_oil_refining
DBMS:estados_relevantes                DBMS:refinarias_refining_capacity
DBMS:ethanol_anhydrous                 DBMS:refineries_capacity
DBMS:ethanol_anhydrous_output          DBMS:refineries_qav
DBMS:ethanol_feedstock                 DBMS:refineries_refining
DBMS:ethanol_hydrated                  DBMS:refineries_refining_fd_stock
DBMS:ethanol_hydrated_output           DBMS:restricted_biomes
DBMS:ethanol_milling                   DBMS:revap_buffer_50km
DBMS:ethanol_output                    DBMS:rios_ana_2013
DBMS:ethanol_output_fd_stock           DBMS:roads
DBMS:ethanol_pipelines                 DBMS:slavery_likely_2020_2022
DBMS:ethanol_pipelines_fd_stock        DBMS:slavery_likely_2022_2024
DBMS:ethanol_pipelines_terminals       DBMS:steel_plants
DBMS:ethanol_pipelines_terminals_fd_stock   DBMS:straw_potential_availability
DBMS:eucalyptus_residue_agroicone      DBMS:sugarcane_residues_agroicone
DBMS:flaring                           DBMS:uco_potential_availability_agroicone
DBMS:frigorificos_lapig_2019           DBMS:water_monitoring_stations2020
DBMS:hidrografia                       DBMS:water_monitoring_stations_groundwater_2024
                                       DBMS:water_monitoring_stations_quality_2024
                                       DBMS:water_monitoring_stations_streamflow_2025
                                       DBMS:water_quality_index_2019_2020
                                       DBMS:water_rights
                                       DBMS:water_use_rights
                                       DBMS:water_use_rights_2022_2024
                                       DBMS:waterways
                                       DBMS:waterways_fd_stock
```

</details>

> Cache local do GetCapabilities completo: `references/safmaps_wfs_getcapabilities.xml` (não versionado — gerar com `curl -s "https://geoserver.safmaps.com/geoserver/wfs?service=WFS&request=GetCapabilities&version=2.0.0" -o references/safmaps_wfs_getcapabilities.xml`).

## Como baixar uma camada (snippet)

### Python (pandas + geopandas)

```python
import geopandas as gpd

URL = (
    "https://geoserver.safmaps.com/geoserver/wfs"
    "?service=WFS&version=2.0.0&request=GetFeature"
    "&typeName=DBMS:{layer}"
    "&outputFormat=application/json"
)

# Plantas siderúrgicas com flaring
steel = gpd.read_file(URL.format(layer="steel_plants"))
print(steel[["Company", "City", "Total_gas", "Flaring", "Lost_perc"]])

# Bagaço de cana — feedstock biometano
bagasse = gpd.read_file(URL.format(layer="bagasse_potential_availability_agroicone"))
```

### curl + jq (validação rápida)

```bash
curl -s "https://geoserver.safmaps.com/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=DBMS:steel_plants&outputFormat=application/json" \
  | jq '.features[].properties | {Company, City, Total_gas, Flaring}'
```

### CRS e formato alternativos

- `srsName=EPSG:4326` (default)
- `outputFormat=GML2|application/x-gpkg|csv|shape-zip` (alternativas)
- `maxFeatures=N` para sample inicial
- `cql_filter=Lost_perc>50` para filtros server-side (CQL, OGC Filter Encoding)

## Implicação pros 3 caminhos do `06_eda_insights.md`

| Caminho | Antes | Depois (com SAFMaps) |
|---|---|---|
| **A. Matchmaking biometano-indústria** | Cruzava ANP (19 plantas biometano) com nome-de-município das siderúrgicas (Atlas) | **Cruza com `steel_plants` georreferenciadas + flaring quantificado** — pitch direto: "essa siderúrgica desperdiça X em flaring; tem biometano subutilizado a Y km" |
| **B. Score de localização H₂/SAF** | Score baseado em ANEEL + Atlas qualitativo | **Score baseado em ecossistema SAF inteiro** (feedstock → milling → pipelines → refineries QAV → airports), com camada socioambiental embutida |
| **C. Mismatch + radar socioambiental** | Risco era hipótese (sem dado) | **Camadas reais** de slavery_likely, child_labour, mhdi, áreas protegidas — diferenciador ESG defensável |

## Riscos e ressalvas

1. **Não há SLA formal.** GeoServer público pode cair sem aviso. Mitigação: **baixar e versionar** as 10 camadas-chave em `data/raw/safmaps/` no início da maratona (resiliência).
2. **Licença não declarada.** Site não tem termos de uso visíveis. Para uso em hackathon (cultural, não-comercial — §10.13 do regulamento) deve estar coberto, mas creditar UNICAMP/Agroicone/Embraer/Boeing/RSB no pitch é educado e seguro.
3. **Schemas variam por camada.** Validamos só `steel_plants`. Outras camadas precisam ser inspecionadas individualmente — usar `DescribeFeatureType` ou amostragem.
4. **Acentos vêm como mojibake** (`TimÃ³teo` em vez de `Timóteo`). Pequeno problema de encoding no GeoServer; corrigir no front com normalização UTF-8.

## Próximos passos sugeridos

1. **Versionar amostras** em `data/raw/safmaps/` (10 camadas-chave, ~poucos MB).
2. **Script `scripts/fetch_safmaps.py`** que automatiza download de qualquer camada por nome.
3. **Atualizar `04_escopo_estrategia.md`** decisão #5 — incluir camadas SAFMaps na composição do score multicritério.
4. **Inspecionar o app via DevTools** (network tab) durante uma sessão real pra capturar **filtros `cql_filter` ou WMS styles** úteis que o SAFMaps já usa.

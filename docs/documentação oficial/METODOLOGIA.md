# Metodologia

## Hackathon E+ — Transição Energética 2026

## Base de Dados

Nosso time utilizou as bases de dados disponibilizadas pela organização, compostas por arquivos CSV distribuídos em três fontes oficiais: ANP (Agência Nacional do Petróleo, Gás Natural e Biocombustíveis), ANEEL (Agência Nacional de Energia Elétrica) e IBGE (Instituto Brasileiro de Geografia e Estatística).

## Pré-processamento

Em todos esses dados, realizamos um pré-tratamento para padronizar nomes de municípios, remover caracteres especiais e evitar erros tipográficos que pudessem comprometer a concatenação entre as bases.

Uma vez concluída essa etapa, estabelecemos a base principal denominada `core_df`, contendo cada município e suas coordenadas geográficas (latitude e longitude). O resultado foi um índice de 1.938 municípios únicos, com coordenadas obtidas pela média das coordenadas de todos os empreendimentos registrados em cada localidade.

## Variáveis Temáticas

Para construir os scores de energia indicados para cada município, optamos por organizar o conjunto de variáveis em três blocos temáticos, buscando explorar o potencial de cada município em relação às cinco fontes de energia avaliadas: solar, eólica, biometano, hidrogênio verde e biomassa.

### Econômico

Reúne variáveis de capacidade e infraestrutura de geração, como potência instalada, capacidade ociosa, participação de fontes renováveis, capacidade de biometano e infraestrutura de transmissão (`eco_mw_instalado`, `eco_mw_ocioso`, `eco_share_renovavel`, `eco_bio_capacidade_m3d`, `eco_n_linhas_transmissao`, `eco_capacidade_subestacao_mva`). Ver [Apêndice A](#apêndice-a--dicionário-de-variáveis) para descrição completa.

### Social

Captura a maturidade do ecossistema energético local, por meio da diversidade de fontes presentes e do número de plantas em operação (`soc_diversidade_fontes`, `soc_n_plantas_operacionais`). Ver [Apêndice A](#apêndice-a--dicionário-de-variáveis).

### Ambiental

Mensura o impacto climático e o potencial de expansão da rede, incluindo o CO₂ evitado anualmente, os projetos de transmissão planejados e a produção de biometano por estado (`env_co2_evitado_t_ano`, `env_n_projetos_transmissao`, `env_bio_producao_m3`). Ver [Apêndice A](#apêndice-a--dicionário-de-variáveis).

## Metodologia

Escolhemos o Modelo de Análise de Decisão Multi-Critério (MCDA) para construir os scores que avaliam qual a melhor fonte de energia aplicável a cada município. Esse método consiste em normalizar as variáveis do nosso conjunto de dados e tomar uma decisão baseada não em um único fator — como o econômico, por exemplo — mas em múltiplos fatores relevantes para um tomador de decisão, contemplando as três dimensões macro adotadas: econômica, social e ambiental.

### Normalização min-max

Antes do cálculo dos scores, cada variável é normalizada globalmente para o intervalo `[0, 1]` usando a transformação min-max:

```text
v_norm = (v - min) / (max - min)
```

Essa etapa é essencial para garantir que variáveis em escalas muito diferentes — como potência instalada (em kW, podendo chegar a milhões) e participação de renováveis (entre 0 e 1) — contribuam de forma equilibrada para o score final, sem que uma domine as demais apenas por ter valores numericamente maiores.

Dois casos especiais são tratados: quando uma variável é constante em todos os municípios (`max = min`), todos os valores recebem `0,5`, evitando divisão por zero. Valores ausentes (`NaN`) são substituídos por `0` antes da normalização, interpretando a ausência de dado como ausência da característica.

#### Exemplo prático

Considere a variável `eco_mw_instalado` (potência instalada). Suponha que o município com menor capacidade do país tenha 500 kW e o maior tenha 10.000.000 kW. Um município com 2.000.000 kW receberia:

```text
v_norm = (2.000.000 - 500) / (10.000.000 - 500) ≈ 0,20
```

Ou seja, esse município ficaria com score `0,20` nessa variável — mesmo com 2 GW instalados, porque existem municípios com capacidade muito superior. Isso mostra como a normalização posiciona cada município relativamente ao universo completo, não em termos absolutos.

### Cálculo do score composto

Para cada par `(município × fonte)`, calcula-se primeiro a média aritmética das variáveis normalizadas dentro de cada bloco temático, obtendo três sub-scores parciais: `eco_score`, `soc_score` e `env_score`. Em seguida, os três blocos são combinados em uma média ponderada:

```text
score = 0,40 × eco_score + 0,30 × soc_score + 0,30 × env_score
```

| Bloco | Peso | Justificativa |
|---|---:|---|
| Econômico | 40% | Infraestrutura e capacidade instalada são os determinantes primários de viabilidade. Sem geração e transmissão adequadas, os ganhos sociais e ambientais não se sustentam. |
| Social | 30% | Diversidade de fontes e plantas em operação refletem a maturidade do ecossistema energético local. |
| Ambiental | 30% | CO₂ evitado e expansão da rede sinalizam impacto climático e potencial de crescimento futuro. |

O resultado é um valor entre 0 e 1 para cada par `(município × fonte)`. Quanto mais próximo de 1, mais favorável é aquele município para receber investimentos naquela fonte de energia.

### Ranking final

Dentro de cada município, as cinco fontes são rankeadas em ordem decrescente de score (método `dense rank`). O DataFrame `best_df` retém apenas os pares com `rank = 1`, indicando a fonte de energia com maior potencial em cada município. O DataFrame `ranking_df` preserva o ranking completo (`ranks 1–5`) por município.

## Perfil das fontes por dimensão

Comportamento de `eco_score`, `soc_score` e `env_score` por fonte — como as variáveis macro determinam a seleção final no modelo MCDA.

### Solar

Maior representatividade no dataset. Domina pelo `eco_score` alto e `env_score` razoável, `soc_score` estruturalmente baixo. Prevalece em MG, RS e BA com boa irradiação e infraestrutura de transmissão.

**Drivers:** `eco_mw_instalado`, `eco_share_renovavel`.

**Perfil:** ECO Alto · SOC Baixo · ENV Moderado · SCORE 0.43–0.61

### H₂ Verde

Selecionado próximo a grandes hidrelétricas (Altamira/PA, Porto Velho/RO). `eco_score` muito alto via `eco_capacidade_subestacao_mva` compensa `soc_score` baixo.

**Driver:** eletricidade renovável barata para eletrólise.

**Perfil:** ECO Muito alto · SOC Baixo · ENV Médio · SCORE 0.42–0.61

### Biomassa

Fonte residual: vence quando nenhuma outra se destaca. Eco e soc próximos de zero, `env_score` fixo em ~0.25. Predomina no AM, AC, RR e Nordeste, onde há resíduos orgânicos mas pouca infraestrutura.

**Perfil:** ECO Baixo · SOC Baixo · ENV ~0.25 · SCORE 0.08–0.20

### Eólica

Ocorrência pontual (Buritizeiro/MG). Perfil equilibrado nas três dimensões; só vence onde `eco_mw_ocioso` e `eco_mw_instalado` superam o benefício competitivo da solar. Recurso eólico subrepresentado nas variáveis atuais.

**Perfil:** ECO Moderado · SOC Moderado · ENV Moderado · SCORE ~0.45

### Biometano

Perfil idêntico à Biomassa; surge nos mesmos municípios de SE. Alternativa quando `eco_bio_capacidade_m3d` e `eco_bio_ociosidade` são favoráveis. Coexistência com Biomassa indica empate técnico (múltiplos `rank = 1`).

**Perfil:** ECO Baixo · SOC Baixo · ENV ~0.25 · SCORE ~0.08

> Valores de score referem-se às médias em `score_per_set_variable.csv` (`rank = 1`, 1.893 pares município × fonte). Hackathon E+ — Transição Energética 2026.

# Apêndices

## Apêndice A — Dicionário de Variáveis

Descrição completa de todas as variáveis construídas, organizadas por bloco temático.

### A.1 — Bloco Econômico (`eco_`)

| Variável | Fonte | Unidade | Descrição |
|---|---|---|---|
| `eco_mw_instalado` | SIGA | kW | Soma da potência fiscalizada por município |
| `eco_mw_outorgado` | SIGA | kW | Soma da potência outorgada por município |
| `eco_mw_ocioso` | SIGA | kW | `max(0, outorgado - instalado)` |
| `eco_n_plantas` | SIGA | unid. | Contagem total de empreendimentos |
| `eco_share_renovavel` | SIGA | [0–1] | MW renovável / MW instalado total |
| `eco_bio_capacidade_m3d` | ANP | m³/dia | Capacidade autorizada de biometano |
| `eco_bio_processado_m3d` | ANP | m³/dia | Volume de biogás processado |
| `eco_bio_n_plantas` | ANP | unid. | Número de plantas de biometano ativas |
| `eco_bio_ociosidade` | ANP | [0–1] | `1 - (processado / capacidade)` |
| `eco_n_linhas_transmissao` | SIGET | unid. | Linhas de transmissão distintas por UF |
| `eco_tensao_media_kv` | SIGET | kV | Tensão média das linhas por UF |
| `eco_capacidade_subestacao_mva` | SIGET | MVA | Potência ativa total das subestações por UF |

### A.2 — Bloco Social (`soc_`)

| Variável | Fonte | Unidade | Descrição |
|---|---|---|---|
| `soc_diversidade_fontes` | SIGA | unid. | Número de tipos distintos de geração no município |
| `soc_n_plantas_operacionais` | SIGA | unid. | Número de plantas em fase Operação |

### A.3 — Bloco Ambiental (`env_`)

| Variável | Fonte | Unidade | Descrição |
|---|---|---|---|
| `env_co2_evitado_t_ano` | SIGA | t/ano | MW renovável × 8.760 h × 0,06 tCO₂/MWh (fator SIN EPE 2023) |
| `env_n_projetos_transmissao` | SIGET | unid. | Obras de transmissão planejadas por UF |
| `env_bio_producao_m3` | ANP | m³ | Produção acumulada de biometano por UF |

## Apêndice B — Variáveis por Fonte de Energia

Cada fonte utiliza um subconjunto de variáveis selecionadas por relevância temática. O prefixo `eco_` foi omitido na tabela para brevidade.

| Fonte | Econômico (`eco_`) | Social (`soc_`) | Ambiental (`env_`) |
|---|---|---|---|
| Solar | `mw_instalado`<br>`share_renovavel`<br>`n_linhas_transmissao` | `diversidade_fontes`<br>`n_plantas_operacionais` | `co2_evitado_t_ano`<br>`n_projetos_transmissao` |
| Eólica | `mw_instalado`<br>`mw_ocioso`<br>`n_linhas_transmissao` | `diversidade_fontes`<br>`n_plantas_operacionais` | `co2_evitado_t_ano`<br>`n_projetos_transmissao` |
| Biometano | `bio_capacidade_m3d`<br>`bio_ociosidade`<br>`n_linhas_transmissao` | `diversidade_fontes`<br>`n_plantas_operacionais` | `co2_evitado_t_ano`<br>`bio_producao_m3` |
| H₂ Verde | `mw_instalado`<br>`share_renovavel`<br>`capacidade_subestacao_mva` | `diversidade_fontes`<br>`n_plantas_operacionais` | `co2_evitado_t_ano`<br>`n_projetos_transmissao` |
| Biomassa | `mw_instalado`<br>`n_linhas_transmissao`<br>`capacidade_subestacao_mva` | `diversidade_fontes`<br>`n_plantas_operacionais` | `co2_evitado_t_ano`<br>`bio_producao_m3` |

## Apêndice C — Arquivos de Saída

Arquivos CSV gerados ao final do pipeline e salvos em `data/processed/`.

| Arquivo | Linhas | Descrição |
|---|---:|---|
| `score_df.csv` | 1.938 | Dataset descritivo com todas as variáveis por município |
| `best_energy_ranking.csv` | 9.690 | Todas as 5 fontes × município com rank 1–5 (`ranking_df`) |
| `score_per_set_variable.csv` | 1.938 | Apenas o par município × fonte de rank 1 (`best_df`) |
| `descriptive_dataset.csv` | 1.938 | Cópia do `score_df` para análises exploratórias |

---

Hackathon E+ Transição Energética 2026
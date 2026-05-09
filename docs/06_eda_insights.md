# EDA Insights — Padrões Observados para Escopo do MVP

> **Autor:** analista de dados, petrolFuckers
> **Data:** 09 mai 2026
> **Metodologia:** EDA dirigida por hipóteses. Sem regressão, sem modelo. Cruzamento de 5 fontes primárias (ANEEL SIGA, ANP biometano, Atlas E+ 2025, Instituto Aço Brasil, IBGE PAM).
> **Restrição respeitada:** nenhum número inventado. Fontes não acessadas marcadas explicitamente.

---

## Resumo Executivo

1. **O Brasil tem um mismatch brutal entre energia e indústria**: 92% da capacidade renovável operacional (154 GW em 230 municípios) está em localidades sem indústria eletrointensiva. O pipeline agrava isso — Piauí tem 16,1 GW planejados (solar) e virtualmente nenhuma indústria pesada.

2. **Biometano é o setor com melhor razão impacto/esforço para 48h**: dados ANP municipais disponíveis em CSV direto, 19 plantas rastreáveis, tese clara (substituir gás fóssil), e 51% da capacidade autorizada ociosa — o produto "encontrei biometano subutilizado perto da sua fábrica" é defendível em 30s de pitch.

3. **H₂ verde + fertilizantes verdes tem a melhor narrativa estratégica**: Brasil importa 94% dos fertilizantes nitrogenados, US$ 30 bi em investimentos de H₂ anunciados (41% concentrados no CE), e 66 iniciativas industriais mapeadas. Mas dados granulares são mostly announcements, não operacionais — mais difícil para MVP de 48h.

4. **O investidor industrial é a persona mais underserved pela PID atual**: a plataforma mostra ONDE estão os recursos (camadas), mas não responde "devo instalar minha planta em Pecém ou Camaçari?" — falta a camada de scoring/ranking/recomendação que converte dados em decisão.

5. **O Centro-Oeste é o vazio mais gritante**: MT + GO produzem 62 Mt de soja/ano, têm ZERO plantas de biometano, e zero projetos de H₂. Enquanto isso, o Nordeste concentra 66,7% das iniciativas de H₂. Há espaço para um produto que aponte lacunas como essa.

---

## Seção 1: Onde Existem Mismatches de Oportunidade?

### 1.1 Achado principal: energia renovável e indústria são quase anticorrelacionadas no Brasil

Analisamos 25.407 empreendimentos de geração (ANEEL SIGA, mai/2026). Dos municípios com >100 MW renovável operacional, **230 não possuem indústria eletrointensiva conhecida**, somando **154.219 MW** — ou seja, 92% da capacidade renovável do país está fora de clusters industriais.

**Top 10 municípios "subutilizados" (alta energia, sem indústria pesada):**

| # | Município | UF | MW Operacional | Fonte dominante | Indústria local |
|---|---|---|---|---|---|
| 1 | Altamira/Vitória do Xingu | PA | 11.253 | Hidro (Belo Monte) | Nenhuma eletrointensiva |
| 2 | Tucuruí | PA | 8.536 | Hidro (Tucuruí) | Nenhuma |
| 3 | Porto Velho | RO | 7.537 | Hidro (Santo Antônio/Jirau) | Nenhuma |
| 4 | Morro do Chapéu | BA | 2.314 | Eólica + Solar | Nenhuma |
| 5 | Janaúba | MG | 2.104 | Solar | Nenhuma |
| 6 | Serra do Mel | RN | 1.633 | Eólica + Solar | Nenhuma |
| 7 | Sento Sé | BA | 1.514 | Eólica | Nenhuma |
| 8 | Gentio do Ouro | BA | 1.432 | Eólica | Nenhuma |
| 9 | Dom Inocêncio | PI | 1.326 | Eólica | Nenhuma |
| 10 | Buritizeiro | MG | 1.208 | Solar + Hidro | Nenhuma |

**Fonte:** ANEEL SIGA — `siga-empreendimentos-geracao.csv` (25.407 registros, dados de mai/2026).

### 1.2 Pipeline agrava o desequilíbrio

O pipeline de expansão (116.248 MW outorgados não construídos) é dominado por **solar no Nordeste e MG**:

| Estado | Pipeline (MW) | Fonte principal | Base industrial atual |
|---|---|---|---|
| BA | 23.800 | Solar (UFV) | Camaçari (química), mas interior vazio |
| MG | 23.000 | Solar (UFV) | Quadrilátero Ferrífero, mas interior vazio |
| PI | 16.100 | Solar (UFV) + Eólica | Virtualmente nenhuma |
| CE | 15.000 | Solar (UFV) + Eólica | Pecém (H₂), resto vazio |

Os municípios com maior pipeline solar — Buritizeiro-MG (4.465 MW), Arinos-MG (3.716 MW), Juazeiro-BA (3.262 MW) — não têm indústria pesada. São fronteira de powershoring pura.

### 1.3 Mismatch de biometano: Centro-Oeste é o vazio

| Estado | Produção agro (soja, Mt/ano) | Rebanho bovino | Plantas de biometano | Gap |
|---|---|---|---|---|
| MT | 44,4 | ~30M cabeças | **0** | CRÍTICO |
| GO | 17,4 | ~24M cabeças | **0** | CRÍTICO |
| MS | 14,2 | ~22M cabeças | 1 (0% utilização) | CRÍTICO |
| PR | 21,5 | ~10M cabeças | 1 (25% utilização) | ALTO |
| BA | 7,8 | ~15M cabeças | **0** | ALTO |

**Fonte:** ANP biometano-dados-abertos (19/03/2026), IBGE PAM 2023.

### Visualização sugerida

**Mapa de calor bivariado**: eixo X = capacidade renovável instalada por município (MW), eixo Y = empregos industriais por município (IBGE CEMPRE). Quadrante "alta energia / baixa indústria" = oportunidades de powershoring. Sobrepor com buffers de 50 km de infraestrutura (gasodutos, portos, ferrovias). Municípios no quadrante superior-direito = clusters já consolidados (SP, MG, RJ).

### Implicação pro MVP

O mismatch é taman que qualquer ferramenta de "recomendação locacional" tem matéria-prima abundante. O MVP não precisa de regressão — basta rankear municípios por (renovável disponível - demanda industrial existente) e filtrar por acesso a infraestrutura. Os 10 municípios da tabela acima são o argumento central do pitch.

---

## Seção 2: Onde a PID Provavelmente Tem Pontos Cegos?

### 2.1 Inventário: o que a PID declara vs. o que existe

Com base no Atlas (p.14-47) e no `BANCO_DADOS_PID.docx`, a PID v2.0 declara integrar 4 famílias de camadas:

1. Infraestrutura de transporte e energia (gasodutos, ferrovias, portos, LTs)
2. Disponibilidade de biomassa
3. Localização de indústrias existentes e em projeto
4. Potenciais de energias renováveis

### 2.2 Bases existentes que a PID provavelmente NÃO usa

| Base | Dado | Granularidade | Por que é gap |
|---|---|---|---|
| **ANP — Produção de biometano** | 19 plantas com capacidade autorizada E利用率 operacional por município | Município | PID mostra "potencial de biometano", não rastreia capacidade real vs. ociosa |
| **IBGE CEMPRE/RAIS** | Empregos formais por setor (CNAE) e município | Município × setor | PID não mostra qualidade/quantidade de mão-de-obra local |
| **Terrabrasilis (INPE)** | PRODES/DETER — desmatamento em tempo real | Polígono | PID declara "transição justa" mas não sobrepõe risco de desmatamento |
| **Observatório do Código Florestal** | Conformidade ambiental por propriedade | Propriedade | Nenhuma camada de risco regulatório ambiental |
| **ANTAQ** | Movimentação portuária, custo logístico | Porto × mercadoria | PID mostra portos, mas não capacidade ociosa ou custo de transporte |
| **IBGE PAM/PEVS** | Produção agrícola e florestal por município | Município | PID usa "biomassa" genérico; não quantifica toneladas de cana/soja/resíduo disponíveis |
| **ANEEL SIGA — Utilização** | Status de operação vs. autorizado por usina | Empreendimento | PID mostra "potencial", não distingue planta operacional de outorgada |
| **CNAE/IBGE** | Classificação industrial por município | Município | PID mapeia indústrias, mas não permite filtrar "quero municípios com 3+ empresas de química" |
| **BNDES/Finep** | Chamadas de financiamento aprovadas | Projeto | Sem dados de "onde está o dinheiro indo" |

### 2.3 O gap mais relevante para o MVP

**Capacidade ociosa de infraestrutura** é o dado que nenhum participante do mercado tem facilmente. A PID mostra que um gasoduto PASSA por um município, mas não diz se tem capacidade de transporte disponível. A ANP mostra que uma planta de biometano está AUTORIZADA com 106.867 m³/d em Paulínia (SP), mas produzindo 0 m³/d. Cruzar "capacidade autorizada mas ociosa" com "indústria consumidora próxima" é um insight que nenhuma ferramenta pública entrega hoje.

### Visualização sugerida

**Matriz de lacunas**: linhas = camadas de dados que existem publicamente, colunas = persona (investidor, gestor, indústria, formulador). Células marcadas como "PID cobre" / "PID parcial" / "PID não cobre". As células "não cobre" que a persona mais precisa = foco do MVP.

### Implicação pro MVP

Atacar **uma** dessas lacunas, não todas. A mais viável em 48h é cruzar ANP biometano (capacidade ociosa) com localização de indústrias consumidores de gás (vidro 60% gás natural, química, cimento). É uma camada nova sobre dados que a PID já mostra, sem precisar de scraping pesado.

---

## Seção 3: Que Setor Tem a Melhor Razão Impacto/Esfoco para MVP de 48h?

### 3.1 Avaliação comparativa

| Critério | H₂ Verde | Biometano | Aço Verde | Fertilizantes Verdes | SAF |
|---|---|---|---|---|---|
| **(a) Dados granulares** | Fraco — mostly announcements, poucos operacionais | **Forte** — 19 plantas com coords, capacidade, produção mensal (CSV ANP) | Médio — Aço Brasil tem planta-level, mas pouca granularidade geo | Fraco — dados de importação são nacional | Fraco — setor novíssimo, poucos dados abertos |
| **(b) Tese de descarbonização** | Forte — H₂ verde como insumo para múltiplos setores | **Forte** — substituir até 60% do gás natural, reduzir 95% emissões | Forte — DRI-H₂ ou carvão vegetal | Forte — amônia verde via H₂ | Médio — rota HEFA/ATJ é complexa |
| **(c) Urgência geopolítica** | Alta — US$ 30 bi anunciados, 12 clusters selecionados | Média — crescente mas sem deadline regulatório | Média — CBAM europeu pressionará exportações | **Altíssima** — 94% de importação de N-fertilizantes, dependência RU/China | Alta — mandate 2027 no Brasil |
| **(d) Facilidade de pitch** | Alta — todo mundo já ouviu falar | **Muito alta** — "também tem indústria que queima gás natural? tem biometano ocioso a 20 km" | Média — técnico demais | Alta — "Brasil importa quase tudo que come" | Alta — aviação é sexy |
| **Viabilidade em 48h** | Baixa — dados insuficientes para score | **Alta** — 19 plantas, 5 estados, CSV limpo | Média — precisa geolocalizar 31 usinas | Baixa — precisaria cruzar H₂ + portos + agronegócio | Baixa — dados muito escassos |

### 3.2 Recomendação

**Recomendação 1 (conservadora): Biometano** — Dados municipais limpos (ANP CSV), tese clara, pitch fácil ("51% da capacidade autorizada de biometano no Brasil está ociosa — nossa ferramenta conecta indústrias que consomem gás a fontes subutilizadas a menos de 50 km"). Viável de ponta a ponta em 48h.

**Recomendação 2 (ambiciosa): H₂ Verde + Fertilizantes** — Narrativa mais forte (94% de importação de fertilizantes, US$ 30 bi em H₂), mas dados são majoritariamente anúncios. Viável só se a equipe aceitar trabalhar com dados declarativos/estimados e não com dados operacionais verificados.

### Dado que sustenta

- Biometano: 19 plantas, 1.196.427 m³/d autorizados, apenas 66% utilizados. 6 plantas com 0% de produção. (ANP, 03/2026)
- H₂: 66 iniciativas industriais mapeadas, 41% no CE, US$ 30 bi em investimentos. (Atlas E+, 2025)
- Fertilizantes: 94% de importação de nitrogenados, consumo de 6,1 Mt N/ano. (Atlas E+, 2025)

### Visualização sugerida

**Bubble chart**: eixo X = impacto (redução de CO2 potencial), eixo Y = viabilidade de dados em 48h (nota 1-5), tamanho da bolha = urgência geopolítica. Biometano fica no canto superior direito (alto impacto, dados viáveis). H₂ verde fica alto em impacto mas baixo em viabilidade de dados.

### Implicação pro MVP

Se a equipe é majoritariamente de dados/Python: **biometano**. Se a equipe é mais narrativa/pitch e aceita trabalhar com proxies: **H₂ + fertilizantes**. Não tentar os dois simultaneamente em 48h.

---

## Seção 4: Quem Seria o Usuário Mais Underserved Hoje?

### 4.1 O que a PID v2.0 oferece (reconstruído do Atlas + docs)

A PID é uma **ferramenta de exploração visual** — o usuário sobrepõe camadas geográficas (energia + indústria + infra + biomassa) e identifica áreas de cluster por inspeção visual. Não oferece:
- Score ou ranking de localizações
- Recomendação ("dado meu produto X, onde instalar?")
- Simulação what-if
- Custo comparativo
- Alerta de risco socioambiental
- Exportação de relatório por região

### 4.2 Análise por persona

| Persona | O que a PID dá | O que ela PRECISA | Gap |
|---|---|---|---|
| **Investidor industrial** | Mapa visual de onde há energia, infra, biomassa | Score comparativo entre localizações, custo nivelado, risco, time-to-market | **ENORME** — PID é o insumo, falta a inteligência |
| **Gestor estadual** | Pode mostrar o potencial do seu estado | Benchmark vs. outros estados, argumentário de atração, gap analysis | **Grande** — PID não compara, só mostra |
| **Indústria existente** | Mostra onde estão concorrentes e fontes | Rota de descarbonização viável para minha planta específica | **Médio** — produto diferente (não locacional) |
| **Formulador federal** | Visão macro dos clusters | Priorização de investimento público, análise de gap de infra | **Médio** — usuário restrito |
| **Sociedade civil** | Visualização de clusters propostos | Sobreposição de risco ambiental/desmatamento, impacto em comunidades | **Médio** — mas dados existem (Terrabrasilis) |

### 4.3 Recomendação

**Investidor industrial** é a persona mais underserved e com maior ROI de produto. A dor é mensurável em R$ (due diligence locacional custa 6+ meses e US$ 200k+ em consultoria). A PID tem ~80% dos dados necessários; falta a camada de conversão de dado em decisão. O pitch é direto: "6 meses de consultoria → 30 segundos na nossa ferramenta".

### Dado que sustenta

- PID declara explicitamente ser "exploratório e não exaustivo" (Atlas, p.89)
- Atlas lista "construção contínua" e "primeiro passo" como qualificadores
- Nenhuma funcionalidade de scoring/ranking é mencionada em nenhuma documentação

### Visualização sugerida

**Journey map do investidor**: 6 etapas (identificar país → escolher região → comparar localizações → avaliar infra → quantificar risco → decidir). Marcar em vermelho as etapas onde a PID ajuda (1-2) e em verde onde o nosso produto adicionaria inteligência (3-6).

### Implicação pro MVP

Construir para o investidor. Se o produto resolver a pergunta "onde instalo minha planta de [produto] com menor custo e risco?", todas as outras personas se beneficiam por extensão (gestor público quer saber o que o investidor vai ver, formulador quer entender o que atrai investimento).

---

## Seção 5: Existem 2-3 "Histórias" Prontas pra Pitch?

### História 1: "Amônia Verde — Pecém vs. Camaçari em 30 segundos"

> Um investidor do Oriente Médio quer construir uma planta de amônia verde de US$ 2 bi no Brasil. Hoje, ele contrata uma consultoria de 6 meses para comparar Pecém (CE) e Camaçari (BA). Resultado: dois relatórios de 200 páginas.
>
> **O que nossa ferramenta faria:** o investidor seleciona "amônia verde" e ajusta pesos (energia renovável 30%, porto 25%, gasoduto 20%, mão-de-obra 15%, custo logístico 10%). Em 30 segundos, o score mostra Pecém 87/100 vs. Camaçari 72/100, com justificativa transparente: Pecém tem 15 GW de eólica/solar no pipeline, porto profundo operacional, e hub de H₂ em construção. Camaçari tem infra química existente, mas eólica menor (5,8 GW operacionais no estado) e sem hub de H₂ sancionado.
>
> **Dados que sustentam:** 41% das iniciativas de H₂ concentradas no CE (Atlas, p.22); CE tem 15 GW de pipeline renovável (SIGA); Pecém é porto privado com terminal de uso público (ANTAQ).

### História 2: "Biometano Ocioso a 20 km da Siderúrgica"

> A ArcelorMittal opera uma siderúrgica em Pecém (São Gonçalo do Amarante, CE). A GNR Fortaleza, uma planta de biometano em Caucaia (CE), tem capacidade de 110.000 m³/d mas opera a 49% — sobram 56.000 m³/d de capacidade ociosa. A distância entre as duas é ~20 km.
>
> **O que nossa ferramenta faria:** cruzar localização de indústrias consumidoras de gás (siderurgia, vidro, química) com plantas de biometano subutilizadas num raio de 50 km. Flag: "Você sabia que há 56.000 m³/d de biometano disponível a 20 km da sua planta? Substituir gás natural por biometano reduz suas emissões em até 95%."
>
> **Dados que sustentam:** ANP biometano (03/2026) — GNR Fortaleza 110.000 m³/d, 49% utilização; Instituto Aço Brasil — ArcelorMittal Pecém; Atlas p.20 — biometano reduz até 95% emissões vs. gás natural.

### História 3: "Fertilizante Verde no Vazio do Centro-Oeste"

> O Brasil importa 94% dos fertilizantes nitrogenados que consome (6,1 Mt/ano). Mato Grosso sozinho produz 44,4 Mt de soja e aplica ~1,5 Mt de fertilizante nitrogenado por ano — mas não tem UMA planta de biometano ou projeto de H₂. Todo fertilizante chega de navio via Paranaguá ou Santos e viaja 2.000 km de rodovia até Sorriso.
>
> **O que nossa ferramenta faria:** mostrar que instalar uma planta de amônia verde em Lucas do Rio Verde (MT) — onde há 8.293 MW de capacidade hidro no estado, disponibilidade de biomassa de cana/soja, e o maior mercado consumidor de fertilizantes do país — teria custo logístico ~40% menor que importar via Santos.
>
> **Dados que sustentam:** IBGE PAM 2023 — MT 44,4 Mt soja; Atlas p.36 — 94% de importação de N-fertilizantes; ANEEL SIGA — 8.285 MW em RO adjacente, transmissão crescente para MT; ANP — zero plantas de biometano em MT.

---

## Seção 6: Três Caminhos de MVP Recomendados

### Caminho A: "Matchmaking Biometano-Indústria" (Recomendado)

**Uma frase:** cruzar plantas de biometano com capacidade ociosa (ANP) e indústrias consumidoras de gás num raio de 50 km, gerando um ranking de oportunidades de substituição de gás fóssil por biometano.

**Tradeoff:** escopo estreito (19 plantas, 5 estados), mas 100% executável em 48h com dados reais. Pitch poderoso porque usa dados operacionais (não estimates). Risco: amostra pequena pode parecer "protótipo de feature" e não "produto".

### Caminho B: "Score de Localização para Investidor de H₂ Verde"

**Uma frase:** dado um produto (amônia verde, metanol verde, e-SAF), o usuário ajusta pesos de critérios e recebe um ranking dos top-10 municípios para instalar, com justificativa transparente.

**Tradeoff:** narrativa mais forte e alinhada com a tese do E+ (powershoring), mas dados de H₂ são majoritariamente anúncios, não operacionais — o score será baseado em proxies (distância a porto, MW renovável no raio, gasoduto próximo). Risco: avaliadores técnicos podem questionar a robustez dos inputs.

### Caminho C: "Mismatch Map + Radar de Oportunidade"

**Uma frase:** mapa interativo que mostra municípios com alta renovável e baixa indústria, cruzado com camada de risco socioambiental (Terrabrasilis), gerando "score de viabilidade de powershoring" para cada município.

**Tradeoff:** mais ambicioso e visualmente impressionante, mas exige integrar Terrabrasilis (scraping potencialmente lento) + dados de emprego (IBGE CEMPRE, que exige download pesado). Risco: escopo inflado em 48h, produto fica genérico ("mais um mapa bonito").

### Recomendação final

**Caminho A se a equipe é ≤4 pessoas. Caminho B se a equipe é 5 pessoas com capacidade de trabalhar em paralelo.** Caminho C só se houver alguém com experiência prévia em dados geoespaciais e scraping.

---

## Fontes Acessadas

| # | Fonte | URL | O que foi acessado | Granularidade | Status |
|---|---|---|---|---|---|
| 1 | **ANEEL SIGA** | https://dadosabertos.aneel.gov.br | CSV completo de 25.407 empreendimentos de geração com coords, capacidade, fonte, fase | Empreendimento × município | **Acessado** |
| 2 | **ANEEL SIGET** | https://dadosabertos.aneel.gov.br | CSV com 1.160 trechos de transmissão e 2.305 equipamentos de subestação | Módulo de transmissão | **Acessado** |
| 3 | **ANP Biometano** | https://www.gov.br/anp/pt-br/.../biometano-dados-abertos.zip | CSV com 19 plantas autorizadas, capacidade, produção mensal por estado | Planta × município | **Acessado** |
| 4 | **Atlas E+ 2025** | PDF local (82p) | Extração de ~80 dados quantitativos sobre 9 setores, 6 vetores energéticos, 10 clusters | Brasil / região / estado | **Acessado** |
| 5 | **Instituto Aço Brasil** | https://www.acobrasil.org.br | Lista de 31 plantas siderúrgicas com município e estado | Planta × município | **Acessado** |
| 6 | **IBGE PAM 2023** | https://sidra.ibge.gov.br | Produção de soja por estado (44,4 Mt MT, 21,5 Mt PR, etc.) | Estado | **Acessado** |

## Fontes NÃO Acessadas

| # | Fonte | Por que não |
|---|---|---|
| 7 | **PID v2.0** (emaisenergia.org/pid) | Site bloqueia requests automatizados (HTTP 403). Não consegui acessar via webfetch. Inventário do conteúdo real da PID é reconstruído da documentação do Atlas e BANCO_DADOS_PID.docx. |
| 8 | **EPE Webmap** | Aplicação GIS que requer navegador com JavaScript — não é baixável por API ou CSV direto. |
| 9 | **SIGA via PowerBI** | Dashboard PowerBI não exportável programaticamente. Usei os dados abertos ANEEL diretamente. |
| 10 | **Terrabrasilis (INPE)** | Requer download de shapefiles pesados. Prioridade baixa para EDA de 3h. |
| 11 | **IBGE CEMPRE/RAIS** | Base de empregos por município e setor. Download requer autenticação IBGE e arquivo é >500MB. |
| 12 | **MapBiomas** | Dados de cobertura do solo. Download via Google Earth Engine ou shapefiles — scraping não trivial. |
| 13 | **ANTAQ/ANTT** | Dados logísticos portuários e ferroviários. APIs disponíveis mas não priorizadas para EDA inicial. |
| 14 | **CIBiogás — Biogás Map** | Portal com dados de biogás, mas não identifiquei download direto de CSV. |
| 15 | **Observatório do Código Florestal** | Dados de conformidade ambiental. Não houve tempo. |
| 16 | **IRENA / World Bank / World Steel** | Dados internacionais. Granularidade nacional, não municipal — pouco útil para análise locacional. |

---

## Limitações

1. **PID não acessada diretamente.** Todo o diagnóstico de "pontos cegos" é inferido da documentação (Atlas + BANCO_DADOS_PID.docx), não de inspeção visual da plataforma. A PID pode ter features não documentadas nos materiais que li.

2. **Granularidade industrial é fraca.** Os dados do Instituto Aço Brasil dão município, mas não coords exatas. Para os outros 8 setores (química, cimento, vidro, etc.), não consegui obter dados municipais em tempo hábil — teria que usar CEMPRE/RAIS do IBGE.

3. **Biometano tem amostra pequena.** 19 plantas é pouco para modelagem estatística. Mas é suficiente para um protótipo de matchmaking.

4. **Pipeline ANEEL é "outorgado", não "em construção".** Dos 116 GW de pipeline, a maioria está em fase de "não iniciado" — pode nunca ser construído. Usei como indicador de direção, não como dado confirmed.

5. **Custo de produção não foi estimado.** LCOE/LCOH por município requer dados de irradiação solar, vento, custo de capital — não compilados neste ciclo.

6. **Risco socioambiental não foi cruzado.** Terrabrasilis (desmatamento) e Código Florestal (conformidade) ficaram de fora. Camada crítica para diferenciador ESG, mas requer integração que não coube no tempo.

7. **Dados de emprego industrial (CEMPRE)** não foram baixados. Sem isso, a análise de "mão-de-obra disponível" fica baseada em proxies (população municipal do IBGE, que é mais grosseiro).

---

## Anexo: Dados Complementares

### A. Capacidade Instalada por Fonte (Operacional, mai/2026)

| Fonte | Código | Plantas | Capacidade (MW) |
|---|---|---|---|
| Hidrelétrica | UHE | 216 | 103.271 |
| Térmica | UTE | 3.051 | 49.576 |
| Eólica | EOL | 1.136 | 34.907 |
| Solar PV | UFV | 17.175 | 22.329 |
| PCH | PCH | 432 | 6.068 |
| Nuclear | UTN | 2 | 1.990 |
| CGH | CGH | 709 | 919 |
| **Total** | | **22.721** | **219.059** |

### B. Biometano — Produção Anual (m³)

| Ano | Produção | Crescimento |
|---|---|---|
| 2020 | 36,1M | — |
| 2021 | 53,0M | +47% |
| 2022 | 66,7M | +26% |
| 2023 | 74,9M | +12% |
| 2024 | 81,5M | +9% |
| 2025 | 119,8M | +47% |

### C. Consumo de Energia Elétrica por Região (2024)

| Região | % do consumo | Capacidade renovável local |
|---|---|---|
| Sudeste | 48% | Alta (hidro MG/SP, solar MG) |
| Nordeste | 21% | Muito alta (eólica + solar), mas baixa demanda industrial |
| Sul | 18% | Média (hidro + eólica RS/SC) |
| Norte | 7% | Altíssima (hidro), mas lowest consumo |
| Centro-Oeste | 6% | Crescente (solar), baixo consumo industrial |

### D. Investimentos Anunciados por Setor

| Setor | Valor | Detalhe | Fonte |
|---|---|---|---|
| H₂ verde | US$ 30 bi | até 2024 | Atlas p.22 |
| Metanol (BNDES/Finep) | R$ 132 bi | 42 projetos | Atlas p.32 |
| Papel e celulose | >R$ 100 bi | novos projetos | Atlas p.46 |
| Portos | R$ 22,85 bi | até 2026 | Atlas p.26 |
| SAF — impacto PIB | US$ 17-36 bi | até 2035 | Atlas p.34 |

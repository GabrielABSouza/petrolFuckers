# Discovery imersivo dos dados — transição energética

> Data da investigação: 09 mai 2026  
> Escopo: pasta `data/`  
> Objetivo: entender quais dados estão em mãos, que perguntas eles conseguem responder e quais produtos/hipóteses de transição energética ficam mais fortes.

---

## 1. Resumo executivo

1. **Temos uma base forte de oferta energética, não de demanda industrial.** O `data/raw` cobre geração elétrica, linhas/subestações de transmissão e biometano. A demanda industrial aparece sobretudo como artefato processado/manual em `agente_eda_findings.md`, não como base tabular robusta.

2. **A base mais poderosa é a ANEEL SIGA.** São `25.407` empreendimentos/projetos de geração com fase, fonte, UF, município, potência e coordenadas. Ela permite mapear onde existe energia limpa operacional, onde há pipeline renovável e onde ainda há dependência fóssil.

3. **O maior sinal de oportunidade está no pipeline renovável.** Há aproximadamente `107,4 GW` de eólica+solar fora de operação, concentrados em BA, MG, PI, CE, RN e PB. Isso sustenta narrativas de powershoring e localização de indústria verde.

4. **Biometano é o melhor caso de MVP com dados reais.** Em `03/2026`, a ANP mostra `19` plantas, `1.196.427 m³/d` de capacidade autorizada de produção e produção equivalente a cerca de `400.470 m³/d`. Isso implica uso de apenas `33,5%` da capacidade autorizada, com aproximadamente `795.957 m³/d` ociosos.

5. **Transmissão é a camada de viabilidade.** A SIGET traz `1.160` linhas, `148.955,5 km` de extensão, `2.305` equipamentos de subestação e `10.379` módulos/projetos. Ela pode transformar um mapa de potencial em um score de “pronto para conectar”.

6. **A lacuna central é transformar camadas em decisão.** Os dados respondem “onde está energia/infra/biometano?”, mas ainda não respondem automaticamente “onde devo instalar minha planta?”, “qual fornecedor verde está ocioso perto de mim?” ou “qual rota reduz fóssil com menor fricção?”.

7. **Recomendação de foco:** construir um `matchmaking biometano -> consumidor industrial/gás` ou um `score de localização para powershoring`, começando por biometano porque a ANP dá dados operacionais, mensais e fáceis de explicar.

---

## 2. Inventário da pasta `data/`

| Arquivo | Tamanho | Linhas/registros | O que contém | Valor para transição energética |
|---|---:|---:|---|---|
| `raw/ANEEL_SIGA_empreendimentos-geracao.csv` | `7.639 KB` | `25.407` | Usinas/projetos de geração, fonte, fase, potência, UF, município, coordenadas | Oferta elétrica limpa, fóssil remanescente, pipeline renovável, clusters energéticos |
| `raw/ANEEL_SIGET_linhas-transmissao.csv` | `239 KB` | `1.160` | Linhas de transmissão, origem/destino, UF, extensão, tensão, circuitos | Viabilidade de conexão, gargalos de escoamento, prontidão de clusters |
| `raw/ANEEL_SIGET_subestacoes.csv` | `385 KB` | `2.305` | Equipamentos de subestação, UF, tensão, tipo de equipamento | Densidade e robustez da rede elétrica |
| `raw/ANEEL_SIGET_transmissao-projetos.csv` | `6.973 KB` | `10.379` | Projetos/módulos de transmissão, status, datas, tipo de obra | Pipeline de infraestrutura elétrica |
| `raw/ANP_Biometano_capacidade.csv` | `58 KB` | `492` | Série mensal por planta: capacidade autorizada, processamento de biogás, utilização | Capacidade ociosa e oferta real de gás renovável |
| `raw/ANP_Biometano_producao.csv` | `11 KB` | `228` | Série mensal por UF/produto: produção de biometano | Produção efetiva por estado e evolução temporal |
| `processed/ANEEL_SIGA_resumo.json` | `12 KB` | — | Resumo já processado da SIGA/SIGET | Atalho para estatísticas agregadas |
| `processed/agente_eda_findings.md` | `9 KB` | — | Achados manuais: aço, PIM-PF, PIB, soja, fontes IBGE | Proxy de demanda industrial/agro e material de narrativa |

---

## 3. O que cada bloco de dados nos permite fazer

### 3.1 ANEEL SIGA — mapa da oferta energética

**Cobertura:**

- **Registros:** `25.407`
- **Colunas:** `23`
- **Fases:** `22.721` em operação, `159` em construção, `2.527` com construção não iniciada
- **Fontes/tipos:** UFV, UHE, UTE, EOL, PCH, CGH, UTN
- **Campos úteis:** `SigTipoGeracao`, `DscFaseUsina`, `DscOrigemCombustivel`, `DscFonteCombustivel`, `MdaPotenciaOutorgadaKw`, coordenadas, município, UF

**Capacidade por fonte, considerando potência outorgada:**

| Fonte | Registros | MW totais aproximados | Leitura |
|---|---:|---:|---|
| UFV | `19.224` | `111.958 MW` | Grande massa de solar, majoritariamente pipeline |
| UHE | `221` | `103.531 MW` | Base histórica hidro, já consolidada |
| UTE | `3.113` | `55.362 MW` | Núcleo da substituição fóssil/biomassa |
| EOL | `1.588` | `52.713 MW` | Forte em Nordeste e Sul |
| PCH | `540` | `7.460 MW` | Complementar, pulverizada |
| UTN | `3` | `3.340 MW` | Nuclear, pouco acionável para MVP |
| CGH | `718` | `945 MW` | Pequena geração hídrica distribuída |

**Operação vs. pipeline:**

| Situação | Leitura |
|---|---|
| Operação | Cerca de `219,1 GW` outorgados em operação. Hidro ainda domina, mas eólica+solar já somam aproximadamente `57,2 GW`. |
| Construção | Cerca de `10,7 GW`, com destaque para UTE, UFV, EOL e Angra 3. |
| Construção não iniciada | Cerca de `105,6 GW`, dominada por UFV (`87,0 GW`) e EOL (`16,4 GW`). Deve ser tratada como sinal de intenção, não como capacidade garantida. |

**Estados fortes em eólica+solar operacional:**

| UF | EOL+UFV operacional aproximado |
|---|---:|
| BA | `14.810 MW` |
| RN | `12.874 MW` |
| MG | `8.662 MW` |
| PI | `6.820 MW` |
| CE | `4.823 MW` |
| PE | `2.770 MW` |
| RS | `2.137 MW` |
| PB | `1.823 MW` |
| SP | `1.218 MW` |

**Estados fortes em pipeline eólica+solar:**

| UF | EOL+UFV fora de operação aproximado |
|---|---:|
| BA | `23.909 MW` |
| MG | `22.911 MW` |
| PI | `16.185 MW` |
| CE | `14.991 MW` |
| RN | `9.264 MW` |
| PB | `5.642 MW` |
| GO | `4.100 MW` |
| PE | `2.660 MW` |
| MS | `2.536 MW` |
| RS | `2.154 MW` |

**Municípios de pipeline renovável mais fortes:**

| Município | Pipeline EOL+UFV aproximado |
|---|---:|
| Buritizeiro - MG | `4.465 MW` |
| Arinos - MG | `3.716 MW` |
| Juazeiro - BA | `3.262 MW` |
| Floriano - PI | `2.854 MW` |
| Janaúba - MG | `2.846 MW` |
| Açu - RN | `2.835 MW` |
| Bom Jesus da Lapa - BA | `2.795 MW` |
| Barreiras - BA | `2.542 MW` |
| São Mamede - PB | `2.349 MW` |
| Matias Cardoso - MG | `2.310 MW` |

**O que tirar disso:**

- **Mapa de powershoring:** ranquear municípios por MW renovável operacional + pipeline.
- **Score de localização:** energia limpa disponível/potencial como dimensão central.
- **Análise de risco de execução:** separar operação, construção e construção não iniciada para não vender pipeline incerto como realidade.
- **Mapa de substituição fóssil:** identificar onde há UTE fóssil relevante e quais regiões têm alternativa renovável próxima.

---

### 3.2 UTE fóssil e biomassa — onde está a descarbonização mais direta

A SIGA também mostra onde ainda há geração fóssil e onde a biomassa já é relevante.

**UTE fóssil em operação por combustível:**

| Combustível | Registros | MW aproximados |
|---|---:|---:|
| Gás natural | `180` | `19.443 MW` |
| Petróleo | `2.190` | `7.819 MW` |
| Carvão mineral | `21` | `3.931 MW` |
| Outros fósseis | `4` | `166 MW` |

**Estados com maior UTE fóssil em operação:**

| UF | MW fóssil aproximados | Leitura |
|---|---:|---|
| RJ | `9.276 MW` | Maior polo de térmicas a gás; bom para agenda de substituição/offset |
| MA | `2.661 MW` | Forte concentração em gás natural e óleo/carvão |
| SP | `2.654 MW` | Demanda industrial e térmica coexistem |
| AM | `1.896 MW` | Sistemas/isolamento e óleo/gás; caso específico amazônico |
| RS | `1.831 MW` | Gás + carvão; transição complexa |
| PE | `1.773 MW` | Gás natural e óleo; possível cruzamento com biometano |
| CE | `1.740 MW` | Pecém/carvão + gás; narrativa de substituição em cluster |
| SE | `1.635 MW` | Porto de Sergipe pesa muito |

**Biomassa em operação por fonte:**

| Fonte | MW aproximados | Leitura |
|---|---:|---|
| Agroindustriais | `12.869 MW` | Principalmente bagaço de cana; forte em SP/MS/GO/MG/PR |
| Floresta | `5.076 MW` | Licor negro/celulose; forte para clusters papel/celulose |
| Resíduos sólidos urbanos | `244 MW` | Pequeno, mas relevante para cidades/metano |
| Resíduos animais | `9 MW` | Ainda incipiente |

**O que tirar disso:**

- **Produto “fóssil replacement radar”:** localizar térmicas e/ou polos industriais que queimam gás, óleo ou carvão e sugerir rotas de substituição por biometano, eletrificação, PPA renovável ou biomassa.
- **Histórias de pitch:** RJ, CE, PE, RS e SP são bons estados para narrar transição por substituição de gás/óleo/carvão.
- **Setores candidatos:** vidro, química, cimento, siderurgia, alimentos, papel/celulose e térmicas a gás.

---

### 3.3 ANEEL SIGET — transmissão como gargalo ou vantagem

A SIGET adiciona a pergunta: “a energia consegue chegar ou conectar?”.

**Linhas de transmissão:**

- **Registros:** `1.160`
- **Extensão total:** `148.955,5 km`
- **Circuitos:** `1.707`
- **Torres:** `221.205`
- **Status:** `1.123` ativas e `37` desativadas

**Extensão por tensão:**

| Tensão | Registros | Km aproximados |
|---|---:|---:|
| 500 kV | `349` | `66.227 km` |
| 230 kV | `565` | `43.701 km` |
| 800 kV | `6` | `12.198 km` |
| 525 kV | `67` | `9.560 km` |
| 600 kV | `3` | `7.206 km` |
| 345 kV | `86` | `4.860 km` |

**UFs com maior extensão por origem:**

| UF origem | Registros | Km aproximados |
|---|---:|---:|
| MG | `144` | `20.132 km` |
| PA | `51` | `17.039 km` |
| BA | `95` | `14.933 km` |
| RO | `28` | `11.156 km` |
| RS | `124` | `8.601 km` |
| MT | `36` | `8.593 km` |
| SP | `113` | `8.172 km` |
| PI | `48` | `7.871 km` |

**Subestações/equipamentos:**

- **Registros:** `2.305`
- **Principais tipos:** transformadores de potência (`822`), reatores de linha (`813`), reatores de barra (`355`)
- **UFs com mais equipamentos:** MG (`316`), BA (`282`), SP (`209`), RS (`166`), PA (`138`), MT (`119`), PI (`107`), CE (`98`)

**Projetos/módulos de transmissão:**

- **Registros:** `10.379`
- **Situação dos empreendimentos:** `8.331` em operação, `1.941` em andamento, `95` concluídos, `12` planejados
- **Tipos:** módulos de manobra, equipamentos, linhas de transmissão e módulos gerais

**O que tirar disso:**

- **Score de prontidão elétrica:** combinar MW renovável com densidade de linhas/subestações.
- **Filtro de risco:** município com muito pipeline renovável, mas pouca infraestrutura de transmissão próxima, deve perder pontos.
- **Narrativa de investimento:** “não basta ter sol/vento; precisa conexão e subestação”.

**Limitação importante:** os CSVs da SIGET têm nomes/UFs de subestações, mas não coordenadas explícitas. Para mapa granular, será necessário geocodificar subestações ou obter camada geoespacial complementar.

---

### 3.4 ANP Biometano — o caso mais acionável

A ANP traz duas visões complementares:

- `ANP_Biometano_capacidade.csv`: mensal por planta, com capacidade autorizada, processamento de biogás e utilização.
- `ANP_Biometano_producao.csv`: mensal por estado/produto, com produção efetiva.

**Situação em `03/2026`:**

| Métrica | Valor |
|---|---:|
| Plantas | `19` |
| Capacidade autorizada de produção de biometano | `1.196.427 m³/d` |
| Capacidade de processamento de biogás | `2.571.071 m³/d` |
| Volume processado de biogás | `826.588 m³/d` |
| Utilização ponderada do processamento | `32,1%` |
| Produção mensal de biometano/biometano comprimido | `12.414.561 m³/mês` |
| Produção diária equivalente | `400.470 m³/d` |
| Uso estimado da capacidade autorizada de produção | `33,5%` |
| Capacidade autorizada aparentemente ociosa | `795.957 m³/d` |

**Capacidade vs. produção diária equivalente por estado em `03/2026`:**

| Estado | Capacidade autorizada | Produção equivalente | Uso | Ociosidade aproximada |
|---|---:|---:|---:|---:|
| São Paulo | `557.816 m³/d` | `90.892 m³/d` | `16,3%` | `466.924 m³/d` |
| Rio de Janeiro | `222.480 m³/d` | `123.525 m³/d` | `55,5%` | `98.955 m³/d` |
| Ceará | `110.000 m³/d` | `69.763 m³/d` | `63,4%` | `40.237 m³/d` |
| Pernambuco | `108.931 m³/d` | `40.058 m³/d` | `36,8%` | `68.874 m³/d` |
| Rio Grande do Sul | `100.848 m³/d` | `61.946 m³/d` | `61,4%` | `38.903 m³/d` |
| Paraná | `40.000 m³/d` | `14.287 m³/d` | `35,7%` | `25.713 m³/d` |
| Santa Catarina | `31.440 m³/d` | `0 m³/d` | `0,0%` | `31.440 m³/d` |
| Minas Gerais | `16.912 m³/d` | `0 m³/d` | `0,0%` | `16.912 m³/d` |
| Mato Grosso do Sul | `8.000 m³/d` | `0 m³/d` | `0,0%` | `8.000 m³/d` |

**Plantas com baixa utilização em `03/2026`:**

- **0% ou praticamente 0%:** Ivinhema/MS, Campos Novos/SC, Paraguaçu Paulista/SP, Tupaciguara/MG, Paulínia/SP, Américo Brasiliense/SP.
- **5%:** Raízen-GEO Biogás Costa Pinto, Piracicaba/SP.
- **15% a 17%:** Biometano Sul/RS e Orizon Jaboatão/PE.
- **25%:** Geo Elétrica Tamboara/PR.

**Cruzamento estadual com UTE a gás/fóssil:**

| Estado | Biometano ocioso | UTE a gás em operação | UTE fóssil total | Leitura |
|---|---:|---:|---:|---|
| São Paulo | `466.924 m³/d` | `1.086 MW` | `2.654 MW` | Maior excesso de biometano autorizado e grande mercado industrial |
| Rio de Janeiro | `98.955 m³/d` | `8.622 MW` | `9.276 MW` | Grande demanda fóssil, oferta de biometano relevante |
| Pernambuco | `68.874 m³/d` | `608 MW` | `1.773 MW` | Caso regional forte para substituição parcial |
| Ceará | `40.237 m³/d` | `242 MW` | `1.740 MW` | Bom storytelling com Pecém e indústria pesada |
| Rio Grande do Sul | `38.903 m³/d` | `903 MW` | `1.831 MW` | Transição gás/carvão/biometano |
| Paraná | `25.713 m³/d` | `506 MW` | `630 MW` | Matchmaking regional viável |
| Minas Gerais | `16.912 m³/d` | `382 MW` | `847 MW` | Demanda industrial forte, oferta inicial pequena |
| Mato Grosso do Sul | `8.000 m³/d` | `569 MW` | `577 MW` | Potencial agro alto, mercado ainda embrionário |

**O que tirar disso:**

- **Matchmaking biometano-indústria:** encontrar consumidores de gás próximos a plantas subutilizadas.
- **Ranking de “biometano ocioso por estado/município”:** São Paulo é o epicentro de ociosidade.
- **Alerta de oportunidade:** planta autorizada + baixa produção + consumidor próximo = lead de descarbonização.
- **Narrativa simples:** “não precisamos esperar nova tecnologia; já existe capacidade autorizada ociosa”.

**Limitações importantes:**

- A produção é por estado/produto, não por planta.
- A capacidade é por planta, mas sem latitude/longitude explícita.
- O campo de utilização no arquivo de capacidade mede processamento de biogás, não necessariamente produção final de biometano.
- Para distância real, será necessário geocodificar municípios ou integrar malha municipal do IBGE.

---

## 4. Artefatos processados disponíveis

### 4.1 `processed/ANEEL_SIGA_resumo.json`

É um resumo útil para acelerar a aplicação. Ele já contém:

- Fonte e URLs dos dados ANEEL.
- Colunas da SIGA.
- Capacidade por fonte e UF.
- Pipeline de expansão por fase.
- Metadados da SIGET.
- Links de referência EPE/BEN/PDE/WebMap.

**Uso recomendado:** carregar esse JSON no app para cards rápidos de contexto, sem reprocessar o CSV inteiro a cada inicialização.

### 4.2 `processed/agente_eda_findings.md`

Contém achados manuais sobre:

- `31` plantas siderúrgicas por estado/município.
- Estatísticas nacionais do aço.
- Índice de produção industrial.
- PIB estadual.
- Produção de soja por estado.
- Fontes SIDRA/IBGE e CNAEs úteis.

**Uso recomendado:** transformar os trechos de plantas industriais e dados agro em CSVs estruturados. Hoje o conteúdo é bom para narrativa, mas fraco para join automatizado.

---

## 5. Hipóteses e produtos que os dados sustentam

### Hipótese A — “há energia limpa onde ainda não há indústria verde suficiente”

**Dados que sustentam:**

- EOL+UFV operacional forte em BA, RN, MG, PI, CE e PE.
- Pipeline EOL+UFV de aproximadamente `107,4 GW`, concentrado em BA, MG, PI, CE, RN e PB.
- Municípios como Buritizeiro, Arinos, Juazeiro, Floriano, Janaúba e Açu têm escala de GW no pipeline.

**Produto possível:** `Score de localização para powershoring`.

**Pergunta que responde:** “onde instalar uma planta eletrointensiva de baixo carbono?”.

**O que falta para ficar robusto:** demanda industrial municipal, portos/ferrovias/gasodutos, mão de obra, custo de terra, risco ambiental.

---

### Hipótese B — “há biometano autorizado e subutilizado perto de mercados industriais”

**Dados que sustentam:**

- `1.196.427 m³/d` de capacidade autorizada de produção em `03/2026`.
- Produção equivalente de apenas `400.470 m³/d`.
- Ociosidade nacional estimada em `795.957 m³/d`.
- SP sozinho concentra `466.924 m³/d` de ociosidade aproximada.
- RJ combina grande parque térmico a gás (`8.622 MW`) com biometano em operação.

**Produto possível:** `Matchmaking biometano-indústria`.

**Pergunta que responde:** “qual planta de biometano ociosa pode substituir parte do gás fóssil da minha operação?”.

**O que falta para ficar robusto:** coordenadas das plantas ANP, lista geocodificada de consumidores industriais de gás e fator de conversão energético padronizado.

---

### Hipótese C — “a transição depende de conexão, não só de potencial”

**Dados que sustentam:**

- `148.955,5 km` de linhas SIGET.
- Forte presença de 500 kV e 230 kV.
- Estados com pipeline renovável também têm diferentes níveis de infraestrutura: BA e MG aparecem fortes em linhas/subestações; alguns municípios específicos ainda precisam de análise local.

**Produto possível:** `Transmission readiness score`.

**Pergunta que responde:** “essa localização tem energia no mapa ou tem energia conectável?”.

**O que falta para ficar robusto:** coordenadas das subestações/linhas, capacidade disponível e fila de acesso/conexão.

---

### Hipótese D — “substituir fóssil em UTEs e polos industriais é uma narrativa rápida de impacto”

**Dados que sustentam:**

- `31,4 GW` de UTE fóssil em operação.
- Gás natural representa cerca de `19,4 GW`.
- RJ, SP, PE, CE, RS e PR combinam demanda fóssil com oferta/ociosidade de biometano.

**Produto possível:** `Radar de substituição fóssil`.

**Pergunta que responde:** “onde a substituição parcial por gás renovável, biomassa ou eletrificação parece mais plausível?”.

**O que falta para ficar robusto:** consumo real de combustível por planta, emissões, contrato de suprimento, custo relativo e disponibilidade logística.

---

## 6. Lacunas de dados relevantes

| Lacuna | Por que importa | Fonte provável |
|---|---|---|
| Demanda industrial municipal por setor | Sem isso, temos oferta energética mas não sabemos exatamente quem consumiria | IBGE CEMPRE, RAIS, CNAE, associações setoriais |
| Coordenadas de plantas de biometano | Necessário para raio de 20/50/100 km | Geocoding municipal, IBGE malha municipal, ANP se houver shapefile |
| Gasodutos e capacidade disponível | Biometano/gás dependem de infraestrutura física | EPE, ANP, transportadoras, PID/WebMap |
| Portos, ferrovias e rodovias | Essencial para H₂, amônia, SAF, fertilizantes e exportação | ANTAQ, ANTT, DNIT, EPE |
| Empregos e qualificação | Score de localização precisa de mão de obra | CEMPRE, RAIS, SENAI, Observatório Sebrae |
| Risco socioambiental | Diferencial de transição justa e ESG | Terrabrasilis, MapBiomas, Código Florestal |
| Custos e emissões | Para sair de mapa e entrar em business case | BEN/EPE, fatores IPCC, literatura setorial |
| H₂ verde granular | Tema forte, mas não há base bruta em `data/` | Atlas E+, EPE, PNH₂, portos, anúncios empresariais |

---

## 7. Qualidade dos dados e cuidados técnicos

- **Encoding:** os CSVs ANEEL devem ser lidos como `latin-1`/`cp1252`; com `utf-8` os acentos quebram.
- **Separador:** ANEEL usa `;`; ANP usa `,`.
- **Números:** ANEEL usa vírgula decimal; ANP mistura vírgula decimal em capacidade e ponto decimal em produção.
- **Municípios:** `DscMuninicpios` tem erro de grafia no nome da coluna e pode conter múltiplos municípios no mesmo campo.
- **Pipeline:** `Construção não iniciada` não deve ser tratado como capacidade certa.
- **SIGET:** linhas/subestações não trazem geometria pronta; para mapa real, precisa enriquecer.
- **ANP produção:** produção é agregada por UF/produto, não por planta; cuidado ao inferir utilização individual.
- **IDs/status:** alguns campos da SIGET são códigos (`IdcSitMdl`, `IdcTipoCircuitoLinhaTransm`) e precisam de dicionário para interpretação final.

---

## 8. Recomendação de MVP a partir dos dados em mãos

### Caminho 1 — recomendado: `Biometano Matchmaker`

**Uma frase:** cruzar plantas de biometano com ociosidade e consumidores industriais/fósseis próximos, sugerindo substituição de gás natural por biometano.

**Por que é forte:**

- Dados ANP são pequenos, limpos e mensais.
- Ociosidade é um insight acionável.
- Pitch é simples: “existe capacidade verde parada; vamos conectá-la à demanda fóssil”.
- Pode começar com análise por UF e evoluir para raio geográfico após geocoding.

**Demo mínima:** selecionar estado ou planta → mostrar capacidade, produção, ociosidade, consumidores potenciais e ranking de oportunidades.

---

### Caminho 2 — `Powershoring Location Score`

**Uma frase:** ranquear municípios para instalação de indústria verde usando energia renovável operacional, pipeline, transmissão e proxies industriais.

**Por que é forte:**

- Conecta diretamente com a tese de clusters industriais verdes.
- Usa SIGA + SIGET, os maiores datasets disponíveis.
- Serve para investidor industrial e gestor público.

**Risco:** precisa de dados externos de demanda industrial/logística para não virar apenas “ranking de MW”.

---

### Caminho 3 — `Fossil Replacement Radar`

**Uma frase:** mapear UTEs/polos fósseis e sugerir rotas de descarbonização por biometano, biomassa, renováveis ou eletrificação.

**Por que é forte:**

- Parte de uma dor concreta: reduzir gás, óleo e carvão.
- SIGA já identifica fonte fóssil, potência e município.
- ANP biometano dá uma alternativa real em alguns estados.

**Risco:** para quantificar impacto de CO₂ e custo, será preciso fator de emissão e consumo real.

---

## 9. Próximos passos práticos

1. **Criar camada limpa de dados:** normalizar CSVs para `data/processed` com encoding correto, números em padrão decimal e colunas renomeadas.
2. **Estruturar demanda industrial:** transformar `agente_eda_findings.md` em CSV de plantas siderúrgicas e puxar CEMPRE/RAIS por CNAE.
3. **Geocodificar municípios:** criar tabela município/UF/lat/lon/código IBGE para SIGA, ANP e indústria.
4. **Calcular métricas de score:** energia renovável operacional, pipeline renovável, UTE fóssil, ociosidade de biometano, densidade de transmissão.
5. **Escolher um fluxo de demo:** biometano é o caminho mais seguro; powershoring é mais estratégico, mas exige mais integrações.
6. **Documentar limitações no pitch:** separar “dado operacional”, “pipeline outorgado” e “proxy estimado”.

---

## 10. Conclusão

A pasta `data/` já tem material suficiente para uma tese de transição energética com dados reais. O ponto forte é a **oferta energética territorializada**: geração, transmissão e biometano. O ponto fraco é a **demanda industrial estruturada**: ainda falta uma base tabular ampla de consumidores, empregos, logística e custos.

A melhor leitura estratégica é: **não construir mais um mapa; construir uma camada de decisão sobre o mapa**. O caminho mais executável é biometano, porque a ociosidade é mensurável e imediatamente compreensível. O caminho mais ambicioso é powershoring, usando SIGA+SIGET como base para um score de localização industrial verde.

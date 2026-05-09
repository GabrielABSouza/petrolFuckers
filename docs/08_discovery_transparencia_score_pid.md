# Discovery e transparência — lacuna de score na PID

> **Data:** 09 mai 2026  
> **Escopo:** problemática da ausência de score, ranking e recomendação na Plataforma Interativa de Descarbonização (PID).  
> **Documento-base:** [`02_atlas_sintese.md`](02_atlas_sintese.md).  
> **Documentos de apoio:** [`03_fontes_dados.md`](03_fontes_dados.md), [`04_escopo_estrategia.md`](04_escopo_estrategia.md), [`06_eda_insights.md`](06_eda_insights.md), [`07_discovery_data_transicao_energetica.md`](07_discovery_data_transicao_energetica.md), [`RELATÓRIO_DE_FUNÇÕES.md`](RELATÓRIO_DE_FUNÇÕES.md).

---

## 1. Resumo executivo

A PID v2.0 é uma ferramenta poderosa de exploração territorial: ela permite visualizar infraestrutura energética, indústrias, projetos de hidrogênio e combinações de camadas em ambiente GIS. Porém, conforme sintetizado em `02_atlas_sintese.md`, seu output efetivo ainda é essencialmente um **mapa filtrado exportável como imagem**. A plataforma não entrega score, ranking, recomendação, simulação, indicadores derivados, comparação lado a lado ou exportação estruturada.

Essa lacuna cria o principal espaço de inovação para o MVP: transformar a PID de um **visualizador de camadas** em uma **camada explicável de apoio à decisão**.

A pergunta central do discovery é:

> Se a PID já mostra onde estão energia, infraestrutura, indústrias e projetos, por que o usuário ainda não consegue decidir rapidamente onde investir, priorizar ou descarbonizar?

A resposta é que a PID mostra **evidências espaciais**, mas não produz uma **síntese comparável**. Sem score, o usuário precisa interpretar manualmente múltiplas camadas, atribuir pesos mentalmente, comparar regiões sem método explícito e assumir riscos sem trilha de auditoria.

A oportunidade não é criar um score opaco. É criar um score **transparente, ajustável e auditável**, que deixe claro:

- **O que entrou no cálculo.**
- **Qual fonte foi usada.**
- **Qual peso foi aplicado.**
- **Qual variável puxou a nota para cima ou para baixo.**
- **Qual parte é dado observado, pipeline, proxy ou hipótese.**
- **Qual é o nível de confiança da recomendação.**

---

## 2. Evidências da lacuna na PID

### 2.1 O que a PID entrega hoje

De acordo com `02_atlas_sintese.md`, a PID v2.0 é um visualizador GIS em ArcGIS Experience com quatro abas principais:

| Aba | Função atual | Valor entregue |
|---|---|---|
| **Infraestrutura** | Visualização de hidrelétricas, sistemas isolados, linhas de transmissão, gasodutos, eólicas e solares | Mostra onde existe ou está planejada infraestrutura energética |
| **Indústrias** | Consumo por tipo de indústria e número de indústrias agregadas por região | Mostra concentração e perfil setorial em nível agregado |
| **Hidrogênio** | HUBs e projetos avançados/planejados | Mostra territórios associados à nova cadeia de H₂ |
| **PID** | Combinação livre de camadas, medição e salvamento do mapa | Permite exploração visual e geração de imagem |

A plataforma já organiza camadas essenciais para a tese de clusters industriais verdes, mas ainda depende da interpretação humana manual.

### 2.2 O que a PID não entrega

A lacuna funcional explícita listada em `02_atlas_sintese.md` inclui:

- **Score.**
- **Ranking.**
- **Recomendação.**
- **Simulação what-if.**
- **Custo logístico ou energético.**
- **Risco socioambiental cruzado.**
- **Comparação lado a lado.**
- **Indicadores derivados.**
- **Exportação de dados estruturados.**
- **Dados planta-a-planta no setor industrial.**

Para o hackathon, a lacuna mais relevante é o score porque ele funciona como ponte entre todas as outras capacidades: ranking, recomendação, comparação, explicação e priorização.

---

## 3. Problema descoberto

### 3.1 Formulação curta

A PID ajuda o usuário a ver camadas de oportunidade, mas não ajuda suficientemente a **decidir entre alternativas**.

### 3.2 Formulação completa

A tese do Atlas é que clusters industriais verdes emergem da interseção entre:

1. Infraestrutura de transporte e energia.
2. Disponibilidade de biomassa.
3. Localização de indústrias existentes.
4. Potenciais de energias renováveis.

A PID expõe camadas relacionadas a esses elementos, mas a interseção ainda precisa ser interpretada pelo usuário. Isso gera uma fricção crítica: quanto mais camadas a plataforma oferece, mais difícil fica transformar o mapa em uma decisão objetiva.

O problema não é falta de dado. O problema é falta de **mecanismo de síntese**.

### 3.3 Sintoma observado

Um usuário consegue responder:

> “Onde há energia renovável, linhas de transmissão, gasodutos ou projetos de hidrogênio?”

Mas tem dificuldade para responder:

> “Qual dessas localidades é melhor para instalar uma planta de amônia verde, metanol, fertilizante, aço verde ou biometano?”

Ou:

> “Qual região deve ser priorizada por um gestor público para atrair indústria verde?”

Ou:

> “Qual oportunidade tem maior impacto climático com menor risco de execução?”

---

## 4. Por que a falta de score é uma dor real

### 4.1 Dor cognitiva

Sem score, o usuário precisa fazer mentalmente tarefas como:

- Comparar energia operacional contra energia planejada.
- Avaliar proximidade de infraestrutura.
- Distinguir potencial renovável de capacidade conectável.
- Inferir demanda industrial a partir de camadas agregadas.
- Avaliar risco socioambiental fora da plataforma.
- Comparar territórios com critérios não padronizados.

Isso aumenta a carga cognitiva e favorece decisões baseadas em impressão visual.

### 4.2 Dor econômica

Para investidores industriais, a decisão locacional envolve CAPEX alto, risco de obra, logística, acesso a energia, licenciamento, mercado consumidor e reputação ESG. Sem uma camada comparativa, a PID vira insumo para consultoria, não ferramenta final de decisão.

O discovery em `06_eda_insights.md` já aponta o investidor industrial como persona muito subatendida: a PID mostra onde estão os recursos, mas não responde “onde instalar minha planta?”.

### 4.3 Dor política e institucional

Para gestores públicos, a ausência de score dificulta:

- Comparar estados ou municípios.
- Justificar prioridades de investimento.
- Identificar gargalos de infraestrutura.
- Construir narrativas de atração industrial.
- Monitorar metas e resultados.

Sem ranking transparente, a discussão fica mais sujeita a disputa narrativa e menos ancorada em critérios explícitos.

### 4.4 Dor de transparência

Paradoxalmente, a ausência de score também reduz transparência. Quando não há método explícito, cada usuário cria seu próprio score mental sem declarar pesos, premissas ou limitações.

Um score transparente não elimina subjetividade, mas torna a subjetividade visível.

---

## 5. Persona prioritária

### 5.1 Persona principal: investidor industrial

**Pergunta central:**

> Onde devo instalar uma planta industrial de baixo carbono no Brasil?

**Por que essa persona é prioritária:**

- Toma decisão de alto impacto econômico.
- Precisa comparar múltiplas localizações.
- Valoriza velocidade, clareza e justificativa.
- Depende de energia, infraestrutura, logística, risco e mercado.
- Sofre diretamente com a falta de ranking e recomendação.

### 5.2 Personas secundárias

| Persona | Como o score ajuda |
|---|---|
| **Gestor estadual** | Entende forças e lacunas do território para atração de investimento |
| **Formulador federal** | Prioriza infraestrutura, política industrial e incentivos |
| **Indústria existente** | Identifica rotas de descarbonização e fornecedores próximos |
| **Sociedade civil/academia** | Audita riscos socioambientais e impactos territoriais |

O score deve ser desenhado para o investidor, mas explicado de modo que possa ser auditado por gestores, academia e sociedade civil.

---

## 6. Jobs-to-be-done descobertos

### 6.1 Job principal

> Quando estou avaliando uma planta industrial verde, quero comparar localidades com critérios explícitos para escolher onde há maior viabilidade técnica, econômica, energética e socioambiental.

### 6.2 Jobs complementares

- **Comparar:** “Pecém ou Camaçari?”
- **Priorizar:** “Quais municípios entram no top 10?”
- **Explicar:** “Por que essa localidade ficou acima da outra?”
- **Simular:** “O que muda se logística pesar mais que energia?”
- **Auditar:** “Quais dados sustentam essa nota?”
- **Qualificar incerteza:** “Essa recomendação é baseada em dado observado ou em proxy?”

---

## 7. Hipótese de solução

### 7.1 Hipótese principal

Se a PID adicionar uma camada de score multi-critério, ajustável por pesos e acompanhada de explicação, então usuários conseguirão transformar camadas territoriais em decisões comparáveis com menor tempo, menor ambiguidade e maior rastreabilidade.

### 7.2 O que o score deve ser

O score deve ser:

- **Comparativo:** serve para comparar localidades, não para declarar uma verdade absoluta.
- **Setorial:** muda conforme a indústria-alvo.
- **Ponderável:** permite ajustar pesos conforme estratégia do usuário.
- **Explicável:** mostra os fatores que compõem a nota.
- **Auditável:** permite rastrear fonte, data, fórmula e transformação.
- **Honesto:** separa dado observado, pipeline, proxy e hipótese.

### 7.3 O que o score não deve ser

O score não deve ser:

- Uma “verdade oficial” sobre o melhor território.
- Uma caixa-preta sem justificativa.
- Um substituto de due diligence técnica, ambiental ou jurídica.
- Uma recomendação automática sem mostrar premissas.
- Um ranking único para todos os setores.
- Um número que mistura dados reais e estimativas sem distinção.

---

## 8. Proposta de score transparente

### 8.1 Fórmula conceitual

A fórmula inicial pode ser simples:

```text
score_total = soma(nota_dimensao × peso_dimensao) / soma(pesos_ativos)
```

Onde:

- `nota_dimensao` varia de 0 a 100.
- `peso_dimensao` é definido por perfil padrão ou pelo usuário.
- dimensões sem dado suficiente podem ser removidas, marcadas como proxy ou penalizadas conforme regra transparente.

### 8.2 Separar score de confiança

Uma decisão importante de transparência é **não misturar score e confiança no mesmo número**.

| Métrica | Pergunta que responde |
|---|---|
| **Score de atratividade** | “Essa localidade parece boa para o objetivo escolhido?” |
| **Nível de confiança** | “Quão confiáveis e completos são os dados usados para chegar nessa nota?” |

Exemplo:

| Localidade | Score | Confiança | Leitura correta |
|---|---:|---:|---|
| Município A | 86/100 | Alta | Forte candidato com boa base de dados |
| Município B | 91/100 | Baixa | Parece promissor, mas depende de proxies ou dados incompletos |

Isso evita vender como certeza uma recomendação que depende de pipeline, anúncio, geocoding aproximado ou dados agregados.

---

## 9. Dimensões candidatas do score

### 9.1 Score de localização para indústria verde

| Dimensão | Pergunta | Indicadores candidatos | Fontes candidatas | Status para MVP |
|---|---|---|---|---|
| **Energia limpa disponível** | Há energia renovável operacional ou potencial? | MW EOL/UFV/UHE operacional, pipeline renovável, fator de emissão regional | ANEEL SIGA, EPE, Atlas | Forte |
| **Prontidão elétrica** | A energia é conectável? | Linhas de transmissão, subestações, tensão, projetos SIGET | ANEEL SIGET, EPE WebMap | Médio |
| **Infraestrutura logística** | A produção consegue entrar/sair? | Proximidade a portos, ferrovias, rodovias, gasodutos | ANTAQ, ANTT, DNIT, EPE, PID | Médio/baixo no MVP |
| **Base industrial/demanda** | Há cadeia produtiva ou mercado próximo? | Indústrias por setor, empregos CNAE, plantas existentes, consumo energético | IBGE, RAIS/CEMPRE, associações setoriais, PID | Parcial |
| **Biomassa/biometano** | Há insumo renovável molecular ou agroindustrial? | Produção agrícola, plantas ANP, capacidade autorizada, ociosidade | ANP, IBGE PAM/PEVS, CIBiogás | Forte para biometano |
| **Risco socioambiental** | Há risco de conflito, desmatamento ou restrição? | PRODES/DETER, uso do solo, áreas protegidas, conformidade ambiental | Terrabrasilis, MapBiomas, Código Florestal | Baixo no MVP |
| **Aderência setorial** | O território combina com a indústria escolhida? | Regras específicas por setor | Atlas, literatura setorial, especialistas | Médio |

### 9.2 Dimensões mínimas para um MVP defensável

Para um MVP de 48h, a versão mínima deve evitar prometer tudo. Uma configuração defensável seria:

| Dimensão | Peso padrão sugerido | Justificativa |
|---|---:|---|
| **Energia renovável operacional** | 30% | Base da tese de powershoring |
| **Pipeline renovável com desconto de incerteza** | 15% | Sinal de futuro, mas não deve valer como operação |
| **Transmissão/prontidão de conexão** | 20% | Diferencia potencial de viabilidade |
| **Infraestrutura/logística proxy** | 15% | Necessária para decisão industrial |
| **Base industrial ou demanda próxima** | 10% | Evita ranking virar apenas “mapa de MW” |
| **Risco/limitações declaradas** | 10% | Garante leitura responsável e ESG |

Esses pesos devem ser ajustáveis. O valor principal não está no peso padrão, mas na transparência da ponderação.

---

## 10. Regras de transparência do score

### 10.1 Regra 1 — sempre mostrar a decomposição

O usuário nunca deve ver apenas:

> Pecém: 87/100

Ele deve ver:

| Dimensão | Nota | Peso | Contribuição |
|---|---:|---:|---:|
| Energia renovável | 92 | 30% | 27,6 |
| Transmissão/conexão | 80 | 20% | 16,0 |
| Logística | 88 | 15% | 13,2 |
| Base industrial | 76 | 10% | 7,6 |
| Risco socioambiental | 70 | 10% | 7,0 |
| Pipeline | 90 | 15% | 13,5 |
| **Total** | — | 100% | **84,9** |

### 10.2 Regra 2 — mostrar drivers positivos e negativos

Para cada localidade, o sistema deve gerar uma explicação curta:

| Tipo | Exemplo |
|---|---|
| **Puxa para cima** | Alta capacidade renovável operacional no entorno |
| **Puxa para cima** | Proximidade com porto ou hub industrial |
| **Puxa para baixo** | Baixa evidência de demanda industrial local |
| **Puxa para baixo** | Pipeline ainda não iniciado, tratado com desconto |
| **Atenção** | Risco socioambiental não avaliado por falta de integração Terrabrasilis |

### 10.3 Regra 3 — declarar tipo de evidência

Cada variável deve ser classificada por nível de evidência:

| Nível | Definição | Exemplo |
|---|---|---|
| **Observado** | Dado atual e operacional | Usina em operação na ANEEL SIGA |
| **Autorizado** | Dado outorgado/autorizado, mas não necessariamente operacional | Capacidade autorizada de biometano ANP |
| **Pipeline** | Projeto planejado ou não iniciado | UFV com construção não iniciada |
| **Proxy** | Aproximação usada porque o dado ideal não está disponível | Distância ao centroide municipal |
| **Declarativo** | Informação de anúncio, relatório ou plano | Projeto de H₂ anunciado |
| **Ausente** | Dado relevante não integrado | Risco socioambiental se Terrabrasilis não foi usado |

### 10.4 Regra 4 — penalizar pipeline com cuidado

A base `07_discovery_data_transicao_energetica.md` ressalta que pipeline não deve ser tratado como capacidade certa. Portanto:

- Energia operacional pode entrar com peso cheio.
- Energia em construção pode entrar com desconto moderado.
- Construção não iniciada deve entrar como sinal de intenção, com desconto alto.
- Projetos anunciados sem base operacional devem aparecer com baixa confiança.

### 10.5 Regra 5 — permitir pesos por perfil

O score deve permitir perfis pré-configurados:

| Perfil | Peso maior em | Uso |
|---|---|---|
| **Investidor exportador** | Porto, energia renovável, risco, infraestrutura | Amônia, metanol, SAF, H₂ |
| **Indústria eletrointensiva** | Energia operacional, transmissão, custo/estabilidade | Alumínio, aço, data centers verdes |
| **Gestor público** | Gap de infraestrutura, emprego, potencial de atração | Política industrial e investimento público |
| **Transição justa/ESG** | Risco socioambiental, impacto local, comunidades | Avaliação de clusters sensíveis |
| **Biometano/combustível renovável** | Ociosidade, demanda térmica, gasodutos, distância | Substituição de gás fóssil |

O score não deve impor uma única visão de mundo. Ele deve mostrar que cada decisão tem trade-offs.

---

## 11. Card de transparência recomendado

Cada resultado ranqueado deve ter um card como este:

```text
Localidade: Pecém / CE
Score: 85/100
Confiança: Média-alta
Perfil usado: Amônia verde para exportação
Pesos: energia 30%, logística 25%, transmissão 20%, base industrial 15%, risco 10%

Principais razões:
+ Forte pipeline renovável no CE
+ Hub de H₂ e vocação portuária
+ Boa aderência à tese de powershoring
- Parte relevante dos dados de H₂ é declarativa/anunciada
- Risco socioambiental ainda não integrado no cálculo

Dados usados:
- ANEEL SIGA: geração operacional e pipeline
- ANEEL SIGET: transmissão e subestações
- Atlas E+: clusters e setores prioritários
- PID/Atlas: hidrogênio, infraestrutura e indústria agregada

Limitações:
- Não estima LCOH real
- Não substitui due diligence ambiental
- Não confirma disponibilidade contratual de energia ou capacidade portuária
```

Esse card é tão importante quanto o número final. Sem ele, o score vira caixa-preta.

---

## 12. Riscos do uso de score

### 12.1 Risco de falsa precisão

Um número como `87/100` parece mais científico do que realmente é se o usuário não souber que parte da nota vem de proxies, pipeline ou dados agregados.

**Mitigação:** sempre mostrar intervalo, confiança ou selo de evidência.

### 12.2 Risco de enviesar decisões públicas

Um ranking pode favorecer regiões já mais bem mapeadas ou com melhor qualidade de dados, não necessariamente as mais promissoras.

**Mitigação:** separar “score de atratividade” de “score de completude de dados”.

### 12.3 Risco de invisibilizar impactos locais

Um cluster pode ter alta atratividade energética e logística, mas riscos socioambientais relevantes.

**Mitigação:** incluir dimensão ESG ou, no mínimo, alerta de risco não avaliado.

### 12.4 Risco de confundir potencial com viabilidade

Energia solar/eólica planejada não significa energia contratável, conectada ou disponível para indústria.

**Mitigação:** diferenciar operacional, construção, construção não iniciada e anúncio.

### 12.5 Risco de comparar setores diferentes com o mesmo critério

A melhor localização para alumínio verde não é necessariamente a melhor para SAF, fertilizante, aço ou biometano.

**Mitigação:** score setorial com pesos e regras específicas.

---

## 13. Decisões metodológicas recomendadas

### 13.1 Começar simples e auditável

Para o MVP, é melhor um score simples e explicável do que um modelo sofisticado e opaco.

Recomendação:

- Usar normalização simples 0–100.
- Aplicar pesos visíveis.
- Exibir decomposição da nota.
- Marcar fontes e limitações.
- Evitar machine learning no primeiro ciclo.

### 13.2 Priorizar score por município ou cluster

A PID atual trabalha com camadas territoriais e dados industriais agregados por região. Para o MVP, há duas granularidades possíveis:

| Granularidade | Vantagem | Risco |
|---|---|---|
| **Município** | Compatível com ANEEL, ANP, IBGE e narrativa de ranking | Pode faltar dado industrial granular |
| **Cluster/região** | Mais alinhado ao Atlas e menos sensível a ruído local | Menos acionável para investidor |

Recomendação: usar município quando houver dados suficientes; agrupar em cluster quando a granularidade for fraca.

### 13.3 Declarar defaults, mas deixar o usuário ajustar

O sistema deve ter pesos padrão para viabilizar a demo, mas o pitch deve destacar que o usuário pode alterar pesos.

Isso transforma o score em ferramenta de raciocínio, não em oráculo.

---

## 14. MVPs derivados da lacuna de score

### 14.1 Caminho A — Powershoring Location Score

**Pergunta respondida:**

> Onde instalar uma indústria verde eletrointensiva?

**Entrada do usuário:**

- Setor: amônia verde, metanol, aço, alumínio, fertilizantes, SAF.
- Peso dos critérios.
- Região de interesse.

**Saída:**

- Ranking top-N de municípios ou clusters.
- Score total.
- Decomposição por dimensão.
- Explicação e nível de confiança.

**Força:** altamente alinhado ao Atlas e à tese de clusters industriais verdes.

**Risco:** precisa de proxies para logística, custo e demanda industrial.

### 14.2 Caminho B — Biometano Matchmaker Score

**Pergunta respondida:**

> Qual oportunidade conecta biometano ocioso a demanda industrial ou fóssil próxima?

**Entrada do usuário:**

- Estado, planta, setor ou raio de busca.
- Critérios: ociosidade, distância, demanda fóssil, potencial de redução.

**Saída:**

- Ranking de oportunidades.
- Planta de biometano, capacidade autorizada, produção estimada e ociosidade.
- Consumidor ou polo potencial.
- Explicação da oportunidade.

**Força:** dados ANP são mais operacionais e o insight de ociosidade é direto.

**Risco:** amostra pequena e necessidade de geocodificar plantas/consumidores.

### 14.3 Caminho C — Radar de Substituição Fóssil

**Pergunta respondida:**

> Onde há maior oportunidade de substituir gás, óleo ou carvão por alternativa renovável?

**Entrada do usuário:**

- Fonte fóssil alvo.
- Região.
- Alternativa: biometano, biomassa, eletrificação, PPA renovável.

**Saída:**

- Ranking de UTEs, polos ou municípios.
- Score de substituição.
- Emissões evitáveis estimadas, se houver fator disponível.

**Força:** narrativa climática forte.

**Risco:** requer consumo real de combustível e fator de emissão para quantificar impacto com rigor.

---

## 15. Métricas de sucesso da solução

### 15.1 Métricas de produto

- Usuário consegue comparar pelo menos duas localidades em menos de 1 minuto.
- Usuário entende os 3 fatores que mais influenciaram o ranking.
- Usuário consegue alterar pesos e ver o ranking mudar.
- Usuário consegue exportar um resumo com fontes e limitações.

### 15.2 Métricas de confiança

- 100% das variáveis exibem fonte.
- 100% das variáveis indicam tipo de evidência.
- 100% dos scores exibem decomposição.
- 100% dos rankings exibem limitações.
- Nenhum dado de pipeline é apresentado como capacidade operacional.

### 15.3 Métricas de pitch

- A demo deixa claro que não é “mais um mapa”.
- O score responde uma pergunta decisória concreta.
- O número final vem acompanhado de justificativa.
- O time consegue explicar por que uma localidade ganhou de outra.

---

## 16. Perguntas de discovery para validar com usuários/mentores

### 16.1 Para investidores industriais

- Quais critérios eliminam uma localidade antes de qualquer análise profunda?
- Energia renovável disponível pesa mais que logística?
- Quanto pipeline pode ser considerado na decisão?
- Você prefere ranking nacional ou shortlist por região?
- Que nível de explicação torna o score confiável?

### 16.2 Para gestores públicos

- Que indicadores ajudariam a defender investimento em infraestrutura?
- O score deve comparar municípios dentro do estado ou estados entre si?
- Como evitar que o ranking prejudique regiões com menos dados?
- Quais dimensões sociais precisam aparecer?

### 16.3 Para especialistas técnicos

- Quais proxies são aceitáveis em um MVP?
- Como descontar projetos não iniciados?
- Que distância máxima faz sentido para energia, biometano, porto e gasoduto?
- Quais fatores tornam uma recomendação irresponsável?

---

## 17. Checklist de transparência para implementação

Antes de apresentar qualquer score, verificar:

- [ ] O objetivo do score está declarado.
- [ ] A persona e o setor estão declarados.
- [ ] A fórmula está visível.
- [ ] Os pesos estão visíveis.
- [ ] O usuário consegue alterar pesos.
- [ ] Cada variável tem fonte.
- [ ] Cada variável tem data ou versão.
- [ ] Cada variável tem tipo de evidência.
- [ ] Dados operacionais e pipeline aparecem separados.
- [ ] Proxies aparecem marcados como proxies.
- [ ] O score total mostra decomposição.
- [ ] O ranking mostra drivers positivos e negativos.
- [ ] Há nível de confiança separado do score.
- [ ] Há seção de limitações.
- [ ] O sistema evita linguagem de certeza absoluta.

---

## 18. Recomendação final

A ausência de score é a lacuna mais estratégica da PID porque concentra três problemas ao mesmo tempo:

1. **Problema de decisão:** o usuário vê camadas, mas não sabe qual alternativa priorizar.
2. **Problema de comparação:** regiões diferentes não são avaliadas por régua comum.
3. **Problema de transparência:** sem método explícito, os pesos e julgamentos ficam implícitos na cabeça do usuário.

A solução recomendada é criar uma camada de **score transparente de localização/oportunidade**, começando por um escopo estreito:

- **Mais seguro para 48h:** `Biometano Matchmaker Score`.
- **Mais alinhado à tese do Atlas:** `Powershoring Location Score`.

Em ambos os casos, a principal entrega não deve ser apenas um número. Deve ser um pacote decisório:

- ranking;
- decomposição;
- explicação;
- fonte;
- peso;
- confiança;
- limitação.

A frase-síntese para orientar o produto é:

> Não basta mostrar o mapa da transição energética. A PID precisa mostrar, com transparência, quais oportunidades parecem melhores, por quê, com quais dados e com qual grau de confiança.

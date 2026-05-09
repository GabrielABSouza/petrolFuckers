# Red team — problemas graves da solução de score/plataforma para a PID

> **Data:** 09 mai 2026  
> **Objetivo:** investigar falhas, riscos e pontos potencialmente fatais da solução proposta de criar uma plataforma/camada de score, ranking ou recomendação para a PID.  
> **Postura:** crítica adversarial. Este relatório não busca defender a ideia; busca quebrá-la antes da banca.  
> **Documentos analisados:** [`01_briefing.md`](01_briefing.md), [`02_atlas_sintese.md`](02_atlas_sintese.md), [`04_escopo_estrategia.md`](04_escopo_estrategia.md), [`06_eda_insights.md`](06_eda_insights.md), [`07_discovery_data_transicao_energetica.md`](07_discovery_data_transicao_energetica.md), [`08_discovery_transparencia_score_pid.md`](08_discovery_transparencia_score_pid.md).

---

## 1. Veredito executivo

A solução, do jeito que está formulada como **plataforma de score/ranking para decisão industrial ou investimento verde**, tem risco alto de perder força no hackathon por três motivos principais:

1. **Impacto social indireto demais:** a cadeia de valor passa por investidor, instalação industrial, execução futura e só depois chega à sociedade. Isso é fraco em pitch de 3 minutos quando comparado a soluções que mostram benefício direto para famílias, comunidades, escolas, municípios ou serviços públicos.
2. **Dependência de dados que não existem ou não estão prontos:** o score prometido exige demanda industrial granular, logística, custo, emissões, risco socioambiental, capacidade real de infraestrutura e dados georreferenciados. Os próprios documentos mostram que vários desses dados estão ausentes, agregados ou dependem de proxies.
3. **Risco de parecer uma consultoria B2B disfarçada de impacto público:** se a narrativa for “ajudar investidores a escolher onde instalar plantas”, a solução pode soar mais como ferramenta de eficiência de capital privado do que como tecnologia para acelerar uma transição energética justa.

**Conclusão dura:** não é seguro apresentar a solução como “plataforma para investidores decidirem onde instalar indústria verde”. Essa formulação é vulnerável. O score só se sustenta se for reposicionado como **camada pública de priorização, transparência e benefício social da transição energética**, com escopo muito menor e evidências diretas.

---

## 2. Hipótese atacada

A hipótese implícita nos documentos anteriores é:

> A PID já possui dados territoriais relevantes, mas não possui score/ranking/recomendação. Logo, criar um score transparente de localização ou oportunidade resolveria uma lacuna central e geraria valor para a transição energética.

Essa hipótese é parcialmente verdadeira, mas incompleta. Ela identifica uma lacuna funcional real, porém assume que preencher essa lacuna produzirá automaticamente impacto forte. Esse salto é perigoso.

Uma lacuna de produto não é necessariamente uma dor vencedora de hackathon.

---

## 3. Critérios de avaliação e exposição da solução

Segundo `01_briefing.md`, o pitch será avaliado por:

| Critério | Risco para a solução atual |
|---|---|
| **Potencial de impacto** | Alto risco: impacto social aparece indireto e futuro |
| **Viabilidade e potencial de implementação** | Risco médio/alto: dados críticos faltam ou exigem integração pesada |
| **Aderência ao desafio** | Risco médio: aderente à PID, mas pode parecer plataforma paralela |
| **Inovação da solução** | Risco médio: score ponderado/ranking pode parecer comum |
| **Qualidade da apresentação** | Risco alto: solução técnica demais para 3 minutos |

O tema oficial é:

> “Transforme dados em decisões para acelerar a transição energética do Brasil.”

A solução se encaixa em “dados em decisões”. O problema é que a decisão proposta pode parecer uma decisão de **investimento privado**, não uma decisão de **mudança social**.

---

## 4. Falhas potencialmente fatais

### 4.1 Falha 1 — impacto social indireto demais

A solução atual tende a seguir esta cadeia:

```text
score territorial → decisão de investidor → projeto industrial → descarbonização → empregos/impacto social
```

Essa cadeia é longa, incerta e dependente de atores externos.

Em hackathons, soluções fortes geralmente têm cadeia curta:

```text
dado → recomendação → ação → benefício percebido
```

Exemplos de impacto direto que competiriam melhor:

- reduzir conta de energia de famílias vulneráveis;
- priorizar escolas/hospitais para eficiência energética;
- substituir diesel em sistemas isolados;
- mapear pobreza energética;
- orientar municípios em risco climático;
- ajudar comunidades a entender projetos energéticos locais.

**Problema grave:** o score industrial pode ser tecnicamente correto, mas emocionalmente distante. A banca pode entender a lógica e ainda assim sentir que a solução não muda a vida de ninguém no curto prazo.

**Severidade:** alta.

---

### 4.2 Falha 2 — persona principal errada para a narrativa da E+

`04_escopo_estrategia.md` e `08_discovery_transparencia_score_pid.md` priorizam o **investidor industrial**. Isso é racional sob a ótica de produto, mas perigoso sob a ótica de missão.

A persona “investidor industrial” traz perguntas como:

> “Onde instalo minha planta?”

Essa pergunta não é socialmente ilegítima, mas pode soar desalinhada com uma narrativa de:

> “Não queremos vender, queremos gerar mudança.”

A solução corre o risco de parecer:

- ferramenta de due diligence;
- produto de consultoria;
- otimizador de CAPEX;
- SaaS para atração industrial;
- inteligência de localização para empresas.

Nenhuma dessas leituras é automaticamente ruim, mas todas são vulneráveis se a banca valorizar impacto público evidente.

**Severidade:** alta.

---

### 4.3 Falha 3 — “plataforma” pode parecer redundante com a própria PID

O briefing afirma que o objetivo é desenvolver soluções tecnológicas **para a PID**. A PID já é uma plataforma.

Se a equipe apresentar “uma nova plataforma”, pode surgir a pergunta:

> “Vocês estão expandindo a PID ou criando outra coisa ao lado?”

Isso ameaça a aderência ao desafio.

A solução precisa ser descrita como:

- camada;
- módulo;
- extensão;
- funcionalidade;
- plug-in conceitual;
- jornada dentro da PID.

Nunca como plataforma genérica independente.

**Severidade:** média/alta.

---

### 4.4 Falha 4 — score pode virar “ranking de MW”

`07_discovery_data_transicao_energetica.md` reconhece que a base forte é oferta energética, não demanda industrial. O próprio documento afirma que falta base tabular ampla de consumidores, empregos, logística e custos.

Sem esses dados, o ranking corre o risco de ser basicamente:

```text
municípios com mais renovável + algum pipeline + alguma transmissão
```

Isso não responde adequadamente onde instalar indústria. Responde onde há energia.

A banca técnica pode questionar:

- onde está a demanda industrial?
- onde está a logística real?
- onde está custo de conexão?
- onde está disponibilidade contratual de energia?
- onde está licenciamento?
- onde está mão de obra?
- onde está risco socioambiental?

Se essas respostas forem “proxy”, o score perde autoridade.

**Severidade:** alta.

---

### 4.5 Falha 5 — falsa precisão do score

Um score como `87/100` cria uma sensação de precisão que os dados não sustentam.

O problema não é usar pesos. O problema é que pesos e normalizações podem parecer arbitrários:

```text
energia 30%, porto 25%, gasoduto 20%, mão de obra 15%, logística 10%
```

Perguntas que podem desmontar o score:

- Quem definiu esses pesos?
- Por que energia vale 30% e não 50%?
- Como normalizou distância, MW, risco e emprego na mesma escala?
- Um município com 5 GW planejados mas nada construído deve ganhar de outro com 1 GW operacional?
- Como o score muda se o setor for aço, vidro, amônia ou SAF?
- O score foi validado com especialistas?

Sem validação, o score pode parecer “número bonito”.

**Severidade:** alta.

---

### 4.6 Falha 6 — dados de pipeline podem inflar oportunidade falsa

Os documentos reconhecem que pipeline não é capacidade garantida. `07_discovery_data_transicao_energetica.md` alerta que construção não iniciada deve ser tratada como sinal de intenção, não como realidade.

Se o pitch disser:

> “Aqui há 15 GW de potencial renovável para uma planta industrial.”

A banca pode perguntar:

- está em operação?
- está em construção?
- tem acesso à rede?
- tem contrato de conexão?
- tem licença?
- tem comprador?
- tem restrição ambiental?

Pipeline pode nunca sair do papel. Usá-lo como atratividade territorial sem desconto forte pode gerar recomendação enganosa.

**Severidade:** alta.

---

### 4.7 Falha 7 — transmissão não significa capacidade disponível

A presença de linha de transmissão ou subestação não prova que existe capacidade disponível para conectar uma nova planta.

O score pode cometer um erro clássico:

```text
infraestrutura próxima = viabilidade
```

Mas proximidade não equivale a:

- capacidade remanescente;
- conexão autorizada;
- estabilidade do sistema;
- viabilidade econômica;
- prazo de acesso;
- ausência de congestionamento;
- disponibilidade contratual.

`07_discovery_data_transicao_energetica.md` também reconhece que a SIGET não traz geometria pronta e que faltam dados de capacidade disponível.

**Severidade:** alta.

---

### 4.8 Falha 8 — dados industriais são fracos para uma solução industrial

A própria síntese da PID indica que dados industriais estão agregados por região e não planta-a-planta. O EDA também reconhece que a granularidade industrial é fraca fora de alguns casos como aço.

Isso é grave porque a proposta é justamente apoiar decisão industrial.

Sem planta, setor, consumo energético, combustível usado, capacidade produtiva e localização precisa, a solução opera no escuro sobre a demanda.

Risco: recomendar local com energia, mas sem cadeia produtiva, fornecedores, mercado, mão de obra ou demanda real.

**Severidade:** alta.

---

### 4.9 Falha 9 — biometano “ocioso” pode não estar realmente disponível

A narrativa de biometano ocioso é forte, mas pode ser tecnicamente frágil se interpretada como molécula disponível para uso imediato.

Possíveis problemas:

- capacidade autorizada não é capacidade física plenamente instalada;
- produção por UF não permite utilização real por planta;
- baixa utilização pode refletir falta de feedstock, manutenção, mercado, contrato, qualidade do gás ou restrição logística;
- biometano pode não estar conectado a gasoduto;
- transporte por caminhão depende de compressão, logística e custo;
- consumidor industrial pode exigir especificação, pressão e regularidade;
- substituição de gás fóssil depende de contrato, queimadores, processo e regulação.

O risco é vender “ociosidade” como oportunidade imediata quando ela pode ser apenas um artefato regulatório ou operacional.

**Severidade:** média/alta.

---

### 4.10 Falha 10 — risco socioambiental aparece como promessa, não como dado

`08_discovery_transparencia_score_pid.md` propõe risco socioambiental como dimensão, mas `06_eda_insights.md` e `07_discovery_data_transicao_energetica.md` deixam claro que Terrabrasilis, MapBiomas, Código Florestal e bases sociais não foram integrados.

Isso cria um problema ético e narrativo:

- a solução fala em transição justa;
- mas não mede justiça;
- fala em risco socioambiental;
- mas não cruza comunidades, desmatamento, terras indígenas, unidades de conservação, vulnerabilidade ou saúde.

Se o score recomenda um território com alto potencial energético, mas ignora conflito ambiental/local, ele pode reforçar injustiça territorial.

**Severidade:** alta.

---

### 4.11 Falha 11 — inovação pode ser percebida como baixa

Score ponderado, ranking e mapa são soluções comuns em hackathons.

A banca pode pensar:

> “Vocês pegaram dados públicos, normalizaram e fizeram um ranking.”

Para parecer inovador, o produto precisaria ter uma tese realmente diferenciada:

- transparência radical;
- auditabilidade pública;
- benefício social mensurável;
- simulação de trade-offs;
- explicação de riscos;
- participação social;
- priorização de transição justa.

Sem isso, o score é funcional, mas não necessariamente original.

**Severidade:** média.

---

### 4.12 Falha 12 — solução ampla demais para 37 horas

O briefing corrigido indica aproximadamente 37 horas líquidas, não 48h. A solução sugerida envolve:

- pipeline de dados;
- normalização;
- geocoding;
- score;
- mapa;
- interface;
- narrativa;
- documentação;
- pitch de 3 minutos;
- validação mínima;
- deploy ou demo funcional.

Isso é muita coisa.

O risco é entregar:

- dashboard incompleto;
- score sem confiança;
- mapa sem polimento;
- narrativa confusa;
- dados não auditáveis;
- pitch técnico demais.

A solução só é viável se for brutalmente reduzida a um caso de uso único.

**Severidade:** alta.

---

### 4.13 Falha 13 — “dados da PID” podem não ser diretamente acessíveis

`02_atlas_sintese.md` diz que o output efetivo da PID é screenshot e que não há API, CSV ou JSON. `04_escopo_estrategia.md` lista como risco: dados da PID não baixáveis/só visualização.

Isso significa que a equipe provavelmente não construirá sobre a PID real, mas sobre fontes originais reconstruídas:

- ANEEL;
- ANP;
- IBGE;
- EPE;
- documentos do Atlas.

A banca pode aceitar isso, mas também pode questionar:

> “Como isso se integra à PID?”

Se a resposta for apenas “é inspirado na PID”, a aderência enfraquece.

**Severidade:** média/alta.

---

### 4.14 Falha 14 — ausência de validação com usuário real

A solução assume dores de investidores, gestores e sociedade civil, mas não há evidência de entrevistas ou validação com esses usuários no material atual.

Isso é especialmente frágil para claims como:

- “investidor precisa disso”;
- “gestor usaria isso”;
- “sociedade civil auditaria isso”;
- “isso aceleraria a transição”.

Sem validação, o pitch depende de plausibilidade, não de evidência de usuário.

**Severidade:** média.

---

### 4.15 Falha 15 — risco de greenwashing algorítmico

Um score pode legitimar projetos “verdes” sem verificar seus impactos reais.

Exemplo de falha:

```text
Alta energia renovável + porto próximo + pipeline H₂ = local recomendado
```

Mas o local pode ter:

- conflito fundiário;
- impacto sobre comunidades tradicionais;
- desmatamento recente;
- estresse hídrico;
- pouca geração de emprego local;
- benefícios capturados por grandes empresas;
- risco de exportar energia limpa enquanto território local segue vulnerável.

Se o score não mede isso, ele pode acelerar uma transição energética injusta.

**Severidade:** alta.

---

### 4.16 Falha 16 — contradição entre “transição justa” e “powershoring”

O conceito de powershoring é estratégico para o Brasil, mas pode ser lido de duas formas:

1. **Positiva:** atrair indústria limpa, gerar valor, descarbonizar cadeias globais.
2. **Crítica:** reorganizar território brasileiro para servir cadeias globais, com risco de repetir extrativismo verde.

Se a solução só otimiza localização para indústria exportadora, ela pode parecer próxima da segunda leitura.

A narrativa precisa responder:

> Quem ganha com a indústria verde?  
> Quem decide?  
> Quem arca com os impactos?  
> Como o território local participa?  
> Qual benefício fica na comunidade?

Sem isso, a solução fica vulnerável politicamente.

**Severidade:** alta.

---

## 5. Perguntas que podem derrubar o pitch

### 5.1 Perguntas sobre impacto

- Qual pessoa ou comunidade se beneficia diretamente amanhã?
- Como vocês medem benefício social, não apenas oportunidade econômica?
- Quantas pessoas seriam impactadas no caso demonstrado?
- Qual problema cotidiano essa solução resolve?
- Por que isso é melhor do que um mapa de pobreza energética ou sistemas isolados?

### 5.2 Perguntas sobre dados

- Quais dados vêm da PID e quais foram reconstruídos de bases externas?
- O dado é operacional, outorgado, planejado ou anúncio?
- Como vocês tratam projetos que nunca sairão do papel?
- Como sabem que há capacidade disponível na transmissão?
- Como sabem que há demanda industrial real no território?
- Como validaram distância e geocoding?

### 5.3 Perguntas sobre score

- Quem definiu os pesos?
- Por que esses critérios são os corretos?
- Como o score foi validado?
- O ranking muda muito se eu mudar os pesos?
- Como vocês evitam falsa precisão?
- O que acontece quando falta dado?

### 5.4 Perguntas éticas

- Como a solução evita greenwashing?
- Como incorpora comunidades afetadas?
- Como trata risco socioambiental?
- Como evita beneficiar só territórios já ricos em infraestrutura?
- Como impede que regiões vulneráveis sejam penalizadas por falta de dados?

### 5.5 Perguntas de viabilidade

- Isso funciona dentro da PID ou é outra plataforma?
- Dá para implementar com os dados disponíveis hoje?
- O protótipo está usando dados reais ou dados mockados?
- O que fica pronto no hackathon e o que é só visão futura?

---

## 6. Pontos em que a solução está superestimando sua força

| Claim provável | Problema |
|---|---|
| “A PID tem 80% dos dados necessários” | Talvez tenha camadas visuais, mas não dados estruturados, exportáveis e granulares suficientes para score robusto |
| “Falta só uma camada de score” | Falta demanda industrial, custo, logística, risco, capacidade disponível e validação de pesos |
| “Biometano ocioso é oportunidade imediata” | Ociosidade regulatória ou de processamento não prova disponibilidade comercial, logística ou técnica |
| “Score transparente resolve subjetividade” | Transparência mostra subjetividade, mas não valida a metodologia |
| “Investidor é a persona com maior ROI” | Pode ser a persona com maior valor econômico, mas não necessariamente maior impacto social percebido |
| “Todos se beneficiam se o investidor decidir melhor” | Esse benefício é indireto e não garantido |
| “Ranking é inovação” | Ranking ponderado é comum; inovação depende da tese, dados e experiência |
| “Powershoring é socialmente positivo” | Pode ser, mas precisa provar benefício local e transição justa |

---

## 7. Risco por caminho de MVP

### 7.1 Powershoring Location Score

**Risco geral:** alto.

**Problemas graves:**

- impacto social indireto;
- depende de proxies;
- H₂ e projetos industriais podem ser anúncios;
- demanda industrial municipal fraca;
- logística e custo não estão prontos;
- risco de parecer ferramenta de investidor.

**Quando faz sentido:** apenas se reposicionado como score público de benefício territorial e se o pitch mostrar um caso humano concreto.

**Veredito:** não recomendado como narrativa principal se a equipe quer maximizar impacto social percebido.

---

### 7.2 Biometano Matchmaker Score

**Risco geral:** médio.

**Pontos fortes reais:**

- dados ANP são mais concretos;
- ociosidade é fácil de comunicar;
- substituição fóssil é tangível;
- escopo menor.

**Problemas graves:**

- amostra pequena;
- produção por UF não prova utilização por planta;
- falta geocodificação precisa;
- demanda industrial ainda precisa ser estruturada;
- benefício social pode continuar indireto se focar só em indústria.

**Quando faz sentido:** se a narrativa for economia circular, redução de metano/resíduos, substituição fóssil local e benefício territorial.

**Veredito:** melhor caminho técnico, mas precisa ganhar camada social explícita.

---

### 7.3 Fossil Replacement Radar

**Risco geral:** médio/alto.

**Pontos fortes reais:**

- parte de uma dor concreta: reduzir gás, óleo e carvão;
- conecta melhor com clima;
- pode ser mais direto que localização industrial.

**Problemas graves:**

- falta consumo real de combustível;
- faltam fatores de emissão e custos;
- substituição técnica não é trivial;
- pode virar mapa de UTEs sem recomendação acionável.

**Quando faz sentido:** se escolher um caso muito específico, com cálculo simples e honesto de emissões potenciais.

**Veredito:** bom para narrativa climática, arriscado para cálculo robusto.

---

## 8. Sinais de que a solução deve ser pivotada

Se qualquer uma das frases abaixo for verdadeira perto da entrega, a solução deve pivotar ou reduzir escopo:

- “Não conseguimos dizer quem se beneficia diretamente.”
- “O score é basicamente MW renovável com pesos.”
- “Não temos como explicar os pesos em 20 segundos.”
- “A demo parece uma versão piorada da PID.”
- “Estamos prometendo risco socioambiental, mas não integramos dados socioambientais.”
- “Estamos usando pipeline como se fosse operação.”
- “Não conseguimos separar dado observado, proxy e hipótese.”
- “A banca precisa acreditar em muita coisa futura para ver impacto.”
- “O pitch começa com investidor, CAPEX ou consultoria.”

---

## 9. O que salvar da ideia

A ideia não precisa ser descartada por completo. O que deve ser salvo:

- a lacuna real de score/ranking/recomendação na PID;
- a necessidade de transformar dados em decisão;
- a transparência metodológica;
- o uso de dados públicos;
- a separação entre dado observado, pipeline, proxy e hipótese;
- a possibilidade de comparar alternativas territoriais.

O que deve ser abandonado ou rebaixado:

- foco moral no investidor;
- promessa de “melhor lugar para instalar planta”;
- score amplo demais;
- ranking nacional genérico;
- linguagem de plataforma independente;
- claims de impacto social sem métrica direta;
- qualquer aparência de caixa-preta.

---

## 10. Reposicionamento mínimo para sobreviver

A formulação fraca é:

> “Uma plataforma que ajuda investidores a encontrar a melhor localização para indústrias verdes.”

A formulação mais defensável é:

> “Uma camada da PID que prioriza oportunidades de transição energética com base em viabilidade, emissões evitáveis, benefício social e transparência dos dados.”

A diferença é crítica.

Na segunda formulação:

- o usuário principal pode ser E+, gestor público ou sociedade civil técnica;
- o investidor vira usuário secundário;
- o score mede benefício público, não só atratividade econômica;
- a solução fica mais aderente à ideia de mudança social;
- o pitch pode mostrar quem ganha e qual risco é evitado.

---

## 11. Escopo recomendado se a equipe insistir no score

### 11.1 Não fazer

- Não fazer score nacional para todos os setores.
- Não fazer “plataforma completa”.
- Não prometer custo LCOH/LCOE se não calcular.
- Não prometer risco socioambiental se não integrar dados.
- Não vender ranking como recomendação definitiva.
- Não focar o pitch em investidor estrangeiro.

### 11.2 Fazer

- Um único fluxo.
- Um único problema.
- Uma única pergunta.
- Um único tipo de decisão.
- Uma explicação transparente.
- Um indicador social simples.
- Uma limitação explícita.

Exemplo de pergunta aceitável:

> “Onde há oportunidade de substituir gás fóssil por biometano já autorizado, com maior potencial de benefício territorial e menor incerteza de dados?”

Ou:

> “Quais sistemas/territórios devem ser priorizados porque combinam dependência fóssil, vulnerabilidade social e alternativa renovável próxima?”

---

## 12. Critérios de corte para a versão final

A solução só deve ir para o pitch se conseguir responder com clareza:

| Pergunta | Resposta mínima necessária |
|---|---|
| Quem é o usuário principal? | Não pode ser genérico; preferir gestor/E+/sociedade técnica se foco for impacto |
| Quem se beneficia? | Pessoa, comunidade, município ou território identificável |
| Qual decisão muda? | Priorizar projeto, substituir fóssil, orientar política, auditar risco |
| Qual dado sustenta? | Fonte, data, granularidade e tipo de evidência |
| O que é proxy? | Declarado explicitamente |
| Qual impacto direto? | Emissões, custo, saúde, população, empregos ou vulnerabilidade |
| Qual limitação? | Clara, curta e honesta |
| Por que não é só mapa? | Porque gera priorização, explicação e transparência |

Se a equipe não conseguir responder essas perguntas, o projeto está fraco.

---

## 13. Recomendação final red team

**Não apresentar a solução como plataforma de score para investidor industrial.** Essa versão é vulnerável em impacto social, narrativa e dados.

**Apresentar, no máximo, como uma camada de decisão pública para a PID**, com foco em priorizar oportunidades de transição energética que combinem:

- viabilidade técnica;
- redução de fóssil;
- benefício social;
- risco socioambiental;
- transparência de dados;
- nível de confiança.

Se a equipe quer maximizar chance no hackathon, o melhor caminho é reduzir o produto a um caso concreto e socialmente legível.

Ordem recomendada:

1. **Melhor equilíbrio técnico/narrativo:** biometano ocioso + substituição fóssil + benefício territorial.
2. **Maior impacto social direto, se houver dados:** sistemas isolados/diesel + renováveis + comunidades.
3. **Mais estratégico, porém arriscado:** powershoring com score de transição justa.
4. **Pior formulação para pitch:** plataforma de localização para investidor.

A frase mais honesta para guiar a decisão é:

> A lacuna de score na PID é real, mas um score ruim pode piorar a decisão. A solução só vale se tornar a transição mais justa, auditável e acionável — não apenas se ranquear territórios para investimento.

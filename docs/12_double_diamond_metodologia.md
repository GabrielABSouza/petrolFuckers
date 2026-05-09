# Double Diamond — metodologia aplicada ao Radar PID

> **Objetivo:** explicitar como a documentação do projeto evidencia um processo de Double Diamond: primeiro para entender o problema certo da PID, depois para encontrar uma solução de MVP tecnicamente defensável.  
> **Leitura-chave:** o segundo diamante se fecha em [`11_relatorio_afunilamento_escopo_pid.md`](11_relatorio_afunilamento_escopo_pid.md), que converte a exploração anterior em escopo final.

---

## 1. Leitura geral

O projeto não partiu diretamente para uma solução. A documentação mostra um movimento de alternância entre abertura e fechamento:

```text
PROBLEMA                                      SOLUÇÃO

Descobrir  ──────── Definir        Desenvolver ──────── Entregar
   abrir              fechar           abrir              fechar

Entender PID,       Formular o        Explorar           Afunilar para
Atlas, dados,       problema:         caminhos de        um MVP com dados
usuários, lacunas   "mapa não         solução, riscos,   disponíveis,
e critérios         vira decisão"     narrativas e       limitações
                                      alternativas       explícitas
```

Em termos práticos, o Double Diamond aparece assim:

1. **Primeiro diamante:** sair do briefing amplo do hackathon e chegar a uma formulação clara do problema da PID.
2. **Segundo diamante:** sair de várias hipóteses de produto e chegar a um Radar PID enxuto, baseado apenas em dados sustentáveis em 37h.

---

## 2. Diamante 1 — entender o problema certo

### 2.1 Descobrir

**Pergunta da etapa:** o que é a PID, qual é o desafio do hackathon, quais dados existem e onde estão as lacunas?

**Documentos que evidenciam a etapa:**

| Documento | Papel na descoberta |
|---|---|
| [`01_briefing.md`](01_briefing.md) | Define tema, critérios de avaliação, restrições de entrega, trilhas e regra de 37h. |
| [`02_atlas_sintese.md`](02_atlas_sintese.md) | Traduz a tese do Atlas E+: powershoring, clusters industriais verdes, Consenso de Belém e lacunas da PID. |
| [`03_fontes_dados.md`](03_fontes_dados.md) | Mapeia fontes oficiais e auxiliares, separando o que é desejável do que cabe no MVP. |
| [`RELATÓRIO_DE_FUNÇÕES.md`](RELATÓRIO_DE_FUNÇÕES.md) | Reconstrói as funções da PID como plataforma de inteligência territorial baseada em camadas. |
| [`RELATÓRIO_DE_HIPÓTESES_E_DISCOVERY_TRANSIÇÃO_ENERGÉTICA.md`](RELATÓRIO_DE_HIPÓTESES_E_DISCOVERY_TRANSIÇÃO_ENERGÉTICA.md) | Abre o campo para impacto cotidiano, transição justa, saúde, renda, moradia, mobilidade e cidadania. |
| [`07_safmaps_integration.md`](07_safmaps_integration.md) | Amplia o repertório de dados com camadas WFS de indústria, biomassa, logística e risco socioambiental. |
| [`08_ibge_dados.md`](08_ibge_dados.md) | Identifica o IBGE como espinha dorsal estatística para um dataframe municipal. |
| [`09_benchmark_mercado.md`](09_benchmark_mercado.md) | Compara soluções de mercado e mostra o espaço de diferenciação: sair de inventário/dashboard para decisão acionável. |

**Resultado da descoberta:** a PID é forte como visualizador GIS e repositório de camadas, mas fraca como mecanismo de decisão. Ela mostra evidências espaciais, porém não entrega score, ranking, recomendação, simulação, comparação, exportação estruturada ou relatório acionável por persona.

### 2.2 Definir

**Pergunta da etapa:** qual problema específico vale resolver no hackathon?

**Documentos que fecham o primeiro diamante:**

| Documento | Contribuição para a definição |
|---|---|
| [`04_escopo_estrategia.md`](04_escopo_estrategia.md) | Cria o princípio-guia: escolher uma persona, um momento de decisão e uma camada nova de inteligência. |
| [`05_perguntas_abertas.md`](05_perguntas_abertas.md) | Registra incertezas críticas sobre PID, dados, avaliação, trilha e posicionamento como extensão da plataforma. |
| [`06_eda_insights.md`](06_eda_insights.md) | Usa EDA para transformar hipóteses em evidências: mismatch energia-indústria, biometano ocioso e caminhos possíveis de MVP. |
| [`08_discovery_transparencia_score_pid.md`](08_discovery_transparencia_score_pid.md) | Formula a lacuna central: a PID mostra camadas, mas não ajuda o usuário a decidir entre alternativas. |

**Problema definido:**

> A PID permite explorar camadas territoriais relevantes para descarbonização, mas não transforma essas camadas em uma decisão comparável, explicável, auditável e priorizada.

**Critérios de sucesso derivados:**

- A solução precisa ser uma **camada sobre a PID**, não uma plataforma paralela.
- A entrega deve gerar **decisão**, não apenas visualização.
- O score deve ser **transparente**, com fonte, peso, tipo de evidência, decomposição e limitações.
- O escopo deve caber em **37h**, com dados já disponíveis ou integráveis rapidamente.

---

## 3. Diamante 2 — encontrar a solução certa

### 3.1 Desenvolver

**Pergunta da etapa:** que soluções poderiam responder ao problema definido?

**Documentos que abrem o segundo diamante:**

| Documento | Alternativas ou testes gerados |
|---|---|
| [`06_eda_insights.md`](06_eda_insights.md) | Propõe três caminhos: matchmaking biometano-indústria, score de localização para H2/powershoring e mismatch map/radar de oportunidade. |
| [`07_discovery_data_transicao_energetica.md`](07_discovery_data_transicao_energetica.md) | Inventaria os dados reais em mãos e deriva hipóteses de produto: Biometano Matchmaker, Powershoring Location Score, Transmission Readiness Score e Fossil Replacement Radar. |
| [`08_discovery_transparencia_score_pid.md`](08_discovery_transparencia_score_pid.md) | Detalha a solução de score transparente: decomposição, pesos ajustáveis, confiança separada do score e tipo de evidência. |
| [`09_red_team_riscos_solucao_score_pid.md`](09_red_team_riscos_solucao_score_pid.md) | Testa adversarialmente a solução, mostrando riscos de impacto indireto, dados ausentes, falsa precisão e narrativa B2B. |
| [`10_discovery_solucoes_fora_da_caixa.md`](10_discovery_solucoes_fora_da_caixa.md) | Expande alternativas com impacto social mais direto: bioenergia rural, saúde pública, resiliência municipal, justiça energética, escolas e envelhecimento. |

**Alternativas consideradas:**

- **Biometano Matchmaker:** conectar capacidade de biometano ociosa a consumidores industriais ou cargas fósseis próximas.
- **Powershoring Location Score:** ranquear municípios ou clusters para instalação de indústria verde.
- **Fossil Replacement Radar:** priorizar locais onde gás, óleo ou carvão poderiam ser substituídos por alternativas renováveis.
- **Transmission Readiness Score:** diferenciar potencial energético de prontidão de conexão.
- **Soluções sociais fora da caixa:** energia para idosos, bioenergia rural, resiliência de sistemas isolados, saúde pública e escolas sustentáveis.

**Aprendizado da divergência:** a oportunidade de score era real, mas a versão ampla, voltada a "melhor localização para investidor industrial", era vulnerável. Ela exigia dados não confirmados, criava risco de falsa precisão e tinha impacto social indireto demais para o pitch.

### 3.2 Entregar

**Pergunta da etapa:** qual solução deve sobreviver ao corte final?

O fechamento ocorre em [`11_relatorio_afunilamento_escopo_pid.md`](11_relatorio_afunilamento_escopo_pid.md). O documento aplica um critério simples e forte:

> Só entra no MVP o que os dados disponíveis sustentam com confiança.

**Escopo final:**

| Elemento | Decisão final |
|---|---|
| Nome | **Radar de Oportunidades Energéticas — Priorização de Territórios para Transição** |
| Tese | Priorizar municípios e clusters onde energia renovável operacional, infraestrutura de transmissão e biometano ocioso criam condições reais para substituição fóssil ou atração de carga limpa. |
| Usuário reposicionado | Gestor público, formulador de política, E+ e sociedade técnica; investidor passa a ser usuário secundário. |
| Demo sugerida | **Vale do São Francisco: da fóssil à renovável**. |
| Critério de corte | Dados disponíveis em ANEEL SIGA, ANEEL SIGET, ANP Biometano e IBGE/malha municipal. |

**Score final reduzido a quatro dimensões:**

| Dimensão | Peso | Fonte | Por que sobreviveu ao afunilamento |
|---|---:|---|---|
| Energia Limpa Disponível | 40% | ANEEL SIGA | Dado mais robusto; usa energia operacional, não apenas pipeline. |
| Prontidão de Conexão | 30% | ANEEL SIGET | Introduz viabilidade de escoamento/conexão sem prometer capacidade contratual. |
| Gás Renovável Ocioso | 20% | ANP Biometano | Insight acionável e fácil de comunicar: capacidade autorizada subutilizada. |
| Carga Fóssil Substituível | 10% | ANEEL SIGA | Ancora o score em impacto climático real: substituir geração fóssil. |

**Exclusões metodológicas explícitas:**

- Demanda industrial granular.
- Logística multimodal.
- Mercado consumidor.
- Risco socioambiental detalhado.
- Disponibilidade hídrica, temperatura e infraestrutura de telecom.
- Demo de data centers.

Essas exclusões são parte da entrega, não uma fraqueza. Elas mostram que o projeto escolheu transparência e defensibilidade em vez de prometer uma plataforma completa sem dados suficientes.

---

## 4. Como a metodologia foi aplicada

### 4.1 Abertura por evidência, não por opinião

O projeto abriu o primeiro diamante coletando contexto regulatório, tese institucional, funcionamento da PID, fontes de dados, benchmarks e hipóteses de impacto humano. A abertura não foi brainstorming solto: cada caminho precisava se apoiar em documentos, fontes ou dados públicos.

### 4.2 Fechamento por decisão explícita

O primeiro fechamento aconteceu quando a equipe traduziu a lacuna ampla da PID em um problema de produto: **transformar camadas em decisão**. O princípio de `04_escopo_estrategia.md` ("uma persona + um momento de decisão + uma camada nova de inteligência") funcionou como regra de convergência.

### 4.3 Segunda abertura com múltiplas soluções possíveis

O segundo diamante abriu várias respostas ao problema: score locacional, matchmaking, radar de substituição fóssil, prontidão de transmissão e alternativas com impacto social direto. Essa fase também incluiu red team, que é uma forma de divergência crítica: não gerar mais ideias, mas gerar objeções fortes contra a ideia favorita.

### 4.4 Fechamento por sustentação dos dados

O fechamento final não escolheu a ideia mais ambiciosa. Escolheu a mais defensável diante das restrições de tempo, dados e banca técnica. A pergunta decisiva foi:

> Onde nossos dados respondem com precisão, sem depender de proxies frágeis?

Essa pergunta leva diretamente ao escopo de `11_relatorio_afunilamento_escopo_pid.md`: um radar menor, transparente, com quatro dimensões calculáveis e limitações assumidas.

---

## 5. Rastreabilidade das decisões

| Decisão | Evidência documental | Resultado |
|---|---|---|
| Não criar "mais um dashboard" | `01`, `02`, `04`, `09_benchmark_mercado.md` | Posicionar como camada de decisão sobre a PID. |
| Priorizar decisão comparável e auditável | `08_discovery_transparencia_score_pid.md` | Score com decomposição, fonte, peso, evidência e confiança. |
| Evitar score industrial amplo | `09_red_team_riscos_solucao_score_pid.md` | Reduzir escopo e reposicionar usuário para impacto público. |
| Usar dados realmente disponíveis | `06_eda_insights.md`, `07_discovery_data_transicao_energetica.md` | Concentrar em SIGA, SIGET e ANP Biometano. |
| Dar peso a impacto direto | `10_discovery_solucoes_fora_da_caixa.md`, `09_red_team_riscos_solucao_score_pid.md` | Incluir substituição fóssil e biometano ocioso na narrativa. |
| Fechar MVP em 4 dimensões | `11_relatorio_afunilamento_escopo_pid.md` | Radar de Oportunidades Energéticas. |

---

## 6. Conclusão

A documentação mostra um Double Diamond completo:

- **Descobrir:** entender desafio, PID, Atlas, fontes, usuários, benchmarks e hipóteses de impacto.
- **Definir:** formular a lacuna central: a PID mostra camadas, mas não transforma dados em decisão.
- **Desenvolver:** explorar caminhos de score, matchmaking, substituição fóssil, prontidão de transmissão e soluções sociais; testar riscos via red team.
- **Entregar:** afunilar para um Radar de Oportunidades Energéticas com quatro dimensões sustentadas por dados confirmados.

O principal ganho metodológico é que o projeto termina com um MVP menor, mas mais forte: uma solução que consegue explicar por que existe, quais dados usa, quais decisões apoia e quais promessas decidiu não fazer.

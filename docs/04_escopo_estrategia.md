# Escopo e estratégia — documento mestre

> **Propósito:** convergir a equipe em **um** escopo MVP defensável em 48h. Não é plano de execução — é o framework de decisão que precede o código.

> **Atualizado:** as recomendações abaixo foram escritas como heurísticas antes da EDA. Agora têm contraponto empírico em [`06_eda_insights.md`](06_eda_insights.md) — em particular o achado de que **51% da capacidade de biometano está ociosa** e o **mismatch de 154 GW renováveis sem indústria eletrointensiva**. Ler `06` **antes** da reunião das 7 decisões.

---

## Restrições de realidade

- **48h líquidas** (sex 9–10 mai 2026). Pitch + protótipo no fim.
- **3–5 pessoas** — vão se especializar (dados, viz, narrativa, dev).
- **PID já existe** — somos avaliadores e expandidores, não criadores do zero.
- **Avaliadores são técnicos do E+** — vão saber se você só fez "mais um dashboard bonito".

## Princípio guia

> Escolha **uma persona** + **um momento de decisão** + **uma camada nova de inteligência** sobre os dados existentes da PID. Faça isso bem.

Tudo que não couber nessa frase fica fora do MVP.

---

## As 7 decisões obrigatórias antes de codar

Cada uma com alternativas explícitas. Recomendação ao final, mas a equipe decide.

### 1. Trilha do hackathon

| Opção | Quando faz sentido | Custo |
|---|---|---|
| **A. UX** | Equipe forte em design/front-end. Diferencial: storytelling visual + descoberta. | Risco de "só polir capa" — fraco em "uso inteligente de dados". |
| **B. Análise & Apoio à Decisão** | Equipe forte em dados/Python/ML. Diferencial: insight novo. | Risco de "notebook bonito sem produto". |
| **C. Aplicação Prática** | Equipe equilibrada. Diferencial: caso de uso concreto. | Risco de escopo difuso se a persona não for cravada. |
| **A+C ou B+C híbrido** | Confirmar com mentor se permitido. Maior superfície de pontos. | Maior risco de não terminar. |

> **Recomendação inicial:** **B+C** (Análise + Aplicação Prática) — junta os dois critérios mais valorizados (uso de dados + impacto real). Confirmar com mentor que híbrido é aceito.

### 2. Persona-alvo (1 só)

| Persona | Pergunta que ela traz | Por que escolher |
|---|---|---|
| **Investidor industrial** (capex 100M+) | "Onde instalo planta de [produto X] de baixo carbono no Brasil?" | Decisão de alto impacto, valor por análise alto. PID tem todos os dados, falta a camada de score. |
| **Gestor estadual** (sec. desenvolvimento econômico) | "Como atrair indústrias verdes para o meu estado?" | Stakeholder fácil de identificar, narrativa política forte. |
| **Indústria existente** (planta carbono-intensiva) | "Qual minha rota de descarbonização viável?" | Mais técnico, menos suporte na PID atual. |
| **Formulador federal** (MDIC/MME) | "Onde focar política industrial verde?" | Match direto com tese do E+. Mas público restrito. |
| **Sociedade civil / academia** | "Esse cluster proposto respeita comunidades e meio ambiente?" | Diferenciador ético — cruza com Terrabrasilis/Cód Florestal. Risco: avaliadores podem achar denso. |

> **Recomendação inicial:** **Investidor industrial**. Razões: (i) dor mensurável em R$, (ii) PID tem ~80% dos dados, falta camada de decisão, (iii) narrativa de pitch é direta ("nosso produto economiza 6 meses de due diligence locacional").

### 3. Tipo de produto

| Tipo | Esforço 48h | Apela em pitch |
|---|---|---|
| **Dashboard analítico** | Baixo | Médio (genérico) |
| **Score / ranking** de clusters por critério | Médio | Alto (defensável tecnicamente) |
| **Recomendador / matchmaking** (input: produto a fabricar → output: top-N localizações) | Médio | Muito alto |
| **Simulador what-if** (mover variável → ver impacto no cluster) | Alto | Muito alto, mas risco de não acabar |
| **Chatbot/assistente** consulta NL sobre dados PID | Baixo se usar LLM, médio sem | Alto se UX boa |
| **Relatório dinâmico gerado** (PDF/HTML por região) | Baixo | Médio |

> **Recomendação inicial:** **Recomendador** ("matchmaking de localização") + **score explicável** por trás. Isso é "uso inteligente de dados" + "apoio à decisão" + "aplicação prática" simultâneos. Defensável.

### 4. Indústria-alvo (1 ou 2 setores)

PID cobre 9 setores. Escolher 1–2 amarra escopo.

| Setor | Por que escolher |
|---|---|
| **Hidrogênio verde** | Tema-quente, dados abundantes na PID, alinhado com Pecém/Camaçari. Muita publicação de referência. |
| **Aço verde** | Setor com mais dados (Inst. Aço Brasil, World Steel). Alta intensidade carbono → alto leverage. |
| **SAF** | Tema novíssimo, pouco mapeado, alta inovação percebida. Risco: escassez de dados granulares. |
| **Fertilizantes verdes** | Brasil é mega-importador, urgência geopolítica. H₂ verde como matéria-prima. |
| **Biometano** | Dados ANP excelentes, infra crescendo. Cruzamento com PAM/PEVS direto. |

> **Recomendação inicial:** **H₂ verde + uma indústria que consome H₂** (fertilizantes ou aço verde). Mostra a tese de cluster (oferta + demanda casadas). Se equipe é menor, escolher só **biometano** — dados melhor estruturados, MVP mais fácil.

### 5. Camada nova de inteligência

Onde está a "tese" do projeto — o que a PID hoje **não** entrega:

| Camada | Insight | Esforço |
|---|---|---|
| **Score multi-critério** ponderável (energia, infra, mão-de-obra, ambiental, fiscal) | Investidor compara clusters por preferência. | Médio |
| **Custo nivelado de produção** por localização (proxy LCOE/LCOH industrial) | "Quanto custa fabricar aqui vs. ali?" | Alto |
| **Risco socioambiental** sobreposto (desmatamento, comunidades, código florestal) | Diferenciador ético + ESG. | Médio |
| **Pegada de carbono evitada** por escolha de cluster | Métrica que casa com tese E+. | Médio |
| **Capacidade ociosa de infraestrutura** (gasodutos, transmissão) | "Onde já tem capacidade que pode receber novas plantas?" | Alto (dado é difícil) |
| **Time-to-market** estimado por região (licenciamento, infra disponível) | Tradução de "tempo é dinheiro" pra investidor. | Médio-alto |
| **Mercado consumidor próximo** (clientes B2B do produto) | Fechar o ciclo demanda↔oferta. | Médio |

> **Recomendação inicial:** **Score multi-critério ponderável** + **risco socioambiental** como camada qualitativa. O usuário ajusta pesos → ranking muda → defensável + interativo.

### 6. Stack técnica

Restrição: 48h. Stack tem que ser instantânea pra equipe.

| Camada | Default | Quando desviar |
|---|---|---|
| **Backend / dados** | Python (pandas, geopandas) | TS se equipe não tem Python forte. |
| **Mapa interativo** | Leaflet + Folium (Python) ou MapLibre/Mapbox (JS) | QGIS se for produzir só prints estáticos pro pitch. |
| **Front** | Streamlit (Python) — protótipo rápido. Ou Next.js se houver dev front. | — |
| **LLM** (se chatbot) | Gemini Flash (free tier) ou OpenAI | Não usar se não tem ROI claro pra UX. |
| **Hospedagem** | Streamlit Cloud, Vercel, Hugging Face Spaces | — |
| **Ingestão de dados** | CSV/JSON estáticos baixados antes do hackathon | API ao vivo só se for MVP fundamental. |

> **Recomendação inicial:** **Streamlit + geopandas + Folium** se a equipe é majoritariamente Python. **Next.js + MapLibre** se é majoritariamente TS. **NÃO MISTURAR** stacks em 48h.

### 7. Definição do "feito" (Definition of Done)

Antes de escrever uma linha, lista do que **tem que** estar pronto na hora do pitch:

- [ ] **Demo funcional** rodando online (link público) com 1 fluxo end-to-end.
- [ ] **Pitch deck** ≤10 slides: problema → persona → solução → demo → impacto → ask.
- [ ] **Vídeo curto** (1–2min) caso seja exigido (verificar regras).
- [ ] **README** explicando como rodar e quais dados foram usados.
- [ ] **História de uso real** com 1 caso concreto (ex.: "investidor X queria fabricar amônia verde, nossa ferramenta apontou Pecém em 30s").
- [ ] **Clareza sobre limitações** — avaliadores adoram time honesto.

---

## Plano de 48h (template — preencher depois das 7 decisões)

**Sex 9 mai**
- 09–11h: kickoff, ler PID, fechar 7 decisões.
- 11–13h: divisão de tarefas, baixar dados, scaffolding do projeto.
- 13–18h: pipeline de dados (1 setor, 1 região foco).
- 18–22h: protótipo v1 com dados reais (mesmo feio).

**Sáb 10 mai**
- 09–13h: refinar produto, integrar análise, polir UX.
- 13–15h: gravação do vídeo, pitch deck, ensaios.
- 15–17h: buffer para bugs.
- 17–18h: entrega.

> **Regra dura:** sexta 22h é o **freeze de escopo**. Depois disso, só polish e bug fix. Quem propor feature nova depois disso é gentilmente ignorado.

---

## Riscos a vigiar

| Risco | Mitigação |
|---|---|
| Dados da PID não baixáveis / só visualização | Scraping antes do kickoff. Plano B: usar bases originais (EPE, ANP, IBGE) e reconstruir. |
| Escopo inflado | Freeze sexta 22h. 1 persona, 1 setor, 1 camada nova. |
| "Mais um dashboard" | Garantir camada analítica nova ≠ visualizar dado existente. |
| Equipe stuck em UX vs. analytics | Decisão da trilha (decisão 1) na primeira hora, não negocia depois. |
| Pitch fraco | Reservar 4h pro pitch. Escrever script. Ensaiar 2x. |
| Dependência em mentor que some | Listar perguntas pra mentor cedo (ver [05_perguntas_abertas.md](05_perguntas_abertas.md)). |

---

## Próximos passos imediatos

1. Equipe lê `00_README` → `01_briefing` → `02_atlas_sintese`.
2. Reunião de 60min para fechar as 7 decisões. **Não votar sem alternativa.**
3. Atualizar este doc com decisões registradas (substituir as recomendações por **decisão final**).
4. Criar arquivo separado `06_decisoes.md` ou ADRs curtos se houver tempo.

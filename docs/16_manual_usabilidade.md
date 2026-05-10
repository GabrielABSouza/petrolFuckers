# Radar PID — Manual de Usabilidade (cheat sheet pro time)

> **Audiência:** integrantes da Equipe 464 lendo pra consolidar no manual oficial dos jurores.
>
> **TL;DR:** Plataforma web pra triagem de oportunidades de transição energética por município, com agente conversacional que responde sobre dados e metodologia.

---

## 1. O que é

O Radar PID é uma **camada de inteligência** sobre a Plataforma Interativa de Descarbonização (PID) do Instituto E+. Onde a PID atual mostra camadas geográficas, o Radar **recomenda onde agir primeiro**: ranqueia 1.938 municípios brasileiros por 5 fontes de energia limpa (Solar, Eólica, Biometano, H2 Verde, Biomassa), aponta instrumentos públicos aplicáveis (REIDI, SUDENE, FNE, BNDES) e responde perguntas via agente Gemini 3 Flash.

---

## 2. Quando usar

Dois perfis de usuário:

**Investidor industrial** — triagem locacional para projeto de capital intensivo (planta H2 verde, fertilizantes verdes, aço verde, biometano industrial, data center sustentável). Substitui semanas de pesquisa em fontes dispersas por uma tela única.

**Gestor público** (estadual, federal, secretaria de desenvolvimento) — priorização de onde aplicar política industrial, atrair capital privado, desenhar editais ou PPPs. Mostra municípios com alto potencial técnico e baixa dinâmica econômica.

---

## 3. Como acessar

- **Versão pública:** front em Vercel + back em Railway. URLs serão anunciadas no pitch.
- **Sem login, sem instalação.** Funciona em qualquer navegador moderno (Chrome, Firefox, Safari, Edge — últimas 2 versões) em laptop/desktop.
- **Sem versão mobile na v2** — produto executivo, lido em tela ampla.

---

## 4. Fluxo de uso (≈3 minutos)

### Passo 1 — Acesse a aplicação
Header mostra logo PID + carrossel de 4 insights rotativos (ranking-derived, incentivos, EDA, casos demonstrativos). Botão de tema (dark/light) e botão "Metodologia" no canto direito.

### Passo 2 — Explore o mapa do Brasil
Coluna central renderiza 1.938 municípios em SVG nativo. **Tamanho** e **cor** do ponto codificam o score MCDA atual. Hover destaca, clique seleciona.

### Passo 3 — Inspecione um município
Clique em um ponto. A sidebar esquerda preenche com:
- **Score final 0–1** e breakdown por bloco (econômico 40% + social 30% + ambiental 30%)
- **`data_completeness`** — flag de qualidade do dado (0–1)
- **Score por fonte** — todas as 5 fontes ranqueadas dentro daquele município
- **Convergência pública** — badges agrupadas em 5 categorias (fiscal, financiamento, leilão, obra, política), com status (confirmado/proxy/elegibilidade preliminar). **Não compõe o score.**

### Passo 4 — Compare dois municípios
Clique no botão de comparação ao lado de um município, depois selecione um segundo no mapa. A sidebar inteira vira modo "X vs Y": confronto por critério em barras espelhadas, instrumentos comuns vs exclusivos, crosshair pontilhado no mapa para o segundo município.

### Passo 5 — Converse com o Copiloto (sidebar direita, sempre aberta)
Agente Gemini 3 Flash com 2 capacidades:
- **Pergunta sobre dados** — "Top 5 H2 Verde em PA", "Pecém detalhado", "Solar no NE com completude > 0,7". O agente chama `search_municipio` em tempo real.
- **Pergunta metodológica** — "Como o score é calculado?", "Por que essa fórmula?", "Quais as limitações?". O agente faz RAG sobre 5 documentos internos via Google File Search e responde com fundamento documental.

**Memória de sessão:** depois de "top 3 Solar", você pode dizer "e em PA?" e o agente preserva o contexto. TTL 30min.

### Passo 6 — Toggle dark ↔ light
Botão de tema no canto direito do header. Persistido em `localStorage`. Tema escuro é cockpit institucional; tema claro alinha com o site público da PID.

### Passo 7 — Consulte a metodologia
Botão **Metodologia** no header → modal compacto com fórmula MCDA, tabela de blocos por critério e lista de fontes conectadas vs próximas a integrar.

---

## 5. Os 3 estados do produto

| Estado | Quando | O que aparece |
|---|---|---|
| **Default (sem seleção)** | Primeira visita ou após fechar painel | Tutorial 3 passos numerados + legenda do mapa + top 3 atual clicável |
| **Município selecionado** | Após clicar em ponto do mapa | `MunicipioCompacto` na sidebar esquerda: score + breakdown + scores por fonte + instrumentos |
| **Comparação ativa** | Após acionar comparação | `CompareView` ocupa sidebar inteira + crosshair pontilhado no mapa pra 2º município |

---

## 6. Limitações (mencione no pitch — honestidade vale ponto)

- **Instrumentos públicos ainda mockados** — esquema servido pelo back, preenchimento real REIDI/SUDENE/FNE/BNDES é roadmap pós-hackathon.
- **Variáveis estaduais aplicadas como municipais** (transmissão, biometano agregado por UF) — registrado no roadmap.
- **Score social é proxy** — v2 substitui por IBGE Cidades real (IDH-M, PIB pc, desemprego).
- **Agente sem busca web em tempo real** — constraint do Gemini 3 Flash impede combinar com File Search.

Cada uma dessas limitações tem mitigação registrada em `docs/13_roadmap_indicador_v2.md`.

---

## 7. Aviso metodológico (visível no produto, regulamento §10.13)

Toda recomendação usa linguagem de **triagem**:
- ✅ "Oportunidade candidata", "elegibilidade preliminar", "score de triagem", "priorizar estudo"
- ❌ "Garantido", "melhor investimento", "retorno certo"

O Radar PID **não substitui due diligence completa, parecer técnico, jurídico ou financeiro**. Ele encaminha pra essas etapas com mais foco e menos tempo desperdiçado.

---

## 8. Diferenciais que valem ressaltar no pitch

1. **Indicador real, com data_completeness explícito** — vs plataformas que silenciam ausência de dado.
2. **Agente especializado em incentivos públicos brasileiros** — vs chat genérico das ferramentas comerciais.
3. **Operacional em produção** — backend e agente respondendo via API pública. Não é só protótipo.
4. **Stack 100% open-source com custo desprezível** — viável pra Instituto E+ continuar sem orçamento alto.
5. **Estética institucional alinhada com a PID original** — sinaliza ferramenta séria pra tomadores de decisão.

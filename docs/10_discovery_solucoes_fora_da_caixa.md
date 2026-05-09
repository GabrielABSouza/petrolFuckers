# Discovery — soluções fora da caixa com dados da PID

> **Data:** 09 mai 2026  
> **Escopo:** explorar ramos alternativos para transição energética usando dados disponíveis da PID, indo além de score industrial/investidor.  
> **Base:** dados de `docs/07_discovery_data_transicao_energetica.md` e pasta `data/`.

---

## 1. Premissa

Os dados da PID hoje são fortes em **oferta energética territorializada** (geração, transmissão, biometano). A maioria das soluções exploradas até agora foca em:

- indústria verde;
- investidor;
- powershoring;
- substituição fóssil.

Mas os mesmos dados podem sustentar narrativas completamente diferentes:

- **envelhecimento populacional**;
- **agronegócio e pecuária**;
- **saúde e vulnerabilidade climática**;
- **justiça energética em territórios específicos**;
- **resiliência de comunidades rurais**.

Esses ramos podem gerar impacto social mais direto e perceptível.

---

## 2. Dados disponíveis e seus potencias alternativos

| Dado PID | Uso convencional | Uso alternativo fora da caixa |
|---|---|---|
| **ANEEL SIGA (geração)** | Onde há energia limpa | Onde há energia para **residências de idosos**, **escolas rurais**, **postos de saúde**, **comunidades isoladas** |
| **SIGET (transmissão)** | Prontidão para indústria | **Alcance da rede elétrica** vs. **comunidades sem acesso** ou **com população vulnerável** |
| **ANP Biometano** | Substituir gás fóssil industrial | **Biometano para cozinhas rurais**, **agroindústrias familiares**, **redução de desmatamento por queima** |
| **UTE fóssil** | Onde descarbonizar | **Onde poluição afeta saúde** (hospitais, escolas, idosos) |
| **Localização de usinas** | Cluster industrial | **Proximidade a **zonas de envelhecimento**, **assentamentos**, **comunidades tradicionais** |

---

## 3. Ideias fora da caixa

### 3.1 Transição energética e envelhecimento populacional

**Problema:** População idosa é mais vulnerável a cortes de energia, calor extremo e falta de acesso a serviços básicos.

**Dados PID que ajudam:**
- **Sistemas isolados** (fora do SIN) em `ANEEL SIGA`.
- **Proximidade de usinas renováveis** a municípios com alta proporção de idosos.
- **Transmissão** como proxy de **acesso confiável**.

**Produto possível:**
> **Mapa de “energia para viver bem”** — cruza oferta renovável/transmissão com dados demográficos de envelhecimento (IBGE) para priorizar onde a transição energética melhora qualidade de vida da terceira idade.

**Pitch:**
> “Existem municípios onde 20%+ da população tem 60+ anos, mas ainda dependem de diesel ou têm rede instável. Nossa solução mostra onde energia renovável pode reduzir vulnerabilidade de idosos.”

**Impacto direto:** saúde, conforto térmico, segurança alimentar (refrigeração de medicamentos), redução de isolamento.

---

### 3.2 Agronegócio, pecuária e biometano descentralizado

**Problema:** Pecuária e agronegócio geram resíduos (esterco, palha, vinhaça) que podem virar biogás/biometano, mas hoje são queimados ou subutilizados.

**Dados PID que ajudam:**
- **Biometano autorizado/ocioso** por estado (`ANP`).
- **Localização de usinas de biomassa** (cana, floresta) em `ANEEL SIGA`.
- **Proximidade a polos agroindustriais** (proxy por municípios com alta produção de soja, milho, cana).

**Produto possível:**
> **Radar de bioenergia rural** — identifica onde há **resíduo agropecuário** próximo a **plantas de biometano subutilizadas** ou **potencial de novas unidades descentralizadas**.

**Pitch:**
> “O Brasil tem 795 mil m³/d de capacidade de biometano parada. Ao mesmo tempo, o agronegócio gera resíduos que poderiam alimentar essa capacidade. Nosso radar conecta oferta e demanda de bioenergia no campo.”

**Impacto direto:** redução de queima, economia para agricultores, energia para comunidades rurais, menor dependência de diesel.

---

### 3.3 Saúde pública e substituição de fóssil em zonas urbanas

**Problema:** UTEs a gás/óleo/ carvão afetam saúde respiratória, especialmente de crianças e idosos em áreas urbanas.

**Dados PID que ajudam:**
- **Localização e potência de UTEs fósseis** (`ANEEL SIGA`).
- **Proximidade a centros urbanos** (municípios com alta densidade populacional).
- **Biometano ocioso** próximo a polos industriais/urbanos.

**Produto possível:**
> **Mapa de “respirar melhor”** — cruza UTEs fósseis com dados de densidade populacional, hospitais, escolas e idosos, e mostra onde biometano ou renováveis podem reduzir impacto na saúde.

**Pitch:**
> “Existem cidades onde uma termelétrica a gás opera perto de escolas e hospitais. Mostramos onde substituir parte dessa geração por biometano ou renováveis pode melhorar a saúde de milhares de pessoas.”

**Impacto direto:** redução de doenças respiratórias, custos de saúde, qualidade do ar urbano.

---

### 3.4 Justiça energética em territórios tradicionais

**Problema:** Comunidades tradicionais, indígenas e quilombolas frequentemente vivem em territórios com alta oferta energética, mas sem acesso ou benefício local.

**Dados PID que ajudam:**
- **Grandes usinas renováveis** em municípios com presença de territórios tradicionais (precisa cruzar com Funai/Incra/MapBiomas).
- **Transmissão** que atravessa esses territórios sem beneficiar localmente.
- **Biometano** em regiões com forte presença de agricultura familiar.

**Produto possível:**
> **Índice de justiça energética territorial** — mostra onde há **grande geração de energia limpa, mas baixo benefício local**, e onde priorizar **microgeração, biodigestores ou redes comunitárias**.

**Pitch:**
> “Alguns territórios exportam energia limpa, mas suas comunidades continuam sem acesso. Nosso índice mede essa injustiça e aponta onde a transição pode ser mais inclusiva.”

**Impacto direto:** inclusão energética, autonomia comunitária, redução de conflitos.

---

### 3.5 Resiliência de pequenos municípios e sistemas isolados

**Problema:** Pequenos municípios e sistemas isolados dependem de diesel caro, poluente e logísticamente frágil.

**Dados PID que ajudam:**
- **Sistemas isolados** fora do SIN (`ANEEL SIGA`).
- **Proximidade de renováveis** (eólica/solar) a esses sistemas.
- **Biometano** em estados com muitos sistemas isolados (ex: Amazônia).

**Produto possível:**
> **Plataforma de “resiliência energética municipal”** — ranqueia pequenos municípios por **potencial de substituição de diesel** com renováveis ou biometano, mostrando economia, emissões evitadas e ganho de autonomia.

**Pitch:**
> “Existem municípios que gastam 30%+ do orçamento com diesel. Nosso mapa mostra onde energia solar ou biometano pode cortar esse custo e melhorar serviços públicos.”

**Impacto direto:** economia municipal, serviço público mais estável, desenvolvimento local.

---

### 3.6 Educação e transição energética nas escolas

**Problema:** Escolas rurais e periurbanas podem ser laboratórios vivos de transição energética, mas falta direcionamento.

**Dados PID que ajudam:**
- **Localização de escolas** (precisa cruzar com INEP/MEC).
- **Oferta renovável** próxima a essas escolas.
- **Biometano** para cozinhas escolares ou aquecimento.

**Produto possível:**
> **Mapa de “escola sustentável”** — identifica escolas onde **energia solar, biometano ou eficiência** podem ter maior impacto educacional e econômico.

**Pitch:**
> “Cada escola pode ser um posto de transição energética. Mostramos onde instalar painéis solares ou usar biometano pode economizar recursos e ensinar energia limpa na prática.”

**Impacto direto:** economia escolar, educação prática, redução de emissões.

---

## 4. Viabilidade técnica com dados atuais

| Ideia | Dados PID suficientes? | Dados externos necessários | Viabilidade 48h |
|---|---:|---|---:|
| Energia para idosos | Médio (precisa IBGE demografia) | IBGE (envelhecimento) | Média |
| Bioenergia rural | Alto (ANP + SIGA) | IBGE agro, malha municipal | Alta |
| Saúde pública | Médio (precisa densidade/hospitais) | IBGE, datasus | Média |
| Justiça territorial | Baixo (precisa territórios tradicionais) | Funai, Incra, MapBiomas | Baixa |
| Resiliência municipal | Alto (sistemas isolados + renováveis) | IBGE municípios | Alta |
| Escolas sustentáveis | Médio (precisa localização escolas) | INEP/MEC | Média |

**Mais viáveis para MVP rápido:** bioenergia rural e resiliência municipal.

---

## 5. Riscos e limitações

### 5.1 Risco de dados demográficos

- IBGE pode não ter granularidade municipal para envelhecimento ou densidade.
- Dados de saúde (DATASUS) podem ter defasagem.

### 5.2 Risco de geocodificação

- Plantas de biometano não têm coordenadas na ANP.
- Escolas, hospitais e comunidades precisam de geocodificação.

### 5.3 Risco narrativo

- Algumas ideias podem parecer “menos técnicas” e mais “sociais”, o que pode ser bom ou ruim dependendo da banca.
- É preciso mostrar que os dados da PID são a base, não apenas um adereço.

### 5.4 Risco de escopo

- Cruzar dados externos pode inflar o escopo além do viável em 37h.
- É preciso escolher **uma única ideia fora da caixa** e fazer bem.

---

## 6. Recomendação de foco

### 6.1 Mais forte em impacto social direto

**Bioenergia rural + agronegócio**

- Dados ANP são concretos.
- Ociosidade de biometano é insight real.
- Conecta resíduo agropecuário, economia rural e energia limpa.
- Impacto direto: agricultores, comunidades rurais, agroindústrias familiares.

### 6.2 Mais inovador

**Energia para idosos**

- Raramente explorado em hackathons.
- Dados PID + demografia é combinação original.
- Impacto emocional forte.
- Requer IBGE, mas é viável.

### 6.3 Mais defensável tecnicamente

**Resiliência de sistemas isolados**

- Dados de sistemas isolados estão na SIGA.
- Comparação diesel vs. renovável é clara.
- Economia municipal é métrica tangível.
- Baixo risco de “greenwashing”.

---

## 7. Próximos passos sugeridos

1. **Escolher uma ideia fora da caixa** (recomendo bioenergia rural).
2. **Obter dados externos mínimos** (IBGE agro, malha municipal).
3. **Geocodificar plantas ANP** por município.
4. **Criar mapa cruzado**: biometano ocioso + produção agropecuária + densidade de estabelecimentos rurais.
5. **Calcular métricas simples**: potencial de biogás, economia estimada, emissões evitadas.
6. **Construir narrativa**: “resíduo do campo virando energia para o próprio campo”.
7. **Limitar escopo**: um estado ou região (ex: São Paulo, Paraná, Mato Grosso).

---

## 8. Conclusão

Os dados da PID não servem apenas para indústria e investimento. Eles podem sustentar soluções com impacto social direto:

- **envelhecimento e vulnerabilidade**;
- **agronegócio e bioenergia rural**;
- **saúde pública e poluição**;
- **justiça energética territorial**;
- **resiliência de pequenos municípios**;
- **educação e transição nas escolas**.

Essas ideias fogem da caixa convencional e podem gerar pitch mais forte em impacto social, inovação e aderência à missão da E+ de “gerar mudança, não vender”.

A recomendação é focar em **bioenergia rural + agronegócio**, pois usa os dados mais fortes da ANP, tem impacto direto e permite narrativa poderosa sobre economia circular no campo.

---

## 9. Pedido de revisão e iteração

Este é um primeiro rascunho de discovery fora da caixa. Peço sua revisão sobre:

1. **Quais ideias parecem mais promissoras?**
2. **Há outros ramos que poderíamos explorar?**
3. **Quais dados externos seriam aceitáveis no hackathon?**
4. **Qual narrativa teria mais força no pitch?**
5. **Devemos aprofundar alguma ideia específica?**

Estou aberto a iterar e refinar antes de seguir para protótipo.

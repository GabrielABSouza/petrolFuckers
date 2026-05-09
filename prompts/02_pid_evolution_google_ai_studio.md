# Prompt para Google AI Studio — Protótipo Radar PID

Você é um engenheiro de produto e frontend sênior. Crie um protótipo funcional em React + Tailwind CSS de uma ferramenta chamada **Radar PID**, uma evolução da Plataforma Interativa de Descarbonização (PID) do Instituto E+.

## Contexto

A PID atual é uma experiência ArcGIS pública:

https://experience.arcgis.com/experience/4fde76ed5b3341cab0553adb3708ec69/page/In%C3%ADcio

Ela funciona principalmente como um visualizador geoespacial com páginas/camadas de:

- Início
- Infraestrutura
- Indústrias
- PID
- Saiba mais

O objetivo do hackathon é: **“Transforme dados em decisões para acelerar a transição energética do Brasil.”**

Nossa tese de produto:

> A PID atual mostra camadas. O Radar PID recomenda onde agir primeiro.

O Radar PID deve transformar dados territoriais e energéticos em um **score/recomendador de oportunidades de investimento em energia limpa**, ajudando investidores e órgãos públicos a priorizar municípios e clusters para novos projetos renováveis.

Além do potencial energético, o protótipo deve incluir uma camada de **Convergência Pública**:

> Onde energia limpa, rede, demanda estratégica e instrumentos públicos de incentivo/financiamento se encontram para destravar investimento.

O caso demonstrativo de maior impacto deve ser:

> Onde o Brasil deve priorizar energia limpa para sustentar novas cargas estratégicas, começando por data centers de IA e soberania digital.

Importante: data centers/IA são um **modo de análise demonstrativo**, não o produto inteiro. O produto principal é um recomendador de oportunidades de investimento em energia renovável/limpa.

## Fonte de dados base

Use como referência conceitual este CSV local:

`/Volumes/ExtremePro/hackaton_E+/data/raw/ANEEL_SIGA_empreendimentos-geracao.csv`

O CSV da ANEEL SIGA contém empreendimentos de geração com campos como:

- `NomEmpreendimento`
- `SigUFPrincipal`
- `SigTipoGeracao`
- `DscFaseUsina`
- `DscOrigemCombustivel`
- `DscFonteCombustivel`
- `MdaPotenciaOutorgadaKw`
- `MdaPotenciaFiscalizadaKw`
- `NumCoordNEmpreendimento`
- `NumCoordEEmpreendimento`
- `DscMuninicpios`

Para este protótipo, não leia o arquivo real. Crie um dataset mockado em memória inspirado nessa estrutura, agregado por município. Depois trocaremos esse mock por um `master_df` real.

O dataset mockado deve ter pelo menos 12 municípios brasileiros, com foco em regiões plausíveis para energia renovável e infraestrutura:

- Janaúba/MG
- Buritizeiro/MG
- Pecém ou São Gonçalo do Amarante/CE
- Camaçari/BA
- Serra do Mel/RN
- Sento Sé/BA
- Altamira/PA
- Tucuruí/PA
- Porto Velho/RO
- Rio Verde/GO
- Lucas do Rio Verde/MT
- Barcarena/PA

Cada município mockado deve ter:

- `municipio`
- `uf`
- `lat`
- `lng`
- `capacidadeRenovavelMw`
- `solarMw`
- `eolicaMw`
- `hidroMw`
- `pipelineMw`
- `margemRedeMw`
- `distanciaSubestacaoKm`
- `distanciaFibraKm`
- `demandaIndustrialScore`
- `riscoSocioambientalScore`
- `desenvolvimentoRegionalScore`
- `prontidaoDataCenterScore`
- `convergenciaPublicaScore`
- `instrumentosPublicos`
- `evidenciasPublicasMock`
- `observacoes`
- `dadosMockados: true`

## Objetivo do protótipo

Construa uma aplicação de primeira tela, sem landing page, que seja a ferramenta em si.

A tela deve ter:

1. **Header**
   - Nome: `Radar PID`
   - Subtítulo curto: `Investimentos em energia limpa para novas cargas estratégicas`
   - Navegação/abas: `Oportunidades`, `Data centers IA`, `Mapa`, `Metodologia`

2. **Painel de filtros e pesos**
   - Persona:
     - Investidor
     - Órgão público
   - Modo de análise:
     - Renováveis gerais
     - Data centers de IA
     - Neoindustrialização verde
   - Sliders de peso:
     - Recurso renovável
     - Conexão à rede
     - Demanda/oferta estratégica
     - Baixo risco socioambiental
     - Desenvolvimento regional
     - Prontidão para data center
     - Convergência pública
   - Botão para resetar pesos.

3. **Mapa do Brasil**
   - Não precisa usar mapa real se for complexo; pode usar uma visualização simplificada com fundo escuro e pontos posicionados por coordenadas relativas.
   - Os pontos devem variar em tamanho/cor conforme o score.
   - Ao clicar em um ponto, selecionar o município.
   - Deve haver tooltip ou painel com município, UF e score.

4. **Ranking de oportunidades**
   - Lista ordenada dos municípios pelo score calculado.
   - Mostrar:
     - posição
     - município/UF
     - score final
     - principal força
     - principal gargalo
   - Clicar em um item seleciona o município.

5. **Painel de decisão do município selecionado**
   - Score final grande.
   - Breakdown por critério.
   - Explicação “Por que aparece no ranking?”
   - Seção `Convergência pública` com badges de instrumentos públicos aplicáveis.
   - Gargalos:
     - rede
     - licenciamento/socioambiental
     - demanda/offtake
     - conectividade digital, quando o modo for data center.
     - incentivos/licitações/financiamento, quando a convergência pública for baixa.
   - Recomendações acionáveis:
     - “aprofundar estudo de margem de escoamento”
     - “validar conexão com ONS/distribuidora”
     - “mapear potenciais compradores de energia”
     - “avaliar impacto socioambiental local”
     - “validar fibra, redundância e disponibilidade hídrica”, no modo data center.
     - “validar elegibilidade a REIDI, SUDENE/SUDAM, FNE/FNO/FCO ou debêntures incentivadas”, quando aplicável.

6. **Comparação lado a lado**
   - Permitir comparar o município selecionado com outro top município.
   - Mostrar barras ou mini cards por critério.
   - Texto curto: “melhor para investimento privado”, “melhor para política pública”, etc.

7. **Copiloto PID**
   - Adicione um chatbot lateral chamado `Copiloto PID`.
   - Ele deve ser um mock funcional, sem chamar API externa.
   - O chat deve responder com base no estado atual da aplicação:
     - município selecionado
     - ranking atual
     - modo de análise
     - pesos dos sliders
     - dados mockados.
   - Inclua sugestões rápidas de perguntas:
     - “Por que este município foi recomendado?”
     - “Compare os top 3 para data centers de IA”
     - “Quais gargalos preciso destravar?”
     - “Quais dados ainda são mockados?”
     - “Explique o score para um gestor público”
     - “Quais incentivos públicos podem se aplicar?”
     - “Isso é elegibilidade confirmada ou triagem?”
   - O chatbot deve sempre deixar claro quando a resposta usa dados mockados.
   - O chatbot não deve fingir que é uma IA real conectada a dados oficiais.
   - Ele deve funcionar como um copiloto de explicação e comunicação da análise.
   - Ao falar de incentivos, o chatbot deve diferenciar:
     - dado confirmado;
     - proxy;
     - elegibilidade preliminar;
     - próxima validação necessária.
   - Nunca afirmar que um benefício fiscal está garantido.

8. **Metodologia**
   - Uma aba ou painel curto explicando o score:

```text
score_final =
  peso_recurso * score_recurso_renovavel
+ peso_rede * score_conexao_rede
+ peso_demanda * score_demanda_estrategica
+ peso_risco * score_baixo_risco_socioambiental
+ peso_desenvolvimento * score_desenvolvimento_regional
+ peso_datacenter * score_prontidao_datacenter
+ peso_publico * score_convergencia_publica
```

   - Explicar que nesta versão:
     - ANEEL SIGA é a base conceitual para capacidade renovável por município;
     - ONS margem de escoamento, irradiação solar, IBGE, SAFMaps e dados de conectividade entrarão na próxima versão;
     - PNCP/Compras.gov.br, Transferegov, Obrasgov, BNDES, ANEEL Leilões, MME REIDI, SUDENE/SUDAM e FNE/FNO/FCO entrarão na camada futura de convergência pública;
     - Dados exibidos agora são mockados para validar experiência e fluxo de decisão.

## Regras de design

Use a PID atual como referência visual, mas crie uma interface mais executiva e orientada à decisão.

Inspiração visual:

- mapa como elemento central;
- navegação simples;
- visual institucional;
- azul escuro, branco, amarelo e laranja.

Paleta sugerida:

- azul escuro: `#05274b`
- amarelo: `#fcc20a`
- laranja: `#fc6926` ou `#fa441a`
- fundo claro: `#f5f7f8`
- texto escuro: `#18212f`

Regras:

- Não criar landing page.
- A primeira tela deve ser a ferramenta.
- Design deve parecer produto de decisão para energia/infraestrutura, não site de marketing.
- Use layout denso, claro e executivo.
- Evite cards gigantes sem função.
- Use ícones quando possível.
- Use barras, chips, badges, sliders e painéis de comparação.
- Mantenha texto curto, objetivo e orientado à ação.
- A interface deve funcionar bem em desktop.
- Não dependa de backend.
- Não dependa de chave de API.

## Comportamento do score

Implemente cálculo real no frontend.

Normalize os critérios de 0 a 100.

Sugestão:

- `score_recurso_renovavel`: combinação de capacidade renovável instalada + pipeline.
- `score_conexao_rede`: maior quando `margemRedeMw` é alta e `distanciaSubestacaoKm` é baixa.
- `score_demanda_estrategica`: usar `demandaIndustrialScore`.
- `score_baixo_risco_socioambiental`: `100 - riscoSocioambientalScore`.
- `score_desenvolvimento_regional`: usar `desenvolvimentoRegionalScore`.
- `score_prontidao_datacenter`: combinação de `prontidaoDataCenterScore`, `distanciaFibraKm` baixa, conexão à rede e baixo risco.
- `score_convergencia_publica`: usar `convergenciaPublicaScore`, combinando evidências mockadas de incentivos fiscais, financiamento público, REIDI/debêntures, licitações, transferências e obras de infraestrutura.

No modo `Data centers de IA`, aumentar automaticamente o peso de:

- conexão à rede;
- prontidão para data center;
- baixo risco socioambiental.
- convergência pública, por causa de instrumentos como política de data centers, energia limpa, P&D e incentivos fiscais.

No modo `Neoindustrialização verde`, aumentar automaticamente o peso de:

- recurso renovável;
- demanda/oferta estratégica;
- desenvolvimento regional.
- convergência pública.

## Camada de Convergência Pública

Inclua no mock dataset instrumentos públicos plausíveis por município, usando badges como:

- `REIDI`
- `Debêntures incentivadas`
- `SUDENE`
- `SUDAM`
- `FNE`
- `FNO`
- `FCO`
- `BNDES`
- `Transferegov`
- `PNCP`
- `Obrasgov`
- `Novo PAC`
- `Política de datacenters`

Exemplos:

- Janaúba/MG e Buritizeiro/MG: solar forte, possível SUDENE/FNE dependendo da área, REIDI/debêntures como validação.
- Pecém/CE: energia eólica/solar, porto, hub industrial, FNE, SUDENE, política de data centers como cenário.
- Barcarena/PA: infraestrutura industrial/portuária, possível SUDAM/FNO, oportunidade para cargas estratégicas.
- Rio Verde/GO e Lucas do Rio Verde/MT: FCO, agroindústria, demanda estratégica e oportunidade de energia limpa para interiorização.

Na UI, mostre a convergência pública como uma camada de triagem, não como parecer jurídico.

Use microcopy:

- “Elegibilidade preliminar”
- “Validar com órgão competente”
- “Sinal público de convergência”
- “Instrumentos a investigar”
- “Não é parecer jurídico ou financeiro”

## Saída esperada

Gere o código completo do protótipo em um único arquivo React, se possível.

Se o ambiente do Google AI Studio gerar múltiplos arquivos, mantenha simples:

- `App.jsx`
- `index.css`
- dados mockados dentro de `App.jsx` ou em `mockData.js`.

O resultado deve ser clicável e demonstrável.

## Tom e microcopy

Use português brasileiro.

Evite exageros como “garantido”, “melhor investimento” ou “retorno financeiro certo”.

Use linguagem responsável:

- “oportunidade candidata”
- “priorizar estudo”
- “aprofundar due diligence”
- “gargalo a destravar”
- “score de triagem”
- “dados mockados nesta versão”

Frase central da ferramenta:

> “Da visualização à decisão: priorize onde investir, destravar rede e acelerar energia limpa no Brasil.”

## Critérios de sucesso do protótipo

O protótipo será considerado bom se permitir demonstrar em 2 minutos:

1. O usuário muda pesos e vê o ranking mudar.
2. Seleciona um município e entende por que ele aparece como oportunidade.
3. Ativa o modo “Data centers IA” e vê a análise mudar.
4. Compara dois municípios.
5. Pergunta ao Copiloto PID por que o município foi recomendado.
6. Entende quais dados são mockados e quais fontes reais serão conectadas depois.

Não implemente funcionalidades que desviem desse fluxo.

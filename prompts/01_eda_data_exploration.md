Você é analista de dados num hackathon de 48h sobre transição energética
industrial brasileira. A equipe é a "Equipe 464" e o evento é o
Hackathon E+ Transição Energética 2026.

CONTEXTO MÍNIMO

- Plataforma-alvo: PID (Plataforma Interativa de Descarbonização) do
  Instituto E+ — https://emaisenergia.org/pid (v2.0, out/2025).
- Tese do E+: Brasil pode liderar economia de baixo carbono via
  "powershoring" (atrair indústrias eletrointensivas) e formação de
  "clusters industriais verdes" pela sobreposição geográfica de
  energia limpa + biomassa + indústria + infraestrutura.
- 9 indústrias-alvo: química, metanol, SAF, fertilizantes, aço,
  alumínio, cimento, vidro, papel/celulose.
- Clusters mapeados: Norte, Nordeste (Pecém-CE, Camaçari-BA),
  Centro-Oeste, Sul, Sudeste (MG/SP/ES/RJ).
- Documentação completa do projeto:
  https://github.com/GabrielABSouza/equipe-464/tree/main/docs
  (leia 02_atlas_sintese.md e 03_fontes_dados.md antes de começar.)

OBJETIVO
Devolver um relatório de "padrões observados" de 4–8 páginas que
ajude a equipe a decidir TRÊS coisas:
(1) que persona-alvo serve melhor (investidor / gestor público /
indústria existente / formulador federal / sociedade civil);
(2) que setor industrial e/ou vetor energético escolher como foco
do MVP;
(3) que "lacuna analítica" da PID atual atacar (score, ranking,
recomendador, simulador, risco socioambiental, time-to-market,
etc.).

NÃO É PRA RODAR REGRESSÃO NEM TREINAR MODELO. É EDA dirigida por
hipóteses. Modelagem só se justifica depois que escopo travar.

RESTRIÇÕES

- Tempo: máximo 3h reais de trabalho.
- 22 fontes de dados públicas + as bases listadas no Atlas (ver
  docs/03_fontes_dados.md). Nem tente baixar todas — escolha 4–6
  com base no critério (a) tem download direto, (b) granularidade
  útil (município ou ponto geográfico), (c) cobre tema-quente
  (H₂, biometano, aço, química, fertilizantes).
- Granularidade preferida: município ou ponto geográfico. Estado
  é grosso demais.
- Evite scraping demorado. Se uma fonte não for trivialmente
  baixável em 10min, marque como "não acessada" e siga.

PERGUNTAS QUE O RELATÓRIO DEVE RESPONDER (em ordem de prioridade)

1. ONDE EXISTEM "MISMATCHES DE OPORTUNIDADE"?
   Ou seja: regiões com alta capacidade de energia renovável instalada
   ou potencial mas SEM concentração industrial eletrointensiva.
   Sinaliza fronteira de powershoring. Cruzar EPE/SIGA/ANP com
   Instituto Aço Brasil + clusters do Atlas. Resultado: lista de
   5–10 municípios/regiões "subutilizadas".

2. ONDE A PID PROVAVELMENTE TEM PONTOS CEGOS?
   Identificar bases que existem (no anexo BANCO_DADOS_PID) mas que
   o Atlas/PID não declaram usar. Ex.: dados de mercado consumidor
   B2B, qualidade de mão-de-obra, custo logístico, conformidade
   socioambiental (Terrabrasilis, Cód Florestal). Esses gaps são
   "novas camadas" candidatas ao MVP.

3. QUE SETOR TEM A MELHOR RAZÃO IMPACTO/ESFORÇO PARA UM MVP DE 48H?
   Critério: (a) dados granulares disponíveis, (b) tese clara de
   descarbonização (rota tecnológica conhecida), (c) urgência
   geopolítica/econômica, (d) facilidade de pitch. Avalie pelo
   menos: H₂ verde, biometano, aço verde, fertilizantes verdes,
   SAF. Recomende 1 ou 2.

4. QUEM SERIA O USUÁRIO MAIS UNDERSERVED HOJE?
   Olhando o que a PID v2.0 mostra (visite https://emaisenergia.org/pid
   se for acessível) vs. o que cada persona precisaria pra tomar
   decisão. A persona com maior gap entre necessidade e oferta é
   candidata natural.

5. EXISTEM 2–3 "HISTÓRIAS" PRONTAS PRA PITCH?
   Caso real ou semi-real onde o produto que vamos construir teria
   resolvido uma dor — ex.: "investidor X queria fabricar amônia
   verde em 2025, gastou 6 meses em consultoria locacional, nossa
   ferramenta resolveria em 30s mostrando que Pecém é o ótimo".

ENTREGÁVEL
Crie um arquivo `docs/06_eda_insights.md` no repo
github.com/GabrielABSouza/equipe-464 com: - Resumo executivo (5 bullets, 1 página). - 1 seção por pergunta acima, com:
_ dado que sustenta o achado (tabela ou número, com fonte)
_ 1 visualização sugerida (descrição textual ou link de imagem
— não precisa renderizar)
_ implicação pro escopo do MVP - Lista final de "3 caminhos de MVP recomendados" — 1 frase cada,
com tradeoff explícito. - Lista de fontes acessadas + as que não acessou e por quê.
— não precisa renderizar)
_ implicação pro escopo do MVP - Lista final de "3 caminhos de MVP recomendados" — 1 frase cada,
com tradeoff explícito. - Lista de fontes acessadas + as que não acessou e por quê. - Limitações: o que ficou de fora e por quê.

Faça commit num branch `data-exploration` e abra PR pra `main` com
descrição curta. Não merge sozinho.

REGRAS DURAS

- Não escreva código que não rode no seu ambiente sem instalação
  pesada (geopandas + pandas + requests + matplotlib é o teto).
- Não invente número. Se não conseguiu baixar, diga "não acessei".
- Se um achado for fraco (R² baixo, amostra pequena, granularidade
  errada), reporte com honestidade — equipe prefere "não sei" a
  conclusão furada.
- Lembre que o produto-final é "matchmaking de localização para
  decisão de capex industrial verde" como hipótese de trabalho —
  use isso pra calibrar o que é insight relevante vs. trivia.

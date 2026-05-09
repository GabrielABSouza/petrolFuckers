# Camada de convergencia publica — incentivos, licitacoes e financiamento

> Branch: `radar-pid-incentivos-publicos`  
> Objetivo: aprofundar a evolucao do Radar PID para cruzar oportunidade energetica com instrumentos publicos de incentivo, contratacao e financiamento.

## Tese

O Radar PID nao deve responder apenas "onde ha potencial renovavel?". A pergunta de maior valor para investidores e governos e:

> Onde ha convergencia entre recurso energetico, rede, demanda estrategica e instrumentos publicos capazes de destravar investimento?

Essa camada transforma o produto de um score tecnico de energia em uma ferramenta de inteligencia publico-privada.

## Produto

Adicionar ao Radar PID uma camada chamada **Convergencia Publica**.

Ela deve mostrar, para cada municipio ou cluster:

- se ha oportunidade energetica renovavel;
- se ha capacidade/proxy de conexao a rede;
- se a regiao e elegivel a incentivos fiscais ou fundos regionais;
- se ha historico de financiamento publico ou demanda publica;
- se existem obras, transferencias, leiloes ou politicas setoriais alinhadas;
- quais instrumentos o usuario deveria investigar primeiro.

Frase de pitch:

> "O Radar PID mostra onde energia limpa, infraestrutura e politica publica se encontram para destravar investimento."

## Casos de uso

### Investidor

Perguntas:

- "Onde tenho melhor combinacao de recurso renovavel, rede e incentivo?"
- "Quais municipios tem potencial tecnico, mas exigem destravar obra ou licenciamento?"
- "Existe historico de financiamento publico ou leiloes na regiao?"
- "Esse projeto poderia se enquadrar em REIDI, debenture incentivada, fundo regional ou incentivo fiscal?"

Output:

- ranking de municipios;
- instrumentos publicos aplicaveis;
- gargalos de due diligence;
- resumo executivo para comite de investimento.

### Orgao publico

Perguntas:

- "Onde uma politica publica teria mais chance de atrair capital privado?"
- "Qual obra de transmissao, conectividade ou infraestrutura destravaria mais projetos?"
- "Que municipios combinam alto potencial renovavel com baixa dinamica economica?"
- "Como priorizar chamadas, editais, PPPs ou captacao de recursos federais?"

Output:

- carteira territorial de oportunidades;
- lacunas por municipio;
- sugestao de instrumentos: financiamento, edital, obra, incentivo, chamada publica;
- narrativa para desenvolvimento regional.

## Fontes de dados candidatas

| Fonte | Formato | Granularidade provavel | Sinal que fornece | Prioridade MVP | Observacoes |
|---|---|---|---|---|---|
| PNCP / Compras.gov.br | API/CSV/JSON | Orgao, contrato, localidade quando disponivel | Demanda publica por energia, obras, data centers, conectividade, equipamentos | Alta | Bom para buscar oportunidades e contratos por palavras-chave. Nem sempre o municipio representa local de execucao. |
| Transferegov | CSV/API REST | Convenio/proposta/emenda, municipio/UF | Capacidade de captacao, transferencias e parcerias publicas | Alta | Arquivos diarios e APIs; bom para criar score de maturidade institucional. |
| Obrasgov.br | API | Obra/projeto georreferenciado | Infraestrutura publica em execucao, valor, status fisico-financeiro | Media-alta | Forte para proximidade com obras de infraestrutura, mas exige parser e filtros por eixo. |
| BNDES Dados Abertos | CSV/CKAN | Operacao, municipio, setor, produto, valor | Historico de credito, apetite de financiamento, setores apoiados | Alta | Base grande; usar amostra filtrada por energia, infraestrutura, TIC, inovacao e municipio. |
| ANEEL Leiloes | CSV | Empreendimento, UF, fonte, investimento | Historico de contratacao regulada e competitividade por fonte/UF | Alta | CSV pequeno e estruturado. Nao e municipal em todos os casos, mas combina bem com SIGA. |
| MME REIDI | CSV | Projeto/ato, setor, possivelmente UF/empreendimento | Incentivo fiscal direto para infraestrutura energetica | Alta | Camada mais aderente a energia. Usar como selo de "projeto/instrumento fiscal aplicavel". |
| SUDENE Incentivos | CSV/JSON | Pleito/empresa/municipio/UF/setor | Incentivos fiscais regionais aprovados, reducao/isencao IRPJ | Alta para Nordeste/norte MG/ES | Fonte muito boa para convergencia territorial em area da SUDENE. |
| SUDAM Incentivos | Relatorios/paginas, possivel extracao parcial | Empresa/UF/municipio/setor | Incentivos fiscais na Amazonia Legal | Media | Estrutura menos direta que SUDENE; pode entrar inicialmente como regra de elegibilidade territorial. |
| FNE/FNO/FCO | Programacoes, relatorios, bases pontuais | Regiao/UF/municipio, linha, contratacoes | Financiamento regional subsidiado e elegibilidade | Media | Excelente conceitualmente; para MVP usar elegibilidade por area + linhas verdes. FCO tem banco de contratacoes publicado. |
| Tesouro/Portal da Transparencia | API | Municipio/ente/programa | Transferencias, convenios, despesas, emendas | Media | Pode reforcar maturidade fiscal/captacao; evitar excesso no MVP. |
| REDATA / Politica de Datacenters | Texto legal/politica publica | Nacional, regras de habilitacao | Incentivo especifico para data centers com energia limpa | Media | Usar como camada normativa/cenario, nao como dado estruturado ate consolidar status juridico. |
| Novo PAC | Tabela/painel | Obra, municipio/UF/eixo | Carteira de obras e investimentos publicos estruturantes | Media | Relevante para transmissao, geracao, conectividade e infraestrutura regional. |

## Data model proposto

Criar uma tabela derivada `public_convergence_df.csv`, com uma linha por municipio.

Chave primaria: `cd_mun` quando disponivel. Alternativa temporaria: `municipio_normalizado + uf`.

Campos:

```text
cd_mun
municipio
uf

eligible_sudene
eligible_sudam
eligible_fne
eligible_fno
eligible_fco

n_incentivos_sudene
n_incentivos_sudam
valor_incentivos_estimado
setores_incentivados

n_operacoes_bndes
valor_bndes_total
valor_bndes_energia_infra_tic
tem_historico_bndes_energia

n_licitacoes_relacionadas
valor_licitacoes_relacionadas
keywords_licitacoes

n_transferencias_transferegov
valor_transferencias_total
valor_transferencias_infra

n_obras_infra
valor_obras_infra
status_obras_relevantes

n_reidi_projetos
valor_reidi_estimado
tem_reidi_energia

n_leiloes_aneel_uf
investimento_leiloes_aneel_uf
fontes_leiloes_uf

red_data_center_applicable
red_data_center_notes

score_convergencia_publica
instrumentos_recomendados
fontes_usadas
data_atualizacao
```

## Score

O score precisa ser explicavel e nao deve sugerir certeza juridica ou financeira.

Formula inicial:

```text
score_convergencia_publica =
  0.20 * score_incentivo_fiscal_regional
+ 0.20 * score_credito_publico_historico
+ 0.15 * score_licitacoes_demanda_publica
+ 0.15 * score_transferencias_capacidade_institucional
+ 0.15 * score_obras_infra_estruturante
+ 0.10 * score_reidi_debentures_energia
+ 0.05 * score_politica_setorial
```

O score final do Radar PID passaria a incluir:

```text
score_total =
  w_energia * score_recurso_renovavel
+ w_rede * score_conexao_rede
+ w_demanda * score_demanda_estrategica
+ w_risco * score_baixo_risco_socioambiental
+ w_desenvolvimento * score_desenvolvimento_regional
+ w_datacenter * score_prontidao_datacenter
+ w_publico * score_convergencia_publica
```

## Interpretacao do score

Faixas sugeridas:

| Score | Leitura |
|---:|---|
| 80-100 | Alta convergencia: territorio com sinais tecnicos e instrumentos publicos relevantes. Priorizar due diligence. |
| 60-79 | Boa oportunidade: ha potencial, mas algum gargalo publico/regulatorio precisa ser destravado. |
| 40-59 | Oportunidade condicionada: exige validacao de rede, incentivo, demanda ou maturidade institucional. |
| 0-39 | Baixa convergencia atual: pode ter recurso energetico, mas sem sinais publicos suficientes para priorizacao. |

## UI sugerida

Adicionar uma aba ou modo: **Incentivos e Politicas**.

Elementos:

- card "Convergencia publica" no painel do municipio;
- lista de instrumentos aplicaveis;
- badges: `SUDENE`, `FNE`, `REIDI`, `BNDES`, `PNCP`, `Transferegov`, `Obrasgov`;
- timeline de evidencias publicas;
- alerta "elegibilidade preliminar, nao parecer juridico";
- botao "Gerar roteiro de due diligence publica".

Exemplo de output:

```text
Janauba/MG

Convergencia publica: 76/100

Sinais positivos:
- Area potencialmente elegivel a instrumentos regionais da SUDENE/FNE.
- Forte pipeline solar e concentracao de projetos renovaveis.
- Historico regional de energia fotovoltaica e possivel aderencia a REIDI/debentures.

Gargalos:
- Validar margem de escoamento no ONS.
- Confirmar disponibilidade de subestacao e custo de conexao.
- Verificar licenciamento e restricoes socioambientais locais.

Proximo passo:
- Rodar consulta REIDI + BNDES + Transferegov para confirmar instrumentos ativos.
```

## Copiloto PID

O Copiloto deve responder perguntas sobre convergencia publica com transparencia.

Perguntas sugeridas:

- "Quais incentivos podem se aplicar a este municipio?"
- "Esse municipio tem mais oportunidade tecnica ou politica?"
- "Qual instrumento publico destravaria mais o investimento?"
- "Compare Janauba e Pecem considerando incentivos e rede."
- "O que falta validar antes de apresentar ao investidor?"
- "Isso e elegibilidade confirmada ou apenas triagem?"

Regra de resposta:

- sempre diferenciar **dado confirmado**, **proxy**, **elegibilidade preliminar** e **proxima validacao**;
- nunca afirmar beneficio fiscal garantido;
- apontar fonte e data quando existir;
- quando os dados forem mockados, dizer explicitamente.

## Priorizacao para MVP

### Corte minimo

Para o prototipo mockado:

- adicionar campo `convergenciaPublicaScore`;
- adicionar campo `instrumentosPublicos`;
- adicionar campo `evidenciasPublicasMock`;
- adicionar slider `Convergencia publica`;
- atualizar Copiloto PID para responder sobre incentivos.

### Corte com dados reais em 48h

1. ANEEL SIGA: base de energia por municipio.
2. ANEEL Leiloes: historico de contratacao e investimento por UF/fonte.
3. MME REIDI: projetos deferidos de energia/transmissao.
4. SUDENE: pleitos aprovados CSV/JSON.
5. BNDES: operacoes filtradas por municipio/setor, se o download for viavel.
6. Transferegov: municipios com convenios/transferencias em infraestrutura.

### Deixar fora do primeiro corte

- Redata como dado estruturado: usar apenas como narrativa/cenario ate validar situacao legislativa.
- PNCP completo: usar busca por palavras-chave depois, porque pode gerar muito ruido.
- Obrasgov completo: entra se houver tempo para filtrar por geolocalizacao/eixo.
- FNE/FNO/FCO historico granular: usar elegibilidade regional no MVP, aprofundar depois.

## Riscos

| Risco | Mitigacao |
|---|---|
| Confundir elegibilidade com concessao de incentivo | Usar linguagem de triagem: "pode ser elegivel", "validar com orgao competente". |
| Bases publicas muito grandes | Baixar amostras filtradas por UF, setor e palavras-chave. |
| Municipio da licitacao nao ser local de execucao | Marcar como "sinal de demanda publica", nao como investimento localizado. |
| Dados fiscais/regulatorios mudarem | Exibir data de atualizacao e fonte. |
| Score virar juridico demais | Manter foco em priorizacao de estudo, nao parecer legal. |

## Decisao recomendada

Incluir a camada de convergencia publica no pitch, mas como **diferencial do Radar PID**, nao como escopo principal do MVP.

Formula de posicionamento:

> "O Radar PID prioriza municipios para investimento em energia limpa e mostra quais instrumentos publicos podem acelerar ou travar essa decisao."

Isso aumenta impacto e inovacao sem desviar da aderencia ao tema da PID.

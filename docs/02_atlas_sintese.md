# Síntese do Atlas do Futuro Industrial 2025 (E+)

> Fonte: `/Volumes/ExtremePro/hackaton_E+/emais_atlas-miolo_digital_251203-12h58_f.pdf` (82p). Coordenação: Stefania Gomes Relva, Clauber Leite, Drielli Peyerl. Parceria com **Lab. Política Industrial para Net Zero — Johns Hopkins**.

## Tese central do E+

O Brasil tem **vantagem competitiva única** para se tornar líder global em economia de baixo carbono porque combina:

1. Matriz elétrica >80% renovável (fator de emissão do SIN ≈ 60 kgCO₂/MWh vs. ~400 média global).
2. Recursos naturais abundantes (biomassa, minerais críticos, vento, sol).
3. Base industrial consolidada (mas hoje carbono-intensiva em vários setores).

## A PID v2.0 — estrutura real (segundo LEIAME oficial)

> Fonte: `references/PID-LEIAME-v.2.pdf` (Guia do Usuário oficial, Instituto E+).

A PID é um **visualizador GIS** publicado no **ArcGIS Experience** (stack Esri), com 4 abas:

| Aba | Conteúdo | Fontes de dados |
|---|---|---|
| **Infraestrutura** | Hidrelétricas (op/constr/planej), Sistemas Isolados (fora do SIN), Linhas de Transmissão, Gasodutos, Eólicas, Solares — pop-up de atributos por clique | SIGEL-ANEEL, IDE-Sisema (MG), EPE WebMap |
| **Indústrias** | Consumo (MWh) por tipo de indústria, número de indústrias **agregadas por região**, classificação setorial colorida | IBGE, MapBiomas |
| **Hidrogênio** | HUBs identificados, projetos avançados (em implantação), projetos planejados | IEA, EPE |
| **PID** (combinador) | Sobrepõe livremente camadas das 3 abas, ferramentas de medição (distância/área), salvar mapa como **imagem** (JPG/PNG/PDF) | (combina as outras) |

- URL pública: `www.emaisenergia.org/pid` (redireciona para Experience ArcGIS).
- Versão atual: 2.0 (out/2025).
- Output efetivo: **screenshot do mapa com filtros** — não exporta CSV nem JSON, não tem API.

### Lacunas funcionais explícitas (relevantes para o MVP)

A PID **não** entrega: score, ranking, recomendação, simulação what-if, custo (LCOE/LCOH/logístico), risco socioambiental cruzado, comparação lado-a-lado, indicadores derivados (ociosidade, intensidade, distância à infra), exportação de dados estruturados, dados planta-a-planta no setor industrial (estão agregados por região).

Essas lacunas = oportunidade do hackathon.

## Metodologia conceitual do Atlas (4 camadas)

> Não confundir com as 4 abas da PID v2.0 acima. Essa é a **abstração editorial do Atlas** (p.10–11): explica o método de identificação de clusters industriais verdes — mas a PID expõe esses dados em 3 abas temáticas + 1 combinador, não em 4 camadas dedicadas.

1. **Infraestrutura** de transporte e energia (gasodutos, ferrovias, portos, linhas de transmissão).
2. **Disponibilidade de biomassa** (no Atlas; na PID atual entra como subcamada de Indústrias/Infra, sem aba própria).
3. **Localização de indústrias** existentes.
4. **Potenciais de energias renováveis** (eólica, solar, hidro).

A interseção dessas camadas, segundo o Atlas, define **clusters industriais verdes**.

## Indústrias-alvo (9 setores)

Mapeadas no Atlas como prioritárias para descarbonização e powershoring:

- Química
- Metanol
- SAF (combustível sustentável de aviação)
- Fertilizantes
- Aço
- Alumínio
- Cimento
- Vidro
- Papel e celulose

## Recursos energéticos e minerais (6 vetores)

- Setor elétrico (SIN, ~185.225 km de linhas)
- Biomassa e biossoluções
- Biometano
- Hidrogênio (75,5 Mt potencial até 2050)
- Minerais críticos (bauxita, ferro, manganês, cobre, etc.)
- Infraestrutura logística (portos, gasodutos, ferrovias)

## Clusters mapeados (10 regiões)

| Cluster | Vocação |
|---|---|
| **Norte** | Alumínio de baixo carbono (hidrelétrica), bioeconomia amazônica, minerais. Polos: Barcarena, Belém. |
| **Nordeste — Pecém (CE)** | Hub de hidrogênio verde (eólica). |
| **Nordeste — Camaçari (BA)** | Petroquímico em transição. |
| **Centro-Oeste** | Bioenergia (cana, soja), biometano. |
| **Sul** | Indústria diversificada, biomassa. |
| **Sudeste — MG** | Aço/cimento + carvão vegetal + Quadrilátero Ferrífero. Vale e parcerias internacionais em aço verde. |
| **Sudeste — SP** | Maior centro industrial. Porto de Santos. Cana/biometano. |
| **Sudeste — ES** | Siderurgia, celulose, cimento, portos profundos. |
| **Sudeste — RJ** | Petróleo e gás em transição, refino. |

## Dois conceitos centrais (vocabulário do E+)

### Powershoring

Estratégia de **realocar indústrias eletrointensivas para regiões com energia renovável abundante e barata**. Brasil = destino natural. Reduz custos + emissões + aumenta resiliência das cadeias globais.

### Consenso de Belém

Proposta de **nova aliança global Norte–Sul** para transição justa. Une descarbonização + neoindustrialização + justiça econômica. Reposiciona países do Sul Global como protagonistas (não meros fornecedores de matéria-prima).

## O que o E+ propõe como estratégia para o Brasil

1. **Mapeamento e foco estratégico** — segmentos prioritários onde Brasil pode agregar mais valor.
2. **Política integrada** — demand-pull (compras públicas, incentivos) + supply-push (crédito, P&D, capacitação).
3. **Metas e monitoramento** — incentivos atrelados a resultados.
4. **Capital humano** — qualificação técnica para setores prioritários.
5. **Governança participativa** — fóruns governo + privado + sindicatos + sociedade civil.

## Implicações para o hackathon

O Atlas + PID têm **lacunas explícitas** declaradas pelos próprios editores ("primeiro passo", "exploratório e não exaustivo", "construção contínua"). Isso é convite a:

- Adicionar **novas indústrias / insumos / clusters** não mapeados.
- Cruzar com **bases de dados que a PID ainda não integra** (ver [03_fontes_dados.md](03_fontes_dados.md)).
- Criar **camada analítica nova** sobre os dados existentes (ranking, score, simulação, recomendação).
- Atender **persona específica** que a PID atual não serve bem (investidor estrangeiro? gestor estadual? startup verde?).

> Se a equipe quiser propor expansão ao próprio Atlas/PID, o e-mail de sugestões é `pid@emaisenergia.org` — mas isso é canal pós-hackathon.

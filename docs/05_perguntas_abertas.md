# Perguntas abertas — gaps a fechar

> Lista viva. Atualizar à medida que respostas chegam (com mentor, organização, ou auto-investigação).

## Já respondidas (registro)

- ~~PID expõe API ou só dashboard?~~ → **Só dashboard.** Visualizador GIS no ArcGIS Experience. Sem API pública. Output: imagem (JPG/PNG/PDF). Fonte: `references/PID-LEIAME-v.2.pdf`.
- ~~Há um dump dos dados da PID disponível para participantes?~~ → **Não diretamente pela PID.** As fontes upstream (SIGEL-ANEEL, EPE, IBGE, MapBiomas, IEA) são públicas e baixáveis individualmente. Já temos uma parte em `data/raw/`.
- ~~Estrutura de abas da PID?~~ → 4 abas: **Infraestrutura, Indústrias, Hidrogênio, PID (combinador)**. Biomassa não tem aba dedicada.

## Para os mentores / organização

### Sobre regras e entrega

- [ ] **Equipes podem atravessar trilhas (UX + Análise + Aplicação) ou tem que escolher uma só?**
- [ ] **Vídeo de pitch é obrigatório?** Quanto tempo? Formato?
- [ ] **Pitch ao vivo na final?** Quanto tempo? Q&A?
- [ ] **Código tem que ser open-source?** Licença obrigatória?
- [ ] **Limite de uso de APIs pagas / cloud?** Reembolso?
- [ ] **Mudanças no Atlas/PID podem ser propostas ou só análises sobre eles?** (e-mail oficial: `pid@emaisenergia.org` / `plataforma@emaisenergia.org`)
- [ ] **A equipe pode propor um produto que rode SOBRE a PID (ex.: extensão, camada externa) ou tem que ser standalone?**

### Sobre dados

- [ ] **Os dados-fonte da PID (Indústrias por município) vêm de qual tabela IBGE/MapBiomas exatamente?** O LEIAME só lista os portais, não as tabelas — pode acelerar a equipe se mentor passar referência direta.
- [ ] **Dados primários do Atlas (clusters, indústrias mapeadas plant-by-plant) estão em CSV/GeoJSON em algum lugar?**
- [ ] **A PID tem layer service ArcGIS exposto?** (REST endpoint do ArcGIS Online — se sim, a equipe pode consumir os dados sem scraping).

### Sobre avaliação

- [ ] **Quem são os jurados?** (perfil técnico / negócio / política pública)
- [ ] **Os 5 critérios têm peso igual ou ponderado?**
- [ ] **Há critério explícito sobre qualidade de código?**

## Para a equipe (decisões internas)

- [ ] **Stack de cada um?** (linguagem dominante, experiência prévia em geo-data, design)
- [ ] **Quem assume papel de tech lead? Quem é narrador (pitch)?**
- [ ] **Disponibilidade real em horas durante 48h.**
- [ ] **Ferramenta de comunicação?** (Discord do evento + WhatsApp do time? Slack?)
- [ ] **Repositório:** GitHub público ou privado? (atualmente público em `GabrielABSouza/petrolFuckers`)
- [ ] **Quem vai presencial vs. online?**

## Para investigar autonomamente

- [ ] **Inspecionar PID v2.0 ao vivo** (https://experience.arcgis.com/experience/4fde76ed5b3341cab0553adb3708ec69/) — feature-set real, comparar com LEIAME, identificar a "feature mais frustrante".
- [ ] **Verificar se ArcGIS Experience expõe layer services REST** — abrir DevTools, network tab, identificar URLs `*.arcgis.com/.../FeatureServer/` ou `MapServer/`. Se sim, podemos consumir dados estruturados.
- [ ] **Buscar projetos similares** (atlas energéticos europeus, ferramentas IRENA, etc.) para benchmarks visuais e de UX.
- [ ] **Levantar 1 caso real recente** de decisão locacional industrial verde no Brasil — usar como história do pitch.
- [ ] **Confirmar se há kit de marca do E+** (logo, cores) para uso no pitch.

## Hipóteses não confirmadas a validar

- "Investidor industrial é a persona mais underserved" — análise no `06` sustenta. Confirmar com mentor que essa direção alinha com o que o E+ quer (alternativa: gestor público é mais alinhado à missão de policy-making).
- "Hackathon aceita escopo cross-trilha" — perguntar.
- "Premiação cobre apenas as 3 primeiras posições" — confirmar se há prêmios paralelos (categorias, menção honrosa).
- "Posicionar produto como **extensão** da PID, não substituto" — validar com mentor que essa narrativa é bem recebida.

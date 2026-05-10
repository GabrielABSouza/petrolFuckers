# SPEC — Finalização do header (logo expandida + insights motion + remoção de Lente/Modo)

> **Audiência:** agente implementador. Esta spec é prescritiva. Faça **exatamente** o que está aqui, na ordem em que está aqui, **nada mais e nada menos**.
>
> **Objetivo:** fechar a UI do front pra entrega do Hackathon E+. Remove os 3 blocos do header que não geram valor (brand text duplicado, Lente cosmética, Modo de análise sem efeito real no backend) e libera espaço pra: (a) logo PID maior; (b) carrossel de insights rotativos com motion (pattern AiPets) que mistura ranking-derived + incentivos públicos + EDA empírico + caso real.
>
> **Substitui** §B (Etapa B) de `docs/SPEC_INDICADOR_HARDENING_V1_5.md` — toda a remoção de Lente foi consolidada aqui junto com os outros ajustes do header.
>
> **Tempo estimado:** 50–70min. **GATED**: só rodar depois que `docs/SPEC_REESTRUTURACAO_DESIGN_SYSTEM_PID.md` estiver aplicada e committada (essa spec já assume o estado pós-design-system).

---

## 1. Pacto de não-fazer (LEIA ANTES DE QUALQUER COISA)

Você **NÃO PODE**:

1. Mover, redimensionar, reordenar nenhum elemento **fora do header**. Os 3 painéis (sidebar esquerda, mapa central, Copiloto direita) ficam intocados.
2. Mudar `padding`, `margin`, `gap`, `width`, `height`, `flex`, `grid` em qualquer className **fora do header e dos 2 lugares listados em §5.5**.
3. Adicionar dependências em `package.json` ou rodar `npm install` de qualquer pacote novo (`motion/react`, `lucide-react`, `react` já bastam).
4. Tocar em `BrazilMap.jsx` além das 2 linhas autorizadas em §5.5.
5. Tocar em `data.js` além de adicionar o export `INSIGHTS_HEADER` e remover `PERSONAS`.
6. Renomear `Copiloto.jsx`, `BrazilMap.jsx`, `App.jsx`, `data.js` ou qualquer file existente.
7. Recriar features que já foram removidas. Lente e Modo somem do produto, **não** voltem disfarçadas.
8. Calcular score para incentivos públicos. Eles continuam info-only.
9. Adicionar comentários explicativos além dos já existentes.
10. "Aproveitar pra refatorar" código adjacente.

Se em qualquer momento você sentir vontade de fazer um dos itens acima, **pare e devolva pro humano**.

---

## 2. Decisões fechadas

| Decisão | Valor |
|---|---|
| Logo size | `h-12` (atual: `h-9`). Aumenta proporcionalmente, mantém `w-auto`. |
| Brand text "Radar PID" + tagline | **Removido inteiro** — o `<div>` que envolve as duas linhas de texto vai pra fora junto com o `flex items-center gap-3`. Sobra só o `<img>` da logo dentro do bloco brand. |
| Lente (Investidor/Órgão público) | **Removida** — UI bloc + state `persona`/`setPersona` + chave `persona` no `ctxCopiloto` + import `PERSONAS` em `App.jsx` + export `PERSONAS` em `data.js` + destructure de `persona` em `Copiloto.jsx` + qualquer string condicional dependente de persona. |
| Modo de análise (Renováveis/Data Centers/Neoindustrialização) | **UI removida**. **Estado `modo` vira constante** com valor `"renovaveis"` (default atual). Pesos passam a ser fixos: `MODOS["renovaveis"].pesos`. `setModoComPesos` deletado. `setPesos` removido. |
| `modo` em `Copiloto.jsx` | **Mantido na destructure** — Copiloto continua recebendo modo via ctxCopiloto e usando textualmente. Como `modo === "renovaveis"` sempre, branching simplifica naturalmente sem edits. |
| `modo` em `BrazilMap.jsx` | Display "modo: X" no canto superior direito do mapa **removido** (linhas 71–73). É display redundante agora que filter sumiu. |
| InsightsCarousel | **Componente novo** dentro de `App.jsx` (não em arquivo separado). 4 insights rotativos a cada 5s com `AnimatePresence` + transição vertical, dots de progresso. Pattern direto do AiPets. |
| Conteúdo dos 4 insights | Lista fechada em §5.1 — não improvise. |
| Posição do `InsightsCarousel` | Entre o brand (à esquerda) e o cluster `theme toggle + Metodologia` (à direita), ocupando o espaço médio com `flex-1`. |
| Gap horizontal no header | Continua `gap-6` na div interna. Brand fica `gap-3` (já é o atual). |

---

## 3. Resumo dos arquivos tocados

| Arquivo | Mudança | Resumo |
|---|---|---|
| `web/src/data.js` | (a) Adicionar `export const INSIGHTS_HEADER = [...]`; (b) Remover `export const PERSONAS = {...}` (linha ~379) | +1 export, -1 export |
| `web/src/App.jsx` | (a) Remover `PERSONAS` do import; (b) Remover state `persona`/`setPersona`; (c) Substituir `modo` state + `pesos` state + `setModoComPesos` por constantes; (d) Remover `persona` do `ctxCopiloto`; (e) Remover brand text + tagline; (f) Aumentar logo `h-9` → `h-12`; (g) Remover bloco LENTE + bloco MODO + divider; (h) Adicionar componente `InsightsCarousel` (function definition + uso no header); (i) Adicionar imports de `Sparkles` em `lucide-react` | reescrita do header + cleanup de state |
| `web/src/Copiloto.jsx` | Remover `persona` da destructure de `ctx` (linha ~78). Se houver string condicional dependente de persona (linha ~240), substituir por versão neutra. | 1–2 linhas |
| `web/src/BrazilMap.jsx` | Remover o `<div>` "modo: X" no canto superior direito (linhas 71–73 aprox) | 1 div removida |

**Nada mais é tocado.** Nem Tailwind config, nem CSS, nem `scoring.js`, nem `index.html`.

---

## 4. Etapa-a-etapa

### 5.1 — Adicionar `INSIGHTS_HEADER` em `data.js`

Abrir `web/src/data.js`. **Antes** do export `PERSONAS` (que vai ser removido logo em seguida), adicione um novo export:

```js
export const INSIGHTS_HEADER = [
  "PA lidera H2 Verde — Pecém com score 0,61, 4 dos top 5 em PA e MG.",
  "REIDI 2025 aprovou 47 novos projetos renováveis, 60% no Nordeste.",
  "Biometano: 51% da capacidade outorgada está ociosa — gargalo a destravar.",
  "Vale do Aço: oportunidade biometano-siderurgia mapeada em 4 municípios.",
];
```

**Não** mude nada além disso na adição. Os 4 textos são exatos (incluindo pontuação) — não edite.

### 5.2 — Remover `PERSONAS` de `data.js`

Localize com `grep -n "PERSONAS" web/src/data.js`. Vai ter o bloco:

```js
export const PERSONAS = {
  investidor: { ... },
  orgao_publico: { ... },
};
```

**Apague o bloco inteiro** + o `export`. Se houver linha em branco órfã antes/depois, deixe **uma** linha em branco.

### 5.3 — Editar imports em `App.jsx`

**Linha 3** — adicionar `Sparkles` à lista de ícones do `lucide-react`:

```jsx
import { Lightbulb, X, GitCompareArrows, Info, Compass, MousePointerClick, MessagesSquare, Plus, Sun, Moon, Sparkles } from "lucide-react";
```

**Linha 5–13** — adicionar `INSIGHTS_HEADER` e remover `PERSONAS`:

```jsx
import {
  MUNICIPIOS,
  MODOS,
  CRITERIOS,
  PESO_DEFAULTS,
  INSTRUMENTOS_LABELS,
  CATEGORIAS_INSTRUMENTOS,
  INSIGHTS_HEADER,
} from "./data";
```

### 5.4 — Substituir state `persona`/`modo`/`pesos` por constantes em `App.jsx`

**Linhas 19–29** atualmente:

```jsx
  const [persona, setPersona] = useState("investidor");
  const [modo, setModo] = useState("renovaveis");
  const [pesos, setPesos] = useState({ ...PESO_DEFAULTS });
  const [selectedId, setSelectedId] = useState(null);
  const [compareId, setCompareId] = useState(null);
  const [methodOpen, setMethodOpen] = useState(false);

  const setModoComPesos = useCallback((novoModo) => {
    setModo(novoModo);
    setPesos({ ...MODOS[novoModo].pesos });
  }, []);
```

**Substitua inteiramente** por:

```jsx
  const modo = "renovaveis";
  const pesos = MODOS[modo].pesos;
  const [selectedId, setSelectedId] = useState(null);
  const [compareId, setCompareId] = useState(null);
  const [methodOpen, setMethodOpen] = useState(false);
```

> **Nota:** `useCallback` agora pode ficar no import sem ser usado (warning), mas tudo bem — outras partes do file podem usar. Se `grep -n "useCallback" web/src/App.jsx` retornar só a linha do import, removê-la do import; senão deixar.

### 5.5 — Remover `persona` do `ctxCopiloto` em `App.jsx`

**Linhas 66–73** atualmente:

```jsx
  const ctxCopiloto = {
    selecionado,
    ranking,
    modo,
    pesos: pesosNormalizados,
    persona,
    scores,
  };
```

**Substitua** por:

```jsx
  const ctxCopiloto = {
    selecionado,
    ranking,
    modo,
    pesos: pesosNormalizados,
    scores,
  };
```

### 5.6 — Reescrever o header de `App.jsx`

O bloco do header está aproximadamente entre as linhas 77–135. Localize com `grep -n "HEADER com brand" web/src/App.jsx`.

**Substitua todo o `<header>`** (linhas 77–135 aprox, do `<header>` até o `</header>` correspondente) por:

```jsx
      {/* HEADER — logo PID + insights rotativos + theme toggle + methodology */}
      <header className="border-b border-hairline-strong bg-ink-deeper/95 backdrop-blur flex-shrink-0">
        <div className="px-6 h-[72px] flex items-center gap-6">
          {/* Brand — logo PID maior, sem texto verbal */}
          <img
            src="/logo-pid.svg"
            alt="PID — Plataforma Interativa de Descarbonização"
            className="h-12 w-auto flex-shrink-0"
          />

          {/* Insights rotativos */}
          <InsightsCarousel />

          {/* Cluster direito: theme + metodologia */}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
              className="w-8 h-8 flex items-center justify-center text-paper/55 hover:text-accent transition-colors border border-hairline-strong"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={() => setMethodOpen(true)}
              className="flex items-center gap-1.5 text-[10.5px] tabular tracking-[0.18em] uppercase text-paper/55 hover:text-accent transition-colors px-2 py-1.5 font-mono"
            >
              <Info size={12} />
              Metodologia
            </button>
          </div>
        </div>
      </header>
```

> **Importante:** o `ml-auto` saiu do `<div>` interno do cluster Metodologia (que era o estado pós-design-system) e agora `flex-1` no `InsightsCarousel` empurra naturalmente o cluster direito pro canto. O `ml-auto flex-shrink-0` no cluster direito **redundante** mas não atrapalha.

### 5.7 — Adicionar a função `InsightsCarousel` em `App.jsx`

**Logo após** a função componente exportada (`export default function App() { ... }`), antes de qualquer outra função utilitária, adicione:

```jsx
/* ─────────────────────────────────────────────────────────────────────────── */

function InsightsCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setIdx((p) => (p + 1) % INSIGHTS_HEADER.length),
      5000
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex-1 flex items-center gap-4 px-5 h-full border-l border-r border-hairline-strong">
      {/* Eyebrow */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Sparkles size={12} className="text-amber" />
        <span className="text-[9px] tabular tracking-[0.22em] uppercase text-paper/45 font-mono">
          Insights
        </span>
      </div>

      {/* Texto rotativo */}
      <div className="relative h-6 overflow-hidden flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -18, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 flex items-center text-[12.5px] text-paper/85 font-sans leading-tight truncate"
          >
            {INSIGHTS_HEADER[idx]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicadores de progresso */}
      <div className="flex gap-1 flex-shrink-0">
        {INSIGHTS_HEADER.map((_, i) => (
          <span
            key={i}
            className={`h-1 transition-all duration-300 ${
              i === idx ? "w-4 bg-amber" : "w-1 bg-paper/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
```

> O componente é **inline neste arquivo** — não criar novo file `InsightsCarousel.jsx`. Mantém o pattern do projeto (todos os componentes inline em App.jsx).

### 5.8 — Limpeza de imports não-usados em `App.jsx`

Após as mudanças, rodar mentalmente:

```bash
grep -n "useCallback\|HeaderControl" web/src/App.jsx
```

- Se `useCallback` aparece só no import — **remover** do import (`import React, { useState, useMemo, useEffect }`).
- Se `HeaderControl` (componente que envolvia LENTE/MODO) está definido mas não é mais usado em nenhum lugar — **deletar a função** `HeaderControl` inteira do arquivo.

> Se você não tiver certeza, **NÃO REMOVA** — deixe pra evitar quebra. Warning de unused é aceitável.

### 5.9 — Editar `web/src/Copiloto.jsx`

**Linha ~78** — destructure de `ctx`. Encontre:

```jsx
const { selecionado, ranking, modo, persona, scores } = ctx;
```

Substitua por:

```jsx
const { selecionado, ranking, modo, scores } = ctx;
```

**Linha ~240** — string condicional. Encontre algo como:

```jsx
`Tradução para gestor público (lente atual: ${persona === "orgao_publico" ? "órgão público" : "investidor"}):`,
```

Substitua por (texto neutro):

```jsx
`Análise contextual:`,
```

Se houver outras referências a `persona` em Copiloto (`grep -n "persona" web/src/Copiloto.jsx`), simplifique cada uma removendo branching e mantendo só a versão sem persona.

### 5.10 — Editar `web/src/BrazilMap.jsx`

Localize **linhas 71–73** (com `grep -n "modo:" web/src/BrazilMap.jsx`):

```jsx
        <div className="text-[10px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono text-right">
          modo: <span className="text-amber">{modo}</span>
        </div>
```

**Apague o `<div>` inteiro** (3 linhas). Se houver vírgula/separador `<div className="h-px w-16 ...">` logo antes que ficou órfão (sem nada à direita), **apague esse separador também**.

Confirme com `grep -n "modo" web/src/BrazilMap.jsx` que ainda existe a prop `modo` na assinatura do componente — **não tire** (pode ser usada em comentários ou outros lugares; preserva pra não quebrar).

> **Nada mais é editado em `BrazilMap.jsx`** — strokes, gradientes, dots, labels permanecem.

---

## 6. Verificação visual

```bash
cd /Volumes/ExtremePro/hackaton_E+/web
npm run dev
```

### 6.1 Header (modo dark, default)

- [ ] Logo PID maior do que antes (`h-12` ≈ 48px de altura).
- [ ] **Não há mais texto** "Radar PID" ou "Triagem · Energia limpa · Convergência pública" ao lado da logo.
- [ ] **Não há mais Lente** (Investidor/Órgão público).
- [ ] **Não há mais Modo de análise** (Renováveis/Data Centers/Neoindustrialização).
- [ ] No espaço liberado: **Insights** com label `Sparkles + INSIGHTS` à esquerda + texto rotativo no centro + 4 dots à direita.
- [ ] Texto roda automaticamente a cada 5s, transição vertical suave (sobe e desaparece).
- [ ] Indicador (dot) ativo é o `bg-amber` largo (`w-4`), inativos são `bg-paper/20` quadrados pequenos.
- [ ] Theme toggle e Metodologia continuam no canto direito.
- [ ] Headers superiores do mapa não mostram mais "modo: X" (só "BR · Mercator · WGS84 · n=12").

### 6.2 Header (modo light)

- [ ] Tudo igual mas com cores flipadas via CSS-vars (já feito pelo design system).
- [ ] Hover/focus no theme toggle e Metodologia viram cinder em light.
- [ ] Pulse-soft do `<Sparkles>` permanece amber.

### 6.3 Funcionalidade (smoke test)

- [ ] Clicar no mapa abre painel lateral com município (idêntico ao anterior).
- [ ] Botão de comparação abre split-mode.
- [ ] Modal de Metodologia abre/fecha.
- [ ] Copiloto responde a sugestões.
- [ ] Console **zero erros** — sem `ReferenceError: persona is not defined`, `Cannot read properties of undefined`, ou warnings de Tailwind.

### 6.4 Persistência

- [ ] Theme toggle continua persistindo em `localStorage["pid-theme"]`.

---

## 7. Critério de aceite (DONE template)

```
DONE — header final + insights motion

- [x] §5.1 INSIGHTS_HEADER adicionado em data.js
- [x] §5.2 PERSONAS removido de data.js
- [x] §5.3 imports em App.jsx (Sparkles + INSIGHTS_HEADER, sem PERSONAS)
- [x] §5.4 state persona/modo/pesos virou constantes
- [x] §5.5 persona removido do ctxCopiloto
- [x] §5.6 header reescrito (logo h-12, sem brand text/Lente/Modo)
- [x] §5.7 InsightsCarousel adicionado (função + uso)
- [x] §5.8 imports limpos
- [x] §5.9 Copiloto.jsx — persona removido
- [x] §5.10 BrazilMap.jsx — display modo removido
- [x] §6.1 verificação dark OK
- [x] §6.2 verificação light OK
- [x] §6.3 smoke OK
- [x] §6.4 persistência OK

Próximo passo: capturar screenshots em ambos os temas pra equipe-464/Design/Protótipo final -Telas/.
```

---

## 8. Rollback

```bash
cd /Volumes/ExtremePro/hackaton_E+
git diff HEAD --name-only   # ver arquivos modificados
git checkout -- web/src/App.jsx web/src/data.js web/src/Copiloto.jsx web/src/BrazilMap.jsx
```

---

## 9. Resumo executivo (1 frase)

Remover o trio sem-valor do header (brand text, Lente, Modo), expandir a logo PID pra `h-12`, e plugar um `InsightsCarousel` motion-driven com 4 insights rotativos (ranking + incentivos + EDA + caso real) — limpeza estrutural + ganho narrativo, sem mexer em layout fora do header.

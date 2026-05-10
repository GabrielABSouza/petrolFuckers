# SPEC — Reestruturação do front pro design system da PID (dual-theme)

> **Audiência:** agente implementador. Esta spec é prescritiva — você não tem liberdade criativa. Faça **exatamente** o que está aqui, na ordem em que está aqui, **nada mais e nada menos**.
>
> **Objetivo:** alinhar `web/` ao design system institucional da PID exigido pelo regulamento do Hackathon E+ (logo + nome + paleta), e adicionar troca entre tema **claro** e **escuro**, **sem alterar layout, espaçamento, tipografia ou disposição de qualquer elemento da UI**.
>
> **Tempo estimado:** 60–90 min de trabalho, +30 min de teste visual. Deadline da entrega final: dom 10 mai 2026 21:59 BRT.

---

## 1. Pacto de não-alteração visual (LEIA ANTES DE QUALQUER COISA)

A disposição da UI já foi aprovada pelo product owner. Você **NÃO PODE**:

1. Mover, redimensionar, reordenar, agrupar ou ocultar nenhum elemento.
2. Mudar `padding`, `margin`, `gap`, `width`, `height`, `flex`, `grid`, `position` em **qualquer** className existente.
3. Mudar fontes, `font-size`, `font-weight`, `tracking`, `leading`, `letter-spacing`.
4. Mudar bordas, `border-radius`, sombras, animações, transições.
5. Adicionar componentes novos **fora** do escopo desta spec (apenas o `ThemeToggle` enumerado abaixo é permitido).
6. "Aproveitar pra refatorar" código adjacente. Cirúrgico = só linhas listadas.
7. Trocar bibliotecas, adicionar dependências em `package.json`, ou rodar `npm install` de qualquer pacote novo.
8. Mudar a paleta de scores (`amber`, `mango`, `ember`, `cinder`) — essas cores são **semânticas** (qualidade do score) e **não flipam entre temas**.
9. Tocar em `data.js`, `scoring.js`, `main.jsx`, `brazil_topo.json`. Eles são out-of-scope desta spec. **Exceção autorizada** em `BrazilMap.jsx`: 3 linhas (116, 137, 151) trocando rgba hardcoded por `var(--map-stroke-*)` — ver §5.6.
10. Adicionar comentários explicativos no código além dos já existentes.

Se em qualquer momento você sentir vontade de fazer um dos itens acima, **pare e devolva pro humano** com a dúvida — não execute.

---

## 2. Decisões fechadas (não negociáveis)

| Decisão | Valor |
|---|---|
| Logo a usar | `SVG/Logo principal.svg` (pílula navy `#03254d` + texto branco "PID" + acento `#fa441a`). É a logo "principal" oficial. |
| Tema padrão (default) | **dark**. `localStorage` vazio = dark. |
| Persistência do tema | `localStorage["pid-theme"]` com valor `"dark"` ou `"light"`. |
| Mecanismo de flip | CSS variables redefinidas via seletor `[data-theme="light"]` no `<html>`. JSX classNames **não mudam** (exceto 5 linhas listadas em §6.4). |
| Token system | Tailwind colors passam a usar `rgb(var(--xxx-rgb) / <alpha-value>)` para suportar o modificador de alpha (ex: `bg-ink-deeper/95`). |
| Toggle UI | Botão único de 32x32 px no header, à direita da seção "Modo de análise" e à esquerda do botão "Metodologia". Ícone `Sun` (em modo dark) / `Moon` (em modo light), de `lucide-react`. Sem texto, sem tooltip extra. |
| Score colors (amber/mango/ember/cinder) | **Fixos em ambos os temas**. Não viram CSS-var-based. |
| Cor navy oficial | `#03254d` (do SVG e da `Paleta de cores.svg`). Substitui `#05274b` que está hoje em `tailwind.config.js`. |
| Texto sobre fundo amber (chips selecionados, bolha do copiloto, botão enviar) | Sempre navy `#03254d` — nos dois temas. Implementação: substituir `text-ink-deepest` por `text-[#03254d]` nas 5 linhas listadas em §6.4. |
| Token `accent` (interação: hover/focus) | **Theme-aware.** Dark = amber `#fcc20a`. Light = cinder `#fa441a` (contraste ~4:1 sobre cream, alinhado com brand PID — é a cor do `Ícone.svg`). Aplicado APENAS em hover/focus rings e backgrounds tinted por hover. `text-amber`/`bg-amber` sólidos NÃO flipam. |
| `RadarMark` (radar SVG animado) | **Removido** e substituído pelo logo PID via `<img>`. Função `RadarMark()` é deletada inteira (App.jsx linhas 193–223 aprox). |

---

## 3. Inventário de assets disponíveis (você não precisa criar nada)

```
/Volumes/ExtremePro/hackaton_E+/SVG/
├── Logo principal.svg   ← USAR ESTE no header (1920×709 viewBox, pílula navy)
├── Logo opcao 2.svg     ← ignorar
├── Logo opcao 3.svg     ← ignorar
├── Logo opcao 4.svg     ← ignorar
├── Ícone.svg            ← copiar para favicon (1080×1080 circular, fundo cinder)
└── Paleta de cores.svg  ← referência apenas, não usar no produto
```

Cores oficiais confirmadas em `Paleta de cores.svg` (8 cores):
- `#becccc` mist | `#03254d` navy | `#fa441a` cinder | `#f89069` salmão (não usado)
- `#550c18` borgonha (não usado) | `#b5446e` rosa (não usado) | `#f5f749` amarelo-limão (não usado) | `#4d4e03` verde-oliva (não usado)

---

## 4. Resumo dos arquivos a tocar

| Arquivo | Tipo de mudança | Linhas |
|---|---|---|
| `web/public/logo-pid.svg` | **CRIAR** (cópia de `SVG/Logo principal.svg`) | — |
| `web/public/logo-pid-icone.svg` | **CRIAR** (cópia de `SVG/Ícone.svg`, opcional para favicon) | — |
| `web/index.html` | Editar `<meta theme-color>` + adicionar `<link rel="icon">` | 6, 9 |
| `web/tailwind.config.js` | Reescrever `theme.extend.colors` (semantic tokens viram CSS-var-based) | 6–34 |
| `web/src/index.css` | Reescrever bloco `:root` + adicionar bloco `[data-theme="light"]` + ajustar `body` | 5–24, +novo bloco |
| `web/src/App.jsx` | (a) substituir `<RadarMark />` por `<img>`; (b) deletar função `RadarMark`; (c) adicionar `useEffect` de tema; (d) adicionar `ThemeToggle` no header; (e) trocar `text-ink-deepest` por `text-[#03254d]` em 3 lugares; (f) flip `*-amber` → `*-accent` em 11 hovers/focus | 72, 94, 95, 113, 114, 126, 193–223, 296, 382, 383, 392, 414, 620, 715, 848, +novo state/effect |
| `web/src/BrazilMap.jsx` | Trocar 3 strokes hardcoded `rgba(244,241,234,X)` por `var(--map-stroke-*)` | 116, 137, 151 |
| `web/src/Copiloto.jsx` | (a) Trocar `text-ink-deepest` por `text-[#03254d]` em 2 lugares; (b) flip hovers/focus `*-amber` → `*-accent` em 3 lugares | 338, 356, 388, 392 |

**Nada mais é tocado.** Se você se pegar editando outro arquivo, pare e devolva pro humano.

---

## 5. Etapa-a-etapa, em ordem (não pule)

### 5.1 — Copiar logos pra `web/public/`

```bash
cp "/Volumes/ExtremePro/hackaton_E+/SVG/Logo principal.svg" "/Volumes/ExtremePro/hackaton_E+/web/public/logo-pid.svg"
cp "/Volumes/ExtremePro/hackaton_E+/SVG/Ícone.svg" "/Volumes/ExtremePro/hackaton_E+/web/public/logo-pid-icone.svg"
```

Também copiar pra `equipe-464/Design/Logotipo/` (entregável obrigatório):

```bash
mkdir -p "/Volumes/ExtremePro/hackaton_E+/equipe-464/Design/Logotipo"
cp "/Volumes/ExtremePro/hackaton_E+/SVG/Logo principal.svg" "/Volumes/ExtremePro/hackaton_E+/equipe-464/Design/Logotipo/logo-pid-principal.svg"
cp "/Volumes/ExtremePro/hackaton_E+/SVG/Ícone.svg" "/Volumes/ExtremePro/hackaton_E+/equipe-464/Design/Logotipo/logo-pid-icone.svg"
cp "/Volumes/ExtremePro/hackaton_E+/SVG/Paleta de cores.svg" "/Volumes/ExtremePro/hackaton_E+/equipe-464/Design/Logotipo/paleta-pid.svg"
```

Verificar:
```bash
ls -la /Volumes/ExtremePro/hackaton_E+/web/public/
```
Deve listar `logo-pid.svg` e `logo-pid-icone.svg`.

### 5.2 — Atualizar `web/index.html`

**Linha 6** — `<meta name="theme-color" content="#031a33" />`
→ Substitua por:
```html
    <meta name="theme-color" content="#03254d" />
```

**Após a linha 6** (e antes do `<link rel="preconnect">`), adicione:
```html
    <link rel="icon" type="image/svg+xml" href="/logo-pid-icone.svg" />
```

Deixa o resto do arquivo intocado.

### 5.3 — Reescrever `web/tailwind.config.js`

Substitua **inteiramente** o bloco `theme.extend.colors` (linhas 6–34) por:

```js
      colors: {
        // Tokens semânticos de superfície/foreground — flipam entre temas via CSS vars
        ink: {
          DEFAULT: "rgb(var(--ink-rgb) / <alpha-value>)",
          deeper: "rgb(var(--ink-deeper-rgb) / <alpha-value>)",
          deepest: "rgb(var(--ink-deepest-rgb) / <alpha-value>)",
        },
        paper: "rgb(var(--paper-rgb) / <alpha-value>)",
        bone: "rgb(var(--bone-rgb) / <alpha-value>)",
        mist: {
          DEFAULT: "rgb(var(--mist-rgb) / <alpha-value>)",
          400: "rgb(var(--mist-400-rgb) / <alpha-value>)",
        },
        // Hairline (borders sutis) — theme-aware via CSS var. Alpha hard-coded.
        hairline: {
          DEFAULT: "rgb(var(--hairline-rgb) / 0.08)",
          strong: "rgb(var(--hairline-rgb) / 0.18)",
        },
        // Accent token — APENAS pra hover/focus rings. Theme-aware: dark=amber, light=cinder.
        accent: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
        },
        // Score scale — FIXAS em ambos os temas (semânticas)
        amber: {
          DEFAULT: "#fcc20a",
          dim: "#d4a309",
        },
        mango: "#fc9e24",
        ember: "#fc6926",
        cinder: "#fa441a",
        graphite: "#181818",
        moss: "#5b7a6a",
        slate: {
          dim: "#94a3b8",
        },
      },
```

**Tudo o resto** do arquivo (`fontFamily`, `letterSpacing`, `animation`, `keyframes`, `plugins`) fica **idêntico**.

### 5.4 — Reescrever bloco de tema em `web/src/index.css`

Substitua **inteiramente** o bloco `:root` (linhas 5–24) por:

```css
:root {
  /* Surface tokens — flipam entre temas. RGB triplets (sem vírgula) pra suportar alpha. */
  --ink-rgb: 5 39 75;            /* #05274b — ainda usado como inset em dark */
  --ink-deeper-rgb: 3 26 51;     /* #031a33 */
  --ink-deepest-rgb: 2 15 31;    /* #020f1f */
  --paper-rgb: 244 241 234;      /* #f4f1ea */
  --bone-rgb: 232 227 214;       /* #e8e3d6 */
  --mist-rgb: 190 204 204;       /* #becccc */
  --mist-400-rgb: 168 185 185;   /* #a8b9b9 */

  /* Hairline (border sutil) — paper@8%/18% em dark, navy@8%/18% em light */
  --hairline-rgb: 244 241 234;

  /* Accent (hover/focus) — flipa entre temas */
  --accent-rgb: 252 194 10;      /* dark default = amber */
  --accent: #fcc20a;

  /* Aliases hex pra uso em SVGs e estilos não-Tailwind (ex: scoring.js) */
  --ink: #05274b;
  --ink-deeper: #031a33;
  --ink-deepest: #020f1f;
  --paper: #f4f1ea;
  --bone: #e8e3d6;
  --mist: #becccc;

  /* Score scale — fixas em ambos os temas */
  --amber: #fcc20a;
  --amber-dim: #d4a309;
  --mango: #fc9e24;
  --ember: #fc6926;
  --cinder: #fa441a;
  --graphite: #181818;

  /* Hairlines theme-aware */
  --hairline: rgba(244, 241, 234, 0.08);
  --hairline-strong: rgba(244, 241, 234, 0.18);

  /* Texturas (decorativas) */
  --texture-tint: rgba(244, 241, 234, 0.012);
  --topo-dot: rgba(244, 241, 234, 0.045);
}

[data-theme="light"] {
  /* Surface vira claro; foreground vira navy PID */
  --ink-rgb: 232 227 214;        /* #e8e3d6 — inset levemente tingido */
  --ink-deeper-rgb: 244 241 234; /* #f4f1ea — body bg, warm cream institucional E+ */
  --ink-deepest-rgb: 255 255 255;/* #ffffff — cards (elevated) */
  --paper-rgb: 3 37 77;          /* #03254d — texto principal (navy oficial PID) */
  --bone-rgb: 26 53 89;          /* #1a3559 — texto secundário */
  --mist-rgb: 91 122 122;        /* #5b7a7a — mist escurecido pra contraste em light */
  --mist-400-rgb: 110 138 138;

  /* Hairline flipa pra navy — bordas sutis sobre cream */
  --hairline-rgb: 3 37 77;

  /* Accent flipa pra cinder (#fa441a) — contraste ~4:1 sobre cream */
  --accent-rgb: 250 68 26;
  --accent: #fa441a;

  --ink: #e8e3d6;
  --ink-deeper: #f4f1ea;
  --ink-deepest: #ffffff;
  --paper: #03254d;
  --bone: #1a3559;
  --mist: #5b7a7a;

  --hairline: rgba(3, 37, 77, 0.10);
  --hairline-strong: rgba(3, 37, 77, 0.22);

  --texture-tint: rgba(3, 37, 77, 0.020);
  --topo-dot: rgba(3, 37, 77, 0.060);
}
```

**Atualize também** as classes `scan-lines` e `topo-dots` mais embaixo no mesmo arquivo (linhas ~158 e ~168) pra usarem os tokens theme-aware:

Linha ~163 (dentro de `.scan-lines`):
```css
    rgba(244, 241, 234, 0.012) 2px,
    rgba(244, 241, 234, 0.012) 3px
```
→ Substitua por:
```css
    var(--texture-tint) 2px,
    var(--texture-tint) 3px
```

Linha ~171 (dentro de `.topo-dots`):
```css
    rgba(244, 241, 234, 0.045) 0.7px,
```
→ Substitua por:
```css
    var(--topo-dot) 0.7px,
```

**Tudo mais** no `index.css` fica idêntico (sliders, scrollbars, animações, etc).

### 5.5 — Editar `web/src/App.jsx`

#### 5.5.1 Imports (linha 1–3)

Edite a linha 3 para incluir `Sun` e `Moon`:

```jsx
import { Lightbulb, X, GitCompareArrows, Info, Compass, MousePointerClick, MessagesSquare, Plus, Sun, Moon } from "lucide-react";
```

E na linha 1, adicione `useEffect` à lista:
```jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
```

#### 5.5.2 Adicionar state + effect de tema dentro do componente principal

Procure a primeira função-componente exportada (provavelmente `export default function App()` ou similar) — é a função que retorna o JSX que começa em `<div className="h-screen bg-ink-deeper text-paper ...">` (linha 66).

**Logo após a última declaração de `useState` ou `useMemo` existente nessa função** (e antes do `return`), adicione:

```jsx
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("pid-theme") === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("pid-theme", theme);
  }, [theme]);
```

#### 5.5.3 Substituir `<RadarMark />` pelo logo

**Linha 72** — `<RadarMark />`
→ Substitua por:
```jsx
            <img
              src="/logo-pid.svg"
              alt="PID — Plataforma Interativa de Descarbonização"
              className="h-9 w-auto flex-shrink-0"
            />
```

#### 5.5.4 Inserir `ThemeToggle` no header

**Linha 123–131** (o bloco `<div className="ml-auto flex items-center">` com o botão Metodologia).

Localize:
```jsx
          <div className="ml-auto flex items-center">
            <button
              onClick={() => setMethodOpen(true)}
              className="flex items-center gap-1.5 text-[10.5px] tabular tracking-[0.18em] uppercase text-paper/55 hover:text-amber transition-colors px-2 py-1.5 font-mono"
            >
              <Info size={12} />
              Metodologia
            </button>
          </div>
```

Substitua **inteiramente** por:

```jsx
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
              className="w-8 h-8 flex items-center justify-center text-paper/55 hover:text-amber transition-colors border border-hairline-strong"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={() => setMethodOpen(true)}
              className="flex items-center gap-1.5 text-[10.5px] tabular tracking-[0.18em] uppercase text-paper/55 hover:text-amber transition-colors px-2 py-1.5 font-mono"
            >
              <Info size={12} />
              Metodologia
            </button>
          </div>
```

> **Nota:** mudei o `flex items-center` pra `flex items-center gap-2` pra dar respiro de 8px entre o toggle e Metodologia. Esse é o **único** ajuste de spacing autorizado nesta spec, justificado por inserção de novo elemento.

#### 5.5.5 Trocar `text-ink-deepest` por `text-[#03254d]` em 3 linhas

**Linha 94:**
```jsx
                      ? "bg-amber text-ink-deepest font-medium"
```
→
```jsx
                      ? "bg-amber text-[#03254d] font-medium"
```

**Linha 113:**
```jsx
                      ? "bg-amber text-ink-deepest font-medium"
```
→
```jsx
                      ? "bg-amber text-[#03254d] font-medium"
```

**Linha 382:**
```jsx
                ? "bg-amber text-ink-deepest border-amber"
```
→
```jsx
                ? "bg-amber text-[#03254d] border-amber"
```

#### 5.5.6 Deletar a função `RadarMark`

**Linhas ~193–223** — a função inteira `function RadarMark() { return (<svg ...>...</svg>); }` deve ser **deletada por completo**. Confirme que não sobra nenhuma referência a `RadarMark` no arquivo (`grep -n "RadarMark" web/src/App.jsx` deve não retornar nada).

#### 5.5.7 Flip `*-amber` → `*-accent` em hovers/focus (8 linhas)

**Apenas as classes prefixadas com `hover:` ou `focus:`. NÃO toque em `text-amber`, `bg-amber`, `border-amber` sem prefixo — esses ficam amber em ambos os temas (são brand sólido / score-positivo).**

Faça as substituições **exatas** abaixo. Cada uma é a linha inteira; copie-cole pra evitar erro de digitação:

**Linha 95** — `: "text-paper/75 hover:text-amber"` → `: "text-paper/75 hover:text-accent"`

**Linha 114** — `: "text-paper/75 hover:text-amber"` → `: "text-paper/75 hover:text-accent"`

**Linha 126** — encontrar `hover:text-amber transition-colors` e trocar por `hover:text-accent transition-colors`. (a linha inteira tem outras classes; substitua só esse pedaço.)

**Linha 296** — `... border-l-2 border-amber pl-3 py-1.5 hover:bg-amber/5 transition-colors"` → trocar `hover:bg-amber/5` por `hover:bg-accent/5`. (deixe `border-amber` quieto — é brand sólido.)

**Linha 383** — `: "border-amber/60 text-amber hover:bg-amber/10"` → `: "border-amber/60 text-amber hover:bg-accent/10"`

**Linha 392** — `className="text-paper/45 hover:text-amber p-1"` → `className="text-paper/45 hover:text-accent p-1"`

**Linha 414** — encontrar `hover:border-amber focus:border-amber` e trocar por `hover:border-accent focus:border-accent`. (a linha tem outras classes; substitua só esse pedaço.)

**Linha 620** — `className="text-paper/45 hover:text-amber p-1 -mr-1"` → `className="text-paper/45 hover:text-accent p-1 -mr-1"`

**Linha 715** — encontrar `hover:border-amber focus:border-amber` e trocar por `hover:border-accent focus:border-accent`.

**Linha 848** — `className="absolute top-4 right-4 text-paper/55 hover:text-amber"` → `className="absolute top-4 right-4 text-paper/55 hover:text-accent"`

> **Importante:** se em alguma linha você ver `bg-amber-dim` (ex: `hover:bg-amber-dim`), **não toque** — é o estado pressionado de um botão amber sólido, fica amber em ambos os temas.

### 5.6 — Editar `web/src/BrazilMap.jsx` (exceção autorizada à §1)

**Motivo:** os strokes da silhueta dos estados estão hardcoded como `rgba(244, 241, 234, X)` (paper-cream), invisíveis em modo light. Precisam virar vars theme-aware.

**Pré-requisito:** ter executado o §5.4 com os 3 vars `--map-stroke-soft/mid/strong` adicionados em ambos os blocos `:root` e `[data-theme="light"]`. Se ainda não, volte ao §5.4 e adicione antes de continuar.

Adicione (caso o §5.4 ainda não tenha) ao bloco `:root` do `index.css`, depois de `--topo-dot`:

```css
  /* Strokes do mapa — flipam pra ficar visíveis em ambos os temas */
  --map-stroke-soft: rgba(244, 241, 234, 0.025);
  --map-stroke-mid: rgba(244, 241, 234, 0.18);
  --map-stroke-strong: rgba(244, 241, 234, 0.32);
```

E ao bloco `[data-theme="light"]`, depois de `--topo-dot`:

```css
  --map-stroke-soft: rgba(3, 37, 77, 0.05);
  --map-stroke-mid: rgba(3, 37, 77, 0.20);
  --map-stroke-strong: rgba(3, 37, 77, 0.38);
```

**Edits no `BrazilMap.jsx`:**

**Linha 116** (dentro do `<pattern id="hatch">`):
```jsx
              stroke="rgba(244,241,234,0.025)"
```
→
```jsx
              stroke="var(--map-stroke-soft)"
```

**Linha 137** (fill hatch dos estados):
```jsx
              stroke="rgba(244, 241, 234, 0.18)"
```
→
```jsx
              stroke="var(--map-stroke-mid)"
```

**Linha 151** (contorno mais visível):
```jsx
              stroke="rgba(244, 241, 234, 0.32)"
```
→
```jsx
              stroke="var(--map-stroke-strong)"
```

**Nada mais** pode ser editado em `BrazilMap.jsx`. Pontos, crosshairs, textos de label, gradientes — tudo permanece intocado.

### 5.7 — Editar `web/src/Copiloto.jsx`

#### 5.6.1 Trocar `text-ink-deepest` por `text-[#03254d]` em 2 lugares

**Linha 356:**
```jsx
                  <div className="bg-amber text-ink-deepest text-sm px-3 py-2 max-w-[88%] font-medium leading-snug">
```
→
```jsx
                  <div className="bg-amber text-[#03254d] text-sm px-3 py-2 max-w-[88%] font-medium leading-snug">
```

**Linha 392:**
```jsx
          className="bg-amber text-ink-deepest px-3 hover:bg-amber-dim transition-colors disabled:opacity-30"
```
→
```jsx
          className="bg-amber text-[#03254d] px-3 hover:bg-amber-dim transition-colors disabled:opacity-30"
```

> Note que `hover:bg-amber-dim` continua amber-dim (estado pressionado do botão amber sólido). Não tocar.

#### 5.6.2 Flip hovers/focus pra accent (3 lugares)

**Linha 338** — encontrar `hover:border-amber hover:text-amber` e trocar por `hover:border-accent hover:text-accent`. (a linha tem outras classes; substitua só esse pedaço.)

**Linha 388** — encontrar `focus:border-amber` e trocar por `focus:border-accent`.

> **Não tocar** na linha 363/364 (`border-amber bg-amber/[0.03]` no balão do copiloto) — é estado ativo brand-sólido, fica amber.

---

## 6. Verificação (você precisa rodar e olhar)

Ao final de todas as edições:

### 6.1 Build sanity

```bash
cd /Volumes/ExtremePro/hackaton_E+/web
npm run dev
```

A página deve abrir em `http://localhost:5173` **sem erros no console** e **sem warnings de Tailwind**.

### 6.2 Teste visual em modo dark (default)

Abra a página em modo anônimo (sem `localStorage` prévio). Confirme:

- [ ] A logo PID (pílula navy + texto branco "PID") aparece no header onde antes era o radar animado.
- [ ] O texto "Radar PID" continua **ao lado** da logo, não desapareceu.
- [ ] Botão de tema (ícone `Sun`) aparece à esquerda do botão "Metodologia".
- [ ] Chips de Lente/Modo selecionados continuam navy-quase-preto sobre amarelo (`#03254d` em vez de `#020f1f` — diferença é mínima, deve passar despercebida).
- [ ] Bolha do usuário no Copiloto (canto direito) tem texto navy sobre fundo amber.
- [ ] Botão de envio do Copiloto tem ícone navy sobre fundo amber.
- [ ] Tudo mais visualmente idêntico ao estado anterior. **Nenhum elemento se moveu, encolheu, esticou, mudou de cor de fundo ou borda.**
- [ ] Mapa do Brasil renderiza com pontos coloridos por score (amber/mango/ember/cinder).

### 6.3 Teste visual em modo light

Clique no botão de tema. Confirme:

- [ ] Ícone do botão troca para `Moon`.
- [ ] Body bg vira `#f4f1ea` (cream warm).
- [ ] Texto principal vira navy `#03254d`.
- [ ] Cards (`bg-ink-deepest`) viram brancos `#ffffff`.
- [ ] Sidebar esquerda (`bg-ink-deepest/40`) vira branco com 40% opacity (suave cinza-cream).
- [ ] Borders (`border-hairline-strong`) viram navy 22% — visíveis em light.
- [ ] Score colors (amber, mango, ember, cinder) **não mudam**.
- [ ] Logo PID continua legível (a pílula navy contrasta forte sobre o cream).
- [ ] Chips amber continuam com texto navy `#03254d`.
- [ ] **Hover/focus em modo light vira cinder `#fa441a`**, não amber. Testar:
  - Passar mouse sobre Lente "Investidor" não-selecionada → texto vira cinder.
  - Clicar num input dropdown (`<select>` de comparação) → border vira cinder.
  - Hover numa sugestão do Copiloto → texto e border-l ficam cinder.
  - Hover no botão "X" de fechar painel → vira cinder.
- [ ] Em modo dark, hover/focus continua amber `#fcc20a`.
- [ ] **Silhueta dos estados visível em ambos os temas:**
  - Dark: contorno cream sutil sobre navy (idêntico ao anterior).
  - Light: contorno navy ~20% sobre cream — fronteiras dos estados claramente discerníveis sem dominar o mapa.

### 6.4 Persistência

- [ ] Recarregue a página em modo light → deve permanecer light.
- [ ] Mude pra dark → recarregue → deve permanecer dark.
- [ ] Apague `localStorage.pid-theme` no DevTools → recarregue → deve abrir em dark (default).

### 6.5 Smoke regression

Verifique que **todo o resto continua funcionando**:

- [ ] Trocar Lente (Investidor/Órgão público) atualiza chip ativo e contexto/mensagem do Copiloto.
- [ ] Trocar Modo (Renováveis/Data Centers/Neoindustrialização) atualiza pesos.
- [ ] Clicar num município abre o painel esquerdo com score, breakdown, instrumentos.
- [ ] Botão de comparação abre split-mode.
- [ ] Modal de Metodologia abre e fecha.
- [ ] Copiloto responde a sugestões clicáveis.

### 6.6 Logs de erro (zero tolerância)

```bash
# No terminal onde rodou npm run dev, não pode aparecer:
# - "Could not find module '/logo-pid.svg'"
# - "ReferenceError: RadarMark is not defined"
# - "Cannot read properties of undefined"
# - Nenhum warning Tailwind sobre classe inválida.
```

Se qualquer um aparecer, **pare** e devolva pro humano com o stacktrace.

---

## 7. Critério de aceite (definition of done)

Você só pode reportar a tarefa como concluída se **TODOS** os checkboxes da §6 estiverem ✓. Reporte assim:

```
DONE — reestruturação design system PID
- [x] §5.1 Logos copiados (web/public + equipe-464/Design/Logotipo)
- [x] §5.2 index.html atualizado
- [x] §5.3 tailwind.config.js reescrito
- [x] §5.4 index.css com dark + light + texture vars
- [x] §5.5 App.jsx — logo, theme state, toggle, 3 text-color edits, 10 hover/focus accent edits, RadarMark deletada
- [x] §5.6 BrazilMap.jsx — 3 strokes hardcoded → vars theme-aware
- [x] §5.7 Copiloto.jsx — 2 text-color edits, 2 hover/focus accent edits
- [x] §6.1 Build sem erros
- [x] §6.2 Dark visual idêntico ao anterior (logo trocada)
- [x] §6.3 Light theme renderiza corretamente
- [x] §6.4 localStorage persiste
- [x] §6.5 Funcionalidades intactas
- [x] §6.6 Console zero erros

Próximo passo recomendado: capturar screenshots em ambos os temas pra equipe-464/Design/Protótipo final -Telas/.
```

Se algum item falhar, reporte com o item específico e o sintoma observado.

---

## 8. Rollback rápido (se algo der errado)

Tudo está em `git`. Antes de começar, garanta que está numa branch limpa ou snapshot:

```bash
cd /Volumes/ExtremePro/hackaton_E+
git status
# se tiver mudanças não-commitadas, primeiro: git stash
git checkout -b feat/design-system-pid
```

Pra reverter tudo se quebrar:

```bash
git checkout -- web/
rm -f web/public/logo-pid.svg web/public/logo-pid-icone.svg
```

---

## 9. O que esta spec NÃO faz (deliberadamente)

- Não captura screenshots — outra tarefa.
- Não preenche entregáveis docx — outra tarefa.
- Não grava pitch — outra tarefa.
- Não muda `BrazilMap.jsx`, `data.js`, `scoring.js` — escopo decidido em `docs/12_decisoes_arquitetura_radar_pid.md`.
- Não cria storybook, design tokens externos, ou sistema de componentes — overkill pro hackathon.
- Não adiciona testes automatizados — verificação é visual e manual.
- Não adiciona variantes de logo (a equipe usa só a "principal").

---

## 10. Resumo executivo (1 frase)

Trocar `RadarMark` pela logo PID oficial; adicionar flip dark↔light via CSS-vars (incluindo bordas hairline e strokes do mapa); ajustar 5 linhas de `text-ink-deepest` pra navy fixo; flipar 12 hovers/focus de amber pra cinder no modo light. Sem mover ou redesenhar **um único pixel** do layout aprovado.

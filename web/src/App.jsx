import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb, X, GitCompareArrows, Info, Compass, MousePointerClick, MessagesSquare, Plus, Sun, Moon, Sparkles } from "lucide-react";

import {
  MUNICIPIOS,
  MODOS,
  CRITERIOS,
  INSTRUMENTOS_LABELS,
  CATEGORIAS_INSTRUMENTOS,
  INSIGHTS_HEADER,
} from "./data";
import { computeBreakdown, computeFinalScore, principais } from "./scoring";
import BrazilMap from "./BrazilMap";
import Copiloto from "./Copiloto";

export default function App() {
  const modo = "renovaveis";
  const pesos = MODOS[modo].pesos;
  const [selectedId, setSelectedId] = useState(null);
  const [compareId, setCompareId] = useState(null);
  const [methodOpen, setMethodOpen] = useState(false);

  const pesosNormalizados = useMemo(() => {
    const total = Object.values(pesos).reduce((a, b) => a + b, 0) || 1;
    return Object.fromEntries(Object.entries(pesos).map(([k, v]) => [k, v / total]));
  }, [pesos]);

  const scores = useMemo(() => {
    const out = {};
    for (const m of MUNICIPIOS) {
      const breakdown = computeBreakdown(m);
      const final = computeFinalScore(breakdown, pesosNormalizados);
      out[m.id] = { breakdown, final };
    }
    return out;
  }, [pesosNormalizados]);

  const ranking = useMemo(
    () => [...MUNICIPIOS].sort((a, b) => scores[b.id].final - scores[a.id].final),
    [scores]
  );

  const selecionado = useMemo(
    () => MUNICIPIOS.find((m) => m.id === selectedId) ?? null,
    [selectedId]
  );

  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("pid-theme") === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("pid-theme", theme);
  }, [theme]);

  const ctxCopiloto = {
    selecionado,
    ranking,
    modo,
    pesos: pesosNormalizados,
    scores,
  };

  return (
    <div className="h-screen bg-ink-deeper text-paper relative flex flex-col overflow-hidden">
      {/* HEADER — logo PID + notícias rotativas + theme toggle + methodology */}
      <header className="border-b border-hairline-strong bg-ink-deeper/95 backdrop-blur flex-shrink-0">
        <div className="h-[88px] grid grid-cols-[340px_minmax(0,1fr)_400px]">
          {/* Brand — logo PID maior, sem texto verbal */}
          <div className="h-full flex items-center px-6 border-r border-hairline-strong">
            <img
              src="/logo-pid.svg"
              alt="PID — Plataforma Interativa de Descarbonização"
              className="h-[68px] w-auto flex-shrink-0"
            />
          </div>

          {/* Notícias rotativas */}
          <NoticiasCarousel />

          {/* Cluster direito: theme + metodologia */}
          <div className="h-full flex items-center justify-center gap-4 border-l border-hairline-strong">
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

      {/* GRID principal */}
      <div className="grid grid-cols-[340px_minmax(0,1fr)_400px] flex-1 min-h-0">
        <aside className="border-r border-hairline-strong bg-ink-deepest/40 overflow-y-auto scrollbar-none">
          {selecionado && compareId && compareId !== selecionado.id ? (
            <CompareView
              a={selecionado}
              b={MUNICIPIOS.find((m) => m.id === compareId)}
              scores={scores}
              ranking={ranking}
              onExit={() => setCompareId(null)}
              onChangeB={setCompareId}
            />
          ) : selecionado ? (
            <MunicipioCompacto
              selecionado={selecionado}
              score={scores[selecionado.id]}
              rankPos={ranking.findIndex((m) => m.id === selecionado.id) + 1}
              onClose={() => setSelectedId(null)}
              setCompareId={setCompareId}
              ranking={ranking}
              scores={scores}
            />
          ) : (
            <TutorialPanel ranking={ranking} scores={scores} onSelect={setSelectedId} />
          )}
        </aside>

        <main className="relative min-w-0">
          <BrazilMap
            municipios={MUNICIPIOS}
            scores={scores}
            selectedId={selectedId}
            compareId={compareId}
            onSelect={setSelectedId}
            modo={MODOS[modo].label}
          />
        </main>

        <aside className="border-l border-hairline-strong overflow-hidden">
          <Copiloto ctx={ctxCopiloto} />
        </aside>
      </div>

      <AnimatePresence>
        {methodOpen && (
          <MethodologyModal
            modo={modo}
            pesos={pesosNormalizados}
            onClose={() => setMethodOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

function NoticiasCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setIdx((p) => (p + 1) % INSIGHTS_HEADER.length),
      5000
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-full grid grid-cols-[104px_minmax(0,1fr)_56px] items-center gap-4 px-6">
      {/* Eyebrow */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Sparkles size={12} className="text-amber" />
        <span className="text-[9px] tabular tracking-[0.22em] uppercase text-paper/45 font-mono">
          Notícias
        </span>
      </div>

      {/* Texto rotativo */}
      <div className="relative h-10 overflow-hidden flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -18, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center text-center text-[12px] text-paper/85 font-sans leading-snug"
          >
            {INSIGHTS_HEADER[idx]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicadores de progresso */}
      <div className="flex gap-1 flex-shrink-0 justify-end">
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

/* ───────────────────────── TUTORIAL PANEL (sem seleção) ───────────────────────── */

function TutorialPanel({ ranking, scores, onSelect }) {
  return (
    <div className="p-5 space-y-6 h-full flex flex-col">
      <div>
        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono">
          Como usar
        </div>
        <h3 className="font-display text-[26px] leading-[1.1] font-light tracking-tightest text-paper mt-1.5">
          Da visualização à decisão.
        </h3>
        <p className="text-[12.5px] text-paper/65 leading-relaxed mt-2">
          Triagem rápida de oportunidades de energia limpa no Brasil, com instrumentos públicos
          aplicáveis por município.
        </p>
      </div>

      <div className="space-y-3">
        <Step
          icon={<Compass size={13} />}
          n="01"
          title="Configure no topo"
          body="Escolha sua lente (investidor ou órgão público) e o modo de análise. O score se ajusta automaticamente."
        />
        <Step
          icon={<MousePointerClick size={13} />}
          n="02"
          title="Clique num município"
          body="Os pontos no mapa se ordenam por score. Maiores e mais amarelos = melhores. Clique para abrir a análise aqui no painel."
        />
        <Step
          icon={<MessagesSquare size={13} />}
          n="03"
          title="Converse com o Copiloto"
          body="O agente à direita explica por que o município entrou no ranking, sugere instrumentos públicos e diferencia elegibilidade preliminar de confirmação."
        />
      </div>

      <div className="border-t border-hairline pt-4">
        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-3">
          Legenda do mapa
        </div>
        <div className="space-y-1.5 text-[11.5px]">
          <LegendRow color="var(--amber)" label="Score ≥ 75 — top oportunidade" />
          <LegendRow color="#fc6926" label="60–74 — sólido, vale aprofundar" />
          <LegendRow color="#fa441a" label="45–59 — parcial, há gargalos" />
          <LegendRow color="rgba(244,241,234,0.45)" label="< 45 — abaixo da triagem" />
        </div>
      </div>

      <div className="border-t border-hairline pt-4">
        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-3">
          Top 3 atual
        </div>
        <div className="space-y-1">
          {ranking.slice(0, 3).map((m, i) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className="w-full flex items-baseline justify-between text-left border-l-2 border-amber pl-3 py-1.5 hover:bg-accent/5 transition-colors"
            >
              <span className="text-[12.5px] text-paper">
                <span className="font-mono tabular text-amber mr-2">{i + 1}</span>
                {m.apelido || m.municipio}
                <span className="text-paper/40 text-xs ml-1.5 font-mono">/{m.uf}</span>
              </span>
              <span className="font-mono tabular text-amber text-sm">{scores[m.id].final}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-hairline">
        <p className="text-[9.5px] text-paper/35 leading-relaxed font-mono tracking-tight">
          Hackathon E+ Transição Energética 2026 · petrolFuckers · Triagem, não substitui due
          diligence técnica.
        </p>
      </div>
    </div>
  );
}

function Step({ icon, n, title, body }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-7 h-7 border border-amber/60 text-amber flex items-center justify-center">
          {icon}
        </div>
        <span className="text-[9px] tabular tracking-[0.18em] text-amber font-mono mt-1">
          {n}
        </span>
      </div>
      <div className="flex-1 pt-0.5">
        <div className="text-[12.5px] text-paper font-medium leading-tight">{title}</div>
        <p className="text-[11.5px] text-paper/65 leading-relaxed mt-0.5">{body}</p>
      </div>
    </div>
  );
}

function LegendRow({ color, label }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="block h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-paper/75">{label}</span>
    </div>
  );
}

/* ───────────────── MUNICÍPIO COMPACTO ───────────────── */

function MunicipioCompacto({
  selecionado,
  score,
  rankPos,
  onClose,
  setCompareId,
  ranking,
  scores,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { forca, gargalo } = principais(score.breakdown);

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono">
            <span>Município selecionado</span>
            <span className="text-paper/50">#{rankPos}</span>
          </div>
          <h3 className="font-display text-2xl font-light tracking-tightest text-paper mt-1 leading-[1.05]">
            {selecionado.apelido || selecionado.municipio}
            <span className="text-paper/40 text-base ml-1.5 font-mono">/{selecionado.uf}</span>
          </h3>
          <div className="text-[10px] text-paper/45 mt-0.5 font-mono tabular">
            {selecionado.lat.toFixed(3)}°S · {selecionado.lng.toFixed(3)}°W
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] tabular tracking-[0.16em] uppercase font-mono border transition-colors ${
              pickerOpen
                ? "bg-amber text-[#03254d] border-amber"
                : "border-amber/60 text-amber hover:bg-accent/10"
            }`}
            title="Comparar com outro município"
          >
            <Plus size={11} strokeWidth={2.5} />
            Comparar
          </button>
          <button
            onClick={onClose}
            className="text-paper/45 hover:text-accent p-1"
            aria-label="Fechar análise"
            title="Voltar ao tutorial"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {pickerOpen && (
        <div className="border border-amber/40 bg-amber/[0.04] p-3">
          <div className="text-[10px] tabular tracking-[0.18em] uppercase text-amber font-mono mb-2">
            Comparar com…
          </div>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                setCompareId(e.target.value);
                setPickerOpen(false);
              }
            }}
            className="w-full bg-ink-deepest border border-hairline-strong px-2.5 py-1.5 text-xs text-paper hover:border-accent focus:border-accent focus:outline-none font-mono"
            autoFocus
          >
            <option value="" className="bg-ink-deepest">
              — escolher município —
            </option>
            {ranking
              .filter((m) => m.id !== selecionado.id)
              .map((m) => (
                <option key={m.id} value={m.id} className="bg-ink-deepest">
                  {m.apelido || m.municipio}/{m.uf} · score {scores[m.id].final}
                </option>
              ))}
          </select>
          <p className="text-[10px] text-paper/55 mt-2 leading-snug">
            Ao escolher, o painel entra em modo lado-a-lado.
          </p>
        </div>
      )}

      <motion.div
        key={score.final}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-hairline-strong p-3.5 bg-ink-deepest/60 relative overflow-hidden"
      >
        <div className="absolute inset-0 hatch opacity-10" />
        <div className="relative flex items-baseline justify-between">
          <div>
            <div className="text-[9px] tabular tracking-[0.22em] uppercase text-paper/45 font-mono">
              Score de triagem
            </div>
            <div
              className="font-display font-light text-amber tracking-ultratight leading-none mt-0.5"
              style={{ fontSize: 48 }}
            >
              {score.final}
              <span className="text-paper/30 text-base font-mono ml-1">/100</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono">
              Convergência pública
            </div>
            <div className="text-amber text-lg font-mono tabular">
              {selecionado.convergenciaPublicaScore}
              <span className="text-paper/30 text-xs">/100</span>
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-2 gap-3 mt-3 text-[11px]">
          <div className="border-l border-amber pl-2">
            <div className="text-[9px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono">
              Força
            </div>
            <div className="text-paper">
              {labelCriterio(forca)}{" "}
              <span className="text-amber ml-1">{score.breakdown[forca]}</span>
            </div>
          </div>
          <div className="border-l border-cinder pl-2">
            <div className="text-[9px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono">
              Gargalo
            </div>
            <div className="text-paper">
              {labelCriterio(gargalo)}{" "}
              <span className="text-cinder ml-1">{score.breakdown[gargalo]}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div>
        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-2">
          Breakdown
        </div>
        <div className="space-y-1.5">
          {CRITERIOS.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <span className="text-[10.5px] text-paper/75 w-32 truncate">{c.label}</span>
              <div className="flex-1 h-1.5 bg-paper/5 relative">
                <motion.div
                  className="absolute left-0 top-0 bottom-0"
                  initial={{ width: 0 }}
                  animate={{ width: `${score.breakdown[c.id]}%` }}
                  transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{
                    background:
                      score.breakdown[c.id] >= 70
                        ? "var(--amber)"
                        : score.breakdown[c.id] >= 45
                        ? "#fc6926"
                        : "rgba(244,241,234,0.35)",
                  }}
                />
              </div>
              <span className="text-[10.5px] font-mono tabular text-paper w-7 text-right">
                {score.breakdown[c.id]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-2 flex items-center gap-2">
          <Lightbulb size={11} />
          Convergência pública (preliminar)
        </div>
        <InstrumentosBadges instrumentos={selecionado.instrumentosPublicos} />
        <p className="text-[10px] text-paper/45 mt-2 leading-snug italic">
          Triagem de elegibilidade. Não é parecer jurídico — pergunte ao Copiloto para detalhes.
        </p>
      </div>

    </div>
  );
}

function labelCriterio(id) {
  return CRITERIOS.find((c) => c.id === id)?.label || id;
}

function InstrumentosBadges({ instrumentos }) {
  const grupos = {};
  for (const id of instrumentos) {
    const inst = INSTRUMENTOS_LABELS[id];
    if (!inst) continue;
    if (!grupos[inst.categoria]) grupos[inst.categoria] = [];
    grupos[inst.categoria].push(id);
  }
  return (
    <div className="space-y-2">
      {Object.entries(grupos).map(([cat, ids]) => (
        <div key={cat}>
          <div className="text-[9px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono mb-1 flex items-center gap-1">
            <span className="text-amber">{CATEGORIAS_INSTRUMENTOS[cat].glifo}</span>
            {CATEGORIAS_INSTRUMENTOS[cat].label}
          </div>
          <div className="flex flex-wrap gap-1">
            {ids.map((id) => {
              const inst = INSTRUMENTOS_LABELS[id];
              const colorClass =
                inst.cor === "amber"
                  ? "border-amber/50 text-amber bg-amber/5"
                  : inst.cor === "ember"
                  ? "border-ember/50 text-ember bg-ember/5"
                  : "border-paper/20 text-paper/75 bg-paper/[0.02]";
              return (
                <span
                  key={id}
                  className={`text-[10.5px] font-mono tabular px-1.5 py-0.5 border ${colorClass} leading-tight`}
                  title={`${inst.nome} · elegibilidade preliminar`}
                >
                  {inst.nome}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────── COMPARE VIEW (split mode) ───────────────── */

function CompareView({ a, b, scores, ranking, onExit, onChangeB }) {
  const sa = scores[a.id];
  const sb = scores[b.id];
  const finalDelta = sa.final - sb.final;

  // Instrumentos públicos: comuns vs exclusivos
  const setA = new Set(a.instrumentosPublicos);
  const setB = new Set(b.instrumentosPublicos);
  const comuns = [...setA].filter((i) => setB.has(i));
  const soA = [...setA].filter((i) => !setB.has(i));
  const soB = [...setB].filter((i) => !setA.has(i));

  // Verdict text
  const breakdownA = sa.breakdown;
  const breakdownB = sb.breakdown;
  const aBetter = CRITERIOS.filter((c) => breakdownA[c.id] > breakdownB[c.id])
    .sort((x, y) => (breakdownA[y.id] - breakdownB[y.id]) - (breakdownA[x.id] - breakdownB[x.id]))
    .slice(0, 1);
  const bBetter = CRITERIOS.filter((c) => breakdownB[c.id] > breakdownA[c.id])
    .sort((x, y) => (breakdownB[y.id] - breakdownA[y.id]) - (breakdownB[x.id] - breakdownA[x.id]))
    .slice(0, 1);

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono">
            <GitCompareArrows size={11} />
            <span>Modo comparação</span>
          </div>
          <h3 className="font-display text-[22px] font-light tracking-tightest text-paper mt-1 leading-[1.1]">
            <span className="text-amber">{a.apelido || a.municipio}</span>
            <span className="text-paper/30 mx-1.5 text-base font-mono">vs</span>
            <span>{b.apelido || b.municipio}</span>
          </h3>
        </div>
        <button
          onClick={onExit}
          className="text-paper/45 hover:text-accent p-1 -mr-1"
          aria-label="Sair da comparação"
          title="Voltar à análise individual"
        >
          <X size={14} />
        </button>
      </div>

      {/* Scores side-by-side */}
      <div className="grid grid-cols-2 gap-2">
        <ScoreCard mun={a} score={sa} accent="amber" />
        <ScoreCard mun={b} score={sb} accent="ember" />
      </div>

      {/* Verdict */}
      <div className="border-l-2 border-amber pl-3 text-[12px] text-paper/85 leading-relaxed">
        {Math.abs(finalDelta) > 5 ? (
          <span>
            <span className={finalDelta > 0 ? "text-amber" : "text-ember"}>
              {finalDelta > 0 ? a.apelido || a.municipio : b.apelido || b.municipio}
            </span>{" "}
            lidera o score geral por {Math.abs(finalDelta)} pontos.
          </span>
        ) : (
          <span>Score geral muito próximo — diferença está nos critérios.</span>
        )}
        {aBetter[0] && bBetter[0] && (
          <span>
            {" "}
            <span className="text-amber">{a.apelido || a.municipio}</span> brilha em{" "}
            {aBetter[0].label.toLowerCase()};{" "}
            <span className="text-ember">{b.apelido || b.municipio}</span> lidera em{" "}
            {bBetter[0].label.toLowerCase()}.
          </span>
        )}
      </div>

      {/* Breakdown — barras-de-confronto */}
      <div>
        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-3">
          Confronto por critério
        </div>
        <div className="space-y-3">
          {CRITERIOS.map((c) => (
            <ConfrontoRow
              key={c.id}
              label={c.label}
              va={breakdownA[c.id]}
              vb={breakdownB[c.id]}
            />
          ))}
        </div>
      </div>

      {/* Convergência pública */}
      <div>
        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-2 flex items-center gap-2">
          <Lightbulb size={11} />
          Instrumentos públicos
        </div>

        {comuns.length > 0 && (
          <div className="mb-2.5">
            <div className="text-[9px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono mb-1">
              ◆ Em ambos
            </div>
            <BadgeRow ids={comuns} accent="amber" />
          </div>
        )}
        {soA.length > 0 && (
          <div className="mb-2.5">
            <div className="text-[9px] tabular tracking-[0.18em] uppercase text-amber font-mono mb-1">
              ▲ Só {a.apelido || a.municipio}
            </div>
            <BadgeRow ids={soA} accent="amber" />
          </div>
        )}
        {soB.length > 0 && (
          <div className="mb-2.5">
            <div className="text-[9px] tabular tracking-[0.18em] uppercase text-ember font-mono mb-1">
              ▲ Só {b.apelido || b.municipio}
            </div>
            <BadgeRow ids={soB} accent="ember" />
          </div>
        )}
      </div>

      {/* Trocar B */}
      <div className="pt-3 border-t border-hairline">
        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-paper/55 font-mono mb-2">
          Trocar comparação
        </div>
        <select
          value={b.id}
          onChange={(e) => onChangeB(e.target.value)}
          className="w-full bg-transparent border border-hairline-strong px-2.5 py-1.5 text-xs text-paper hover:border-accent focus:border-accent focus:outline-none font-mono"
        >
          {ranking
            .filter((m) => m.id !== a.id)
            .map((m) => (
              <option key={m.id} value={m.id} className="bg-ink-deepest">
                {m.apelido || m.municipio}/{m.uf} · score {scores[m.id].final}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}

function ScoreCard({ mun, score, accent }) {
  const accentColor = accent === "amber" ? "var(--amber)" : "#fc6926";
  const accentClass = accent === "amber" ? "text-amber" : "text-ember";
  return (
    <div className="border border-hairline-strong p-2.5 bg-ink-deepest/60 relative">
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: accentColor }}
      />
      <div className="text-[10.5px] text-paper truncate font-medium">
        {mun.apelido || mun.municipio}
        <span className="text-paper/40 ml-1 text-[9.5px] font-mono">/{mun.uf}</span>
      </div>
      <div
        className={`font-display font-light tracking-ultratight leading-none mt-1 ${accentClass}`}
        style={{ fontSize: 36 }}
      >
        {score.final}
      </div>
      <div className="text-[9px] text-paper/45 mt-1 font-mono tabular">
        CP {mun.convergenciaPublicaScore} · {mun.instrumentosPublicos.length} instrumentos
      </div>
    </div>
  );
}

function ConfrontoRow({ label, va, vb }) {
  const max = Math.max(va, vb, 1);
  const winnerA = va > vb;
  const tie = va === vb;
  return (
    <div>
      <div className="text-[10.5px] text-paper/85 mb-1">{label}</div>
      <div className="flex items-center gap-2 h-5">
        {/* A: barra cresce da direita pra esquerda */}
        <span
          className={`text-[10.5px] font-mono tabular w-7 text-right ${
            tie ? "text-paper/65" : winnerA ? "text-amber font-medium" : "text-paper/45"
          }`}
        >
          {va}
        </span>
        <div className="flex-1 flex items-center justify-end h-full bg-paper/[0.04]">
          <div
            className="h-full"
            style={{
              width: `${(va / max) * 100}%`,
              background: tie ? "rgba(244,241,234,0.35)" : winnerA ? "var(--amber)" : "rgba(244,241,234,0.25)",
            }}
          />
        </div>
        <div className="w-px h-full bg-hairline-strong" />
        {/* B: barra cresce da esquerda pra direita */}
        <div className="flex-1 flex items-center h-full bg-paper/[0.04]">
          <div
            className="h-full"
            style={{
              width: `${(vb / max) * 100}%`,
              background: tie ? "rgba(244,241,234,0.35)" : !winnerA ? "#fc6926" : "rgba(244,241,234,0.25)",
            }}
          />
        </div>
        <span
          className={`text-[10.5px] font-mono tabular w-7 ${
            tie ? "text-paper/65" : !winnerA ? "text-ember font-medium" : "text-paper/45"
          }`}
        >
          {vb}
        </span>
      </div>
    </div>
  );
}

function BadgeRow({ ids, accent }) {
  const colorClass =
    accent === "amber"
      ? "border-amber/50 text-amber bg-amber/5"
      : "border-ember/50 text-ember bg-ember/5";
  return (
    <div className="flex flex-wrap gap-1">
      {ids.map((id) => {
        const inst = INSTRUMENTOS_LABELS[id];
        if (!inst) return null;
        return (
          <span
            key={id}
            className={`text-[10.5px] font-mono tabular px-1.5 py-0.5 border ${colorClass} leading-tight`}
          >
            {inst.nome}
          </span>
        );
      })}
    </div>
  );
}

/* ───────────────── METHODOLOGY MODAL ───────────────── */

function MethodologyModal({ modo, pesos, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink-deepest/85 backdrop-blur-sm flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-ink-deeper border border-hairline-strong max-w-2xl w-full p-7 relative max-h-[85vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-paper/55 hover:text-accent"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-1">
          Metodologia · v0.1
        </div>
        <h2 className="font-display text-3xl font-light tracking-tightest text-paper leading-[1.1] mb-3">
          Como o score é calculado.
        </h2>
        <p className="text-[12.5px] text-paper/65 leading-relaxed mb-5">
          Cada município recebe seis sub-scores normalizados de 0 a 100. O score final é uma média
          ponderada — os pesos vêm do <span className="text-amber">modo de análise</span>{" "}
          selecionado no topo.
        </p>

        <div className="border border-hairline-strong p-4 mb-5">
          <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-3">
            Critérios e pesos no modo {MODOS[modo].label}
          </div>
          <div className="space-y-2">
            {CRITERIOS.map((c) => {
              const pct = (pesos[c.id] * 100).toFixed(0);
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-[12px] text-paper/85 flex-1">{c.label}</span>
                  <div className="w-32 h-1.5 bg-paper/[0.06]">
                    <div
                      className="h-full bg-amber"
                      style={{ width: `${pct * 2}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono tabular text-amber w-9 text-right">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10.5px] text-paper/45 mt-3 leading-snug">
            Mude o modo de análise no topo da tela para reponderar o score.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <MethodSection
            label="Conectado nesta versão"
            tone="ok"
            items={[
              "ANEEL SIGA — base conceitual de capacidade renovável (mock)",
              "Estrutura de dados inspirada em master_df.csv",
              "Modos de análise pré-configurados",
            ]}
          />
          <MethodSection
            label="Próxima versão"
            tone="warn"
            items={[
              "ONS — margem de escoamento por subestação",
              "INPE — irradiação solar e atlas de vento",
              "IBGE CEMPRE — empregos industriais por CNAE × município",
              "SAFMaps — flaring siderúrgico, biomassa, indicadores ESG",
              "PNCP, BNDES, REIDI, SUDENE/SUDAM, FNE/FNO/FCO",
            ]}
          />
        </div>

        <div className="mt-5 hatch p-3.5 border border-amber/30 flex items-start gap-2.5">
          <Info size={14} className="text-amber flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-0.5">
              Aviso
            </p>
            <p className="text-[11.5px] text-paper/80 leading-relaxed">
              Os números operacionais por município nesta v0.1 são <strong>estimativas mockadas</strong> para validar o fluxo de decisão. Não usar como insumo de
              investimento real.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MethodSection({ label, items, tone }) {
  return (
    <div>
      <div
        className={`text-[10px] tabular tracking-[0.22em] uppercase font-mono mb-2 ${
          tone === "warn" ? "text-ember" : "text-amber"
        }`}
      >
        {label}
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="text-[11.5px] text-paper/75 leading-relaxed flex gap-2">
            <span className={tone === "warn" ? "text-ember" : "text-amber"}>·</span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

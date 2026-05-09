import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  GitCompareArrows,
  RotateCcw,
  X,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

import { MUNICIPIOS, MODOS, PERSONAS, CRITERIOS, PESO_DEFAULTS } from "./data";
import { computeBreakdown, computeFinalScore, principais, gerarRecomendacoes } from "./scoring";
import BrazilMap from "./BrazilMap";
import Copiloto from "./Copiloto";

const ABAS = [
  { id: "oportunidades", label: "Oportunidades" },
  { id: "data_centers", label: "Data centers IA" },
  { id: "mapa", label: "Mapa" },
  { id: "metodologia", label: "Metodologia" },
];

export default function App() {
  const [persona, setPersona] = useState("investidor");
  const [modo, setModo] = useState("renovaveis");
  const [pesos, setPesos] = useState({ ...PESO_DEFAULTS });
  const [selectedId, setSelectedId] = useState(null);
  const [compareId, setCompareId] = useState(null);
  const [activeTab, setActiveTab] = useState("oportunidades");
  const [methodOpen, setMethodOpen] = useState(false);
  const [copilotoOpen, setCopilotoOpen] = useState(false);

  // Quando muda o modo, aplica os pesos sugeridos do modo
  const setModoComPesos = useCallback((novoModo) => {
    setModo(novoModo);
    setPesos({ ...MODOS[novoModo].pesos });
    if (novoModo === "data_centers") setActiveTab("data_centers");
  }, []);

  // Reset
  const reset = () => {
    setPesos({ ...MODOS[modo].pesos });
  };

  // Normaliza pesos para somar 1 (assim o score nunca extrapola)
  const pesosNormalizados = useMemo(() => {
    const total = Object.values(pesos).reduce((a, b) => a + b, 0) || 1;
    return Object.fromEntries(Object.entries(pesos).map(([k, v]) => [k, v / total]));
  }, [pesos]);

  // Calcula scores para todos os municípios
  const scores = useMemo(() => {
    const out = {};
    for (const m of MUNICIPIOS) {
      const breakdown = computeBreakdown(m);
      const final = computeFinalScore(breakdown, pesosNormalizados);
      out[m.id] = { breakdown, final };
    }
    return out;
  }, [pesosNormalizados]);

  // Ranking ordenado
  const ranking = useMemo(() => {
    return [...MUNICIPIOS].sort((a, b) => scores[b.id].final - scores[a.id].final);
  }, [scores]);

  const selecionado = useMemo(
    () => MUNICIPIOS.find((m) => m.id === selectedId) ?? null,
    [selectedId]
  );
  const compareMun = useMemo(
    () => MUNICIPIOS.find((m) => m.id === compareId) ?? null,
    [compareId]
  );

  const ctxCopiloto = {
    selecionado,
    ranking,
    modo,
    pesos: pesosNormalizados,
    persona,
    scores,
  };

  return (
    <div className="min-h-screen bg-ink-deeper text-paper relative">
      {/* === HEADER === */}
      <header className="border-b border-hairline-strong sticky top-0 z-20 bg-ink-deeper/95 backdrop-blur">
        <div className="px-6 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <RadarMark />
              <div>
                <div className="font-display text-[22px] leading-none font-light tracking-ultratight text-paper">
                  Radar<span className="text-amber"> PID</span>
                </div>
                <div className="text-[10px] tabular tracking-[0.2em] uppercase text-paper/55 font-mono mt-0.5">
                  Investimentos · Energia limpa · Cargas estratégicas
                </div>
              </div>
            </div>

            {/* Tabs */}
            <nav className="flex items-center gap-1">
              {ABAS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setActiveTab(a.id);
                    if (a.id === "metodologia") setMethodOpen(true);
                  }}
                  className={`px-3 py-1.5 text-xs tracking-wide uppercase font-mono transition-colors ${
                    activeTab === a.id
                      ? "text-amber border-b border-amber"
                      : "text-paper/55 hover:text-paper border-b border-transparent"
                  }`}
                  style={{ marginBottom: "-1px" }}
                >
                  {a.label}
                </button>
              ))}
            </nav>
          </div>

          {/* State indicators */}
          <div className="flex items-center gap-5">
            <Indicator label="Persona" value={PERSONAS[persona].label} />
            <div className="h-5 w-px bg-hairline-strong" />
            <Indicator label="Modo" value={MODOS[modo].label} highlight />
            <div className="h-5 w-px bg-hairline-strong" />
            <span className="hatch px-2 py-1 text-[10px] tabular uppercase tracking-[0.18em] text-amber font-mono">
              Mocked v0.1
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div className="px-6 py-2 border-t border-hairline bg-ink-deepest/40 overflow-hidden">
          <div className="flex items-center gap-3 text-[11px] text-paper/55">
            <span className="block h-1.5 w-1.5 bg-amber animate-pulse-soft"></span>
            <span className="font-mono tracking-[0.12em] uppercase">Tese</span>
            <span className="text-paper/35">/</span>
            <span className="font-display italic text-paper/85">
              Da visualização à decisão: priorize onde investir, destravar rede e acelerar energia
              limpa no Brasil.
            </span>
          </div>
        </div>
      </header>

      {/* === MAIN GRID === */}
      <div className="grid grid-cols-[300px_minmax(0,1fr)_360px] min-h-[calc(100vh-104px)]">
        {/* === LEFT: Filtros & Pesos === */}
        <aside className="border-r border-hairline-strong bg-ink-deepest/40">
          <SidePanel
            persona={persona}
            setPersona={setPersona}
            modo={modo}
            setModo={setModoComPesos}
            pesos={pesos}
            setPesos={setPesos}
            reset={reset}
          />
        </aside>

        {/* === CENTER: Map + Ranking === */}
        <main className="flex flex-col min-w-0">
          <div className="flex-1 min-h-[480px] relative">
            <BrazilMap
              municipios={MUNICIPIOS}
              scores={scores}
              selectedId={selectedId}
              onSelect={setSelectedId}
              modo={MODOS[modo].label}
            />
          </div>
          <div className="border-t border-hairline-strong">
            <Ranking
              ranking={ranking}
              scores={scores}
              selectedId={selectedId}
              compareId={compareId}
              onSelect={setSelectedId}
              onCompare={setCompareId}
            />
          </div>
        </main>

        {/* === RIGHT: Painel de decisão === */}
        <aside className="border-l border-hairline-strong bg-ink-deepest/40 overflow-y-auto">
          <DecisionPanel
            selecionado={selecionado}
            scores={scores}
            modo={modo}
            ranking={ranking}
            compareMun={compareMun}
            setCompareId={setCompareId}
          />
        </aside>
      </div>

      {/* Methodology overlay */}
      <AnimatePresence>
        {methodOpen && <MethodologyOverlay onClose={() => setMethodOpen(false)} />}
      </AnimatePresence>

      {/* Copiloto */}
      <Copiloto open={copilotoOpen} setOpen={setCopilotoOpen} ctx={ctxCopiloto} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

function RadarMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" className="flex-shrink-0">
      <circle cx="18" cy="18" r="16" fill="none" stroke="var(--amber)" strokeWidth="0.5" />
      <circle cx="18" cy="18" r="10" fill="none" stroke="var(--amber)" strokeWidth="0.5" strokeDasharray="2 2" />
      <circle cx="18" cy="18" r="4" fill="none" stroke="var(--amber)" strokeWidth="0.5" />
      <line x1="18" y1="2" x2="18" y2="34" stroke="var(--amber)" strokeWidth="0.4" strokeOpacity="0.4" />
      <line x1="2" y1="18" x2="34" y2="18" stroke="var(--amber)" strokeWidth="0.4" strokeOpacity="0.4" />
      <motion.line
        x1="18"
        y1="18"
        x2="18"
        y2="2"
        stroke="var(--amber)"
        strokeWidth="1.2"
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "18px 18px" }}
      />
      <circle cx="18" cy="18" r="1.5" fill="var(--amber)" />
    </svg>
  );
}

function Indicator({ label, value, highlight }) {
  return (
    <div className="flex flex-col items-end leading-tight">
      <span className="text-[9px] tabular tracking-[0.2em] uppercase text-paper/45 font-mono">
        {label}
      </span>
      <span
        className={`text-xs font-mono tabular ${
          highlight ? "text-amber" : "text-paper"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ─────────────────────────────── SIDE PANEL ─────────────────────────────── */

function SidePanel({ persona, setPersona, modo, setModo, pesos, setPesos, reset }) {
  return (
    <div className="p-5 space-y-7">
      {/* PERSONA */}
      <Section label="Persona" hint="Qual lente de decisão usar.">
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(PERSONAS).map(([id, p]) => (
            <button
              key={id}
              onClick={() => setPersona(id)}
              className={`text-left px-3 py-2 text-xs border transition-colors ${
                persona === id
                  ? "bg-amber text-ink-deepest border-amber font-medium"
                  : "border-hairline-strong text-paper/75 hover:border-amber hover:text-amber"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10.5px] text-paper/45 leading-snug">
          {PERSONAS[persona].descricao}
        </p>
      </Section>

      {/* MODO */}
      <Section label="Modo de análise" hint="Ajusta pesos automaticamente.">
        <div className="space-y-1">
          {Object.entries(MODOS).map(([id, m]) => (
            <button
              key={id}
              onClick={() => setModo(id)}
              className={`w-full text-left px-3 py-2 text-xs border transition-colors flex items-center justify-between group ${
                modo === id
                  ? "border-amber bg-amber/10 text-paper"
                  : "border-hairline-strong text-paper/75 hover:border-paper/40"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`block h-1.5 w-1.5 ${
                    modo === id ? "bg-amber" : "bg-paper/30"
                  }`}
                />
                {m.label}
              </span>
              {modo === id && <ChevronRight size={12} className="text-amber" />}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10.5px] text-paper/45 leading-snug">{MODOS[modo].descricao}</p>
      </Section>

      {/* PESOS */}
      <Section
        label="Pesos do score"
        hint="Total normalizado para 100%."
        action={
          <button
            onClick={reset}
            className="text-[10px] tabular tracking-[0.16em] uppercase font-mono text-paper/55 hover:text-amber flex items-center gap-1"
          >
            <RotateCcw size={11} />
            Reset
          </button>
        }
      >
        <div className="space-y-3.5">
          {CRITERIOS.map((c) => {
            const pct = (pesos[c.id] * 100).toFixed(0);
            return (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-paper/85">{c.label}</span>
                  <span className="text-[11px] font-mono tabular text-amber">
                    {pct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={pesos[c.id]}
                  onChange={(e) =>
                    setPesos({ ...pesos, [c.id]: parseFloat(e.target.value) })
                  }
                />
              </div>
            );
          })}
        </div>
      </Section>

      {/* Footer institucional */}
      <div className="pt-4 border-t border-hairline">
        <p className="text-[9.5px] text-paper/35 leading-relaxed font-mono tracking-tight">
          Hackathon E+ Transição Energética 2026 · Equipe petrolFuckers · Protótipo de triagem,
          não substitui due diligence técnica.
        </p>
      </div>
    </div>
  );
}

function Section({ label, hint, children, action }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono">
            {label}
          </span>
          {hint && <span className="text-[10px] text-paper/35">{hint}</span>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ──────────────────────────────── RANKING ──────────────────────────────── */

function Ranking({ ranking, scores, selectedId, compareId, onSelect, onCompare }) {
  return (
    <div className="bg-ink-deepest/30">
      <div className="px-6 py-3 border-b border-hairline flex items-baseline justify-between">
        <h2 className="font-display text-lg font-light tracking-tightest text-paper">
          Ranking de oportunidades
          <span className="text-paper/35 ml-2 text-sm font-mono tabular">
            · {ranking.length} municípios
          </span>
        </h2>
        <div className="flex items-center gap-3 text-[10px] tabular tracking-[0.18em] uppercase font-mono text-paper/55">
          <Legend color="var(--amber)" label="≥ 75" />
          <Legend color="#fc6926" label="60-74" />
          <Legend color="#fa441a" label="45-59" />
          <Legend color="rgba(244,241,234,0.4)" label="< 45" />
        </div>
      </div>

      {/* Header row */}
      <div className="px-6 grid grid-cols-[40px_1fr_80px_2fr_140px_30px] gap-3 py-2 text-[10px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono border-b border-hairline">
        <span>#</span>
        <span>Município / UF</span>
        <span className="text-right">Score</span>
        <span>Distribuição (REC · REDE · DEM · RISCO · DESV · DC)</span>
        <span>Força / Gargalo</span>
        <span></span>
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {ranking.map((m, idx) => {
          const sc = scores[m.id];
          const { forca, gargalo } = principais(sc.breakdown);
          const isSel = selectedId === m.id;
          const isCmp = compareId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`w-full px-6 grid grid-cols-[40px_1fr_80px_2fr_140px_30px] gap-3 py-2.5 items-center text-left border-b border-hairline hover:bg-amber/5 transition-colors ${
                isSel ? "bg-amber/10 border-l-2 border-l-amber" : ""
              }`}
            >
              <span className="text-[11px] font-mono tabular text-paper/55">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-paper truncate">
                {m.apelido || m.municipio}
                <span className="text-paper/40 ml-1.5 text-xs font-mono">/{m.uf}</span>
              </span>
              <span className="text-right">
                <span
                  className={`text-base font-mono tabular ${
                    sc.final >= 75 ? "text-amber font-medium" : "text-paper"
                  }`}
                >
                  {sc.final}
                </span>
              </span>
              <SparkBar breakdown={sc.breakdown} />
              <div className="text-[10.5px] leading-tight">
                <div className="text-paper/85">
                  ↑ {labelFor(forca)} {sc.breakdown[forca]}
                </div>
                <div className="text-cinder/85">
                  ↓ {labelFor(gargalo)} {sc.breakdown[gargalo]}
                </div>
              </div>
              <div className="flex items-center justify-end gap-1">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompare(isCmp ? null : m.id);
                  }}
                  role="button"
                  className={`p-1 transition-colors cursor-pointer ${
                    isCmp ? "text-amber" : "text-paper/30 hover:text-amber"
                  }`}
                  title={isCmp ? "Remover da comparação" : "Comparar"}
                >
                  <GitCompareArrows size={12} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="block h-1.5 w-3" style={{ background: color }} />
      <span>{label}</span>
    </span>
  );
}

function SparkBar({ breakdown }) {
  return (
    <div className="flex items-center gap-px h-3.5">
      {CRITERIOS.map((c) => {
        const v = breakdown[c.id];
        const intensity = v / 100;
        return (
          <div
            key={c.id}
            className="flex-1 relative"
            style={{ background: "rgba(244,241,234,0.06)" }}
            title={`${c.label}: ${v}/100`}
          >
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: `${intensity * 100}%`,
                background: v >= 70 ? "var(--amber)" : v >= 45 ? "#fc6926" : "rgba(244,241,234,0.35)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function labelFor(id) {
  return CRITERIOS.find((c) => c.id === id)?.abrev ?? id;
}

/* ───────────────────────── DECISION PANEL ───────────────────────── */

function DecisionPanel({ selecionado, scores, modo, ranking, compareMun, setCompareId }) {
  if (!selecionado) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono">
          Painel de decisão
        </div>
        <div className="border border-dashed border-hairline-strong p-6 text-center">
          <p className="font-display text-2xl font-light text-paper/50 leading-tight">
            Selecione um município
          </p>
          <p className="text-xs text-paper/40 mt-2 leading-relaxed">
            Clique em um ponto no mapa ou em uma linha do ranking para ver o breakdown completo,
            gargalos e recomendações acionáveis.
          </p>
        </div>

        <div className="pt-4 border-t border-hairline">
          <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-3">
            Top 3 atual
          </div>
          <div className="space-y-1.5">
            {ranking.slice(0, 3).map((m, i) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-sm border-l-2 border-amber pl-3 py-1"
              >
                <span className="text-paper">
                  <span className="font-mono tabular text-amber mr-2">{i + 1}</span>
                  {m.apelido || m.municipio}
                  <span className="text-paper/40 text-xs ml-1">/{m.uf}</span>
                </span>
                <span className="font-mono tabular text-amber">{scores[m.id].final}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sc = scores[selecionado.id];
  const { forca, gargalo } = principais(sc.breakdown);
  const recomendacoes = gerarRecomendacoes(sc.breakdown, modo);

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono">
            Painel de decisão
          </span>
          <span className="text-[10px] font-mono tabular text-paper/40">
            #{ranking.findIndex((m) => m.id === selecionado.id) + 1} no ranking
          </span>
        </div>
        <h2 className="font-display text-3xl font-light tracking-tightest text-paper mt-1.5 leading-[1.05]">
          {selecionado.apelido || selecionado.municipio}
          <span className="text-paper/40 text-xl ml-2 font-mono">/{selecionado.uf}</span>
        </h2>
        <div className="text-[10.5px] text-paper/45 mt-1 font-mono tabular">
          {selecionado.lat.toFixed(3)}°S · {selecionado.lng.toFixed(3)}°W
        </div>
      </div>

      {/* Score grande */}
      <motion.div
        key={sc.final}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-hairline-strong p-5 bg-ink-deepest/60 relative overflow-hidden"
      >
        <div className="absolute inset-0 hatch opacity-10" />
        <div className="relative flex items-baseline gap-4">
          <div>
            <div className="text-[9px] tabular tracking-[0.22em] uppercase text-paper/45 font-mono">
              Score final
            </div>
            <div
              className="font-display font-light text-amber tracking-ultratight leading-none"
              style={{ fontSize: 64 }}
            >
              {sc.final}
              <span className="text-paper/30 text-2xl font-mono ml-1">/100</span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[9px] tabular tracking-[0.22em] uppercase text-paper/45 font-mono">
              Modo
            </div>
            <div className="text-amber text-sm font-mono tabular">{MODOS[modo].label}</div>
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3 mt-5 text-xs">
          <div className="border-l border-amber pl-2.5">
            <div className="text-[9px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono">
              Força
            </div>
            <div className="text-paper">
              {CRITERIOS.find((c) => c.id === forca).label}{" "}
              <span className="font-mono tabular text-amber ml-1">{sc.breakdown[forca]}</span>
            </div>
          </div>
          <div className="border-l border-cinder pl-2.5">
            <div className="text-[9px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono">
              Gargalo
            </div>
            <div className="text-paper">
              {CRITERIOS.find((c) => c.id === gargalo).label}{" "}
              <span className="font-mono tabular text-cinder ml-1">{sc.breakdown[gargalo]}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Breakdown */}
      <div>
        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-3">
          Breakdown
        </div>
        <div className="space-y-2">
          {CRITERIOS.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="text-[11px] text-paper/75 w-32">{c.label}</span>
              <div className="flex-1 h-2 bg-paper/5 relative">
                <motion.div
                  className="absolute left-0 top-0 bottom-0"
                  initial={{ width: 0 }}
                  animate={{ width: `${sc.breakdown[c.id]}%` }}
                  transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{
                    background:
                      sc.breakdown[c.id] >= 70
                        ? "var(--amber)"
                        : sc.breakdown[c.id] >= 45
                        ? "#fc6926"
                        : "rgba(244,241,234,0.35)",
                  }}
                />
              </div>
              <span className="text-[11px] font-mono tabular text-paper w-8 text-right">
                {sc.breakdown[c.id]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Por que */}
      <Collapsable
        title="Por que aparece no ranking?"
        icon={<TrendingUp size={12} className="text-amber" />}
        defaultOpen
      >
        <p className="text-xs text-paper/80 leading-relaxed">
          {selecionado.observacoes}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Renovável" value={`${selecionado.capacidadeRenovavelMw.toLocaleString("pt-BR")} MW`} />
          <Stat label="Pipeline" value={`${selecionado.pipelineMw.toLocaleString("pt-BR")} MW`} />
          <Stat label="Margem rede" value={`${selecionado.margemRedeMw.toLocaleString("pt-BR")} MW`} />
          <Stat label="Subestação" value={`${selecionado.distanciaSubestacaoKm} km`} />
          <Stat label="Fibra ótica" value={`${selecionado.distanciaFibraKm} km`} />
          <Stat label="Risco SE" value={`${selecionado.riscoSocioambientalScore}/100`} />
        </div>
      </Collapsable>

      {/* Recomendações */}
      <Collapsable
        title="Recomendações acionáveis"
        icon={<Lightbulb size={12} className="text-amber" />}
        defaultOpen
      >
        <ul className="space-y-2">
          {recomendacoes.map((r, i) => (
            <li
              key={i}
              className={`text-xs leading-relaxed pl-3 border-l-2 ${
                r.severidade === "alta"
                  ? "border-cinder text-paper"
                  : r.severidade === "media"
                  ? "border-ember text-paper/85"
                  : "border-amber text-paper/85"
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[9px] tabular tracking-[0.18em] uppercase font-mono text-paper/55">
                  {r.severidade === "alta" ? "▲ alta" : r.severidade === "media" ? "● média" : "◇ info"}
                </span>
              </div>
              {r.texto}
            </li>
          ))}
        </ul>
      </Collapsable>

      {/* Comparar */}
      <div className="pt-3 border-t border-hairline">
        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-2">
          Comparação lado a lado
        </div>
        {compareMun ? (
          <ComparePanel
            a={selecionado}
            b={compareMun}
            scores={scores}
            onClear={() => setCompareId(null)}
          />
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-paper/55">
              Selecione outro município para comparar critério a critério.
            </p>
            <select
              value=""
              onChange={(e) => setCompareId(e.target.value || null)}
              className="w-full bg-transparent border border-hairline-strong px-3 py-2 text-xs text-paper hover:border-amber focus:border-amber focus:outline-none font-mono"
            >
              <option value="" className="bg-ink-deepest">
                — escolher outro município —
              </option>
              {ranking
                .filter((m) => m.id !== selecionado.id)
                .slice(0, 10)
                .map((m) => (
                  <option key={m.id} value={m.id} className="bg-ink-deepest">
                    {m.apelido || m.municipio}/{m.uf} · {scores[m.id].final}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border-t border-hairline pt-1.5">
      <div className="text-[8.5px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono">
        {label}
      </div>
      <div className="text-xs text-paper font-mono tabular">{value}</div>
    </div>
  );
}

function Collapsable({ title, icon, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-hairline pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="flex items-center gap-2 text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono">
          {icon}
          {title}
        </span>
        <ChevronDown
          size={13}
          className={`text-paper/40 transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── COMPARE PANEL ───────────────────────── */

function ComparePanel({ a, b, scores, onClear }) {
  const finalDiff = scores[a.id].final - scores[b.id].final;

  // Para qual perfil cada um é melhor
  const aBetter = scores[a.id].breakdown.demanda > scores[b.id].breakdown.demanda;
  const bBetter = scores[b.id].breakdown.desenvolvimento > scores[a.id].breakdown.desenvolvimento;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="font-mono">
          <span className="text-amber">{a.apelido || a.municipio}</span>
          <span className="text-paper/30 mx-2">vs.</span>
          <span className="text-paper">{b.apelido || b.municipio}</span>
        </div>
        <button
          onClick={onClear}
          className="text-paper/45 hover:text-amber p-0.5"
          aria-label="Limpar"
        >
          <X size={12} />
        </button>
      </div>

      <div className="border border-hairline-strong divide-y divide-hairline">
        <div className="grid grid-cols-3 gap-1 px-3 py-2 text-[9px] tabular tracking-[0.18em] uppercase font-mono text-paper/45">
          <span>Critério</span>
          <span className="text-right">{a.uf}</span>
          <span className="text-right">{b.uf}</span>
        </div>
        {[{ id: "final", label: "Score final", isFinal: true }, ...CRITERIOS].map((c) => {
          const va = c.isFinal ? scores[a.id].final : scores[a.id].breakdown[c.id];
          const vb = c.isFinal ? scores[b.id].final : scores[b.id].breakdown[c.id];
          const winnerA = va > vb;
          return (
            <div
              key={c.id}
              className={`grid grid-cols-3 gap-1 px-3 py-2 items-center ${
                c.isFinal ? "bg-amber/5" : ""
              }`}
            >
              <span className={`text-[11px] ${c.isFinal ? "text-amber font-medium" : "text-paper/75"}`}>
                {c.label}
              </span>
              <span className="text-right">
                <span
                  className={`text-xs font-mono tabular ${
                    winnerA ? "text-amber font-medium" : "text-paper/55"
                  }`}
                >
                  {va}
                </span>
              </span>
              <span className="text-right">
                <span
                  className={`text-xs font-mono tabular ${
                    !winnerA ? "text-amber font-medium" : "text-paper/55"
                  }`}
                >
                  {vb}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-paper/65 leading-relaxed border-l-2 border-amber pl-3">
        {finalDiff > 5 && `${a.apelido || a.municipio} lidera o score geral por ${finalDiff} pontos.`}
        {finalDiff < -5 && `${b.apelido || b.municipio} lidera o score geral por ${-finalDiff} pontos.`}
        {Math.abs(finalDiff) <= 5 && "Score geral muito próximo — diferença está nos pesos."}
        {" "}
        {aBetter && (
          <>
            <span className="text-amber">{a.apelido || a.municipio}</span> tende a ser melhor para
            investimento privado pela demanda industrial.
          </>
        )}
        {bBetter && (
          <>
            {" "}<span className="text-amber">{b.apelido || b.municipio}</span> tende a ser melhor
            para política pública pelo desenvolvimento regional.
          </>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────── METHODOLOGY OVERLAY ────────────────────────── */

function MethodologyOverlay({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink-deepest/85 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-ink-deeper border border-hairline-strong max-w-3xl w-full p-8 my-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-paper/55 hover:text-amber"
        >
          <X size={18} />
        </button>

        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-2">
          Metodologia · v0.1
        </div>
        <h2 className="font-display text-4xl font-light tracking-tightest text-paper leading-[1.1] mb-4">
          Como o score é construído.
        </h2>
        <p className="text-sm text-paper/65 leading-relaxed mb-6 max-w-2xl">
          O Radar PID sintetiza seis dimensões em um score 0–100 por município. A fórmula é uma
          média ponderada — os pesos vêm dos sliders, e os critérios são normalizados pra ficar
          comparáveis.
        </p>

        <div className="border border-hairline-strong p-5 mb-6 bg-ink-deepest/60 font-mono text-[12px] leading-relaxed">
          <span className="text-paper/45">score_final = </span>
          <br />
          <span className="text-paper/85">  peso_recurso × score_recurso_renovavel</span>
          <br />
          <span className="text-amber">+</span>
          <span className="text-paper/85"> peso_rede × score_conexao_rede</span>
          <br />
          <span className="text-amber">+</span>
          <span className="text-paper/85"> peso_demanda × score_demanda_estrategica</span>
          <br />
          <span className="text-amber">+</span>
          <span className="text-paper/85"> peso_risco × score_baixo_risco_socioambiental</span>
          <br />
          <span className="text-amber">+</span>
          <span className="text-paper/85"> peso_desenvolvimento × score_desenvolvimento_regional</span>
          <br />
          <span className="text-amber">+</span>
          <span className="text-paper/85"> peso_datacenter × score_prontidao_datacenter</span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <MethodSection
            label="O que está conectado nesta versão"
            items={[
              "ANEEL SIGA — base conceitual de capacidade renovável (mock por município)",
              "Estrutura de dados inspirada em master_df.csv (docs/08_ibge_dados.md)",
              "Pesos do score ajustáveis e modos de análise pré-configurados",
            ]}
          />
          <MethodSection
            label="O que entra na próxima versão"
            tone="warn"
            items={[
              "ONS — margem de escoamento por subestação",
              "INPE — irradiação solar e atlas de vento",
              "IBGE CEMPRE 6449 — empregos industriais por CNAE × município",
              "SAFMaps WFS — flaring siderúrgico, slavery_likely, biomassa",
              "Conectividade de fibra (CGI.br/Anatel) e dados hídricos (ANA)",
            ]}
          />
        </div>

        <div className="mt-6 hatch p-4 border border-amber/30 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-1">
              Aviso
            </p>
            <p className="text-xs text-paper/80 leading-relaxed">
              Os números operacionais por município (capacidade, margem de rede, distância à
              fibra, etc.) são <strong>estimativas mockadas</strong> nesta v0.1, criadas para
              validar o fluxo de decisão. Não usar como insumo de investimento real até o
              master_df.csv real ser conectado.
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
          <li key={i} className="text-xs text-paper/75 leading-relaxed flex gap-2">
            <span className={tone === "warn" ? "text-ember" : "text-amber"}>·</span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

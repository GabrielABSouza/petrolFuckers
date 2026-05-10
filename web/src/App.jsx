import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  GitCompareArrows,
  Info,
  Plus,
  Sun,
  Moon,
  Sparkles,
  Wind,
  Flame,
  Leaf,
  Atom,
  Database,
  BarChart3,
  Circle,
} from "lucide-react";

import { FONTES_ENERGIA } from "./data";
import { fetchMunicipios, fetchMunicipioDetalhe, fetchInsights } from "./api";
import BrazilMap from "./BrazilMap";
import Copiloto from "./Copiloto";

const BLOCOS_MCDA = [
  { id: "eco", label: "Econômico", abrev: "eco" },
  { id: "social", label: "Social", abrev: "soc" },
  { id: "ambiental", label: "Ambiental", abrev: "amb" },
];

const UF_OPTIONS = [
  "BR",
  "AC",
  "AL",
  "AM",
  "AP",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MG",
  "MS",
  "MT",
  "PA",
  "PB",
  "PE",
  "PI",
  "PR",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SE",
  "SP",
  "TO",
];

export default function App() {
  const [fonteAtiva, setFonteAtiva] = useState("H2 Verde");
  const [ufAtiva, setUfAtiva] = useState("BR");
  const [apiState, setApiState] = useState({
    status: "idle",
    items: [],
    snapshot: null,
    error: null,
  });
  const [selectedDetails, setSelectedDetails] = useState({
    status: "idle",
    scores: [],
    error: null,
  });
  const [selectedId, setSelectedId] = useState(null);
  const [compareId, setCompareId] = useState(null);
  const [methodOpen, setMethodOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    setApiState((s) => ({ ...s, status: "loading", error: null }));

    fetchMunicipios(fonteAtiva, {
      uf: ufAtiva === "BR" ? undefined : ufAtiva,
    })
      .then((data) => {
        if (!alive) return;
        setApiState({
          status: "ok",
          items: Array.isArray(data.items) ? data.items : [],
          snapshot: data.snapshot_data || null,
          error: null,
        });
      })
      .catch((err) => {
        if (!alive || err.name === "AbortError") return;
        setApiState({
          status: "error",
          items: [],
          snapshot: null,
          error: err.message,
        });
      });

    return () => {
      alive = false;
      controller.abort();
    };
  }, [fonteAtiva, ufAtiva]);

  const fonteMeta = useMemo(
    () => FONTES_ENERGIA.find((f) => f.id === fonteAtiva) ?? FONTES_ENERGIA[0],
    [fonteAtiva]
  );

  const usingApi = apiState.status === "ok" && apiState.items.length > 0;

  const municipiosAtivos = useMemo(() => {
    if (usingApi) return apiState.items.map(normalizeApiMunicipio);
    return [];
  }, [apiState.items, usingApi]);

  const scores = useMemo(() => {
    const sorted = [...municipiosAtivos].sort(
      (a, b) => b.sourceScore.final - a.sourceScore.final
    );
    const total = Math.max(sorted.length, 1);
    const out = {};
    sorted.forEach((m, idx) => {
      out[m.id] = {
        ...m.sourceScore,
        rankPosition: idx + 1,
        percentile: (idx + 1) / total,
      };
    });
    return out;
  }, [municipiosAtivos]);

  const ranking = useMemo(
    () => [...municipiosAtivos].sort((a, b) => scores[b.id].final - scores[a.id].final),
    [municipiosAtivos, scores]
  );

  const selecionado = useMemo(
    () => municipiosAtivos.find((m) => m.id === selectedId) ?? null,
    [municipiosAtivos, selectedId]
  );

  useEffect(() => {
    if (selectedId && !municipiosAtivos.some((m) => m.id === selectedId)) {
      setSelectedId(null);
      setCompareId(null);
    }
  }, [municipiosAtivos, selectedId]);

  useEffect(() => {
    if (!selecionado) {
      setSelectedDetails({ status: "idle", scores: [], error: null });
      return;
    }

    let alive = true;
    const controller = new AbortController();
    setSelectedDetails({ status: "loading", scores: [], error: null });

    fetchMunicipioDetalhe(selecionado.lookupName)
      .then((data) => {
        if (!alive) return;
        setSelectedDetails({
          status: "ok",
          scores: normalizeSourceDetails(data.scores || []),
          error: null,
        });
      })
      .catch((err) => {
        if (!alive || err.name === "AbortError") return;
        setSelectedDetails({
          status: "error",
          scores: [],
          error: err.message,
        });
      });

    return () => {
      alive = false;
      controller.abort();
    };
  }, [selecionado]);

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
    fonte: fonteAtiva,
  };

  return (
    <div className="h-screen bg-ink-deeper text-paper relative flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="border-b border-hairline-strong bg-ink-deeper/95 backdrop-blur flex-shrink-0">
        <div className="h-[88px] grid grid-cols-[340px_minmax(0,1fr)_400px]">
          <div className="h-full flex items-center px-6 border-r border-hairline-strong">
            <img
              src="/logo-pid.svg"
              alt="PID — Plataforma Interativa de Descarbonização"
              className="h-[68px] w-auto flex-shrink-0"
            />
          </div>

          <NoticiasCarousel />

          <div className="h-full grid grid-cols-[minmax(0,1fr)_56px] border-l border-hairline-strong">
            <button
              onClick={() => setMethodOpen(true)}
              className="group h-full min-w-0 flex items-center justify-center gap-3 px-5 text-left hover:bg-paper/[0.035] transition-colors"
            >
              <span className="w-8 h-8 flex items-center justify-center border border-hairline-strong text-amber group-hover:border-amber/55 group-hover:text-accent transition-colors">
                <Info size={14} />
              </span>
              <span className="min-w-0">
                <span className="block text-[9px] tabular tracking-[0.22em] uppercase text-amber font-mono leading-none">
                  Metodologia
                </span>
                <span className="block mt-1 font-display text-[17px] text-paper/90 group-hover:text-accent leading-none truncate">
                  Indicador MCDA
                </span>
              </span>
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
              className="h-full w-full flex items-center justify-center text-paper/55 hover:text-accent hover:bg-paper/[0.035] transition-colors border-l border-hairline-strong"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </header>

      {/* GRID principal */}
      <div className="grid grid-cols-[340px_minmax(0,1fr)_400px] flex-1 min-h-0">
        <aside className="border-r border-hairline-strong bg-ink-deepest/40 overflow-y-auto scrollbar-none">
          <FonteSidebarHeader
            fonteAtiva={fonteAtiva}
            onFonteChange={(fonte) => {
              setFonteAtiva(fonte);
              setCompareId(null);
            }}
            ufAtiva={ufAtiva}
            onUfChange={(uf) => {
              setUfAtiva(uf);
              setSelectedId(null);
              setCompareId(null);
            }}
            apiState={apiState}
            usingApi={usingApi}
            total={ranking.length}
          />
          {selecionado &&
          compareId &&
          compareId !== selecionado.id &&
          municipiosAtivos.some((m) => m.id === compareId) ? (
            <CompareView
              a={selecionado}
              b={municipiosAtivos.find((m) => m.id === compareId)}
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
              fonteAtiva={fonteAtiva}
              fonteMeta={fonteMeta}
              usingApi={usingApi}
              selectedDetails={selectedDetails}
              onClose={() => setSelectedId(null)}
              setCompareId={setCompareId}
              ranking={ranking}
              scores={scores}
            />
          ) : (
            <ExplorationPanel
              ranking={ranking}
              scores={scores}
              fonteMeta={fonteMeta}
              usingApi={usingApi}
              apiState={apiState}
              onSelect={setSelectedId}
            />
          )}
        </aside>

        <main className="relative min-w-0">
          <BrazilMap
            municipios={municipiosAtivos}
            scores={scores}
            selectedId={selectedId}
            compareId={compareId}
            onSelect={setSelectedId}
            fonte={fonteMeta}
            ufAtiva={ufAtiva}
            datasetStatus={usingApi ? "api" : "fallback"}
          />
        </main>

        <aside className="border-l border-hairline-strong overflow-hidden">
          <Copiloto ctx={ctxCopiloto} />
        </aside>
      </div>

      <AnimatePresence>
        {methodOpen && (
          <MethodologyModal
            onClose={() => setMethodOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

function NoticiasCarousel() {
  const [insights, setInsights] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetchInsights()
      .then((data) => setInsights(data.items || []))
      .catch(() => setInsights([]));
  }, []);

  useEffect(() => {
    if (!insights.length) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % insights.length), 5000);
    return () => clearInterval(t);
  }, [insights]);

  if (!insights.length) {
    return (
      <div className="h-full flex items-center justify-center text-[11px] text-paper/40 font-mono">
        Carregando insights…
      </div>
    );
  }

  return (
    <div className="h-full grid grid-cols-[104px_minmax(0,1fr)_56px] items-center gap-4 px-6">
      <div className="flex items-center gap-2 flex-shrink-0">
        <Sparkles size={12} className="text-amber" />
        <span className="text-[9px] tabular tracking-[0.22em] uppercase text-paper/45 font-mono">
          Notícias
        </span>
      </div>

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
            {insights[idx]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-1 flex-shrink-0 justify-end">
        {insights.map((_, i) => (
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

function FonteIcon({ id, size = 13 }) {
  if (id === "Solar") return <Sun size={size} />;
  if (id === "Eolica") return <Wind size={size} />;
  if (id === "Biometano") return <Flame size={size} />;
  if (id === "H2 Verde") return <Atom size={size} />;
  return <Leaf size={size} />;
}

function FonteSidebarHeader({
  fonteAtiva,
  onFonteChange,
  ufAtiva,
  onUfChange,
  apiState,
  usingApi,
  total,
}) {
  return (
    <div className="p-5 pb-4 border-b border-hairline-strong">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono">
            Fonte de energia
          </div>
          <div className="text-[11px] text-paper/55 mt-1 leading-snug">
            Scores recalculados por município × fonte.
          </div>
        </div>
        <div
          className={`h-7 w-7 border flex items-center justify-center ${
            usingApi ? "border-amber/55 text-amber" : "border-paper/20 text-paper/45"
          }`}
          title={usingApi ? "API conectada" : "API indisponível"}
        >
          <Database size={13} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {FONTES_ENERGIA.map((fonte) => {
          const active = fonte.id === fonteAtiva;
          return (
            <button
              key={fonte.id}
              onClick={() => onFonteChange(fonte.id)}
              className={`h-9 px-2.5 border flex items-center gap-2 text-left transition-colors ${
                active
                  ? "border-amber bg-amber text-[#03254d]"
                  : "border-hairline-strong text-paper/70 hover:border-accent hover:text-accent"
              }`}
              title={fonte.descricao}
            >
              <FonteIcon id={fonte.id} size={13} />
              <span className="text-[10.5px] font-mono tabular uppercase tracking-[0.08em] truncate">
                {fonte.short}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-[74px_minmax(0,1fr)] items-center gap-2">
        <label
          htmlFor="uf-filter"
          className="text-[9.5px] font-mono tabular uppercase tracking-[0.16em] text-paper/45"
        >
          Recorte
        </label>
        <select
          id="uf-filter"
          value={ufAtiva}
          onChange={(event) => onUfChange(event.target.value)}
          className="h-8 bg-transparent border border-hairline-strong px-2 text-[10.5px] text-paper font-mono tabular uppercase tracking-[0.08em] hover:border-accent focus:border-accent focus:outline-none"
        >
          {UF_OPTIONS.map((uf) => (
            <option key={uf} value={uf} className="bg-ink-deepest">
              {uf === "BR" ? "Brasil" : uf}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex items-center justify-between text-[9.5px] font-mono tabular uppercase tracking-[0.16em] text-paper/40">
        <span>{usingApi ? "API · snapshot real" : apiState.status === "loading" ? "Conectando…" : "API indisponível"}</span>
        <span>{apiState.status === "loading" ? "Carregando" : `n=${total}`}</span>
      </div>
    </div>
  );
}

/* ───────────────────────── TUTORIAL PANEL (sem seleção) ───────────────────────── */

function ExplorationPanel({ ranking, scores, fonteMeta, usingApi, apiState, onSelect }) {
  const top3 = ranking.slice(0, 3);

  if (apiState.status === "error") {
    return (
      <div className="p-5 space-y-5 h-full flex flex-col">
        <div>
          <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono">
            Triagem ativa
          </div>
          <h3 className="font-display text-[25px] leading-[1.08] font-light tracking-tightest text-paper mt-1.5">
            {fonteMeta.label}
          </h3>
        </div>
        <div className="border border-cinder p-4 text-[12px] text-paper/70 leading-relaxed">
          Não foi possível conectar à API. Verifique se o servidor está rodando em{" "}
          <span className="font-mono text-amber">localhost:8000</span>.
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5 h-full flex flex-col">
      <div>
        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono">
          Triagem ativa
        </div>
        <h3 className="font-display text-[25px] leading-[1.08] font-light tracking-tightest text-paper mt-1.5">
          {fonteMeta.label}
        </h3>
        <p className="text-[12px] text-paper/65 leading-relaxed mt-2">
          {fonteMeta.descricao} O mapa, o ranking e o painel do município seguem a fonte
          selecionada no topo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MetricTile
          label="Municípios"
          value={ranking.length}
          hint="dataset API"
        />
        <MetricTile
          label="Snapshot"
          value={apiState.snapshot ? apiState.snapshot.slice(5) : "—"}
          hint={apiState.status === "loading" ? "consultando" : "score MCDA"}
        />
      </div>

      <div className="border border-hairline-strong p-3.5">
        <div className="flex items-center gap-2 text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-3">
          <BarChart3 size={11} />
          Top 3 · {fonteMeta.short}
        </div>
        <div className="space-y-1">
          {top3.map((m, i) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className="w-full flex items-baseline justify-between text-left border-l-2 border-amber pl-3 py-1.5 hover:bg-accent/5 transition-colors"
            >
              <span className="text-[12.5px] text-paper min-w-0 truncate">
                <span className="font-mono tabular text-amber mr-2">{i + 1}</span>
                {m.apelido || m.municipio}
                <span className="text-paper/40 text-xs ml-1.5 font-mono">/{m.uf}</span>
              </span>
              <span className="font-mono tabular text-amber text-sm ml-2">
                {scores[m.id].final}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-hairline">
        <p className="text-[9.5px] text-paper/35 leading-relaxed font-mono tracking-tight">
          Hackathon E+ Transição Energética 2026 · Score de triagem, não substitui due diligence
          técnica. Instrumentos públicos seguem info-only.
        </p>
      </div>
    </div>
  );
}

function MetricTile({ label, value, hint }) {
  return (
    <div className="border border-hairline-strong p-3">
      <div className="font-display text-[24px] leading-none text-amber font-light">{value}</div>
      <div className="text-[9px] tabular tracking-[0.18em] uppercase text-paper/50 font-mono mt-1">
        {label}
      </div>
      <div className="text-[10px] text-paper/40 mt-1 truncate">{hint}</div>
    </div>
  );
}

/* ───────────────── NORMALIZAÇÃO ───────────────── */

function normalizeApiMunicipio(row) {
  const municipio = titleCase(row.municipio || "");
  const uf = row.uf || "";
  const id = `${slugify(row.municipio || municipio)}-${uf.toLowerCase()}`;

  return {
    id,
    municipio,
    apelido: null,
    uf,
    lat: Number(row.lat),
    lng: Number(row.lon),
    lookupName: row.municipio,
    dadosMockados: false,
    sourceScore: {
      final: pct(row.score),
      raw: Number(row.score ?? 0),
      fonte: row.fonte,
      rankFonte: row.rank ?? null,
      completeness: pct(row.data_completeness),
      blocos: {
        eco: pctOptional(row.eco_score),
        social: pctOptional(row.soc_score),
        ambiental: pctOptional(row.env_score),
      },
    },
  };
}

function normalizeSourceDetails(rows) {
  return rows
    .map((row) => ({
      fonte: row.fonte,
      final: pct(row.score),
      completeness: pct(row.data_completeness),
      rankFonte: row.rank ?? null,
      blocos: {
        eco: pctOptional(row.eco_score),
        social: pctOptional(row.soc_score),
        ambiental: pctOptional(row.env_score),
      },
    }))
    .sort((a, b) => b.final - a.final);
}

function pct(value) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n <= 1 ? n * 100 : n);
}

function pctOptional(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n <= 1 ? n * 100 : n);
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(value) {
  return String(value)
    .toLowerCase()
    .replace(/(^|\s|[-'])\S/g, (letter) => letter.toUpperCase());
}

/* ───────────────── MUNICÍPIO COMPACTO ───────────────── */

function MunicipioCompacto({
  selecionado,
  score,
  rankPos,
  fonteMeta,
  usingApi,
  selectedDetails,
  onClose,
  setCompareId,
  ranking,
  scores,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { forca, gargalo } = principaisBlocos(score.blocos);
  const forcaValue = forca ? score.blocos[forca] : null;
  const gargaloValue = gargalo ? score.blocos[gargalo] : null;

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
                  {m.apelido || m.municipio}/{m.uf} · {fonteMeta.short} {scores[m.id].final}
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
              Score {fonteMeta.short}
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
              Completude
            </div>
            <div className="text-amber text-lg font-mono tabular">
              {score.completeness}
              <span className="text-paper/30 text-xs">%</span>
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-2 gap-3 mt-3 text-[11px]">
          <div className="border-l border-amber pl-2">
            <div className="text-[9px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono">
              Força
            </div>
            <div className="text-paper">
              {labelBloco(forca)}{" "}
              <span className="text-amber ml-1">{formatScoreValue(forcaValue)}</span>
            </div>
          </div>
          <div className="border-l border-cinder pl-2">
            <div className="text-[9px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono">
              Gargalo
            </div>
            <div className="text-paper">
              {labelBloco(gargalo)}{" "}
              <span className="text-cinder ml-1">{formatScoreValue(gargaloValue)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div>
        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-2">
          Blocos MCDA
        </div>
        <div className="space-y-1.5">
          {BLOCOS_MCDA.map((c) => (
            <BlockScoreRow key={c.id} label={c.label} value={score.blocos[c.id]} />
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-2">
          Scores por fonte
        </div>
        <SourceScoresList
          details={selectedDetails}
          activeFonte={fonteMeta.id}
        />
      </div>
    </div>
  );
}

function BlockScoreRow({ label, value }) {
  const hasValue = Number.isFinite(value);
  const width = hasValue ? value : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10.5px] text-paper/75 w-32 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-paper/5 relative">
        <motion.div
          className="absolute left-0 top-0 bottom-0"
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          style={{
            background: !hasValue
              ? "rgba(244,241,234,0.18)"
              : value >= 70
              ? "var(--amber)"
              : value >= 45
              ? "#fc6926"
              : "rgba(244,241,234,0.35)",
          }}
        />
      </div>
      <span className="text-[10.5px] font-mono tabular text-paper w-7 text-right">
        {formatScoreValue(value)}
      </span>
    </div>
  );
}

function SourceScoresList({ details, activeFonte }) {
  if (details.status === "loading") {
    return (
      <div className="border border-hairline-strong p-3 text-[11px] text-paper/50 font-mono uppercase tracking-[0.12em]">
        Carregando fontes...
      </div>
    );
  }

  if (!details.scores.length) {
    return (
      <div className="border border-hairline-strong p-3 text-[11.5px] text-paper/55">
        Scores por fonte indisponíveis para este município.
      </div>
    );
  }

  const max = Math.max(...details.scores.map((s) => s.final), 1);

  return (
    <div className="space-y-1.5">
      {details.scores.map((item) => {
        const meta = FONTES_ENERGIA.find((f) => f.id === item.fonte);
        const active = item.fonte === activeFonte;
        return (
          <div
            key={item.fonte}
            className={`border px-2.5 py-2 ${
              active ? "border-amber bg-amber/[0.06]" : "border-hairline-strong"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={active ? "text-amber" : "text-paper/55"}>
                <FonteIcon id={item.fonte} size={12} />
              </span>
              <span className="text-[10.5px] text-paper/80 font-mono tabular uppercase tracking-[0.08em] w-16">
                {meta?.short || item.fonte}
              </span>
              <div className="flex-1 h-1.5 bg-paper/5">
                <motion.div
                  className="h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.final / max) * 100}%` }}
                  transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{ background: active ? "var(--amber)" : "#fc6926" }}
                />
              </div>
              <span className="text-[11px] font-mono tabular text-paper w-7 text-right">
                {item.final}
              </span>
            </div>
            <div className="mt-1 text-[9.5px] text-paper/35 font-mono tabular uppercase tracking-[0.12em]">
              Comp. {item.completeness}%{item.rankFonte ? ` · rank fonte ${item.rankFonte}` : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function labelBloco(id) {
  if (!id) return "Sem dado";
  return BLOCOS_MCDA.find((c) => c.id === id)?.label || id;
}

function principaisBlocos(blocos) {
  const entries = Object.entries(blocos).filter(([, value]) => Number.isFinite(value));
  if (!entries.length) return { forca: null, gargalo: null };
  const max = entries.reduce((a, b) => (a[1] > b[1] ? a : b));
  const min = entries.reduce((a, b) => (a[1] < b[1] ? a : b));
  return { forca: max[0], gargalo: min[0] };
}

function formatScoreValue(value) {
  return Number.isFinite(value) ? value : "s/d";
}

/* ───────────────── COMPARE VIEW (split mode) ───────────────── */

function CompareView({ a, b, scores, ranking, onExit, onChangeB }) {
  const sa = scores[a.id];
  const sb = scores[b.id];
  const finalDelta = sa.final - sb.final;

  const blocosA = sa.blocos;
  const blocosB = sb.blocos;
  const aBetter = BLOCOS_MCDA.filter(
    (c) => Number.isFinite(blocosA[c.id]) && Number.isFinite(blocosB[c.id]) && blocosA[c.id] > blocosB[c.id]
  )
    .sort((x, y) => (blocosA[y.id] - blocosB[y.id]) - (blocosA[x.id] - blocosB[x.id]))
    .slice(0, 1);
  const bBetter = BLOCOS_MCDA.filter(
    (c) => Number.isFinite(blocosA[c.id]) && Number.isFinite(blocosB[c.id]) && blocosB[c.id] > blocosA[c.id]
  )
    .sort((x, y) => (blocosB[y.id] - blocosA[y.id]) - (blocosB[x.id] - blocosA[x.id]))
    .slice(0, 1);

  return (
    <div className="p-5 space-y-5">
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

      <div className="grid grid-cols-2 gap-2">
        <ScoreCard mun={a} score={sa} accent="amber" />
        <ScoreCard mun={b} score={sb} accent="ember" />
      </div>

      <div className="border-l-2 border-amber pl-3 text-[12px] text-paper/85 leading-relaxed">
        {Math.abs(finalDelta) > 5 ? (
          <span>
            <span className={finalDelta > 0 ? "text-amber" : "text-ember"}>
              {finalDelta > 0 ? a.apelido || a.municipio : b.apelido || b.municipio}
            </span>{" "}
            lidera o score geral por {Math.abs(finalDelta)} pontos.
          </span>
        ) : (
          <span>Score geral muito próximo — diferença está nos blocos.</span>
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

      <div>
        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-3">
          Confronto por bloco
        </div>
        <div className="space-y-3">
          {BLOCOS_MCDA.map((c) => (
            <ConfrontoRow
              key={c.id}
              label={c.label}
              va={blocosA[c.id]}
              vb={blocosB[c.id]}
            />
          ))}
        </div>
      </div>

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
        Comp. {score.completeness ?? 0}%
      </div>
    </div>
  );
}

function ConfrontoRow({ label, va, vb }) {
  const hasA = Number.isFinite(va);
  const hasB = Number.isFinite(vb);
  const max = Math.max(hasA ? va : 0, hasB ? vb : 0, 1);
  const winnerA = hasA && hasB && va > vb;
  const winnerB = hasA && hasB && vb > va;
  const tie = hasA && hasB && va === vb;
  return (
    <div>
      <div className="text-[10.5px] text-paper/85 mb-1">{label}</div>
      <div className="flex items-center gap-2 h-5">
        <span
          className={`text-[10.5px] font-mono tabular w-7 text-right ${
            tie ? "text-paper/65" : winnerA ? "text-amber font-medium" : "text-paper/45"
          }`}
        >
          {formatScoreValue(va)}
        </span>
        <div className="flex-1 flex items-center justify-end h-full bg-paper/[0.04]">
          <div
            className="h-full"
            style={{
              width: `${((hasA ? va : 0) / max) * 100}%`,
              background: tie ? "rgba(244,241,234,0.35)" : winnerA ? "var(--amber)" : "rgba(244,241,234,0.25)",
            }}
          />
        </div>
        <div className="w-px h-full bg-hairline-strong" />
        <div className="flex-1 flex items-center h-full bg-paper/[0.04]">
          <div
            className="h-full"
            style={{
              width: `${((hasB ? vb : 0) / max) * 100}%`,
              background: tie ? "rgba(244,241,234,0.35)" : winnerB ? "#fc6926" : "rgba(244,241,234,0.25)",
            }}
          />
        </div>
        <span
          className={`text-[10.5px] font-mono tabular w-7 ${
            tie ? "text-paper/65" : winnerB ? "text-ember font-medium" : "text-paper/45"
          }`}
        >
          {formatScoreValue(vb)}
        </span>
      </div>
    </div>
  );
}

/* ───────────────── METHODOLOGY MODAL ───────────────── */

function MethodologyModal({ onClose }) {
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
        className="bg-ink-deeper border border-hairline-strong max-w-4xl w-full p-6 relative max-h-[calc(100vh-48px)] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-paper/55 hover:text-accent"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-1">
          Metodologia · Hackathon E+ 2026
        </div>
        <h2 className="font-display text-3xl font-light tracking-tightest text-paper leading-[1.1] mb-3">
          Como o indicador municipal é calculado.
        </h2>
        <p className="text-[12.5px] text-paper/65 leading-relaxed mb-5">
          A metodologia combina bases oficiais da ANP, ANEEL e IBGE para avaliar 1.938
          municípios em cinco fontes de energia: solar, eólica, biometano, hidrogênio verde e
          biomassa.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <MethodMetric value="1.938" label="municípios únicos" />
          <MethodMetric value="5" label="fontes avaliadas" />
          <MethodMetric value="3" label="blocos temáticos" />
        </div>

        <div className="border border-hairline-strong p-4 mb-5">
          <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-3">
            Pipeline de dados
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MethodBlock
              label="Bases oficiais"
              text="Arquivos CSV da ANP, ANEEL e IBGE formam a base inicial do indicador."
            />
            <MethodBlock
              label="Padronização"
              text="Municípios são normalizados, sem acentos e com tratamento de inconsistências tipográficas."
            />
            <MethodBlock
              label="core_df"
              text="A base principal consolida município, UF, latitude e longitude média dos empreendimentos."
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <MethodSection
            label="Econômico · 40%"
            items={[
              "Potência instalada e ociosa",
              "Participação renovável",
              "Biometano e transmissão",
            ]}
          />
          <MethodSection
            label="Social · 30%"
            items={[
              "Diversidade de fontes",
              "Plantas em operação",
              "Maturidade energética local",
            ]}
          />
          <MethodSection
            label="Ambiental · 30%"
            items={[
              "CO2 evitado ao ano",
              "Projetos de transmissão",
              "Produção de biometano por UF",
            ]}
          />
        </div>

        <div className="grid grid-cols-[1fr_1.15fr] gap-5">
          <div className="border border-hairline-strong p-4">
            <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-2">
              Normalização
            </div>
            <p className="text-[11.5px] text-paper/75 leading-relaxed mb-3">
              Cada variável é normalizada globalmente para o intervalo [0, 1] pela transformação
              min-max. Variáveis constantes recebem 0,5; valores ausentes são tratados como 0.
            </p>
            <div className="font-mono text-[12px] text-paper bg-paper/[0.04] border border-hairline p-3">
              v_norm = (v - min) / (max - min)
            </div>
          </div>

          <div className="border border-hairline-strong p-4">
            <div className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-2">
              Score composto
            </div>
            <p className="text-[11.5px] text-paper/75 leading-relaxed mb-3">
              Para cada par município × fonte, o modelo calcula sub-scores econômico, social e
              ambiental e combina os blocos por média ponderada.
            </p>
            <div className="font-mono text-[12px] text-paper bg-paper/[0.04] border border-hairline p-3">
              score = 0,40 × eco + 0,30 × social + 0,30 × ambiental
            </div>
          </div>
        </div>

        <div className="mt-5 hatch p-3.5 border border-amber/30 flex items-start gap-2.5">
          <Info size={14} className="text-amber flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono mb-0.5">
              Saída do modelo
            </p>
            <p className="text-[11.5px] text-paper/80 leading-relaxed">
              O resultado final é um score entre 0 e 1 por município × fonte. O ranking completo
              preserva as cinco fontes por município; a base de melhor fonte retém apenas o par de
              rank 1 pelo método dense rank.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MethodMetric({ value, label }) {
  return (
    <div className="border border-hairline-strong p-3">
      <div className="font-display text-2xl font-light text-amber leading-none">{value}</div>
      <div className="text-[10px] tabular tracking-[0.18em] uppercase text-paper/55 font-mono mt-1">
        {label}
      </div>
    </div>
  );
}

function MethodBlock({ label, text }) {
  return (
    <div className="border-l-2 border-amber pl-3">
      <div className="text-[10px] tabular tracking-[0.18em] uppercase text-paper/55 font-mono mb-1">
        {label}
      </div>
      <p className="text-[11.5px] text-paper/75 leading-relaxed">{text}</p>
    </div>
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
            <Circle
              size={5}
              fill="currentColor"
              strokeWidth={0}
              className={`mt-1.5 flex-shrink-0 ${tone === "warn" ? "text-ember" : "text-amber"}`}
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

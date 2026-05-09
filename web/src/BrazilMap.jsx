import React, { useMemo } from "react";
import { motion } from "motion/react";
import { projeta, corDoScore } from "./scoring";

// Silhueta simplificada do Brasil — viewBox 800×900.
// Pontos aproximados pelo contorno (~22 vértices) — não pixel-perfect, mas
// reconhecível e leve. Stroke fino, fill quase imperceptível.
const BRAZIL_PATH = `
M 280 7
L 460 23
L 480 125
L 640 182
L 710 205
L 774 244
L 784 308
L 720 410
L 686 558
L 630 647
L 520 702
L 500 786
L 412 893
L 340 809
L 340 626
L 320 626
L 280 490
L 0 353
L 20 262
L 140 171
L 180 103
Z
`.trim();

export default function BrazilMap({ municipios, scores, selectedId, onSelect, modo }) {
  // Ordena por score crescente para que dots maiores fiquem por cima
  const ordered = useMemo(
    () => [...municipios].sort((a, b) => (scores[a.id]?.final ?? 0) - (scores[b.id]?.final ?? 0)),
    [municipios, scores]
  );

  // Top 3 — destacar
  const top3 = useMemo(() => {
    const list = [...municipios]
      .map((m) => ({ id: m.id, score: scores[m.id]?.final ?? 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.id);
    return new Set(list);
  }, [municipios, scores]);

  return (
    <div className="relative w-full h-full bg-ink-deepest overflow-hidden topo-dots scan-lines">
      {/* Decorative crosshair grid in corners */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <svg width="14" height="14" viewBox="0 0 14 14" className="text-paper/30">
          <line x1="0" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="0.5" />
          <line x1="7" y1="0" x2="7" y2="14" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
      <div className="absolute top-3 right-3 pointer-events-none">
        <svg width="14" height="14" viewBox="0 0 14 14" className="text-paper/30">
          <line x1="0" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="0.5" />
          <line x1="7" y1="0" x2="7" y2="14" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
      <div className="absolute bottom-3 left-3 pointer-events-none">
        <svg width="14" height="14" viewBox="0 0 14 14" className="text-paper/30">
          <line x1="0" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="0.5" />
          <line x1="7" y1="0" x2="7" y2="14" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
      <div className="absolute bottom-3 right-3 pointer-events-none">
        <svg width="14" height="14" viewBox="0 0 14 14" className="text-paper/30">
          <line x1="0" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="0.5" />
          <line x1="7" y1="0" x2="7" y2="14" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Cabeçalho técnico do mapa */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none z-10">
        <div className="flex items-center gap-3">
          <div className="text-[10px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono">
            BR · Equirectangular · WGS84
          </div>
          <div className="h-px w-16 bg-hairline-strong/60" />
          <div className="text-[10px] tabular tracking-[0.18em] uppercase text-amber/70 font-mono">
            n={municipios.length}
          </div>
        </div>
        <div className="text-[10px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono text-right">
          modo: <span className="text-amber">{modo}</span>
        </div>
      </div>

      {/* Indicador "ao vivo" */}
      <div className="absolute bottom-5 left-4 flex items-center gap-2 pointer-events-none z-10">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-amber"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber"></span>
        </span>
        <span className="text-[10px] tabular tracking-[0.18em] uppercase text-paper/55 font-mono">
          Score recalculado · {Object.keys(scores).length} municípios
        </span>
      </div>

      {/* Coordenadas no canto */}
      <div className="absolute bottom-5 right-4 text-right pointer-events-none z-10">
        <div className="text-[10px] tabular tracking-[0.14em] text-paper/40 font-mono">
          Lat -33.74°S → +5.27°N
        </div>
        <div className="text-[10px] tabular tracking-[0.14em] text-paper/40 font-mono">
          Lng -73.99°W → -34.79°W
        </div>
      </div>

      <svg
        viewBox="0 0 800 900"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 80px rgba(252, 194, 10, 0.04))" }}
      >
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(252,194,10,0.05)" />
            <stop offset="100%" stopColor="rgba(252,194,10,0)" />
          </radialGradient>
          <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(244,241,234,0.04)" strokeWidth="1" />
          </pattern>
          <filter id="dotGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glow background sob a silhueta */}
        <ellipse cx="400" cy="450" rx="380" ry="420" fill="url(#mapGlow)" />

        {/* Silhueta Brasil */}
        <path
          d={BRAZIL_PATH}
          fill="url(#hatch)"
          stroke="rgba(244, 241, 234, 0.35)"
          strokeWidth="1.2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Linha interna decorativa — divide N/NE/SE etc. (apenas estética) */}
        <path
          d="M 100 300 Q 350 380 600 280"
          fill="none"
          stroke="rgba(244, 241, 234, 0.06)"
          strokeWidth="0.5"
          strokeDasharray="2 4"
        />
        <path
          d="M 200 600 Q 400 550 650 600"
          fill="none"
          stroke="rgba(244, 241, 234, 0.06)"
          strokeWidth="0.5"
          strokeDasharray="2 4"
        />

        {/* Pontos dos municípios */}
        {ordered.map((m) => {
          const { x, y } = projeta(m.lat, m.lng);
          const score = scores[m.id]?.final ?? 0;
          const isSel = selectedId === m.id;
          const isTop = top3.has(m.id);
          const radius = 4 + (score / 100) * 10;
          const fill = corDoScore(score);

          return (
            <g
              key={m.id}
              className="cursor-pointer"
              onClick={() => onSelect(m.id)}
              role="button"
              tabIndex={0}
            >
              {/* Halo */}
              {isTop && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r={radius * 2.3}
                  fill="none"
                  stroke={fill}
                  strokeWidth="0.8"
                  strokeOpacity="0.35"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.35, 0.05, 0.35] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              {/* Crosshair se selecionado */}
              {isSel && (
                <>
                  <line
                    x1={x - 22}
                    y1={y}
                    x2={x - 8}
                    y2={y}
                    stroke="var(--amber)"
                    strokeWidth="1"
                  />
                  <line
                    x1={x + 8}
                    y1={y}
                    x2={x + 22}
                    y2={y}
                    stroke="var(--amber)"
                    strokeWidth="1"
                  />
                  <line
                    x1={x}
                    y1={y - 22}
                    x2={x}
                    y2={y - 8}
                    stroke="var(--amber)"
                    strokeWidth="1"
                  />
                  <line
                    x1={x}
                    y1={y + 8}
                    x2={x}
                    y2={y + 22}
                    stroke="var(--amber)"
                    strokeWidth="1"
                  />
                </>
              )}
              {/* Outer dot ring */}
              <circle
                cx={x}
                cy={y}
                r={radius + 2}
                fill="none"
                stroke={fill}
                strokeWidth="0.8"
                strokeOpacity={isSel ? 1 : 0.5}
              />
              {/* Solid dot */}
              <motion.circle
                cx={x}
                cy={y}
                r={radius}
                fill={fill}
                fillOpacity={isSel ? 1 : 0.85}
                whileHover={{ scale: 1.3 }}
                style={{ filter: isTop ? "drop-shadow(0 0 6px " + fill + ")" : "none" }}
              />
              {/* Score numérico (apenas top3) */}
              {isTop && (
                <text
                  x={x + radius + 6}
                  y={y + 4}
                  fontSize="11"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="500"
                  fill="var(--amber)"
                >
                  {score}
                </text>
              )}
              {/* Nome (selecionado) */}
              {isSel && (
                <text
                  x={x}
                  y={y - radius - 12}
                  fontSize="11"
                  fontFamily="'Geist', sans-serif"
                  textAnchor="middle"
                  fill="var(--paper)"
                  fontWeight="500"
                >
                  {m.apelido || m.municipio}/{m.uf}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

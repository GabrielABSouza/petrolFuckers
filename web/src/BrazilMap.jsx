import React, { useMemo, useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import topoData from "./brazil_topo.json";
import { corDoScore } from "./scoring";

// Pré-extrai a feature collection uma única vez
const BR_FEATURES = feature(topoData, topoData.objects.states);

export default function BrazilMap({ municipios, scores, selectedId, compareId, onSelect, modo }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      if (r.width > 0 && r.height > 0) setSize({ w: r.width, h: r.height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Projeção encaixada nas dimensões do container
  const { projection, pathFn } = useMemo(() => {
    const proj = geoMercator().fitExtent(
      [
        [size.w * 0.06, size.h * 0.06],
        [size.w * 0.94, size.h * 0.94],
      ],
      BR_FEATURES
    );
    return { projection: proj, pathFn: geoPath(proj) };
  }, [size]);

  // Pontos projetados a partir de lat/lng
  const points = useMemo(() => {
    return municipios.map((m) => {
      const xy = projection([m.lng, m.lat]);
      return { ...m, x: xy?.[0] ?? 0, y: xy?.[1] ?? 0 };
    });
  }, [municipios, projection]);

  // Top 3 dos scores
  const top3Set = useMemo(() => {
    const list = [...municipios]
      .map((m) => ({ id: m.id, score: scores[m.id]?.final ?? 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.id);
    return new Set(list);
  }, [municipios, scores]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-ink-deepest overflow-hidden topo-dots scan-lines"
    >
      {/* Cabeçalho técnico */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none z-10">
        <div className="flex items-center gap-3">
          <div className="text-[10px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono">
            BR · Mercator · WGS84
          </div>
          <div className="h-px w-16 bg-hairline-strong/60" />
          <div className="text-[10px] tabular tracking-[0.18em] uppercase text-amber/70 font-mono">
            n={municipios.length}
          </div>
        </div>
      </div>

      {/* Status ao vivo */}
      <div className="absolute bottom-5 left-4 flex items-center gap-2 pointer-events-none z-10">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-amber" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber" />
        </span>
        <span className="text-[10px] tabular tracking-[0.18em] uppercase text-paper/55 font-mono">
          Score recalculado · {Object.keys(scores).length} municípios
        </span>
      </div>

      <div className="absolute bottom-5 right-4 text-right pointer-events-none z-10">
        <div className="text-[10px] tabular tracking-[0.14em] text-paper/40 font-mono">
          26 UFs + DF
        </div>
      </div>

      <svg
        width={size.w}
        height={size.h}
        viewBox={`0 0 ${size.w} ${size.h}`}
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <radialGradient id="brGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(252,194,10,0.04)" />
            <stop offset="100%" stopColor="rgba(252,194,10,0)" />
          </radialGradient>
          <pattern
            id="hatch"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="var(--map-stroke-soft)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <ellipse
          cx={size.w / 2}
          cy={size.h / 2}
          rx={size.w * 0.42}
          ry={size.h * 0.42}
          fill="url(#brGlow)"
        />

        {/* Estados com fill hatch */}
        <g>
          {BR_FEATURES.features.map((f, i) => (
            <path
              key={f.properties?.uf || i}
              d={pathFn(f)}
              fill="url(#hatch)"
              stroke="var(--map-stroke-mid)"
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* Contorno mais visível */}
        <g style={{ pointerEvents: "none" }}>
          {BR_FEATURES.features.map((f, i) => (
            <path
              key={`outline-${i}`}
              d={pathFn(f)}
              fill="none"
              stroke="var(--map-stroke-strong)"
              strokeWidth="0.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Pontos dos municípios */}
        <g>
          {points.map((p) => {
            const score = scores[p.id]?.final ?? 0;
            const isSel = selectedId === p.id;
            const isCmp = compareId === p.id;
            const isTop = top3Set.has(p.id);
            const radius = 4 + (score / 100) * 8;
            const fill = corDoScore(score);
            const crosshairColor = isSel ? "var(--amber)" : isCmp ? "#fc6926" : null;

            return (
              <g
                key={p.id}
                className="cursor-pointer"
                onClick={() => onSelect(p.id)}
                role="button"
              >
                {isTop && (
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    r={radius * 2.4}
                    fill="none"
                    stroke={fill}
                    strokeWidth="0.8"
                    strokeOpacity="0.4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.85, 1.4, 0.85], opacity: [0.4, 0.06, 0.4] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                {crosshairColor && (
                  <>
                    <line
                      x1={p.x - 22}
                      y1={p.y}
                      x2={p.x - radius - 4}
                      y2={p.y}
                      stroke={crosshairColor}
                      strokeWidth="1"
                      strokeDasharray={isCmp ? "2 2" : "0"}
                    />
                    <line
                      x1={p.x + radius + 4}
                      y1={p.y}
                      x2={p.x + 22}
                      y2={p.y}
                      stroke={crosshairColor}
                      strokeWidth="1"
                      strokeDasharray={isCmp ? "2 2" : "0"}
                    />
                    <line
                      x1={p.x}
                      y1={p.y - 22}
                      x2={p.x}
                      y2={p.y - radius - 4}
                      stroke={crosshairColor}
                      strokeWidth="1"
                      strokeDasharray={isCmp ? "2 2" : "0"}
                    />
                    <line
                      x1={p.x}
                      y1={p.y + radius + 4}
                      x2={p.x}
                      y2={p.y + 22}
                      stroke={crosshairColor}
                      strokeWidth="1"
                      strokeDasharray={isCmp ? "2 2" : "0"}
                    />
                  </>
                )}

                <circle
                  cx={p.x}
                  cy={p.y}
                  r={radius + 2}
                  fill="none"
                  stroke={fill}
                  strokeWidth="0.7"
                  strokeOpacity={isSel || isCmp ? 1 : 0.5}
                />
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={radius}
                  fill={fill}
                  fillOpacity={isSel ? 1 : 0.85}
                  whileHover={{ scale: 1.3 }}
                  style={{
                    filter: isTop ? `drop-shadow(0 0 5px ${fill})` : "none",
                  }}
                />
                {isTop && (
                  <text
                    x={p.x + radius + 6}
                    y={p.y + 4}
                    fontSize="11"
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="500"
                    fill="var(--amber)"
                  >
                    {score}
                  </text>
                )}
                {(isSel || isCmp) && (
                  <text
                    x={p.x}
                    y={p.y - radius - 12}
                    fontSize="11"
                    fontFamily="'Geist', sans-serif"
                    textAnchor="middle"
                    fill={isSel ? "var(--paper)" : "#fc6926"}
                    fontWeight="500"
                  >
                    {p.apelido || p.municipio}/{p.uf}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

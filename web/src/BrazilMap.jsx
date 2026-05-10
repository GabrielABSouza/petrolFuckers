import React, { useMemo, useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { geoContains, geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import topoData from "./brazil_topo.json";

// Pré-extrai a feature collection uma única vez
const BR_FEATURES = feature(topoData, topoData.objects.states);
const UF_NAME_BY_CODE = {
  AC: "Acre",
  AL: "Alagoas",
  AM: "Amazonas",
  AP: "Amapá",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MG: "Minas Gerais",
  MS: "Mato Grosso do Sul",
  MT: "Mato Grosso",
  PA: "Pará",
  PB: "Paraíba",
  PE: "Pernambuco",
  PI: "Piauí",
  PR: "Paraná",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RO: "Rondônia",
  RR: "Roraima",
  RS: "Rio Grande do Sul",
  SC: "Santa Catarina",
  SE: "Sergipe",
  SP: "São Paulo",
  TO: "Tocantins",
};

export default function BrazilMap({
  municipios,
  scores,
  selectedId,
  compareId,
  onSelect,
  fonte,
  ufAtiva = "BR",
  datasetStatus,
}) {
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

  const focusFeatures = useMemo(() => {
    const ufName = UF_NAME_BY_CODE[ufAtiva];
    if (!ufName) return BR_FEATURES.features;
    const filtered = BR_FEATURES.features.filter((f) => f.properties?.uf === ufName);
    return filtered.length ? filtered : BR_FEATURES.features;
  }, [ufAtiva]);

  const focusCollection = useMemo(
    () => ({ type: "FeatureCollection", features: focusFeatures }),
    [focusFeatures]
  );

  // Projeção encaixada nas dimensões do container
  const { projection, pathFn } = useMemo(() => {
    const proj = geoMercator().fitExtent(
      [
        [size.w * 0.07, size.h * 0.07],
        [size.w * 0.93, size.h * 0.93],
      ],
      focusCollection
    );
    return { projection: proj, pathFn: geoPath(proj) };
  }, [focusCollection, size]);

  // Pontos projetados a partir de lat/lng
  const points = useMemo(() => {
    return municipios
      .filter((m) => isValidBrazilCoord(m.lat, m.lng))
      .filter((m) => geoContains(focusCollection, [m.lng, m.lat]))
      .map((m) => {
        const xy = projection([m.lng, m.lat]);
        return { ...m, x: xy?.[0] ?? 0, y: xy?.[1] ?? 0 };
      })
      .filter((m) => Number.isFinite(m.x) && Number.isFinite(m.y));
  }, [focusCollection, municipios, projection]);

  // Top 3 dos scores
  const top3Set = useMemo(() => {
    const list = [...points]
      .map((m) => ({ id: m.id, score: scores[m.id]?.final ?? 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.id);
    return new Set(list);
  }, [points, scores]);

  const medianScore = useMemo(() => {
    const values = points
      .map((m) => scores[m.id]?.final)
      .filter((v) => Number.isFinite(v))
      .sort((a, b) => a - b);
    if (!values.length) return 0;
    return values[Math.floor(values.length / 2)];
  }, [points, scores]);

  const highlightPoints = useMemo(
    () => points.filter((p) => p.id === selectedId || p.id === compareId),
    [compareId, points, selectedId]
  );

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
            n={points.length}
          </div>
        </div>
        <div className="text-[10px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono">
          Fonte · {fonte?.short || "energia"}{ufAtiva !== "BR" ? ` · ${ufAtiva}` : ""}
        </div>
      </div>

      {/* Status ao vivo */}
      <div className="absolute bottom-5 left-4 flex items-center gap-2 pointer-events-none z-10">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-amber" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber" />
        </span>
        <span className="text-[10px] tabular tracking-[0.18em] uppercase text-paper/55 font-mono">
          Score por fonte · {datasetStatus === "api" ? "API" : "fallback local"}
        </span>
      </div>

      <MapLegend />

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
          {focusFeatures.map((f, i) => (
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
          {focusFeatures.map((f, i) => (
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
            const scoreObj = scores[p.id] ?? {};
            const score = scoreObj.final ?? 0;
            const isTop = top3Set.has(p.id);
            const radius = datasetStatus === "api" ? 1.8 + (score / 100) * 5.5 : 4 + (score / 100) * 8;
            const fill = corDoPonto(scoreObj, medianScore);
            const fillOpacity = isTop ? 0.95 : scoreObj.completeness < 60 ? 0.18 : 0.34;

            return (
              <g
                key={p.id}
                data-municipio-id={p.id}
                data-municipio-cx={p.x}
                data-municipio-cy={p.y}
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

                <circle
                  cx={p.x}
                  cy={p.y}
                  r={radius + 2}
                  fill="none"
                  stroke={fill}
                  strokeWidth="0.8"
                  strokeOpacity={isTop ? 0.95 : 0.48}
                />
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={radius}
                  fill={fill}
                  fillOpacity={fillOpacity}
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
              </g>
            );
          })}
        </g>

        {/* Seleção sempre por cima dos pontos densos */}
        <g pointerEvents="none">
          {highlightPoints.map((p) => {
            const isSel = selectedId === p.id;
            const score = scores[p.id]?.final ?? 0;
            const radius = 7 + (score / 100) * 4;
            const color = isSel ? "var(--amber)" : "#fc6926";
            return (
              <g key={`highlight-${p.id}`}>
                <circle cx={p.x} cy={p.y} r={radius + 12} fill="rgba(2,15,31,0.72)" />
                <circle cx={p.x} cy={p.y} r={radius + 8} fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.45" />
                <circle cx={p.x} cy={p.y} r={radius} fill={color} fillOpacity="0.95" stroke="var(--ink-deepest)" strokeWidth="2" />
                <line x1={p.x - 24} y1={p.y} x2={p.x - radius - 6} y2={p.y} stroke={color} strokeWidth="1" strokeDasharray={isSel ? "0" : "2 2"} />
                <line x1={p.x + radius + 6} y1={p.y} x2={p.x + 24} y2={p.y} stroke={color} strokeWidth="1" strokeDasharray={isSel ? "0" : "2 2"} />
                <line x1={p.x} y1={p.y - 24} x2={p.x} y2={p.y - radius - 6} stroke={color} strokeWidth="1" strokeDasharray={isSel ? "0" : "2 2"} />
                <line x1={p.x} y1={p.y + radius + 6} x2={p.x} y2={p.y + 24} stroke={color} strokeWidth="1" strokeDasharray={isSel ? "0" : "2 2"} />
                <text
                  x={p.x}
                  y={p.y - radius - 16}
                  fontSize="12"
                  fontFamily="'Geist', sans-serif"
                  textAnchor="middle"
                  fill="var(--paper)"
                  fontWeight="600"
                  stroke="rgba(2,15,31,0.9)"
                  strokeWidth="3"
                  paintOrder="stroke"
                >
                  {p.apelido || p.municipio}/{p.uf}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function isValidBrazilCoord(lat, lng) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -34.5 &&
    lat <= 6 &&
    lng >= -75 &&
    lng <= -32
  );
}

function corDoPonto(score, medianScore) {
  if ((score.completeness ?? 100) < 60) return "rgba(244, 241, 234, 0.42)";
  if ((score.rankPosition ?? 9999) <= 3) return "var(--amber)";
  if ((score.final ?? 0) >= medianScore) return "#fc6926";
  if ((score.final ?? 0) >= medianScore * 0.75) return "#fa441a";
  return "rgba(244, 241, 234, 0.36)";
}

function MapLegend() {
  return (
    <div className="absolute bottom-12 right-4 z-10 pointer-events-none border border-hairline-strong bg-ink-deepest/72 backdrop-blur px-3 py-2.5">
      <div className="text-[9px] tabular tracking-[0.2em] uppercase text-amber font-mono mb-2">
        Legenda
      </div>
      <div className="space-y-1.5 text-[10.5px] text-paper/65">
        <LegendDot color="var(--amber)" label="Top 3 da fonte" />
        <LegendDot color="#fc6926" label="Acima da mediana" />
        <LegendDot color="#fa441a" label="Triagem intermediária" />
        <LegendDot color="rgba(244, 241, 234, 0.42)" label="Dados parciais" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="block h-2 w-2 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

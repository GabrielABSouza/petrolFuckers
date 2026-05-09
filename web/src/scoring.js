// Cálculo de score normalizado 0-100 por critério, dado um município.
// Combina critérios via média ponderada com os pesos do estado da UI.

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

// Normaliza valor em [vmin, vmax] → [0, 100], com saturação suave
const norm = (v, vmin, vmax) => clamp(((v - vmin) / (vmax - vmin)) * 100);
const invNorm = (v, vmin, vmax) => 100 - norm(v, vmin, vmax);

export function computeBreakdown(m) {
  // Recurso: capacidade operacional + pipeline (ambos contam, pipeline com peso menor)
  const recursoBruto = m.capacidadeRenovavelMw + 0.4 * m.pipelineMw;
  const score_recurso = norm(recursoBruto, 200, 12000);

  // Rede: alta margem + baixa distância. Combina os dois.
  const margemNorm = norm(m.margemRedeMw, 100, 2000);
  const distanciaNorm = invNorm(m.distanciaSubestacaoKm, 2, 40);
  const score_rede = clamp(0.65 * margemNorm + 0.35 * distanciaNorm);

  // Demanda: vem direto do score industrial mockado
  const score_demanda = clamp(m.demandaIndustrialScore);

  // Baixo risco: invertido do risco socioambiental
  const score_risco = clamp(100 - m.riscoSocioambientalScore);

  // Desenvolvimento: direto
  const score_desenvolvimento = clamp(m.desenvolvimentoRegionalScore);

  // Prontidão data center: combina prontidão + fibra próxima + rede + baixo risco
  const fibraNorm = invNorm(m.distanciaFibraKm, 4, 100);
  const score_datacenter = clamp(
    0.45 * m.prontidaoDataCenterScore +
      0.25 * fibraNorm +
      0.15 * score_rede +
      0.15 * score_risco
  );

  return {
    recurso: Math.round(score_recurso),
    rede: Math.round(score_rede),
    demanda: Math.round(score_demanda),
    risco: Math.round(score_risco),
    desenvolvimento: Math.round(score_desenvolvimento),
    datacenter: Math.round(score_datacenter),
  };
}

export function computeFinalScore(breakdown, pesos) {
  const total =
    pesos.recurso * breakdown.recurso +
    pesos.rede * breakdown.rede +
    pesos.demanda * breakdown.demanda +
    pesos.risco * breakdown.risco +
    pesos.desenvolvimento * breakdown.desenvolvimento +
    pesos.datacenter * breakdown.datacenter;
  return Math.round(total);
}

// Identifica o critério mais forte / mais fraco
export function principais(breakdown) {
  const entries = Object.entries(breakdown);
  const max = entries.reduce((a, b) => (a[1] > b[1] ? a : b));
  const min = entries.reduce((a, b) => (a[1] < b[1] ? a : b));
  return { forca: max[0], gargalo: min[0] };
}

// Recomendações acionáveis a partir do breakdown e modo
export function gerarRecomendacoes(breakdown, modo) {
  const recs = [];

  if (breakdown.rede < 50) {
    recs.push({
      tipo: "rede",
      texto: "Aprofundar estudo de margem de escoamento e validar conexão com ONS/distribuidora.",
      severidade: breakdown.rede < 30 ? "alta" : "media",
    });
  }
  if (breakdown.risco < 60) {
    recs.push({
      tipo: "risco",
      texto: "Avaliar impacto socioambiental local — sobrepor com Terrabrasilis e Código Florestal.",
      severidade: breakdown.risco < 35 ? "alta" : "media",
    });
  }
  if (breakdown.demanda < 50) {
    recs.push({
      tipo: "demanda",
      texto: "Mapear potenciais compradores de energia (offtake) na região.",
      severidade: "media",
    });
  }
  if (modo === "data_centers" && breakdown.datacenter < 60) {
    recs.push({
      tipo: "datacenter",
      texto: "Validar fibra, redundância e disponibilidade hídrica para refrigeração.",
      severidade: breakdown.datacenter < 40 ? "alta" : "media",
    });
  }
  if (breakdown.recurso > 75 && breakdown.demanda < 40) {
    recs.push({
      tipo: "powershoring",
      texto: "Mismatch energia/indústria detectado — candidato a powershoring (atrair indústria eletrointensiva).",
      severidade: "info",
    });
  }
  if (recs.length === 0) {
    recs.push({
      tipo: "padrao",
      texto: "Município com indicadores balanceados — priorizar due diligence técnica detalhada.",
      severidade: "info",
    });
  }
  return recs;
}

// Projeção lat/lng → coordenadas SVG (viewBox 800×900)
// Brasil bbox aproximada: lat [-34, 5.5], lng [-74, -34]
export function projeta(lat, lng, w = 800, h = 900) {
  const x = ((lng - -74) / 40) * w;
  const y = (1 - (lat - -34) / 39.5) * h;
  return { x, y };
}

// Cores do score em escala
export function corDoScore(score) {
  if (score >= 75) return "var(--amber)"; // top
  if (score >= 60) return "#fc6926"; // ember
  if (score >= 45) return "#fa441a"; // cinder
  return "rgba(244, 241, 234, 0.42)"; // neutro
}

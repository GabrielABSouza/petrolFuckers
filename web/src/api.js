const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function fetchMunicipios(fonte, { top = 2000, uf, minCompleteness = 0 } = {}) {
  const params = new URLSearchParams({ fonte, top, min_completeness: minCompleteness });
  if (uf) params.set("uf", uf);
  const res = await fetch(`${BASE}/municipios?${params}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function fetchMunicipioDetalhe(nome) {
  const res = await fetch(`${BASE}/municipios/${encodeURIComponent(nome)}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function fetchInsights() {
  const res = await fetch(`${BASE}/insights`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function fetchAgenteChat({ sessionId, message, context }) {
  const res = await fetch(`${BASE}/agente/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message, context }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

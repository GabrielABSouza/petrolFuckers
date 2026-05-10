// Captura os 7 screenshots do Radar PID + mede coords reais dos elementos
// que o cursor precisa "clicar". Salva tudo em video/public/{*.png,coords.json}.
//
// Uso: cd video && node scripts/capture.mjs

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
const SRC_DIR = path.resolve(__dirname, "..", "src");

const FRONT_URL = "http://127.0.0.1:5173";
const VIEWPORT = { width: 1920, height: 1080 };

const QUESTION = "quais as politicas publicas disponiveis para minas gerais?";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shoot(page, name, waitMs = 800) {
  await sleep(waitMs);
  await page.screenshot({ path: path.join(PUBLIC_DIR, name), fullPage: false });
  console.log(`  ✓ ${name}`);
}

async function setDemo(page, key, value) {
  await page.evaluate(
    ({ k, v }) => window.__demo?.[k]?.(v),
    { k: key, v: value }
  );
}

// Retorna { x, y } em % do viewport pro centro do elemento que casa com `selector`.
async function pctCenter(page, selector) {
  try {
    const box = await page.locator(selector).first().boundingBox({ timeout: 3000 });
    if (!box) return null;
    return {
      x: ((box.x + box.width / 2) / VIEWPORT.width) * 100,
      y: ((box.y + box.height / 2) / VIEWPORT.height) * 100,
    };
  } catch {
    return null;
  }
}

// Coord do dot do município no SVG. Usa data-municipio-id que adicionamos ao <g>.
async function dotPct(page, id) {
  // O <g> não tem bbox direto (transforms/svg). Pegamos o data-municipio-cx/cy
  // que armazenamos como atributo e convertemos pra viewport coords.
  const data = await page.evaluate((mid) => {
    const g = document.querySelector(`g[data-municipio-id="${mid}"]`);
    if (!g) return null;
    const svg = g.closest("svg");
    if (!svg) return null;
    const cx = parseFloat(g.getAttribute("data-municipio-cx"));
    const cy = parseFloat(g.getAttribute("data-municipio-cy"));
    const svgRect = svg.getBoundingClientRect();
    // cx/cy estão em coords do SVG (viewBox). svg.viewBox.baseVal dá o referencial.
    const vb = svg.viewBox.baseVal;
    const px = svgRect.left + (cx / vb.width) * svgRect.width;
    const py = svgRect.top + (cy / vb.height) * svgRect.height;
    return { px, py };
  }, id);
  if (!data) return null;
  return {
    x: (data.px / VIEWPORT.width) * 100,
    y: (data.py / VIEWPORT.height) * 100,
  };
}

(async () => {
  console.log("→ Abrindo Chromium…");
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  console.log(`→ Carregando ${FRONT_URL}…`);
  await page.goto(FRONT_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForFunction(() => !!window.__demo, { timeout: 10000 });
  await page.waitForFunction(
    () => document.querySelectorAll("svg circle").length > 50,
    { timeout: 15000 }
  );

  const coords = {
    // cena 1 (vazio) — cursor inicial centro
    vazio: { x: 50, y: 50 },
    // cenas 2-7 preenchidas abaixo após medir
  };

  console.log("→ Capturando estados + medindo coords reais…");

  // Estado 1 — vazio (Solar + Brasil)
  await setDemo(page, "setFonteAtiva", "Solar");
  await setDemo(page, "setUfAtiva", "BR");
  await setDemo(page, "setSelectedId", null);
  await setDemo(page, "setCompareId", null);
  await sleep(1200);

  // Mede coord do botão H2V ANTES de clicar (ele tá na tela 1)
  coords.h2v = await pctCenter(page, "button:has-text('H2V')");
  console.log("    coord h2v:", coords.h2v);
  await shoot(page, "01-vazio.png", 300);

  // Estado 2 — H2V
  await setDemo(page, "setFonteAtiva", "H2 Verde");
  await sleep(1000);
  // Mede coord do dropdown Recorte (próximo target)
  coords.recorte = await pctCenter(page, "select");
  console.log("    coord recorte:", coords.recorte);
  await shoot(page, "02-h2v.png", 200);

  // Estado 3 — MG
  await setDemo(page, "setUfAtiva", "MG");
  await sleep(1500);
  // Mede coord do dot Araporã (próximo target)
  coords.arapora = await dotPct(page, "arapora-mg");
  console.log("    coord arapora:", coords.arapora);
  await shoot(page, "03-mg.png", 200);

  // Estado 4 — Araporã
  await setDemo(page, "setSelectedId", "arapora-mg");
  await sleep(1200);
  // Mede coord do botão Comparar
  coords.compare =
    (await pctCenter(page, "button[aria-label*='omparar']")) ||
    (await pctCenter(page, "button:has-text('Comparar')"));
  console.log("    coord compare:", coords.compare);
  await shoot(page, "04-arapora.png", 200);

  // Estado 5 — modo compare
  await setDemo(page, "setCompareId", "__pending__");
  await sleep(1000);
  // Mede coord do dot Janaúba
  coords.janauba = await dotPct(page, "janauba-mg");
  console.log("    coord janauba:", coords.janauba);
  await shoot(page, "05-compare.png", 200);

  // Estado 6 — Janaúba
  await setDemo(page, "setCompareId", "janauba-mg");
  await sleep(1500);
  // Mede coord do chat input (próximo target)
  coords.chat = await pctCenter(page, "input[placeholder*='copiloto']");
  console.log("    coord chat:", coords.chat);
  await shoot(page, "06-janauba.png", 200);

  // Estado 7 — pergunta + resposta do agente
  const chatInput = page.getByPlaceholder("Pergunte ao copiloto…");
  await chatInput.click();
  await chatInput.fill(QUESTION);
  await page.keyboard.press("Enter");

  console.log("  → aguardando resposta do agente (até 60s)…");
  try {
    await page.waitForFunction(
      () => {
        const t = (document.body.innerText || "").toLowerCase();
        return t.includes("reidi") || t.includes("sudam") || t.includes("bndes") || t.includes("biometano");
      },
      { timeout: 60000 }
    );
  } catch {
    console.warn("  ⚠ resposta não chegou, capturando mesmo assim");
  }
  await shoot(page, "07-agente.png", 2500);

  // Coord do PAINEL DO COPILOTO inteiro (pra animação de zoom na cena 7)
  // Tenta achar via aria-label ou seletor — fallback pra coord aproximada
  const copilotoPanel =
    (await pctCenter(page, "[data-copiloto-panel]")) ||
    (await pctCenter(page, "aside:has(input[placeholder*='copiloto'])"));
  // Bbox completo do painel (não só center)
  const copilotoBbox = await page.evaluate(() => {
    const sel = "aside:has(input[placeholder*='copiloto']), [data-copiloto-panel]";
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  if (copilotoBbox) {
    coords.copilotoPanel = {
      x: (copilotoBbox.x / VIEWPORT.width) * 100,
      y: (copilotoBbox.y / VIEWPORT.height) * 100,
      w: (copilotoBbox.w / VIEWPORT.width) * 100,
      h: (copilotoBbox.h / VIEWPORT.height) * 100,
    };
  } else {
    // Fallback: painel à direita 400px de 1920 viewport
    coords.copilotoPanel = { x: 79, y: 8, w: 21, h: 92 };
  }
  console.log("    coord copiloto panel:", coords.copilotoPanel);

  await browser.close();

  // Escreve coords.json em src/ pra DemoVideo.tsx importar
  fs.writeFileSync(
    path.join(SRC_DIR, "coords.json"),
    JSON.stringify(coords, null, 2) + "\n"
  );
  console.log(`\n✓ 7 screenshots + coords.json salvos`);
})();

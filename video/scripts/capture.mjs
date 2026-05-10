// Captura os 7 screenshots do Radar PID rodando local em http://127.0.0.1:5173.
// Pré-requisito: front + api locais rodando, App.jsx expondo window.__demo.
// Uso: cd video && node scripts/capture.mjs

import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");

const FRONT_URL = "http://127.0.0.1:5173";
const VIEWPORT = { width: 1920, height: 1080 };

// Pergunta enviada ao agente no estado 7
const QUESTION = "quais as politicas publicas disponiveis para minas gerais?";

// Helpers
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shoot(page, name, waitMs = 800) {
  await sleep(waitMs);
  const file = path.join(PUBLIC_DIR, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  ✓ ${name}`);
}

async function setDemo(page, key, value) {
  await page.evaluate(
    ({ k, v }) => {
      // setSelectedId/setCompareId aceitam string ou null
      window.__demo?.[k]?.(v);
    },
    { k: key, v: value }
  );
}

(async () => {
  console.log("→ Abrindo Chromium…");
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  console.log(`→ Carregando ${FRONT_URL}…`);
  await page.goto(FRONT_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForFunction(() => !!window.__demo, { timeout: 10000 });
  // Aguarda o fetch inicial dos municípios
  await page.waitForFunction(
    () => {
      // Heurística: o mapa renderiza com pontos quando dataset está pronto
      const dots = document.querySelectorAll("svg circle");
      return dots.length > 50;
    },
    { timeout: 15000 }
  );

  console.log("→ Capturando estados…");

  // Estado 1 — vazio: fonte Solar (não-default, "antes de filtrar H2V")
  await setDemo(page, "setFonteAtiva", "Solar");
  await setDemo(page, "setUfAtiva", "BR");
  await setDemo(page, "setSelectedId", null);
  await setDemo(page, "setCompareId", null);
  await shoot(page, "01-vazio.png", 1500);

  // Estado 2 — H2V selecionado
  await setDemo(page, "setFonteAtiva", "H2 Verde");
  await shoot(page, "02-h2v.png", 1500);

  // Estado 3 — Recorte MG
  await setDemo(page, "setUfAtiva", "MG");
  await shoot(page, "03-mg.png", 1500);

  // Estado 4 — Araporã selecionado
  await setDemo(page, "setSelectedId", "arapora-mg");
  await shoot(page, "04-arapora.png", 1200);

  // Estado 5 — Modo comparação ativo (selecionado + sinaliza compareId vazio)
  // O front entra em modo compare quando compareId é setado E é diferente de selectedId
  // Pra "modo comparação só com Araporã selecionado", podemos usar um id placeholder
  // que não bate com nenhum município ativo — ou simplesmente capturar o estado que tem
  // o botão de comparação ativado. Como o botão atualiza compareId pra "" (truthy null check),
  // vamos primeiro setar compareId pra um id sentinel.
  // Workaround: setar compareId pra "__pending__" — não é ID válido, vai cair no fallback do front.
  await setDemo(page, "setCompareId", "__pending__");
  await shoot(page, "05-compare.png", 1000);

  // Estado 6 — Janaúba também selecionado
  await setDemo(page, "setCompareId", "janauba-mg");
  await shoot(page, "06-janauba.png", 1500);

  // Estado 7 — pergunta ao agente
  // Encontra o input do copiloto
  const chatInput = page.getByPlaceholder("Pergunte ao copiloto…");
  await chatInput.click();
  await chatInput.fill(QUESTION);
  await page.keyboard.press("Enter");

  console.log("  → aguardando resposta do agente (até 60s)…");
  // Aguarda 1ª resposta do agente — busca por algo que apareça quando há mensagem
  // O Copiloto.jsx renderiza msg.role === 'assistant' como div com border-l-2 border-amber
  // Aguarda também por texto que indica resposta concluída
  try {
    await page.waitForFunction(
      () => {
        const text = document.body.innerText || "";
        return text.toLowerCase().includes("reidi") || text.toLowerCase().includes("sudam") || text.toLowerCase().includes("bndes");
      },
      { timeout: 60000 }
    );
  } catch (e) {
    console.warn("  ⚠ resposta não chegou em 60s, capturando mesmo assim");
  }
  // Espera mais 2s pra animação settle
  await shoot(page, "07-agente.png", 2500);

  await browser.close();
  console.log(`\n✓ 7 screenshots salvos em ${PUBLIC_DIR}`);
})();

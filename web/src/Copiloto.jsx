import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowUp, Sparkles } from "lucide-react";
import { CRITERIOS, MODOS, INSTRUMENTOS_LABELS, CATEGORIAS_INSTRUMENTOS } from "./data";
import { principais } from "./scoring";

const SUGESTOES = [
  "Quais incentivos públicos podem se aplicar?",
  "Isso é elegibilidade confirmada ou triagem?",
  "Por que este município foi recomendado?",
  "Compare os top 3 para data centers de IA",
  "Quais gargalos preciso destravar?",
  "Quais dados ainda são mockados?",
];

const CARIMBO =
  "↗ resposta gerada do estado da app · todos os instrumentos são triagem, não parecer jurídico";

function gerarBriefingMunicipio(m, sc) {
  const { forca, gargalo } = principais(sc.breakdown);
  const grupos = agruparInstrumentos(m.instrumentosPublicos);
  const linhas = [
    `Briefing: ${m.apelido || m.municipio}/${m.uf}`,
    "",
    `Score de triagem ${sc.final}/100. Força: ${labelCriterio(forca)}. Gargalo: ${labelCriterio(gargalo)}.`,
    "",
    `Convergência pública preliminar — ${m.convergenciaPublicaScore}/100`,
    ...Object.entries(grupos).map(
      ([cat, lista]) =>
        `  ${CATEGORIAS_INSTRUMENTOS[cat].glifo} ${CATEGORIAS_INSTRUMENTOS[cat].label}: ${lista
          .map((id) => INSTRUMENTOS_LABELS[id].nome)
          .join(", ")}`
    ),
    "",
    "Pergunte 'quais incentivos podem se aplicar?' para abrir cada instrumento.",
    "",
    CARIMBO,
  ];
  return linhas.join("\n");
}

function labelCriterio(id) {
  return CRITERIOS.find((c) => c.id === id)?.label.toLowerCase() || id;
}

function agruparInstrumentos(lista) {
  const out = {};
  for (const id of lista) {
    const inst = INSTRUMENTOS_LABELS[id];
    if (!inst) continue;
    if (!out[inst.categoria]) out[inst.categoria] = [];
    out[inst.categoria].push(id);
  }
  return out;
}

function descricaoInstrumento(id) {
  const map = {
    REIDI: "regime fiscal especial p/ infra (suspende PIS/COFINS)",
    SUDENE: "incentivo IRPJ até 75% para projetos no Nordeste",
    SUDAM: "incentivo IRPJ até 75% para projetos na Amazônia Legal",
    Debentures: "captação de longo prazo c/ benefício fiscal ao investidor",
    FNE: "Banco do Nordeste — linhas verdes c/ taxa subsidiada",
    FNO: "Banco da Amazônia — linhas verdes c/ taxa subsidiada",
    FCO: "Banco do Brasil — Centro-Oeste, energia + agro",
    BNDES: "linhas Climate Finance / Energia / TIC",
    Leilao: "leilões A-3/A-4/A-5 e LRCAP — receita regulada",
    PNCP: "editais e contratos abertos por palavra-chave",
    Transferegov: "convênios e parcerias federais",
    Obrasgov: "obras públicas em execução próximas",
    PAC: "carteira do Novo PAC — eixo energia/conectividade",
    REDATA: "Política Nacional de Data Centers — incentivo p/ energia limpa",
  };
  return map[id] || "instrumento público";
}

function gerarResposta(pergunta, ctx) {
  const { selecionado, ranking, modo, scores } = ctx;
  const p = pergunta.toLowerCase();

  // INCENTIVOS / ELEGIBILIDADE
  if (p.includes("incentivo") || p.includes("elegibil") || p.includes("instrumento")) {
    if (!selecionado) {
      return [
        "Selecione um município primeiro. Cada um tem instrumentos públicos diferentes.",
        "",
        "No geral, o Radar PID rastreia 5 categorias de instrumento:",
        ...Object.entries(CATEGORIAS_INSTRUMENTOS).map(
          ([k, v]) => `  ${v.glifo} ${v.label}`
        ),
        "",
        CARIMBO,
      ].join("\n");
    }
    const grupos = agruparInstrumentos(selecionado.instrumentosPublicos);
    const linhas = [
      `Instrumentos públicos com sinal preliminar para ${selecionado.apelido || selecionado.municipio}/${selecionado.uf}:`,
      "",
    ];
    Object.entries(grupos).forEach(([cat, lista]) => {
      linhas.push(
        `▸ ${CATEGORIAS_INSTRUMENTOS[cat].glifo} ${CATEGORIAS_INSTRUMENTOS[cat].label.toUpperCase()}`
      );
      lista.forEach((id) => {
        const inst = INSTRUMENTOS_LABELS[id];
        const desc = descricaoInstrumento(id);
        linhas.push(`   ◇ ${inst.nome} — ${desc}`);
      });
      linhas.push("");
    });
    linhas.push("Status:");
    linhas.push("  ◆ confirmado  ◇ proxy/elegibilidade preliminar  ▲ exige validação");
    linhas.push("");
    linhas.push(
      "Próxima validação: cada instrumento tem órgão competente (SUDENE, SUDAM, BNDES, MME). O Radar não emite parecer."
    );
    linhas.push("");
    linhas.push(CARIMBO);
    return linhas.join("\n");
  }

  // CONFIRMADO vs TRIAGEM
  if ((p.includes("confirmad") && p.includes("triag")) || p.includes("validad")) {
    return [
      "Distinção importante:",
      "",
      "◆ CONFIRMADO — instrumento já contratado/publicado em base oficial (leilão concluído, contrato BNDES assinado).",
      "◇ PROXY / ELEGIBILIDADE PRELIMINAR — município está em zona de elegibilidade (ex.: SUDENE), mas projeto específico precisa enquadrar.",
      "▲ EXIGE VALIDAÇÃO — sinal cruzado mas regra muda por ano/setor (ex.: REIDI exige tipo de obra; debêntures exigem prospecto).",
      "",
      "Nesta v0.1 TUDO está em modo proxy/preliminar. Nenhum instrumento foi confirmado em base oficial.",
      "",
      "Próxima versão conecta:",
      "  • PNCP / Compras.gov.br — busca temporal de editais",
      "  • BNDES Dados Abertos — operações já contratadas",
      "  • ANEEL Leilões — resultados publicados",
      "  • SUDENE/SUDAM — mapa oficial de zonas elegíveis",
      "",
      "O Radar é ferramenta de TRIAGEM — não parecer fiscal nem jurídico.",
      "",
      CARIMBO,
    ].join("\n");
  }

  if (selecionado && (p.includes("por que") || p.includes("recomenda"))) {
    const m = selecionado;
    const b = scores[m.id].breakdown;
    const { forca, gargalo } = principais(b);
    return [
      `${m.apelido || m.municipio}/${m.uf} aparece no ranking porque:`,
      "",
      `Força — ${labelCriterio(forca)}: ${b[forca]}/100`,
      `Gargalo — ${labelCriterio(gargalo)}: ${b[gargalo]}/100`,
      `Convergência pública: ${m.convergenciaPublicaScore}/100`,
      "",
      `Capacidade renovável instalada: ${m.capacidadeRenovavelMw.toLocaleString("pt-BR")} MW`,
      `Pipeline outorgado: ${m.pipelineMw.toLocaleString("pt-BR")} MW`,
      `Margem de rede estimada: ${m.margemRedeMw.toLocaleString("pt-BR")} MW`,
      "",
      m.observacoes,
      "",
      CARIMBO,
    ].join("\n");
  }

  if (selecionado && (p.includes("gargalo") || p.includes("destravar"))) {
    const m = selecionado;
    const b = scores[m.id].breakdown;
    const linhas = [];
    if (b.rede < 60)
      linhas.push(
        `▲ Rede (${b.rede}/100): margem de ${m.margemRedeMw} MW, subestação a ${m.distanciaSubestacaoKm} km. Validar com ONS.`
      );
    if (b.risco < 70)
      linhas.push(
        `▲ Socioambiental (${b.risco}/100): cruzar com Terrabrasilis e Código Florestal antes de licenciar.`
      );
    if (b.demanda < 50)
      linhas.push(`▲ Demanda (${b.demanda}/100): mapear offtake (PPA bilateral ou ACL).`);
    if (modo === "data_centers" && b.datacenter < 60)
      linhas.push(
        `▲ Conectividade (${b.datacenter}/100): fibra a ${m.distanciaFibraKm} km — validar redundância e água.`
      );
    if (m.convergenciaPublicaScore < 70)
      linhas.push(
        `▲ Convergência pública (${m.convergenciaPublicaScore}/100): poucos instrumentos preliminares — escalar prospecção SUDENE/FNE/BNDES.`
      );
    if (linhas.length === 0)
      linhas.push("Indicadores razoavelmente equilibrados — gargalos são marginais.");
    return [
      `Gargalos a destravar em ${m.apelido || m.municipio}/${m.uf}:`,
      "",
      ...linhas,
      "",
      CARIMBO,
    ].join("\n");
  }

  if (p.includes("top 3") || p.includes("compare") || p.includes("comparar")) {
    const top3 = ranking.slice(0, 3);
    return [
      `Top 3 no modo ${MODOS[modo].label}:`,
      ...top3.map(
        (m, i) =>
          `${i + 1}. ${m.apelido || m.municipio}/${m.uf} — score ${scores[m.id].final} · CP ${m.convergenciaPublicaScore} · ${m.instrumentosPublicos.length} instrumentos`
      ),
      "",
      "Convergência pública pesa nas regiões SUDENE (NE), SUDAM (Norte) e FCO (CO).",
      "",
      CARIMBO,
    ].join("\n");
  }

  if (p.includes("mockad") || (p.includes("dados") && p.includes("real"))) {
    return [
      "Tudo o que você vê neste protótipo é mockado:",
      "",
      "• 12 municípios fictícios com lat/lng reais",
      "• capacidadeRenovavelMw / margemRedeMw inspirados em ANEEL SIGA mas não conferidos",
      "• convergenciaPublicaScore e instrumentosPublicos[] são proxies — nenhum vem de base oficial",
      "",
      "Próxima versão substitui por master_df.csv + camada de incentivos:",
      "  • SUDENE/SUDAM: shapefile oficial de zonas elegíveis",
      "  • BNDES Dados Abertos: operações já contratadas",
      "  • PNCP: editais e contratos por palavra-chave",
      "  • ANEEL Leilões: resultados publicados",
      "  • FNE/FNO/FCO: bases pontuais de financiamento regional",
      "",
      CARIMBO,
    ].join("\n");
  }

  if (p.includes("gestor") || (p.includes("explic") && p.includes("público"))) {
    if (!selecionado) {
      return ["Selecione um município primeiro.", "", CARIMBO].join("\n");
    }
    const m = selecionado;
    const b = scores[m.id].breakdown;
    return [
      `Análise contextual:`,
      "",
      `${m.apelido || m.municipio}/${m.uf} pontua ${scores[m.id].final}/100.`,
      `Desenvolvimento regional: ${b.desenvolvimento}/100 — ${b.desenvolvimento > 70 ? "alto, caso de transição justa" : b.desenvolvimento > 50 ? "médio" : "baixo"}.`,
      `Convergência pública: ${m.convergenciaPublicaScore}/100, com ${m.instrumentosPublicos.length} instrumentos preliminares mapeados.`,
      "",
      "Para política de atração industrial, priorize:",
      "  1. Destravar gargalos identificados acima",
      "  2. Cruzar com FNE/FNO/FCO (financiamento regional verde)",
      "  3. Validar zona SUDENE/SUDAM via shapefile oficial",
      "  4. Escalar com BNDES via Linha Verde / Climate Finance",
      "",
      CARIMBO,
    ].join("\n");
  }

  return [
    selecionado
      ? `Você selecionou ${selecionado.apelido || selecionado.municipio}/${selecionado.uf}. Posso explicar incentivos públicos aplicáveis, gargalos, ou comparar com outros municípios.`
      : "Selecione um município no mapa ou no ranking, e eu explico incentivos preliminares e gargalos.",
    "",
    "Sugestões abaixo refletem o estado atual da aplicação.",
    "",
    CARIMBO,
  ].join("\n");
}

/* ───────────────────────────────────────────────────────────── */

export default function Copiloto({ ctx }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const lastSelectedRef = useRef(null);

  // Briefing automático quando muda município selecionado
  useEffect(() => {
    if (ctx.selecionado && ctx.selecionado.id !== lastSelectedRef.current) {
      lastSelectedRef.current = ctx.selecionado.id;
      const briefing = gerarBriefingMunicipio(
        ctx.selecionado,
        ctx.scores[ctx.selecionado.id]
      );
      setHistory((h) => [...h, { role: "bot", text: briefing, kind: "briefing" }]);
    }
  }, [ctx.selecionado]); // eslint-disable-line

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = (text) => {
    const q = (text ?? input).trim();
    if (!q) return;
    const resp = gerarResposta(q, ctx);
    setHistory((h) => [...h, { role: "user", text: q }, { role: "bot", text: resp }]);
    setInput("");
  };

  return (
    <div className="h-full flex flex-col bg-ink-deepest relative overflow-hidden">
      {/* glow accent */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(252,194,10,0.08) 0%, transparent 70%)",
          transform: "translate(40%, -40%)",
        }}
      />

      {/* HEADER compacto */}
      <div className="relative border-b border-hairline-strong px-5 py-4">
        <div className="flex items-center gap-2 text-[10px] tabular tracking-[0.22em] uppercase text-amber font-mono">
          <Sparkles size={11} strokeWidth={2.5} />
          <span>Copiloto PID</span>
          <span className="block h-1 w-1 bg-amber animate-pulse-soft ml-1"></span>
        </div>
        <h3 className="font-display text-xl font-light text-paper mt-1 tracking-tightest leading-[1.15]">
          Agente de incentivos.
        </h3>
      </div>

      {/* CONVERSATION (com sugestões inline quando vazia) */}
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-5 py-4">
        {history.length === 0 ? (
          <div className="h-full flex flex-col">
            <p className="text-[12.5px] text-paper/65 leading-relaxed">
              {ctx.selecionado
                ? `Pergunte sobre incentivos públicos para ${ctx.selecionado.apelido || ctx.selecionado.municipio}.`
                : "Selecione um município no mapa para abrir um briefing. Ou pergunte algo abaixo."}
            </p>
            <div className="mt-5 space-y-1.5">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="block w-full text-left text-[12.5px] text-paper/85 border-l-2 border-hairline-strong hover:border-accent hover:text-accent pl-3 py-1.5 transition-colors leading-snug"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                {msg.role === "user" ? (
                  <div className="bg-amber text-[#03254d] text-sm px-3 py-2 max-w-[88%] font-medium leading-snug">
                    {msg.text}
                  </div>
                ) : (
                  <div
                    className={`border-l-2 pl-3 text-[12.5px] text-paper/85 leading-relaxed whitespace-pre-line max-w-[96%] ${
                      msg.kind === "briefing"
                        ? "border-amber bg-amber/[0.03] py-1"
                        : "border-amber"
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* INPUT */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative border-t border-hairline-strong p-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte ao copiloto…"
          className="flex-1 bg-transparent border border-hairline-strong px-3 py-2 text-sm text-paper placeholder-paper/40 focus:outline-none focus:border-accent font-sans"
        />
        <button
          type="submit"
          className="bg-amber text-[#03254d] px-3 hover:bg-amber-dim transition-colors disabled:opacity-30"
          disabled={!input.trim()}
          aria-label="Enviar"
        >
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}

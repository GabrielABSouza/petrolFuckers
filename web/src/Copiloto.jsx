import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageSquare, X, Sparkles, ArrowUp } from "lucide-react";
import { CRITERIOS, MODOS } from "./data";
import { principais } from "./scoring";

const SUGESTOES = [
  "Por que este município foi recomendado?",
  "Compare os top 3 para data centers de IA",
  "Quais gargalos preciso destravar?",
  "Quais dados ainda são mockados?",
  "Explique o score para um gestor público",
];

// Mock que responde com base no estado atual
function gerarResposta(pergunta, ctx) {
  const { selecionado, ranking, modo, pesos, persona, scores } = ctx;
  const p = pergunta.toLowerCase();
  const carimbo = "↗ resposta gerada a partir do estado atual da aplicação · dados mockados";

  if (p.includes("mockados") || p.includes("dados") && p.includes("real")) {
    return [
      "Tudo o que você vê neste protótipo é mockado:",
      "• 12 municípios fictícios com lat/lng reais",
      "• capacidadeRenovavelMw, pipelineMw e margemRedeMw inspirados em ANEEL SIGA mas não conferidos",
      "• demandaIndustrialScore, riscoSocioambientalScore e prontidaoDataCenterScore são proxies — não vêm de fonte oficial",
      "",
      "Próxima versão substitui isto por master_df.csv real (ver docs/08_ibge_dados.md):",
      "• ANEEL SIGA: 25.407 empreendimentos com coords",
      "• ONS: margem de escoamento por subestação",
      "• IBGE CEMPRE 6449: empregos industriais por CNAE × município",
      "• SAFMaps: flaring siderúrgico, slavery_likely, biomassa",
      "",
      carimbo,
    ].join("\n");
  }

  if (p.includes("compare") || p.includes("top 3") || p.includes("comparar")) {
    const top3 = ranking.slice(0, 3);
    const linhas = top3.map(
      (m, i) =>
        `${i + 1}. ${m.apelido || m.municipio}/${m.uf} — score ${scores[m.id].final} (força: ${labelCriterio(principais(scores[m.id].breakdown).forca)})`
    );
    return [
      `Top 3 no modo ${MODOS[modo].label}:`,
      ...linhas,
      "",
      "Diferenças relevantes:",
      ...top3.map((m) => {
        const b = scores[m.id].breakdown;
        return `• ${m.apelido || m.municipio}: rede ${b.rede} · risco ${b.risco} · DC ${b.datacenter}`;
      }),
      "",
      carimbo,
    ].join("\n");
  }

  if (selecionado) {
    const m = selecionado;
    const b = scores[m.id].breakdown;
    const { forca, gargalo } = principais(b);
    if (p.includes("por que") || p.includes("recomendado")) {
      return [
        `${m.apelido || m.municipio}/${m.uf} aparece no ranking porque:`,
        "",
        `• Força principal — ${labelCriterio(forca)}: ${b[forca]}/100`,
        `• Gargalo principal — ${labelCriterio(gargalo)}: ${b[gargalo]}/100`,
        `• Score final: ${scores[m.id].final}/100 (modo ${MODOS[modo].label})`,
        "",
        `Capacidade renovável instalada: ${m.capacidadeRenovavelMw.toLocaleString("pt-BR")} MW`,
        `Pipeline outorgado: ${m.pipelineMw.toLocaleString("pt-BR")} MW`,
        `Margem de rede estimada: ${m.margemRedeMw.toLocaleString("pt-BR")} MW`,
        "",
        m.observacoes,
        "",
        carimbo,
      ].join("\n");
    }
    if (p.includes("gargalo") || p.includes("destravar")) {
      const linhas = [];
      if (b.rede < 60)
        linhas.push(`• Rede (${b.rede}/100): margem de ${m.margemRedeMw} MW, subestação a ${m.distanciaSubestacaoKm} km. Validar com ONS.`);
      if (b.risco < 70)
        linhas.push(`• Socioambiental (${b.risco}/100): cruzar com Terrabrasilis e Código Florestal antes de licenciar.`);
      if (b.demanda < 50)
        linhas.push(`• Demanda (${b.demanda}/100): mapear offtake — sem comprador, capex demora a destravar.`);
      if (modo === "data_centers" && b.datacenter < 60)
        linhas.push(`• Conectividade (${b.datacenter}/100): fibra a ${m.distanciaFibraKm} km, validar redundância e água.`);
      if (linhas.length === 0)
        linhas.push("Indicadores razoavelmente equilibrados — gargalos são marginais.");
      return [
        `Gargalos a destravar em ${m.apelido || m.municipio}/${m.uf}:`,
        "",
        ...linhas,
        "",
        carimbo,
      ].join("\n");
    }
    if (p.includes("gestor") || p.includes("público")) {
      return [
        `Tradução do score para gestor público (persona atual: ${persona === "orgao_publico" ? "órgão público" : "investidor"}):`,
        "",
        `${m.apelido || m.municipio}/${m.uf} pontua ${scores[m.id].final}/100 como destino prioritário de política industrial.`,
        "",
        `Em termos de impacto regional, o desenvolvimento regional do município é ${b.desenvolvimento}/100 — ${b.desenvolvimento > 70 ? "alto, é um caso de transição justa" : b.desenvolvimento > 50 ? "médio" : "baixo, talvez não seja prioridade social"}.`,
        "",
        "O score combina seis dimensões com os pesos abaixo:",
        ...CRITERIOS.map((c) => `• ${c.label}: ${(pesos[c.id] * 100).toFixed(0)}% — atual ${b[c.id]}/100`),
        "",
        "Se a prioridade é distribuição equitativa de oportunidades, aumente o peso de 'Desenvolvimento regional' e 'Baixo risco socioambiental'.",
        "",
        carimbo,
      ].join("\n");
    }
  }

  // Fallback
  return [
    "Sou um copiloto de explicação — comento o estado atual da análise.",
    "",
    selecionado
      ? `Você selecionou ${selecionado.apelido || selecionado.municipio}/${selecionado.uf}. Posso explicar por que está no ranking, listar gargalos, ou comparar com outros municípios.`
      : "Selecione um município no mapa ou no ranking, e eu explico por que ele aparece como oportunidade.",
    "",
    "Sugestões:",
    ...SUGESTOES.map((s) => `• ${s}`),
    "",
    carimbo,
  ].join("\n");
}

function labelCriterio(id) {
  return CRITERIOS.find((c) => c.id === id)?.label.toLowerCase() || id;
}

export default function Copiloto({ open, setOpen, ctx }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, open]);

  const handleSend = (text) => {
    const q = (text ?? input).trim();
    if (!q) return;
    const resp = gerarResposta(q, ctx);
    setHistory((h) => [
      ...h,
      { role: "user", text: q },
      { role: "bot", text: resp },
    ]);
    setInput("");
  };

  return (
    <>
      {/* Toggle FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-40 bg-amber text-ink-deepest font-mono text-[11px] tracking-[0.18em] uppercase px-4 py-3 flex items-center gap-2 hover:bg-amber-dim transition-colors border border-ink-deepest"
        style={{ boxShadow: "0 0 0 1px var(--amber), 0 8px 24px rgba(252, 194, 10, 0.25)" }}
      >
        {open ? <X size={14} strokeWidth={2.5} /> : <Sparkles size={14} strokeWidth={2.5} />}
        Copiloto PID
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: 480, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 480, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 w-[440px] bg-ink-deepest border-l border-hairline-strong z-30 flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-hairline-strong p-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] tabular tracking-[0.2em] uppercase text-amber font-mono">
                  <span className="block h-1.5 w-1.5 bg-amber"></span>
                  Copiloto PID
                </div>
                <h3 className="font-display text-2xl font-light text-paper mt-1 tracking-tightest">
                  Explica a análise.
                </h3>
                <p className="text-xs text-paper/55 mt-1">
                  Mock funcional. Não chama API externa. Lê o estado da aplicação.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-paper/50 hover:text-amber p-1 -mr-1"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conversation */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {history.length === 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-paper/55 leading-relaxed">
                    Pergunte sobre o município selecionado, o ranking atual, ou peça para explicar
                    o método. As sugestões abaixo refletem o estado atual da aplicação.
                  </p>
                  <div className="hatch p-3 border border-amber/30">
                    <p className="text-[10px] tabular tracking-[0.18em] uppercase text-amber font-mono">
                      AVISO · Dados mockados
                    </p>
                    <p className="text-xs text-paper/70 mt-1.5 leading-relaxed">
                      Este copiloto não está conectado a IA real nem a dados oficiais. Responde com
                      base nos mocks. Tratá-lo como ferramenta de comunicação da análise, não fonte.
                    </p>
                  </div>
                </div>
              )}

              {history.map((msg, i) => (
                <div
                  key={i}
                  className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      msg.role === "user"
                        ? "bg-amber text-ink-deepest text-sm px-3 py-2 max-w-[85%] font-medium"
                        : "border-l-2 border-amber pl-3 text-sm text-paper/85 leading-relaxed whitespace-pre-line max-w-[95%]"
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Sugestões */}
            <div className="border-t border-hairline-strong p-3 space-y-2">
              <div className="text-[10px] tabular tracking-[0.18em] uppercase text-paper/45 font-mono">
                Sugestões
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGESTOES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-[11px] text-paper/75 border border-hairline-strong hover:border-amber hover:text-amber px-2.5 py-1 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="border-t border-hairline-strong p-3 flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte ao copiloto…"
                className="flex-1 bg-transparent border border-hairline-strong px-3 py-2 text-sm text-paper placeholder-paper/40 focus:outline-none focus:border-amber font-sans"
              />
              <button
                type="submit"
                className="bg-amber text-ink-deepest px-3 hover:bg-amber-dim transition-colors disabled:opacity-30"
                disabled={!input.trim()}
                aria-label="Enviar"
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

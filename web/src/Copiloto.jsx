import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowUp, Sparkles } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const SUGESTOES = [
  "Quais incentivos públicos podem se aplicar?",
  "Isso é elegibilidade confirmada ou triagem?",
  "Por que este município foi recomendado?",
  "Compare os top 3 para data centers de IA",
  "Quais gargalos preciso destravar?",
  "Quais dados ainda são mockados?",
];

export default function Copiloto({ ctx }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const lastSelectedRef = useRef(null);

  useEffect(() => {
    if (ctx.selecionado && ctx.selecionado.id !== lastSelectedRef.current) {
      lastSelectedRef.current = ctx.selecionado.id;
      const m = ctx.selecionado;
      const briefing = `Município selecionado: ${m.apelido || m.municipio}/${m.uf}. Pergunte algo sobre incentivos, gargalos ou comparações.`;
      setHistory((h) => [...h, { role: "bot", text: briefing, kind: "briefing" }]);
    }
  }, [ctx.selecionado]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  async function callAgent(pergunta) {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agente/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: pergunta,
          context: {
            municipio_selecionado: ctx?.selecionado?.municipio || null,
            modo: ctx?.modo || null,
          },
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${res.status}: ${text}`);
      }
      const data = await res.json();
      return data.message || "(resposta vazia)";
    } catch (e) {
      console.error("[copiloto] agent error", e);
      return `Erro ao consultar o agente: ${e.message}`;
    } finally {
      setIsLoading(false);
    }
  }

  const handleSend = async (text) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setHistory((h) => [...h, { role: "user", text: q }]);
    setInput("");
    const resp = await callAgent(q);
    setHistory((h) => [...h, { role: "bot", text: resp }]);
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
            {isLoading && (
              <div className="flex justify-start">
                <div className="text-[12.5px] text-paper/55 italic">
                  Consultando agente…
                </div>
              </div>
            )}
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

import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
  interpolate,
  useCurrentFrame,
} from "remotion";
import coords from "./coords.json";

/**
 * Radar PID — vídeo demo de 20s (600 frames @ 30fps)
 *
 * Cenas 1-6: screenshots progressivos com crossfade. Cenas 5 e 6
 * encurtadas pra dar mais tempo à cena 7. Cena 7: typewriter da
 * resposta REAL do agente centralizada na tela.
 */

const FONT_DISPLAY = '"Fraunces", "Georgia", serif';
const FONT_MONO = '"JetBrains Mono", "Menlo", monospace';
const FONT_SANS = '"Geist", "Inter", system-ui, sans-serif';

const FADE_FRAMES = 12;

type Scene = {
  src: string;
  start: number;
  duration: number;
  step?: number;
  caption: string;
  subtitle?: string;
  triggerTarget: { x: number; y: number };
};

// Timings: 1=40, 2=40, 3=50, 4=90, 5=30, 6=80, 7=270 → total 600
// (+30f em Araporã e Janaúba pra leitura dos scores;
//  typewriter da cena 7 acelerado pra compensar)
const SCENES: Scene[] = [
  {
    src: "01-vazio.png",
    start: 0,
    duration: 40,
    caption: "Triagem de oportunidades em transição energética",
    subtitle: "1.938 municípios · 5 fontes de energia limpa",
    triggerTarget: coords.vazio,
  },
  {
    src: "02-h2v.png",
    start: 40,
    duration: 40,
    step: 1,
    caption: "Filtre a fonte de energia",
    subtitle: "H2 Verde",
    triggerTarget: coords.h2v,
  },
  {
    src: "03-mg.png",
    start: 80,
    duration: 50,
    step: 2,
    caption: "Recorte por estado",
    subtitle: "Minas Gerais",
    triggerTarget: coords.recorte,
  },
  {
    src: "04-arapora.png",
    start: 130,
    duration: 90,
    step: 3,
    caption: "Araporã/MG · score 48",
    subtitle: "Breakdown por bloco econômico, social e ambiental",
    triggerTarget: coords.arapora,
  },
  {
    src: "05-compare.png",
    start: 220,
    duration: 30,
    step: 4,
    caption: "Acione a comparação",
    subtitle: "Modo X vs Y",
    triggerTarget: coords.compare,
  },
  {
    src: "06-janauba.png",
    start: 250,
    duration: 80,
    step: 5,
    caption: "Compare com outro município",
    subtitle: "Janaúba/MG · score 47",
    triggerTarget: coords.janauba,
  },
  {
    src: "07-agente.png", // só usado como ponto de partida do crossfade
    start: 330,
    duration: 270,
    step: 6,
    caption: "Pergunte ao Copiloto",
    subtitle: "Resposta gerada em tempo real",
    triggerTarget: coords.chat,
  },
];

const AGENT_SCENE_START = SCENES[6].start;

// Resposta REAL da IA (texto exato fornecido pelo user)
const AGENT_RESPONSE = `Para o município de Araporã (MG) e o estado de Minas Gerais, as políticas públicas e incentivos em maio de 2026 focam na consolidação da liderança em geração distribuída e na expansão do biometano.

1. Contexto de Araporã (MG)
Araporã apresenta um eco_score de 1,0 para Biometano, indicando viabilidade econômica máxima para essa fonte, além de um score de 0,53 para Solar. Note que, por estar no Triângulo Mineiro, o município não é elegível aos incentivos da SUDENE (restritos ao Norte de MG e Vales do Jequitinhonha/Mucuri).

2. Incentivos Estaduais (Minas Gerais)
• ICMS (Energia Solar): Minas mantém a isenção de ICMS para micro e minigeração distribuída (até 5 MW), baseada no Convênio ICMS 16/15.
• Plano Mineiro de Biogás e Biometano: Programa estadual que facilita o licenciamento ambiental para plantas que aproveitam resíduos agroindustriais.
• BDMG Sustentabilidade: Linhas de crédito do Banco de Desenvolvimento de Minas Gerais para projetos renováveis com taxas subsidiadas.

3. Instrumentos Federais (Vigentes em 2026)
• REIDI: Suspensão de PIS/COFINS (~9,25%) para aquisição de bens e serviços destinados a obras de infraestrutura de energia.
• BNDES Fundo Clima: Principal linha federal para transição energética, com taxas competitivas para projetos de descarbonização industrial.
• LCD (Letra de Crédito do Desenvolvimento): Instrumento consolidado em 2025/2026 para financiar a neoindustrialização e powershoring.

Recomendação: Priorizar o estudo de viabilidade para Biometano, dado o score econômico máximo (1,0) e a disponibilidade de biomassa na região, utilizando o REIDI para desonerar o CAPEX inicial.`;

export const DemoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#020f1f", overflow: "hidden" }}>
      {/* Cenas 1-6: screenshots */}
      {SCENES.slice(0, 6).map((scene, i) => (
        <ScreenshotLayer key={scene.src} scene={scene} index={i} />
      ))}

      {/* Cena 7: typewriter da resposta da IA */}
      <Sequence from={AGENT_SCENE_START} durationInFrames={270}>
        <SceneAgent />
      </Sequence>

      {/* Captions só pras cenas 1-6 (cena 7 tem layout próprio) */}
      {SCENES.slice(0, 6).map((scene, i) => (
        <Sequence
          key={`cap-${scene.src}`}
          from={scene.start}
          durationInFrames={scene.duration}
        >
          <Caption
            step={scene.step}
            title={scene.caption}
            subtitle={scene.subtitle}
            isOpening={i === 0}
          />
        </Sequence>
      ))}

      <Cursor />
      <ClickPulse />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────
// Screenshot com crossfade (cenas 1-6)
// ─────────────────────────────────────────────
const ScreenshotLayer: React.FC<{ scene: Scene; index: number }> = ({
  scene,
  index,
}) => {
  const frame = useCurrentFrame();
  const opacity =
    index === 0
      ? 1
      : interpolate(
          frame,
          [scene.start, scene.start + FADE_FRAMES],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={staticFile(scene.src)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────
// Caption (lower-third) — só cenas 1-6
// ─────────────────────────────────────────────
const Caption: React.FC<{
  step?: number;
  title: string;
  subtitle?: string;
  isOpening: boolean;
}> = ({ step, title, subtitle, isOpening }) => {
  const frame = useCurrentFrame();
  // Caption respeita a duration da Sequence; fade in/out simétricos
  const opacity = interpolate(frame, [0, 8, 28, 38], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ty = interpolate(frame, [0, 12], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: isOpening ? 120 : 90,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${ty}px)`,
          textAlign: "center",
          padding: "26px 56px",
          maxWidth: 1500,
          background: "rgba(2,15,31,0.82)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(252,194,10,0.35)",
          borderRadius: 4,
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        }}
      >
        {step !== undefined && (
          <div
            style={{
              color: "#fcc20a",
              fontFamily: FONT_MONO,
              fontSize: 14,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            {`Etapa 0${step}`}
          </div>
        )}
        <div
          style={{
            color: "#f4f1ea",
            fontFamily: FONT_DISPLAY,
            fontSize: isOpening ? 50 : 42,
            fontWeight: 300,
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              color: "#f4f1ea",
              fontFamily: FONT_SANS,
              fontSize: 20,
              opacity: 0.78,
              marginTop: 8,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────
// Cena 7 — typewriter da resposta da IA
// ─────────────────────────────────────────────
const SceneAgent: React.FC = () => {
  const frame = useCurrentFrame(); // 0 a 329 (relativo à Sequence)

  // Background dimmed: começa do screenshot final (06-janauba) que serve
  // de contexto, mas com scrim escuro pra texto ficar protagonista.
  const bgOpacity = interpolate(frame, [0, 20], [0, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cardEnter = interpolate(frame, [0, 18], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Typewriter: começa no frame 15, completa em ~185 frames (~6,2s)
  // Mais rápido que antes — deixa ~85 frames (~2,8s) de pausa pra leitura
  const TYPE_START = 15;
  const TYPE_END = 200;
  const totalChars = AGENT_RESPONSE.length;
  const charCount = Math.floor(
    interpolate(frame, [TYPE_START, TYPE_END], [0, totalChars], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const visibleText = AGENT_RESPONSE.slice(0, charCount);
  const isTyping = charCount < totalChars && frame >= TYPE_START;

  // Cursor blinker
  const cursorVisible = Math.floor(frame / 8) % 2 === 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#020f1f" }}>
      {/* Screenshot dimmed atrás */}
      <AbsoluteFill style={{ opacity: bgOpacity }}>
        <Img
          src={staticFile("06-janauba.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(2,15,31,0.7)" }} />

      {/* Card centralizado com texto */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
        }}
      >
        <div
          style={{
            opacity: cardOpacity,
            transform: `translateY(${cardEnter}px)`,
            width: 1500,
            maxHeight: 980,
            padding: "44px 64px",
            background: "rgba(3,26,51,0.95)",
            border: "1px solid rgba(252,194,10,0.45)",
            borderRadius: 6,
            boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 22,
              paddingBottom: 16,
              borderBottom: "1px solid rgba(252,194,10,0.3)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#fcc20a",
                boxShadow: "0 0 12px #fcc20a",
              }}
            />
            <span
              style={{
                color: "#fcc20a",
                fontFamily: FONT_MONO,
                fontSize: 14,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                flex: 1,
              }}
            >
              Copiloto · respondendo
            </span>
            <span
              style={{
                color: "#f4f1ea",
                opacity: 0.5,
                fontFamily: FONT_MONO,
                fontSize: 12,
              }}
            >
              gemini-3-flash-preview
            </span>
          </div>

          {/* Pergunta */}
          <div
            style={{
              color: "#fcc20a",
              fontFamily: FONT_SANS,
              fontSize: 18,
              fontWeight: 500,
              marginBottom: 18,
              opacity: 0.85,
            }}
          >
            ▸ quais as politicas publicas disponiveis para minas gerais?
          </div>

          {/* Resposta sendo digitada */}
          <div
            style={{
              color: "#f4f1ea",
              fontFamily: FONT_SANS,
              fontSize: 20,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              flex: 1,
              overflow: "hidden",
            }}
          >
            {visibleText}
            {isTyping && (
              <span
                style={{
                  display: "inline-block",
                  width: 9,
                  height: 22,
                  background: "#fcc20a",
                  marginLeft: 3,
                  verticalAlign: "middle",
                  opacity: cursorVisible ? 1 : 0,
                }}
              />
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────
// Cursor sincronizado
// ─────────────────────────────────────────────
const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  // Some quando a cena 7 começa (typewriter assume o palco)
  if (frame >= AGENT_SCENE_START) return null;

  const keyframes = SCENES.slice(0, 6).map((s) => ({
    frame: s.start,
    x: s.triggerTarget.x,
    y: s.triggerTarget.y,
  }));
  // Last frame antes do agent: chat input
  keyframes.push({
    frame: AGENT_SCENE_START,
    x: SCENES[6].triggerTarget.x,
    y: SCENES[6].triggerTarget.y,
  });

  const x = interpolate(frame, keyframes.map((k) => k.frame), keyframes.map((k) => k.x));
  const y = interpolate(frame, keyframes.map((k) => k.frame), keyframes.map((k) => k.y));

  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-2px, -2px)",
        pointerEvents: "none",
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.7))",
      }}
    >
      <path
        d="M5 3 L19 12 L12 13 L9 20 Z"
        fill="#f4f1ea"
        stroke="#020f1f"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ─────────────────────────────────────────────
// Click pulse
// ─────────────────────────────────────────────
const ClickPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const activeScene = SCENES.slice(0, 6).find(
    (s, i) => i > 0 && frame >= s.start && frame < s.start + 14
  );
  if (!activeScene) return null;

  const t = frame - activeScene.start;
  const scale = interpolate(t, [0, 14], [0.4, 2.4]);
  const opacity = interpolate(t, [0, 14], [0.85, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: `${activeScene.triggerTarget.x}%`,
        top: `${activeScene.triggerTarget.y}%`,
        width: 64,
        height: 64,
        marginLeft: -32,
        marginTop: -32,
        borderRadius: "50%",
        border: "3px solid #fcc20a",
        transform: `scale(${scale})`,
        opacity,
        pointerEvents: "none",
        boxShadow: "0 0 24px rgba(252,194,10,0.8)",
      }}
    />
  );
};

import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
  interpolate,
  useCurrentFrame,
} from "remotion";

/**
 * Radar PID — vídeo demo de 20s (600 frames @ 30fps)
 *
 * Carrega 7 screenshots progressivos do app e faz crossfade entre eles.
 * Sobre cada cena: caption centralizada (lower-third) + cursor que anima
 * pra próximo target + (opcional) pulse no elemento que acabou de mudar.
 *
 * Os 7 screenshots devem estar em video/public/:
 *   01-vazio.png      → app aberto sem filtros, sem cidade selecionada
 *   02-h2v.png        → H2 Verde selecionado
 *   03-mg.png         → MG selecionado no Recorte
 *   04-arapora.png    → Araporã clicado, sidebar com detalhes
 *   05-compare.png    → modo comparação ativo (só Araporã)
 *   06-janauba.png    → Janaúba também selecionado
 *   07-agente.png     → agente respondeu sobre políticas públicas
 */

const FONT_DISPLAY = '"Fraunces", "Georgia", serif';
const FONT_MONO = '"JetBrains Mono", "Menlo", monospace';
const FONT_SANS = '"Geist", "Inter", system-ui, sans-serif';

const FADE_FRAMES = 15;

type Scene = {
  src: string;
  start: number;
  duration: number;
  step?: number;
  caption: string;
  subtitle?: string;
  // posição (em % do canvas) que o cursor mira durante essa cena
  cursorTarget: { x: number; y: number };
};

const SCENES: Scene[] = [
  {
    src: "01-vazio.png",
    start: 0,
    duration: 60,
    caption: "Triagem de oportunidades em transição energética",
    subtitle: "1.938 municípios · 5 fontes de energia limpa",
    cursorTarget: { x: 50, y: 50 },
  },
  {
    src: "02-h2v.png",
    start: 60,
    duration: 60,
    step: 1,
    caption: "Filtre a fonte de energia",
    subtitle: "H2 Verde",
    cursorTarget: { x: 18, y: 28 },
  },
  {
    src: "03-mg.png",
    start: 120,
    duration: 60,
    step: 2,
    caption: "Recorte por estado",
    subtitle: "Minas Gerais",
    cursorTarget: { x: 13, y: 39 },
  },
  {
    src: "04-arapora.png",
    start: 180,
    duration: 90,
    step: 3,
    caption: "Araporã/MG · score 48",
    subtitle: "Breakdown por bloco econômico, social e ambiental",
    cursorTarget: { x: 38, y: 53 },
  },
  {
    src: "05-compare.png",
    start: 270,
    duration: 60,
    step: 4,
    caption: "Acione a comparação",
    subtitle: "Modo X vs Y",
    cursorTarget: { x: 12, y: 56 },
  },
  {
    src: "06-janauba.png",
    start: 330,
    duration: 60,
    step: 5,
    caption: "Compare com outro município",
    subtitle: "Janaúba/MG · score 47 — diferença está nos blocos",
    cursorTarget: { x: 55, y: 36 },
  },
  {
    src: "07-agente.png",
    start: 390,
    duration: 210,
    step: 6,
    caption: "Pergunte ao Copiloto",
    subtitle: "Instrumentos públicos para MG vigentes em maio/2026",
    cursorTarget: { x: 88, y: 95 },
  },
];

export const DemoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#020f1f", overflow: "hidden" }}>
      {/* Stack de screenshots — cada um faz fade-in cobrindo o anterior */}
      {SCENES.map((scene, i) => (
        <ScreenshotLayer key={scene.src} scene={scene} index={i} />
      ))}

      {/* Captions — montadas como Sequences pra cada cena */}
      {SCENES.map((scene, i) => (
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

      {/* Cursor anima entre os targets */}
      <Cursor />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────
// Screenshot com crossfade
// ─────────────────────────────────────────────
const ScreenshotLayer: React.FC<{ scene: Scene; index: number }> = ({ scene, index }) => {
  const frame = useCurrentFrame();
  // Fade-in cobrindo a cena anterior. A última cena nunca dá fade-out.
  const opacity =
    index === 0
      ? 1 // primeira: visível desde o frame 0
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
// Caption centralizada (lower-third)
// ─────────────────────────────────────────────
const Caption: React.FC<{
  step?: number;
  title: string;
  subtitle?: string;
  isOpening: boolean;
}> = ({ step, title, subtitle, isOpening }) => {
  const frame = useCurrentFrame();
  // Fade-in 0–10, full 10–46, fade-out 46–60 — relativo ao Sequence.from
  const opacity = interpolate(frame, [0, 10, 46, 60], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ty = interpolate(frame, [0, 14], [10, 0], {
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
              fontSize: 16,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            {`Etapa 0${step}`}
          </div>
        )}
        <div
          style={{
            color: "#f4f1ea",
            fontFamily: FONT_DISPLAY,
            fontSize: isOpening ? 56 : 48,
            fontWeight: 300,
            lineHeight: 1.1,
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
              fontSize: 22,
              opacity: 0.78,
              marginTop: 10,
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
// Cursor animado
// ─────────────────────────────────────────────
const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  // Cada cena define um target. Cursor interpola linearmente entre eles
  // chegando ao target no MEIO da cena (efeito "movendo até clicar").
  const keyframes: { frame: number; x: number; y: number }[] = SCENES.map(
    (s) => ({
      frame: s.start + Math.floor(s.duration * 0.5),
      x: s.cursorTarget.x,
      y: s.cursorTarget.y,
    })
  );
  // Garante que o cursor inicie no frame 0 com a posição da primeira cena
  const allFrames = [0, ...keyframes.map((k) => k.frame), 600];
  const xs = [keyframes[0].x, ...keyframes.map((k) => k.x), keyframes[keyframes.length - 1].x];
  const ys = [keyframes[0].y, ...keyframes.map((k) => k.y), keyframes[keyframes.length - 1].y];

  const x = interpolate(frame, allFrames, xs);
  const y = interpolate(frame, allFrames, ys);

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

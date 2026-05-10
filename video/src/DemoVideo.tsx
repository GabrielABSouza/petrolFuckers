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
 * 7 screenshots progressivos com crossfade. Cursor anima sincronizado
 * com a ação: chega ao target ANTES da troca de cena (efeito "vou clicar"),
 * pulse de click sincronizado com o fade-in do próximo screenshot.
 *
 * Cena 7 inclui overlay com os pontos-chave da resposta do agente (com
 * texto real da IA sobre instrumentos públicos vigentes em MG).
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
  // Posição do cursor (% canvas) que produziu a TRANSIÇÃO pra essa cena.
  // Exemplo: cena "h2v" usa { x: 18, y: 28 } = posição do botão H2V que foi clicado.
  triggerTarget: { x: number; y: number };
};

const SCENES: Scene[] = [
  {
    src: "01-vazio.png",
    start: 0,
    duration: 60,
    caption: "Triagem de oportunidades em transição energética",
    subtitle: "1.938 municípios · 5 fontes de energia limpa",
    triggerTarget: { x: 50, y: 50 },
  },
  {
    src: "02-h2v.png",
    start: 60,
    duration: 60,
    step: 1,
    caption: "Filtre a fonte de energia",
    subtitle: "H2 Verde",
    triggerTarget: { x: 18, y: 28 },
  },
  {
    src: "03-mg.png",
    start: 120,
    duration: 60,
    step: 2,
    caption: "Recorte por estado",
    subtitle: "Minas Gerais",
    triggerTarget: { x: 13, y: 39 },
  },
  {
    src: "04-arapora.png",
    start: 180,
    duration: 90,
    step: 3,
    caption: "Araporã/MG · score 48",
    subtitle: "Breakdown por bloco econômico, social e ambiental",
    triggerTarget: { x: 38, y: 53 },
  },
  {
    src: "05-compare.png",
    start: 270,
    duration: 60,
    step: 4,
    caption: "Acione a comparação",
    subtitle: "Modo X vs Y",
    triggerTarget: { x: 12, y: 56 },
  },
  {
    src: "06-janauba.png",
    start: 330,
    duration: 60,
    step: 5,
    caption: "Compare com outro município",
    subtitle: "Janaúba/MG · score 47 — diferença está nos blocos",
    triggerTarget: { x: 55, y: 36 },
  },
  {
    src: "07-agente.png",
    start: 390,
    duration: 210,
    step: 6,
    caption: "Pergunte ao Copiloto",
    subtitle: "Instrumentos públicos para MG vigentes em maio/2026",
    triggerTarget: { x: 88, y: 95 },
  },
];

// Pontos-chave da resposta REAL da IA (ver chat com o user — políticas para MG)
const AGENT_BULLETS: string[] = [
  "Plano Mineiro de Biogás e Biometano — vigente",
  "BDMG Sustentabilidade — taxas subsidiadas",
  "ICMS Solar — Convênio 16/15 (micro/minigeração)",
  "REIDI — suspensão PIS/COFINS p/ infra de energia",
  "BNDES Fundo Clima · LCD (Letra de Crédito do Desenvolvimento)",
];

const AGENT_RECOMMENDATION =
  "Recomendação: priorizar estudo de viabilidade para Biometano (eco_score 1,0) usando REIDI para desonerar CAPEX.";

export const DemoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#020f1f", overflow: "hidden" }}>
      {SCENES.map((scene, i) => (
        <ScreenshotLayer key={scene.src} scene={scene} index={i} />
      ))}

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
            isAgentScene={i === SCENES.length - 1}
          />
        </Sequence>
      ))}

      {/* Overlay especial da cena 7 — bullets da resposta da IA */}
      <Sequence from={SCENES[6].start} durationInFrames={SCENES[6].duration}>
        <AgentResponseOverlay />
      </Sequence>

      <Cursor />
      <ClickPulse />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────
// Screenshot com crossfade
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
// Caption centralizada (lower-third)
// ─────────────────────────────────────────────
const Caption: React.FC<{
  step?: number;
  title: string;
  subtitle?: string;
  isOpening: boolean;
  isAgentScene: boolean;
}> = ({ step, title, subtitle, isOpening, isAgentScene }) => {
  const frame = useCurrentFrame();
  // Caption da cena agente fica visível só no começo (50 frames) pra não tampar bullets
  const fadeOutEnd = isAgentScene ? 50 : 60;
  const opacity = interpolate(
    frame,
    [0, 10, fadeOutEnd - 14, fadeOutEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
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
// Overlay da resposta da IA (cena 7)
// ─────────────────────────────────────────────
const AgentResponseOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  // Bullets aparecem em cascata começando no frame 60 (depois da caption fade-out)
  // Dura até frame 210 (fim da cena), com fade final
  const containerOpacity = interpolate(frame, [55, 75, 200, 210], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity: containerOpacity,
          maxWidth: 1180,
          width: "70%",
          padding: "32px 44px",
          background: "rgba(2,15,31,0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(252,194,10,0.45)",
          borderRadius: 6,
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            color: "#fcc20a",
            fontFamily: FONT_MONO,
            fontSize: 14,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            marginBottom: 18,
            textAlign: "center",
          }}
        >
          Resposta do Copiloto · maio/2026
        </div>

        {AGENT_BULLETS.map((bullet, i) => {
          const startFrame = 70 + i * 16;
          const opacity = interpolate(
            frame,
            [startFrame, startFrame + 14],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const tx = interpolate(frame, [startFrame, startFrame + 14], [-12, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateX(${tx}px)`,
                marginBottom: 14,
                paddingLeft: 22,
                borderLeft: "3px solid #fcc20a",
                color: "#f4f1ea",
                fontFamily: FONT_SANS,
                fontSize: 22,
                lineHeight: 1.4,
              }}
            >
              {bullet}
            </div>
          );
        })}

        {/* Recomendação final */}
        <div
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: "1px solid rgba(252,194,10,0.35)",
            opacity: interpolate(frame, [165, 185], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            fontFamily: FONT_DISPLAY,
            fontStyle: "italic",
            fontSize: 22,
            color: "#fcc20a",
            textAlign: "center",
            lineHeight: 1.35,
          }}
        >
          {AGENT_RECOMMENDATION}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────
// Cursor sincronizado com cada ação
// ─────────────────────────────────────────────
//
// Lógica de timing:
// - Pra cena N, o cursor PRECISA estar em scene[N].triggerTarget no momento
//   exato em que o screenshot N aparece (frame scene[N].start).
// - Movimento entre targets ocorre durante o FINAL da cena anterior — cursor
//   chega ao próximo target uns 5 frames antes do fade-in começar.
const Cursor: React.FC = () => {
  const frame = useCurrentFrame();

  // Keyframes: cursor está em SCENES[i].triggerTarget no frame SCENES[i].start
  // Antes disso, está movendo do target anterior pro target atual.
  const keyframes = SCENES.map((scene) => ({
    frame: scene.start,
    x: scene.triggerTarget.x,
    y: scene.triggerTarget.y,
  }));
  // Mantém posição final até o fim
  keyframes.push({
    frame: 600,
    x: SCENES[SCENES.length - 1].triggerTarget.x,
    y: SCENES[SCENES.length - 1].triggerTarget.y,
  });

  const x = interpolate(
    frame,
    keyframes.map((k) => k.frame),
    keyframes.map((k) => k.x)
  );
  const y = interpolate(
    frame,
    keyframes.map((k) => k.frame),
    keyframes.map((k) => k.y)
  );

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
// Pulse de click — anel se expande no momento da troca de cena
// ─────────────────────────────────────────────
const ClickPulse: React.FC = () => {
  const frame = useCurrentFrame();
  // Pulse ativo nos primeiros 18 frames de cada cena (exceto a 1ª).
  // Encontra a cena ativa e calcula tempo desde o início dela.
  const activeScene = SCENES.find(
    (s, i) => i > 0 && frame >= s.start && frame < s.start + 18
  );
  if (!activeScene) return null;

  const t = frame - activeScene.start;
  const scale = interpolate(t, [0, 18], [0.4, 2.4]);
  const opacity = interpolate(t, [0, 18], [0.85, 0]);

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

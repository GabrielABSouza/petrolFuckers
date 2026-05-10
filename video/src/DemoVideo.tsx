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
 * 7 screenshots progressivos com crossfade. Cursor usa coords REAIS medidas
 * em runtime pelo Playwright (video/scripts/capture.mjs → coords.json).
 *
 * Cena 7 (resposta do agente) faz "pan-and-scan" — zoom no painel do
 * Copiloto pra resposta ficar legível, sem overlay competindo. O texto
 * real da IA fica visível no próprio screenshot, ampliado.
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
  // Posição do cursor (% canvas) que produziu a transição PRA essa cena.
  triggerTarget: { x: number; y: number };
};

// Coords vindas do Playwright (capture.mjs)
const SCENES: Scene[] = [
  {
    src: "01-vazio.png",
    start: 0,
    duration: 60,
    caption: "Triagem de oportunidades em transição energética",
    subtitle: "1.938 municípios · 5 fontes de energia limpa",
    triggerTarget: coords.vazio,
  },
  {
    src: "02-h2v.png",
    start: 60,
    duration: 60,
    step: 1,
    caption: "Filtre a fonte de energia",
    subtitle: "H2 Verde",
    triggerTarget: coords.h2v,
  },
  {
    src: "03-mg.png",
    start: 120,
    duration: 60,
    step: 2,
    caption: "Recorte por estado",
    subtitle: "Minas Gerais",
    triggerTarget: coords.recorte,
  },
  {
    src: "04-arapora.png",
    start: 180,
    duration: 90,
    step: 3,
    caption: "Araporã/MG · score 48",
    subtitle: "Breakdown por bloco econômico, social e ambiental",
    triggerTarget: coords.arapora,
  },
  {
    src: "05-compare.png",
    start: 270,
    duration: 60,
    step: 4,
    caption: "Acione a comparação",
    subtitle: "Modo X vs Y",
    triggerTarget: coords.compare,
  },
  {
    src: "06-janauba.png",
    start: 330,
    duration: 60,
    step: 5,
    caption: "Compare com outro município",
    subtitle: "Janaúba/MG · score 47 — diferença está nos blocos",
    triggerTarget: coords.janauba,
  },
  {
    src: "07-agente.png",
    start: 390,
    duration: 210,
    step: 6,
    caption: "Pergunte ao Copiloto",
    subtitle: "Resposta sobre incentivos públicos em MG",
    triggerTarget: coords.chat,
  },
];

// Painel do copiloto (alvo do zoom na cena 7)
const PANEL = coords.copilotoPanel;

// Quando começa o zoom (em frames relativos ao início da cena 7)
const ZOOM_START = 30;
const ZOOM_END = 75;

export const DemoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#020f1f", overflow: "hidden" }}>
      {/* Layer das cenas 1-6 (sem zoom) */}
      {SCENES.slice(0, 6).map((scene, i) => (
        <ScreenshotLayer key={scene.src} scene={scene} index={i} />
      ))}

      {/* Cena 7 com zoom */}
      <ScreenshotLayerWithZoom scene={SCENES[6]} index={6} />

      {/* Captions */}
      {SCENES.map((scene, i) => (
        <Sequence
          key={`cap-${scene.src}`}
          from={scene.start}
          durationInFrames={i === 6 ? 30 : scene.duration}
        >
          <Caption
            step={scene.step}
            title={scene.caption}
            subtitle={scene.subtitle}
            isOpening={i === 0}
            isAgentScene={i === 6}
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
// Screenshot da cena 7 com pan-and-scan no painel do agente
// ─────────────────────────────────────────────
const ScreenshotLayerWithZoom: React.FC<{ scene: Scene; index: number }> = ({
  scene,
}) => {
  const frame = useCurrentFrame();

  // Opacity: fade-in cobrindo cena 6
  const opacity = interpolate(
    frame,
    [scene.start, scene.start + FADE_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Zoom progress: 0 antes de ZOOM_START, 1 depois de ZOOM_END
  const relFrame = frame - scene.start;
  const zoom = interpolate(relFrame, [ZOOM_START, ZOOM_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Centro do painel no screenshot (em %)
  const panelCenterX = PANEL.x + PANEL.w / 2; // ~89.6
  const panelCenterY = PANEL.y + PANEL.h / 2; // ~54.1

  // Escala alvo: enquadra o painel preenchendo ~85% da tela.
  // Painel é ~21% da largura, queremos ~85%: scale = 85/21 = ~4.0
  // Painel é ~92% da altura, queremos ~95%: scale_y = 95/92 = ~1.0
  // Usamos a menor (limita pela largura) — scale 4.0
  const SCALE_TARGET = 3.8;

  const scale = interpolate(zoom, [0, 1], [1, SCALE_TARGET]);
  // Translate pra trazer o panel center pro canvas center
  // Com origin (50%, 50%), scale: panel center vai pra (50 + (panelCenterX-50)*scale, ...)
  // Translate compensatório (em % do canvas width):
  const tx = interpolate(zoom, [0, 1], [0, 50 - panelCenterX * SCALE_TARGET + 50 * SCALE_TARGET]);
  // Simplificado: tx = -(panelCenterX - 50) * scale, mas só ativa com zoom
  const txReal = interpolate(zoom, [0, 1], [0, (50 - panelCenterX) * SCALE_TARGET]);
  const tyReal = interpolate(zoom, [0, 1], [0, (50 - panelCenterY) * SCALE_TARGET]);

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill
        style={{
          transform: `translate(${txReal}%, ${tyReal}%) scale(${scale})`,
          transformOrigin: "50% 50%",
        }}
      >
        <Img
          src={staticFile(scene.src)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
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
}> = ({ step, title, subtitle, isOpening }) => {
  const frame = useCurrentFrame();
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
// Cursor — sincronizado com o frame em que cada cena entra
// ─────────────────────────────────────────────
const Cursor: React.FC = () => {
  const frame = useCurrentFrame();

  // Esconde durante o zoom da cena 7 (não faz sentido cursor sobre o painel zoomed)
  const agentScene = SCENES[6];
  if (frame >= agentScene.start + ZOOM_START) return null;

  const keyframes = SCENES.map((s) => ({
    frame: s.start,
    x: s.triggerTarget.x,
    y: s.triggerTarget.y,
  }));
  keyframes.push({
    frame: 600,
    x: agentScene.triggerTarget.x,
    y: agentScene.triggerTarget.y,
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
// Click pulse — anel amber expandindo no momento de cada transição
// ─────────────────────────────────────────────
const ClickPulse: React.FC = () => {
  const frame = useCurrentFrame();
  // Cena ativa onde estamos nos primeiros 18 frames (= click moment)
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

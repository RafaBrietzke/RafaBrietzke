// Gera assets/banner-light.svg e assets/banner-dark.svg.
// Rodar: node scripts/banner.mjs
// Cores = tokens do portfólio (globals.css). Animações em CSS, desligadas com prefers-reduced-motion.
import { writeFileSync, mkdirSync } from "node:fs";

const themes = {
  light: {
    bg: "#f3f0e8",
    surface: "#fbf9f4",
    fg: "#1a1a18",
    muted: "#5e5b53",
    line: "#d8d2c4",
    accent: "#2b44e0",
    grid: "rgba(43,68,224,0.07)",
    gridMajor: "rgba(43,68,224,0.13)",
    fill: "rgba(43,68,224,0.10)",
  },
  dark: {
    bg: "#0f1b2d",
    surface: "#142339",
    fg: "#e8eef6",
    muted: "#9db0c8",
    line: "#2a3d5c",
    accent: "#f2b544",
    grid: "rgba(157,176,200,0.08)",
    gridMajor: "rgba(157,176,200,0.15)",
    fill: "rgba(242,181,68,0.14)",
  },
};

// Frases do terminal. Largura fixa por caractere (textLength) para o cursor
// acompanhar a digitação com qualquer fonte monoespaçada.
const phrases = [
  "spec → código → testes → deploy",
  "React · Node.js · TypeScript · Java",
  "da planta ao produto",
];
const MONO = 22;
const CH = MONO * 0.6;
const TX = 104; // x do texto do terminal
const CYCLE = 15; // segundos para as três frases
const SLOT = CYCLE / phrases.length;

const serif = "'Instrument Serif', Georgia, 'Times New Roman', serif";
const sans = "Geist, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const mono = "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function svg(t) {
  const typing = phrases
    .map((p, i) => {
      const w = Math.round(p.length * CH);
      return { p, i, w, steps: p.length };
    });

  // Cada frase ocupa uma janela do ciclo: digita, segura, apaga.
  // Tudo sem delay, para nenhum cursor aparecer fora da sua janela.
  const pc = (i, pct) => (((i + pct / 100) * SLOT) / CYCLE * 100).toFixed(2);
  const kf = typing
    .map(
      ({ i, w, steps }) => `
    @keyframes type${i} {
      0%${i ? `, ${pc(i, 0)}%` : ""} { transform: translateX(0); animation-timing-function: steps(${steps}, end); }
      ${pc(i, 35)}% { transform: translateX(${w}px); }
      ${pc(i, 90)}% { transform: translateX(${w}px); animation-timing-function: steps(${Math.ceil(steps / 2)}, end); }
      ${pc(i, 100)}%, 100% { transform: translateX(0); }
    }
    @keyframes vis${i} {
      0% { opacity: ${i ? 0 : 1}; }
      ${i ? `${pc(i, 0)}% { opacity: 1; }` : ""}
      ${pc(i, 100)}%, 100% { opacity: 0; }
    }
    .t${i} { animation: type${i} ${CYCLE}s infinite; }
    .cursor.t${i} { animation: type${i} ${CYCLE}s infinite, vis${i} ${CYCLE}s steps(1, end) infinite; }`
    )
    .join("");

  const clips = typing
    .map(
      ({ i, w }) =>
        `<clipPath id="c${i}"><rect class="t${i}" x="${TX - w}" y="290" width="${w}" height="36"/></clipPath>`
    )
    .join("");

  const lines = typing
    .map(
      ({ p, i, w }) => `
    <g clip-path="url(#c${i})"><text x="${TX}" y="316" font-family="${mono}" font-size="${MONO}" fill="${t.fg}" textLength="${w}" lengthAdjust="spacingAndGlyphs">${p}</text></g>
    <rect class="t${i} cursor" x="${TX + 2}" y="298" width="11" height="24" fill="${t.accent}"/>`
    )
    .join("");

  // Planta: paredes externas, divisórias e porta. Depois vira interface:
  // barra do navegador, menu lateral e cards nos "cômodos".
  const P = { x: 770, y: 92, w: 360, h: 236 };
  const plan = [
    `M${P.x} ${P.y}h${P.w}v${P.h}h-${P.w}z`, // externo
    `M${P.x + 112} ${P.y}v${P.h}`, // parede vertical
    `M${P.x + 112} ${P.y + 120}h110 m40 0h98`, // parede horizontal com vão de porta
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="1200" height="400" role="img" aria-labelledby="title desc">
  <title id="title">Rafaela Brietzke · Desenvolvedora full stack</title>
  <desc id="desc">Desenvolvedora full stack que também define o que construir. Uma planta baixa se desenha e vira a interface de um sistema.</desc>
  <defs>
    <pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${t.grid}" stroke-width="1"/></pattern>
    <pattern id="G" width="120" height="120" patternUnits="userSpaceOnUse"><path d="M120 0H0V120" fill="none" stroke="${t.gridMajor}" stroke-width="1"/></pattern>
    ${clips}
  </defs>
  <style>
    .draw { stroke-dasharray: 1200; stroke-dashoffset: 1200; animation: draw 2.6s .3s cubic-bezier(.6,0,.3,1) forwards; }
    .draw.d2 { animation-delay: 1.1s; }
    .draw.d3 { animation-delay: 1.6s; }
    @keyframes draw { to { stroke-dashoffset: 0; } }
    .door { opacity: 0; animation: fade .6s 2.6s forwards, out .5s 4.4s forwards; }
    @keyframes out { from { opacity: 1; } to { opacity: 0; } }
    .ui { opacity: 0; animation: fade .7s forwards; }
    .ui1 { animation-delay: 3.4s; } .ui2 { animation-delay: 3.8s; } .ui3 { animation-delay: 4.2s; } .ui4 { animation-delay: 4.6s; }
    @keyframes fade { to { opacity: 1; } }
    .dim { opacity: 0; animation: fade .6s .2s forwards; }
    ${kf}
    @media (prefers-reduced-motion: reduce) {
      *, .cursor { animation: none !important; }
      .draw { stroke-dashoffset: 0; }
      .door { opacity: 0; }
      .ui, .dim { opacity: 1; }
      .t0 { transform: translateX(${typing[0].w}px); }
      .t1, .t2, .cursor.t1, .cursor.t2 { opacity: 0; }
    }
  </style>

  <rect width="1200" height="400" fill="${t.bg}"/>
  <rect width="1200" height="400" fill="url(#g)"/>
  <rect width="1200" height="400" fill="url(#G)"/>

  <!-- texto -->
  <text x="72" y="92" font-family="${mono}" font-size="15" letter-spacing="3" fill="${t.accent}">PORTFÓLIO · FOLHA 01</text>
  <text x="70" y="166" font-family="${serif}" font-size="70" fill="${t.fg}">Rafaela Brietzke</text>
  <text x="72" y="216" font-family="${sans}" font-size="26" fill="${t.muted}">Desenvolvedora full stack que também define</text>
  <text x="72" y="254" font-family="${serif}" font-style="italic" font-size="34" fill="${t.accent}">o que construir.</text>
  <text x="72" y="316" font-family="${mono}" font-size="${MONO}" fill="${t.accent}">$</text>
  ${lines}
  <text x="72" y="364" font-family="${mono}" font-size="14" letter-spacing="1" fill="${t.muted}">PORTO ALEGRE, RS · REMOTO OU HÍBRIDO</text>

  <!-- cota -->
  <g class="dim" stroke="${t.muted}" stroke-width="1">
    <path d="M${P.x} ${P.y - 26}h${P.w} M${P.x} ${P.y - 33}v14 M${P.x + P.w} ${P.y - 33}v14"/>
  </g>
  <text class="dim" x="${P.x + P.w / 2}" y="${P.y - 34}" text-anchor="middle" font-family="${mono}" font-size="13" letter-spacing="2" fill="${t.muted}">PLANTA → PRODUTO</text>

  <!-- interface (entra depois da planta) -->
  <rect class="ui ui1" x="${P.x}" y="${P.y}" width="${P.w}" height="26" fill="${t.fill}"/>
  <g class="ui ui1" fill="${t.accent}"><circle cx="${P.x + 14}" cy="${P.y + 13}" r="4"/><circle cx="${P.x + 28}" cy="${P.y + 13}" r="4"/><circle cx="${P.x + 42}" cy="${P.y + 13}" r="4"/></g>
  <g class="ui ui2" fill="${t.line}">
    <rect x="${P.x + 16}" y="${P.y + 44}" width="80" height="10" rx="2"/>
    <rect x="${P.x + 16}" y="${P.y + 66}" width="64" height="10" rx="2"/>
    <rect x="${P.x + 16}" y="${P.y + 88}" width="72" height="10" rx="2"/>
    <rect x="${P.x + 16}" y="${P.y + 110}" width="56" height="10" rx="2"/>
  </g>
  <g class="ui ui3">
    <rect x="${P.x + 128}" y="${P.y + 42}" width="98" height="62" fill="${t.fill}"/>
    <rect x="${P.x + 238}" y="${P.y + 42}" width="106" height="62" fill="${t.fill}"/>
    <rect x="${P.x + 140}" y="${P.y + 56}" width="40" height="8" fill="${t.accent}"/>
    <rect x="${P.x + 250}" y="${P.y + 56}" width="52" height="8" fill="${t.accent}"/>
  </g>
  <g class="ui ui4" fill="${t.line}">
    <rect x="${P.x + 128}" y="${P.y + 140}" width="216" height="10" rx="2"/>
    <rect x="${P.x + 128}" y="${P.y + 162}" width="216" height="10" rx="2"/>
    <rect x="${P.x + 128}" y="${P.y + 184}" width="160" height="10" rx="2"/>
    <rect x="${P.x + 128}" y="${P.y + 206}" width="190" height="10" rx="2"/>
  </g>

  <!-- planta -->
  <g fill="none" stroke="${t.accent}" stroke-width="3" stroke-linecap="square">
    <path class="draw" d="${plan[0]}"/>
    <path class="draw d2" d="${plan[1]}"/>
    <path class="draw d3" d="${plan[2]}"/>
  </g>
  <path class="door" d="M${P.x + 222} ${P.y + 120} a40 40 0 0 1 40 40 M${P.x + 222} ${P.y + 120}v40" fill="none" stroke="${t.accent}" stroke-width="1.5"/>
</svg>
`;
}

mkdirSync(new URL("../assets/", import.meta.url), { recursive: true });
for (const [name, t] of Object.entries(themes)) {
  writeFileSync(new URL(`../assets/banner-${name}.svg`, import.meta.url), svg(t));
}
console.log("ok: assets/banner-light.svg, assets/banner-dark.svg");

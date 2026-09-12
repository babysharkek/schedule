import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "pwa");

mkdirSync(OUT_DIR, { recursive: true });

function saturnSvg({ rounded = 0, fullBleed = false } = {}) {
  const clamp = (n) => Math.max(0, Math.min(1024, n));
  const rx = rounded > 0 ? ` rx="${clamp(rounded)}" ry="${clamp(rounded)}"` : "";

  const stars = [
    [120, 180, 1.2, 0.8], [240, 96, 1, 0.55], [420, 140, 0.9, 0.5],
    [850, 170, 1.1, 0.7], [920, 320, 0.8, 0.45], [180, 640, 1, 0.4],
    [880, 700, 1.2, 0.55], [330, 900, 1, 0.5], [720, 920, 0.9, 0.6],
    [600, 260, 1, 0.5],
  ];
  const starEls = stars
    .map(
      ([x, y, r, o]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="${o}"/>`
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#14102b"/>
      <stop offset="0.55" stop-color="#0e1122"/>
      <stop offset="1" stop-color="#07091a"/>
    </linearGradient>
    <linearGradient id="planet" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7c878"/>
      <stop offset="0.45" stop-color="#e8a24f"/>
      <stop offset="1" stop-color="#b96e2e"/>
    </linearGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="0.75">
      <stop offset="0" stop-color="#c98d4a"/>
      <stop offset="0.5" stop-color="#f0c085"/>
      <stop offset="0.66" stop-color="#e8b573"/>
      <stop offset="1" stop-color="#9a6a35"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="planetClip"><circle cx="512" cy="600" r="205"/></clipPath>
  </defs>

  <rect x="0" y="0" width="1024" height="1024" fill="url(#bg)"${rx}/>
  ${starEls}

  <circle cx="512" cy="600" r="430" fill="url(#glow)"/>

  <g transform="rotate(-18 512 600)">
    <path d="M150 600 A350 122 0 0 1 874 600"
      fill="none" stroke="url(#ring)" stroke-width="44" stroke-linecap="round" opacity="0.95"/>
  </g>

  <circle cx="512" cy="600" r="205" fill="url(#planet)"/>
  <g clip-path="url(#planetClip)">
    <rect x="0" y="512" width="1024" height="40" fill="#7a4d24" opacity="0.35"/>
    <rect x="0" y="596" width="1024" height="30" fill="#7a4d24" opacity="0.3"/>
    <rect x="0" y="668" width="1024" height="36" fill="#8a5a2a" opacity="0.28"/>
    <circle cx="420" cy="522" r="70" fill="#fff6dd" opacity="0.35"/>
    <circle cx="430" cy="532" r="46" fill="#ffffff" opacity="0.5"/>
  </g>

  <g transform="rotate(-18 512 600)">
    <path d="M150 600 A350 122 0 0 0 874 600"
      fill="none" stroke="url(#ring)" stroke-width="44" stroke-linecap="round" opacity="0.95"/>
    <path d="M240 600 A270 92 0 0 0 784 600"
      fill="none" stroke="#f6d8a0" stroke-width="10" stroke-linecap="round" opacity="0.55"/>
  </g>

  <circle cx="512" cy="600" r="436" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="2"/>
</svg>`;
}

async function render(name, size, opts) {
  const svg = saturnSvg(opts);
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(join(OUT_DIR, name));
  console.log("wrote", name, `${size}x${size}`);
}

await render("icon-192.png", 192, { rounded: 42 });
await render("icon-512.png", 512, { rounded: 112 });
await render("icon-1024.png", 1024, { rounded: 225 });
await render("maskable-512.png", 512, {});
await render("apple-touch-icon.png", 180, {});

console.log("icons done →", OUT_DIR);
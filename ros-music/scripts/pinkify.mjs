import { readFileSync, writeFileSync } from 'fs';

const cssFile = new URL('../src/index.css', import.meta.url).pathname.slice(1);
let c = readFileSync(cssFile, 'utf8');

// ── Background dark navy → dark plum ─────────────────────────
c = c.replace(/--bg-primary:\s*#0a0a1a/g,    '--bg-primary: #1a0810');
c = c.replace(/--bg-secondary:\s*#0d0d2b/g,  '--bg-secondary: #1f0d18');
c = c.replace(/--bg-dark:\s*#050510/g,        '--bg-dark: #0f0508');
c = c.replace('--glass-bg: rgba(10, 15, 30, 0.75)',  '--glass-bg: rgba(30, 10, 20, 0.75)');
c = c.replace('--frost-bg: rgba(22, 22, 32, 0.55)',  '--frost-bg: rgba(38, 12, 28, 0.55)');
c = c.replace('--panel-deep-bg: rgba(10, 10, 24, 0.88)', '--panel-deep-bg: rgba(28, 8, 18, 0.88)');
c = c.replace('rgba(8, 8, 20, 0.92)', 'rgba(24, 6, 16, 0.92)');

// ── Raw hex cyan → pink ───────────────────────────────────────
c = c.replaceAll('#00ffcc', '#ff6eb4');
c = c.replaceAll('#00cc99', '#e0559a');
c = c.replaceAll('#7fd8ff', '#ffb3d9');
c = c.replaceAll('#007a66', '#c2185b');

// ── rgba(0,255,204) cyan → pink ───────────────────────────────
c = c.replaceAll('rgba(0, 255, 204,', 'rgba(255, 110, 180,');

// ── rgba(255,0,255) magenta → deep pink ──────────────────────
c = c.replaceAll('rgba(255, 0, 255,', 'rgba(214, 58, 138,');

// ── rgba(120,80,255) purple → rose ───────────────────────────
c = c.replaceAll('rgba(120, 80, 255,', 'rgba(200, 50, 120,');

// ── Brand title gradient → pink ──────────────────────────────
c = c.replace(
  'linear-gradient(135deg, var(--neon-cyan) 0%, #e0559a 50%, var(--neon-magenta) 100%)',
  'linear-gradient(135deg, #ffb3d9 0%, #ff6eb4 50%, #d63a8a 100%)'
);
// fallback if gradient still has old mid-stop
c = c.replace(
  /linear-gradient\(135deg, var\(--neon-cyan\) 0%, #[0-9a-f]+ 50%, var\(--neon-magenta\) 100%\)/gi,
  'linear-gradient(135deg, #ffb3d9 0%, #ff6eb4 50%, #d63a8a 100%)'
);

writeFileSync(cssFile, c, 'utf8');
console.log('✅  index.css recoloured to pink');

// ── draw.ts: change URL pill brand text colour ────────────────
const drawFile = new URL('../src/hud/draw.ts', import.meta.url).pathname.slice(1);
let d = readFileSync(drawFile, 'utf8');
d = d.replaceAll("'#ffffff'", "'#ff6eb4'");
d = d.replaceAll('"#ffffff"', '"#ff6eb4"');
d = d.replaceAll("rgba(0, 255, 204,", "rgba(255, 110, 180,");
writeFileSync(drawFile, d, 'utf8');
console.log('✅  draw.ts updated');

// ── App.tsx: change "made by @indecisive.eric" → "created by Roschel" ──
const appFile = new URL('../src/App.tsx', import.meta.url).pathname.slice(1);
let a = readFileSync(appFile, 'utf8');
a = a.replaceAll('made by @indecisive.eric', 'created by Roschel');
a = a.replaceAll('@indecisive.eric', 'created by Roschel');
a = a.replaceAll('made by', 'created by Roschel —');
writeFileSync(appFile, a, 'utf8');
console.log('✅  App.tsx credit updated');

// ── useRecording.ts: update the recording metadata credit ────
const recFile = new URL('../src/recording/useRecording.ts', import.meta.url).pathname.slice(1);
let r = readFileSync(recFile, 'utf8');
r = r.replaceAll('Created with Gesture Synth Weld', 'Created by Roschel — Gesture Synth');
r = r.replaceAll('gesturesynthweld.com', 'gesturesynthweld.com | created by Roschel');
writeFileSync(recFile, r, 'utf8');
console.log('✅  useRecording.ts credit updated');

console.log('\n🎀  All done! Run: npm run dev');

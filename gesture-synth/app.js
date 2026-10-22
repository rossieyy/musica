// ============================================================
//  GESTURE SYNTH — app.js
//  Hand tracking via MediaPipe → chord synthesis via Tone.js
// ============================================================

// ── Music theory constants ───────────────────────────────────

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Major scale intervals (semitones from root)
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
// Minor scale intervals
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

// Triad chord intervals: [root, third, fifth]
const MAJOR_CHORD = [0, 4, 7];
const MINOR_CHORD = [0, 3, 7];

// Degree names (0-indexed)
const DEGREE_NAMES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// ── State ────────────────────────────────────────────────────

let currentKey = 'A';
let currentSound = 'strings';
let isPlaying = false;
let lastChordNotes = [];
let lastDegree = -1;
let lastQuality = '';  // 'major' | 'minor'
let semitoneShift = 0;
let rightHandVolume = 0.7;
let rightHandFilter = 4000;

// Debounce — only re-trigger sound if chord changes
let chordDebounceTimer = null;

// ── Tone.js setup ────────────────────────────────────────────

let synth = null;
let reverb = null;
let filter = null;
let analyser = null;

function buildSynth(soundType) {
  // Dispose previous
  if (synth) { synth.dispose(); }
  if (reverb) { reverb.dispose(); }
  if (filter) { filter.dispose(); }
  if (analyser) { analyser.dispose(); }

  filter = new Tone.Filter(rightHandFilter, 'lowpass').toDestination();
  reverb = new Tone.Reverb({ decay: 3, wet: 0.4 }).connect(filter);
  analyser = new Tone.Analyser('waveform', 256);
  filter.connect(analyser);

  switch (soundType) {
    case 'strings':
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.4, decay: 0.2, sustain: 0.8, release: 1.5 },
        volume: -8
      }).connect(reverb);
      break;

    case 'synth':
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.7, release: 1.2 },
        volume: -6
      }).connect(reverb);
      break;

    case 'piano':
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.02, decay: 0.8, sustain: 0.3, release: 1.0 },
        volume: -4
      }).connect(reverb);
      break;

    case 'pad':
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine4' },
        envelope: { attack: 0.8, decay: 0.5, sustain: 0.9, release: 3.0 },
        volume: -6
      }).connect(reverb);
      break;

    default:
      synth = new Tone.PolySynth().connect(reverb);
  }

  Tone.Destination.volume.rampTo(Tone.gainToDb(rightHandVolume), 0.1);
}

function playChord(notes) {
  if (!synth) return;
  synth.releaseAll();
  synth.triggerAttack(notes);
}

function releaseChord() {
  if (!synth) return;
  synth.releaseAll();
}

// ── Music helpers ────────────────────────────────────────────

function getNoteIndex(noteName) {
  return NOTES.indexOf(noteName);
}

function buildChordNotes(rootNote, quality, octave = 4) {
  const rootIdx = getNoteIndex(rootNote);
  const intervals = quality === 'major' ? MAJOR_CHORD : MINOR_CHORD;
  return intervals.map(interval => {
    const noteIdx = (rootIdx + interval) % 12;
    const oct = octave + Math.floor((rootIdx + interval) / 12);
    return NOTES[noteIdx] + oct;
  });
}

function getScaleDegreeRoot(key, degree, quality) {
  const rootIdx = getNoteIndex(key);
  const scale = quality === 'major' ? MAJOR_SCALE : MINOR_SCALE;
  const semitones = scale[degree % scale.length];
  return NOTES[(rootIdx + semitones + semitoneShift + 12) % 12];
}

function getChordName(root, quality) {
  return quality === 'major' ? root : root + 'm';
}

// ── MediaPipe Hand landmark indices ──────────────────────────

// Fingertip landmarks: thumb=4, index=8, middle=12, ring=16, pinky=20
// Base (MCP) landmarks: thumb=2, index=5, middle=9, ring=13, pinky=17
const TIPS = [4, 8, 12, 16, 20];
const BASES = [2, 5, 9, 13, 17];
const PIPS = [3, 6, 10, 14, 18]; // intermediate joints

function isFingerUp(landmarks, fingerIdx) {
  // fingerIdx: 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
  if (fingerIdx === 0) {
    // Thumb: in the mirrored view, thumb tip is to the RIGHT of its base
    // MediaPipe x is un-mirrored, so mirrored thumb tip x = 1 - tip.x
    // We just compare raw x: tip.x > base.x means thumb is out in mirrored view
    return landmarks[TIPS[0]].x > landmarks[BASES[0]].x;
  }
  // Other fingers: tip y < pip y (tip is higher on screen — same regardless of mirror)
  return landmarks[TIPS[fingerIdx]].y < landmarks[PIPS[fingerIdx]].y;
}

function countFingers(landmarks) {
  let count = 0;
  for (let i = 1; i <= 4; i++) {
    if (isFingerUp(landmarks, i)) count++;
  }
  return count; // 0–4 (excluding thumb)
}

function detectHandTilt(landmarks) {
  // Use wrist (0) and index MCP (5) to determine tilt
  const wrist = landmarks[0];
  const indexMCP = landmarks[5];
  const pinkyMCP = landmarks[17];
  // If index side is higher than pinky side → tilted inward (major)
  // If pinky side is higher → tilted outward (minor)
  return indexMCP.y < pinkyMCP.y ? 'major' : 'minor';
}

function detectHandOpenness(landmarks) {
  // Average distance of fingertips from palm center
  const palm = landmarks[9]; // middle MCP as center
  let totalDist = 0;
  for (let i = 1; i < 5; i++) {
    const tip = landmarks[TIPS[i]];
    const dx = tip.x - palm.x;
    const dy = tip.y - palm.y;
    totalDist += Math.sqrt(dx * dx + dy * dy);
  }
  return totalDist / 4; // avg spread, roughly 0.05–0.25
}

function getHandCenter(landmarks) {
  let sumX = 0, sumY = 0;
  for (const lm of landmarks) { sumX += lm.x; sumY += lm.y; }
  return { x: sumX / landmarks.length, y: sumY / landmarks.length };
}

// ── Gesture → degree mapping ─────────────────────────────────

function fingersToScaleDegree(landmarks) {
  const thumb  = isFingerUp(landmarks, 0);
  const index  = isFingerUp(landmarks, 1);
  const middle = isFingerUp(landmarks, 2);
  const ring   = isFingerUp(landmarks, 3);
  const pinky  = isFingerUp(landmarks, 4);

  const upCount = [thumb, index, middle, ring, pinky].filter(Boolean).length;

  // Special combos (matching the original Gesture Synth logic)
  if (index && pinky && thumb && !middle && !ring) return 6; // VII
  if (index && pinky && !thumb && !middle && !ring) return 5; // VI
  if (upCount === 0) return -1; // fist = silence
  if (upCount >= 5) return 4;   // all 5 = V

  // Count non-thumb fingers for degree I–V
  const nonThumb = [index, middle, ring, pinky].filter(Boolean).length;
  if (nonThumb === 0) return -1;
  return Math.min(nonThumb - 1, 6); // 0=I, 1=II, 2=III, 3=IV, 4=V
}

// ── Hand landmark drawing ─────────────────────────────────────

const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],       // thumb
  [0,5],[5,6],[6,7],[7,8],       // index
  [0,9],[9,10],[10,11],[11,12],  // middle
  [0,13],[13,14],[14,15],[15,16],// ring
  [0,17],[17,18],[18,19],[19,20],// pinky
  [5,9],[9,13],[13,17]           // palm
];

function drawHand(ctx, landmarks, color, canvasW, canvasH) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // MediaPipe gives x in [0,1] from the raw (un-mirrored) camera frame.
  // The video is CSS-mirrored (scaleX(-1)), so we flip x here: mirroredX = 1 - x
  // This keeps the skeleton correctly aligned with what the user sees.
  const mx = (lm) => (1 - lm.x) * canvasW;
  const my = (lm) => lm.y * canvasH;

  // Draw connections
  for (const [a, b] of CONNECTIONS) {
    const lA = landmarks[a];
    const lB = landmarks[b];
    ctx.beginPath();
    ctx.moveTo(mx(lA), my(lA));
    ctx.lineTo(mx(lB), my(lB));
    ctx.stroke();
  }

  // Draw dots
  for (const lm of landmarks) {
    ctx.beginPath();
    ctx.arc(mx(lm), my(lm), 5, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// ── Waveform drawing ──────────────────────────────────────────

function drawWaveform(canvas, analyserNode) {
  if (!analyserNode) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const data = analyserNode.getValue();
  ctx.beginPath();
  ctx.strokeStyle = '#f5a623';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#f5a623';
  ctx.shadowBlur = 8;

  for (let i = 0; i < data.length; i++) {
    const x = (i / data.length) * w;
    const y = (0.5 + data[i] * 0.4) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// ── DOM references ────────────────────────────────────────────

const landing      = document.getElementById('landing');
const bgVideo      = document.getElementById('bg-video');
const app          = document.getElementById('app');
const cam          = document.getElementById('cam');
const overlayCanvas= document.getElementById('overlay-canvas');
const waveCanvas   = document.getElementById('wave-canvas');
const chordNameEl  = document.getElementById('chord-name');
const chordDegreeEl= document.getElementById('chord-degree');
const keySelect    = document.getElementById('key-select');
const soundSelect  = document.getElementById('sound-select');
const volBars      = document.querySelectorAll('#vol-bars .bar');

const btnPlay      = document.getElementById('btn-play');
const btnGuide     = document.getElementById('btn-guide');
const openGuide    = document.getElementById('open-guide');
const guideModal   = document.getElementById('guide-modal');
const closeGuide   = document.getElementById('close-guide');
const landingHelp  = document.getElementById('landing-help');
const appHelp      = document.getElementById('app-help');

// Overlay canvas context
const ctx = overlayCanvas.getContext('2d');

// ── Resize canvases to match video ────────────────────────────

function resizeCanvases() {
  overlayCanvas.width  = window.innerWidth;
  overlayCanvas.height = window.innerHeight;
  waveCanvas.width     = window.innerWidth;
  waveCanvas.height    = 100;
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

// ── Volume bar UI update ──────────────────────────────────────

function updateVolBars(vol) {
  // vol: 0–1
  const activeCount = Math.round(vol * volBars.length);
  volBars.forEach((bar, i) => {
    bar.classList.toggle('active', i < activeCount);
  });
}

// ── Main MediaPipe result handler ─────────────────────────────

function onResults(results) {
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    // No hands → release
    if (isPlaying) { releaseChord(); isPlaying = false; }
    chordNameEl.textContent = '—';
    chordDegreeEl.textContent = '';
    return;
  }

  // Identify left/right hands
  let leftLandmarks  = null;
  let rightLandmarks = null;

  if (results.multiHandedness) {
    results.multiHandedness.forEach((hand, i) => {
      // MediaPipe labels are from the camera's perspective (mirrored)
      // so "Right" from MediaPipe = user's left hand in mirrored view
      const label = hand.label;
      if (label === 'Right') leftLandmarks  = results.multiHandLandmarks[i];
      if (label === 'Left')  rightLandmarks = results.multiHandLandmarks[i];
    });
  } else {
    leftLandmarks = results.multiHandLandmarks[0];
  }

  const W = overlayCanvas.width;
  const H = overlayCanvas.height;

  // Draw hands
  if (leftLandmarks)  drawHand(ctx, leftLandmarks,  '#f5a623', W, H);
  if (rightLandmarks) drawHand(ctx, rightLandmarks, '#ffffff', W, H);

  // ── Right hand: volume + filter ──
  if (rightLandmarks) {
    const center = getHandCenter(rightLandmarks);
    // Y position: top=0, bottom=1 → top = max volume
    rightHandVolume = Math.max(0.05, 1 - center.y);
    Tone.Destination.volume.rampTo(Tone.gainToDb(rightHandVolume), 0.08);
    updateVolBars(rightHandVolume);

    // Openness → filter cutoff
    const openness = detectHandOpenness(rightLandmarks);
    rightHandFilter = 300 + openness * 20000;
    if (filter) filter.frequency.rampTo(rightHandFilter, 0.1);
  } else {
    updateVolBars(rightHandVolume);
  }

  // ── Left hand: chord control ──
  if (!leftLandmarks) {
    if (isPlaying) { releaseChord(); isPlaying = false; }
    chordNameEl.textContent = '—';
    chordDegreeEl.textContent = '';
    return;
  }

  const degree  = fingersToScaleDegree(leftLandmarks);
  const quality = detectHandTilt(leftLandmarks);

  // Pitch shift based on hand Y position
  const leftCenter = getHandCenter(leftLandmarks);
  if (leftCenter.y < 0.3) semitoneShift = 1;
  else if (leftCenter.y > 0.75) semitoneShift = -1;
  else semitoneShift = 0;

  if (degree === -1) {
    // Fist → silence
    if (isPlaying) { releaseChord(); isPlaying = false; }
    chordNameEl.textContent = '✊';
    chordDegreeEl.textContent = 'fist = silence';
    return;
  }

  // Only re-trigger if chord changed
  const chordChanged = (degree !== lastDegree || quality !== lastQuality);

  if (chordChanged) {
    clearTimeout(chordDebounceTimer);
    chordDebounceTimer = setTimeout(() => {
      const root      = getScaleDegreeRoot(currentKey, degree, quality);
      const octave    = quality === 'major' ? 3 : 3;
      const notes     = buildChordNotes(root, quality, octave);
      const chordName = getChordName(root, quality);

      playChord(notes);
      isPlaying = true;
      lastChordNotes = notes;
      lastDegree  = degree;
      lastQuality = quality;

      chordNameEl.textContent = chordName;
      chordDegreeEl.textContent = DEGREE_NAMES[degree] + (semitoneShift !== 0 ? (semitoneShift > 0 ? ' ▲' : ' ▼') : '');
    }, 80); // 80ms debounce to avoid retriggering on every frame
  }
}

// ── MediaPipe Hands setup ─────────────────────────────────────

let handsModel = null;
let cameraUtil = null;

function startHandTracking(videoEl) {
  // locateFile must match the pinned version in index.html (0.4.1646424915)
  // so MediaPipe can find the .wasm and .data files from the same CDN package
  handsModel = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`
  });

  handsModel.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.6
  });

  handsModel.onResults(onResults);

  cameraUtil = new Camera(videoEl, {
    onFrame: async () => {
      await handsModel.send({ image: videoEl });
    },
    width: 1280,
    height: 720
  });

  cameraUtil.start();
}

// ── Landing page camera preview ───────────────────────────────

async function startBgCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 1280, height: 720 }
    });
    bgVideo.srcObject = stream;
  } catch (err) {
    console.log('No camera for landing preview:', err.message);
  }
}

// ── Key & sound change handlers ───────────────────────────────

keySelect.addEventListener('change', () => {
  currentKey = keySelect.value;
  // Reset last chord so it retriggeres
  lastDegree = -1;
});

soundSelect.addEventListener('change', () => {
  currentSound = soundSelect.value;
  buildSynth(currentSound);
  lastDegree = -1;
});

// ── Guide modal ───────────────────────────────────────────────

function openGuideModal() { guideModal.classList.remove('hidden'); }
function closeGuideModal() { guideModal.classList.add('hidden'); }

btnGuide.addEventListener('click', openGuideModal);
openGuide.addEventListener('click', openGuideModal);
closeGuide.addEventListener('click', closeGuideModal);
landingHelp.addEventListener('click', openGuideModal);
appHelp.addEventListener('click', openGuideModal);

guideModal.addEventListener('click', (e) => {
  if (e.target === guideModal) closeGuideModal();
});

// ── Play Now button ───────────────────────────────────────────

btnPlay.addEventListener('click', async () => {
  // 1. Verify camera access before switching views
  try {
    const testStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    // Stop the test stream — MediaPipe Camera util opens its own
    testStream.getTracks().forEach(t => t.stop());
  } catch (err) {
    // Show a friendly error instead of a broken blank screen
    const note = document.querySelector('.cam-note');
    note.textContent = '⚠️ Camera access denied. Please allow camera and reload.';
    note.style.color = '#f5a623';
    console.error('Camera permission denied:', err.message);
    return;
  }

  // 2. Start Tone.js audio context (requires user gesture — must happen here)
  await Tone.start();
  buildSynth(currentSound);

  // 3. Show app, hide landing
  landing.classList.add('hidden');
  app.classList.remove('hidden');

  // 4. Start MediaPipe hand tracking (opens its own camera stream)
  startHandTracking(cam);

  // 5. Waveform animation loop
  function waveLoop() {
    drawWaveform(waveCanvas, analyser);
    requestAnimationFrame(waveLoop);
  }
  waveLoop();
});

// ── Init: start landing camera ────────────────────────────────

startBgCamera();

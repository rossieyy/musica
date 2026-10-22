# 🎵 Gesture Synth

An interactive musical instrument that uses your **webcam + hand gestures** to play chords and melodies in real-time — no keyboard, no mouse, just your hands.

Built with [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands) + [Tone.js](https://tonejs.github.io/).

---

## 🚀 Deploy to Vercel (one click)

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Leave all settings as default (no build command needed)
5. Click **Deploy**

That's it. Vercel auto-detects static sites and the `vercel.json` handles all the required security headers for camera access.

---

## 🎮 How to Play

### Left Hand — Chord Control

| Gesture | Effect |
|---|---|
| Tilt hand inward | Major chord |
| Tilt hand outward | Minor chord |
| 1 finger raised | Scale degree I |
| 2 fingers raised | Scale degree II |
| 3 fingers raised | Scale degree III |
| 4 fingers raised | Scale degree IV |
| 5 fingers raised | Scale degree V |
| Index + Pinky | Scale degree VI |
| Index + Pinky + Thumb | Scale degree VII |
| Fist (all fingers down) | Silence |

### Left Hand — Pitch Shift (by height)

| Position | Effect |
|---|---|
| Top 30% of screen | +1 semitone |
| Middle | Normal pitch |
| Bottom 25% of screen | −1 semitone |

### Right Hand — Volume & Filter

| Gesture | Effect |
|---|---|
| Hand high up | Louder |
| Hand low down | Quieter |
| Hand open wide | Bright filter (more treble) |
| Hand closed | Dark filter (more bass) |

---

## 🎛️ Controls

- **Key selector** (top-left) — change the root key (A through G#)
- **Sound selector** (top-left) — Strings, Warm Synth, Piano, or Pad
- **Open Guide** — in-app reference for gestures

---

## 🗂️ File Structure

```
gesture-synth/
├── index.html     # App structure + CDN scripts
├── style.css      # Dark theme, orange accents
├── app.js         # MediaPipe hand tracking + Tone.js synthesis
├── vercel.json    # Security headers for camera on Vercel
└── README.md      # This file
```

---

## 🛠️ Run Locally

No build step needed. Just serve the folder over HTTP:

```bash
# Option 1 — npx (requires Node.js)
npx serve .

# Option 2 — Python
python -m http.server 8080
```

Then open `http://localhost:3000` (or `8080`) in **Chrome** or **Edge**.

> ⚠️ Opening `index.html` directly as a `file://` URL may block camera access in some browsers. Always use a local server.

---

## 📦 Dependencies (all via CDN, no install)

| Library | Version | Purpose |
|---|---|---|
| @mediapipe/hands | 0.4.1646424915 | Hand landmark detection |
| @mediapipe/camera_utils | 0.3.1640029074 | Webcam feed to MediaPipe |
| @mediapipe/control_utils | 0.6.1629159505 | MediaPipe utilities |
| Tone.js | 14.8.49 | Audio synthesis |

---

## 🔒 Why `vercel.json`?

Camera access on HTTPS requires specific browser security headers:

- `Permissions-Policy: camera=*` — explicitly allows camera in the page
- `Cross-Origin-Opener-Policy: same-origin` — required for SharedArrayBuffer (used by MediaPipe WASM)
- `Cross-Origin-Embedder-Policy: require-corp` — pairs with COOP to enable high-res timers
- `Cross-Origin-Resource-Policy: cross-origin` — allows CDN assets to load under COEP

Without these, MediaPipe's WASM model will fail to load on Vercel.

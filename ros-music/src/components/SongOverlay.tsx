/**
 * SongOverlay — live chord guide at the top center of the camera view.
 *
 * Shows while a guided song is active and the instrument is running.
 * Displays:
 *   - Song title + key
 *   - The current chord step (large, highlighted) with finger gesture cue
 *   - A scrolling row of upcoming steps so the player can look ahead
 *   - ← Prev / Next → buttons + auto-advance when the played degree matches
 *
 * Positioned at the top-center of the camera stage (below the toolbar).
 * Dismissible with ✕ (clears the active song).
 */

import { useEffect, useRef } from 'react';
import { KEYS, DIATONIC_CHORDS, DIATONIC_CHORDS_MINOR } from '../chords';
import type { GuidedSong } from '../songs/songList';

/** Roman numeral labels */
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/** Finger gesture hint per degree */
const FINGER_HINT: Record<number, string> = {
  0: '✋ 1 finger',
  1: '✋ 2 fingers',
  2: '✋ 3 fingers',
  3: '✋ 4 fingers',
  4: '✋ 5 fingers',
  5: '✋ Index + Pinky',
  6: '✋ Index + Pinky + Thumb',
};

export interface SongOverlayProps {
  song: GuidedSong;
  step: number;
  onStepChange: (step: number) => void;
  onClose: () => void;
  /** The degree index currently being played (null = silent). Used for
   *  auto-advance: when the played degree matches the current step's
   *  degree we highlight it, and on the NEXT different degree we advance. */
  currentDegree: number | null;
}

/** Get the chord note name for a degree in the song's key/scale. */
function chordLabel(degree: number, song: GuidedSong): string {
  const chords = song.scaleMode === 'minor' ? DIATONIC_CHORDS_MINOR : DIATONIC_CHORDS;
  const chord = chords[degree % chords.length];
  if (!chord) return ROMAN[degree] ?? '?';
  const rootIdx = ((chord.intervals[0] + song.keyOffset) % 12 + 12) % 12;
  const name = (KEYS[rootIdx]?.name ?? '?').split('/')[0];
  // minor = lowercase, major = uppercase (same convention as the HUD)
  const dim = chord.roman.includes('°');
  if (dim) return name.toLowerCase() + 'dim';
  return chord.isMajor ? name : name.toLowerCase();
}

export function SongOverlay({ song, step, onStepChange, onClose, currentDegree }: SongOverlayProps) {
  const total = song.chords.length;
  const current = song.chords[step];
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-advance: when a new degree is played that matches the NEXT step,
  // advance. We track the last-seen degree to avoid advancing on every frame.
  const lastDegreeRef = useRef<number | null>(null);
  useEffect(() => {
    if (currentDegree === null) return;
    if (currentDegree === lastDegreeRef.current) return;
    lastDegreeRef.current = currentDegree;

    // If the played degree matches the current step — great, stay.
    // If it matches the NEXT step, advance.
    const nextStep = step + 1;
    if (nextStep < total && song.chords[nextStep].degree === currentDegree) {
      onStepChange(nextStep);
    }
  }, [currentDegree, step, total, song.chords, onStepChange]);

  // Scroll the active chip into view when step changes
  useEffect(() => {
    const el = scrollRef.current?.querySelector<HTMLElement>('.song-ov-chip--active');
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [step]);

  const keyName = (KEYS[song.keyOffset]?.name ?? 'C').split('/')[0];

  return (
    <div className="song-ov-wrap">
      {/* ── Header row: title · key · close ─────────────────────── */}
      <div className="song-ov-head">
        <span className="song-ov-title">
          {/* Music note */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
            <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {song.title}
        </span>
        <span className="song-ov-key">
          {keyName} {song.scaleMode === 'minor' ? 'min' : 'maj'} · {song.bpm} BPM
        </span>
        <button className="song-ov-close" onClick={onClose} aria-label="Stop guided song">✕</button>
      </div>

      {/* ── Current step — big chord block ──────────────────────── */}
      <div className="song-ov-current">
        <div className={`song-ov-big${currentDegree === current?.degree ? ' song-ov-big--match' : ''}`}>
          <span className="song-ov-big-roman">{ROMAN[current?.degree ?? 0]}</span>
          <span className="song-ov-big-note">{chordLabel(current?.degree ?? 0, song)}</span>
        </div>
        <div className="song-ov-hint">
          {FINGER_HINT[current?.degree ?? 0] ?? ''}
          {(current?.beats ?? 1) > 1 && (
            <span className="song-ov-beats"> · {current.beats} beats</span>
          )}
        </div>
      </div>

      {/* ── Scrolling chip row ───────────────────────────────────── */}
      <div className="song-ov-chips-row" ref={scrollRef}>
        {song.chords.map((c, i) => {
          const isActive = i === step;
          const isDone = i < step;
          const isNext = i === step + 1;
          return (
            <button
              key={i}
              className={`song-ov-chip${isActive ? ' song-ov-chip--active' : ''}${isDone ? ' song-ov-chip--done' : ''}${isNext ? ' song-ov-chip--next' : ''}`}
              onClick={() => onStepChange(i)}
              title={`${ROMAN[c.degree]} — ${chordLabel(c.degree, song)} · ${FINGER_HINT[c.degree] ?? ''}`}
            >
              <span className="song-ov-chip-roman">{ROMAN[c.degree]}</span>
              <span className="song-ov-chip-note">{chordLabel(c.degree, song)}</span>
            </button>
          );
        })}
      </div>

      {/* ── Navigation ──────────────────────────────────────────── */}
      <div className="song-ov-nav">
        <button
          className="song-ov-nav-btn"
          onClick={() => onStepChange(Math.max(0, step - 1))}
          disabled={step === 0}
          aria-label="Previous chord"
        >←</button>
        <span className="song-ov-nav-pos">{step + 1} / {total}</span>
        <button
          className="song-ov-nav-btn"
          onClick={() => onStepChange(Math.min(total - 1, step + 1))}
          disabled={step === total - 1}
          aria-label="Next chord"
        >→</button>
      </div>
    </div>
  );
}

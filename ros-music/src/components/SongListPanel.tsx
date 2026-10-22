/**
 * SongListPanel — free guided song list, no Pro lock.
 *
 * Shows all songs grouped by difficulty. Clicking "Play" loads the song's
 * key + scale into the synth and displays the chord sequence as an
 * interactive step-through guide the player follows with their hands.
 *
 * No paywall, no login, no lock icons — everything is free.
 */

import { useEffect, useRef, useState } from 'react';
import {
  SONGS,
  DIFFICULTY_LABEL,
  DIFFICULTY_COLOR,
  type GuidedSong,
  type Difficulty,
} from '../songs/songList';
import { KEYS } from '../chords';

/** Roman numeral labels for degrees 0–6 */
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/** Degree → finger gesture hint */
const FINGER_HINT: Record<number, string> = {
  0: '1 finger',
  1: '2 fingers',
  2: '3 fingers',
  3: '4 fingers',
  4: '5 fingers',
  5: 'Index + Pinky',
  6: 'Index + Pinky + Thumb',
};

const DIFFICULTIES: Difficulty[] = ['beginner', 'easy', 'intermediate', 'advanced'];

export interface SongListPanelProps {
  /** Called when the player clicks Play on a song. App applies the key + scale. */
  onLoadSong: (song: GuidedSong) => void;
  /** Currently active song id (highlighted in the list). */
  activeSongId: string | null;
  onClose: () => void;
}

export function SongListPanel({ onLoadSong, activeSongId, onClose }: SongListPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(activeSongId);
  const activeSong = SONGS.find((s) => s.id === activeSongId) ?? null;
  const [guideStep, setGuideStep] = useState(0);
  const stepRef = useRef(guideStep);
  stepRef.current = guideStep;

  // Reset step when active song changes
  useEffect(() => {
    setGuideStep(0);
  }, [activeSongId]);

  // Auto-expand the active song
  useEffect(() => {
    if (activeSongId) setExpandedId(activeSongId);
  }, [activeSongId]);

  // Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handlePlay = (song: GuidedSong) => {
    onLoadSong(song);
    setExpandedId(song.id);
    setGuideStep(0);
  };

  const keyName = (offset: number) =>
    (KEYS[offset]?.name ?? 'C').split('/')[0];

  return (
    <div className="song-panel-overlay" onClick={onClose}>
      <div className="song-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="song-panel-head">
          <div className="song-panel-head-left">
            {/* Music note glyph */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.8"/>
              <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
            <span className="song-panel-title">Songs — Setlist</span>
            <span className="song-panel-subtitle">All free · no lock</span>
          </div>
          <button className="song-panel-close" onClick={onClose} aria-label="Close song list">✕</button>
        </div>

        {/* ── Active guide strip (shows when a song is loaded) ────── */}
        {activeSong && (
          <div className="song-guide-strip">
            <div className="song-guide-strip-top">
              <span className="song-guide-now-playing">
                ▶ {activeSong.title}
              </span>
              <span className="song-guide-meta">
                {keyName(activeSong.keyOffset)} {activeSong.scaleMode === 'minor' ? 'minor' : 'major'}
                {' · '}{activeSong.bpm} BPM
              </span>
            </div>
            <div className="song-guide-tip">💡 {activeSong.tip}</div>
            {/* Chord step-through */}
            <div className="song-guide-steps">
              {activeSong.chords.map((step, idx) => (
                <button
                  key={idx}
                  className={`song-guide-step${idx === guideStep ? ' active' : ''}${idx < guideStep ? ' done' : ''}`}
                  onClick={() => setGuideStep(idx)}
                  title={FINGER_HINT[step.degree] ?? ''}
                >
                  <span className="song-guide-step-roman">
                    {ROMAN[step.degree] ?? '?'}
                  </span>
                  {step.beats > 1 && (
                    <span className="song-guide-step-beats">{step.beats}b</span>
                  )}
                </button>
              ))}
            </div>
            {/* Current step detail */}
            <div className="song-guide-current">
              <span className="song-guide-current-degree">
                Degree {ROMAN[activeSong.chords[guideStep]?.degree ?? 0]}
              </span>
              <span className="song-guide-current-hand">
                ✋ {FINGER_HINT[activeSong.chords[guideStep]?.degree ?? 0]}
              </span>
              <div className="song-guide-nav">
                <button
                  className="song-guide-nav-btn"
                  onClick={() => setGuideStep((s) => Math.max(0, s - 1))}
                  disabled={guideStep === 0}
                >←</button>
                <span className="song-guide-nav-pos">
                  {guideStep + 1} / {activeSong.chords.length}
                </span>
                <button
                  className="song-guide-nav-btn"
                  onClick={() => setGuideStep((s) => Math.min(activeSong.chords.length - 1, s + 1))}
                  disabled={guideStep === activeSong.chords.length - 1}
                >→</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Song list grouped by difficulty ─────────────────────── */}
        <div className="song-list-scroll">
          {DIFFICULTIES.map((diff) => {
            const group = SONGS.filter((s) => s.difficulty === diff);
            if (group.length === 0) return null;
            return (
              <div key={diff} className="song-group">
                <div className="song-group-label" style={{ color: DIFFICULTY_COLOR[diff] }}>
                  {DIFFICULTY_LABEL[diff]}
                </div>
                {group.map((song) => {
                  const isActive = song.id === activeSongId;
                  const isExpanded = song.id === expandedId;
                  return (
                    <div
                      key={song.id}
                      className={`song-item${isActive ? ' song-item--active' : ''}`}
                    >
                      <button
                        className="song-item-header"
                        onClick={() => setExpandedId(isExpanded ? null : song.id)}
                        aria-expanded={isExpanded}
                      >
                        <span className="song-item-info">
                          <span className="song-item-title">{song.title}</span>
                          <span className="song-item-desc">{song.description}</span>
                        </span>
                        <span className="song-item-right">
                          <span className="song-item-key">
                            {keyName(song.keyOffset)} {song.scaleMode === 'minor' ? 'm' : ''}
                          </span>
                          <span className="song-item-chevron">{isExpanded ? '▲' : '▼'}</span>
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="song-item-body">
                          <div className="song-item-detail-row">
                            <span>🎵 {song.bpm} BPM</span>
                            <span>
                              {song.chords.length} chord steps
                            </span>
                            <span style={{ color: DIFFICULTY_COLOR[song.difficulty] }}>
                              {DIFFICULTY_LABEL[song.difficulty]}
                            </span>
                          </div>
                          <div className="song-item-chord-preview">
                            {song.chords.slice(0, 12).map((step, i) => (
                              <span key={i} className="song-chord-chip">
                                {ROMAN[step.degree]}
                              </span>
                            ))}
                            {song.chords.length > 12 && (
                              <span className="song-chord-chip song-chord-more">
                                +{song.chords.length - 12}
                              </span>
                            )}
                          </div>
                          <button
                            className={`song-play-btn${isActive ? ' song-play-btn--active' : ''}`}
                            onClick={() => handlePlay(song)}
                          >
                            {isActive ? '● Playing' : '▶ Play'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

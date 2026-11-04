/**
 * Guided song list — fully free, no Pro lock.
 *
 * Each song defines:
 *  - id, title, description, difficulty
 *  - keyOffset: which key to set (index into KEYS array, 0=C … 11=B)
 *  - scaleMode: 'major' | 'minor'
 *  - chords: the chord sequence as degree indices (0–6, matching DIATONIC_CHORDS)
 *  - bpm: suggested tempo
 *  - tip: a one-line playing tip shown in the panel
 *
 * The "Play" button loads the song settings (key + scale) into the synth
 * and shows the chord sequence so the player can follow along.
 */

export type Difficulty = 'beginner' | 'easy' | 'intermediate' | 'advanced';

export interface GuidedChordStep {
  /** Degree index 0–6 (maps to DIATONIC_CHORDS / DIATONIC_CHORDS_MINOR) */
  degree: number;
  /** Number of beats to hold this chord */
  beats: number;
  /** Optional label override (e.g. "I", "IV") — auto-computed if omitted */
  label?: string;
}

export interface GuidedSong {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  keyOffset: number;   // 0=C, 2=D, 4=E, 5=F, 7=G, 9=A, 11=B
  scaleMode: 'major' | 'minor';
  bpm: number;
  /** Time signature numerator (beats per bar) */
  beatsPerBar: number;
  chords: GuidedChordStep[];
  tip: string;
}

export const SONGS: GuidedSong[] = [
  // ─── Beginner ────────────────────────────────────────────────────────
  {
    id: 'twinkle-twinkle',
    title: 'Twinkle Twinkle',
    description: 'Your first guided piece — 7 notes, follow the hand',
    difficulty: 'beginner',
    keyOffset: 0,  // C major
    scaleMode: 'major',
    bpm: 80,
    beatsPerBar: 4,
    chords: [
      { degree: 0, beats: 2 },  // I
      { degree: 0, beats: 2 },  // I
      { degree: 4, beats: 2 },  // V
      { degree: 4, beats: 2 },  // V
      { degree: 5, beats: 2 },  // vi
      { degree: 5, beats: 2 },  // vi
      { degree: 4, beats: 4 },  // V (hold)
      { degree: 3, beats: 2 },  // IV
      { degree: 3, beats: 2 },  // IV
      { degree: 2, beats: 2 },  // iii
      { degree: 2, beats: 2 },  // iii
      { degree: 1, beats: 2 },  // ii
      { degree: 1, beats: 2 },  // ii
      { degree: 0, beats: 4 },  // I (hold)
    ],
    tip: 'Raise 1 finger for I, 5 for V, then 6 (Index+Pinky) for vi',
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    description: 'Staircase line — climb up, walk back down',
    difficulty: 'beginner',
    keyOffset: 0,  // C major
    scaleMode: 'major',
    bpm: 90,
    beatsPerBar: 4,
    chords: [
      { degree: 0, beats: 2 },  // I
      { degree: 0, beats: 2 },  // I
      { degree: 1, beats: 2 },  // ii
      { degree: 2, beats: 2 },  // iii
      { degree: 2, beats: 2 },  // iii
      { degree: 1, beats: 2 },  // ii
      { degree: 0, beats: 2 },  // I
      { degree: 4, beats: 2 },  // V
      { degree: 3, beats: 2 },  // IV
      { degree: 3, beats: 2 },  // IV
      { degree: 4, beats: 2 },  // V
      { degree: 0, beats: 4 },  // I (hold)
    ],
    tip: 'Stay slow — listen for the step motion between degrees',
  },

  // ─── Easy ─────────────────────────────────────────────────────────────
  {
    id: 'hot-cross-buns',
    title: 'Hot Cross Buns',
    description: '3-note pattern, the easiest piece here',
    difficulty: 'easy',
    keyOffset: 0,  // C major
    scaleMode: 'major',
    bpm: 90,
    beatsPerBar: 4,
    chords: [
      { degree: 2, beats: 2 },  // iii
      { degree: 1, beats: 2 },  // ii
      { degree: 0, beats: 4 },  // I
      { degree: 2, beats: 2 },  // iii
      { degree: 1, beats: 2 },  // ii
      { degree: 0, beats: 4 },  // I
      { degree: 0, beats: 1 },  // I
      { degree: 0, beats: 1 },  // I
      { degree: 0, beats: 1 },  // I
      { degree: 0, beats: 1 },  // I
      { degree: 1, beats: 1 },  // ii
      { degree: 1, beats: 1 },  // ii
      { degree: 1, beats: 1 },  // ii
      { degree: 1, beats: 1 },  // ii
      { degree: 2, beats: 2 },  // iii
      { degree: 1, beats: 2 },  // ii
      { degree: 0, beats: 4 },  // I
    ],
    tip: 'The rapid I-I-I-I-ii-ii-ii-ii riff is the fun part — try arpeggiator mode!',
  },
  {
    id: 'three-blind-mice',
    title: 'Three Blind Mice',
    description: 'Five notes, one drop at a time',
    difficulty: 'easy',
    keyOffset: 0,  // C major
    scaleMode: 'major',
    bpm: 85,
    beatsPerBar: 3,
    chords: [
      { degree: 2, beats: 1 },  // iii
      { degree: 1, beats: 1 },  // ii
      { degree: 0, beats: 1 },  // I
      { degree: 2, beats: 1 },
      { degree: 1, beats: 1 },
      { degree: 0, beats: 1 },
      { degree: 4, beats: 2 },  // V
      { degree: 4, beats: 1 },
      { degree: 3, beats: 2 },  // IV
      { degree: 3, beats: 1 },
      { degree: 2, beats: 2 },  // iii
      { degree: 1, beats: 1 },  // ii
      { degree: 0, beats: 3 },  // I
    ],
    tip: 'Count in 3 — "one two three" per bar helps keep the stepping steady',
  },
  {
    id: 'mary-had-a-little-lamb',
    title: 'Mary Had a Little Lamb',
    description: 'Four short phrases — the one everybody knows',
    difficulty: 'easy',
    keyOffset: 0,  // C major
    scaleMode: 'major',
    bpm: 95,
    beatsPerBar: 4,
    chords: [
      { degree: 2, beats: 1 }, { degree: 1, beats: 1 }, { degree: 0, beats: 1 }, { degree: 1, beats: 1 },
      { degree: 2, beats: 1 }, { degree: 2, beats: 1 }, { degree: 2, beats: 2 },
      { degree: 1, beats: 1 }, { degree: 1, beats: 1 }, { degree: 1, beats: 2 },
      { degree: 2, beats: 1 }, { degree: 4, beats: 1 }, { degree: 4, beats: 2 },
      { degree: 2, beats: 1 }, { degree: 1, beats: 1 }, { degree: 0, beats: 1 }, { degree: 1, beats: 1 },
      { degree: 2, beats: 1 }, { degree: 2, beats: 1 }, { degree: 2, beats: 1 }, { degree: 2, beats: 1 },
      { degree: 1, beats: 1 }, { degree: 1, beats: 1 }, { degree: 2, beats: 1 }, { degree: 1, beats: 1 },
      { degree: 0, beats: 4 },
    ],
    tip: 'The iii-ii-I-ii opening is the same as Hot Cross Buns — use that muscle memory',
  },

  // ─── Intermediate ────────────────────────────────────────────────────
  {
    id: 'frere-jacques',
    title: 'Frère Jacques',
    description: 'Two halves that answer each other',
    difficulty: 'intermediate',
    keyOffset: 5,  // F major
    scaleMode: 'major',
    bpm: 100,
    beatsPerBar: 4,
    chords: [
      { degree: 0, beats: 1 }, { degree: 1, beats: 1 }, { degree: 2, beats: 1 }, { degree: 0, beats: 1 },
      { degree: 0, beats: 1 }, { degree: 1, beats: 1 }, { degree: 2, beats: 1 }, { degree: 0, beats: 1 },
      { degree: 2, beats: 1 }, { degree: 3, beats: 1 }, { degree: 4, beats: 2 },
      { degree: 2, beats: 1 }, { degree: 3, beats: 1 }, { degree: 4, beats: 2 },
      { degree: 4, beats: 1 }, { degree: 5, beats: 1 }, { degree: 4, beats: 1 }, { degree: 3, beats: 1 },
      { degree: 2, beats: 2 }, { degree: 0, beats: 2 },
      { degree: 4, beats: 1 }, { degree: 5, beats: 1 }, { degree: 4, beats: 1 }, { degree: 3, beats: 1 },
      { degree: 2, beats: 2 }, { degree: 0, beats: 2 },
      { degree: 0, beats: 2 }, { degree: 3, beats: 2 },
      { degree: 0, beats: 4 },
    ],
    tip: 'Switched to F major for a warmer tone — the patterns are the same as C',
  },
  {
    id: 'london-bridge',
    title: 'London Bridge',
    description: 'A full turnaround — I jumps back up',
    difficulty: 'intermediate',
    keyOffset: 7,  // G major
    scaleMode: 'major',
    bpm: 110,
    beatsPerBar: 4,
    chords: [
      { degree: 0, beats: 2 }, { degree: 4, beats: 2 },
      { degree: 4, beats: 2 }, { degree: 0, beats: 2 },
      { degree: 0, beats: 2 }, { degree: 3, beats: 2 },
      { degree: 4, beats: 2 }, { degree: 0, beats: 2 },
      { degree: 0, beats: 1 }, { degree: 1, beats: 1 }, { degree: 2, beats: 1 }, { degree: 3, beats: 1 },
      { degree: 4, beats: 2 }, { degree: 4, beats: 2 },
      { degree: 0, beats: 2 }, { degree: 4, beats: 2 },
      { degree: 0, beats: 4 },
    ],
    tip: 'In G major — finger 1 = G, finger 5 = D. The I-IV-V-I turnaround is the core',
  },

  // ─── Advanced ────────────────────────────────────────────────────────
  {
    id: 'row-row-row',
    title: 'Row, Row, Row Your Boat',
    description: 'Rolling rhythm — steady, then the long "merrily"',
    difficulty: 'advanced',
    keyOffset: 0,  // C major
    scaleMode: 'major',
    bpm: 120,
    beatsPerBar: 3,
    chords: [
      { degree: 0, beats: 3 },
      { degree: 0, beats: 2 }, { degree: 2, beats: 1 },
      { degree: 2, beats: 2 }, { degree: 1, beats: 1 },
      { degree: 1, beats: 2 }, { degree: 3, beats: 1 },
      { degree: 3, beats: 1 }, { degree: 2, beats: 1 }, { degree: 1, beats: 1 },
      { degree: 4, beats: 3 },
      { degree: 0, beats: 1 }, { degree: 0, beats: 1 }, { degree: 0, beats: 1 },
      { degree: 4, beats: 1 }, { degree: 4, beats: 1 }, { degree: 4, beats: 1 },
      { degree: 3, beats: 1 }, { degree: 3, beats: 1 }, { degree: 3, beats: 1 },
      { degree: 2, beats: 1 }, { degree: 2, beats: 1 }, { degree: 2, beats: 1 },
      { degree: 4, beats: 1 }, { degree: 3, beats: 1 }, { degree: 2, beats: 1 },
      { degree: 0, beats: 3 },
    ],
    tip: 'Count in 3 — enable Auto Bass for a rich rowing feel',
  },
  {
    id: 'when-the-saints',
    title: 'When the Saints Go Marching In',
    description: 'Old-time feel and a three-note climb with drama',
    difficulty: 'advanced',
    keyOffset: 0,  // C major
    scaleMode: 'major',
    bpm: 130,
    beatsPerBar: 4,
    chords: [
      { degree: 0, beats: 1 }, { degree: 0, beats: 1 }, { degree: 0, beats: 1 }, { degree: 2, beats: 1 },
      { degree: 3, beats: 3 }, { degree: 2, beats: 1 },
      { degree: 0, beats: 3 }, { degree: 2, beats: 1 },
      { degree: 4, beats: 4 },
      { degree: 0, beats: 1 }, { degree: 0, beats: 1 }, { degree: 0, beats: 1 }, { degree: 2, beats: 1 },
      { degree: 3, beats: 3 }, { degree: 2, beats: 1 },
      { degree: 0, beats: 2 }, { degree: 4, beats: 1 }, { degree: 3, beats: 1 },
      { degree: 0, beats: 4 },
      { degree: 3, beats: 2 }, { degree: 3, beats: 2 },
      { degree: 3, beats: 2 }, { degree: 0, beats: 2 },
      { degree: 2, beats: 2 }, { degree: 2, beats: 2 },
      { degree: 4, beats: 4 },
      { degree: 0, beats: 1 }, { degree: 3, beats: 1 }, { degree: 3, beats: 1 }, { degree: 2, beats: 1 },
      { degree: 0, beats: 2 }, { degree: 4, beats: 2 },
      { degree: 0, beats: 4 },
    ],
    tip: 'The I-I-I-iii jump is the signature move — arpeggiator makes it march',
  },
  {
    id: 'minor-groove',
    title: 'Minor Groove',
    description: 'Natural minor, moody four-bar loop',
    difficulty: 'intermediate',
    keyOffset: 9,  // A minor
    scaleMode: 'minor',
    bpm: 95,
    beatsPerBar: 4,
    chords: [
      { degree: 0, beats: 2 }, { degree: 5, beats: 2 },  // i  → VI
      { degree: 3, beats: 2 }, { degree: 6, beats: 2 },  // iv → VII
      { degree: 0, beats: 2 }, { degree: 5, beats: 2 },  // i  → VI
      { degree: 4, beats: 2 }, { degree: 0, beats: 2 },  // v  → i
    ],
    tip: 'Switch to Natural Minor in Settings first — the scale changes everything',
  },
  {
    id: 'pachelbel-inspired',
    title: 'Canon in D (simplified)',
    description: 'The famous I-V-vi-iii-IV-I-IV-V loop',
    difficulty: 'advanced',
    keyOffset: 2,  // D major
    scaleMode: 'major',
    bpm: 70,
    beatsPerBar: 4,
    chords: [
      { degree: 0, beats: 2 }, { degree: 4, beats: 2 },  // I - V
      { degree: 5, beats: 2 }, { degree: 2, beats: 2 },  // vi - iii
      { degree: 3, beats: 2 }, { degree: 0, beats: 2 },  // IV - I
      { degree: 3, beats: 2 }, { degree: 4, beats: 2 },  // IV - V
      // repeat
      { degree: 0, beats: 2 }, { degree: 4, beats: 2 },
      { degree: 5, beats: 2 }, { degree: 2, beats: 2 },
      { degree: 3, beats: 2 }, { degree: 0, beats: 2 },
      { degree: 3, beats: 2 }, { degree: 4, beats: 2 },
    ],
    tip: 'In D major at 70 BPM — enable Arpeggiator for the classic cascading feel',
  },
];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: 'Beginner',
  easy: 'Easy',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  beginner: '#4ade80',
  easy: '#60a5fa',
  intermediate: '#fbbf24',
  advanced: '#f87171',
};

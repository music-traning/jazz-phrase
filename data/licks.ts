// src/data/licks.ts

// --- 型定義 ---
export type PhraseNote = { key: string; duration: string; str: number; fret: number; role: string };
export type Lick = { id: string; notes: PhraseNote[]; level: number; tags: string[] };
export type SavedPhrase = { id: number; title: string; notes: PhraseNote[]; description: string; tempo: number };
export type Lang = 'ja' | 'en';

export type GuitaristProfile = {
  tags            : string[];       // 既存タグ（後方互換）
  tempoAffinity   : number;        // 速弾き傾向 0.0〜1.0
  restDensity     : number;        // 休符多用度 0.0〜1.0
  octaveRange     : [number, number]; // 好む音域（オクターブ）
  swingStrength   : number;        // スウィング感 0.0〜1.0
  chromaticTaste  : number;        // 半音アプローチ傾向 0.0〜1.0
  approachDir     : 'above'|'below'|'both'; // 目標音への接近方向
};
// --- キーごとのオフセット値 ---
// フレット計算がマイナスになって破綻するのを防ぐため、Bb Majorは10に設定しています。
export const KEY_OFFSETS: Record<string, number> = {
  'C Major': 0,
  'F Major': 5,
  'Bb Major': 10, 
  'Eb Major': 3,
};

// --- ヘルパー関数（このファイル内でのみ使用） ---
const n = (key: string, dur: string, str: number, fret: number, role: string): PhraseNote => ({ key, duration: dur, str, fret, role });

const r = (dur: string): PhraseNote => ({ key: 'b/4', duration: dur + 'r', str: 3, fret: 0, role: 'Rest' });

// --- ギタリストデータ ---
export const LEGENDARY_GUITARISTS = [
  "Allan Holdsworth", "Barney Kessel", "Bill Frisell", "Charlie Christian", "Django Reinhardt",
  "Ed Bickert", "George Benson", "Gilad Hekselman", "Grant Green", "Herb Ellis",
  "Jim Hall", "Joe Pass", "John McLaughlin", "John Scofield", "Julian Lage",
  "Kenny Burrell", "Kurt Rosenwinkel", "Lenny Breau", "Mike Stern", "Pasquale Grasso",
  "Pat Metheny", "Peter Bernstein", "Tal Farlow", "Toshiki Nunokawa (布川俊樹)", "Wes Montgomery"
];

export const GUITARIST_PREFERENCES: Record<string, GuitaristProfile> = {
  "Allan Holdsworth": { tags: ['altered', 'scalar', 'fast', 'bebop'], tempoAffinity: 0.95, restDensity: 0.05, octaveRange: [4, 6], swingStrength: 0.50, chromaticTaste: 0.40, approachDir: 'both' },
  "Barney Kessel": { tags: ['bluesy', 'bebop', 'standard'], tempoAffinity: 0.60, restDensity: 0.15, octaveRange: [3, 5], swingStrength: 0.70, chromaticTaste: 0.50, approachDir: 'below' },
  "Bill Frisell": { tags: ['standard', 'scalar', 'lydian'], tempoAffinity: 0.40, restDensity: 0.30, octaveRange: [3, 5], swingStrength: 0.50, chromaticTaste: 0.30, approachDir: 'both' },
  "Charlie Christian": { tags: ['arpeggio', 'standard', 'bebop'], tempoAffinity: 0.65, restDensity: 0.10, octaveRange: [3, 5], swingStrength: 0.75, chromaticTaste: 0.45, approachDir: 'below' },
  "Django Reinhardt": { tags: ['arpeggio', 'fast', 'bebop'], tempoAffinity: 0.90, restDensity: 0.10, octaveRange: [3, 6], swingStrength: 0.80, chromaticTaste: 0.60, approachDir: 'below' },
  "Ed Bickert": { tags: ['standard', 'arpeggio', 'bebop'], tempoAffinity: 0.50, restDensity: 0.20, octaveRange: [3, 5], swingStrength: 0.65, chromaticTaste: 0.35, approachDir: 'below' },
  "George Benson": { tags: ['fast', 'bluesy', 'bebop', 'pentatonic'], tempoAffinity: 0.85, restDensity: 0.10, octaveRange: [3, 6], swingStrength: 0.85, chromaticTaste: 0.55, approachDir: 'below' },
  "Gilad Hekselman": { tags: ['lydian', 'scalar', 'bebop'], tempoAffinity: 0.70, restDensity: 0.20, octaveRange: [3, 6], swingStrength: 0.60, chromaticTaste: 0.35, approachDir: 'both' },
  "Grant Green": { tags: ['bluesy', 'pentatonic', 'standard'], tempoAffinity: 0.55, restDensity: 0.20, octaveRange: [3, 5], swingStrength: 0.60, chromaticTaste: 0.55, approachDir: 'below' },
  "Herb Ellis": { tags: ['bebop', 'standard', 'bluesy'], tempoAffinity: 0.65, restDensity: 0.15, octaveRange: [3, 5], swingStrength: 0.75, chromaticTaste: 0.50, approachDir: 'below' },
  "Jim Hall": { tags: ['standard', 'scalar', 'lydian'], tempoAffinity: 0.45, restDensity: 0.35, octaveRange: [3, 5], swingStrength: 0.55, chromaticTaste: 0.30, approachDir: 'above' },
  "Joe Pass": { tags: ['bebop', 'arpeggio', 'fast'], tempoAffinity: 0.85, restDensity: 0.10, octaveRange: [3, 6], swingStrength: 0.80, chromaticTaste: 0.50, approachDir: 'below' },
  "John McLaughlin": { tags: ['fast', 'altered', 'scalar', 'bebop'], tempoAffinity: 0.98, restDensity: 0.05, octaveRange: [3, 7], swingStrength: 0.60, chromaticTaste: 0.55, approachDir: 'both' },
  "John Scofield": { tags: ['bluesy', 'altered', 'bebop', 'scalar'], tempoAffinity: 0.65, restDensity: 0.25, octaveRange: [3, 6], swingStrength: 0.70, chromaticTaste: 0.60, approachDir: 'below' },
  "Julian Lage": { tags: ['scalar', 'arpeggio', 'bebop', 'lydian'], tempoAffinity: 0.75, restDensity: 0.25, octaveRange: [3, 6], swingStrength: 0.65, chromaticTaste: 0.40, approachDir: 'both' },
  "Kenny Burrell": { tags: ['bluesy', 'standard', 'pentatonic'], tempoAffinity: 0.50, restDensity: 0.20, octaveRange: [3, 5], swingStrength: 0.70, chromaticTaste: 0.55, approachDir: 'below' },
  "Kurt Rosenwinkel": { tags: ['lydian', 'altered', 'scalar'], tempoAffinity: 0.70, restDensity: 0.25, octaveRange: [3, 6], swingStrength: 0.55, chromaticTaste: 0.30, approachDir: 'both' },
  "Lenny Breau": { tags: ['arpeggio', 'lydian', 'scalar'], tempoAffinity: 0.60, restDensity: 0.30, octaveRange: [3, 6], swingStrength: 0.50, chromaticTaste: 0.25, approachDir: 'above' },
  "Mike Stern": { tags: ['fast', 'bluesy', 'pentatonic', 'altered'], tempoAffinity: 0.85, restDensity: 0.10, octaveRange: [3, 6], swingStrength: 0.80, chromaticTaste: 0.60, approachDir: 'below' },
  "Pasquale Grasso": { tags: ['fast', 'bebop', 'arpeggio'], tempoAffinity: 0.95, restDensity: 0.05, octaveRange: [3, 7], swingStrength: 0.85, chromaticTaste: 0.55, approachDir: 'below' },
  "Pat Metheny": { tags: ['lydian', 'fast', 'scalar', 'bebop'], tempoAffinity: 0.80, restDensity: 0.15, octaveRange: [3, 6], swingStrength: 0.65, chromaticTaste: 0.35, approachDir: 'above' },
  "Peter Bernstein": { tags: ['bebop', 'standard', 'arpeggio'], tempoAffinity: 0.60, restDensity: 0.20, octaveRange: [3, 5], swingStrength: 0.75, chromaticTaste: 0.50, approachDir: 'below' },
  "Tal Farlow": { tags: ['fast', 'bebop', 'arpeggio'], tempoAffinity: 0.90, restDensity: 0.10, octaveRange: [3, 6], swingStrength: 0.80, chromaticTaste: 0.50, approachDir: 'below' },
  "Toshiki Nunokawa (布川俊樹)": { tags: ['altered', 'bebop', 'lydian', 'scalar'], tempoAffinity: 0.75, restDensity: 0.15, octaveRange: [3, 6], swingStrength: 0.70, chromaticTaste: 0.45, approachDir: 'both' },
  "Wes Montgomery": { tags: ['arpeggio', 'standard', 'bluesy', 'bebop'], tempoAffinity: 0.70, restDensity: 0.15, octaveRange: [3, 6], swingStrength: 0.80, chromaticTaste: 0.55, approachDir: 'below' },
};

// --- フレーズデータベース ---
// --- フレーズデータベース（超拡充版） ---
// --- フレーズデータベース（鬼の300行超え・究極完全版） ---
export const LICKS_DB: Record<string, Lick[]> = {
  Dm7: [
    // --- Level 1: Beginner (基礎コードトーン・4分音符) ---
    { id: 'dm_l1_1', level: 1, tags: ['standard'], notes: [n('d/4', '4', 5, 5, 'Root'), n('f/4', '4', 4, 3, 'm3rd')] },
    { id: 'dm_l1_2', level: 1, tags: ['standard'], notes: [n('a/4', '4', 3, 2, '5th'), n('c/5', '4', 3, 5, 'm7th')] },
    { id: 'dm_l1_3', level: 1, tags: ['arpeggio'], notes: [n('f/4', '4', 4, 3, 'm3rd'), n('a/4', '4', 3, 2, '5th')] },
    { id: 'dm_l1_4', level: 1, tags: ['standard'], notes: [n('c/5', '4', 3, 5, 'm7th'), n('d/5', '4', 3, 7, 'Root')] },
    { id: 'dm_l1_5', level: 1, tags: ['standard'], notes: [n('f/4', '4', 4, 3, 'm3rd'), n('d/4', '4', 5, 5, 'Root')] },
    { id: 'dm_l1_6', level: 1, tags: ['arpeggio'], notes: [n('a/3', '4', 6, 5, '5th'), n('c/4', '4', 5, 3, 'm7th')] },
    { id: 'dm_l1_7', level: 1, tags: ['standard'], notes: [n('d/4', '4', 5, 5, 'Root'), n('e/4', '4', 5, 7, '9th')] },
    { id: 'dm_l1_8', level: 1, tags: ['standard'], notes: [n('c/5', '4', 3, 5, 'm7th'), n('a/4', '4', 3, 2, '5th')] },
    { id: 'dm_l1_9', level: 1, tags: ['arpeggio'], notes: [n('d/4', '4', 5, 5, 'Root'), n('a/4', '4', 3, 2, '5th')] },
    { id: 'dm_l1_10', level: 1, tags: ['bluesy'], notes: [n('f/4', '4', 4, 3, 'm3rd'), n('g/4', '4', 4, 5, '11th')] },
    { id: 'dm_l1_11', level: 1, tags: ['standard'], notes: [n('a/4', '4', 3, 2, '5th'), n('f/4', '4', 4, 3, 'm3rd')] },
    { id: 'dm_l1_12', level: 1, tags: ['standard'], notes: [n('d/4', '4', 5, 5, 'Root'), n('c/4', '4', 5, 3, 'm7th')] },
    
    // --- Level 2: Intermediate (ビバップ、8分音符、クロマチック、アプローチ) ---
    { id: 'dm_l2_1', level: 2, tags: ['arpeggio'], notes: [n('d/4', '8', 5, 5, 'Root'), n('f/4', '8', 4, 3, 'm3rd'), n('a/4', '8', 3, 2, '5th'), n('c/5', '8', 3, 5, 'm7th')] },
    { id: 'dm_l2_2', level: 2, tags: ['scalar', 'bebop'], notes: [n('f/4', '8', 4, 3, 'm3rd'), n('e/4', '8', 5, 7, '9th'), n('d/4', '8', 5, 5, 'Root'), n('c/4', '8', 5, 3, 'm7th')] },
    { id: 'dm_l2_3', level: 2, tags: ['bebop'], notes: [n('e/4', '8', 5, 7, '9th'), n('f/4', '8', 4, 3, 'm3rd'), n('e/4', '8', 5, 7, '9th'), n('d/4', '8', 5, 5, 'Root')] },
    { id: 'dm_l2_4', level: 2, tags: ['scalar'], notes: [n('c/5', '8', 3, 5, 'm7th'), n('a/4', '8', 3, 2, '5th'), n('g/4', '8', 4, 5, '11th'), n('f/4', '8', 4, 3, 'm3rd')] },
    { id: 'dm_l2_5', level: 2, tags: ['pentatonic', 'bluesy'], notes: [n('f/4', '8', 4, 3, 'm3rd'), n('d/4', '8', 5, 5, 'Root'), n('c/4', '8', 5, 3, 'm7th'), n('a/3', '8', 6, 5, '5th')] },
    { id: 'dm_l2_6', level: 2, tags: ['bebop', 'scalar'], notes: [n('a/4', '8', 3, 2, '5th'), n('g/4', '8', 4, 5, '11th'), n('f/4', '8', 4, 3, 'm3rd'), n('e/4', '8', 5, 7, '9th')] },
    { id: 'dm_l2_7', level: 2, tags: ['bebop', 'standard'], notes: [n('c/4', '8', 5, 3, 'm7th'), n('db/4', '8', 5, 4, 'Passing'), n('d/4', '8', 5, 5, 'Root'), n('f/4', '8', 4, 3, 'm3rd')] },
    { id: 'dm_l2_8', level: 2, tags: ['arpeggio', 'modern'], notes: [n('f/4', '8', 4, 3, 'm3rd'), n('a/4', '8', 3, 2, '5th'), n('c/5', '8', 3, 5, 'm7th'), n('e/5', '8', 2, 5, '9th')] },
    { id: 'dm_l2_9', level: 2, tags: ['scalar', 'coltrane'], notes: [n('d/4', '8', 5, 5, 'Root'), n('e/4', '8', 5, 7, '9th'), n('f/4', '8', 4, 3, 'm3rd'), n('a/4', '8', 3, 2, '5th')] },
    { id: 'dm_l2_10', level: 2, tags: ['bebop'], notes: [n('g/4', '8', 4, 5, '11th'), n('gb/4', '8', 4, 4, 'Passing'), n('f/4', '8', 4, 3, 'm3rd'), n('d/4', '8', 5, 5, 'Root')] },
    { id: 'dm_l2_11', level: 2, tags: ['arpeggio'], notes: [n('a/4', '8', 3, 2, '5th'), n('f/4', '8', 4, 3, 'm3rd'), n('d/4', '8', 5, 5, 'Root'), n('c/4', '8', 5, 3, 'm7th')] },
    { id: 'dm_l2_12', level: 2, tags: ['pentatonic', 'bluesy'], notes: [n('d/4', '8', 5, 5, 'Root'), n('f/4', '8', 4, 3, 'm3rd'), n('g/4', '8', 4, 5, '11th'), n('a/4', '8', 3, 2, '5th')] },
    { id: 'dm_l2_13', level: 2, tags: ['bebop', 'scalar'], notes: [n('e/4', '8', 5, 7, '9th'), n('d/4', '8', 5, 5, 'Root'), n('c/4', '8', 5, 3, 'm7th'), n('a/3', '8', 6, 5, '5th')] },
    { id: 'dm_l2_14', level: 2, tags: ['standard', 'arpeggio'], notes: [n('f/4', '8', 4, 3, 'm3rd'), n('d/4', '8', 5, 5, 'Root'), n('a/3', '8', 6, 5, '5th'), n('f/3', '8', 6, 1, 'm3rd')] },
    { id: 'dm_l2_15', level: 2, tags: ['modern', 'scalar'], notes: [n('d/4', '8', 5, 5, 'Root'), n('c/4', '8', 5, 3, 'm7th'), n('b/3', '8', 5, 2, '13th'), n('a/3', '8', 6, 5, '5th')] }, // ドリアン強調
    { id: 'dm_l2_16', level: 2, tags: ['bluesy'], notes: [n('ab/4', '8', 4, 6, 'BlueNote'), n('g/4', '8', 4, 5, '11th'), n('f/4', '8', 4, 3, 'm3rd'), n('d/4', '8', 5, 5, 'Root')] },
    { id: 'dm_l2_17', level: 2, tags: ['bebop'], notes: [n('a/4', '8', 3, 2, '5th'), n('ab/4', '8', 4, 6, 'Passing'), n('g/4', '8', 4, 5, '11th'), n('f/4', '8', 4, 3, 'm3rd')] },
    { id: 'dm_l2_18', level: 2, tags: ['arpeggio'], notes: [n('c/5', '8', 3, 5, 'm7th'), n('a/4', '8', 3, 2, '5th'), n('f/4', '8', 4, 3, 'm3rd'), n('d/4', '8', 5, 5, 'Root')] },
    { id: 'dm_l2_rest1', level: 2, tags: ['bebop', 'syncopation'], notes: [r('8'), n('f/4', '8', 4, 3, 'm3rd'), n('e/4', '8', 5, 7, '9th'), n('d/4', '8', 5, 5, 'Root')] },
    { id: 'dm_l2_rest2', level: 2, tags: ['standard'], notes: [n('d/4', '8', 5, 5, 'Root'), n('f/4', '8', 4, 3, 'm3rd'), r('8'), n('a/4', '8', 3, 2, '5th')] },
   
    // --- Level 3: Advanced (16分音符、複雑なエンクロージャー、速いパッセージ) ---
    { id: 'dm_l3_1', level: 3, tags: ['fast', 'scalar'], notes: [n('d/4', '16', 5, 5, 'Root'), n('e/4', '16', 5, 7, '9th'), n('f/4', '16', 4, 3, 'm3rd'), n('g/4', '16', 4, 5, '11th'), n('a/4', '8', 3, 2, '5th'), n('c/5', '8', 3, 5, 'm7th')] },
    { id: 'dm_l3_2', level: 3, tags: ['fast', 'bebop'], notes: [n('c/5', '16', 3, 5, 'm7th'), n('a/4', '16', 3, 2, '5th'), n('f/4', '16', 4, 3, 'm3rd'), n('d/4', '16', 5, 5, 'Root'), n('e/4', '8', 5, 7, '9th'), n('f/4', '8', 4, 3, 'm3rd')] },
    { id: 'dm_l3_3', level: 3, tags: ['fast', 'bebop', 'arpeggio'], notes: [n('e/4', '16', 5, 7, '9th'), n('f/4', '16', 4, 3, 'm3rd'), n('a/4', '16', 3, 2, '5th'), n('c/5', '16', 3, 5, 'm7th'), n('d/5', '8', 3, 7, 'Root'), n('a/4', '8', 3, 2, '5th')] },
    { id: 'dm_l3_4', level: 3, tags: ['fast', 'scalar'], notes: [n('a/4', '16', 3, 2, '5th'), n('g/4', '16', 4, 5, '11th'), n('f/4', '16', 4, 3, 'm3rd'), n('e/4', '16', 4, 2, '9th'), n('d/4', '16', 5, 5, 'Root'), n('c/4', '16', 5, 3, 'm7th'), n('a/3', '8', 6, 5, '5th')] },
    { id: 'dm_l3_5', level: 3, tags: ['fast', 'bebop'], notes: [n('f/4', '16', 4, 3, 'm3rd'), n('ab/4', '16', 3, 1, 'Passing'), n('a/4', '16', 3, 2, '5th'), n('c/5', '16', 3, 5, 'm7th'), n('b/4', '16', 3, 4, 'Passing'), n('c/5', '16', 3, 5, 'm7th'), n('a/4', '8', 3, 2, '5th')] },
    { id: 'dm_l3_6', level: 3, tags: ['fast', 'coltrane'], notes: [n('d/4', '16', 5, 5, 'Root'), n('e/4', '16', 5, 7, '9th'), n('f/4', '16', 4, 3, 'm3rd'), n('a/4', '16', 3, 2, '5th'), n('c/5', '16', 3, 5, 'm7th'), n('b/4', '16', 3, 4, '13th'), n('c/5', '8', 3, 5, 'm7th')] },
    { id: 'dm_l3_7', level: 3, tags: ['fast', 'arpeggio'], notes: [n('a/3', '16', 6, 5, '5th'), n('c/4', '16', 5, 3, 'm7th'), n('d/4', '16', 5, 5, 'Root'), n('f/4', '16', 4, 3, 'm3rd'), n('a/4', '8', 3, 2, '5th'), n('g/4', '8', 4, 5, '11th')] },
    { id: 'dm_l3_8', level: 3, tags: ['fast', 'modern'], notes: [n('e/4', '16', 5, 7, '9th'), n('f/4', '16', 4, 3, 'm3rd'), n('g/4', '16', 4, 5, '11th'), n('a/4', '16', 3, 2, '5th'), n('b/4', '16', 3, 4, '13th'), n('c/5', '16', 3, 5, 'm7th'), n('d/5', '8', 3, 7, 'Root')] },
    { id: 'dm_l3_9', level: 3, tags: ['fast', 'bebop'], notes: [n('c/5', '16', 3, 5, 'm7th'), n('b/4', '16', 3, 4, 'Passing'), n('c/5', '16', 3, 5, 'm7th'), n('a/4', '16', 3, 2, '5th'), n('g/4', '8', 4, 5, '11th'), n('f/4', '8', 4, 3, 'm3rd')] },
    { id: 'dm_l3_10', level: 3, tags: ['fast', 'bluesy'], notes: [n('d/4', '16', 5, 5, 'Root'), n('f/4', '16', 4, 3, 'm3rd'), n('g/4', '16', 4, 5, '11th'), n('ab/4', '16', 4, 6, 'BlueNote'), n('a/4', '8', 3, 2, '5th'), n('c/5', '8', 3, 5, 'm7th')] },
    { id: 'dm_l3_rest1', level: 3, tags: ['fast', 'bebop'], notes: [r('16'), n('e/4', '16', 5, 7, '9th'), n('f/4', '16', 4, 3, 'm3rd'), n('g/4', '16', 4, 5, '11th'), n('a/4', '8', 3, 2, '5th'), r('8')] },
    ],
  G7: [
    // --- Level 1: Beginner ---
    { id: 'g7_l1_1', level: 1, tags: ['standard'], notes: [n('b/4', '4', 3, 4, '3rd'), n('g/4', '4', 4, 5, 'Root')] },
    { id: 'g7_l1_2', level: 1, tags: ['standard'], notes: [n('f/4', '4', 4, 3, 'm7th'), n('d/4', '4', 5, 5, '5th')] },
    { id: 'g7_l1_3', level: 1, tags: ['standard'], notes: [n('g/4', '4', 4, 5, 'Root'), n('b/4', '4', 3, 4, '3rd')] },
    { id: 'g7_l1_4', level: 1, tags: ['arpeggio'], notes: [n('d/4', '4', 5, 5, '5th'), n('f/4', '4', 4, 3, 'm7th')] },
    { id: 'g7_l1_5', level: 1, tags: ['standard'], notes: [n('f/4', '4', 4, 3, 'm7th'), n('e/4', '4', 4, 2, '13th')] },
    { id: 'g7_l1_6', level: 1, tags: ['arpeggio'], notes: [n('b/3', '4', 5, 2, '3rd'), n('d/4', '4', 5, 5, '5th')] },
    { id: 'g7_l1_7', level: 1, tags: ['standard'], notes: [n('g/4', '4', 4, 5, 'Root'), n('f/4', '4', 4, 3, 'm7th')] },
    { id: 'g7_l1_8', level: 1, tags: ['standard'], notes: [n('d/4', '4', 5, 5, '5th'), n('b/3', '4', 5, 2, '3rd')] },
    { id: 'g7_l1_9', level: 1, tags: ['altered'], notes: [n('ab/4', '4', 4, 6, 'b9th'), n('g/4', '4', 4, 5, 'Root')] },
    { id: 'g7_l1_10', level: 1, tags: ['altered'], notes: [n('eb/4', '4', 5, 6, '#5th'), n('d/4', '4', 5, 5, '5th')] },
    { id: 'g7_l1_11', level: 1, tags: ['standard'], notes: [n('b/4', '4', 3, 4, '3rd'), n('d/5', '4', 3, 7, '5th')] },
    { id: 'g7_l1_12', level: 1, tags: ['arpeggio'], notes: [n('f/4', '4', 4, 3, 'm7th'), n('g/4', '4', 4, 5, 'Root')] },

    // --- Level 2: Intermediate (オルタード、コンディミ、裏コード) ---
    { id: 'g7_l2_1', level: 2, tags: ['bebop', 'standard'], notes: [n('b/4', '8', 3, 4, '3rd'), n('a/4', '8', 3, 2, '9th'), n('g/4', '8', 4, 5, 'Root'), n('f/4', '8', 4, 3, 'm7th')] },
    { id: 'g7_l2_2', level: 2, tags: ['altered'], notes: [n('ab/4', '8', 4, 6, 'b9th'), n('g/4', '8', 4, 5, 'Root'), n('f/4', '8', 4, 3, 'm7th'), n('eb/4', '8', 5, 6, '#5th')] },
    { id: 'g7_l2_3', level: 2, tags: ['altered'], notes: [n('bb/4', '8', 3, 3, '#9th'), n('ab/4', '8', 4, 6, 'b9th'), n('g/4', '8', 4, 5, 'Root'), n('b/3', '8', 5, 2, '3rd')] },
    { id: 'g7_l2_4', level: 2, tags: ['bluesy', 'pentatonic'], notes: [n('f/4', '8', 4, 3, 'm7th'), n('d/4', '8', 5, 5, '5th'), n('bb/3', '8', 5, 1, '#9th'), n('b/3', '8', 5, 2, '3rd')] },
    { id: 'g7_l2_5', level: 2, tags: ['bebop', 'scalar'], notes: [n('f/4', '8', 4, 3, 'm7th'), n('e/4', '8', 4, 2, '13th'), n('eb/4', '8', 5, 6, 'Passing'), n('d/4', '8', 5, 5, '5th')] },
    { id: 'g7_l2_6', level: 2, tags: ['altered', 'arpeggio'], notes: [n('ab/4', '8', 4, 6, 'b9th'), n('f/4', '8', 4, 3, 'm7th'), n('eb/4', '8', 5, 6, '#5th'), n('b/3', '8', 5, 2, '3rd')] },
    { id: 'g7_l2_7', level: 2, tags: ['altered', 'tritone'], notes: [n('db/4', '8', 5, 4, 'b5th'), n('f/4', '8', 4, 3, 'm7th'), n('ab/4', '8', 4, 6, 'b9th'), n('b/4', '8', 3, 4, '3rd')] },
    { id: 'g7_l2_8', level: 2, tags: ['bebop', 'standard'], notes: [n('d/4', '8', 5, 5, '5th'), n('f/4', '8', 4, 3, 'm7th'), n('b/4', '8', 3, 4, '3rd'), n('g/4', '8', 4, 5, 'Root')] },
    { id: 'g7_l2_9', level: 2, tags: ['diminished', 'fast'], notes: [n('bb/4', '8', 3, 3, '#9th'), n('g/4', '8', 4, 5, 'Root'), n('e/4', '8', 4, 2, '13th'), n('db/4', '8', 5, 4, 'b5th')] },
    { id: 'g7_l2_10', level: 2, tags: ['altered', 'bebop'], notes: [n('eb/4', '8', 5, 6, '#5th'), n('d/4', '8', 5, 5, '5th'), n('db/4', '8', 5, 4, 'b5th'), n('b/3', '8', 5, 2, '3rd')] },
    { id: 'g7_l2_11', level: 2, tags: ['bebop'], notes: [n('g/4', '8', 4, 5, 'Root'), n('gb/4', '8', 4, 4, 'Passing'), n('f/4', '8', 4, 3, 'm7th'), n('e/4', '8', 4, 2, '13th')] },
    { id: 'g7_l2_12', level: 2, tags: ['arpeggio'], notes: [n('b/3', '8', 5, 2, '3rd'), n('d/4', '8', 5, 5, '5th'), n('f/4', '8', 4, 3, 'm7th'), n('ab/4', '8', 4, 6, 'b9th')] }, // Bdim7
    { id: 'g7_l2_13', level: 2, tags: ['altered'], notes: [n('bb/4', '8', 3, 3, '#9th'), n('b/4', '8', 3, 4, '3rd'), n('eb/4', '8', 5, 6, '#5th'), n('f/4', '8', 4, 3, 'm7th')] },
    { id: 'g7_l2_14', level: 2, tags: ['scalar', 'standard'], notes: [n('a/4', '8', 3, 2, '9th'), n('g/4', '8', 4, 5, 'Root'), n('f/4', '8', 4, 3, 'm7th'), n('d/4', '8', 5, 5, '5th')] },
    { id: 'g7_l2_15', level: 2, tags: ['diminished'], notes: [n('e/4', '8', 4, 2, '13th'), n('db/4', '8', 5, 4, 'b5th'), n('bb/3', '8', 5, 1, '#9th'), n('g/3', '8', 6, 3, 'Root')] },
    { id: 'g7_l2_16', level: 2, tags: ['altered', 'bebop'], notes: [n('f/4', '8', 4, 3, 'm7th'), n('eb/4', '8', 5, 6, '#5th'), n('db/4', '8', 5, 4, 'b5th'), n('b/3', '8', 5, 2, '3rd')] },
    { id: 'g7_l2_rest1', level: 2, tags: ['altered', 'syncopation'], notes: [r('8'), n('ab/4', '8', 4, 6, 'b9th'), n('g/4', '8', 4, 5, 'Root'), n('f/4', '8', 4, 3, 'm7th')] },
    { id: 'g7_l2_rest2', level: 2, tags: ['bebop'], notes: [n('b/4', '8', 3, 4, '3rd'), n('ab/4', '8', 4, 6, 'b9th'), n('g/4', '8', 4, 5, 'Root'), r('8')] },

    // --- Level 3: Advanced ---
    { id: 'g7_l3_1', level: 3, tags: ['fast', 'altered'], notes: [n('ab/4', '16', 4, 6, 'b9th'), n('g/4', '16', 4, 5, 'Root'), n('f/4', '16', 4, 3, 'm7th'), n('eb/4', '16', 5, 6, '#5th'), n('d/4', '8', 5, 5, '5th'), n('db/4', '8', 5, 4, 'b5th')] },
    { id: 'g7_l3_2', level: 3, tags: ['fast', 'bebop'], notes: [n('b/4', '16', 3, 4, '3rd'), n('a/4', '16', 3, 2, '9th'), n('ab/4', '16', 4, 6, 'b9th'), n('g/4', '16', 4, 5, 'Root'), n('f/4', '8', 4, 3, 'm7th'), n('d/4', '8', 5, 5, '5th')] },
    { id: 'g7_l3_3', level: 3, tags: ['fast', 'altered'], notes: [n('eb/4', '16', 5, 6, '#5th'), n('f/4', '16', 4, 3, 'm7th'), n('g/4', '16', 4, 5, 'Root'), n('ab/4', '16', 4, 6, 'b9th'), n('bb/4', '8', 3, 3, '#9th'), n('ab/4', '8', 4, 6, 'b9th')] },
    { id: 'g7_l3_4', level: 3, tags: ['fast', 'arpeggio', 'diminished'], notes: [n('f/4', '16', 4, 3, 'm7th'), n('d/4', '16', 5, 5, '5th'), n('b/3', '16', 5, 2, '3rd'), n('ab/3', '16', 6, 4, 'b9th'), n('b/3', '8', 5, 2, '3rd'), n('d/4', '8', 5, 5, '5th')] },
    { id: 'g7_l3_5', level: 3, tags: ['fast', 'bebop'], notes: [n('g/4', '16', 4, 5, 'Root'), n('f#/4', '16', 4, 4, 'Passing'), n('f/4', '16', 4, 3, 'm7th'), n('e/4', '16', 4, 2, '13th'), n('eb/4', '16', 5, 6, '#5th'), n('d/4', '16', 5, 5, '5th'), n('b/3', '8', 5, 2, '3rd')] },
    { id: 'g7_l3_6', level: 3, tags: ['fast', 'altered'], notes: [n('b/3', '16', 5, 2, '3rd'), n('db/4', '16', 5, 4, 'b5th'), n('eb/4', '16', 5, 6, '#5th'), n('f/4', '16', 4, 3, 'm7th'), n('g/4', '8', 4, 5, 'Root'), n('ab/4', '8', 4, 6, 'b9th')] },
    { id: 'g7_l3_7', level: 3, tags: ['fast', 'diminished'], notes: [n('ab/4', '16', 4, 6, 'b9th'), n('f/4', '16', 4, 3, 'm7th'), n('d/4', '16', 5, 5, '5th'), n('b/3', '16', 5, 2, '3rd'), n('ab/3', '8', 6, 4, 'b9th'), n('f/3', '8', 6, 1, 'm7th')] },
    { id: 'g7_l3_8', level: 3, tags: ['fast', 'bebop'], notes: [n('a/4', '16', 3, 2, '9th'), n('ab/4', '16', 4, 6, 'b9th'), n('g/4', '16', 4, 5, 'Root'), n('gb/4', '16', 4, 4, 'Passing'), n('f/4', '8', 4, 3, 'm7th'), n('e/4', '8', 4, 2, '13th')] },
    { id: 'g7_l3_9', level: 3, tags: ['fast', 'altered', 'tritone'], notes: [n('f/4', '16', 4, 3, 'm7th'), n('ab/4', '16', 4, 6, 'b9th'), n('b/4', '16', 3, 4, '3rd'), n('db/5', '16', 2, 2, 'b5th'), n('eb/5', '8', 2, 4, '#5th'), n('db/5', '8', 2, 2, 'b5th')] },
    { id: 'g7_l3_10', level: 3, tags: ['fast', 'modern'], notes: [n('eb/4', '16', 5, 6, '#5th'), n('g/4', '16', 4, 5, 'Root'), n('b/4', '16', 3, 4, '3rd'), n('eb/5', '16', 2, 4, '#5th'), n('f/5', '8', 2, 6, 'm7th'), n('eb/5', '8', 2, 4, '#5th')] }, // Ebaug トライアド
    { id: 'g7_l3_rest1', level: 3, tags: ['fast', 'modern'], notes: [n('f/4', '16', 4, 3, 'm7th'), r('16'), n('eb/4', '16', 5, 6, '#5th'), r('16'), n('d/4', '8', 5, 5, '5th'), n('db/4', '8', 5, 4, 'b5th')] },

  ],
  CMaj7: [
    // --- Level 1: Beginner ---
    { id: 'cmaj_l1_1', level: 1, tags: ['standard'], notes: [n('c/4', '4', 5, 3, 'Root'), n('e/4', '4', 4, 2, '3rd')] },
    { id: 'cmaj_l1_2', level: 1, tags: ['standard'], notes: [n('g/4', '4', 4, 5, '5th'), n('e/4', '4', 4, 2, '3rd')] },
    { id: 'cmaj_l1_3', level: 1, tags: ['arpeggio'], notes: [n('e/4', '4', 4, 2, '3rd'), n('g/4', '4', 4, 5, '5th')] },
    { id: 'cmaj_l1_4', level: 1, tags: ['standard'], notes: [n('b/4', '4', 3, 4, 'M7th'), n('c/5', '4', 3, 5, 'Root')] },
    { id: 'cmaj_l1_5', level: 1, tags: ['standard'], notes: [n('c/4', '4', 5, 3, 'Root'), n('d/4', '4', 5, 5, '9th')] },
    { id: 'cmaj_l1_6', level: 1, tags: ['arpeggio'], notes: [n('e/4', '4', 4, 2, '3rd'), n('b/4', '4', 3, 4, 'M7th')] },
    { id: 'cmaj_l1_7', level: 1, tags: ['standard'], notes: [n('e/4', '4', 4, 2, '3rd'), n('c/4', '4', 5, 3, 'Root')] },
    { id: 'cmaj_l1_8', level: 1, tags: ['standard'], notes: [n('b/4', '4', 3, 4, 'M7th'), n('g/4', '4', 4, 5, '5th')] },
    { id: 'cmaj_l1_9', level: 1, tags: ['standard'], notes: [n('g/4', '4', 4, 5, '5th'), n('a/4', '4', 3, 2, '13th')] },
    { id: 'cmaj_l1_10', level: 1, tags: ['arpeggio'], notes: [n('c/4', '4', 5, 3, 'Root'), n('g/4', '4', 4, 5, '5th')] },
    { id: 'cmaj_l1_11', level: 1, tags: ['standard'], notes: [n('d/4', '4', 5, 5, '9th'), n('e/4', '4', 4, 2, '3rd')] },
    { id: 'cmaj_l1_12', level: 1, tags: ['standard'], notes: [n('a/4', '4', 3, 2, '13th'), n('g/4', '4', 4, 5, '5th')] },

    // --- Level 2: Intermediate (代理コードEm7、リディアン、メジャービバップ) ---
    { id: 'cmaj_l2_1', level: 2, tags: ['standard', 'arpeggio'], notes: [n('e/4', '8', 4, 2, '3rd'), n('g/4', '8', 4, 5, '5th'), n('b/4', '8', 3, 4, 'M7th'), n('c/5', '8', 3, 5, 'Root')] },
    { id: 'cmaj_l2_2', level: 2, tags: ['lydian'], notes: [n('e/4', '8', 4, 2, '3rd'), n('gb/4', '8', 4, 4, '#11th'), n('g/4', '8', 4, 5, '5th'), n('a/4', '8', 3, 2, '13th')] },
    { id: 'cmaj_l2_3', level: 2, tags: ['bebop', 'scalar'], notes: [n('f/4', '8', 4, 3, '11th'), n('d/4', '8', 5, 5, '9th'), n('eb/4', '8', 5, 6, 'Passing'), n('e/4', '8', 4, 2, '3rd')] },
    { id: 'cmaj_l2_4', level: 2, tags: ['scalar'], notes: [n('b/4', '8', 3, 4, 'M7th'), n('a/4', '8', 3, 2, '13th'), n('g/4', '8', 4, 5, '5th'), n('e/4', '8', 4, 2, '3rd')] },
    { id: 'cmaj_l2_5', level: 2, tags: ['pentatonic'], notes: [n('a/4', '8', 3, 2, '13th'), n('g/4', '8', 4, 5, '5th'), n('e/4', '8', 4, 2, '3rd'), n('d/4', '8', 5, 5, '9th')] },
    { id: 'cmaj_l2_6', level: 2, tags: ['arpeggio', 'modern'], notes: [n('e/4', '8', 4, 2, '3rd'), n('g/4', '8', 4, 5, '5th'), n('b/4', '8', 3, 4, 'M7th'), n('d/5', '8', 3, 7, '9th')] },
    { id: 'cmaj_l2_7', level: 2, tags: ['bebop'], notes: [n('c/5', '8', 3, 5, 'Root'), n('b/4', '8', 3, 4, 'M7th'), n('a/4', '8', 3, 2, '13th'), n('g/4', '8', 4, 5, '5th')] },
    { id: 'cmaj_l2_8', level: 2, tags: ['bebop', 'standard'], notes: [n('g/4', '8', 4, 5, '5th'), n('ab/4', '8', 4, 6, 'Passing'), n('a/4', '8', 3, 2, '13th'), n('e/4', '8', 4, 2, '3rd')] },
    { id: 'cmaj_l2_9', level: 2, tags: ['lydian', 'scalar'], notes: [n('gb/4', '8', 4, 4, '#11th'), n('g/4', '8', 4, 5, '5th'), n('a/4', '8', 3, 2, '13th'), n('b/4', '8', 3, 4, 'M7th')] },
    { id: 'cmaj_l2_10', level: 2, tags: ['arpeggio'], notes: [n('c/4', '8', 5, 3, 'Root'), n('e/4', '8', 4, 2, '3rd'), n('g/4', '8', 4, 5, '5th'), n('b/4', '8', 3, 4, 'M7th')] },
    { id: 'cmaj_l2_11', level: 2, tags: ['bebop', 'scalar'], notes: [n('e/4', '8', 4, 2, '3rd'), n('f/4', '8', 4, 3, '11th'), n('g/4', '8', 4, 5, '5th'), n('e/4', '8', 4, 2, '3rd')] },
    { id: 'cmaj_l2_12', level: 2, tags: ['modern', 'arpeggio'], notes: [n('b/4', '8', 3, 4, 'M7th'), n('g/4', '8', 4, 5, '5th'), n('e/4', '8', 4, 2, '3rd'), n('d/4', '8', 5, 5, '9th')] },
    { id: 'cmaj_l2_13', level: 2, tags: ['lydian'], notes: [n('d/4', '8', 5, 5, '9th'), n('e/4', '8', 4, 2, '3rd'), n('gb/4', '8', 4, 4, '#11th'), n('g/4', '8', 4, 5, '5th')] },
    { id: 'cmaj_l2_14', level: 2, tags: ['pentatonic'], notes: [n('c/4', '8', 5, 3, 'Root'), n('d/4', '8', 5, 5, '9th'), n('e/4', '8', 4, 2, '3rd'), n('g/4', '8', 4, 5, '5th')] },
    { id: 'cmaj_l2_15', level: 2, tags: ['bebop'], notes: [n('g/4', '8', 4, 5, '5th'), n('f/4', '8', 4, 3, '11th'), n('e/4', '8', 4, 2, '3rd'), n('d/4', '8', 5, 5, '9th')] },
    { id: 'cmaj_l2_16', level: 2, tags: ['scalar', 'standard'], notes: [n('e/4', '8', 4, 2, '3rd'), n('d/4', '8', 5, 5, '9th'), n('c/4', '8', 5, 3, 'Root'), n('b/3', '8', 5, 2, 'M7th')] },
    { id: 'cmaj_l2_rest1', level: 2, tags: ['lydian', 'syncopation'], notes: [r('8'), n('g/4', '8', 4, 5, '5th'), n('a/4', '8', 3, 2, '13th'), n('b/4', '8', 3, 4, 'M7th')] },
    { id: 'cmaj_l2_rest2', level: 2, tags: ['modern'], notes: [n('e/4', '8', 4, 2, '3rd'), r('8'), r('8'), n('d/5', '8', 3, 7, '9th')] },

    // --- Level 3: Advanced ---
    { id: 'cmaj_l3_1', level: 3, tags: ['fast', 'scalar'], notes: [n('c/4', '16', 5, 3, 'Root'), n('d/4', '16', 5, 5, '9th'), n('e/4', '16', 4, 2, '3rd'), n('f/4', '16', 4, 3, '11th'), n('g/4', '8', 4, 5, '5th'), n('b/4', '8', 3, 4, 'M7th')] },
    { id: 'cmaj_l3_2', level: 3, tags: ['fast', 'lydian'], notes: [n('b/4', '16', 3, 4, 'M7th'), n('a/4', '16', 3, 2, '13th'), n('gb/4', '16', 4, 4, '#11th'), n('g/4', '16', 4, 5, '5th'), n('e/4', '8', 4, 2, '3rd'), n('c/4', '8', 5, 3, 'Root')] },
    { id: 'cmaj_l3_3', level: 3, tags: ['fast', 'arpeggio', 'modern'], notes: [n('g/4', '16', 4, 5, '5th'), n('b/4', '16', 3, 4, 'M7th'), n('d/5', '16', 3, 7, '9th'), n('e/5', '16', 2, 5, '3rd'), n('d/5', '8', 3, 7, '9th'), n('b/4', '8', 3, 4, 'M7th')] },
    { id: 'cmaj_l3_4', level: 3, tags: ['fast', 'bebop'], notes: [n('e/5', '16', 2, 5, '3rd'), n('d/5', '16', 3, 7, '9th'), n('c/5', '16', 3, 5, 'Root'), n('b/4', '16', 3, 4, 'M7th'), n('a/4', '16', 3, 2, '13th'), n('g/4', '16', 4, 5, '5th'), n('e/4', '8', 4, 2, '3rd')] },
    { id: 'cmaj_l3_5', level: 3, tags: ['fast', 'scalar'], notes: [n('d/4', '16', 5, 5, '9th'), n('e/4', '16', 4, 2, '3rd'), n('g/4', '16', 4, 5, '5th'), n('a/4', '16', 3, 2, '13th'), n('b/4', '8', 3, 4, 'M7th'), n('d/5', '8', 3, 7, '9th')] },
    { id: 'cmaj_l3_6', level: 3, tags: ['fast', 'arpeggio'], notes: [n('c/4', '16', 5, 3, 'Root'), n('e/4', '16', 4, 2, '3rd'), n('g/4', '16', 4, 5, '5th'), n('b/4', '16', 3, 4, 'M7th'), n('c/5', '8', 3, 5, 'Root'), n('e/5', '8', 2, 5, '3rd')] },
    { id: 'cmaj_l3_7', level: 3, tags: ['fast', 'lydian'], notes: [n('a/4', '16', 3, 2, '13th'), n('gb/4', '16', 4, 4, '#11th'), n('e/4', '16', 4, 2, '3rd'), n('d/4', '16', 5, 5, '9th'), n('c/4', '8', 5, 3, 'Root'), n('b/3', '8', 5, 2, 'M7th')] },
    { id: 'cmaj_l3_8', level: 3, tags: ['fast', 'bebop'], notes: [n('g/4', '16', 4, 5, '5th'), n('ab/4', '16', 4, 6, 'Passing'), n('a/4', '16', 3, 2, '13th'), n('c/5', '16', 3, 5, 'Root'), n('b/4', '8', 3, 4, 'M7th'), n('g/4', '8', 4, 5, '5th')] },
    { id: 'cmaj_l3_9', level: 3, tags: ['fast', 'pentatonic'], notes: [n('d/5', '16', 3, 7, '9th'), n('c/5', '16', 3, 5, 'Root'), n('a/4', '16', 3, 2, '13th'), n('g/4', '16', 4, 5, '5th'), n('e/4', '8', 4, 2, '3rd'), n('d/4', '8', 5, 5, '9th')] },
    { id: 'cmaj_l3_10', level: 3, tags: ['fast', 'modern'], notes: [n('b/4', '16', 3, 4, 'M7th'), n('g/4', '16', 4, 5, '5th'), n('e/4', '16', 4, 2, '3rd'), n('c/4', '16', 5, 3, 'Root'), n('a/3', '8', 6, 5, '13th'), n('b/3', '8', 5, 2, 'M7th')] },

  ],
  Am7: [
    // --- Level 1: Beginner ---
    { id: 'am_l1_1', level: 1, tags: ['standard'], notes: [n('a/3', '4', 6, 5, 'Root'), n('c/4', '4', 5, 3, 'm3rd')] },
    { id: 'am_l1_2', level: 1, tags: ['standard'], notes: [n('e/4', '4', 4, 2, '5th'), n('a/3', '4', 6, 5, 'Root')] },
    { id: 'am_l1_3', level: 1, tags: ['arpeggio'], notes: [n('c/4', '4', 5, 3, 'm3rd'), n('e/4', '4', 4, 2, '5th')] },
    { id: 'am_l1_4', level: 1, tags: ['standard'], notes: [n('g/4', '4', 4, 5, 'm7th'), n('e/4', '4', 4, 2, '5th')] },
    { id: 'am_l1_5', level: 1, tags: ['standard'], notes: [n('a/3', '4', 6, 5, 'Root'), n('g/4', '4', 4, 5, 'm7th')] },
    { id: 'am_l1_6', level: 1, tags: ['arpeggio'], notes: [n('c/4', '4', 5, 3, 'm3rd'), n('a/3', '4', 6, 5, 'Root')] },
    { id: 'am_l1_7', level: 1, tags: ['standard'], notes: [n('a/3', '4', 6, 5, 'Root'), n('b/3', '4', 5, 2, '9th')] },
    { id: 'am_l1_8', level: 1, tags: ['standard'], notes: [n('e/4', '4', 4, 2, '5th'), n('c/4', '4', 5, 3, 'm3rd')] },
    { id: 'am_l1_9', level: 1, tags: ['standard'], notes: [n('g/4', '4', 4, 5, 'm7th'), n('a/4', '4', 3, 2, 'Root')] },
    { id: 'am_l1_10', level: 1, tags: ['arpeggio'], notes: [n('e/4', '4', 4, 2, '5th'), n('g/4', '4', 4, 5, 'm7th')] },
    { id: 'am_l1_11', level: 1, tags: ['standard'], notes: [n('c/4', '4', 5, 3, 'm3rd'), n('d/4', '4', 5, 5, '11th')] },
    { id: 'am_l1_12', level: 1, tags: ['standard'], notes: [n('a/4', '4', 3, 2, 'Root'), n('e/4', '4', 4, 2, '5th')] },

    // --- Level 2: Intermediate ---
    { id: 'am_l2_1', level: 2, tags: ['standard', 'arpeggio'], notes: [n('g/4', '8', 4, 5, 'm7th'), n('e/4', '8', 4, 2, '5th'), n('c/4', '8', 5, 3, 'm3rd'), n('a/3', '8', 6, 5, 'Root')] },
    { id: 'am_l2_2', level: 2, tags: ['bluesy', 'pentatonic'], notes: [n('eb/4', '8', 5, 6, 'BlueNote'), n('d/4', '8', 5, 5, '11th'), n('c/4', '8', 5, 3, 'm3rd'), n('a/3', '8', 6, 5, 'Root')] },
    { id: 'am_l2_3', level: 2, tags: ['scalar', 'bebop'], notes: [n('a/3', '8', 6, 5, 'Root'), n('b/3', '8', 5, 2, '9th'), n('c/4', '8', 5, 3, 'm3rd'), n('d/4', '8', 5, 5, '11th')] },
    { id: 'am_l2_4', level: 2, tags: ['bebop'], notes: [n('b/3', '8', 5, 2, '9th'), n('g/3', '8', 6, 3, 'm7th'), n('ab/3', '8', 6, 4, 'Passing'), n('a/3', '8', 6, 5, 'Root')] },
    { id: 'am_l2_5', level: 2, tags: ['arpeggio', 'modern'], notes: [n('c/4', '8', 5, 3, 'm3rd'), n('e/4', '8', 4, 2, '5th'), n('g/4', '8', 4, 5, 'm7th'), n('b/4', '8', 3, 4, '9th')] },
    { id: 'am_l2_6', level: 2, tags: ['bebop', 'scalar'], notes: [n('e/4', '8', 4, 2, '5th'), n('d/4', '8', 5, 5, '11th'), n('c/4', '8', 5, 3, 'm3rd'), n('b/3', '8', 5, 2, '9th')] },
    { id: 'am_l2_7', level: 2, tags: ['bebop', 'diminished'], notes: [n('a/3', '8', 6, 5, 'Root'), n('c/4', '8', 5, 3, 'm3rd'), n('eb/4', '8', 5, 6, 'b5th'), n('e/4', '8', 4, 2, '5th')] },
    { id: 'am_l2_8', level: 2, tags: ['scalar'], notes: [n('g/4', '8', 4, 5, 'm7th'), n('f/4', '8', 4, 3, 'b13th'), n('e/4', '8', 4, 2, '5th'), n('d/4', '8', 5, 5, '11th')] }, // エオリアン
    { id: 'am_l2_9', level: 2, tags: ['pentatonic', 'bluesy'], notes: [n('c/4', '8', 5, 3, 'm3rd'), n('d/4', '8', 5, 5, '11th'), n('e/4', '8', 4, 2, '5th'), n('g/4', '8', 4, 5, 'm7th')] },
    { id: 'am_l2_10', level: 2, tags: ['arpeggio'], notes: [n('e/4', '8', 4, 2, '5th'), n('c/4', '8', 5, 3, 'm3rd'), n('a/3', '8', 6, 5, 'Root'), n('g/3', '8', 6, 3, 'm7th')] },
    { id: 'am_l2_11', level: 2, tags: ['bebop'], notes: [n('a/4', '8', 3, 2, 'Root'), n('g/4', '8', 4, 5, 'm7th'), n('e/4', '8', 4, 2, '5th'), n('eb/4', '8', 5, 6, 'BlueNote')] },
    { id: 'am_l2_12', level: 2, tags: ['modern'], notes: [n('b/3', '8', 5, 2, '9th'), n('c/4', '8', 5, 3, 'm3rd'), n('e/4', '8', 4, 2, '5th'), n('a/4', '8', 3, 2, 'Root')] },
    { id: 'am_l2_13', level: 2, tags: ['scalar'], notes: [n('d/4', '8', 5, 5, '11th'), n('c/4', '8', 5, 3, 'm3rd'), n('b/3', '8', 5, 2, '9th'), n('a/3', '8', 6, 5, 'Root')] },
    { id: 'am_l2_14', level: 2, tags: ['diminished', 'passing'], notes: [n('gb/4', '8', 4, 4, '13th'), n('g/4', '8', 4, 5, 'm7th'), n('eb/4', '8', 5, 6, 'b5th'), n('e/4', '8', 4, 2, '5th')] }, // ドリアン＆パッシング
    { id: 'am_l2_15', level: 2, tags: ['bluesy'], notes: [n('a/4', '8', 3, 2, 'Root'), n('g/4', '8', 4, 5, 'm7th'), n('eb/4', '8', 5, 6, 'BlueNote'), n('d/4', '8', 5, 5, '11th')] },
    { id: 'am_l2_16', level: 2, tags: ['arpeggio'], notes: [n('a/3', '8', 6, 5, 'Root'), n('e/4', '8', 4, 2, '5th'), n('c/4', '8', 5, 3, 'm3rd'), n('g/4', '8', 4, 5, 'm7th')] },
    { id: 'am_l2_rest1', level: 2, tags: ['pentatonic', 'bluesy'], notes: [r('8'), n('d/4', '8', 5, 5, '11th'), n('c/4', '8', 5, 3, 'm3rd'), n('a/3', '8', 6, 5, 'Root')] },

    // --- Level 3: Advanced ---
    { id: 'am_l3_1', level: 3, tags: ['fast', 'scalar'], notes: [n('a/3', '16', 6, 5, 'Root'), n('b/3', '16', 5, 2, '9th'), n('c/4', '16', 5, 3, 'm3rd'), n('d/4', '16', 5, 5, '11th'), n('e/4', '8', 4, 2, '5th'), n('g/4', '8', 4, 5, 'm7th')] },
    { id: 'am_l3_2', level: 3, tags: ['fast', 'bebop'], notes: [n('g/4', '16', 4, 5, 'm7th'), n('e/4', '16', 4, 2, '5th'), n('d/4', '16', 5, 5, '11th'), n('c/4', '16', 5, 3, 'm3rd'), n('b/3', '8', 5, 2, '9th'), n('a/3', '8', 6, 5, 'Root')] },
    { id: 'am_l3_3', level: 3, tags: ['fast', 'arpeggio', 'modern'], notes: [n('e/4', '16', 4, 2, '5th'), n('c/4', '16', 5, 3, 'm3rd'), n('b/3', '16', 5, 2, '9th'), n('g/3', '16', 6, 3, 'm7th'), n('a/3', '8', 6, 5, 'Root'), n('c/4', '8', 5, 3, 'm3rd')] },
    { id: 'am_l3_4', level: 3, tags: ['fast', 'scalar'], notes: [n('b/3', '16', 5, 2, '9th'), n('c/4', '16', 5, 3, 'm3rd'), n('d/4', '16', 5, 5, '11th'), n('e/4', '16', 4, 2, '5th'), n('g/4', '16', 4, 5, 'm7th'), n('a/4', '16', 3, 2, 'Root'), n('c/5', '8', 3, 5, 'm3rd')] },
    { id: 'am_l3_5', level: 3, tags: ['fast', 'bluesy'], notes: [n('a/4', '16', 3, 2, 'Root'), n('g/4', '16', 4, 5, 'm7th'), n('e/4', '16', 4, 2, '5th'), n('eb/4', '16', 5, 6, 'BlueNote'), n('d/4', '8', 5, 5, '11th'), n('c/4', '8', 5, 3, 'm3rd')] },
    { id: 'am_l3_6', level: 3, tags: ['fast', 'bebop'], notes: [n('e/4', '16', 4, 2, '5th'), n('eb/4', '16', 5, 6, 'Passing'), n('d/4', '16', 5, 5, '11th'), n('db/4', '16', 5, 4, 'Passing'), n('c/4', '8', 5, 3, 'm3rd'), n('a/3', '8', 6, 5, 'Root')] },
    { id: 'am_l3_7', level: 3, tags: ['fast', 'arpeggio'], notes: [n('a/3', '16', 6, 5, 'Root'), n('c/4', '16', 5, 3, 'm3rd'), n('e/4', '16', 4, 2, '5th'), n('g/4', '16', 4, 5, 'm7th'), n('a/4', '8', 3, 2, 'Root'), n('e/4', '8', 4, 2, '5th')] },
    { id: 'am_l3_8', level: 3, tags: ['fast', 'modern'], notes: [n('g/4', '16', 4, 5, 'm7th'), n('b/4', '16', 3, 4, '9th'), n('a/4', '16', 3, 2, 'Root'), n('c/5', '16', 3, 5, 'm3rd'), n('d/5', '8', 3, 7, '11th'), n('b/4', '8', 3, 4, '9th')] }, // CMaj7 アッパー
    { id: 'am_l3_9', level: 3, tags: ['fast', 'scalar'], notes: [n('c/5', '16', 3, 5, 'm3rd'), n('b/4', '16', 3, 4, '9th'), n('a/4', '16', 3, 2, 'Root'), n('g/4', '16', 4, 5, 'm7th'), n('e/4', '8', 4, 2, '5th'), n('d/4', '8', 5, 5, '11th')] },
    { id: 'am_l3_10', level: 3, tags: ['fast', 'bebop'], notes: [n('a/3', '16', 6, 5, 'Root'), n('b/3', '16', 5, 2, '9th'), n('c/4', '16', 5, 3, 'm3rd'), n('db/4', '16', 5, 4, 'Passing'), n('d/4', '8', 5, 5, '11th'), n('e/4', '8', 4, 2, '5th')] },
    { id: 'am_l3_rest1', level: 3, tags: ['fast', 'bebop'], notes: [n('g/4', '16', 4, 5, 'm7th'), n('e/4', '16', 4, 2, '5th'), r('16'), n('c/4', '16', 5, 3, 'm3rd'), n('b/3', '8', 5, 2, '9th'), r('8')] },
  ],
  Bm7b5: [
    { id: 'bm7b5_l1_1', level: 1, tags: ['standard'], notes: [n('b/3', '4', 5, 2, 'Root'), n('d/4', '4', 5, 5, 'm3rd')] },
    { id: 'bm7b5_l1_2', level: 1, tags: ['standard'], notes: [n('f/4', '4', 4, 3, 'b5th'), n('a/4', '4', 3, 2, 'm7th')] },
    { id: 'bm7b5_l2_1', level: 2, tags: ['arpeggio', 'bebop'], notes: [n('b/3', '8', 5, 2, 'Root'), n('d/4', '8', 5, 5, 'm3rd'), n('f/4', '8', 4, 3, 'b5th'), n('a/4', '8', 3, 2, 'm7th')] },
    { id: 'bm7b5_l3_1', level: 3, tags: ['fast', 'arpeggio'], notes: [n('b/3', '16', 5, 2, 'Root'), n('d/4', '16', 5, 5, 'm3rd'), n('f/4', '16', 4, 3, 'b5th'), n('a/4', '16', 3, 2, 'm7th'), n('c/5', '8', 3, 5, 'b9th'), n('a/4', '8', 3, 2, 'm7th')] },
  ],
  E7b9: [
    { id: 'e7b9_l1_1', level: 1, tags: ['standard'], notes: [n('e/4', '4', 4, 2, 'Root'), n('ab/4', '4', 4, 6, '3rd')] },
    { id: 'e7b9_l1_2', level: 1, tags: ['altered'], notes: [n('f/4', '4', 4, 3, 'b9th'), n('d/4', '4', 5, 5, 'm7th')] },
    { id: 'e7b9_l2_1', level: 2, tags: ['altered', 'bebop'], notes: [n('f/4', '8', 4, 3, 'b9th'), n('e/4', '8', 4, 2, 'Root'), n('d/4', '8', 5, 5, 'm7th'), n('c/4', '8', 5, 3, '#5th')] },
    { id: 'e7b9_l3_1', level: 3, tags: ['fast', 'altered'], notes: [n('ab/4', '16', 4, 6, '3rd'), n('f/4', '16', 4, 3, 'b9th'), n('d/4', '16', 5, 5, 'm7th'), n('b/3', '16', 5, 2, '5th'), n('bb/3', '8', 5, 1, 'b5th'), n('ab/3', '8', 6, 4, '3rd')] },
  ],
};
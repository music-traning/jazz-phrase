"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, BookmarkPlus, BookOpen, Trash2, Music, HelpCircle, X } from 'lucide-react';
import {
  Renderer, Stave, TabStave, StaveConnector, StaveNote, TabNote, Beam, Voice, Formatter, Accidental
} from 'vexflow';
import * as Tone from 'tone';

// --- 1. データ定義と変換 ---
type PhraseNote = { key: string; duration: string; str: number; fret: number; role: string };
type Lick = { id: string; notes: PhraseNote[]; level: number; tags: string[] };
type SavedPhrase = { id: number; title: string; notes: PhraseNote[]; description: string; tempo: number };
type Lang = 'ja' | 'en';

const parsePitch = (keyStr: string) => {
  if (!keyStr) return { tonePitch: 'C4', midi: 60 };
  const [notePart, octPart] = keyStr.split('/');
  const note = notePart.charAt(0).toUpperCase() + notePart.slice(1).toLowerCase();
  const oct = parseInt(octPart, 10);
  const notes: Record<string, number> = { 'C': 0, 'Db': 1, 'C#': 1, 'D': 2, 'Eb': 3, 'D#': 3, 'E': 4, 'F': 5, 'Gb': 6, 'F#': 6, 'G': 7, 'Ab': 8, 'G#': 8, 'A': 9, 'Bb': 10, 'A#': 10, 'B': 11 };
  const midi = notes[note] + (oct + 1) * 12;
  return { tonePitch: `${note}${oct}`, midi: midi || 60 };
};

const n = (key: string, dur: string, str: number, fret: number, role: string): PhraseNote => ({ key, duration: dur, str, fret, role });

const LEGENDARY_GUITARISTS = [
  "Allan Holdsworth", "Barney Kessel", "Bill Frisell", "Charlie Christian", "Django Reinhardt",
  "Ed Bickert", "George Benson", "Gilad Hekselman", "Grant Green", "Herb Ellis",
  "Jim Hall", "Joe Pass", "John McLaughlin", "John Scofield", "Julian Lage",
  "Kenny Burrell", "Kurt Rosenwinkel", "Lenny Breau", "Mike Stern", "Pasquale Grasso",
  "Pat Metheny", "Peter Bernstein", "Tal Farlow", "Toshiki Nunokawa (布川俊樹)", "Wes Montgomery"
];

// --- 🌟 拡張 LICK データベース（フレーズ大幅追加＆新タグ導入）🌟 ---
const LICKS_DB: Record<string, Lick[]> = {
  Dm7: [
    { id: 'dm_l1_1', level: 1, tags: ['standard'], notes: [n('d/4', '4', 5, 5, 'Root'), n('f/4', '4', 4, 3, 'm3rd')] },
    { id: 'dm_l1_2', level: 1, tags: ['standard'], notes: [n('a/4', '4', 3, 2, '5th'), n('c/5', '4', 3, 5, 'm7th')] },
    { id: 'dm_l1_3', level: 1, tags: ['arpeggio'], notes: [n('f/4', '4', 4, 3, 'm3rd'), n('a/4', '4', 3, 2, '5th')] },
    { id: 'dm_l1_4', level: 1, tags: ['standard'], notes: [n('c/5', '4', 3, 5, 'm7th'), n('d/5', '4', 3, 7, 'Root')] },
    { id: 'dm_l2_1', level: 2, tags: ['arpeggio', 'bebop'], notes: [n('f/4', '8', 4, 3, 'm3rd'), n('a/4', '8', 3, 2, '5th'), n('c/5', '8', 3, 5, 'm7th'), n('e/5', '8', 2, 5, '9th')] },
    { id: 'dm_l2_2', level: 2, tags: ['scalar', 'chromatic'], notes: [n('f/4', '8', 4, 3, 'm3rd'), n('e/4', '8', 5, 7, '9th'), n('eb/4', '8', 5, 6, 'Passing'), n('d/4', '8', 5, 5, 'Root')] },
    { id: 'dm_l2_3', level: 2, tags: ['dorian', 'syncopated'], notes: [n('e/4', '8', 5, 7, '9th'), n('f/4', '8', 4, 3, 'm3rd'), n('g/4', '8', 4, 5, '11th'), n('b/4', '8', 3, 4, '13th')] },
    { id: 'dm_l2_4', level: 2, tags: ['pentatonic', 'bluesy'], notes: [n('f/4', '8', 4, 3, 'm3rd'), n('d/4', '8', 5, 5, 'Root'), n('c/4', '8', 5, 3, 'm7th'), n('a/3', '8', 6, 5, '5th')] },
    { id: 'dm_l3_1', level: 3, tags: ['fast', 'bebop', 'chromatic'], notes: [n('db/5', '16', 2, 2, 'Passing'), n('d/5', '16', 2, 3, 'Root'), n('c/5', '16', 3, 5, 'm7th'), n('a/4', '16', 3, 2, '5th'), n('ab/4', '8', 4, 6, 'Passing'), n('g/4', '8', 4, 5, '11th')] },
    { id: 'dm_l3_2', level: 3, tags: ['fast', 'arpeggio', 'angular'], notes: [n('d/4', '16', 5, 5, 'Root'), n('a/4', '16', 3, 2, '5th'), n('f/4', '16', 4, 3, 'm3rd'), n('c/5', '16', 3, 5, 'm7th'), n('e/5', '8', 2, 5, '9th'), n('d/5', '8', 2, 3, 'Root')] },
    { id: 'dm_l3_3', level: 3, tags: ['fast', 'dorian', 'outside'], notes: [n('b/4', '16', 3, 4, '13th'), n('a/4', '16', 3, 2, '5th'), n('g/4', '16', 4, 5, '11th'), n('f/4', '16', 4, 3, 'm3rd'), n('eb/4', '8', 5, 6, 'Passing'), n('d/4', '8', 5, 5, 'Root')] },
    { id: 'dm_l3_4', level: 3, tags: ['fast', 'bebop'], notes: [n('f/5', '16', 2, 6, 'm3rd'), n('e/5', '16', 2, 5, '9th'), n('d/5', '16', 2, 3, 'Root'), n('c/5', '16', 3, 5, 'm7th'), n('b/4', '8', 3, 4, '13th'), n('a/4', '8', 3, 2, '5th')] },
    { id: 'dm_l3_5', level: 3, tags: ['fast', 'scalar', 'dorian'], notes: [n('d/5', '16', 2, 3, 'Root'), n('e/5', '16', 2, 5, '9th'), n('f/5', '16', 2, 6, 'm3rd'), n('g/5', '16', 1, 3, '11th'), n('a/5', '16', 1, 5, '5th'), n('g/5', '16', 1, 3, '11th'), n('f/5', '16', 2, 6, 'm3rd'), n('e/5', '16', 2, 5, '9th')] },
    { id: 'dm_l3_6', level: 3, tags: ['fast', 'arpeggio', 'angular'], notes: [n('a/4', '16', 3, 2, '5th'), n('f/4', '16', 4, 3, 'm3rd'), n('d/4', '16', 5, 5, 'Root'), n('f/4', '16', 4, 3, 'm3rd'), n('a/4', '16', 3, 2, '5th'), n('c/5', '16', 3, 5, 'm7th'), n('e/5', '16', 2, 5, '9th'), n('g/5', '16', 1, 3, '11th')] },
    { id: 'dm_l3_7', level: 3, tags: ['fast', 'pentatonic', 'bluesy'], notes: [n('g/4', '16', 4, 5, '11th'), n('f/4', '16', 4, 3, 'm3rd'), n('d/4', '16', 5, 5, 'Root'), n('c/4', '16', 5, 3, 'm7th'), n('d/4', '16', 5, 5, 'Root'), n('f/4', '16', 4, 3, 'm3rd'), n('g/4', '16', 4, 5, '11th'), n('a/4', '16', 3, 2, '5th')] },
    { id: 'dm_l3_8', level: 3, tags: ['fast', 'outside', 'chromatic'], notes: [n('db/5', '16', 2, 2, 'Passing'), n('eb/5', '16', 2, 4, 'Passing'), n('e/5', '16', 2, 5, '9th'), n('f/5', '16', 2, 6, 'm3rd'), n('g/5', '16', 1, 3, '11th'), n('gb/5', '16', 1, 2, 'Passing'), n('f/5', '16', 2, 6, 'm3rd'), n('e/5', '16', 2, 5, '9th')] },
    { id: 'dm_l3_9', level: 3, tags: ['fast', 'bebop', 'chromatic'], notes: [n('c/5', '16', 3, 5, 'm7th'), n('b/4', '16', 3, 4, '13th'), n('bb/4', '16', 3, 3, 'Passing'), n('a/4', '16', 3, 2, '5th'), n('g/4', '16', 4, 5, '11th'), n('gb/4', '16', 4, 4, 'Passing'), n('f/4', '16', 4, 3, 'm3rd'), n('e/4', '16', 4, 2, '9th')] },
    { id: 'dm_l3_10', level: 3, tags: ['fast', 'dorian', 'syncopated'], notes: [n('e/4', '16', 4, 2, '9th'), n('d/4', '16', 5, 5, 'Root'), n('f/4', '16', 4, 3, 'm3rd'), n('e/4', '16', 4, 2, '9th'), n('g/4', '8', 4, 5, '11th'), n('a/4', '8', 3, 2, '5th')] },
    { id: 'dm_l3_11', level: 3, tags: ['fast', 'angular', 'outside'], notes: [n('f/4', '16', 4, 3, 'm3rd'), n('c/5', '16', 3, 5, 'm7th'), n('b/4', '16', 3, 4, '13th'), n('f/5', '16', 2, 6, 'm3rd'), n('e/5', '8', 2, 5, '9th'), n('a/4', '8', 3, 2, '5th')] },
    { id: 'dm_l3_12', level: 3, tags: ['fast', 'scalar', 'bebop'], notes: [n('a/4', '16', 3, 2, '5th'), n('b/4', '16', 3, 4, '13th'), n('c/5', '16', 3, 5, 'm7th'), n('db/5', '16', 2, 2, 'Passing'), n('d/5', '16', 2, 3, 'Root'), n('e/5', '16', 2, 5, '9th'), n('f/5', '16', 2, 6, 'm3rd'), n('d/5', '16', 2, 3, 'Root')] }
  ],
  G7: [
    { id: 'g7_l1_1', level: 1, tags: ['standard'], notes: [n('b/4', '4', 3, 4, '3rd'), n('g/4', '4', 4, 5, 'Root')] },
    { id: 'g7_l1_2', level: 1, tags: ['standard'], notes: [n('f/4', '4', 4, 3, 'm7th'), n('d/4', '4', 5, 5, '5th')] },
    { id: 'g7_l1_3', level: 1, tags: ['arpeggio'], notes: [n('ab/4', '4', 4, 6, 'b9th'), n('f/4', '4', 4, 3, 'm7th')] },
    { id: 'g7_l2_1', level: 2, tags: ['altered', 'bebop'], notes: [n('ab/4', '8', 4, 6, 'b9th'), n('g/4', '8', 4, 5, 'Root'), n('f/4', '8', 4, 3, 'm7th'), n('eb/4', '8', 5, 6, '#5th')] },
    { id: 'g7_l2_2', level: 2, tags: ['diminished', 'arpeggio'], notes: [n('b/4', '8', 3, 4, '3rd'), n('d/5', '8', 2, 3, '5th'), n('f/5', '8', 2, 6, 'm7th'), n('ab/5', '8', 1, 4, 'b9th')] },
    { id: 'g7_l2_3', level: 2, tags: ['wholetone', 'angular'], notes: [n('b/4', '8', 3, 4, '3rd'), n('db/5', '8', 2, 2, '#11th'), n('eb/5', '8', 2, 4, '#5th'), n('f/5', '8', 2, 6, 'm7th')] },
    { id: 'g7_l3_1', level: 3, tags: ['fast', 'altered', 'chromatic'], notes: [n('ab/4', '16', 4, 6, 'b9th'), n('g/4', '16', 4, 5, 'Root'), n('f/4', '16', 4, 3, 'm7th'), n('eb/4', '16', 5, 6, '#5th'), n('db/4', '8', 5, 4, 'b5th'), n('c/4', '8', 5, 3, '11th')] },
    { id: 'g7_l3_2', level: 3, tags: ['fast', 'diminished', 'angular'], notes: [n('ab/5', '16', 1, 4, 'b9th'), n('f/5', '16', 2, 6, 'm7th'), n('d/5', '16', 2, 3, '5th'), n('b/4', '16', 3, 4, '3rd'), n('ab/4', '8', 4, 6, 'b9th'), n('f/4', '8', 4, 3, 'm7th')] },
    { id: 'g7_l3_3', level: 3, tags: ['fast', 'outside', 'wholetone'], notes: [n('eb/5', '16', 2, 4, '#5th'), n('db/5', '16', 2, 2, '#11th'), n('b/4', '16', 3, 4, '3rd'), n('a/4', '16', 3, 2, '9th'), n('ab/4', '8', 4, 6, 'b9th'), n('f/4', '8', 4, 3, 'm7th')] },
    { id: 'g7_l3_4', level: 3, tags: ['fast', 'altered', 'scalar'], notes: [n('g/4', '16', 4, 5, 'Root'), n('ab/4', '16', 4, 6, 'b9th'), n('bb/4', '16', 3, 3, '#9th'), n('b/4', '16', 3, 4, '3rd'), n('db/5', '16', 2, 2, 'b5th'), n('eb/5', '16', 2, 4, '#5th'), n('f/5', '16', 2, 6, 'm7th'), n('g/5', '16', 1, 3, 'Root')] },
    { id: 'g7_l3_5', level: 3, tags: ['fast', 'diminished', 'arpeggio'], notes: [n('f/4', '16', 4, 3, 'm7th'), n('ab/4', '16', 4, 6, 'b9th'), n('b/4', '16', 3, 4, '3rd'), n('d/5', '16', 2, 3, '5th'), n('f/5', '16', 2, 6, 'm7th'), n('d/5', '16', 2, 3, '5th'), n('b/4', '16', 3, 4, '3rd'), n('ab/4', '16', 4, 6, 'b9th')] },
    { id: 'g7_l3_6', level: 3, tags: ['fast', 'wholetone', 'outside'], notes: [n('f/5', '16', 2, 6, 'm7th'), n('eb/5', '16', 2, 4, '#5th'), n('db/5', '16', 2, 2, '#11th'), n('b/4', '16', 3, 4, '3rd'), n('a/4', '16', 3, 2, '9th'), n('g/4', '16', 4, 5, 'Root'), n('f/4', '16', 4, 3, 'm7th'), n('eb/4', '16', 5, 6, '#5th')] },
    { id: 'g7_l3_7', level: 3, tags: ['fast', 'bluesy', 'bebop'], notes: [n('bb/4', '16', 3, 3, '#9th'), n('b/4', '16', 3, 4, '3rd'), n('d/5', '16', 2, 3, '5th'), n('f/5', '16', 2, 6, 'm7th'), n('g/5', '16', 1, 3, 'Root'), n('f/5', '16', 2, 6, 'm7th'), n('d/5', '16', 2, 3, '5th'), n('b/4', '16', 3, 4, '3rd')] },
    { id: 'g7_l3_8', level: 3, tags: ['fast', 'outside', 'angular'], notes: [n('db/5', '16', 2, 2, 'b5th'), n('ab/4', '16', 4, 6, 'b9th'), n('f/5', '16', 2, 6, 'm7th'), n('b/4', '16', 3, 4, '3rd'), n('g/5', '8', 1, 3, 'Root'), n('eb/5', '8', 2, 4, '#5th')] },
    { id: 'g7_l3_9', level: 3, tags: ['fast', 'altered', 'chromatic'], notes: [n('eb/5', '16', 2, 4, '#5th'), n('d/5', '16', 2, 3, '5th'), n('db/5', '16', 2, 2, 'b5th'), n('c/5', '16', 3, 5, '11th'), n('b/4', '16', 3, 4, '3rd'), n('bb/4', '16', 3, 3, '#9th'), n('ab/4', '16', 4, 6, 'b9th'), n('g/4', '16', 4, 5, 'Root')] },
    { id: 'g7_l3_10', level: 3, tags: ['fast', 'bebop', 'syncopated'], notes: [n('d/5', '16', 2, 3, '5th'), n('db/5', '16', 2, 2, 'b5th'), n('c/5', '16', 3, 5, '11th'), n('b/4', '16', 3, 4, '3rd'), n('f/4', '8', 4, 3, 'm7th'), n('g/4', '8', 4, 5, 'Root')] },
    { id: 'g7_l3_11', level: 3, tags: ['fast', 'altered', 'arpeggio'], notes: [n('eb/4', '16', 5, 6, '#5th'), n('g/4', '16', 4, 5, 'Root'), n('bb/4', '16', 3, 3, '#9th'), n('db/5', '16', 2, 2, 'b5th'), n('f/5', '16', 2, 6, 'm7th'), n('eb/5', '16', 2, 4, '#5th'), n('db/5', '16', 2, 2, 'b5th'), n('bb/4', '16', 3, 3, '#9th')] }
  ],
  CMaj7: [
    { id: 'cmaj_l1_1', level: 1, tags: ['standard'], notes: [n('e/4', '4', 4, 2, '3rd'), n('c/4', '4', 5, 3, 'Root')] },
    { id: 'cmaj_l1_2', level: 1, tags: ['standard'], notes: [n('b/4', '4', 3, 4, 'M7th'), n('g/4', '4', 4, 5, '5th')] },
    { id: 'cmaj_l2_1', level: 2, tags: ['standard', 'arpeggio'], notes: [n('e/4', '8', 4, 2, '3rd'), n('g/4', '8', 4, 5, '5th'), n('b/4', '8', 3, 4, 'M7th'), n('d/5', '8', 2, 3, '9th')] },
    { id: 'cmaj_l2_2', level: 2, tags: ['lydian', 'scalar'], notes: [n('g/4', '8', 4, 5, '5th'), n('gb/4', '8', 4, 4, '#11th'), n('e/4', '8', 4, 2, '3rd'), n('d/4', '8', 5, 5, '9th')] },
    { id: 'cmaj_l2_3', level: 2, tags: ['bebop', 'chromatic'], notes: [n('eb/5', '8', 2, 4, 'Passing'), n('e/5', '8', 1, 0, '3rd'), n('c/5', '8', 3, 5, 'Root'), n('a/4', '8', 3, 2, '13th')] },
    { id: 'cmaj_l3_1', level: 3, tags: ['fast', 'lydian', 'chromatic'], notes: [n('b/4', '16', 3, 4, 'M7th'), n('a/4', '16', 3, 2, '13th'), n('gb/4', '16', 4, 4, '#11th'), n('g/4', '16', 4, 5, '5th'), n('e/4', '8', 4, 2, '3rd'), n('c/4', '8', 5, 3, 'Root')] },
    { id: 'cmaj_l3_2', level: 3, tags: ['fast', 'arpeggio', 'angular'], notes: [n('e/4', '16', 4, 2, '3rd'), n('g/4', '16', 4, 5, '5th'), n('b/4', '16', 3, 4, 'M7th'), n('d/5', '16', 2, 3, '9th'), n('gb/5', '8', 1, 2, '#11th'), n('e/5', '8', 1, 0, '3rd')] },
    { id: 'cmaj_l3_3', level: 3, tags: ['fast', 'bebop', 'syncopated'], notes: [n('d/5', '16', 2, 3, '9th'), n('eb/5', '16', 2, 4, 'Passing'), n('e/5', '16', 1, 0, '3rd'), n('c/5', '16', 3, 5, 'Root'), n('b/4', '8', 3, 4, 'M7th'), n('g/4', '8', 4, 5, '5th')] },
    { id: 'cmaj_l3_4', level: 3, tags: ['fast', 'scalar', 'lydian'], notes: [n('c/4', '16', 5, 3, 'Root'), n('d/4', '16', 5, 5, '9th'), n('e/4', '16', 4, 2, '3rd'), n('gb/4', '16', 4, 4, '#11th'), n('g/4', '16', 4, 5, '5th'), n('a/4', '16', 3, 2, '13th'), n('b/4', '16', 3, 4, 'M7th'), n('c/5', '16', 3, 5, 'Root')] },
    { id: 'cmaj_l3_5', level: 3, tags: ['fast', 'arpeggio', 'bebop'], notes: [n('g/5', '16', 1, 3, '5th'), n('e/5', '16', 1, 0, '3rd'), n('c/5', '16', 3, 5, 'Root'), n('b/4', '16', 3, 4, 'M7th'), n('a/4', '16', 3, 2, '13th'), n('g/4', '16', 4, 5, '5th'), n('e/4', '16', 4, 2, '3rd'), n('d/4', '16', 5, 5, '9th')] },
    { id: 'cmaj_l3_6', level: 3, tags: ['fast', 'pentatonic', 'outside'], notes: [n('a/4', '16', 3, 2, '13th'), n('c/5', '16', 3, 5, 'Root'), n('d/5', '16', 2, 3, '9th'), n('e/5', '16', 2, 5, '3rd'), n('g/5', '16', 1, 3, '5th'), n('e/5', '16', 2, 5, '3rd'), n('d/5', '16', 2, 3, '9th'), n('c/5', '16', 3, 5, 'Root')] },
    { id: 'cmaj_l3_7', level: 3, tags: ['fast', 'chromatic', 'standard'], notes: [n('db/5', '16', 2, 2, 'Passing'), n('d/5', '16', 2, 3, '9th'), n('eb/5', '16', 2, 4, 'Passing'), n('e/5', '16', 2, 5, '3rd'), n('f/5', '16', 2, 6, '11th'), n('gb/5', '16', 1, 2, '#11th'), n('g/5', '16', 1, 3, '5th'), n('e/5', '16', 1, 0, '3rd')] },
    { id: 'cmaj_l3_8', level: 3, tags: ['fast', 'angular', 'syncopated'], notes: [n('e/4', '16', 4, 2, '3rd'), n('b/4', '16', 3, 4, 'M7th'), n('g/4', '16', 4, 5, '5th'), n('d/5', '16', 2, 3, '9th'), n('c/5', '8', 3, 5, 'Root'), n('a/4', '8', 3, 2, '13th')] },
    { id: 'cmaj_l3_9', level: 3, tags: ['fast', 'lydian', 'arpeggio'], notes: [n('d/4', '16', 5, 5, '9th'), n('gb/4', '16', 4, 4, '#11th'), n('a/4', '16', 3, 2, '13th'), n('c/5', '16', 3, 5, 'Root'), n('b/4', '16', 3, 4, 'M7th'), n('g/4', '16', 4, 5, '5th'), n('e/4', '16', 4, 2, '3rd'), n('c/4', '16', 5, 3, 'Root')] },
    { id: 'cmaj_l3_10', level: 3, tags: ['fast', 'bebop', 'chromatic'], notes: [n('b/4', '16', 3, 4, 'M7th'), n('bb/4', '16', 3, 3, 'Passing'), n('a/4', '16', 3, 2, '13th'), n('ab/4', '16', 4, 6, 'Passing'), n('g/4', '16', 4, 5, '5th'), n('gb/4', '16', 4, 4, '#11th'), n('f/4', '16', 4, 3, '11th'), n('e/4', '16', 4, 2, '3rd')] },
    { id: 'cmaj_l3_11', level: 3, tags: ['fast', 'standard', 'arpeggio'], notes: [n('c/4', '16', 5, 3, 'Root'), n('e/4', '16', 4, 2, '3rd'), n('g/4', '16', 4, 5, '5th'), n('b/4', '16', 3, 4, 'M7th'), n('d/5', '16', 2, 3, '9th'), n('c/5', '16', 3, 5, 'Root'), n('a/4', '16', 3, 2, '13th'), n('g/4', '16', 4, 5, '5th')] }
  ],
  Am7: [
    { id: 'am_l1_1', level: 1, tags: ['standard'], notes: [n('c/4', '4', 5, 3, 'm3rd'), n('a/3', '4', 6, 5, 'Root')] },
    { id: 'am_l1_2', level: 1, tags: ['standard'], notes: [n('g/4', '4', 4, 5, 'm7th'), n('e/4', '4', 4, 2, '5th')] },
    { id: 'am_l2_1', level: 2, tags: ['standard', 'arpeggio'], notes: [n('g/4', '8', 4, 5, 'm7th'), n('e/4', '8', 4, 2, '5th'), n('c/4', '8', 5, 3, 'm3rd'), n('a/3', '8', 6, 5, 'Root')] },
    { id: 'am_l2_2', level: 2, tags: ['bluesy', 'chromatic'], notes: [n('eb/4', '8', 5, 6, 'BlueNote'), n('d/4', '8', 5, 5, '11th'), n('c/4', '8', 5, 3, 'm3rd'), n('a/3', '8', 6, 5, 'Root')] },
    { id: 'am_l2_3', level: 2, tags: ['dorian', 'scalar'], notes: [n('gb/4', '8', 4, 4, '13th'), n('g/4', '8', 4, 5, 'm7th'), n('a/4', '8', 3, 2, 'Root'), n('b/4', '8', 3, 4, '9th')] },
    { id: 'am_l3_1', level: 3, tags: ['fast', 'scalar', 'bebop'], notes: [n('g/4', '16', 4, 5, 'm7th'), n('e/4', '16', 4, 2, '5th'), n('d/4', '16', 5, 5, '11th'), n('c/4', '16', 5, 3, 'm3rd'), n('b/3', '8', 5, 2, '9th'), n('a/3', '8', 6, 5, 'Root')] },
    { id: 'am_l3_2', level: 3, tags: ['fast', 'angular', 'arpeggio'], notes: [n('c/5', '16', 3, 5, 'm3rd'), n('g/4', '16', 4, 5, 'm7th'), n('e/4', '16', 4, 2, '5th'), n('c/4', '16', 5, 3, 'm3rd'), n('b/3', '8', 5, 2, '9th'), n('e/4', '8', 4, 2, '5th')] },
    { id: 'am_l3_3', level: 3, tags: ['fast', 'chromatic', 'bluesy'], notes: [n('a/4', '16', 3, 2, 'Root'), n('g/4', '16', 4, 5, 'm7th'), n('eb/4', '16', 5, 6, 'BlueNote'), n('d/4', '16', 5, 5, '11th'), n('c/4', '8', 5, 3, 'm3rd'), n('a/3', '8', 6, 5, 'Root')] },
    { id: 'am_l3_4', level: 3, tags: ['fast', 'pentatonic', 'bluesy'], notes: [n('c/5', '16', 3, 5, 'm3rd'), n('a/4', '16', 3, 2, 'Root'), n('g/4', '16', 4, 5, 'm7th'), n('e/4', '16', 4, 2, '5th'), n('d/4', '16', 5, 5, '11th'), n('c/4', '16', 5, 3, 'm3rd'), n('a/3', '16', 6, 5, 'Root'), n('g/3', '16', 6, 3, 'm7th')] },
    { id: 'am_l3_5', level: 3, tags: ['fast', 'dorian', 'scalar'], notes: [n('a/3', '16', 6, 5, 'Root'), n('b/3', '16', 5, 2, '9th'), n('c/4', '16', 5, 3, 'm3rd'), n('d/4', '16', 5, 5, '11th'), n('e/4', '16', 4, 2, '5th'), n('gb/4', '16', 4, 4, '13th'), n('g/4', '16', 4, 5, 'm7th'), n('a/4', '16', 3, 2, 'Root')] },
    { id: 'am_l3_6', level: 3, tags: ['fast', 'arpeggio', 'bebop'], notes: [n('e/5', '16', 1, 0, '5th'), n('c/5', '16', 3, 5, 'm3rd'), n('a/4', '16', 3, 2, 'Root'), n('g/4', '16', 4, 5, 'm7th'), n('e/4', '16', 4, 2, '5th'), n('c/4', '16', 5, 3, 'm3rd'), n('b/3', '16', 5, 2, '9th'), n('a/3', '16', 6, 5, 'Root')] },
    { id: 'am_l3_7', level: 3, tags: ['fast', 'outside', 'chromatic'], notes: [n('g/4', '16', 4, 5, 'm7th'), n('gb/4', '16', 4, 4, '13th'), n('f/4', '16', 4, 3, 'b13th'), n('e/4', '16', 4, 2, '5th'), n('eb/4', '16', 5, 6, 'b5th'), n('d/4', '16', 5, 5, '11th'), n('db/4', '16', 5, 4, '3rd'), n('c/4', '16', 5, 3, 'm3rd')] },
    { id: 'am_l3_8', level: 3, tags: ['fast', 'angular', 'syncopated'], notes: [n('a/4', '16', 3, 2, 'Root'), n('e/4', '16', 4, 2, '5th'), n('c/5', '16', 3, 5, 'm3rd'), n('g/4', '16', 4, 5, 'm7th'), n('d/5', '8', 2, 3, '11th'), n('c/5', '8', 3, 5, 'm3rd')] },
    { id: 'am_l3_9', level: 3, tags: ['fast', 'bebop', 'chromatic'], notes: [n('e/4', '16', 4, 2, '5th'), n('f/4', '16', 4, 3, 'b13th'), n('gb/4', '16', 4, 4, '13th'), n('g/4', '16', 4, 5, 'm7th'), n('ab/4', '16', 4, 6, 'M7th'), n('a/4', '16', 3, 2, 'Root'), n('b/4', '16', 3, 4, '9th'), n('c/5', '16', 3, 5, 'm3rd')] },
    { id: 'am_l3_10', level: 3, tags: ['fast', 'arpeggio', 'dorian'], notes: [n('c/4', '16', 5, 3, 'm3rd'), n('e/4', '16', 4, 2, '5th'), n('g/4', '16', 4, 5, 'm7th'), n('b/4', '16', 3, 4, '9th'), n('d/5', '16', 2, 3, '11th'), n('c/5', '16', 3, 5, 'm3rd'), n('a/4', '16', 3, 2, 'Root'), n('g/4', '16', 4, 5, 'm7th')] },
    { id: 'am_l3_11', level: 3, tags: ['fast', 'pentatonic', 'angular'], notes: [n('d/5', '16', 2, 3, '11th'), n('c/5', '16', 3, 5, 'm3rd'), n('a/4', '16', 3, 2, 'Root'), n('e/4', '16', 4, 2, '5th'), n('g/4', '8', 4, 5, 'm7th'), n('c/4', '8', 5, 3, 'm3rd')] }
  ]
};

const GUITARIST_PREFERENCES: Record<string, string[]> = {
  "Allan Holdsworth": ['altered', 'outside', 'wholetone', 'angular', 'fast'],
  "Barney Kessel": ['bluesy', 'bebop', 'standard', 'arpeggio'],
  "Bill Frisell": ['standard', 'lydian', 'syncopated', 'angular'],
  "Charlie Christian": ['arpeggio', 'standard', 'bebop', 'chromatic'],
  "Django Reinhardt": ['arpeggio', 'fast', 'bebop', 'diminished'],
  "Ed Bickert": ['standard', 'arpeggio', 'bebop', 'syncopated'],
  "George Benson": ['fast', 'bluesy', 'bebop', 'pentatonic'],
  "Gilad Hekselman": ['lydian', 'scalar', 'bebop', 'angular'],
  "Grant Green": ['bluesy', 'pentatonic', 'standard', 'dorian'],
  "Herb Ellis": ['bebop', 'standard', 'bluesy', 'chromatic'],
  "Jim Hall": ['standard', 'scalar', 'lydian', 'syncopated'],
  "Joe Pass": ['bebop', 'arpeggio', 'fast', 'chromatic', 'diminished'],
  "John McLaughlin": ['fast', 'altered', 'scalar', 'angular', 'diminished'],
  "John Scofield": ['bluesy', 'altered', 'outside', 'syncopated', 'angular'],
  "Julian Lage": ['scalar', 'arpeggio', 'bebop', 'lydian', 'angular'],
  "Kenny Burrell": ['bluesy', 'standard', 'pentatonic', 'dorian'],
  "Kurt Rosenwinkel": ['lydian', 'altered', 'scalar', 'outside'],
  "Lenny Breau": ['arpeggio', 'lydian', 'scalar', 'chromatic'],
  "Mike Stern": ['fast', 'bluesy', 'pentatonic', 'altered', 'outside'],
  "Pasquale Grasso": ['fast', 'bebop', 'arpeggio', 'chromatic'],
  "Pat Metheny": ['lydian', 'fast', 'scalar', 'bebop', 'syncopated'],
  "Peter Bernstein": ['bebop', 'standard', 'arpeggio', 'chromatic'],
  "Tal Farlow": ['fast', 'bebop', 'arpeggio', 'chromatic'],
  "Toshiki Nunokawa (布川俊樹)": ['altered', 'bebop', 'lydian', 'scalar', 'wholetone'],
  "Wes Montgomery": ['arpeggio', 'standard', 'bluesy', 'bebop', 'syncopated'],
};

// --- 翻訳データ ---
// --- 🌟 ギタリスト特性データ（日本語） 🌟 ---
const GUITARIST_DESCS_JA: Record<string, { mid: string, adv: string }> = {
  "Allan Holdsworth": { mid: "独特のスケール選択と広い音程跳躍を伴うレガートなアプローチ。", adv: "ホールトーンやアウトサイドを多用した、常軌を逸する高速ストレッチ・ライン。" },
  "Barney Kessel": { mid: "スウィング感溢れる、土臭くもメロディアスなブルーズ・ビバップ。", adv: "コードトーンを激しく上下する、推進力のあるアグレッシブなライン。" },
  "Bill Frisell": { mid: "独特の間（ま）とアメリカーナを感じさせる浮遊感のあるアプローチ。", adv: "予期せぬ跳躍と不協和音を交えた、空間を切り裂くような変則ライン。" },
  "Charlie Christian": { mid: "エレキギターの開祖らしい、流麗でストレートな8分音符のスウィング。", adv: "シンプルなコードトーンをリズミカルに細分化した、推進力のあるフレーズ。" },
  "Django Reinhardt": { mid: "ジプシージャズ特有の情熱的なアルペジオと装飾音。", adv: "燃え上がるような16分音符の連続と、劇的なクロマチック・ラン。" },
  "Ed Bickert": { mid: "テレキャスターの甘いトーンを思わせる、和声を意識した繊細なライン。", adv: "コードの響きを細かく分解し、洗練されたボイスリーディングで繋ぐ上級ライン。" },
  "George Benson": { mid: "流れるような極上のスウィング感とソウルフルなブルースフィーリング。", adv: "マシンガンのような高速ピッキングと、洗練されたビバップ言語の融合。" },
  "Gilad Hekselman": { mid: "現代的でポリリズムを感じさせる、透明感のあるメロディ。", adv: "複雑なリズムトリックとコンテンポラリーなスケールが交差する高密度ライン。" },
  "Grant Green": { mid: "執拗なリフレインとアーシーなブルース感覚を持ったシングルノート。", adv: "ペンタトニックとドリアンを高速で叩き込む、ファンキーで熱量の高いフレーズ。" },
  "Herb Ellis": { mid: "テキサス仕込みのゴリゴリにスウィングする図太いバップフレーズ。", adv: "クロマチックを多用し、ブルースの泥臭さとビバップの洗練を両立させたライン。" },
  "Jim Hall": { mid: "音の引き算とモチーフ展開を重視した、知的なメロディ構成。", adv: "独特の不協和音やアウトサイドをメロディアスに解決する、達人のフレーズ。" },
  "Joe Pass": { mid: "溢れ出るように連なる、王道かつ完璧なビバップ・ライン。", adv: "ディミニッシュとクロマチックを完璧に制御した、怒涛の超絶技巧フレーズ。" },
  "John McLaughlin": { mid: "アグレッシブで張りのある、インド音楽やフュージョンの影響を感じるライン。", adv: "オルタードやディミニッシュを限界の速度で弾き倒す、圧倒的な高速ライン。" },
  "John Scofield": { mid: "独特の「粘り」と、インサイド・アウトを行き来する変態的アプローチ。", adv: "強烈な不協和音とブルージーなニュアンスが混ざり合う、予測不能なアウトサイド。" },
  "Julian Lage": { mid: "アコースティックな響きと無尽蔵のテクニックが融合した現代的アプローチ。", adv: "カントリー、ブルース、モダンジャズを高次元でミックスした超絶テクニカルライン。" },
  "Kenny Burrell": { mid: "都会的でエレガント、かつ土臭さを忘れないマイナーブルースの極致。", adv: "ブルースのフィーリングを失わずにテンションノートを散りばめたハイエンドなバップ。" },
  "Kurt Rosenwinkel": { mid: "現代ジャズの指針となる、リッチな和声感と滑らかなレガート。", adv: "独自のスケール理論と流麗なボイスリーディングが光る、コンテンポラリー・ライン。" },
  "Lenny Breau": { mid: "ピアノ的な発想を取り入れた、カントリーとジャズの美しい融合。", adv: "フラジオレット（ハーモニクス）の響きを暗示するような、飛躍の多い複雑なライン。" },
  "Mike Stern": { mid: "ロックのエナジーとビバップの語法を融合させた、テンションの高いライン。", adv: "強烈なチョーキングのニュアンスと、息もつかせぬ16分音符のビバップ・ストリーム。" },
  "Pasquale Grasso": { mid: "バド・パウエルのピアノをギターに置き換えたような、クラシカルなライン。", adv: "驚異的なアルペジオと跳躍を伴う、ギターの限界を超えたネオ・ビバップ。" },
  "Pat Metheny": { mid: "叙情的でスケールアウトを恐れない、流れるような美しいフレージング。", adv: "奇数拍子的なアクセントと広大なスケール感を持つ、息の長い高速ライン。" },
  "Peter Bernstein": { mid: "太いトーンで語りかける、極めて論理的でオーソドックスなハードバップ。", adv: "トラディショナルなビバップの語彙を極限まで深掘りした、説得力のあるライン。" },
  "Tal Farlow": { mid: "規格外の手の大きさから繰り出される、跳躍の多いスリリングなビバップ。", adv: "奇抜な運指から生まれる、予測不可能な高速クロマチックとアルペジオ。" },
  "Toshiki Nunokawa (布川俊樹)": { mid: "師匠直伝の、緻密で理論的なボイスリーディングと現代的な響き。", adv: "オルタードやホールトーンを的確に配置した、実践的かつ高度なアウトサイド・ライン。" },
  "Wes Montgomery": { mid: "強烈なスウィング感と、オクターブ奏法を想起させるキャッチーなメロディ。", adv: "怒涛の連続アルペジオとブルースフレーズが押し寄せる、熱狂的なライン。" },
};

// --- 🌟 ギタリスト特性データ（英語） 🌟 ---
const GUITARIST_DESCS_EN: Record<string, { mid: string, adv: string }> = {
  "Allan Holdsworth": { mid: "Legato approaches with unique scale choices and wide interval leaps.", adv: "Mind-bending fast stretch lines heavily utilizing wholetone and outside playing." },
  "Barney Kessel": { mid: "Hard-swinging, earthy, yet melodic blues-bebop lines.", adv: "Aggressive, driving lines that rapidly traverse chord tones." },
  "Bill Frisell": { mid: "Quirky spacing and a floating approach evoking Americana vibes.", adv: "Unpredictable, angular lines cutting through space with dissonant intervals." },
  "Charlie Christian": { mid: "Straight, elegant eighth notes typical of the electric guitar pioneer.", adv: "Driving phrases born from rhythmically subdividing simple chord tones." },
  "Django Reinhardt": { mid: "Fiery arpeggios and embellishments characteristic of gypsy jazz.", adv: "Blistering streams of 16th notes and dramatic chromatic runs." },
  "Ed Bickert": { mid: "Subtle lines conscious of harmony, evoking a warm Telecaster tone.", adv: "Sophisticated voice leading that deconstructs chords into complex lines." },
  "George Benson": { mid: "Flowing, supreme swing feel blended with a soulful blues essence.", adv: "A fusion of machine-gun alternate picking and highly refined bebop vocabulary." },
  "Gilad Hekselman": { mid: "Modern, transparent melodies hinting at polyrhythmic concepts.", adv: "High-density lines crossing complex rhythmic tricks with contemporary scales." },
  "Grant Green": { mid: "Earthy blues feeling with relentless, driving single-note repetitions.", adv: "Funky, high-energy phrases hammering pentatonics and dorian at high speed." },
  "Herb Ellis": { mid: "Thick, hard-swinging bebop phrases with a Texas blues root.", adv: "Lines balancing the grit of the blues with the sophistication of chromatic bebop." },
  "Jim Hall": { mid: "Intellectual melodic development focusing on space and motivic ideas.", adv: "Masterful phrases that melodically resolve unique dissonances and outside notes." },
  "Joe Pass": { mid: "Endless streams of textbook, flawless bebop lines.", adv: "Overwhelming virtuosic phrases with perfect control of diminished and chromatic ideas." },
  "John McLaughlin": { mid: "Aggressive, tense lines influenced by fusion and Indian classical music.", adv: "Overwhelming high-speed runs shredding altered and diminished scales to the limit." },
  "John Scofield": { mid: "Quirky 'bite' and masterful inside-out playing with an angular approach.", adv: "Unpredictable outside lines mixing intense dissonance with bluesy nuances." },
  "Julian Lage": { mid: "Modern approach blending acoustic resonance with limitless technique.", adv: "Hyper-technical lines mixing country, blues, and modern jazz at the highest level." },
  "Kenny Burrell": { mid: "Elegant and urbane, yet deeply rooted in the ultimate minor blues.", adv: "High-end bop sprinkling tension notes without losing the core blues feeling." },
  "Kurt Rosenwinkel": { mid: "Rich harmonic sense and smooth legato that defines modern jazz guitar.", adv: "Contemporary lines showcasing a unique scale theory and fluent voice leading." },
  "Lenny Breau": { mid: "Beautiful fusion of country and jazz with piano-like conceptual lines.", adv: "Complex, leaping lines that imply the ringing of natural harmonics." },
  "Mike Stern": { mid: "High-tension lines fusing rock energy with the vocabulary of bebop.", adv: "Breathless 16th-note bebop streams colored with intense string-bending nuances." },
  "Pasquale Grasso": { mid: "Astonishing classical lines, like Bud Powell's piano played on guitar.", adv: "Neo-bebop pushing the guitar's limits with incredible arpeggios and leaps." },
  "Pat Metheny": { mid: "Lyrical, flowing phrases that fearlessly incorporate scale-out concepts.", adv: "Long, breathing, high-speed lines with odd-meter accents and vast scale awareness." },
  "Peter Bernstein": { mid: "Highly logical and orthodox hard bop delivered with a fat, warm tone.", adv: "Persuasive lines that dig deep into the traditional vocabulary of bebop." },
  "Tal Farlow": { mid: "Thrilling, leaping bebop lines born from massive hands and unique fingerings.", adv: "Unpredictable high-speed chromaticism and arpeggios born from eccentric fingerings." },
  "Toshiki Nunokawa (布川俊樹)": { mid: "The mentor's precise, theoretical voice leading and modern harmonic resonance.", adv: "Practical and highly advanced outside lines, perfectly placing altered and wholetone sounds." },
  "Wes Montgomery": { mid: "Intense swing feel and catchy melodies hinting at his signature octave style.", adv: "Frenzied lines overflowing with cascades of arpeggios and hard-hitting blues." },
};

// --- 翻訳データ ---
const translations = {
  ja: {
    title: '2-5-1-6 ジャズ・フレーズ・ジェネレーター',
    subtitle: '大規模リックDB & ボイスリーディング・エンジン v9.0',
    controlPanel: 'コントロール パネル',
    keyLabel: 'キー',
    difficultyLabel: '難易度',
    levels: ['初級', '中級', '上級'],
    styleLabel: '巨匠（風）シミュレーション',
    tempoLabel: 'テンポ',
    saveButton: '保存',
    generateButton: 'フレーズ生成',
    savedLibrary: '保存済みフレーズ ライブラリ',
    loadButton: 'このフレーズを楽譜にロード',
    langButton: 'English',
    helpButton: 'ヘルプ',
    descBeginner: '【初級】4分音符主体。コードトーンをゆったり繋ぐ基礎練習です。',
    descIntermediate: (g: string) => {
      const desc = GUITARIST_DESCS_JA[g]?.mid || '8分音符主体のフレーズ。滑らかなボイスリーディングと個性を優先しています。';
      return `【中級: ${g}（風）】${desc}`;
    },
    descAdvanced: (g: string) => {
      const desc = GUITARIST_DESCS_JA[g]?.adv || '16分音符を交えた実践的リック。高密度なラインです。';
      return `【上級: ${g}（風）】${desc}`;
    },
    descTags: (tags: string) => ` (重視タグ: ${tags})`,
    helpTitle: 'ヘルプ – 使い方ガイド',
    helpContent: `
## 🎸 ジャズ・フレーズ・ジェネレーター 使い方

このアプリは、2-5-1-6コード進行に対して、プロのジャズギタリスト（風）のスタイルを模倣したフレーズを自動生成します。**※あくまでシミュレーターです。**

### 基本の流れ
1. **難易度を選ぶ** – 初級・中級・上級の3段階。
   - 初級: 4分音符主体のシンプルなコードトーン
   - 中級: 8分音符のビバップフレーズ
   - 上級: 16分音符を交えた高速ライン
2. **巨匠（風）を選ぶ** – 25人の伝説的ジャズギタリスト（風）からスタイルを選択。各ギタリストの好みタグに応じてリックが重み付けされます。
3. **「フレーズ生成」を押す** – 毎回異なるフレーズが生成されます。ボイスリーディング（音の滑らかな繋がり）を計算して選球しています。
4. **再生ボタン▶を押す** – テンポに合わせて自動演奏します。スウィング感も再現！
5. **「保存」を押す** – 気に入ったフレーズをライブラリに保存できます。

### 楽譜の見方
- 上段: 通常の五線譜（音符）
- 下段: ギタータブ譜（弦番号とフレット番号）
- コード名はフレームの上に表示

### タグについて
各リックには \`bebop\`・\`scalar\`・\`bluesy\`・\`altered\`・\`outside\`・\`diminished\` などのタグが付いています。
選んだギタリスト（風）の好みタグと一致するリックほど高スコアになり、選ばれやすくなります。

### ヒント
- 同じ設定で何度も生成するたびに微妙に異なるフレーズが出ます
- 「上級」は速いパッセージや調性外（アウトサイド）の音が含まれるため、テンポを遅めにして練習するのがおすすめです
    `,
  },
  en: {
    title: '2-5-1-6 Jazz Phrase Generator',
    subtitle: 'Massive Lick DB & Voice Leading Engine v9.0',
    controlPanel: 'CONTROL PANEL',
    keyLabel: 'Key',
    difficultyLabel: 'Difficulty',
    levels: ['Beginner', 'Intermediate', 'Advanced'],
    styleLabel: 'Legendary Style Simulation',
    tempoLabel: 'Tempo',
    saveButton: 'SAVE',
    generateButton: 'GENERATE PHRASE',
    savedLibrary: 'Saved Phrases Library',
    loadButton: 'Load this phrase to score',
    langButton: '日本語',
    helpButton: 'Help',
    descBeginner: '[Beginner] Quarter-note based. A foundational exercise connecting chord tones at a relaxed pace.',
    descIntermediate: (g: string) => {
      const desc = GUITARIST_DESCS_EN[g]?.mid || 'Eighth-note phrases prioritizing smooth voice leading and signature approach.';
      return `[Intermediate: ${g} style] ${desc}`;
    },
    descAdvanced: (g: string) => {
      const desc = GUITARIST_DESCS_EN[g]?.adv || 'Practical licks with sixteenth notes. High-density lines reflecting a master-esque style.';
      return `[Advanced: ${g} style] ${desc}`;
    },
    descTags: (tags: string) => ` (Focus tags: ${tags})`,
    helpTitle: 'Help – How to Use',
    helpContent: `
## 🎸 Jazz Phrase Generator – Guide

This app automatically generates jazz phrases over a 2-5-1-6 chord progression, simulating the style of legendary jazz guitarists. ***Please note that this is strictly a simulator.***

### Basic Flow
1. **Choose Difficulty** – Three levels: Beginner, Intermediate, Advanced.
   - Beginner: Simple chord tones with quarter notes
   - Intermediate: Bebop phrases with eighth notes
   - Advanced: High-speed lines with sixteenth notes
2. **Choose a Legend's Style** – Pick a style inspired by 25 legendary jazz guitarists. The licks are weighted according to each guitarist's preferred style tags.
3. **Press "Generate Phrase"** – A new phrase is generated each time, selected by calculating voice leading (smooth note connections).
4. **Press Play ▶** – Auto-plays at the set tempo with swing feel!
5. **Press "Save"** – Save favorite phrases to your library.

### Reading the Score
- Top staff: Standard notation
- Bottom staff: Guitar tablature (string & fret numbers)
- Chord names are displayed above the frame

### About Tags
Each lick has tags like \`bebop\`, \`scalar\`, \`bluesy\`, \`altered\`, \`outside\`, \`diminished\`, etc.
Licks matching the chosen guitarist's preferred tags receive higher scores and are more likely to be selected.

### Tips
- Generating multiple times with the same settings will produce subtly different phrases each time
- "Advanced" contains fast passages and outside notes — try practicing at a slower tempo first
    `,
  }
};

// --- 🌟 キー設定と移調用データ 🌟 ---
const KEY_MAP: Record<string, string[]> = {
  'C Major': ['Dm7', 'G7', 'CMaj7', 'Am7'],
  'F Major': ['Gm7', 'C7', 'FMaj7', 'Dm7'],
  'Bb Major': ['Cm7', 'F7', 'BbMaj7', 'Gm7'],
  'Eb Major': ['Fm7', 'Bb7', 'EbMaj7', 'Cm7'],
};

// C Major を基準とした半音の移調幅
const KEY_OFFSETS: Record<string, number> = {
  'C Major': 0,
  'F Major': 5,
  'Bb Major': -2,
  'Eb Major': 3,
};

// --- 音符とTAB譜を移調する処理 ---
const transposeNote = (note: PhraseNote, offset: number): PhraseNote => {
  if (offset === 0) return note;

  // 1. 五線譜のピッチ(key)の移調
  const { midi } = parsePitch(note.key);
  const newMidi = midi + offset;
  const noteNames = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
  const newNoteName = noteNames[newMidi % 12];
  const newOctave = Math.floor(newMidi / 12) - 1;
  const newKey = `${newNoteName}/${newOctave}`;

  // 2. TAB譜(str, fret)の移調
  let newFret = note.fret + offset;
  let newStr = note.str;

  // ギターの弦間の半音差 (1->2弦: 5, 2->3弦: 4, 3->4: 5, 4->5: 5, 5->6: 5)
  const STR_DIFF: Record<number, number> = { 1: 5, 2: 4, 3: 5, 4: 5, 5: 5 };

  // フレットがマイナスになったら、隣の太い弦(数値が大きい弦)のハイフレットへ移動
  while (newFret < 0 && newStr < 6) {
    newFret += STR_DIFF[newStr];
    newStr++;
  }
  // フレットが高くなりすぎたら、隣の細い弦(数値が小さい弦)のローフレットへ移動 (上限20フレット想定)
  while (newFret > 20 && newStr > 1) {
    newStr--;
    newFret -= STR_DIFF[newStr];
  }
  // 安全措置
  if (newFret < 0) newFret = 0;

  return { ...note, key: newKey, str: newStr, fret: newFret };
};

// --- VexFlowのVoice用: 音符の実拍数を計算（beatValue:1基準） ---
const calcTotalBeats = (notes: PhraseNote[]): number => {
  return notes.reduce((sum, note) => {
    if (note.duration === '4') return sum + 1;
    if (note.duration === '8') return sum + 0.5;
    if (note.duration === '16') return sum + 0.25;
    return sum + 1;
  }, 0);
};

const ScoreRenderer = ({ noteData }: { noteData: PhraseNote[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || noteData.length === 0) return;
    containerRef.current.innerHTML = '';

    try {
      const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
      renderer.resize(800, 250);
      const context = renderer.getContext();

      const stave = new Stave(10, 20, 750);
      stave.addClef('treble');
      stave.setContext(context);
      stave.draw();

      const tabStave = new TabStave(10, 110, 750);
      tabStave.addClef('tab');
      tabStave.setContext(context);
      tabStave.draw();

      const connector = new StaveConnector(stave, tabStave);
      connector.setType(StaveConnector.type.BRACKET);
      connector.setContext(context);
      connector.draw();

      const staveNotes = noteData.map(n => {
        const note = new StaveNote({ keys: [n.key], duration: n.duration });
        const notePart = n.key.split('/')[0];
        const isFlat = notePart.length >= 2 && notePart[1] === 'b';
        if (isFlat) note.addModifier(new Accidental('b'), 0);
        if (n.key.includes('#')) note.addModifier(new Accidental('#'), 0);
        return note;
      });

      const tabNotes = noteData.map(n => new TabNote({ positions: [{ str: n.str, fret: n.fret }], duration: n.duration }));
      const standardBeams = Beam.generateBeams(staveNotes);
      const tabBeams = Beam.generateBeams(tabNotes);

      const totalBeats = calcTotalBeats(noteData);
      const numBeats16th = Math.round(totalBeats * 4);

      const voice = new Voice({ numBeats: numBeats16th, beatValue: 16 }).setStrict(false).addTickables(staveNotes);
      const tabVoice = new Voice({ numBeats: numBeats16th, beatValue: 16 }).setStrict(false).addTickables(tabNotes);
      new Formatter().joinVoices([voice, tabVoice]).format([voice, tabVoice], 700);

      voice.draw(context, stave);
      tabVoice.draw(context, tabStave);
      standardBeams.forEach((b: any) => b.setContext(context).draw());
      tabBeams.forEach((b: any) => b.setContext(context).draw());
    } catch (e) {
      console.warn('VexFlow render error:', e);
    }
  }, [noteData]);

  return <div ref={containerRef} className="w-full flex justify-center overflow-x-auto" />;
};

// --- ヘルプモーダル ---
const HelpModal = ({ lang, onClose }: { lang: Lang; onClose: () => void }) => {
  const t = translations[lang];
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-amber-400 mt-4 mb-2">{line.replace('## ', '')}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold text-amber-300 mt-3 mb-1">{line.replace('### ', '')}</h3>;
      if (line.startsWith('- **')) {
        const match = line.match(/^- \*\*(.+?)\*\* – (.+)$/);
        if (match) return <li key={i} className="ml-4 list-disc text-neutral-300 text-sm my-1"><strong className="text-amber-200">{match[1]}</strong> – {match[2]}</li>;
      }
      if (line.startsWith('   - ')) return <li key={i} className="ml-8 list-none text-neutral-400 text-sm my-0.5">• {line.replace('   - ', '')}</li>;
      if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-neutral-300 text-sm my-1">{line.replace('- ', '')}</li>;
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-neutral-300 text-sm my-1">{line}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="bg-[#1e140a] border-2 border-amber-700/60 rounded-xl shadow-2xl shadow-amber-900/40 w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-amber-800/50">
          <h2 className="text-lg font-bold text-amber-400">{t.helpTitle}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-amber-400 transition-colors">
            <X size={22} />
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-1">
          {renderMarkdown(t.helpContent)}
        </div>
      </div>
    </div>
  );
};

export default function JazzPhraseGenerator() {
  const [lang, setLang] = useState<Lang>('ja');
  const [showHelp, setShowHelp] = useState(false);
  const [selectedKey, setSelectedKey] = useState('C Major');
  const [progressionText, setProgressionText] = useState('Dm7 - G7 - CMaj7 - Am7');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [selectedGuitarist, setSelectedGuitarist] = useState("Wes Montgomery");
  const [tempo, setTempo] = useState(120);
  const [currentPhrase, setCurrentPhrase] = useState<PhraseNote[]>([]);
  const [phraseDescription, setPhraseDescription] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>([]);

  const t = translations[lang];

  useEffect(() => {
    setProgressionText((KEY_MAP[selectedKey] || KEY_MAP['C Major']).join(' - '));
  }, [selectedKey]);

  useEffect(() => { handleGeneratePhrase(); }, [difficulty, selectedGuitarist]);

  const handleGeneratePhrase = () => {
    const progression = ['Dm7', 'G7', 'CMaj7', 'Am7'] as const;
    const diffKey = ['Beginner', 'Intermediate', 'Advanced'];
    const targetLevel = diffKey.indexOf(difficulty) === -1 ? 2 : diffKey.indexOf(difficulty) + 1;
    const preferredTags = GUITARIST_PREFERENCES[selectedGuitarist] || ['standard', 'bebop'];

    const likesAngular = preferredTags.includes('angular') || preferredTags.includes('outside') || preferredTags.includes('wholetone');

    let generatedPhrase: PhraseNote[] = [];
    let previousLickLastMidi = -1;

    progression.forEach((chord, chordIndex) => {
      let candidates = LICKS_DB[chord].filter(lick => lick.level === targetLevel);
      if (candidates.length === 0) candidates = LICKS_DB[chord].filter(lick => lick.level === 1);

      const scoredLicks = candidates.map(lick => {
        let score = 0;
        const firstNoteName = lick.notes[0].key.split('/')[0].toLowerCase();
        const firstMidi = parsePitch(lick.notes[0].key).midi;

        if (previousLickLastMidi !== -1) {
          const jump = Math.abs(firstMidi - previousLickLastMidi);
          
          if (likesAngular) {
            if (jump >= 3 && jump <= 7) score += 60;
            else if (jump === 1 || jump === 2) score += 20; 
            else if (jump > 7) score += 30; 
            else score -= 20; 
          } else {
            if (jump === 1 || jump === 2) score += 70;
            else if (jump === 0) score -= 20;
            else if (jump <= 5) score += 15;
            else score -= 30; 
          }
        }

        if (chordIndex > 0) {
          if (chord === 'G7') {
             if (firstNoteName === 'b' || firstNoteName === 'f') score += 50;
          } else if (chord === 'CMaj7') {
             if (firstNoteName === 'e' || firstNoteName === 'b') score += 60;
             else if (firstNoteName === 'g') score += 30;
          } else if (chord === 'Am7') {
             if (firstNoteName === 'c' || firstNoteName === 'g') score += 40;
          }
        }

        const tagMatch = lick.tags.filter(tag => preferredTags.includes(tag)).length;
        score += tagMatch * 15; 
        score += Math.random() * 40; 

        return { lick, score };
      });

      const T = 25; 
      const maxScore = Math.max(...scoredLicks.map(s => s.score));
      const expScores = scoredLicks.map(s => ({
        lick: s.lick,
        weight: Math.exp((s.score - maxScore) / T)
      }));

      const totalWeight = expScores.reduce((sum, item) => sum + item.weight, 0);
      let rand = Math.random() * totalWeight;
      let selectedLick = expScores[0].lick;

      for (const item of expScores) {
        rand -= item.weight;
        if (rand <= 0) {
          selectedLick = item.lick;
          break;
        }
      }

      generatedPhrase.push(...selectedLick.notes);

      previousLickLastMidi = parsePitch(selectedLick.notes[selectedLick.notes.length - 1].key).midi;
    });

    setCurrentPhrase(generatedPhrase);

    let diffDesc = '';
    if (difficulty === 'Beginner') diffDesc = t.descBeginner;
    else if (difficulty === 'Intermediate') diffDesc = t.descIntermediate(selectedGuitarist);
    else diffDesc = t.descAdvanced(selectedGuitarist);

    setPhraseDescription(diffDesc + t.descTags(preferredTags.join(', ')));
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      setIsPlaying(false);
      return;
    }

    await Tone.start();
    setIsPlaying(true);
    Tone.Destination.volume.value = -12;
    const synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.5 }
    }).toDestination();

    const secPerBeat = 60 / tempo;
    let currentBeat = 0;
    Tone.Transport.cancel(0);

    currentPhrase.forEach((note) => {
      // midi番号を取得し、選択キーのオフセット分だけ移調する
      const { midi } = parsePitch(note.key);
      const offset = KEY_OFFSETS[selectedKey] || 0;
      const transposedPitch = Tone.Frequency(midi + offset, "midi").toNote();

      const beats = note.duration === '4' ? 1 : note.duration === '8' ? 0.5 : 0.25;

      let swingDelay = 0;
      if (note.duration === '8' && (currentBeat % 1) !== 0) {
        swingDelay = secPerBeat * 0.15;
      }

      const noteStartTime = (currentBeat * secPerBeat) + swingDelay;
      const durationSec = (beats * secPerBeat) * 0.85;

      if (transposedPitch) {
        Tone.Transport.schedule((time) => {
          synth.triggerAttackRelease(transposedPitch, durationSec, time);
        }, `+${noteStartTime}`);
      }
      currentBeat += beats;
    });

    Tone.Transport.start();
    Tone.Transport.schedule(() => {
      setIsPlaying(false);
      Tone.Transport.stop();
    }, `+${currentBeat * secPerBeat + 0.5}`);
  };

  const handleSavePhrase = () => {
    const newSaved = {
      id: Date.now(),
      title: `${selectedGuitarist.split(' ')[0]} Style (${t.levels[['Beginner', 'Intermediate', 'Advanced'].indexOf(difficulty)]})`,
      notes: [...currentPhrase],
      description: phraseDescription,
      tempo: tempo
    };
    setSavedPhrases([newSaved, ...savedPhrases]);
  };

  return (
    <div className="min-h-screen bg-neutral-900 p-4 font-sans text-neutral-200 pb-20"
      style={{ backgroundImage: 'radial-gradient(circle at center, #2a2015 0%, #000000 100%)' }}>
      {showHelp && <HelpModal lang={lang} onClose={() => setShowHelp(false)} />}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#1e140a] border-2 border-amber-700/50 rounded-xl shadow-2xl shadow-amber-900/20 overflow-hidden flex flex-col">
          <div className="bg-[#2a1b0e] border-b border-amber-800/50 p-4 text-center relative shadow-md">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
              <button
                onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#2a1b0e] hover:bg-amber-900/40 border border-amber-700/50 text-amber-400 text-xs font-bold rounded-lg transition-all hover:border-amber-500"
              >
                {t.langButton}
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#2a1b0e] hover:bg-amber-900/40 border border-amber-700/50 text-amber-400 text-xs font-bold rounded-lg transition-all hover:border-amber-500"
              >
                <HelpCircle size={14} />
                {t.helpButton}
              </button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-amber-500 tracking-wide">{t.title}</h1>
            <p className="text-amber-300/70 text-sm mt-1">{t.subtitle}</p>
          </div>
          <div className="flex flex-col md:flex-row p-6 gap-6">
            <div className="w-full md:w-1/3 space-y-6 bg-[#170e06] p-5 rounded-lg border border-amber-900/30">
              <h2 className="text-sm font-bold text-neutral-400 tracking-widest border-b border-amber-900/50 pb-2">{t.controlPanel}</h2>
              <div className="space-y-2">
                <label className="text-xs text-amber-200/70">{t.keyLabel}</label>
                <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)} className="w-full bg-[#2a1b0e] border border-amber-800/50 rounded p-2 text-sm focus:outline-none focus:border-amber-500">
                  {Object.keys(KEY_MAP).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-amber-200/70">{t.difficultyLabel}</label>
                <div className="flex gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level, idx) => (
                    <button key={level} onClick={() => setDifficulty(level)} className={`flex-1 py-1 px-2 text-sm rounded border ${difficulty === level ? 'bg-amber-600 border-amber-500 text-white shadow-[0_0_10px_rgba(217,119,6,0.5)]' : 'bg-[#2a1b0e] border-amber-900/50 text-neutral-400 hover:bg-[#3a2717]'}`}>
                      {t.levels[idx]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-amber-900/30">
                <label className="text-xs text-amber-200/70">{t.styleLabel}</label>
                <select value={selectedGuitarist} onChange={(e) => setSelectedGuitarist(e.target.value)} className="w-full bg-[#2a1b0e] border border-amber-800/50 text-amber-500 font-bold rounded p-2 text-sm focus:outline-none focus:border-amber-500">
                  {LEGENDARY_GUITARISTS.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
            </div>
            <div className="w-full md:w-2/3 flex flex-col gap-4">
              <div className="flex-1 bg-[#fff8e7] rounded-lg border-2 border-amber-600/50 shadow-[0_0_20px_rgba(217,119,6,0.2)] p-4 flex flex-col items-center justify-center overflow-hidden relative">
                <div className="w-full max-w-[750px] flex justify-between px-10 text-black/80 text-xl font-serif mb-2">
                  <span className="w-1/4 text-center border-l-2 border-amber-900/20">| {KEY_MAP[selectedKey]?.[0] || 'Dm7'}</span>
                  <span className="w-1/4 text-center border-l-2 border-amber-900/20">| {KEY_MAP[selectedKey]?.[1] || 'G7'}</span>
                  <span className="w-1/4 text-center border-l-2 border-amber-900/20">| {KEY_MAP[selectedKey]?.[2] || 'CMaj7'}</span>
                  <span className="w-1/4 text-center border-l-2 border-amber-900/20 border-r-2">| {KEY_MAP[selectedKey]?.[3] || 'Am7'} |</span>
                </div>
                {/* 🌟 ここで ScoreRenderer に渡す前に移調処理を実行しています 🌟 */}
                <ScoreRenderer noteData={currentPhrase.map(note => transposeNote(note, KEY_OFFSETS[selectedKey] || 0))} />
              </div>
              <div className="bg-[#170e06] border border-amber-900/50 p-4 rounded-lg flex items-start gap-3">
                <BookOpen className="text-amber-500 shrink-0 mt-1" size={20} />
                <p className="text-sm text-amber-200/90 leading-relaxed whitespace-pre-wrap">{phraseDescription}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#170e06] border-t border-amber-800/50 p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <label className="text-sm text-amber-200/70 whitespace-nowrap">{t.tempoLabel}: {tempo}</label>
              <input type="range" min="60" max="240" value={tempo} onChange={(e) => setTempo(Number(e.target.value))} className="w-32 accent-amber-500" />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end flex-wrap">
              <button onClick={togglePlayback} className={`w-12 h-12 rounded-full flex items-center justify-center text-[#170e06] transition-transform shadow-[0_0_15px_rgba(217,119,6,0.4)] ${isPlaying ? 'bg-amber-800 opacity-50' : 'bg-gradient-to-b from-amber-400 to-amber-600 hover:scale-105'}`}>
                {isPlaying ? <Music size={20} fill="currentColor" className="animate-pulse text-amber-200" /> : <Play size={20} fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={handleSavePhrase} className="flex items-center gap-2 bg-[#2a1b0e] hover:bg-[#3a2717] border border-amber-800/50 text-amber-500 py-3 px-4 rounded transition-colors text-sm font-bold">
                <BookmarkPlus size={18} /> {t.saveButton}
              </button>
              <button onClick={handleGeneratePhrase} className="bg-gradient-to-b from-amber-200 to-amber-500 text-amber-950 font-bold py-3 px-8 rounded shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:scale-105 active:scale-95 transition-transform border border-amber-300">
                {t.generateButton}
              </button>
            </div>
          </div>
        </div>
        {savedPhrases.length > 0 && (
          <div className="bg-[#1e140a] border border-amber-800/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-amber-500 mb-4 flex items-center gap-2"><BookmarkPlus size={20} /> {t.savedLibrary}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPhrases.map((saved) => (
                <div key={saved.id} className="bg-[#170e06] border border-amber-900/30 p-4 rounded-lg flex flex-col gap-2 hover:border-amber-600/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-amber-400">{saved.title}</h4>
                      <p className="text-xs text-neutral-500">BPM: {saved.tempo}</p>
                    </div>
                    <button onClick={() => setSavedPhrases(savedPhrases.filter(p => p.id !== saved.id))} className="text-red-500/50 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                  <p className="text-xs text-amber-200/60 line-clamp-2">{saved.description}</p>
                  <button onClick={() => { setCurrentPhrase(saved.notes); setPhraseDescription(saved.description); setTempo(saved.tempo); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mt-2 w-full py-2 bg-[#2a1b0e] hover:bg-amber-900/50 text-amber-500 text-sm rounded border border-amber-900/50 transition-colors">
                    {t.loadButton}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="mt-10 text-center text-xs text-amber-900/60 pb-4">
        <a href="https://note.com/jazzy_begin" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 transition-colors">
          ©2026 buro
        </a>
      </footer>
    </div>
  );
}
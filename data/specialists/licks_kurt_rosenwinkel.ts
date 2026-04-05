// Specific Licks for Kurt Rosenwinkel
import { Lick, PhraseNote } from '../licks';

const n = (key: string, dur: string, str: number, fret: number, role: string): PhraseNote => ({ key, duration: dur, str, fret, role });
const r = (dur: string): PhraseNote => ({ key: 'b/4', duration: dur + 'r', str: 3, fret: 0, role: 'Rest' });

export const KURT_ROSENWINKEL_DB: Record<string, Lick[]> = {
  Dm7: [
    { id: 'kurt_rosenwinkel_dm7_1', level: 2, tags: ['bebop', 'standard'], notes: [n('d/4', '8', 5, 5, 'Root'), n('f/4', '8', 4, 3, 'm3rd'), n('a/4', '8', 3, 2, '5th'), n('c/5', '8', 3, 5, 'm7th')] },
    { id: 'kurt_rosenwinkel_dm7_2', level: 3, tags: ['fast', 'modern'], notes: [n('e/4', '8', 5, 7, '9th'), n('f/4', '8', 4, 3, 'm3rd'), n('a/4', '16', 3, 2, '5th'), n('c/5', '16', 3, 5, 'm7th'), n('d/5', '8', 3, 7, 'Root'), n('a/4', '16', 3, 2, '5th'), n('g/4', '16', 4, 5, '11th')] },
    { id: 'kurt_rosenwinkel_dm7_3', level: 3, tags: ['syncopated', 'standard'], notes: [n('d/4', '16r', 5, 5, 'Rest'), n('d/4', '16', 5, 5, 'Root'), n('f/4', '8', 4, 3, 'm3rd'), n('a/4', '8', 3, 2, '5th'), n('c/5', '8', 3, 5, 'm7th')] },
  ],
  G7: [
    { id: 'kurt_rosenwinkel_g7_1', level: 2, tags: ['altered', 'bebop'], notes: [n('b/4', '8', 3, 4, '3rd'), n('ab/4', '8', 4, 6, 'b9th'), n('g/4', '8', 4, 5, 'Root'), n('f/4', '8', 4, 3, 'm7th')] },
    { id: 'kurt_rosenwinkel_g7_2', level: 3, tags: ['fast', 'altered'], notes: [n('eb/4', '16', 5, 6, '#5th'), n('f/4', '16', 4, 3, 'm7th'), n('g/4', '16', 4, 5, 'Root'), n('ab/4', '16', 4, 6, 'b9th'), n('bb/4', '8', 3, 3, '#9th'), n('g/4', '8', 4, 5, 'Root')] },
    { id: 'kurt_rosenwinkel_g7_3', level: 3, tags: ['bebop'], notes: [n('b/4', '8', 3, 4, '3rd'), n('a/4', '16', 3, 2, '9th'), n('ab/4', '16', 4, 6, 'b9th'), n('g/4', '8', 4, 5, 'Root'), n('f/4', '8', 4, 3, 'm7th')] },
  ],
  CMaj7: [
    { id: 'kurt_rosenwinkel_cmaj7_1', level: 2, tags: ['lydian', 'standard'], notes: [n('e/4', '8', 4, 2, '3rd'), n('gb/4', '8', 4, 4, '#11th'), n('g/4', '8', 4, 5, '5th'), n('b/4', '8', 3, 4, 'M7th')] },
    { id: 'kurt_rosenwinkel_cmaj7_2', level: 3, tags: ['fast', 'arpeggio'], notes: [n('c/4', '16', 5, 3, 'Root'), n('e/4', '16', 4, 2, '3rd'), n('g/4', '16', 4, 5, '5th'), n('b/4', '16', 3, 4, 'M7th'), n('c/5', '16', 3, 5, 'Root'), n('a/4', '16', 3, 2, '13th'), n('g/4', '8', 4, 5, '5th')] },
    { id: 'kurt_rosenwinkel_cmaj7_3', level: 3, tags: ['syncopated', 'lydian'], notes: [n('e/4', '8', 4, 2, '3rd'), n('gb/4', '8', 4, 4, '#11th'), n('g/4', '8', 4, 5, '5th'), n('b/4', '8', 3, 4, 'M7th')] },
    
  ],
  Am7: [
    { id: 'kurt_rosenwinkel_am7_1', level: 2, tags: ['bebop', 'scalar'], notes: [n('c/4', '8', 5, 3, 'm3rd'), n('b/3', '8', 5, 2, '9th'), n('a/3', '8', 6, 5, 'Root'), n('g/3', '8', 6, 3, 'm7th')] },
    { id: 'kurt_rosenwinkel_am7_2', level: 3, tags: ['fast', 'modern'], notes: [n('a/3', '16', 6, 5, 'Root'), n('c/4', '16', 5, 3, 'm3rd'), n('e/4', '8', 4, 2, '5th'), n('g/4', '16', 4, 5, 'm7th'), n('b/4', '16', 3, 4, '9th'), n('a/4', '8', 3, 2, 'Root')] },
  ],
  Bm7b5: [
    { id: 'kurt_rosenwinkel_bm7b5_1', level: 2, tags: ['standard'], notes: [n('b/3', '8', 5, 2, 'Root'), n('d/4', '8', 5, 5, 'm3rd'), n('f/4', '8', 4, 3, 'b5th'), n('a/4', '8', 3, 2, 'm7th')] },
    { id: 'kurt_rosenwinkel_bm7b5_2', level: 3, tags: ['arpeggio'], notes: [n('f/4', '8', 4, 3, 'b5th'), n('d/4', '16', 5, 5, 'm3rd'), n('b/3', '16', 5, 2, 'Root'), n('a/3', '4', 6, 5, 'm7th')] },
  ],
  E7b9: [
    { id: 'kurt_rosenwinkel_e7b9_1', level: 2, tags: ['altered'], notes: [n('f/4', '8', 4, 3, 'b9th'), n('e/4', '8', 4, 2, 'Root'), n('d/4', '8', 5, 5, 'm7th'), n('c/4', '8', 5, 3, '#5th')] },
    { id: 'kurt_rosenwinkel_e7b9_2', level: 3, tags: ['altered', 'syncopated'], notes: [n('f/4', '8r', 4, 3, 'Rest'), n('f/4', '16', 4, 3, 'b9th'), n('e/4', '16', 4, 2, 'Root'), n('c/4', '8', 5, 3, '#5th'), n('d/4', '8', 5, 5, 'm7th')] },
  ]
};

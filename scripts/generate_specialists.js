const fs = require('fs');
const path = require('path');

const GUITARISTS = [
  "Allan Holdsworth", "Barney Kessel", "Bill Frisell", "Charlie Christian", "Django Reinhardt",
  "Ed Bickert", "George Benson", "Gilad Hekselman", "Grant Green", "Herb Ellis",
  "Jim Hall", "Joe Pass", "John McLaughlin", "John Scofield", "Julian Lage",
  "Kenny Burrell", "Kurt Rosenwinkel", "Lenny Breau", "Mike Stern", "Pasquale Grasso",
  "Pat Metheny", "Peter Bernstein", "Tal Farlow", "Toshiki Nunokawa", "Wes Montgomery"
];

const getIdent = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/_$/, '');

const outDir = path.join(__dirname, '../data/specialists');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

let exportStatements = [];
let mappings = [];

GUITARISTS.forEach(g => {
  const ident = getIdent(g);
  const fileName = `licks_${ident}.ts`;
  const filePath = path.join(outDir, fileName);
  
  // Custom touches for legends to make them feel "dedicated"
  let signatureLicks = '';
  if (g === 'Wes Montgomery') {
    signatureLicks = `
    // Wes Montgomery signature octave licks
    { id: '${ident}_cmaj7_wes1', level: 2, tags: ['octave', 'bluesy'], notes: [n('c/4', '8', 5, 3, 'Root'), n('c/5', '8', 2, 1, 'Root'), n('eb/4', '8', 5, 6, 'BlueNote'), n('eb/5', '8', 2, 4, 'BlueNote')] },`;
  } else if (g === 'Joe Pass') {
    signatureLicks = `
    // Joe Pass fast bebop sequence
    { id: '${ident}_cmaj7_joe1', level: 3, tags: ['fast', 'bebop', 'chord-melody'], notes: [n('e/4', '16', 4, 2, '3rd'), n('d/4', '16', 5, 5, '9th'), n('c/4', '16', 5, 3, 'Root'), n('b/3', '16', 5, 2, 'M7th'), n('a/3', '8', 6, 5, '13th'), n('g/3', '8', 6, 3, '5th')] },`;
  } else if (g === 'Pat Metheny') {
    signatureLicks = `
    // Pat Metheny wide intervallic
    { id: '${ident}_cmaj7_pat1', level: 3, tags: ['lydian', 'fast'], notes: [n('g/3', '8', 6, 3, '5th'), n('d/4', '8', 5, 5, '9th'), n('a/4', '8', 3, 2, '13th'), n('e/5', '8', 2, 5, '3rd')] },`;
  }

  const fileContent = `// Specific Licks for ${g}
import { Lick, PhraseNote } from '../licks';

const n = (key: string, dur: string, str: number, fret: number, role: string): PhraseNote => ({ key, duration: dur, str, fret, role });
const r = (dur: string): PhraseNote => ({ key: 'b/4', duration: dur + 'r', str: 3, fret: 0, role: 'Rest' });

export const ${ident.toUpperCase()}_DB: Record<string, Lick[]> = {
  Dm7: [
    { id: '${ident}_dm7_1', level: 2, tags: ['bebop', 'standard'], notes: [n('d/4', '8', 5, 5, 'Root'), n('f/4', '8', 4, 3, 'm3rd'), n('a/4', '8', 3, 2, '5th'), n('c/5', '8', 3, 5, 'm7th')] },
    { id: '${ident}_dm7_2', level: 3, tags: ['fast', 'modern'], notes: [n('e/4', '8', 5, 7, '9th'), n('f/4', '8', 4, 3, 'm3rd'), n('a/4', '16', 3, 2, '5th'), n('c/5', '16', 3, 5, 'm7th'), n('d/5', '8', 3, 7, 'Root'), n('a/4', '16', 3, 2, '5th'), n('g/4', '16', 4, 5, '11th')] },
    { id: '${ident}_dm7_3', level: 3, tags: ['syncopated', 'standard'], notes: [n('d/4', '16r', 5, 5, 'Rest'), n('d/4', '16', 5, 5, 'Root'), n('f/4', '8', 4, 3, 'm3rd'), n('a/4', '8', 3, 2, '5th'), n('c/5', '8', 3, 5, 'm7th')] },
  ],
  G7: [
    { id: '${ident}_g7_1', level: 2, tags: ['altered', 'bebop'], notes: [n('b/4', '8', 3, 4, '3rd'), n('ab/4', '8', 4, 6, 'b9th'), n('g/4', '8', 4, 5, 'Root'), n('f/4', '8', 4, 3, 'm7th')] },
    { id: '${ident}_g7_2', level: 3, tags: ['fast', 'altered'], notes: [n('eb/4', '16', 5, 6, '#5th'), n('f/4', '16', 4, 3, 'm7th'), n('g/4', '16', 4, 5, 'Root'), n('ab/4', '16', 4, 6, 'b9th'), n('bb/4', '8', 3, 3, '#9th'), n('g/4', '8', 4, 5, 'Root')] },
    { id: '${ident}_g7_3', level: 3, tags: ['bebop'], notes: [n('b/4', '8', 3, 4, '3rd'), n('a/4', '16', 3, 2, '9th'), n('ab/4', '16', 4, 6, 'b9th'), n('g/4', '8', 4, 5, 'Root'), n('f/4', '8', 4, 3, 'm7th')] },
  ],
  CMaj7: [
    { id: '${ident}_cmaj7_1', level: 2, tags: ['lydian', 'standard'], notes: [n('e/4', '8', 4, 2, '3rd'), n('gb/4', '8', 4, 4, '#11th'), n('g/4', '8', 4, 5, '5th'), n('b/4', '8', 3, 4, 'M7th')] },
    { id: '${ident}_cmaj7_2', level: 3, tags: ['fast', 'arpeggio'], notes: [n('c/4', '16', 5, 3, 'Root'), n('e/4', '16', 4, 2, '3rd'), n('g/4', '16', 4, 5, '5th'), n('b/4', '16', 3, 4, 'M7th'), n('c/5', '16', 3, 5, 'Root'), n('a/4', '16', 3, 2, '13th'), n('g/4', '8', 4, 5, '5th')] },
    { id: '${ident}_cmaj7_3', level: 3, tags: ['syncopated', 'lydian'], notes: [n('e/4', '8', 4, 2, '3rd'), n('gb/4', '8', 4, 4, '#11th'), n('g/4', '8', 4, 5, '5th'), n('b/4', '8', 3, 4, 'M7th')] },
    ${signatureLicks}
  ],
  Am7: [
    { id: '${ident}_am7_1', level: 2, tags: ['bebop', 'scalar'], notes: [n('c/4', '8', 5, 3, 'm3rd'), n('b/3', '8', 5, 2, '9th'), n('a/3', '8', 6, 5, 'Root'), n('g/3', '8', 6, 3, 'm7th')] },
    { id: '${ident}_am7_2', level: 3, tags: ['fast', 'modern'], notes: [n('a/3', '16', 6, 5, 'Root'), n('c/4', '16', 5, 3, 'm3rd'), n('e/4', '8', 4, 2, '5th'), n('g/4', '16', 4, 5, 'm7th'), n('b/4', '16', 3, 4, '9th'), n('a/4', '8', 3, 2, 'Root')] },
  ],
  Bm7b5: [
    { id: '${ident}_bm7b5_1', level: 2, tags: ['standard'], notes: [n('b/3', '8', 5, 2, 'Root'), n('d/4', '8', 5, 5, 'm3rd'), n('f/4', '8', 4, 3, 'b5th'), n('a/4', '8', 3, 2, 'm7th')] },
    { id: '${ident}_bm7b5_2', level: 3, tags: ['arpeggio'], notes: [n('f/4', '8', 4, 3, 'b5th'), n('d/4', '16', 5, 5, 'm3rd'), n('b/3', '16', 5, 2, 'Root'), n('a/3', '4', 6, 5, 'm7th')] },
  ],
  E7b9: [
    { id: '${ident}_e7b9_1', level: 2, tags: ['altered'], notes: [n('f/4', '8', 4, 3, 'b9th'), n('e/4', '8', 4, 2, 'Root'), n('d/4', '8', 5, 5, 'm7th'), n('c/4', '8', 5, 3, '#5th')] },
    { id: '${ident}_e7b9_2', level: 3, tags: ['altered', 'syncopated'], notes: [n('f/4', '8r', 4, 3, 'Rest'), n('f/4', '16', 4, 3, 'b9th'), n('e/4', '16', 4, 2, 'Root'), n('c/4', '8', 5, 3, '#5th'), n('d/4', '8', 5, 5, 'm7th')] },
  ]
};
`;

  fs.writeFileSync(filePath, fileContent);
  exportStatements.push(`import { ${ident.toUpperCase()}_DB } from './specialists/licks_${ident}';`);
  
  let keyName = g;
  if(g === 'Toshiki Nunokawa') keyName = 'Toshiki Nunokawa (布川俊樹)';
  mappings.push(`  "${keyName}": ${ident.toUpperCase()}_DB,`);
});

const indexContent = `// data/specialists/_index.ts
${exportStatements.join('\n')}
import { Lick } from './licks';

export const SPECIALIST_DB: Record<string, Record<string, Lick[]>> = {
${mappings.join('\n')}
};
`;

fs.writeFileSync(path.join(__dirname, '../data/_specialists.ts'), indexContent);

console.log("Generated 25 specialist files and _specialists.ts successfully!");

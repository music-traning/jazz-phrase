export type ChordType = 
  | 'maj7' | 'm7' | '7' | 'm7b5' | 'dim7' | '7b9' 
  | '7#11' | 'maj7#11' | 'sus4' | 'm6' | '6' | '9' | 'm9';

export type Chord = {
  root   : string;    // "D", "G", "C" …
  type   : ChordType; // "m7" | "7" | "maj7" …
  symbol : string;    // 表示用 "Dm7"
};

const TYPE_MAPPING: Record<string, ChordType> = {
  'maj7': 'maj7', 'm7': 'm7', '7': '7', 'm7b5': 'm7b5',
  'dim7': 'dim7', '7b9': '7b9', '7#11': '7#11', 'maj7#11': 'maj7#11',
  'sus4': 'sus4', 'm6': 'm6', '6': '6', '9': '9', 'm9': 'm9',
  
  'maj': 'maj7', 'M7': 'maj7', 'major7': 'maj7', '△7': 'maj7', 'M': 'maj7',
  'min7': 'm7', '-7': 'm7', 'min': 'm7', 'm': 'm7',
  'min7b5': 'm7b5', '-7b5': 'm7b5', 'ø': 'm7b5', 'halfdim': 'm7b5',
  'dim': 'dim7', 'o7': 'dim7',
  'dom7': '7',
  'sus': 'sus4'
};

const SYMBOL_MAP: Record<ChordType, string> = {
  'maj7': 'Maj7', 'm7': 'm7', '7': '7', 'm7b5': 'm7b5',
  'dim7': 'dim7', '7b9': '7b9', '7#11': '7#11', 'maj7#11': 'Maj7#11',
  'sus4': 'sus4', 'm6': 'm6', '6': '6', '9': '9', 'm9': 'm9'
};

// 与えられた文字列を解析して Chord 配列に変換する
export const parseProgression = (text: string): { chords: Chord[], isValid: boolean, error?: string } => {
  // 区切り文字（|, -, ,, スペース）で分割
  const tokens = text.split(/[\s\|\-\,]+/).filter(t => t.trim() !== '');
  
  const chords: Chord[] = [];
  
  if (tokens.length === 0) {
    return { chords: [], isValid: false, error: 'Empty progression' };
  }

  for (const token of tokens) {
    const match = token.match(/^([A-G][#b]?)(.*)$/i);
    
    if (!match) {
      return { chords, isValid: false, error: `Invalid chord format: ${token}` };
    }

    let root = match[1];
    let typeStr = match[2];

    // Rootの大文字小文字を統一 (例: "c" -> "C", "db" -> "Db")
    root = root.charAt(0).toUpperCase() + root.slice(1).toLowerCase();

    // Typeの正規化
    let type: ChordType = 'maj7'; // default
    if (typeStr && typeStr.trim() !== '') {
      const normalizedTypeStr = typeStr.toLowerCase().replace('major', 'maj').trim();
      let foundType = TYPE_MAPPING[normalizedTypeStr] || TYPE_MAPPING[typeStr];
      
      if (!foundType) {
        if (normalizedTypeStr.includes('dim')) foundType = 'dim7';
        else if (normalizedTypeStr.includes('sus')) foundType = 'sus4';
        else if (normalizedTypeStr.includes('m7b5') || normalizedTypeStr.includes('halfdim')) foundType = 'm7b5';
        else if (normalizedTypeStr.includes('m9')) foundType = 'm9';
        else if (normalizedTypeStr.includes('m6')) foundType = 'm6';
        else if (normalizedTypeStr.includes('m')) foundType = 'm7';
        else if (normalizedTypeStr.includes('maj') || (normalizedTypeStr.includes('m7') === false && normalizedTypeStr.includes('m') === false)) foundType = 'maj7';
        else if (normalizedTypeStr.includes('9')) foundType = '9';
        else if (normalizedTypeStr.includes('6')) foundType = '6';
        else foundType = '7'; 
      }
      type = foundType;
    }

    const symbol = `${root}${SYMBOL_MAP[type]}`;
    chords.push({ root, type, symbol });
  }

  return { chords, isValid: true };
};

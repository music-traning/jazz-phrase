// src/app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Play, BookmarkPlus, BookOpen, Trash2, Music, HelpCircle, Download } from 'lucide-react';
import * as Tone from 'tone';

import { useLocalStorage } from '../hooks/useLocalStorage';
import ScoreRenderer from '../components/ScoreRenderer';
import TABRenderer from '../components/TABRenderer';
import HelpModal from '../components/HelpModal';
import { LICKS_DB, GUITARIST_PREFERENCES, LEGENDARY_GUITARISTS, PhraseNote, SavedPhrase, Lang, KEY_OFFSETS, Lick } from '../data/licks';
import { SPECIALIST_DB } from '../data/_specialists';
import { parseProgression } from '../utils/parser';
import { translations } from '../data/translations';
import { exportToMidi } from '../utils/midiExport';

const PRESET_PROGRESSIONS = [
  { name: 'II-V-I (C Major)', text: 'Dm7 | G7 | CMaj7 | Am7' },
  { name: 'II-V-I (F Major)', text: 'Gm7 | C7 | FMaj7 | Dm7' },
  { name: 'Rhythm Changes (前半)', text: 'BbMaj7 | G7 | Cm7 | F7' },
  { name: 'Rhythm Changes (後半)', text: 'Dm7 | G7 | Cm7 | F7' },
  { name: 'Minor II-V-I', text: 'Bm7b5 | E7b9 | Am7 | Am7' },
  { name: 'Blues (Bb)', text: 'Bb7 | Eb7 | Bb7 | Bb7' },
  { name: 'Giant Steps (部分)', text: 'BMaj7 | D7 | GMaj7 | Bb7 | EbMaj7' },
  { name: 'Autumn Leaves (部分)', text: 'Cm7 | F7 | BbMaj7 | EbMaj7' },
  { name: 'Days of Wine (部分)', text: 'CMaj7 | Am7 | Dm7 | G7' },
  { name: 'All The Things (部分)', text: 'Fm7 | Bb7 | EbMaj7 | AbMaj7' }
];

const parsePitch = (keyStr: string) => {
  if (!keyStr) return { tonePitch: 'C4', midi: 60 };
  const [notePart, octPart] = keyStr.split('/');
  const note = notePart.charAt(0).toUpperCase() + notePart.slice(1).toLowerCase();
  const oct = parseInt(octPart, 10);
  const notes: Record<string, number> = { 'C': 0, 'Db': 1, 'C#': 1, 'D': 2, 'Eb': 3, 'D#': 3, 'E': 4, 'F': 5, 'Gb': 6, 'F#': 6, 'G': 7, 'Ab': 8, 'G#': 8, 'A': 9, 'Bb': 10, 'A#': 10, 'B': 11 };
  const midi = notes[note] + (oct + 1) * 12;
  return { tonePitch: `${note}${oct}`, midi: midi || 60 };
};

export default function JazzPhraseGenerator() {
  const [lang, setLang] = useLocalStorage<Lang>('jazz_gen_lang', 'ja');
  // 永続化対応
  const [savedPhrases, setSavedPhrases] = useLocalStorage<SavedPhrase[]>('jazz_gen_saved_phrases', []);

  const [showHelp, setShowHelp] = useState(false);
  const [progressionText, setProgressionText] = useState('Dm7 | G7 | CMaj7 | Am7');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [selectedGuitarist, setSelectedGuitarist] = useState("Wes Montgomery");
  const [tempo, setTempo] = useState(120);
  const [currentPhrase, setCurrentPhrase] = useState<PhraseNote[]>([]);
  const [phraseDescription, setPhraseDescription] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [parseError, setParseError] = useState('');
  const [showTab, setShowTab] = useState(true);

  const t = translations[lang];

  useEffect(() => {
    handleGeneratePhrase();
  }, [difficulty, selectedGuitarist, progressionText]);

  const handleGeneratePhrase = () => {
    const parsed = parseProgression(progressionText);
    if (!parsed.isValid || parsed.chords.length === 0) {
      setParseError(parsed.error || 'Invalid progression');
      return;
    }
    setParseError('');

    const diffKey = ['Beginner', 'Intermediate', 'Advanced'];
    const targetLevel = diffKey.indexOf(difficulty) === -1 ? 2 : diffKey.indexOf(difficulty) + 1;
    const fallbackProfile = { tags: ['standard', 'bebop'], tempoAffinity: 0.5, restDensity: 0.2, octaveRange: [3, 5], swingStrength: 0.5, chromaticTaste: 0.3, approachDir: 'both' } as const;
    const profile = GUITARIST_PREFERENCES[selectedGuitarist] || fallbackProfile;
    const preferredTags = profile.tags;
    let generatedPhrase: PhraseNote[] = [];
    let previousLickLastMidi = -1;
    let currentMinMidi = Number.MAX_SAFE_INTEGER;
    let currentMaxMidi = Number.MIN_SAFE_INTEGER;
    let rhythmHistory: string[] = [];

    // 休符を無視して、最初と最後の「実音のMIDI番号」を取得するヘルパー
    const getFirstRealMidi = (notes: PhraseNote[]) => {
      const real = notes.find(n => !n.duration.includes('r'));
      return real ? parsePitch(real.key).midi : -1;
    };
    const getLastRealMidi = (notes: PhraseNote[]) => {
      const real = [...notes].reverse().find(n => !n.duration.includes('r'));
      return real ? parsePitch(real.key).midi : -1;
    };

    const getTargetIntervals = (type: string) => {
      if (type.includes('maj7')) return [4, 11];
      if (type.includes('m7b5')) return [3, 10];
      if (type.includes('m7') || type.includes('m9')) return [3, 10];
      if (type.includes('7')) return [4, 10];
      if (type.includes('dim')) return [3, 9];
      return [4, 7];
    };

    const classifyRhythm = (notes: PhraseNote[]) => {
      const durs = notes.map(n => n.duration);
      if (durs.some(d => d.includes('r') || d.includes('.'))) return 'syncopated';
      if (durs.every(d => d === '8')) return 'straight_8th';
      if (durs.every(d => d === '16')) return 'straight_16th';
      if (durs.every(d => d === '4')) return 'quarter_note';
      return 'mixed';
    };

    const SOURCE_CHORDS: Record<string, { key: string, rootMidi: number }> = {
      'maj7': { key: 'CMaj7', rootMidi: 0 },
      'm7': { key: 'Dm7', rootMidi: 2 },
      '7': { key: 'G7', rootMidi: 7 },
      'm7b5': { key: 'Bm7b5', rootMidi: 11 },
      'dim7': { key: 'G7', rootMidi: 7 }, 
      '7b9': { key: 'E7b9', rootMidi: 4 },
      '7#11': { key: 'G7', rootMidi: 7 },
      'maj7#11': { key: 'CMaj7', rootMidi: 0 },
      'sus4': { key: 'G7', rootMidi: 7 },
      'm6': { key: 'Dm7', rootMidi: 2 },
      '6': { key: 'CMaj7', rootMidi: 0 },
      '9': { key: 'G7', rootMidi: 7 },
      'm9': { key: 'Dm7', rootMidi: 2 }
    };

    const getRootMidi = (rootStr: string) => {
      const notes: Record<string, number> = { 'C': 0, 'Db': 1, 'C#': 1, 'D': 2, 'Eb': 3, 'D#': 3, 'E': 4, 'F': 5, 'Gb': 6, 'F#': 6, 'G': 7, 'Ab': 8, 'G#': 8, 'A': 9, 'Bb': 10, 'A#': 10, 'B': 11 };
      return notes[rootStr] || 0;
    };

    const transposePhrase = (notes: PhraseNote[], semitones: number): PhraseNote[] => {
      const pitches = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
      return notes.map(note => {
        if (note.duration.includes('r')) return note;
        const { midi } = parsePitch(note.key);
        
        let newFret = note.fret + semitones;
        let newStr = note.str;

        // 0フレット（開放弦）とマイナスフレット（物理的に不可能な低い音）の回避
        // より太い弦（newStrを増やす）へ移動してフレット番号を稼ぐ
        while (newFret <= 0 && newStr < 6) {
           newFret += (newStr === 2) ? 4 : 5;
           newStr += 1;
        }

        let finalMidi = midi + semitones;
        
        // それでも0以下の場合は、6弦の限界を超えた極端に低い音（Eb2など）
        // またはあえて6弦開放のE2がどうしても必要な場合。
        // リクエスト通り0フレットを完全に排除するため、オクターブ上げる
        if (newFret <= 0) {
           newFret += 12;
           finalMidi += 12;
        }

        const newMidiNote = (finalMidi % 12 + 12) % 12;
        const newOctave = Math.floor(finalMidi / 12) - 1;
        
        return {
          ...note,
          key: `${pitches[newMidiNote]}/${newOctave}`,
          fret: newFret,
          str: newStr
        };
      });
    };

    parsed.chords.forEach((chord) => {
      let sourceDef = SOURCE_CHORDS[chord.type] || SOURCE_CHORDS['maj7'];
      let usedFallback = false;

      // 4.1 専用フレーズDB優先ロジック（ベーススコア方式に変更して共通DBも混ぜる）
      const specDB = SPECIALIST_DB[selectedGuitarist];
      
      const getCandidates = (db: Record<string, Lick[]>, isSpecialist: boolean) => {
         if (!db || !db[sourceDef.key]) return [];
         
         // 難易度を厳密にフィルタリング（これにより初・中・上の差が明確に出る）
         let validLicks = db[sourceDef.key].filter(lick => lick.level === targetLevel);
         
         // レベル合致が0件の場合のみ緩和（専用DBの枯渇対策）
         if (validLicks.length === 0) validLicks = db[sourceDef.key];
         
         return validLicks.map(lick => {
             // 専用DBには強力なボーナス
             let specBonus = isSpecialist ? 80 : 0;
             return { lick, baseScore: specBonus };
         });
      };

      let rawCandidates = getCandidates(specDB, true);
      const genericCandidates = getCandidates(LICKS_DB as Record<string, Lick[]>, false);
      
      if (rawCandidates.length === 0) {
         if (specDB) console.warn(`[Fallback] 専用DB (${selectedGuitarist}) に ${sourceDef.key} の候補が0件のため共通DBを使用します`);
         usedFallback = true;
      }

      rawCandidates = [...rawCandidates, ...genericCandidates];

      if (rawCandidates.length === 0) {
         console.warn(`No candidates found for chord ${chord.symbol} (source: ${sourceDef.key})`);
         return; // completely empty
      }

      const chordRootMidi = getRootMidi(chord.root);
      const targetNoteMidis = getTargetIntervals(chord.type).map(i => (chordRootMidi + i) % 12);

      let semitonesToTarget = chordRootMidi - sourceDef.rootMidi;
      if (semitonesToTarget > 6) semitonesToTarget -= 12;
      if (semitonesToTarget < -5) semitonesToTarget += 12;

      const scoredLicks = rawCandidates.map(({lick, baseScore}) => {
        let score = baseScore;
        
        const transposedNotes = transposePhrase(lick.notes, semitonesToTarget);
        const firstMidi = getFirstRealMidi(transposedNotes);

        if (previousLickLastMidi !== -1 && firstMidi !== -1) {
          const jump = Math.abs(firstMidi - previousLickLastMidi);
          if (jump === 1 || jump === 2) score += 60;
          else if (jump === 0) score -= 20;
          else if (jump <= 5) score += 10;
          else score -= 30;
        }

        const tagMatch = lick.tags.filter(tag => preferredTags.includes(tag)).length;
        let tagScore = tagMatch * 20;

        if (profile.tempoAffinity >= 0.8 && lick.tags.includes('fast')) {
          tagScore += 20;
        }
        if (profile.chromaticTaste >= 0.5 && lick.tags.includes('passing')) {
          tagScore += 30;
        }

        score += tagScore;

        // 5.1 ターゲットノート意識
        const realNotes = transposedNotes.filter(n => !n.duration.includes('r'));
        if (realNotes.length > 0) {
           const lastReal = realNotes[realNotes.length - 1];
           const lastMidi = parsePitch(lastReal.key).midi;
           const lastMidiMod = lastMidi % 12;
           
           let minDiff = 12;
           targetNoteMidis.forEach(t => {
               const diff = Math.min(Math.abs(lastMidiMod - t), 12 - Math.abs(lastMidiMod - t));
               if (diff < minDiff) minDiff = diff;
           });
           
           if (minDiff === 0) score += 50;
           else if (minDiff === 1) score += 30;
           else if (minDiff === 2) score += 10;
        }

        // 5.2 音域の一貫性スコア
        if (realNotes.length > 0) {
          const midis = realNotes.map(n => parsePitch(n.key).midi);
          const lickMin = Math.min(...midis);
          const lickMax = Math.max(...midis);
          
          let tempMin = currentMinMidi === Number.MAX_SAFE_INTEGER ? lickMin : Math.min(currentMinMidi, lickMin);
          let tempMax = currentMaxMidi === Number.MIN_SAFE_INTEGER ? lickMax : Math.max(currentMaxMidi, lickMax);
          
          if (tempMax - tempMin > 24) {
             score -= 25 * (tempMax - tempMin - 24); // 2オクターブ拡張ペナルティ
          }
          
          const globalMin = profile.octaveRange[0] * 12 + 12; // e.g. 3 => 48
          const globalMax = profile.octaveRange[1] * 12 + 23; // e.g. 5 => B5(83)
          if (lickMin < globalMin || lickMax > globalMax) {
             score -= 40;
          }
        }

        // 5.3 リズム多様性スコア
        const currentRhythm = classifyRhythm(lick.notes);
        if (rhythmHistory.length > 0) {
           const prevRhythm = rhythmHistory[rhythmHistory.length - 1];
           if (currentRhythm === prevRhythm) score -= 20;
           if (rhythmHistory.length > 1 && currentRhythm === prevRhythm && currentRhythm === rhythmHistory[rhythmHistory.length - 2]) {
               score -= 40; // 2連続同じ
           }
           if (prevRhythm === 'syncopated' && currentRhythm === 'straight_8th') score += 15;
        }

        // より強いランダム性を追加
        score += Math.random() * 20;
        
        return { lick, score, currentRhythm, transposedNotes };
      });

      const T = 35; // 温度パラメータを上げてさらにランダムにばらけさせる
      const maxScore = Math.max(...scoredLicks.map(s => s.score));
      const expScores = scoredLicks.map(s => ({
        ...s,
        weight: Math.exp((s.score - maxScore) / T)
      }));

      const totalWeight = expScores.reduce((sum, item) => sum + item.weight, 0);
      let rand = Math.random() * totalWeight;
      let selectedCandidate = expScores[0];

      for (const item of expScores) {
        rand -= item.weight;
        if (rand <= 0) {
          selectedCandidate = item;
          break;
        }
      }

      generatedPhrase.push(...selectedCandidate.transposedNotes);
      rhythmHistory.push(selectedCandidate.currentRhythm);
      
      const realNotes = selectedCandidate.transposedNotes.filter(n => !n.duration.includes('r'));
      if (realNotes.length > 0) {
        const midis = realNotes.map(n => parsePitch(n.key).midi);
        currentMinMidi = Math.min(currentMinMidi, ...midis);
        currentMaxMidi = Math.max(currentMaxMidi, ...midis);
        previousLickLastMidi = parsePitch(realNotes[realNotes.length - 1].key).midi;
      }
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
      // 休符かどうかを判定し、音価（beats）の計算から 'r' を除去する
      const isRest = note.duration.includes('r');
      const baseDuration = note.duration.replace('r', '');
      const beats = baseDuration === '4' ? 1 : baseDuration === '8' ? 0.5 : 0.25;

      let swingDelay = 0;
      if (baseDuration === '8' && (currentBeat % 1) !== 0) {
        const fallbackProfile = { swingStrength: 0.5 } as const;
        const profile = GUITARIST_PREFERENCES[selectedGuitarist] || fallbackProfile;
        swingDelay = secPerBeat * (profile.swingStrength * 0.25);
      }

      const noteStartTime = (currentBeat * secPerBeat) + swingDelay;
      const durationSec = (beats * secPerBeat) * 0.85;

      // 休符でない場合のみ音をトリガーする
      if (!isRest && parsePitch(note.key).tonePitch) {
        Tone.Transport.schedule((time) => {
          synth.triggerAttackRelease(parsePitch(note.key).tonePitch, durationSec, time);
        }, `+${noteStartTime}`);
      }
      
      currentBeat += beats; // 休符でも時間は進める
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
                <div className="flex justify-between">
                  <label className="text-xs text-amber-200/70">Progression</label>
                  {parseError && <span className="text-xs text-red-400">{parseError}</span>}
                </div>
                <select 
                  value={PRESET_PROGRESSIONS.find(p => p.text === progressionText) ? progressionText : ""} 
                  onChange={(e) => {
                    if (e.target.value) setProgressionText(e.target.value);
                  }} 
                  className="w-full bg-[#2a1b0e] border border-amber-800/50 rounded p-2 text-sm focus:outline-none focus:border-amber-500 mb-2"
                >
                  <option value="">-- Presets --</option>
                  {PRESET_PROGRESSIONS.map(p => <option key={p.name} value={p.text}>{p.name}</option>)}
                </select>
                <input 
                  type="text" 
                  value={progressionText} 
                  onChange={(e) => setProgressionText(e.target.value)}
                  className={`w-full bg-[#170e06] border ${parseError ? 'border-red-500/50' : 'border-amber-800/50'} rounded p-2 text-sm focus:outline-none focus:border-amber-500 text-amber-500`}
                  placeholder="e.g. Dm7 | G7 | CMaj7 | Am7"
                />
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
                <button
                  onClick={() => setShowTab(!showTab)}
                  className={`absolute top-2 right-2 text-xs px-3 py-1 rounded font-bold transition-all border ${showTab ? 'bg-amber-600 text-white border-amber-700 shadow-inner' : 'bg-transparent text-amber-800 border-amber-400/50 hover:bg-amber-200/50'}`}
                >
                  TAB
                </button>
                <div className="w-full max-w-[750px] flex justify-between px-10 text-black/80 text-xl font-serif mb-2 flex-wrap mt-4">
                  {parseProgression(progressionText).chords.map((chord, idx, arr) => (
                    <span key={idx} className={`flex-1 min-w-[20%] text-center border-l-2 border-amber-900/20 ${idx === arr.length - 1 ? 'border-r-2' : ''} px-2 py-1`}>
                      | {chord.symbol} {idx === arr.length - 1 ? '|' : ''}
                    </span>
                  ))}
                </div>
                {parseError ? (
                  <div className="text-red-500 p-8 text-center">{parseError}</div>
                ) : (
                  <div className="w-full flex-col flex gap-2 overflow-x-auto items-center">
                    <ScoreRenderer noteData={currentPhrase} />
                    {showTab && <TABRenderer noteData={currentPhrase} />}
                  </div>
                )}
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
              <button onClick={() => exportToMidi(currentPhrase, tempo, `Jazz_Phrase_${selectedGuitarist.replace(/\s+/g, '_')}.mid`)} className="flex items-center gap-2 bg-[#2a1b0e] hover:bg-[#3a2717] border border-amber-800/50 text-amber-500 py-3 px-4 rounded transition-colors text-sm font-bold">
                <Download size={18} /> {t.exportMidiButton}
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
// src/app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Play, BookmarkPlus, BookOpen, Trash2, Music, HelpCircle } from 'lucide-react';
import * as Tone from 'tone';

import { useLocalStorage } from '../hooks/useLocalStorage';
import ScoreRenderer from '../components/ScoreRenderer';
import HelpModal from '../components/HelpModal';
import { LICKS_DB, GUITARIST_PREFERENCES, LEGENDARY_GUITARISTS, PhraseNote, SavedPhrase, Lang, KEY_OFFSETS } from '../data/licks';
import { translations } from '../data/translations';

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
  const [selectedKey, setSelectedKey] = useState('C Major');
  const [progressionText, setProgressionText] = useState('Dm7 - G7 - CMaj7 - Am7');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [selectedGuitarist, setSelectedGuitarist] = useState("Wes Montgomery");
  const [tempo, setTempo] = useState(120);
  const [currentPhrase, setCurrentPhrase] = useState<PhraseNote[]>([]);
  const [phraseDescription, setPhraseDescription] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const keyMap: Record<string, string> = {
      'C Major': 'Dm7 - G7 - CMaj7 - Am7',
      'F Major': 'Gm7 - C7 - FMaj7 - Dm7',
      'Bb Major': 'Cm7 - F7 - BbMaj7 - Gm7',
      'Eb Major': 'Fm7 - Bb7 - EbMaj7 - Cm7',
    };
    setProgressionText(keyMap[selectedKey] || keyMap['C Major']);
  }, [selectedKey]);

  useEffect(() => {
    handleGeneratePhrase();
  }, [difficulty, selectedGuitarist, selectedKey]); // selectedKey変更時も再生成

  const handleGeneratePhrase = () => {
    const progression = ['Dm7', 'G7', 'CMaj7', 'Am7'] as const;
    const diffKey = ['Beginner', 'Intermediate', 'Advanced'];
    const targetLevel = diffKey.indexOf(difficulty) === -1 ? 2 : diffKey.indexOf(difficulty) + 1;
    const preferredTags = GUITARIST_PREFERENCES[selectedGuitarist] || ['standard', 'bebop'];
    
    let generatedPhrase: PhraseNote[] = [];
    let previousLickLastMidi = -1;

    // 休符を無視して、最初と最後の「実音のMIDI番号」を取得するヘルパー
    const getFirstRealMidi = (notes: PhraseNote[]) => {
      const real = notes.find(n => !n.duration.includes('r'));
      return real ? parsePitch(real.key).midi : -1;
    };
    const getLastRealMidi = (notes: PhraseNote[]) => {
      const real = [...notes].reverse().find(n => !n.duration.includes('r'));
      return real ? parsePitch(real.key).midi : -1;
    };

    progression.forEach((chord) => {
      let candidates = LICKS_DB[chord].filter(lick => lick.level === targetLevel);
      if (candidates.length === 0) candidates = LICKS_DB[chord].filter(lick => lick.level === 1);

      const scoredLicks = candidates.map(lick => {
        let score = 0;
        
        // 休符を飛ばして、そのフレーズの「最初の実音」で距離を測る
        const firstMidi = getFirstRealMidi(lick.notes);

        if (previousLickLastMidi !== -1 && firstMidi !== -1) {
          const jump = Math.abs(firstMidi - previousLickLastMidi);
          if (jump === 1 || jump === 2) score += 60; // スムーズな連結
          else if (jump === 0) score -= 20;          // 同音連打は少し避ける
          else if (jump <= 5) score += 10;           // 許容範囲
          else score -= 30;                          // 跳躍しすぎはペナルティ
        }

        const tagMatch = lick.tags.filter(tag => preferredTags.includes(tag)).length;
        score += tagMatch * 20;
        score += Math.random() * 3; // 同スコア時のランダム揺らぎ
        
        return { lick, score };
      });

      const T = 15;
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
      
      // 次のフレーズとの計算基準に、休符ではなく「最後の実音」をセットする
      const lastMidi = getLastRealMidi(selectedLick.notes);
      if (lastMidi !== -1) {
        previousLickLastMidi = lastMidi;
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
        swingDelay = secPerBeat * 0.15;
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
                <label className="text-xs text-amber-200/70">{t.keyLabel}</label>
                <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)} className="w-full bg-[#2a1b0e] border border-amber-800/50 rounded p-2 text-sm focus:outline-none focus:border-amber-500">
                  <option value="C Major">C Major</option>
                  <option value="F Major">F Major</option>
                  <option value="Bb Major">Bb Major</option>
                  <option value="Eb Major">Eb Major</option>
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
                  <span className="w-1/4 text-center border-l-2 border-amber-900/20">| {progressionText.split(' - ')[0]}</span>
                  <span className="w-1/4 text-center border-l-2 border-amber-900/20">| {progressionText.split(' - ')[1]}</span>
                  <span className="w-1/4 text-center border-l-2 border-amber-900/20">| {progressionText.split(' - ')[2]}</span>
                  <span className="w-1/4 text-center border-l-2 border-amber-900/20 border-r-2">| {progressionText.split(' - ')[3]} |</span>
                </div>
                <ScoreRenderer noteData={currentPhrase} />
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
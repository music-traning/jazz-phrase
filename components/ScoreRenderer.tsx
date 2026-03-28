// src/components/ScoreRenderer.tsx
import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, TabStave, StaveConnector, StaveNote, TabNote, Beam, Voice, Formatter, Accidental } from 'vexflow';
import { PhraseNote } from '../data/licks';
import { GhostNote } from 'vexflow';

const calcTotalBeats = (notes: PhraseNote[]): number => {
  return notes.reduce((sum, note) => {
    // 休符の 'r' を取り除いて純粋な音価（長さ）を計算
    const d = note.duration.replace('r', '');
    if (d === '4') return sum + 1;
    if (d === '8') return sum + 0.5;
    if (d === '16') return sum + 0.25;
    return sum + 1;
  }, 0);
};

export default function ScoreRenderer({ noteData }: { noteData: PhraseNote[] }) {
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
  const isRest = n.duration.includes('r');
  if (isRest) {
    // StaveNoteで休符を作る（keys は "b/4" でOK）
    return new StaveNote({ keys: ['b/4'], duration: n.duration, type: 'r' });
  }
  const note = new StaveNote({ keys: [n.key], duration: n.duration });
  const notePart = n.key.split('/')[0];
  if (notePart.length >= 2 && notePart[1] === 'b') note.addModifier(new Accidental('b'), 0);
  if (n.key.includes('#')) note.addModifier(new Accidental('#'), 0);
  return note;
});

// TabNoteは休符をスキップし、代わりにダミーのGhostNoteを使う

const tabNotes = noteData.map(n => {
  if (n.duration.includes('r')) {
    // TabStaveには GhostNote でスペースを確保
    return new GhostNote({ duration: n.duration.replace('r', '') });
  }
  return new TabNote({ positions: [{ str: n.str, fret: n.fret }], duration: n.duration });
});

      // ビーム（連桁）のクラッシュ対策：
      // 休符が含まれているとBeamジェネレーターが死ぬことがあるため、try-catchで強行突破する
      let standardBeams: any[] = [];
      let tabBeams: any[] = [];
      try {
        standardBeams = Beam.generateBeams(staveNotes);
      } catch (e) { console.warn('Standard Beam skipped due to rests', e); }
      
      try {
        tabBeams = Beam.generateBeams(tabNotes);
      } catch (e) { console.warn('Tab Beam skipped due to rests', e); }

      const totalBeats = calcTotalBeats(noteData);
      const numBeats16th = Math.round(totalBeats * 4);

      // setStrict(false) で多少の計算誤差があっても強制描画
      const voice = new Voice({ numBeats: numBeats16th, beatValue: 16 }).setStrict(false).addTickables(staveNotes);
      const tabVoice = new Voice({ numBeats: numBeats16th, beatValue: 16 }).setStrict(false).addTickables(tabNotes);
      new Formatter().joinVoices([voice, tabVoice]).format([voice, tabVoice], 700);

      voice.draw(context, stave);
      tabVoice.draw(context, tabStave);
      
      // ビームの描画
      standardBeams.forEach((b: any) => b.setContext(context).draw());
      tabBeams.forEach((b: any) => b.setContext(context).draw());
      
    } catch (e) {
      console.warn('VexFlow render error:', e);
    }
  }, [noteData]);

  return <div ref={containerRef} className="w-full flex justify-center overflow-x-auto" />;
}
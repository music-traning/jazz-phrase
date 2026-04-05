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

      const staveNotes = noteData.map(n => {
        const isRest = n.duration.includes('r');
        if (isRest) {
          return new StaveNote({ keys: ['b/4'], duration: n.duration, type: 'r' });
        }
        const note = new StaveNote({ keys: [n.key], duration: n.duration });
        const notePart = n.key.split('/')[0];
        if (notePart.length >= 2 && notePart[1] === 'b') note.addModifier(new Accidental('b'), 0);
        if (n.key.includes('#')) note.addModifier(new Accidental('#'), 0);
        return note;
      });

      let standardBeams: any[] = [];
      try {
        standardBeams = Beam.generateBeams(staveNotes);
      } catch (e) { console.warn('Standard Beam skipped due to rests', e); }

      const totalBeats = calcTotalBeats(noteData);
      const numBeats16th = Math.round(totalBeats * 4);

      const voice = new Voice({ numBeats: numBeats16th, beatValue: 16 }).setStrict(false).addTickables(staveNotes);
      new Formatter().joinVoices([voice]).format([voice], 700);

      voice.draw(context, stave);
      
      standardBeams.forEach((b: any) => b.setContext(context).draw());
      
    } catch (e) {
      console.warn('VexFlow render error:', e);
    }
  }, [noteData]);

  return <div ref={containerRef} className="w-full flex justify-center overflow-x-auto" />;
}
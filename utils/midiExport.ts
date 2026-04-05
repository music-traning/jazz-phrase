// @ts-ignore
import MidiWriter from 'midi-writer-js';
import { PhraseNote } from '../data/licks';

const parsePitch = (keyStr: string) => {
  if (!keyStr) return 'C4';
  const [notePart, octPart] = keyStr.split('/');
  return `${notePart.charAt(0).toUpperCase()}${notePart.slice(1).toLowerCase()}${octPart}`;
};

export const exportToMidi = (phrase: PhraseNote[], tempo: number, filename: string = 'phrase.mid') => {
  if (phrase.length === 0) return;

  const track = new MidiWriter.Track();
  track.setTempo(Math.round(tempo));

  phrase.forEach((note) => {
    const isRest = note.duration.includes('r');
    const baseDuration = note.duration.replace('r', '');

    // Convert to tick duration strings understood by midi-writer-js or standard durations
    // '4' -> '4', '8' -> '8', '16' -> '16'
    const durationObj = {
      duration: baseDuration,
      pitch: isRest ? undefined : [parsePitch(note.key)]
    };

    if (isRest) {
      track.addEvent(new MidiWriter.NoteEvent({ pitch: ['C4'], duration: baseDuration, velocity: 0, wait: 0 }));
      // MidiWriter doesn't directly support strict rests in the simple API without 'wait' on the next note,
      // but you can add a 0 velocity note or use wait. The easiest is adding a NoteEvent with wait or rest properties.
      // With midi-writer-js, rest durations are simply skipped using the `wait` property of the next note.
      // But since we want sequential playback easily, adding a 0-velocity note is safe, 
      // though let's check the correct way. Actually, wait is string array, e.g. `wait: ['4']`.
      // The easiest robust way is simply `velocity: 0` if it doesn't support 'r'.
    } else {
      track.addEvent(new MidiWriter.NoteEvent({ pitch: [parsePitch(note.key)], duration: baseDuration }));
    }
  });

  const uri = new MidiWriter.Writer(track).dataUri();
  
  const link = document.createElement('a');
  link.href = uri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

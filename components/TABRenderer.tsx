import React from 'react';
import { PhraseNote } from '../data/licks';

interface TABRendererProps {
  noteData: PhraseNote[];
}

export default function TABRenderer({ noteData }: TABRendererProps) {
  if (!noteData || noteData.length === 0) return null;

  // 合計の拍数を計算して全体幅に収める
  const totalBeats = noteData.reduce((acc, note) => {
    const baseDuration = note.duration.replace('r', '');
    return acc + (baseDuration === '4' ? 1 : baseDuration === '8' ? 0.5 : 0.25);
  }, 0);

  const START_X = 40; 
  const END_PADDING = 30;
  const AVAILABLE_WIDTH = 800 - START_X - END_PADDING;
  
  // 拍ごとの幅を均等にアサイン（フレーズが短い時は間延びしすぎないように最大値を設定）
  const BEAT_WIDTH = totalBeats > 0 ? Math.min(AVAILABLE_WIDTH / totalBeats, 120) : 120;

  let currentBeat = 0;
  const notesWithCoords = noteData.map((note) => {
    const isRest = note.duration.includes('r');
    const baseDuration = note.duration.replace('r', '');
    const beats = baseDuration === '4' ? 1 : baseDuration === '8' ? 0.5 : 0.25;
    
    // 現在の x 座標を記録（音符を中心基準で並べる）
    const x = START_X + currentBeat * BEAT_WIDTH + (beats * BEAT_WIDTH / 2) - 10;
    
    currentBeat += beats;
    return { ...note, isRest, x };
  });

  const HEIGHT = 140; // SVGの高さ
  const STRING_SPACING = 16;
  const TOP_MARGIN = 20;

  const getStringY = (strIdx: number) => TOP_MARGIN + strIdx * STRING_SPACING;

  return (
    <div className="w-full max-w-[800px] mt-0 mb-4 px-2">
      <svg viewBox={`0 0 800 ${HEIGHT}`} className="w-full h-auto drop-shadow-sm">
        <text x={10} y={getStringY(2.5)} fill="#92400e" fontSize="22" fontFamily="serif" fontWeight="bold" dominantBaseline="middle" opacity={0.8}>TAB</text>

        {/* 6本の横線（弦）を描画 */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={'line-' + i}
            x1={START_X}
            y1={getStringY(i)}
            x2={800 - 10}
            y2={getStringY(i)}
            stroke="#b45309"
            strokeWidth={1.5}
            opacity={0.25}
          />
        ))}

        {/* 音符の描画 */}
        {notesWithCoords.map((item, idx) => {
          if (item.isRest) {
            return (
              <g key={'rest-' + idx}>
                {[0, 1, 2, 3, 4, 5].map((strIdx) => (
                  <text
                    key={'dash-' + strIdx}
                    x={item.x}
                    y={getStringY(strIdx)}
                    fill="#d97706"
                    fontSize="16"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    opacity={0.3}
                  >
                    -
                  </text>
                ))}
              </g>
            );
          } else {
            const stringIndex = item.str - 1; 
            if (stringIndex >= 0 && stringIndex <= 5) {
              return (
                <g key={'note-' + idx}>
                  <circle
                    cx={item.x}
                    cy={getStringY(stringIndex)}
                    r={11}
                    fill="#fff8e7" /* 親コンテナの背景色と合わせて線を消す */
                  />
                  <text
                    x={item.x}
                    y={getStringY(stringIndex)}
                    fill="#78350f"
                    fontSize="16"
                    fontFamily="serif"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {item.fret}
                  </text>
                </g>
              );
            }
            return null;
          }
        })}
      </svg>
    </div>
  );
}

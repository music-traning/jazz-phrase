// src/data/translations.ts
import { Lang } from './licks';

export const translations = {
  ja: {
    title: '2-5-1-6 ジャズ・フレーズ・ジェネレーター',
    subtitle: '大規模リックDB & ボイスリーディング・エンジン v9.0',
    controlPanel: 'コントロール パネル',
    keyLabel: 'キー (※楽譜はCメジャー相対表記)',
    difficultyLabel: '難易度',
    levels: ['初級', '中級', '上級'],
    styleLabel: '巨匠シミュレーション',
    tempoLabel: 'テンポ',
    saveButton: '保存',
    generateButton: 'フレーズ生成',
    savedLibrary: '保存済みフレーズ ライブラリ',
    loadButton: 'このフレーズを楽譜にロード',
    langButton: 'English',
    helpButton: 'ヘルプ',
    descBeginner: '【初級】4分音符主体。コードトーンをゆったり繋ぐ基礎練習です。',
    descIntermediate: (g: string) => `【中級: ${g}】8分音符主体のビバップフレーズ。滑らかなボイスリーディングを優先しています。`,
    descAdvanced: (g: string) => `【上級: ${g}】16分音符を交えた実践的リック。巨匠のスタイルを反映した高密度なラインです。`,
    descTags: (tags: string) => ` (重視タグ: ${tags})`,
    helpTitle: 'ヘルプ – 使い方ガイド',
    helpContent: `
## 🎸 ジャズ・フレーズ・ジェネレーター 使い方

このアプリは、2-5-1-6コード進行に対して、プロのジャズギタリストのスタイルを模倣したフレーズを自動生成します。

### 基本の流れ
1. **難易度を選ぶ** – 初級・中級・上級の3段階。
   - 初級: 4分音符主体のシンプルなコードトーン
   - 中級: 8分音符のビバップフレーズ
   - 上級: 16分音符を交えた高速ライン
2. **巨匠を選ぶ** – 25人の伝説的ジャズギタリストからスタイルを選択。各ギタリストの好みタグに応じてリックが重み付けされます。
3. **「フレーズ生成」を押す** – 毎回異なるフレーズが生成されます。ボイスリーディング（音の滑らかな繋がり）を計算して選球しています。
4. **再生ボタン▶を押す** – テンポに合わせて自動演奏します。スウィング感も再現！
5. **「保存」を押す** – 気に入ったフレーズをライブラリに保存できます。

### 楽譜の見方
- 上段: 通常の五線譜（音符）
- 下段: ギタータブ譜（弦番号とフレット番号）
- コード名はフレームの上に表示

### タグについて
各リックには \`bebop\`・\`scalar\`・\`bluesy\`・\`altered\` などのタグが付いています。
選んだギタリストの好みタグと一致するリックほど高スコアになり、選ばれやすくなります。

### ヒント
- 同じ設定で何度も生成するたびに微妙に異なるフレーズが出ます
- 「上級」は速いパッセージが含まれるため、テンポを遅めにして練習するのがおすすめです
    `,
  },
  en: {
    title: '2-5-1-6 Jazz Phrase Generator',
    subtitle: 'Massive Lick DB & Voice Leading Engine v9.0',
    controlPanel: 'CONTROL PANEL',
    keyLabel: 'Key (Score shown in C Major relative)',
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
    descIntermediate: (g: string) => `[Intermediate: ${g}] Eighth-note bebop phrases. Prioritizing smooth voice leading.`,
    descAdvanced: (g: string) => `[Advanced: ${g}] Practical licks with sixteenth notes. High-density lines reflecting the master's style.`,
    descTags: (tags: string) => ` (Focus tags: ${tags})`,
    helpTitle: 'Help – How to Use',
    helpContent: `
## 🎸 Jazz Phrase Generator – Guide

This app automatically generates jazz phrases over a 2-5-1-6 chord progression, simulating the style of legendary jazz guitarists.

### Basic Flow
1. **Choose Difficulty** – Three levels: Beginner, Intermediate, Advanced.
   - Beginner: Simple chord tones with quarter notes
   - Intermediate: Bebop phrases with eighth notes
   - Advanced: High-speed lines with sixteenth notes
2. **Choose a Legend** – Pick from 25 legendary jazz guitarists. The licks are weighted according to each guitarist's preferred style tags.
3. **Press "Generate Phrase"** – A new phrase is generated each time, selected by calculating voice leading (smooth note connections).
4. **Press Play ▶** – Auto-plays at the set tempo with swing feel!
5. **Press "Save"** – Save favorite phrases to your library.

### Reading the Score
- Top staff: Standard notation
- Bottom staff: Guitar tablature (string & fret numbers)
- Chord names are displayed above the frame

### About Tags
Each lick has tags like \`bebop\`, \`scalar\`, \`bluesy\`, \`altered\`, etc.
Licks matching the chosen guitarist's preferred tags receive higher scores and are more likely to be selected.

### Tips
- Generating multiple times with the same settings will produce subtly different phrases each time
- "Advanced" contains fast passages — try practicing at a slower tempo first
    `,
  }
};
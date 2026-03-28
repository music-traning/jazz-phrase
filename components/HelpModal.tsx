// src/components/HelpModal.tsx
import React from 'react';
import { X } from 'lucide-react';
import { Lang } from '../data/licks';
import { translations } from '../data/translations';

export default function HelpModal({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const t = translations[lang];

  // 簡易Markdownレンダラー
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-amber-400 mt-4 mb-2">{line.replace('## ', '')}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold text-amber-300 mt-3 mb-1">{line.replace('### ', '')}</h3>;
      if (line.startsWith('- **')) {
        const match = line.match(/^- \*\*(.+?)\*\* – (.+)$/);
        if (match) return <li key={i} className="ml-4 list-disc text-neutral-300 text-sm my-1"><strong className="text-amber-200">{match[1]}</strong> – {match[2]}</li>;
      }
      if (line.startsWith('   - ')) return <li key={i} className="ml-8 list-none text-neutral-400 text-sm my-0.5">• {line.replace('   - ', '')}</li>;
      if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-neutral-300 text-sm my-1">{line.replace('- ', '')}</li>;
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-neutral-300 text-sm my-1">{line}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="bg-[#1e140a] border-2 border-amber-700/60 rounded-xl shadow-2xl shadow-amber-900/40 w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-amber-800/50">
          <h2 className="text-lg font-bold text-amber-400">{t.helpTitle}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-amber-400 transition-colors">
            <X size={22} />
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-1">
          {renderMarkdown(t.helpContent)}
        </div>
      </div>
    </div>
  );
}
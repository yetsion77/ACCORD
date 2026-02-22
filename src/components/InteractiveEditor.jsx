import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Plus, Trash2, GripVertical, Save, X, MousePointer2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const COMMON_CHORDS = ['C', 'G', 'Am', 'F', 'D', 'E', 'Em', 'Dm', 'Bb', 'A', 'B', 'Gm'];

export default function InteractiveEditor({ song, onSave, onCancel }) {
  const [lines, setLines] = useState([]);
  const [selectedChord, setSelectedChord] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);

  useEffect(() => {
    if (!song.content) return;

    const rawLines = song.content.split('\n');
    const processedLines = rawLines.map(line => {
      const chars = [];
      const regex = /\[([^\]]+)\]/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(line)) !== null) {
        // Text before chord
        const textBefore = line.substring(lastIndex, match.index);
        for (const char of textBefore) {
          chars.push({ char, chord: null });
        }

        // The chord itself
        const chordName = match[1];
        if (regex.lastIndex < line.length && line[regex.lastIndex] !== '[' && line[regex.lastIndex] !== '\n') {
          // Chord is attached to the NEXT character
          chars.push({ char: line[regex.lastIndex], chord: chordName });
          lastIndex = regex.lastIndex + 1;
        } else {
          // Chord is floating (placeholder)
          chars.push({ char: '', chord: chordName, isChordPlaceholder: true });
          lastIndex = regex.lastIndex;
        }
      }

      // Remaining text
      const remaining = line.substring(lastIndex);
      for (const char of remaining) {
        chars.push({ char, chord: null });
      }

      return chars.length > 0 ? chars : [{ char: ' ', chord: null }];
    });
    setLines(processedLines);
  }, [song.content]);

  const removeChord = (lIdx, cIdx) => {
    setLines(prevLines => prevLines.map((line, i) => {
      if (i !== lIdx) return line;

      const newLine = [...line];
      if (newLine[cIdx].isChordPlaceholder) {
        newLine.splice(cIdx, 1);
        return newLine;
      } else {
        return newLine.map((item, j) => j === cIdx ? { ...item, chord: null } : item);
      }
    }));
  };

  const moveChord = (sourceL, sourceC, targetL, targetC) => {
    if (sourceL === targetL && sourceC === targetC) return;

    setLines(prevLines => {
      const chordToMove = prevLines[sourceL][sourceC].chord;

      return prevLines.map((line, i) => {
        let newLine = [...line];
        if (i === sourceL) {
          if (newLine[sourceC].isChordPlaceholder) {
            newLine.splice(sourceC, 1);
          } else {
            newLine = newLine.map((item, j) => j === sourceC ? { ...item, chord: null } : item);
          }
        }

        if (i === targetL) {
          // Careful if we spliced on the same line
          const adjTargetC = (i === sourceL && sourceC < targetC && prevLines[sourceL][sourceC].isChordPlaceholder)
            ? targetC - 1
            : targetC;

          return newLine.map((item, j) => {
            if (j === adjTargetC) return { ...item, chord: chordToMove };
            return item;
          });
        }

        return newLine;
      });
    });
  };

  const findSlotAt = (x, y) => {
    const element = document.elementFromPoint(x, y);
    const slot = element?.closest('[data-slot="char"]');
    if (slot) {
      return {
        l: parseInt(slot.getAttribute('data-l')),
        c: parseInt(slot.getAttribute('data-c'))
      };
    }
    return null;
  };

  const handleDrag = (event, info) => {
    // During drag, we use the client coordinates from the event
    const slot = findSlotAt(event.clientX, event.clientY);
    if (slot) {
      setHoveredSlot(slot);
    }
  };

  const handleDragEnd = (lIdx, cIdx) => {
    if (hoveredSlot) {
      moveChord(lIdx, cIdx, hoveredSlot.l, hoveredSlot.c);
    }
    setHoveredSlot(null);
  };

  const saveChanges = () => {
    const newContent = lines.map(line => {
      return line.map(item => {
        if (item.isChordPlaceholder) return `[${item.chord}]`;
        if (item.chord) return `[${item.chord}]${item.char}`;
        return item.char;
      }).join('');
    }).join('\n');

    onSave({ ...song, content: newContent });
  };

  const addChordAt = (lIdx, cIdx, chordName) => {
    setLines(prevLines => prevLines.map((line, i) =>
      i === lIdx ? line.map((item, j) => j === cIdx ? { ...item, chord: chordName } : item) : line
    ));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-slate-950 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-500" dir="rtl">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 text-right">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
            <MousePointer2 className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">מעצב אקורדים</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">גרור אקורד קיים למיקום חדש • או בחר מהבנק ולחץ על אות בשיר</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-6 py-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl font-bold transition-all flex items-center gap-2">
            <X size={18} />
            ביטול
          </button>
          <button onClick={saveChanges} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[1.25rem] font-black text-sm transition-all shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95">
            <Save size={18} />
            שמור שינויים
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 overflow-auto p-6 md:p-8 custom-scrollbar space-y-8 bg-slate-50/30 dark:bg-slate-900/10">
        {lines.map((line, lIdx) => (
          <div key={lIdx} className="flex flex-wrap items-start transition-all rounded-2xl p-3 hover:bg-white dark:hover:bg-slate-800/30">
            {line.map((item, cIdx) => (
              <div
                key={cIdx}
                data-slot="char"
                data-l={lIdx}
                data-c={cIdx}
                className={cn(
                  "relative cursor-pointer flex-none select-none transition-all duration-150 border-b-2 pt-8",
                  item.char === ' ' ? "w-2.5" : "",
                  hoveredSlot?.l === lIdx && hoveredSlot?.c === cIdx
                    ? "bg-indigo-600/20 border-indigo-600 scale-125 rounded-md z-30"
                    : "border-transparent"
                )}
                onPointerEnter={() => !selectedChord && setHoveredSlot({ l: lIdx, c: cIdx })}
                onPointerLeave={() => !selectedChord && setHoveredSlot(null)}
                onClick={() => selectedChord && addChordAt(lIdx, cIdx, selectedChord)}
              >
                <AnimatePresence mode="popLayout">
                  {item.chord && (
                    <motion.div
                      key={`chord-${lIdx}-${cIdx}`}
                      drag
                      dragMomentum={false}
                      dragElastic={0.05}
                      onDrag={handleDrag}
                      onDragEnd={() => handleDragEnd(lIdx, cIdx)}
                      whileDrag={{
                        scale: 1.15,
                        zIndex: 1000,
                        opacity: 0.8,
                        pointerEvents: 'none'
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute top-0 right-0 translate-x-1/2 z-20 cursor-grab active:cursor-grabbing"
                    >
                      <div className="bg-indigo-600 dark:bg-indigo-500 text-white font-black text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1.5 shadow-xl border border-white/20 whitespace-nowrap">
                        {item.chord}
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); removeChord(lIdx, cIdx); }}
                          className="p-0.5 hover:bg-white/20 rounded transition-all"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                      <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-500 absolute -bottom-0.5 right-1/2 translate-x-1/2 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className={cn(
                  "text-lg md:text-xl font-medium transition-all duration-200 block leading-none pointer-events-none",
                  item.chord ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-700 dark:text-slate-300",
                  selectedChord ? "hover:text-indigo-500" : ""
                )}>
                  {item.char || (item.isChordPlaceholder ? '' : '\u00A0')}
                </span>
              </div>
            ))}
          </div>
        ))}
        {lines.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-20 text-slate-300">
            <Music size={40} className="mb-4 opacity-20" />
            <p className="font-bold text-sm">אין תוכן לעריכה</p>
          </div>
        )}
      </div>

      {/* Chord Palette Footer */}
      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex flex-col gap-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">בנק אקורדים</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMON_CHORDS.map(chord => (
              <button
                key={chord}
                onClick={() => setSelectedChord(selectedChord === chord ? null : chord)}
                className={cn(
                  "px-6 py-3 rounded-xl font-black transition-all active:scale-95 border-2 text-sm",
                  selectedChord === chord
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-200 dark:shadow-none"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-700 hover:border-indigo-400 shadow-sm"
                )}
              >
                {chord}
              </button>
            ))}
            <button className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-300 hover:text-indigo-500 hover:border-indigo-500 transition-all hover:bg-indigo-50/50">
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';

export default function SongViewer({ parsedSong, transposition, title, lyricist, composer, containerRef }) {
    const [scrollSpeed, setScrollSpeed] = useState(0);

    useEffect(() => {
        let interval;
        if (scrollSpeed > 0) {
            console.log(`Starting auto-scroll at speed: ${scrollSpeed}`);
            interval = setInterval(() => {
                const container = containerRef?.current || window;
                if (container) {
                    container.scrollBy({ top: scrollSpeed, behavior: 'auto' });
                }
            }, 40); // Slightly faster interval for smoother feel
        }
        return () => {
            if (interval) {
                console.log("Stopping auto-scroll");
                clearInterval(interval);
            }
        };
    }, [scrollSpeed]);

    if (!parsedSong || parsedSong.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                <p>אין תוכן להצגה. התחל בעריכת השיר הראשון שלך!</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Auto-scroll Controls (Floating) */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                <button
                    onClick={() => setScrollSpeed(s => Math.max(0, s - 1))}
                    className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 transition-all active:scale-95"
                    title="האט"
                >
                    <ChevronDown size={24} />
                </button>
                <div className="flex flex-col items-center gap-0.5 px-6 min-w-[140px]">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        {scrollSpeed === 0 ? <Pause size={18} /> : <Play size={18} className="animate-pulse" />}
                        <span className="font-black text-lg tabular-nums">{scrollSpeed}</span>
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">מהירות גלילה</span>
                </div>
                <button
                    onClick={() => setScrollSpeed(s => s + 1)}
                    className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 transition-all active:scale-95"
                    title="מהר"
                >
                    <ChevronUp size={24} />
                </button>
                {scrollSpeed > 0 && (
                    <button
                        onClick={() => setScrollSpeed(0)}
                        className="mr-2 px-5 py-3 text-xs font-black text-white bg-red-500 hover:bg-red-600 rounded-2xl transition-all shadow-lg shadow-red-200 dark:shadow-none uppercase tracking-widest active:scale-95"
                    >
                        עצור
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 md:p-16 rounded-[3rem] shadow-2xl shadow-slate-200/60 dark:shadow-none max-w-4xl mx-auto border border-white dark:border-slate-800 relative overflow-hidden" dir="rtl">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl -ml-32 -mb-32" />

                <div className="mb-14 border-b-2 border-slate-50 dark:border-slate-800 pb-10 relative z-10">
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">{title || 'ללא שם'}</h1>
                    <div className="flex flex-col gap-1">
                        {lyricist && <p className="text-xl md:text-2xl text-slate-400 dark:text-slate-500 font-bold tracking-wide">מילים: {lyricist}</p>}
                        {composer && <p className="text-xl md:text-2xl text-slate-400 dark:text-slate-500 font-bold tracking-wide">לחן: {composer}</p>}
                    </div>

                    <div className="mt-10 flex flex-wrap gap-3">
                        {transposition !== 0 && (
                            <div className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none">
                                טון (טרנספוזיציה): {transposition > 0 ? `+${transposition}` : transposition}
                            </div>
                        )}
                        <div className="inline-flex items-center px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-xs font-black uppercase tracking-widest leading-none border border-slate-200 dark:border-slate-700">
                            מצב הופעה פעיל
                        </div>
                    </div>
                </div>

                <div className="space-y-4 font-medium text-lg md:text-xl leading-relaxed relative z-10 text-slate-800 dark:text-slate-200">
                    {parsedSong.map((line, lineIndex) => (
                        <div key={lineIndex} className="relative flex flex-wrap items-start transition-all rounded-xl px-2 -mx-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            {line.map((part, partIndex) => {
                                if (part.type === 'group') {
                                    return (
                                        <span key={partIndex} className="relative inline-block pt-8 group/part">
                                            <span className="absolute top-0 right-0 translate-x-1/2 text-indigo-600 dark:text-indigo-400 font-black text-xs md:text-sm transition-all duration-300 group-hover/part:scale-110 cursor-default select-none bg-indigo-50/80 dark:bg-indigo-900/40 px-2 py-0.5 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-400/20 whitespace-nowrap z-20">
                                                {part.chord}
                                                <div className="w-1.5 h-1.5 bg-indigo-50 dark:bg-indigo-900/40 absolute -bottom-0.5 right-1/2 translate-x-1/2 rotate-45 border-r border-b border-indigo-100 dark:border-indigo-400/20" />
                                            </span>
                                            <span className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 cursor-default block whitespace-pre-wrap text-right">
                                                {part.text || '\u00A0'}
                                            </span>
                                        </span>
                                    );
                                }
                                return (
                                    <span key={partIndex} className="whitespace-pre-wrap pt-8 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 cursor-default block text-right">
                                        {part.content}
                                    </span>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div className="mt-28 pt-14 border-t border-slate-50 dark:border-slate-800 text-center text-slate-300 dark:text-slate-700 text-sm font-black uppercase tracking-[0.5em] opacity-50">
                    סוף השיר • תצליל
                </div>
            </div>
        </div>
    );
}

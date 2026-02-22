import React from 'react';
import { Music } from 'lucide-react';

export default function SongEditor({ song, setSong }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSong(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-8 bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-[0.2em]">שם השיר</label>
                    <input
                        type="text"
                        name="title"
                        value={song.title || ''}
                        onChange={handleChange}
                        placeholder="למשל: לו יהי"
                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-xl font-bold dark:text-white"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-[0.2em]">מילים</label>
                        <input
                            type="text"
                            name="lyricist"
                            value={song.lyricist || ''}
                            onChange={handleChange}
                            placeholder="מחבר..."
                            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-lg font-bold dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-[0.2em]">לחן</label>
                        <input
                            type="text"
                            name="composer"
                            value={song.composer || ''}
                            onChange={handleChange}
                            placeholder="מלחין..."
                            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-lg font-bold dark:text-white"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-[0.2em]">
                    מילים ואקורדים (השתמש ב-[C] לציון אקורד)
                </label>
                <textarea
                    name="content"
                    value={song.content || ''}
                    onChange={handleChange}
                    rows={15}
                    className="w-full px-6 py-5 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-mono text-lg leading-relaxed dark:text-white resize-none"
                    placeholder="[G]עוד [D]לא [Em]אבדה [C]תקוותנו..."
                />
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex gap-4 items-start">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <Music className="text-white w-5 h-5" />
                </div>
                <div className="text-sm leading-relaxed text-indigo-900/80 dark:text-indigo-400/80">
                    <strong>טיפ מקצועי:</strong> מקם את האקורדים בסוגריים מרובעים בדיוק לפני המילה שהם שייכים אליה.
                    למשל: <code>[Am]אתמול [F]היו היו...</code> האפליקציה תדאג להציב אותם למעלה בצורה מושלמת.
                </div>
            </div>
        </div>
    );
}

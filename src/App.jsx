import React, { useState, useEffect, useRef } from 'react';
import { Plus, Play, Save, Menu, Minus, Music, Trash2, MousePointer2 } from 'lucide-react';
import SongViewer from './components/SongViewer';
import SongEditor from './components/SongEditor';
import InteractiveEditor from './components/InteractiveEditor';
import { parseSong, transposeSong } from './utils/chordLogic';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { db } from './firebase';
import { ref, onValue, set, push, remove } from 'firebase/database';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const SAMPLE_SONG = {
    title: 'לו יהי',
    lyricist: 'נעמי שמר',
    composer: 'נעמי שמר',
    content: `[C]עוד יש מפרש לבן ב[G]אופק
[Am]מול ענן [F]שחור כבד
[C]כל שנבקש [G]לו יהי [F] [C]

[C]ואם בחלונות הערב [G]
[Am]אור נרות ה[F]חג רועד
[C]כל שנבקש [G]לו יהי [F] [C]`
};

export default function App() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSongId, setCurrentSongId] = useState(null);
    const [mode, setMode] = useState('view'); // 'view', 'edit', 'interactive'
    const [transposition, setTransposition] = useState(0);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const scrollContainerRef = useRef(null);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark') ||
            localStorage.getItem('tatzlil_theme') === 'dark' ||
            localStorage.getItem('accord_theme') === 'dark';
    });

    // Sync theme with document and localStorage
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('tatzlil_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('tatzlil_theme', 'light');
        }
    }, [isDarkMode]);

    // Fetch songs from Firebase on mount
    useEffect(() => {
        const songsRef = ref(db, 'songs');
        const unsubscribe = onValue(songsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const songsList = Object.entries(data).map(([id, value]) => ({
                    id,
                    ...value
                }));
                setSongs(songsList.reverse()); // Newest first
            } else {
                setSongs([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateSong = () => {
        const songsRef = ref(db, 'songs');
        const newSongRef = push(songsRef);
        const newSong = {
            title: 'שיר חדש',
            lyricist: '',
            composer: '',
            content: '[C]לחץ על עריכה כדי לכתוב את [G]השיר שלך!'
        };

        set(newSongRef, newSong);
        setCurrentSongId(newSongRef.key);
        setMode('edit');
        setTransposition(0);
    };

    const handleSaveSong = (songData) => {
        if (!currentSongId) return;
        const songRef = ref(db, `songs/${currentSongId}`);
        set(songRef, {
            title: songData.title || 'ללא שם',
            lyricist: songData.lyricist || '',
            composer: songData.composer || '',
            content: songData.content || ''
        });
        setMode('view');
    };

    const handleDeleteSong = (id) => {
        if (confirm('האם אתה בטוח שברצונך למחוק את השיר?')) {
            const songRef = ref(db, `songs/${id}`);
            remove(songRef);
            if (currentSongId === id) setCurrentSongId(null);
        }
    };

    const currentSong = songs.find(s => s.id === currentSongId) || {
        title: '',
        lyricist: '',
        composer: '',
        content: ''
    };

    const parsedContent = parseSong(currentSong.content);
    const transposedContent = transposeSong(parsedContent, transposition);

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans text-slate-800 dark:text-slate-200" dir="rtl">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed md:relative inset-y-0 right-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col z-40 shadow-xl md:shadow-none",
                isSidebarOpen ? "translate-x-0 w-80" : "translate-x-full md:translate-x-0 md:w-0 overflow-hidden"
            )}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Music className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-indigo-900 dark:text-indigo-400">תצליל</span>
                    </div>
                    <button
                        onClick={handleCreateSong}
                        className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        title="שיר חדש"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 text-right">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">טוען שירים...</span>
                        </div>
                    ) : songs.length === 0 ? (
                        <div className="text-center py-10 px-4">
                            <p className="text-slate-400 text-sm italic">אין שירים עדיין...</p>
                        </div>
                    ) : (
                        songs.map(song => (
                            <div
                                key={song.id}
                                onClick={() => {
                                    setCurrentSongId(song.id);
                                    setMode('view');
                                    setTransposition(0);
                                }}
                                className={cn(
                                    "p-4 rounded-2xl cursor-pointer group transition-all relative overflow-hidden flex items-center justify-between",
                                    currentSongId === song.id
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                )}
                            >
                                <div className="flex flex-col min-w-0 flex-1 text-right">
                                    <span className={cn(
                                        "font-bold truncate",
                                        currentSongId === song.id ? "text-white" : "text-slate-800 dark:text-white"
                                    )}>{song.title}</span>
                                    <span className={cn(
                                        "text-xs truncate transition-colors",
                                        currentSongId === song.id ? "text-indigo-100/80" : "text-slate-400 dark:text-slate-500"
                                    )}>{song.lyricist || 'ללא פרטים'} / {song.composer || 'ללא פרטים'}</span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteSong(song.id); }}
                                    className={cn(
                                        "p-2 transition-all rounded-xl opacity-0 group-hover:opacity-100",
                                        currentSongId === song.id
                                            ? "text-white hover:bg-white/10"
                                            : "text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    )}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 mt-auto border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">גרסה</span>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">v0.1.0</span>
                        </div>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:border-indigo-500 transition-all"
                        >
                            {isDarkMode ? <span>☀️ Light</span> : <span>🌙 Dark</span>}
                        </button>
                    </div>
                    <div className="flex items-center gap-2 opacity-30 text-slate-900 dark:text-white justify-center">
                        <Music size={12} />
                        <span className="text-[10px] font-black tracking-[0.3em]">תצליל</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header/Toolbar */}
                <header className="min-h-20 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between px-4 md:px-8 z-10 shrink-0 gap-4">
                    <div className="flex items-center gap-2 md:gap-6">
                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200 dark:border-slate-800 mx-1 md:mx-2 hidden sm:block" />
                        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl md:p-1.5 md:rounded-2xl gap-0.5 md:gap-1">
                            <button
                                onClick={() => setMode('view')}
                                className={cn(
                                    "px-3 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all",
                                    mode === 'view'
                                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                )}
                            >
                                תצוגה
                            </button>
                            <button
                                onClick={() => {
                                    if (currentSongId) setMode('interactive');
                                }}
                                className={cn(
                                    "px-3 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all",
                                    mode === 'interactive'
                                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                )}
                            >
                                עיצוב כורדים
                            </button>
                            <button
                                onClick={() => {
                                    if (currentSongId) setMode('edit');
                                }}
                                className={cn(
                                    "px-3 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all",
                                    mode === 'edit'
                                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                )}
                            >
                                עריכת טקסט
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6 ml-auto md:ml-0">
                        <div className="flex items-center gap-1 md:gap-3 bg-slate-100 dark:bg-slate-900 p-1 md:p-1.5 rounded-xl md:rounded-2xl">
                            <button
                                onClick={() => setTransposition(t => t - 1)}
                                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-lg md:rounded-xl transition-all text-slate-600 dark:text-slate-400 active:scale-95"
                            >
                                <Minus size={16} md:size={18} />
                            </button>
                            <div className="flex flex-col items-center px-2 md:px-4">
                                <span className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">טון</span>
                                <span className="text-xs md:text-sm font-black dark:text-white tabular-nums">{transposition > 0 ? `+${transposition}` : transposition}</span>
                            </div>
                            <button
                                onClick={() => setTransposition(t => t + 1)}
                                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-lg md:rounded-xl transition-all text-slate-600 dark:text-slate-400 active:scale-95"
                            >
                                <Plus size={16} md:size={18} />
                            </button>
                        </div>

                        {mode === 'edit' && currentSongId && (
                            <button
                                onClick={() => handleSaveSong(currentSong)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-[10px] md:text-xs shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Save size={16} md:size={18} />
                                <span className="hidden sm:inline">שמור שיר</span>
                                <span className="sm:hidden">שמור</span>
                            </button>
                        )}
                    </div>
                </header>

                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/20 px-4 md:px-8 py-10"
                >
                    <div className="max-w-5xl mx-auto h-full">
                        {!currentSongId ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-in fade-in zoom-in duration-700">
                                <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] flex items-center justify-center mb-8 border border-indigo-100 dark:border-indigo-900/30">
                                    <Music className="text-indigo-600 dark:text-indigo-400 w-10 h-10" />
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">ברוכים הבאים ל-תצליל</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto leading-relaxed mb-10">
                                    אפליקציית האקורדים שלך. צור שירים, בצע טרנספוזיציה בקלות והופע כמו מקצוען.
                                </p>
                                <button
                                    onClick={handleCreateSong}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-1 active:scale-95"
                                >
                                    צור את השיר הראשון שלך
                                </button>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                                {mode === 'view' ? (
                                    <SongViewer
                                        parsedSong={transposedContent}
                                        transposition={transposition}
                                        title={currentSong.title}
                                        lyricist={currentSong.lyricist}
                                        composer={currentSong.composer}
                                        containerRef={scrollContainerRef}
                                    />
                                ) : mode === 'interactive' ? (
                                    <InteractiveEditor
                                        song={currentSong}
                                        onSave={(updatedData) => {
                                            handleSaveSong(updatedData);
                                        }}
                                        onCancel={() => setMode('view')}
                                    />
                                ) : (
                                    <SongEditor
                                        song={currentSong}
                                        setSong={(updatedData) => {
                                            const newData = typeof updatedData === 'function' ? updatedData(currentSong) : updatedData;
                                            setSongs(songs.map(s => s.id === currentSongId ? { ...s, ...newData } : s));
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

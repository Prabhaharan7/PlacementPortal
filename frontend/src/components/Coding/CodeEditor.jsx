import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, RotateCcw, Settings, Moon, Sun, Type } from 'lucide-react';

const LANGUAGES = [
    { id: 'python', label: 'Python 3', monaco: 'python' },
    { id: 'javascript', label: 'JavaScript', monaco: 'javascript' },
    { id: 'java', label: 'Java', monaco: 'java' },
    { id: 'c', label: 'C', monaco: 'c' },
    { id: 'cpp', label: 'C++', monaco: 'cpp' },
];

const CodeEditor = ({
    code,
    setCode,
    lang,
    setLang,
    onRun,
    onSubmit,
    running,
    submitting,
    onReset
}) => {
    const [theme, setTheme] = useState('vs-dark');
    const [fontSize, setFontSize] = useState(14);
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-[#30363d] bg-[#161b22] shrink-0 gap-2">
                <div className="flex items-center gap-2">
                    {/* Language selector */}
                    <select 
                        value={lang.id} 
                        onChange={e => {
                            const newLang = LANGUAGES.find(l => l.id === e.target.value);
                            setLang(newLang);
                        }}
                        className="bg-[#21262d] border border-[#30363d] rounded-md pl-2.5 pr-7 py-1.5 text-[#c9d1d9] text-xs focus:outline-none focus:border-[#58a6ff] cursor-pointer appearance-none transition-colors"
                    >
                        {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                    </select>

                    {/* Reset code */}
                    <button onClick={onReset} title="Reset code"
                        className="p-1.5 text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded-md transition-colors">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    
                    {/* Settings Toggle */}
                    <div className="relative">
                        <button onClick={() => setShowSettings(!showSettings)} title="Editor Settings"
                            className={`p-1.5 rounded-md transition-colors ${showSettings ? 'text-[#c9d1d9] bg-[#21262d]' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'}`}>
                            <Settings className="w-4 h-4" />
                        </button>
                        
                        {/* Settings Dropdown */}
                        {showSettings && (
                            <div className="absolute top-full mt-1 left-0 z-50 bg-[#161b22] border border-[#30363d] rounded-md shadow-lg p-2 flex gap-2">
                                <button 
                                    onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
                                    className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-[#c9d1d9] hover:bg-[#21262d] rounded-md"
                                    title="Toggle Theme"
                                >
                                    {theme === 'vs-dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                                </button>
                                <div className="flex items-center gap-1 px-2 border-l border-[#30363d]">
                                    <Type className="w-3.5 h-3.5 text-[#8b949e] mr-1" />
                                    <button 
                                        onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                                        className="w-6 h-6 flex items-center justify-center text-[#c9d1d9] hover:bg-[#21262d] rounded"
                                    >-</button>
                                    <span className="text-xs text-[#c9d1d9] w-4 text-center">{fontSize}</span>
                                    <button 
                                        onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                                        className="w-6 h-6 flex items-center justify-center text-[#c9d1d9] hover:bg-[#21262d] rounded"
                                    >+</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Run */}
                    <button onClick={onRun} disabled={running || submitting}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-md text-[#c9d1d9] text-xs font-medium hover:bg-[#30363d] disabled:opacity-40 transition-colors">
                        {running ? (
                            <><div className="w-3 h-3 border border-[#c9d1d9] border-t-transparent rounded-full animate-spin" /> Running…</>
                        ) : (
                            <><Play className="w-3.5 h-3.5 text-green-400" /> Run Code</>
                        )}
                    </button>

                    {/* Submit */}
                    <button onClick={onSubmit} disabled={running || submitting}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1f6feb] hover:bg-[#388bfd] rounded-md text-white text-xs font-semibold disabled:opacity-40 transition-colors">
                        {submitting ? (
                            <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Judging…</>
                        ) : (
                            <><Send className="w-3.5 h-3.5" /> Submit</>
                        )}
                    </button>
                </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 overflow-hidden relative">
                <Editor
                    height="100%"
                    language={lang.monaco}
                    theme={theme}
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    options={{
                        fontSize: fontSize,
                        lineHeight: fontSize * 1.5,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        padding: { top: 12, bottom: 12 },
                        fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                        fontLigatures: true,
                        cursorBlinking: 'smooth',
                        renderLineHighlight: 'gutter',
                        tabSize: 4,
                        automaticLayout: true,
                    }}
                />
            </div>
        </div>
    );
};

export default CodeEditor;

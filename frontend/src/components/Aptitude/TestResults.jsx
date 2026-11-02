import React from 'react';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, AlertCircle, Zap } from 'lucide-react';

const TestResults = ({ result, questions, test, onBack, onRetry }) => {
    // Determine score category for styling
    // The previous ResultScreen extracted this dynamically. 
    // Here we'll expect raw numbers, or we can calculate based on correct/total matching.
    const score = result.score || 0;
    const total = result.total || questions.length;
    const percentage = result.percentage || Math.round((score / total) * 100) || 0;
    const results = result.results || [];

    const band = percentage >= 80 
        ? { label: 'Excellent Work!', color: 'text-emerald-400', bg: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20' }
        : percentage >= 60 
            ? { label: 'Good Effort!', color: 'text-blue-400', bg: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20' }
            : percentage >= 40 
                ? { label: 'Keep Trying', color: 'text-amber-400', bg: 'from-amber-500/10 to-orange-500/10 border-amber-500/20' }
                : { label: 'Needs Practice', color: 'text-rose-400', bg: 'from-rose-500/10 to-red-500/10 border-rose-500/20' };

    const correctCount = results.filter(r => r.is_correct).length;
    const wrongCount = results.filter(r => !r.is_correct && r.selected).length;
    const skippedCount = results.filter(r => !r.selected).length;

    return (
        <div className="max-w-5xl mx-auto w-full p-4 md:p-8 animate-fade-in space-y-8 pb-20">
            {/* Header / Score Card */}
            <div className={`bg-gradient-to-br ${band.bg} border-2 rounded-3xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden`}>
                <div className="relative z-10">
                    <p className="text-text-secondary font-bold uppercase tracking-wider mb-2">Your Score</p>
                    <div className={`text-7xl md:text-8xl font-black ${band.color} mb-4 tracking-tighter`}>{percentage}%</div>
                    <p className="text-text-primary text-2xl font-bold mb-2">{band.label}</p>
                    <p className="text-text-secondary font-medium">{score} out of {total} questions correct</p>
                </div>

                {/* Stat pills */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-8 relative z-10">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-4 text-center min-w-[120px]">
                        <p className="text-emerald-400 text-3xl font-black mb-1">{correctCount}</p>
                        <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-wider">Correct</p>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl px-6 py-4 text-center min-w-[120px]">
                        <p className="text-rose-400 text-3xl font-black mb-1">{wrongCount}</p>
                        <p className="text-rose-400/80 text-xs font-bold uppercase tracking-wider">Wrong</p>
                    </div>
                    <div className="bg-secondary border border-border rounded-2xl px-6 py-4 text-center min-w-[120px]">
                        <p className="text-text-primary text-3xl font-black mb-1">{skippedCount}</p>
                        <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">Skipped</p>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-4 py-4">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 px-8 py-4 bg-secondary border border-border hover:bg-border text-text-primary rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </button>
                <button 
                    onClick={onRetry}
                    className="flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                    <RotateCcw className="w-5 h-5" /> Retake Test
                </button>
            </div>

            {/* In-depth Review */}
            <div>
                <h3 className="text-text-primary font-bold text-xl mb-6 flex items-center gap-2 pb-2 border-b border-border">
                    <Zap className="w-6 h-6 text-accent" /> In-Depth Review
                </h3>
                
                <div className="space-y-4">
                    {results.map((r, i) => {
                        const q = questions.find(q => q.id === r.question_id);
                        if (!q) return null;
                        
                        const isCorrect = r.is_correct;
                        const isSkipped = !r.selected;

                        return (
                            <div key={i} className={`bg-card border-2 rounded-2xl overflow-hidden transition-all shadow-sm
                                ${isCorrect ? 'border-emerald-500/30' : isSkipped ? 'border-border' : 'border-rose-500/30'}`}>
                                
                                <div className={`flex flex-col md:flex-row gap-4 p-5 md:p-6 
                                    ${isCorrect ? 'bg-emerald-500/5' : isSkipped ? '' : 'bg-rose-500/5'}`}>
                                    
                                    <div className="shrink-0 pt-0.5">
                                        {isCorrect 
                                            ? <CheckCircle className="w-6 h-6 text-emerald-400" />
                                            : isSkipped
                                                ? <AlertCircle className="w-6 h-6 text-text-secondary" />
                                                : <XCircle className="w-6 h-6 text-rose-400" />}
                                    </div>
                                    
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-text-secondary text-sm font-bold bg-secondary px-2 py-0.5 rounded">Q{i + 1}</span>
                                            {q.topic && <span className="text-xs font-semibold px-2 py-0.5 border border-border rounded-full text-text-secondary capitalize">{q.topic.replace('_', ' ')}</span>}
                                        </div>
                                        
                                        <p className="text-text-primary text-base font-medium mb-4 leading-relaxed">
                                            {q.question_text || q.text}
                                        </p>

                                        {/* Display the selected / correct options */}
                                        <div className="space-y-2 mt-4">
                                            {isSkipped ? (
                                                <div className="flex items-start gap-2 bg-secondary/50 rounded-lg p-3 border border-border">
                                                    <span className="text-text-secondary font-semibold shrink-0">Skipped.</span>
                                                    <span className="text-text-secondary">Expected: <span className="text-emerald-400 font-bold">{r.correct}</span></span>
                                                </div>
                                            ) : (
                                                <div className="grid gap-2">
                                                    <div className={`p-3 rounded-lg border flex items-center justify-between
                                                        ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                                                        <span><strong className="opacity-70 text-xs tracking-wider uppercase mr-2 pointer-events-none">Your Answer:</strong> {r.selected}</span>
                                                        {isCorrect ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                                                    </div>
                                                    
                                                    {!isCorrect && (
                                                        <div className="p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 flex items-center justify-between mt-1">
                                                            <span><strong className="opacity-70 text-xs tracking-wider uppercase mr-2 pointer-events-none">Correct Answer:</strong> {r.correct}</span>
                                                            <CheckCircle className="w-4 h-4 shrink-0" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Explanation */}
                                        {r.explanation && (
                                            <div className="mt-4 bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3">
                                                <Zap className="w-5 h-5 text-accent shrink-0 pt-0.5" />
                                                <div className="text-sm text-text-secondary leading-relaxed">
                                                    <strong className="text-text-primary block mb-1">Explanation:</strong> 
                                                    {r.explanation}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TestResults;

import React from 'react';
import { Star } from 'lucide-react';

const QuestionPalette = ({ questions, answers, current, onSelect, flagged }) => {
    const answeredCount = Object.keys(answers).length;
    const progress = Math.round((answeredCount / questions.length) * 100);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border shrink-0">
                <p className="text-text-primary font-bold mb-3">Question Navigator</p>
                <div className="flex flex-col gap-2 text-xs text-text-secondary">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-accent" /> Answered</span>
                        <span className="font-semibold text-text-primary">{answeredCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-500" /> Marked</span>
                        <span className="font-semibold text-text-primary">{flagged.size}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-secondary border border-border" /> Not Visited/Answered</span>
                        <span className="font-semibold text-text-primary">{questions.length - answeredCount}</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-text-secondary mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                        const isAns = answers[String(q.id)] !== undefined && answers[String(q.id)] !== '' && (!Array.isArray(answers[String(q.id)]) || answers[String(q.id)].length > 0);
                        const isFlagged = flagged.has(idx);
                        const isCurrent = idx === current;
                        
                        return (
                            <button 
                                key={q.id} 
                                onClick={() => onSelect(idx)}
                                className={`
                                    w-full aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-all relative border-2
                                    ${isCurrent 
                                        ? 'border-accent scale-110 z-10' 
                                        : 'hover:border-text-secondary border-transparent'
                                    }
                                    ${isAns 
                                        ? 'bg-accent text-white' 
                                        : isFlagged 
                                            ? 'bg-amber-500 text-white' 
                                            : 'bg-secondary text-text-secondary border-border border'
                                    }
                                `}
                            >
                                {idx + 1}
                                {isFlagged && isAns && (
                                    <Star className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 text-amber-500 fill-amber-500 bg-card rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default QuestionPalette;

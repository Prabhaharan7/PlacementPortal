import React from 'react';

const Question = ({ question, answer, onAnswer }) => {
    if (!question) return null;

    const options = [
        { key: 'A', text: question.option_a },
        { key: 'B', text: question.option_b },
        { key: 'C', text: question.option_c },
        { key: 'D', text: question.option_d },
    ].filter(opt => opt.text); // In case some are empty

    return (
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 animate-fade-in shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary bg-secondary px-3 py-1 rounded-full">
                    {question.topic ? question.topic.replace('_', ' ') : 'Multiple Choice'}
                </span>
                <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">
                    {question.difficulty || 'Medium'}
                </span>
            </div>
            
            <h3 className="text-xl text-text-primary font-medium leading-relaxed mb-8">
                {question.text || question.question_text}
            </h3>

            <div className="space-y-3 mt-auto">
                {options.map((opt) => {
                    const selected = answer === opt.key;
                    return (
                        <button
                            key={opt.key}
                            onClick={() => onAnswer(opt.key)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 flex items-center gap-4 group
                                ${selected
                                    ? 'border-accent bg-accent/10 text-accent shadow-sm shadow-accent/20'
                                    : 'border-border bg-card text-text-primary hover:border-accent/50 hover:bg-secondary'}`}
                        >
                            <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-all
                                ${selected ? 'border-accent bg-accent text-white' : 'border-border group-hover:border-accent/50'}`}>
                                {opt.key}
                            </span>
                            <span className="text-base leading-relaxed">{opt.text}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Question;

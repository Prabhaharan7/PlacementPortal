import React from 'react';
import { BookOpen, Clock, Play, Target, AlertTriangle } from 'lucide-react';

const TestInstructions = ({ test, onStart }) => {
    if (!test) return null;

    return (
        <div className="max-w-4xl mx-auto w-full p-6 md:p-10 animate-fade-in">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
                
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-accent/20 rounded-xl">
                        <Target className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary mb-1">{test.title}</h1>
                        <p className="text-text-secondary text-sm">Read the instructions carefully before starting</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-secondary rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-2 text-text-secondary mb-1">
                            <BookOpen className="w-4 h-4" /> <span className="text-xs font-semibold uppercase">Questions</span>
                        </div>
                        <p className="text-2xl font-bold text-text-primary">{test.question_count || 0}</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-2 text-text-secondary mb-1">
                            <Clock className="w-4 h-4" /> <span className="text-xs font-semibold uppercase">Duration</span>
                        </div>
                        <p className="text-2xl font-bold text-text-primary">{test.duration} <span className="text-sm font-medium">mins</span></p>
                    </div>
                    <div className="bg-secondary rounded-xl p-4 border border-border md:col-span-2">
                        <div className="flex items-center gap-2 text-text-secondary mb-1">
                            <AlertTriangle className="w-4 h-4" /> <span className="text-xs font-semibold uppercase">Total Marks</span>
                        </div>
                        <p className="text-2xl font-bold text-text-primary">
                            {(test.question_count || 0) * 1}
                        </p>
                    </div>
                </div>

                <div className="space-y-6 mb-8">
                    <div>
                        <h3 className="text-text-primary font-semibold text-lg mb-3">General Instructions</h3>
                        <ul className="space-y-2 text-sm text-text-secondary list-disc list-inside">
                            <li>The test contains multiple question types (MCQ, Multiple Select, True/False, Fill in the blanks).</li>
                            <li>You can navigate between questions using the Question Palette.</li>
                            <li>You can mark questions for review and return to them later.</li>
                            <li>The test will automatically submit when the timer runs out.</li>
                            <li>Do not refresh the page or close the browser tab during the test. Your progress is auto-saved, but it's best to avoid interruptions.</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-6 flex justify-end">
                    <button
                        onClick={onStart}
                        className="flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5"
                    >
                        <Play className="w-5 h-5" />
                        Start Test Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestInstructions;

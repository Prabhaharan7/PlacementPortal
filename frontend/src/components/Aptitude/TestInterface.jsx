import React, { useState, useEffect, useRef } from 'react';
import { Target, CheckCircle, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import Timer from './Timer';
import Question from './Question';
import QuestionPalette from './QuestionPalette';
import { apiCall } from '../../services/api';

const TestInterface = ({ test, questions, attemptId, onFinish }) => {
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState(() => {
        try {
            const saved = localStorage.getItem(`test_${test.id}_progress`);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });
    const [flagged, setFlagged] = useState(() => {
        try {
            const saved = localStorage.getItem(`test_${test.id}_flagged`);
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });
    const [submitting, setSubmitting] = useState(false);
    const submitRef = useRef(false);

    // Auto-save to localStorage
    useEffect(() => {
        localStorage.setItem(`test_${test.id}_progress`, JSON.stringify(answers));
        localStorage.setItem(`test_${test.id}_flagged`, JSON.stringify(Array.from(flagged)));
        
        // Optional Backend Auto-Save
        // if (attemptId) {
        //     apiCall(`/api/aptitude/tests/${attemptId}/save-progress/`, 'POST', { answers }).catch(() => {});
        // }
    }, [answers, flagged, test.id, attemptId]);

    const handleAnswer = (val) => {
        setAnswers(prev => ({ ...prev, [String(questions[current].id)]: val }));
    };

    const toggleFlag = () => {
        setFlagged(prev => {
            const next = new Set(prev);
            next.has(current) ? next.delete(current) : next.add(current);
            return next;
        });
    };

    const doSubmit = async (auto = false) => {
        if (submitRef.current || !attemptId) return;
        
        const answeredCount = Object.keys(answers).length;
        if (!auto) {
            const unanswered = questions.length - answeredCount;
            if (unanswered > 0 && !window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
                return;
            } else if (unanswered === 0 && !window.confirm(`Are you sure you want to submit your test?`)) {
                return;
            }
        }
        
        submitRef.current = true;
        setSubmitting(true);
        try {
            const result = await apiCall(`/api/tests/${attemptId}/submit/`, 'POST', { answers });
            localStorage.removeItem(`test_${test.id}_progress`);
            localStorage.removeItem(`test_${test.id}_flagged`);
            onFinish(result, questions);
        } catch (e) {
            alert('Submission failed: ' + e.message);
            submitRef.current = false;
            setSubmitting(false);
        }
    };

    if (!questions || questions.length === 0) return null;

    const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] -m-6 overflow-hidden bg-primary animate-fade-in">
            {/* Top Bar */}
            <div className="bg-card border-b border-border px-4 py-3 md:px-6 md:py-4 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <Target className="w-6 h-6 text-accent hidden sm:block" />
                    <h2 className="text-text-primary font-bold text-lg hidden sm:block">{test.title}</h2>
                    <h2 className="text-text-primary font-bold text-base sm:hidden">Test in Progress</h2>
                </div>

                <Timer 
                    initialSeconds={test.duration * 60} 
                    onTimeUp={() => doSubmit(true)} 
                />

                <button 
                    onClick={() => doSubmit(false)} 
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold disabled:opacity-50 transition-colors shadow-sm"
                >
                    <CheckCircle className="w-4 h-4 hidden sm:block" />
                    {submitting ? 'Submitting…' : 'Submit Test'}
                </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-border shrink-0">
                <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Question Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
                    <div className="w-full max-w-3xl flex-1 flex flex-col">
                        
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-text-secondary text-sm font-medium bg-card border border-border px-4 py-1.5 rounded-full shadow-sm">
                                Question <span className="text-text-primary font-bold md:text-lg">{current + 1}</span> of {questions.length}
                            </span>
                            
                            <button 
                                onClick={toggleFlag}
                                className={`text-sm flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all font-medium
                                    ${flagged.has(current)
                                        ? 'text-amber-500 bg-amber-500/10 border-amber-500/30 shadow-sm'
                                        : 'text-text-secondary bg-card border-border hover:border-amber-500/30 hover:text-amber-500'}`}
                            >
                                <Star className={`w-4 h-4 ${flagged.has(current) ? 'fill-amber-500' : ''}`} />
                                {flagged.has(current) ? 'Marked for Review' : 'Mark for Review'}
                            </button>
                        </div>

                        <div className="flex-1 w-full">
                            <Question 
                                question={questions[current]} 
                                answer={answers[String(questions[current].id)]}
                                onAnswer={handleAnswer} 
                            />
                        </div>

                        {/* Navigation Controls */}
                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
                            <button 
                                onClick={() => setCurrent(p => Math.max(0, p - 1))} 
                                disabled={current === 0}
                                className="flex items-center gap-2 px-6 py-3 bg-secondary border border-border hover:bg-border rounded-xl text-text-primary text-sm font-bold disabled:opacity-30 transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" /> Previous
                            </button>
                            
                            {current < questions.length - 1 ? (
                                <button 
                                    onClick={() => setCurrent(p => p + 1)}
                                    className="flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:-translate-y-0.5"
                                >
                                    Next Question <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => doSubmit(false)} 
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all shadow-md hover:-translate-y-0.5"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    {submitting ? 'Submitting…' : 'Submit Final'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Palette Area */}
                <div className="w-72 md:w-80 shrink-0 border-l border-border bg-card hidden lg:block shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] z-10">
                    <QuestionPalette 
                        questions={questions}
                        answers={answers}
                        current={current}
                        onSelect={setCurrent}
                        flagged={flagged}
                    />
                </div>
            </div>
            
            {/* Mobile Palette Drawer could be added here if needed */}
        </div>
    );
};

export default TestInterface;

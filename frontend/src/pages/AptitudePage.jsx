// Placeholder for AptitudePage.jsx
import React, { useState, useEffect } from 'react';
import { Brain, Clock, Trophy, Play, CheckCircle, TrendingUp, BarChart2, Zap } from 'lucide-react';
import { aptitudeAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';


const AptitudePage = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState([
        {
            id: 1,
            title: 'Quantitative Aptitude',
            questions: 50,
            duration: 60,
            difficulty: 'Medium',
            completed: false,
            score: null,
            category: 'Math'
        },
        {
            id: 2,
            title: 'Logical Reasoning',
            questions: 40,
            duration: 45,
            difficulty: 'Hard',
            completed: true,
            score: 85,
            category: 'Logic'
        },
        {
            id: 3,
            title: 'Verbal Ability',
            questions: 35,
            duration: 40,
            difficulty: 'Easy',
            completed: false,
            score: null,
            category: 'Verbal'
        },
        {
            id: 4,
            title: 'Data Interpretation',
            questions: 30,
            duration: 50,
            difficulty: 'Hard',
            completed: true,
            score: 72,
            category: 'Data'
        },
    ]);

    const [filter, setFilter] = useState('all');
    const [results, setResults] = useState([
        { id: 1, test: 'Logical Reasoning', score: 85, date: '2024-02-10', rank: 12 },
        { id: 2, test: 'Data Interpretation', score: 72, date: '2024-02-08', rank: 24 },
        { id: 3, test: 'Quantitative Aptitude', score: 90, date: '2024-02-05', rank: 5 },
    ]);

    useEffect(() => {
        // Fetch tests and results
        // aptitudeAPI.getTests().then(setTests);
        // aptitudeAPI.getResults().then(setResults);
    }, []);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-success bg-success/20';
            case 'Medium': return 'text-warning bg-warning/20';
            case 'Hard': return 'text-danger bg-danger/20';
            default: return 'text-text-secondary bg-secondary';
        }
    };

    const TestCard = ({ test }) => (
        <div className="bg-card border border-border rounded-xl p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-accent/20 rounded-lg">
                        <Brain className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">{test.title}</h3>
                        <p className="text-sm text-text-secondary">{test.category}</p>
                    </div>
                </div>
                {test.completed && (
                    <div className="flex items-center space-x-1 bg-success/20 px-3 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-success text-sm font-medium">{test.score}%</span>
                    </div>
                )}
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Questions</span>
                    <span className="text-text-primary font-medium">{test.questions}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Duration</span>
                    <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="text-text-primary font-medium">{test.duration} mins</span>
                    </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Difficulty</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                        {test.difficulty}
                    </span>
                </div>
            </div>

            <button 
                onClick={() => navigate(`/aptitude/test/${test.id}`)}
                className={`
        w-full py-3 rounded-lg font-medium transition-all duration-200
        ${test.completed
                    ? 'bg-secondary hover:bg-primary text-text-primary border border-border'
                    : 'bg-accent hover:bg-accent-hover text-text-primary shadow-lg hover:shadow-xl'
                }
      `}>
                <div className="flex items-center justify-center space-x-2">
                    {test.completed ? (
                        <>
                            <Trophy className="w-4 h-4" />
                            <span>Retake Test</span>
                        </>
                    ) : (
                         <>
                             <Play className="w-4 h-4" />
                             <span>Start Test</span>
                         </>
                     )}
                 </div>
             </button>
        </div>
    );

    const ResultRow = ({ result }) => (
        <tr className="border-b border-border hover:bg-primary/50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-accent/20 rounded-lg">
                        <Brain className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-text-primary font-medium">{result.test}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                        <div
                            className="bg-accent h-2 rounded-full"
                            style={{ width: `${result.score}%` }}
                        />
                    </div>
                    <span className="text-text-primary font-medium w-12">{result.score}%</span>
                </div>
            </td>
            <td className="px-6 py-4 text-text-secondary">
                {new Date(result.date).toLocaleDateString()}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center space-x-1">
                    <Trophy className="w-4 h-4 text-warning" />
                    <span className="text-text-primary font-medium">#{result.rank}</span>
                </div>
            </td>
        </tr>
    );

    const filteredTests = filter === 'all'
        ? tests
        : filter === 'completed'
            ? tests.filter(t => t.completed)
            : tests.filter(t => !t.completed);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Aptitude Tests</h1>
                    <p className="text-text-secondary">Practice and improve your aptitude skills</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/aptitude/analytics')} className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-xl text-text-secondary hover:text-accent hover:border-accent/50 transition-all text-sm">
                        <BarChart2 className="w-4 h-4" /> View Analytics
                    </button>
                    <button onClick={() => navigate('/aptitude/tests')} className="btn-primary flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4" /> Take Live Tests
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <Brain className="w-5 h-5 text-accent" />
                        <span className="text-text-secondary">Tests Completed</span>
                    </div>
                    <p className="text-3xl font-bold text-text-primary">
                        {tests.filter(t => t.completed).length}/{tests.length}
                    </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <Trophy className="w-5 h-5 text-warning" />
                        <span className="text-text-secondary">Average Score</span>
                    </div>
                    <p className="text-3xl font-bold text-text-primary">82%</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-success" />
                        <span className="text-text-secondary">Improvement</span>
                    </div>
                    <p className="text-3xl font-bold text-text-primary">+15%</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                        ? 'bg-accent text-text-primary'
                        : 'bg-secondary text-text-secondary hover:text-text-primary'
                        }`}
                >
                    All Tests
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending'
                        ? 'bg-accent text-text-primary'
                        : 'bg-secondary text-text-secondary hover:text-text-primary'
                        }`}
                >
                    Pending
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'completed'
                        ? 'bg-accent text-text-primary'
                        : 'bg-secondary text-text-secondary hover:text-text-primary'
                        }`}
                >
                    Completed
                </button>
            </div>

            {/* Tests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map(test => (
                    <TestCard key={test.id} test={test} />
                ))}
            </div>

            {/* Results Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-text-primary">Recent Results</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="px-6 py-4 text-left text-text-secondary font-medium">Test</th>
                                <th className="px-6 py-4 text-left text-text-secondary font-medium">Score</th>
                                <th className="px-6 py-4 text-left text-text-secondary font-medium">Date</th>
                                <th className="px-6 py-4 text-left text-text-secondary font-medium">Rank</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map(result => (
                                <ResultRow key={result.id} result={result} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AptitudePage;

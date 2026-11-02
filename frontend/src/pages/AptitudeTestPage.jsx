import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api';
import TestInstructions from '../components/Aptitude/TestInstructions';
import TestInterface from '../components/Aptitude/TestInterface';
import TestResults from '../components/Aptitude/TestResults';

const AptitudeTestPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Screens: 'instructions', 'active', 'results'
    const [screen, setScreen] = useState('instructions');
    const [attemptId, setAttemptId] = useState(null);
    const [resultData, setResultData] = useState(null);

    useEffect(() => {
        const fetchTestDetails = async () => {
            try {
                // Fetch the list of tests and find currently requested one
                const data = await apiCall(`/api/tests/`);
                const allTests = data.tests || [];
                const foundTest = allTests.find(t => String(t.id) === String(id));
                if (!foundTest) {
                    throw new Error("Test not found");
                }
                setTest(foundTest);
            } catch (err) {
                setError(err.message || 'Failed to fetch test details');
            } finally {
                setLoading(false);
            }
        };
        fetchTestDetails();
    }, [id]);

    const handleStart = async () => {
        try {
            // Start the test to get questions and attempt ID
            const data = await apiCall(`/api/tests/${id}/start/`, 'POST', {});
            setAttemptId(data.attempt_id);
            setQuestions(data.questions || []);
            setScreen('active');
        } catch (err) {
            alert("Failed to start test: " + err.message);
        }
    };

    const handleFinish = (result) => {
        setResultData(result);
        setScreen('results');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
                <p className="text-text-secondary font-medium">Loading test...</p>
            </div>
        );
    }

    if (error || !test) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center px-4">
                <div className="p-4 bg-rose-500/10 rounded-full">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-text-primary text-xl font-bold">Error Loading Test</h3>
                <p className="text-text-secondary">{error || "Test not found."}</p>
                <button 
                    onClick={() => navigate('/aptitude')}
                    className="mt-4 px-6 py-2 bg-secondary hover:bg-border border border-border rounded-xl text-text-primary font-semibold transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            {screen === 'instructions' && (
                <TestInstructions 
                    test={test} 
                    onStart={handleStart} 
                />
            )}
            
            {screen === 'active' && (
                <TestInterface 
                    test={test} 
                    questions={questions} 
                    attemptId={attemptId}
                    onFinish={handleFinish} 
                />
            )}
            
            {screen === 'results' && (
                <TestResults 
                    test={test}
                    questions={questions}
                    result={resultData}
                    onBack={() => navigate('/aptitude')}
                    onRetry={() => {
                        setScreen('instructions');
                        setResultData(null);
                    }}
                />
            )}
        </div>
    );
};

export default AptitudeTestPage;

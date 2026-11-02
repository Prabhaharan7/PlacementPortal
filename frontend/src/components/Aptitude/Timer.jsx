import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const Timer = ({ initialSeconds, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }
        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, onTimeUp]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        
        if (h > 0) {
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const isUrgent = timeLeft < 120; // less than 2 minutes

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold transition-colors border
            ${isUrgent 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse' 
                : 'bg-secondary border-border text-text-primary'}`}>
            <Clock className={`w-5 h-5 ${isUrgent ? 'text-rose-400' : 'text-accent'}`} />
            {formatTime(timeLeft)}
        </div>
    );
};

export default Timer;

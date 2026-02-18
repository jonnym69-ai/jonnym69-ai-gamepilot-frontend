import React from 'react';
export interface MoodBarProps {
    currentMood?: string;
    moods: Array<{
        id: string;
        name: string;
        emoji: string;
        color: string;
        intensity: number;
        active?: boolean;
    }>;
    onMoodChange?: (moodId: string) => void;
    className?: string;
    variant?: 'compact' | 'full' | 'minimal';
}
export declare const MoodBar: React.FC<MoodBarProps>;

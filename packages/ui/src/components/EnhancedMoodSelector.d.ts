import React from 'react';
import { type EnhancedMoodId } from '@gamepilot/static-data';
import { type MoodFilterContext } from '@gamepilot/identity-engine';
export interface EnhancedMoodSelectorProps {
    onMoodChange?: (context: MoodFilterContext) => void;
    initialMood?: EnhancedMoodId;
    initialSecondaryMood?: EnhancedMoodId;
    showCombinations?: boolean;
    variant?: 'compact' | 'full' | 'minimal';
    className?: string;
    enableHybridMode?: boolean;
}
export declare const EnhancedMoodSelector: React.FC<EnhancedMoodSelectorProps>;

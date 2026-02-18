import React from 'react';
export interface ActivityItem {
    id: string;
    type: 'game' | 'friend' | 'achievement' | 'community';
    title: string;
    description?: string;
    timestamp: Date;
    user?: string;
    avatar?: string;
    icon?: string;
    intensity?: 'low' | 'medium' | 'high';
}
export interface ActivityPulseProps {
    activities: ActivityItem[];
    maxItems?: number;
    refreshInterval?: number;
    onRefresh?: () => void;
    className?: string;
    variant?: 'compact' | 'detailed' | 'minimal';
}
export declare const ActivityPulse: React.FC<ActivityPulseProps>;

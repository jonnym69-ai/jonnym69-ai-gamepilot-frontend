import React from 'react';
export interface SpotlightProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'hero' | 'featured' | 'card';
    intensity?: 'subtle' | 'medium' | 'strong';
    color?: 'blue' | 'purple' | 'orange' | 'green' | 'pink';
}
export declare const Spotlight: React.FC<SpotlightProps>;

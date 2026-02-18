import React from 'react';
export interface GameTileProps {
    title: string;
    genre: string;
    coverImage?: string;
    rating?: number;
    playtime?: number;
    lastPlayed?: Date;
    mood?: string;
    isPlaying?: boolean;
    size?: 'small' | 'medium' | 'large';
    onClick?: () => void;
    className?: string;
    children?: React.ReactNode;
}
export declare const GameTile: React.FC<GameTileProps>;

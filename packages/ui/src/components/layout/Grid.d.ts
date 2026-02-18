import React from 'react';
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
    cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    gap?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12;
    autoFit?: boolean;
    autoFill?: boolean;
    cinematic?: boolean;
    children: React.ReactNode;
}
export declare const Grid: React.FC<GridProps>;
export {};

import React from 'react';
interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
    direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
    align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
    gap?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;
    items?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
    self?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
    cinematic?: boolean;
    children: React.ReactNode;
}
export declare const Flex: React.FC<FlexProps>;
export {};

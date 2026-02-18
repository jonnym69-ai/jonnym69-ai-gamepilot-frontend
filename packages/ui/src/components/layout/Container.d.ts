import React from 'react';
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    centered?: boolean;
    cinematic?: boolean;
    children: React.ReactNode;
}
export declare const Container: React.FC<ContainerProps>;
export {};

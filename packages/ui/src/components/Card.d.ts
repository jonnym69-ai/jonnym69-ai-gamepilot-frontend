import React, { ReactNode } from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const cardVariants: (props?: ({
    variant?: "gaming" | "default" | "neon" | "retro" | "cyberpunk" | "glass" | "glass-dark" | "glass-light" | "solid" | "solid-primary" | "solid-accent" | "minimal" | "flat" | "featured" | "hero" | null | undefined;
    size?: "sm" | "lg" | "xl" | "md" | null | undefined;
    interactive?: boolean | null | undefined;
    animated?: boolean | null | undefined;
    glow?: "none" | "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "info" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
    header?: ReactNode;
    body?: ReactNode;
    footer?: ReactNode;
    overlay?: ReactNode;
    cinematic?: boolean;
}
export declare const Card: React.FC<CardProps>;
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    icon?: ReactNode;
    actions?: ReactNode;
}
export declare const CardHeader: React.FC<CardHeaderProps>;
interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare const CardBody: React.FC<CardBodyProps>;
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare const CardFooter: React.FC<CardFooterProps>;
interface CardMediaProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
    overlay?: boolean;
}
export declare const CardMedia: React.FC<CardMediaProps>;
export {};

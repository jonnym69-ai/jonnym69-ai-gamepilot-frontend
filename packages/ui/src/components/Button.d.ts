import React, { ReactNode } from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const buttonVariants: (props?: ({
    variant?: "gaming" | "link" | "primary" | "secondary" | "accent" | "outline-primary" | "outline-secondary" | "outline-accent" | "ghost-primary" | "ghost-secondary" | "ghost-accent" | "link-secondary" | "link-accent" | "neon" | "retro" | "cyberpunk" | "success" | "warning" | "error" | "info" | null | undefined;
    size?: "xs" | "sm" | "lg" | "xl" | "2xl" | "md" | null | undefined;
    fullWidth?: boolean | null | undefined;
    rounded?: "sm" | "lg" | "xl" | "none" | "md" | "full" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    loading?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    cinematic?: boolean;
}
export declare const Button: React.FC<ButtonProps>;
export {};

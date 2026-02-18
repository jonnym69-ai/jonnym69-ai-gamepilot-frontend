import React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const inputVariants: (props?: ({
    variant?: "gaming" | "default" | "primary" | "secondary" | "accent" | "neon" | "retro" | "cyberpunk" | "glass" | "glass-dark" | "glass-light" | "minimal" | "flat" | null | undefined;
    size?: "sm" | "lg" | "xl" | "md" | null | undefined;
    state?: "default" | "success" | "warning" | "error" | null | undefined;
    fullWidth?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {
    label?: string;
    description?: string;
    error?: string;
    success?: string;
    warning?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    leftAddon?: React.ReactNode;
    rightAddon?: React.ReactNode;
    cinematic?: boolean;
}
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
}
export declare const SearchInput: React.FC<SearchInputProps>;
interface NumberInputProps extends Omit<InputProps, 'type'> {
}
export declare const NumberInput: React.FC<NumberInputProps>;
interface TextAreaInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
    variant?: 'default' | 'glass' | 'gaming';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}
export declare const TextArea: React.FC<TextAreaInputProps>;
interface SelectInputProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    variant?: 'default' | 'glass' | 'gaming';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    options: Array<{
        value: string | number;
        label: string;
        disabled?: boolean;
    }>;
}
export declare const Select: React.FC<SelectInputProps>;
export {};

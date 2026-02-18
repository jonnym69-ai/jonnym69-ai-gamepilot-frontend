import React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const panelVariants: (props?: ({
    variant?: "gaming" | "neon" | "retro" | "cyberpunk" | "glass" | "glass-dark" | "glass-light" | "solid" | "solid-primary" | "solid-accent" | "minimal" | "glass-primary" | "glass-accent" | "subtle" | null | undefined;
    size?: "sm" | "lg" | "xl" | "md" | "full" | null | undefined;
    rounded?: "sm" | "lg" | "xl" | "2xl" | "none" | "md" | "full" | null | undefined;
    shadow?: "sm" | "lg" | "xl" | "none" | "glow" | "cinematic" | "md" | null | undefined;
    animated?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface PanelProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof panelVariants> {
    header?: React.ReactNode;
    body?: React.ReactNode;
    footer?: React.ReactNode;
    overlay?: React.ReactNode;
    cinematic?: boolean;
}
export declare const Panel: React.FC<PanelProps>;
interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    centered?: boolean;
}
export declare const PanelHeader: React.FC<PanelHeaderProps>;
interface PanelBodyProps extends React.HTMLAttributes<HTMLDivElement> {
    centered?: boolean;
    scrollable?: boolean;
}
export declare const PanelBody: React.FC<PanelBodyProps>;
interface PanelFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    centered?: boolean;
    spaced?: boolean;
}
export declare const PanelFooter: React.FC<PanelFooterProps>;
interface StatsPanelProps extends Omit<PanelProps, 'variant'> {
    title?: string;
    stats: Array<{
        label: string;
        value: string | number;
        change?: number;
        icon?: React.ReactNode;
    }>;
}
export declare const StatsPanel: React.FC<StatsPanelProps>;
interface SettingsPanelProps extends Omit<PanelProps, 'variant'> {
    title?: string;
    description?: string;
}
export declare const SettingsPanel: React.FC<SettingsPanelProps>;
export {};

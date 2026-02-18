import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';
const panelVariants = cva(
// Base classes
'relative backdrop-blur-md border transition-all duration-300', {
    variants: {
        variant: {
            // Glass morphism variants
            glass: 'bg-white/10 border-white/20',
            'glass-dark': 'bg-black/40 border-white/10',
            'glass-light': 'bg-white/80 border-gray-200/30',
            'glass-primary': 'bg-gaming-primary/10 border-gaming-primary/30',
            'glass-accent': 'bg-gaming-accent/10 border-gaming-accent/30',
            // Solid variants
            solid: 'bg-gray-900 border-gray-800',
            'solid-primary': 'bg-gaming-primary/20 border-gaming-primary/40',
            'solid-accent': 'bg-gaming-accent/20 border-gaming-accent/40',
            // Gaming variants
            gaming: 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30 backdrop-blur-sm',
            neon: 'bg-black border-gaming-accent shadow-glow-accent',
            retro: 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30',
            cyberpunk: 'bg-gradient-to-br from-pink-900/20 to-purple-900/20 border-pink-500/30 backdrop-blur-sm',
            // Minimal variants
            minimal: 'bg-gray-800/50 border-gray-700/50',
            subtle: 'bg-gray-900/30 border-gray-700/30'
        },
        size: {
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
            xl: 'p-12',
            full: 'p-16'
        },
        rounded: {
            none: 'rounded-none',
            sm: 'rounded-sm',
            md: 'rounded-md',
            lg: 'rounded-lg',
            xl: 'rounded-xl',
            '2xl': 'rounded-2xl',
            full: 'rounded-full'
        },
        shadow: {
            none: 'shadow-none',
            sm: 'shadow-sm',
            md: 'shadow-md',
            lg: 'shadow-lg',
            xl: 'shadow-xl',
            cinematic: 'shadow-cinematic',
            glow: 'shadow-glow-primary'
        },
        animated: {
            true: 'transition-all duration-300',
            false: ''
        }
    },
    defaultVariants: {
        variant: 'glass',
        size: 'md',
        rounded: 'xl',
        shadow: 'cinematic',
        animated: true
    }
});
export const Panel = ({ className, variant, size, rounded, shadow, animated, header, body, footer, overlay, cinematic = true, children, ...props }) => {
    const cinematicClass = cinematic ? 'animate-fade-in' : '';
    return (_jsxs("div", { className: cn(panelVariants({ variant, size, rounded, shadow, animated }), cinematicClass, className), ...props, children: [overlay && (_jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center", children: overlay })), _jsxs("div", { className: "relative z-0 h-full flex flex-col", children: [header && (_jsx("div", { className: "flex-shrink-0 mb-6 pb-4 border-b border-white/10", children: header })), _jsx("div", { className: "flex-1 min-w-0", children: body || children }), footer && (_jsx("div", { className: "flex-shrink-0 mt-6 pt-4 border-t border-white/10", children: footer }))] })] }));
};
export const PanelHeader = ({ className, title, subtitle, icon, actions, centered = false, children, ...props }) => {
    return (_jsxs("div", { className: cn('flex items-center gap-4', centered && 'justify-center', className), ...props, children: [icon && (_jsx("div", { className: "flex-shrink-0 w-12 h-12 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-xl flex items-center justify-center text-white text-xl", children: icon })), _jsxs("div", { className: "flex-1 min-w-0", children: [title && (_jsx("h2", { className: "text-xl font-semibold text-white mb-1", children: title })), subtitle && (_jsx("p", { className: "text-sm text-gray-400", children: subtitle }))] }), actions && (_jsx("div", { className: "flex items-center gap-2 flex-shrink-0", children: actions })), children] }));
};
export const PanelBody = ({ className, centered = false, scrollable = false, children, ...props }) => {
    return (_jsx("div", { className: cn('text-gray-100', centered && 'text-center', scrollable && 'overflow-y-auto max-h-96', className), ...props, children: children }));
};
export const PanelFooter = ({ className, centered = false, spaced = false, children, ...props }) => {
    return (_jsx("div", { className: cn('flex items-center', centered && 'justify-center', spaced && 'justify-between', !centered && !spaced && 'gap-4', className), ...props, children: children }));
};
export const StatsPanel = ({ title, stats, className, ...props }) => {
    return (_jsxs(Panel, { variant: "glass-dark", size: "lg", className: className, ...props, children: [title && (_jsx(PanelHeader, { title: title })), _jsx(PanelBody, { children: _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", children: stats.map((stat, index) => (_jsxs("div", { className: "text-center", children: [stat.icon && (_jsx("div", { className: "w-10 h-10 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center text-white mx-auto mb-2", children: stat.icon })), _jsx("div", { className: "text-2xl font-bold text-white mb-1", children: stat.value }), _jsx("div", { className: "text-sm text-gray-400 mb-1", children: stat.label }), stat.change !== undefined && (_jsxs("div", { className: cn('text-xs font-medium', stat.change > 0 ? 'text-green-400' : stat.change < 0 ? 'text-red-400' : 'text-gray-400'), children: [stat.change > 0 ? '+' : '', stat.change, "%"] }))] }, index))) }) })] }));
};
export const SettingsPanel = ({ title, description, children, className, ...props }) => {
    return (_jsxs(Panel, { variant: "glass", size: "lg", className: className, ...props, children: [(title || description) && (_jsx(PanelHeader, { title: title, subtitle: description })), _jsx(PanelBody, { children: children })] }));
};

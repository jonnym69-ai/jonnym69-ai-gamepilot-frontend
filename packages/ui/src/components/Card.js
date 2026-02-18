import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';
const cardVariants = cva(
// Base classes
'relative overflow-hidden transition-all duration-300', {
    variants: {
        variant: {
            // Default cinematic card
            default: 'glass-morphism rounded-xl border border-white/20 shadow-cinematic hover:shadow-glow-primary transform hover:scale-105',
            // Glass variants
            glass: 'glass-morphism rounded-xl border border-white/10 backdrop-blur-md',
            'glass-dark': 'glass-morphism rounded-xl border border-white/5 backdrop-blur-lg bg-black/40',
            'glass-light': 'glass-morphism rounded-xl border border-gray-200/20 backdrop-blur-sm bg-white/80',
            // Solid variants
            solid: 'bg-gray-900 rounded-xl border border-gray-800 shadow-cinematic',
            'solid-primary': 'bg-gradient-to-br from-gaming-primary/20 to-gaming-secondary/20 rounded-xl border border-gaming-primary/30 shadow-cinematic',
            'solid-accent': 'bg-gradient-to-br from-gaming-accent/20 to-purple-500/20 rounded-xl border border-gaming-accent/30 shadow-cinematic',
            // Gaming variants
            gaming: 'bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl border border-purple-500/30 shadow-glow-primary backdrop-blur-sm',
            neon: 'bg-black rounded-xl border-2 border-gaming-accent shadow-glow-accent transform hover:scale-105',
            retro: 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-xl border border-yellow-500/30 shadow-cinematic',
            cyberpunk: 'bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-xl border border-pink-500/30 shadow-glow-accent backdrop-blur-sm',
            // Minimal variants
            minimal: 'bg-gray-800/50 rounded-lg border border-gray-700/50',
            flat: 'bg-gray-900 rounded-lg border-0 shadow-none',
            // Featured variants
            featured: 'bg-gradient-to-br from-gaming-primary via-gaming-secondary to-gaming-accent rounded-2xl border-0 shadow-cinematic-epic transform hover:scale-105',
            hero: 'bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 rounded-3xl border-0 shadow-cinematic-epic backdrop-blur-md'
        },
        size: {
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
            xl: 'p-12'
        },
        interactive: {
            true: 'cursor-pointer group',
            false: ''
        },
        animated: {
            true: 'transition-all duration-300 hover:transform hover:scale-105',
            false: ''
        },
        glow: {
            none: '',
            primary: 'shadow-glow-primary',
            secondary: 'shadow-glow-secondary',
            accent: 'shadow-glow-accent',
            success: 'shadow-glow-success',
            warning: 'shadow-glow-warning',
            error: 'shadow-glow-error',
            info: 'shadow-glow-info'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'md',
        interactive: false,
        animated: true,
        glow: 'none'
    }
});
export const Card = ({ className, variant, size, interactive, animated, glow, header, body, footer, overlay, cinematic = true, children, ...props }) => {
    const cinematicClass = cinematic ? 'animate-fade-in' : '';
    return (_jsxs("div", { className: cn(cardVariants({ variant, size, interactive, animated, glow }), cinematicClass, className), ...props, children: [overlay && (_jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center", children: _jsx(_Fragment, { children: overlay }) })), _jsxs("div", { className: "relative z-0 h-full flex flex-col", children: [header && (_jsx("div", { className: "flex-shrink-0 mb-4", children: _jsx(_Fragment, { children: header }) })), _jsx("div", { className: "flex-1 min-w-0", children: _jsx(_Fragment, { children: body || children }) }), footer && (_jsx("div", { className: "flex-shrink-0 mt-4 pt-4 border-t border-white/10", children: _jsx(_Fragment, { children: footer }) }))] }), interactive && (_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-gaming-primary/5 to-gaming-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-inherit" }))] }));
};
export const CardHeader = ({ className, title, subtitle, icon, actions, children, ...props }) => {
    return (_jsxs("div", { className: cn('flex items-center justify-between', className), ...props, children: [_jsxs("div", { className: "flex items-center gap-3", children: [icon && (_jsx("div", { className: "flex-shrink-0 w-10 h-10 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center text-white", children: _jsx(_Fragment, { children: icon }) })), _jsxs("div", { children: [title && (_jsx("h3", { className: "text-lg font-semibold text-white", children: title })), subtitle && (_jsx("p", { className: "text-sm text-gray-400", children: subtitle }))] })] }), actions && (_jsx("div", { className: "flex items-center gap-2", children: _jsx(_Fragment, { children: actions }) })), _jsx(_Fragment, { children: children })] }));
};
export const CardBody = ({ className, children, ...props }) => {
    return (_jsx("div", { className: cn('text-gray-100', className), ...props, children: _jsx(_Fragment, { children: children }) }));
};
export const CardFooter = ({ className, children, ...props }) => {
    return (_jsx("div", { className: cn('flex items-center justify-between gap-4', className), ...props, children: _jsx(_Fragment, { children: children }) }));
};
export const CardMedia = ({ className, aspectRatio = 'video', overlay = false, children, ...props }) => {
    const aspectRatioClasses = {
        square: 'aspect-square',
        video: 'aspect-video',
        portrait: 'aspect-[3/4]',
        auto: 'aspect-auto'
    };
    return (_jsxs("div", { className: cn('relative overflow-hidden', aspectRatioClasses[aspectRatio], className), children: [_jsx(_Fragment, { children: children || (_jsx("img", { className: "w-full h-full object-cover", ...props })) }), overlay && (_jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" }))] }));
};

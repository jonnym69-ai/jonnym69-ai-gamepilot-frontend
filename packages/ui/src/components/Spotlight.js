import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../utils/cn';
export const Spotlight = ({ children, className, variant = 'featured', intensity = 'medium', color = 'purple' }) => {
    const getSpotlightClasses = () => {
        const baseClasses = 'relative overflow-hidden';
        const variantClasses = {
            hero: 'rounded-2xl',
            featured: 'rounded-xl',
            card: 'rounded-lg'
        };
        const intensityClasses = {
            subtle: 'before:opacity-30',
            medium: 'before:opacity-50',
            strong: 'before:opacity-70'
        };
        const colorClasses = {
            blue: 'before:bg-gradient-to-r before:from-blue-600 before:to-cyan-600',
            purple: 'before:bg-gradient-to-r before:from-purple-600 before:to-pink-600',
            orange: 'before:bg-gradient-to-r before:from-orange-600 before:to-red-600',
            green: 'before:bg-gradient-to-r before:from-green-600 before:to-emerald-600',
            pink: 'before:bg-gradient-to-r before:from-pink-600 before:to-rose-600'
        };
        return cn(baseClasses, variantClasses[variant], intensityClasses[intensity], colorClasses[color], className);
    };
    return (_jsxs("div", { className: getSpotlightClasses(), children: [_jsx("div", { className: cn('absolute inset-0 pointer-events-none', 'before:absolute before:inset-0 before:blur-3xl', 'after:absolute after:inset-0 after:bg-gradient-to-t after:from-transparent after:to-white/10') }), _jsx("div", { className: "relative z-10", children: children })] }));
};

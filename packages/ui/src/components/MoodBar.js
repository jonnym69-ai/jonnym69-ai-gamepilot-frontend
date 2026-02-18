import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../utils/cn';
export const MoodBar = ({ currentMood, moods, onMoodChange, className, variant = 'full' }) => {
    const getVariantClasses = () => {
        const variantClasses = {
            compact: 'p-2 gap-2',
            full: 'p-4 gap-3',
            minimal: 'p-1 gap-1'
        };
        return variantClasses[variant];
    };
    const getMoodButtonClasses = (mood, isActive) => {
        const baseClasses = 'relative flex items-center justify-center rounded-lg transition-all duration-300';
        const sizeClasses = {
            compact: 'w-10 h-10 text-sm',
            full: 'w-14 h-14 text-xl',
            minimal: 'w-8 h-8 text-xs'
        };
        const activeClasses = isActive
            ? 'ring-2 ring-gaming-accent bg-gaming-accent/20 scale-110'
            : 'hover:bg-gray-700 hover:scale-105';
        return cn(baseClasses, sizeClasses[variant], activeClasses, mood.color);
    };
    const getIntensityIndicator = (intensity) => {
        if (variant === 'minimal')
            return null;
        const intensityLevels = Math.ceil(intensity / 20); // 1-5 levels
        return (_jsx("div", { className: "absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5", children: Array.from({ length: intensityLevels }).map((_, i) => (_jsx("div", { className: "w-1 h-1 bg-gaming-accent rounded-full" }, i))) }));
    };
    if (variant === 'minimal') {
        return (_jsx("div", { className: cn('flex items-center', getVariantClasses(), className), children: moods.map((mood) => (_jsx("button", { onClick: () => onMoodChange?.(mood.id), className: getMoodButtonClasses(mood, mood.id === currentMood), title: mood.name, children: _jsx("span", { children: mood.emoji }) }, mood.id))) }));
    }
    return (_jsxs("div", { className: cn('glass-morphism rounded-xl', getVariantClasses(), className), children: [variant === 'full' && currentMood && (_jsxs("div", { className: "text-center mb-3", children: [_jsx("p", { className: "text-xs text-gray-400 mb-1", children: "Current Mood" }), _jsx("div", { className: "flex items-center justify-center gap-2", children: (() => {
                            const current = moods.find(m => m.id === currentMood);
                            return current ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-2xl", children: current.emoji }), _jsx("span", { className: "text-white font-medium", children: current.name })] })) : null;
                        })() })] })), _jsx("div", { className: "flex items-center justify-center flex-wrap", children: moods.map((mood) => (_jsxs("button", { onClick: () => onMoodChange?.(mood.id), className: getMoodButtonClasses(mood, mood.id === currentMood), title: mood.name, children: [_jsx("span", { children: mood.emoji }), getIntensityIndicator(mood.intensity)] }, mood.id))) }), variant === 'full' && (_jsx("div", { className: "mt-3 text-center", children: _jsx("p", { className: "text-xs text-gray-400", children: (() => {
                        const current = moods.find(m => m.id === currentMood);
                        return current ? current.name : 'Select your current gaming mood';
                    })() }) }))] }));
};

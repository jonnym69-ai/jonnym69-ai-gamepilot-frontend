import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';
const inputVariants = cva(
// Base classes
'flex w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed', {
    variants: {
        variant: {
            // Default variants
            default: 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-gaming-primary focus:ring-gaming-primary/50',
            primary: 'bg-gray-800/50 border-gaming-primary/30 text-white placeholder-gray-400 focus:border-gaming-primary focus:ring-gaming-primary/50',
            secondary: 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500/50',
            accent: 'bg-gray-800/50 border-gaming-accent/30 text-white placeholder-gray-400 focus:border-gaming-accent focus:ring-gaming-accent/50',
            // Glass variants
            glass: 'glass-morphism border-white/20 text-white placeholder-gray-400 focus:border-gaming-primary focus:ring-gaming-primary/50',
            'glass-dark': 'glass-morphism border-white/10 text-white placeholder-gray-500 focus:border-gaming-primary focus:ring-gaming-primary/50',
            'glass-light': 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gaming-primary focus:ring-gaming-primary/50',
            // Gaming variants
            gaming: 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 text-white placeholder-purple-300 focus:border-gaming-accent focus:ring-gaming-accent/50 font-gaming',
            neon: 'bg-black border-gaming-accent text-gaming-accent placeholder-gaming-accent/50 focus:border-gaming-primary focus:ring-gaming-primary/50 shadow-glow-accent font-gaming',
            retro: 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30 text-yellow-100 placeholder-yellow-300 focus:border-yellow-400 focus:ring-yellow-400/50 font-bold',
            cyberpunk: 'bg-gradient-to-r from-pink-900/20 to-purple-900/20 border-pink-500/30 text-pink-100 placeholder-pink-300 focus:border-gaming-accent focus:ring-gaming-accent/50 font-gaming tracking-wider',
            // Minimal variants
            minimal: 'bg-transparent border-gray-700 text-white placeholder-gray-500 focus:border-gaming-primary focus:ring-gaming-primary/50',
            flat: 'bg-gray-900 border-0 border-b-2 border-gray-700 text-white placeholder-gray-500 focus:border-gaming-primary focus:ring-0 rounded-none'
        },
        size: {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
            xl: 'px-8 py-4 text-lg'
        },
        state: {
            default: '',
            error: 'border-red-500 text-white placeholder-red-300 focus:border-red-500 focus:ring-red-500/50',
            success: 'border-green-500 text-white placeholder-green-300 focus:border-green-500 focus:ring-green-500/50',
            warning: 'border-yellow-500 text-white placeholder-yellow-300 focus:border-yellow-500 focus:ring-yellow-500/50'
        },
        fullWidth: {
            true: 'w-full',
            false: 'w-auto'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'md',
        state: 'default',
        fullWidth: true
    }
});
export const Input = forwardRef(({ className, variant, size, state, fullWidth, label, description, error, success, warning, leftIcon, rightIcon, leftAddon, rightAddon, cinematic = true, disabled, ...props }, ref) => {
    const inputState = error ? 'error' : success ? 'success' : warning ? 'warning' : state;
    const cinematicClass = cinematic ? 'animate-fade-in' : '';
    const renderLeftContent = () => {
        if (leftAddon) {
            return (_jsx("div", { className: "flex items-center px-3 bg-gray-800/50 border-r border-gray-700 rounded-l-lg", children: leftAddon }));
        }
        if (leftIcon) {
            return (_jsx("div", { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", children: leftIcon }));
        }
        return null;
    };
    const renderRightContent = () => {
        if (rightAddon) {
            return (_jsx("div", { className: "flex items-center px-3 bg-gray-800/50 border-l border-gray-700 rounded-r-lg", children: rightAddon }));
        }
        if (rightIcon) {
            return (_jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400", children: rightIcon }));
        }
        return null;
    };
    const getInputPaddingLeft = () => {
        if (leftAddon)
            return 'pl-0';
        if (leftIcon)
            return 'pl-10';
        return '';
    };
    const getInputPaddingRight = () => {
        if (rightAddon)
            return 'pr-0';
        if (rightIcon)
            return 'pr-10';
        return '';
    };
    return (_jsxs("div", { className: cn('w-full', cinematicClass), children: [label && (_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: label })), _jsxs("div", { className: "relative flex", children: [renderLeftContent(), _jsx("input", { ref: ref, className: cn(inputVariants({ variant, size, state: inputState, fullWidth }), getInputPaddingLeft(), getInputPaddingRight(), leftAddon && 'rounded-l-none', rightAddon && 'rounded-r-none', className), disabled: disabled, ...props }), renderRightContent()] }), (description || error || success || warning) && (_jsxs("div", { className: "mt-2 text-sm", children: [error && (_jsxs("p", { className: "text-red-400 flex items-center gap-1", children: [_jsx("span", { children: "\u26A0\uFE0F" }), error] })), success && (_jsxs("p", { className: "text-green-400 flex items-center gap-1", children: [_jsx("span", { children: "\u2713" }), success] })), warning && (_jsxs("p", { className: "text-yellow-400 flex items-center gap-1", children: [_jsx("span", { children: "\u26A1" }), warning] })), description && !error && !success && !warning && (_jsx("p", { className: "text-gray-400", children: description }))] }))] }));
});
Input.displayName = 'Input';
export const SearchInput = ({ className, ...props }) => {
    return (_jsx(Input, { variant: "glass", size: "md", leftIcon: _jsx("span", { children: "\uD83D\uDD0D" }), placeholder: "Search...", className: cn('font-gaming', className), ...props }));
};
export const NumberInput = ({ className, ...props }) => {
    return (_jsx(Input, { type: "number", variant: "default", size: "md", className: cn('font-mono tabular-nums', className), ...props }));
};
export const TextArea = ({ className, variant = 'default', size = 'md', ...props }) => {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg'
    };
    const variantClasses = {
        default: 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-gaming-primary focus:ring-gaming-primary/50',
        glass: 'glass-morphism border-white/20 text-white placeholder-gray-400 focus:border-gaming-primary focus:ring-gaming-primary/50',
        gaming: 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 text-white placeholder-purple-300 focus:border-gaming-accent focus:ring-gaming-accent/50 font-gaming'
    };
    return (_jsx("div", { className: "w-full", children: _jsx("textarea", { className: cn('flex w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed resize-vertical min-h-[100px]', sizeClasses[size], variantClasses[variant], className), ...props }) }));
};
export const Select = ({ className, variant = 'default', size = 'md', options, ...props }) => {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg'
    };
    const variantClasses = {
        default: 'bg-gray-800/50 border-gray-700 text-white focus:border-gaming-primary focus:ring-gaming-primary/50',
        glass: 'glass-morphism border-white/20 text-white focus:border-gaming-primary focus:ring-gaming-primary/50',
        gaming: 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 text-white focus:border-gaming-accent focus:ring-gaming-accent/50 font-gaming'
    };
    return (_jsx("select", { className: cn('flex w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer', sizeClasses[size], variantClasses[variant], className), ...props, children: options.map((option) => (_jsx("option", { value: option.value, disabled: option.disabled, children: option.label }, option.value))) }));
};

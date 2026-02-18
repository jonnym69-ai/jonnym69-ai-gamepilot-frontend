import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { ENHANCED_MOODS } from '@gamepilot/static-data';
import { EnhancedMoodFilter } from '@gamepilot/identity-engine';
import { cn } from '../utils/cn';
export const EnhancedMoodSelector = ({ onMoodChange, initialMood, initialSecondaryMood, showCombinations = true, variant = 'full', className, enableHybridMode = true }) => {
    const [primaryMood, setPrimaryMood] = useState(initialMood);
    const [secondaryMood, setSecondaryMood] = useState(initialSecondaryMood);
    const [intensity, setIntensity] = useState(0.8);
    const [showSecondary, setShowSecondary] = useState(!!initialSecondaryMood);
    const [recommendedCombinations, setRecommendedCombinations] = useState([]);
    const handlePrimaryMoodSelect = useCallback((moodId) => {
        setPrimaryMood(moodId);
        // Update recommended combinations
        const combinations = EnhancedMoodFilter.getRecommendedCombinations(moodId);
        setRecommendedCombinations(combinations);
        // Reset secondary mood if it conflicts
        if (secondaryMood) {
            const isValid = EnhancedMoodFilter.validateCombination(moodId, secondaryMood);
            if (!isValid) {
                setSecondaryMood(undefined);
                setShowSecondary(false);
            }
        }
        // Trigger change callback
        if (onMoodChange && moodId) {
            const context = {
                primaryMood: moodId,
                secondaryMood: secondaryMood,
                intensity
            };
            onMoodChange(context);
        }
    }, [secondaryMood, intensity, onMoodChange]);
    const handleSecondaryMoodSelect = useCallback((moodId) => {
        if (!primaryMood)
            return;
        // Validate combination
        const isValid = EnhancedMoodFilter.validateCombination(primaryMood, moodId);
        if (!isValid)
            return;
        setSecondaryMood(moodId);
        // Trigger change callback
        if (onMoodChange) {
            const context = {
                primaryMood,
                secondaryMood: moodId,
                intensity
            };
            onMoodChange(context);
        }
    }, [primaryMood, intensity, onMoodChange]);
    const handleIntensityChange = useCallback((newIntensity) => {
        setIntensity(newIntensity);
        // Trigger change callback
        if (onMoodChange && primaryMood) {
            const context = {
                primaryMood,
                secondaryMood,
                intensity: newIntensity
            };
            onMoodChange(context);
        }
    }, [primaryMood, secondaryMood, onMoodChange]);
    const handleCombinationSelect = useCallback((combination) => {
        setPrimaryMood(combination.primaryMood);
        setSecondaryMood(combination.secondaryMood);
        setIntensity(combination.intensity);
        setShowSecondary(!!combination.secondaryMood);
        if (onMoodChange) {
            const context = {
                primaryMood: combination.primaryMood,
                secondaryMood: combination.secondaryMood,
                intensity: combination.intensity
            };
            onMoodChange(context);
        }
    }, [onMoodChange]);
    const getMoodButtonClasses = (mood, isActive, isSecondary = false) => {
        const baseClasses = 'relative flex flex-col items-center justify-center rounded-xl transition-all duration-300 cursor-pointer';
        const sizeClasses = variant === 'compact'
            ? 'w-16 h-16 text-sm p-2'
            : variant === 'minimal'
                ? 'w-12 h-12 text-xs p-1'
                : 'w-20 h-20 text-base p-3';
        const activeClasses = isActive
            ? isSecondary
                ? 'ring-2 ring-purple-500 bg-purple-500/20 scale-110 border-2 border-purple-400'
                : 'ring-2 ring-gaming-accent bg-gaming-accent/20 scale-110 border-2 border-gaming-accent'
            : 'hover:bg-gray-700/50 hover:scale-105 border-2 border-transparent';
        return cn(baseClasses, sizeClasses, activeClasses, mood.color);
    };
    const getEnergyIndicator = (energyLevel) => {
        const filledBars = Math.ceil(energyLevel / 2);
        return (_jsx("div", { className: "flex gap-0.5 mt-1", children: Array.from({ length: 5 }).map((_, i) => (_jsx("div", { className: cn('w-1 h-3 rounded-full', i < filledBars ? 'bg-white/80' : 'bg-white/20') }, i))) }));
    };
    const getSocialIndicator = (socialRequirement) => {
        if (variant === 'minimal')
            return null;
        const icons = ['👤', '👥', '👨‍👩‍👧‍👦'];
        const iconIndex = Math.min(Math.floor(socialRequirement / 3), 2);
        return (_jsx("div", { className: "text-xs mt-1", children: icons[iconIndex] }));
    };
    const primaryMoodData = primaryMood ? ENHANCED_MOODS.find(m => m.id === primaryMood) : undefined;
    const secondaryMoodData = secondaryMood ? ENHANCED_MOODS.find(m => m.id === secondaryMood) : undefined;
    if (variant === 'minimal') {
        return (_jsx("div", { className: cn('flex items-center gap-2', className), children: ENHANCED_MOODS.map((mood) => (_jsx("button", { onClick: () => handlePrimaryMoodSelect(mood.id), className: getMoodButtonClasses(mood, mood.id === primaryMood), title: mood.name, children: _jsx("span", { className: "text-lg", children: mood.emoji }) }, mood.id))) }));
    }
    return (_jsxs("div", { className: cn('glass-morphism rounded-2xl p-6 space-y-6', className), children: [_jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-xl font-bold text-white mb-2", children: "Select Your Gaming Mood" }), _jsx("p", { className: "text-gray-400 text-sm", children: "Choose how you're feeling to get personalized game recommendations" })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold text-white mb-4", children: "Primary Mood" }), _jsx("div", { className: "grid grid-cols-4 gap-3", children: ENHANCED_MOODS.map((mood) => (_jsxs("button", { onClick: () => handlePrimaryMoodSelect(mood.id), className: getMoodButtonClasses(mood, mood.id === primaryMood), title: mood.name, children: [_jsx("span", { className: "text-2xl mb-1", children: mood.emoji }), _jsx("span", { className: "text-xs text-white font-medium", children: mood.name }), getEnergyIndicator(mood.energyLevel), getSocialIndicator(mood.socialRequirement)] }, mood.id))) })] }), enableHybridMode && primaryMood && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h4", { className: "text-lg font-semibold text-white", children: ["Secondary Mood ", secondaryMood && '(Optional)'] }), _jsxs("button", { onClick: () => setShowSecondary(!showSecondary), className: "text-sm text-gaming-accent hover:text-gaming-accent/80 transition-colors", children: [showSecondary ? 'Hide' : 'Add', " Secondary Mood"] })] }), showSecondary && (_jsx("div", { className: "grid grid-cols-4 gap-3", children: ENHANCED_MOODS
                            .filter(mood => mood.id !== primaryMood)
                            .filter(mood => !primaryMoodData?.conflictingMoods.includes(mood.id))
                            .map((mood) => (_jsxs("button", { onClick: () => handleSecondaryMoodSelect(mood.id), className: getMoodButtonClasses(mood, mood.id === secondaryMood, true), title: mood.name, disabled: primaryMoodData?.conflictingMoods.includes(mood.id), children: [_jsx("span", { className: "text-2xl mb-1", children: mood.emoji }), _jsx("span", { className: "text-xs text-white font-medium", children: mood.name }), getEnergyIndicator(mood.energyLevel)] }, mood.id))) }))] })), primaryMood && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "text-lg font-semibold text-white", children: "Mood Intensity" }), _jsxs("span", { className: "text-sm text-gray-400", children: [Math.round(intensity * 100), "%"] })] }), _jsxs("div", { className: "relative", children: [_jsx("label", { htmlFor: "mood-intensity-slider", className: "sr-only", children: "Mood Intensity Slider - Adjust how strongly your mood should influence recommendations" }), _jsx("input", { id: "mood-intensity-slider", type: "range", min: "0", max: "100", value: intensity * 100, onChange: (e) => handleIntensityChange(parseInt(e.target.value) / 100), className: "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider", "aria-label": "Mood Intensity - Adjust how strongly your mood should influence recommendations", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(intensity * 100) })] }), _jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [_jsx("span", { children: "Subtle" }), _jsx("span", { children: "Moderate" }), _jsx("span", { children: "Strong" })] })] })), showCombinations && primaryMood && recommendedCombinations.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold text-white mb-4", children: "Recommended Combinations" }), _jsx("div", { className: "space-y-2", children: recommendedCombinations.slice(0, 3).map((combo, index) => {
                            const primary = ENHANCED_MOODS.find(m => m.id === combo.primaryMood);
                            const secondary = combo.secondaryMood ? ENHANCED_MOODS.find(m => m.id === combo.secondaryMood) : null;
                            return (_jsxs("button", { onClick: () => handleCombinationSelect(combo), className: cn('w-full p-3 rounded-lg border-2 transition-all duration-300', 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-600 hover:border-gaming-accent', 'flex items-center justify-between'), children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-xl", children: primary?.emoji }), secondary && _jsxs("span", { className: "text-xl", children: ["+ ", secondary.emoji] }), _jsxs("span", { className: "text-white font-medium", children: [primary?.name, secondary && ` + ${secondary.name}`] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-xs text-gray-400", children: combo.context }), _jsxs("div", { className: "text-xs text-gaming-accent", children: [Math.round(combo.intensity * 100), "% match"] })] })] }, index));
                        }) })] })), primaryMoodData && (_jsxs("div", { className: "bg-gray-800/30 rounded-lg p-4", children: [_jsx("h4", { className: "text-lg font-semibold text-white mb-2", children: "Current Selection" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-2xl", children: primaryMoodData.emoji }), _jsx("span", { className: "text-white font-medium", children: primaryMoodData.name })] }), secondaryMoodData && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-gray-400", children: "+" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-2xl", children: secondaryMoodData.emoji }), _jsx("span", { className: "text-white font-medium", children: secondaryMoodData.name })] })] })), _jsxs("div", { className: "ml-auto text-sm text-gray-400", children: [Math.round(intensity * 100), "% intensity"] })] }), _jsxs("p", { className: "text-sm text-gray-400 mt-2", children: [primaryMoodData.description, secondaryMoodData && ` + ${secondaryMoodData.description}`] })] }))] }));
};

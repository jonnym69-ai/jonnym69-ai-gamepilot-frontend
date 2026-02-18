import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
export const ActivityPulse = ({ activities, maxItems = 5, refreshInterval = 30000, onRefresh, className, variant = 'detailed' }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [visibleActivities, setVisibleActivities] = useState(activities.slice(0, maxItems));
    useEffect(() => {
        setVisibleActivities(activities.slice(0, maxItems));
    }, [activities, maxItems]);
    useEffect(() => {
        if (refreshInterval > 0) {
            const interval = setInterval(() => {
                handleRefresh();
            }, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [refreshInterval]);
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await onRefresh?.();
        }
        finally {
            setTimeout(() => setIsRefreshing(false), 1000);
        }
    };
    const getActivityIcon = (type) => {
        const iconMap = {
            game: '🎮',
            friend: '👥',
            achievement: '🏆',
            community: '🌐'
        };
        return iconMap[type];
    };
    const getActivityColor = (type, intensity) => {
        const baseColors = {
            game: 'from-blue-500 to-purple-600',
            friend: 'from-green-500 to-teal-600',
            achievement: 'from-yellow-500 to-orange-600',
            community: 'from-purple-500 to-pink-600'
        };
        const intensityModifiers = {
            low: 'opacity-60',
            medium: 'opacity-80',
            high: 'opacity-100'
        };
        return cn('bg-gradient-to-r', baseColors[type], intensity && intensityModifiers[intensity]);
    };
    const formatTimestamp = (date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (minutes < 1)
            return 'Just now';
        if (minutes < 60)
            return `${minutes}m ago`;
        if (hours < 24)
            return `${hours}h ago`;
        if (days < 7)
            return `${days}d ago`;
        return date.toLocaleDateString();
    };
    const getVariantClasses = () => {
        const variantClasses = {
            compact: 'p-3 space-y-2',
            detailed: 'p-4 space-y-3',
            minimal: 'p-2 space-y-1'
        };
        return variantClasses[variant];
    };
    const getItemClasses = () => {
        const baseClasses = 'relative rounded-lg border transition-all duration-300';
        const variantClasses = {
            compact: 'p-2 border-gray-700 hover:border-gray-600',
            detailed: 'p-3 border-gray-700 hover:border-gaming-accent/50',
            minimal: 'p-1 border-gray-800 hover:border-gray-700'
        };
        return cn(baseClasses, variantClasses[variant]);
    };
    if (variant === 'minimal') {
        return (_jsxs("div", { className: cn('glass-morphism rounded-xl', getVariantClasses(), className), children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-gaming-accent rounded-full animate-pulse" }), _jsx("span", { className: "text-xs text-gray-400", children: "Activity" })] }), _jsx("button", { onClick: handleRefresh, disabled: isRefreshing, className: "text-gray-400 hover:text-white transition-colors disabled:opacity-50", children: isRefreshing ? '⟳' : '↻' })] }), _jsx("div", { className: "flex gap-1", children: visibleActivities.map((activity) => (_jsx("div", { className: cn('w-2 h-2 rounded-full', getActivityColor(activity.type, activity.intensity)), title: activity.title }, activity.id))) })] }));
    }
    return (_jsxs("div", { className: cn('glass-morphism rounded-xl', getVariantClasses(), className), children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 bg-gaming-accent rounded-full animate-pulse" }), _jsx("h3", { className: "text-white font-medium", children: "Activity Pulse" })] }), _jsx("button", { onClick: handleRefresh, disabled: isRefreshing, className: cn('text-gray-400 hover:text-white transition-all duration-200', 'disabled:opacity-50 disabled:cursor-not-allowed', isRefreshing && 'animate-spin'), children: "\u21BB" })] }), _jsx("div", { className: "space-y-2", children: visibleActivities.map((activity) => (_jsx("div", { className: getItemClasses(), children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm', getActivityColor(activity.type, activity.intensity)), children: activity.icon || getActivityIcon(activity.type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "text-white font-medium text-sm truncate", children: activity.title }), variant === 'detailed' && activity.description && (_jsx("p", { className: "text-gray-400 text-xs mt-1 line-clamp-2", children: activity.description })), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [activity.user && (_jsx("span", { className: "text-xs text-gray-500", children: activity.user })), _jsx("span", { className: "text-xs text-gray-500", children: formatTimestamp(activity.timestamp) })] })] }), activity.intensity && variant === 'detailed' && (_jsx("div", { className: "flex flex-col gap-1", children: Array.from({ length: activity.intensity === 'low' ? 1 : activity.intensity === 'medium' ? 2 : 3 }).map((_, i) => (_jsx("div", { className: "w-1 h-1 bg-gaming-accent rounded-full" }, i))) }))] }) }, activity.id))) }), visibleActivities.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-gray-500 text-4xl mb-2", children: "\uD83D\uDCED" }), _jsx("p", { className: "text-gray-400 text-sm", children: "No recent activity" })] })), activities.length > maxItems && (_jsx("div", { className: "text-center mt-4", children: _jsxs("button", { className: "text-gaming-accent hover:text-gaming-accent/80 text-sm transition-colors", children: ["View ", activities.length - maxItems, " more activities"] }) }))] }));
};

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../utils/cn';
export const GameTile = ({ title, genre, coverImage, rating, playtime, lastPlayed, mood, isPlaying = false, size = 'medium', onClick, className, children }) => {
    const getSizeClasses = () => {
        const sizeClasses = {
            small: 'w-32 h-40 text-xs',
            medium: 'w-48 h-64 text-sm',
            large: 'w-64 h-80 text-base'
        };
        return sizeClasses[size];
    };
    const getCoverImageClasses = () => {
        const baseClasses = 'absolute inset-0 object-cover transition-transform duration-300';
        return cn(baseClasses, 'group-hover:scale-105', isPlaying && 'animate-pulse');
    };
    const formatPlaytime = (minutes) => {
        if (minutes < 60)
            return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };
    const formatLastPlayed = (date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0)
            return 'Today';
        if (days === 1)
            return 'Yesterday';
        if (days < 7)
            return `${days} days ago`;
        if (days < 30)
            return `${Math.floor(days / 7)} weeks ago`;
        return `${Math.floor(days / 30)} months ago`;
    };
    return (_jsxs("div", { className: cn('relative group cursor-pointer overflow-hidden rounded-lg', 'bg-gray-800 border border-gray-700', 'hover:border-gaming-accent transition-all duration-300', 'hover:shadow-lg hover:shadow-gaming-accent/20', getSizeClasses(), className), onClick: onClick, children: [coverImage ? (_jsx("img", { src: coverImage, alt: title, className: getCoverImageClasses() })) : (_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center", children: _jsx("div", { className: "text-gray-500 text-4xl", children: "\uD83C\uDFAE" }) })), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" }), isPlaying && (_jsxs("div", { className: "absolute top-2 right-2 bg-gaming-accent text-white text-xs px-2 py-1 rounded-full flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 bg-white rounded-full animate-pulse" }), "Playing"] })), mood && (_jsx("div", { className: "absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full", children: mood })), _jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-3", children: [_jsx("h3", { className: "text-white font-semibold truncate mb-1", children: title }), _jsx("p", { className: "text-gray-300 text-xs truncate mb-2", children: genre }), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-400", children: [rating && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { children: "\u2B50" }), _jsx("span", { children: rating.toFixed(1) })] })), playtime && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { children: "\u23F1\uFE0F" }), _jsx("span", { children: formatPlaytime(playtime) })] }))] }), lastPlayed && (_jsx("p", { className: "text-xs text-gray-500 mt-1", children: formatLastPlayed(lastPlayed) }))] }), _jsx("div", { className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center", children: children })] }));
};

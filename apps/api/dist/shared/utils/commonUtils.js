"use strict";
// Common utility functions for GamePilot platform
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContrastColor = exports.hexToRgb = exports.groupBy = exports.uniqueById = exports.getRelativeTime = exports.formatDateTime = exports.formatDate = void 0;
// Date utilities
const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
};
exports.formatDate = formatDate;
const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};
exports.formatDateTime = formatDateTime;
const getRelativeTime = (date) => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 60)
        return `${diffMins} minutes ago`;
    if (diffHours < 24)
        return `${diffHours} hours ago`;
    if (diffDays < 7)
        return `${diffDays} days ago`;
    return (0, exports.formatDate)(date);
};
exports.getRelativeTime = getRelativeTime;
// Array utilities
const uniqueById = (items) => {
    const seen = new Set();
    return items.filter(item => {
        if (seen.has(item.id))
            return false;
        seen.add(item.id);
        return true;
    });
};
exports.uniqueById = uniqueById;
const groupBy = (items, key) => {
    return items.reduce((groups, item) => {
        const groupKey = String(item[key]);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {});
};
exports.groupBy = groupBy;
// Color utilities
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
};
exports.hexToRgb = hexToRgb;
const getContrastColor = (hex) => {
    const rgb = (0, exports.hexToRgb)(hex);
    if (!rgb)
        return '#000000';
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
};
exports.getContrastColor = getContrastColor;
//# sourceMappingURL=commonUtils.js.map
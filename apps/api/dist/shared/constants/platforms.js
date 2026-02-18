"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformCode = exports.getPlatformName = exports.isValidPlatformCode = exports.PLATFORM_LIST = void 0;
const types_1 = require("../types");
exports.PLATFORM_LIST = [
    types_1.PlatformCode.STEAM,
    types_1.PlatformCode.EPIC,
    types_1.PlatformCode.XBOX,
    types_1.PlatformCode.PLAYSTATION,
    types_1.PlatformCode.NINTENDO,
    types_1.PlatformCode.GOG,
    types_1.PlatformCode.ORIGIN,
    types_1.PlatformCode.UPLAY,
    types_1.PlatformCode.BATTLENET,
    types_1.PlatformCode.DISCORD,
    types_1.PlatformCode.ITCH,
    types_1.PlatformCode.HUMBLE,
    types_1.PlatformCode.YOUTUBE,
    types_1.PlatformCode.CUSTOM
];
const isValidPlatformCode = (code) => {
    return exports.PLATFORM_LIST.includes(code);
};
exports.isValidPlatformCode = isValidPlatformCode;
const getPlatformName = (code) => {
    const platformNames = {
        [types_1.PlatformCode.STEAM]: 'Steam',
        [types_1.PlatformCode.EPIC]: 'Epic Games',
        [types_1.PlatformCode.XBOX]: 'Xbox',
        [types_1.PlatformCode.PLAYSTATION]: 'PlayStation',
        [types_1.PlatformCode.NINTENDO]: 'Nintendo',
        [types_1.PlatformCode.GOG]: 'GOG',
        [types_1.PlatformCode.ORIGIN]: 'Origin',
        [types_1.PlatformCode.UPLAY]: 'Ubisoft Connect',
        [types_1.PlatformCode.BATTLENET]: 'Battle.net',
        [types_1.PlatformCode.DISCORD]: 'Discord',
        [types_1.PlatformCode.ITCH]: 'itch.io',
        [types_1.PlatformCode.HUMBLE]: 'Humble Bundle',
        [types_1.PlatformCode.YOUTUBE]: 'YouTube',
        [types_1.PlatformCode.CUSTOM]: 'Custom'
    };
    return platformNames[code] || 'Unknown Platform';
};
exports.getPlatformName = getPlatformName;
const getPlatformCode = (platform) => {
    const codeMap = {
        'steam': types_1.PlatformCode.STEAM,
        'epic': types_1.PlatformCode.EPIC,
        'xbox': types_1.PlatformCode.XBOX,
        'playstation': types_1.PlatformCode.PLAYSTATION,
        'nintendo': types_1.PlatformCode.NINTENDO,
        'gog': types_1.PlatformCode.GOG,
        'origin': types_1.PlatformCode.ORIGIN,
        'uplay': types_1.PlatformCode.UPLAY,
        'battlenet': types_1.PlatformCode.BATTLENET,
        'discord': types_1.PlatformCode.DISCORD,
        'itch': types_1.PlatformCode.ITCH,
        'humble': types_1.PlatformCode.HUMBLE,
        'youtube': types_1.PlatformCode.YOUTUBE,
        'custom': types_1.PlatformCode.CUSTOM
    };
    return codeMap[platform.toLowerCase()] || types_1.PlatformCode.CUSTOM;
};
exports.getPlatformCode = getPlatformCode;
//# sourceMappingURL=platforms.js.map
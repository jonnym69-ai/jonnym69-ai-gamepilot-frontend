"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformName = exports.getPlatformColor = void 0;
// Game utility functions for GamePilot platform
const types_1 = require("../types");
const getPlatformColor = (platformCode) => {
    const colors = {
        [types_1.PlatformCode.STEAM]: '#1B2838',
        [types_1.PlatformCode.XBOX]: '#107C10',
        [types_1.PlatformCode.PLAYSTATION]: '#003791',
        [types_1.PlatformCode.NINTENDO]: '#E60012',
        [types_1.PlatformCode.EPIC]: '#313131',
        [types_1.PlatformCode.GOG]: '#8B46FF',
        [types_1.PlatformCode.ORIGIN]: '#F56B00',
        [types_1.PlatformCode.UPLAY]: '#00B4D3',
        [types_1.PlatformCode.BATTLENET]: '#1A5CAD',
        [types_1.PlatformCode.DISCORD]: '#5865F2',
        [types_1.PlatformCode.ITCH]: '#FA5C5C',
        [types_1.PlatformCode.HUMBLE]: '#CB772D',
        [types_1.PlatformCode.YOUTUBE]: '#FF0000',
        [types_1.PlatformCode.CUSTOM]: '#6B7280'
    };
    return colors[platformCode] || colors[types_1.PlatformCode.CUSTOM];
};
exports.getPlatformColor = getPlatformColor;
const getPlatformName = (platformCode) => {
    const names = {
        [types_1.PlatformCode.STEAM]: 'Steam',
        [types_1.PlatformCode.XBOX]: 'Xbox',
        [types_1.PlatformCode.PLAYSTATION]: 'PlayStation',
        [types_1.PlatformCode.NINTENDO]: 'Nintendo',
        [types_1.PlatformCode.EPIC]: 'Epic Games',
        [types_1.PlatformCode.GOG]: 'GOG',
        [types_1.PlatformCode.ORIGIN]: 'Origin',
        [types_1.PlatformCode.UPLAY]: 'Ubisoft Connect',
        [types_1.PlatformCode.BATTLENET]: 'Battle.net',
        [types_1.PlatformCode.DISCORD]: 'Discord',
        [types_1.PlatformCode.ITCH]: 'Itch.io',
        [types_1.PlatformCode.HUMBLE]: 'Humble Bundle',
        [types_1.PlatformCode.YOUTUBE]: 'YouTube',
        [types_1.PlatformCode.CUSTOM]: 'Other'
    };
    return names[platformCode] || names[types_1.PlatformCode.CUSTOM];
};
exports.getPlatformName = getPlatformName;
//# sourceMappingURL=gameUtils.js.map
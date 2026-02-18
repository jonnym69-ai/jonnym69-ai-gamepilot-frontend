"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="vitest" />
const config_1 = require("vitest/config");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const path_1 = __importDefault(require("path"));
exports.default = (0, config_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.d.ts',
                '**/*.config.*',
                'dist/',
                'coverage/'
            ]
        }
    },
    resolve: {
        alias: {
            '@': path_1.default.resolve(__dirname, './src'),
            '@gamepilot/shared': path_1.default.resolve(__dirname, '../../packages/shared/src'),
            '@gamepilot/ui': path_1.default.resolve(__dirname, '../../packages/ui/src'),
            '@gamepilot/types': path_1.default.resolve(__dirname, '../../packages/types/src')
        }
    }
});

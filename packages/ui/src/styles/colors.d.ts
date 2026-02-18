export declare const colors: {
    white: string;
    gray: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        850: string;
        900: string;
        950: string;
    };
    black: string;
    gaming: {
        primary: string;
        secondary: string;
        accent: string;
        dark: string;
        darker: string;
        light: string;
        lighter: string;
    };
    accent: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    success: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    warning: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    error: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    info: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
};
export declare const accentSystem: {
    gradients: {
        primary: string;
        secondary: string;
        accent: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        cinematic: {
            dawn: string;
            dusk: string;
            midnight: string;
            aurora: string;
            neon: string;
            retro: string;
        };
    };
    glows: {
        primary: string;
        secondary: string;
        accent: string;
        success: string;
        warning: string;
        error: string;
        info: string;
    };
    shadows: {
        sm: string;
        base: string;
        md: string;
        lg: string;
        xl: string;
        cinematic: {
            soft: string;
            medium: string;
            strong: string;
            glow: string;
            epic: string;
        };
    };
    borders: {
        default: string;
        focus: string;
        hover: string;
        active: string;
        disabled: string;
    };
};
export declare const borderColors: {
    default: string;
    focus: string;
    hover: string;
    active: string;
    disabled: string;
};
export declare const themes: {
    dark: {
        background: string;
        surface: string;
        surfaceLight: string;
        text: string;
        textSecondary: string;
        textMuted: string;
        border: string;
        accent: string;
    };
    light: {
        background: string;
        surface: string;
        surfaceLight: string;
        text: string;
        textSecondary: string;
        textMuted: string;
        border: string;
        accent: string;
    };
    gaming: {
        neon: {
            background: string;
            surface: string;
            accent: string;
            text: string;
            glow: string;
        };
        retro: {
            background: string;
            surface: string;
            accent: string;
            text: string;
            glow: string;
        };
        cyberpunk: {
            background: string;
            surface: string;
            accent: string;
            text: string;
            glow: string;
        };
    };
};
export declare const colorUtils: {
    withOpacity: (color: string, opacity: number) => string;
    gradient: (colors: string[], angle?: number) => string;
    getContrast: (color: string) => "#FFFFFF" | "#000000";
    mix: (color1: string, _color2: string, _ratio?: number) => string;
};
export declare const cssVariables: {
    readonly '--color-primary': string;
    readonly '--color-secondary': string;
    readonly '--color-accent': string;
    readonly '--color-background': string;
    readonly '--color-surface': string;
    readonly '--color-text': string;
    readonly '--color-text-secondary': string;
    readonly '--color-border': string;
    readonly '--color-success': string;
    readonly '--color-warning': string;
    readonly '--color-error': string;
    readonly '--color-info': string;
    readonly '--gradient-primary': string;
    readonly '--gradient-secondary': string;
    readonly '--gradient-accent': string;
    readonly '--shadow-cinematic': string;
    readonly '--shadow-glow': string;
    readonly '--transition-fast': "150ms ease-in-out";
    readonly '--transition-normal': "250ms ease-in-out";
    readonly '--transition-slow': "350ms ease-in-out";
};
export declare const tailwindExtension: {
    theme: {
        extend: {
            colors: {
                accent: {
                    50: string;
                    100: string;
                    200: string;
                    300: string;
                    400: string;
                    500: string;
                    600: string;
                    700: string;
                    800: string;
                    900: string;
                };
                gaming: {
                    primary: string;
                    secondary: string;
                    accent: string;
                    dark: string;
                    darker: string;
                    light: string;
                    lighter: string;
                };
                white: string;
                gray: {
                    50: string;
                    100: string;
                    200: string;
                    300: string;
                    400: string;
                    500: string;
                    600: string;
                    700: string;
                    800: string;
                    850: string;
                    900: string;
                    950: string;
                };
                black: string;
                success: {
                    50: string;
                    100: string;
                    200: string;
                    300: string;
                    400: string;
                    500: string;
                    600: string;
                    700: string;
                    800: string;
                    900: string;
                };
                warning: {
                    50: string;
                    100: string;
                    200: string;
                    300: string;
                    400: string;
                    500: string;
                    600: string;
                    700: string;
                    800: string;
                    900: string;
                };
                error: {
                    50: string;
                    100: string;
                    200: string;
                    300: string;
                    400: string;
                    500: string;
                    600: string;
                    700: string;
                    800: string;
                    900: string;
                };
                info: {
                    50: string;
                    100: string;
                    200: string;
                    300: string;
                    400: string;
                    500: string;
                    600: string;
                    700: string;
                    800: string;
                    900: string;
                };
            };
            backgroundImage: {
                'gradient-primary': string;
                'gradient-secondary': string;
                'gradient-accent': string;
            };
            boxShadow: {
                cinematic: string;
                'cinematic-soft': string;
                'cinematic-strong': string;
                'glow-primary': string;
                'glow-secondary': string;
                'glow-accent': string;
            };
        };
    };
};

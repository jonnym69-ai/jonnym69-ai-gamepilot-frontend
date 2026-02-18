export declare const typography: {
    fontFamily: {
        sans: string[];
        gaming: string[];
        display: string[];
        mono: string[];
    };
    fontSize: {
        xs: (string | {
            lineHeight: string;
        })[];
        sm: (string | {
            lineHeight: string;
        })[];
        base: (string | {
            lineHeight: string;
        })[];
        lg: (string | {
            lineHeight: string;
        })[];
        xl: (string | {
            lineHeight: string;
        })[];
        '2xl': (string | {
            lineHeight: string;
        })[];
        '3xl': (string | {
            lineHeight: string;
        })[];
        '4xl': (string | {
            lineHeight: string;
        })[];
        '5xl': (string | {
            lineHeight: string;
        })[];
        '6xl': (string | {
            lineHeight: string;
        })[];
        '7xl': (string | {
            lineHeight: string;
        })[];
        '8xl': (string | {
            lineHeight: string;
        })[];
        '9xl': (string | {
            lineHeight: string;
        })[];
        'display-xs': (string | {
            lineHeight: string;
            letterSpacing: string;
        })[];
        'display-sm': (string | {
            lineHeight: string;
            letterSpacing: string;
        })[];
        'display-md': (string | {
            lineHeight: string;
            letterSpacing: string;
        })[];
        'display-lg': (string | {
            lineHeight: string;
            letterSpacing: string;
        })[];
        'display-xl': (string | {
            lineHeight: string;
            letterSpacing: string;
        })[];
        'display-2xl': (string | {
            lineHeight: string;
            letterSpacing: string;
        })[];
    };
    fontWeight: {
        thin: string;
        extralight: string;
        light: string;
        normal: string;
        medium: string;
        semibold: string;
        bold: string;
        extrabold: string;
        black: string;
    };
    letterSpacing: {
        tighter: string;
        tight: string;
        normal: string;
        wide: string;
        wider: string;
        widest: string;
    };
    lineHeight: {
        none: string;
        tight: string;
        snug: string;
        normal: string;
        relaxed: string;
        loose: string;
    };
};
export interface TextProps {
    size?: keyof typeof typography.fontSize;
    weight?: keyof typeof typography.fontWeight;
    family?: keyof typeof typography.fontFamily;
    color?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
    transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    decoration?: 'none' | 'underline' | 'line-through';
    truncate?: boolean;
    gradient?: boolean;
    className?: string;
    children: React.ReactNode;
}
export declare const textStyles: {
    heading: {
        h1: string;
        h2: string;
        h3: string;
        h4: string;
        h5: string;
        h6: string;
    };
    body: {
        large: string;
        base: string;
        small: string;
        xs: string;
    };
    display: {
        hero: string;
        feature: string;
        section: string;
    };
    gaming: {
        title: string;
        subtitle: string;
        stat: string;
        label: string;
    };
    gradients: {
        primary: string;
        accent: string;
        success: string;
        warning: string;
        error: string;
        info: string;
    };
};
export declare const textAnimations: {
    fadeIn: string;
    slideUp: string;
    slideDown: string;
    slideLeft: string;
    slideRight: string;
    pulse: string;
    glow: string;
    float: string;
    typewriter: string;
    glitch: string;
};
export declare const responsiveText: {
    autoHeader: string;
    autoSubheader: string;
    autoBody: string;
    autoCaption: string;
    fluidDisplay: string;
    fluidHeading: string;
    fluidBody: string;
};

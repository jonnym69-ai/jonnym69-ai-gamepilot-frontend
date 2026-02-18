export declare const durations: {
    instant: string;
    fast: string;
    normal: string;
    slow: string;
    slower: string;
    cinematic: string;
};
export declare const easings: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    gaming: {
        smooth: string;
        snappy: string;
        bounce: string;
        elastic: string;
        dramatic: string;
        cinematic: string;
        float: string;
        glow: string;
    };
};
export declare const animations: {
    fadeIn: {
        name: string;
        keyframes: {
            '0%': {
                opacity: string;
            };
            '100%': {
                opacity: string;
            };
        };
        timing: string;
    };
    fadeOut: {
        name: string;
        keyframes: {
            '0%': {
                opacity: string;
            };
            '100%': {
                opacity: string;
            };
        };
        timing: string;
    };
    fadeUp: {
        name: string;
        keyframes: {
            '0%': {
                opacity: string;
                transform: string;
            };
            '100%': {
                opacity: string;
                transform: string;
            };
        };
        timing: string;
    };
    fadeDown: {
        name: string;
        keyframes: {
            '0%': {
                opacity: string;
                transform: string;
            };
            '100%': {
                opacity: string;
                transform: string;
            };
        };
        timing: string;
    };
    fadeLeft: {
        name: string;
        keyframes: {
            '0%': {
                opacity: string;
                transform: string;
            };
            '100%': {
                opacity: string;
                transform: string;
            };
        };
        timing: string;
    };
    fadeRight: {
        name: string;
        keyframes: {
            '0%': {
                opacity: string;
                transform: string;
            };
            '100%': {
                opacity: string;
                transform: string;
            };
        };
        timing: string;
    };
    scaleIn: {
        name: string;
        keyframes: {
            '0%': {
                opacity: string;
                transform: string;
            };
            '100%': {
                opacity: string;
                transform: string;
            };
        };
        timing: string;
    };
    scaleOut: {
        name: string;
        keyframes: {
            '0%': {
                opacity: string;
                transform: string;
            };
            '100%': {
                opacity: string;
                transform: string;
            };
        };
        timing: string;
    };
    slideUp: {
        name: string;
        keyframes: {
            '0%': {
                transform: string;
            };
            '100%': {
                transform: string;
            };
        };
        timing: string;
    };
    slideDown: {
        name: string;
        keyframes: {
            '0%': {
                transform: string;
            };
            '100%': {
                transform: string;
            };
        };
        timing: string;
    };
    slideLeft: {
        name: string;
        keyframes: {
            '0%': {
                transform: string;
            };
            '100%': {
                transform: string;
            };
        };
        timing: string;
    };
    slideRight: {
        name: string;
        keyframes: {
            '0%': {
                transform: string;
            };
            '100%': {
                transform: string;
            };
        };
        timing: string;
    };
    pulse: {
        name: string;
        keyframes: {
            '0%, 100%': {
                opacity: string;
                transform: string;
            };
            '50%': {
                opacity: string;
                transform: string;
            };
        };
        timing: string;
    };
    pulseSlow: {
        name: string;
        keyframes: {
            '0%, 100%': {
                opacity: string;
                transform: string;
            };
            '50%': {
                opacity: string;
                transform: string;
            };
        };
        timing: string;
    };
    glow: {
        name: string;
        keyframes: {
            '0%, 100%': {
                boxShadow: string;
            };
            '50%': {
                boxShadow: string;
            };
        };
        timing: string;
    };
    float: {
        name: string;
        keyframes: {
            '0%, 100%': {
                transform: string;
            };
            '50%': {
                transform: string;
            };
        };
        timing: string;
    };
    bounce: {
        name: string;
        keyframes: {
            '0%, 20%, 53%, 80%, 100%': {
                transform: string;
            };
            '40%, 43%': {
                transform: string;
            };
            '70%': {
                transform: string;
            };
            '90%': {
                transform: string;
            };
        };
        timing: string;
    };
    shake: {
        name: string;
        keyframes: {
            '0%, 100%': {
                transform: string;
            };
            '10%, 30%, 50%, 70%, 90%': {
                transform: string;
            };
            '20%, 40%, 60%, 80%': {
                transform: string;
            };
        };
        timing: string;
    };
    cinematicEntrance: {
        name: string;
        keyframes: {
            '0%': {
                opacity: string;
                transform: string;
                filter: string;
            };
            '100%': {
                opacity: string;
                transform: string;
                filter: string;
            };
        };
        timing: string;
    };
    cinematicExit: {
        name: string;
        keyframes: {
            '0%': {
                opacity: string;
                transform: string;
                filter: string;
            };
            '100%': {
                opacity: string;
                transform: string;
                filter: string;
            };
        };
        timing: string;
    };
    glitch: {
        name: string;
        keyframes: {
            '0%, 100%': {
                transform: string;
                filter: string;
            };
            '20%': {
                transform: string;
                filter: string;
            };
            '40%': {
                transform: string;
                filter: string;
            };
            '60%': {
                transform: string;
                filter: string;
            };
            '80%': {
                transform: string;
                filter: string;
            };
        };
        timing: string;
    };
    typewriter: {
        name: string;
        keyframes: {
            from: {
                width: string;
            };
            to: {
                width: string;
            };
        };
        timing: string;
    };
    spin: {
        name: string;
        keyframes: {
            from: {
                transform: string;
            };
            to: {
                transform: string;
            };
        };
        timing: string;
    };
    ping: {
        name: string;
        keyframes: {
            '75%, 100%': {
                transform: string;
                opacity: string;
            };
            '0%': {
                transform: string;
                opacity: string;
            };
        };
        timing: string;
    };
};
export declare const transitions: {
    none: string;
    fast: string;
    normal: string;
    slow: string;
    snappy: string;
    bounce: string;
    elastic: string;
    dramatic: string;
    cinematic: string;
    colors: string;
    opacity: string;
    transform: string;
    shadow: string;
    all: string;
};
export interface MotionProps {
    initial?: string;
    animate?: string;
    exit?: string;
    transition?: string;
    whileHover?: string;
    whileTap?: string;
    variants?: Record<string, any>;
    custom?: any;
}
export declare const animationClasses: {
    'animate-fade-in': string;
    'animate-fade-up': string;
    'animate-fade-down': string;
    'animate-fade-left': string;
    'animate-fade-right': string;
    'animate-scale-in': string;
    'animate-slide-up': string;
    'animate-slide-down': string;
    'animate-slide-left': string;
    'animate-slide-right': string;
    'animate-pulse': string;
    'animate-pulse-slow': string;
    'animate-glow': string;
    'animate-float': string;
    'animate-bounce': string;
    'animate-shake': string;
    'animate-glitch': string;
    'animate-typewriter': string;
    'animate-cinematic-entrance': string;
    'animate-cinematic-exit': string;
    'animate-spin': string;
    'animate-ping': string;
};
export declare const cssKeyframes: Record<string, any>;
export declare const tailwindMotionExtension: {
    theme: {
        extend: {
            animation: {
                [x: string]: string;
            };
            keyframes: Record<string, any>;
            transitionDuration: {
                instant: string;
                fast: string;
                normal: string;
                slow: string;
                slower: string;
                cinematic: string;
            };
            transitionTimingFunction: {
                smooth: string;
                snappy: string;
                bounce: string;
                elastic: string;
                dramatic: string;
                cinematic: string;
                float: string;
                glow: string;
            };
        };
    };
};

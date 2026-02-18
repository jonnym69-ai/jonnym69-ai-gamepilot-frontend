// Motion Presets and Animations for GamePilot Design System
// Animation Durations
export const durations = {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
    cinematic: '750ms'
};
// Animation Easing Functions
export const easings = {
    // Standard
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // Custom gaming easings
    gaming: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        snappy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        bounce: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        dramatic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        cinematic: 'cubic-bezier(0.23, 1, 0.32, 1)',
        float: 'cubic-bezier(0.4, 0, 0.6, 1)',
        glow: 'cubic-bezier(0.4, 0, 0.6, 1)'
    }
};
// Animation Presets
export const animations = {
    // Fade animations
    fadeIn: {
        name: 'fadeIn',
        keyframes: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' }
        },
        timing: `${durations.normal} ${easings.gaming.smooth}`
    },
    fadeOut: {
        name: 'fadeOut',
        keyframes: {
            '0%': { opacity: '1' },
            '100%': { opacity: '0' }
        },
        timing: `${durations.normal} ${easings.gaming.smooth}`
    },
    fadeUp: {
        name: 'fadeUp',
        keyframes: {
            '0%': {
                opacity: '0',
                transform: 'translateY(var(--translate-5))'
            },
            '100%': {
                opacity: '1',
                transform: 'translateY(0)'
            }
        },
        timing: `${durations.normal} ${easings.gaming.smooth}`
    },
    fadeDown: {
        name: 'fadeDown',
        keyframes: {
            '0%': {
                opacity: '0',
                transform: 'translateY(calc(var(--translate-5) * -1))'
            },
            '100%': {
                opacity: '1',
                transform: 'translateY(0)'
            }
        },
        timing: `${durations.normal} ${easings.gaming.smooth}`
    },
    fadeLeft: {
        name: 'fadeLeft',
        keyframes: {
            '0%': {
                opacity: '0',
                transform: 'translateX(var(--translate-5))'
            },
            '100%': {
                opacity: '1',
                transform: 'translateX(0)'
            }
        },
        timing: `${durations.normal} ${easings.gaming.smooth}`
    },
    fadeRight: {
        name: 'fadeRight',
        keyframes: {
            '0%': {
                opacity: '0',
                transform: 'translateX(calc(var(--translate-5) * -1))'
            },
            '100%': {
                opacity: '1',
                transform: 'translateX(0)'
            }
        },
        timing: `${durations.normal} ${easings.gaming.smooth}`
    },
    // Scale animations
    scaleIn: {
        name: 'scaleIn',
        keyframes: {
            '0%': {
                opacity: '0',
                transform: 'scale(var(--scale-90))'
            },
            '100%': {
                opacity: '1',
                transform: 'scale(1)'
            }
        },
        timing: `${durations.normal} ${easings.gaming.snappy}`
    },
    scaleOut: {
        name: 'scaleOut',
        keyframes: {
            '0%': {
                opacity: '1',
                transform: 'scale(1)'
            },
            '100%': {
                opacity: '0',
                transform: 'scale(var(--scale-90))'
            }
        },
        timing: `${durations.normal} ${easings.gaming.snappy}`
    },
    // Slide animations
    slideUp: {
        name: 'slideUp',
        keyframes: {
            '0%': { transform: 'translateY(100%)' },
            '100%': { transform: 'translateY(0)' }
        },
        timing: `${durations.normal} ${easings.gaming.smooth}`
    },
    slideDown: {
        name: 'slideDown',
        keyframes: {
            '0%': { transform: 'translateY(-100%)' },
            '100%': { transform: 'translateY(0)' }
        },
        timing: `${durations.normal} ${easings.gaming.smooth}`
    },
    slideLeft: {
        name: 'slideLeft',
        keyframes: {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(0)' }
        },
        timing: `${durations.normal} ${easings.gaming.smooth}`
    },
    slideRight: {
        name: 'slideRight',
        keyframes: {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(0)' }
        },
        timing: `${durations.normal} ${easings.gaming.smooth}`
    },
    // Gaming-specific animations
    pulse: {
        name: 'pulse',
        keyframes: {
            '0%, 100%': {
                opacity: '1',
                transform: 'scale(1)'
            },
            '50%': {
                opacity: '0.8',
                transform: 'scale(var(--scale-105))'
            }
        },
        timing: `${durations.slow} ${easings.gaming.smooth} infinite`
    },
    pulseSlow: {
        name: 'pulseSlow',
        keyframes: {
            '0%, 100%': {
                opacity: '1',
                transform: 'scale(1)'
            },
            '50%': {
                opacity: '0.7',
                transform: 'scale(var(--scale-110))'
            }
        },
        timing: `${durations.cinematic} ${easings.gaming.smooth} infinite`
    },
    glow: {
        name: 'glow',
        keyframes: {
            '0%, 100%': {
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
            },
            '50%': {
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.8)'
            }
        },
        timing: `${durations.slow} ${easings.gaming.glow} infinite alternate`
    },
    float: {
        name: 'float',
        keyframes: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(calc(var(--translate-2) * -5))' }
        },
        timing: `${durations.cinematic} ${easings.gaming.float} infinite`
    },
    bounce: {
        name: 'bounce',
        keyframes: {
            '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0, 0, 0)' },
            '40%, 43%': { transform: 'translate3d(0, calc(var(--translate-8) * -3.75), 0)' },
            '70%': { transform: 'translate3d(0, calc(var(--translate-8) * -1.875), 0)' },
            '90%': { transform: 'translate3d(0, calc(var(--translate-8) * -0.5), 0)' }
        },
        timing: `${durations.slow} ${easings.gaming.bounce}`
    },
    shake: {
        name: 'shake',
        keyframes: {
            '0%, 100%': { transform: 'translateX(0)' },
            '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(calc(var(--translate-2) * -5))' },
            '20%, 40%, 60%, 80%': { transform: 'translateX(var(--translate-2) * 5)' }
        },
        timing: `${durations.normal} ${easings.gaming.snappy}`
    },
    // Cinematic animations
    cinematicEntrance: {
        name: 'cinematicEntrance',
        keyframes: {
            '0%': {
                opacity: '0',
                transform: 'scale(var(--scale-90)) translateY(var(--translate-5))',
                filter: 'blur(10px)'
            },
            '100%': {
                opacity: '1',
                transform: 'scale(1) translateY(0)',
                filter: 'blur(0px)'
            }
        },
        timing: `${durations.cinematic} ${easings.gaming.cinematic}`
    },
    cinematicExit: {
        name: 'cinematicExit',
        keyframes: {
            '0%': {
                opacity: '1',
                transform: 'scale(1) translateY(0)',
                filter: 'blur(0px)'
            },
            '100%': {
                opacity: '0',
                transform: 'scale(var(--scale-90)) translateY(calc(var(--translate-5) * -1))',
                filter: 'blur(10px)'
            }
        },
        timing: `${durations.cinematic} ${easings.gaming.cinematic}`
    },
    glitch: {
        name: 'glitch',
        keyframes: {
            '0%, 100%': {
                transform: 'translate(0)',
                filter: 'hue-rotate(0deg)'
            },
            '20%': {
                transform: 'translate(calc(var(--translate-px) * -2), var(--translate-px) * 2)',
                filter: 'hue-rotate(90deg)'
            },
            '40%': {
                transform: 'translate(calc(var(--translate-px) * -2), calc(var(--translate-px) * -2))',
                filter: 'hue-rotate(180deg)'
            },
            '60%': {
                transform: 'translate(var(--translate-px) * 2, var(--translate-px) * 2)',
                filter: 'hue-rotate(270deg)'
            },
            '80%': {
                transform: 'translate(var(--translate-px) * 2, calc(var(--translate-px) * -2))',
                filter: 'hue-rotate(360deg)'
            }
        },
        timing: `${durations.fast} ${easings.gaming.snappy} infinite`
    },
    typewriter: {
        name: 'typewriter',
        keyframes: {
            'from': { width: '0' },
            'to': { width: '100%' }
        },
        timing: `${durations.slower} ${easings.gaming.dramatic} steps(20, end)`
    },
    // Loading animations
    spin: {
        name: 'spin',
        keyframes: {
            'from': { transform: 'rotate(var(--rotate-0))' },
            'to': { transform: 'rotate(360deg)' }
        },
        timing: `${durations.normal} ${easings.linear} infinite`
    },
    ping: {
        name: 'ping',
        keyframes: {
            '75%, 100%': {
                transform: 'scale(var(--scale-150))',
                opacity: '0'
            },
            '0%': {
                transform: 'scale(1)',
                opacity: '1'
            }
        },
        timing: `${durations.slow} ${easings.gaming.smooth} infinite`
    }
};
// Transition Utilities
export const transitions = {
    // Basic transitions
    none: 'none',
    fast: `${durations.fast} ${easings.gaming.smooth}`,
    normal: `${durations.normal} ${easings.gaming.smooth}`,
    slow: `${durations.slow} ${easings.gaming.smooth}`,
    // Gaming transitions
    snappy: `${durations.fast} ${easings.gaming.snappy}`,
    bounce: `${durations.normal} ${easings.gaming.bounce}`,
    elastic: `${durations.normal} ${easings.gaming.elastic}`,
    dramatic: `${durations.cinematic} ${easings.gaming.dramatic}`,
    cinematic: `${durations.cinematic} ${easings.gaming.cinematic}`,
    // Property-specific transitions
    colors: `color ${durations.normal} ${easings.gaming.smooth}, background-color ${durations.normal} ${easings.gaming.smooth}, border-color ${durations.normal} ${easings.gaming.smooth}`,
    opacity: `opacity ${durations.normal} ${easings.gaming.smooth}`,
    transform: `transform ${durations.normal} ${easings.gaming.smooth}`,
    shadow: `box-shadow ${durations.normal} ${easings.gaming.smooth}`,
    all: `all ${durations.normal} ${easings.gaming.smooth}`
};
// Animation Classes
export const animationClasses = {
    // Entry animations
    'animate-fade-in': animations.fadeIn.name,
    'animate-fade-up': animations.fadeUp.name,
    'animate-fade-down': animations.fadeDown.name,
    'animate-fade-left': animations.fadeLeft.name,
    'animate-fade-right': animations.fadeRight.name,
    'animate-scale-in': animations.scaleIn.name,
    'animate-slide-up': animations.slideUp.name,
    'animate-slide-down': animations.slideDown.name,
    'animate-slide-left': animations.slideLeft.name,
    'animate-slide-right': animations.slideRight.name,
    // Gaming animations
    'animate-pulse': animations.pulse.name,
    'animate-pulse-slow': animations.pulseSlow.name,
    'animate-glow': animations.glow.name,
    'animate-float': animations.float.name,
    'animate-bounce': animations.bounce.name,
    'animate-shake': animations.shake.name,
    'animate-glitch': animations.glitch.name,
    'animate-typewriter': animations.typewriter.name,
    // Cinematic animations
    'animate-cinematic-entrance': animations.cinematicEntrance.name,
    'animate-cinematic-exit': animations.cinematicExit.name,
    // Loading animations
    'animate-spin': animations.spin.name,
    'animate-ping': animations.ping.name
};
// CSS Keyframes for Tailwind
export const cssKeyframes = Object.values(animations).reduce((acc, animation) => {
    acc[animation.name] = animation.keyframes;
    return acc;
}, {});
// Tailwind CSS Extension
export const tailwindMotionExtension = {
    theme: {
        extend: {
            animation: {
                ...Object.keys(animations).reduce((acc, key) => {
                    const animation = animations[key];
                    acc[animation.name] = animation.timing;
                    return acc;
                }, {})
            },
            keyframes: cssKeyframes,
            transitionDuration: durations,
            transitionTimingFunction: {
                ...easings.gaming
            }
        }
    }
};

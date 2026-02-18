// Typography Scale for GamePilot Design System
export const typography = {
    // Font Families
    fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        gaming: ['Orbitron', 'monospace'],
        display: ['Orbitron', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
    },
    // Font Sizes (Fluid Typography)
    fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        base: ['1rem', { lineHeight: '1.5rem' }], // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
        '5xl': ['3rem', { lineHeight: '1' }], // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }], // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }], // 72px
        '8xl': ['6rem', { lineHeight: '1' }], // 96px
        '9xl': ['8rem', { lineHeight: '1' }], // 128px
        // Display sizes for headers
        'display-xs': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        'display-sm': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        'display-md': ['3rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display-lg': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'display-xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'display-2xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.04em' }]
    },
    // Font Weights
    fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900'
    },
    // Letter Spacing
    letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em'
    },
    // Line Heights
    lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2'
    }
};
// Typography utilities
export const textStyles = {
    // Heading styles
    heading: {
        h1: 'text-4xl md:text-6xl font-bold font-gaming tracking-tight',
        h2: 'text-3xl md:text-5xl font-bold font-gaming tracking-tight',
        h3: 'text-2xl md:text-4xl font-semibold font-gaming tracking-tight',
        h4: 'text-xl md:text-3xl font-semibold font-gaming tracking-tight',
        h5: 'text-lg md:text-2xl font-semibold tracking-tight',
        h6: 'text-base md:text-xl font-semibold tracking-tight'
    },
    // Body text styles
    body: {
        large: 'text-lg leading-relaxed',
        base: 'text-base leading-normal',
        small: 'text-sm leading-relaxed',
        xs: 'text-xs leading-relaxed'
    },
    // Specialized text styles
    display: {
        hero: 'text-5xl md:text-7xl lg:text-8xl font-bold font-gaming tracking-tight',
        feature: 'text-4xl md:text-6xl font-bold font-gaming tracking-tight',
        section: 'text-3xl md:text-5xl font-bold font-gaming tracking-tight'
    },
    // Gaming-specific styles
    gaming: {
        title: 'text-2xl md:text-4xl font-bold font-gaming tracking-wide uppercase',
        subtitle: 'text-lg md:text-2xl font-semibold font-gaming tracking-wide',
        stat: 'text-3xl md:text-5xl font-bold font-mono tabular-nums',
        label: 'text-xs md:text-sm font-semibold font-gaming tracking-wider uppercase'
    },
    // Gradient text utilities
    gradients: {
        primary: 'bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent',
        accent: 'bg-gradient-to-r from-gaming-accent to-purple-500 bg-clip-text text-transparent',
        success: 'bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent',
        error: 'bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent',
        info: 'bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent'
    }
};
// Animation classes for text
export const textAnimations = {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    slideDown: 'animate-slide-down',
    slideLeft: 'animate-slide-left',
    slideRight: 'animate-slide-right',
    pulse: 'animate-pulse-slow',
    glow: 'animate-glow',
    float: 'animate-float',
    typewriter: 'animate-typewriter',
    glitch: 'animate-glitch'
};
// Responsive text utilities
export const responsiveText = {
    // Auto-scaling headers
    autoHeader: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
    autoSubheader: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
    autoBody: 'text-sm sm:text-base md:text-lg',
    autoCaption: 'text-xs sm:text-sm',
    // Fluid typography with clamp
    fluidDisplay: 'text-[clamp(2rem,5vw,6rem)]',
    fluidHeading: 'text-[clamp(1.5rem,4vw,3rem)]',
    fluidBody: 'text-[clamp(0.875rem,2vw,1.125rem)]'
};

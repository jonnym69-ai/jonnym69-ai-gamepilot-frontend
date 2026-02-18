import type { IdentityCore } from './identityCore';
/**
 * Build persona signals from raw Steam data
 * Real computation logic for persona signal generation
 */
export declare function buildPersonaSignals(raw: IdentityCore["raw"]): IdentityCore["signals"];
/**
 * Build persona traits from computed signals
 * Real scoring logic for personality trait computation
 */
export declare function buildPersonaTraits(signals: IdentityCore["signals"]): IdentityCore["traits"];
//# sourceMappingURL=synthesis.d.ts.map
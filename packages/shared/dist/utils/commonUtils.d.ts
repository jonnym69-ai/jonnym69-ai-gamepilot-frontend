export declare const formatDate: (date: Date) => string;
export declare const formatDateTime: (date: Date) => string;
export declare const getRelativeTime: (date: Date) => string;
export declare const uniqueById: <T extends {
    id: string;
}>(items: T[]) => T[];
export declare const groupBy: <T, K extends keyof T>(items: T[], key: K) => Record<string, T[]>;
export declare const hexToRgb: (hex: string) => {
    r: number;
    g: number;
    b: number;
} | null;
export declare const getContrastColor: (hex: string) => string;
//# sourceMappingURL=commonUtils.d.ts.map
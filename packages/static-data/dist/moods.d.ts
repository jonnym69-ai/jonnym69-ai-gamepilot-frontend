export interface Mood {
    id: string;
    name: string;
    description: string;
    emoji: string;
    icon: string;
    color: string;
    intensity: number;
    associatedGenres: string[];
}
export declare const MOODS: readonly Mood[];
export type MoodId = typeof MOODS[number]['id'];
export type MoodIntensity = typeof MOODS[number]['intensity'];

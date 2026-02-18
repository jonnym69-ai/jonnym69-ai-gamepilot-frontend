export interface Mood {
    id: string;
    name: string;
    description: string;
    emoji: string;
    color: string;
    associatedGenres: string[];
    intensity: 'low' | 'medium' | 'high';
}
export declare const MOODS: readonly Mood[];
export type MoodId = typeof MOODS[number]['id'];
export type MoodIntensity = typeof MOODS[number]['intensity'];

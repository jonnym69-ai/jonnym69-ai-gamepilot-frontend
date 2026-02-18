export interface Genre {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    tags: string[];
}
export declare const GENRES: readonly Genre[];
export type GenreId = typeof GENRES[number]['id'];

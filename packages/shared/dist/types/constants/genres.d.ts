export interface GenreDefinition {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
    subgenres: SubgenreDefinition[];
    category: 'core' | 'hybrid' | 'niche' | 'retro' | 'esports' | 'indie';
}
export interface SubgenreDefinition {
    id: string;
    name: string;
    description: string;
    color?: string;
    icon?: string;
    parentGenre?: string;
}
export declare const CORE_GENRES: GenreDefinition[];
export declare const HYBRID_GENRES: GenreDefinition[];
export declare const NICHE_GENRES: GenreDefinition[];
export declare const RETRO_GENRES: GenreDefinition[];
export declare const ESPORTS_GENRES: GenreDefinition[];
export declare const INDIE_GENRES: GenreDefinition[];
export declare const ALL_GENRES: GenreDefinition[];
export declare const getGenreById: (id: string) => GenreDefinition | undefined;
export declare const getSubgenreById: (genreId: string, subgenreId: string) => SubgenreDefinition | undefined;
export declare const getGenresByCategory: (category: GenreDefinition["category"]) => GenreDefinition[];
export declare const searchGenres: (query: string) => GenreDefinition[];
export declare const getPopularGenres: () => GenreDefinition[];
//# sourceMappingURL=genres.d.ts.map
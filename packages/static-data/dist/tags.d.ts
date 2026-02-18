export interface Tag {
    id: string;
    name: string;
    category: 'gameplay' | 'atmosphere' | 'difficulty' | 'social' | 'theme';
    description: string;
    color: string;
}
export declare const TAGS: readonly Tag[];
export type TagId = typeof TAGS[number]['id'];
export type TagCategory = typeof TAGS[number]['category'];

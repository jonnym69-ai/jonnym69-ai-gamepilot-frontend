export interface IntegrationPlatform {
    id: string;
    name: string;
    type: 'social' | 'gaming' | 'streaming' | 'music';
    description?: string;
    website?: string;
    logo?: string;
}
export declare const INTEGRATIONS_CATALOG: IntegrationPlatform[];
//# sourceMappingURL=integrationsCatalog.d.ts.map
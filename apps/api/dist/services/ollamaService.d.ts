export interface OllamaResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    context?: number[];
    total_duration?: number;
    load_duration?: number;
    sample_count?: number;
    sample_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
}
export interface MoodAnalysis {
    moods: string[];
}
declare class OllamaService {
    private baseUrl;
    private model;
    constructor(baseUrl?: string, model?: string);
    /**
     * Get moods from AI based on game description
     */
    getMoodsFromAI(description: string): Promise<string[]>;
    /**
     * Check if Ollama service is available
     */
    isAvailable(): Promise<boolean>;
    /**
     * Get available models from Ollama
     */
    getAvailableModels(): Promise<string[]>;
    /**
     * Set the model to use for mood analysis
     */
    setModel(model: string): void;
    /**
     * Get current model
     */
    getModel(): string;
}
export declare const ollamaService: OllamaService;
export { OllamaService };
//# sourceMappingURL=ollamaService.d.ts.map
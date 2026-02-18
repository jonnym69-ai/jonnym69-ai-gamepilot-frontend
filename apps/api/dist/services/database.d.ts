import { Database } from 'sqlite';
import { User, UserIntegration } from '@gamepilot/shared';
import { Game, PlatformCode } from '@gamepilot/shared';
export interface DatabaseSchema {
    users: User;
    user_integrations: UserIntegration;
    games: Game;
    user_games: {
        id: string;
        userId: string;
        gameId: string;
        playStatus: string;
        hoursPlayed: number;
        lastPlayed: Date;
        addedAt: Date;
        notes?: string;
        isFavorite: boolean;
    };
}
export interface Migration {
    id: string;
    version: string;
    description: string;
    up: (db: Database) => Promise<void>;
    down: (db: Database) => Promise<void>;
}
export declare class DatabaseService {
    private db;
    private readonly dbPath;
    private readonly migrations;
    constructor(dbPath?: string);
    private registerMigrations;
    private runMigrations;
    initialize(): Promise<void>;
    private createTables;
    createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, password?: string): Promise<User>;
    getUserById(id: string): Promise<User | null>;
    getUserByUsername(username: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    updateUser(id: string, updates: Partial<User>): Promise<User>;
    createIntegration(integration: Omit<UserIntegration, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserIntegration>;
    getUserIntegrations(userId: string): Promise<UserIntegration[]>;
    getIntegration(userId: string, platform: PlatformCode): Promise<UserIntegration | null>;
    updateIntegration(id: string, updates: Partial<UserIntegration>): Promise<UserIntegration>;
    deleteIntegration(id: string): Promise<void>;
    getUserIntegration(userId: string, platform: string): Promise<UserIntegration | null>;
    createUserIntegration(integration: {
        id: string;
        userId: string;
        platform: string;
        externalUserId: string;
        externalUsername?: string;
    }): Promise<UserIntegration>;
    createGame(game: Omit<Game, 'id' | 'addedAt'>): Promise<Game>;
    getUserGames(userId: string): Promise<Game[]>;
    getAllGames(): Promise<Game[]>;
    migrateEmotionalTagsToMoods(): Promise<number>;
    getGameById(id: string): Promise<Game | null>;
    getGameByAppId(appId: number): Promise<Game | null>;
    getGameByTitle(title: string): Promise<Game | null>;
    updateGame(id: string, updates: Partial<Game>): Promise<Game>;
    deleteGame(id: string): Promise<boolean>;
    /**
     * Delete user and all associated data (GDPR compliant cleanup)
     * Budget-friendly: Uses SQLite cascading and manual cleanup
     */
    deleteUser(id: string): Promise<boolean>;
    addUserGame(userId: string, gameId: string, gameData?: Partial<{
        playStatus: string;
        hoursPlayed: number;
        lastPlayed: Date;
        notes: string;
        isFavorite: boolean;
    }>): Promise<void>;
    private mapRowToUser;
    private mapRowToIntegration;
    private mapRowToGame;
    private getIntegrationById;
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        details: {
            connected: boolean;
            tablesExist: boolean;
            migrationsUpToDate: boolean;
            readTest: 'success' | 'failed';
            writeTest: 'success' | 'failed';
            error?: string;
            issues: string[];
        };
    }>;
    runQuery(sql: string, params?: any[]): Promise<{
        changes: number;
    }>;
    getAll(sql: string, params?: any[]): Promise<any[]>;
    createSession(sessionData: {
        token: string;
        userId: string;
        createdAt: Date;
        expiresAt: Date;
        lastAccessed: Date;
        userAgent?: string;
        ipAddress?: string;
    }): Promise<void>;
    getSession(token: string): Promise<{
        token: string;
        userId: string;
        createdAt: Date;
        expiresAt: Date;
        lastAccessed: Date;
        userAgent?: string;
        ipAddress?: string;
    } | null>;
    updateSession(sessionData: {
        token: string;
        userId: string;
        lastAccessed: Date;
        userAgent?: string;
        ipAddress?: string;
    }): Promise<void>;
    deleteSession(token: string): Promise<boolean>;
    deleteAllUserSessions(userId: string): Promise<number>;
    deleteExpiredSessions(): Promise<number>;
    getUserSessionCount(userId: string): Promise<number>;
    createGameSession(sessionData: {
        gameId: string;
        userId: string;
        startedAt: Date;
        platformCode?: string;
        launchMethod?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        gameId: string;
        userId: string;
        startedAt: Date;
    }>;
    getGameSession(sessionId: string): Promise<{
        id: string;
        userId: string;
        gameId: string;
        startedAt: Date;
        endedAt?: Date;
        duration?: number;
        platformCode?: string;
        launchMethod?: string;
        isActive: boolean;
    } | null>;
    getActiveGameSessions(userId: string, gameId?: string): Promise<Array<{
        id: string;
        userId: string;
        gameId: string;
        startedAt: Date;
        platformCode?: string;
        launchMethod?: string;
        isActive: boolean;
    }>>;
    endGameSession(sessionId: string, endedAt: Date, duration: number): Promise<void>;
    getGameSessionHistory(userId: string, gameId?: string, limit?: number, offset?: number): Promise<Array<{
        id: string;
        userId: string;
        gameId: string;
        startedAt: Date;
        endedAt?: Date;
        duration?: number;
        platformCode?: string;
        launchMethod?: string;
        isActive: boolean;
    }>>;
    setPassword(userId: string, passwordHash: string): Promise<void>;
    getPassword(userId: string): Promise<string | null>;
    validatePassword(userId: string, password: string, compareFn: (password: string, hash: string) => Promise<boolean>): Promise<boolean>;
    deletePassword(userId: string): Promise<void>;
    /**
     * Get user persona from database
     */
    getPersona(userId: string): Promise<any | null>;
    /**
     * Create new persona in database
     */
    createPersona(userId: string, persona: any): Promise<void>;
    /**
     * Update existing persona in database
     */
    updatePersona(userId: string, persona: any): Promise<void>;
    /**
     * Delete persona from database
     */
    deletePersona(userId: string): Promise<void>;
    /**
     * Get all personas (for admin/debugging)
     */
    getAllPersonas(): Promise<any[]>;
    close(): Promise<void>;
}
export declare const databaseService: DatabaseService;
//# sourceMappingURL=database.d.ts.map
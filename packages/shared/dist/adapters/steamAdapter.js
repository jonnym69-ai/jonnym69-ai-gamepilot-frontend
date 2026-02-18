"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SteamAdapter = void 0;
const static_data_1 = require("@gamepilot/static-data");
class SteamAdapter {
    /**
     * Convert Steam game data to canonical Game interface
     */
    static toCanonicalGame(steamGame) {
        const now = new Date();
        const playtimeHours = Math.floor(steamGame.playtime_forever / 60);
        const lastPlayed = steamGame.rtime_last_played
            ? new Date(steamGame.rtime_last_played * 1000)
            : steamGame.lastPlayed
                ? new Date(steamGame.lastPlayed)
                : undefined;
        // Determine play status
        const playStatus = this.determinePlayStatus(playtimeHours);
        // Extract and normalize genres
        const genres = this.extractGenres(steamGame);
        // Extract platforms
        const platforms = this.extractPlatforms(steamGame);
        // Generate unique ID
        const id = `steam-${steamGame.appid}`;
        return {
            id,
            title: steamGame.name,
            description: steamGame.shortDescription || '',
            backgroundImages: steamGame.backgroundImages || [],
            coverImage: this.generateCoverImage(steamGame.appid, steamGame),
            releaseDate: steamGame.releaseDate ? new Date(steamGame.releaseDate) : now,
            developer: steamGame.developer || '',
            publisher: steamGame.publisher || '',
            genres,
            subgenres: [], // Required by shared Game interface
            platforms,
            emotionalTags: [], // Will be populated by mood analysis later
            userRating: undefined,
            globalRating: steamGame.metacriticScore,
            playStatus,
            hoursPlayed: playtimeHours,
            lastPlayed,
            addedAt: now,
            notes: '',
            isFavorite: false,
            tags: [],
            releaseYear: steamGame.releaseYear || now.getFullYear(),
            achievements: steamGame.achievements,
            totalPlaytime: playtimeHours,
            averageRating: undefined,
            completionPercentage: undefined,
            // Properties matching shared Game interface
            moods: [], // Will be populated by mood analysis later
            playHistory: [] // Will be populated by mood analysis later
        };
    }
    /**
     * Convert array of Steam games to canonical Games
     */
    static toCanonicalGames(steamGames) {
        return steamGames
            .filter(game => game.name && game.appid) // Filter out invalid entries
            .map(game => this.toCanonicalGame(game));
    }
    /**
     * Determine play status based on playtime
     */
    static determinePlayStatus(playtimeHours) {
        if (playtimeHours === 0)
            return 'unplayed';
        if (playtimeHours < 2)
            return 'playing';
        if (playtimeHours < 20)
            return 'completed';
        return 'playing'; // Heavy playtime suggests ongoing engagement
    }
    /**
     * Extract and normalize genres from Steam data
     */
    static extractGenres(steamGame) {
        const genres = [];
        // Extract from Steam genres if available
        if (steamGame.genres && Array.isArray(steamGame.genres)) {
            steamGame.genres.forEach(steamGenre => {
                const genreName = typeof steamGenre === 'string' ? steamGenre : steamGenre.description;
                const normalizedGenre = this.normalizeGenre(genreName);
                if (normalizedGenre) {
                    genres.push(normalizedGenre);
                }
            });
        }
        // Extract from categories as fallback
        if (genres.length === 0 && steamGame.categories && Array.isArray(steamGame.categories)) {
            steamGame.categories.forEach(category => {
                const genreFromCategory = this.categoryToGenre(category.description);
                if (genreFromCategory) {
                    genres.push(genreFromCategory);
                }
            });
        }
        // Extract from tags if available
        if (genres.length === 0 && steamGame.tags && Array.isArray(steamGame.tags)) {
            steamGame.tags.forEach((tag) => {
                const genreFromTag = this.normalizeGenre(tag);
                if (genreFromTag) {
                    genres.push(genreFromTag);
                }
            });
        }
        // Title-based genre analysis as final fallback
        if (genres.length === 0) {
            const titleGenres = this.extractGenresFromTitle(steamGame.name);
            genres.push(...titleGenres);
        }
        // Default to Action if still no genres found
        if (genres.length === 0) {
            const actionGenre = static_data_1.GENRES.find(g => g.name.toLowerCase() === 'action');
            if (actionGenre) {
                genres.push({
                    id: actionGenre.id,
                    name: actionGenre.name,
                    description: actionGenre.description,
                    color: actionGenre.color,
                    icon: actionGenre.icon || '🎮',
                    subgenres: []
                });
            }
        }
        return genres.slice(0, 3); // Limit to top 3 genres
    }
    /**
     * Normalize Steam genre to our canonical genre
     */
    static normalizeGenre(steamGenreName) {
        const normalized = steamGenreName.toLowerCase().trim();
        // Direct matches
        const directMatch = static_data_1.GENRES.find(g => g.name.toLowerCase() === normalized ||
            g.name.toLowerCase().includes(normalized) ||
            normalized.includes(g.name.toLowerCase()));
        if (directMatch) {
            // Convert static-data Genre to canonical Genre
            return {
                id: directMatch.id,
                name: directMatch.name,
                description: directMatch.description,
                color: directMatch.color,
                icon: directMatch.icon || '🎮',
                subgenres: []
            };
        }
        // Common mappings
        const mappings = {
            'role-playing': 'rpg',
            'strategy': 'strategy',
            'adventure': 'adventure',
            'action': 'action',
            'simulation': 'simulation',
            'sports': 'sports',
            'racing': 'racing',
            'puzzle': 'puzzle',
            'indie': 'indie',
            'casual': 'casual',
            'massively multiplayer': 'multiplayer',
            'early access': 'early-access'
        };
        const mappedName = mappings[normalized];
        if (mappedName) {
            const mappedGenre = static_data_1.GENRES.find(g => g.name.toLowerCase() === mappedName);
            if (mappedGenre) {
                return {
                    id: mappedGenre.id,
                    name: mappedGenre.name,
                    description: mappedGenre.description,
                    color: mappedGenre.color,
                    icon: mappedGenre.icon || '🎮',
                    subgenres: []
                };
            }
        }
        return null;
    }
    /**
     * Convert Steam category to genre
     */
    static categoryToGenre(categoryName) {
        const category = categoryName.toLowerCase();
        if (category.includes('multiplayer') || category.includes('online')) {
            const multiplayerGenre = static_data_1.GENRES.find(g => g.name.toLowerCase() === 'multiplayer');
            if (multiplayerGenre) {
                return {
                    id: multiplayerGenre.id,
                    name: multiplayerGenre.name,
                    description: multiplayerGenre.description,
                    color: multiplayerGenre.color,
                    icon: multiplayerGenre.icon || '🎮',
                    subgenres: []
                };
            }
        }
        if (category.includes('single-player')) {
            const singlePlayerGenre = static_data_1.GENRES.find(g => g.name.toLowerCase() === 'single-player');
            if (singlePlayerGenre) {
                return {
                    id: singlePlayerGenre.id,
                    name: singlePlayerGenre.name,
                    description: singlePlayerGenre.description,
                    color: singlePlayerGenre.color,
                    icon: singlePlayerGenre.icon || '🎮',
                    subgenres: []
                };
            }
        }
        return null;
    }
    /**
     * Extract platforms from Steam data
     */
    static extractPlatforms(_steamGame) {
        return [{
                id: 'steam',
                name: 'Steam',
                code: 'steam',
                isConnected: true
            }];
    }
    /**
     * Extract tags for mood analysis
     */
    static extractTags(steamGame) {
        const tags = [];
        // Extract from categories
        if (steamGame.categories) {
            steamGame.categories.forEach(category => {
                const desc = category.description.toLowerCase();
                if (desc.includes('multiplayer') || desc.includes('co-op'))
                    tags.push('multiplayer');
                if (desc.includes('single-player'))
                    tags.push('single-player');
                if (desc.includes('achievement'))
                    tags.push('achievements');
                if (desc.includes('trading'))
                    tags.push('trading');
                if (desc.includes('controller'))
                    tags.push('controller');
                if (desc.includes('vr'))
                    tags.push('vr');
                if (desc.includes('workshop'))
                    tags.push('modding');
            });
        }
        // Add genre-based tags
        if (steamGame.genres) {
            steamGame.genres.forEach(genre => {
                const desc = genre.description.toLowerCase();
                if (desc.includes('action'))
                    tags.push('action');
                if (desc.includes('adventure'))
                    tags.push('adventure');
                if (desc.includes('rpg'))
                    tags.push('rpg');
                if (desc.includes('strategy'))
                    tags.push('strategy');
                if (desc.includes('simulation'))
                    tags.push('simulation');
                if (desc.includes('sports'))
                    tags.push('sports');
                if (desc.includes('racing'))
                    tags.push('racing');
                if (desc.includes('puzzle'))
                    tags.push('puzzle');
                if (desc.includes('indie'))
                    tags.push('indie');
            });
        }
        // Add playtime-based tags
        const playtimeHours = Math.floor(steamGame.playtime_forever / 60);
        if (playtimeHours > 50)
            tags.push('time-consuming');
        if (playtimeHours > 0 && playtimeHours < 2)
            tags.push('quick-session');
        return [...new Set(tags)]; // Remove duplicates
    }
    /**
     * Extract genres from game title using pattern matching
     */
    static extractGenresFromTitle(title) {
        const genres = [];
        const lowerTitle = title.toLowerCase();
        // Define genre patterns based on common game title keywords
        const genrePatterns = [
            { pattern: /\b(rpg|role.?playing|final.?fantasy|elder.?scrolls|witcher|dragon.?age|mass.?effect)\b/, genreName: 'RPG' },
            { pattern: /\b(shooter|fps|first.?person|call.?of.?duty|counter.?strike|overwatch|apex|valorant|halo|doom)\b/, genreName: 'Shooter' },
            { pattern: /\b(strategy|rts|real.?time|civilization|starcraft|age.?of.?empires|total.?war)\b/, genreName: 'Strategy' },
            { pattern: /\b(action|devil.?may.?cry|bayonetta|god.?of.?war|dmc|hack.?and.?slash)\b/, genreName: 'Action' },
            { pattern: /\b(adventure|zelda|tomb.?raider|uncharted|resident.?evil|silent.?hill)\b/, genreName: 'Adventure' },
            { pattern: /\b(racing|need.?for.?speed|gran.?turismo|forza|mario.?kart)\b/, genreName: 'Racing' },
            { pattern: /\b(sports|fifa|nba|nfl|mlb|football|basketball|soccer)\b/, genreName: 'Sports' },
            { pattern: /\b(puzzle|tetris|candy.?crush|match.?3|sudoku|crossword)\b/, genreName: 'Puzzle' },
            { pattern: /\b(simulation|sim|flight.?sim|farm.?sim|city.?builder|rollercoaster)\b/, genreName: 'Simulation' },
            { pattern: /\b(horror|scary|terror|fear|amnesia|outlast|dead.?space)\b/, genreName: 'Horror' },
            { pattern: /\b(platformer|mario|sonic|celeste|hollow.?knight|ori)\b/, genreName: 'Platformer' },
            { pattern: /\b(mmo|mmorpg|world.?of.?warcraft|final.?fantasy.?xiv|guild.?wars)\b/, genreName: 'MMO' },
            { pattern: /\b(fighting|street.?fighter|mortal.?kombat|tekken|smash.?bros)\b/, genreName: 'Fighting' },
            { pattern: /\b(stealth|metal.?gear|hitman|assassin|splinter.?cell)\b/, genreName: 'Stealth' },
            { pattern: /\b(survival|rust|ark|minecraft?|don't.?starve|the.?forest)\b/, genreName: 'Survival' },
            { pattern: /\b(open.?world|gta|skyrim|cyberpunk|red.?dead|witcher|botw)\b/, genreName: 'Open World' }
        ];
        // Check each pattern
        genrePatterns.forEach(({ pattern, genreName }) => {
            if (pattern.test(lowerTitle)) {
                const canonicalGenre = static_data_1.GENRES.find(g => g.name.toLowerCase() === genreName.toLowerCase() ||
                    g.name.toLowerCase().includes(genreName.toLowerCase()) ||
                    genreName.toLowerCase().includes(g.name.toLowerCase()));
                if (canonicalGenre) {
                    genres.push({
                        id: canonicalGenre.id,
                        name: canonicalGenre.name,
                        description: canonicalGenre.description,
                        color: canonicalGenre.color,
                        icon: canonicalGenre.icon || '🎮',
                        subgenres: []
                    });
                }
            }
        });
        return genres.slice(0, 2); // Limit to 2 genres from title analysis
    }
    /**
     * Generate cover image URL with fallbacks
     */
    static generateCoverImage(appId, steamGame) {
        // Use provided image if available
        if (steamGame.img_logo_url) {
            return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`;
        }
        // Standard Steam CDN URLs in order of preference
        const fallbackUrls = [
            `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`,
            `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`,
            `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/capsule_184x69.jpg`,
            `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/capsule_231x87.jpg`
        ];
        return fallbackUrls[0]; // Return primary URL, others can be tried if it fails
    }
    /**
     * Validate Steam game data
     */
    static validateSteamGame(game) {
        return !!(game.name && game.appid && typeof game.appid === 'number');
    }
    /**
     * Filter out invalid Steam games
     */
    static filterValidGames(games) {
        return games.filter(game => this.validateSteamGame(game));
    }
}
exports.SteamAdapter = SteamAdapter;
//# sourceMappingURL=steamAdapter.js.map
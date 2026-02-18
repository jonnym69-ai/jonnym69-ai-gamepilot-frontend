"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./routes/auth"));
const steamAuth_1 = __importDefault(require("./routes/steamAuth"));
const games_1 = __importDefault(require("./routes/games"));
const moodPersonaSimple_1 = __importDefault(require("./routes/moodPersonaSimple"));
// import diagnosticsRoutes from './routes/diagnostics'
const steam_1 = __importDefault(require("./routes/steam"));
const integrations_1 = __importDefault(require("./routes/integrations"));
const session_1 = __importDefault(require("./routes/session"));
const home_1 = __importDefault(require("./routes/home"));
const persona_1 = __importDefault(require("./routes/persona"));
const recommendations_1 = __importDefault(require("./routes/recommendations"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const launcher_1 = __importDefault(require("./routes/launcher"));
const feedback_1 = __importDefault(require("./routes/feedback"));
const health_1 = __importDefault(require("./routes/health"));
// import realTimeRoutes from './routes/realTime'
const router = (0, express_1.Router)();
console.log('🔧 Loading API routes...');
// Register all route modules
router.use('/auth', auth_1.default);
router.use('/auth', steamAuth_1.default); // Combine steam auth with main auth
console.log('✅ Auth routes loaded');
router.use('/games', games_1.default);
console.log('✅ Games routes loaded');
router.use('/mood', moodPersonaSimple_1.default);
console.log('✅ Mood routes loaded');
// router.use('/diagnostics', diagnosticsRoutes)
router.use('/steam', steam_1.default);
console.log('✅ Steam routes loaded');
// TEMPORARY: Add steam genre endpoint directly to main router
router.get('/steam/genre/:genre', (req, res) => {
    console.log(`🎮 GET /steam/genre/${req.params.genre} - Handling request`);
    try {
        const { genre } = req.params;
        const { limit = 20 } = req.query;
        console.log(`🎮 GET /steam/genre/${genre} - Fetching Steam games for genre: ${genre}`);
        // Mock data for now - expanded with more genres
        const genreGames = {
            'indie': [
                {
                    id: '252490',
                    name: 'Rust',
                    genres: ['Action', 'Adventure', 'Indie', 'Massively Multiplayer'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/252490/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/252490/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/252490/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/252490/capsule_184x69.jpg',
                    description: 'The only aim in Rust is to survive.',
                    price: '$39.99',
                    releaseDate: '2013-02-21',
                    recommendationScore: 85
                },
                {
                    id: '105600',
                    name: 'Terraria',
                    genres: ['Action', 'Adventure', 'Indie', 'RPG'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/105600/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/105600/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/105600/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/105600/capsule_184x69.jpg',
                    description: 'Dig, fight, explore, build! The ultimate sandbox adventure.',
                    price: '$9.99',
                    releaseDate: '2011-05-16',
                    recommendationScore: 92
                },
                {
                    id: '292100',
                    name: 'Stardew Valley',
                    genres: ['Indie', 'Simulation', 'RPG'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/292100/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/292100/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/292100/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/292100/capsule_184x69.jpg',
                    description: 'You\'ve inherited your grandfather\'s old farm plot in Stardew Valley.',
                    price: '$14.99',
                    releaseDate: '2016-02-26',
                    recommendationScore: 88
                },
                {
                    id: '236850',
                    name: 'Hollow Knight',
                    genres: ['Action', 'Adventure', 'Indie'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/236850/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/236850/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/236850/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/236850/capsule_184x69.jpg',
                    description: 'Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom.',
                    price: '$14.99',
                    releaseDate: '2017-02-24',
                    recommendationScore: 95
                },
                {
                    id: '322330',
                    name: 'Don\'t Starve',
                    genres: ['Action', 'Adventure', 'Indie', 'Simulation'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/322330/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/322330/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/322330/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/322330/capsule_184x69.jpg',
                    description: 'Fight, Farm, Build and Explore Together in the standalone multiplayer expansion to Don\'t Starve.',
                    price: '$14.99',
                    releaseDate: '2013-04-23',
                    recommendationScore: 78
                },
                {
                    id: '440900',
                    name: 'Celeste',
                    genres: ['Action', 'Adventure', 'Indie'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/440900/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/440900/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/440900/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/440900/capsule_184x69.jpg',
                    description: 'Help Madeline survive her inner demons on her journey to the top of Celeste Mountain.',
                    price: '$19.99',
                    releaseDate: '2018-01-25',
                    recommendationScore: 82
                },
                {
                    id: '274190',
                    name: 'Dead Cells',
                    genres: ['Action', 'Indie', 'Roguelike'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/274190/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/274190/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/274190/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/274190/capsule_184x69.jpg',
                    description: 'Dead Cells is a rogue-lite, metroidvania-inspired action platformer.',
                    price: '$24.99',
                    releaseDate: '2018-08-07',
                    recommendationScore: 87
                },
                {
                    id: '211820',
                    name: 'Starbound',
                    genres: ['Action', 'Adventure', 'Indie', 'RPG'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/211820/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/211820/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/211820/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/211820/capsule_184x69.jpg',
                    description: 'You\'ve fled your home, only to find yourself lost in space with a damaged ship.',
                    price: '$14.99',
                    releaseDate: '2016-03-22',
                    recommendationScore: 84
                },
                {
                    id: '251710',
                    name: 'The Binding of Isaac: Rebirth',
                    genres: ['Action', 'Adventure', 'Indie', 'RPG'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/251710/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/251710/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/251710/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/251710/capsule_184x69.jpg',
                    description: 'A randomly generated action RPG shooter with heavy Rogue-like elements.',
                    price: '$14.99',
                    releaseDate: '2014-11-04',
                    recommendationScore: 76
                },
                {
                    id: '287980',
                    name: 'Cuphead',
                    genres: ['Action', 'Adventure', 'Indie'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/287980/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/287980/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/287980/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/287980/capsule_184x69.jpg',
                    description: 'Cuphead is a classic run and gun action game heavily focused on boss battles.',
                    price: '$19.99',
                    releaseDate: '2017-09-29',
                    recommendationScore: 79
                },
                {
                    id: '246020',
                    name: 'Risk of Rain 2',
                    genres: ['Action', 'Indie', 'Platformer'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/246020/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/246020/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/246020/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/246020/capsule_184x69.jpg',
                    description: 'Escape a chaotic alien planet by fighting through hordes of frenzied monsters.',
                    price: '$24.99',
                    releaseDate: '2019-03-28',
                    recommendationScore: 83
                },
                {
                    id: '466240',
                    name: 'Slay the Spire',
                    genres: ['Indie', 'Strategy', 'RPG'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/466240/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/466240/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/466240/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/466240/capsule_184x69.jpg',
                    description: 'We fused card games and roguelikes together to make the best single player deckbuilder.',
                    price: '$24.99',
                    releaseDate: '2019-01-23',
                    recommendationScore: 90
                },
                {
                    id: '646570',
                    name: 'Hades',
                    genres: ['Action', 'Adventure', 'Indie', 'RPG'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/646570/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/646570/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/646570/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/646570/capsule_184x69.jpg',
                    description: 'Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler.',
                    price: '$24.99',
                    releaseDate: '2020-09-17',
                    recommendationScore: 96
                },
                {
                    id: '504230',
                    name: 'Among Us',
                    genres: ['Indie', 'Multiplayer', 'Social Deduction'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/504230/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/504230/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/504230/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/504230/capsule_184x69.jpg',
                    description: 'Play with 4-15 players online or via local WiFi as you attempt to prepare your spaceship for departure.',
                    price: '$4.99',
                    releaseDate: '2018-11-15',
                    recommendationScore: 72
                },
                {
                    id: '990080',
                    name: 'Hollow Knight: Silksong',
                    genres: ['Action', 'Adventure', 'Indie'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/990080/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/990080/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/990080/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/990080/capsule_184x69.jpg',
                    description: 'The sequel to Hollow Knight. Discover a vast, haunted kingdom in this epic action-adventure.',
                    price: '$TBA',
                    releaseDate: 'TBA',
                    recommendationScore: 98
                }
            ],
            'sports': [
                {
                    id: '730',
                    name: 'Counter-Strike 2',
                    genres: ['Action', 'FPS', 'Multiplayer'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/730/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/730/capsule_184x69.jpg',
                    description: 'Counter-Strike 2 is a free-to-play multiplayer game.',
                    price: 'Free to Play',
                    releaseDate: '2023-09-27',
                    recommendationScore: 75
                },
                {
                    id: '210970',
                    name: 'Rocket League',
                    genres: ['Sports', 'Racing', 'Indie'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/210970/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/210970/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/210970/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/210970/capsule_184x69.jpg',
                    description: 'Rocket League is a high-powered hybrid of arcade-style soccer.',
                    price: 'Free to Play',
                    releaseDate: '2015-07-07',
                    recommendationScore: 89
                },
                {
                    id: '1238870',
                    name: 'FIFA 24',
                    genres: ['Sports', 'Simulation'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1238870/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1238870/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1238870/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1238870/capsule_184x69.jpg',
                    description: 'EA SPORTS FIFA 24 brings you The World\'s Game with the most authentic football experience.',
                    price: '$69.99',
                    releaseDate: '2023-09-29',
                    recommendationScore: 81
                },
                {
                    id: '1943800',
                    name: 'NBA 2K24',
                    genres: ['Sports', 'Simulation', 'Basketball'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1943800/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1943800/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1943800/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1943800/capsule_184x69.jpg',
                    description: 'NBA 2K24 offers the most authentic and realistic basketball experience.',
                    price: '$59.99',
                    releaseDate: '2023-09-08',
                    recommendationScore: 77
                },
                {
                    id: '216280',
                    name: 'Madden NFL 24',
                    genres: ['Sports', 'Simulation', 'Football'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/216280/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/216280/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/216280/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/216280/capsule_184x69.jpg',
                    description: 'Madden NFL 24 delivers the most authentic football experience.',
                    price: '$69.99',
                    releaseDate: '2023-08-18',
                    recommendationScore: 73
                },
                {
                    id: '1897330',
                    name: 'NHL 24',
                    genres: ['Sports', 'Simulation', 'Hockey'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1897330/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1897330/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1897330/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1897330/capsule_184x69.jpg',
                    description: 'NHL 24 delivers the most authentic hockey experience.',
                    price: '$59.99',
                    releaseDate: '2023-10-06',
                    recommendationScore: 74
                },
                {
                    id: '236850',
                    name: 'PGA TOUR 2K21',
                    genres: ['Sports', 'Golf', 'Simulation'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/236850/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/236850/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/236850/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/236850/capsule_184x69.jpg',
                    description: 'PGA TOUR 2K21 is the most realistic golf simulation game.',
                    price: '$39.99',
                    releaseDate: '2020-08-21',
                    recommendationScore: 71
                },
                {
                    id: '1388220',
                    name: 'UFC 4',
                    genres: ['Sports', 'Fighting', 'MMA'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1388220/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1388220/header.jpg',
                    capsuleImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1388220/capsule_616x353.jpg',
                    smallImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1388220/capsule_184x69.jpg',
                    description: 'UFC 4 is a mixed martial arts fighting game.',
                    price: '$59.99',
                    releaseDate: '2020-08-14',
                    recommendationScore: 76
                }
            ],
            'action': [
                {
                    id: '1091500',
                    name: 'Cyberpunk 2077',
                    genres: ['Action', 'RPG', 'Open World'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
                    description: 'An open-world, action-adventure story set in Night City',
                    price: '$29.99',
                    releaseDate: '2020-12-10'
                },
                {
                    id: '892970',
                    name: 'Valheim',
                    genres: ['Action', 'Adventure', 'Survival'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/892970/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/892970/header.jpg',
                    description: 'A brutal exploration and survival game for 1-10 players',
                    price: '$19.99',
                    releaseDate: '2021-02-02'
                }
            ],
            'adventure': [
                {
                    id: '892970',
                    name: 'Valheim',
                    genres: ['Action', 'Adventure', 'Survival'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/892970/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/892970/header.jpg',
                    description: 'A brutal exploration and survival game for 1-10 players',
                    price: '$19.99',
                    releaseDate: '2021-02-02'
                },
                {
                    id: '2358720',
                    name: 'ELDEN RING',
                    genres: ['Action', 'Adventure', 'RPG'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/2358720/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/2358720/header.jpg',
                    description: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.',
                    price: '$59.99',
                    releaseDate: '2022-02-25'
                }
            ],
            'rpg': [
                {
                    id: '1086940',
                    name: 'Baldur\'s Gate 3',
                    genres: ['RPG', 'Strategy', 'Adventure'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg',
                    description: 'Gather your party and venture forth!',
                    price: '$59.99',
                    releaseDate: '2020-10-06'
                },
                {
                    id: '292030',
                    name: 'The Witcher 3: Wild Hunt',
                    genres: ['RPG', 'Adventure'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg',
                    description: 'You are Geralt of Rivia, mercenary monster slayer.',
                    price: '$39.99',
                    releaseDate: '2015-05-19'
                }
            ],
            'strategy': [
                {
                    id: '1086940',
                    name: 'Baldur\'s Gate 3',
                    genres: ['RPG', 'Strategy', 'Adventure'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg',
                    description: 'Gather your party and venture forth!',
                    price: '$59.99',
                    releaseDate: '2020-10-06'
                },
                {
                    id: '252950',
                    name: 'Civilization VI',
                    genres: ['Strategy', 'Turn-based', '4X'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/252950/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/252950/header.jpg',
                    description: 'Originally created by legendary game designer Sid Meier.',
                    price: '$29.99',
                    releaseDate: '2016-10-21'
                }
            ],
            'simulation': [
                {
                    id: '292100',
                    name: 'Stardew Valley',
                    genres: ['Indie', 'Simulation', 'RPG'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/292100/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/292100/header.jpg',
                    description: 'You\'ve inherited your grandfather\'s old farm plot in Stardew Valley.',
                    price: '$14.99',
                    releaseDate: '2016-02-26'
                },
                {
                    id: '255710',
                    name: 'Cities: Skylines',
                    genres: ['Simulation', 'Strategy', 'Management'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/255710/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/255710/header.jpg',
                    description: 'Cities: Skylines is a modern take on the classic city simulation.',
                    price: '$29.99',
                    releaseDate: '2015-03-10'
                }
            ],
            'horror': [
                {
                    id: '252490',
                    name: 'Rust',
                    genres: ['Action', 'Adventure', 'Indie', 'Massively Multiplayer'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/252490/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/252490/header.jpg',
                    description: 'The only aim in Rust is to survive.',
                    price: '$39.99',
                    releaseDate: '2013-02-21'
                },
                {
                    id: '1174180',
                    name: 'Resident Evil Village',
                    genres: ['Horror', 'Action', 'Adventure'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/header.jpg',
                    description: 'Experience survival horror like never before.',
                    price: '$39.99',
                    releaseDate: '2021-05-07'
                }
            ]
        };
        const games = genreGames[genre.toLowerCase()] || [];
        const limitedGames = games.slice(0, parseInt(limit, 10));
        console.log(`✅ Retrieved ${limitedGames.length} games for genre: ${genre}`);
        res.json({
            success: true,
            data: limitedGames,
            genre,
            totalFound: games.length,
            limit: parseInt(limit, 10)
        });
    }
    catch (error) {
        console.error('Error fetching games by genre:', error);
        res.status(500).json({
            error: 'Failed to fetch games by genre',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
console.log('✅ Steam genre endpoint added directly to main router');
router.use('/integrations', integrations_1.default);
console.log('✅ Integration routes loaded');
router.use('/sessions', session_1.default);
console.log('✅ Session routes loaded');
router.use('/home', home_1.default);
console.log('✅ Home routes loaded');
router.use('/persona', persona_1.default);
console.log('✅ Persona routes loaded');
router.use('/recommendations', recommendations_1.default);
router.use('/analytics', analytics_1.default);
console.log('✅ Recommendation and Analytics routes loaded');
router.use('/launcher', launcher_1.default);
console.log('✅ Launcher routes loaded');
router.use('/feedback', feedback_1.default);
console.log('✅ Feedback routes loaded');
router.use('/health', health_1.default);
console.log('✅ Health routes loaded');
// router.use('/realtime', realTimeRoutes)
console.log('🚀 All API routes loaded successfully');
exports.default = router;
//# sourceMappingURL=router.js.map
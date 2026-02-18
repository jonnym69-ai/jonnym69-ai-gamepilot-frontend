"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSteamFieldsToUsers = addSteamFieldsToUsers;
exports.getUserBySteamId = getUserBySteamId;
exports.updateUserWithSteamData = updateUserWithSteamData;
const database_1 = require("../services/database");
/**
 * Migration to add Steam authentication fields to users table
 */
async function addSteamFieldsToUsers() {
    try {
        console.log('🔄 Adding Steam fields to users table...');
        // Get the database instance directly for raw SQL execution
        const db = database_1.databaseService.db;
        if (!db)
            throw new Error('Database not initialized');
        // Check if steamId column already exists
        const tableInfo = await db.all("PRAGMA table_info(users)");
        const hasSteamId = tableInfo.some((col) => col.name === 'steamId');
        const hasPersonaName = tableInfo.some((col) => col.name === 'personaName');
        const hasAvatar = tableInfo.some((col) => col.name === 'avatar');
        // Add steamId field (without UNIQUE constraint first)
        if (!hasSteamId) {
            await db.exec(`
        ALTER TABLE users ADD COLUMN steamId TEXT
      `);
            console.log('✅ Added steamId column');
        }
        // Add personaName field
        if (!hasPersonaName) {
            await db.exec(`
        ALTER TABLE users ADD COLUMN personaName TEXT
      `);
            console.log('✅ Added personaName column');
        }
        // Add avatar field
        if (!hasAvatar) {
            await db.exec(`
        ALTER TABLE users ADD COLUMN avatar TEXT
      `);
            console.log('✅ Added avatar column');
        }
        // Try to create unique index on steamId (more reliable than UNIQUE constraint)
        try {
            await db.exec(`
        CREATE UNIQUE INDEX idx_users_steamId ON users(steamId)
      `);
            console.log('✅ Created unique index on steamId');
        }
        catch (indexError) {
            // Index might already exist, ignore
            if (indexError instanceof Error && indexError.message.includes('already exists')) {
                console.log('ℹ️ Unique index on steamId already exists');
            }
            else {
                console.log('⚠️ Could not create unique index on steamId:', indexError);
            }
        }
        console.log('✅ Steam fields added to users table successfully');
    }
    catch (error) {
        // Ignore "duplicate column name" errors
        if (error instanceof Error && error.message.includes('duplicate column name')) {
            console.log('ℹ️ Steam fields already exist in users table');
            return;
        }
        console.error('❌ Failed to add Steam fields to users table:', error);
        throw error;
    }
}
/**
 * Get user by Steam ID
 */
async function getUserBySteamId(steamId) {
    try {
        const db = database_1.databaseService.db;
        if (!db)
            throw new Error('Database not initialized');
        const row = await db.get('SELECT * FROM users WHERE steamId = ?', [steamId]);
        if (!row)
            return null;
        return mapRowToUser(row);
    }
    catch (error) {
        console.error('❌ Failed to get user by Steam ID:', error);
        return null;
    }
}
/**
 * Update user with Steam profile data
 */
async function updateUserWithSteamData(userId, steamData) {
    try {
        const db = database_1.databaseService.db;
        if (!db)
            throw new Error('Database not initialized');
        await db.run(`
      UPDATE users SET 
        steamId = ?, 
        personaName = ?, 
        avatar = ?, 
        lastActive = datetime('now')
      WHERE id = ?
    `, [
            steamData.steamId,
            steamData.personaName,
            steamData.avatar,
            userId
        ]);
        console.log('✅ User updated with Steam data:', userId);
    }
    catch (error) {
        console.error('❌ Failed to update user with Steam data:', error);
        throw error;
    }
}
/**
 * Helper function to map database row to User (copied from DatabaseService)
 */
function mapRowToUser(row) {
    return {
        id: row.id,
        username: row.username,
        email: row.email,
        displayName: row.displayName,
        avatar: row.avatar,
        bio: row.bio,
        location: row.location,
        timezone: row.timezone,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        lastActive: row.lastActive ? new Date(row.lastActive) : undefined,
        gamingProfile: JSON.parse(row.gamingProfile || '{}'),
        integrations: JSON.parse(row.integrations || '[]'),
        privacy: JSON.parse(row.privacy || '{}'),
        preferences: JSON.parse(row.preferences || '{}'),
        social: JSON.parse(row.social || '{}')
    };
}
//# sourceMappingURL=addSteamFields.js.map
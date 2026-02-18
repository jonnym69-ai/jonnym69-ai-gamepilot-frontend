import { DatabaseService } from '../src/services/database'
import { hashPassword, comparePassword } from '../src/auth/authService'

async function debugPassword() {
  const databaseService = new DatabaseService()
  await databaseService.initialize()
  
  const username = 'testuser456'
  const password = 'test123'
  
  console.log('🔍 Debugging password for user:', username)
  
  // Get user from database
  const user = await databaseService.db.get('SELECT * FROM users WHERE username = ?', [username])
  if (!user) {
    console.log('❌ User not found')
    return
  }
  
  console.log('✅ User found:', user.username, 'ID:', user.id)
  
  // Get stored password hash
  const storedHash = await databaseService.getPassword(user.id)
  console.log('🔑 Stored hash:', storedHash)
  
  // Test password comparison
  const isValid = await comparePassword(password, storedHash)
  console.log('🔐 Password comparison result:', isValid)
  
  // Test with fresh hash
  const freshHash = await hashPassword(password)
  console.log('🔑 Fresh hash:', freshHash)
  const freshValid = await comparePassword(password, freshHash)
  console.log('🔐 Fresh hash comparison:', freshValid)
}

debugPassword().catch(console.error)

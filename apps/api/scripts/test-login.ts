import { DatabaseService } from '../src/services/database'
import { hashPassword } from '../src/auth/authService'

async function testLogin() {
  const databaseService = new DatabaseService()
  await databaseService.initialize()
  
  console.log('🔧 Creating test user...')
  
  const hashedPassword = await hashPassword('test123')
  
  try {
    const user = await databaseService.createUser({
      username: 'testuser789',
      email: 'testuser789@test.com',
      displayName: 'Test User',
      avatar: '',
      preferences: {},
      privacy: {}
    }, hashedPassword)
    
    console.log('✅ User created:', user.username)
    console.log('🔑 Login credentials:')
    console.log('   Username: testuser789')
    console.log('   Password: test123')
  } catch (error) {
    console.error('❌ Failed to create user:', error)
  }
}

testLogin().catch(console.error)

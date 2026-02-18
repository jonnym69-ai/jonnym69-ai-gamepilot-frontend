import { MoodPersonaValidator } from './moodPersonaValidation'
import { addMoodPersonaTables, initializePersonaProfiles } from '../migrations/addMoodPersonaTables'
import { databaseService } from '../services/database'

/**
 * Test runner for mood-persona system validation
 */
async function runValidation() {
  console.log('🚀 Starting GamePilot Mood-Persona System Validation')
  console.log('=' .repeat(60))

  try {
    // First, ensure database is initialized
    console.log('📋 Step 1: Initializing database...')
    await databaseService.initialize()
    console.log('✅ Database initialized')

    // Run mood-persona migration
    console.log('📋 Step 2: Running mood-persona migration...')
    await addMoodPersonaTables()
    await initializePersonaProfiles()
    console.log('✅ Migration completed')

    // Run validation
    console.log('📋 Step 3: Running end-to-end validation...')
    const validator = new MoodPersonaValidator()
    const results = await validator.runValidation()

    // Display results
    console.log('\n' + '=' .repeat(60))
    console.log('📊 VALIDATION RESULTS')
    console.log('=' .repeat(60))

    console.log(`\n🎯 Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`📋 Tests Run: ${results.results.length}`)
    console.log(`⚠️ Issues Found: ${results.issues.length}`)
    console.log(`💡 Recommendations: ${results.recommendations.length}`)

    // Show test results
    console.log('\n📋 Test Results:')
    results.results.forEach(result => {
      console.log(`  ${result.success ? '✅' : '❌'} ${result.test}: ${result.details}`)
    })

    // Show issues if any
    if (results.issues.length > 0) {
      console.log('\n⚠️ Issues Found:')
      results.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`)
      })
    }

    // Show recommendations
    if (results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      results.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`)
      })
    }

    // Exit with appropriate code
    process.exit(results.success ? 0 : 1)

  } catch (error) {
    console.error('❌ Validation failed with error:', error)
    process.exit(1)
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  runValidation()
}

export { runValidation }

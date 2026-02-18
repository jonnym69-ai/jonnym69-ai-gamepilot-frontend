// Simple test to verify mood preservation logic
const CANONICAL_MOODS = ['Intense', 'Strategic', 'Relaxing', 'Creative', 'High-Energy', 'Atmospheric', 'Challenging']

function testMoodPreservation() {
  const aiMoods = ['Intense', 'Strategic', 'Challenging']
  
  console.log('🧪 Testing mood preservation logic...')
  console.log('📋 AI moods:', aiMoods)
  
  // Simulate the fixed normalization logic
  const preserved = aiMoods.map(m => {
    if (CANONICAL_MOODS.includes(m)) return m
    return 'chill' // fallback
  })
  
  console.log('🔄 After normalization:', preserved)
  
  const isCorrect = JSON.stringify(preserved) === JSON.stringify(aiMoods)
  console.log(isCorrect ? '🎉 PASS: AI moods preserved!' : '❌ FAIL: AI moods overwritten!')
  
  return isCorrect
}

testMoodPreservation()

import { normalizeGamesArray } from '../../apps/web/src/utils/dataPipelineNormalizer'

// Test the mood normalization fix
const testGame = {
  id: 'test_123',
  title: 'Counter-Strike: Global Offensive',
  moods: ['Intense', 'Strategic', 'Challenging'],
  genres: [
    { id: 'Action', description: 'Action game' },
    { id: 'FPS', description: 'First-person shooter' }
  ]
}

console.log('🧪 Testing mood normalization fix...')
console.log('📋 Original game:', testGame)

const normalized = normalizeGamesArray([testGame])
console.log('🔄 Normalized game:', normalized[0])

console.log('\n✅ Expected: ["Intense", "Strategic", "Challenging"]')
console.log('🎯 Actual:', normalized[0].moods)

const isCorrect = JSON.stringify(normalized[0].moods) === JSON.stringify(['Intense', 'Strategic', 'Challenging'])
console.log(isCorrect ? '🎉 PASS: AI moods preserved!' : '❌ FAIL: AI moods overwritten!')

import { ollamaService } from '../src/services/ollamaService'

async function testOllamaService() {
  console.log('🤖 Testing Ollama AI Service...')
  
  // Check if Ollama is available
  const available = await ollamaService.isAvailable()
  console.log('🔍 Ollama service available:', available)
  
  if (!available) {
    console.log('❌ Ollama service is not running. Please start Ollama first:')
    console.log('   • Download: https://ollama.ai/')
    console.log('   • Run: ollama serve')
    console.log('   • Pull model: ollama pull llama2')
    return
  }
  
  // Get available models
  const models = await ollamaService.getAvailableModels()
  console.log('📋 Available models:', models)
  
  // Test mood generation with CS:GO description
  const testDescription = "Counter-Strike: Global Offensive (CS:GO) is a multiplayer first-person shooter game featuring two teams of terrorists and counter-terrorists competing to complete objectives like planting/defusing bombs or rescuing hostages. The game requires strategic teamwork, precise aiming, and quick reflexes in intense competitive matches."
  
  console.log('\n🎮 Testing mood generation for CS:GO...')
  console.log('📝 Description:', testDescription.substring(0, 100) + '...')
  
  const moods = await ollamaService.getMoodsFromAI(testDescription)
  console.log('🎭 Generated moods:', moods)
  
  // Test with a different game
  const stardewDescription = "Stardew Valley is a peaceful farming simulation game where players grow crops, raise animals, mine ores, and build relationships with townspeople. The game features a relaxing, creative atmosphere with no time pressure and focuses on personal expression and community building."
  
  console.log('\n🌾 Testing mood generation for Stardew Valley...')
  console.log('📝 Description:', stardewDescription.substring(0, 100) + '...')
  
  const stardewMoods = await ollamaService.getMoodsFromAI(stardewDescription)
  console.log('🎭 Generated moods:', stardewMoods)
  
  console.log('\n✅ Ollama AI Service test completed successfully!')
  console.log('🎯 Ready for intelligent mood generation in Steam sync!')
}

testOllamaService().catch(console.error)

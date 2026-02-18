import { personaEngineService } from '../services/personaEngineService'
import { useLibraryStore } from '../stores/useLibraryStore'

export class PersonaEngineTester {
  private results: any = {}

  async runFullTest(): Promise<void> {
    console.log('🧪 Starting Persona Engine Comprehensive Test')
    console.log('=' .repeat(60))

    try {
      // Test 1: Basic Persona Metrics
      await this.testPersonaMetrics()
      
      // Test 2: Game Library Analysis
      await this.testGameLibraryAnalysis()
      
      // Test 3: Mood Detection
      await this.testMoodDetection()
      
      // Test 4: Playstyle Analysis
      await this.testPlaystyleAnalysis()
      
      // Test 5: Recommendation Engine
      await this.testRecommendationEngine()
      
      // Test 6: Behavioral Patterns
      await this.testBehavioralPatterns()
      
      // Test 7: Performance Analysis
      await this.testPerformance()
      
      // Generate final report
      this.generateReport()
      
    } catch (error) {
      console.error('❌ Test failed:', error)
    }
  }

  private async testPersonaMetrics(): Promise<void> {
    console.log('\n📊 Test 1: Persona Metrics')
    console.log('-'.repeat(30))

    try {
      const startTime = Date.now()
      const metrics = await personaEngineService.getPersonaMetrics()
      const endTime = Date.now()

      this.results.metrics = {
        success: true,
        data: metrics,
        responseTime: endTime - startTime
      }

      console.log('✅ Persona Metrics Retrieved:')
      console.log(`   Total Playtime: ${metrics.totalPlaytime} hours`)
      console.log(`   Session Count: ${metrics.sessionCount}`)
      console.log(`   Avg Session Length: ${metrics.averageSessionLength} minutes`)
      console.log(`   Favorite Genres: ${metrics.favoriteGenres.map(g => `${g.genre} (${g.playtime}h)`).join(', ')}`)
      console.log(`   Playstyle Indicators:`, metrics.playstyleIndicators)
      console.log(`   Response Time: ${endTime - startTime}ms`)

    } catch (error) {
      this.results.metrics = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log('❌ Failed to get persona metrics:', error)
    }
  }

  private async testGameLibraryAnalysis(): Promise<void> {
    console.log('\n🎮 Test 2: Game Library Analysis')
    console.log('-'.repeat(30))

    try {
      const { games } = useLibraryStore.getState()
      
      if (!games || games.length === 0) {
        this.results.libraryAnalysis = {
          success: false,
          error: 'No games in library'
        }
        console.log('❌ No games found in library')
        return
      }

      // Analyze game distribution
      const genreDistribution: Record<string, number> = {}
      const playtimeDistribution: Record<string, number> = {}
      const statusDistribution: Record<string, number> = {}

      games.forEach(game => {
        // Genre analysis
        game.genres?.forEach(genre => {
          const genreName = typeof genre === 'string' ? genre : genre.name
          genreDistribution[genreName] = (genreDistribution[genreName] || 0) + 1
        })

        // Playtime analysis
        const playtime = game.hoursPlayed || 0
        if (playtime < 5) playtimeDistribution['< 5h'] = (playtimeDistribution['< 5h'] || 0) + 1
        else if (playtime < 20) playtimeDistribution['5-20h'] = (playtimeDistribution['5-20h'] || 0) + 1
        else if (playtime < 50) playtimeDistribution['20-50h'] = (playtimeDistribution['20-50h'] || 0) + 1
        else playtimeDistribution['> 50h'] = (playtimeDistribution['> 50h'] || 0) + 1

        // Status analysis
        statusDistribution[game.playStatus] = (statusDistribution[game.playStatus] || 0) + 1
      })

      this.results.libraryAnalysis = {
        success: true,
        totalGames: games.length,
        genreDistribution,
        playtimeDistribution,
        statusDistribution,
        totalPlaytime: games.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0)
      }

      console.log('✅ Library Analysis Complete:')
      console.log(`   Total Games: ${games.length}`)
      console.log(`   Total Playtime: ${this.results.libraryAnalysis.totalPlaytime} hours`)
      console.log(`   Top Genres: ${Object.entries(genreDistribution).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g, c]) => `${g} (${c})`).join(', ')}`)
      console.log(`   Playtime Distribution:`, playtimeDistribution)
      console.log(`   Status Distribution:`, statusDistribution)

    } catch (error) {
      this.results.libraryAnalysis = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log('❌ Library analysis failed:', error)
    }
  }

  private async testMoodDetection(): Promise<void> {
    console.log('\n😊 Test 3: Mood Detection')
    console.log('-'.repeat(30))

    try {
      const startTime = Date.now()
      
      // Test mood suggestions for different moods
      const testMoods = ['energetic', 'focused', 'relaxed', 'competitive', 'social']
      const moodResults: Record<string, any> = {}

      for (const mood of testMoods) {
        const suggestions = await personaEngineService.getMoodBasedSuggestions(mood, 3)
        moodResults[mood] = {
          count: suggestions.length,
          games: suggestions.map(g => g.title).slice(0, 2)
        }
      }

      const endTime = Date.now()

      this.results.moodDetection = {
        success: true,
        moodResults,
        responseTime: endTime - startTime
      }

      console.log('✅ Mood Detection Results:')
      Object.entries(moodResults).forEach(([mood, result]: [string, any]) => {
        console.log(`   ${mood}: ${result.count} suggestions (${result.games.join(', ')})`)
      })
      console.log(`   Response Time: ${endTime - startTime}ms`)

    } catch (error) {
      this.results.moodDetection = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log('❌ Mood detection failed:', error)
    }
  }

  private async testPlaystyleAnalysis(): Promise<void> {
    console.log('\n🎯 Test 4: Playstyle Analysis')
    console.log('-'.repeat(30))

    try {
      const startTime = Date.now()
      const analysis = await personaEngineService.getPlayPatternAnalysis()
      const endTime = Date.now()

      this.results.playstyleAnalysis = {
        success: true,
        data: analysis,
        responseTime: endTime - startTime
      }

      console.log('✅ Playstyle Analysis Results:')
      console.log(`   Patterns: ${analysis.patterns.length} found`)
      console.log(`   Recommendations: ${analysis.recommendations.length} provided`)
      console.log(`   Insights: ${analysis.insights.length} generated`)
      
      analysis.patterns.slice(0, 3).forEach((pattern: string, i: number) => {
        console.log(`   Pattern ${i + 1}: ${pattern}`)
      })

      analysis.insights.slice(0, 2).forEach((insight: any, i: number) => {
        console.log(`   Insight ${i + 1} (${insight.priority}): ${insight.message}`)
      })

      console.log(`   Response Time: ${endTime - startTime}ms`)

    } catch (error) {
      this.results.playstyleAnalysis = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log('❌ Playstyle analysis failed:', error)
    }
  }

  private async testRecommendationEngine(): Promise<void> {
    console.log('\n🤖 Test 5: Recommendation Engine')
    console.log('-'.repeat(30))

    try {
      const startTime = Date.now()
      const recommendations = await personaEngineService.getPersonaRecommendations(5)
      const endTime = Date.now()

      this.results.recommendations = {
        success: true,
        count: recommendations.length,
        games: recommendations.map(g => g.title),
        responseTime: endTime - startTime
      }

      console.log('✅ Recommendation Results:')
      console.log(`   Recommendations: ${recommendations.length} games`)
      console.log(`   Games: ${recommendations.map(g => g.title).slice(0, 3).join(', ')}`)
      console.log(`   Response Time: ${endTime - startTime}ms`)

    } catch (error) {
      this.results.recommendations = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log('❌ Recommendation engine failed:', error)
    }
  }

  private async testBehavioralPatterns(): Promise<void> {
    console.log('\n📈 Test 6: Behavioral Patterns')
    console.log('-'.repeat(30))

    try {
      const { games } = useLibraryStore.getState()
      
      // Analyze behavioral patterns from game data
      const patterns = {
        completionRate: 0,
        averageSessionLength: 0,
        genreLoyalty: 0,
        varietyScore: 0,
        achievementFocus: 0
      }

      if (games && games.length > 0) {
        // Completion rate
        const completedGames = games.filter(g => g.playStatus === 'completed').length
        patterns.completionRate = (completedGames / games.length) * 100

        // Average session length (estimated from playtime)
        const totalPlaytime = games.reduce((sum, g) => sum + (g.hoursPlayed || 0), 0)
        patterns.averageSessionLength = totalPlaytime / games.length

        // Genre loyalty (how concentrated in few genres)
        const genreCounts: Record<string, number> = {}
        games.forEach(game => {
          game.genres?.forEach(genre => {
            const genreName = typeof genre === 'string' ? genre : genre.name
            genreCounts[genreName] = (genreCounts[genreName] || 0) + 1
          })
        })
        const topGenreCount = Math.max(...Object.values(genreCounts))
        patterns.genreLoyalty = (topGenreCount / games.length) * 100

        // Variety score (inverse of genre loyalty)
        patterns.varietyScore = 100 - patterns.genreLoyalty

        // Achievement focus
        const gamesWithAchievements = games.filter(g => g.achievements && g.achievements.total > 0).length
        if (gamesWithAchievements > 0) {
          const totalAchievements = games.reduce((sum, g) => {
            if (g.achievements) return sum + (g.achievements.unlocked || 0)
            return sum
          }, 0)
          const totalPossible = games.reduce((sum, g) => {
            if (g.achievements) return sum + (g.achievements.total || 0)
            return sum
          }, 0)
          patterns.achievementFocus = totalPossible > 0 ? (totalAchievements / totalPossible) * 100 : 0
        }
      }

      this.results.behavioralPatterns = {
        success: true,
        patterns
      }

      console.log('✅ Behavioral Patterns Analysis:')
      console.log(`   Completion Rate: ${patterns.completionRate.toFixed(1)}%`)
      console.log(`   Avg Session Length: ${patterns.averageSessionLength.toFixed(1)} hours`)
      console.log(`   Genre Loyalty: ${patterns.genreLoyalty.toFixed(1)}%`)
      console.log(`   Variety Score: ${patterns.varietyScore.toFixed(1)}%`)
      console.log(`   Achievement Focus: ${patterns.achievementFocus.toFixed(1)}%`)

    } catch (error) {
      this.results.behavioralPatterns = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log('❌ Behavioral patterns analysis failed:', error)
    }
  }

  private async testPerformance(): Promise<void> {
    console.log('\n⚡ Test 7: Performance Analysis')
    console.log('-'.repeat(30))

    try {
      const { games } = useLibraryStore.getState()
      const performanceMetrics = {
        librarySize: games?.length || 0,
        memoryUsage: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)
        } : null,
        loadTime: 0
      }

      // Test load time for persona operations
      const loadStart = Date.now()
      await personaEngineService.getPersonaMetrics()
      performanceMetrics.loadTime = Date.now() - loadStart

      this.results.performance = {
        success: true,
        metrics: performanceMetrics
      }

      console.log('✅ Performance Metrics:')
      console.log(`   Library Size: ${performanceMetrics.librarySize} games`)
      if (performanceMetrics.memoryUsage) {
        console.log(`   Memory Usage: ${performanceMetrics.memoryUsage.used}MB / ${performanceMetrics.memoryUsage.total}MB`)
      }
      console.log(`   Persona Load Time: ${performanceMetrics.loadTime}ms`)

    } catch (error) {
      this.results.performance = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log('❌ Performance analysis failed:', error)
    }
  }

  private generateReport(): void {
    console.log('\n📋 PERSONA ENGINE ANALYSIS REPORT')
    console.log('=' .repeat(60))

    // Success rate
    const tests = Object.keys(this.results)
    const successfulTests = tests.filter(test => this.results[test].success).length
    const successRate = (successfulTests / tests.length) * 100

    console.log(`\n🎯 Overall Success Rate: ${successRate.toFixed(1)}% (${successfulTests}/${tests.length} tests passed)`)

    // Strengths
    console.log('\n✅ STRENGTHS:')
    if (this.results.metrics?.success) {
      console.log('   • Persona metrics system is functional')
    }
    if (this.results.libraryAnalysis?.success) {
      console.log('   • Game library analysis working correctly')
    }
    if (this.results.moodDetection?.success) {
      console.log('   • Mood detection and suggestions operational')
    }

    // Weaknesses
    console.log('\n⚠️  WEAKNESSES:')
    if (!this.results.recommendations?.success) {
      console.log('   • Recommendation engine needs improvement')
    }
    if (!this.results.playstyleAnalysis?.success) {
      console.log('   • Playstyle analysis has issues')
    }
    if (this.results.behavioralPatterns?.patterns?.completionRate < 30) {
      console.log('   • Low game completion rate detected')
    }

    // Recommendations
    console.log('\n🚀 RECOMMENDATIONS FOR RELEASE:')
    
    if (this.results.libraryAnalysis?.success && this.results.libraryAnalysis.totalGames > 0) {
      console.log('   ✅ Ready for real data testing')
    } else {
      console.log('   ⚠️  Need more game data for accurate analysis')
    }

    if (this.results.performance?.success && this.results.performance.metrics.loadTime < 1000) {
      console.log('   ✅ Performance is acceptable for release')
    } else {
      console.log('   ⚠️  Performance optimization needed')
    }

    if (successRate >= 80) {
      console.log('   ✅ Persona engine is ready for release!')
    } else {
      console.log('   ⚠️  Address failing tests before release')
    }

    console.log('\n' + '=' .repeat(60))
    console.log('🏁 Test Complete!')
  }
}

// Export for easy usage
export const personaTester = new PersonaEngineTester()

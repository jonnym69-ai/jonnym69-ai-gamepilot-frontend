import { useState } from 'react'
import { personaTester } from '../utils/personaTest'

export function PersonaTestButton() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<string>('')

  const runTest = async () => {
    setIsRunning(true)
    setResults('Running comprehensive persona engine test...\n\n')
    
    try {
      // Capture console output
      const originalLog = console.log
      const logs: string[] = []
      
      console.log = (...args: any[]) => {
        logs.push(args.join(' '))
        originalLog(...args)
        setResults(logs.join('\n'))
      }

      await personaTester.runFullTest()
      
      // Restore console.log
      console.log = originalLog
      
      setResults(prev => prev + '\n\n✅ Test completed! Check console for full report.')
      
    } catch (error) {
      setResults(prev => prev + `\n\n❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={runTest}
        disabled={isRunning}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
      >
        {isRunning ? '🧪 Testing...' : '🧪 Test Persona Engine'}
      </button>
      
      {results && (
        <div className="absolute bottom-full right-0 mb-2 w-96 max-h-96 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl">
          <pre className="text-xs text-green-400 whitespace-pre-wrap">{results}</pre>
        </div>
      )}
    </div>
  )
}

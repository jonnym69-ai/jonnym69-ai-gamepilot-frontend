import { personaTester } from './personaTest'

// Add to global window for console access
declare global {
  interface Window {
    testPersona: () => Promise<void>
    personaResults: any
  }
}

// Initialize console commands
export function initializePersonaTestConsole() {
  window.testPersona = async () => {
    console.log('🧪 Starting Persona Engine Test from Console...')
    await personaTester.runFullTest()
  }
  
  console.log(`
🧪 Persona Engine Test Commands Available:
   - testPersona() - Run comprehensive persona engine test
   - personaResults - View last test results (after running test)
   
Example: testPersona()
  `)
}

export { personaTester }

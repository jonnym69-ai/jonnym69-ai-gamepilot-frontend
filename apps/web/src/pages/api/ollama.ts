import ollamaService from '../../services/ollamaService';

// Simple API service for Ollama integration
// This can be used by components that need AI responses

export class OllamaAPI {
  static async generateResponse(prompt: string): Promise<any> {
    try {
      // Use the analyzeCurrentPlay method as a fallback
      const result = await ollamaService.analyzeCurrentPlay(prompt, []);
      return result;
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error('Failed to generate response');
    }
  }

  static async getStatus(): Promise<any> {
    return {
      status: 'Ollama API is running',
      endpoints: {
        'generateResponse': 'Generate responses using Ollama AI'
      }
    };
  }
}

// Export a simple handler for potential future API integration
export async function handleOllamaRequest(request: Request) {
  const url = new URL(request.url);
  const method = request.method;

  if (method === 'POST') {
    try {
      const { prompt } = await request.json();
      
      if (!prompt) {
        return new Response(JSON.stringify({ error: 'Prompt is required' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const result = await OllamaAPI.generateResponse(prompt);
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Ollama API error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (method === 'GET') {
    const status = await OllamaAPI.getStatus();
    return new Response(JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}

export default OllamaAPI;

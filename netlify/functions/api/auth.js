export default function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Mock auth endpoint for development
  if (req.url === '/api/auth/me') {
    if (req.method === 'GET') {
      res.json({
        id: 'mock-user-123',
        email: 'jonny.m69@hotmail.com',
        username: 'jonnym69',
        createdAt: new Date().toISOString(),
        preferences: {
          theme: 'dark',
          notifications: true
        }
      })
    } else if (req.method === 'POST') {
      res.json({ success: true })
    }
  } else {
    res.status(404).json({ error: 'Not found' })
  }
}

export const config = {
  runtime: 'nodejs18.x'
}

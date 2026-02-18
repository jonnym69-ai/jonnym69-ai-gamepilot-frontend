import { Request, Response } from 'express'

export function healthCheck(req: Request, res: Response) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'gamepilot-api',
    version: '1.0.0'
  })
}

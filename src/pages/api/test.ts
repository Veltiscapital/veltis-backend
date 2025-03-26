import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Simple test endpoint to check if the backend is working
 * 
 * @param req NextApiRequest
 * @param res NextApiResponse
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Return a success response
  res.status(200).json({
    status: 'success',
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
} 
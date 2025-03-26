import { NextApiRequest, NextApiResponse } from 'next';
import { isValidWalletAddress } from '../../../lib/utils/api';
import { sendSuccess, sendError } from '../../../lib/utils/api';
import { createNonce } from '../../../lib/db/supabase';
import { getMemoryNonce, storeMemoryNonce } from '../../../lib/memory-store';

/**
 * Generate a nonce for wallet signature
 * 
 * @param req NextApiRequest
 * @param res NextApiResponse
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    console.log('Nonce request body:', req.body);
    
    // Get the wallet address from the request body
    const { walletAddress } = req.body;
    
    console.log('Wallet address from request:', walletAddress);

    // Validate the wallet address
    if (!walletAddress || !isValidWalletAddress(walletAddress)) {
      console.log('Invalid wallet address:', walletAddress);
      return sendError(res, 'Invalid wallet address', 400);
    }

    try {
      // Generate and store a nonce
      const nonce = await createNonce(walletAddress);
      console.log('Generated nonce:', nonce);

      // Return the nonce
      return sendSuccess(res, { nonce });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // If there's a database error, use/generate an in-memory nonce
      let nonce = getMemoryNonce(walletAddress);
      
      // If we don't have one or it's expired, create a new one
      if (!nonce) {
        const tempNonce = Math.floor(Math.random() * 1000000).toString();
        storeMemoryNonce(walletAddress, tempNonce, 15); // 15 minutes expiry
        nonce = tempNonce;
        console.log('Generated in-memory nonce:', tempNonce);
      } else {
        console.log('Using existing in-memory nonce');
      }
      
      // Return the in-memory nonce
      return sendSuccess(res, { nonce });
    }
  } catch (error) {
    console.error('Nonce generation error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

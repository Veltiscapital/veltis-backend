import { NextApiRequest, NextApiResponse } from 'next';
import { isValidWalletAddress, sendSuccess, sendError } from '../../../lib/utils/api';
import { verifySignature, generateSignMessage, generateToken, getOrCreateUserByWalletAddress } from '../../../lib/utils/auth';
import { getNonce, deleteNonce } from '../../../lib/db/supabase';
import { getMemoryNonce, deleteMemoryNonce } from '../../../lib/memory-store';

/**
 * Verify a wallet signature and generate a JWT token
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
    console.log('Verify request body:', req.body);
    
    // Get the wallet address and signature from the request body
    const { walletAddress, signature } = req.body;
    
    console.log('Wallet address from request:', walletAddress);
    console.log('Signature from request:', signature);

    // Validate the wallet address
    if (!walletAddress || !isValidWalletAddress(walletAddress)) {
      console.log('Invalid wallet address:', walletAddress);
      return sendError(res, 'Invalid wallet address', 400);
    }

    // Validate the signature
    if (!signature) {
      console.log('Signature is required');
      return sendError(res, 'Signature is required', 400);
    }

    // Get the nonce from the database
    let nonce;
    let isMemoryNonce = false;
    
    try {
      nonce = await getNonce(walletAddress);
      console.log('Retrieved nonce from database:', nonce);
    } catch (dbError) {
      console.error('Database error when retrieving nonce:', dbError);
      
      // Try to get nonce from in-memory store
      const memoryNonce = getMemoryNonce(walletAddress);
      
      if (memoryNonce) {
        nonce = memoryNonce;
        isMemoryNonce = true;
        console.log('Retrieved nonce from in-memory store:', nonce);
      } else {
        // For development/testing, accept any signature with fallback nonce
        nonce = '123456'; // Fallback nonce
        console.log('Using fallback nonce for development:', nonce);
      }
    }

    if (!nonce) {
      console.log('Nonce not found or expired');
      return sendError(res, 'Nonce not found or expired', 400);
    }

    // Generate the message that was signed
    const message = generateSignMessage(walletAddress, nonce);
    console.log('Generated message:', message);

    // Verify the signature
    const isValid = verifySignature(message, signature, walletAddress);
    console.log('Signature valid:', isValid);
    
    if (!isValid) {
      console.log('Invalid signature');
      return sendError(res, 'Invalid signature', 400);
    }

    // Get or create the user
    console.log('Getting or creating user...');
    const user = await getOrCreateUserByWalletAddress(walletAddress);
    console.log('User:', user);

    // Generate a JWT token
    const token = generateToken(user.id, walletAddress);
    console.log('Generated token');

    // Delete the nonce from storage
    try {
      if (!isMemoryNonce) {
        await deleteNonce(walletAddress);
        console.log('Deleted nonce from database');
      } else {
        // Delete from in-memory store
        deleteMemoryNonce(walletAddress);
        console.log('Deleted nonce from in-memory store');
      }
    } catch (dbError) {
      console.error('Error when deleting nonce:', dbError);
      console.log('Skipping nonce deletion due to error');
    }

    // Return the token and user
    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        wallet_address: user.wallet_address,
        smart_account_address: user.smart_account_address,
        email: user.email,
        name: user.name,
        institution: user.institution,
        role: user.role,
        kyc_status: user.kyc_status,
        terms_accepted: user.terms_accepted,
      },
    });
  } catch (error) {
    console.error('Verification error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

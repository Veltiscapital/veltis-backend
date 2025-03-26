import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError } from '../../../lib/utils/api';

/**
 * Logout the authenticated user
 * 
 * @param req NextApiRequest
 * @param res NextApiResponse
 * @param userId The authenticated user's ID
 */
async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    // In a stateless JWT-based authentication system, there's no server-side session to invalidate.
    // The client should simply discard the token.
    // However, we can add the token to a blacklist if needed in the future.

    // Return success
    return sendSuccess(res, {
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);

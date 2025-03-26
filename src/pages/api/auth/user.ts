import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError } from '../../../lib/utils/api';
import { getUserById } from '../../../lib/db/supabase';

/**
 * Get the authenticated user's data
 * 
 * @param req NextApiRequest
 * @param res NextApiResponse
 * @param userId The authenticated user's ID
 */
async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    // Get the user from the database
    const user = await getUserById(userId);

    // Return the user
    return sendSuccess(res, {
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
    console.error('User fetch error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError } from '../../../lib/utils/api';
import { getConsultingServices } from '../../../lib/db/supabase';

/**
 * Get consulting services
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
    // Get consulting services
    const services = await getConsultingServices();

    // Return the services
    return sendSuccess(res, {
      services,
    });
  } catch (error) {
    console.error('Consulting services error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);

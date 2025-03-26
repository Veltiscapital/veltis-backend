import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError } from '../../../lib/utils/api';
import { getUserById } from '../../../lib/db/supabase';
import { getIPFSGatewayURL } from '../../../lib/storage/nft-storage';

/**
 * Get the KYC status of the authenticated user
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

    // Check if the user has submitted KYC documents
    if (user.kyc_status === 'not_submitted') {
      return sendSuccess(res, {
        status: 'not_submitted',
        message: 'KYC documents have not been submitted',
      });
    }

    // Format the document references
    let documents = [];
    if (user.kyc_document_references) {
      documents = user.kyc_document_references.documents.map((doc: any) => ({
        name: doc.name,
        type: doc.type,
        url: doc.url,
      }));
    }

    // Return the KYC status
    return sendSuccess(res, {
      status: user.kyc_status,
      submission_date: user.kyc_submission_date,
      documents,
    });
  } catch (error) {
    console.error('KYC status error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError } from '../../../lib/utils/api';
import { supabaseAdmin, acceptMarketplaceOffer } from '../../../lib/db/supabase';
import { waitForTransaction } from '../../../lib/blockchain/alchemy';

/**
 * Accept a marketplace offer
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
    // Get the offer ID from the request body
    const { offerId, transactionHash } = req.body;

    // Validate required fields
    if (!offerId) {
      return sendError(res, 'Offer ID is required', 400);
    }

    // Check if the offer exists and is pending
    const { data: offer, error: offerError } = await supabaseAdmin
      .from('offers')
      .select(`
        *,
        listing:listings(*)
      `)
      .eq('id', offerId)
      .single();

    if (offerError) {
      console.error('Error fetching offer:', offerError);
      return sendError(res, 'Failed to fetch offer', 500);
    }

    if (!offer) {
      return sendError(res, 'Offer not found', 404);
    }

    if (offer.status !== 'pending') {
      return sendError(res, 'Offer is not pending', 400);
    }

    // Check if the user is the seller
    if (offer.listing.seller_id !== userId) {
      return sendError(res, 'You are not authorized to accept this offer', 403);
    }

    // If a transaction hash is provided, wait for the transaction to be mined
    if (transactionHash) {
      try {
        // Wait for the transaction to be mined
        const receipt = await waitForTransaction(transactionHash);

        // Check if the transaction was successful
        if (!receipt || receipt.status === 0) {
          return sendError(res, 'Transaction failed', 400);
        }

        // Update the transaction hash in the database
        await supabaseAdmin
          .from('transactions')
          .update({
            transaction_hash: transactionHash,
            block_number: receipt.blockNumber,
          })
          .eq('ipnft_id', offer.listing.ipnft_id)
          .eq('seller_id', offer.listing.seller_id)
          .eq('buyer_id', offer.buyer_id);
      } catch (error) {
        console.error('Error waiting for transaction:', error);
        return sendError(res, 'Failed to wait for transaction', 500);
      }
    }

    // Accept the offer
    const transaction = await acceptMarketplaceOffer(offerId);

    // Return success
    return sendSuccess(res, {
      transaction,
      message: 'Offer accepted successfully',
    });
  } catch (error) {
    console.error('Accept offer error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);

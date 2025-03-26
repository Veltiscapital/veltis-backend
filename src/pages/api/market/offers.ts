import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError, parsePagination, parseStringParam } from '../../../lib/utils/api';
import { supabaseAdmin, createMarketplaceOffer } from '../../../lib/db/supabase';

/**
 * Get marketplace offers or create a new offer
 * 
 * @param req NextApiRequest
 * @param res NextApiResponse
 * @param userId The authenticated user's ID
 */
async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getOffers(req, res, userId);
    case 'POST':
      return createOffer(req, res, userId);
    default:
      return sendError(res, 'Method not allowed', 405);
  }
}

/**
 * Get marketplace offers
 * @param req The request object
 * @param res The response object
 * @param userId The authenticated user's ID
 */
async function getOffers(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Parse query parameters
    const { page, limit, offset } = parsePagination(req.query);
    const type = parseStringParam(req.query.type, 'received'); // 'received' or 'sent'
    const status = parseStringParam(req.query.status); // 'pending', 'accepted', 'rejected'
    const listingId = parseStringParam(req.query.listingId);

    // Build the query
    let query;

    if (type === 'received') {
      // Get offers received by the user (as a seller)
      query = supabaseAdmin
        .from('offers')
        .select(`
          *,
          listing:listings!inner(*),
          buyer:users!inner(id, name, wallet_address)
        `)
        .eq('listing.seller_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    } else {
      // Get offers sent by the user (as a buyer)
      query = supabaseAdmin
        .from('offers')
        .select(`
          *,
          listing:listings!inner(*),
          seller:listings!inner(seller:users!inner(id, name, wallet_address))
        `)
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (listingId) {
      query = query.eq('listing_id', listingId);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching offers:', error);
      return sendError(res, 'Failed to fetch offers', 500);
    }

    // Get the total count
    let countQuery;

    if (type === 'received') {
      countQuery = supabaseAdmin
        .from('offers')
        .select('id', { count: 'exact', head: true })
        .eq('listing.seller_id', userId);
    } else {
      countQuery = supabaseAdmin
        .from('offers')
        .select('id', { count: 'exact', head: true })
        .eq('buyer_id', userId);
    }

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    if (listingId) {
      countQuery = countQuery.eq('listing_id', listingId);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Error fetching offer count:', countError);
      return sendError(res, 'Failed to fetch offer count', 500);
    }

    // Return the offers
    return sendSuccess(res, {
      offers: data,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Offers error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

/**
 * Create a new marketplace offer
 * @param req The request object
 * @param res The response object
 * @param userId The authenticated user's ID
 */
async function createOffer(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Get the offer data from the request body
    const { listingId, amount, currency = 'MATIC', expirationDate } = req.body;

    // Validate required fields
    if (!listingId) {
      return sendError(res, 'Listing ID is required', 400);
    }

    if (!amount || amount <= 0) {
      return sendError(res, 'Amount must be greater than 0', 400);
    }

    // Check if the listing exists and is active
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('listings')
      .select('id, seller_id, ipnft_id, status')
      .eq('id', listingId)
      .single();

    if (listingError) {
      console.error('Error fetching listing:', listingError);
      return sendError(res, 'Failed to fetch listing', 500);
    }

    if (!listing) {
      return sendError(res, 'Listing not found', 404);
    }

    if (listing.status !== 'active') {
      return sendError(res, 'Listing is not active', 400);
    }

    // Check if the user is not the seller
    if (listing.seller_id === userId) {
      return sendError(res, 'You cannot make an offer on your own listing', 400);
    }

    // Check if the user already has a pending offer for this listing
    const { data: existingOffer, error: existingOfferError } = await supabaseAdmin
      .from('offers')
      .select('id')
      .eq('listing_id', listingId)
      .eq('buyer_id', userId)
      .eq('status', 'pending')
      .single();

    if (existingOfferError && existingOfferError.code !== 'PGRST116') {
      console.error('Error checking existing offer:', existingOfferError);
      return sendError(res, 'Failed to check existing offer', 500);
    }

    if (existingOffer) {
      return sendError(res, 'You already have a pending offer for this listing', 400);
    }

    // Create the offer
    const offer = await createMarketplaceOffer({
      listing_id: listingId,
      buyer_id: userId,
      amount,
      currency,
      expiration_date: expirationDate,
    });

    // Return the offer
    return sendSuccess(res, {
      offer,
      message: 'Offer created successfully',
    });
  } catch (error) {
    console.error('Create offer error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);

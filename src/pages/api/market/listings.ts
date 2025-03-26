import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError, parsePagination, parseStringParam, parseNumberParam } from '../../../lib/utils/api';
import { supabaseAdmin, createMarketplaceListing } from '../../../lib/db/supabase';

/**
 * Get marketplace listings or create a new listing
 * 
 * @param req NextApiRequest
 * @param res NextApiResponse
 * @param userId The authenticated user's ID
 */
async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getListings(req, res);
    case 'POST':
      return createListing(req, res, userId);
    default:
      return sendError(res, 'Method not allowed', 405);
  }
}

/**
 * Get marketplace listings
 * @param req The request object
 * @param res The response object
 */
async function getListings(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Parse query parameters
    const { page, limit, offset } = parsePagination(req.query);
    const minPrice = parseNumberParam(req.query.minPrice);
    const maxPrice = parseNumberParam(req.query.maxPrice);
    const ipType = parseStringParam(req.query.ipType);
    const developmentStage = parseStringParam(req.query.developmentStage);
    const sellerId = parseStringParam(req.query.sellerId);

    // Build the query
    let query = supabaseAdmin
      .from('listings')
      .select(`
        *,
        ipnft:ipnfts(*),
        seller:users(id, name, wallet_address)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (minPrice > 0) {
      query = query.gte('price', minPrice);
    }

    if (maxPrice > 0) {
      query = query.lte('price', maxPrice);
    }

    if (ipType) {
      query = query.eq('ipnft.ip_type', ipType);
    }

    if (developmentStage) {
      query = query.eq('ipnft.development_stage', developmentStage);
    }

    if (sellerId) {
      query = query.eq('seller_id', sellerId);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching listings:', error);
      return sendError(res, 'Failed to fetch listings', 500);
    }

    // Get the total count
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (countError) {
      console.error('Error fetching listing count:', countError);
      return sendError(res, 'Failed to fetch listing count', 500);
    }

    // Return the listings
    return sendSuccess(res, {
      listings: data,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Listings error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

/**
 * Create a new marketplace listing
 * @param req The request object
 * @param res The response object
 * @param userId The authenticated user's ID
 */
async function createListing(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Get the listing data from the request body
    const { ipnftId, price, currency = 'MATIC' } = req.body;

    // Validate required fields
    if (!ipnftId) {
      return sendError(res, 'IP-NFT ID is required', 400);
    }

    if (!price || price <= 0) {
      return sendError(res, 'Price must be greater than 0', 400);
    }

    // Check if the user owns the IP-NFT
    const { data: ipnft, error: ipnftError } = await supabaseAdmin
      .from('ipnfts')
      .select('owner_id')
      .eq('id', ipnftId)
      .single();

    if (ipnftError) {
      console.error('Error fetching IP-NFT:', ipnftError);
      return sendError(res, 'Failed to fetch IP-NFT', 500);
    }

    if (!ipnft) {
      return sendError(res, 'IP-NFT not found', 404);
    }

    if (ipnft.owner_id !== userId) {
      return sendError(res, 'You do not own this IP-NFT', 403);
    }

    // Check if the IP-NFT is already listed
    const { data: existingListing, error: existingListingError } = await supabaseAdmin
      .from('listings')
      .select('id')
      .eq('ipnft_id', ipnftId)
      .eq('status', 'active')
      .single();

    if (existingListingError && existingListingError.code !== 'PGRST116') {
      console.error('Error checking existing listing:', existingListingError);
      return sendError(res, 'Failed to check existing listing', 500);
    }

    if (existingListing) {
      return sendError(res, 'This IP-NFT is already listed for sale', 400);
    }

    // Create the listing
    const listing = await createMarketplaceListing({
      ipnft_id: ipnftId,
      seller_id: userId,
      price,
      currency,
    });

    // Return the listing
    return sendSuccess(res, {
      listing,
      message: 'Listing created successfully',
    });
  } catch (error) {
    console.error('Create listing error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);

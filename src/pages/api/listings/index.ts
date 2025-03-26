import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError } from '../../../lib/utils/api';

// Mock listings data
const mockListings = [
  {
    id: '1',
    ipnft_id: '123e4567-e89b-12d3-a456-426614174000',
    seller_id: 'user1',
    price: 5000000,
    currency: 'USD',
    status: 'active',
    created_at: '2023-09-01T12:00:00Z',
    expires_at: '2023-12-01T12:00:00Z',
    is_auction: false,
    ipnft: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Novel Gene Therapy Method',
      description: 'A revolutionary gene therapy approach for treating genetic disorders',
      owner_id: 'user1',
      valuation: 7500000,
      ip_type: 'Patent',
      development_stage: 'Clinical Trials',
      ipfs_document_cid: 'QmUzA6vDPMfvqYPT5QtQrD5x9Hp7GVxvdxkpwutuaoULFC',
      status: 'active',
      is_verified: true,
      verificationLevel: 3,
      created_at: '2023-06-15T10:30:00Z',
      expiry: '2043-06-15T10:30:00Z',
      protection: 'Worldwide patent pending',
      stage: 'Clinical Trials Phase II',
      institution: 'Harvard Medical School',
      authors: ['Dr. Jane Smith', 'Dr. Michael Johnson']
    }
  },
  {
    id: '2',
    ipnft_id: '223e4567-e89b-12d3-a456-426614174001',
    seller_id: 'user2',
    price: 2500000,
    currency: 'USD',
    status: 'active',
    created_at: '2023-09-05T14:30:00Z',
    expires_at: '2023-12-05T14:30:00Z',
    is_auction: true,
    min_bid: 2500000,
    current_highest_bid: 3000000,
    ipnft: {
      id: '223e4567-e89b-12d3-a456-426614174001',
      title: 'AI-Powered Drug Discovery Platform',
      description: 'Machine learning algorithm for predicting drug efficacy and toxicity',
      owner_id: 'user2',
      valuation: 4000000,
      ip_type: 'Software',
      development_stage: 'Production',
      ipfs_document_cid: 'QmVzB6vDPMfvqYPT5QtQrD5x9Hp7GVxvdxkpwutuaoULFD',
      status: 'active',
      is_verified: true,
      verificationLevel: 2,
      created_at: '2023-07-20T09:15:00Z',
      expiry: '2043-07-20T09:15:00Z',
      protection: 'Copyright registered',
      stage: 'Released',
      institution: 'MIT',
      authors: ['Dr. Robert Lee', 'Dr. Elizabeth Chen']
    }
  },
  {
    id: '3',
    ipnft_id: '323e4567-e89b-12d3-a456-426614174002',
    seller_id: 'user3',
    price: 1200000,
    currency: 'USD',
    status: 'active',
    created_at: '2023-09-10T11:45:00Z',
    expires_at: '2023-12-10T11:45:00Z',
    is_auction: false,
    ipnft: {
      id: '323e4567-e89b-12d3-a456-426614174002',
      title: 'Biodegradable Polymer for Medical Implants',
      description: 'Novel material for temporary medical implants with controlled degradation',
      owner_id: 'user3',
      valuation: 3000000,
      ip_type: 'Patent',
      development_stage: 'Prototype',
      ipfs_document_cid: 'QmWzA6vDPMfvqYPT5QtQrD5x9Hp7GVxvdxkpwutuaoULFE',
      status: 'active',
      is_verified: true,
      verificationLevel: 1,
      created_at: '2023-08-05T16:20:00Z',
      expiry: '2043-08-05T16:20:00Z',
      protection: 'US patent pending',
      stage: 'Prototype testing',
      institution: 'Stanford University',
      authors: ['Dr. Maria Rodriguez', 'Dr. James Kim']
    }
  }
];

/**
 * Handler for listing endpoints
 */
async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  // GET request for retrieving listings
  if (req.method === 'GET') {
    try {
      // Extract pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      // Apply filters if any
      let filteredListings = [...mockListings];
      
      if (req.query.status) {
        filteredListings = filteredListings.filter(listing => 
          listing.status === req.query.status);
      }
      
      if (req.query.seller_id) {
        filteredListings = filteredListings.filter(listing => 
          listing.seller_id === req.query.seller_id);
      }
      
      if (req.query.is_auction) {
        const isAuction = req.query.is_auction === 'true';
        filteredListings = filteredListings.filter(listing => 
          listing.is_auction === isAuction);
      }
      
      // Paginate results
      const paginatedListings = filteredListings.slice(offset, offset + limit);
      
      // Return successful response
      return sendSuccess(res, {
        listings: paginatedListings,
        pagination: {
          total: filteredListings.length,
          page,
          limit,
          pages: Math.ceil(filteredListings.length / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching listings:', error);
      return sendError(res, 'Failed to fetch listings', 500);
    }
  } 
  // POST request for creating new listing
  else if (req.method === 'POST') {
    try {
      // Extract request body
      const { ipnft_id, price, currency, is_auction, min_bid, expires_at } = req.body;
      
      // Validate required fields
      if (!ipnft_id || !price || !currency) {
        return sendError(res, 'Missing required fields: ipnft_id, price, currency', 400);
      }
      
      // Create a mock new listing
      const newListing = {
        id: `${Date.now()}`,
        ipnft_id,
        seller_id: userId,
        price: parseFloat(price),
        currency: currency || 'USD',
        status: 'active',
        created_at: new Date().toISOString(),
        expires_at: expires_at || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        is_auction: is_auction || false,
        min_bid: min_bid ? parseFloat(min_bid) : undefined,
        current_highest_bid: undefined,
        ipnft: mockListings.find(l => l.ipnft.id === ipnft_id)?.ipnft || {
          id: ipnft_id,
          title: 'Mock IPNFT',
          description: 'A mock IPNFT for testing',
          owner_id: userId,
          valuation: parseFloat(price) * 1.5,
          ip_type: 'Patent',
          development_stage: 'Concept',
          ipfs_document_cid: 'QmMockCIDForTesting',
          status: 'active',
          is_verified: false,
          verificationLevel: 0,
          created_at: new Date().toISOString(),
          expiry: new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          protection: 'Pending',
          stage: 'Concept',
          institution: 'Testing Institution',
          authors: ['Test Author']
        }
      };
      
      // Return successful response
      return sendSuccess(res, {
        listing: newListing,
        message: 'Listing created successfully'
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      return sendError(res, 'Failed to create listing', 500);
    }
  } 
  // Method not allowed
  else {
    return sendError(res, 'Method not allowed', 405);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler); 
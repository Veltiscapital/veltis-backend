import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError, parsePagination, parseStringParam } from '../../../lib/utils/api';
import { supabaseAdmin } from '../../../lib/db/supabase';

// Mock IPNFT data for development
const mockIPNFTs = [
  {
    id: "6a7ed85c-e0d0-4c57-96c0-d8f2a34a6e5b",
    name: "Novel Method for Carbon Capture",
    title: "Novel Method for Carbon Capture",
    description: "A breakthrough technology for capturing carbon dioxide from industrial emissions",
    status: "active",
    valuation: "1500000",
    expiry: "2043-05-15",
    protection: "Patent",
    stage: "Phase II",
    owner_id: null, // Will be set to the current user
    owner: null, // Will be set to the current user
    tokenId: "1",
    contract_address: "0x123456789abcdef123456789abcdef123456789a",
    authors: ["Dr. Jane Smith", "Dr. Robert Johnson"],
    institution: "Climate Solutions Inc.",
    ip_type: "Patent",
    development_stage: "Phase II",
    ipfs_document_cid: "Qmf5dQaZr8UJx5r5gHrK7467Ve7dYKJ3Rp5aUVo6YmvLqR",
    ipfs_metadata_uri: "ipfs://Qmf5dQaZr8UJx5r5gHrK7467Ve7dYKJ3Rp5aUVo6YmvLqR/metadata.json",
    is_verified: true,
    created_at: "2024-02-15T14:30:00Z",
    createdAt: "2024-02-15T14:30:00Z",
    updated_at: "2024-02-15T14:30:00Z",
    updatedAt: "2024-02-15T14:30:00Z",
    verificationLevel: "expert"
  },
  {
    id: "8c9ed12d-f2a1-4b67-8a30-e7f3b4c59a2d",
    name: "Advanced Neural Network Architecture",
    title: "Advanced Neural Network Architecture",
    description: "A new architecture for deep learning that improves efficiency by 40%",
    status: "active",
    valuation: "2300000",
    expiry: "2042-08-23",
    protection: "Patent",
    stage: "Phase III",
    owner_id: null, // Will be set to the current user
    owner: null, // Will be set to the current user
    tokenId: "2",
    contract_address: "0x123456789abcdef123456789abcdef123456789a",
    authors: ["Dr. Michael Chen", "Dr. Sarah Williams"],
    institution: "AI Research Labs",
    ip_type: "Patent",
    development_stage: "Phase III",
    ipfs_document_cid: "QmaNb5dQaZr8UJx5r5gHrK7467Ve7dYKJ3Rp5aUVo6YmvL",
    ipfs_metadata_uri: "ipfs://QmaNb5dQaZr8UJx5r5gHrK7467Ve7dYKJ3Rp5aUVo6YmvL/metadata.json",
    is_verified: true,
    created_at: "2024-01-05T10:15:00Z",
    createdAt: "2024-01-05T10:15:00Z",
    updated_at: "2024-01-05T10:15:00Z",
    updatedAt: "2024-01-05T10:15:00Z",
    verificationLevel: "institutional"
  },
  {
    id: "3e4fd65a-b2c9-4d78-9e10-f8a5b6c7d8e9",
    name: "Biodegradable Polymer for Medical Implants",
    title: "Biodegradable Polymer for Medical Implants",
    description: "A novel polymer that safely degrades in the body after serving its purpose",
    status: "active",
    valuation: "1800000",
    expiry: "2044-11-30",
    protection: "Patent",
    stage: "Phase I",
    owner_id: null, // Will be set to the current user
    owner: null, // Will be set to the current user
    tokenId: "3",
    contract_address: "0x123456789abcdef123456789abcdef123456789a",
    authors: ["Dr. Emily Rodriguez", "Dr. David Kim"],
    institution: "BioMaterials Research Center",
    ip_type: "Patent",
    development_stage: "Phase I",
    ipfs_document_cid: "QmzNb5dQaZr8UJx5r5gHrK7467Ve7dYKJ3Rp5aUVo6XtvR",
    ipfs_metadata_uri: "ipfs://QmzNb5dQaZr8UJx5r5gHrK7467Ve7dYKJ3Rp5aUVo6XtvR/metadata.json",
    is_verified: true,
    created_at: "2024-03-20T09:45:00Z",
    createdAt: "2024-03-20T09:45:00Z",
    updated_at: "2024-03-20T09:45:00Z",
    updatedAt: "2024-03-20T09:45:00Z",
    verificationLevel: "basic"
  }
];

/**
 * List IP-NFTs
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
    // Parse query parameters
    const { page, limit, offset } = parsePagination(req.query);
    
    // Use mock data instead of database query
    const mockDataWithOwner = mockIPNFTs.map(ipnft => ({
      ...ipnft,
      owner_id: userId,
      owner: {
        id: userId,
        name: "Test User",
        wallet_address: "0x692973E3260E0ABD3ffBd9b8F29aAb57E2A4C0Ee"
      }
    }));

    console.log('Returning mock IP-NFTs for user:', userId);
    
    // Match the structure expected by the frontend
    return res.status(200).json({
      success: true,
      data: {
        ipnfts: mockDataWithOwner,
        pagination: {
          page,
          limit,
          total: mockDataWithOwner.length,
          pages: Math.ceil(mockDataWithOwner.length / limit),
        },
      },
      message: "IP-NFTs retrieved successfully"
    });
  } catch (error) {
    console.error('IP-NFT list error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError } from '../../../lib/utils/api';

// Mock fractionalized token data
const mockFractionTokens = {
  'frac_0x4a8b7e4a3c412bd3f93c701599aa8b8f2da5fc40': {
    address: '0x4a8b7e4a3c412bd3f93c701599aa8b8f2da5fc40',
    ipnftId: '123e4567-e89b-12d3-a456-426614174000',
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
    },
    name: 'Gene Therapy Token',
    symbol: 'GTT',
    decimals: 18,
    totalShares: 1000000,
    sharesSold: 820000,
    sharePrice: 7.50, // $7.50 per share
    marketCap: 7500000, // $7.5M
    createdAt: '2023-06-20T14:00:00Z',
    creator: 'Harvard Medical School',
    status: 'active',
    redemptionThreshold: 950000, // 95%
    shareholderCount: 145,
    transactions: [
      {
        id: '1',
        type: 'buy',
        amount: 50000,
        price: 7.50,
        timestamp: '2023-07-01T09:30:00Z',
        buyer: '0xa1b2c3d4e5f67890abcdef1234567890abcdef12',
        seller: '0x4a8b7e4a3c412bd3f93c701599aa8b8f2da5fc40',
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      },
      {
        id: '2',
        type: 'buy',
        amount: 75000,
        price: 7.45,
        timestamp: '2023-07-05T11:45:00Z',
        buyer: '0xb2c3d4e5f67890abcdef1234567890abcdef12a1',
        seller: '0x4a8b7e4a3c412bd3f93c701599aa8b8f2da5fc40',
        txHash: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a'
      },
      {
        id: '3',
        type: 'sell',
        amount: 12000,
        price: 7.65,
        timestamp: '2023-07-10T14:20:00Z',
        buyer: '0xc3d4e5f67890abcdef1234567890abcdef12a1b2',
        seller: '0xb2c3d4e5f67890abcdef1234567890abcdef12a1',
        txHash: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
      }
    ],
    priceHistory: [
      { date: '2023-06-20', price: 7.50 },
      { date: '2023-06-27', price: 7.45 },
      { date: '2023-07-04', price: 7.55 },
      { date: '2023-07-11', price: 7.65 },
      { date: '2023-07-18', price: 7.70 },
      { date: '2023-07-25', price: 7.80 },
      { date: '2023-08-01', price: 7.75 },
      { date: '2023-08-08', price: 7.85 },
      { date: '2023-08-15', price: 7.90 },
      { date: '2023-08-22', price: 7.95 }
    ]
  },
  'frac_0x5b9c8f6e4d3a2b1c0e7f89d012a34567b8f9c012': {
    address: '0x5b9c8f6e4d3a2b1c0e7f89d012a34567b8f9c012',
    ipnftId: '223e4567-e89b-12d3-a456-426614174001',
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
    },
    name: 'AI Discovery Token',
    symbol: 'ADT',
    decimals: 18,
    totalShares: 1500000,
    sharesSold: 1200000,
    sharePrice: 2.67, // $2.67 per share
    marketCap: 4000000, // $4M
    createdAt: '2023-07-25T10:00:00Z',
    creator: 'MIT',
    status: 'active',
    redemptionThreshold: 1350000, // 90%
    shareholderCount: 210,
    transactions: [
      {
        id: '1',
        type: 'buy',
        amount: 100000,
        price: 2.65,
        timestamp: '2023-07-26T13:15:00Z',
        buyer: '0xd4e5f67890abcdef1234567890abcdef12a1b2c3',
        seller: '0x5b9c8f6e4d3a2b1c0e7f89d012a34567b8f9c012',
        txHash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc'
      },
      {
        id: '2',
        type: 'buy',
        amount: 150000,
        price: 2.62,
        timestamp: '2023-07-30T09:45:00Z',
        buyer: '0xe5f67890abcdef1234567890abcdef12a1b2c3d4',
        seller: '0x5b9c8f6e4d3a2b1c0e7f89d012a34567b8f9c012',
        txHash: '0xef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd'
      }
    ],
    priceHistory: [
      { date: '2023-07-25', price: 2.67 },
      { date: '2023-08-01', price: 2.70 },
      { date: '2023-08-08', price: 2.75 },
      { date: '2023-08-15', price: 2.80 },
      { date: '2023-08-22', price: 2.85 }
    ]
  }
};

/**
 * Handler for fractionalized token details by address
 */
async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }
  
  try {
    // Get the contract address from the URL
    const { address } = req.query;
    
    if (!address || typeof address !== 'string') {
      return sendError(res, 'Missing contract address', 400);
    }
    
    // Format the address for lookup (add 'frac_' prefix if not present)
    const lookupAddress = address.startsWith('frac_') ? address : `frac_${address}`;
    
    // Get the fractionalized token data
    const fractionToken = mockFractionTokens[lookupAddress];
    
    if (!fractionToken) {
      // If not found in mock data, create a dynamic mock
      const randomId = Math.floor(Math.random() * 1000000).toString(16);
      
      const dynamicMock = {
        address: address.startsWith('frac_') ? address : `frac_${address}`,
        ipnftId: `random-${randomId}`,
        ipnft: {
          id: `random-${randomId}`,
          title: 'Dynamic Mock IPNFT',
          description: 'This is a dynamically generated mock IPNFT for testing',
          owner_id: userId,
          valuation: 3000000,
          ip_type: 'Patent',
          development_stage: 'Concept',
          ipfs_document_cid: 'QmMockIPFSCIDForTesting',
          status: 'active',
          is_verified: false,
          verificationLevel: 1,
          created_at: new Date().toISOString(),
          expiry: new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          protection: 'Patent pending',
          stage: 'Concept',
          institution: 'Test Institution',
          authors: ['Test Author']
        },
        name: 'Dynamic Mock Token',
        symbol: 'DMT',
        decimals: 18,
        totalShares: 1000000,
        sharesSold: 500000,
        sharePrice: 3.00,
        marketCap: 3000000,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        creator: 'Test Creator',
        status: 'active',
        redemptionThreshold: 900000,
        shareholderCount: 50,
        transactions: [
          {
            id: '1',
            type: 'buy',
            amount: 50000,
            price: 3.00,
            timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            buyer: `0x${randomId}1234567890abcdef1234567890abcdef`,
            seller: address,
            txHash: `0x${randomId}234567890abcdef1234567890abcdef1234567890abcdef12`
          }
        ],
        priceHistory: [
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 3.00 },
          { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 3.05 },
          { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 3.10 },
          { date: new Date().toISOString().split('T')[0], price: 3.15 }
        ]
      };
      
      return sendSuccess(res, {
        fractionToken: dynamicMock
      });
    }
    
    return sendSuccess(res, {
      fractionToken
    });
  } catch (error) {
    console.error('Error fetching fractionalized token details:', error);
    return sendError(res, 'Failed to fetch fractionalized token details', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler); 
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError } from '../../../lib/utils/api';

// Mock analytics data
const mockAnalytics = {
  // IP-NFT statistics
  ipnfts: {
    total: 45,
    verified: 28,
    unverified: 17,
    byType: {
      Patent: 22,
      Software: 14,
      Dataset: 5,
      Research: 4
    },
    byStage: {
      Concept: 8,
      Research: 12,
      Prototype: 15,
      'Clinical Trials': 7,
      Production: 3
    },
    valuationTotal: 98500000, // $98.5M
    valuationAverage: 2188888, // ~$2.19M
    monthlyGrowth: [
      { month: 'Jan', count: 3 },
      { month: 'Feb', count: 5 },
      { month: 'Mar', count: 4 },
      { month: 'Apr', count: 7 },
      { month: 'May', count: 6 },
      { month: 'Jun', count: 8 },
      { month: 'Jul', count: 5 },
      { month: 'Aug', count: 7 }
    ]
  },
  
  // Marketplace statistics
  marketplace: {
    activeListing: 12,
    soldListing: 18,
    expiredListing: 4,
    totalVolume: 42500000, // $42.5M
    avgSalePrice: 2361111, // ~$2.36M
    highestSale: 7800000, // $7.8M
    monthlySales: [
      { month: 'Jan', volume: 4200000 },
      { month: 'Feb', volume: 3800000 },
      { month: 'Mar', volume: 5100000 },
      { month: 'Apr', volume: 4800000 },
      { month: 'May', volume: 6500000 },
      { month: 'Jun', volume: 7200000 },
      { month: 'Jul', volume: 5700000 },
      { month: 'Aug', volume: 5200000 }
    ]
  },
  
  // Fractionalization statistics
  fractionalization: {
    totalFractionalized: 8,
    activeFractions: 6,
    completedFractions: 2,
    totalValueLocked: 22500000, // $22.5M
    totalShares: 8000000,
    avgSharePrice: 2.81, // $2.81
    fractionDistribution: [
      { ipnft: 'Novel Gene Therapy Method', shares: 1000000, sharesSold: 820000 },
      { ipnft: 'AI-Powered Drug Discovery Platform', shares: 1500000, sharesSold: 1200000 },
      { ipnft: 'Biodegradable Polymer for Medical Implants', shares: 800000, sharesSold: 650000 },
      { ipnft: 'Sustainable Battery Technology', shares: 1200000, sharesSold: 750000 },
      { ipnft: 'Neuromorphic Computing Architecture', shares: 2000000, sharesSold: 1800000 },
      { ipnft: 'CRISPR Gene Editing Tool', shares: 1500000, sharesSold: 1350000 }
    ]
  },
  
  // User statistics
  users: {
    total: 320,
    active: 180,
    byRole: {
      Individual: 145,
      Institution: 95,
      Corporate: 80
    },
    newUsersMonthly: [
      { month: 'Jan', count: 18 },
      { month: 'Feb', count: 22 },
      { month: 'Mar', count: 26 },
      { month: 'Apr', count: 31 },
      { month: 'May', count: 40 },
      { month: 'Jun', count: 45 },
      { month: 'Jul', count: 52 },
      { month: 'Aug', count: 58 }
    ]
  },
  
  // Activity metrics
  activity: {
    totalTransactions: 128,
    monthlyTransactions: [
      { month: 'Jan', count: 8 },
      { month: 'Feb', count: 12 },
      { month: 'Mar', count: 14 },
      { month: 'Apr', count: 15 },
      { month: 'May', count: 18 },
      { month: 'Jun', count: 22 },
      { month: 'Jul', count: 19 },
      { month: 'Aug', count: 20 }
    ],
    recentActivity: [
      { type: 'mint', timestamp: '2023-08-28T14:25:00Z', user: 'Stanford University', asset: 'Quantum Computing Algorithm' },
      { type: 'sale', timestamp: '2023-08-27T11:15:00Z', user: 'Pfizer Inc.', asset: 'Novel Antibody Delivery System' },
      { type: 'fraction', timestamp: '2023-08-26T09:30:00Z', user: 'MIT', asset: 'Neuromorphic Computing Architecture' },
      { type: 'listing', timestamp: '2023-08-25T16:45:00Z', user: 'Harvard Medical School', asset: 'Synthetic Biology Framework' },
      { type: 'mint', timestamp: '2023-08-24T13:20:00Z', user: 'University of California', asset: 'Carbon Capture Method' }
    ]
  }
};

/**
 * Handler for analytics data
 */
async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }
  
  try {
    // Extract query parameters
    const section = req.query.section as string;
    
    // Return specific section if requested
    if (section && section in mockAnalytics) {
      return sendSuccess(res, {
        analytics: mockAnalytics[section as keyof typeof mockAnalytics]
      });
    }
    
    // Generate user-specific stats (random variation for demo)
    const userStats = {
      ipnftsOwned: Math.floor(Math.random() * 5) + 1,
      ipnftsListed: Math.floor(Math.random() * 3),
      fractionalizationParticipation: Math.floor(Math.random() * 4),
      totalValue: (Math.random() * 5 + 1) * 1000000, // $1-6M
      recentActivity: [
        { type: 'mint', timestamp: '2023-08-26T10:15:00Z', asset: 'Machine Learning Algorithm for Drug Discovery' },
        { type: 'listing', timestamp: '2023-08-24T14:30:00Z', asset: 'Novel Antibody Therapy' },
        { type: 'fraction_buy', timestamp: '2023-08-22T09:45:00Z', asset: 'Neuromorphic Computing Architecture' }
      ]
    };
    
    // Return all analytics data
    return sendSuccess(res, {
      analytics: {
        ...mockAnalytics,
        user: userStats
      }
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return sendError(res, 'Failed to fetch analytics data', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler); 
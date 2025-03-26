import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError } from '../../../lib/utils/api';
import { getMarketAnalytics } from '../../../lib/db/supabase';

/**
 * Get market analytics data
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
    // Get market analytics data
    const analytics = await getMarketAnalytics();

    // Get IP types distribution
    const ipTypesDistribution = Object.entries(analytics.ip_types_distribution).map(
      ([name, count]) => ({
        name,
        count,
      })
    );

    // Get development stages distribution
    const developmentStagesDistribution = Object.entries(
      analytics.development_stages_distribution
    ).map(([name, count]) => ({
      name,
      count,
    }));

    // Calculate market growth
    const marketGrowth = {
      total_ipnfts: analytics.total_ipnfts,
      total_volume: analytics.total_volume,
      average_valuation: analytics.average_valuation,
    };

    // Return the analytics data
    return sendSuccess(res, {
      market_overview: {
        total_ipnfts: analytics.total_ipnfts,
        total_transactions: analytics.total_transactions,
        total_volume: analytics.total_volume,
        average_valuation: analytics.average_valuation,
      },
      ip_types_distribution: ipTypesDistribution,
      development_stages_distribution: developmentStagesDistribution,
      market_growth: marketGrowth,
    });
  } catch (error) {
    console.error('Market analytics error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);

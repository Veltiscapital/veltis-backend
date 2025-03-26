import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError } from '../../../lib/utils/api';
import { getPortfolioAnalytics } from '../../../lib/db/supabase';

/**
 * Get portfolio analytics data for the authenticated user
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
    // Get portfolio analytics data
    const analytics = await getPortfolioAnalytics(userId);

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

    // Calculate portfolio performance
    const portfolioPerformance = {
      total_ipnfts: analytics.total_ipnfts,
      total_portfolio_value: analytics.total_portfolio_value,
      total_transaction_volume: analytics.total_transaction_volume,
    };

    // Calculate portfolio growth
    const portfolioGrowth = {
      // Calculate growth based on transaction history
      // This is a simplified calculation
      growth_percentage: analytics.total_transaction_volume > 0
        ? ((analytics.total_portfolio_value - analytics.total_transaction_volume) / analytics.total_transaction_volume) * 100
        : 0,
    };

    // Return the analytics data
    return sendSuccess(res, {
      portfolio_overview: {
        total_ipnfts: analytics.total_ipnfts,
        total_portfolio_value: analytics.total_portfolio_value,
        total_transaction_volume: analytics.total_transaction_volume,
      },
      ip_types_distribution: ipTypesDistribution,
      development_stages_distribution: developmentStagesDistribution,
      portfolio_performance: portfolioPerformance,
      portfolio_growth: portfolioGrowth,
      ipnfts: analytics.ipnfts,
      transactions: analytics.transactions,
    });
  } catch (error) {
    console.error('Portfolio analytics error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);

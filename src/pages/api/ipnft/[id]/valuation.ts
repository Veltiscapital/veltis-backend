import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../../lib/utils/auth';
import { sendSuccess, sendError } from '../../../../lib/utils/api';
import { supabaseAdmin } from '../../../../lib/db/supabase';

/**
 * Get the valuation of an IP-NFT
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

  // Get the IP-NFT ID from the URL
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return sendError(res, 'Invalid IP-NFT ID', 400);
  }

  try {
    // Get the IP-NFT from the database
    const { data: ipnft, error: ipnftError } = await supabaseAdmin
      .from('ipnfts')
      .select(`
        id,
        title,
        ip_type,
        development_stage,
        valuation,
        citation_count,
        market_size,
        exclusivity_score,
        innovation_score,
        licensing_potential,
        legal_strength
      `)
      .eq('id', id)
      .single();

    if (ipnftError) {
      console.error('Error fetching IP-NFT:', ipnftError);
      return sendError(res, 'Failed to fetch IP-NFT', 500);
    }

    if (!ipnft) {
      return sendError(res, 'IP-NFT not found', 404);
    }

    // Get the historical valuations
    const { data: valuations, error: valuationsError } = await supabaseAdmin
      .from('valuations')
      .select('*')
      .eq('ipnft_id', id)
      .order('timestamp', { ascending: true });

    if (valuationsError) {
      console.error('Error fetching valuations:', valuationsError);
      return sendError(res, 'Failed to fetch valuations', 500);
    }

    // Get comparable IP-NFTs
    const { data: comparables, error: comparablesError } = await supabaseAdmin
      .from('ipnfts')
      .select(`
        id,
        title,
        ip_type,
        development_stage,
        valuation,
        citation_count,
        market_size
      `)
      .eq('ip_type', ipnft.ip_type)
      .eq('development_stage', ipnft.development_stage)
      .neq('id', id)
      .order('valuation', { ascending: false })
      .limit(5);

    if (comparablesError) {
      console.error('Error fetching comparables:', comparablesError);
      return sendError(res, 'Failed to fetch comparables', 500);
    }

    // Calculate valuation factors
    const valuationFactors = {
      market_size_impact: calculateFactorImpact('market_size', ipnft.market_size || 0),
      innovation_score_impact: calculateFactorImpact('innovation_score', ipnft.innovation_score || 0),
      exclusivity_impact: calculateFactorImpact('exclusivity', ipnft.exclusivity_score || 0),
      licensing_potential_impact: calculateFactorImpact('licensing_potential', ipnft.licensing_potential || 0),
      legal_strength_impact: calculateFactorImpact('legal_strength', ipnft.legal_strength || 0),
    };

    // Calculate predictions
    const predictions = {
      short_term: predictValuation(ipnft.valuation || 0, valuations, 90), // 90 days
      medium_term: predictValuation(ipnft.valuation || 0, valuations, 180), // 180 days
      long_term: predictValuation(ipnft.valuation || 0, valuations, 365), // 365 days
    };

    // Return the valuation data
    return sendSuccess(res, {
      current_valuation: ipnft.valuation,
      historical_valuations: valuations,
      valuation_factors: valuationFactors,
      comparables,
      predictions,
    });
  } catch (error) {
    console.error('Valuation error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

/**
 * Calculate the impact of a factor on the valuation
 * @param factor The factor name
 * @param value The factor value
 * @returns The impact of the factor
 */
function calculateFactorImpact(factor: string, value: number): number {
  // Define factor weights
  const weights: Record<string, number> = {
    market_size: 0.3,
    innovation_score: 0.25,
    exclusivity: 0.2,
    licensing_potential: 0.15,
    legal_strength: 0.1,
  };

  // Calculate the impact
  return value * weights[factor];
}

/**
 * Predict the valuation of an IP-NFT
 * @param currentValuation The current valuation
 * @param historicalValuations The historical valuations
 * @param days The number of days to predict
 * @returns The predicted valuation
 */
function predictValuation(
  currentValuation: number,
  historicalValuations: any[],
  days: number
): number {
  // If there are no historical valuations, return the current valuation
  if (historicalValuations.length < 2) {
    return currentValuation;
  }

  // Calculate the average growth rate
  let totalGrowthRate = 0;
  for (let i = 1; i < historicalValuations.length; i++) {
    const prev = historicalValuations[i - 1].value;
    const curr = historicalValuations[i].value;
    const timeDiff = new Date(historicalValuations[i].timestamp).getTime() -
      new Date(historicalValuations[i - 1].timestamp).getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    const growthRate = (curr - prev) / prev / daysDiff;
    totalGrowthRate += growthRate;
  }
  const avgGrowthRate = totalGrowthRate / (historicalValuations.length - 1);

  // Predict the valuation
  return currentValuation * (1 + avgGrowthRate * days);
}

// Wrap the handler with authentication middleware
export default withAuth(handler);

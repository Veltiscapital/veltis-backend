import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError } from '../../../lib/utils/api';

/**
 * Handler for user profile data
 */
async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }
  
  try {
    // Create a mock user profile
    const userProfile = {
      id: userId,
      name: 'Demo User',
      email: 'demo@veltis.io',
      wallet_address: '0xd4e5f67890abcdef1234567890abcdef12a1b2c3',
      institution: 'Demo Institution',
      role: 'Individual', // Individual, Institution, Corporate
      title: 'Research Scientist',
      bio: 'Specialized in molecular biology and biotechnology with a focus on gene editing technologies and their applications in therapeutic development.',
      avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg',
      website: 'https://demo-researcher.edu',
      social_links: {
        twitter: 'https://twitter.com/demo_researcher',
        linkedin: 'https://linkedin.com/in/demo-researcher',
        github: 'https://github.com/demo-researcher'
      },
      kyc_status: 'approved', // pending, approved, rejected
      created_at: '2023-03-15T08:30:00Z',
      research_fields: ['Molecular Biology', 'Biotechnology', 'CRISPR', 'Gene Therapy'],
      publications: [
        { 
          title: 'Novel Applications of CRISPR in Treating Genetic Disorders',
          journal: 'Journal of Molecular Medicine',
          year: 2022,
          url: 'https://example.com/publication1'
        },
        {
          title: 'Advancements in Delivery Mechanisms for Gene Therapy',
          journal: 'Nature Biotechnology',
          year: 2021,
          url: 'https://example.com/publication2'
        }
      ],
      expertise: ['Gene Editing', 'Clinical Trials', 'Molecular Design', 'Drug Development'],
      stats: {
        ipnfts_owned: 5,
        ipnfts_created: 8,
        total_valuation: 15750000, // $15.75M
        listings_active: 2,
        fractions_participated: 4
      },
      preferences: {
        notifications: {
          email: true,
          platform: true,
          marketing: false
        },
        privacy: {
          show_email: false,
          show_wallet: true,
          show_stats: true
        },
        theme: 'light' // light, dark, system
      }
    };
    
    // Return the user profile
    return sendSuccess(res, {
      user: userProfile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return sendError(res, 'Failed to fetch user profile', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler); 
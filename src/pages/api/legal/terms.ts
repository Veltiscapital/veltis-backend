import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError } from '../../../lib/utils/api';
import { updateUser, getUserById } from '../../../lib/db/supabase';

/**
 * Get terms and conditions or accept them
 * 
 * @param req NextApiRequest
 * @param res NextApiResponse
 * @param userId The authenticated user's ID
 */
async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getTerms(req, res);
    case 'POST':
      return acceptTerms(req, res, userId);
    default:
      return sendError(res, 'Method not allowed', 405);
  }
}

/**
 * Get terms and conditions
 * @param req The request object
 * @param res The response object
 */
async function getTerms(req: NextApiRequest, res: NextApiResponse) {
  try {
    // In a real application, you would fetch the terms from a database or CMS
    // For this example, we'll return a static terms object
    const terms = {
      version: '1.0.0',
      last_updated: '2025-01-01',
      content: `
# VELTIS Terms and Conditions

## 1. Introduction

Welcome to VELTIS, a platform for tokenizing intellectual property (IP) in biotechnology. These Terms and Conditions govern your use of the VELTIS platform and services.

## 2. Definitions

- "Platform" refers to the VELTIS website, mobile applications, and services.
- "IP-NFT" refers to a non-fungible token representing intellectual property rights.
- "User" refers to any individual or entity that uses the Platform.

## 3. Account Registration

To use the Platform, you must create an account and provide accurate information. You are responsible for maintaining the confidentiality of your account credentials.

## 4. IP Tokenization

The Platform allows Users to tokenize their intellectual property as IP-NFTs. By tokenizing IP, Users represent and warrant that they have the legal right to do so.

## 5. Marketplace

The Platform provides a marketplace for buying and selling IP-NFTs. All transactions are subject to these Terms and applicable laws.

## 6. Fees

The Platform charges fees for certain services, including tokenization and marketplace transactions. Fees are displayed before transactions are completed.

## 7. Intellectual Property

Users retain ownership of their intellectual property. By tokenizing IP, Users grant the Platform a license to display and facilitate transactions involving their IP-NFTs.

## 8. Prohibited Activities

Users may not use the Platform for illegal activities, including fraud, money laundering, or infringement of intellectual property rights.

## 9. Termination

The Platform reserves the right to terminate or suspend accounts that violate these Terms.

## 10. Disclaimer of Warranties

The Platform is provided "as is" without warranties of any kind, express or implied.

## 11. Limitation of Liability

The Platform shall not be liable for any indirect, incidental, special, consequential, or punitive damages.

## 12. Governing Law

These Terms are governed by the laws of [Jurisdiction], without regard to its conflict of law principles.

## 13. Changes to Terms

The Platform reserves the right to modify these Terms at any time. Users will be notified of significant changes.

## 14. Contact Information

For questions about these Terms, please contact us at legal@veltis.com.
      `,
    };

    // Return the terms
    return sendSuccess(res, { terms });
  } catch (error) {
    console.error('Terms error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

/**
 * Accept terms and conditions
 * @param req The request object
 * @param res The response object
 * @param userId The authenticated user's ID
 */
async function acceptTerms(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Get the user
    const user = await getUserById(userId);

    // Check if the user has already accepted the terms
    if (user.terms_accepted) {
      return sendSuccess(res, {
        message: 'Terms already accepted',
        accepted_date: user.terms_accepted_date,
      });
    }

    // Update the user
    await updateUser(userId, {
      terms_accepted: true,
      terms_accepted_date: new Date().toISOString(),
    });

    // Return success
    return sendSuccess(res, {
      message: 'Terms accepted successfully',
      accepted_date: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Accept terms error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);

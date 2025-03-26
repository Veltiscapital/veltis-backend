import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError } from '../../../lib/utils/api';

/**
 * Get privacy policy
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
    // In a real application, you would fetch the privacy policy from a database or CMS
    // For this example, we'll return a static privacy policy object
    const privacy = {
      version: '1.0.0',
      last_updated: '2025-01-01',
      content: `
# VELTIS Privacy Policy

## 1. Introduction

This Privacy Policy describes how VELTIS ("we", "our", or "us") collects, uses, and shares your personal information when you use our platform for tokenizing intellectual property (IP) in biotechnology.

## 2. Information We Collect

### 2.1 Information You Provide

We collect information you provide directly to us, including:

- Account information: name, email address, password, and wallet address
- Profile information: institution, role, and other professional details
- KYC information: identification documents and verification data
- IP information: documents, metadata, and other information related to your intellectual property

### 2.2 Information We Collect Automatically

We automatically collect certain information when you use our Platform, including:

- Usage information: pages visited, features used, and actions taken
- Device information: IP address, browser type, operating system, and device identifiers
- Blockchain information: public transaction data related to your IP-NFTs

## 3. How We Use Your Information

We use your information for the following purposes:

- Provide, maintain, and improve our Platform
- Process transactions and fulfill orders
- Verify your identity and prevent fraud
- Communicate with you about our Platform
- Comply with legal obligations

## 4. How We Share Your Information

We may share your information in the following circumstances:

- With service providers who perform services on our behalf
- With other users as necessary to facilitate transactions
- With law enforcement or regulatory authorities when required by law
- In connection with a business transaction, such as a merger or acquisition

## 5. Blockchain Transactions

Please note that blockchain transactions are public and immutable. Information stored on the blockchain, including wallet addresses and transaction data, is publicly accessible.

## 6. Your Rights

Depending on your location, you may have certain rights regarding your personal information, including:

- Access: the right to access your personal information
- Correction: the right to correct inaccurate information
- Deletion: the right to request deletion of your information
- Portability: the right to receive your information in a portable format
- Objection: the right to object to certain processing activities

## 7. Data Security

We implement reasonable security measures to protect your information from unauthorized access, alteration, or destruction.

## 8. International Transfers

Your information may be transferred to and processed in countries other than your country of residence.

## 9. Data Retention

We retain your information for as long as necessary to provide our services and comply with legal obligations.

## 10. Children's Privacy

Our Platform is not intended for children under the age of 18.

## 11. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of significant changes.

## 12. Contact Us

If you have questions about this Privacy Policy, please contact us at privacy@veltis.com.
      `,
    };

    // Return the privacy policy
    return sendSuccess(res, { privacy });
  } catch (error) {
    console.error('Privacy policy error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);

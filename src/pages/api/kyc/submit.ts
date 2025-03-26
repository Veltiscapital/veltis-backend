import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError, validateRequiredFields } from '../../../lib/utils/api';
import { updateUser } from '../../../lib/db/supabase';
import { storeKYCDocuments } from '../../../lib/storage/nft-storage';
import formidable from 'formidable';
import fs from 'fs';

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Parse the form data
 * @param req The request object
 * @returns The parsed form data
 */
function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm({
      multiples: true,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
}

/**
 * Submit KYC documents
 * 
 * @param req NextApiRequest
 * @param res NextApiResponse
 * @param userId The authenticated user's ID
 */
async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    // Parse the form data
    const { fields, files } = await parseForm(req);

    // Validate required fields
    const requiredFields = ['documentType1'];
    const validationError = validateRequiredFields(fields, requiredFields);
    if (validationError) {
      return sendError(res, validationError, 400);
    }

    // Validate required files
    if (!files.document1) {
      return sendError(res, 'Missing required document: document1', 400);
    }

    // Prepare the documents
    const documents = [];
    
    // Add document 1 (required)
    const document1 = Array.isArray(files.document1) ? files.document1[0] : files.document1;
    const document1Buffer = fs.readFileSync(document1.filepath);
    documents.push({
      buffer: document1Buffer,
      originalname: document1.originalFilename || 'document1',
      mimetype: document1.mimetype || 'application/octet-stream',
      documentType: fields.documentType1 as string,
    });

    // Add document 2 (optional)
    if (files.document2) {
      const document2 = Array.isArray(files.document2) ? files.document2[0] : files.document2;
      const document2Buffer = fs.readFileSync(document2.filepath);
      documents.push({
        buffer: document2Buffer,
        originalname: document2.originalFilename || 'document2',
        mimetype: document2.mimetype || 'application/octet-stream',
        documentType: fields.documentType2 as string,
      });
    }

    // Add document 3 (optional)
    if (files.document3) {
      const document3 = Array.isArray(files.document3) ? files.document3[0] : files.document3;
      const document3Buffer = fs.readFileSync(document3.filepath);
      documents.push({
        buffer: document3Buffer,
        originalname: document3.originalFilename || 'document3',
        mimetype: document3.mimetype || 'application/octet-stream',
        documentType: fields.documentType3 as string,
      });
    }

    // Store the documents on IPFS
    const result = await storeKYCDocuments(documents, userId);

    // Update the user's KYC status
    const user = await updateUser(userId, {
      kyc_status: 'pending',
      kyc_submission_date: new Date().toISOString(),
      kyc_document_references: result,
    });

    // Return success
    return sendSuccess(res, {
      status: 'pending',
      message: 'KYC documents submitted successfully',
      documents: result.documents,
    });
  } catch (error) {
    console.error('KYC submission error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);

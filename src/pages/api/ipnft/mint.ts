import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError } from '../../../lib/utils/api';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import { storeIPNFTMetadata, ScientificIPMetadata } from '../../../lib/storage/nft-storage';
import { supabaseAdmin } from '../../../lib/db/supabase';

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Handle IPNFT minting requests
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
    // Parse the multipart form data
    const form = new formidable.IncomingForm({
      multiples: true, // Allow multiple files
      keepExtensions: true,
    });

    // Parse form data
    const formData = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err: any, fields: formidable.Fields, files: formidable.Files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { fields, files } = formData;

    // Log the received data for debugging
    console.log('Mint request received from user:', userId);
    console.log('Form fields:', fields);
    console.log('Files received:', Object.keys(files).length);

    // Extract form fields
    const name = fields.name?.[0] || 'Untitled IP-NFT';
    const description = fields.description?.[0] || '';
    const ipType = fields.ipType?.[0] || 'Patent';
    const developmentStage = fields.developmentStage?.[0] || 'Concept';
    const valuation = fields.valuation?.[0] || '1000000';
    const filingDate = fields.filingDate?.[0] || new Date().toISOString().split('T')[0];
    const expirationDate = fields.expirationDate?.[0] || '';

    // Check if we have any files
    if (!files || Object.keys(files).length === 0) {
      return sendError(res, 'No files uploaded', 400);
    }

    // Get the main document file
    const fileKey = Object.keys(files)[0];
    const mainFile = files[fileKey];
    
    // Handle both single file and array of files
    const mainDocument = Array.isArray(mainFile) ? mainFile[0] : mainFile;
    
    // Prepare additional documents if there are more files
    const additionalDocuments = [];
    if (Object.keys(files).length > 1 || (Array.isArray(mainFile) && mainFile.length > 1)) {
      // Handle case where files is an object with multiple keys
      for (const key of Object.keys(files)) {
        if (key === fileKey && !Array.isArray(mainFile)) continue; // Skip the main document
        
        const fileOrFiles = files[key];
        if (Array.isArray(fileOrFiles)) {
          // Skip the first file if it's the main document key
          const startIndex = key === fileKey ? 1 : 0;
          for (let i = startIndex; i < fileOrFiles.length; i++) {
            additionalDocuments.push({
              buffer: await readFileAsBuffer(fileOrFiles[i].filepath),
              originalname: fileOrFiles[i].originalFilename || `file-${i}.${fileOrFiles[i].mimetype?.split('/')[1] || 'bin'}`,
              mimetype: fileOrFiles[i].mimetype || 'application/octet-stream',
              description: `Additional document ${additionalDocuments.length + 1}`,
            });
          }
        } else if (key !== fileKey) {
          // It's a single file that's not the main document
          additionalDocuments.push({
            buffer: await readFileAsBuffer(fileOrFiles.filepath),
            originalname: fileOrFiles.originalFilename || `file.${fileOrFiles.mimetype?.split('/')[1] || 'bin'}`,
            mimetype: fileOrFiles.mimetype || 'application/octet-stream',
            description: `Additional document ${additionalDocuments.length + 1}`,
          });
        }
      }
    }

    // Read the main document file as buffer
    const mainDocumentBuffer = await readFileAsBuffer(mainDocument.filepath);

    // Prepare metadata for NFT.Storage
    const metadata: ScientificIPMetadata = {
      name,
      description,
      ipType,
      developmentStage,
      authors: ['Test User'], // This would come from user profile
      filingDate,
      expirationDate: expirationDate || undefined,
      institution: 'Veltis',
    };

    // Store the IP-NFT metadata and files on IPFS
    const ipfsResult = await storeIPNFTMetadata(
      metadata,
      {
        buffer: mainDocumentBuffer,
        originalname: mainDocument.originalFilename || 'document.pdf',
        mimetype: mainDocument.mimetype || 'application/pdf',
      },
      additionalDocuments.length > 0 ? additionalDocuments : undefined
    );

    // Generate a new IPNFT ID
    const ipnftId = uuidv4();

    // Create a timestamp for creation
    const timestamp = new Date().toISOString();

    // Store the IPNFT in the database
    const { data: ipnftData, error: ipnftError } = await supabaseAdmin
      .from('ipnfts')
      .insert({
        id: ipnftId,
        name,
        description,
        ip_type: ipType,
        development_stage: developmentStage,
        status: 'active',
        valuation,
        owner_id: userId,
        ipfs_document_cid: ipfsResult.documentCid,
        ipfs_metadata_uri: ipfsResult.metadataUrl,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .select()
      .single();

    if (ipnftError) {
      console.error('Error storing IPNFT in database:', ipnftError);
      return sendError(res, 'Failed to store IPNFT in database', 500);
    }

    // Create the response
    const response = {
      ipnft: {
        ...ipnftData,
        title: name,
        createdAt: timestamp,
        updatedAt: timestamp,
        is_verified: false,
        verificationLevel: 'pending',
        expiry: expirationDate || new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 20 years from now if not provided
        protection: 'Patent pending',
        stage: developmentStage,
        authors: ['Test User'],
        institution: 'Veltis',
      },
      ipfs: {
        documentUrl: ipfsResult.documentUrl,
        metadataUrl: ipfsResult.metadataUrl,
        additionalDocuments: ipfsResult.additionalDocuments,
      }
    };

    console.log('IP-NFT created:', response.ipnft.id);

    // Return success response
    return res.status(200).json({
      success: true,
      data: response,
      message: 'IP-NFT minted successfully'
    });
  } catch (error) {
    console.error('Error minting IP-NFT:', error);
    return sendError(res, 'Failed to mint IP-NFT', 500);
  }
}

/**
 * Read a file as buffer
 * @param filepath The file path
 * @returns The file buffer
 */
async function readFileAsBuffer(filepath: string): Promise<Buffer> {
  const fs = require('fs').promises;
  return await fs.readFile(filepath);
}

// Wrap the handler with authentication middleware
export default withAuth(handler);

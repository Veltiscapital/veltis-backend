import { NFTStorage, File } from 'nft.storage';
import crypto from 'crypto';

// NFT.Storage API key
const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY || '';

// Create an NFT.Storage client
const client = new NFTStorage({ token: NFT_STORAGE_API_KEY });

/**
 * Store a file on IPFS
 * @param file The file to store
 * @returns The IPFS CID
 */
export async function storeFile(file: Buffer, fileName: string, fileType: string) {
  try {
    // Create a File object
    const nftFile = new File([file], fileName, { type: fileType });

    // Store the file
    const cid = await client.storeBlob(nftFile);

    return {
      cid,
      url: `https://${cid}.ipfs.nftstorage.link`,
    };
  } catch (error) {
    console.error('Error storing file:', error);
    throw new Error('Failed to store file');
  }
}

/**
 * Scientific IP metadata interface
 */
export interface ScientificIPMetadata {
  // Core Descriptors
  name: string;
  description: string;
  abstract?: string;
  keywords?: string[];
  authorCredentials?: string[];
  authors: string[];
  creationDate?: string;
  filingDate: string;
  expirationDate?: string;
  
  // Technical Metadata
  fileFormat?: string;
  fileSize?: number;
  digitalFingerprint?: string; // Hash for verification
  
  // Legal Metadata
  ipOwnership?: string[];
  licensingTerms?: string;
  usageConditions?: string;
  
  // Organizational Metadata
  institution?: string;
  institutionalAffiliations?: string[];
  researcherIdentifiers?: string[];
  
  // Biotech-specific Metadata
  ipType: string; // Patent, Copyright, etc.
  developmentStage: string;
  citationCount?: number;
  marketSize?: number;
  exclusivityScore?: number;
  innovationScore?: number;
  licensingPotential?: number;
  legalStrength?: number;
  
  // Additional properties
  properties?: Record<string, any>;
}

/**
 * Store IP-NFT metadata on IPFS with enhanced scientific metadata
 * @param metadata The scientific metadata to store
 * @param document The document file
 * @param additionalDocuments Optional additional documents
 * @returns The IPFS CID and URLs
 */
export async function storeIPNFTMetadata(
  metadata: ScientificIPMetadata,
  document: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  },
  additionalDocuments?: Array<{
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    description?: string;
  }>
) {
  try {
    // Create a File object for the main document
    const documentFile = new File(
      [document.buffer],
      document.originalname,
      { type: document.mimetype }
    );
    
    // Calculate digital fingerprint if not provided
    if (!metadata.digitalFingerprint) {
      // Create a simple hash of the document using Node.js crypto
      const hash = crypto.createHash('sha256');
      hash.update(document.buffer);
      metadata.digitalFingerprint = hash.digest('hex');
    }
    
    // Set file format and size if not provided
    if (!metadata.fileFormat) {
      metadata.fileFormat = document.mimetype;
    }
    
    if (!metadata.fileSize) {
      metadata.fileSize = document.buffer.length;
    }
    
    // Process additional documents if provided
    const additionalFiles: Record<string, File> = {};
    const additionalFilesMetadata: Record<string, any> = {};
    
    if (additionalDocuments && additionalDocuments.length > 0) {
      additionalDocuments.forEach((doc, index) => {
        const fileName = `additional_${index + 1}_${doc.originalname}`;
        additionalFiles[fileName] = new File(
          [doc.buffer],
          doc.originalname,
          { type: doc.mimetype }
        );
        additionalFilesMetadata[fileName] = {
          name: doc.originalname,
          type: doc.mimetype,
          size: doc.buffer.length,
          description: doc.description || `Additional document ${index + 1}`,
        };
      });
    }

    // Store the NFT metadata with enhanced scientific information
    const result = await client.store({
      name: metadata.name,
      description: metadata.description,
      image: documentFile, // The main document is stored as the image
      
      // FAIR-compliant metadata structure
      properties: {
        // Core Descriptors
        abstract: metadata.abstract || metadata.description,
        keywords: metadata.keywords || [],
        authors: metadata.authors,
        authorCredentials: metadata.authorCredentials || [],
        creationDate: metadata.creationDate || metadata.filingDate,
        filingDate: metadata.filingDate,
        expirationDate: metadata.expirationDate,
        
        // Technical Metadata
        fileFormat: metadata.fileFormat,
        fileSize: metadata.fileSize,
        digitalFingerprint: metadata.digitalFingerprint,
        
        // Legal Metadata
        ipOwnership: metadata.ipOwnership || metadata.authors,
        licensingTerms: metadata.licensingTerms || '',
        usageConditions: metadata.usageConditions || '',
        
        // Organizational Metadata
        institution: metadata.institution || '',
        institutionalAffiliations: metadata.institutionalAffiliations || [],
        researcherIdentifiers: metadata.researcherIdentifiers || [],
        
        // Biotech-specific Metadata
        ipType: metadata.ipType,
        developmentStage: metadata.developmentStage,
        citationCount: metadata.citationCount || 0,
        marketSize: metadata.marketSize || 0,
        exclusivityScore: metadata.exclusivityScore || 0,
        innovationScore: metadata.innovationScore || 0,
        licensingPotential: metadata.licensingPotential || 0,
        legalStrength: metadata.legalStrength || 0,
        
        // Additional documents
        additionalDocuments: additionalFilesMetadata,
        
        // Any other custom properties
        ...metadata.properties,
      },
      
      // Additional files
      ...additionalFiles,
    });

    // Extract document CID from the result
    const documentCid = result.data.image.href.split('//')[1];
    
    // Prepare the response with comprehensive information
    return {
      metadataUrl: result.url,
      metadataCid: result.ipnft,
      documentUrl: `https://${documentCid}`,
      documentCid: documentCid,
      additionalDocuments: additionalDocuments ? additionalDocuments.map((doc, index) => {
        const fileName = `additional_${index + 1}_${doc.originalname}`;
        // Use a safer way to access dynamic properties
        const fileData = Object.entries(result.data).find(([key]) => key === fileName);
        const fileCid = fileData ? (fileData[1] as any).href.split('//')[1] : undefined;
        
        return {
          name: doc.originalname,
          description: doc.description || `Additional document ${index + 1}`,
          url: fileCid ? `https://${fileCid}` : '',
          cid: fileCid || '',
        };
      }) : [],
      timestamp: new Date().toISOString(),
      ipfsGatewayUrl: `https://ipfs.io/ipfs/${result.ipnft}`,
    };
  } catch (error) {
    console.error('Error storing IP-NFT metadata:', error);
    throw new Error('Failed to store IP-NFT metadata');
  }
}

/**
 * Store multiple files on IPFS
 * @param files The files to store
 * @returns The IPFS CIDs
 */
export async function storeFiles(
  files: Array<{
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  }>
) {
  try {
    // Create File objects
    const nftFiles = files.map(
      (file) =>
        new File([file.buffer], file.originalname, { type: file.mimetype })
    );

    // Store the files
    const cid = await client.storeDirectory(nftFiles);

    // Return the CID and URLs for each file
    return {
      directoryCid: cid,
      directoryUrl: `https://${cid}.ipfs.nftstorage.link`,
      files: nftFiles.map((file) => ({
        name: file.name,
        cid: `${cid}/${file.name}`,
        url: `https://${cid}.ipfs.nftstorage.link/${file.name}`,
      })),
    };
  } catch (error) {
    console.error('Error storing files:', error);
    throw new Error('Failed to store files');
  }
}

/**
 * Check the status of a stored file
 * @param cid The IPFS CID
 * @returns The status
 */
export async function checkStatus(cid: string) {
  try {
    const status = await client.status(cid);
    return status;
  } catch (error) {
    console.error('Error checking status:', error);
    throw new Error('Failed to check status');
  }
}

/**
 * Get the IPFS gateway URL for a CID
 * @param cid The IPFS CID
 * @param fileName Optional file name within a directory
 * @returns The IPFS gateway URL
 */
export function getIPFSGatewayURL(cid: string, fileName?: string) {
  if (fileName) {
    return `https://${cid}.ipfs.nftstorage.link/${fileName}`;
  }
  return `https://${cid}.ipfs.nftstorage.link`;
}

/**
 * Store KYC documents on IPFS
 * @param documents The KYC documents
 * @param userId The user ID
 * @returns The IPFS CIDs
 */
export async function storeKYCDocuments(
  documents: Array<{
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    documentType: string;
  }>,
  userId: string
) {
  try {
    // Create File objects
    const nftFiles = documents.map(
      (doc) =>
        new File([doc.buffer], doc.originalname, { type: doc.mimetype })
    );

    // Store the files
    const cid = await client.storeDirectory(nftFiles);

    // Return the CID and URLs for each file
    return {
      directoryCid: cid,
      directoryUrl: `https://${cid}.ipfs.nftstorage.link`,
      documents: documents.map((doc, index) => ({
        name: doc.originalname,
        type: doc.documentType,
        cid: `${cid}/${doc.originalname}`,
        url: `https://${cid}.ipfs.nftstorage.link/${doc.originalname}`,
      })),
    };
  } catch (error) {
    console.error('Error storing KYC documents:', error);
    throw new Error('Failed to store KYC documents');
  }
}

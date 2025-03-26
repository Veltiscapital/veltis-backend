import { Alchemy, Network, AlchemySettings, AlchemySubscription } from 'alchemy-sdk';
import { ethers } from 'ethers';
import { EventEmitter } from 'events';

// Alchemy API key and RPC URL
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || '';
const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL || '';
const ALCHEMY_NETWORK = process.env.ALCHEMY_NETWORK || 'polygon-mainnet';
const IPNFT_CONTRACT_ADDRESS = process.env.IPNFT_CONTRACT_ADDRESS || '';

// Alchemy settings with enhanced options
const settings: AlchemySettings = {
  apiKey: ALCHEMY_API_KEY,
  network: Network.MATIC_MAINNET, // Polygon mainnet
  maxRetries: 5, // Increase reliability with retries
};

// Create an Alchemy instance
export const alchemy = new Alchemy(settings);

// Create an ethers provider
export const provider = ALCHEMY_RPC_URL 
  ? new ethers.providers.JsonRpcProvider(ALCHEMY_RPC_URL)
  : new ethers.providers.AlchemyProvider('matic', ALCHEMY_API_KEY);

// Event emitter for blockchain events
export const blockchainEvents = new EventEmitter();

// Event types
export enum BlockchainEventType {
  NFT_MINTED = 'nft_minted',
  NFT_TRANSFERRED = 'nft_transferred',
  NFT_VALUATION_UPDATED = 'nft_valuation_updated',
  OFFER_CREATED = 'offer_created',
  OFFER_ACCEPTED = 'offer_accepted',
}

// Scientific IP metadata interface
export interface ScientificIPMetadata {
  // Core Descriptors
  title: string;
  abstract: string;
  keywords: string[];
  authorCredentials: string[];
  creationDate: string;
  
  // Technical Metadata
  fileFormat: string;
  fileSize: number;
  digitalFingerprint: string; // Hash for verification
  
  // Legal Metadata
  ipOwnership: string[];
  licensingTerms: string;
  usageConditions: string;
  
  // Organizational Metadata
  institutionalAffiliations: string[];
  researcherIdentifiers: string[];
  
  // Biotech-specific Metadata
  ipType: string; // Patent, Copyright, etc.
  developmentStage: string;
  citationCount: number;
  marketSize: number;
  exclusivityScore: number;
  innovationScore: number;
  licensingPotential: number;
  legalStrength: number;
}

/**
 * Extract a property from an object with a default value
 */
function extractProperty(obj: any, key: string, defaultValue: string): string {
  if (!obj || !obj.properties) {
    return defaultValue;
  }
  
  return obj.properties[key] || obj[key] || defaultValue;
}

/**
 * Extract a number property from an object with a default value
 */
function extractNumberProperty(obj: any, key: string, defaultValue: number): number {
  if (!obj || !obj.properties) {
    return defaultValue;
  }
  
  const value = obj.properties[key] || obj[key];
  return typeof value === 'number' ? value : defaultValue;
}

/**
 * Extract an array property from an object with a default value
 */
function extractArrayProperty(obj: any, key: string, defaultValue: string[]): string[] {
  if (!obj || !obj.properties) {
    return defaultValue;
  }
  
  const value = obj.properties[key] || obj[key];
  return Array.isArray(value) ? value : defaultValue;
}

/**
 * Enhance an NFT with scientific metadata
 */
async function enhanceNFTWithScientificMetadata(nft: any): Promise<any> {
  try {
    // Extract scientific metadata from the NFT's raw metadata
    const rawMetadata = nft.raw?.metadata || {};
    if (!rawMetadata) {
      return nft;
    }

    // Extract scientific metadata fields
    const scientificMetadata: ScientificIPMetadata = {
      // Core Descriptors
      title: rawMetadata.name || '',
      abstract: rawMetadata.description || '',
      keywords: extractArrayProperty(rawMetadata, 'keywords', []),
      authorCredentials: extractArrayProperty(rawMetadata, 'authorCredentials', []),
      creationDate: extractProperty(rawMetadata, 'creationDate', ''),
      
      // Technical Metadata
      fileFormat: extractProperty(rawMetadata, 'fileFormat', ''),
      fileSize: extractNumberProperty(rawMetadata, 'fileSize', 0),
      digitalFingerprint: extractProperty(rawMetadata, 'digitalFingerprint', ''),
      
      // Legal Metadata
      ipOwnership: extractArrayProperty(rawMetadata, 'ipOwnership', []),
      licensingTerms: extractProperty(rawMetadata, 'licensingTerms', ''),
      usageConditions: extractProperty(rawMetadata, 'usageConditions', ''),
      
      // Organizational Metadata
      institutionalAffiliations: extractArrayProperty(rawMetadata, 'institutionalAffiliations', []),
      researcherIdentifiers: extractArrayProperty(rawMetadata, 'researcherIdentifiers', []),
      
      // Biotech-specific Metadata
      ipType: extractProperty(rawMetadata, 'ipType', ''),
      developmentStage: extractProperty(rawMetadata, 'developmentStage', ''),
      citationCount: extractNumberProperty(rawMetadata, 'citationCount', 0),
      marketSize: extractNumberProperty(rawMetadata, 'marketSize', 0),
      exclusivityScore: extractNumberProperty(rawMetadata, 'exclusivityScore', 0),
      innovationScore: extractNumberProperty(rawMetadata, 'innovationScore', 0),
      licensingPotential: extractNumberProperty(rawMetadata, 'licensingPotential', 0),
      legalStrength: extractNumberProperty(rawMetadata, 'legalStrength', 0),
    };

    return {
      ...nft,
      scientificMetadata,
    };
  } catch (error) {
    console.error('Error enhancing NFT with scientific metadata:', error);
    return nft;
  }
}

/**
 * Get IP-NFTs owned by a wallet address with enhanced metadata
 */
export async function getIPNFTsForOwner(
  walletAddress: string, 
  contractAddress?: string,
  pageKey?: string,
  pageSize: number = 20
) {
  try {
    const options: any = {
      contractAddresses: contractAddress ? [contractAddress] : IPNFT_CONTRACT_ADDRESS ? [IPNFT_CONTRACT_ADDRESS] : undefined,
      pageKey: pageKey,
      pageSize: pageSize,
      omitMetadata: false,
      excludeFilters: [],
      tokenUriTimeoutInMs: 10000, // Increase timeout for complex metadata
    };

    const nfts = await alchemy.nft.getNftsForOwner(walletAddress, options);
    
    // Enhance the NFTs with additional metadata
    const enhancedNfts = await Promise.all(
      nfts.ownedNfts.map(async (nft) => {
        return enhanceNFTWithScientificMetadata(nft as any);
      })
    );

    return {
      ...nfts,
      ownedNfts: enhancedNfts,
    };
  } catch (error) {
    console.error('Error fetching IP-NFTs for owner:', error);
    throw new Error('Failed to fetch IP-NFTs for owner');
  }
}

/**
 * Get enhanced IP-NFT metadata with scientific information
 */
export async function getIPNFTMetadata(contractAddress: string, tokenId: string) {
  try {
    // Get the base NFT metadata
    const nft = await alchemy.nft.getNftMetadata(
      contractAddress, 
      tokenId,
      {
        tokenUriTimeoutInMs: 10000, // Increase timeout for complex metadata
      }
    );
    
    // Enhance with scientific metadata
    const enhancedNft = await enhanceNFTWithScientificMetadata(nft as any);
    
    return enhancedNft;
  } catch (error) {
    console.error('Error fetching IP-NFT metadata:', error);
    throw new Error('Failed to fetch IP-NFT metadata');
  }
}

/**
 * Get all IP-NFTs in the registry with pagination
 */
export async function getAllIPNFTs(
  contractAddress?: string,
  pageKey?: string,
  pageSize: number = 20
) {
  try {
    const options: any = {
      contractAddresses: contractAddress ? [contractAddress] : IPNFT_CONTRACT_ADDRESS ? [IPNFT_CONTRACT_ADDRESS] : undefined,
      pageKey: pageKey,
      pageSize: pageSize,
      omitMetadata: false,
    };

    const nfts = await alchemy.nft.getNftsForContract(
      contractAddress || IPNFT_CONTRACT_ADDRESS || '',
      options
    );
    
    // Enhance the NFTs with additional metadata
    const enhancedNfts = await Promise.all(
      nfts.nfts.map(async (nft) => {
        // Cast to any to avoid type errors
        return enhanceNFTWithScientificMetadata(nft as any);
      })
    );

    return {
      ...nfts,
      nfts: enhancedNfts,
    };
  } catch (error) {
    console.error('Error fetching all IP-NFTs:', error);
    throw new Error('Failed to fetch all IP-NFTs');
  }
}

/**
 * Get comprehensive IP-NFT transfer history with enhanced metadata
 */
export async function getIPNFTTransferHistory(
  walletAddress?: string,
  contractAddress?: string,
  tokenId?: string,
  maxCount: number = 100
) {
  try {
    const options: any = {
      fromBlock: '0x0',
      toBlock: 'latest',
      category: ['erc721', 'erc1155'],
      withMetadata: true,
      excludeZeroValue: true,
      maxCount: maxCount,
    };

    // Add contract address filter
    if (contractAddress) {
      options.contractAddresses = [contractAddress];
    } else if (IPNFT_CONTRACT_ADDRESS) {
      options.contractAddresses = [IPNFT_CONTRACT_ADDRESS];
    }

    let transfers = [];

    if (walletAddress) {
      // Get transfers from the wallet
      const fromTransfers = await alchemy.core.getAssetTransfers({
        ...options,
        fromAddress: walletAddress,
      });

      // Get transfers to the wallet
      const toTransfers = await alchemy.core.getAssetTransfers({
        ...options,
        toAddress: walletAddress,
      });

      // Combine the transfers
      transfers = [
        ...(fromTransfers.transfers || []),
        ...(toTransfers.transfers || []),
      ];
    } else {
      // Get all transfers for the contract
      const allTransfers = await alchemy.core.getAssetTransfers(options);
      transfers = allTransfers.transfers || [];
    }

    // Filter by token ID if provided
    if (tokenId) {
      const tokenIdBN = ethers.BigNumber.from(tokenId);
      transfers = transfers.filter(transfer => {
        if (!transfer.tokenId) return false;
        try {
          const transferTokenId = ethers.BigNumber.from(transfer.tokenId);
          return transferTokenId.eq(tokenIdBN);
        } catch (error) {
          return false;
        }
      });
    }

    // Sort by block number (descending)
    transfers.sort((a, b) => {
      const blockA = parseInt(a.blockNum.toString(), 16);
      const blockB = parseInt(b.blockNum.toString(), 16);
      return blockB - blockA;
    });

    // Enhance transfers with additional metadata
    const enhancedTransfers = await Promise.all(
      transfers.map(async (transfer) => {
        // Only enhance ERC721/ERC1155 transfers with valid token IDs
        if (
          (transfer.category === 'erc721' || transfer.category === 'erc1155') &&
          transfer.tokenId
        ) {
          try {
            // Get the NFT metadata
            const tokenIdStr = transfer.tokenId ? ethers.BigNumber.from(transfer.tokenId).toString() : '0';
            const contractAddress = transfer.rawContract.address;
            
            if (contractAddress && tokenIdStr) {
              const nftMetadata = await getIPNFTMetadata(
                contractAddress,
                tokenIdStr
              );
              
              return {
                ...transfer,
                enhancedMetadata: nftMetadata,
              };
            }
            
            return transfer;
          } catch (error) {
            console.error('Error enhancing transfer with metadata:', error);
            return transfer;
          }
        }
        return transfer;
      })
    );

    return {
      transfers: enhancedTransfers,
      pageKey: null, // For pagination in future enhancements
    };
  } catch (error) {
    console.error('Error fetching IP-NFT transfer history:', error);
    throw new Error('Failed to fetch IP-NFT transfer history');
  }
}

/**
 * Get ownership provenance for an IP-NFT
 */
export async function getIPNFTOwnershipProvenance(
  contractAddress: string,
  tokenId: string
) {
  try {
    // Get all transfers for this specific token
    const options: any = {
      fromBlock: '0x0',
      toBlock: 'latest',
      category: ['erc721', 'erc1155'],
      contractAddresses: [contractAddress],
      withMetadata: true,
      excludeZeroValue: true,
    };
    
    const transfers = await alchemy.core.getAssetTransfers(options);
    
    // Filter by token ID
    const tokenIdBN = ethers.BigNumber.from(tokenId);
    const filteredTransfers = transfers.transfers.filter(transfer => {
      if (!transfer.tokenId) return false;
      try {
        const transferTokenId = ethers.BigNumber.from(transfer.tokenId);
        return transferTokenId.eq(tokenIdBN);
      } catch (error) {
        return false;
      }
    });

    // Sort transfers by block number (ascending for chronological order)
    const sortedTransfers = [...filteredTransfers].sort((a, b) => {
      const blockA = parseInt(a.blockNum.toString(), 16);
      const blockB = parseInt(b.blockNum.toString(), 16);
      return blockA - blockB;
    });
    
    // Process the transfers to create a provenance chain
    const provenanceChain = [];
    let currentOwner = null;

    for (const transfer of sortedTransfers) {
      // For minting events, the from address is often zero
      const isMintEvent = transfer.from === '0x0000000000000000000000000000000000000000';
      
      provenanceChain.push({
        timestamp: new Date(transfer.metadata.blockTimestamp).getTime(),
        blockNumber: parseInt(transfer.blockNum.toString(), 16),
        transactionHash: transfer.hash,
        from: isMintEvent ? 'Minting' : transfer.from,
        to: transfer.to,
        type: isMintEvent ? 'Mint' : 'Transfer',
      });

      currentOwner = transfer.to;
    }

    return {
      tokenId,
      contractAddress,
      currentOwner,
      provenanceChain,
    };
  } catch (error) {
    console.error('Error fetching IP-NFT ownership provenance:', error);
    throw new Error('Failed to fetch IP-NFT ownership provenance');
  }
}

/**
 * Set up comprehensive real-time event monitoring for IP-NFTs
 */
export function setupIPNFTEventMonitoring(contractAddress?: string) {
  try {
    const targetContract = contractAddress || IPNFT_CONTRACT_ADDRESS;
    if (!targetContract) {
      throw new Error('No contract address provided for event monitoring');
    }

    // Set up listeners for different event types
    
    // 1. NFT Transfer events
    const transferListener = alchemy.ws.on(
      {
        address: targetContract,
        topics: [
          ethers.utils.id('Transfer(address,address,uint256)'), // ERC-721 Transfer event
        ],
      },
      async (log) => {
        try {
          // Parse the event data
          const eventInterface = new ethers.utils.Interface([
            'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
          ]);
          const parsedLog = eventInterface.parseLog(log);
          
          const from = parsedLog.args.from;
          const to = parsedLog.args.to;
          const tokenId = parsedLog.args.tokenId.toString();
          
          // Check if this is a mint event (from zero address)
          const isMint = from === '0x0000000000000000000000000000000000000000';
          
          // Get the token metadata
          const metadata = await getIPNFTMetadata(targetContract, tokenId);
          
          // Emit the appropriate event
          if (isMint) {
            blockchainEvents.emit(BlockchainEventType.NFT_MINTED, {
              tokenId,
              to,
              metadata,
              transactionHash: log.transactionHash,
              blockNumber: log.blockNumber,
              timestamp: Date.now(),
            });
          } else {
            blockchainEvents.emit(BlockchainEventType.NFT_TRANSFERRED, {
              tokenId,
              from,
              to,
              metadata,
              transactionHash: log.transactionHash,
              blockNumber: log.blockNumber,
              timestamp: Date.now(),
            });
          }
        } catch (error) {
          console.error('Error processing transfer event:', error);
        }
      }
    );
    
    // Return a cleanup function to remove all listeners
    return () => {
      alchemy.ws.removeAllListeners();
    };
  } catch (error) {
    console.error('Error setting up IP-NFT event monitoring:', error);
    throw new Error('Failed to set up IP-NFT event monitoring');
  }
}

/**
 * Create a wallet from a private key
 */
export function createWallet(privateKey: string) {
  try {
    return new ethers.Wallet(privateKey, provider);
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw new Error('Failed to create wallet');
  }
}

/**
 * Get the gas price
 */
export async function getGasPrice() {
  try {
    return await provider.getGasPrice();
  } catch (error) {
    console.error('Error getting gas price:', error);
    throw new Error('Failed to get gas price');
  }
}

/**
 * Estimate the gas for a transaction
 */
export async function estimateGas(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>) {
  try {
    return await provider.estimateGas(transaction);
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw new Error('Failed to estimate gas');
  }
}

/**
 * Send a transaction
 */
export async function sendTransaction(
  wallet: ethers.Wallet,
  to: string,
  data: string,
  value: ethers.BigNumber = ethers.BigNumber.from(0)
) {
  try {
    // Get the gas price
    const gasPrice = await getGasPrice();

    // Create the transaction
    const tx = {
      to,
      data,
      value,
      gasPrice,
    };

    // Estimate the gas
    const gasLimit = await estimateGas(tx);

    // Send the transaction
    const transaction = await wallet.sendTransaction({
      ...tx,
      gasLimit,
    });

    // Wait for the transaction to be mined
    const receipt = await transaction.wait();

    return receipt;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw new Error('Failed to send transaction');
  }
}

/**
 * Wait for a transaction to be mined
 */
export async function waitForTransaction(txHash: string, confirmations = 1) {
  try {
    return await provider.waitForTransaction(txHash, confirmations);
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    throw new Error('Failed to wait for transaction');
  }
}

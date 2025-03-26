import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a Supabase client with the service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Create a Supabase client with the anon key for public operations
export const supabasePublic = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY || ''
);

/**
 * Get a Supabase client with a user's JWT token
 * @param token The user's JWT token
 * @returns A Supabase client with the user's JWT token
 */
export function getSupabaseClient(token: string) {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

/**
 * Get a user by their ID
 * @param userId The user's ID
 * @returns The user
 */
export async function getUserById(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }

  return data;
}

/**
 * Get a user by their wallet address
 * @param walletAddress The user's wallet address
 * @returns The user
 */
export async function getUserByWalletAddress(walletAddress: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (error) {
    console.error('Error fetching user by wallet address:', error);
    throw new Error('Failed to fetch user by wallet address');
  }

  return data;
}

/**
 * Create a new user
 * @param user The user to create
 * @returns The created user
 */
export async function createUser(user: {
  email?: string;
  name?: string;
  wallet_address: string;
  smart_account_address?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      email: user.email,
      name: user.name,
      wallet_address: user.wallet_address,
      smart_account_address: user.smart_account_address,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }

  return data;
}

/**
 * Update a user
 * @param userId The user's ID
 * @param user The user data to update
 * @returns The updated user
 */
export async function updateUser(
  userId: string,
  user: {
    email?: string;
    name?: string;
    wallet_address?: string;
    smart_account_address?: string;
    kyc_status?: string;
    kyc_submission_date?: string;
    kyc_document_references?: any;
    terms_accepted?: boolean;
    terms_accepted_date?: string;
  }
) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      ...user,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }

  return data;
}

/**
 * Get IP-NFTs by owner ID
 * @param ownerId The owner's ID
 * @returns The IP-NFTs
 */
export async function getIPNFTsByOwnerId(ownerId: string) {
  const { data, error } = await supabaseAdmin
    .from('ipnfts')
    .select('*')
    .eq('owner_id', ownerId);

  if (error) {
    console.error('Error fetching IP-NFTs by owner ID:', error);
    throw new Error('Failed to fetch IP-NFTs by owner ID');
  }

  return data;
}

/**
 * Get an IP-NFT by ID
 * @param id The IP-NFT ID
 * @returns The IP-NFT
 */
export async function getIPNFTById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('ipnfts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching IP-NFT by ID:', error);
    throw new Error('Failed to fetch IP-NFT by ID');
  }

  return data;
}

/**
 * Create a new IP-NFT
 * @param ipnft The IP-NFT to create
 * @returns The created IP-NFT
 */
export async function createIPNFT(ipnft: {
  owner_id: string;
  title: string;
  description: string;
  authors: string[];
  institution?: string;
  filing_date: string;
  ip_type: string;
  development_stage: string;
  ipfs_document_cid: string;
  ipfs_metadata_uri: string;
  valuation: number;
  citation_count?: number;
  market_size?: number;
  exclusivity_score?: number;
  innovation_score?: number;
  licensing_potential?: number;
  legal_strength?: number;
}) {
  const { data, error } = await supabaseAdmin
    .from('ipnfts')
    .insert({
      ...ipnft,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating IP-NFT:', error);
    throw new Error('Failed to create IP-NFT');
  }

  return data;
}

/**
 * Update an IP-NFT
 * @param id The IP-NFT ID
 * @param ipnft The IP-NFT data to update
 * @returns The updated IP-NFT
 */
export async function updateIPNFT(
  id: string,
  ipnft: {
    owner_id?: string;
    title?: string;
    description?: string;
    authors?: string[];
    institution?: string;
    filing_date?: string;
    ip_type?: string;
    development_stage?: string;
    ipfs_document_cid?: string;
    ipfs_metadata_uri?: string;
    valuation?: number;
    citation_count?: number;
    market_size?: number;
    exclusivity_score?: number;
    innovation_score?: number;
    licensing_potential?: number;
    legal_strength?: number;
  }
) {
  const { data, error } = await supabaseAdmin
    .from('ipnfts')
    .update({
      ...ipnft,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating IP-NFT:', error);
    throw new Error('Failed to update IP-NFT');
  }

  return data;
}

/**
 * Get marketplace listings
 * @param limit The maximum number of listings to return
 * @param offset The number of listings to skip
 * @returns The marketplace listings
 */
export async function getMarketplaceListings(limit = 10, offset = 0) {
  const { data, error } = await supabaseAdmin
    .from('listings')
    .select(`
      *,
      ipnft:ipnfts(*),
      seller:users(id, name, wallet_address)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching marketplace listings:', error);
    throw new Error('Failed to fetch marketplace listings');
  }

  return data;
}

/**
 * Get marketplace offers for a user
 * @param userId The user's ID
 * @returns The marketplace offers
 */
export async function getMarketplaceOffers(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('offers')
    .select(`
      *,
      listing:listings(*),
      buyer:users(id, name, wallet_address)
    `)
    .eq('listing.seller_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching marketplace offers:', error);
    throw new Error('Failed to fetch marketplace offers');
  }

  return data;
}

/**
 * Create a new marketplace listing
 * @param listing The listing to create
 * @returns The created listing
 */
export async function createMarketplaceListing(listing: {
  ipnft_id: string;
  seller_id: string;
  price: number;
  currency?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('listings')
    .insert({
      ...listing,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating marketplace listing:', error);
    throw new Error('Failed to create marketplace listing');
  }

  return data;
}

/**
 * Create a new marketplace offer
 * @param offer The offer to create
 * @returns The created offer
 */
export async function createMarketplaceOffer(offer: {
  listing_id: string;
  buyer_id: string;
  amount: number;
  currency?: string;
  expiration_date?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('offers')
    .insert({
      ...offer,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating marketplace offer:', error);
    throw new Error('Failed to create marketplace offer');
  }

  return data;
}

/**
 * Accept a marketplace offer
 * @param offerId The offer ID
 * @returns The accepted offer
 */
export async function acceptMarketplaceOffer(offerId: string) {
  // Start a transaction
  const { data: offer, error: offerError } = await supabaseAdmin
    .from('offers')
    .select(`
      *,
      listing:listings(*)
    `)
    .eq('id', offerId)
    .single();

  if (offerError) {
    console.error('Error fetching offer:', offerError);
    throw new Error('Failed to fetch offer');
  }

  // Update the offer status
  const { error: updateOfferError } = await supabaseAdmin
    .from('offers')
    .update({
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', offerId);

  if (updateOfferError) {
    console.error('Error updating offer:', updateOfferError);
    throw new Error('Failed to update offer');
  }

  // Update the listing status
  const { error: updateListingError } = await supabaseAdmin
    .from('listings')
    .update({
      status: 'sold',
      updated_at: new Date().toISOString(),
    })
    .eq('id', offer.listing_id);

  if (updateListingError) {
    console.error('Error updating listing:', updateListingError);
    throw new Error('Failed to update listing');
  }

  // Update the IP-NFT owner
  const { error: updateIPNFTError } = await supabaseAdmin
    .from('ipnfts')
    .update({
      owner_id: offer.buyer_id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', offer.listing.ipnft_id);

  if (updateIPNFTError) {
    console.error('Error updating IP-NFT:', updateIPNFTError);
    throw new Error('Failed to update IP-NFT');
  }

  // Create a transaction record
  const { data: transaction, error: transactionError } = await supabaseAdmin
    .from('transactions')
    .insert({
      ipnft_id: offer.listing.ipnft_id,
      seller_id: offer.listing.seller_id,
      buyer_id: offer.buyer_id,
      amount: offer.amount,
      currency: offer.currency || 'MATIC',
      transaction_type: 'sale',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (transactionError) {
    console.error('Error creating transaction:', transactionError);
    throw new Error('Failed to create transaction');
  }

  return transaction;
}

/**
 * Get consulting services
 * @returns The consulting services
 */
export async function getConsultingServices() {
  const { data, error } = await supabaseAdmin
    .from('consulting_services')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching consulting services:', error);
    throw new Error('Failed to fetch consulting services');
  }

  return data;
}

/**
 * Create a new consulting booking
 * @param booking The booking to create
 * @returns The created booking
 */
export async function createConsultingBooking(booking: {
  client_id: string;
  service_type: string;
  description: string;
  scheduled_at: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('consultations')
    .insert({
      ...booking,
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating consulting booking:', error);
    throw new Error('Failed to create consulting booking');
  }

  return data;
}

/**
 * Get consulting bookings for a user
 * @param userId The user's ID
 * @returns The consulting bookings
 */
export async function getConsultingBookings(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('consultations')
    .select('*')
    .eq('client_id', userId)
    .order('scheduled_at', { ascending: true });

  if (error) {
    console.error('Error fetching consulting bookings:', error);
    throw new Error('Failed to fetch consulting bookings');
  }

  return data;
}

/**
 * Get market analytics
 * @returns The market analytics
 */
export async function getMarketAnalytics() {
  // Get the total number of IP-NFTs
  const { count: totalIPNFTs, error: totalIPNFTsError } = await supabaseAdmin
    .from('ipnfts')
    .select('*', { count: 'exact', head: true });

  if (totalIPNFTsError) {
    console.error('Error fetching total IP-NFTs:', totalIPNFTsError);
    throw new Error('Failed to fetch total IP-NFTs');
  }

  // Get the total number of transactions
  const { count: totalTransactions, error: totalTransactionsError } =
    await supabaseAdmin
      .from('transactions')
      .select('*', { count: 'exact', head: true });

  if (totalTransactionsError) {
    console.error(
      'Error fetching total transactions:',
      totalTransactionsError
    );
    throw new Error('Failed to fetch total transactions');
  }

  // Get the total transaction volume
  const { data: transactionVolume, error: transactionVolumeError } =
    await supabaseAdmin.from('transactions').select('amount').eq('currency', 'MATIC');

  if (transactionVolumeError) {
    console.error(
      'Error fetching transaction volume:',
      transactionVolumeError
    );
    throw new Error('Failed to fetch transaction volume');
  }

  const totalVolume = transactionVolume.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );

  // Get the average valuation
  const { data: valuations, error: valuationsError } = await supabaseAdmin
    .from('ipnfts')
    .select('valuation');

  if (valuationsError) {
    console.error('Error fetching valuations:', valuationsError);
    throw new Error('Failed to fetch valuations');
  }

  const totalValuation = valuations.reduce(
    (acc, ipnft) => acc + ipnft.valuation,
    0
  );
  const averageValuation =
    valuations.length > 0 ? totalValuation / valuations.length : 0;

  // Get the IP types distribution
  const { data: ipTypes, error: ipTypesError } = await supabaseAdmin
    .from('ipnfts')
    .select('ip_type');

  if (ipTypesError) {
    console.error('Error fetching IP types:', ipTypesError);
    throw new Error('Failed to fetch IP types');
  }

  const ipTypesDistribution = ipTypes.reduce(
    (acc: { [key: string]: number }, ipnft) => {
      acc[ipnft.ip_type] = (acc[ipnft.ip_type] || 0) + 1;
      return acc;
    },
    {}
  );

  // Get the development stages distribution
  const { data: developmentStages, error: developmentStagesError } =
    await supabaseAdmin.from('ipnfts').select('development_stage');

  if (developmentStagesError) {
    console.error(
      'Error fetching development stages:',
      developmentStagesError
    );
    throw new Error('Failed to fetch development stages');
  }

  const developmentStagesDistribution = developmentStages.reduce(
    (acc: { [key: string]: number }, ipnft) => {
      acc[ipnft.development_stage] = (acc[ipnft.development_stage] || 0) + 1;
      return acc;
    },
    {}
  );

  return {
    total_ipnfts: totalIPNFTs,
    total_transactions: totalTransactions,
    total_volume: totalVolume,
    average_valuation: averageValuation,
    ip_types_distribution: ipTypesDistribution,
    development_stages_distribution: developmentStagesDistribution,
  };
}

/**
 * Create a new nonce for wallet authentication
 * @param walletAddress The wallet address
 * @returns The nonce
 */
export async function createNonce(walletAddress: string): Promise<string> {
  // Generate a random nonce
  const nonce = Math.floor(Math.random() * 1000000).toString();
  const timestamp = Date.now();
  
  // Increase expiry time to 15 minutes for development
  const expiryTime = timestamp + 15 * 60 * 1000;
  
  // First, try to delete any existing nonce for this wallet
  try {
    await supabaseAdmin
      .from('nonces')
      .delete()
      .eq('wallet_address', walletAddress);
    
    console.log(`Deleted existing nonce for wallet: ${walletAddress}`);
  } catch (deleteError) {
    console.error('Error deleting existing nonce:', deleteError);
    // Continue anyway, as the record might not exist
  }
  
  // Add retry logic with exponential backoff
  let retries = 3;
  while (retries > 0) {
    try {
      const { error } = await supabaseAdmin
        .from('nonces')
        .insert({
          wallet_address: walletAddress,
          nonce,
          created_at: new Date(timestamp).toISOString(),
          expires_at: new Date(expiryTime).toISOString() // 15 minutes expiry
        });
      
      if (error) {
        console.error('Error creating nonce (attempt ' + (4 - retries) + '):', error);
        throw error;
      }
      
      return nonce;
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error('Failed to create nonce after multiple attempts:', error);
        throw new Error('Failed to create nonce after multiple attempts');
      }
      // Wait before retrying (exponential backoff)
      await new Promise(res => setTimeout(res, 1000 * Math.pow(2, 3 - retries)));
    }
  }
  
  throw new Error('Failed to create nonce');
}

/**
 * Get a nonce for a wallet address
 * @param walletAddress The wallet address
 * @returns The nonce
 */
export async function getNonce(walletAddress: string): Promise<string | null> {
  // Add retry logic with exponential backoff
  let retries = 3;
  while (retries > 0) {
    try {
      const { data, error } = await supabaseAdmin
        .from('nonces')
        .select('nonce, expires_at')
        .eq('wallet_address', walletAddress)
        .single();
      
      if (error) {
        console.error('Error fetching nonce (attempt ' + (4 - retries) + '):', error);
        throw error;
      }
      
      // Check if the nonce is expired
      if (new Date(data.expires_at) < new Date()) {
        console.log('Nonce expired for wallet:', walletAddress);
        
        // Delete the expired nonce
        try {
          await supabaseAdmin
            .from('nonces')
            .delete()
            .eq('wallet_address', walletAddress);
          
          console.log(`Deleted expired nonce for wallet: ${walletAddress}`);
        } catch (deleteError) {
          console.error('Error deleting expired nonce:', deleteError);
        }
        
        return null;
      }
      
      return data.nonce;
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error('Failed to fetch nonce after multiple attempts:', error);
        return null;
      }
      // Wait before retrying (exponential backoff)
      await new Promise(res => setTimeout(res, 1000 * Math.pow(2, 3 - retries)));
    }
  }
  
  return null;
}

/**
 * Delete a nonce for a wallet address
 * @param walletAddress The wallet address
 */
export async function deleteNonce(walletAddress: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('nonces')
    .delete()
    .eq('wallet_address', walletAddress);
  
  if (error) {
    console.error('Error deleting nonce:', error);
    throw new Error('Failed to delete nonce');
  }
}

/**
 * Get portfolio analytics for a user
 * @param userId The user's ID
 * @returns The portfolio analytics
 */
export async function getPortfolioAnalytics(userId: string) {
  // Get the user's IP-NFTs
  const { data: ipnfts, error: ipnftsError } = await supabaseAdmin
    .from('ipnfts')
    .select('*')
    .eq('owner_id', userId);

  if (ipnftsError) {
    console.error('Error fetching IP-NFTs:', ipnftsError);
    throw new Error('Failed to fetch IP-NFTs');
  }

  // Get the user's transactions
  const { data: transactions, error: transactionsError } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`);

  if (transactionsError) {
    console.error('Error fetching transactions:', transactionsError);
    throw new Error('Failed to fetch transactions');
  }

  // Calculate the total portfolio value
  const totalPortfolioValue = ipnfts.reduce(
    (acc, ipnft) => acc + ipnft.valuation,
    0
  );

  // Calculate the total transaction volume
  const totalTransactionVolume = transactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );

  // Calculate the IP types distribution
  const ipTypesDistribution = ipnfts.reduce(
    (acc: { [key: string]: number }, ipnft) => {
      acc[ipnft.ip_type] = (acc[ipnft.ip_type] || 0) + 1;
      return acc;
    },
    {}
  );

  // Calculate the development stages distribution
  const developmentStagesDistribution = ipnfts.reduce(
    (acc: { [key: string]: number }, ipnft) => {
      acc[ipnft.development_stage] = (acc[ipnft.development_stage] || 0) + 1;
      return acc;
    },
    {}
  );

  return {
    total_ipnfts: ipnfts.length,
    total_portfolio_value: totalPortfolioValue,
    total_transaction_volume: totalTransactionVolume,
    ip_types_distribution: ipTypesDistribution,
    development_stages_distribution: developmentStagesDistribution,
    ipnfts,
    transactions,
  };
}

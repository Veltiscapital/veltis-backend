-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop all tables using CASCADE
DROP TABLE IF EXISTS fractionalized_tokens CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS ipnfts CASCADE;
DROP TABLE IF EXISTS users CASCADE; -- This will drop projects and investments tables too
DROP TABLE IF EXISTS nonces CASCADE;

-- Now recreate all tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE,
  smart_account_address TEXT UNIQUE,
  name TEXT,
  email TEXT,
  institution TEXT,
  role TEXT,
  kyc_status TEXT DEFAULT 'not_submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate the other tables as in the previous script
CREATE TABLE IF NOT EXISTS nonces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  nonce TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '15 minutes'
);

CREATE TABLE IF NOT EXISTS ipnfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id),
  token_id TEXT,
  contract_address TEXT,
  title TEXT NOT NULL,
  description TEXT,
  authors TEXT[],
  institution TEXT,
  filing_date TIMESTAMP WITH TIME ZONE,
  expiration_date TIMESTAMP WITH TIME ZONE,
  ip_type TEXT,
  development_stage TEXT,
  ipfs_document_cid TEXT,
  ipfs_metadata_uri TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  valuation DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listings table for marketplace
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ipnft_id UUID REFERENCES ipnfts(id),
  seller_id UUID REFERENCES users(id),
  price DECIMAL NOT NULL,
  currency TEXT DEFAULT 'MATIC',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id),
  buyer_id UUID REFERENCES users(id),
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'MATIC',
  status TEXT DEFAULT 'pending',
  expiration_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ipnft_id UUID REFERENCES ipnfts(id),
  seller_id UUID REFERENCES users(id),
  buyer_id UUID REFERENCES users(id),
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'MATIC',
  transaction_type TEXT NOT NULL,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fractionalization table
CREATE TABLE IF NOT EXISTS fractionalized_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ipnft_id UUID REFERENCES ipnfts(id),
  token_contract_address TEXT NOT NULL,
  token_name TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  total_supply DECIMAL NOT NULL,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create IP asset table (for backward compatibility)
CREATE TABLE IF NOT EXISTS ip_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  patent_id TEXT UNIQUE,
  ipfs_cid TEXT,
  token_id TEXT UNIQUE,
  owner_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consulting services table
CREATE TABLE IF NOT EXISTS consulting_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  service_id UUID REFERENCES consulting_services(id),
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IMPORTANT: Recreate the projects and investments tables
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  -- Add other columns as needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  -- Add other columns as needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test user
CREATE OR REPLACE FUNCTION create_test_user()
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  INSERT INTO users (
    wallet_address,
    name,
    email,
    institution,
    role,
    kyc_status
  ) VALUES (
    '0x692973E3260E0ABD3ffBd9b8F29aAb57E2A4C0Ee',
    'Test User',
    'test@veltis.com',
    'Veltis Research',
    'researcher',
    'approved'
  )
  ON CONFLICT (wallet_address) 
  DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email
  RETURNING id INTO user_id;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create test user
SELECT create_test_user();

-- Print message confirming database initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialized successfully with all required tables.';
END $$; 
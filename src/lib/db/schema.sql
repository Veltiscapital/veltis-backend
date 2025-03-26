-- Create nonces table for wallet authentication
CREATE TABLE IF NOT EXISTS nonces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE,
  nonce TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT,
  wallet_address TEXT UNIQUE,
  smart_account_address TEXT UNIQUE,
  institution TEXT,
  role TEXT,
  kyc_status TEXT DEFAULT 'not_submitted',
  kyc_submission_date TIMESTAMP WITH TIME ZONE,
  kyc_document_references JSONB,
  terms_accepted BOOLEAN DEFAULT FALSE,
  terms_accepted_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create IP-NFTs table
CREATE TABLE IF NOT EXISTS ipnfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id),
  token_id TEXT,
  contract_address TEXT,
  title TEXT,
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
  verification_date TIMESTAMP WITH TIME ZONE,
  verifier_id UUID REFERENCES users(id),
  valuation DECIMAL,
  citation_count INTEGER DEFAULT 0,
  market_size DECIMAL,
  exclusivity_score DECIMAL,
  innovation_score DECIMAL,
  licensing_potential DECIMAL,
  legal_strength DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ipnft_id UUID REFERENCES ipnfts(id),
  seller_id UUID REFERENCES users(id),
  price DECIMAL,
  currency TEXT DEFAULT 'MATIC',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id),
  buyer_id UUID REFERENCES users(id),
  amount DECIMAL,
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
  amount DECIMAL,
  currency TEXT DEFAULT 'MATIC',
  transaction_hash TEXT,
  block_number BIGINT,
  transaction_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create valuations table (historical)
CREATE TABLE IF NOT EXISTS valuations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ipnft_id UUID REFERENCES ipnfts(id),
  value DECIMAL,
  valuation_method TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consulting services table
CREATE TABLE IF NOT EXISTS consulting_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  description TEXT,
  price DECIMAL,
  currency TEXT DEFAULT 'MATIC',
  duration INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id),
  service_type TEXT,
  description TEXT,
  status TEXT DEFAULT 'scheduled',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT,
  title TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies

-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- IP-NFTs table policies
ALTER TABLE ipnfts ENABLE ROW LEVEL SECURITY;

CREATE POLICY ipnfts_select_all ON ipnfts
  FOR SELECT
  USING (true);

CREATE POLICY ipnfts_insert_own ON ipnfts
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY ipnfts_update_own ON ipnfts
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Listings table policies
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY listings_select_all ON listings
  FOR SELECT
  USING (true);

CREATE POLICY listings_insert_own ON listings
  FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY listings_update_own ON listings
  FOR UPDATE
  USING (auth.uid() = seller_id);

-- Offers table policies
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY offers_select_own ON offers
  FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() IN (
    SELECT seller_id FROM listings WHERE id = listing_id
  ));

CREATE POLICY offers_insert_own ON offers
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY offers_update_own ON offers
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT seller_id FROM listings WHERE id = listing_id
  ));

-- Transactions table policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY transactions_select_own ON transactions
  FOR SELECT
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Valuations table policies
ALTER TABLE valuations ENABLE ROW LEVEL SECURITY;

CREATE POLICY valuations_select_all ON valuations
  FOR SELECT
  USING (true);

-- Consulting services table policies
ALTER TABLE consulting_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY consulting_services_select_all ON consulting_services
  FOR SELECT
  USING (true);

-- Consultations table policies
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY consultations_select_own ON consultations
  FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY consultations_insert_own ON consultations
  FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY consultations_update_own ON consultations
  FOR UPDATE
  USING (auth.uid() = client_id);

-- Notifications table policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select_own ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for ipnfts table
CREATE TRIGGER update_ipnfts_updated_at
BEFORE UPDATE ON ipnfts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for listings table
CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for offers table
CREATE TRIGGER update_offers_updated_at
BEFORE UPDATE ON offers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for consulting_services table
CREATE TRIGGER update_consulting_services_updated_at
BEFORE UPDATE ON consulting_services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for consultations table
CREATE TRIGGER update_consultations_updated_at
BEFORE UPDATE ON consultations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to create a notification when an IP-NFT is created
CREATE OR REPLACE FUNCTION create_ipnft_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.owner_id,
    'ipnft_created',
    'IP-NFT Created',
    'Your IP-NFT "' || NEW.title || '" has been created.',
    jsonb_build_object('ipnft_id', NEW.id, 'title', NEW.title)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ipnfts table
CREATE TRIGGER create_ipnft_notification_trigger
AFTER INSERT ON ipnfts
FOR EACH ROW
EXECUTE FUNCTION create_ipnft_notification();

-- Function to create a notification when an offer is created
CREATE OR REPLACE FUNCTION create_offer_notification()
RETURNS TRIGGER AS $$
DECLARE
  seller_id UUID;
  listing_title TEXT;
BEGIN
  -- Get the seller ID and listing title
  SELECT l.seller_id, i.title INTO seller_id, listing_title
  FROM listings l
  JOIN ipnfts i ON l.ipnft_id = i.id
  WHERE l.id = NEW.listing_id;

  -- Create a notification for the seller
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    seller_id,
    'offer_received',
    'Offer Received',
    'You have received an offer for "' || listing_title || '".',
    jsonb_build_object('offer_id', NEW.id, 'listing_id', NEW.listing_id, 'amount', NEW.amount)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for offers table
CREATE TRIGGER create_offer_notification_trigger
AFTER INSERT ON offers
FOR EACH ROW
EXECUTE FUNCTION create_offer_notification();

-- Function to create a notification when an offer is accepted
CREATE OR REPLACE FUNCTION create_offer_accepted_notification()
RETURNS TRIGGER AS $$
DECLARE
  buyer_id UUID;
  listing_title TEXT;
BEGIN
  -- Only proceed if the status changed to 'accepted'
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Get the buyer ID and listing title
    SELECT o.buyer_id, i.title INTO buyer_id, listing_title
    FROM offers o
    JOIN listings l ON o.listing_id = l.id
    JOIN ipnfts i ON l.ipnft_id = i.id
    WHERE o.id = NEW.id;

    -- Create a notification for the buyer
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      buyer_id,
      'offer_accepted',
      'Offer Accepted',
      'Your offer for "' || listing_title || '" has been accepted.',
      jsonb_build_object('offer_id', NEW.id, 'listing_id', NEW.listing_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for offers table
CREATE TRIGGER create_offer_accepted_notification_trigger
AFTER UPDATE ON offers
FOR EACH ROW
EXECUTE FUNCTION create_offer_accepted_notification();

-- Function to create a notification when a consultation is scheduled
CREATE OR REPLACE FUNCTION create_consultation_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.client_id,
    'consultation_scheduled',
    'Consultation Scheduled',
    'Your consultation has been scheduled for ' || to_char(NEW.scheduled_at, 'YYYY-MM-DD HH24:MI') || '.',
    jsonb_build_object('consultation_id', NEW.id, 'scheduled_at', NEW.scheduled_at)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for consultations table
CREATE TRIGGER create_consultation_notification_trigger
AFTER INSERT ON consultations
FOR EACH ROW
EXECUTE FUNCTION create_consultation_notification();

-- Insert initial consulting services
INSERT INTO consulting_services (name, description, price, currency, duration)
VALUES
  ('IP Valuation', 'Expert valuation of your intellectual property assets.', 500, 'MATIC', 60),
  ('Patent Strategy', 'Strategic planning for patent applications and portfolio management.', 750, 'MATIC', 90),
  ('Licensing Consultation', 'Guidance on licensing your intellectual property.', 600, 'MATIC', 60),
  ('Market Analysis', 'Analysis of market potential for your intellectual property.', 800, 'MATIC', 120),
  ('Legal Consultation', 'Legal advice on intellectual property protection and enforcement.', 900, 'MATIC', 120);

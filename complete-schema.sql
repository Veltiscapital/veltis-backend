-- Create nonces table for wallet authentication
CREATE TABLE IF NOT EXISTS nonces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE,
  nonce TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla para IP Assets
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

-- Tabla para servicios de consultoría
CREATE TABLE IF NOT EXISTS consulting_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para reservas
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  service_id UUID REFERENCES consulting_services(id),
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 
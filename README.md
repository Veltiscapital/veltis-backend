# VELTIS Backend

Backend for VELTIS, a platform for tokenizing intellectual property (IP) in biotechnology.

## Overview

This backend provides a complete API for the VELTIS platform, including:

- Authentication with wallet signatures
- IP-NFT minting and management
- Marketplace for buying and selling IP-NFTs
- Analytics for IP valuation and market trends
- Consulting services booking
- KYC verification
- Legal documentation

## Technologies

- **Next.js**: API routes for serverless functions
- **Supabase**: PostgreSQL database with real-time capabilities
- **Alchemy SDK**: Blockchain interaction and smart account management
- **NFT.Storage**: IPFS storage for IP documents and metadata
- **Account Kit**: Authentication and smart accounts
- **Ethers.js**: Ethereum library for blockchain interactions
- **Socket.io**: Real-time notifications

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Alchemy API key
- NFT.Storage API key
- WalletConnect Project ID (optional)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/veltis-backend.git
cd veltis-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file with the following variables:

```
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT
JWT_SECRET=your-jwt-secret

# Alchemy
ALCHEMY_API_KEY=your-alchemy-api-key
ALCHEMY_NETWORK=polygon-mainnet

# NFT.Storage
NFT_STORAGE_API_KEY=your-nft-storage-api-key

# WalletConnect
WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Smart Contracts
IPNFT_CONTRACT_ADDRESS=your-ipnft-contract-address

# Next.js
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

4. Initialize the database:

```bash
npm run init-db
```

5. Run the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`.

## API Endpoints

### Authentication

- `POST /api/auth/nonce`: Generate a nonce for wallet signature
- `POST /api/auth/verify`: Verify a wallet signature and generate a JWT token
- `GET /api/auth/user`: Get the authenticated user's data
- `POST /api/auth/logout`: Logout the authenticated user

### IP-NFTs

- `GET /api/ipnft`: List IP-NFTs
- `GET /api/ipnft/:id`: Get an IP-NFT by ID
- `POST /api/ipnft/mint`: Mint a new IP-NFT
- `GET /api/ipnft/:id/valuation`: Get the valuation of an IP-NFT

### Marketplace

- `GET /api/market/listings`: List marketplace listings
- `POST /api/market/listings`: Create a new marketplace listing
- `GET /api/market/offers`: List marketplace offers
- `POST /api/market/offers`: Create a new marketplace offer
- `POST /api/market/accept`: Accept a marketplace offer

### Analytics

- `GET /api/analytics/market`: Get market analytics
- `GET /api/analytics/portfolio`: Get portfolio analytics

### Consulting

- `GET /api/consulting/services`: List consulting services
- `POST /api/consulting/booking`: Book a consultation
- `GET /api/consulting/bookings`: List consulting bookings

### KYC

- `GET /api/kyc/status`: Get KYC status
- `POST /api/kyc/submit`: Submit KYC documents

### Legal

- `GET /api/legal/terms`: Get terms and conditions
- `POST /api/legal/terms`: Accept terms and conditions
- `GET /api/legal/privacy`: Get privacy policy

## Smart Contracts

The backend interacts with the following smart contracts:

- `IPNFTRegistry.sol`: ERC-721 contract for IP-NFTs with royalty support

## Deployment

The backend is designed to be deployed on Vercel:

```bash
vercel
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

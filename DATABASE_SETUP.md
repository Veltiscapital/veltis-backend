# Database Setup for Veltis IPNFT Platform

This document provides instructions for setting up the database for the Veltis IPNFT platform.

## Prerequisites

- Access to the Supabase project dashboard
- Supabase service role key

## Setup Instructions

### Option 1: Using the Supabase Dashboard (Recommended)

1. Log in to the [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to your project
3. Go to the SQL Editor
4. Create a new query
5. Copy the contents of the `init-database.sql` file
6. Paste the SQL into the query editor
7. Click "Run" to execute the query

### Option 2: Using the Command Line

If you have direct access to the PostgreSQL database, you can run:

```bash
psql -h <host> -U <username> -d <database> -f init-database.sql
```

## Verifying the Setup

After running the SQL script, you should have the following tables in your database:

- `nonces`: For wallet authentication
- `users`: User profiles and wallet addresses
- `ipnfts`: IP-NFT metadata and ownership information
- `listings`: Marketplace listings
- `offers`: Offers on marketplace listings
- `transactions`: Transaction history
- `fractionalized_tokens`: Fractionalized IP-NFT tokens
- `ip_assets`: Legacy IP assets (for backward compatibility)
- `consulting_services`: Consulting services offered
- `bookings`: Bookings for consulting services

## Test User

The initialization script creates a test user with the following details:

- Wallet Address: `0x692973E3260E0ABD3ffBd9b8F29aAb57E2A4C0Ee`
- Name: `Test User`
- Email: `test@veltis.com`
- Institution: `Veltis Research`
- Role: `researcher`
- KYC Status: `approved`

## Troubleshooting

If you encounter errors related to missing tables or relationships, ensure that:

1. The SQL script executed successfully
2. The database user has the necessary permissions
3. The `uuid-ossp` extension is enabled

For any issues with the database setup, please check the Supabase logs or contact the development team. 
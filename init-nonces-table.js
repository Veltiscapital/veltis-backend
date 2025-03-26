const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://kuoqnpovxpoozjtyfcyk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1b3FucG92eHBvb3pqdHlmY3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDg4NTI3NSwiZXhwIjoyMDU2NDYxMjc1fQ.Wl2pR1GUr17i26XYi6tpfIXYJ8lOwGpruv9nnFnyOcw';

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// SQL query to create the nonces table
const createNoncesTableQuery = `
CREATE TABLE IF NOT EXISTS nonces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE,
  nonce TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
`;

console.log("==== Database Initialization SQL ====");
console.log(createNoncesTableQuery);
console.log("====================================");
console.log("\nPlease execute this SQL in the Supabase dashboard SQL editor.");
console.log("1. Go to https://supabase.com/dashboard");
console.log("2. Navigate to your project");
console.log("3. Select 'SQL Editor' from the sidebar");
console.log("4. Create a new query and paste the SQL above");
console.log("5. Click 'Run' to execute the query");

// Create a test nonce to verify we can connect to Supabase
async function testSupabaseConnection() {
  try {
    console.log('\nTesting Supabase connection...');
    
    // Check if we can list tables
    const { data, error } = await supabaseAdmin
      .from('nonces')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('The nonces table does not exist yet. Please create it using the SQL above.');
      } else {
        console.error('Error testing Supabase connection:', error);
      }
      return;
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Nonces table exists and contains', data.length, 'records.');
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
  }
}

// Run the test function
testSupabaseConnection(); 
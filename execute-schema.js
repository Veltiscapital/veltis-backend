const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase client from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://kuoqnpovxpoozjtyfcyk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1b3FucG92eHBvb3pqdHlmY3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDg4NTI3NSwiZXhwIjoyMDU2NDYxMjc1fQ.Wl2pR1GUr17i26XYi6tpfIXYJ8lOwGpruv9nnFnyOcw';

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Read SQL file
const sql = fs.readFileSync('./complete-schema.sql', 'utf8');

console.log('==== Database Schema SQL ====');
console.log(sql);
console.log('============================');

console.log('\nPlease execute this SQL in the Supabase dashboard SQL editor.');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Navigate to your project');
console.log('3. Select "SQL Editor" from the sidebar');
console.log('4. Create a new query and paste the SQL above');
console.log('5. Click "Run" to execute the query');

// Test tables
async function testTables() {
  try {
    console.log('\nTesting tables...');
    
    // Test each table
    const tables = ['nonces', 'ip_assets', 'consulting_services', 'bookings'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`Error testing ${table} table:`, error);
        } else {
          console.log(`Table ${table} exists and contains ${data.length} records.`);
        }
      } catch (err) {
        console.error(`Error testing ${table} table:`, err);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test function
testTables(); 
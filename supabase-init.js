const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables.');
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Using service role key for API access');

async function initializeDatabase() {
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('./db-init-all.sql', 'utf8');
    console.log('SQL file read successfully.');
    
    // Make a direct request to the Supabase SQL endpoint
    const sqlEndpoint = `${supabaseUrl}/rest/v1/`;
    console.log('Executing SQL at:', sqlEndpoint);
    
    // Execute the SQL as a whole
    try {
      const response = await fetch(sqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          query: sqlContent
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error executing SQL:', errorData);
        console.log('Will try executing statements individually...');
      } else {
        console.log('SQL executed successfully as a whole.');
      }
    } catch (error) {
      console.error('Error executing SQL as a whole:', error.message);
      console.log('Will try executing statements individually...');
    }
    
    // If we get here, we're either successful or we need to try individual statements
    // Let's verify the tables either way
    console.log('Verifying tables...');
    try {
      // Use direct REST request to list tables
      const listTablesResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (listTablesResponse.ok) {
        const tables = await listTablesResponse.json();
        console.log('Tables in the database:');
        Object.keys(tables).forEach(tableName => {
          console.log(`- ${tableName}`);
        });
      } else {
        console.error('Could not list tables via REST API.');
      }
    } catch (error) {
      console.error('Error verifying tables:', error.message);
    }
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase(); 
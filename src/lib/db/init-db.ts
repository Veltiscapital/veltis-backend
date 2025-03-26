import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

/**
 * Initialize the database
 */
async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'src/lib/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabaseAdmin.rpc('pgexec', { query: statement });
      if (error) {
        console.error('Error executing statement:', error);
        console.error('Statement:', statement);
      }
    }

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

/**
 * Check if the database is initialized
 * @returns Whether the database is initialized
 */
async function isDatabaseInitialized(): Promise<boolean> {
  try {
    // Check if the users table exists
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error checking if database is initialized:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking if database is initialized:', error);
    return false;
  }
}

/**
 * Initialize the database if it's not already initialized
 */
export async function ensureDatabaseInitialized() {
  try {
    const isInitialized = await isDatabaseInitialized();
    if (!isInitialized) {
      await initializeDatabase();
    } else {
      console.log('Database is already initialized.');
    }
  } catch (error) {
    console.error('Error ensuring database is initialized:', error);
  }
}

// If this file is run directly, initialize the database
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

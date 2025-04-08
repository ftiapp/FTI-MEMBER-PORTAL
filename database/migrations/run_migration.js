const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  console.log('Starting migration...');
  
  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'verification_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('SQL file read successfully');
    console.log('Connecting to database...');
    
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: false,
      multipleStatements: true // Allow multiple SQL statements
    });
    
    console.log('Connected to database');
    console.log('Running migration...');
    
    // Execute SQL
    const [results] = await connection.query(sql);
    
    console.log('Migration completed successfully');
    console.log('Results:', results);
    
    await connection.end();
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();

// db.js - Handles MySQL database connection

const mysql = require('mysql2/promise');

// --- IMPORTANT ---
// Replace with your actual database credentials if different
const dbConfig = {
  host: 'localhost', // Or your MySQL host IP if not local
  user: 'root',      // Your MySQL username
  password: 'root',  // Your MySQL password
  database: 'smart_exam_cell', // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test the connection (optional, but good for diagnostics)
pool.getConnection()
  .then(connection => {
    console.log('MySQL Connected...');
    connection.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('Error connecting to MySQL:', err.message);
    // Exit process if database connection fails on startup
    process.exit(1); 
  });

module.exports = pool; // Export the pool for use in other files

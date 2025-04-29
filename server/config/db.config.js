// config/db.config.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'digital_closet',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

// Initialize database tables
const initDb = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL
      )
    `);
    
    // Insert default categories if they don't exist
    const [categories] = await connection.query('SELECT * FROM categories');
    if (categories.length === 0) {
      await connection.query(`
        INSERT INTO categories (name) VALUES 
        ('tops'), ('bottoms'), ('accessories'), ('shoes')
      `);
    }
    
    // Create clothing_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clothing_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        description VARCHAR(255),
        icon VARCHAR(100) NOT NULL,
        color VARCHAR(50) NOT NULL,
        is_clean BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);
    
    // Create outfits table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS outfits (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create outfit_items junction table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS outfit_items (
        outfit_id INT NOT NULL,
        clothing_item_id INT NOT NULL,
        PRIMARY KEY (outfit_id, clothing_item_id),
        FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE,
        FOREIGN KEY (clothing_item_id) REFERENCES clothing_items(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database initialized successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

// Initialize database on startup
(async () => {
  await testConnection();
  await initDb();
})();

module.exports = {
  pool,
  query: (sql, params) => pool.query(sql, params),
  getConnection: () => pool.getConnection(),
  testConnection,
  initDb
};
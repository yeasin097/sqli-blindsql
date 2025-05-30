const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'mysql',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'C@lculator1020',
  database: process.env.MYSQL_DATABASE || 'sqli_lab',
  port: process.env.MYSQL_PORT || 3306
};

// Initialize the database and tables
async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password
  });

  // Create database if it doesn't exist
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
  await connection.end();

  // Connect to the database
  const db = await mysql.createConnection(dbConfig);

  // Create tables and insert data
  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255)
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(255),
      email VARCHAR(255),
      password VARCHAR(255)
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      admin_username VARCHAR(255),
      admin_password VARCHAR(255),
      role VARCHAR(255)
    )
  `);

  // Insert products
  await db.query("INSERT IGNORE INTO products (id, name) VALUES (1, 'Gaming Laptop')");
  await db.query("INSERT IGNORE INTO products (id, name) VALUES (2, 'Business Laptop')");
  await db.query("INSERT IGNORE INTO products (id, name) VALUES (3, 'Smartphone Pro')");
  await db.query("INSERT IGNORE INTO products (id, name) VALUES (4, 'Smartphone Basic')");
  await db.query("INSERT IGNORE INTO products (id, name) VALUES (5, 'Wireless Headphones')");
  await db.query("INSERT IGNORE INTO products (id, name) VALUES (6, 'Bluetooth Speaker')");

  // Insert users
  await db.query("INSERT IGNORE INTO users (id, username, email, password) VALUES (1, 'john_doe', 'john@email.com', 'password123')");
  await db.query("INSERT IGNORE INTO users (id, username, email, password) VALUES (2, 'jane_smith', 'jane@email.com', 'mypassword')");
  await db.query("INSERT IGNORE INTO users (id, username, email, password) VALUES (3, 'mike_wilson', 'mike@email.com', 'secret123')");
  await db.query("INSERT IGNORE INTO users (id, username, email, password) VALUES (4, 'sarah_davis', 'sarah@email.com', 'pass456')");

  // Insert admin users
  await db.query("INSERT IGNORE INTO admin_users (id, admin_username, admin_password, role) VALUES (1, 'admin', 'admin123', 'Super Admin')");
  await db.query("INSERT IGNORE INTO admin_users (id, admin_username, admin_password, role) VALUES (2, 'manager', 'manager456', 'Store Manager')");

  return db;
}

// API endpoint for products with blind SQL injection vulnerability
app.get('/api/products', async (req, res) => {
  const search = req.query.search || '';
  let query;

  if (search === '') {
    query = `SELECT id, name FROM products`;
  } else {
    // Vulnerable to blind SQL injection
    query = `SELECT id, name FROM products WHERE name LIKE '%${search}%'`;
  }

  console.log("Executing SQL:", query);

  try {
    const db = await mysql.createConnection(dbConfig);
    const [rows] = await db.query(query);
    await db.end();
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.json({ data: [] }); // Return empty array for blind injection
  }
});

// API endpoint for product details (secure)
app.get('/api/products/:id', async (req, res) => {
  const productId = req.params.id;
  const query = `SELECT * FROM products WHERE id = ?`;

  try {
    const db = await mysql.createConnection(dbConfig);
    const [rows] = await db.query(query, [productId]);
    await db.end();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/', (req, res) => {
  console.log("Frontend HIT");
  return res.status(200).json({ message: 'Blind SQL Injection Lab API' });
});

// Start server
const PORT = 3000;
async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
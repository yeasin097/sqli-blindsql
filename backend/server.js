const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Pool configuration
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'blind_sqli_lab',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to MySQL database!');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to MySQL database:', err.stack);
    });

// --- Vulnerable Endpoint for Blind SQL Injection ---
app.get('/api/products', async (req, res) => {
    const search = req.query.search || '';
    let query;

    if (search === '') {
        query = `SELECT id, name FROM products ORDER BY id`;
    } else {
        // VULNERABLE: Direct string concatenation allows blind SQL injection
        query = `SELECT id, name FROM products WHERE name LIKE '%${search}%'`;
    }

    try {
        const startTime = process.hrtime.bigint();
        const [rows] = await pool.query(query);
        const endTime = process.hrtime.bigint();
        const responseTimeMs = Number(endTime - startTime) / 1_000_000;

        // Always return consistent response structure for blind injection
        res.json({
            success: true,
            data: rows,
            total: rows.length
        });

    } catch (err) {
        console.error("Database query error:", err.message);
        
        // Return consistent response even on error (important for blind injection)
        res.json({
            success: true,
            data: [],
            total: 0
        });
    }
});

// --- Non-vulnerable Product Detail Endpoint ---
app.get('/api/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    
    // Parameterized query - NOT vulnerable
    const query = 'SELECT * FROM products WHERE id = ?';
    
    try {
        const [rows] = await pool.query(query, [productId]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
        
    } catch (err) {
        console.error("Error fetching product details:", err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// --- Health Check Endpoint ---
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Try: http://localhost:${PORT}/api/products?search=laptop`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    pool.end(() => {
        console.log('MySQL pool has ended');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    pool.end(() => {
        console.log('MySQL pool has ended');
        process.exit(0);
    });
});
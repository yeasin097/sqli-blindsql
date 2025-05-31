const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Pool configuration
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client for DB connection test', err.stack);
    }
    console.log('Successfully connected to PostgreSQL database!');
    release();
});

// --- Vulnerable Endpoint for Blind SQL Injection ---
app.get('/api/products', async (req, res) => {
    const search = req.query.search || '';
    let query;

    if (search === '') {
        query = `SELECT id, name FROM products ORDER BY id`;
    } else {
        // VULNERABLE: Direct string concatenation allows blind SQL injection
        query = `SELECT id, name FROM products WHERE name ILIKE '%${search}%'`;
    }

    try {
        const startTime = process.hrtime.bigint();
        const result = await pool.query(query);
        const endTime = process.hrtime.bigint();
        const responseTimeMs = Number(endTime - startTime) / 1_000_000;

        // Always return consistent response structure for blind injection
        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length
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
    const query = 'SELECT * FROM products WHERE id = $1';
    
    try {
        const result = await pool.query(query, [productId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
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
        console.log('PostgreSQL pool has ended');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    pool.end(() => {
        console.log('PostgreSQL pool has ended');
        process.exit(0);
    });
});
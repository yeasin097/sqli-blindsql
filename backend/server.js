const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'blind_sqli_lab',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000
});

pool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection error:', err.message);
    });

app.get('/api/products', async (req, res) => {
    const search = req.query.search || '';

    const query = search
        ? `SELECT id, name FROM products WHERE name LIKE '%${search}%'`
        : `SELECT id, name FROM products ORDER BY id`;

    try {
        const [rows] = await pool.query(query);
        res.json({
            success: true,
            data: rows,
            total: rows.length
        });
    } catch (err) {
        res.json({
            success: true,
            data: [],
            total: 0
        });
    }
});

app.get('/api/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
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
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
    pool.end(() => process.exit(0));
});

process.on('SIGINT', () => {
    pool.end(() => process.exit(0));
});
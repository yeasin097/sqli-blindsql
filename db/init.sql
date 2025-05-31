-- Create products table with detailed information
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table (target for exploitation)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_users table (high-value target)
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    admin_username VARCHAR(255) UNIQUE NOT NULL,
    admin_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    access_level INTEGER DEFAULT 1,
    secret_key VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products with realistic details
INSERT INTO products (name, description, price, category, stock_quantity) VALUES
('Gaming Laptop Pro', 'High-performance gaming laptop with RTX 4080, 32GB RAM, and 1TB SSD', 2499.99, 'Laptops', 15),
('Business Laptop Elite', 'Professional laptop for business use with Intel i7, 16GB RAM, and 512GB SSD', 1299.99, 'Laptops', 25),
('UltraBook Air', 'Lightweight ultrabook perfect for travel and productivity', 899.99, 'Laptops', 30),
('Smartphone Pro Max', 'Latest flagship smartphone with advanced camera and 5G connectivity', 1199.99, 'Smartphones', 50),
('Smartphone Basic', 'Affordable smartphone with essential features and long battery life', 299.99, 'Smartphones', 75),
('Wireless Headphones Premium', 'Noise-cancelling wireless headphones with premium sound quality', 349.99, 'Audio', 40),
('Bluetooth Speaker Portable', 'Compact portable speaker with powerful bass and waterproof design', 89.99, 'Audio', 60),
('Gaming Mouse RGB', 'High-precision gaming mouse with customizable RGB lighting', 79.99, 'Accessories', 85),
('Mechanical Keyboard', 'Cherry MX mechanical keyboard for gaming and productivity', 159.99, 'Accessories', 35),
('4K Monitor Ultra', '32-inch 4K monitor with HDR support and USB-C connectivity', 699.99, 'Monitors', 20)
ON CONFLICT (id) DO NOTHING;

-- Insert sample users (target for blind SQL injection)
INSERT INTO users (username, email, password, full_name, phone) VALUES
('john_doe', 'john.doe@email.com', 'mypassword123', 'John Doe', '+1-555-0101'),
('jane_smith', 'jane.smith@email.com', 'securepass456', 'Jane Smith', '+1-555-0102'),
('mike_wilson', 'mike.wilson@email.com', 'password789', 'Mike Wilson', '+1-555-0103'),
('sarah_johnson', 'sarah.j@email.com', 'sarahpass321', 'Sarah Johnson', '+1-555-0104'),
('david_brown', 'david.brown@email.com', 'davidpwd999', 'David Brown', '+1-555-0105'),
('lisa_garcia', 'lisa.garcia@email.com', 'lisasecret777', 'Lisa Garcia', '+1-555-0106')
ON CONFLICT (username) DO NOTHING;

-- Insert admin users (high-value targets)
INSERT INTO admin_users (admin_username, admin_password, role, access_level, secret_key) VALUES
('admin', 'admin123!@#', 'superadmin', 5, 'SUPER_SECRET_KEY_2024'),
('manager', 'manager456$%^', 'manager', 3, 'MGR_ACCESS_TOKEN_789'),
('support', 'support789&*(', 'support', 2, 'SUPPORT_KEY_456')
ON CONFLICT (admin_username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
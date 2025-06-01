-- Create database if not exists
CREATE DATABASE IF NOT EXISTS blind_sqli_lab;
USE blind_sqli_lab;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20)
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_username VARCHAR(255) UNIQUE NOT NULL,
    admin_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    access_level INT DEFAULT 1,
    secret_key VARCHAR(255)
);

-- Insert sample data into products
INSERT INTO products (name) VALUES
    ('Laptop Pro X1'),
    ('Smartphone Ultra'),
    ('Wireless Headphones'),
    ('Smart Watch Series 5'),
    ('Gaming Console X'),
    ('4K Monitor'),
    ('Wireless Mouse'),
    ('Mechanical Keyboard'),
    ('External SSD 1TB'),
    ('Webcam HD');

-- Insert sample users
INSERT INTO users (username, email, password, full_name, phone) VALUES
    ('john_doe', 'john@example.com', 'hashed_password_1', 'John Doe', '123-456-7890'),
    ('jane_smith', 'jane@example.com', 'hashed_password_2', 'Jane Smith', '098-765-4321'),
    ('admin_user', 'admin@example.com', 'hashed_password_3', 'Admin User', '555-555-5555');

-- Insert sample admin users
INSERT INTO admin_users (admin_username, admin_password, role, access_level, secret_key) VALUES
    ('superadmin', 'hashed_admin_pass_1', 'super_admin', 3, 'secret_key_1'),
    ('sysadmin', 'hashed_admin_pass_2', 'system_admin', 2, 'secret_key_2');
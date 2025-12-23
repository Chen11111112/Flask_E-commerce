-- 1. 建立資料庫
CREATE DATABASE IF NOT EXISTS shop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shop_db;

-- 2. 建立商品表
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL
);

-- 3. 建立訂單表 (存儲結帳資訊)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 插入初始資料 (對應你目前的 PRODUCTS 列表)
INSERT INTO products (title, price, category) VALUES 
('經典咖啡豆', 12.99, '飲品'),
('美味甜甜圈', 4.50, '點心'),
('高級茶葉禮盒', 25.00, '飲品'),
('特製三明治', 7.80, '餐點'),
('手工餅乾', 3.00, '點心');

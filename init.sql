-- ------------------------------------------------------
-- 1. 環境設定
-- ------------------------------------------------------
/*!40101 SET NAMES utf8mb4 */;
SET FOREIGN_KEY_CHECKS=0;

-- ------------------------------------------------------
-- 2. products
-- ------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock` int UNSIGNED DEFAULT '10', -- UNSIGNED 關鍵字：庫存減到 0 以下時會直接報錯
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `products` VALUES 
(1,'經典咖啡豆',12.99,'飲品',20),
(2,'美味甜甜圈',4.50,'點心',15),
(3,'高級茶葉禮盒',25.00,'飲品',10),
(4,'特製三明治',7.80,'餐點',10),
(5,'手工餅乾',3.00,'點心',20);

-- ------------------------------------------------------
-- 3. orders
-- ------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- 4. Trigger
-- ------------------------------------------------------
DROP TRIGGER IF EXISTS trg_order_check_and_deduct;

DELIMITER //

CREATE TRIGGER trg_order_check_and_deduct
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE v_stock INT;
    
    -- 1. 鎖定並檢查庫存量 (FOR UPDATE 防止多人同時搶購出錯)
    SELECT stock INTO v_stock 
    FROM products 
    WHERE id = NEW.product_id 
    FOR UPDATE;
    
    -- 2. 判斷是否足夠
    IF v_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '庫存不足，無法建立訂單！';
    END IF;
    
    -- 3. 直接在寫入訂單前扣除庫存
    -- 如果這步失敗(例如因為 UNSIGNED 限制)，整個訂單寫入會自動中斷
    UPDATE products 
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
END //

DELIMITER ;

SET FOREIGN_KEY_CHECKS=1;
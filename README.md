# Flask 電子商務系統

本專案為一個 Flask + MySQL + Flask-Mail 的練習型後端系統，由 **陳泓毓** 於 1/7/2026 完成，
提供商品查詢、訂單建立、寄送訂單確認信等功能。

> **Copyright** ©Hy.C  CC BY-NC-SA 4.0 | 禁止商業用途 | 轉載標記出處 | 改編作品必須在相同條款下分享。

## 一、系統需求（Prerequisites）

環境條件：
* Python 3.9 以上

* MySQL 5.7 / 8.0

## 二、專案結構說明
project-root/
│
├─ app.py                # Flask 主程式（系統入口）
├─ requirements.txt      # Python 套件清單
├─ .env.example          # 環境變數範例（需自行複製）
├─ templates/            # 前端畫面
├─ static/
│   └─ script.js         # 前端 JS
└─ venv/                 # Python 虛擬環境（自行建立）

## 三、第一次下載後
* 記得JS的 BASE_URL 要改 127.0.0.1:5000
### 建立虛擬環境（只需一次）
> python -m venv venv
> .\venv\Scripts\Activate.ps1


啟動成功後，終端機前方會看到：

(venv)

### 安裝必要套件
pip install -r requirements.txt

### 設定環境變數（最重要）
(1) 複製 `.env.example`
copy .env.example .env

(2) 編輯 .env，改成你自己的設定

### 注意事項
詳細說明可以參考課程講義
https://eminent-glider-8c3.notion.site/Flask-Django-MySQL-2b39def5443d80b9acfad70961d88589?pvs=74

請勿使用真實密碼直接寫入程式碼

# MySQL 必要設定
## 建立資料庫
CREATE DATABASE shop_db;


## 必要資料表
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
------------------------------------------------
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


# 如何啟動系統（本機）
方式一：直接執行（最簡單）
python app.py


成功後你會看到：

Running on http://127.0.0.1:5000

## API 路由說明
取得商品列表
GET /practice/api/products

刪除購物車項目（模擬）
DELETE /practice/api/products/{id}

結帳並寄送確認信
POST /practice/api/products/checkout
import os
import time
import mysql.connector
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from flask_mail import Mail, Message
from mysql.connector import Error
from dotenv import load_dotenv  # 新增：載入 dotenv 套件

# 1. 載入 .env 檔案中的變數
load_dotenv()

app = Flask(__name__)
CORS(app)

# 2. Flask-Mail 設定 (改由環境變數讀取)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)

# 3. 資料庫配置 (優先讀取環境變數，若無則使用預設值)
db_config = {
    'host': os.getenv('DB_HOST', '192.168.1.200'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '11256040'),
    'database': os.getenv('DB_NAME', 'shop_db')
}

def get_db_connection():
    """ 建立資料庫連線 """
    connection = mysql.connector.connect(**db_config)
    return connection

# --- Flask 路由定義 ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/practice/api/products', methods=['GET'])
def get_products():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM products")
        products_from_db = cursor.fetchall()
        return jsonify(products_from_db)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/practice/api/products/<int:item_id>', methods=['DELETE'])
def delete_cart_item(item_id):
    print(f"模擬刪除 ID: {item_id}")
    return jsonify({"message": f"Item {item_id} deleted successfully"}), 200

@app.route('/practice/api/products/checkout', methods=['POST'])
def checkout():
    target_email = request.form.get('user_email')
    print("使用者信箱: ", target_email)
    
    order_no = f"ORD-{int(time.time())}"
    data = request.form
    
    order_details = []
    total_items = int(data.get('total_items', 0))
    email_items_text = ""
    totPrice = 0

    for i in range(total_items):
        title = data.get(f'title_{i}')
        qty = data.get(f'quantity_{i}')
        price = data.get(f'price_{i}')
        totPrice += float(price or 0)
        item = {
            "productId": data.get(f'productId_{i}'),
            "quantity": qty,
            "title": title,
            "price": price,
        }
        order_details.append(item)
        email_items_text += f"- {title} x {qty} 份 (${price})\n"

    print(f"----- 收到結帳訂單: {order_no} -----")

    msg = Message(
        subject=f"【訂單確認】感謝您的訂購！訂單編號：{order_no}",
        recipients=[target_email],
        body=f"您好！感謝您訂購我們的商品！\n\n您的訂單明細如下：\n{email_items_text}\n祝您購物愉快!!\n共 {totPrice} $"
    )

    try:
        # 執行寄信
        mail.send(msg)
        print(f"郵件已成功寄至: {target_email}")

        # 寫入資料庫
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = "INSERT INTO orders (order_no, user_email, total_price) VALUES (%s, %s, %s)"
        cursor.execute(sql, (order_no, target_email, totPrice))
        conn.commit()
        
        return jsonify({
            "success": True,
            "message": "結帳成功，訂單確認信已寄出！",
            "orderNo": order_no,
            "details": order_details
        }), 200

    except Exception as e:
        print(f"操作失敗，錯誤訊息：{str(e)}")
        return jsonify({
            "success": False, 
            "message": f"操作失敗：{str(e)}",
            "orderNo": order_no
        }), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == '__main__':
    # 這裡的 debug 建議在生產環境改為 False
    app.run(debug=True, host='0.0.0.0', port=5000)
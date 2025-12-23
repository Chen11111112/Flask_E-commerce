from flask import Flask, jsonify, request, render_template
from flask_cors import CORS # 處理跨域問題 (CORS)
from mysql.connector import Error
import time
from flask_mail import Mail, Message
import mysql.connector

app = Flask(__name__)
# 允許跨域請求，用於開發階段
CORS(app) 
# Flask-Mail 設定
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = '628347jpjp@gmail.com'
app.config['MAIL_PASSWORD'] = 'rqvq xkbl rfnb tcgx'
app.config['MAIL_DEFAULT_SENDER'] = '628347jpjp@gmail.com'

# 資料庫配置
db_config = {
    'host': '127.0.0.1',
    'user': 'root',         # 你的 MySQL 帳號
    'password': '11256040', # 你的 MySQL 密碼
    'database': 'shop_db'
}

def get_db_connection():
    """ 建立資料庫連線 """
    connection = mysql.connector.connect(**db_config)
    return connection


# --- Flask 路由定義 ---

# 首頁路由 (渲染 HTML 模板)
@app.route('/')
def index():
    return render_template('index.html')

# 1. 獲取所有商品資料 (GET /api/products)
@app.route('/practice/api/products', methods=['GET'])
def get_products():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True) # 回傳字典格式，方便轉 JSON
        cursor.execute("SELECT * FROM products")
        products_from_db = cursor.fetchall()
        return jsonify(products_from_db)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

# 2. 刪除購物車項目 (DELETE /api/products/<item_id>)
@app.route('/practice/api/products/<int:item_id>', methods=['DELETE'])
def delete_cart_item(item_id):
    """模擬 ProductAPI.deleteCartItem()"""
    # 由於購物車狀態在前台，這裡只模擬成功回應
    # 根據您的 React 程式碼，這裡的 ID 其實是 CartItem 的 ID，我們僅模擬成功
    print(f"模擬刪除 ID: {item_id}")
    return jsonify({"message": f"Item {item_id} deleted successfully"}), 200

mail = Mail(app)

@app.route('/practice/api/products/checkout', methods=['POST'])
def checkout():
    target_email = request.form.get('user_email')

    print("使用者信箱: ",target_email)
    order_no = f"ORD-{int(time.time())}"
    data = request.form
    
    # 訂單明細
    order_details = []
    total_items = int(data.get('total_items', 0))
    email_items_text = ""
    totPrice = 0

    for i in range(total_items):
        title = data.get(f'title_{i}')
        qty = data.get(f'quantity_{i}')
        price = data.get(f'price_{i}')
        totPrice += float(price)
        item = {
            "productId": data.get(f'productId_{i}'),
            "quantity": qty,
            "title": title,
            "price": price,
        }
        order_details.append(item)
        email_items_text += f"- {title} x {qty} 份 (${price})\n"
        

    print(f"----- 收到結帳訂單: {order_no} -----")

    # 建立郵件內容
    msg = Message(
        subject=f"【訂單確認】感謝您的訂購！訂單編號：{order_no}",
        recipients=[target_email],
        body=f"您好！感謝您訂購我們的商品！\n\n您的訂單明細如下：\n{email_items_text}\n祝您購物愉快!!\n共{totPrice}$"
    )

    # 回傳給前端結果
    try:
        mail.send(msg)
        print(f"郵件已成功寄至: {target_email}")

        conn = get_db_connection()
        cursor = conn.cursor()
        sql = "INSERT INTO orders (order_no, user_email, total_price) VALUES (%s, %s, %s)"
        cursor.execute(sql, (order_no, target_email, totPrice))
        conn.commit()
        
        # 統一回傳 JSON
        return jsonify({
            "success": True,
            "message": "結帳成功，訂單確認信已寄出！",
            "orderNo": order_no,
            "details": order_details
        }), 200

    # 錯誤處理
    except Exception as e:
        print(f"寄信失敗，錯誤訊息：{str(e)}")
        return jsonify({
            "success": False, 
            "message": f"結帳成功但信件發送失敗：{str(e)}",
            "orderNo": order_no
        }), 500
    
    
if __name__ == '__main__':
    app.run(debug=True)
